# Troubleshooting: Web App AI Error

**Error Message:** "⚠️ An error occurred while processing your query. Please try again or contact support."

This guide will help you diagnose and fix the AI error in the Unit E web app.

---

## 🔍 Quick Diagnosis

### Step 1: Check Browser Console

1. Open the web app in your browser
2. Press `F12` or right-click → "Inspect" to open Developer Tools
3. Go to the "Console" tab
4. Try to use the AI consultation feature
5. Look for error messages in the console

The enhanced error logging will now show you **specific error details** such as:
- Network connection errors
- Timeout issues
- JSON parsing errors
- API response errors

---

## 🛠️ Common Causes & Solutions

### Issue #1: OpenAI API Key Not Configured ⚠️

**Most common cause!** The backend needs your OpenAI API key to function.

**How to Fix:**

1. Open your Google Apps Script project: https://script.google.com
2. Find your "Unit E Ward Rounds" project
3. Click ⚙️ **Project Settings** (left sidebar)
4. Scroll to **"Script Properties"** section
5. Click **"Add script property"**
6. Add:
   - **Property:** `OPENAI_API_KEY`
   - **Value:** `sk-proj-...` (your OpenAI API key)
7. Click **"Save script properties"**
8. Test the web app again

**Where to get an API key:**
- Go to: https://platform.openai.com/api-keys
- Sign in to your OpenAI account
- Click "Create new secret key"
- Copy the key (starts with `sk-proj-...`)

---

### Issue #2: Network / CORS Error

**Symptoms:** Console shows "Failed to fetch" or "CORS error"

**How to Fix:**

1. Check your internet connection
2. Verify the API URL in `/js/config.js` matches your Google Apps Script deployment URL
3. Re-deploy your Google Apps Script as a web app:
   - Open Google Apps Script project
   - Click **Deploy** → **New deployment**
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone** (or your organization)
   - Click **Deploy**
   - Copy the new URL
   - Update `/js/config.js` line 9 with the new URL

---

### Issue #3: Timeout Error

**Symptoms:** Console shows "Request timed out" or "AbortError"

**How to Fix:**

The timeout is currently set to 45 seconds. If requests are timing out:

1. Check your internet connection speed
2. Verify OpenAI API is operational: https://status.openai.com
3. Consider using a faster OpenAI model (current: gpt-4o-mini)
4. If needed, increase timeout in `/js/ai-medical-consultant.js` line 522

---

### Issue #4: Invalid JSON Response

**Symptoms:** Console shows "Invalid JSON response" or "JSON parse error"

**How to Fix:**

1. Check if the Google Apps Script deployment is returning HTML instead of JSON
2. Re-deploy your Google Apps Script:
   - Open Google Apps Script project
   - **Deploy** → **New deployment**
   - Make sure it's deployed as a **Web app** (not API Executable)
3. Test the backend directly using the diagnostic dashboard

---

## 🩺 Using the Diagnostic Dashboard

For detailed diagnostics, open the **AI Diagnostic Dashboard**:

1. Open `/ai-diagnostic-dashboard.html` in your browser
2. Click **"Quick Health Check"** to test backend connectivity
3. Click **"Full Diagnostics"** for comprehensive report
4. Click **"Test OCR"** to test image processing
5. Click **"Test Consultation"** to test AI consultation
6. Check **"Recent Debug Logs"** for error details

The dashboard will show you:
- ✅ What's working
- ❌ What's failing
- 💡 Recommendations to fix issues

---

## 📋 Step-by-Step Debugging Process

Follow this process to systematically identify and fix the issue:

### Step 1: Check OpenAI API Key
```
1. Google Apps Script → Project Settings → Script Properties
2. Verify OPENAI_API_KEY is set
3. Verify key starts with "sk-" or "sk-proj-"
4. Test key at https://platform.openai.com/api-keys
```

### Step 2: Check API URL Configuration
```
1. Open /js/config.js
2. Check line 9: apiUrl should match your Google Apps Script deployment URL
3. Test URL in browser - should show a basic response, not an error page
```

### Step 3: Test Backend Directly
```
1. Open ai-diagnostic-dashboard.html
2. Click "Quick Health Check"
3. If this fails, the backend has an issue
4. If this works, the issue is in the frontend
```

### Step 4: Check Browser Console
```
1. Open web app
2. Press F12 → Console tab
3. Try AI consultation
4. Look for error messages with [AI Consultant] prefix
5. Note the specific error message
```

### Step 5: Check OpenAI Account
```
1. Go to https://platform.openai.com/usage
2. Verify you have remaining API credits
3. Check if your API key is rate-limited
4. Verify billing is set up
```

---

## 🚨 Error Message Reference

Here's what different error messages mean:

| Error Message | Cause | Solution |
|---------------|-------|----------|
| "Request timed out" | API took too long | Check internet, verify OpenAI status |
| "Network error" | Can't reach backend | Check API URL configuration |
| "CORS error" | Cross-origin blocked | Re-deploy Google Apps Script |
| "Invalid JSON response" | Backend returned HTML | Re-deploy as Web app, not API |
| "HTTP 401 Unauthorized" | Invalid API key | Check OPENAI_API_KEY in Script Properties |
| "HTTP 429 Rate limit" | Too many requests | Wait or upgrade OpenAI plan |
| "No response received" | Empty API response | Check OpenAI API status |

---

## ✅ Verification Steps

After applying fixes, verify everything works:

1. **Test Basic API Connection:**
   - Open ai-diagnostic-dashboard.html
   - Click "Quick Health Check"
   - Should show "✅ Healthy"

2. **Test AI Consultation:**
   - Open the web app
   - Select a patient
   - Type a medical question
   - Should receive AI response within 10-30 seconds

3. **Check Console for Errors:**
   - Open browser console (F12)
   - Should see "[AI Consultant] ✨ ChatGPT (GPT-4o) response received"
   - No error messages

---

## 📞 Still Having Issues?

If you've tried all the above and still experiencing issues:

1. **Export debug logs:**
   - Open browser console
   - Type: `window.AIDebugLogger?.exportLogs()`
   - Save the output

2. **Get full diagnostic report:**
   - Open ai-diagnostic-dashboard.html
   - Click "Full Diagnostics"
   - Copy the entire report

3. **Check the detailed debugging guide:**
   - Open `/AI-DEBUGGING-GUIDE.md`
   - Contains comprehensive technical documentation

4. **Review recent changes:**
   - Check if you recently updated the code
   - Try reverting to a previous working version

---

## 🔧 Changes Made to Fix Error Handling

This troubleshooting guide is accompanied by code improvements:

### Enhanced Error Messages
- ✅ Frontend now shows **specific error details** instead of generic message
- ✅ Added helpful troubleshooting hints based on error type
- ✅ Console logging shows full error context

### Improved Logging
- ✅ Added detailed logging in `askQuestion()` function
- ✅ Logs show API URL, query, and full error details
- ✅ Easier to diagnose issues from browser console

### Fixed Configuration
- ✅ Diagnostic dashboard now uses correct production API URL
- ✅ All components use consistent configuration

---

## 📚 Additional Resources

- **AI Debugging Guide:** `/AI-DEBUGGING-GUIDE.md` - Comprehensive technical documentation
- **README:** `/README.md` - General project setup and usage
- **OpenAI Status:** https://status.openai.com - Check if OpenAI API is down
- **OpenAI API Docs:** https://platform.openai.com/docs - Official API documentation

---

**Last Updated:** 2026-01-13
**Version:** 1.0
