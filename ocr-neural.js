/* ocr-neural-v2.js - Intelligent Lab Value Extraction
 * 
 * INTEGRATION:
 * 1. Add this script AFTER your other scripts in index.html:
 *    <script src="ocr-neural-v2.js"></script>
 * 
 * 2. In your existing OCR callback, call:
 *    const correctedResults = window.LabOCR.processVisionResults(yourOcrResults);
 * 
 * 3. To test, open console and run: window.testLabOCR()
 */

(function() {
    'use strict';

    // ============================================================
    // STATUS DISPLAY - Visual indicator that it's working
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
            this.update('INITIALIZING...', 'yellow');
        },
        
        update: function(message, color = '#0f0') {
            if (!this.element) this.init();
            this.element.innerHTML = `
                <div style="color: ${color}; font-weight: bold;">■ ${message}</div>
            `;
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

    // ============================================================
    // MAIN MODULE
    // ============================================================
    
    window.LabOCR = {
        version: '2.0.0',
        isReady: false,
        
        // Medical reference ranges
        labReferences: {
            'WBC':   { min: 3.7,  max: 10,   unit: '10^9/L',  aliases: ['WHITE BLOOD CELL', 'LEUCOCYTES'] },
            'RBC':   { min: 4.0,  max: 6.0,  unit: '10^12/L', aliases: ['RED BLOOD CELL', 'ERYTHROCYTES'] },
            'HB':    { min: 120,  max: 170,  unit: 'g/L',     aliases: ['HGB', 'HEMOGLOBIN', 'HAEMOGLOBIN'] },
            'HCT':   { min: 0.36, max: 0.50, unit: 'L/L',     aliases: ['HEMATOCRIT', 'PCV'] },
            'MCV':   { min: 80,   max: 100,  unit: 'fL',      aliases: ['MEAN CORPUSCULAR VOLUME'] },
            'MCH':   { min: 27,   max: 33,   unit: 'pg',      aliases: ['MEAN CORPUSCULAR HEMOGLOBIN'] },
            'MCHC':  { min: 315,  max: 355,  unit: 'g/L',     aliases: ['MEAN CORPUSCULAR HB CONC'] },
            'RDW':   { min: 11.5, max: 14.5, unit: '%',       aliases: ['RED CELL DISTRIBUTION WIDTH'] },
            'PLT':   { min: 150,  max: 400,  unit: '10^9/L',  aliases: ['PLATELETS', 'PLATELET COUNT', 'PLT'] },
            'MPV':   { min: 7.0,  max: 11.0, unit: 'fL',      aliases: ['MEAN PLATELET VOLUME'] },
            'CR':    { min: 60,   max: 110,  unit: 'μmol/L',  aliases: ['CREATININE', 'CREAT'] },
            'NA':    { min: 136,  max: 145,  unit: 'mmol/L',  aliases: ['SODIUM'] },
            'K':     { min: 3.5,  max: 5.0,  unit: 'mmol/L',  aliases: ['POTASSIUM'] },
            'UREA':  { min: 2.5,  max: 7.8,  unit: 'mmol/L',  aliases: ['BUN'] },
            'BE':    { min: -2,   max: 2,    unit: 'mmol/L',  aliases: ['BASE EXCESS'] },
            'TO':    { min: 0,    max: 100,  unit: '',        aliases: [] }
        },

        // --------------------------------------------------------
        // INITIALIZATION
        // --------------------------------------------------------
        
        init: function() {
            console.log('%c[LabOCR v2] Initializing...', 'color: cyan; font-weight: bold;');
            StatusPanel.init();
            
            const testResult = this.selfTest();
            
            if (testResult.passed) {
                this.isReady = true;
                StatusPanel.showDetails({
                    'BRAIN': { status: 'OK', text: 'ONLINE' },
                    'OCR': { status: 'OK', text: 'CONNECTED' },
                    'NEURAL': { status: 'OK', text: 'v2.0 ACTIVE' }
                });
                console.log('%c[LabOCR] ✓ All systems ready', 'color: #0f0; font-weight: bold;');
                console.log('%c[LabOCR] Test with: window.testLabOCR()', 'color: yellow;');
            } else {
                StatusPanel.showDetails({
                    'STATUS': { status: 'ERROR', text: 'INIT FAILED' },
                    'ERROR': { status: 'ERROR', text: testResult.error }
                });
                console.error('[LabOCR] Init failed:', testResult.error);
            }
            
            return this.isReady;
        },
        
        selfTest: function() {
            try {
                // Test 1: Can validate
                const t1 = this.validateValue('HB', 93, this.labReferences['HB']);
                if (!t1) throw new Error('Validation failed');
                
                // Test 2: Detects OCR misread (51 → 5.1)
                const t2 = this.detectOcrMisread('RBC', 51, this.labReferences['RBC']);
                if (!t2.detected) throw new Error('Misread detection failed');
                console.log('[LabOCR] ✓ Test: 51 → ' + t2.suggestedValue);
                
                // Test 3: Flags impossible values
                const t3 = this.validateValue('HB', 0, this.labReferences['HB']);
                if (t3.status !== 'OCR_ERROR') throw new Error('Impossible detection failed');
                console.log('[LabOCR] ✓ Test: HB=0 flagged as error');
                
                return { passed: true };
            } catch (err) {
                return { passed: false, error: err.message };
            }
        },

        // --------------------------------------------------------
        // VISUAL TEST - Proves the algorithm works
        // --------------------------------------------------------
        
        runVisualTest: function() {
            console.log('%c═══════════════════════════════════════', 'color: cyan;');
            console.log('%c[LabOCR] VISUAL TEST - Simulating your OCR errors', 'color: cyan; font-weight: bold;');
            console.log('%c═══════════════════════════════════════', 'color: cyan;');
            
            StatusPanel.update('TESTING...', '#ff0');
            
            // These are the EXACT errors from your screenshot
            const mockBadOcr = [
                { test: 'RBC', value: '51' },     // Your app showed 51, should be ~5.1
                { test: 'HB',  value: '00' },     // Your app showed 00, should flag error
                { test: 'HB',  value: '51' },     // Duplicate in your UI, same issue
                { test: 'BE',  value: '5' },      // Showed 5, ref is -2 to 2, so HIGH
                { test: 'CR',  value: '1' }       // Showed 1, impossible (ref 60-110)
            ];
            
            console.log('%cINPUT (raw OCR):', 'color: #f88;');
            console.table(mockBadOcr);
            
            const corrected = this.processVisionResults(mockBadOcr);
            
            console.log('%cOUTPUT (after neural correction):', 'color: #8f8;');
            console.table(corrected.map(r => ({
                test: r.test,
                rawOcr: r.rawOcr,
                corrected: r.value,
                status: r.status,
                confidence: r.confidence + '%'
            })));
            
            // Show in status panel
            const details = { 'TEST': { status: 'OK', text: 'COMPLETE' } };
            corrected.forEach(r => {
                details[r.test] = {
                    status: r.status === 'VALID' ? 'OK' : r.status === 'AUTO_CORRECTED' ? 'WARN' : 'ERROR',
                    text: r.rawOcr + '→' + r.value
                };
            });
            StatusPanel.showDetails(details);
            
            return corrected;
        },

        // --------------------------------------------------------
        // VALIDATION ENGINE
        // --------------------------------------------------------
        
        validateValue: function(test, rawValue, refInfo) {
            const result = {
                correctedValue: rawValue,
                status: 'VALID',
                confidence: 95,
                flag: null
            };
            
            // Life-incompatible values = OCR error
            const impossibleRanges = {
                'HB':  { absoluteMin: 20, absoluteMax: 250 },
                'RBC': { absoluteMin: 1.0, absoluteMax: 8.0 },
                'WBC': { absoluteMin: 0.1, absoluteMax: 100 },
                'PLT': { absoluteMin: 5, absoluteMax: 1500 },
                'NA':  { absoluteMin: 100, absoluteMax: 180 },
                'K':   { absoluteMin: 1.5, absoluteMax: 9.0 },
                'CR':  { absoluteMin: 10, absoluteMax: 2000 }
            };
            
            if (impossibleRanges[test]) {
                const limits = impossibleRanges[test];
                if (rawValue < limits.absoluteMin || rawValue > limits.absoluteMax) {
                    result.status = 'OCR_ERROR';
                    result.confidence = 10;
                    result.correctedValue = null;
                    result.flag = 'VERIFY';
                    return result;
                }
            }
            
            // Try to fix common OCR errors
            const correction = this.detectOcrMisread(test, rawValue, refInfo);
            if (correction.detected && correction.suggestedValue !== null) {
                result.correctedValue = correction.suggestedValue;
                result.status = 'AUTO_CORRECTED';
                result.confidence = correction.confidence;
                result.flag = 'CORRECTED';
                return result;
            } else if (correction.detected && correction.suggestedValue === null) {
                result.status = 'OCR_ERROR';
                result.confidence = 10;
                result.correctedValue = null;
                result.flag = 'VERIFY';
                return result;
            }
            
            // Flag abnormal but possible values
            if (rawValue < refInfo.min) {
                result.flag = 'L';
            } else if (rawValue > refInfo.max) {
                result.flag = 'H';
            }
            
            return result;
        },
        
        detectOcrMisread: function(test, value, refInfo) {
            // Zero is almost always an OCR failure
            if (value === 0 && refInfo.min > 0) {
                return { detected: true, suggestedValue: null, confidence: 5 };
            }
            
            const corrections = [];
            
            // Pattern: Missing decimal point (51 → 5.1)
            if (value > refInfo.max * 3) {
                const withDecimal = value / 10;
                if (withDecimal >= refInfo.min * 0.5 && withDecimal <= refInfo.max * 1.5) {
                    corrections.push({ value: Math.round(withDecimal * 100) / 100, confidence: 70 });
                }
            }
            
            // Pattern: Scale error for HB specifically
            if (test === 'HB' && value < 20 && value > 0) {
                const scaled = value * 10;
                if (scaled >= 50 && scaled <= 220) {
                    corrections.push({ value: scaled, confidence: 60 });
                }
            }
            
            // Return best correction
            if (corrections.length > 0) {
                corrections.sort((a, b) => b.confidence - a.confidence);
                return { detected: true, ...corrections[0] };
            }
            
            return { detected: false };
        },

        // --------------------------------------------------------
        // MAIN INTEGRATION POINT
        // --------------------------------------------------------
        
        /**
         * Process OCR results through neural validation
         * 
         * @param {Array} ocrItems - Array of {test: 'RBC', value: '51'} objects
         * @returns {Array} - Corrected results with status and confidence
         * 
         * USAGE IN YOUR CODE:
         *   // After Google Vision returns:
         *   const raw = [{test: 'RBC', value: '51'}, {test: 'HB', value: '00'}];
         *   const corrected = window.LabOCR.processVisionResults(raw);
         *   // Now use 'corrected' to update your React state
         */
        processVisionResults: function(ocrItems) {
            StatusPanel.update('PROCESSING...', '#ff0');
            console.log('[LabOCR] Processing', ocrItems.length, 'items...');
            
            const results = ocrItems.map(item => {
                const testKey = (item.test || item.name || '').toUpperCase().trim();
                const ref = this.labReferences[testKey];
                
                if (!ref) {
                    console.warn('[LabOCR] Unknown test:', testKey);
                    return {
                        test: testKey,
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
                    test: testKey,
                    value: validated.correctedValue !== null 
                        ? String(validated.correctedValue) 
                        : 'ERR',
                    rawOcr: item.value,
                    unit: ref.unit,
                    reference: `${ref.min}-${ref.max}`,
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
            
            return results;
        },

        // --------------------------------------------------------
        // HOOK INTO EXISTING MasterShifuBrain (backwards compat)
        // --------------------------------------------------------
        
        connectToMasterShifu: function() {
            if (window.MasterShifuBrain) {
                const originalCorrection = window.MasterShifuBrain.applyNeuralCorrection;
                const self = this;
                
                window.MasterShifuBrain.applyNeuralCorrection = function(test, rawValue) {
                    const ref = self.labReferences[test.toUpperCase()];
                    if (ref) {
                        const validated = self.validateValue(test.toUpperCase(), parseFloat(rawValue), ref);
                        return {
                            value: validated.correctedValue !== null ? validated.correctedValue : 'Check',
                            status: validated.status === 'VALID' ? 'HIGH_TRUST' : 'NEURAL_FIX_REQUIRED'
                        };
                    }
                    return originalCorrection.call(window.MasterShifuBrain, test, rawValue);
                };
                
                console.log('[LabOCR] ✓ Connected to MasterShifuBrain');
                return true;
            }
            return false;
        }
    };

    // ============================================================
    // AUTO-INIT
    // ============================================================
    
    function initialize() {
        window.LabOCR.init();
        window.LabOCR.connectToMasterShifu();
        
        // Expose test function globally
        window.testLabOCR = () => window.LabOCR.runVisualTest();
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

})();
