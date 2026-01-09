# Quick Deployment Test Checklist

## Step 1: Test Backend URL

Open this URL in your browser:
```
https://script.google.com/macros/s/AKfycbyNa3AOc6EMOEgAi9hDM3ktNMhN_Z-s9qkWT1wxTCznVeBul_qNUkqyBEUTa3aSD1Ca/exec
```

### ✅ SUCCESS: You should see
```
🏥 Unit E Ward Rounds API
Version 3.2.0

Sheet: Unit e
Data starts: Row 6
Spreadsheet ID: 1I2Cmm2YPUuJw4o4cOgl-iFmqTmfy6S9btFZ-5AIMxh4

[Buttons for testing]
```

### ❌ ERROR: If you see

**"Authorization required"**
- Solution: Re-authorize the script
- Go to Apps Script → Deploy → Test deployments → Open the test URL → Authorize → Then update to regular deployment

**"Script has been disabled" or "The script completed but did not return anything"**
- Solution: Your deployment is outdated
- Create a NEW deployment instead of updating existing one

**Different version number (not 3.2.0)**
- Solution: Code.gs didn't update properly
- Copy the Code.gs again and save
- Deploy as NEW VERSION

**404 or "Not found"**
- Solution: Wrong URL
- Check your deployment URL in Apps Script → Deploy → Manage deployments

## Step 2: Test Debug Flow

On the API page, click **🔍 Debug Full Flow**

### ✅ SUCCESS: You should see JSON like
```json
{
  "step2_sheetRead": {
    "sheetName": "Unit e",
    "lastRow": 50,
    "dataStartRow": 6,
    "rawData": [["Ward 20", "", "", "", ""], ["1", "Patient Name", "Diagnosis", "Dr. Name", "New"], ...]
  },
  "step3_pullFromSheet": {
    "success": true,
    "count": 15,
    "saved": 15
  },
  "step5_patientServiceGetAll": {
    "count": 15,
    "ids": ["ward_20_patient1", "ward_20_patient2", ...]
  }
}
```

### ❌ ERROR: If you see

**step2_sheetRead.error: "Sheet not found"**
- Check Script Properties (Apps Script → Project Settings → Script Properties)
- Add: `SPREADSHEET_ID` = `1I2Cmm2YPUuJw4o4cOgl-iFmqTmfy6S9btFZ-5AIMxh4`
- Add: `SHEET_NAME` = `Unit e`

**step3_pullFromSheet.count: 0 or null**
- Your sheet has no patient data starting at row 6
- Check that row 5 has headers
- Check that row 6+ has patient data

**step2_sheetRead.rawData is empty**
- Sheet name doesn't match
- Data is not in the expected location

## Step 3: Test in Web App

1. Open `index.html` in your browser
2. Open browser console (F12)
3. Click the **⬇️ Import** button

### ✅ SUCCESS: You should see in console
```
[Config] Unit E v3.2 loaded
[API] Loaded 15 patients
⬇️ Importing from sheet...
✓ Imported 15 patients from sheet!
```

### ❌ ERROR: If you see

**"Failed to fetch"**
- Backend URL is wrong or deployment not accessible
- Check config.js line 7 matches your deployment URL
- Test the deployment URL in browser first (Step 1)

**"HTTP 403" or "Authorization required"**
- Script needs authorization
- Follow Step 1 → Authorization required solution

**"result.patients is undefined"**
- Backend is not returning correct format
- Run Debug Flow (Step 2) to check backend

**CORS error**
- Deployment type is wrong
- Must deploy as "Web app" not "API executable"

## Step 4: Verify Patients Appear

After successful import, you should see:
- Patient count badge in top-left shows number
- Patients grouped by ward (Ward 20, Ward 21, etc.)
- Patient cards with names, diagnoses, doctors

## Quick Fixes

### If Backend URL Opens But Import Still Fails

This means deployment is working but there's a CORS or authorization issue:

1. **Re-deploy with correct settings:**
   ```
   Deploy → New deployment
   Type: Web app
   Execute as: Me
   Who has access: Anyone
   ```

2. **Get the new URL and update config.js line 7**

### If You Need to Create a Brand New Deployment

1. Apps Script → **Deploy** → **New deployment**
2. Click gear ⚙️ → **Web app**
3. Description: "Unit E v3.2.0"
4. Execute as: **Me**
5. Who has access: **Anyone**
6. **Deploy** → **Authorize** → Copy URL
7. Update config.js line 7 with new URL

### Test Command in Browser Console

Open browser console (F12) and run:
```javascript
API.test().then(r => console.log('Test result:', r)).catch(e => console.error('Test failed:', e));
```

**Success:** `Test result: {success: true, version: "3.2.0"}`
**Failure:** Error message will show the problem

## Still Not Working?

1. Check deployment URL is correct in config.js
2. Visit deployment URL in browser - should show API page
3. Check browser console for detailed error messages
4. Run debugFullFlow in Apps Script editor
5. Check Apps Script execution logs (View → Logs)

---

**Most Common Issue:** The deployment URL in config.js doesn't match the actual deployment. Double-check they match exactly!
