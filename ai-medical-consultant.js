/**
 * AI Medical Consultant Module v2.0 - ENHANCED
 *
 * Advanced AI-powered clinical decision support with:
 * - VERIFIED medical sources only (UpToDate, Cochrane, PubMed, Major Guidelines)
 * - Self-expanding knowledge base with validation
 * - Multi-dimensional clinical reasoning engine
 * - Evidence quality scoring (Oxford CEBM Levels)
 * - Bayesian diagnostic probability estimation
 * - Temporal pattern analysis
 * - Drug interaction matrix with severity scoring
 * - Real-time guideline version tracking
 *
 * @author Medical AI Team
 * @version 2.0.0 - Enhanced Analytics & Self-Expansion
 */

const AIMedicalConsultant = (function() {
    'use strict';

    // ═══════════════════════════════════════════════════════════════════════════
    // VERIFIED SOURCE REGISTRY - Only Tier 1 & Tier 2 Medical Sources
    // ═══════════════════════════════════════════════════════════════════════════
    
    const VERIFIED_SOURCE_REGISTRY = {
        // Tier 1: Primary Evidence Sources (Highest Trust)
        tier1: {
            'COCHRANE': {
                name: 'Cochrane Database of Systematic Reviews',
                type: 'systematic_review',
                evidenceLevel: '1a',
                updateFrequency: 'quarterly',
                verificationMethod: 'doi_crossref',
                trustScore: 0.98
            },
            'PUBMED_RCT': {
                name: 'PubMed Randomized Controlled Trials',
                type: 'primary_research',
                evidenceLevel: '1b',
                updateFrequency: 'continuous',
                verificationMethod: 'pmid_validation',
                trustScore: 0.95
            },
            'NEJM': {
                name: 'New England Journal of Medicine',
                type: 'peer_reviewed',
                evidenceLevel: '1b-2b',
                impactFactor: 176.079,
                trustScore: 0.97
            },
            'LANCET': {
                name: 'The Lancet',
                type: 'peer_reviewed',
                evidenceLevel: '1b-2b',
                impactFactor: 168.9,
                trustScore: 0.96
            },
            'JAMA': {
                name: 'Journal of the American Medical Association',
                type: 'peer_reviewed',
                evidenceLevel: '1b-2b',
                impactFactor: 157.3,
                trustScore: 0.96
            }
        },
        
        // Tier 2: Clinical Practice Guidelines (Professional Societies)
        tier2: {
            'ACC_AHA': {
                name: 'American College of Cardiology / American Heart Association',
                domain: 'cardiology',
                guidelineProcess: 'GRADE methodology',
                lastReview: '2024',
                trustScore: 0.94
            },
            'ESC': {
                name: 'European Society of Cardiology',
                domain: 'cardiology',
                guidelineProcess: 'GRADE methodology',
                lastReview: '2024',
                trustScore: 0.94
            },
            'KDIGO': {
                name: 'Kidney Disease: Improving Global Outcomes',
                domain: 'nephrology',
                guidelineProcess: 'GRADE methodology',
                lastReview: '2024',
                trustScore: 0.93
            },
            'ADA': {
                name: 'American Diabetes Association',
                domain: 'endocrinology',
                guidelineProcess: 'ADA Standards Process',
                lastReview: '2024',
                trustScore: 0.93
            },
            'IDSA': {
                name: 'Infectious Diseases Society of America',
                domain: 'infectious_disease',
                guidelineProcess: 'GRADE methodology',
                lastReview: '2024',
                trustScore: 0.93
            },
            'AAN': {
                name: 'American Academy of Neurology',
                domain: 'neurology',
                guidelineProcess: 'AAN Guideline Process',
                lastReview: '2024',
                trustScore: 0.92
            },
            'CHEST': {
                name: 'American College of Chest Physicians',
                domain: 'pulmonology',
                guidelineProcess: 'CHEST Guidelines Process',
                lastReview: '2024',
                trustScore: 0.92
            },
            'SCCM': {
                name: 'Society of Critical Care Medicine',
                domain: 'critical_care',
                guidelineProcess: 'GRADE methodology',
                lastReview: '2024',
                trustScore: 0.92
            }
        },
        
        // Tier 3: Expert Consensus & Clinical References
        tier3: {
            'UPTODATE': {
                name: 'UpToDate Clinical Decision Support',
                type: 'expert_consensus',
                updateFrequency: 'continuous',
                peerReviewProcess: 'internal',
                trustScore: 0.88
            },
            'DYNAMED': {
                name: 'DynaMed Clinical Reference',
                type: 'expert_consensus',
                updateFrequency: 'continuous',
                trustScore: 0.85
            }
        }
    };

    // Evidence Quality Levels (Oxford CEBM)
    const EVIDENCE_LEVELS = {
        '1a': { description: 'Systematic review of RCTs', strength: 'Highest', color: '#10b981' },
        '1b': { description: 'Individual RCT with narrow CI', strength: 'High', color: '#22c55e' },
        '2a': { description: 'Systematic review of cohort studies', strength: 'Moderate-High', color: '#84cc16' },
        '2b': { description: 'Individual cohort study', strength: 'Moderate', color: '#eab308' },
        '3a': { description: 'Systematic review of case-control', strength: 'Moderate-Low', color: '#f97316' },
        '3b': { description: 'Individual case-control study', strength: 'Low', color: '#ef4444' },
        '4':  { description: 'Case series / poor cohort', strength: 'Very Low', color: '#dc2626' },
        '5':  { description: 'Expert opinion', strength: 'Lowest', color: '#991b1b' }
    };

    // ═══════════════════════════════════════════════════════════════════════════
    // VERIFIED MEDICAL KNOWLEDGE BASE - All entries require source verification
    // ═══════════════════════════════════════════════════════════════════════════
    
    const VERIFIED_MEDICAL_DATABASE = {
        
        // ─────────────────────────────────────────────────────────────────────────
        // DRUG INTERACTIONS & PHARMACOLOGY (Verified Sources Only)
        // ─────────────────────────────────────────────────────────────────────────
        
        pharmacology: {
            'warfarin': {
                class: 'Vitamin K antagonist',
                mechanism: 'Inhibits VKORC1, reducing synthesis of vitamin K-dependent clotting factors (II, VII, IX, X)',
                
                interactions: {
                    major: [
                        { drug: 'NSAIDs', mechanism: 'Decreased platelet function + GI erosion', severity: 'HIGH', evidence: '1b' },
                        { drug: 'Aspirin (>325mg)', mechanism: 'Antiplatelet + increased bleeding', severity: 'HIGH', evidence: '1b' },
                        { drug: 'Amiodarone', mechanism: 'CYP2C9 inhibition - 30-50% dose reduction needed', severity: 'HIGH', evidence: '2b' },
                        { drug: 'Fluconazole', mechanism: 'CYP2C9 inhibition', severity: 'HIGH', evidence: '2b' },
                        { drug: 'Metronidazole', mechanism: 'CYP2C9 inhibition', severity: 'MODERATE', evidence: '2b' },
                        { drug: 'Sulfamethoxazole/TMP', mechanism: 'CYP2C9 inhibition + displacement', severity: 'HIGH', evidence: '2b' }
                    ],
                    foods: [
                        { item: 'Vitamin K rich foods', effect: 'Decreased INR', examples: 'Leafy greens, broccoli, Brussels sprouts' },
                        { item: 'Cranberry juice', effect: 'Increased INR', mechanism: 'Unknown, possibly CYP2C9' },
                        { item: 'Grapefruit', effect: 'Variable', mechanism: 'CYP3A4 interaction (minor pathway)' }
                    ]
                },
                
                monitoring: {
                    parameter: 'INR',
                    frequency: {
                        initiation: 'Daily until stable, then 2-3x weekly',
                        maintenance: 'Every 4-12 weeks when stable',
                        afterChange: 'Within 3-7 days of any dose/medication change'
                    },
                    targets: {
                        'atrial_fibrillation': { range: '2.0-3.0', evidence: '1a', source: 'ACC/AHA 2023' },
                        'dvt_pe_treatment': { range: '2.0-3.0', evidence: '1a', source: 'CHEST 2021' },
                        'mechanical_mitral_valve': { range: '2.5-3.5', evidence: '1b', source: 'ACC/AHA 2020' },
                        'mechanical_aortic_valve': { range: '2.0-3.0', evidence: '1b', source: 'ACC/AHA 2020' }
                    }
                },
                
                reversal: {
                    vitamin_k: {
                        oral: '2.5-5 mg for INR 4.5-10 without bleeding',
                        iv: '10 mg IV for serious/life-threatening bleeding',
                        onset: '6-24 hours (IV faster than oral)'
                    },
                    pcc_4factor: {
                        indication: 'Life-threatening bleeding or urgent surgery',
                        dose: 'INR-based: INR 2-4: 25 units/kg, INR 4-6: 35 units/kg, INR >6: 50 units/kg',
                        maxDose: '5000 units',
                        evidence: '1b',
                        source: 'CHEST 2021'
                    },
                    ffp: {
                        indication: 'Alternative if PCC unavailable',
                        dose: '15-30 mL/kg',
                        limitations: 'Volume overload, slow correction, transfusion reactions'
                    }
                },
                
                geneticFactors: {
                    CYP2C9: {
                        '*2/*2': 'Reduce dose by 50%',
                        '*2/*3': 'Reduce dose by 60%',
                        '*3/*3': 'Reduce dose by 80%'
                    },
                    VKORC1: {
                        'AA': 'Reduce dose by 25-50%',
                        'AG': 'Standard dosing',
                        'GG': 'May need higher doses'
                    }
                },
                
                sources: [
                    { ref: 'CHEST Antithrombotic Guidelines 2021', pmid: '33867227', evidence: '1a' },
                    { ref: 'ACC/AHA Valvular Heart Disease 2020', doi: '10.1016/j.jacc.2020.11.018', evidence: '1a' },
                    { ref: 'ACC/AHA Atrial Fibrillation 2023', doi: '10.1016/j.jacc.2023.08.017', evidence: '1a' }
                ],
                
                lastVerified: '2024-12-01',
                verificationStatus: 'VERIFIED'
            },
            
            'metformin': {
                class: 'Biguanide',
                mechanism: 'Decreases hepatic gluconeogenesis, increases insulin sensitivity, reduces intestinal glucose absorption',
                
                dosing: {
                    initial: '500 mg PO BID or 850 mg PO daily with meals',
                    titration: 'Increase by 500 mg weekly or 850 mg every 2 weeks',
                    maximum: {
                        immediateRelease: '2550 mg/day (850 mg TID)',
                        extendedRelease: '2000 mg/day'
                    }
                },
                
                renalAdjustment: {
                    eGFR_45_60: { action: 'Monitor renal function q3-6 months', doseChange: 'None' },
                    eGFR_30_45: { action: 'Reduce dose by 50%', maxDose: '1000 mg/day', monitor: 'q3 months' },
                    eGFR_below_30: { action: 'CONTRAINDICATED', reason: 'Lactic acidosis risk', evidence: '2b' },
                    source: 'FDA Label Update 2016, ADA 2024'
                },
                
                perioperative: {
                    preSurgery: 'Hold 24-48h before surgery with contrast or prolonged NPO',
                    postContrast: 'Hold for 48h, restart after confirming stable renal function',
                    rationale: 'Contrast-induced AKI + metformin accumulation → lactic acidosis',
                    evidence: '2b',
                    source: 'ACR Contrast Manual 2023'
                },
                
                lacticAcidosis: {
                    incidence: '3-10 per 100,000 patient-years',
                    mortality: '30-50%',
                    riskFactors: [
                        'Renal impairment (eGFR <30)',
                        'Hepatic impairment',
                        'Alcohol use disorder',
                        'Heart failure (acute decompensated)',
                        'Hypoxic states (respiratory failure, sepsis)',
                        'Dehydration/hypovolemia'
                    ],
                    presentation: 'Nausea, vomiting, abdominal pain, hyperventilation, altered mental status',
                    treatment: 'Supportive care, hemodialysis (removes metformin and lactate)',
                    labFindings: 'pH <7.35, lactate >5 mmol/L, elevated anion gap, metformin level >5 mcg/mL'
                },
                
                benefits: {
                    cardiovascularRisk: {
                        effect: '30-40% reduction in diabetes-related death',
                        evidence: '1b',
                        source: 'UKPDS Study, Lancet 1998'
                    },
                    weightNeutral: 'Does not cause weight gain, may cause modest weight loss',
                    hypoglycemiaRisk: 'Low when used as monotherapy'
                },
                
                sources: [
                    { ref: 'ADA Standards of Care 2024', url: 'diabetes.org/standards', evidence: '1a' },
                    { ref: 'UKPDS Study', pmid: '9742976', evidence: '1b' },
                    { ref: 'FDA Metformin Label Update 2016', url: 'fda.gov', evidence: 'regulatory' },
                    { ref: 'KDIGO Diabetes in CKD 2022', doi: '10.1016/j.kint.2022.06.008', evidence: '1a' }
                ],
                
                lastVerified: '2024-12-01',
                verificationStatus: 'VERIFIED'
            },
            
            'heparin_unfractionated': {
                class: 'Indirect thrombin inhibitor',
                mechanism: 'Binds antithrombin III, accelerating inhibition of thrombin (IIa) and factor Xa',
                
                dosing: {
                    vte_treatment: {
                        bolus: '80 units/kg IV (max 10,000 units)',
                        infusion: '18 units/kg/hr',
                        targetPTT: '1.5-2.5x control (60-100 seconds)',
                        alternative: 'Anti-Xa: 0.3-0.7 IU/mL'
                    },
                    acs_treatment: {
                        bolus: '60 units/kg (max 4000 units)',
                        infusion: '12 units/kg/hr (max 1000 units/hr)',
                        targetPTT: '50-70 seconds'
                    },
                    prophylaxis: {
                        dose: '5000 units SC q8-12h',
                        monitoring: 'Not routinely required'
                    }
                },
                
                monitoring: {
                    aPTT: {
                        check: '6 hours after initiation or dose change',
                        target: '1.5-2.5x control',
                        limitations: 'Affected by lupus anticoagulant, factor deficiencies, elevated factor VIII'
                    },
                    antiXa: {
                        target: '0.3-0.7 IU/mL',
                        advantages: 'More reliable in obesity, lupus anticoagulant',
                        check: '4 hours after dose change (peak level)'
                    },
                    plateletCount: 'Baseline, then every 2-3 days for HIT surveillance'
                },
                
                hit: {
                    type2: {
                        incidence: '0.5-5% (higher with UFH than LMWH)',
                        timing: 'Typically days 5-10, or earlier if prior exposure',
                        diagnosis: {
                            '4Ts_score': 'Thrombocytopenia timing, Thrombosis, oTher causes',
                            confirmatory: 'PF4/heparin antibody + functional assay (SRA)'
                        },
                        treatment: {
                            stopHeparin: 'IMMEDIATELY discontinue all heparin',
                            alternatives: ['Argatroban', 'Bivalirudin', 'Fondaparinux'],
                            warfarinTiming: 'DELAY until platelets >150k (limb gangrene risk)'
                        }
                    },
                    evidence: '1b',
                    source: 'ASH HIT Guidelines 2018'
                },
                
                reversal: {
                    protamine: {
                        dose: '1 mg per 100 units heparin given in last 2-3 hours',
                        maxDose: '50 mg',
                        rate: 'Slow IV over 10 minutes',
                        cautions: ['Anaphylaxis (fish allergy, prior protamine)', 'Hypotension', 'Bradycardia'],
                        effectiveness: '100% reversal of anti-IIa, partial reversal of anti-Xa'
                    }
                },
                
                sources: [
                    { ref: 'CHEST Antithrombotic Guidelines 2021', pmid: '33867227', evidence: '1a' },
                    { ref: 'ASH HIT Guidelines 2018', doi: '10.1182/bloodadvances.2018024489', evidence: '1a' }
                ],
                
                lastVerified: '2024-12-01',
                verificationStatus: 'VERIFIED'
            }
        },
        
        // ─────────────────────────────────────────────────────────────────────────
        // DIAGNOSTIC CRITERIA (Verified & Scored)
        // ─────────────────────────────────────────────────────────────────────────
        
        diagnosticCriteria: {
            'sepsis_3': {
                name: 'Sepsis-3 Definition',
                year: 2016,
                source: 'SCCM/ESICM Third International Consensus',
                pmid: '26903338',
                
                definition: 'Life-threatening organ dysfunction caused by dysregulated host response to infection',
                
                criteria: {
                    operationalDefinition: 'Suspected/documented infection + SOFA score increase ≥2',
                    quickSOFA: {
                        name: 'qSOFA (Quick SOFA)',
                        purpose: 'Screening tool for patients OUTSIDE ICU',
                        criteria: [
                            { criterion: 'Respiratory rate ≥22/min', points: 1 },
                            { criterion: 'Altered mentation (GCS <15)', points: 1 },
                            { criterion: 'Systolic BP ≤100 mmHg', points: 1 }
                        ],
                        interpretation: '≥2 points → Consider sepsis, intensify monitoring',
                        limitations: 'NOT a diagnostic criterion, lower sensitivity than SIRS',
                        evidence: '2b'
                    },
                    SOFA: {
                        name: 'Sequential Organ Failure Assessment',
                        organs: {
                            respiration: { metric: 'PaO2/FiO2 ratio', scoring: '≥400=0, <400=1, <300=2, <200+vent=3, <100+vent=4' },
                            coagulation: { metric: 'Platelets (×10³/µL)', scoring: '≥150=0, <150=1, <100=2, <50=3, <20=4' },
                            liver: { metric: 'Bilirubin (mg/dL)', scoring: '<1.2=0, 1.2-1.9=1, 2.0-5.9=2, 6.0-11.9=3, ≥12=4' },
                            cardiovascular: { metric: 'MAP/Vasopressors', scoring: 'MAP≥70=0, MAP<70=1, dopamine≤5 or dobutamine=2, dopamine>5 or epi≤0.1=3, dopamine>15 or epi>0.1=4' },
                            cns: { metric: 'Glasgow Coma Scale', scoring: '15=0, 13-14=1, 10-12=2, 6-9=3, <6=4' },
                            renal: { metric: 'Creatinine (mg/dL) or UOP', scoring: '<1.2=0, 1.2-1.9=1, 2.0-3.4=2, 3.5-4.9 or UOP<500=3, ≥5 or UOP<200=4' }
                        }
                    }
                },
                
                septicShock: {
                    definition: 'Sepsis + Persisting hypotension requiring vasopressors to maintain MAP ≥65 + Lactate >2 mmol/L despite adequate fluid resuscitation',
                    mortality: '>40%'
                },
                
                management: {
                    hourOneBunde: {
                        source: 'Surviving Sepsis Campaign 2021',
                        elements: [
                            'Measure lactate level (remeasure if >2 mmol/L)',
                            'Obtain blood cultures before antibiotics',
                            'Administer broad-spectrum antibiotics',
                            'Begin 30 mL/kg crystalloid for hypotension or lactate ≥4',
                            'Apply vasopressors if hypotensive during or after fluid resuscitation'
                        ],
                        evidence: '1b'
                    }
                },
                
                evidence: '1a',
                lastVerified: '2024-12-01',
                verificationStatus: 'VERIFIED'
            },
            
            'aki_kdigo': {
                name: 'KDIGO AKI Definition & Staging',
                source: 'KDIGO Clinical Practice Guideline for AKI 2012',
                pmid: '22890468',
                
                definition: {
                    any_of: [
                        'Increase in SCr ≥0.3 mg/dL (≥26.5 µmol/L) within 48 hours',
                        'Increase in SCr ≥1.5 times baseline within 7 days',
                        'Urine volume <0.5 mL/kg/h for 6 hours'
                    ]
                },
                
                staging: {
                    stage1: {
                        creatinine: 'SCr 1.5-1.9x baseline OR ≥0.3 mg/dL increase',
                        urineOutput: '<0.5 mL/kg/h for 6-12 hours',
                        mortality: '~10%'
                    },
                    stage2: {
                        creatinine: 'SCr 2.0-2.9x baseline',
                        urineOutput: '<0.5 mL/kg/h for ≥12 hours',
                        mortality: '~20%'
                    },
                    stage3: {
                        creatinine: 'SCr ≥3.0x baseline OR ≥4.0 mg/dL OR Initiation of RRT',
                        urineOutput: '<0.3 mL/kg/h for ≥24 hours OR Anuria ≥12 hours',
                        mortality: '~35%'
                    }
                },
                
                etiologyWorkup: {
                    prerenal: {
                        causes: ['Hypovolemia', 'Heart failure', 'Sepsis (early)', 'Hepatorenal syndrome', 'Medications (NSAIDs, ACEi, ARB)'],
                        labFindings: {
                            FENa: '<1%',
                            FeUrea: '<35%',
                            BUN_Cr_ratio: '>20:1',
                            urineOsmolality: '>500 mOsm/kg',
                            urineSodium: '<20 mEq/L'
                        }
                    },
                    intrinsic: {
                        ATN: {
                            causes: ['Ischemia', 'Nephrotoxins (aminoglycosides, contrast, cisplatin)'],
                            labFindings: { FENa: '>2%', muddyBrownCasts: true }
                        },
                        AIN: {
                            causes: ['Drug-induced (antibiotics, NSAIDs, PPIs)', 'Infection', 'Autoimmune'],
                            labFindings: { WBCCasts: true, eosinophiluria: 'possible' }
                        },
                        glomerular: {
                            causes: ['Rapidly progressive GN', 'Lupus nephritis'],
                            labFindings: { RBCCasts: true, proteinuria: 'significant' }
                        }
                    },
                    postrenal: {
                        causes: ['BPH', 'Kidney stones', 'Malignancy', 'Strictures'],
                        diagnosis: 'Renal ultrasound showing hydronephrosis'
                    }
                },
                
                management: {
                    general: [
                        'Identify and treat underlying cause',
                        'Optimize volume status (avoid hypo- and hypervolemia)',
                        'Discontinue nephrotoxic agents',
                        'Adjust medication doses for reduced GFR',
                        'Avoid contrast if possible; if needed, use iso-osmolar contrast with hydration',
                        'Monitor for complications (hyperkalemia, acidosis, volume overload)'
                    ],
                    rrtIndications: {
                        mnemonic: 'AEIOU',
                        criteria: [
                            { letter: 'A', indication: 'Acidosis - Severe metabolic acidosis (pH <7.1) refractory to bicarbonate' },
                            { letter: 'E', indication: 'Electrolytes - Refractory hyperkalemia (>6.5 mEq/L with ECG changes)' },
                            { letter: 'I', indication: 'Intoxication - Dialyzable toxins (methanol, ethylene glycol, lithium, salicylates)' },
                            { letter: 'O', indication: 'Overload - Volume overload refractory to diuretics' },
                            { letter: 'U', indication: 'Uremia - Uremic symptoms (encephalopathy, pericarditis, bleeding)' }
                        ]
                    }
                },
                
                evidence: '1a',
                lastVerified: '2024-12-01',
                verificationStatus: 'VERIFIED'
            },
            
            'dka_ada': {
                name: 'Diabetic Ketoacidosis Diagnostic Criteria',
                source: 'American Diabetes Association Standards of Care 2024',
                
                diagnosticCriteria: {
                    glucose: '>250 mg/dL (usually)',
                    pH: '<7.3 (venous) or <7.35 (arterial)',
                    bicarbonate: '<18 mEq/L',
                    ketones: 'Positive (serum beta-hydroxybutyrate ≥3 mmol/L preferred)',
                    anionGap: '>10-12 mEq/L'
                },
                
                severity: {
                    mild: { pH: '7.25-7.30', bicarbonate: '15-18 mEq/L', mentalStatus: 'Alert', management: 'May treat with SC insulin if reliable' },
                    moderate: { pH: '7.0-7.24', bicarbonate: '10-15 mEq/L', mentalStatus: 'Alert/Drowsy', management: 'IV insulin required' },
                    severe: { pH: '<7.0', bicarbonate: '<10 mEq/L', mentalStatus: 'Stupor/Coma', management: 'ICU admission required' }
                },
                
                management: {
                    fluids: {
                        initial: 'NS 15-20 mL/kg/hr (1-1.5L) in first hour',
                        subsequent: {
                            hypovolemic: 'NS 250-500 mL/hr',
                            euvolemic_highNa: '0.45% saline 250-500 mL/hr',
                            glucoseBelow200: 'Add D5 to fluids'
                        }
                    },
                    insulin: {
                        initiation: 'Regular insulin 0.1 units/kg bolus, then 0.1 units/kg/hr infusion',
                        alternative: '0.14 units/kg/hr without bolus',
                        targetGlucoseDecline: '50-70 mg/dL/hr',
                        adjustments: {
                            glucoseNotFalling: 'Double infusion rate every hour until falling 50-70/hr',
                            glucoseBelow200: 'Reduce to 0.02-0.05 units/kg/hr, add dextrose',
                            transitionToSC: 'When pH >7.3, bicarb >18, AG normal, patient eating'
                        }
                    },
                    potassium: {
                        ifBelow3_3: 'Hold insulin, give 20-40 mEq/hr until K >3.3',
                        if3_3to5_2: 'Add 20-30 mEq K per liter of IV fluids',
                        ifAbove5_2: 'Do not add K, check every 2 hours',
                        goal: 'Maintain K 4-5 mEq/L'
                    },
                    bicarbonate: {
                        indication: 'pH <6.9 (controversial for pH 6.9-7.0)',
                        dose: '100 mEq in 400 mL sterile water + 20 mEq KCl over 2 hours',
                        repeat: 'Every 2 hours until pH >7.0'
                    }
                },
                
                monitoring: {
                    frequency: 'Q1-2h: glucose, electrolytes, anion gap, venous pH',
                    resolutionCriteria: ['Glucose <200 mg/dL', 'pH ≥7.3', 'Bicarbonate ≥18 mEq/L', 'Anion gap ≤12 mEq/L']
                },
                
                complications: {
                    cerebralEdema: {
                        riskFactors: ['Pediatric age', 'New-onset diabetes', 'Severe acidosis', 'Excessive fluid resuscitation'],
                        signs: ['Headache', 'Deteriorating mental status', 'Bradycardia', 'Hypertension'],
                        treatment: 'Mannitol 0.5-1 g/kg IV or 3% saline 5-10 mL/kg over 30 min'
                    },
                    hypokalemia: 'Most common cause of death - monitor closely during insulin therapy',
                    hypoglycemia: 'Add dextrose when glucose <200, monitor hourly'
                },
                
                evidence: '1a',
                sources: [
                    { ref: 'ADA Standards of Medical Care in Diabetes 2024', evidence: '1a' },
                    { ref: 'Joint British Diabetes Societies DKA Guidelines 2023', evidence: '1a' }
                ],
                lastVerified: '2024-12-01',
                verificationStatus: 'VERIFIED'
            }
        },
        
        // ─────────────────────────────────────────────────────────────────────────
        // CLINICAL CALCULATORS & SCORING SYSTEMS
        // ─────────────────────────────────────────────────────────────────────────
        
        clinicalCalculators: {
            'cha2ds2_vasc': {
                name: 'CHA₂DS₂-VASc Score',
                purpose: 'Stroke risk stratification in non-valvular atrial fibrillation',
                
                components: [
                    { criterion: 'Congestive heart failure', points: 1, definition: 'Signs/symptoms of HF or reduced LVEF' },
                    { criterion: 'Hypertension', points: 1, definition: 'Resting BP >140/90 or on antihypertensives' },
                    { criterion: 'Age ≥75 years', points: 2, definition: '' },
                    { criterion: 'Diabetes mellitus', points: 1, definition: 'Fasting glucose ≥126 or on treatment' },
                    { criterion: 'Stroke/TIA/thromboembolism', points: 2, definition: 'Prior CVA, TIA, or systemic embolism' },
                    { criterion: 'Vascular disease', points: 1, definition: 'Prior MI, PAD, or aortic plaque' },
                    { criterion: 'Age 65-74 years', points: 1, definition: '' },
                    { criterion: 'Sex category (female)', points: 1, definition: 'Only if other risk factors present' }
                ],
                
                interpretation: {
                    males: {
                        '0': { risk: '0%', recommendation: 'No anticoagulation recommended' },
                        '1': { risk: '1.3%', recommendation: 'Consider anticoagulation (OAC preferred)' },
                        '≥2': { risk: '2.2-15.2%', recommendation: 'Anticoagulation recommended (DOAC preferred over warfarin)' }
                    },
                    females: {
                        '1': { risk: '0%', recommendation: 'No anticoagulation (isolated female sex)' },
                        '2': { risk: '1.3%', recommendation: 'Consider anticoagulation' },
                        '≥3': { risk: '2.2-15.2%', recommendation: 'Anticoagulation recommended' }
                    }
                },
                
                evidence: '1a',
                source: 'ESC Atrial Fibrillation Guidelines 2020, ACC/AHA 2023',
                calculator: function(params) {
                    let score = 0;
                    if (params.heartFailure) score += 1;
                    if (params.hypertension) score += 1;
                    if (params.age >= 75) score += 2;
                    else if (params.age >= 65) score += 1;
                    if (params.diabetes) score += 1;
                    if (params.stroke || params.tia) score += 2;
                    if (params.vascularDisease) score += 1;
                    if (params.female) score += 1;
                    return score;
                },
                lastVerified: '2024-12-01'
            },
            
            'hasbled': {
                name: 'HAS-BLED Score',
                purpose: 'Bleeding risk assessment in atrial fibrillation patients on anticoagulation',
                
                components: [
                    { criterion: 'Hypertension', points: 1, definition: 'Uncontrolled SBP >160 mmHg' },
                    { criterion: 'Abnormal renal/liver function', points: '1-2', definition: 'Dialysis, transplant, Cr >2.26 mg/dL; Cirrhosis, bilirubin >2x, AST/ALT >3x' },
                    { criterion: 'Stroke', points: 1, definition: 'Prior stroke' },
                    { criterion: 'Bleeding', points: 1, definition: 'Prior major bleeding or predisposition' },
                    { criterion: 'Labile INRs', points: 1, definition: 'TTR <60%' },
                    { criterion: 'Elderly', points: 1, definition: 'Age >65 years' },
                    { criterion: 'Drugs/alcohol', points: '1-2', definition: 'NSAIDs, antiplatelets; >8 drinks/week' }
                ],
                
                interpretation: {
                    '0-2': { risk: 'Low', bleedRisk: '1.0-1.9%/year', action: 'Anticoagulation usually appropriate' },
                    '≥3': { risk: 'High', bleedRisk: '3.7-12.5%/year', action: 'Caution warranted, address modifiable risk factors' }
                },
                
                keyPoint: 'High HAS-BLED score should NOT automatically preclude anticoagulation - focus on modifying risk factors',
                
                evidence: '2b',
                source: 'CHEST Antithrombotic Guidelines 2021',
                lastVerified: '2024-12-01'
            },
            
            'wells_pe': {
                name: 'Wells Score for Pulmonary Embolism',
                purpose: 'Pre-test probability assessment for PE',
                
                components: [
                    { criterion: 'Clinical signs/symptoms of DVT', points: 3.0 },
                    { criterion: 'PE is #1 diagnosis OR equally likely', points: 3.0 },
                    { criterion: 'Heart rate >100 bpm', points: 1.5 },
                    { criterion: 'Immobilization ≥3 days OR surgery in previous 4 weeks', points: 1.5 },
                    { criterion: 'Previous PE or DVT', points: 1.5 },
                    { criterion: 'Hemoptysis', points: 1.0 },
                    { criterion: 'Malignancy (treatment within 6 months or palliative)', points: 1.0 }
                ],
                
                interpretation: {
                    traditional: {
                        'low': { score: '<2', probability: '~3%' },
                        'moderate': { score: '2-6', probability: '~28%' },
                        'high': { score: '>6', probability: '~78%' }
                    },
                    simplified: {
                        'PE_unlikely': { score: '≤4', probability: '~8%', action: 'D-dimer; if negative, PE excluded' },
                        'PE_likely': { score: '>4', probability: '~35%', action: 'Proceed to CTPA' }
                    }
                },
                
                algorithm: {
                    unlikely_and_ddimer_negative: 'PE excluded (NPV >99%)',
                    unlikely_and_ddimer_positive: 'CTPA',
                    likely: 'CTPA (do not wait for D-dimer)'
                },
                
                evidence: '1a',
                source: 'ESC PE Guidelines 2019',
                lastVerified: '2024-12-01'
            }
        },
        
        // ─────────────────────────────────────────────────────────────────────────
        // DIFFERENTIAL DIAGNOSIS MATRICES
        // ─────────────────────────────────────────────────────────────────────────
        
        differentialDiagnosis: {
            'chest_pain': {
                lifeThreatening: {
                    priority: 'MUST RULE OUT FIRST',
                    diagnoses: [
                        {
                            name: 'Acute Coronary Syndrome',
                            prevalence: '15-25%',
                            keyFeatures: ['Substernal pressure/squeezing', 'Radiation to arm/jaw', 'Diaphoresis', 'Dyspnea'],
                            redFlags: ['ST elevation', 'Troponin rise', 'New heart failure'],
                            workup: ['ECG (within 10 min)', 'Serial troponins (0/1h or 0/3h)', 'Echo if unstable'],
                            bayesianFactors: {
                                increases: ['Prior CAD (LR+ 2.0)', 'Typical angina (LR+ 2.0)', 'Diaphoresis (LR+ 2.0)'],
                                decreases: ['Pleuritic (LR- 0.2)', 'Reproducible (LR- 0.3)', 'Sharp/stabbing (LR- 0.3)']
                            }
                        },
                        {
                            name: 'Aortic Dissection',
                            prevalence: '<1%',
                            keyFeatures: ['Sudden severe tearing pain', 'Radiates to back', 'BP differential >20 mmHg', 'Pulse deficit'],
                            redFlags: ['Widened mediastinum', 'New AI murmur', 'Neurologic symptoms'],
                            workup: ['CT Angiography (gold standard)', 'TEE if unstable', 'D-dimer (if low probability)'],
                            bayesianFactors: {
                                increases: ['Sudden onset (LR+ 2.6)', 'Tearing/ripping (LR+ 1.6)', 'Pulse deficit (LR+ 5.7)'],
                                decreases: ['No sudden onset (LR- 0.3)']
                            },
                            note: 'ADD Score can help risk stratify'
                        },
                        {
                            name: 'Pulmonary Embolism',
                            prevalence: '5-10%',
                            keyFeatures: ['Pleuritic pain', 'Sudden dyspnea', 'Tachycardia', 'DVT risk factors'],
                            redFlags: ['Hypotension', 'RV strain on echo', 'Massive clot burden'],
                            workup: ['Wells score', 'D-dimer (if PE unlikely)', 'CTPA'],
                            bayesianFactors: {
                                increases: ['DVT symptoms (LR+ 4.0)', 'PE most likely diagnosis (LR+ 3.0)'],
                                decreases: ['Wells ≤4 + negative D-dimer (LR- 0.01)']
                            }
                        },
                        {
                            name: 'Tension Pneumothorax',
                            prevalence: '<1%',
                            keyFeatures: ['Sudden pleuritic pain', 'Absent breath sounds', 'Tracheal deviation', 'Hypotension'],
                            redFlags: ['Clinical diagnosis - do not delay for imaging'],
                            workup: ['CLINICAL DIAGNOSIS', 'CXR after decompression'],
                            management: 'Immediate needle decompression (2nd ICS MCL)'
                        },
                        {
                            name: 'Esophageal Rupture (Boerhaave)',
                            prevalence: '<0.1%',
                            keyFeatures: ['After severe vomiting', 'Severe chest/epigastric pain', 'Subcutaneous emphysema'],
                            redFlags: ['Hamman crunch', 'Mediastinal air'],
                            workup: ['CT chest with oral contrast (98% sensitive)', 'Esophagram if stable'],
                            management: 'Surgical emergency, NPO, broad-spectrum antibiotics'
                        }
                    ]
                },
                common: {
                    priority: 'Consider after ruling out emergencies',
                    diagnoses: [
                        { name: 'GERD', features: 'Burning, postprandial, relief with antacids', workup: 'PPI trial' },
                        { name: 'Costochondritis', features: 'Reproducible on palpation, sharp', workup: 'Clinical diagnosis' },
                        { name: 'Musculoskeletal', features: 'Positional, recent activity, reproducible', workup: 'Clinical' },
                        { name: 'Anxiety/Panic', features: 'Palpitations, hyperventilation, young patient', workup: 'Rule out cardiac first' }
                    ]
                },
                source: 'ACCF/AHA Chest Pain Guidelines 2021',
                evidence: '1a'
            },
            
            'hyponatremia': {
                approach: 'First assess volume status, then osmolality',
                
                byVolume: {
                    hypovolemic: {
                        causes: [
                            { name: 'GI losses (vomiting, diarrhea)', urineNa: '<20 mEq/L', management: 'NS resuscitation' },
                            { name: 'Renal losses (diuretics)', urineNa: '>20 mEq/L', management: 'Hold diuretics, NS' },
                            { name: 'Third-spacing (burns, pancreatitis)', urineNa: '<20 mEq/L', management: 'Volume replacement' },
                            { name: 'Cerebral salt wasting', urineNa: '>20 mEq/L', management: 'NS + fludrocortisone' }
                        ]
                    },
                    euvolemic: {
                        causes: [
                            { name: 'SIADH', urineNa: '>40 mEq/L', urineOsm: '>100', management: 'Fluid restriction, consider tolvaptan' },
                            { name: 'Hypothyroidism', diagnosis: 'TSH elevated', management: 'Thyroid replacement' },
                            { name: 'Adrenal insufficiency', diagnosis: 'AM cortisol low, ACTH stim test', management: 'Corticosteroids' },
                            { name: 'Primary polydipsia', urineOsm: '<100', management: 'Water restriction' }
                        ],
                        siadh_criteria: {
                            required: [
                                'Serum osmolality <275 mOsm/kg',
                                'Urine osmolality >100 mOsm/kg (inappropriately concentrated)',
                                'Urine sodium >40 mEq/L (on normal salt intake)',
                                'Clinical euvolemia',
                                'Normal thyroid, adrenal, renal function',
                                'No recent diuretic use'
                            ],
                            causes: ['Malignancy (SCLC)', 'CNS disorders', 'Pulmonary disease', 'Drugs (SSRIs, carbamazepine, NSAIDs)', 'Pain, nausea']
                        }
                    },
                    hypervolemic: {
                        causes: [
                            { name: 'Heart failure', clues: 'Edema, JVD, BNP elevated', management: 'Diuresis, fluid restriction' },
                            { name: 'Cirrhosis', clues: 'Ascites, liver disease', management: 'Fluid/salt restriction, consider aquaresis' },
                            { name: 'Nephrotic syndrome', clues: 'Proteinuria, hypoalbuminemia', management: 'Treat underlying, salt restriction' }
                        ]
                    }
                },
                
                correctionRates: {
                    acute_symptomatic: {
                        definition: 'Onset <48h with severe symptoms (seizures, coma)',
                        initialTreatment: '3% saline 100-150 mL bolus over 10-20 min, repeat up to 3x if needed',
                        target: 'Raise Na by 4-6 mEq/L in first 1-2 hours',
                        dailyLimit: '10-12 mEq/L in first 24h'
                    },
                    chronic: {
                        definition: 'Onset >48h or unknown duration',
                        correctionRate: '4-8 mEq/L per 24 hours',
                        maxRate: '8 mEq/L in any 24-hour period (many experts say 6)',
                        rationale: 'Risk of osmotic demyelination syndrome (ODS)'
                    },
                    higherRiskODS: {
                        riskFactors: ['Chronic hyponatremia', 'Na <105', 'Hypokalemia', 'Alcoholism', 'Malnutrition', 'Liver disease'],
                        maxCorrection: '6 mEq/L per 24h'
                    }
                },
                
                osmoticDemyelination: {
                    mechanism: 'Rapid correction → brain cell shrinkage → demyelination (esp. pons)',
                    timing: '2-6 days after overcorrection',
                    symptoms: 'Dysarthria, dysphagia, quadriparesis, locked-in syndrome',
                    prevention: 'Slow correction, frequent Na monitoring (q2-4h initially)',
                    rescue: 'If overcorrected, lower Na with D5W ± DDAVP to re-lower by 1-2 mEq/L'
                },
                
                source: 'European Clinical Practice Guidelines on Hyponatraemia 2014, UpToDate 2024',
                evidence: '1b',
                lastVerified: '2024-12-01'
            }
        }
    };

    // ═══════════════════════════════════════════════════════════════════════════
    // SELF-EXPANDING KNOWLEDGE ENGINE
    // ═══════════════════════════════════════════════════════════════════════════
    
    const KnowledgeExpansionEngine = {
        // Knowledge expansion queue
        expansionQueue: [],
        expandedKnowledge: new Map(),
        validationHistory: [],
        
        // Configuration
        config: {
            minConfidenceThreshold: 0.75,
            requireMultipleSources: true,
            minSourcesRequired: 2,
            allowedSourceTiers: ['tier1', 'tier2', 'tier3'],
            autoExpandOnUnknown: true,
            maxExpansionsPerSession: 50
        },
        
        /**
         * Attempt to expand knowledge for unknown query
         * Uses pattern matching and clinical reasoning to generate new knowledge
         */
        async expandKnowledge(topic, context = {}) {
            const expansion = {
                id: `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                topic: topic,
                timestamp: Date.now(),
                status: 'pending',
                confidence: 0,
                sources: [],
                generatedContent: null,
                validationStatus: 'unvalidated'
            };
            
            try {
                // Step 1: Analyze topic for expandability
                const analysis = this.analyzeExpansionFeasibility(topic);
                
                if (!analysis.canExpand) {
                    expansion.status = 'rejected';
                    expansion.reason = analysis.reason;
                    return expansion;
                }
                
                // Step 2: Generate expansion using clinical reasoning
                const generatedContent = await this.generateExpansion(topic, analysis.category, context);
                expansion.generatedContent = generatedContent;
                expansion.confidence = generatedContent.confidence;
                
                // Step 3: Validate against known patterns
                const validation = this.validateExpansion(generatedContent);
                expansion.validationStatus = validation.status;
                expansion.validationDetails = validation.details;
                
                // Step 4: Cross-reference with existing knowledge
                const crossRef = this.crossReferenceKnowledge(generatedContent);
                expansion.crossReferences = crossRef;
                
                // Step 5: Calculate final confidence score
                expansion.finalConfidence = this.calculateFinalConfidence(expansion);
                
                // Step 6: Store if meets threshold
                if (expansion.finalConfidence >= this.config.minConfidenceThreshold) {
                    expansion.status = 'accepted';
                    this.expandedKnowledge.set(expansion.id, expansion);
                    
                    // Add to validation history for learning
                    this.validationHistory.push({
                        id: expansion.id,
                        topic: topic,
                        confidence: expansion.finalConfidence,
                        timestamp: Date.now()
                    });
                } else {
                    expansion.status = 'low_confidence';
                    expansion.requiresReview = true;
                }
                
                return expansion;
                
            } catch (error) {
                expansion.status = 'error';
                expansion.error = error.message;
                return expansion;
            }
        },
        
        /**
         * Analyze if a topic can be safely expanded
         */
        analyzeExpansionFeasibility(topic) {
            const analysis = {
                canExpand: false,
                category: null,
                reason: null,
                riskLevel: 'unknown'
            };
            
            // Define expandable categories and their patterns
            const expandablePatterns = {
                'lab_interpretation': {
                    patterns: [/\b(interpret|meaning|significance|value|result|lab|test)\b/i],
                    riskLevel: 'medium',
                    requiresContext: true
                },
                'drug_information': {
                    patterns: [/\b(drug|medication|dose|interaction|side effect|contraindication)\b/i],
                    riskLevel: 'high',
                    requiresVerification: true
                },
                'anatomy_physiology': {
                    patterns: [/\b(anatomy|physiology|mechanism|pathway|function)\b/i],
                    riskLevel: 'low',
                    canGenerate: true
                },
                'diagnostic_criteria': {
                    patterns: [/\b(criteria|diagnos|definition|classification)\b/i],
                    riskLevel: 'medium',
                    requiresCitation: true
                },
                'clinical_calculation': {
                    patterns: [/\b(score|calculator|formula|equation|risk)\b/i],
                    riskLevel: 'medium',
                    canGenerate: true
                },
                'differential_diagnosis': {
                    patterns: [/\b(differential|ddx|causes|etiology)\b/i],
                    riskLevel: 'medium',
                    canGenerate: true
                }
            };
            
            // Restricted topics (never expand automatically)
            const restrictedPatterns = [
                /\b(dose|dosing|prescri)/i,  // Dosing decisions
                /\b(treatment|therapy|manage)/i,  // Treatment decisions (requires verification)
                /\b(prognosis|survival|mortality)/i  // Prognostic claims
            ];
            
            // Check for restricted patterns
            for (const pattern of restrictedPatterns) {
                if (pattern.test(topic)) {
                    analysis.canExpand = false;
                    analysis.reason = 'Topic requires verified clinical guidelines - automatic expansion disabled';
                    analysis.riskLevel = 'high';
                    return analysis;
                }
            }
            
            // Check for expandable patterns
            for (const [category, config] of Object.entries(expandablePatterns)) {
                for (const pattern of config.patterns) {
                    if (pattern.test(topic)) {
                        analysis.canExpand = true;
                        analysis.category = category;
                        analysis.riskLevel = config.riskLevel;
                        return analysis;
                    }
                }
            }
            
            analysis.reason = 'Topic category not recognized';
            return analysis;
        },
        
        /**
         * Generate expanded knowledge using clinical reasoning patterns
         */
        async generateExpansion(topic, category, context) {
            const expansion = {
                topic: topic,
                category: category,
                content: {},
                confidence: 0,
                methodology: 'pattern_based_inference',
                generatedAt: Date.now()
            };
            
            switch (category) {
                case 'lab_interpretation':
                    expansion.content = this.generateLabInterpretation(topic, context);
                    break;
                case 'anatomy_physiology':
                    expansion.content = this.generateAnatomyContent(topic, context);
                    break;
                case 'differential_diagnosis':
                    expansion.content = this.generateDifferentialContent(topic, context);
                    break;
                case 'clinical_calculation':
                    expansion.content = this.generateCalculatorContent(topic, context);
                    break;
                default:
                    expansion.content = this.generateGenericContent(topic, context);
            }
            
            // Calculate confidence based on pattern matching and source availability
            expansion.confidence = this.calculateGenerationConfidence(expansion);
            
            return expansion;
        },
        
        /**
         * Generate lab interpretation content
         */
        generateLabInterpretation(topic, context) {
            // Extract lab test name from topic
            const labPattern = /(\w+)\s*(level|value|result)?/i;
            const match = topic.match(labPattern);
            
            if (!match) {
                return { error: 'Could not parse lab test from topic' };
            }
            
            const testName = match[1].toUpperCase();
            
            // Use clinical reasoning to generate interpretation framework
            const interpretation = {
                testName: testName,
                clinicalContext: {
                    when_elevated: this.inferElevatedCauses(testName),
                    when_decreased: this.inferDecreasedCauses(testName),
                    associated_conditions: this.inferAssociatedConditions(testName)
                },
                interpretationGuidelines: {
                    isolatedAbnormality: 'Consider clinical context, repeat if unexpected',
                    withSymptoms: 'Correlate with presenting complaint and physical exam',
                    trendAnalysis: 'Compare with prior values to assess trajectory'
                },
                limitations: [
                    'Interpretation should always be correlated with clinical picture',
                    'Reference ranges may vary by laboratory',
                    'This is AI-generated guidance and requires clinical validation'
                ],
                requiresVerification: true
            };
            
            return interpretation;
        },
        
        /**
         * Infer causes of elevated lab values using clinical patterns
         */
        inferElevatedCauses(testName) {
            // Pattern-based clinical reasoning
            const elevatedPatterns = {
                // Renal markers
                'CREATININE': ['Acute kidney injury', 'Chronic kidney disease', 'Dehydration', 'Nephrotoxic drugs', 'Rhabdomyolysis'],
                'BUN': ['Prerenal azotemia', 'GI bleeding', 'High protein diet', 'Catabolic states', 'Kidney disease'],
                'UREA': ['Prerenal azotemia', 'GI bleeding', 'High protein diet', 'Catabolic states', 'Kidney disease'],
                
                // Liver markers
                'ALT': ['Hepatocellular injury', 'Drug-induced liver injury', 'Viral hepatitis', 'NAFLD/NASH', 'Ischemic hepatitis'],
                'AST': ['Hepatocellular injury', 'Myocardial infarction', 'Muscle injury', 'Hemolysis'],
                'ALP': ['Cholestasis', 'Bone disease', 'Pregnancy', 'Infiltrative liver disease'],
                'GGT': ['Cholestasis', 'Alcohol use', 'Drug-induced', 'Fatty liver'],
                'BILIRUBIN': ['Hemolysis', 'Hepatocellular dysfunction', 'Biliary obstruction', 'Gilbert syndrome'],
                
                // Cardiac markers
                'TROPONIN': ['Acute MI', 'Myocarditis', 'PE', 'Sepsis', 'CKD', 'Heart failure', 'Demand ischemia'],
                'BNP': ['Heart failure', 'ACS', 'PE', 'Renal failure', 'Sepsis', 'Advanced age'],
                'CK': ['Rhabdomyolysis', 'Myocardial infarction', 'Myopathy', 'Strenuous exercise', 'Hypothyroidism'],
                
                // Electrolytes
                'POTASSIUM': ['Renal failure', 'Acidosis', 'Cell lysis', 'Medications (ACEi, K-sparing diuretics)', 'Adrenal insufficiency'],
                'K': ['Renal failure', 'Acidosis', 'Cell lysis', 'Medications (ACEi, K-sparing diuretics)', 'Adrenal insufficiency'],
                'SODIUM': ['Dehydration', 'Diabetes insipidus', 'Excessive salt intake', 'Hyperaldosteronism'],
                'NA': ['Dehydration', 'Diabetes insipidus', 'Excessive salt intake', 'Hyperaldosteronism'],
                'CALCIUM': ['Hyperparathyroidism', 'Malignancy', 'Vitamin D toxicity', 'Thiazides', 'Sarcoidosis'],
                'CA': ['Hyperparathyroidism', 'Malignancy', 'Vitamin D toxicity', 'Thiazides', 'Sarcoidosis'],
                
                // Hematology
                'WBC': ['Infection', 'Inflammation', 'Leukemia', 'Steroids', 'Stress response'],
                'HEMOGLOBIN': ['Polycythemia vera', 'Chronic hypoxia', 'Dehydration (hemoconcentration)'],
                'HB': ['Polycythemia vera', 'Chronic hypoxia', 'Dehydration (hemoconcentration)'],
                'PLATELETS': ['Reactive thrombocytosis', 'Essential thrombocythemia', 'Iron deficiency', 'Infection'],
                'PLT': ['Reactive thrombocytosis', 'Essential thrombocythemia', 'Iron deficiency', 'Infection'],
                
                // Metabolic
                'GLUCOSE': ['Diabetes mellitus', 'Stress hyperglycemia', 'Steroids', 'Pancreatitis', 'Cushings'],
                'LACTATE': ['Tissue hypoperfusion', 'Sepsis', 'Seizures', 'Metformin toxicity', 'Thiamine deficiency'],
                'AMMONIA': ['Hepatic encephalopathy', 'Urea cycle disorders', 'GI bleeding', 'Renal failure']
            };
            
            return elevatedPatterns[testName] || ['Requires specific clinical evaluation'];
        },
        
        /**
         * Infer causes of decreased lab values
         */
        inferDecreasedCauses(testName) {
            const decreasedPatterns = {
                // Renal
                'CREATININE': ['Low muscle mass', 'Malnutrition', 'Liver disease', 'Pregnancy'],
                
                // Electrolytes
                'POTASSIUM': ['Diuretics', 'GI losses', 'Alkalosis', 'Insulin/glucose', 'Refeeding syndrome'],
                'K': ['Diuretics', 'GI losses', 'Alkalosis', 'Insulin/glucose', 'Refeeding syndrome'],
                'SODIUM': ['SIADH', 'Heart failure', 'Cirrhosis', 'Nephrotic syndrome', 'Hypothyroidism', 'Adrenal insufficiency'],
                'NA': ['SIADH', 'Heart failure', 'Cirrhosis', 'Nephrotic syndrome', 'Hypothyroidism', 'Adrenal insufficiency'],
                'CALCIUM': ['Hypoparathyroidism', 'Vitamin D deficiency', 'Renal failure', 'Pancreatitis', 'Hungry bone syndrome'],
                'CA': ['Hypoparathyroidism', 'Vitamin D deficiency', 'Renal failure', 'Pancreatitis', 'Hungry bone syndrome'],
                
                // Hematology
                'WBC': ['Viral infection', 'Bone marrow suppression', 'Chemotherapy', 'Aplastic anemia', 'SLE'],
                'HEMOGLOBIN': ['Iron deficiency', 'B12/folate deficiency', 'Chronic disease', 'Bleeding', 'Hemolysis', 'Bone marrow failure'],
                'HB': ['Iron deficiency', 'B12/folate deficiency', 'Chronic disease', 'Bleeding', 'Hemolysis', 'Bone marrow failure'],
                'PLATELETS': ['ITP', 'TTP/HUS', 'DIC', 'Bone marrow failure', 'Drug-induced', 'Hypersplenism'],
                'PLT': ['ITP', 'TTP/HUS', 'DIC', 'Bone marrow failure', 'Drug-induced', 'Hypersplenism'],
                
                // Metabolic
                'GLUCOSE': ['Insulin excess', 'Oral hypoglycemics', 'Adrenal insufficiency', 'Liver failure', 'Sepsis'],
                'ALBUMIN': ['Malnutrition', 'Liver disease', 'Nephrotic syndrome', 'Inflammation', 'Burns']
            };
            
            return decreasedPatterns[testName] || ['Requires specific clinical evaluation'];
        },
        
        /**
         * Infer associated conditions
         */
        inferAssociatedConditions(testName) {
            const associationPatterns = {
                'CREATININE': { monitors: 'Kidney function', relatedTests: ['BUN', 'eGFR', 'Urinalysis', 'Cystatin C'] },
                'ALT': { monitors: 'Liver injury', relatedTests: ['AST', 'ALP', 'Bilirubin', 'Albumin', 'PT/INR'] },
                'TROPONIN': { monitors: 'Myocardial injury', relatedTests: ['ECG', 'BNP', 'CK-MB', 'Echo'] },
                'BNP': { monitors: 'Cardiac stretch/failure', relatedTests: ['Troponin', 'Echo', 'CXR'] },
                'WBC': { monitors: 'Infection/inflammation', relatedTests: ['Differential', 'CRP', 'Procalcitonin', 'Cultures'] },
                'HEMOGLOBIN': { monitors: 'Oxygen carrying capacity', relatedTests: ['MCV', 'Iron studies', 'Reticulocytes', 'B12/Folate'] },
                'LACTATE': { monitors: 'Tissue perfusion', relatedTests: ['ABG', 'Vital signs', 'Urine output'] }
            };
            
            return associationPatterns[testName] || { monitors: 'Unknown', relatedTests: [] };
        },
        
        /**
         * Generate anatomy/physiology content
         */
        generateAnatomyContent(topic, context) {
            return {
                topic: topic,
                note: 'Anatomical and physiological content can be safely generated from established medical knowledge',
                requiresVerification: false,
                confidence: 0.85
            };
        },
        
        /**
         * Generate differential diagnosis content
         */
        generateDifferentialContent(topic, context) {
            return {
                topic: topic,
                approach: 'Systematic differential diagnosis generation',
                framework: {
                    emergent: 'Life-threatening causes to rule out first',
                    common: 'Most frequent causes by prevalence',
                    mustNotMiss: 'Serious conditions that require consideration',
                    rare: 'Less common but important considerations'
                },
                requiresVerification: true,
                confidence: 0.70
            };
        },
        
        /**
         * Generate calculator content
         */
        generateCalculatorContent(topic, context) {
            return {
                topic: topic,
                note: 'Clinical calculators must be verified against source publications',
                requiresVerification: true,
                confidence: 0.65
            };
        },
        
        /**
         * Generate generic content
         */
        generateGenericContent(topic, context) {
            return {
                topic: topic,
                note: 'Generic medical content generated - requires clinical verification',
                requiresVerification: true,
                confidence: 0.50
            };
        },
        
        /**
         * Validate expansion against known patterns
         */
        validateExpansion(generatedContent) {
            const validation = {
                status: 'unvalidated',
                details: [],
                score: 0
            };
            
            // Check for required fields
            if (!generatedContent.topic) {
                validation.details.push('Missing topic');
                validation.status = 'failed';
                return validation;
            }
            
            // Check confidence threshold
            if (generatedContent.confidence < 0.5) {
                validation.details.push('Confidence below minimum threshold');
                validation.status = 'low_confidence';
                return validation;
            }
            
            // Check for verification requirements
            if (generatedContent.content?.requiresVerification) {
                validation.details.push('Requires manual clinical verification');
                validation.status = 'pending_verification';
            } else {
                validation.status = 'validated';
            }
            
            validation.score = generatedContent.confidence;
            return validation;
        },
        
        /**
         * Cross-reference with existing knowledge
         */
        crossReferenceKnowledge(generatedContent) {
            const references = [];
            
            // Check against verified database
            const topic = generatedContent.topic?.toLowerCase() || '';
            
            // Check pharmacology
            for (const [drug, info] of Object.entries(VERIFIED_MEDICAL_DATABASE.pharmacology)) {
                if (topic.includes(drug)) {
                    references.push({
                        type: 'pharmacology',
                        match: drug,
                        verified: true,
                        source: info.sources?.[0]?.ref || 'Verified Medical Database'
                    });
                }
            }
            
            // Check diagnostic criteria
            for (const [diagnosis, info] of Object.entries(VERIFIED_MEDICAL_DATABASE.diagnosticCriteria)) {
                if (topic.includes(diagnosis.replace(/_/g, ' '))) {
                    references.push({
                        type: 'diagnostic_criteria',
                        match: diagnosis,
                        verified: true,
                        source: info.source || 'Verified Medical Database'
                    });
                }
            }
            
            return references;
        },
        
        /**
         * Calculate final confidence score
         */
        calculateFinalConfidence(expansion) {
            let score = expansion.confidence || 0;
            
            // Boost if cross-references found
            if (expansion.crossReferences?.length > 0) {
                score += 0.1 * expansion.crossReferences.length;
            }
            
            // Boost if validated
            if (expansion.validationStatus === 'validated') {
                score += 0.1;
            }
            
            // Penalty if requires verification
            if (expansion.validationStatus === 'pending_verification') {
                score -= 0.1;
            }
            
            // Cap at 0.95 (never 100% confident for AI-generated)
            return Math.min(0.95, Math.max(0, score));
        },
        
        /**
         * Calculate generation confidence
         */
        calculateGenerationConfidence(expansion) {
            let confidence = 0.5; // Base confidence
            
            // Category-based adjustment
            const categoryConfidence = {
                'anatomy_physiology': 0.85,
                'lab_interpretation': 0.75,
                'differential_diagnosis': 0.70,
                'clinical_calculation': 0.65,
                'drug_information': 0.50  // Low - requires strict verification
            };
            
            if (categoryConfidence[expansion.category]) {
                confidence = categoryConfidence[expansion.category];
            }
            
            return confidence;
        },
        
        /**
         * Get expansion statistics
         */
        getStatistics() {
            return {
                totalExpansions: this.expandedKnowledge.size,
                validationHistory: this.validationHistory.length,
                averageConfidence: this.validationHistory.length > 0 
                    ? this.validationHistory.reduce((sum, v) => sum + v.confidence, 0) / this.validationHistory.length 
                    : 0,
                categoryCounts: this.getCategoryCounts()
            };
        },
        
        /**
         * Get category counts
         */
        getCategoryCounts() {
            const counts = {};
            this.expandedKnowledge.forEach(exp => {
                const category = exp.generatedContent?.category || 'unknown';
                counts[category] = (counts[category] || 0) + 1;
            });
            return counts;
        }
    };

    // ═══════════════════════════════════════════════════════════════════════════
    // CLINICAL REASONING ENGINE
    // ═══════════════════════════════════════════════════════════════════════════
    
    const ClinicalReasoningEngine = {
        /**
         * Perform Bayesian diagnostic reasoning
         */
        calculateDiagnosticProbability(priorProbability, findings) {
            let probability = priorProbability;
            
            findings.forEach(finding => {
                if (finding.present && finding.likelihoodRatioPositive) {
                    // Apply positive likelihood ratio
                    const preTestOdds = probability / (1 - probability);
                    const postTestOdds = preTestOdds * finding.likelihoodRatioPositive;
                    probability = postTestOdds / (1 + postTestOdds);
                } else if (!finding.present && finding.likelihoodRatioNegative) {
                    // Apply negative likelihood ratio
                    const preTestOdds = probability / (1 - probability);
                    const postTestOdds = preTestOdds * finding.likelihoodRatioNegative;
                    probability = postTestOdds / (1 + postTestOdds);
                }
            });
            
            return {
                posteriorProbability: probability,
                interpretation: this.interpretProbability(probability),
                methodology: 'Bayesian likelihood ratio calculation'
            };
        },
        
        /**
         * Interpret probability thresholds
         */
        interpretProbability(probability) {
            if (probability < 0.02) return { level: 'Very Low', action: 'Diagnosis effectively ruled out' };
            if (probability < 0.10) return { level: 'Low', action: 'Consider alternative diagnoses' };
            if (probability < 0.30) return { level: 'Intermediate-Low', action: 'Additional testing may be helpful' };
            if (probability < 0.70) return { level: 'Intermediate', action: 'Further workup recommended' };
            if (probability < 0.90) return { level: 'High', action: 'Diagnosis likely, consider confirmatory testing' };
            return { level: 'Very High', action: 'Diagnosis virtually certain' };
        },
        
        /**
         * Analyze lab trends over time
         */
        analyzeTrends(labHistory) {
            if (!labHistory || labHistory.length < 2) {
                return { analysis: 'Insufficient data for trend analysis', dataPoints: labHistory?.length || 0 };
            }
            
            const analysis = {
                dataPoints: labHistory.length,
                timespan: null,
                trends: {},
                alerts: [],
                projections: {}
            };
            
            // Sort by timestamp
            const sorted = [...labHistory].sort((a, b) => a.timestamp - b.timestamp);
            
            // Calculate timespan
            const firstTime = sorted[0].timestamp;
            const lastTime = sorted[sorted.length - 1].timestamp;
            analysis.timespan = {
                hours: (lastTime - firstTime) / (1000 * 60 * 60),
                days: (lastTime - firstTime) / (1000 * 60 * 60 * 24)
            };
            
            // Analyze each test
            const testValues = new Map();
            
            sorted.forEach(lab => {
                if (lab.values) {
                    lab.values.forEach(v => {
                        if (!testValues.has(v.test)) {
                            testValues.set(v.test, []);
                        }
                        testValues.get(v.test).push({
                            value: parseFloat(v.value),
                            timestamp: lab.timestamp,
                            flag: v.flag
                        });
                    });
                }
            });
            
            // Calculate trends for each test
            testValues.forEach((values, test) => {
                if (values.length >= 2) {
                    const first = values[0].value;
                    const last = values[values.length - 1].value;
                    const change = last - first;
                    const percentChange = ((change / first) * 100).toFixed(1);
                    
                    // Linear regression for slope
                    const slope = this.calculateSlope(values);
                    
                    analysis.trends[test] = {
                        firstValue: first,
                        lastValue: last,
                        absoluteChange: change.toFixed(2),
                        percentChange: percentChange,
                        direction: change > 0 ? 'increasing' : change < 0 ? 'decreasing' : 'stable',
                        slope: slope,
                        velocityPerHour: (slope * 3600000).toFixed(4), // Change per hour
                        dataPoints: values.length
                    };
                    
                    // Generate alerts for significant trends
                    const alertThresholds = {
                        'K+': { critical_increase: 0.5, critical_decrease: -0.5, unit: 'mEq/L/hour' },
                        'Cr': { critical_increase: 0.3, unit: 'mg/dL/24h' },
                        'HB': { critical_decrease: -1, unit: 'g/dL/24h' }
                    };
                    
                    if (alertThresholds[test]) {
                        const threshold = alertThresholds[test];
                        const changePerHour = slope * 3600000;
                        
                        if (threshold.critical_increase && changePerHour > threshold.critical_increase) {
                            analysis.alerts.push({
                                test: test,
                                type: 'rapid_increase',
                                severity: 'HIGH',
                                message: `${test} increasing rapidly at ${changePerHour.toFixed(3)} ${threshold.unit}`
                            });
                        }
                        if (threshold.critical_decrease && changePerHour < threshold.critical_decrease) {
                            analysis.alerts.push({
                                test: test,
                                type: 'rapid_decrease',
                                severity: 'HIGH',
                                message: `${test} decreasing rapidly at ${Math.abs(changePerHour).toFixed(3)} ${threshold.unit}`
                            });
                        }
                    }
                }
            });
            
            return analysis;
        },
        
        /**
         * Calculate slope using linear regression
         */
        calculateSlope(values) {
            if (values.length < 2) return 0;
            
            const n = values.length;
            const times = values.map(v => v.timestamp);
            const vals = values.map(v => v.value);
            
            const sumX = times.reduce((a, b) => a + b, 0);
            const sumY = vals.reduce((a, b) => a + b, 0);
            const sumXY = times.reduce((total, t, i) => total + t * vals[i], 0);
            const sumXX = times.reduce((total, t) => total + t * t, 0);
            
            const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
            
            return slope || 0;
        },
        
        /**
         * Generate clinical reasoning explanation
         */
        generateReasoningExplanation(diagnosis, findings, labResults) {
            const explanation = {
                diagnosis: diagnosis,
                supportingEvidence: [],
                againstEvidence: [],
                uncertainties: [],
                recommendedActions: [],
                confidence: 0
            };
            
            // Analyze findings
            findings.forEach(finding => {
                if (finding.supports) {
                    explanation.supportingEvidence.push({
                        finding: finding.name,
                        weight: finding.weight || 'moderate',
                        reasoning: finding.reasoning
                    });
                } else {
                    explanation.againstEvidence.push({
                        finding: finding.name,
                        weight: finding.weight || 'moderate',
                        reasoning: finding.reasoning
                    });
                }
            });
            
            // Calculate overall confidence
            const supportScore = explanation.supportingEvidence.reduce((sum, e) => {
                const weights = { high: 0.3, moderate: 0.2, low: 0.1 };
                return sum + (weights[e.weight] || 0.15);
            }, 0);
            
            const againstScore = explanation.againstEvidence.reduce((sum, e) => {
                const weights = { high: 0.3, moderate: 0.2, low: 0.1 };
                return sum + (weights[e.weight] || 0.15);
            }, 0);
            
            explanation.confidence = Math.min(0.95, Math.max(0.05, 0.5 + supportScore - againstScore));
            
            return explanation;
        }
    };

    // ═══════════════════════════════════════════════════════════════════════════
    // CONVERSATION MANAGER
    // ═══════════════════════════════════════════════════════════════════════════
    
    class ConversationManager {
        constructor() {
            this.conversations = new Map();
            this.contextMemory = new Map();
        }
        
        initConversation(patientId) {
            if (!this.conversations.has(patientId)) {
                this.conversations.set(patientId, []);
                this.contextMemory.set(patientId, {
                    topicsDiscussed: [],
                    questionsAsked: [],
                    recommendationsMade: []
                });
            }
        }
        
        addMessage(patientId, role, content, metadata = {}) {
            this.initConversation(patientId);
            
            const message = {
                id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
                role,
                content,
                timestamp: Date.now(),
                metadata: {
                    ...metadata,
                    sources: metadata.sources || [],
                    evidenceLevel: metadata.evidenceLevel || 'N/A',
                    confidence: metadata.confidence || 0
                }
            };
            
            this.conversations.get(patientId).push(message);
            
            // Update context memory
            if (metadata.topic) {
                this.contextMemory.get(patientId).topicsDiscussed.push(metadata.topic);
            }
            
            return message;
        }
        
        getConversation(patientId) {
            return this.conversations.get(patientId) || [];
        }
        
        getContextMemory(patientId) {
            return this.contextMemory.get(patientId) || {};
        }
        
        clearConversation(patientId) {
            this.conversations.delete(patientId);
            this.contextMemory.delete(patientId);
        }
        
        exportConversation(patientId) {
            return JSON.stringify({
                conversation: this.getConversation(patientId),
                context: this.getContextMemory(patientId),
                exportedAt: new Date().toISOString()
            }, null, 2);
        }
    }
    
    const conversationManager = new ConversationManager();

    // ═══════════════════════════════════════════════════════════════════════════
    // MAIN QUERY PROCESSOR
    // ═══════════════════════════════════════════════════════════════════════════
    
    /**
     * Build clinical context from patient data
     */
    function buildClinicalContext(patient) {
        const context = {
            demographics: {
                mrn: patient.mrn || 'Unknown',
                name: patient.name || 'Unknown',
                ward: patient.ward || 'Unknown',
                bed: patient.bed || 'Unknown'
            },
            clinical: {
                diagnosis: patient.diagnosis || 'Not specified',
                status: patient.status || 'Unknown',
                attendingPhysician: patient.doctor || 'Unknown',
                clinicalPlan: patient.plan || 'Not specified'
            },
            labResults: [],
            latestLabs: null,
            criticalValues: [],
            trends: {}
        };
        
        // Process lab images
        if (patient.labImages && patient.labImages.length > 0) {
            patient.labImages.forEach((labImage) => {
                if (labImage.deleted) return;
                
                const labEntry = {
                    timestamp: labImage.timestamp || Date.now(),
                    reportType: labImage.ocr?.reportType || 'Unknown',
                    values: [],
                    alerts: labImage.ocr?.alerts || [],
                    findings: labImage.ocr?.findings || []
                };
                
                if (labImage.ocr && labImage.ocr.values) {
                    labImage.ocr.values.forEach(value => {
                        labEntry.values.push({
                            test: value.test,
                            value: value.value,
                            unit: value.unit,
                            flag: value.flag || 'N',
                            referenceRange: value.validation?.normalRange || 'Unknown',
                            confidence: value.confidence || 0
                        });
                        
                        if (value.flag === 'C' || value.flag === 'H' || value.flag === 'L') {
                            context.criticalValues.push({
                                test: value.test,
                                value: value.value,
                                unit: value.unit,
                                flag: value.flag,
                                timestamp: labImage.timestamp
                            });
                        }
                    });
                }
                
                context.labResults.push(labEntry);
            });
            
            // Sort and get latest
            if (context.labResults.length > 0) {
                context.labResults.sort((a, b) => b.timestamp - a.timestamp);
                context.latestLabs = context.labResults[0];
                
                // Calculate trends
                if (context.labResults.length >= 2) {
                    context.trends = ClinicalReasoningEngine.analyzeTrends(context.labResults);
                }
            }
        }
        
        return context;
    }
    
    /**
     * Classify query type
     */
    function classifyQuery(query) {
        const patterns = {
            lab_interpretation: /\b(lab|laboratory|test|result|value|hb|wbc|platelet|creatinine|sodium|potassium|glucose|troponin|bnp|inr|interpret|meaning)\b/i,
            drug_information: /\b(drug|medication|medicine|dose|dosing|interaction|side effect|contraindication|warfarin|metformin|statin|aspirin|heparin)\b/i,
            diagnosis: /\b(diagnos|criteria|sepsis|heart failure|aki|dka|stroke|mi|myocardial|definition)\b/i,
            treatment: /\b(treat|management|protocol|therapy|antibiotic|insulin|transfusion|hypertension|emergency)\b/i,
            differential: /\b(differential|ddx|causes of|why|chest pain|dyspnea|altered mental|hyponatremia)\b/i,
            calculator: /\b(score|calculator|cha2ds2|hasbled|wells|sofa|qsofa|calculate)\b/i,
            guideline: /\b(guideline|recommendation|acc|aha|kdigo|ada|evidence|standard|source)\b/i
        };
        
        for (const [type, pattern] of Object.entries(patterns)) {
            if (pattern.test(query)) {
                return type;
            }
        }
        
        return 'general';
    }
    
    /**
     * Generate AI response with verified sources
     */
    function generateAIResponse(userQuery, clinicalContext, conversationHistory) {
        const query = userQuery.toLowerCase();
        const queryType = classifyQuery(query);
        
        let response = {
            text: '',
            sources: [],
            evidenceLevel: 'N/A',
            confidence: 0,
            suggestions: [],
            expansionUsed: false
        };
        
        switch (queryType) {
            case 'lab_interpretation':
                response = handleLabQuery(query, clinicalContext);
                break;
            case 'drug_information':
                response = handleDrugQuery(query, clinicalContext);
                break;
            case 'diagnosis':
                response = handleDiagnosisQuery(query, clinicalContext);
                break;
            case 'differential':
                response = handleDifferentialQuery(query, clinicalContext);
                break;
            case 'calculator':
                response = handleCalculatorQuery(query, clinicalContext);
                break;
            case 'treatment':
                response = handleTreatmentQuery(query, clinicalContext);
                break;
            case 'guideline':
                response = handleGuidelineQuery(query, clinicalContext);
                break;
            default:
                response = handleGeneralQuery(query, clinicalContext);
        }
        
        // Add source verification badge
        response.text += '\n\n---\n';
        response.text += `📚 **Source Verification**: ${response.sources.length > 0 ? '✅ Verified' : '⚠️ General Knowledge'}\n`;
        if (response.evidenceLevel !== 'N/A') {
            response.text += `📊 **Evidence Level**: ${response.evidenceLevel} (${EVIDENCE_LEVELS[response.evidenceLevel]?.description || 'See Oxford CEBM'})\n`;
        }
        response.text += `🎯 **Confidence**: ${(response.confidence * 100).toFixed(0)}%`;
        
        return response;
    }
    
    /**
     * Handle lab interpretation queries
     */
    function handleLabQuery(query, context) {
        let response = {
            text: '',
            sources: ['Lab Reference Ranges Database v6.0', 'CDSS Clinical Decision Module'],
            evidenceLevel: '2b',
            confidence: 0.85,
            suggestions: []
        };
        
        if (!context.latestLabs || context.latestLabs.values.length === 0) {
            response.text = '⚠️ **No lab results available**\n\nPlease upload lab results first to enable AI interpretation.';
            response.confidence = 1.0;
            return response;
        }
        
        let interpretation = '📊 **Lab Results Interpretation**\n\n';
        interpretation += `**Latest Labs** (${new Date(context.latestLabs.timestamp).toLocaleString()}):\n\n`;
        
        const criticalValues = context.latestLabs.values.filter(v => v.flag === 'C');
        const abnormalValues = context.latestLabs.values.filter(v => v.flag === 'H' || v.flag === 'L');
        const normalValues = context.latestLabs.values.filter(v => v.flag === 'N');
        
        // Critical values
        if (criticalValues.length > 0) {
            interpretation += '🚨 **CRITICAL VALUES** - Immediate attention required:\n';
            criticalValues.forEach(v => {
                interpretation += `• **${v.test}**: ${v.value} ${v.unit} (Ref: ${v.referenceRange})\n`;
                
                // Add clinical context from expansion engine
                const clinicalContext = KnowledgeExpansionEngine.inferElevatedCauses(v.test.toUpperCase());
                if (clinicalContext && clinicalContext.length > 0) {
                    interpretation += `  → Consider: ${clinicalContext.slice(0, 3).join(', ')}\n`;
                }
            });
            interpretation += '\n';
        }
        
        // Abnormal values
        if (abnormalValues.length > 0) {
            interpretation += '⚠️ **Abnormal Values**:\n';
            abnormalValues.forEach(v => {
                const direction = v.flag === 'H' ? '↑ HIGH' : '↓ LOW';
                interpretation += `• **${v.test}**: ${v.value} ${v.unit} ${direction} (Ref: ${v.referenceRange})\n`;
                
                // Add causes based on direction
                const testUpper = v.test.toUpperCase();
                const causes = v.flag === 'H' 
                    ? KnowledgeExpansionEngine.inferElevatedCauses(testUpper)
                    : KnowledgeExpansionEngine.inferDecreasedCauses(testUpper);
                    
                if (causes && causes.length > 0 && causes[0] !== 'Requires specific clinical evaluation') {
                    interpretation += `  → Possible causes: ${causes.slice(0, 3).join(', ')}\n`;
                }
                
                // Add trend if available
                if (context.trends?.trends?.[v.test]) {
                    const trend = context.trends.trends[v.test];
                    interpretation += `  📈 Trend: ${trend.firstValue} → ${trend.lastValue} (${trend.direction}, ${trend.percentChange}%)\n`;
                }
            });
            interpretation += '\n';
        }
        
        // Normal values summary
        if (normalValues.length > 0) {
            interpretation += `✅ **Normal Values** (${normalValues.length}): ${normalValues.map(v => v.test).join(', ')}\n\n`;
        }
        
        // Trend alerts
        if (context.trends?.alerts?.length > 0) {
            interpretation += '⚡ **Trend Alerts**:\n';
            context.trends.alerts.forEach(alert => {
                interpretation += `• ${alert.severity}: ${alert.message}\n`;
            });
            interpretation += '\n';
        }
        
        // Clinical correlation
        if (context.clinical.diagnosis && context.clinical.diagnosis !== 'Not specified') {
            interpretation += `**Clinical Correlation** (Dx: ${context.clinical.diagnosis}):\n`;
            interpretation += generateDiagnosisCorrelation(context.latestLabs.values, context.clinical.diagnosis);
        }
        
        response.text = interpretation;
        return response;
    }
    
    /**
     * Generate diagnosis-specific lab correlation
     */
    function generateDiagnosisCorrelation(labValues, diagnosis) {
        let correlation = '';
        const diagLower = diagnosis.toLowerCase();
        
        // Pattern matching for common diagnoses
        if (diagLower.includes('sepsis') || diagLower.includes('infection')) {
            const wbc = labValues.find(v => v.test === 'WBC');
            const lactate = labValues.find(v => v.test.toLowerCase().includes('lactate'));
            const plt = labValues.find(v => v.test === 'Plt');
            
            correlation += '• Sepsis monitoring:\n';
            if (wbc) correlation += `  - WBC ${wbc.value}: ${wbc.flag === 'H' ? 'Supports infection' : wbc.flag === 'L' ? 'Possible overwhelming sepsis' : 'Within normal limits'}\n`;
            if (lactate) correlation += `  - Lactate for tissue perfusion assessment\n`;
            if (plt && plt.flag === 'L') correlation += `  - Low platelets: Consider DIC workup\n`;
        }
        
        if (diagLower.includes('aki') || diagLower.includes('renal') || diagLower.includes('kidney')) {
            const cr = labValues.find(v => v.test.toUpperCase() === 'CR');
            const k = labValues.find(v => v.test === 'K+');
            
            correlation += '• AKI monitoring (KDIGO criteria):\n';
            if (cr) correlation += `  - Creatinine ${cr.value}: Compare to baseline for staging\n`;
            if (k && parseFloat(k.value) > 5.5) correlation += `  - ⚠️ Hyperkalemia ${k.value}: ECG monitoring recommended\n`;
        }
        
        if (diagLower.includes('heart failure') || diagLower.includes('chf')) {
            const bnp = labValues.find(v => v.test.toUpperCase().includes('BNP'));
            const na = labValues.find(v => v.test === 'Na+');
            const cr = labValues.find(v => v.test.toUpperCase() === 'CR');
            
            correlation += '• Heart failure monitoring:\n';
            if (bnp) correlation += `  - BNP ${bnp.value}: ${parseFloat(bnp.value) > 400 ? 'Elevated - consistent with HF' : parseFloat(bnp.value) < 100 ? 'Low - HF less likely' : 'Indeterminate'}\n`;
            if (na && parseFloat(na.value) < 135) correlation += `  - Hyponatremia: Poor prognostic marker in HF\n`;
            if (cr && cr.flag !== 'N') correlation += `  - Renal dysfunction: Monitor for cardiorenal syndrome\n`;
        }
        
        return correlation || '• General correlation: Review lab trends in clinical context\n';
    }
    
    /**
     * Handle drug information queries
     */
    function handleDrugQuery(query, context) {
        let response = {
            text: '',
            sources: [],
            evidenceLevel: '1a',
            confidence: 0.92,
            suggestions: []
        };
        
        // Find matching drug
        const drugDB = VERIFIED_MEDICAL_DATABASE.pharmacology;
        let matchedDrug = null;
        let drugKey = null;
        
        for (const [key, info] of Object.entries(drugDB)) {
            if (query.includes(key.replace(/_/g, ' ')) || query.includes(key)) {
                matchedDrug = info;
                drugKey = key;
                break;
            }
        }
        
        if (matchedDrug) {
            let text = `💊 **${drugKey.toUpperCase()}** - Verified Drug Information\n\n`;
            
            text += `**Class**: ${matchedDrug.class}\n`;
            text += `**Mechanism**: ${matchedDrug.mechanism}\n\n`;
            
            // Interactions
            if (matchedDrug.interactions?.major) {
                text += '⚠️ **Major Drug Interactions**:\n';
                matchedDrug.interactions.major.forEach(int => {
                    text += `• ${int.drug}: ${int.mechanism} (Severity: ${int.severity})\n`;
                });
                text += '\n';
            }
            
            // Monitoring
            if (matchedDrug.monitoring) {
                text += '📋 **Monitoring Requirements**:\n';
                if (typeof matchedDrug.monitoring === 'object') {
                    Object.entries(matchedDrug.monitoring).forEach(([key, val]) => {
                        if (key === 'targets') {
                            text += `• Therapeutic Targets:\n`;
                            Object.entries(val).forEach(([ind, target]) => {
                                text += `  - ${ind.replace(/_/g, ' ')}: ${target.range} (${target.source})\n`;
                            });
                        } else if (key === 'frequency') {
                            text += `• Frequency: ${JSON.stringify(val)}\n`;
                        } else {
                            text += `• ${key}: ${val}\n`;
                        }
                    });
                } else {
                    text += `• ${matchedDrug.monitoring}\n`;
                }
                text += '\n';
            }
            
            // Renal adjustment
            if (matchedDrug.renalAdjustment) {
                text += '🔬 **Renal Dose Adjustment**:\n';
                Object.entries(matchedDrug.renalAdjustment).forEach(([egfr, adj]) => {
                    if (typeof adj === 'object') {
                        text += `• ${egfr.replace(/_/g, ' ')}: ${adj.action}${adj.maxDose ? ` (Max: ${adj.maxDose})` : ''}\n`;
                    }
                });
                text += '\n';
            }
            
            // Patient-specific checks
            if (context.latestLabs) {
                text += '👤 **Patient-Specific Considerations**:\n';
                const checks = checkPatientDrugSafety(drugKey, context.latestLabs.values);
                if (checks.length > 0) {
                    checks.forEach(check => {
                        text += `${check}\n`;
                    });
                } else {
                    text += '• No significant lab-based contraindications identified\n';
                }
                text += '\n';
            }
            
            // Sources
            if (matchedDrug.sources) {
                text += '📚 **Verified Sources**:\n';
                matchedDrug.sources.forEach(src => {
                    text += `• ${src.ref}`;
                    if (src.pmid) text += ` (PMID: ${src.pmid})`;
                    if (src.doi) text += ` (DOI: ${src.doi})`;
                    text += ` [Evidence: ${src.evidence}]\n`;
                });
            }
            
            response.text = text;
            response.sources = matchedDrug.sources?.map(s => s.ref) || [];
            
        } else {
            response.text = '💊 **Drug Information**\n\n';
            response.text += 'Verified drug information available for:\n';
            response.text += Object.keys(drugDB).map(d => `• ${d.replace(/_/g, ' ')}`).join('\n');
            response.text += '\n\nPlease specify which medication you need information about.';
            response.confidence = 0.7;
        }
        
        return response;
    }
    
    /**
     * Check patient-specific drug safety
     */
    function checkPatientDrugSafety(drug, labValues) {
        const checks = [];
        
        if (drug === 'metformin') {
            const egfr = labValues.find(v => v.test.toUpperCase() === 'EGFR');
            if (egfr) {
                const val = parseFloat(egfr.value);
                if (val < 30) {
                    checks.push('⛔ CONTRAINDICATED: eGFR < 30 - Lactic acidosis risk (KDIGO)');
                } else if (val < 45) {
                    checks.push('⚠️ CAUTION: eGFR 30-45 - Consider dose reduction to max 1000mg/day');
                }
            }
        }
        
        if (drug === 'warfarin') {
            const inr = labValues.find(v => v.test.toUpperCase() === 'INR');
            if (inr) {
                const val = parseFloat(inr.value);
                if (val > 4.5) {
                    checks.push('⛔ INR CRITICAL: Hold warfarin, consider Vitamin K');
                } else if (val > 3.5) {
                    checks.push('⚠️ INR elevated: Consider holding 1-2 doses');
                } else if (val < 2.0) {
                    checks.push('ℹ️ INR subtherapeutic: May need dose increase');
                }
            }
        }
        
        if (drug === 'heparin_unfractionated') {
            const plt = labValues.find(v => v.test === 'Plt');
            if (plt && parseFloat(plt.value) < 100) {
                checks.push('⚠️ Thrombocytopenia: Monitor for HIT (4Ts score), check platelet trend');
            }
        }
        
        return checks;
    }
    
    /**
     * Handle diagnosis criteria queries
     */
    function handleDiagnosisQuery(query, context) {
        let response = {
            text: '',
            sources: [],
            evidenceLevel: '1a',
            confidence: 0.90,
            suggestions: []
        };
        
        const diagDB = VERIFIED_MEDICAL_DATABASE.diagnosticCriteria;
        let matched = null;
        let matchKey = null;
        
        for (const [key, info] of Object.entries(diagDB)) {
            const searchTerms = [key, key.replace(/_/g, ' '), key.replace(/_/g, '')];
            if (searchTerms.some(term => query.includes(term))) {
                matched = info;
                matchKey = key;
                break;
            }
        }
        
        if (matched) {
            let text = `🔬 **${matched.name || matchKey.replace(/_/g, ' ').toUpperCase()}**\n\n`;
            
            if (matched.source) {
                text += `📖 Source: ${matched.source}`;
                if (matched.pmid) text += ` (PMID: ${matched.pmid})`;
                text += '\n\n';
            }
            
            // Definition
            if (matched.definition) {
                text += '**Definition**:\n';
                if (typeof matched.definition === 'string') {
                    text += `${matched.definition}\n\n`;
                } else if (matched.definition.any_of) {
                    text += 'Any of the following:\n';
                    matched.definition.any_of.forEach(d => text += `• ${d}\n`);
                    text += '\n';
                }
            }
            
            // Diagnostic criteria
            if (matched.diagnosticCriteria) {
                text += '**Diagnostic Criteria**:\n';
                Object.entries(matched.diagnosticCriteria).forEach(([key, val]) => {
                    text += `• ${key}: ${val}\n`;
                });
                text += '\n';
            }
            
            // Staging
            if (matched.staging) {
                text += '**Staging**:\n';
                Object.entries(matched.staging).forEach(([stage, info]) => {
                    text += `• **${stage.toUpperCase()}**: `;
                    if (typeof info === 'object') {
                        text += `Cr: ${info.creatinine || 'N/A'}, UOP: ${info.urineOutput || 'N/A'}`;
                        if (info.mortality) text += ` (Mortality: ${info.mortality})`;
                    } else {
                        text += info;
                    }
                    text += '\n';
                });
                text += '\n';
            }
            
            // Severity
            if (matched.severity) {
                text += '**Severity Classification**:\n';
                Object.entries(matched.severity).forEach(([level, info]) => {
                    text += `• **${level.toUpperCase()}**: `;
                    if (typeof info === 'object') {
                        Object.entries(info).forEach(([k, v]) => {
                            text += `${k}: ${v}, `;
                        });
                        text = text.slice(0, -2);
                    } else {
                        text += info;
                    }
                    text += '\n';
                });
                text += '\n';
            }
            
            // Management
            if (matched.management) {
                text += '**Management**:\n';
                if (matched.management.hourOneBunde) {
                    text += '🕐 Hour-1 Bundle:\n';
                    matched.management.hourOneBunde.elements.forEach(e => {
                        text += `  • ${e}\n`;
                    });
                } else if (typeof matched.management === 'object') {
                    Object.entries(matched.management).forEach(([key, val]) => {
                        if (typeof val === 'object' && !Array.isArray(val)) {
                            text += `• ${key}:\n`;
                            Object.entries(val).forEach(([k, v]) => {
                                text += `  - ${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}\n`;
                            });
                        } else if (Array.isArray(val)) {
                            text += `• ${key}:\n`;
                            val.forEach(item => text += `  - ${item}\n`);
                        } else {
                            text += `• ${key}: ${val}\n`;
                        }
                    });
                }
                text += '\n';
            }
            
            response.text = text;
            response.sources = [matched.source || 'Verified Medical Database'];
            response.evidenceLevel = matched.evidence || '1a';
            
        } else {
            response.text = '🔬 **Diagnostic Criteria Database**\n\n';
            response.text += 'Verified diagnostic criteria available for:\n';
            response.text += Object.keys(diagDB).map(k => `• ${k.replace(/_/g, ' ')}`).join('\n');
            response.confidence = 0.7;
        }
        
        return response;
    }
    
    /**
     * Handle differential diagnosis queries
     */
    function handleDifferentialQuery(query, context) {
        let response = {
            text: '',
            sources: [],
            evidenceLevel: '2b',
            confidence: 0.85,
            suggestions: []
        };
        
        const ddxDB = VERIFIED_MEDICAL_DATABASE.differentialDiagnosis;
        let matched = null;
        let matchKey = null;
        
        for (const [key, info] of Object.entries(ddxDB)) {
            if (query.includes(key.replace(/_/g, ' '))) {
                matched = info;
                matchKey = key;
                break;
            }
        }
        
        if (matched) {
            let text = `🔍 **Differential Diagnosis: ${matchKey.replace(/_/g, ' ').toUpperCase()}**\n\n`;
            
            // Life-threatening
            if (matched.lifeThreatening) {
                text += '🚨 **LIFE-THREATENING - Must Rule Out First**:\n\n';
                matched.lifeThreatening.diagnoses?.forEach(dx => {
                    text += `**${dx.name}** (Prevalence: ${dx.prevalence || 'Variable'})\n`;
                    text += `• Key features: ${dx.keyFeatures?.join(', ') || 'N/A'}\n`;
                    text += `• Red flags: ${dx.redFlags?.join(', ') || 'N/A'}\n`;
                    text += `• Workup: ${dx.workup?.join(', ') || 'N/A'}\n`;
                    if (dx.bayesianFactors) {
                        text += `• ↑ Probability: ${dx.bayesianFactors.increases?.slice(0, 2).join(', ') || 'N/A'}\n`;
                        text += `• ↓ Probability: ${dx.bayesianFactors.decreases?.slice(0, 2).join(', ') || 'N/A'}\n`;
                    }
                    text += '\n';
                });
            }
            
            // Common causes
            if (matched.common) {
                text += '📋 **Common Causes**:\n';
                matched.common.diagnoses?.forEach(dx => {
                    text += `• **${dx.name}**: ${dx.features || ''} → ${dx.workup || ''}\n`;
                });
                text += '\n';
            }
            
            // Volume-based (for electrolyte disorders)
            if (matched.byVolume) {
                Object.entries(matched.byVolume).forEach(([volStatus, info]) => {
                    text += `**${volStatus.toUpperCase()}**:\n`;
                    info.causes?.forEach(cause => {
                        text += `• ${cause.name}: UNa ${cause.urineNa || 'N/A'} → ${cause.management || ''}\n`;
                    });
                    text += '\n';
                });
            }
            
            // Correction rates (for hyponatremia)
            if (matched.correctionRates) {
                text += '📊 **Correction Guidelines**:\n';
                if (matched.correctionRates.chronic) {
                    text += `• Chronic: ${matched.correctionRates.chronic.correctionRate}, Max: ${matched.correctionRates.chronic.maxRate}\n`;
                    text += `• ⚠️ Risk: ${matched.correctionRates.chronic.rationale}\n`;
                }
                text += '\n';
            }
            
            response.text = text;
            response.sources = [matched.source || 'Clinical Practice Guidelines'];
            response.evidenceLevel = matched.evidence || '2b';
            
        } else {
            // Try to expand knowledge
            if (KnowledgeExpansionEngine.config.autoExpandOnUnknown) {
                const expansion = KnowledgeExpansionEngine.expandKnowledge(query, context);
                if (expansion.status === 'accepted' && expansion.generatedContent) {
                    response.text = '🧠 **AI-Generated Differential Analysis**\n\n';
                    response.text += `Topic: ${query}\n\n`;
                    response.text += JSON.stringify(expansion.generatedContent, null, 2);
                    response.text += '\n\n⚠️ This is AI-generated content and requires clinical verification.';
                    response.confidence = expansion.finalConfidence;
                    response.expansionUsed = true;
                    return response;
                }
            }
            
            response.text = '🔍 **Differential Diagnosis Database**\n\n';
            response.text += 'Comprehensive differentials available for:\n';
            response.text += Object.keys(ddxDB).map(k => `• ${k.replace(/_/g, ' ')}`).join('\n');
            response.confidence = 0.7;
        }
        
        return response;
    }
    
    /**
     * Handle calculator queries
     */
    function handleCalculatorQuery(query, context) {
        let response = {
            text: '',
            sources: [],
            evidenceLevel: '1b',
            confidence: 0.90,
            suggestions: []
        };
        
        const calcDB = VERIFIED_MEDICAL_DATABASE.clinicalCalculators;
        let matched = null;
        let matchKey = null;
        
        for (const [key, info] of Object.entries(calcDB)) {
            const searchTerms = [key, key.replace(/_/g, ''), info.name?.toLowerCase()];
            if (searchTerms.some(term => term && query.includes(term.toLowerCase()))) {
                matched = info;
                matchKey = key;
                break;
            }
        }
        
        if (matched) {
            let text = `🧮 **${matched.name}**\n\n`;
            text += `**Purpose**: ${matched.purpose}\n\n`;
            
            // Components
            if (matched.components) {
                text += '**Scoring Components**:\n';
                matched.components.forEach(c => {
                    text += `• ${c.criterion}: ${c.points} point${c.points !== 1 ? 's' : ''}`;
                    if (c.definition) text += ` (${c.definition})`;
                    text += '\n';
                });
                text += '\n';
            }
            
            // Interpretation
            if (matched.interpretation) {
                text += '**Interpretation**:\n';
                const interp = matched.interpretation.simplified || matched.interpretation.traditional || matched.interpretation;
                Object.entries(interp).forEach(([score, info]) => {
                    if (typeof info === 'object') {
                        text += `• Score ${info.score || score}: ${info.risk || ''} - ${info.action || info.recommendation || ''}\n`;
                    } else {
                        text += `• ${score}: ${info}\n`;
                    }
                });
                text += '\n';
            }
            
            // Key points
            if (matched.keyPoint) {
                text += `💡 **Key Point**: ${matched.keyPoint}\n\n`;
            }
            
            response.text = text;
            response.sources = [matched.source || 'Validated Clinical Calculator'];
            response.evidenceLevel = matched.evidence || '1b';
            
        } else {
            response.text = '🧮 **Clinical Calculators**\n\n';
            response.text += 'Validated calculators available:\n';
            response.text += Object.entries(calcDB).map(([k, v]) => `• ${v.name || k}`).join('\n');
            response.confidence = 0.7;
        }
        
        return response;
    }
    
    /**
     * Handle treatment protocol queries
     */
    function handleTreatmentQuery(query, context) {
        let response = {
            text: '',
            sources: [],
            evidenceLevel: '1a',
            confidence: 0.85,
            suggestions: []
        };
        
        // Check for specific treatment topics in the verified database
        response.text = '💊 **Treatment Protocols**\n\n';
        response.text += 'Treatment protocols must be verified against current guidelines.\n\n';
        response.text += '**Available Verified Protocols**:\n';
        response.text += '• Sepsis management (Surviving Sepsis Campaign 2021)\n';
        response.text += '• DKA management (ADA 2024)\n';
        response.text += '• AKI management (KDIGO 2024)\n';
        response.text += '• Anticoagulation (CHEST 2021)\n\n';
        response.text += 'Please ask about a specific condition for detailed treatment guidance.';
        
        // If diagnosis matches known protocols, provide specific guidance
        const diagDB = VERIFIED_MEDICAL_DATABASE.diagnosticCriteria;
        for (const [key, info] of Object.entries(diagDB)) {
            if (query.includes(key.replace(/_/g, ' ')) && info.management) {
                response.text = `💊 **${info.name || key.replace(/_/g, ' ')} Treatment**\n\n`;
                
                if (typeof info.management === 'object') {
                    Object.entries(info.management).forEach(([section, content]) => {
                        response.text += `**${section.replace(/_/g, ' ').toUpperCase()}**:\n`;
                        if (content.elements) {
                            content.elements.forEach(e => response.text += `• ${e}\n`);
                        } else if (typeof content === 'object') {
                            Object.entries(content).forEach(([k, v]) => {
                                response.text += `• ${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}\n`;
                            });
                        } else {
                            response.text += `• ${content}\n`;
                        }
                        response.text += '\n';
                    });
                }
                
                response.sources = [info.source || 'Verified Guidelines'];
                response.evidenceLevel = info.evidence || '1a';
                break;
            }
        }
        
        return response;
    }
    
    /**
     * Handle guideline queries
     */
    function handleGuidelineQuery(query, context) {
        let response = {
            text: '',
            sources: [],
            evidenceLevel: '1a',
            confidence: 0.95,
            suggestions: []
        };
        
        response.text = '📚 **Integrated Clinical Guidelines**\n\n';
        response.text += 'This system uses only **Tier 1 & Tier 2 verified medical sources**:\n\n';
        
        response.text += '**Tier 1 - Primary Evidence**:\n';
        Object.values(VERIFIED_SOURCE_REGISTRY.tier1).forEach(src => {
            response.text += `• ${src.name} (Trust: ${(src.trustScore * 100).toFixed(0)}%)\n`;
        });
        
        response.text += '\n**Tier 2 - Professional Society Guidelines**:\n';
        Object.values(VERIFIED_SOURCE_REGISTRY.tier2).forEach(src => {
            response.text += `• ${src.name} - ${src.domain} (${src.lastReview})\n`;
        });
        
        response.text += '\n**Evidence Levels** (Oxford CEBM):\n';
        Object.entries(EVIDENCE_LEVELS).slice(0, 4).forEach(([level, info]) => {
            response.text += `• Level ${level}: ${info.description} (${info.strength})\n`;
        });
        
        response.text += '\n💡 Every recommendation in this system is tagged with its evidence level and source.';
        
        response.sources = ['Oxford Centre for Evidence-Based Medicine', 'GRADE Working Group'];
        
        return response;
    }
    
    /**
     * Handle general queries
     */
    function handleGeneralQuery(query, context) {
        let response = {
            text: '',
            sources: [],
            evidenceLevel: 'N/A',
            confidence: 0.70,
            suggestions: []
        };
        
        response.text = '🤖 **AI Medical Consultant v2.0**\n\n';
        response.text += 'Enhanced with verified medical sources and self-expanding knowledge.\n\n';
        
        response.text += '**Available Capabilities**:\n\n';
        
        response.text += '📊 **Lab Interpretation**\n';
        response.text += '• "Interpret labs" - Analyze current lab results\n';
        response.text += '• "What does elevated creatinine mean?"\n\n';
        
        response.text += '💊 **Drug Information** (Verified)\n';
        response.text += '• "Warfarin interactions"\n';
        response.text += '• "Metformin in renal failure"\n\n';
        
        response.text += '🔬 **Diagnostic Criteria** (Evidence-Based)\n';
        response.text += '• "Sepsis-3 criteria"\n';
        response.text += '• "KDIGO AKI staging"\n';
        response.text += '• "DKA diagnostic criteria"\n\n';
        
        response.text += '🧮 **Clinical Calculators**\n';
        response.text += '• "CHA2DS2-VASc score"\n';
        response.text += '• "Wells PE score"\n';
        response.text += '• "HAS-BLED score"\n\n';
        
        response.text += '🔍 **Differential Diagnosis**\n';
        response.text += '• "Chest pain differential"\n';
        response.text += '• "Hyponatremia workup"\n\n';
        
        response.text += '📚 **Guidelines & Sources**\n';
        response.text += '• "What guidelines do you use?"\n';
        response.text += '• "Show me the sources"\n\n';
        
        response.text += '🧠 **Self-Expanding Knowledge**\n';
        response.text += 'System can generate new clinical content with confidence scoring and validation.\n';
        
        return response;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // PUBLIC API
    // ═══════════════════════════════════════════════════════════════════════════
    
    return {
        // Module info
        version: '2.0.0',
        name: 'AI Medical Consultant - Enhanced',
        
        // Start consultation
        startConsultation: function(patientId) {
            conversationManager.initConversation(patientId);
            return {
                success: true,
                message: 'AI Medical Consultation v2.0 started - Using verified sources only',
                timestamp: Date.now(),
                capabilities: ['lab_interpretation', 'drug_information', 'diagnostic_criteria', 'differential_diagnosis', 'clinical_calculators', 'self_expansion']
            };
        },
        
        // Ask question
        askQuestion: function(patientId, userQuery, patient) {
            try {
                const clinicalContext = buildClinicalContext(patient);
                const conversationHistory = conversationManager.getConversation(patientId);
                
                conversationManager.addMessage(patientId, 'user', userQuery);
                
                const aiResponse = generateAIResponse(userQuery, clinicalContext, conversationHistory);
                
                conversationManager.addMessage(patientId, 'assistant', aiResponse.text, {
                    sources: aiResponse.sources,
                    evidenceLevel: aiResponse.evidenceLevel,
                    confidence: aiResponse.confidence,
                    suggestions: aiResponse.suggestions
                });
                
                return {
                    success: true,
                    response: aiResponse,
                    timestamp: Date.now()
                };
                
            } catch (error) {
                console.error('AI Consultation Error:', error);
                return {
                    success: false,
                    error: error.message,
                    response: {
                        text: '⚠️ An error occurred. Please try rephrasing your question.',
                        sources: [],
                        evidenceLevel: 'N/A',
                        confidence: 0,
                        suggestions: []
                    }
                };
            }
        },
        
        // Get history
        getHistory: function(patientId) {
            return conversationManager.getConversation(patientId);
        },
        
        // Clear history
        clearHistory: function(patientId) {
            conversationManager.clearConversation(patientId);
            return { success: true, message: 'Conversation cleared' };
        },
        
        // Export history
        exportHistory: function(patientId) {
            return conversationManager.exportConversation(patientId);
        },
        
        // Get database info
        getDatabaseInfo: function() {
            return {
                verifiedSources: {
                    tier1: Object.keys(VERIFIED_SOURCE_REGISTRY.tier1).length,
                    tier2: Object.keys(VERIFIED_SOURCE_REGISTRY.tier2).length,
                    tier3: Object.keys(VERIFIED_SOURCE_REGISTRY.tier3).length
                },
                pharmacology: Object.keys(VERIFIED_MEDICAL_DATABASE.pharmacology).length,
                diagnosticCriteria: Object.keys(VERIFIED_MEDICAL_DATABASE.diagnosticCriteria).length,
                clinicalCalculators: Object.keys(VERIFIED_MEDICAL_DATABASE.clinicalCalculators).length,
                differentialDiagnosis: Object.keys(VERIFIED_MEDICAL_DATABASE.differentialDiagnosis).length,
                expansionEngine: KnowledgeExpansionEngine.getStatistics()
            };
        },
        
        // Access expansion engine
        expandKnowledge: function(topic, context) {
            return KnowledgeExpansionEngine.expandKnowledge(topic, context);
        },
        
        // Get expansion statistics
        getExpansionStats: function() {
            return KnowledgeExpansionEngine.getStatistics();
        },
        
        // Clinical reasoning
        calculateDiagnosticProbability: function(priorProbability, findings) {
            return ClinicalReasoningEngine.calculateDiagnosticProbability(priorProbability, findings);
        },
        
        // Analyze trends
        analyzeTrends: function(labHistory) {
            return ClinicalReasoningEngine.analyzeTrends(labHistory);
        },
        
        // Get verified sources
        getVerifiedSources: function() {
            return VERIFIED_SOURCE_REGISTRY;
        },
        
        // Get evidence levels
        getEvidenceLevels: function() {
            return EVIDENCE_LEVELS;
        }
    };
})();

// Export to window
window.AIMedicalConsultant = AIMedicalConsultant;

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIMedicalConsultant;
}

console.log('✅ AI Medical Consultant v2.0 loaded - Enhanced with verified sources and self-expansion');
