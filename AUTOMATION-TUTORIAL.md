# Full Automation Tutorial - Push to GitHub, Auto-Deploy Everything

This tutorial will set up **automatic deployment** so that:
- ✅ Push code to GitHub
- ✅ GitHub automatically deploys to Google Apps Script
- ✅ Zero manual steps after setup

**Time to complete:** 15-20 minutes (one-time setup)

---

## 📋 What You'll Need

- ✅ Google Account with Apps Script access
- ✅ GitHub account (you have this)
- ✅ Node.js installed on your computer
- ✅ Your Unit E repository

---

## 🎯 Step-by-Step Setup

### **Step 1: Install clasp** (2 minutes)

Open your terminal:

```bash
# Install clasp globally
npm install -g @google/clasp

# Verify installation
clasp --version
# Should show something like: 2.4.2
```

**If you get "command not found":**
```bash
# Make sure Node.js is installed
node --version
npm --version

# If not installed, install Node.js first:
# Ubuntu/Debian:
sudo apt install nodejs npm

# Mac:
brew install node

# Then try clasp again
npm install -g @google/clasp
```

---

### **Step 2: Enable Apps Script API** (1 minute)

1. Go to: https://script.google.com/home/usersettings
2. Turn on **"Google Apps Script API"**
3. Click **Save**

![Enable API](https://developers.google.com/static/apps-script/images/settings-appsscript.png)

---

### **Step 3: Login to clasp** (2 minutes)

```bash
# Login to your Google account
clasp login
```

**What happens:**
- A browser window opens
- Sign in with your Google account (the one with your Apps Script project)
- Click **"Allow"** to give clasp permission
- You'll see: "Logged in! You may close this page."
- Go back to terminal

**You should see:**
```
Authorization successful.

Default credentials saved to: ~/.clasprc.json
```

---

### **Step 4: Get Your Script ID** (1 minute)

1. Go to: https://script.google.com
2. Open your **"Unit E Ward Rounds"** project
3. Click ⚙️ **Project Settings** (left sidebar)
4. Find **"Script ID"**
5. Click **Copy** button

The Script ID looks like:
```
1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7
```

**Keep this - you'll need it!**

---

### **Step 5: Setup .clasp.json** (2 minutes)

In your project directory:

```bash
cd /home/user/unit-e

# Create .clasp.json file
nano .clasp.json
```

Paste this content (replace YOUR_SCRIPT_ID with your actual Script ID):

```json
{
  "scriptId": "YOUR_SCRIPT_ID_HERE",
  "rootDir": ".",
  "filePushOrder": [
    "Code.gs",
    "AIDebugger.gs"
  ]
}
```

**Example:**
```json
{
  "scriptId": "1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7",
  "rootDir": ".",
  "filePushOrder": [
    "Code.gs",
    "AIDebugger.gs"
  ]
}
```

Save and exit (Ctrl+X, Y, Enter)

---

### **Step 6: Test Manual Push** (1 minute)

Before automating, let's make sure manual push works:

```bash
# Push to Google Apps Script
clasp push
```

**You should see:**
```
└─ Code.gs
└─ AIDebugger.gs
Pushed 2 files.
```

**If it worked:** Great! Continue to next step.
**If it failed:** Check the troubleshooting section at the bottom.

---

### **Step 7: Get clasp Credentials for GitHub** (3 minutes)

GitHub needs your clasp credentials to deploy automatically.

```bash
# View your clasp credentials
cat ~/.clasprc.json
```

**You'll see something like:**
```json
{
  "token": {
    "access_token": "ya29.a0AfH6SMBxyz...",
    "refresh_token": "1//0gFxyz...",
    "scope": "https://www.googleapis.com/auth/...",
    "token_type": "Bearer",
    "expiry_date": 1234567890123
  },
  "oauth2ClientSettings": {
    "clientId": "123456789-xyz.apps.googleusercontent.com",
    "clientSecret": "ABC-xyz",
    "redirectUri": "http://localhost"
  },
  "isLocalCreds": false
}
```

**⚠️ IMPORTANT:** Keep this JSON safe! It's like a password.

**Copy the ENTIRE JSON content** (including the curly braces)

---

### **Step 8: Add Credentials to GitHub** (2 minutes)

1. Go to your GitHub repository: https://github.com/balhaddad-sys/unit-e

2. Click **Settings** (top right)

3. In left sidebar, click **Secrets and variables** → **Actions**

4. Click **"New repository secret"** button

5. Fill in:
   - **Name:** `CLASP_TOKEN`
   - **Secret:** Paste the entire JSON from Step 7

6. Click **"Add secret"**

**You should see:**
```
CLASP_TOKEN
Updated now by you
```

---

### **Step 9: Create GitHub Actions Workflow** (3 minutes)

This file tells GitHub what to do when you push code.

```bash
cd /home/user/unit-e

# Create the workflow file
mkdir -p .github/workflows
nano .github/workflows/deploy-apps-script.yml
```

**Paste this content:**

```yaml
name: Deploy to Google Apps Script

# When to run: whenever .gs files are pushed to main branch
on:
  push:
    branches: [ main ]
    paths:
      - '**.gs'
      - '.clasp.json'

jobs:
  deploy:
    name: Deploy Backend
    runs-on: ubuntu-latest

    steps:
      # Step 1: Get the code
      - name: Checkout code
        uses: actions/checkout@v3

      # Step 2: Setup Node.js
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      # Step 3: Install clasp
      - name: Install clasp
        run: npm install -g @google/clasp

      # Step 4: Setup credentials
      - name: Setup clasp credentials
        run: echo '${{ secrets.CLASP_TOKEN }}' > ~/.clasprc.json

      # Step 5: Deploy to Apps Script
      - name: Push to Google Apps Script
        run: clasp push

      # Step 6: Success message
      - name: Deployment complete
        run: |
          echo "✅ Successfully deployed to Google Apps Script!"
          echo "🎉 Your backend is now live!"
```

Save and exit (Ctrl+X, Y, Enter)

---

### **Step 10: Commit and Push** (2 minutes)

Now let's push everything to GitHub to test the automation:

```bash
cd /home/user/unit-e

# Add the new files
git add .clasp.json .github/workflows/deploy-apps-script.yml

# Commit
git commit -m "Add automated deployment with GitHub Actions"

# Push to GitHub
git push origin main
```

---

### **Step 11: Watch the Magic!** (30 seconds)

1. Go to your GitHub repo: https://github.com/balhaddad-sys/unit-e

2. Click **"Actions"** tab (top menu)

3. You should see a workflow running: **"Deploy to Google Apps Script"**

4. Click on it to watch the progress

**You'll see:**
```
✅ Checkout code
✅ Setup Node.js
✅ Install clasp
✅ Setup clasp credentials
✅ Push to Google Apps Script
✅ Deployment complete
```

**If all steps are green ✅ - SUCCESS!** 🎉

---

### **Step 12: Test It Works** (1 minute)

Let's make a small change and see if it auto-deploys:

```bash
cd /home/user/unit-e

# Make a small change to Code.gs (add a comment)
echo "// Auto-deployment test" >> Code.gs

# Commit and push
git add Code.gs
git commit -m "Test auto-deployment"
git push origin main
```

**Go to GitHub Actions again:**
- You should see a new workflow run automatically
- It should deploy your changes to Google Apps Script
- All steps should be green ✅

---

## 🎉 You're Done!

**Congratulations! You now have full automation!**

### **From Now On:**

**1. Edit files locally:**
```bash
nano Code.gs
nano AIDebugger.gs
# Make your changes
```

**2. Push to GitHub:**
```bash
git add .
git commit -m "Your changes"
git push origin main
```

**3. That's it!** GitHub automatically deploys to Apps Script! ✨

---

## 📱 Bonus: Frontend Auto-Deployment (Optional)

Want frontend auto-deployment too? Easy!

### Enable GitHub Pages

1. GitHub repo → **Settings** → **Pages**
2. **Source:** Deploy from branch
3. **Branch:** main
4. **Folder:** / (root)
5. Click **Save**

**Your frontend will be live at:**
```
https://balhaddad-sys.github.io/unit-e/
```

**Now:**
- ✅ Backend (.gs files) → Auto-deploys via GitHub Actions
- ✅ Frontend (HTML/JS) → Auto-deploys via GitHub Pages
- ✅ Just push to GitHub, everything updates! 🚀

---

## 🔍 How to Monitor Deployments

### **Check GitHub Actions:**
1. Go to: https://github.com/balhaddad-sys/unit-e/actions
2. See all deployment runs
3. Click any run to see details
4. Green ✅ = successful, Red ❌ = failed

### **View Logs:**
Click on any step in a workflow run to see detailed logs.

### **Get Notifications:**
GitHub can email you when deployments fail:
- Settings → Notifications → Actions
- Enable notifications for failed workflows

---

## 🐛 Troubleshooting

### ❌ "clasp: command not found"

```bash
# Check Node.js is installed
node --version

# If not found, install Node.js first
# Then install clasp
npm install -g @google/clasp
```

### ❌ "User has not enabled the Apps Script API"

1. Go to: https://script.google.com/home/usersettings
2. Enable "Google Apps Script API"
3. Try `clasp login` again

### ❌ GitHub Action fails with "Push error"

**Check .clasp.json:**
```bash
cat .clasp.json
# Make sure scriptId is correct
```

**Check CLASP_TOKEN secret:**
1. GitHub → Settings → Secrets → Actions
2. Make sure `CLASP_TOKEN` exists
3. If not, repeat Step 8

### ❌ "Access token expired"

Your clasp credentials expired. Re-authenticate:

```bash
# Login again
clasp login

# Get new credentials
cat ~/.clasprc.json

# Update GitHub secret:
# Settings → Secrets → CLASP_TOKEN → Update
```

### ❌ Workflow doesn't run automatically

**Check workflow trigger:**
- It only runs when you push `.gs` files
- Push a .gs file to trigger it

**Force trigger:**
```bash
# Make a small change to Code.gs
echo "// Trigger deployment" >> Code.gs
git add Code.gs
git commit -m "Trigger deployment"
git push origin main
```

---

## 📊 What Gets Deployed When?

| File Type | Deployment Method | Speed | Manual? |
|-----------|------------------|-------|---------|
| `.gs` files (backend) | GitHub Actions → Apps Script | ~30 sec | No ✅ |
| `.html` files (frontend) | GitHub Pages | ~30 sec | No ✅ |
| `.js` files (frontend) | GitHub Pages | ~30 sec | No ✅ |
| `.css` files (frontend) | GitHub Pages | ~30 sec | No ✅ |

**Everything is automatic!** 🎉

---

## 🔐 Security Notes

### **CLASP_TOKEN Secret**
- ✅ Only accessible to GitHub Actions
- ✅ Not visible in public repo
- ✅ Can be rotated anytime
- ❌ Never commit `.clasprc.json` to repo

### **Good Practice:**

Add to `.gitignore`:
```bash
echo ".clasprc.json" >> .gitignore
git add .gitignore
git commit -m "Ignore clasp credentials"
git push
```

---

## 🎓 Advanced: Deployment Branches

Want different branches for dev/production?

**Update workflow trigger:**
```yaml
on:
  push:
    branches:
      - main        # Production
      - staging     # Staging
    paths:
      - '**.gs'
```

**Use different Script IDs per branch:**
```yaml
- name: Deploy
  run: |
    if [ "${{ github.ref }}" == "refs/heads/main" ]; then
      clasp push --scriptId "${{ secrets.PROD_SCRIPT_ID }}"
    else
      clasp push --scriptId "${{ secrets.STAGING_SCRIPT_ID }}"
    fi
```

---

## 📚 Additional Resources

- **clasp GitHub:** https://github.com/google/clasp
- **GitHub Actions Docs:** https://docs.github.com/en/actions
- **Apps Script API:** https://developers.google.com/apps-script/api

---

## ✅ Quick Command Reference

```bash
# One-time setup
npm install -g @google/clasp
clasp login
# Create .clasp.json with your scriptId
# Add CLASP_TOKEN to GitHub secrets
# Create .github/workflows/deploy-apps-script.yml
git push origin main

# Daily workflow
git add .
git commit -m "Your changes"
git push origin main
# That's it! GitHub auto-deploys everything!

# Monitoring
# View: https://github.com/YOUR_USERNAME/YOUR_REPO/actions

# Manual deploy (if needed)
clasp push
```

---

## 🎯 Summary

**What you accomplished:**
1. ✅ Installed and configured clasp
2. ✅ Connected GitHub to Google Apps Script
3. ✅ Created automated deployment workflow
4. ✅ Tested everything works

**What happens now:**
- ✅ Push code to GitHub
- ✅ GitHub Actions automatically deploys to Apps Script
- ✅ Deployment completes in ~30 seconds
- ✅ Zero manual steps!

**You just saved yourself hours of copy/pasting!** 🎉

---

**Questions? Check the troubleshooting section or refer to `DEPLOYMENT-GUIDE.md` for more details.**

**Happy coding! Now go make some changes and watch the magic happen! ✨**
