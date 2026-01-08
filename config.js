// ═══════════════════════════════════════════════════════════════════════════
// UNIT E WARD ROUNDS - CONFIGURATION v3.0
// Updated for Clean Architecture Backend
// ═══════════════════════════════════════════════════════════════════════════

const CONFIG = {
    // Google Apps Script API URL - UPDATE THIS AFTER DEPLOYING NEW SCRIPT
    apiUrl: 'https://script.google.com/macros/s/AKfycbyNa3AOc6EMOEgAi9hDM3ktNMhN_Z-s9qkWT1wxTCznVeBul_qNUkqyBEUTa3aSD1Ca/exec',
    
    // Google Drive Folder ID for data storage
    driveFolderId: '1LhrEHUgRsoz2v2w6k-Y8h7buT4Kvjk2I',
    
    // Google Drive Folder URL
    driveUrl: 'https://drive.google.com/drive/folders/1LhrEHUgRsoz2v2w6k-Y8h7buT4Kvjk2I',
    
    // Google Sheet URL (for reference)
    sheetUrl: 'https://docs.google.com/spreadsheets/d/1I2Cmm2YPUuJw4o4cOgl-iFmqTmfy6S9btFZ-5AIMxh4/edit',
    
    // Ward Configuration
    wards: ["Ward 19", "Ward 20", "Ward 21", "Ward 22", "Ward 27", "Ward 5", "Ward 10", "ICU", "ER", "Unassigned"],
    
    // Patient Status Options
    statusOptions: ["New", "Chronic", "Non-Chronic", "Critical", "Stable", "Discharged"],
    
    // Task Priority Options
    priorityOptions: ["urgent", "high", "medium", "low"],
    
    // Vital Signs Configuration
    vitals: {
        bp_sys:  { label: 'BP Systolic',  icon: '🩸', unit: 'mmHg', range: [90, 140], critical: [70, 180] },
        bp_dia:  { label: 'BP Diastolic', icon: '🩸', unit: 'mmHg', range: [60, 90], critical: [40, 110] },
        hr:      { label: 'Heart Rate',   icon: '❤️', unit: 'bpm', range: [60, 100], critical: [40, 150] },
        rr:      { label: 'Resp Rate',    icon: '🫁', unit: '/min', range: [12, 20], critical: [8, 30] },
        temp:    { label: 'Temperature',  icon: '🌡️', unit: '°C', range: [36.1, 37.5], critical: [35, 39] },
        spo2:    { label: 'SpO2',         icon: '💨', unit: '%', range: [94, 100], critical: [88, 100] },
        gcs:     { label: 'GCS',          icon: '🧠', unit: '/15', range: [15, 15], critical: [8, 15] },
        pain:    { label: 'Pain Score',   icon: '😣', unit: '/10', range: [0, 3], critical: [0, 10] },
        glucose: { label: 'Glucose',      icon: '🍬', unit: 'mg/dL', range: [70, 140], critical: [50, 400] },
    },
    
    // Time thresholds
    newAdmissionHours: 24,
    
    // Auto-sync interval (ms) - no longer needed, sync is automatic
    syncInterval: 30000,
    
    // Toast duration (ms)
    toastDuration: 3000,
    
    // Clinical Scoring Systems
    clinicalScores: [
        'CHA2DS2-VASc', 'HAS-BLED', 'CURB-65', 'Wells-PE',
        'SOFA', 'qSOFA', 'GCS', 'APACHE-II', 'MELD', 'Child-Pugh'
    ],
    
    // AI Configuration
    ai: {
        timeout: 60000,
        maxRetries: 3
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

const Utils = {
    cleanBed: (b) => (b || '').toString().replace(/\D/g, '') || '',
    
    makeKey: (ward, name) => `${(ward || '').toLowerCase().trim()}::${(name || '').toLowerCase().trim()}`,
    
    formatDate: (ts) => ts ? new Date(ts).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
    }) : '',
    
    formatTime: (ts) => ts ? new Date(ts).toLocaleTimeString('en-GB', {
        hour: '2-digit', minute: '2-digit'
    }) : '',
    
    formatDateFull: (ts) => ts ? new Date(ts).toLocaleDateString('en-GB', {
        weekday: 'short', day: '2-digit', month: 'short', year: 'numeric'
    }) : '',
    
    isNewAdmission: (p) => {
        return p.status === 'New' &&
               !p.newDismissed &&
               (Date.now() - (p.createdAt || p.timestamp || 0)) < (CONFIG.newAdmissionHours * 60 * 60 * 1000);
    },
    
    generateId: () => Date.now().toString(36) + Math.random().toString(36).substr(2, 9),
    
    redactPHI: (text) => {
        if (!text) return '';
        return text
            .replace(/\b\d{10,}\b/g, '[ID]')
            .replace(/\b\d{6,}-?\d{0,4}\b/g, '[MRN]');
    },
    
    clone: (obj) => JSON.parse(JSON.stringify(obj)),
    
    debounce: (fn, delay) => {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => fn(...args), delay);
        };
    },
    
    isVitalAbnormal: (key, value) => {
        const config = CONFIG.vitals[key];
        if (!config || !value) return false;
        const num = parseFloat(value);
        return num < config.range[0] || num > config.range[1];
    },
    
    isVitalCritical: (key, value) => {
        const config = CONFIG.vitals[key];
        if (!config || !value || !config.critical) return false;
        const num = parseFloat(value);
        return num < config.critical[0] || num > config.critical[1];
    },
    
    sortByBed: (patients) => {
        return [...patients].sort((a, b) => {
            const bedA = parseInt(a.bed) || 999;
            const bedB = parseInt(b.bed) || 999;
            return bedA - bedB;
        });
    },
    
    getWardOrder: (ward) => {
        const idx = CONFIG.wards.indexOf(ward);
        return idx === -1 ? 999 : idx;
    },
};

// ═══════════════════════════════════════════════════════════════════════════
// API FUNCTIONS - v3.0 Clean Architecture
// ═══════════════════════════════════════════════════════════════════════════

const API = {
    
    /**
     * Base fetch with retry logic and proper error handling
     */
    _fetch: async (payload, retries = CONFIG.ai.maxRetries) => {
        let lastError;
        
        for (let attempt = 0; attempt < retries; attempt++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), CONFIG.ai.timeout);
                
                const response = await fetch(CONFIG.apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                    body: JSON.stringify(payload),
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                const responseText = await response.text();
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${responseText.substring(0, 300)}`);
                }
                
                return JSON.parse(responseText);
                
            } catch (error) {
                lastError = error;
                console.warn(`[API] Attempt ${attempt + 1}/${retries} failed:`, error.message);
                
                if (attempt < retries - 1) {
                    // Exponential backoff
                    await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000));
                }
            }
        }
        
        throw lastError;
    },
    
    // ═══════════════════════════════════════════════════════════════════════
    // PATIENT OPERATIONS
    // ═══════════════════════════════════════════════════════════════════════
    
    /**
     * Load all patients from backend
     */
    loadPatients: async () => {
        try {
            const result = await API._fetch({ action: 'loadPatients' });
            if (!result.success) throw new Error(result.error);
            console.log('[API] Loaded', Object.keys(result.patients || {}).length, 'patients');
            return result.patients || {};
        } catch (error) {
            console.error('[Load Patients] Failed:', error);
            throw error;
        }
    },
    
    /**
     * Save a new patient
     */
    savePatient: async (patient) => {
        try {
            const result = await API._fetch({ action: 'savePatient', patient });
            if (!result.success) throw new Error(result.error);
            console.log('[API] Patient saved:', result.id);
            return result;
        } catch (error) {
            console.error('[Save Patient] Failed:', error);
            throw error;
        }
    },
    
    /**
     * Update an existing patient
     */
    updatePatient: async (patientId, updates) => {
        try {
            const result = await API._fetch({ action: 'updatePatient', patientId, updates });
            if (!result.success) throw new Error(result.error);
            console.log('[API] Patient updated:', patientId);
            return result;
        } catch (error) {
            console.error('[Update Patient] Failed:', error);
            throw error;
        }
    },
    
    /**
     * Delete a patient
     */
    deletePatient: async (patientId) => {
        try {
            const result = await API._fetch({ action: 'deletePatient', patientId });
            if (!result.success) throw new Error(result.error);
            console.log('[API] Patient deleted:', patientId);
            return result;
        } catch (error) {
            console.error('[Delete Patient] Failed:', error);
            throw error;
        }
    },
    
    // ═══════════════════════════════════════════════════════════════════════
    // LAB OPERATIONS
    // ═══════════════════════════════════════════════════════════════════════
    
    /**
     * Save lab data for a patient
     */
    saveLabs: async (patientId, labData, metadata = {}) => {
        try {
            const result = await API._fetch({
                action: 'saveLabs',
                patientId,
                labData,
                metadata
            });
            if (!result.success) throw new Error(result.error);
            console.log('[API] Labs saved for patient:', patientId);
            return result;
        } catch (error) {
            console.error('[Save Labs] Failed:', error);
            throw error;
        }
    },
    
    /**
     * Load latest labs for a patient
     */
    loadLabs: async (patientId) => {
        try {
            const result = await API._fetch({ action: 'loadLabs', patientId });
            if (!result.success) throw new Error(result.error);
            return result.labs;
        } catch (error) {
            console.error('[Load Labs] Failed:', error);
            throw error;
        }
    },
    
    /**
     * Load lab history for a patient
     */
    loadLabHistory: async (patientId, limit = 10) => {
        try {
            const result = await API._fetch({ action: 'loadLabHistory', patientId, limit });
            if (!result.success) throw new Error(result.error);
            return result;
        } catch (error) {
            console.error('[Lab History] Failed:', error);
            throw error;
        }
    },
    
    // ═══════════════════════════════════════════════════════════════════════
    // OCR OPERATIONS
    // ═══════════════════════════════════════════════════════════════════════
    
    /**
     * Process image with Google Vision OCR
     */
    processOCR: async (base64Image) => {
        try {
            // Try local OCR Engine first if available
            if (window.OCREngine?.isReady) {
                return await window.OCREngine.processImage(base64Image);
            }
            
            console.log('[API] Sending OCR request');
            const result = await API._fetch({ action: 'runOCR', image: base64Image });
            return result;
        } catch (error) {
            console.error('[OCR] Failed:', error);
            throw error;
        }
    },
    
    /**
     * Process image with Claude Vision for structured lab extraction
     */
    claudeVision: async (base64Image) => {
        try {
            console.log('[API] Sending Claude Vision request');
            const result = await API._fetch({ action: 'claudeVision', image: base64Image });
            return result;
        } catch (error) {
            console.error('[Claude Vision] Failed:', error);
            throw error;
        }
    },
    
    /**
     * Parse lab text (local function)
     */
    parseLabs: (text) => {
        if (window.LabParser?.isReady && text) {
            return window.LabParser.parse(text);
        }
        return { values: [], reportType: 'Unknown', alerts: [], findings: [] };
    },
    
    // ═══════════════════════════════════════════════════════════════════════
    // AI CONSULTATION
    // ═══════════════════════════════════════════════════════════════════════
    
    /**
     * Get AI consultation from Claude
     */
    claudeConsult: async (query, patientContext, labValues, medications, allergies) => {
        try {
            console.log('[API] Sending consultation request');
            const result = await API._fetch({
                action: 'claudeConsult',
                query,
                patientContext,
                labValues,
                medications,
                allergies
            });
            return result;
        } catch (error) {
            console.error('[Claude Consult] Failed:', error);
            throw error;
        }
    },
    
    // ═══════════════════════════════════════════════════════════════════════
    // NOTICE OPERATIONS
    // ═══════════════════════════════════════════════════════════════════════
    
    /**
     * Load notice
     */
    loadNotice: async () => {
        try {
            const result = await API._fetch({ action: 'loadNotice' });
            if (!result.success) throw new Error(result.error);
            return result.notice || { text: '' };
        } catch (error) {
            console.error('[Load Notice] Failed:', error);
            throw error;
        }
    },
    
    /**
     * Save notice
     */
    saveNotice: async (notice) => {
        try {
            const result = await API._fetch({ action: 'saveNotice', notice });
            if (!result.success) throw new Error(result.error);
            return result;
        } catch (error) {
            console.error('[Save Notice] Failed:', error);
            throw error;
        }
    },
    
    // ═══════════════════════════════════════════════════════════════════════
    // SYNC OPERATIONS
    // ═══════════════════════════════════════════════════════════════════════
    
    /**
     * Sync Drive to Sheets (usually automatic, but can be called manually)
     */
    syncDriveToSheets: async () => {
        try {
            const result = await API._fetch({ action: 'syncDriveToSheets' });
            console.log('[Sync] Drive → Sheets:', result);
            return result;
        } catch (error) {
            console.error('[Sync] Failed:', error);
            throw error;
        }
    },
    
    /**
     * Import from Sheets to Drive
     */
    syncSheetsToDrive: async () => {
        try {
            const result = await API._fetch({ action: 'syncSheetsToDrive' });
            console.log('[Sync] Sheets → Drive:', result);
            return result;
        } catch (error) {
            console.error('[Sync] Failed:', error);
            throw error;
        }
    },
    
    /**
     * Full bidirectional sync
     */
    fullSync: async () => {
        try {
            const result = await API._fetch({ action: 'fullSync' });
            console.log('[Sync] Full sync complete:', result);
            return result;
        } catch (error) {
            console.error('[Full Sync] Failed:', error);
            throw error;
        }
    },
    
    // ═══════════════════════════════════════════════════════════════════════
    // AUDIT OPERATIONS
    // ═══════════════════════════════════════════════════════════════════════
    
    /**
     * Save audit log entry
     */
    saveAuditLog: async (logEntry) => {
        try {
            const result = await API._fetch({ action: 'saveAuditLog', logEntry });
            return result;
        } catch (error) {
            console.error('[Audit Log] Failed:', error);
            // Don't throw - audit logging shouldn't break the app
            return { success: false, error: error.message };
        }
    },
    
    // ═══════════════════════════════════════════════════════════════════════
    // HEALTH CHECK
    // ═══════════════════════════════════════════════════════════════════════
    
    /**
     * Test API connection
     */
    test: async () => {
        try {
            const result = await API._fetch({ action: 'test' });
            console.log('[API] Test successful:', result);
            return result;
        } catch (error) {
            console.error('[API Test] Failed:', error);
            throw error;
        }
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════════════════════

console.log('[Config] Unit E Ward Rounds v3.0 loaded');
console.log('[Config] Wards:', CONFIG.wards.length);
console.log('[Config] API URL:', CONFIG.apiUrl);
