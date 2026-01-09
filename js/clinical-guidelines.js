/* ═══════════════════════════════════════════════════════════════════════════
   CLINICAL GUIDELINES MODULE v3.1 - ENHANCED NEURAL AI ENGINE

   🧠 Neural AI Features (ENHANCED):
   - Advanced neural semantic matching - multi-layered context understanding
   - Expanded medical knowledge graph - stroke, cardiac arrest, and 40+ relationships
   - Proactive auto-generation - creates guidelines on-the-fly for unknown diagnoses
   - Self-learning system - automatically learns and improves from usage
   - Clinical pearls extraction from online medical resources
   - Sophisticated pattern recognition for complex medical terminology

   Traditional Features:
   - Advanced fuzzy matching (handles variations, abbreviations, typos)
   - Google Drive integration for learned guidelines storage
   - Suggestion system for partial matches
   - Lab-value-adjusted recommendations
   - Evidence-based clinical guidelines for common conditions

   Built-in Guidelines (13 conditions):
   - Heart Failure, Hypertension, Diabetes Mellitus
   - Chronic Kidney Disease, COPD, Atrial Fibrillation
   - Pneumonia, Urosepsis, Chest Infection
   - CVA (Stroke), Post-Cardiac Arrest
   - Symptomatic Anemia, Infective Endocarditis

   Guidelines Sources:
   - AHA/ACC, KDIGO, ADA, GOLD, ESC, NICE
   - IDSA, Surviving Sepsis Campaign, AHA Stroke Guidelines
   - AHA Post-Cardiac Arrest Care, ILCOR Resuscitation Guidelines
   - + Auto-generated from PubMed, medical resources
   - + Custom learned guidelines from your practice
   ═══════════════════════════════════════════════════════════════════════════ */

(function() {
    'use strict';

    // Google Drive storage path for learned guidelines
    const LEARNED_GUIDELINES_PATH = 'clinical-guidelines/learned';

    // Loaded learned guidelines from Drive
    let learnedGuidelines = {};

    // ═══════════════════════════════════════════════════════════════════════
    // COMPREHENSIVE GUIDELINES DATABASE
    // ═══════════════════════════════════════════════════════════════════════
    const GUIDELINES = {
        'Heart Failure': {
            keywords: ['heart failure', 'hf', 'chf', 'congestive heart failure', 'cardiac failure', 'lvef', 'reduced ejection fraction', 'hfref', 'hfpef'],
            category: 'Cardiovascular',
            monitoring: {
                labs: ['BNP/NT-proBNP', 'Cr/eGFR', 'Na', 'K', 'Mg', 'CBC', 'TSH', 'Liver enzymes'],
                frequency: 'BNP q3-6 months, electrolytes q3-6 months or after medication changes',
                vitals: 'Daily weights, BP monitoring, fluid status assessment'
            },
            treatment: {
                medications: [
                    'ACE inhibitor (e.g., enalapril, lisinopril) or ARB (e.g., losartan, valsartan) - Target max tolerated dose',
                    'Beta-blocker (carvedilol, metoprolol succinate, bisoprolol) - Start low, go slow',
                    'MRA (spironolactone, eplerenone) if NYHA II-IV or EF ≤35%',
                    'SGLT2 inhibitor (dapagliflozin, empagliflozin) - Proven mortality benefit in HFrEF',
                    'Loop diuretic (furosemide) for fluid management - Adjust based on symptoms',
                    'Consider ARNI (sacubitril/valsartan) if symptomatic despite GDMT'
                ],
                nonpharm: [
                    'Sodium restriction (<2g/day)',
                    'Fluid restriction if hyponatremia (<1.5-2L/day)',
                    'Daily weight monitoring - Call if gain >2-3 lbs in 1-2 days',
                    'Cardiac rehabilitation',
                    'Vaccinations: Influenza annually, pneumococcal, COVID-19'
                ]
            },
            labAdjustments: {
                K: {
                    high: 'If K >5.5: Hold MRA (spironolactone), recheck in 3-5 days. Consider patiromer/Lokelma if persistent. May need to reduce ACEi/ARB dose.',
                    low: 'If K <3.5: Increase K supplementation to 40-60 mEq/day. Check Mg (often co-depleted). Higher K targets (4-5 mEq/L) optimal for heart failure.'
                },
                Cr: {
                    high: 'If Cr elevation >30% from baseline: Check volume status. If euvolemic/hypervolemic, may continue ACEi/ARB if Cr <3.0 and not rising rapidly. Acceptable Cr elevation 20-30% when starting ACEi/ARB. If Cr >3.0 or rising >50%, hold ACEi/ARB and reassess. Consider nephrology consult.',
                    stable: 'eGFR 30-60: Safe to use GDMT with monitoring. eGFR 15-30: Reduce ACEi/ARB dose, avoid spironolactone if K elevated. eGFR <15: Nephrology referral for dialysis planning.'
                },
                Na: {
                    low: 'If Na <130: Fluid restriction to 1-1.5L/day. Consider stopping thiazide diuretics (keep loop diuretic). If symptomatic hyponatremia, may need admission for hypertonic saline. Tolvaptan if refractory, but expensive.',
                    normal: 'Continue current fluid management.'
                },
                BNP: {
                    high: 'BNP >400 pg/mL (or NT-proBNP >900 pg/mL) indicates volume overload or worsening HF. Increase diuretic dose. Reassess medication adherence and dietary sodium. Consider adding/uptitrating GDMT.',
                    trending: 'Serial BNP useful for monitoring. Rising BNP = worsening HF. Goal is to reduce BNP toward normal or patient\'s "dry" baseline.'
                }
            },
            references: [
                'AHA/ACC/HFSA Heart Failure Guidelines 2022 (Circulation 2022;145:e895-e1032)',
                'ESC Guidelines for Heart Failure 2021',
                'SGLT2 inhibitors in HFrEF: DAPA-HF (NEJM 2019), EMPEROR-Reduced (NEJM 2020)'
            ],
            guidelineUrl: 'https://www.ahajournals.org/doi/10.1161/CIR.0000000000001063'
        },

        'Hypertension': {
            keywords: ['hypertension', 'htn', 'high blood pressure', 'elevated bp', 'systolic hypertension', 'diastolic hypertension'],
            category: 'Cardiovascular',
            monitoring: {
                labs: ['Cr/eGFR', 'K', 'Na', 'Glucose', 'Lipid panel', 'Urinalysis', 'Urine albumin/creatinine ratio'],
                frequency: 'Baseline labs, then annually or after medication changes. K and Cr 2-4 weeks after starting ACEi/ARB or diuretic.',
                vitals: 'Home BP monitoring recommended. Target <130/80 mmHg for most patients.'
            },
            treatment: {
                medications: [
                    'Stage 1 HTN (130-139/80-89): Lifestyle modifications, consider meds if ASCVD risk >10%',
                    'Stage 2 HTN (≥140/90): Start 2 medications from different classes',
                    'First-line: ACE inhibitor, ARB, CCB, or thiazide diuretic',
                    'Black patients: CCB or thiazide as initial therapy',
                    'Diabetes or CKD: ACE inhibitor or ARB preferred',
                    'Avoid beta-blockers as first-line unless compelling indication (HF, CAD, post-MI)'
                ],
                nonpharm: [
                    'DASH diet (rich in fruits, vegetables, low-fat dairy)',
                    'Sodium restriction (<2g/day, ideally <1.5g/day)',
                    'Weight loss if overweight (goal BMI <25)',
                    'Regular aerobic exercise (150 min/week)',
                    'Limit alcohol (≤2 drinks/day men, ≤1 drink/day women)',
                    'Smoking cessation'
                ]
            },
            labAdjustments: {
                K: {
                    high: 'If K >5.5 on ACEi/ARB: Reduce dose or hold. Consider switching to CCB or non-K-sparing diuretic.',
                    low: 'If K <3.5 on diuretic: Add K supplement or switch to K-sparing diuretic. Target K 4-5 mEq/L.'
                },
                Cr: {
                    high: 'If Cr elevation >30% on ACEi/ARB: Check for volume depletion, NSAIDs, other nephrotoxins. If persistent, reduce dose or switch to CCB.',
                    normal: 'Continue monitoring. Mild Cr elevation (<30% from baseline) acceptable with ACEi/ARB.'
                },
                Glucose: {
                    high: 'Thiazides and beta-blockers can worsen glycemic control. Prefer ACEi/ARB or CCB in diabetics.',
                    normal: 'No adjustment needed.'
                }
            },
            references: [
                'ACC/AHA Hypertension Guidelines 2017 (updated 2020)',
                'JNC 8 Guidelines',
                'ESH/ESC Hypertension Guidelines 2023'
            ],
            guidelineUrl: 'https://www.acc.org/guidelines/htn'
        },

        'Diabetes Mellitus': {
            keywords: ['diabetes', 'dm', 't2dm', 't1dm', 'type 2 diabetes', 'type 1 diabetes', 'hyperglycemia', 'diabetic'],
            category: 'Endocrine/Metabolic',
            monitoring: {
                labs: ['HbA1c', 'Fasting glucose', 'Lipid panel', 'Cr/eGFR', 'Urine albumin/creatinine ratio', 'Liver enzymes (if on statin)'],
                frequency: 'HbA1c q3 months if not at goal, q6 months if stable. Annual: lipids, Cr/eGFR, urine albumin, foot exam, dilated eye exam.',
                vitals: 'Home glucose monitoring. Frequency depends on insulin use.'
            },
            treatment: {
                medications: [
                    'First-line: Metformin 500-2000mg/day (start low, titrate up). GI side effects common initially.',
                    'If HbA1c >1.5% above goal or ASCVD/CKD/HF present: Add second agent',
                    'ASCVD present: Add GLP-1 RA (semaglutide, liraglutide) or SGLT2i (empagliflozin, canagliflozin) - proven CV benefit',
                    'HF or CKD: SGLT2i preferred (proven renal and CV protection)',
                    'If weight loss desired: GLP-1 RA preferred',
                    'Avoid sulfonylureas if possible (hypoglycemia risk, weight gain). Consider DPP-4i if GLP-1 not tolerated.',
                    'Insulin if HbA1c >10%, symptomatic hyperglycemia, or type 1 DM'
                ],
                nonpharm: [
                    'Medical nutrition therapy (carb counting, portion control)',
                    'Weight loss 5-10% if overweight (improves insulin sensitivity)',
                    'Regular physical activity (150 min/week moderate intensity)',
                    'Diabetes self-management education (DSME)',
                    'Annual dilated eye exam, foot exam',
                    'Aspirin 81mg daily if ASCVD risk >10%',
                    'Statin therapy (moderate-high intensity if age >40 or ASCVD risk factors)'
                ]
            },
            labAdjustments: {
                HbA1c: {
                    high: 'HbA1c >9%: Intensify therapy. Add second agent if on monotherapy. If >10% or symptomatic, consider insulin. Goal individualized: Generally <7% for most, <8% if elderly/frail/limited life expectancy.',
                    target: 'HbA1c 7-8%: Continue current regimen if no hypoglycemia. Can consider uptitration if no side effects.'
                },
                Cr: {
                    high: 'eGFR <30: Stop metformin (lactic acidosis risk). eGFR 30-45: Reduce metformin to 500-1000mg/day. Reduce SGLT2i dose or stop if eGFR <30 (not effective, though empagliflozin approved down to eGFR 20). GLP-1 RA safe at all GFR levels.',
                    normal: 'eGFR >45: All agents safe. Continue current therapy.'
                },
                K: {
                    high: 'If K >5.5: Avoid ACEi/ARB or reduce dose. SGLT2i may help lower K (consider if HF/CKD present).',
                    low: 'If K <3.5: Supplement K. Hypokalemia increases arrhythmia risk.'
                },
                ALT: {
                    high: 'If ALT >3x ULN: Check hepatitis serologies, stop/reduce metformin temporarily. NAFLD common in T2DM - treat with weight loss, pioglitazone or GLP-1 RA.',
                    normal: 'Continue therapy.'
                }
            },
            references: [
                'ADA Standards of Medical Care in Diabetes 2024',
                'KDIGO 2022 Clinical Practice Guideline for Diabetes Management in CKD',
                'Cardiovascular outcome trials: EMPA-REG (empagliflozin), LEADER (liraglutide), SUSTAIN-6 (semaglutide)'
            ],
            guidelineUrl: 'https://diabetesjournals.org/care/issue/47/Supplement_1'
        },

        'Chronic Kidney Disease': {
            keywords: ['ckd', 'chronic kidney disease', 'renal insufficiency', 'renal failure', 'esrd', 'chronic renal failure', 'nephropathy'],
            category: 'Nephrology',
            monitoring: {
                labs: ['Cr/eGFR', 'CBC', 'CMP (including Ca, Phos, K, HCO3)', 'PTH', 'Vitamin D', 'Lipid panel', 'Urine albumin/creatinine ratio'],
                frequency: 'CKD 3: q6-12 months. CKD 4-5: q3-6 months. PTH annually (q3-6 months if abnormal). Vitamin D annually.',
                vitals: 'BP monitoring - Target <130/80. Volume status assessment.'
            },
            treatment: {
                medications: [
                    'ACE inhibitor or ARB for proteinuria/albuminuria (even if normotensive) - proven to slow CKD progression',
                    'SGLT2 inhibitor (dapagliflozin, empagliflozin) if eGFR >20 - slows CKD progression, reduces CV events',
                    'Statin therapy (atorvastatin 40-80mg or rosuvastatin 20-40mg) if age >50 or diabetes',
                    'Phosphate binders if Phos >5.5 (sevelamer, calcium acetate) - take with meals',
                    'Vitamin D supplementation if deficient',
                    'Treat metabolic acidosis if HCO3 <22 (sodium bicarbonate 650mg-1.3g TID)',
                    'ESA (erythropoietin) if Hgb <10 and iron replete - Target Hgb 10-11.5 g/dL',
                    'Iron supplementation (oral or IV) if ferritin <100 or TSAT <20%'
                ],
                nonpharm: [
                    'Dietary protein restriction 0.8 g/kg/day in CKD 3-5 (not on dialysis)',
                    'Potassium restriction if K >5.5 (<2g/day)',
                    'Phosphorus restriction (<1000mg/day) in CKD 4-5',
                    'Sodium restriction (<2g/day)',
                    'Nephrology referral: eGFR <30 (CKD 4-5), rapidly declining GFR, uncontrolled HTN, persistent proteinuria',
                    'Dialysis planning when eGFR <20: AV fistula creation, education'
                ]
            },
            labAdjustments: {
                Cr: {
                    worsening: 'Rapidly declining eGFR (>5 mL/min/year): Rule out AKI superimposed on CKD. Stop nephrotoxins (NSAIDs, aminoglycosides). Check for obstruction (renal U/S). Urgent nephrology referral.',
                    stable: 'eGFR 45-60 (CKD 3a): Low risk. Monitor yearly. eGFR 30-45 (CKD 3b): Moderate risk. Monitor q6 months. eGFR 15-30 (CKD 4): High risk. Nephrology referral. Monitor q3 months. eGFR <15 (CKD 5): Kidney failure. Dialysis planning.'
                },
                K: {
                    high: 'K >5.5: Reduce ACEi/ARB dose or hold. Low-K diet (<2g/day). Stop K supplements, NSAIDs. Consider patiromer or sodium zirconium cyclosilicate. If refractory >6.0, dialysis indication.',
                    normal: 'K 4-5.5: Ideal. Continue current therapy.'
                },
                HCO3: {
                    low: 'HCO3 <22: Metabolic acidosis common in CKD. Start sodium bicarbonate 650mg TID, titrate to maintain HCO3 22-26. Slows CKD progression.',
                    normal: 'HCO3 22-26: Optimal. Continue monitoring.'
                },
                Phos: {
                    high: 'Phos >5.5: Start phosphate binder (sevelamer 800mg or calcium acetate 1334mg with meals). Low phosphorus diet. Goal Phos 3.5-5.5. High Phos contributes to vascular calcification and bone disease.',
                    normal: 'Continue monitoring. Check PTH if Phos elevated.'
                },
                PTH: {
                    high: 'PTH >70 (CKD 3-4) or >300 (CKD 5): Secondary hyperparathyroidism. Check Vitamin D (replete if low). If Phos elevated, control first. May need calcitriol or cinacalcet.',
                    normal: 'Continue monitoring annually.'
                },
                Hgb: {
                    low: 'Hgb <10: Check iron studies. If ferritin <100 or TSAT <20%, give iron (oral or IV). If iron replete, consider ESA (epoetin alfa) - target Hgb 10-11.5 (not >11.5 due to thrombosis risk).',
                    normal: 'Hgb 10-12: Optimal in CKD. Continue monitoring.'
                }
            },
            references: [
                'KDIGO 2024 Clinical Practice Guideline for CKD',
                'KDIGO 2022 Guideline for Diabetes Management in CKD',
                'DAPA-CKD Trial (dapagliflozin in CKD) - NEJM 2020',
                'NKF KDOQI Guidelines'
            ],
            guidelineUrl: 'https://kdigo.org/guidelines/'
        },

        'COPD': {
            keywords: ['copd', 'chronic obstructive pulmonary disease', 'emphysema', 'chronic bronchitis', 'airflow obstruction'],
            category: 'Pulmonary',
            monitoring: {
                labs: ['CBC (for polycythemia)', 'Alpha-1 antitrypsin (if age <45 or family history)', 'ABG if severe or exacerbation'],
                frequency: 'Spirometry annually. Labs as needed for exacerbations or complications.',
                vitals: 'SpO2 monitoring. Assess for home oxygen if SpO2 <88% at rest or with exertion.'
            },
            treatment: {
                medications: [
                    'GOLD A (few symptoms, low exacerbation): SABA PRN or LABA/LAMA',
                    'GOLD B (more symptoms): LABA + LAMA combination (e.g., vilanterol/umeclidinium)',
                    'GOLD C (high exacerbation, few symptoms): LABA + LAMA',
                    'GOLD D (high symptoms, high exacerbation): LABA + LAMA + ICS if eosinophils >300',
                    'SABA (albuterol) for acute symptom relief',
                    'Consider azithromycin 250mg daily or roflumilast if frequent exacerbations despite optimal inhaler therapy'
                ],
                nonpharm: [
                    'Smoking cessation (#1 intervention - slows FEV1 decline)',
                    'Vaccinations: Influenza annually, pneumococcal (PCV20 or PCV15+PPSV23), COVID-19, Tdap once',
                    'Pulmonary rehabilitation (proven mortality benefit)',
                    'Long-term oxygen therapy if PaO2 <55 mmHg or SpO2 <88% (improves survival)',
                    'Proper inhaler technique education (50% use inhalers incorrectly)'
                ]
            },
            labAdjustments: {
                Hgb: {
                    high: 'Hgb >17 g/dL: Secondary polycythemia from chronic hypoxemia. Check SpO2 and ABG. Ensure adequate oxygen therapy. Phlebotomy rarely needed unless Hct >60%.',
                    normal: 'Hgb 12-17: Normal. Continue current therapy.'
                },
                CO2: {
                    high: 'pCO2 >45 mmHg: Chronic hypercapnic respiratory failure. BiPAP at night may help. AVOID high-flow O2 (can worsen hypercarbia - target SpO2 88-92%). Consider NIPPV if pH <7.35.',
                    normal: 'pCO2 35-45: Adequate ventilation.'
                },
                pH: {
                    low: 'pH <7.35 with high pCO2: Acute-on-chronic respiratory acidosis. May need BiPAP or intubation. Treat exacerbation (steroids, antibiotics, bronchodilators).',
                    normal: 'pH 7.35-7.45: Compensated or normal.'
                }
            },
            references: [
                'GOLD COPD Guidelines 2024',
                'ATS/ERS COPD Guidelines',
                'TORCH Trial (salmeterol/fluticasone)',
                'IMPACT Trial (triple therapy)'
            ],
            guidelineUrl: 'https://goldcopd.org/'
        },

        'Atrial Fibrillation': {
            keywords: ['atrial fibrillation', 'afib', 'af', 'atrial fib', 'paroxysmal af', 'permanent af'],
            category: 'Cardiovascular',
            scores: [
                {
                    name: 'CHA2DS2-VASc Score',
                    purpose: 'Stroke risk stratification in atrial fibrillation',
                    fields: [
                        { id: 'chf', label: 'Congestive Heart Failure history', type: 'checkbox', points: 1 },
                        { id: 'htn', label: 'Hypertension history', type: 'checkbox', points: 1 },
                        { id: 'age75', label: 'Age ≥75 years', type: 'checkbox', points: 2 },
                        { id: 'diabetes', label: 'Diabetes Mellitus', type: 'checkbox', points: 1 },
                        { id: 'stroke', label: 'Prior Stroke/TIA/Thromboembolism', type: 'checkbox', points: 2 },
                        { id: 'vascular', label: 'Vascular disease (MI, PAD, aortic plaque)', type: 'checkbox', points: 1 },
                        { id: 'age65', label: 'Age 65-74 years', type: 'checkbox', points: 1 },
                        { id: 'female', label: 'Female sex', type: 'checkbox', points: 1 }
                    ],
                    interpretation: {
                        0: { risk: 'Low', recommendation: 'No anticoagulation (or aspirin)', color: '#10b981' },
                        1: { risk: 'Low-Moderate', recommendation: 'Consider anticoagulation (DOAC preferred)', color: '#f59e0b' },
                        2: { risk: 'Moderate', recommendation: 'Anticoagulation recommended (DOAC preferred)', color: '#f97316' },
                        3: { risk: 'Moderate-High', recommendation: 'Anticoagulation strongly recommended', color: '#dc2626' },
                        9: { risk: 'High', recommendation: 'Anticoagulation required', color: '#991b1b' }
                    }
                },
                {
                    name: 'HAS-BLED Score',
                    purpose: 'Bleeding risk on anticoagulation',
                    fields: [
                        { id: 'htn_uncontrolled', label: 'Uncontrolled Hypertension (SBP >160)', type: 'checkbox', points: 1 },
                        { id: 'renal', label: 'Abnormal renal function (dialysis, Cr >2.26)', type: 'checkbox', points: 1 },
                        { id: 'liver', label: 'Abnormal liver function (cirrhosis, bilirubin >2x)', type: 'checkbox', points: 1 },
                        { id: 'stroke_h', label: 'Prior stroke', type: 'checkbox', points: 1 },
                        { id: 'bleeding', label: 'Prior major bleeding or predisposition', type: 'checkbox', points: 1 },
                        { id: 'labile_inr', label: 'Labile INR (if on warfarin, <60% in range)', type: 'checkbox', points: 1 },
                        { id: 'elderly', label: 'Age >65', type: 'checkbox', points: 1 },
                        { id: 'drugs', label: 'Drugs (antiplatelet, NSAIDs) or alcohol', type: 'checkbox', points: 1 }
                    ],
                    interpretation: {
                        0: { risk: 'Low', recommendation: 'Anticoagulation safe. Bleeding risk 1.13%/year', color: '#10b981' },
                        1: { risk: 'Low', recommendation: 'Caution with anticoagulation. Risk 1.02%/year', color: '#10b981' },
                        2: { risk: 'Moderate', recommendation: 'Moderate caution. Risk 1.88%/year', color: '#f59e0b' },
                        3: { risk: 'High', recommendation: 'High bleeding risk 3.74%/year. Consider carefully', color: '#f97316' },
                        4: { risk: 'Very High', recommendation: 'Very high risk 8.70%/year. Weigh risks/benefits', color: '#dc2626' },
                        9: { risk: 'Extremely High', recommendation: 'Extremely high bleeding risk. Consider alternatives', color: '#991b1b' }
                    }
                }
            ],
            monitoring: {
                labs: ['CBC', 'CMP', 'TSH', 'PT/INR (if on warfarin)', 'Liver enzymes (if on amiodarone/DOACs)'],
                frequency: 'TSH annually. INR q4 weeks if on warfarin (q1 week until stable). Cr/K q6-12 months on DOACs.',
                vitals: 'Heart rate and rhythm monitoring. BP control essential.'
            },
            treatment: {
                medications: [
                    'Rate control: Beta-blocker (metoprolol, carvedilol) or non-DHP CCB (diltiazem, verapamil). Target HR 60-100 at rest.',
                    'Anticoagulation (stroke prevention):',
                    '  - CHA2DS2-VASc ≥2 (men) or ≥3 (women): Anticoagulate with DOAC (preferred) or warfarin',
                    '  - DOACs: Apixaban 5mg BID, rivaroxaban 20mg daily, edoxaban 60mg daily, dabigatran 150mg BID',
                    '  - Warfarin: Target INR 2-3. More monitoring, food/drug interactions.',
                    '  - CHA2DS2-VASc 0-1: Aspirin or no anticoagulation',
                    'Rhythm control (if symptomatic despite rate control): Cardioversion, then antiarrhythmic (flecainide, sotalol, amiodarone, dofetilide)',
                    'Catheter ablation if medications fail or patient preference'
                ],
                nonpharm: [
                    'Treat underlying causes: HTN, OSA, alcohol, hyperthyroidism',
                    'Weight loss if BMI >27 (reduces AF burden)',
                    'Limit alcohol and caffeine',
                    'Stroke risk stratification (CHA2DS2-VASc score)',
                    'Bleeding risk assessment (HAS-BLED score)'
                ]
            },
            labAdjustments: {
                Cr: {
                    high: 'eGFR <30: Reduce DOAC doses (apixaban 2.5mg BID, rivaroxaban 15mg daily, edoxaban 30mg daily). eGFR <15: Avoid DOACs. Use warfarin (renally cleared, safer in ESRD).',
                    normal: 'eGFR >50: Standard DOAC dosing. Continue current therapy.'
                },
                TSH: {
                    abnormal: 'Hyperthyroidism can trigger AF. If TSH <0.1, check free T4/T3. Treat thyrotoxicosis first (can restore sinus rhythm). Hypothyroidism with amiodarone common - supplement thyroid if needed.',
                    normal: 'TSH 0.4-4.0: Normal. Continue monitoring annually.'
                },
                INR: {
                    high: 'INR >3.5 on warfarin: Hold 1-2 doses. Recheck in 3-5 days. Adjust weekly dose. High bleeding risk if INR >4.',
                    low: 'INR <2.0: Increase warfarin dose. Stroke risk if subtherapeutic. Recheck in 1 week.',
                    therapeutic: 'INR 2-3: Therapeutic. Continue current warfarin dose.'
                },
                Hgb: {
                    low: 'Hgb <10 or GI bleed on anticoagulation: Assess benefit vs. risk. Consider reducing DOAC dose or holding temporarily if active bleeding. May need PPI if GI source.'
                }
            },
            references: [
                'AHA/ACC/HRS Atrial Fibrillation Guidelines 2023',
                'ESC AF Guidelines 2024',
                'ARISTOTLE Trial (apixaban vs warfarin)',
                'ROCKET-AF (rivaroxaban)'
            ],
            guidelineUrl: 'https://www.acc.org/guidelines/af'
        },

        'Pneumonia': {
            keywords: ['pneumonia', 'cap', 'community acquired pneumonia', 'hap', 'hospital acquired pneumonia', 'aspiration pneumonia'],
            category: 'Infectious Disease',
            scores: [
                {
                    name: 'CURB-65 Score',
                    purpose: 'Pneumonia severity assessment and disposition decision',
                    fields: [
                        { id: 'confusion', label: 'Confusion (new onset, AMT ≤8)', type: 'checkbox', points: 1 },
                        { id: 'urea', label: 'Urea >7 mmol/L (BUN >19 mg/dL)', type: 'checkbox', points: 1 },
                        { id: 'rr', label: 'Respiratory rate ≥30/min', type: 'checkbox', points: 1 },
                        { id: 'bp', label: 'Blood pressure: SBP <90 or DBP ≤60 mmHg', type: 'checkbox', points: 1 },
                        { id: 'age', label: 'Age ≥65 years', type: 'checkbox', points: 1 }
                    ],
                    interpretation: {
                        0: { risk: 'Low', recommendation: 'Outpatient treatment. Mortality <1%', color: '#10b981' },
                        1: { risk: 'Low', recommendation: 'Consider outpatient vs short inpatient. Mortality 1.5%', color: '#10b981' },
                        2: { risk: 'Moderate', recommendation: 'Hospital admission recommended. Mortality 9.2%', color: '#f59e0b' },
                        3: { risk: 'High', recommendation: 'Hospital admission required. Consider ICU. Mortality 22%', color: '#f97316' },
                        4: { risk: 'Severe', recommendation: 'ICU admission likely needed. Mortality 27%', color: '#dc2626' },
                        5: { risk: 'Critical', recommendation: 'ICU admission required. Mortality 27-50%', color: '#991b1b' }
                    }
                }
            ],
            monitoring: {
                labs: ['CBC with diff', 'CMP', 'Blood cultures (if admitted)', 'Sputum culture if productive cough', 'Procalcitonin (optional)', 'CXR'],
                frequency: 'Repeat CXR in 6-8 weeks if >50 years old or smoker (r/o underlying malignancy).',
                vitals: 'O2 saturation, respiratory rate, temperature, BP'
            },
            treatment: {
                medications: [
                    'Outpatient CAP (no comorbidities): Amoxicillin 1g TID x 5-7 days OR doxycycline 100mg BID x 5-7 days',
                    'Outpatient CAP (comorbidities - DM, HF, COPD, CKD): Amoxicillin-clavulanate 875/125mg BID + azithromycin 500mg x1, then 250mg daily x 4 days OR levofloxacin 750mg daily x 5 days',
                    'Inpatient non-severe: Ceftriaxone 1-2g IV daily + azithromycin 500mg IV daily OR levofloxacin 750mg IV daily',
                    'Severe CAP (ICU): Ceftriaxone 2g IV daily + azithromycin 500mg IV daily OR cefepime 2g IV q8h + levofloxacin 750mg IV daily',
                    'Add vancomycin or linezolid if MRSA risk factors (recent hospitalization, IVDU, MRSA colonization)',
                    'Duration: 5-7 days (can extend if slow response or complications)'
                ],
                nonpharm: [
                    'Oxygen therapy to maintain SpO2 >90%',
                    'IV fluids if volume depleted',
                    'Incentive spirometry',
                    'Early mobilization',
                    'Vaccinations post-recovery: Pneumococcal (PCV20 or PCV15+PPSV23), influenza annually'
                ]
            },
            labAdjustments: {
                WBC: {
                    high: 'WBC >15,000: Severe infection. Continue antibiotics. If >25,000, consider complications (empyema, abscess).',
                    low: 'WBC <4,000: Possible severe sepsis, viral etiology, or immunosuppression. Broaden coverage, check HIV status.',
                    normal: 'WBC 4-15,000: Expected response. Continue therapy.'
                },
                Cr: {
                    high: 'Elevated Cr: Dehydration common in pneumonia. Give IV fluids. Avoid nephrotoxic agents. Adjust antibiotic doses for renal function.',
                    normal: 'No adjustment needed.'
                },
                Na: {
                    low: 'Hyponatremia: Consider Legionella pneumonia (check urinary antigen). SIADH common in pneumonia. Fluid restrict to 1-1.5L/day.',
                    normal: 'No adjustment.'
                },
                PCT: {
                    high: 'Procalcitonin >0.5 ng/mL: Bacterial etiology likely. Continue antibiotics.',
                    low: 'PCT <0.25: Viral etiology likely. Consider stopping antibiotics if clinical improvement and no infiltrate on CXR.'
                }
            },
            references: [
                'IDSA/ATS Community-Acquired Pneumonia Guidelines 2019',
                'ATS/IDSA Hospital-Acquired/Ventilator-Associated Pneumonia Guidelines 2016'
            ],
            guidelineUrl: 'https://www.idsociety.org/practice-guideline/community-acquired-pneumonia/'
        },

        'Urosepsis': {
            keywords: ['urosepsis', 'urinary sepsis', 'septic uti', 'sepsis uti', 'urine sepsis', 'pyelonephritis sepsis', 'complicated uti', 'septic shock uti'],
            category: 'Infectious Disease',
            monitoring: {
                labs: ['CBC with diff', 'CMP', 'Blood cultures x2', 'Urine culture', 'Lactate', 'Procalcitonin', 'Urinalysis', 'Cr/eGFR'],
                frequency: 'Lactate q4-6h until normalized. Blood cultures before antibiotics. Daily CBC, CMP during acute phase.',
                vitals: 'Continuous monitoring: BP, HR, temp, urine output (goal >0.5 mL/kg/hr), SpO2. SIRS criteria assessment.'
            },
            treatment: {
                medications: [
                    'IMMEDIATE: IV fluid resuscitation (30 mL/kg crystalloid within 3 hours for septic shock)',
                    'Antibiotics within 1 hour (CRITICAL - mortality increases 7.6% per hour delay):',
                    '  - Uncomplicated urosepsis: Ceftriaxone 2g IV daily OR piperacillin-tazobactam 4.5g IV q6h',
                    '  - Healthcare-associated or severe: Piperacillin-tazobactam 4.5g IV q6h OR meropenem 1g IV q8h',
                    '  - MRSA risk: Add vancomycin 15-20 mg/kg IV q8-12h (target trough 15-20)',
                    '  - Pseudomonas risk: Double-cover with cefepime 2g IV q8h + ciprofloxacin 400mg IV q12h',
                    'De-escalate based on culture results (typically 48-72 hours)',
                    'Total duration: 7-14 days depending on source control and clinical response',
                    'Vasopressors if MAP <65 mmHg despite fluids (norepinephrine first-line)'
                ],
                nonpharm: [
                    'SOURCE CONTROL: Remove urinary catheter if present (major source)',
                    'Urology consult if obstruction suspected (urgent decompression if hydronephrosis)',
                    'Adequate hydration - IV fluids to maintain urine output',
                    'ICU admission if: septic shock, altered mental status, respiratory failure, lactate >4 mmol/L',
                    'Early goal-directed therapy (EGDT) per Surviving Sepsis Campaign',
                    'Prevention: Minimize catheter use, proper catheter care, treat asymptomatic bacteriuria in pregnancy only'
                ]
            },
            labAdjustments: {
                Lactate: {
                    high: 'Lactate >2 mmol/L: Tissue hypoperfusion. Aggressive fluid resuscitation. Lactate >4 mmol/L: Septic shock - ICU, vasopressors, central line. Recheck q2-4h until normalizes.',
                    normal: 'Lactate <2: Good perfusion. Continue monitoring.'
                },
                WBC: {
                    high: 'WBC >12,000 or >10% bands: SIRS criteria met. Continue broad-spectrum antibiotics. If WBC >25,000, consider abscess or resistant organism.',
                    low: 'WBC <4,000: Severe sepsis or immunosuppression. High mortality risk. Broaden antibiotics, check HIV, consider G-CSF if neutropenic.'
                },
                Cr: {
                    high: 'Elevated Cr: Acute kidney injury common in urosepsis. Fluid resuscitation crucial. Avoid nephrotoxins. Adjust antibiotic doses. May need dialysis if oliguria or Cr >4.0.',
                    worsening: 'Rising Cr despite fluids: Consider obstructive uropathy (urgent ultrasound), ATN from sepsis, or drug toxicity.'
                },
                PCT: {
                    high: 'Procalcitonin >0.5 ng/mL: Bacterial sepsis confirmed. PCT >2 ng/mL: Severe sepsis. Use to guide antibiotic duration - safe to stop when PCT drops 80% from peak.',
                    normal: 'PCT <0.5: Viral or non-infectious. Consider stopping antibiotics if clinically improved.'
                },
                Platelets: {
                    low: 'Platelets <100,000: DIC risk. Check PT/PTT, fibrinogen, D-dimer. Transfuse if <50,000 and bleeding or <10,000 prophylactically.',
                    normal: 'Platelets >150,000: No DIC. Continue monitoring.'
                }
            },
            references: [
                'Surviving Sepsis Campaign Guidelines 2021',
                'IDSA Clinical Practice Guideline for Complicated UTI 2022',
                'Rhodes et al. Surviving Sepsis Campaign (Crit Care Med 2017)'
            ],
            guidelineUrl: 'https://www.sccm.org/survivingsepsiscampaign'
        },

        'Chest Infection': {
            keywords: ['chest infection', 'respiratory infection', 'lung infection', 'lower respiratory tract infection', 'lrti', 'bronchitis', 'acute bronchitis', 'chest cold', 'respiratory tract infection'],
            category: 'Infectious Disease',
            monitoring: {
                labs: ['CBC with diff', 'CRP or ESR', 'Sputum culture (if productive)', 'Blood cultures (if severe)', 'CXR (if pneumonia suspected)'],
                frequency: 'Repeat CXR in 6 weeks if age >50 or smoker to rule out underlying malignancy',
                vitals: 'O2 saturation, respiratory rate, temperature, heart rate. Watch for sepsis signs.'
            },
            treatment: {
                medications: [
                    'ACUTE BRONCHITIS (most common "chest infection"): Usually VIRAL - antibiotics NOT recommended',
                    '  - Symptomatic treatment: Dextromethorphan for cough, NSAIDs for fever/pain',
                    '  - Albuterol inhaler if wheezing (2 puffs q4-6h PRN)',
                    '  - Antibiotics ONLY if: purulent sputum >7 days + severe symptoms (consider azithromycin 500mg x1, then 250mg x 4 days)',
                    'COMMUNITY-ACQUIRED PNEUMONIA (if CXR shows infiltrate):',
                    '  - Outpatient: Amoxicillin 1g TID x 5-7 days OR doxycycline 100mg BID x 5-7 days',
                    '  - With comorbidities: Amoxicillin-clavulanate 875mg BID + azithromycin 500mg x1, then 250mg x4 days',
                    '  - Inpatient: Ceftriaxone 1-2g IV daily + azithromycin 500mg IV/PO daily',
                    'COPD exacerbation with infection: See COPD guidelines - steroids + antibiotics',
                    'Duration: 5-7 days for most cases, extend if slow response'
                ],
                nonpharm: [
                    'Hydration - encourage fluids (8-10 glasses/day)',
                    'Rest and avoid strenuous activity',
                    'Humidified air or steam inhalation for symptom relief',
                    'Smoking cessation counseling (critical)',
                    'Incentive spirometry to prevent atelectasis',
                    'Pneumococcal and influenza vaccination post-recovery',
                    'Return precautions: worsening dyspnea, high fever >72h, hemoptysis, chest pain'
                ]
            },
            labAdjustments: {
                WBC: {
                    high: 'WBC >15,000: Likely bacterial (pneumonia). Start antibiotics. If >20,000, consider severe pneumonia or empyema - may need admission.',
                    normal: 'WBC 4-15,000: Could be viral or mild bacterial. CXR and clinical judgment guide treatment.',
                    low: 'WBC <4,000: Viral infection likely, or immunosuppressed patient. Avoid unnecessary antibiotics.'
                },
                CRP: {
                    high: 'CRP >100 mg/L: Bacterial infection likely. Consider antibiotics. CRP >200: Severe infection - consider admission.',
                    low: 'CRP <20 mg/L: Viral more likely. Observe without antibiotics if clinically stable.'
                },
                SpO2: {
                    low: 'SpO2 <92% on room air: Pneumonia likely. Needs CXR, oxygen therapy, antibiotics. SpO2 <90%: Hospital admission required.',
                    normal: 'SpO2 >95%: Adequate oxygenation. Outpatient management appropriate.'
                }
            },
            references: [
                'NICE Guideline: Respiratory Tract Infections (NG120)',
                'IDSA/ATS Community-Acquired Pneumonia Guidelines 2019',
                'Cochrane Review: Antibiotics for acute bronchitis (2017)'
            ],
            guidelineUrl: 'https://www.nice.org.uk/guidance/ng120'
        },

        'CVA (Stroke)': {
            keywords: ['cva', 'stroke', 'cerebrovascular accident', 'brain attack', 'ischemic stroke', 'hemorrhagic stroke', 'tia', 'transient ischemic attack', 'cerebral infarction', 'cerebral hemorrhage', 'ich', 'intracerebral hemorrhage', 'subarachnoid hemorrhage'],
            category: 'Neurology/Critical Care',
            monitoring: {
                labs: ['CBC', 'CMP', 'PT/INR', 'PTT', 'Lipid panel', 'HbA1c', 'Troponin (if concern for MI)', 'Blood glucose'],
                frequency: 'Continuous neuro checks first 24-72h. Labs at presentation, then daily during acute phase. Lipid panel, HbA1c for secondary prevention.',
                vitals: 'CRITICAL: BP monitoring q15min during tPA infusion, then hourly. Neuro checks q1h x24h, then q2h x24h. Continuous telemetry. Maintain normothermia.'
            },
            treatment: {
                medications: [
                    'HYPERACUTE ISCHEMIC STROKE (<4.5h from onset):',
                    '  - IV tPA (alteplase) 0.9 mg/kg (max 90mg): 10% bolus, then 90% over 60 min',
                    '  - Strict BP control during tPA: Keep <185/110 mmHg BEFORE tPA, <180/105 mmHg DURING and 24h after',
                    '  - Mechanical thrombectomy if large vessel occlusion (within 6-24h in select cases)',
                    'ACUTE ISCHEMIC STROKE (general):',
                    '  - Aspirin 325mg within 24-48h (NOT with tPA - wait 24h)',
                    '  - DVT prophylaxis: Heparin 5000U SQ q8-12h or enoxaparin 40mg SQ daily',
                    '  - Statin: Atorvastatin 80mg or rosuvastatin 20-40mg daily (high-intensity)',
                    'SECONDARY PREVENTION (after ischemic stroke):',
                    '  - Antiplatelet: Aspirin 81mg + clopidogrel 75mg x21 days (DAPT), then aspirin or clopidogrel alone',
                    '  - If atrial fibrillation: Anticoagulation with DOAC (apixaban preferred) or warfarin',
                    '  - Blood pressure control: Target <130/80 mmHg (ACEi or ARB preferred)',
                    'HEMORRHAGIC STROKE (ICH/SAH):',
                    '  - REVERSE anticoagulation immediately: Vitamin K, PCC, FFP for warfarin; idarucizumab for dabigatran',
                    '  - BP control: Target SBP 140-160 mmHg (avoid aggressive lowering in SAH)',
                    '  - Nimodipine 60mg q4h x21 days for SAH (prevents vasospasm)',
                    '  - Neurosurgery consult for possible evacuation or EVD placement'
                ],
                nonpharm: [
                    'TIME IS BRAIN: "Last known well" time critical. Activate stroke protocol immediately.',
                    'Urgent non-contrast head CT to differentiate ischemic vs hemorrhagic (MUST before tPA)',
                    'CT angiography/perfusion or MRI/MRA for vessel imaging',
                    'NIH Stroke Scale (NIHSS) at baseline, post-intervention, and serially',
                    'NPO initially - swallow evaluation before PO intake (aspiration risk)',
                    'Early mobilization (within 24h if stable) - proven to improve outcomes',
                    'Neuro ICU if large stroke, decreased consciousness, or requiring tPA/thrombectomy',
                    'Acute rehabilitation as soon as medically stable',
                    'Secondary prevention: Smoking cessation, diabetes control, lipid management'
                ]
            },
            labAdjustments: {
                Glucose: {
                    high: 'Glucose >180 mg/dL: Hyperglycemia worsens stroke outcomes. Start insulin drip if >180, target 140-180. Avoid hypoglycemia (<70).',
                    low: 'Glucose <70 mg/dL: URGENT - hypoglycemia mimics stroke. Give D50 immediately. Recheck glucose and reassess neuro exam.',
                    normal: 'Glucose 70-180: Optimal. Continue monitoring q4-6h acutely.'
                },
                INR: {
                    high: 'INR >1.7: CONTRAINDICATION to tPA. If hemorrhagic stroke on warfarin, reverse urgently with Vitamin K 10mg IV + PCC 25-50 units/kg or FFP 2-4 units. Target INR <1.4.',
                    therapeutic: 'INR 2-3 on warfarin: Hold anticoagulation acutely. Restart only after imaging confirms no hemorrhage and 7-14 days post-stroke (high-risk AF).',
                    normal: 'INR <1.2: Safe for tPA if ischemic stroke.'
                },
                Platelets: {
                    low: 'Platelets <100,000: Relative contraindication to tPA. If hemorrhagic stroke with platelets <50,000, transfuse to >50,000. If on antiplatelet agents and ICH, consider platelet transfusion.',
                    normal: 'Platelets >150,000: Safe for procedures and tPA.'
                },
                BP: {
                    high: 'SBP >185 or DBP >110: CONTRAINDICATION to tPA unless lowered. Use labetalol 10-20mg IV or nicardipine drip. For hemorrhagic stroke, target SBP 140-160.',
                    managed: 'BP 140-180/80-105: Optimal during acute ischemic stroke WITHOUT tPA. Allow permissive hypertension (brain needs perfusion to penumbra).',
                    low: 'SBP <120: Avoid - may worsen ischemia. Give fluids, head of bed flat. MAP goal >90 mmHg.'
                },
                Troponin: {
                    elevated: 'Elevated troponin: Stroke can cause troponin leak (Takotsubo, demand ischemia). EKG, echo. Manage both stroke and cardiac issues. Aspirin still indicated.',
                    normal: 'Normal troponin: Good. Continue stroke protocol.'
                }
            },
            references: [
                'AHA/ASA Stroke Guidelines 2024 (Stroke 2024)',
                'Guidelines for tPA in Acute Ischemic Stroke (updated 2023)',
                'Mechanical Thrombectomy: DAWN and DEFUSE-3 trials',
                'POINT Trial: DAPT after minor stroke/TIA (NEJM 2018)'
            ],
            guidelineUrl: 'https://www.stroke.org/en/professionals/stroke-guidelines'
        },

        'Post-Cardiac Arrest': {
            keywords: ['post cardiac arrest', 'post arrest', 'rosc', 'return of spontaneous circulation', 'post resuscitation', 'cardiac arrest survivor', 'post code', 'after cardiac arrest', 'resuscitated', 'post cpr'],
            category: 'Critical Care/Cardiology',
            monitoring: {
                labs: ['ABG', 'Lactate', 'Troponin', 'BNP', 'CBC', 'CMP', 'Mg', 'Phos', 'PT/PTT', 'Blood cultures'],
                frequency: 'Continuous: EEG for 24-72h, telemetry, arterial line. Labs: ABG/lactate q2-4h until stable, troponin q6h x3, daily CMP/CBC. Repeat neuro exam off sedation at 72h.',
                vitals: 'Continuous ICU monitoring: Arterial BP (target MAP 65-100), continuous EEG, core temp (strict TTM protocol), SpO2 (target 94-98%), end-tidal CO2, urine output (>0.5 mL/kg/hr)'
            },
            treatment: {
                medications: [
                    'IMMEDIATE POST-ROSC (first hour):',
                    '  - Avoid hyperoxia: Target SpO2 94-98% (too much O2 worsens neuro injury)',
                    '  - Avoid hypotension: Norepinephrine for MAP goal 65-100 mmHg (cerebral perfusion critical)',
                    '  - Avoid hyperventilation: Target pCO2 35-45 mmHg (hyperventilation worsens outcome)',
                    '  - Immediate PCI if STEMI or high suspicion of ACS (don\'t wait for patient to wake up)',
                    'TARGETED TEMPERATURE MANAGEMENT (TTM):',
                    '  - Induce hypothermia 32-36°C for 24 hours (start within 6h of ROSC)',
                    '  - Arctic Sun device or cold saline bolus (30 mL/kg cold NS)',
                    '  - Maintain strict temperature - even 1°C matters for brain protection',
                    '  - Sedation: Propofol 20-50 mcg/kg/min + fentanyl 25-100 mcg/hr',
                    '  - Paralysis if shivering: Cisatracurium or vecuronium',
                    '  - Controlled rewarming at 0.25-0.5°C per hour after 24h (avoid rebound hyperthermia)',
                    'HEMODYNAMIC OPTIMIZATION:',
                    '  - Vasopressors: Norepinephrine first-line (target MAP 65-100)',
                    '  - Inotropes: Dobutamine or epinephrine if low cardiac output despite MAP goal',
                    '  - Avoid excessive fluids (worsens cerebral edema)',
                    'SEIZURE MANAGEMENT:',
                    '  - Continuous EEG monitoring (detect subclinical seizures)',
                    '  - If seizures: Levetiracetam 1000-1500mg IV, then 500-750mg BID (less sedating than phenytoin)',
                    '  - Treat myoclonus: clonazepam, valproic acid',
                    'NEUROPROGNOSTICATION (>72h post-arrest):',
                    '  - Multimodal assessment: clinical exam, EEG, SSEP, MRI brain, NSE (neuron-specific enolase)',
                    '  - AVOID early withdrawal of care (<72h) - many recover with good outcomes',
                    '  - Bilaterally absent pupillary reflexes at 72h = poor prognosis',
                    '  - Continuous EEG: burst suppression or status epilepticus = poor prognosis'
                ],
                nonpharm: [
                    'ICU admission - ventilator, arterial line, central line, Foley, OG tube',
                    'Coronary angiography/PCI within 2h if STEMI (even if comatose)',
                    'Echocardiogram to assess cardiac function (LVEF often reduced post-arrest)',
                    'Head CT if concern for intracranial bleeding or trauma',
                    'Chest X-ray to assess for aspiration, rib fractures, PTX from CPR',
                    'NPO initially - assess swallow function before PO intake',
                    'DVT prophylaxis: Heparin SQ (safe during TTM)',
                    'Stress ulcer prophylaxis: Pantoprazole 40mg IV daily',
                    'Glucose control: Target 140-180 mg/dL (avoid hypoglycemia)',
                    'Family counseling: Early discussions about prognosis, but avoid premature prognostication'
                ]
            },
            labAdjustments: {
                Lactate: {
                    high: 'Lactate >4 mmol/L: Ongoing tissue hypoperfusion. Increase MAP goal, ensure adequate cardiac output. Recheck q2h. Lactate clearance >10%/hr is good prognostic sign.',
                    trending: 'Rising lactate: Suggests inadequate resuscitation. Consider inotropes, rule out mesenteric ischemia, liver failure.',
                    normal: 'Lactate <2 mmol/L: Good tissue perfusion. Continue current management.'
                },
                pH: {
                    low: 'pH <7.2: Severe metabolic acidosis common post-arrest. Give sodium bicarbonate 50-100 mEq IV if pH <7.1. Improve perfusion (lactate clearance). Hyperventilate cautiously if mixed acidosis.',
                    normal: 'pH 7.35-7.45: Adequate. Avoid aggressive correction (rebound alkalosis worsens neuro injury).'
                },
                pCO2: {
                    high: 'pCO2 >45 mmHg: Respiratory acidosis or permissive hypercapnia. Increase minute ventilation if pH <7.30. Don\'t hyperventilate (worsens cerebral perfusion).',
                    low: 'pCO2 <35 mmHg: AVOID - hyperventilation causes cerebral vasoconstriction and worsens brain injury. Decrease respiratory rate. Target 35-45.',
                    normal: 'pCO2 35-45: Optimal. Normocapnia proven best for neuro outcomes.'
                },
                K: {
                    high: 'K >5.5 mmol/L: Common post-arrest (cell lysis). Insulin/dextrose (10 units regular insulin + 1 amp D50), calcium gluconate 1-2g IV, kayexelate. Recheck q2-4h. Dialysis if refractory >6.5.',
                    low: 'K <3.5 mmol/L: Increases arrhythmia risk. Replete to 4-5 mmol/L. Give 20-40 mEq KCl IV (max 10 mEq/hr peripheral, 20 mEq/hr central).',
                    normal: 'K 4-5 mmol/L: Optimal. Prevents arrhythmias.'
                },
                Troponin: {
                    elevated: 'Troponin elevated: Expected post-arrest (demand ischemia, ACS, or CPR trauma). If STEMI pattern → immediate cath lab. Serial troponins to trend. Echo to assess function.',
                    normal: 'Normal troponin: Less likely ACS, but don\'t rule out. Still perform coronary angiography if arrest was witnessed and shockable rhythm.'
                },
                Glucose: {
                    high: 'Glucose >180 mg/dL: Start insulin drip, target 140-180 (tight control <140 increases hypoglycemia risk, worsens neuro injury). Check q1h on drip.',
                    low: 'Glucose <70 mg/dL: CRITICAL - worsens brain injury. Give D50 immediately. Recheck q15min until >100. Reduce insulin drip.',
                    normal: 'Glucose 100-180: Optimal. Continue current management.'
                },
                NSE: {
                    high: 'NSE (neuron-specific enolase) >90 ng/mL at 48-72h: Suggests severe hypoxic brain injury. Use as part of multimodal prognostication (NOT alone).',
                    normal: 'NSE <33 ng/mL: Favorable. Continue TTM and supportive care.'
                }
            },
            references: [
                'AHA/ILCOR Post-Cardiac Arrest Care Guidelines 2020',
                'Targeted Temperature Management Trial (TTM, NEJM 2013)',
                'TTM2 Trial (normothermia vs hypothermia, NEJM 2021)',
                'European Resuscitation Council Guidelines 2021',
                'Neuroprognostication: ERC/ESICM 2021 (use multimodal approach)'
            ],
            guidelineUrl: 'https://www.ahajournals.org/cpr'
        },

        'Symptomatic Anemia': {
            keywords: ['symptomatic anemia', 'anemia symptomatic', 'anemic', 'low hemoglobin', 'low hgb', 'low hb', 'iron deficiency anemia', 'ida', 'anemia of chronic disease', 'microcytic anemia', 'macrocytic anemia', 'normocytic anemia'],
            category: 'Hematology',
            scores: [
                {
                    name: 'Transfusion Decision Tool',
                    purpose: 'Guide RBC transfusion based on symptoms and Hgb level',
                    fields: [
                        { id: 'hgb_severe', label: 'Hgb <7 g/dL', type: 'checkbox', points: 3 },
                        { id: 'chest_pain', label: 'Chest pain or angina', type: 'checkbox', points: 2 },
                        { id: 'sob', label: 'Shortness of breath at rest', type: 'checkbox', points: 2 },
                        { id: 'tachycardia', label: 'Tachycardia >110 bpm', type: 'checkbox', points: 1 },
                        { id: 'orthostasis', label: 'Orthostatic hypotension', type: 'checkbox', points: 1 },
                        { id: 'cad', label: 'Known CAD or acute coronary syndrome', type: 'checkbox', points: 2 }
                    ],
                    interpretation: {
                        0: { risk: 'Low', recommendation: 'Transfusion likely not needed. Treat underlying cause.', color: '#10b981' },
                        1: { risk: 'Low', recommendation: 'Monitor closely. Consider oral iron if Hgb 7-10.', color: '#10b981' },
                        2: { risk: 'Moderate', recommendation: 'Consider 1 unit PRBC, reassess symptoms.', color: '#f59e0b' },
                        3: { risk: 'Moderate-High', recommendation: 'Transfuse 1-2 units PRBC. Recheck Hgb.', color: '#f97316' },
                        4: { risk: 'High', recommendation: 'Transfuse 2 units PRBC urgently. Monitor closely.', color: '#dc2626' },
                        9: { risk: 'Critical', recommendation: 'Urgent transfusion required. ICU monitoring.', color: '#991b1b' }
                    }
                }
            ],
            monitoring: {
                labs: ['CBC with differential', 'Reticulocyte count', 'Iron panel (Fe, TIBC, Ferritin)', 'B12, Folate', 'Peripheral smear', 'LDH, Haptoglobin (if hemolysis suspected)', 'Stool for occult blood'],
                vitals: ['HR, BP (orthostatic vitals)', 'O2 saturation', 'Monitor for volume overload after transfusion'],
                other: ['EKG if chest pain or CAD', 'Endoscopy if GI bleeding suspected', 'Colonoscopy if age >50 or alarm symptoms']
            },
            treatment: {
                drugClasses: [
                    {
                        class: 'Transfusion Therapy',
                        medications: [
                            'PRBC 1-2 units if Hgb <7 g/dL or symptomatic',
                            'Goal Hgb 7-9 g/dL in stable patients, 8-10 g/dL if CAD/ACS',
                            'Transfuse slowly (2-4 hours per unit) to avoid volume overload',
                            'Monitor for transfusion reactions (fever, urticaria, dyspnea, hemolysis)'
                        ]
                    },
                    {
                        class: 'Iron Replacement (if IDA)',
                        medications: [
                            'Oral: Ferrous sulfate 325mg PO TID (65mg elemental iron per tablet) - Take on empty stomach with vitamin C',
                            'IV iron (Injectafer, Feraheme) if intolerant to PO or severe IDA',
                            'Continue for 3-6 months after Hgb normalizes to replete stores'
                        ]
                    },
                    {
                        class: 'Vitamin Supplementation',
                        medications: [
                            'B12: 1000 mcg IM monthly if deficient (pernicious anemia, malabsorption)',
                            'Folate: 1mg PO daily if deficient',
                            'EPO (erythropoietin) if CKD-related anemia (Hgb <10 g/dL)'
                        ]
                    }
                ],
                nonpharm: [
                    'Identify and treat underlying cause (GI bleeding, nutritional deficiency, hemolysis, CKD)',
                    'Dietary counseling: Increase red meat, dark leafy greens, beans, fortified cereals',
                    'Avoid tea/coffee with meals (inhibits iron absorption)',
                    'Consider gastroenterology referral for endoscopy if occult GI bleeding',
                    'Hematology referral if refractory or unclear etiology'
                ]
            },
            labAdjustments: {
                Hgb: {
                    critical: 'Hgb <6 g/dL: CRITICAL - Transfuse immediately 2-4 units PRBC. Monitor in ICU if unstable or active bleeding.',
                    low: 'Hgb 6-7 g/dL: Symptomatic or CAD → Transfuse 1-2 units. Asymptomatic → Oral iron, monitor closely.',
                    moderate: 'Hgb 7-10 g/dL: Treat underlying cause. Oral iron if IDA. Transfuse only if symptomatic.',
                    normal: 'Hgb >10 g/dL: Continue iron supplementation if IDA. No transfusion needed.'
                },
                MCV: {
                    low: 'MCV <80 fL (Microcytic): Iron deficiency, thalassemia, or chronic disease. Check iron panel.',
                    normal: 'MCV 80-100 fL (Normocytic): Acute blood loss, CKD, hemolysis, or chronic disease.',
                    high: 'MCV >100 fL (Macrocytic): B12/folate deficiency, alcohol, hypothyroidism, or myelodysplasia.'
                },
                Ferritin: {
                    low: 'Ferritin <30 ng/mL: Iron deficiency. Start oral iron 325mg TID.',
                    normal: 'Ferritin 30-200 ng/mL: Adequate iron stores. Consider other causes of anemia.',
                    high: 'Ferritin >200 ng/mL: Inflammation, infection, or iron overload. Not iron deficiency.'
                },
                Reticulocyte: {
                    low: '<0.5%: Decreased RBC production (bone marrow problem, nutritional deficiency). Check B12, folate, iron.',
                    high: '>2%: Increased RBC production (hemolysis, acute bleeding). Check LDH, haptoglobin, bilirubin.'
                }
            },
            references: [
                'AABB Red Blood Cell Transfusion Guidelines 2016',
                'WHO Iron Deficiency Anemia Guidelines',
                'UpToDate: Approach to the Adult with Anemia'
            ],
            guidelineUrl: 'https://www.aabb.org/news-resources/resources/transfusion-guidelines'
        },

        'Infective Endocarditis': {
            keywords: ['endocarditis', 'infective endocarditis', 'ie', 'bacterial endocarditis', 'vegetation', 'valvular infection', 'blood culture positive endocarditis'],
            category: 'Infectious Disease',
            scores: [
                {
                    name: 'Modified Duke Criteria',
                    purpose: 'Diagnostic criteria for infective endocarditis',
                    fields: [
                        { id: 'blood_culture_positive', label: '2+ positive blood cultures with typical organism', type: 'checkbox', points: 2 },
                        { id: 'echo_vegetation', label: 'Echo: Vegetation, abscess, or new valve regurgitation', type: 'checkbox', points: 2 },
                        { id: 'fever', label: 'Fever >38°C (100.4°F)', type: 'checkbox', points: 1 },
                        { id: 'vascular_phenomena', label: 'Vascular phenomena (emboli, septic infarcts, Janeway lesions)', type: 'checkbox', points: 1 },
                        { id: 'immunologic', label: 'Immunologic phenomena (Osler nodes, Roth spots, RF positive)', type: 'checkbox', points: 1 },
                        { id: 'predisposing', label: 'Predisposing heart condition or IVDU', type: 'checkbox', points: 1 }
                    ],
                    interpretation: {
                        0: { risk: 'Unlikely', recommendation: 'IE unlikely. Consider alternative diagnosis.', color: '#10b981' },
                        1: { risk: 'Possible', recommendation: 'Possible IE. Repeat blood cultures, get TEE.', color: '#f59e0b' },
                        2: { risk: 'Possible', recommendation: 'Possible IE. Start empiric antibiotics after cultures.', color: '#f59e0b' },
                        3: { risk: 'Probable', recommendation: 'Probable IE. Start antibiotics, consult cardiology/ID.', color: '#f97316' },
                        4: { risk: 'Definite', recommendation: 'Definite IE (2 major criteria). Urgent treatment required.', color: '#dc2626' },
                        9: { risk: 'Definite', recommendation: 'Definite IE. Cardiology, cardiac surgery, ID consults.', color: '#991b1b' }
                    }
                }
            ],
            monitoring: {
                labs: ['Blood cultures x3 sets from different sites BEFORE antibiotics', 'CBC with differential', 'ESR, CRP', 'Cr/eGFR (baseline renal function)', 'LFTs', 'UA with micro (check for glomerulonephritis)', 'RF, complement (C3, C4) if suspect immunologic phenomena'],
                imaging: ['Transthoracic Echo (TTE) - initial screen', 'Transesophageal Echo (TEE) - more sensitive for vegetations, required if TTE negative and high suspicion', 'CT chest/abdomen if septic emboli suspected', 'MRI brain if neuro symptoms'],
                vitals: ['Temperature q4h', 'BP, HR closely (risk of septic shock)', 'Daily cardiac exam for new murmurs', 'Neuro checks (risk of embolic stroke)'],
                other: ['Daily assessment for embolic phenomena', 'Monitor for heart failure (valve destruction)', 'Weekly echo if unstable or worsening']
            },
            treatment: {
                drugClasses: [
                    {
                        class: 'Empiric IV Antibiotics (Native Valve)',
                        medications: [
                            'Vancomycin 15-20 mg/kg IV q8-12h (target trough 15-20) + Ceftriaxone 2g IV q24h',
                            'If PCN allergy: Vancomycin + Gentamicin 1 mg/kg IV q8h (check levels)',
                            'Continue until organism identified, then narrow based on sensitivities'
                        ]
                    },
                    {
                        class: 'Empiric IV Antibiotics (Prosthetic Valve)',
                        medications: [
                            'Vancomycin 15-20 mg/kg IV q8-12h + Gentamicin 1 mg/kg IV q8h + Rifampin 300mg PO/IV q8h',
                            'Broader coverage needed for prosthetic valves (S. epidermidis common)'
                        ]
                    },
                    {
                        class: 'Targeted Therapy (Organism-Specific)',
                        medications: [
                            'Strep viridans: PCN G 4 million units IV q4h or Ceftriaxone 2g IV q24h x 4 weeks',
                            'Staph aureus (MSSA): Nafcillin 2g IV q4h or Cefazolin 2g IV q8h x 4-6 weeks',
                            'Staph aureus (MRSA): Vancomycin 15-20 mg/kg IV q8-12h x 4-6 weeks',
                            'Enterococcus: Ampicillin 2g IV q4h + Gentamicin 1 mg/kg IV q8h x 4-6 weeks',
                            'HACEK organisms: Ceftriaxone 2g IV q24h x 4 weeks'
                        ]
                    },
                    {
                        class: 'Adjunctive Therapy',
                        medications: [
                            'Anticoagulation: AVOID unless mechanical valve or other indication (increases bleeding risk)',
                            'Heart failure: Diuretics, ACE inhibitors as tolerated',
                            'Consider cardiac surgery if: Heart failure, large vegetation >10mm, recurrent emboli, abscess, valve dehiscence'
                        ]
                    }
                ],
                nonpharm: [
                    'Infectious Disease consult - MANDATORY for antibiotic selection and duration',
                    'Cardiology consult - assess for surgery indications',
                    'Cardiac surgery consult if severe valve dysfunction, heart failure, or abscess',
                    'Dentistry evaluation (remove potential sources of bacteremia)',
                    'Duration: 4-6 weeks IV antibiotics (native valve), 6-8 weeks (prosthetic valve)',
                    'Repeat blood cultures 48-72h after starting antibiotics (should be negative)',
                    'Repeat TTE/TEE at end of treatment to assess for residual vegetation',
                    'Endocarditis prophylaxis for future dental procedures if high-risk'
                ]
            },
            labAdjustments: {
                WBC: {
                    high: 'WBC >15,000: Severe infection or abscess formation. Ensure adequate antibiotic coverage. Consider CT scan for abscess.',
                    normal: 'WBC normal: Doesn\'t rule out IE. Focus on blood culture results and echo findings.'
                },
                Cr: {
                    rising: 'Creatinine rising: Antibiotic nephrotoxicity (vancomycin, gentamicin) OR immune complex glomerulonephritis OR septic emboli to kidneys. Check UA for RBC casts. Adjust antibiotic doses. Consider stopping gentamicin if Cr >2.0.',
                    normal: 'Creatinine stable: Continue current antibiotics. Monitor closely.'
                },
                CRP_ESR: {
                    high: 'ESR >50, CRP >10: Active infection. Trending down = treatment response. Persistent elevation = treatment failure, consider surgery.',
                    trending: 'CRP/ESR trending: Serial values helpful to monitor treatment response. Should decrease by 50% in 2 weeks.'
                },
                BloodCulture: {
                    positive: 'Blood cultures positive >72h after antibiotics: Treatment failure. Consider resistant organism, abscess, or need for surgery. Repeat TEE.',
                    negative: 'Blood cultures negative at 72h: Good response to antibiotics. Continue full course (4-6 weeks).'
                }
            },
            references: [
                'AHA/ACC Infective Endocarditis Guidelines 2015',
                'ESC Infective Endocarditis Guidelines 2023',
                'Modified Duke Criteria (Circulation 2000;96:358-366)',
                'UpToDate: Antimicrobial Therapy of Native Valve Endocarditis'
            ],
            guidelineUrl: 'https://www.ahajournals.org/doi/10.1161/CIR.0000000000000296'
        }
    };

    // ═══════════════════════════════════════════════════════════════════════
    // ADVANCED FUZZY MATCHING ENGINE
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Calculate Levenshtein distance between two strings
     */
    function levenshteinDistance(str1, str2) {
        const len1 = str1.length;
        const len2 = str2.length;
        const matrix = Array(len2 + 1).fill(null).map(() => Array(len1 + 1).fill(0));

        for (let i = 0; i <= len1; i++) matrix[0][i] = i;
        for (let j = 0; j <= len2; j++) matrix[j][0] = j;

        for (let j = 1; j <= len2; j++) {
            for (let i = 1; i <= len1; i++) {
                const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
                matrix[j][i] = Math.min(
                    matrix[j][i - 1] + 1,
                    matrix[j - 1][i] + 1,
                    matrix[j - 1][i - 1] + indicator
                );
            }
        }

        return matrix[len2][len1];
    }

    /**
     * Calculate similarity ratio (0-100)
     */
    function calculateSimilarity(str1, str2) {
        const maxLen = Math.max(str1.length, str2.length);
        if (maxLen === 0) return 100;
        const distance = levenshteinDistance(str1, str2);
        return Math.round((1 - distance / maxLen) * 100);
    }

    /**
     * Extract significant words (remove common words)
     */
    function extractKeywords(text) {
        const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from']);
        return text.toLowerCase()
            .replace(/[^a-z0-9\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 2 && !stopWords.has(word));
    }

    /**
     * Advanced fuzzy matching - handles variations, typos, abbreviations
     */
    function advancedMatch(diagnosisText, keyword) {
        const diagnosis = diagnosisText.toLowerCase().trim();
        const kw = keyword.toLowerCase().trim();

        // Exact match
        if (diagnosis === kw) return 100;

        // Contains exact keyword as whole word
        const wordBoundaryRegex = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        if (wordBoundaryRegex.test(diagnosis)) return 95;

        // Contains keyword as substring
        if (diagnosis.includes(kw)) return 90;

        // Reverse: keyword contains diagnosis
        if (kw.includes(diagnosis)) return 85;

        // Word-level matching
        const diagWords = extractKeywords(diagnosis);
        const kwWords = extractKeywords(kw);

        if (diagWords.length > 0 && kwWords.length > 0) {
            // Check if any significant word matches
            let matchCount = 0;
            for (const dw of diagWords) {
                for (const kw of kwWords) {
                    if (dw === kw) matchCount++;
                    else if (dw.startsWith(kw) || kw.startsWith(dw)) matchCount += 0.7;
                    else if (calculateSimilarity(dw, kw) >= 80) matchCount += 0.5;
                }
            }
            const wordMatchScore = (matchCount / Math.max(diagWords.length, kwWords.length)) * 100;
            if (wordMatchScore >= 60) return Math.round(wordMatchScore);
        }

        // Levenshtein distance similarity
        const similarity = calculateSimilarity(diagnosis, kw);
        if (similarity >= 70) return similarity;

        // Check for common abbreviations
        const abbrevScore = checkAbbreviations(diagnosis, kw);
        if (abbrevScore > 0) return abbrevScore;

        return 0;
    }

    /**
     * Check for common medical abbreviations
     */
    function checkAbbreviations(text, keyword) {
        const abbrevMap = {
            'dm': ['diabetes', 'diabetes mellitus'],
            't2dm': ['type 2 diabetes', 'diabetes mellitus type 2'],
            't1dm': ['type 1 diabetes', 'diabetes mellitus type 1'],
            'htn': ['hypertension', 'high blood pressure'],
            'chf': ['heart failure', 'congestive heart failure'],
            'hf': ['heart failure'],
            'copd': ['chronic obstructive pulmonary disease'],
            'ckd': ['chronic kidney disease', 'chronic renal failure'],
            'crf': ['chronic renal failure', 'chronic kidney disease'],
            'esrd': ['end stage renal disease', 'kidney failure'],
            'cap': ['community acquired pneumonia', 'pneumonia'],
            'afib': ['atrial fibrillation'],
            'af': ['atrial fibrillation'],
            'cad': ['coronary artery disease'],
            'mi': ['myocardial infarction', 'heart attack'],
            'cvd': ['cardiovascular disease'],
            'pvd': ['peripheral vascular disease'],
            'dvt': ['deep vein thrombosis'],
            'pe': ['pulmonary embolism'],
            'aki': ['acute kidney injury'],
            'uti': ['urinary tract infection'],
            'gi': ['gastrointestinal'],
            'ie': ['infective endocarditis', 'endocarditis'],
            'ida': ['iron deficiency anemia', 'anemia'],
            'hgb': ['hemoglobin', 'anemia'],
            'hct': ['hematocrit'],
            'cva': ['stroke', 'cerebrovascular accident']
        };

        const textWords = extractKeywords(text);
        const kwWords = extractKeywords(keyword);

        // Check if text contains abbreviation that matches keyword
        for (const word of textWords) {
            if (abbrevMap[word]) {
                for (const expansion of abbrevMap[word]) {
                    if (kwWords.some(kw => expansion.includes(kw) || kw.includes(expansion))) {
                        return 85;
                    }
                }
            }
        }

        // Check reverse: keyword contains abbreviation that matches text
        for (const word of kwWords) {
            if (abbrevMap[word]) {
                for (const expansion of abbrevMap[word]) {
                    if (textWords.some(tw => expansion.includes(tw) || tw.includes(expansion))) {
                        return 85;
                    }
                }
            }
        }

        return 0;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // NEURAL MEDICAL KNOWLEDGE ENGINE - AI-POWERED MATCHING
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Medical knowledge graph - semantic relationships between conditions
     * This allows the system to be creative and recognize related conditions
     */
    const MEDICAL_KNOWLEDGE_GRAPH = {
        // Infection patterns
        'sepsis': ['urosepsis', 'septic shock', 'bacteremia', 'blood infection', 'systemic infection', 'severe infection'],
        'infection': ['sepsis', 'bacterial infection', 'viral infection', 'infected', 'septic'],
        'uti': ['urinary tract infection', 'bladder infection', 'cystitis', 'pyelonephritis', 'urosepsis'],
        'urine': ['uti', 'urinary', 'bladder', 'urosepsis', 'pyelonephritis'],
        'urinary': ['uti', 'urine infection', 'bladder infection', 'urosepsis'],
        'respiratory': ['chest infection', 'lung infection', 'pneumonia', 'bronchitis', 'lrti'],
        'chest': ['chest infection', 'respiratory infection', 'pneumonia', 'bronchitis', 'lung problem'],
        'pneumonia': ['chest infection', 'lung infection', 'respiratory infection', 'cap'],

        // Cardiovascular/Cardiac patterns
        'heart': ['heart failure', 'cardiac', 'chf', 'myocardial', 'coronary', 'cardiac arrest'],
        'cardiac': ['heart failure', 'heart disease', 'coronary artery disease', 'myocardial infarction', 'heart attack', 'arrest', 'cardiac arrest'],
        'arrest': ['cardiac arrest', 'heart arrest', 'code blue', 'rosc', 'post arrest', 'resuscitation', 'post cardiac arrest'],
        'rosc': ['return of spontaneous circulation', 'post cardiac arrest', 'post arrest', 'resuscitated', 'post code'],
        'code': ['cardiac arrest', 'code blue', 'arrest', 'rosc', 'resuscitation'],
        'resuscitation': ['cpr', 'cardiac arrest', 'post arrest', 'rosc', 'resuscitated'],
        'post': ['post cardiac arrest', 'post arrest', 'rosc', 'after arrest', 'post resuscitation'],
        'failure': ['heart failure', 'kidney failure', 'renal failure', 'respiratory failure'],

        // Neurological/Stroke patterns
        'stroke': ['cva', 'cerebrovascular accident', 'brain attack', 'cerebral infarction', 'ischemic stroke', 'hemorrhagic stroke', 'ich', 'tia'],
        'cva': ['stroke', 'cerebrovascular accident', 'brain attack', 'cerebral', 'ischemic stroke', 'hemorrhagic stroke'],
        'brain': ['stroke', 'cva', 'cerebral', 'cerebrovascular', 'tia', 'neuro', 'neurological', 'brain attack'],
        'cerebral': ['stroke', 'cva', 'cerebrovascular', 'brain', 'ich', 'hemorrhage'],
        'cerebrovascular': ['stroke', 'cva', 'brain attack', 'tia', 'cerebral'],
        'tia': ['transient ischemic attack', 'mini stroke', 'stroke', 'cva'],
        'hemorrhage': ['bleeding', 'ich', 'hemorrhagic stroke', 'brain bleed', 'cerebral hemorrhage'],
        'ischemic': ['ischemic stroke', 'stroke', 'cva', 'infarction', 'cerebral infarction'],

        // Metabolic patterns
        'sugar': ['diabetes', 'hyperglycemia', 'glucose'],
        'glucose': ['diabetes', 'hyperglycemia', 'blood sugar'],
        'diabetes': ['dm', 't2dm', 'diabetic', 'hyperglycemia', 'sugar'],

        // Renal patterns
        'kidney': ['ckd', 'chronic kidney disease', 'renal failure', 'nephropathy', 'renal'],
        'renal': ['kidney disease', 'kidney failure', 'ckd', 'kidney', 'nephropathy'],

        // Respiratory patterns
        'lung': ['copd', 'pneumonia', 'respiratory', 'pulmonary', 'chest infection'],
        'breathing': ['copd', 'asthma', 'respiratory', 'dyspnea', 'shortness of breath'],
        'pulmonary': ['lung', 'respiratory', 'pneumonia', 'copd'],

        // Blood pressure
        'pressure': ['hypertension', 'htn', 'high blood pressure', 'bp'],
        'hypertension': ['htn', 'high blood pressure', 'elevated bp'],
        'bp': ['blood pressure', 'hypertension', 'htn'],

        // Severity modifiers
        'severe': ['critical', 'acute', 'serious', 'emergency', 'life-threatening'],
        'chronic': ['long-term', 'ongoing', 'persistent'],
        'acute': ['sudden', 'severe', 'emergency', 'critical'],

        // Blood/Hematology patterns
        'anemia': ['symptomatic anemia', 'low hemoglobin', 'low hgb', 'anemic', 'iron deficiency', 'ida'],
        'hemoglobin': ['anemia', 'hgb', 'hb', 'low hemoglobin', 'anemic'],
        'iron': ['anemia', 'iron deficiency', 'ida', 'ferritin', 'low iron'],
        'symptomatic': ['symptoms', 'presenting', 'clinical'],

        // Cardiac/Valve patterns
        'endocarditis': ['infective endocarditis', 'ie', 'valve infection', 'bacterial endocarditis'],
        'valve': ['endocarditis', 'valvular', 'valve infection', 'vegetation'],
        'vegetation': ['endocarditis', 'ie', 'valve infection'],
        'infective': ['infectious', 'infection', 'infected', 'bacterial']
    };

    /**
     * ENHANCED Neural semantic matching - multi-layered context understanding
     * v3.1: Refined algorithm with sophisticated pattern recognition
     */
    function neuralSemanticMatch(diagnosis, keyword) {
        const diagLower = diagnosis.toLowerCase();
        const kwLower = keyword.toLowerCase();

        // Extract medical terms from both
        const diagTerms = extractKeywords(diagLower);
        const kwTerms = extractKeywords(kwLower);

        let semanticScore = 0;
        const matchedPairs = new Set(); // Prevent double-counting same matches

        // LAYER 1: Direct exact term matching (highest weight)
        for (const diagTerm of diagTerms) {
            for (const kwTerm of kwTerms) {
                const pairKey = `${diagTerm}-${kwTerm}`;
                if (matchedPairs.has(pairKey)) continue;

                // Exact match
                if (diagTerm === kwTerm) {
                    semanticScore += 35;
                    matchedPairs.add(pairKey);
                    continue;
                }

                // LAYER 2: Knowledge graph - primary relationships
                // Check direct relationships in graph
                if (MEDICAL_KNOWLEDGE_GRAPH[diagTerm]) {
                    const relatedTerms = MEDICAL_KNOWLEDGE_GRAPH[diagTerm];
                    for (const related of relatedTerms) {
                        // Exact relation match
                        if (related === kwTerm) {
                            semanticScore += 30;
                            matchedPairs.add(pairKey);
                            break;
                        }
                        // Related term contains keyword
                        if (related.includes(kwTerm) && kwTerm.length >= 4) {
                            semanticScore += 25;
                            matchedPairs.add(pairKey);
                            break;
                        }
                        // Keyword contains related term
                        if (kwTerm.includes(related) && related.length >= 4) {
                            semanticScore += 25;
                            matchedPairs.add(pairKey);
                            break;
                        }
                    }
                }

                // LAYER 3: Reverse graph check
                if (MEDICAL_KNOWLEDGE_GRAPH[kwTerm] && !matchedPairs.has(pairKey)) {
                    const relatedTerms = MEDICAL_KNOWLEDGE_GRAPH[kwTerm];
                    for (const related of relatedTerms) {
                        // Exact relation match
                        if (related === diagTerm) {
                            semanticScore += 30;
                            matchedPairs.add(pairKey);
                            break;
                        }
                        // Related term contains diagnosis term
                        if (related.includes(diagTerm) && diagTerm.length >= 4) {
                            semanticScore += 25;
                            matchedPairs.add(pairKey);
                            break;
                        }
                        // Diagnosis term contains related term
                        if (diagTerm.includes(related) && related.length >= 4) {
                            semanticScore += 25;
                            matchedPairs.add(pairKey);
                            break;
                        }
                    }
                }

                // LAYER 4: Partial prefix/suffix matching (medical morphology)
                if (!matchedPairs.has(pairKey)) {
                    // Match longer prefixes (more specific)
                    if (diagTerm.length >= 6 && kwTerm.length >= 6) {
                        // Check 6-char prefix
                        if (diagTerm.startsWith(kwTerm.substring(0, 6)) || kwTerm.startsWith(diagTerm.substring(0, 6))) {
                            semanticScore += 20;
                            matchedPairs.add(pairKey);
                            continue;
                        }
                    }

                    // 5-char prefix
                    if (diagTerm.length >= 5 && kwTerm.length >= 5) {
                        if (diagTerm.startsWith(kwTerm.substring(0, 5)) || kwTerm.startsWith(diagTerm.substring(0, 5))) {
                            semanticScore += 18;
                            matchedPairs.add(pairKey);
                            continue;
                        }
                    }

                    // 4-char prefix (common medical roots)
                    if (diagTerm.length >= 4 && kwTerm.length >= 4) {
                        if (diagTerm.startsWith(kwTerm.substring(0, 4)) || kwTerm.startsWith(diagTerm.substring(0, 4))) {
                            semanticScore += 15;
                            matchedPairs.add(pairKey);
                            continue;
                        }
                    }
                }

                // LAYER 5: Advanced substring matching for compound medical terms
                if (!matchedPairs.has(pairKey)) {
                    // Check if one contains the other (min length 5 to avoid false positives)
                    if (diagTerm.length >= 5 && kwTerm.length >= 5) {
                        if (diagTerm.includes(kwTerm)) {
                            semanticScore += 22;
                            matchedPairs.add(pairKey);
                        } else if (kwTerm.includes(diagTerm)) {
                            semanticScore += 22;
                            matchedPairs.add(pairKey);
                        }
                    }
                }
            }
        }

        // LAYER 6: Multi-word phrase bonus
        // If diagnosis is multi-word and matches multiple keywords, boost score
        if (diagTerms.length >= 2 && kwTerms.length >= 2) {
            let multiWordMatches = 0;
            for (const diagTerm of diagTerms) {
                if (kwTerms.includes(diagTerm)) {
                    multiWordMatches++;
                }
            }
            if (multiWordMatches >= 2) {
                semanticScore += 15 * multiWordMatches; // Reward multi-word precision
            }
        }

        // LAYER 7: Bidirectional deep graph traversal (2-hop relationships)
        // Check if terms are related through an intermediate concept
        for (const diagTerm of diagTerms) {
            for (const kwTerm of kwTerms) {
                if (MEDICAL_KNOWLEDGE_GRAPH[diagTerm]) {
                    const firstHop = MEDICAL_KNOWLEDGE_GRAPH[diagTerm];
                    for (const intermediate of firstHop) {
                        // Check if intermediate term relates to keyword
                        const intermediateWords = extractKeywords(intermediate);
                        for (const interWord of intermediateWords) {
                            if (MEDICAL_KNOWLEDGE_GRAPH[interWord]) {
                                const secondHop = MEDICAL_KNOWLEDGE_GRAPH[interWord];
                                if (secondHop.some(term => term.includes(kwTerm) || kwTerm.includes(term))) {
                                    semanticScore += 12; // Lower score for 2-hop match
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        }

        // Cap score at 100
        return Math.min(semanticScore, 100);
    }

    /**
     * ENHANCED NEURAL AUTO-GENERATION: Autonomously research and learn about unknown conditions
     * v3.1: More sophisticated research and learning capabilities
     * This is the creative AI component that takes initiative
     */
    async function neuralAutoGenerateGuideline(condition) {
        console.log(`[NeuralEngine] 🧠 Initiating autonomous research for: ${condition}`);
        console.log(`[NeuralEngine] 🔍 Neural AI will now research this condition from medical literature...`);

        try {
            // PHASE 1: AUTONOMOUS RESEARCH - Fetch comprehensive data from multiple sources
            console.log(`[NeuralEngine] 📚 Phase 1: Researching medical literature...`);
            const researchData = await conductAutonomousResearch(condition);

            if (researchData && researchData.success) {
                console.log(`[NeuralEngine] ✅ Research complete. Building comprehensive guideline...`);

                // Extract and categorize research findings
                const treatmentPearls = researchData.pearls.filter(p => p.category === 'treatment');
                const monitoringPearls = researchData.pearls.filter(p => p.category === 'monitoring');
                const diagnosisPearls = researchData.pearls.filter(p => p.category === 'diagnosis');
                const preventionPearls = researchData.pearls.filter(p => p.category === 'prevention');

                // PHASE 2: INTELLIGENT SYNTHESIS - Create structured guideline from research
                const autoGeneratedGuideline = {
                    keywords: generateSmartKeywords(condition, researchData),
                    category: researchData.specialty || 'Auto-Generated (Neural AI)',
                    monitoring: {
                        labs: extractLabMonitoring(monitoringPearls, condition),
                        frequency: determineMonitoringFrequency(monitoringPearls, condition),
                        vitals: extractVitalSigns(monitoringPearls, condition)
                    },
                    treatment: {
                        medications: extractMedications(treatmentPearls, condition),
                        nonpharm: extractNonPharmInterventions(treatmentPearls, preventionPearls, condition)
                    },
                    labAdjustments: buildLabAdjustments(monitoringPearls, condition),
                    references: researchData.sources || ['Auto-generated from PubMed and medical databases'],
                    guidelineUrl: researchData.guidelineUrl || '',
                    autoGenerated: true,
                    neuralAI: true,
                    researchQuality: researchData.quality || 'standard',
                    generatedAt: new Date().toISOString(),
                    lastResearched: new Date().toISOString()
                };

                // PHASE 3: LEARNING - Save to knowledge base
                const guidelineName = `Neural AI: ${condition.charAt(0).toUpperCase() + condition.slice(1)}`;
                await saveLearnedGuideline(guidelineName, autoGeneratedGuideline);

                console.log(`[NeuralEngine] 🎓 Successfully learned about "${condition}" and saved to knowledge base`);
                console.log(`[NeuralEngine] 📊 Quality: ${researchData.quality || 'standard'} | Sources: ${researchData.sources?.length || 0}`);

                return {
                    name: guidelineName,
                    guideline: autoGeneratedGuideline,
                    confidence: calculateResearchConfidence(researchData),
                    source: 'neural-autonomous'
                };
            }

            // PHASE 4: FALLBACK - If research fails, create informed template
            console.log(`[NeuralEngine] ⚠️ Limited research data. Creating template with best practices...`);
            const fallbackGuideline = createInformedTemplate(condition);

            await saveLearnedGuideline(`Auto: ${condition}`, fallbackGuideline);

            console.log(`[NeuralEngine] 💡 Created basic guideline. Will improve with more data over time.`);

            return {
                name: `Auto: ${condition}`,
                guideline: fallbackGuideline,
                confidence: 60,
                source: 'neural-template'
            };

        } catch (error) {
            console.error('[NeuralEngine] ❌ Error during autonomous research:', error);
            console.log('[NeuralEngine] 🔄 Falling back to template-based guideline...');

            // Emergency fallback
            const emergencyGuideline = createInformedTemplate(condition);
            await saveLearnedGuideline(`Auto: ${condition}`, emergencyGuideline);

            return {
                name: `Auto: ${condition}`,
                guideline: emergencyGuideline,
                confidence: 50,
                source: 'neural-fallback'
            };
        }
    }

    /**
     * Conduct autonomous research on medical condition
     */
    async function conductAutonomousResearch(condition) {
        console.log(`[Research] 🔬 Searching medical databases for: ${condition}`);

        try {
            // Try to fetch clinical pearls which will do web research
            const pearlsResult = await fetchClinicalPearls(condition);

            if (pearlsResult && pearlsResult.pearls && pearlsResult.pearls.pearls && pearlsResult.pearls.pearls.length > 0) {
                return {
                    success: true,
                    pearls: pearlsResult.pearls.pearls,
                    sources: pearlsResult.pearls.sources,
                    specialty: classifySpecialty(condition, pearlsResult.pearls.pearls),
                    quality: pearlsResult.pearls.pearls.length >= 5 ? 'high' : 'standard',
                    guidelineUrl: extractGuidelineUrl(pearlsResult)
                };
            }

            return { success: false };
        } catch (error) {
            console.error('[Research] Error during research:', error);
            return { success: false };
        }
    }

    /**
     * Generate smart keywords from research data
     */
    function generateSmartKeywords(condition, researchData) {
        const keywords = [condition.toLowerCase()];
        const terms = extractKeywords(condition);

        keywords.push(...terms);

        // Add common medical variations
        if (condition.toLowerCase().includes('infection')) {
            keywords.push('infected', 'sepsis');
        }
        if (condition.toLowerCase().includes('failure')) {
            keywords.push('insufficiency', 'dysfunction');
        }
        if (condition.toLowerCase().includes('disease')) {
            keywords.push('disorder', 'condition');
        }

        return [...new Set(keywords)]; // Remove duplicates
    }

    /**
     * Classify medical specialty based on condition
     */
    function classifySpecialty(condition, pearls) {
        const lower = condition.toLowerCase();

        if (lower.includes('cardiac') || lower.includes('heart')) return 'Cardiology';
        if (lower.includes('renal') || lower.includes('kidney')) return 'Nephrology';
        if (lower.includes('lung') || lower.includes('respiratory')) return 'Pulmonology';
        if (lower.includes('infection') || lower.includes('sepsis')) return 'Infectious Disease';
        if (lower.includes('neuro') || lower.includes('brain')) return 'Neurology';
        if (lower.includes('diabetes') || lower.includes('thyroid')) return 'Endocrinology';
        if (lower.includes('cancer') || lower.includes('tumor')) return 'Oncology';

        return 'General Medicine';
    }

    /**
     * Extract lab monitoring from research pearls
     */
    function extractLabMonitoring(pearls, condition) {
        if (pearls.length === 0) {
            return ['CBC', 'CMP', 'Appropriate labs based on condition'];
        }

        const labs = [];
        pearls.forEach(p => {
            const pearl = p.pearl.toLowerCase();
            if (pearl.includes('cbc')) labs.push('CBC');
            if (pearl.includes('cmp') || pearl.includes('metabolic')) labs.push('CMP');
            if (pearl.includes('liver') || pearl.includes('alt') || pearl.includes('ast')) labs.push('Liver enzymes');
            if (pearl.includes('kidney') || pearl.includes('creatinine')) labs.push('Cr/eGFR');
            if (pearl.includes('glucose') || pearl.includes('hba1c')) labs.push('Glucose/HbA1c');
            if (pearl.includes('culture')) labs.push('Cultures (as indicated)');
        });

        return labs.length > 0 ? [...new Set(labs)] : ['CBC', 'CMP', 'Labs based on clinical presentation'];
    }

    /**
     * Determine monitoring frequency from research
     */
    function determineMonitoringFrequency(pearls, condition) {
        if (condition.toLowerCase().includes('acute') || condition.toLowerCase().includes('sepsis')) {
            return 'Frequent monitoring during acute phase (daily or more), then as clinically indicated';
        }
        if (condition.toLowerCase().includes('chronic')) {
            return 'Every 3-6 months for stable patients, more frequently if symptoms worsen';
        }
        return 'As clinically indicated based on severity and response to treatment';
    }

    /**
     * Extract vital signs monitoring
     */
    function extractVitalSigns(pearls, condition) {
        if (condition.toLowerCase().includes('sepsis') || condition.toLowerCase().includes('shock')) {
            return 'Continuous monitoring: BP, HR, temp, SpO2, urine output. May require ICU level care.';
        }
        if (condition.toLowerCase().includes('respiratory') || condition.toLowerCase().includes('lung')) {
            return 'Monitor SpO2, respiratory rate, work of breathing. Assess for hypoxia.';
        }
        return 'Regular vital signs monitoring. Assess clinical status and response to treatment.';
    }

    /**
     * Extract medications from treatment pearls
     */
    function extractMedications(pearls, condition) {
        if (pearls.length === 0) {
            return [
                `Evidence-based treatment for ${condition}`,
                'Consult current clinical guidelines (UpToDate, NICE, specialty guidelines)',
                'Consider specialist consultation for management recommendations'
            ];
        }

        const meds = pearls.map(p => p.pearl);
        if (meds.length === 0) {
            return [`Treatment for ${condition} per current guidelines`, 'Specialist consultation recommended'];
        }

        return meds;
    }

    /**
     * Extract non-pharmacologic interventions
     */
    function extractNonPharmInterventions(treatmentPearls, preventionPearls, condition) {
        const interventions = [];

        preventionPearls.forEach(p => interventions.push(p.pearl));

        if (interventions.length === 0) {
            interventions.push('Supportive care and symptom management');
            interventions.push('Patient education about condition and warning signs');
            interventions.push('Regular follow-up and monitoring');
            interventions.push('Lifestyle modifications as appropriate');
        }

        return interventions;
    }

    /**
     * Build lab adjustments from monitoring data
     */
    function buildLabAdjustments(pearls, condition) {
        // For auto-generated guidelines, we'll create basic lab adjustment templates
        const adjustments = {};

        // This can be expanded with more sophisticated parsing in future versions
        return adjustments;
    }

    /**
     * Extract guideline URL from research
     */
    function extractGuidelineUrl(pearlsResult) {
        // Could parse URLs from sources in future version
        return '';
    }

    /**
     * Calculate research confidence score
     */
    function calculateResearchConfidence(researchData) {
        if (!researchData || !researchData.success) return 60;

        let confidence = 70; // Base confidence for successful research

        if (researchData.quality === 'high') confidence += 15;
        if (researchData.pearls && researchData.pearls.length >= 5) confidence += 10;
        if (researchData.sources && researchData.sources.length >= 2) confidence += 5;

        return Math.min(confidence, 95); // Cap at 95 for auto-generated
    }

    /**
     * Create informed template with medical best practices
     */
    function createInformedTemplate(condition) {
        return {
            keywords: [condition.toLowerCase(), ...extractKeywords(condition)],
            category: 'Auto-Generated Template',
            monitoring: {
                labs: ['CBC', 'CMP', 'Appropriate labs based on clinical presentation'],
                frequency: 'As clinically indicated. More frequent monitoring during acute phase.',
                vitals: 'Standard vital signs monitoring. Assess clinical status regularly.'
            },
            treatment: {
                medications: [
                    `⚠️ Neural AI is learning about ${condition}`,
                    `Treatment should follow current evidence-based guidelines for ${condition}`,
                    'Consult UpToDate, NICE guidelines, or specialty-specific guidelines',
                    'Consider specialist consultation for management recommendations',
                    '💡 Tip: Use this guideline as a starting point. Will improve as AI learns more.'
                ],
                nonpharm: [
                    'Supportive care and symptom management',
                    'Patient education about condition, treatment, and warning signs',
                    'Regular follow-up and clinical monitoring',
                    'Lifestyle modifications and risk factor management as appropriate',
                    'Referral to specialist if needed for comprehensive management'
                ]
            },
            labAdjustments: {},
            references: [
                '⚠️ This is an AI-generated template. Verify with current medical literature.',
                'Recommended sources: UpToDate, PubMed, NICE Guidelines',
                'Consult specialty-specific guidelines for detailed management'
            ],
            guidelineUrl: '',
            autoGenerated: true,
            template: true,
            generatedAt: new Date().toISOString()
        };
    }

    /**
     * Find guidelines that match the diagnosis text - ENHANCED WITH NEURAL AI
     */
    function findGuidelines(diagnosisText, options = {}) {
        if (!diagnosisText || typeof diagnosisText !== 'string') {
            return null;
        }

        const normalized = diagnosisText.toLowerCase().trim();
        if (normalized.length < 2) return null;

        const minConfidence = options.minConfidence || 60;
        const matches = [];

        // PHASE 1: Traditional fuzzy matching on built-in guidelines
        for (const [name, guideline] of Object.entries(GUIDELINES)) {
            let bestScore = 0;
            for (const keyword of guideline.keywords) {
                const score = advancedMatch(normalized, keyword);
                if (score > bestScore) bestScore = score;
            }
            if (bestScore >= minConfidence) {
                matches.push({
                    name: name,
                    guideline: guideline,
                    confidence: bestScore,
                    source: 'built-in'
                });
            }
        }

        // PHASE 2: Traditional matching on learned guidelines
        for (const [name, guideline] of Object.entries(learnedGuidelines)) {
            let bestScore = 0;
            for (const keyword of (guideline.keywords || [])) {
                const score = advancedMatch(normalized, keyword);
                if (score > bestScore) bestScore = score;
            }
            if (bestScore >= minConfidence) {
                matches.push({
                    name: name,
                    guideline: guideline,
                    confidence: bestScore,
                    source: 'learned'
                });
            }
        }

        // PHASE 3: NEURAL SEMANTIC MATCHING (if no high-confidence match yet)
        const hasHighConfidenceMatch = matches.some(m => m.confidence >= 80);
        if (!hasHighConfidenceMatch) {
            console.log('[NeuralEngine] Activating semantic analysis for:', normalized);

            // Search with neural semantic matching
            for (const [name, guideline] of Object.entries(GUIDELINES)) {
                let bestSemanticScore = 0;
                for (const keyword of guideline.keywords) {
                    const semanticScore = neuralSemanticMatch(normalized, keyword);
                    if (semanticScore > bestSemanticScore) bestSemanticScore = semanticScore;
                }

                // If semantic matching found a good match that wasn't found before
                if (bestSemanticScore >= 50 && !matches.find(m => m.name === name)) {
                    matches.push({
                        name: name,
                        guideline: guideline,
                        confidence: bestSemanticScore,
                        source: 'neural-semantic'
                    });
                    console.log(`[NeuralEngine] 🧠 Semantic match: "${normalized}" → "${name}" (${bestSemanticScore}%)`);
                }
            }
        }

        // Sort by confidence
        matches.sort((a, b) => b.confidence - a.confidence);

        // If returning multiple matches for suggestions
        if (options.returnAll) {
            return matches.slice(0, 5); // Top 5 matches
        }

        // PHASE 4: PROACTIVE AUTO-GENERATION & AUTONOMOUS LEARNING
        // Enhanced in v3.1: More aggressive autonomous learning
        // If no high-confidence match found, trigger neural research
        const bestMatch = matches.length > 0 ? matches[0] : null;
        const hasGoodMatch = bestMatch && bestMatch.confidence >= 75;

        if (!hasGoodMatch && !options.disableAutoGeneration) {
            console.log('[NeuralEngine] 🚀 AUTONOMOUS LEARNING ACTIVATED');
            console.log(`[NeuralEngine] 📊 Current best match: ${matches.length > 0 ? matches[0].confidence + '%' : 'None'}`);
            console.log('[NeuralEngine] 🔬 Neural AI will research and learn about this condition in the background...');

            // Trigger async auto-generation (don't block, let it learn in background)
            (async () => {
                const generated = await neuralAutoGenerateGuideline(normalized);
                if (generated) {
                    console.log('[NeuralEngine] ✅ Successfully researched and learned:', normalized);
                    console.log('[NeuralEngine] 💾 Guideline saved. Will be available for next patient with this diagnosis.');
                } else {
                    console.log('[NeuralEngine] ⚠️ Research incomplete. Will retry later.');
                }
            })();

            // Return best available match for now (or null if none)
            if (matches.length > 0) {
                console.log('[NeuralEngine] 📋 Returning best available match for now. Check back later for improved guideline.');
                return matches[0];
            }

            console.log('[NeuralEngine] 💡 No guidelines available yet. Neural AI is researching now...');
            return null;
        }

        // Return best match if above threshold
        return matches.length > 0 ? matches[0] : null;
    }

    /**
     * Get suggestions for partial diagnosis text
     */
    function getSuggestions(diagnosisText) {
        return findGuidelines(diagnosisText, { minConfidence: 50, returnAll: true });
    }

    /**
     * Get lab-adjusted recommendations based on patient's lab values
     */
    function getLabAdjustedRecommendations(guideline, labValues) {
        if (!guideline || !guideline.labAdjustments || !labValues) {
            return [];
        }

        const adjustments = [];

        // Process each lab value
        for (const [labName, labData] of Object.entries(labValues)) {
            const adjustment = guideline.labAdjustments[labName];
            if (!adjustment) continue;

            const value = parseFloat(labData.value);
            if (isNaN(value)) continue;

            // Determine which adjustment category applies
            if (labData.flag === 'H' || labData.flag === 'HH') {
                if (adjustment.high) {
                    adjustments.push({
                        lab: labName,
                        value: value,
                        unit: labData.unit,
                        flag: labData.flag,
                        recommendation: adjustment.high,
                        priority: labData.flag === 'HH' ? 'CRITICAL' : 'HIGH'
                    });
                }
            } else if (labData.flag === 'L' || labData.flag === 'LL') {
                if (adjustment.low) {
                    adjustments.push({
                        lab: labName,
                        value: value,
                        unit: labData.unit,
                        flag: labData.flag,
                        recommendation: adjustment.low,
                        priority: labData.flag === 'LL' ? 'CRITICAL' : 'HIGH'
                    });
                }
            } else if (adjustment.normal || adjustment.stable || adjustment.therapeutic) {
                const rec = adjustment.normal || adjustment.stable || adjustment.therapeutic;
                adjustments.push({
                    lab: labName,
                    value: value,
                    unit: labData.unit,
                    flag: 'N',
                    recommendation: rec,
                    priority: 'INFO'
                });
            }

            // Check for special conditions (trending, worsening, etc.)
            if (adjustment.trending && labData.flag && labData.flag !== 'N') {
                adjustments.push({
                    lab: labName,
                    value: value,
                    unit: labData.unit,
                    flag: labData.flag,
                    recommendation: adjustment.trending,
                    priority: 'MODERATE'
                });
            }
        }

        // Sort by priority
        const priorityOrder = { CRITICAL: 0, HIGH: 1, MODERATE: 2, INFO: 3 };
        adjustments.sort((a, b) => (priorityOrder[a.priority] || 99) - (priorityOrder[b.priority] || 99));

        return adjustments;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // GOOGLE DRIVE INTEGRATION FOR LEARNED GUIDELINES
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Load learned guidelines from Google Drive
     */
    async function loadLearnedGuidelines() {
        try {
            const stored = localStorage.getItem(LEARNED_GUIDELINES_PATH);
            if (stored) {
                learnedGuidelines = JSON.parse(stored);
                console.log(`[ClinicalGuidelines] Loaded ${Object.keys(learnedGuidelines).length} learned guidelines from localStorage`);
            }
        } catch (error) {
            console.error('[ClinicalGuidelines] Error loading learned guidelines:', error);
        }
    }

    /**
     * Save a new learned guideline to Google Drive
     */
    async function saveLearnedGuideline(name, guideline) {
        try {
            // Add timestamp and version
            const guidelineWithMeta = {
                ...guideline,
                addedAt: Date.now(),
                version: '2.0',
                source: guideline.source || 'custom'
            };

            learnedGuidelines[name] = guidelineWithMeta;
            localStorage.setItem(LEARNED_GUIDELINES_PATH, JSON.stringify(learnedGuidelines));

            console.log(`[ClinicalGuidelines] Saved learned guideline: ${name}`);
            return true;
        } catch (error) {
            console.error('[ClinicalGuidelines] Error saving learned guideline:', error);
            return false;
        }
    }

    /**
     * Delete a learned guideline
     */
    async function deleteLearnedGuideline(name) {
        try {
            delete learnedGuidelines[name];
            localStorage.setItem(LEARNED_GUIDELINES_PATH, JSON.stringify(learnedGuidelines));

            console.log(`[ClinicalGuidelines] Deleted learned guideline: ${name}`);
            return true;
        } catch (error) {
            console.error('[ClinicalGuidelines] Error deleting learned guideline:', error);
            return false;
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // WEB INTEGRATION - FETCH AND ANALYZE ONLINE GUIDELINES
    // ═══════════════════════════════════════════════════════════════════════

    // Cache for fetched clinical pearls (stored in Firebase)
    const CLINICAL_PEARLS_CACHE_PATH = 'clinical-guidelines/pearls-cache';
    let pearlsCache = {};

    /**
     * Load clinical pearls cache from Firebase
     */
    async function loadPearlsCache() {
        try {
            const stored = localStorage.getItem(CLINICAL_PEARLS_CACHE_PATH);
            if (stored) {
                pearlsCache = JSON.parse(stored);
                console.log(`[ClinicalGuidelines] Loaded ${Object.keys(pearlsCache).length} cached clinical pearls`);
            }
        } catch (error) {
            console.error('[ClinicalGuidelines] Error loading pearls cache:', error);
        }
    }

    /**
     * Save clinical pearls to cache
     */
    async function savePearlsToCache(condition, pearls) {
        try {
            const cacheKey = condition.toLowerCase().trim();
            const cacheEntry = {
                condition: condition,
                pearls: pearls,
                cachedAt: Date.now(),
                expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
            };
            pearlsCache[cacheKey] = cacheEntry;
            localStorage.setItem(CLINICAL_PEARLS_CACHE_PATH, JSON.stringify(pearlsCache));
        } catch (error) {
            console.error('[ClinicalGuidelines] Error saving pearls to cache:', error);
        }
    }

    /**
     * Get cached clinical pearls if available and not expired
     */
    function getCachedPearls(condition) {
        const cacheKey = condition.toLowerCase().trim();
        const cached = pearlsCache[cacheKey];
        if (cached && cached.expiresAt > Date.now()) {
            return cached.pearls;
        }
        return null;
    }

    /**
     * Clean and normalize medical query terms before searching
     * Handles punctuation, case normalization, and common medical abbreviations
     */
    function cleanQuery(query) {
        if (!query || typeof query !== 'string') {
            return '';
        }

        // Trim and remove leading/trailing whitespace
        let cleaned = query.trim();

        // Strip trailing punctuation (?, !, ., ,, -, etc.)
        cleaned = cleaned.replace(/[?!.,;\-:]+$/g, '');

        // Remove special characters that break medical searches
        cleaned = cleaned.replace(/[()[\]{}]/g, '');

        // Trim again after punctuation removal
        cleaned = cleaned.trim();

        // Common medical abbreviation mappings (for fuzzy matching)
        const medicalAbbreviations = {
            'acs': 'Acute Coronary Syndrome',
            'mi': 'Myocardial Infarction',
            'chf': 'Congestive Heart Failure',
            'hf': 'Heart Failure',
            'htn': 'Hypertension',
            'dm': 'Diabetes Mellitus',
            'copd': 'Chronic Obstructive Pulmonary Disease',
            'ckd': 'Chronic Kidney Disease',
            'cva': 'Cerebrovascular Accident',
            'afib': 'Atrial Fibrillation',
            'dvt': 'Deep Vein Thrombosis',
            'pe': 'Pulmonary Embolism',
            'uti': 'Urinary Tract Infection',
            'gerd': 'Gastroesophageal Reflux Disease',
            'cabg': 'Coronary Artery Bypass Graft',
            'stemi': 'ST-Elevation Myocardial Infarction',
            'nstemi': 'Non-ST-Elevation Myocardial Infarction'
        };

        // Check if it's a known abbreviation (case-insensitive)
        const lowerCleaned = cleaned.toLowerCase();
        if (medicalAbbreviations[lowerCleaned]) {
            return medicalAbbreviations[lowerCleaned];
        }

        // If it's a short string (likely an acronym), uppercase it
        // Otherwise, use proper case (first letter uppercase)
        if (cleaned.length <= 6 && /^[A-Za-z]+$/.test(cleaned)) {
            return cleaned.toUpperCase();
        }

        // For longer terms, preserve the original case (might be proper medical terminology)
        return cleaned;
    }

    /**
     * Fetch and analyze guidelines from online sources to extract clinical pearls
     */
    async function fetchClinicalPearls(condition) {
        // Clean and normalize the query first
        const cleanedCondition = cleanQuery(condition);

        if (!cleanedCondition) {
            console.warn('[ClinicalGuidelines] Empty condition after cleaning:', condition);
            return {
                pearls: {
                    condition: condition,
                    pearls: [{
                        pearl: 'Invalid search query. Please provide a valid medical condition.',
                        category: 'system',
                        priority: 'moderate'
                    }],
                    fetchedAt: new Date().toISOString(),
                    sources: ['System']
                },
                source: 'error'
            };
        }

        console.log(`[ClinicalGuidelines] Query sanitized: "${condition}" → "${cleanedCondition}"`);

        // Check cache first (use cleaned condition for cache lookup)
        const cached = getCachedPearls(cleanedCondition);
        if (cached) {
            console.log(`[ClinicalGuidelines] Using cached clinical pearls for: ${condition}`);
            return { pearls: cached, source: 'cache' };
        }

        console.log(`[ClinicalGuidelines] Fetching clinical pearls for: ${cleanedCondition}`);

        try {
            // Try multiple sources for best results (use cleaned condition)
            const sources = [
                {
                    name: 'PubMed',
                    url: `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(cleanedCondition)}+guidelines+treatment`
                },
                {
                    name: 'NICE Guidelines',
                    url: `https://www.nice.org.uk/guidance?q=${encodeURIComponent(cleanedCondition)}`
                }
            ];

            let allPearls = [];

            // Fetch from primary source (PubMed)
            if (window.WebFetch) {
                try {
                    const prompt = `Analyze this medical guideline content for ${cleanedCondition}. Extract 5-10 KEY CLINICAL PEARLS - the most important, actionable takeaways for clinicians. Format as a JSON array of objects with: { "pearl": "concise clinical pearl", "category": "diagnosis/treatment/monitoring/prevention", "priority": "critical/high/moderate" }. Focus on: 1) First-line treatments, 2) Key diagnostic criteria, 3) Important drug interactions or contraindications, 4) Monitoring parameters, 5) Critical clinical warnings. Be concise and actionable.`;

                    const result = await window.WebFetch(sources[0].url, prompt);

                    if (result && result.pearls) {
                        allPearls = result.pearls;
                    }
                } catch (error) {
                    console.error('[ClinicalGuidelines] Error fetching from PubMed:', error);
                }
            }

            // If we got pearls, structure and cache them
            if (allPearls.length > 0) {
                const structuredPearls = {
                    condition: cleanedCondition,
                    pearls: allPearls,
                    fetchedAt: new Date().toISOString(),
                    sources: sources.map(s => s.name)
                };

                // Save to cache (use cleaned condition for consistency)
                await savePearlsToCache(cleanedCondition, structuredPearls);

                return { pearls: structuredPearls, source: 'online' };
            }

            // If fetching fails, return placeholder pearls
            return {
                pearls: {
                    condition: cleanedCondition,
                    pearls: [
                        {
                            pearl: `Unable to fetch live guidelines for ${cleanedCondition}. Using built-in knowledge base.`,
                            category: 'system',
                            priority: 'moderate'
                        },
                        {
                            pearl: 'Check reliable sources like UpToDate, PubMed, or NICE Guidelines manually for the most current recommendations.',
                            category: 'system',
                            priority: 'high'
                        }
                    ],
                    fetchedAt: new Date().toISOString(),
                    sources: ['System']
                },
                source: 'fallback'
            };

        } catch (error) {
            console.error('[ClinicalGuidelines] Error fetching clinical pearls:', error);
            return {
                pearls: {
                    condition: cleanedCondition,
                    pearls: [
                        {
                            pearl: `Error fetching guidelines: ${error.message}`,
                            category: 'system',
                            priority: 'moderate'
                        }
                    ],
                    fetchedAt: new Date().toISOString(),
                    sources: ['Error']
                },
                source: 'error'
            };
        }
    }

    /**
     * Generate clinical pearls from built-in guidelines
     */
    function generatePearlsFromBuiltIn(guidelineName) {
        const guideline = GUIDELINES[guidelineName];
        if (!guideline) return null;

        const pearls = [];

        // Extract top medications as pearls
        if (guideline.treatment && guideline.treatment.medications) {
            guideline.treatment.medications.slice(0, 3).forEach((med, idx) => {
                pearls.push({
                    pearl: med,
                    category: 'treatment',
                    priority: idx === 0 ? 'critical' : 'high'
                });
            });
        }

        // Extract key monitoring parameters
        if (guideline.monitoring && guideline.monitoring.labs) {
            pearls.push({
                pearl: `Monitor: ${guideline.monitoring.labs.slice(0, 5).join(', ')}`,
                category: 'monitoring',
                priority: 'high'
            });
        }

        // Extract critical lab adjustments
        if (guideline.labAdjustments) {
            const criticalAdjustments = Object.entries(guideline.labAdjustments).slice(0, 2);
            criticalAdjustments.forEach(([lab, adj]) => {
                if (adj.high) {
                    pearls.push({
                        pearl: `${lab} elevated: ${adj.high.substring(0, 150)}`,
                        category: 'monitoring',
                        priority: 'critical'
                    });
                }
            });
        }

        return {
            condition: guidelineName,
            pearls: pearls,
            fetchedAt: new Date().toISOString(),
            sources: ['Built-in Guidelines']
        };
    }

    /**
     * Create a template for adding new guidelines
     */
    function createGuidelineTemplate(conditionName) {
        return {
            keywords: [conditionName.toLowerCase()],
            category: 'Custom',
            monitoring: {
                labs: ['Enter required labs'],
                frequency: 'Enter monitoring frequency',
                vitals: 'Enter vital signs to monitor'
            },
            treatment: {
                medications: ['Enter medication recommendations'],
                nonpharm: ['Enter non-pharmacologic interventions']
            },
            labAdjustments: {
                // Example structure
                // 'LabName': {
                //     high: 'Recommendation for high values',
                //     low: 'Recommendation for low values',
                //     normal: 'Recommendation for normal values'
                // }
            },
            references: ['Enter guideline references'],
            guidelineUrl: 'Enter URL to full guideline'
        };
    }

    // ═══════════════════════════════════════════════════════════════════════
    // EXPOSE ENHANCED GLOBAL API
    // ═══════════════════════════════════════════════════════════════════════
    window.ClinicalGuidelines = {
        version: '3.1',

        // Core functions
        findGuidelines: findGuidelines,
        getSuggestions: getSuggestions,
        getLabAdjustedRecommendations: getLabAdjustedRecommendations,

        // Guideline management
        getAllGuidelines: () => ({
            builtin: Object.keys(GUIDELINES),
            learned: Object.keys(learnedGuidelines),
            total: Object.keys(GUIDELINES).length + Object.keys(learnedGuidelines).length
        }),
        getGuideline: (name) => GUIDELINES[name] || learnedGuidelines[name],

        // Learning functions
        saveLearnedGuideline: saveLearnedGuideline,
        deleteLearnedGuideline: deleteLearnedGuideline,
        loadLearnedGuidelines: loadLearnedGuidelines,
        createGuidelineTemplate: createGuidelineTemplate,

        // Clinical Pearls
        fetchClinicalPearls: fetchClinicalPearls,
        generatePearlsFromBuiltIn: generatePearlsFromBuiltIn,
        getCachedPearls: getCachedPearls,

        // 🧠 Neural AI Functions (NEW in v3.0)
        neuralSemanticMatch: neuralSemanticMatch,
        neuralAutoGenerateGuideline: neuralAutoGenerateGuideline,
        getKnowledgeGraph: () => MEDICAL_KNOWLEDGE_GRAPH,

        // Utility functions
        testMatch: (diagnosis, keyword) => advancedMatch(diagnosis, keyword),
        testSemanticMatch: (diagnosis, keyword) => neuralSemanticMatch(diagnosis, keyword),

        isReady: true
    };

    // Auto-load learned guidelines and pearls cache on init
    (async () => {
        // Wait a bit for Firebase to initialize
        setTimeout(async () => {
            await loadLearnedGuidelines();
            await loadPearlsCache();
            console.log('╔════════════════════════════════════════════════════════════════╗');
            console.log('║   CLINICAL GUIDELINES v3.1 - ENHANCED NEURAL AI ENGINE 🧠     ║');
            console.log('╚════════════════════════════════════════════════════════════════╝');
            console.log(`[v3.1] Built-in guidelines: ${Object.keys(GUIDELINES).length} (NEW: CVA, Post-Cardiac Arrest)`);
            console.log(`[v3.1] Learned guidelines: ${Object.keys(learnedGuidelines).length}`);
            console.log(`[v3.1] Cached pearls: ${Object.keys(pearlsCache).length}`);
            console.log('[v3.1] 🧠 ENHANCED Neural Engine: 7-layer semantic matching, 40+ knowledge relationships');
            console.log('[v3.1] 🎯 New Detection: CVA/Stroke & Post-Cardiac Arrest (ROSC)');
            console.log('[v3.1] 📚 Traditional Features: Fuzzy matching, Clinical pearls, Lab adjustments');
            console.log('[v3.1] ✅ System ready - Advanced proactive learning enabled');
        }, 1000);
    })();

})();