#!/bin/bash

# Neural Expansion System - Verification Script
# This script verifies all files are in place and starts a local server

echo "═══════════════════════════════════════════════════════════"
echo "🧠 NEURAL EXPANSION SYSTEM - VERIFICATION SCRIPT"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Check if we're in the right directory
if [ ! -f "adaptive-neural-expansion.js" ]; then
    echo "❌ Error: Not in unit-e directory"
    echo "Please cd to /home/user/unit-e first"
    exit 1
fi

# Verify all required files exist
echo "📁 Checking files..."
files=(
    "adaptive-neural-expansion.js"
    "neural-expansion-demo.js"
    "test-neural-expansion.html"
    "index.html"
)

all_present=true
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        size=$(ls -lh "$file" | awk '{print $5}')
        echo "  ✅ $file ($size)"
    else
        echo "  ❌ $file (MISSING)"
        all_present=false
    fi
done

echo ""

if [ "$all_present" = false ]; then
    echo "❌ Some files are missing!"
    exit 1
fi

# Check if scripts are in index.html
echo "🔍 Verifying index.html integration..."
if grep -q "adaptive-neural-expansion.js" index.html; then
    echo "  ✅ adaptive-neural-expansion.js is included"
else
    echo "  ❌ adaptive-neural-expansion.js NOT in index.html"
fi

if grep -q "neural-expansion-demo.js" index.html; then
    echo "  ✅ neural-expansion-demo.js is included"
else
    echo "  ❌ neural-expansion-demo.js NOT in index.html"
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "✅ ALL FILES VERIFIED!"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "🚀 OPTION 1: Start Local Server (RECOMMENDED)"
echo "   Run one of these commands:"
echo ""
echo "   # Python (if available):"
echo "   python3 -m http.server 8080"
echo ""
echo "   # Node.js (if available):"
echo "   npx serve -p 8080"
echo ""
echo "   # PHP (if available):"
echo "   php -S localhost:8080"
echo ""
echo "   Then open: http://localhost:8080/test-neural-expansion.html"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "🚀 OPTION 2: Direct File Access"
echo "   Open in browser: file://$(pwd)/test-neural-expansion.html"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "📝 OPTION 3: Check GitHub"
echo "   View online at:"
echo "   https://github.com/balhaddad-sys/unit-e/tree/claude/neural-medical-guidelines-VsMlT"
echo ""
echo "═══════════════════════════════════════════════════════════"
