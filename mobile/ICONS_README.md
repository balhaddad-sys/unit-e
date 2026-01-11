# App Icons and Splash Screens

This document provides guidance on generating app icons and splash screens for the Unit-E Healthcare mobile app.

## Required Assets

### iOS Icons

Place icons in \`ios/UnitE/Images.xcassets/AppIcon.appiconset/\`

Required sizes:
- 20x20 (@2x, @3x)
- 29x29 (@2x, @3x)
- 40x40 (@2x, @3x)
- 60x60 (@2x, @3x)
- 76x76 (@1x, @2x)
- 83.5x83.5 (@2x) - iPad Pro
- 1024x1024 (@1x) - App Store

### Android Icons

Place icons in respective \`android/app/src/main/res/\` directories:

- \`mipmap-mdpi/\` - 48x48
- \`mipmap-hdpi/\` - 72x72
- \`mipmap-xhdpi/\` - 96x96
- \`mipmap-xxhdpi/\` - 144x144
- \`mipmap-xxxhdpi/\` - 192x192

### Adaptive Icons (Android)

Place in \`android/app/src/main/res/mipmap-*dpi/\`:
- Foreground image (108x108dp)
- Background color (#15803d - green theme)

## Generating Icons

### Method 1: Using Online Tools

1. **App Icon Generator**: https://www.appicon.co
   - Upload a 1024x1024 PNG master icon
   - Select iOS and Android
   - Download and extract to respective directories

2. **Make App Icon**: https://makeappicon.com
   - Upload your design
   - Generate all sizes automatically

### Method 2: Using CLI Tools

#### Install icon generator:
\`\`\`bash
npm install -g app-icon
\`\`\`

#### Generate icons:
\`\`\`bash
app-icon generate -i icon-master.png
\`\`\`

### Method 3: Manual Creation

Use design tools like:
- Adobe Photoshop
- Sketch
- Figma
- Affinity Designer

## Icon Design Guidelines

### iOS Human Interface Guidelines
- Use a simple, recognizable design
- Fill the entire icon space
- Avoid transparency
- Use consistent visual style
- Test on different backgrounds

### Android Material Design
- Use adaptive icons (foreground + background)
- Keep important content in safe zone (66dp)
- Avoid text in icons
- Use bold, simple shapes
- Consider dark/light themes

## Splash Screen

### iOS (LaunchScreen.storyboard)

The splash screen is configured in \`ios/UnitE/LaunchScreen.storyboard\`

Recommended approach:
1. Use a centered logo
2. Brand color background (#15803d)
3. Keep it simple and fast-loading

### Android (Splash Screen)

Configure in \`android/app/src/main/res/values/styles.xml\`:

\`\`\`xml
<style name="AppTheme" parent="Theme.AppCompat.Light.NoActionBar">
    <item name="android:windowBackground">@drawable/splash_screen</item>
</style>
\`\`\`

Create \`android/app/src/main/res/drawable/splash_screen.xml\`:

\`\`\`xml
<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
    <item android:drawable="@color/splash_background"/>
    <item>
        <bitmap
            android:gravity="center"
            android:src="@drawable/splash_logo"/>
    </item>
</layer-list>
\`\`\`

## Brand Colors

Primary colors for the app:
- **Primary Green**: #15803d
- **Light Green**: #87ceaa
- **Dark Green**: #0f5a2a
- **White**: #ffffff
- **Background**: #f5f5f5

## Recommended Master Icon

Create a 1024x1024 master icon with:
- Medical cross or healthcare symbol
- "Unit-E" branding
- Green color scheme (#15803d)
- Professional, modern design
- Good contrast for visibility

## Testing Icons

### iOS
1. Clean build: \`rm -rf ios/build\`
2. Run app: \`npm run ios\`
3. Check home screen icon

### Android
1. Clean build: \`cd android && ./gradlew clean && cd ..\`
2. Run app: \`npm run android\`
3. Check home screen and app drawer

## Automation with React Native Asset

Install:
\`\`\`bash
npm install -g react-native-asset
\`\`\`

Usage:
\`\`\`bash
react-native-asset
\`\`\`

This will automatically link assets to both platforms.

## Third-Party Tools

### react-native-bootsplash
For advanced splash screen customization:

\`\`\`bash
npm install react-native-bootsplash
npx react-native-bootsplash generate [options]
\`\`\`

### react-native-make
For icon generation:

\`\`\`bash
npm install -g react-native-make
react-native set-icon --path path/to/icon.png
\`\`\`

## Quality Checklist

- [ ] All required icon sizes generated
- [ ] Icons tested on actual devices
- [ ] Splash screen displays correctly
- [ ] No pixelation or distortion
- [ ] Brand colors consistent
- [ ] Icons follow platform guidelines
- [ ] App store icon (1024x1024) ready
- [ ] Adaptive icons configured (Android)
- [ ] Dark mode compatibility checked

## Resources

- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Android Material Design](https://material.io/design)
- [App Icon Template](https://appicontemplate.com/)
- [Icon Size Reference](https://appicon.co/#reference)

---

For any questions about app icons, contact the development team.
