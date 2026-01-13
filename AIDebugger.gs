/**
 * ═══════════════════════════════════════════════════════════════════════════
 * AI DEBUGGER - Post Hoc Diagnostic Tool
 * Version: 1.0
 * Created: 2026-01-13
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Comprehensive debugging tool for diagnosing AI functionality issues:
 * - API connectivity testing
 * - Configuration validation
 * - Request/response logging
 * - Error diagnosis with recommendations
 * - Performance monitoring
 *
 * Usage:
 *   GET  ?action=aiDebug               → Full diagnostic report
 *   GET  ?action=aiDebugQuick          → Quick health check
 *   POST ?action=aiDebugOCR            → Debug OCR with test image
 *   POST ?action=aiDebugConsult        → Debug consultation with test query
 *   GET  ?action=aiDebugLogs           → View recent AI call logs
 *   GET  ?action=aiDebugClearLogs      → Clear debug logs
 * ═══════════════════════════════════════════════════════════════════════════
 */

const AI_DEBUGGER = {

  // Log storage
  LOG_FILE: 'ai_debug_logs.json',
  MAX_LOGS: 100,

  /**
   * Add log entry to persistent storage
   */
  log: function(type, message, details) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp: timestamp,
      type: type, // 'info', 'error', 'warning', 'success'
      message: message,
      details: details || null
    };

    try {
      const logs = DataStore.read(this.LOG_FILE, { entries: [] });
      logs.entries = logs.entries || [];
      logs.entries.unshift(logEntry); // Add to beginning

      // Keep only last MAX_LOGS entries
      if (logs.entries.length > this.MAX_LOGS) {
        logs.entries = logs.entries.slice(0, this.MAX_LOGS);
      }

      DataStore.write(this.LOG_FILE, logs);
      Logger.log('[AI_DEBUG] ' + type.toUpperCase() + ': ' + message);
    } catch (e) {
      Logger.log('[AI_DEBUG] Failed to write log: ' + e.toString());
    }
  },

  /**
   * Get stored logs
   */
  getLogs: function(limit) {
    const logs = DataStore.read(this.LOG_FILE, { entries: [] });
    const entries = logs.entries || [];
    return limit ? entries.slice(0, limit) : entries;
  },

  /**
   * Clear stored logs
   */
  clearLogs: function() {
    DataStore.write(this.LOG_FILE, { entries: [], clearedAt: new Date().toISOString() });
    return { success: true, message: 'Debug logs cleared' };
  },

  /**
   * FULL DIAGNOSTIC REPORT
   * Comprehensive check of all AI functionality
   */
  runFullDiagnostics: function() {
    this.log('info', 'Starting full AI diagnostics', null);

    const report = {
      timestamp: new Date().toISOString(),
      version: SCRIPT_VERSION,
      checks: {
        configuration: this.checkConfiguration(),
        openaiConnectivity: this.testOpenAIConnectivity(),
        visionFallback: this.testVisionFallback(),
        ocrEndpoint: this.testOCREndpoint(),
        consultEndpoint: this.testConsultEndpoint(),
        permissions: this.checkPermissions(),
        performance: this.checkPerformance()
      },
      recentLogs: this.getLogs(20),
      recommendations: []
    };

    // Generate recommendations based on check results
    report.recommendations = this.generateRecommendations(report.checks);

    // Log diagnostic completion
    this.log('info', 'Full diagnostics completed', {
      totalIssues: report.recommendations.length,
      criticalIssues: report.recommendations.filter(r => r.severity === 'critical').length
    });

    return report;
  },

  /**
   * QUICK HEALTH CHECK
   * Fast check of critical functionality
   */
  quickHealthCheck: function() {
    const config = getConfig();
    const hasOpenAI = !!config.openaiApiKey;
    const hasVision = !!config.visionApiKey;

    const health = {
      timestamp: new Date().toISOString(),
      status: hasOpenAI ? 'healthy' : 'degraded',
      openai: {
        configured: hasOpenAI,
        keyLength: hasOpenAI ? config.openaiApiKey.length : 0,
        keyPreview: hasOpenAI ? config.openaiApiKey.substring(0, 10) + '...' : 'NOT_CONFIGURED'
      },
      vision: {
        configured: hasVision,
        available: hasVision
      },
      model: GPT_MODEL
    };

    if (!hasOpenAI) {
      health.warnings = ['OpenAI API key not configured - AI features will not work'];
    }

    return health;
  },

  /**
   * CHECK CONFIGURATION
   */
  checkConfiguration: function() {
    const config = getConfig();
    const check = {
      passed: true,
      issues: [],
      config: {
        hasOpenAIKey: !!config.openaiApiKey,
        openaiKeyLength: config.openaiApiKey ? config.openaiApiKey.length : 0,
        openaiKeyFormat: this.validateAPIKeyFormat(config.openaiApiKey, 'sk-'),
        hasVisionKey: !!config.visionApiKey,
        visionKeyLength: config.visionApiKey ? config.visionApiKey.length : 0,
        spreadsheetId: config.spreadsheetId,
        driveFolderId: config.driveFolderId,
        model: GPT_MODEL
      }
    };

    // Validate OpenAI key
    if (!config.openaiApiKey) {
      check.passed = false;
      check.issues.push({
        severity: 'critical',
        message: 'OPENAI_API_KEY not configured',
        fix: 'Go to Project Settings → Script Properties → Add OPENAI_API_KEY'
      });
    } else if (!check.config.openaiKeyFormat.valid) {
      check.passed = false;
      check.issues.push({
        severity: 'critical',
        message: 'OPENAI_API_KEY format invalid: ' + check.config.openaiKeyFormat.issue,
        fix: 'Ensure key starts with "sk-" and is correct length'
      });
    }

    // Check Vision API (optional)
    if (!config.visionApiKey) {
      check.issues.push({
        severity: 'info',
        message: 'VISION_API_KEY not configured (optional fallback)',
        fix: 'Add VISION_API_KEY for Google Vision fallback'
      });
    }

    this.log(check.passed ? 'success' : 'error', 'Configuration check ' + (check.passed ? 'passed' : 'failed'), check);
    return check;
  },

  /**
   * VALIDATE API KEY FORMAT
   */
  validateAPIKeyFormat: function(key, prefix) {
    if (!key) return { valid: false, issue: 'Key is empty' };
    if (!key.startsWith(prefix)) return { valid: false, issue: 'Key does not start with "' + prefix + '"' };
    if (key.length < 20) return { valid: false, issue: 'Key is too short' };
    return { valid: true, issue: null };
  },

  /**
   * TEST OPENAI CONNECTIVITY
   */
  testOpenAIConnectivity: function() {
    const config = getConfig();
    const test = {
      passed: false,
      timestamp: new Date().toISOString(),
      duration: 0,
      response: null,
      error: null
    };

    if (!config.openaiApiKey) {
      test.error = 'OpenAI API key not configured';
      this.log('error', 'OpenAI connectivity test failed: No API key', test);
      return test;
    }

    const startTime = Date.now();

    try {
      const response = UrlFetchApp.fetch('https://api.openai.com/v1/chat/completions', {
        method: 'post',
        contentType: 'application/json',
        headers: { 'Authorization': 'Bearer ' + config.openaiApiKey },
        payload: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: 'Test connectivity: respond with OK' }],
          max_tokens: 10,
          temperature: 0
        }),
        muteHttpExceptions: true,
        timeout: 10000
      });

      test.duration = Date.now() - startTime;
      const code = response.getResponseCode();
      test.response = {
        code: code,
        contentType: response.getHeaders()['Content-Type']
      };

      if (code === 200) {
        const json = JSON.parse(response.getContentText());
        test.passed = true;
        test.response.content = json.choices?.[0]?.message?.content || '';
        test.response.model = json.model;
        this.log('success', 'OpenAI connectivity test passed (' + test.duration + 'ms)', test);
      } else {
        test.error = 'HTTP ' + code + ': ' + response.getContentText().substring(0, 200);
        this.log('error', 'OpenAI connectivity test failed: ' + test.error, test);
      }
    } catch (e) {
      test.duration = Date.now() - startTime;
      test.error = e.toString();
      this.log('error', 'OpenAI connectivity test exception: ' + test.error, test);
    }

    return test;
  },

  /**
   * TEST VISION API FALLBACK
   */
  testVisionFallback: function() {
    const config = getConfig();
    const test = {
      configured: !!config.visionApiKey,
      passed: false,
      available: false,
      message: ''
    };

    if (!config.visionApiKey) {
      test.message = 'Vision API not configured (optional)';
      return test;
    }

    try {
      // Simple test - just check if key is valid format
      if (config.visionApiKey.length > 10) {
        test.available = true;
        test.message = 'Vision API configured as fallback';
        this.log('info', 'Vision API available as fallback', test);
      }
    } catch (e) {
      test.message = 'Vision API test failed: ' + e.toString();
      this.log('warning', test.message, test);
    }

    return test;
  },

  /**
   * TEST OCR ENDPOINT WITH SAMPLE IMAGE
   */
  testOCREndpoint: function(sampleImageBase64) {
    const test = {
      passed: false,
      timestamp: new Date().toISOString(),
      duration: 0,
      result: null,
      error: null
    };

    // Use provided sample or create minimal test image
    const testImage = sampleImageBase64 || this.createTestImage();

    if (!testImage) {
      test.error = 'No test image provided';
      return test;
    }

    const startTime = Date.now();

    try {
      const config = getConfig();
      const result = OCRService.extractWithGPT(testImage, config);
      test.duration = Date.now() - startTime;
      test.result = result;
      test.passed = result.success;

      if (!result.success) {
        test.error = result.error;
        this.log('error', 'OCR endpoint test failed: ' + test.error, test);
      } else {
        this.log('success', 'OCR endpoint test passed (' + test.duration + 'ms)', {
          valuesFound: result.values ? result.values.length : 0,
          model: result.model
        });
      }
    } catch (e) {
      test.duration = Date.now() - startTime;
      test.error = e.toString();
      this.log('error', 'OCR endpoint test exception: ' + test.error, test);
    }

    return test;
  },

  /**
   * TEST CONSULTATION ENDPOINT
   */
  testConsultEndpoint: function(customQuery) {
    const test = {
      passed: false,
      timestamp: new Date().toISOString(),
      duration: 0,
      result: null,
      error: null
    };

    const query = customQuery || 'What is the recommended initial treatment for acute gout?';
    const testPatient = {
      name: 'Test Patient',
      diagnosis: 'Acute Gout',
      age: '65',
      sex: 'M'
    };
    const testLabs = [
      { test: 'Creatinine', value: '1.2', unit: 'mg/dL', flag: 'N' }
    ];

    const startTime = Date.now();

    try {
      const result = OCRService.consult(query, testPatient, testLabs, []);
      test.duration = Date.now() - startTime;
      test.result = result;
      test.passed = result.success;

      if (!result.success) {
        test.error = result.error;
        this.log('error', 'Consultation endpoint test failed: ' + test.error, test);
      } else {
        this.log('success', 'Consultation endpoint test passed (' + test.duration + 'ms)', {
          responseLength: result.response ? result.response.length : 0,
          model: result.model
        });
      }
    } catch (e) {
      test.duration = Date.now() - startTime;
      test.error = e.toString();
      this.log('error', 'Consultation endpoint test exception: ' + test.error, test);
    }

    return test;
  },

  /**
   * CHECK PERMISSIONS
   */
  checkPermissions: function() {
    const check = {
      passed: true,
      issues: []
    };

    try {
      // Test Drive access
      try {
        const config = getConfig();
        if (config.driveFolderId && config.driveFolderId !== 'root') {
          DriveApp.getFolderById(config.driveFolderId);
        }
        check.driveAccess = true;
      } catch (e) {
        check.passed = false;
        check.driveAccess = false;
        check.issues.push({
          severity: 'error',
          message: 'Drive folder access failed: ' + e.toString(),
          fix: 'Check DRIVE_FOLDER_ID and ensure script has Drive permissions'
        });
      }

      // Test Properties access
      try {
        PropertiesService.getScriptProperties().getProperty('TEST');
        check.propertiesAccess = true;
      } catch (e) {
        check.passed = false;
        check.propertiesAccess = false;
        check.issues.push({
          severity: 'critical',
          message: 'Cannot access Script Properties: ' + e.toString(),
          fix: 'Ensure script has proper authorization'
        });
      }

      // Test UrlFetch access
      try {
        UrlFetchApp.fetch('https://www.google.com', {
          method: 'head',
          muteHttpExceptions: true,
          timeout: 5000
        });
        check.urlFetchAccess = true;
      } catch (e) {
        check.passed = false;
        check.urlFetchAccess = false;
        check.issues.push({
          severity: 'critical',
          message: 'UrlFetch service failed: ' + e.toString(),
          fix: 'Check script permissions and network connectivity'
        });
      }

    } catch (e) {
      check.passed = false;
      check.issues.push({
        severity: 'error',
        message: 'Permission check failed: ' + e.toString()
      });
    }

    this.log(check.passed ? 'success' : 'error', 'Permission check ' + (check.passed ? 'passed' : 'failed'), check);
    return check;
  },

  /**
   * CHECK PERFORMANCE METRICS
   */
  checkPerformance: function() {
    const metrics = {
      executionQuota: {
        dailyLimit: 90, // minutes per day for standard accounts
        warning: false
      },
      urlFetchQuota: {
        dailyLimit: 20000, // requests per day
        warning: false
      },
      recentCallsAvgDuration: this.calculateAvgDuration(),
      recommendations: []
    };

    // Check if recent calls are slow
    if (metrics.recentCallsAvgDuration > 5000) {
      metrics.recommendations.push({
        severity: 'warning',
        message: 'AI calls are slow (avg ' + metrics.recentCallsAvgDuration + 'ms)',
        fix: 'Check network connectivity or consider reducing image sizes'
      });
    }

    return metrics;
  },

  /**
   * Calculate average duration from recent logs
   */
  calculateAvgDuration: function() {
    const logs = this.getLogs(10);
    const durationsLogs = logs.filter(l => l.details && l.details.duration);

    if (durationsLogs.length === 0) return 0;

    const totalDuration = durationsLogs.reduce((sum, log) => sum + log.details.duration, 0);
    return Math.round(totalDuration / durationsLogs.length);
  },

  /**
   * GENERATE RECOMMENDATIONS
   */
  generateRecommendations: function(checks) {
    const recommendations = [];

    // Collect all issues from checks
    Object.keys(checks).forEach(function(checkName) {
      const check = checks[checkName];
      if (check.issues && check.issues.length > 0) {
        recommendations.push.apply(recommendations, check.issues);
      }
    });

    // Sort by severity
    const severityOrder = { 'critical': 0, 'error': 1, 'warning': 2, 'info': 3 };
    recommendations.sort(function(a, b) {
      return severityOrder[a.severity] - severityOrder[b.severity];
    });

    return recommendations;
  },

  /**
   * CREATE MINIMAL TEST IMAGE (placeholder)
   */
  createTestImage: function() {
    // Return null - actual image should be provided
    return null;
  },

  /**
   * DEBUG SPECIFIC AI CALL
   * Wrap an AI call with detailed logging
   */
  debugCall: function(callName, callFunction, params) {
    const debugInfo = {
      callName: callName,
      timestamp: new Date().toISOString(),
      params: params,
      duration: 0,
      success: false,
      result: null,
      error: null,
      stackTrace: null
    };

    const startTime = Date.now();

    try {
      this.log('info', 'Starting AI call: ' + callName, { params: params });

      debugInfo.result = callFunction.apply(null, params);
      debugInfo.duration = Date.now() - startTime;
      debugInfo.success = true;

      this.log('success', 'AI call completed: ' + callName + ' (' + debugInfo.duration + 'ms)', {
        duration: debugInfo.duration,
        resultType: typeof debugInfo.result
      });

    } catch (e) {
      debugInfo.duration = Date.now() - startTime;
      debugInfo.error = e.toString();
      debugInfo.stackTrace = e.stack;

      this.log('error', 'AI call failed: ' + callName, {
        error: debugInfo.error,
        duration: debugInfo.duration,
        stack: debugInfo.stackTrace
      });
    }

    return debugInfo;
  }
};

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ENDPOINTS
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Full diagnostic report
 */
function aiDebugFull() {
  return AI_DEBUGGER.runFullDiagnostics();
}

/**
 * Quick health check
 */
function aiDebugQuick() {
  return AI_DEBUGGER.quickHealthCheck();
}

/**
 * Get debug logs
 */
function aiDebugGetLogs(limit) {
  return {
    logs: AI_DEBUGGER.getLogs(limit || 50),
    total: AI_DEBUGGER.getLogs().length
  };
}

/**
 * Clear debug logs
 */
function aiDebugClearLogs() {
  return AI_DEBUGGER.clearLogs();
}

/**
 * Debug OCR call
 */
function aiDebugOCR(imageBase64) {
  return AI_DEBUGGER.testOCREndpoint(imageBase64);
}

/**
 * Debug consultation call
 */
function aiDebugConsult(query) {
  return AI_DEBUGGER.testConsultEndpoint(query);
}
