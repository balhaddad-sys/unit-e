/* ═══════════════════════════════════════════════════════════════════════════
   LAB PARSER v3.0 - Laboratory Value Extraction & Normalization
   Standalone module for parsing OCR text into structured lab values
   ═══════════════════════════════════════════════════════════════════════════ */

(function() {
    'use strict';

    // ═══════════════════════════════════════════════════════════════════════
    // TEST NAME MAPPINGS (lowercase keys → standard codes)
    // ═══════════════════════════════════════════════════════════════════════
    const TEST_MAPPINGS = {
        // CBC / Hematology
        'wbc': 'WBC', 'white blood cell': 'WBC', 'white blood cells': 'WBC', 
        'leukocyte': 'WBC', 'leucocyte': 'WBC', 'w.b.c': 'WBC', 'leukocytes': 'WBC',
        'rbc': 'RBC', 'red blood cell': 'RBC', 'red blood cells': 'RBC', 
        'erythrocyte': 'RBC', 'r.b.c': 'RBC', 'erythrocytes': 'RBC',
        'hemoglobin': 'HB', 'haemoglobin': 'HB', 'hb': 'HB', 'hgb': 'HB',
        'hematocrit': 'HCT', 'haematocrit': 'HCT', 'hct': 'HCT', 
        'pcv': 'HCT', 'packed cell volume': 'HCT',
        'mcv': 'MCV', 'mean cell volume': 'MCV', 'mean corpuscular volume': 'MCV',
        'mch': 'MCH', 'mean cell hemoglobin': 'MCH', 'mean corpuscular hemoglobin': 'MCH',
        'mchc': 'MCHC', 'mean cell hb conc': 'MCHC', 'mean corpuscular hb concentration': 'MCHC',
        'rdw': 'RDW', 'rdw-cv': 'RDW', 'red cell distribution': 'RDW', 'rdw cv': 'RDW',
        'platelet': 'PLT', 'platelets': 'PLT', 'plt': 'PLT', 
        'thrombocyte': 'PLT', 'platelet count': 'PLT', 'thrombocytes': 'PLT',
        'mpv': 'MPV', 'mean platelet volume': 'MPV',
        'neutrophil': 'NEUT', 'neutrophils': 'NEUT', 'neut': 'NEUT',
        'lymphocyte': 'LYMPH', 'lymphocytes': 'LYMPH', 'lymph': 'LYMPH',
        'monocyte': 'MONO', 'monocytes': 'MONO', 'mono': 'MONO',
        'eosinophil': 'EOS', 'eosinophils': 'EOS', 'eos': 'EOS',
        'basophil': 'BASO', 'basophils': 'BASO', 'baso': 'BASO',
        
        // Chemistry / Renal / KFT
        'sodium': 'NA', 'na': 'NA', 'na+': 'NA', 'serum sodium': 'NA',
        'potassium': 'K', 'k': 'K', 'k+': 'K', 'serum potassium': 'K',
        'chloride': 'CL', 'cl': 'CL', 'cl-': 'CL', 'serum chloride': 'CL',
        'co2': 'CO2', 'tco2': 'CO2', 'total co2': 'CO2',
        'bicarbonate': 'HCO3', 'hco3': 'HCO3', 'bicarb': 'HCO3',
        'urea': 'UREA', 'blood urea': 'UREA', 'bun': 'UREA', 
        'blood urea nitrogen': 'UREA', 'serum urea': 'UREA',
        'creatinine': 'CR', 'creat': 'CR', 'serum creatinine': 'CR', 
        'cr': 'CR', 'crea': 'CR', 's creatinine': 'CR', 's. creatinine': 'CR',
        'uric acid': 'URIC', 'uric': 'URIC', 'serum uric acid': 'URIC',
        'glucose': 'GLUCOSE', 'blood sugar': 'GLUCOSE', 'sugar': 'GLUCOSE', 
        'glu': 'GLUCOSE', 'fbs': 'GLUCOSE', 'rbs': 'GLUCOSE', 
        'blood glucose': 'GLUCOSE', 'fasting glucose': 'GLUCOSE',
        'calcium': 'CA', 'ca': 'CA', 'total calcium': 'CA', 
        'calcium total': 'CA', 'serum calcium': 'CA', 'ca total': 'CA',
        'magnesium': 'MG', 'mg': 'MG', 'serum magnesium': 'MG',
        'phosphorus': 'PHOS', 'phosphate': 'PHOS', 'phos': 'PHOS', 
        'po4': 'PHOS', 'inorganic phosphorus': 'PHOS', 'phosphorous': 'PHOS',
        
        // LFT / Liver
        'alt': 'ALT', 'sgpt': 'ALT', 'alanine aminotransferase': 'ALT', 
        'alanine transaminase': 'ALT', 's.g.p.t': 'ALT',
        'ast': 'AST', 'sgot': 'AST', 'aspartate aminotransferase': 'AST', 
        'aspartate transaminase': 'AST', 's.g.o.t': 'AST',
        'alp': 'ALP', 'alkaline phosphatase': 'ALP', 'alk phos': 'ALP', 
        'alk. phosphatase': 'ALP', 'alk phosphatase': 'ALP',
        'ggt': 'GGT', 'gamma gt': 'GGT', 'gamma-gt': 'GGT', 
        'gamma glutamyl': 'GGT', 'γgt': 'GGT', 'γ-gt': 'GGT',
        'bilirubin': 'TBIL', 'total bilirubin': 'TBIL', 'tbil': 'TBIL', 
        't. bilirubin': 'TBIL', 't.bil': 'TBIL', 'serum bilirubin': 'TBIL',
        't bilirubin': 'TBIL', 'bilirubin total': 'TBIL',
        'direct bilirubin': 'DBIL', 'd. bilirubin': 'DBIL', 'dbil': 'DBIL', 
        'd.bil': 'DBIL', 'd bilirubin': 'DBIL', 'bilirubin direct': 'DBIL',
        'indirect bilirubin': 'IBIL', 'unconjugated bilirubin': 'IBIL',
        'albumin': 'ALB', 'alb': 'ALB', 'serum albumin': 'ALB',
        'total protein': 'TP', 'protein': 'TP', 'tp': 'TP', 
        'serum protein': 'TP', 't protein': 'TP', 'protein total': 'TP',
        'globulin': 'GLOB', 'glob': 'GLOB',
        
        // Coagulation
        'pt': 'PT', 'prothrombin time': 'PT', 'prothrombin': 'PT',
        'inr': 'INR', 'international normalized ratio': 'INR',
        'ptt': 'PTT', 'aptt': 'PTT', 'activated ptt': 'PTT', 
        'partial thromboplastin': 'PTT', 'activated partial thromboplastin': 'PTT',
        'd-dimer': 'DIMER', 'd dimer': 'DIMER', 'ddimer': 'DIMER',
        'fibrinogen': 'FIB', 'fibrin': 'FIB',
        
        // ABG / Blood Gas
        'ph': 'PH', 'blood ph': 'PH', 'arterial ph': 'PH',
        'pco2': 'PCO2', 'paco2': 'PCO2', 'partial co2': 'PCO2',
        'po2': 'PO2', 'pao2': 'PO2', 'partial o2': 'PO2',
        'lactate': 'LAC', 'lactic acid': 'LAC', 'lactic': 'LAC',
        'base excess': 'BE', 'be': 'BE',
        'sao2': 'SAO2', 'o2 sat': 'SAO2', 'oxygen saturation': 'SAO2',
        
        // Cardiac
        'troponin': 'TROP', 'trop': 'TROP', 'tni': 'TROP', 'tnt': 'TROP', 
        'hs-trop': 'TROP', 'troponin i': 'TROP', 'troponin t': 'TROP',
        'hs troponin': 'TROP', 'high sensitivity troponin': 'TROP',
        'bnp': 'BNP', 'nt-probnp': 'BNP', 'pro-bnp': 'BNP', 'nt probnp': 'BNP',
        'ck': 'CK', 'cpk': 'CK', 'creatine kinase': 'CK',
        'ckmb': 'CKMB', 'ck-mb': 'CKMB', 'ck mb': 'CKMB',
        'ldh': 'LDH', 'lactate dehydrogenase': 'LDH',
        
        // Thyroid
        'tsh': 'TSH', 'thyroid stimulating': 'TSH', 'thyroid stimulating hormone': 'TSH',
        't3': 'T3', 'ft3': 'T3', 'free t3': 'T3', 'triiodothyronine': 'T3',
        't4': 'T4', 'ft4': 'T4', 'free t4': 'T4', 'thyroxine': 'T4',
        
        // Inflammatory / Infection
        'crp': 'CRP', 'c-reactive protein': 'CRP', 'c reactive protein': 'CRP',
        'esr': 'ESR', 'sed rate': 'ESR', 'sedimentation rate': 'ESR',
        'procalcitonin': 'PCT', 'pct': 'PCT',
        'ferritin': 'FERR', 'serum ferritin': 'FERR',
        
        // Iron Studies
        'iron': 'FE', 'serum iron': 'FE', 'fe': 'FE',
        'tibc': 'TIBC', 'total iron binding': 'TIBC',
        'transferrin': 'TRANS', 'transferrin saturation': 'TSAT',
        
        // Lipids
        'cholesterol': 'CHOL', 'total cholesterol': 'CHOL',
        'triglycerides': 'TG', 'triglyceride': 'TG', 'tg': 'TG',
        'hdl': 'HDL', 'hdl cholesterol': 'HDL', 'hdl-c': 'HDL',
        'ldl': 'LDL', 'ldl cholesterol': 'LDL', 'ldl-c': 'LDL',
        
        // HbA1c
        'hba1c': 'HBA1C', 'a1c': 'HBA1C', 'glycated hemoglobin': 'HBA1C',
        'hemoglobin a1c': 'HBA1C', 'glycosylated hemoglobin': 'HBA1C',
        
        // Ammonia
        'ammonia': 'NH3', 'nh3': 'NH3', 'serum ammonia': 'NH3',
        
        // GFR
        'egfr': 'EGFR', 'gfr': 'EGFR', 'estimated gfr': 'EGFR'
    };

    // ═══════════════════════════════════════════════════════════════════════
    // REFERENCE RANGES (for flagging)
    // ═══════════════════════════════════════════════════════════════════════
    const REFERENCE_RANGES = {
        WBC: { min: 4.0, max: 11.0, unit: '10^9/L' },
        RBC: { min: 4.0, max: 6.0, unit: '10^12/L' },
        HB: { min: 120, max: 170, unit: 'g/L' },
        HCT: { min: 36, max: 52, unit: '%' },
        MCV: { min: 80, max: 100, unit: 'fL' },
        MCH: { min: 27, max: 33, unit: 'pg' },
        MCHC: { min: 32, max: 36, unit: 'g/dL' },
        RDW: { min: 11.5, max: 14.5, unit: '%' },
        PLT: { min: 150, max: 400, unit: '10^9/L' },
        MPV: { min: 7, max: 11, unit: 'fL' },
        NA: { min: 136, max: 145, unit: 'mmol/L' },
        K: { min: 3.5, max: 5.0, unit: 'mmol/L' },
        CL: { min: 98, max: 107, unit: 'mmol/L' },
        CO2: { min: 22, max: 29, unit: 'mmol/L' },
        HCO3: { min: 22, max: 26, unit: 'mEq/L' },
        UREA: { min: 7, max: 20, unit: 'mg/dL' },
        CR: { min: 0.7, max: 1.3, unit: 'mg/dL' },
        URIC: { min: 3.5, max: 7.2, unit: 'mg/dL' },
        GLUCOSE: { min: 70, max: 100, unit: 'mg/dL' },
        CA: { min: 8.5, max: 10.5, unit: 'mg/dL' },
        MG: { min: 1.7, max: 2.5, unit: 'mg/dL' },
        PHOS: { min: 2.4, max: 5.1, unit: 'mg/dL' },
        ALT: { min: 7, max: 56, unit: 'U/L' },
        AST: { min: 10, max: 40, unit: 'U/L' },
        ALP: { min: 30, max: 120, unit: 'U/L' },
        GGT: { min: 9, max: 48, unit: 'U/L' },
        TBIL: { min: 0.1, max: 1.2, unit: 'mg/dL' },
        DBIL: { min: 0, max: 0.3, unit: 'mg/dL' },
        ALB: { min: 3.2, max: 4.8, unit: 'g/dL' },
        TP: { min: 5.7, max: 8.2, unit: 'g/dL' },
        PT: { min: 11, max: 13.5, unit: 'sec' },
        INR: { min: 0.9, max: 1.1, unit: '' },
        PTT: { min: 25, max: 35, unit: 'sec' },
        PH: { min: 7.35, max: 7.45, unit: '' },
        PCO2: { min: 35, max: 45, unit: 'mmHg' },
        PO2: { min: 80, max: 100, unit: 'mmHg' },
        LAC: { min: 0.5, max: 2.0, unit: 'mmol/L' },
        TSH: { min: 0.4, max: 4.0, unit: 'mIU/L' },
        CRP: { min: 0, max: 0.5, unit: 'mg/dL' },
        TROP: { min: 0, max: 0.04, unit: 'ng/mL' }
    };

    // ═══════════════════════════════════════════════════════════════════════
    // SKIP PATTERNS (metadata, headers)
    // ═══════════════════════════════════════════════════════════════════════
    const SKIP_PATTERNS = /^(age|sex|gender|patient|name|mrn|id|date|time|page|ref|range|collected|reported|sample|specimen|hospital|lab|report|doctor|technician|result|value|unit|investigation|normal|method|thanks|copyright|generated|drlogy|pathology|primary|serum|plasma|blood|urine|csf|male|female|years?|old|collection|mmol|mg|dl|fl|pg|ul|ml|cells|mm3|10\^|iu|umol|nmol|pmol|reference|status|flag|note)/i;

    // ═══════════════════════════════════════════════════════════════════════
    // FIND TEST NAME IN MAPPINGS
    // ═══════════════════════════════════════════════════════════════════════
    const findTest = (name) => {
        const normalized = name.toLowerCase()
            .replace(/[^a-z0-9\s\+\-]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
        
        // Direct match
        if (TEST_MAPPINGS[normalized]) return TEST_MAPPINGS[normalized];
        
        // Without trailing numbers
        const cleaned = normalized.replace(/\s*\d+$/, '').trim();
        if (TEST_MAPPINGS[cleaned]) return TEST_MAPPINGS[cleaned];
        
        // Try each word
        const words = normalized.split(' ');
        for (const word of words) {
            if (word.length >= 2 && TEST_MAPPINGS[word]) return TEST_MAPPINGS[word];
        }
        
        // First two words
        if (words.length >= 2) {
            const twoWords = words.slice(0, 2).join(' ');
            if (TEST_MAPPINGS[twoWords]) return TEST_MAPPINGS[twoWords];
        }
        
        // Partial match (only for patterns >= 3 chars)
        for (const [pattern, mapped] of Object.entries(TEST_MAPPINGS)) {
            if (pattern.length >= 3 && (normalized.includes(pattern) || pattern.includes(normalized))) {
                return mapped;
            }
        }
        
        return null;
    };

    // ═══════════════════════════════════════════════════════════════════════
    // DETERMINE FLAG BASED ON REFERENCE RANGE
    // ═══════════════════════════════════════════════════════════════════════
    const getFlag = (testCode, value) => {
        const ref = REFERENCE_RANGES[testCode];
        if (!ref) return 'N';
        
        const numVal = parseFloat(value);
        if (isNaN(numVal)) return 'N';
        
        if (numVal < ref.min) return 'L';
        if (numVal > ref.max) return 'H';
        return 'N';
    };

    // ═══════════════════════════════════════════════════════════════════════
    // MAIN PARSING FUNCTION
    // ═══════════════════════════════════════════════════════════════════════
    const parseLabText = (rawText) => {
        const items = [];
        const seen = new Set();
        const text = String(rawText || "");
        const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 2);
        
        console.log('[LabParser] Processing', lines.length, 'lines');
        
        // Process each line with multiple patterns
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            // Skip metadata
            if (SKIP_PATTERNS.test(line)) continue;
            if (/^\d{1,2}[\-\/\.]\d{1,2}[\-\/\.]\d{2,4}/.test(line)) continue;
            if (line.length < 3 || line.length > 100) continue;
            
            // Multiple regex patterns for different formats
            const patterns = [
                // Table: "Sodium    139    136-145"
                /^([A-Za-z][A-Za-z\s\.\-\(\),]{1,40}?)\s{2,}(\d+\.?\d*)\s*/,
                // Colon: "Sodium: 139"
                /^([A-Za-z][A-Za-z\s\.\-\(\),]{1,35}?)\s*:\s*(\d+\.?\d*)/,
                // Simple: "Na 139"
                /^([A-Za-z][A-Za-z0-9\.\-\+]{1,15})\s+(\d+\.?\d*)\s*$/,
                // Value first: "139 Sodium"
                /^(\d+\.?\d*)\s+([A-Za-z][A-Za-z\s]{2,25})$/,
                // Equals: "Sodium = 139"
                /^([A-Za-z][A-Za-z\s\.\-]{1,30}?)\s*=\s*(\d+\.?\d*)/,
                // Tab separated
                /^([A-Za-z][A-Za-z\s\.\-\(\)]{1,35})\t+(\d+\.?\d*)/,
                // With unit inline: "Sodium 139 mmol/L"
                /^([A-Za-z][A-Za-z\s\.\-]{1,30}?)\s+(\d+\.?\d*)\s*[a-zA-Z%\/\^]+/
            ];
            
            for (const regex of patterns) {
                const match = line.match(regex);
                if (match) {
                    let testName, value;
                    
                    // Handle value-first pattern
                    if (/^\d/.test(match[1])) {
                        value = match[1];
                        testName = match[2];
                    } else {
                        testName = match[1];
                        value = match[2];
                    }
                    
                    testName = testName.trim();
                    value = value.trim();
                    
                    // Skip if just numbers or too short
                    if (/^\d+$/.test(testName) || testName.length < 2) continue;
                    
                    const mapped = findTest(testName);
                    if (mapped && !seen.has(mapped)) {
                        const numVal = parseFloat(value);
                        if (!isNaN(numVal) && numVal >= 0 && numVal < 100000) {
                            seen.add(mapped);
                            const ref = REFERENCE_RANGES[mapped];
                            items.push({ 
                                test: mapped, 
                                value: value,
                                numValue: numVal,
                                originalName: testName,
                                flag: getFlag(mapped, value),
                                unit: ref?.unit || '',
                                refLow: ref?.min,
                                refHigh: ref?.max,
                                confidence: 85
                            });
                            console.log(`[LabParser] ✓ "${testName}" → ${mapped} = ${value}`);
                        }
                    }
                    break;
                }
            }
        }
        
        // Fallback: scan full text for known patterns
        if (items.length < 3) {
            console.log('[LabParser] Running fallback scan...');
            
            for (const [pattern, mapped] of Object.entries(TEST_MAPPINGS)) {
                if (seen.has(mapped) || pattern.length < 2) continue;
                
                const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regex = new RegExp(escaped + '[:\\s]+([\\d\\.]+)', 'i');
                const match = text.match(regex);
                
                if (match) {
                    const value = match[1];
                    const numVal = parseFloat(value);
                    if (!isNaN(numVal) && numVal >= 0 && numVal < 100000) {
                        seen.add(mapped);
                        const ref = REFERENCE_RANGES[mapped];
                        items.push({ 
                            test: mapped, 
                            value: value,
                            numValue: numVal,
                            originalName: pattern,
                            flag: getFlag(mapped, value),
                            unit: ref?.unit || '',
                            refLow: ref?.min,
                            refHigh: ref?.max,
                            confidence: 70
                        });
                        console.log(`[LabParser] ✓ Fallback: "${pattern}" → ${mapped} = ${value}`);
                    }
                }
            }
        }
        
        console.log(`[LabParser] Total extracted: ${items.length} values`);
        return items;
    };

    // ═══════════════════════════════════════════════════════════════════════
    // DETECT LAB TYPE
    // ═══════════════════════════════════════════════════════════════════════
    const detectLabType = (values) => {
        if (!values || values.length === 0) return 'UNKNOWN';
        
        const tests = new Set(values.map(v => v.test));
        
        // CBC markers
        const cbcMarkers = ['WBC', 'RBC', 'HB', 'HCT', 'PLT', 'MCV', 'MCH'];
        const cbcCount = cbcMarkers.filter(m => tests.has(m)).length;
        if (cbcCount >= 3) return 'CBC';
        
        // Renal/KFT markers
        const renalMarkers = ['UREA', 'CR', 'NA', 'K', 'CL'];
        const renalCount = renalMarkers.filter(m => tests.has(m)).length;
        if (renalCount >= 3) return 'KFT';
        
        // Liver/LFT markers
        const liverMarkers = ['ALT', 'AST', 'ALP', 'TBIL', 'ALB', 'GGT'];
        const liverCount = liverMarkers.filter(m => tests.has(m)).length;
        if (liverCount >= 3) return 'LFT';
        
        // ABG markers
        const abgMarkers = ['PH', 'PCO2', 'PO2', 'HCO3', 'LAC'];
        const abgCount = abgMarkers.filter(m => tests.has(m)).length;
        if (abgCount >= 2) return 'ABG';
        
        // Cardiac markers
        if (tests.has('TROP') || tests.has('BNP') || tests.has('CKMB')) return 'CARDIAC';
        
        // Thyroid markers
        if (tests.has('TSH') || tests.has('T3') || tests.has('T4')) return 'THYROID';
        
        // Coagulation
        if (tests.has('PT') || tests.has('INR') || tests.has('PTT')) return 'COAG';
        
        return 'MIXED';
    };

    // ═══════════════════════════════════════════════════════════════════════
    // EXPOSE GLOBAL API
    // ═══════════════════════════════════════════════════════════════════════
    window.LabParser = {
        version: '3.0',
        parse: parseLabText,
        detectLabType,
        findTest,
        getFlag,
        REFERENCE_RANGES,
        TEST_MAPPINGS,
        isReady: true
    };

    console.log('[LabParser v3.0] Laboratory value parser loaded');
})();
