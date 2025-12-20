# Hướng Dẫn Chạy Ứng Dụng ToolChess

## ⚠️ LỖI THƯỜNG GẶP: "Unable to load script"

Nếu bạn thấy lỗi này khi mở app:
```
Unable to load script. Make sure you're running Metro...
```

**Nguyên nhân:** Debug APK cần Metro bundler chạy, nhưng khó setup trên điện thoại thật.

**Giải pháp:** Build **Release APK** thay vì Debug APK (xem Bước 3 bên dưới).

---

## Bước 1: Khởi Động Backend Server

### 1.1. Mở Terminal/Command Prompt
```bash
cd C:\Users\tvhun\Downloads\toolchess-original\chess-mobile\backend
```

### 1.2. Chạy Server
```bash
node src/server.js
```

**Kết quả mong đợi:**
```
✓ ToolChess Backend API Server running on port 3000
✓ Environment: development
✓ Database: Connected to ToolChessDB
```

**Lưu ý:** Giữ cửa sổ terminal này mở. Server cần chạy liên tục khi bạn sử dụng app.

---

## Bước 2: Cập Nhật API URL

### 2.1. Tìm Địa Chỉ IP Máy Tính

**Trên Windows:**
1. Mở Command Prompt
2. Chạy lệnh: `ipconfig`
3. Tìm "IPv4 Address" trong phần "Wireless LAN adapter Wi-Fi" hoặc "Ethernet adapter"
4. Ví dụ: `192.168.1.100`

### 2.2. Cập Nhật File Constants

Mở file: `src/config/constants.js`

Thay đổi dòng này:
```javascript
API_BASE_URL: 'http://10.66.214.152:5000/api',
```

Thành (thay YOUR_IP bằng IP máy tính của bạn):
```javascript
API_BASE_URL: 'http://YOUR_IP:3000/api',
```

**Ví dụ:**
```javascript
API_BASE_URL: 'http://192.168.1.100:3000/api',
```

### 2.3. Build Lại APK (QUAN TRỌNG!)

**Sau khi thay đổi API URL, bạn PHẢI build lại APK:**

#### ⚠️ TRƯỚC KHI BUILD: Sửa Lỗi Đường Dẫn Quá Dài

Windows giới hạn độ dài đường dẫn file ở 260 ký tự. Nếu build bị lỗi:
```
ninja: error: Stat(...): Filename longer than 260 characters
```

**👉 Xem hướng dẫn chi tiết trong file: `FIX_LONG_PATH_ERROR.md`**

**Giải pháp nhanh nhất - Di chuyển dự án:**
1. Chạy file: `move-to-short-path.bat`
2. Dự án sẽ được copy sang `C:\chess`
3. Mở Command Prompt mới:
   ```cmd
   cd C:\chess
   npm install
   ```
4. Tiếp tục build từ thư mục mới

**Giải pháp khác - Bật Long Path Support:**
1. Click chuột phải vào `enable-long-paths.bat`
2. Chọn "Run as administrator"
3. **Khởi động lại máy tính** (bắt buộc!)
4. Build lại sau khi restart

---

#### Option A: Build Release APK (Khuyến nghị - Không cần Metro)

**Dùng Command Line (Nhanh nhất):**
```cmd
cd android
gradlew assembleRelease
```

**Dùng Android Studio:**
1. Mở Android Studio
2. Mở thư mục: `android` (trong thư mục dự án)
3. Chọn **Build > Build Bundle(s) / APK(s) > Build APK(s)**
4. Trong cửa sổ **Build Variants** (góc trái dưới), chọn **release** thay vì **debug**
5. Chọn lại **Build > Build Bundle(s) / APK(s) > Build APK(s)**
6. Đợi build hoàn tất (có thể mất 5-10 phút)
7. APK sẽ ở: `android\app\build\outputs\apk\release\app-release.apk`

#### Option B: Build Debug APK + Chạy Metro (Phức tạp hơn)

Nếu muốn dùng debug APK, bạn cần:
1. Chạy Metro bundler: `npx expo start --tunnel`
2. Kết nối điện thoại qua USB
3. Enable USB debugging
4. Chạy: `adb reverse tcp:8081 tcp:8081`

**→ Khuyến nghị dùng Option A (Release APK) cho đơn giản!**

---

## Bước 3: Kết Nối Mạng

### 3.1. Đảm Bảo Cùng Mạng WiFi

**Quan trọng:** Máy tính và điện thoại phải kết nối cùng một mạng WiFi!

- Máy tính: Kết nối WiFi
- Điện thoại: Kết nối cùng WiFi đó

### 3.2. Kiểm Tra Firewall

Nếu app không kết nối được, có thể firewall đang chặn:

1. Mở **Windows Defender Firewall**
2. Chọn **Allow an app through firewall**
3. Tìm **Node.js** và đảm bảo cả **Private** và **Public** đều được check
4. Nếu không có Node.js, click **Allow another app** và thêm Node.js

---

## Bước 4: Chạy Ứng Dụng

### 4.1. Cài Đặt APK

1. Copy file APK từ máy tính sang điện thoại:
   - **Release APK (Khuyến nghị):** `android\app\build\outputs\apk\release\app-release.apk`
   - **Debug APK:** `android\app\build\outputs\apk\debug\app-debug.apk`
   - Có thể dùng USB, email, hoặc Google Drive

2. Trên điện thoại, mở file APK và cài đặt
   - Có thể cần bật "Install from unknown sources" trong Settings

3. **Lưu ý:** Nếu đã cài debug APK trước đó, gỡ cài đặt trước khi cài release APK

### 4.2. Mở App

1. Mở app ToolChess trên điện thoại
2. App sẽ tự động kết nối đến backend server

---

## Kiểm Tra Kết Nối

### Test Backend API

Mở trình duyệt trên máy tính và truy cập:
```
http://localhost:3000/api/health
```

Hoặc từ điện thoại (thay YOUR_IP):
```
http://YOUR_IP:3000/api/health
```

**Kết quả mong đợi:**
```json
{
  "status": "ok",
  "timestamp": "2024-12-20T..."
}
```

---

## Xử Lý Sự Cố

### Lỗi: "Unable to load script" / "index.android.bundle"

**Nguyên nhân:** Đang dùng debug APK mà không có Metro bundler.

**Giải pháp:**
1. **Build Release APK** (xem Bước 2.3 - Option A)
2. Gỡ cài đặt app cũ trên điện thoại
3. Cài đặt release APK mới
4. Release APK có bundle JavaScript đóng gói sẵn, không cần Metro

### Lỗi: "Network request failed"

**Nguyên nhân:**
- Máy tính và điện thoại không cùng WiFi
- Backend server chưa chạy
- Firewall đang chặn
- IP address sai

**Giải pháp:**
1. Kiểm tra backend server đang chạy
2. Kiểm tra IP address trong constants.js
3. Kiểm tra cùng WiFi
4. Tắt firewall tạm thời để test

### Lỗi: "Cannot connect to server"

**Giải pháp:**
1. Restart backend server
2. Kiểm tra port 3000 không bị chiếm dụng:
   ```bash
   netstat -ano | findstr :3000
   ```
3. Nếu port bị chiếm, kill process hoặc đổi port khác

### Backend Server Bị Crash

**Giải pháp:**
1. Kiểm tra database đang chạy
2. Kiểm tra file .env có đúng không
3. Xem log lỗi trong terminal
4. Restart SQL Server nếu cần

---

## Chế Độ Development vs Production

### Development (Hiện tại)

- API URL: `http://YOUR_IP:3000/api`
- Debug APK
- Có thể xem logs
- Không cần signing key

### Production (Sau này)

- API URL: `https://api.toolchess.com/api`
- Release APK
- Cần signing key
- Tối ưu hóa performance

---

## Lệnh Hữu Ích

### Khởi động Backend
```bash
cd backend
node src/server.js
```

### Kiểm tra Backend đang chạy
```bash
curl http://localhost:3000/api/health
```

### Tìm IP máy tính
```bash
ipconfig
```

### Build APK (Android Studio)
```
Build > Build Bundle(s) / APK(s) > Build APK(s)
```

---

## Liên Hệ & Hỗ Trợ

Nếu gặp vấn đề, kiểm tra:
1. Backend logs trong terminal
2. App logs trong Android Studio Logcat
3. Network connectivity
4. Firewall settings

**Chúc bạn thành công!** 🎉
