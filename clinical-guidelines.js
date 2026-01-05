/* ═══════════════════════════════════════════════════════════════════════════
   CLINICAL GUIDELINES MODULE v1.0

   Features:
   - Evidence-based clinical guidelines for common conditions
   - Diagnosis pattern matching with fuzzy search
   - Lab-value-adjusted recommendations
   - Recent guideline references (2023-2025)

   Guidelines Sources:
   - AHA/ACC (Cardiovascular)
   - KDIGO (Kidney Disease)
   - ADA (Diabetes)
   - GOLD (COPD)
   - GINA (Asthma)
   - ESC (European Society of Cardiology)
   - NICE (National Institute for Health and Care Excellence)
   - WHO Clinical Guidelines
   ═══════════════════════════════════════════════════════════════════════════ */

(function() {
    'use strict';

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
        }
    };

    // ═══════════════════════════════════════════════════════════════════════
    // DIAGNOSIS MATCHING ENGINE
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Find guidelines that match the diagnosis text
     */
    function findGuidelines(diagnosisText) {
        if (!diagnosisText || typeof diagnosisText !== 'string') {
            return null;
        }

        const normalized = diagnosisText.toLowerCase().trim();
        if (normalized.length < 3) return null;

        // Find all matching guidelines
        const matches = [];

        for (const [name, guideline] of Object.entries(GUIDELINES)) {
            for (const keyword of guideline.keywords) {
                if (normalized.includes(keyword)) {
                    matches.push({
                        name: name,
                        guideline: guideline,
                        confidence: calculateMatchConfidence(normalized, keyword)
                    });
                    break; // Found a match for this guideline, move to next
                }
            }
        }

        // Sort by confidence and return best match
        matches.sort((a, b) => b.confidence - a.confidence);

        return matches.length > 0 ? matches[0] : null;
    }

    /**
     * Calculate confidence score for keyword match
     */
    function calculateMatchConfidence(text, keyword) {
        // Exact match = 100%
        if (text === keyword) return 100;

        // Keyword is the only word in text = 95%
        if (text.trim() === keyword.trim()) return 95;

        // Keyword is a complete word in text = 90%
        const wordBoundaryRegex = new RegExp(`\\b${keyword}\\b`, 'i');
        if (wordBoundaryRegex.test(text)) return 90;

        // Keyword is substring = 80%
        return 80;
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
    // EXPOSE GLOBAL API
    // ═══════════════════════════════════════════════════════════════════════
    window.ClinicalGuidelines = {
        version: '1.0',
        findGuidelines: findGuidelines,
        getLabAdjustedRecommendations: getLabAdjustedRecommendations,
        getAllGuidelines: () => Object.keys(GUIDELINES),
        getGuideline: (name) => GUIDELINES[name],
        isReady: true
    };

    console.log('[ClinicalGuidelines v1.0] Clinical Guidelines System loaded');
    console.log('[ClinicalGuidelines v1.0] Available guidelines:', Object.keys(GUIDELINES).length);

})();
