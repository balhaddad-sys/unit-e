# AI Debugging Guide - Unit E Ward Rounds

**Version:** 1.0
**Created:** 2026-01-13
**Purpose:** Comprehensive post hoc debugging tools for diagnosing AI functionality issues

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Available Tools](#available-tools)
3. [Quick Start](#quick-start)
4. [Backend Debugging (AIDebugger.gs)](#backend-debugging)
5. [Frontend Dashboard](#frontend-dashboard)
6. [Enhanced Logging](#enhanced-logging)
7. [Health Monitoring](#health-monitoring)
8. [Common Issues & Solutions](#common-issues--solutions)
9. [API Reference](#api-reference)

---

## 🎯 Overview

This debugging system provides comprehensive tools to diagnose and monitor AI functionality in the Unit E Ward Rounds application. The system includes:

- **Backend diagnostic module** - Server-side testing and logging
- **Frontend dashboard** - Visual debugging interface
- **Enhanced logging wrapper** - Automatic call tracking
- **Health monitoring** - Automated uptime tracking

### What Problems Does This Solve?

- ❌ AI not responding
- ❌ OCR failing to extract lab values
- ❌ Consultation endpoint timing out
- ❌ API key issues
- ❌ Network connectivity problems
- ❌ Performance degradation

---

## 🛠️ Available Tools

### 1. AIDebugger.gs (Backend)
**Location:** `/AIDebugger.gs`

Comprehensive backend debugging module with:
- Full diagnostic reports
- Quick health checks
- API connectivity testing
- Configuration validation
- Permission checks
- Performance monitoring
- Persistent logging

### 2. AI Diagnostic Dashboard (Frontend)
**Location:** `/ai-diagnostic-dashboard.html`

Interactive web dashboard with:
- Real-time status monitoring
- Quick action buttons
- Full diagnostic reports
- Test OCR and consultation endpoints
- View and clear debug logs
- Recommendations engine

### 3. AI Debug Logger (Enhanced Logging)
**Location:** `/js/ai-debug-logger.js`

Automatic logging wrapper with:
- Request/response tracking
- Performance metrics
- Error diagnosis
- Local storage persistence
- Statistics and reporting

### 4. AI Health Monitor (Automated Monitoring)
**Location:** `/js/ai-health-monitor.js`

Continuous health monitoring with:
- Periodic health checks (configurable interval)
- Alert system for failures
- Uptime tracking
- Auto-recovery attempts
- Event callbacks

---

## 🚀 Quick Start

### Step 1: Deploy Backend Updates

1. Open your Google Apps Script project
2. Add the new file `AIDebugger.gs` to your project
3. The debugging endpoints are already integrated in `Code.gs`
4. Deploy or re-deploy your web app

### Step 2: Test Backend Endpoints

Open these URLs in your browser (replace `YOUR_DEPLOYMENT_URL` with your actual URL):

```
# Quick health check
https://YOUR_DEPLOYMENT_URL?action=aiDebugQuick

# Full diagnostics
https://YOUR_DEPLOYMENT_URL?action=aiDebugFull

# View debug logs
https://YOUR_DEPLOYMENT_URL?action=aiDebugLogs

# Clear logs
https://YOUR_DEPLOYMENT_URL?action=aiDebugClearLogs
```

### Step 3: Set Up Frontend Dashboard

1. Open `ai-diagnostic-dashboard.html`
2. Update the `API_URL` constant with your deployment URL:
   ```javascript
   const API_URL = 'https://script.google.com/macros/s/YOUR_ID/exec';
   ```
3. Open the file in your browser
4. Click "Run Full Diagnostics"

### Step 4: Integrate Enhanced Logging (Optional)

Add to your existing frontend code:

```html
<!-- Add to your HTML -->
<script src="js/ai-debug-logger.js"></script>

<script>
// Wrap AI calls with logging
async function performOCR(image) {
    return await AIDebugLogger.wrapAPICall('OCR', async () => {
        // Your existing OCR code
        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'runOCR', image: image })
        });
        return await response.json();
    }, { imageSize: image.length });
}

// View statistics
console.log(AIDebugLogger.getStats());

// Generate report
console.log(AIDebugLogger.generateReport());
</script>
```

### Step 5: Set Up Health Monitoring (Optional)

```html
<!-- Add to your HTML -->
<script src="js/ai-health-monitor.js"></script>

<script>
// Initialize and start monitoring
AIHealthMonitor.init('https://YOUR_DEPLOYMENT_URL');

// Start monitoring (checks every 5 minutes)
AIHealthMonitor.start();

// Register alert callbacks
AIHealthMonitor.on('onFailure', (check) => {
    console.error('Health check failed:', check);
});

AIHealthMonitor.on('onCritical', (check) => {
    alert('🚨 AI system is down! Multiple consecutive failures detected.');
});

AIHealthMonitor.on('onRecovery', (check) => {
    console.log('🎉 AI system recovered!');
});

// View health status
console.log(AIHealthMonitor.getHealth());
console.log(AIHealthMonitor.getUptime());
</script>
```

---

## 🔧 Backend Debugging

### Full Diagnostic Report

**Endpoint:** `GET ?action=aiDebugFull`

Runs comprehensive diagnostics including:
- Configuration validation
- OpenAI connectivity test
- Vision API fallback test
- OCR endpoint test
- Consultation endpoint test
- Permission checks
- Performance metrics

**Response:**
```json
{
  "timestamp": "2026-01-13T10:30:00.000Z",
  "version": "4.2.0",
  "checks": {
    "configuration": {
      "passed": true,
      "issues": [],
      "config": { ... }
    },
    "openaiConnectivity": {
      "passed": true,
      "duration": 234,
      "response": { ... }
    },
    ...
  },
  "recommendations": [
    {
      "severity": "critical",
      "message": "OPENAI_API_KEY not configured",
      "fix": "Go to Project Settings → Script Properties → Add OPENAI_API_KEY"
    }
  ]
}
```

### Quick Health Check

**Endpoint:** `GET ?action=aiDebugQuick`

Fast health check for monitoring:

**Response:**
```json
{
  "timestamp": "2026-01-13T10:30:00.000Z",
  "status": "healthy",
  "openai": {
    "configured": true,
    "keyLength": 51,
    "keyPreview": "sk-proj-ab..."
  },
  "vision": {
    "configured": false,
    "available": false
  },
  "model": "gpt-4o-mini"
}
```

### Debug Logs

**Endpoint:** `GET ?action=aiDebugLogs&limit=50`

Retrieve stored debug logs:

**Response:**
```json
{
  "logs": [
    {
      "timestamp": "2026-01-13T10:30:00.000Z",
      "type": "error",
      "message": "OpenAI connectivity test failed",
      "details": { ... }
    }
  ],
  "total": 42
}
```

### Test OCR

**Endpoint:** `POST action=aiDebugOCR`

Test OCR functionality with sample image:

**Request:**
```json
{
  "action": "aiDebugOCR",
  "image": "data:image/jpeg;base64,..." // Optional
}
```

### Test Consultation

**Endpoint:** `POST action=aiDebugConsult`

Test consultation functionality:

**Request:**
```json
{
  "action": "aiDebugConsult",
  "query": "What is the treatment for acute gout?" // Optional
}
```

---

## 🖥️ Frontend Dashboard

### Features

1. **Quick Status Panel**
   - Current health status
   - API configuration details
   - Real-time status indicator

2. **Quick Actions**
   - Run full diagnostics
   - Test OCR endpoint
   - Test consultation endpoint
   - Clear debug logs

3. **Diagnostic Reports**
   - Comprehensive check results
   - Performance metrics
   - Configuration validation

4. **Recommendations**
   - Automatic issue detection
   - Severity-based prioritization
   - Actionable fixes

5. **Debug Logs Viewer**
   - Real-time log streaming
   - Color-coded by type
   - Detailed error information

### Usage

1. Open `ai-diagnostic-dashboard.html` in browser
2. Dashboard loads automatically
3. Click buttons to run tests
4. View results in expandable sections
5. Export or clear logs as needed

---

## 📊 Enhanced Logging

### Wrapping AI Calls

The `AIDebugLogger` automatically tracks:
- Call start/end times
- Duration and performance
- Success/failure status
- Error details with diagnosis
- Request/response data

### Basic Usage

```javascript
// Wrap a simple call
const result = await AIDebugLogger.wrapCall('MyAICall', async () => {
    return await myAIFunction();
});

// Wrap an API call with context
const result = await AIDebugLogger.wrapAPICall('OCR', async () => {
    return await performOCR(image);
}, { imageSize: image.length, patientId: '123' });

// Manual logging
AIDebugLogger.addLog('info', 'Custom Event', { data: 'value' });
```

### View Statistics

```javascript
const stats = AIDebugLogger.getStats();
console.log(stats);
// {
//   totalCalls: 42,
//   successfulCalls: 38,
//   failedCalls: 4,
//   avgDuration: 1234,
//   successRate: "90.48%",
//   recentErrors: [...]
// }
```

### Generate Report

```javascript
const report = AIDebugLogger.generateReport();
console.log(report);
// Includes stats, recent logs, and recommendations
```

### Configuration

```javascript
AIDebugLogger.configure({
    enabled: true,
    maxLogs: 100,
    consoleOutput: true,
    persistToStorage: true,
    detailedErrors: true
});
```

---

## 🏥 Health Monitoring

### Features

- **Periodic Checks**: Automatic health checks at configurable intervals
- **Alert System**: Callbacks for failures, recoveries, and critical issues
- **Uptime Tracking**: Comprehensive uptime statistics
- **Auto-Recovery**: Automatic recovery attempts on failures
- **Persistent State**: Survives page reloads

### Setup

```javascript
// Initialize with API URL
AIHealthMonitor.init('https://YOUR_API_URL', {
    checkInterval: 5 * 60 * 1000, // 5 minutes
    alertThreshold: 3, // Alert after 3 failures
    autoRecover: true,
    notifyOnRecovery: true
});

// Start monitoring
AIHealthMonitor.start();
```

### Register Callbacks

```javascript
// On failure
AIHealthMonitor.on('onFailure', (check) => {
    console.error('Health check failed:', check);
    // Send notification, log to external service, etc.
});

// On critical (multiple consecutive failures)
AIHealthMonitor.on('onCritical', (check) => {
    alert('🚨 AI system is down!');
    // Escalate to support team
});

// On recovery
AIHealthMonitor.on('onRecovery', (check) => {
    console.log('🎉 System recovered!');
    // Send recovery notification
});
```

### View Status

```javascript
// Current health
const health = AIHealthMonitor.getHealth();
console.log(health);
// {
//   status: "healthy",
//   isHealthy: true,
//   lastCheck: Date,
//   consecutiveFailures: 0,
//   isRunning: true,
//   recentChecks: [...]
// }

// Uptime statistics
const uptime = AIHealthMonitor.getUptime();
console.log(uptime);
// {
//   totalChecks: 120,
//   successfulChecks: 115,
//   failedChecks: 5,
//   successRate: "95.83%",
//   uptimeFormatted: "10h 5m 30s",
//   averageResponseTime: 234
// }
```

### Generate Report

```javascript
const report = AIHealthMonitor.generateReport();
console.log(report);
// Includes health status, uptime, recommendations, and alerts
```

---

## 🔍 Common Issues & Solutions

### Issue: "OPENAI_API_KEY not configured"

**Diagnosis:** API key not set in Script Properties

**Solution:**
1. Open Google Apps Script project
2. Click ⚙️ Project Settings
3. Go to "Script Properties"
4. Add property: `OPENAI_API_KEY` = `sk-proj-...`
5. Save and test again

---

### Issue: "Network error" or "fetch failed"

**Diagnosis:** Network connectivity or CORS issue

**Solution:**
1. Check internet connection
2. Verify API URL is correct
3. Ensure web app deployment settings:
   - Execute as: "User accessing the web app"
   - Who has access: "Anyone" or your account
4. Check browser console for CORS errors
5. Try incognito mode to rule out extensions

---

### Issue: "Request timeout"

**Diagnosis:** API taking too long to respond

**Solution:**
1. Check image size (reduce if > 5MB)
2. Test with smaller image
3. Check network speed
4. Verify OpenAI API status: https://status.openai.com
5. Increase timeout in code if needed

---

### Issue: "HTTP 401 Unauthorized"

**Diagnosis:** Invalid API key

**Solution:**
1. Verify API key format (should start with `sk-`)
2. Check key hasn't expired
3. Verify key is for correct OpenAI account
4. Try generating new API key
5. Ensure no extra spaces in key

---

### Issue: "HTTP 429 Rate limit exceeded"

**Diagnosis:** Too many API requests

**Solution:**
1. Wait before making more requests
2. Check API usage at https://platform.openai.com
3. Implement request throttling
4. Consider upgrading API plan
5. Use fallback to Vision API

---

### Issue: OCR returns empty results

**Diagnosis:** Image quality or API issue

**Solution:**
1. Check image is clear and readable
2. Ensure text is visible in image
3. Try different image format
4. Check if Vision API fallback works
5. Review backend logs for errors

---

### Issue: Slow AI responses

**Diagnosis:** Performance degradation

**Solution:**
1. Check network speed
2. Reduce image sizes before upload
3. Monitor average response times
4. Check OpenAI status page
5. Review recent logs for patterns

---

## 📚 API Reference

### Backend Endpoints

#### GET Endpoints

| Endpoint | Description | Response |
|----------|-------------|----------|
| `?action=aiDebugFull` | Full diagnostic report | JSON with all checks |
| `?action=aiDebugQuick` | Quick health check | JSON with status |
| `?action=aiDebugLogs&limit=N` | Get debug logs | JSON with logs array |
| `?action=aiDebugClearLogs` | Clear all logs | JSON success message |

#### POST Endpoints

| Endpoint | Request Body | Description |
|----------|--------------|-------------|
| `action=aiDebugOCR` | `{ image: "..." }` | Test OCR with image |
| `action=aiDebugConsult` | `{ query: "..." }` | Test consultation |

### Frontend Classes

#### AIDebugLogger

```javascript
// Methods
AIDebugLogger.wrapCall(callName, function, context)
AIDebugLogger.wrapAPICall(callName, function, requestData)
AIDebugLogger.getStats()
AIDebugLogger.getLogs(limit)
AIDebugLogger.clearLogs()
AIDebugLogger.exportLogs()
AIDebugLogger.generateReport()
AIDebugLogger.enable()
AIDebugLogger.disable()
AIDebugLogger.configure(options)
```

#### AIHealthMonitor

```javascript
// Methods
AIHealthMonitor.init(apiUrl, options)
AIHealthMonitor.start()
AIHealthMonitor.stop()
AIHealthMonitor.getHealth()
AIHealthMonitor.getUptime()
AIHealthMonitor.generateReport()
AIHealthMonitor.on(event, callback)
AIHealthMonitor.reset()
AIHealthMonitor.configure(options)
AIHealthMonitor.performHealthCheck()
```

---

## 🎓 Best Practices

### 1. Development Workflow

1. **During Development:**
   - Keep AI Debug Logger enabled
   - Monitor console for errors
   - Use dashboard for testing

2. **Before Deployment:**
   - Run full diagnostics
   - Verify all endpoints pass
   - Check configuration

3. **In Production:**
   - Enable health monitoring
   - Set up alert callbacks
   - Monitor uptime stats

### 2. Troubleshooting Steps

1. Run quick health check
2. If unhealthy, run full diagnostics
3. Review recommendations
4. Check recent debug logs
5. Test specific endpoints
6. Review error patterns
7. Apply fixes
8. Verify with full diagnostics

### 3. Performance Monitoring

- Monitor average response times
- Track success rates
- Review uptime statistics
- Identify slow endpoints
- Optimize as needed

---

## 📞 Support

If you encounter issues not covered in this guide:

1. Export debug logs using dashboard
2. Generate full diagnostic report
3. Review all error messages
4. Check Google Apps Script logs
5. Verify all configuration settings

---

## 📝 Changelog

### Version 1.0 (2026-01-13)
- Initial release
- Backend debugging module
- Frontend dashboard
- Enhanced logging wrapper
- Health monitoring system
- Comprehensive documentation

---

**Happy Debugging! 🐛🔍**
