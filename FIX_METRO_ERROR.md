# Sửa Lỗi "Unable to load script" / Metro Bundle Error

## 🔴 Lỗi Bạn Đang Gặp

```
Unable to load script.
Make sure you're running Metro or that your bundle 'index.android.bundle' 
is packaged correctly for release.
```

## ✅ Giải Pháp: Build Release APK

Debug APK cần Metro bundler (development server) để chạy, rất khó setup trên điện thoại thật.

**Release APK** có JavaScript bundle đóng gói sẵn bên trong → Không cần Metro!

---

## 📋 Các Bước Thực Hiện

### Bước 1: Cập Nhật API URL (Nếu chưa làm)

File: `src/config/constants.js`

```javascript
dev: {
  API_BASE_URL: 'http://YOUR_IP:3000/api',  // Thay YOUR_IP
  GOOGLE_WEB_CLIENT_ID: '798352030632-tciovhpq6k065mnljb9a8i8v58cc39vr.apps.googleusercontent.com',
},
```

Tìm IP máy tính:
```bash
ipconfig
```
Tìm "IPv4 Address" trong phần WiFi.

---

### Bước 2: Build Release APK

#### Cách 1: Dùng Script (Nhanh nhất)

```bash
build-release-apk.bat
```

#### Cách 2: Dùng Android Studio

1. Mở Android Studio
2. Mở project: `C:\Users\tvhun\Downloads\toolchess-original\chess-mobile\android`
3. Ở góc trái dưới, tìm **Build Variants**
4. Đổi từ **debug** → **release**
5. Chọn menu: **Build > Build Bundle(s) / APK(s) > Build APK(s)**
6. Đợi build xong (2-5 phút)

#### Cách 3: Dùng Command Line

```bash
cd android
gradlew.bat assembleRelease
```

---

### Bước 3: Tìm APK

APK sẽ ở đây:
```
android\app\build\outputs\apk\release\app-release.apk
```

Hoặc Android Studio sẽ hiện thông báo với link "locate".

---

### Bước 4: Cài Đặt

1. **Gỡ app cũ** trên điện thoại (quan trọng!)
2. Copy `app-release.apk` sang điện thoại
3. Mở file và cài đặt
4. Bật "Install from unknown sources" nếu cần

---

### Bước 5: Chạy Backend

```bash
start-backend.bat
```

Hoặc:
```bash
cd backend
node src/server.js
```

Giữ cửa sổ này mở!

---

### Bước 6: Mở App

Mở app ToolChess trên điện thoại → Hoạt động! ✅

---

## 🔍 So Sánh Debug vs Release

| Tính năng | Debug APK | Release APK |
|-----------|-----------|-------------|
| Cần Metro bundler | ✅ Có | ❌ Không |
| Kích thước | Nhỏ (~10MB) | Lớn hơn (~20-30MB) |
| JavaScript bundle | Tải từ Metro | Đóng gói sẵn |
| Dễ cài đặt | ❌ Khó | ✅ Dễ |
| Phù hợp cho | Development | Testing/Production |

---

## 🎯 Tại Sao Debug APK Không Hoạt Động?

Debug APK được thiết kế để:
- Kết nối với Metro bundler qua USB hoặc WiFi
- Hot reload code khi đang develop
- Xem logs real-time

Nhưng trên điện thoại thật:
- Khó setup kết nối Metro
- Cần USB debugging
- Cần chạy `adb reverse` commands
- Phức tạp và dễ lỗi

→ **Release APK đơn giản hơn nhiều!**

---

## ✅ Checklist Hoàn Thành

- [ ] Đã cập nhật IP trong `constants.js`
- [ ] Đã build **release** APK (không phải debug)
- [ ] Đã gỡ app cũ trên điện thoại
- [ ] Đã cài release APK mới
- [ ] Backend server đang chạy
- [ ] Máy tính và điện thoại cùng WiFi
- [ ] App mở được và kết nối backend thành công

---

## 🆘 Vẫn Gặp Lỗi?

### Lỗi build release APK
```bash
# Clean và build lại
cd android
gradlew.bat clean
gradlew.bat assembleRelease
```

### App vẫn báo "Unable to load script"
- Đảm bảo bạn đã build **release** không phải debug
- Kiểm tra Build Variants đã chọn **release**
- Gỡ app cũ hoàn toàn trước khi cài mới

### App không kết nối backend
- Xem file: `HUONG_DAN_CHAY_UNG_DUNG.md`
- Kiểm tra IP address
- Kiểm tra backend đang chạy
- Kiểm tra firewall

---

**Chúc thành công!** 🎉
