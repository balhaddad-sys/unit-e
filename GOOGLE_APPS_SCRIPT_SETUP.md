# Google Apps Script Setup Guide

## 📋 Quick Setup Instructions

### Step 1: Create Google Apps Script Project

1. Go to https://script.google.com
2. Click **"New Project"**
3. Name it: `Unit E Ward Rounds Backend`
4. Delete the default code
5. Copy the entire contents of `Code.gs` (below) and paste it

### Step 2: Configure Script Properties

1. In Apps Script, click **⚙️ Project Settings** (left sidebar)
2. Scroll down to **Script Properties**
3. Click **"Add script property"** for each:

```
Property Name: VISION_API_KEY
Value: [Your Google Cloud Vision API Key - see below]

Property Name: DRIVE_FOLDER_ID
Value: [Your Google Drive Folder ID - see below]

Property Name: SPREADSHEET_ID (Optional)
Value: [Your Google Sheets ID for patient data]
```

### Step 3: Get Google Cloud Vision API Key

1. Go to: https://console.cloud.google.com
2. Create a new project or select existing one
3. Enable **Cloud Vision API**:
   - Click "APIs & Services" → "Library"
   - Search "Cloud Vision API"
   - Click "Enable"
4. Create API Key:
   - Click "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy the API key
   - Click "Restrict Key" (recommended):
     - Application restrictions: None (or IP restriction)
     - API restrictions: Select "Cloud Vision API" only
   - Save

### Step 4: Get Google Drive Folder ID

**Option A: Use Root Folder (Easiest)**
```
Leave value as: root
```

**Option B: Use Specific Folder**
1. Create folder in Google Drive: `Unit E Ward Rounds`
2. Open the folder
3. Copy the ID from URL:
   ```
   https://drive.google.com/drive/folders/FOLDER_ID_HERE
                                         ^^^^^^^^^^^^^^^^
   ```
4. Use this ID as DRIVE_FOLDER_ID

### Step 5: Deploy as Web App

1. Click **Deploy** → **New deployment**
2. Click ⚙️ (gear icon) next to "Select type"
3. Choose **Web app**
4. Settings:
   ```
   Description: Unit E Backend v1.0
   Execute as: Me (YOUR_EMAIL@gmail.com)
   Who has access: Anyone
   ```
5. Click **Deploy**
6. Click **Authorize access**
7. Choose your Google account
8. Click **Advanced** → **Go to Unit E Ward Rounds Backend (unsafe)**
9. Click **Allow**
10. **Copy the Web App URL** - This is your API endpoint!

### Step 6: Add URL to Your Application

1. Open `config.js` in your Unit E project
2. Find line 17: `visionApiUrl:`
3. Replace with your Web App URL:
   ```javascript
   visionApiUrl: 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec',
   ```

### Step 7: Test

1. Open the Web App URL in browser
2. You should see: "Unit E Ward Rounds API" page
3. Try health check: `YOUR_URL?action=health`
4. Should return JSON with status: "healthy"

---

## 🔧 Troubleshooting

### OCR Not Working
- ✅ Check VISION_API_KEY is set in Script Properties
- ✅ Verify Cloud Vision API is enabled in Google Cloud Console
- ✅ Check API key restrictions (should allow Cloud Vision API)
- ✅ Look at Apps Script Logs (Executions tab)

### Labs Not Saving to Drive
- ✅ Check DRIVE_FOLDER_ID is set (or use "root")
- ✅ Verify folder exists and you have write permissions
- ✅ Check Apps Script has Drive permissions (reauthorize if needed)

### General Issues
- ✅ Check Apps Script Executions tab for errors
- ✅ Verify deployment is using "Execute as: Me"
- ✅ Ensure "Who has access: Anyone"
- ✅ Try redeploying with new version

---

## 📊 Script Properties Summary

| Property | Required | Example |
|----------|----------|---------|
| `VISION_API_KEY` | **Yes** | `AIzaSyABC123...` |
| `DRIVE_FOLDER_ID` | **Yes** | `root` or `1A2B3C4D...` |
| `SPREADSHEET_ID` | Optional | `1X1Dy5P3S_WPA...` |

---

## 🎯 What Each Property Does

**VISION_API_KEY**:
- Enables OCR (text extraction from lab images)
- Uses Google Cloud Vision API
- Cost: Free tier = 1,000 images/month

**DRIVE_FOLDER_ID**:
- Where patient lab files are stored
- Creates subfolders per patient
- Use "root" for Drive root folder

**SPREADSHEET_ID**:
- Optional: Syncs patient data to Google Sheets
- Useful for reporting/backup
- Get ID from spreadsheet URL

---

## 📝 Testing Checklist

After deployment:

- [ ] Health check returns "healthy"
- [ ] Upload lab image → OCR extracts text
- [ ] Save labs → Creates file in Drive
- [ ] Check Drive for "Unit E Ward Rounds" folder
- [ ] Patient-specific folders created
- [ ] Lab files stored as JSON

---

## 🔒 Security Notes

- API Key should be restricted to Cloud Vision API only
- Use "Execute as: Me" to run with your permissions
- Drive files are created in your Google Drive
- Only you can see the Script Properties (API keys are secure)
- Consider IP restrictions for production use

---

## 📞 Support

If issues persist:
1. Check Apps Script **Executions** tab for detailed errors
2. View **Logs** in the Executions tab
3. Test individual functions using "Run" button
4. Use `testConfiguration()` function to verify setup

---

## 🚀 Ready!

Once setup is complete:
- OCR will work with lab images
- Labs will save to Google Drive
- All features will be functional

Enjoy! 🎉
