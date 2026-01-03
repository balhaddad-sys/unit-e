/* ═══════════════════════════════════════════════════════════════════════════
   CLINICAL DECISION SUPPORT SYSTEM (CDSS) v1.0
   
   PURPOSE: Analyze laboratory results and generate preliminary clinical reports
   
   ⚠️ SAFETY DISCLAIMER ⚠️
   This system provides PRELIMINARY interpretations only.
   All outputs require clinical correlation by a qualified healthcare provider.
   This is NOT a diagnostic tool and should NOT replace professional medical judgment.
   
   References: Harrison's Principles of Internal Medicine, WHO Guidelines,
               UpToDate Clinical Decision Support
   ═══════════════════════════════════════════════════════════════════════════ */

(function() {
    'use strict';

    // ════════════════════════════════════════════════════════════════════════
    // CONFIGURATION & REFERENCE DATA
    // Based on Harrison's Principles of Internal Medicine & WHO Guidelines
    // ════════════════════════════════════════════════════════════════════════
    
    const REFERENCE_DATABASE = {
        // ─────────────────────────────────────────────────────────────────────
        // COMPLETE BLOOD COUNT (CBC)
        // ─────────────────────────────────────────────────────────────────────
        WBC: {
            name: 'White Blood Cell Count',
            category: 'CBC',
            unit: '10^9/L',
            reference: { low: 4.0, high: 11.0 },
            critical: { low: 2.0, high: 30.0 },
            interpretation: {
                low: 'Leukopenia - consider infection risk, bone marrow suppression, autoimmune conditions',
                high: 'Leukocytosis - consider infection, inflammation, leukemia, stress response',
                critical_low: 'SEVERE LEUKOPENIA - High infection risk, consider neutropenic precautions',
                critical_high: 'MARKED LEUKOCYTOSIS - Rule out leukemia, severe infection'
            },
            associations: ['NEUT', 'LYMPH', 'MONO']
        },
        RBC: {
            name: 'Red Blood Cell Count',
            category: 'CBC',
            unit: '10^12/L',
            reference: { low: 4.0, high: 6.0 },
            critical: { low: 2.5, high: 8.0 },
            interpretation: {
                low: 'Decreased RBC - evaluate for anemia etiology',
                high: 'Erythrocytosis - consider polycythemia, dehydration, hypoxia',
                critical_low: 'SEVERE ANEMIA - Consider transfusion',
                critical_high: 'MARKED ERYTHROCYTOSIS - Thrombosis risk'
            },
            associations: ['HB', 'HCT', 'MCV']
        },
        HB: {
            name: 'Hemoglobin',
            category: 'CBC',
            unit: 'g/dL',
            reference: { low: 12.0, high: 17.0 },
            critical: { low: 7.0, high: 20.0 },
            interpretation: {
                low: 'Anemia - classify by MCV (microcytic/normocytic/macrocytic)',
                high: 'Elevated Hb - consider polycythemia vera, secondary causes',
                critical_low: 'SEVERE ANEMIA - Transfusion threshold, assess hemodynamic stability',
                critical_high: 'HYPERVISCOSITY RISK - Consider phlebotomy'
            },
            associations: ['RBC', 'HCT', 'MCV', 'MCH', 'MCHC']
        },
        HCT: {
            name: 'Hematocrit',
            category: 'CBC',
            unit: '%',
            reference: { low: 36, high: 52 },
            critical: { low: 20, high: 60 },
            interpretation: {
                low: 'Low hematocrit - correlate with Hb for anemia assessment',
                high: 'Elevated hematocrit - dehydration vs true erythrocytosis',
                critical_low: 'CRITICALLY LOW - Assess volume status, transfusion need',
                critical_high: 'HYPERVISCOSITY - Stroke/thrombosis risk'
            },
            associations: ['HB', 'RBC']
        },
        MCV: {
            name: 'Mean Corpuscular Volume',
            category: 'CBC',
            unit: 'fL',
            reference: { low: 80, high: 100 },
            critical: { low: 60, high: 120 },
            interpretation: {
                low: 'Microcytosis - iron deficiency, thalassemia, chronic disease',
                high: 'Macrocytosis - B12/folate deficiency, liver disease, hypothyroidism',
                critical_low: 'Severe microcytosis - evaluate iron studies, Hb electrophoresis',
                critical_high: 'Marked macrocytosis - rule out megaloblastic anemia'
            },
            associations: ['HB', 'MCH', 'RDW']
        },
        PLT: {
            name: 'Platelet Count',
            category: 'CBC',
            unit: '10^9/L',
            reference: { low: 150, high: 400 },
            critical: { low: 50, high: 1000 },
            interpretation: {
                low: 'Thrombocytopenia - bleeding risk, evaluate cause',
                high: 'Thrombocytosis - reactive vs clonal, thrombosis risk',
                critical_low: 'SEVERE THROMBOCYTOPENIA - Spontaneous bleeding risk, consider transfusion',
                critical_high: 'MARKED THROMBOCYTOSIS - Evaluate for myeloproliferative disorder'
            },
            associations: ['MPV']
        },

        // ─────────────────────────────────────────────────────────────────────
        // RENAL FUNCTION / KIDNEY PANEL (KFT)
        // ─────────────────────────────────────────────────────────────────────
        UREA: {
            name: 'Blood Urea',
            category: 'RENAL',
            unit: 'mg/dL',
            reference: { low: 13, high: 43 },
            critical: { low: 5, high: 100 },
            interpretation: {
                low: 'Low urea - liver disease, malnutrition, overhydration',
                high: 'Elevated urea - renal dysfunction, dehydration, GI bleeding, high protein intake',
                critical_low: 'Very low urea - severe liver impairment',
                critical_high: 'UREMIA - Evaluate for dialysis indication'
            },
            associations: ['CR', 'K', 'NA']
        },
        CR: {
            name: 'Serum Creatinine',
            category: 'RENAL',
            unit: 'mg/dL',
            reference: { low: 0.7, high: 1.3 },
            critical: { low: 0.3, high: 10.0 },
            interpretation: {
                low: 'Low creatinine - reduced muscle mass, malnutrition',
                high: 'Elevated creatinine - acute or chronic kidney injury, calculate eGFR',
                critical_low: 'Very low - consider cachexia',
                critical_high: 'RENAL FAILURE - Urgent nephrology consult, evaluate dialysis'
            },
            associations: ['UREA', 'K', 'PHOS']
        },
        NA: {
            name: 'Serum Sodium',
            category: 'ELECTROLYTES',
            unit: 'mEq/L',
            reference: { low: 136, high: 145 },
            critical: { low: 120, high: 160 },
            interpretation: {
                low: 'Hyponatremia - assess volume status, SIADH, diuretics',
                high: 'Hypernatremia - dehydration, diabetes insipidus, sodium excess',
                critical_low: 'SEVERE HYPONATREMIA - Seizure risk, careful correction required',
                critical_high: 'SEVERE HYPERNATREMIA - Neurological emergency'
            },
            associations: ['K', 'CL', 'GLUCOSE']
        },
        K: {
            name: 'Serum Potassium',
            category: 'ELECTROLYTES',
            unit: 'mEq/L',
            reference: { low: 3.5, high: 5.0 },
            critical: { low: 2.5, high: 6.5 },
            interpretation: {
                low: 'Hypokalemia - arrhythmia risk, GI losses, diuretics, refeeding',
                high: 'Hyperkalemia - renal failure, medications, hemolysis (verify sample)',
                critical_low: 'SEVERE HYPOKALEMIA - Cardiac arrhythmia risk, urgent replacement',
                critical_high: 'SEVERE HYPERKALEMIA - CARDIAC EMERGENCY, immediate ECG and treatment'
            },
            associations: ['NA', 'CR', 'MG']
        },
        CL: {
            name: 'Serum Chloride',
            category: 'ELECTROLYTES',
            unit: 'mEq/L',
            reference: { low: 98, high: 107 },
            critical: { low: 80, high: 120 },
            interpretation: {
                low: 'Hypochloremia - vomiting, metabolic alkalosis, diuretics',
                high: 'Hyperchloremia - normal anion gap acidosis, dehydration',
                critical_low: 'Severe hypochloremia - evaluate acid-base status',
                critical_high: 'Marked hyperchloremia - assess for non-anion gap acidosis'
            },
            associations: ['NA', 'CO2']
        },
        CA: {
            name: 'Serum Calcium',
            category: 'ELECTROLYTES',
            unit: 'mg/dL',
            reference: { low: 8.5, high: 10.5 },
            critical: { low: 6.5, high: 13.0 },
            interpretation: {
                low: 'Hypocalcemia - hypoparathyroidism, vitamin D deficiency, renal failure',
                high: 'Hypercalcemia - hyperparathyroidism, malignancy, granulomatous disease',
                critical_low: 'SEVERE HYPOCALCEMIA - Tetany, seizure risk, IV calcium needed',
                critical_high: 'HYPERCALCEMIC CRISIS - Arrhythmia risk, urgent treatment'
            },
            associations: ['PHOS', 'ALB', 'MG']
        },
        PHOS: {
            name: 'Serum Phosphorus',
            category: 'ELECTROLYTES',
            unit: 'mg/dL',
            reference: { low: 2.4, high: 5.1 },
            critical: { low: 1.0, high: 9.0 },
            interpretation: {
                low: 'Hypophosphatemia - refeeding syndrome, alcoholism, DKA treatment',
                high: 'Hyperphosphatemia - renal failure, tumor lysis, rhabdomyolysis',
                critical_low: 'SEVERE HYPOPHOSPHATEMIA - Respiratory failure risk, urgent replacement',
                critical_high: 'Severe hyperphosphatemia - calciphylaxis risk in CKD'
            },
            associations: ['CA', 'CR']
        },
        MG: {
            name: 'Serum Magnesium',
            category: 'ELECTROLYTES',
            unit: 'mg/dL',
            reference: { low: 1.7, high: 2.5 },
            critical: { low: 1.0, high: 4.0 },
            interpretation: {
                low: 'Hypomagnesemia - refractory hypokalemia, arrhythmias, alcoholism',
                high: 'Hypermagnesemia - renal failure, iatrogenic (Mg therapy)',
                critical_low: 'SEVERE HYPOMAGNESEMIA - Arrhythmia risk, replace before K',
                critical_high: 'Severe hypermagnesemia - respiratory depression, cardiac arrest risk'
            },
            associations: ['K', 'CA']
        },

        // ─────────────────────────────────────────────────────────────────────
        // LIVER FUNCTION TESTS (LFT)
        // ─────────────────────────────────────────────────────────────────────
        ALT: {
            name: 'Alanine Aminotransferase',
            category: 'LIVER',
            unit: 'U/L',
            reference: { low: 7, high: 56 },
            critical: { low: 0, high: 1000 },
            interpretation: {
                low: 'Low ALT - generally not clinically significant',
                high: 'Elevated ALT - hepatocellular injury, more specific for liver than AST',
                critical_low: 'N/A',
                critical_high: 'ACUTE HEPATIC INJURY - Rule out drug toxicity, viral hepatitis, ischemia'
            },
            associations: ['AST', 'ALP', 'TBIL']
        },
        AST: {
            name: 'Aspartate Aminotransferase',
            category: 'LIVER',
            unit: 'U/L',
            reference: { low: 10, high: 40 },
            critical: { low: 0, high: 1000 },
            interpretation: {
                low: 'Low AST - generally not clinically significant',
                high: 'Elevated AST - liver, cardiac, or muscle injury; AST:ALT ratio informative',
                critical_low: 'N/A',
                critical_high: 'MARKED ELEVATION - Acute injury, calculate AST:ALT ratio'
            },
            associations: ['ALT', 'ALP', 'CK']
        },
        ALP: {
            name: 'Alkaline Phosphatase',
            category: 'LIVER',
            unit: 'U/L',
            reference: { low: 30, high: 120 },
            critical: { low: 0, high: 1000 },
            interpretation: {
                low: 'Low ALP - zinc deficiency, hypothyroidism, pernicious anemia',
                high: 'Elevated ALP - cholestasis, bone disease, pregnancy',
                critical_low: 'Very low - consider nutritional deficiencies',
                critical_high: 'Marked elevation - biliary obstruction, bone metastases'
            },
            associations: ['GGT', 'TBIL']
        },
        ALB: {
            name: 'Serum Albumin',
            category: 'LIVER',
            unit: 'g/dL',
            reference: { low: 3.5, high: 5.0 },
            critical: { low: 2.0, high: 6.0 },
            interpretation: {
                low: 'Hypoalbuminemia - liver disease, nephrotic syndrome, malnutrition, inflammation',
                high: 'Elevated albumin - dehydration',
                critical_low: 'SEVERE HYPOALBUMINEMIA - Edema, infection risk, correct Ca interpretation',
                critical_high: 'Marked elevation - severe dehydration'
            },
            associations: ['TP', 'CA']
        },
        TP: {
            name: 'Total Protein',
            category: 'LIVER',
            unit: 'g/dL',
            reference: { low: 5.7, high: 8.2 },
            critical: { low: 4.0, high: 10.0 },
            interpretation: {
                low: 'Hypoproteinemia - malnutrition, liver disease, nephrotic syndrome',
                high: 'Hyperproteinemia - dehydration, chronic inflammation, myeloma',
                critical_low: 'Severe hypoproteinemia - evaluate for underlying cause',
                critical_high: 'Marked elevation - rule out paraproteinemia'
            },
            associations: ['ALB']
        },
        TBIL: {
            name: 'Total Bilirubin',
            category: 'LIVER',
            unit: 'mg/dL',
            reference: { low: 0.1, high: 1.2 },
            critical: { low: 0, high: 15.0 },
            interpretation: {
                low: 'Low bilirubin - not clinically significant',
                high: 'Hyperbilirubinemia - hemolysis, hepatocellular, or cholestatic',
                critical_low: 'N/A',
                critical_high: 'SEVERE HYPERBILIRUBINEMIA - Urgent evaluation for obstruction/failure'
            },
            associations: ['DBIL', 'ALT', 'ALP']
        },

        // ─────────────────────────────────────────────────────────────────────
        // ARTERIAL BLOOD GAS (ABG)
        // ─────────────────────────────────────────────────────────────────────
        PH: {
            name: 'Blood pH',
            category: 'ABG',
            unit: '',
            reference: { low: 7.35, high: 7.45 },
            critical: { low: 7.20, high: 7.60 },
            interpretation: {
                low: 'Acidemia - metabolic or respiratory acidosis',
                high: 'Alkalemia - metabolic or respiratory alkalosis',
                critical_low: 'SEVERE ACIDEMIA - Life-threatening, immediate intervention',
                critical_high: 'SEVERE ALKALEMIA - Arrhythmia, tetany risk'
            },
            associations: ['PCO2', 'HCO3', 'BE']
        },
        PCO2: {
            name: 'Partial Pressure CO2',
            category: 'ABG',
            unit: 'mmHg',
            reference: { low: 35, high: 45 },
            critical: { low: 20, high: 70 },
            interpretation: {
                low: 'Hypocapnia - hyperventilation, respiratory alkalosis',
                high: 'Hypercapnia - hypoventilation, respiratory acidosis',
                critical_low: 'Severe hypocapnia - excessive ventilation',
                critical_high: 'SEVERE HYPERCAPNIA - Respiratory failure, consider ventilation'
            },
            associations: ['PH', 'PO2']
        },
        PO2: {
            name: 'Partial Pressure O2',
            category: 'ABG',
            unit: 'mmHg',
            reference: { low: 80, high: 100 },
            critical: { low: 60, high: 500 },
            interpretation: {
                low: 'Hypoxemia - respiratory failure, V/Q mismatch, shunt',
                high: 'Hyperoxia - supplemental O2 (reduce if not needed)',
                critical_low: 'SEVERE HYPOXEMIA - Respiratory failure, urgent intervention',
                critical_high: 'Oxygen toxicity risk if prolonged'
            },
            associations: ['SAO2', 'PCO2']
        },
        HCO3: {
            name: 'Bicarbonate',
            category: 'ABG',
            unit: 'mEq/L',
            reference: { low: 22, high: 26 },
            critical: { low: 10, high: 40 },
            interpretation: {
                low: 'Low HCO3 - metabolic acidosis, calculate anion gap',
                high: 'High HCO3 - metabolic alkalosis or compensation',
                critical_low: 'SEVERE METABOLIC ACIDOSIS - Calculate AG, lactate',
                critical_high: 'Severe metabolic alkalosis'
            },
            associations: ['PH', 'PCO2', 'BE']
        },
        LAC: {
            name: 'Lactate',
            category: 'ABG',
            unit: 'mmol/L',
            reference: { low: 0.5, high: 2.0 },
            critical: { low: 0, high: 4.0 },
            interpretation: {
                low: 'Normal lactate',
                high: 'Elevated lactate - tissue hypoperfusion, sepsis, seizures, medications',
                critical_low: 'N/A',
                critical_high: 'SEVERE LACTIC ACIDOSIS - Shock, sepsis, ischemia - urgent evaluation'
            },
            associations: ['PH', 'HCO3']
        },

        // ─────────────────────────────────────────────────────────────────────
        // COAGULATION
        // ─────────────────────────────────────────────────────────────────────
        PT: {
            name: 'Prothrombin Time',
            category: 'COAG',
            unit: 'sec',
            reference: { low: 11, high: 13.5 },
            critical: { low: 8, high: 30 },
            interpretation: {
                low: 'Shortened PT - not usually significant',
                high: 'Prolonged PT - warfarin, liver disease, vitamin K deficiency, DIC',
                critical_low: 'N/A',
                critical_high: 'SEVERE COAGULOPATHY - Bleeding risk, consider vitamin K/FFP'
            },
            associations: ['INR', 'PTT']
        },
        INR: {
            name: 'International Normalized Ratio',
            category: 'COAG',
            unit: '',
            reference: { low: 0.9, high: 1.1 },
            critical: { low: 0.5, high: 5.0 },
            interpretation: {
                low: 'Low INR - hypercoagulable (if on warfarin: subtherapeutic)',
                high: 'Elevated INR - anticoagulation effect, liver disease, DIC',
                critical_low: 'Subtherapeutic if on warfarin for clot',
                critical_high: 'SUPRATHERAPEUTIC - High bleeding risk, hold anticoagulation'
            },
            associations: ['PT']
        },
        PTT: {
            name: 'Partial Thromboplastin Time',
            category: 'COAG',
            unit: 'sec',
            reference: { low: 25, high: 35 },
            critical: { low: 15, high: 100 },
            interpretation: {
                low: 'Shortened PTT - not usually significant, some hypercoagulable states',
                high: 'Prolonged PTT - heparin, factor deficiency, lupus anticoagulant',
                critical_low: 'N/A',
                critical_high: 'SEVERE PROLONGATION - Bleeding risk, check heparin level'
            },
            associations: ['PT', 'INR']
        },

        // ─────────────────────────────────────────────────────────────────────
        // CARDIAC MARKERS
        // ─────────────────────────────────────────────────────────────────────
        TROP: {
            name: 'Troponin',
            category: 'CARDIAC',
            unit: 'ng/mL',
            reference: { low: 0, high: 0.04 },
            critical: { low: 0, high: 0.1 },
            interpretation: {
                low: 'Normal troponin',
                high: 'Elevated troponin - myocardial injury (ACS, PE, myocarditis, sepsis)',
                critical_low: 'N/A',
                critical_high: 'ACUTE MYOCARDIAL INJURY - Rule out STEMI/NSTEMI, urgent cardiology'
            },
            associations: ['CKMB', 'BNP']
        },

        // ─────────────────────────────────────────────────────────────────────
        // INFLAMMATORY MARKERS
        // ─────────────────────────────────────────────────────────────────────
        CRP: {
            name: 'C-Reactive Protein',
            category: 'INFLAMMATORY',
            unit: 'mg/dL',
            reference: { low: 0, high: 0.5 },
            critical: { low: 0, high: 20 },
            interpretation: {
                low: 'Normal CRP',
                high: 'Elevated CRP - inflammation, infection, autoimmune, malignancy',
                critical_low: 'N/A',
                critical_high: 'MARKEDLY ELEVATED - Severe infection/inflammation'
            },
            associations: ['ESR', 'WBC']
        },

        // ─────────────────────────────────────────────────────────────────────
        // GLUCOSE / METABOLIC
        // ─────────────────────────────────────────────────────────────────────
        GLUCOSE: {
            name: 'Blood Glucose',
            category: 'METABOLIC',
            unit: 'mg/dL',
            reference: { low: 70, high: 100 },
            critical: { low: 50, high: 400 },
            interpretation: {
                low: 'Hypoglycemia - insulin excess, sepsis, liver failure, adrenal insufficiency',
                high: 'Hyperglycemia - diabetes, stress, steroids, infection',
                critical_low: 'SEVERE HYPOGLYCEMIA - Neuroglycopenia, immediate treatment',
                critical_high: 'SEVERE HYPERGLYCEMIA - DKA/HHS risk, check ketones, treat'
            },
            associations: ['NA', 'K']
        }
    };

    // ════════════════════════════════════════════════════════════════════════
    // CLINICAL PATTERN RECOGNITION
    // ════════════════════════════════════════════════════════════════════════
    
    const CLINICAL_PATTERNS = [
        {
            name: 'Acute Kidney Injury (AKI)',
            criteria: (labs) => labs.CR?.flag === 'H' || labs.UREA?.flag === 'H',
            tests: ['CR', 'UREA', 'K', 'PHOS'],
            interpretation: 'Elevated renal markers suggest acute or chronic kidney injury. Calculate eGFR, assess volume status, review nephrotoxic medications.'
        },
        {
            name: 'Hyperkalemia with Renal Dysfunction',
            criteria: (labs) => labs.K?.flag === 'H' && (labs.CR?.flag === 'H' || labs.UREA?.flag === 'H'),
            tests: ['K', 'CR', 'UREA'],
            interpretation: 'URGENT: Hyperkalemia in setting of renal dysfunction. Obtain ECG immediately. Consider calcium gluconate, insulin/glucose, and nephrology consult.',
            priority: 'CRITICAL'
        },
        {
            name: 'Anemia Pattern',
            criteria: (labs) => labs.HB?.flag === 'L' || labs.HCT?.flag === 'L',
            tests: ['HB', 'HCT', 'MCV', 'RBC'],
            interpretation: 'Anemia detected. Classify by MCV: <80 microcytic (iron deficiency, thalassemia), 80-100 normocytic (chronic disease, hemolysis), >100 macrocytic (B12/folate deficiency).'
        },
        {
            name: 'Hepatocellular Injury Pattern',
            criteria: (labs) => (labs.ALT?.flag === 'H' && parseFloat(labs.ALT?.value) > 100) || (labs.AST?.flag === 'H' && parseFloat(labs.AST?.value) > 100),
            tests: ['ALT', 'AST', 'ALP', 'TBIL', 'ALB'],
            interpretation: 'Hepatocellular injury pattern. Calculate R ratio (ALT/ALP). Consider viral hepatitis panel, drug-induced injury, ischemia.'
        },
        {
            name: 'Metabolic Acidosis',
            criteria: (labs) => labs.PH?.flag === 'L' && labs.HCO3?.flag === 'L',
            tests: ['PH', 'HCO3', 'PCO2', 'LAC'],
            interpretation: 'Metabolic acidosis. Calculate anion gap. If elevated: MUDPILES (Methanol, Uremia, DKA, Propylene glycol, INH/Iron, Lactic acidosis, Ethylene glycol, Salicylates).'
        },
        {
            name: 'Electrolyte Imbalance Panel',
            criteria: (labs) => ['NA', 'K', 'CL', 'CA', 'MG', 'PHOS'].some(t => labs[t]?.flag !== 'N'),
            tests: ['NA', 'K', 'CL', 'CA', 'MG', 'PHOS'],
            interpretation: 'Electrolyte abnormalities detected. Assess fluid status, medications, and underlying conditions.'
        }
    ];

    // ════════════════════════════════════════════════════════════════════════
    // LLM SYSTEM PROMPT FOR ADVANCED INTERPRETATION
    // ════════════════════════════════════════════════════════════════════════
    
    const CDSS_SYSTEM_PROMPT = `You are a Clinical Decision Support System providing PRELIMINARY laboratory result interpretations.

CRITICAL INSTRUCTIONS:
1. You provide PRELIMINARY interpretations only - ALL findings require clinical correlation by a qualified healthcare provider.
2. Reference ONLY verified medical sources:
   - Harrison's Principles of Internal Medicine (21st Edition)
   - WHO Clinical Guidelines
   - UpToDate Clinical Decision Support
   - Current laboratory medicine standards (CLSI, IFCC)

3. Structure your response EXACTLY as follows:
   
   ## PRELIMINARY LABORATORY REPORT
   
   ### ⚠️ CRITICAL VALUES (if any)
   [List any critical values requiring immediate attention]
   
   ### Summary of Abnormalities
   [Concise summary of abnormal findings organized by system]
   
   ### Detailed Interpretation
   [System-by-system analysis]
   
   ### Suggested Follow-up
   [Based on findings, what additional tests or clinical actions might be warranted]
   
   ### Clinical Patterns Identified
   [Any recognizable clinical syndromes or patterns]

4. NEVER provide definitive diagnoses - use language like "consistent with", "suggestive of", "consider"
5. ALWAYS recommend clinical correlation
6. Flag any critical values prominently at the top
7. Consider drug interactions and common artifacts (hemolysis, lipemia)

DISCLAIMER: This is an AI-assisted preliminary interpretation. All findings must be verified and correlated clinically by a licensed healthcare provider. This system does not replace professional medical judgment.`;

    // ════════════════════════════════════════════════════════════════════════
    // CORE CDSS CLASS
    // ════════════════════════════════════════════════════════════════════════
    
    class ClinicalDecisionSupportSystem {
        constructor(options = {}) {
            this.referenceDB = REFERENCE_DATABASE;
            this.patterns = CLINICAL_PATTERNS;
            this.apiEndpoint = options.apiEndpoint || null;
            this.apiKey = options.apiKey || null;
            this.model = options.model || 'claude-sonnet-4-20250514';
        }

        /**
         * Process structured lab data input
         * @param {Array} labData - Array of {test, value, unit, reference?}
         * @returns {Object} Processed lab results with flags
         */
        processInput(labData) {
            const processed = {};
            
            for (const item of labData) {
                const testKey = this._normalizeTestName(item.test);
                const refData = this.referenceDB[testKey];
                
                if (!refData && !item.refLow && !item.refHigh) {
                    // Unknown test, include but mark as unvalidated
                    processed[item.test.toUpperCase()] = {
                        name: item.test,
                        value: item.value,
                        unit: item.unit || '',
                        flag: '?',
                        status: 'UNVALIDATED',
                        interpretation: 'Test not in reference database'
                    };
                    continue;
                }

                const value = parseFloat(item.value);
                if (isNaN(value)) {
                    processed[testKey || item.test.toUpperCase()] = {
                        name: refData?.name || item.test,
                        value: item.value,
                        unit: item.unit || refData?.unit || '',
                        flag: '?',
                        status: 'INVALID_VALUE',
                        interpretation: 'Unable to parse numeric value'
                    };
                    continue;
                }

                // Use provided reference range or database
                const refLow = item.refLow ?? refData?.reference?.low;
                const refHigh = item.refHigh ?? refData?.reference?.high;
                const critLow = refData?.critical?.low ?? refLow * 0.5;
                const critHigh = refData?.critical?.high ?? refHigh * 2;

                // Determine flag and status
                let flag = 'N';
                let status = 'NORMAL';
                let interpretation = '';

                if (value < critLow) {
                    flag = 'LL';
                    status = 'CRITICAL_LOW';
                    interpretation = refData?.interpretation?.critical_low || 'Critically low value - immediate attention required';
                } else if (value > critHigh) {
                    flag = 'HH';
                    status = 'CRITICAL_HIGH';
                    interpretation = refData?.interpretation?.critical_high || 'Critically high value - immediate attention required';
                } else if (value < refLow) {
                    flag = 'L';
                    status = 'ABNORMAL_LOW';
                    interpretation = refData?.interpretation?.low || 'Below reference range';
                } else if (value > refHigh) {
                    flag = 'H';
                    status = 'ABNORMAL_HIGH';
                    interpretation = refData?.interpretation?.high || 'Above reference range';
                } else {
                    interpretation = 'Within normal limits';
                }

                processed[testKey || item.test.toUpperCase()] = {
                    name: refData?.name || item.test,
                    value: value,
                    rawValue: item.value,
                    unit: item.unit || refData?.unit || '',
                    flag: flag,
                    status: status,
                    reference: `${refLow} - ${refHigh}`,
                    refLow: refLow,
                    refHigh: refHigh,
                    critLow: critLow,
                    critHigh: critHigh,
                    category: refData?.category || 'OTHER',
                    interpretation: interpretation,
                    associations: refData?.associations || []
                };
            }

            return processed;
        }

        /**
         * Normalize test name to database key
         */
        _normalizeTestName(name) {
            const upper = String(name).toUpperCase().replace(/[^A-Z0-9]/g, '');
            
            // Direct match
            if (this.referenceDB[upper]) return upper;
            
            // Alias search
            for (const [key, data] of Object.entries(this.referenceDB)) {
                const aliases = [data.name.toUpperCase().replace(/[^A-Z0-9]/g, '')];
                if (aliases.includes(upper)) return key;
                
                // Partial match for common variations
                if (upper.includes(key) || key.includes(upper)) return key;
            }
            
            // Common mappings
            const mappings = {
                'HEMOGLOBIN': 'HB', 'HGB': 'HB',
                'CREATININE': 'CR', 'CREAT': 'CR',
                'SODIUM': 'NA', 'POTASSIUM': 'K',
                'CHLORIDE': 'CL', 'CALCIUM': 'CA',
                'PHOSPHORUS': 'PHOS', 'PHOSPHATE': 'PHOS',
                'MAGNESIUM': 'MG', 'ALBUMIN': 'ALB',
                'TOTALPROTEIN': 'TP', 'PROTEIN': 'TP',
                'BILIRUBIN': 'TBIL', 'TOTALBILIRUBIN': 'TBIL',
                'ALKALINEPHOSPHATASE': 'ALP',
                'URICACID': 'URIC', 'BLOODUREA': 'UREA',
                'PLATELET': 'PLT', 'PLATELETS': 'PLT',
                'TROPONIN': 'TROP', 'LACTATE': 'LAC',
                'BICARBONATE': 'HCO3', 'GLUCOSE': 'GLUCOSE',
                'HEMATOCRIT': 'HCT', 'PCV': 'HCT'
            };
            
            return mappings[upper] || null;
        }

        /**
         * Identify clinical patterns from processed labs
         */
        identifyPatterns(processedLabs) {
            const identified = [];
            
            for (const pattern of this.patterns) {
                try {
                    if (pattern.criteria(processedLabs)) {
                        identified.push({
                            name: pattern.name,
                            tests: pattern.tests.filter(t => processedLabs[t]),
                            interpretation: pattern.interpretation,
                            priority: pattern.priority || 'ROUTINE'
                        });
                    }
                } catch (e) {
                    // Pattern evaluation failed, skip
                }
            }
            
            // Sort by priority
            identified.sort((a, b) => {
                const order = { 'CRITICAL': 0, 'URGENT': 1, 'ROUTINE': 2 };
                return (order[a.priority] || 2) - (order[b.priority] || 2);
            });
            
            return identified;
        }

        /**
         * Generate structured Markdown report
         */
        generateReport(labData, patientInfo = {}) {
            const processed = this.processInput(labData);
            const patterns = this.identifyPatterns(processed);
            
            const criticalValues = [];
            const abnormalValues = [];
            const normalValues = [];
            
            // Categorize results
            for (const [key, result] of Object.entries(processed)) {
                if (result.status === 'CRITICAL_LOW' || result.status === 'CRITICAL_HIGH') {
                    criticalValues.push({ key, ...result });
                } else if (result.flag === 'L' || result.flag === 'H') {
                    abnormalValues.push({ key, ...result });
                } else if (result.flag === 'N') {
                    normalValues.push({ key, ...result });
                }
            }

            // Build report
            let report = `# PRELIMINARY LABORATORY REPORT\n\n`;
            report += `**Report Generated:** ${new Date().toISOString()}\n`;
            report += `**Status:** PRELIMINARY - Requires Clinical Correlation\n\n`;
            
            if (patientInfo.name) report += `**Patient:** ${patientInfo.name}\n`;
            if (patientInfo.mrn) report += `**MRN:** ${patientInfo.mrn}\n`;
            report += `\n---\n\n`;

            // Critical Values Section
            if (criticalValues.length > 0) {
                report += `## ⚠️ CRITICAL VALUES - IMMEDIATE ATTENTION REQUIRED\n\n`;
                report += `| Test | Value | Reference | Flag | Interpretation |\n`;
                report += `|------|-------|-----------|------|----------------|\n`;
                for (const v of criticalValues) {
                    report += `| **${v.name}** | **${v.value} ${v.unit}** | ${v.reference} ${v.unit} | **${v.flag}** | ${v.interpretation} |\n`;
                }
                report += `\n`;
            }

            // Summary of Abnormalities
            report += `## Summary of Abnormalities\n\n`;
            if (abnormalValues.length === 0 && criticalValues.length === 0) {
                report += `All tested parameters are within normal limits.\n\n`;
            } else {
                // Group by category
                const byCategory = {};
                for (const v of [...criticalValues, ...abnormalValues]) {
                    const cat = v.category || 'OTHER';
                    if (!byCategory[cat]) byCategory[cat] = [];
                    byCategory[cat].push(v);
                }
                
                for (const [category, values] of Object.entries(byCategory)) {
                    report += `### ${category}\n`;
                    for (const v of values) {
                        const arrow = v.flag.includes('H') ? '↑' : '↓';
                        const severity = v.flag.length > 1 ? ' (CRITICAL)' : '';
                        report += `- **${v.name}**: ${v.value} ${v.unit} ${arrow}${severity} (Ref: ${v.reference})\n`;
                        report += `  - *${v.interpretation}*\n`;
                    }
                    report += `\n`;
                }
            }

            // Clinical Patterns
            if (patterns.length > 0) {
                report += `## Clinical Patterns Identified\n\n`;
                for (const p of patterns) {
                    const priorityBadge = p.priority === 'CRITICAL' ? '🔴 ' : p.priority === 'URGENT' ? '🟡 ' : '';
                    report += `### ${priorityBadge}${p.name}\n`;
                    report += `${p.interpretation}\n`;
                    report += `*Relevant tests: ${p.tests.join(', ')}*\n\n`;
                }
            }

            // Complete Results Table
            report += `## Complete Results\n\n`;
            report += `| Test | Result | Reference | Unit | Flag |\n`;
            report += `|------|--------|-----------|------|------|\n`;
            for (const [key, v] of Object.entries(processed)) {
                const flagEmoji = v.flag === 'N' ? '✓' : v.flag.includes('H') ? '↑' : v.flag.includes('L') ? '↓' : '?';
                report += `| ${v.name} | ${v.value} | ${v.reference || 'N/A'} | ${v.unit} | ${flagEmoji} ${v.flag} |\n`;
            }
            report += `\n`;

            // Disclaimer
            report += `---\n\n`;
            report += `## ⚕️ Important Notice\n\n`;
            report += `> **DISCLAIMER:** This is a PRELIMINARY computer-generated report.\n`;
            report += `> \n`;
            report += `> **Interpretation requires clinical correlation.**\n`;
            report += `> \n`;
            report += `> This analysis is provided for informational purposes only and does not constitute medical advice. `;
            report += `All findings must be reviewed and interpreted by a qualified healthcare provider in the context of `;
            report += `the patient's clinical presentation, medical history, and other diagnostic information.\n`;
            report += `> \n`;
            report += `> Reference: Harrison's Principles of Internal Medicine, WHO Guidelines\n`;

            return {
                report: report,
                processed: processed,
                patterns: patterns,
                summary: {
                    total: Object.keys(processed).length,
                    critical: criticalValues.length,
                    abnormal: abnormalValues.length,
                    normal: normalValues.length
                }
            };
        }

        /**
         * Get LLM-enhanced interpretation (if API configured)
         */
        async getLLMInterpretation(labData, patientContext = '') {
            if (!this.apiEndpoint || !this.apiKey) {
                console.warn('[CDSS] LLM API not configured');
                return null;
            }

            const processed = this.processInput(labData);
            const basicReport = this.generateReport(labData);

            const userMessage = `Analyze these laboratory results and provide a clinical interpretation:

${JSON.stringify(processed, null, 2)}

Patient Context: ${patientContext || 'Not provided'}

Basic Analysis Summary:
- Critical values: ${basicReport.summary.critical}
- Abnormal values: ${basicReport.summary.abnormal}
- Normal values: ${basicReport.summary.normal}

Provide your interpretation following the exact structure specified in your instructions.`;

            try {
                const response = await fetch(this.apiEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': this.apiKey,
                        'anthropic-version': '2023-06-01'
                    },
                    body: JSON.stringify({
                        model: this.model,
                        max_tokens: 2000,
                        system: CDSS_SYSTEM_PROMPT,
                        messages: [{ role: 'user', content: userMessage }]
                    })
                });

                const data = await response.json();
                return data.content?.[0]?.text || null;
            } catch (error) {
                console.error('[CDSS] LLM API error:', error);
                return null;
            }
        }
    }

    // ════════════════════════════════════════════════════════════════════════
    // EXPORT
    // ════════════════════════════════════════════════════════════════════════
    
    window.CDSS = new ClinicalDecisionSupportSystem();
    window.CDSSClass = ClinicalDecisionSupportSystem;
    window.CDSS_SYSTEM_PROMPT = CDSS_SYSTEM_PROMPT;
    
    // Safety: Always print disclaimer on load
    console.log('%c⚕️ CLINICAL DECISION SUPPORT SYSTEM LOADED', 'color: #0ea5e9; font-weight: bold; font-size: 14px;');
    console.log('%c⚠️ DISCLAIMER: All interpretations require clinical correlation by a qualified healthcare provider.', 'color: #f59e0b; font-weight: bold;');
    console.log('%cThis system provides PRELIMINARY analysis only and does not replace professional medical judgment.', 'color: #64748b;');

    // Test function
    window.testCDSS = function() {
        const sampleLabs = [
            { test: 'Urea', value: '15', unit: 'mg/dL' },
            { test: 'Creatinine', value: '1.5', unit: 'mg/dL' },  // High
            { test: 'Sodium', value: '139', unit: 'mEq/L' },
            { test: 'Potassium', value: '5.8', unit: 'mEq/L' },   // High
            { test: 'Chloride', value: '100', unit: 'mEq/L' },
            { test: 'Calcium', value: '10.2', unit: 'mg/dL' },
            { test: 'Phosphorus', value: '1.4', unit: 'mg/dL' },  // Low
            { test: 'Albumin', value: '4.1', unit: 'g/dL' },
            { test: 'Hemoglobin', value: '9.5', unit: 'g/dL' },   // Low
            { test: 'WBC', value: '12.5', unit: '10^9/L' },       // High
            { test: 'Platelets', value: '180', unit: '10^9/L' }
        ];

        console.log('%c[CDSS TEST] Input Labs:', 'color: yellow; font-weight: bold');
        console.table(sampleLabs);

        const result = window.CDSS.generateReport(sampleLabs, { name: 'Test Patient', mrn: '12345' });
        
        console.log('%c[CDSS TEST] Summary:', 'color: cyan; font-weight: bold');
        console.log(result.summary);
        
        console.log('%c[CDSS TEST] Patterns:', 'color: magenta; font-weight: bold');
        console.table(result.patterns);
        
        console.log('%c[CDSS TEST] Report:', 'color: #0f0; font-weight: bold');
        console.log(result.report);

        return result;
    };

})();
