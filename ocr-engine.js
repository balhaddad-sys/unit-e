/* ═══════════════════════════════════════════════════════════════════════════
   OCR ENGINE v3.3 - FINAL PRODUCTION
   URL Updated | CORS Fixed | Payload Optimized
   ═══════════════════════════════════════════════════════════════════════════ */

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        // YOUR NEW DEPLOYMENT URL
        VISION_API_URL: 'https://script.google.com/macros/s/AKfycby622nMAInUpvCG8EJYgn1yqJJc3CUJR2mYYfKgZvbbAraWtX4hLXMue6DGJOxxdTmA/exec',
        MAX_IMAGE_WIDTH: 1024, 
        JPEG_QUALITY: 0.8
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
                    
                    const dataUrl = canvas.toDataURL('image/jpeg', CONFIG.JPEG_QUALITY);
                    resolve(dataUrl);
                };
                img.onerror = () => reject(new Error('Image load failed'));
                img.src = e.target.result;
            };
            reader.onerror = () => reject(new Error('File read failed'));
            reader.readAsDataURL(file);
        });
    };

    // ═══════════════════════════════════════════════════════════════════════
    // API COMMUNICATION (CORS FIXED)
    // ═══════════════════════════════════════════════════════════════════════
    const callVisionAPI = async (base64Image, callbacks) => {
        const { onStage, onLog } = callbacks;
        
        // Strip header for API
        const cleanBase64 = base64Image.replace(/^data:image\/(png|jpg|jpeg);base64,/, '');
        
        const payload = {
            image: cleanBase64,
            type: 'DOCUMENT_TEXT_DETECTION'
        };

        try {
            onStage?.('Scanning...');

            // The Secret Technique: content-type text/plain bypasses the CORS preflight
            const response = await fetch(CONFIG.VISION_API_URL, {
                method: 'POST',
                redirect: 'follow', 
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8', 
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`Server Error: ${response.status}`);
            }

            const textResponse = await response.text();
            
            // Handle cases where GAS returns HTML error page instead of JSON
            if (textResponse.trim().startsWith('<')) {
                 throw new Error("Script Deployment Error: Ensure 'Who has access' is set to 'Anyone'");
            }

            const data = JSON.parse(textResponse);
            
            if (data.error) throw new Error(data.error);

            return data.text || '';

        } catch (err) {
            onLog?.('error', `OCR Error: ${err.message}`);
            throw err;
        }
    };

    // ═══════════════════════════════════════════════════════════════════════
    // MAIN RUNNER
    // ═══════════════════════════════════════════════════════════════════════
    const runOCR = async (imageSource, callbacks = {}) => {
        const { onProgress, onStage } = callbacks;
        
        try {
            let dataUrl = imageSource;
            if (imageSource instanceof File) {
                onStage?.('Compressing...');
                onProgress?.(20);
                dataUrl = await compressImage(imageSource);
            }
            
            const result = await callVisionAPI(dataUrl, callbacks);
            onProgress?.(100);
            return result;
        } catch (err) {
            throw err;
        }
    };

    window.OCREngine = {
        version: '3.3',
        runOCR,
        compressImage,
        isReady: true
    };

    console.log('[OCREngine v3.3] System Online');
})();
