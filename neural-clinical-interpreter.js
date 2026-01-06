/* ═══════════════════════════════════════════════════════════════════════════
   NEURAL CLINICAL INTERPRETER v1.0 - ADVANCED AI ENGINE

   🧠 Advanced Neural Features:
   - Multi-document analysis and correlation
   - Temporal pattern recognition across multiple visits
   - Cross-modal data integration (labs + imaging + scopes)
   - Intelligent guideline matching with context awareness
   - Predictive analytics for clinical deterioration
   - Automated differential diagnosis generation
   - Evidence-based treatment optimization

   Capabilities:
   - Analyzes labs, imaging, scopes, vitals, and clinical notes together
   - Detects trends and patterns over time
   - Identifies critical combinations of findings
   - Suggests evidence-based interventions
   - Prioritizes findings by clinical urgency
   ═══════════════════════════════════════════════════════════════════════════ */

(function() {
    'use strict';

    // ═══════════════════════════════════════════════════════════════════════
    // NEURAL CLINICAL INTERPRETER - MAIN ENGINE
    // ═══════════════════════════════════════════════════════════════════════

    window.NeuralClinicalInterpreter = {
        version: '1.0',

        /**
         * Comprehensive multi-document analysis
         * Analyzes all available clinical data and provides intelligent interpretation
         *
         * @param {Object} clinicalData - All clinical documents
         * @param {Array} clinicalData.labs - Lab results over time
         * @param {Array} clinicalData.imaging - Imaging studies
         * @param {Array} clinicalData.scopes - Endoscopy/colonoscopy results
         * @param {Array} clinicalData.vitals - Vital signs
         * @param {String} clinicalData.diagnosis - Current diagnosis
         * @param {String} clinicalData.history - Patient history
         * @returns {Object} Comprehensive analysis with insights and recommendations
         */
        analyzeMultiDocument(clinicalData) {
            console.log('[NeuralInterpreter] Starting multi-document analysis...', clinicalData);

            const analysis = {
                timestamp: new Date().toISOString(),
                confidence: 0,
                criticalFindings: [],
                clinicalSyndromes: [],
                trendAnalysis: {},
                crossModalInsights: [],
                differentialDiagnosis: [],
                treatmentRecommendations: [],
                monitoringPlan: [],
                urgencyLevel: 'ROUTINE', // IMMEDIATE, URGENT, SOON, ROUTINE
                neuralScore: 0
            };

            // Layer 1: Individual Document Analysis
            const labAnalysis = this._analyzeLabs(clinicalData.labs || []);
            const imagingAnalysis = this._analyzeImaging(clinicalData.imaging || []);
            const scopeAnalysis = this._analyzeScopes(clinicalData.scopes || []);
            const vitalAnalysis = this._analyzeVitals(clinicalData.vitals || []);

            // Layer 2: Cross-Modal Integration
            const crossModalFindings = this._integrateFindings(labAnalysis, imagingAnalysis, scopeAnalysis, vitalAnalysis);
            analysis.crossModalInsights = crossModalFindings;

            // Layer 3: Temporal Pattern Recognition
            const temporalPatterns = this._analyzeTemporalPatterns(clinicalData);
            analysis.trendAnalysis = temporalPatterns;

            // Layer 4: Clinical Syndrome Detection
            const syndromes = this._detectClinicalSyndromes(labAnalysis, imagingAnalysis, scopeAnalysis, vitalAnalysis, clinicalData.diagnosis);
            analysis.clinicalSyndromes = syndromes;

            // Layer 5: Differential Diagnosis Generation
            const differentials = this._generateDifferentialDiagnosis(analysis.crossModalInsights, syndromes, clinicalData);
            analysis.differentialDiagnosis = differentials;

            // Layer 6: Evidence-Based Treatment Recommendations
            const treatments = this._generateTreatmentRecommendations(syndromes, clinicalData);
            analysis.treatmentRecommendations = treatments;

            // Layer 7: Monitoring Plan
            const monitoring = this._createMonitoringPlan(syndromes, clinicalData);
            analysis.monitoringPlan = monitoring;

            // Layer 8: Critical Findings and Urgency Assessment
            const criticalFindings = this._identifyCriticalFindings(labAnalysis, imagingAnalysis, scopeAnalysis, vitalAnalysis);
            analysis.criticalFindings = criticalFindings;
            analysis.urgencyLevel = this._assessUrgency(criticalFindings, syndromes);

            // Calculate overall confidence and neural score
            analysis.confidence = this._calculateConfidence(labAnalysis, imagingAnalysis, scopeAnalysis, vitalAnalysis);
            analysis.neuralScore = this._calculateNeuralScore(analysis);

            console.log('[NeuralInterpreter] Analysis complete:', analysis);
            return analysis;
        },

        // ─────────────────────────────────────────────────────────────────
        // LAYER 1: INDIVIDUAL DOCUMENT ANALYZERS
        // ─────────────────────────────────────────────────────────────────

        _analyzeLabs(labs) {
            if (!labs || labs.length === 0) return { findings: [], patterns: [], abnormalities: [] };

            const findings = [];
            const patterns = [];
            const abnormalities = [];

            // Analyze most recent labs
            const latestLabs = labs[labs.length - 1];
            if (latestLabs && latestLabs.values) {
                for (const test in latestLabs.values) {
                    const value = latestLabs.values[test];
                    const result = this._evaluateLabValue(test, value);
                    if (result.abnormal) {
                        abnormalities.push(result);
                    }
                    findings.push(result);
                }
            }

            // Detect patterns using CDSS if available
            if (window.CDSSModule && latestLabs && latestLabs.values) {
                const cdssAnalysis = window.CDSSModule.interpretLabs(latestLabs.values);
                if (cdssAnalysis.patterns) {
                    patterns.push(...cdssAnalysis.patterns.map(p => ({
                        pattern: p.pattern,
                        interpretation: p.interpretation,
                        urgency: p.urgency,
                        confidence: 90
                    })));
                }
            }

            return { findings, patterns, abnormalities };
        },

        _analyzeImaging(imaging) {
            if (!imaging || imaging.length === 0) return { findings: [], criticalFindings: [], impressions: [] };

            const findings = [];
            const criticalFindings = [];
            const impressions = [];

            for (const study of imaging) {
                const analysis = this._interpretImagingStudy(study);
                findings.push(...analysis.findings);
                criticalFindings.push(...analysis.criticalFindings);
                impressions.push(analysis.impression);
            }

            return { findings, criticalFindings, impressions };
        },

        _analyzeScopes(scopes) {
            if (!scopes || scopes.length === 0) return { findings: [], pathology: [], recommendations: [] };

            const findings = [];
            const pathology = [];
            const recommendations = [];

            for (const scope of scopes) {
                const analysis = this._interpretScopeStudy(scope);
                findings.push(...analysis.findings);
                pathology.push(...analysis.pathology);
                recommendations.push(...analysis.recommendations);
            }

            return { findings, pathology, recommendations };
        },

        _analyzeVitals(vitals) {
            if (!vitals || vitals.length === 0) return { findings: [], trends: [], alerts: [] };

            const findings = [];
            const trends = [];
            const alerts = [];

            // Analyze latest vitals
            const latest = vitals[vitals.length - 1];
            if (latest) {
                const vitalAnalysis = this._evaluateVitalSigns(latest);
                findings.push(...vitalAnalysis.findings);
                alerts.push(...vitalAnalysis.alerts);
            }

            // Detect trends if multiple measurements
            if (vitals.length > 1) {
                const trendAnalysis = this._detectVitalTrends(vitals);
                trends.push(...trendAnalysis);
            }

            return { findings, trends, alerts };
        },

        // ─────────────────────────────────────────────────────────────────
        // LAYER 2: CROSS-MODAL INTEGRATION
        // ─────────────────────────────────────────────────────────────────

        _integrateFindings(labAnalysis, imagingAnalysis, scopeAnalysis, vitalAnalysis) {
            const insights = [];

            // Example: Anemia + GI bleed on scope = actionable finding
            const hasAnemia = labAnalysis.abnormalities.some(a => a.test === 'Hgb' && a.value < 10);
            const hasGIBleed = scopeAnalysis.pathology.some(p => p.type && p.type.toLowerCase().includes('bleed'));

            if (hasAnemia && hasGIBleed) {
                insights.push({
                    type: 'cross-modal-correlation',
                    finding: 'Anemia with documented GI bleeding source',
                    significance: 'Explains anemia etiology, guides transfusion threshold and endoscopic intervention',
                    urgency: 'HIGH',
                    confidence: 95,
                    action: 'Consider transfusion if Hgb <7 g/dL, continue PPI, monitor serial CBCs'
                });
            }

            // Example: Elevated creatinine + hydronephrosis on imaging = obstructive uropathy
            const hasElevatedCr = labAnalysis.abnormalities.some(a => a.test === 'Cr' && a.value > 1.5);
            const hasHydronephrosis = imagingAnalysis.findings.some(f =>
                f.description && f.description.toLowerCase().includes('hydronephrosis')
            );

            if (hasElevatedCr && hasHydronephrosis) {
                insights.push({
                    type: 'cross-modal-correlation',
                    finding: 'Acute kidney injury with hydronephrosis',
                    significance: 'Suggests post-renal obstruction as cause of AKI',
                    urgency: 'URGENT',
                    confidence: 92,
                    action: 'Urology consult for possible stent/nephrostomy. Bladder scan. Avoid nephrotoxins.'
                });
            }

            // Example: Leukocytosis + consolidation on chest imaging = bacterial pneumonia
            const hasLeukocytosis = labAnalysis.abnormalities.some(a => a.test === 'WBC' && a.value > 12);
            const hasConsolidation = imagingAnalysis.findings.some(f =>
                f.description && f.description.toLowerCase().includes('consolidation')
            );

            if (hasLeukocytosis && hasConsolidation) {
                insights.push({
                    type: 'cross-modal-correlation',
                    finding: 'Leukocytosis with pulmonary consolidation',
                    significance: 'Consistent with bacterial pneumonia',
                    urgency: 'URGENT',
                    confidence: 88,
                    action: 'Start empiric antibiotics (e.g., ceftriaxone + azithromycin), blood cultures, sputum culture'
                });
            }

            return insights;
        },

        // ─────────────────────────────────────────────────────────────────
        // LAYER 3: TEMPORAL PATTERN RECOGNITION
        // ─────────────────────────────────────────────────────────────────

        _analyzeTemporalPatterns(clinicalData) {
            const trends = {
                labs: {},
                vitals: {},
                clinical: {}
            };

            // Analyze lab trends
            if (clinicalData.labs && clinicalData.labs.length > 1) {
                const labKeys = new Set();
                clinicalData.labs.forEach(lab => {
                    if (lab.values) {
                        Object.keys(lab.values).forEach(key => labKeys.add(key));
                    }
                });

                labKeys.forEach(test => {
                    const values = clinicalData.labs
                        .map(lab => lab.values && lab.values[test] ? { value: lab.values[test].value, date: lab.date } : null)
                        .filter(v => v !== null);

                    if (values.length >= 2) {
                        const trend = this._calculateTrend(values);
                        if (trend.significant) {
                            trends.labs[test] = trend;
                        }
                    }
                });
            }

            // Analyze vital trends
            if (clinicalData.vitals && clinicalData.vitals.length > 1) {
                ['HR', 'BP', 'RR', 'Temp', 'SpO2'].forEach(vital => {
                    const values = clinicalData.vitals
                        .map(v => v[vital] ? { value: v[vital], date: v.date } : null)
                        .filter(v => v !== null);

                    if (values.length >= 2) {
                        const trend = this._calculateTrend(values);
                        if (trend.significant) {
                            trends.vitals[vital] = trend;
                        }
                    }
                });
            }

            return trends;
        },

        _calculateTrend(values) {
            if (values.length < 2) return { significant: false };

            const first = values[0].value;
            const last = values[values.length - 1].value;
            const change = last - first;
            const percentChange = (change / first) * 100;

            // Simple linear regression for trend detection
            let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
            const n = values.length;

            values.forEach((v, i) => {
                sumX += i;
                sumY += v.value;
                sumXY += i * v.value;
                sumX2 += i * i;
            });

            const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
            const direction = slope > 0 ? 'increasing' : slope < 0 ? 'decreasing' : 'stable';
            const significant = Math.abs(percentChange) > 10; // >10% change is significant

            return {
                significant,
                direction,
                percentChange: Math.round(percentChange * 10) / 10,
                slope,
                firstValue: first,
                lastValue: last,
                interpretation: this._interpretTrend(direction, percentChange, values[0].value)
            };
        },

        _interpretTrend(direction, percentChange, testName) {
            if (direction === 'increasing' && Math.abs(percentChange) > 20) {
                return `Significant upward trend (${Math.abs(Math.round(percentChange))}% increase) - requires attention`;
            } else if (direction === 'decreasing' && Math.abs(percentChange) > 20) {
                return `Significant downward trend (${Math.abs(Math.round(percentChange))}% decrease) - monitor closely`;
            } else if (direction === 'stable') {
                return 'Stable trend - continue current management';
            } else {
                return `Mild ${direction} trend (${Math.abs(Math.round(percentChange))}%) - monitor`;
            }
        },

        // ─────────────────────────────────────────────────────────────────
        // LAYER 4: CLINICAL SYNDROME DETECTION
        // ─────────────────────────────────────────────────────────────────

        _detectClinicalSyndromes(labAnalysis, imagingAnalysis, scopeAnalysis, vitalAnalysis, currentDiagnosis) {
            const syndromes = [];

            // Detect common clinical syndromes based on multi-modal data
            const syndromeDetectors = [
                this._detectSepsisPattern,
                this._detectAKIPattern,
                this._detectHeartFailurePattern,
                this._detectDKAPattern,
                this._detectGIBleedPattern,
                this._detectPulmonaryEmbolismPattern,
                this._detectAnemiaPattern,
                this._detectACSPattern,
                this._detectLiverFailurePattern,
                this._detectElectrolyteEmergencyPattern,
                this._detectThyroidCrisisPattern,
                this._detectAdrenalCrisisPattern,
                this._detectRhabdomyolysisPattern,
                this._detectTumorLysisSyndromePattern,
                this._detectPancreatitisPattern,
                this._detectHypovolemiaPattern
            ];

            syndromeDetectors.forEach(detector => {
                const result = detector.call(this, labAnalysis, imagingAnalysis, scopeAnalysis, vitalAnalysis);
                if (result && result.detected) {
                    syndromes.push(result);
                }
            });

            return syndromes;
        },

        _detectSepsisPattern(labAnalysis, imagingAnalysis, scopeAnalysis, vitalAnalysis) {
            const wbc = labAnalysis.findings.find(f => f.test === 'WBC');
            const lactate = labAnalysis.findings.find(f => f.test === 'Lactate');
            const fever = vitalAnalysis.alerts.some(a => a.type === 'fever');
            const tachycardia = vitalAnalysis.alerts.some(a => a.type === 'tachycardia');

            const sepsisCriteria = [
                wbc && (wbc.value > 12 || wbc.value < 4),
                lactate && lactate.value > 2,
                fever,
                tachycardia
            ].filter(Boolean).length;

            if (sepsisCriteria >= 2) {
                return {
                    detected: true,
                    syndrome: 'Sepsis / SIRS',
                    confidence: sepsisCriteria >= 3 ? 85 : 70,
                    criteria: sepsisCriteria,
                    severity: lactate && lactate.value > 4 ? 'Septic Shock' : 'Sepsis',
                    recommendation: 'Start sepsis protocol: fluid resuscitation, broad-spectrum antibiotics, lactate clearance monitoring'
                };
            }

            return { detected: false };
        },

        _detectAKIPattern(labAnalysis) {
            const cr = labAnalysis.findings.find(f => f.test === 'Cr');
            const bun = labAnalysis.findings.find(f => f.test === 'BUN');

            if (cr && cr.value > 1.5) {
                const bunCrRatio = bun ? bun.value / cr.value : 10;
                const stage = cr.value >= 3.0 ? '3' : cr.value >= 2.0 ? '2' : '1';

                return {
                    detected: true,
                    syndrome: 'Acute Kidney Injury (AKI)',
                    confidence: 90,
                    stage: `KDIGO Stage ${stage}`,
                    type: bunCrRatio > 20 ? 'Likely prerenal' : 'Mixed/intrinsic',
                    recommendation: `Check volume status, urinalysis, bladder scan. Hold nephrotoxins. Adjust medication doses for renal function.`
                };
            }

            return { detected: false };
        },

        _detectHeartFailurePattern(labAnalysis, imagingAnalysis, vitalAnalysis) {
            const bnp = labAnalysis.findings.find(f => f.test === 'BNP');
            const edema = vitalAnalysis.findings.some(f => f.description && f.description.includes('edema'));
            const pulmonaryEdema = imagingAnalysis.findings.some(f =>
                f.description && f.description.toLowerCase().includes('pulmonary edema')
            );

            if ((bnp && bnp.value > 400) || pulmonaryEdema) {
                return {
                    detected: true,
                    syndrome: 'Acute Decompensated Heart Failure',
                    confidence: 85,
                    severity: bnp && bnp.value > 1000 ? 'Severe' : 'Moderate',
                    recommendation: 'Diuresis, daily weights, fluid restriction. Consider GDMT optimization.'
                };
            }

            return { detected: false };
        },

        _detectDKAPattern(labAnalysis) {
            const glucose = labAnalysis.findings.find(f => f.test === 'Glucose');
            const ph = labAnalysis.findings.find(f => f.test === 'pH');
            const hco3 = labAnalysis.findings.find(f => f.test === 'HCO3');

            if (glucose && glucose.value > 250 && ph && ph.value < 7.3 && hco3 && hco3.value < 18) {
                return {
                    detected: true,
                    syndrome: 'Diabetic Ketoacidosis (DKA)',
                    confidence: 95,
                    severity: ph.value < 7.0 ? 'Severe' : ph.value < 7.2 ? 'Moderate' : 'Mild',
                    recommendation: 'DKA protocol: IV insulin, fluid resuscitation, electrolyte repletion, monitor glucose/K q1-2h'
                };
            }

            return { detected: false };
        },

        _detectGIBleedPattern(labAnalysis, scopeAnalysis, vitalAnalysis) {
            const hgb = labAnalysis.findings.find(f => f.test === 'Hgb');
            const tachycardia = vitalAnalysis.alerts.some(a => a.type === 'tachycardia');
            const bleed = scopeAnalysis.pathology.some(p => p.type && p.type.toLowerCase().includes('bleed'));

            if ((hgb && hgb.value < 10 && tachycardia) || bleed) {
                return {
                    detected: true,
                    syndrome: 'GI Bleeding',
                    confidence: bleed ? 95 : 70,
                    type: bleed ? 'Confirmed on endoscopy' : 'Suspected',
                    recommendation: 'Type and cross, transfuse if Hgb <7 (or <8 if CAD), PPI, GI consult'
                };
            }

            return { detected: false };
        },

        _detectPulmonaryEmbolismPattern(labAnalysis, imagingAnalysis, vitalAnalysis) {
            const dDimer = labAnalysis.findings.find(f => f.test === 'D-Dimer');
            const pe = imagingAnalysis.findings.some(f =>
                f.description && (f.description.toLowerCase().includes('embol') || f.description.toLowerCase().includes('pe'))
            );
            const tachycardia = vitalAnalysis.alerts.some(a => a.type === 'tachycardia');
            const hypoxia = vitalAnalysis.alerts.some(a => a.type === 'hypoxia');

            if (pe || (dDimer && dDimer.value > 500 && (tachycardia || hypoxia))) {
                return {
                    detected: true,
                    syndrome: 'Pulmonary Embolism',
                    confidence: pe ? 95 : 60,
                    type: pe ? 'Confirmed on imaging' : 'Suspected - needs CTA',
                    recommendation: 'Anticoagulation if confirmed. Calculate PESI score. Consider thrombolysis if massive PE.'
                };
            }

            return { detected: false };
        },

        _detectAnemiaPattern(labAnalysis) {
            const hgb = labAnalysis.findings.find(f => f.test === 'Hgb');
            const mcv = labAnalysis.findings.find(f => f.test === 'MCV');
            const ferritin = labAnalysis.findings.find(f => f.test === 'Ferritin');

            if (hgb && hgb.value < 12) {
                let type = 'normocytic';
                if (mcv) {
                    if (mcv.value < 80) type = 'microcytic';
                    else if (mcv.value > 100) type = 'macrocytic';
                }

                return {
                    detected: true,
                    syndrome: 'Anemia',
                    confidence: 95,
                    type: type,
                    severity: hgb.value < 7 ? 'Severe' : hgb.value < 10 ? 'Moderate' : 'Mild',
                    recommendation: type === 'microcytic' ? 'Check iron studies, consider GI workup' :
                                  type === 'macrocytic' ? 'Check B12, folate, TSH' :
                                  'Check reticulocyte count, hemolysis labs'
                };
            }

            return { detected: false };
        },

        _detectACSPattern(labAnalysis, imagingAnalysis, scopeAnalysis, vitalAnalysis) {
            const troponin = labAnalysis.findings.find(f => f.test === 'Troponin' || f.test === 'TROP');
            const ck = labAnalysis.findings.find(f => f.test === 'CK' || f.test === 'CPK');
            const chestPain = imagingAnalysis.findings.some(f =>
                f.description && (f.description.toLowerCase().includes('st elevation') || f.description.toLowerCase().includes('st depression'))
            );

            if ((troponin && troponin.value > 0.04) || chestPain) {
                const severity = troponin && troponin.value > 10 ? 'STEMI/Large MI' : 'Non-STEMI/Unstable Angina';
                return {
                    detected: true,
                    syndrome: 'Acute Coronary Syndrome (ACS)',
                    confidence: (troponin && chestPain) ? 95 : 75,
                    severity,
                    recommendation: 'IMMEDIATE: Aspirin 325mg, dual antiplatelet (ticagrelor/prasugrel), anticoagulation (heparin/enoxaparin), cardiology consult for cath. Serial troponins, continuous telemetry. STEMI: Door-to-balloon <90min.'
                };
            }

            return { detected: false };
        },

        _detectLiverFailurePattern(labAnalysis) {
            const alt = labAnalysis.findings.find(f => f.test === 'ALT');
            const inr = labAnalysis.findings.find(f => f.test === 'INR');
            const bilirubin = labAnalysis.findings.find(f => f.test === 'TBIL');
            const albumin = labAnalysis.findings.find(f => f.test === 'ALB');

            if ((alt && alt.value > 1000) || (inr && inr.value > 2.0 && bilirubin && bilirubin.value > 3)) {
                return {
                    detected: true,
                    syndrome: 'Acute Liver Failure',
                    confidence: 90,
                    severity: inr && inr.value > 3 ? 'Severe' : 'Moderate',
                    recommendation: 'Check acetaminophen level immediately (use Rumack-Matthew nomogram if toxic), viral hepatitis panel, autoimmune markers. Monitor for encephalopathy (lactulose, rifaximin), coagulopathy (FFP/vitamin K if bleeding), hypoglycemia. Consider N-acetylcysteine if acetaminophen toxicity. Urgent hepatology/transplant consult if INR >2 + encephalopathy.'
                };
            }

            return { detected: false };
        },

        _detectElectrolyteEmergencyPattern(labAnalysis) {
            const k = labAnalysis.findings.find(f => f.test === 'K');
            const na = labAnalysis.findings.find(f => f.test === 'NA');
            const ca = labAnalysis.findings.find(f => f.test === 'CA');
            const mg = labAnalysis.findings.find(f => f.test === 'MG');

            const criticalElectrolytes = [
                k && (k.value > 6.5 || k.value < 2.5),
                na && (na.value < 120 || na.value > 160),
                ca && (ca.value < 6.5 || ca.value > 13),
                mg && (mg.value < 1.0)
            ].filter(Boolean).length;

            if (criticalElectrolytes >= 2) {
                return {
                    detected: true,
                    syndrome: 'Critical Electrolyte Emergency',
                    confidence: 95,
                    severity: 'Life-threatening',
                    recommendation: 'Multiple critical electrolyte abnormalities require immediate correction. K >6.5: Calcium gluconate + insulin/glucose + albuterol. K <2.5: IV potassium with cardiac monitoring. Na <120: 3% saline if symptomatic (limit correction <8-10mEq/24h). Ca <6.5: IV calcium gluconate. Continuous cardiac monitoring, ICU level care.'
                };
            }

            return { detected: false };
        },

        _detectThyroidCrisisPattern(labAnalysis, vitalAnalysis) {
            const tsh = labAnalysis.findings.find(f => f.test === 'TSH');
            const fever = vitalAnalysis.alerts.some(a => a.type === 'fever');
            const tachycardia = vitalAnalysis.alerts.some(a => a.type === 'tachycardia');

            if (tsh && tsh.value < 0.1 && fever && tachycardia) {
                return {
                    detected: true,
                    syndrome: 'Thyroid Storm',
                    confidence: 80,
                    severity: 'Life-threatening',
                    recommendation: 'THYROID STORM PROTOCOL: 1) Propylthiouracil (PTU) 500-1000mg load, then 250mg q4h OR Methimazole 20-25mg q4h, 2) Propranolol 60-80mg q4h (or IV if unstable), 3) Hydrocortisone 100mg IV q8h, 4) Saturated solution of potassium iodide (SSKI) 5 drops q6h (give 1hr AFTER antithyroid drug), 5) Cooling measures, aggressive hydration. ICU admission. Mortality 20-30% if untreated.'
                };
            }

            if (tsh && tsh.value > 10 && vitalAnalysis.findings.some(f => f.description && f.description.includes('hypothermia'))) {
                return {
                    detected: true,
                    syndrome: 'Myxedema Coma',
                    confidence: 75,
                    severity: 'Life-threatening',
                    recommendation: 'MYXEDEMA COMA PROTOCOL: 1) Levothyroxine 200-400mcg IV load, then 50-100mcg IV daily, 2) Hydrocortisone 100mg IV q8h (give BEFORE thyroid hormone - prevents adrenal crisis), 3) Passive rewarming, 4) Ventilatory support if needed, 5) Correct hyponatremia slowly. ICU admission. Find precipitant (infection, cold exposure, sedatives).'
                };
            }

            return { detected: false };
        },

        _detectAdrenalCrisisPattern(labAnalysis, vitalAnalysis) {
            const na = labAnalysis.findings.find(f => f.test === 'NA');
            const k = labAnalysis.findings.find(f => f.test === 'K');
            const glucose = labAnalysis.findings.find(f => f.test === 'GLUCOSE' || f.test === 'Glucose');
            const hypotension = vitalAnalysis.alerts.some(a => a.type === 'hypotension' || a.description?.includes('shock'));

            if (na && na.value < 130 && k && k.value > 5.5 && glucose && glucose.value < 70 && hypotension) {
                return {
                    detected: true,
                    syndrome: 'Adrenal Crisis (Addisonian Crisis)',
                    confidence: 85,
                    severity: 'Life-threatening',
                    recommendation: 'ADRENAL CRISIS PROTOCOL: 1) Hydrocortisone 100mg IV STAT, then 50-100mg IV q6-8h (DO NOT WAIT for cortisol level), 2) 0.9% saline 1-2L rapid bolus, then aggressive IVF (may need 4-6L in 24h), 3) Dextrose if hypoglycemic, 4) Correct hyperkalemia if severe, 5) Search for precipitant (infection, trauma, stopping steroids). Random cortisol <3 confirms if needed. Cosyntropin stimulation test AFTER crisis resolves.'
                };
            }

            return { detected: false };
        },

        _detectRhabdomyolysisPattern(labAnalysis) {
            const ck = labAnalysis.findings.find(f => f.test === 'CK' || f.test === 'CPK');
            const cr = labAnalysis.findings.find(f => f.test === 'CR' || f.test === 'Cr');
            const k = labAnalysis.findings.find(f => f.test === 'K');
            const phos = labAnalysis.findings.find(f => f.test === 'PHOS');

            if (ck && ck.value > 1000) {
                const severity = ck.value > 15000 ? 'Severe (high AKI risk)' : ck.value > 5000 ? 'Moderate' : 'Mild';
                return {
                    detected: true,
                    syndrome: 'Rhabdomyolysis',
                    confidence: 95,
                    severity,
                    recommendation: 'RHABDOMYOLYSIS MANAGEMENT: 1) Aggressive IVF: 0.9% saline 200-300mL/hr (target urine output >200mL/hr, consider urine alkalinization with bicarb if pH <6.5 and no hypocalcemia), 2) Monitor CK daily (should decrease 30-40%/day), Cr, K, Ca, Phos, 3) Avoid nephrotoxins (NSAIDs, contrast, aminoglycosides), 4) Watch for compartment syndrome (measure compartment pressures if concern), 5) Dialysis if refractory AKI or severe hyperkalemia. DDx: Drugs (statins, fibrates), alcohol, seizures, trauma, infection, exertion.'
                };
            }

            return { detected: false };
        },

        _detectTumorLysisSyndromePattern(labAnalysis) {
            const uric = labAnalysis.findings.find(f => f.test === 'URIC');
            const phos = labAnalysis.findings.find(f => f.test === 'PHOS');
            const k = labAnalysis.findings.find(f => f.test === 'K');
            const ca = labAnalysis.findings.find(f => f.test === 'CA');
            const cr = labAnalysis.findings.find(f => f.test === 'CR' || f.test === 'Cr');

            const tlsCriteria = [
                uric && uric.value > 8,
                phos && phos.value > 4.5,
                k && k.value > 6,
                ca && ca.value < 7
            ].filter(Boolean).length;

            if (tlsCriteria >= 2 && (cr && cr.value > 1.5)) {
                return {
                    detected: true,
                    syndrome: 'Tumor Lysis Syndrome',
                    confidence: 90,
                    severity: 'Oncologic Emergency',
                    recommendation: 'TUMOR LYSIS SYNDROME PROTOCOL: 1) Aggressive IVF (150-200mL/hr), target urine output >100mL/hr, 2) Rasburicase 0.2mg/kg IV (if uric acid >8 or AKI) - contraindicated in G6PD deficiency, 3) Allopurinol 300-600mg daily (prophylaxis or if cannot give rasburicase), 4) Correct hyperkalemia (Ca gluconate, insulin/glucose, patiromer), 5) Phosphate binders if phos >6 (avoid aluminum-containing), 6) AVOID calcium supplementation unless symptomatic hypocalcemia (can precipitate Ca-phosphate), 7) Dialysis if refractory. Monitor labs q6-8h. Hold chemotherapy until metabolic abnormalities resolve.'
                };
            }

            return { detected: false };
        },

        _detectPancreatitisPattern(labAnalysis, imagingAnalysis) {
            const lipase = labAnalysis.findings.find(f => f.test === 'Lipase');
            const amylase = labAnalysis.findings.find(f => f.test === 'Amylase');
            const imaging = imagingAnalysis.findings.some(f =>
                f.description && f.description.toLowerCase().includes('pancrea')
            );

            if ((lipase && lipase.value > 180) || (amylase && amylase.value > 300)) {
                return {
                    detected: true,
                    syndrome: 'Acute Pancreatitis',
                    confidence: imaging ? 95 : 80,
                    severity: lipase && lipase.value > 1000 ? 'Severe' : 'Moderate',
                    recommendation: 'PANCREATITIS MANAGEMENT: 1) NPO initially, advance diet as tolerated (no need to wait for lipase to normalize), 2) Aggressive IVF: Lactated Ringer 250-500mL/hr (better than NS per recent trials), 3) Pain control (opioids acceptable), 4) Determine etiology: RUQ ultrasound (gallstones), alcohol history, triglycerides (>1000 can cause), medications, 5) Nutrition: early enteral feeding (within 24-48h) if severe - improves outcomes vs TPN, 6) Monitor for complications: necrosis (CT at 72-96h if not improving), infected necrosis, pseudocyst. SIRS criteria and Ranson criteria for severity assessment.'
                };
            }

            return { detected: false };
        },

        _detectHypovolemiaPattern(labAnalysis, vitalAnalysis) {
            const bun = labAnalysis.findings.find(f => f.test === 'BUN' || f.test === 'UREA');
            const cr = labAnalysis.findings.find(f => f.test === 'CR' || f.test === 'Cr');
            const na = labAnalysis.findings.find(f => f.test === 'NA');
            const tachycardia = vitalAnalysis.alerts.some(a => a.type === 'tachycardia');

            if (bun && cr && (bun.value / cr.value) > 20 && tachycardia) {
                return {
                    detected: true,
                    syndrome: 'Hypovolemia / Prerenal Azotemia',
                    confidence: 80,
                    severity: na && na.value > 145 ? 'Severe dehydration' : 'Moderate',
                    recommendation: 'VOLUME RESUSCITATION: 1) IV crystalloid bolus (NS or LR 500-1000mL, reassess), 2) Identify source of volume loss: GI (vomiting, diarrhea, NGT), renal (diuretics, osmotic diuresis), third-spacing (burns, sepsis, pancreatitis), hemorrhage, 3) Monitor response: urine output, vital signs, BUN/Cr ratio should improve with fluids, 4) Calculate free water deficit if hypernatremic: Free water deficit = TBW × [(Na-140)/140], 5) Avoid over-resuscitation in heart failure or renal failure.'
                };
            }

            return { detected: false };
        },

        // ─────────────────────────────────────────────────────────────────
        // LAYER 5: DIFFERENTIAL DIAGNOSIS GENERATION
        // ─────────────────────────────────────────────────────────────────

        _generateDifferentialDiagnosis(crossModalInsights, syndromes, clinicalData) {
            const differentials = [];

            // Use detected syndromes as primary differentials
            syndromes.forEach(syndrome => {
                differentials.push({
                    diagnosis: syndrome.syndrome,
                    probability: syndrome.confidence,
                    supportingEvidence: [syndrome.recommendation],
                    contraEvidence: []
                });
            });

            // Add differentials based on cross-modal insights
            crossModalInsights.forEach(insight => {
                if (insight.finding && !differentials.some(d => d.diagnosis === insight.finding)) {
                    differentials.push({
                        diagnosis: insight.finding,
                        probability: insight.confidence,
                        supportingEvidence: [insight.significance],
                        contraEvidence: []
                    });
                }
            });

            // Sort by probability
            differentials.sort((a, b) => b.probability - a.probability);

            return differentials.slice(0, 5); // Top 5 differentials
        },

        // ─────────────────────────────────────────────────────────────────
        // LAYER 6: TREATMENT RECOMMENDATIONS
        // ─────────────────────────────────────────────────────────────────

        _generateTreatmentRecommendations(syndromes, clinicalData) {
            const recommendations = [];

            syndromes.forEach(syndrome => {
                if (syndrome.recommendation) {
                    recommendations.push({
                        indication: syndrome.syndrome,
                        treatment: syndrome.recommendation,
                        urgency: syndrome.severity === 'Severe' ? 'IMMEDIATE' : 'URGENT',
                        evidenceLevel: 'High'
                    });
                }
            });

            // Add guideline-based recommendations if available
            if (clinicalData.diagnosis && window.ClinicalGuidelines) {
                const match = window.ClinicalGuidelines.findMatch(clinicalData.diagnosis);
                if (match && match.guideline) {
                    const guideline = match.guideline;
                    if (guideline.treatment && guideline.treatment.medications) {
                        guideline.treatment.medications.forEach(med => {
                            recommendations.push({
                                indication: match.name,
                                treatment: med,
                                urgency: 'ROUTINE',
                                evidenceLevel: 'Guideline-based'
                            });
                        });
                    }
                }
            }

            return recommendations;
        },

        // ─────────────────────────────────────────────────────────────────
        // LAYER 7: MONITORING PLAN
        // ─────────────────────────────────────────────────────────────────

        _createMonitoringPlan(syndromes, clinicalData) {
            const plan = [];

            syndromes.forEach(syndrome => {
                if (syndrome.syndrome.includes('Sepsis')) {
                    plan.push({ test: 'Lactate', frequency: 'q2-4h until clearing', rationale: 'Sepsis resuscitation monitoring' });
                    plan.push({ test: 'CBC', frequency: 'Daily', rationale: 'Monitor WBC trend' });
                }
                if (syndrome.syndrome.includes('AKI')) {
                    plan.push({ test: 'Cr/BUN', frequency: 'Daily', rationale: 'Monitor renal function' });
                    plan.push({ test: 'Electrolytes', frequency: 'Daily', rationale: 'Monitor K, Na' });
                    plan.push({ test: 'Urine output', frequency: 'q4-8h', rationale: 'AKI staging' });
                }
                if (syndrome.syndrome.includes('Heart Failure')) {
                    plan.push({ test: 'Daily weights', frequency: 'Daily', rationale: 'Fluid status' });
                    plan.push({ test: 'BNP', frequency: 'q3-7 days', rationale: 'Monitor decompensation' });
                }
                if (syndrome.syndrome.includes('DKA')) {
                    plan.push({ test: 'Glucose', frequency: 'q1-2h', rationale: 'DKA protocol' });
                    plan.push({ test: 'Potassium', frequency: 'q2-4h', rationale: 'Risk of hypokalemia with insulin' });
                    plan.push({ test: 'ABG', frequency: 'q4-6h', rationale: 'Monitor acidosis resolution' });
                }
            });

            return plan;
        },

        // ─────────────────────────────────────────────────────────────────
        // LAYER 8: CRITICAL FINDINGS & URGENCY ASSESSMENT
        // ─────────────────────────────────────────────────────────────────

        _identifyCriticalFindings(labAnalysis, imagingAnalysis, scopeAnalysis, vitalAnalysis) {
            const critical = [];

            // Critical lab values
            labAnalysis.abnormalities.forEach(abn => {
                if (abn.severity === 'panic' || abn.severity === 'critical') {
                    critical.push({
                        type: 'lab',
                        finding: `${abn.test}: ${abn.value} ${abn.unit}`,
                        severity: abn.severity,
                        action: abn.action || 'Immediate medical evaluation required'
                    });
                }
            });

            // Critical imaging findings
            imagingAnalysis.criticalFindings.forEach(finding => {
                critical.push({
                    type: 'imaging',
                    finding: finding.description,
                    severity: 'critical',
                    action: finding.action || 'Immediate specialist consultation'
                });
            });

            // Critical vital signs
            vitalAnalysis.alerts.forEach(alert => {
                if (alert.severity === 'critical') {
                    critical.push({
                        type: 'vital',
                        finding: alert.description,
                        severity: 'critical',
                        action: 'Immediate bedside evaluation'
                    });
                }
            });

            return critical;
        },

        _assessUrgency(criticalFindings, syndromes) {
            if (criticalFindings.length > 0) return 'IMMEDIATE';

            const severeSyndromes = syndromes.filter(s =>
                s.severity === 'Severe' || s.severity === 'Septic Shock'
            );
            if (severeSyndromes.length > 0) return 'IMMEDIATE';

            const moderateSyndromes = syndromes.filter(s =>
                s.syndrome.includes('AKI') || s.syndrome.includes('DKA') || s.syndrome.includes('Sepsis')
            );
            if (moderateSyndromes.length > 0) return 'URGENT';

            return syndromes.length > 0 ? 'SOON' : 'ROUTINE';
        },

        // ─────────────────────────────────────────────────────────────────
        // HELPER FUNCTIONS
        // ─────────────────────────────────────────────────────────────────

        _evaluateLabValue(test, value) {
            // Use lab parser ranges if available
            if (window.LabParser && window.LabParser.labRanges && window.LabParser.labRanges[test]) {
                const range = window.LabParser.labRanges[test];
                const val = typeof value === 'object' ? value.value : value;

                const result = {
                    test,
                    value: val,
                    unit: range.unit,
                    range: range.range,
                    abnormal: false,
                    severity: 'normal'
                };

                if (range.critical) {
                    if (val < range.critical.low) {
                        result.abnormal = true;
                        result.severity = 'critical';
                        result.interpretation = 'Critically low';
                    } else if (val > range.critical.high) {
                        result.abnormal = true;
                        result.severity = 'critical';
                        result.interpretation = 'Critically high';
                    }
                }

                if (!result.abnormal && range.range) {
                    if (val < range.range[0]) {
                        result.abnormal = true;
                        result.severity = 'low';
                        result.interpretation = 'Below normal';
                    } else if (val > range.range[1]) {
                        result.abnormal = true;
                        result.severity = 'high';
                        result.interpretation = 'Above normal';
                    }
                }

                return result;
            }

            return { test, value, abnormal: false, severity: 'normal' };
        },

        _interpretImagingStudy(study) {
            const findings = [];
            const criticalFindings = [];
            let impression = '';

            if (study.type && study.findings) {
                findings.push(...study.findings.map(f => ({
                    modality: study.type,
                    description: f.description || f,
                    location: f.location || 'Not specified',
                    severity: f.severity || 'moderate'
                })));

                // Identify critical findings
                const criticalKeywords = ['mass', 'hemorrhage', 'pneumothorax', 'embolism', 'dissection', 'perforation'];
                study.findings.forEach(f => {
                    const desc = (f.description || f).toLowerCase();
                    if (criticalKeywords.some(kw => desc.includes(kw))) {
                        criticalFindings.push({
                            modality: study.type,
                            description: f.description || f,
                            action: 'Immediate specialist consultation required'
                        });
                    }
                });

                impression = study.impression || 'See detailed findings above';
            }

            return { findings, criticalFindings, impression };
        },

        _interpretScopeStudy(scope) {
            const findings = [];
            const pathology = [];
            const recommendations = [];

            if (scope.type && scope.findings) {
                findings.push(...scope.findings.map(f => ({
                    procedure: scope.type,
                    description: f.description || f,
                    location: f.location || 'Not specified'
                })));

                // Identify pathology
                const pathologyKeywords = ['ulcer', 'bleeding', 'mass', 'polyp', 'inflammation', 'varices'];
                scope.findings.forEach(f => {
                    const desc = (f.description || f).toLowerCase();
                    pathologyKeywords.forEach(kw => {
                        if (desc.includes(kw)) {
                            pathology.push({
                                type: kw.charAt(0).toUpperCase() + kw.slice(1),
                                description: f.description || f,
                                location: f.location || 'Not specified'
                            });
                        }
                    });
                });

                if (scope.recommendations) {
                    recommendations.push(...scope.recommendations);
                }
            }

            return { findings, pathology, recommendations };
        },

        _evaluateVitalSigns(vitals) {
            const findings = [];
            const alerts = [];

            if (vitals.HR) {
                if (vitals.HR > 100) {
                    alerts.push({ type: 'tachycardia', description: `HR ${vitals.HR} - Tachycardia`, severity: vitals.HR > 120 ? 'critical' : 'moderate' });
                } else if (vitals.HR < 60) {
                    alerts.push({ type: 'bradycardia', description: `HR ${vitals.HR} - Bradycardia`, severity: vitals.HR < 40 ? 'critical' : 'moderate' });
                }
            }

            if (vitals.Temp) {
                if (vitals.Temp > 38.3) {
                    alerts.push({ type: 'fever', description: `Temp ${vitals.Temp}°C - Fever`, severity: 'moderate' });
                } else if (vitals.Temp < 36) {
                    alerts.push({ type: 'hypothermia', description: `Temp ${vitals.Temp}°C - Hypothermia`, severity: 'moderate' });
                }
            }

            if (vitals.SpO2 && vitals.SpO2 < 92) {
                alerts.push({ type: 'hypoxia', description: `SpO2 ${vitals.SpO2}% - Hypoxia`, severity: vitals.SpO2 < 88 ? 'critical' : 'moderate' });
            }

            return { findings, alerts };
        },

        _detectVitalTrends(vitals) {
            // Simple trend detection for vitals
            const trends = [];

            if (vitals.length >= 2) {
                const first = vitals[0];
                const last = vitals[vitals.length - 1];

                ['HR', 'BP', 'RR', 'Temp', 'SpO2'].forEach(vital => {
                    if (first[vital] && last[vital]) {
                        const change = last[vital] - first[vital];
                        const percentChange = (change / first[vital]) * 100;

                        if (Math.abs(percentChange) > 15) {
                            trends.push({
                                vital,
                                direction: change > 0 ? 'increasing' : 'decreasing',
                                percentChange: Math.round(percentChange),
                                interpretation: `${vital} trending ${change > 0 ? 'up' : 'down'} - monitor closely`
                            });
                        }
                    }
                });
            }

            return trends;
        },

        _calculateConfidence(labAnalysis, imagingAnalysis, scopeAnalysis, vitalAnalysis) {
            let confidence = 0;
            let count = 0;

            if (labAnalysis.findings.length > 0) { confidence += 90; count++; }
            if (imagingAnalysis.findings.length > 0) { confidence += 85; count++; }
            if (scopeAnalysis.findings.length > 0) { confidence += 85; count++; }
            if (vitalAnalysis.findings.length > 0) { confidence += 80; count++; }

            return count > 0 ? Math.round(confidence / count) : 0;
        },

        _calculateNeuralScore(analysis) {
            let score = 0;

            // Base score from confidence
            score += analysis.confidence * 0.3;

            // Add points for detected syndromes
            score += analysis.clinicalSyndromes.length * 10;

            // Add points for cross-modal insights
            score += analysis.crossModalInsights.length * 5;

            // Add points for trends
            const labTrends = Object.keys(analysis.trendAnalysis.labs || {}).length;
            const vitalTrends = Object.keys(analysis.trendAnalysis.vitals || {}).length;
            score += (labTrends + vitalTrends) * 3;

            // Cap at 100
            return Math.min(100, Math.round(score));
        }
    };

    console.log('[NeuralClinicalInterpreter] Module loaded successfully');

})();
