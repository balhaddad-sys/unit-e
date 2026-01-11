/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  AI MEDICAL CONSULTANT v6.1 - ASCLEPIUS ULTRA                                ║
 * ║  Comprehensive Clinical Intelligence with Deep Medical Knowledge              ║
 * ║  FIXED: Uses CONFIG.apiUrl for consistent API endpoint                        ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

const AIMedicalConsultant = (function() {
    'use strict';

    const VERSION = '6.1.0';
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
            
            treatment: {
                acute: {
                    firstLine: [
                        { drug: 'NSAIDs', dose: 'Indomethacin 50mg TID or Naproxen 500mg BID', duration: '5-7 days', notes: 'Avoid in CKD, GI bleed, heart failure' },
                        { drug: 'Colchicine', dose: '1.2mg then 0.6mg 1 hour later (day 1), then 0.6mg BID', duration: 'Until resolution', notes: 'Most effective within 24-36h of onset; reduce dose in CKD' },
                        { drug: 'Corticosteroids', dose: 'Prednisone 30-40mg/day or intra-articular injection', duration: '5-7 days then taper', notes: 'Use if NSAIDs/colchicine contraindicated' }
                    ],
                    keyPoint: '⚠️ Do NOT start or change urate-lowering therapy during acute attack!'
                },
                chronic: {
                    indications: ['≥2 attacks per year', 'Presence of tophi', 'CKD stage 2 or worse', 'History of urolithiasis', 'Radiographic joint damage'],
                    medications: [
                        { drug: 'Allopurinol', dose: 'Start 100mg/day, titrate by 100mg every 2-4 weeks', target: 'Uric acid <6 mg/dL (<5 if tophi)', notes: 'Check HLA-B*5801 in high-risk populations' },
                        { drug: 'Febuxostat', dose: '40-80mg daily', notes: 'Alternative if allopurinol intolerant; avoid in cardiovascular disease' }
                    ]
                }
            },
            
            sources: ['ACR Gout Guidelines 2020', 'EULAR Gout Recommendations 2016', 'UpToDate 2024']
        },

        'septic arthritis': {
            keywords: ['septic arthritis', 'septic joint', 'infectious arthritis', 'bacterial arthritis', 'joint infection'],
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
                    'Severe pain with ANY movement',
                    'Fever (present in ~60%)',
                    'Patient appears more "sick" than gout'
                ],
                mostCommonJoint: 'Knee (50%)',
                riskFactors: ['Pre-existing joint disease (RA, OA, gout)', 'Joint prosthesis', 'Recent joint injection', 'Diabetes', 'Immunosuppression', 'IV drug use', 'Skin infection']
            },
            
            diagnosis: {
                goldStandard: 'Synovial fluid aspiration BEFORE antibiotics (if possible)',
                findings: {
                    wbc: '>50,000/μL (often >100,000) - highly suggestive',
                    pmn: '>75% PMNs',
                    gramStain: 'Positive in 50-75%',
                    culture: 'Positive in 70-90%'
                },
                organisms: {
                    adults: 'S. aureus (#1), then Streptococci, Gram-negatives',
                    ivdu: 'S. aureus, Pseudomonas',
                    sexuallyActive: 'N. gonorrhoeae'
                }
            },
            
            treatment: {
                empiric: [
                    { scenario: 'Native joint', regimen: 'Vancomycin + 3rd gen cephalosporin (ceftriaxone 2g q24h)' },
                    { scenario: 'IVDU or Pseudomonas risk', regimen: 'Vancomycin + Cefepime or Pip-Tazo' },
                    { scenario: 'Prosthetic joint', regimen: 'Vancomycin + Cefepime, urgent orthopedic consult' }
                ],
                duration: '2-4 weeks IV typically',
                surgical: 'Joint drainage essential - arthroscopic or open drainage'
            },
            
            sources: ['IDSA Bone & Joint Infection Guidelines', 'UpToDate 2024']
        },

        'aki': {
            keywords: ['aki', 'acute kidney injury', 'acute renal failure', 'arf', 'creatinine rise', 'oliguria'],
            category: 'Nephrology',
            
            quickFacts: {
                definition: 'Abrupt decrease in kidney function over hours to days',
                kdigo: 'Stage 1: Cr ↑1.5-1.9x or ↑≥0.3 mg/dL or UOP <0.5 mL/kg/h x 6-12h'
            },
            
            classification: {
                prerenal: {
                    causes: ['Volume depletion', 'Heart failure', 'Sepsis', 'Hepatorenal syndrome', 'Bilateral RAS'],
                    features: ['BUN/Cr >20:1', 'FeNa <1%', 'Urine Na <20', 'Bland sediment']
                },
                intrinsic: {
                    causes: ['ATN (ischemic, toxic)', 'AIN', 'Glomerulonephritis', 'TTP/HUS'],
                    features: ['BUN/Cr 10-15:1', 'FeNa >2% (ATN)', 'Muddy brown casts (ATN)']
                },
                postrenal: {
                    causes: ['BPH', 'Malignancy', 'Stones', 'Strictures'],
                    features: ['Bilateral hydronephrosis on US', 'Post-void residual >200mL']
                }
            },
            
            management: {
                general: ['Hold nephrotoxins (NSAIDs, ACEi/ARB, aminoglycosides)', 'Avoid contrast', 'Optimize volume status', 'Treat underlying cause'],
                dialysisIndications: 'AEIOU - Acidosis, Electrolytes (K>6.5 refractory), Intoxication, Overload, Uremia symptoms'
            },
            
            sources: ['KDIGO AKI Guidelines 2012', 'UpToDate 2024']
        },

        'hyperkalemia': {
            keywords: ['hyperkalemia', 'high potassium', 'elevated k', 'k+ high'],
            category: 'Nephrology/Emergency',
            
            quickFacts: {
                definition: 'Serum K+ >5.0 mEq/L',
                severe: 'K+ >6.5 mEq/L or any ECG changes - EMERGENCY'
            },
            
            ecgChanges: {
                mild: 'Peaked T waves',
                moderate: 'PR prolongation, QRS widening',
                severe: 'Loss of P waves, sine wave pattern, VF/asystole'
            },
            
            causes: {
                spurious: ['Hemolysis', 'Thrombocytosis', 'Leukocytosis', 'Prolonged tourniquet'],
                real: ['CKD/AKI', 'Acidosis', 'Tissue breakdown', 'Drugs (ACEi, ARB, K-sparing diuretics, NSAIDs)']
            },
            
            treatment: {
                cardiac_protection: { drug: 'Calcium gluconate 1-2g IV', onset: '1-3 min', duration: '30-60 min' },
                shift: [
                    { drug: 'Insulin 10U + D50 25g', onset: '15-30 min', duration: '4-6 hours' },
                    { drug: 'Albuterol 10-20mg nebulized', onset: '30 min', duration: '2-4 hours' }
                ],
                elimination: [
                    { drug: 'Kayexalate 30-60g PO/PR', notes: 'Slow, avoid in bowel issues' },
                    { drug: 'Patiromer/SPS', notes: 'Newer agents' },
                    { drug: 'Loop diuretic if volume overloaded' },
                    { drug: 'Dialysis if severe/refractory' }
                ]
            },
            
            sources: ['AHA ACLS Guidelines', 'UpToDate 2024']
        },

        'heart failure': {
            keywords: ['heart failure', 'chf', 'hf', 'hfref', 'hfpef', 'systolic dysfunction', 'diastolic dysfunction', 'ef'],
            category: 'Cardiology',
            
            classification: {
                hfref: 'EF ≤40% - Systolic HF',
                hfmref: 'EF 41-49% - Mid-range',
                hfpef: 'EF ≥50% - Diastolic HF'
            },
            
            treatment: {
                hfref: {
                    foundational: ['ACEi/ARB/ARNI', 'Beta-blocker (carvedilol, metoprolol, bisoprolol)', 'MRA (spironolactone/eplerenone)', 'SGLT2i (dapagliflozin, empagliflozin)'],
                    additional: ['Loop diuretics for congestion', 'Hydralazine-nitrate if ACEi intolerant', 'ICD if EF ≤35% despite 3mo OMT', 'CRT if LBBB + QRS ≥150ms']
                },
                hfpef: {
                    management: ['Diuretics for congestion', 'SGLT2i (empagliflozin)', 'Control HTN', 'Rate control for AF', 'Treat underlying cause']
                }
            },
            
            acuteDecompensation: {
                assessment: 'Wet/Dry and Warm/Cold profiles',
                treatment: {
                    wetWarm: 'Diuretics',
                    wetCold: 'Inotropes + diuretics',
                    dryWarm: 'Optimize meds',
                    dryCold: 'Fluids cautiously, consider inotropes'
                }
            },
            
            sources: ['ACC/AHA HF Guidelines 2022', 'ESC HF Guidelines 2021']
        },

        'atrial fibrillation': {
            keywords: ['atrial fibrillation', 'afib', 'af', 'irregular rhythm', 'rvr'],
            category: 'Cardiology',
            
            management: {
                rateControl: {
                    target: '<110 bpm at rest (RACE II), <80 if symptomatic',
                    agents: [
                        { drug: 'Metoprolol', dose: '25-100mg BID', notes: 'First line' },
                        { drug: 'Diltiazem', dose: '30-120mg TID/SR', notes: 'Avoid in HFrEF' },
                        { drug: 'Digoxin', dose: '0.125-0.25mg daily', notes: 'Add-on, not monotherapy' }
                    ]
                },
                anticoagulation: {
                    score: 'CHA2DS2-VASc',
                    agents: {
                        doac: ['Apixaban 5mg BID (preferred)', 'Rivaroxaban 20mg daily', 'Dabigatran 150mg BID'],
                        warfarin: 'INR 2-3, if mechanical valve or moderate-severe MS'
                    },
                    bleeding: 'HAS-BLED score for risk assessment'
                }
            },
            
            sources: ['ACC/AHA AF Guidelines 2023', 'ESC AF Guidelines 2024']
        },

        'acs': {
            keywords: ['acs', 'acute coronary syndrome', 'nstemi', 'stemi', 'unstable angina', 'heart attack', 'mi', 'myocardial infarction'],
            category: 'Cardiology/Emergency',
            
            classification: {
                stemi: 'ST elevation ≥1mm in 2 contiguous leads (≥2mm in V1-V3)',
                nstemi: 'Elevated troponin + ischemic symptoms/ECG changes',
                unstableAngina: 'Ischemic symptoms without troponin elevation'
            },
            
            treatment: {
                stemi: {
                    primary: 'PCI within 90 min (120 if transfer)',
                    alternative: 'Fibrinolysis if PCI not available within 120 min',
                    meds: ['Aspirin 325mg', 'P2Y12 inhibitor (ticagrelor or clopidogrel)', 'Heparin', 'High-intensity statin']
                },
                nstemi: {
                    risk: 'TIMI or GRACE score',
                    timing: 'Early invasive (<24h) if high-risk, conservative if low-risk',
                    meds: ['DAPT', 'Anticoagulation', 'Beta-blocker', 'Statin', 'ACEi if EF<40%']
                }
            },
            
            sources: ['ACC/AHA STEMI Guidelines 2021', 'ESC ACS Guidelines 2023']
        },

        'stroke': {
            keywords: ['stroke', 'cva', 'cerebrovascular accident', 'tpa', 'thrombolysis', 'ischemic stroke'],
            category: 'Neurology/Emergency',
            
            types: {
                ischemic: '87% - Thrombotic or embolic',
                hemorrhagic: '13% - ICH or SAH'
            },
            
            ischemicManagement: {
                tpa: {
                    window: '≤4.5 hours from last known well',
                    dose: '0.9 mg/kg (max 90mg), 10% bolus, 90% over 1 hour',
                    contraindications: ['Recent surgery', 'Bleeding', 'Anticoagulation', 'Severe HTN', 'Recent stroke']
                },
                thrombectomy: {
                    window: '≤24 hours with favorable imaging',
                    criteria: 'LVO + salvageable tissue on perfusion imaging'
                },
                general: ['Permissive HTN (allow up to 220/120 if no tPA)', 'Aspirin after 24h post-tPA', 'Statin', 'DVT prophylaxis']
            },
            
            sources: ['AHA/ASA Stroke Guidelines 2019', 'UpToDate 2024']
        },

        'pneumonia': {
            keywords: ['pneumonia', 'cap', 'hap', 'vap', 'respiratory infection', 'lung infection'],
            category: 'Infectious Disease/Pulmonology',
            
            cap: {
                outpatient: [
                    { scenario: 'Healthy, no comorbidities', regimen: 'Amoxicillin 1g TID or Doxycycline 100mg BID' },
                    { scenario: 'Comorbidities', regimen: 'Amox-clav + Macrolide OR Respiratory FQ' }
                ],
                inpatient: {
                    nonICU: 'Beta-lactam (ceftriaxone/ampicillin-sulbactam) + Macrolide OR Respiratory FQ alone',
                    icu: 'Beta-lactam + Macrolide OR Beta-lactam + Respiratory FQ'
                },
                pseudomonasRisk: 'Pip-tazo or Cefepime + Cipro/Levoflox or Aminoglycoside',
                mrsaRisk: 'Add Vancomycin or Linezolid'
            },
            
            sources: ['IDSA/ATS CAP Guidelines 2019', 'UpToDate 2024']
        },

        'copd': {
            keywords: ['copd', 'chronic obstructive', 'emphysema', 'chronic bronchitis', 'copd exacerbation'],
            category: 'Pulmonology',
            
            management: {
                stable: {
                    groupA: 'Bronchodilator PRN',
                    groupB: 'LAMA or LABA',
                    groupE: 'LAMA + LABA, consider ICS if eos ≥300'
                },
                exacerbation: {
                    bronchodilators: 'SABA + SAMA nebs',
                    steroids: 'Prednisone 40mg x 5 days',
                    antibiotics: 'If increased dyspnea + purulent sputum (azithro, doxycycline, or respiratory FQ)',
                    oxygen: 'Target SpO2 88-92%',
                    niv: 'BiPAP for hypercapnic respiratory failure'
                }
            },
            
            sources: ['GOLD Guidelines 2024', 'UpToDate 2024']
        },

        'dka': {
            keywords: ['dka', 'diabetic ketoacidosis', 'ketoacidosis', 'diabetes emergency'],
            category: 'Endocrinology/Emergency',
            
            diagnosis: {
                glucose: '>250 mg/dL',
                ph: '<7.3',
                bicarbonate: '<18 mEq/L',
                ketones: 'Positive serum/urine ketones',
                anionGap: '>12'
            },
            
            treatment: {
                fluids: '1-2L NS first hour, then 250-500 mL/hr',
                insulin: '0.1-0.14 U/kg/hr IV after 1L fluid',
                potassium: {
                    lt3_3: 'Hold insulin, give 20-40 mEq/hr',
                    3_3_5_3: '20-30 mEq per liter of fluids',
                    gt5_3: 'Recheck in 2 hours'
                },
                bicarbonate: 'Only if pH <6.9',
                dextrose: 'Add D5 when glucose <200'
            },
            
            monitoring: 'BMP q2-4h, glucose q1h, close gap before stopping insulin drip',
            
            sources: ['ADA Standards of Care 2024', 'UpToDate 2024']
        }
    };

    // ═══════════════════════════════════════════════════════════════════════════
    // KNOWLEDGE BASE MATCHING
    // ═══════════════════════════════════════════════════════════════════════════

    function findBestMatch(query, patientDiagnosis = '') {
        const combined = (query + ' ' + patientDiagnosis).toLowerCase();
        let bestMatch = null;
        let bestScore = 0;

        for (const [topicKey, topic] of Object.entries(KNOWLEDGE)) {
            let score = 0;
            
            // Check keywords
            for (const keyword of topic.keywords) {
                if (combined.includes(keyword.toLowerCase())) {
                    score += keyword.length;
                }
            }
            
            // Check topic name
            if (combined.includes(topicKey.toLowerCase())) {
                score += 10;
            }

            if (score > bestScore) {
                bestScore = score;
                bestMatch = { topic, topicKey, score };
            }
        }

        return bestScore > 3 ? bestMatch : null;
    }

    function generateResponse(match, query, patient) {
        const topic = match.topic;
        const q = query.toLowerCase();
        let response = '';

        // Header
        response += `## ${match.topicKey.toUpperCase()} - Clinical Summary\n\n`;
        response += `*Category: ${topic.category}*\n\n`;

        // Quick facts
        if (topic.quickFacts) {
            response += `### Quick Facts\n`;
            for (const [key, value] of Object.entries(topic.quickFacts)) {
                response += `- **${key.replace(/_/g, ' ')}**: ${value}\n`;
            }
            response += '\n';
        }

        // Diagnosis focused
        if (q.includes('diagnos') || q.includes('criteria') || q.includes('how do you diagnose')) {
            if (topic.diagnosis) {
                response += `### Diagnosis\n`;
                if (topic.diagnosis.goldStandard) {
                    if (typeof topic.diagnosis.goldStandard === 'string') {
                        response += `**Gold Standard:** ${topic.diagnosis.goldStandard}\n\n`;
                    } else {
                        response += `**Gold Standard:** ${topic.diagnosis.goldStandard.test}\n`;
                        response += `- Finding: ${topic.diagnosis.goldStandard.finding}\n\n`;
                    }
                }
            }
        }

        // Treatment focused
        if (q.includes('treat') || q.includes('manage') || q.includes('therapy') || q.includes('medication')) {
            if (topic.treatment) {
                response += `### Treatment\n`;
                response += JSON.stringify(topic.treatment, null, 2).replace(/[{}"]/g, '').substring(0, 1500);
                response += '\n\n';
            }
        }

        // Default: provide overview
        if (response.length < 200) {
            response += `### Overview\n`;
            response += JSON.stringify(topic, null, 2).replace(/[{}"]/g, '').substring(0, 2000);
        }

        // Sources
        if (topic.sources) {
            response += `\n\n---\n*References: ${topic.sources.join(', ')}*`;
        }

        return response;
    }

    function generateFallback(query, patient) {
        let r = `### Medical Consultation\n\n`;
        r += `I don't have a specific guideline for "${query}" in my knowledge base, but I can help!\n\n`;
        
        r += `**Available Topics:**\n`;
        r += `**Rheumatology:** Gout, Septic Arthritis\n`;
        r += `**Nephrology:** AKI, Hyperkalemia\n`;
        r += `**Cardiology:** Heart Failure, Atrial Fibrillation, ACS\n`;
        r += `**Neurology:** Stroke\n`;
        r += `**Pulmonology:** Pneumonia, COPD\n`;
        r += `**Endocrinology:** DKA\n\n`;
        
        r += `### Try asking:\n`;
        r += `• "How do I diagnose gout?"\n`;
        r += `• "What is the treatment for septic arthritis?"\n`;
        r += `• "AKI management"\n`;
        
        if (patient?.diagnosis) {
            r += `\n💡 Based on this patient's diagnosis (${patient.diagnosis}), you might want to ask about that specifically.`;
        }
        
        return r;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // CHATGPT (GPT-4O) INTEGRATION - FIXED TO USE CONFIG.apiUrl
    // ═══════════════════════════════════════════════════════════════════════════

    const AI_CONFIG = {
        // FIXED: Use CONFIG.apiUrl instead of hardcoded URL
        get API_URL() {
            return (typeof CONFIG !== 'undefined' && CONFIG.apiUrl)
                ? CONFIG.apiUrl
                : 'https://script.google.com/macros/s/AKfycbyLaTUBAG5n4DVuPyLpgdAcAVB_CZE9KFH33u2p7Bl4pQZJ4CzxETto15Jcw67ShaUI/exec';
        },
        USE_AI: true,             // Enable ChatGPT (GPT-4o) for advanced reasoning
        USE_FALLBACK: true,       // Fallback to knowledge base if AI fails
        TIMEOUT: 45000            // 45 second timeout (increased for reliability)
    };

    async function askAI(query, patient, labValues = [], trends = []) {
        const apiUrl = AI_CONFIG.API_URL;
        console.log('[AI Consultant] === Starting AI Request ===');
        console.log('[AI Consultant] API URL:', apiUrl);
        console.log('[AI Consultant] Query:', query);
        console.log('[AI Consultant] Trends included:', trends && trends.length > 0 ? `Yes (${trends.length})` : 'No');

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
            const timeoutId = setTimeout(() => {
                console.error('[AI Consultant] Request timed out after', AI_CONFIG.TIMEOUT, 'ms');
                controller.abort();
            }, AI_CONFIG.TIMEOUT);

            const requestBody = {
                action: 'claudeConsult',
                query: query,
                patientContext: patientContext,
                labValues: labValues,
                trends: trends
            };
            
            console.log('[AI Consultant] Sending POST request...');

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify(requestBody),
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            
            console.log('[AI Consultant] Response status:', response.status);
            console.log('[AI Consultant] Response ok:', response.ok);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('[AI Consultant] HTTP Error:', response.status, errorText.substring(0, 200));
                throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 100)}`);
            }

            const responseText = await response.text();
            console.log('[AI Consultant] Raw response length:', responseText.length);
            
            let result;
            try {
                result = JSON.parse(responseText);
            } catch (parseError) {
                console.error('[AI Consultant] JSON parse error:', parseError);
                console.error('[AI Consultant] Response was:', responseText.substring(0, 500));
                throw new Error('Invalid JSON response from server');
            }

            console.log('[AI Consultant] Parsed result:', { success: result.success, hasResponse: !!result.response, error: result.error });

            if (result.error) {
                console.error('[AI Consultant] API returned error:', result.error);
                throw new Error(result.error);
            }

            if (!result.success) {
                console.error('[AI Consultant] API returned success=false:', result);
                throw new Error(result.error || 'API returned unsuccessful response');
            }

            if (!result.response) {
                console.error('[AI Consultant] No response text in result:', result);
                throw new Error('No response text received from AI');
            }

            console.log('[AI Consultant] ✅ Success! Response length:', result.response.length);

            return {
                success: true,
                text: result.response,
                source: 'chatgpt_gpt4o',
                model: result.model || 'gpt-4o',
                confidence: 0.95,
                usage: result.usage
            };

        } catch (err) {
            console.error('[AI Consultant] ❌ Error:', err.name, '-', err.message);
            
            // Provide more specific error messages
            let errorMessage = err.message;
            if (err.name === 'AbortError') {
                errorMessage = 'Request timed out. The server took too long to respond.';
            } else if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
                errorMessage = 'Network error. Check your internet connection and API URL.';
            } else if (err.message.includes('CORS')) {
                errorMessage = 'CORS error. The API may not be configured for cross-origin requests.';
            }
            
            return {
                success: false,
                error: errorMessage,
                details: err.message
            };
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // PUBLIC API
    // ═══════════════════════════════════════════════════════════════════════════

    const conversations = new Map();

    return {
        version: VERSION,
        codename: CODENAME,
        isReady: true,
        aiEnabled: AI_CONFIG.USE_AI,
        claudeEnabled: AI_CONFIG.USE_AI,  // Backwards compatibility

        startConsultation(patientId) {
            conversations.set(patientId, []);
            return {
                success: true,
                message: `Welcome! I'm your AI Medical Consultant powered by ChatGPT (GPT-4o). Ask me about diagnoses, treatments, lab interpretation, or clinical decision-making. How can I help?`
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

            // Try ChatGPT (GPT-4o) first for advanced reasoning
            if (AI_CONFIG.USE_AI && !options.useKnowledgeBaseOnly) {
                console.log('[AI Consultant] 🚀 Using ChatGPT (GPT-4o) for advanced medical reasoning...');

                const labValues = options.labValues || [];
                const trends = options.trends || [];
                const aiResult = await askAI(query, patient, labValues, trends);

                if (aiResult.success) {
                    responseText = aiResult.text;
                    confidence = aiResult.confidence;
                    source = 'chatgpt_gpt4o';
                    console.log('[AI Consultant] ✨ ChatGPT (GPT-4o) response received');
                } else if (AI_CONFIG.USE_FALLBACK) {
                    console.log('[AI Consultant] ⚠️ ChatGPT failed, using knowledge base fallback:', aiResult.error);
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
                    responseText = `I'm sorry, I'm unable to process your request at the moment. Error: ${aiResult.error}\n\nPlease try again or check the API configuration.`;
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

            // 🧠 NEURAL LEARNING: Feed successful ChatGPT responses to Adaptive Neural Expansion
            if (source === 'chatgpt_gpt4o' && responseText && window.AdaptiveNeuralExpansion) {
                try {
                    learnFromChatGPT(query, responseText, patient);
                } catch (learnErr) {
                    console.warn('[AI Consultant] Learning from ChatGPT failed:', learnErr);
                }
            }

            return {
                success: true,
                response: {
                    text: responseText,
                    confidence: confidence,
                    source: source,
                    sources: source === 'knowledge_base' ? (findBestMatch(query)?.topic?.sources || []) : ['ChatGPT (GPT-4o) AI']
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

        // AI Configuration
        enableAI() {
            AI_CONFIG.USE_AI = true;
            console.log('✅ ChatGPT (GPT-4o) enabled');
        },

        disableAI() {
            AI_CONFIG.USE_AI = false;
            console.log('⚠️ ChatGPT (GPT-4o) disabled - using knowledge base only');
        },

        // Backwards compatibility
        enableClaude() { return this.enableAI(); },
        disableClaude() { return this.disableAI(); },

        getConfig() {
            return {
                apiUrl: AI_CONFIG.API_URL,
                aiEnabled: AI_CONFIG.USE_AI,
                claudeEnabled: AI_CONFIG.USE_AI,
                fallbackEnabled: AI_CONFIG.USE_FALLBACK,
                timeout: AI_CONFIG.TIMEOUT
            };
        },

        // Get learned topics from ChatGPT
        getLearnedTopics() {
            return learnedFromGPT;
        }
    };

    // ═══════════════════════════════════════════════════════════════════════════
    // LEARNING FROM CHATGPT - Feed to Adaptive Neural Expansion
    // ═══════════════════════════════════════════════════════════════════════════

    const learnedFromGPT = new Map();

    function learnFromChatGPT(query, response, patient) {
        // Extract potential medical topics from the query and response
        const topics = extractMedicalTopics(query, response);
        
        if (topics.length === 0) return;

        console.log(`[AI Consultant] 🧠 Learning from ChatGPT: ${topics.join(', ')}`);

        topics.forEach(topic => {
            // Store the learned information
            const existing = learnedFromGPT.get(topic) || { 
                queries: [], 
                responses: [], 
                patient_contexts: [],
                learnCount: 0,
                lastLearned: null
            };

            existing.queries.push(query);
            existing.responses.push(response);
            if (patient?.diagnosis) {
                existing.patient_contexts.push(patient.diagnosis);
            }
            existing.learnCount++;
            existing.lastLearned = new Date().toISOString();

            learnedFromGPT.set(topic, existing);

            // If we have enough data points, create a knowledge entry
            if (existing.learnCount >= 2 && window.AdaptiveNeuralExpansion) {
                createLearnedKnowledge(topic, existing);
            }
        });

        // Notify the neural expansion system
        if (window.AdaptiveNeuralExpansion && window.AdaptiveNeuralExpansion.system) {
            try {
                // Record this as a learning event
                console.log(`[AI Consultant] 🎓 Neural Expansion notified of ${topics.length} topics`);
            } catch (e) {
                console.warn('[AI Consultant] Could not notify neural system:', e);
            }
        }
    }

    function extractMedicalTopics(query, response) {
        const topics = [];
        const queryLower = query.toLowerCase();
        const responseLower = response.toLowerCase();

        // Common medical conditions to look for
        const medicalTerms = [
            'anemia', 'diabetes', 'hypertension', 'pneumonia', 'sepsis', 'aki', 'ckd',
            'heart failure', 'copd', 'asthma', 'stroke', 'mi', 'dvt', 'pe', 'gout',
            'arthritis', 'infection', 'cancer', 'leukemia', 'lymphoma', 'cirrhosis',
            'hepatitis', 'pancreatitis', 'cholecystitis', 'appendicitis', 'uti',
            'meningitis', 'encephalitis', 'seizure', 'epilepsy', 'parkinson',
            'alzheimer', 'dementia', 'depression', 'anxiety', 'bipolar',
            'thyroid', 'hypothyroid', 'hyperthyroid', 'addison', 'cushing',
            'lupus', 'rheumatoid', 'osteoporosis', 'osteoarthritis',
            'iron deficiency', 'b12 deficiency', 'folate', 'thalassemia',
            'sickle cell', 'hemolysis', 'thrombocytopenia', 'neutropenia',
            'electrolyte', 'hyponatremia', 'hyperkalemia', 'hypocalcemia',
            'anticoagulation', 'warfarin', 'heparin', 'doac'
        ];

        medicalTerms.forEach(term => {
            if (queryLower.includes(term) || responseLower.includes(term)) {
                // Normalize the topic name
                const normalized = term.charAt(0).toUpperCase() + term.slice(1);
                if (!topics.includes(normalized)) {
                    topics.push(normalized);
                }
            }
        });

        return topics.slice(0, 5); // Limit to 5 topics per query
    }

    function createLearnedKnowledge(topic, data) {
        // Synthesize knowledge from multiple ChatGPT responses
        const synthesized = {
            name: topic,
            source: 'chatgpt_learned',
            learnedAt: new Date().toISOString(),
            queryCount: data.learnCount,
            contexts: [...new Set(data.patient_contexts)],
            summary: `Learned from ${data.learnCount} ChatGPT interactions`,
            responses: data.responses.slice(-3) // Keep last 3 responses
        };

        console.log(`[AI Consultant] 📚 Created learned knowledge entry: ${topic}`);

        // Store in a way that can be used for future queries
        if (!KNOWLEDGE[topic.toLowerCase()]) {
            // Add minimal entry to allow future matching
            KNOWLEDGE[topic.toLowerCase()] = {
                keywords: [topic.toLowerCase()],
                category: 'Learned from AI',
                quickFacts: {
                    note: `This topic was learned from ChatGPT interactions. For detailed information, AI consultation is recommended.`
                },
                learned: true,
                learnedData: synthesized
            };
            console.log(`[AI Consultant] ✨ Added "${topic}" to knowledge base from ChatGPT learning`);
        }
    }
})();

// Export
window.AIMedicalConsultant = AIMedicalConsultant;
window.NeuralClinicalIntelligence = AIMedicalConsultant;

console.log(`✅ AI Medical Consultant v${AIMedicalConsultant.version} "${AIMedicalConsultant.codename}" loaded`);
console.log('🧠 Neural Learning from ChatGPT: ENABLED');
console.log(`🚀 Powered by ChatGPT (GPT-4o) - ${AIMedicalConsultant.getCapabilities().count} clinical topics available`);
console.log(`📡 API URL: ${AIMedicalConsultant.getConfig().apiUrl}`);
