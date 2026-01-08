# How to Get Your Web App Deployment URL

## The URL You Provided

```
https://script.google.com/macros/library/d/1zgcSeRyI-vGnkpadlE1_VFeo4HUcktpAh5CHc5DkY6O_M-2TK3p3ID-v/5
```

This is a **Library URL** (used for Apps Script libraries), NOT a web app deployment URL.

## What You Need

You need a **Web App Deployment URL** which looks like this:
```
https://script.google.com/macros/s/SOME_DEPLOYMENT_ID_HERE/exec
```

## How to Get It

### Step 1: Open Your Apps Script

1. Go to your Google Sheet: https://docs.google.com/spreadsheets/d/1I2Cmm2YPUuJw4o4cOgl-iFmqTmfy6S9btFZ-5AIMxh4
2. Click **Extensions** → **Apps Script**

### Step 2: Check Existing Deployments

1. In the Apps Script editor, click **Deploy** → **Manage deployments**
2. Look for existing deployments
3. If you see a deployment, click the **Copy** icon next to the URL
4. That's your web app URL!

### Step 3: If No Deployment Exists, Create One

If you don't have any deployments:

1. Click **Deploy** → **New deployment**
2. Click the gear icon ⚙️ next to "Select type"
3. Select **Web app**
4. Fill in:
   - **Description**: "Unit E Ward Rounds v3.2.0"
   - **Execute as**: **Me (your email)**
   - **Who has access**: **Anyone** (or "Anyone with Google account")
5. Click **Deploy**
6. Click **Authorize access** and complete the authorization
7. **Copy the Web app URL** - it will look like:
   ```
   https://script.google.com/macros/s/AKfycby.../exec
   ```

### Step 4: Update config.js

Once you have the correct URL:

1. Open `/home/user/unit-e/config.js`
2. Replace the URL on line 7:
   ```javascript
   apiUrl: 'PASTE_YOUR_WEB_APP_URL_HERE',
   ```
3. Save the file

## URL Format Comparison

| Type | URL Pattern | Purpose |
|------|-------------|---------|
| **Library** | `.../macros/library/d/{ID}/{VERSION}` | For sharing code as a library |
| **Web App** | `.../macros/s/{DEPLOYMENT_ID}/exec` | For running as a web service ✅ |

## Testing the URL

After you get the web app URL, test it:

1. Paste the URL in your browser
2. You should see a page that says "Unit E Ward Rounds API v3.2.0"
3. If you see this, the URL is correct!

## Current Status

The `config.js` currently has this URL:
```
https://script.google.com/macros/s/AKfycbw8ivv4DC6EGcZkAgabXH9Dz_9PJ3MI6hPISzu12wjZ1ew3NBld2bD8w2-AXvsJM5KI/exec
```

This might be an old deployment. Please check your **Manage deployments** to get the current/correct one.

## Next Steps

1. ✅ Get your web app deployment URL (follow steps above)
2. ✅ Update `config.js` with that URL
3. ✅ Make sure the new `Code.gs` is deployed
4. ✅ Test the app - patients should appear!

## Troubleshooting

### "The script has been disabled"
- The deployment might be old or deactivated
- Create a new deployment (Step 3 above)

### "Authorization required"
- You need to authorize the script
- Go through the OAuth authorization flow when deploying

### "Script function not found"
- The old `Code.gs` is still deployed
- Replace the code and deploy a new version

---

**Once you have the correct web app URL, let me know and I'll update config.js!**
