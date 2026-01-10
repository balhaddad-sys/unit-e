/**
 * ═══════════════════════════════════════════════════════════════════════════
 * UNIT E DEBUG TOOL v1.0
 * Add this script to your HTML to diagnose API connection issues
 * ═══════════════════════════════════════════════════════════════════════════
 */

(function() {
    'use strict';

    window.UnitEDebug = {
        version: '1.0.0',

        // Get current configuration
        getConfig: function() {
            const config = {
                configExists: typeof CONFIG !== 'undefined',
                configApiUrl: typeof CONFIG !== 'undefined' ? CONFIG.apiUrl : 'CONFIG not loaded',
                apiExists: typeof API !== 'undefined',
                aiConsultantExists: typeof AIMedicalConsultant !== 'undefined',
                aiConsultantConfig: null
            };

            if (typeof AIMedicalConsultant !== 'undefined' && AIMedicalConsultant.getConfig) {
                config.aiConsultantConfig = AIMedicalConsultant.getConfig();
            }

            return config;
        },

        // Test API connection
        testConnection: async function() {
            console.log('═══════════════════════════════════════════');
            console.log('🔍 UNIT E DEBUG - Testing API Connection');
            console.log('═══════════════════════════════════════════');

            const config = this.getConfig();
            console.log('📋 Current Configuration:', config);

            if (!config.configExists) {
                console.error('❌ CONFIG object not found! Make sure config.js is loaded.');
                return { success: false, error: 'CONFIG not loaded' };
            }

            const apiUrl = config.configApiUrl;
            console.log('📡 Testing API URL:', apiUrl);

            try {
                // Test 1: Basic connectivity
                console.log('\n🧪 Test 1: Basic connectivity (health check)...');
                const healthResponse = await fetch(apiUrl + '?action=health');
                const healthData = await healthResponse.json();
                console.log('✅ Health check response:', healthData);

                // Test 2: Test OpenAI
                console.log('\n🧪 Test 2: OpenAI API test...');
                const openaiResponse = await fetch(apiUrl + '?action=testchatgpt');
                const openaiData = await openaiResponse.json();
                console.log('✅ OpenAI test response:', openaiData);

                // Test 3: POST request (like the consultation)
                console.log('\n🧪 Test 3: POST request (claudeConsult)...');
                const postResponse = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                    body: JSON.stringify({
                        action: 'claudeConsult',
                        query: 'What is gout?',
                        patientContext: 'Test patient',
                        labValues: []
                    })
                });
                const postData = await postResponse.json();
                console.log('✅ POST consultation response:', postData);

                console.log('\n═══════════════════════════════════════════');
                console.log('✅ ALL TESTS PASSED');
                console.log('═══════════════════════════════════════════');

                return {
                    success: true,
                    health: healthData,
                    openai: openaiData,
                    consultation: postData
                };

            } catch (error) {
                console.error('❌ Test failed:', error);
                console.log('\n═══════════════════════════════════════════');
                console.log('❌ TESTS FAILED - See error above');
                console.log('═══════════════════════════════════════════');

                return {
                    success: false,
                    error: error.message,
                    errorType: error.name
                };
            }
        },

        // Check URL mismatch
        checkUrlMismatch: function() {
            console.log('═══════════════════════════════════════════');
            console.log('🔍 Checking for API URL mismatches...');
            console.log('═══════════════════════════════════════════');

            const urls = {
                config: typeof CONFIG !== 'undefined' ? CONFIG.apiUrl : null,
                aiConsultant: null
            };

            if (typeof AIMedicalConsultant !== 'undefined' && AIMedicalConsultant.getConfig) {
                urls.aiConsultant = AIMedicalConsultant.getConfig().apiUrl;
            }

            console.log('CONFIG.apiUrl:', urls.config);
            console.log('AIMedicalConsultant API URL:', urls.aiConsultant);

            if (urls.config && urls.aiConsultant && urls.config !== urls.aiConsultant) {
                console.error('⚠️ URL MISMATCH DETECTED!');
                console.error('The AI consultant is using a different URL than CONFIG.');
                console.error('This will cause errors!');
                return { mismatch: true, urls };
            }

            console.log('✅ URLs match (or one is not available)');
            return { mismatch: false, urls };
        },

        // Quick diagnostic
        diagnose: async function() {
            console.clear();
            console.log('╔══════════════════════════════════════════════════════════╗');
            console.log('║         UNIT E WARD ROUNDS - DIAGNOSTIC TOOL            ║');
            console.log('╚══════════════════════════════════════════════════════════╝\n');

            // Step 1: Check configuration
            const config = this.getConfig();
            console.log('Step 1: Configuration Check');
            console.log('----------------------------');
            console.table(config);

            // Step 2: Check URL mismatch
            console.log('\nStep 2: URL Mismatch Check');
            console.log('----------------------------');
            this.checkUrlMismatch();

            // Step 3: Test connection
            console.log('\nStep 3: API Connection Test');
            console.log('----------------------------');
            const testResult = await this.testConnection();

            // Summary
            console.log('\n╔══════════════════════════════════════════════════════════╗');
            console.log('║                    DIAGNOSTIC SUMMARY                     ║');
            console.log('╚══════════════════════════════════════════════════════════╝');

            if (testResult.success) {
                console.log('🎉 Everything looks good! API is working.');
                if (testResult.consultation && testResult.consultation.success) {
                    console.log('✅ OpenAI consultation is working!');
                } else {
                    console.log('⚠️ OpenAI consultation returned an error:', testResult.consultation?.error);
                }
            } else {
                console.log('❌ There are issues that need to be fixed:');
                console.log('   Error:', testResult.error);
                console.log('\n📋 Troubleshooting steps:');
                console.log('   1. Make sure config.js has the correct API URL');
                console.log('   2. Make sure the API URL matches your deployed Apps Script');
                console.log('   3. Check that OPENAI_API_KEY is set in Apps Script properties');
                console.log('   4. Try running ?action=testchatgpt on your API URL directly');
            }

            return testResult;
        },

        // Update API URL at runtime (for testing)
        setApiUrl: function(newUrl) {
            if (typeof CONFIG !== 'undefined') {
                console.log('Old CONFIG.apiUrl:', CONFIG.apiUrl);
                CONFIG.apiUrl = newUrl;
                console.log('New CONFIG.apiUrl:', CONFIG.apiUrl);
                console.log('✅ API URL updated. Try the consultation again.');
            } else {
                console.error('❌ CONFIG not found');
            }
        },

        // Show help
        help: function() {
            console.log(`
╔══════════════════════════════════════════════════════════╗
║              UNIT E DEBUG TOOL - HELP                    ║
╚══════════════════════════════════════════════════════════╝

Available commands:

  UnitEDebug.diagnose()
    - Run full diagnostic (recommended first step)

  UnitEDebug.testConnection()
    - Test API connection

  UnitEDebug.getConfig()
    - Show current configuration

  UnitEDebug.checkUrlMismatch()
    - Check if API URLs are consistent

  UnitEDebug.setApiUrl('https://...')
    - Update API URL at runtime for testing

  UnitEDebug.help()
    - Show this help message

Quick Start:
  1. Open browser console (F12)
  2. Run: UnitEDebug.diagnose()
  3. Check the output for errors
            `);
        }
    };

    console.log('🔧 Unit E Debug Tool loaded. Run UnitEDebug.help() for commands.');

})();
