# Quick Start - Chạy App ToolChess

## 🚀 3 Bước Đơn Giản

### 1️⃣ Cập Nhật IP Address

Mở file: `src/config/constants.js`

Tìm IP máy tính (chạy `ipconfig` trong CMD):
```bash
ipconfig
```

Thay đổi dòng này (thay YOUR_IP bằng IP của bạn):
```javascript
API_BASE_URL: 'http://YOUR_IP:3000/api',
```

Ví dụ:
```javascript
API_BASE_URL: 'http://192.168.1.100:3000/api',
```

---

### 2️⃣ Build Release APK

**Cách 1: Dùng Script (Đơn giản)**
```bash
build-release-apk.bat
```

**Cách 2: Dùng Android Studio**
1. Mở thư mục: `C:\Users\tvhun\Downloads\toolchess-original\chess-mobile\android`
2. Chọn **Build > Build Bundle(s) / APK(s) > Build APK(s)**
3. Trong **Build Variants** (góc trái dưới), chọn **release**
4. Build lại: **Build > Build Bundle(s) / APK(s) > Build APK(s)**

APK sẽ ở: `android\app\build\outputs\apk\release\app-release.apk`

---

### 3️⃣ Chạy Backend + Cài App

**A. Khởi động Backend:**
```bash
start-backend.bat
```

Hoặc:
```bash
cd backend
node src/server.js
```

**B. Cài APK lên điện thoại:**
1. Copy `app-release.apk` sang điện thoại
2. Gỡ app cũ nếu có
3. Cài đặt APK mới
4. Mở app!

---

## ✅ Checklist

- [ ] Máy tính và điện thoại cùng WiFi
- [ ] Đã cập nhật IP trong `constants.js`
- [ ] Đã build release APK (không phải debug)
- [ ] Backend server đang chạy
- [ ] Đã gỡ app cũ trước khi cài mới

---

## 🆘 Gặp Lỗi?

### "Unable to load script"
→ Bạn đang dùng debug APK. Hãy build **release APK**!

### "Network request failed"
→ Kiểm tra:
- Backend có đang chạy không?
- IP address đúng chưa?
- Cùng WiFi chưa?

### "Cannot connect to server"
→ Kiểm tra firewall, có thể đang chặn port 3000

---

## 📱 Test Nhanh

Mở trình duyệt trên điện thoại, truy cập (thay YOUR_IP):
```
http://YOUR_IP:3000/api/health
```

Nếu thấy `{"status":"ok"}` → Backend hoạt động tốt! ✅

---

**Xem hướng dẫn chi tiết:** `HUONG_DAN_CHAY_UNG_DUNG.md`
