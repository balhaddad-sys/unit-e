/* ═══════════════════════════════════════════════════════════════
   NEURAL OCR v5.0 - Auto-Detect Lab Type
   No manual selection - figures out what it's looking at
   ═══════════════════════════════════════════════════════════════ */

(function() {
    'use strict';

    const STORAGE_KEY = 'labocr_v5';
    
    // Complete test database with flexible ranges
    const TESTS = {
        // Hematology
        WBC:  { cat: 'CBC', min: 4, max: 11, unit: '10^9/L', dec: 1, range: [0.5, 50], names: ['WBC','WHITE','LEUKOCYTE','WCC','LEUCOCYTE','W.B.C','WHITE BLOOD'] },
        RBC:  { cat: 'CBC', min: 4, max: 6, unit: '10^12/L', dec: 2, range: [2, 8], names: ['RBC','RED','ERYTHROCYTE','R.B.C','RED BLOOD'] },
        HB:   { cat: 'CBC', min: 120, max: 170, unit: 'g/L', dec: 0, range: [50, 220], names: ['HB','HGB','HEMOGLOBIN','HAEMOGLOBIN','HG'] },
        HCT:  { cat: 'CBC', min: 36, max: 52, unit: '%', dec: 1, range: [15, 65], names: ['HCT','HEMATOCRIT','PCV','PACKED CELL'] },
        MCV:  { cat: 'CBC', min: 80, max: 100, unit: 'fL', dec: 1, range: [50, 130], names: ['MCV','MEAN CELL VOL','M.C.V'] },
        MCH:  { cat: 'CBC', min: 27, max: 33, unit: 'pg', dec: 1, range: [15, 45], names: ['MCH','MEAN CELL HB','M.C.H'] },
        MCHC: { cat: 'CBC', min: 32, max: 36, unit: 'g/dL', dec: 1, range: [25, 40], names: ['MCHC','M.C.H.C'] },
        RDW:  { cat: 'CBC', min: 11.5, max: 14.5, unit: '%', dec: 1, range: [8, 25], names: ['RDW','RDW-CV','RED DIST'] },
        PLT:  { cat: 'CBC', min: 150, max: 400, unit: '10^9/L', dec: 0, range: [20, 1200], names: ['PLT','PLATELET','PLATELETS','THROMBOCYTE'] },
        MPV:  { cat: 'CBC', min: 7, max: 11, unit: 'fL', dec: 1, range: [4, 15], names: ['MPV','MEAN PLATELET'] },
        
        // Chemistry / Renal (KFT)
        NA:   { cat: 'CHEM', min: 136, max: 145, unit: 'mmol/L', dec: 0, range: [110, 170], names: ['NA','SODIUM','NA+','NATRIUM'] },
        K:    { cat: 'CHEM', min: 3.5, max: 5.0, unit: 'mmol/L', dec: 1, range: [2, 8], names: ['K','POTASSIUM','K+','KALIUM'] },
        CL:   { cat: 'CHEM', min: 98, max: 107, unit: 'mmol/L', dec: 0, range: [80, 130], names: ['CL','CHLORIDE','CL-'] },
        CO2:  { cat: 'CHEM', min: 22, max: 29, unit: 'mmol/L', dec: 0, range: [10, 40], names: ['CO2','TCO2','BICARB','CARBON DIOXIDE'] },
        BUN:  { cat: 'CHEM', min: 7, max: 20, unit: 'mg/dL', dec: 0, range: [2, 80], names: ['BUN','BLOOD UREA NITROGEN'] },
        UREA: { cat: 'CHEM', min: 13, max: 43, unit: 'mg/dL', dec: 0, range: [5, 150], names: ['UREA','UREA NITROGEN'] },
        CR:   { cat: 'CHEM', min: 0.7, max: 1.3, unit: 'mg/dL', dec: 2, range: [0.2, 15], names: ['CR','CREATININE','CREAT','CREA'] },
        URIC: { cat: 'CHEM', min: 3.5, max: 7.2, unit: 'mg/dL', dec: 1, range: [1, 15], names: ['URIC','URIC ACID','URICACID'] },
        GLUCOSE: { cat: 'CHEM', min: 70, max: 100, unit: 'mg/dL', dec: 0, range: [30, 600], names: ['GLUCOSE','GLU','GLUC','SUGAR','BS','BG','FBS','RBS'] },
        CA:   { cat: 'CHEM', min: 8.5, max: 10.5, unit: 'mg/dL', dec: 1, range: [5, 15], names: ['CA','CALCIUM','CA++','CALCIUMTOTAL','TOTAL CALCIUM'] },
        MG:   { cat: 'CHEM', min: 1.7, max: 2.5, unit: 'mg/dL', dec: 1, range: [0.5, 5], names: ['MG','MAGNESIUM','MG++'] },
        PHOS: { cat: 'CHEM', min: 2.4, max: 5.1, unit: 'mg/dL', dec: 1, range: [1, 10], names: ['PHOS','PHOSPHORUS','PO4','PHOSPHATE'] },
        
        // Liver (LFT)
        ALT:  { cat: 'LFT', min: 7, max: 56, unit: 'U/L', dec: 0, range: [1, 2000], names: ['ALT','SGPT','GPT','ALANINE'] },
        AST:  { cat: 'LFT', min: 10, max: 40, unit: 'U/L', dec: 0, range: [1, 2000], names: ['AST','SGOT','GOT','ASPARTATE'] },
        ALP:  { cat: 'LFT', min: 30, max: 120, unit: 'U/L', dec: 0, range: [10, 1000], names: ['ALP','ALK PHOS','ALKALINE','ALKALINE PHOSPHATASE'] },
        GGT:  { cat: 'LFT', min: 9, max: 48, unit: 'U/L', dec: 0, range: [1, 1000], names: ['GGT','GAMMA GT','GAMMA'] },
        TBIL: { cat: 'LFT', min: 0.1, max: 1.2, unit: 'mg/dL', dec: 1, range: [0, 30], names: ['TBIL','BILIRUBIN','BILI','T.BILI','TOTAL BILI','TOTAL BILIRUBIN'] },
        DBIL: { cat: 'LFT', min: 0, max: 0.3, unit: 'mg/dL', dec: 2, range: [0, 20], names: ['DBIL','DIRECT BILI','D.BILI','DIRECT BILIRUBIN'] },
        ALB:  { cat: 'LFT', min: 3.2, max: 4.8, unit: 'g/dL', dec: 1, range: [1, 7], names: ['ALB','ALBUMIN'] },
        TP:   { cat: 'LFT', min: 5.7, max: 8.2, unit: 'g/dL', dec: 1, range: [3, 12], names: ['TP','TOTAL PROTEIN','PROTEIN','TOTALPROTEIN'] },
        
        // ABG
        PH:   { cat: 'ABG', min: 7.35, max: 7.45, unit: '', dec: 2, range: [6.8, 7.8], names: ['PH','BLOOD PH','ARTERIAL PH'] },
        PCO2: { cat: 'ABG', min: 35, max: 45, unit: 'mmHg', dec: 1, range: [15, 100], names: ['PCO2','PACO2','CO2'] },
        PO2:  { cat: 'ABG', min: 80, max: 100, unit: 'mmHg', dec: 0, range: [30, 500], names: ['PO2','PAO2','O2'] },
        HCO3: { cat: 'ABG', min: 22, max: 26, unit: 'mEq/L', dec: 1, range: [5, 45], names: ['HCO3','BICARBONATE','BICARB'] },
        BE:   { cat: 'ABG', min: -2, max: 2, unit: 'mEq/L', dec: 1, range: [-20, 20], neg: true, names: ['BE','BASE EXCESS','BASE EXC'] },
        SAO2: { cat: 'ABG', min: 95, max: 100, unit: '%', dec: 1, range: [50, 100], names: ['SAO2','SPO2','O2SAT','SAT','SATURATION'] },
        LAC:  { cat: 'ABG', min: 0.5, max: 2.0, unit: 'mmol/L', dec: 1, range: [0, 20], names: ['LAC','LACTATE','LACTIC'] },
        
        // Coagulation
        PT:   { cat: 'COAG', min: 11, max: 13.5, unit: 'sec', dec: 1, range: [8, 50], names: ['PT','PROTHROMBIN','PRO TIME'] },
        INR:  { cat: 'COAG', min: 0.9, max: 1.1, unit: '', dec: 2, range: [0.5, 10], names: ['INR'] },
        PTT:  { cat: 'COAG', min: 25, max: 35, unit: 'sec', dec: 1, range: [15, 120], names: ['PTT','APTT','ACTIVATED PTT'] },
        FIB:  { cat: 'COAG', min: 200, max: 400, unit: 'mg/dL', dec: 0, range: [50, 1000], names: ['FIB','FIBRINOGEN'] },
        DIMER:{ cat: 'COAG', min: 0, max: 0.5, unit: 'mg/L', dec: 2, range: [0, 50], names: ['DIMER','D-DIMER','DDIMER'] },
        
        // Cardiac
        TROP: { cat: 'CARDIAC', min: 0, max: 0.04, unit: 'ng/mL', dec: 3, range: [0, 50], names: ['TROP','TROPONIN','TNI','TNT','HS-TROP','HSTROP'] },
        CK:   { cat: 'CARDIAC', min: 30, max: 200, unit: 'U/L', dec: 0, range: [10, 10000], names: ['CK','CPK','CREATINE KINASE'] },
        CKMB: { cat: 'CARDIAC', min: 0, max: 25, unit: 'U/L', dec: 0, range: [0, 500], names: ['CKMB','CK-MB','CK MB'] },
        BNP:  { cat: 'CARDIAC', min: 0, max: 100, unit: 'pg/mL', dec: 0, range: [0, 30000], names: ['BNP','NT-PROBNP','PROBNP'] },
        
        // Inflammatory
        CRP:  { cat: 'INFLAM', min: 0, max: 0.5, unit: 'mg/dL', dec: 2, range: [0, 50], names: ['CRP','C-REACTIVE','C REACTIVE'] },
        ESR:  { cat: 'INFLAM', min: 0, max: 20, unit: 'mm/hr', dec: 0, range: [0, 140], names: ['ESR','SED RATE','SEDIMENTATION'] },
        PCT:  { cat: 'INFLAM', min: 0, max: 0.1, unit: 'ng/mL', dec: 2, range: [0, 100], names: ['PCT','PROCALCITONIN'] },
        
        // Thyroid
        TSH:  { cat: 'THYROID', min: 0.4, max: 4.0, unit: 'mIU/L', dec: 2, range: [0, 100], names: ['TSH'] },
        T3:   { cat: 'THYROID', min: 80, max: 200, unit: 'ng/dL', dec: 0, range: [20, 500], names: ['T3','FT3','FREE T3'] },
        T4:   { cat: 'THYROID', min: 5, max: 12, unit: 'μg/dL', dec: 1, range: [1, 25], names: ['T4','FT4','FREE T4','THYROXINE'] }
    };

    // Learned patterns
    let learned = {};
    
    function load() {
        try { learned = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch(e) { learned = {}; }
    }
    
    function save() {
        try {
            const keys = Object.keys(learned);
            if (keys.length > 300) {
                const keep = keys.sort((a,b) => (learned[b].n||0) - (learned[a].n||0)).slice(0, 300);
                learned = Object.fromEntries(keep.map(k => [k, learned[k]]));
            }
            localStorage.setItem(STORAGE_KEY, JSON.stringify(learned));
        } catch(e) {}
    }

    // Smart test name recognition
    function identifyTest(raw) {
        if (!raw) return null;
        const original = String(raw).trim();
        const input = original.toUpperCase().replace(/[^A-Z0-9\s]/g, '').trim();
        if (!input || input.length < 1) return null;
        
        // Direct match (exact)
        if (TESTS[input]) return { test: input, conf: 100 };
        
        // Clean version without spaces
        const noSpace = input.replace(/\s+/g, '');
        if (TESTS[noSpace]) return { test: noSpace, conf: 98 };
        
        // Search all aliases (including multi-word)
        for (const [name, data] of Object.entries(TESTS)) {
            for (const alias of data.names) {
                const cleanAlias = alias.toUpperCase().replace(/[^A-Z0-9\s]/g, '').trim();
                const cleanAliasNoSpace = cleanAlias.replace(/\s+/g, '');
                
                // Exact match with alias
                if (input === cleanAlias || input === cleanAliasNoSpace) return { test: name, conf: 98 };
                if (noSpace === cleanAliasNoSpace) return { test: name, conf: 95 };
                
                // Input contains full alias or vice versa
                if (input.includes(cleanAlias) && cleanAlias.length >= 3) return { test: name, conf: 90 };
                if (cleanAlias.includes(input) && input.length >= 3) return { test: name, conf: 85 };
                
                // Word-start match (e.g., "CREAT" matches "CREATININE")
                if (cleanAliasNoSpace.startsWith(noSpace) && noSpace.length >= 3) return { test: name, conf: 82 };
            }
        }
        
        // Fuzzy match for close matches
        let best = null, bestScore = 0;
        for (const [name, data] of Object.entries(TESTS)) {
            const sim = similarity(noSpace, name);
            if (sim > bestScore && sim > 0.7) {
                bestScore = sim;
                best = name;
            }
            for (const alias of data.names) {
                const asim = similarity(noSpace, alias.replace(/[^A-Z0-9]/gi, '').toUpperCase());
                if (asim > bestScore && asim > 0.7) {
                    bestScore = asim;
                    best = name;
                }
            }
        }
        
        if (best) return { test: best, conf: Math.round(bestScore * 100) };
        return null;
    }
    
    // String similarity (Jaro-Winkler inspired, simplified)
    function similarity(a, b) {
        if (!a || !b) return 0;
        if (a === b) return 1;
        const longer = a.length > b.length ? a : b;
        const shorter = a.length > b.length ? b : a;
        if (longer.length === 0) return 1;
        
        // Count matching characters
        let matches = 0;
        for (let i = 0; i < shorter.length; i++) {
            if (longer.includes(shorter[i])) matches++;
        }
        
        // Penalize length difference
        const lenPenalty = 1 - Math.abs(a.length - b.length) / Math.max(a.length, b.length);
        
        // Bonus for same start
        let prefix = 0;
        for (let i = 0; i < Math.min(3, shorter.length); i++) {
            if (a[i] === b[i]) prefix++;
            else break;
        }
        
        return (matches / longer.length) * 0.6 + lenPenalty * 0.25 + (prefix / 3) * 0.15;
    }

    // Parse number from OCR text
    function parseValue(raw, allowNeg = false) {
        if (raw == null || raw === '') return null;
        let s = String(raw).trim();
        
        // Handle negative
        const neg = allowNeg && /^[-−]/.test(s);
        s = s.replace(/^[-−]/, '');
        
        // OCR fixes
        const fixes = { 'O': '0', 'o': '0', 'l': '1', 'I': '1', 'S': '5', 'Z': '2', 'B': '8', 'D': '0' };
        s = s.split('').map(c => fixes[c] || c).join('');
        
        // Extract number
        s = s.replace(/[^0-9.]/g, '');
        const parts = s.split('.');
        if (parts.length > 2) s = parts[0] + '.' + parts.slice(1).join('');
        
        const num = parseFloat(s);
        return isNaN(num) ? null : (neg ? -num : num);
    }

    // Intelligent value correction
    function correctValue(test, raw, data) {
        const result = { 
            value: null, 
            raw: raw, 
            conf: 50, 
            status: 'UNKNOWN', 
            flag: '?',
            corrected: false 
        };
        
        // Check learned patterns first
        const key = `${test}|${raw}`;
        if (learned[key]) {
            learned[key].n = (learned[key].n || 0) + 1;
            save();
            result.value = learned[key].v;
            result.conf = Math.min(98, 80 + learned[key].n * 2);
            result.status = 'LEARNED';
            result.corrected = true;
            return finalize(result, data);
        }
        
        let num = parseValue(raw, data.neg);
        if (num === null) {
            result.status = 'ERROR';
            return result;
        }
        
        const { min, max, range, dec } = data;
        const [lo, hi] = range;
        
        // Already valid
        if (num >= lo && num <= hi) {
            result.value = round(num, dec);
            result.conf = 90;
            result.status = 'OK';
            return finalize(result, data);
        }
        
        // Try corrections
        const candidates = [];
        
        // Decimal point missing: 51 → 5.1
        if (num > hi) {
            [10, 100, 1000].forEach(d => {
                const fixed = num / d;
                if (fixed >= lo && fixed <= hi) {
                    candidates.push({ v: round(fixed, dec), c: 85 - (d > 10 ? 10 : 0), r: `÷${d}` });
                }
            });
        }
        
        // Missing digit: 14 → 140
        if (num < lo) {
            [10, 100].forEach(m => {
                const fixed = num * m;
                if (fixed >= lo && fixed <= hi) {
                    candidates.push({ v: round(fixed, dec), c: 80 - (m > 10 ? 10 : 0), r: `×${m}` });
                }
            });
        }
        
        // Special: HCT often read as 42 instead of 0.42 or 42%
        if (test === 'HCT' && num > 1 && num < 70) {
            // Keep as percentage if in range
            if (num >= 15 && num <= 65) {
                result.value = round(num, 1);
                result.conf = 88;
                result.status = 'OK';
                return finalize(result, data);
            }
        }
        
        // Special: pH 735 → 7.35
        if (test === 'PH' && num > 100 && num < 800) {
            const fixed = num / 100;
            if (fixed >= 6.8 && fixed <= 7.8) {
                candidates.push({ v: round(fixed, 2), c: 90, r: 'pH' });
            }
        }
        
        // Special: INR 11 → 1.1
        if (test === 'INR' && num > 5 && num < 100) {
            const fixed = num / 10;
            if (fixed >= 0.5 && fixed <= 10) {
                candidates.push({ v: round(fixed, 2), c: 85, r: 'INR' });
            }
        }
        
        // Pick best candidate
        if (candidates.length > 0) {
            candidates.sort((a, b) => b.c - a.c);
            const best = candidates[0];
            result.value = best.v;
            result.conf = best.c;
            result.status = 'AUTO_FIX';
            result.reason = best.r;
            result.corrected = true;
            return finalize(result, data);
        }
        
        // Accept if close to range
        if (num >= lo * 0.5 && num <= hi * 2) {
            result.value = round(num, dec);
            result.conf = 55;
            result.status = 'UNCERTAIN';
            return finalize(result, data);
        }
        
        // Can't fix
        result.status = 'ERROR';
        result.conf = 10;
        return result;
    }
    
    function round(n, dec) {
        const f = Math.pow(10, dec);
        return Math.round(n * f) / f;
    }
    
    function finalize(result, data) {
        if (result.value != null) {
            const v = parseFloat(result.value);
            result.flag = v < data.min ? 'L' : v > data.max ? 'H' : 'N';
            result.unit = data.unit;
            result.ref = `${data.min}-${data.max}`;
            result.refLow = data.min;
            result.refHigh = data.max;
        }
        return result;
    }

    // Main API
    window.LabOCR = {
        version: '5.0',
        isReady: false,
        
        init() {
            load();
            this.isReady = true;
            console.log(`%c[LabOCR v5] Auto-Detect Ready • ${Object.keys(learned).length} learned`, 'color:#0f0;font-weight:bold');
            return true;
        },
        
        // Process raw OCR results - auto-detects lab type
        process(items) {
            const results = [];
            const detected = {};
            
            for (const item of items) {
                const rawTest = item.test || item.name || item.label || '';
                const rawValue = item.value || item.result || '';
                
                // Skip empty
                if (!rawTest && !rawValue) continue;
                
                // Identify test
                const match = identifyTest(rawTest);
                if (!match) {
                    // Store unrecognized for learning
                    results.push({ 
                        test: rawTest, 
                        value: rawValue, 
                        rawOcr: rawValue,
                        status: 'UNKNOWN', 
                        confidence: 15, 
                        flag: '?',
                        needsReview: true
                    });
                    continue;
                }
                
                const testData = TESTS[match.test];
                detected[testData.cat] = (detected[testData.cat] || 0) + 1;
                
                // Correct value
                const correction = correctValue(match.test, rawValue, testData);
                
                results.push({
                    test: match.test,
                    originalTest: rawTest !== match.test ? rawTest : undefined,
                    value: correction.value != null ? String(correction.value) : null,
                    rawOcr: rawValue,
                    unit: correction.unit || testData.unit,
                    reference: correction.ref,
                    refLow: correction.refLow,
                    refHigh: correction.refHigh,
                    flag: correction.flag,
                    confidence: Math.round((match.conf + correction.conf) / 2),
                    status: correction.status,
                    corrected: correction.corrected,
                    reason: correction.reason,
                    category: testData.cat,
                    needsReview: correction.status === 'ERROR' || correction.conf < 50
                });
            }
            
            // Determine detected lab type
            const labType = Object.entries(detected).sort((a, b) => b[1] - a[1])[0]?.[0] || 'MIXED';
            
            console.log(`[LabOCR] Detected: ${labType} panel, ${results.length} values`);
            return { results, labType, stats: detected };
        },
        
        // Alias for compatibility
        processVisionResults(items, _ignored) {
            return this.process(items).results;
        },
        
        // Learn from correction
        learn(test, rawOcr, correctedValue) {
            const key = `${test.toUpperCase()}|${rawOcr}`;
            learned[key] = { v: correctedValue, n: (learned[key]?.n || 0) + 1, t: Date.now() };
            save();
            console.log(`[LabOCR] Learned: ${test} "${rawOcr}" → "${correctedValue}"`);
        },
        
        // Alias
        learnCorrection(test, rawOcr, correctedValue) {
            this.learn(test, rawOcr, correctedValue);
        },
        
        getStats() {
            return { 
                patterns: Object.keys(learned).length, 
                version: this.version,
                tests: Object.keys(TESTS).length
            };
        },
        
        clearLearning() {
            learned = {};
            localStorage.removeItem(STORAGE_KEY);
            console.log('[LabOCR] Learning cleared');
        },
        
        identify(input) {
            return identifyTest(input);
        },
        
        getTest(name) {
            return TESTS[name.toUpperCase()] || null;
        },
        
        getAllTests() {
            return Object.keys(TESTS);
        }
    };

    // Auto-init
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => window.LabOCR.init());
    } else {
        window.LabOCR.init();
    }
    
    // Test function
    window.testOCR = function() {
        const samples = [
            // KFT Panel (from image)
            { test: 'Urea', value: '15' },
            { test: 'Creatinine', value: '1.5' },
            { test: 'Uric Acid', value: '5.5' },
            { test: 'Calcium, Total', value: '10.2' },
            { test: 'Phosphorus', value: '1.4' },
            { test: 'Alkaline Phosphatase (ALP)', value: '80' },
            { test: 'Total Protein', value: '5.9' },
            { test: 'Albumin', value: '4.1' },
            { test: 'Sodium', value: '139' },
            { test: 'Potassium', value: '3.9' },
            { test: 'Chloride', value: '100' },
            // CBC
            { test: 'WBC', value: '8.5' },
            { test: 'HGB', value: '125' },
            // ABG
            { test: 'PH', value: '735' },        // → 7.35
            { test: 'BE', value: '-3' }
        ];
        
        console.log('%c[TEST INPUT]', 'color: yellow; font-weight: bold');
        console.table(samples);
        
        const { results, labType, stats } = window.LabOCR.process(samples);
        
        console.log('%c[DETECTED]', 'color: cyan; font-weight: bold', labType, stats);
        console.log('%c[RESULTS]', 'color: #0f0; font-weight: bold');
        console.table(results.map(r => ({
            test: r.test,
            original: r.originalTest,
            raw: r.rawOcr,
            value: r.value,
            flag: r.flag,
            status: r.status,
            conf: r.confidence + '%',
            cat: r.category
        })));
        
        return results;
    };

})();
