# 🎮 Cờ Tướng ToolChess - Mobile App

Ứng dụng game Cờ Tướng đầy đủ tính năng cho Android với hệ thống đăng ký/đăng nhập, Premium packages, thanh toán VNPay, và bảo mật cao.

## ✨ Tính năng

### 🔐 Authentication & Security
- ✅ Đăng ký/Đăng nhập với JWT
- ✅ Refresh token tự động
- ✅ Secure storage (expo-secure-store)
- ✅ Password encryption (bcrypt)
- ✅ API encryption

### 🎯 Game Features
- ✅ Game logic từ web version
- ✅ AI tự động (Enemy AI)
- ✅ Theo dõi điểm số
- ✅ Lịch sử game
- ✅ Bảng xếp hạng (Leaderboard)

### 💎 Premium System
- ✅ 4 gói Premium (Cơ bản, Tiêu chuẩn, Pro, VIP)
- ✅ Tăng % điểm cho quân cờ
- ✅ Lượt hồi sinh miễn phí
- ✅ Giao diện đặc biệt
- ✅ Hỗ trợ ưu tiên

### 💳 Payment
- ✅ Tích hợp VNPay
- ✅ Lịch sử giao dịch
- ✅ Thanh toán an toàn

## 📂 Cấu trúc Project

```
chess-mobile/
├── App.js                          # Entry point
├── app.json                        # Expo config
├── package.json
├── assets/                         # Icons, splash screen
├── src/
│   ├── config/
│   │   └── constants.js           # Constants, colors
│   ├── context/
│   │   └── AuthContext.js         # Authentication context
│   ├── services/
│   │   └── api.js                 # API calls
│   ├── navigation/
│   │   └── AppNavigator.js        # Navigation setup
│   ├── screens/
│   │   ├── Auth/
│   │   │   ├── LoginScreen.js     # ✅ ĐÃ TẠO
│   │   │   └── RegisterScreen.js  # ⚠️ CẦN TẠO
│   │   ├── Home/
│   │   │   └── HomeScreen.js      # ⚠️ CẦN TẠO
│   │   ├── Game/
│   │   │   └── GameScreen.js      # ⚠️ CẦN TẠO
│   │   ├── Shop/
│   │   │   └── ShopScreen.js      # ⚠️ CẦN TẠO
│   │   ├── Profile/
│   │   │   └── ProfileScreen.js   # ⚠️ CẦN TẠO
│   │   └── Leaderboard/
│   │       └── LeaderboardScreen.js # ⚠️ CẦN TẠO
│   └── components/                # UI components
│       ├── ChessBoard.js          # ⚠️ CẦN TẠO
│       ├── ChessPiece.js          # ⚠️ CẦN TẠO
│       └── PremiumCard.js         # ⚠️ CẦN TẠO
```

## 🚀 Cài đặt & Chạy

### 1. Cài đặt dependencies
```bash
cd chess-mobile
npm install
```

### 2. Cấu hình API
Mở `src/config/constants.js` và cập nhật `API_BASE_URL`:
```javascript
export const API_BASE_URL = 'http://YOUR_IP_ADDRESS:5000/api';
```

⚠️ **Lưu ý**: Không dùng `localhost` khi test trên thiết bị thật. Dùng IP máy tính (vd: `http://192.168.1.100:5000/api`)

### 3. Chạy app
```bash
npm start
```

Hoặc chạy trực tiếp trên Android:
```bash
npm run android
```

## 📱 Build APK

### Cách 1: EAS Build (Khuyến nghị)

1. Cài đặt EAS CLI:
```bash
npm install -g eas-cli
```

2. Đăng nhập Expo:
```bash
eas login
```

3. Configure EAS:
```bash
eas build:configure
```

4. Build APK:
```bash
eas build --platform android --profile preview
```

File APK sẽ được tải về sau khi build xong (~5-10 phút).

### Cách 2: Local Build

1. Prebuild native code:
```bash
npx expo prebuild --platform android
```

2. Build với Gradle:
```bash
cd android
./gradlew assembleRelease
```

APK ở: `android/app/build/outputs/apk/release/app-release.apk`

## 🔧 Hoàn thiện các Screens còn lại

### RegisterScreen.js
Copy từ `LoginScreen.js` và thêm trường:
- Username input
- Email input  
- Password input
- Confirm password input
- Gọi `register()` từ AuthContext

### HomeScreen.js
- Hiển thị thống kê user (total games, wins, losses, highest score)
- Button "Chơi ngay" → navigate to GameScreen
- Button "Bảng xếp hạng" → navigate to LeaderboardScreen
- Hiển thị Premium status

### GameScreen.js
Port logic từ `script.js` và `enemy_ai.js`:
1. Tạo ChessBoard component (10x10 grid)
2. Tạo ChessPiece component (hiển thị quân cờ)
3. Implement game logic:
   - Setup phase (thêm Xe và quân địch)
   - Player moves
   - Enemy AI auto-play
   - Fire mode
   - Scoring with premium bonus
4. Gọi `gameAPI.startGame()` khi bắt đầu
5. Gọi `gameAPI.endGame()` khi kết thúc

### ShopScreen.js
```javascript
// Lấy danh sách gói premium
const packages = await premiumAPI.getPackages();

// Hiển thị từng gói với:
- Tên gói
- Giá
- Tính năng
- Button "Mua ngay" → gọi paymentAPI.createVNPayPayment()
- Mở WebView với paymentUrl
```

### ProfileScreen.js
- Avatar
- Username, Email
- Game stats
- Premium info (nếu có)
- Button "Đăng xuất"
- Button "Lịch sử game"
- Button "Lịch sử giao dịch"

### LeaderboardScreen.js
```javascript
const leaderboard = await gameAPI.getLeaderboard();
// Hiển thị FlatList với:
- Rank
- Username
- Highest Score
- Premium badge (nếu có)
```

## 🎨 UI Components cần tạo

### ChessBoard.js
```javascript
// Render 10x10 grid
// Handle touch events
// Highlight valid moves
// Show trap-moves (first 10 turns)
```

### ChessPiece.js
```javascript
// Hiển thị icon quân cờ
// Different colors cho player/enemy
// Animation khi di chuyển
```

### PremiumCard.js
```javascript
// Card hiển thị gói premium
// Highlight features
// Price display
// Buy button
```

## 🔐 Bảo mật

- ✅ JWT tokens
- ✅ Refresh token automatic
- ✅ Secure storage (expo-secure-store)
- ✅ API encryption
- ✅ Password hashing (bcrypt 12 rounds)

## 📊 Premium Packages

| Gói | Giá | Thời hạn | Tăng điểm | Hồi sinh miễn phí |
|-----|-----|----------|-----------|-------------------|
| Cơ bản | 29,000 VND | 7 ngày | +10% | 2 lượt |
| Tiêu chuẩn | 79,000 VND | 30 ngày | +20% | 5 lượt |
| Pro | 199,000 VND | 90 ngày | +30% | 10 lượt |
| VIP | 499,000 VND | 365 ngày | +50% | Unlimited |

## 🛠️ Tech Stack

- **Framework**: React Native (Expo)
- **Navigation**: React Navigation
- **State Management**: Context API
- **API**: Axios
- **Security**: expo-secure-store
- **UI**: React Native components + expo-linear-gradient

## 📝 TODO List

- [ ] Hoàn thiện RegisterScreen
- [ ] Hoàn thiện HomeScreen  
- [ ] Hoàn thiện GameScreen (port game logic)
- [ ] Hoàn thiện ShopScreen
- [ ] Hoàn thiện ProfileScreen
- [ ] Hoàn thiện LeaderboardScreen
- [ ] Tạo ChessBoard component
- [ ] Tạo ChessPiece component
- [ ] Tạo PremiumCard component
- [ ] Test thanh toán VNPay
- [ ] Build release APK
- [ ] Test trên thiết bị thật
- [ ] Optimize performance
- [ ] Add animations
- [ ] Add sound effects

## 🐛 Debug

### Không kết nối được API
- Check API_BASE_URL trong `constants.js`
- Dùng IP address thay vì localhost
- Check backend đang chạy
- Check firewall

### Build APK failed
- Check Android SDK installed
- Check Gradle version
- Run `npx expo prebuild` lại
- Clear cache: `cd android && ./gradlew clean`

## 📄 License

MIT

---

**Phát triển bởi**: ToolChess Team
**Version**: 1.0.0

