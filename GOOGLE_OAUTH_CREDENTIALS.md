# Google OAuth Credentials - ToolChess

## ⚠️ QUAN TRỌNG: File này chứa thông tin nhạy cảm
**Không commit file này vào Git public repository!**

---

## OAuth Client ID Information

### Android OAuth Client ID

**Client ID**: 
```
798352030632-tciovhpq6k065mnljb9a8i8v58cc39vr.apps.googleusercontent.com
```

**Application Type**: Android

**Package Name**: `com.toolchess.mobile`

**SHA-1 Fingerprint (Debug)**: 
```
69:F1:DA:F2:4A:4D:6A:5E:0F:1A:A0:80:5F:FD:33:5F:86:64:D0:14
```

**Created**: December 20, 2025

**Status**: ✅ Active

---

## Đã cấu hình trong code

Client ID đã được lưu vào:
- `src/config/constants.js` → `GOOGLE_WEB_CLIENT_ID`

Sử dụng trong code:
```javascript
import { GOOGLE_WEB_CLIENT_ID } from './src/config/constants';
```

---

## Sử dụng Google Sign-In

### 1. Cài đặt package (nếu cần)

```bash
npm install @react-native-google-signin/google-signin
```

### 2. Cấu hình trong App.js

```javascript
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { GOOGLE_WEB_CLIENT_ID } from './src/config/constants';

// Trong useEffect hoặc component khởi tạo
GoogleSignin.configure({
  webClientId: GOOGLE_WEB_CLIENT_ID,
  offlineAccess: true,
});
```

### 3. Sử dụng trong Login Screen

```javascript
import { GoogleSignin } from '@react-native-google-signin/google-signin';

const handleGoogleLogin = async () => {
  try {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    
    // Gửi idToken lên backend
    const response = await authAPI.loginWithGoogle({
      idToken: userInfo.idToken,
    });
    
    // Handle success
  } catch (error) {
    console.error('Google Sign-In Error:', error);
  }
};
```

---

## Backend Integration

Backend cần verify Google token:

```javascript
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function verifyGoogleToken(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  return payload;
}
```

Thêm vào `backend/.env`:
```
GOOGLE_CLIENT_ID=798352030632-tciovhpq6k065mnljb9a8i8v58cc39vr.apps.googleusercontent.com
```

---

## Production Setup (Sau này)

Khi build production, cần:

1. Tạo release keystore
2. Lấy SHA-1 từ release keystore
3. Tạo OAuth Client ID mới cho production
4. Update `GOOGLE_WEB_CLIENT_ID` trong ENV.prod

---

## Troubleshooting

### Lỗi: "Developer Error"
- Đợi 5-10 phút sau khi tạo OAuth Client ID
- Kiểm tra SHA-1 fingerprint đúng
- Kiểm tra package name khớp

### Lỗi: "Sign in failed"
- Kiểm tra Google Play Services đã cài
- Clear app data và thử lại
- Kiểm tra internet connection

### Lỗi: "API not enabled"
- Enable Google Sign-In API trong Google Cloud Console
- Enable Google+ API (nếu cần)

---

## Security Notes

1. ✅ Client ID đã được lưu trong config
2. ⚠️ Không commit file này vào Git public
3. ✅ Backend phải verify token, không tin client
4. ⚠️ Sử dụng HTTPS cho production API
5. ⚠️ Lưu release keystore an toàn

---

## Links

- Google Cloud Console: https://console.cloud.google.com/apis/credentials
- Project ID: toolchess (hoặc tên project bạn đã tạo)
- OAuth Consent Screen: https://console.cloud.google.com/apis/credentials/consent

---

**Last Updated**: December 20, 2025  
**Status**: ✅ Configured and ready to use
