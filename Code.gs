/**
 * ═══════════════════════════════════════════════════════════════════════════
 * UNIT E WARD ROUNDS - GOOGLE APPS SCRIPT v4.0
 *
 * v4.0 CHANGES:
 * - GPT-4o Vision is THE ONLY OCR method
 * - Removed all Claude references
 * - Smart sync preserves patients and lab data
 * - Hidden timestamp columns for tracking
 *
 * SETUP:
 * 1. Project Settings → Script Properties
 * 2. Add: OPENAI_API_KEY (required)
 * 3. Add: SPREADSHEET_ID (your sheet ID)
 * 4. Deploy as Web App
 * ═══════════════════════════════════════════════════════════════════════════
 */

const SCRIPT_VERSION = '4.0.0';
const GPT_MODEL = 'gpt-4o';

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

function getConfig() {
  const props = PropertiesService.getScriptProperties();
  return {
    openaiApiKey: props.getProperty('OPENAI_API_KEY') || '',
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

      DataStore.write('patients.json', patients);
      return { success: true, count };
    } catch (e) { return { success: false, error: e.toString(), count: 0 }; }
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
    return { success: true, patient: patients[id], id };
  },
  update: function(id, updates) {
    const patients = this.getAll();
    if (!patients[id]) return { success: false, error: 'Not found' };
    for (const k in updates) if (k !== 'id' && k !== 'createdAt') patients[id][k] = updates[k];
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
    const r = SheetSync.pullFromSheet();
    return { success: r.success, patients: this.getAll(), syncResult: r };
  }
};

const LabService = {
  save: function(patientId, labData) {
    const patients = PatientService.getAll();
    if (!patients[patientId]) return { success: false, error: 'Patient not found' };
    if (!patients[patientId].labData) patients[patientId].labData = [];
    const entry = { id: Utilities.getUuid(), timestamp: Date.now(), reportType: labData.reportType || 'GENERAL', values: labData.values || [], source: 'gpt4o', dates: labData.dates || [] };
    patients[patientId].labData.unshift(entry);
    if (patients[patientId].labData.length > 50) patients[patientId].labData = patients[patientId].labData.slice(0, 50);
    patients[patientId].updatedAt = Date.now();
    DataStore.write('patients.json', patients);
    return { success: true, labEntry: entry };
  },
  getHistory: function(patientId, limit) {
    const p = PatientService.getById(patientId);
    if (!p) return { success: false, error: 'Not found' };
    const h = p.labData || [];
    return { success: true, history: limit ? h.slice(0, limit) : h, count: h.length };
  },
  getLatest: function(patientId) {
    const r = this.getHistory(patientId, 1);
    return r.success ? { success: true, labs: r.history[0] || null } : r;
  }
};

const NoticeService = {
  get: () => DataStore.read('notice.json', { text: '' }),
  save: (text) => DataStore.write('notice.json', { text: text || '', updatedAt: Date.now() }) ? { success: true } : { success: false }
};

// ═══════════════════════════════════════════════════════════════════════════
// GPT-4O VISION - THE ONLY OCR ENGINE
// ═══════════════════════════════════════════════════════════════════════════

const GPTVisionService = {
  extractLabs: function(imageBase64) {
    const config = getConfig();
    if (!config.openaiApiKey) return { success: false, error: 'OPENAI_API_KEY not set. Add it in Project Settings → Script Properties.' };

    try {
      let img = imageBase64;
      if (!img.startsWith('data:image')) img = 'data:image/jpeg;base64,' + img;

      const prompt = `Extract lab values as JSON: {"reportType":"CBC|BMP|GENERAL","dates":["date"],"values":[{"test":"Full Name","value":"123","unit":"mg/dL","flag":"H|L|N","refLow":"10","refHigh":"20","collectionDate":"date"}]}`;

      const response = UrlFetchApp.fetch('https://api.openai.com/v1/chat/completions', {
        method: 'post',
        contentType: 'application/json',
        headers: { 'Authorization': 'Bearer ' + config.openaiApiKey },
        payload: JSON.stringify({
          model: GPT_MODEL,
          messages: [
            { role: 'system', content: prompt },
            { role: 'user', content: [
              { type: 'text', text: 'Extract all values.' },
              { type: 'image_url', image_url: { url: img, detail: 'auto' } }
            ]}
          ],
          max_tokens: 2048,
          temperature: 0
        }),
        muteHttpExceptions: true,
        timeout: 25000
      });

      const code = response.getResponseCode();
      const text = response.getContentText();

      if (code !== 200) {
        try { return { success: false, error: JSON.parse(text).error?.message || 'API error ' + code }; }
        catch (e) { return { success: false, error: 'API error ' + code }; }
      }

      const content = JSON.parse(text).choices?.[0]?.message?.content || '';

      let parsed = { values: [], reportType: 'GENERAL', dates: [] };
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

      return { success: true, values, reportType: parsed.reportType || 'GENERAL', confidence: parsed.confidence || 90, dates: parsed.dates || [], model: GPT_MODEL };
    } catch (e) {
      return { success: false, error: e.toString() };
    }
  },

  consult: function(query, patient, labs) {
    const config = getConfig();
    if (!config.openaiApiKey) return { success: false, error: 'API key not set' };
    try {
      const response = UrlFetchApp.fetch('https://api.openai.com/v1/chat/completions', {
        method: 'post',
        contentType: 'application/json',
        headers: { 'Authorization': 'Bearer ' + config.openaiApiKey },
        payload: JSON.stringify({
          model: GPT_MODEL,
          messages: [
            { role: 'system', content: 'Medical AI. Be concise.' },
            { role: 'user', content: 'Patient: ' + JSON.stringify(patient) + '\nLabs: ' + JSON.stringify(labs) + '\nQ: ' + query }
          ],
          max_tokens: 1024,
          temperature: 0
        }),
        muteHttpExceptions: true,
        timeout: 20000
      });
      if (response.getResponseCode() !== 200) return { success: false, error: 'API error' };
      return { success: true, response: JSON.parse(response.getContentText()).choices?.[0]?.message?.content || '' };
    } catch (e) { return { success: false, error: e.toString() }; }
  }
};

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
    default: return htmlPage();
  }
}

function doPost(e) {
  try {
    if (!e?.postData?.contents) return json({ success: false, error: 'No data' });
    const d = JSON.parse(e.postData.contents);
    const a = d.action;
    Logger.log('POST: ' + a);

    switch (a) {
      case 'loadPatients': SheetSync.pullFromSheet(); return json({ success: true, patients: PatientService.getAll(), count: Object.keys(PatientService.getAll()).length });
      case 'refreshFromSheet': return json(PatientService.refresh());
      case 'savePatient': return json(PatientService.create(d.patient || d));
      case 'updatePatient': return json(PatientService.update(d.patientId, d.updates || d));
      case 'deletePatient': return json(PatientService.delete(d.patientId));
      case 'saveLabs': return json(LabService.save(d.patientId, d.labData));
      case 'loadLabs': return json(LabService.getLatest(d.patientId));
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
        return json(GPTVisionService.consult(d.query, d.patientContext, d.labValues));

      case 'loadNotice': return json({ success: true, notice: NoticeService.get() });
      case 'saveNotice': return json(NoticeService.save(d.notice?.text || d.text));
      case 'pullFromSheet': case 'syncSheet': return json(SheetSync.pullFromSheet());
      default: return json({ success: false, error: 'Unknown: ' + a });
    }
  } catch (e) { return json({ success: false, error: e.toString() }); }
}

function json(data) { return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON); }

function healthCheck() {
  const c = getConfig();
  return { success: true, version: SCRIPT_VERSION, model: GPT_MODEL, hasKey: !!c.openaiApiKey, keyPreview: c.openaiApiKey ? c.openaiApiKey.substring(0, 8) + '...' : 'NOT SET' };
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

function htmlPage() {
  const c = getConfig();
  const k = !!c.openaiApiKey;
  return HtmlService.createHtmlOutput(`
<!DOCTYPE html><html><head><title>Unit E v${SCRIPT_VERSION}</title>
<style>body{font-family:system-ui;max-width:700px;margin:40px auto;padding:20px;background:#f5f5f5}
.card{background:#fff;padding:20px;border-radius:12px;margin:16px 0;box-shadow:0 2px 8px rgba(0,0,0,0.1)}
.btn{display:inline-block;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600;margin:4px;color:#fff}
.g{background:#22c55e}.b{background:#3b82f6}.y{background:#eab308;color:#000}
.ok{color:#22c55e}.err{color:#ef4444}
h1{color:#1e293b}code{background:#e2e8f0;padding:2px 6px;border-radius:4px}</style></head>
<body>
<h1>🏥 Unit E Ward Rounds v${SCRIPT_VERSION}</h1>
<p style="color:#64748b">GPT-4o Vision OCR Engine</p>
<div class="card">
<h3>Status</h3>
<p><strong>GPT-4o API:</strong> <span class="${k ? 'ok' : 'err'}">${k ? '✓ Ready' : '✗ Not configured'}</span></p>
<p><strong>Model:</strong> ${GPT_MODEL}</p>
<p><strong>Sheet:</strong> ${c.sheetName}</p>
</div>
${!k ? '<div class="card" style="border-left:4px solid #ef4444"><h3>⚠️ Setup Required</h3><p>Add <code>OPENAI_API_KEY</code> in Project Settings → Script Properties</p></div>' : ''}
<div class="card">
<h3>Actions</h3>
<a class="btn g" href="?action=sync">🔄 Sync</a>
<a class="btn g" href="?action=patients">👥 Patients</a>
<a class="btn b" href="?action=testgpt">🤖 Test GPT-4o</a>
<a class="btn b" href="?action=health">❤️ Health</a>
<a class="btn y" href="?action=debug">🔍 Debug</a>
</div>
</body></html>`);
}

// Legacy compatibility
function testChatGPTAPI() { return testGPT(); }
function testClaudeAPI() { return testGPT(); }
function manualSync() { return SheetSync.pullFromSheet(); }
