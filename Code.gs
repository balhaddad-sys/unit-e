/**
 * ═══════════════════════════════════════════════════════════════════════════
 * UNIT E WARD ROUNDS - GOOGLE APPS SCRIPT BACKEND v2.2
 *
 * NEW: Instant bidirectional syncing between Google Sheets and Firebase
 * - Auto-sync: Web app → Firebase → Sheets
 * - Auto-sync: Sheets → Firebase → Web app
 * - Real-time updates in both directions
 * ═══════════════════════════════════════════════════════════════════════════
 */

const SCRIPT_VERSION = '2.2.0';

// Get configuration from Script Properties
const CONFIG = {
  visionApiKey: PropertiesService.getScriptProperties().getProperty('VISION_API_KEY') || 'AIzaSyCrkrRysGj4PiW9W75nBu7Onn3td5vcN1Y',
  anthropicApiKey: PropertiesService.getScriptProperties().getProperty('ANTHROPIC_API_KEY') || '',
  spreadsheetId: PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID') || '1I2Cmm2YPUuJw4o4cOgl-iFmqTmfy6S9btFZ-5AIMxh4',
  driveFolderId: PropertiesService.getScriptProperties().getProperty('DRIVE_FOLDER_ID') || '1LhrEHUgRsoz2v2w6k-Y8h7buT4Kvjk2I',

  // Firebase configuration for real-time sync
  firebaseUrl: PropertiesService.getScriptProperties().getProperty('FIREBASE_URL') || 'https://internal-medicine-ward-default-rtdb.firebaseio.com',
  firebaseSecret: PropertiesService.getScriptProperties().getProperty('FIREBASE_SECRET') || ''
};

// Valid Claude models (as of January 2025)
const CLAUDE_MODELS = {
  SONNET: 'claude-3-5-sonnet-20241022',  // Best balance of intelligence and speed
  OPUS: 'claude-3-opus-20240229',        // Most capable (if available)
  HAIKU: 'claude-3-5-haiku-20241022'     // Fastest
};

// ═══════════════════════════════════════════════════════════════════════════
// FIREBASE INTEGRATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get all patients from Firebase
 */
function getFirebasePatients() {
  try {
    var url = CONFIG.firebaseUrl + '/patients.json';
    if (CONFIG.firebaseSecret) {
      url += '?auth=' + CONFIG.firebaseSecret;
    }

    var response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });

    if (response.getResponseCode() !== 200) {
      Logger.log('Firebase read error: ' + response.getContentText());
      return null;
    }

    var data = JSON.parse(response.getContentText());

    if (!data) return [];

    // Convert Firebase object to array
    var patients = [];
    for (var key in data) {
      var patient = data[key];
      patient.id = key;
      patients.push(patient);
    }

    return patients;

  } catch (error) {
    Logger.log('Error reading from Firebase: ' + error.toString());
    return null;
  }
}

/**
 * Update a single patient in Firebase
 */
function updateFirebasePatient(patientId, patientData) {
  try {
    var url = CONFIG.firebaseUrl + '/patients/' + patientId + '.json';
    if (CONFIG.firebaseSecret) {
      url += '?auth=' + CONFIG.firebaseSecret;
    }

    var response = UrlFetchApp.fetch(url, {
      method: 'put',
      contentType: 'application/json',
      payload: JSON.stringify(patientData),
      muteHttpExceptions: true
    });

    return response.getResponseCode() === 200;

  } catch (error) {
    Logger.log('Error updating Firebase: ' + error.toString());
    return false;
  }
}

/**
 * Delete a patient from Firebase
 */
function deleteFirebasePatient(patientId) {
  try {
    var url = CONFIG.firebaseUrl + '/patients/' + patientId + '.json';
    if (CONFIG.firebaseSecret) {
      url += '?auth=' + CONFIG.firebaseSecret;
    }

    var response = UrlFetchApp.fetch(url, {
      method: 'delete',
      muteHttpExceptions: true
    });

    return response.getResponseCode() === 200;

  } catch (error) {
    Logger.log('Error deleting from Firebase: ' + error.toString());
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// AUTOMATIC SYNC TRIGGERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * onEdit trigger - Automatically syncs changes from Sheets to Firebase
 * This runs whenever someone edits the Google Sheet
 */
function onEdit(e) {
  try {
    Logger.log('=== onEdit Trigger START ===');

    if (!e || !e.range) {
      Logger.log('No edit event data');
      return;
    }

    var sheet = e.range.getSheet();
    var sheetName = sheet.getName();

    Logger.log('Sheet edited: ' + sheetName);

    // Only sync if the Patients sheet was edited
    if (sheetName !== 'Patients') {
      Logger.log('Not Patients sheet, skipping sync');
      return;
    }

    // Don't sync header row edits
    var row = e.range.getRow();
    if (row === 1) {
      Logger.log('Header row edited, skipping sync');
      return;
    }

    Logger.log('Syncing row ' + row + ' to Firebase...');

    // Sync the edited row to Firebase
    syncRowToFirebase(sheet, row);

    Logger.log('=== onEdit Trigger COMPLETE ===');

  } catch (error) {
    Logger.log('onEdit Error: ' + error.toString());
  }
}

/**
 * Sync a single row from Sheets to Firebase
 */
function syncRowToFirebase(sheet, rowNumber) {
  try {
    var lastCol = 9; // We have 9 columns
    var rowData = sheet.getRange(rowNumber, 1, 1, lastCol).getValues()[0];

    // Check if row is empty
    if (!rowData[0] && !rowData[1] && !rowData[2]) {
      Logger.log('Empty row, skipping');
      return;
    }

    // Map columns to patient object
    var patient = {
      ward: rowData[0] || '',
      bed: rowData[1] || '',
      name: rowData[2] || '',
      mrn: rowData[3] || '',
      doctor: rowData[4] || '',
      diagnosis: rowData[5] || '',
      plan: rowData[6] || '',
      status: rowData[7] || '',
      timestamp: new Date().getTime(),
      lastModified: new Date().toISOString(),
      syncedFromSheet: true
    };

    // Create unique ID based on ward and bed
    var patientId = 'sheet_' + (patient.ward + '_' + patient.bed).replace(/[^a-zA-Z0-9]/g, '_');

    // Update Firebase
    var success = updateFirebasePatient(patientId, patient);

    if (success) {
      Logger.log('Row ' + rowNumber + ' synced to Firebase as ' + patientId);
    } else {
      Logger.log('Failed to sync row ' + rowNumber + ' to Firebase');
    }

  } catch (error) {
    Logger.log('syncRowToFirebase Error: ' + error.toString());
  }
}

/**
 * Sync all Firebase data to Sheets
 * Call this manually or set it on a time trigger (e.g., every 1 minute)
 */
function syncFirebaseToSheets() {
  try {
    Logger.log('=== syncFirebaseToSheets START ===');

    if (!CONFIG.spreadsheetId) {
      Logger.log('No spreadsheet configured');
      return { success: false, error: 'No spreadsheet configured' };
    }

    // Get data from Firebase
    var patients = getFirebasePatients();

    if (!patients) {
      Logger.log('Failed to get patients from Firebase');
      return { success: false, error: 'Failed to read from Firebase' };
    }

    Logger.log('Got ' + patients.length + ' patients from Firebase');

    // Get the sheet
    var ss = SpreadsheetApp.openById(CONFIG.spreadsheetId);
    var sheet = ss.getSheetByName('Patients');

    if (!sheet) {
      sheet = ss.insertSheet('Patients');
    }

    // Set up headers
    var headers = ['Ward', 'Bed', 'Name', 'MRN', 'Doctor', 'Diagnosis', 'Plan', 'Status', 'Last Updated'];

    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
    }

    // Clear existing data (but keep headers)
    if (sheet.getLastRow() > 1) {
      sheet.getRange(2, 1, sheet.getLastRow() - 1, headers.length).clearContent();
    }

    // Prepare rows
    var rows = patients.map(function(p) {
      return [
        p.ward || '',
        p.bed || '',
        p.name || '',
        p.mrn || '',
        p.doctor || '',
        p.diagnosis || '',
        p.plan || '',
        p.status || '',
        p.lastModified || new Date(p.timestamp || Date.now()).toLocaleString()
      ];
    });

    // Write to sheet
    if (rows.length > 0) {
      sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
    }

    Logger.log('Synced ' + rows.length + ' patients to sheet');
    Logger.log('=== syncFirebaseToSheets COMPLETE ===');

    return { success: true, count: rows.length };

  } catch (error) {
    Logger.log('syncFirebaseToSheets Error: ' + error.toString());
    return { success: false, error: error.toString() };
  }
}

/**
 * Install time-based trigger for auto-sync
 * Run this once to set up automatic syncing every minute
 */
function installAutoSyncTrigger() {
  // Delete existing triggers first
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'syncFirebaseToSheets') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }

  // Create new trigger - sync every 1 minute
  ScriptApp.newTrigger('syncFirebaseToSheets')
    .timeBased()
    .everyMinutes(1)
    .create();

  Logger.log('Auto-sync trigger installed - syncing every 1 minute');
  return 'Trigger installed successfully';
}

/**
 * Uninstall auto-sync trigger
 */
function uninstallAutoSyncTrigger() {
  var triggers = ScriptApp.getProjectTriggers();
  var count = 0;

  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'syncFirebaseToSheets') {
      ScriptApp.deleteTrigger(triggers[i]);
      count++;
    }
  }

  Logger.log('Removed ' + count + ' auto-sync triggers');
  return 'Removed ' + count + ' triggers';
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN HANDLERS
// ═══════════════════════════════════════════════════════════════════════════

function doGet(e) {
  try {
    var action = (e && e.parameter && e.parameter.action) || 'info';

    if (action === 'health') {
      return createJsonResponse({
        status: 'healthy',
        version: SCRIPT_VERSION,
        timestamp: new Date().toISOString(),
        services: {
          vision: !!CONFIG.visionApiKey,
          claude: !!CONFIG.anthropicApiKey,
          sheets: !!CONFIG.spreadsheetId,
          firebase: !!CONFIG.firebaseUrl,
          drive: true
        },
        models: {
          claude: CLAUDE_MODELS.SONNET,
          vision: 'google-vision-v1'
        },
        sync: {
          enabled: true,
          firebase: CONFIG.firebaseUrl,
          sheet: CONFIG.spreadsheetId
        }
      });
    }

    if (action === 'syncNow') {
      var result = syncFirebaseToSheets();
      return createJsonResponse(result);
    }

    // Info page
    var hasVision = !!CONFIG.visionApiKey;
    var hasClaude = !!CONFIG.anthropicApiKey;
    var hasSheets = !!CONFIG.spreadsheetId;
    var hasFirebase = !!CONFIG.firebaseUrl;

    var html = '<html><head><style>' +
      'body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }' +
      'h1 { color: #15803d; }' +
      '.status { background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0; }' +
      '.good { color: #15803d; }' +
      '.bad { color: #dc2626; }' +
      '.code { background: #e5e7eb; padding: 2px 6px; border-radius: 4px; font-family: monospace; }' +
      '.sync-box { background: #dcfce7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #15803d; }' +
      'button { background: #15803d; color: white; padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; }' +
      'button:hover { background: #166534; }' +
      '</style></head><body>' +
      '<h1>🏥 Unit E Ward Rounds API v' + SCRIPT_VERSION + '</h1>' +
      '<div class="status">' +
      '<h2>Service Status</h2>' +
      '<p><strong>Vision API:</strong> <span class="' + (hasVision ? 'good">✓ Configured' : 'bad">✗ NOT CONFIGURED') + '</span></p>' +
      '<p><strong>Claude AI:</strong> <span class="' + (hasClaude ? 'good">✓ Configured' : 'bad">✗ NOT CONFIGURED') + '</span></p>' +
      '<p><strong>Google Sheets:</strong> <span class="' + (hasSheets ? 'good">✓ Configured' : 'bad">✗ NOT CONFIGURED') + '</span></p>' +
      '<p><strong>Firebase:</strong> <span class="' + (hasFirebase ? 'good">✓ Connected' : 'bad">✗ NOT CONFIGURED') + '</span></p>' +
      '<p><strong>Google Drive:</strong> <span class="good">✓ Available</span></p>' +
      '</div>';

    html += '<div class="sync-box">' +
      '<h2>⚡ Real-Time Sync</h2>' +
      '<p><strong>Status:</strong> <span class="good">✓ Enabled</span></p>' +
      '<p>Bidirectional sync between Google Sheets and Web App via Firebase</p>' +
      '<ul>' +
      '<li><strong>Web App → Firebase:</strong> Instant (real-time)</li>' +
      '<li><strong>Firebase → Sheets:</strong> Every 1 minute (automatic)</li>' +
      '<li><strong>Sheets → Firebase:</strong> Instant (on edit trigger)</li>' +
      '<li><strong>Firebase → Web App:</strong> Instant (real-time)</li>' +
      '</ul>' +
      '<p><button onclick="location.href=location.href.split(\'?\')[0] + \'?action=syncNow\'">🔄 Sync Now</button></p>' +
      '</div>';

    if (!hasVision || !hasClaude) {
      html += '<div style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">' +
        '<h3>⚠️ Configuration Required</h3>' +
        '<p>To enable OCR and AI features, configure API keys in Script Properties.</p>' +
        '</div>';
    }

    html += '<h2>📚 API Endpoints</h2>' +
      '<ul>' +
      '<li><strong>POST /exec</strong> - Main API</li>' +
      '<li><strong>GET /exec?action=health</strong> - Health check</li>' +
      '<li><strong>GET /exec?action=syncNow</strong> - Force sync Firebase → Sheets</li>' +
      '<li><strong>GET /exec</strong> - This page</li>' +
      '</ul>' +
      '<p><strong>Claude Model:</strong> ' + CLAUDE_MODELS.SONNET + '</p>' +
      '</body></html>';

    return HtmlService.createHtmlOutput(html);

  } catch (error) {
    Logger.log('doGet Error: ' + error.toString());
    return createJsonResponse({ error: error.toString() }, 500);
  }
}

function doPost(e) {
  try {
    Logger.log('=== doPost START ===');

    if (!e || !e.postData || !e.postData.contents) {
      Logger.log('ERROR: No post data received');
      return createJsonResponse({
        error: 'No data received',
        help: 'Send POST request with JSON body containing "action" field'
      }, 400);
    }

    var data = JSON.parse(e.postData.contents);
    var action = data.action;

    Logger.log('Action: ' + action);

    switch (action) {
      case 'runOCR':
        return handleRunOCR(data);
      case 'claudeVision':
        return handleClaudeVision(data);
      case 'claudeConsult':
        return handleClaudeConsult(data);
      case 'saveLabs':
        return handleSaveLabs(data);
      case 'loadLabs':
        return handleLoadLabs(data);
      case 'syncSheet':
        return handleSyncSheet(data);
      case 'syncFirebase':
        var result = syncFirebaseToSheets();
        return createJsonResponse(result);
      case 'savePatient':
        return handleSavePatient(data);
      case 'updatePatient':
        return handleUpdatePatient(data);
      case 'deletePatient':
        return handleDeletePatient(data);
      case 'loadPatients':
        return handleLoadPatients(data);
      case 'saveNotice':
        return handleSaveNotice(data);
      case 'loadNotice':
        return handleLoadNotice(data);
      case 'saveAuditLog':
        return handleSaveAuditLog(data);
      case 'test':
        return createJsonResponse({
          success: true,
          message: 'API is working!',
          version: SCRIPT_VERSION,
          sync: 'enabled',
          timestamp: new Date().toISOString()
        });
      default:
        return createJsonResponse({
          error: 'Unknown action: ' + action,
          validActions: ['runOCR', 'claudeVision', 'claudeConsult', 'saveLabs', 'loadLabs', 'syncSheet', 'syncFirebase', 'savePatient', 'updatePatient', 'deletePatient', 'loadPatients', 'saveNotice', 'loadNotice', 'saveAuditLog', 'test']
        }, 400);
    }

  } catch (err) {
    Logger.log('doPost Error: ' + err.toString());
    Logger.log('Stack: ' + err.stack);
    return createJsonResponse({
      error: 'Request processing failed: ' + err.toString(),
      stack: err.stack
    }, 500);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// OCR HANDLER - Google Vision API
// ═══════════════════════════════════════════════════════════════════════════

function handleRunOCR(data) {
  try {
    Logger.log('=== handleRunOCR START ===');

    if (!data.image) {
      Logger.log('ERROR: No image provided');
      return createJsonResponse({
        error: 'No image data provided',
        help: 'Send base64 encoded image in "image" field'
      }, 400);
    }

    if (!CONFIG.visionApiKey) {
      Logger.log('ERROR: Vision API key not configured');
      return createJsonResponse({
        error: 'Vision API key not configured',
        help: 'Add VISION_API_KEY to Script Properties in Apps Script Project Settings',
        setup: 'https://console.cloud.google.com/apis/credentials'
      }, 500);
    }

    Logger.log('Image data length: ' + data.image.length);
    Logger.log('API Key prefix: ' + CONFIG.visionApiKey.substring(0, 10) + '...');

    var imageData = data.image.replace(/^data:image\/\w+;base64,/, '');
    var url = 'https://vision.googleapis.com/v1/images:annotate?key=' + CONFIG.visionApiKey;

    var payload = {
      requests: [{
        image: { content: imageData },
        features: [{ type: 'DOCUMENT_TEXT_DETECTION', maxResults: 1 }]
      }]
    };

    Logger.log('Calling Vision API...');
    var response = UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });

    var responseCode = response.getResponseCode();
    var responseText = response.getContentText();

    Logger.log('Vision API response code: ' + responseCode);

    if (responseCode !== 200) {
      Logger.log('Vision API ERROR: ' + responseText.substring(0, 500));

      var errorMsg = 'Vision API error';
      try {
        var errorJson = JSON.parse(responseText);
        if (errorJson.error && errorJson.error.message) {
          errorMsg = errorJson.error.message;
        }
      } catch (e) {
        errorMsg = responseText.substring(0, 200);
      }

      return createJsonResponse({
        error: 'Vision API error (HTTP ' + responseCode + '): ' + errorMsg,
        help: responseCode === 403 ? 'Check if Vision API is enabled and API key is valid' : 'Check Apps Script logs for details'
      }, 500);
    }

    var result = JSON.parse(responseText);
    var text = '';
    var confidence = 0;

    if (result.responses && result.responses[0]) {
      var r = result.responses[0];

      if (r.fullTextAnnotation) {
        text = r.fullTextAnnotation.text || '';
        confidence = 90;
      } else if (r.textAnnotations && r.textAnnotations[0]) {
        text = r.textAnnotations[0].description || '';
        confidence = 85;
      } else if (r.error) {
        Logger.log('Vision API returned error: ' + JSON.stringify(r.error));
        return createJsonResponse({
          error: 'Vision API error: ' + r.error.message
        }, 500);
      }
    }

    Logger.log('OCR completed - Text length: ' + text.length + ', Confidence: ' + confidence);

    return createJsonResponse({
      success: true,
      text: text,
      confidence: confidence,
      source: 'google_vision',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    Logger.log('OCR Error: ' + error.toString());
    Logger.log('Stack: ' + error.stack);
    return createJsonResponse({
      error: 'OCR failed: ' + error.toString(),
      details: error.stack
    }, 500);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// CLAUDE VISION HANDLER
// ═══════════════════════════════════════════════════════════════════════════

function handleClaudeVision(data) {
  try {
    Logger.log('=== handleClaudeVision START ===');

    if (!data.image) {
      Logger.log('ERROR: No image provided');
      return createJsonResponse({
        error: 'No image data provided'
      }, 400);
    }

    if (!CONFIG.anthropicApiKey) {
      Logger.log('ERROR: Anthropic API key not configured');
      return createJsonResponse({
        error: 'Anthropic API key not configured',
        help: 'Add ANTHROPIC_API_KEY to Script Properties in Apps Script Project Settings',
        setup: 'https://console.anthropic.com/'
      }, 500);
    }

    Logger.log('Image data length: ' + data.image.length);
    Logger.log('API Key prefix: ' + CONFIG.anthropicApiKey.substring(0, 15) + '...');

    var imageData = data.image;
    if (imageData.indexOf(',') !== -1) {
      imageData = imageData.split(',')[1];
    }

    var mediaType = 'image/jpeg';
    var match = data.image.match(/data:image\/(\w+);/);
    if (match) mediaType = 'image/' + match[1];

    Logger.log('Media type: ' + mediaType);

    var prompt = 'Analyze this medical laboratory report image and extract ALL lab values with high precision.\n\n' +
      'For each lab test found:\n' +
      '- Extract exact test name\n' +
      '- Extract numeric value\n' +
      '- Extract unit of measurement\n' +
      '- Note any flags (L/H for Low/High)\n' +
      '- Extract reference ranges if visible\n\n' +
      'Return ONLY valid JSON in this exact format:\n' +
      '{\n' +
      '  "reportType": "CBC|BMP|CMP|LFT|GENERAL",\n' +
      '  "confidence": 0-100,\n' +
      '  "values": [\n' +
      '    {\n' +
      '      "test": "test name",\n' +
      '      "value": "numeric value as string",\n' +
      '      "unit": "unit",\n' +
      '      "flag": "N|L|H",\n' +
      '      "refLow": number or null,\n' +
      '      "refHigh": number or null,\n' +
      '      "confidence": 0-100\n' +
      '    }\n' +
      '  ]\n' +
      '}\n\n' +
      'Only extract values you are highly confident about. Return empty values array if no clear lab data is visible.';

    var payload = {
      model: CLAUDE_MODELS.SONNET,
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaType,
              data: imageData
            }
          },
          { type: 'text', text: prompt }
        ]
      }]
    };

    Logger.log('Calling Claude API with model: ' + CLAUDE_MODELS.SONNET);
    Logger.log('Payload size: ' + JSON.stringify(payload).length + ' bytes');

    var response = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
      method: 'post',
      contentType: 'application/json',
      headers: {
        'x-api-key': CONFIG.anthropicApiKey,
        'anthropic-version': '2023-06-01'
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });

    var responseCode = response.getResponseCode();
    var responseText = response.getContentText();

    Logger.log('Claude API response code: ' + responseCode);
    Logger.log('Response length: ' + responseText.length);

    if (responseCode !== 200) {
      Logger.log('Claude API ERROR: ' + responseText.substring(0, 500));

      var errorMsg = 'Claude API error';
      try {
        var errorJson = JSON.parse(responseText);
        if (errorJson.error && errorJson.error.message) {
          errorMsg = errorJson.error.message;
        }
      } catch (e) {
        errorMsg = responseText.substring(0, 200);
      }

      return createJsonResponse({
        error: 'Claude API error (HTTP ' + responseCode + '): ' + errorMsg,
        help: responseCode === 401 ? 'Invalid API key' :
              responseCode === 429 ? 'Rate limit exceeded - wait and try again' :
              'Check Apps Script logs for details'
      }, 500);
    }

    var result = JSON.parse(responseText);
    var content = '';

    if (result.content && result.content[0] && result.content[0].text) {
      content = result.content[0].text;
    } else {
      Logger.log('ERROR: No content in Claude response');
      return createJsonResponse({
        error: 'No content in Claude response'
      }, 500);
    }

    Logger.log('Claude response preview: ' + content.substring(0, 200));

    var parsed = {};
    try {
      var jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
        Logger.log('Successfully parsed JSON - Values count: ' + (parsed.values ? parsed.values.length : 0));
      } else {
        Logger.log('No JSON found in response');
        parsed = { rawText: content, values: [] };
      }
    } catch (e) {
      Logger.log('JSON parse error: ' + e.toString());
      parsed = { rawText: content, values: [] };
    }

    return createJsonResponse({
      success: true,
      reportType: parsed.reportType || 'GENERAL',
      values: parsed.values || [],
      confidence: parsed.confidence || 85,
      rawText: content,
      source: 'claude_vision',
      model: CLAUDE_MODELS.SONNET,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    Logger.log('Claude Vision Error: ' + error.toString());
    Logger.log('Stack: ' + error.stack);
    return createJsonResponse({
      error: 'Claude Vision failed: ' + error.toString(),
      details: error.stack
    }, 500);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// CLAUDE CONSULT HANDLER
// ═══════════════════════════════════════════════════════════════════════════

function handleClaudeConsult(data) {
  try {
    Logger.log('=== handleClaudeConsult START ===');

    if (!data.query) {
      return createJsonResponse({ error: 'No query provided' }, 400);
    }

    if (!CONFIG.anthropicApiKey) {
      return createJsonResponse({
        error: 'Anthropic API key not configured',
        help: 'Add ANTHROPIC_API_KEY to Script Properties'
      }, 500);
    }

    Logger.log('Query: ' + data.query.substring(0, 100));

    var prompt = data.query;

    if (data.patientContext) {
      prompt += '\n\nPatient Context:\n' + data.patientContext;
    }

    if (data.labValues && data.labValues.length > 0) {
      prompt += '\n\nRecent Lab Values:\n';
      for (var i = 0; i < data.labValues.length; i++) {
        var v = data.labValues[i];
        var flagText = (v.flag && v.flag !== 'N') ? ' [' + v.flag + ']' : '';
        prompt += '- ' + v.test + ': ' + v.value + ' ' + (v.unit || '') + flagText + '\n';
      }
    }

    var systemPrompt = 'You are an expert medical AI consultant providing evidence-based clinical decision support.\n\n' +
      'Provide clear, actionable guidance with:\n' +
      '- Key clinical points\n' +
      '- Diagnostic considerations\n' +
      '- Evidence-based treatment recommendations\n' +
      '- Critical warnings when applicable\n\n' +
      'Always recommend physician oversight for important clinical decisions.';

    var payload = {
      model: CLAUDE_MODELS.SONNET,
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: prompt }]
    };

    Logger.log('Calling Claude API for consultation...');

    var response = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
      method: 'post',
      contentType: 'application/json',
      headers: {
        'x-api-key': CONFIG.anthropicApiKey,
        'anthropic-version': '2023-06-01'
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });

    var responseCode = response.getResponseCode();
    var responseText = response.getContentText();

    Logger.log('Claude response code: ' + responseCode);

    if (responseCode !== 200) {
      Logger.log('Claude API ERROR: ' + responseText.substring(0, 500));
      return createJsonResponse({
        error: 'Claude API error: ' + responseText.substring(0, 200)
      }, 500);
    }

    var result = JSON.parse(responseText);
    var content = '';

    if (result.content && result.content[0] && result.content[0].text) {
      content = result.content[0].text;
    }

    Logger.log('Consultation completed - Response length: ' + content.length);

    return createJsonResponse({
      success: true,
      response: content,
      model: CLAUDE_MODELS.SONNET,
      source: 'claude_ai',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    Logger.log('Claude Consult Error: ' + error.toString());
    return createJsonResponse({
      error: 'Claude consultation failed: ' + error.toString()
    }, 500);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// LABS STORAGE HANDLERS
// ═══════════════════════════════════════════════════════════════════════════

function handleSaveLabs(data) {
  try {
    if (!data.patientId || !data.labData) {
      return createJsonResponse({
        error: 'Missing required fields: patientId and labData'
      }, 400);
    }

    Logger.log('Saving labs for patient: ' + data.patientId);

    var folder = getOrCreatePatientFolder(data.patientId, data.patientName);
    var filename = 'labs_' + data.patientId + '_' + Date.now() + '.json';
    var content = JSON.stringify({
      patientId: data.patientId,
      patientName: data.patientName,
      labData: data.labData,
      savedAt: new Date().toISOString()
    }, null, 2);

    var file = folder.createFile(filename, content, MimeType.PLAIN_TEXT);

    Logger.log('Labs saved successfully: ' + filename);

    return createJsonResponse({
      success: true,
      filename: filename,
      fileId: file.getId(),
      count: data.labData.length
    });

  } catch (error) {
    Logger.log('Save Labs Error: ' + error.toString());
    return createJsonResponse({
      error: 'Failed to save labs: ' + error.toString()
    }, 500);
  }
}

function handleLoadLabs(data) {
  try {
    if (!data.patientId) {
      return createJsonResponse({ error: 'Missing patientId' }, 400);
    }

    Logger.log('Loading labs for patient: ' + data.patientId);

    var folder = getPatientFolder(data.patientId);
    if (!folder) {
      return createJsonResponse({
        success: true,
        labData: [],
        message: 'No labs found for this patient'
      });
    }

    var files = folder.getFilesByType(MimeType.PLAIN_TEXT);
    var latestFile = null;
    var latestTime = 0;

    while (files.hasNext()) {
      var file = files.next();
      if (file.getName().indexOf('labs_') === 0) {
        var fileTime = file.getDateCreated().getTime();
        if (fileTime > latestTime) {
          latestFile = file;
          latestTime = fileTime;
        }
      }
    }

    if (!latestFile) {
      return createJsonResponse({
        success: true,
        labData: [],
        message: 'No lab files found'
      });
    }

    var content = JSON.parse(latestFile.getBlob().getDataAsString());

    Logger.log('Labs loaded - Count: ' + content.labData.length);

    return createJsonResponse({
      success: true,
      labData: content.labData,
      savedAt: content.savedAt,
      count: content.labData.length
    });

  } catch (error) {
    Logger.log('Load Labs Error: ' + error.toString());
    return createJsonResponse({
      error: 'Failed to load labs: ' + error.toString()
    }, 500);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SHEETS SYNC HANDLER (Legacy - for manual sync)
// ═══════════════════════════════════════════════════════════════════════════

function handleSyncSheet(data) {
  try {
    if (!data.patients) {
      return createJsonResponse({ error: 'Missing patients data' }, 400);
    }

    if (!CONFIG.spreadsheetId) {
      return createJsonResponse({
        error: 'Spreadsheet not configured',
        help: 'Add SPREADSHEET_ID to Script Properties'
      }, 500);
    }

    Logger.log('Manual sync: ' + data.patients.length + ' patients to sheet');

    var ss = SpreadsheetApp.openById(CONFIG.spreadsheetId);
    var sheet = ss.getSheetByName('Patients');

    if (!sheet) {
      sheet = ss.insertSheet('Patients');
    }

    var headers = ['Ward', 'Bed', 'Name', 'MRN', 'Doctor', 'Diagnosis', 'Plan', 'Status', 'Last Updated'];

    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
    }

    if (sheet.getLastRow() > 1) {
      sheet.getRange(2, 1, sheet.getLastRow() - 1, headers.length).clear();
    }

    var rows = data.patients.map(function(p) {
      return [
        p.ward || '',
        p.bed || '',
        p.name || '',
        p.mrn || '',
        p.doctor || '',
        p.diagnosis || '',
        p.plan || '',
        p.status || '',
        new Date().toLocaleString()
      ];
    });

    if (rows.length > 0) {
      sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
    }

    Logger.log('Manual sheet sync completed');

    return createJsonResponse({
      success: true,
      synced: rows.length,
      sheetId: CONFIG.spreadsheetId
    });

  } catch (error) {
    Logger.log('Sheet Sync Error: ' + error.toString());
    return createJsonResponse({
      error: 'Failed to sync sheet: ' + error.toString()
    }, 500);
  }
}

/**
 * Handle save patient request - Save or create patient in Google Drive
 */
function handleSavePatient(data) {
  try {
    var patient = data.patient;

    if (!patient || !patient.id) {
      throw new Error('Missing required fields: patient with id');
    }

    Logger.log('Saving patient: ' + patient.id);

    var patientsFile = getOrCreatePatientsFile();
    var patients = loadPatientsFromFile(patientsFile);

    // Add or update patient
    patients[patient.id] = patient;

    // Save back to file
    savePatientsToFile(patientsFile, patients);

    Logger.log('Patient saved successfully');

    return createJsonResponse({
      success: true,
      patientId: patient.id,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    Logger.log('Save Patient Error: ' + error.toString());
    return createJsonResponse({
      error: 'Failed to save patient: ' + error.toString()
    }, 500);
  }
}

/**
 * Handle update patient request - Update existing patient
 */
function handleUpdatePatient(data) {
  try {
    var patientId = data.patientId;
    var updates = data.updates;

    if (!patientId || !updates) {
      throw new Error('Missing required fields: patientId, updates');
    }

    Logger.log('Updating patient: ' + patientId);

    var patientsFile = getOrCreatePatientsFile();
    var patients = loadPatientsFromFile(patientsFile);

    if (!patients[patientId]) {
      throw new Error('Patient not found: ' + patientId);
    }

    // Update patient
    for (var key in updates) {
      patients[patientId][key] = updates[key];
    }

    // Save back to file
    savePatientsToFile(patientsFile, patients);

    Logger.log('Patient updated successfully');

    return createJsonResponse({
      success: true,
      patientId: patientId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    Logger.log('Update Patient Error: ' + error.toString());
    return createJsonResponse({
      error: 'Failed to update patient: ' + error.toString()
    }, 500);
  }
}

/**
 * Handle delete patient request - Delete patient from Google Drive
 */
function handleDeletePatient(data) {
  try {
    var patientId = data.patientId;

    if (!patientId) {
      throw new Error('Missing required field: patientId');
    }

    Logger.log('Deleting patient: ' + patientId);

    var patientsFile = getOrCreatePatientsFile();
    var patients = loadPatientsFromFile(patientsFile);

    if (!patients[patientId]) {
      throw new Error('Patient not found: ' + patientId);
    }

    // Delete patient
    delete patients[patientId];

    // Save back to file
    savePatientsToFile(patientsFile, patients);

    Logger.log('Patient deleted successfully');

    return createJsonResponse({
      success: true,
      patientId: patientId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    Logger.log('Delete Patient Error: ' + error.toString());
    return createJsonResponse({
      error: 'Failed to delete patient: ' + error.toString()
    }, 500);
  }
}

/**
 * Handle load patients request - Load all patients from Google Drive
 */
function handleLoadPatients(data) {
  try {
    Logger.log('Loading all patients');

    var patientsFile = getOrCreatePatientsFile();
    var patients = loadPatientsFromFile(patientsFile);

    var count = Object.keys(patients).length;
    Logger.log('Patients loaded successfully - Count: ' + count);

    return createJsonResponse({
      success: true,
      patients: patients,
      count: count,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    Logger.log('Load Patients Error: ' + error.toString());
    return createJsonResponse({
      error: 'Failed to load patients: ' + error.toString()
    }, 500);
  }
}

/**
 * Handle save notice request - Save notice message to Google Drive
 */
function handleSaveNotice(data) {
  try {
    var notice = data.notice;

    if (!notice) {
      throw new Error('Missing required field: notice');
    }

    Logger.log('Saving notice');

    var noticeFile = getOrCreateNoticeFile();

    // Save notice data
    var noticeData = {
      text: notice.text || '',
      updatedAt: notice.updatedAt || Date.now()
    };

    noticeFile.setContent(JSON.stringify(noticeData));

    Logger.log('Notice saved successfully');

    return createJsonResponse({
      success: true,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    Logger.log('Save Notice Error: ' + error.toString());
    return createJsonResponse({
      error: 'Failed to save notice: ' + error.toString()
    }, 500);
  }
}

/**
 * Handle load notice request - Load notice message from Google Drive
 */
function handleLoadNotice(data) {
  try {
    Logger.log('Loading notice');

    var noticeFile = getOrCreateNoticeFile();
    var content = noticeFile.getBlob().getDataAsString();
    var notice = content ? JSON.parse(content) : { text: '' };

    Logger.log('Notice loaded successfully');

    return createJsonResponse({
      success: true,
      notice: notice,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    Logger.log('Load Notice Error: ' + error.toString());
    return createJsonResponse({
      error: 'Failed to load notice: ' + error.toString()
    }, 500);
  }
}

/**
 * Handle save audit log request - Append to audit log in Google Drive
 */
function handleSaveAuditLog(data) {
  try {
    var logEntry = data.logEntry;

    if (!logEntry) {
      throw new Error('Missing required field: logEntry');
    }

    Logger.log('Saving audit log entry');

    var auditFile = getOrCreateAuditLogFile();
    var logs = loadAuditLogsFromFile(auditFile);

    // Add new log entry
    logEntry.timestamp = logEntry.timestamp || Date.now();
    logs.push(logEntry);

    // Save back to file
    saveAuditLogsToFile(auditFile, logs);

    Logger.log('Audit log saved successfully');

    return createJsonResponse({
      success: true,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    Logger.log('Save Audit Log Error: ' + error.toString());
    return createJsonResponse({
      error: 'Failed to save audit log: ' + error.toString()
    }, 500);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// GOOGLE DRIVE HELPERS
// ═══════════════════════════════════════════════════════════════════════════

function getOrCreatePatientFolder(patientId, patientName) {
  var root = CONFIG.driveFolderId === 'root' ?
    DriveApp.getRootFolder() :
    DriveApp.getFolderById(CONFIG.driveFolderId);

  var mainFolders = root.getFoldersByName('Unit E Ward Rounds');
  var mainFolder = mainFolders.hasNext() ?
    mainFolders.next() :
    root.createFolder('Unit E Ward Rounds');

  var safeName = (patientName || 'Unknown').replace(/[^a-zA-Z0-9]/g, '_');
  var patientFolderName = 'Patient_' + patientId + '_' + safeName;
  var patientFolders = mainFolder.getFoldersByName(patientFolderName);

  return patientFolders.hasNext() ?
    patientFolders.next() :
    mainFolder.createFolder(patientFolderName);
}

function getPatientFolder(patientId) {
  var root = CONFIG.driveFolderId === 'root' ?
    DriveApp.getRootFolder() :
    DriveApp.getFolderById(CONFIG.driveFolderId);

  var mainFolders = root.getFoldersByName('Unit E Ward Rounds');
  if (!mainFolders.hasNext()) return null;

  var folders = mainFolders.next().getFolders();
  while (folders.hasNext()) {
    var f = folders.next();
    if (f.getName().indexOf('Patient_' + patientId + '_') === 0) {
      return f;
    }
  }

  return null;
}

/**
 * Get or create patients database file
 */
function getOrCreatePatientsFile() {
  var rootFolder = CONFIG.driveFolderId === 'root'
    ? DriveApp.getRootFolder()
    : DriveApp.getFolderById(CONFIG.driveFolderId);

  var fileName = 'patients_database.json';
  var files = rootFolder.getFilesByName(fileName);

  if (files.hasNext()) {
    return files.next();
  } else {
    // Create new file with empty object
    return rootFolder.createFile(fileName, JSON.stringify({}), MimeType.PLAIN_TEXT);
  }
}

/**
 * Load patients from file
 */
function loadPatientsFromFile(file) {
  try {
    var content = file.getBlob().getDataAsString();
    return content ? JSON.parse(content) : {};
  } catch (e) {
    Logger.log('Error loading patients: ' + e.toString());
    return {};
  }
}

/**
 * Save patients to file
 */
function savePatientsToFile(file, patients) {
  file.setContent(JSON.stringify(patients));
}

/**
 * Get or create notice file
 */
function getOrCreateNoticeFile() {
  var rootFolder = CONFIG.driveFolderId === 'root'
    ? DriveApp.getRootFolder()
    : DriveApp.getFolderById(CONFIG.driveFolderId);

  var fileName = 'notice.json';
  var files = rootFolder.getFilesByName(fileName);

  if (files.hasNext()) {
    return files.next();
  } else {
    // Create new file with empty notice
    return rootFolder.createFile(fileName, JSON.stringify({ text: '' }), MimeType.PLAIN_TEXT);
  }
}

/**
 * Get or create audit log file
 */
function getOrCreateAuditLogFile() {
  var rootFolder = CONFIG.driveFolderId === 'root'
    ? DriveApp.getRootFolder()
    : DriveApp.getFolderById(CONFIG.driveFolderId);

  var fileName = 'audit_log.json';
  var files = rootFolder.getFilesByName(fileName);

  if (files.hasNext()) {
    return files.next();
  } else {
    // Create new file with empty array
    return rootFolder.createFile(fileName, JSON.stringify([]), MimeType.PLAIN_TEXT);
  }
}

/**
 * Load audit logs from file
 */
function loadAuditLogsFromFile(file) {
  try {
    var content = file.getBlob().getDataAsString();
    return content ? JSON.parse(content) : [];
  } catch (e) {
    Logger.log('Error loading audit logs: ' + e.toString());
    return [];
  }
}

/**
 * Save audit logs to file
 */
function saveAuditLogsToFile(file, logs) {
  // Keep only last 1000 entries to prevent file from growing too large
  var limitedLogs = logs.slice(-1000);
  file.setContent(JSON.stringify(limitedLogs));
}

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function createJsonResponse(data, statusCode) {
  statusCode = statusCode || 200;
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Test function - Run this from Apps Script editor to verify configuration
 */
function testConfiguration() {
  Logger.log('=== Configuration Test ===');
  Logger.log('Version: ' + SCRIPT_VERSION);
  Logger.log('Vision API Key: ' + (CONFIG.visionApiKey ? '✓ Configured (' + CONFIG.visionApiKey.substring(0, 10) + '...)' : '✗ NOT CONFIGURED'));
  Logger.log('Anthropic API Key: ' + (CONFIG.anthropicApiKey ? '✓ Configured (' + CONFIG.anthropicApiKey.substring(0, 15) + '...)' : '✗ NOT CONFIGURED'));
  Logger.log('Spreadsheet ID: ' + (CONFIG.spreadsheetId ? '✓ Configured' : '✗ NOT CONFIGURED'));
  Logger.log('Drive Folder: ' + CONFIG.driveFolderId);
  Logger.log('Firebase URL: ' + CONFIG.firebaseUrl);
  Logger.log('Claude Model: ' + CLAUDE_MODELS.SONNET);
  Logger.log('Sync: ENABLED (bidirectional)');
  Logger.log('=== Test Complete ===');
}
