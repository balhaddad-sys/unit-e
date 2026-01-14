/**
 * Post Hoc Bug Analyzer
 * Analyzes bugs and errors after they occur, identifies patterns, and provides insights
 *
 * Features:
 * - Bug storage and categorization
 * - Pattern detection and trend analysis
 * - Root cause analysis suggestions
 * - Impact assessment
 * - Actionable recommendations
 */

// Configuration
const BUG_ANALYZER_CONFIG = {
  maxBugs: 500,
  logFile: 'bug_analysis_logs.json',
  reportRetentionDays: 90,
  severityLevels: ['critical', 'high', 'medium', 'low', 'info'],
  categories: [
    'authentication',
    'api',
    'database',
    'ui',
    'performance',
    'security',
    'integration',
    'configuration',
    'unknown'
  ]
};

/**
 * Log a bug for post hoc analysis
 */
function logBug(bugData) {
  try {
    const bug = {
      id: Utilities.getUuid(),
      timestamp: new Date().toISOString(),
      message: bugData.message || 'Unknown error',
      stack: bugData.stack || null,
      severity: bugData.severity || 'medium',
      category: bugData.category || 'unknown',
      source: bugData.source || 'unknown',
      userAgent: bugData.userAgent || null,
      url: bugData.url || null,
      userId: bugData.userId || null,
      context: bugData.context || {},
      resolved: false,
      occurrences: 1,
      firstOccurrence: new Date().toISOString(),
      lastOccurrence: new Date().toISOString()
    };

    const bugs = getBugLogs();

    // Check for duplicate bugs
    const existingBug = findSimilarBug(bugs, bug);
    if (existingBug) {
      existingBug.occurrences++;
      existingBug.lastOccurrence = bug.timestamp;
      saveBugLogs(bugs);
      return { success: true, bugId: existingBug.id, isDuplicate: true };
    }

    // Add new bug
    bugs.push(bug);

    // Trim old bugs if exceeding max
    if (bugs.length > BUG_ANALYZER_CONFIG.maxBugs) {
      bugs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      bugs.splice(BUG_ANALYZER_CONFIG.maxBugs);
    }

    saveBugLogs(bugs);

    return { success: true, bugId: bug.id, isDuplicate: false };
  } catch (e) {
    Logger.log('Error logging bug: ' + e.toString());
    return { success: false, error: e.toString() };
  }
}

/**
 * Find similar bugs based on message and stack trace
 */
function findSimilarBug(bugs, newBug) {
  return bugs.find(bug => {
    if (bug.resolved) return false;

    // Compare error messages (normalized)
    const normalizedMessage1 = normalizeErrorMessage(bug.message);
    const normalizedMessage2 = normalizeErrorMessage(newBug.message);

    if (normalizedMessage1 === normalizedMessage2) {
      return true;
    }

    // Compare stack traces if available
    if (bug.stack && newBug.stack) {
      const similarity = calculateStackSimilarity(bug.stack, newBug.stack);
      if (similarity > 0.8) {
        return true;
      }
    }

    return false;
  });
}

/**
 * Normalize error messages for comparison
 */
function normalizeErrorMessage(message) {
  if (!message) return '';
  return message
    .toLowerCase()
    .replace(/\d+/g, 'N') // Replace numbers with N
    .replace(/['"]/g, '') // Remove quotes
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

/**
 * Calculate similarity between stack traces
 */
function calculateStackSimilarity(stack1, stack2) {
  if (!stack1 || !stack2) return 0;

  const lines1 = stack1.split('\n').slice(0, 5); // Compare first 5 lines
  const lines2 = stack2.split('\n').slice(0, 5);

  let matches = 0;
  const minLength = Math.min(lines1.length, lines2.length);

  for (let i = 0; i < minLength; i++) {
    const norm1 = lines1[i].replace(/:\d+/g, ':N');
    const norm2 = lines2[i].replace(/:\d+/g, ':N');
    if (norm1 === norm2) matches++;
  }

  return matches / minLength;
}

/**
 * Get all bug logs
 */
function getBugLogs() {
  try {
    const file = DataStore.getFile(BUG_ANALYZER_CONFIG.logFile);
    const content = file.getBlob().getDataAsString();
    return content ? JSON.parse(content) : [];
  } catch (e) {
    Logger.log('Error reading bug logs: ' + e.toString());
    return [];
  }
}

/**
 * Save bug logs
 */
function saveBugLogs(bugs) {
  try {
    const file = DataStore.getFile(BUG_ANALYZER_CONFIG.logFile);
    file.setContent(JSON.stringify(bugs, null, 2));
    return true;
  } catch (e) {
    Logger.log('Error saving bug logs: ' + e.toString());
    return false;
  }
}

/**
 * Analyze bugs and generate comprehensive report
 */
function analyzeBugs(options = {}) {
  const bugs = getBugLogs();
  const timeRange = options.timeRange || 7; // days
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - timeRange);

  // Filter bugs by time range
  const recentBugs = bugs.filter(bug =>
    new Date(bug.timestamp) >= cutoffDate
  );

  const analysis = {
    summary: generateSummary(recentBugs),
    patterns: detectPatterns(recentBugs),
    trends: analyzeTrends(recentBugs, timeRange),
    topIssues: getTopIssues(recentBugs),
    recommendations: generateRecommendations(recentBugs),
    categoryBreakdown: analyzeByCat egory(recentBugs),
    severityBreakdown: analyzeBySeverity(recentBugs),
    timeRange: timeRange,
    generatedAt: new Date().toISOString()
  };

  return analysis;
}

/**
 * Generate summary statistics
 */
function generateSummary(bugs) {
  const unresolvedBugs = bugs.filter(b => !b.resolved);
  const criticalBugs = bugs.filter(b => b.severity === 'critical' && !b.resolved);
  const totalOccurrences = bugs.reduce((sum, b) => sum + b.occurrences, 0);

  return {
    totalBugs: bugs.length,
    unresolvedBugs: unresolvedBugs.length,
    resolvedBugs: bugs.length - unresolvedBugs.length,
    criticalBugs: criticalBugs.length,
    totalOccurrences: totalOccurrences,
    averageOccurrences: bugs.length > 0 ? (totalOccurrences / bugs.length).toFixed(2) : 0,
    resolutionRate: bugs.length > 0 ? ((bugs.length - unresolvedBugs.length) / bugs.length * 100).toFixed(2) + '%' : '0%'
  };
}

/**
 * Detect patterns in bugs
 */
function detectPatterns(bugs) {
  const patterns = [];

  // Pattern 1: Time-based patterns (bugs occurring at specific times)
  const timePattern = detectTimePattern(bugs);
  if (timePattern.confidence > 0.6) {
    patterns.push(timePattern);
  }

  // Pattern 2: User-specific patterns
  const userPattern = detectUserPattern(bugs);
  if (userPattern.confidence > 0.6) {
    patterns.push(userPattern);
  }

  // Pattern 3: Browser/User-Agent patterns
  const browserPattern = detectBrowserPattern(bugs);
  if (browserPattern.confidence > 0.6) {
    patterns.push(browserPattern);
  }

  // Pattern 4: Sequential error patterns (cascading failures)
  const cascadePattern = detectCascadePattern(bugs);
  if (cascadePattern.confidence > 0.6) {
    patterns.push(cascadePattern);
  }

  return patterns;
}

/**
 * Detect time-based patterns
 */
function detectTimePattern(bugs) {
  const hourCounts = new Array(24).fill(0);

  bugs.forEach(bug => {
    const hour = new Date(bug.timestamp).getHours();
    hourCounts[hour] += bug.occurrences;
  });

  const maxCount = Math.max(...hourCounts);
  const peakHour = hourCounts.indexOf(maxCount);
  const totalBugs = hourCounts.reduce((sum, count) => sum + count, 0);
  const confidence = maxCount / totalBugs;

  return {
    type: 'time-based',
    description: `${(confidence * 100).toFixed(1)}% of bugs occur around ${peakHour}:00`,
    peakHour: peakHour,
    confidence: confidence,
    recommendation: confidence > 0.3 ?
      `Investigate system load and user activity patterns around ${peakHour}:00` :
      'No significant time-based pattern detected'
  };
}

/**
 * Detect user-specific patterns
 */
function detectUserPattern(bugs) {
  const userCounts = {};
  let totalWithUsers = 0;

  bugs.forEach(bug => {
    if (bug.userId) {
      userCounts[bug.userId] = (userCounts[bug.userId] || 0) + bug.occurrences;
      totalWithUsers += bug.occurrences;
    }
  });

  if (Object.keys(userCounts).length === 0) {
    return { type: 'user-specific', confidence: 0 };
  }

  const topUser = Object.entries(userCounts).sort((a, b) => b[1] - a[1])[0];
  const confidence = topUser[1] / totalWithUsers;

  return {
    type: 'user-specific',
    description: `${(confidence * 100).toFixed(1)}% of bugs affect user: ${topUser[0]}`,
    userId: topUser[0],
    occurrences: topUser[1],
    confidence: confidence,
    recommendation: confidence > 0.5 ?
      'Investigate user-specific data, permissions, or configuration' :
      'Bugs are distributed across multiple users'
  };
}

/**
 * Detect browser-specific patterns
 */
function detectBrowserPattern(bugs) {
  const browserCounts = {};
  let totalWithBrowser = 0;

  bugs.forEach(bug => {
    if (bug.userAgent) {
      const browser = extractBrowser(bug.userAgent);
      browserCounts[browser] = (browserCounts[browser] || 0) + bug.occurrences;
      totalWithBrowser += bug.occurrences;
    }
  });

  if (Object.keys(browserCounts).length === 0) {
    return { type: 'browser-specific', confidence: 0 };
  }

  const topBrowser = Object.entries(browserCounts).sort((a, b) => b[1] - a[1])[0];
  const confidence = topBrowser[1] / totalWithBrowser;

  return {
    type: 'browser-specific',
    description: `${(confidence * 100).toFixed(1)}% of bugs occur in ${topBrowser[0]}`,
    browser: topBrowser[0],
    occurrences: topBrowser[1],
    confidence: confidence,
    recommendation: confidence > 0.6 ?
      `Focus testing on ${topBrowser[0]} for compatibility issues` :
      'Bugs are distributed across browsers'
  };
}

/**
 * Extract browser name from user agent
 */
function extractBrowser(userAgent) {
  if (!userAgent) return 'Unknown';
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  return 'Other';
}

/**
 * Detect cascade patterns (related errors occurring in sequence)
 */
function detectCascadePattern(bugs) {
  const sortedBugs = bugs.sort((a, b) =>
    new Date(a.timestamp) - new Date(b.timestamp)
  );

  let cascades = 0;
  const windowMinutes = 5;

  for (let i = 0; i < sortedBugs.length - 1; i++) {
    const timeDiff = (new Date(sortedBugs[i + 1].timestamp) -
                      new Date(sortedBugs[i].timestamp)) / 1000 / 60;

    if (timeDiff < windowMinutes &&
        sortedBugs[i].category === sortedBugs[i + 1].category) {
      cascades++;
    }
  }

  const confidence = sortedBugs.length > 1 ? cascades / (sortedBugs.length - 1) : 0;

  return {
    type: 'cascade',
    description: `${(confidence * 100).toFixed(1)}% of bugs occur in cascading sequences`,
    cascadeCount: cascades,
    confidence: confidence,
    recommendation: confidence > 0.3 ?
      'Implement better error handling to prevent cascading failures' :
      'No significant cascade pattern detected'
  };
}

/**
 * Analyze trends over time
 */
function analyzeTrends(bugs, days) {
  const dailyCounts = {};

  bugs.forEach(bug => {
    const date = new Date(bug.timestamp).toISOString().split('T')[0];
    dailyCounts[date] = (dailyCounts[date] || 0) + 1;
  });

  const dates = Object.keys(dailyCounts).sort();
  const counts = dates.map(date => dailyCounts[date]);

  // Calculate trend (simple linear regression)
  const trend = calculateTrend(counts);

  return {
    dailyData: dates.map((date, i) => ({ date, count: counts[i] })),
    trend: trend,
    trendDirection: trend > 0.1 ? 'increasing' : trend < -0.1 ? 'decreasing' : 'stable',
    interpretation: trend > 0.1 ?
      'Bug count is increasing - immediate attention required' :
      trend < -0.1 ?
      'Bug count is decreasing - fixes are working' :
      'Bug count is stable'
  };
}

/**
 * Calculate simple trend
 */
function calculateTrend(data) {
  if (data.length < 2) return 0;

  const n = data.length;
  const indices = data.map((_, i) => i);

  const sumX = indices.reduce((a, b) => a + b, 0);
  const sumY = data.reduce((a, b) => a + b, 0);
  const sumXY = indices.reduce((sum, x, i) => sum + x * data[i], 0);
  const sumXX = indices.reduce((sum, x) => sum + x * x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  return slope;
}

/**
 * Get top issues by occurrence
 */
function getTopIssues(bugs, limit = 10) {
  return bugs
    .filter(b => !b.resolved)
    .sort((a, b) => b.occurrences - a.occurrences)
    .slice(0, limit)
    .map(bug => ({
      id: bug.id,
      message: bug.message.substring(0, 100),
      occurrences: bug.occurrences,
      severity: bug.severity,
      category: bug.category,
      firstSeen: bug.firstOccurrence,
      lastSeen: bug.lastOccurrence,
      impact: calculateImpact(bug)
    }));
}

/**
 * Calculate bug impact score
 */
function calculateImpact(bug) {
  const severityWeight = {
    'critical': 10,
    'high': 7,
    'medium': 4,
    'low': 2,
    'info': 1
  };

  const weight = severityWeight[bug.severity] || 1;
  const score = weight * bug.occurrences;

  if (score > 50) return 'critical';
  if (score > 20) return 'high';
  if (score > 10) return 'medium';
  return 'low';
}

/**
 * Generate actionable recommendations
 */
function generateRecommendations(bugs) {
  const recommendations = [];

  // Check for critical bugs
  const criticalBugs = bugs.filter(b => b.severity === 'critical' && !b.resolved);
  if (criticalBugs.length > 0) {
    recommendations.push({
      priority: 'critical',
      title: 'Address Critical Bugs Immediately',
      description: `${criticalBugs.length} critical bug(s) require immediate attention`,
      action: 'Review and fix critical bugs within 24 hours',
      bugs: criticalBugs.slice(0, 5).map(b => b.id)
    });
  }

  // Check for frequently occurring bugs
  const frequentBugs = bugs.filter(b => b.occurrences > 10 && !b.resolved);
  if (frequentBugs.length > 0) {
    recommendations.push({
      priority: 'high',
      title: 'Fix Frequent Issues',
      description: `${frequentBugs.length} bug(s) occurring repeatedly`,
      action: 'Prioritize bugs with high occurrence rates',
      bugs: frequentBugs.slice(0, 5).map(b => b.id)
    });
  }

  // Check category concentration
  const categoryStats = analyzeByCategory(bugs);
  const topCategory = Object.entries(categoryStats)
    .sort((a, b) => b[1] - a[1])[0];

  if (topCategory && topCategory[1] > bugs.length * 0.4) {
    recommendations.push({
      priority: 'medium',
      title: `Focus on ${topCategory[0]} Issues`,
      description: `${topCategory[1]} bugs (${(topCategory[1] / bugs.length * 100).toFixed(1)}%) are in ${topCategory[0]} category`,
      action: `Review and improve ${topCategory[0]} module`,
      category: topCategory[0]
    });
  }

  // Check unresolved bug age
  const oldBugs = bugs.filter(b => {
    if (b.resolved) return false;
    const age = (new Date() - new Date(b.firstOccurrence)) / 1000 / 60 / 60 / 24; // days
    return age > 30;
  });

  if (oldBugs.length > 0) {
    recommendations.push({
      priority: 'medium',
      title: 'Address Aging Bugs',
      description: `${oldBugs.length} bug(s) have been unresolved for over 30 days`,
      action: 'Review and close or fix long-standing issues',
      bugs: oldBugs.slice(0, 5).map(b => b.id)
    });
  }

  return recommendations;
}

/**
 * Analyze bugs by category
 */
function analyzeByCategory(bugs) {
  const categories = {};

  bugs.forEach(bug => {
    const category = bug.category || 'unknown';
    categories[category] = (categories[category] || 0) + 1;
  });

  return Object.entries(categories)
    .sort((a, b) => b[1] - a[1])
    .map(([category, count]) => ({
      category,
      count,
      percentage: (count / bugs.length * 100).toFixed(1) + '%'
    }));
}

/**
 * Analyze bugs by severity
 */
function analyzeBySeverity(bugs) {
  const severities = {};

  bugs.forEach(bug => {
    const severity = bug.severity || 'info';
    severities[severity] = (severities[severity] || 0) + 1;
  });

  return BUG_ANALYZER_CONFIG.severityLevels.map(severity => ({
    severity,
    count: severities[severity] || 0,
    percentage: bugs.length > 0 ?
      ((severities[severity] || 0) / bugs.length * 100).toFixed(1) + '%' :
      '0%'
  }));
}

/**
 * Mark a bug as resolved
 */
function resolveBug(bugId, resolution) {
  try {
    const bugs = getBugLogs();
    const bug = bugs.find(b => b.id === bugId);

    if (!bug) {
      return { success: false, error: 'Bug not found' };
    }

    bug.resolved = true;
    bug.resolvedAt = new Date().toISOString();
    bug.resolution = resolution || 'Fixed';

    saveBugLogs(bugs);

    return { success: true, bug };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

/**
 * Get bug details by ID
 */
function getBugDetails(bugId) {
  const bugs = getBugLogs();
  const bug = bugs.find(b => b.id === bugId);

  if (!bug) {
    return { success: false, error: 'Bug not found' };
  }

  // Find similar bugs
  const similarBugs = bugs
    .filter(b => b.id !== bugId)
    .map(b => ({
      bug: b,
      similarity: calculateBugSimilarity(bug, b)
    }))
    .filter(item => item.similarity > 0.5)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 5)
    .map(item => ({
      id: item.bug.id,
      message: item.bug.message.substring(0, 80),
      similarity: (item.similarity * 100).toFixed(1) + '%'
    }));

  return {
    success: true,
    bug,
    similarBugs
  };
}

/**
 * Calculate similarity between two bugs
 */
function calculateBugSimilarity(bug1, bug2) {
  let score = 0;

  // Message similarity
  if (normalizeErrorMessage(bug1.message) === normalizeErrorMessage(bug2.message)) {
    score += 0.5;
  }

  // Category match
  if (bug1.category === bug2.category) {
    score += 0.2;
  }

  // Severity match
  if (bug1.severity === bug2.severity) {
    score += 0.1;
  }

  // Stack trace similarity
  if (bug1.stack && bug2.stack) {
    const stackSim = calculateStackSimilarity(bug1.stack, bug2.stack);
    score += stackSim * 0.2;
  }

  return score;
}

/**
 * Clear old bugs beyond retention period
 */
function cleanupOldBugs() {
  const bugs = getBugLogs();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - BUG_ANALYZER_CONFIG.reportRetentionDays);

  const filteredBugs = bugs.filter(bug =>
    new Date(bug.timestamp) >= cutoffDate || !bug.resolved
  );

  const removed = bugs.length - filteredBugs.length;
  saveBugLogs(filteredBugs);

  return {
    success: true,
    removed,
    remaining: filteredBugs.length
  };
}

/**
 * Export bugs for external analysis
 */
function exportBugs(format = 'json') {
  const bugs = getBugLogs();

  if (format === 'csv') {
    return exportBugsCSV(bugs);
  }

  return {
    success: true,
    format: 'json',
    data: bugs,
    count: bugs.length
  };
}

/**
 * Export bugs as CSV
 */
function exportBugsCSV(bugs) {
  const headers = ['ID', 'Timestamp', 'Message', 'Severity', 'Category', 'Occurrences', 'Resolved'];
  const rows = bugs.map(bug => [
    bug.id,
    bug.timestamp,
    bug.message.replace(/,/g, ';'),
    bug.severity,
    bug.category,
    bug.occurrences,
    bug.resolved ? 'Yes' : 'No'
  ]);

  const csv = [headers, ...rows].map(row => row.join(',')).join('\n');

  return {
    success: true,
    format: 'csv',
    data: csv,
    count: bugs.length
  };
}
