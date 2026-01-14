/**
 * Bug Analyzer Client
 * Frontend utility for logging bugs to the post hoc bug analyzer
 *
 * Usage:
 * BugAnalyzer.init(API_URL);
 * BugAnalyzer.logBug(error, { severity: 'high', category: 'api' });
 * BugAnalyzer.enableAutoCapture(); // Automatically capture unhandled errors
 */

const BugAnalyzer = (function() {
  let config = {
    apiUrl: null,
    autoCapture: false,
    enabled: true,
    debug: false,
    userId: null,
    context: {}
  };

  /**
   * Initialize the bug analyzer
   */
  function init(options = {}) {
    if (typeof options === 'string') {
      config.apiUrl = options;
    } else {
      config = { ...config, ...options };
    }

    if (config.debug) {
      console.log('[BugAnalyzer] Initialized with config:', config);
    }

    return this;
  }

  /**
   * Log a bug
   */
  async function logBug(error, options = {}) {
    if (!config.enabled || !config.apiUrl) {
      if (config.debug) {
        console.warn('[BugAnalyzer] Bug logging disabled or API URL not set');
      }
      return { success: false, error: 'Not configured' };
    }

    try {
      const bugData = {
        message: extractMessage(error),
        stack: extractStack(error),
        severity: options.severity || inferSeverity(error),
        category: options.category || inferCategory(error),
        source: options.source || 'frontend',
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId: options.userId || config.userId,
        context: {
          ...config.context,
          ...options.context,
          timestamp: new Date().toISOString(),
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight
          },
          browser: getBrowserInfo(),
          performance: getPerformanceMetrics()
        }
      };

      if (config.debug) {
        console.log('[BugAnalyzer] Logging bug:', bugData);
      }

      const response = await fetch(config.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify({
          action: 'logBug',
          bugData: bugData
        })
      });

      const result = await response.json();

      if (config.debug) {
        console.log('[BugAnalyzer] Log result:', result);
      }

      return result;
    } catch (e) {
      console.error('[BugAnalyzer] Failed to log bug:', e);
      return { success: false, error: e.toString() };
    }
  }

  /**
   * Extract error message
   */
  function extractMessage(error) {
    if (typeof error === 'string') {
      return error;
    }

    if (error instanceof Error) {
      return error.message || error.toString();
    }

    if (error && error.message) {
      return error.message;
    }

    return JSON.stringify(error);
  }

  /**
   * Extract stack trace
   */
  function extractStack(error) {
    if (error instanceof Error && error.stack) {
      return error.stack;
    }

    if (error && error.stack) {
      return error.stack;
    }

    // Try to get current stack
    try {
      throw new Error();
    } catch (e) {
      return e.stack;
    }
  }

  /**
   * Infer severity from error
   */
  function inferSeverity(error) {
    const message = extractMessage(error).toLowerCase();

    // Critical keywords
    if (message.includes('crash') ||
        message.includes('fatal') ||
        message.includes('critical') ||
        message.includes('security')) {
      return 'critical';
    }

    // High severity keywords
    if (message.includes('fail') ||
        message.includes('error') ||
        message.includes('exception') ||
        message.includes('unauthorized') ||
        message.includes('forbidden')) {
      return 'high';
    }

    // Medium severity keywords
    if (message.includes('warning') ||
        message.includes('timeout') ||
        message.includes('invalid')) {
      return 'medium';
    }

    // Low severity keywords
    if (message.includes('info') ||
        message.includes('notice')) {
      return 'low';
    }

    return 'medium';
  }

  /**
   * Infer category from error
   */
  function inferCategory(error) {
    const message = extractMessage(error).toLowerCase();
    const stack = extractStack(error).toLowerCase();

    // Authentication
    if (message.includes('auth') ||
        message.includes('login') ||
        message.includes('token') ||
        message.includes('session')) {
      return 'authentication';
    }

    // API
    if (message.includes('api') ||
        message.includes('fetch') ||
        message.includes('request') ||
        message.includes('response') ||
        message.includes('http')) {
      return 'api';
    }

    // Database
    if (message.includes('database') ||
        message.includes('query') ||
        message.includes('sql')) {
      return 'database';
    }

    // UI
    if (message.includes('render') ||
        message.includes('component') ||
        message.includes('dom') ||
        message.includes('element')) {
      return 'ui';
    }

    // Performance
    if (message.includes('performance') ||
        message.includes('slow') ||
        message.includes('timeout') ||
        message.includes('memory')) {
      return 'performance';
    }

    // Security
    if (message.includes('security') ||
        message.includes('xss') ||
        message.includes('csrf') ||
        message.includes('injection')) {
      return 'security';
    }

    // Configuration
    if (message.includes('config') ||
        message.includes('settings') ||
        message.includes('environment')) {
      return 'configuration';
    }

    return 'unknown';
  }

  /**
   * Get browser information
   */
  function getBrowserInfo() {
    const ua = navigator.userAgent;
    let browser = 'Unknown';
    let version = 'Unknown';

    if (ua.includes('Chrome')) {
      browser = 'Chrome';
      const match = ua.match(/Chrome\/(\d+)/);
      version = match ? match[1] : 'Unknown';
    } else if (ua.includes('Firefox')) {
      browser = 'Firefox';
      const match = ua.match(/Firefox\/(\d+)/);
      version = match ? match[1] : 'Unknown';
    } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
      browser = 'Safari';
      const match = ua.match(/Version\/(\d+)/);
      version = match ? match[1] : 'Unknown';
    } else if (ua.includes('Edge')) {
      browser = 'Edge';
      const match = ua.match(/Edge\/(\d+)/);
      version = match ? match[1] : 'Unknown';
    }

    return {
      name: browser,
      version: version,
      userAgent: ua,
      platform: navigator.platform,
      language: navigator.language
    };
  }

  /**
   * Get performance metrics
   */
  function getPerformanceMetrics() {
    if (!window.performance) {
      return null;
    }

    try {
      const perfData = window.performance.timing;
      const navigation = window.performance.navigation;

      return {
        loadTime: perfData.loadEventEnd - perfData.navigationStart,
        domReady: perfData.domContentLoadedEventEnd - perfData.navigationStart,
        responseTime: perfData.responseEnd - perfData.requestStart,
        memory: window.performance.memory ? {
          used: window.performance.memory.usedJSHeapSize,
          total: window.performance.memory.totalJSHeapSize,
          limit: window.performance.memory.jsHeapSizeLimit
        } : null
      };
    } catch (e) {
      return null;
    }
  }

  /**
   * Enable automatic error capture
   */
  function enableAutoCapture() {
    if (config.autoCapture) {
      if (config.debug) {
        console.warn('[BugAnalyzer] Auto capture already enabled');
      }
      return;
    }

    config.autoCapture = true;

    // Capture unhandled errors
    window.addEventListener('error', (event) => {
      logBug(event.error || event.message, {
        severity: 'high',
        category: 'unknown',
        context: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          type: 'unhandledError'
        }
      });
    });

    // Capture unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      logBug(event.reason, {
        severity: 'high',
        category: 'unknown',
        context: {
          type: 'unhandledRejection'
        }
      });
    });

    if (config.debug) {
      console.log('[BugAnalyzer] Auto capture enabled');
    }
  }

  /**
   * Disable automatic error capture
   */
  function disableAutoCapture() {
    config.autoCapture = false;
    // Note: Event listeners cannot be easily removed without references
    if (config.debug) {
      console.log('[BugAnalyzer] Auto capture disabled (listeners remain)');
    }
  }

  /**
   * Set user ID for bug tracking
   */
  function setUserId(userId) {
    config.userId = userId;
    if (config.debug) {
      console.log('[BugAnalyzer] User ID set:', userId);
    }
  }

  /**
   * Set global context
   */
  function setContext(context) {
    config.context = { ...config.context, ...context };
    if (config.debug) {
      console.log('[BugAnalyzer] Context updated:', config.context);
    }
  }

  /**
   * Clear global context
   */
  function clearContext() {
    config.context = {};
    if (config.debug) {
      console.log('[BugAnalyzer] Context cleared');
    }
  }

  /**
   * Enable/disable bug analyzer
   */
  function setEnabled(enabled) {
    config.enabled = enabled;
    if (config.debug) {
      console.log('[BugAnalyzer] Enabled:', enabled);
    }
  }

  /**
   * Enable/disable debug mode
   */
  function setDebug(debug) {
    config.debug = debug;
    console.log('[BugAnalyzer] Debug mode:', debug);
  }

  /**
   * Wrap a function with automatic error logging
   */
  function wrap(fn, options = {}) {
    return function(...args) {
      try {
        const result = fn.apply(this, args);

        // Handle promises
        if (result && typeof result.then === 'function') {
          return result.catch(error => {
            logBug(error, {
              ...options,
              context: {
                ...options.context,
                function: fn.name || 'anonymous',
                arguments: args
              }
            });
            throw error;
          });
        }

        return result;
      } catch (error) {
        logBug(error, {
          ...options,
          context: {
            ...options.context,
            function: fn.name || 'anonymous',
            arguments: args
          }
        });
        throw error;
      }
    };
  }

  /**
   * Create a wrapper for fetch with automatic error logging
   */
  function wrapFetch() {
    const originalFetch = window.fetch;

    window.fetch = function(...args) {
      const url = args[0];

      return originalFetch.apply(this, args)
        .then(response => {
          if (!response.ok) {
            logBug(new Error(`HTTP ${response.status}: ${response.statusText}`), {
              severity: response.status >= 500 ? 'high' : 'medium',
              category: 'api',
              context: {
                url: url,
                status: response.status,
                statusText: response.statusText
              }
            });
          }
          return response;
        })
        .catch(error => {
          logBug(error, {
            severity: 'high',
            category: 'api',
            context: {
              url: url,
              type: 'fetchError'
            }
          });
          throw error;
        });
    };

    if (config.debug) {
      console.log('[BugAnalyzer] Fetch wrapped');
    }
  }

  /**
   * Test the bug analyzer
   */
  async function test() {
    console.log('[BugAnalyzer] Running test...');

    const result = await logBug(new Error('Test error from BugAnalyzer'), {
      severity: 'info',
      category: 'unknown',
      context: {
        test: true
      }
    });

    console.log('[BugAnalyzer] Test result:', result);
    return result;
  }

  // Public API
  return {
    init,
    logBug,
    enableAutoCapture,
    disableAutoCapture,
    setUserId,
    setContext,
    clearContext,
    setEnabled,
    setDebug,
    wrap,
    wrapFetch,
    test
  };
})();

// Auto-initialize if CONFIG is available
if (typeof CONFIG !== 'undefined' && CONFIG.apiUrl) {
  BugAnalyzer.init(CONFIG.apiUrl);
  console.log('[BugAnalyzer] Auto-initialized with CONFIG.apiUrl');
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BugAnalyzer;
}
