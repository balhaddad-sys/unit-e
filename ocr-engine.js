/* ═══════════════════════════════════════════════════════════════════════════
   OCR ENGINE v3.2 - Connection Optimized
   Lowers payload size and improves error logging for GAS
   ═══════════════════════════════════════════════════════════════════════════ */

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        // Double check this URL matches your latest deployment!
        VISION_API_URL: 'https://script.google.com/macros/s/AKfycbwIMPGxFT1F00rKjOEsMrfxjYn6g5hbIRYGi11QdFxVloAIjjARf0UDc4z1hFgudHYk/exec',
        MAX_IMAGE_WIDTH: 1024, // Reduced from 1600 to ensure payload fits in GAS limits
        JPEG_QUALITY: 0.8      // Reduced from 0.92 for smaller base64 string
    };

    // ═══════════════════════════════════════════════════════════════════════
    // IMAGE COMPRESSION
    // ═══════════════════════════════════════════════════════════════════════
    const compressImage = (file, maxWidth = CONFIG.MAX_IMAGE_WIDTH) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width, height = img.height;
                    
                    if (width > maxWidth) { 
                        height = Math.round((height * maxWidth) / width); 
                        width = maxWidth; 
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // Convert to base64
                    const dataUrl = canvas.toDataURL('image/jpeg', CONFIG.JPEG_QUALITY);
                    resolve(dataUrl);
                };
                img.onerror = (err) => reject(new Error('Image load failed'));
                img.src = e.target.result;
            };
            reader.onerror = (err) => reject(new Error('File read failed'));
            reader.readAsDataURL(file);
        });
    };

    // ═══════════════════════════════════════════════════════════════════════
    // API COMMUNICATION
    // ═══════════════════════════════════════════════════════════════════════
    const callVisionAPI = async (base64Image, callbacks) => {
        const { onStage, onLog } = callbacks;
        
        // Remove header prefix for the API payload
        const cleanBase64 = base64Image.replace(/^data:image\/(png|jpg|jpeg);base64,/, '');
        
        const payload = {
            image: cleanBase64,
            type: 'DOCUMENT_TEXT_DETECTION'
        };

        try {
            onStage?.('Contacting Cloud...');
            
            // Log payload size for debugging
            console.log(`Payload size: ~${Math.round(JSON.stringify(payload).length / 1024)} KB`);

            const response = await fetch(CONFIG.VISION_API_URL, {
                method: 'POST',
                // redirect: 'follow' is default, but important for GAS
                redirect: 'follow', 
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8', 
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`Server Status: ${response.status} (${response.statusText})`);
            }

            // GAS sometimes returns HTML error pages instead of JSON on failure
            const textResponse = await response.text();
            
            let data;
            try {
                data = JSON.parse(textResponse);
            } catch (e) {
                console.error("Non-JSON response received:", textResponse);
                throw new Error("Server returned an HTML error page. Check Script Permissions.");
            }
            
            if (data.error) {
                throw new Error(data.error);
            }

            return data.text || '';

        } catch (err) {
            onLog?.('error', `Connection Failed: ${err.message}`);
            console.error(err);
            throw err;
        }
    };

    // ═══════════════════════════════════════════════════════════════════════
    // MAIN OCR FUNCTION
    // ═══════════════════════════════════════════════════════════════════════
    const runOCR = async (imageSource, callbacks = {}) => {
        const { onProgress, onStage, onLog } = callbacks;
        
        try {
            let dataUrl = imageSource;
            
            if (imageSource instanceof File) {
                onStage?.('Compressing...');
                onProgress?.(10);
                dataUrl = await compressImage(imageSource);
            }
            
            const result = await callVisionAPI(dataUrl, callbacks);
            
            onProgress?.(100);
            onStage?.('Complete');
            
            return result;
            
        } catch (err) {
            // Error is already logged in sub-functions
            throw err;
        }
    };

    // ═══════════════════════════════════════════════════════════════════════
    // EXPOSE GLOBAL API
    // ═══════════════════════════════════════════════════════════════════════
    window.OCREngine = {
        version: '3.2',
        runOCR,
        compressImage,
        config: CONFIG,
        isReady: true
    };

    console.log('[OCREngine v3.2] Ready - Optimized Mode');
})();
