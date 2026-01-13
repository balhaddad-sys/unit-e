# Deployment Guide - Unit E Ward Rounds

Stop manually updating Google Apps Script! This guide shows you easy deployment options.

---

## 🚀 Quick Start: Use clasp (Recommended)

### What is clasp?
- Official Google tool for Apps Script development
- Push code from your computer to Google Apps Script in seconds
- No more copy/paste!

### Setup (5 minutes, one-time)

```bash
# 1. Install clasp
npm install -g @google/clasp

# 2. Login to Google
clasp login
# This opens your browser - sign in with your Google account

# 3. Get your Script ID
# Go to: https://script.google.com
# Open "Unit E Ward Rounds" project
# Click ⚙️ Settings → Copy "Script ID"

# 4. Clone your project
clasp clone YOUR_SCRIPT_ID
# Replace YOUR_SCRIPT_ID with the actual ID
```

### Daily Usage (2 seconds)

```bash
# Make changes to your files (index.html, Code.gs, etc.)

# Deploy to Google Apps Script
clasp push

# Done! Your changes are live.
```

### Additional Commands

```bash
# Pull latest from Google Apps Script
clasp pull

# Open project in browser
clasp open

# View deployment info
clasp deployments

# Create new deployment
clasp deploy
```

---

## 🌐 Better Option: Separate Frontend & Backend

This is the professional approach - host frontend separately, keep only backend in Apps Script.

### Architecture

```
┌─────────────────────────────┐
│  Frontend (GitHub Pages)    │
│  - index.html               │
│  - /js/*.js                 │
│  - /css/*.css               │
│  - ai-diagnostic-dashboard  │
└──────────────┬──────────────┘
               │ API Calls
               ↓
┌─────────────────────────────┐
│  Backend (Apps Script)      │
│  - Code.gs                  │
│  - AIDebugger.gs           │
│  - Returns JSON            │
└─────────────────────────────┘
```

### Setup

**1. Enable GitHub Pages (Free Hosting):**

```bash
# On GitHub.com:
# Repository → Settings → Pages
# Source: Deploy from branch
# Branch: main
# Folder: / (root)
# Click Save

# Your site will be live at:
# https://balhaddad-sys.github.io/unit-e/
```

**2. Keep Only Backend in Google Apps Script:**

Files to keep in Apps Script:
- ✅ `Code.gs` - Backend API
- ✅ `AIDebugger.gs` - Diagnostics
- ❌ Remove `index.html` (now on GitHub Pages)
- ❌ Remove all JS files (now on GitHub Pages)

**3. Update Deployment:**

Your `config.js` already points to the correct API URL - no changes needed!

### Benefits

| Aspect | Before | After |
|--------|--------|-------|
| **Frontend Updates** | Copy to Apps Script | Just push to GitHub |
| **Deployment Time** | 2-5 minutes | 10 seconds |
| **Loading Speed** | Slower | Faster (CDN) |
| **Backend Updates** | Copy to Apps Script | Use `clasp push` |

### When to Update What

**Frontend changes (HTML/JS/CSS):**
```bash
git add .
git commit -m "Update frontend"
git push origin main
# GitHub Pages auto-deploys in ~1 minute
```

**Backend changes (Code.gs):**
```bash
# Edit Code.gs or AIDebugger.gs
clasp push
# Live immediately
```

---

## ⚡ Pro Option: Automated Deployment

Deploy automatically whenever you push to GitHub.

### Setup GitHub Actions

**1. Create `.github/workflows/deploy.yml`:**

```yaml
name: Deploy to Google Apps Script

on:
  push:
    branches: [ main ]
    paths:
      - '**.gs'
      - '.clasp.json'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install clasp
        run: npm install -g @google/clasp

      - name: Create .clasprc.json
        run: echo '${{ secrets.CLASP_TOKEN }}' > ~/.clasprc.json

      - name: Push to Apps Script
        run: clasp push
```

**2. Add GitHub Secret:**

```bash
# 1. Get clasp credentials
clasp login --creds creds.json
cat ~/.clasprc.json

# 2. Copy the entire JSON content

# 3. Go to GitHub:
# Repository → Settings → Secrets and variables → Actions
# Click "New repository secret"
# Name: CLASP_TOKEN
# Value: Paste the JSON content
# Click "Add secret"
```

**3. Done!**

Now whenever you push `.gs` files to GitHub:
- ✅ GitHub Actions runs automatically
- ✅ Deploys to Google Apps Script
- ✅ No manual steps needed

---

## 🎯 Recommended Workflow

### For Your Project

I recommend **Option 2: Separate Frontend & Backend**

**Why:**
- Frontend updates = just push to GitHub (instant)
- Backend updates = rarely needed, use `clasp push`
- Professional setup
- Faster loading for users

### Migration Steps

**Step 1: Enable GitHub Pages** (1 minute)
```
GitHub → Settings → Pages → Source: main branch → Save
```

**Step 2: Setup clasp** (5 minutes)
```bash
npm install -g @google/clasp
clasp login
clasp clone YOUR_SCRIPT_ID
```

**Step 3: Clean up Apps Script** (2 minutes)
```
Remove all HTML/JS files from Google Apps Script
Keep only .gs files (backend)
```

**Step 4: Test** (1 minute)
```
Open: https://balhaddad-sys.github.io/unit-e/
Should work perfectly!
```

**Step 5: Update workflow** (ongoing)
```bash
# Frontend changes:
git push origin main  # That's it!

# Backend changes:
clasp push  # That's it!
```

---

## 📋 Comparison Table

| Method | Frontend Update | Backend Update | Difficulty | Best For |
|--------|----------------|----------------|-----------|----------|
| **Manual Copy/Paste** | 5 min | 5 min | 😢 Hard | Testing only |
| **clasp only** | 10 sec | 10 sec | 😊 Easy | Small projects |
| **Separate Hosting** | 10 sec | 10 sec | 😊 Easy | **Recommended** |
| **Full Automation** | 0 sec | 0 sec | 🤓 Medium | Large teams |

---

## 🆘 Troubleshooting

### "clasp: command not found"

```bash
# Make sure Node.js is installed
node --version
npm --version

# Reinstall clasp
npm install -g @google/clasp
```

### "User has not enabled the Apps Script API"

1. Go to: https://script.google.com/home/usersettings
2. Enable "Google Apps Script API"
3. Try `clasp login` again

### "Push failed - no scriptId"

Make sure `.clasp.json` exists:
```json
{
  "scriptId": "YOUR_SCRIPT_ID_HERE",
  "rootDir": "."
}
```

### GitHub Pages not working

Check:
- Settings → Pages → Source is set correctly
- Branch exists and has files
- Wait 1-2 minutes for first deployment
- Visit: https://balhaddad-sys.github.io/unit-e/

---

## 📚 Additional Resources

- **clasp Documentation:** https://github.com/google/clasp
- **GitHub Pages Guide:** https://pages.github.com
- **Apps Script API:** https://developers.google.com/apps-script/api
- **VS Code Extension:** https://marketplace.visualstudio.com/items?itemName=google.google-apps-script

---

## ✅ Quick Command Reference

```bash
# Setup (one-time)
npm install -g @google/clasp
clasp login
clasp clone YOUR_SCRIPT_ID

# Daily use
clasp push          # Deploy changes
clasp pull          # Get latest from Apps Script
clasp open          # Open in browser
clasp logs          # View logs
clasp deploy        # Create new version

# Git (separate frontend hosting)
git add .
git commit -m "Update"
git push origin main    # GitHub Pages auto-deploys
```

---

**Ready to stop copy/pasting? Run `./setup-clasp.sh` to get started!** 🚀
