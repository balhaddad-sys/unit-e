#!/bin/bash

# Unit E - Easy Deployment Setup Script
# This script helps you set up clasp for easy Google Apps Script deployment

echo "🚀 Unit E - Easy Deployment Setup"
echo "=================================="
echo ""

# Check if clasp is installed
if ! command -v clasp &> /dev/null; then
    echo "📦 Installing clasp..."
    npm install -g @google/clasp
else
    echo "✅ clasp is already installed"
fi

echo ""
echo "🔑 Next steps:"
echo ""
echo "1. Login to your Google account:"
echo "   clasp login"
echo ""
echo "2. Get your Script ID:"
echo "   - Go to: https://script.google.com"
echo "   - Open your 'Unit E Ward Rounds' project"
echo "   - Click ⚙️ Project Settings"
echo "   - Copy the Script ID"
echo ""
echo "3. Clone your project:"
echo "   clasp clone YOUR_SCRIPT_ID"
echo ""
echo "4. Deploy changes anytime:"
echo "   clasp push"
echo ""
echo "📚 Documentation: https://github.com/google/clasp"
echo ""
echo "That's it! You'll never need to copy/paste again! 🎉"
