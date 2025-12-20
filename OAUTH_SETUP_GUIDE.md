# OAuth Client ID Setup Guide - ToolChess Android

## Lấy SHA-1 Certificate Fingerprint

### 1. Cho Debug Build (Development)

#### Windows:
```bash
keytool -keystore "%USERPROFILE%\.android\debug.keystore" -list -v -alias androiddebugkey -storepass android -keypass android
```

#### macOS/Linux:
```bash
keytool -keystore ~/.android/debug.keystore -list -v -alias androiddebugkey -storepass android -keypass android
```

**Kết quả sẽ hiển thị:**
```
Certificate fingerprints:
         SHA1: AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD
         SHA256: ...
```

Copy dòng SHA1 (bỏ dấu hai chấm nếu cần).

### 2. Cho Production Build

Nếu bạn đã có keystore cho production:

```bash
keytool -keystore path/to/your/release.keystore -list -v
```

Nhập password của keystore khi được yêu cầu.

### 3. Cho Expo Managed Workflow

Nếu bạn đang dùng Expo:

```bash
# Lấy SHA-1 từ Expo
expo credentials:manager -p android
```

Hoặc build APK và extract SHA-1:

```bash
# Build APK
eas build --platform android --profile preview

# Sau khi build xong, download APK và extract certificate
```

## Tạo OAuth Client ID trên Google Cloud Console

### Bước 1: Truy cập Google Cloud Console

1. Đi tới: https://console.cloud.google.com/
2. Chọn project của bạn hoặc tạo project mới
3. Vào **APIs & Services** > **Credentials**

### Bước 2: Tạo OAuth Client ID

1. Click **+ CREATE CREDENTIALS**
2. Chọn **OAuth client ID**
3. Chọn **Application type**: **Android**

### Bước 3: Điền thông tin

**Name**: 
```
ToolChess Android App
```

**Package name**: 
```
com.toolchess.mobile
```
(Lấy từ app.json hoặc android/app/build.gradle)

**SHA-1 certificate fingerprint**:
```
[Paste SHA-1 fingerprint bạn vừa lấy được]
```

### Bước 4: Tạo và Lưu

1. Click **CREATE**
2. Copy **Client ID** được tạo ra
3. Lưu vào file `.env` hoặc `app.json`

## Cấu hình trong ToolChess App

### Option 1: Sử dụng Environment Variables

Thêm vào `src/config/constants.js`:

```javascript
const ENV = {
  dev: {
    API_BASE_URL: 'http://10.66.214.152:5000/api',
    GOOGLE_CLIENT_ID: 'your-dev-client-id.apps.googleusercontent.com',
  },
  staging: {
    API_BASE_URL: 'https://staging-api.toolchess.com/api',
    GOOGLE_CLIENT_ID: 'your-staging-client-id.apps.googleusercontent.com',
  },
  prod: {
    API_BASE_URL: 'https://api.toolchess.com/api',
    GOOGLE_CLIENT_ID: 'your-prod-client-id.apps.googleusercontent.com',
  }
};
```

### Option 2: Thêm vào app.json (cho Expo)

```json
{
  "expo": {
    "android": {
      "googleServicesFile": "./google-services.json",
      "config": {
        "googleSignIn": {
          "apiKey": "YOUR_ANDROID_API_KEY",
          "certificateHash": "YOUR_SHA1_FINGERPRINT"
        }
      }
    }
  }
}
```

## Lưu ý quan trọng

### 1. Debug vs Production Keystores

- **Debug keystore**: Tự động tạo bởi Android SDK, dùng cho development
- **Production keystore**: Bạn phải tự tạo và quản lý, dùng cho release builds

### 2. Tạo Production Keystore (nếu chưa có)

```bash
keytool -genkey -v -keystore toolchess-release.keystore -alias toolchess-key -keyalg RSA -keysize 2048 -validity 10000
```

Lưu keystore này cẩn thận! Mất keystore = không thể update app trên Play Store.

### 3. Multiple Client IDs

Bạn cần tạo **2 OAuth Client IDs**:
- 1 cho **Debug** (dùng debug.keystore SHA-1)
- 1 cho **Production** (dùng release.keystore SHA-1)

### 4. Verify App Ownership (Optional)

Nếu Google yêu cầu verify ownership:
1. Vào Google Play Console
2. Link app với Google Cloud Project
3. Verify qua Play Console

## Troubleshooting

### Lỗi: "keytool is not recognized"

**Windows:**
```bash
# Thêm Java bin vào PATH hoặc dùng full path
"C:\Program Files\Java\jdk-xx.x.x\bin\keytool.exe" -keystore ...
```

**macOS/Linux:**
```bash
# Install Java JDK nếu chưa có
brew install openjdk
```

### Lỗi: "keystore file does not exist"

Debug keystore chưa được tạo. Chạy app một lần trong Android Studio hoặc:

```bash
# Tạo debug keystore thủ công
keytool -genkey -v -keystore ~/.android/debug.keystore -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000
```

### Lỗi: "Sign-in failed" khi test OAuth

1. Kiểm tra package name khớp với app.json
2. Kiểm tra SHA-1 fingerprint đúng
3. Đợi 5-10 phút sau khi tạo OAuth client ID
4. Clear app data và thử lại

## Quick Commands Reference

### Lấy Package Name từ project:

```bash
# Từ app.json
cat app.json | grep "package"

# Từ Android build.gradle
cat android/app/build.gradle | grep "applicationId"
```

### Lấy tất cả fingerprints:

```bash
# Debug
keytool -keystore ~/.android/debug.keystore -list -v -alias androiddebugkey -storepass android -keypass android | grep SHA

# Production
keytool -keystore path/to/release.keystore -list -v | grep SHA
```

## Checklist

- [ ] Lấy được SHA-1 fingerprint cho debug build
- [ ] Lấy được SHA-1 fingerprint cho production build (nếu có)
- [ ] Tạo OAuth Client ID cho debug
- [ ] Tạo OAuth Client ID cho production
- [ ] Lưu Client IDs vào config
- [ ] Test OAuth login trên debug build
- [ ] Verify app ownership (nếu cần)
- [ ] Document Client IDs trong team

## Thông tin ToolChess

**Package Name**: `com.toolchess.mobile`  
**Debug Keystore Location**: `~/.android/debug.keystore` (macOS/Linux) hoặc `%USERPROFILE%\.android\debug.keystore` (Windows)

---

**Lưu ý**: Không commit OAuth Client IDs hoặc keystores vào Git!
