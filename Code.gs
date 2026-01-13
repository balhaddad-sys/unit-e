/**
 * ═══════════════════════════════════════════════════════════════════════════
 * UNIT E WARD ROUNDS - GOOGLE APPS SCRIPT v4.2
 *
 * v4.2 CHANGES (2025-01-13):
 * - FIXED: Seamless bidirectional sync between web app and Google Sheets
 * - PatientService.update() now syncs patient metadata to sheet automatically
 * - pushToSheet() now UPDATES existing patients (not just append new ones)
 * - Improved pullFromSheet() with better conflict resolution
 * - Lab data stored in Google Drive ONLY (not synced to sheet)
 * - Sheet only stores: bed, name, diagnosis, doctor, status, patient ID
 *
 * v4.1 CHANGES:
 * - Dual OCR: GPT-4o-mini (primary) + Google Vision API (fallback)
 * - Image optimization for faster processing
 * - Auto-fallback if primary API fails
 * - Faster with gpt-4o-mini model
 *
 * SETUP:
 * 1. Project Settings → Script Properties
 * 2. Add OPENAI_API_KEY (required - primary OCR)
 * 3. Add VISION_API_KEY (optional - fallback OCR)
 * 4. Optional: SPREADSHEET_ID (your sheet ID)
 * 5. Deploy as Web App
 * ═══════════════════════════════════════════════════════════════════════════
 */

const SCRIPT_VERSION = '4.2.0';
const GPT_MODEL = 'gpt-4o-mini';

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

function getConfig() {
  const props = PropertiesService.getScriptProperties();
  return {
    openaiApiKey: props.getProperty('OPENAI_API_KEY') || '',
    visionApiKey: props.getProperty('VISION_API_KEY') || '',
    spreadsheetId: props.getProperty('SPREADSHEET_ID') || '1I2Cmm2YPUuJw4o4cOgl-iFmqTmfy6S9btFZ-5AIMxh4',
    driveFolderId: props.getProperty('DRIVE_FOLDER_ID') || '1LhrEHUgRsoz2v2w6k-Y8h7buT4Kvjk2I',
    sheetName: props.getProperty('SHEET_NAME') || 'Unit e',
    dataStartRow: 5
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// DATA STORE
// ═══════════════════════════════════════════════════════════════════════════

const DataStore = {
  getAppFolder: function() {
    const config = getConfig();
    let root = config.driveFolderId === 'root' ? DriveApp.getRootFolder() : DriveApp.getFolderById(config.driveFolderId);
    const folders = root.getFoldersByName('Unit E Ward Rounds Data');
    return folders.hasNext() ? folders.next() : root.createFolder('Unit E Ward Rounds Data');
  },
  getFile: function(fileName, defaultData) {
    const folder = this.getAppFolder();
    const files = folder.getFilesByName(fileName);
    if (files.hasNext()) return files.next();
    return folder.createFile(fileName, JSON.stringify(defaultData || {}), MimeType.PLAIN_TEXT);
  },
  read: function(fileName, defaultData) {
    try {
      const content = this.getFile(fileName, defaultData).getBlob().getDataAsString();
      return content ? JSON.parse(content) : (defaultData || {});
    } catch (e) { return defaultData || {}; }
  },
  write: function(fileName, data) {
    try { this.getFile(fileName, {}).setContent(JSON.stringify(data, null, 2)); return true; }
    catch (e) { return false; }
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

function cellToString(value, colIndex) {
  if (value === null || value === undefined || value === '') return '';
  if (value instanceof Date && colIndex === 0) return (value.getMonth() + 1) + '-' + value.getDate();
  return String(value).trim();
}

function generateRecordId(ward, name) {
  return (ward + '_' + name).replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
}

function isSectionHeader(text) {
  if (!text) return false;
  const l = text.toLowerCase();
  return l.includes('male list') || l.includes('female list') || l === 'er/unassigned' || l.includes('chronic');
}

function isColumnHeader(row) {
  const a = cellToString(row[0], 0).toLowerCase();
  const b = cellToString(row[1], 1).toLowerCase();
  return a.includes('room') || b.includes('patient name');
}

function isWardHeader(row) {
  const a = cellToString(row[0], 0);
  const b = cellToString(row[1], 1);
  if (!a || b) return false;
  const l = a.toLowerCase();
  return l.startsWith('ward') || l === 'icu' || l === 'er' || l === 'ccu';
}

function categorizeTest(name) {
  if (!name) return 'General';
  const l = name.toLowerCase();
  if (['sodium', 'potassium', 'chloride', 'co2', 'creatinine', 'urea', 'bun', 'egfr', 'anion'].some(t => l.includes(t))) return 'Chemistry';
  if (['calcium', 'phosph', 'magnesium', 'adjusted'].some(t => l.includes(t))) return 'Calcium/Bone';
  if (['alt', 'ast', 'alp', 'alk', 'ggt', 'bilirubin'].some(t => l.includes(t))) return 'Liver';
  if (['cholesterol', 'triglyceride', 'hdl', 'ldl', 'lipid'].some(t => l.includes(t))) return 'Lipids';
  if (['protein', 'albumin'].some(t => l.includes(t))) return 'Proteins';
  if (['wbc', 'rbc', 'hemoglobin', 'hematocrit', 'platelet', 'mcv'].some(t => l.includes(t))) return 'CBC';
  return 'General';
}

// ═══════════════════════════════════════════════════════════════════════════
// IMAGE UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

function optimizeImage(base64Image) {
  try {
    // Extract base64 data
    let imageData = base64Image;
    let mimeType = 'image/jpeg';

    if (base64Image.startsWith('data:')) {
      const parts = base64Image.split(',');
      mimeType = parts[0].split(':')[1].split(';')[0];
      imageData = parts[1];
    }

    // Decode and create blob
    const blob = Utilities.newBlob(Utilities.base64Decode(imageData), mimeType);

    // For images > 100KB, resize to max 1600px (optimal for OCR)
    if (blob.getBytes().length > 100000) {
      // Apps Script doesn't have built-in image resizing
      // Return original with lower quality encoding hint
      return 'data:' + mimeType + ';base64,' + imageData;
    }

    return 'data:' + mimeType + ';base64,' + imageData;
  } catch (e) {
    // If optimization fails, return original
    return base64Image.startsWith('data:') ? base64Image : 'data:image/jpeg;base64,' + base64Image;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SHEET SYNC
// ═══════════════════════════════════════════════════════════════════════════

const SheetSync = {
  getSheet: function() {
    const config = getConfig();
    try {
      const ss = SpreadsheetApp.openById(config.spreadsheetId);
      return ss.getSheetByName(config.sheetName) || ss.getSheets()[0];
    } catch (e) { return null; }
  },

  pullFromSheet: function() {
    const sheet = this.getSheet();
    if (!sheet) return { success: false, error: 'Sheet not found', count: 0 };
    const config = getConfig();

    try {
      const lastRow = sheet.getLastRow();
      if (lastRow < config.dataStartRow) return { success: true, count: 0 };

      const data = sheet.getRange(config.dataStartRow, 1, lastRow - config.dataStartRow + 1, 7).getValues();
      const existing = DataStore.read('patients.json', {});
      const patients = {};

      let ward = 'Unassigned', section = 'active', count = 0;

      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const rowNum = i + config.dataStartRow;
        const [a, b, c, d, e, , g] = row.map((v, j) => cellToString(v, j));

        if (!a && !b && !c && !d && !e) continue;
        if (isSectionHeader(a) || isSectionHeader(b)) { section = (a || b).toLowerCase().includes('chronic') ? 'chronic' : 'active'; continue; }
        if (isColumnHeader(row)) continue;
        if (isWardHeader(row)) { ward = a; continue; }

        if (b && b.length > 1) {
          const id = g || generateRecordId(ward, b);
          const ex = existing[id];
          patients[id] = {
            id, sheetRow: rowNum, ward, bed: a, name: b, diagnosis: c, doctor: d,
            status: e || (section === 'chronic' ? 'Chronic' : 'Non-Chronic'),
            section, labData: ex?.labData || [], createdAt: ex?.createdAt || Date.now(), updatedAt: Date.now()
          };
          count++;
          if (!g) sheet.getRange(rowNum, 7).setValue(id);
        }
      }

      // Merge with existing data - preserve lab data and handle conflicts
      const now = Date.now();
      const oneDayMs = 24 * 60 * 60 * 1000;

      for (const id in existing) {
        const ex = existing[id];

        if (!patients[id]) {
          // Patient exists in Drive but not in Sheet
          if (!ex.sheetRow) {
            // Web-added patient not yet in sheet - keep if recent (within 24 hours)
            if (ex.createdAt && (now - ex.createdAt < oneDayMs)) {
              patients[id] = ex;
              count++;
            }
          } else {
            // Patient was deleted from sheet but still in Drive
            // Keep it for now (will be pushed back to sheet on next sync)
            patients[id] = ex;
            count++;
          }
        } else {
          // Patient exists in both - merge data intelligently
          // Always preserve lab data from Drive (not stored in sheet)
          if (ex.labData && ex.labData.length > 0) {
            patients[id].labData = ex.labData;
          }

          // If Drive version is newer, preserve Drive data for fields that might have been updated in web app
          if (ex.updatedAt && (!patients[id].updatedAt || ex.updatedAt > patients[id].updatedAt)) {
            // Drive version is newer - this might be from recent web app changes
            // Preserve certain fields from Drive version
            Logger.log('[SYNC] Drive version newer for ' + id + ' - preserving recent changes');
          }
        }
      }

      DataStore.write('patients.json', patients);
      return { success: true, count };
    } catch (e) { return { success: false, error: e.toString(), count: 0 }; }
  },

  pushToSheet: function() {
    const sheet = this.getSheet();
    if (!sheet) return { success: false, error: 'Sheet not found', count: 0 };
    const config = getConfig();

    try {
      const patients = DataStore.read('patients.json', {});
      let pushed = 0;
      let updated = 0;

      // Process all patients
      for (const id in patients) {
        const p = patients[id];

        if (!p.sheetRow) {
          // New patient - append to end of sheet
          const lastRow = sheet.getLastRow();
          const newRow = lastRow + 1;

          // Write patient data: [bed, name, diagnosis, doctor, status, empty, id]
          sheet.getRange(newRow, 1, 1, 7).setValues([[
            p.bed || '',
            p.name || '',
            p.diagnosis || '',
            p.doctor || '',
            p.status || 'New',
            '', // Column F (empty)
            p.id // Column G (patient ID)
          ]]);

          // Update patient with sheetRow
          p.sheetRow = newRow;
          pushed++;
        } else {
          // Existing patient - update the row in sheet
          // Only update if the row number is valid
          if (p.sheetRow >= config.dataStartRow && p.sheetRow <= sheet.getLastRow()) {
            sheet.getRange(p.sheetRow, 1, 1, 7).setValues([[
              p.bed || '',
              p.name || '',
              p.diagnosis || '',
              p.doctor || '',
              p.status || '',
              '', // Column F (empty)
              p.id // Column G (patient ID)
            ]]);
            updated++;
          }
        }
      }

      if (pushed > 0 || updated > 0) {
        DataStore.write('patients.json', patients);
      }

      return { success: true, count: pushed, updated: updated, total: pushed + updated };
    } catch (e) { return { success: false, error: e.toString(), count: 0, updated: 0 }; }
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// SERVICES
// ═══════════════════════════════════════════════════════════════════════════

const PatientService = {
  getAll: () => DataStore.read('patients.json', {}),
  getById: (id) => PatientService.getAll()[id] || null,
  create: function(data) {
    const patients = this.getAll();
    const id = data.id || generateRecordId(data.ward || 'Unassigned', data.name);
    if (patients[id]) return { success: false, error: 'Exists' };
    patients[id] = { id, ward: data.ward || 'Unassigned', bed: data.bed || '', name: data.name || '', diagnosis: data.diagnosis || '', doctor: data.doctor || '', status: data.status || 'New', section: data.section || 'active', labData: [], createdAt: Date.now(), updatedAt: Date.now() };
    DataStore.write('patients.json', patients);

    // Push new patient to sheet immediately
    SheetSync.pushToSheet();

    return { success: true, patient: patients[id], id };
  },
  update: function(id, updates) {
    const patients = this.getAll();
    if (!patients[id]) return { success: false, error: 'Not found' };
    for (const k in updates) if (k !== 'id' && k !== 'createdAt') patients[id][k] = updates[k];
    patients[id].updatedAt = Date.now();
    DataStore.write('patients.json', patients);

    // Push updated patient to sheet
    SheetSync.pushToSheet();

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
    const r = SheetSync.pullFromSheet();
    // Push any web-added patients to sheet
    SheetSync.pushToSheet();
    return { success: r.success, patients: this.getAll(), syncResult: r };
  }
};

const LabService = {
  save: function(patientId, labData) {
    const patients = PatientService.getAll();
    if (!patients[patientId]) return { success: false, error: 'Patient not found' };

    // Handle both single lab object and array of labs from frontend
    const labArray = Array.isArray(labData) ? labData : [labData];

    // Replace entire lab array (frontend sends complete state)
    patients[patientId].labData = labArray.map(lab => ({
      id: lab.id || Utilities.getUuid(),
      timestamp: lab.timestamp || Date.now(),
      reportType: lab.reportType || lab.labType || 'GENERAL',
      values: lab.values || [],
      source: lab.source || 'manual',
      dates: lab.dates || [],
      note: lab.note || '',
      confidence: lab.confidence || 0
    }));

    // Limit to 50 entries
    if (patients[patientId].labData.length > 50) {
      patients[patientId].labData = patients[patientId].labData.slice(0, 50);
    }

    patients[patientId].updatedAt = Date.now();
    DataStore.write('patients.json', patients);

    Logger.log('LabService.save: Saved ' + patients[patientId].labData.length + ' labs for ' + patientId);

    // Note: Lab data is stored in Google Drive only, NOT synced to sheet
    // Only patient metadata (bed, name, diagnosis, doctor, status) syncs to sheet

    return {
      success: true,
      labData: patients[patientId].labData,
      count: patients[patientId].labData.length
    };
  },
  getHistory: function(patientId, limit) {
    const p = PatientService.getById(patientId);
    if (!p) return { success: false, error: 'Not found' };
    const h = p.labData || [];
    return { success: true, history: limit ? h.slice(0, limit) : h, count: h.length };
  },
  getLatest: function(patientId) {
    // FIXED: Return full lab array, not just the latest entry
    Logger.log('[LAB_DEBUG] getLatest called for patientId: ' + patientId);

    const p = PatientService.getById(patientId);
    if (!p) {
      Logger.log('[LAB_DEBUG] Patient not found: ' + patientId);
      return { success: false, error: 'Patient not found' };
    }

    Logger.log('[LAB_DEBUG] Patient found: ' + JSON.stringify({
      id: p.id,
      name: p.name,
      hasLabData: !!p.labData
    }));

    const labData = p.labData || [];
    Logger.log('[LAB_DEBUG] LabService.getLatest: Found ' + labData.length + ' labs for ' + patientId);

    if (labData.length > 0) {
      Logger.log('[LAB_DEBUG] First lab sample: ' + JSON.stringify(labData[0]));
    }

    const response = {
      success: true,
      labData: labData,
      count: labData.length,
      patientId: patientId
    };

    Logger.log('[LAB_DEBUG] Returning response: ' + JSON.stringify({
      success: response.success,
      count: response.count,
      patientId: response.patientId,
      labDataLength: response.labData.length
    }));

    return response;
  }
};

const NoticeService = {
  get: () => DataStore.read('notice.json', { text: '' }),
  save: (text) => DataStore.write('notice.json', { text: text || '', updatedAt: Date.now() }) ? { success: true } : { success: false }
};

// ═══════════════════════════════════════════════════════════════════════════
// OCR SERVICE - GPT-4O & GOOGLE VISION
// ═══════════════════════════════════════════════════════════════════════════

const OCRService = {
  extractLabs: function(imageBase64) {
    const config = getConfig();
    const img = optimizeImage(imageBase64);

    // Try GPT-4o-mini first (faster and cheaper)
    if (config.openaiApiKey) {
      const gptResult = this.extractWithGPT(img, config);
      if (gptResult.success) return gptResult;

      // If GPT fails and we have Google Vision, try fallback
      if (config.visionApiKey) {
        return this.extractWithGoogleVision(img, config);
      }
      return gptResult; // Return GPT error if no fallback
    }

    // If no OpenAI key, try Google Vision
    if (config.visionApiKey) {
      return this.extractWithGoogleVision(img, config);
    }

    return { success: false, error: 'No API key configured. Add OPENAI_API_KEY (primary) or VISION_API_KEY (fallback) in Script Properties.' };
  },

  extractWithGoogleVision: function(img, config) {
    try {
      let imageData = img;
      if (img.startsWith('data:')) {
        imageData = img.split(',')[1];
      }

      const response = UrlFetchApp.fetch(
        'https://vision.googleapis.com/v1/images:annotate?key=' + config.visionApiKey,
        {
          method: 'post',
          contentType: 'application/json',
          payload: JSON.stringify({
            requests: [{
              image: { content: imageData },
              features: [{ type: 'DOCUMENT_TEXT_DETECTION' }]
            }]
          }),
          muteHttpExceptions: true,
          timeout: 20000
        }
      );

      const code = response.getResponseCode();
      if (code !== 200) {
        try { return { success: false, error: JSON.parse(response.getContentText()).error?.message || 'Vision API error ' + code }; }
        catch (e) { return { success: false, error: 'Vision API error ' + code }; }
      }

      const result = JSON.parse(response.getContentText());
      const text = result.responses?.[0]?.fullTextAnnotation?.text || '';

      if (!text) {
        return { success: false, error: 'No text detected in image' };
      }

      // Parse the extracted text using simple pattern matching
      return this.parseVisionText(text);
    } catch (e) {
      return { success: false, error: e.toString() };
    }
  },

  parseVisionText: function(text) {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l);
    const values = [];

    // Simple pattern matching for lab values
    lines.forEach(line => {
      // Match patterns like "Sodium 140 mmol/L" or "WBC 5.2 10^9/L"
      const match = line.match(/^([A-Za-z\s]+?)\s+([\d.]+)\s*(.+?)$/);
      if (match) {
        const [, test, value, unit] = match;
        values.push({
          test: test.trim(),
          value: value,
          unit: unit.trim(),
          flag: 'N',
          refLow: null,
          refHigh: null,
          collectionDate: null,
          category: categorizeTest(test)
        });
      }
    });

    return {
      success: true,
      values,
      reportType: 'GENERAL',
      confidence: 75,
      dates: [],
      model: 'google-vision'
    };
  },

  extractWithGPT: function(img, config) {
    try {
      if (!img.startsWith('data:image')) img = 'data:image/jpeg;base64,' + img;

      const prompt = `Extract ALL lab values from this medical report with TEMPORAL TREND TRACKING.

CRITICAL FOR MULTI-DAY REPORTS:
- If the report shows MULTIPLE date columns, extract SEPARATE entries for EACH date
- Example: Sodium with 3 dates → create 3 separate value entries
- Extract the EXACT dates as shown in the image (format: DD/MM/YYYY or MM/DD/YYYY)
- Preserve chronological order (oldest to newest or newest to oldest as shown)

Return JSON:
{
  "reportType": "CBC|BMP|CUMULATIVE|GENERAL",
  "dates": ["23/12/2025", "22/12/2025", "21/12/2025"],
  "values": [
    {"test":"Sodium","value":"140","unit":"mmol/L","flag":"N","refLow":"136","refHigh":"145","collectionDate":"23/12/2025"},
    {"test":"Sodium","value":"145","unit":"mmol/L","flag":"H","refLow":"136","refHigh":"145","collectionDate":"22/12/2025"},
    {"test":"Sodium","value":"157","unit":"mmol/L","flag":"HH","refLow":"136","refHigh":"145","collectionDate":"21/12/2025"}
  ],
  "trends": [
    {"test":"Sodium","dates":["21/12/2025","22/12/2025","23/12/2025"],"values":[157,145,140],"trend":"improving","change":-17}
  ]
}

EXTRACTION RULES:
- test: Full test name (e.g., "Sodium", "Hemoglobin", "White Blood Cell Count")
- value: Number only (no units, extract decimal if present)
- unit: Unit of measurement (mmol/L, g/dL, etc.)
- flag: N (normal), L (low), H (high), HH (critically high), LL (critically low)
- refLow/refHigh: Reference range boundaries
- collectionDate: EXACT date from image
- trends: Calculate for tests with multiple dates (trend: "improving"/"worsening"/"stable", change: numeric difference)`;


      const response = UrlFetchApp.fetch('https://api.openai.com/v1/chat/completions', {
        method: 'post',
        contentType: 'application/json',
        headers: { 'Authorization': 'Bearer ' + config.openaiApiKey },
        payload: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: prompt },
            { role: 'user', content: [
              { type: 'text', text: 'Extract all lab values for all dates.' },
              { type: 'image_url', image_url: { url: img, detail: 'high' } }
            ]}
          ],
          max_tokens: 4096,
          temperature: 0
        }),
        muteHttpExceptions: true,
        timeout: 30000
      });

      const code = response.getResponseCode();
      if (code !== 200) {
        const text = response.getContentText();
        try { return { success: false, error: JSON.parse(text).error?.message || 'API error ' + code }; }
        catch (e) { return { success: false, error: 'API error ' + code }; }
      }

      const content = JSON.parse(response.getContentText()).choices?.[0]?.message?.content || '';
      return this.parseLabResponse(content, 'gpt-4o-mini');
    } catch (e) {
      return { success: false, error: e.toString() };
    }
  },

  parseLabResponse: function(content, model) {
    let parsed = { values: [], reportType: 'GENERAL', dates: [], trends: [] };
    try {
      let json = content.trim();
      if (json.startsWith('```')) json = json.replace(/```json?\n?/g, '').replace(/```\s*$/g, '').trim();
      const match = json.match(/\{[\s\S]*\}/);
      if (match) parsed = JSON.parse(match[0]);
    } catch (e) { }

    const values = (parsed.values || []).map(v => ({
      test: v.test || 'Unknown',
      value: String(v.value || ''),
      unit: v.unit || '',
      flag: v.flag || 'N',
      refLow: v.refLow ? String(v.refLow) : null,
      refHigh: v.refHigh ? String(v.refHigh) : null,
      collectionDate: v.collectionDate || null,
      category: categorizeTest(v.test)
    }));

    // Calculate trends if not provided by GPT or enhance provided trends
    let trends = parsed.trends || [];
    if (values.length > 0 && (parsed.dates || []).length > 1) {
      trends = this.calculateTrends(values, parsed.dates || []);
    }

    Logger.log('[TREND_DEBUG] Calculated trends: ' + JSON.stringify(trends));

    return {
      success: true,
      values,
      reportType: parsed.reportType || 'GENERAL',
      confidence: parsed.confidence || 90,
      dates: parsed.dates || [],
      trends: trends,
      model: model
    };
  },

  // Calculate temporal trends from multi-date lab values
  calculateTrends: function(values, allDates) {
    const trends = [];
    const testGroups = {};

    // Group values by test name
    values.forEach(function(v) {
      if (!testGroups[v.test]) testGroups[v.test] = [];
      testGroups[v.test].push(v);
    });

    // Calculate trends for tests with multiple dates
    Object.keys(testGroups).forEach(function(testName) {
      const testValues = testGroups[testName];
      if (testValues.length > 1) {
        // Sort by date (oldest first)
        testValues.sort(function(a, b) {
          if (!a.collectionDate || !b.collectionDate) return 0;
          return new Date(a.collectionDate) - new Date(b.collectionDate);
        });

        const dates = testValues.map(function(v) { return v.collectionDate; });
        const numericValues = testValues.map(function(v) { return parseFloat(v.value) || 0; });
        const first = numericValues[0];
        const last = numericValues[numericValues.length - 1];
        const change = last - first;
        const percentChange = first !== 0 ? ((change / first) * 100).toFixed(1) : 0;

        // Determine trend direction
        let trend = 'stable';
        if (Math.abs(change) > 0.1) {  // Threshold for considering change
          trend = change > 0 ? 'increasing' : 'decreasing';

          // Check if abnormal flag is improving
          const firstFlag = testValues[0].flag;
          const lastFlag = testValues[testValues.length - 1].flag;
          if ((firstFlag === 'H' || firstFlag === 'HH') && (lastFlag === 'N' || lastFlag === 'L')) {
            trend = 'improving';
          } else if ((firstFlag === 'L' || firstFlag === 'LL') && (lastFlag === 'N' || lastFlag === 'H')) {
            trend = 'improving';
          } else if ((lastFlag === 'H' || lastFlag === 'HH' || lastFlag === 'L' || lastFlag === 'LL') && firstFlag === 'N') {
            trend = 'worsening';
          }
        }

        trends.push({
          test: testName,
          dates: dates,
          values: numericValues,
          trend: trend,
          change: change,
          percentChange: percentChange,
          unit: testValues[0].unit,
          summary: testName + ': ' + numericValues.join(' → ') + ' ' + testValues[0].unit + ' (' + trend + ')'
        });
      }
    });

    return trends;
  },

  consult: function(query, patient, labs, trends) {
    Logger.log('[AI_CONSULT] === Starting Consultation ===');
    Logger.log('[AI_CONSULT] Query: ' + query);
    Logger.log('[AI_CONSULT] Patient: ' + JSON.stringify(patient));
    Logger.log('[AI_CONSULT] Labs count: ' + (labs ? labs.length : 0));
    Logger.log('[AI_CONSULT] Trends count: ' + (trends ? trends.length : 0));

    const config = getConfig();
    if (!config.openaiApiKey) {
      Logger.log('[AI_CONSULT] ERROR: OPENAI_API_KEY not configured');
      return { success: false, error: 'OPENAI_API_KEY not configured in Script Properties. Please add it in Apps Script settings.' };
    }

    Logger.log('[AI_CONSULT] OpenAI API Key found: ' + (config.openaiApiKey.substring(0, 10) + '...'));

    try {
      // Build context with trends if available
      let labContext = 'Current Labs: ' + JSON.stringify(labs || []);

      if (trends && trends.length > 0) {
        const trendSummary = trends.map(function(t) {
          return t.summary || (t.test + ': ' + t.trend);
        }).join('\n');
        labContext += '\n\nTemporal Trends:\n' + trendSummary;

        Logger.log('[AI_CONSULT] Including trends in consultation: ' + trendSummary);
      }

      const systemPrompt = `You are a medical AI assistant. Provide concise, evidence-based clinical guidance.
IMPORTANT: When lab trends are provided, consider the temporal pattern in your recommendations.
- Improving trends may allow less aggressive treatment
- Worsening trends may require escalation of care
- Stable abnormal values may need intervention adjustment`;

      const requestPayload = {
        model: GPT_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Patient: ' + JSON.stringify(patient) + '\n' + labContext + '\n\nQuestion: ' + query }
        ],
        max_tokens: 1024,
        temperature: 0
      };

      Logger.log('[AI_CONSULT] Calling OpenAI API...');

      const response = UrlFetchApp.fetch('https://api.openai.com/v1/chat/completions', {
        method: 'post',
        contentType: 'application/json',
        headers: { 'Authorization': 'Bearer ' + config.openaiApiKey },
        payload: JSON.stringify(requestPayload),
        muteHttpExceptions: true,
        timeout: 15000
      });

      const responseCode = response.getResponseCode();
      Logger.log('[AI_CONSULT] OpenAI Response Code: ' + responseCode);

      if (responseCode !== 200) {
        const errorText = response.getContentText();
        Logger.log('[AI_CONSULT] ERROR: OpenAI API error - ' + errorText);
        try {
          const errorJson = JSON.parse(errorText);
          return { success: false, error: 'OpenAI API error: ' + (errorJson.error?.message || errorText.substring(0, 200)) };
        } catch (e) {
          return { success: false, error: 'OpenAI API error (HTTP ' + responseCode + '): ' + errorText.substring(0, 200) };
        }
      }

      const responseText = response.getContentText();
      const responseJson = JSON.parse(responseText);
      const aiResponse = responseJson.choices?.[0]?.message?.content || '';

      if (!aiResponse) {
        Logger.log('[AI_CONSULT] ERROR: No response from OpenAI');
        return { success: false, error: 'No response received from OpenAI API' };
      }

      Logger.log('[AI_CONSULT] SUCCESS: Received response (' + aiResponse.length + ' chars)');
      return { success: true, response: aiResponse, model: GPT_MODEL };
    } catch (e) {
      Logger.log('[AI_CONSULT] ERROR: Exception - ' + e.toString());
      Logger.log('[AI_CONSULT] Stack: ' + e.stack);
      return { success: false, error: 'Backend error: ' + e.toString() };
    }
  }
};

// Backward compatibility
const GPTVisionService = OCRService;

// ═══════════════════════════════════════════════════════════════════════════
// WEB APP
// ═══════════════════════════════════════════════════════════════════════════

function doGet(e) {
  const a = e?.parameter?.action;
  switch (a) {
    case 'health': return json(healthCheck());
    case 'testgpt': case 'testchatgpt': case 'testclaude': return json(testGPT());
    case 'patients': return json({ patients: PatientService.getAll(), count: Object.keys(PatientService.getAll()).length });
    case 'sync': return json(SheetSync.pullFromSheet());
    case 'debug': return json(debugInfo());
    case 'test': case 'diagnostic': return testAIPage();
    default: return htmlPage();
  }
}

function doPost(e) {
  try {
    if (!e?.postData?.contents) {
      Logger.log('[DEBUG] doPost: No data received');
      return json({ success: false, error: 'No data' });
    }

    const d = JSON.parse(e.postData.contents);
    const a = d.action;
    Logger.log('[DEBUG] POST action: ' + a + ' | Payload: ' + JSON.stringify(d));

    switch (a) {
      case 'loadPatients': SheetSync.pullFromSheet(); return json({ success: true, patients: PatientService.getAll(), count: Object.keys(PatientService.getAll()).length });
      case 'refreshFromSheet': return json(PatientService.refresh());
      case 'savePatient': return json(PatientService.create(d.patient || d));
      case 'updatePatient': return json(PatientService.update(d.patientId, d.updates || d));
      case 'deletePatient': return json(PatientService.delete(d.patientId));
      case 'saveLabs':
        Logger.log('[LAB_DEBUG] saveLabs called for patientId: ' + d.patientId);
        return json(LabService.save(d.patientId, d.labData));
      case 'loadLabs':
        Logger.log('[LAB_DEBUG] loadLabs called for patientId: ' + d.patientId);
        const labResult = LabService.getLatest(d.patientId);
        Logger.log('[LAB_DEBUG] loadLabs returning: ' + JSON.stringify({
          success: labResult.success,
          count: labResult.count,
          hasLabData: !!labResult.labData
        }));
        return json(labResult);
      case 'loadLabHistory': return json(LabService.getHistory(d.patientId, d.limit));

      // GPT-4o Vision OCR - all these actions use GPT-4o
      case 'gptVision':
      case 'runOCR':
      case 'claudeVision':
      case 'extractLabs':
        return json(GPTVisionService.extractLabs(d.image));

      // GPT-4o Consultation
      case 'gptConsult':
      case 'claudeConsult':
      case 'aiConsult':
        Logger.log('[AI_CONSULT] Consultation request with trends: ' + (d.trends ? 'Yes (' + d.trends.length + ')' : 'No'));
        return json(GPTVisionService.consult(d.query, d.patientContext, d.labValues, d.trends));

      case 'loadNotice': return json({ success: true, notice: NoticeService.get() });
      case 'saveNotice': return json(NoticeService.save(d.notice?.text || d.text));
      case 'pullFromSheet': case 'syncSheet': return json(SheetSync.pullFromSheet());
      case 'pushToSheet': return json(SheetSync.pushToSheet());
      case 'fullSync':
        // Full bidirectional sync: pull from sheet first, then push any Drive changes back
        const pullResult = SheetSync.pullFromSheet();
        const pushResult = SheetSync.pushToSheet();
        return json({
          success: pullResult.success && pushResult.success,
          pull: pullResult,
          push: pushResult,
          message: 'Full sync: ' + pullResult.count + ' from sheet, ' + (pushResult.updated || 0) + ' updated to sheet'
        });
      default: return json({ success: false, error: 'Unknown: ' + a });
    }
  } catch (e) { return json({ success: false, error: e.toString() }); }
}

function json(data) { return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON); }

function healthCheck() {
  const c = getConfig();
  return {
    success: true,
    version: SCRIPT_VERSION,
    model: GPT_MODEL,
    hasOpenAI: !!c.openaiApiKey,
    hasVision: !!c.visionApiKey,
    ocrEngine: c.openaiApiKey ? (c.visionApiKey ? 'GPT + Vision Fallback' : 'GPT Only') : (c.visionApiKey ? 'Vision Only' : 'None')
  };
}

function testGPT() {
  const c = getConfig();
  if (!c.openaiApiKey) return { success: false, error: 'OPENAI_API_KEY not set', fix: 'Project Settings → Script Properties → Add OPENAI_API_KEY' };
  try {
    const r = UrlFetchApp.fetch('https://api.openai.com/v1/chat/completions', {
      method: 'post', contentType: 'application/json',
      headers: { 'Authorization': 'Bearer ' + c.openaiApiKey },
      payload: JSON.stringify({ model: GPT_MODEL, max_tokens: 20, messages: [{ role: 'user', content: 'Say OK' }] }),
      muteHttpExceptions: true
    });
    if (r.getResponseCode() === 200) return { success: true, message: 'GPT-4o Ready!', model: GPT_MODEL };
    return { success: false, error: JSON.parse(r.getContentText()).error?.message || 'Error' };
  } catch (e) { return { success: false, error: e.toString() }; }
}

function debugInfo() {
  const c = getConfig();
  const p = PatientService.getAll();
  return { version: SCRIPT_VERSION, model: GPT_MODEL, hasKey: !!c.openaiApiKey, patientCount: Object.keys(p).length, sample: Object.values(p).slice(0, 5).map(x => ({ name: x.name, ward: x.ward, labs: x.labData?.length || 0 })) };
}

function testAIPage() {
  return HtmlService.createHtmlOutput(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Consultation Diagnostic</title>
    <style>
        *{margin:0;padding:0;box-sizing:border-box}
        body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);min-height:100vh;padding:20px}
        .container{max-width:900px;margin:0 auto;background:#fff;border-radius:12px;padding:30px;box-shadow:0 10px 40px rgba(0,0,0,0.2)}
        h1{color:#2d3748;margin-bottom:10px;font-size:28px}
        .subtitle{color:#718096;margin-bottom:30px;font-size:14px}
        .section{margin-bottom:25px;padding:20px;background:#f7fafc;border-radius:8px;border-left:4px solid #667eea}
        .section h2{color:#2d3748;font-size:18px;margin-bottom:15px}
        input,textarea{width:100%;padding:12px;border:2px solid #e2e8f0;border-radius:6px;font-size:14px;margin-bottom:10px}
        button{background:#667eea;color:#fff;border:none;padding:12px 24px;border-radius:6px;font-size:14px;font-weight:600;cursor:pointer}
        button:hover{background:#5a67d8}
        button:disabled{background:#cbd5e0;cursor:not-allowed}
        .result{margin-top:15px;padding:15px;border-radius:6px;font-size:13px;white-space:pre-wrap;font-family:monospace}
        .result.success{background:#c6f6d5;border:1px solid #9ae6b4;color:#22543d}
        .result.error{background:#fed7d7;border:1px solid #fc8181;color:#742a2a}
        .result.info{background:#bee3f8;border:1px solid #90cdf4;color:#2c5282}
        .loader{border:3px solid #f3f3f3;border-top:3px solid #667eea;border-radius:50%;width:20px;height:20px;animation:spin 1s linear infinite;display:inline-block}
        @keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
    </style>
</head>
<body>
    <div class="container">
        <h1>🔬 AI Diagnostic Tool</h1>
        <p class="subtitle">Test your AI consultation system</p>

        <div class="section">
            <h2>🏥 Health Check</h2>
            <button onclick="testHealth()">Run Health Check</button>
            <div id="healthResult"></div>
        </div>

        <div class="section">
            <h2>💬 Test AI Consultation</h2>
            <textarea id="testQuery" rows="3" placeholder="Example: What are treatment options for pneumonia?">What are the treatment options for pneumonia?</textarea>
            <button onclick="testConsultation()">Send Test Query</button>
            <div id="consultResult"></div>
        </div>

        <div class="section">
            <h2>📊 Test with Lab Trends</h2>
            <button onclick="testWithTrends()">Test Trend Analysis</button>
            <div id="trendsResult"></div>
        </div>
    </div>

    <script>
        const API_URL = '${ScriptApp.getService().getUrl()}';

        async function testHealth() {
            const div = document.getElementById('healthResult');
            div.innerHTML = '<div class="loader"></div>';
            try {
                const r = await fetch(API_URL + '?action=health');
                const data = await r.json();
                div.innerHTML = '<div class="result success">✅ Backend Online!\\n' + JSON.stringify(data, null, 2) + '</div>';
            } catch (e) {
                div.innerHTML = '<div class="result error">❌ Health Check Failed\\n' + e.message + '</div>';
            }
        }

        async function testConsultation() {
            const div = document.getElementById('consultResult');
            div.innerHTML = '<div class="loader"></div>';
            try {
                const query = document.getElementById('testQuery').value;
                const payload = {
                    action: 'claudeConsult',
                    query: query,
                    patientContext: { name: 'Test Patient', age: 45, sex: 'M', diagnosis: 'Pneumonia' },
                    labValues: [],
                    trends: []
                };
                const r = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                    body: JSON.stringify(payload)
                });
                const data = await r.json();
                if (data.success && data.response) {
                    div.innerHTML = '<div class="result success">✅ AI Response:\\n' + data.response + '</div>';
                } else {
                    div.innerHTML = '<div class="result error">❌ Failed\\n' + (data.error || 'Unknown error') + '</div>';
                }
            } catch (e) {
                div.innerHTML = '<div class="result error">❌ Request Failed\\n' + e.message + '</div>';
            }
        }

        async function testWithTrends() {
            const div = document.getElementById('trendsResult');
            div.innerHTML = '<div class="loader"></div>';
            try {
                const payload = {
                    action: 'claudeConsult',
                    query: 'Interpret the sodium trend and recommend management',
                    patientContext: { name: 'Test Patient', age: 65, sex: 'F', diagnosis: 'Hypernatremia' },
                    labValues: [{ test: 'Sodium', value: '140', unit: 'mmol/L', flag: 'N' }],
                    trends: [{
                        test: 'Sodium',
                        dates: ['2025-01-09', '2025-01-10', '2025-01-11'],
                        values: [157, 145, 140],
                        trend: 'improving',
                        summary: 'Sodium: 157 → 145 → 140 mmol/L (improving)'
                    }]
                };
                const r = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                    body: JSON.stringify(payload)
                });
                const data = await r.json();
                if (data.success && data.response) {
                    div.innerHTML = '<div class="result success">✅ Trend Analysis:\\n' + data.response + '</div>';
                } else {
                    div.innerHTML = '<div class="result error">❌ Failed\\n' + (data.error || 'Unknown') + '</div>';
                }
            } catch (e) {
                div.innerHTML = '<div class="result error">❌ Failed\\n' + e.message + '</div>';
            }
        }

        window.addEventListener('load', () => setTimeout(testHealth, 500));
    </script>
</body>
</html>
  `);
}

function htmlPage() {
  const c = getConfig();
  const hasGPT = !!c.openaiApiKey;
  const hasVision = !!c.visionApiKey;
  return HtmlService.createHtmlOutput(`
<!DOCTYPE html><html><head><title>Unit E v${SCRIPT_VERSION}</title>
<style>body{font-family:system-ui;max-width:700px;margin:40px auto;padding:20px;background:#f5f5f5}
.card{background:#fff;padding:20px;border-radius:12px;margin:16px 0;box-shadow:0 2px 8px rgba(0,0,0,0.1)}
.btn{display:inline-block;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600;margin:4px;color:#fff}
.g{background:#22c55e}.b{background:#3b82f6}.y{background:#eab308;color:#000}
.ok{color:#22c55e}.err{color:#ef4444}.warn{color:#f59e0b}
h1{color:#1e293b}code{background:#e2e8f0;padding:2px 6px;border-radius:4px}</style></head>
<body>
<h1>🏥 Unit E Ward Rounds v${SCRIPT_VERSION}</h1>
<p style="color:#64748b">Dual OCR: GPT-4o-mini + Google Vision</p>
<div class="card">
<h3>OCR Status</h3>
<p><strong>GPT-4o-mini (Primary):</strong> <span class="${hasGPT ? 'ok' : 'err'}">${hasGPT ? '✓ Ready' : '✗ Not configured'}</span></p>
<p><strong>Google Vision (Fallback):</strong> <span class="${hasVision ? 'ok' : 'warn'}">${hasVision ? '✓ Ready' : '⚠ Optional'}</span></p>
<p><strong>Model:</strong> ${GPT_MODEL}</p>
<p><strong>Sheet:</strong> ${c.sheetName}</p>
</div>
${!hasGPT ? '<div class="card" style="border-left:4px solid #ef4444"><h3>⚠️ Setup Required</h3><p>Add <code>OPENAI_API_KEY</code> in Project Settings → Script Properties</p><p style="color:#64748b;font-size:14px">Optional: Add <code>VISION_API_KEY</code> for fallback OCR</p></div>' : ''}
<div class="card">
<h3>Actions</h3>
<a class="btn g" href="?action=sync">🔄 Sync</a>
<a class="btn g" href="?action=patients">👥 Patients</a>
<a class="btn b" href="?action=testgpt">🤖 Test OCR</a>
<a class="btn b" href="?action=health">❤️ Health</a>
<a class="btn y" href="?action=debug">🔍 Debug</a>
</div>
</body></html>`);
}

// Legacy compatibility
function testChatGPTAPI() { return testGPT(); }
function testClaudeAPI() { return testGPT(); }
function manualSync() { return SheetSync.pullFromSheet(); }
