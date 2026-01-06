/* ═══════════════════════════════════════════════════════════════════════════
   MEDICAL AI ASSISTANT v2.0 - INTELLIGENT CLINICAL CONVERSATION ENGINE

   🤖 AI Features:
   - Context-aware medical conversations
   - Access to patient demographics, diagnosis, and all lab values
   - Integration with Clinical Guidelines, CDSS, and Neural Interpreter
   - Evidence-based recommendations and explanations
   - Natural language understanding for medical queries
   - Differential diagnosis assistance
   - Medication guidance and dosing recommendations
   - Lab interpretation and trending analysis
   - Vital signs interpretation
   - Nursing care recommendations
   - Patient education summaries
   - Typing indicator simulation
   - Follow-up question suggestions
   - Enhanced response formatting

   Capabilities:
   - Interprets lab results in clinical context
   - Suggests treatment modifications based on guidelines
   - Provides medication information and interactions
   - Explains diagnoses in simple terms
   - Offers clinical pearls and evidence-based insights
   - Answers "what if" scenarios
   - Provides nursing care plans
   - Generates patient education materials
   ═══════════════════════════════════════════════════════════════════════════ */

(function() {
    'use strict';

    window.MedicalAIAssistant = {
        version: '2.0',
        _typingCallback: null,

        /**
         * Set typing indicator callback
         * @param {Function} callback - Called with true/false to show/hide typing indicator
         */
        setTypingCallback(callback) {
            this._typingCallback = callback;
        },

        /**
         * Generate AI response based on user query and patient context
         * @param {String} query - User's question/message
         * @param {Object} patientContext - Patient data including labs
         * @returns {Promise<Object>} AI response with text and suggestions
         */
        async chat(query, patientContext) {
            console.log('[AI Assistant] Processing query:', query);
            console.log('[AI Assistant] Patient context:', patientContext);

            // Show typing indicator
            if (this._typingCallback) {
                this._typingCallback(true);
            }

            // Simulate realistic thinking time
            await this._simulateTyping(query);

            const response = this._generateResponse(query.toLowerCase(), patientContext);
            
            // Hide typing indicator
            if (this._typingCallback) {
                this._typingCallback(false);
            }

            return {
                text: response.text,
                suggestions: response.suggestions || [],
                actions: response.actions || []
            };
        },

        /**
         * Simulate typing delay for more natural feel
         * @private
         */
        async _simulateTyping(query) {
            // Base delay + proportional to query complexity
            const baseDelay = 800;
            const complexityDelay = Math.min(query.length * 10, 1500);
            const totalDelay = baseDelay + complexityDelay;
            
            await new Promise(resolve => setTimeout(resolve, totalDelay));
        },

        _generateResponse(query, context) {
            // Enhanced pattern matching with more specific handlers
            const patterns = [
                // Lab-related queries
                { pattern: /lab|result|value|test|blood|urine|cbc|bmp|cmp|lft/i, handler: this._handleLabQuery },
                
                // Diagnosis queries
                { pattern: /diagnos|condition|disease|illness/i, handler: this._handleDiagnosisQuery },
                
                // Medication queries
                { pattern: /medic|drug|treat|therap|prescription|pill/i, handler: this._handleMedicationQuery },
                
                // Explanation queries
                { pattern: /what.*mean|explain|tell me about|define|describe/i, handler: this._handleExplanationQuery },
                
                // Recommendation queries
                { pattern: /recommend|suggest|advise|should|what.*do|next step/i, handler: this._handleRecommendationQuery },
                
                // Trend queries
                { pattern: /trend|chang|progress|improv|wors|over time|compar/i, handler: this._handleTrendQuery },
                
                // Risk assessment
                { pattern: /risk|danger|concern|worry|complication|warning/i, handler: this._handleRiskQuery },
                
                // Dosing queries
                { pattern: /dose|dosing|how much|amount|frequency/i, handler: this._handleDosingQuery },
                
                // Interaction queries
                { pattern: /interact|combine|together|compatibility/i, handler: this._handleInteractionQuery },
                
                // Differential diagnosis
                { pattern: /differential|ddx|possible|alternative/i, handler: this._handleDifferentialQuery },
                
                // NEW: Vital signs
                { pattern: /vital|bp|blood pressure|heart rate|pulse|temp|respiration|o2|oxygen/i, handler: this._handleVitalSignsQuery },
                
                // NEW: Nursing care
                { pattern: /nursing|care plan|intervention|monitor|assessment/i, handler: this._handleNursingQuery },
                
                // NEW: Patient education
                { pattern: /explain.*patient|patient.*education|simple.*terms|layman/i, handler: this._handlePatientEducationQuery },
                
                // NEW: Evidence and references
                { pattern: /evidence|study|research|reference|guideline|citation/i, handler: this._handleEvidenceQuery },
                
                // NEW: Prognosis
                { pattern: /prognos|outcome|survival|expect|future|long.*term/i, handler: this._handlePrognosisQuery }
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
                return {
                    text: "📋 **No Lab Results Available**\n\nI don't see any lab results for this patient yet. Once you upload lab images, I'll be able to interpret them for you.\n\n💡 **Tip:** Use the 📸 Camera button in the Labs modal to capture lab reports.",
                    suggestions: [
                        "How do I upload lab results?",
                        "What labs should I order?",
                        "Tell me about common lab panels"
                    ]
                };
            }

            let response = `🔬 **Latest Lab Results Analysis**\n\n`;
            const suggestions = [];
            const actions = [];

            // Get CDSS interpretation
            if (window.CDSS && window.CDSS.generateReport) {
                const cdssAnalysis = window.CDSS.generateReport(latestLab.values, {
                    name: context.name,
                    diagnosis: context.diagnosis
                });

                if (cdssAnalysis.patterns && cdssAnalysis.patterns.length > 0) {
                    response += `⚡ **Clinical Patterns Detected:**\n`;
                    cdssAnalysis.patterns.forEach(pattern => {
                        const emoji = pattern.priority === 'CRITICAL' ? '🚨' : '⚠️';
                        response += `\n${emoji} **${pattern.name}** (${pattern.priority})\n`;
                        response += `   ${pattern.interpretation}\n`;
                        
                        // Add clinical pearl if critical
                        if (pattern.priority === 'CRITICAL') {
                            response += `   💎 *Clinical Pearl: Immediate attention required*\n`;
                        }
                    });
                    response += `\n`;
                }

                // Summarize abnormal values with detailed interpretation
                const abnormal = latestLab.values.filter(v => v.flag && v.flag !== 'N');
                if (abnormal.length > 0) {
                    response += `📊 **Abnormal Values (${abnormal.length}):**\n`;
                    abnormal.slice(0, 5).forEach(v => {
                        const ref = window.CDSS?.getReference(v.test);
                        const arrow = v.flag === 'H' || v.flag === 'HH' ? '⬆️' : '⬇️';
                        response += `\n• **${v.test}**: ${v.value} ${v.unit || ''} ${arrow}\n`;
                        if (ref && ref.interpret) {
                            const interp = v.flag === 'H' || v.flag === 'HH' ? ref.interpret.high :
                                         v.flag === 'L' || v.flag === 'LL' ? ref.interpret.low : '';
                            if (interp) {
                                response += `  📝 *${interp.substring(0, 200)}${interp.length > 200 ? '...' : ''}*\n`;
                                
                                // Add clinical pearls for common critical values
                                const pearl = this._getClinicalPearl(v.test, v.flag);
                                if (pearl) {
                                    response += `  💎 *Pearl: ${pearl}*\n`;
                                }
                            }
                        }
                    });
                    if (abnormal.length > 5) {
                        response += `\n*...and ${abnormal.length - 5} more abnormalities*\n`;
                    }
                    
                    suggestions.push("What do these abnormal values mean?");
                    suggestions.push("What treatment is recommended?");
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
                    response += `\n🏥 **Clinical Syndromes Identified:**\n`;
                    neuralAnalysis.clinicalSyndromes.slice(0, 3).forEach(syndrome => {
                        response += `\n💡 **${syndrome.syndrome}** (Confidence: ${syndrome.confidence}%)\n`;
                        response += `   ${syndrome.recommendation}\n`;
                    });
                }
            }

            // Add evidence level
            response += `\n📚 **Evidence Level:** Based on Harrison's Principles of Internal Medicine, WHO Guidelines\n`;
            
            // Add follow-up suggestions
            if (suggestions.length === 0) {
                suggestions.push("Show me the trend over time");
                suggestions.push("What are the risks?");
                suggestions.push("Explain this in simple terms for the patient");
            }

            return { text: response, suggestions, actions };
        },

        _handleDiagnosisQuery(query, context) {
            const suggestions = [];
            
            if (!context.diagnosis) {
                return {
                    text: "⚕️ No diagnosis has been entered for this patient yet. You can add one by editing the patient record.",
                    suggestions: ["How do I add a diagnosis?", "What should I assess first?"]
                };
            }

            let response = `🏥 **About ${context.diagnosis}**\n\n`;

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
                    
                    suggestions.push("What medications are recommended?");
                    suggestions.push("What labs should I monitor?");
                } else {
                    response += `I have general information about this condition, but no specific clinical guideline is loaded yet.\n\n`;
                    response += `Based on the diagnosis "${context.diagnosis}", I recommend consulting evidence-based guidelines for optimal management.`;
                    suggestions.push("Tell me more about this condition");
                }
            }

            return { text: response, suggestions };
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
            let response = `🔍 **Differential Diagnosis for ${context.name}**\n\n`;
            const suggestions = [];

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
                            response += `   📝 Supporting: ${ddx.supportingEvidence[0].substring(0, 100)}...\n`;
                        }
                        response += `\n`;
                    });
                    
                    suggestions.push("What tests can confirm the diagnosis?");
                    suggestions.push("What's the treatment for each?");
                } else {
                    response += `Current diagnosis: **${context.diagnosis || 'Not specified'}**\n\n`;
                    response += `Upload lab results for AI-assisted differential diagnosis generation.`;
                }
            } else {
                response += `For differential diagnosis assistance, please upload lab results.\n\n`;
                response += `The AI will analyze lab patterns and suggest possible diagnoses ranked by probability.`;
            }

            return { text: response, suggestions };
        },

        /**
         * NEW: Handle vital signs interpretation
         * @private
         */
        _handleVitalSignsQuery(query, context) {
            let response = `💓 **Vital Signs Interpretation for ${context.name}**\n\n`;
            const suggestions = [
                "What are normal vital sign ranges?",
                "When should I be concerned?",
                "What interventions are needed?"
            ];

            // Check if vital signs are in context
            const vitals = context.vitals || {};
            
            if (Object.keys(vitals).length === 0) {
                response += `⚠️ No vital signs recorded yet.\n\n`;
                response += `**Normal Adult Vital Signs:**\n`;
                response += `• **BP:** 90-120/60-80 mmHg\n`;
                response += `• **Heart Rate:** 60-100 bpm\n`;
                response += `• **Respiratory Rate:** 12-20 breaths/min\n`;
                response += `• **Temperature:** 36.1-37.2°C (97-99°F)\n`;
                response += `• **O2 Saturation:** >95% on room air\n\n`;
                response += `💡 **Tip:** Document vital signs in the patient plan for AI analysis.`;
            } else {
                response += `**Current Vital Signs:**\n`;
                
                // Interpret each vital sign
                const interpretations = [];
                
                if (vitals.bp) {
                    const [systolic, diastolic] = vitals.bp.split('/').map(v => parseInt(v));
                    response += `• **Blood Pressure:** ${vitals.bp} mmHg `;
                    
                    if (systolic >= 180 || diastolic >= 120) {
                        response += `⚠️ **Hypertensive Crisis**\n`;
                        interpretations.push("🚨 Immediate evaluation for hypertensive emergency required");
                    } else if (systolic >= 140 || diastolic >= 90) {
                        response += `📊 Elevated\n`;
                        interpretations.push("Consider antihypertensive management");
                    } else if (systolic < 90 || diastolic < 60) {
                        response += `⚠️ Hypotension\n`;
                        interpretations.push("Assess for volume depletion, sepsis, or cardiac causes");
                    } else {
                        response += `✅ Normal\n`;
                    }
                }
                
                if (vitals.hr) {
                    const hr = parseInt(vitals.hr);
                    response += `• **Heart Rate:** ${vitals.hr} bpm `;
                    
                    if (hr > 100) {
                        response += `⚠️ Tachycardia\n`;
                        interpretations.push("Rule out fever, pain, anxiety, hypovolemia, or cardiac arrhythmia");
                    } else if (hr < 60) {
                        response += `⚠️ Bradycardia\n`;
                        interpretations.push("Consider medications (beta-blockers), athletic conditioning, or conduction abnormalities");
                    } else {
                        response += `✅ Normal\n`;
                    }
                }
                
                if (vitals.temp) {
                    const temp = parseFloat(vitals.temp);
                    response += `• **Temperature:** ${vitals.temp}°C `;
                    
                    if (temp >= 38) {
                        response += `⚠️ Fever\n`;
                        interpretations.push("Investigate source of infection, consider blood cultures");
                    } else if (temp < 36) {
                        response += `⚠️ Hypothermia\n`;
                        interpretations.push("Rule out sepsis, hypothyroidism, environmental exposure");
                    } else {
                        response += `✅ Normal\n`;
                    }
                }
                
                if (interpretations.length > 0) {
                    response += `\n**Clinical Interpretation:**\n`;
                    interpretations.forEach(interp => {
                        response += `${interp}\n`;
                    });
                }
            }

            return { text: response, suggestions };
        },

        /**
         * NEW: Handle nursing care recommendations
         * @private
         */
        _handleNursingQuery(query, context) {
            let response = `👨‍⚕️ **Nursing Care Plan for ${context.name}**\n\n`;
            const suggestions = [
                "What monitoring is needed?",
                "What are the priority interventions?",
                "Patient safety concerns?"
            ];

            if (context.diagnosis) {
                response += `**Diagnosis:** ${context.diagnosis}\n\n`;
                
                // Generate nursing interventions based on diagnosis
                const nursingPlan = this._generateNursingPlan(context.diagnosis);
                
                if (nursingPlan.assessments.length > 0) {
                    response += `📊 **Assessments:**\n`;
                    nursingPlan.assessments.forEach(assessment => {
                        response += `• ${assessment}\n`;
                    });
                    response += `\n`;
                }
                
                if (nursingPlan.interventions.length > 0) {
                    response += `🎯 **Interventions:**\n`;
                    nursingPlan.interventions.forEach(intervention => {
                        response += `• ${intervention}\n`;
                    });
                    response += `\n`;
                }
                
                if (nursingPlan.monitoring.length > 0) {
                    response += `👀 **Monitoring:**\n`;
                    nursingPlan.monitoring.forEach(item => {
                        response += `• ${item}\n`;
                    });
                    response += `\n`;
                }
                
                if (nursingPlan.safety.length > 0) {
                    response += `⚠️ **Safety Considerations:**\n`;
                    nursingPlan.safety.forEach(item => {
                        response += `• ${item}\n`;
                    });
                }
            } else {
                response += `Please specify a diagnosis for tailored nursing care recommendations.\n\n`;
                response += `**General Nursing Care Principles:**\n`;
                response += `• Monitor vital signs per protocol\n`;
                response += `• Assess pain level and provide relief\n`;
                response += `• Ensure patient safety (fall precautions, bed rails)\n`;
                response += `• Promote adequate nutrition and hydration\n`;
                response += `• Maintain skin integrity\n`;
                response += `• Provide emotional support\n`;
                response += `• Document all findings and interventions`;
            }

            return { text: response, suggestions };
        },

        /**
         * NEW: Handle patient education requests
         * @private
         */
        _handlePatientEducationQuery(query, context) {
            let response = `📚 **Patient Education for ${context.name}**\n\n`;
            const suggestions = [
                "What should the family know?",
                "What warning signs to watch for?",
                "When to call the doctor?"
            ];

            if (context.diagnosis) {
                response += `**Condition:** ${context.diagnosis}\n\n`;
                
                const education = this._generatePatientEducation(context.diagnosis);
                
                response += `**What is it?** 🤔\n`;
                response += `${education.simple}\n\n`;
                
                if (education.whatToExpect) {
                    response += `**What to expect:** 📋\n`;
                    response += `${education.whatToExpect}\n\n`;
                }
                
                if (education.warning Signs.length > 0) {
                    response += `**⚠️ Warning Signs - Call your doctor if you have:**\n`;
                    education.warningSigns.forEach(sign => {
                        response += `• ${sign}\n`;
                    });
                    response += `\n`;
                }
                
                if (education.selfCare.length > 0) {
                    response += `**Self-Care at Home:** 🏠\n`;
                    education.selfCare.forEach(tip => {
                        response += `• ${tip}\n`;
                    });
                }
                
                response += `\n💡 **Remember:** This information is for educational purposes. Always follow your doctor's specific instructions.`;
            } else {
                response += `Please specify a diagnosis for tailored patient education materials.`;
            }

            return { text: response, suggestions };
        },

        /**
         * NEW: Handle evidence-based queries
         * @private
         */
        _handleEvidenceQuery(query, context) {
            let response = `📚 **Evidence-Based Information**\n\n`;
            const suggestions = [
                "What are the latest studies?",
                "What do guidelines recommend?",
                "What's the level of evidence?"
            ];

            if (context.diagnosis) {
                response += `**Topic:** ${context.diagnosis}\n\n`;
                response += `**Evidence Sources:**\n`;
                response += `• Harrison's Principles of Internal Medicine (20th Ed.)\n`;
                response += `• WHO Guidelines\n`;
                response += `• UpToDate Clinical Decision Support\n`;
                response += `• Cochrane Database of Systematic Reviews\n\n`;
                
                response += `**Levels of Evidence:**\n`;
                response += `• **Level 1:** Systematic reviews and meta-analyses\n`;
                response += `• **Level 2:** Randomized controlled trials\n`;
                response += `• **Level 3:** Cohort studies\n`;
                response += `• **Level 4:** Case-control studies\n`;
                response += `• **Level 5:** Expert opinion\n\n`;
                
                response += `💡 For specific evidence-based recommendations, please specify what aspect you'd like to know about (e.g., treatment, diagnosis, prognosis).`;
            } else {
                response += `All recommendations are based on current evidence-based guidelines and peer-reviewed medical literature.`;
            }

            return { text: response, suggestions };
        },

        /**
         * NEW: Handle prognosis queries
         * @private
         */
        _handlePrognosisQuery(query, context) {
            let response = `🔮 **Prognosis for ${context.name}**\n\n`;
            const suggestions = [
                "What factors affect prognosis?",
                "What is the expected course?",
                "What improves outcomes?"
            ];

            if (context.diagnosis) {
                response += `**Diagnosis:** ${context.diagnosis}\n\n`;
                response += `⚕️ Prognosis depends on multiple factors including:\n`;
                response += `• Disease severity and stage\n`;
                response += `• Patient age and comorbidities\n`;
                response += `• Response to treatment\n`;
                response += `• Compliance with medication and lifestyle modifications\n`;
                response += `• Early detection and intervention\n\n`;
                
                // Check lab values for prognostic indicators
                const latestLab = this._getLatestLab(context);
                if (latestLab && latestLab.values && latestLab.values.length > 0) {
                    response += `**Current Lab Findings:**\n`;
                    const criticalValues = latestLab.values.filter(v => v.flag === 'HH' || v.flag === 'LL');
                    if (criticalValues.length > 0) {
                        response += `⚠️ ${criticalValues.length} critical value(s) present - requiring immediate management\n\n`;
                    } else {
                        response += `✅ No critical values - favorable for prognosis\n\n`;
                    }
                }
                
                response += `💡 **Note:** Prognosis is individualized. Discuss specific concerns with the attending physician for personalized assessment.`;
            } else {
                response += `Please specify a diagnosis for prognosis information.`;
            }

            return { text: response, suggestions };
        },

        /**
         * Generate nursing care plan based on diagnosis
         * @private
         */
        _generateNursingPlan(diagnosis) {
            const plan = {
                assessments: [
                    "Comprehensive physical assessment every shift",
                    "Pain assessment using appropriate scale",
                    "Vital signs monitoring per protocol"
                ],
                interventions: [
                    "Administer medications as prescribed",
                    "Maintain IV access and monitor infusions",
                    "Provide comfort measures"
                ],
                monitoring: [
                    "Monitor for adverse effects of medications",
                    "Track intake and output",
                    "Observe for changes in condition"
                ],
                safety: [
                    "Fall risk assessment and precautions",
                    "Call bell within reach",
                    "Appropriate bed positioning"
                ]
            };

            // Customize based on diagnosis keywords
            const diagnosisLower = diagnosis.toLowerCase();
            
            if (diagnosisLower.includes('heart') || diagnosisLower.includes('cardiac')) {
                plan.assessments.push("Daily weight monitoring", "Assess for edema");
                plan.monitoring.push("Monitor for signs of fluid overload", "Cardiac rhythm monitoring");
                plan.safety.push("Oxygen therapy as needed");
            }
            
            if (diagnosisLower.includes('diabetes')) {
                plan.assessments.push("Blood glucose monitoring");
                plan.monitoring.push("Monitor for hypoglycemia symptoms");
                plan.interventions.push("Administer insulin per sliding scale");
            }
            
            if (diagnosisLower.includes('infection') || diagnosisLower.includes('pneumonia')) {
                plan.assessments.push("Monitor temperature trends");
                plan.monitoring.push("Assess respiratory status");
                plan.interventions.push("Encourage deep breathing and coughing");
            }

            return plan;
        },

        /**
         * Generate patient education materials
         * @private
         */
        _generatePatientEducation(diagnosis) {
            const diagnosisLower = diagnosis.toLowerCase();
            
            const education = {
                simple: `This is a medical condition that your doctor is treating.`,
                whatToExpect: `Your healthcare team will monitor your condition and adjust treatment as needed.`,
                warningSigns: [
                    "Severe pain that doesn't improve",
                    "High fever (over 38.5°C or 101°F)",
                    "Difficulty breathing",
                    "Unusual bleeding or bruising"
                ],
                selfCare: [
                    "Take all medications as prescribed",
                    "Get adequate rest",
                    "Stay hydrated",
                    "Follow dietary recommendations"
                ]
            };

            // Customize based on diagnosis
            if (diagnosisLower.includes('heart') || diagnosisLower.includes('cardiac')) {
                education.simple = "A heart condition affecting how your heart pumps blood through your body.";
                education.warningSigns.push("Chest pain or pressure", "Severe shortness of breath", "Swelling in legs or feet");
                education.selfCare.push("Limit salt intake", "Monitor weight daily", "Take heart medications regularly");
            }
            
            if (diagnosisLower.includes('diabetes')) {
                education.simple = "A condition where your body has trouble controlling blood sugar levels.";
                education.warningSigns.push("Extreme thirst", "Frequent urination", "Shakiness or confusion (low blood sugar)");
                education.selfCare.push("Monitor blood sugar as directed", "Follow diabetic diet", "Exercise regularly");
            }

            return education;
        },

        /**
         * Get clinical pearl for specific lab abnormality
         * @private
         */
        _getClinicalPearl(test, flag) {
            const pearls = {
                'K': {
                    'H': 'Hyperkalemia can cause life-threatening arrhythmias - get EKG if >6.0',
                    'L': 'Hypokalemia increases digitalis toxicity and arrhythmia risk'
                },
                'NA': {
                    'H': 'Hypernatremia indicates free water deficit - calculate deficit and replace slowly',
                    'L': 'Hyponatremia: Check volume status and correct underlying cause first'
                },
                'CR': {
                    'H': 'Rising creatinine may indicate AKI - check trends and urine output'
                },
                'WBC': {
                    'H': 'Leukocytosis: Consider infection, stress response, or leukemia',
                    'L': 'Leukopenia increases infection risk - consider neutropenic precautions'
                },
                'HGB': {
                    'L': 'Anemia: Check MCV to determine type - microcytic vs normocytic vs macrocytic'
                },
                'PLT': {
                    'L': 'Thrombocytopenia <50k increases bleeding risk - avoid IM injections'
                }
            };

            return pearls[test]?.[flag === 'H' || flag === 'HH' ? 'H' : 'L'] || null;
        },

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
            let response = `👋 **Patient Summary for ${context.name}**\n\n`;
            const suggestions = [];

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
                
                suggestions.push("Show me the lab results");
                suggestions.push("What do the abnormal values mean?");
            }

            response += `\n**💡 How can I help you?**\n\n`;
            response += `You can ask me about:\n`;
            response += `• 🔬 Lab results and their interpretation\n`;
            response += `• 💊 Treatment recommendations and medications\n`;
            response += `• 📊 Medication dosing and interactions\n`;
            response += `• 🏥 Disease information and management\n`;
            response += `• ⚠️ Risk assessment and complications\n`;
            response += `• 📈 Lab trends over time\n`;
            response += `• 💓 Vital signs interpretation\n`;
            response += `• 👨‍⚕️ Nursing care recommendations\n`;
            response += `• 📚 Patient education materials\n`;

            // Add quick action suggestions
            if (suggestions.length === 0) {
                if (context.diagnosis) {
                    suggestions.push(`Tell me about ${context.diagnosis}`);
                }
                suggestions.push("What labs should I check?");
                suggestions.push("Are there any risks?");
                suggestions.push("What's the treatment plan?");
            }

            return { text: response, suggestions };
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

    console.log('[Medical AI Assistant v2.0] Enhanced clinical conversation engine loaded with typing simulation, vital signs, nursing care, and patient education');

})();
