/* ═══════════════════════════════════════════════════════════════════════════
   API DIAGNOSTICS - Debug helper for Unit E API issues

   Usage from browser console:
   - window.testAPI()          - Test basic API connection
   - window.testOCR()          - Test OCR with sample image
   - window.testClaudeVision() - Test Claude Vision API
   - window.showAPIInfo()      - Show all API configuration
   ═══════════════════════════════════════════════════════════════════════════ */

(function() {
    'use strict';

    // Get API URL from config or ocr-engine
    const getAPIUrl = () => {
        if (window.CONFIG && window.CONFIG.visionApiUrl) {
            return window.CONFIG.visionApiUrl;
        }
        // Fallback to hardcoded if config not loaded yet
        return 'https://script.google.com/macros/s/AKfycbz_2zC2ztoesY0XBd7_M9YzddWzRolYjqnjXF3xr_jM0Ry4nDzqoXOpFgQZJRl1zPdU/exec';
    };

    // Test basic API connection
    window.testAPI = async function() {
        console.log('\n╔═══════════════════════════════════════╗');
        console.log('║     API CONNECTION TEST               ║');
        console.log('╚═══════════════════════════════════════╝\n');

        const apiUrl = getAPIUrl();
        console.log('📍 API URL:', apiUrl);
        console.log('⏰ Timestamp:', new Date().toISOString());
        console.log('\n--- Sending Test Request ---');

        try {
            const startTime = Date.now();
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({ action: 'test' })
            });
            const elapsed = Date.now() - startTime;

            console.log('📥 Response received in', elapsed, 'ms');
            console.log('📊 Status:', response.status, response.statusText);
            console.log('📋 Headers:', Object.fromEntries([...response.headers.entries()]));

            const responseText = await response.text();
            console.log('📄 Response Body:', responseText);

            if (!response.ok) {
                console.error('\n❌ TEST FAILED - HTTP Error');
                console.error('Status:', response.status);
                console.error('Response:', responseText.substring(0, 500));
                return {
                    success: false,
                    error: `HTTP ${response.status}`,
                    response: responseText,
                    elapsed
                };
            }

            let result;
            try {
                result = JSON.parse(responseText);
                console.log('✅ Valid JSON Response:', result);
            } catch (e) {
                console.error('\n❌ TEST FAILED - Invalid JSON');
                console.error('Parse Error:', e.message);
                console.error('Response:', responseText.substring(0, 500));
                return {
                    success: false,
                    error: 'Invalid JSON: ' + e.message,
                    response: responseText,
                    elapsed
                };
            }

            console.log('\n✅ API TEST PASSED');
            console.log('Response Time:', elapsed, 'ms');
            console.log('Result:', result);

            return { success: true, result, elapsed };

        } catch (error) {
            console.error('\n❌ TEST FAILED - Network Error');
            console.error('Error Type:', error.name);
            console.error('Error Message:', error.message);
            console.error('Full Error:', error);
            return {
                success: false,
                error: error.message,
                errorType: error.name,
                details: error
            };
        }
    };

    // Test OCR with a small sample image
    window.testOCR = async function() {
        console.log('\n╔═══════════════════════════════════════╗');
        console.log('║     OCR API TEST                      ║');
        console.log('╚═══════════════════════════════════════╝\n');

        // Create a simple test image (1x1 white pixel)
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, 100, 100);
        ctx.fillStyle = 'black';
        ctx.font = '20px Arial';
        ctx.fillText('TEST', 20, 50);

        const testImage = canvas.toDataURL('image/jpeg', 0.9);
        console.log('📷 Created test image:', testImage.substring(0, 100) + '...');

        const apiUrl = getAPIUrl();
        console.log('📍 API URL:', apiUrl);
        console.log('\n--- Sending OCR Request ---');

        try {
            const startTime = Date.now();
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({
                    action: 'runOCR',
                    image: testImage
                })
            });
            const elapsed = Date.now() - startTime;

            console.log('📥 Response received in', elapsed, 'ms');
            console.log('📊 Status:', response.status, response.statusText);

            const responseText = await response.text();
            console.log('📄 Response (first 500 chars):', responseText.substring(0, 500));

            if (!response.ok) {
                console.error('\n❌ OCR TEST FAILED');
                console.error('Status:', response.status);
                console.error('Response:', responseText);
                return { success: false, error: `HTTP ${response.status}`, response: responseText, elapsed };
            }

            const result = JSON.parse(responseText);
            console.log('\n✅ OCR TEST PASSED');
            console.log('Extracted Text:', result.text);
            console.log('Confidence:', result.confidence);
            console.log('Elapsed:', elapsed, 'ms');

            return { success: true, result, elapsed };

        } catch (error) {
            console.error('\n❌ OCR TEST FAILED');
            console.error('Error:', error.message);
            console.error('Full Error:', error);
            return { success: false, error: error.message, details: error };
        }
    };

    // Test Claude Vision API
    window.testClaudeVision = async function() {
        console.log('\n╔═══════════════════════════════════════╗');
        console.log('║     CLAUDE VISION API TEST            ║');
        console.log('╚═══════════════════════════════════════╝\n');

        // Create a test image
        const canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 100;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, 200, 100);
        ctx.fillStyle = 'black';
        ctx.font = '16px Arial';
        ctx.fillText('WBC: 8.5', 20, 40);
        ctx.fillText('Hgb: 14.2', 20, 70);

        const testImage = canvas.toDataURL('image/jpeg', 0.9);
        console.log('📷 Created test lab image');

        const apiUrl = getAPIUrl();
        console.log('📍 API URL:', apiUrl);
        console.log('\n--- Sending Claude Vision Request ---');

        try {
            const startTime = Date.now();
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({
                    action: 'claudeVision',
                    image: testImage
                })
            });
            const elapsed = Date.now() - startTime;

            console.log('📥 Response received in', elapsed, 'ms');
            console.log('📊 Status:', response.status, response.statusText);

            const responseText = await response.text();
            console.log('📄 Response (first 500 chars):', responseText.substring(0, 500));

            if (!response.ok) {
                console.error('\n❌ CLAUDE TEST FAILED');
                console.error('Status:', response.status);
                console.error('Response:', responseText);
                return { success: false, error: `HTTP ${response.status}`, response: responseText, elapsed };
            }

            const result = JSON.parse(responseText);
            console.log('\n✅ CLAUDE VISION TEST PASSED');
            console.log('Values Found:', result.values?.length || 0);
            console.log('Report Type:', result.reportType);
            console.log('Confidence:', result.confidence);
            console.log('Elapsed:', elapsed, 'ms');

            return { success: true, result, elapsed };

        } catch (error) {
            console.error('\n❌ CLAUDE TEST FAILED');
            console.error('Error:', error.message);
            console.error('Full Error:', error);
            return { success: false, error: error.message, details: error };
        }
    };

    // Show all API configuration
    window.showAPIInfo = function() {
        console.log('\n╔═══════════════════════════════════════╗');
        console.log('║     API CONFIGURATION INFO            ║');
        console.log('╚═══════════════════════════════════════╝\n');

        const apiUrl = getAPIUrl();
        console.log('📍 Vision API URL:', apiUrl);
        console.log('🔧 Config Loaded:', !!window.CONFIG);
        console.log('🔧 OCR Engine Ready:', !!window.OCREngine?.isReady);
        console.log('🔧 Lab Parser Ready:', !!window.LabParser?.isReady);

        if (window.CONFIG) {
            console.log('\n--- Config Details ---');
            console.log('Firebase:', window.CONFIG.firebase?.projectId || 'Not configured');
            console.log('Sheet URL:', window.CONFIG.sheetUrl || 'Not configured');
            console.log('Wards:', window.CONFIG.wards?.length || 0);
        }

        console.log('\n💡 Available Test Functions:');
        console.log('  - window.testAPI()          Test basic connection');
        console.log('  - window.testOCR()          Test OCR functionality');
        console.log('  - window.testClaudeVision() Test Claude Vision');
        console.log('  - window.showAPIInfo()      Show this info');
    };

    // Auto-run on load
    console.log('✅ API Diagnostics loaded');
    console.log('💡 Type window.testAPI() to test the API connection');
    console.log('💡 Type window.showAPIInfo() to see configuration');

})();
