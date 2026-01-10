/* ═══════════════════════════════════════════════════════════════════════════
   OCR ENGINE v6.0 - GPT-4o Vision Powered Lab Extraction
   With Neural Learning from successful extractions
   ═══════════════════════════════════════════════════════════════════════════ */

(function() {
    'use strict';

    // ═══════════════════════════════════════════════════════════════════════
    // CONFIGURATION
    // ═══════════════════════════════════════════════════════════════════════
    const CONFIG = {
        // Use the main API URL from CONFIG if available, otherwise fallback
        get API_URL() {
            return (typeof window.CONFIG !== 'undefined' && window.CONFIG.apiUrl) 
                ? window.CONFIG.apiUrl 
                : 'https://script.google.com/macros/s/AKfycbw8q0mvXxy_2tpN9CSkFxqvrS77iRHyLjsuLbTyYUJK0hk5jFSw3Ld5b4BuFUZ294Il/exec';
        },
        MAX_IMAGE_WIDTH: 1200,
        JPEG_QUALITY: 0.88,
        USE_GPT_VISION: true,          // Enable GPT-4o Vision
        USE_GOOGLE_FALLBACK: true,     // Fallback to Google Vision if GPT fails
        VISION_TIMEOUT: 10000,         // 10 second timeout for Google Vision
        GPT_VISION_TIMEOUT: 30000,     // 30 second timeout for GPT-4o (needs more time)
        ENABLE_LEARNING: true          // Learn from successful extractions
    };

    // ═══════════════════════════════════════════════════════════════════════
    // NEURAL LEARNING STORAGE
    // ═══════════════════════════════════════════════════════════════════════
    const LearnedPatterns = {
        // Store learned lab value patterns
        patterns: new Map(),
        
        // Store successful extractions for learning
        successfulExtractions: [],
        
        // Statistics
        stats: {
            totalExtractions: 0,
            gptSuccesses: 0,
            learnedPatterns: 0,
            lastLearning: null
        },

        // Add a successful extraction to learn from
        addExtraction(labValues, rawText, source) {
            if (!CONFIG.ENABLE_LEARNING) return;
            
            this.stats.totalExtractions++;
            if (source === 'gpt4o_vision') {
                this.stats.gptSuccesses++;
            }

            // Store extraction for pattern learning
            this.successfulExtractions.push({
                values: labValues,
                text: rawText,
                source: source,
                timestamp: new Date().toISOString()
            });

            // Keep only last 50 extractions
            if (this.successfulExtractions.length > 50) {
                this.successfulExtractions.shift();
            }

            // Learn patterns from values
            labValues.forEach(lab => {
                this.learnPattern(lab);
            });

            this.stats.lastLearning = new Date().toISOString();
            console.log(`[OCR Learning] 🧠 Learned from ${labValues.length} lab values (source: ${source})`);
        },

        // Learn a pattern from a lab value
        learnPattern(labValue) {
            const key = labValue.name?.toLowerCase().trim();
            if (!key) return;

            const existing = this.patterns.get(key) || {
                name: labValue.name,
                aliases: new Set(),
                units: new Set(),
                ranges: [],
                sampleValues: [],
                count: 0
            };

            // Add unit if present
            if (labValue.unit) {
                existing.units.add(labValue.unit);
            }

            // Add range if present
            if (labValue.range) {
                existing.ranges.push(labValue.range);
            }

            // Add sample values (keep last 10)
            existing.sampleValues.push(labValue.value);
            if (existing.sampleValues.length > 10) {
                existing.sampleValues.shift();
            }

            existing.count++;
            this.patterns.set(key, existing);
            this.stats.learnedPatterns = this.patterns.size;
        },

        // Get learned info for a lab name
        getPattern(labName) {
            return this.patterns.get(labName?.toLowerCase().trim());
        },

        // Get all learned patterns
        getAllPatterns() {
            return Array.from(this.patterns.entries()).map(([key, value]) => ({
                key,
                ...value,
                units: Array.from(value.units),
                aliases: Array.from(value.aliases)
            }));
        },

        // Get statistics
        getStats() {
            return {
                ...this.stats,
                patternCount: this.patterns.size,
                extractionHistory: this.successfulExtractions.length
            };
        }
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
    // GPT-4O VISION API CALL - PRIMARY OCR
    // ═══════════════════════════════════════════════════════════════════════
    const callGPTVision = async (dataUrl, callbacks = {}) => {
        const { onProgress, onStage, onLog } = callbacks;

        onLog?.('info', '🚀 Using GPT-4o Vision for lab extraction...');
        onStage?.('GPT-4o analyzing image...');
        onProgress?.(10);

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), CONFIG.GPT_VISION_TIMEOUT);

            // Prepare image data
            let imageData = dataUrl;
            if (imageData.includes(',')) {
                imageData = imageData.split(',')[1];
            }

            console.log('[GPT-Vision] Sending to API:', CONFIG.API_URL);
            onProgress?.(30);

            const response = await fetch(CONFIG.API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({
                    action: 'claudeVision',  // Backend uses this action name for vision
                    image: dataUrl
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            onProgress?.(70);

            console.log('[GPT-Vision] Response Status:', response.status);

            const responseText = await response.text();
            console.log('[GPT-Vision] Response preview:', responseText.substring(0, 300));

            if (!response.ok) {
                throw new Error(`API Error: HTTP ${response.status}`);
            }

            // Check for HTML response (deployment issue)
            if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
                throw new Error('Got HTML instead of JSON - API may need redeployment');
            }

            let result;
            try {
                result = JSON.parse(responseText);
            } catch (parseErr) {
                throw new Error('Failed to parse response: ' + parseErr.message);
            }

            if (result.error) {
                throw new Error(result.error);
            }

            onLog?.('success', `✨ GPT-4o Vision: Found ${result.values?.length || 0} lab values`);
            onProgress?.(95);

            // Learn from this successful extraction
            if (result.values && result.values.length > 0) {
                LearnedPatterns.addExtraction(result.values, result.rawText || '', 'gpt4o_vision');
            }

            return {
                success: true,
                text: result.rawText || '',
                values: result.values || [],
                reportType: result.reportType || 'LABORATORY',
                confidence: result.confidence || 95,
                source: 'gpt4o_vision',
                model: 'gpt-4o'
            };

        } catch (err) {
            if (err.name === 'AbortError') {
                onLog?.('warn', `GPT-4o timeout (${CONFIG.GPT_VISION_TIMEOUT / 1000}s) - falling back to Google Vision`);
            } else {
                onLog?.('warn', `GPT-4o Vision error: ${err.message} - falling back`);
            }
            console.error('[GPT-Vision] Error:', err);
            return null;
        }
    };

    // ═══════════════════════════════════════════════════════════════════════
    // GOOGLE VISION API CALL (FALLBACK OCR)
    // ═══════════════════════════════════════════════════════════════════════
    const callGoogleVision = async (dataUrl, callbacks = {}) => {
        const { onProgress, onStage, onLog } = callbacks;
        
        onLog?.('info', 'Using Google Vision OCR (fallback)...');
        onStage?.('Extracting text...');
        onProgress?.(10);
        
        let imageData = dataUrl;
        if (imageData.includes(',')) {
            imageData = imageData.split(',')[1];
        }
        
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), CONFIG.VISION_TIMEOUT);

            const response = await fetch(CONFIG.API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({
                    action: 'runOCR',
                    image: imageData,
                    mode: 'DOCUMENT_TEXT_DETECTION'
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            onProgress?.(50);

            const responseText = await response.text();

            if (!response.ok) {
                throw new Error(`API Error: HTTP ${response.status}`);
            }

            let result;
            try {
                result = JSON.parse(responseText);
            } catch (parseErr) {
                throw new Error('Failed to parse response');
            }

            if (result.error) {
                throw new Error(result.error);
            }
            
            onLog?.('success', `Google Vision extracted ${result.text?.length || 0} characters`);
            
            return { 
                text: result.text || "", 
                confidence: result.confidence || 85, 
                source: 'google_vision' 
            };
            
        } catch (err) {
            if (err.name === 'AbortError') {
                onLog?.('error', 'Google Vision timeout');
            }
            throw err;
        }
    };

    // ═══════════════════════════════════════════════════════════════════════
    // REGEX FALLBACK PARSER
    // ═══════════════════════════════════════════════════════════════════════
    const parseWithRegex = (text) => {
        const values = [];
        const lines = text.split('\n');

        // Common lab patterns
        const labPatterns = [
            // Standard: "Test Name: 123.45 unit"
            /^([A-Za-z][A-Za-z0-9\s\-\/\(\)]+?)[\s:]+([<>]?\d+\.?\d*)\s*([\w\/\%\^]+)?/,
            // With reference range
            /([A-Za-z][A-Za-z\s\-]+)\s+(\d+\.?\d*)\s+([\w\/]+)\s+\(?([\d\.\-]+)\s*-\s*([\d\.]+)/,
            // Simple number after text
            /([A-Za-z]{2,}[\w\s]*?)\s+(\d+\.?\d*)/
        ];

        // Known lab test names for validation
        const knownTests = new Set([
            'wbc', 'rbc', 'hemoglobin', 'hgb', 'hematocrit', 'hct', 'platelet', 'plt',
            'mcv', 'mch', 'mchc', 'rdw', 'mpv', 'neutrophil', 'lymphocyte', 'monocyte',
            'eosinophil', 'basophil', 'sodium', 'na', 'potassium', 'k', 'chloride', 'cl',
            'bicarbonate', 'hco3', 'co2', 'bun', 'creatinine', 'cr', 'glucose', 'glu',
            'calcium', 'ca', 'magnesium', 'mg', 'phosphorus', 'phos', 'albumin', 'alb',
            'protein', 'bilirubin', 'alt', 'sgpt', 'ast', 'sgot', 'alp', 'ggt',
            'ldh', 'ck', 'cpk', 'troponin', 'bnp', 'inr', 'pt', 'ptt', 'aptt',
            'fibrinogen', 'd-dimer', 'ferritin', 'iron', 'tibc', 'transferrin',
            'tsh', 't3', 't4', 'free t4', 'hba1c', 'a1c', 'egfr', 'gfr',
            'uric acid', 'ammonia', 'lactate', 'lipase', 'amylase', 'crp', 'esr',
            'procalcitonin', 'cortisol', 'vitamin d', 'b12', 'folate'
        ]);

        lines.forEach(line => {
            const trimmed = line.trim();
            if (!trimmed || trimmed.length < 3) return;

            for (const pattern of labPatterns) {
                const match = trimmed.match(pattern);
                if (match) {
                    const name = match[1]?.trim();
                    const value = match[2]?.trim();
                    const unit = match[3]?.trim() || '';

                    // Validate it looks like a real lab value
                    const nameLower = name?.toLowerCase();
                    const isKnown = knownTests.has(nameLower) || 
                                   Array.from(knownTests).some(t => nameLower?.includes(t));

                    if (name && value && (isKnown || name.length >= 3)) {
                        values.push({
                            name: name,
                            value: value,
                            unit: unit,
                            status: 'unknown',
                            source: 'regex'
                        });
                        break; // Move to next line
                    }
                }
            }
        });

        // Learn from regex extractions too
        if (values.length > 0) {
            LearnedPatterns.addExtraction(values, text, 'regex');
        }

        return {
            values: values,
            labType: 'General',
            reportType: 'Laboratory',
            source: 'regex'
        };
    };

    // ═══════════════════════════════════════════════════════════════════════
    // DOCUMENT TYPE DETECTION
    // ═══════════════════════════════════════════════════════════════════════
    const detectDocumentType = (text) => {
        const textLower = text.toLowerCase();

        // Imaging keywords
        const imagingKeywords = ['ct scan', 'mri', 'x-ray', 'ultrasound', 'radiograph', 
            'impression:', 'findings:', 'technique:', 'radiology'];
        
        // Lab keywords
        const labKeywords = ['wbc', 'rbc', 'hemoglobin', 'platelet', 'sodium', 
            'creatinine', 'reference range', 'laboratory'];

        // EKG keywords
        const ekgKeywords = ['ekg', 'ecg', 'electrocardiogram', 'rhythm', 
            'heart rate', 'pr interval', 'qrs'];

        const imagingScore = imagingKeywords.filter(k => textLower.includes(k)).length;
        const labScore = labKeywords.filter(k => textLower.includes(k)).length;
        const ekgScore = ekgKeywords.filter(k => textLower.includes(k)).length;

        if (imagingScore > labScore && imagingScore > ekgScore) return 'IMAGING';
        if (ekgScore > labScore && ekgScore >= imagingScore) return 'EKG';
        return 'LABORATORY';
    };

    // ═══════════════════════════════════════════════════════════════════════
    // MAIN OCR FUNCTION
    // ═══════════════════════════════════════════════════════════════════════
    const runOCR = async (file, callbacks = {}) => {
        const { onProgress, onStage, onLog } = callbacks;
        
        try {
            onStage?.('Preparing image...');
            onProgress?.(5);
            onLog?.('info', `Processing: ${file.name} (${(file.size / 1024).toFixed(1)}KB)`);

            // Compress image
            const dataUrl = await compressImage(file);
            onLog?.('success', 'Image compressed');
            onProgress?.(15);

            let result = null;

            // TRY GPT-4O VISION FIRST (if enabled)
            if (CONFIG.USE_GPT_VISION) {
                onLog?.('info', '🚀 Attempting GPT-4o Vision extraction...');
                result = await callGPTVision(dataUrl, callbacks);

                if (result && result.success && result.values && result.values.length > 0) {
                    onLog?.('success', `✨ GPT-4o extracted ${result.values.length} lab values directly!`);
                    onProgress?.(100);
                    onStage?.('Complete');

                    return {
                        text: result.text,
                        values: result.values,
                        labType: result.reportType || 'Laboratory',
                        reportType: result.reportType || 'Laboratory',
                        confidence: result.confidence,
                        source: 'gpt4o_vision',
                        model: 'gpt-4o',
                        documentType: 'LABORATORY'
                    };
                }
            }

            // FALLBACK TO GOOGLE VISION + REGEX
            if (CONFIG.USE_GOOGLE_FALLBACK) {
                onLog?.('info', 'Falling back to Google Vision + regex parsing...');
                
                const ocrResult = await callGoogleVision(dataUrl, callbacks);
                
                if (ocrResult && ocrResult.text) {
                    const docType = detectDocumentType(ocrResult.text);
                    
                    // Parse with regex
                    const parseResult = parseWithRegex(ocrResult.text);
                    
                    // Also try LabParser if available
                    if (window.LabParser && window.LabParser.isReady && parseResult.values.length < 5) {
                        onLog?.('info', 'Trying enhanced LabParser...');
                        const labParserResult = window.LabParser.parse(ocrResult.text, { includeNeural: true });
                        if (labParserResult.values.length > parseResult.values.length) {
                            parseResult.values = labParserResult.values;
                            parseResult.source = 'labparser';
                        }
                    }

                    onProgress?.(100);
                    onStage?.('Complete');

                    return {
                        text: ocrResult.text,
                        values: parseResult.values,
                        labType: parseResult.labType || 'General',
                        reportType: docType,
                        confidence: ocrResult.confidence,
                        source: parseResult.source || 'regex_fallback',
                        documentType: docType
                    };
                }
            }

            throw new Error('All OCR methods failed');

        } catch (err) {
            onLog?.('error', `OCR failed: ${err.message}`);
            throw err;
        }
    };

    // ═══════════════════════════════════════════════════════════════════════
    // EXPOSE GLOBAL API
    // ═══════════════════════════════════════════════════════════════════════
    window.OCREngine = {
        version: '6.0.0',
        codename: 'GPT-4O-VISION-LEARNER',
        
        // Main functions
        runOCR,
        compressImage,
        callGPTVision,
        callGoogleVision,
        parseWithRegex,
        detectDocumentType,
        
        // Learning system
        learning: LearnedPatterns,
        getLearnedPatterns: () => LearnedPatterns.getAllPatterns(),
        getLearningStats: () => LearnedPatterns.getStats(),
        
        // Configuration
        config: CONFIG,
        isReady: true,

        // Configuration toggles
        enableGPTVision: () => { CONFIG.USE_GPT_VISION = true; console.log('✅ GPT-4o Vision enabled'); },
        disableGPTVision: () => { CONFIG.USE_GPT_VISION = false; console.log('⚠️ GPT-4o Vision disabled'); },
        enableLearning: () => { CONFIG.ENABLE_LEARNING = true; console.log('✅ Learning enabled'); },
        disableLearning: () => { CONFIG.ENABLE_LEARNING = false; console.log('⚠️ Learning disabled'); },
        enableGoogleFallback: () => { CONFIG.USE_GOOGLE_FALLBACK = true; },
        disableGoogleFallback: () => { CONFIG.USE_GOOGLE_FALLBACK = false; },

        // Get current config
        getConfig: () => ({ 
            ...CONFIG,
            API_URL: CONFIG.API_URL // Include computed URL
        })
    };

    // Log startup
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('[OCREngine v6.0] 🚀 GPT-4o Vision Lab Extraction');
    console.log('[OCREngine v6.0] 🧠 Neural Learning: ENABLED');
    console.log('[OCREngine v6.0] 📡 API:', CONFIG.API_URL);
    console.log('═══════════════════════════════════════════════════════════════');

})();
