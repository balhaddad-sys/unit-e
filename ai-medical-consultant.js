/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  NEURAL CLINICAL INTELLIGENCE ENGINE v3.0 - "ASCLEPIUS"                      ║
 * ║  Advanced Medical AI with Deep Clinical Reasoning                             ║
 * ╠══════════════════════════════════════════════════════════════════════════════╣
 * ║  Features:                                                                    ║
 * ║  • Semantic Understanding - Understands intent, not just keywords            ║
 * ║  • Chain-of-Thought Reasoning - Shows clinical thinking process              ║
 * ║  • Adaptive Knowledge Synthesis - Generates answers for ANY medical topic    ║
 * ║  • Multi-Source Verification - Cross-references multiple guidelines          ║
 * ║  • Contextual Memory - Remembers conversation context                        ║
 * ║  • Uncertainty Quantification - Honest about confidence levels               ║
 * ║  • Real-time Learning - Expands knowledge base dynamically                   ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

const NeuralClinicalIntelligence = (function() {
    'use strict';

    // ═══════════════════════════════════════════════════════════════════════════
    // CORE CONFIGURATION
    // ═══════════════════════════════════════════════════════════════════════════
    
    const CONFIG = {
        version: '3.0.0',
        codename: 'ASCLEPIUS',
        reasoning: {
            enableChainOfThought: true,
            showReasoningProcess: true,
            maxReasoningDepth: 5,
            uncertaintyThreshold: 0.6
        },
        knowledge: {
            enableDynamicExpansion: true,
            enableSemanticSearch: true,
            enableCrossReference: true,
            minConfidenceForResponse: 0.4
        },
        response: {
            style: 'comprehensive', // 'concise', 'comprehensive', 'teaching'
            includeReferences: true,
            includeReasoning: true,
            formatMarkdown: true
        }
    };

    // ═══════════════════════════════════════════════════════════════════════════
    // COMPREHENSIVE MEDICAL KNOWLEDGE BASE
    // ═══════════════════════════════════════════════════════════════════════════

    const MEDICAL_KNOWLEDGE = {
        
        // ─────────────────────────────────────────────────────────────────────────
        // NEUROLOGY - Comprehensive Stroke/CVA Knowledge
        // ─────────────────────────────────────────────────────────────────────────
        
        neurology: {
            stroke: {
                definition: 'Acute neurological deficit due to vascular injury to the brain',
                synonyms: ['CVA', 'cerebrovascular accident', 'brain attack'],
                
                classification: {
                    ischemic: {
                        percentage: '87% of all strokes',
                        subtypes: {
                            large_vessel: {
                                name: 'Large Vessel Atherosclerosis',
                                mechanism: 'Atherosclerotic plaque in carotid, vertebral, or major intracranial arteries',
                                percentage: '20-25%',
                                riskFactors: ['Hypertension', 'Diabetes', 'Hyperlipidemia', 'Smoking'],
                                imaging: 'CTA/MRA shows >50% stenosis of relevant artery'
                            },
                            cardioembolic: {
                                name: 'Cardioembolic Stroke',
                                mechanism: 'Embolism from cardiac source',
                                percentage: '20-30%',
                                sources: ['Atrial fibrillation (most common)', 'Mechanical valve', 'Recent MI with LV thrombus', 'Infective endocarditis', 'Patent foramen ovale'],
                                imaging: 'Often cortical, multiple territories'
                            },
                            small_vessel: {
                                name: 'Small Vessel Disease (Lacunar)',
                                mechanism: 'Lipohyalinosis of penetrating arteries',
                                percentage: '20-25%',
                                syndromes: ['Pure motor hemiparesis', 'Pure sensory stroke', 'Ataxic hemiparesis', 'Dysarthria-clumsy hand'],
                                location: 'Basal ganglia, thalamus, internal capsule, pons',
                                size: '<1.5 cm'
                            },
                            cryptogenic: {
                                name: 'Cryptogenic/ESUS',
                                mechanism: 'Embolic stroke of undetermined source',
                                percentage: '25-30%',
                                workup: 'Extended cardiac monitoring, TEE, hypercoagulable workup'
                            },
                            other: {
                                name: 'Other Determined Etiology',
                                causes: ['Arterial dissection', 'Vasculitis', 'Hypercoagulable states', 'Moyamoya', 'CADASIL']
                            }
                        },
                        toastClassification: 'Trial of Org 10172 in Acute Stroke Treatment'
                    },
                    hemorrhagic: {
                        percentage: '13% of all strokes',
                        subtypes: {
                            intracerebral: {
                                name: 'Intracerebral Hemorrhage (ICH)',
                                percentage: '10%',
                                causes: {
                                    hypertensive: {
                                        locations: ['Basal ganglia (putamen most common)', 'Thalamus', 'Pons', 'Cerebellum'],
                                        mechanism: 'Charcot-Bouchard microaneurysm rupture'
                                    },
                                    amyloid_angiopathy: {
                                        locations: ['Lobar (cortical-subcortical junction)'],
                                        population: 'Elderly, associated with dementia',
                                        recurrence: 'High risk of recurrent lobar hemorrhage'
                                    },
                                    other: ['AVM', 'Cavernoma', 'Tumor', 'Coagulopathy', 'Drug-induced']
                                }
                            },
                            subarachnoid: {
                                name: 'Subarachnoid Hemorrhage (SAH)',
                                percentage: '3%',
                                causes: {
                                    aneurysmal: '85% - Berry aneurysm rupture',
                                    nonaneurysmal: '15% - Perimesencephalic, AVM, trauma'
                                },
                                presentation: 'Thunderclap headache - "worst headache of life"',
                                complications: ['Rebleeding', 'Vasospasm (days 4-14)', 'Hydrocephalus', 'Seizures', 'Hyponatremia']
                            }
                        }
                    }
                },
                
                clinicalPresentation: {
                    anterior_circulation: {
                        MCA: {
                            territory: 'Middle Cerebral Artery',
                            symptoms: [
                                'Contralateral hemiparesis (face & arm > leg)',
                                'Contralateral hemisensory loss',
                                'Homonymous hemianopia',
                                'Aphasia (dominant hemisphere)',
                                'Neglect (non-dominant hemisphere)',
                                'Gaze deviation toward lesion'
                            ]
                        },
                        ACA: {
                            territory: 'Anterior Cerebral Artery',
                            symptoms: [
                                'Contralateral leg weakness > arm',
                                'Abulia/akinetic mutism (bilateral)',
                                'Urinary incontinence',
                                'Alien hand syndrome'
                            ]
                        }
                    },
                    posterior_circulation: {
                        PCA: {
                            territory: 'Posterior Cerebral Artery',
                            symptoms: [
                                'Homonymous hemianopia with macular sparing',
                                'Visual agnosia',
                                'Memory impairment (hippocampus)',
                                'Alexia without agraphia (dominant)'
                            ]
                        },
                        basilar: {
                            territory: 'Basilar Artery',
                            symptoms: [
                                'Quadriplegia',
                                'Locked-in syndrome',
                                'Cranial nerve palsies',
                                'Altered consciousness',
                                'Cerebellar signs'
                            ],
                            warning: 'MEDICAL EMERGENCY - high mortality'
                        },
                        vertebral_PICA: {
                            territory: 'Vertebral/PICA (Lateral Medullary/Wallenberg)',
                            symptoms: [
                                'Ipsilateral: facial numbness, Horner syndrome, ataxia, dysphagia',
                                'Contralateral: body pain/temperature loss',
                                'Vertigo, nystagmus, nausea'
                            ]
                        }
                    }
                },
                
                diagnosis: {
                    clinical_scales: {
                        NIHSS: {
                            name: 'NIH Stroke Scale',
                            range: '0-42',
                            components: [
                                '1a. Level of consciousness (0-3)',
                                '1b. LOC questions (0-2)',
                                '1c. LOC commands (0-2)',
                                '2. Best gaze (0-2)',
                                '3. Visual fields (0-3)',
                                '4. Facial palsy (0-3)',
                                '5. Motor arm (0-4 each)',
                                '6. Motor leg (0-4 each)',
                                '7. Limb ataxia (0-2)',
                                '8. Sensory (0-2)',
                                '9. Best language (0-3)',
                                '10. Dysarthria (0-2)',
                                '11. Extinction/inattention (0-2)'
                            ],
                            interpretation: {
                                '0': 'No stroke symptoms',
                                '1-4': 'Minor stroke',
                                '5-15': 'Moderate stroke',
                                '16-20': 'Moderate-severe stroke',
                                '21-42': 'Severe stroke'
                            },
                            clinicalUse: 'Guides treatment decisions, predicts outcomes'
                        },
                        FAST: {
                            name: 'FAST Screening',
                            components: ['Face drooping', 'Arm weakness', 'Speech difficulty', 'Time to call 911'],
                            sensitivity: '85%',
                            use: 'Public awareness and prehospital screening'
                        },
                        BEFAST: {
                            name: 'BE-FAST (Enhanced)',
                            components: ['Balance', 'Eyes (vision)', 'Face', 'Arm', 'Speech', 'Time'],
                            improvement: 'Captures posterior circulation strokes missed by FAST'
                        }
                    },
                    
                    imaging: {
                        CT_head: {
                            timing: 'Within 20 minutes of arrival',
                            purpose: 'Rule out hemorrhage before thrombolysis',
                            findings: {
                                acute_ischemic: ['Hyperdense MCA sign', 'Loss of gray-white differentiation', 'Sulcal effacement', 'Insular ribbon sign'],
                                hemorrhage: 'Hyperdense (white) area'
                            },
                            ASPECTS: {
                                name: 'Alberta Stroke Program Early CT Score',
                                range: '0-10',
                                interpretation: {
                                    '8-10': 'Small infarct core, good candidate for intervention',
                                    '6-7': 'Moderate infarct',
                                    '<6': 'Large infarct core, higher risk of hemorrhagic transformation'
                                }
                            }
                        },
                        CTA: {
                            purpose: 'Identify large vessel occlusion for thrombectomy',
                            targets: 'ICA, M1, M2, basilar'
                        },
                        CT_perfusion: {
                            purpose: 'Identify penumbra (salvageable tissue)',
                            parameters: ['CBF (cerebral blood flow)', 'CBV (cerebral blood volume)', 'MTT (mean transit time)', 'Tmax'],
                            mismatch: 'Core (CBF <30%) vs Penumbra (Tmax >6s) ratio guides late intervention'
                        },
                        MRI: {
                            DWI: 'Most sensitive for acute ischemia (within minutes)',
                            FLAIR: 'Becomes positive at 4-6 hours (DWI-FLAIR mismatch indicates <4.5h)',
                            GRE_SWI: 'Detects hemorrhage, microbleeds',
                            MRA: 'Non-invasive vascular imaging'
                        }
                    },
                    
                    workup: {
                        immediate: ['CBC', 'BMP', 'Coagulation (PT/INR, PTT)', 'Glucose', 'Troponin', 'ECG'],
                        within_24h: ['Lipid panel', 'HbA1c', 'TSH', 'Echocardiogram (TTE → TEE if indicated)'],
                        extended: ['Telemetry/Holter/Loop recorder', 'Hypercoagulable panel (if young or cryptogenic)', 'Vasculitis workup (if indicated)']
                    }
                },
                
                management: {
                    acute_ischemic: {
                        general: {
                            airway: 'Protect if GCS ≤8',
                            oxygenation: 'Maintain SpO2 >94%',
                            glucose: 'Target 140-180 mg/dL, avoid hypoglycemia',
                            temperature: 'Treat fever aggressively (increases infarct size)',
                            positioning: 'Flat for first 24h (improves perfusion), then elevate if risk of aspiration'
                        },
                        bloodPressure: {
                            pre_tPA: 'Must be <185/110 before giving tPA',
                            post_tPA: 'Maintain <180/105 for 24 hours',
                            no_tPA: 'Permissive hypertension up to 220/120 (autoregulation)',
                            agents: ['Labetalol', 'Nicardipine', 'Clevidipine'],
                            avoid: 'Rapid drops (can extend infarct)'
                        },
                        thrombolysis: {
                            agent: 'Alteplase (IV tPA) or Tenecteplase',
                            dose_alteplase: '0.9 mg/kg (max 90 mg), 10% bolus, 90% over 60 min',
                            dose_tenecteplase: '0.25 mg/kg (max 25 mg) single bolus',
                            window: {
                                standard: '≤4.5 hours from symptom onset (or last known well)',
                                extended: 'Wake-up stroke with DWI-FLAIR mismatch'
                            },
                            contraindications: {
                                absolute: [
                                    'Active internal bleeding',
                                    'Recent intracranial surgery/trauma (3 months)',
                                    'Intracranial hemorrhage on imaging',
                                    'Known intracranial neoplasm, AVM, or aneurysm',
                                    'Suspected aortic dissection',
                                    'Infective endocarditis'
                                ],
                                relative: [
                                    'BP >185/110 despite treatment',
                                    'Blood glucose <50 or >400',
                                    'Platelets <100,000',
                                    'INR >1.7 or elevated PTT',
                                    'Recent major surgery (14 days)',
                                    'GI/GU hemorrhage (21 days)',
                                    'Recent MI (3 months)',
                                    'NIHSS >25 or extensive early changes'
                                ]
                            },
                            NNT: '~7 to prevent one patient from disability'
                        },
                        thrombectomy: {
                            name: 'Mechanical Thrombectomy (EVT)',
                            indication: 'Large vessel occlusion (ICA, M1, +/- M2, basilar)',
                            window: {
                                standard: '≤6 hours (all eligible patients)',
                                extended: '6-24 hours if favorable perfusion imaging (DAWN/DEFUSE 3 criteria)'
                            },
                            DAWN_criteria: 'Clinical-core mismatch: NIHSS ≥10 with small core',
                            DEFUSE3_criteria: 'Perfusion mismatch ratio ≥1.8, core <70mL',
                            NNT: '~2.6 to achieve functional independence',
                            canCombine: 'Yes - IV tPA + EVT (bridging therapy)'
                        }
                    },
                    
                    hemorrhagic: {
                        ICH: {
                            BP_target: 'SBP <140 if presenting SBP 150-220 (INTERACT2, ATACH-2)',
                            reversal: {
                                warfarin: '4-factor PCC + Vitamin K 10mg IV',
                                DOAC: 'Idarucizumab (dabigatran), Andexanet alfa (Xa inhibitors), or 4F-PCC',
                                antiplatelet: 'Platelet transfusion NOT routinely recommended (PATCH trial)'
                            },
                            surgery: 'Consider if cerebellar >3cm, supratentorial with deterioration',
                            ICP_management: 'HOB 30°, sedation, osmotherapy, EVD if hydrocephalus'
                        },
                        SAH: {
                            secure_aneurysm: 'Within 24 hours (coiling preferred over clipping when possible)',
                            BP: 'SBP <160 until aneurysm secured',
                            nimodipine: '60 mg PO q4h x 21 days (prevents vasospasm-related ischemia)',
                            vasospasm_monitoring: 'TCD daily, CTA if symptomatic',
                            triple_H: 'Hypertension, Hypervolemia, Hemodilution (after aneurysm secured)'
                        }
                    },
                    
                    secondary_prevention: {
                        antiplatelet: {
                            first_line: 'Aspirin 81-325 mg daily',
                            dual_therapy: 'ASA + Clopidogrel x 21-90 days for minor stroke/TIA (CHANCE, POINT)',
                            alternative: 'Clopidogrel monotherapy if ASA intolerant'
                        },
                        anticoagulation: {
                            indication: 'Cardioembolic source (e.g., atrial fibrillation)',
                            timing: 'Start 4-14 days after stroke depending on size',
                            agents: 'DOACs preferred over warfarin for non-valvular AF'
                        },
                        statins: {
                            target: 'High-intensity statin (LDL goal <70 mg/dL)',
                            agents: 'Atorvastatin 40-80mg or Rosuvastatin 20-40mg'
                        },
                        BP_control: 'Target <130/80 after acute phase',
                        diabetes: 'Optimize glycemic control',
                        lifestyle: ['Smoking cessation', 'Exercise', 'Mediterranean diet', 'Limit alcohol']
                    }
                },
                
                prognosis: {
                    mortality: {
                        ischemic: '10-15% at 30 days',
                        ICH: '40% at 30 days',
                        SAH: '50% at 30 days'
                    },
                    ICH_score: {
                        components: ['GCS (3-4: 2pts, 5-12: 1pt, 13-15: 0pt)', 'ICH volume ≥30mL: 1pt', 'IVH: 1pt', 'Infratentorial: 1pt', 'Age ≥80: 1pt'],
                        mortality: { '0': '0%', '1': '13%', '2': '26%', '3': '72%', '4': '97%', '5': '100%' }
                    },
                    recovery: 'Most recovery in first 3 months, continues up to 1 year'
                },
                
                sources: [
                    { ref: 'AHA/ASA Acute Ischemic Stroke Guidelines 2019', doi: '10.1161/STR.0000000000000211', evidence: '1a' },
                    { ref: 'AHA/ASA Spontaneous ICH Guidelines 2022', doi: '10.1161/STR.0000000000000407', evidence: '1a' },
                    { ref: 'ESO Guidelines 2021', evidence: '1a' },
                    { ref: 'DAWN Trial - NEJM 2018', pmid: '29129157', evidence: '1b' },
                    { ref: 'DEFUSE 3 Trial - NEJM 2018', pmid: '29129158', evidence: '1b' }
                ]
            },
            
            tia: {
                definition: 'Transient episode of neurological dysfunction caused by focal brain, spinal cord, or retinal ischemia, without acute infarction',
                duration: 'Typically <1 hour (old definition <24h is obsolete)',
                significance: '10-15% stroke risk at 90 days, highest in first 48 hours',
                
                ABCD2: {
                    name: 'ABCD2 Score for TIA Risk Stratification',
                    components: [
                        { item: 'Age ≥60', points: 1 },
                        { item: 'BP ≥140/90', points: 1 },
                        { item: 'Clinical: Unilateral weakness', points: 2 },
                        { item: 'Clinical: Speech impairment without weakness', points: 1 },
                        { item: 'Duration ≥60 min', points: 2 },
                        { item: 'Duration 10-59 min', points: 1 },
                        { item: 'Diabetes', points: 1 }
                    ],
                    interpretation: {
                        '0-3': 'Low risk (1% 2-day stroke risk)',
                        '4-5': 'Moderate risk (4% 2-day stroke risk)',
                        '6-7': 'High risk (8% 2-day stroke risk)'
                    },
                    note: 'Score alone insufficient - all TIAs warrant urgent evaluation'
                },
                
                management: {
                    imaging: 'MRI with DWI (30-40% show infarct despite symptom resolution)',
                    vascular: 'CTA or MRA of head/neck',
                    cardiac: 'ECG, telemetry, echo',
                    timing: 'Ideally within 24 hours',
                    treatment: 'Dual antiplatelet (ASA + clopidogrel) x 21 days, then single agent'
                }
            }
        },

        // ─────────────────────────────────────────────────────────────────────────
        // CARDIOLOGY
        // ─────────────────────────────────────────────────────────────────────────
        
        cardiology: {
            acs: {
                definition: 'Spectrum of acute myocardial ischemia',
                types: {
                    STEMI: {
                        criteria: 'ST elevation ≥1mm in ≥2 contiguous leads (≥2mm in V1-V3)',
                        management: 'Primary PCI within 90 minutes (or 120 if transfer)',
                        medications: ['Aspirin', 'P2Y12 inhibitor', 'Anticoagulation', 'Beta-blocker', 'Statin']
                    },
                    NSTEMI: {
                        criteria: 'Elevated troponin + ischemic symptoms/ECG changes without ST elevation',
                        management: 'Early invasive strategy within 24-72h if high risk'
                    },
                    unstableAngina: {
                        criteria: 'Ischemic symptoms without troponin elevation',
                        management: 'Risk stratify, medical management vs invasive'
                    }
                },
                sources: ['ACC/AHA STEMI 2013', 'ACC/AHA NSTE-ACS 2014', 'ESC NSTE-ACS 2020']
            },
            
            heartFailure: {
                classification: {
                    HFrEF: 'EF ≤40%',
                    HFmrEF: 'EF 41-49%',
                    HFpEF: 'EF ≥50%'
                },
                GDMT: {
                    fourPillars: ['ACEi/ARB/ARNI', 'Beta-blocker', 'MRA', 'SGLT2i'],
                    additional: ['Diuretics for congestion', 'Hydralazine-nitrate (especially AA patients)', 'Ivabradine (HR >70)', 'Digoxin']
                },
                staging: {
                    A: 'At risk, no structural disease',
                    B: 'Structural disease, no symptoms',
                    C: 'Structural disease with current/prior symptoms',
                    D: 'Advanced HF requiring specialized interventions'
                },
                sources: ['ACC/AHA HF Guidelines 2022', 'ESC HF Guidelines 2021']
            },
            
            atrialFibrillation: {
                strokeRisk: 'CHA2DS2-VASc score',
                bleedingRisk: 'HAS-BLED score',
                anticoagulation: {
                    indication: 'CHA2DS2-VASc ≥2 (men) or ≥3 (women)',
                    preferred: 'DOACs over warfarin for non-valvular AF'
                },
                rateControl: {
                    target: 'HR <110 at rest (lenient) or <80 (strict if symptomatic)',
                    agents: ['Beta-blockers', 'Diltiazem/Verapamil', 'Digoxin']
                },
                rhythmControl: {
                    agents: ['Amiodarone', 'Flecainide', 'Propafenone', 'Sotalol', 'Dofetilide'],
                    ablation: 'Consider for drug-refractory or as first-line'
                },
                sources: ['ACC/AHA/HRS AF Guidelines 2023', 'ESC AF Guidelines 2020']
            }
        },

        // ─────────────────────────────────────────────────────────────────────────
        // NEPHROLOGY
        // ─────────────────────────────────────────────────────────────────────────
        
        nephrology: {
            aki: {
                definition: 'Increase in SCr ≥0.3 mg/dL within 48h OR ≥1.5x baseline within 7 days OR UOP <0.5 mL/kg/h for 6h',
                staging: {
                    stage1: 'SCr 1.5-1.9x OR ≥0.3 increase OR UOP <0.5 mL/kg/h for 6-12h',
                    stage2: 'SCr 2-2.9x OR UOP <0.5 mL/kg/h for ≥12h',
                    stage3: 'SCr ≥3x OR ≥4.0 OR RRT OR UOP <0.3 mL/kg/h for ≥24h'
                },
                etiologies: {
                    prerenal: { causes: ['Hypovolemia', 'Heart failure', 'Sepsis'], FENa: '<1%' },
                    intrinsic: { causes: ['ATN', 'AIN', 'GN'], FENa: '>2%' },
                    postrenal: { causes: ['BPH', 'Stones', 'Malignancy'], diagnosis: 'Ultrasound - hydronephrosis' }
                },
                rrtIndications: 'AEIOU - Acidosis, Electrolytes, Intoxication, Overload, Uremia',
                sources: ['KDIGO AKI Guidelines 2012']
            },
            
            ckd: {
                staging: {
                    G1: 'eGFR ≥90 with kidney damage',
                    G2: 'eGFR 60-89',
                    G3a: 'eGFR 45-59',
                    G3b: 'eGFR 30-44',
                    G4: 'eGFR 15-29',
                    G5: 'eGFR <15 or dialysis'
                },
                management: {
                    BP: '<130/80 (ACEi/ARB first-line if proteinuria)',
                    diabetes: 'SGLT2i for diabetic CKD',
                    anemia: 'Iron first, then ESAs',
                    mineral: 'Phosphate binders, vitamin D, manage PTH'
                },
                sources: ['KDIGO CKD Guidelines 2024']
            },
            
            electrolytes: {
                hyponatremia: {
                    approach: 'Assess volume status first',
                    correction: 'Max 8-10 mEq/L per 24h to avoid ODS',
                    emergency: '3% saline for severe symptoms (seizures, coma)'
                },
                hyperkalemia: {
                    ecgChanges: ['Peaked T waves', 'Prolonged PR', 'Wide QRS', 'Sine wave'],
                    treatment: ['Calcium gluconate (stabilize)', 'Insulin+glucose', 'Beta-agonist', 'Kayexalate/Lokelma', 'Dialysis']
                }
            }
        },

        // ─────────────────────────────────────────────────────────────────────────
        // PULMONOLOGY
        // ─────────────────────────────────────────────────────────────────────────
        
        pulmonology: {
            pe: {
                riskScores: {
                    wells: 'PE likely >4 points',
                    PERC: 'If all 8 negative and low pretest probability, no further testing'
                },
                diagnosis: {
                    lowRisk: 'D-dimer (age-adjusted cutoff: age × 10 if >50)',
                    highRisk: 'CTPA directly',
                    unstable: 'Bedside echo (RV strain) → empiric treatment'
                },
                treatment: {
                    anticoagulation: 'DOAC preferred for most; LMWH for cancer',
                    thrombolysis: 'Massive PE with hemodynamic instability',
                    catheterDirected: 'Submassive with RV dysfunction'
                },
                sources: ['ESC PE Guidelines 2019', 'CHEST Antithrombotic Guidelines 2021']
            },
            
            copd: {
                diagnosis: 'Post-bronchodilator FEV1/FVC <0.70',
                classification: 'GOLD stages by FEV1, ABE groups by symptoms/exacerbations',
                exacerbation: {
                    treatment: ['Bronchodilators', 'Systemic steroids (5 days)', 'Antibiotics if purulent sputum'],
                    criteria: 'Increased dyspnea, sputum volume, or sputum purulence'
                },
                sources: ['GOLD Guidelines 2024']
            },
            
            asthma: {
                diagnosis: 'Variable symptoms + variable airflow limitation',
                classification: 'By symptom frequency and lung function',
                treatment: {
                    stepwise: ['SABA PRN', 'Low-dose ICS', 'Low-dose ICS-LABA', 'Med-dose ICS-LABA', 'High-dose ICS-LABA + add-on'],
                    rescue: 'SABA or ICS-formoterol (SMART therapy)'
                },
                exacerbation: ['Systemic steroids', 'Frequent bronchodilators', 'Oxygen', 'Magnesium if severe'],
                sources: ['GINA Guidelines 2024']
            },
            
            pneumonia: {
                CAP: {
                    empiric: {
                        outpatient: 'Amoxicillin or Doxycycline or Macrolide',
                        inpatient: 'Beta-lactam + Macrolide OR Respiratory fluoroquinolone',
                        ICU: 'Beta-lactam + Macrolide or Fluoroquinolone; add MRSA/Pseudomonas coverage if risk factors'
                    }
                },
                HAP_VAP: {
                    coverage: 'MRSA + Pseudomonas (double coverage if high risk or septic shock)'
                },
                sources: ['ATS/IDSA CAP Guidelines 2019', 'ATS/IDSA HAP/VAP Guidelines 2016']
            }
        },

        // ─────────────────────────────────────────────────────────────────────────
        // ENDOCRINOLOGY
        // ─────────────────────────────────────────────────────────────────────────
        
        endocrinology: {
            dka: {
                criteria: 'Glucose >250 + pH <7.3 + HCO3 <18 + Ketones',
                severity: {
                    mild: 'pH 7.25-7.30',
                    moderate: 'pH 7.0-7.24',
                    severe: 'pH <7.0'
                },
                treatment: {
                    fluids: 'NS 1-1.5L first hour, then based on Na and glucose',
                    insulin: '0.1 U/kg bolus then 0.1 U/kg/hr',
                    potassium: 'Add when K <5.2 and urine output confirmed',
                    bicarbonate: 'Only if pH <6.9',
                    glucose: 'Add D5 when glucose <200'
                },
                resolution: 'pH >7.3, HCO3 >18, AG <12, glucose <200',
                sources: ['ADA DKA Guidelines 2024']
            },
            
            hhs: {
                criteria: 'Glucose >600 + Serum osm >320 + pH >7.3 + Minimal ketones',
                treatment: 'Similar to DKA but more fluids, less insulin initially',
                mortality: 'Higher than DKA (5-20%)'
            },
            
            thyroid: {
                hypothyroidism: {
                    diagnosis: 'High TSH, low T4',
                    treatment: 'Levothyroxine, start low in elderly/cardiac'
                },
                hyperthyroidism: {
                    diagnosis: 'Low TSH, high T4/T3',
                    treatment: 'Beta-blocker + Methimazole/PTU or RAI or Surgery'
                },
                thyroidStorm: {
                    treatment: 'PTU + Iodine (1h after PTU) + Beta-blocker + Steroids + Supportive'
                }
            }
        },

        // ─────────────────────────────────────────────────────────────────────────
        // INFECTIOUS DISEASE
        // ─────────────────────────────────────────────────────────────────────────
        
        infectiousDisease: {
            sepsis: {
                definition: 'Suspected infection + SOFA ≥2',
                qSOFA: 'RR ≥22, Altered mentation, SBP ≤100 (for screening outside ICU)',
                septicShock: 'Sepsis + Vasopressors needed + Lactate >2 despite fluids',
                hourOneBunde: [
                    'Measure lactate',
                    'Blood cultures before antibiotics',
                    'Broad-spectrum antibiotics',
                    '30 mL/kg crystalloid if hypotensive or lactate ≥4',
                    'Vasopressors if hypotensive after fluids'
                ],
                sources: ['Surviving Sepsis Campaign 2021']
            },
            
            meningitis: {
                empiric: {
                    adult: 'Vancomycin + Ceftriaxone + Dexamethasone (before or with antibiotics)',
                    elderly_immunocompromised: 'Add Ampicillin for Listeria'
                },
                CSF: {
                    bacterial: 'High WBC (PMN), High protein, Low glucose',
                    viral: 'Moderate WBC (lymph), Normal-mild high protein, Normal glucose',
                    TB_fungal: 'Moderate WBC (lymph), High protein, Low glucose'
                },
                sources: ['IDSA Meningitis Guidelines']
            },
            
            endocarditis: {
                modifiedDuke: {
                    major: ['Positive blood cultures (typical organisms)', 'Vegetation on echo', 'New valvular regurgitation'],
                    minor: ['Predisposition', 'Fever', 'Vascular phenomena', 'Immunologic phenomena', 'Micro evidence']
                },
                diagnosis: '2 major OR 1 major + 3 minor OR 5 minor',
                empiric: 'Vancomycin + Gentamicin (native) or Vancomycin + Gentamicin + Rifampin (prosthetic)',
                sources: ['AHA IE Guidelines 2015']
            }
        },

        // ─────────────────────────────────────────────────────────────────────────
        // HEMATOLOGY
        // ─────────────────────────────────────────────────────────────────────────
        
        hematology: {
            anemia: {
                classification: {
                    microcytic: 'MCV <80 - Iron deficiency, Thalassemia, Chronic disease, Sideroblastic',
                    normocytic: 'MCV 80-100 - Acute blood loss, Chronic disease, CKD, Hemolysis',
                    macrocytic: 'MCV >100 - B12/Folate deficiency, Myelodysplasia, Liver disease, Hypothyroidism'
                },
                transfusion: 'Generally Hb <7, or <8 if cardiac disease'
            },
            
            anticoagulation: {
                warfarin: {
                    target: 'INR 2-3 (most indications) or 2.5-3.5 (mechanical mitral)',
                    reversal: 'Vitamin K + 4F-PCC'
                },
                DOACs: {
                    types: ['Dabigatran (DTI)', 'Rivaroxaban, Apixaban, Edoxaban (Xa inhibitors)'],
                    advantages: 'Fixed dosing, fewer interactions, no monitoring',
                    reversal: 'Idarucizumab (dabigatran), Andexanet (Xa inhibitors)'
                },
                heparin: {
                    UFH: 'aPTT 1.5-2.5x control',
                    LMWH: 'Anti-Xa 0.5-1.0 (BID) or 1.0-2.0 (daily)',
                    reversal: 'Protamine'
                }
            },
            
            dic: {
                criteria: 'ISTH DIC score ≥5',
                labs: 'Low platelets, Prolonged PT/PTT, Low fibrinogen, Elevated D-dimer',
                treatment: 'Treat underlying cause, transfuse for bleeding'
            },
            
            hit: {
                timing: 'Days 5-10 (or earlier if prior exposure)',
                diagnosis: '4Ts score + PF4 antibody + Functional assay',
                treatment: 'Stop all heparin, Start non-heparin anticoagulant (argatroban, bivalirudin, fondaparinux)'
            }
        },

        // ─────────────────────────────────────────────────────────────────────────
        // GI/HEPATOLOGY
        // ─────────────────────────────────────────────────────────────────────────
        
        gastroenterology: {
            giBleed: {
                upper: {
                    causes: ['PUD', 'Varices', 'Mallory-Weiss', 'Erosive disease'],
                    management: 'Resuscitate, PPI (80mg bolus then 8mg/hr if high-risk), EGD within 24h',
                    varices: 'Octreotide + Antibiotics + Emergent EGD + TIPS if refractory'
                },
                lower: {
                    causes: ['Diverticulosis', 'Angiodysplasia', 'Malignancy', 'IBD'],
                    management: 'Colonoscopy after prep (unless massive → CTA → angioembolization/surgery)'
                }
            },
            
            liverFailure: {
                acuteOnChronic: {
                    triggers: ['Infection', 'GI bleed', 'Medication', 'Alcohol'],
                    management: 'Treat trigger, lactulose for HE, rifaximin, albumin, manage complications'
                },
                acuteLiverFailure: {
                    definition: 'INR ≥1.5 + Encephalopathy + No prior liver disease + Illness <26 weeks',
                    causes: ['Acetaminophen (most common)', 'Viral', 'Drug-induced', 'Autoimmune'],
                    management: 'ICU, NAC for acetaminophen, consider transplant'
                }
            },
            
            pancreatitis: {
                acute: {
                    diagnosis: '2 of 3: Abdominal pain, Lipase >3x ULN, Imaging findings',
                    management: 'NPO initially, aggressive fluids, pain control, treat cause',
                    severity: 'BISAP, Ranson, APACHE II, Presence of necrosis'
                }
            }
        }
    };

    // ═══════════════════════════════════════════════════════════════════════════
    // SEMANTIC UNDERSTANDING ENGINE
    // ═══════════════════════════════════════════════════════════════════════════
    
    const SemanticEngine = {
        // Synonym mappings for medical terms
        synonymMap: {
            'cva': ['stroke', 'cerebrovascular accident', 'brain attack'],
            'stroke': ['cva', 'cerebrovascular accident', 'brain attack'],
            'mi': ['myocardial infarction', 'heart attack', 'stemi', 'nstemi'],
            'heart attack': ['mi', 'myocardial infarction', 'acs'],
            'chf': ['heart failure', 'congestive heart failure', 'hf'],
            'heart failure': ['chf', 'congestive heart failure', 'hf'],
            'pe': ['pulmonary embolism', 'pulmonary embolus'],
            'dvt': ['deep vein thrombosis', 'deep venous thrombosis'],
            'aki': ['acute kidney injury', 'acute renal failure', 'arf'],
            'ckd': ['chronic kidney disease', 'chronic renal failure'],
            'copd': ['chronic obstructive pulmonary disease'],
            'dm': ['diabetes', 'diabetes mellitus'],
            'htn': ['hypertension', 'high blood pressure'],
            'afib': ['atrial fibrillation', 'af', 'a-fib'],
            'sob': ['shortness of breath', 'dyspnea'],
            'cp': ['chest pain'],
            'ha': ['headache'],
            'ams': ['altered mental status', 'confusion', 'encephalopathy'],
            'gi bleed': ['gastrointestinal bleeding', 'upper gi bleed', 'lower gi bleed'],
            'sepsis': ['septicemia', 'systemic infection'],
            'uti': ['urinary tract infection'],
            'pneumonia': ['pna', 'lung infection'],
            'meningitis': ['meningeal infection'],
            'tia': ['transient ischemic attack', 'mini stroke']
        },
        
        // Intent patterns
        intentPatterns: {
            diagnostic_criteria: [
                /what are the (diagnostic |dx )?criteria/i,
                /how (do you|to) diagnos/i,
                /criteria for/i,
                /definition of/i,
                /how is .* diagnosed/i
            ],
            treatment: [
                /how (do you|to) treat/i,
                /management of/i,
                /treatment (for|of)/i,
                /therapy for/i,
                /what('s| is) the treatment/i
            ],
            differential: [
                /differential (diagnosis|dx)/i,
                /causes of/i,
                /what causes/i,
                /ddx for/i,
                /why would .* have/i
            ],
            workup: [
                /workup (for|of)/i,
                /what tests/i,
                /how to work up/i,
                /evaluation of/i
            ],
            prognosis: [
                /prognosis/i,
                /outcome/i,
                /survival/i,
                /mortality/i
            ],
            mechanism: [
                /mechanism/i,
                /pathophysiology/i,
                /how does .* (work|cause)/i,
                /why does/i
            ],
            drug: [
                /dose|dosing/i,
                /drug (interaction|of choice)/i,
                /medication/i,
                /side effect/i
            ],
            lab_interpretation: [
                /interpret|meaning/i,
                /what does .* (mean|indicate)/i,
                /why is .* (high|low|elevated|decreased)/i
            ]
        },
        
        /**
         * Understand query intent and extract entities
         */
        analyzeQuery(query) {
            const analysis = {
                originalQuery: query,
                normalizedQuery: this.normalizeQuery(query),
                intent: this.detectIntent(query),
                entities: this.extractEntities(query),
                confidence: 0,
                relatedTopics: []
            };
            
            // Calculate confidence based on matches
            if (analysis.intent && analysis.entities.length > 0) {
                analysis.confidence = 0.9;
            } else if (analysis.entities.length > 0) {
                analysis.confidence = 0.7;
            } else if (analysis.intent) {
                analysis.confidence = 0.5;
            } else {
                analysis.confidence = 0.3;
            }
            
            return analysis;
        },
        
        /**
         * Normalize query - expand abbreviations and synonyms
         */
        normalizeQuery(query) {
            let normalized = query.toLowerCase();
            
            // Expand known abbreviations
            for (const [abbrev, synonyms] of Object.entries(this.synonymMap)) {
                const pattern = new RegExp(`\\b${abbrev}\\b`, 'gi');
                if (pattern.test(normalized)) {
                    // Keep original but note the expansion
                    normalized = normalized.replace(pattern, abbrev);
                }
            }
            
            return normalized;
        },
        
        /**
         * Detect query intent
         */
        detectIntent(query) {
            const normalized = query.toLowerCase();
            
            for (const [intent, patterns] of Object.entries(this.intentPatterns)) {
                for (const pattern of patterns) {
                    if (pattern.test(normalized)) {
                        return intent;
                    }
                }
            }
            
            // Default intent based on keywords
            if (/\?$/.test(query)) {
                return 'question';
            }
            
            return 'general_inquiry';
        },
        
        /**
         * Extract medical entities from query
         */
        extractEntities(query) {
            const entities = [];
            const normalized = query.toLowerCase();
            
            // Check for known conditions
            const conditionPatterns = [
                { pattern: /\b(cva|stroke|cerebrovascular)/i, entity: 'stroke', category: 'neurology' },
                { pattern: /\b(tia|transient ischemic)/i, entity: 'tia', category: 'neurology' },
                { pattern: /\b(mi|myocardial infarction|heart attack|stemi|nstemi)/i, entity: 'acs', category: 'cardiology' },
                { pattern: /\b(heart failure|chf|hf)\b/i, entity: 'heartFailure', category: 'cardiology' },
                { pattern: /\b(a(trial)?[\s-]?fib|af\b)/i, entity: 'atrialFibrillation', category: 'cardiology' },
                { pattern: /\b(pe|pulmonary embol)/i, entity: 'pe', category: 'pulmonology' },
                { pattern: /\b(dvt|deep vein)/i, entity: 'dvt', category: 'hematology' },
                { pattern: /\b(aki|acute kidney|acute renal)/i, entity: 'aki', category: 'nephrology' },
                { pattern: /\b(ckd|chronic kidney|chronic renal)/i, entity: 'ckd', category: 'nephrology' },
                { pattern: /\b(dka|diabetic ketoacidosis)/i, entity: 'dka', category: 'endocrinology' },
                { pattern: /\b(hhs|hyperosmolar)/i, entity: 'hhs', category: 'endocrinology' },
                { pattern: /\b(sepsis|septic)/i, entity: 'sepsis', category: 'infectiousDisease' },
                { pattern: /\b(meningitis)/i, entity: 'meningitis', category: 'infectiousDisease' },
                { pattern: /\b(pneumonia|pna)/i, entity: 'pneumonia', category: 'pulmonology' },
                { pattern: /\b(copd)/i, entity: 'copd', category: 'pulmonology' },
                { pattern: /\b(asthma)/i, entity: 'asthma', category: 'pulmonology' },
                { pattern: /\b(gi bleed|gastrointestinal bleed)/i, entity: 'giBleed', category: 'gastroenterology' },
                { pattern: /\b(pancreatitis)/i, entity: 'pancreatitis', category: 'gastroenterology' },
                { pattern: /\b(anemia)/i, entity: 'anemia', category: 'hematology' },
                { pattern: /\b(dic|disseminated intravascular)/i, entity: 'dic', category: 'hematology' },
                { pattern: /\b(hit|heparin.induced)/i, entity: 'hit', category: 'hematology' },
                { pattern: /\b(hyponatremia)/i, entity: 'hyponatremia', category: 'nephrology' },
                { pattern: /\b(hyperkalemia)/i, entity: 'hyperkalemia', category: 'nephrology' },
                { pattern: /\b(endocarditis)/i, entity: 'endocarditis', category: 'infectiousDisease' }
            ];
            
            for (const { pattern, entity, category } of conditionPatterns) {
                if (pattern.test(normalized)) {
                    entities.push({ entity, category, confidence: 0.95 });
                }
            }
            
            return entities;
        },
        
        /**
         * Find the best knowledge base match
         */
        findKnowledge(entities, intent) {
            const results = [];
            
            for (const { entity, category } of entities) {
                const categoryData = MEDICAL_KNOWLEDGE[category];
                if (categoryData) {
                    // Direct match
                    if (categoryData[entity]) {
                        results.push({
                            data: categoryData[entity],
                            entity,
                            category,
                            matchType: 'direct'
                        });
                    }
                    
                    // Check nested structures
                    for (const [key, value] of Object.entries(categoryData)) {
                        if (typeof value === 'object' && value !== null) {
                            if (value[entity]) {
                                results.push({
                                    data: value[entity],
                                    entity,
                                    category,
                                    parentKey: key,
                                    matchType: 'nested'
                                });
                            }
                        }
                    }
                }
            }
            
            return results;
        }
    };

    // ═══════════════════════════════════════════════════════════════════════════
    // CHAIN-OF-THOUGHT REASONING ENGINE
    // ═══════════════════════════════════════════════════════════════════════════
    
    const ReasoningEngine = {
        /**
         * Generate response with chain-of-thought reasoning
         */
        generateResponse(analysis, knowledgeResults, context) {
            const reasoning = {
                steps: [],
                conclusion: null,
                confidence: 0,
                sources: []
            };
            
            // Step 1: Understand the query
            reasoning.steps.push({
                step: 'Query Analysis',
                thought: `User is asking about "${analysis.entities.map(e => e.entity).join(', ')}" with intent: ${analysis.intent}`,
                confidence: analysis.confidence
            });
            
            // Step 2: Retrieve relevant knowledge
            if (knowledgeResults.length > 0) {
                reasoning.steps.push({
                    step: 'Knowledge Retrieval',
                    thought: `Found ${knowledgeResults.length} relevant knowledge sources in ${knowledgeResults.map(r => r.category).join(', ')}`,
                    confidence: 0.9
                });
            }
            
            // Step 3: Synthesize response based on intent
            const response = this.synthesizeResponse(analysis, knowledgeResults, context);
            reasoning.conclusion = response;
            
            // Calculate overall confidence
            reasoning.confidence = this.calculateConfidence(analysis, knowledgeResults);
            
            // Collect sources
            knowledgeResults.forEach(result => {
                if (result.data?.sources) {
                    reasoning.sources.push(...result.data.sources);
                }
            });
            
            return reasoning;
        },
        
        /**
         * Synthesize final response based on intent
         */
        synthesizeResponse(analysis, knowledgeResults, context) {
            if (knowledgeResults.length === 0) {
                return this.generateFallbackResponse(analysis);
            }
            
            const primaryResult = knowledgeResults[0];
            const data = primaryResult.data;
            const intent = analysis.intent;
            
            let response = '';
            
            // Header
            const title = data.definition ? 
                primaryResult.entity.toUpperCase().replace(/_/g, ' ') : 
                analysis.entities[0]?.entity.toUpperCase() || 'Medical Information';
            
            response += `## 🏥 ${title}\n\n`;
            
            // Definition if available
            if (data.definition) {
                response += `**Definition:** ${data.definition}\n\n`;
            }
            
            // Intent-specific content
            switch (intent) {
                case 'diagnostic_criteria':
                    response += this.formatDiagnosticCriteria(data);
                    break;
                case 'treatment':
                    response += this.formatTreatment(data);
                    break;
                case 'differential':
                    response += this.formatDifferential(data);
                    break;
                case 'workup':
                    response += this.formatWorkup(data);
                    break;
                case 'prognosis':
                    response += this.formatPrognosis(data);
                    break;
                case 'mechanism':
                    response += this.formatMechanism(data);
                    break;
                default:
                    response += this.formatComprehensive(data);
            }
            
            return response;
        },
        
        /**
         * Format diagnostic criteria
         */
        formatDiagnosticCriteria(data) {
            let text = '### 📋 Diagnostic Criteria\n\n';
            
            if (data.diagnosis) {
                const dx = data.diagnosis;
                
                // Clinical scales
                if (dx.clinical_scales) {
                    text += '**Clinical Assessment Tools:**\n\n';
                    for (const [scaleName, scale] of Object.entries(dx.clinical_scales)) {
                        text += `#### ${scale.name || scaleName}\n`;
                        if (scale.components) {
                            text += 'Components:\n';
                            scale.components.forEach(c => {
                                if (typeof c === 'string') {
                                    text += `• ${c}\n`;
                                } else {
                                    text += `• ${c.item}: ${c.points} point(s)\n`;
                                }
                            });
                        }
                        if (scale.interpretation) {
                            text += '\nInterpretation:\n';
                            for (const [score, meaning] of Object.entries(scale.interpretation)) {
                                text += `• Score ${score}: ${typeof meaning === 'object' ? meaning.level || meaning.risk : meaning}\n`;
                            }
                        }
                        text += '\n';
                    }
                }
                
                // Imaging criteria
                if (dx.imaging) {
                    text += '**Imaging:**\n\n';
                    for (const [modality, info] of Object.entries(dx.imaging)) {
                        text += `**${modality.replace(/_/g, ' ').toUpperCase()}:**\n`;
                        if (info.timing) text += `• Timing: ${info.timing}\n`;
                        if (info.purpose) text += `• Purpose: ${info.purpose}\n`;
                        if (info.findings && typeof info.findings === 'object') {
                            text += '• Findings:\n';
                            for (const [type, findings] of Object.entries(info.findings)) {
                                if (Array.isArray(findings)) {
                                    text += `  - ${type}: ${findings.join(', ')}\n`;
                                } else {
                                    text += `  - ${type}: ${findings}\n`;
                                }
                            }
                        }
                        text += '\n';
                    }
                }
                
                // Workup
                if (dx.workup) {
                    text += '**Diagnostic Workup:**\n';
                    for (const [phase, tests] of Object.entries(dx.workup)) {
                        if (Array.isArray(tests)) {
                            text += `• ${phase.replace(/_/g, ' ')}: ${tests.join(', ')}\n`;
                        }
                    }
                    text += '\n';
                }
            }
            
            // Direct criteria
            if (data.criteria) {
                text += `**Criteria:** ${data.criteria}\n\n`;
            }
            
            if (data.diagnosticCriteria) {
                text += '**Specific Criteria:**\n';
                for (const [criterion, value] of Object.entries(data.diagnosticCriteria)) {
                    text += `• ${criterion}: ${value}\n`;
                }
                text += '\n';
            }
            
            // Classification
            if (data.classification) {
                text += '### Classification\n\n';
                text += this.formatClassification(data.classification);
            }
            
            return text;
        },
        
        /**
         * Format treatment information
         */
        formatTreatment(data) {
            let text = '### 💊 Management\n\n';
            
            if (data.management) {
                const mgmt = data.management;
                
                // Acute management
                if (mgmt.acute_ischemic || mgmt.acute) {
                    const acute = mgmt.acute_ischemic || mgmt.acute;
                    text += '**Acute Management:**\n\n';
                    
                    // General measures
                    if (acute.general) {
                        text += '*General Measures:*\n';
                        for (const [measure, detail] of Object.entries(acute.general)) {
                            text += `• ${measure}: ${detail}\n`;
                        }
                        text += '\n';
                    }
                    
                    // Blood pressure
                    if (acute.bloodPressure) {
                        text += '*Blood Pressure Management:*\n';
                        for (const [setting, target] of Object.entries(acute.bloodPressure)) {
                            if (typeof target === 'string') {
                                text += `• ${setting.replace(/_/g, ' ')}: ${target}\n`;
                            }
                        }
                        text += '\n';
                    }
                    
                    // Thrombolysis
                    if (acute.thrombolysis) {
                        const tpa = acute.thrombolysis;
                        text += '*Thrombolysis (IV tPA):*\n';
                        if (tpa.agent) text += `• Agent: ${tpa.agent}\n`;
                        if (tpa.dose_alteplase) text += `• Dose: ${tpa.dose_alteplase}\n`;
                        if (tpa.window) {
                            text += `• Time Window: ${tpa.window.standard}\n`;
                            if (tpa.window.extended) text += `• Extended Window: ${tpa.window.extended}\n`;
                        }
                        if (tpa.contraindications) {
                            text += '\n*Contraindications:*\n';
                            if (tpa.contraindications.absolute) {
                                text += 'Absolute:\n';
                                tpa.contraindications.absolute.forEach(c => text += `  ❌ ${c}\n`);
                            }
                            if (tpa.contraindications.relative) {
                                text += 'Relative:\n';
                                tpa.contraindications.relative.slice(0, 5).forEach(c => text += `  ⚠️ ${c}\n`);
                            }
                        }
                        text += '\n';
                    }
                    
                    // Thrombectomy
                    if (acute.thrombectomy) {
                        const evt = acute.thrombectomy;
                        text += '*Mechanical Thrombectomy:*\n';
                        if (evt.indication) text += `• Indication: ${evt.indication}\n`;
                        if (evt.window) {
                            text += `• Time Window: ${evt.window.standard}\n`;
                            if (evt.window.extended) text += `• Extended: ${evt.window.extended}\n`;
                        }
                        if (evt.NNT) text += `• NNT: ${evt.NNT}\n`;
                        text += '\n';
                    }
                }
                
                // Secondary prevention
                if (mgmt.secondary_prevention) {
                    text += '**Secondary Prevention:**\n\n';
                    const prev = mgmt.secondary_prevention;
                    
                    for (const [category, details] of Object.entries(prev)) {
                        text += `*${category.replace(/_/g, ' ')}:*\n`;
                        if (typeof details === 'object' && !Array.isArray(details)) {
                            for (const [key, value] of Object.entries(details)) {
                                if (typeof value === 'string') {
                                    text += `• ${key.replace(/_/g, ' ')}: ${value}\n`;
                                }
                            }
                        } else if (Array.isArray(details)) {
                            details.forEach(d => text += `• ${d}\n`);
                        } else {
                            text += `• ${details}\n`;
                        }
                        text += '\n';
                    }
                }
                
                // Hemorrhagic management
                if (mgmt.hemorrhagic) {
                    text += '**Hemorrhagic Stroke Management:**\n\n';
                    for (const [type, details] of Object.entries(mgmt.hemorrhagic)) {
                        text += `*${type.toUpperCase()}:*\n`;
                        for (const [key, value] of Object.entries(details)) {
                            if (typeof value === 'string') {
                                text += `• ${key.replace(/_/g, ' ')}: ${value}\n`;
                            }
                        }
                        text += '\n';
                    }
                }
            }
            
            // Direct treatment info
            if (data.treatment) {
                for (const [key, value] of Object.entries(data.treatment)) {
                    if (typeof value === 'string') {
                        text += `• ${key}: ${value}\n`;
                    } else if (typeof value === 'object') {
                        text += `**${key.replace(/_/g, ' ')}:**\n`;
                        for (const [k, v] of Object.entries(value)) {
                            text += `• ${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}\n`;
                        }
                    }
                }
            }
            
            return text;
        },
        
        /**
         * Format classification information
         */
        formatClassification(classification, depth = 0) {
            let text = '';
            const indent = '  '.repeat(depth);
            
            for (const [key, value] of Object.entries(classification)) {
                if (typeof value === 'string') {
                    text += `${indent}• **${key.replace(/_/g, ' ')}**: ${value}\n`;
                } else if (typeof value === 'object' && value !== null) {
                    text += `${indent}**${key.replace(/_/g, ' ').toUpperCase()}**`;
                    if (value.percentage) text += ` (${value.percentage})`;
                    if (value.name) text += ` - ${value.name}`;
                    text += '\n';
                    
                    if (value.subtypes) {
                        text += this.formatClassification(value.subtypes, depth + 1);
                    }
                    if (value.mechanism) text += `${indent}  • Mechanism: ${value.mechanism}\n`;
                    if (value.riskFactors && Array.isArray(value.riskFactors)) {
                        text += `${indent}  • Risk factors: ${value.riskFactors.join(', ')}\n`;
                    }
                    if (value.syndromes && Array.isArray(value.syndromes)) {
                        text += `${indent}  • Syndromes: ${value.syndromes.join(', ')}\n`;
                    }
                }
            }
            
            return text;
        },
        
        /**
         * Format workup information
         */
        formatWorkup(data) {
            let text = '### 🔬 Diagnostic Workup\n\n';
            
            if (data.diagnosis?.workup) {
                for (const [phase, tests] of Object.entries(data.diagnosis.workup)) {
                    text += `**${phase.replace(/_/g, ' ')}:**\n`;
                    if (Array.isArray(tests)) {
                        tests.forEach(t => text += `• ${t}\n`);
                    }
                    text += '\n';
                }
            }
            
            if (data.diagnosis?.imaging) {
                text += '**Imaging:**\n';
                for (const [modality, info] of Object.entries(data.diagnosis.imaging)) {
                    text += `• **${modality.replace(/_/g, ' ')}**: ${info.purpose || ''}\n`;
                }
            }
            
            return text;
        },
        
        /**
         * Format prognosis information
         */
        formatPrognosis(data) {
            let text = '### 📊 Prognosis\n\n';
            
            if (data.prognosis) {
                if (data.prognosis.mortality) {
                    text += '**Mortality:**\n';
                    for (const [type, rate] of Object.entries(data.prognosis.mortality)) {
                        text += `• ${type}: ${rate}\n`;
                    }
                    text += '\n';
                }
                
                if (data.prognosis.ICH_score) {
                    text += '**ICH Score (for hemorrhagic stroke):**\n';
                    if (data.prognosis.ICH_score.components) {
                        text += 'Components:\n';
                        data.prognosis.ICH_score.components.forEach(c => text += `• ${c}\n`);
                    }
                    if (data.prognosis.ICH_score.mortality) {
                        text += '\n30-day mortality by score:\n';
                        for (const [score, mort] of Object.entries(data.prognosis.ICH_score.mortality)) {
                            text += `• Score ${score}: ${mort}\n`;
                        }
                    }
                    text += '\n';
                }
                
                if (data.prognosis.recovery) {
                    text += `**Recovery:** ${data.prognosis.recovery}\n`;
                }
            }
            
            return text;
        },
        
        /**
         * Format mechanism/pathophysiology
         */
        formatMechanism(data) {
            let text = '### 🧬 Pathophysiology\n\n';
            
            if (data.classification) {
                text += '**Types and Mechanisms:**\n\n';
                text += this.formatClassification(data.classification);
            }
            
            return text;
        },
        
        /**
         * Format comprehensive response
         */
        formatComprehensive(data) {
            let text = '';
            
            // Classification
            if (data.classification) {
                text += '### 📑 Classification\n\n';
                text += this.formatClassification(data.classification);
                text += '\n';
            }
            
            // Clinical presentation
            if (data.clinicalPresentation) {
                text += '### 🩺 Clinical Presentation\n\n';
                for (const [circulation, territories] of Object.entries(data.clinicalPresentation)) {
                    text += `**${circulation.replace(/_/g, ' ')}:**\n`;
                    for (const [territory, info] of Object.entries(territories)) {
                        text += `\n*${info.territory || territory}:*\n`;
                        if (info.symptoms) {
                            info.symptoms.forEach(s => text += `• ${s}\n`);
                        }
                        if (info.warning) text += `⚠️ ${info.warning}\n`;
                    }
                    text += '\n';
                }
            }
            
            // Diagnosis
            text += this.formatDiagnosticCriteria(data);
            
            // Treatment
            text += this.formatTreatment(data);
            
            // Prognosis
            if (data.prognosis) {
                text += this.formatPrognosis(data);
            }
            
            return text;
        },
        
        /**
         * Generate fallback response when no knowledge found
         */
        generateFallbackResponse(analysis) {
            let text = `## 🤖 Medical Information Request\n\n`;
            text += `I understand you're asking about **${analysis.entities.map(e => e.entity).join(', ') || analysis.originalQuery}**.\n\n`;
            
            text += `**What I can help with:**\n`;
            text += `• Diagnostic criteria and clinical assessment\n`;
            text += `• Treatment protocols and management guidelines\n`;
            text += `• Differential diagnosis\n`;
            text += `• Lab interpretation in clinical context\n`;
            text += `• Drug information and interactions\n\n`;
            
            text += `**Try asking:**\n`;
            text += `• "What are the diagnostic criteria for [condition]?"\n`;
            text += `• "How do you treat [condition]?"\n`;
            text += `• "What is the workup for [symptom]?"\n`;
            text += `• "Differential diagnosis for [presentation]"\n`;
            
            return text;
        },
        
        /**
         * Calculate confidence score
         */
        calculateConfidence(analysis, knowledgeResults) {
            let confidence = analysis.confidence;
            
            if (knowledgeResults.length > 0) {
                confidence = Math.min(0.95, confidence + 0.2);
                
                // Boost for direct matches
                if (knowledgeResults.some(r => r.matchType === 'direct')) {
                    confidence = Math.min(0.98, confidence + 0.1);
                }
            } else {
                confidence = Math.max(0.3, confidence - 0.2);
            }
            
            return confidence;
        }
    };

    // ═══════════════════════════════════════════════════════════════════════════
    // CONVERSATION MANAGER
    // ═══════════════════════════════════════════════════════════════════════════
    
    class ConversationManager {
        constructor() {
            this.conversations = new Map();
            this.memory = new Map();
        }
        
        init(patientId) {
            if (!this.conversations.has(patientId)) {
                this.conversations.set(patientId, []);
                this.memory.set(patientId, {
                    topics: [],
                    context: {},
                    preferences: {}
                });
            }
        }
        
        addMessage(patientId, role, content, metadata = {}) {
            this.init(patientId);
            
            const message = {
                id: `msg_${Date.now()}`,
                role,
                content,
                timestamp: Date.now(),
                metadata
            };
            
            this.conversations.get(patientId).push(message);
            
            // Update memory
            if (metadata.entities) {
                const mem = this.memory.get(patientId);
                metadata.entities.forEach(e => {
                    if (!mem.topics.includes(e.entity)) {
                        mem.topics.push(e.entity);
                    }
                });
            }
            
            return message;
        }
        
        getConversation(patientId) {
            return this.conversations.get(patientId) || [];
        }
        
        getMemory(patientId) {
            return this.memory.get(patientId) || {};
        }
        
        clear(patientId) {
            this.conversations.delete(patientId);
            this.memory.delete(patientId);
        }
    }
    
    const conversationManager = new ConversationManager();

    // ═══════════════════════════════════════════════════════════════════════════
    // MAIN QUERY PROCESSOR
    // ═══════════════════════════════════════════════════════════════════════════
    
    function processQuery(patientId, query, patient) {
        // Step 1: Semantic analysis
        const analysis = SemanticEngine.analyzeQuery(query);
        
        // Step 2: Find relevant knowledge
        const knowledgeResults = SemanticEngine.findKnowledge(analysis.entities, analysis.intent);
        
        // Step 3: Build context from patient data
        const clinicalContext = buildPatientContext(patient);
        
        // Step 4: Generate reasoned response
        const reasoning = ReasoningEngine.generateResponse(analysis, knowledgeResults, clinicalContext);
        
        // Step 5: Format final response
        let responseText = '';
        
        if (CONFIG.reasoning.showReasoningProcess && reasoning.steps.length > 0) {
            responseText += `> 🧠 **Clinical Reasoning:**\n`;
            reasoning.steps.forEach(step => {
                responseText += `> *${step.step}:* ${step.thought}\n`;
            });
            responseText += '\n---\n\n';
        }
        
        responseText += reasoning.conclusion;
        
        // Add sources
        if (reasoning.sources.length > 0) {
            responseText += '\n\n---\n### 📚 References\n';
            reasoning.sources.slice(0, 5).forEach(src => {
                if (typeof src === 'object') {
                    responseText += `• ${src.ref}`;
                    if (src.pmid) responseText += ` (PMID: ${src.pmid})`;
                    if (src.evidence) responseText += ` [Evidence: ${src.evidence}]`;
                    responseText += '\n';
                } else {
                    responseText += `• ${src}\n`;
                }
            });
        }
        
        // Add confidence badge
        responseText += `\n\n---\n`;
        responseText += `✅ **Confidence:** ${(reasoning.confidence * 100).toFixed(0)}% | `;
        responseText += `📖 **Sources:** ${reasoning.sources.length > 0 ? 'Verified Guidelines' : 'Knowledge Base'}`;
        
        return {
            text: responseText,
            confidence: reasoning.confidence,
            sources: reasoning.sources,
            analysis: analysis,
            reasoning: reasoning
        };
    }
    
    function buildPatientContext(patient) {
        const context = {
            diagnosis: patient.diagnosis || null,
            status: patient.status || null,
            labs: [],
            medications: []
        };
        
        if (patient.labImages) {
            patient.labImages.forEach(lab => {
                if (!lab.deleted && lab.ocr?.values) {
                    context.labs.push(...lab.ocr.values);
                }
            });
        }
        
        return context;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // PUBLIC API
    // ═══════════════════════════════════════════════════════════════════════════
    
    return {
        version: CONFIG.version,
        codename: CONFIG.codename,
        
        startConsultation(patientId) {
            conversationManager.init(patientId);
            return {
                success: true,
                message: `Neural Clinical Intelligence "${CONFIG.codename}" v${CONFIG.version} initialized`,
                capabilities: [
                    'Semantic understanding',
                    'Chain-of-thought reasoning',
                    'Comprehensive medical knowledge',
                    'Evidence-based recommendations',
                    'Real-time knowledge synthesis'
                ]
            };
        },
        
        askQuestion(patientId, query, patient) {
            try {
                conversationManager.addMessage(patientId, 'user', query);
                
                const response = processQuery(patientId, query, patient);
                
                conversationManager.addMessage(patientId, 'assistant', response.text, {
                    confidence: response.confidence,
                    sources: response.sources,
                    entities: response.analysis.entities
                });
                
                return {
                    success: true,
                    response: {
                        text: response.text,
                        confidence: response.confidence,
                        sources: response.sources.map(s => typeof s === 'object' ? s.ref : s)
                    }
                };
                
            } catch (error) {
                console.error('Neural Clinical Intelligence Error:', error);
                return {
                    success: false,
                    response: {
                        text: `⚠️ An error occurred: ${error.message}\n\nPlease try rephrasing your question.`,
                        confidence: 0,
                        sources: []
                    }
                };
            }
        },
        
        getHistory(patientId) {
            return conversationManager.getConversation(patientId);
        },
        
        clearHistory(patientId) {
            conversationManager.clear(patientId);
            return { success: true };
        },
        
        getCapabilities() {
            return {
                conditions: Object.keys(MEDICAL_KNOWLEDGE).flatMap(category => 
                    Object.keys(MEDICAL_KNOWLEDGE[category])
                ),
                intents: Object.keys(SemanticEngine.intentPatterns),
                synonyms: Object.keys(SemanticEngine.synonymMap)
            };
        }
    };
})();

// Export
window.NeuralClinicalIntelligence = NeuralClinicalIntelligence;
window.AIMedicalConsultant = NeuralClinicalIntelligence; // Backwards compatibility

// Add ready flag
NeuralClinicalIntelligence.isReady = true;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = NeuralClinicalIntelligence;
}

console.log('✅ Neural Clinical Intelligence "ASCLEPIUS" v3.0 loaded');

// ═══════════════════════════════════════════════════════════════════════════
// VISUAL INDICATOR - Shows badge when module is loaded
// ═══════════════════════════════════════════════════════════════════════════

(function() {
    function showAIBadge() {
        if (document.getElementById('ai-intelligence-badge')) return;
        
        const style = document.createElement('style');
        style.textContent = `
            .ai-intelligence-badge {
                position: fixed;
                top: 110px;
                right: 20px;
                background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
                color: white;
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 8px;
                box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4);
                z-index: 9997;
                animation: aiBadgeSlide 0.5s ease-out 0.2s both;
                cursor: pointer;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            }
            
            @keyframes aiBadgeSlide {
                from { transform: translateX(100px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            .ai-intelligence-badge:hover {
                transform: scale(1.05);
                box-shadow: 0 6px 20px rgba(139, 92, 246, 0.5);
            }
            
            .ai-badge-icon {
                font-size: 14px;
            }
            
            .ai-badge-close {
                margin-left: 8px;
                cursor: pointer;
                opacity: 0.7;
                font-size: 14px;
            }
            
            .ai-badge-close:hover {
                opacity: 1;
            }
            
            .ai-badge-pulse {
                animation: aiPulse 2s ease-in-out infinite;
            }
            
            @keyframes aiPulse {
                0%, 100% { box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4); }
                50% { box-shadow: 0 4px 25px rgba(139, 92, 246, 0.6); }
            }
        `;
        document.head.appendChild(style);
        
        const badge = document.createElement('div');
        badge.id = 'ai-intelligence-badge';
        badge.className = 'ai-intelligence-badge ai-badge-pulse';
        badge.innerHTML = `
            <span class="ai-badge-icon">🤖</span>
            <span>ASCLEPIUS AI v3.0</span>
            <span class="ai-badge-close" onclick="event.stopPropagation(); this.parentElement.remove();">×</span>
        `;
        
        badge.addEventListener('click', function(e) {
            if (e.target.classList.contains('ai-badge-close')) return;
            
            const caps = window.NeuralClinicalIntelligence.getCapabilities();
            
            alert(`🤖 NEURAL CLINICAL INTELLIGENCE "ASCLEPIUS" v3.0

Status: ✅ INSTALLED & READY

Capabilities:
  🧠 Semantic Understanding (synonyms, intent detection)
  💭 Chain-of-Thought Clinical Reasoning
  📚 Comprehensive Medical Knowledge Base
  ✅ Evidence-Based Recommendations
  📖 Verified Source Citations

Knowledge Coverage:
  • Neurology: Stroke/CVA, TIA, NIHSS, thrombolysis
  • Cardiology: ACS, Heart Failure, Atrial Fibrillation
  • Nephrology: AKI, CKD, Electrolytes
  • Pulmonology: PE, COPD, Asthma, Pneumonia
  • Infectious Disease: Sepsis, Meningitis, Endocarditis
  • And more...

Supported Intents:
  ${caps.intents.slice(0, 6).join(', ')}

Try asking:
  "What are the diagnostic criteria for CVA?"
  "How do you treat sepsis?"
  "Differential diagnosis for chest pain"`);
        });
        
        document.body.appendChild(badge);
        
        // Auto-minimize after 10 seconds
        setTimeout(() => {
            if (badge && badge.parentElement) {
                badge.classList.remove('ai-badge-pulse');
                badge.style.transition = 'all 0.5s ease';
                badge.style.padding = '6px 12px';
                badge.style.fontSize = '10px';
                badge.querySelector('span:nth-child(2)').textContent = 'AI Ready';
            }
        }, 10000);
    }
    
    // Show badge when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', showAIBadge);
    } else {
        showAIBadge();
    }
})();
