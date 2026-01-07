/**
 * ═══════════════════════════════════════════════════════════════════════════
 * UNIT E WARD ROUNDS - GOOGLE APPS SCRIPT BACKEND v2.1
 *
 * Fixed Issues:
 * - Correct Claude model names
 * - Enhanced error logging
 * - Better API key validation
 * - Improved error messages
 * ═══════════════════════════════════════════════════════════════════════════
 */

const SCRIPT_VERSION = '2.1.0';

// Get configuration from Script Properties
const CONFIG = {
  visionApiKey: PropertiesService.getScriptProperties().getProperty('VISION_API_KEY') || '',
  anthropicApiKey: PropertiesService.getScriptProperties().getProperty('ANTHROPIC_API_KEY') || '',
  spreadsheetId: PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID') || '',
  driveFolderId: PropertiesService.getScriptProperties().getProperty('DRIVE_FOLDER_ID') || 'root'
};

// Valid Claude models (as of January 2025)
const CLAUDE_MODELS = {
  SONNET: 'claude-3-5-sonnet-20241022',  // Best balance of intelligence and speed
  OPUS: 'claude-3-opus-20240229',        // Most capable (if available)
  HAIKU: 'claude-3-5-haiku-20241022'     // Fastest
};

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
          drive: true
        },
        models: {
          claude: CLAUDE_MODELS.SONNET,
          vision: 'google-vision-v1'
        }
      });
    }

    // Info page
    var hasVision = !!CONFIG.visionApiKey;
    var hasClaude = !!CONFIG.anthropicApiKey;
    var hasSheets = !!CONFIG.spreadsheetId;

    var html = '<html><head><style>' +
      'body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }' +
      'h1 { color: #15803d; }' +
      '.status { background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0; }' +
      '.good { color: #15803d; }' +
      '.bad { color: #dc2626; }' +
      '.code { background: #e5e7eb; padding: 2px 6px; border-radius: 4px; font-family: monospace; }' +
      '</style></head><body>' +
      '<h1>🏥 Unit E Ward Rounds API v' + SCRIPT_VERSION + '</h1>' +
      '<div class="status">' +
      '<h2>Service Status</h2>' +
      '<p><strong>Vision API:</strong> <span class="' + (hasVision ? 'good">✓ Configured' : 'bad">✗ NOT CONFIGURED') + '</span></p>' +
      '<p><strong>Claude AI:</strong> <span class="' + (hasClaude ? 'good">✓ Configured' : 'bad">✗ NOT CONFIGURED') + '</span></p>' +
      '<p><strong>Google Sheets:</strong> <span class="' + (hasSheets ? 'good">✓ Configured' : 'bad">✗ NOT CONFIGURED') + '</span></p>' +
      '<p><strong>Google Drive:</strong> <span class="good">✓ Available</span></p>' +
      '</div>';

    if (!hasVision || !hasClaude) {
      html += '<div style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">' +
        '<h3>⚠️ Configuration Required</h3>' +
        '<p>To enable OCR and AI features, you must configure API keys:</p>' +
        '<ol>' +
        '<li>Go to Apps Script Project Settings (gear icon)</li>' +
        '<li>Scroll to <strong>Script Properties</strong></li>' +
        '<li>Add the following properties:</li>' +
        '</ol>' +
        '<ul>';

      if (!hasVision) {
        html += '<li><span class="code">VISION_API_KEY</span> - Get from <a href="https://console.cloud.google.com/apis/credentials" target="_blank">Google Cloud Console</a></li>';
      }
      if (!hasClaude) {
        html += '<li><span class="code">ANTHROPIC_API_KEY</span> - Get from <a href="https://console.anthropic.com/" target="_blank">Anthropic Console</a></li>';
      }

      html += '</ul>' +
        '<p><strong>Important:</strong> After adding keys, redeploy this script as a Web App.</p>' +
        '</div>';
    }

    html += '<h2>📚 API Endpoints</h2>' +
      '<ul>' +
      '<li><strong>POST /exec</strong> - Main API (actions: runOCR, claudeVision, claudeConsult, saveLabs, loadLabs, syncSheet, test)</li>' +
      '<li><strong>GET /exec?action=health</strong> - Health check (JSON)</li>' +
      '<li><strong>GET /exec</strong> - This info page</li>' +
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
      case 'test':
        return createJsonResponse({
          success: true,
          message: 'API is working!',
          version: SCRIPT_VERSION,
          timestamp: new Date().toISOString()
        });
      default:
        return createJsonResponse({
          error: 'Unknown action: ' + action,
          validActions: ['runOCR', 'claudeVision', 'claudeConsult', 'saveLabs', 'loadLabs', 'syncSheet', 'test']
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

      // Parse error for better message
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

    // Extract text from response
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
// CLAUDE VISION HANDLER - AI-powered OCR
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

    // Extract base64 data
    var imageData = data.image;
    if (imageData.indexOf(',') !== -1) {
      imageData = imageData.split(',')[1];
    }

    // Determine media type
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
      model: CLAUDE_MODELS.SONNET,  // Use correct Claude model
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

    // Parse JSON from Claude's response
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
// CLAUDE CONSULT HANDLER - Medical AI Consultation
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

    // Build comprehensive prompt
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
// SHEETS SYNC HANDLER
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

    Logger.log('Syncing ' + data.patients.length + ' patients to sheet');

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

    Logger.log('Sheet sync completed');

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
  Logger.log('Claude Model: ' + CLAUDE_MODELS.SONNET);
  Logger.log('=== Test Complete ===');
}
