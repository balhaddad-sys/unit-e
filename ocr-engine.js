/* ═══════════════════════════════════════════════════════════════════════════
   OCR ENGINE v3.0 - Google Vision API Integration
   Standalone module for lab image text extraction
   ═══════════════════════════════════════════════════════════════════════════ */

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        VISION_API_URL: 'https://script.google.com/macros/s/AKfycbzpceeqLk50diawA_pxX24M4t-ZWwNmAVQFwZHz4LAJniFsqXJwYrFuxqZdUHDAKe4mng/exec',
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
            
            const response = await fetch(CONFIG.VISION_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({ 
                    action: 'ocr', 
                    image: imageData, 
                    mode: 'DOCUMENT_TEXT_DETECTION' 
                })
            });
            
            onProgress?.(70);
            onStage?.('Processing response...');
            
            const responseText = await response.text();
            onLog?.('info', `Response length: ${responseText.length}, starts with: ${responseText.substring(0, 100)}`);
            
            // Check if response is HTML (redirect page) instead of JSON
            if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
                throw new Error('Got HTML instead of JSON - Apps Script may need redeployment');
            }
            
            if (!response.ok) {
                throw new Error(`Vision API HTTP ${response.status}: ${responseText.substring(0, 200)}`);
            }
            
            let result;
            try { 
                result = JSON.parse(responseText); 
            } catch (parseErr) { 
                onLog?.('error', `Parse failed. Raw response: ${responseText.substring(0, 500)}`);
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
        version: '3.0',
        runOCR,
        compressImage,
        callVisionAPI,
        config: CONFIG,
        isReady: true
    };

    console.log('[OCREngine v3.0] Google Vision OCR module loaded');
})();
