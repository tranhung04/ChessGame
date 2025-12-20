# ToolChess - Android APK Build Guide

## Overview
This guide covers building, signing, and testing the production Android APK for the ToolChess mobile application.

---

## Prerequisites

### Required Software
- **Node.js**: >= 14.x
- **npm**: >= 6.x
- **Java JDK**: 11 or 17 (required for Android builds)
- **Android SDK**: Latest version
- **Gradle**: Included with project

### Environment Setup

**Install Java JDK:**
```bash
# Ubuntu/Debian
sudo apt-get install openjdk-17-jdk

# macOS
brew install openjdk@17

# Windows
# Download from: https://adoptium.net/
```

**Set JAVA_HOME:**
```bash
# Linux/macOS
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export PATH=$PATH:$JAVA_HOME/bin

# Add to ~/.bashrc or ~/.zshrc for persistence
echo 'export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64' >> ~/.bashrc
echo 'export PATH=$PATH:$JAVA_HOME/bin' >> ~/.bashrc
```

**Verify Installation:**
```bash
java -version
# Should show: openjdk version "17.x.x"

javac -version
# Should show: javac 17.x.x
```

---

## Step 1: Generate Release Keystore

**IMPORTANT:** Only do this once! Keep the keystore file and passwords secure!

```bash
# Navigate to android/app directory
cd android/app

# Generate keystore
keytool -genkeypair -v \
  -storetype PKCS12 \
  -keystore toolchess-release.keystore \
  -alias toolchess-key \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000

# You will be prompted for:
# - Keystore password (choose strong password, min 6 chars)
# - Key password (can be same as keystore password)
# - Your name
# - Organization unit
# - Organization name
# - City/Locality
# - State/Province
# - Country code (2 letters)
```

**Example:**
```
Enter keystore password: MyStrongPassword123!
Re-enter new password: MyStrongPassword123!
What is your first and last name?
  [Unknown]:  ToolChess Team
What is the name of your organizational unit?
  [Unknown]:  Development
What is the name of your organization?
  [Unknown]:  ToolChess
What is the name of your City or Locality?
  [Unknown]:  Hanoi
What is the name of your State or Province?
  [Unknown]:  Hanoi
What is the two-letter country code for this unit?
  [Unknown]:  VN
Is CN=ToolChess Team, OU=Development, O=ToolChess, L=Hanoi, ST=Hanoi, C=VN correct?
  [no]:  yes

Enter key password for <toolchess-key>
        (RETURN if same as keystore password):
```

**Backup Keystore:**
```bash
# CRITICAL: Backup keystore to secure location
# If you lose this, you cannot update your app on Play Store!

# Copy to secure backup location
cp toolchess-release.keystore ~/secure-backups/
# Or upload to secure cloud storage
```

---

## Step 2: Configure Gradle for Signing

### Create gradle.properties (Secure Method)

```bash
# Create gradle.properties in android directory
cd android
nano gradle.properties
```

**Add these lines:**
```properties
# Release signing configuration
TOOLCHESS_RELEASE_STORE_FILE=toolchess-release.keystore
TOOLCHESS_RELEASE_KEY_ALIAS=toolchess-key
TOOLCHESS_RELEASE_STORE_PASSWORD=your_keystore_password_here
TOOLCHESS_RELEASE_KEY_PASSWORD=your_key_password_here

# Build optimization
android.enableMinifyInReleaseBuilds=true
android.enableShrinkResourcesInReleaseBuilds=true
android.enablePngCrunchInReleaseBuilds=true
```

**SECURITY WARNING:** 
- Never commit `gradle.properties` with passwords to version control!
- Add to `.gitignore`: `android/gradle.properties`

### Update build.gradle

```bash
# Edit android/app/build.gradle
nano app/build.gradle
```

**Add signing configuration:**
```gradle
android {
    ...
    
    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
        release {
            if (project.hasProperty('TOOLCHESS_RELEASE_STORE_FILE')) {
                storeFile file(TOOLCHESS_RELEASE_STORE_FILE)
                storePassword TOOLCHESS_RELEASE_STORE_PASSWORD
                keyAlias TOOLCHESS_RELEASE_KEY_ALIAS
                keyPassword TOOLCHESS_RELEASE_KEY_PASSWORD
            }
        }
    }
    
    buildTypes {
        debug {
            signingConfig signingConfigs.debug
        }
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
        }
    }
}
```

---

## Step 3: Update App Configuration

### Update app.json

```json
{
  "expo": {
    "name": "ToolChess",
    "slug": "toolchess",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#8B4513"
    },
    "android": {
      "package": "com.toolchess.mobile",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#8B4513"
      },
      "permissions": [
        "INTERNET",
        "ACCESS_NETWORK_STATE"
      ]
    }
  }
}
```

### Update Production API URL

```javascript
// src/config/constants.js

const ENV = {
  development: {
    API_BASE_URL: 'http://localhost:3000',
  },
  production: {
    API_BASE_URL: 'https://api.toolchess.com',  // Update this!
  }
};

const environment = __DEV__ ? 'development' : 'production';

export default ENV[environment];
```

---

## Step 4: Build Production APK

### Method 1: Using Build Script (Recommended)

```bash
# Make script executable
chmod +x build-apk.sh

# Run build script
./build-apk.sh
```

### Method 2: Manual Build

```bash
# Navigate to project root
cd /path/to/toolchess-rebuild

# Install dependencies
npm install

# Navigate to android directory
cd android

# Clean previous builds
./gradlew clean

# Build release APK
./gradlew assembleRelease

# APK will be at:
# android/app/build/outputs/apk/release/app-release.apk
```

### Build with Environment Variables (Alternative)

```bash
# Set passwords as environment variables (more secure)
export TOOLCHESS_RELEASE_STORE_PASSWORD="your_password"
export TOOLCHESS_RELEASE_KEY_PASSWORD="your_password"

# Build
cd android
./gradlew assembleRelease
```

---

## Step 5: Verify APK Signature

```bash
# Verify APK is signed
jarsigner -verify -verbose -certs \
  app/build/outputs/apk/release/app-release.apk

# Should show:
# jar verified.
# This jar contains entries whose certificate chain is invalid.
# This jar contains signatures that do not include a timestamp.

# Get detailed signature info
keytool -printcert -jarfile \
  app/build/outputs/apk/release/app-release.apk

# Should show your certificate details
```

---

## Step 6: Test Release APK

### Install on Device

```bash
# Connect Android device via USB
# Enable USB debugging on device

# Check device connected
adb devices

# Install APK
adb install app/build/outputs/apk/release/app-release.apk

# Or install with replacement
adb install -r app/build/outputs/apk/release/app-release.apk
```

### Test Checklist

Run through the manual test checklist:

- [ ] App launches successfully
- [ ] No crash on startup
- [ ] Login/Register works
- [ ] Game plays correctly
- [ ] Premium purchase flow works
- [ ] Leaderboard loads
- [ ] Profile displays correctly
- [ ] Offline mode works
- [ ] No console errors
- [ ] Performance is acceptable

---

## Step 7: Optimize APK Size

### Enable ProGuard

Already configured in `build.gradle`:
```gradle
buildTypes {
    release {
        minifyEnabled true
        shrinkResources true
        proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
    }
}
```

### Check APK Size

```bash
# Check APK size
ls -lh app/build/outputs/apk/release/app-release.apk

# Analyze APK contents
unzip -l app/build/outputs/apk/release/app-release.apk | head -20

# Use Android Studio APK Analyzer (recommended)
# Build > Analyze APK > Select app-release.apk
```

### Size Optimization Tips

1. **Remove unused resources:**
   ```gradle
   android {
       buildTypes {
           release {
               shrinkResources true
           }
       }
   }
   ```

2. **Enable PNG crunching:**
   ```gradle
   android {
       buildTypes {
           release {
               crunchPngs true
           }
       }
   }
   ```

3. **Use WebP images instead of PNG**

4. **Remove unused dependencies**

---

## Step 8: Generate App Bundle (AAB) for Play Store

Google Play Store prefers AAB format over APK.

```bash
# Build App Bundle
cd android
./gradlew bundleRelease

# Bundle will be at:
# android/app/build/outputs/bundle/release/app-release.aab
```

**Verify Bundle:**
```bash
# Install bundletool
# Download from: https://github.com/google/bundletool/releases

# Generate APKs from bundle
java -jar bundletool.jar build-apks \
  --bundle=app/build/outputs/bundle/release/app-release.aab \
  --output=app-release.apks \
  --ks=app/toolchess-release.keystore \
  --ks-pass=pass:your_password \
  --ks-key-alias=toolchess-key \
  --key-pass=pass:your_password

# Install on connected device
java -jar bundletool.jar install-apks --apks=app-release.apks
```

---

## Step 9: Prepare for Play Store

### Required Assets

1. **App Icon** (512x512 PNG)
   - Location: `assets/icon.png`
   - No transparency
   - High quality

2. **Feature Graphic** (1024x500 PNG)
   - Create promotional banner
   - No transparency

3. **Screenshots** (Minimum 2, up to 8)
   - Phone: 16:9 or 9:16 aspect ratio
   - Tablet: 16:9 or 9:16 aspect ratio
   - Minimum dimension: 320px
   - Maximum dimension: 3840px

4. **Privacy Policy URL**
   - Required for apps that handle user data
   - Host at: https://toolchess.com/privacy-policy

### App Information

- **Title:** ToolChess
- **Short Description:** (80 chars max)
  "Cờ Tướng Việt Nam - Chơi cờ, nâng cao kỹ năng, thi đấu với AI thông minh"

- **Full Description:** (4000 chars max)
  ```
  ToolChess là ứng dụng chơi Cờ Tướng Việt Nam với AI thông minh và nhiều tính năng hấp dẫn.

  ✨ TÍNH NĂNG NỔI BẬT:
  • Chơi cờ với AI thông minh
  • Chế độ Fire Mode đặc biệt
  • Bảng xếp hạng toàn cầu
  • Gói Premium với nhiều ưu đãi
  • Lịch sử trận đấu chi tiết
  • Giao diện đẹp mắt, dễ sử dụng

  🎮 CÁCH CHƠI:
  1. Đặt quân Xe của bạn lên bàn cờ
  2. Di chuyển quân Xe để ăn quân địch
  3. Ăn Tướng địch để kích hoạt Fire Mode
  4. Tích lũy điểm cao nhất có thể

  💎 GÓI PREMIUM:
  • Tăng điểm thưởng lên đến 50%
  • Lượt hồi sinh không giới hạn
  • Giao diện VIP độc quyền
  • Hỗ trợ ưu tiên 24/7

  📊 BẢNG XẾP HẠNG:
  Thi đấu với người chơi trên toàn thế giới và leo lên top đầu bảng xếp hạng!

  Tải ngay để trải nghiệm!
  ```

- **Category:** Games > Board
- **Content Rating:** Everyone
- **Contact Email:** support@toolchess.com
- **Website:** https://toolchess.com

---

## Step 10: Upload to Play Store

### Create Play Console Account

1. Go to https://play.google.com/console
2. Pay $25 one-time registration fee
3. Complete account setup

### Create App

1. Click "Create app"
2. Fill in app details
3. Select "App" (not Game)
4. Choose "Free" pricing

### Upload APK/AAB

1. Go to "Release" > "Production"
2. Click "Create new release"
3. Upload `app-release.aab`
4. Add release notes:
   ```
   Phiên bản 1.0.0 - Ra mắt chính thức
   • Chơi Cờ Tướng với AI thông minh
   • Chế độ Fire Mode đặc biệt
   • Bảng xếp hạng toàn cầu
   • Gói Premium với nhiều ưu đãi
   ```

### Complete Store Listing

1. Upload all required assets
2. Add screenshots
3. Set content rating
4. Add privacy policy URL
5. Set target audience
6. Complete questionnaire

### Submit for Review

1. Review all information
2. Click "Submit for review"
3. Wait 1-3 days for approval

---

## Troubleshooting

### Build Fails

**Error: JAVA_HOME not set**
```bash
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
```

**Error: SDK location not found**
```bash
# Create local.properties in android directory
echo "sdk.dir=/path/to/Android/Sdk" > android/local.properties
```

**Error: Keystore not found**
```bash
# Verify keystore location
ls -la android/app/toolchess-release.keystore

# Check gradle.properties path
cat android/gradle.properties | grep STORE_FILE
```

### APK Installation Fails

**Error: INSTALL_FAILED_UPDATE_INCOMPATIBLE**
```bash
# Uninstall old version first
adb uninstall com.toolchess.mobile

# Then install new version
adb install app/build/outputs/apk/release/app-release.apk
```

**Error: INSTALL_PARSE_FAILED_NO_CERTIFICATES**
```bash
# APK not signed properly
# Rebuild with correct signing configuration
```

### App Crashes on Launch

```bash
# Check logs
adb logcat | grep ToolChess

# Common issues:
# - Missing permissions in AndroidManifest.xml
# - ProGuard removing required code
# - Native library issues
```

---

## Build Automation

### CI/CD with GitHub Actions

Create `.github/workflows/android-build.yml`:

```yaml
name: Android Build

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up JDK 17
      uses: actions/setup-java@v3
      with:
        java-version: '17'
        distribution: 'temurin'
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm install
    
    - name: Build Android Release
      run: |
        cd android
        ./gradlew assembleRelease
      env:
        TOOLCHESS_RELEASE_STORE_PASSWORD: ${{ secrets.KEYSTORE_PASSWORD }}
        TOOLCHESS_RELEASE_KEY_PASSWORD: ${{ secrets.KEY_PASSWORD }}
    
    - name: Upload APK
      uses: actions/upload-artifact@v3
      with:
        name: app-release
        path: android/app/build/outputs/apk/release/app-release.apk
```

---

## Version Management

### Increment Version

**Update app.json:**
```json
{
  "expo": {
    "version": "1.0.1",  // Increment this
    "android": {
      "versionCode": 2   // Increment this (must be higher than previous)
    }
  }
}
```

**Update build.gradle:**
```gradle
defaultConfig {
    versionCode 2
    versionName "1.0.1"
}
```

### Version Naming Convention

- **Major.Minor.Patch** (e.g., 1.0.0)
- **Major:** Breaking changes
- **Minor:** New features
- **Patch:** Bug fixes

---

## Security Checklist

- [ ] Keystore backed up securely
- [ ] Passwords not in version control
- [ ] ProGuard enabled
- [ ] API URLs point to production
- [ ] Debug logging disabled
- [ ] Test accounts removed
- [ ] Sensitive data encrypted
- [ ] SSL certificate pinning (optional)

---

## Additional Resources

- [React Native Android Build](https://reactnative.dev/docs/signed-apk-android)
- [Expo Build Process](https://docs.expo.dev/build/introduction/)
- [Google Play Console](https://play.google.com/console)
- [Android App Bundle](https://developer.android.com/guide/app-bundle)

---

**Last Updated:** December 2024
**Version:** 1.0.0
