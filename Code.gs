/**
 * ═══════════════════════════════════════════════════════════════════════════
 * UNIT E WARD ROUNDS - GOOGLE APPS SCRIPT v3.2
 *
 * Matches YOUR sheet format exactly:
 * Row 5: Room/Ward | Patient name | Diagnosis | Assigned Doctor | Status
 * Ward headers (Ward 20, Ward 21, etc.) in column A
 * ═══════════════════════════════════════════════════════════════════════════
 */

const SCRIPT_VERSION = '3.2.0';

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

function getConfig() {
  const props = PropertiesService.getScriptProperties();
  return {
    visionApiKey: props.getProperty('VISION_API_KEY') || '',
    anthropicApiKey: props.getProperty('ANTHROPIC_API_KEY') || '',
    spreadsheetId: props.getProperty('SPREADSHEET_ID') || '1I2Cmm2YPUuJw4o4cOgl-iFmqTmfy6S9btFZ-5AIMxh4',
    driveFolderId: props.getProperty('DRIVE_FOLDER_ID') || '1LhrEHUgRsoz2v2w6k-Y8h7buT4Kvjk2I',
    sheetName: props.getProperty('SHEET_NAME') || 'Unit e',
    dataStartRow: 6  // Data starts at row 6 (after headers at row 5)
  };
}

const CLAUDE_MODEL = 'claude-sonnet-4-20250514';

// ═══════════════════════════════════════════════════════════════════════════
// DATA STORE - Google Drive Storage
// ═══════════════════════════════════════════════════════════════════════════

const DataStore = {

  getAppFolder: function() {
    const config = getConfig();
    let root;

    if (config.driveFolderId === 'root') {
      root = DriveApp.getRootFolder();
    } else {
      root = DriveApp.getFolderById(config.driveFolderId);
    }

    const folderName = 'Unit E Ward Rounds Data';
    const folders = root.getFoldersByName(folderName);

    if (folders.hasNext()) {
      const folder = folders.next();
      Logger.log('Using existing folder: ' + folder.getName() + ' (ID: ' + folder.getId() + ')');
      return folder;
    }

    const newFolder = root.createFolder(folderName);
    Logger.log('Created new folder: ' + newFolder.getName() + ' (ID: ' + newFolder.getId() + ')');
    return newFolder;
  },

  getFile: function(fileName, defaultData) {
    const folder = this.getAppFolder();
    const files = folder.getFilesByName(fileName);

    if (files.hasNext()) {
      const file = files.next();
      Logger.log('Using existing file: ' + fileName + ' (ID: ' + file.getId() + ')');
      return file;
    }

    const newFile = folder.createFile(fileName, JSON.stringify(defaultData || {}), MimeType.PLAIN_TEXT);
    Logger.log('Created new file: ' + fileName + ' (ID: ' + newFile.getId() + ')');
    return newFile;
  },

  read: function(fileName, defaultData) {
    try {
      const file = this.getFile(fileName, defaultData);
      const content = file.getBlob().getDataAsString();
      const parsed = content ? JSON.parse(content) : (defaultData || {});
      Logger.log('Read from ' + fileName + ': ' + Object.keys(parsed).length + ' items');
      return parsed;
    } catch (e) {
      Logger.log('Read error for ' + fileName + ': ' + e.toString());
      return defaultData || {};
    }
  },

  write: function(fileName, data) {
    try {
      const file = this.getFile(fileName, {});
      const content = JSON.stringify(data, null, 2);
      file.setContent(content);
      Logger.log('Wrote to ' + fileName + ': ' + content.length + ' bytes, ' + Object.keys(data).length + ' items');
      return true;
    } catch (e) {
      Logger.log('Write error for ' + fileName + ': ' + e.toString());
      return false;
    }
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// SHEET SYNC - Reads YOUR exact format
// ═══════════════════════════════════════════════════════════════════════════

const SheetSync = {

  getSheet: function() {
    const config = getConfig();
    if (!config.spreadsheetId) return null;

    try {
      const ss = SpreadsheetApp.openById(config.spreadsheetId);
      // Try configured name first, then fallbacks
      return ss.getSheetByName(config.sheetName) ||
             ss.getSheetByName('Unit e') ||
             ss.getSheetByName('Patients') ||
             ss.getSheets()[0];
    } catch (e) {
      Logger.log('getSheet error: ' + e);
      return null;
    }
  },

  /**
   * Pull from YOUR sheet format:
   * Col A: Room/Ward (ward headers like "Ward 20" + bed numbers like "11-1")
   * Col B: Patient name
   * Col C: Diagnosis
   * Col D: Assigned Doctor
   * Col E: Status
   */
  pullFromSheet: function() {
    const sheet = this.getSheet();
    if (!sheet) return { success: false, error: 'Sheet not found' };

    const config = getConfig();

    try {
      const lastRow = sheet.getLastRow();
      Logger.log('Sheet: ' + sheet.getName() + ', Last row: ' + lastRow);

      if (lastRow < config.dataStartRow) {
        return { success: true, imported: 0, message: 'No data' };
      }

      const numRows = lastRow - config.dataStartRow + 1;
      const data = sheet.getRange(config.dataStartRow, 1, numRows, 5).getValues();

      Logger.log('Reading ' + numRows + ' rows from row ' + config.dataStartRow);
      Logger.log('First few rows: ' + JSON.stringify(data.slice(0, 5)));

      const patients = {};
      let currentWard = 'Unassigned';
      let count = 0;

      data.forEach(function(row, idx) {
        const colA = (row[0] || '').toString().trim();  // Room/Ward
        const colB = (row[1] || '').toString().trim();  // Patient name
        const colC = (row[2] || '').toString().trim();  // Diagnosis
        const colD = (row[3] || '').toString().trim();  // Doctor
        const colE = (row[4] || '').toString().trim();  // Status

        // Check if this is a ward header row (Ward X in col A, nothing in col B)
        if (colA && colA.toLowerCase().startsWith('ward') && !colB) {
          currentWard = colA;
          Logger.log('Row ' + (idx + config.dataStartRow) + ': Ward header -> ' + currentWard);
          return;
        }

        // Skip empty rows or header-like rows
        if (!colB || colB.toLowerCase().includes('patient') || colB.toLowerCase().includes('name')) {
          return;
        }

        // This is a patient row
        const patientId = (currentWard + '_' + colB).replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();

        patients[patientId] = {
          id: patientId,
          ward: currentWard,
          bed: colA,
          name: colB,
          diagnosis: colC,
          doctor: colD,
          status: colE || 'Non-Chronic',
          labData: [],
          createdAt: Date.now(),
          updatedAt: Date.now()
        };

        count++;
        Logger.log('Row ' + (idx + config.dataStartRow) + ': Patient "' + colB + '" in ' + currentWard + ' bed ' + colA);
      });

      Logger.log('Total patients parsed: ' + count);
      Logger.log('Patient IDs: ' + Object.keys(patients).join(', '));

      // Merge with existing data (preserve lab data)
      const existing = DataStore.read('patients.json', {});
      Logger.log('Existing patients in Drive: ' + Object.keys(existing).length);

      for (const id in patients) {
        if (existing[id] && existing[id].labData && existing[id].labData.length > 0) {
          patients[id].labData = existing[id].labData;
          Logger.log('Preserved lab data for: ' + id);
        }
      }

      // Save to Drive
      const writeResult = DataStore.write('patients.json', patients);
      Logger.log('Write to Drive result: ' + writeResult);

      // Verify write
      const verification = DataStore.read('patients.json', {});
      Logger.log('Verification - patients in Drive after write: ' + Object.keys(verification).length);

      return {
        success: true,
        count: count,
        saved: Object.keys(verification).length,
        timestamp: new Date().toISOString()
      };

    } catch (e) {
      Logger.log('pullFromSheet error: ' + e.toString());
      Logger.log('Stack: ' + e.stack);
      return { success: false, error: e.toString() };
    }
  },

  /**
   * Push to sheet (Drive → Sheet)
   * Writes back in YOUR format
   */
  pushToSheet: function(patients) {
    const sheet = this.getSheet();
    if (!sheet) return { success: false, error: 'Sheet not found' };

    const config = getConfig();

    try {
      // Group by ward
      const byWard = {};
      for (const id in patients) {
        const p = patients[id];
        const ward = p.ward || 'Unassigned';
        if (!byWard[ward]) byWard[ward] = [];
        byWard[ward].push(p);
      }

      // Sort within wards by bed
      for (const ward in byWard) {
        byWard[ward].sort((a, b) => (a.bed || '').localeCompare(b.bed || '', undefined, { numeric: true }));
      }

      // Clear existing data
      const lastRow = sheet.getLastRow();
      if (lastRow >= config.dataStartRow) {
        sheet.getRange(config.dataStartRow, 1, lastRow - config.dataStartRow + 1, 5).clearContent();
      }

      // Build rows
      const rows = [];
      const wardOrder = ['Ward 20', 'Ward 21', 'Ward 22', 'Ward 5', 'Ward 27', 'Ward 4', 'Ward 19', 'Ward 10', 'ICU', 'ER'];

      wardOrder.forEach(function(ward) {
        if (byWard[ward] && byWard[ward].length > 0) {
          rows.push([ward, '', '', '', '']);  // Ward header
          byWard[ward].forEach(function(p) {
            rows.push([p.bed || '', p.name || '', p.diagnosis || '', p.doctor || '', p.status || '']);
          });
        }
      });

      // Any remaining wards
      for (const ward in byWard) {
        if (wardOrder.indexOf(ward) === -1 && byWard[ward].length > 0) {
          rows.push([ward, '', '', '', '']);
          byWard[ward].forEach(function(p) {
            rows.push([p.bed || '', p.name || '', p.diagnosis || '', p.doctor || '', p.status || '']);
          });
        }
      }

      if (rows.length > 0) {
        sheet.getRange(config.dataStartRow, 1, rows.length, 5).setValues(rows);

        // Format ward headers
        let rowNum = config.dataStartRow;
        rows.forEach(function(row) {
          if (row[0].toLowerCase().startsWith('ward') && !row[1]) {
            sheet.getRange(rowNum, 1, 1, 5).setBackground('#c8e6c9').setFontWeight('bold');
          }
          rowNum++;
        });
      }

      return { success: true, count: rows.length };

    } catch (e) {
      Logger.log('pushToSheet error: ' + e);
      return { success: false, error: e.toString() };
    }
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// PATIENT SERVICE
// ═══════════════════════════════════════════════════════════════════════════

const PatientService = {

  getAll: function() {
    return DataStore.read('patients.json', {});
  },

  getById: function(id) {
    return this.getAll()[id] || null;
  },

  create: function(data) {
    const patients = this.getAll();
    const id = data.id || Utilities.getUuid();

    patients[id] = {
      id: id,
      ward: data.ward || 'Unassigned',
      bed: data.bed || '',
      name: data.name || '',
      diagnosis: data.diagnosis || '',
      doctor: data.doctor || '',
      status: data.status || 'New',
      labData: data.labData || [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    DataStore.write('patients.json', patients);
    return { success: true, patient: patients[id], id: id };
  },

  update: function(id, updates) {
    const patients = this.getAll();
    if (!patients[id]) return { success: false, error: 'Not found' };

    for (const key in updates) {
      if (key !== 'id' && key !== 'createdAt') {
        patients[id][key] = updates[key];
      }
    }
    patients[id].updatedAt = Date.now();

    DataStore.write('patients.json', patients);
    return { success: true, patient: patients[id] };
  },

  delete: function(id) {
    const patients = this.getAll();
    if (!patients[id]) return { success: false, error: 'Not found' };

    delete patients[id];
    DataStore.write('patients.json', patients);
    return { success: true };
  },

  refresh: function() {
    const result = SheetSync.pullFromSheet();
    return {
      success: result.success,
      patients: this.getAll(),
      syncResult: result
    };
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// LAB SERVICE
// ═══════════════════════════════════════════════════════════════════════════

const LabService = {

  save: function(patientId, labData, metadata) {
    const patients = PatientService.getAll();
    if (!patients[patientId]) return { success: false, error: 'Patient not found' };

    if (!patients[patientId].labData) patients[patientId].labData = [];

    const entry = {
      id: Utilities.getUuid(),
      timestamp: Date.now(),
      reportType: labData.reportType || 'GENERAL',
      values: labData.values || [],
      source: labData.source || 'manual'
    };

    patients[patientId].labData.unshift(entry);
    if (patients[patientId].labData.length > 50) {
      patients[patientId].labData = patients[patientId].labData.slice(0, 50);
    }
    patients[patientId].updatedAt = Date.now();

    DataStore.write('patients.json', patients);
    return { success: true, labEntry: entry };
  },

  getHistory: function(patientId, limit) {
    const patient = PatientService.getById(patientId);
    if (!patient) return { success: false, error: 'Patient not found' };

    const history = patient.labData || [];
    return {
      success: true,
      history: limit ? history.slice(0, limit) : history,
      count: history.length
    };
  },

  getLatest: function(patientId) {
    const result = this.getHistory(patientId, 1);
    return result.success ? { success: true, labs: result.history[0] || null } : result;
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// NOTICE SERVICE
// ═══════════════════════════════════════════════════════════════════════════

const NoticeService = {
  get: function() { return DataStore.read('notice.json', { text: '' }); },
  save: function(text) {
    const notice = { text: text || '', updatedAt: Date.now() };
    return DataStore.write('notice.json', notice) ? { success: true, notice } : { success: false };
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// OCR SERVICE
// ═══════════════════════════════════════════════════════════════════════════

const OCRService = {
  process: function(imageBase64) {
    const config = getConfig();
    if (!config.visionApiKey) return { success: false, error: 'Vision API key not configured' };

    try {
      const imageData = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      const response = UrlFetchApp.fetch(
        'https://vision.googleapis.com/v1/images:annotate?key=' + config.visionApiKey,
        {
          method: 'post',
          contentType: 'application/json',
          payload: JSON.stringify({
            requests: [{ image: { content: imageData }, features: [{ type: 'DOCUMENT_TEXT_DETECTION' }] }]
          }),
          muteHttpExceptions: true
        }
      );

      if (response.getResponseCode() !== 200) return { success: false, error: 'Vision API error' };

      const result = JSON.parse(response.getContentText());
      const text = result.responses?.[0]?.fullTextAnnotation?.text ||
                   result.responses?.[0]?.textAnnotations?.[0]?.description || '';

      return { success: true, text: text, confidence: text ? 90 : 0, source: 'google_vision' };
    } catch (e) {
      return { success: false, error: e.toString() };
    }
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// CLAUDE SERVICE
// ═══════════════════════════════════════════════════════════════════════════

const ClaudeService = {

  processImage: function(imageBase64) {
    const config = getConfig();
    if (!config.anthropicApiKey) return { success: false, error: 'API key not configured' };

    try {
      let imageData = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
      const mediaType = imageBase64.match(/data:image\/(\w+);/)?.[1] || 'jpeg';

      const response = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
        method: 'post',
        contentType: 'application/json',
        headers: { 'x-api-key': config.anthropicApiKey, 'anthropic-version': '2023-06-01' },
        payload: JSON.stringify({
          model: CLAUDE_MODEL,
          max_tokens: 4096,
          messages: [{
            role: 'user',
            content: [
              { type: 'image', source: { type: 'base64', media_type: 'image/' + mediaType, data: imageData } },
              { type: 'text', text: 'Extract lab values as JSON: {"reportType":"CBC|BMP|CMP|LFT|GENERAL","values":[{"test":"name","value":"number","unit":"unit","flag":"N|L|H"}]}' }
            ]
          }]
        }),
        muteHttpExceptions: true
      });

      if (response.getResponseCode() !== 200) return { success: false, error: 'Claude API error' };

      const content = JSON.parse(response.getContentText()).content?.[0]?.text || '';
      let parsed = { values: [], reportType: 'GENERAL' };
      try { parsed = JSON.parse(content.match(/\{[\s\S]*\}/)?.[0] || '{}'); } catch(e) {}

      return { success: true, values: parsed.values || [], reportType: parsed.reportType || 'GENERAL', rawText: content };
    } catch (e) {
      return { success: false, error: e.toString() };
    }
  },

  consult: function(query, patientContext, labValues) {
    const config = getConfig();
    if (!config.anthropicApiKey) return { success: false, error: 'API key not configured' };

    try {
      let prompt = query;
      if (patientContext) prompt += '\n\nPatient: ' + patientContext;
      if (labValues?.length) {
        prompt += '\n\nLabs:\n' + labValues.map(v => `- ${v.test}: ${v.value} ${v.unit || ''}`).join('\n');
      }

      const response = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
        method: 'post',
        contentType: 'application/json',
        headers: { 'x-api-key': config.anthropicApiKey, 'anthropic-version': '2023-06-01' },
        payload: JSON.stringify({
          model: CLAUDE_MODEL,
          max_tokens: 4096,
          system: 'You are an expert medical AI consultant.',
          messages: [{ role: 'user', content: prompt }]
        }),
        muteHttpExceptions: true
      });

      if (response.getResponseCode() !== 200) return { success: false, error: 'Claude API error' };

      return { success: true, response: JSON.parse(response.getContentText()).content?.[0]?.text || '' };
    } catch (e) {
      return { success: false, error: e.toString() };
    }
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// HTTP HANDLERS
// ═══════════════════════════════════════════════════════════════════════════

function doGet(e) {
  const action = e?.parameter?.action || 'info';

  switch (action) {
    case 'health':
      return json({ status: 'healthy', version: SCRIPT_VERSION, sheet: getConfig().sheetName });
    case 'sync':
    case 'pull':
      return json(SheetSync.pullFromSheet());
    case 'test':
      return json(testSheetRead());
    case 'debug':
      return json(debugFullFlow());
    case 'patients':
      return json({ patients: PatientService.getAll(), count: Object.keys(PatientService.getAll()).length });
    default:
      return htmlPage();
  }
}

function doPost(e) {
  try {
    if (!e?.postData?.contents) return json({ error: 'No data' }, 400);

    const data = JSON.parse(e.postData.contents);
    const action = data.action;

    Logger.log('Action: ' + action);

    switch (action) {
      // Patients
      case 'loadPatients':
        const pullResult = SheetSync.pullFromSheet();
        Logger.log('Pull result: ' + JSON.stringify(pullResult));
        const allPatients = PatientService.getAll();
        Logger.log('Patients in store: ' + Object.keys(allPatients).length);
        return json({
          success: true,
          patients: allPatients,
          count: Object.keys(allPatients).length,
          syncResult: pullResult
        });
      case 'refreshFromSheet':
        return json(PatientService.refresh());
      case 'savePatient':
        return json(PatientService.create(data.patient || data));
      case 'updatePatient':
        return json(PatientService.update(data.patientId, data.updates || data));
      case 'deletePatient':
        return json(PatientService.delete(data.patientId));

      // Labs
      case 'saveLabs':
        return json(LabService.save(data.patientId, data.labData, data.metadata));
      case 'loadLabs':
        return json(LabService.getLatest(data.patientId));
      case 'loadLabHistory':
        return json(LabService.getHistory(data.patientId, data.limit));

      // Notice
      case 'loadNotice':
        return json({ success: true, notice: NoticeService.get() });
      case 'saveNotice':
        return json(NoticeService.save(data.notice?.text || data.text));

      // OCR & AI
      case 'runOCR':
        return json(OCRService.process(data.image));
      case 'claudeVision':
        return json(ClaudeService.processImage(data.image));
      case 'claudeConsult':
        return json(ClaudeService.consult(data.query, data.patientContext, data.labValues));

      // Sync
      case 'pullFromSheet':
      case 'syncSheet':
      case 'fullSync':
        return json(SheetSync.pullFromSheet());
      case 'pushToSheet':
        return json(SheetSync.pushToSheet(PatientService.getAll()));

      case 'test':
        return json({ success: true, version: SCRIPT_VERSION });

      default:
        return json({ error: 'Unknown action: ' + action });
    }
  } catch (e) {
    Logger.log('Error: ' + e);
    return json({ error: e.toString() });
  }
}

function json(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

function htmlPage() {
  const config = getConfig();
  return HtmlService.createHtmlOutput(`
    <html><head><title>Unit E API v${SCRIPT_VERSION}</title>
    <style>body{font-family:system-ui;max-width:600px;margin:40px auto;padding:20px}
    .btn{background:#15803d;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;margin:8px 8px 8px 0}
    .btn-blue{background:#2563eb}
    .card{background:#f5f5f5;padding:16px;border-radius:8px;margin:16px 0}</style></head>
    <body>
    <h1>🏥 Unit E Ward Rounds API</h1>
    <p>Version ${SCRIPT_VERSION}</p>
    <div class="card">
      <strong>Sheet:</strong> ${config.sheetName}<br>
      <strong>Data starts:</strong> Row ${config.dataStartRow}<br>
      <strong>Spreadsheet ID:</strong> ${config.spreadsheetId}
    </div>
    <h3>Actions</h3>
    <a class="btn" href="?action=sync">🔄 Sync from Sheet</a>
    <a class="btn" href="?action=patients">👥 View Patients</a>
    <br>
    <a class="btn btn-blue" href="?action=debug">🔍 Debug Full Flow</a>
    <a class="btn btn-blue" href="?action=test">🧪 Test Sheet Read</a>
    <a class="btn btn-blue" href="?action=health">❤️ Health</a>
    </body></html>
  `);
}

// ═══════════════════════════════════════════════════════════════════════════
// TEST & SETUP
// ═══════════════════════════════════════════════════════════════════════════

function testSheetRead() {
  const sheet = SheetSync.getSheet();
  if (!sheet) return { error: 'Sheet not found' };

  const config = getConfig();
  const lastRow = sheet.getLastRow();

  // Read first 10 rows of data
  const sampleRows = Math.min(10, lastRow - config.dataStartRow + 1);
  if (sampleRows < 1) return { error: 'No data rows', lastRow: lastRow, dataStart: config.dataStartRow };

  const data = sheet.getRange(config.dataStartRow, 1, sampleRows, 5).getValues();

  return {
    sheetName: sheet.getName(),
    lastRow: lastRow,
    dataStartRow: config.dataStartRow,
    sampleData: data
  };
}

/**
 * Debug the full flow - sheet read, parse, save, retrieve
 */
function debugFullFlow() {
  const results = {
    step1_config: null,
    step2_sheetRead: null,
    step3_pullFromSheet: null,
    step4_driveContents: null,
    step5_patientServiceGetAll: null
  };

  try {
    // Step 1: Config
    results.step1_config = getConfig();

    // Step 2: Raw sheet read
    const sheet = SheetSync.getSheet();
    if (sheet) {
      const lastRow = sheet.getLastRow();
      const config = getConfig();
      const numRows = Math.min(20, lastRow - config.dataStartRow + 1);
      if (numRows > 0) {
        results.step2_sheetRead = {
          sheetName: sheet.getName(),
          lastRow: lastRow,
          dataStartRow: config.dataStartRow,
          rowsToRead: numRows,
          rawData: sheet.getRange(config.dataStartRow, 1, numRows, 5).getValues()
        };
      } else {
        results.step2_sheetRead = { error: 'No data rows', lastRow: lastRow };
      }
    } else {
      results.step2_sheetRead = { error: 'Sheet not found' };
    }

    // Step 3: Pull from sheet
    results.step3_pullFromSheet = SheetSync.pullFromSheet();

    // Step 4: Check Drive file contents
    try {
      const file = DataStore.getFile('patients.json', {});
      const content = file.getBlob().getDataAsString();
      const parsed = JSON.parse(content || '{}');
      results.step4_driveContents = {
        fileId: file.getId(),
        fileName: file.getName(),
        contentLength: content.length,
        patientCount: Object.keys(parsed).length,
        patientIds: Object.keys(parsed),
        samplePatient: Object.values(parsed)[0] || null
      };
    } catch (e) {
      results.step4_driveContents = { error: e.toString() };
    }

    // Step 5: PatientService.getAll()
    const patients = PatientService.getAll();
    results.step5_patientServiceGetAll = {
      count: Object.keys(patients).length,
      ids: Object.keys(patients),
      sample: Object.values(patients)[0] || null
    };

  } catch (e) {
    results.error = e.toString();
    results.stack = e.stack;
  }

  return results;
}

function initialSetup() {
  Logger.log('=== Setup ===');

  // Create folder
  const folder = DataStore.getAppFolder();
  Logger.log('Folder: ' + folder.getName());

  // Init files
  DataStore.getFile('patients.json', {});
  DataStore.getFile('notice.json', { text: '' });
  Logger.log('Files ready');

  // Test sheet
  const sheet = SheetSync.getSheet();
  Logger.log('Sheet: ' + (sheet ? sheet.getName() : 'NOT FOUND'));

  // Pull data
  const result = SheetSync.pullFromSheet();
  Logger.log('Pull result: ' + JSON.stringify(result));

  // Verify
  const patients = PatientService.getAll();
  Logger.log('Patients in store: ' + Object.keys(patients).length);

  return {
    folder: folder.getName(),
    sheet: sheet ? sheet.getName() : 'NOT FOUND',
    pullResult: result,
    patientsInStore: Object.keys(patients).length
  };
}

function manualSync() {
  return SheetSync.pullFromSheet();
}
