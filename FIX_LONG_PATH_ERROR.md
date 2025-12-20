# Hướng Dẫn Sửa Lỗi Đường Dẫn Quá Dài (Long Path Error)

## Vấn Đề
Build APK bị lỗi:
```
ninja: error: Stat(...): Filename longer than 260 characters
```

Windows mặc định giới hạn độ dài đường dẫn file ở 260 ký tự. Dự án React Native có nhiều file với tên dài nên vượt quá giới hạn này.

## Giải Pháp 1: Bật Hỗ Trợ Long Path (KHUYẾN NGHỊ)

### Bước 1: Chạy Script Với Quyền Administrator
1. Tìm file `enable-long-paths.bat` trong thư mục dự án
2. **Click chuột phải** vào file
3. Chọn **"Run as administrator"** (Chạy với quyền quản trị)
4. Nhấn phím bất kỳ để tiếp tục

### Bước 2: Khởi Động Lại Máy Tính
**QUAN TRỌNG**: Bạn PHẢI khởi động lại máy tính để thay đổi có hiệu lực!

### Bước 3: Build Lại APK
Sau khi khởi động lại:
```cmd
cd android
gradlew assembleRelease
```

## Giải Pháp 2: Di Chuyển Dự Án Đến Đường Dẫn Ngắn Hơn

Nếu không thể chạy với quyền Administrator, di chuyển dự án đến đường dẫn ngắn hơn:

### Đường Dẫn Hiện Tại (Quá Dài):
```
C:\Users\tvhun\Downloads\toolchess-original\chess-mobile\
```
Độ dài: 56 ký tự

### Đường Dẫn Đề Xuất (Ngắn):
```
C:\chess\
```
Độ dài: 9 ký tự (tiết kiệm 47 ký tự!)

### Các Bước Di Chuyển:
1. Tạo thư mục mới:
   ```cmd
   mkdir C:\chess
   ```

2. Copy toàn bộ dự án:
   ```cmd
   xcopy "C:\Users\tvhun\Downloads\toolchess-original\chess-mobile" "C:\chess" /E /I /H
   ```

3. Mở dự án mới:
   ```cmd
   cd C:\chess
   ```

4. Build APK:
   ```cmd
   cd android
   gradlew assembleRelease
   ```

## Giải Pháp 3: Bật Long Path Thủ Công (Nếu Script Không Chạy)

### Cách 1: Dùng Registry Editor
1. Nhấn `Win + R`
2. Gõ `regedit` và nhấn Enter
3. Đi đến: `HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\FileSystem`
4. Tìm `LongPathsEnabled` (hoặc tạo mới nếu không có)
5. Đặt giá trị = `1`
6. Khởi động lại máy tính

### Cách 2: Dùng Group Policy Editor (Windows Pro)
1. Nhấn `Win + R`
2. Gõ `gpedit.msc` và nhấn Enter
3. Đi đến: `Computer Configuration > Administrative Templates > System > Filesystem`
4. Tìm `Enable Win32 long paths`
5. Chọn `Enabled`
6. Khởi động lại máy tính

## Kiểm Tra Long Path Đã Được Bật Chưa

Chạy lệnh này trong PowerShell:
```powershell
Get-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled"
```

Nếu kết quả là `1` = đã bật
Nếu kết quả là `0` hoặc không tồn tại = chưa bật

## Sau Khi Build Thành Công

File APK sẽ nằm ở:
```
android\app\build\outputs\apk\release\app-release.apk
```

### Các Bước Tiếp Theo:
1. ✅ Cập nhật IP máy tính trong `src/config/constants.js`
2. ✅ Chạy backend server: `node backend/src/server.js`
3. ✅ Cài APK lên điện thoại
4. ✅ Đảm bảo điện thoại và máy tính cùng mạng WiFi

## Lưu Ý Quan Trọng

- ⚠️ Giải pháp 1 cần quyền Administrator và khởi động lại máy
- ⚠️ Giải pháp 2 đơn giản nhất, không cần quyền đặc biệt
- ⚠️ Sau khi di chuyển dự án, cần cài lại node_modules:
  ```cmd
  npm install
  ```

## Tham Khảo Thêm

- [Microsoft Docs: Maximum Path Length Limitation](https://docs.microsoft.com/en-us/windows/win32/fileio/maximum-file-path-limitation)
- [React Native Build Issues](https://reactnative.dev/docs/signed-apk-android)
