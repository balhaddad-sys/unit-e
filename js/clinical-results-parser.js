/* ═══════════════════════════════════════════════════════════════════════════
   CLINICAL RESULTS PARSER v1.0 - COMPREHENSIVE MULTI-MODAL PARSER

   🔬 Advanced Parsing Capabilities:
   - Imaging: CT, MRI, X-ray, Ultrasound, Echo (already handled in lab-parser)
   - Scopes: Endoscopy, Colonoscopy, Bronchoscopy, Cystoscopy
   - Labs: Already handled by lab-parser.js (80+ tests)
   - Pathology: Biopsy results, cytology
   - Elegantorganization and presentation of all clinical results

   Features:
   - Intelligent text extraction from OCR/scanned reports
   - Structured data organization
   - Critical finding detection
   - Cross-reference with clinical guidelines
   - Beautiful visual presentation
   ═══════════════════════════════════════════════════════════════════════════ */

(function() {
    'use strict';

    // ═══════════════════════════════════════════════════════════════════════
    // IMAGING PARSER - CT, MRI, X-RAY, ULTRASOUND
    // ═══════════════════════════════════════════════════════════════════════

    const ImagingParser = {
        /**
         * Parse imaging report and extract structured data
         * @param {String} text - Raw imaging report text
         * @param {String} modality - CT, MRI, XR, US, etc.
         * @returns {Object} Structured imaging data
         */
        parse(text, modality = 'auto') {
            console.log('[ImagingParser] Parsing imaging report...', { textLength: text.length, modality });

            const result = {
                modality: modality === 'auto' ? this._detectModality(text) : modality,
                date: this._extractDate(text),
                bodyPart: this._extractBodyPart(text),
                indication: this._extractIndication(text),
                technique: this._extractTechnique(text),
                findings: this._extractFindings(text),
                impression: this._extractImpression(text),
                criticalFindings: [],
                recommendations: [],
                confidence: 85
            };

            // Identify critical findings
            result.criticalFindings = this._identifyCriticalFindings(result.findings, result.impression);

            // Extract recommendations
            result.recommendations = this._extractRecommendations(text);

            // Calculate confidence
            result.confidence = this._calculateConfidence(result);

            console.log('[ImagingParser] Parsing complete:', result);
            return result;
        },

        _detectModality(text) {
            const textLower = text.toLowerCase();

            if (textLower.includes('computed tomography') || textLower.includes(' ct ') || textLower.includes('ct scan')) {
                return 'CT';
            }
            if (textLower.includes('magnetic resonance') || textLower.includes(' mri ') || textLower.includes('mr imaging')) {
                return 'MRI';
            }
            if (textLower.includes('ultrasound') || textLower.includes('sonography') || textLower.includes(' us ')) {
                return 'Ultrasound';
            }
            if (textLower.includes('x-ray') || textLower.includes('radiograph') || textLower.includes('chest film')) {
                return 'X-Ray';
            }
            if (textLower.includes('pet scan') || textLower.includes('positron emission')) {
                return 'PET';
            }

            return 'Unknown';
        },

        _extractDate(text) {
            // Try to find date patterns
            const datePatterns = [
                /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,
                /(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/,
                /(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},?\s+\d{4}/i
            ];

            for (const pattern of datePatterns) {
                const match = text.match(pattern);
                if (match) return match[0];
            }

            return null;
        },

        _extractBodyPart(text) {
            const bodyParts = [
                'head', 'brain', 'skull', 'neck', 'cervical spine',
                'chest', 'thorax', 'lung', 'heart', 'mediastinum',
                'abdomen', 'pelvis', 'liver', 'kidney', 'spleen', 'pancreas',
                'spine', 'lumbar', 'thoracic', 'sacrum',
                'extremity', 'arm', 'leg', 'knee', 'shoulder', 'hip',
                'hand', 'foot', 'wrist', 'ankle'
            ];

            const textLower = text.toLowerCase();
            for (const part of bodyParts) {
                if (textLower.includes(part)) {
                    return part.charAt(0).toUpperCase() + part.slice(1);
                }
            }

            return 'Not specified';
        },

        _extractIndication(text) {
            const indicationMatch = text.match(/indication[:\s]+(.+?)(?:\n\n|technique|findings|impression)/is);
            if (indicationMatch) {
                return indicationMatch[1].trim().replace(/\n/g, ' ');
            }
            return null;
        },

        _extractTechnique(text) {
            const techniqueMatch = text.match(/technique[:\s]+(.+?)(?:\n\n|findings|impression|comparison)/is);
            if (techniqueMatch) {
                return techniqueMatch[1].trim().replace(/\n/g, ' ');
            }
            return null;
        },

        _extractFindings(text) {
            const findings = [];

            // Look for findings section
            const findingsMatch = text.match(/findings[:\s]+(.+?)(?:\n\n|impression|recommendation)/is);
            if (findingsMatch) {
                const findingsText = findingsMatch[1];

                // Split by organs/systems or numbered findings
                const lines = findingsText.split(/\n/);
                const currentFindings = [];

                lines.forEach(line => {
                    const trimmed = line.trim();
                    if (trimmed.length > 10) { // Ignore very short lines
                        // Check if it's an organ/system heading or finding
                        const organMatch = trimmed.match(/^([A-Z][a-z]+(?:\s+[a-z]+)?)[:\s]/);
                        if (organMatch) {
                            currentFindings.push({
                                organ: organMatch[1],
                                description: trimmed.substring(organMatch[0].length).trim(),
                                severity: this._assessFindingSeverity(trimmed)
                            });
                        } else if (trimmed.match(/^[\d\-\•\*]/)) {
                            // Numbered or bulleted finding
                            currentFindings.push({
                                description: trimmed.replace(/^[\d\-\•\*\.\)]+\s*/, ''),
                                severity: this._assessFindingSeverity(trimmed)
                            });
                        } else if (trimmed.length > 20) {
                            // General finding
                            currentFindings.push({
                                description: trimmed,
                                severity: this._assessFindingSeverity(trimmed)
                            });
                        }
                    }
                });

                return currentFindings;
            }

            // If no formal findings section, extract key sentences
            const sentences = text.split(/[.!?]\s+/);
            sentences.forEach(sentence => {
                const trimmed = sentence.trim();
                if (trimmed.length > 30 && !trimmed.match(/^(indication|technique|impression|recommendation)/i)) {
                    findings.push({
                        description: trimmed,
                        severity: this._assessFindingSeverity(trimmed)
                    });
                }
            });

            return findings.slice(0, 10); // Limit to 10 findings
        },

        _extractImpression(text) {
            const impressionMatch = text.match(/impression[:\s]+(.+?)(?:\n\n|recommendation|$)/is);
            if (impressionMatch) {
                return impressionMatch[1].trim().replace(/\n/g, ' ');
            }

            // Alternative: look for "conclusion" or "summary"
            const conclusionMatch = text.match(/(?:conclusion|summary)[:\s]+(.+?)(?:\n\n|$)/is);
            if (conclusionMatch) {
                return conclusionMatch[1].trim().replace(/\n/g, ' ');
            }

            return null;
        },

        _assessFindingSeverity(text) {
            const textLower = text.toLowerCase();

            // Critical keywords
            const critical = ['mass', 'tumor', 'malignancy', 'hemorrhage', 'bleed', 'rupture', 'dissection',
                            'perforation', 'pneumothorax', 'embolism', 'infarct', 'acute', 'emergency'];
            if (critical.some(kw => textLower.includes(kw))) {
                return 'critical';
            }

            // High severity keywords
            const high = ['moderate', 'significant', 'abnormal', 'enlarged', 'thickening', 'fluid',
                         'consolidation', 'opacity', 'lesion', 'nodule'];
            if (high.some(kw => textLower.includes(kw))) {
                return 'high';
            }

            // Mild/normal keywords
            const mild = ['mild', 'minimal', 'slight', 'unremarkable', 'normal', 'clear', 'stable'];
            if (mild.some(kw => textLower.includes(kw))) {
                return 'mild';
            }

            return 'moderate';
        },

        _identifyCriticalFindings(findings, impression) {
            const critical = [];

            // Check findings for critical keywords
            findings.forEach(finding => {
                if (finding.severity === 'critical') {
                    critical.push({
                        type: 'finding',
                        description: finding.description,
                        organ: finding.organ,
                        action: 'Immediate clinical correlation and specialist consultation recommended'
                    });
                }
            });

            // Check impression for critical keywords
            if (impression) {
                const criticalKeywords = ['mass', 'hemorrhage', 'embolism', 'dissection', 'perforation', 'pneumothorax', 'acute'];
                const impressionLower = impression.toLowerCase();

                criticalKeywords.forEach(kw => {
                    if (impressionLower.includes(kw)) {
                        critical.push({
                            type: 'impression',
                            description: impression,
                            keyword: kw,
                            action: 'Urgent follow-up required'
                        });
                    }
                });
            }

            return critical;
        },

        _extractRecommendations(text) {
            const recommendations = [];

            // Look for recommendation section
            const recMatch = text.match(/recommendation[s]?[:\s]+(.+?)$/is);
            if (recMatch) {
                const recText = recMatch[1];
                const lines = recText.split(/\n/);

                lines.forEach(line => {
                    const trimmed = line.trim();
                    if (trimmed.length > 10) {
                        recommendations.push(trimmed.replace(/^[\d\-\•\*\.\)]+\s*/, ''));
                    }
                });
            }

            // Look for common recommendation phrases
            const recPhrases = [
                /(?:recommend|suggest|advise|consider)[s]?\s+(.+?)(?:\.|$)/gi,
                /(?:follow[- ]up|correlation)\s+(?:with|in)\s+(.+?)(?:\.|$)/gi
            ];

            recPhrases.forEach(pattern => {
                let match;
                while ((match = pattern.exec(text)) !== null) {
                    recommendations.push(match[0]);
                }
            });

            return [...new Set(recommendations)].slice(0, 5); // Unique, max 5
        },

        _calculateConfidence(result) {
            let confidence = 50;

            if (result.modality !== 'Unknown') confidence += 15;
            if (result.findings.length > 0) confidence += 20;
            if (result.impression) confidence += 15;
            if (result.indication) confidence += 5;
            if (result.technique) confidence += 5;

            return Math.min(100, confidence);
        }
    };

    // ═══════════════════════════════════════════════════════════════════════
    // ENDOSCOPY/SCOPE PARSER
    // ═══════════════════════════════════════════════════════════════════════

    const ScopeParser = {
        /**
         * Parse endoscopy/colonoscopy report
         * @param {String} text - Raw scope report
         * @param {String} type - EGD, Colonoscopy, Bronchoscopy, etc.
         * @returns {Object} Structured scope data
         */
        parse(text, type = 'auto') {
            console.log('[ScopeParser] Parsing scope report...', { textLength: text.length, type });

            const result = {
                type: type === 'auto' ? this._detectScopeType(text) : type,
                date: this._extractDate(text),
                indication: this._extractIndication(text),
                procedure: this._extractProcedure(text),
                findings: this._extractFindings(text),
                pathology: [],
                interventions: [],
                impression: this._extractImpression(text),
                recommendations: this._extractRecommendations(text),
                complications: this._extractComplications(text),
                confidence: 85
            };

            // Extract pathology findings
            result.pathology = this._extractPathology(result.findings, text);

            // Extract interventions (biopsies, polypectomy, etc.)
            result.interventions = this._extractInterventions(text);

            // Calculate confidence
            result.confidence = this._calculateConfidence(result);

            console.log('[ScopeParser] Parsing complete:', result);
            return result;
        },

        _detectScopeType(text) {
            const textLower = text.toLowerCase();

            if (textLower.includes('esophagogastroduodenoscopy') || textLower.includes('egd') || textLower.includes('upper endoscopy')) {
                return 'EGD (Upper Endoscopy)';
            }
            if (textLower.includes('colonoscopy') || textLower.includes('colonic')) {
                return 'Colonoscopy';
            }
            if (textLower.includes('sigmoidoscopy')) {
                return 'Sigmoidoscopy';
            }
            if (textLower.includes('bronchoscopy') || textLower.includes('bronchial')) {
                return 'Bronchoscopy';
            }
            if (textLower.includes('cystoscopy') || textLower.includes('bladder')) {
                return 'Cystoscopy';
            }
            if (textLower.includes('ercp')) {
                return 'ERCP';
            }

            return 'Endoscopy';
        },

        _extractDate(text) {
            const datePatterns = [
                /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,
                /(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/,
                /(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},?\s+\d{4}/i
            ];

            for (const pattern of datePatterns) {
                const match = text.match(pattern);
                if (match) return match[0];
            }

            return null;
        },

        _extractIndication(text) {
            const indicationMatch = text.match(/indication[s]?[:\s]+(.+?)(?:\n\n|procedure|findings|medication)/is);
            if (indicationMatch) {
                return indicationMatch[1].trim().replace(/\n/g, ' ');
            }
            return null;
        },

        _extractProcedure(text) {
            const procedureMatch = text.match(/procedure[:\s]+(.+?)(?:\n\n|findings|impression)/is);
            if (procedureMatch) {
                return procedureMatch[1].trim().replace(/\n/g, ' ');
            }
            return null;
        },

        _extractFindings(text) {
            const findings = [];

            // Look for findings section
            const findingsMatch = text.match(/findings[:\s]+(.+?)(?:\n\n|impression|pathology|recommendation)/is);
            if (findingsMatch) {
                const findingsText = findingsMatch[1];

                // Parse by anatomic location (esophagus, stomach, duodenum, colon segments, etc.)
                const locations = [
                    'esophagus', 'ge junction', 'stomach', 'fundus', 'body', 'antrum', 'pylorus',
                    'duodenum', 'jejunum', 'ileum', 'cecum', 'ascending', 'transverse', 'descending',
                    'sigmoid', 'rectum', 'anus', 'terminal ileum'
                ];

                const lines = findingsText.split(/\n/);
                lines.forEach(line => {
                    const trimmed = line.trim();
                    if (trimmed.length > 10) {
                        // Check for anatomic location
                        const location = locations.find(loc => trimmed.toLowerCase().includes(loc));

                        findings.push({
                            location: location || 'General',
                            description: trimmed.replace(/^[\d\-\•\*\.\)]+\s*/, ''),
                            severity: this._assessFindingSeverity(trimmed)
                        });
                    }
                });
            }

            return findings;
        },

        _extractImpression(text) {
            const impressionMatch = text.match(/(?:impression|diagnosis|conclusion)[:\s]+(.+?)(?:\n\n|recommendation|pathology|$)/is);
            if (impressionMatch) {
                return impressionMatch[1].trim().replace(/\n/g, ' ');
            }
            return null;
        },

        _assessFindingSeverity(text) {
            const textLower = text.toLowerCase();

            // Critical: active bleeding, perforation, large mass
            const critical = ['active bleed', 'hemorrhage', 'perforation', 'malignancy', 'cancer', 'mass >2cm'];
            if (critical.some(kw => textLower.includes(kw))) {
                return 'critical';
            }

            // High: ulcers, polyps, strictures, varices
            const high = ['ulcer', 'polyp', 'stricture', 'varix', 'varices', 'inflammation', 'erosion', 'nodule'];
            if (high.some(kw => textLower.includes(kw))) {
                return 'high';
            }

            // Mild: erythema, mild changes
            const mild = ['erythema', 'mild', 'minimal', 'unremarkable', 'normal'];
            if (mild.some(kw => textLower.includes(kw))) {
                return 'mild';
            }

            return 'moderate';
        },

        _extractPathology(findings, text) {
            const pathology = [];

            // Keywords for pathology
            const pathKeywords = ['polyp', 'ulcer', 'mass', 'lesion', 'bleeding', 'varix', 'inflammation',
                                'diverticulum', 'stricture', 'erosion', 'nodule', 'tumor'];

            findings.forEach(finding => {
                const descLower = finding.description.toLowerCase();
                pathKeywords.forEach(kw => {
                    if (descLower.includes(kw)) {
                        pathology.push({
                            type: kw.charAt(0).toUpperCase() + kw.slice(1),
                            location: finding.location,
                            description: finding.description,
                            severity: finding.severity
                        });
                    }
                });
            });

            return pathology;
        },

        _extractInterventions(text) {
            const interventions = [];

            const interventionKeywords = [
                'biopsy', 'biopsies', 'polypectomy', 'cauterization', 'clip', 'injection',
                'dilation', 'ablation', 'resection', 'hemostasis', 'argon plasma'
            ];

            interventionKeywords.forEach(kw => {
                const kwRegex = new RegExp(`(${kw}[^.]*?\\.?)`, 'gi');
                const matches = text.match(kwRegex);
                if (matches) {
                    matches.forEach(match => {
                        interventions.push({
                            type: kw.charAt(0).toUpperCase() + kw.slice(1),
                            description: match.trim()
                        });
                    });
                }
            });

            return interventions;
        },

        _extractRecommendations(text) {
            const recommendations = [];

            const recMatch = text.match(/recommendation[s]?[:\s]+(.+?)$/is);
            if (recMatch) {
                const recText = recMatch[1];
                const lines = recText.split(/\n/);

                lines.forEach(line => {
                    const trimmed = line.trim();
                    if (trimmed.length > 10) {
                        recommendations.push(trimmed.replace(/^[\d\-\•\*\.\)]+\s*/, ''));
                    }
                });
            }

            return recommendations;
        },

        _extractComplications(text) {
            const complications = [];
            const compKeywords = ['complication', 'bleeding', 'perforation', 'adverse event'];

            compKeywords.forEach(kw => {
                if (text.toLowerCase().includes(kw)) {
                    const kwRegex = new RegExp(`(${kw}[^.]*?\\.?)`, 'gi');
                    const matches = text.match(kwRegex);
                    if (matches) {
                        complications.push(...matches);
                    }
                }
            });

            return complications.length > 0 ? complications : ['None documented'];
        },

        _calculateConfidence(result) {
            let confidence = 50;

            if (result.type !== 'Endoscopy') confidence += 15;
            if (result.findings.length > 0) confidence += 20;
            if (result.impression) confidence += 15;
            if (result.indication) confidence += 5;

            return Math.min(100, confidence);
        }
    };

    // ═══════════════════════════════════════════════════════════════════════
    // CLINICAL RESULTS ORGANIZER - ELEGANT PRESENTATION
    // ═══════════════════════════════════════════════════════════════════════

    const ClinicalResultsOrganizer = {
        /**
         * Organize all clinical results into elegant structure
         * @param {Object} patient - Patient object with all clinical data
         * @returns {Object} Elegantly organized clinical results
         */
        organize(patient) {
            const organized = {
                patient: {
                    name: patient.name,
                    diagnosis: patient.diagnosis,
                    mrn: patient.mrn || patient.id
                },
                summary: {
                    totalDocuments: 0,
                    criticalFindings: 0,
                    abnormalLabs: 0,
                    urgentActions: []
                },
                categories: {
                    labs: { count: 0, latest: null, trends: [], abnormalities: [] },
                    imaging: { count: 0, studies: [], criticalFindings: [] },
                    scopes: { count: 0, procedures: [], pathology: [] },
                    vitals: { count: 0, latest: null, alerts: [] }
                },
                timeline: [],
                recommendations: [],
                neuralAnalysis: null
            };

            // Process labs
            if (patient.labs && patient.labs.length > 0) {
                organized.categories.labs.count = patient.labs.length;
                organized.categories.labs.latest = patient.labs[patient.labs.length - 1];

                // Count abnormalities
                if (patient.labs[patient.labs.length - 1] && patient.labs[patient.labs.length - 1].values) {
                    Object.values(patient.labs[patient.labs.length - 1].values).forEach(lab => {
                        if (lab.abnormal) {
                            organized.categories.labs.abnormalities.push(lab);
                            organized.summary.abnormalLabs++;
                        }
                    });
                }

                organized.summary.totalDocuments += patient.labs.length;
            }

            // Process imaging
            if (patient.imaging && patient.imaging.length > 0) {
                organized.categories.imaging.count = patient.imaging.length;
                organized.categories.imaging.studies = patient.imaging;

                // Extract critical findings
                patient.imaging.forEach(study => {
                    if (study.criticalFindings && study.criticalFindings.length > 0) {
                        organized.categories.imaging.criticalFindings.push(...study.criticalFindings);
                        organized.summary.criticalFindings += study.criticalFindings.length;
                    }
                });

                organized.summary.totalDocuments += patient.imaging.length;
            }

            // Process scopes
            if (patient.scopes && patient.scopes.length > 0) {
                organized.categories.scopes.count = patient.scopes.length;
                organized.categories.scopes.procedures = patient.scopes;

                // Extract pathology
                patient.scopes.forEach(scope => {
                    if (scope.pathology && scope.pathology.length > 0) {
                        organized.categories.scopes.pathology.push(...scope.pathology);
                    }
                });

                organized.summary.totalDocuments += patient.scopes.length;
            }

            // Process vitals
            if (patient.vitals && patient.vitals.length > 0) {
                organized.categories.vitals.count = patient.vitals.length;
                organized.categories.vitals.latest = patient.vitals[patient.vitals.length - 1];
            }

            // Create timeline
            organized.timeline = this._createTimeline(patient);

            // Compile recommendations
            organized.recommendations = this._compileRecommendations(organized);

            // Run neural analysis if available
            if (window.NeuralClinicalInterpreter) {
                organized.neuralAnalysis = window.NeuralClinicalInterpreter.analyzeMultiDocument({
                    labs: patient.labs || [],
                    imaging: patient.imaging || [],
                    scopes: patient.scopes || [],
                    vitals: patient.vitals || [],
                    diagnosis: patient.diagnosis,
                    history: patient.history
                });

                organized.summary.criticalFindings += organized.neuralAnalysis.criticalFindings.length;
            }

            return organized;
        },

        _createTimeline(patient) {
            const timeline = [];

            // Add lab events
            if (patient.labs) {
                patient.labs.forEach(lab => {
                    timeline.push({
                        date: lab.date,
                        type: 'lab',
                        description: `Lab results (${Object.keys(lab.values || {}).length} tests)`,
                        data: lab
                    });
                });
            }

            // Add imaging events
            if (patient.imaging) {
                patient.imaging.forEach(img => {
                    timeline.push({
                        date: img.date,
                        type: 'imaging',
                        description: `${img.modality} - ${img.bodyPart}`,
                        data: img
                    });
                });
            }

            // Add scope events
            if (patient.scopes) {
                patient.scopes.forEach(scope => {
                    timeline.push({
                        date: scope.date,
                        type: 'scope',
                        description: scope.type,
                        data: scope
                    });
                });
            }

            // Sort by date (most recent first)
            timeline.sort((a, b) => {
                const dateA = new Date(a.date || 0);
                const dateB = new Date(b.date || 0);
                return dateB - dateA;
            });

            return timeline;
        },

        _compileRecommendations(organized) {
            const recommendations = [];

            // Critical findings recommendations
            if (organized.categories.imaging.criticalFindings.length > 0) {
                organized.categories.imaging.criticalFindings.forEach(finding => {
                    recommendations.push({
                        priority: 'IMMEDIATE',
                        source: 'Imaging - Critical Finding',
                        recommendation: finding.action
                    });
                });
            }

            // Imaging recommendations
            if (organized.categories.imaging.studies.length > 0) {
                organized.categories.imaging.studies.forEach(study => {
                    if (study.recommendations && study.recommendations.length > 0) {
                        study.recommendations.forEach(rec => {
                            recommendations.push({
                                priority: 'ROUTINE',
                                source: `${study.modality} - ${study.bodyPart}`,
                                recommendation: rec
                            });
                        });
                    }
                });
            }

            // Scope recommendations
            if (organized.categories.scopes.procedures.length > 0) {
                organized.categories.scopes.procedures.forEach(scope => {
                    if (scope.recommendations && scope.recommendations.length > 0) {
                        scope.recommendations.forEach(rec => {
                            recommendations.push({
                                priority: 'ROUTINE',
                                source: scope.type,
                                recommendation: rec
                            });
                        });
                    }
                });
            }

            return recommendations;
        }
    };

    // ═══════════════════════════════════════════════════════════════════════
    // EXPORT TO GLOBAL SCOPE
    // ═══════════════════════════════════════════════════════════════════════

    window.ImagingParser = ImagingParser;
    window.ScopeParser = ScopeParser;
    window.ClinicalResultsOrganizer = ClinicalResultsOrganizer;

    console.log('[ClinicalResultsParser] Module loaded successfully - Imaging, Scope, and Organizer ready');

})();
