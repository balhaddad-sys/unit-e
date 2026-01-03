/* ═══════════════════════════════════════════════════════════════════════════
   OCR ENGINE v3.1 - Google Vision API Integration (Fixed for GAS CORS)
   Standalone module for lab image text extraction
   ═══════════════════════════════════════════════════════════════════════════ */

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        // Ensure this URL is the latest Web App deployment ending in /exec
        VISION_API_URL: 'https://script.google.com/macros/s/AKfycbwIMPGxFT1F00rKjOEsMrfxjYn6g5hbIRYGi11QdFxVloAIjjARf0UDc4z1hFgudHYk/exec',
        MAX_IMAGE_WIDTH: 1600,
        JPEG_QUALITY: 0.92
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
                    
                    // Convert to base64 string (remove data:image/jpeg;base64, prefix for API)
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
        
        // Remove header prefix if present
        const cleanBase64 = base64Image.replace(/^data:image\/(png|jpg|jpeg);base64,/, '');
        
        const payload = {
            image: cleanBase64,
            type: 'DOCUMENT_TEXT_DETECTION' // Optimized for dense text like lab reports
        };

        try {
            onStage?.('Contacting Neural Network...');
            
            // -----------------------------------------------------------
            // THE FIX: Use "text/plain" to avoid CORS Preflight failure
            // Google Apps Script cannot handle the OPTIONS request triggered by application/json
            // -----------------------------------------------------------
            const response = await fetch(CONFIG.VISION_API_URL, {
                method: 'POST',
                // standard fetch 'cors' mode expects the server to send Access-Control-Allow-Origin
                mode: 'cors', 
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8', 
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}`);
            }

            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }

            return data.text || '';

        } catch (err) {
            onLog?.('error', `API connection failed: ${err.message}`);
            // Often GAS redirects return opaque responses, check if we can retry or parse differently
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
            
            // If it's a File object, compress it first
            if (imageSource instanceof File) {
                onStage?.('Compressing image...');
                onProgress?.(5);
                dataUrl = await compressImage(imageSource);
            }
            
            // Run Vision API
            const result = await callVisionAPI(dataUrl, callbacks);
            
            onProgress?.(100);
            onStage?.('Complete');
            
            return result;
            
        } catch (err) {
            onLog?.('error', `OCR failed: ${err.message}`);
            throw err;
        }
    };

    // ═══════════════════════════════════════════════════════════════════════
    // EXPOSE GLOBAL API
    // ═══════════════════════════════════════════════════════════════════════
    window.OCREngine = {
        version: '3.1',
        runOCR,
        compressImage,
        callVisionAPI,
        config: CONFIG,
        isReady: true
    };

    console.log('[OCREngine v3.1] Ready - CORS Patch Applied');
})();
