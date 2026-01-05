/**
 * ═══════════════════════════════════════════════════════════════════════════
 * UNIT E WARD ROUNDS - GOOGLE APPS SCRIPT BACKEND v2.0
 *
 * 🏥 Complete backend for Unit E Ward Rounds application
 *
 * Features:
 * ✅ Google Cloud Vision API integration (OCR for lab images)
 * ✅ Lab storage to Google Drive (patient-specific folders)
 * ✅ Google Sheets sync functionality (optional)
 * ✅ Comprehensive error handling and logging
 * ✅ Health check endpoint
 *
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * SETUP INSTRUCTIONS:
 *
 * 1. Configure Script Properties (⚙️ Project Settings → Script Properties):
 *    - VISION_API_KEY: Your Google Cloud Vision API key (REQUIRED)
 *    - DRIVE_FOLDER_ID: Google Drive folder ID (REQUIRED - use "root" for root folder)
 *    - SPREADSHEET_ID: Google Sheets ID for patient data (OPTIONAL)
 *
 * 2. Deploy as Web App:
 *    - Deploy → New deployment
 *    - Type: Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 *
 * 3. Copy the Web App URL to your config.js file
 *
 * 4. Test using: YOUR_URL?action=health
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════

const SCRIPT_VERSION = '2.0.0';

// Get configuration from Script Properties (secure storage)
const CONFIG = {
  visionApiKey: PropertiesService.getScriptProperties().getProperty('VISION_API_KEY'),
  spreadsheetId: PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID'),
  driveFolderId: PropertiesService.getScriptProperties().getProperty('DRIVE_FOLDER_ID') || 'root'
};

// ═══════════════════════════════════════════════════════════════════════
// MAIN HANDLERS
// ═══════════════════════════════════════════════════════════════════════

/**
 * Handle GET requests - Health check and info
 */
function doGet(e) {
  try {
    const action = e.parameter.action || 'info';

    // Health check endpoint
    if (action === 'health') {
      return createJsonResponse({
        status: 'healthy',
        version: SCRIPT_VERSION,
        timestamp: new Date().toISOString(),
        services: {
          vision: !!CONFIG.visionApiKey,
          drive: !!CONFIG.driveFolderId,
          sheets: !!CONFIG.spreadsheetId
        },
        config: {
          hasVisionKey: !!CONFIG.visionApiKey,
          hasSpreadsheet: !!CONFIG.spreadsheetId,
          driveFolder: CONFIG.driveFolderId
        }
      });
    }

    // Default info page
    return createHtmlResponse(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Unit E Ward Rounds API</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
              max-width: 900px;
              margin: 50px auto;
              padding: 30px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
            }
            .container {
              background: rgba(255, 255, 255, 0.1);
              backdrop-filter: blur(10px);
              padding: 40px;
              border-radius: 20px;
              box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            }
            h1 {
              margin-top: 0;
              font-size: 2.5em;
              text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
            }
            .status {
              background: rgba(16, 185, 129, 0.3);
              border: 2px solid #10b981;
              padding: 20px;
              border-radius: 12px;
              margin: 20px 0;
              font-weight: bold;
            }
            .endpoint {
              background: rgba(255, 255, 255, 0.15);
              padding: 15px;
              margin: 15px 0;
              border-left: 4px solid #10b981;
              border-radius: 8px;
            }
            code {
              background: rgba(0, 0, 0, 0.3);
              padding: 4px 8px;
              border-radius: 6px;
              font-family: 'Courier New', monospace;
            }
            .feature {
              display: inline-block;
              margin: 5px;
              padding: 8px 15px;
              background: rgba(255, 255, 255, 0.2);
              border-radius: 20px;
              font-size: 0.9em;
            }
            .warning {
              background: rgba(245, 158, 11, 0.3);
              border: 2px solid #f59e0b;
              padding: 15px;
              border-radius: 8px;
              margin: 20px 0;
            }
            ul { line-height: 1.8; }
            a { color: #10b981; text-decoration: none; font-weight: bold; }
            a:hover { text-decoration: underline; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🏥 Unit E Ward Rounds API</h1>

            <div class="status">
              ✅ Status: <strong>Active</strong><br>
              📦 Version: <strong>${SCRIPT_VERSION}</strong><br>
              🕐 Server Time: <strong>${new Date().toLocaleString()}</strong>
            </div>

            <h2>🚀 Features</h2>
            <div>
              <span class="feature">🔍 OCR Processing</span>
              <span class="feature">☁️ Google Cloud Vision</span>
              <span class="feature">💾 Google Drive Storage</span>
              <span class="feature">📊 Sheets Integration</span>
              <span class="feature">🔒 Secure</span>
            </div>

            <h2>📋 API Endpoints</h2>

            <div class="endpoint">
              <strong>POST /exec</strong> - Main API endpoint<br>
              <code>action: runOCR</code> - Process image with OCR<br>
              <code>action: saveLabs</code> - Save labs to Google Drive<br>
              <code>action: loadLabs</code> - Load patient labs from Drive<br>
              <code>action: syncSheet</code> - Sync patient data to Sheets
            </div>

            <div class="endpoint">
              <strong>GET /exec?action=health</strong> - Health check<br>
              Returns JSON with system status and configuration
            </div>

            <h2>⚙️ Configuration Status</h2>
            <ul>
              <li>Vision API: <strong style="color: ${CONFIG.visionApiKey ? '#10b981' : '#ef4444'}">${CONFIG.visionApiKey ? '✓ Configured' : '✗ NOT CONFIGURED'}</strong></li>
              <li>Google Drive: <strong style="color: ${CONFIG.driveFolderId ? '#10b981' : '#ef4444'}">${CONFIG.driveFolderId ? '✓ Configured (' + CONFIG.driveFolderId + ')' : '✗ NOT CONFIGURED'}</strong></li>
              <li>Google Sheets: <strong style="color: ${CONFIG.spreadsheetId ? '#10b981' : '#94a3b8'}">${CONFIG.spreadsheetId ? '✓ Configured' : '○ Optional (not set)'}</strong></li>
            </ul>

            ${!CONFIG.visionApiKey ? `
            <div class="warning">
              <strong>⚠️ Setup Required</strong><br>
              Configure Script Properties to enable all features:<br>
              <ul>
                <li><code>VISION_API_KEY</code> - For OCR functionality (REQUIRED)</li>
                <li><code>DRIVE_FOLDER_ID</code> - For lab storage (REQUIRED)</li>
                <li><code>SPREADSHEET_ID</code> - For patient data sync (Optional)</li>
              </ul>
              <a href="https://github.com/balhaddad-sys/unit-e/blob/main/GOOGLE_APPS_SCRIPT_SETUP.md" target="_blank">
                → View Setup Guide
              </a>
            </div>
            ` : ''}

            <h2>🧪 Test Endpoint</h2>
            <p>Test the API by visiting:</p>
            <code style="display: block; padding: 15px; background: rgba(0,0,0,0.3); border-radius: 8px;">
              ${ScriptApp.getService().getUrl()}?action=health
            </code>

            <h2>📚 Documentation</h2>
            <p>
              <a href="https://github.com/balhaddad-sys/unit-e" target="_blank">GitHub Repository</a> •
              <a href="https://github.com/balhaddad-sys/unit-e/blob/main/GOOGLE_APPS_SCRIPT_SETUP.md" target="_blank">Setup Guide</a>
            </p>
          </div>
        </body>
      </html>
    `);

  } catch (error) {
    Logger.log('doGet Error: ' + error.toString());
    return createJsonResponse({ error: error.toString() }, 500);
  }
}

/**
 * Handle POST requests - Main API
 */
function doPost(e) {
  try {
    // Parse request body
    const requestData = JSON.parse(e.postData.contents);
    const action = requestData.action;

    Logger.log('[API] Received POST request - Action: ' + action);

    // Route to appropriate handler
    switch (action) {
      case 'runOCR':
        return handleRunOCR(requestData);

      case 'saveLabs':
        return handleSaveLabs(requestData);

      case 'loadLabs':
        return handleLoadLabs(requestData);

      case 'syncSheet':
        return handleSyncSheet(requestData);

      case 'test':
        return createJsonResponse({
          success: true,
          message: 'API is working perfectly',
          version: SCRIPT_VERSION,
          timestamp: new Date().toISOString(),
          echo: requestData
        });

      default:
        return createJsonResponse({
          error: 'Unknown action: ' + action,
          validActions: ['runOCR', 'saveLabs', 'loadLabs', 'syncSheet', 'test']
        }, 400);
    }

  } catch (error) {
    Logger.log('[API] doPost Error: ' + error.toString());
    Logger.log('[API] Stack: ' + error.stack);
    return createJsonResponse({
      error: 'Request processing failed: ' + error.toString(),
      stack: error.stack
    }, 500);
  }
}

// ═══════════════════════════════════════════════════════════════════════
// ACTION HANDLERS
// ═══════════════════════════════════════════════════════════════════════

/**
 * Handle OCR request using Google Cloud Vision API
 */
function handleRunOCR(requestData) {
  try {
    if (!requestData.image) {
      throw new Error('No image data provided');
    }

    if (!CONFIG.visionApiKey) {
      throw new Error('VISION_API_KEY not configured in Script Properties');
    }

    Logger.log('[OCR] Processing OCR request...');

    // Extract base64 image data (remove data URL prefix if present)
    let imageData = requestData.image;
    if (imageData.includes('base64,')) {
      imageData = imageData.split('base64,')[1];
    }

    // Call Google Cloud Vision API
    const ocrResult = callVisionAPI(imageData);

    Logger.log('[OCR] ✓ SUCCESS - Text length: ' + ocrResult.text.length);

    return createJsonResponse({
      success: true,
      text: ocrResult.text,
      confidence: ocrResult.confidence,
      source: 'google_vision',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    Logger.log('[OCR] ✗ ERROR: ' + error.toString());
    return createJsonResponse({
      error: 'OCR failed: ' + error.toString(),
      hint: !CONFIG.visionApiKey ? 'Configure VISION_API_KEY in Script Properties' : null
    }, 500);
  }
}

/**
 * Handle save labs request - Store to Google Drive
 */
function handleSaveLabs(requestData) {
  try {
    const patientId = requestData.patientId;
    const patientName = requestData.patientName;
    const labData = requestData.labData;

    if (!patientId || !labData) {
      throw new Error('Missing required fields: patientId and labData are required');
    }

    Logger.log('[SaveLabs] Saving labs for patient: ' + patientId + ' (' + patientName + ')');
    Logger.log('[SaveLabs] Lab count: ' + (Array.isArray(labData) ? labData.length : 'N/A'));

    // Get or create patient folder
    const patientFolder = getOrCreatePatientFolder(patientId, patientName);

    // Create lab data file with timestamp
    const timestamp = new Date().getTime();
    const filename = 'labs_' + patientId + '_' + timestamp + '.json';

    const fileContent = JSON.stringify({
      patientId: patientId,
      patientName: patientName,
      labData: labData,
      savedAt: new Date().toISOString(),
      version: SCRIPT_VERSION
    }, null, 2);

    // Save to Drive
    const file = patientFolder.createFile(filename, fileContent, MimeType.PLAIN_TEXT);

    Logger.log('[SaveLabs] ✓ SUCCESS - File: ' + filename);

    return createJsonResponse({
      success: true,
      message: 'Labs saved successfully',
      filename: filename,
      fileId: file.getId(),
      fileUrl: file.getUrl(),
      folderId: patientFolder.getId(),
      folderUrl: patientFolder.getUrl(),
      count: Array.isArray(labData) ? labData.length : 0,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    Logger.log('[SaveLabs] ✗ ERROR: ' + error.toString());
    return createJsonResponse({
      error: 'Failed to save labs: ' + error.toString()
    }, 500);
  }
}

/**
 * Handle load labs request - Load from Google Drive
 */
function handleLoadLabs(requestData) {
  try {
    const patientId = requestData.patientId;

    if (!patientId) {
      throw new Error('Missing required field: patientId');
    }

    Logger.log('[LoadLabs] Loading labs for patient: ' + patientId);

    // Get patient folder
    const patientFolder = getPatientFolder(patientId);

    if (!patientFolder) {
      Logger.log('[LoadLabs] No folder found for patient: ' + patientId);
      return createJsonResponse({
        success: true,
        labData: [],
        message: 'No labs found for this patient'
      });
    }

    // Get all lab files
    const files = patientFolder.getFilesByType(MimeType.PLAIN_TEXT);
    const labFiles = [];

    while (files.hasNext()) {
      const file = files.next();
      if (file.getName().startsWith('labs_')) {
        labFiles.push(file);
      }
    }

    // Sort by date (newest first)
    labFiles.sort(function(a, b) {
      return b.getDateCreated().getTime() - a.getDateCreated().getTime();
    });

    // Get the most recent file
    if (labFiles.length === 0) {
      return createJsonResponse({
        success: true,
        labData: [],
        message: 'No lab files found'
      });
    }

    const latestFile = labFiles[0];
    const fileContent = latestFile.getBlob().getDataAsString();
    const labsObject = JSON.parse(fileContent);

    Logger.log('[LoadLabs] ✓ SUCCESS - Count: ' + (labsObject.labData ? labsObject.labData.length : 0));

    return createJsonResponse({
      success: true,
      labData: labsObject.labData || [],
      loadedFrom: latestFile.getName(),
      savedAt: labsObject.savedAt,
      count: labsObject.labData ? labsObject.labData.length : 0,
      totalFiles: labFiles.length
    });

  } catch (error) {
    Logger.log('[LoadLabs] ✗ ERROR: ' + error.toString());
    return createJsonResponse({
      error: 'Failed to load labs: ' + error.toString()
    }, 500);
  }
}

/**
 * Handle sheet sync request - Update Google Sheets
 */
function handleSyncSheet(requestData) {
  try {
    const patients = requestData.patients;

    if (!patients || !Array.isArray(patients)) {
      throw new Error('Missing or invalid patients data (must be array)');
    }

    if (!CONFIG.spreadsheetId) {
      throw new Error('SPREADSHEET_ID not configured in Script Properties');
    }

    Logger.log('[SyncSheet] Syncing ' + patients.length + ' patients to sheet');

    const spreadsheet = SpreadsheetApp.openById(CONFIG.spreadsheetId);
    let sheet = spreadsheet.getSheetByName('Patients');

    // Create sheet if it doesn't exist
    if (!sheet) {
      sheet = spreadsheet.insertSheet('Patients');
      // Add headers
      sheet.getRange(1, 1, 1, 9).setValues([[
        'Ward', 'Bed', 'Name', 'MRN', 'Doctor', 'Diagnosis', 'Plan', 'Status', 'Last Updated'
      ]]);
      sheet.getRange(1, 1, 1, 9).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }

    // Clear existing data (keep headers)
    if (sheet.getLastRow() > 1) {
      sheet.getRange(2, 1, sheet.getLastRow() - 1, 9).clear();
    }

    // Prepare data rows
    const rows = patients.map(function(p) {
      return [
        p.ward || '',
        p.bed || '',
        p.name || '',
        p.mrn || '',
        p.doctor || '',
        p.diagnosis || '',
        p.plan || '',
        p.status || '',
        new Date(p.timestamp || Date.now()).toLocaleString()
      ];
    });

    // Write to sheet
    if (rows.length > 0) {
      sheet.getRange(2, 1, rows.length, 9).setValues(rows);
    }

    // Auto-resize columns
    sheet.autoResizeColumns(1, 9);

    Logger.log('[SyncSheet] ✓ SUCCESS - Synced ' + rows.length + ' patients');

    return createJsonResponse({
      success: true,
      message: 'Sheet synced successfully',
      patientsSync: patients.length,
      sheetId: CONFIG.spreadsheetId,
      sheetName: 'Patients',
      sheetUrl: spreadsheet.getUrl(),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    Logger.log('[SyncSheet] ✗ ERROR: ' + error.toString());
    return createJsonResponse({
      error: 'Failed to sync sheet: ' + error.toString(),
      hint: !CONFIG.spreadsheetId ? 'Configure SPREADSHEET_ID in Script Properties' : null
    }, 500);
  }
}

// ═══════════════════════════════════════════════════════════════════════
// GOOGLE CLOUD VISION API INTEGRATION
// ═══════════════════════════════════════════════════════════════════════

/**
 * Call Google Cloud Vision API for OCR
 */
function callVisionAPI(imageBase64) {
  const url = 'https://vision.googleapis.com/v1/images:annotate?key=' + CONFIG.visionApiKey;

  const payload = {
    requests: [{
      image: {
        content: imageBase64
      },
      features: [{
        type: 'DOCUMENT_TEXT_DETECTION',  // Best for documents
        maxResults: 1
      }]
    }]
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(url, options);
  const responseCode = response.getResponseCode();
  const responseText = response.getContentText();

  if (responseCode !== 200) {
    throw new Error('Vision API error (' + responseCode + '): ' + responseText);
  }

  const result = JSON.parse(responseText);

  // Check for API errors
  if (result.error) {
    throw new Error('Vision API error: ' + result.error.message);
  }

  // Extract text from response
  if (result.responses && result.responses[0]) {
    const response = result.responses[0];

    // Check for errors in response
    if (response.error) {
      throw new Error('Vision API error: ' + response.error.message);
    }

    const annotations = response.textAnnotations;
    if (annotations && annotations.length > 0) {
      // First annotation contains full text
      const text = annotations[0].description || '';
      const confidence = annotations[0].confidence || 0.85;

      return {
        text: text,
        confidence: Math.round(confidence * 100)
      };
    }
  }

  // No text detected
  return {
    text: '',
    confidence: 0
  };
}

// ═══════════════════════════════════════════════════════════════════════
// GOOGLE DRIVE HELPERS
// ═══════════════════════════════════════════════════════════════════════

/**
 * Get or create patient folder in Drive
 */
function getOrCreatePatientFolder(patientId, patientName) {
  // Get root folder
  const rootFolder = CONFIG.driveFolderId === 'root'
    ? DriveApp.getRootFolder()
    : DriveApp.getFolderById(CONFIG.driveFolderId);

  // Check if Unit E folder exists
  const unitEFolderName = 'Unit E Ward Rounds';
  let unitEFolder;

  const unitEFolders = rootFolder.getFoldersByName(unitEFolderName);
  if (unitEFolders.hasNext()) {
    unitEFolder = unitEFolders.next();
  } else {
    unitEFolder = rootFolder.createFolder(unitEFolderName);
    Logger.log('[Drive] Created Unit E folder');
  }

  // Create safe patient folder name
  const safeName = (patientName || 'Unknown').replace(/[^a-zA-Z0-9\s]/g, '_');
  const patientFolderName = 'Patient_' + patientId + '_' + safeName;

  // Check if patient folder exists
  const patientFolders = unitEFolder.getFoldersByName(patientFolderName);

  if (patientFolders.hasNext()) {
    return patientFolders.next();
  } else {
    const newFolder = unitEFolder.createFolder(patientFolderName);
    Logger.log('[Drive] Created patient folder: ' + patientFolderName);
    return newFolder;
  }
}

/**
 * Get patient folder from Drive
 */
function getPatientFolder(patientId) {
  const rootFolder = CONFIG.driveFolderId === 'root'
    ? DriveApp.getRootFolder()
    : DriveApp.getFolderById(CONFIG.driveFolderId);

  const unitEFolders = rootFolder.getFoldersByName('Unit E Ward Rounds');
  if (!unitEFolders.hasNext()) {
    return null;
  }

  const unitEFolder = unitEFolders.next();
  const allFolders = unitEFolder.getFolders();

  while (allFolders.hasNext()) {
    const folder = allFolders.next();
    if (folder.getName().startsWith('Patient_' + patientId + '_')) {
      return folder;
    }
  }

  return null;
}

// ═══════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════

/**
 * Create JSON response
 */
function createJsonResponse(data, statusCode) {
  const output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

/**
 * Create HTML response
 */
function createHtmlResponse(html) {
  return HtmlService.createHtmlOutput(html);
}

/**
 * Test function to verify configuration
 * Run this from Apps Script editor to check setup
 */
function testConfiguration() {
  Logger.log('═══════════════════════════════════════════════════');
  Logger.log('CONFIGURATION TEST');
  Logger.log('═══════════════════════════════════════════════════');
  Logger.log('Version: ' + SCRIPT_VERSION);
  Logger.log('');
  Logger.log('Script Properties:');
  Logger.log('  VISION_API_KEY: ' + (CONFIG.visionApiKey ? '✓ Configured (' + CONFIG.visionApiKey.substring(0, 10) + '...)' : '✗ NOT CONFIGURED'));
  Logger.log('  DRIVE_FOLDER_ID: ' + (CONFIG.driveFolderId ? '✓ Configured (' + CONFIG.driveFolderId + ')' : '✗ NOT CONFIGURED'));
  Logger.log('  SPREADSHEET_ID: ' + (CONFIG.spreadsheetId ? '✓ Configured (' + CONFIG.spreadsheetId.substring(0, 10) + '...)' : '○ Optional (not set)'));
  Logger.log('');

  // Test Drive access
  Logger.log('Testing Drive access...');
  try {
    const folder = CONFIG.driveFolderId === 'root'
      ? DriveApp.getRootFolder()
      : DriveApp.getFolderById(CONFIG.driveFolderId);
    Logger.log('  ✓ Drive access: SUCCESS (' + folder.getName() + ')');
  } catch (e) {
    Logger.log('  ✗ Drive access: FAILED - ' + e.toString());
  }

  // Test Sheets access (if configured)
  if (CONFIG.spreadsheetId) {
    Logger.log('Testing Sheets access...');
    try {
      const spreadsheet = SpreadsheetApp.openById(CONFIG.spreadsheetId);
      Logger.log('  ✓ Sheets access: SUCCESS (' + spreadsheet.getName() + ')');
    } catch (e) {
      Logger.log('  ✗ Sheets access: FAILED - ' + e.toString());
    }
  }

  // Test Vision API (if configured)
  if (CONFIG.visionApiKey) {
    Logger.log('Testing Vision API...');
    Logger.log('  ℹ To test Vision API, upload an image through the web app');
  }

  Logger.log('');
  Logger.log('Web App URL: ' + ScriptApp.getService().getUrl());
  Logger.log('');
  Logger.log('═══════════════════════════════════════════════════');
  Logger.log('TEST COMPLETE');
  Logger.log('═══════════════════════════════════════════════════');
}
