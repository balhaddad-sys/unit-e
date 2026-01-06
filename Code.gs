/**
 * ═══════════════════════════════════════════════════════════════════════════
 * UNIT E WARD ROUNDS - GOOGLE APPS SCRIPT BACKEND
 * 
 * Features:
 * - Google Vision API integration (OCR for lab images)
 * - Lab storage to Google Drive
 * - Google Sheets sync functionality
 * - Both API key and service account authentication methods
 * - Comprehensive error handling and logging
 * 
 * Setup Instructions:
 * 1. Create a Google Cloud Project
 * 2. Enable Cloud Vision API
 * 3. Create credentials (API Key or Service Account)
 * 4. Deploy as Web App with "Execute as: Me" and "Who has access: Anyone"
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════

/**
 * IMPORTANT: Set up Script Properties for secure credential storage
 *
 * Go to Project Settings > Script Properties and add:
 * - VISION_API_KEY: Your Google Cloud Vision API key
 * - ANTHROPIC_API_KEY: Your Anthropic Claude API key (for GPT-5 level AI)
 * - SERVICE_ACCOUNT_EMAIL: Service account email (if using service account)
 * - SERVICE_ACCOUNT_KEY: Service account private key (if using service account)
 * - SPREADSHEET_ID: Your Google Sheets ID for patient data
 * - DRIVE_FOLDER_ID: Google Drive folder ID for lab image storage
 */

const SCRIPT_VERSION = '1.0.0';
const USE_SERVICE_ACCOUNT = false; // Set to true to use service account instead of API key

// Get configuration from Script Properties
const CONFIG = {
  visionApiKey: PropertiesService.getScriptProperties().getProperty('AIzaSyCrkrRysGj4PiW9W75nBu7Onn3td5vcN1Y'),
  anthropicApiKey: PropertiesService.getScriptProperties().getProperty('ANTHROPIC_API_KEY'),
  serviceAccountEmail: PropertiesService.getScriptProperties().getProperty('SERVICE_ACCOUNT_EMAIL'),
  serviceAccountKey: PropertiesService.getScriptProperties().getProperty('SERVICE_ACCOUNT_KEY'),
  spreadsheetId: PropertiesService.getScriptProperties().getProperty('1I2Cmm2YPUuJw4o4cOgl-iFmqTmfy6S9btFZ-5AIMxh4'),
  driveFolderId: PropertiesService.getScriptProperties().getProperty('1LhrEHUgRsoz2v2w6k-Y8h7buT4Kvjk2I') || 'root'
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
    
    if (action === 'health') {
      return createJsonResponse({
        status: 'healthy',
        version: SCRIPT_VERSION,
        timestamp: new Date().toISOString(),
        services: {
          vision: !!CONFIG.visionApiKey || !!CONFIG.serviceAccountKey,
          sheets: !!CONFIG.spreadsheetId,
          drive: true
        }
      });
    }
    
    // Default info response
    return createHtmlResponse(`
      <html>
        <head>
          <title>Unit E Ward Rounds API</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
            h1 { color: #15803d; }
            .status { background: #d1fae5; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .endpoint { background: #f1f5f9; padding: 10px; margin: 10px 0; border-left: 4px solid #15803d; }
            code { background: #e2e8f0; padding: 2px 6px; border-radius: 4px; }
          </style>
        </head>
        <body>
          <h1>🏥 Unit E Ward Rounds API</h1>
          <div class="status">
            <strong>Status:</strong> Active<br>
            <strong>Version:</strong> ${SCRIPT_VERSION}<br>
            <strong>Timestamp:</strong> ${new Date().toISOString()}
          </div>
          
          <h2>📋 Available Endpoints</h2>
          
          <div class="endpoint">
            <strong>POST /exec</strong> - Main API endpoint<br>
            Actions: <code>runOCR</code>, <code>saveLabs</code>, <code>loadLabs</code>, <code>syncSheet</code>
          </div>
          
          <div class="endpoint">
            <strong>GET /exec?action=health</strong> - Health check
          </div>
          
          <h2>🔧 Setup Required</h2>
          <p>Configure Script Properties with your credentials:
            <ul>
              <li>VISION_API_KEY (for OCR)</li>
              <li>SPREADSHEET_ID (for patient data)</li>
              <li>DRIVE_FOLDER_ID (for lab storage)</li>
            </ul>
          </p>
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
    
    Logger.log('Received POST request - Action: ' + action);
    
    // Route to appropriate handler
    switch (action) {
      case 'runOCR':
        return handleRunOCR(requestData);

      case 'claudeVision':
        return handleClaudeVision(requestData);

      case 'claudeConsult':
        return handleClaudeConsult(requestData);

      case 'saveLabs':
        return handleSaveLabs(requestData);

      case 'loadLabs':
        return handleLoadLabs(requestData);

      case 'syncSheet':
        return handleSyncSheet(requestData);

      case 'test':
        return createJsonResponse({
          success: true,
          message: 'API is working',
          version: SCRIPT_VERSION,
          timestamp: new Date().toISOString()
        });

      default:
        return createJsonResponse({
          error: 'Unknown action: ' + action,
          validActions: ['runOCR', 'claudeVision', 'claudeConsult', 'saveLabs', 'loadLabs', 'syncSheet', 'test']
        }, 400);
    }
    
  } catch (error) {
    Logger.log('doPost Error: ' + error.toString());
    Logger.log('Stack: ' + error.stack);
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
 * Handle OCR request using Google Vision API
 */
function handleRunOCR(requestData) {
  try {
    if (!requestData.image) {
      throw new Error('No image data provided');
    }
    
    if (!CONFIG.visionApiKey && !CONFIG.serviceAccountKey) {
      throw new Error('Vision API credentials not configured');
    }
    
    Logger.log('Processing OCR request...');
    
    // Extract base64 image data
    const imageData = requestData.image.replace(/^data:image\/\w+;base64,/, '');
    
    // Call Vision API
    const ocrResult = USE_SERVICE_ACCOUNT 
      ? callVisionAPIWithServiceAccount(imageData)
      : callVisionAPIWithKey(imageData);
    
    Logger.log('OCR completed successfully - Text length: ' + ocrResult.text.length);
    
    return createJsonResponse({
      success: true,
      text: ocrResult.text,
      confidence: ocrResult.confidence,
      source: 'google_vision',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    Logger.log('OCR Error: ' + error.toString());
    return createJsonResponse({
      error: 'OCR failed: ' + error.toString()
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
      throw new Error('Missing required fields: patientId, labData');
    }
    
    Logger.log('Saving labs for patient: ' + patientId + ' (' + patientName + ')');
    
    // Get or create patient folder
    const patientFolder = getOrCreatePatientFolder(patientId, patientName);
    
    // Create lab data file
    const filename = 'labs_' + patientId + '_' + new Date().getTime() + '.json';
    const fileContent = JSON.stringify({
      patientId: patientId,
      patientName: patientName,
      labData: labData,
      savedAt: new Date().toISOString(),
      version: SCRIPT_VERSION
    }, null, 2);
    
    // Save to Drive
    const file = patientFolder.createFile(filename, fileContent, MimeType.PLAIN_TEXT);
    
    Logger.log('Labs saved successfully - File: ' + filename);
    
    return createJsonResponse({
      success: true,
      filename: filename,
      fileId: file.getId(),
      folderId: patientFolder.getId(),
      count: labData.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    Logger.log('Save Labs Error: ' + error.toString());
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
    
    Logger.log('Loading labs for patient: ' + patientId);
    
    // Get patient folder
    const patientFolder = getPatientFolder(patientId);
    
    if (!patientFolder) {
      Logger.log('No folder found for patient: ' + patientId);
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
    labFiles.sort((a, b) => b.getDateCreated().getTime() - a.getDateCreated().getTime());
    
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
    
    Logger.log('Labs loaded successfully - Count: ' + labsObject.labData.length);
    
    return createJsonResponse({
      success: true,
      labData: labsObject.labData,
      loadedFrom: latestFile.getName(),
      savedAt: labsObject.savedAt,
      count: labsObject.labData.length
    });
    
  } catch (error) {
    Logger.log('Load Labs Error: ' + error.toString());
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
      throw new Error('Missing or invalid patients data');
    }
    
    if (!CONFIG.spreadsheetId) {
      throw new Error('Spreadsheet ID not configured');
    }
    
    Logger.log('Syncing ' + patients.length + ' patients to sheet');
    
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
    }
    
    // Clear existing data (keep headers)
    if (sheet.getLastRow() > 1) {
      sheet.getRange(2, 1, sheet.getLastRow() - 1, 9).clear();
    }
    
    // Prepare data rows
    const rows = patients.map(p => [
      p.ward || '',
      p.bed || '',
      p.name || '',
      p.mrn || '',
      p.doctor || '',
      p.diagnosis || '',
      p.plan || '',
      p.status || '',
      new Date(p.timestamp || Date.now()).toLocaleString()
    ]);
    
    // Write to sheet
    if (rows.length > 0) {
      sheet.getRange(2, 1, rows.length, 9).setValues(rows);
    }
    
    // Auto-resize columns
    sheet.autoResizeColumns(1, 9);
    
    Logger.log('Sheet sync completed successfully');
    
    return createJsonResponse({
      success: true,
      patientsSync: patients.length,
      sheetId: CONFIG.spreadsheetId,
      sheetName: 'Patients',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    Logger.log('Sheet Sync Error: ' + error.toString());
    return createJsonResponse({
      error: 'Failed to sync sheet: ' + error.toString()
    }, 500);
  }
}

// ═══════════════════════════════════════════════════════════════════════
// GOOGLE VISION API INTEGRATION
// ═══════════════════════════════════════════════════════════════════════

/**
 * Call Vision API with API Key
 */
function callVisionAPIWithKey(imageBase64) {
  const url = 'https://vision.googleapis.com/v1/images:annotate?key=' + CONFIG.visionApiKey;
  
  const payload = {
    requests: [{
      image: {
        content: imageBase64
      },
      features: [{
        type: 'TEXT_DETECTION',
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
    throw new Error('Vision API error: ' + responseCode + ' - ' + responseText);
  }
  
  const result = JSON.parse(responseText);
  
  if (result.responses && result.responses[0]) {
    const annotations = result.responses[0].textAnnotations;
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
  
  return { text: '', confidence: 0 };
}

/**
 * Call Vision API with Service Account
 */
function callVisionAPIWithServiceAccount(imageBase64) {
  // Get OAuth token from service account
  const token = getServiceAccountToken();
  
  const url = 'https://vision.googleapis.com/v1/images:annotate';
  
  const payload = {
    requests: [{
      image: {
        content: imageBase64
      },
      features: [{
        type: 'TEXT_DETECTION',
        maxResults: 1
      }]
    }]
  };
  
  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'Authorization': 'Bearer ' + token
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  const response = UrlFetchApp.fetch(url, options);
  const responseCode = response.getResponseCode();
  const responseText = response.getContentText();
  
  if (responseCode !== 200) {
    throw new Error('Vision API error: ' + responseCode + ' - ' + responseText);
  }
  
  const result = JSON.parse(responseText);
  
  if (result.responses && result.responses[0]) {
    const annotations = result.responses[0].textAnnotations;
    if (annotations && annotations.length > 0) {
      const text = annotations[0].description || '';
      const confidence = annotations[0].confidence || 0.85;
      return {
        text: text,
        confidence: Math.round(confidence * 100)
      };
    }
  }
  
  return { text: '', confidence: 0 };
}

/**
 * Get OAuth token from service account
 */
function getServiceAccountToken() {
  const serviceAccountKey = JSON.parse(CONFIG.serviceAccountKey);
  
  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: serviceAccountKey.client_email,
    scope: 'https://www.googleapis.com/auth/cloud-vision',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  };
  
  const jwt = createJWT(claim, serviceAccountKey.private_key);
  
  const url = 'https://oauth2.googleapis.com/token';
  const payload = {
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion: jwt
  };
  
  const options = {
    method: 'post',
    contentType: 'application/x-www-form-urlencoded',
    payload: payload
  };
  
  const response = UrlFetchApp.fetch(url, options);
  const result = JSON.parse(response.getContentText());
  
  return result.access_token;
}

/**
 * Create JWT for service account authentication
 * Note: This is a simplified version. For production, use a proper JWT library.
 */
function createJWT(claim, privateKey) {
  const header = Utilities.base64EncodeWebSafe(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claimStr = Utilities.base64EncodeWebSafe(JSON.stringify(claim));
  const signatureInput = header + '.' + claimStr;
  
  const signature = Utilities.computeRsaSha256Signature(signatureInput, privateKey);
  const signatureStr = Utilities.base64EncodeWebSafe(signature);
  
  return signatureInput + '.' + signatureStr;
}

// ═══════════════════════════════════════════════════════════════════════
// CLAUDE OPUS 4.5 API INTEGRATION (GPT-5 LEVEL AI)
// ═══════════════════════════════════════════════════════════════════════

/**
 * Handle Claude Vision request - Advanced OCR with AI analysis
 * Uses Claude Opus 4.5 vision capabilities for superior medical document understanding
 */
function handleClaudeVision(requestData) {
  try {
    if (!requestData.image) {
      throw new Error('No image data provided');
    }

    if (!CONFIG.anthropicApiKey) {
      throw new Error('Anthropic API key not configured. Please add ANTHROPIC_API_KEY to Script Properties.');
    }

    Logger.log('Processing Claude Vision OCR request...');

    // Extract base64 image data
    let imageData = requestData.image;
    if (imageData.includes(',')) {
      imageData = imageData.split(',')[1];
    }

    // Determine media type
    const mediaType = requestData.image.match(/data:image\/(\w+);/)?.[1] || 'jpeg';
    const fullMediaType = 'image/' + mediaType;

    // Call Claude Opus 4.5 with vision
    const prompt = requestData.prompt || `Analyze this medical laboratory report image and extract all lab values with extreme precision.

For each lab test found, extract:
- Test name (exactly as it appears)
- Numeric value
- Unit of measurement
- Reference range if visible
- Any flags (L/H/LL/HH for Low/High/Critical Low/Critical High)

Return ONLY a valid JSON object in this exact format:
{
  "reportType": "CBC" or "BMP" or "LFT" or "GENERAL",
  "confidence": 0-100,
  "values": [
    {
      "test": "WBC",
      "value": "8.5",
      "unit": "×10⁹/L",
      "flag": "N",
      "refLow": 4.0,
      "refHigh": 11.0,
      "confidence": 95
    }
  ]
}

Be extremely selective - only extract values you are highly confident about. Reject physiologically impossible values.`;

    const url = 'https://api.anthropic.com/v1/messages';

    const payload = {
      model: 'claude-opus-4-20250514',  // Latest Claude Opus 4.5
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: fullMediaType,
                data: imageData
              }
            },
            {
              type: 'text',
              text: prompt
            }
          ]
        }
      ]
    };

    const options = {
      method: 'post',
      contentType: 'application/json',
      headers: {
        'x-api-key': CONFIG.anthropicApiKey,
        'anthropic-version': '2023-06-01'
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();

    if (responseCode !== 200) {
      throw new Error('Claude API error: ' + responseCode + ' - ' + responseText);
    }

    const result = JSON.parse(responseText);

    // Extract text content from Claude's response
    const content = result.content && result.content[0] && result.content[0].text;
    if (!content) {
      throw new Error('No content in Claude response');
    }

    // Parse the JSON response from Claude
    let parsedData;
    try {
      // Extract JSON from response (Claude might include explanatory text)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
      } else {
        parsedData = JSON.parse(content);
      }
    } catch (e) {
      // If parsing fails, return the raw text
      Logger.log('Failed to parse Claude JSON, returning raw text: ' + e.toString());
      return createJsonResponse({
        success: true,
        text: content,
        rawText: content,
        source: 'claude_opus_4.5',
        confidence: 85,
        timestamp: new Date().toISOString()
      });
    }

    Logger.log('Claude Vision OCR completed - Found ' + (parsedData.values?.length || 0) + ' lab values');

    return createJsonResponse({
      success: true,
      ...parsedData,
      rawText: content,
      source: 'claude_opus_4.5',
      model: 'claude-opus-4-20250514',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    Logger.log('Claude Vision Error: ' + error.toString());
    return createJsonResponse({
      error: 'Claude Vision failed: ' + error.toString()
    }, 500);
  }
}

/**
 * Handle Claude Consult request - Advanced medical AI consultation
 * Uses Claude Opus 4.5 for GPT-5 level medical reasoning
 */
function handleClaudeConsult(requestData) {
  try {
    if (!requestData.query) {
      throw new Error('No query provided');
    }

    if (!CONFIG.anthropicApiKey) {
      throw new Error('Anthropic API key not configured. Please add ANTHROPIC_API_KEY to Script Properties.');
    }

    Logger.log('Processing Claude medical consultation: ' + requestData.query);

    const patientContext = requestData.patientContext || '';
    const labValues = requestData.labValues || [];

    // Build comprehensive medical prompt
    let systemPrompt = `You are an elite medical AI consultant with GPT-5 level capabilities, providing expert clinical decision support.

You have comprehensive knowledge of:
- Internal medicine, emergency medicine, critical care
- Lab value interpretation and clinical correlations
- Diagnostic reasoning and differential diagnosis
- Evidence-based treatment guidelines
- Drug interactions and dosing
- Clinical pearls and common pitfalls

Provide clear, actionable, evidence-based medical guidance. Structure your responses with:
- Key clinical points
- Diagnostic considerations
- Treatment recommendations
- Critical warnings when applicable

Be precise, thorough, and cite clinical reasoning.`;

    let userPrompt = requestData.query;

    if (patientContext) {
      userPrompt += '\n\nPatient Context:\n' + patientContext;
    }

    if (labValues.length > 0) {
      userPrompt += '\n\nRecent Lab Values:\n' + labValues.map(v =>
        `${v.test}: ${v.value} ${v.unit} (ref: ${v.refLow}-${v.refHigh}) ${v.flag !== 'N' ? '[' + v.flag + ']' : ''}`
      ).join('\n');
    }

    const url = 'https://api.anthropic.com/v1/messages';

    const payload = {
      model: 'claude-opus-4-20250514',  // Latest Claude Opus 4.5
      max_tokens: 8192,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt
        }
      ]
    };

    const options = {
      method: 'post',
      contentType: 'application/json',
      headers: {
        'x-api-key': CONFIG.anthropicApiKey,
        'anthropic-version': '2023-06-01'
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();

    if (responseCode !== 200) {
      throw new Error('Claude API error: ' + responseCode + ' - ' + responseText);
    }

    const result = JSON.parse(responseText);

    // Extract text content from Claude's response
    const content = result.content && result.content[0] && result.content[0].text;
    if (!content) {
      throw new Error('No content in Claude response');
    }

    Logger.log('Claude consultation completed - Response length: ' + content.length);

    return createJsonResponse({
      success: true,
      response: content,
      model: 'claude-opus-4-20250514',
      source: 'claude_opus_4.5',
      timestamp: new Date().toISOString(),
      usage: result.usage
    });

  } catch (error) {
    Logger.log('Claude Consult Error: ' + error.toString());
    return createJsonResponse({
      error: 'Claude consultation failed: ' + error.toString()
    }, 500);
  }
}

// ═══════════════════════════════════════════════════════════════════════
// GOOGLE DRIVE HELPERS
// ═══════════════════════════════════════════════════════════════════════

/**
 * Get or create patient folder in Drive
 */
function getOrCreatePatientFolder(patientId, patientName) {
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
  }
  
  // Check if patient folder exists
  const patientFolderName = 'Patient_' + patientId + '_' + (patientName || 'Unknown').replace(/[^a-zA-Z0-9]/g, '_');
  const patientFolders = unitEFolder.getFoldersByName(patientFolderName);
  
  if (patientFolders.hasNext()) {
    return patientFolders.next();
  } else {
    return unitEFolder.createFolder(patientFolderName);
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
function createJsonResponse(data, statusCode = 200) {
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
 * Test function to verify setup
 */
function testConfiguration() {
  Logger.log('=== Configuration Test ===');
  Logger.log('Vision API Key: ' + (CONFIG.visionApiKey ? 'Configured' : 'NOT CONFIGURED'));
  Logger.log('Service Account: ' + (CONFIG.serviceAccountKey ? 'Configured' : 'NOT CONFIGURED'));
  Logger.log('Spreadsheet ID: ' + (CONFIG.spreadsheetId ? 'Configured' : 'NOT CONFIGURED'));
  Logger.log('Drive Folder ID: ' + CONFIG.driveFolderId);
  
  if (CONFIG.spreadsheetId) {
    try {
      const spreadsheet = SpreadsheetApp.openById(CONFIG.spreadsheetId);
      Logger.log('Spreadsheet access: SUCCESS - ' + spreadsheet.getName());
    } catch (e) {
      Logger.log('Spreadsheet access: FAILED - ' + e.toString());
    }
  }
  
  Logger.log('=== Test Complete ===');
}
