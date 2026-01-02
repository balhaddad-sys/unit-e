/* ocr-neural-v2.js - Intelligent Lab Value Extraction */

window.LabOCR = {
    
    // ============================================================
    // 1. IMAGE PREPROCESSING - Fix the input before OCR
    // ============================================================
    
    preprocessImage: async function(imageSource) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                
                // Get image data
                let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                let data = imageData.data;
                
                // A. Convert to grayscale
                for (let i = 0; i < data.length; i += 4) {
                    const gray = 0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2];
                    data[i] = data[i+1] = data[i+2] = gray;
                }
                
                // B. Increase contrast (stretch histogram)
                let min = 255, max = 0;
                for (let i = 0; i < data.length; i += 4) {
                    if (data[i] < min) min = data[i];
                    if (data[i] > max) max = data[i];
                }
                const range = max - min || 1;
                for (let i = 0; i < data.length; i += 4) {
                    const normalized = ((data[i] - min) / range) * 255;
                    data[i] = data[i+1] = data[i+2] = normalized;
                }
                
                // C. Adaptive binarization (Otsu's threshold approximation)
                let histogram = new Array(256).fill(0);
                for (let i = 0; i < data.length; i += 4) {
                    histogram[Math.floor(data[i])]++;
                }
                
                let total = canvas.width * canvas.height;
                let sum = 0;
                for (let i = 0; i < 256; i++) sum += i * histogram[i];
                
                let sumB = 0, wB = 0, wF = 0, maxVar = 0, threshold = 128;
                for (let i = 0; i < 256; i++) {
                    wB += histogram[i];
                    if (wB === 0) continue;
                    wF = total - wB;
                    if (wF === 0) break;
                    sumB += i * histogram[i];
                    let mB = sumB / wB;
                    let mF = (sum - sumB) / wF;
                    let variance = wB * wF * (mB - mF) * (mB - mF);
                    if (variance > maxVar) {
                        maxVar = variance;
                        threshold = i;
                    }
                }
                
                // Apply threshold
                for (let i = 0; i < data.length; i += 4) {
                    const val = data[i] > threshold ? 255 : 0;
                    data[i] = data[i+1] = data[i+2] = val;
                }
                
                ctx.putImageData(imageData, 0, 0);
                resolve(canvas.toDataURL('image/png'));
            };
            
            img.src = imageSource;
        });
    },

    // ============================================================
    // 2. MEDICAL REFERENCE DATABASE
    // ============================================================
    
    labReferences: {
        // Hematology
        'WBC':   { min: 3.7,  max: 10,   unit: '10^9/L',  aliases: ['WHITE BLOOD CELL', 'LEUCOCYTES'] },
        'RBC':   { min: 4.0,  max: 6.0,  unit: '10^12/L', aliases: ['RED BLOOD CELL', 'ERYTHROCYTES'] },
        'HB':    { min: 120,  max: 170,  unit: 'g/L',     aliases: ['HGB', 'HEMOGLOBIN', 'HAEMOGLOBIN'] },
        'HCT':   { min: 0.36, max: 0.50, unit: 'L/L',     aliases: ['HEMATOCRIT', 'PCV'] },
        'MCV':   { min: 80,   max: 100,  unit: 'fL',      aliases: ['MEAN CORPUSCULAR VOLUME'] },
        'MCH':   { min: 27,   max: 33,   unit: 'pg',      aliases: ['MEAN CORPUSCULAR HEMOGLOBIN'] },
        'MCHC':  { min: 315,  max: 355,  unit: 'g/L',     aliases: ['MEAN CORPUSCULAR HB CONC'] },
        'RDW':   { min: 11.5, max: 14.5, unit: '%',       aliases: ['RED CELL DISTRIBUTION WIDTH'] },
        'PLT':   { min: 150,  max: 400,  unit: '10^9/L',  aliases: ['PLATELETS', 'PLATELET COUNT'] },
        'MPV':   { min: 7.0,  max: 11.0, unit: 'fL',      aliases: ['MEAN PLATELET VOLUME'] },
        
        // Chemistry
        'CR':    { min: 60,   max: 110,  unit: 'μmol/L',  aliases: ['CREATININE', 'CREAT'] },
        'NA':    { min: 136,  max: 145,  unit: 'mmol/L',  aliases: ['SODIUM'] },
        'K':     { min: 3.5,  max: 5.0,  unit: 'mmol/L',  aliases: ['POTASSIUM'] },
        'CL':    { min: 98,   max: 106,  unit: 'mmol/L',  aliases: ['CHLORIDE'] },
        'UREA':  { min: 2.5,  max: 7.8,  unit: 'mmol/L',  aliases: ['BUN'] },
        'GLU':   { min: 3.9,  max: 6.1,  unit: 'mmol/L',  aliases: ['GLUCOSE', 'SUGAR'] },
        
        // Blood Gas
        'PH':    { min: 7.35, max: 7.45, unit: '',        aliases: [] },
        'PCO2':  { min: 35,   max: 45,   unit: 'mmHg',    aliases: ['PACO2'] },
        'PO2':   { min: 80,   max: 100,  unit: 'mmHg',    aliases: ['PAO2'] },
        'HCO3':  { min: 22,   max: 26,   unit: 'mmol/L',  aliases: ['BICARBONATE'] },
        'BE':    { min: -2,   max: 2,    unit: 'mmol/L',  aliases: ['BASE EXCESS'] },
        'LACTATE': { min: 0.5, max: 2.0, unit: 'mmol/L',  aliases: ['LAC'] }
    },

    // ============================================================
    // 3. INTELLIGENT VALUE PARSER
    // ============================================================
    
    parseOcrResults: function(visionResponse) {
        const results = [];
        
        if (!visionResponse?.textAnnotations?.length) {
            return { success: false, error: 'No text detected', results: [] };
        }
        
        const fullText = visionResponse.textAnnotations[0].description;
        const blocks = visionResponse.textAnnotations.slice(1);
        
        // Build spatial map of all detected text
        const textMap = blocks.map(block => ({
            text: block.description.toUpperCase().trim(),
            bounds: block.boundingPoly.vertices,
            centerY: (block.boundingPoly.vertices[0].y + block.boundingPoly.vertices[2].y) / 2,
            centerX: (block.boundingPoly.vertices[0].x + block.boundingPoly.vertices[2].x) / 2
        }));
        
        // Find test names and their corresponding values
        for (const [testKey, testInfo] of Object.entries(this.labReferences)) {
            const searchTerms = [testKey, ...testInfo.aliases];
            
            for (const term of searchTerms) {
                const labelMatch = textMap.find(t => 
                    t.text === term || t.text.includes(term)
                );
                
                if (labelMatch) {
                    // Find numeric value on the same row (similar Y coordinate)
                    const sameRowItems = textMap.filter(t => 
                        Math.abs(t.centerY - labelMatch.centerY) < 20 &&
                        t.centerX > labelMatch.centerX
                    ).sort((a, b) => a.centerX - b.centerX);
                    
                    // Extract first numeric value
                    for (const item of sameRowItems) {
                        const numMatch = item.text.match(/^[\d.]+$/);
                        if (numMatch) {
                            const rawValue = parseFloat(numMatch[0]);
                            const validated = this.validateValue(testKey, rawValue, testInfo);
                            
                            results.push({
                                test: testKey,
                                rawOcr: numMatch[0],
                                value: validated.correctedValue,
                                unit: testInfo.unit,
                                reference: `${testInfo.min}-${testInfo.max}`,
                                status: validated.status,
                                confidence: validated.confidence,
                                flag: validated.flag
                            });
                            break;
                        }
                    }
                    break;
                }
            }
        }
        
        return { success: true, results };
    },

    // ============================================================
    // 4. MEDICAL VALIDATION ENGINE
    // ============================================================
    
    validateValue: function(test, rawValue, refInfo) {
        const result = {
            correctedValue: rawValue,
            status: 'VALID',
            confidence: 95,
            flag: null
        };
        
        // Rule 1: Check for impossible values (life-incompatible)
        const impossibleRanges = {
            'HB':  { absoluteMin: 20, absoluteMax: 250 },  // Below 20 = death, above 250 = impossible
            'RBC': { absoluteMin: 1.0, absoluteMax: 8.0 }, // Physiological limits
            'WBC': { absoluteMin: 0.1, absoluteMax: 100 },
            'PLT': { absoluteMin: 5, absoluteMax: 1500 },
            'NA':  { absoluteMin: 100, absoluteMax: 180 },
            'K':   { absoluteMin: 1.5, absoluteMax: 9.0 },
            'CR':  { absoluteMin: 10, absoluteMax: 2000 },
            'PH':  { absoluteMin: 6.8, absoluteMax: 7.8 }
        };
        
        if (impossibleRanges[test]) {
            const limits = impossibleRanges[test];
            
            // Check if value is clearly wrong
            if (rawValue < limits.absoluteMin || rawValue > limits.absoluteMax) {
                result.status = 'OCR_ERROR';
                result.confidence = 10;
                result.correctedValue = null;
                result.flag = 'VERIFY_MANUALLY';
                return result;
            }
        }
        
        // Rule 2: Common OCR misreads
        const ocrCorrections = this.detectOcrMisread(test, rawValue, refInfo);
        if (ocrCorrections.detected) {
            result.correctedValue = ocrCorrections.suggestedValue;
            result.status = 'AUTO_CORRECTED';
            result.confidence = ocrCorrections.confidence;
            result.flag = `OCR likely misread: ${rawValue} → ${ocrCorrections.suggestedValue}`;
        }
        
        // Rule 3: Flag abnormal (but possible) values
        if (result.status === 'VALID') {
            if (rawValue < refInfo.min) {
                result.flag = 'LOW';
            } else if (rawValue > refInfo.max) {
                result.flag = 'HIGH';
            }
        }
        
        return result;
    },
    
    detectOcrMisread: function(test, value, refInfo) {
        const corrections = [];
        
        // Pattern: Missing decimal point (51 → 5.1)
        if (value > refInfo.max * 5) {
            const withDecimal = value / 10;
            if (withDecimal >= refInfo.min * 0.5 && withDecimal <= refInfo.max * 1.5) {
                corrections.push({ value: withDecimal, confidence: 70, reason: 'missing_decimal' });
            }
        }
        
        // Pattern: Extra digit (3102 → 3.02 or 310.2)
        if (value > 1000 && test === 'RBC') {
            const asDecimal = value / 1000;
            if (asDecimal >= 2.0 && asDecimal <= 7.0) {
                corrections.push({ value: asDecimal, confidence: 65, reason: 'extra_digits' });
            }
        }
        
        // Pattern: Zero misread (00 → likely OCR failure)
        if (value === 0 && refInfo.min > 0) {
            return { detected: true, suggestedValue: null, confidence: 5, reason: 'zero_misread' };
        }
        
        // Pattern: Digit swap for specific tests
        if (test === 'HB' && value < 20) {
            // Hb of "93" might be read as "9.3" or "39"
            const possibilities = [value * 10, value * 100];
            for (const p of possibilities) {
                if (p >= 60 && p <= 200) {
                    corrections.push({ value: p, confidence: 60, reason: 'scale_error' });
                }
            }
        }
        
        // Return best correction
        if (corrections.length > 0) {
            corrections.sort((a, b) => b.confidence - a.confidence);
            return { 
                detected: true, 
                suggestedValue: corrections[0].value,
                confidence: corrections[0].confidence,
                reason: corrections[0].reason
            };
        }
        
        return { detected: false };
    },

    // ============================================================
    // 5. MAIN PROCESSING PIPELINE
    // ============================================================
    
    processLabImage: async function(imageSource, visionApiKey) {
        console.log('[LabOCR] Starting processing pipeline...');
        
        // Step 1: Preprocess
        console.log('[LabOCR] Preprocessing image...');
        const processedImage = await this.preprocessImage(imageSource);
        
        // Step 2: Call Vision API
        console.log('[LabOCR] Calling Vision API...');
        const visionResponse = await this.callVisionApi(processedImage, visionApiKey);
        
        if (!visionResponse.success) {
            return { success: false, error: visionResponse.error };
        }
        
        // Step 3: Parse and validate
        console.log('[LabOCR] Parsing results...');
        const parsed = this.parseOcrResults(visionResponse.data);
        
        // Step 4: Generate summary
        const summary = this.generateSummary(parsed.results);
        
        return {
            success: true,
            results: parsed.results,
            summary: summary,
            rawVisionResponse: visionResponse.data
        };
    },
    
    callVisionApi: async function(base64Image, apiKey) {
        try {
            // Strip data URL prefix if present
            const imageContent = base64Image.replace(/^data:image\/\w+;base64,/, '');
            
            const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    requests: [{
                        image: { content: imageContent },
                        features: [
                            { type: 'TEXT_DETECTION', maxResults: 50 },
                            { type: 'DOCUMENT_TEXT_DETECTION', maxResults: 1 }
                        ]
                    }]
                })
            });
            
            const data = await response.json();
            
            if (data.error) {
                return { success: false, error: data.error.message };
            }
            
            return { success: true, data: data.responses[0] };
        } catch (err) {
            return { success: false, error: err.message };
        }
    },
    
    generateSummary: function(results) {
        const errors = results.filter(r => r.status === 'OCR_ERROR').length;
        const corrected = results.filter(r => r.status === 'AUTO_CORRECTED').length;
        const abnormal = results.filter(r => r.flag === 'HIGH' || r.flag === 'LOW').length;
        
        return {
            totalDetected: results.length,
            ocrErrors: errors,
            autoCorrected: corrected,
            abnormalValues: abnormal,
            overallConfidence: results.length > 0 
                ? Math.round(results.reduce((sum, r) => sum + r.confidence, 0) / results.length)
                : 0
        };
    }
};

// ============================================================
// 6. INTEGRATION HELPER
// ============================================================

// Drop-in replacement for your current flow
async function processLabWithEnhancedOCR(imageSource, apiKey) {
    const result = await window.LabOCR.processLabImage(imageSource, apiKey);
    
    if (!result.success) {
        console.error('[LabOCR] Failed:', result.error);
        return [];
    }
    
    // Format for your existing React state
    return result.results.map(r => ({
        test: r.test,
        value: r.correctedValue !== null ? String(r.correctedValue) : 'ERROR',
        unit: r.unit,
        reference: r.reference,
        flag: r.flag,
        confidence: r.confidence,
        needsReview: r.status === 'OCR_ERROR' || r.status === 'AUTO_CORRECTED'
    }));
}

console.log('[LabOCR] Module loaded. Use window.LabOCR.processLabImage() or processLabWithEnhancedOCR()');
