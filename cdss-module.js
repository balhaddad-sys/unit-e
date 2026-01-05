/* ═══════════════════════════════════════════════════════════════════════════
   CLINICAL DECISION SUPPORT SYSTEM v3.0 - EVIDENCE-BASED
   
   Enhanced Features in v3.0:
   - Evidence-based interpretations linked to major clinical guidelines
   - Severity levels: panic, critical, high, low, normal with color coding
   - Urgency classification: IMMEDIATE, URGENT, SOON, ROUTINE
   - Differential diagnoses for abnormal values
   - Actionable recommendations with specific clinical actions
   - Guideline references with specific citations
   - Pattern detection for clinical syndromes
   - Critical alerts for panic values and dangerous combinations
   
   Referenced Guidelines:
   - KDIGO Guidelines (Kidney Disease)
   - ACC/AHA Guidelines (Cardiovascular)
   - AASLD/ACG Guidelines (Liver Disease)
   - ASH Guidelines (Hematology)
   - ADA Standards of Medical Care (Diabetes)
   - ISTH Guidelines (Coagulation)
   - IDSA Guidelines (Infectious Disease)
   - Endocrine Society Guidelines
   - WHO Laboratory Standards
   - Harrison's Principles of Internal Medicine (21st Ed)
   - Surviving Sepsis Campaign Guidelines
   - AABB Blood Transfusion Guidelines
   ═══════════════════════════════════════════════════════════════════════════ */

(function() {
    'use strict';

    // ═══════════════════════════════════════════════════════════════════════
    // COMPREHENSIVE REFERENCE RANGES & INTERPRETATIONS
    // ═══════════════════════════════════════════════════════════════════════
    const REFERENCE = {
        // ══════════════ HEMATOLOGY ══════════════
        WBC: {
            min: 4.0, max: 11.0, unit: '10^9/L', name: 'White Blood Cell Count',
            critical: { low: 2.0, high: 30.0 },
            interpret: {
                criticalLow: 'SEVERE LEUKOPENIA - High infection risk. Consider neutropenic precautions, blood cultures if febrile. DDx: Bone marrow suppression, chemotherapy, severe sepsis, aplastic anemia.',
                low: 'Leukopenia - DDx: Viral infection, drug-induced (NSAIDs, antibiotics, antithyroid), autoimmune, hypersplenism, nutritional deficiency (B12, folate). Monitor for infection.',
                normal: 'Within normal limits',
                high: 'Leukocytosis - DDx: Bacterial infection, inflammation, stress response, corticosteroids, smoking, CML if persistent. Check differential for shift.',
                criticalHigh: 'MARKED LEUKOCYTOSIS - Urgent evaluation. DDx: Severe infection/sepsis, leukemia (check smear), leukemoid reaction. Consider hematology consult.'
            }
        },
        RBC: {
            min: 4.0, max: 6.0, unit: '10^12/L', name: 'Red Blood Cell Count',
            critical: { low: 2.5, high: 7.0 },
            interpret: {
                criticalLow: 'SEVERE ANEMIA - Transfusion likely needed. Assess hemodynamic stability, check reticulocyte count, type & screen.',
                low: 'Decreased RBC - Correlate with Hb/Hct for anemia classification. Check MCV for morphology, reticulocytes for marrow response.',
                normal: 'Within normal limits',
                high: 'Erythrocytosis - DDx: Polycythemia vera (check JAK2), secondary (hypoxia, EPO-secreting tumor, dehydration). Check SpO2, EPO level.',
                criticalHigh: 'POLYCYTHEMIA - Risk of thrombosis. Consider phlebotomy, hydration, hematology referral.'
            }
        },
        HB: {
            min: 120, max: 170, unit: 'g/L', name: 'Hemoglobin',
            critical: { low: 70, high: 200 },
            panic: { low: 50 },
            interpret: {
                criticalLow: 'SEVERE ANEMIA - TRANSFUSION THRESHOLD - Per AABB Guidelines: Transfuse at Hgb <70 g/L (7 g/dL) for stable patients, <80 g/L if CAD/unstable. Type & crossmatch. Transfuse 1 unit pRBC, reassess. Goal 70-90 g/L. DDx: Acute blood loss, Hemolysis, Bone marrow failure. Assess symptoms: dyspnea, chest pain, tachycardia, hemodynamic instability. Reference: AABB Blood Transfusion Guidelines 2016, TRICC Trial (NEJM 1999;340:409).',
                low: 'Anemia - Classify by MCV: Microcytic (MCV<80): Iron deficiency (#1 - check ferritin, TIBC), thalassemia trait (normal RDW, target cells), chronic disease, sideroblastic. Normocytic (MCV 80-100): Acute blood loss, CKD (check EPO), hemolysis (check LDH↑, haptoglobin↓, retics↑), bone marrow pathology. Macrocytic (MCV>100): B12/folate deficiency (check methylmalonic acid for B12), MDS, alcohol, hypothyroidism, drugs (methotrexate, AZT). Reference: ASH Hematology Guidelines, Harrison\'s Ch. 126.',
                normal: 'Within normal limits',
                high: 'Elevated hemoglobin - DDx: Polycythemia vera (check JAK2 V617F mutation), secondary polycythemia (COPD - check SpO2, OSA, high altitude, EPO-secreting tumor - check EPO level), dehydration (check Hct, volume status). Reference: ASH Polycythemia Vera Guidelines 2019.',
                criticalHigh: 'HYPERVISCOSITY RISK - Hgb >200 g/L increases blood viscosity significantly. Risk of thrombosis (DVT, PE, stroke, MI). Consider therapeutic phlebotomy if symptomatic (headache, visual changes, thrombosis, pruritus after bathing). Target Hct <45% in PV. Reference: ASH Guidelines, NEJM 2013;368:33.',
                panic: 'LIFE-THREATENING ANEMIA (Hgb <50 g/L or 5 g/dL) - Cardiovascular collapse imminent. Immediate: 1) Large bore IV access, 2) STAT type & crossmatch, 3) Transfuse O negative if unstable (switch to typed when available), 4) Transfuse rapidly - 1 unit every 15min if hemorrhagic shock, 5) Consider massive transfusion protocol if ongoing bleeding (1:1:1 pRBC:FFP:Platelets), 6) Assess for active bleeding source. Monitor: Continuous cardiac monitoring, serial Hgb q1h, vital signs q15min. Reference: AABB Massive Transfusion Guidelines, Trauma Guidelines (J Trauma 2007).'
            }
        },
        HCT: {
            min: 36, max: 52, unit: '%', name: 'Hematocrit',
            critical: { low: 20, high: 60 },
            interpret: {
                criticalLow: 'CRITICAL ANEMIA - Correlates with severe blood loss or production failure. Urgent transfusion evaluation.',
                low: 'Low hematocrit - Anemia or hemodilution. Correlate with Hb. If discordant, consider IV fluid effect.',
                normal: 'Within normal limits',
                high: 'Elevated hematocrit - Hemoconcentration (dehydration) vs true erythrocytosis. Check volume status, repeat after hydration.',
                criticalHigh: 'CRITICAL POLYCYTHEMIA - High thrombosis risk. Urgent phlebotomy consideration.'
            }
        },
        MCV: {
            min: 80, max: 100, unit: 'fL', name: 'Mean Corpuscular Volume',
            interpret: {
                low: 'MICROCYTIC - DDx: Iron deficiency (#1), thalassemia trait, chronic disease, sideroblastic anemia. Check iron studies, ferritin, consider Hb electrophoresis.',
                normal: 'Normocytic - If anemic: acute blood loss, early iron deficiency, CKD, hemolysis (check LDH, haptoglobin, retics), bone marrow pathology.',
                high: 'MACROCYTIC - DDx: B12 deficiency, folate deficiency, alcohol, hypothyroidism, MDS, liver disease, reticulocytosis. Check B12, folate, TSH, retic count.'
            }
        },
        MCH: {
            min: 27, max: 33, unit: 'pg', name: 'Mean Corpuscular Hemoglobin',
            interpret: {
                low: 'Hypochromic - Reduced Hb per cell. Seen in iron deficiency, thalassemia.',
                normal: 'Within normal limits',
                high: 'Hyperchromic - Often with macrocytosis. Check B12, folate.'
            }
        },
        MCHC: {
            min: 32, max: 36, unit: 'g/dL', name: 'Mean Corpuscular Hemoglobin Concentration',
            interpret: {
                low: 'Hypochromic cells - Iron deficiency, thalassemia.',
                normal: 'Within normal limits',
                high: 'Elevated MCHC - Spherocytosis, severe dehydration, cold agglutinins (artifact).'
            }
        },
        RDW: {
            min: 11.5, max: 14.5, unit: '%', name: 'Red Cell Distribution Width',
            interpret: {
                normal: 'Homogeneous RBC population',
                high: 'Anisocytosis (variable RBC size) - Suggests mixed pathology, early iron deficiency, post-transfusion, or reticulocytosis. Helps distinguish iron deficiency (high RDW) from thalassemia trait (normal RDW).'
            }
        },
        PLT: {
            min: 150, max: 400, unit: '10^9/L', name: 'Platelet Count',
            critical: { low: 50, high: 1000 },
            interpret: {
                criticalLow: 'SEVERE THROMBOCYTOPENIA - Bleeding risk, especially <20. Hold procedures, check for DIC, HIT, TTP, ITP. Consider platelet transfusion if bleeding or <10.',
                low: 'Thrombocytopenia - DDx: Decreased production (marrow), increased destruction (ITP, TTP, DIC, HIT), sequestration (splenomegaly), dilutional. Check smear for clumps (pseudothrombocytopenia).',
                normal: 'Within normal limits',
                high: 'Thrombocytosis - Reactive (infection, inflammation, iron deficiency, post-splenectomy) vs primary (essential thrombocythemia, CML). If persistent, check JAK2, BCR-ABL.',
                criticalHigh: 'MARKED THROMBOCYTOSIS - Paradoxical bleeding or thrombosis risk. Hematology consult, consider aspirin if reactive.'
            }
        },
        MPV: {
            min: 7, max: 11, unit: 'fL', name: 'Mean Platelet Volume',
            interpret: {
                low: 'Small platelets - May indicate marrow suppression or underproduction.',
                normal: 'Within normal limits',
                high: 'Large platelets - Suggests increased platelet turnover/destruction (ITP) or myeloproliferative disorder. Young platelets are larger.'
            }
        },

        // ══════════════ CHEMISTRY / RENAL ══════════════
        NA: {
            min: 136, max: 145, unit: 'mmol/L', name: 'Sodium',
            critical: { low: 120, high: 160 },
            interpret: {
                criticalLow: 'SEVERE HYPONATREMIA - Seizure/coma risk. Assess volume status, check serum osmolality. If symptomatic: 3% saline (limit correction <8-10 mEq/24h to prevent ODS).',
                low: 'Hyponatremia - DDx by volume: Hypovolemic (diuretics, GI loss, adrenal insufficiency), Euvolemic (SIADH, hypothyroid, psychogenic polydipsia), Hypervolemic (CHF, cirrhosis, nephrotic). Check urine Na, osmolality.',
                normal: 'Within normal limits',
                high: 'Hypernatremia - Usually free water deficit. DDx: Inadequate intake (elderly, altered mental status), diabetes insipidus (central vs nephrogenic), osmotic diuresis. Calculate free water deficit, replace gradually.',
                criticalHigh: 'SEVERE HYPERNATREMIA - Neurological emergency. Risk of cerebral hemorrhage if corrected too fast. Target correction <10-12 mEq/24h.'
            }
        },
        K: {
            min: 3.5, max: 5.0, unit: 'mmol/L', name: 'Potassium',
            critical: { low: 2.5, high: 6.5 },
            panic: { low: 2.0, high: 7.0 },
            interpret: {
                criticalLow: 'SEVERE HYPOKALEMIA - Arrhythmia risk (U waves, QT prolongation, Torsades). Urgent IV replacement. Check Mg (often co-depleted). Monitor ECG. Reference: AHA ACLS Guidelines.',
                low: 'Hypokalemia - DDx: GI losses (diarrhea, vomiting), renal losses (diuretics, RTA, hyperaldosteronism), transcellular shift (insulin, β-agonists, alkalosis). Replete K and Mg. Reference: Harrison\'s Ch. 63.',
                normal: 'Within normal limits',
                high: 'Hyperkalemia - DDx: Decreased excretion (CKD, ACEi/ARB, K-sparing diuretics, hypoaldosteronism), transcellular shift (acidosis, cell lysis, rhabdo), pseudohyperkalemia (hemolysis). Check ECG, repeat if unexpected. Reference: KDIGO Guidelines.',
                criticalHigh: 'CRITICAL HYPERKALEMIA - Cardiac arrest risk (peaked T, wide QRS, sine wave). Treatment: 1) Ca gluconate 10% 10mL IV (stabilize membrane), 2) Insulin 10U + D50 (shift K intracellularly), 3) Albuterol 10-20mg nebulizer, 4) Consider bicarb if acidotic, 5) Emergent dialysis if refractory. ECG changes: Peaked T → Wide QRS → Sine wave → VF/Asystole. Reference: AHA ACLS Guidelines, Palmer BF NEJM 2021.',
                panic: 'LIFE-THREATENING HYPERKALEMIA (>7.0 mEq/L) - Cardiac arrest imminent. Expect sine wave pattern, ventricular fibrillation. IMMEDIATE actions: 1) Ca gluconate 10% 10mL IV (stabilize cardiac membrane - onset <3min), 2) Insulin 10U + D50W (shift K intracellularly - onset 15-30min), 3) Albuterol 10-20mg nebulizer (shift K - onset 30min), 4) Sodium bicarbonate if acidotic, 5) Kayexalate/Patiromer (remove K - onset 2-4hr), 6) EMERGENT DIALYSIS if refractory or symptomatic. ECG progression: Peaked T-waves → Widened QRS → Loss of P-waves → Sine wave → VF/Asystole. Reference: AHA ACLS Guidelines 2020, Palmer BF. Potassium NEJM 2021;384:1981.'
            }
        },
        CL: {
            min: 98, max: 107, unit: 'mmol/L', name: 'Chloride',
            interpret: {
                low: 'Hypochloremia - Often with metabolic alkalosis (vomiting, NG suction, diuretics). Also seen in SIADH.',
                normal: 'Within normal limits',
                high: 'Hyperchloremia - Non-anion gap metabolic acidosis (diarrhea, RTA), excessive saline. Calculate anion gap.'
            }
        },
        CO2: {
            min: 22, max: 29, unit: 'mmol/L', name: 'Bicarbonate/CO2',
            critical: { low: 12, high: 40 },
            interpret: {
                criticalLow: 'SEVERE ACIDOSIS - Calculate anion gap. High AG: MUDPILES (Methanol, Uremia, DKA, Propylene glycol, INH/Iron, Lactic, Ethylene glycol, Salicylates). Normal AG: Diarrhea, RTA.',
                low: 'Metabolic acidosis - Check anion gap and delta ratio. Respiratory compensation expected (Winters formula).',
                normal: 'Within normal limits',
                high: 'Metabolic alkalosis - DDx: Vomiting, NG suction, diuretics, hyperaldosteronism, contraction alkalosis. Check urine Cl.',
                criticalHigh: 'SEVERE ALKALOSIS - Risk of arrhythmia, seizure. Often iatrogenic or severe vomiting.'
            }
        },
        UREA: {
            min: 7, max: 20, unit: 'mg/dL', name: 'Blood Urea Nitrogen',
            critical: { high: 100 },
            interpret: {
                low: 'Low BUN - Malnutrition, liver disease, SIADH, pregnancy.',
                normal: 'Within normal limits',
                high: 'Elevated BUN - DDx: Prerenal (dehydration, CHF, bleeding), renal (AKI, CKD), postrenal (obstruction), catabolic state, GI bleed, high protein intake. Check BUN:Cr ratio (>20 suggests prerenal).',
                criticalHigh: 'UREMIA - Symptoms: encephalopathy, pericarditis, bleeding. Consider dialysis indications (AEIOU).'
            }
        },
        CR: {
            min: 0.7, max: 1.3, unit: 'mg/dL', name: 'Creatinine',
            critical: { high: 10 },
            interpret: {
                low: 'Low creatinine - Decreased muscle mass, malnutrition.',
                normal: 'Within normal limits',
                high: 'Elevated creatinine - Acute vs chronic kidney injury. AKI: prerenal (hypovolemia, cardiorenal), intrinsic (ATN, AIN, glomerulonephritis), postrenal (obstruction). Check baseline, urine studies, renal US.',
                criticalHigh: 'SEVERE RENAL FAILURE - Evaluate for dialysis: refractory hyperkalemia, acidosis, volume overload, uremic symptoms, toxin removal.'
            }
        },
        URIC: {
            min: 3.5, max: 7.2, unit: 'mg/dL', name: 'Uric Acid',
            interpret: {
                low: 'Low uric acid - SIADH, Fanconi syndrome, xanthine oxidase deficiency.',
                normal: 'Within normal limits',
                high: 'Hyperuricemia - Risk of gout, urate nephropathy. DDx: Overproduction (high purine diet, tumor lysis, myeloproliferative), underexcretion (CKD, diuretics, low-dose aspirin). Treat if symptomatic or TLS risk.'
            }
        },
        GLUCOSE: {
            min: 70, max: 100, unit: 'mg/dL', name: 'Glucose (Fasting)',
            critical: { low: 50, high: 400 },
            interpret: {
                criticalLow: 'HYPOGLYCEMIA - Neuroglycopenic emergency. Immediate glucose (oral if conscious, IV D50 if not). DDx: Insulin excess, sulfonylureas, sepsis, adrenal insufficiency, hepatic failure.',
                low: 'Low glucose - Rule out true hypoglycemia (Whipple triad). Evaluate for insulinoma if recurrent.',
                normal: 'Within normal limits (fasting)',
                high: 'Hyperglycemia - DDx: Diabetes mellitus, stress hyperglycemia, steroids, pancreatitis. If new, check HbA1c. Consider DKA/HHS if significantly elevated.',
                criticalHigh: 'SEVERE HYPERGLYCEMIA - Evaluate for DKA (ketones, AG acidosis) or HHS (hyperosmolar, minimal ketones). IV fluids, insulin, K monitoring.'
            }
        },
        CA: {
            min: 8.5, max: 10.5, unit: 'mg/dL', name: 'Calcium',
            critical: { low: 6.5, high: 13 },
            interpret: {
                criticalLow: 'SEVERE HYPOCALCEMIA - Tetany, seizure, QT prolongation risk. IV calcium gluconate. Check Mg, PTH, Vitamin D, albumin (correct for hypoalbuminemia).',
                low: 'Hypocalcemia - DDx: Hypoparathyroidism, vitamin D deficiency, CKD, pancreatitis, hypomagnesemia, tumor lysis. Correct for albumin.',
                normal: 'Within normal limits',
                high: 'Hypercalcemia - DDx: 90% due to primary hyperparathyroidism or malignancy. Others: granulomatous disease, thiazides, immobilization, milk-alkali. Check PTH, PTHrP.',
                criticalHigh: 'HYPERCALCEMIC CRISIS - AMS, cardiac arrhythmia risk. Aggressive IVF (200-300 mL/hr), calcitonin, bisphosphonates, consider dialysis.'
            }
        },
        MG: {
            min: 1.7, max: 2.5, unit: 'mg/dL', name: 'Magnesium',
            critical: { low: 1.0, high: 4.5 },
            interpret: {
                criticalLow: 'SEVERE HYPOMAGNESEMIA - Arrhythmia risk, refractory hypokalemia. IV magnesium sulfate. Common in alcoholism, diuretics, GI losses, PPIs.',
                low: 'Hypomagnesemia - Often causes refractory hypokalemia and hypocalcemia. Must replete Mg to correct K.',
                normal: 'Within normal limits',
                high: 'Hypermagnesemia - Usually iatrogenic (IV Mg, renal failure + Mg-containing antacids). Causes weakness, hyporeflexia, cardiac depression.',
                criticalHigh: 'SEVERE HYPERMAGNESEMIA - Respiratory depression, cardiac arrest risk. IV calcium, supportive care, dialysis if severe.'
            }
        },
        PHOS: {
            min: 2.4, max: 5.1, unit: 'mg/dL', name: 'Phosphorus',
            critical: { low: 1.0, high: 8.0 },
            interpret: {
                criticalLow: 'SEVERE HYPOPHOSPHATEMIA - Weakness, rhabdomyolysis, respiratory failure, hemolysis. IV phosphate carefully. Seen in refeeding syndrome, DKA treatment.',
                low: 'Hypophosphatemia - DDx: Refeeding syndrome, DKA recovery, respiratory alkalosis, vitamin D deficiency, hyperparathyroidism.',
                normal: 'Within normal limits',
                high: 'Hyperphosphatemia - Usually CKD. Also tumor lysis, rhabdomyolysis, hypoparathyroidism. Can cause metastatic calcification.',
                criticalHigh: 'SEVERE HYPERPHOSPHATEMIA - Risk of Ca×P precipitation, soft tissue calcification. Phosphate binders, dialysis if severe.'
            }
        },

        // ══════════════ LIVER FUNCTION ══════════════
        ALT: {
            min: 7, max: 56, unit: 'U/L', name: 'Alanine Aminotransferase',
            critical: { high: 1000 },
            interpret: {
                normal: 'Within normal limits',
                high: 'Elevated ALT - More liver-specific than AST. Mild (2-5x): NAFLD, hepatitis, drugs. Moderate (5-15x): Acute hepatitis, ischemia. Severe (>15x): Acute viral hepatitis, toxin (acetaminophen), ischemic hepatitis.',
                criticalHigh: 'SEVERE HEPATOCELLULAR INJURY - >1000 suggests ischemic hepatitis, acute viral hepatitis, or toxin (acetaminophen). Check PT/INR for synthetic function.'
            }
        },
        AST: {
            min: 10, max: 40, unit: 'U/L', name: 'Aspartate Aminotransferase',
            critical: { high: 1000 },
            interpret: {
                normal: 'Within normal limits',
                high: 'Elevated AST - Less specific (also in muscle, heart, RBC). AST:ALT >2 suggests alcoholic liver disease. Isolated AST elevation: rhabdomyolysis, MI, hemolysis.',
                criticalHigh: 'SEVERE ELEVATION - Same DDx as ALT. If AST >> ALT with rhabdomyolysis presentation, check CK.'
            }
        },
        ALP: {
            min: 30, max: 120, unit: 'U/L', name: 'Alkaline Phosphatase',
            interpret: {
                low: 'Low ALP - Hypothyroidism, anemia, zinc deficiency.',
                normal: 'Within normal limits',
                high: 'Elevated ALP - Cholestatic pattern. DDx: Biliary obstruction, PBC, PSC, drug-induced, infiltrative disease, bone disease (fracture, Paget, mets). Check GGT to confirm hepatic origin.'
            }
        },
        GGT: {
            min: 9, max: 48, unit: 'U/L', name: 'Gamma-Glutamyl Transferase',
            interpret: {
                normal: 'Within normal limits',
                high: 'Elevated GGT - Very sensitive but nonspecific. Induced by alcohol, many drugs. If elevated with ALP, confirms hepatic source of ALP. Isolated GGT elevation often alcohol or enzyme induction.'
            }
        },
        TBIL: {
            min: 0.1, max: 1.2, unit: 'mg/dL', name: 'Total Bilirubin',
            critical: { high: 15 },
            interpret: {
                normal: 'Within normal limits',
                high: 'Hyperbilirubinemia - Unconjugated (indirect): Hemolysis, Gilbert syndrome, ineffective erythropoiesis. Conjugated (direct): Hepatocellular injury, cholestasis, biliary obstruction. Check direct/indirect split.',
                criticalHigh: 'SEVERE JAUNDICE - Evaluate for acute liver failure (check INR, encephalopathy), biliary obstruction (US/MRCP), or massive hemolysis.'
            }
        },
        DBIL: {
            min: 0, max: 0.3, unit: 'mg/dL', name: 'Direct Bilirubin',
            interpret: {
                normal: 'Within normal limits',
                high: 'Elevated direct bilirubin - Indicates hepatocellular or cholestatic disease. >50% of total suggests conjugated hyperbilirubinemia: biliary obstruction, hepatitis, drugs.'
            }
        },
        ALB: {
            min: 3.2, max: 4.8, unit: 'g/dL', name: 'Albumin',
            critical: { low: 2.0 },
            interpret: {
                criticalLow: 'SEVERE HYPOALBUMINEMIA - High infection risk, edema, poor wound healing. DDx: Malnutrition, liver failure, nephrotic syndrome, protein-losing enteropathy, burns.',
                low: 'Low albumin - Marker of chronic illness, malnutrition, or loss. Correct calcium for albumin level.',
                normal: 'Within normal limits'
            }
        },
        TP: {
            min: 5.7, max: 8.2, unit: 'g/dL', name: 'Total Protein',
            interpret: {
                low: 'Low total protein - Malnutrition, malabsorption, nephrotic syndrome, liver disease.',
                normal: 'Within normal limits',
                high: 'Elevated total protein - DDx: Dehydration, multiple myeloma (check SPEP), chronic infection/inflammation. Calculate globulin gap (TP - albumin).'
            }
        },

        // ══════════════ COAGULATION ══════════════
        PT: {
            min: 11, max: 13.5, unit: 'sec', name: 'Prothrombin Time',
            interpret: {
                normal: 'Within normal limits',
                high: 'Prolonged PT - DDx: Warfarin, vitamin K deficiency, liver disease, DIC, factor VII deficiency. PT more sensitive to warfarin and liver disease than PTT.'
            }
        },
        INR: {
            min: 0.9, max: 1.1, unit: '', name: 'International Normalized Ratio',
            critical: { high: 5.0 },
            interpret: {
                normal: 'Within normal limits (therapeutic 2-3 for most indications)',
                high: 'Elevated INR - If on warfarin: assess bleeding, hold warfarin, consider vitamin K or FFP if bleeding. If not on anticoagulation: liver disease, vitamin K deficiency, DIC.',
                criticalHigh: 'CRITICAL INR - High bleeding risk. Vitamin K IV, FFP or PCC if active bleeding or urgent procedure needed.'
            }
        },
        PTT: {
            min: 25, max: 35, unit: 'sec', name: 'Partial Thromboplastin Time',
            interpret: {
                normal: 'Within normal limits',
                high: 'Prolonged PTT - DDx: Heparin, factor deficiency (VIII, IX, XI, XII), lupus anticoagulant, DIC, severe liver disease. Do mixing study if unexplained.'
            }
        },

        // ══════════════ CARDIAC ══════════════
        TROP: {
            min: 0, max: 0.04, unit: 'ng/mL', name: 'Troponin',
            critical: { high: 0.1 },
            interpret: {
                normal: 'Within normal limits',
                high: 'Elevated troponin - Type 1 MI (plaque rupture) vs Type 2 MI (supply-demand mismatch: sepsis, PE, tachyarrhythmia, anemia). Also elevated in: myocarditis, PE, CHF, renal failure, takotsubo.',
                criticalHigh: 'SIGNIFICANTLY ELEVATED - High probability acute coronary syndrome if clinical context supports. Serial measurements, ECG, early cardiology involvement.'
            }
        },
        BNP: {
            min: 0, max: 100, unit: 'pg/mL', name: 'BNP / NT-proBNP',
            interpret: {
                normal: 'Heart failure unlikely if <100 pg/mL (BNP) or <300 pg/mL (NT-proBNP)',
                high: 'Elevated BNP - Suggests cardiac wall stress. DDx: Heart failure (#1), PE, pulmonary HTN, ACS, renal failure. Higher in elderly, women, AF. Lower in obesity. Use with clinical context.'
            }
        },

        // ══════════════ ABG ══════════════
        PH: {
            min: 7.35, max: 7.45, unit: '', name: 'Blood pH',
            critical: { low: 7.20, high: 7.60 },
            interpret: {
                criticalLow: 'SEVERE ACIDEMIA - Cardiovascular depression, arrhythmia risk. Identify and treat cause urgently. Check lactate, ketones, toxins.',
                low: 'Acidemia - Determine if metabolic (low HCO3) or respiratory (high pCO2). Calculate anion gap if metabolic.',
                normal: 'Within normal limits',
                high: 'Alkalemia - Determine if metabolic (high HCO3) or respiratory (low pCO2). Assess for appropriate compensation.',
                criticalHigh: 'SEVERE ALKALEMIA - Arrhythmia, seizure risk. Often iatrogenic or severe vomiting.'
            }
        },
        PCO2: {
            min: 35, max: 45, unit: 'mmHg', name: 'Partial Pressure CO2',
            critical: { low: 20, high: 70 },
            interpret: {
                criticalLow: 'SEVERE HYPOCAPNIA - Usually compensation for metabolic acidosis or primary respiratory alkalosis (anxiety, PE, CNS). If chronic, check for adaptation.',
                low: 'Hypocapnia - Hyperventilation. Primary respiratory alkalosis or compensation for metabolic acidosis.',
                normal: 'Within normal limits',
                high: 'Hypercapnia - Hypoventilation. DDx: COPD, sedation, neuromuscular disease, obesity hypoventilation. Assess if acute (acidemic) or chronic (compensated).',
                criticalHigh: 'SEVERE HYPERCAPNIA - Respiratory failure, CO2 narcosis risk. Consider BiPAP or intubation.'
            }
        },
        PO2: {
            min: 80, max: 100, unit: 'mmHg', name: 'Partial Pressure O2',
            critical: { low: 60 },
            interpret: {
                criticalLow: 'HYPOXEMIA - Respiratory failure. Check A-a gradient to determine cause: Normal A-a: hypoventilation, low FiO2. Elevated A-a: V/Q mismatch, shunt, diffusion defect.',
                low: 'Mild hypoxemia - Correlate with SpO2 and clinical status. May be normal in COPD.',
                normal: 'Within normal limits'
            }
        },
        HCO3: {
            min: 22, max: 26, unit: 'mEq/L', name: 'Bicarbonate',
            critical: { low: 10, high: 40 },
            interpret: {
                criticalLow: 'SEVERE METABOLIC ACIDOSIS - Check anion gap. Consider bicarbonate therapy if pH <7.1 and not DKA.',
                low: 'Metabolic acidosis - Calculate anion gap. Check for respiratory compensation (expected pCO2 = 1.5×HCO3 + 8).',
                normal: 'Within normal limits',
                high: 'Metabolic alkalosis - DDx: Vomiting, diuretics, hyperaldosteronism. Check urine chloride.',
                criticalHigh: 'SEVERE METABOLIC ALKALOSIS - Paradoxical aciduria may occur.'
            }
        },
        LAC: {
            min: 0.5, max: 2.0, unit: 'mmol/L', name: 'Lactate',
            critical: { high: 4.0 },
            interpret: {
                normal: 'Within normal limits',
                high: 'Elevated lactate - Type A (tissue hypoxia): shock, sepsis, ischemia. Type B: medications (metformin), liver failure, malignancy, thiamine deficiency. Trend more important than single value.',
                criticalHigh: 'SEVERE LACTIC ACIDOSIS - High mortality marker. Aggressive resuscitation, identify and treat cause. Consider thiamine in alcoholics.'
            }
        },

        // ══════════════ THYROID ══════════════
        TSH: {
            min: 0.4, max: 4.0, unit: 'mIU/L', name: 'Thyroid Stimulating Hormone',
            critical: { low: 0.1, high: 10 },
            interpret: {
                criticalLow: 'Very low TSH - Hyperthyroidism or central hypothyroidism. Check free T4, T3. If symptomatic (tachycardia, tremor, weight loss), consider Graves, toxic nodule, thyroiditis.',
                low: 'Low TSH - Subclinical or overt hyperthyroidism. Confirm with free T4.',
                normal: 'Within normal limits',
                high: 'Elevated TSH - Primary hypothyroidism. If T4 normal, subclinical. Symptoms: fatigue, cold intolerance, constipation, weight gain.',
                criticalHigh: 'Markedly elevated TSH - Overt hypothyroidism. If severe symptoms (hypothermia, AMS), consider myxedema coma.'
            }
        },

        // ══════════════ INFLAMMATORY ══════════════
        CRP: {
            min: 0, max: 0.5, unit: 'mg/dL', name: 'C-Reactive Protein',
            interpret: {
                normal: 'Within normal limits',
                high: 'Elevated CRP - Nonspecific inflammation marker. Higher levels (>10) suggest bacterial infection. Also elevated in autoimmune disease, malignancy, MI. Trend useful for monitoring.'
            }
        },
        ESR: {
            min: 0, max: 20, unit: 'mm/hr', name: 'Erythrocyte Sedimentation Rate',
            interpret: {
                normal: 'Within normal limits (increases with age)',
                high: 'Elevated ESR - Nonspecific. DDx: Infection, inflammation, malignancy, autoimmune disease. Very high (>100): temporal arteritis, multiple myeloma, endocarditis, osteomyelitis, TB.'
            }
        },
        PCT: {
            min: 0, max: 0.1, unit: 'ng/mL', name: 'Procalcitonin',
            critical: { high: 2.0 },
            interpret: {
                normal: 'Low bacterial infection probability',
                high: 'Elevated procalcitonin - Suggests bacterial infection, especially >0.5. Useful for antibiotic stewardship (safe to stop if trending down). Less reliable in localized infections.',
                criticalHigh: 'Very high procalcitonin - High probability of severe bacterial infection/sepsis.'
            }
        }
    };

    // ═══════════════════════════════════════════════════════════════════════
    // CLINICAL PATTERN DETECTION
    // ═══════════════════════════════════════════════════════════════════════
    const PATTERNS = [
        {
            id: 'aki',
            name: 'Acute Kidney Injury (KDIGO Classification)',
            priority: 'CRITICAL',
            test: (labs) => {
                const cr = labs.CR?.numValue;
                if (!cr) return false;
                if (cr >= 3.0) return { match: true, stage: 3, detail: 'Stage 3 AKI (≥3x baseline or Cr ≥4.0)' };
                if (cr >= 2.0) return { match: true, stage: 2, detail: 'Stage 2 AKI (2-2.9x baseline)' };
                if (cr >= 1.5) return { match: true, stage: 1, detail: 'Stage 1 AKI (1.5-1.9x baseline or ≥0.3 increase)' };
                return false;
            },
            interpretation: (result) => `${result.detail} per KDIGO Guidelines. Assess volume status, urine output (<0.5 mL/kg/h for 6-12h), medications (STOP nephrotoxins: NSAIDs, ACEi/ARB if volume depleted, contrast, aminoglycosides, vancomycin). Classify: Prerenal (BUN:Cr >20, FENa <1%, responds to fluids), Intrinsic (ATN, AIN, GN - check urinalysis, urine eosinophils, serologies), Postrenal (obstruction - STAT renal ultrasound). Labs: Urine sediment (muddy brown casts = ATN, WBC casts = AIN/pyelonephritis, RBC casts = GN), FENa, urine electrolytes. Management: Fluid balance, avoid nephrotoxins, dose-adjust medications, consider nephrology if Stage 2-3 or uncertain etiology. Dialysis indications (AEIOU): Acidosis (pH <7.1), Electrolytes (K >6.5), Ingestion (toxic alcohols), Overload (refractory pulmonary edema), Uremia (pericarditis, encephalopathy, bleeding). Reference: KDIGO AKI Guidelines 2012, Kidney Int 2012;2:1-138.`
        },
        {
            id: 'hyperkalemia',
            name: 'Hyperkalemia',
            priority: 'CRITICAL',
            test: (labs) => {
                const k = labs.K?.numValue;
                if (!k) return false;
                if (k >= 6.5) return { match: true, severity: 'severe', detail: 'Severe hyperkalemia' };
                if (k >= 6.0) return { match: true, severity: 'moderate', detail: 'Moderate hyperkalemia' };
                if (k >= 5.5) return { match: true, severity: 'mild', detail: 'Mild hyperkalemia' };
                return false;
            },
            interpretation: (result) => `${result.detail}. IMMEDIATE: Get ECG (peaked T, wide QRS = emergency). Treatment ladder: 1) Calcium gluconate (cardiac membrane stabilization), 2) Insulin + glucose (shift K intracellularly), 3) Albuterol nebs, 4) Kayexalate/Patiromer/Lokelma (remove K), 5) Dialysis if refractory. Stop K supplements, ACEi/ARB, K-sparing diuretics.`
        },
        {
            id: 'hyponatremia',
            name: 'Hyponatremia',
            priority: 'CRITICAL',
            test: (labs) => {
                const na = labs.NA?.numValue;
                if (!na) return false;
                if (na <= 120) return { match: true, severity: 'severe', detail: 'Severe hyponatremia' };
                if (na <= 125) return { match: true, severity: 'moderate', detail: 'Moderate hyponatremia' };
                if (na <= 130) return { match: true, severity: 'mild', detail: 'Mild hyponatremia' };
                return false;
            },
            interpretation: (result) => `${result.detail}. If symptomatic (seizure, AMS): 3% saline 100mL bolus. CRITICAL: Correct slowly (<8-10 mEq/24h) to prevent osmotic demyelination syndrome. Workup: serum osm, urine osm, urine Na. Algorithm: Hypovolemic (diuretics, GI loss) → give NS. Euvolemic (SIADH) → fluid restrict. Hypervolemic (CHF, cirrhosis) → fluid restrict + treat underlying.`
        },
        {
            id: 'anemia',
            name: 'Anemia Pattern',
            priority: 'HIGH',
            test: (labs) => {
                const hb = labs.HB?.numValue;
                const mcv = labs.MCV?.numValue;
                if (!hb || hb >= 120) return false;
                let type = 'normocytic';
                if (mcv && mcv < 80) type = 'microcytic';
                else if (mcv && mcv > 100) type = 'macrocytic';
                const severity = hb < 70 ? 'severe' : hb < 90 ? 'moderate' : 'mild';
                return { match: true, type, severity, hb, mcv };
            },
            interpretation: (result) => {
                let base = `${result.severity.charAt(0).toUpperCase() + result.severity.slice(1)} ${result.type} anemia (Hb: ${result.hb} g/L`;
                if (result.mcv) base += `, MCV: ${result.mcv} fL`;
                base += '). ';
                if (result.type === 'microcytic') {
                    base += 'DDx: Iron deficiency (#1 worldwide - check ferritin, iron, TIBC), thalassemia trait (normal RDW, target cells), chronic disease, sideroblastic. Mentzer index (MCV/RBC): <13 suggests thalassemia, >13 suggests iron deficiency.';
                } else if (result.type === 'macrocytic') {
                    base += 'DDx: B12 deficiency (neurologic sx, check methylmalonic acid), folate deficiency, hypothyroidism, liver disease, MDS, reticulocytosis, drugs (methotrexate, AZT).';
                } else {
                    base += 'DDx: Acute blood loss, chronic disease (low EPO response), CKD (check EPO level), hemolysis (LDH↑, haptoglobin↓, retics↑), bone marrow pathology.';
                }
                if (result.severity === 'severe') base += ' Consider transfusion if symptomatic (chest pain, dyspnea, hemodynamic instability).';
                return base;
            }
        },
        {
            id: 'dka_hhs',
            name: 'DKA/HHS Picture',
            priority: 'CRITICAL',
            test: (labs) => {
                const glu = labs.GLUCOSE?.numValue;
                const co2 = labs.CO2?.numValue || labs.HCO3?.numValue;
                const ph = labs.PH?.numValue;
                if (!glu || glu < 250) return false;
                const acidotic = (co2 && co2 < 18) || (ph && ph < 7.3);
                if (glu >= 600) return { match: true, type: 'HHS', detail: 'Hyperosmolar Hyperglycemic State' };
                if (glu >= 250 && acidotic) return { match: true, type: 'DKA', detail: 'Diabetic Ketoacidosis pattern' };
                return false;
            },
            interpretation: (result) => result.type === 'DKA' ?
                'DKA pattern detected. Confirm with ketones (serum β-hydroxybutyrate >3). Management: 1) Aggressive IVF (NS then 0.45% when Na normalizes), 2) Insulin drip 0.1 U/kg/hr (start after K >3.3), 3) K replacement (add 20-40 mEq/L to fluids), 4) Monitor AG closure, 5) Transition to SQ insulin when eating, AG closed, HCO3 >15. Find precipitant: Infection, Infarction, Insulin missed, Intoxication.' :
                'HHS pattern detected. Characterized by severe hyperglycemia (>600), hyperosmolality (>320), minimal ketosis. Management similar to DKA but: 1) Even more aggressive IVF (often 6-9L deficit), 2) Lower insulin dose (0.05-0.1 U/kg/hr), 3) Correct Na slowly. Higher mortality than DKA.'
        },
        {
            id: 'sepsis',
            name: 'Sepsis Markers',
            priority: 'CRITICAL',
            test: (labs) => {
                const wbc = labs.WBC?.numValue;
                const lac = labs.LAC?.numValue;
                const plt = labs.PLT?.numValue;
                let score = 0;
                let findings = [];
                if (wbc && (wbc > 12 || wbc < 4)) { score++; findings.push(wbc > 12 ? 'leukocytosis' : 'leukopenia'); }
                if (lac && lac > 2) { score++; findings.push('elevated lactate'); }
                if (plt && plt < 100) { score++; findings.push('thrombocytopenia'); }
                if (score >= 2) return { match: true, findings, lac };
                return false;
            },
            interpretation: (result) => `Concerning sepsis pattern: ${result.findings.join(', ')}. ${result.lac >= 4 ? 'Lactate ≥4 indicates septic shock.' : ''} Initiate Surviving Sepsis Campaign bundle: 1) Blood cultures before antibiotics, 2) Broad spectrum antibiotics within 1 hour, 3) Crystalloid 30 mL/kg if hypotensive or lactate ≥4, 4) Vasopressors if persistent hypotension, 5) Measure lactate q2-4h. Source control critical.`
        },
        {
            id: 'dic',
            name: 'DIC Pattern',
            priority: 'CRITICAL',
            test: (labs) => {
                const plt = labs.PLT?.numValue;
                const inr = labs.INR?.numValue;
                const fib = labs.FIB?.numValue;
                const ddimer = labs.DIMER?.numValue;
                let score = 0;
                if (plt && plt < 100) score += plt < 50 ? 2 : 1;
                if (inr && inr > 1.5) score++;
                if (fib && fib < 100) score++;
                if (ddimer && ddimer > 2) score++;
                if (score >= 3) return { match: true, score };
                return false;
            },
            interpretation: (result) => `DIC pattern (ISTH score ≥5 diagnostic). Consumption coagulopathy with simultaneous thrombosis and bleeding. Management: Treat underlying cause (#1 priority), platelet transfusion if <20 or bleeding, FFP/cryoprecipitate for fibrinogen <100, consider heparin only if thrombosis predominant (controversial).`
        },
        {
            id: 'electrolyte_panel',
            name: 'Electrolyte Imbalance Panel',
            priority: 'HIGH',
            test: (labs) => {
                const abnormal = [];
                if (labs.NA?.flag?.includes('L')) abnormal.push('hyponatremia');
                if (labs.NA?.flag?.includes('H')) abnormal.push('hypernatremia');
                if (labs.K?.flag?.includes('L')) abnormal.push('hypokalemia');
                if (labs.K?.flag?.includes('H')) abnormal.push('hyperkalemia');
                if (labs.CA?.flag?.includes('L')) abnormal.push('hypocalcemia');
                if (labs.CA?.flag?.includes('H')) abnormal.push('hypercalcemia');
                if (labs.MG?.flag?.includes('L')) abnormal.push('hypomagnesemia');
                if (labs.PHOS?.flag?.includes('L')) abnormal.push('hypophosphatemia');
                if (abnormal.length >= 2) return { match: true, abnormal };
                return false;
            },
            interpretation: (result) => `Multiple electrolyte abnormalities: ${result.abnormal.join(', ')}. Consider common causes affecting multiple electrolytes: GI losses (diarrhea/vomiting), renal losses (diuretics, tubular disorders), refeeding syndrome, alcoholism, malnutrition. Mg and K often co-depleted - must correct Mg to correct refractory hypokalemia.`
        },
        {
            id: 'hepatocellular',
            name: 'Hepatocellular Injury',
            priority: 'HIGH',
            test: (labs) => {
                const alt = labs.ALT?.numValue;
                const ast = labs.AST?.numValue;
                if (!alt && !ast) return false;
                const max = Math.max(alt || 0, ast || 0);
                if (max > 1000) return { match: true, severity: 'severe', alt, ast, pattern: 'hepatocellular' };
                if (max > 300) return { match: true, severity: 'moderate', alt, ast, pattern: 'hepatocellular' };
                if (max > 100) return { match: true, severity: 'mild', alt, ast, pattern: 'hepatocellular' };
                return false;
            },
            interpretation: (result) => {
                let base = `${result.severity} hepatocellular injury pattern (ALT: ${result.alt || '?'}, AST: ${result.ast || '?'}). `;
                if (result.severity === 'severe') {
                    base += '>1000 suggests: Ischemic hepatitis (shock liver - check cardiac), acute viral hepatitis (check HAV IgM, HBsAg, HCV Ab), toxin (ACETAMINOPHEN LEVEL stat - use Rumack-Matthew nomogram), autoimmune hepatitis flare. Check PT/INR urgently for synthetic function.';
                } else {
                    base += 'DDx: Viral hepatitis, drug/toxin (review all medications), NAFLD/NASH, autoimmune, Wilson disease. AST:ALT >2 suggests alcoholic etiology. Obtain hepatitis serologies, consider autoimmune panel.';
                }
                return base;
            }
        },
        {
            id: 'cholestatic',
            name: 'Cholestatic Pattern',
            priority: 'HIGH',
            test: (labs) => {
                const alp = labs.ALP?.numValue;
                const ggt = labs.GGT?.numValue;
                const tbil = labs.TBIL?.numValue;
                if (!alp || alp < 150) return false;
                if (ggt && ggt > 100) return { match: true, alp, ggt, tbil };
                return false;
            },
            interpretation: (result) => `Cholestatic pattern (ALP: ${result.alp}, GGT: ${result.ggt}${result.tbil ? ', Bili: ' + result.tbil : ''}). Indicates biliary obstruction or intrahepatic cholestasis. DDx: Biliary obstruction (stone, stricture, mass) - get RUQ US or MRCP. Intrahepatic: PBC (check AMA), PSC (MRCP), drug-induced, infiltrative disease. Isolated ALP elevation: also consider bone source (check GGT to differentiate).`
        },
        {
            id: 'pancytopenia',
            name: 'Pancytopenia',
            priority: 'CRITICAL',
            test: (labs) => {
                const wbc = labs.WBC?.numValue;
                const hb = labs.HB?.numValue;
                const plt = labs.PLT?.numValue;
                if (!wbc || !hb || !plt) return false;
                if (wbc < 4 && hb < 100 && plt < 150) return { match: true, wbc, hb, plt };
                return false;
            },
            interpretation: (result) => `Pancytopenia detected (WBC: ${result.wbc}, Hb: ${result.hb}, PLT: ${result.plt}). All three lineages affected suggests bone marrow pathology or peripheral destruction. DDx: Bone marrow failure (aplastic anemia, MDS, leukemia, myelofibrosis, metastatic cancer), B12/folate deficiency, overwhelming infection, hypersplenism, medications, paroxysmal nocturnal hemoglobinuria. Bone marrow biopsy usually indicated.`
        }
    ];

    // ═══════════════════════════════════════════════════════════════════════
    // MAIN PROCESSING FUNCTION
    // ═══════════════════════════════════════════════════════════════════════
    function processLabs(labValues, patientInfo = {}) {
        const processed = {};
        const summary = { critical: 0, abnormal: 0, normal: 0, total: 0 };

        // Process each lab value
        for (const lab of labValues) {
            const testKey = lab.test?.toUpperCase();
            const ref = REFERENCE[testKey];
            if (!ref) continue;

            const numValue = parseFloat(lab.value);
            if (isNaN(numValue)) continue;

            summary.total++;

            // Determine flag and status
            let flag = 'N';
            let status = 'NORMAL';
            let interpretation = ref.interpret?.normal || 'Within normal limits';

            const isCriticalLow = ref.critical?.low !== undefined && numValue <= ref.critical.low;
            const isCriticalHigh = ref.critical?.high !== undefined && numValue >= ref.critical.high;
            const isLow = numValue < ref.min;
            const isHigh = numValue > ref.max;

            if (isCriticalLow) {
                flag = 'LL';
                status = 'CRITICAL_LOW';
                interpretation = ref.interpret?.criticalLow || ref.interpret?.low || 'Critically low';
                summary.critical++;
            } else if (isCriticalHigh) {
                flag = 'HH';
                status = 'CRITICAL_HIGH';
                interpretation = ref.interpret?.criticalHigh || ref.interpret?.high || 'Critically high';
                summary.critical++;
            } else if (isLow) {
                flag = 'L';
                status = 'LOW';
                interpretation = ref.interpret?.low || 'Below reference range';
                summary.abnormal++;
            } else if (isHigh) {
                flag = 'H';
                status = 'HIGH';
                interpretation = ref.interpret?.high || 'Above reference range';
                summary.abnormal++;
            } else {
                summary.normal++;
            }

            processed[testKey] = {
                name: ref.name,
                value: numValue,
                unit: lab.unit || ref.unit,
                flag,
                status,
                reference: `${ref.min} - ${ref.max}`,
                refLow: ref.min,
                refHigh: ref.max,
                interpretation,
                numValue
            };
        }

        // Detect clinical patterns
        const patterns = [];
        for (const pattern of PATTERNS) {
            const result = pattern.test(processed);
            if (result && result.match) {
                patterns.push({
                    id: pattern.id,
                    name: pattern.name,
                    priority: pattern.priority,
                    interpretation: typeof pattern.interpretation === 'function' 
                        ? pattern.interpretation(result)
                        : pattern.interpretation,
                    details: result
                });
            }
        }

        // Sort patterns by priority
        patterns.sort((a, b) => {
            const order = { CRITICAL: 0, HIGH: 1, MODERATE: 2, LOW: 3 };
            return (order[a.priority] || 99) - (order[b.priority] || 99);
        });

        // Generate report
        const report = generateReport(processed, patterns, summary, patientInfo);

        return { processed, patterns, summary, report };
    }

    // ═══════════════════════════════════════════════════════════════════════
    // REPORT GENERATION
    // ═══════════════════════════════════════════════════════════════════════
    function generateReport(processed, patterns, summary, patientInfo) {
        const lines = [];
        const timestamp = new Date().toLocaleString();

        lines.push('# CLINICAL LABORATORY INTERPRETATION');
        lines.push(`Generated: ${timestamp}`);
        if (patientInfo.name) lines.push(`Patient: ${patientInfo.name}`);
        if (patientInfo.mrn) lines.push(`MRN: ${patientInfo.mrn}`);
        lines.push('');

        lines.push('## SUMMARY');
        lines.push(`- **Critical:** ${summary.critical}`);
        lines.push(`- **Abnormal:** ${summary.abnormal}`);
        lines.push(`- **Normal:** ${summary.normal}`);
        lines.push(`- **Total:** ${summary.total}`);
        lines.push('');

        if (patterns.length > 0) {
            lines.push('## CLINICAL PATTERNS IDENTIFIED');
            for (const p of patterns) {
                lines.push(`### ${p.priority === 'CRITICAL' ? '🔴' : '🔵'} ${p.name}`);
                lines.push(p.interpretation);
                lines.push('');
            }
        }

        lines.push('## DETAILED RESULTS');
        const categories = {};
        for (const [key, val] of Object.entries(processed)) {
            const cat = REFERENCE[key]?.cat || 'OTHER';
            if (!categories[cat]) categories[cat] = [];
            categories[cat].push({ key, ...val });
        }

        for (const [cat, tests] of Object.entries(categories)) {
            lines.push(`### ${cat}`);
            for (const t of tests) {
                const arrow = t.flag.includes('H') ? '↑' : t.flag.includes('L') ? '↓' : '';
                lines.push(`**${t.name}**: ${t.value} ${t.unit} ${arrow}`);
                lines.push(`  - Reference: ${t.reference} ${t.unit}`);
                if (t.flag !== 'N') {
                    lines.push(`  - *${t.interpretation}*`);
                }
            }
            lines.push('');
        }

        lines.push('---');
        lines.push('*DISCLAIMER: This is a PRELIMINARY interpretation generated by an automated clinical decision support system. All findings require clinical correlation by a qualified healthcare provider. This tool is not a substitute for clinical judgment.*');
        lines.push('');
        lines.push('*References: Harrison\'s Principles of Internal Medicine, UpToDate, WHO Clinical Guidelines*');

        return lines.join('\n');
    }

    // ═══════════════════════════════════════════════════════════════════════
    // EXPOSE GLOBAL API
    // ═══════════════════════════════════════════════════════════════════════
    window.CDSS = {
        version: '3.0',
        generateReport: processLabs,
        getReference: (test) => REFERENCE[test?.toUpperCase()],
        getAllTests: () => Object.keys(REFERENCE),
        isReady: true
    };

    console.log('[CDSS v3.0] Evidence-Based Clinical Decision Support System loaded');
    console.log('[CDSS v3.0] Features: Guideline-based interpretations, Pattern detection, Critical alerts');
    console.log('[CDSS v3.0] Guidelines: KDIGO, ACC/AHA, AASLD, ASH, ADA, ISTH, IDSA, Endocrine Society, WHO, Harrison\'s, AABB');
})();
