/* ═══════════════════════════════════════════════════════════════════════════
   ADAPTIVE NEURAL EXPANSION - DEMONSTRATION & TESTING MODULE

   This module demonstrates the capabilities of the Adaptive Neural Expansion
   System with real-world medical scenarios.

   ═══════════════════════════════════════════════════════════════════════════ */

(function() {
    'use strict';

    // ═══════════════════════════════════════════════════════════════════════
    // DEMO SCENARIOS - Testing Knowledge Gap Detection & Expansion
    // ═══════════════════════════════════════════════════════════════════════

    const DEMO_SCENARIOS = [
        {
            name: 'Rare Genetic Disorder',
            query: 'Fabry Disease',
            description: 'Testing rare genetic disorder guideline generation',
            expectedOutcome: 'Generate comprehensive guideline with genetic considerations'
        },
        {
            name: 'Emerging Infectious Disease',
            query: 'Post-Acute COVID Syndrome',
            description: 'Testing emerging disease knowledge expansion',
            expectedOutcome: 'Generate evidence-based guideline for long COVID'
        },
        {
            name: 'Complex Multi-System Disorder',
            query: 'Systemic Lupus Erythematosus',
            description: 'Testing complex autoimmune condition',
            expectedOutcome: 'Generate guideline with multi-specialty considerations'
        },
        {
            name: 'Niche Cardiovascular Condition',
            query: 'Takotsubo Cardiomyopathy',
            description: 'Testing specialized cardiac condition',
            expectedOutcome: 'Generate cardiac-specific guideline with scoring'
        },
        {
            name: 'Neurological Rare Disease',
            query: 'Progressive Supranuclear Palsy',
            description: 'Testing rare neurodegenerative disorder',
            expectedOutcome: 'Generate neurological guideline with monitoring'
        },
        {
            name: 'Existing Condition (Negative Test)',
            query: 'Heart Failure',
            description: 'Should detect existing guideline',
            expectedOutcome: 'Return existing guideline without generation'
        }
    ];

    // ═══════════════════════════════════════════════════════════════════════
    // DEMO EXECUTION ENGINE
    // ═══════════════════════════════════════════════════════════════════════

    class NeuralExpansionDemo {
        constructor() {
            this.results = [];
            this.startTime = null;
            this.endTime = null;
        }

        /**
         * Run comprehensive system demonstration
         */
        async runFullDemo() {
            console.log('╔═══════════════════════════════════════════════════════════════╗');
            console.log('║   ADAPTIVE NEURAL EXPANSION SYSTEM - COMPREHENSIVE DEMO       ║');
            console.log('╚═══════════════════════════════════════════════════════════════╝');
            console.log('');

            if (!window.AdaptiveNeuralExpansion || !window.AdaptiveNeuralExpansion.isReady) {
                console.error('❌ Adaptive Neural Expansion System not loaded!');
                return;
            }

            this.startTime = Date.now();

            // Run all demo scenarios
            for (const scenario of DEMO_SCENARIOS) {
                await this.runScenario(scenario);
                console.log(''); // Spacing between scenarios
            }

            this.endTime = Date.now();

            // Display summary
            this.displaySummary();

            // Display performance metrics
            this.displayPerformanceMetrics();
        }

        /**
         * Run individual scenario
         */
        async runScenario(scenario) {
            console.log(`▶ SCENARIO: ${scenario.name}`);
            console.log(`  Query: "${scenario.query}"`);
            console.log(`  Description: ${scenario.description}`);
            console.log(`  Expected: ${scenario.expectedOutcome}`);
            console.log('  ─────────────────────────────────────────────────────');

            const scenarioStart = Date.now();

            try {
                const result = await window.AdaptiveNeuralExpansion.expandKnowledge(scenario.query);
                const scenarioEnd = Date.now();
                const duration = scenarioEnd - scenarioStart;

                // Log result
                this.logResult(scenario, result, duration);

                // Store result
                this.results.push({
                    scenario: scenario,
                    result: result,
                    duration: duration,
                    success: result.success
                });

            } catch (error) {
                console.error(`  ❌ ERROR: ${error.message}`);
                this.results.push({
                    scenario: scenario,
                    error: error,
                    success: false
                });
            }
        }

        /**
         * Log scenario result
         */
        logResult(scenario, result, duration) {
            if (result.success && !result.gap) {
                // Existing guideline found
                console.log(`  ✅ SUCCESS: Existing guideline found`);
                console.log(`  📋 Guideline: ${result.existingGuideline || 'Found in knowledge base'}`);
                console.log(`  ⏱️  Duration: ${duration}ms`);

            } else if (result.success && result.generated) {
                // New guideline generated
                console.log(`  🎉 SUCCESS: New guideline generated!`);
                console.log(`  📊 Confidence: ${(result.confidence * 100).toFixed(1)}%`);
                console.log(`  📋 Guideline Name: ${result.guideline.name}`);
                console.log(`  📚 Category: ${result.guideline.category}`);
                console.log(`  🔬 Evidence Level: ${result.guideline.evidenceLevel}`);
                console.log(`  👨‍⚕️  Expert Review Required: ${result.requiresExpertReview ? 'YES' : 'NO'}`);
                console.log(`  ⏱️  Duration: ${duration}ms`);

                // Display key components
                if (result.guideline.treatment) {
                    console.log(`  💊 Medications: ${result.guideline.treatment.medications?.length || 0} interventions`);
                    console.log(`  🏃 Non-pharmacological: ${result.guideline.treatment.nonpharm?.length || 0} interventions`);
                }

                if (result.guideline.monitoring) {
                    console.log(`  🔍 Monitoring Labs: ${result.guideline.monitoring.labs?.length || 0} tests`);
                }

                if (result.guideline.scores && result.guideline.scores.length > 0) {
                    console.log(`  📊 Scoring Systems: ${result.guideline.scores.length} scoring tool(s)`);
                    result.guideline.scores.forEach(score => {
                        console.log(`     - ${score.name}: ${score.purpose}`);
                    });
                }

            } else {
                // Failed or insufficient confidence
                console.log(`  ⚠️  WARNING: ${result.reason || 'Unable to generate guideline'}`);
                if (result.confidence) {
                    console.log(`  📊 Confidence: ${(result.confidence * 100).toFixed(1)}% (threshold: 70%)`);
                }
                console.log(`  💡 Recommendation: ${result.recommendation || 'Consult specialist'}`);
                console.log(`  ⏱️  Duration: ${duration}ms`);
            }
        }

        /**
         * Display comprehensive summary
         */
        displaySummary() {
            console.log('');
            console.log('╔═══════════════════════════════════════════════════════════════╗');
            console.log('║                        DEMO SUMMARY                            ║');
            console.log('╚═══════════════════════════════════════════════════════════════╝');

            const totalDuration = this.endTime - this.startTime;
            const successCount = this.results.filter(r => r.success).length;
            const generatedCount = this.results.filter(r => r.result?.generated).length;
            const existingCount = this.results.filter(r => r.result?.gap === false).length;
            const averageDuration = this.results.reduce((sum, r) => sum + (r.duration || 0), 0) / this.results.length;

            console.log(`  📊 Total Scenarios: ${this.results.length}`);
            console.log(`  ✅ Successful: ${successCount}/${this.results.length}`);
            console.log(`  🆕 Generated New: ${generatedCount}`);
            console.log(`  📚 Used Existing: ${existingCount}`);
            console.log(`  ⏱️  Total Duration: ${totalDuration}ms`);
            console.log(`  ⏱️  Average Duration: ${averageDuration.toFixed(0)}ms per scenario`);
            console.log('');

            // Display generated guidelines details
            if (generatedCount > 0) {
                console.log('  🎉 NEWLY GENERATED GUIDELINES:');
                this.results
                    .filter(r => r.result?.generated)
                    .forEach((r, i) => {
                        console.log(`     ${i + 1}. ${r.result.guideline.name}`);
                        console.log(`        Confidence: ${(r.result.confidence * 100).toFixed(1)}%`);
                        console.log(`        Category: ${r.result.guideline.category}`);
                        console.log(`        Version: ${r.result.guideline.version}`);
                    });
            }

            console.log('');
        }

        /**
         * Display system performance metrics
         */
        displayPerformanceMetrics() {
            const metrics = window.AdaptiveNeuralExpansion.getMetrics();

            console.log('╔═══════════════════════════════════════════════════════════════╗');
            console.log('║                   SYSTEM PERFORMANCE METRICS                   ║');
            console.log('╚═══════════════════════════════════════════════════════════════╝');
            console.log('');
            console.log('  KNOWLEDGE BASE STATUS:');
            console.log(`  📚 Built-in Guidelines: ${metrics.knowledgeBase.builtInGuidelines}`);
            console.log(`  🆕 Expanded Guidelines: ${metrics.knowledgeBase.expandedGuidelines}`);
            console.log(`  📖 Total Guidelines: ${metrics.knowledgeBase.totalGuidelines}`);
            console.log('');
            console.log('  GENERATION STATISTICS:');
            console.log(`  📊 Total Generations: ${metrics.stats.totalGenerated}`);
            console.log(`  ✅ Successful: ${metrics.stats.successfulGenerations}`);
            console.log(`  📈 Average Confidence: ${(metrics.stats.averageConfidence * 100).toFixed(1)}%`);
            if (metrics.stats.lastExpansion) {
                console.log(`  🕐 Last Expansion: ${new Date(metrics.stats.lastExpansion).toLocaleString()}`);
            }
            console.log('');
            console.log('  LEARNING SYSTEM:');
            console.log(`  🎓 Total Generations: ${metrics.totalGenerations}`);
            console.log(`  ✅ Expert Approvals: ${metrics.expertApprovals}`);
            console.log(`  ❌ Expert Rejections: ${metrics.expertRejections}`);
            console.log(`  📊 Approval Rate: ${(metrics.approvalRate * 100).toFixed(1)}%`);
            console.log('');
        }

        /**
         * Test specific guideline retrieval
         */
        async testGuidelineRetrieval(condition) {
            console.log(`\n🔍 Testing Guideline Retrieval: "${condition}"`);
            console.log('─────────────────────────────────────────────────────');

            const result = await window.AdaptiveNeuralExpansion.getGuideline(condition);

            if (result.found) {
                console.log(`✅ Guideline Found!`);
                console.log(`   Source: ${result.source}`);
                console.log(`   Name: ${result.guideline.name || condition}`);
                if (result.confidence) {
                    console.log(`   Confidence: ${(result.confidence * 100).toFixed(1)}%`);
                }
            } else {
                console.log(`❌ Guideline Not Found`);
                console.log(`   Reason: ${result.reason}`);
            }
        }

        /**
         * Display detailed guideline information
         */
        displayGuidelineDetails(guidelineName) {
            const guidelines = window.AdaptiveNeuralExpansion.getExpandedGuidelines();
            const guideline = guidelines[guidelineName];

            if (!guideline) {
                console.log(`❌ Guideline "${guidelineName}" not found`);
                return;
            }

            console.log('\n╔═══════════════════════════════════════════════════════════════╗');
            console.log(`║  GUIDELINE DETAILS: ${guidelineName.padEnd(43)} ║`);
            console.log('╚═══════════════════════════════════════════════════════════════╝');
            console.log('');
            console.log(`📋 Name: ${guideline.name}`);
            console.log(`📚 Category: ${guideline.category}`);
            console.log(`📊 Version: ${guideline.version}`);
            console.log(`📅 Generated: ${new Date(guideline.dateGenerated).toLocaleDateString()}`);
            console.log(`🔬 Evidence Level: ${guideline.evidenceLevel}`);
            console.log(`📈 Confidence: ${(guideline.confidence * 100).toFixed(1)}%`);
            console.log(`📊 Credibility Score: ${(guideline.credibilityScore * 100).toFixed(1)}%`);
            console.log(`👨‍⚕️  Expert Review Required: ${guideline.requiresExpertReview ? 'YES' : 'NO'}`);
            console.log('');

            // Overview
            if (guideline.overview) {
                console.log('📖 OVERVIEW:');
                console.log(`   ${guideline.overview.description}`);
                console.log('');
            }

            // Treatment
            if (guideline.treatment) {
                console.log('💊 TREATMENT:');
                if (guideline.treatment.medications) {
                    console.log('   Pharmacological:');
                    guideline.treatment.medications.forEach((med, i) => {
                        console.log(`   ${i + 1}. ${med}`);
                    });
                }
                if (guideline.treatment.nonpharm) {
                    console.log('   Non-Pharmacological:');
                    guideline.treatment.nonpharm.forEach((np, i) => {
                        console.log(`   ${i + 1}. ${np}`);
                    });
                }
                console.log('');
            }

            // Monitoring
            if (guideline.monitoring) {
                console.log('🔍 MONITORING:');
                if (guideline.monitoring.labs) {
                    console.log(`   Labs: ${guideline.monitoring.labs.join(', ')}`);
                }
                console.log(`   Frequency: ${guideline.monitoring.frequency}`);
                console.log('');
            }

            // Scoring Systems
            if (guideline.scores && guideline.scores.length > 0) {
                console.log('📊 SCORING SYSTEMS:');
                guideline.scores.forEach((score, i) => {
                    console.log(`   ${i + 1}. ${score.name}`);
                    console.log(`      Purpose: ${score.purpose}`);
                    console.log(`      Fields: ${score.fields?.length || 0} criteria`);
                });
                console.log('');
            }

            // References
            if (guideline.references && guideline.references.length > 0) {
                console.log('📚 REFERENCES:');
                guideline.references.forEach((ref, i) => {
                    console.log(`   ${i + 1}. ${ref}`);
                });
                console.log('');
            }

            // Disclaimer
            if (guideline.disclaimer) {
                console.log('⚠️  DISCLAIMER:');
                console.log(`   ${guideline.disclaimer.warning}`);
                console.log(`   ${guideline.disclaimer.recommendation}`);
                console.log('');
            }
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // GLOBAL API
    // ═══════════════════════════════════════════════════════════════════════

    window.NeuralExpansionDemo = {
        demo: new NeuralExpansionDemo(),

        // Quick demo functions
        runDemo: () => window.NeuralExpansionDemo.demo.runFullDemo(),
        testRetrieval: (condition) => window.NeuralExpansionDemo.demo.testGuidelineRetrieval(condition),
        showDetails: (guideline) => window.NeuralExpansionDemo.demo.displayGuidelineDetails(guideline),

        // Scenario access
        scenarios: DEMO_SCENARIOS,

        // Individual scenario testing
        runScenario: async (scenarioName) => {
            const scenario = DEMO_SCENARIOS.find(s => s.name === scenarioName);
            if (scenario) {
                await window.NeuralExpansionDemo.demo.runScenario(scenario);
            } else {
                console.log(`Scenario "${scenarioName}" not found`);
            }
        }
    };

    console.log('═══════════════════════════════════════════════════════════════');
    console.log('✅ NEURAL EXPANSION DEMO MODULE LOADED');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('Usage:');
    console.log('  NeuralExpansionDemo.runDemo()              - Run full demo');
    console.log('  NeuralExpansionDemo.testRetrieval("...")   - Test retrieval');
    console.log('  NeuralExpansionDemo.showDetails("...")     - Show guideline');
    console.log('═══════════════════════════════════════════════════════════════');

})();
