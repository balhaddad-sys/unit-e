/* ═══════════════════════════════════════════════════════════════════════════
   OCR ENGINE v3.1 - Google Vision API Integration (FIXED)
   Standalone module for lab image text extraction
   ═══════════════════════════════════════════════════════════════════════════ */

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        VISION_API_URL: 'https://script.google.com/macros/s/AKfycbwIMPGxFT1F00rKjOEsMrfxjYn6g5hbIRYGi11QdFxVloAIjjARf0UDc4z1hFgudHYk/exec',
        MAX_IMAGE_WIDTH: 1600,
        // Reduced slightly to 0.80 to prevent payload size issues on mobile networks
        JPEG_QUALITY: 0.80 
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
                    
                    const ctx = canvas.getContext('2d', { alpha: false });
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, width, height);
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    resolve(canvas.toDataURL('image/jpeg', CONFIG.JPEG_QUALITY));
                };
                img.onerror = () => reject(new Error("Failed to load image"));
                img.src = e.target.result;
            };
            reader.onerror = () => reject(new Error("Failed to read file"));
            reader.readAsDataURL(file);
        });
    };

    // ═══════════════════════════════════════════════════════════════════════
    // GOOGLE VISION API CALL
    // ═══════════════════════════════════════════════════════════════════════
    const callVisionAPI = async (dataUrl, callbacks = {}) => {
        const { onProgress, onStage, onLog } = callbacks;
        
        onLog?.('info', 'Starting Google Vision OCR...');
        onStage?.('Preparing image...');
        onProgress?.(10);
        
        // Extract base64
        let imageData = dataUrl;
        if (imageData.includes(',')) {
            imageData = imageData.split(',')[1];
        }
        
        try {
            onStage?.('Sending to Google Vision...');
            onProgress?.(30);
            
            // MASTER SHIFU: The 'headers' object has been removed.
            // Sending a plain string body defaults to text/plain and treats this
            // as a "Simple Request", bypassing the CORS Preflight (OPTIONS) check
            // which Google Apps Script fails to handle.
            const response = await fetch(CONFIG.VISION_API_URL, {
                method: 'POST',
                body: JSON.stringify({ 
                    action: 'ocr', 
                    image: imageData, 
                    mode: 'DOCUMENT_TEXT_DETECTION' 
                }),
                redirect: 'follow'
            });
            
            onProgress?.(70);
            onStage?.('Processing response...');
            
            if (!response.ok) {
                throw new Error(`Vision API HTTP ${response.status}`);
            }
            
            const responseText = await response.text();
            
            let result;
            try { 
                result = JSON.parse(responseText); 
            } catch { 
                // Sometimes GAS returns HTML on error (like 404/500), log the raw text for debug
                console.error("Raw response:", responseText);
                throw new Error('Failed to parse Vision API response'); 
            }
            
            if (result.error) {
                throw new Error(result.error);
            }
            
            onProgress?.(95);
            onLog?.('success', `Vision API returned ${result.text?.length || 0} characters`);
            
            return { 
                text: result.text || "", 
                confidence: result.confidence || 85, 
                lines: result.lines || [], 
                source: 'google_vision' 
            };
            
        } catch (err) {
            onLog?.('error', `Vision API failed: ${err.message}`);
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

    console.log('[OCREngine v3.1] Google Vision OCR module loaded');
})();
