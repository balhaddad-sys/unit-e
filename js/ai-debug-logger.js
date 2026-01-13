/**
 * ═══════════════════════════════════════════════════════════════════════════
 * AI DEBUG LOGGER
 * Version: 1.0
 * Created: 2026-01-13
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Enhanced logging wrapper for AI calls with automatic diagnostics:
 * - Automatic request/response logging
 * - Performance monitoring
 * - Error tracking with stack traces
 * - Local storage persistence
 * - Export diagnostics to backend
 *
 * Usage:
 *   // Wrap an AI call
 *   const result = await AIDebugLogger.wrapCall('OCR', () => performOCR(image));
 *
 *   // Enable/disable logging
 *   AIDebugLogger.enable();
 *   AIDebugLogger.disable();
 *
 *   // Get diagnostics
 *   const stats = AIDebugLogger.getStats();
 *
 *   // Export logs
 *   AIDebugLogger.exportLogs();
 * ═══════════════════════════════════════════════════════════════════════════
 */

const AIDebugLogger = (function() {
    'use strict';

    // Configuration
    const config = {
        enabled: true,
        maxLogs: 100,
        storageKey: 'ai_debug_logs',
        consoleOutput: true,
        persistToStorage: true,
        autoExport: false,
        detailedErrors: true
    };

    // In-memory log storage
    let logs = [];
    let stats = {
        totalCalls: 0,
        successfulCalls: 0,
        failedCalls: 0,
        totalDuration: 0,
        avgDuration: 0,
        errors: []
    };

    /**
     * Initialize logger - load existing logs from storage
     */
    function init() {
        if (config.persistToStorage) {
            try {
                const stored = localStorage.getItem(config.storageKey);
                if (stored) {
                    const data = JSON.parse(stored);
                    logs = data.logs || [];
                    stats = data.stats || stats;
                }
            } catch (e) {
                console.error('[AI Debug Logger] Failed to load logs from storage:', e);
            }
        }
        console.log('[AI Debug Logger] Initialized. Logs:', logs.length);
    }

    /**
     * Save logs to local storage
     */
    function saveToStorage() {
        if (!config.persistToStorage) return;

        try {
            localStorage.setItem(config.storageKey, JSON.stringify({
                logs: logs,
                stats: stats,
                lastUpdated: new Date().toISOString()
            }));
        } catch (e) {
            console.error('[AI Debug Logger] Failed to save logs to storage:', e);
        }
    }

    /**
     * Add a log entry
     */
    function addLog(type, callName, details) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            id: Date.now() + Math.random(),
            timestamp: timestamp,
            type: type,
            callName: callName,
            details: details
        };

        logs.unshift(logEntry);

        // Keep only max logs
        if (logs.length > config.maxLogs) {
            logs = logs.slice(0, config.maxLogs);
        }

        // Console output
        if (config.consoleOutput) {
            const emoji = type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️';
            console.log(
                `${emoji} [AI Debug] ${callName}`,
                details
            );
        }

        saveToStorage();
    }

    /**
     * Wrap an AI call with logging and diagnostics
     *
     * @param {string} callName - Name of the AI call (e.g., 'OCR', 'Consultation')
     * @param {Function} callFunction - Async function to execute
     * @param {Object} context - Optional context information
     * @returns {Promise} Result of the call
     */
    async function wrapCall(callName, callFunction, context = {}) {
        if (!config.enabled) {
            return await callFunction();
        }

        const callId = Date.now() + Math.random();
        const startTime = performance.now();
        const startTimestamp = new Date().toISOString();

        // Log call start
        addLog('info', callName, {
            event: 'call_start',
            callId: callId,
            context: context,
            timestamp: startTimestamp
        });

        stats.totalCalls++;

        try {
            // Execute the call
            const result = await callFunction();
            const duration = performance.now() - startTime;

            // Update stats
            stats.successfulCalls++;
            stats.totalDuration += duration;
            stats.avgDuration = stats.totalDuration / stats.totalCalls;

            // Log success
            addLog('success', callName, {
                event: 'call_success',
                callId: callId,
                duration: Math.round(duration),
                durationFormatted: formatDuration(duration),
                context: context,
                resultType: typeof result,
                resultPreview: getResultPreview(result)
            });

            return result;

        } catch (error) {
            const duration = performance.now() - startTime;

            // Update stats
            stats.failedCalls++;
            stats.totalDuration += duration;
            stats.avgDuration = stats.totalDuration / stats.totalCalls;

            // Capture detailed error info
            const errorInfo = {
                message: error.message,
                name: error.name,
                stack: config.detailedErrors ? error.stack : undefined,
                type: error.constructor.name
            };

            stats.errors.push({
                timestamp: new Date().toISOString(),
                callName: callName,
                error: errorInfo
            });

            // Log error
            addLog('error', callName, {
                event: 'call_error',
                callId: callId,
                duration: Math.round(duration),
                durationFormatted: formatDuration(duration),
                context: context,
                error: errorInfo
            });

            // Re-throw the error
            throw error;
        }
    }

    /**
     * Wrap an API call with automatic error diagnosis
     */
    async function wrapAPICall(callName, apiFunction, requestData = {}) {
        return await wrapCall(callName, async () => {
            const startTime = Date.now();

            try {
                const result = await apiFunction();

                // Check for common API error patterns
                if (result && !result.success && result.error) {
                    throw new Error(`API Error: ${result.error}`);
                }

                return result;

            } catch (error) {
                // Diagnose common errors
                const diagnosis = diagnoseError(error, requestData);

                addLog('error', callName, {
                    event: 'api_error',
                    error: error.message,
                    diagnosis: diagnosis,
                    requestPreview: getResultPreview(requestData)
                });

                throw error;
            }
        }, { type: 'api', requestSize: JSON.stringify(requestData).length });
    }

    /**
     * Diagnose common errors and provide recommendations
     */
    function diagnoseError(error, context = {}) {
        const errorMsg = error.message.toLowerCase();
        const diagnosis = {
            likely_cause: 'Unknown',
            recommendations: [],
            severity: 'error'
        };

        // Network errors
        if (errorMsg.includes('network') || errorMsg.includes('fetch failed')) {
            diagnosis.likely_cause = 'Network connectivity issue';
            diagnosis.recommendations = [
                'Check internet connection',
                'Verify API endpoint URL is correct',
                'Check if backend service is running',
                'Look for CORS issues in browser console'
            ];
            diagnosis.severity = 'critical';
        }

        // Timeout errors
        else if (errorMsg.includes('timeout') || errorMsg.includes('aborted')) {
            diagnosis.likely_cause = 'Request timeout';
            diagnosis.recommendations = [
                'Reduce image size if uploading images',
                'Check network speed',
                'Increase timeout duration in config',
                'Verify backend service is responsive'
            ];
            diagnosis.severity = 'warning';
        }

        // API key errors
        else if (errorMsg.includes('api key') || errorMsg.includes('unauthorized') || errorMsg.includes('401')) {
            diagnosis.likely_cause = 'API key not configured or invalid';
            diagnosis.recommendations = [
                'Verify OPENAI_API_KEY is set in Script Properties',
                'Check API key format (should start with sk-)',
                'Ensure API key has not expired',
                'Check API key has correct permissions'
            ];
            diagnosis.severity = 'critical';
        }

        // Rate limit errors
        else if (errorMsg.includes('rate limit') || errorMsg.includes('429')) {
            diagnosis.likely_cause = 'API rate limit exceeded';
            diagnosis.recommendations = [
                'Wait before making more requests',
                'Implement request throttling',
                'Check API usage quota',
                'Consider upgrading API plan'
            ];
            diagnosis.severity = 'warning';
        }

        // CORS errors
        else if (errorMsg.includes('cors') || errorMsg.includes('cross-origin')) {
            diagnosis.likely_cause = 'CORS policy blocking request';
            diagnosis.recommendations = [
                'Ensure backend allows requests from your domain',
                'Check Web App deployment settings',
                'Verify "Execute as: User accessing" in deployment settings',
                'Make sure "Who has access" includes your account'
            ];
            diagnosis.severity = 'critical';
        }

        // JSON parse errors
        else if (errorMsg.includes('json') || errorMsg.includes('parse')) {
            diagnosis.likely_cause = 'Invalid JSON response from API';
            diagnosis.recommendations = [
                'Check backend logs for errors',
                'Verify API is returning valid JSON',
                'Check for HTML error pages being returned',
                'Look for syntax errors in backend code'
            ];
            diagnosis.severity = 'error';
        }

        // OpenAI specific errors
        else if (errorMsg.includes('openai') || errorMsg.includes('gpt')) {
            diagnosis.likely_cause = 'OpenAI API error';
            diagnosis.recommendations = [
                'Check OpenAI service status',
                'Verify API key is valid',
                'Check request format matches OpenAI API spec',
                'Review OpenAI API error message for details'
            ];
            diagnosis.severity = 'error';
        }

        return diagnosis;
    }

    /**
     * Format duration in human-readable form
     */
    function formatDuration(ms) {
        if (ms < 1000) return `${Math.round(ms)}ms`;
        return `${(ms / 1000).toFixed(2)}s`;
    }

    /**
     * Get a preview of result for logging
     */
    function getResultPreview(result, maxLength = 100) {
        if (result === null || result === undefined) return 'null/undefined';

        try {
            const str = JSON.stringify(result);
            if (str.length <= maxLength) return str;
            return str.substring(0, maxLength) + '...';
        } catch (e) {
            return typeof result;
        }
    }

    /**
     * Get current statistics
     */
    function getStats() {
        return {
            ...stats,
            successRate: stats.totalCalls > 0
                ? ((stats.successfulCalls / stats.totalCalls) * 100).toFixed(2) + '%'
                : 'N/A',
            avgDurationFormatted: formatDuration(stats.avgDuration),
            recentErrors: stats.errors.slice(0, 10)
        };
    }

    /**
     * Get all logs
     */
    function getLogs(limit) {
        return limit ? logs.slice(0, limit) : logs;
    }

    /**
     * Clear all logs
     */
    function clearLogs() {
        logs = [];
        stats = {
            totalCalls: 0,
            successfulCalls: 0,
            failedCalls: 0,
            totalDuration: 0,
            avgDuration: 0,
            errors: []
        };
        saveToStorage();
        console.log('[AI Debug Logger] Logs cleared');
    }

    /**
     * Export logs to console
     */
    function exportLogs() {
        console.group('🔬 AI Debug Logger - Full Report');
        console.log('Statistics:', getStats());
        console.log('Logs:', logs);
        console.groupEnd();

        return {
            stats: getStats(),
            logs: logs,
            exportedAt: new Date().toISOString()
        };
    }

    /**
     * Export logs to backend for persistent storage
     */
    async function exportToBackend(apiUrl) {
        try {
            const data = exportLogs();

            // This would send logs to backend - implement as needed
            console.log('[AI Debug Logger] Would export to backend:', apiUrl, data);

            return { success: true, message: 'Logs exported' };
        } catch (error) {
            console.error('[AI Debug Logger] Failed to export to backend:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Generate diagnostic report
     */
    function generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            stats: getStats(),
            recentLogs: logs.slice(0, 20),
            recommendations: []
        };

        // Analyze and generate recommendations
        if (stats.failedCalls > 0) {
            const failureRate = (stats.failedCalls / stats.totalCalls) * 100;
            if (failureRate > 50) {
                report.recommendations.push({
                    severity: 'critical',
                    message: `High failure rate: ${failureRate.toFixed(1)}%`,
                    action: 'Check API configuration and connectivity'
                });
            }
        }

        if (stats.avgDuration > 5000) {
            report.recommendations.push({
                severity: 'warning',
                message: `Slow average response time: ${formatDuration(stats.avgDuration)}`,
                action: 'Consider optimizing images or checking network speed'
            });
        }

        if (stats.errors.length > 5) {
            const recentErrors = stats.errors.slice(0, 5);
            const errorTypes = {};
            recentErrors.forEach(e => {
                const key = e.error.message;
                errorTypes[key] = (errorTypes[key] || 0) + 1;
            });

            report.recommendations.push({
                severity: 'error',
                message: `Multiple errors detected (${stats.errors.length} total)`,
                action: 'Review error patterns: ' + Object.keys(errorTypes).slice(0, 3).join(', ')
            });
        }

        return report;
    }

    /**
     * Enable logging
     */
    function enable() {
        config.enabled = true;
        console.log('[AI Debug Logger] Logging enabled');
    }

    /**
     * Disable logging
     */
    function disable() {
        config.enabled = false;
        console.log('[AI Debug Logger] Logging disabled');
    }

    /**
     * Configure logger
     */
    function configure(options) {
        Object.assign(config, options);
        console.log('[AI Debug Logger] Configuration updated:', config);
    }

    // Initialize on load
    init();

    // Public API
    return {
        wrapCall,
        wrapAPICall,
        getStats,
        getLogs,
        clearLogs,
        exportLogs,
        exportToBackend,
        generateReport,
        enable,
        disable,
        configure,
        addLog // For manual logging
    };

})();

// Make available globally
if (typeof window !== 'undefined') {
    window.AIDebugLogger = AIDebugLogger;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIDebugLogger;
}

console.log('✅ AI Debug Logger loaded. Use AIDebugLogger.getStats() to view statistics.');
