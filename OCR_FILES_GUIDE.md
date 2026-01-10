# OCR System - Essential Files Guide

## 📋 Overview
The OCR system uses GPT-4o Vision to extract lab values from images. Here are ALL the files you need.

---

## 🔧 Core OCR Files (4 Required Files)

### 1. **Backend (Google Apps Script)**

#### `Code.gs` (35 KB)
**Location:** Root directory
**Purpose:** Backend API that handles GPT-4o Vision API calls

**Key Functions:**
- `ChatGPTService.processImage()` - Lines 495-627
  - Calls OpenAI GPT-4o Vision API
  - Sends detailed prompt for lab extraction
  - Parses JSON response with lab values
  - Returns structured data: `{success, values[], reportType, confidence}`

**Setup Required:**
1. Deploy to Google Apps Script
2. Set Script Properties:
   - `OPENAI_API_KEY` (REQUIRED) - Your OpenAI API key
   - `VISION_API_KEY` (OPTIONAL) - Google Vision fallback

**API Endpoints:**
- `claudeVision` → Processes lab image with GPT-4o
- `saveLabs` → Saves extracted lab data
- `loadLabs` → Loads saved lab data

---

### 2. **Frontend - OCR Engine**

#### `js/ocr-engine.js` (27 KB)
**Location:** `/js/` directory
**Purpose:** Main OCR orchestration and frontend logic

**Key Features:**
- Image compression (max 1200px width, 88% quality)
- GPT-4o Vision API call with 15s timeout
- Google Vision fallback (optional, disabled by default)
- Neural learning from successful extractions
- Progress tracking and error handling

**Main Functions:**
- `runOCR(file, callbacks)` - Lines 435-537
  - Orchestrates entire OCR process
  - Compresses image
  - Calls GPT-4o Vision
  - Handles fallbacks

- `callGPTVision(dataUrl, callbacks)` - Lines 177-262
  - Sends image to backend
  - 15 second timeout
  - Returns parsed lab values

- `compressImage(file)` - Lines 140-172
  - Reduces image size for faster upload
  - Converts to JPEG with quality control

**Configuration:**
```javascript
CONFIG = {
    USE_GPT_VISION: true,
    USE_GOOGLE_FALLBACK: false,  // Disabled (requires API key)
    GPT_VISION_TIMEOUT: 15000,   // 15 seconds
    MAX_IMAGE_WIDTH: 1200,
    JPEG_QUALITY: 0.88
}
```

---

### 3. **Lab Parser Engine**

#### `js/lab-parser.js` (101 KB)
**Location:** `/js/` directory
**Purpose:** Parses lab text and validates/normalizes values

**Key Features:**
- Database of 80+ lab tests with reference ranges
- Fuzzy matching for test names (80% confidence)
- Unit conversion and validation
- OCR error correction (O→0, l→1)
- Neural clinical analysis engine
- Syndrome detection (Sepsis, AKI, DKA, etc.)

**Main Functions:**
- `parseLabReport(text)` - Line 2070
  - Extracts lab values from raw text
  - Performs validation
  - Returns confidence scores

- `NeuralEngine.analyze()` - Line 1265
  - Clinical pattern recognition
  - Syndrome detection
  - Risk stratification

**Lab Database:** Lines 120-900
- CBC: Hemoglobin, WBC, Platelets, etc.
- BMP: Sodium, Potassium, Creatinine, etc.
- LFT: ALT, AST, Bilirubin, etc.
- Coagulation: PT, INR, PTT
- And 60+ more tests

---

### 4. **API Configuration**

#### `js/config.js` (11 KB)
**Location:** `/js/` directory
**Purpose:** API endpoints and configuration

**Key Configuration:**
```javascript
CONFIG = {
    apiUrl: 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec',
    wards: ["Ward 20", "Ward 21", ...],
    vitals: { bp_sys, bp_dia, hr, temp, spo2 },
    timeout: 60000,
    ai: {
        enabled: true,
        model: 'gpt-4o',
        timeout: 30000
    }
}
```

**API Functions:**
- `API.chatgptVision(image)` - Calls GPT-4o Vision
- `API.saveLabs(patientId, labData)` - Saves lab data
- `API.loadLabs(patientId)` - Loads lab data

---

## 🖥️ Frontend UI Component

### 5. **Lab Modal (in index.html)**

#### `index.html` - Lines 4967-6100
**Purpose:** React component for OCR UI

**Key Functions:**
- `runOcrOnImage(imgObj)` - Line 5176
  - Calls OCR engine
  - Updates progress
  - Stores results

- `handleSave()` - Line 5438
  - Validates extracted values
  - Saves to backend
  - Updates patient record

- `saveLabImages()` - Line 6244
  - Formats lab data
  - Sends to Google Drive
  - Updates Firebase

**UI Features:**
- Drag & drop image upload
- Real-time OCR progress
- 5 tabs: Values, Trending, Images, AI Chat, Debug
- Confidence indicators
- Manual value editing

---

## 📊 Data Flow

```
User uploads image
    ↓
[LabModal Component] (index.html)
    ↓
runOcrOnImage()
    ↓
[OCR Engine] (ocr-engine.js)
    ↓
compressImage() → callGPTVision()
    ↓
[Backend API] (Code.gs)
    ↓
ChatGPTService.processImage()
    ↓
OpenAI GPT-4o Vision API
    ↓
← JSON response with lab values
    ↓
[Lab Parser] (lab-parser.js) - Optional validation
    ↓
← Display in UI with confidence scores
    ↓
User clicks Save
    ↓
saveLabImages() → Google Drive + Firebase
```

---

## 🚀 Setup Instructions

### Step 1: Backend Setup (Code.gs)

1. Go to: https://script.google.com
2. Create new project or open existing
3. Paste `Code.gs` content
4. Click ⚙️ Project Settings → Script Properties
5. Add property:
   - Key: `OPENAI_API_KEY`
   - Value: `sk-...` (your OpenAI API key)
6. Click "Deploy" → "New deployment"
7. Choose "Web app"
8. Set access to "Anyone"
9. Copy deployment URL

### Step 2: Frontend Setup

1. Update API URL in `js/config.js`:
   ```javascript
   apiUrl: 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec'
   ```

2. Ensure all files are loaded in `index.html`:
   ```html
   <script src="js/config.js"></script>
   <script src="js/lab-parser.js"></script>
   <script src="js/ocr-engine.js"></script>
   ```

3. Load the page and test with a lab image

---

## 🧪 Testing

### Test 1: Backend API
Visit: `https://YOUR_SCRIPT_URL/exec?action=health`

Should return:
```json
{
  "success": true,
  "version": "3.7.0",
  "hasOpenAIKey": true
}
```

### Test 2: OCR Functionality
1. Open the app
2. Click on a patient
3. Click "Labs" button
4. Upload a lab image
5. Check Debug tab for logs
6. Should extract lab values in ~10-15 seconds

---

## 📁 File Summary

| File | Size | Purpose | Required |
|------|------|---------|----------|
| `Code.gs` | 35 KB | Backend API | ✅ YES |
| `js/ocr-engine.js` | 27 KB | OCR orchestration | ✅ YES |
| `js/lab-parser.js` | 101 KB | Lab parsing/validation | ✅ YES |
| `js/config.js` | 11 KB | API configuration | ✅ YES |
| `index.html` (LabModal) | - | UI component | ✅ YES |

**Total:** 5 files (4 standalone JS files + 1 HTML component)

---

## 🔑 Required API Keys

1. **OpenAI API Key (REQUIRED)**
   - Get from: https://platform.openai.com/api-keys
   - Cost: ~$0.01-0.03 per lab image
   - Set in: Google Apps Script → Script Properties
   - Key name: `OPENAI_API_KEY`

2. **Google Vision API Key (OPTIONAL)**
   - Get from: https://console.cloud.google.com
   - Only needed for fallback (disabled by default)
   - Set in: Script Properties as `VISION_API_KEY`

---

## ⚡ Performance

- **Image compression:** 1-2 seconds
- **GPT-4o Vision:** 10-15 seconds
- **Total time:** ~12-17 seconds per lab image
- **Timeout:** 15 seconds (will fail if API is slow)

---

## 🐛 Troubleshooting

### "Vision API key not configured"
- This is expected! Google Vision is optional
- Only OpenAI key is required
- To use Google Vision fallback, add `VISION_API_KEY` to Script Properties

### "No lab values detected"
- Check image quality (must be clear and readable)
- Check Debug tab for error details
- Verify OPENAI_API_KEY is set in backend
- Try a different lab report format

### "OCR timeout"
- Timeout is 15 seconds
- If consistently timing out, check OpenAI API status
- Consider increasing timeout in `ocr-engine.js` line 24

### Save button disabled
- Need at least one lab with extracted values
- Upload image and wait for processing to complete
- Check that `img.ocr.values.length > 0`

---

## 📝 Version History

- **v3.7** (Current)
  - Improved GPT-4o prompt
  - Reference range extraction
  - 15s timeout (was 30s)
  - Made Vision API optional

- **v3.6**
  - Response format fixes
  - Better error handling

- **v6.0** (OCR Engine)
  - GPT-4o Vision integration
  - Neural learning system
  - Improved compression

---

## 📞 Support

If you encounter issues:
1. Check Debug tab in Lab Modal
2. Check browser console (F12)
3. Check Apps Script logs (View → Execution log)
4. Verify API key is correct and has credits

---

*Last updated: January 10, 2026*
