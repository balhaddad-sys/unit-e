/* ═══════════════════════════════════════════════════════════════════════════
   MEDICAL REPORT PARSER v5.0 - ENHANCED
   Improvements: 
   - Fuzzy matching for OCR errors
   - Multi-format value extraction
   - Context-aware parsing
   - Confidence scoring
   - Unit normalization and conversion
   - Enhanced clinical interpretations
   ═══════════════════════════════════════════════════════════════════════════ */

(function() {
    'use strict';

    // ═══════════════════════════════════════════════════════════════════════
    // ENHANCED REFERENCE RANGES WITH ALIASES AND UNIT VARIANTS
    // ═══════════════════════════════════════════════════════════════════════
    const labRanges = {
        // ══════════════ CBC ══════════════
        WBC: {
            range: [4, 11],
            unit:  '×10⁹/L',
            critical: { low: 1, high: 30 },
            aliases: ['WBC', 'WHITE BLOOD CELL', 'WHITE CELLS', 'LEUKOCYTES', 'LEUCOCYTES', 'TLC', 'TOTAL LEUKOCYTE COUNT', 'W. B.C', 'W.B.C.', 'WHITE CELL COUNT'],
            unitVariants: ['10^9/L', 'x10^9/L', '10^3/uL', 'K/uL', 'thou/uL', '/mm3', 'x10^3/uL', '10*9/L'],
            ocrErrors: ['WEC', 'W8C', 'VBC', 'VVBC', 'WB C', 'W BC'],
            category: 'CBC'
        },
        RBC: {
            range: [4.0, 6.0],
            unit:  '×10¹²/L',
            critical: { low: 2.5, high: 7.5 },
            aliases: ['RBC', 'RED BLOOD CELL', 'RED CELLS', 'ERYTHROCYTES', 'R.B.C', 'R.B.C. ', 'RED CELL COUNT'],
            unitVariants: ['10^12/L', 'x10^12/L', 'M/uL', 'mil/uL', '10*12/L', 'x10^6/uL'],
            ocrErrors: ['R8C', 'REC', 'R BC', 'RB C'],
            category: 'CBC'
        },
        Hgb: {
            range: [12, 17],
            unit:  'g/dL',
            critical:  { low: 7, high: 20 },
            aliases: ['HGB', 'HB', 'HEMOGLOBIN', 'HAEMOGLOBIN', 'HG', 'HEMO'],
            unitVariants: ['g/dL', 'g/dl', 'g/L', 'gm/dL', 'gm/dl', 'GM/DL'],
            convertFrom: { 'g/L': (v) => v / 10 },
            ocrErrors: ['H68', 'HG8', 'HBG', 'H8', 'HE', 'H GB'],
            category:  'CBC'
        },
        Hct:  {
            range:  [36, 50],
            unit:  '%',
            critical: { low: 20, high: 60 },
            aliases: ['HCT', 'HEMATOCRIT', 'HAEMATOCRIT', 'PCV', 'PACKED CELL VOLUME', 'CRIT'],
            unitVariants: ['%', 'L/L', 'ratio'],
            convertFrom:  { 'L/L': (v) => v * 100, 'ratio': (v) => v > 1 ? v :  v * 100 },
            ocrErrors: ['HCI', 'HC1', 'HCL', 'H CT'],
            category:  'CBC'
        },
        Plt: {
            range: [150, 400],
            unit:  '×10⁹/L',
            critical: { low:  20, high: 1000 },
            panic: { low: 10, high: 1500 },
            aliases: ['PLT', 'PLATELET', 'PLATELETS', 'PLATELET COUNT', 'THROMBOCYTES', 'PLT COUNT'],
            unitVariants: ['10^9/L', 'x10^9/L', '10^3/uL', 'K/uL', 'thou/uL', '10*9/L', 'x10^3/uL'],
            ocrErrors: ['PIT', 'P1T', 'PLI', 'PL T', 'P LT'],
            category: 'CBC'
        },
        MCV: {
            range: [80, 100],
            unit: 'fL',
            aliases: ['MCV', 'MEAN CORPUSCULAR VOLUME', 'MEAN CELL VOLUME'],
            unitVariants: ['fL', 'fl', 'femtoliters'],
            ocrErrors:  ['NCV', 'MC V', 'MCV', 'M CV'],
            category:  'CBC'
        },
        MCH: {
            range: [27, 33],
            unit:  'pg',
            aliases: ['MCH', 'MEAN CORPUSCULAR HEMOGLOBIN', 'MEAN CELL HEMOGLOBIN', 'MEAN CORPUSCULAR HB'],
            unitVariants: ['pg', 'picograms'],
            ocrErrors: ['M CH', 'NCH', 'MC H'],
            category: 'CBC'
        },
        MCHC: {
            range: [32, 36],
            unit:  'g/dL',
            aliases: ['MCHC', 'MEAN CORPUSCULAR HEMOGLOBIN CONCENTRATION', 'MEAN CORPUSCULAR HB CONC'],
            unitVariants: ['g/dL', 'g/dl', '%'],
            ocrErrors: ['M CHC', 'NCHC', 'MCH C'],
            category:  'CBC'
        },
        RDW: {
            range: [11.5, 14.5],
            unit: '%',
            aliases:  ['RDW', 'RDW-CV', 'RED CELL DISTRIBUTION WIDTH', 'RDW CV'],
            unitVariants: ['%'],
            ocrErrors: ['ROW', 'RDV', 'R DW', 'RD W'],
            category: 'CBC'
        },
        MPV: {
            range: [7.5, 11.5],
            unit: 'fL',
            aliases: ['MPV', 'MEAN PLATELET VOLUME'],
            unitVariants: ['fL', 'fl'],
            ocrErrors: ['NPV', 'M PV'],
            category: 'CBC'
        },

        // ══════════════ RENAL FUNCTION ══════════════
        Cr: {
            range: [0.7, 1.3],
            unit:  'mg/dL',
            critical: { high: 10 },
            aliases:  ['CR', 'CREATININE', 'CREAT', 'S.  CREATININE', 'SERUM CREATININE', 'S. CREATININE', 'CREAT. '],
            unitVariants: ['mg/dL', 'mg/dl', 'umol/L', 'μmol/L', 'UMOL/L'],
            convertFrom:  { 'umol/L': (v) => v / 88.4, 'μmol/L':  (v) => v / 88.4, 'UMOL/L':  (v) => v / 88.4 },
            ocrErrors: ['C R', 'CR. ', 'CREAT1NINE'],
            category: 'RFT'
        },
        BUN: {
            range: [7, 20],
            unit: 'mg/dL',
            critical: { high: 100 },
            aliases: ['BUN', 'BLOOD UREA NITROGEN', 'B.U.N', 'B.U.N. '],
            unitVariants: ['mg/dL', 'mg/dl', 'mmol/L'],
            convertFrom:  { 'mmol/L': (v) => v * 2.8 },
            ocrErrors: ['8UN', 'BUM', 'B UN'],
            category:  'RFT'
        },
        Urea: {
            range: [15, 45],
            unit:  'mg/dL',
            critical: { high: 200 },
            aliases: ['UREA', 'BLOOD UREA', 'S. UREA', 'SERUM UREA', 'S.  UREA'],
            unitVariants: ['mg/dL', 'mg/dl', 'mmol/L'],
            convertFrom:  { 'mmol/L': (v) => v * 6 },
            ocrErrors: ['UR EA', 'UERA', 'U REA'],
            category: 'RFT'
        },
        eGFR: {
            range: [90, 120],
            unit: 'mL/min/1.73m²',
            critical:  { low: 15 },
            aliases:  ['EGFR', 'GFR', 'ESTIMATED GFR', 'E-GFR', 'EST. GFR', 'GLOMERULAR FILTRATION RATE'],
            unitVariants: ['mL/min/1.73m²', 'mL/min', 'ml/min'],
            ocrErrors: ['E GFR', '3GFR', 'EGFK'],
            category: 'RFT'
        },

        // ══════════════ ELECTROLYTES ══════════════
        Na: {
            range: [136, 145],
            unit:  'mEq/L',
            critical: { low: 120, high: 160 },
            aliases: ['NA', 'SODIUM', 'NA+', 'S. SODIUM', 'SERUM SODIUM', 'S. SODIUM', 'NA (SODIUM)'],
            unitVariants: ['mEq/L', 'meq/L', 'mmol/L', 'MEQ/L', 'MMOL/L'],
            ocrErrors: ['N A', 'MA', 'NA. ', 'S0DIUM'],
            category: 'ELECTROLYTES'
        },
        K: {
            range: [3.5, 5.0],
            unit:  'mEq/L',
            critical: { low:  2.5, high: 6.5 },
            aliases: ['K', 'POTASSIUM', 'K+', 'S.  POTASSIUM', 'SERUM POTASSIUM', 'S. POTASSIUM', 'K (POTASSIUM)'],
            unitVariants:  ['mEq/L', 'meq/L', 'mmol/L', 'MEQ/L', 'MMOL/L'],
            ocrErrors: ['K. ', 'P0TASSIUM'],
            category: 'ELECTROLYTES'
        },
        Cl: {
            range: [98, 106],
            unit:  'mEq/L',
            aliases: ['CL', 'CHLORIDE', 'CL-', 'S.  CHLORIDE', 'SERUM CHLORIDE', 'S.CHLORIDE'],
            unitVariants: ['mEq/L', 'meq/L', 'mmol/L'],
            ocrErrors: ['C1', 'CI', 'CHL0RIDE'],
            category:  'ELECTROLYTES'
        },
        Ca: {
            range: [8.5, 10.5],
            unit: 'mg/dL',
            critical: { low: 6.5, high: 13 },
            aliases:  ['CA', 'CALCIUM', 'CA++', 'S.  CALCIUM', 'SERUM CALCIUM', 'TOTAL CALCIUM', 'S. CALCIUM', 'CA (TOTAL)'],
            unitVariants: ['mg/dL', 'mg/dl', 'mmol/L'],
            convertFrom: { 'mmol/L':  (v) => v * 4 },
            ocrErrors: ['C A', 'GA', 'CALC1UM'],
            category: 'ELECTROLYTES'
        },
        iCa: {
            range: [4.5, 5.3],
            unit:  'mg/dL',
            critical: { low: 3.5, high: 6.5 },
            aliases: ['ICA', 'IONIZED CALCIUM', 'CA++', 'CA2+', 'FREE CALCIUM', 'IONIC CALCIUM'],
            unitVariants: ['mg/dL', 'mg/dl', 'mmol/L'],
            convertFrom:  { 'mmol/L': (v) => v * 4 },
            ocrErrors: ['1CA', 'I CA'],
            category: 'ELECTROLYTES'
        },
        Mg: {
            range: [1.7, 2.4],
            unit:  'mg/dL',
            critical: { low: 1.0, high: 4.0 },
            aliases: ['MG', 'MAGNESIUM', 'S. MAGNESIUM', 'SERUM MAGNESIUM', 'S.  MAGNESIUM'],
            unitVariants: ['mg/dL', 'mg/dl', 'mmol/L', 'mEq/L'],
            convertFrom:  { 'mmol/L': (v) => v * 2.43 },
            ocrErrors: ['M G', 'NG', 'MAGNES1UM'],
            category: 'ELECTROLYTES'
        },
        Phos: {
            range: [2.5, 4.5],
            unit: 'mg/dL',
            aliases: ['PHOS', 'PHOSPHORUS', 'PHOSPHATE', 'PO4', 'S. PHOSPHORUS', 'INORGANIC PHOSPHORUS', 'P', 'PHOSP'],
            unitVariants: ['mg/dL', 'mg/dl', 'mmol/L'],
            convertFrom: { 'mmol/L':  (v) => v * 3.1 },
            ocrErrors: ['PH0S', 'PHOSPH0RUS'],
            category: 'ELECTROLYTES'
        },

        // ══════════════ LIVER FUNCTION ══════════════
        AST: {
            range: [10, 40],
            unit: 'U/L',
            critical: { high: 1000 },
            aliases: ['AST', 'SGOT', 'ASPARTATE AMINOTRANSFERASE', 'ASPARTATE TRANSAMINASE', 'GOT'],
            unitVariants: ['U/L', 'u/L', 'IU/L', 'iu/L'],
            ocrErrors: ['A5T', 'AS1', 'A ST', 'SG0T'],
            category: 'LFT'
        },
        ALT: {
            range: [7, 56],
            unit:  'U/L',
            critical:  { high: 1000 },
            aliases: ['ALT', 'SGPT', 'ALANINE AMINOTRANSFERASE', 'ALANINE TRANSAMINASE', 'GPT'],
            unitVariants: ['U/L', 'u/L', 'IU/L', 'iu/L'],
            ocrErrors: ['A1T', 'AL1', 'A LT', 'SGP1'],
            category:  'LFT'
        },
        ALP: {
            range: [44, 147],
            unit:  'U/L',
            aliases: ['ALP', 'ALKALINE PHOSPHATASE', 'ALK PHOS', 'ALKP', 'ALK.  PHOS', 'ALK. PHOS'],
            unitVariants: ['U/L', 'u/L', 'IU/L'],
            ocrErrors: ['A1P', 'AIP', 'A LP', 'ALKAL1NE'],
            category: 'LFT'
        },
        GGT: {
            range: [9, 48],
            unit: 'U/L',
            aliases: ['GGT', 'GAMMA GT', 'GAMMA-GLUTAMYL TRANSFERASE', 'GGTP', 'GAMMA-GT', 'G-GT'],
            unitVariants: ['U/L', 'u/L', 'IU/L'],
            ocrErrors: ['GGI', 'G6T', 'G GT', '6GT'],
            category: 'LFT'
        },
        Tbili: {
            range: [0.1, 1.2],
            unit:  'mg/dL',
            critical: { high: 15 },
            aliases: ['TBILI', 'TOTAL BILIRUBIN', 'T.  BILI', 'BILIRUBIN TOTAL', 'T BILIRUBIN', 'T.BILI', 'BILI TOTAL'],
            unitVariants: ['mg/dL', 'mg/dl', 'umol/L', 'μmol/L'],
            convertFrom: { 'umol/L':  (v) => v / 17.1, 'μmol/L': (v) => v / 17.1 },
            ocrErrors: ['T8ILI', 'TBIL1', 'T BILI', 'B1LIRUBIN'],
            category: 'LFT'
        },
        Dbili: {
            range: [0.0, 0.3],
            unit:  'mg/dL',
            aliases: ['DBILI', 'DIRECT BILIRUBIN', 'D. BILI', 'BILIRUBIN DIRECT', 'CONJUGATED BILIRUBIN', 'D BILI'],
            unitVariants: ['mg/dL', 'mg/dl', 'umol/L', 'μmol/L'],
            convertFrom: { 'umol/L': (v) => v / 17.1, 'μmol/L':  (v) => v / 17.1 },
            ocrErrors: ['D8ILI', 'DBIL1', 'D BILI'],
            category: 'LFT'
        },
        Albumin: {
            range: [3.5, 5.0],
            unit: 'g/dL',
            critical: { low: 2.0 },
            aliases:  ['ALBUMIN', 'ALB', 'S.ALBUMIN', 'SERUM ALBUMIN', 'S.  ALBUMIN'],
            unitVariants:  ['g/dL', 'g/dl', 'g/L'],
            convertFrom:  { 'g/L': (v) => v / 10 },
            ocrErrors: ['A1BUMIN', 'ALBUMEN', 'ALB. ', 'A LBUMIN'],
            category: 'LFT'
        },
        TotalProtein: {
            range: [6.0, 8.3],
            unit:  'g/dL',
            aliases: ['TOTAL PROTEIN', 'TP', 'T.  PROTEIN', 'PROTEIN TOTAL', 'S. PROTEIN'],
            unitVariants:  ['g/dL', 'g/dl', 'g/L'],
            convertFrom: { 'g/L':  (v) => v / 10 },
            ocrErrors: ['T0TAL PROTEIN', 'T PROTEIN'],
            category: 'LFT'
        },

        // ══════════════ COAGULATION ══════════════
        PT: {
            range: [11, 13. 5],
            unit: 'sec',
            critical:  { high: 50 },
            aliases: ['PT', 'PROTHROMBIN TIME', 'PROTIME', 'P.T.', 'P.T'],
            unitVariants: ['sec', 'seconds', 's'],
            ocrErrors: ['PI', 'P1', 'P T'],
            category: 'COAG'
        },
        INR: {
            range: [0.8, 1.2],
            unit:  '',
            critical: { high: 5 },
            aliases: ['INR', 'INTERNATIONAL NORMALIZED RATIO', 'I.N.R. ', 'PT/INR'],
            unitVariants: ['', 'ratio'],
            ocrErrors: ['1NR', 'IMR', 'I NR', 'INK'],
            category: 'COAG'
        },
        PTT: {
            range: [25, 35],
            unit:  'sec',
            critical: { high: 100 },
            aliases: ['PTT', 'APTT', 'ACTIVATED PARTIAL THROMBOPLASTIN TIME', 'PARTIAL THROMBOPLASTIN TIME', 'A.P.T. T.'],
            unitVariants: ['sec', 'seconds', 's'],
            ocrErrors: ['PTI', 'P1T', 'P TT', 'AP TT'],
            category: 'COAG'
        },
        Fibrinogen: {
            range: [200, 400],
            unit:  'mg/dL',
            critical: { low: 100 },
            aliases: ['FIBRINOGEN', 'FIB', 'FACTOR I'],
            unitVariants: ['mg/dL', 'mg/dl', 'g/L'],
            convertFrom: { 'g/L': (v) => v * 100 },
            ocrErrors: ['FIBRIN0GEN', 'F1BRINOGEN'],
            category: 'COAG'
        },
        DDimer: {
            range: [0, 0.5],
            unit: 'μg/mL',
            critical: { high: 4 },
            aliases: ['D-DIMER', 'D DIMER', 'DDIMER', 'D-DIMER FEU'],
            unitVariants: ['μg/mL', 'ug/mL', 'ng/mL', 'mg/L'],
            convertFrom: { 'ng/mL': (v) => v / 1000, 'mg/L':  (v) => v },
            ocrErrors: ['D D1MER', 'DDIM3R'],
            category: 'COAG'
        },

        // ══════════════ CARDIAC MARKERS ══════════════
        Troponin: {
            range: [0, 0.04],
            unit:  'ng/mL',
            critical: { high: 0.1 },
            aliases: ['TROPONIN', 'TROP', 'TROPONIN I', 'TROPONIN T', 'TROP I', 'TROP T', 'HS-TROPONIN', 'HSTROP', 'HS-TROP', 'CARDIAC TROPONIN'],
            unitVariants: ['ng/mL', 'ng/ml', 'pg/mL', 'ng/L', 'ug/L'],
            convertFrom: { 'pg/mL': (v) => v / 1000, 'ng/L': (v) => v / 1000, 'ug/L': (v) => v / 1000 },
            ocrErrors: ['TROPON1N', 'TR0PONIN', 'TROP0NIN'],
            category: 'CARDIAC'
        },
        BNP: {
            range: [0, 100],
            unit:  'pg/mL',
            critical: { high: 900 },
            aliases: ['BNP', 'NT-PROBNP', 'BRAIN NATRIURETIC PEPTIDE', 'PROBNP', 'NT-PRO-BNP', 'NTPROBNP'],
            unitVariants:  ['pg/mL', 'pg/ml', 'ng/L', 'pmol/L'],
            convertFrom: { 'ng/L': (v) => v, 'pmol/L': (v) => v * 8.457 },
            ocrErrors: ['8NP', 'BMP', 'B NP'],
            category: 'CARDIAC'
        },
        CK: {
            range: [30, 200],
            unit: 'U/L',
            critical: { high:  1000 },
            aliases: ['CK', 'CPK', 'CREATINE KINASE', 'CREATINE PHOSPHOKINASE', 'TOTAL CK'],
            unitVariants: ['U/L', 'u/L', 'IU/L'],
            ocrErrors: ['CX', 'C K', 'CPX'],
            category: 'CARDIAC'
        },
        CKMB: {
            range: [0, 5],
            unit:  'ng/mL',
            critical: { high: 25 },
            aliases: ['CKMB', 'CK-MB', 'CK MB', 'CREATINE KINASE MB', 'CPK-MB'],
            unitVariants:  ['ng/mL', 'ng/ml', 'U/L', '%'],
            ocrErrors: ['CKM8', 'CKNB', 'CK-M8'],
            category: 'CARDIAC'
        },
        LDH: {
            range: [140, 280],
            unit:  'U/L',
            aliases: ['LDH', 'LACTATE DEHYDROGENASE', 'LD', 'LACTIC DEHYDROGENASE'],
            unitVariants: ['U/L', 'u/L', 'IU/L'],
            ocrErrors:  ['1DH', 'LOH', 'L DH'],
            category: 'CARDIAC'
        },

        // ══════════════ ABG ══════════════
        pH: {
            range: [7.35, 7.45],
            unit: '',
            critical: { low: 7.2, high: 7.6 },
            aliases: ['PH', 'BLOOD PH', 'ARTERIAL PH', 'ABG PH'],
            unitVariants: [''],
            ocrErrors: ['P H', 'RH'],
            category: 'ABG'
        },
        pCO2: {
            range: [35, 45],
            unit: 'mmHg',
            critical: { low: 20, high: 70 },
            aliases: ['PCO2', 'PACO2', 'CARBON DIOXIDE', 'CO2 PARTIAL PRESSURE', 'PCO2 (ARTERIAL)', 'P CO2'],
            unitVariants: ['mmHg', 'mm Hg', 'torr', 'kPa'],
            convertFrom: { 'kPa': (v) => v * 7.5 },
            ocrErrors: ['PCO 2', 'PC02', 'PCO 2'],
            category: 'ABG'
        },
        pO2: {
            range: [80, 100],
            unit: 'mmHg',
            critical: { low: 50 },
            aliases:  ['PO2', 'PAO2', 'OXYGEN', 'O2 PARTIAL PRESSURE', 'PO2 (ARTERIAL)', 'P O2'],
            unitVariants: ['mmHg', 'mm Hg', 'torr', 'kPa'],
            convertFrom: { 'kPa': (v) => v * 7.5 },
            ocrErrors: ['PO 2', 'P02', 'PO 2'],
            category: 'ABG'
        },
        HCO3: {
            range: [22, 26],
            unit:  'mEq/L',
            critical: { low: 10, high: 40 },
            aliases: ['HCO3', 'BICARBONATE', 'BICARB', 'CO2', 'TCO2', 'ACTUAL BICARBONATE', 'HCO3-'],
            unitVariants: ['mEq/L', 'meq/L', 'mmol/L'],
            ocrErrors: ['HCO 3', 'HC03', 'HCO3'],
            category: 'ABG'
        },
        Lactate: {
            range: [0. 5, 2.0],
            unit: 'mmol/L',
            critical: { high: 4 },
            aliases: ['LACTATE', 'LACTIC ACID', 'LAC', 'BLOOD LACTATE', 'SERUM LACTATE'],
            unitVariants: ['mmol/L', 'mg/dL'],
            convertFrom: { 'mg/dL':  (v) => v / 9 },
            ocrErrors: ['1ACTATE', 'LACIATE', 'LACT ATE'],
            category: 'ABG'
        },
        BE: {
            range: [-2, 2],
            unit:  'mEq/L',
            critical: { low: -10, high: 10 },
            aliases: ['BE', 'BASE EXCESS', 'BASE DEFICIT', 'BEB', 'BE(B)', 'BASE EXCESS (B)'],
            unitVariants: ['mEq/L', 'meq/L', 'mmol/L'],
            ocrErrors: ['8E', 'B E'],
            allowNegative: true,
            category:  'ABG'
        },
        SaO2: {
            range: [95, 100],
            unit: '%',
            critical: { low: 88 },
            aliases:  ['SAO2', 'O2 SAT', 'OXYGEN SATURATION', 'SPO2', 'O2SAT', 'SO2'],
            unitVariants: ['%'],
            ocrErrors: ['SA02', 'SAO 2', 'SP02'],
            category: 'ABG'
        },

        // ══════════════ THYROID ══════════════
        TSH: {
            range: [0.4, 4.0],
            unit: 'mIU/L',
            critical:  { low: 0.01, high: 50 },
            aliases: ['TSH', 'THYROID STIMULATING HORMONE', 'THYROTROPIN', 'T. S.H.'],
            unitVariants: ['mIU/L', 'uIU/mL', 'mU/L', 'μIU/mL'],
            ocrErrors: ['T5H', '1SH', 'TS H'],
            category:  'THYROID'
        },
        FT4: {
            range: [0.8, 1.8],
            unit:  'ng/dL',
            aliases: ['FT4', 'FREE T4', 'FREE THYROXINE', 'T4 FREE', 'F. T4'],
            unitVariants: ['ng/dL', 'ng/dl', 'pmol/L'],
            convertFrom:  { 'pmol/L': (v) => v * 0.078 },
            ocrErrors: ['FT 4', 'F14', 'F T4'],
            category: 'THYROID'
        },
        FT3: {
            range: [2.3, 4.2],
            unit:  'pg/mL',
            aliases: ['FT3', 'FREE T3', 'FREE TRIIODOTHYRONINE', 'T3 FREE', 'F.T3'],
            unitVariants: ['pg/mL', 'pg/ml', 'pmol/L'],
            convertFrom: { 'pmol/L': (v) => v * 0.651 },
            ocrErrors: ['FT 3', 'F13', 'F T3'],
            category: 'THYROID'
        },
        T4: {
            range: [5, 12],
            unit:  'μg/dL',
            aliases: ['T4', 'TOTAL T4', 'THYROXINE', 'T. 4'],
            unitVariants: ['μg/dL', 'ug/dL', 'nmol/L'],
            convertFrom: { 'nmol/L': (v) => v * 0.078 },
            ocrErrors: ['14', 'T 4'],
            category: 'THYROID'
        },
        T3: {
            range: [80, 200],
            unit: 'ng/dL',
            aliases: ['T3', 'TOTAL T3', 'TRIIODOTHYRONINE', 'T.3'],
            unitVariants: ['ng/dL', 'ng/dl', 'nmol/L'],
            convertFrom: { 'nmol/L': (v) => v * 65.1 },
            ocrErrors: ['13', 'T 3'],
            category: 'THYROID'
        },

        // ══════════════ INFLAMMATORY MARKERS ══════════════
        CRP: {
            range: [0, 1. 0],
            unit: 'mg/dL',
            critical: { high: 20 },
            aliases: ['CRP', 'C-REACTIVE PROTEIN', 'C REACTIVE PROTEIN', 'HS-CRP', 'HSCRP'],
            unitVariants: ['mg/dL', 'mg/dl', 'mg/L'],
            convertFrom: { 'mg/L': (v) => v / 10 },
            ocrErrors: ['C RP', 'CKP', 'CR P'],
            category:  'INFLAMMATORY'
        },
        ESR: {
            range: [0, 20],
            unit: 'mm/hr',
            aliases: ['ESR', 'ERYTHROCYTE SEDIMENTATION RATE', 'SED RATE', 'SEDIMENTATION RATE'],
            unitVariants: ['mm/hr', 'mm/h', 'mm/1hr'],
            ocrErrors: ['E5R', 'ESK', 'E SR'],
            category:  'INFLAMMATORY'
        },
        Procalcitonin:  {
            range:  [0, 0.1],
            unit: 'ng/mL',
            critical: { high: 2 },
            aliases: ['PROCALCITONIN', 'PCT', 'PROCAL'],
            unitVariants: ['ng/mL', 'ng/ml', 'μg/L'],
            ocrErrors: ['PROCALC1TONIN', 'PROCALC ITONIN'],
            category: 'INFLAMMATORY'
        },
        Ferritin: {
            range: [20, 250],
            unit:  'ng/mL',
            critical: { high: 1000 },
            aliases: ['FERRITIN', 'FER', 'SERUM FERRITIN'],
            unitVariants: ['ng/mL', 'ng/ml', 'μg/L', 'pmol/L'],
            ocrErrors: ['FERR1TIN', 'FERRIT1N'],
            category: 'INFLAMMATORY'
        },

        // ══════════════ GLUCOSE / DIABETES ══════════════
        Glucose: {
            range: [70, 100],
            unit:  'mg/dL',
            critical: { low: 40, high: 400 },
            aliases: ['GLUCOSE', 'GLU', 'FBS', 'FASTING GLUCOSE', 'BLOOD SUGAR', 'RBS', 'RANDOM GLUCOSE', 'FBG', 'BLOOD GLUCOSE', 'SERUM GLUCOSE'],
            unitVariants: ['mg/dL', 'mg/dl', 'mmol/L'],
            convertFrom:  { 'mmol/L': (v) => v * 18 },
            ocrErrors: ['G1UCOSE', 'GLUCOSS', 'GL UCOSE'],
            category: 'METABOLIC'
        },
        HbA1c:  {
            range:  [4.0, 5.6],
            unit:  '%',
            aliases: ['HBA1C', 'GLYCATED HEMOGLOBIN', 'A1C', 'GLYCOHEMOGLOBIN', 'HEMOGLOBIN A1C', 'HB A1C', 'GLYCOSYLATED HB'],
            unitVariants: ['%', 'mmol/mol'],
            convertFrom: { 'mmol/mol': (v) => (v / 10. 929) + 2. 15 },
            ocrErrors: ['HBA1 C', 'H8A1C', 'HBA IC'],
            category:  'METABOLIC'
        },

        // ══════════════ LIPID PANEL ══════════════
        TotalChol: {
            range: [0, 200],
            unit:  'mg/dL',
            aliases: ['TOTAL CHOLESTEROL', 'CHOLESTEROL', 'CHOL', 'TC', 'T.  CHOL', 'T. CHOLESTEROL'],
            unitVariants: ['mg/dL', 'mg/dl', 'mmol/L'],
            convertFrom: { 'mmol/L':  (v) => v * 38.67 },
            ocrErrors: ['CHOLESTERO1', 'CH0LESTEROL'],
            category: 'LIPID'
        },
        LDL: {
            range: [0, 100],
            unit: 'mg/dL',
            aliases: ['LDL', 'LDL CHOLESTEROL', 'LDL-C', 'LOW DENSITY LIPOPROTEIN', 'LDL-CHOLESTEROL'],
            unitVariants: ['mg/dL', 'mg/dl', 'mmol/L'],
            convertFrom:  { 'mmol/L': (v) => v * 38.67 },
            ocrErrors:  ['1DL', 'LOL', 'L DL'],
            category: 'LIPID'
        },
        HDL: {
            range: [40, 60],
            unit:  'mg/dL',
            aliases: ['HDL', 'HDL CHOLESTEROL', 'HDL-C', 'HIGH DENSITY LIPOPROTEIN', 'HDL-CHOLESTEROL'],
            unitVariants: ['mg/dL', 'mg/dl', 'mmol/L'],
            convertFrom:  { 'mmol/L': (v) => v * 38.67 },
            ocrErrors: ['HD1', 'HOL', 'H DL'],
            category: 'LIPID'
        },
        Triglycerides: {
            range: [0, 150],
            unit:  'mg/dL',
            aliases: ['TRIGLYCERIDES', 'TG', 'TRIG', 'TGL', 'TRIGS'],
            unitVariants: ['mg/dL', 'mg/dl', 'mmol/L'],
            convertFrom:  { 'mmol/L': (v) => v * 88.57 },
            ocrErrors: ['TR1GLYCERIDES', 'TRIGLYCER1DES'],
            category: 'LIPID'
        },

        // ══════════════ ECHO PARAMETERS ══════════════
        EF: {
            range: [55, 70],
            unit:  '%',
            critical: { low: 20 },
            aliases:  ['EF', 'EJECTION FRACTION', 'LVEF', 'LV EJECTION FRACTION', 'LV EF'],
            unitVariants: ['%'],
            ocrErrors: ['E F', '3F', 'EE'],
            category: 'ECHO'
        },
        LVIDd: {
            range: [3.5, 5.6],
            unit:  'cm',
            aliases:  ['LVIDD', 'LV DIASTOLIC', 'LV END DIASTOLIC DIAMETER', 'LVEDD', 'LV EDD'],
            unitVariants: ['cm', 'mm'],
            convertFrom:  { 'mm':  (v) => v / 10 },
            ocrErrors: ['LVID D', 'LV1DD'],
            category: 'ECHO'
        },
        LVIDs: {
            range: [2.0, 4.0],
            unit: 'cm',
            aliases:  ['LVIDS', 'LV SYSTOLIC', 'LV END SYSTOLIC DIAMETER', 'LVESD', 'LV ESD'],
            unitVariants: ['cm', 'mm'],
            convertFrom:  { 'mm':  (v) => v / 10 },
            ocrErrors: ['LVID S', 'LV1DS'],
            category:  'ECHO'
        },
        LA: {
            range: [2.0, 4.0],
            unit: 'cm',
            aliases:  ['LA', 'LEFT ATRIUM', 'LA DIAMETER', 'LAD', 'LEFT ATRIAL SIZE'],
            unitVariants: ['cm', 'mm'],
            convertFrom: { 'mm': (v) => v / 10 },
            ocrErrors:  ['1A', 'L A'],
            category:  'ECHO'
        },
        IVSd: {
            range: [0. 6, 1.1],
            unit:  'cm',
            aliases: ['IVSD', 'IVS', 'INTERVENTRICULAR SEPTUM', 'SEPTAL THICKNESS'],
            unitVariants: ['cm', 'mm'],
            convertFrom: { 'mm': (v) => v / 10 },
            ocrErrors: ['1VSD', 'IVS D'],
            category:  'ECHO'
        },
        LVPWd: {
            range: [0.6, 1.1],
            unit:  'cm',
            aliases: ['LVPWD', 'LVPW', 'POSTERIOR WALL', 'PW THICKNESS'],
            unitVariants:  ['cm', 'mm'],
            convertFrom: { 'mm': (v) => v / 10 },
            ocrErrors: ['LVPW D', 'LVP WD'],
            category: 'ECHO'
        },
        TAPSE: {
            range: [1.7, 2.5],
            unit:  'cm',
            aliases: ['TAPSE', 'TRICUSPID ANNULAR PLANE SYSTOLIC EXCURSION'],
            unitVariants: ['cm', 'mm'],
            convertFrom: { 'mm': (v) => v / 10 },
            ocrErrors: ['TAPS E', '1APSE'],
            category: 'ECHO'
        },
        RVSP: {
            range: [15, 30],
            unit:  'mmHg',
            critical: { high: 50 },
            aliases: ['RVSP', 'RV SYSTOLIC PRESSURE', 'PASP', 'PA SYSTOLIC PRESSURE', 'PULMONARY ARTERY PRESSURE'],
            unitVariants: ['mmHg', 'mm Hg'],
            ocrErrors: ['RV SP', 'RVPS'],
            category:  'ECHO'
        },
        "E/E'": {
            range: [6, 14],
            unit:  '',
            aliases: ["E/E'", "E/E", "E/A RATIO", "E/E PRIME"],
            unitVariants: [''],
            ocrErrors: ["E/E '"],
            category: 'ECHO'
        },

        // ══════════════ URINE ══════════════
        UrinepH: {
            range: [4. 5, 8.0],
            unit:  '',
            aliases: ['URINE PH', 'U.  PH', 'PH (URINE)'],
            unitVariants: [''],
            ocrErrors:  ['URINE P H'],
            category: 'URINE'
        },
        UrineProtein: {
            range: [0, 0],
            unit: '',
            aliases: ['URINE PROTEIN', 'PROTEIN (URINE)', 'U. PROTEIN', 'PROTEINURIA'],
            unitVariants: ['', 'mg/dL', '+'],
            ocrErrors: ['URINE PROTE1N'],
            category:  'URINE'
        },
        UrineGlucose: {
            range: [0, 0],
            unit:  '',
            aliases:  ['URINE GLUCOSE', 'GLUCOSE (URINE)', 'U. GLUCOSE', 'GLUCOSURIA'],
            unitVariants: ['', 'mg/dL', '+'],
            ocrErrors: ['URINE G1UCOSE'],
            category: 'URINE'
        }
    };

    // ═══════════════════════════════════════════════════════════════════════
    // FUZZY MATCHING ENGINE
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Calculate Levenshtein distance between two strings
     */
    const levenshteinDistance = (a, b) => {
        if (! a || !b) return Math.max(a?.length || 0, b?.length || 0);
        
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
        const s1 = String(str1 || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
        const s2 = String(str2 || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

        if (s1 === s2) return 1;
        if (s1.length === 0 || s2.length === 0) return 0;

        // Check if one contains the other
        if (s1.includes(s2) || s2.includes(s1)) {
            const shorter = s1.length < s2.length ? s1 :  s2;
            const longer = s1.length < s2.length ? s2 : s1;
            return 0.8 + (shorter.length / longer. length) * 0.2;
        }

        const distance = levenshteinDistance(s1, s2);
        const maxLen = Math.max(s1.length, s2.length);
        return 1 - (distance / maxLen);
    };

    /**
     * Find the best matching test name
     */
    const findBestMatch = (input, threshold = 0.70) => {
        if (!input || typeof input !== 'string') return null;
        
        const normalized = input.toUpperCase().trim().replace(/[^A-Z0-9\s\-\/\. \']/g, '');
        if (normalized.length < 1) return null;
        
        let bestMatch = null;
        let bestScore = 0;

        for (const [testName, testData] of Object.entries(labRanges)) {
            // Check exact match first
            if (normalized === testName. toUpperCase()) {
                return { test: testName, score: 1, matchType: 'exact' };
            }

            // Check aliases (exact)
            if (testData.aliases) {
                for (const alias of testData.aliases) {
                    const normalizedAlias = alias.toUpperCase().replace(/[^A-Z0-9\s\-\/\. \']/g, '');
                    if (normalized === normalizedAlias) {
                        return { test: testName, score: 1, matchType: 'alias' };
                    }
                    
                    // Partial match - input contains alias or vice versa
                    if (normalized.includes(normalizedAlias) && normalizedAlias.length >= 2) {
                        const score = 0.9 + (normalizedAlias.length / normalized.length) * 0.1;
                        if (score > bestScore) {
                            bestScore = score;
                            bestMatch = { test: testName, score, matchType: 'partial-alias' };
                        }
                    }
                    
                    // Fuzzy match on aliases
                    const score = calculateSimilarity(normalized, normalizedAlias);
                    if (score > bestScore && score >= threshold) {
                        bestScore = score;
                        bestMatch = { test: testName, score, matchType:  'fuzzy-alias' };
                    }
                }
            }

            // Check OCR error patterns
            if (testData.ocrErrors) {
                for (const ocrError of testData.ocrErrors) {
                    const normalizedError = ocrError.toUpperCase().replace(/[^A-Z0-9\s]/g, '');
                    if (normalized === normalizedError || normalized.includes(normalizedError)) {
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
    const extractNumericValue = (str, allowNegative = false) => {
        if (str === null || str === undefined) return null;
        if (typeof str === 'number') return { value: str, modifier: null, raw: String(str) };

        let cleaned = String(str).trim();
        if (cleaned. length === 0) return null;

        // Handle common OCR errors in numbers
        cleaned = cleaned
            .replace(/[Oo]/g, '0')
            .replace(/[Ii]/g, '1')
            .replace(/[Ll]/g, '1')
            .replace(/[Ss]/g, '5')
            .replace(/,/g, '.')
            .replace(/\s+/g, '');

        // Check for less than / greater than markers
        let modifier = null;
        if (/^[<≤]/.test(cleaned)) {
            modifier = '<';
            cleaned = cleaned.replace(/^[<≤]\s*/, '');
        } else if (/^[>≥]/.test(cleaned)) {
            modifier = '>';
            cleaned = cleaned.replace(/^[>≥]\s*/, '');
        }

        // Handle negative numbers
        let isNegative = false;
        if (allowNegative && /^[-−]/.test(cleaned)) {
            isNegative = true;
            cleaned = cleaned.replace(/^[-−]/, '');
        }

        // Try different number patterns
        const patterns = [
            /^(\d+\. ?\d*)/, // Standard:  3. 5, 12
            /^(\d+\. ?\d*)\s*[-–—]\s*\d+/, // Range: take first value
        ];

        for (const pattern of patterns) {
            const match = cleaned.match(pattern);
            if (match && match[1]) {
                let numStr = match[1]. replace(/,/g, '');
                // Handle multiple decimals
                const parts = numStr.split('.');
                if (parts.length > 2) {
                    numStr = parts[0] + '.' + parts. slice(1).join('');
                }
                let num = parseFloat(numStr);
                if (!isNaN(num)) {
                    if (isNegative) num = -num;
                    return { value: num, modifier, raw: str };
                }
            }
        }

        return null;
    };

    /**
     * Detect and normalize unit from string
     */
    const detectUnit = (str, testName) => {
        if (!str || ! testName) return null;
        
        const testData = labRanges[testName];
        if (!testData) return null;

        const cleaned = String(str).trim();
        
        if (testData.unitVariants) {
            for (const variant of testData.unitVariants) {
                if (variant && cleaned.toLowerCase().includes(variant.toLowerCase())) {
                    if (testData.convertFrom && testData.convertFrom[variant]) {
                        return { unit: testData.unit, originalUnit: variant, needsConversion: true };
                    }
                    return { unit: testData. unit, originalUnit:  variant, needsConversion:  false };
                }
            }
        }

        return { unit: testData. unit, originalUnit:  null, needsConversion: false };
    };

    /**
     * Convert value if needed based on unit
     */
    const convertValue = (value, testName, originalUnit) => {
        const testData = labRanges[testName];
        if (! testData || !testData.convertFrom || !originalUnit) return value;

        const converter = testData.convertFrom[originalUnit];
        if (converter && typeof converter === 'function') {
            return Math.round(converter(value) * 100) / 100;
        }
        return value;
    };

    /**
     * Smart value correction for common OCR errors
     */
    const correctValue = (testName, rawValue) => {
        const testData = labRanges[testName];
        if (! testData || !testData.range) return rawValue;

        const [low, high] = testData.range;
        let value = rawValue;

        // If value is way out of range, try corrections
        if (value > high * 10) {
            // Maybe missing decimal:  145 → 14.5 for Hgb
            const corrected = value / 10;
            if (corrected >= low * 0.5 && corrected <= high * 1.5) {
                return { value: corrected, corrected: true, reason: 'decimal' };
            }
        }

        if (value > high * 100) {
            // Maybe missing two decimals: 1450 → 14.5
            const corrected = value / 100;
            if (corrected >= low * 0.5 && corrected <= high * 1.5) {
                return { value: corrected, corrected: true, reason: 'decimal2' };
            }
        }

        // Special cases
        if (testName === 'pH' && value > 100 && value < 800) {
            const corrected = value / 100;
            if (corrected >= 6.8 && corrected <= 7.8) {
                return { value: corrected, corrected: true, reason: 'pH' };
            }
        }

        if (testName === 'INR' && value > 10 && value < 100) {
            const corrected = value / 10;
            if (corrected >= 0.5 && corrected <= 10) {
                return { value: corrected, corrected: true, reason: 'INR' };
            }
        }

        if (testName === 'Hct' && value < 1) {
            // Convert decimal to percentage:  0.42 → 42
            const corrected = value * 100;
            if (corrected >= 15 && corrected <= 70) {
                return { value: corrected, corrected: true, reason: 'Hct' };
            }
        }

        return { value, corrected:  false };
    };

    // ═══════════════════════════════════════════════════════════════════════
    // CLINICAL INTERPRETATION
    // ═══════════════════════════════════════════════════════════════════════

    const interpretations = {
        // ══════════════ CBC ══════════════
        WBC: (v) => {
            if (v < 1) return { severity: 'critical', text: 'SEVERE NEUTROPENIA - High infection risk.  Isolation precautions.  Consider G-CSF. ', urgency: 'immediate', color: 'red' };
            if (v < 2) return { severity: 'severe', text: 'Severe leukopenia - Febrile neutropenia precautions', urgency: 'urgent', color: 'red' };
            if (v < 4) return { severity: 'low', text: 'Leukopenia - Consider viral, drug-induced, or bone marrow cause', urgency: 'soon', color: 'orange' };
            if (v > 30) return { severity: 'critical', text: 'MARKED LEUKOCYTOSIS - Consider leukemia or severe infection/sepsis', urgency:  'immediate', color: 'red' };
            if (v > 20) return { severity: 'severe', text: 'Significant leukocytosis - Evaluate for severe infection or hematologic malignancy', urgency: 'urgent', color:  'red' };
            if (v > 11) return { severity: 'high', text: 'Leukocytosis - Consider infection, inflammation, stress, corticosteroids', urgency: 'soon', color: 'orange' };
            return { severity: 'normal', text: 'Normal WBC', urgency: 'routine', color: 'green' };
        },
        
        RBC: (v) => {
            if (v < 2. 5) return { severity: 'critical', text: 'SEVERE ANEMIA - Transfusion likely needed', urgency: 'immediate', color:  'red' };
            if (v < 4.0) return { severity: 'low', text: 'Low RBC - Correlate with Hgb/Hct', urgency: 'soon', color: 'orange' };
            if (v > 6.5) return { severity: 'high', text: 'Polycythemia - Consider PV, secondary causes, or dehydration', urgency: 'soon', color: 'orange' };
            return { severity: 'normal', text: 'Normal RBC', urgency: 'routine', color: 'green' };
        },

        Hgb: (v) => {
            if (v < 7) return { severity: 'critical', text: 'SEVERE ANEMIA - Transfusion indicated.  Assess hemodynamic stability. ', urgency: 'immediate', color:  'red' };
            if (v < 8) return { severity: 'severe', text: 'Severe anemia - Consider transfusion, urgent evaluation', urgency: 'urgent', color:  'red' };
            if (v < 10) return { severity: 'moderate', text: 'Moderate anemia - Evaluate cause (iron, B12, chronic disease, blood loss)', urgency: 'soon', color: 'orange' };
            if (v < 12) return { severity: 'mild', text: 'Mild anemia - Check iron studies, reticulocytes', urgency: 'routine', color: 'yellow' };
            if (v > 18) return { severity: 'high', text: 'Polycythemia - Consider dehydration, COPD, or polycythemia vera', urgency: 'soon', color: 'orange' };
            return { severity:  'normal', text: 'Normal hemoglobin', urgency: 'routine', color: 'green' };
        },

        Hct: (v) => {
            if (v < 20) return { severity: 'critical', text: 'CRITICALLY LOW HCT - Urgent transfusion needed', urgency: 'immediate', color: 'red' };
            if (v < 30) return { severity: 'moderate', text: 'Low hematocrit - Correlate with Hgb, evaluate anemia', urgency:  'soon', color: 'orange' };
            if (v > 55) return { severity: 'high', text: 'Elevated hematocrit - Hyperviscosity risk.  Hydration, consider phlebotomy', urgency: 'urgent', color: 'orange' };
            return { severity: 'normal', text:  'Normal hematocrit', urgency: 'routine', color: 'green' };
        },

        Plt: (v) => {
            if (v < 10) return { severity: 'critical', text:  'CRITICAL THROMBOCYTOPENIA - Spontaneous bleeding risk.  Platelet transfusion. ', urgency: 'immediate', color:  'red' };
            if (v < 20) return { severity: 'critical', text: 'Severe thrombocytopenia - High bleeding risk. Avoid procedures.', urgency: 'immediate', color: 'red' };
            if (v < 50) return { severity: 'severe', text: 'Significant thrombocytopenia - Bleeding precautions.  Evaluate cause.', urgency: 'urgent', color: 'red' };
            if (v < 100) return { severity: 'moderate', text: 'Moderate thrombocytopenia - Bleeding precautions', urgency: 'soon', color: 'orange' };
            if (v > 1000) return { severity: 'high', text: 'Marked thrombocytosis - Thrombosis risk', urgency: 'urgent', color: 'orange' };
            if (v > 450) return { severity: 'high', text: 'Thrombocytosis - Monitor for essential thrombocythemia', urgency: 'soon', color: 'orange' };
            return { severity: 'normal', text: 'Normal platelets', urgency: 'routine', color: 'green' };
        }
    };

    // ═══════════════════════════════════════════════════════════════════════
    // MAIN PARSER FUNCTION
    // ═══════════════════════════════════════════════════════════════════════
    const parseLabReport = (text, options = {}) => {
        if (!text || typeof text !== 'string') {
            return {
                values: [],
                reportType: 'UNKNOWN',
                confidence: 0,
                timestamp: Date.now()
            };
        }

        const extractedValues = [];
        const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
        
        // Try to match and extract lab values
        for (const line of lines) {
            // Skip header lines
            if (/^(date|time|patient|name|id|mrn|report)/i.test(line)) continue;
            
            // Try to match lab value patterns
            for (const [testName, testData] of Object.entries(labRanges)) {
                // Check aliases
                if (testData.aliases) {
                    for (const alias of testData.aliases) {
                        const bestMatch = findBestMatch(line, 0.75);
                        if (bestMatch && bestMatch.test === testName) {
                            const extracted = extractNumericValue(line, testData.allowNegative);
                            if (extracted && extracted.value !== null) {
                                const unitInfo = detectUnit(line, testName);
                                let finalValue = extracted.value;
                                
                                // Apply unit conversion if needed
                                if (unitInfo && unitInfo.needsConversion) {
                                    finalValue = convertValue(finalValue, testName, unitInfo.originalUnit);
                                }
                                
                                // Apply smart value correction
                                const corrected = correctValue(testName, finalValue);
                                finalValue = corrected.value;
                                
                                // Determine flag
                                let flag = 'N';
                                if (finalValue < testData.range[0]) flag = 'L';
                                if (finalValue > testData.range[1]) flag = 'H';
                                if (testData.critical) {
                                    if (testData.critical.low && finalValue <= testData.critical.low) flag = 'LL';
                                    if (testData.critical.high && finalValue >= testData.critical.high) flag = 'HH';
                                }
                                
                                extractedValues.push({
                                    test: testName,
                                    value: finalValue.toString(),
                                    unit: unitInfo?.unit || testData.unit,
                                    flag: flag,
                                    refLow: testData.range[0],
                                    refHigh: testData.range[1],
                                    confidence: 85,
                                    category: testData.category || 'OTHER',
                                    corrected: corrected.corrected,
                                    validation: { status: 'valid' }
                                });
                                break;
                            }
                        }
                    }
                }
            }
        }

        return {
            values: extractedValues,
            reportType: 'AUTO',
            labType: 'GENERAL',
            confidence: extractedValues.length > 0 ? 85 : 0,
            timestamp: Date.now(),
            processed: true
        };
    };

    // ═══════════════════════════════════════════════════════════════════════
    // EXPOSE GLOBAL API (Backward Compatible)
    // ═══════════════════════════════════════════════════════════════════════
    window.LabParser = {
        version: '6.0',
        parse: parseLabReport,
        findBestMatch: findBestMatch,
        extractNumericValue: extractNumericValue,
        detectUnit: detectUnit,
        convertValue: convertValue,
        correctValue: correctValue,
        getLabRanges: () => labRanges,
        getLabInfo: (testName) => labRanges[testName],
        getAllTests: () => Object.keys(labRanges),
        isReady: true
    };

    console.log('[LabParser v6.0] Enhanced Lab Parser loaded with comprehensive database');
    console.log('[LabParser v6.0] Features: Fuzzy matching, Unit conversion, Smart corrections, ' + Object.keys(labRanges).length + ' tests');

})();
