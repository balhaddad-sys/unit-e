/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  AI MEDICAL CONSULTANT v5.0 - HIPPOCRATES                                    ║
 * ║  Human-Like Clinical Intelligence                                             ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

const AIMedicalConsultant = (function() {
    'use strict';

    const VERSION = '5.0.0';
    const CODENAME = 'HIPPOCRATES';

    // ═══════════════════════════════════════════════════════════════════════════
    // COMPREHENSIVE MEDICAL KNOWLEDGE BASE
    // ═══════════════════════════════════════════════════════════════════════════

    const KNOWLEDGE = {
        
        // ─────────────────────────────────────────────────────────────────────────
        // RHEUMATOLOGY / JOINT
        // ─────────────────────────────────────────────────────────────────────────
        
        'gout': {
            title: 'Gout',
            keywords: ['gout', 'gouty', 'uric acid', 'urate', 'podagra', 'tophi'],
            
            overview: `Gout is a crystal arthropathy caused by monosodium urate (MSU) crystal deposition. It's one of the most painful forms of arthritis and classically affects the first MTP joint (podagra).`,
            
            presentation: {
                classic: [
                    'Acute monoarticular arthritis (usually)',
                    'First MTP joint most common (podagra) - 50% of first attacks',
                    'Rapid onset - peaks within 12-24 hours',
                    'Severe pain, swelling, erythema, warmth',
                    'May have low-grade fever'
                ],
                otherJoints: ['Ankle', 'Knee', 'Wrist', 'Fingers', 'Elbow'],
                chronicFeatures: ['Tophi (painless nodules)', 'Chronic gouty arthritis', 'Joint destruction']
            },
            
            diagnosis: {
                goldStandard: 'MSU crystals on joint aspiration - negatively birefringent, needle-shaped under polarized light',
                supportive: [
                    'Elevated serum uric acid (but can be normal during acute attack!)',
                    'Classic clinical presentation',
                    'Response to colchicine within 24-48h',
                    'Dual-energy CT showing urate deposits'
                ],
                labs: ['Serum uric acid', 'BMP (renal function)', 'CBC', 'Joint fluid analysis']
            },
            
            vsSepticArthritis: {
                title: '🔴 Gout vs Septic Arthritis - Critical Distinction!',
                importance: 'MUST rule out septic arthritis - both can look similar!',
                needsArthrocentesis: 'YES - tap the joint if any doubt!',
                comparison: {
                    gout: {
                        crystals: 'MSU crystals present',
                        gramStain: 'Negative',
                        WBC: 'Usually 10,000-50,000',
                        culture: 'Negative'
                    },
                    septic: {
                        crystals: 'Usually absent (can coexist!)',
                        gramStain: 'May be positive',
                        WBC: 'Usually >50,000 (often >100,000)',
                        culture: 'Positive (may take days)'
                    }
                },
                redFlags: [
                    'High fever (>38.5°C)',
                    'Recent joint surgery or injection',
                    'Immunocompromised patient',
                    'Very high synovial WBC (>100,000)',
                    'Bacteremia risk factors'
                ],
                rule: 'When in doubt, treat for BOTH until cultures finalize!'
            },
            
            treatment: {
                acute: {
                    firstLine: [
                        'NSAIDs (indomethacin 50mg TID, naproxen 500mg BID) - if no contraindications',
                        'Colchicine - 1.2mg then 0.6mg 1 hour later (low-dose regimen)',
                        'Steroids - if NSAIDs/colchicine contraindicated (prednisone 30-40mg/day x 5 days)'
                    ],
                    adjuncts: ['Ice', 'Rest joint', 'Hydration'],
                    avoid: 'Do NOT start or change urate-lowering therapy during acute attack'
                },
                chronic: {
                    indication: '≥2 attacks/year, tophi, CKD stage 2+, urolithiasis',
                    medications: [
                        'Allopurinol - start low (100mg), titrate to target uric acid <6 mg/dL',
                        'Febuxostat - alternative if allopurinol intolerant',
                        'Prophylaxis with colchicine 0.6mg daily for 3-6 months when starting ULT'
                    ],
                    target: 'Serum uric acid <6 mg/dL (or <5 if tophi)'
                }
            },
            
            sources: [
                { ref: 'ACR Gout Guidelines 2020', evidence: '1a' },
                { ref: 'EULAR Gout Recommendations 2016', evidence: '1a' }
            ]
        },

        'septic arthritis': {
            title: 'Septic Arthritis',
            keywords: ['septic arthritis', 'septic joint', 'infectious arthritis', 'bacterial arthritis', 'joint infection'],
            
            overview: `Septic arthritis is a medical emergency! Bacterial infection of a joint that can rapidly destroy cartilage. Most commonly caused by S. aureus. Requires urgent diagnosis and treatment.`,
            
            presentation: {
                classic: [
                    'Acute monoarticular arthritis (90%)',
                    'Hot, swollen, extremely painful joint',
                    'Severe pain with ANY movement (passive or active)',
                    'Fever (present in ~60%)',
                    'Patient often looks more "sick" than gout'
                ],
                commonJoints: ['Knee (most common - 50%)', 'Hip', 'Ankle', 'Wrist', 'Shoulder'],
                riskFactors: ['Prior joint disease (RA, OA)', 'Joint prosthesis', 'Recent joint injection/surgery', 'Diabetes', 'Immunosuppression', 'IV drug use', 'Skin infection']
            },
            
            diagnosis: {
                goldStandard: 'Joint aspiration with synovial fluid analysis + culture',
                findings: {
                    appearance: 'Purulent, cloudy',
                    WBC: '>50,000/μL (often >100,000) - predominantly PMNs',
                    gramStain: 'Positive in 50-75%',
                    culture: 'Positive in 70-90%'
                },
                organisms: {
                    mostCommon: 'Staphylococcus aureus (40-50%)',
                    others: ['Streptococci', 'Gram-negative bacilli (elderly, immunocompromised)', 'N. gonorrhoeae (young, sexually active)', 'Pseudomonas (IV drug users)']
                },
                workup: ['Blood cultures (positive in 50%)', 'CBC, CRP, ESR', 'X-ray (baseline, may be normal early)', 'Consider MRI if deep joint (hip)']
            },
            
            treatment: {
                antibiotics: {
                    empiric: 'Vancomycin (MRSA coverage) ± Ceftriaxone (gram-negatives)',
                    duration: '2-4 weeks IV (may transition to oral)',
                    gonococcal: 'Ceftriaxone 1g daily x 7-14 days'
                },
                surgical: {
                    indication: 'Joint drainage is ESSENTIAL',
                    options: ['Serial arthrocentesis', 'Arthroscopic drainage', 'Open surgical drainage'],
                    prostheticJoint: 'Urgent ortho consult - may need prosthesis removal'
                }
            },
            
            prognosis: {
                good: 'Early treatment → good outcomes',
                poor: 'Delayed treatment → joint destruction, sepsis, mortality (10-15%)',
                message: 'Time is cartilage! Treat urgently.'
            },
            
            sources: [
                { ref: 'IDSA Guidelines', evidence: '1a' },
                { ref: 'ACR/AF Septic Arthritis Recommendations', evidence: '2a' }
            ]
        },

        // ─────────────────────────────────────────────────────────────────────────
        // CRITICAL CARE
        // ─────────────────────────────────────────────────────────────────────────

        'post arrest': {
            title: 'Post-Cardiac Arrest Care',
            keywords: ['post arrest', 'post cardiac arrest', 'rosc', 'post resuscitation', 'after cpr'],
            
            overview: `Post-cardiac arrest syndrome is a complex state following ROSC (Return of Spontaneous Circulation). The focus is on preventing secondary brain injury, optimizing hemodynamics, and identifying/treating the underlying cause.`,
            
            priorities: [
                '1. Airway & Oxygenation - SpO2 92-98%, avoid hyperoxia',
                '2. Hemodynamics - MAP ≥65-80 mmHg, treat shock',
                '3. Temperature - Targeted Temperature Management',
                '4. Identify cause - ECG for STEMI → cath lab',
                '5. Prevent seizures and treat if occur',
                '6. Glucose control - target 144-180 mg/dL'
            ],
            
            TTM: {
                indication: 'Comatose patients (not following commands) after ROSC',
                target: '32-36°C for at least 24 hours',
                note: 'TTM2 trial showed 36°C as effective as 33°C',
                rewarming: 'Slow - 0.25-0.5°C per hour',
                avoidFever: 'Aggressive fever control for 72 hours'
            },
            
            coronary: {
                STEMI: 'Immediate coronary angiography (within 2 hours)',
                noSTEMI: 'Consider early angiography (within 24h) if no obvious non-cardiac cause'
            },
            
            prognostication: {
                timing: 'Wait ≥72 hours (longer if TTM/sedation)',
                poorSigns: [
                    'Bilateral absent pupillary reflex at 72h',
                    'Bilateral absent corneal reflex at 72h',
                    'Myoclonus status within 72h',
                    'Absent N20 on SSEP',
                    'Highly malignant EEG',
                    'NSE >60 μg/L'
                ],
                approach: 'Multimodal - no single test is definitive'
            },
            
            sources: [
                { ref: 'AHA Post-Arrest Guidelines 2020', evidence: '1a' },
                { ref: 'TTM2 Trial - NEJM 2021', evidence: '1b' }
            ]
        },

        'sepsis': {
            title: 'Sepsis & Septic Shock',
            keywords: ['sepsis', 'septic shock', 'septicemia', 'severe sepsis', 'systemic infection'],
            
            overview: `Sepsis is life-threatening organ dysfunction caused by a dysregulated host response to infection. Early recognition and rapid treatment are critical - "Time is life!"`,
            
            definition: {
                sepsis: 'Infection + SOFA ≥2',
                septicShock: 'Sepsis + vasopressors to maintain MAP ≥65 + lactate >2 despite adequate fluids',
                qSOFA: 'Screening tool: RR ≥22, GCS <15, SBP ≤100 (≥2 points = high risk)'
            },
            
            hourOneBunde: [
                '🔬 Measure lactate (repeat if >2)',
                '🧫 Blood cultures BEFORE antibiotics',
                '💊 Broad-spectrum antibiotics ASAP',
                '💧 30 mL/kg crystalloid if hypotensive or lactate ≥4',
                '💉 Vasopressors if still hypotensive (target MAP ≥65)'
            ],
            
            antibiotics: {
                principle: 'Broad and early - narrow later',
                examples: {
                    community: 'Ceftriaxone + Azithromycin (or Levofloxacin)',
                    nosocomial: 'Pip-tazo or Meropenem ± Vancomycin',
                    abdominal: 'Pip-tazo or Meropenem (anaerobic coverage)'
                }
            },
            
            fluids: 'Lactated Ringers preferred, 30 mL/kg initial bolus, then reassess',
            
            vasopressors: {
                first: 'Norepinephrine',
                second: 'Add Vasopressin (0.03 U/min)',
                third: 'Epinephrine',
                cardiac: 'Dobutamine if low cardiac output'
            },
            
            sources: [
                { ref: 'Surviving Sepsis Campaign 2021', evidence: '1a' }
            ]
        },

        // ─────────────────────────────────────────────────────────────────────────
        // NEUROLOGY
        // ─────────────────────────────────────────────────────────────────────────

        'stroke': {
            title: 'Stroke / CVA',
            keywords: ['stroke', 'cva', 'cerebrovascular', 'brain attack', 'ischemic stroke', 'hemorrhagic stroke', 'tpa', 'thrombolysis'],
            
            overview: `Stroke is a medical emergency - "Time is brain!" Every minute without treatment, ~1.9 million neurons are lost. Rapid assessment and treatment are critical.`,
            
            types: {
                ischemic: '87% - blocked vessel',
                hemorrhagic: '13% - bleeding (ICH or SAH)'
            },
            
            assessment: {
                FAST: 'Face drooping, Arm weakness, Speech difficulty, Time to call 911',
                NIHSS: 'Standardized stroke severity scale (0-42)'
            },
            
            acuteManagement: {
                imaging: 'CT head STAT (rule out hemorrhage)',
                tPA: {
                    window: '≤4.5 hours from symptom onset',
                    dose: '0.9 mg/kg (max 90mg), 10% bolus',
                    BP: 'Must be <185/110 before, <180/105 after'
                },
                thrombectomy: {
                    window: 'Up to 24 hours with favorable imaging',
                    indication: 'Large vessel occlusion (ICA, M1, basilar)'
                }
            },
            
            secondaryPrevention: ['Antiplatelet or anticoagulation', 'Statin', 'BP control <130/80', 'Lifestyle modification'],
            
            sources: [
                { ref: 'AHA/ASA Stroke Guidelines 2019', evidence: '1a' }
            ]
        },

        // ─────────────────────────────────────────────────────────────────────────
        // CARDIOLOGY
        // ─────────────────────────────────────────────────────────────────────────

        'acs': {
            title: 'Acute Coronary Syndrome',
            keywords: ['acs', 'mi', 'myocardial infarction', 'heart attack', 'stemi', 'nstemi', 'unstable angina', 'chest pain cardiac'],
            
            overview: `ACS represents a spectrum from unstable angina to STEMI. Key is rapid identification - get an ECG within 10 minutes of arrival!`,
            
            types: {
                STEMI: 'ST elevation - needs immediate reperfusion',
                NSTEMI: 'Troponin positive, no ST elevation',
                unstableAngina: 'Ischemic symptoms, troponin negative'
            },
            
            treatment: {
                immediate: [
                    'Aspirin 325mg (chew)',
                    'P2Y12 inhibitor (ticagrelor or clopidogrel)',
                    'Anticoagulation (heparin)',
                    'Beta-blocker if no contraindication',
                    'Nitrates for ongoing pain'
                ],
                STEMI: 'Primary PCI within 90 minutes (door-to-balloon)',
                NSTEMI: 'Risk stratify → early invasive vs conservative'
            },
            
            sources: [
                { ref: 'ACC/AHA STEMI/NSTEMI Guidelines', evidence: '1a' }
            ]
        },

        'heart failure': {
            title: 'Heart Failure',
            keywords: ['heart failure', 'chf', 'hf', 'congestive', 'hfref', 'hfpef', 'ef reduced'],
            
            overview: `Heart failure is a clinical syndrome of reduced cardiac output or elevated filling pressures. Treatment has revolutionized with the "four pillars" of GDMT for HFrEF.`,
            
            classification: {
                HFrEF: 'EF ≤40%',
                HFmrEF: 'EF 41-49%',
                HFpEF: 'EF ≥50%'
            },
            
            GDMT: {
                fourPillars: [
                    '1. ACEi/ARB/ARNI',
                    '2. Beta-blocker (carvedilol, metoprolol succinate, bisoprolol)',
                    '3. MRA (spironolactone, eplerenone)',
                    '4. SGLT2i (dapagliflozin, empagliflozin)'
                ],
                goal: 'Get patients on all 4 at target doses!'
            },
            
            acuteDecompensated: ['IV diuretics', 'Oxygen if hypoxic', 'Vasodilators', 'Inotropes if cardiogenic shock'],
            
            sources: [
                { ref: 'ACC/AHA HF Guidelines 2022', evidence: '1a' }
            ]
        },

        'atrial fibrillation': {
            title: 'Atrial Fibrillation',
            keywords: ['afib', 'atrial fibrillation', 'af', 'a-fib', 'irregular heartbeat'],
            
            overview: `AF is the most common sustained arrhythmia. Key decisions: Rate vs rhythm control, and anticoagulation for stroke prevention.`,
            
            strokeRisk: {
                score: 'CHA₂DS₂-VASc',
                anticoag: 'Score ≥2 (men) or ≥3 (women) → anticoagulation'
            },
            
            rateControl: {
                target: '<110 bpm at rest',
                agents: ['Beta-blocker', 'Diltiazem/Verapamil', 'Digoxin']
            },
            
            rhythmControl: {
                agents: ['Amiodarone', 'Flecainide', 'Propafenone', 'Sotalol'],
                ablation: 'Consider if symptomatic despite meds'
            },
            
            sources: [
                { ref: 'ACC/AHA AF Guidelines 2023', evidence: '1a' }
            ]
        },

        // ─────────────────────────────────────────────────────────────────────────
        // NEPHROLOGY
        // ─────────────────────────────────────────────────────────────────────────

        'aki': {
            title: 'Acute Kidney Injury',
            keywords: ['aki', 'acute kidney injury', 'acute renal failure', 'arf', 'creatinine elevated'],
            
            overview: `AKI is an abrupt decline in kidney function. Identify the cause (prerenal, intrinsic, postrenal), treat reversible factors, and protect from further injury.`,
            
            diagnosis: {
                KDIGO: [
                    'Cr ≥0.3 increase in 48h, OR',
                    'Cr ≥1.5x baseline in 7 days, OR',
                    'UOP <0.5 mL/kg/h for 6 hours'
                ]
            },
            
            causes: {
                prerenal: 'Hypovolemia, CHF, sepsis (FENa <1%)',
                intrinsic: 'ATN, AIN, GN (FENa >2%)',
                postrenal: 'Obstruction → get ultrasound'
            },
            
            management: [
                'Treat underlying cause',
                'Optimize volume status',
                'Stop nephrotoxins',
                'Adjust drug dosing'
            ],
            
            dialysisIndications: 'AEIOU: Acidosis, Electrolytes (K+), Intoxication, Overload, Uremia',
            
            sources: [
                { ref: 'KDIGO AKI Guidelines', evidence: '1a' }
            ]
        },

        'hyperkalemia': {
            title: 'Hyperkalemia',
            keywords: ['hyperkalemia', 'high potassium', 'elevated potassium', 'k high'],
            
            overview: `Hyperkalemia can be life-threatening due to cardiac arrhythmias. Check the ECG immediately and treat based on severity and ECG changes.`,
            
            ECGchanges: ['Peaked T waves (early)', 'Prolonged PR', 'Wide QRS', 'Sine wave (imminent arrest)'],
            
            treatment: {
                stabilize: 'Calcium gluconate 1-2g IV (if ECG changes)',
                shift: ['Insulin 10U + D50', 'Albuterol nebulizer', 'Bicarb (if acidotic)'],
                eliminate: ['Diuretics', 'Kayexalate/Lokelma', 'Dialysis']
            },
            
            sources: [
                { ref: 'AHA Hyperkalemia Guidelines', evidence: '2a' }
            ]
        },

        'hyponatremia': {
            title: 'Hyponatremia',
            keywords: ['hyponatremia', 'low sodium', 'sodium low', 'na low'],
            
            overview: `Hyponatremia is the most common electrolyte disorder. Approach by volume status: hypovolemic, euvolemic (SIADH), or hypervolemic.`,
            
            correction: {
                chronic: 'Slow! Max 8-10 mEq/L per 24h to avoid ODS',
                acuteSymptomatic: '3% saline 100-150mL boluses for seizures/severe symptoms'
            },
            
            sources: [
                { ref: 'European Hyponatremia Guidelines', evidence: '1a' }
            ]
        },

        // ─────────────────────────────────────────────────────────────────────────
        // PULMONOLOGY
        // ─────────────────────────────────────────────────────────────────────────

        'pe': {
            title: 'Pulmonary Embolism',
            keywords: ['pe', 'pulmonary embolism', 'pulmonary embolus', 'dvt', 'vte'],
            
            overview: `PE can be life-threatening. Use Wells score to risk stratify, then D-dimer or CT angiography accordingly.`,
            
            diagnosis: {
                Wells: '≤4 = unlikely (D-dimer), >4 = likely (CTPA)',
                PERC: 'If ALL 8 negative + low suspicion → stop workup'
            },
            
            treatment: {
                anticoagulation: 'DOACs preferred (rivaroxaban, apixaban)',
                thrombolysis: 'Massive PE with hemodynamic instability',
                duration: '3 months minimum; longer if unprovoked'
            },
            
            sources: [
                { ref: 'ESC PE Guidelines 2019', evidence: '1a' }
            ]
        },

        'pneumonia': {
            title: 'Pneumonia',
            keywords: ['pneumonia', 'pna', 'cap', 'lung infection', 'community acquired pneumonia'],
            
            overview: `Pneumonia is infection of the lung parenchyma. Severity assessment guides disposition and antibiotic choice.`,
            
            treatment: {
                outpatient: 'Amoxicillin OR Doxycycline OR Macrolide',
                inpatient: 'Beta-lactam + Macrolide OR Respiratory FQ',
                ICU: 'Beta-lactam + Macrolide + consider MRSA/Pseudomonas coverage'
            },
            
            sources: [
                { ref: 'ATS/IDSA CAP Guidelines 2019', evidence: '1a' }
            ]
        },

        // ─────────────────────────────────────────────────────────────────────────
        // ENDOCRINOLOGY
        // ─────────────────────────────────────────────────────────────────────────

        'dka': {
            title: 'Diabetic Ketoacidosis',
            keywords: ['dka', 'diabetic ketoacidosis', 'ketoacidosis'],
            
            overview: `DKA is a metabolic emergency with hyperglycemia, ketosis, and acidosis. The three pillars of treatment: fluids, insulin, and potassium.`,
            
            criteria: ['Glucose >250', 'pH <7.3 or HCO3 <18', 'Ketones positive', 'Anion gap elevated'],
            
            treatment: {
                fluids: 'NS 1-1.5L first hour, then adjust based on Na',
                insulin: '0.1 U/kg bolus then 0.1 U/kg/hr infusion',
                potassium: 'Add to fluids when K <5.2 (before starting insulin if K <3.3)',
                dextrose: 'Add D5 when glucose <200'
            },
            
            resolution: 'pH >7.3, HCO3 >18, AG <12, glucose <200',
            
            sources: [
                { ref: 'ADA DKA Guidelines', evidence: '1a' }
            ]
        },

        // ─────────────────────────────────────────────────────────────────────────
        // INFECTIOUS DISEASE
        // ─────────────────────────────────────────────────────────────────────────

        'meningitis': {
            title: 'Meningitis',
            keywords: ['meningitis', 'meningeal', 'bacterial meningitis'],
            
            overview: `Bacterial meningitis is a medical emergency. Don't delay antibiotics for LP if patient is unstable!`,
            
            empiric: {
                adult: 'Vancomycin + Ceftriaxone + Dexamethasone',
                elderly: 'Add Ampicillin (for Listeria)'
            },
            
            dexamethasone: 'Give before or with first antibiotic dose',
            
            sources: [
                { ref: 'IDSA Meningitis Guidelines', evidence: '1a' }
            ]
        },

        'uti': {
            title: 'Urinary Tract Infection',
            keywords: ['uti', 'urinary tract infection', 'cystitis', 'pyelonephritis', 'urosepsis'],
            
            overview: `UTIs range from simple cystitis to complicated pyelonephritis and urosepsis. Treatment depends on severity and patient factors.`,
            
            treatment: {
                cystitis: 'Nitrofurantoin 5d OR TMP-SMX 3d OR Fosfomycin single dose',
                pyelo: 'Fluoroquinolone 5-7d OR Ceftriaxone',
                urosepsis: 'Broad-spectrum + sepsis management'
            },
            
            sources: [
                { ref: 'IDSA UTI Guidelines', evidence: '1a' }
            ]
        }
    };

    // ═══════════════════════════════════════════════════════════════════════════
    // SMART TOPIC MATCHING
    // ═══════════════════════════════════════════════════════════════════════════

    function findBestMatch(query, patientDiagnosis) {
        const q = (query + ' ' + (patientDiagnosis || '')).toLowerCase();
        
        let bestMatch = null;
        let bestScore = 0;
        
        for (const [key, topic] of Object.entries(KNOWLEDGE)) {
            let score = 0;
            
            // Check keywords
            for (const keyword of topic.keywords) {
                if (q.includes(keyword.toLowerCase())) {
                    score += keyword.length; // Longer matches score higher
                }
            }
            
            // Check title
            if (q.includes(topic.title.toLowerCase())) {
                score += 10;
            }
            
            if (score > bestScore) {
                bestScore = score;
                bestMatch = { key, topic, score };
            }
        }
        
        // Return match only if score is meaningful
        return bestScore >= 3 ? bestMatch : null;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // HUMAN-LIKE RESPONSE GENERATOR
    // ═══════════════════════════════════════════════════════════════════════════

    function generateHumanResponse(topic, query, patient) {
        const t = topic.topic;
        let response = '';
        
        // Greeting based on context
        const greetings = [
            `Great question! Let me walk you through **${t.title}**.`,
            `Absolutely, here's what you need to know about **${t.title}**.`,
            `Good thinking to ask about this. **${t.title}** is important.`,
            `Let me break down **${t.title}** for you.`
        ];
        response += greetings[Math.floor(Math.random() * greetings.length)] + '\n\n';
        
        // Overview
        if (t.overview) {
            response += `${t.overview}\n\n`;
        }
        
        // Check for comparison queries (gout vs septic)
        if (query.toLowerCase().includes(' vs ') || query.toLowerCase().includes('versus') || query.toLowerCase().includes('differentiate')) {
            if (t.vsSepticArthritis) {
                response += `---\n\n### ${t.vsSepticArthritis.title}\n\n`;
                response += `⚠️ **${t.vsSepticArthritis.importance}**\n\n`;
                response += `**${t.vsSepticArthritis.needsArthrocentesis}** - always tap the joint!\n\n`;
                
                response += `| Feature | Gout | Septic Arthritis |\n`;
                response += `|---------|------|------------------|\n`;
                response += `| Crystals | ${t.vsSepticArthritis.comparison.gout.crystals} | ${t.vsSepticArthritis.comparison.septic.crystals} |\n`;
                response += `| Gram stain | ${t.vsSepticArthritis.comparison.gout.gramStain} | ${t.vsSepticArthritis.comparison.septic.gramStain} |\n`;
                response += `| WBC count | ${t.vsSepticArthritis.comparison.gout.WBC} | ${t.vsSepticArthritis.comparison.septic.WBC} |\n`;
                response += `| Culture | ${t.vsSepticArthritis.comparison.gout.culture} | ${t.vsSepticArthritis.comparison.septic.culture} |\n\n`;
                
                response += `**🚨 Red Flags for Septic:**\n`;
                t.vsSepticArthritis.redFlags.forEach(flag => {
                    response += `• ${flag}\n`;
                });
                response += `\n**Golden Rule:** ${t.vsSepticArthritis.rule}\n\n`;
            }
        }
        
        // Key priorities/bundle if exists
        if (t.priorities) {
            response += `### ⚡ Priorities\n`;
            t.priorities.forEach(p => response += `${p}\n`);
            response += '\n';
        }
        
        if (t.hourOneBunde) {
            response += `### ⏱️ Hour-1 Bundle\n`;
            t.hourOneBunde.forEach(item => response += `${item}\n`);
            response += '\n';
        }
        
        // Diagnosis section
        if (t.diagnosis) {
            response += `### 📋 Diagnosis\n`;
            if (t.diagnosis.goldStandard) {
                response += `**Gold Standard:** ${t.diagnosis.goldStandard}\n\n`;
            }
            if (t.diagnosis.KDIGO) {
                response += `**KDIGO Criteria:**\n`;
                t.diagnosis.KDIGO.forEach(c => response += `• ${c}\n`);
                response += '\n';
            }
        }
        
        // Treatment section
        if (t.treatment) {
            response += `### 💊 Treatment\n`;
            formatTreatment(t.treatment, (text) => response += text);
        }
        
        // Add encouraging closer
        const closers = [
            `\n---\n💡 **Remember:** The key with ${t.title.toLowerCase()} is early recognition and prompt treatment!`,
            `\n---\n🎯 **Clinical Pearl:** Don't forget the basics - history and physical exam are your best tools!`,
            `\n---\n✅ **You've got this!** Let me know if you want me to elaborate on any specific aspect.`
        ];
        response += closers[Math.floor(Math.random() * closers.length)];
        
        return response;
    }

    function formatTreatment(treatment, append) {
        for (const [key, value] of Object.entries(treatment)) {
            if (Array.isArray(value)) {
                append(`**${formatKey(key)}:**\n`);
                value.forEach(item => append(`• ${item}\n`));
                append('\n');
            } else if (typeof value === 'object') {
                append(`**${formatKey(key)}:**\n`);
                for (const [k, v] of Object.entries(value)) {
                    if (Array.isArray(v)) {
                        append(`*${formatKey(k)}:*\n`);
                        v.forEach(item => append(`  • ${item}\n`));
                    } else if (typeof v === 'string') {
                        append(`• ${formatKey(k)}: ${v}\n`);
                    }
                }
                append('\n');
            } else {
                append(`• **${formatKey(key)}:** ${value}\n`);
            }
        }
    }

    function formatKey(key) {
        return key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase());
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // FALLBACK RESPONSE
    // ═══════════════════════════════════════════════════════════════════════════

    function generateFallbackResponse(query, patient) {
        let response = `## 🤔 I'd love to help!\n\n`;
        response += `I'm not sure I have specific information on "${query}" in my current knowledge base, but I can definitely help with many clinical topics!\n\n`;
        
        response += `### 📚 Topics I Know Well:\n\n`;
        response += `**Critical Care:** Sepsis, Post-Arrest Care, Cardiac Arrest\n`;
        response += `**Cardiology:** ACS/MI, Heart Failure, Atrial Fibrillation\n`;
        response += `**Neurology:** Stroke/CVA, TIA\n`;
        response += `**Nephrology:** AKI, Hyperkalemia, Hyponatremia\n`;
        response += `**Pulmonology:** PE, Pneumonia\n`;
        response += `**Rheumatology:** Gout, Septic Arthritis\n`;
        response += `**ID:** Meningitis, UTI/Urosepsis\n`;
        response += `**Endocrine:** DKA\n\n`;
        
        response += `### 💬 Try asking:\n`;
        response += `• "How do I treat sepsis?"\n`;
        response += `• "What's the difference between gout and septic arthritis?"\n`;
        response += `• "Walk me through DKA management"\n`;
        response += `• "What are the diagnostic criteria for AKI?"\n\n`;
        
        response += `---\n🤝 I'm here to help you work through clinical problems - just ask!`;
        
        return response;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // CONVERSATION MANAGER
    // ═══════════════════════════════════════════════════════════════════════════

    const conversations = new Map();

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
                message: `Hey! I'm your AI Medical Consultant (${CODENAME} v${VERSION}). Ask me anything about your patient - diagnostics, treatment, differentials. I'm here to help! 🩺`
            };
        },

        askQuestion(patientId, query, patient) {
            // Store in conversation
            if (!conversations.has(patientId)) {
                conversations.set(patientId, []);
            }
            const conv = conversations.get(patientId);
            conv.push({ role: 'user', content: query, timestamp: Date.now() });
            
            // Find matching topic
            const match = findBestMatch(query, patient?.diagnosis);
            
            let responseText;
            let confidence;
            
            if (match) {
                responseText = generateHumanResponse(match, query, patient);
                confidence = Math.min(0.95, 0.7 + (match.score / 20));
            } else {
                responseText = generateFallbackResponse(query, patient);
                confidence = 0.5;
            }
            
            conv.push({ role: 'assistant', content: responseText, timestamp: Date.now() });
            
            return {
                success: true,
                response: {
                    text: responseText,
                    confidence: confidence,
                    sources: match ? (match.topic.sources || []).map(s => s.ref) : []
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
            return {
                version: VERSION,
                codename: CODENAME,
                topics: Object.keys(KNOWLEDGE).length,
                ready: true
            };
        }
    };
})();

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════

window.AIMedicalConsultant = AIMedicalConsultant;
window.NeuralClinicalIntelligence = AIMedicalConsultant;

console.log(`✅ AI Medical Consultant v${AIMedicalConsultant.version} "${AIMedicalConsultant.codename}" loaded`);
console.log(`📚 ${AIMedicalConsultant.getCapabilities().count} clinical topics available`);
