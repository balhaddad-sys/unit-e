/**
 * ═══════════════════════════════════════════════════════════════════════════
 * AI HEALTH MONITOR
 * Version: 1.0
 * Created: 2026-01-13
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Automated health monitoring for AI services:
 * - Periodic health checks
 * - Alert system for failures
 * - Performance tracking
 * - Uptime monitoring
 * - Automatic recovery attempts
 *
 * Usage:
 *   // Initialize with API URL
 *   AIHealthMonitor.init('YOUR_API_URL');
 *
 *   // Start monitoring (checks every 5 minutes)
 *   AIHealthMonitor.start();
 *
 *   // Stop monitoring
 *   AIHealthMonitor.stop();
 *
 *   // Get current health status
 *   const health = AIHealthMonitor.getHealth();
 *
 *   // Get uptime statistics
 *   const uptime = AIHealthMonitor.getUptime();
 * ═══════════════════════════════════════════════════════════════════════════
 */

const AIHealthMonitor = (function() {
    'use strict';

    // Configuration
    let config = {
        apiUrl: null,
        checkInterval: 5 * 60 * 1000, // 5 minutes
        alertThreshold: 3, // Number of consecutive failures before alert
        enabled: false,
        autoRecover: true,
        notifyOnRecovery: true
    };

    // State
    let state = {
        isRunning: false,
        intervalId: null,
        lastCheck: null,
        consecutiveFailures: 0,
        totalChecks: 0,
        successfulChecks: 0,
        failedChecks: 0,
        currentStatus: 'unknown',
        startTime: null,
        checks: [] // History of checks
    };

    // Alert callbacks
    const alertCallbacks = {
        onFailure: [],
        onRecovery: [],
        onCritical: []
    };

    /**
     * Initialize monitor with API URL
     */
    function init(apiUrl, options = {}) {
        config.apiUrl = apiUrl;
        Object.assign(config, options);

        // Load state from storage if available
        loadState();

        console.log('[AI Health Monitor] Initialized with API:', apiUrl);
    }

    /**
     * Start monitoring
     */
    function start() {
        if (state.isRunning) {
            console.warn('[AI Health Monitor] Already running');
            return;
        }

        if (!config.apiUrl) {
            console.error('[AI Health Monitor] Cannot start: API URL not configured');
            return;
        }

        state.isRunning = true;
        state.startTime = new Date();
        config.enabled = true;

        // Run first check immediately
        performHealthCheck();

        // Schedule periodic checks
        state.intervalId = setInterval(performHealthCheck, config.checkInterval);

        console.log(`[AI Health Monitor] Started (checking every ${config.checkInterval / 1000}s)`);
    }

    /**
     * Stop monitoring
     */
    function stop() {
        if (!state.isRunning) {
            console.warn('[AI Health Monitor] Not running');
            return;
        }

        state.isRunning = false;
        config.enabled = false;

        if (state.intervalId) {
            clearInterval(state.intervalId);
            state.intervalId = null;
        }

        console.log('[AI Health Monitor] Stopped');
    }

    /**
     * Perform a health check
     */
    async function performHealthCheck() {
        const checkId = Date.now();
        const timestamp = new Date();

        console.log(`[AI Health Monitor] Running health check #${state.totalChecks + 1}`);

        state.totalChecks++;
        state.lastCheck = timestamp;

        try {
            const startTime = performance.now();

            // Call quick health endpoint
            const response = await fetch(`${config.apiUrl}?action=aiDebugQuick`, {
                method: 'GET',
                cache: 'no-cache'
            });

            const duration = performance.now() - startTime;

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            // Determine health status
            const isHealthy = data.status === 'healthy';
            const currentStatus = data.status || 'unknown';

            // Record check
            const check = {
                id: checkId,
                timestamp: timestamp.toISOString(),
                success: isHealthy,
                status: currentStatus,
                duration: Math.round(duration),
                details: data
            };

            addCheck(check);

            if (isHealthy) {
                handleSuccess(check);
            } else {
                handleFailure(check, `Status: ${currentStatus}`);
            }

        } catch (error) {
            // Record failed check
            const check = {
                id: checkId,
                timestamp: timestamp.toISOString(),
                success: false,
                status: 'error',
                duration: 0,
                error: error.message
            };

            addCheck(check);
            handleFailure(check, error.message);
        }

        // Save state
        saveState();
    }

    /**
     * Handle successful check
     */
    function handleSuccess(check) {
        const wasDown = state.consecutiveFailures > 0;

        state.successfulChecks++;
        state.consecutiveFailures = 0;
        state.currentStatus = check.status;

        console.log(`✅ [AI Health Monitor] Check passed (${check.duration}ms)`);

        // Notify recovery if system was down
        if (wasDown && config.notifyOnRecovery) {
            console.log('🎉 [AI Health Monitor] System recovered!');
            triggerCallbacks('onRecovery', check);
        }
    }

    /**
     * Handle failed check
     */
    function handleFailure(check, reason) {
        state.failedChecks++;
        state.consecutiveFailures++;
        state.currentStatus = 'error';

        console.error(`❌ [AI Health Monitor] Check failed: ${reason}`);

        // Trigger failure callback
        triggerCallbacks('onFailure', check);

        // Check if critical threshold reached
        if (state.consecutiveFailures >= config.alertThreshold) {
            console.error(
                `🚨 [AI Health Monitor] CRITICAL: ${state.consecutiveFailures} consecutive failures!`
            );
            triggerCallbacks('onCritical', check);

            // Attempt auto-recovery if enabled
            if (config.autoRecover) {
                attemptRecovery();
            }
        }
    }

    /**
     * Attempt automatic recovery
     */
    async function attemptRecovery() {
        console.log('[AI Health Monitor] Attempting auto-recovery...');

        // Recovery strategies
        const strategies = [
            {
                name: 'Clear cache and retry',
                action: async () => {
                    // Clear any cached data that might be causing issues
                    if ('caches' in window) {
                        const cacheNames = await caches.keys();
                        await Promise.all(
                            cacheNames.map(name => caches.delete(name))
                        );
                    }
                }
            },
            {
                name: 'Check connectivity',
                action: async () => {
                    // Simple connectivity check
                    await fetch('https://www.google.com', { method: 'HEAD', mode: 'no-cors' });
                }
            }
        ];

        for (const strategy of strategies) {
            try {
                console.log(`[AI Health Monitor] Trying: ${strategy.name}`);
                await strategy.action();
                console.log(`[AI Health Monitor] ${strategy.name} completed`);
            } catch (error) {
                console.error(`[AI Health Monitor] ${strategy.name} failed:`, error);
            }
        }

        // Run another check after recovery attempt
        setTimeout(performHealthCheck, 5000);
    }

    /**
     * Add check to history
     */
    function addCheck(check) {
        state.checks.unshift(check);

        // Keep only last 100 checks
        if (state.checks.length > 100) {
            state.checks = state.checks.slice(0, 100);
        }
    }

    /**
     * Get current health status
     */
    function getHealth() {
        return {
            status: state.currentStatus,
            isHealthy: state.currentStatus === 'healthy',
            lastCheck: state.lastCheck,
            consecutiveFailures: state.consecutiveFailures,
            isRunning: state.isRunning,
            recentChecks: state.checks.slice(0, 10)
        };
    }

    /**
     * Get uptime statistics
     */
    function getUptime() {
        const successRate = state.totalChecks > 0
            ? (state.successfulChecks / state.totalChecks * 100).toFixed(2)
            : 0;

        const uptime = state.startTime
            ? Math.floor((Date.now() - state.startTime.getTime()) / 1000)
            : 0;

        return {
            totalChecks: state.totalChecks,
            successfulChecks: state.successfulChecks,
            failedChecks: state.failedChecks,
            successRate: successRate + '%',
            uptimeSeconds: uptime,
            uptimeFormatted: formatUptime(uptime),
            averageResponseTime: calculateAvgResponseTime(),
            startTime: state.startTime
        };
    }

    /**
     * Calculate average response time
     */
    function calculateAvgResponseTime() {
        const successfulChecks = state.checks.filter(c => c.success && c.duration);
        if (successfulChecks.length === 0) return 0;

        const totalDuration = successfulChecks.reduce((sum, c) => sum + c.duration, 0);
        return Math.round(totalDuration / successfulChecks.length);
    }

    /**
     * Format uptime in human-readable form
     */
    function formatUptime(seconds) {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        const parts = [];
        if (days > 0) parts.push(`${days}d`);
        if (hours > 0) parts.push(`${hours}h`);
        if (minutes > 0) parts.push(`${minutes}m`);
        if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

        return parts.join(' ');
    }

    /**
     * Register alert callback
     */
    function on(event, callback) {
        if (alertCallbacks[event]) {
            alertCallbacks[event].push(callback);
        } else {
            console.warn(`[AI Health Monitor] Unknown event: ${event}`);
        }
    }

    /**
     * Trigger callbacks for event
     */
    function triggerCallbacks(event, data) {
        if (alertCallbacks[event]) {
            alertCallbacks[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`[AI Health Monitor] Callback error:`, error);
                }
            });
        }
    }

    /**
     * Generate health report
     */
    function generateReport() {
        const health = getHealth();
        const uptime = getUptime();

        const report = {
            timestamp: new Date().toISOString(),
            health: health,
            uptime: uptime,
            recommendations: [],
            alerts: []
        };

        // Analyze and generate recommendations
        if (health.consecutiveFailures > 0) {
            report.alerts.push({
                severity: health.consecutiveFailures >= config.alertThreshold ? 'critical' : 'warning',
                message: `${health.consecutiveFailures} consecutive health check failures`,
                action: 'Investigate API connectivity and configuration'
            });
        }

        const successRate = parseFloat(uptime.successRate);
        if (successRate < 95 && state.totalChecks > 10) {
            report.recommendations.push({
                severity: 'warning',
                message: `Low success rate: ${uptime.successRate}`,
                action: 'Review logs for recurring issues'
            });
        }

        const avgResponseTime = uptime.averageResponseTime;
        if (avgResponseTime > 3000) {
            report.recommendations.push({
                severity: 'info',
                message: `Slow average response time: ${avgResponseTime}ms`,
                action: 'Consider optimizing API or checking network'
            });
        }

        return report;
    }

    /**
     * Save state to localStorage
     */
    function saveState() {
        try {
            localStorage.setItem('ai_health_monitor_state', JSON.stringify({
                state: state,
                savedAt: new Date().toISOString()
            }));
        } catch (e) {
            console.error('[AI Health Monitor] Failed to save state:', e);
        }
    }

    /**
     * Load state from localStorage
     */
    function loadState() {
        try {
            const saved = localStorage.getItem('ai_health_monitor_state');
            if (saved) {
                const data = JSON.parse(saved);
                // Restore state but don't restore running status
                Object.assign(state, data.state, {
                    isRunning: false,
                    intervalId: null
                });
                console.log('[AI Health Monitor] State restored from storage');
            }
        } catch (e) {
            console.error('[AI Health Monitor] Failed to load state:', e);
        }
    }

    /**
     * Reset all statistics
     */
    function reset() {
        state = {
            isRunning: state.isRunning,
            intervalId: state.intervalId,
            lastCheck: null,
            consecutiveFailures: 0,
            totalChecks: 0,
            successfulChecks: 0,
            failedChecks: 0,
            currentStatus: 'unknown',
            startTime: state.isRunning ? state.startTime : null,
            checks: []
        };
        saveState();
        console.log('[AI Health Monitor] Statistics reset');
    }

    /**
     * Configure monitor
     */
    function configure(options) {
        Object.assign(config, options);
        console.log('[AI Health Monitor] Configuration updated:', config);

        // If interval changed and monitor is running, restart
        if (state.isRunning && options.checkInterval) {
            stop();
            start();
        }
    }

    // Public API
    return {
        init,
        start,
        stop,
        getHealth,
        getUptime,
        generateReport,
        on,
        reset,
        configure,
        performHealthCheck // For manual checks
    };

})();

// Make available globally
if (typeof window !== 'undefined') {
    window.AIHealthMonitor = AIHealthMonitor;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIHealthMonitor;
}

console.log('✅ AI Health Monitor loaded. Use AIHealthMonitor.init(apiUrl) to configure.');
