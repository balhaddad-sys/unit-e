/* ═══════════════════════════════════════════════════════════════
   NEURAL OCR v4.0 - Compact Learning Engine
   ═══════════════════════════════════════════════════════════════ */

(function() {
    'use strict';

    const STORAGE_KEY = 'labocr_patterns';
    
    // Test definitions with ranges and common OCR errors
    const TESTS = {
        WBC:  { min: 4, max: 11, unit: '10^9/L', dec: 1, aliases: ['WHITE','LEUKOCYTE','WCC'], mistakes: ['WN','W8C','VBC'] },
        RBC:  { min: 4, max: 6, unit: '10^12/L', dec: 2, aliases: ['RED','ERYTHROCYTE'], mistakes: ['R8C','PBC'] },
        HB:   { min: 120, max: 170, unit: 'g/L', dec: 0, aliases: ['HGB','HEMOGLOBIN'], mistakes: ['H8','NB','HE'] },
        HCT:  { min: 0.36, max: 0.52, unit: 'L/L', dec: 2, aliases: ['HEMATOCRIT','PCV'], mistakes: ['HC1','NCT'] },
        MCV:  { min: 80, max: 100, unit: 'fL', dec: 1, aliases: ['MEAN CELL VOL'], mistakes: ['NCV','MC0'] },
        MCH:  { min: 27, max: 33, unit: 'pg', dec: 1, aliases: [], mistakes: ['NCH','MC4'] },
        MCHC: { min: 315, max: 360, unit: 'g/L', dec: 0, aliases: [], mistakes: ['MCNC'] },
        RDW:  { min: 11.5, max: 14.5, unit: '%', dec: 1, aliases: ['RDW-CV'], mistakes: ['ROW','RDN'] },
        PLT:  { min: 150, max: 400, unit: '10^9/L', dec: 0, aliases: ['PLATELET','PLATELETS'], mistakes: ['PL1','PIT','P1T'] },
        MPV:  { min: 7, max: 11, unit: 'fL', dec: 1, aliases: [], mistakes: ['NPV','MP0'] },
        NA:   { min: 136, max: 145, unit: 'mmol/L', dec: 0, aliases: ['SODIUM','NA+'], mistakes: ['N4','MA','NR'] },
        K:    { min: 3.5, max: 5.0, unit: 'mmol/L', dec: 1, aliases: ['POTASSIUM','K+'], mistakes: ['X','R'] },
        CL:   { min: 98, max: 106, unit: 'mmol/L', dec: 0, aliases: ['CHLORIDE'], mistakes: ['C1','CI','GL'] },
        CR:   { min: 60, max: 110, unit: 'μmol/L', dec: 0, aliases: ['CREATININE','CREAT'], mistakes: ['GR','C8','GP'] },
        UREA: { min: 2.5, max: 7.8, unit: 'mmol/L', dec: 1, aliases: ['BUN'], mistakes: ['UERA','URE4'] },
        PH:   { min: 7.35, max: 7.45, unit: '', dec: 2, aliases: ['BLOOD PH'], mistakes: ['PN','P4'] },
        PCO2: { min: 35, max: 45, unit: 'mmHg', dec: 1, aliases: ['PACO2'], mistakes: ['PC02','PO02'] },
        PO2:  { min: 80, max: 100, unit: 'mmHg', dec: 1, aliases: ['PAO2'], mistakes: ['P02'] },
        HCO3: { min: 22, max: 26, unit: 'mmol/L', dec: 1, aliases: ['BICARBONATE','BICARB'], mistakes: ['HC03','HO03'] },
        BE:   { min: -2, max: 2, unit: 'mmol/L', dec: 1, aliases: ['BASE EXCESS'], mistakes: ['8E','B3','RE'], neg: true },
        PT:   { min: 11, max: 14, unit: 'sec', dec: 1, aliases: ['PROTHROMBIN'], mistakes: ['P1','PI'] },
        INR:  { min: 0.9, max: 1.1, unit: '', dec: 2, aliases: [], mistakes: ['1NR','INP'] },
        PTT:  { min: 25, max: 35, unit: 'sec', dec: 1, aliases: ['APTT'], mistakes: ['P1T','PTI'] },
        ALT:  { min: 7, max: 56, unit: 'U/L', dec: 0, aliases: ['SGPT','GPT'], mistakes: ['AL1','ALI'] },
        AST:  { min: 10, max: 40, unit: 'U/L', dec: 0, aliases: ['SGOT','GOT'], mistakes: ['AS1','ASI'] },
        GLUCOSE: { min: 3.9, max: 6.1, unit: 'mmol/L', dec: 1, aliases: ['GLU','GLUC','BS','SUGAR'], mistakes: [] },
        LACTATE: { min: 0.5, max: 2.0, unit: 'mmol/L', dec: 1, aliases: ['LAC','LACTIC'], mistakes: [] },
        TROPONIN: { min: 0, max: 14, unit: 'ng/L', dec: 0, aliases: ['TROP','TNI','TNT','HSTROP'], mistakes: [] },
        CRP:  { min: 0, max: 5, unit: 'mg/L', dec: 1, aliases: ['C-REACTIVE'], mistakes: ['C0P'] },
        ALBUMIN: { min: 35, max: 50, unit: 'g/L', dec: 0, aliases: ['ALB'], mistakes: [] },
        BILIRUBIN: { min: 0, max: 21, unit: 'μmol/L', dec: 0, aliases: ['BILI','TBILI'], mistakes: [] }
    };

    // Learned patterns storage
    let learnedPatterns = {};
    
    function loadPatterns() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            learnedPatterns = saved ? JSON.parse(saved) : {};
        } catch(e) { learnedPatterns = {}; }
    }
    
    function savePatterns() {
        try {
            const keys = Object.keys(learnedPatterns);
            if (keys.length > 200) {
                const sorted = keys.sort((a,b) => (learnedPatterns[b].n||0) - (learnedPatterns[a].n||0));
                const newP = {};
                sorted.slice(0, 200).forEach(k => newP[k] = learnedPatterns[k]);
                learnedPatterns = newP;
            }
            localStorage.setItem(STORAGE_KEY, JSON.stringify(learnedPatterns));
        } catch(e) {}
    }

    // Fuzzy match test name
    function matchTest(input) {
        if (!input) return null;
        const clean = String(input).toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (!clean) return null;
        
        // Exact match
        if (TESTS[clean]) return { test: clean, conf: 100 };
        
        // Check aliases and mistakes
        for (const [name, data] of Object.entries(TESTS)) {
            for (const a of data.aliases || []) {
                if (clean === a.replace(/[^A-Z0-9]/g, '')) return { test: name, conf: 95 };
                if (clean.includes(a.replace(/[^A-Z0-9]/g, '')) || a.includes(clean)) return { test: name, conf: 85 };
            }
            for (const m of data.mistakes || []) {
                if (clean === m) return { test: name, conf: 88 };
            }
        }
        
        // Levenshtein for close matches
        let best = null, bestDist = 99;
        for (const name of Object.keys(TESTS)) {
            const dist = levenshtein(clean, name);
            if (dist < bestDist && dist <= Math.max(1, name.length / 3)) {
                bestDist = dist;
                best = name;
            }
        }
        if (best) return { test: best, conf: Math.max(60, 90 - bestDist * 15) };
        
        return null;
    }
    
    function levenshtein(a, b) {
        if (a === b) return 0;
        const m = [], la = a.length, lb = b.length;
        for (let i = 0; i <= lb; i++) m[i] = [i];
        for (let j = 0; j <= la; j++) m[0][j] = j;
        for (let i = 1; i <= lb; i++) {
            for (let j = 1; j <= la; j++) {
                m[i][j] = b[i-1] === a[j-1] ? m[i-1][j-1] : Math.min(m[i-1][j-1]+1, m[i][j-1]+1, m[i-1][j]+1);
            }
        }
        return m[lb][la];
    }

    // Parse OCR'd number with error correction
    function parseNum(raw, allowNeg = false) {
        if (raw == null) return null;
        let s = String(raw).trim();
        const neg = allowNeg && (s.startsWith('-') || s.startsWith('−'));
        s = s.replace(/^[-−]/, '');
        
        // OCR character substitution
        const subs = { 'O':'0', 'o':'0', 'l':'1', 'I':'1', 'S':'5', 'Z':'2', 'B':'8', 'D':'0', 'Q':'0' };
        s = s.split('').map(c => subs[c] || c).join('');
        s = s.replace(/[^0-9.]/g, '');
        
        // Handle multiple decimals
        const parts = s.split('.');
        if (parts.length > 2) s = parts[0] + '.' + parts.slice(1).join('');
        
        const num = parseFloat(s);
        return isNaN(num) ? null : (neg ? -num : num);
    }

    // Smart value correction based on expected ranges
    function correctValue(test, rawValue, data) {
        const result = { value: rawValue, raw: rawValue, corrected: false, conf: 85, status: 'VALID', flag: 'N' };
        
        // Check learned patterns first
        const key = `${test}|${rawValue}`;
        if (learnedPatterns[key]) {
            const p = learnedPatterns[key];
            p.n = (p.n || 0) + 1;
            savePatterns();
            result.value = p.v;
            result.corrected = true;
            result.conf = Math.min(98, 75 + p.n * 3);
            result.status = 'LEARNED';
            return finalize(result, data);
        }
        
        let num = parseNum(rawValue, data.neg);
        if (num === null) {
            result.status = 'ERROR';
            result.value = null;
            result.conf = 5;
            result.flag = '?';
            return result;
        }
        
        const { min, max, dec } = data;
        const typical = { low: min * 0.5, high: max * 2 };
        const impossible = { low: min * 0.1, high: max * 10 };
        
        // Already in range
        if (num >= typical.low && num <= typical.high) {
            result.value = round(num, dec);
            return finalize(result, data);
        }
        
        // Try corrections
        const fixes = [];
        
        // Missing decimal (51 → 5.1)
        if (num > max * 3 && dec > 0) {
            const f10 = num / 10;
            const f100 = num / 100;
            if (f10 >= typical.low && f10 <= typical.high) fixes.push({ v: round(f10, dec), c: 82, r: '÷10' });
            if (f100 >= typical.low && f100 <= typical.high) fixes.push({ v: round(f100, dec), c: 70, r: '÷100' });
        }
        
        // Missing digit (14 → 140)
        if (num < min / 3 && min >= 10) {
            const f10 = num * 10;
            if (f10 >= typical.low && f10 <= typical.high) fixes.push({ v: round(f10, dec), c: 78, r: '×10' });
        }
        
        // Special: HCT read as whole number (42 → 0.42)
        if (test === 'HCT' && num > 1 && num < 100) {
            const f = num / 100;
            if (f >= 0.2 && f <= 0.6) fixes.push({ v: round(f, 2), c: 85, r: 'HCT%' });
        }
        
        // Special: pH read without decimal (735 → 7.35)
        if (test === 'PH' && num > 100) {
            const f = num / 100;
            if (f >= 6.8 && f <= 7.8) fixes.push({ v: round(f, 2), c: 88, r: 'pH' });
        }
        
        // Special: INR read without decimal (11 → 1.1)
        if (test === 'INR' && num > 5) {
            const f = num / 10;
            if (f >= 0.5 && f <= 5) fixes.push({ v: round(f, 2), c: 80, r: 'INR' });
        }
        
        // Apply best fix
        if (fixes.length > 0) {
            fixes.sort((a,b) => b.c - a.c);
            const best = fixes[0];
            result.value = best.v;
            result.corrected = true;
            result.conf = best.c;
            result.status = 'AUTO_FIX';
            result.reason = best.r;
            return finalize(result, data);
        }
        
        // Value still out of range
        if (num < impossible.low || num > impossible.high) {
            result.status = 'ERROR';
            result.value = null;
            result.conf = 10;
            result.flag = '?';
            return result;
        }
        
        // Accept with lower confidence
        result.value = round(num, dec);
        result.conf = 60;
        result.status = 'UNCERTAIN';
        return finalize(result, data);
    }
    
    function round(n, dec) {
        const f = Math.pow(10, dec);
        return Math.round(n * f) / f;
    }
    
    function finalize(result, data) {
        if (result.value != null && result.status !== 'ERROR') {
            const v = parseFloat(result.value);
            result.flag = v < data.min ? 'L' : v > data.max ? 'H' : 'N';
        }
        result.unit = data.unit;
        result.ref = `${data.min}-${data.max}`;
        return result;
    }

    // Main API
    window.LabOCR = {
        version: '4.0',
        isReady: false,
        
        init() {
            loadPatterns();
            this.isReady = true;
            console.log(`%c[LabOCR v4] Ready • ${Object.keys(learnedPatterns).length} patterns`, 'color:#0f0;font-weight:bold');
            return true;
        },
        
        processVisionResults(items, labType = 'CBC') {
            const results = [];
            
            for (const item of items) {
                const rawTest = item.test || item.name || '';
                const rawValue = item.value;
                
                const match = matchTest(rawTest);
                if (!match) {
                    results.push({ test: rawTest, value: rawValue, rawOcr: rawValue, status: 'UNKNOWN', confidence: 20, flag: '?' });
                    continue;
                }
                
                const testData = TESTS[match.test];
                const correction = correctValue(match.test, rawValue, testData);
                
                results.push({
                    test: match.test,
                    value: correction.value != null ? String(correction.value) : null,
                    rawOcr: rawValue,
                    unit: correction.unit,
                    reference: correction.ref,
                    flag: correction.flag,
                    confidence: Math.round((match.conf + correction.conf) / 2),
                    status: correction.status,
                    corrected: correction.corrected,
                    reason: correction.reason
                });
            }
            
            console.log('[LabOCR] Processed:', results.length, 'items');
            return results;
        },
        
        // Learn from user correction
        learnCorrection(test, rawOcr, correctedValue) {
            const key = `${test.toUpperCase()}|${rawOcr}`;
            learnedPatterns[key] = { v: correctedValue, n: (learnedPatterns[key]?.n || 0) + 1, t: Date.now() };
            savePatterns();
            console.log(`[LabOCR] Learned: ${test} "${rawOcr}" → "${correctedValue}"`);
        },
        
        getStats() {
            return { patterns: Object.keys(learnedPatterns).length, version: this.version };
        },
        
        clearLearning() {
            learnedPatterns = {};
            localStorage.removeItem(STORAGE_KEY);
            console.log('[LabOCR] Learning cleared');
        },
        
        identifyTest(input) {
            return matchTest(input);
        },
        
        getTestInfo(name) {
            return TESTS[name.toUpperCase()] || null;
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
        const tests = [
            { test: 'RBC', value: '51' },      // → 5.1
            { test: 'WN', value: '8.5' },      // WBC 8.5
            { test: 'H8', value: '93' },       // HB 93
            { test: 'NA', value: '14' },       // → 140
            { test: 'CR', value: '9' },        // → 90
            { test: 'HCT', value: '42' },      // → 0.42
            { test: 'PH', value: '735' },      // → 7.35
            { test: 'INR', value: '11' },      // → 1.1
            { test: 'PLT', value: '250' },     // OK
            { test: 'K', value: '4.2' }        // OK
        ];
        console.table(tests);
        const results = window.LabOCR.processVisionResults(tests);
        console.table(results.map(r => ({ test: r.test, raw: r.rawOcr, fixed: r.value, status: r.status, flag: r.flag, conf: r.confidence+'%' })));
        return results;
    };

})();
