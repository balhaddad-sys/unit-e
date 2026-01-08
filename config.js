// ═══════════════════════════════════════════════════════════════════════════
// UNIT E WARD ROUNDS - CONFIGURATION
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
// API FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

const API = {
    // Sync with Google Sheets
    syncSheets: async () => {
        try {
            await fetch(CONFIG.apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({ action: 'syncSheet' })
            });
            console.log('[Sync] Sheet synced successfully');
            return true;
        } catch (error) {
            console.error('[Sync] Failed:', error.message);
            return false;
        }
    },

    // Process image with OCR
    processOCR: async (base64Image) => {
        try {
            // Try OCR Engine first
            if (window.OCREngine?.isReady) {
                return await window.OCREngine.processImage(base64Image);
            }

            // Fallback to direct API
            const response = await fetch(CONFIG.apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({ action: 'runOCR', image: base64Image })
            });
            return await response.json();
        } catch (error) {
            console.error('[OCR] Failed:', error);
            throw error;
        }
    },

    // Parse lab results
    parseLabs: (text) => {
        if (window.LabParser?.isReady && text) {
            return window.LabParser.parse(text);
        }
        return { values: [], reportType: 'Unknown', alerts: [], findings: [] };
    },

    // Save labs to Google Drive
    saveLabs: async (patientId, patientName, labData) => {
        try {
            const response = await fetch(CONFIG.apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({
                    action: 'saveLabs',
                    patientId,
                    patientName,
                    labData
                })
            });
            return await response.json();
        } catch (error) {
            console.error('[Save Labs] Failed:', error);
            throw error;
        }
    },

    // Save patient to Google Drive
    savePatient: async (patient) => {
        try {
            const response = await fetch(CONFIG.apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({
                    action: 'savePatient',
                    patient
                })
            });
            const result = await response.json();
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
            const response = await fetch(CONFIG.apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({
                    action: 'updatePatient',
                    patientId,
                    updates
                })
            });
            const result = await response.json();
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
            const response = await fetch(CONFIG.apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({
                    action: 'deletePatient',
                    patientId
                })
            });
            const result = await response.json();
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
            const response = await fetch(CONFIG.apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({
                    action: 'loadPatients'
                })
            });
            const result = await response.json();
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
            const response = await fetch(CONFIG.apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({
                    action: 'saveNotice',
                    notice
                })
            });
            const result = await response.json();
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
            const response = await fetch(CONFIG.apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({
                    action: 'loadNotice'
                })
            });
            const result = await response.json();
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
            const response = await fetch(CONFIG.apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({
                    action: 'saveAuditLog',
                    logEntry
                })
            });
            const result = await response.json();
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
