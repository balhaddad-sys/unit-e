# Unit-E Healthcare Mobile App

Professional healthcare management mobile application for Android and iOS with AI-powered medical consultation features.

## Features

- **Patient Management**: Comprehensive patient records, medical history, and vital signs tracking
- **Ward Rounds**: Schedule and manage daily ward rounds with real-time progress tracking
- **AI Medical Consultant**: AI-powered medical consultation and clinical decision support
- **Lab Report Scanner**: OCR-based lab report scanning with automatic result parsing
- **Real-time Sync**: Seamless synchronization with Google Apps Script backend
- **Offline Support**: Continue working even without internet connection
- **HIPAA Compliant**: Secure data handling and storage

## Technology Stack

- **React Native 0.73.2**: Cross-platform mobile framework
- **React Navigation 6**: Native navigation solution
- **Axios**: HTTP client for API communication
- **React Native Vision Camera**: Advanced camera features
- **AsyncStorage**: Local data persistence
- **React Native Vector Icons**: Material Design icons

## Prerequisites

Before you begin, ensure you have the following installed:

### Common Requirements
- **Node.js**: v18 or higher
- **npm**: v9 or higher
- **Git**: Latest version
- **Watchman**: For file watching (recommended)

### For Android Development
- **Android Studio**: Latest version
- **Android SDK**: API Level 34
- **Java Development Kit (JDK)**: Version 17
- **Android NDK**: Version 25.1.8937393

### For iOS Development (macOS only)
- **Xcode**: Latest version (14.0+)
- **CocoaPods**: Latest version
- **iOS Simulator**: iOS 13.0+
- **Command Line Tools**: Xcode command line tools

## Installation

### 1. Clone the Repository

\`\`\`bash
git clone https://github.com/balhaddad-sys/unit-e.git
cd unit-e/mobile
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Configure Environment Variables

Create a \`.env\` file in the mobile directory:

\`\`\`bash
cp .env.example .env
\`\`\`

Edit \`.env\` with your API keys:

\`\`\`env
API_BASE_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
OPENAI_API_KEY=your_openai_api_key_here
GOOGLE_VISION_API_KEY=your_google_vision_api_key_here
\`\`\`

### 4. Platform-Specific Setup

#### iOS Setup (macOS only)

\`\`\`bash
cd ios
pod install
cd ..
\`\`\`

#### Android Setup

No additional setup required. Gradle will handle dependencies automatically.

## Running the App

### Start Metro Bundler

\`\`\`bash
npm start
\`\`\`

### Run on Android

\`\`\`bash
# Using npm
npm run android

# Or using npx
npx react-native run-android
\`\`\`

**Requirements:**
- Android device connected via USB with USB debugging enabled, OR
- Android emulator running from Android Studio

### Run on iOS (macOS only)

\`\`\`bash
# Using npm
npm run ios

# Or using npx
npx react-native run-ios

# Specify a device
npx react-native run-ios --device "iPhone 15 Pro"
\`\`\`

**Requirements:**
- iOS Simulator running from Xcode, OR
- Physical iOS device connected via USB

## Building for Production

### Android APK

Build a release APK:

\`\`\`bash
cd android
./gradlew assembleRelease
\`\`\`

The APK will be located at:
\`android/app/build/outputs/apk/release/app-release.apk\`

### Android App Bundle (AAB)

For Google Play Store submission:

\`\`\`bash
cd android
./gradlew bundleRelease
\`\`\`

The AAB will be located at:
\`android/app/build/outputs/bundle/release/app-release.aab\`

### iOS Archive

1. Open the project in Xcode:
   \`\`\`bash
   open ios/UnitE.xcworkspace
   \`\`\`

2. Select **Product** > **Archive**

3. Follow the Xcode Organizer to upload to App Store Connect

## Code Signing

### Android

1. Generate a signing key:
   \`\`\`bash
   keytool -genkeypair -v -storetype PKCS12 -keystore unite-release.keystore -alias unite-key -keyalg RSA -keysize 2048 -validity 10000
   \`\`\`

2. Create \`android/gradle.properties\`:
   \`\`\`properties
   MYAPP_RELEASE_STORE_FILE=unite-release.keystore
   MYAPP_RELEASE_KEY_ALIAS=unite-key
   MYAPP_RELEASE_STORE_PASSWORD=your_password
   MYAPP_RELEASE_KEY_PASSWORD=your_password
   \`\`\`

3. Update \`android/app/build.gradle\` to use release signing config

### iOS

1. Register your app in Apple Developer Portal
2. Create App ID: \`com.unite.healthcare\`
3. Generate provisioning profiles
4. Configure in Xcode under **Signing & Capabilities**

## App Store Submission

### Google Play Store

1. Create a Google Play Developer account
2. Build the AAB bundle
3. Create a new app in Play Console
4. Upload the AAB
5. Complete store listing
6. Submit for review

### Apple App Store

1. Create an Apple Developer account
2. Register app in App Store Connect
3. Archive the app in Xcode
4. Upload to App Store Connect
5. Complete app metadata
6. Submit for review

## Troubleshooting

### Common Issues

#### Metro Bundler Port Already in Use

\`\`\`bash
npx react-native start --reset-cache
\`\`\`

#### Android Build Fails

\`\`\`bash
cd android
./gradlew clean
cd ..
npm run android
\`\`\`

#### iOS Build Fails

\`\`\`bash
cd ios
pod deintegrate
pod install
cd ..
npm run ios
\`\`\`

#### Dependencies Issues

\`\`\`bash
# Clear all caches
rm -rf node_modules
rm -rf ios/Pods
rm -rf ios/build
rm -rf android/build
rm -rf android/app/build

# Reinstall
npm install
cd ios && pod install && cd ..
\`\`\`

### Camera Issues

Ensure permissions are granted:
- **Android**: Check AndroidManifest.xml permissions
- **iOS**: Check Info.plist usage descriptions

### Network Issues

- Check \`.env\` file configuration
- Verify API_BASE_URL is correct
- Ensure backend server is running
- Check device internet connection

## Project Structure

\`\`\`
mobile/
├── android/              # Android native code
├── ios/                  # iOS native code
├── src/
│   ├── App.js           # Main app component
│   ├── context/         # React Context providers
│   ├── screens/         # App screens
│   │   ├── Auth/        # Login, Register
│   │   ├── Dashboard/   # Dashboard
│   │   ├── Patients/    # Patient management
│   │   ├── WardRounds/  # Ward rounds
│   │   ├── AI/          # AI consultation
│   │   ├── Settings/    # Settings
│   │   └── Profile/     # User profile
│   └── services/        # API services
├── assets/              # Images, fonts, icons
├── .env.example         # Environment variables template
├── package.json         # Dependencies
└── README.md           # This file
\`\`\`

## API Documentation

The app communicates with the Google Apps Script backend. Key endpoints:

- **Authentication**: login, register, logout
- **Patients**: getPatients, getPatient, addPatient, updatePatient, deletePatient
- **Ward Rounds**: getWardRounds, getWardRound, createWardRound, updateWardRound
- **AI Services**: performOCR, parseLabResults, getAIConsultation, getClinicalDecisionSupport
- **Analytics**: getDashboardStats

## Security

- All API communications use HTTPS
- User tokens stored securely in AsyncStorage
- Sensitive data encrypted at rest
- Camera and photo permissions requested at runtime
- HIPAA-compliant data handling

## Performance Optimization

- Hermes JavaScript engine enabled
- Image compression for uploads
- Lazy loading of screens
- Optimized list rendering with FlatList
- Memoization of expensive computations

## Contributing

1. Fork the repository
2. Create your feature branch (\`git checkout -b feature/AmazingFeature\`)
3. Commit your changes (\`git commit -m 'Add some AmazingFeature'\`)
4. Push to the branch (\`git push origin feature/AmazingFeature\`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
- **GitHub Issues**: https://github.com/balhaddad-sys/unit-e/issues
- **Email**: support@unite-healthcare.com

## Acknowledgments

- React Native community
- Google Apps Script team
- OpenAI for AI capabilities
- All contributors and testers

---

**Version**: 1.0.0
**Last Updated**: January 2026
**Maintained by**: Unit-E Healthcare Team
