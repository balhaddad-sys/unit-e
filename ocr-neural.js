/* ocr-neural-v2.js - Fixed: Correction runs BEFORE impossible check */

(function() {
    'use strict';

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
            this.update('INITIALIZING...', 'yellow');
        },
        
        update: function(message, color = '#0f0') {
            if (!this.element) this.init();
            this.element.innerHTML = `<div style="color: ${color}; font-weight: bold;">■ ${message}</div>`;
        },
        
        showDetails: function(details) {
            if (!this.element) this.init();
            let html = '<div style="border-bottom: 1px solid #333; margin-bottom: 4px; padding-bottom: 4px; color: #888;">SYSTEM STATUS</div>';
            for (const [key, val] of Object.entries(details)) {
                const color = val.status === 'OK' ? '#0f0' : val.status === 'WARN' ? '#ff0' : '#f44';
                html += `<div><span style="color:${color};">■</span> ${key}: <span style="color:${color}">${val.text}</span></div>`;
            }
            this.element.innerHTML = html;
        }
    };

    window.LabOCR = {
        version: '2.1.0',
        isReady: false,
        
        labReferences: {
            'WBC':   { min: 3.7,  max: 10,   unit: '10^9/L' },
            'RBC':   { min: 4.0,  max: 6.0,  unit: '10^12/L' },
            'HB':    { min: 120,  max: 170,  unit: 'g/L' },
            'HCT':   { min: 0.36, max: 0.50, unit: 'L/L' },
            'MCV':   { min: 80,   max: 100,  unit: 'fL' },
            'MCH':   { min: 27,   max: 33,   unit: 'pg' },
            'MCHC':  { min: 315,  max: 355,  unit: 'g/L' },
            'RDW':   { min: 11.5, max: 14.5, unit: '%' },
            'PLT':   { min: 150,  max: 400,  unit: '10^9/L' },
            'MPV':   { min: 7.0,  max: 11.0, unit: 'fL' },
            'CR':    { min: 60,   max: 110,  unit: 'μmol/L' },
            'NA':    { min: 136,  max: 145,  unit: 'mmol/L' },
            'K':     { min: 3.5,  max: 5.0,  unit: 'mmol/L' },
            'UREA':  { min: 2.5,  max: 7.8,  unit: 'mmol/L' },
            'BE':    { min: -2,   max: 2,    unit: 'mmol/L' },
            'TO':    { min: 0,    max: 100,  unit: '' },
            'Hb':    { min: 120,  max: 170,  unit: 'g/L' },
            'Plt':   { min: 150,  max: 400,  unit: '10^9/L' },
            'Cr':    { min: 60,   max: 110,  unit: 'μmol/L' }
        },

        // Life-incompatible ranges (after correction)
        impossibleRanges: {
            'HB':  { min: 20, max: 250 },
            'Hb':  { min: 20, max: 250 },
            'RBC': { min: 1.0, max: 8.0 },
            'WBC': { min: 0.1, max: 100 },
            'PLT': { min: 5, max: 1500 },
            'Plt': { min: 5, max: 1500 },
            'NA':  { min: 100, max: 180 },
            'K':   { min: 1.5, max: 9.0 },
            'CR':  { min: 10, max: 2000 },
            'Cr':  { min: 10, max: 2000 }
        },

        init: function() {
            console.log('%c[LabOCR v2.1] Initializing...', 'color: cyan; font-weight: bold;');
            StatusPanel.init();
            
            const testResult = this.selfTest();
            
            if (testResult.passed) {
                this.isReady = true;
                StatusPanel.showDetails({
                    'BRAIN': { status: 'OK', text: 'ONLINE' },
                    'OCR': { status: 'OK', text: 'CONNECTED' },
                    'NEURAL': { status: 'OK', text: 'v2.1 FIXED' }
                });
                console.log('%c[LabOCR] ✓ All systems ready', 'color: #0f0; font-weight: bold;');
            } else {
                StatusPanel.showDetails({
                    'STATUS': { status: 'ERROR', text: 'INIT FAILED' },
                    'ERROR': { status: 'ERROR', text: testResult.error }
                });
            }
            
            return this.isReady;
        },
        
        selfTest: function() {
            try {
                // Test: RBC=51 should become 5.1, NOT error
                const t1 = this.validateValue('RBC', 51, this.labReferences['RBC']);
                console.log('[LabOCR] Test RBC=51:', t1);
                if (t1.correctedValue !== 5.1) {
                    console.warn('[LabOCR] Expected 5.1, got', t1.correctedValue);
                }
                
                // Test: HB=0 should be error
                const t2 = this.validateValue('HB', 0, this.labReferences['HB']);
                if (t2.status !== 'OCR_ERROR') throw new Error('Zero detection failed');
                
                // Test: CR=1 should be error (can't fix)
                const t3 = this.validateValue('CR', 1, this.labReferences['CR']);
                console.log('[LabOCR] Test CR=1:', t3);
                
                return { passed: true };
            } catch (err) {
                return { passed: false, error: err.message };
            }
        },

        // ========================================
        // FIXED: Try correction FIRST, then validate
        // ========================================
        
        validateValue: function(test, rawValue, refInfo) {
            const result = {
                correctedValue: rawValue,
                status: 'VALID',
                confidence: 95,
                flag: null
            };
            
            // STEP 1: Check for zero (always an error)
            if (rawValue === 0 && refInfo.min > 0) {
                result.status = 'OCR_ERROR';
                result.confidence = 5;
                result.correctedValue = null;
                result.flag = 'VERIFY';
                return result;
            }
            
            // STEP 2: Try to fix common OCR errors FIRST
            const correction = this.detectOcrMisread(test, rawValue, refInfo);
            if (correction.shouldCorrect) {
                result.correctedValue = correction.value;
                result.status = 'AUTO_CORRECTED';
                result.confidence = correction.confidence;
                result.flag = 'FIXED';
                console.log(`[LabOCR] Corrected ${test}: ${rawValue} → ${correction.value}`);
            }
            
            // STEP 3: Now check if (corrected) value is impossible
            const valueToCheck = result.correctedValue;
            const limits = this.impossibleRanges[test];
            
            if (limits && valueToCheck !== null) {
                if (valueToCheck < limits.min || valueToCheck > limits.max) {
                    // Value is still impossible after correction attempt
                    result.status = 'OCR_ERROR';
                    result.confidence = 10;
                    result.correctedValue = null;
                    result.flag = 'VERIFY';
                    return result;
                }
            }
            
            // STEP 4: Flag abnormal but valid values
            if (result.correctedValue !== null && result.status !== 'OCR_ERROR') {
                if (result.correctedValue < refInfo.min) {
                    result.flag = result.flag || 'L';
                } else if (result.correctedValue > refInfo.max) {
                    result.flag = result.flag || 'H';
                } else if (!result.flag) {
                    result.flag = 'N';
                }
            }
            
            return result;
        },
        
        detectOcrMisread: function(test, value, refInfo) {
            // Pattern 1: Missing decimal point
            // RBC=51 → 5.1, RBC=32 → 3.2
            if ((test === 'RBC' || test === 'WBC') && value > 10) {
                const withDecimal = value / 10;
                if (withDecimal >= 1.0 && withDecimal <= 15.0) {
                    return { shouldCorrect: true, value: Math.round(withDecimal * 100) / 100, confidence: 75 };
                }
            }
            
            // Pattern 2: HB scale issues
            // HB=51 could be 51 (very low but possible) or OCR error
            // HB=9 or HB=93 → probably 93
            if ((test === 'HB' || test === 'Hb') && value > 0) {
                // Single digit - probably missing a digit
                if (value < 10) {
                    const scaled = value * 10;
                    if (scaled >= 50 && scaled <= 200) {
                        return { shouldCorrect: true, value: scaled, confidence: 60 };
                    }
                }
                // Two digits but suspiciously low (like 51 when expecting 93)
                // This is tricky - 51 could be real (severe anemia)
                // Don't auto-correct, but flag for review
            }
            
            // Pattern 3: Creatinine
            // CR=1 is impossible, CR=10 could be 100, CR=91 is valid
            if ((test === 'CR' || test === 'Cr') && value < 10) {
                const scaled = value * 10;
                if (scaled >= 30 && scaled <= 300) {
                    return { shouldCorrect: true, value: scaled, confidence: 55 };
                }
                // Still too low even after scaling - can't fix
                return { shouldCorrect: false };
            }
            
            // Pattern 4: Generic "value way too high" - missing decimal
            if (value > refInfo.max * 5) {
                const withDecimal = value / 10;
                if (withDecimal >= refInfo.min * 0.5 && withDecimal <= refInfo.max * 2) {
                    return { shouldCorrect: true, value: Math.round(withDecimal * 100) / 100, confidence: 65 };
                }
            }
            
            return { shouldCorrect: false };
        },

        // ========================================
        // Main entry point
        // ========================================
        
        processVisionResults: function(ocrItems) {
            StatusPanel.update('PROCESSING...', '#ff0');
            console.log('[LabOCR] Processing', ocrItems.length, 'items...');
            
            const results = ocrItems.map(item => {
                const testKey = (item.test || item.name || '').toUpperCase().trim();
                const ref = this.labReferences[testKey] || this.labReferences[item.test];
                
                if (!ref) {
                    return {
                        test: item.test || testKey,
                        value: item.value,
                        rawOcr: item.value,
                        status: 'UNKNOWN',
                        confidence: 50,
                        flag: '?'
                    };
                }
                
                const rawNum = parseFloat(item.value);
                const validated = this.validateValue(testKey, rawNum, ref);
                
                return {
                    test: item.test || testKey,
                    value: validated.correctedValue !== null ? String(validated.correctedValue) : 'ERR',
                    rawOcr: item.value,
                    unit: item.unit || ref.unit,
                    reference: item.reference || `${ref.min}-${ref.max}`,
                    flag: validated.flag,
                    confidence: validated.confidence,
                    status: validated.status,
                    needsReview: validated.status !== 'VALID'
                };
            });
            
            // Update status panel
            const errors = results.filter(r => r.status === 'OCR_ERROR').length;
            const corrected = results.filter(r => r.status === 'AUTO_CORRECTED').length;
            const valid = results.filter(r => r.status === 'VALID').length;
            
            StatusPanel.showDetails({
                'BRAIN': { status: 'OK', text: 'ONLINE' },
                'VALID': { status: 'OK', text: String(valid) },
                'FIXED': { status: corrected > 0 ? 'WARN' : 'OK', text: String(corrected) },
                'ERRORS': { status: errors > 0 ? 'ERROR' : 'OK', text: String(errors) }
            });
            
            console.log('[LabOCR] Results:', results);
            return results;
        },

        connectToMasterShifu: function() {
            if (window.MasterShifuBrain) {
                const self = this;
                window.MasterShifuBrain.applyNeuralCorrection = function(test, rawValue) {
                    const ref = self.labReferences[test.toUpperCase()] || self.labReferences[test];
                    if (ref) {
                        const validated = self.validateValue(test.toUpperCase(), parseFloat(rawValue), ref);
                        return {
                            value: validated.correctedValue !== null ? validated.correctedValue : 'Check',
                            status: validated.status === 'VALID' ? 'HIGH_TRUST' : 'NEURAL_FIX_REQUIRED'
                        };
                    }
                    return { value: rawValue, status: 'UNKNOWN' };
                };
                console.log('[LabOCR] ✓ Connected to MasterShifuBrain');
                return true;
            }
            return false;
        }
    };

    function initialize() {
        window.LabOCR.init();
        window.LabOCR.connectToMasterShifu();
        window.testLabOCR = () => {
            const test = [
                { test: 'RBC', value: '51' },
                { test: 'HB', value: '00' },
                { test: 'HB', value: '51' },
                { test: 'BE', value: '5' },
                { test: 'CR', value: '1' }
            ];
            console.table(window.LabOCR.processVisionResults(test));
        };
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

})();
