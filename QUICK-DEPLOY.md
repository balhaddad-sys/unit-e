# Quick Deploy Reference Card

Stop manually updating Google Apps Script! Here are your options, from simplest to most advanced.

---

## 🚀 Option 1: Use clasp (5-minute setup)

### One-Time Setup

```bash
npm install -g @google/clasp
clasp login
clasp clone YOUR_SCRIPT_ID
```

**Get your Script ID:**
- Go to: https://script.google.com
- Open "Unit E Ward Rounds"
- ⚙️ Settings → Copy "Script ID"

### Deploy Anytime

```bash
clasp push
```

That's it! 2 seconds to deploy. No copy/paste ever again.

---

## 🌐 Option 2: Separate Frontend (Best)

### What It Does
- Frontend (HTML/JS) → GitHub Pages (auto-deploys when you push)
- Backend (.gs files) → Google Apps Script (use clasp)

### Setup

**1. Enable GitHub Pages:**
```
GitHub.com → Your repo → Settings → Pages
Source: main branch → Save
```

Your site: `https://balhaddad-sys.github.io/unit-e/`

**2. Setup clasp for backend:**
```bash
npm install -g @google/clasp
clasp login
clasp clone YOUR_SCRIPT_ID
```

### Daily Use

**Update frontend (HTML/JS/CSS):**
```bash
git push origin main
# Done! GitHub Pages auto-deploys in 30 seconds
```

**Update backend (Code.gs):**
```bash
clasp push
# Done! Live immediately
```

---

## ⚡ Option 3: Full Automation

Push to GitHub → Automatic deployment to Apps Script

### Setup

1. **Copy workflow file:**
   ```bash
   cp .github/workflows/deploy.yml.example .github/workflows/deploy.yml
   ```

2. **Get clasp credentials:**
   ```bash
   clasp login --creds creds.json
   cat ~/.clasprc.json
   ```

3. **Add to GitHub:**
   - Copy the JSON output
   - GitHub → Settings → Secrets → Actions
   - New secret: `CLASP_TOKEN`
   - Paste JSON → Save

### Daily Use

```bash
git push origin main
# GitHub automatically deploys to Apps Script!
# No manual steps needed
```

---

## 📊 Quick Comparison

| Method | Speed | Effort | Best For |
|--------|-------|--------|----------|
| **clasp only** | ⚡ 2 sec | 😊 Easy | Quick start |
| **Separate hosting** | ⚡⚡ Instant | 😊 Easy | **Recommended** |
| **Full automation** | ⚡⚡⚡ Zero | 🤓 Medium | Teams |

---

## 🎯 My Recommendation

**Use Option 2: Separate Frontend & Backend**

**Why:**
- ✅ Update frontend: Just `git push` (no Apps Script touch)
- ✅ Update backend: Rarely needed, use `clasp push`
- ✅ Professional setup
- ✅ Faster for users (CDN)
- ✅ Easy to maintain

**Quick Start:**
```bash
# 1. Setup clasp (one-time, 5 min)
npm install -g @google/clasp
clasp login
clasp clone YOUR_SCRIPT_ID

# 2. Enable GitHub Pages (one-time, 1 min)
# GitHub.com → Settings → Pages → Source: main → Save

# 3. Daily workflow
git push origin main     # Frontend updates (instant)
clasp push              # Backend updates (2 sec, rarely needed)
```

---

## 🆘 Help

**Need your Script ID?**
```
https://script.google.com → Your project → ⚙️ Settings → Script ID
```

**clasp not found?**
```bash
node --version  # Check Node.js installed
npm install -g @google/clasp
```

**GitHub Pages not working?**
```
Wait 1-2 minutes after enabling
Check: Settings → Pages → Source is set to "main"
URL: https://balhaddad-sys.github.io/unit-e/
```

---

## 📚 Full Documentation

See `DEPLOYMENT-GUIDE.md` for complete documentation, troubleshooting, and advanced options.

---

**Ready? Run the setup script:**
```bash
chmod +x setup-clasp.sh
./setup-clasp.sh
```
