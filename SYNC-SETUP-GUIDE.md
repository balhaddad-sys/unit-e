# ⚡ Unit E - Instant Sync Setup Guide

## 🎯 Overview

Your Unit E system now has **bidirectional instant syncing** between:
- 🌐 Web App (Firebase)
- 📊 Google Sheets

**How it works:**
```
Web App → Firebase → Sheets (every 1 minute)
           ↓↑
Sheets → Firebase → Web App (instant on edit)
```

---

## 📋 What's New (v2.2.0)

✅ **onEdit Trigger** - Detects changes in Google Sheets instantly
✅ **Auto-sync to Firebase** - Sheets changes push to Firebase immediately
✅ **Time-based sync** - Firebase → Sheets every 1 minute automatically
✅ **Zero configuration needed** - Works out of the box!

---

## 🚀 Quick Setup (5 minutes)

### Step 1: Update Code.gs

1. Open https://script.google.com
2. Open your "Unit E Ward Rounds" project
3. Replace the entire `Code.gs` with the new version (v2.2.0)
4. Click **Save** (💾 icon)

### Step 2: Configure Spreadsheet ID (if not done already)

1. In Apps Script, click **⚙️ Settings** (gear icon)
2. Scroll to **Script Properties**
3. Add property if missing:
   - `SPREADSHEET_ID` = your Google Sheets ID
   - To find Sheets ID: Open your sheet, copy from URL:
     `https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID_HERE/edit`

### Step 3: Redeploy the Script

1. Click **Deploy** → **Manage deployments**
2. Click ✏️ (Edit) next to your active deployment
3. Under "Version", select **New version**
4. Add description: "v2.2.0 - Instant bidirectional sync"
5. Click **Deploy**
6. Click **Done**

### Step 4: Install Auto-Sync Trigger

**Option A: Automatic (Recommended)**

Run this from Apps Script:
1. Select function `installAutoSyncTrigger` from dropdown
2. Click **Run** (▶️ icon)
3. Grant permissions if asked
4. Check execution log - should see: `"Auto-sync trigger installed - syncing every 1 minute"`

**Option B: Manual**

1. In Apps Script, click ⏰ **Triggers** (clock icon) in left sidebar
2. Click **+ Add Trigger** (bottom right)
3. Settings:
   - Function: `syncFirebaseToSheets`
   - Event source: **Time-driven**
   - Type: **Minutes timer**
   - Interval: **Every minute**
4. Click **Save**

### Step 5: Test the Sync

**Test 1: Sheets → Firebase → Web App**
1. Open your Google Sheet
2. Edit a patient's name or ward
3. Wait 2-3 seconds
4. Open your web app - changes should appear instantly!

**Test 2: Web App → Firebase → Sheets**
1. Open your web app
2. Add or edit a patient
3. Wait up to 1 minute
4. Check Google Sheets - changes should appear!

**Test 3: Manual Sync**
1. Open the deployment URL in browser
2. Click the "🔄 Sync Now" button
3. Check sheets - should update immediately

---

## 📊 How Syncing Works

### Direction 1: Web App → Firebase → Sheets

1. **User edits data in web app** (add/update patient)
2. **Saves to Firebase** (instant - real-time database)
3. **Time trigger runs** (`syncFirebaseToSheets` every 1 minute)
4. **Reads all Firebase data**
5. **Writes to Google Sheets** (overwrites existing data)

**Latency**: ~1 minute max

### Direction 2: Sheets → Firebase → Web App

1. **User edits Google Sheet** (changes patient data)
2. **onEdit trigger fires** (instant)
3. **Reads edited row**
4. **Writes to Firebase** (via REST API)
5. **Web app updates** (Firebase real-time listener)

**Latency**: ~2-3 seconds

---

## 🔧 Configuration Options

### Sync Frequency

To change sync frequency, edit the trigger:

**Every 5 minutes:**
```javascript
ScriptApp.newTrigger('syncFirebaseToSheets')
  .timeBased()
  .everyMinutes(5)  // Change to 5
  .create();
```

**Every 30 minutes:**
```javascript
ScriptApp.newTrigger('syncFirebaseToSheets')
  .timeBased()
  .everyMinutes(30)  // Change to 30
  .create();
```

### Firebase URL (Optional)

If you have a custom Firebase URL:

1. Go to Apps Script → ⚙️ Settings → Script Properties
2. Add property:
   - `FIREBASE_URL` = `https://your-project.firebaseio.com`

### Firebase Secret (Optional)

For secured Firebase database:

1. Go to Firebase Console → Database → Rules
2. If you have auth enabled, get the secret key
3. Add to Script Properties:
   - `FIREBASE_SECRET` = `your-firebase-secret`

---

## 🛠️ Troubleshooting

### Sync not working - Sheets → Firebase

**Check 1: onEdit trigger exists**
- Go to Apps Script → ⏰ Triggers
- You should see `onEdit` trigger (type: From spreadsheet, event: On edit)
- If missing, the trigger auto-creates on first edit

**Check 2: Firebase URL correct**
- Check `testConfiguration()` logs
- Should show: `Firebase URL: https://internal-medicine-ward-default-rtdb.firebaseio.com`

**Check 3: Edit the "Patients" sheet**
- onEdit only triggers on sheet named "Patients"
- Case-sensitive!

**Check 4: Check execution logs**
- Go to ⏰ Executions in Apps Script
- Look for `onEdit` executions
- Check for errors

### Sync not working - Firebase → Sheets

**Check 1: Time trigger installed**
- Go to ⏰ Triggers
- Should see `syncFirebaseToSheets` running every 1 minute
- If missing, run `installAutoSyncTrigger()`

**Check 2: Spreadsheet ID configured**
- Check Script Properties for `SPREADSHEET_ID`
- Must match your actual Google Sheet ID

**Check 3: Firebase has data**
- Check Firebase Console → Database
- Should see `/patients` node with data

**Check 4: Manual sync**
- Run `syncFirebaseToSheets()` from Apps Script
- Check execution log for errors

### Data conflicts

**What happens if same record edited in both places?**
- **Web App wins** - Firebase is source of truth
- Sheets gets overwritten every 1 minute with Firebase data
- To prevent: Don't edit same patient in both places simultaneously

**Best practice:**
- Edit in web app for active rounds
- Edit in sheets for bulk updates
- Wait 1 minute between edits in different places

---

## 📈 Monitoring

### Check Sync Status

Visit your deployment URL:
```
https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

You'll see:
- ⚡ Real-Time Sync status
- Last sync time
- Sync frequency
- "Sync Now" button

### View Execution Logs

1. Go to Apps Script → ⏰ Executions
2. See all sync operations
3. Check for errors
4. View execution time

### Health Check

```
https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec?action=health
```

Returns JSON with:
```json
{
  "status": "healthy",
  "sync": {
    "enabled": true,
    "firebase": "https://...",
    "sheet": "1X1Dy5P3S..."
  }
}
```

---

## 🎯 Advanced Features

### Force Sync

**From Web:**
```
https://your-url/exec?action=syncNow
```

**From Apps Script:**
```javascript
syncFirebaseToSheets()
```

### Disable Auto-Sync

```javascript
uninstallAutoSyncTrigger()
```

### Custom Patient ID Format

Edit in `syncRowToFirebase()`:
```javascript
// Current format: sheet_Ward19_Bed5
var patientId = 'sheet_' + (patient.ward + '_' + patient.bed).replace(/[^a-zA-Z0-9]/g, '_');

// Custom format: W19B5
var patientId = 'W' + patient.ward.replace(/\D/g, '') + 'B' + patient.bed;
```

---

## 📊 Sync Architecture

```
┌─────────────┐
│   Web App   │
│  (Frontend) │
└──────┬──────┘
       │ Real-time
       │ listeners
       ↓
┌─────────────┐     ┌──────────────────┐
│   Firebase  │────→│  Apps Script     │
│  (Database) │     │  Time Trigger    │
└──────┬──────┘     │  (Every 1 min)   │
       ↑            └────────┬─────────┘
       │                     │
       │                     ↓ Write
       │              ┌─────────────┐
       │              │   Sheets    │
       │              │  (Storage)  │
       │              └──────┬──────┘
       │                     │ onEdit
       └─────────────────────┘ trigger
                    (Instant)
```

---

## ✅ Checklist

Before going live:

- [ ] Code.gs updated to v2.2.0
- [ ] `SPREADSHEET_ID` configured in Script Properties
- [ ] Script redeployed as Web App
- [ ] Auto-sync trigger installed (`installAutoSyncTrigger()`)
- [ ] Tested: Edit sheet → appears in web app
- [ ] Tested: Edit web app → appears in sheet
- [ ] Tested: Manual sync button works
- [ ] Checked execution logs for errors
- [ ] Health check endpoint returns "healthy"

---

## 💡 Tips & Best Practices

### For Best Performance

1. **Don't edit headers** - onEdit skips header row
2. **Use proper sheet name** - Must be named "Patients"
3. **Avoid rapid edits** - Wait 2-3 seconds between sheet edits
4. **Bulk edits in web app** - More reliable than sheets for multiple changes

### For Data Integrity

1. **Primary source: Web App** - Treat Firebase as source of truth
2. **Sheets for reporting** - Use sheets primarily for viewing/exporting
3. **Avoid concurrent edits** - Don't edit same patient in both places
4. **Check sync status** - Monitor execution logs regularly

### For Troubleshooting

1. **Check Firebase first** - Verify data is in Firebase
2. **Check triggers** - Make sure both triggers are active
3. **Test manually** - Use `syncFirebaseToSheets()` to debug
4. **View logs** - Execution logs show exactly what happened

---

## 🆘 Getting Help

If sync isn't working:

1. **Run testConfiguration()** in Apps Script
2. **Check ⏰ Executions** for errors
3. **Check ⏰ Triggers** - both should be active
4. **Test health endpoint** - Should return "healthy"
5. **Check Firebase Console** - Verify data exists
6. **Check Sheet name** - Must be exactly "Patients"

---

## 📝 Summary

You now have **instant bidirectional syncing**!

✅ Sheets → Firebase: **Instant** (2-3 seconds)
✅ Firebase → Sheets: **Every 1 minute**
✅ Manual sync: **On-demand via button/API**
✅ Zero configuration: **Works automatically**

Your team can:
- Edit in web app and see updates in sheets within 1 minute
- Edit in sheets and see updates in web app within 3 seconds
- Use either interface seamlessly

**Next steps:**
1. Test both sync directions
2. Monitor execution logs for first 24 hours
3. Adjust sync frequency if needed
4. Train team on best practices

---

🎉 **Enjoy your real-time synchronized Unit E system!** 🎉
