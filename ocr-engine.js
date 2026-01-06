/* ═══════════════════════════════════════════════════════════════════════════
   OCR ENGINE v4.0 - Intelligent Clinical Report Parser
   Google Vision for OCR + Claude API for intelligent extraction
   ═══════════════════════════════════════════════════════════════════════════ */

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        VISION_API_URL: 'https://script.google.com/macros/s/AKfycbxOvjUZcjj1WcVjS8d_8bXPRQ603pYoqaFKkC907mjXYpFoo3HMvAcytp9-sqU_XgXGMg/exec',
        MAX_IMAGE_WIDTH: 1200,     // Reduced from 1600 for faster upload
        JPEG_QUALITY: 0.88,        // Reduced from 0.92 for smaller file size
        USE_CLAUDE_PARSING: true,  // Enable Claude API for smart parsing
        VISION_TIMEOUT: 8000,      // 8 second timeout for Vision API
        CLAUDE_TIMEOUT: 5000       // 5 second timeout for Claude parsing
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
    // GOOGLE VISION API CALL (OCR)
    // ═══════════════════════════════════════════════════════════════════════
    const callVisionAPI = async (dataUrl, callbacks = {}) => {
        const { onProgress, onStage, onLog } = callbacks;
        
        onLog?.('info', 'Starting Google Vision OCR...');
        onStage?.('Extracting text...');
        onProgress?.(10);
        
        let imageData = dataUrl;
        if (imageData.includes(',')) {
            imageData = imageData.split(',')[1];
        }
        
        try {
            onProgress?.(30);

            // Add timeout to prevent hanging
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), CONFIG.VISION_TIMEOUT);

            const response = await fetch(CONFIG.VISION_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({
                    action: 'ocr',
                    image: imageData,
                    mode: 'DOCUMENT_TEXT_DETECTION'
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            onProgress?.(50);
            
            const responseText = await response.text();
            
            if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
                throw new Error('Got HTML instead of JSON - Apps Script may need redeployment');
            }
            
            let result;
            try { 
                result = JSON.parse(responseText); 
            } catch (parseErr) { 
                throw new Error('Failed to parse Vision API response'); 
            }
            
            if (result.error) {
                throw new Error(result.error);
            }
            
            onLog?.('success', `OCR extracted ${result.text?.length || 0} characters`);
            
            return { 
                text: result.text || "", 
                confidence: result.confidence || 85, 
                source: 'google_vision' 
            };
            
        } catch (err) {
            if (err.name === 'AbortError') {
                onLog?.('error', `Vision API timeout (${CONFIG.VISION_TIMEOUT / 1000}s) - network too slow or server not responding`);
                throw new Error('OCR timeout - please try again or check connection');
            }
            onLog?.('error', `Vision API failed: ${err.message}`);
            throw err;
        }
    };

    // ═══════════════════════════════════════════════════════════════════════
    // CLAUDE API - INTELLIGENT REPORT PARSING
    // ═══════════════════════════════════════════════════════════════════════
    const parseWithClaude = async (ocrText, callbacks = {}) => {
        const { onProgress, onStage, onLog } = callbacks;
        
        onStage?.('AI analyzing report...');
        onProgress?.(60);
        onLog?.('info', 'Sending to Claude for intelligent parsing...');

        try {
            // Add timeout to prevent hanging
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), CONFIG.CLAUDE_TIMEOUT);

            const response = await fetch(CONFIG.VISION_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({
                    action: 'claudeParse',
                    text: ocrText
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            onProgress?.(85);
            
            const result = await response.json();
            
            if (result.error) {
                onLog?.('warn', `Claude parsing failed: ${result.error}, falling back to regex`);
                return null;
            }
            
            onLog?.('success', `Claude identified: ${result.reportType}, ${result.values?.length || 0} values`);
            onProgress?.(95);
            
            return result;
            
        } catch (err) {
            if (err.name === 'AbortError') {
                onLog?.('warn', `Claude timeout (${CONFIG.CLAUDE_TIMEOUT / 1000}s) - falling back to regex`);
            } else {
                onLog?.('warn', `Claude API error: ${err.message}, falling back to regex`);
            }
            return null;
        }
    };

    // ═══════════════════════════════════════════════════════════════════════
    // TEXT PREPROCESSING - FILTER UNNECESSARY CONTENT
    // ═══════════════════════════════════════════════════════════════════════
    const preprocessOCRText = (text) => {
        // Remove common headers, footers, and non-data content
        const linesToRemove = [
            /^page\s*\d+/i,                          // Page numbers
            /^hospital|clinic|medical center/i,       // Hospital names
            /^patient\s*name/i,                      // Patient info headers
            /^date\s*of\s*birth/i,
            /^mrn|^medical\s*record/i,
            /^collected|collection\s*date/i,
            /^received|report\s*date/i,
            /^provider|physician|doctor/i,
            /^account\s*#|^accession/i,
            /^laboratory|^lab\s*name/i,
            /^confidential|^for\s*authorized/i,
            /^end\s*of\s*report/i,
            /^\s*-+\s*$/,                            // Separator lines
            /^\s*=+\s*$/,
            /^\s*\*+\s*$/,
            /^printed\s*on|^printed\s*at/i,
            /^fax|^phone|^address/i,
            /^copyright|^\(c\)/i
        ];

        // Keep only lines that are likely to contain lab data
        const lines = text.split('\n');
        const filteredLines = lines.filter(line => {
            const trimmed = line.trim();

            // Skip empty lines
            if (!trimmed) return false;

            // Skip lines matching removal patterns
            for (const pattern of linesToRemove) {
                if (pattern.test(trimmed)) return false;
            }

            // Keep lines with numbers (likely lab values)
            if (/\d/.test(trimmed)) return true;

            // Keep lines with lab test keywords
            const labKeywords = [
                'wbc', 'rbc', 'hemoglobin', 'hgb', 'hct', 'platelet', 'plt',
                'sodium', 'potassium', 'chloride', 'glucose', 'creatinine',
                'bun', 'calcium', 'magnesium', 'phosphorus',
                'ast', 'alt', 'alkaline', 'bilirubin', 'albumin', 'protein',
                'pt', 'inr', 'ptt', 'aptt',
                'tsh', 'troponin', 'bnp', 'lactate',
                'reference', 'range', 'normal', 'abnormal', 'flag'
            ];

            const lowerLine = trimmed.toLowerCase();
            if (labKeywords.some(kw => lowerLine.includes(kw))) return true;

            // Skip lines that are too short (likely headers)
            if (trimmed.length < 3) return false;

            // Skip lines that are all uppercase and no numbers (likely section headers)
            if (trimmed === trimmed.toUpperCase() && !/\d/.test(trimmed)) {
                // But keep important section headers
                if (/test|result|value|lab|impression|finding|diagnosis/i.test(trimmed)) {
                    return true;
                }
                return false;
            }

            return true;
        });

        // Rejoin filtered lines
        let cleanedText = filteredLines.join('\n');

        // Remove excessive whitespace
        cleanedText = cleanedText.replace(/\n{3,}/g, '\n\n');
        cleanedText = cleanedText.replace(/[ \t]+/g, ' ');

        return cleanedText.trim();
    };

    // ═══════════════════════════════════════════════════════════════════════
    // NEURAL DOCUMENT TYPE DETECTION
    // ═══════════════════════════════════════════════════════════════════════
    const detectDocumentType = (text) => {
        const textLower = text.toLowerCase();

        // Imaging/Radiology keywords
        const imagingKeywords = [
            'ct scan', 'mri', 'x-ray', 'xray', 'ultrasound', 'sonography',
            'radiograph', 'pet scan', 'mammogram', 'fluoroscopy', 'angiogram',
            'impression:', 'findings:', 'technique:', 'comparison:', 'indication:',
            'contrast', 'slice thickness', 'field of view', 'radiology report'
        ];

        // Lab keywords
        const labKeywords = [
            'wbc', 'rbc', 'hemoglobin', 'platelet', 'sodium', 'potassium',
            'creatinine', 'glucose', 'reference range', 'normal range',
            'specimen', 'laboratory', 'lab report'
        ];

        // Pathology keywords
        const pathologyKeywords = [
            'pathology', 'histopathology', 'biopsy', 'cytology', 'microscopic',
            'gross description', 'diagnosis:', 'specimen type', 'neoplasm',
            'malignant', 'benign', 'carcinoma', 'adenoma'
        ];

        // EKG/ECG keywords
        const ekgKeywords = [
            'ecg', 'ekg', 'electrocardiogram', 'heart rate', 'pr interval',
            'qrs duration', 'qt interval', 'rhythm', 'atrial fibrillation',
            'sinus rhythm', 'leads', 'v1', 'v2', 'avr', 'avl'
        ];

        let imagingScore = 0, labScore = 0, pathologyScore = 0, ekgScore = 0;

        imagingKeywords.forEach(kw => { if (textLower.includes(kw)) imagingScore++; });
        labKeywords.forEach(kw => { if (textLower.includes(kw)) labScore++; });
        pathologyKeywords.forEach(kw => { if (textLower.includes(kw)) pathologyScore++; });
        ekgKeywords.forEach(kw => { if (textLower.includes(kw)) ekgScore++; });

        const scores = [
            { type: 'IMAGING', score: imagingScore },
            { type: 'LABORATORY', score: labScore },
            { type: 'PATHOLOGY', score: pathologyScore },
            { type: 'EKG', score: ekgScore }
        ];

        scores.sort((a, b) => b.score - a.score);

        if (scores[0].score === 0) return 'UNKNOWN';
        if (scores[0].score >= 2) return scores[0].type;

        return 'LABORATORY'; // Default to lab if unclear
    };

    // ═══════════════════════════════════════════════════════════════════════
    // IMAGING/RADIOLOGY REPORT PARSING
    // ═══════════════════════════════════════════════════════════════════════
    const parseImagingReport = (text) => {
        const findings = [];
        let impression = '';
        let technique = '';
        let indication = '';

        // Extract sections
        const impressionMatch = text.match(/IMPRESSION[:\s]+([\s\S]+?)(?=\n\n|TECHNIQUE|FINDINGS|$)/i);
        if (impressionMatch) impression = impressionMatch[1].trim();

        const techniqueMatch = text.match(/TECHNIQUE[:\s]+([\s\S]+?)(?=\n\n|IMPRESSION|FINDINGS|$)/i);
        if (techniqueMatch) technique = techniqueMatch[1].trim();

        const indicationMatch = text.match(/INDICATION[:\s]+([\s\S]+?)(?=\n\n|TECHNIQUE|FINDINGS|IMPRESSION|$)/i);
        if (indicationMatch) indication = indicationMatch[1].trim();

        const findingsMatch = text.match(/FINDINGS[:\s]+([\s\S]+?)(?=\n\n|IMPRESSION|TECHNIQUE|$)/i);
        if (findingsMatch) {
            // Split findings into bullet points
            const findingsText = findingsMatch[1];
            const lines = findingsText.split('\n').filter(l => l.trim());
            lines.forEach(line => {
                const cleaned = line.trim().replace(/^[-•*]\s*/, '');
                if (cleaned.length > 10) findings.push(cleaned);
            });
        }

        return {
            reportType: 'Imaging/Radiology',
            impression,
            findings,
            technique,
            indication,
            summary: impression || (findings.length > 0 ? findings[0] : 'No structured impression found'),
            values: [] // Imaging reports don't have lab values
        };
    };

    // ═══════════════════════════════════════════════════════════════════════
    // FALLBACK: REGEX-BASED LAB PARSING
    // ═══════════════════════════════════════════════════════════════════════
    const parseWithRegex = (text) => {
        const patterns = [
            // CBC
            { test: 'WBC', pattern: /WBC[:\s]*(\d+\.?\d*)/i, unit: '×10⁹/L', range: [4, 11] },
            { test: 'RBC', pattern: /RBC[:\s]*(\d+\.?\d*)/i, unit: '×10¹²/L', range: [4.5, 5.5] },
            { test: 'Hgb', pattern: /(?:Hgb|Hb|Hemoglobin)[:\s]*(\d+\.?\d*)/i, unit: 'g/dL', range: [12, 17] },
            { test: 'Hct', pattern: /(?:Hct|HCT|Hematocrit)[:\s]*(\d+\.?\d*)/i, unit: '%', range: [36, 50] },
            { test: 'MCV', pattern: /MCV[:\s]*(\d+\.?\d*)/i, unit: 'fL', range: [80, 100] },
            { test: 'MCH', pattern: /MCH[:\s]*(\d+\.?\d*)/i, unit: 'pg', range: [27, 33] },
            { test: 'MCHC', pattern: /MCHC[:\s]*(\d+\.?\d*)/i, unit: 'g/dL', range: [32, 36] },
            { test: 'Plt', pattern: /(?:Plt|Platelets?)[:\s]*(\d+)/i, unit: '×10⁹/L', range: [150, 400] },
            
            // RFT
            { test: 'BUN', pattern: /(?:BUN|Urea)[:\s]*(\d+\.?\d*)/i, unit: 'mg/dL', range: [7, 20] },
            { test: 'Cr', pattern: /(?:Cr|Creatinine)[:\s]*(\d+\.?\d*)/i, unit: 'mg/dL', range: [0.7, 1.3] },
            { test: 'eGFR', pattern: /(?:eGFR|GFR)[:\s]*(\d+\.?\d*)/i, unit: 'mL/min', range: [90, 120] },
            
            // Electrolytes
            { test: 'Na', pattern: /(?:Na|Sodium)[:\s]*(\d+\.?\d*)/i, unit: 'mEq/L', range: [136, 145] },
            { test: 'K', pattern: /(?:K|Potassium)[:\s]*(\d+\.?\d*)/i, unit: 'mEq/L', range: [3.5, 5.0] },
            { test: 'Cl', pattern: /(?:Cl|Chloride)[:\s]*(\d+\.?\d*)/i, unit: 'mEq/L', range: [98, 106] },
            { test: 'CO2', pattern: /(?:CO2|Bicarb|HCO3)[:\s]*(\d+\.?\d*)/i, unit: 'mEq/L', range: [22, 29] },
            { test: 'Ca', pattern: /(?:Ca|Calcium)[:\s]*(\d+\.?\d*)/i, unit: 'mg/dL', range: [8.5, 10.5] },
            { test: 'Mg', pattern: /(?:Mg|Magnesium)[:\s]*(\d+\.?\d*)/i, unit: 'mg/dL', range: [1.7, 2.2] },
            { test: 'Phos', pattern: /(?:Phos|Phosph|PO4)[:\s]*(\d+\.?\d*)/i, unit: 'mg/dL', range: [2.5, 4.5] },
            
            // LFT
            { test: 'AST', pattern: /(?:AST|SGOT)[:\s]*(\d+)/i, unit: 'U/L', range: [10, 40] },
            { test: 'ALT', pattern: /(?:ALT|SGPT)[:\s]*(\d+)/i, unit: 'U/L', range: [7, 56] },
            { test: 'ALP', pattern: /(?:ALP|Alk\s*Phos)[:\s]*(\d+)/i, unit: 'U/L', range: [44, 147] },
            { test: 'T.Bili', pattern: /(?:T\.?\s*Bili|Total\s*Bilirubin)[:\s]*(\d+\.?\d*)/i, unit: 'mg/dL', range: [0.1, 1.2] },
            { test: 'D.Bili', pattern: /(?:D\.?\s*Bili|Direct\s*Bilirubin)[:\s]*(\d+\.?\d*)/i, unit: 'mg/dL', range: [0, 0.3] },
            { test: 'Albumin', pattern: /Albumin[:\s]*(\d+\.?\d*)/i, unit: 'g/dL', range: [3.5, 5.0] },
            { test: 'Protein', pattern: /(?:Total\s*)?Protein[:\s]*(\d+\.?\d*)/i, unit: 'g/dL', range: [6.0, 8.3] },
            
            // Coagulation
            { test: 'PT', pattern: /\bPT[:\s]*(\d+\.?\d*)/i, unit: 'sec', range: [11, 13.5] },
            { test: 'INR', pattern: /INR[:\s]*(\d+\.?\d*)/i, unit: '', range: [0.8, 1.1] },
            { test: 'PTT', pattern: /(?:PTT|aPTT)[:\s]*(\d+\.?\d*)/i, unit: 'sec', range: [25, 35] },
            
            // Glucose/Diabetes
            { test: 'Glucose', pattern: /(?:Glucose|GLU|FBS|RBS)[:\s]*(\d+)/i, unit: 'mg/dL', range: [70, 100] },
            { test: 'HbA1c', pattern: /(?:HbA1c|A1C|Glycated)[:\s]*(\d+\.?\d*)/i, unit: '%', range: [4, 5.6] },
            
            // Cardiac
            { test: 'Troponin', pattern: /(?:Troponin|TnI|TnT)[:\s]*(\d+\.?\d*)/i, unit: 'ng/mL', range: [0, 0.04] },
            { test: 'BNP', pattern: /(?:BNP|proBNP)[:\s]*(\d+)/i, unit: 'pg/mL', range: [0, 100] },
            { test: 'CK', pattern: /\bCK[:\s]*(\d+)/i, unit: 'U/L', range: [30, 200] },
            { test: 'CK-MB', pattern: /CK-?MB[:\s]*(\d+\.?\d*)/i, unit: 'ng/mL', range: [0, 5] },
            
            // Inflammatory
            { test: 'CRP', pattern: /\bCRP[:\s]*(\d+\.?\d*)/i, unit: 'mg/L', range: [0, 10] },
            { test: 'ESR', pattern: /ESR[:\s]*(\d+)/i, unit: 'mm/hr', range: [0, 20] },
            { test: 'Procalcitonin', pattern: /(?:Procalcitonin|PCT)[:\s]*(\d+\.?\d*)/i, unit: 'ng/mL', range: [0, 0.1] },
            
            // Thyroid
            { test: 'TSH', pattern: /TSH[:\s]*(\d+\.?\d*)/i, unit: 'mIU/L', range: [0.4, 4.0] },
            { test: 'T4', pattern: /(?:Free\s*)?T4[:\s]*(\d+\.?\d*)/i, unit: 'ng/dL', range: [0.8, 1.8] },
            { test: 'T3', pattern: /(?:Free\s*)?T3[:\s]*(\d+\.?\d*)/i, unit: 'pg/mL', range: [2.3, 4.2] },
            
            // ABG
            { test: 'pH', pattern: /\bpH[:\s]*(\d+\.?\d*)/i, unit: '', range: [7.35, 7.45] },
            { test: 'pCO2', pattern: /pCO2[:\s]*(\d+\.?\d*)/i, unit: 'mmHg', range: [35, 45] },
            { test: 'pO2', pattern: /pO2[:\s]*(\d+\.?\d*)/i, unit: 'mmHg', range: [80, 100] },
            { test: 'Lactate', pattern: /Lactate[:\s]*(\d+\.?\d*)/i, unit: 'mmol/L', range: [0.5, 2.0] },
            
            // Lipids
            { test: 'Chol', pattern: /(?:Total\s*)?Cholesterol[:\s]*(\d+)/i, unit: 'mg/dL', range: [0, 200] },
            { test: 'LDL', pattern: /LDL[:\s]*(\d+)/i, unit: 'mg/dL', range: [0, 100] },
            { test: 'HDL', pattern: /HDL[:\s]*(\d+)/i, unit: 'mg/dL', range: [40, 60] },
            { test: 'TG', pattern: /(?:TG|Triglycerides)[:\s]*(\d+)/i, unit: 'mg/dL', range: [0, 150] },
            
            // Urine
            { test: 'U.Protein', pattern: /(?:Urine\s*)?Protein[:\s]*([\d.]+|\+{1,4}|negative|trace)/i, unit: '', range: null },
            { test: 'U.Blood', pattern: /(?:Urine\s*)?Blood[:\s]*([\d.]+|\+{1,4}|negative|trace)/i, unit: '', range: null },
        ];
        
        const values = [];
        const usedTests = new Set();
        
        for (const p of patterns) {
            if (usedTests.has(p.test)) continue;
            const match = text.match(p.pattern);
            if (match) {
                const val = parseFloat(match[1]) || match[1];
                let flag = '';
                if (p.range && typeof val === 'number') {
                    if (val < p.range[0]) flag = 'L';
                    else if (val > p.range[1]) flag = 'H';
                }
                values.push({ test: p.test, value: val, unit: p.unit, flag, range: p.range });
                usedTests.add(p.test);
            }
        }
        
        // Detect lab type
        let labType = 'General';
        const testNames = values.map(v => v.test);
        if (testNames.some(t => ['WBC', 'RBC', 'Hgb', 'Plt'].includes(t))) labType = 'CBC';
        else if (testNames.some(t => ['Cr', 'BUN', 'eGFR'].includes(t))) labType = 'RFT';
        else if (testNames.some(t => ['AST', 'ALT', 'ALP', 'T.Bili'].includes(t))) labType = 'LFT';
        else if (testNames.some(t => ['Na', 'K', 'Cl'].includes(t))) labType = 'Electrolytes';
        else if (testNames.some(t => ['pH', 'pCO2', 'pO2'].includes(t))) labType = 'ABG';
        else if (testNames.some(t => ['PT', 'INR', 'PTT'].includes(t))) labType = 'Coagulation';
        
        return { values, labType, reportType: 'Laboratory', source: 'regex' };
    };

    // ═══════════════════════════════════════════════════════════════════════
    // MAIN OCR + PARSE FUNCTION
    // ═══════════════════════════════════════════════════════════════════════
    const runOCR = async (imageSource, callbacks = {}) => {
        const { onProgress, onStage, onLog } = callbacks;
        
        try {
            let dataUrl = imageSource;
            
            // Compress if File
            if (imageSource instanceof File) {
                onStage?.('Compressing image...');
                onProgress?.(5);
                dataUrl = await compressImage(imageSource);
            }
            
            // Step 1: OCR with Vision API
            const ocrResult = await callVisionAPI(dataUrl, callbacks);

            if (!ocrResult.text || ocrResult.text.length < 10) {
                return {
                    text: ocrResult.text,
                    values: [],
                    labType: 'Unknown',
                    reportType: 'Unknown',
                    confidence: 0,
                    source: 'google_vision'
                };
            }

            // Step 1.5: Preprocess OCR text to remove unnecessary content
            onStage?.('Filtering unnecessary text...');
            onProgress?.(52);
            const rawText = ocrResult.text;
            const cleanedText = preprocessOCRText(rawText);
            const reductionPercent = Math.round((1 - cleanedText.length / rawText.length) * 100);
            onLog?.('info', `Text preprocessing: removed ${reductionPercent}% of non-lab content (${rawText.length} → ${cleanedText.length} chars)`);

            // Update OCR result with cleaned text
            ocrResult.text = cleanedText;
            ocrResult.rawText = rawText; // Keep original for reference

            // Step 2: Neural Document Type Detection
            onStage?.('Detecting document type...');
            onProgress?.(55);
            const docType = detectDocumentType(cleanedText);
            onLog?.('info', `Neural detection: ${docType} document`);

            let parseResult;

            // Step 3: Route to appropriate parser based on document type
            if (docType === 'IMAGING') {
                onStage?.('Parsing imaging report...');
                onProgress?.(70);
                parseResult = parseImagingReport(ocrResult.text);
                onLog?.('success', `Imaging report parsed - ${parseResult.findings?.length || 0} findings`);
            } else if (docType === 'PATHOLOGY') {
                onStage?.('Parsing pathology report...');
                onProgress?.(70);
                // For now, use imaging parser for pathology (can be enhanced later)
                parseResult = parseImagingReport(ocrResult.text);
                parseResult.reportType = 'Pathology';
                onLog?.('success', 'Pathology report parsed');
            } else if (docType === 'EKG') {
                onStage?.('Parsing EKG report...');
                onProgress?.(70);
                // For now, use imaging parser for EKG (can be enhanced later)
                parseResult = parseImagingReport(ocrResult.text);
                parseResult.reportType = 'EKG/ECG';
                onLog?.('success', 'EKG report parsed');
            } else {
                // LABORATORY or UNKNOWN - use advanced LabParser with neural analysis
                onStage?.('Parsing lab values with neural engine...');
                onProgress?.(60);

                // Check if LabParser module is available (enhanced neural parser)
                if (window.LabParser && window.LabParser.isReady) {
                    onLog?.('info', '🧠 Using advanced LabParser with neural analysis (cloud vision enhanced)');
                    parseResult = window.LabParser.parse(ocrResult.text, { includeNeural: true });
                    onLog?.('success', `Neural parser found ${parseResult.values.length} values with confidence scoring`);

                    // Add source info
                    parseResult.source = 'cloud_vision_neural';
                    parseResult.labType = parseResult.labType || 'GENERAL';
                    parseResult.reportType = parseResult.reportType || 'Laboratory';

                    // If neural analysis is available, log it
                    if (parseResult.neuralAnalysis) {
                        onLog?.('info', `🧠 Neural analysis: ${parseResult.neuralAnalysis.syndromes?.length || 0} syndromes detected`);
                    }
                } else {
                    // Fallback to basic regex if LabParser not available
                    onLog?.('warn', 'LabParser not available, falling back to basic regex');
                    const regexResult = parseWithRegex(ocrResult.text);
                    onLog?.('info', `Basic regex found ${regexResult.values.length} values`);
                    parseResult = regexResult;

                    // Only use Claude for complex cases where regex found < 5 values
                    if (CONFIG.USE_CLAUDE_PARSING && regexResult.values.length < 5) {
                        onLog?.('info', `Few values found (${regexResult.values.length}), trying Claude for better extraction...`);
                        const claudeResult = await parseWithClaude(ocrResult.text, callbacks);

                        // Use Claude result if it found more values
                        if (claudeResult && claudeResult.values && claudeResult.values.length > regexResult.values.length) {
                            onLog?.('success', `Claude found ${claudeResult.values.length} values (better than regex)`);
                            parseResult = claudeResult;
                        } else {
                            onLog?.('info', 'Using regex result (better or equal)');
                        }
                    }
                }
            }
            
            onProgress?.(100);
            onStage?.('Complete');

            return {
                text: ocrResult.text,
                values: parseResult.values || [],
                labType: parseResult.labType || 'General',
                reportType: parseResult.reportType || 'Unknown',
                confidence: ocrResult.confidence,
                source: parseResult.source || 'regex',
                summary: parseResult.summary || null,
                findings: parseResult.findings || null,
                impression: parseResult.impression || null,
                technique: parseResult.technique || null,
                indication: parseResult.indication || null,
                documentType: docType || 'LABORATORY',
                neuralAnalysis: parseResult.neuralAnalysis || null  // Include neural analysis from LabParser
            };
            
        } catch (err) {
            onLog?.('error', `OCR failed: ${err.message}`);
            throw err;
        }
    };

    // ═══════════════════════════════════════════════════════════════════════
    // EXPOSE GLOBAL API
    // ═══════════════════════════════════════════════════════════════════════
    window.OCREngine = {
        version: '4.1',
        runOCR,
        compressImage,
        callVisionAPI,
        parseWithClaude,
        parseWithRegex,
        preprocessOCRText,
        detectDocumentType,
        config: CONFIG,
        isReady: true,

        // Allow toggling Claude parsing
        enableClaudeParsing: () => { CONFIG.USE_CLAUDE_PARSING = true; },
        disableClaudeParsing: () => { CONFIG.USE_CLAUDE_PARSING = false; }
    };

    console.log('[OCREngine v4.1] Intelligent Clinical Report Parser with Text Filtering loaded');
})();
