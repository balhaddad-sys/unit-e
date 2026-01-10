/**
 * ═══════════════════════════════════════════════════════════════════════════
 * UNIT E WARD ROUNDS - GOOGLE APPS SCRIPT v3.6
 *
 * FIXED: 
 * - Response format matches frontend expectations
 * - Bed numbers formatted as dates handled
 * - Better error messages
 * ═══════════════════════════════════════════════════════════════════════════
 */

const SCRIPT_VERSION = '3.6.0';

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

function getConfig() {
  const props = PropertiesService.getScriptProperties();
  return {
    visionApiKey: props.getProperty('VISION_API_KEY') || '',
    openaiApiKey: props.getProperty('OPENAI_API_KEY') || '',
    spreadsheetId: props.getProperty('SPREADSHEET_ID') || '1I2Cmm2YPUuJw4o4cOgl-iFmqTmfy6S9btFZ-5AIMxh4',
    driveFolderId: props.getProperty('DRIVE_FOLDER_ID') || '1LhrEHUgRsoz2v2w6k-Y8h7buT4Kvjk2I',
    sheetName: props.getProperty('SHEET_NAME') || 'Unit e',
    dataStartRow: 4
  };
}

const CHATGPT_MODEL = 'gpt-4o'; // or 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'

// ═══════════════════════════════════════════════════════════════════════════
// DATA STORE
// ═══════════════════════════════════════════════════════════════════════════

const DataStore = {
  getAppFolder: function() {
    const config = getConfig();
    let root = config.driveFolderId === 'root' ? 
      DriveApp.getRootFolder() : 
      DriveApp.getFolderById(config.driveFolderId);

    const folderName = 'Unit E Ward Rounds Data';
    const folders = root.getFoldersByName(folderName);
    return folders.hasNext() ? folders.next() : root.createFolder(folderName);
  },

  getFile: function(fileName, defaultData) {
    const folder = this.getAppFolder();
    const files = folder.getFilesByName(fileName);
    if (files.hasNext()) return files.next();
    return folder.createFile(fileName, JSON.stringify(defaultData || {}), MimeType.PLAIN_TEXT);
  },

  read: function(fileName, defaultData) {
    try {
      const file = this.getFile(fileName, defaultData);
      const content = file.getBlob().getDataAsString();
      return content ? JSON.parse(content) : (defaultData || {});
    } catch (e) {
      Logger.log('DataStore.read error: ' + e.toString());
      return defaultData || {};
    }
  },

  write: function(fileName, data) {
    try {
      const file = this.getFile(fileName, {});
      file.setContent(JSON.stringify(data, null, 2));
      return true;
    } catch (e) {
      Logger.log('DataStore.write error: ' + e.toString());
      return false;
    }
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Convert cell value to string
 * Handles dates that might be bed numbers (like "11-1" → Nov 1)
 */
function cellToString(value, columnIndex) {
  if (value === null || value === undefined || value === '') return '';
  
  // Handle Date objects
  if (value instanceof Date) {
    // For column A (bed numbers), convert back to bed format
    if (columnIndex === 0) {
      const month = value.getMonth() + 1;
      const day = value.getDate();
      return month + '-' + day;
    }
    // Skip dates in other columns
    return '';
  }
  
  let str = String(value).trim();
  
  // Skip date strings in non-bed columns
  if (columnIndex !== 0) {
    if (str.match(/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s/i)) return '';
    if (str.match(/GMT[+-]\d{4}/)) return '';
  }
  
  return str;
}

function getCell(row, index) {
  return cellToString(row[index], index);
}

function isSectionHeader(text) {
  if (!text) return false;
  const lower = text.toLowerCase();
  return lower.includes('male list') || lower.includes('female list') || lower === 'er/unassigned';
}

function isColumnHeader(colA, colB) {
  const a = (colA || '').toLowerCase();
  const b = (colB || '').toLowerCase();
  return a.includes('room') || b.includes('patient name');
}

function isWardHeader(colA, colB) {
  if (!colA || colB) return false;
  const lower = colA.toLowerCase();
  return lower.startsWith('ward') || lower === 'icu' || lower === 'er' || lower === 'ccu';
}

// ═══════════════════════════════════════════════════════════════════════════
// SHEET SYNC
// ═══════════════════════════════════════════════════════════════════════════

const SheetSync = {

  getSheet: function() {
    const config = getConfig();
    if (!config.spreadsheetId) return null;
    try {
      const ss = SpreadsheetApp.openById(config.spreadsheetId);
      return ss.getSheetByName(config.sheetName) || ss.getSheets()[0];
    } catch (e) {
      Logger.log('getSheet error: ' + e.toString());
      return null;
    }
  },

  pullFromSheet: function() {
    const sheet = this.getSheet();
    if (!sheet) {
      return { success: false, error: 'Sheet not found', count: 0, imported: 0 };
    }

    const config = getConfig();

    try {
      const lastRow = sheet.getLastRow();
      Logger.log('Sheet: ' + sheet.getName() + ', Last row: ' + lastRow);
      
      if (lastRow < config.dataStartRow) {
        return { success: true, count: 0, imported: 0, message: 'No data' };
      }

      const numRows = lastRow - config.dataStartRow + 1;
      const data = sheet.getRange(config.dataStartRow, 1, numRows, 5).getValues();

      Logger.log('Reading ' + numRows + ' rows from row ' + config.dataStartRow);

      const patients = {};
      let currentWard = 'Unassigned';
      let currentSection = 'active';
      let count = 0;

      for (let idx = 0; idx < data.length; idx++) {
        const row = data[idx];
        const rowNum = idx + config.dataStartRow;
        
        const colA = getCell(row, 0);
        const colB = getCell(row, 1);
        const colC = getCell(row, 2);
        const colD = getCell(row, 3);
        const colE = getCell(row, 4);

        // Skip empty rows
        if (!colA && !colB && !colC && !colD && !colE) continue;

        // Section headers
        if (isSectionHeader(colA)) {
          currentSection = colA.toLowerCase().includes('chronic') ? 'chronic' : 'active';
          Logger.log('Row ' + rowNum + ': Section -> ' + currentSection);
          continue;
        }

        // Column headers
        if (isColumnHeader(colA, colB)) continue;

        // Ward headers
        if (isWardHeader(colA, colB)) {
          currentWard = colA;
          Logger.log('Row ' + rowNum + ': Ward -> ' + currentWard);
          continue;
        }

        // Patient row - must have name in column B
        if (colB && !colB.toLowerCase().includes('patient') && !colB.toLowerCase().includes('name')) {
          const patientId = (currentWard + '_' + colB).replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
          const status = colE || (currentSection === 'chronic' ? 'Chronic' : 'Non-Chronic');

          patients[patientId] = {
            id: patientId,
            ward: currentWard,
            bed: colA || '',
            name: colB,
            diagnosis: colC || '',
            doctor: colD || '',
            status: status,
            section: currentSection,
            labData: [],
            createdAt: Date.now(),
            updatedAt: Date.now()
          };

          count++;
          Logger.log('Row ' + rowNum + ': PATIENT "' + colB + '" bed=' + (colA || 'none') + ' ward=' + currentWard);
        }
      }

      Logger.log('Total patients parsed: ' + count);

      // Preserve existing lab data
      const existing = DataStore.read('patients.json', {});
      for (const id in patients) {
        if (existing[id]?.labData?.length > 0) {
          patients[id].labData = existing[id].labData;
        }
      }

      DataStore.write('patients.json', patients);

      // Return with BOTH count and imported for compatibility
      return {
        success: true,
        count: count,
        imported: count,
        saved: Object.keys(patients).length,
        timestamp: new Date().toISOString()
      };

    } catch (e) {
      Logger.log('pullFromSheet error: ' + e.toString());
      return { success: false, error: e.toString(), count: 0, imported: 0 };
    }
  },

  pushToSheet: function(patients) {
    const sheet = this.getSheet();
    if (!sheet) return { success: false, error: 'Sheet not found' };

    const config = getConfig();

    try {
      const sections = { active: {}, chronic: {} };
      
      for (const id in patients) {
        const p = patients[id];
        const section = p.section || (p.status === 'Chronic' ? 'chronic' : 'active');
        const ward = p.ward || 'Unassigned';
        if (!sections[section][ward]) sections[section][ward] = [];
        sections[section][ward].push(p);
      }

      for (const section in sections) {
        for (const ward in sections[section]) {
          sections[section][ward].sort((a, b) => 
            (a.bed || 'zzz').localeCompare(b.bed || 'zzz', undefined, { numeric: true })
          );
        }
      }

      const lastRow = sheet.getLastRow();
      if (lastRow >= config.dataStartRow) {
        sheet.getRange(config.dataStartRow, 1, lastRow - config.dataStartRow + 1, 5).clearContent();
      }

      const rows = [];
      const wardOrder = ['Ward 20', 'Ward 21', 'Ward 22', 'Ward 5', 'Ward 27', 'Ward 4', 'Ward 19', 'Ward 10', 'ICU', 'ER'];

      rows.push(['Male list (active)', '', '', '', '']);
      rows.push(['Room / Ward', 'Patient name', 'Diagnosis', 'Assigned Doctor', 'Status']);
      
      wardOrder.forEach(ward => {
        if (sections.active[ward]?.length > 0) {
          rows.push([ward, '', '', '', '']);
          sections.active[ward].forEach(p => {
            rows.push([p.bed || '', p.name, p.diagnosis, p.doctor, p.status || 'Non-Chronic']);
          });
        }
      });

      rows.push(['ER/Unassigned', '', '', '', '']);
      rows.push(['Male list (chronic)', '', '', '', '']);
      rows.push(['Room / Ward', 'Patient name', 'Diagnosis', 'Assigned Doctor', 'Status']);
      
      wardOrder.forEach(ward => {
        if (sections.chronic[ward]?.length > 0) {
          rows.push([ward, '', '', '', '']);
          sections.chronic[ward].forEach(p => {
            rows.push([p.bed || '', p.name, p.diagnosis, p.doctor, p.status || 'Chronic']);
          });
        }
      });

      if (rows.length > 0) {
        sheet.getRange(config.dataStartRow, 1, rows.length, 5).setValues(rows);
      }

      return { success: true, count: rows.length };
    } catch (e) {
      return { success: false, error: e.toString() };
    }
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// PATIENT SERVICE
// ═══════════════════════════════════════════════════════════════════════════

const PatientService = {
  getAll: () => DataStore.read('patients.json', {}),
  getById: (id) => PatientService.getAll()[id] || null,
  
  create: function(data) {
    const patients = this.getAll();
    const id = data.id || Utilities.getUuid();
    patients[id] = {
      id, ward: data.ward || 'Unassigned', bed: data.bed || '',
      name: data.name || '', diagnosis: data.diagnosis || '',
      doctor: data.doctor || '', status: data.status || 'New',
      section: data.section || 'active', labData: data.labData || [],
      createdAt: Date.now(), updatedAt: Date.now()
    };
    DataStore.write('patients.json', patients);
    return { success: true, patient: patients[id], id };
  },

  update: function(id, updates) {
    const patients = this.getAll();
    if (!patients[id]) return { success: false, error: 'Patient not found' };
    for (const key in updates) {
      if (key !== 'id' && key !== 'createdAt') patients[id][key] = updates[key];
    }
    patients[id].updatedAt = Date.now();
    DataStore.write('patients.json', patients);
    return { success: true, patient: patients[id] };
  },

  delete: function(id) {
    const patients = this.getAll();
    if (!patients[id]) return { success: false, error: 'Patient not found' };
    delete patients[id];
    DataStore.write('patients.json', patients);
    return { success: true };
  },

  refresh: function() {
    const syncResult = SheetSync.pullFromSheet();
    return {
      success: syncResult.success,
      error: syncResult.error,  // Include error at top level
      patients: this.getAll(),
      syncResult: syncResult    // Also include full syncResult
    };
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// LAB SERVICE
// ═══════════════════════════════════════════════════════════════════════════

const LabService = {
  save: function(patientId, labData) {
    const patients = PatientService.getAll();
    if (!patients[patientId]) return { success: false, error: 'Patient not found' };
    if (!patients[patientId].labData) patients[patientId].labData = [];
    
    const entry = {
      id: Utilities.getUuid(), timestamp: Date.now(),
      reportType: labData.reportType || 'GENERAL',
      values: labData.values || [], source: labData.source || 'manual'
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
    return { success: true, history: limit ? history.slice(0, limit) : history, count: history.length };
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
  get: () => DataStore.read('notice.json', { text: '' }),
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
          method: 'post', contentType: 'application/json',
          payload: JSON.stringify({
            requests: [{ image: { content: imageData }, features: [{ type: 'DOCUMENT_TEXT_DETECTION' }] }]
          }),
          muteHttpExceptions: true
        }
      );

      if (response.getResponseCode() !== 200) return { success: false, error: 'Vision API error' };
      const result = JSON.parse(response.getContentText());
      const text = result.responses?.[0]?.fullTextAnnotation?.text || '';
      return { success: true, text, confidence: text ? 90 : 0, source: 'google_vision' };
    } catch (e) {
      return { success: false, error: e.toString() };
    }
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// CHATGPT SERVICE (OpenAI)
// ═══════════════════════════════════════════════════════════════════════════

const ChatGPTService = {

  processImage: function(imageBase64) {
    const config = getConfig();
    if (!config.openaiApiKey) {
      return { success: false, error: 'OpenAI API key not configured. Set OPENAI_API_KEY in Script Properties.' };
    }

    try {
      let imageData = imageBase64;
      if (!imageData.startsWith('data:image')) {
        imageData = 'data:image/jpeg;base64,' + imageData;
      }

      Logger.log('ChatGPT processImage: calling API');

      const response = UrlFetchApp.fetch('https://api.openai.com/v1/chat/completions', {
        method: 'post',
        contentType: 'application/json',
        headers: { 'Authorization': 'Bearer ' + config.openaiApiKey },
        payload: JSON.stringify({
          model: CHATGPT_MODEL,
          messages: [{
            role: 'user',
            content: [
              { type: 'text', text: 'Extract all lab values from this image. Return as JSON: {"reportType":"CBC|BMP|CMP|LFT|COAGULATION|GENERAL","values":[{"test":"test name","value":"numeric value","unit":"unit","flag":"N|L|H"}]}' },
              { type: 'image_url', image_url: { url: imageData } }
            ]
          }],
          max_tokens: 4096
        }),
        muteHttpExceptions: true
      });

      const responseCode = response.getResponseCode();
      const responseText = response.getContentText();

      Logger.log('ChatGPT response code: ' + responseCode);

      if (responseCode !== 200) {
        Logger.log('ChatGPT error: ' + responseText.substring(0, 500));
        try {
          const err = JSON.parse(responseText);
          return { success: false, error: err.error?.message || 'API error ' + responseCode };
        } catch (e) {
          return { success: false, error: 'API error ' + responseCode };
        }
      }

      const result = JSON.parse(responseText);
      const content = result.choices?.[0]?.message?.content || '';

      let parsed = { values: [], reportType: 'GENERAL' };
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
      } catch(e) {
        Logger.log('JSON parse error: ' + e.toString());
      }

      return { success: true, values: parsed.values || [], reportType: parsed.reportType || 'GENERAL', rawText: content };
    } catch (e) {
      Logger.log('ChatGPT processImage error: ' + e.toString());
      return { success: false, error: e.toString() };
    }
  },

  consult: function(query, patientContext, labValues) {
    const config = getConfig();
    if (!config.openaiApiKey) {
      return { success: false, error: 'OpenAI API key not configured. Set OPENAI_API_KEY in Script Properties.' };
    }

    try {
      Logger.log('ChatGPT consult: calling API');

      const systemPrompt = `You are a medical AI assistant helping doctors with patient consultations. Be concise and evidence-based. Use medical terminology appropriately.`;

      const userMessage = `Patient: ${JSON.stringify(patientContext || {})}
Labs: ${JSON.stringify(labValues || [])}
Question: ${query}`;

      const response = UrlFetchApp.fetch('https://api.openai.com/v1/chat/completions', {
        method: 'post',
        contentType: 'application/json',
        headers: { 'Authorization': 'Bearer ' + config.openaiApiKey },
        payload: JSON.stringify({
          model: CHATGPT_MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
          ],
          max_tokens: 4096
        }),
        muteHttpExceptions: true
      });

      const responseCode = response.getResponseCode();
      const responseText = response.getContentText();

      Logger.log('ChatGPT consult response code: ' + responseCode);

      if (responseCode !== 200) {
        Logger.log('ChatGPT consult error: ' + responseText.substring(0, 500));
        try {
          const err = JSON.parse(responseText);
          return { success: false, error: err.error?.message || 'API error ' + responseCode };
        } catch (e) {
          return { success: false, error: 'API error ' + responseCode };
        }
      }

      const result = JSON.parse(responseText);
      return { success: true, response: result.choices?.[0]?.message?.content || '' };
    } catch (e) {
      Logger.log('ChatGPT consult error: ' + e.toString());
      return { success: false, error: e.toString() };
    }
  }
};

// Keep alias for backwards compatibility
const ClaudeService = ChatGPTService;

// ═══════════════════════════════════════════════════════════════════════════
// WEB APP HANDLERS
// ═══════════════════════════════════════════════════════════════════════════

function doGet(e) {
  const action = e?.parameter?.action;
  switch (action) {
    case 'test': return json(testSheetRead());
    case 'debug': return json(debugFullFlow());
    case 'sync': return json(SheetSync.pullFromSheet());
    case 'health': return json(healthCheck());
    case 'patients': return json({ patients: PatientService.getAll(), count: Object.keys(PatientService.getAll()).length });
    case 'testchatgpt':
    case 'testclaude': return json(testChatGPTAPI());
    default: return htmlPage();
  }
}

function doPost(e) {
  try {
    if (!e?.postData?.contents) return json({ success: false, error: 'No data received' });

    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    Logger.log('POST action: ' + action);

    switch (action) {
      case 'loadPatients':
        const pullResult = SheetSync.pullFromSheet();
        const allPatients = PatientService.getAll();
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
        
      case 'saveLabs': 
        return json(LabService.save(data.patientId, data.labData));
        
      case 'loadLabs': 
        return json(LabService.getLatest(data.patientId));
        
      case 'loadLabHistory': 
        return json(LabService.getHistory(data.patientId, data.limit));
        
      case 'loadNotice': 
        return json({ success: true, notice: NoticeService.get() });
        
      case 'saveNotice': 
        return json(NoticeService.save(data.notice?.text || data.text));
        
      case 'runOCR': 
        return json(OCRService.process(data.image));
        
      case 'claudeVision': 
        return json(ClaudeService.processImage(data.image));
        
      case 'claudeConsult': 
        return json(ClaudeService.consult(data.query, data.patientContext, data.labValues));
        
      case 'pullFromSheet':
      case 'syncSheet': 
        return json(SheetSync.pullFromSheet());
        
      case 'pushToSheet': 
        return json(SheetSync.pushToSheet(PatientService.getAll()));
        
      case 'test': 
        return json({ success: true, version: SCRIPT_VERSION });
        
      default: 
        return json({ success: false, error: 'Unknown action: ' + action });
    }
  } catch (e) {
    Logger.log('doPost error: ' + e.toString());
    return json({ success: false, error: e.toString() });
  }
}

function json(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

function healthCheck() {
  const config = getConfig();
  return {
    success: true,
    version: SCRIPT_VERSION,
    sheet: config.sheetName,
    hasOpenAIKey: !!config.openaiApiKey,
    keyLength: config.openaiApiKey ? config.openaiApiKey.length : 0
  };
}

function htmlPage() {
  const config = getConfig();
  return HtmlService.createHtmlOutput(`
    <html><head><title>Unit E API v${SCRIPT_VERSION}</title>
    <style>body{font-family:system-ui;max-width:600px;margin:40px auto;padding:20px}
    .btn{background:#15803d;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;margin:8px 8px 8px 0}
    .btn-blue{background:#2563eb}.btn-yellow{background:#ca8a04}
    .card{background:#f5f5f5;padding:16px;border-radius:8px;margin:16px 0}
    .ok{color:#16a34a}.err{color:#dc2626}</style></head>
    <body>
    <h1>🏥 Unit E API v${SCRIPT_VERSION}</h1>
    <div class="card">
      <strong>Sheet:</strong> ${config.sheetName}<br>
      <strong>ChatGPT API:</strong> <span class="${config.openaiApiKey ? 'ok' : 'err'}">${config.openaiApiKey ? '✅ Configured' : '❌ Not set'}</span>
    </div>
    <a class="btn" href="?action=sync">🔄 Sync</a>
    <a class="btn" href="?action=patients">👥 Patients</a><br>
    <a class="btn btn-blue" href="?action=debug">🔍 Debug</a>
    <a class="btn btn-blue" href="?action=test">🧪 Test</a><br>
    <a class="btn btn-yellow" href="?action=health">❤️ Health</a>
    <a class="btn btn-yellow" href="?action=testchatgpt">🤖 Test ChatGPT</a>
    </body></html>
  `);
}

// ═══════════════════════════════════════════════════════════════════════════
// TEST & DEBUG
// ═══════════════════════════════════════════════════════════════════════════

function testSheetRead() {
  const sheet = SheetSync.getSheet();
  if (!sheet) return { error: 'Sheet not found' };

  const config = getConfig();
  const lastRow = sheet.getLastRow();
  const sampleRows = Math.min(30, lastRow - config.dataStartRow + 1);
  if (sampleRows < 1) return { error: 'No data rows' };

  const data = sheet.getRange(config.dataStartRow, 1, sampleRows, 5).getValues();
  
  const annotated = data.map((row, idx) => {
    const colA = getCell(row, 0);
    const colB = getCell(row, 1);
    
    let type = 'unknown';
    if (!colA && !colB) type = 'empty';
    else if (isSectionHeader(colA)) type = 'SECTION';
    else if (isColumnHeader(colA, colB)) type = 'COLUMN_HEADER';
    else if (isWardHeader(colA, colB)) type = 'WARD';
    else if (colB) type = 'PATIENT';
    
    return {
      row: idx + config.dataStartRow,
      type,
      data: [getCell(row, 0), getCell(row, 1), getCell(row, 2), getCell(row, 3), getCell(row, 4)],
      rawA: row[0] instanceof Date ? '[DATE:' + row[0].toISOString() + ']' : row[0]
    };
  });

  return { sheetName: sheet.getName(), lastRow, dataStartRow: config.dataStartRow, annotatedRows: annotated };
}

function debugFullFlow() {
  const config = getConfig();
  const syncResult = SheetSync.pullFromSheet();
  const patients = PatientService.getAll();
  const ids = Object.keys(patients).slice(0, 10);

  return {
    version: SCRIPT_VERSION,
    config: {
      sheetName: config.sheetName,
      hasOpenAIKey: !!config.openaiApiKey,
      keyLength: config.openaiApiKey?.length || 0
    },
    syncResult: syncResult,
    patientCount: Object.keys(patients).length,
    samplePatients: ids.map(id => ({
      id,
      name: patients[id].name,
      ward: patients[id].ward,
      bed: patients[id].bed,
      status: patients[id].status
    }))
  };
}

function testChatGPTAPI() {
  const config = getConfig();
  if (!config.openaiApiKey) {
    return { success: false, error: 'OPENAI_API_KEY not set in Script Properties' };
  }

  try {
    const response = UrlFetchApp.fetch('https://api.openai.com/v1/chat/completions', {
      method: 'post',
      contentType: 'application/json',
      headers: { 'Authorization': 'Bearer ' + config.openaiApiKey },
      payload: JSON.stringify({
        model: CHATGPT_MODEL,
        max_tokens: 50,
        messages: [{ role: 'user', content: 'Say "API working" in 2 words.' }]
      }),
      muteHttpExceptions: true
    });

    const code = response.getResponseCode();
    const text = response.getContentText();

    if (code === 200) {
      const result = JSON.parse(text);
      return { success: true, response: result.choices?.[0]?.message?.content, model: CHATGPT_MODEL };
    }

    try {
      const err = JSON.parse(text);
      return { success: false, code, error: err.error?.message || text.substring(0, 200) };
    } catch (e) {
      return { success: false, code, error: text.substring(0, 200) };
    }
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

// Keep old function name for backwards compatibility
function testClaudeAPI() {
  return testChatGPTAPI();
}

function initialSetup() {
  DataStore.getFile('patients.json', {});
  DataStore.getFile('notice.json', { text: '' });
  const result = SheetSync.pullFromSheet();
  return { pullResult: result, patientCount: Object.keys(PatientService.getAll()).length };
}

function manualSync() {
  return SheetSync.pullFromSheet();
}
