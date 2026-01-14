# Post Hoc Bug Analyzer Guide

## Overview

The Post Hoc Bug Analyzer is a comprehensive system for tracking, analyzing, and understanding bugs that occur in the Unit E Ward Rounds application. It provides pattern detection, trend analysis, and actionable recommendations to help developers identify and fix issues efficiently.

## Features

### Core Features
- **Automatic Bug Logging**: Capture errors with detailed context
- **Pattern Detection**: Identify recurring issues and trends
- **Impact Assessment**: Categorize bugs by severity and impact
- **Trend Analysis**: Track bug frequency over time
- **Root Cause Suggestions**: Get recommendations based on patterns
- **Similar Bug Detection**: Find related issues automatically
- **Export Capabilities**: Export bug data for external analysis
- **Resolution Tracking**: Mark bugs as resolved and track fix rates

### Pattern Detection
The analyzer automatically detects:
- **Time-based patterns**: Bugs occurring at specific times
- **User-specific patterns**: Issues affecting particular users
- **Browser patterns**: Browser-specific compatibility issues
- **Cascade patterns**: Related errors occurring in sequence

### Bug Categories
- Authentication
- API
- Database
- UI
- Performance
- Security
- Integration
- Configuration
- Unknown

### Severity Levels
- **Critical**: System crashes, security issues, fatal errors
- **High**: Failures, exceptions, unauthorized access
- **Medium**: Warnings, timeouts, invalid data
- **Low**: Minor issues, informational warnings
- **Info**: Logging and debugging information

## Installation

### 1. Backend Setup (Google Apps Script)

The bug analyzer is already integrated into your Code.gs file. Make sure the following files are deployed:

```
- Code.gs (contains integration)
- BugAnalyzer.gs (main backend logic)
```

### 2. Frontend Setup

#### Option A: Add to existing HTML pages

Include the bug analyzer client script in your HTML:

```html
<script src="js/bug-analyzer-client.js"></script>
```

#### Option B: Use the dedicated dashboard

Access the bug analyzer dashboard:

```
bug-analyzer-dashboard.html
```

### 3. Configuration

Update the API URL in `bug-analyzer-dashboard.html`:

```javascript
const API_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
```

## Usage

### Frontend Integration

#### Basic Setup

```javascript
// Initialize the bug analyzer
BugAnalyzer.init({
  apiUrl: 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec',
  userId: 'doctor@hospital.com', // Optional
  debug: false // Set to true for verbose logging
});
```

#### Manual Bug Logging

```javascript
try {
  // Your code here
  riskyOperation();
} catch (error) {
  BugAnalyzer.logBug(error, {
    severity: 'high',
    category: 'api',
    context: {
      operation: 'riskyOperation',
      additionalInfo: 'Any relevant context'
    }
  });
}
```

#### Automatic Error Capture

Enable automatic capture of unhandled errors:

```javascript
BugAnalyzer.enableAutoCapture();
```

This will automatically log:
- Unhandled JavaScript errors
- Unhandled promise rejections

#### Wrapping Functions

Wrap functions to automatically log errors:

```javascript
const safeFunction = BugAnalyzer.wrap(riskyFunction, {
  severity: 'medium',
  category: 'ui',
  context: { component: 'UserProfile' }
});

safeFunction(); // Errors will be logged automatically
```

#### Wrapping Fetch API

Monitor all API calls:

```javascript
BugAnalyzer.wrapFetch();

// Now all fetch calls will be monitored
fetch('/api/patients')
  .then(response => response.json())
  .then(data => console.log(data));
// Failed requests will be logged automatically
```

#### Setting Context

Add global context to all logged bugs:

```javascript
BugAnalyzer.setContext({
  version: '4.2',
  environment: 'production',
  ward: 'Unit E'
});
```

#### Testing

Test your integration:

```javascript
BugAnalyzer.test();
```

### Backend API

#### Log a Bug

```javascript
POST {
  action: 'logBug',
  bugData: {
    message: 'Error message',
    stack: 'Stack trace',
    severity: 'high',
    category: 'api',
    source: 'frontend',
    userAgent: 'Mozilla/5.0...',
    url: 'https://app.url',
    userId: 'user@example.com',
    context: {}
  }
}
```

#### Analyze Bugs

```javascript
POST {
  action: 'analyzeBugs',
  timeRange: 7 // days
}

Response: {
  success: true,
  analysis: {
    summary: { ... },
    patterns: [ ... ],
    trends: { ... },
    topIssues: [ ... ],
    recommendations: [ ... ],
    categoryBreakdown: [ ... ],
    severityBreakdown: [ ... ]
  }
}
```

#### Get Bug Details

```javascript
POST {
  action: 'getBugDetails',
  bugId: 'bug-uuid'
}

Response: {
  success: true,
  bug: { ... },
  similarBugs: [ ... ]
}
```

#### Resolve a Bug

```javascript
POST {
  action: 'resolveBug',
  bugId: 'bug-uuid',
  resolution: 'Fixed in version 4.3'
}
```

#### Export Bugs

```javascript
POST {
  action: 'exportBugs',
  format: 'csv' // or 'json'
}
```

#### Cleanup Old Bugs

```javascript
POST {
  action: 'cleanupOldBugs'
}
```

## Dashboard Usage

### Accessing the Dashboard

Open `bug-analyzer-dashboard.html` in a web browser.

### Dashboard Features

#### Overview Tab
- Summary statistics (total bugs, unresolved, critical, etc.)
- Category breakdown chart
- Severity breakdown chart
- Resolution rate

#### Bug List Tab
- View all bugs with filtering
- Click on a bug to see details
- Mark bugs as resolved
- See occurrence count and impact level

#### Patterns Tab
- View detected patterns
- See confidence levels
- Get recommendations for each pattern

#### Recommendations Tab
- Actionable recommendations based on bug analysis
- Prioritized by severity
- Specific steps to address issues

#### Trends Tab
- Daily bug count over time
- Trend direction (increasing/decreasing/stable)
- Interpretation and recommendations

### Filtering and Searching

Use the controls at the top to filter bugs:
- **Time Range**: Last 24 hours, 7 days, 30 days, or 90 days
- **Severity**: Filter by severity level
- **Category**: Filter by bug category
- **Search**: Search bug messages

### Export and Cleanup

- **Export**: Download bug data as CSV for external analysis
- **Cleanup**: Remove old resolved bugs (respects retention period)

## Best Practices

### 1. Categorize Bugs Properly

Use consistent categories to make analysis more effective:

```javascript
// Good
BugAnalyzer.logBug(error, { category: 'api' });

// Bad
BugAnalyzer.logBug(error, { category: 'something_went_wrong' });
```

### 2. Set Appropriate Severity

Be honest about severity levels:

```javascript
// Critical: System down
BugAnalyzer.logBug(error, { severity: 'critical' });

// High: Feature broken
BugAnalyzer.logBug(error, { severity: 'high' });

// Medium: Degraded experience
BugAnalyzer.logBug(error, { severity: 'medium' });

// Low: Minor issue
BugAnalyzer.logBug(error, { severity: 'low' });
```

### 3. Provide Context

Add relevant context to help with debugging:

```javascript
BugAnalyzer.logBug(error, {
  category: 'database',
  context: {
    operation: 'saveLabs',
    patientId: 'patient_123',
    dataSize: '45KB',
    retryAttempt: 2
  }
});
```

### 4. Review Regularly

Check the dashboard regularly to:
- Identify recurring issues
- Track resolution progress
- Spot emerging patterns
- Prioritize bug fixes

### 5. Resolve Bugs

Mark bugs as resolved when fixed:
- Helps track resolution rate
- Prevents duplicate pattern detection
- Keeps dashboard clean

### 6. Export for Deep Analysis

Export data periodically for:
- Long-term trend analysis
- Integration with other tools
- Reporting to stakeholders

## Integration with Existing Logging

### AI Debug Logger Integration

The bug analyzer works alongside the existing `ai-debug-logger.js`. For AI-specific issues, you can log to both systems:

```javascript
// Log AI errors to both systems
try {
  await aiOperation();
} catch (error) {
  // Log to AI debug logger (existing)
  AIDebugLogger.logError('AI Operation Failed', error);

  // Also log to bug analyzer for pattern detection
  BugAnalyzer.logBug(error, {
    severity: 'high',
    category: 'integration',
    source: 'ai-service',
    context: {
      operation: 'aiConsultation',
      model: 'gpt-4o-mini'
    }
  });
}
```

### Health Monitor Integration

Integrate with the AI health monitor to log service degradation:

```javascript
AIHealthMonitor.setCallbacks({
  onFailure: (status) => {
    BugAnalyzer.logBug(
      new Error(`AI Service degraded: ${status.consecutiveFailures} failures`),
      {
        severity: 'high',
        category: 'integration',
        context: status
      }
    );
  },
  onCritical: (status) => {
    BugAnalyzer.logBug(
      new Error('AI Service critical failure'),
      {
        severity: 'critical',
        category: 'integration',
        context: status
      }
    );
  }
});
```

## Troubleshooting

### Bugs Not Appearing in Dashboard

1. Check API URL is correct in dashboard
2. Verify bug analyzer endpoints are added to Code.gs
3. Check browser console for errors
4. Test with `BugAnalyzer.test()`

### "Not Configured" Error

```javascript
// Make sure you initialize first
BugAnalyzer.init({
  apiUrl: 'YOUR_API_URL'
});
```

### Dashboard Shows "No Data"

1. Verify bugs are being logged (check console)
2. Check time range filter
3. Try clearing filters
4. Check if bugs were cleaned up

### Export Not Working

1. Check browser popup blocker
2. Verify API URL is correct
3. Check browser console for errors

## Configuration Options

### Bug Analyzer Config (Backend)

```javascript
const BUG_ANALYZER_CONFIG = {
  maxBugs: 500,               // Maximum bugs to store
  logFile: 'bug_analysis_logs.json',
  reportRetentionDays: 90,    // Keep bugs for 90 days
  severityLevels: ['critical', 'high', 'medium', 'low', 'info'],
  categories: [/* ... */]
};
```

### Client Config (Frontend)

```javascript
BugAnalyzer.init({
  apiUrl: 'YOUR_API_URL',     // Required: API endpoint
  autoCapture: false,         // Enable auto-capture
  enabled: true,              // Enable/disable logging
  debug: false,               // Debug mode
  userId: null,               // Default user ID
  context: {}                 // Global context
});
```

## Performance Considerations

- Bug logging is asynchronous and non-blocking
- Dashboard loads data on demand
- Pattern detection runs server-side
- Logs are automatically trimmed at 500 bugs
- Old bugs are cleaned up after 90 days

## Security Considerations

- Bug data is stored in Google Drive (same as patient data)
- Access controlled by Google Apps Script permissions
- Sensitive data should not be logged in context
- User IDs are optional and should be anonymized if needed

## Future Enhancements

Potential improvements:
- Machine learning for root cause prediction
- Integration with version control systems
- Automated bug assignment
- Slack/email notifications for critical bugs
- Real-time dashboard updates
- Custom pattern definitions
- Bug clustering and grouping

## Support

For issues or questions:
1. Check this documentation
2. Review existing logs in dashboard
3. Test with `BugAnalyzer.test()`
4. Check browser console for errors
5. Open an issue in the project repository

## Examples

### Example 1: API Error Handling

```javascript
async function fetchPatients() {
  try {
    const response = await fetch(CONFIG.apiUrl, {
      method: 'POST',
      body: JSON.stringify({ action: 'loadPatients' })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error);
    }

    return data.patients;
  } catch (error) {
    BugAnalyzer.logBug(error, {
      severity: 'high',
      category: 'api',
      context: {
        action: 'loadPatients',
        url: CONFIG.apiUrl
      }
    });
    throw error;
  }
}
```

### Example 2: UI Error Handling

```javascript
function renderPatientList(patients) {
  try {
    const container = document.getElementById('patient-list');

    if (!container) {
      throw new Error('Patient list container not found');
    }

    container.innerHTML = patients.map(renderPatient).join('');
  } catch (error) {
    BugAnalyzer.logBug(error, {
      severity: 'medium',
      category: 'ui',
      context: {
        component: 'patientList',
        patientCount: patients.length
      }
    });
    // Show error to user
    showError('Failed to display patient list');
  }
}
```

### Example 3: Automatic Monitoring

```javascript
// Initialize on app load
document.addEventListener('DOMContentLoaded', () => {
  // Configure bug analyzer
  BugAnalyzer.init({
    apiUrl: CONFIG.apiUrl,
    userId: getCurrentUser()?.email,
    debug: CONFIG.environment === 'development',
    context: {
      version: APP_VERSION,
      environment: CONFIG.environment
    }
  });

  // Enable auto-capture
  BugAnalyzer.enableAutoCapture();

  // Wrap fetch for API monitoring
  BugAnalyzer.wrapFetch();

  console.log('Bug analyzer initialized');
});
```

## Conclusion

The Post Hoc Bug Analyzer is a powerful tool for understanding and addressing issues in your application. By consistently logging bugs with proper categorization and context, you'll build a valuable dataset that helps identify patterns, prioritize fixes, and improve overall system reliability.

Regular review of the dashboard and acting on recommendations will lead to a more stable and maintainable application.
