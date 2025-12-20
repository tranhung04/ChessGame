# ✅ Google OAuth Setup Complete

## Thông tin đã cấu hình

### Google OAuth Client ID
```
798352030632-tciovhpq6k065mnljb9a8i8v58cc39vr.apps.googleusercontent.com
```

### Đã lưu vào
- ✅ `src/config/constants.js` → `GOOGLE_WEB_CLIENT_ID`
- ✅ Có sẵn cho cả 3 môi trường: dev, staging, prod

### Cách sử dụng trong code

```javascript
import { GOOGLE_WEB_CLIENT_ID } from './src/config/constants';

// Client ID sẽ tự động chọn theo môi trường
console.log(GOOGLE_WEB_CLIENT_ID);
// Output: 798352030632-tciovhpq6k065mnljb9a8i8v58cc39vr.apps.googleusercontent.com
```

## Các bước tiếp theo

### 1. Cài đặt Google Sign-In package (nếu cần)

```bash
npm install @react-native-google-signin/google-signin
```

### 2. Cấu hình trong App.js

Thêm vào `App.js` hoặc component khởi tạo:

```javascript
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { GOOGLE_WEB_CLIENT_ID } from './src/config/constants';

// Trong useEffect hoặc componentDidMount
useEffect(() => {
  GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    offlineAccess: true,
  });
}, []);
```

### 3. Tạo Google Auth Service

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
    return { success: false, error: error.message };
  }
};
```

### 4. Sử dụng trong Login Screen

Trong `src/screens/Auth/LoginScreen.js`:

```javascript
import { googleSignIn } from '../../services/googleAuth';
import { authAPI } from '../../services/api';

const handleGoogleLogin = async () => {
  setLoading(true);
  try {
    const result = await googleSignIn();
    
    if (result.success) {
      // Gửi idToken lên backend để verify
      const response = await authAPI.loginWithGoogle({
        idToken: result.idToken,
      });
      
      if (response.data.success) {
        // Login thành công
        await login(response.data.data.user, response.data.data.tokens);
      }
    } else {
      Alert.alert('Lỗi', result.error);
    }
  } catch (error) {
    Alert.alert('Lỗi', 'Đăng nhập Google thất bại');
  } finally {
    setLoading(false);
  }
};
```

### 5. Backend Integration

Thêm vào `backend/.env`:
```env
GOOGLE_CLIENT_ID=798352030632-tciovhpq6k065mnljb9a8i8v58cc39vr.apps.googleusercontent.com
```

Cài đặt package:
```bash
cd backend
npm install google-auth-library
```

Tạo endpoint verify Google token:

```javascript
// backend/src/controllers/authController.js
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.loginWithGoogle = async (req, res) => {
  try {
    const { idToken } = req.body;
    
    // Verify token với Google
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;
    
    // Tìm hoặc tạo user
    let user = await User.findOne({ where: { email } });
    
    if (!user) {
      user = await User.create({
        email,
        username: name,
        googleId,
        avatar: picture,
        isEmailVerified: true, // Google đã verify
      });
    }
    
    // Tạo JWT tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    
    // Lưu refresh token
    await RefreshToken.create({
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
    
    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      },
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_GOOGLE_TOKEN',
        message: 'Google token không hợp lệ',
      },
    });
  }
};
```

Thêm route:
```javascript
// backend/src/routes/authRoutes.js
router.post('/auth/google', authController.loginWithGoogle);
```

### 6. Thêm vào API service

Trong `src/services/api.js`:

```javascript
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  loginWithGoogle: (data) => api.post('/auth/google', data), // ← Thêm dòng này
  logout: (refreshToken) => api.post('/auth/logout', { refreshToken }),
  getMe: () => api.get('/auth/me'),
  refreshToken: (refreshToken) => api.post('/auth/refresh-token', { refreshToken })
};
```

## Testing

### Test trên Development

1. Build và chạy app:
```bash
npm run android
```

2. Tap vào nút "Sign in with Google"
3. Chọn tài khoản Google
4. Verify login thành công

### Troubleshooting

**Lỗi: "Developer Error"**
- Đợi 5-10 phút sau khi tạo OAuth Client ID
- Settings có thể mất thời gian để có hiệu lực

**Lỗi: "Sign in failed"**
- Kiểm tra Google Play Services đã cài
- Clear app data: Settings → Apps → ToolChess → Clear Data
- Thử lại

**Lỗi: "API not enabled"**
- Vào Google Cloud Console
- Enable "Google Sign-In API"
- Enable "Google+ API" (nếu cần)

## Files đã tạo/cập nhật

- ✅ `src/config/constants.js` - Thêm GOOGLE_WEB_CLIENT_ID
- ✅ `GOOGLE_OAUTH_CREDENTIALS.md` - Lưu thông tin OAuth
- ✅ `OAUTH_SETUP_COMPLETE.md` - File này
- ✅ `OAUTH_SETUP_GUIDE.md` - Hướng dẫn chi tiết
- ✅ `GOOGLE_OAUTH_SETUP.md` - Setup cụ thể cho ToolChess
- ✅ `QUICK_OAUTH_SETUP.txt` - Thông tin nhanh
- ✅ `.gitignore` - Thêm comment về OAuth credentials

## Checklist

- [x] Lấy SHA-1 fingerprint
- [x] Tạo OAuth Client ID trên Google Cloud Console
- [x] Lưu Client ID vào src/config/constants.js
- [ ] Cài đặt @react-native-google-signin/google-signin
- [ ] Cấu hình GoogleSignin.configure()
- [ ] Tạo googleAuth.js service
- [ ] Implement Google Sign-In button trong LoginScreen
- [ ] Thêm backend endpoint /auth/google
- [ ] Test login flow end-to-end

## Next Steps

1. Cài đặt Google Sign-In package
2. Implement Google Sign-In button trong UI
3. Test trên device/emulator
4. Implement backend verification
5. Test complete flow

---

**Status**: ✅ OAuth Client ID đã được cấu hình  
**Date**: December 20, 2025  
**Ready for**: Implementation của Google Sign-In feature
