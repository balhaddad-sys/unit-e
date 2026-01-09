/**
 * AI Medical Consultant Module
 * Provides conversational AI for medical consultations using Claude API
 */

(function() {
    'use strict';

    // Store conversation history per patient
    const conversationHistory = {};

    /**
     * Start a new consultation session for a patient
     */
    function startConsultation(patientId) {
        if (!conversationHistory[patientId]) {
            conversationHistory[patientId] = [];
        }
        console.log('[AI Consultant] Started consultation for patient:', patientId);
        return conversationHistory[patientId];
    }

    /**
     * Get conversation history for a patient
     */
    function getHistory(patientId) {
        return conversationHistory[patientId] || [];
    }

    /**
     * Clear conversation history for a patient
     */
    function clearHistory(patientId) {
        conversationHistory[patientId] = [];
        console.log('[AI Consultant] Cleared history for patient:', patientId);
    }

    /**
     * Ask a question to Claude about a patient
     */
    async function askQuestion(patientId, question, patientData) {
        console.log('[AI Consultant] Question:', question);
        
        // Initialize history if needed
        if (!conversationHistory[patientId]) {
            conversationHistory[patientId] = [];
        }

        // Add user message to history
        conversationHistory[patientId].push({
            role: 'user',
            content: question,
            timestamp: Date.now()
        });

        try {
            // Build patient context
            const patientContext = {
                name: patientData?.name || 'Unknown',
                ward: patientData?.ward || 'Unknown',
                bed: patientData?.bed || 'Unknown',
                diagnosis: patientData?.diagnosis || 'Unknown',
                status: patientData?.status || 'Unknown',
                doctor: patientData?.doctor || 'Unknown'
            };

            // Get lab values if available
            const labValues = patientData?.labData?.[0]?.values || [];

            // Call Claude API through backend
            const result = await window.API.claudeConsult(question, patientContext, labValues);

            console.log('[AI Consultant] API Response:', result);

            if (result.success && result.response) {
                // Add assistant response to history
                conversationHistory[patientId].push({
                    role: 'assistant',
                    content: result.response,
                    timestamp: Date.now()
                });

                return {
                    success: true,
                    response: result.response
                };
            } else {
                const errorMsg = result.error || 'Failed to get response from AI';
                
                // Add error to history
                conversationHistory[patientId].push({
                    role: 'assistant',
                    content: '⚠️ Error: ' + errorMsg,
                    timestamp: Date.now(),
                    isError: true
                });

                return {
                    success: false,
                    error: errorMsg
                };
            }
        } catch (error) {
            console.error('[AI Consultant] Error:', error);
            
            const errorMsg = error.message || 'Unknown error occurred';
            
            // Add error to history
            conversationHistory[patientId].push({
                role: 'assistant',
                content: '⚠️ Error: ' + errorMsg,
                timestamp: Date.now(),
                isError: true
            });

            return {
                success: false,
                error: errorMsg
            };
        }
    }

    /**
     * Format lab values for display
     */
    function formatLabValues(labData) {
        if (!labData || !labData.values || labData.values.length === 0) {
            return 'No lab values available';
        }

        return labData.values.map(v => {
            const flag = v.flag === 'H' ? '↑' : v.flag === 'L' ? '↓' : '';
            return `${v.test}: ${v.value} ${v.unit || ''} ${flag}`.trim();
        }).join('\n');
    }

    /**
     * Get suggested questions based on patient data
     */
    function getSuggestedQuestions(patientData) {
        const suggestions = [
            'What are the key considerations for this diagnosis?',
            'What lab tests should I order?',
            'What are the treatment options?',
            'Are there any drug interactions I should be aware of?',
            'What are the warning signs to watch for?'
        ];

        // Add diagnosis-specific suggestions
        if (patientData?.diagnosis) {
            const dx = patientData.diagnosis.toLowerCase();
            
            if (dx.includes('infection') || dx.includes('sepsis')) {
                suggestions.unshift('What antibiotic coverage is recommended?');
            }
            if (dx.includes('aki') || dx.includes('renal')) {
                suggestions.unshift('How should I adjust medications for renal function?');
            }
            if (dx.includes('cva') || dx.includes('stroke')) {
                suggestions.unshift('What is the recommended stroke workup?');
            }
            if (dx.includes('cardiac') || dx.includes('heart') || dx.includes('mi')) {
                suggestions.unshift('What cardiac monitoring is needed?');
            }
        }

        return suggestions.slice(0, 5);
    }

    // Export to window
    window.AIMedicalConsultant = {
        startConsultation,
        getHistory,
        clearHistory,
        askQuestion,
        formatLabValues,
        getSuggestedQuestions
    };

    console.log('[AI Medical Consultant] Module loaded successfully');
})();
