// ═══════════════════════════════════════════════════════════════════════════
// UNIT E WARD ROUNDS - CONFIGURATION v2.0
// ASCLEPIUS-ULTRA Enhanced Configuration
// ═══════════════════════════════════════════════════════════════════════════

const CONFIG = {
    // Firebase Configuration
    firebase: {
        apiKey: "AIzaSyA5tYolf_gVPsj72AHg0pyJmLMOVaYTfOA",
        authDomain: "internal-medicine-ward.firebaseapp.com",
        databaseURL: "https://internal-medicine-ward-default-rtdb.firebaseio.com",
        projectId: "internal-medicine-ward",
        storageBucket: "internal-medicine-ward.appspot.com",
        appId: "1:811476183925:web:c3fe741cf3613fb4940ab6"
    },
    
    // Google Apps Script Proxy URL (ASCLEPIUS-ULTRA v2.0)
    visionApiUrl: 'https://script.google.com/macros/s/AKfycbz3SuvptqcgljpuxenGWkJFsra9e9DYM8rnh3rgxEqtnGsy_UYu-Ya6CHwzWQz3yE-6BQ/exec',
    
    // Google Sheet URL
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

// Initialize Firebase
firebase.initializeApp(CONFIG.firebase);
const db = firebase.database();

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
                
                const response = await fetch(CONFIG.visionApiUrl, {
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
            console.error('[Trend Analysis] Failed:', error.message);
            throw error;
        }
    },

    // Check for critical lab values
    checkCriticalValues: async (labData, patientId = null, patientName = null) => {
        try {
            return await API._fetch({
                action: 'checkCriticalValues',
                labData: labData,
                patientId: patientId,
                patientName: patientName
            });
        } catch (error) {
            console.error('[Critical Values] Failed:', error.message);
            throw error;
        }
    },

    // Export patient report to Google Sheets
    exportReport: async (patientId, patientName = null) => {
        try {
            console.log('[API] Exporting report for patient:', patientId);
            return await API._fetch({
                action: 'exportReport',
                patientId: patientId,
                patientName: patientName
            });
        } catch (error) {
            console.error('[Export Report] Failed:', error.message);
            throw error;
        }
    },

    // Calculate clinical score
    calculateScore: async (scoreType, parameters) => {
        try {
            console.log('[API] Calculating', scoreType, 'score');
            return await API._fetch({
                action: 'calculateScore',
                scoreType: scoreType,
                parameters: parameters
            });
        } catch (error) {
            console.error('[Calculate Score] Failed:', error.message);
            throw error;
        }
    },

    // Check drug interactions
    getDrugInteractions: async (drugs) => {
        try {
            console.log('[API] Checking drug interactions for:', drugs);
            return await API._fetch({
                action: 'getDrugInteractions',
                drugs: drugs
            });
        } catch (error) {
            console.error('[Drug Interactions] Failed:', error.message);
            throw error;
        }
    },

    // Generate differential diagnosis
    getDifferentialDiagnosis: async (symptoms, signs = [], labFindings = null, patientContext = null) => {
        try {
            console.log('[API] Generating differential diagnosis');
            return await API._fetch({
                action: 'getDifferentialDiagnosis',
                symptoms: symptoms,
                signs: signs,
                labFindings: labFindings,
                patientContext: patientContext
            });
        } catch (error) {
            console.error('[Differential Diagnosis] Failed:', error.message);
            throw error;
        }
    },

    // Batch OCR processing
    batchOCR: async (images) => {
        try {
            console.log('[API] Processing batch OCR:', images.length, 'images');
            return await API._fetch({
                action: 'batchOCR',
                images: images
            });
        } catch (error) {
            console.error('[Batch OCR] Failed:', error.message);
            throw error;
        }
    },

    // Batch consultations
    batchConsult: async (consultations) => {
        try {
            console.log('[API] Processing batch consultations:', consultations.length);
            return await API._fetch({
                action: 'batchConsult',
                consultations: consultations
            });
        } catch (error) {
            console.error('[Batch Consult] Failed:', error.message);
            throw error;
        }
    },

    // Test API connection
    testAPI: async () => {
        console.log('=== API Connection Test (ASCLEPIUS-ULTRA v2.0) ===');
        console.log('API URL:', CONFIG.visionApiUrl);

        try {
            console.log('Sending test request...');
            const result = await API._fetch({ action: 'test' });
            console.log('✅ API Test SUCCESS:', result);
            return { success: true, result };
        } catch (error) {
            console.error('❌ API Test FAILED:', error);
            return { success: false, error: error.message, details: error };
        }
    },

    // Health check
    healthCheck: async () => {
        try {
            const response = await fetch(CONFIG.visionApiUrl + '?action=health');
            return await response.json();
        } catch (error) {
            console.error('[Health Check] Failed:', error.message);
            return { status: 'error', error: error.message };
        }
    },

    // Get API configuration
    getConfig: async () => {
        try {
            const response = await fetch(CONFIG.visionApiUrl + '?action=config');
            return await response.json();
        } catch (error) {
            console.error('[Get Config] Failed:', error.message);
            return null;
        }
    },

    // Get critical value thresholds
    getCriticalThresholds: async () => {
        try {
            const response = await fetch(CONFIG.visionApiUrl + '?action=criticalThresholds');
            return await response.json();
        } catch (error) {
            console.error('[Get Thresholds] Failed:', error.message);
            return null;
        }
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// CLINICAL SCORE HELPERS
// ═══════════════════════════════════════════════════════════════════════════

const ClinicalScores = {
    // CHA2DS2-VASc Calculator
    CHA2DS2VASc: async (params) => {
        return API.calculateScore('CHA2DS2-VASc', params);
    },

    // HAS-BLED Calculator
    HASBLED: async (params) => {
        return API.calculateScore('HAS-BLED', params);
    },

    // CURB-65 Calculator
    CURB65: async (params) => {
        return API.calculateScore('CURB-65', params);
    },

    // Wells PE Score
    WellsPE: async (params) => {
        return API.calculateScore('Wells-PE', params);
    },

    // SOFA Score
    SOFA: async (params) => {
        return API.calculateScore('SOFA', params);
    },

    // qSOFA Score
    qSOFA: async (params) => {
        return API.calculateScore('qSOFA', params);
    },

    // GCS Score
    GCS: async (params) => {
        return API.calculateScore('GCS', params);
    },

    // MELD Score
    MELD: async (params) => {
        return API.calculateScore('MELD', params);
    },

    // Child-Pugh Score
    ChildPugh: async (params) => {
        return API.calculateScore('Child-Pugh', params);
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════════════════════

console.log('[Config] Unit E Ward Rounds v2.0 (ASCLEPIUS-ULTRA) loaded');
console.log('[Config] Wards:', CONFIG.wards.length);
console.log('[Config] Firebase initialized');
console.log('[Config] API URL:', CONFIG.visionApiUrl);
console.log('[Config] Clinical Scores Available:', CONFIG.clinicalScores.join(', '));

// Auto health check on load
(async () => {
    try {
        const health = await API.healthCheck();
        if (health.status === 'healthy') {
            console.log('[Config] ✅ Backend connected - Version:', health.version, health.codename || '');
            console.log('[Config] Services:', JSON.stringify(health.services));
        } else {
            console.warn('[Config] ⚠️ Backend health check returned:', health);
        }
    } catch (e) {
        console.warn('[Config] ⚠️ Backend health check failed:', e.message);
    }
})();
