// ═══════════════════════════════════════════════════════════════════════════
// UNIT E WARD ROUNDS - CONFIG v3.2
// ═══════════════════════════════════════════════════════════════════════════

const CONFIG = {
    // Apps Script Web App deployment URL
    apiUrl: 'https://script.google.com/macros/s/AKfycbw8ivv4DC6EGcZkAgabXH9Dz_9PJ3MI6hPISzu12wjZ1ew3NBld2bD8w2-AXvsJM5KI/exec',
    
    // Wards
    wards: ["Ward 20", "Ward 21", "Ward 22", "Ward 5", "Ward 27", "Ward 4", "Ward 19", "Ward 10", "ICU", "ER", "Unassigned"],
    
    // Status options
    statusOptions: ["New", "Chronic", "Non-Chronic", "Critical", "Stable", "Discharged"],
    
    // Vitals config
    vitals: {
        bp_sys:  { label: 'BP Systolic',  unit: 'mmHg', range: [90, 140] },
        bp_dia:  { label: 'BP Diastolic', unit: 'mmHg', range: [60, 90] },
        hr:      { label: 'Heart Rate',   unit: 'bpm',  range: [60, 100] },
        temp:    { label: 'Temperature',  unit: '°C',   range: [36.1, 37.5] },
        spo2:    { label: 'SpO2',         unit: '%',    range: [94, 100] },
    },
    
    // Timeouts
    timeout: 60000,
    maxRetries: 3
};

// ═══════════════════════════════════════════════════════════════════════════
// API FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

const API = {
    
    _fetch: async (payload, retries = CONFIG.maxRetries) => {
        let lastError;
        for (let i = 0; i < retries; i++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), CONFIG.timeout);
                
                const response = await fetch(CONFIG.apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                    body: JSON.stringify(payload),
                    signal: controller.signal
                });
                clearTimeout(timeoutId);
                
                const text = await response.text();
                if (!response.ok) throw new Error(`HTTP ${response.status}: ${text.substring(0, 200)}`);
                return JSON.parse(text);
            } catch (error) {
                lastError = error;
                console.warn(`Attempt ${i + 1} failed:`, error.message);
                if (i < retries - 1) await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000));
            }
        }
        throw lastError;
    },
    
    // ═══════════════════════════════════════════════════════════════════════
    // PATIENTS
    // ═══════════════════════════════════════════════════════════════════════
    
    loadPatients: async () => {
        const result = await API._fetch({ action: 'loadPatients' });
        if (!result.success) throw new Error(result.error);
        console.log('[API] Loaded', Object.keys(result.patients || {}).length, 'patients');
        return result.patients || {};
    },
    
    refreshFromSheet: async () => {
        const result = await API._fetch({ action: 'refreshFromSheet' });
        console.log('[API] Refreshed from sheet:', result.syncResult);
        return result;
    },
    
    savePatient: async (patient) => {
        const result = await API._fetch({ action: 'savePatient', patient });
        if (!result.success) throw new Error(result.error);
        return result;
    },
    
    updatePatient: async (patientId, updates) => {
        const result = await API._fetch({ action: 'updatePatient', patientId, updates });
        if (!result.success) throw new Error(result.error);
        return result;
    },
    
    deletePatient: async (patientId) => {
        const result = await API._fetch({ action: 'deletePatient', patientId });
        if (!result.success) throw new Error(result.error);
        return result;
    },
    
    // ═══════════════════════════════════════════════════════════════════════
    // LABS
    // ═══════════════════════════════════════════════════════════════════════
    
    saveLabs: async (patientId, labData) => {
        const result = await API._fetch({ action: 'saveLabs', patientId, labData });
        if (!result.success) throw new Error(result.error);
        return result;
    },
    
    loadLabs: async (patientId) => {
        const result = await API._fetch({ action: 'loadLabs', patientId });
        if (!result.success) throw new Error(result.error);
        return result.labs;
    },
    
    loadLabHistory: async (patientId, limit = 10) => {
        const result = await API._fetch({ action: 'loadLabHistory', patientId, limit });
        if (!result.success) throw new Error(result.error);
        return result;
    },
    
    // ═══════════════════════════════════════════════════════════════════════
    // OCR & AI
    // ═══════════════════════════════════════════════════════════════════════
    
    processOCR: async (base64Image) => {
        return await API._fetch({ action: 'runOCR', image: base64Image });
    },
    
    claudeVision: async (base64Image) => {
        return await API._fetch({ action: 'claudeVision', image: base64Image });
    },
    
    claudeConsult: async (query, patientContext, labValues) => {
        return await API._fetch({ action: 'claudeConsult', query, patientContext, labValues });
    },
    
    // ═══════════════════════════════════════════════════════════════════════
    // NOTICE
    // ═══════════════════════════════════════════════════════════════════════
    
    loadNotice: async () => {
        const result = await API._fetch({ action: 'loadNotice' });
        return result.notice || { text: '' };
    },
    
    saveNotice: async (notice) => {
        return await API._fetch({ action: 'saveNotice', notice });
    },
    
    // ═══════════════════════════════════════════════════════════════════════
    // SYNC
    // ═══════════════════════════════════════════════════════════════════════
    
    pullFromSheet: async () => {
        return await API._fetch({ action: 'pullFromSheet' });
    },
    
    pushToSheet: async () => {
        return await API._fetch({ action: 'pushToSheet' });
    },
    
    // ═══════════════════════════════════════════════════════════════════════
    // TEST
    // ═══════════════════════════════════════════════════════════════════════
    
    test: async () => {
        return await API._fetch({ action: 'test' });
    }
};

console.log('[Config] Unit E v3.2 loaded');
