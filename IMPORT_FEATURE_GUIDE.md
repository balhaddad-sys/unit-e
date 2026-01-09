# Manual Import Feature - User Guide

## What's New

A new **Import** button and keyboard shortcut have been added to manually refresh patient data from the Google Sheet.

## How to Use

### Button Method

1. Look at the top toolbar in the web app
2. Click the **⬇️ Import** button (blue button, next to the 📊 button)
3. You'll see a toast notification: "⬇️ Importing from sheet..."
4. When complete: "✓ Imported X patients from sheet!"

### Keyboard Shortcut

Press **Ctrl+I** (or **Cmd+I** on Mac) to import from the sheet instantly.

## What It Does

When you click Import or press Ctrl+I:

1. **Pulls fresh data** from the Google Sheet
2. **Syncs to Google Drive** storage
3. **Reloads the patient list** in the app
4. **Shows success message** with count of imported patients

## When to Use It

Use the Import button when:

- ✅ You manually edited the Google Sheet and want to see changes immediately
- ✅ You want to ensure you have the latest data from the sheet
- ✅ Another team member updated the sheet and you want to refresh
- ✅ You're troubleshooting and want to force a fresh sync

## Button Differences

| Button | Icon | Purpose | Direction |
|--------|------|---------|-----------|
| **Import** | ⬇️ | Pull data FROM Google Sheet | Sheet → App |
| **Sync** | 🔄 | Push data TO Google Sheet | App → Sheet |
| **Sheet** | 📊 | Open Google Sheet in new tab | Opens Sheet |

## Keyboard Shortcuts

Press **Ctrl+?** (or click the ⌨️ button) to see all keyboard shortcuts:

- **Ctrl+I** - Import from sheet ⬇️ (NEW!)
- **Ctrl+N** - Add new patient
- **Ctrl+F** - Search patients
- **Ctrl+E** - Export to CSV
- **Ctrl+P** - Print/PDF
- **Esc** - Close dialogs

## Features

### Loading State
- Shows ⏳ sync indicator during import
- Prevents multiple simultaneous imports
- Auto-hides after completion

### User Feedback
- Toast notifications for all actions
- Success message shows patient count
- Error messages if import fails
- Console logs for debugging

### Error Handling
- Catches network errors
- Shows user-friendly error messages
- Logs detailed errors to console
- Doesn't crash the app on failure

## Examples

### Successful Import
```
User clicks "⬇️ Import"
→ Shows: "⬇️ Importing from sheet..."
→ Syncs from Google Sheet
→ Shows: "✓ Imported 15 patients from sheet!"
→ Patient list updates automatically
```

### Import with Keyboard
```
User presses Ctrl+I
→ Same process as button click
→ Faster for power users
```

### Error Scenario
```
User clicks "⬇️ Import"
→ Shows: "⬇️ Importing from sheet..."
→ Network error occurs
→ Shows: "❌ Import failed: Network request failed"
→ Patient list remains unchanged
```

## Technical Details

### API Call Flow
```
User Action
  ↓
handleImportFromSheet()
  ↓
API.refreshFromSheet()
  ↓
Backend: SheetSync.pullFromSheet()
  ↓
Backend: Save to Drive
  ↓
API.loadPatients()
  ↓
Update UI with fresh data
```

### Response Format
```javascript
{
  success: true,
  syncResult: {
    success: true,
    count: 15,
    saved: 15,
    timestamp: "2026-01-08T..."
  },
  patients: {
    "patient_id_1": { ... },
    "patient_id_2": { ... }
  }
}
```

## Troubleshooting

### Import Button Not Working

1. **Check API URL**
   - Open browser console (F12)
   - Look for error messages
   - Verify `config.js` has correct deployment URL

2. **Check Backend Deployment**
   - Visit the deployment URL directly
   - Should show "Unit E Ward Rounds API v3.2.0"
   - Click "Debug Full Flow" to test

3. **Check Network**
   - Open Network tab in browser DevTools
   - Click Import
   - Check for failed requests (red)

### Import Shows 0 Patients

1. **Check Google Sheet**
   - Open the sheet
   - Verify patient data exists
   - Check it starts at row 6
   - Ward headers should be in column A

2. **Check Script Properties**
   - Apps Script → Project Settings
   - Verify `SPREADSHEET_ID` is correct
   - Verify `SHEET_NAME` matches your sheet

3. **Run Debug Flow**
   - Visit deployment URL
   - Click "🔍 Debug Full Flow"
   - Check `step2_sheetRead.rawData`
   - Should show your patient rows

### Import Fails with Error

**Common Errors:**

| Error | Cause | Solution |
|-------|-------|----------|
| "Failed to fetch" | Wrong API URL | Update config.js |
| "HTTP 403" | Not authorized | Re-deploy and authorize script |
| "Sheet not found" | Wrong sheet name | Check Script Properties |
| "Network error" | Internet down | Check connection |

## Tips

1. **Use Ctrl+I for speed** - Faster than clicking
2. **Import after sheet edits** - See changes immediately
3. **Watch the sync badge** - Shows ⏳ while importing
4. **Check console for details** - F12 for debugging
5. **Import before major changes** - Ensure latest data

## Auto-Sync vs Manual Import

The app has both automatic and manual sync:

| Feature | Auto-Sync | Manual Import |
|---------|-----------|---------------|
| **Frequency** | Every 15 seconds | On demand |
| **Trigger** | Automatic | User clicks/keys |
| **Use case** | Background updates | Immediate refresh |
| **Control** | None | Full control |

Both work together - auto-sync keeps data fresh, manual import gives you instant control when needed.

---

**Questions?** Check the browser console (F12) for detailed logs and error messages.
