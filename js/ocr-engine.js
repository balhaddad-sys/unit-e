/* ═══════════════════════════════════════════════════════════════════════════
   OCR ENGINE v6.1 - GPT-4o Vision Powered Lab Extraction
   With CUMULATIVE REPORT support for multi-date trending
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
        MAX_IMAGE_WIDTH: 1600,      // Increased for better quality
        JPEG_QUALITY: 0.92,          // Increased quality
        USE_GPT_VISION: true,        // Enable GPT-4o Vision
        USE_GOOGLE_FALLBACK: false,  // Fallback to Google Vision if GPT fails
        VISION_TIMEOUT: 10000,       // 10 second timeout for Google Vision
        GPT_VISION_TIMEOUT: 30000,   // 30 second timeout for GPT-4o (increased for complex reports)
        ENABLE_LEARNING: true        // Learn from successful extractions
    };

    // ═══════════════════════════════════════════════════════════════════════
    // NEURAL LEARNING STORAGE
    // ═══════════════════════════════════════════════════════════════════════
    const LearnedPatterns = {
        patterns: new Map(),
        successfulExtractions: [],
        stats: {
            totalExtractions: 0,
            gptSuccesses: 0,
            learnedPatterns: 0,
            lastLearning: null
        },

        addExtraction(labValues, rawText, source) {
            if (!CONFIG.ENABLE_LEARNING) return;
            
            this.stats.totalExtractions++;
            if (source === 'gpt4o_vision') {
                this.stats.gptSuccesses++;
            }

            this.successfulExtractions.push({
                values: labValues,
                text: rawText,
                source: source,
                timestamp: new Date().toISOString()
            });

            if (this.successfulExtractions.length > 50) {
                this.successfulExtractions.shift();
            }

            labValues.forEach(lab => {
                this.learnPattern(lab);
            });

            this.stats.lastLearning = new Date().toISOString();
            console.log(`[OCR Learning] 🧠 Learned from ${labValues.length} lab values (source: ${source})`);
        },

        learnPattern(labValue) {
            const key = labValue.name?.toLowerCase().trim() || labValue.test?.toLowerCase().trim();
            if (!key) return;

            const existing = this.patterns.get(key) || {
                name: labValue.name || labValue.test,
                aliases: new Set(),
                units: new Set(),
                ranges: [],
                sampleValues: [],
                count: 0
            };

            if (labValue.unit) {
                existing.units.add(labValue.unit);
            }

            if (labValue.range) {
                existing.ranges.push(labValue.range);
            }

            existing.sampleValues.push(labValue.value);
            if (existing.sampleValues.length > 10) {
                existing.sampleValues.shift();
            }

            existing.count++;
            this.patterns.set(key, existing);
            this.stats.learnedPatterns = this.patterns.size;
        },

        getPattern(labName) {
            return this.patterns.get(labName?.toLowerCase().trim());
        },

        getAllPatterns() {
            return Array.from(this.patterns.entries()).map(([key, value]) => ({
                key,
                ...value,
                units: Array.from(value.units),
                aliases: Array.from(value.aliases)
            }));
        },

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

            // Prepare image data - keep full data URL for GPT-4o
            let imageData = dataUrl;
            
            console.log('[GPT-Vision] Sending to API:', CONFIG.API_URL);
            console.log('[GPT-Vision] Image data length:', imageData.length);
            onProgress?.(30);

            const response = await fetch(CONFIG.API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({
                    action: 'claudeVision',
                    image: imageData
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            onProgress?.(70);

            console.log('[GPT-Vision] Response Status:', response.status);

            const responseText = await response.text();
            console.log('[GPT-Vision] Response length:', responseText.length);
            console.log('[GPT-Vision] Response preview:', responseText.substring(0, 500));

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
                console.error('[GPT-Vision] JSON parse error:', parseErr);
                throw new Error('Failed to parse response: ' + parseErr.message);
            }

            // Check for errors in response
            if (result.error) {
                throw new Error(result.error);
            }

            // Check for success flag
            if (result.success === false) {
                throw new Error(result.error || 'API returned success: false');
            }

            // Process and normalize values
            const processedValues = (result.values || []).map(v => ({
                // Normalize field names (backend may use 'test', frontend expects 'name' or 'test')
                test: v.test || v.name || 'Unknown',
                name: v.test || v.name || 'Unknown',
                value: v.value || '',
                unit: v.unit || '',
                flag: v.flag || 'N',
                refLow: v.refLow || null,
                refHigh: v.refHigh || null,
                range: v.refLow && v.refHigh ? [parseFloat(v.refLow), parseFloat(v.refHigh)] : null,
                collectionDate: v.collectionDate || null,
                category: v.category || categorizeTest(v.test || v.name || ''),
                source: 'gpt4o_vision'
            }));

            const valueCount = processedValues.length;
            const dateCount = result.dates?.length || 0;

            onLog?.('success', `✨ GPT-4o extracted ${valueCount} lab values${dateCount > 1 ? ` across ${dateCount} dates` : ''}`);
            onProgress?.(95);

            // Learn from this successful extraction
            if (processedValues.length > 0) {
                LearnedPatterns.addExtraction(processedValues, result.rawText || '', 'gpt4o_vision');
            }

            return {
                success: true,
                text: result.rawText || '',
                values: processedValues,
                reportType: result.reportType || 'LABORATORY',
                confidence: result.confidence || 95,
                dates: result.dates || [],
                source: 'gpt4o_vision',
                model: 'gpt-4o'
            };

        } catch (err) {
            if (err.name === 'AbortError') {
                onLog?.('warn', `GPT-4o timeout (${CONFIG.GPT_VISION_TIMEOUT / 1000}s) - try a clearer image`);
            } else {
                onLog?.('warn', `GPT-4o Vision error: ${err.message}`);
            }
            console.error('[GPT-Vision] Error:', err);
            return null;
        }
    };

    // ═══════════════════════════════════════════════════════════════════════
    // TEST CATEGORIZATION
    // ═══════════════════════════════════════════════════════════════════════
    const categorizeTest = (testName) => {
        if (!testName) return 'General';
        
        const lower = testName.toLowerCase();
        
        // Chemistry/Renal
        if (['sodium', 'na', 'potassium', 'k', 'chloride', 'cl', 'co2', 'bicarbonate', 
             'creatinine', 'creat', 'urea', 'bun', 'egfr', 'gfr', 'anion gap'].some(t => lower.includes(t))) {
            return 'Chemistry';
        }
        
        // Calcium/Bone
        if (['calcium', 'ca', 'cal', 'phosphorus', 'phos', 'magnesium', 'mg', 'adjusted'].some(t => lower.includes(t))) {
            return 'Calcium/Bone';
        }
        
        // Liver
        if (['alt', 'ast', 'sgpt', 'sgot', 'alp', 'alk', 'ggt', 'bilirubin', 'bil'].some(t => lower.includes(t))) {
            return 'Liver';
        }
        
        // Lipids
        if (['cholesterol', 'chol', 'triglyceride', 'tg', 'hdl', 'ldl', 'lipid'].some(t => lower.includes(t))) {
            return 'Lipids';
        }
        
        // Proteins
        if (['protein', 'albumin', 'alb', 'globulin'].some(t => lower.includes(t))) {
            return 'Proteins';
        }
        
        // CBC
        if (['wbc', 'rbc', 'hemoglobin', 'hgb', 'hematocrit', 'hct', 'platelet', 'plt', 
             'mcv', 'mch', 'mchc', 'rdw', 'neutrophil', 'lymphocyte'].some(t => lower.includes(t))) {
            return 'CBC';
        }
        
        // Other
        if (['urate', 'uric'].some(t => lower.includes(t))) {
            return 'Other';
        }
        
        return 'General';
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

        const labPatterns = [
            /^([A-Za-z][A-Za-z0-9\s\-\/\(\)]+?)[\s:]+([<>]?\d+\.?\d*)\s*([\w\/\%\^]+)?/,
            /([A-Za-z][A-Za-z\s\-]+)\s+(\d+\.?\d*)\s+([\w\/]+)\s+\(?([\d\.\-]+)\s*-\s*([\d\.]+)/,
            /([A-Za-z]{2,}[\w\s]*?)\s+(\d+\.?\d*)/
        ];

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
            'uric acid', 'urate', 'ammonia', 'lactate', 'lipase', 'amylase', 'crp', 'esr',
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

                    const nameLower = name?.toLowerCase();
                    const isKnown = knownTests.has(nameLower) || 
                                   Array.from(knownTests).some(t => nameLower?.includes(t));

                    if (name && value && (isKnown || name.length >= 3)) {
                        values.push({
                            name: name,
                            test: name,
                            value: value,
                            unit: unit,
                            flag: 'N',
                            category: categorizeTest(name),
                            source: 'regex'
                        });
                        break;
                    }
                }
            }
        });

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

        const imagingKeywords = ['ct scan', 'mri', 'x-ray', 'ultrasound', 'radiograph', 
            'impression:', 'findings:', 'technique:', 'radiology'];
        
        const labKeywords = ['wbc', 'rbc', 'hemoglobin', 'platelet', 'sodium', 
            'creatinine', 'reference range', 'laboratory', 'cumulative'];

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

            let dataUrl;

            if (typeof file === 'string' && file.startsWith('data:')) {
                onLog?.('info', `Processing data URL (${Math.round(file.length / 1024)}KB)`);
                dataUrl = file;
                onProgress?.(15);
            } else if (file instanceof File || file instanceof Blob) {
                onLog?.('info', `Processing: ${file.name || 'file'} (${(file.size / 1024).toFixed(1)}KB)`);
                dataUrl = await compressImage(file);
                onLog?.('success', 'Image compressed for optimal processing');
                onProgress?.(15);
            } else {
                throw new Error('Invalid input: must be a File, Blob, or data URL string');
            }

            let result = null;

            // TRY GPT-4O VISION (if enabled)
            if (CONFIG.USE_GPT_VISION) {
                onLog?.('info', '🚀 Using GPT-4o Vision for lab extraction...');
                onStage?.('Analyzing with AI...');
                result = await callGPTVision(dataUrl, callbacks);

                if (result && result.success && result.values && result.values.length > 0) {
                    onLog?.('success', `✨ GPT-4o extracted ${result.values.length} lab values!`);
                    onProgress?.(100);
                    onStage?.('Complete');

                    return {
                        text: result.text,
                        values: result.values,
                        labType: result.reportType || 'Laboratory',
                        reportType: result.reportType || 'Laboratory',
                        confidence: result.confidence,
                        dates: result.dates || [],
                        source: 'gpt4o_vision',
                        model: 'gpt-4o',
                        documentType: 'LABORATORY'
                    };
                } else {
                    onLog?.('warn', 'GPT-4o returned no values, trying fallback methods...');
                }
            }

            // FALLBACK TO GOOGLE VISION + REGEX (if enabled)
            if (CONFIG.USE_GOOGLE_FALLBACK) {
                onLog?.('info', 'Falling back to Google Vision + regex parsing...');

                try {
                    const ocrResult = await callGoogleVision(dataUrl, callbacks);

                    if (ocrResult && ocrResult.text) {
                        const docType = detectDocumentType(ocrResult.text);
                        const parseResult = parseWithRegex(ocrResult.text);

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
                } catch (fallbackErr) {
                    onLog?.('error', `Google Vision fallback failed: ${fallbackErr.message}`);
                }
            } else {
                onLog?.('info', 'Google Vision fallback disabled');
            }

            // If we get here, no OCR method succeeded
            throw new Error('Lab extraction failed. Please try:\n1. Take a clearer photo with better lighting\n2. Ensure the lab report is fully visible\n3. Check that OPENAI_API_KEY is configured in backend\n4. Try uploading a different image format (JPEG/PNG)');

        } catch (err) {
            onLog?.('error', `OCR failed: ${err.message}`);
            throw err;
        }
    };

    // ═══════════════════════════════════════════════════════════════════════
    // HELPER: Group values by date for trending
    // ═══════════════════════════════════════════════════════════════════════
    const groupValuesByDate = (values) => {
        const grouped = {};
        
        values.forEach(v => {
            const date = v.collectionDate || 'Unknown';
            if (!grouped[date]) {
                grouped[date] = [];
            }
            grouped[date].push(v);
        });
        
        return grouped;
    };

    // ═══════════════════════════════════════════════════════════════════════
    // HELPER: Create trend data from multiple extractions
    // ═══════════════════════════════════════════════════════════════════════
    const createTrendData = (labHistory) => {
        const trends = {};
        
        labHistory.forEach(entry => {
            const timestamp = entry.timestamp;
            const values = entry.values || [];
            
            values.forEach(v => {
                const testName = (v.test || v.name || '').toUpperCase().trim();
                if (!testName) return;
                
                if (!trends[testName]) {
                    trends[testName] = {
                        name: v.test || v.name,
                        unit: v.unit,
                        category: v.category || categorizeTest(testName),
                        history: []
                    };
                }
                
                trends[testName].history.push({
                    value: v.value,
                    flag: v.flag,
                    date: v.collectionDate || new Date(timestamp).toLocaleDateString(),
                    timestamp: timestamp,
                    refLow: v.refLow,
                    refHigh: v.refHigh
                });
            });
        });
        
        // Sort history by timestamp for each test
        Object.values(trends).forEach(test => {
            test.history.sort((a, b) => a.timestamp - b.timestamp);
        });
        
        return trends;
    };

    // ═══════════════════════════════════════════════════════════════════════
    // EXPOSE GLOBAL API
    // ═══════════════════════════════════════════════════════════════════════
    window.OCREngine = {
        version: '6.1.0',
        codename: 'GPT-4O-CUMULATIVE',
        
        // Main functions
        runOCR,
        compressImage,
        callGPTVision,
        callGoogleVision,
        parseWithRegex,
        detectDocumentType,
        categorizeTest,
        
        // Trending helpers
        groupValuesByDate,
        createTrendData,
        
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
            API_URL: CONFIG.API_URL
        })
    };

    // Log startup
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('[OCREngine v6.1] 🚀 GPT-4o Vision Lab Extraction');
    console.log('[OCREngine v6.1] 📊 CUMULATIVE Report Support: ENABLED');
    console.log('[OCREngine v6.1] 🧠 Neural Learning: ENABLED');
    console.log('[OCREngine v6.1] 📡 API:', CONFIG.API_URL);
    console.log('═══════════════════════════════════════════════════════════════');

})();
