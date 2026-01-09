/* ═══════════════════════════════════════════════════════════════════════════
   MEDICAL AI ASSISTANT v1.0 - INTELLIGENT CLINICAL CONVERSATION ENGINE

   🤖 AI Features:
   - Context-aware medical conversations
   - Access to patient demographics, diagnosis, and all lab values
   - Integration with Clinical Guidelines, CDSS, and Neural Interpreter
   - Evidence-based recommendations and explanations
   - Natural language understanding for medical queries
   - Differential diagnosis assistance
   - Medication guidance and dosing recommendations
   - Lab interpretation and trending analysis

   Capabilities:
   - Interprets lab results in clinical context
   - Suggests treatment modifications based on guidelines
   - Provides medication information and interactions
   - Explains diagnoses in simple terms
   - Offers clinical pearls and evidence-based insights
   - Answers "what if" scenarios
   ═══════════════════════════════════════════════════════════════════════════ */

(function() {
    'use strict';

    window.MedicalAIAssistant = {
        version: '1.0',

        /**
         * Generate AI response based on user query and patient context
         * @param {String} query - User's question/message
         * @param {Object} patientContext - Patient data including labs
         * @returns {String} AI response
         */
        chat(query, patientContext) {
            console.log('[AI Assistant] Processing query:', query);
            console.log('[AI Assistant] Patient context:', patientContext);

            const response = this._generateResponse(query.toLowerCase(), patientContext);
            return response;
        },

        _generateResponse(query, context) {
            // Pattern matching for different types of queries
            const patterns = [
                { pattern: /lab|result|value|test/i, handler: this._handleLabQuery },
                { pattern: /diagnos|condition|disease/i, handler: this._handleDiagnosisQuery },
                { pattern: /medic|drug|treat|therap/i, handler: this._handleMedicationQuery },
                { pattern: /what.*mean|explain|tell me about/i, handler: this._handleExplanationQuery },
                { pattern: /recommend|suggest|advise|should/i, handler: this._handleRecommendationQuery },
                { pattern: /trend|chang|progress|improv|wors/i, handler: this._handleTrendQuery },
                { pattern: /risk|danger|concern|worry/i, handler: this._handleRiskQuery },
                { pattern: /dose|dosing|how much/i, handler: this._handleDosingQuery },
                { pattern: /interact|combine|together/i, handler: this._handleInteractionQuery },
                { pattern: /differential|ddx|possible/i, handler: this._handleDifferentialQuery }
            ];

            for (const { pattern, handler } of patterns) {
                if (pattern.test(query)) {
                    return handler.call(this, query, context);
                }
            }

            // Default response with general overview
            return this._handleGeneralQuery(query, context);
        },

        _handleLabQuery(query, context) {
            const latestLab = this._getLatestLab(context);
            if (!latestLab || !latestLab.values || latestLab.values.length === 0) {
                return "I don't see any lab results for this patient yet. Once you upload lab images, I'll be able to interpret them for you.";
            }

            let response = `**Latest Lab Results Analysis**\n\n`;

            // Get CDSS interpretation
            if (window.CDSS && window.CDSS.generateReport) {
                const cdssAnalysis = window.CDSS.generateReport(latestLab.values, {
                    name: context.name,
                    diagnosis: context.diagnosis
                });

                if (cdssAnalysis.patterns && cdssAnalysis.patterns.length > 0) {
                    response += `**Clinical Patterns Detected:**\n`;
                    cdssAnalysis.patterns.forEach(pattern => {
                        response += `\n🔴 **${pattern.name}** (${pattern.priority})\n`;
                        response += `${pattern.interpretation}\n`;
                    });
                    response += `\n`;
                }

                // Summarize abnormal values
                const abnormal = latestLab.values.filter(v => v.flag && v.flag !== 'N');
                if (abnormal.length > 0) {
                    response += `**Abnormal Values (${abnormal.length}):**\n`;
                    abnormal.slice(0, 5).forEach(v => {
                        const ref = window.CDSS?.getReference(v.test);
                        response += `\n• **${v.test}**: ${v.value} ${v.unit || ''} ${v.flag === 'H' ? '↑' : '↓'}\n`;
                        if (ref && ref.interpret) {
                            const interp = v.flag === 'H' ? ref.interpret.high :
                                         v.flag === 'L' ? ref.interpret.low :
                                         v.flag === 'HH' ? ref.interpret.criticalHigh :
                                         v.flag === 'LL' ? ref.interpret.criticalLow : '';
                            if (interp) {
                                response += `  *${interp.substring(0, 200)}${interp.length > 200 ? '...' : ''}*\n`;
                            }
                        }
                    });
                    if (abnormal.length > 5) {
                        response += `\n*...and ${abnormal.length - 5} more abnormalities*\n`;
                    }
                }
            }

            // Add neural interpreter insights if available
            if (window.NeuralClinicalInterpreter) {
                const clinicalData = {
                    labs: [latestLab],
                    diagnosis: context.diagnosis
                };
                const neuralAnalysis = window.NeuralClinicalInterpreter.analyzeMultiDocument(clinicalData);

                if (neuralAnalysis.clinicalSyndromes && neuralAnalysis.clinicalSyndromes.length > 0) {
                    response += `\n**Clinical Syndromes Identified:**\n`;
                    neuralAnalysis.clinicalSyndromes.slice(0, 3).forEach(syndrome => {
                        response += `\n🏥 **${syndrome.syndrome}** (Confidence: ${syndrome.confidence}%)\n`;
                        response += `   *${syndrome.recommendation}*\n`;
                    });
                }
            }

            return response;
        },

        _handleDiagnosisQuery(query, context) {
            if (!context.diagnosis) {
                return "No diagnosis has been entered for this patient yet. You can add one by editing the patient record.";
            }

            let response = `**About ${context.diagnosis}**\n\n`;

            // Get clinical guidelines
            if (window.ClinicalGuidelines) {
                const match = window.ClinicalGuidelines.findMatch(context.diagnosis);
                if (match && match.guideline) {
                    const guideline = match.guideline;

                    response += `**Overview:**\n`;
                    response += `Category: ${guideline.category || 'General'}\n\n`;

                    response += `**Key Medications:**\n`;
                    if (guideline.treatment && guideline.treatment.medications) {
                        guideline.treatment.medications.slice(0, 5).forEach((med, i) => {
                            response += `${i + 1}. ${med}\n`;
                        });
                    }

                    response += `\n**Monitoring Requirements:**\n`;
                    if (guideline.monitoring) {
                        if (guideline.monitoring.labs) {
                            response += `Labs: ${guideline.monitoring.labs.join(', ')}\n`;
                        }
                        if (guideline.monitoring.frequency) {
                            response += `Frequency: ${guideline.monitoring.frequency}\n`;
                        }
                    }

                    // Lab-specific adjustments if applicable
                    const latestLab = this._getLatestLab(context);
                    if (latestLab && guideline.labAdjustments) {
                        response += `\n**Lab-Based Recommendations for this Patient:**\n`;
                        this._getLabAdjustments(latestLab, guideline.labAdjustments, response);
                    }
                } else {
                    response += `I have general information about this condition, but no specific clinical guideline is loaded yet.\n\n`;
                    response += `Based on the diagnosis "${context.diagnosis}", I recommend consulting evidence-based guidelines for optimal management.`;
                }
            }

            return response;
        },

        _handleMedicationQuery(query, context) {
            let response = `**Medication Guidance**\n\n`;

            if (!context.diagnosis) {
                return "Please specify a diagnosis first so I can provide appropriate medication recommendations.";
            }

            // Get guideline-based medications
            if (window.ClinicalGuidelines) {
                const match = window.ClinicalGuidelines.findMatch(context.diagnosis);
                if (match && match.guideline && match.guideline.treatment) {
                    response += `**Evidence-Based Medications for ${context.diagnosis}:**\n\n`;

                    if (match.guideline.treatment.medications) {
                        match.guideline.treatment.medications.forEach((med, i) => {
                            response += `${i + 1}. ${med}\n\n`;
                        });
                    }

                    // Add lab adjustments
                    const latestLab = this._getLatestLab(context);
                    if (latestLab && match.guideline.labAdjustments) {
                        response += `\n**Based on Current Lab Values:**\n`;
                        const adjustments = [];

                        for (const [test, guidance] of Object.entries(match.guideline.labAdjustments)) {
                            const labValue = latestLab.values?.find(v => v.test?.toUpperCase() === test.toUpperCase());
                            if (labValue && guidance) {
                                if (labValue.flag === 'H' || labValue.flag === 'HH') {
                                    adjustments.push(`• **${test} is HIGH (${labValue.value})**: ${guidance.high || 'Monitor closely'}`);
                                } else if (labValue.flag === 'L' || labValue.flag === 'LL') {
                                    adjustments.push(`• **${test} is LOW (${labValue.value})**: ${guidance.low || 'Monitor closely'}`);
                                }
                            }
                        }

                        if (adjustments.length > 0) {
                            response += adjustments.join('\n\n') + '\n';
                        } else {
                            response += `Current lab values are within acceptable ranges for this treatment.\n`;
                        }
                    }

                    // Add non-pharmacologic interventions
                    if (match.guideline.treatment.nonpharm) {
                        response += `\n**Non-Pharmacologic Interventions:**\n`;
                        match.guideline.treatment.nonpharm.forEach((intervention, i) => {
                            response += `${i + 1}. ${intervention}\n`;
                        });
                    }
                }
            }

            return response;
        },

        _handleRecommendationQuery(query, context) {
            let response = `**Clinical Recommendations for ${context.name}**\n\n`;

            // Get neural analysis
            const latestLab = this._getLatestLab(context);
            if (latestLab && window.NeuralClinicalInterpreter) {
                const clinicalData = {
                    labs: [latestLab],
                    diagnosis: context.diagnosis
                };
                const analysis = window.NeuralClinicalInterpreter.analyzeMultiDocument(clinicalData);

                if (analysis.urgencyLevel) {
                    const urgencyEmoji = analysis.urgencyLevel === 'IMMEDIATE' ? '🚨' :
                                       analysis.urgencyLevel === 'URGENT' ? '⚠️' :
                                       analysis.urgencyLevel === 'SOON' ? '📋' : '✓';
                    response += `**Urgency Level:** ${urgencyEmoji} ${analysis.urgencyLevel}\n\n`;
                }

                if (analysis.criticalFindings && analysis.criticalFindings.length > 0) {
                    response += `**CRITICAL FINDINGS:**\n`;
                    analysis.criticalFindings.forEach(finding => {
                        response += `\n🔴 ${finding.finding}\n`;
                        response += `   Action: ${finding.action}\n`;
                    });
                    response += `\n`;
                }

                if (analysis.treatmentRecommendations && analysis.treatmentRecommendations.length > 0) {
                    response += `**Treatment Recommendations:**\n`;
                    analysis.treatmentRecommendations.slice(0, 5).forEach((rec, i) => {
                        response += `\n${i + 1}. ${rec.indication}\n`;
                        response += `   ${rec.treatment}\n`;
                        response += `   Urgency: ${rec.urgency} | Evidence: ${rec.evidenceLevel}\n`;
                    });
                }

                if (analysis.monitoringPlan && analysis.monitoringPlan.length > 0) {
                    response += `\n**Monitoring Plan:**\n`;
                    analysis.monitoringPlan.forEach(item => {
                        response += `\n• ${item.test} - ${item.frequency}\n`;
                        response += `  Rationale: ${item.rationale}\n`;
                    });
                }
            } else {
                // Fallback to guideline-based recommendations
                if (context.diagnosis && window.ClinicalGuidelines) {
                    const match = window.ClinicalGuidelines.findMatch(context.diagnosis);
                    if (match && match.guideline) {
                        response += `**Guideline-Based Recommendations:**\n\n`;
                        if (match.guideline.treatment && match.guideline.treatment.medications) {
                            response += `**Medications:**\n`;
                            match.guideline.treatment.medications.slice(0, 3).forEach((med, i) => {
                                response += `${i + 1}. ${med}\n`;
                            });
                        }
                    }
                }
            }

            return response;
        },

        _handleTrendQuery(query, context) {
            if (!context.labImages || context.labImages.length < 2) {
                return "I need at least two lab results to analyze trends. Please upload more lab data to track changes over time.";
            }

            let response = `**Lab Trend Analysis for ${context.name}**\n\n`;

            // Get all labs with values
            const labsWithValues = context.labImages
                .filter(lab => lab.ocr && lab.ocr.values && lab.ocr.values.length > 0)
                .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

            if (labsWithValues.length < 2) {
                return "I need at least two processed lab results to analyze trends.";
            }

            // Find common tests across labs
            const testMap = {};
            labsWithValues.forEach(lab => {
                lab.ocr.values.forEach(v => {
                    if (!testMap[v.test]) testMap[v.test] = [];
                    testMap[v.test].push({
                        value: parseFloat(v.value),
                        timestamp: lab.timestamp,
                        flag: v.flag
                    });
                });
            });

            // Analyze trends
            const trends = [];
            for (const [test, values] of Object.entries(testMap)) {
                if (values.length >= 2) {
                    const first = values[0].value;
                    const last = values[values.length - 1].value;
                    const change = last - first;
                    const percentChange = (change / first) * 100;

                    if (Math.abs(percentChange) > 10) { // Significant change
                        trends.push({
                            test,
                            first,
                            last,
                            change,
                            percentChange,
                            direction: change > 0 ? '↑' : '↓',
                            values: values.length
                        });
                    }
                }
            }

            if (trends.length === 0) {
                response += `All monitored labs are relatively stable (changes <10%).\n\n`;
                response += `This is generally a good sign indicating stable disease state or effective treatment.`;
            } else {
                response += `**Significant Trends Identified:**\n\n`;
                trends.sort((a, b) => Math.abs(b.percentChange) - Math.abs(a.percentChange));

                trends.slice(0, 5).forEach(trend => {
                    const emoji = trend.change > 0 ? '📈' : '📉';
                    response += `${emoji} **${trend.test}**: ${trend.first} → ${trend.last} (${trend.direction} ${Math.abs(trend.percentChange).toFixed(1)}%)\n`;

                    // Clinical interpretation
                    if (Math.abs(trend.percentChange) > 50) {
                        response += `   ⚠️ *Dramatic change - requires urgent evaluation*\n`;
                    } else if (Math.abs(trend.percentChange) > 25) {
                        response += `   📋 *Significant trend - monitor closely*\n`;
                    } else {
                        response += `   ✓ *Moderate trend - continue current management*\n`;
                    }
                    response += `\n`;
                });
            }

            return response;
        },

        _handleRiskQuery(query, context) {
            let response = `**Risk Assessment for ${context.name}**\n\n`;

            const latestLab = this._getLatestLab(context);
            if (!latestLab) {
                return "No lab results available for risk assessment. Please upload lab data first.";
            }

            // Identify high-risk findings
            const risks = [];

            if (window.CDSS) {
                const analysis = window.CDSS.generateReport(latestLab.values || []);

                if (analysis.summary && analysis.summary.critical > 0) {
                    risks.push({
                        level: 'CRITICAL',
                        finding: `${analysis.summary.critical} critical lab value(s)`,
                        recommendation: 'Immediate medical evaluation required'
                    });
                }

                if (analysis.patterns) {
                    analysis.patterns.forEach(pattern => {
                        if (pattern.priority === 'CRITICAL') {
                            risks.push({
                                level: 'HIGH',
                                finding: pattern.name,
                                recommendation: pattern.interpretation.substring(0, 150) + '...'
                            });
                        }
                    });
                }
            }

            // Neural interpreter risks
            if (window.NeuralClinicalInterpreter) {
                const clinicalData = { labs: [latestLab], diagnosis: context.diagnosis };
                const analysis = window.NeuralClinicalInterpreter.analyzeMultiDocument(clinicalData);

                if (analysis.clinicalSyndromes) {
                    analysis.clinicalSyndromes.forEach(syndrome => {
                        if (syndrome.severity && (syndrome.severity.includes('Severe') || syndrome.severity.includes('Life-threatening'))) {
                            risks.push({
                                level: 'CRITICAL',
                                finding: syndrome.syndrome,
                                recommendation: syndrome.recommendation.substring(0, 150) + '...'
                            });
                        }
                    });
                }
            }

            if (risks.length === 0) {
                response += `✅ No immediate high-risk findings identified based on current lab data.\n\n`;
                response += `Continue routine monitoring as per clinical guidelines for ${context.diagnosis || 'the current condition'}.`;
            } else {
                response += `⚠️ **${risks.length} Risk Factor(s) Identified:**\n\n`;
                risks.forEach((risk, i) => {
                    const emoji = risk.level === 'CRITICAL' ? '🚨' : '⚠️';
                    response += `${i + 1}. ${emoji} **${risk.finding}**\n`;
                    response += `   ${risk.recommendation}\n\n`;
                });
            }

            return response;
        },

        _handleDosingQuery(query, context) {
            let response = `**Medication Dosing Information**\n\n`;

            // Check for renal function for dose adjustments
            const latestLab = this._getLatestLab(context);
            const cr = latestLab?.values?.find(v => v.test === 'CR' || v.test === 'Cr');
            const egfr = latestLab?.values?.find(v => v.test === 'eGFR' || v.test === 'GFR');

            if (cr || egfr) {
                response += `**Renal Function:**\n`;
                if (cr) response += `Creatinine: ${cr.value} ${cr.unit}\n`;
                if (egfr) response += `eGFR: ${egfr.value} ${egfr.unit}\n`;

                const eGFRValue = egfr ? parseFloat(egfr.value) : null;
                if (eGFRValue) {
                    if (eGFRValue < 30) {
                        response += `\n⚠️ **Severe renal impairment (eGFR <30)**\n`;
                        response += `Many medications require dose reduction or are contraindicated.\n`;
                        response += `Avoid: NSAIDs, metformin (if <30), ACEi/ARB (use with caution)\n`;
                    } else if (eGFRValue < 60) {
                        response += `\n📋 **Moderate renal impairment (eGFR 30-60)**\n`;
                        response += `Dose adjustments may be needed for renally-cleared drugs.\n`;
                    }
                }
            }

            response += `\n**Common Medications for ${context.diagnosis || 'this condition'}:**\n\n`;

            // Get guideline-based dosing
            if (context.diagnosis && window.ClinicalGuidelines) {
                const match = window.ClinicalGuidelines.findMatch(context.diagnosis);
                if (match && match.guideline && match.guideline.treatment && match.guideline.treatment.medications) {
                    match.guideline.treatment.medications.slice(0, 5).forEach((med, i) => {
                        response += `${i + 1}. ${med}\n\n`;
                    });
                }
            }

            response += `\n*Note: Always verify dosing with current references (Lexicomp, UpToDate, package insert) and consider patient-specific factors.*`;

            return response;
        },

        _handleInteractionQuery(query, context) {
            return `**Drug Interaction Information**\n\n` +
                   `For comprehensive drug interaction checking, I recommend using:\n\n` +
                   `1. **Lexicomp** - Gold standard for interaction checking\n` +
                   `2. **Micromedex** - Comprehensive drug information\n` +
                   `3. **UpToDate Drug Interactions** - Evidence-based\n\n` +
                   `**Common Important Interactions:**\n\n` +
                   `• **Warfarin** - Interacts with many drugs (antibiotics, antifungals, amiodarone)\n` +
                   `• **Statins + Gemfibrozil** - Increased rhabdomyolysis risk\n` +
                   `• **ACEi/ARB + K-sparing diuretics** - Hyperkalemia risk\n` +
                   `• **NSAIDs + ACEi/ARB + diuretic** - "Triple whammy" for acute kidney injury\n` +
                   `• **Macrolides (azithro/clarithro) + QT-prolonging drugs** - Arrhythmia risk\n\n` +
                   `If you specify medications, I can provide more targeted guidance.`;
        },

        _handleDifferentialQuery(query, context) {
            let response = `**Differential Diagnosis for ${context.name}**\n\n`;

            const latestLab = this._getLatestLab(context);
            if (latestLab && window.NeuralClinicalInterpreter) {
                const clinicalData = {
                    labs: [latestLab],
                    diagnosis: context.diagnosis
                };
                const analysis = window.NeuralClinicalInterpreter.analyzeMultiDocument(clinicalData);

                if (analysis.differentialDiagnosis && analysis.differentialDiagnosis.length > 0) {
                    response += `**Based on current lab findings:**\n\n`;
                    analysis.differentialDiagnosis.forEach((ddx, i) => {
                        response += `${i + 1}. **${ddx.diagnosis}** (${ddx.probability}% likelihood)\n`;
                        if (ddx.supportingEvidence && ddx.supportingEvidence.length > 0) {
                            response += `   Supporting: ${ddx.supportingEvidence[0].substring(0, 100)}...\n`;
                        }
                        response += `\n`;
                    });
                } else {
                    response += `Current diagnosis: **${context.diagnosis || 'Not specified'}**\n\n`;
                    response += `Upload lab results for AI-assisted differential diagnosis generation.`;
                }
            } else {
                response += `For differential diagnosis assistance, please upload lab results.\n\n`;
                response += `The AI will analyze lab patterns and suggest possible diagnoses ranked by probability.`;
            }

            return response;
        },

        _handleExplanationQuery(query, context) {
            if (context.diagnosis && query.includes(context.diagnosis.toLowerCase())) {
                return this._handleDiagnosisQuery(query, context);
            }

            // Try to extract medical term from query
            const words = query.split(' ');
            for (const word of words) {
                if (word.length > 4) { // Skip short words
                    // Check if it's a lab test
                    const latestLab = this._getLatestLab(context);
                    if (latestLab && latestLab.values) {
                        const labValue = latestLab.values.find(v =>
                            v.test.toLowerCase().includes(word) || word.includes(v.test.toLowerCase())
                        );
                        if (labValue && window.CDSS) {
                            const ref = window.CDSS.getReference(labValue.test);
                            if (ref) {
                                let response = `**${ref.name} (${labValue.test})**\n\n`;
                                response += `Current value: ${labValue.value} ${labValue.unit || ref.unit}\n`;
                                response += `Reference range: ${ref.min} - ${ref.max} ${ref.unit}\n`;
                                if (labValue.flag !== 'N') {
                                    const interp = labValue.flag === 'H' || labValue.flag === 'HH' ? ref.interpret?.high :
                                                 labValue.flag === 'L' || labValue.flag === 'LL' ? ref.interpret?.low : '';
                                    if (interp) {
                                        response += `\n**Interpretation:**\n${interp}`;
                                    }
                                }
                                return response;
                            }
                        }
                    }
                }
            }

            return this._handleGeneralQuery(query, context);
        },

        _handleGeneralQuery(query, context) {
            let response = `**Patient Summary for ${context.name}**\n\n`;

            if (context.diagnosis) {
                response += `**Diagnosis:** ${context.diagnosis}\n`;
            }
            if (context.ward) {
                response += `**Ward:** ${context.ward}, Bed ${context.bed}\n`;
            }
            if (context.doctor) {
                response += `**Attending:** ${context.doctor}\n`;
            }

            response += `\n`;

            const latestLab = this._getLatestLab(context);
            if (latestLab) {
                response += `**Latest Lab Results:** ${latestLab.values?.length || 0} values\n`;

                // Quick summary of critical findings
                const critical = latestLab.values?.filter(v => v.flag === 'HH' || v.flag === 'LL') || [];
                const abnormal = latestLab.values?.filter(v => v.flag === 'H' || v.flag === 'L') || [];

                if (critical.length > 0) {
                    response += `⚠️ ${critical.length} critical value(s)\n`;
                }
                if (abnormal.length > 0) {
                    response += `📋 ${abnormal.length} abnormal value(s)\n`;
                }
            }

            response += `\n**How can I help you?**\n\n`;
            response += `You can ask me about:\n`;
            response += `• Lab results and their interpretation\n`;
            response += `• Treatment recommendations\n`;
            response += `• Medication dosing and interactions\n`;
            response += `• Disease information and management\n`;
            response += `• Risk assessment\n`;
            response += `• Lab trends over time\n`;

            return response;
        },

        _getLatestLab(context) {
            if (!context.labImages || context.labImages.length === 0) return null;

            const labsWithValues = context.labImages
                .filter(lab => lab.ocr && lab.ocr.values && lab.ocr.values.length > 0)
                .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

            return labsWithValues[0] || null;
        },

        _getLabAdjustments(lab, adjustments, baseResponse) {
            const recommendations = [];
            for (const [test, guidance] of Object.entries(adjustments)) {
                const labValue = lab.values?.find(v => v.test?.toUpperCase() === test.toUpperCase());
                if (labValue) {
                    if (labValue.flag === 'H' || labValue.flag === 'HH') {
                        recommendations.push(`• **${test} is elevated (${labValue.value})**: ${guidance.high || 'Monitor'}`);
                    } else if (labValue.flag === 'L' || labValue.flag === 'LL') {
                        recommendations.push(`• **${test} is low (${labValue.value})**: ${guidance.low || 'Monitor'}`);
                    }
                }
            }
            return recommendations.join('\n');
        }
    };

    console.log('[Medical AI Assistant v1.0] Intelligent clinical conversation engine loaded');

})();
