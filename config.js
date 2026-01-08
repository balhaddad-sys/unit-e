// ═══════════════════════════════════════════════════════════════════════════
// UNIT E WARD ROUNDS - CONFIGURATION v2.0
// ASCLEPIUS-ULTRA Enhanced Configuration
// ═══════════════════════════════════════════════════════════════════════════

const CONFIG = {
    // Google Apps Script API URL - Main backend for all data storage
    apiUrl: 'https://script.google.com/macros/s/AKfycbw8ivv4DC6EGcZkAgabXH9Dz_9PJ3MI6hPISzu12wjZ1ew3NBld2bD8w2-AXvsJM5KI/exec',

    // Deprecated - Kept for backward compatibility only
    visionApiUrl: 'https://script.google.com/macros/s/AKfycbw8ivv4DC6EGcZkAgabXH9Dz_9PJ3MI6hPISzu12wjZ1ew3NBld2bD8w2-AXvsJM5KI/exec',

    // Google Drive Folder ID for data storage
    driveFolderId: '1LhrEHUgRsoz2v2w6k-Y8h7buT4Kvjk2I',

    // Google Drive Folder URL
    driveUrl: 'https://drive.google.com/drive/folders/1LhrEHUgRsoz2v2w6k-Y8h7buT4Kvjk2I',

    // Google Sheet URL (for reference)
    sheetUrl: 'https://docs.google.com/spreadsheets/d/1X1Dy5P3S_WPAi-SGKO8ZUwPLl1k4lZwJE6Gk_M62u9o/edit',

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

    // Auto-sync interval (ms)
    syncInterval: 30000,

    // Toast duration (ms)
    toastDuration: 3000,

    // Clinical Scoring Systems available
    clinicalScores: [
        'CHA2DS2-VASc',
        'HAS-BLED',
        'CURB-65',
        'Wells-PE',
        'SOFA',
        'qSOFA',
        'GCS',
        'APACHE-II',
        'MELD',
        'Child-Pugh'
    ],

    // AI Configuration
    ai: {
        useExtendedThinking: true,  // Enable extended thinking for complex queries
        timeout: 60000,              // API timeout in ms
        maxRetries: 3
    }
};

// NOTE: Firebase has been replaced with Google Drive storage
// All data is now stored in Google Drive via Google Apps Script API

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

const Utils = {
    // Clean bed number
    cleanBed: (b) => (b || '').toString().replace(/\D/g, '') || '',

    // Make unique key for duplicate detection
    makeKey: (ward, name) => `${(ward || '').toLowerCase().trim()}::${(name || '').toLowerCase().trim()}`,

    // Format date
    formatDate: (ts) => ts ? new Date(ts).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
    }) : '',

    // Format time only
    formatTime: (ts) => ts ? new Date(ts).toLocaleTimeString('en-GB', {
        hour: '2-digit', minute: '2-digit'
    }) : '',

    // Format date for display
    formatDateFull: (ts) => ts ? new Date(ts).toLocaleDateString('en-GB', {
        weekday: 'short', day: '2-digit', month: 'short', year: 'numeric'
    }) : '',

    // Check if patient is new admission
    isNewAdmission: (p) => {
        return p.status === 'New' &&
               !p.newDismissed &&
               (Date.now() - (p.timestamp || 0)) < (CONFIG.newAdmissionHours * 60 * 60 * 1000);
    },

    // Generate unique ID
    generateId: () => Date.now().toString(36) + Math.random().toString(36).substr(2, 9),

    // Redact PHI from text
    redactPHI: (text) => {
        if (!text) return '';
        return text
            .replace(/\b\d{10,}\b/g, '[ID]')
            .replace(/\b\d{6,}-?\d{0,4}\b/g, '[MRN]');
    },

    // Deep clone object
    clone: (obj) => JSON.parse(JSON.stringify(obj)),

    // Debounce function
    debounce: (fn, delay) => {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => fn(...args), delay);
        };
    },

    // Check if vital is abnormal
    isVitalAbnormal: (key, value) => {
        const config = CONFIG.vitals[key];
        if (!config || !value) return false;
        const num = parseFloat(value);
        return num < config.range[0] || num > config.range[1];
    },

    // Check if vital is critical
    isVitalCritical: (key, value) => {
        const config = CONFIG.vitals[key];
        if (!config || !value || !config.critical) return false;
        const num = parseFloat(value);
        return num < config.critical[0] || num > config.critical[1];
    },

    // Sort patients by bed number
    sortByBed: (patients) => {
        return [...patients].sort((a, b) => {
            const bedA = parseInt(a.bed) || 999;
            const bedB = parseInt(b.bed) || 999;
            return bedA - bedB;
        });
    },

    // Get ward order index
    getWardOrder: (ward) => {
        const idx = CONFIG.wards.indexOf(ward);
        return idx === -1 ? 999 : idx;
    },
};

// ═══════════════════════════════════════════════════════════════════════════
// API FUNCTIONS (Enhanced for ASCLEPIUS-ULTRA v2.0)
// ═══════════════════════════════════════════════════════════════════════════

const API = {
    // Base fetch with retry logic
    _fetch: async (payload, retries = CONFIG.ai.maxRetries) => {
        let lastError;
        for (let i = 0; i < retries; i++) {
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
                console.warn(`[API] Attempt ${i + 1}/${retries} failed:`, error.message);
                if (i < retries - 1) {
                    await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000));
                }
            }
        }
        throw lastError;
    },

    // Sync with Google Sheets
    syncSheets: async (patients) => {
        try {
            const result = await API._fetch({
                action: 'syncSheet',
                patients: patients
            });
            console.log('[Sync] Sheet synced successfully:', result);
            return result;
        } catch (error) {
            console.error('[Sync] Failed:', error.message);
            return { success: false, error: error.message };
        }
    },

    // Process image with Google Vision OCR
    processOCR: async (base64Image) => {
        try {
            // Try local OCR Engine first
            if (window.OCREngine?.isReady) {
                return await window.OCREngine.processImage(base64Image);
            }

            console.log('[API] Sending OCR request (Google Vision)');
            return await API._fetch({
                action: 'runOCR',
                image: base64Image
            });
        } catch (error) {
            console.error('[OCR] Failed:', error.message);
            throw error;
        }
    },

    // Process image with Claude Vision (AI-powered OCR)
    processClaudeVision: async (base64Image, patientId = null) => {
        try {
            console.log('[API] Sending Claude Vision OCR request');
            return await API._fetch({
                action: 'claudeVision',
                image: base64Image,
                patientId: patientId
            });
        } catch (error) {
            console.error('[Claude Vision] Failed:', error.message);
            throw error;
        }
    },

    // AI Medical Consultation (Standard)
    claudeConsult: async (query, patientContext = null, labValues = [], medications = [], allergies = []) => {
        try {
            console.log('[API] Sending Claude consultation request');
            return await API._fetch({
                action: 'claudeConsult',
                query: query,
                patientContext: patientContext,
                labValues: labValues,
                medications: medications,
                allergies: allergies
            });
        } catch (error) {
            console.error('[Claude Consult] Failed:', error.message);
            throw error;
        }
    },

    // AI Medical Consultation with Extended Thinking (Complex Cases)
    claudeConsultExtended: async (query, patientContext = null, labValues = [], medications = [], allergies = []) => {
        try {
            console.log('[API] Sending Claude EXTENDED consultation request');
            return await API._fetch({
                action: 'claudeConsultExtended',
                query: query,
                patientContext: patientContext,
                labValues: labValues,
                medications: medications,
                allergies: allergies
            });
        } catch (error) {
            console.error('[Claude Extended] Failed:', error.message);
            // Fallback to standard consultation
            console.log('[API] Falling back to standard consultation');
            return API.claudeConsult(query, patientContext, labValues, medications, allergies);
        }
    },

    // Parse lab results (local)
    parseLabs: (text) => {
        if (window.LabParser?.isReady && text) {
            return window.LabParser.parse(text);
        }
        return { values: [], reportType: 'Unknown', alerts: [], findings: [] };
    },

    // Save labs to Google Drive
    saveLabs: async (patientId, patientName, labData, metadata = {}) => {
        try {
            console.log('[API] Saving labs for patient:', patientId);
            return await API._fetch({
                action: 'saveLabs',
                patientId: patientId,
                patientName: patientName,
                labData: labData,
                metadata: metadata
            });
        } catch (error) {
            console.error('[Save Labs] Failed:', error.message);
            throw error;
        }
    },

    // Load labs from Google Drive
    loadLabs: async (patientId) => {
        try {
            console.log('[API] Loading labs for patient:', patientId);
            return await API._fetch({
                action: 'loadLabs',
                patientId: patientId
            });
        } catch (error) {
            console.error('[Load Labs] Failed:', error.message);
            throw error;
        }
    },

    // Load lab history for trending
    loadLabHistory: async (patientId, limit = 10) => {
        try {
            console.log('[API] Loading lab history for patient:', patientId);
            return await API._fetch({
                action: 'loadLabHistory',
                patientId: patientId,
                limit: limit
            });
        } catch (error) {
            console.error('[Lab History] Failed:', error.message);
            throw error;
        }
    },

    // Analyze lab trends with optional AI interpretation
    analyzeLabTrends: async (patientId, tests = null, includeAI = true, patientContext = null) => {
        try {
            console.log('[API] Analyzing lab trends for patient:', patientId);
            return await API._fetch({
                action: 'analyzeLabTrends',
                patientId: patientId,
                tests: tests,
                includeAI: includeAI,
                patientContext: patientContext
            });
        } catch (error) {
            console.error('[Lab Trends] Failed:', error.message);
            throw error;
        }
    },

    // Calculate clinical scores (CHA2DS2-VASc, CURB-65, etc.)
    calculateScore: async (scoreName, patientData) => {
        try {
            console.log('[API] Calculating score:', scoreName);
            return await API._fetch({
                action: 'calculateScore',
                scoreName: scoreName,
                patientData: patientData
            });
        } catch (error) {
            console.error('[Clinical Score] Failed:', error.message);
            throw error;
        }
    },

    // Save patient to Google Drive
    savePatient: async (patient) => {
        try {
            const result = await API._fetch({
                action: 'savePatient',
                patient
            });
            if (!result.success) throw new Error(result.error);
            return result;
        } catch (error) {
            console.error('[Save Patient] Failed:', error);
            throw error;
        }
    },

    // Update patient in Google Drive
    updatePatient: async (patientId, updates) => {
        try {
            const result = await API._fetch({
                action: 'updatePatient',
                patientId,
                updates
            });
            if (!result.success) throw new Error(result.error);
            return result;
        } catch (error) {
            console.error('[Update Patient] Failed:', error);
            throw error;
        }
    },

    // Delete patient from Google Drive
    deletePatient: async (patientId) => {
        try {
            const result = await API._fetch({
                action: 'deletePatient',
                patientId
            });
            if (!result.success) throw new Error(result.error);
            return result;
        } catch (error) {
            console.error('[Delete Patient] Failed:', error);
            throw error;
        }
    },

    // Load all patients from Google Drive
    loadPatients: async () => {
        try {
            const result = await API._fetch({
                action: 'loadPatients'
            });
            if (!result.success) throw new Error(result.error);
            return result.patients || {};
        } catch (error) {
            console.error('[Load Patients] Failed:', error);
            throw error;
        }
    },

    // Save notice to Google Drive
    saveNotice: async (notice) => {
        try {
            const result = await API._fetch({
                action: 'saveNotice',
                notice
            });
            if (!result.success) throw new Error(result.error);
            return result;
        } catch (error) {
            console.error('[Save Notice] Failed:', error);
            throw error;
        }
    },

    // Load notice from Google Drive
    loadNotice: async () => {
        try {
            const result = await API._fetch({
                action: 'loadNotice'
            });
            if (!result.success) throw new Error(result.error);
            return result.notice || { text: '' };
        } catch (error) {
            console.error('[Load Notice] Failed:', error);
            throw error;
        }
    },

    // Save audit log entry to Google Drive
    saveAuditLog: async (logEntry) => {
        try {
            const result = await API._fetch({
                action: 'saveAuditLog',
                logEntry
            });
            if (!result.success) throw new Error(result.error);
            return result;
        } catch (error) {
            console.error('[Save Audit Log] Failed:', error);
            throw error;
        }
    }
};

console.log('[Config] Unit E configuration loaded');
console.log('[Config] Wards:', CONFIG.wards.length);
console.log('[Config] Google Drive storage initialized');
console.log('[Config] API URL:', CONFIG.apiUrl);
