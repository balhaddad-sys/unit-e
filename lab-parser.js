/* ═══════════════════════════════════════════════════════════════════════════
   MEDICAL REPORT PARSER v5.0 - ENHANCED
   Improvements: 
   - Fuzzy matching for OCR errors
   - Multi-format value extraction
   - Context-aware parsing
   - Confidence scoring
   - Unit normalization
   ═══════════════════════════════════════════════════════════════════════════ */

(function() {
    'use strict';

    // ═══════════════════════════════════════════════════════════════════════
    // ENHANCED REFERENCE RANGES WITH ALIASES AND UNIT VARIANTS
    // ═══════════════════════════════════════════════════════════════════════
    const labRanges = {
        // CBC - with all common aliases and OCR error variants
        WBC: { 
            range: [4, 11], 
            unit: '×10⁹/L', 
            critical: { low: 1, high: 30 },
            aliases: ['WBC', 'WHITE BLOOD CELL', 'WHITE CELLS', 'LEUKOCYTES', 'LEUCOCYTES', 'TLC', 'TOTAL LEUKOCYTE COUNT', 'W. B.C', 'W.B.C.'],
            unitVariants: ['10^9/L', 'x10^9/L', '10^3/uL', 'K/uL', 'thou/uL', '/mm3'],
            ocrErrors: ['WEC', 'W8C', 'VBC', 'VVBC']
        },
        Hgb: { 
            range: [12, 17], 
            unit: 'g/dL', 
            critical: { low: 7, high: 20 },
            aliases: ['HGB', 'HB', 'HEMOGLOBIN', 'HAEMOGLOBIN', 'HG'],
            unitVariants: ['g/dL', 'g/dl', 'g/L', 'gm/dL', 'gm/dl'],
            // Conversion: g/L to g/dL = divide by 10
            convertFrom: { 'g/L': (v) => v / 10 },
            ocrErrors: ['H68', 'HG8', 'HBG']
        },
        Hct:  { 
            range: [36, 50], 
            unit: '%', 
            critical: { low: 20, high: 60 },
            aliases: ['HCT', 'HEMATOCRIT', 'HAEMATOCRIT', 'PCV', 'PACKED CELL VOLUME'],
            ocrErrors: ['HCI', 'HC1']
        },
        Plt: { 
            range: [150, 400], 
            unit: '×10⁹/L', 
            critical: { low: 20, high: 1000 },
            aliases: ['PLT', 'PLATELET', 'PLATELETS', 'PLATELET COUNT', 'THROMBOCYTES'],
            unitVariants: ['10^9/L', 'x10^9/L', '10^3/uL', 'K/uL', 'thou/uL'],
            ocrErrors: ['PIT', 'P1T', 'PLI']
        },
        MCV: { 
            range: [80, 100], 
            unit: 'fL',
            aliases: ['MCV', 'MEAN CORPUSCULAR VOLUME', 'MEAN CELL VOLUME'],
            ocrErrors: ['MCV', 'NCV', 'MC V']
        },
        MCH: { 
            range:  [27, 33], 
            unit: 'pg',
            aliases: ['MCH', 'MEAN CORPUSCULAR HEMOGLOBIN', 'MEAN CELL HEMOGLOBIN'],
            ocrErrors: ['M CH', 'NCH']
        },
        MCHC:  { 
            range: [32, 36], 
            unit: 'g/dL',
            aliases: ['MCHC', 'MEAN CORPUSCULAR HEMOGLOBIN CONCENTRATION'],
            ocrErrors:  ['MCHC', 'M CHC']
        },
        RDW: { 
            range: [11.5, 14.5], 
            unit: '%',
            aliases: ['RDW', 'RDW-CV', 'RED CELL DISTRIBUTION WIDTH'],
            ocrErrors: ['ROW', 'RDV']
        },
        RBC: {
            range: [4.0, 6.0],
            unit: '×10¹²/L',
            aliases: ['RBC', 'RED BLOOD CELL', 'RED CELLS', 'ERYTHROCYTES', 'R.B.C'],
            unitVariants: ['10^12/L', 'x10^12/L', 'M/uL', 'mil/uL'],
            ocrErrors: ['R8C', 'REC']
        },

        // Renal Function
        Cr: { 
            range: [0.7, 1.3], 
            unit: 'mg/dL', 
            critical:  { high: 10 },
            aliases: ['CR', 'CREATININE', 'CREAT', 'S. CREATININE', 'SERUM CREATININE'],
            unitVariants: ['mg/dL', 'mg/dl', 'umol/L', 'μmol/L'],
            convertFrom: { 'umol/L': (v) => v / 88.4, 'μmol/L':  (v) => v / 88.4 },
            ocrErrors: ['C R', 'CK'] // Note: CK could be misread, need context
        },
        BUN: { 
            range: [7, 20], 
            unit: 'mg/dL',
            aliases:  ['BUN', 'BLOOD UREA NITROGEN', 'B.U.N'],
            unitVariants: ['mg/dL', 'mg/dl', 'mmol/L'],
            convertFrom: { 'mmol/L': (v) => v * 2.8 },
            ocrErrors: ['8UN', 'BUM']
        },
        Urea: { 
            range: [15, 45], 
            unit: 'mg/dL',
            aliases: ['UREA', 'BLOOD UREA', 'S.UREA', 'SERUM UREA'],
            ocrErrors: ['UR EA', 'UERA']
        },
        eGFR: { 
            range:  [90, 120], 
            unit: 'mL/min/1.73m²',
            aliases: ['EGFR', 'GFR', 'ESTIMATED GFR', 'E-GFR'],
            ocrErrors:  ['EGFR', 'E GFR']
        },

        // Electrolytes
        Na: { 
            range: [136, 145], 
            unit: 'mEq/L', 
            critical:  { low: 120, high: 160 },
            aliases: ['NA', 'SODIUM', 'NA+', 'S. SODIUM', 'SERUM SODIUM'],
            unitVariants:  ['mEq/L', 'meq/L', 'mmol/L'],
            ocrErrors: ['N A', 'MA'] // MA could be misread
        },
        K: { 
            range: [3.5, 5.0], 
            unit: 'mEq/L', 
            critical:  { low: 2.5, high: 6.5 },
            aliases: ['K', 'POTASSIUM', 'K+', 'S. POTASSIUM', 'SERUM POTASSIUM'],
            unitVariants:  ['mEq/L', 'meq/L', 'mmol/L'],
            ocrErrors: ['K+', 'X'] // Context needed
        },
        Cl: { 
            range:  [98, 106], 
            unit: 'mEq/L',
            aliases: ['CL', 'CHLORIDE', 'CL-', 'S. CHLORIDE', 'SERUM CHLORIDE'],
            unitVariants: ['mEq/L', 'meq/L', 'mmol/L'],
            ocrErrors:  ['C1', 'CI']
        },
        Ca: { 
            range: [8.5, 10.5], 
            unit: 'mg/dL', 
            critical:  { low: 6.5, high: 13 },
            aliases:  ['CA', 'CALCIUM', 'CA++', 'S. CALCIUM', 'SERUM CALCIUM', 'TOTAL CALCIUM'],
            unitVariants: ['mg/dL', 'mg/dl', 'mmol/L'],
            convertFrom: { 'mmol/L':  (v) => v * 4 },
            ocrErrors: ['C A', 'GA']
        },
        Mg: { 
            range: [1.7, 2.4], 
            unit: 'mg/dL',
            aliases: ['MG', 'MAGNESIUM', 'S.MAGNESIUM', 'SERUM MAGNESIUM'],
            unitVariants: ['mg/dL', 'mg/dl', 'mmol/L', 'mEq/L'],
            convertFrom: { 'mmol/L':  (v) => v * 2.43 },
            ocrErrors: ['M G', 'NG']
        },
        Phos: { 
            range: [2.5, 4.5], 
            unit: 'mg/dL',
            aliases: ['PHOS', 'PHOSPHORUS', 'PHOSPHATE', 'PO4', 'S.PHOSPHORUS', 'INORGANIC PHOSPHORUS'],
            unitVariants: ['mg/dL', 'mg/dl', 'mmol/L'],
            convertFrom: { 'mmol/L': (v) => v * 3.1 },
            ocrErrors: ['PH0S', 'PHOS']
        },

        // Liver Function
        AST: { 
            range: [10, 40], 
            unit: 'U/L', 
            critical: { high: 1000 },
            aliases: ['AST', 'SGOT', 'ASPARTATE AMINOTRANSFERASE', 'ASPARTATE TRANSAMINASE'],
            unitVariants: ['U/L', 'u/L', 'IU/L'],
            ocrErrors: ['A5T', 'AS1']
        },
        ALT: { 
            range:  [7, 56], 
            unit: 'U/L', 
            critical:  { high: 1000 },
            aliases: ['ALT', 'SGPT', 'ALANINE AMINOTRANSFERASE', 'ALANINE TRANSAMINASE'],
            unitVariants: ['U/L', 'u/L', 'IU/L'],
            ocrErrors: ['A1T', 'AL1']
        },
        ALP: { 
            range: [44, 147], 
            unit: 'U/L',
            aliases: ['ALP', 'ALKALINE PHOSPHATASE', 'ALK PHOS', 'ALKP'],
            unitVariants: ['U/L', 'u/L', 'IU/L'],
            ocrErrors:  ['A1P', 'AIP']
        },
        GGT:  { 
            range: [9, 48], 
            unit: 'U/L',
            aliases: ['GGT', 'GAMMA GT', 'GAMMA-GLUTAMYL TRANSFERASE', 'GGTP'],
            unitVariants: ['U/L', 'u/L', 'IU/L'],
            ocrErrors: ['GGI', 'G6T']
        },
        Tbili: { 
            range: [0.1, 1.2], 
            unit: 'mg/dL',
            aliases: ['TBILI', 'TOTAL BILIRUBIN', 'T. BILI', 'BILIRUBIN TOTAL', 'T BILIRUBIN'],
            unitVariants: ['mg/dL', 'mg/dl', 'umol/L', 'μmol/L'],
            convertFrom: { 'umol/L':  (v) => v / 17.1, 'μmol/L': (v) => v / 17.1 },
            ocrErrors: ['T8ILI', 'TBIL1']
        },
        Dbili: { 
            range: [0.0, 0.3], 
            unit: 'mg/dL',
            aliases: ['DBILI', 'DIRECT BILIRUBIN', 'D.BILI', 'BILIRUBIN DIRECT', 'CONJUGATED BILIRUBIN'],
            ocrErrors: ['D8ILI', 'DBIL1']
        },
        Albumin: { 
            range: [3.5, 5.0], 
            unit: 'g/dL',
            aliases: ['ALBUMIN', 'ALB', 'S.ALBUMIN', 'SERUM ALBUMIN'],
            unitVariants: ['g/dL', 'g/dl', 'g/L'],
            convertFrom: { 'g/L': (v) => v / 10 },
            ocrErrors:  ['A1BUMIN', 'ALBUMEN']
        },

        // Coagulation
        PT: { 
            range: [11, 13. 5], 
            unit: 'sec',
            aliases:  ['PT', 'PROTHROMBIN TIME', 'PROTIME'],
            ocrErrors: ['PI', 'P1']
        },
        INR: { 
            range: [0.8, 1.2], 
            unit: '',
            critical: { high: 5 },
            aliases: ['INR', 'INTERNATIONAL NORMALIZED RATIO'],
            ocrErrors: ['1NR', 'IMR']
        },
        PTT:  { 
            range: [25, 35], 
            unit: 'sec',
            aliases: ['PTT', 'APTT', 'ACTIVATED PARTIAL THROMBOPLASTIN TIME', 'PARTIAL THROMBOPLASTIN TIME'],
            ocrErrors: ['PTI', 'P1T']
        },

        // Cardiac Markers
        Troponin: { 
            range: [0, 0.04], 
            unit: 'ng/mL', 
            critical:  { high: 0.1 },
            aliases: ['TROPONIN', 'TROP', 'TROPONIN I', 'TROPONIN T', 'TROP I', 'TROP T', 'HS-TROPONIN', 'HSTROP'],
            unitVariants: ['ng/mL', 'ng/ml', 'pg/mL', 'ng/L'],
            convertFrom: { 'pg/mL':  (v) => v / 1000, 'ng/L': (v) => v / 1000 },
            ocrErrors: ['TROPON1N', 'TR0PONIN']
        },
        BNP: { 
            range: [0, 100], 
            unit: 'pg/mL',
            aliases: ['BNP', 'NT-PROBNP', 'BRAIN NATRIURETIC PEPTIDE', 'PROBNP'],
            unitVariants: ['pg/mL', 'pg/ml', 'ng/L'],
            ocrErrors: ['8NP', 'BMP']
        },
        CK: { 
            range: [30, 200], 
            unit: 'U/L',
            aliases: ['CK', 'CPK', 'CREATINE KINASE', 'CREATINE PHOSPHOKINASE'],
            unitVariants: ['U/L', 'u/L', 'IU/L'],
            ocrErrors: ['CX', 'C K']
        },
        CKMB: { 
            range: [0, 5], 
            unit:  'ng/mL',
            aliases: ['CKMB', 'CK-MB', 'CK MB'],
            ocrErrors: ['CKM8', 'CKNB']
        },
        LDH: { 
            range: [140, 280], 
            unit: 'U/L',
            aliases: ['LDH', 'LACTATE DEHYDROGENASE', 'LD'],
            unitVariants: ['U/L', 'u/L', 'IU/L'],
            ocrErrors:  ['1DH', 'LOH']
        },

        // ABG
        pH:  { 
            range: [7.35, 7.45], 
            unit: '', 
            critical:  { low: 7.2, high: 7.6 },
            aliases: ['PH', 'BLOOD PH', 'ARTERIAL PH'],
            ocrErrors: ['P H']
        },
        pCO2: { 
            range:  [35, 45], 
            unit: 'mmHg', 
            critical:  { low: 20, high: 70 },
            aliases: ['PCO2', 'PACO2', 'CARBON DIOXIDE', 'CO2 PARTIAL PRESSURE'],
            ocrErrors: ['PCO 2', 'PC02']
        },
        pO2: { 
            range: [80, 100], 
            unit: 'mmHg', 
            critical:  { low: 50 },
            aliases:  ['PO2', 'PAO2', 'OXYGEN', 'O2 PARTIAL PRESSURE'],
            ocrErrors: ['PO 2', 'P02']
        },
        HCO3: { 
            range: [22, 26], 
            unit: 'mEq/L', 
            critical:  { low: 10, high: 40 },
            aliases: ['HCO3', 'BICARBONATE', 'BICARB', 'CO2', 'TCO2'],
            ocrErrors: ['HCO 3', 'HC03']
        },
        Lactate: { 
            range: [0. 5, 2.0], 
            unit: 'mmol/L', 
            critical:  { high: 4 },
            aliases: ['LACTATE', 'LACTIC ACID', 'LAC'],
            ocrErrors: ['1ACTATE', 'LACIATE']
        },
        BE: { 
            range: [-2, 2], 
            unit: 'mEq/L',
            aliases: ['BE', 'BASE EXCESS', 'BASE DEFICIT'],
            ocrErrors: ['8E', 'B E']
        },

        // Thyroid
        TSH:  { 
            range: [0.4, 4.0], 
            unit: 'mIU/L',
            aliases: ['TSH', 'THYROID STIMULATING HORMONE', 'THYROTROPIN'],
            unitVariants:  ['mIU/L', 'uIU/mL', 'mU/L'],
            ocrErrors:  ['T5H', '1SH']
        },
        FT4: { 
            range: [0.8, 1.8], 
            unit: 'ng/dL',
            aliases: ['FT4', 'FREE T4', 'FREE THYROXINE', 'T4 FREE'],
            unitVariants: ['ng/dL', 'ng/dl', 'pmol/L'],
            convertFrom: { 'pmol/L':  (v) => v * 0.078 },
            ocrErrors: ['FT 4', 'F14']
        },
        FT3: { 
            range: [2.3, 4.2], 
            unit: 'pg/mL',
            aliases: ['FT3', 'FREE T3', 'FREE TRIIODOTHYRONINE', 'T3 FREE'],
            ocrErrors: ['FT 3', 'F13']
        },

        // Inflammatory Markers
        CRP: { 
            range: [0, 1.0], 
            unit: 'mg/dL',
            aliases: ['CRP', 'C-REACTIVE PROTEIN', 'C REACTIVE PROTEIN'],
            unitVariants: ['mg/dL', 'mg/dl', 'mg/L'],
            convertFrom: { 'mg/L': (v) => v / 10 },
            ocrErrors:  ['C RP', 'CKP']
        },
        ESR: { 
            range: [0, 20], 
            unit: 'mm/hr',
            aliases:  ['ESR', 'ERYTHROCYTE SEDIMENTATION RATE', 'SED RATE'],
            unitVariants: ['mm/hr', 'mm/h', 'mm/1hr'],
            ocrErrors: ['E5R', 'ESK']
        },
        Procalcitonin:  { 
            range: [0, 0.1], 
            unit: 'ng/mL', 
            critical:  { high: 2 },
            aliases: ['PROCALCITONIN', 'PCT', 'PROCAL'],
            ocrErrors: ['PROCALC1TONIN']
        },

        // Glucose/Diabetes
        Glucose: { 
            range: [70, 100], 
            unit: 'mg/dL', 
            critical:  { low: 40, high: 400 },
            aliases: ['GLUCOSE', 'GLU', 'FBS', 'FASTING GLUCOSE', 'BLOOD SUGAR', 'RBS', 'RANDOM GLUCOSE', 'FBG'],
            unitVariants: ['mg/dL', 'mg/dl', 'mmol/L'],
            convertFrom: { 'mmol/L':  (v) => v * 18 },
            ocrErrors:  ['G1UCOSE', 'GLUCOSS']
        },
        HbA1c:  { 
            range: [4.0, 5.6], 
            unit: '%',
            aliases: ['HBA1C', 'GLYCATED HEMOGLOBIN', 'A1C', 'GLYCOHEMOGLOBIN', 'HEMOGLOBIN A1C'],
            ocrErrors: ['HBA1 C', 'H8A1C']
        },

        // Lipid Panel
        TotalChol: { 
            range: [0, 200], 
            unit: 'mg/dL',
            aliases: ['TOTAL CHOLESTEROL', 'CHOLESTEROL', 'CHOL', 'TC'],
            ocrErrors: ['CHOLESTERO1']
        },
        LDL: { 
            range:  [0, 100], 
            unit: 'mg/dL',
            aliases: ['LDL', 'LDL CHOLESTEROL', 'LDL-C', 'LOW DENSITY LIPOPROTEIN'],
            ocrErrors: ['1DL', 'LOL']
        },
        HDL:  { 
            range: [40, 60], 
            unit: 'mg/dL',
            aliases: ['HDL', 'HDL CHOLESTEROL', 'HDL-C', 'HIGH DENSITY LIPOPROTEIN'],
            ocrErrors: ['HD1', 'HOL']
        },
        Triglycerides: { 
            range: [0, 150], 
            unit: 'mg/dL',
            aliases: ['TRIGLYCERIDES', 'TG', 'TRIG', 'TGL'],
            ocrErrors: ['TR1GLYCERIDES', 'TRIGLYCER1DES']
        },

        // Echo Parameters
        EF: { 
            range: [55, 70], 
            unit: '%',
            aliases: ['EF', 'EJECTION FRACTION', 'LVEF', 'LV EJECTION FRACTION'],
            ocrErrors: ['E F', '3F']
        },
        LVIDd: { 
            range: [3.5, 5.6], 
            unit: 'cm',
            aliases:  ['LVIDD', 'LV DIASTOLIC', 'LV END DIASTOLIC DIAMETER'],
            ocrErrors: ['LVID D', 'LV1DD']
        },
        LVIDs: { 
            range: [2.0, 4.0], 
            unit: 'cm',
            aliases: ['LVIDS', 'LV SYSTOLIC', 'LV END SYSTOLIC DIAMETER'],
            ocrErrors: ['LVID S', 'LV1DS']
        },
        LA: { 
            range: [2.0, 4.0], 
            unit: 'cm',
            aliases: ['LA', 'LEFT ATRIUM', 'LA DIAMETER'],
            ocrErrors: ['1A']
        },
        TAPSE: { 
            range: [1.7, 2.5], 
            unit: 'cm',
            aliases: ['TAPSE', 'TRICUSPID ANNULAR PLANE SYSTOLIC EXCURSION'],
            ocrErrors: ['TAPS E', '1APSE']
        },
        RVSP: { 
            range: [15, 30], 
            unit: 'mmHg',
            aliases: ['RVSP', 'RV SYSTOLIC PRESSURE', 'PASP'],
            ocrErrors: ['RV SP', 'RVPS']
        }
    };

    // ═══════════════════════════════════════════════════════════════════════
    // FUZZY MATCHING ENGINE
    // ═══════════════════════════════════════════════════════════════════════
    
    /**
     * Calculate Levenshtein distance between two strings
     */
    const levenshteinDistance = (a, b) => {
        const matrix = [];
        for (let i = 0; i <= b.length; i++) {
            matrix[i] = [i];
        }
        for (let j = 0; j <= a.length; j++) {
            matrix[0][j] = j;
        }
        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a. length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        return matrix[b. length][a.length];
    };

    /**
     * Calculate similarity score (0-1)
     */
    const calculateSimilarity = (str1, str2) => {
        const s1 = str1.toUpperCase().replace(/[^A-Z0-9]/g, '');
        const s2 = str2.toUpperCase().replace(/[^A-Z0-9]/g, '');
        
        if (s1 === s2) return 1;
        if (s1.length === 0 || s2.length === 0) return 0;
        
        const distance = levenshteinDistance(s1, s2);
        const maxLen = Math.max(s1.length, s2.length);
        return 1 - (distance / maxLen);
    };

    /**
     * Find the best matching test name
     */
    const findBestMatch = (input, threshold = 0.75) => {
        const normalized = input.toUpperCase().trim().replace(/[^A-Z0-9\s]/g, '');
        let bestMatch = null;
        let bestScore = 0;

        for (const [testName, testData] of Object.entries(labRanges)) {
            // Check exact match first
            if (normalized === testName. toUpperCase()) {
                return { test: testName, score: 1, matchType: 'exact' };
            }

            // Check aliases
            if (testData.aliases) {
                for (const alias of testData.aliases) {
                    if (normalized === alias.toUpperCase()) {
                        return { test: testName, score: 1, matchType:  'alias' };
                    }
                    const score = calculateSimilarity(normalized, alias);
                    if (score > bestScore && score >= threshold) {
                        bestScore = score;
                        bestMatch = { test: testName, score, matchType:  'fuzzy-alias' };
                    }
                }
            }

            // Check OCR error patterns
            if (testData.ocrErrors) {
                for (const ocrError of testData.ocrErrors) {
                    if (normalized === ocrError. toUpperCase()) {
                        return { test: testName, score: 0.95, matchType: 'ocr-correction' };
                    }
                }
            }

            // Check similarity to test name itself
            const nameScore = calculateSimilarity(normalized, testName);
            if (nameScore > bestScore && nameScore >= threshold) {
                bestScore = nameScore;
                bestMatch = { test: testName, score: nameScore, matchType: 'fuzzy' };
            }
        }

        return bestMatch;
    };

    // ═══════════════════════════════════════════════════════════════════════
    // ENHANCED VALUE EXTRACTION
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Extract numeric value from various formats
     */
    const extractNumericValue = (str) => {
        if (!str || typeof str !== 'string') return null;

        // Clean the string
        let cleaned = str.trim();

        // Handle common OCR errors in numbers
        cleaned = cleaned
            .replace(/[Oo]/g, '0')  // O to 0
            . replace(/[Ii]/g, '1')  // I to 1
            . replace(/[Ll]/g, '1')  // l to 1
            .replace(/[Ss]/g, '5')  // S to 5 (sometimes)
            .replace(/,/g, '.');    // European decimal separator

        // Try different number patterns
        const patterns = [
            // Standard decimal:  3. 5, 12.34
            /^([<>]?\s*)?(-?\d+\. ?\d*)\s*$/,
            // Range format (take first value): 3.5-4.0 → 3.5
            /^(-?\d+\.?\d*)\s*[-–—]\s*\d+\.?\d*/,
            // Less than / Greater than: <0.01, >100
            /^([<>≤≥])\s*(-?\d+\.?\d*)/,
            // With units embedded: 3.5mg/dL
            /^(-?\d+\.?\d*)\s*[a-zA-Z]/,
            // Percentage sign: 45%
            /^(-?\d+\.?\d*)\s*%/,
            // Thousand separator: 1,500 → 1500
            /^(-?\d{1,3}(? : ,\d{3})+(?:\.\d+)?)/
        ];

        for (const pattern of patterns) {
            const match = cleaned. match(pattern);
            if (match) {
                // Get the numeric part
                let numStr = match[2] || match[1];
                if (numStr) {
                    numStr = numStr. replace(/,/g, ''); // Remove thousand separators
                    const num = parseFloat(numStr);
                    if (!isNaN(num)) {
                        // Check for less than / greater than markers
                        const hasLessThan = cleaned.match(/^[<≤]/);
                        const hasGreaterThan = cleaned.match(/^[>≥]/);
                        return {
                            value: num,
                            modifier: hasLessThan ? '<' :  (hasGreaterThan ? '>' : null),
                            raw: str
                        };
                    }
                }
            }
        }

        return null;
    };

    /**
     * Extract unit and normalize it
     */
    const extractAndNormalizeUnit = (str, testName) => {
        if (!str) return null;
        
        const testData = labRanges[testName];
        if (!testData) return null;

        const cleaned = str.trim().toLowerCase();
        
        // Check if the unit matches any variant
        if (testData.unitVariants) {
            for (const variant of testData.unitVariants) {
                if (cleaned. includes(variant.toLowerCase())) {
                    // Check if conversion is needed
                    if (testData.convertFrom && testData.convertFrom[variant]) {
                        return { unit: testData.unit, originalUnit: variant, needsConversion: true };
                    }
                    return { unit: testData. unit, originalUnit:  variant, needsConversion:  false };
                }
            }
        }

        return { unit: testData.unit, originalUnit: null, needsConversion: false };
    };

    /**
     * Convert value if needed based on unit
     */
    const convertValue = (value, testName, originalUnit) => {
        const testData = labRanges[testName];
        if (! testData || !testData.convertFrom || !originalUnit) return value;

        const converter = testData.convertFrom[originalUnit];
        if (converter && typeof converter === 'function') {
            return Math.round(converter(value) * 100) / 100; // Round to 2 decimal places
        }
        return value;
    };

    // ═══════════════════════════════════════════════════════════════════════
    // CLINICAL INTERPRETATION (Enhanced)
    // ═══════════════════════════════════════════════════════════════════════

    const interpretations = {
        // Hematology
        WBC: (v) => {
            if (v < 1) return { severity: 'critical', text: 'SEVERE NEUTROPENIA - High infection risk.  Isolation precautions.  Consider G-CSF. ', urgency: 'immediate' };
            if (v < 4) return { severity: 'low', text: 'Leukopenia - Consider viral infection, drug-induced, or bone marrow suppression', urgency: 'urgent' };
            if (v > 30) return { severity: 'critical', text: 'MARKED LEUKOCYTOSIS - Consider leukemia, severe infection/sepsis', urgency: 'immediate' };
            if (v > 11) return { severity: 'high', text: 'Leukocytosis - Consider infection, inflammation, stress, or corticosteroids', urgency: 'soon' };
            return { severity: 'normal', text: 'Normal white cell count', urgency: 'routine' };
        },
        Hgb: (v) => {
            if (v < 7) return { severity: 'critical', text: 'SEVERE ANEMIA - Transfusion likely needed. Check hemodynamic stability.', urgency: 'immediate' };
            if (v < 10) return { severity: 'moderate', text: 'Moderate anemia - Evaluate cause (iron, B12, chronic disease, blood loss)', urgency: 'urgent' };
            if (v < 12) return { severity: 'mild', text: 'Mild anemia - Check iron studies, reticulocytes', urgency: 'soon' };
            if (v > 17) return { severity: 'high', text: 'Polycythemia - Consider dehydration, COPD, or polycythemia vera', urgency: 'soon' };
            return { severity: 'normal', text: 'Normal hemoglobin', urgency:  'routine' };
        },
        Plt: (v) => {
            if (v < 20) return { severity: 'critical', text: 'SEVERE THROMBOCYTOPENIA - High bleeding risk. Avoid procedures.  Consider platelet transfusion.', urgency: 'immediate' };
            if (v < 50) return { severity: 'severe', text: 'Severe thrombocytopenia - Bleeding precautions.  Evaluate cause. ', urgency: 'urgent' };
            if (v < 150) return { severity: 'moderate', text: 'Thrombocytopenia - Consider ITP, drug-induced, liver disease, or bone marrow cause', urgency: 'soon' };
            if (v > 450) return { severity: 'high', text: 'Thrombocytosis - May be reactive or consider myeloproliferative disorder', urgency: 'soon' };
            return { severity: 'normal', text: 'Normal platelet count', urgency: 'routine' };
        },
        MCV: (v) => {
            if (v < 80) return { severity: 'low', text: 'Microcytic - Consider iron deficiency, thalassemia, chronic disease', urgency:  'routine' };
            if (v > 100) return { severity: 'high', text: 'Macrocytic - Consider B12/folate deficiency, alcohol, liver disease, hypothyroidism', urgency: 'soon' };
            return { severity: 'normal', text: 'Normocytic', urgency: 'routine' };
        },

        // Renal
        Cr: (v) => {
            if (v > 10) return { severity: 'critical', text: 'SEVERE RENAL FAILURE - Urgent nephrology consult.  Consider dialysis. ', urgency: 'immediate' };
            if (v > 4) return { severity: 'severe', text: 'Acute kidney injury/CKD Stage 4-5 - Nephrology consult', urgency: 'urgent' };
            if (v > 2) return { severity: 'moderate', text: 'Renal impairment - Adjust medications, avoid nephrotoxins', urgency: 'soon' };
            if (v > 1. 3) return { severity: 'mild', text: 'Mildly elevated creatinine - Monitor, check baseline', urgency: 'routine' };
            return { severity: 'normal', text:  'Normal renal function', urgency: 'routine' };
        },
        eGFR: (v) => {
            if (v < 15) return { severity: 'critical', text: 'ESRD (Stage 5) - Dialysis planning/transplant evaluation', urgency: 'urgent' };
            if (v < 30) return { severity: 'severe', text: 'CKD Stage 4 - Nephrology referral, prepare for RRT', urgency:  'urgent' };
            if (v < 45) return { severity: 'moderate', text: 'CKD Stage 3b - Nephrology referral, medication adjustment', urgency:  'soon' };
            if (v < 60) return { severity: 'mild', text: 'CKD Stage 3a - Monitor, manage risk factors', urgency:  'routine' };
            if (v < 90) return { severity: 'borderline', text: 'CKD Stage 2 - If other markers of kidney damage present', urgency: 'routine' };
            return { severity: 'normal', text: 'Normal GFR', urgency: 'routine' };
        },

        // Electrolytes
        Na: (v) => {
            if (v < 120) return { severity: 'critical', text: 'SEVERE HYPONATREMIA - Seizure risk. ICU monitoring.  Careful correction.', urgency: 'immediate' };
            if (v < 130) return { severity: 'moderate', text: 'Moderate hyponatremia - Evaluate volume status, consider SIADH', urgency: 'urgent' };
            if (v < 136) return { severity: 'mild', text: 'Mild hyponatremia - Check volume status, medications', urgency: 'soon' };
            if (v > 155) return { severity: 'critical', text: 'SEVERE HYPERNATREMIA - Altered mental status risk.  Careful rehydration. ', urgency: 'immediate' };
            if (v > 145) return { severity: 'moderate', text: 'Hypernatremia - Assess hydration, diabetes insipidus possible', urgency: 'urgent' };
            return { severity:  'normal', text: 'Normal sodium', urgency: 'routine' };
        },
        K: (v) => {
            if (v < 2. 5) return { severity: 'critical', text: 'SEVERE HYPOKALEMIA - Arrhythmia risk. IV replacement.  Cardiac monitoring.', urgency: 'immediate' };
            if (v < 3.0) return { severity: 'moderate', text: 'Moderate hypokalemia - Oral/IV replacement, check Mg', urgency: 'urgent' };
            if (v < 3.5) return { severity: 'mild', text: 'Mild hypokalemia - Oral replacement, dietary counseling', urgency:  'soon' };
            if (v > 6.5) return { severity: 'critical', text: 'SEVERE HYPERKALEMIA - STAT ECG.  Cardiac monitoring.  Consider emergent treatment.', urgency: 'immediate' };
            if (v > 5.5) return { severity: 'moderate', text: 'Moderate hyperkalemia - ECG, consider treatment, check medications', urgency: 'urgent' };
            if (v > 5.0) return { severity: 'mild', text: 'Mild hyperkalemia - Repeat to confirm, review medications', urgency:  'soon' };
            return { severity: 'normal', text: 'Normal potassium', urgency: 'routine' };
        },
        Ca: (v) => {
            if (v < 7.0) return { severity: 'critical', text: 'SEVERE HYPOCALCEMIA - Tetany/seizure risk. IV calcium.  Cardiac monitoring.', urgency: 'immediate' };
            if (v < 8.5) return { severity: 'moderate', text: 'Hypocalcemia - Check albumin, PTH, vitamin D', urgency: 'urgent' };
            if (v > 12) return { severity: 'critical', text: 'SEVERE HYPERCALCEMIA - IV fluids, bisphosphonates.  Rule out malignancy/hyperparathyroidism. ', urgency: 'immediate' };
            if (v > 10. 5) return { severity: 'moderate', text: 'Hypercalcemia - Check PTH, consider malignancy workup', urgency:  'urgent' };
            return { severity: 'normal', text: 'Normal calcium', urgency: 'routine' };
        },

        // Liver Function
        AST: (v) => {
            if (v > 1000) return { severity: 'critical', text: 'MASSIVE HEPATIC INJURY - Ischemia, acetaminophen toxicity, viral hepatitis', urgency: 'immediate' };
            if (v > 300) return { severity: 'severe', text: 'Severe liver injury - Hepatitis workup, check coags, acetaminophen level', urgency: 'urgent' };
            if (v > 120) return { severity: 'moderate', text: 'Moderate elevation - Liver imaging, hepatitis panel', urgency: 'soon' };
            if (v > 40) return { severity: 'mild', text: 'Mild elevation - Consider NAFLD, alcohol, medications', urgency: 'routine' };
            return { severity:  'normal', text: 'Normal AST', urgency:  'routine' };
        },
        ALT: (v) => {
            if (v > 1000) return { severity: 'critical', text: 'MASSIVE HEPATIC INJURY - Ischemia, acetaminophen toxicity, viral hepatitis', urgency:  'immediate' };
            if (v > 300) return { severity: 'severe', text: 'Severe liver injury - Hepatitis workup, check INR', urgency: 'urgent' };
            if (v > 120) return { severity: 'moderate', text: 'Moderate elevation - Liver ultrasound, hepatitis serology', urgency:  'soon' };
            if (v > 56) return { severity: 'mild', text: 'Mild elevation - Consider NAFLD, alcohol, medications, muscle source', urgency: 'routine' };
            return { severity:  'normal', text: 'Normal ALT', urgency:  'routine' };
        },
        Tbili: (v) => {
            if (v > 10) return { severity: 'critical', text: 'SEVERE HYPERBILIRUBINEMIA - Urgent biliary imaging. Rule out obstruction.', urgency: 'immediate' };
            if (v > 3) return { severity: 'moderate', text: 'Significant jaundice - Check direct/indirect ratio, liver enzymes, imaging', urgency: 'urgent' };
            if (v > 1.2) return { severity: 'mild', text: 'Mild hyperbilirubinemia - May be Gilbert syndrome if isolated', urgency: 'routine' };
            return { severity: 'normal', text: 'Normal bilirubin', urgency:  'routine' };
        },

        // Cardiac
        Troponin: (v) => {
            if (v > 0.5) return { severity: 'critical', text: 'SIGNIFICANTLY ELEVATED TROPONIN - High likelihood of MI.  Cardiology STAT.', urgency: 'immediate' };
            if (v > 0.1) return { severity: 'severe', text: 'Elevated troponin - NSTEMI likely.  Serial troponins, ECG, cardiology consult. ', urgency: 'immediate' };
            if (v > 0.04) return { severity: 'moderate', text: 'Mildly elevated - Consider Type 2 MI, myocarditis, PE.  Repeat in 3-6 hours.', urgency: 'urgent' };
            return { severity: 'normal', text: 'Normal troponin', urgency: 'routine' };
        },
        BNP: (v) => {
            if (v > 900) return { severity: 'critical', text: 'Markedly elevated - High probability of decompensated heart failure', urgency: 'urgent' };
            if (v > 400) return { severity: 'moderate', text: 'Elevated BNP - Heart failure likely.  Echo recommended.', urgency: 'soon' };
            if (v > 100) return { severity: 'mild', text: 'Borderline BNP - May indicate HF or other cardiac stress', urgency: 'routine' };
            return { severity:  'normal', text: 'Normal BNP - Heart failure unlikely', urgency: 'routine' };
        },

        // ABG
        pH: (v) => {
            if (v < 7.2) return { severity: 'critical', text: 'SEVERE ACIDEMIA - Immediate intervention.  ICU care.', urgency: 'immediate' };
            if (v < 7.35) return { severity: 'moderate', text: 'Acidemia - Determine metabolic vs respiratory cause', urgency: 'urgent' };
            if (v > 7.55) return { severity: 'critical', text: 'SEVERE ALKALEMIA - Arrhythmia risk. Identify cause.', urgency: 'immediate' };
            if (v > 7.45) return { severity: 'moderate', text: 'Alkalemia - Determine metabolic vs respiratory cause', urgency: 'urgent' };
            return { severity: 'normal', text:  'Normal pH', urgency: 'routine' };
        },
        Lactate: (v) => {
            if (v > 4) return { severity: 'critical', text: 'SEVERE LACTIC ACIDOSIS - Consider sepsis, shock, tissue hypoperfusion', urgency: 'immediate' };
            if (v > 2) return { severity: 'moderate', text:  'Elevated lactate - Monitor for trend, assess perfusion', urgency:  'urgent' };
            return { severity: 'normal', text: 'Normal lactate', urgency: 'routine' };
        },

        // Echo
        EF: (v) => {
            if (v < 20) return { severity: 'critical', text: 'SEVERELY DEPRESSED EF - Advanced HFrEF.  GDMT, device evaluation.', urgency: 'urgent' };
            if (v < 35) return { severity: 'severe', text: 'Severe LV dysfunction (HFrEF) - Optimize GDMT, consider ICD', urgency: 'urgent' };
            if (v < 45) return { severity: 'moderate', text: 'Moderately reduced EF (HFmrEF) - Initiate/optimize GDMT', urgency: 'soon' };
            if (v < 55) return { severity: 'mild', text: 'Mildly reduced EF - Consider early GDMT', urgency: 'routine' };
            return { severity: 'normal', text: 'Normal LV systolic function', urgency: 'routine' };
        },

        // Default handler
        _default: (v, testName, ref) => {
            if (!ref?. range) return { severity: 'unknown', text: 'No reference range available', urgency: 'routine' };
            
            const [low, high] = ref.range;
            if (ref.critical?. low && v <= ref.critical.low) {
                return { severity: 'critical', text: `Critically low ${testName}`, urgency: 'immediate' };
            }
            if (ref.critical?. high && v >= ref.critical.high) {
                return { severity: 'critical', text: `Critically high ${testName}`, urgency: 'immediate' };
            }
            if (v < low) {
                return { severity:  'low', text: `Low ${testName}`, urgency: 'soon' };
            }
            if (v > high) {
                return { severity:  'high', text: `High ${testName}`, urgency: 'soon' };
            }
            return { severity:  'normal', text: `Normal ${testName}`, urgency: 'routine' };
        }
    };

    const getInterpretation = (testName, value) => {
        const interpreter = interpretations[testName] || interpretations. Hgb || interpretations._default;
        const ref = labRanges[testName];
        
        if (interpreter === interpretations._default) {
            return interpreter(value, testName, ref);
        }
        return interpreter(value);
    };

    // ═══════════════════════════════════════════════════════════════════════
    // ENHANCED LAB PARSING
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Parse lab values from text with enhanced extraction
     */
    const parseLab = (text) => {
        if (!text || typeof text !== 'string') {
            return { values: [], labType: 'Unknown', confidence: 0 };
        }

        const values = [];
        const usedTests = new Set();
        const lines = text.split(/[\n\r]+/).map(l => l.trim()).filter(l => l. length > 2);
        
        // Track overall parsing confidence
        let totalConfidence = 0;
        let matchCount = 0;

        for (const line of lines) {
            // Skip header/footer lines
            if (/^(date|time|patient|name|id|mrn|hospital|lab|report|doctor|specimen|sample|page|end of)/i.test(line)) {
                continue;
            }

            // Try different parsing strategies
            
            // Strategy 1: Key: Value or Key = Value format
            const kvMatch = line.match(/^([A-Za-z][A-Za-z0-9\s\-\. \/\']+? )\s*[:=]\s*(. +)$/);
            if (kvMatch) {
                const testCandidate = kvMatch[1].trim();
                const valueStr = kvMatch[2].trim();
                
                const matchResult = findBestMatch(testCandidate);
                if (matchResult && matchResult.score >= 0.75) {
                    if (! usedTests.has(matchResult.test)) {
                        const extracted = extractNumericValue(valueStr);
                        if (extracted) {
                            const testData = labRanges[matchResult.test];
                            let finalValue = extracted.value;
                            
                            // Check for unit and convert if needed
                            const unitInfo = extractAndNormalizeUnit(valueStr, matchResult.test);
                            if (unitInfo?. needsConversion && unitInfo.originalUnit) {
                                finalValue = convertValue(finalValue, matchResult.test, unitInfo.originalUnit);
                            }

                            const ref = testData;
                            let flag = '';
                            if (ref?. range) {
                                if (finalValue < ref.range[0]) flag = 'L';
                                else if (finalValue > ref.range[1]) flag = 'H';
                            }
                            if (ref?.critical) {
                                if (ref.critical.low && finalValue <= ref. critical.low) flag = 'LL';
                                if (ref.critical. high && finalValue >= ref.critical.high) flag = 'HH';
                            }

                            const interp = getInterpretation(matchResult.test, finalValue);
                            
                            values.push({
                                test: matchResult.test,
                                value: finalValue,
                                unit: ref?.unit || '',
                                flag,
                                range: ref?.range,
                                interpretation: interp,
                                critical: flag === 'LL' || flag === 'HH',
                                confidence: matchResult.score,
                                matchType: matchResult.matchType,
                                modifier: extracted.modifier,
                                originalValue: extracted.raw
                            });
                            
                            usedTests.add(matchResult.test);
                            totalConfidence += matchResult. score;
                            matchCount++;
                        }
                    }
                }
                continue;
            }

            // Strategy 2: Tabular format (Test Name    Value    Reference    Unit)
            const tabMatch = line.match(/^([A-Za-z][A-Za-z0-9\s\-\.\/\']+? )\s{2,}(\d+\.?\d*)\s/);
            if (tabMatch) {
                const testCandidate = tabMatch[1].trim();
                const valueStr = tabMatch[2];
                
                const matchResult = findBestMatch(testCandidate);
                if (matchResult && matchResult.score >= 0.75 && !usedTests.has(matchResult.test)) {
                    const extracted = extractNumericValue(valueStr);
                    if (extracted) {
                        const testData = labRanges[matchResult.test];
                        const ref = testData;
                        let flag = '';
                        if (ref?.range) {
                            if (extracted.value < ref.range[0]) flag = 'L';
                            else if (extracted.value > ref. range[1]) flag = 'H';
                        }
                        if (ref?.critical) {
                            if (ref.critical.low && extracted.value <= ref.critical.low) flag = 'LL';
                            if (ref.critical.high && extracted. value >= ref.critical.high) flag = 'HH';
                        }

                        const interp = getInterpretation(matchResult. test, extracted.value);
                        
                        values.push({
                            test: matchResult.test,
                            value: extracted.value,
                            unit:  ref?.unit || '',
                            flag,
                            range:  ref?.range,
                            interpretation: interp,
                            critical: flag === 'LL' || flag === 'HH',
                            confidence: matchResult. score * 0.9, // Slightly lower confidence for tabular
                            matchType: matchResult.matchType
                        });
                        
                        usedTests.add(matchResult.test);
                        totalConfidence += matchResult. score * 0.9;
                        matchCount++;
                    }
                }
            }
        }

        // Determine lab type based on found tests
        const tests = values.map(v => v. test);
        let labType = 'General';
        
        const cbcTests = ['WBC', 'Hgb', 'Plt', 'RBC', 'MCV', 'MCH', 'MCHC', 'Hct'];
        const rftTests = ['Cr', 'BUN', 'Urea', 'eGFR'];
        const lftTests = ['AST', 'ALT', 'ALP', 'GGT', 'Tbili', 'Dbili', 'Albumin'];
        const electrolyteTests = ['Na', 'K', 'Cl', 'Ca', 'Mg', 'Phos'];
        const abgTests = ['pH', 'pCO2', 'pO2', 'HCO3', 'Lactate', 'BE'];
        const coagTests = ['PT', 'INR', 'PTT'];
        const cardiacTests = ['Troponin', 'BNP', 'CK', 'CKMB'];
        const thyroidTests = ['TSH', 'FT4', 'FT3'];
        const lipidTests = ['TotalChol', 'LDL', 'HDL', 'Triglycerides'];
        
        if (tests.some(t => cbcTests.includes(t)) && tests.filter(t => cbcTests.includes(t)).length >= 2) labType = 'CBC';
        else if (tests.some(t => rftTests.includes(t))) labType = 'RFT';
        else if (tests. some(t => lftTests.includes(t))) labType = 'LFT';
        else if (tests.some(t => electrolyteTests.includes(t))) labType = 'Electrolytes';
        else if (tests.some(t => abgTests.includes(t))) labType = 'ABG';
        else if (tests. some(t => coagTests.includes(t))) labType = 'Coagulation';
        else if (tests.some(t => cardiacTests.includes(t))) labType = 'Cardiac Markers';
        else if (tests.some(t => thyroidTests.includes(t))) labType = 'Thyroid';
        else if (tests.some(t => lipidTests. includes(t))) labType = 'Lipid Panel';

        return { 
            values, 
            labType,
            confidence: matchCount > 0 ? Math.round((totalConfidence / matchCount) * 100) : 0,
            parseStats: {
                linesProcessed: lines. length,
                valuesExtracted: values.length,
                averageMatchScore: matchCount > 0 ? (totalConfidence / matchCount) : 0
            }
        };
    };

    // ═══════════════════════════════════════════════════════════════════════
    // ALERT GENERATION (Enhanced)
    // ═══════════════════════════════════════════════════════════════════════

    const generateAlerts = (values) => {
        const alerts = [];
        
        for (const v of values) {
            if (! v || !v.interpretation) continue;

            const urgency = v.interpretation.urgency;
            const severity = v.interpretation.severity;
            
            if (urgency === 'immediate' || severity === 'critical') {
                alerts.push({ 
                    level: 'critical', 
                    text: `🔴 CRITICAL: ${v. test} ${v.value}${v.unit} - ${v.interpretation.text}`,
                    test: v.test,
                    value:  v.value,
                    action: 'Immediate intervention required'
                });
            } else if (urgency === 'urgent' || severity === 'severe') {
                alerts.push({ 
                    level: 'severe', 
                    text: `🟠 URGENT: ${v.test} ${v.value}${v.unit} - ${v. interpretation.text}`,
                    test:  v.test,
                    value: v.value,
                    action: 'Urgent evaluation needed'
                });
            } else if (severity === 'moderate') {
                alerts.push({ 
                    level: 'moderate', 
                    text: `🟡 ${v.test}:  ${v.value}${v.unit} - ${v.interpretation.text}`,
                    test: v.test,
                    value: v. value
                });
            }
        }
        
        // Sort by severity
        const order = { critical: 0, severe: 1, moderate: 2 };
        alerts. sort((a, b) => (order[a.level] ??  99) - (order[b.level] ??  99));
        
        return alerts;
    };

    // ═══════════════════════════════════════════════════════════════════════
    // CLINICAL PATTERN DETECTION
    // ═══════════════════════════════════════════════════════════════════════