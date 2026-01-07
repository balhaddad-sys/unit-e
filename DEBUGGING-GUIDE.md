# 🔧 Unit E - API Error Debugging Guide

## 📱 Quick Diagnosis (Mobile-Friendly)

### Step 1: Run Diagnostic Tests
Open this page on your phone or computer:
```
https://balhaddad-sys.github.io/unit-e/diagnostic-ui.html
```

Tap each button and note the results:
- ✅ **Green checkmark** = Test passed
- ❌ **Red X** = Test failed

**If all tests pass** → The API endpoint works, but OCR/Claude might have issues
**If any test fails** → Note the exact error message

### Step 2: Try OCR in the App
1. Open your Unit E app
2. Try to take a photo or upload an image for OCR
3. Look for error messages in the app
4. Check the **Debug tab** or debug panel for detailed logs

### Step 3: Identify the Error Pattern

Look for these messages in your app's Debug tab:

| Message | Meaning | Solution |
|---------|---------|----------|
| "🚀 Trying Claude Opus 4.5 Vision first..." | Claude attempt starting | Normal - wait for result |
| "⚠️ Claude Vision failed - using Google Vision fallback" | Claude failed, trying Google | Check Anthropic API key |
| "📸 Using Google Cloud Vision..." | Google Vision running | Normal - wait for result |
| "❌ BOTH APIs FAILED" | Both Claude AND Google failed | Check both API keys |
| "API Error: HTTP 403" | Permission denied | API key invalid or not set |
| "API Error: HTTP 400" | Bad request | Image format issue |
| "API Error: HTTP 429" | Rate limit exceeded | Wait and try again |
| "API Error: HTTP 500" | Server error | Check Apps Script logs |
| "Network Error" | Connection problem | Check internet connection |

---

## 🔍 Deep Debugging (For Advanced Users)

### View Apps Script Logs

The Apps Script now has extensive logging. To view the logs:

1. **Open Apps Script:**
   - Go to: https://script.google.com
   - Open your "Unit E Ward Rounds" project

2. **View Execution Logs:**
   - Click **Executions** (clock icon) in the left sidebar
   - You'll see all recent API calls
   - Click on any execution to see detailed logs

3. **What to Look For:**
   ```
   === handleRunOCR START ===
   Request data keys: action, image
   Image data length: 45823
   Vision API Key (first 20 chars): AIzaSyCrkrRysGj4PiW...
   Calling Google Vision API...
   Vision API response code: 200
   ```

### Common Error Patterns

#### Error: "Vision API credentials not configured"
**Cause:** VISION_API_KEY not set in Apps Script
**Solution:**
1. Open Apps Script
2. Go to **Project Settings** (gear icon)
3. Scroll to **Script Properties**
4. Add property: `VISION_API_KEY` = `your-api-key`

#### Error: "Anthropic API key not configured"
**Cause:** ANTHROPIC_API_KEY not set in Apps Script
**Solution:**
1. Open Apps Script
2. Go to **Project Settings** (gear icon)
3. Scroll to **Script Properties**
4. Add property: `ANTHROPIC_API_KEY` = `your-claude-api-key`

#### Error: "Claude API error: 401"
**Cause:** Invalid Anthropic API key
**Solution:** Get a valid key from https://console.anthropic.com/

#### Error: "Vision API error: 403"
**Cause:** Invalid Google Cloud Vision API key
**Solution:**
1. Go to https://console.cloud.google.com
2. Enable Cloud Vision API
3. Create a new API key
4. Update VISION_API_KEY in Apps Script

#### Error: "Got HTML instead of JSON"
**Cause:** Apps Script not deployed as web app
**Solution:**
1. Open Apps Script
2. Click **Deploy** > **New deployment**
3. Type: **Web app**
4. Execute as: **Me**
5. Who has access: **Anyone**
6. Copy the deployment URL
7. Update the URL in your app's config files

---

## 🧪 Testing API Keys Directly

### Test Google Vision API Key
```bash
curl -X POST \
  "https://vision.googleapis.com/v1/images:annotate?key=YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "requests": [{
      "image": {"content": "BASE64_IMAGE_DATA"},
      "features": [{"type": "TEXT_DETECTION"}]
    }]
  }'
```

### Test Anthropic API Key
```bash
curl -X POST \
  "https://api.anthropic.com/v1/messages" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-opus-4-20250514",
    "max_tokens": 1024,
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

---

## 📊 Debug Checklist

Use this checklist to systematically debug:

- [ ] Diagnostic UI tests all pass
- [ ] Apps Script is deployed as web app
- [ ] Deployment URL matches config files
- [ ] VISION_API_KEY is set in Script Properties
- [ ] ANTHROPIC_API_KEY is set in Script Properties
- [ ] Vision API is enabled in Google Cloud Console
- [ ] API keys are valid (not expired)
- [ ] Internet connection is working
- [ ] No CORS errors in browser console
- [ ] Image size is reasonable (< 4MB)
- [ ] Image format is supported (JPEG, PNG)

---

## 🆘 Still Not Working?

If you've tried everything and it's still not working:

1. **Check the Apps Script Executions tab** - Look for the exact error
2. **Check browser console** (F12) - Look for JavaScript errors
3. **Try the diagnostic UI** - Compare results
4. **Check API quotas** - Make sure you haven't exceeded limits

### Collect This Information:
- Error message from the app
- Browser console errors (F12)
- Apps Script execution logs
- Diagnostic UI test results
- Screenshot of the error

Then share this information for further help.

---

## 📝 Configuration Files Reference

The API URL should be consistent across these files:

1. **config.js** - Line 17: `visionApiUrl`
2. **ocr-engine.js** - Line 10: `VISION_API_URL`
3. **index.html** - Line 3003: `VISION_API_PROXY_URL`
4. **ai-medical-consultant.js** - Line 1053: `API_URL`

All should point to: `https://script.google.com/macros/s/AKfycbz_2zC2ztoesY0XBd7_M9YzddWzRolYjqnjXF3xr_jM0Ry4nDzqoXOpFgQZJRl1zPdU/exec`

---

## 🎯 Next Steps

Once you identify the error:
1. Note the exact error message
2. Find it in the "Common Error Patterns" section above
3. Follow the solution steps
4. Test again with the diagnostic UI
5. If fixed, try OCR in the main app

Good luck! 🚀
