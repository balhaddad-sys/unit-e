# Code.gs Deployment Instructions - v3.2.0

## What Changed

The Google Apps Script backend has been completely rewritten to fix the sync issue between the Google Sheet and the web app. The new version (v3.2.0) properly reads patient data from the sheet and makes it available to the app.

### Key Improvements

1. **Simplified Data Storage**: Uses a single `patients.json` file in Google Drive
2. **Automatic Sheet Sync**: When the app calls `loadPatients`, it automatically pulls fresh data from the sheet
3. **Correct Sheet Format Support**: Reads your exact sheet format:
   - Row 5: Headers (Room/Ward | Patient name | Diagnosis | Assigned Doctor | Status)
   - Row 6+: Data with ward headers (Ward 20, Ward 21, etc.) followed by patient rows

## Deployment Steps

### 1. Open Google Apps Script Editor

1. Go to your Google Sheet: [Unit E Sheet](https://docs.google.com/spreadsheets/d/1I2Cmm2YPUuJw4o4cOgl-iFmqTmfy6S9btFZ-5AIMxh4)
2. Click **Extensions** → **Apps Script**
3. You should see the script editor open with `Code.gs`

### 2. Replace the Code

1. Select **ALL** the existing code in `Code.gs`
2. Delete it
3. Copy the entire contents of the new `Code.gs` file from this repository
4. Paste it into the Apps Script editor
5. Click the **Save** icon (💾) or press Ctrl+S / Cmd+S

### 3. Deploy the New Version

#### Option A: Update Existing Deployment (Recommended)

1. Click **Deploy** → **Manage deployments**
2. Click the ✏️ (pencil/edit) icon next to your existing deployment
3. Under "Version", click **New version**
4. Add a description: "v3.2.0 - Fixed sheet sync issue"
5. Click **Deploy**
6. Copy the new deployment URL (it might be the same as before)

#### Option B: Create New Deployment

1. Click **Deploy** → **New deployment**
2. Click the gear icon ⚙️ and select **Web app**
3. Fill in:
   - **Description**: "Unit E Ward Rounds v3.2.0"
   - **Execute as**: "Me"
   - **Who has access**: "Anyone" (or your preferred setting)
4. Click **Deploy**
5. Click **Authorize access** and complete the authorization
6. Copy the deployment URL

### 4. Update the Frontend (CRITICAL)

**IMPORTANT**: After deploying the Apps Script, you MUST update the frontend with the deployment URL:

1. Copy the deployment URL from step 3
2. Open `/home/user/unit-e/config.js`
3. Update the `apiUrl` on line 7:
   ```javascript
   apiUrl: 'YOUR_DEPLOYMENT_URL_HERE',
   ```
4. Replace `YOUR_DEPLOYMENT_URL_HERE` with your actual deployment URL
5. Save the file

**Current Status**: The config.js has been configured with your web app deployment URL:
```
https://script.google.com/macros/s/AKfycbyNa3AOc6EMOEgAi9hDM3ktNMhN_Z-s9qkWT1wxTCznVeBul_qNUkqyBEUTa3aSD1Ca/exec
```

✅ This URL is already set in config.js - no frontend changes needed!

### 5. Test the Sync

#### Test in Apps Script Console

1. In the Apps Script editor, select the function `debugFullFlow` from the dropdown
2. Click **Run** (▶️)
3. Check the **Execution log** (View → Logs)
4. You should see:
   - Sheet read successfully
   - Patients parsed and saved
   - Drive file contains patient data

#### Test in Browser

1. Open your deployment URL in a browser
2. You should see the API info page
3. Click **🔄 Sync from Sheet** button
4. You should see JSON response with patient data
5. Click **👥 View Patients** to see all patients

#### Test in the App

1. Open your web app (index.html)
2. Refresh the page
3. Patients should now appear in the list
4. Check the browser console (F12) for any errors

## Troubleshooting

### No Patients Appear in App

1. Check the browser console for errors
2. Verify the API URL in `config.js` matches your deployment URL
3. Visit the deployment URL directly and click **🔍 Debug Full Flow**
4. Check if `step3_pullFromSheet` shows patients

### "Sheet not found" Error

1. Verify the spreadsheet ID in Script Properties:
   - Go to Apps Script editor
   - Click **Project Settings** (gear icon)
   - Scroll to **Script Properties**
   - Ensure `SPREADSHEET_ID` is set to: `1I2Cmm2YPUuJw4o4cOgl-iFmqTmfy6S9btFZ-5AIMxh4`
   - If missing, click **Add script property** and add it

### Authorization Issues

1. Click **Deploy** → **Test deployments**
2. Copy the test URL
3. Open it in a browser to re-authorize
4. Then update to a regular deployment

## What to Expect After Deployment

1. **First Load**: The app will automatically pull all patient data from the sheet
2. **Data Format**: Patient IDs are generated as `ward_patientname` (e.g., `ward_20_john_doe`)
3. **Lab Data Preserved**: Any existing lab data in Drive will be preserved during sync
4. **Bidirectional Sync**: Changes in the app can be pushed back to the sheet using the `pushToSheet` action

## Script Properties

Ensure these are set in **Project Settings** → **Script Properties**:

| Property | Value | Required |
|----------|-------|----------|
| SPREADSHEET_ID | 1I2Cmm2YPUuJw4o4cOgl-iFmqTmfy6S9btFZ-5AIMxh4 | Yes |
| DRIVE_FOLDER_ID | 1LhrEHUgRsoz2v2w6k-Y8h7buT4Kvjk2I | Yes |
| SHEET_NAME | Unit e | Yes |
| VISION_API_KEY | Your Google Vision API key | No (only if using OCR) |
| ANTHROPIC_API_KEY | Your Claude API key | No (only if using AI features) |

## Version History

- **v3.2.0** (2026-01-08): Complete rewrite with simplified architecture and fixed sheet sync
- **Previous versions**: See `Code.gs.backup-*` files for history

## Support

If you encounter issues:

1. Check the browser console (F12) for errors
2. Check the Apps Script execution logs (View → Logs)
3. Visit the deployment URL and click **🔍 Debug Full Flow** to see detailed diagnostics
4. Check that your sheet format matches the expected format (see top of Code.gs)
