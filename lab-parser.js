/* ═══════════════════════════════════════════════════════════════════════════
   MEDICAL REPORT PARSER v4.0
   Comprehensive parser with clinical interpretation for:
   - Laboratory Results (CBC, RFT, LFT, Coagulation, Cardiac markers, ABG)
   - Echocardiography
   - Endoscopy (EGD, Colonoscopy)
   - Radiology/Imaging (CT, MRI, X-Ray, Ultrasound)
   ═══════════════════════════════════════════════════════════════════════════ */

(function() {
    'use strict';

    // ═══════════════════════════════════════════════════════════════════════
    // REFERENCE RANGES & INTERPRETATION FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════
    const labRanges = {
        // CBC
        WBC:  { range: [4, 11], unit: '×10⁹/L', critical: { low: 1, high: 30 } },
        Hgb:  { range: [12, 17], unit: 'g/dL', critical: { low: 7, high: 20 } },
        Hb:   { range: [12, 17], unit: 'g/dL', critical: { low: 7, high: 20 } },
        Hct:  { range: [36, 50], unit: '%', critical: { low: 20, high: 60 } },
        Plt:  { range: [150, 400], unit: '×10⁹/L', critical: { low: 20, high: 1000 } },
        MCV:  { range: [80, 100], unit: 'fL' },
        MCH:  { range: [27, 33], unit: 'pg' },
        MCHC: { range: [32, 36], unit: 'g/dL' },
        RDW:  { range: [11.5, 14.5], unit: '%' },
        
        // Renal
        Cr:   { range: [0.7, 1.3], unit: 'mg/dL', critical: { high: 10 } },
        Creatinine: { range: [0.7, 1.3], unit: 'mg/dL', critical: { high: 10 } },
        BUN:  { range: [7, 20], unit: 'mg/dL' },
        Urea: { range: [15, 45], unit: 'mg/dL' },
        eGFR: { range: [90, 120], unit: 'mL/min' },
        
        // Electrolytes
        Na:   { range: [136, 145], unit: 'mEq/L', critical: { low: 120, high: 160 } },
        K:    { range: [3.5, 5.0], unit: 'mEq/L', critical: { low: 2.5, high: 6.5 } },
        Cl:   { range: [98, 106], unit: 'mEq/L' },
        CO2:  { range: [22, 29], unit: 'mEq/L' },
        Mg:   { range: [1.7, 2.2], unit: 'mg/dL', critical: { low: 1.0 } },
        Ca:   { range: [8.5, 10.5], unit: 'mg/dL', critical: { low: 6.5, high: 13 } },
        Phos: { range: [2.5, 4.5], unit: 'mg/dL' },
        
        // Liver
        AST:  { range: [10, 40], unit: 'U/L' },
        ALT:  { range: [7, 56], unit: 'U/L' },
        ALP:  { range: [44, 147], unit: 'U/L' },
        GGT:  { range: [9, 48], unit: 'U/L' },
        Bili: { range: [0.1, 1.2], unit: 'mg/dL' },
        'T.Bili': { range: [0.1, 1.2], unit: 'mg/dL' },
        'D.Bili': { range: [0, 0.3], unit: 'mg/dL' },
        Albumin: { range: [3.5, 5.0], unit: 'g/dL' },
        
        // Coagulation
        PT:   { range: [11, 13.5], unit: 'sec' },
        INR:  { range: [0.8, 1.1], unit: '' },
        PTT:  { range: [25, 35], unit: 'sec' },
        aPTT: { range: [25, 35], unit: 'sec' },
        Fibrinogen: { range: [200, 400], unit: 'mg/dL' },
        'D-Dimer': { range: [0, 0.5], unit: 'µg/mL' },
        
        // Cardiac
        Troponin: { range: [0, 0.04], unit: 'ng/mL', critical: { high: 0.1 } },
        TnI:  { range: [0, 0.04], unit: 'ng/mL', critical: { high: 0.1 } },
        TnT:  { range: [0, 0.01], unit: 'ng/mL' },
        BNP:  { range: [0, 100], unit: 'pg/mL' },
        'NT-proBNP': { range: [0, 125], unit: 'pg/mL' },
        CK:   { range: [22, 198], unit: 'U/L' },
        'CK-MB': { range: [0, 5], unit: 'ng/mL' },
        
        // Metabolic
        Glucose: { range: [70, 100], unit: 'mg/dL', critical: { low: 40, high: 500 } },
        FBS:  { range: [70, 100], unit: 'mg/dL' },
        RBS:  { range: [70, 140], unit: 'mg/dL' },
        HbA1c: { range: [4, 5.6], unit: '%' },
        
        // Inflammatory
        CRP:  { range: [0, 10], unit: 'mg/L' },
        ESR:  { range: [0, 20], unit: 'mm/hr' },
        Procalcitonin: { range: [0, 0.1], unit: 'ng/mL' },
        PCT:  { range: [0, 0.1], unit: 'ng/mL' },
        Ferritin: { range: [20, 250], unit: 'ng/mL' },
        
        // ABG
        pH:   { range: [7.35, 7.45], unit: '', critical: { low: 7.1, high: 7.6 } },
        pO2:  { range: [80, 100], unit: 'mmHg', critical: { low: 60 } },
        pCO2: { range: [35, 45], unit: 'mmHg' },
        HCO3: { range: [22, 26], unit: 'mEq/L' },
        'Base Excess': { range: [-2, 2], unit: 'mEq/L' },
        Lactate: { range: [0.5, 2.0], unit: 'mmol/L', critical: { high: 4 } },
        SaO2: { range: [95, 100], unit: '%', critical: { low: 90 } },
        
        // Thyroid
        TSH:  { range: [0.4, 4.0], unit: 'mIU/L' },
        T4:   { range: [4.5, 12], unit: 'µg/dL' },
        'Free T4': { range: [0.8, 1.8], unit: 'ng/dL' },
        T3:   { range: [80, 200], unit: 'ng/dL' },
        
        // Lipids
        'Total Chol': { range: [0, 200], unit: 'mg/dL' },
        LDL:  { range: [0, 100], unit: 'mg/dL' },
        HDL:  { range: [40, 100], unit: 'mg/dL' },
        TG:   { range: [0, 150], unit: 'mg/dL' },
        Triglycerides: { range: [0, 150], unit: 'mg/dL' },
        
        // Echo values
        EF:   { range: [55, 70], unit: '%', critical: { low: 30 } },
        LVEF: { range: [55, 70], unit: '%', critical: { low: 30 } },
        'LA Diam': { range: [2.0, 4.0], unit: 'cm' },
        LVIDd: { range: [3.5, 5.6], unit: 'cm' },
        LVIDs: { range: [2.0, 4.0], unit: 'cm' },
        IVSd: { range: [0.6, 1.1], unit: 'cm' },
        LVPWd: { range: [0.6, 1.1], unit: 'cm' },
        TAPSE: { range: [1.7, 2.5], unit: 'cm' },
        RVSP: { range: [15, 30], unit: 'mmHg' },
        "E/E'": { range: [6, 14], unit: '' },
        'TR maxPG': { range: [10, 25], unit: 'mmHg' },
    };

    // Clinical interpretation functions
    const interpret = {
        EF: (v) => {
            if (v >= 55) return { severity: 'normal', text: 'Normal LV systolic function', color: 'green' };
            if (v >= 45) return { severity: 'mild', text: 'Mildly reduced LVEF', color: 'yellow' };
            if (v >= 35) return { severity: 'moderate', text: 'Moderately reduced LVEF (HFmrEF)', color: 'orange' };
            if (v >= 20) return { severity: 'severe', text: 'Severely reduced LVEF (HFrEF)', color: 'red' };
            return { severity: 'critical', text: 'Critically impaired LVEF - consider advanced HF therapies', color: 'red' };
        },
        RVSP: (v) => {
            if (v <= 30) return { severity: 'normal', text: 'Normal pulmonary pressure', color: 'green' };
            if (v <= 45) return { severity: 'mild', text: 'Mild pulmonary hypertension', color: 'yellow' };
            if (v <= 60) return { severity: 'moderate', text: 'Moderate pulmonary hypertension', color: 'orange' };
            return { severity: 'severe', text: 'Severe pulmonary hypertension - consider PH workup', color: 'red' };
        },
        TAPSE: (v) => {
            if (v >= 1.7) return { severity: 'normal', text: 'Normal RV function', color: 'green' };
            if (v >= 1.4) return { severity: 'mild', text: 'Mildly reduced RV function', color: 'yellow' };
            return { severity: 'reduced', text: 'RV dysfunction - consider RV failure/PE', color: 'red' };
        },
        "E/E'": (v) => {
            if (v <= 8) return { severity: 'normal', text: 'Normal filling pressures', color: 'green' };
            if (v <= 14) return { severity: 'indeterminate', text: 'Indeterminate filling pressures', color: 'yellow' };
            return { severity: 'elevated', text: 'Elevated LV filling pressures', color: 'orange' };
        },
        Hgb: (v) => {
            if (v < 7) return { severity: 'critical', text: 'Severe anemia - consider transfusion', color: 'red' };
            if (v < 10) return { severity: 'moderate', text: 'Moderate anemia - investigate cause', color: 'orange' };
            if (v < 12) return { severity: 'mild', text: 'Mild anemia', color: 'yellow' };
            if (v <= 17) return { severity: 'normal', text: 'Normal hemoglobin', color: 'green' };
            return { severity: 'high', text: 'Polycythemia', color: 'orange' };
        },
        WBC: (v) => {
            if (v < 1) return { severity: 'critical', text: 'Severe neutropenia - infection risk', color: 'red' };
            if (v < 4) return { severity: 'low', text: 'Leukopenia', color: 'yellow' };
            if (v <= 11) return { severity: 'normal', text: 'Normal WBC', color: 'green' };
            if (v <= 20) return { severity: 'elevated', text: 'Leukocytosis - infection/inflammation', color: 'yellow' };
            return { severity: 'high', text: 'Marked leukocytosis - sepsis/leukemia?', color: 'red' };
        },
        Plt: (v) => {
            if (v < 20) return { severity: 'critical', text: 'Severe thrombocytopenia - bleeding risk', color: 'red' };
            if (v < 50) return { severity: 'moderate', text: 'Thrombocytopenia - avoid procedures', color: 'orange' };
            if (v < 150) return { severity: 'mild', text: 'Mild thrombocytopenia', color: 'yellow' };
            if (v <= 400) return { severity: 'normal', text: 'Normal platelets', color: 'green' };
            return { severity: 'high', text: 'Thrombocytosis', color: 'yellow' };
        },
        Cr: (v) => {
            if (v <= 1.2) return { severity: 'normal', text: 'Normal renal function', color: 'green' };
            if (v <= 2.0) return { severity: 'mild', text: 'Mild renal impairment (CKD 2-3)', color: 'yellow' };
            if (v <= 4.0) return { severity: 'moderate', text: 'Moderate CKD - adjust renally-cleared meds', color: 'orange' };
            if (v <= 8.0) return { severity: 'severe', text: 'Severe CKD - nephrology consult', color: 'red' };
            return { severity: 'critical', text: 'Renal failure - consider RRT', color: 'red' };
        },
        K: (v) => {
            if (v < 2.5) return { severity: 'critical', text: 'Severe hypokalemia - cardiac risk', color: 'red' };
            if (v < 3.5) return { severity: 'low', text: 'Hypokalemia - replete', color: 'yellow' };
            if (v <= 5.0) return { severity: 'normal', text: 'Normal potassium', color: 'green' };
            if (v <= 5.5) return { severity: 'mild', text: 'Mild hyperkalemia', color: 'yellow' };
            if (v <= 6.0) return { severity: 'moderate', text: 'Hyperkalemia - check ECG', color: 'orange' };
            return { severity: 'critical', text: 'Severe hyperkalemia - urgent treatment', color: 'red' };
        },
        Na: (v) => {
            if (v < 120) return { severity: 'critical', text: 'Severe hyponatremia - seizure risk', color: 'red' };
            if (v < 130) return { severity: 'moderate', text: 'Moderate hyponatremia', color: 'orange' };
            if (v < 136) return { severity: 'mild', text: 'Mild hyponatremia', color: 'yellow' };
            if (v <= 145) return { severity: 'normal', text: 'Normal sodium', color: 'green' };
            if (v <= 150) return { severity: 'mild', text: 'Mild hypernatremia', color: 'yellow' };
            return { severity: 'severe', text: 'Severe hypernatremia', color: 'red' };
        },
        Troponin: (v) => {
            if (v <= 0.04) return { severity: 'normal', text: 'Normal troponin', color: 'green' };
            if (v <= 0.4) return { severity: 'elevated', text: 'Elevated - myocardial injury', color: 'orange' };
            return { severity: 'high', text: 'Significantly elevated - ACS likely', color: 'red' };
        },
        Lactate: (v) => {
            if (v <= 2.0) return { severity: 'normal', text: 'Normal lactate', color: 'green' };
            if (v <= 4.0) return { severity: 'elevated', text: 'Elevated - tissue hypoperfusion', color: 'orange' };
            return { severity: 'critical', text: 'Severely elevated - shock/sepsis', color: 'red' };
        },
        pH: (v) => {
            if (v < 7.20) return { severity: 'critical', text: 'Severe acidemia', color: 'red' };
            if (v < 7.35) return { severity: 'low', text: 'Acidemia', color: 'orange' };
            if (v <= 7.45) return { severity: 'normal', text: 'Normal pH', color: 'green' };
            if (v <= 7.50) return { severity: 'high', text: 'Alkalemia', color: 'yellow' };
            return { severity: 'critical', text: 'Severe alkalemia', color: 'red' };
        },
        Glucose: (v) => {
            if (v < 50) return { severity: 'critical', text: 'Severe hypoglycemia - treat immediately', color: 'red' };
            if (v < 70) return { severity: 'low', text: 'Hypoglycemia', color: 'orange' };
            if (v <= 100) return { severity: 'normal', text: 'Normal fasting glucose', color: 'green' };
            if (v <= 125) return { severity: 'prediabetes', text: 'Prediabetes range', color: 'yellow' };
            if (v <= 200) return { severity: 'elevated', text: 'Elevated glucose', color: 'orange' };
            return { severity: 'high', text: 'Significantly elevated', color: 'red' };
        },
        HbA1c: (v) => {
            if (v < 5.7) return { severity: 'normal', text: 'Normal', color: 'green' };
            if (v < 6.5) return { severity: 'prediabetes', text: 'Prediabetes', color: 'yellow' };
            if (v < 7.0) return { severity: 'controlled', text: 'DM - good control', color: 'green' };
            if (v < 8.0) return { severity: 'suboptimal', text: 'DM - suboptimal control', color: 'yellow' };
            if (v < 9.0) return { severity: 'poor', text: 'DM - poor control', color: 'orange' };
            return { severity: 'uncontrolled', text: 'DM - uncontrolled', color: 'red' };
        },
        TSH: (v) => {
            if (v < 0.1) return { severity: 'low', text: 'Suppressed - hyperthyroid?', color: 'orange' };
            if (v < 0.4) return { severity: 'low', text: 'Low TSH', color: 'yellow' };
            if (v <= 4.0) return { severity: 'normal', text: 'Euthyroid', color: 'green' };
            if (v <= 10) return { severity: 'elevated', text: 'Subclinical hypothyroid', color: 'yellow' };
            return { severity: 'high', text: 'Hypothyroid', color: 'orange' };
        },
        INR: (v) => {
            if (v <= 1.1) return { severity: 'normal', text: 'Normal coagulation', color: 'green' };
            if (v <= 2.0) return { severity: 'prolonged', text: 'Mildly prolonged', color: 'yellow' };
            if (v <= 3.5) return { severity: 'therapeutic', text: 'Therapeutic range (if on warfarin)', color: 'green' };
            if (v <= 5.0) return { severity: 'elevated', text: 'Supratherapeutic - bleeding risk', color: 'orange' };
            return { severity: 'critical', text: 'Critical - high bleeding risk', color: 'red' };
        },
        BNP: (v) => {
            if (v < 100) return { severity: 'normal', text: 'HF unlikely', color: 'green' };
            if (v < 400) return { severity: 'gray', text: 'Gray zone - clinical correlation', color: 'yellow' };
            return { severity: 'elevated', text: 'HF likely', color: 'orange' };
        },
        CRP: (v) => {
            if (v < 3) return { severity: 'normal', text: 'Normal', color: 'green' };
            if (v < 10) return { severity: 'mild', text: 'Mild inflammation', color: 'yellow' };
            if (v < 50) return { severity: 'moderate', text: 'Moderate inflammation', color: 'orange' };
            return { severity: 'severe', text: 'Severe inflammation/infection', color: 'red' };
        },
        Procalcitonin: (v) => {
            if (v < 0.1) return { severity: 'normal', text: 'Bacterial infection unlikely', color: 'green' };
            if (v < 0.5) return { severity: 'low', text: 'Possible local infection', color: 'yellow' };
            if (v < 2.0) return { severity: 'moderate', text: 'Likely bacterial infection', color: 'orange' };
            return { severity: 'high', text: 'Sepsis likely', color: 'red' };
        },
    };

    // Get interpretation for a value
    const getInterpretation = (test, value) => {
        // Normalize test name
        const normalizedTest = test.replace(/\s+/g, '');
        const fn = interpret[test] || interpret[normalizedTest];
        if (fn && typeof value === 'number') {
            return fn(value);
        }
        // Fallback: use range
        const ref = labRanges[test] || labRanges[normalizedTest];
        if (ref && ref.range) {
            if (value < ref.range[0]) return { severity: 'low', text: 'Below normal', color: 'yellow' };
            if (value > ref.range[1]) return { severity: 'high', text: 'Above normal', color: 'yellow' };
            return { severity: 'normal', text: 'Normal', color: 'green' };
        }
        return null;
    };

    // ═══════════════════════════════════════════════════════════════════════
    // REPORT TYPE DETECTION
    // ═══════════════════════════════════════════════════════════════════════
    const detectReportType = (text) => {
        const t = text.toLowerCase();
        
        // Endoscopy
        if (t.includes('colonoscopy') || t.includes('colonic polyp') || t.includes('bowel prep')) 
            return { type: 'Colonoscopy', category: 'Endoscopy' };
        if (t.includes('upper endoscopy') || t.includes('oesophagus') || t.includes('esophagus') || t.includes('egd') || t.includes('gastroscopy')) 
            return { type: 'EGD', category: 'Endoscopy' };
        if (t.includes('ercp')) 
            return { type: 'ERCP', category: 'Endoscopy' };
        if (t.includes('bronchoscopy')) 
            return { type: 'Bronchoscopy', category: 'Endoscopy' };
        
        // Cardiac
        if (t.includes('echo') || t.includes('echocardiogram') || t.includes('ejection fraction') || t.includes('cardiomyopathy') || 
            t.includes('lvef') || t.includes('m-mode') || t.includes('doppler') && t.includes('cardiac') || t.includes('tapse') || t.includes('rvsp')) 
            return { type: 'Echo', category: 'Cardiac' };
        if (t.includes('stress test') || t.includes('treadmill')) 
            return { type: 'Stress Test', category: 'Cardiac' };
        if (t.includes('holter') || t.includes('24 hour monitor')) 
            return { type: 'Holter', category: 'Cardiac' };
        if (t.includes('electrocardiogram') || (t.includes('ecg') && !t.includes('echo'))) 
            return { type: 'ECG', category: 'Cardiac' };
        
        // Radiology
        if (t.includes('ct scan') || t.includes('computed tomography') || t.includes('ct ')) 
            return { type: 'CT', category: 'Radiology' };
        if (t.includes('mri') || t.includes('magnetic resonance')) 
            return { type: 'MRI', category: 'Radiology' };
        if (t.includes('x-ray') || t.includes('xray') || t.includes('chest radiograph') || t.includes('cxr')) 
            return { type: 'X-Ray', category: 'Radiology' };
        if (t.includes('ultrasound') || t.includes('sonography') || t.includes('doppler')) 
            return { type: 'Ultrasound', category: 'Radiology' };
        if (t.includes('pet scan') || t.includes('pet-ct')) 
            return { type: 'PET', category: 'Radiology' };
        
        // Pathology
        if (t.includes('biopsy') || t.includes('histopath') || t.includes('pathology') || t.includes('cytology')) 
            return { type: 'Pathology', category: 'Pathology' };
        
        // Laboratory
        if (t.includes('wbc') && (t.includes('rbc') || t.includes('hgb') || t.includes('plt'))) 
            return { type: 'CBC', category: 'Laboratory' };
        if (t.includes('creatinine') && (t.includes('bun') || t.includes('urea'))) 
            return { type: 'RFT', category: 'Laboratory' };
        if (t.includes('ast') && t.includes('alt')) 
            return { type: 'LFT', category: 'Laboratory' };
        if (t.includes('ph') && t.includes('pco2')) 
            return { type: 'ABG', category: 'Laboratory' };
        if (t.includes('pt') && t.includes('inr')) 
            return { type: 'Coagulation', category: 'Laboratory' };
        if (t.includes('troponin') || t.includes('bnp')) 
            return { type: 'Cardiac Markers', category: 'Laboratory' };
        if (t.includes('tsh') || t.includes('thyroid')) 
            return { type: 'Thyroid', category: 'Laboratory' };
        if (/\d+\.?\d*\s*(mg\/dl|mmol|u\/l|meq|ng\/ml|pg\/ml)/i.test(t)) 
            return { type: 'Laboratory', category: 'Laboratory' };
        
        return { type: 'Clinical Report', category: 'General' };
    };

    // ═══════════════════════════════════════════════════════════════════════
    // LAB VALUE EXTRACTION PATTERNS
    // ═══════════════════════════════════════════════════════════════════════
    const labPatterns = [
        // CBC
        { test: 'WBC', patterns: [/WBC[:\s]*(\d+\.?\d*)/i, /(?:white blood cells?|leukocytes?)[:\s]*(\d+\.?\d*)/i] },
        { test: 'Hgb', patterns: [/(?:Hgb|Hb|Hemoglobin)[:\s]*(\d+\.?\d*)/i] },
        { test: 'Hct', patterns: [/(?:Hct|Hematocrit)[:\s]*(\d+\.?\d*)/i] },
        { test: 'Plt', patterns: [/(?:Plt|Platelets?)[:\s]*(\d+)/i] },
        { test: 'MCV', patterns: [/MCV[:\s]*(\d+\.?\d*)/i] },
        { test: 'MCH', patterns: [/MCH[:\s]*(\d+\.?\d*)/i] },
        { test: 'RDW', patterns: [/RDW[:\s]*(\d+\.?\d*)/i] },
        
        // Renal
        { test: 'BUN', patterns: [/(?:BUN|Blood Urea Nitrogen)[:\s]*(\d+\.?\d*)/i] },
        { test: 'Urea', patterns: [/Urea[:\s]*(\d+\.?\d*)/i] },
        { test: 'Cr', patterns: [/(?:Cr|Creatinine)[:\s]*(\d+\.?\d*)/i] },
        { test: 'eGFR', patterns: [/(?:eGFR|GFR)[:\s]*(\d+\.?\d*)/i] },
        
        // Electrolytes
        { test: 'Na', patterns: [/(?:Na|Sodium)[:\s]*(\d+\.?\d*)/i] },
        { test: 'K', patterns: [/(?:\bK\b|Potassium)[:\s]*(\d+\.?\d*)/i] },
        { test: 'Cl', patterns: [/(?:Cl|Chloride)[:\s]*(\d+\.?\d*)/i] },
        { test: 'CO2', patterns: [/(?:CO2|Bicarbonate|HCO3)[:\s]*(\d+\.?\d*)/i] },
        { test: 'Mg', patterns: [/(?:Mg|Magnesium)[:\s]*(\d+\.?\d*)/i] },
        { test: 'Ca', patterns: [/(?:Ca|Calcium)[:\s]*(\d+\.?\d*)/i] },
        { test: 'Phos', patterns: [/(?:Phos|Phosphorus|Phosphate)[:\s]*(\d+\.?\d*)/i] },
        
        // Liver
        { test: 'AST', patterns: [/(?:AST|SGOT)[:\s]*(\d+)/i] },
        { test: 'ALT', patterns: [/(?:ALT|SGPT)[:\s]*(\d+)/i] },
        { test: 'ALP', patterns: [/(?:ALP|Alk Phos)[:\s]*(\d+)/i] },
        { test: 'GGT', patterns: [/GGT[:\s]*(\d+)/i] },
        { test: 'T.Bili', patterns: [/(?:T\.?\s*Bili|Total Bilirubin)[:\s]*(\d+\.?\d*)/i] },
        { test: 'D.Bili', patterns: [/(?:D\.?\s*Bili|Direct Bilirubin)[:\s]*(\d+\.?\d*)/i] },
        { test: 'Albumin', patterns: [/Albumin[:\s]*(\d+\.?\d*)/i] },
        
        // Coagulation
        { test: 'PT', patterns: [/\bPT[:\s]*(\d+\.?\d*)\s*(?:sec|s)?/i] },
        { test: 'INR', patterns: [/INR[:\s]*(\d+\.?\d*)/i] },
        { test: 'aPTT', patterns: [/(?:aPTT|PTT)[:\s]*(\d+\.?\d*)/i] },
        { test: 'Fibrinogen', patterns: [/Fibrinogen[:\s]*(\d+)/i] },
        { test: 'D-Dimer', patterns: [/D-?Dimer[:\s]*(\d+\.?\d*)/i] },
        
        // Cardiac markers
        { test: 'Troponin', patterns: [/(?:Troponin|TnI|TnT|hs-?Trop)[:\s]*(\d+\.?\d*)/i] },
        { test: 'BNP', patterns: [/(?:BNP|NT-?proBNP)[:\s]*(\d+)/i] },
        { test: 'CK', patterns: [/\bCK[:\s]*(\d+)/i] },
        { test: 'CK-MB', patterns: [/CK-?MB[:\s]*(\d+\.?\d*)/i] },
        
        // Metabolic
        { test: 'Glucose', patterns: [/(?:Glucose|GLU|FBS|RBS|Blood Sugar)[:\s]*(\d+)/i] },
        { test: 'HbA1c', patterns: [/(?:HbA1c|A1C|Glycated Hb)[:\s]*(\d+\.?\d*)/i] },
        
        // Inflammatory
        { test: 'CRP', patterns: [/\bCRP[:\s]*(\d+\.?\d*)/i, /C-reactive protein[:\s]*(\d+\.?\d*)/i] },
        { test: 'ESR', patterns: [/ESR[:\s]*(\d+)/i] },
        { test: 'Procalcitonin', patterns: [/(?:Procalcitonin|PCT)[:\s]*(\d+\.?\d*)/i] },
        { test: 'Ferritin', patterns: [/Ferritin[:\s]*(\d+)/i] },
        
        // ABG
        { test: 'pH', patterns: [/\bpH[:\s]*(\d+\.?\d*)/i] },
        { test: 'pO2', patterns: [/pO2[:\s]*(\d+\.?\d*)/i] },
        { test: 'pCO2', patterns: [/pCO2[:\s]*(\d+\.?\d*)/i] },
        { test: 'HCO3', patterns: [/HCO3[:\s]*(\d+\.?\d*)/i] },
        { test: 'Lactate', patterns: [/Lactate[:\s]*(\d+\.?\d*)/i] },
        { test: 'SaO2', patterns: [/(?:SaO2|SpO2|O2 Sat)[:\s]*(\d+\.?\d*)/i] },
        
        // Thyroid
        { test: 'TSH', patterns: [/TSH[:\s]*(\d+\.?\d*)/i] },
        { test: 'Free T4', patterns: [/(?:Free T4|FT4)[:\s]*(\d+\.?\d*)/i] },
        { test: 'T3', patterns: [/\bT3[:\s]*(\d+\.?\d*)/i] },
        
        // Lipids
        { test: 'Total Chol', patterns: [/(?:Total Chol|Cholesterol)[:\s]*(\d+)/i] },
        { test: 'LDL', patterns: [/LDL[:\s]*(\d+)/i] },
        { test: 'HDL', patterns: [/HDL[:\s]*(\d+)/i] },
        { test: 'TG', patterns: [/(?:TG|Triglycerides?)[:\s]*(\d+)/i] },
    ];

    // Echo patterns
    const echoPatterns = [
        { test: 'EF', patterns: [/(?:EF|ejection fraction|LVEF)[:\s=]*(\d+)\s*%/i, /EF[:\s]+(\d+)%/i, /EF\s*(?:A-L\s*)?(?:A4C|MOD)?[:\s]+(\d+)\s*%/i] },
        { test: 'LA Diam', patterns: [/LA Diam[:\s]+(\d+\.?\d*)\s*cm/i, /Left Atrium[:\s]+(\d+\.?\d*)\s*cm/i] },
        { test: 'LVIDd', patterns: [/LVIDd[:\s]+(\d+\.?\d*)\s*cm/i, /LV diastolic[:\s]+(\d+\.?\d*)/i] },
        { test: 'LVIDs', patterns: [/LVIDs[:\s]+(\d+\.?\d*)\s*cm/i] },
        { test: 'IVSd', patterns: [/IVSd[:\s]+(\d+\.?\d*)\s*cm/i] },
        { test: 'LVPWd', patterns: [/LVPWd[:\s]+(\d+\.?\d*)\s*cm/i] },
        { test: 'TAPSE', patterns: [/TAPSE[:\s]+(\d+\.?\d*)\s*cm/i] },
        { test: 'RVSP', patterns: [/RVSP[:\s=]+(\d+)/i, /RV systolic pressure[:\s]+(\d+)/i] },
        { test: "E/E'", patterns: [/E\/E'[:\s]+(\d+\.?\d*)/i, /E\/e'[:\s]+(\d+\.?\d*)/i] },
        { test: 'TR maxPG', patterns: [/TR maxPG[:\s]+(\d+\.?\d*)/i, /TR gradient[:\s]+(\d+\.?\d*)/i] },
        { test: 'Ao Root', patterns: [/Ao(?:rtic)? Root[:\s]+(\d+\.?\d*)\s*cm/i] },
        { test: 'RV', patterns: [/\bRV[:\s]+(\d+\.?\d*)\s*cm/i] },
    ];

    // ═══════════════════════════════════════════════════════════════════════
    // PARSERS
    // ═══════════════════════════════════════════════════════════════════════
    const parseLab = (text) => {
        const values = [];
        const usedTests = new Set();
        
        for (const item of labPatterns) {
            if (usedTests.has(item.test)) continue;
            for (const pattern of item.patterns) {
                const match = text.match(pattern);
                if (match) {
                    const val = parseFloat(match[1]);
                    const ref = labRanges[item.test];
                    let flag = '';
                    if (ref?.range) {
                        if (val < ref.range[0]) flag = 'L';
                        else if (val > ref.range[1]) flag = 'H';
                    }
                    const interp = getInterpretation(item.test, val);
                    values.push({
                        test: item.test,
                        value: val,
                        unit: ref?.unit || '',
                        flag,
                        range: ref?.range,
                        interpretation: interp,
                        critical: ref?.critical && ((ref.critical.low && val < ref.critical.low) || (ref.critical.high && val > ref.critical.high))
                    });
                    usedTests.add(item.test);
                    break;
                }
            }
        }
        
        // Determine lab type
        const tests = values.map(v => v.test);
        let labType = 'General';
        if (tests.some(t => ['WBC', 'Hgb', 'Plt'].includes(t))) labType = 'CBC';
        else if (tests.some(t => ['Cr', 'BUN', 'Urea'].includes(t))) labType = 'RFT';
        else if (tests.some(t => ['AST', 'ALT'].includes(t))) labType = 'LFT';
        else if (tests.some(t => ['Na', 'K'].includes(t))) labType = 'Electrolytes';
        else if (tests.some(t => ['pH', 'pCO2'].includes(t))) labType = 'ABG';
        else if (tests.some(t => ['PT', 'INR'].includes(t))) labType = 'Coagulation';
        else if (tests.some(t => ['Troponin', 'BNP'].includes(t))) labType = 'Cardiac Markers';
        
        return { values, labType };
    };

    const parseEcho = (text) => {
        const values = [];
        const findings = [];
        const usedTests = new Set();
        
        for (const item of echoPatterns) {
            if (usedTests.has(item.test)) continue;
            for (const pattern of item.patterns) {
                const match = text.match(pattern);
                if (match) {
                    const val = parseFloat(match[1]);
                    const ref = labRanges[item.test];
                    let flag = '';
                    if (ref?.range) {
                        if (val < ref.range[0]) flag = 'L';
                        else if (val > ref.range[1]) flag = 'H';
                    }
                    const interp = getInterpretation(item.test, val);
                    values.push({
                        test: item.test,
                        value: val,
                        unit: ref?.unit || '',
                        flag,
                        range: ref?.range,
                        interpretation: interp
                    });
                    usedTests.add(item.test);
                    break;
                }
            }
        }
        
        // Extract findings (lines starting with -)
        text.split(/[\n\r]+/).forEach(line => {
            const l = line.trim();
            if (l.startsWith('-') && l.length > 10) findings.push(l.substring(1).trim());
        });
        
        // Extract conclusion/impression
        const conclusionMatch = text.match(/(?:conclusion|impression|summary)[:\s]*([^\n]+(?:\n(?![A-Z][a-z]+:)[^\n]+)*)/i);
        
        return { 
            values, 
            findings: findings.slice(0, 10), 
            impression: conclusionMatch ? conclusionMatch[1].trim() : null 
        };
    };

    const parseEndoscopy = (text) => {
        const findings = [];
        const values = [];
        
        // Extract structured fields
        const diagMatch = text.match(/diagnosis[:\s]*([^\n]+)/i);
        const dispMatch = text.match(/(?:final )?disposition[:\s]*([^\n]+)/i);
        const commMatch = text.match(/comments?[:\s]*([^\n]+(?:\n(?![A-Z][a-z]+:)[^\n]+)*)/i);
        const indicMatch = text.match(/indication[:\s]*([^\n]+)/i);
        
        // Find pathology
        const patterns = [
            /polyp[^\.\n]*/gi, /ulcer[^\.\n]*/gi, /erosion[^\.\n]*/gi, 
            /gastritis[^\.\n]*/gi, /duodenitis[^\.\n]*/gi, /esophagitis[^\.\n]*/gi,
            /barrett[^\.\n]*/gi, /varices[^\.\n]*/gi, /stricture[^\.\n]*/gi,
            /mass[^\.\n]*/gi, /tumor[^\.\n]*/gi, /cancer[^\.\n]*/gi,
            /diverticul[^\.\n]*/gi, /hemorrhoid[^\.\n]*/gi
        ];
        
        for (const p of patterns) {
            const matches = text.match(p);
            if (matches) {
                for (const m of matches) {
                    const trimmed = m.trim();
                    if (!findings.some(f => f.toLowerCase() === trimmed.toLowerCase())) {
                        findings.push(trimmed);
                    }
                }
            }
        }
        
        // Extract measurements
        const polypMatch = text.match(/(\d+)\s*mm\s*(?:polyp|pedunculated|sessile)/i);
        if (polypMatch) values.push({ test: 'Polyp Size', value: parseInt(polypMatch[1]), unit: 'mm', flag: parseInt(polypMatch[1]) >= 10 ? 'H' : '' });
        
        const bbpsMatch = text.match(/BBPS[=:\s]*(\d+)/i);
        if (bbpsMatch) values.push({ test: 'BBPS', value: parseInt(bbpsMatch[1]), unit: '', flag: '' });
        
        return {
            values,
            findings: findings.slice(0, 10),
            diagnosis: diagMatch?.[1]?.trim(),
            disposition: dispMatch?.[1]?.trim(),
            comments: commMatch?.[1]?.trim(),
            indication: indicMatch?.[1]?.trim(),
            impression: diagMatch?.[1]?.trim() || findings[0]
        };
    };

    const parseRadiology = (text) => {
        const findings = [];
        const values = [];
        
        // Extract impression/conclusion
        const impressionMatch = text.match(/(?:impression|conclusion|summary)[:\s]*([^\n]+(?:\n(?![A-Z][a-z]+:)[^\n]+)*)/i);
        const findingsMatch = text.match(/findings[:\s]*([^\n]+(?:\n(?![A-Z][a-z]+:)[^\n]+)*)/i);
        
        // Common radiology findings
        const keywords = [
            /nodule[^\.\n]*/gi, /mass[^\.\n]*/gi, /lesion[^\.\n]*/gi,
            /consolidation[^\.\n]*/gi, /infiltrate[^\.\n]*/gi, /effusion[^\.\n]*/gi,
            /pneumonia[^\.\n]*/gi, /pneumothorax[^\.\n]*/gi, /edema[^\.\n]*/gi,
            /fracture[^\.\n]*/gi, /stenosis[^\.\n]*/gi, /aneurysm[^\.\n]*/gi,
            /thrombosis[^\.\n]*/gi, /embolism[^\.\n]*/gi, /infarct[^\.\n]*/gi,
            /tumor[^\.\n]*/gi, /metastas[^\.\n]*/gi, /lymphadenopathy[^\.\n]*/gi,
            /calcification[^\.\n]*/gi, /atherosclerosis[^\.\n]*/gi
        ];
        
        for (const p of keywords) {
            const matches = text.match(p);
            if (matches) {
                for (const m of matches) {
                    const trimmed = m.trim();
                    if (!findings.some(f => f.toLowerCase() === trimmed.toLowerCase())) {
                        findings.push(trimmed);
                    }
                }
            }
        }
        
        // Extract measurements
        const sizeMatch = text.match(/(\d+\.?\d*)\s*(?:x\s*\d+\.?\d*\s*)?(?:x\s*\d+\.?\d*\s*)?(?:cm|mm)/gi);
        if (sizeMatch) {
            sizeMatch.slice(0, 3).forEach((m, i) => {
                const numMatch = m.match(/(\d+\.?\d*)/);
                if (numMatch) {
                    values.push({ test: `Size ${i + 1}`, value: parseFloat(numMatch[1]), unit: m.includes('cm') ? 'cm' : 'mm', flag: '' });
                }
            });
        }
        
        return {
            values,
            findings: findings.slice(0, 10),
            impression: impressionMatch?.[1]?.trim(),
            rawFindings: findingsMatch?.[1]?.trim()
        };
    };

    // ═══════════════════════════════════════════════════════════════════════
    // CLINICAL SUMMARY GENERATOR
    // ═══════════════════════════════════════════════════════════════════════
    const generateAlerts = (values) => {
        const alerts = [];
        
        for (const v of values) {
            if (v.critical) {
                alerts.push({ level: 'critical', text: `🔴 ${v.test}: ${v.value}${v.unit} - ${v.interpretation?.text || 'CRITICAL'}` });
            } else if (v.interpretation?.severity === 'severe' || v.interpretation?.severity === 'critical') {
                alerts.push({ level: 'severe', text: `🔴 ${v.test}: ${v.value}${v.unit} - ${v.interpretation.text}` });
            } else if (v.interpretation?.severity === 'moderate') {
                alerts.push({ level: 'moderate', text: `🟠 ${v.test}: ${v.value}${v.unit} - ${v.interpretation.text}` });
            }
        }
        
        return alerts;
    };

    const generateClinicalSummary = (result) => {
        const parts = [];
        const alerts = generateAlerts(result.values);
        
        // Critical alerts first
        const criticals = alerts.filter(a => a.level === 'critical' || a.level === 'severe');
        if (criticals.length > 0) {
            parts.push('⚠️ ' + criticals.map(a => a.text).join(' | '));
        }
        
        // Key findings
        const keyTests = ['EF', 'Hgb', 'Cr', 'K', 'Na', 'Troponin', 'Lactate', 'pH'];
        for (const test of keyTests) {
            const v = result.values.find(x => x.test === test);
            if (v && v.flag && v.interpretation) {
                parts.push(`${v.test}: ${v.interpretation.text}`);
            }
        }
        
        // Impression
        if (result.impression) {
            parts.push(`Impression: ${result.impression.substring(0, 100)}`);
        }
        
        // Findings summary
        if (result.findings?.length > 0) {
            parts.push(`Findings: ${result.findings.slice(0, 3).join('; ')}`);
        }
        
        return parts.join(' | ') || 'No significant findings';
    };

    // ═══════════════════════════════════════════════════════════════════════
    // MAIN PARSE FUNCTION
    // ═══════════════════════════════════════════════════════════════════════
    const parse = (text) => {
        if (!text || text.length < 10) {
            return { reportType: 'Unknown', values: [], findings: [], alerts: [], clinicalSummary: '' };
        }
        
        const { type, category } = detectReportType(text);
        
        let result = {
            reportType: type,
            category: category,
            values: [],
            findings: [],
            impression: null,
            labType: type,
            alerts: [],
            clinicalSummary: ''
        };
        
        // Parse based on category
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
                
            case 'Radiology':
                const rad = parseRadiology(text);
                result.values = rad.values;
                result.findings = rad.findings;
                result.impression = rad.impression;
                break;
                
            case 'Laboratory':
            default:
                const lab = parseLab(text);
                result.values = lab.values;
                result.labType = lab.labType;
        }
        
        // Generate alerts and summary
        result.alerts = generateAlerts(result.values);
        result.clinicalSummary = generateClinicalSummary(result);
        
        // Simple summary
        const abnormal = result.values.filter(v => v.flag === 'H' || v.flag === 'L');
        if (result.alerts.length > 0) {
            result.summary = result.alerts[0].text;
        } else if (abnormal.length > 0) {
            result.summary = `${abnormal.length} abnormal: ${abnormal.map(v => `${v.test}${v.flag === 'H' ? '↑' : '↓'}`).join(', ')}`;
        } else if (result.values.length > 0) {
            result.summary = `${result.values.length} values within normal limits`;
        } else if (result.findings.length > 0) {
            result.summary = result.findings[0].substring(0, 80);
        } else if (result.impression) {
            result.summary = result.impression.substring(0, 80);
        } else {
            result.summary = type;
        }
        
        result.source = 'local_parser';
        return result;
    };

    // ═══════════════════════════════════════════════════════════════════════
    // EXPORT
    // ═══════════════════════════════════════════════════════════════════════
    window.LabParser = {
        version: '4.0',
        parse,
        detectReportType,
        parseLab,
        parseEcho,
        parseEndoscopy,
        parseRadiology,
        getInterpretation,
        generateAlerts,
        generateClinicalSummary,
        labRanges,
        isReady: true
    };
    
    console.log('[LabParser v4.0] Comprehensive Medical Report Parser loaded');
    console.log('[LabParser] Supports: Labs, Echo, Endoscopy, Radiology with clinical interpretation');
})();
