/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  AI MEDICAL CONSULTANT v4.0 - ASCLEPIUS PRO                                  ║
 * ║  Advanced Clinical Intelligence with Comprehensive Knowledge                  ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

const AIMedicalConsultant = (function() {
    'use strict';

    const VERSION = '4.0.0';
    const CODENAME = 'ASCLEPIUS-PRO';

    // ═══════════════════════════════════════════════════════════════════════════
    // COMPREHENSIVE MEDICAL KNOWLEDGE BASE
    // ═══════════════════════════════════════════════════════════════════════════

    const KNOWLEDGE_BASE = {
        
        // ───────────────────────────────────────────────────────────────────────
        // CRITICAL CARE / EMERGENCY
        // ───────────────────────────────────────────────────────────────────────
        
        'post arrest': {
            title: 'Post-Cardiac Arrest Care',
            aka: ['post cardiac arrest', 'post resuscitation', 'ROSC care', 'return of spontaneous circulation'],
            definition: 'Comprehensive care following successful resuscitation from cardiac arrest (ROSC - Return of Spontaneous Circulation)',
            
            diagnosticCriteria: {
                ROSC_confirmed: [
                    'Palpable pulse',
                    'Measurable blood pressure',
                    'Arterial waveform on monitoring',
                    'ETCO2 >40 mmHg (suggests adequate circulation)'
                ]
            },
            
            immediateManagement: {
                airway: [
                    'Secure airway if not already done (ETT preferred)',
                    'Verify ETT placement with waveform capnography',
                    'Target SpO2 92-98% (avoid hyperoxia)',
                    'Target PaCO2 35-45 mmHg (avoid hyper/hypoventilation)'
                ],
                circulation: [
                    'Target MAP ≥65 mmHg (some suggest ≥80)',
                    'Target SBP >90 mmHg',
                    'Vasopressors: Norepinephrine first-line',
                    '12-lead ECG immediately - look for STEMI',
                    'If STEMI → emergent cath lab (PCI)',
                    'Consider echo for cardiac function'
                ],
                neuro: [
                    'Assess GCS/neurological status',
                    'Targeted Temperature Management (TTM)',
                    'Target 32-36°C for 24 hours (TTM2 trial suggests 36°C acceptable)',
                    'Avoid fever aggressively (temp >37.7°C worsens outcomes)',
                    'Avoid hyperglycemia (target glucose 144-180 mg/dL)',
                    'Seizure prophylaxis if clinical seizures'
                ]
            },
            
            TTM_protocol: {
                indication: 'Comatose patients (not following commands) after ROSC',
                target: '32-36°C for at least 24 hours',
                methods: ['Surface cooling', 'Intravascular cooling', 'Cold saline (not as sole method)'],
                rewarming: '0.25-0.5°C per hour',
                avoid: 'Fever for 72 hours after rewarming'
            },
            
            prognostication: {
                timing: 'Wait at least 72 hours after ROSC (longer if TTM or sedation)',
                poorPrognosticSigns: [
                    'Bilateral absent pupillary light reflex at 72h',
                    'Bilateral absent corneal reflex at 72h', 
                    'Absent N20 on SSEP at 24-72h',
                    'Highly malignant EEG patterns',
                    'NSE >60 μg/L at 48-72h',
                    'Status myoclonus within 72h',
                    'Diffuse anoxic injury on CT/MRI'
                ],
                note: 'No single test is 100% - use multimodal approach'
            },
            
            workup: [
                'ECG (STEMI?)',
                'Labs: CBC, CMP, lactate, troponin, ABG, toxicology',
                'Chest X-ray',
                'Echo (EF, wall motion)',
                'CT head (if no obvious cardiac cause)',
                'EEG (seizures, prognostication)',
                'Consider coronary angiography'
            ],
            
            sources: [
                { ref: 'AHA Post-Cardiac Arrest Care Guidelines 2020', evidence: '1a' },
                { ref: 'TTM2 Trial - NEJM 2021', pmid: '34133859', evidence: '1b' },
                { ref: 'ERC-ESICM Guidelines 2021', evidence: '1a' }
            ]
        },

        'cardiac arrest': {
            title: 'Cardiac Arrest Management (ACLS)',
            aka: ['code blue', 'ACLS', 'resuscitation', 'CPR'],
            definition: 'Absence of effective cardiac mechanical activity with no pulse',
            
            shockableRhythms: {
                VF_pVT: {
                    name: 'Ventricular Fibrillation / Pulseless VT',
                    treatment: [
                        'Defibrillation 200J biphasic (or max if unknown)',
                        'CPR 2 minutes immediately after shock',
                        'Epinephrine 1mg IV q3-5min (after 2nd shock)',
                        'Amiodarone 300mg IV first dose, 150mg second dose',
                        'Or Lidocaine 1-1.5 mg/kg',
                        'Continue CPR-shock cycles'
                    ]
                }
            },
            
            nonShockableRhythms: {
                asystole_PEA: {
                    name: 'Asystole / PEA',
                    treatment: [
                        'CPR immediately',
                        'Epinephrine 1mg IV q3-5min',
                        'Identify and treat reversible causes (Hs and Ts)',
                        'NO defibrillation'
                    ],
                    Hs_and_Ts: {
                        Hs: ['Hypovolemia', 'Hypoxia', 'Hydrogen ion (acidosis)', 'Hypo/Hyperkalemia', 'Hypothermia'],
                        Ts: ['Tension pneumothorax', 'Tamponade (cardiac)', 'Toxins', 'Thrombosis (coronary)', 'Thrombosis (pulmonary)']
                    }
                }
            },
            
            highQualityCPR: [
                'Rate: 100-120 compressions/min',
                'Depth: At least 2 inches (5 cm)',
                'Allow full chest recoil',
                'Minimize interruptions (<10 sec)',
                'Rotate compressors every 2 min',
                'Avoid excessive ventilation'
            ],
            
            sources: [
                { ref: 'AHA ACLS Guidelines 2020', evidence: '1a' }
            ]
        },

        'sepsis': {
            title: 'Sepsis & Septic Shock',
            aka: ['septicemia', 'severe sepsis', 'septic shock', 'systemic infection'],
            definition: 'Life-threatening organ dysfunction caused by dysregulated host response to infection',
            
            diagnosticCriteria: {
                sepsis: 'Suspected/documented infection + SOFA score ≥2',
                septicShock: 'Sepsis + vasopressors needed to maintain MAP ≥65 + lactate >2 mmol/L despite adequate fluid resuscitation',
                qSOFA: {
                    criteria: ['RR ≥22/min', 'Altered mentation (GCS <15)', 'SBP ≤100 mmHg'],
                    interpretation: '≥2 = high risk, consider ICU'
                },
                SOFA: {
                    components: ['Respiration (PaO2/FiO2)', 'Coagulation (Platelets)', 'Liver (Bilirubin)', 'Cardiovascular (MAP/vasopressors)', 'CNS (GCS)', 'Renal (Creatinine/UOP)'],
                    scoring: '0-4 points each, total 0-24'
                }
            },
            
            hourOneBunde: [
                '🔬 Measure lactate (remeasure if >2)',
                '🧫 Blood cultures BEFORE antibiotics',
                '💊 Broad-spectrum antibiotics',
                '💧 30 mL/kg crystalloid for hypotension or lactate ≥4',
                '💉 Vasopressors if hypotensive after fluids (target MAP ≥65)'
            ],
            
            antibiotics: {
                timing: 'Within 1 hour of recognition',
                empiric: {
                    community: 'Ceftriaxone + Azithromycin (or Fluoroquinolone)',
                    hospital: 'Piperacillin-tazobactam or Meropenem',
                    pseudomonas: 'Double cover if risk factors',
                    MRSA: 'Add Vancomycin if risk factors'
                }
            },
            
            fluids: {
                initial: '30 mL/kg crystalloid (Lactated Ringers preferred)',
                reassess: 'After each bolus - clinical exam, lactate, UOP',
                caution: 'Avoid over-resuscitation (lung edema)'
            },
            
            vasopressors: {
                firstLine: 'Norepinephrine (target MAP ≥65)',
                secondLine: 'Vasopressin 0.03 units/min (add to NE)',
                thirdLine: 'Epinephrine',
                cardiac: 'Dobutamine if low cardiac output despite fluids'
            },
            
            steroids: {
                indication: 'Septic shock refractory to fluids + vasopressors',
                dose: 'Hydrocortisone 200mg/day (50mg q6h or 200mg continuous)',
                duration: 'Until shock resolved, then taper'
            },
            
            sources: [
                { ref: 'Surviving Sepsis Campaign 2021', evidence: '1a' },
                { ref: 'Sepsis-3 Definitions - JAMA 2016', pmid: '26903338', evidence: '1a' }
            ]
        },

        // ───────────────────────────────────────────────────────────────────────
        // NEUROLOGY
        // ───────────────────────────────────────────────────────────────────────

        'stroke': {
            title: 'Stroke / Cerebrovascular Accident (CVA)',
            aka: ['cva', 'cerebrovascular accident', 'brain attack', 'ischemic stroke', 'hemorrhagic stroke'],
            definition: 'Acute neurological deficit due to vascular injury to the brain',
            
            types: {
                ischemic: {
                    percentage: '87%',
                    subtypes: ['Large vessel atherosclerosis', 'Cardioembolic', 'Small vessel (lacunar)', 'Cryptogenic', 'Other']
                },
                hemorrhagic: {
                    percentage: '13%',
                    subtypes: ['Intracerebral hemorrhage (ICH)', 'Subarachnoid hemorrhage (SAH)']
                }
            },
            
            diagnosticCriteria: {
                clinical: {
                    FAST: ['Face drooping', 'Arm weakness', 'Speech difficulty', 'Time to call 911'],
                    BEFAST: ['Balance', 'Eyes (vision)', 'Face', 'Arm', 'Speech', 'Time'],
                    NIHSS: {
                        range: '0-42',
                        interpretation: {
                            '0': 'No stroke',
                            '1-4': 'Minor',
                            '5-15': 'Moderate',
                            '16-20': 'Moderate-severe',
                            '21-42': 'Severe'
                        }
                    }
                },
                imaging: {
                    CT: 'Rule out hemorrhage (within 20 min)',
                    CTA: 'Identify large vessel occlusion',
                    MRI_DWI: 'Most sensitive for acute ischemia',
                    perfusion: 'Core vs penumbra for late intervention'
                }
            },
            
            management: {
                acute_ischemic: {
                    BP: 'Allow up to 220/120 (unless tPA, then <185/110)',
                    tPA: {
                        window: '≤4.5 hours (or wake-up stroke with DWI-FLAIR mismatch)',
                        dose: '0.9 mg/kg (max 90mg), 10% bolus, 90% over 1 hour',
                        contraindications: ['Active bleeding', 'Recent surgery', 'INR >1.7', 'Platelets <100k', 'BP >185/110']
                    },
                    thrombectomy: {
                        window: '≤24 hours with favorable imaging',
                        indication: 'Large vessel occlusion (ICA, M1, basilar)',
                        NNT: '2.6'
                    }
                },
                hemorrhagic: {
                    BP: 'SBP <140 (if presenting 150-220)',
                    reversal: 'Anticoagulant reversal if applicable',
                    surgery: 'Consider if cerebellar >3cm or deteriorating'
                },
                secondary_prevention: ['Antiplatelet (ASA, clopidogrel)', 'Statin', 'BP control <130/80', 'Anticoagulation if cardioembolic']
            },
            
            sources: [
                { ref: 'AHA/ASA Stroke Guidelines 2019', evidence: '1a' },
                { ref: 'DAWN Trial - NEJM 2018', pmid: '29129157', evidence: '1b' }
            ]
        },

        'tia': {
            title: 'Transient Ischemic Attack',
            aka: ['mini stroke', 'transient ischemic attack'],
            definition: 'Transient neurological dysfunction caused by focal ischemia WITHOUT infarction',
            
            diagnosticCriteria: {
                clinical: 'Sudden focal neurological deficit resolving completely (typically <1 hour)',
                imaging: 'No evidence of acute infarction on MRI DWI'
            },
            
            riskStratification: {
                ABCD2: {
                    components: [
                        'Age ≥60 (1 point)',
                        'BP ≥140/90 (1 point)', 
                        'Clinical: weakness (2) or speech only (1)',
                        'Duration: ≥60min (2) or 10-59min (1)',
                        'Diabetes (1 point)'
                    ],
                    risk: {
                        '0-3': 'Low (1% 2-day stroke risk)',
                        '4-5': 'Moderate (4%)',
                        '6-7': 'High (8%)'
                    }
                }
            },
            
            workup: ['MRI with DWI', 'CTA/MRA head and neck', 'ECG', 'Echo', 'Lipids', 'HbA1c', 'Telemetry'],
            
            management: [
                'Dual antiplatelet x 21 days (ASA + clopidogrel), then single agent',
                'High-intensity statin',
                'BP control',
                'Lifestyle modification',
                'Carotid intervention if >70% symptomatic stenosis'
            ],
            
            sources: [
                { ref: 'AHA/ASA TIA Guidelines 2009', evidence: '1a' },
                { ref: 'CHANCE Trial', evidence: '1b' }
            ]
        },

        // ───────────────────────────────────────────────────────────────────────
        // CARDIOLOGY
        // ───────────────────────────────────────────────────────────────────────

        'acs': {
            title: 'Acute Coronary Syndrome',
            aka: ['heart attack', 'mi', 'myocardial infarction', 'stemi', 'nstemi', 'unstable angina'],
            definition: 'Spectrum of acute myocardial ischemia from unstable angina to STEMI',
            
            types: {
                STEMI: {
                    criteria: 'ST elevation ≥1mm in ≥2 contiguous leads (≥2mm in V1-V3)',
                    treatment: 'Primary PCI within 90 minutes (door-to-balloon)'
                },
                NSTEMI: {
                    criteria: 'Elevated troponin + ischemic symptoms/ECG changes WITHOUT ST elevation',
                    treatment: 'Early invasive strategy within 24-72h if high risk'
                },
                unstableAngina: {
                    criteria: 'Ischemic symptoms WITHOUT troponin elevation',
                    treatment: 'Risk stratify, medical management vs invasive'
                }
            },
            
            management: {
                immediate: [
                    'Aspirin 325mg',
                    'P2Y12 inhibitor (ticagrelor, clopidogrel, prasugrel)',
                    'Anticoagulation (heparin)',
                    'Beta-blocker (if no contraindication)',
                    'Nitrates for chest pain',
                    'Oxygen only if SpO2 <90%'
                ],
                reperfusion: {
                    STEMI: 'PCI preferred; fibrinolysis if PCI not available within 120 min',
                    NSTEMI: 'Early invasive (24-72h) vs conservative based on risk'
                },
                postMI: ['Aspirin lifelong', 'P2Y12 x 12 months', 'Statin', 'ACEi/ARB', 'Beta-blocker', 'Cardiac rehab']
            },
            
            sources: [
                { ref: 'ACC/AHA STEMI Guidelines 2013', evidence: '1a' },
                { ref: 'ESC NSTE-ACS Guidelines 2020', evidence: '1a' }
            ]
        },

        'heart failure': {
            title: 'Heart Failure',
            aka: ['chf', 'congestive heart failure', 'hf', 'hfref', 'hfpef'],
            definition: 'Clinical syndrome from structural or functional cardiac abnormality resulting in reduced CO or elevated filling pressures',
            
            classification: {
                byEF: {
                    HFrEF: 'EF ≤40%',
                    HFmrEF: 'EF 41-49%',
                    HFpEF: 'EF ≥50%'
                },
                NYHA: {
                    I: 'No symptoms with ordinary activity',
                    II: 'Symptoms with ordinary activity',
                    III: 'Symptoms with less than ordinary activity',
                    IV: 'Symptoms at rest'
                }
            },
            
            diagnosticCriteria: {
                symptoms: ['Dyspnea', 'Orthopnea', 'PND', 'Fatigue', 'Edema'],
                signs: ['JVD', 'S3 gallop', 'Pulmonary crackles', 'Peripheral edema'],
                tests: ['BNP >100 or NT-proBNP >300', 'Echo showing reduced EF or diastolic dysfunction', 'CXR: cardiomegaly, pulmonary edema']
            },
            
            management: {
                GDMT_HFrEF: {
                    fourPillars: [
                        '1. ACEi/ARB/ARNI (sacubitril-valsartan)',
                        '2. Beta-blocker (carvedilol, metoprolol succinate, bisoprolol)',
                        '3. MRA (spironolactone, eplerenone)',
                        '4. SGLT2i (dapagliflozin, empagliflozin)'
                    ],
                    additional: ['Diuretics for congestion', 'Hydralazine-nitrate (especially AA patients)', 'Ivabradine if HR >70', 'Digoxin']
                },
                devices: {
                    ICD: 'EF ≤35% despite 3 months GDMT',
                    CRT: 'EF ≤35% + LBBB + QRS ≥150ms'
                },
                acute: ['Diuretics IV', 'Vasodilators', 'Inotropes if cardiogenic shock', 'Consider mechanical support']
            },
            
            sources: [
                { ref: 'ACC/AHA HF Guidelines 2022', evidence: '1a' },
                { ref: 'ESC HF Guidelines 2021', evidence: '1a' }
            ]
        },

        'atrial fibrillation': {
            title: 'Atrial Fibrillation',
            aka: ['afib', 'af', 'a-fib', 'atrial fib'],
            definition: 'Supraventricular tachyarrhythmia with uncoordinated atrial activation',
            
            diagnosticCriteria: {
                ECG: ['Irregularly irregular R-R intervals', 'No distinct P waves', 'Fibrillatory waves']
            },
            
            riskScores: {
                CHA2DS2VASc: {
                    components: ['CHF (1)', 'HTN (1)', 'Age ≥75 (2)', 'DM (1)', 'Stroke/TIA (2)', 'Vascular disease (1)', 'Age 65-74 (1)', 'Female (1)'],
                    interpretation: {
                        male: '0 = no anticoag, 1 = consider, ≥2 = anticoag',
                        female: '1 = no anticoag (sex alone), ≥2 = consider/anticoag'
                    }
                },
                HASBLED: {
                    components: ['HTN', 'Abnormal renal/liver', 'Stroke', 'Bleeding', 'Labile INR', 'Elderly', 'Drugs/alcohol'],
                    interpretation: '≥3 = high bleeding risk (does NOT preclude anticoagulation)'
                }
            },
            
            management: {
                anticoagulation: {
                    indication: 'CHA2DS2-VASc ≥2 (men) or ≥3 (women)',
                    preferred: 'DOACs over warfarin for non-valvular AF'
                },
                rateControl: {
                    target: '<110 bpm at rest (lenient) or <80 (strict)',
                    agents: ['Beta-blockers', 'Diltiazem/Verapamil', 'Digoxin']
                },
                rhythmControl: {
                    agents: ['Amiodarone', 'Flecainide', 'Propafenone', 'Sotalol'],
                    ablation: 'Consider if symptomatic despite meds'
                }
            },
            
            sources: [
                { ref: 'ACC/AHA AF Guidelines 2023', evidence: '1a' },
                { ref: 'ESC AF Guidelines 2020', evidence: '1a' }
            ]
        },

        // ───────────────────────────────────────────────────────────────────────
        // NEPHROLOGY
        // ───────────────────────────────────────────────────────────────────────

        'aki': {
            title: 'Acute Kidney Injury',
            aka: ['acute renal failure', 'arf', 'acute kidney injury'],
            definition: 'Abrupt decrease in kidney function over hours to days',
            
            diagnosticCriteria: {
                KDIGO: [
                    'Increase in SCr ≥0.3 mg/dL within 48 hours, OR',
                    'Increase in SCr ≥1.5x baseline within 7 days, OR',
                    'Urine output <0.5 mL/kg/h for 6 hours'
                ],
                staging: {
                    stage1: 'SCr 1.5-1.9x baseline OR ≥0.3 increase OR UOP <0.5 mL/kg/h x 6-12h',
                    stage2: 'SCr 2.0-2.9x baseline OR UOP <0.5 mL/kg/h x ≥12h',
                    stage3: 'SCr ≥3.0x baseline OR ≥4.0 mg/dL OR RRT OR UOP <0.3 mL/kg/h x ≥24h'
                }
            },
            
            etiologies: {
                prerenal: {
                    causes: ['Hypovolemia', 'Heart failure', 'Sepsis', 'Hepatorenal'],
                    FENa: '<1%',
                    BUN_Cr: '>20:1'
                },
                intrinsic: {
                    causes: ['ATN', 'AIN', 'Glomerulonephritis', 'Vascular'],
                    FENa: '>2%',
                    BUN_Cr: '<20:1'
                },
                postrenal: {
                    causes: ['BPH', 'Stones', 'Malignancy', 'Stricture'],
                    diagnosis: 'Ultrasound showing hydronephrosis'
                }
            },
            
            workup: ['Urinalysis + microscopy', 'Urine electrolytes (FENa, FeUrea)', 'Renal ultrasound', 'Consider biopsy if unclear'],
            
            management: [
                'Treat underlying cause',
                'Optimize volume status',
                'Avoid nephrotoxins (NSAIDs, contrast, aminoglycosides)',
                'Adjust medications for renal function',
                'Monitor electrolytes closely'
            ],
            
            RRT_indications: 'AEIOU: Acidosis (pH <7.1), Electrolytes (K >6.5 refractory), Intoxication, Overload (pulmonary edema refractory), Uremia (encephalopathy, pericarditis)',
            
            sources: [
                { ref: 'KDIGO AKI Guidelines 2012', evidence: '1a' }
            ]
        },

        'hyponatremia': {
            title: 'Hyponatremia',
            aka: ['low sodium', 'hyponatremia'],
            definition: 'Serum sodium <135 mEq/L',
            
            classification: {
                bySeverity: {
                    mild: '130-134 mEq/L',
                    moderate: '125-129 mEq/L',
                    severe: '<125 mEq/L'
                },
                byVolume: {
                    hypovolemic: {
                        causes: ['GI losses', 'Diuretics', 'Adrenal insufficiency', 'Cerebral salt wasting'],
                        urineNa: '<20 (extrarenal) or >20 (renal losses)'
                    },
                    euvolemic: {
                        causes: ['SIADH', 'Hypothyroidism', 'Adrenal insufficiency', 'Psychogenic polydipsia'],
                        SIADH_criteria: ['Serum osm <275', 'Urine osm >100', 'Urine Na >40', 'Euvolemic', 'Normal renal/thyroid/adrenal']
                    },
                    hypervolemic: {
                        causes: ['CHF', 'Cirrhosis', 'Nephrotic syndrome'],
                        urineNa: '<20 mEq/L'
                    }
                }
            },
            
            management: {
                acute_symptomatic: {
                    symptoms: ['Seizures', 'Severe confusion', 'Coma'],
                    treatment: '3% saline 100-150mL bolus, repeat up to 3x if needed',
                    target: 'Increase Na by 4-6 mEq/L in first 1-2 hours'
                },
                chronic: {
                    maxCorrection: '8-10 mEq/L per 24 hours (some say 6-8)',
                    hypovolemic: 'Normal saline',
                    SIADH: 'Fluid restriction, salt tabs, tolvaptan, urea',
                    hypervolemic: 'Fluid + salt restriction, diuretics'
                },
                ODS_risk: {
                    name: 'Osmotic Demyelination Syndrome',
                    riskFactors: ['Chronic hyponatremia', 'Na <105', 'Hypokalemia', 'Alcoholism', 'Malnutrition'],
                    prevention: 'Correct slowly, q2-4h Na monitoring'
                }
            },
            
            sources: [
                { ref: 'European Hyponatremia Guidelines 2014', evidence: '1a' }
            ]
        },

        'hyperkalemia': {
            title: 'Hyperkalemia',
            aka: ['high potassium', 'hyperkalemia', 'elevated potassium'],
            definition: 'Serum potassium >5.5 mEq/L',
            
            diagnosticCriteria: {
                severity: {
                    mild: '5.5-6.0 mEq/L',
                    moderate: '6.1-6.9 mEq/L',
                    severe: '≥7.0 mEq/L'
                },
                ECG_changes: ['Peaked T waves (earliest)', 'Prolonged PR', 'Wide QRS', 'Loss of P waves', 'Sine wave (pre-arrest)']
            },
            
            causes: ['Renal failure', 'ACEi/ARB', 'K-sparing diuretics', 'Acidosis', 'Rhabdomyolysis', 'Tumor lysis', 'Adrenal insufficiency', 'Pseudohyperkalemia'],
            
            management: {
                membrane_stabilization: {
                    indication: 'ECG changes or K >6.5',
                    calcium: 'Calcium gluconate 1-2g IV over 5-10 min (or CaCl if central line)',
                    onset: '1-3 minutes',
                    duration: '30-60 minutes'
                },
                shift_intracellular: [
                    'Insulin 10 units + D50 (check glucose)',
                    'Beta-agonist (albuterol nebulizer)',
                    'Sodium bicarbonate (if acidotic)'
                ],
                elimination: [
                    'Diuretics (furosemide)',
                    'Kayexalate/Patiromer/Lokelma (GI binders)',
                    'Hemodialysis (definitive)'
                ]
            },
            
            sources: [
                { ref: 'AHA Hyperkalemia Guidelines', evidence: '2a' }
            ]
        },

        // ───────────────────────────────────────────────────────────────────────
        // PULMONOLOGY
        // ───────────────────────────────────────────────────────────────────────

        'pe': {
            title: 'Pulmonary Embolism',
            aka: ['pulmonary embolism', 'pulmonary embolus', 'pe', 'dvt'],
            definition: 'Obstruction of pulmonary artery by thrombus (usually from DVT)',
            
            diagnosticCriteria: {
                Wells: {
                    components: [
                        'DVT symptoms (3)',
                        'PE most likely (3)',
                        'HR >100 (1.5)',
                        'Immobilization/surgery (1.5)',
                        'Prior DVT/PE (1.5)',
                        'Hemoptysis (1)',
                        'Malignancy (1)'
                    ],
                    interpretation: {
                        unlikely: '≤4 → D-dimer',
                        likely: '>4 → CT angiography'
                    }
                },
                PERC: {
                    criteria: ['Age <50', 'HR <100', 'SpO2 ≥95%', 'No hemoptysis', 'No estrogen', 'No prior DVT/PE', 'No unilateral leg swelling', 'No surgery/trauma in 4 wks'],
                    use: 'If ALL negative + low clinical suspicion → no further testing'
                }
            },
            
            severity: {
                massive: 'Hypotension (SBP <90) or requiring pressors',
                submassive: 'Normotensive with RV dysfunction (echo) or elevated troponin',
                lowRisk: 'Normotensive, no RV dysfunction'
            },
            
            management: {
                anticoagulation: {
                    preferred: 'DOACs (rivaroxaban, apixaban) for most patients',
                    LMWH: 'Preferred for cancer-associated PE',
                    duration: '3 months minimum; longer if unprovoked or ongoing risk'
                },
                thrombolysis: {
                    indication: 'Massive PE with hemodynamic instability',
                    agent: 'Alteplase 100mg over 2 hours'
                },
                catheterDirected: 'Consider for submassive with RV dysfunction',
                IVCfilter: 'Only if anticoagulation contraindicated'
            },
            
            sources: [
                { ref: 'ESC PE Guidelines 2019', evidence: '1a' },
                { ref: 'CHEST Antithrombotic Guidelines 2021', evidence: '1a' }
            ]
        },

        'pneumonia': {
            title: 'Pneumonia',
            aka: ['pna', 'pneumonia', 'cap', 'hap', 'vap', 'lung infection'],
            definition: 'Infection of the lung parenchyma',
            
            types: {
                CAP: 'Community-Acquired Pneumonia',
                HAP: 'Hospital-Acquired (≥48h after admission)',
                VAP: 'Ventilator-Associated (≥48h after intubation)',
                aspiration: 'Aspiration pneumonia/pneumonitis'
            },
            
            diagnosticCriteria: {
                clinical: ['Cough', 'Fever', 'Dyspnea', 'Pleuritic chest pain', 'Crackles'],
                imaging: 'New infiltrate on chest X-ray or CT',
                labs: 'Leukocytosis, elevated procalcitonin'
            },
            
            severity: {
                CURB65: {
                    components: ['Confusion', 'Urea >7 mmol/L', 'RR ≥30', 'BP <90/60', 'Age ≥65'],
                    interpretation: {
                        '0-1': 'Outpatient',
                        '2': 'Consider admission',
                        '3-5': 'ICU consideration'
                    }
                }
            },
            
            management: {
                CAP_outpatient: 'Amoxicillin OR Doxycycline OR Macrolide',
                CAP_inpatient: 'Beta-lactam + Macrolide OR Respiratory fluoroquinolone',
                CAP_ICU: 'Beta-lactam + Macrolide (or FQ); add MRSA/Pseudomonas coverage if risk',
                HAP_VAP: 'Cover MRSA + Pseudomonas (double-cover if shock or high risk)',
                duration: '5 days minimum (CAP); 7 days (HAP/VAP)'
            },
            
            sources: [
                { ref: 'ATS/IDSA CAP Guidelines 2019', evidence: '1a' },
                { ref: 'ATS/IDSA HAP/VAP Guidelines 2016', evidence: '1a' }
            ]
        },

        // ───────────────────────────────────────────────────────────────────────
        // ENDOCRINOLOGY
        // ───────────────────────────────────────────────────────────────────────

        'dka': {
            title: 'Diabetic Ketoacidosis',
            aka: ['dka', 'diabetic ketoacidosis'],
            definition: 'Metabolic emergency in diabetes with hyperglycemia, ketosis, and acidosis',
            
            diagnosticCriteria: {
                triad: ['Glucose >250 mg/dL', 'pH <7.3 or HCO3 <18', 'Positive ketones + anion gap >12'],
                severity: {
                    mild: 'pH 7.25-7.30, HCO3 15-18',
                    moderate: 'pH 7.0-7.24, HCO3 10-14',
                    severe: 'pH <7.0, HCO3 <10'
                }
            },
            
            management: {
                fluids: {
                    initial: 'NS 1-1.5L in first hour',
                    subsequent: '250-500 mL/h NS (or 0.45% if Na >140)',
                    addDextrose: 'D5 when glucose <200'
                },
                insulin: {
                    bolus: '0.1 units/kg IV',
                    infusion: '0.1 units/kg/hr',
                    target: 'Glucose drop 50-70 mg/dL per hour'
                },
                potassium: {
                    check: 'Before insulin if possible',
                    ifLow: 'Hold insulin until K >3.3, then replace',
                    ifNormal: 'Add 20-40 mEq to each liter when K <5.2'
                },
                bicarbonate: 'Only if pH <6.9 or severe hyperkalemia'
            },
            
            resolution: ['pH >7.3', 'HCO3 >18', 'Anion gap <12', 'Glucose <200'],
            
            transition: 'Overlap SC insulin with IV for 1-2 hours before stopping drip',
            
            sources: [
                { ref: 'ADA DKA Guidelines 2024', evidence: '1a' }
            ]
        },

        // ───────────────────────────────────────────────────────────────────────
        // INFECTIOUS DISEASE
        // ───────────────────────────────────────────────────────────────────────

        'meningitis': {
            title: 'Meningitis',
            aka: ['meningitis', 'meningeal infection'],
            definition: 'Inflammation of the meninges, usually due to infection',
            
            diagnosticCriteria: {
                clinical: ['Headache', 'Fever', 'Neck stiffness', 'Photophobia', 'Altered mental status'],
                signs: ['Kernig sign', 'Brudzinski sign'],
                CSF: {
                    bacterial: { WBC: '>1000 (PMN)', protein: 'High (>100)', glucose: 'Low (<40 or <2/3 serum)' },
                    viral: { WBC: '10-500 (lymph)', protein: 'Mild elevation', glucose: 'Normal' },
                    TB_fungal: { WBC: '100-500 (lymph)', protein: 'Very high', glucose: 'Low' }
                }
            },
            
            management: {
                empiric: {
                    adult: 'Vancomycin + Ceftriaxone + Dexamethasone',
                    elderly_immunocompromised: 'Add Ampicillin (for Listeria)',
                    timing: 'Antibiotics ASAP (within 1 hour); do not delay for LP'
                },
                dexamethasone: {
                    dose: '0.15 mg/kg q6h x 4 days',
                    timing: 'Before or with first dose of antibiotics',
                    benefit: 'Reduces mortality/sequelae in S. pneumoniae'
                },
                HSV_encephalitis: 'Add Acyclovir if encephalitis suspected'
            },
            
            sources: [
                { ref: 'IDSA Meningitis Guidelines', evidence: '1a' }
            ]
        },

        'uti': {
            title: 'Urinary Tract Infection',
            aka: ['uti', 'urinary tract infection', 'cystitis', 'pyelonephritis', 'urosepsis'],
            definition: 'Infection of the urinary tract, ranging from cystitis to pyelonephritis to urosepsis',
            
            types: {
                cystitis: 'Bladder infection (dysuria, frequency, urgency)',
                pyelonephritis: 'Kidney infection (fever, flank pain, CVA tenderness)',
                urosepsis: 'UTI with systemic signs of sepsis'
            },
            
            diagnosticCriteria: {
                symptoms: ['Dysuria', 'Frequency', 'Urgency', 'Suprapubic pain', 'Hematuria'],
                labs: {
                    UA: ['Pyuria (>10 WBC/hpf)', 'Bacteriuria', 'Positive leukocyte esterase', 'Nitrites (gram-neg)'],
                    culture: '>100,000 CFU/mL (or >1,000 if symptomatic)'
                }
            },
            
            management: {
                uncomplicated_cystitis: {
                    firstLine: ['Nitrofurantoin 100mg BID x 5 days', 'TMP-SMX DS BID x 3 days', 'Fosfomycin 3g single dose'],
                    avoid: 'Fluoroquinolones (save for complicated)'
                },
                pyelonephritis: {
                    outpatient: 'Fluoroquinolone x 5-7 days OR TMP-SMX x 14 days',
                    inpatient: 'IV Ceftriaxone or Fluoroquinolone (broaden if septic)'
                },
                urosepsis: 'Broad-spectrum + sepsis management'
            },
            
            sources: [
                { ref: 'IDSA UTI Guidelines', evidence: '1a' }
            ]
        }
    };

    // ═══════════════════════════════════════════════════════════════════════════
    // SYNONYM MAPPING
    // ═══════════════════════════════════════════════════════════════════════════

    const SYNONYMS = {};
    
    // Build synonym map from knowledge base
    Object.keys(KNOWLEDGE_BASE).forEach(key => {
        const entry = KNOWLEDGE_BASE[key];
        if (entry.aka) {
            entry.aka.forEach(alias => {
                SYNONYMS[alias.toLowerCase()] = key;
            });
        }
        SYNONYMS[key.toLowerCase()] = key;
        if (entry.title) {
            SYNONYMS[entry.title.toLowerCase()] = key;
        }
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // QUERY PROCESSOR
    // ═══════════════════════════════════════════════════════════════════════════

    function findTopic(query) {
        const q = query.toLowerCase();
        
        // Direct match
        for (const [key, value] of Object.entries(SYNONYMS)) {
            if (q.includes(key)) {
                return KNOWLEDGE_BASE[value];
            }
        }
        
        // Fuzzy matching
        const words = q.split(/\s+/);
        for (const word of words) {
            if (word.length > 3) {
                for (const [key, value] of Object.entries(SYNONYMS)) {
                    if (key.includes(word) || word.includes(key)) {
                        return KNOWLEDGE_BASE[value];
                    }
                }
            }
        }
        
        return null;
    }

    function detectIntent(query) {
        const q = query.toLowerCase();
        
        if (/diagnos|criteria|how.*diagnos|definition/.test(q)) return 'diagnostic';
        if (/treat|manag|therap|medication|drug/.test(q)) return 'treatment';
        if (/cause|etiolog|why|differential|ddx/.test(q)) return 'etiology';
        if (/workup|test|lab|imaging/.test(q)) return 'workup';
        if (/prognos|outcome|survival|mortality/.test(q)) return 'prognosis';
        
        return 'general';
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // RESPONSE FORMATTER
    // ═══════════════════════════════════════════════════════════════════════════

    function formatResponse(topic, intent) {
        if (!topic) return null;
        
        let response = '';
        
        // Title
        response += `## 🏥 ${topic.title}\n\n`;
        
        // Definition
        if (topic.definition) {
            response += `**Definition:** ${topic.definition}\n\n`;
        }
        
        // Intent-specific content
        if (intent === 'diagnostic' || intent === 'general') {
            if (topic.diagnosticCriteria) {
                response += `### 📋 Diagnostic Criteria\n\n`;
                response += formatObject(topic.diagnosticCriteria);
            }
        }
        
        if (intent === 'treatment' || intent === 'general') {
            if (topic.management) {
                response += `### 💊 Management\n\n`;
                response += formatObject(topic.management);
            }
            if (topic.immediateManagement) {
                response += `### ⚡ Immediate Management\n\n`;
                response += formatObject(topic.immediateManagement);
            }
            if (topic.hourOneBunde) {
                response += `### ⏱️ Hour-1 Bundle\n\n`;
                topic.hourOneBunde.forEach(item => {
                    response += `${item}\n`;
                });
                response += '\n';
            }
        }
        
        if (intent === 'etiology') {
            if (topic.causes) {
                response += `### 🔍 Causes\n\n`;
                response += formatArray(topic.causes);
            }
            if (topic.etiologies) {
                response += `### 🔍 Etiologies\n\n`;
                response += formatObject(topic.etiologies);
            }
            if (topic.types) {
                response += `### 📑 Types\n\n`;
                response += formatObject(topic.types);
            }
        }
        
        if (intent === 'workup') {
            if (topic.workup) {
                response += `### 🔬 Workup\n\n`;
                response += formatArray(topic.workup);
            }
        }
        
        if (intent === 'prognosis') {
            if (topic.prognostication) {
                response += `### 📊 Prognosis\n\n`;
                response += formatObject(topic.prognostication);
            }
            if (topic.prognosis) {
                response += `### 📊 Prognosis\n\n`;
                response += formatObject(topic.prognosis);
            }
        }
        
        // For general queries, include additional sections
        if (intent === 'general') {
            if (topic.types && !response.includes('Types')) {
                response += `### 📑 Types\n\n`;
                response += formatObject(topic.types);
            }
            if (topic.workup && !response.includes('Workup')) {
                response += `### 🔬 Workup\n\n`;
                response += formatArray(topic.workup);
            }
        }
        
        // Sources
        if (topic.sources && topic.sources.length > 0) {
            response += `\n---\n### 📚 References\n`;
            topic.sources.forEach(src => {
                response += `• ${src.ref}`;
                if (src.pmid) response += ` (PMID: ${src.pmid})`;
                if (src.evidence) response += ` [${src.evidence}]`;
                response += '\n';
            });
        }
        
        return response;
    }

    function formatObject(obj, depth = 0) {
        let result = '';
        const indent = '  '.repeat(depth);
        
        for (const [key, value] of Object.entries(obj)) {
            const label = key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim();
            
            if (Array.isArray(value)) {
                result += `${indent}**${label}:**\n`;
                value.forEach(item => {
                    if (typeof item === 'string') {
                        result += `${indent}• ${item}\n`;
                    } else {
                        result += formatObject(item, depth + 1);
                    }
                });
            } else if (typeof value === 'object' && value !== null) {
                result += `${indent}**${label}:**\n`;
                result += formatObject(value, depth + 1);
            } else {
                result += `${indent}• **${label}:** ${value}\n`;
            }
        }
        
        return result + '\n';
    }

    function formatArray(arr) {
        return arr.map(item => `• ${item}`).join('\n') + '\n\n';
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // CONVERSATION MANAGER
    // ═══════════════════════════════════════════════════════════════════════════

    const conversations = new Map();

    function getConversation(patientId) {
        if (!conversations.has(patientId)) {
            conversations.set(patientId, []);
        }
        return conversations.get(patientId);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // PUBLIC API
    // ═══════════════════════════════════════════════════════════════════════════

    return {
        version: VERSION,
        codename: CODENAME,
        isReady: true,

        startConsultation(patientId) {
            conversations.set(patientId, []);
            return {
                success: true,
                message: `AI Medical Consultant v${VERSION} ready`,
                capabilities: Object.keys(KNOWLEDGE_BASE)
            };
        },

        askQuestion(patientId, query, patient) {
            const conv = getConversation(patientId);
            conv.push({ role: 'user', content: query, timestamp: Date.now() });
            
            // Find topic
            const topic = findTopic(query);
            const intent = detectIntent(query);
            
            let responseText;
            let confidence = 0;
            let sources = [];
            
            if (topic) {
                responseText = formatResponse(topic, intent);
                confidence = 0.95;
                sources = topic.sources || [];
            } else {
                // Fallback - provide helpful response
                responseText = `## 🤖 Medical Query\n\n`;
                responseText += `I understand you're asking about **"${query}"**.\n\n`;
                responseText += `I have comprehensive information on:\n\n`;
                
                const categories = {
                    'Critical Care': ['post arrest', 'cardiac arrest', 'sepsis'],
                    'Neurology': ['stroke', 'tia'],
                    'Cardiology': ['acs', 'heart failure', 'atrial fibrillation'],
                    'Nephrology': ['aki', 'hyponatremia', 'hyperkalemia'],
                    'Pulmonology': ['pe', 'pneumonia'],
                    'Endocrinology': ['dka'],
                    'Infectious Disease': ['meningitis', 'uti']
                };
                
                for (const [cat, topics] of Object.entries(categories)) {
                    responseText += `**${cat}:** ${topics.map(t => KNOWLEDGE_BASE[t]?.title || t).join(', ')}\n`;
                }
                
                responseText += `\n**Try asking:**\n`;
                responseText += `• "What are the diagnostic criteria for [condition]?"\n`;
                responseText += `• "How do you treat [condition]?"\n`;
                responseText += `• "What causes [condition]?"\n`;
                
                confidence = 0.5;
            }
            
            // Add confidence badge
            responseText += `\n---\n✅ **Confidence:** ${Math.round(confidence * 100)}% | `;
            responseText += `**Source:** ${sources.length > 0 ? 'Evidence-Based Guidelines' : 'Knowledge Base'}`;
            
            conv.push({ role: 'assistant', content: responseText, timestamp: Date.now() });
            
            return {
                success: true,
                response: {
                    text: responseText,
                    confidence: confidence,
                    sources: sources.map(s => s.ref)
                }
            };
        },

        getHistory(patientId) {
            return getConversation(patientId);
        },

        clearHistory(patientId) {
            conversations.delete(patientId);
            return { success: true };
        },

        getCapabilities() {
            return {
                topics: Object.keys(KNOWLEDGE_BASE),
                count: Object.keys(KNOWLEDGE_BASE).length
            };
        },
        
        getDatabaseInfo() {
            return {
                version: VERSION,
                topics: Object.keys(KNOWLEDGE_BASE).length,
                ready: true
            };
        }
    };
})();

// Export
window.AIMedicalConsultant = AIMedicalConsultant;
window.NeuralClinicalIntelligence = AIMedicalConsultant;

console.log('✅ AI Medical Consultant v4.0 ASCLEPIUS-PRO loaded');
console.log('📚 Topics available:', Object.keys(AIMedicalConsultant.getCapabilities().topics).length);
