# Google OAuth Setup - ToolChess Mobile

## Thông tin Project

**Package Name**: `com.toolchess.mobile`  
**SHA-1 Fingerprint (Debug)**: `69:F1:DA:F2:4A:4D:6A:5E:0F:1A:A0:80:5F:FD:33:5F:86:64:D0:14`

## Bước 1: Tạo OAuth Client ID

### Truy cập Google Cloud Console

1. Đi tới: https://console.cloud.google.com/apis/credentials
2. Chọn project hoặc tạo project mới: **ToolChess**
3. Click **+ CREATE CREDENTIALS** → **OAuth client ID**

### Điền thông tin

**Application type**: `Android`

**Name**: 
```
ToolChess Android App (Debug)
```

**Package name**: 
```
com.toolchess.mobile
```

**SHA-1 certificate fingerprint**: 
```
69:F1:DA:F2:4A:4D:6A:5E:0F:1A:A0:80:5F:FD:33:5F:86:64:D0:14
```

### Click CREATE

Sau khi tạo xong, bạn sẽ nhận được:
- **Client ID**: `xxxxx.apps.googleusercontent.com`

## Bước 2: Tạo OAuth Client ID cho Production (Sau này)

Khi bạn build production APK, bạn sẽ cần:

1. Tạo release keystore:
```bash
keytool -genkey -v -keystore toolchess-release.keystore -alias toolchess-key -keyalg RSA -keysize 2048 -validity 10000
```

2. Lấy SHA-1 từ release keystore:
```bash
keytool -keystore toolchess-release.keystore -list -v
```

3. Tạo OAuth Client ID mới với SHA-1 của production

## Bước 3: Cấu hình trong App

### Nếu dùng Google Sign-In

Cài đặt package:
```bash
npm install @react-native-google-signin/google-signin
```

Thêm vào `src/config/constants.js`:
```javascript
const ENV = {
  dev: {
    API_BASE_URL: 'http://10.66.214.152:5000/api',
    GOOGLE_WEB_CLIENT_ID: 'YOUR_CLIENT_ID.apps.googleusercontent.com',
  },
  // ...
};

export const GOOGLE_WEB_CLIENT_ID = currentEnv.GOOGLE_WEB_CLIENT_ID;
```

### Cấu hình Google Sign-In

Trong `App.js` hoặc component khởi tạo:
```javascript
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { GOOGLE_WEB_CLIENT_ID } from './src/config/constants';

GoogleSignin.configure({
  webClientId: GOOGLE_WEB_CLIENT_ID,
  offlineAccess: true,
});
```

## Bước 4: Sử dụng Google Sign-In

Tạo file `src/services/googleAuth.js`:
```javascript
import { GoogleSignin } from '@react-native-google-signin/google-signin';

export const googleSignIn = async () => {
  try {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    return {
      success: true,
      user: userInfo.user,
      idToken: userInfo.idToken,
    };
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const googleSignOut = async () => {
  try {
    await GoogleSignin.signOut();
    return { success: true };
  } catch (error) {
    console.error('Google Sign-Out Error:', error);
    return { success: false, error: error.message };
  }
};
```

## Bước 5: Tích hợp vào Login Screen

Trong `src/screens/Auth/LoginScreen.js`:
```javascript
import { googleSignIn } from '../../services/googleAuth';

const handleGoogleLogin = async () => {
  const result = await googleSignIn();
  if (result.success) {
    // Gửi idToken lên backend để verify và tạo session
    const response = await authAPI.loginWithGoogle({
      idToken: result.idToken,
    });
    // Handle login success
  } else {
    // Handle error
    Alert.alert('Lỗi', result.error);
  }
};
```

## Backend Integration

Backend cần endpoint để verify Google token:

```javascript
// POST /api/auth/google
router.post('/google', async (req, res) => {
  const { idToken } = req.body;
  
  // Verify token với Google
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  
  const payload = ticket.getPayload();
  const { email, name, picture } = payload;
  
  // Tìm hoặc tạo user
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      email,
      username: name,
      googleId: payload.sub,
      avatar: picture,
    });
  }
  
  // Tạo JWT tokens
  const tokens = generateTokens(user);
  
  res.json({ success: true, data: { user, tokens } });
});
```

## Testing

### Test trên Development

1. Build và chạy app:
```bash
npm run android
```

2. Click nút "Sign in with Google"
3. Chọn tài khoản Google
4. Verify login thành công

### Troubleshooting

**Lỗi: "Developer Error"**
- Kiểm tra SHA-1 fingerprint đúng
- Kiểm tra package name khớp
- Đợi 5-10 phút sau khi tạo OAuth client

**Lỗi: "Sign in failed"**
- Kiểm tra Google Play Services đã cài
- Kiểm tra internet connection
- Clear app data và thử lại

**Lỗi: "API not enabled"**
- Enable Google+ API trong Google Cloud Console
- Enable Google Sign-In API

## Checklist

- [ ] Tạo Google Cloud Project
- [ ] Enable Google Sign-In API
- [ ] Tạo OAuth Client ID với thông tin trên
- [ ] Copy Client ID vào config
- [ ] Cài đặt @react-native-google-signin/google-signin
- [ ] Cấu hình GoogleSignin.configure()
- [ ] Implement Google Sign-In button
- [ ] Test login flow
- [ ] Implement backend verification
- [ ] Test end-to-end flow

## Lưu ý bảo mật

1. **Không commit Client ID vào Git** nếu là sensitive
2. **Lưu release keystore an toàn** - mất keystore = không update được app
3. **Verify token ở backend** - không tin tưởng client-side data
4. **Sử dụng HTTPS** cho production API

## Resources

- [Google Sign-In for Android](https://developers.google.com/identity/sign-in/android/start)
- [React Native Google Sign-In](https://github.com/react-native-google-signin/google-signin)
- [OAuth 2.0 Setup](https://support.google.com/cloud/answer/6158849)

---

**Current Status**: SHA-1 fingerprint đã lấy được, sẵn sàng tạo OAuth Client ID  
**Next Step**: Truy cập Google Cloud Console và tạo OAuth Client ID với thông tin trên
