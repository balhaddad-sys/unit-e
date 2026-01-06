/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  AI MEDICAL CONSULTANT v6.0 - ASCLEPIUS ULTRA                                ║
 * ║  Comprehensive Clinical Intelligence with Deep Medical Knowledge              ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

const AIMedicalConsultant = (function() {
    'use strict';

    const VERSION = '6.0.0';
    const CODENAME = 'ASCLEPIUS-ULTRA';

    // ═══════════════════════════════════════════════════════════════════════════
    // EXTENSIVE MEDICAL KNOWLEDGE BASE
    // ═══════════════════════════════════════════════════════════════════════════

    const KNOWLEDGE = {
        
        // ─────────────────────────────────────────────────────────────────────────
        // RHEUMATOLOGY
        // ─────────────────────────────────────────────────────────────────────────
        
        'gout': {
            keywords: ['gout', 'gouty', 'uric acid', 'urate', 'podagra', 'tophi', 'monoarthritis'],
            category: 'Rheumatology',
            
            quickFacts: {
                definition: 'Crystal arthropathy from monosodium urate (MSU) deposition',
                peak: 'Men 40-60, postmenopausal women',
                classic: 'First MTP joint (podagra) - 50% of first attacks'
            },
            
            clinicalPresentation: {
                acute: [
                    'Sudden onset monoarticular arthritis (often overnight)',
                    'Severe pain peaking in 12-24 hours',
                    'Joint red, hot, swollen, exquisitely tender',
                    'May have low-grade fever, malaise',
                    'Cannot bear weight or touch'
                ],
                joints: {
                    common: ['1st MTP (podagra)', 'Ankle', 'Knee', 'Wrist', 'Fingers'],
                    rare: ['Hip', 'Shoulder', 'Spine']
                },
                chronic: [
                    'Tophi - painless nodules of urate crystite',
                    'Chronic gouty arthropathy',
                    'Joint destruction and deformity'
                ],
                triggers: ['Alcohol (especially beer)', 'Purine-rich foods', 'Dehydration', 'Diuretics', 'Surgery/trauma', 'Rapid weight loss']
            },
            
            diagnosis: {
                goldStandard: {
                    test: 'Synovial fluid analysis',
                    finding: 'Needle-shaped, negatively birefringent crystals under polarized light',
                    note: 'Yellow when parallel to compensator axis'
                },
                supportive: [
                    'Serum uric acid >6.8 mg/dL (BUT can be normal in acute attack!)',
                    'Classic clinical presentation and response to treatment',
                    'Dual-energy CT showing urate deposits',
                    'Ultrasound: double contour sign'
                ],
                workup: {
                    labs: ['Serum uric acid', 'BMP (renal function)', 'CBC', 'CRP/ESR', 'Lipid panel'],
                    imaging: ['X-ray (chronic: punched-out erosions with overhanging edges)', 'Ultrasound', 'DECT if available'],
                    jointFluid: ['Cell count', 'Crystal analysis', 'Gram stain & culture (rule out septic)']
                }
            },
            
            differentialDiagnosis: [
                { condition: 'Septic arthritis', distinguishing: 'Higher fever, more toxic, synovial WBC often >50,000, positive culture' },
                { condition: 'Pseudogout (CPPD)', distinguishing: 'Rhomboid, positively birefringent crystals; often knee' },
                { condition: 'Cellulitis', distinguishing: 'Spreading erythema, no joint effusion' },
                { condition: 'Trauma/fracture', distinguishing: 'History of injury, X-ray findings' },
                { condition: 'Reactive arthritis', distinguishing: 'Recent GI/GU infection, may be polyarticular' }
            ],
            
            treatment: {
                acute: {
                    firstLine: [
                        { drug: 'NSAIDs', dose: 'Indomethacin 50mg TID or Naproxen 500mg BID', duration: '5-7 days', notes: 'Avoid in CKD, GI bleed, heart failure' },
                        { drug: 'Colchicine', dose: '1.2mg then 0.6mg 1 hour later (day 1), then 0.6mg BID', duration: 'Until resolution', notes: 'Most effective within 24-36h of onset; reduce dose in CKD' },
                        { drug: 'Corticosteroids', dose: 'Prednisone 30-40mg/day or intra-articular injection', duration: '5-7 days then taper', notes: 'Use if NSAIDs/colchicine contraindicated' }
                    ],
                    alternatives: [
                        { drug: 'IL-1 inhibitors (Anakinra)', dose: '100mg SC daily x 3 days', notes: 'For refractory cases' }
                    ],
                    adjuncts: ['Ice packs', 'Rest and elevate joint', 'Adequate hydration', 'Avoid alcohol'],
                    keyPoint: '⚠️ Do NOT start or change urate-lowering therapy during acute attack!'
                },
                chronic: {
                    indications: ['≥2 attacks per year', 'Presence of tophi', 'CKD stage 2 or worse', 'History of urolithiasis', 'Radiographic joint damage'],
                    medications: [
                        { drug: 'Allopurinol', dose: 'Start 100mg/day, titrate by 100mg every 2-4 weeks', target: 'Uric acid <6 mg/dL (<5 if tophi)', notes: 'Check HLA-B*5801 in high-risk populations (Asian, African); max 800mg/day' },
                        { drug: 'Febuxostat', dose: '40-80mg daily', notes: 'Alternative if allopurinol intolerant; avoid in cardiovascular disease' },
                        { drug: 'Probenecid', dose: '500mg BID', notes: 'Uricosuric; requires good renal function; avoid with stones' }
                    ],
                    prophylaxis: {
                        drug: 'Colchicine 0.6mg daily or BID',
                        duration: '3-6 months when initiating ULT',
                        alternative: 'Low-dose NSAID if colchicine contraindicated'
                    },
                    lifestyle: ['Limit purine-rich foods (organ meats, shellfish)', 'Limit alcohol (especially beer)', 'Limit fructose/sugar-sweetened beverages', 'Weight loss if obese', 'Stay hydrated', 'Avoid thiazides if possible']
                }
            },
            
            vsSepcticArthritis: {
                critical: '🚨 MUST rule out septic arthritis - can coexist with gout!',
                whenToWorry: ['Fever >38.5°C', 'Very high WBC (>100,000)', 'Multiple risk factors', 'Not responding to gout treatment', 'Immunocompromised', 'Recent joint procedure'],
                approach: 'When in doubt, tap the joint and treat for BOTH until cultures negative x 48-72h',
                comparison: `
| Feature | Gout | Septic Arthritis |
|---------|------|------------------|
| Crystals | MSU present | Usually absent |
| Synovial WBC | 10,000-50,000 | >50,000 (often >100,000) |
| Gram stain | Negative | Positive 50-75% |
| Culture | Negative | Positive 70-90% |
| Fever | Low-grade or absent | Often high |
| Response to NSAIDs | Rapid improvement | No improvement |`
            },
            
            prognosis: {
                acute: 'Self-limited over 1-2 weeks even without treatment',
                chronic: 'Progressive joint damage without ULT',
                withTreatment: 'Excellent control with proper urate-lowering therapy'
            },
            
            pearlsAndPitfalls: [
                '💎 Uric acid may be NORMAL during acute attack - dont exclude gout based on this',
                '💎 First attack is almost always monoarticular',
                '💎 Response to colchicine within 24-48h supports diagnosis',
                '💎 Always rule out septic arthritis - they can coexist!',
                '💎 Start ULT at low dose to prevent mobilization flares',
                '⚠️ Dont start/stop ULT during acute attack',
                '⚠️ HLA-B*5801 testing before allopurinol in high-risk populations'
            ],
            
            sources: ['ACR Gout Guidelines 2020', 'EULAR Gout Recommendations 2016', 'UpToDate 2024']
        },

        'septic arthritis': {
            keywords: ['septic arthritis', 'septic joint', 'infectious arthritis', 'bacterial arthritis', 'joint infection', 'pyogenic arthritis'],
            category: 'Rheumatology/Infectious Disease',
            
            quickFacts: {
                definition: 'Bacterial infection of a joint - EMERGENCY!',
                motto: '"Time is cartilage" - delays cause permanent damage',
                mortality: '10-15% overall, higher in elderly/immunocompromised'
            },
            
            clinicalPresentation: {
                classic: [
                    'Acute monoarticular arthritis (90%)',
                    'Hot, swollen, red, extremely painful joint',
                    'Severe pain with ANY movement (active or passive)',
                    'Fever (present in ~60%, may be absent in elderly/immunocompromised)',
                    'Patient appears more "sick" than gout',
                    'May have rigors, malaise'
                ],
                joints: {
                    mostCommon: 'Knee (50%)',
                    others: ['Hip', 'Ankle', 'Wrist', 'Shoulder', 'Elbow'],
                    note: 'Hip septic arthritis may present with groin pain, limited ROM'
                },
                riskFactors: [
                    'Pre-existing joint disease (RA, OA, gout)',
                    'Joint prosthesis',
                    'Recent joint injection or surgery',
                    'Diabetes mellitus',
                    'Immunosuppression (steroids, biologics, HIV)',
                    'IV drug use',
                    'Skin infection or breakdown',
                    'Bacteremia from any source',
                    'Advanced age'
                ]
            },
            
            diagnosis: {
                goldStandard: 'Arthrocentesis with synovial fluid analysis',
                findings: {
                    appearance: 'Purulent, cloudy, yellow-green',
                    WBC: '>50,000/μL (often >100,000) with >90% PMNs',
                    gramStain: 'Positive in 50-75%',
                    culture: 'Positive in 70-90%',
                    note: 'Partially treated infection may have lower WBC'
                },
                organisms: {
                    adults: [
                        { organism: 'Staphylococcus aureus', frequency: '40-50%', notes: 'Most common overall; consider MRSA' },
                        { organism: 'Streptococci', frequency: '20-30%', notes: 'Group A, B, pneumoniae' },
                        { organism: 'Gram-negative bacilli', frequency: '10-20%', notes: 'Elderly, immunocompromised, UTI source' },
                        { organism: 'Neisseria gonorrhoeae', frequency: 'Variable', notes: 'Young, sexually active; often migratory, tenosynovitis' }
                    ],
                    special: [
                        { population: 'IV drug users', organisms: 'Pseudomonas, S. aureus' },
                        { population: 'Prosthetic joint', organisms: 'Coag-negative staph, S. aureus, Propionibacterium' },
                        { population: 'Immunocompromised', organisms: 'Gram-negatives, fungi, mycobacteria' }
                    ]
                },
                workup: {
                    essential: ['Arthrocentesis - send for WBC, differential, Gram stain, culture, crystals', 'Blood cultures (positive in 50%)', 'CBC, CMP, CRP, ESR'],
                    imaging: ['X-ray (baseline; may show soft tissue swelling, later joint destruction)', 'MRI if deep joint (hip) or spine suspected', 'Ultrasound can guide aspiration'],
                    other: ['STI testing if gonococcal suspected', 'Source workup (UA, CXR if indicated)']
                }
            },
            
            differentialDiagnosis: [
                { condition: 'Gout/Pseudogout', distinguishing: 'Crystals present, lower WBC, responds to NSAIDs/colchicine' },
                { condition: 'Reactive arthritis', distinguishing: 'Recent GI/GU infection, sterile joint, may have extra-articular features' },
                { condition: 'Rheumatoid flare', distinguishing: 'History of RA, usually polyarticular, RF/CCP positive' },
                { condition: 'Trauma', distinguishing: 'History of injury, bloody effusion' },
                { condition: 'Lyme arthritis', distinguishing: 'Endemic area, tick exposure, serology positive' }
            ],
            
            treatment: {
                principles: [
                    '1. Empiric antibiotics IMMEDIATELY after cultures obtained',
                    '2. Joint drainage is ESSENTIAL',
                    '3. Adjust antibiotics based on culture results'
                ],
                antibiotics: {
                    empiric: [
                        { regimen: 'Vancomycin', dose: '15-20 mg/kg IV q8-12h', coverage: 'MRSA, MSSA, Strep', notes: 'First-line for most patients' },
                        { regimen: '+ Ceftriaxone', dose: '2g IV daily', coverage: 'Gram-negatives', notes: 'Add if GN risk factors' }
                    ],
                    directed: [
                        { organism: 'MSSA', treatment: 'Nafcillin or Cefazolin', duration: '4-6 weeks' },
                        { organism: 'MRSA', treatment: 'Vancomycin or Daptomycin', duration: '4-6 weeks' },
                        { organism: 'Streptococci', treatment: 'Penicillin G or Ceftriaxone', duration: '2-4 weeks' },
                        { organism: 'Gram-negatives', treatment: 'Ceftriaxone or Fluoroquinolone', duration: '3-4 weeks' },
                        { organism: 'N. gonorrhoeae', treatment: 'Ceftriaxone 1g daily', duration: '7-14 days' }
                    ],
                    duration: 'Native joint: 2-4 weeks; S. aureus or Gram-neg: 4-6 weeks; Prosthetic: 6+ weeks'
                },
                drainage: {
                    essential: 'Repeated drainage is KEY to outcomes',
                    options: [
                        { method: 'Serial arthrocentesis', notes: 'Often adequate for accessible joints (knee, ankle)' },
                        { method: 'Arthroscopic drainage', notes: 'Better visualization, can break up loculations' },
                        { method: 'Open surgical drainage', notes: 'Hip, shoulder, failed other methods, prosthetic' }
                    ],
                    prosthetic: {
                        acute: 'DAIR (Debridement, Antibiotics, Implant Retention) if <3 weeks and stable implant',
                        chronic: 'Usually requires prosthesis removal (one or two-stage exchange)'
                    }
                },
                monitoring: ['Daily clinical assessment', 'Repeat arthrocentesis if not improving', 'CRP trending down', 'Blood cultures clearing']
            },
            
            prognosis: {
                good: 'Early diagnosis and treatment → good functional outcome',
                poor: [
                    'Delayed treatment (>7 days)',
                    'S. aureus or Gram-negative infection',
                    'Elderly or immunocompromised',
                    'Prosthetic joint infection',
                    'Pre-existing joint disease'
                ],
                outcomes: {
                    mortality: '10-15%',
                    jointDestruction: '25-50% have some permanent damage',
                    functional: 'Best with treatment within 5 days of symptom onset'
                }
            },
            
            pearlsAndPitfalls: [
                '💎 When in doubt, TAP THE JOINT!',
                '💎 Gout and septic arthritis can coexist - dont exclude infection just because crystals present',
                '💎 Fever may be absent in elderly and immunocompromised',
                '💎 Gonococcal arthritis often has migratory polyarthralgias and tenosynovitis',
                '⚠️ Hip septic arthritis requires urgent surgical drainage',
                '⚠️ Never delay antibiotics for imaging',
                '⚠️ Low synovial glucose (<50% serum) suggests infection'
            ],
            
            sources: ['IDSA Guidelines', 'ACR/AF Septic Arthritis Recommendations', 'UpToDate 2024']
        },

        // ─────────────────────────────────────────────────────────────────────────
        // CRITICAL CARE
        // ─────────────────────────────────────────────────────────────────────────

        'post arrest': {
            keywords: ['post arrest', 'post cardiac arrest', 'rosc', 'post resuscitation', 'after cpr', 'post code'],
            category: 'Critical Care',
            
            quickFacts: {
                definition: 'Comprehensive care following ROSC (Return of Spontaneous Circulation)',
                goal: 'Prevent secondary brain injury, optimize organ function, identify cause'
            },
            
            ROSCconfirmed: [
                'Palpable pulse',
                'Measurable blood pressure',
                'Arterial waveform on monitor',
                'ETCO2 >40 mmHg (suggests adequate circulation)'
            ],
            
            immediatePriorities: [
                { priority: '1. Airway', actions: ['Secure airway (ETT preferred)', 'Verify placement with waveform capnography', 'Target SpO2 92-98% (avoid hyperoxia!)', 'Target PaCO2 35-45 mmHg'] },
                { priority: '2. Breathing', actions: ['Avoid hyperventilation (causes cerebral vasoconstriction)', 'Wean FiO2 to maintain SpO2 92-98%', 'Protective ventilation if ARDS'] },
                { priority: '3. Circulation', actions: ['Target MAP ≥65-80 mmHg', 'SBP >90 mmHg', 'Norepinephrine first-line vasopressor', '12-lead ECG immediately', 'Echocardiogram'] },
                { priority: '4. Disability', actions: ['Assess GCS and pupils', 'Check glucose (target 144-180 mg/dL)', 'Treat seizures if present', 'Consider TTM'] },
                { priority: '5. Exposure', actions: ['Full exam for precipitant', 'Labs, toxicology', 'Treat underlying cause'] }
            ],
            
            ECG_cath: {
                STEMI: 'Immediate coronary angiography (within 2 hours) regardless of mental status',
                noSTEMI: 'Consider early angiography (within 24h) if no obvious non-cardiac cause',
                note: 'PCI should not be delayed for TTM initiation'
            },
            
            TTM: {
                indication: 'Comatose patients (not following commands) after ROSC from any rhythm',
                target: '32-36°C for at least 24 hours',
                evidence: 'TTM2 trial showed 36°C as effective as 33°C for survival',
                methods: ['Surface cooling (blankets, pads)', 'Intravascular cooling (catheter)', 'Cold IV saline can be adjunct (not sole method)'],
                timeline: 'Initiate ASAP, maintain x 24h, rewarm slowly (0.25-0.5°C/hr)',
                avoidFever: 'Aggressive fever prevention for 72 hours post-rewarming',
                contraindications: ['Active bleeding', 'Refractory arrhythmias', 'Already hypothermic']
            },
            
            seizures: {
                incidence: '10-40% post-arrest',
                treatment: 'Standard AEDs (levetiracetam, valproate)',
                note: 'EEG monitoring recommended in comatose patients'
            },
            
            metabolic: {
                glucose: 'Target 144-180 mg/dL; avoid hypoglycemia',
                electrolytes: 'Correct K, Mg, Ca',
                acidosis: 'Usually corrects with improved perfusion; bicarb if pH <7.1 or severe hyperkalemia'
            },
            
            prognostication: {
                timing: 'Wait ≥72 hours from ROSC (longer if sedation/TTM/paralysis)',
                approach: 'Multimodal - NO single test is 100%',
                poorPrognostic: [
                    'Bilateral absent pupillary light reflex at 72h (most specific)',
                    'Bilateral absent corneal reflex at 72h',
                    'Status myoclonus within 72h (especially early)',
                    'Absent N20 on SSEP at 24-72h',
                    'Highly malignant EEG (burst suppression, suppressed)',
                    'NSE >60 μg/L at 48-72h',
                    'Diffuse anoxic injury on CT/MRI'
                ],
                pitfalls: [
                    'Sedatives and paralytics affect exam',
                    'Hypothermia slows drug metabolism',
                    'Allow adequate time off sedation',
                    'Use multimodal approach'
                ]
            },
            
            workup: [
                'ECG (STEMI?)',
                'Labs: CBC, CMP, lactate, troponin, ABG, coags',
                'Toxicology screen',
                'Chest X-ray',
                'Echocardiogram',
                'CT head (if no obvious cardiac cause)',
                'Consider coronary angiography'
            ],
            
            pearlsAndPitfalls: [
                '💎 Avoid hyperoxia - target SpO2 92-98%',
                '💎 Avoid hypotension - MAP ≥65 (consider ≥80 for brain)',
                '💎 Avoid fever aggressively',
                '💎 Get ECG immediately - dont delay cath for STEMI',
                '💎 TTM is standard of care for comatose patients',
                '⚠️ Dont prognosticate too early - wait 72+ hours',
                '⚠️ Myoclonus alone is not reliable prognostic sign',
                '⚠️ Consider sedation effects on neurologic exam'
            ],
            
            sources: ['AHA Post-Cardiac Arrest Care Guidelines 2020', 'TTM2 Trial NEJM 2021', 'ERC-ESICM Guidelines 2021']
        },

        'sepsis': {
            keywords: ['sepsis', 'septic shock', 'septicemia', 'severe sepsis', 'SIRS', 'bacteremia'],
            category: 'Critical Care/Infectious Disease',
            
            quickFacts: {
                definition: 'Life-threatening organ dysfunction due to dysregulated host response to infection',
                motto: '"Time is life" - every hour of delay increases mortality ~8%'
            },
            
            definitions: {
                sepsis: 'Suspected/documented infection + SOFA score ≥2 points',
                septicShock: 'Sepsis + vasopressors to maintain MAP ≥65 + lactate >2 mmol/L despite adequate fluid resuscitation',
                qSOFA: {
                    criteria: ['Respiratory rate ≥22/min', 'Altered mentation (GCS <15)', 'Systolic BP ≤100 mmHg'],
                    use: '≥2 criteria = high risk; screening tool only'
                },
                SOFA: {
                    components: ['Respiration (PaO2/FiO2)', 'Coagulation (platelets)', 'Liver (bilirubin)', 'Cardiovascular (MAP/vasopressors)', 'CNS (GCS)', 'Renal (creatinine/UOP)'],
                    scoring: '0-4 points each, total 0-24'
                }
            },
            
            hourOneBunde: {
                title: '⏱️ HOUR-1 BUNDLE (do within 1 hour of recognition)',
                items: [
                    '🔬 Measure lactate (remeasure in 2-4h if initially elevated >2)',
                    '🧫 Obtain blood cultures BEFORE antibiotics (but dont delay abx)',
                    '💊 Administer broad-spectrum antibiotics',
                    '💧 Begin 30 mL/kg crystalloid for hypotension or lactate ≥4',
                    '💉 Start vasopressors if hypotensive during or after fluid resuscitation (target MAP ≥65)'
                ]
            },
            
            fluids: {
                initial: '30 mL/kg crystalloid bolus (ideally Lactated Ringers)',
                reassess: 'After each bolus - exam, vitals, lactate, UOP',
                caution: 'Avoid over-resuscitation (pulmonary edema, abdominal compartment syndrome)',
                tools: ['Passive leg raise', 'Pulse pressure variation', 'Fluid responsiveness assessment']
            },
            
            antibiotics: {
                timing: 'Within 1 hour of sepsis recognition (ideally within 3 hours)',
                principle: 'Broad initially → narrow based on cultures',
                empiric: {
                    communityPneumonia: 'Ceftriaxone + Azithromycin or Respiratory FQ alone',
                    communityAbdominal: 'Piperacillin-tazobactam or Ceftriaxone + Metronidazole',
                    communityGU: 'Ceftriaxone or Fluoroquinolone',
                    hospitalAcquired: 'Piperacillin-tazobactam or Meropenem',
                    MDRrisk: 'Add Vancomycin (MRSA) and/or double Pseudomonas coverage'
                },
                sourceControl: 'Essential! Drain abscesses, remove infected devices, debride necrotic tissue'
            },
            
            vasopressors: {
                indication: 'MAP <65 despite adequate fluid resuscitation',
                firstLine: { drug: 'Norepinephrine', dose: '0.1-2 mcg/kg/min', notes: 'Alpha-1 > Beta-1' },
                secondLine: { drug: 'Vasopressin', dose: '0.03-0.04 units/min (fixed dose)', notes: 'Add to NE, catecholamine-sparing' },
                thirdLine: { drug: 'Epinephrine', dose: '0.1-0.5 mcg/kg/min', notes: 'If cardiac dysfunction' },
                cardiac: { drug: 'Dobutamine', dose: '2.5-20 mcg/kg/min', notes: 'If low cardiac output despite fluids' },
                notes: ['Central line preferred but dont delay for access', 'Can use peripheral short-term']
            },
            
            steroids: {
                indication: 'Septic shock refractory to fluids and vasopressors',
                dose: 'Hydrocortisone 200 mg/day (50mg q6h or continuous infusion)',
                duration: 'Until shock resolved, then taper',
                evidence: 'ADRENAL and APROCCHSS trials show faster shock reversal, possibly mortality benefit'
            },
            
            monitoring: ['MAP', 'Lactate clearance (goal >10% decrease in 2-4h)', 'Urine output (>0.5 mL/kg/h)', 'Mental status', 'Skin perfusion'],
            
            pearlsAndPitfalls: [
                '💎 "Sepsis is a medical emergency" - treat like MI or stroke',
                '💎 Early antibiotics save lives - dont wait for cultures',
                '💎 Lactate is your friend - trend it',
                '💎 Source control is essential - drain, remove, debride',
                '⚠️ Dont over-resuscitate - assess fluid responsiveness',
                '⚠️ Vancomycin for everyone is usually not needed',
                '⚠️ Low-dose dopamine does NOT protect kidneys'
            ],
            
            sources: ['Surviving Sepsis Campaign Guidelines 2021', 'Sepsis-3 JAMA 2016', 'ADRENAL Trial NEJM 2018']
        },

        // ─────────────────────────────────────────────────────────────────────────
        // NEUROLOGY
        // ─────────────────────────────────────────────────────────────────────────

        'stroke': {
            keywords: ['stroke', 'cva', 'cerebrovascular accident', 'brain attack', 'ischemic stroke', 'hemorrhagic stroke', 'tpa', 'alteplase', 'thrombectomy'],
            category: 'Neurology',
            
            quickFacts: {
                definition: 'Sudden focal neurological deficit due to cerebrovascular event',
                motto: '"Time is brain" - 1.9 million neurons lost per minute',
                types: { ischemic: '87%', hemorrhagic: '13%' }
            },
            
            recognition: {
                BEFAST: ['Balance - sudden dizziness/loss of balance', 'Eyes - vision changes', 'Face - facial droop', 'Arm - arm weakness/drift', 'Speech - slurred speech/aphasia', 'Time - time to call 911'],
                NIHSS: {
                    range: '0-42',
                    components: ['Level of consciousness', 'Gaze', 'Visual fields', 'Facial palsy', 'Motor arm/leg', 'Ataxia', 'Sensory', 'Language', 'Dysarthria', 'Extinction/inattention'],
                    interpretation: { '0': 'No stroke', '1-4': 'Minor', '5-15': 'Moderate', '16-20': 'Moderate-severe', '21-42': 'Severe' }
                }
            },
            
            acuteManagement: {
                imaging: {
                    CT: 'Non-contrast CT head within 20 minutes of arrival - rule out hemorrhage',
                    CTA: 'CT angiography to identify large vessel occlusion',
                    perfusion: 'For extended window or wake-up stroke',
                    MRI: 'DWI-FLAIR mismatch for wake-up stroke'
                },
                thrombolysis: {
                    drug: 'Alteplase (tPA)',
                    dose: '0.9 mg/kg (max 90mg) - 10% bolus, 90% over 60 minutes',
                    window: '≤4.5 hours from last known well (extended with favorable imaging)',
                    BPrequirements: 'Must be <185/110 before; maintain <180/105 after',
                    contraindications: ['Recent major surgery', 'Active bleeding', 'Platelets <100,000', 'INR >1.7', 'Recent stroke', 'Large infarct on CT'],
                    alternatives: 'Tenecteplase 0.25 mg/kg single bolus (increasingly used)'
                },
                thrombectomy: {
                    indication: 'Large vessel occlusion (ICA, M1, M2, basilar)',
                    window: 'Standard ≤6 hours; extended up to 24 hours with favorable perfusion imaging',
                    trials: 'DAWN, DEFUSE-3 showed benefit to 24 hours',
                    NNT: '2.6 - one of most effective treatments in medicine!'
                },
                BP: {
                    pretPA: '<185/110',
                    posttPA: '<180/105 for 24 hours',
                    noreperfusion: 'Permissive hypertension up to 220/120',
                    hemorrhagic: 'SBP <140 if presenting 150-220'
                }
            },
            
            secondaryPrevention: {
                antiplatelet: {
                    minorStroke_TIA: 'Dual antiplatelet (ASA + clopidogrel) x 21 days, then single agent',
                    majorStroke: 'Single antiplatelet (ASA 81-325mg or clopidogrel 75mg)'
                },
                anticoagulation: 'For cardioembolic (AF) - start 4-14 days after ischemic stroke depending on size',
                statin: 'High-intensity statin (atorvastatin 80mg) - target LDL <70',
                BP: 'Target <130/80 after acute phase',
                carotid: 'Revascularization if >70% symptomatic stenosis'
            },
            
            pearlsAndPitfalls: [
                '💎 CT can be normal in acute ischemic stroke - treat clinically',
                '💎 Wake-up stroke can get tPA if DWI-FLAIR mismatch on MRI',
                '💎 Thrombectomy works even if tPA given - both can be done',
                '💎 Blood pressure control is critical post-tPA',
                '⚠️ Dont give aspirin within 24h of tPA',
                '⚠️ Avoid aggressive BP lowering in acute stroke without reperfusion',
                '⚠️ Check glucose - hypoglycemia can mimic stroke'
            ],
            
            sources: ['AHA/ASA Stroke Guidelines 2019', 'DAWN Trial NEJM 2018', 'DEFUSE-3 Trial NEJM 2018']
        },

        // ─────────────────────────────────────────────────────────────────────────
        // CARDIOLOGY
        // ─────────────────────────────────────────────────────────────────────────

        'acs': {
            keywords: ['acs', 'mi', 'myocardial infarction', 'heart attack', 'stemi', 'nstemi', 'unstable angina', 'chest pain', 'nste-acs'],
            category: 'Cardiology',
            
            quickFacts: {
                definition: 'Spectrum of acute myocardial ischemia: unstable angina → NSTEMI → STEMI',
                motto: '"Time is muscle" - door-to-balloon <90 minutes for STEMI'
            },
            
            types: {
                STEMI: {
                    definition: 'ST elevation ≥1mm in ≥2 contiguous leads (≥2mm in V1-V3 men, ≥1.5mm women)',
                    treatment: 'Primary PCI within 90 minutes (door-to-balloon)',
                    equivalents: ['New LBBB with ischemic symptoms', 'Posterior MI (ST depression V1-V3 + tall R waves)', 'Wellens syndrome', 'de Winter T waves']
                },
                NSTEMI: {
                    definition: 'Elevated troponin + ischemic symptoms WITHOUT ST elevation',
                    treatment: 'Early invasive strategy (24-72 hours) if high risk'
                },
                unstableAngina: {
                    definition: 'Ischemic symptoms without troponin elevation or ST elevation',
                    treatment: 'Risk stratify and treat medically vs invasive'
                }
            },
            
            treatment: {
                immediate: [
                    'Aspirin 325mg (chew)',
                    'P2Y12 inhibitor (ticagrelor 180mg or clopidogrel 600mg loading)',
                    'Anticoagulation (heparin bolus + infusion)',
                    'Nitrates SL/IV for ongoing chest pain (avoid if hypotensive, RV infarct, PDE5i use)',
                    'Oxygen only if SpO2 <90%',
                    'Beta-blocker if no contraindications (avoid if hypotensive, HR <60, signs of HF)'
                ],
                reperfusion: {
                    STEMI: 'Primary PCI is preferred; fibrinolysis if PCI not available within 120 minutes',
                    NSTEMI: {
                        immediate: 'Refractory angina, hemodynamic instability, VT/VF',
                        early: 'GRACE score >140, troponin rise, new ST changes',
                        delayed: 'Lower risk, stable'
                    }
                },
                postMI: ['Aspirin indefinitely', 'P2Y12 inhibitor x 12 months', 'High-intensity statin', 'ACEi/ARB (especially if EF ≤40%)', 'Beta-blocker', 'Cardiac rehabilitation']
            },
            
            pearlsAndPitfalls: [
                '💎 Get ECG within 10 minutes of arrival',
                '💎 Troponin takes 3-6 hours to rise - serial testing',
                '💎 RV infarct (STE in V4R) - avoid nitrates, give fluids',
                '💎 Posterior MI may only show ST depression in V1-V3',
                '⚠️ Beta-blockers contraindicated in cardiogenic shock, cocaine',
                '⚠️ Dont miss aortic dissection (different treatment!)'
            ],
            
            sources: ['ACC/AHA STEMI Guidelines 2013', 'ESC NSTE-ACS Guidelines 2020', 'ACC/AHA UA/NSTEMI Guidelines']
        },

        'heart failure': {
            keywords: ['heart failure', 'chf', 'hfref', 'hfpef', 'congestive heart failure', 'ef reduced', 'cardiomyopathy', 'dyspnea'],
            category: 'Cardiology',
            
            quickFacts: {
                definition: 'Clinical syndrome from structural/functional cardiac abnormality causing reduced CO or elevated filling pressures'
            },
            
            classification: {
                byEF: {
                    HFrEF: 'EF ≤40% (HF with reduced EF)',
                    HFmrEF: 'EF 41-49% (HF with mildly reduced EF)',
                    HFpEF: 'EF ≥50% (HF with preserved EF)'
                },
                NYHA: {
                    I: 'No limitation - ordinary activity asymptomatic',
                    II: 'Slight limitation - ordinary activity causes symptoms',
                    III: 'Marked limitation - less than ordinary activity causes symptoms',
                    IV: 'Symptoms at rest'
                },
                stages: {
                    A: 'At risk but no structural disease or symptoms',
                    B: 'Structural disease but no symptoms',
                    C: 'Structural disease with symptoms',
                    D: 'Advanced HF requiring specialized interventions'
                }
            },
            
            treatment: {
                GDMT_HFrEF: {
                    fourPillars: [
                        { class: 'RAASi', drugs: 'ACEi/ARB → ARNI (sacubitril-valsartan)', target: 'Max tolerated dose', benefit: '↓ mortality 16-20%' },
                        { class: 'Beta-blocker', drugs: 'Carvedilol, Metoprolol succinate, Bisoprolol', target: 'Max tolerated dose', benefit: '↓ mortality ~35%' },
                        { class: 'MRA', drugs: 'Spironolactone or Eplerenone', target: '25-50mg daily', benefit: '↓ mortality ~30%' },
                        { class: 'SGLT2i', drugs: 'Dapagliflozin or Empagliflozin', target: '10mg daily', benefit: '↓ mortality/HF hospitalization ~25%' }
                    ],
                    goal: 'Get on ALL 4 pillars at target doses!',
                    additional: ['Loop diuretics for congestion (not mortality benefit)', 'Hydralazine-nitrate (especially AA patients)', 'Ivabradine if HR >70 on max BB', 'Digoxin for symptom control']
                },
                devices: {
                    ICD: 'Primary prevention if EF ≤35% on GDMT for 3 months',
                    CRT: 'EF ≤35% + LBBB + QRS ≥150ms + NYHA II-IV'
                },
                acute: ['IV diuretics', 'Vasodilators if hypertensive', 'Inotropes if cardiogenic shock', 'Consider MCS if refractory']
            },
            
            pearlsAndPitfalls: [
                '💎 SGLT2i work even without diabetes!',
                '💎 Titrate GDMT before considering devices',
                '💎 ARNI > ACEi, but need 36h washout when switching',
                '⚠️ Dont stop beta-blocker in acute decompensation (reduce dose)',
                '⚠️ Check K and Cr when on ACEi + MRA'
            ],
            
            sources: ['ACC/AHA HF Guidelines 2022', 'ESC HF Guidelines 2021', 'DAPA-HF, EMPEROR-Reduced trials']
        },

        'atrial fibrillation': {
            keywords: ['afib', 'atrial fibrillation', 'af', 'a-fib', 'irregular heartbeat', 'anticoagulation'],
            category: 'Cardiology',
            
            quickFacts: {
                definition: 'Supraventricular tachyarrhythmia with uncoordinated atrial activation',
                ECG: 'Irregularly irregular R-R intervals, no P waves, fibrillatory waves'
            },
            
            strokeRisk: {
                score: 'CHA₂DS₂-VASc',
                components: ['CHF (1)', 'HTN (1)', 'Age ≥75 (2)', 'DM (1)', 'Stroke/TIA (2)', 'Vascular disease (1)', 'Age 65-74 (1)', 'Sex female (1)'],
                anticoagulation: {
                    men: '0 = no anticoag, 1 = consider, ≥2 = anticoagulate',
                    women: '1 = no anticoag (sex point alone), 2 = consider, ≥3 = anticoagulate'
                },
                DOACs: 'Preferred over warfarin for non-valvular AF',
                HASBLED: 'Bleeding risk score - high score is NOT contraindication, just need closer monitoring'
            },
            
            management: {
                rateControl: {
                    target: '<110 bpm at rest (lenient) or <80 (strict)',
                    agents: ['Beta-blockers (metoprolol, carvedilol)', 'CCB (diltiazem, verapamil) - not with HFrEF', 'Digoxin (adjunct, especially if HF)']
                },
                rhythmControl: {
                    indication: 'Symptomatic despite rate control, patient preference, HFrEF',
                    agents: ['Amiodarone (most effective, most toxic)', 'Flecainide/Propafenone (no structural heart disease)', 'Sotalol', 'Dofetilide'],
                    ablation: 'Consider if symptomatic despite meds, or as first-line in select patients'
                },
                acuteAF: {
                    unstable: 'Synchronized cardioversion',
                    stable_rateControl: 'IV beta-blocker or diltiazem',
                    cardioversion: 'If AF <48h, can cardiovert; if >48h or unknown, anticoag 3 weeks or TEE first'
                }
            },
            
            sources: ['ACC/AHA AF Guidelines 2023', 'ESC AF Guidelines 2020']
        },

        // ─────────────────────────────────────────────────────────────────────────
        // NEPHROLOGY
        // ─────────────────────────────────────────────────────────────────────────

        'aki': {
            keywords: ['aki', 'acute kidney injury', 'acute renal failure', 'arf', 'creatinine elevated', 'renal failure'],
            category: 'Nephrology',
            
            quickFacts: {
                definition: 'Abrupt decrease in kidney function over hours to days'
            },
            
            diagnosis: {
                KDIGO: [
                    'Increase in SCr ≥0.3 mg/dL within 48 hours, OR',
                    'Increase in SCr ≥1.5x baseline within 7 days, OR',
                    'UOP <0.5 mL/kg/h for 6 hours'
                ],
                staging: {
                    Stage1: 'Cr 1.5-1.9x baseline OR ≥0.3 increase OR UOP <0.5 mL/kg/h x 6-12h',
                    Stage2: 'Cr 2.0-2.9x baseline OR UOP <0.5 mL/kg/h x ≥12h',
                    Stage3: 'Cr ≥3.0x baseline OR ≥4.0 OR RRT OR anuria ≥12h'
                }
            },
            
            causes: {
                prerenal: {
                    causes: ['Hypovolemia (bleeding, dehydration)', 'HF with low output', 'Cirrhosis/hepatorenal', 'Sepsis (early)', 'Medications (ACEi/ARB, NSAIDs)'],
                    labs: { FENa: '<1%', BUN_Cr: '>20:1', urineNa: '<20 mEq/L', osmolality: '>500' }
                },
                intrinsic: {
                    causes: ['ATN (ischemic or toxic)', 'AIN (drugs, infection)', 'Glomerulonephritis', 'Vascular (TTP, cholesterol emboli)'],
                    labs: { FENa: '>2%', BUN_Cr: '<20:1', urineNa: '>40 mEq/L', muddy_casts: 'ATN' }
                },
                postrenal: {
                    causes: ['BPH', 'Kidney stones', 'Malignancy', 'Strictures', 'Neurogenic bladder'],
                    diagnosis: 'Renal ultrasound showing hydronephrosis'
                }
            },
            
            management: [
                'Identify and treat underlying cause',
                'Optimize volume status (avoid both hypo- and hypervolemia)',
                'Stop nephrotoxins (NSAIDs, aminoglycosides, contrast)',
                'Adjust medication doses for renal function',
                'Monitor electrolytes closely (K+, acid-base)',
                'Avoid further insults'
            ],
            
            dialysisIndications: {
                mnemonic: 'AEIOU',
                A: 'Acidosis (pH <7.1) refractory to bicarb',
                E: 'Electrolytes (K+ >6.5) refractory to medical management',
                I: 'Intoxication (lithium, methanol, ethylene glycol, salicylates)',
                O: 'Overload (volume) refractory to diuretics',
                U: 'Uremia (encephalopathy, pericarditis, bleeding)'
            },
            
            sources: ['KDIGO AKI Guidelines 2012']
        },

        'hyperkalemia': {
            keywords: ['hyperkalemia', 'high potassium', 'elevated potassium', 'k high', 'potassium elevated'],
            category: 'Nephrology/Critical Care',
            
            quickFacts: {
                definition: 'Serum K+ >5.5 mEq/L',
                danger: 'Can cause fatal arrhythmias'
            },
            
            severity: {
                mild: '5.5-6.0 mEq/L',
                moderate: '6.1-6.9 mEq/L',
                severe: '≥7.0 mEq/L'
            },
            
            ECGchanges: ['Peaked T waves (earliest)', 'Prolonged PR interval', 'Flattened P waves', 'Widened QRS', 'Sine wave pattern (pre-arrest)', 'VF/asystole'],
            
            treatment: {
                stabilize: {
                    indication: 'ECG changes OR K+ >6.5',
                    drug: 'Calcium gluconate 1-2g IV over 5-10 min',
                    note: 'Use CaCl if central line (3x more elemental Ca)',
                    effect: 'Stabilizes myocardium, onset 1-3 min, lasts 30-60 min'
                },
                shift: [
                    { drug: 'Regular Insulin 10U + D50', onset: '15-30 min', duration: '4-6h', note: 'Most reliable; give D50 even if hyperglycemic to prevent hypoglycemia' },
                    { drug: 'Albuterol nebulizer 10-20mg', onset: '30 min', duration: '2h', note: '10mg = lowers K 0.5-1.0 mEq/L' },
                    { drug: 'Sodium bicarbonate', onset: 'Variable', note: 'Only if acidotic; less effective alone' }
                ],
                eliminate: [
                    { method: 'Loop diuretics', note: 'If volume overload and some renal function' },
                    { method: 'GI binders', options: 'Patiromer, SZC (Lokelma), Kayexalate', note: 'Takes hours; good for chronic' },
                    { method: 'Hemodialysis', note: 'Definitive; for severe or refractory cases' }
                ]
            },
            
            pearlsAndPitfalls: [
                '💎 Always get ECG immediately',
                '💎 Calcium does NOT lower K - it protects the heart',
                '💎 Insulin is most reliable for shifting K',
                '⚠️ Check glucose 1h after insulin - hypoglycemia common',
                '⚠️ Pseudohyperkalemia: hemolysis, high WBC/platelets'
            ],
            
            sources: ['AHA Hyperkalemia Guidelines', 'KDIGO']
        },

        // ─────────────────────────────────────────────────────────────────────────
        // ENDOCRINE
        // ─────────────────────────────────────────────────────────────────────────

        'dka': {
            keywords: ['dka', 'diabetic ketoacidosis', 'ketoacidosis', 'ketones', 'anion gap'],
            category: 'Endocrinology/Critical Care',
            
            quickFacts: {
                definition: 'Metabolic emergency: hyperglycemia + ketosis + acidosis',
                triad: ['Glucose >250', 'pH <7.3 or HCO3 <18', 'Positive ketones + anion gap elevated']
            },
            
            severity: {
                mild: 'pH 7.25-7.30, HCO3 15-18, alert',
                moderate: 'pH 7.0-7.24, HCO3 10-14, drowsy',
                severe: 'pH <7.0, HCO3 <10, stupor/coma'
            },
            
            treatment: {
                fluids: {
                    initial: 'NS 1-1.5L in first hour',
                    subsequent: '250-500 mL/h; switch to 0.45% NS if Na >140',
                    addDextrose: 'D5 when glucose <200 (prevents hypoglycemia while continuing insulin)'
                },
                insulin: {
                    initial: 'Regular insulin 0.1 U/kg IV bolus',
                    infusion: '0.1 U/kg/h continuous',
                    target: 'Glucose decrease 50-70 mg/dL per hour',
                    adjustment: 'If not dropping, double infusion rate'
                },
                potassium: {
                    check: 'Before starting insulin if possible',
                    ifBelow3_3: 'Hold insulin until K >3.3',
                    if3_3to5_2: 'Add 20-40 mEq KCl to each liter of fluids',
                    ifAbove5_2: 'Recheck in 2 hours, add when <5.2'
                },
                bicarbonate: 'Only if pH <6.9 or life-threatening hyperkalemia'
            },
            
            resolution: ['pH >7.3', 'HCO3 >18', 'Anion gap <12', 'Patient eating'],
            
            transition: 'Overlap SC insulin with IV for 1-2 hours before stopping drip',
            
            sources: ['ADA DKA Guidelines 2024']
        }
    };

    // ═══════════════════════════════════════════════════════════════════════════
    // SMART MATCHING ENGINE
    // ═══════════════════════════════════════════════════════════════════════════

    function findBestMatch(query, patientDiagnosis) {
        const searchText = (query + ' ' + (patientDiagnosis || '')).toLowerCase();
        
        let bestMatch = null;
        let bestScore = 0;
        
        for (const [key, topic] of Object.entries(KNOWLEDGE)) {
            let score = 0;
            
            // Keyword matching with length weighting
            for (const keyword of topic.keywords) {
                const kw = keyword.toLowerCase();
                if (searchText.includes(kw)) {
                    score += kw.length * 2; // Longer keywords = more specific
                }
            }
            
            // Exact key match
            if (searchText.includes(key)) {
                score += 20;
            }
            
            if (score > bestScore) {
                bestScore = score;
                bestMatch = { key, topic, score };
            }
        }
        
        return bestScore >= 4 ? bestMatch : null;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // RESPONSE GENERATOR
    // ═══════════════════════════════════════════════════════════════════════════

    function generateResponse(match, query, patient) {
        const t = match.topic;
        let r = '';
        
        // Header
        r += `## ${t.category}: ${t.keywords[0].charAt(0).toUpperCase() + t.keywords[0].slice(1)}\n\n`;
        
        // Quick Facts
        if (t.quickFacts) {
            r += `### 📌 Key Points\n`;
            for (const [key, val] of Object.entries(t.quickFacts)) {
                if (typeof val === 'object') {
                    r += `**${formatKey(key)}:** ${Object.entries(val).map(([k,v]) => `${k}: ${v}`).join(', ')}\n`;
                } else {
                    r += `**${formatKey(key)}:** ${val}\n`;
                }
            }
            r += '\n';
        }
        
        // Clinical Presentation
        if (t.clinicalPresentation) {
            r += `### 🩺 Clinical Presentation\n`;
            r += formatSection(t.clinicalPresentation);
        }
        
        // Diagnosis
        if (t.diagnosis) {
            r += `### 🔬 Diagnosis\n`;
            r += formatSection(t.diagnosis);
        }
        
        // DDx
        if (t.differentialDiagnosis) {
            r += `### 🔍 Differential Diagnosis\n`;
            t.differentialDiagnosis.forEach(d => {
                r += `• **${d.condition}:** ${d.distinguishing}\n`;
            });
            r += '\n';
        }
        
        // Treatment
        if (t.treatment) {
            r += `### 💊 Treatment\n`;
            r += formatSection(t.treatment);
        }
        
        // Special sections
        if (t.vsSepcticArthritis && query.toLowerCase().includes('vs')) {
            r += `### ⚠️ Gout vs Septic Arthritis\n`;
            r += t.vsSepcticArthritis.critical + '\n\n';
            r += t.vsSepcticArthritis.comparison + '\n\n';
            r += `**Approach:** ${t.vsSepcticArthritis.approach}\n\n`;
        }
        
        if (t.hourOneBunde) {
            r += `### ⏱️ Hour-1 Bundle\n`;
            if (t.hourOneBunde.items) {
                t.hourOneBunde.items.forEach(item => r += `${item}\n`);
            } else {
                t.hourOneBunde.forEach(item => r += `${item}\n`);
            }
            r += '\n';
        }
        
        if (t.TTM) {
            r += `### 🌡️ Targeted Temperature Management\n`;
            r += formatSection(t.TTM);
        }
        
        // Pearls
        if (t.pearlsAndPitfalls) {
            r += `### 💎 Clinical Pearls & Pitfalls\n`;
            t.pearlsAndPitfalls.forEach(p => r += `${p}\n`);
            r += '\n';
        }
        
        // Sources
        if (t.sources) {
            r += `---\n📚 **Sources:** ${t.sources.join(' | ')}\n`;
        }
        
        return r;
    }

    function formatSection(obj, depth = 0) {
        let r = '';
        const indent = '  '.repeat(depth);
        
        for (const [key, val] of Object.entries(obj)) {
            if (Array.isArray(val)) {
                if (val.length > 0 && typeof val[0] === 'object') {
                    r += `${indent}**${formatKey(key)}:**\n`;
                    val.forEach(item => {
                        if (item.drug || item.class) {
                            r += `${indent}• ${item.drug || item.class}`;
                            if (item.dose) r += ` - ${item.dose}`;
                            if (item.notes) r += ` (${item.notes})`;
                            r += '\n';
                        } else if (item.condition) {
                            r += `${indent}• **${item.condition}:** ${item.distinguishing}\n`;
                        } else {
                            r += `${indent}• ${JSON.stringify(item)}\n`;
                        }
                    });
                } else {
                    r += `${indent}**${formatKey(key)}:**\n`;
                    val.forEach(item => r += `${indent}• ${item}\n`);
                }
            } else if (typeof val === 'object' && val !== null) {
                r += `${indent}**${formatKey(key)}:**\n`;
                r += formatSection(val, depth + 1);
            } else {
                r += `${indent}• **${formatKey(key)}:** ${val}\n`;
            }
        }
        
        return r + '\n';
    }

    function formatKey(key) {
        return key
            .replace(/([A-Z])/g, ' $1')
            .replace(/_/g, ' ')
            .replace(/^\w/, c => c.toUpperCase())
            .trim();
    }

    function generateFallback(query, patient) {
        let r = `## 🤔 I'd be happy to help!\n\n`;
        r += `I don't have specific information on "${query}" in my current database, but I can help with many clinical topics.\n\n`;
        
        r += `### 📚 Available Topics:\n\n`;
        r += `**Rheumatology:** Gout, Septic Arthritis\n`;
        r += `**Critical Care:** Sepsis, Post-Cardiac Arrest, DKA\n`;
        r += `**Cardiology:** ACS/MI, Heart Failure, Atrial Fibrillation\n`;
        r += `**Neurology:** Stroke/CVA\n`;
        r += `**Nephrology:** AKI, Hyperkalemia\n\n`;
        
        r += `### 💬 Try asking:\n`;
        r += `• "What are the diagnostic criteria for [condition]?"\n`;
        r += `• "How do I treat [condition]?"\n`;
        r += `• "Gout vs septic arthritis"\n`;
        r += `• "Post arrest management"\n\n`;
        
        if (patient?.diagnosis) {
            r += `---\n💡 Based on this patient's diagnosis (${patient.diagnosis}), you might want to ask about that specifically.\n`;
        }
        
        return r;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // ═══════════════════════════════════════════════════════════════════════════
    // CLAUDE OPUS 4.5 INTEGRATION - GPT-5 LEVEL MEDICAL AI
    // ═══════════════════════════════════════════════════════════════════════════

    const CLAUDE_CONFIG = {
        API_URL: 'https://script.google.com/macros/s/AKfycbz_2zC2ztoesY0XBd7_M9YzddWzRolYjqnjXF3xr_jM0Ry4nDzqoXOpFgQZJRl1zPdU/exec',
        USE_CLAUDE: true,         // Enable Claude Opus 4.5 for advanced reasoning
        USE_FALLBACK: true,       // Fallback to knowledge base if Claude fails
        TIMEOUT: 15000            // 15 second timeout
    };

    async function askClaude(query, patient, labValues = []) {
        try {
            // Build patient context
            let patientContext = '';
            if (patient) {
                patientContext = `Patient: ${patient.name || 'Unknown'}
Age/Sex: ${patient.age || '?'}/${patient.sex || '?'}
Diagnosis: ${patient.diagnosis || 'Not specified'}
Status: ${patient.status || 'Not specified'}`;

                if (patient.plan) {
                    patientContext += `\nCurrent Plan: ${patient.plan}`;
                }
            }

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), CLAUDE_CONFIG.TIMEOUT);

            const response = await fetch(CLAUDE_CONFIG.API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({
                    action: 'claudeConsult',
                    query: query,
                    patientContext: patientContext,
                    labValues: labValues
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            const result = await response.json();

            if (result.error) {
                throw new Error(result.error);
            }

            return {
                success: true,
                text: result.response,
                source: 'claude_opus_4.5',
                model: result.model,
                confidence: 0.95,  // Claude Opus 4.5 is highly reliable
                usage: result.usage
            };

        } catch (err) {
            console.error('[AI Consultant] Claude error:', err);
            return {
                success: false,
                error: err.message
            };
        }
    }

    // PUBLIC API
    // ═══════════════════════════════════════════════════════════════════════════

    const conversations = new Map();

    return {
        version: VERSION,
        codename: CODENAME,
        isReady: true,
        claudeEnabled: CLAUDE_CONFIG.USE_CLAUDE,

        startConsultation(patientId) {
            conversations.set(patientId, []);
            return {
                success: true,
                message: `Welcome! I'm your AI Medical Consultant powered by Claude Opus 4.5 (GPT-5 level). Ask me about diagnoses, treatments, lab interpretation, or clinical decision-making. How can I help?`
            };
        },

        async askQuestion(patientId, query, patient, options = {}) {
            if (!conversations.has(patientId)) {
                conversations.set(patientId, []);
            }

            const conv = conversations.get(patientId);
            conv.push({ role: 'user', content: query, timestamp: Date.now() });

            let responseText;
            let confidence;
            let source = 'knowledge_base';

            // Try Claude Opus 4.5 first for advanced reasoning
            if (CLAUDE_CONFIG.USE_CLAUDE && !options.useKnowledgeBaseOnly) {
                console.log('[AI Consultant] 🚀 Using Claude Opus 4.5 for advanced medical reasoning...');

                const labValues = options.labValues || [];
                const claudeResult = await askClaude(query, patient, labValues);

                if (claudeResult.success) {
                    responseText = claudeResult.text;
                    confidence = claudeResult.confidence;
                    source = 'claude_opus_4.5';
                    console.log('[AI Consultant] ✨ Claude Opus 4.5 response received');
                } else if (CLAUDE_CONFIG.USE_FALLBACK) {
                    console.log('[AI Consultant] ⚠️ Claude failed, using knowledge base fallback');
                    // Fallback to knowledge base
                    const match = findBestMatch(query, patient?.diagnosis);
                    if (match) {
                        responseText = generateResponse(match, query, patient);
                        confidence = Math.min(0.95, 0.7 + (match.score / 30));
                        source = 'knowledge_base';
                    } else {
                        responseText = generateFallback(query, patient);
                        confidence = 0.5;
                        source = 'fallback';
                    }
                } else {
                    responseText = `I'm sorry, I'm unable to process your request at the moment. Error: ${claudeResult.error}`;
                    confidence = 0;
                    source = 'error';
                }
            } else {
                // Use knowledge base directly
                const match = findBestMatch(query, patient?.diagnosis);
                if (match) {
                    responseText = generateResponse(match, query, patient);
                    confidence = Math.min(0.95, 0.7 + (match.score / 30));
                    source = 'knowledge_base';
                } else {
                    responseText = generateFallback(query, patient);
                    confidence = 0.5;
                    source = 'fallback';
                }
            }

            conv.push({ role: 'assistant', content: responseText, timestamp: Date.now(), source: source });

            return {
                success: true,
                response: {
                    text: responseText,
                    confidence: confidence,
                    source: source,
                    sources: source === 'knowledge_base' ? (findBestMatch(query)?.topic?.sources || []) : ['Claude Opus 4.5 AI']
                }
            };
        },

        getHistory(patientId) {
            return conversations.get(patientId) || [];
        },

        clearHistory(patientId) {
            conversations.delete(patientId);
            return { success: true };
        },

        getCapabilities() {
            return {
                topics: Object.keys(KNOWLEDGE),
                count: Object.keys(KNOWLEDGE).length
            };
        },

        getDatabaseInfo() {
            return { version: VERSION, codename: CODENAME, topics: Object.keys(KNOWLEDGE).length, ready: true };
        },

        // Claude Configuration
        enableClaude() {
            CLAUDE_CONFIG.USE_CLAUDE = true;
            console.log('✅ Claude Opus 4.5 enabled (GPT-5 level)');
        },

        disableClaude() {
            CLAUDE_CONFIG.USE_CLAUDE = false;
            console.log('⚠️ Claude Opus 4.5 disabled - using knowledge base only');
        },

        getConfig() {
            return {
                claudeEnabled: CLAUDE_CONFIG.USE_CLAUDE,
                fallbackEnabled: CLAUDE_CONFIG.USE_FALLBACK,
                timeout: CLAUDE_CONFIG.TIMEOUT
            };
        }
    };
})();

// Export
window.AIMedicalConsultant = AIMedicalConsultant;
window.NeuralClinicalIntelligence = AIMedicalConsultant;

console.log(`✅ AI Medical Consultant v${AIMedicalConsultant.version} "${AIMedicalConsultant.codename}" loaded`);
console.log(`🚀 Powered by Claude Opus 4.5 (GPT-5 level) - ${AIMedicalConsultant.getCapabilities().count} clinical topics available`);
