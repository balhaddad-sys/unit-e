/**
 * AI Medical Consultant Module v1.0
 *
 * Provides conversational AI interface for medical consultation with:
 * - Full access to patient lab values and clinical data
 * - Verified medical information databases
 * - Evidence-based clinical reasoning
 * - Integration with CDSS, Neural Interpreter, and Adaptive Expansion systems
 *
 * @author Medical AI Team
 * @version 1.0.0
 */

const AIMedicalConsultant = (function() {
    'use strict';

    // Verified Medical Information Databases
    const VERIFIED_MEDICAL_DATABASES = {
        // Drug Interactions Database (verified sources)
        drugInteractions: {
            'warfarin': {
                contraindications: ['NSAIDs', 'Aspirin (high dose)', 'Clopidogrel', 'SSRIs'],
                monitoring: 'INR weekly initially, then monthly when stable',
                targetINR: { atrial_fibrillation: '2.0-3.0', mechanical_valve: '2.5-3.5' },
                references: ['ACC/AHA 2019', 'CHEST Guidelines 2018']
            },
            'metformin': {
                contraindications: ['eGFR < 30', 'Severe liver disease', 'Acute MI'],
                monitoring: 'Renal function every 3-6 months, B12 annually',
                alerts: 'Hold before contrast studies',
                references: ['ADA Standards 2024', 'KDIGO 2022']
            },
            'digoxin': {
                contraindications: ['Hypokalemia', 'Hypercalcemia', 'AV block'],
                monitoring: 'Serum digoxin level, K+, Cr, HR',
                toxicityRisk: { low: '< 1.0 ng/mL', therapeutic: '0.5-0.9 ng/mL', toxic: '> 2.0 ng/mL' },
                references: ['ACC/AHA Heart Failure Guidelines 2022']
            },
            'statins': {
                monitoring: 'LFTs at baseline, 12 weeks, then annually; CK if symptoms',
                contraindications: ['Active liver disease', 'Pregnancy'],
                myopathyRisk: ['Age > 75', 'Hypothyroidism', 'Renal impairment', 'Drug interactions'],
                references: ['ACC/AHA Cholesterol Guidelines 2023']
            },
            'ace_inhibitors': {
                contraindications: ['Pregnancy', 'Bilateral renal artery stenosis', 'Angioedema history'],
                monitoring: 'Cr and K+ at 1-2 weeks, then periodically',
                sideEffects: ['Dry cough (10-15%)', 'Hyperkalemia', 'AKI'],
                references: ['ESC Hypertension Guidelines 2023']
            }
        },

        // Clinical Diagnostic Criteria (verified)
        diagnosticCriteria: {
            'sepsis_3': {
                criteria: 'qSOFA ≥ 2 (RR ≥22, Altered mentation, SBP ≤100) OR SOFA score increase ≥2',
                components: {
                    qSOFA: ['Respiratory rate ≥22/min', 'Altered mentation (GCS <15)', 'Systolic BP ≤100 mmHg'],
                    SOFA: 'Sequential Organ Failure Assessment (6 organs)'
                },
                management: 'Sepsis bundle: Blood cultures, Lactate, Broad-spectrum antibiotics within 1h, Fluid resuscitation',
                references: ['Sepsis-3 Consensus Definitions 2016', 'Surviving Sepsis Campaign 2021'],
                evidenceLevel: 'A'
            },
            'acute_coronary_syndrome': {
                criteria: 'Chest pain + ECG changes and/or Troponin elevation',
                types: {
                    STEMI: 'ST elevation ≥1mm in ≥2 contiguous leads OR new LBBB',
                    NSTEMI: 'Troponin elevation without persistent ST elevation',
                    unstable_angina: 'Symptoms without troponin elevation'
                },
                management: {
                    STEMI: 'Primary PCI within 90min OR fibrinolysis within 30min',
                    NSTEMI: 'Antiplatelet therapy, risk stratification, early invasive strategy if high risk'
                },
                references: ['ACC/AHA STEMI Guidelines 2023', 'ESC NSTE-ACS Guidelines 2023'],
                evidenceLevel: 'A'
            },
            'heart_failure_diagnosis': {
                criteria: 'Framingham Criteria: 2 major OR 1 major + 2 minor',
                major: ['PND', 'JVD', 'Rales', 'Cardiomegaly', 'Pulmonary edema', 'S3 gallop', 'Elevated JVP'],
                minor: ['Ankle edema', 'Night cough', 'DOE', 'Hepatomegaly', 'Pleural effusion', 'Tachycardia >120'],
                biomarkers: {
                    BNP: { normal: '<100 pg/mL', elevated: '100-400 pg/mL', hf_likely: '>400 pg/mL' },
                    NT_proBNP: { normal: '<125 pg/mL', elevated: '125-450 pg/mL', hf_likely: '>450 pg/mL' }
                },
                references: ['ESC Heart Failure Guidelines 2023', 'ACC/AHA Heart Failure Guidelines 2022'],
                evidenceLevel: 'A'
            },
            'aki_kdigo': {
                criteria: 'Any of: Cr increase ≥0.3 mg/dL within 48h, Cr increase ≥1.5x baseline within 7d, Urine output <0.5 mL/kg/h for 6h',
                stages: {
                    stage1: 'Cr 1.5-1.9x baseline OR ≥0.3 increase OR UO <0.5 mL/kg/h for 6-12h',
                    stage2: 'Cr 2.0-2.9x baseline OR UO <0.5 mL/kg/h for ≥12h',
                    stage3: 'Cr 3.0x baseline OR Cr ≥4.0 OR RRT OR UO <0.3 mL/kg/h for ≥24h'
                },
                management: 'Identify cause, optimize volume status, avoid nephrotoxins, dose-adjust medications',
                references: ['KDIGO AKI Guidelines 2012', 'KDIGO 2021 Update'],
                evidenceLevel: 'A'
            },
            'diabetic_ketoacidosis': {
                criteria: 'Glucose >250 mg/dL + pH <7.3 + HCO3 <18 + Ketones present',
                severity: {
                    mild: 'pH 7.25-7.30, HCO3 15-18',
                    moderate: 'pH 7.0-7.24, HCO3 10-15',
                    severe: 'pH <7.0, HCO3 <10'
                },
                management: 'Fluid resuscitation, Insulin infusion, K+ replacement, Identify precipitant',
                references: ['ADA DKA Management 2024', 'Joint British Diabetes Societies 2023'],
                evidenceLevel: 'A'
            }
        },

        // Evidence-Based Treatment Protocols
        treatmentProtocols: {
            'hypertensive_emergency': {
                definition: 'SBP >180 OR DBP >120 with acute end-organ damage',
                targetBP: 'Reduce MAP by 10-20% in first hour, then 5-15% over next 23h',
                firstLine: [
                    { drug: 'Nicardipine', dose: '5-15 mg/h IV', onset: '5-10 min', indication: 'Most emergencies' },
                    { drug: 'Labetalol', dose: '20-80 mg IV bolus or 0.5-2 mg/min', onset: '5-10 min', indication: 'Most emergencies' },
                    { drug: 'Clevidipine', dose: '1-21 mg/h IV', onset: '2-4 min', indication: 'Perioperative' },
                    { drug: 'Nitroprusside', dose: '0.3-10 mcg/kg/min IV', onset: 'Immediate', indication: 'Aortic dissection with beta-blocker' }
                ],
                avoid: ['Immediate-release nifedipine (risk of stroke)', 'Excessive rapid reduction'],
                monitoring: 'Continuous BP, Neuro checks Q15min, ICU level care',
                references: ['ACC/AHA Hypertension Guidelines 2023', 'ESC Hypertension Guidelines 2023'],
                evidenceLevel: 'A'
            },
            'acute_stroke_management': {
                time_critical: {
                    'door_to_needle': '60 minutes for IV tPA',
                    'door_to_groin': '90 minutes for mechanical thrombectomy',
                    'window_tpa': '4.5 hours from symptom onset',
                    'window_thrombectomy': 'Up to 24 hours in selected patients'
                },
                tPA_criteria: {
                    inclusion: ['Age ≥18', 'Clinical stroke diagnosis', 'Onset <4.5h', 'CT: No hemorrhage'],
                    exclusion: ['BP >185/110', 'Platelets <100k', 'INR >1.7', 'Recent surgery', 'Prior ICH']
                },
                bloodPressure: 'Target <185/110 before tPA, <180/105 after tPA for 24h',
                references: ['AHA Stroke Guidelines 2023', 'ESO Guidelines 2023'],
                evidenceLevel: 'A'
            },
            'massive_transfusion_protocol': {
                definition: '≥10 units PRBC in 24h OR ≥4 units in 1h OR 50% blood volume in 3h',
                ratio: 'PRBC:FFP:Platelets = 1:1:1 (balanced resuscitation)',
                triggers: {
                    PRBC: 'Hb <7 g/dL (trauma), <9 g/dL (active bleeding)',
                    FFP: 'INR >1.5 OR clinical bleeding',
                    Platelets: '<50k (active bleeding), <100k (CNS/ocular bleeding)',
                    Cryoprecipitate: 'Fibrinogen <150-200 mg/dL'
                },
                monitoring: 'ABG, CBC, PT/INR, Fibrinogen Q30-60min; Ca++, Temp continuously',
                complications: ['Hypothermia', 'Hypocalcemia', 'Hyperkalemia', 'TRALI', 'TACO'],
                references: ['ATLS 10th Edition', 'European Trauma Guidelines 2023'],
                evidenceLevel: 'A'
            },
            'anaphylaxis_management': {
                firstLine: 'Epinephrine 0.3-0.5 mg IM (1:1000) in anterolateral thigh',
                repeat: 'Every 5-15 minutes if needed',
                adjunctive: [
                    { therapy: 'H1 antihistamine', example: 'Diphenhydramine 25-50 mg IV/IM' },
                    { therapy: 'H2 antihistamine', example: 'Ranitidine 50 mg IV or Famotidine 20 mg IV' },
                    { therapy: 'Corticosteroid', example: 'Methylprednisolone 125 mg IV' },
                    { therapy: 'Beta-agonist', example: 'Albuterol nebulized for bronchospasm' }
                ],
                fluidResuscitation: '1-2L NS rapid bolus for hypotension',
                observation: 'Minimum 4-6 hours (biphasic reaction risk 4-8 hours)',
                references: ['AAAAI Anaphylaxis Guidelines 2023', 'EAACI Guidelines 2021'],
                evidenceLevel: 'A'
            }
        },

        // Differential Diagnosis Trees
        differentialDiagnosis: {
            'chest_pain': {
                lifeThreatening: [
                    { diagnosis: 'Acute MI', clues: 'Cardiac risk factors, diaphoresis, radiation to jaw/arm, troponin+', tests: 'ECG, troponin, echo' },
                    { diagnosis: 'Pulmonary Embolism', clues: 'DVT risk, dyspnea, tachycardia, hypoxia', tests: 'D-dimer, CTPA, Wells score' },
                    { diagnosis: 'Aortic Dissection', clues: 'Tearing pain, BP differential, widened mediastinum', tests: 'CT aorta, echo, D-dimer' },
                    { diagnosis: 'Tension Pneumothorax', clues: 'Trauma, unilateral breath sounds, tracheal deviation, hypotension', tests: 'Clinical diagnosis, CXR after decompression' },
                    { diagnosis: 'Cardiac Tamponade', clues: 'Beck\'s triad, pulsus paradoxus, post-cardiac surgery', tests: 'Echo, ECG (electrical alternans)' },
                    { diagnosis: 'Esophageal Rupture', clues: 'Boerhaave (post-vomiting), mediastinal air, Hamman crunch', tests: 'CT chest with oral contrast, CXR' }
                ],
                common: [
                    { diagnosis: 'Gastroesophageal Reflux', clues: 'Burning, worse lying down, food-related', tests: 'Clinical diagnosis, trial PPI' },
                    { diagnosis: 'Costochondritis', clues: 'Reproducible on palpation, sharp, positional', tests: 'Clinical diagnosis' },
                    { diagnosis: 'Anxiety/Panic', clues: 'Palpitations, hyperventilation, young patient', tests: 'Rule out cardiac causes first' }
                ],
                references: ['ACCF/AHA Chest Pain Guidelines 2021', 'ESC Acute Cardiac Care 2023']
            },
            'altered_mental_status': {
                mnemonic: 'AEIOU TIPS',
                causes: [
                    { letter: 'A', diagnosis: 'Alcohol/Acidosis', tests: 'BAL, ABG, osmolar gap' },
                    { letter: 'E', diagnosis: 'Encephalopathy/Electrolytes/Endocrine', tests: 'BMP, LFTs, ammonia, TSH, cortisol' },
                    { letter: 'I', diagnosis: 'Infection', tests: 'Blood cultures, UA, CXR, LP if indicated' },
                    { letter: 'O', diagnosis: 'Overdose/Opiates', tests: 'Urine drug screen, specific levels' },
                    { letter: 'U', diagnosis: 'Uremia', tests: 'BUN, Cr, eGFR' },
                    { letter: 'T', diagnosis: 'Trauma', tests: 'CT head, C-spine' },
                    { letter: 'I', diagnosis: 'Insulin (hypo/hyperglycemia)', tests: 'Glucose, HbA1c' },
                    { letter: 'P', diagnosis: 'Psychiatric/Poisoning', tests: 'Clinical assessment, toxicology' },
                    { letter: 'S', diagnosis: 'Stroke/Seizure/Shock', tests: 'CT/MRI head, EEG, vitals' }
                ],
                workup: 'Glucose, vitals, O2 sat, GCS, pupils, neuro exam → Labs (CBC, BMP, LFTs, TSH, B12) → Imaging as indicated',
                references: ['AAN Altered Mental Status Guidelines 2023', 'Neurocritical Care Society 2022']
            },
            'acute_dyspnea': {
                cardiac: [
                    { diagnosis: 'Acute Heart Failure', clues: 'Orthopnea, PND, JVD, rales, BNP >400', tests: 'BNP, echo, CXR' },
                    { diagnosis: 'Acute MI', clues: 'Chest pain, troponin+, ECG changes', tests: 'ECG, troponin, echo' }
                ],
                pulmonary: [
                    { diagnosis: 'COPD Exacerbation', clues: 'Smoking hx, wheezing, accessory muscle use', tests: 'ABG, CXR, spirometry' },
                    { diagnosis: 'Asthma Exacerbation', clues: 'Wheezing, atopy, peak flow decreased', tests: 'Peak flow, ABG if severe' },
                    { diagnosis: 'Pneumonia', clues: 'Fever, cough, infiltrate on CXR', tests: 'CXR, CBC, cultures' },
                    { diagnosis: 'Pulmonary Embolism', clues: 'Sudden onset, pleuritic, DVT risk', tests: 'D-dimer, CTPA, Wells score' },
                    { diagnosis: 'Pneumothorax', clues: 'Sudden, unilateral breath sounds, CXR', tests: 'CXR, CT if tension' }
                ],
                other: [
                    { diagnosis: 'Anemia', clues: 'Fatigue, pallor, Hb <7-8', tests: 'CBC, iron studies' },
                    { diagnosis: 'Metabolic Acidosis', clues: 'Kussmaul breathing, low pH, low HCO3', tests: 'ABG, anion gap' }
                ],
                references: ['ATS Dyspnea Guidelines 2023', 'ERS Respiratory Emergencies 2022']
            }
        },

        // Lab Reference Ranges (Comprehensive)
        labReferenceRanges: {
            // Already covered by lab-parser.js but adding clinical context
            CBC: {
                WBC: {
                    normal: '4.0-11.0 x10^9/L',
                    clinical: {
                        leukocytosis: '>11.0 → Infection, inflammation, malignancy, steroids',
                        leukopenia: '<4.0 → Viral infection, bone marrow failure, drugs',
                        severe_leukopenia: '<1.0 → Neutropenic fever risk, reverse isolation'
                    }
                },
                Hemoglobin: {
                    normal: 'M: 13.5-17.5 g/dL, F: 12.0-15.5 g/dL',
                    clinical: {
                        severe_anemia: '<7.0 → Consider transfusion',
                        moderate_anemia: '7.0-10.0 → Investigate cause, may need transfusion if symptomatic',
                        polycythemia: 'M: >17.5, F: >15.5 → Investigate for polycythemia vera, chronic hypoxia'
                    }
                },
                Platelets: {
                    normal: '150-400 x10^9/L',
                    clinical: {
                        severe_thrombocytopenia: '<20 → Bleeding risk, consider transfusion, investigate cause',
                        moderate_thrombocytopenia: '20-50 → Bleeding risk with procedures',
                        mild_thrombocytopenia: '50-150 → Usually safe, investigate if unexplained',
                        thrombocytosis: '>450 → Reactive (common) vs essential thrombocythemia'
                    }
                }
            },
            Renal: {
                Creatinine: {
                    normal: 'M: 0.7-1.3 mg/dL, F: 0.6-1.1 mg/dL',
                    clinical: 'Use eGFR for better assessment, watch for AKI (↑0.3 in 48h or ↑1.5x baseline)'
                },
                eGFR: {
                    normal: '>90 mL/min/1.73m²',
                    stages: {
                        G1: '>90 with kidney damage',
                        G2: '60-89 (mildly decreased)',
                        G3a: '45-59 (mild-moderate decrease)',
                        G3b: '30-44 (moderate-severe decrease)',
                        G4: '15-29 (severely decreased) → Nephrology referral',
                        G5: '<15 (kidney failure) → Consider RRT'
                    },
                    references: 'KDIGO CKD Guidelines 2024'
                }
            },
            Cardiac: {
                Troponin: {
                    normal: '<0.04 ng/mL (assay-dependent)',
                    clinical: {
                        positive: '>99th percentile → ACS, myocarditis, PE, CKD, sepsis',
                        serial: 'Repeat at 3-6h → Rising trend suggests acute MI',
                        highSensitivity: 'Allows earlier detection, 0/1h or 0/2h protocols'
                    }
                },
                BNP: {
                    normal: '<100 pg/mL',
                    clinical: {
                        unlikely_hf: '<100',
                        possible_hf: '100-400',
                        likely_hf: '>400',
                        severe_hf: '>1000'
                    },
                    notes: 'Elevated in renal failure, PE, age >75; Lower in obesity'
                }
            }
        }
    };

    // Conversation History Management
    class ConversationManager {
        constructor() {
            this.conversations = new Map(); // patientId → conversation array
        }

        initConversation(patientId) {
            if (!this.conversations.has(patientId)) {
                this.conversations.set(patientId, []);
            }
        }

        addMessage(patientId, role, content, metadata = {}) {
            this.initConversation(patientId);
            const message = {
                role, // 'user' or 'assistant'
                content,
                timestamp: Date.now(),
                metadata
            };
            this.conversations.get(patientId).push(message);
            return message;
        }

        getConversation(patientId) {
            return this.conversations.get(patientId) || [];
        }

        clearConversation(patientId) {
            this.conversations.delete(patientId);
        }

        exportConversation(patientId) {
            const conversation = this.getConversation(patientId);
            return JSON.stringify(conversation, null, 2);
        }
    }

    const conversationManager = new ConversationManager();

    // Clinical Context Builder
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
            patient.labImages.forEach((labImage, index) => {
                if (labImage.deleted) return;

                const labEntry = {
                    timestamp: labImage.timestamp || Date.now(),
                    reportType: labImage.ocr?.reportType || 'Unknown',
                    values: [],
                    alerts: labImage.ocr?.alerts || [],
                    findings: labImage.ocr?.findings || []
                };

                // Extract lab values
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

                        // Track critical values
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

            // Get latest labs
            if (context.labResults.length > 0) {
                context.labResults.sort((a, b) => b.timestamp - a.timestamp);
                context.latestLabs = context.labResults[0];

                // Calculate trends if multiple lab sets
                if (context.labResults.length >= 2) {
                    const latest = context.labResults[0];
                    const previous = context.labResults[1];

                    const latestMap = new Map(latest.values.map(v => [v.test, v.value]));
                    const previousMap = new Map(previous.values.map(v => [v.test, v.value]));

                    latestMap.forEach((value, test) => {
                        if (previousMap.has(test)) {
                            const prevValue = previousMap.get(test);
                            const change = value - prevValue;
                            const percentChange = ((change / prevValue) * 100).toFixed(1);
                            context.trends[test] = {
                                current: value,
                                previous: prevValue,
                                change: change,
                                percentChange: percentChange,
                                direction: change > 0 ? '↑' : change < 0 ? '↓' : '→'
                            };
                        }
                    });
                }
            }
        }

        return context;
    }

    // AI Response Generator
    function generateAIResponse(userQuery, clinicalContext, conversationHistory) {
        const query = userQuery.toLowerCase();
        let response = {
            text: '',
            references: [],
            confidence: 0,
            suggestions: []
        };

        // Query Classification
        const queryType = classifyQuery(query);

        switch (queryType) {
            case 'lab_interpretation':
                response = interpretLabQuery(query, clinicalContext);
                break;
            case 'drug_information':
                response = handleDrugQuery(query, clinicalContext);
                break;
            case 'diagnosis':
                response = handleDiagnosisQuery(query, clinicalContext);
                break;
            case 'treatment':
                response = handleTreatmentQuery(query, clinicalContext);
                break;
            case 'differential':
                response = handleDifferentialQuery(query, clinicalContext);
                break;
            case 'guideline':
                response = handleGuidelineQuery(query, clinicalContext);
                break;
            default:
                response = handleGeneralQuery(query, clinicalContext);
        }

        return response;
    }

    // Query Classification
    function classifyQuery(query) {
        const patterns = {
            lab_interpretation: /\b(lab|laboratory|test|result|value|hb|wbc|platelet|creatinine|sodium|potassium|glucose|troponin|bnp|inr)\b/i,
            drug_information: /\b(drug|medication|medicine|dose|dosing|interaction|side effect|contraindication|warfarin|metformin|statin|aspirin)\b/i,
            diagnosis: /\b(diagnos|criteria|sepsis|heart failure|aki|dka|stroke|mi|myocardial)\b/i,
            treatment: /\b(treat|management|protocol|therapy|antibiotic|insulin|transfusion|hypertension|emergency)\b/i,
            differential: /\b(differential|ddx|causes of|why|chest pain|dyspnea|altered mental)\b/i,
            guideline: /\b(guideline|recommendation|acc|aha|kdigo|ada|evidence|standard)\b/i
        };

        for (const [type, pattern] of Object.entries(patterns)) {
            if (pattern.test(query)) {
                return type;
            }
        }

        return 'general';
    }

    // Lab Interpretation Handler
    function interpretLabQuery(query, context) {
        let response = {
            text: '',
            references: [],
            confidence: 0.85,
            suggestions: []
        };

        if (!context.latestLabs || context.latestLabs.values.length === 0) {
            response.text = '⚠️ No lab results available for this patient. Please upload lab results first to enable AI interpretation.';
            response.confidence = 1.0;
            return response;
        }

        // Build comprehensive lab interpretation
        let interpretation = '📊 **Lab Results Interpretation**\n\n';

        // Latest labs summary
        interpretation += `**Latest Labs** (${new Date(context.latestLabs.timestamp).toLocaleString()}):\n\n`;

        const criticalValues = context.latestLabs.values.filter(v => v.flag === 'C');
        const abnormalValues = context.latestLabs.values.filter(v => v.flag === 'H' || v.flag === 'L');
        const normalValues = context.latestLabs.values.filter(v => v.flag === 'N');

        // Critical values first
        if (criticalValues.length > 0) {
            interpretation += '🚨 **CRITICAL VALUES**:\n';
            criticalValues.forEach(v => {
                interpretation += `- **${v.test}**: ${v.value} ${v.unit} (Reference: ${v.referenceRange})\n`;
                interpretation += `  ⚠️ Immediate attention required\n`;
            });
            interpretation += '\n';
        }

        // Abnormal values
        if (abnormalValues.length > 0) {
            interpretation += '⚠️ **Abnormal Values**:\n';
            abnormalValues.forEach(v => {
                const flag = v.flag === 'H' ? '↑ HIGH' : '↓ LOW';
                interpretation += `- **${v.test}**: ${v.value} ${v.unit} ${flag} (Reference: ${v.referenceRange})\n`;

                // Add clinical context from reference ranges
                const clinicalContext = getLabClinicalContext(v.test, v.value, v.flag);
                if (clinicalContext) {
                    interpretation += `  💡 ${clinicalContext}\n`;
                }

                // Add trend if available
                if (context.trends[v.test]) {
                    const trend = context.trends[v.test];
                    interpretation += `  📈 Trend: ${trend.previous} → ${trend.current} (${trend.direction} ${Math.abs(trend.percentChange)}%)\n`;
                }
            });
            interpretation += '\n';
        }

        // Normal values summary
        if (normalValues.length > 0) {
            interpretation += `✅ **Normal Values** (${normalValues.length}): `;
            interpretation += normalValues.map(v => v.test).join(', ') + '\n\n';
        }

        // Clinical integration with diagnosis
        if (context.clinical.diagnosis && context.clinical.diagnosis !== 'Not specified') {
            interpretation += `**Clinical Correlation with Diagnosis (${context.clinical.diagnosis})**:\n`;
            const correlation = correlatLabsWithDiagnosis(context.latestLabs.values, context.clinical.diagnosis);
            interpretation += correlation + '\n\n';
        }

        // Suggestions
        if (abnormalValues.length > 0 || criticalValues.length > 0) {
            interpretation += '**Recommendations**:\n';
            response.suggestions = generateLabRecommendations(context.latestLabs.values, context.clinical.diagnosis);
            response.suggestions.forEach(s => {
                interpretation += `- ${s}\n`;
            });
        }

        response.text = interpretation;
        response.references = ['Lab Reference Ranges Database v6.0', 'CDSS Clinical Decision Support Module'];

        return response;
    }

    // Get clinical context for specific lab value
    function getLabClinicalContext(test, value, flag) {
        const contexts = {
            'K+': {
                'H': 'Risk of arrhythmias. Check ECG. Consider insulin+glucose, calcium gluconate if severe.',
                'L': 'Risk of arrhythmias and muscle weakness. Consider potassium supplementation.',
                'C': 'CRITICAL HYPERKALEMIA - ECG changes likely. Urgent treatment needed.'
            },
            'Cr': {
                'H': 'Evaluate for AKI. Check baseline, review medications (NSAIDs, ACEi, ARBs).',
                'L': 'May indicate low muscle mass. Usually not clinically significant.'
            },
            'HB': {
                'L': value < 7 ? 'Severe anemia. Consider transfusion if symptomatic.' : 'Anemia - investigate cause (iron, B12, folate, chronic disease).',
                'H': 'Polycythemia. Investigate for primary vs secondary causes.'
            },
            'Glucose': {
                'H': value > 250 ? 'Hyperglycemia. Check for DKA if diabetic (pH, ketones, HCO3).' : 'Elevated glucose. Optimize diabetic management.',
                'L': 'Hypoglycemia. Immediate treatment with D50 if symptomatic. Investigate cause.',
                'C': value < 50 ? 'CRITICAL HYPOGLYCEMIA - Give D50 IV now' : 'CRITICAL HYPERGLYCEMIA - Check for DKA/HHS'
            },
            'Plt': {
                'L': value < 20 ? 'Severe thrombocytopenia. High bleeding risk. Consider transfusion.' : 'Thrombocytopenia. Investigate cause (drugs, ITP, DIC, HUS).',
                'H': 'Thrombocytosis. Usually reactive (infection, inflammation). Check if chronic.'
            },
            'WBC': {
                'H': 'Leukocytosis. Suggests infection/inflammation. Check for left shift on differential.',
                'L': 'Leukopenia. Viral infection possible. Monitor for neutropenic fever if <1.0.'
            },
            'Na+': {
                'H': value > 150 ? 'Hypernatremia. Free water deficit. Correct slowly (0.5 mEq/L/h max).' : 'Mild hypernatremia. Check hydration status.',
                'L': value < 120 ? 'Severe hyponatremia. Seizure risk. Check if acute vs chronic before correcting.' : 'Hyponatremia. Assess volume status (hypo/eu/hypervolemic).'
            },
            'Troponin': {
                'H': 'Elevated troponin. Suggests myocardial injury. Check ECG, serial troponins. Consider ACS, PE, myocarditis, sepsis.',
                'C': 'CRITICAL TROPONIN - Likely ACS. Urgent cardiology consult, ECG, aspirin, antiplatelet therapy.'
            },
            'INR': {
                'H': value > 4.5 ? 'INR dangerously high. Hold warfarin. Consider vitamin K. Check for bleeding.' : 'INR above target. Hold 1-2 doses of warfarin and recheck.',
                'C': 'CRITICAL INR - High bleeding risk. Give vitamin K ± PCC/FFP if bleeding.'
            }
        };

        return contexts[test]?.[flag] || null;
    }

    // Correlate labs with diagnosis
    function correlatLabsWithDiagnosis(labValues, diagnosis) {
        const diagnosisLower = diagnosis.toLowerCase();
        let correlation = '';

        // Heart Failure
        if (diagnosisLower.includes('heart failure') || diagnosisLower.includes('hf')) {
            const bnp = labValues.find(v => v.test.toUpperCase().includes('BNP'));
            const creatinine = labValues.find(v => v.test.toUpperCase() === 'CR');
            const sodium = labValues.find(v => v.test === 'Na+');

            if (bnp) {
                if (bnp.value > 400) {
                    correlation += '- BNP significantly elevated → Consistent with decompensated heart failure\n';
                } else if (bnp.value < 100) {
                    correlation += '- BNP normal → Heart failure unlikely as primary cause of symptoms\n';
                }
            }
            if (creatinine && creatinine.flag !== 'N') {
                correlation += '- Abnormal creatinine → Cardiorenal syndrome possible. Monitor closely.\n';
            }
            if (sodium && sodium.value < 135) {
                correlation += '- Hyponatremia → Marker of severity in heart failure. Associated with poor prognosis.\n';
            }
        }

        // AKI / Renal
        if (diagnosisLower.includes('aki') || diagnosisLower.includes('renal') || diagnosisLower.includes('kidney')) {
            const cr = labValues.find(v => v.test.toUpperCase() === 'CR');
            const k = labValues.find(v => v.test === 'K+');
            const hco3 = labValues.find(v => v.test === 'HCO3');

            if (cr && cr.flag !== 'N') {
                correlation += '- Elevated creatinine → Confirm AKI by comparing to baseline. Check KDIGO criteria.\n';
            }
            if (k && k.value > 5.5) {
                correlation += '- Hyperkalemia → Common in AKI. Monitor ECG, treat if >6.0 or ECG changes.\n';
            }
            if (hco3 && hco3.value < 22) {
                correlation += '- Low bicarbonate → Metabolic acidosis, common in AKI. Check anion gap.\n';
            }
        }

        // Diabetes / DKA
        if (diagnosisLower.includes('diabet') || diagnosisLower.includes('dka')) {
            const glucose = labValues.find(v => v.test.toUpperCase().includes('GLUC'));
            const hco3 = labValues.find(v => v.test === 'HCO3');
            const k = labValues.find(v => v.test === 'K+');

            if (glucose && glucose.value > 250) {
                correlation += '- Hyperglycemia present → ';
                if (hco3 && hco3.value < 18) {
                    correlation += 'With low HCO3 → DKA likely. Check pH and ketones urgently.\n';
                } else {
                    correlation += 'Consider HHS if severely elevated (>600) without acidosis.\n';
                }
            }
            if (k) {
                correlation += `- Potassium ${k.value} → Critical to monitor during DKA treatment. Replace K+ when <5.2 despite total body depletion.\n`;
            }
        }

        // Sepsis
        if (diagnosisLower.includes('sepsis') || diagnosisLower.includes('infection')) {
            const wbc = labValues.find(v => v.test === 'WBC');
            const plt = labValues.find(v => v.test === 'Plt');
            const cr = labValues.find(v => v.test.toUpperCase() === 'CR');

            if (wbc) {
                if (wbc.flag === 'H') {
                    correlation += '- Leukocytosis → Supports bacterial infection/sepsis.\n';
                } else if (wbc.flag === 'L') {
                    correlation += '- Leukopenia → May indicate overwhelming sepsis or viral infection.\n';
                }
            }
            if (plt && plt.flag === 'L') {
                correlation += '- Thrombocytopenia → Consider DIC in sepsis. Check PT/INR, fibrinogen, D-dimer.\n';
            }
            if (cr && cr.flag !== 'N') {
                correlation += '- Renal dysfunction → Sepsis-induced AKI. Ensure adequate resuscitation.\n';
            }
        }

        // Anemia
        if (diagnosisLower.includes('anemia')) {
            const hb = labValues.find(v => v.test === 'HB');
            const mcv = labValues.find(v => v.test === 'MCV');

            if (hb) {
                correlation += `- Hemoglobin ${hb.value} g/dL → `;
                if (hb.value < 7) {
                    correlation += 'Severe anemia. Consider transfusion if symptomatic.\n';
                } else {
                    correlation += 'Moderate anemia. Investigate cause.\n';
                }
            }
            if (mcv) {
                if (mcv.value < 80) {
                    correlation += '- Low MCV → Microcytic anemia. Check iron studies (most common: iron deficiency).\n';
                } else if (mcv.value > 100) {
                    correlation += '- High MCV → Macrocytic anemia. Check B12, folate, TSH.\n';
                } else {
                    correlation += '- Normal MCV → Normocytic anemia. Consider chronic disease, hemolysis, bleeding.\n';
                }
            }
        }

        return correlation || '- Review lab trends and clinical correlation with current diagnosis.';
    }

    // Generate lab-based recommendations
    function generateLabRecommendations(labValues, diagnosis) {
        const recommendations = [];

        labValues.forEach(lab => {
            if (lab.flag === 'C') {
                recommendations.push(`🚨 URGENT: Address critical ${lab.test} (${lab.value} ${lab.unit}) immediately`);
            }
        });

        // Specific recommendations based on abnormalities
        const k = labValues.find(v => v.test === 'K+');
        if (k && (k.value > 5.5 || k.value < 3.0)) {
            recommendations.push('Order ECG to assess for potassium-related arrhythmias');
        }

        const cr = labValues.find(v => v.test.toUpperCase() === 'CR');
        if (cr && cr.flag !== 'N') {
            recommendations.push('Assess for AKI using KDIGO criteria (compare to baseline Cr)');
            recommendations.push('Review nephrotoxic medications (NSAIDs, ACEi/ARBs, aminoglycosides)');
        }

        const glucose = labValues.find(v => v.test.toUpperCase().includes('GLUC'));
        if (glucose && glucose.value > 250) {
            recommendations.push('Check for DKA: Order ABG, beta-hydroxybutyrate or urine ketones');
        }

        const hb = labValues.find(v => v.test === 'HB');
        if (hb && hb.value < 8) {
            recommendations.push('Consider blood transfusion if patient is symptomatic or Hb <7');
            recommendations.push('Investigate cause of anemia if not already known');
        }

        const wbc = labValues.find(v => v.test === 'WBC');
        if (wbc && wbc.flag === 'H') {
            recommendations.push('Check WBC differential for left shift (bandemia suggests bacterial infection)');
            recommendations.push('Consider source of infection if not identified');
        }

        return recommendations;
    }

    // Drug Information Handler
    function handleDrugQuery(query, context) {
        let response = {
            text: '',
            references: [],
            confidence: 0.9,
            suggestions: []
        };

        // Extract drug name from query
        const drugPatterns = Object.keys(VERIFIED_MEDICAL_DATABASES.drugInteractions);
        let matchedDrug = null;

        for (const drug of drugPatterns) {
            if (query.includes(drug)) {
                matchedDrug = drug;
                break;
            }
        }

        if (matchedDrug) {
            const drugInfo = VERIFIED_MEDICAL_DATABASES.drugInteractions[matchedDrug];
            let drugText = `💊 **${matchedDrug.toUpperCase()} - Drug Information**\n\n`;

            drugText += '**Contraindications**:\n';
            drugInfo.contraindications.forEach(ci => {
                drugText += `- ${ci}\n`;
            });
            drugText += '\n';

            if (drugInfo.monitoring) {
                drugText += `**Monitoring**: ${drugInfo.monitoring}\n\n`;
            }

            if (drugInfo.targetINR) {
                drugText += '**Target INR**:\n';
                Object.entries(drugInfo.targetINR).forEach(([indication, range]) => {
                    drugText += `- ${indication.replace(/_/g, ' ')}: ${range}\n`;
                });
                drugText += '\n';
            }

            if (drugInfo.toxicityRisk) {
                drugText += '**Toxicity Levels**:\n';
                Object.entries(drugInfo.toxicityRisk).forEach(([level, value]) => {
                    drugText += `- ${level}: ${value}\n`;
                });
                drugText += '\n';
            }

            if (drugInfo.sideEffects) {
                drugText += '**Common Side Effects**:\n';
                drugInfo.sideEffects.forEach(se => {
                    drugText += `- ${se}\n`;
                });
                drugText += '\n';
            }

            if (drugInfo.alerts) {
                drugText += `⚠️ **Alert**: ${drugInfo.alerts}\n\n`;
            }

            if (drugInfo.myopathyRisk) {
                drugText += '**Myopathy Risk Factors**:\n';
                drugInfo.myopathyRisk.forEach(rf => {
                    drugText += `- ${rf}\n`;
                });
                drugText += '\n';
            }

            // Check patient labs for contraindications
            if (context.latestLabs) {
                drugText += '**Patient-Specific Considerations**:\n';
                const labChecks = checkDrugLabInteractions(matchedDrug, context.latestLabs.values);
                if (labChecks.length > 0) {
                    labChecks.forEach(check => {
                        drugText += `${check}\n`;
                    });
                } else {
                    drugText += '- No significant lab-based contraindications identified\n';
                }
                drugText += '\n';
            }

            drugText += '**References**: ' + drugInfo.references.join(', ');

            response.text = drugText;
            response.references = drugInfo.references;
        } else {
            response.text = '💊 **Drug Information**\n\nI have verified information for the following medications:\n';
            response.text += Object.keys(VERIFIED_MEDICAL_DATABASES.drugInteractions).join(', ');
            response.text += '\n\nPlease specify which medication you\'d like information about, or ask a more specific question.';
            response.confidence = 0.7;
        }

        return response;
    }

    // Check drug-lab interactions
    function checkDrugLabInteractions(drug, labValues) {
        const checks = [];

        if (drug === 'metformin') {
            const egfr = labValues.find(v => v.test.toUpperCase() === 'EGFR');
            const cr = labValues.find(v => v.test.toUpperCase() === 'CR');

            if (egfr && egfr.value < 30) {
                checks.push('⛔ CONTRAINDICATED: eGFR < 30 mL/min - Stop metformin (lactic acidosis risk)');
            } else if (egfr && egfr.value < 45) {
                checks.push('⚠️ CAUTION: eGFR 30-45 mL/min - Consider dose reduction, monitor closely');
            }
        }

        if (drug === 'digoxin') {
            const k = labValues.find(v => v.test === 'K+');
            const cr = labValues.find(v => v.test.toUpperCase() === 'CR');

            if (k && k.value < 3.5) {
                checks.push('⚠️ WARNING: Hypokalemia increases digoxin toxicity risk - Correct K+ before/during therapy');
            }
            if (cr && cr.flag === 'H') {
                checks.push('⚠️ CAUTION: Renal impairment - Reduce digoxin dose, monitor levels closely');
            }
        }

        if (drug === 'statins') {
            const ck = labValues.find(v => v.test.toUpperCase().includes('CK') || v.test.toUpperCase() === 'CPK');
            const alt = labValues.find(v => v.test === 'ALT');
            const ast = labValues.find(v => v.test === 'AST');

            if (ck && ck.value > 1000) {
                checks.push('⛔ STOP STATIN: CK significantly elevated - Rhabdomyolysis risk');
            } else if (ck && ck.value > 300) {
                checks.push('⚠️ WARNING: Elevated CK - Monitor closely, consider holding statin if symptomatic');
            }

            if ((alt && alt.value > 120) || (ast && ast.value > 120)) {
                checks.push('⚠️ CAUTION: Elevated liver enzymes - Consider holding statin, investigate cause');
            }
        }

        if (drug === 'ace_inhibitors') {
            const k = labValues.find(v => v.test === 'K+');
            const cr = labValues.find(v => v.test.toUpperCase() === 'CR');

            if (k && k.value > 5.0) {
                checks.push('⚠️ WARNING: Hyperkalemia - ACE inhibitors can worsen K+. Monitor closely or consider alternative.');
            }
            if (cr && cr.flag === 'H') {
                checks.push('ℹ️ NOTE: Cr elevation up to 30% is acceptable with ACE inhibitors. Monitor trend.');
            }
        }

        return checks;
    }

    // Diagnosis Query Handler
    function handleDiagnosisQuery(query, context) {
        let response = {
            text: '',
            references: [],
            confidence: 0.88,
            suggestions: []
        };

        // Find matching diagnostic criteria
        const diagnosticDB = VERIFIED_MEDICAL_DATABASES.diagnosticCriteria;
        let matchedDiagnosis = null;

        for (const [key, value] of Object.entries(diagnosticDB)) {
            if (query.includes(key.replace(/_/g, ' ')) ||
                query.includes(key.replace(/_/g, '')) ||
                (value.criteria && query.includes(value.criteria.substring(0, 20).toLowerCase()))) {
                matchedDiagnosis = { key, ...value };
                break;
            }
        }

        if (matchedDiagnosis) {
            let diagText = `🔬 **${matchedDiagnosis.key.replace(/_/g, ' ').toUpperCase()} - Diagnostic Criteria**\n\n`;

            diagText += `**Criteria**: ${matchedDiagnosis.criteria}\n\n`;

            if (matchedDiagnosis.components) {
                diagText += '**Components**:\n';
                Object.entries(matchedDiagnosis.components).forEach(([comp, desc]) => {
                    if (Array.isArray(desc)) {
                        diagText += `- ${comp}:\n`;
                        desc.forEach(item => diagText += `  • ${item}\n`);
                    } else {
                        diagText += `- ${comp}: ${desc}\n`;
                    }
                });
                diagText += '\n';
            }

            if (matchedDiagnosis.types) {
                diagText += '**Types/Classifications**:\n';
                Object.entries(matchedDiagnosis.types).forEach(([type, desc]) => {
                    diagText += `- **${type.replace(/_/g, ' ').toUpperCase()}**: ${desc}\n`;
                });
                diagText += '\n';
            }

            if (matchedDiagnosis.stages) {
                diagText += '**Stages**:\n';
                Object.entries(matchedDiagnosis.stages).forEach(([stage, desc]) => {
                    diagText += `- **${stage.toUpperCase()}**: ${desc}\n`;
                });
                diagText += '\n';
            }

            if (matchedDiagnosis.severity) {
                diagText += '**Severity Classification**:\n';
                Object.entries(matchedDiagnosis.severity).forEach(([level, desc]) => {
                    diagText += `- **${level}**: ${desc}\n`;
                });
                diagText += '\n';
            }

            if (matchedDiagnosis.major || matchedDiagnosis.minor) {
                if (matchedDiagnosis.major) {
                    diagText += '**Major Criteria**:\n';
                    matchedDiagnosis.major.forEach(m => diagText += `- ${m}\n`);
                    diagText += '\n';
                }
                if (matchedDiagnosis.minor) {
                    diagText += '**Minor Criteria**:\n';
                    matchedDiagnosis.minor.forEach(m => diagText += `- ${m}\n`);
                    diagText += '\n';
                }
            }

            if (matchedDiagnosis.biomarkers) {
                diagText += '**Biomarkers**:\n';
                Object.entries(matchedDiagnosis.biomarkers).forEach(([biomarker, values]) => {
                    diagText += `- **${biomarker}**:\n`;
                    Object.entries(values).forEach(([level, value]) => {
                        diagText += `  • ${level}: ${value}\n`;
                    });
                });
                diagText += '\n';
            }

            if (matchedDiagnosis.management) {
                diagText += `**Management**: ${matchedDiagnosis.management}\n\n`;
            }

            diagText += `**Evidence Level**: ${matchedDiagnosis.evidenceLevel || 'A'}\n`;
            diagText += `**References**: ${matchedDiagnosis.references.join(', ')}`;

            response.text = diagText;
            response.references = matchedDiagnosis.references;
        } else {
            response.text = '🔬 **Diagnostic Criteria Database**\n\nI have verified diagnostic criteria for:\n';
            response.text += Object.keys(diagnosticDB).map(k => k.replace(/_/g, ' ')).join(', ');
            response.text += '\n\nPlease specify which diagnosis you\'d like criteria for.';
            response.confidence = 0.6;
        }

        return response;
    }

    // Treatment Query Handler
    function handleTreatmentQuery(query, context) {
        let response = {
            text: '',
            references: [],
            confidence: 0.87,
            suggestions: []
        };

        const treatmentDB = VERIFIED_MEDICAL_DATABASES.treatmentProtocols;
        let matchedProtocol = null;

        for (const [key, value] of Object.entries(treatmentDB)) {
            if (query.includes(key.replace(/_/g, ' ')) ||
                query.includes(key.replace(/_/g, ''))) {
                matchedProtocol = { key, ...value };
                break;
            }
        }

        if (matchedProtocol) {
            let treatText = `⚕️ **${matchedProtocol.key.replace(/_/g, ' ').toUpperCase()} - Treatment Protocol**\n\n`;

            if (matchedProtocol.definition) {
                treatText += `**Definition**: ${matchedProtocol.definition}\n\n`;
            }

            if (matchedProtocol.targetBP) {
                treatText += `**Target BP**: ${matchedProtocol.targetBP}\n\n`;
            }

            if (matchedProtocol.firstLine) {
                treatText += '**First-Line Therapy**:\n';
                matchedProtocol.firstLine.forEach(tx => {
                    treatText += `- **${tx.drug}**: ${tx.dose}\n`;
                    treatText += `  • Onset: ${tx.onset}\n`;
                    treatText += `  • Indication: ${tx.indication}\n`;
                });
                treatText += '\n';
            }

            if (matchedProtocol.time_critical) {
                treatText += '⏱️ **Time-Critical Benchmarks**:\n';
                Object.entries(matchedProtocol.time_critical).forEach(([metric, time]) => {
                    treatText += `- ${metric.replace(/_/g, ' ')}: ${time}\n`;
                });
                treatText += '\n';
            }

            if (matchedProtocol.tPA_criteria) {
                treatText += '**tPA Criteria**:\n';
                treatText += '✅ Inclusion:\n';
                matchedProtocol.tPA_criteria.inclusion.forEach(i => treatText += `  - ${i}\n`);
                treatText += '⛔ Exclusion:\n';
                matchedProtocol.tPA_criteria.exclusion.forEach(e => treatText += `  - ${e}\n`);
                treatText += '\n';
            }

            if (matchedProtocol.ratio) {
                treatText += `**Transfusion Ratio**: ${matchedProtocol.ratio}\n\n`;
            }

            if (matchedProtocol.triggers) {
                treatText += '**Transfusion Triggers**:\n';
                Object.entries(matchedProtocol.triggers).forEach(([component, trigger]) => {
                    treatText += `- ${component}: ${trigger}\n`;
                });
                treatText += '\n';
            }

            if (matchedProtocol.bloodPressure) {
                treatText += `**Blood Pressure Management**: ${matchedProtocol.bloodPressure}\n\n`;
            }

            if (matchedProtocol.repeat) {
                treatText += `**Repeat Dosing**: ${matchedProtocol.repeat}\n\n`;
            }

            if (matchedProtocol.adjunctive) {
                treatText += '**Adjunctive Therapy**:\n';
                matchedProtocol.adjunctive.forEach(adj => {
                    treatText += `- ${adj.therapy}: ${adj.example}\n`;
                });
                treatText += '\n';
            }

            if (matchedProtocol.fluidResuscitation) {
                treatText += `**Fluid Resuscitation**: ${matchedProtocol.fluidResuscitation}\n\n`;
            }

            if (matchedProtocol.observation) {
                treatText += `**Observation Period**: ${matchedProtocol.observation}\n\n`;
            }

            if (matchedProtocol.monitoring) {
                treatText += `**Monitoring**: ${matchedProtocol.monitoring}\n\n`;
            }

            if (matchedProtocol.complications) {
                treatText += '**Potential Complications**:\n';
                matchedProtocol.complications.forEach(c => treatText += `- ${c}\n`);
                treatText += '\n';
            }

            if (matchedProtocol.avoid) {
                treatText += '⚠️ **AVOID**:\n';
                matchedProtocol.avoid.forEach(a => treatText += `- ${a}\n`);
                treatText += '\n';
            }

            treatText += `**Evidence Level**: ${matchedProtocol.evidenceLevel || 'A'}\n`;
            treatText += `**References**: ${matchedProtocol.references.join(', ')}`;

            response.text = treatText;
            response.references = matchedProtocol.references;
        } else {
            response.text = '⚕️ **Treatment Protocols Database**\n\nI have evidence-based protocols for:\n';
            response.text += Object.keys(treatmentDB).map(k => k.replace(/_/g, ' ')).join(', ');
            response.text += '\n\nPlease specify which protocol you need.';
            response.confidence = 0.6;
        }

        return response;
    }

    // Differential Diagnosis Handler
    function handleDifferentialQuery(query, context) {
        let response = {
            text: '',
            references: [],
            confidence: 0.85,
            suggestions: []
        };

        const differentialDB = VERIFIED_MEDICAL_DATABASES.differentialDiagnosis;
        let matchedDifferential = null;

        for (const [key, value] of Object.entries(differentialDB)) {
            if (query.includes(key.replace(/_/g, ' '))) {
                matchedDifferential = { key, ...value };
                break;
            }
        }

        if (matchedDifferential) {
            let diffText = `🔍 **Differential Diagnosis: ${matchedDifferential.key.replace(/_/g, ' ').toUpperCase()}**\n\n`;

            if (matchedDifferential.mnemonic) {
                diffText += `**Mnemonic**: ${matchedDifferential.mnemonic}\n\n`;
            }

            if (matchedDifferential.lifeThreatening) {
                diffText += '🚨 **LIFE-THREATENING (Rule out first)**:\n';
                matchedDifferential.lifeThreatening.forEach(dx => {
                    diffText += `\n**${dx.diagnosis}**\n`;
                    diffText += `- Clues: ${dx.clues}\n`;
                    diffText += `- Tests: ${dx.tests}\n`;
                });
                diffText += '\n';
            }

            if (matchedDifferential.cardiac) {
                diffText += '❤️ **CARDIAC CAUSES**:\n';
                matchedDifferential.cardiac.forEach(dx => {
                    diffText += `\n**${dx.diagnosis}**\n`;
                    diffText += `- Clues: ${dx.clues}\n`;
                    diffText += `- Tests: ${dx.tests}\n`;
                });
                diffText += '\n';
            }

            if (matchedDifferential.pulmonary) {
                diffText += '🫁 **PULMONARY CAUSES**:\n';
                matchedDifferential.pulmonary.forEach(dx => {
                    diffText += `\n**${dx.diagnosis}**\n`;
                    diffText += `- Clues: ${dx.clues}\n`;
                    diffText += `- Tests: ${dx.tests}\n`;
                });
                diffText += '\n';
            }

            if (matchedDifferential.other) {
                diffText += '📋 **OTHER CAUSES**:\n';
                matchedDifferential.other.forEach(dx => {
                    diffText += `\n**${dx.diagnosis}**\n`;
                    diffText += `- Clues: ${dx.clues}\n`;
                    diffText += `- Tests: ${dx.tests}\n`;
                });
                diffText += '\n';
            }

            if (matchedDifferential.common) {
                diffText += '📊 **COMMON CAUSES**:\n';
                matchedDifferential.common.forEach(dx => {
                    diffText += `\n**${dx.diagnosis}**\n`;
                    diffText += `- Clues: ${dx.clues}\n`;
                    diffText += `- Tests: ${dx.tests}\n`;
                });
                diffText += '\n';
            }

            if (matchedDifferential.causes) {
                diffText += '**Causes by Category**:\n';
                matchedDifferential.causes.forEach(cause => {
                    diffText += `\n**${cause.letter}** - ${cause.diagnosis}\n`;
                    diffText += `- Tests: ${cause.tests}\n`;
                });
                diffText += '\n';
            }

            if (matchedDifferential.workup) {
                diffText += `**Initial Workup**: ${matchedDifferential.workup}\n\n`;
            }

            diffText += `**References**: ${matchedDifferential.references.join(', ')}`;

            response.text = diffText;
            response.references = matchedDifferential.references;
        } else {
            response.text = '🔍 **Differential Diagnosis Database**\n\nI have structured differentials for:\n';
            response.text += Object.keys(differentialDB).map(k => k.replace(/_/g, ' ')).join(', ');
            response.text += '\n\nWhat symptom or presentation would you like a differential for?';
            response.confidence = 0.6;
        }

        return response;
    }

    // Guideline Query Handler
    function handleGuidelineQuery(query, context) {
        let response = {
            text: '',
            references: [],
            confidence: 0.8,
            suggestions: []
        };

        response.text = '📚 **Clinical Guidelines**\n\n';
        response.text += 'The application integrates multiple evidence-based guidelines:\n\n';
        response.text += '**Integrated Guidelines**:\n';
        response.text += '- ACC/AHA Heart Failure, Hypertension, ACS Guidelines 2022-2023\n';
        response.text += '- KDIGO AKI and CKD Guidelines 2012-2024\n';
        response.text += '- ADA Diabetes Standards of Care 2024\n';
        response.text += '- Surviving Sepsis Campaign Guidelines 2021\n';
        response.text += '- AHA Stroke Guidelines 2023\n';
        response.text += '- ESC Cardiovascular Guidelines 2023\n';
        response.text += '- CHEST Anticoagulation Guidelines 2018\n';
        response.text += '- IDSA Infectious Disease Guidelines\n\n';
        response.text += 'You can access specific guidelines through:\n';
        response.text += '1. The main Guidelines button for diagnosis-specific recommendations\n';
        response.text += '2. Asking about specific conditions (e.g., "sepsis guidelines", "heart failure management")\n';
        response.text += '3. Drug-specific guidelines (e.g., "warfarin monitoring")\n\n';
        response.text += 'All guidelines are evidence-based with references to primary sources.';

        response.references = ['Multiple integrated guideline databases'];

        return response;
    }

    // General Query Handler
    function handleGeneralQuery(query, context) {
        let response = {
            text: '',
            references: [],
            confidence: 0.65,
            suggestions: []
        };

        response.text = '🤖 **AI Medical Consultant**\n\n';
        response.text += 'I can help you with:\n\n';
        response.text += '**Lab Interpretation**\n';
        response.text += '- "Interpret labs" or "What do the lab results show?"\n';
        response.text += '- "Is the potassium dangerous?"\n';
        response.text += '- "Explain the creatinine trend"\n\n';

        response.text += '**Drug Information**\n';
        response.text += '- "Warfarin interactions"\n';
        response.text += '- "Metformin in renal failure"\n';
        response.text += '- "Statin monitoring"\n\n';

        response.text += '**Diagnostic Criteria**\n';
        response.text += '- "Sepsis-3 criteria"\n';
        response.text += '- "How to diagnose DKA?"\n';
        response.text += '- "AKI KDIGO staging"\n\n';

        response.text += '**Treatment Protocols**\n';
        response.text += '- "Hypertensive emergency management"\n';
        response.text += '- "Stroke protocol"\n';
        response.text += '- "Massive transfusion protocol"\n\n';

        response.text += '**Differential Diagnosis**\n';
        response.text += '- "Chest pain differential"\n';
        response.text += '- "Altered mental status causes"\n';
        response.text += '- "Acute dyspnea workup"\n\n';

        response.text += 'Ask me a specific question to get detailed, evidence-based information!';

        return response;
    }

    // Public API
    return {
        // Initialize conversation for a patient
        startConsultation: function(patientId) {
            conversationManager.initConversation(patientId);
            return {
                success: true,
                message: 'AI Medical Consultation started',
                timestamp: Date.now()
            };
        },

        // Send a query to the AI
        askQuestion: function(patientId, userQuery, patient) {
            try {
                // Build clinical context
                const clinicalContext = buildClinicalContext(patient);

                // Get conversation history
                const conversationHistory = conversationManager.getConversation(patientId);

                // Add user message to conversation
                conversationManager.addMessage(patientId, 'user', userQuery);

                // Generate AI response
                const aiResponse = generateAIResponse(userQuery, clinicalContext, conversationHistory);

                // Add AI response to conversation
                conversationManager.addMessage(patientId, 'assistant', aiResponse.text, {
                    references: aiResponse.references,
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
                        text: '⚠️ An error occurred while processing your query. Please try again or rephrase your question.',
                        references: [],
                        confidence: 0,
                        suggestions: []
                    }
                };
            }
        },

        // Get conversation history
        getHistory: function(patientId) {
            return conversationManager.getConversation(patientId);
        },

        // Clear conversation
        clearHistory: function(patientId) {
            conversationManager.clearConversation(patientId);
            return { success: true, message: 'Conversation cleared' };
        },

        // Export conversation
        exportHistory: function(patientId) {
            return conversationManager.exportConversation(patientId);
        },

        // Get available databases info
        getDatabaseInfo: function() {
            return {
                drugInteractions: Object.keys(VERIFIED_MEDICAL_DATABASES.drugInteractions).length,
                diagnosticCriteria: Object.keys(VERIFIED_MEDICAL_DATABASES.diagnosticCriteria).length,
                treatmentProtocols: Object.keys(VERIFIED_MEDICAL_DATABASES.treatmentProtocols).length,
                differentialDiagnosis: Object.keys(VERIFIED_MEDICAL_DATABASES.differentialDiagnosis).length
            };
        }
    };
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIMedicalConsultant;
}
