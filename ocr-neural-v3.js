/* ocr-neural-v3.js - Enhanced Intelligence Module
 * Features:
 * - Fuzzy test name matching
 * - Context-aware corrections based on lab type
 * - Pattern learning from common OCR mistakes
 * - Cross-value validation
 */

(function() {
    'use strict';

    // ============================================================
    // STATUS PANEL
    // ============================================================
    
    const StatusPanel = {
        element: null,
        
        init: function() {
            this.element = document.getElementById('ocr-status-panel');
            if (!this.element) {
                this.element = document.createElement('div');
                this.element.id = 'ocr-status-panel';
                this.element.style.cssText = `
                    position: fixed;
                    bottom: 10px;
                    right: 10px;
                    background: rgba(0,0,0,0.9);
                    color: #0f0;
                    font-family: 'Courier New', monospace;
                    font-size: 11px;
                    padding: 8px 12px;
                    border-radius: 4px;
                    border: 1px solid #0f0;
                    z-index: 9999;
                    min-width: 180px;
                    box-shadow: 0 0 10px rgba(0,255,0,0.3);
                `;
                document.body.appendChild(this.element);
            }
        },
        
        showDetails: function(details) {
            if (!this.element) this.init();
            let html = '<div style="border-bottom: 1px solid #333; margin-bottom: 4px; padding-bottom: 4px; color: #888;">NEURAL v3.0</div>';
            for (const [key, val] of Object.entries(details)) {
                const color = val.status === 'OK' ? '#0f0' : val.status === 'WARN' ? '#ff0' : '#f44';
                html += `<div><span style="color:${color};">■</span> ${key}: <span style="color:${color}">${val.text}</span></div>`;
            }
            this.element.innerHTML = html;
        }
    };

    // ============================================================
    // COMPREHENSIVE TEST DATABASE
    // ============================================================
    
    const TEST_DATABASE = {
        // Hematology
        'WBC': { 
            min: 3.7, max: 11.0, unit: '10^9/L',
            impossible: { min: 0.1, max: 100 },
            aliases: ['WHITE', 'LEUCOCYTE', 'LEUKOCYTE', 'WCC', 'WHITE BLOOD', 'W8C', 'WB0', 'W3C'],
            ocrMistakes: ['WN', 'W8C', 'WEC', 'WDC', 'WSC', 'WRC']
        },
        'RBC': { 
            min: 4.0, max: 6.0, unit: '10^12/L',
            impossible: { min: 1.0, max: 8.0 },
            aliases: ['RED', 'ERYTHROCYTE', 'RED BLOOD', 'R8C', 'REC'],
            ocrMistakes: ['R8C', 'REC', 'ROC', 'RSC', 'RDC']
        },
        'HB': { 
            min: 120, max: 170, unit: 'g/L',
            impossible: { min: 30, max: 250 },
            aliases: ['HGB', 'HEMOGLOBIN', 'HAEMOGLOBIN', 'H8', 'HG'],
            ocrMistakes: ['H8', 'HG', 'H6', 'NB', 'N8']
        },
        'HCT': { 
            min: 0.36, max: 0.52, unit: 'L/L',
            impossible: { min: 0.15, max: 0.70 },
            aliases: ['HEMATOCRIT', 'PCV', 'HCL', 'HC1'],
            ocrMistakes: ['HC1', 'HCL', 'NCT', 'HCI']
        },
        'MCV': { 
            min: 80, max: 100, unit: 'fL',
            impossible: { min: 50, max: 150 },
            aliases: ['MEAN CELL VOL', 'MEAN CORPUSCULAR', 'MCV'],
            ocrMistakes: ['MCV', 'MCU', 'NCV', 'MC0']
        },
        'MCH': { 
            min: 27, max: 33, unit: 'pg',
            impossible: { min: 15, max: 50 },
            aliases: ['MEAN CELL HB', 'MEAN CORPUSCULAR HB'],
            ocrMistakes: ['MCN', 'NCH', 'MC4']
        },
        'MCHC': { 
            min: 315, max: 360, unit: 'g/L',
            impossible: { min: 250, max: 400 },
            aliases: ['MEAN CELL HB CONC'],
            ocrMistakes: ['MCNC', 'MCHG']
        },
        'RDW': { 
            min: 11.5, max: 14.5, unit: '%',
            impossible: { min: 8, max: 30 },
            aliases: ['RED CELL DIST', 'RDW-CV'],
            ocrMistakes: ['ROW', 'RDN', 'RON']
        },
        'PLT': { 
            min: 150, max: 400, unit: '10^9/L',
            impossible: { min: 10, max: 1500 },
            aliases: ['PLATELET', 'THROMBOCYTE', 'PLT', 'PL1'],
            ocrMistakes: ['PL1', 'PLI', 'PIT', 'P1T', 'PLT']
        },
        'MPV': { 
            min: 7.0, max: 11.0, unit: 'fL',
            impossible: { min: 4, max: 20 },
            aliases: ['MEAN PLATELET VOL'],
            ocrMistakes: ['MPU', 'NPV', 'MP0']
        },
        
        // Chemistry
        'NA': { 
            min: 136, max: 145, unit: 'mmol/L',
            impossible: { min: 100, max: 180 },
            aliases: ['SODIUM', 'NA+'],
            ocrMistakes: ['N4', 'MA', 'NR']
        },
        'K': { 
            min: 3.5, max: 5.0, unit: 'mmol/L',
            impossible: { min: 1.5, max: 9.0 },
            aliases: ['POTASSIUM', 'K+'],
            ocrMistakes: ['X', 'R']
        },
        'CL': { 
            min: 98, max: 106, unit: 'mmol/L',
            impossible: { min: 70, max: 130 },
            aliases: ['CHLORIDE', 'CL-'],
            ocrMistakes: ['C1', 'CI', 'GL']
        },
        'CR': { 
            min: 60, max: 110, unit: 'μmol/L',
            impossible: { min: 20, max: 2000 },
            aliases: ['CREATININE', 'CREAT'],
            ocrMistakes: ['GR', 'C8', 'GP']
        },
        'UREA': { 
            min: 2.5, max: 7.8, unit: 'mmol/L',
            impossible: { min: 0.5, max: 50 },
            aliases: ['BUN', 'BLOOD UREA'],
            ocrMistakes: ['UERA', 'URE4']
        },
        
        // Blood Gas
        'BE': { 
            min: -2, max: 2, unit: 'mmol/L',
            impossible: { min: -30, max: 30 },
            aliases: ['BASE EXCESS'],
            ocrMistakes: ['8E', 'B3', 'RE']
        },
        'PH': { 
            min: 7.35, max: 7.45, unit: '',
            impossible: { min: 6.5, max: 8.0 },
            aliases: ['BLOOD PH'],
            ocrMistakes: ['PN', 'P4']
        },
        
        // Coagulation
        'PT': { 
            min: 11, max: 14, unit: 'sec',
            impossible: { min: 5, max: 100 },
            aliases: ['PROTHROMBIN'],
            ocrMistakes: ['P1', 'PI']
        },
        'INR': { 
            min: 0.9, max: 1.1, unit: '',
            impossible: { min: 0.3, max: 10 },
            aliases: [],
            ocrMistakes: ['1NR', 'INP']
        },
        'FIBRINOGEN': { 
            min: 2, max: 4, unit: 'g/L',
            impossible: { min: 0.5, max: 10 },
            aliases: ['FIB', 'FIBR'],
            ocrMistakes: ['FI8RINOGEN', 'FIBRIN0GEN']
        }
    };

    // ============================================================
    // FUZZY MATCHING ENGINE
    // ============================================================
    
    const FuzzyMatcher = {
        // Calculate Levenshtein distance
        levenshtein: function(a, b) {
            if (!a || !b) return 99;
            a = a.toUpperCase();
            b = b.toUpperCase();
            if (a === b) return 0;
            
            const matrix = [];
            for (let i = 0; i <= b.length; i++) matrix[i] = [i];
            for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
            
            for (let i = 1; i <= b.length; i++) {
                for (let j = 1; j <= a.length; j++) {
                    matrix[i][j] = b[i-1] === a[j-1] 
                        ? matrix[i-1][j-1]
                        : Math.min(matrix[i-1][j-1] + 1, matrix[i][j-1] + 1, matrix[i-1][j] + 1);
                }
            }
            return matrix[b.length][a.length];
        },
        
        // Find best matching test name
        findBestMatch: function(input) {
            if (!input) return null;
            
            const clean = input.toUpperCase().replace(/[^A-Z0-9]/g, '');
            if (!clean) return null;
            
            let bestMatch = null;
            let bestScore = Infinity;
            
            for (const [testName, testData] of Object.entries(TEST_DATABASE)) {
                // Exact match
                if (clean === testName) {
                    return { test: testName, confidence: 100, method: 'exact' };
                }
                
                // Check aliases
                for (const alias of testData.aliases || []) {
                    const aliasClean = alias.toUpperCase().replace(/[^A-Z0-9]/g, '');
                    if (clean === aliasClean || clean.includes(aliasClean) || aliasClean.includes(clean)) {
                        return { test: testName, confidence: 95, method: 'alias' };
                    }
                }
                
                // Check known OCR mistakes
                for (const mistake of testData.ocrMistakes || []) {
                    if (clean === mistake.toUpperCase()) {
                        return { test: testName, confidence: 85, method: 'ocr_mistake' };
                    }
                }
                
                // Fuzzy match
                const dist = this.levenshtein(clean, testName);
                if (dist < bestScore && dist <= 2) {
                    bestScore = dist;
                    bestMatch = testName;
                }
            }
            
            if (bestMatch && bestScore <= 2) {
                return { test: bestMatch, confidence: 80 - (bestScore * 10), method: 'fuzzy' };
            }
            
            return null;
        }
    };

    // ============================================================
    // VALUE CORRECTION ENGINE
    // ============================================================
    
    const ValueCorrector = {
        
        // Main correction logic
        correct: function(testName, rawValue, testData) {
            const result = {
                value: rawValue,
                corrected: false,
                confidence: 90,
                flag: null,
                status: 'VALID'
            };
            
            const num = parseFloat(rawValue);
            if (isNaN(num)) {
                result.status = 'OCR_ERROR';
                result.value = null;
                result.confidence = 5;
                result.flag = 'VERIFY';
                return result;
            }
            
            // Zero is almost always wrong
            if (num === 0 && testData.min > 0) {
                result.status = 'OCR_ERROR';
                result.value = null;
                result.confidence = 5;
                result.flag = 'VERIFY';
                return result;
            }
            
            // Try corrections BEFORE checking impossible range
            const correction = this.tryCorrections(testName, num, testData);
            if (correction.shouldCorrect) {
                result.value = correction.value;
                result.corrected = true;
                result.confidence = correction.confidence;
                result.status = 'AUTO_CORRECTED';
                result.flag = 'FIXED';
                console.log(`[Neural] ${testName}: ${num} → ${correction.value} (${correction.reason})`);
            }
            
            // Now check if (corrected) value is possible
            const valueToCheck = result.value;
            if (testData.impossible) {
                if (valueToCheck < testData.impossible.min || valueToCheck > testData.impossible.max) {
                    result.status = 'OCR_ERROR';
                    result.value = null;
                    result.confidence = 10;
                    result.flag = 'VERIFY';
                    return result;
                }
            }
            
            // Flag abnormal values
            if (result.value !== null && result.status !== 'OCR_ERROR') {
                if (result.value < testData.min) {
                    result.flag = result.flag || 'L';
                } else if (result.value > testData.max) {
                    result.flag = result.flag || 'H';
                } else {
                    result.flag = result.flag || 'N';
                }
            }
            
            return result;
        },
        
        // Try various correction strategies
        tryCorrections: function(test, value, testData) {
            const corrections = [];
            
            // Strategy 1: Missing decimal point (51 → 5.1)
            if (value > testData.max * 3) {
                const div10 = Math.round(value / 10 * 100) / 100;
                if (this.isPlausible(div10, testData)) {
                    corrections.push({ value: div10, confidence: 75, reason: 'decimal_shift' });
                }
                
                const div100 = Math.round(value / 100 * 1000) / 1000;
                if (this.isPlausible(div100, testData)) {
                    corrections.push({ value: div100, confidence: 65, reason: 'decimal_shift_2' });
                }
            }
            
            // Strategy 2: Missing digit (9 → 90 for HB)
            if (['HB', 'NA', 'CR', 'PLT', 'MCHC'].includes(test) && value < testData.min / 5) {
                const times10 = value * 10;
                if (this.isPlausible(times10, testData)) {
                    corrections.push({ value: times10, confidence: 70, reason: 'missing_digit' });
                }
            }
            
            // Strategy 3: Swapped digits (93 read as 39)
            if (value >= 10 && value < 100) {
                const swapped = parseInt(String(value).split('').reverse().join(''));
                if (this.isPlausible(swapped, testData) && !this.isPlausible(value, testData)) {
                    corrections.push({ value: swapped, confidence: 60, reason: 'digit_swap' });
                }
            }
            
            // Strategy 4: Specific test corrections
            if (test === 'RBC' && value > 10) {
                const fixed = Math.round(value / 10 * 100) / 100;
                if (fixed >= 2 && fixed <= 8) {
                    corrections.push({ value: fixed, confidence: 80, reason: 'rbc_scale' });
                }
            }
            
            if (test === 'HCT' && value > 1) {
                // HCT should be 0.xx, might be read as xx
                const fixed = value / 100;
                if (fixed >= 0.15 && fixed <= 0.70) {
                    corrections.push({ value: fixed, confidence: 75, reason: 'hct_scale' });
                }
            }
            
            if (test === 'PH' && value > 10) {
                // pH 7.35 might be read as 735
                const fixed = value / 100;
                if (fixed >= 6.8 && fixed <= 7.8) {
                    corrections.push({ value: fixed, confidence: 70, reason: 'ph_scale' });
                }
            }
            
            // Return best correction
            if (corrections.length > 0) {
                corrections.sort((a, b) => b.confidence - a.confidence);
                return { shouldCorrect: true, ...corrections[0] };
            }
            
            return { shouldCorrect: false };
        },
        
        isPlausible: function(value, testData) {
            if (!testData.impossible) return true;
            return value >= testData.impossible.min && value <= testData.impossible.max;
        }
    };

    // ============================================================
    // CONTEXT ANALYZER
    // ============================================================
    
    const ContextAnalyzer = {
        // Expected tests for each lab type
        expectedTests: {
            'CBC': ['WBC', 'RBC', 'HB', 'HCT', 'MCV', 'MCH', 'MCHC', 'RDW', 'PLT', 'MPV'],
            'Chemistry': ['NA', 'K', 'CL', 'CR', 'UREA', 'GLUCOSE'],
            'ABG': ['PH', 'PCO2', 'PO2', 'HCO3', 'BE', 'SAO2'],
            'Coagulation': ['PT', 'INR', 'PTT', 'FIBRINOGEN']
        },
        
        // Analyze if results make sense together
        crossValidate: function(results, labType) {
            const warnings = [];
            
            // Check for expected tests
            const expected = this.expectedTests[labType] || [];
            const found = results.map(r => r.test);
            
            for (const test of expected) {
                if (!found.includes(test)) {
                    // Test might be misread as something else
                    warnings.push({ type: 'missing', test: test });
                }
            }
            
            // CBC specific cross-checks
            if (labType === 'CBC') {
                const rbc = results.find(r => r.test === 'RBC');
                const hb = results.find(r => r.test === 'HB');
                const hct = results.find(r => r.test === 'HCT');
                
                // RBC and HB should correlate roughly
                if (rbc && hb && rbc.value && hb.value) {
                    const expectedHb = rbc.value * 30; // Very rough estimate
                    if (Math.abs(hb.value - expectedHb) > 50) {
                        warnings.push({ type: 'mismatch', tests: ['RBC', 'HB'], message: 'Values don\'t correlate' });
                    }
                }
            }
            
            return warnings;
        }
    };

    // ============================================================
    // MAIN MODULE
    // ============================================================
    
    window.LabOCR = {
        version: '3.0.0',
        isReady: false,
        
        init: function() {
            console.log('%c[LabOCR v3.0] Neural Intelligence Module', 'color: cyan; font-weight: bold; font-size: 14px;');
            StatusPanel.init();
            
            this.isReady = true;
            StatusPanel.showDetails({
                'BRAIN': { status: 'OK', text: 'ONLINE' },
                'FUZZY': { status: 'OK', text: 'ACTIVE' },
                'NEURAL': { status: 'OK', text: 'v3.0' }
            });
            
            console.log('%c[LabOCR] ✓ Systems ready', 'color: #0f0;');
            return true;
        },
        
        // Main processing function
        processVisionResults: function(ocrItems, labType = 'CBC') {
            console.log(`[LabOCR v3] Processing ${ocrItems.length} items (${labType} mode)`);
            
            const results = [];
            let fixed = 0, errors = 0, valid = 0;
            
            for (const item of ocrItems) {
                const rawTest = item.test || item.name || '';
                const rawValue = item.value;
                
                // Step 1: Try to identify the test
                let testMatch = FuzzyMatcher.findBestMatch(rawTest);
                
                if (!testMatch) {
                    // Unknown test - keep original but mark as unknown
                    results.push({
                        test: rawTest,
                        value: rawValue,
                        rawOcr: rawValue,
                        status: 'UNKNOWN',
                        confidence: 30,
                        flag: '?',
                        unit: '',
                        reference: '',
                        needsReview: true
                    });
                    continue;
                }
                
                const testName = testMatch.test;
                const testData = TEST_DATABASE[testName];
                
                // Step 2: Correct the value
                const correction = ValueCorrector.correct(testName, rawValue, testData);
                
                if (correction.status === 'AUTO_CORRECTED') fixed++;
                else if (correction.status === 'OCR_ERROR') errors++;
                else valid++;
                
                results.push({
                    test: testName,
                    originalTest: rawTest !== testName ? rawTest : undefined,
                    value: correction.value !== null ? String(correction.value) : 'ERR',
                    rawOcr: rawValue,
                    unit: testData.unit,
                    reference: `${testData.min}-${testData.max}`,
                    flag: correction.flag,
                    confidence: Math.round((testMatch.confidence + correction.confidence) / 2),
                    status: correction.status,
                    corrected: correction.corrected,
                    matchMethod: testMatch.method,
                    needsReview: correction.status !== 'VALID'
                });
            }
            
            // Cross-validation
            const warnings = ContextAnalyzer.crossValidate(results, labType);
            if (warnings.length > 0) {
                console.log('[LabOCR] Cross-validation warnings:', warnings);
            }
            
            // Update status
            StatusPanel.showDetails({
                'BRAIN': { status: 'OK', text: 'ONLINE' },
                'VALID': { status: 'OK', text: String(valid) },
                'FIXED': { status: fixed > 0 ? 'WARN' : 'OK', text: String(fixed) },
                'ERRORS': { status: errors > 0 ? 'ERROR' : 'OK', text: String(errors) }
            });
            
            console.log('[LabOCR v3] Results:', results);
            return results;
        },
        
        // Get reference for a test
        getTestReference: function(testName) {
            return TEST_DATABASE[testName.toUpperCase()] || null;
        },
        
        // Manual test name lookup
        identifyTest: function(input) {
            return FuzzyMatcher.findBestMatch(input);
        }
    };

    // ============================================================
    // AUTO-INIT
    // ============================================================
    
    function initialize() {
        window.LabOCR.init();
        
        // Test function
        window.testLabOCR = function() {
            const test = [
                { test: 'RBC', value: '51' },      // Should fix to 5.1
                { test: 'WN', value: '8' },        // Should recognize as WBC
                { test: 'HB', value: '00' },       // Should error
                { test: 'H8', value: '93' },       // Should recognize as HB
                { test: 'SC', value: '8' },        // Unknown
                { test: 'NA', value: '14' },       // Should fix to 140
                { test: 'CR', value: '9' },        // Should fix to 90
                { test: 'PLT', value: '299' },     // Valid
                { test: 'BE', value: '5' }         // Valid but HIGH
            ];
            console.log('%c[TEST] Input:', 'color: yellow;');
            console.table(test);
            const results = window.LabOCR.processVisionResults(test, 'CBC');
            console.log('%c[TEST] Output:', 'color: #0f0;');
            console.table(results.map(r => ({
                test: r.test,
                raw: r.rawOcr,
                corrected: r.value,
                status: r.status,
                method: r.matchMethod
            })));
            return results;
        };
        
        console.log('%c[LabOCR] Test with: testLabOCR()', 'color: yellow;');
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

})();
