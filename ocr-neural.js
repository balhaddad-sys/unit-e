/* ocr-neural-v3.1.js - Enhanced Intelligence Module (improved)
 * - More robust numeric parsing (commas, percent, <, >, ranges)
 * - Better correction heuristics (magnitude-aware decimal fixes, digit insertion, swaps)
 * - Unit normalization support
 * - Simple pattern learner persisted to localStorage to remember frequent OCR->test mappings
 * - Improved confidence scoring and status reporting
 * - Minor bug fixes and defensive checks
 */

(function() {
    'use strict';

    // ============================================================
    // STATUS PANEL
    // ============================================================
    
    const StatusPanel = {
        element: null,
        
        init: function() {
            if (this.element) return;
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
                    min-width: 200px;
                    box-shadow: 0 0 10px rgba(0,255,0,0.25);
                `;
                document.body.appendChild(this.element);
            }
        },
        
        showDetails: function(details) {
            if (!this.element) this.init();
            let html = '<div style="border-bottom: 1px solid #333; margin-bottom: 6px; padding-bottom: 4px; color: #aaa; font-weight:600;">NEURAL v3.1</div>';
            for (const [key, val] of Object.entries(details)) {
                const status = (val.status || 'OK').toUpperCase();
                const color = status === 'OK' ? '#0f0' : status === 'WARN' ? '#ff0' : '#f44';
                const text = val.text !== undefined ? val.text : '';
                html += `<div style="margin:2px 0;"><span style="color:${color}; font-weight:700; margin-right:6px;">■</span><strong>${key}</strong>: <span style="color:${color}; margin-left:6px;">${text}</span></div>`;
            }
            this.element.innerHTML = html;
        }
    };

    // ============================================================
    // COMPREHENSIVE TEST DATABASE
    // ============================================================
    
    const TEST_DATABASE = {
        // Hematology
        'WBC': { min: 3.7, max: 11.0, unit: '10^9/L', impossible: { min: 0.1, max: 100 }, aliases: ['WHITE', 'LEUCOCYTE', 'LEUKOCYTE', 'WCC', 'WHITEBLOOD'], ocrMistakes: ['WN','W8C','WEC','WDC','WSC','WRC'] },
        'RBC': { min: 4.0, max: 6.0, unit: '10^12/L', impossible: { min: 1.0, max: 8.0 }, aliases: ['RED','ERYTHROCYTE','REDBLOOD'], ocrMistakes: ['R8C','REC','ROC','RSC','RDC'] },
        'HB':  { min: 120, max: 170, unit: 'g/L', impossible: { min: 30, max: 250 }, aliases: ['HGB','HEMOGLOBIN','HAEMOGLOBIN'], ocrMistakes: ['H8','HG','H6','NB','N8'] },
        'HCT': { min: 0.36, max: 0.52, unit: 'L/L', impossible: { min: 0.15, max: 0.70 }, aliases: ['HEMATOCRIT','PCV'], ocrMistakes: ['HC1','HCL','NCT','HCI'] },
        'MCV': { min: 80, max: 100, unit: 'fL', impossible: { min: 50, max: 150 }, aliases: ['MEANCELLVOL','MEANCORPUSCULAR'], ocrMistakes: ['MCV','MCU','NCV','MC0'] },
        'MCH': { min: 27, max: 33, unit: 'pg', impossible: { min: 15, max: 50 }, aliases: ['MEANCELLHB','MEANCORPUSCULARHB'], ocrMistakes: ['MCN','NCH','MC4'] },
        'MCHC':{ min: 315, max: 360, unit: 'g/L', impossible: { min: 250, max: 400 }, aliases: ['MEANCELLHBCONC'], ocrMistakes: ['MCNC','MCHG'] },
        'RDW': { min: 11.5, max: 14.5, unit: '%', impossible: { min: 8, max: 30 }, aliases: ['REDCELLDIST','RDW-CV'], ocrMistakes: ['ROW','RDN','RON'] },
        'PLT': { min: 150, max: 400, unit: '10^9/L', impossible: { min: 10, max: 1500 }, aliases: ['PLATELET','THROMBOCYTE'], ocrMistakes: ['PL1','PLI','PIT','P1T','PLT'] },
        'MPV': { min: 7.0, max: 11.0, unit: 'fL', impossible: { min: 4, max: 20 }, aliases: ['MEANPLATELETVOL'], ocrMistakes: ['MPU','NPV','MP0'] },

        // Chemistry
        'NA': { min: 136, max: 145, unit: 'mmol/L', impossible: { min: 100, max: 180 }, aliases: ['SODIUM','NA+'], ocrMistakes: ['N4','MA','NR'] },
        'K':  { min: 3.5, max: 5.0, unit: 'mmol/L', impossible: { min: 1.5, max: 9.0 }, aliases: ['POTASSIUM','K+'], ocrMistakes: ['X','R'] },
        'CL': { min: 98, max: 106, unit: 'mmol/L', impossible: { min: 70, max: 130 }, aliases: ['CHLORIDE','CL-'], ocrMistakes: ['C1','CI','GL'] },
        'CR': { min: 60, max: 110, unit: 'μmol/L', impossible: { min: 20, max: 2000 }, aliases: ['CREATININE','CREAT'], ocrMistakes: ['GR','C8','GP'] },
        'UREA': { min: 2.5, max: 7.8, unit: 'mmol/L', impossible: { min: 0.5, max: 50 }, aliases: ['BUN','BLOODUREA'], ocrMistakes: ['UERA','URE4'] },

        // Blood Gas
        'BE': { min: -2, max: 2, unit: 'mmol/L', impossible: { min: -30, max: 30 }, aliases: ['BASEEXCESS'], ocrMistakes: ['8E','B3','RE'] },
        'PH': { min: 7.35, max: 7.45, unit: '', impossible: { min: 6.5, max: 8.0 }, aliases: ['BLOODPH'], ocrMistakes: ['PN','P4'] },

        // Coagulation
        'PT': { min: 11, max: 14, unit: 'sec', impossible: { min: 5, max: 100 }, aliases: ['PROTHROMBIN'], ocrMistakes: ['P1','PI'] },
        'INR': { min: 0.9, max: 1.1, unit: '', impossible: { min: 0.3, max: 10 }, aliases: [], ocrMistakes: ['1NR','INP'] },
        'FIBRINOGEN': { min: 2, max: 4, unit: 'g/L', impossible: { min: 0.5, max: 10 }, aliases: ['FIB','FIBR'], ocrMistakes: ['FI8RINOGEN','FIBRIN0GEN'] }
    };

    // ============================================================
    // PATTERN LEARNER (simple frequency map persisted locally)
    // ============================================================
    const PatternLearner = {
        key: 'labocr_pattern_map_v1',
        map: {},
        load: function() {
            try {
                const raw = localStorage.getItem(this.key);
                this.map = raw ? JSON.parse(raw) : {};
            } catch (e) {
                this.map = {};
            }
        },
        save: function() {
            try {
                localStorage.setItem(this.key, JSON.stringify(this.map));
            } catch (e) {
                // ignore
            }
        },
        record: function(ocrText, testName) {
            if (!ocrText || !testName) return;
            const k = String(ocrText).toUpperCase();
            this.map[k] = this.map[k] || {};
            this.map[k][testName] = (this.map[k][testName] || 0) + 1;
            // keep map small: decay rarely used entries if too large
            this.save();
        },
        suggest: function(ocrText) {
            if (!ocrText) return null;
            const k = String(ocrText).toUpperCase();
            const entry = this.map[k];
            if (!entry) return null;
            // return the highest-count mapping
            let best = null; let bestCount = 0;
            for (const [t, c] of Object.entries(entry)) {
                if (c > bestCount) { best = t; bestCount = c; }
            }
            if (best && bestCount >= 2) { // require at least 2 occurrences before auto-suggest
                return { test: best, confidence: 90, method: 'learned' };
            }
            return null;
        }
    };
    PatternLearner.load();

    // ============================================================
    // UNIT NORMALIZER
    // ============================================================
    const UnitNormalizer = {
        // Map common variants; used for potential future unit-aware conversions
        normalize: function(rawUnit) {
            if (!rawUnit) return '';
            const u = String(rawUnit).trim().toLowerCase();
            if (u === 'g/dl' || u === 'g/dl.') return 'g/L'; // note: actually 1 g/dL = 10 g/L - conversion not applied here
            return rawUnit;
        }
    };

    // ============================================================
    // FUZZY MATCHING ENGINE
    // ============================================================
    
    const FuzzyMatcher = {
        // Calculate Levenshtein distance
        levenshtein: function(a, b) {
            if (a === null || b === null) return 99;
            a = String(a).toUpperCase();
            b = String(b).toUpperCase();
            if (a === b) return 0;
            const alen = a.length, blen = b.length;
            const dp = Array.from({length: blen+1}, (_,i) => Array(alen+1).fill(0));
            for (let i=0;i<=blen;i++) dp[i][0]=i;
            for (let j=0;j<=alen;j++) dp[0][j]=j;
            for (let i=1;i<=blen;i++) {
                for (let j=1;j<=alen;j++) {
                    dp[i][j] = b[i-1] === a[j-1] ? dp[i-1][j-1] : Math.min(dp[i-1][j-1]+1, dp[i][j-1]+1, dp[i-1][j]+1);
                }
            }
            return dp[blen][alen];
        },
        
        // Clean input to alphanumeric uppercase
        cleanKey: function(s) {
            if (!s) return '';
            return String(s).toUpperCase().replace(/[^A-Z0-9]/g, '');
        },

        // Find best matching test name
        findBestMatch: function(input) {
            if (!input) return null;
            const learned = PatternLearner.suggest(input);
            if (learned) return learned;

            const clean = this.cleanKey(input);
            if (!clean) return null;
            
            let bestMatch = null;
            let bestScore = Infinity;
            
            for (const [testName, testData] of Object.entries(TEST_DATABASE)) {
                // Exact match or normalized exact
                if (clean === testName) {
                    return { test: testName, confidence: 100, method: 'exact' };
                }
                
                // Check aliases (including cleaned forms)
                for (const alias of testData.aliases || []) {
                    const aliasClean = this.cleanKey(alias);
                    if (!aliasClean) continue;
                    if (clean === aliasClean || clean.includes(aliasClean) || aliasClean.includes(clean)) {
                        return { test: testName, confidence: 95, method: 'alias' };
                    }
                }
                
                // Known OCR mistakes
                for (const mistake of testData.ocrMistakes || []) {
                    if (clean === this.cleanKey(mistake)) {
                        return { test: testName, confidence: 88, method: 'ocr_mistake' };
                    }
                }
                
                // Fuzzy match on key names and aliases together
                const dist = Math.min(this.levenshtein(clean, this.cleanKey(testName)), ...( (testData.aliases||[]).map(a => this.levenshtein(clean,this.cleanKey(a))) ));
                if (dist < bestScore) {
                    bestScore = dist;
                    bestMatch = testName;
                }
            }
            
            // accept small distances depending on length
            if (bestMatch) {
                const allowance = Math.max(1, Math.floor(this.cleanKey(bestMatch).length * 0.25)); // allow more for longer names
                if (bestScore <= allowance) {
                    const confidence = Math.max(40, 90 - (bestScore * 10));
                    return { test: bestMatch, confidence: confidence, method: 'fuzzy' };
                }
            }
            
            return null;
        }
    };

    // ============================================================
    // VALUE CORRECTION ENGINE
    // ============================================================
    
    const ValueCorrector = {
        
        // Parse numeric-like OCR strings robustly
        parseNumeric: function(raw) {
            if (raw === null || raw === undefined) return { ok:false, value: null, reason: 'empty' };
            let s = String(raw).trim();
            if (s === '') return { ok:false, value:null, reason:'empty' };

            // Remove common non-numeric artifacts
            // Handle ranges like "4.5-5.5" => take mean
            const rangeMatch = s.match(/^([-\d.,]+)\s*[-–—]\s*([-\d.,]+)$/);
            if (rangeMatch) {
                const a = this._toNumber(rangeMatch[1]);
                const b = this._toNumber(rangeMatch[2]);
                if (!isNaN(a) && !isNaN(b)) {
                    return { ok:true, value: (a + b) / 2, reason: 'range_mean' };
                }
            }

            // Handle leading < or >
            const ltMatch = s.match(/^[<≤]\s*([-\d.,]+)/);
            if (ltMatch) {
                const v = this._toNumber(ltMatch[1]);
                return { ok:true, value: v, censor: '<', reason:'less_than' };
            }
            const gtMatch = s.match(/^[>≥]\s*([-\d.,]+)/);
            if (gtMatch) {
                const v = this._toNumber(gtMatch[1]);
                return { ok:true, value: v, censor: '>', reason:'greater_than' };
            }

            // Remove trailing non-digit characters, common unit letters
            s = s.replace(/[^\d\.,-]/g, '');
            // If multiple commas and dots exist, heuristics:
            // If string contains both '.' and ',', decide if comma is thousand separator or decimal
            if ((s.match(/\./g)||[]).length > 1 && (s.match(/,/g)||[]).length === 0) {
                // remove all dots except last
                const parts = s.split('.');
                s = parts.slice(0, -1).join('') + '.' + parts[parts.length-1];
            }
            if ((s.match(/,/g)||[]).length > 0 && (s.match(/\./g)||[]).length === 0) {
                // many locales use comma as decimal separator or thousand sep - decide:
                // if there is one comma and 1-2 digits after comma, treat as decimal
                if ((s.match(/,/g)||[]).length === 1 && /,\d{1,2}$/.test(s)) {
                    s = s.replace(',', '.');
                } else {
                    // remove all commas (thousand separators)
                    s = s.replace(/,/g, '');
                }
            } else {
                // remove commas
                s = s.replace(/,/g, '');
            }

            // final cleanup: only digits, dot, minus
            s = s.replace(/[^0-9.\-]/g, '');
            const num = parseFloat(s);
            if (isNaN(num)) return { ok:false, value:null, reason:'nan' };
            return { ok:true, value: num, reason:'parsed' };
        },

        _toNumber: function(s) {
            if (s === null || s === undefined) return NaN;
            const cleaned = String(s).replace(/[^\d\.,-]/g,'');
            const replaced = cleaned.replace(',', '.');
            return parseFloat(replaced);
        },
        
        // Main correction logic
        correct: function(testName, rawValue, testData) {
            const parsed = this.parseNumeric(rawValue);
            const result = {
                value: null,
                corrected: false,
                confidence: 50,
                flag: null,
                status: 'VALID',
                reason: parsed.reason || ''
            };
            
            if (!parsed.ok) {
                result.status = 'OCR_ERROR';
                result.value = null;
                result.confidence = 5;
                result.flag = 'VERIFY';
                result.reason = parsed.reason || 'parse_failed';
                return result;
            }
            
            let num = parsed.value;
            // Zero is often OCR artifact if min > 0
            if (num === 0 && testData && testData.min > 0) {
                result.status = 'OCR_ERROR';
                result.value = null;
                result.confidence = 5;
                result.flag = 'VERIFY';
                result.reason = 'zero_artifact';
                return result;
            }

            // Try direct plausibility
            if (testData && this.isPlausible(num, testData)) {
                result.value = num;
                result.confidence = Math.min(95, 60 + this._plausibilityScore(num, testData));
                result.flag = this._flagFromRange(num, testData);
                result.status = 'VALID';
                return result;
            }

            // Try corrections BEFORE impossible-range check
            const correction = this.tryCorrections(testName, num, testData);
            if (correction.shouldCorrect) {
                result.value = this._roundForTest(correction.value, testData);
                result.corrected = true;
                result.confidence = correction.confidence;
                result.status = 'AUTO_CORRECTED';
                result.flag = this._flagFromRange(result.value, testData);
                result.reason = correction.reason;
                // Record pattern if correction came from a consistent OCR-like pattern
                PatternLearner.record(String(rawValue), testName);
            } else {
                // no correction - keep numeric as-is but mark
                result.value = num;
                result.confidence = 30;
                result.status = 'POTENTIAL_ERROR';
                result.flag = 'VERIFY';
            }
            
            // Now check impossible range (safety net)
            if (testData && testData.impossible) {
                if (result.value === null || result.value < testData.impossible.min || result.value > testData.impossible.max) {
                    result.status = 'OCR_ERROR';
                    result.value = null;
                    result.confidence = 10;
                    result.flag = 'VERIFY';
                    return result;
                }
            }
            
            return result;
        },
        
        // Round according to test typical precision
        _roundForTest: function(value, testData) {
            if (value === null || value === undefined) return value;
            // For typical hematology values: many have integer or 1-2 decimals
            if (!testData) return Math.round(value * 100) / 100;
            const unitless = testData.unit || '';
            // pH and proportions often 2 decimals
            if (unitless === '' && (testData.min < 10 && testData.max <= 10)) return Math.round(value * 100) / 100;
            // otherwise, 2 decimals for safety
            return Math.round(value * 100) / 100;
        },

        _plausibilityScore: function(value, testData) {
            // returns 0..40 depending how central within min-max
            if (!testData) return 10;
            const mid = (testData.min + testData.max) / 2;
            const span = (testData.max - testData.min) / 2;
            if (span === 0) return 10;
            const dist = Math.min(Math.abs(value - mid), span);
            const score = Math.max(0, 40 - Math.round((dist / span) * 40));
            return score;
        },

        _flagFromRange: function(value, testData) {
            if (value === null || !testData) return 'N';
            if (value < testData.min) return 'L';
            if (value > testData.max) return 'H';
            return 'N';
        },
        
        // Try various correction strategies
        tryCorrections: function(test, value, testData) {
            const corrections = [];
            if (typeof value !== 'number' || isNaN(value)) return { shouldCorrect:false };
            const val = value;
            
            // Strategy A: magnitude-aware decimal shift (handles 51→5.1 and 140→14 etc)
            if (testData) {
                const plausible = (v) => this.isPlausible(v, testData);
                // If value is orders of magnitude too large, try shifting decimal left
                if (val > testData.max * 2) {
                    for (let shift=1; shift<=3; shift++) {
                        const candidate = val / Math.pow(10,shift);
                        if (plausible(candidate)) {
                            const conf = 80 - (shift-1)*8;
                            corrections.push({ value: candidate, confidence: conf, reason: `decimal_shift_${shift}` });
                        }
                    }
                }
                // If value is far too small, try multiplying by 10/100
                if (val < testData.min / 4) {
                    for (let mul of [10,100]) {
                        const candidate = val * mul;
                        if (plausible(candidate)) {
                            const conf = 70 - (mul===100?5:0);
                            corrections.push({ value: candidate, confidence: conf, reason: `scale_up_${mul}` });
                        }
                    }
                }
            }

            // Strategy B: single digit insertion (e.g., 14 -> 140 for electrolytes read without trailing zero)
            if (val >= 1 && val < 1000 && testData) {
                for (let pos=1; pos<=2; pos++) { // insert a zero at end or shift by *10
                    const candidate = val * Math.pow(10,pos);
                    if (this.isPlausible(candidate, testData)) {
                        corrections.push({ value: candidate, confidence: 65 - (pos*5), reason: `insert_zero_x${Math.pow(10,pos)}` });
                    }
                }
            }

            // Strategy C: digit swap (93 → 39)
            if (Number.isInteger(val) && val >= 10 && val < 1000) {
                try {
                    const s = String(Math.abs(Math.round(val)));
                    const swapped = parseInt(s.split('').reverse().join(''), 10);
                    if (!isNaN(swapped) && this.isPlausible(swapped, testData) && !this.isPlausible(val, testData)) {
                        corrections.push({ value: swapped, confidence: 60, reason: 'digit_swap' });
                    }
                } catch (e) {}
            }

            // Strategy D: specific tweaks for common tests
            if (test === 'RBC' && val > 10) {
                const fixed = Math.round((val / 10) * 100) / 100;
                if (fixed >= 2 && fixed <= 8) corrections.push({ value: fixed, confidence: 85, reason: 'rbc_scale' });
            }

            if (test === 'HCT' && val > 1) {
                const fixed = val / 100;
                if (fixed >= 0.15 && fixed <= 0.70) corrections.push({ value: fixed, confidence: 78, reason: 'hct_scale' });
            }

            if (test === 'PH' && val > 10) {
                const fixed = val / 100;
                if (fixed >= 6.8 && fixed <= 8.0) corrections.push({ value: fixed, confidence: 75, reason: 'ph_scale' });
            }

            // Additional heuristic: if value has decimal but too big/small, flip decimal location
            if (!Number.isInteger(val) && testData) {
                const withoutDecimal = Number(String(val).replace('.',''));
                if (this.isPlausible(withoutDecimal, testData)) {
                    corrections.push({ value: withoutDecimal, confidence: 55, reason: 'remove_decimal' });
                }
            }

            // Pick best correction by confidence
            if (corrections.length > 0) {
                corrections.sort((a,b) => b.confidence - a.confidence);
                return { shouldCorrect: true, ...corrections[0] };
            }

            return { shouldCorrect: false };
        },
        
        isPlausible: function(value, testData) {
            if (value === null || value === undefined || !testData) return false;
            if (!testData.impossible) return (value >= (testData.min || -Infinity) && value <= (testData.max || Infinity));
            return value >= testData.impossible.min && value <= testData.impossible.max;
        }
    };

    // ============================================================
    // CONTEXT ANALYZER
    // ============================================================
    
    const ContextAnalyzer = {
        // Expected tests for each lab type
        expectedTests: {
            'CBC': ['WBC','RBC','HB','HCT','MCV','MCH','MCHC','RDW','PLT','MPV'],
            'Chemistry': ['NA','K','CL','CR','UREA','GLUCOSE'],
            'ABG': ['PH','PCO2','PO2','HCO3','BE','SAO2'],
            'Coagulation': ['PT','INR','PTT','FIBRINOGEN']
        },
        
        // Analyze if results make sense together
        crossValidate: function(results, labType) {
            const warnings = [];
            if (!Array.isArray(results)) return warnings;
            const expected = this.expectedTests[labType] || [];
            const found = results.map(r => r.test);

            for (const test of expected) {
                if (!found.includes(test)) {
                    warnings.push({ type: 'missing', test: test, message: 'Expected test not found (may be misread)' });
                }
            }

            // CBC specific cross-checks
            if (labType === 'CBC') {
                const rbc = results.find(r => r.test === 'RBC' && r.value !== null);
                const hb = results.find(r => r.test === 'HB' && r.value !== null);
                const hct = results.find(r => r.test === 'HCT' && r.value !== null);

                // Very rough RBC->HB estimate: HB (g/L) ~ RBC(10^12/L) * 30 (approx)
                if (rbc && hb && !isNaN(Number(rbc.value)) && !isNaN(Number(hb.value))) {
                    const rbcVal = Number(rbc.value);
                    const hbVal = Number(hb.value);
                    const expectedHb = rbcVal * 30;
                    if (Math.abs(hbVal - expectedHb) > 50) {
                        warnings.push({ type: 'mismatch', tests: ['RBC','HB'], message: 'RBC and HB don\'t correlate (rough check)' });
                    }
                }

                // HCT correlates with HB roughly: HCT (%) ~ HB (g/L) * 0.3
                if (hb && hct && !isNaN(Number(hb.value)) && !isNaN(Number(hct.value))) {
                    const hbVal = Number(hb.value);
                    const hctVal = Number(hct.value);
                    const expectedHct = (hbVal * 0.3);
                    // convert percent to L/L if HCT in L/L (our DB uses L/L)
                    const expectedHctLL = expectedHct / 100;
                    if (Math.abs(hctVal - expectedHctLL) > 0.15) {
                        warnings.push({ type: 'mismatch', tests: ['HB','HCT'], message: 'HB and HCT inconsistent' });
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
        version: '3.1.0',
        isReady: false,
        
        init: function() {
            console.log('%c[LabOCR v3.1] Neural Intelligence Module', 'color: cyan; font-weight: bold;');
            StatusPanel.init();
            this.isReady = true;
            StatusPanel.showDetails({
                'BRAIN': { status: 'OK', text: 'ONLINE' },
                'FUZZY': { status: 'OK', text: 'ACTIVE' },
                'NEURAL': { status: 'OK', text: this.version }
            });
            console.log('%c[LabOCR] ✓ Systems ready', 'color: #0f0;');
            return true;
        },
        
        // Main processing function
        processVisionResults: function(ocrItems, labType = 'CBC') {
            if (!Array.isArray(ocrItems)) {
                console.warn('[LabOCR] processVisionResults expected an array');
                return [];
            }
            console.log(`[LabOCR v3.1] Processing ${ocrItems.length} items (${labType} mode)`);

            const results = [];
            let fixed = 0, errors = 0, valid = 0, review = 0;
            
            for (const item of ocrItems) {
                const rawTest = item.test || item.name || '';
                const rawValue = (item.value === undefined || item.value === null) ? '' : item.value;
                
                // Step 1: Try to identify the test (fuzzy + learned)
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
                    review++;
                    continue;
                }
                
                const testName = testMatch.test;
                const testData = TEST_DATABASE[testName];

                // Step 2: Correct the value
                const correction = ValueCorrector.correct(testName, rawValue, testData);
                
                if (correction.status === 'AUTO_CORRECTED') fixed++;
                else if (correction.status === 'OCR_ERROR') errors++;
                else if (correction.status === 'POTENTIAL_ERROR' || correction.status === 'VALID' && correction.confidence < 50) review++;
                else valid++;
                
                // combine confidences (weighted)
                const matchConf = (typeof testMatch.confidence === 'number') ? testMatch.confidence : 50;
                const valConf = (typeof correction.confidence === 'number') ? correction.confidence : 50;
                const combinedConfidence = Math.round((matchConf * 0.55) + (valConf * 0.45));

                // unit normalization (future-proof)
                const unit = (testData && testData.unit) ? UnitNormalizer.normalize(testData.unit) : '';
                
                // push result
                results.push({
                    test: testName,
                    originalTest: rawTest !== testName ? rawTest : undefined,
                    value: correction.value !== null ? String(correction.value) : 'ERR',
                    rawOcr: rawValue,
                    unit: unit,
                    reference: testData ? `${testData.min}-${testData.max}` : '',
                    flag: correction.flag,
                    confidence: combinedConfidence,
                    status: correction.status,
                    corrected: !!correction.corrected,
                    matchMethod: testMatch.method,
                    needsReview: correction.status !== 'VALID' && correction.status !== 'AUTO_CORRECTED'
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
                'ERRORS': { status: errors > 0 ? 'ERROR' : 'OK', text: String(errors) },
                'REVIEW': { status: review > 0 ? 'WARN' : 'OK', text: String(review) }
            });
            
            console.log('[LabOCR v3.1] Results:', results);
            return results;
        },
        
        // Get reference for a test (defensive copy)
        getTestReference: function(testName) {
            if (!testName) return null;
            const key = String(testName).toUpperCase();
            const data = TEST_DATABASE[key];
            return data ? Object.assign({}, data) : null;
        },
        
        // Manual test name lookup
        identifyTest: function(input) {
            return FuzzyMatcher.findBestMatch(input);
        },

        // Expose pattern learner for manual management
        patternLearner: {
            suggest: (s)=>PatternLearner.suggest(s),
            record: (o,t)=>PatternLearner.record(o,t),
            dump: ()=>JSON.parse(JSON.stringify(PatternLearner.map || {}))
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
                { test: 'RBC', value: '51' },      // Should fix to 5.1 (or 5.1-like correction)
                { test: 'WN', value: '8' },        // Should recognize as WBC
                { test: 'HB', value: '00' },       // Should error
                { test: 'H8', value: '93' },       // Should recognize as HB
                { test: 'SC', value: '8' },        // Unknown
                { test: 'NA', value: '14' },       // Should fix to 140 if plausible
                { test: 'CR', value: '9' },        // Should fix to 90 if plausible
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
                method: r.matchMethod,
                confidence: r.confidence
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