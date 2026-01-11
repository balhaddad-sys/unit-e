// ═══════════════════════════════════════════════════════════════════════════
// UNIT E WARD ROUNDS - CONFIG v3.4
// UPDATED: Using the new deployment URL from v3.7.0
// ═══════════════════════════════════════════════════════════════════════════

const CONFIG = {
    // ⚠️ IMPORTANT: This URL must match your deployed Google Apps Script
    // Updated to match v3.7.0 deployment (from your screenshot)
    apiUrl: 'https://script.google.com/macros/s/AKfycbxQdnLHRRg5sK3kEmkiGk-YR_nLjxUW0goPyYnNsFo6AUvnBLjuTA606hIKNGT8Bph3/exec',
    
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
    maxRetries: 3,
    
    // AI Configuration
    ai: {
        enabled: true,
        model: 'gpt-4o',
        fallbackToKnowledgeBase: true,
        timeout: 30000
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// API FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

const API = {
    
    _fetch: async (payload, retries = CONFIG.maxRetries) => {
        let lastError;
        const debugId = `${payload.action}_${Date.now()}`;
        console.log(`[DEBUG ${debugId}] Starting API call with payload:`, JSON.stringify(payload));

        for (let i = 0; i < retries; i++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), CONFIG.timeout);

                console.log(`[DEBUG ${debugId}] Attempt ${i + 1}/${retries} - Calling ${CONFIG.apiUrl}`);
                const startTime = Date.now();

                const response = await fetch(CONFIG.apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                    body: JSON.stringify(payload),
                    signal: controller.signal
                });
                clearTimeout(timeoutId);

                const responseTime = Date.now() - startTime;
                console.log(`[DEBUG ${debugId}] Response received in ${responseTime}ms - Status: ${response.status}`);

                const text = await response.text();
                console.log(`[DEBUG ${debugId}] Response text (first 500 chars):`, text.substring(0, 500));

                if (!response.ok) {
                    const error = `HTTP ${response.status}: ${text.substring(0, 200)}`;
                    console.error(`[DEBUG ${debugId}] HTTP Error:`, error);
                    throw new Error(error);
                }

                const parsed = JSON.parse(text);
                console.log(`[DEBUG ${debugId}] Parsed response:`, parsed);

                if (parsed.success === false) {
                    console.error(`[DEBUG ${debugId}] API returned success=false:`, parsed.error);
                }

                return parsed;
            } catch (error) {
                lastError = error;
                console.error(`[DEBUG ${debugId}] Attempt ${i + 1} failed:`, {
                    message: error.message,
                    name: error.name,
                    stack: error.stack?.split('\n').slice(0, 3).join('\n')
                });

                if (i < retries - 1) {
                    const waitTime = Math.pow(2, i) * 1000;
                    console.log(`[DEBUG ${debugId}] Waiting ${waitTime}ms before retry...`);
                    await new Promise(r => setTimeout(r, waitTime));
                }
            }
        }

        console.error(`[DEBUG ${debugId}] All ${retries} attempts failed. Last error:`, lastError);
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
        console.log(`[LAB_DEBUG] loadLabs called for patientId: ${patientId}`);
        const result = await API._fetch({ action: 'loadLabs', patientId });
        console.log(`[LAB_DEBUG] loadLabs result:`, result);

        if (!result.success) {
            console.error(`[LAB_DEBUG] loadLabs failed:`, result.error);
            throw new Error(result.error);
        }

        const labs = result.labs || result.labData || [];
        console.log(`[LAB_DEBUG] Loaded ${labs.length} labs for patient ${patientId}`);
        return labs;
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

    // ChatGPT Vision API (GPT-4o) for lab image processing
    chatgptVision: async (base64Image) => {
        return await API._fetch({ action: 'claudeVision', image: base64Image });
    },

    // ChatGPT Consultation API (GPT-4o) for medical consultation
    chatgptConsult: async (query, patientContext, labValues) => {
        return await API._fetch({ action: 'claudeConsult', query, patientContext, labValues });
    },

    // Backwards compatibility aliases
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

    syncSheetsToDrive: async () => {
        return await API._fetch({ action: 'pullFromSheet' });
    },

    syncDriveToSheets: async () => {
        return await API._fetch({ action: 'pushToSheet' });
    },
    
    // ═══════════════════════════════════════════════════════════════════════
    // TEST & HEALTH
    // ═══════════════════════════════════════════════════════════════════════
    
    test: async () => {
        return await API._fetch({ action: 'test' });
    },
    
    health: async () => {
        try {
            const response = await fetch(CONFIG.apiUrl + '?action=health');
            return await response.json();
        } catch (e) {
            return { success: false, error: e.message };
        }
    },
    
    testOpenAI: async () => {
        try {
            const response = await fetch(CONFIG.apiUrl + '?action=testchatgpt');
            return await response.json();
        } catch (e) {
            return { success: false, error: e.message };
        }
    }
};

console.log('[Config] Unit E v3.3 loaded');
console.log('[Config] API URL:', CONFIG.apiUrl);
console.log('[Config] AI enabled:', CONFIG.ai.enabled);
