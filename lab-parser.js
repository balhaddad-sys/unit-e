/* ═══════════════════════════════════════════════════════════════════════════
   MEDICAL REPORT PARSER v2.0
   Intelligent parser for any clinical document
   Works standalone - no API needed
   ═══════════════════════════════════════════════════════════════════════════ */

(function() {
    'use strict';

    // ═══════════════════════════════════════════════════════════════════════
    // REPORT TYPE DETECTION
    // ═══════════════════════════════════════════════════════════════════════
    const detectReportType = (text) => {
        const t = text.toLowerCase();
        
        // Endoscopy reports
        if (t.includes('colonoscopy') || t.includes('colonic polyp')) 
            return { type: 'Colonoscopy', category: 'Endoscopy' };
        if (t.includes('upper endoscopy') || t.includes('oesophagus') || t.includes('egd report') || t.includes('gastritis'))
            return { type: 'EGD', category: 'Endoscopy' };
        if (t.includes('ercp'))
            return { type: 'ERCP', category: 'Endoscopy' };
        
        // Cardiac
        if (t.includes('echo summary') || t.includes('ejection fraction') || t.includes('left ventricul') || t.includes('cardiomyopathy'))
            return { type: 'Echo', category: 'Cardiac' };
        if (t.includes('cardiac report') || t.includes('m-mode') || t.includes('doppler') || t.includes('lvef') || t.includes('tapse'))
            return { type: 'Echo', category: 'Cardiac' };
        if (t.includes('ecg') || t.includes('electrocardiogram'))
            return { type: 'ECG', category: 'Cardiac' };
        
        // Radiology
        if (t.includes('ct scan') || t.includes('computed tomography'))
            return { type: 'CT', category: 'Radiology' };
        if (t.includes('mri') || t.includes('magnetic resonance'))
            return { type: 'MRI', category: 'Radiology' };
        if (t.includes('x-ray') || t.includes('xray') || t.includes('chest radiograph'))
            return { type: 'X-Ray', category: 'Radiology' };
        if (t.includes('ultrasound') || t.includes('sonograph'))
            return { type: 'Ultrasound', category: 'Radiology' };
        
        // Lab reports
        if (t.includes('complete blood') || (t.includes('wbc') && t.includes('rbc')))
            return { type: 'CBC', category: 'Laboratory' };
        if (t.includes('renal function') || (t.includes('creatinine') && t.includes('bun')))
            return { type: 'RFT', category: 'Laboratory' };
        if (t.includes('liver function') || (t.includes('ast') && t.includes('alt')))
            return { type: 'LFT', category: 'Laboratory' };
        
        // Pathology
        if (t.includes('histopathology') || t.includes('biopsy'))
            return { type: 'Pathology', category: 'Pathology' };
        
        // Default
        if (/\d+\.?\d*\s*(mg\/dl|mmol|g\/dl|u\/l|meq)/i.test(t))
            return { type: 'Laboratory', category: 'Laboratory' };
        
        return { type: 'Clinical Report', category: 'General' };
    };

    // ═══════════════════════════════════════════════════════════════════════
    // ECHO PARSER
    // ═══════════════════════════════════════════════════════════════════════
    const parseEcho = (text) => {
        const values = [];
        const findings = [];
        
        const echoPatterns = [
            { test: 'EF', pattern: /(?:ef|ejection fraction|lvef)[:\s=]*(\d+)\s*%/i, unit: '%', range: [55, 70], critical: true },
            { test: 'EF', pattern: /EF[:\s]+(\d+)%/i, unit: '%', range: [55, 70], critical: true },
            { test: 'EF Biplane', pattern: /EF Biplane[:\s]+(\d+)\s*%/i, unit: '%', range: [55, 70] },
            { test: 'LA Diam', pattern: /LA Diam[:\s]+(\d+\.?\d*)\s*cm/i, unit: 'cm', range: [2.0, 4.0] },
            { test: 'LVIDd', pattern: /(?:LVIDd|LVIDD)[:\s]+(\d+\.?\d*)\s*cm/i, unit: 'cm', range: [3.5, 5.6] },
            { test: 'IVSd', pattern: /IVSd[:\s]+(\d+\.?\d*)\s*cm/i, unit: 'cm', range: [0.6, 1.1] },
            { test: 'LVPWd', pattern: /LVPWd[:\s]+(\d+\.?\d*)\s*cm/i, unit: 'cm', range: [0.6, 1.1] },
            { test: 'TAPSE', pattern: /TAPSE[:\s]+(\d+\.?\d*)\s*cm/i, unit: 'cm', range: [1.6, 2.5] },
            { test: 'RVSP', pattern: /RVSP[:\s=]+(\d+)/i, unit: 'mmHg', range: [15, 30] },
            { test: 'E/E\'', pattern: /E\/E'[:\s]+(\d+\.?\d*)/i, unit: '', range: [6, 14] },
            { test: 'TR maxPG', pattern: /TR maxPG[:\s]+(\d+\.?\d*)/i, unit: 'mmHg', range: [10, 25] },
            { test: 'Ao Diam', pattern: /Ao Diam[:\s]+(\d+\.?\d*)\s*cm/i, unit: 'cm', range: [2.0, 3.7] },
        ];
        
        const usedTests = new Set();
        for (const p of echoPatterns) {
            if (usedTests.has(p.test)) continue;
            const match = text.match(p.pattern);
            if (match) {
                const val = parseFloat(match[1]);
                let flag = '';
                if (p.range) {
                    if (val < p.range[0]) flag = 'L';
                    else if (val > p.range[1]) flag = 'H';
                }
                values.push({ test: p.test, value: val, unit: p.unit, flag, range: p.range, critical: p.critical });
                usedTests.add(p.test);
            }
        }
        
        // Extract findings from text
        const lines = text.split(/[\n\r]+/);
        for (const line of lines) {
            const l = line.trim();
            if (l.startsWith('-') && l.length > 15) {
                findings.push(l.substring(1).trim());
            }
        }
        
        // Conclusion
        const conclusionMatch = text.match(/conclusion[:\s]*([^\n]+(?:\n(?![A-Z])[^\n]+)*)/i);
        const impression = conclusionMatch ? conclusionMatch[1].trim() : null;
        
        return { values, findings: findings.slice(0, 10), impression };
    };

    // ═══════════════════════════════════════════════════════════════════════
    // ENDOSCOPY PARSER
    // ═══════════════════════════════════════════════════════════════════════
    const parseEndoscopy = (text) => {
        const findings = [];
        const values = [];
        
        // Extract diagnosis
        const diagMatch = text.match(/diagnosis[:\s]*([^\n]+)/i);
        const diagnosis = diagMatch ? diagMatch[1].trim() : null;
        
        // Extract disposition
        const dispMatch = text.match(/(?:final )?disposition[:\s]*([^\n]+)/i);
        const disposition = dispMatch ? dispMatch[1].trim() : null;
        
        // Extract comments
        const commMatch = text.match(/comments?[:\s]*([^\n]+(?:\n(?![A-Z][a-z]+:)[^\n]+)*)/i);
        const comments = commMatch ? commMatch[1].trim() : null;
        
        // Key findings
        const patterns = [
            /polyp[^\.\n]+/gi,
            /ulcer[^\.\n]+/gi,
            /erosion[^\.\n]+/gi,
            /gastritis[^\.\n]+/gi,
            /duodenitis[^\.\n]+/gi,
            /normal[^\.\n]+/gi,
        ];
        
        for (const p of patterns) {
            const matches = text.match(p);
            if (matches) {
                for (const m of matches) {
                    if (!findings.includes(m.trim())) findings.push(m.trim());
                }
            }
        }
        
        // Measurements
        const polyp = text.match(/(\d+)\s*mm\s*(?:polyp|pedunculated)/i);
        if (polyp) values.push({ test: 'Polyp Size', value: parseInt(polyp[1]), unit: 'mm', flag: '' });
        
        const bbps = text.match(/BBPS[=:\s]*(\d+)/i);
        if (bbps) values.push({ test: 'BBPS', value: parseInt(bbps[1]), unit: '', flag: '' });
        
        return { values, findings: findings.slice(0, 6), diagnosis, disposition, comments, impression: diagnosis };
    };

    // ═══════════════════════════════════════════════════════════════════════
    // LAB PARSER
    // ═══════════════════════════════════════════════════════════════════════
    const parseLab = (text) => {
        const patterns = [
            { test: 'WBC', pattern: /WBC[:\s]*(\d+\.?\d*)/i, unit: '×10⁹/L', range: [4, 11] },
            { test: 'RBC', pattern: /RBC[:\s]*(\d+\.?\d*)/i, unit: '×10¹²/L', range: [4.5, 5.5] },
            { test: 'Hgb', pattern: /(?:Hgb|Hb|Hemoglobin)[:\s]*(\d+\.?\d*)/i, unit: 'g/dL', range: [12, 17] },
            { test: 'Hct', pattern: /(?:Hct|HCT)[:\s]*(\d+\.?\d*)/i, unit: '%', range: [36, 50] },
            { test: 'Plt', pattern: /(?:Plt|Platelets?)[:\s]*(\d+)/i, unit: '×10⁹/L', range: [150, 400] },
            { test: 'BUN', pattern: /(?:BUN|Urea)[:\s]*(\d+\.?\d*)/i, unit: 'mg/dL', range: [7, 20] },
            { test: 'Cr', pattern: /(?:Cr|Creatinine)[:\s]*(\d+\.?\d*)/i, unit: 'mg/dL', range: [0.7, 1.3] },
            { test: 'Na', pattern: /(?:Na|Sodium)[:\s]*(\d+\.?\d*)/i, unit: 'mEq/L', range: [136, 145] },
            { test: 'K', pattern: /(?:\bK\b|Potassium)[:\s]*(\d+\.?\d*)/i, unit: 'mEq/L', range: [3.5, 5.0] },
            { test: 'Cl', pattern: /(?:Cl|Chloride)[:\s]*(\d+\.?\d*)/i, unit: 'mEq/L', range: [98, 106] },
            { test: 'AST', pattern: /(?:AST|SGOT)[:\s]*(\d+)/i, unit: 'U/L', range: [10, 40] },
            { test: 'ALT', pattern: /(?:ALT|SGPT)[:\s]*(\d+)/i, unit: 'U/L', range: [7, 56] },
            { test: 'ALP', pattern: /(?:ALP)[:\s]*(\d+)/i, unit: 'U/L', range: [44, 147] },
            { test: 'T.Bili', pattern: /(?:T\.?\s*Bili|Total\s*Bilirubin)[:\s]*(\d+\.?\d*)/i, unit: 'mg/dL', range: [0.1, 1.2] },
            { test: 'Albumin', pattern: /Albumin[:\s]*(\d+\.?\d*)/i, unit: 'g/dL', range: [3.5, 5.0] },
            { test: 'PT', pattern: /\bPT[:\s]*(\d+\.?\d*)/i, unit: 'sec', range: [11, 13.5] },
            { test: 'INR', pattern: /INR[:\s]*(\d+\.?\d*)/i, unit: '', range: [0.8, 1.1] },
            { test: 'Glucose', pattern: /(?:Glucose|GLU|FBS|RBS)[:\s]*(\d+)/i, unit: 'mg/dL', range: [70, 100] },
            { test: 'HbA1c', pattern: /(?:HbA1c|A1C)[:\s]*(\d+\.?\d*)/i, unit: '%', range: [4, 5.6] },
            { test: 'Troponin', pattern: /(?:Troponin|TnI)[:\s]*(\d+\.?\d*)/i, unit: 'ng/mL', range: [0, 0.04] },
            { test: 'CRP', pattern: /\bCRP[:\s]*(\d+\.?\d*)/i, unit: 'mg/L', range: [0, 10] },
            { test: 'TSH', pattern: /TSH[:\s]*(\d+\.?\d*)/i, unit: 'mIU/L', range: [0.4, 4.0] },
            { test: 'pH', pattern: /\bpH[:\s]*(\d+\.?\d*)/i, unit: '', range: [7.35, 7.45] },
            { test: 'pCO2', pattern: /pCO2[:\s]*(\d+\.?\d*)/i, unit: 'mmHg', range: [35, 45] },
            { test: 'Lactate', pattern: /Lactate[:\s]*(\d+\.?\d*)/i, unit: 'mmol/L', range: [0.5, 2.0] },
        ];
        
        const values = [];
        const usedTests = new Set();
        
        for (const p of patterns) {
            if (usedTests.has(p.test)) continue;
            const match = text.match(p.pattern);
            if (match) {
                const val = parseFloat(match[1]);
                let flag = '';
                if (p.range) {
                    if (val < p.range[0]) flag = 'L';
                    else if (val > p.range[1]) flag = 'H';
                }
                values.push({ test: p.test, value: val, unit: p.unit, flag, range: p.range });
                usedTests.add(p.test);
            }
        }
        
        let labType = 'General';
        const tests = values.map(v => v.test);
        if (tests.some(t => ['WBC', 'RBC', 'Hgb'].includes(t))) labType = 'CBC';
        else if (tests.some(t => ['Cr', 'BUN'].includes(t))) labType = 'RFT';
        else if (tests.some(t => ['AST', 'ALT'].includes(t))) labType = 'LFT';
        else if (tests.some(t => ['Na', 'K'].includes(t))) labType = 'Electrolytes';
        
        return { values, labType };
    };

    // ═══════════════════════════════════════════════════════════════════════
    // MAIN PARSE FUNCTION
    // ═══════════════════════════════════════════════════════════════════════
    const parse = (text) => {
        if (!text || text.length < 10) {
            return { reportType: 'Unknown', values: [], findings: [] };
        }
        
        const { type, category } = detectReportType(text);
        
        let result = {
            reportType: type,
            category: category,
            values: [],
            findings: [],
            impression: null,
            labType: type
        };
        
        switch (category) {
            case 'Cardiac':
                const echo = parseEcho(text);
                result.values = echo.values;
                result.findings = echo.findings;
                result.impression = echo.impression;
                break;
                
            case 'Endoscopy':
                const endo = parseEndoscopy(text);
                result.values = endo.values;
                result.findings = endo.findings;
                result.impression = endo.impression;
                result.diagnosis = endo.diagnosis;
                result.disposition = endo.disposition;
                result.comments = endo.comments;
                break;
                
            case 'Laboratory':
            default:
                const lab = parseLab(text);
                result.values = lab.values;
                result.labType = lab.labType;
        }
        
        // Summary
        if (result.values.length > 0) {
            const abnormal = result.values.filter(v => v.flag === 'H' || v.flag === 'L');
            if (abnormal.length > 0) {
                result.summary = `${abnormal.length} abnormal: ${abnormal.map(v => `${v.test}${v.flag === 'H' ? '↑' : '↓'}`).join(', ')}`;
            } else {
                result.summary = `${result.values.length} values normal`;
            }
        } else if (result.findings.length > 0) {
            result.summary = result.findings[0].substring(0, 80);
        }
        
        result.source = 'local_parser';
        return result;
    };

    window.LabParser = {
        version: '2.0',
        parse,
        detectReportType,
        parseEcho,
        parseEndoscopy,
        parseLab,
        isReady: true
    };

    console.log('[LabParser v2.0] Medical Report Parser loaded');
})();
