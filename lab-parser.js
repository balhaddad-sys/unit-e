/* ═══════════════════════════════════════════════════════════════════════════
   MEDICAL REPORT PARSER v3.1 (Fix: Null Safety)
   Intelligent parser with clinical interpretation
   ═══════════════════════════════════════════════════════════════════════════ */

(function() {
    'use strict';

    // ═══════════════════════════════════════════════════════════════════════
    // CLINICAL INTERPRETATIONS
    // ═══════════════════════════════════════════════════════════════════════
    const interpretations = {
        // Echo
        'EF': (v) => {
            if (v >= 55) return { severity: 'normal', text: 'Normal LV systolic function' };
            if (v >= 45) return { severity: 'mild', text: 'Mildly reduced LVEF' };
            if (v >= 35) return { severity: 'moderate', text: 'Moderately reduced LVEF' };
            if (v >= 20) return { severity: 'severe', text: 'Severely reduced LVEF' };
            return { severity: 'critical', text: 'Critically impaired LVEF' };
        },
        'RVSP': (v) => {
            if (v <= 30) return { severity: 'normal', text: 'Normal pulmonary pressure' };
            if (v <= 45) return { severity: 'mild', text: 'Mild pulmonary HTN' };
            if (v <= 60) return { severity: 'moderate', text: 'Moderate pulmonary HTN' };
            return { severity: 'severe', text: 'Severe pulmonary HTN' };
        },
        'LA Diam': (v) => {
            if (v <= 4.0) return { severity: 'normal', text: 'Normal LA' };
            if (v <= 4.5) return { severity: 'mild', text: 'Mildly dilated LA' };
            if (v <= 5.0) return { severity: 'moderate', text: 'Moderately dilated LA' };
            return { severity: 'severe', text: 'Severely dilated LA' };
        },
        'TAPSE': (v) => {
            if (v >= 1.7) return { severity: 'normal', text: 'Normal RV function' };
            if (v >= 1.4) return { severity: 'mild', text: 'Mildly reduced RV function' };
            return { severity: 'severe', text: 'Reduced RV function' };
        },
        'E/E\'': (v) => {
            if (v <= 8) return { severity: 'normal', text: 'Normal filling pressures' };
            if (v <= 14) return { severity: 'mild', text: 'Indeterminate filling pressures' };
            return { severity: 'elevated', text: 'Elevated filling pressures' };
        },
        
        // Labs
        'Hgb': (v) => {
            if (v < 7) return { severity: 'critical', text: 'Severe anemia - transfuse' };
            if (v < 10) return { severity: 'moderate', text: 'Moderate anemia' };
            if (v < 12) return { severity: 'mild', text: 'Mild anemia' };
            return { severity: 'normal', text: 'Normal Hgb' };
        },
        'WBC': (v) => {
            if (v < 1) return { severity: 'critical', text: 'Severe neutropenia' };
            if (v < 4) return { severity: 'low', text: 'Leukopenia' };
            if (v <= 11) return { severity: 'normal', text: 'Normal WBC' };
            if (v <= 20) return { severity: 'mild', text: 'Leukocytosis' };
            return { severity: 'severe', text: 'Marked leukocytosis' };
        },
        'Plt': (v) => {
            if (v < 20) return { severity: 'critical', text: 'Severe thrombocytopenia' };
            if (v < 50) return { severity: 'moderate', text: 'Moderate thrombocytopenia' };
            if (v < 150) return { severity: 'mild', text: 'Mild thrombocytopenia' };
            if (v <= 400) return { severity: 'normal', text: 'Normal platelets' };
            return { severity: 'elevated', text: 'Thrombocytosis' };
        },
        'Cr': (v) => {
            if (v <= 1.2) return { severity: 'normal', text: 'Normal renal function' };
            if (v <= 2.0) return { severity: 'mild', text: 'Mild renal impairment' };
            if (v <= 4.0) return { severity: 'moderate', text: 'Moderate CKD' };
            if (v <= 8.0) return { severity: 'severe', text: 'Severe CKD' };
            return { severity: 'critical', text: 'Renal failure' };
        },
        'K': (v) => {
            if (v < 2.5) return { severity: 'critical', text: 'Severe hypokalemia' };
            if (v < 3.5) return { severity: 'low', text: 'Hypokalemia' };
            if (v <= 5.0) return { severity: 'normal', text: 'Normal K' };
            if (v <= 6.0) return { severity: 'elevated', text: 'Hyperkalemia' };
            return { severity: 'critical', text: 'Severe hyperkalemia' };
        },
        'Na': (v) => {
            if (v < 120) return { severity: 'critical', text: 'Severe hyponatremia' };
            if (v < 130) return { severity: 'moderate', text: 'Moderate hyponatremia' };
            if (v < 136) return { severity: 'mild', text: 'Mild hyponatremia' };
            if (v <= 145) return { severity: 'normal', text: 'Normal Na' };
            if (v <= 150) return { severity: 'mild', text: 'Mild hypernatremia' };
            return { severity: 'severe', text: 'Severe hypernatremia' };
        },
        'Troponin': (v) => {
            if (v <= 0.04) return { severity: 'normal', text: 'Normal troponin' };
            if (v <= 0.4) return { severity: 'elevated', text: 'Elevated - myocardial injury' };
            return { severity: 'high', text: 'Significantly elevated - ACS' };
        },
        'BNP': (v) => {
            if (v < 100) return { severity: 'normal', text: 'HF unlikely' };
            if (v < 400) return { severity: 'mild', text: 'Possible HF' };
            return { severity: 'elevated', text: 'HF likely' };
        },
        'Lactate': (v) => {
            if (v <= 2.0) return { severity: 'normal', text: 'Normal lactate' };
            if (v <= 4.0) return { severity: 'elevated', text: 'Elevated - hypoperfusion' };
            return { severity: 'critical', text: 'Severely elevated - shock' };
        },
        'pH': (v) => {
            if (v < 7.20) return { severity: 'critical', text: 'Severe acidemia' };
            if (v < 7.35) return { severity: 'low', text: 'Acidemia' };
            if (v <= 7.45) return { severity: 'normal', text: 'Normal pH' };
            if (v <= 7.50) return { severity: 'elevated', text: 'Alkalemia' };
            return { severity: 'critical', text: 'Severe alkalemia' };
        },
        'INR': (v) => {
            if (v <= 1.1) return { severity: 'normal', text: 'Normal' };
            if (v <= 2.0) return { severity: 'mild', text: 'Mildly prolonged' };
            if (v <= 3.5) return { severity: 'therapeutic', text: 'Therapeutic (if on warfarin)' };
            return { severity: 'elevated', text: 'Supratherapeutic' };
        },
        'TSH': (v) => {
            if (v < 0.4) return { severity: 'low', text: 'Hyperthyroid?' };
            if (v <= 4.0) return { severity: 'normal', text: 'Euthyroid' };
            if (v <= 10) return { severity: 'mild', text: 'Subclinical hypothyroid' };
            return { severity: 'elevated', text: 'Hypothyroid' };
        },
        'Glucose': (v) => {
            if (v < 50) return { severity: 'critical', text: 'Hypoglycemia - treat now' };
            if (v < 70) return { severity: 'low', text: 'Low glucose' };
            if (v <= 100) return { severity: 'normal', text: 'Normal' };
            if (v <= 125) return { severity: 'prediabetes', text: 'Prediabetes range' };
            if (v <= 200) return { severity: 'elevated', text: 'Elevated' };
            return { severity: 'high', text: 'Significantly elevated' };
        },
        'HbA1c': (v) => {
            if (v < 5.7) return { severity: 'normal', text: 'Normal' };
            if (v < 6.5) return { severity: 'prediabetes', text: 'Prediabetes' };
            if (v < 7.0) return { severity: 'controlled', text: 'DM - good control' };
            if (v < 8.0) return { severity: 'suboptimal', text: 'DM - suboptimal' };
            return { severity: 'poor', text: 'DM - poor control' };
        },
        'CRP': (v) => {
            if (v < 3) return { severity: 'normal', text: 'Normal' };
            if (v < 10) return { severity: 'mild', text: 'Mild inflammation' };
            if (v < 50) return { severity: 'moderate', text: 'Moderate inflammation' };
            return { severity: 'severe', text: 'Severe inflammation' };
        },
        'Procalcitonin': (v) => {
            if (v < 0.1) return { severity: 'normal', text: 'Bacterial unlikely' };
            if (v < 0.5) return { severity: 'low', text: 'Possible local infection' };
            if (v < 2.0) return { severity: 'moderate', text: 'Likely bacterial' };
            return { severity: 'high', text: 'Sepsis likely' };
        },
    };

    const getInterpretation = (test, value) => {
        const fn = interpretations[test];
        return fn && typeof value === 'number' ? fn(value) : null;
    };

    // ═══════════════════════════════════════════════════════════════════════
    // REPORT TYPE DETECTION
    // ═══════════════════════════════════════════════════════════════════════
    const detectReportType = (text) => {
        const t = text.toLowerCase();
        
        if (t.includes('colonoscopy') || t.includes('colonic polyp')) return { type: 'Colonoscopy', category: 'Endoscopy' };
        if (t.includes('upper endoscopy') || t.includes('oesophagus') || t.includes('gastritis')) return { type: 'EGD', category: 'Endoscopy' };
        if (t.includes('echo summary') || t.includes('ejection fraction') || t.includes('cardiomyopathy')) return { type: 'Echo', category: 'Cardiac' };
        if (t.includes('cardiac report') || t.includes('m-mode') || t.includes('doppler') || t.includes('tapse')) return { type: 'Echo', category: 'Cardiac' };
        if (t.includes('ct scan')) return { type: 'CT', category: 'Radiology' };
        if (t.includes('mri')) return { type: 'MRI', category: 'Radiology' };
        if (t.includes('x-ray')) return { type: 'X-Ray', category: 'Radiology' };
        if ((t.includes('wbc') && t.includes('rbc'))) return { type: 'CBC', category: 'Laboratory' };
        if (t.includes('creatinine') && t.includes('bun')) return { type: 'RFT', category: 'Laboratory' };
        if (t.includes('ast') && t.includes('alt')) return { type: 'LFT', category: 'Laboratory' };
        if (t.includes('biopsy') || t.includes('histopath')) return { type: 'Pathology', category: 'Pathology' };
        if (/\d+\.?\d*\s*(mg\/dl|mmol|u\/l|meq)/i.test(t)) return { type: 'Laboratory', category: 'Laboratory' };
        return { type: 'Clinical Report', category: 'General' };
    };

    // ═══════════════════════════════════════════════════════════════════════
    // ECHO PARSER
    // ═══════════════════════════════════════════════════════════════════════
    const parseEcho = (text) => {
        const values = [];
        const findings = [];
        
        const patterns = [
            { test: 'EF', pattern: /(?:ef|ejection fraction|lvef)[:\s=]*(\d+)\s*%/i, unit: '%', range: [55, 70] },
            { test: 'EF', pattern: /EF[:\s]+(\d+)%/i, unit: '%', range: [55, 70] },
            { test: 'EF', pattern: /EF A-L A4C[:\s]+(\d+)\s*%/i, unit: '%', range: [55, 70] },
            { test: 'LA Diam', pattern: /LA Diam[:\s]+(\d+\.?\d*)\s*cm/i, unit: 'cm', range: [2.0, 4.0] },
            { test: 'LVIDd', pattern: /LVIDd[:\s]+(\d+\.?\d*)\s*cm/i, unit: 'cm', range: [3.5, 5.6] },
            { test: 'IVSd', pattern: /IVSd[:\s]+(\d+\.?\d*)\s*cm/i, unit: 'cm', range: [0.6, 1.1] },
            { test: 'LVPWd', pattern: /LVPWd[:\s]+(\d+\.?\d*)\s*cm/i, unit: 'cm', range: [0.6, 1.1] },
            { test: 'TAPSE', pattern: /TAPSE[:\s]+(\d+\.?\d*)\s*cm/i, unit: 'cm', range: [1.7, 2.5] },
            { test: 'RVSP', pattern: /RVSP[:\s=]+(\d+)/i, unit: 'mmHg', range: [15, 30] },
            { test: 'E/E\'', pattern: /E\/E'[:\s]+(\d+\.?\d*)/i, unit: '', range: [6, 14] },
            { test: 'TR maxPG', pattern: /TR maxPG[:\s]+(\d+\.?\d*)/i, unit: 'mmHg', range: [10, 25] },
        ];
        
        const usedTests = new Set();
        for (const p of patterns) {
            if (usedTests.has(p.test)) continue;
            const match = text.match(p.pattern);
            if (match) {
                const val = parseFloat(match[1]);
                let flag = p.range ? (val < p.range[0] ? 'L' : val > p.range[1] ? 'H' : '') : '';
                values.push({ test: p.test, value: val, unit: p.unit, flag, range: p.range, interpretation: getInterpretation(p.test, val) });
                usedTests.add(p.test);
            }
        }
        
        // Extract findings (lines starting with -)
        text.split(/[\n\r]+/).forEach(line => {
            const l = line.trim();
            if (l.startsWith('-') && l.length > 15) findings.push(l.substring(1).trim());
        });
        
        const conclusionMatch = text.match(/conclusion[:\s]*([^\n]+)/i);
        return { values, findings: findings.slice(0, 10), impression: conclusionMatch ? conclusionMatch[1].trim() : null };
    };

    // ═══════════════════════════════════════════════════════════════════════
    // ENDOSCOPY PARSER
    // ═══════════════════════════════════════════════════════════════════════
    const parseEndoscopy = (text) => {
        const findings = [];
        const values = [];
        
        const diagMatch = text.match(/diagnosis[:\s]*([^\n]+)/i);
        const dispMatch = text.match(/(?:final )?disposition[:\s]*([^\n]+)/i);
        const commMatch = text.match(/comments?[:\s]*([^\n]+(?:\n(?![A-Z][a-z]+:)[^\n]+)*)/i);
        
        [/polyp[^\.\n]+/gi, /ulcer[^\.\n]+/gi, /erosion[^\.\n]+/gi, /gastritis[^\.\n]+/gi, /duodenitis[^\.\n]+/gi].forEach(p => {
            const matches = text.match(p);
            if (matches) matches.forEach(m => { if (!findings.includes(m.trim())) findings.push(m.trim()); });
        });
        
        const polyp = text.match(/(\d+)\s*mm\s*(?:polyp|pedunculated)/i);
        if (polyp) values.push({ test: 'Polyp Size', value: parseInt(polyp[1]), unit: 'mm', flag: '' });
        
        const bbps = text.match(/BBPS[=:\s]*(\d+)/i);
        if (bbps) values.push({ test: 'BBPS', value: parseInt(bbps[1]), unit: '', flag: '' });
        
        return { 
            values, 
            findings: findings.slice(0, 6), 
            diagnosis: diagMatch ? diagMatch[1].trim() : null,
            disposition: dispMatch ? dispMatch[1].trim() : null,
            comments: commMatch ? commMatch[1].trim() : null,
            impression: diagMatch ? diagMatch[1].trim() : null 
        };
    };

    // ═══════════════════════════════════════════════════════════════════════
    // LAB PARSER
    // ═══════════════════════════════════════════════════════════════════════
    const parseLab = (text) => {
        const patterns = [
            { test: 'WBC', pattern: /WBC[:\s]*(\d+\.?\d*)/i, unit: '×10⁹/L', range: [4, 11] },
            { test: 'Hgb', pattern: /(?:Hgb|Hb|Hemoglobin)[:\s]*(\d+\.?\d*)/i, unit: 'g/dL', range: [12, 17] },
            { test: 'Plt', pattern: /(?:Plt|Platelets?)[:\s]*(\d+)/i, unit: '×10⁹/L', range: [150, 400] },
            { test: 'BUN', pattern: /(?:BUN|Urea)[:\s]*(\d+\.?\d*)/i, unit: 'mg/dL', range: [7, 20] },
            { test: 'Cr', pattern: /(?:Cr|Creatinine)[:\s]*(\d+\.?\d*)/i, unit: 'mg/dL', range: [0.7, 1.3] },
            { test: 'Na', pattern: /(?:Na|Sodium)[:\s]*(\d+)/i, unit: 'mEq/L', range: [136, 145] },
            { test: 'K', pattern: /(?:\bK\b|Potassium)[:\s]*(\d+\.?\d*)/i, unit: 'mEq/L', range: [3.5, 5.0] },
            { test: 'AST', pattern: /(?:AST|SGOT)[:\s]*(\d+)/i, unit: 'U/L', range: [10, 40] },
            { test: 'ALT', pattern: /(?:ALT|SGPT)[:\s]*(\d+)/i, unit: 'U/L', range: [7, 56] },
            { test: 'Glucose', pattern: /(?:Glucose|GLU|FBS|RBS)[:\s]*(\d+)/i, unit: 'mg/dL', range: [70, 100] },
            { test: 'HbA1c', pattern: /(?:HbA1c|A1C)[:\s]*(\d+\.?\d*)/i, unit: '%', range: [4, 5.6] },
            { test: 'Troponin', pattern: /(?:Troponin|TnI)[:\s]*(\d+\.?\d*)/i, unit: 'ng/mL', range: [0, 0.04] },
            { test: 'BNP', pattern: /(?:BNP|proBNP)[:\s]*(\d+)/i, unit: 'pg/mL', range: [0, 100] },
            { test: 'CRP', pattern: /\bCRP[:\s]*(\d+\.?\d*)/i, unit: 'mg/L', range: [0, 10] },
            { test: 'Procalcitonin', pattern: /(?:Procalcitonin|PCT)[:\s]*(\d+\.?\d*)/i, unit: 'ng/mL', range: [0, 0.1] },
            { test: 'TSH', pattern: /TSH[:\s]*(\d+\.?\d*)/i, unit: 'mIU/L', range: [0.4, 4.0] },
            { test: 'INR', pattern: /INR[:\s]*(\d+\.?\d*)/i, unit: '', range: [0.8, 1.1] },
            { test: 'pH', pattern: /\bpH[:\s]*(\d+\.?\d*)/i, unit: '', range: [7.35, 7.45] },
            { test: 'Lactate', pattern: /Lactate[:\s]*(\d+\.?\d*)/i, unit: 'mmol/L', range: [0.5, 2.0] },
        ];
        
        const values = [];
        const usedTests = new Set();
        
        for (const p of patterns) {
            if (usedTests.has(p.test)) continue;
            const match = text.match(p.pattern);
            if (match) {
                const val = parseFloat(match[1]);
                let flag = p.range ? (val < p.range[0] ? 'L' : val > p.range[1] ? 'H' : '') : '';
                values.push({ test: p.test, value: val, unit: p.unit, flag, range: p.range, interpretation: getInterpretation(p.test, val) });
                usedTests.add(p.test);
            }
        }
        
        const tests = values.map(v => v.test);
        let labType = 'General';
        if (tests.some(t => ['WBC', 'Hgb', 'Plt'].includes(t))) labType = 'CBC';
        else if (tests.some(t => ['Cr', 'BUN'].includes(t))) labType = 'RFT';
        else if (tests.some(t => ['AST', 'ALT'].includes(t))) labType = 'LFT';
        else if (tests.some(t => ['Na', 'K'].includes(t))) labType = 'Electrolytes';
        
        return { values, labType };
    };

    // ═══════════════════════════════════════════════════════════════════════
    // GENERATE CLINICAL SUMMARY (FIXED)
    // ═══════════════════════════════════════════════════════════════════════
    const generateClinicalSummary = (result) => {
        const parts = [];
        const critical = [];
        
        for (const v of result.values) {
            if (v.interpretation && ['critical', 'severe'].includes(v.interpretation.severity)) {
                critical.push(`⚠️ ${v.test}: ${v.value}${v.unit} - ${v.interpretation.text}`);
            }
        }
        
        if (critical.length > 0) parts.push('CRITICAL: ' + critical.join('; '));
        
        // FIX: Added 'v &&' check to prevent crash if test is not found
        ['EF', 'Hgb', 'Cr', 'K', 'Troponin', 'Lactate'].forEach(test => {
            const v = result.values.find(x => x.test === test);
            if (v && v.interpretation?.severity !== 'normal') {
                parts.push(`${v.test}: ${v.interpretation?.text || ''}`);
            }
        });
        
        if (result.impression) parts.push(`Impression: ${result.impression}`);
        
        return parts.join(' | ') || 'No significant findings';
    };

    // ═══════════════════════════════════════════════════════════════════════
    // MAIN PARSE FUNCTION
    // ═══════════════════════════════════════════════════════════════════════
    const parse = (text) => {
        if (!text || text.length < 10) return { reportType: 'Unknown', values: [], findings: [] };
        
        const { type, category } = detectReportType(text);
        let result = { reportType: type, category, values: [], findings: [], impression: null, labType: type };
        
        switch (category) {
            case 'Cardiac':
                const echo = parseEcho(text);
                result.values = echo.values;
                result.findings = echo.findings;
                result.impression = echo.impression;
                break;
            case 'Endoscopy':
                const endo = parseEndoscopy(text);
                Object.assign(result, endo);
                break;
            default:
                const lab = parseLab(text);
                result.values = lab.values;
                result.labType = lab.labType;
        }
        
        result.clinicalSummary = generateClinicalSummary(result);
        
        const abnormal = result.values.filter(v => v.flag === 'H' || v.flag === 'L');
        result.summary = abnormal.length > 0 
            ? `${abnormal.length} abnormal: ${abnormal.map(v => `${v.test}${v.flag === 'H' ? '↑' : '↓'}`).join(', ')}`
            : result.values.length > 0 ? `${result.values.length} values normal` : result.findings[0]?.substring(0, 80) || '';
        
        result.source = 'local_parser';
        return result;
    };

    window.LabParser = { version: '3.1', parse, detectReportType, parseEcho, parseEndoscopy, parseLab, getInterpretation, generateClinicalSummary, isReady: true };
    console.log('[LabParser v3.1] Medical Report Parser with Clinical Interpretation (Bug Fixed)');
})();
