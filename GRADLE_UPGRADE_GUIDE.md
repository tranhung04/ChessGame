# Hướng Dẫn Upgrade Gradle

## Vấn Đề
Android Studio yêu cầu upgrade Gradle version để build APK.

## Giải Pháp 1: Tự Động Upgrade (Khuyến nghị)

### Bước 1: Mở Android Studio
1. Mở Android Studio
2. Mở project: `C:\Users\tvhun\Downloads\toolchess-original\chess-mobile\android`

### Bước 2: Click Upgrade
Khi Android Studio hiện thông báo:
```
"Gradle version X.X is required. Current version is Y.Y"
```

Click vào nút **"Upgrade Gradle"** hoặc **"Update"**

### Bước 3: Đợi Sync
- Android Studio sẽ tự động download và cài đặt Gradle mới
- Đợi "Gradle Sync" hoàn tất (có thể mất 2-5 phút)
- Xem progress ở góc dưới bên phải

### Bước 4: Build APK
Sau khi sync xong:
1. Chọn **Build Variants** → **release**
2. Chọn **Build > Build Bundle(s) / APK(s) > Build APK(s)**
3. Đợi build xong

---

## Giải Pháp 2: Build bằng Command Line (Không cần upgrade)

Nếu không muốn upgrade, dùng command line:

```bash
build-release-simple.bat
```

Hoặc:

```bash
cd android
gradlew clean
gradlew assembleRelease
```

APK sẽ ở: `android\app\build\outputs\apk\release\app-release.apk`

---

## Giải Pháp 3: Manual Upgrade (Nếu tự động không hoạt động)

### Bước 1: Kiểm tra Gradle version hiện tại

Mở file: `android/gradle/wrapper/gradle-wrapper.properties`

Tìm dòng:
```properties
distributionUrl=https\://services.gradle.org/distributions/gradle-X.X-all.zip
```

### Bước 2: Update Gradle version

Thay đổi thành version mới hơn (ví dụ 8.3):
```properties
distributionUrl=https\://services.gradle.org/distributions/gradle-8.3-all.zip
```

### Bước 3: Update Android Gradle Plugin

Mở file: `android/build.gradle`

Tìm:
```gradle
classpath("com.android.tools.build:gradle:X.X.X")
```

Update thành version tương thích (ví dụ 8.1.0):
```gradle
classpath("com.android.tools.build:gradle:8.1.0")
```

### Bước 4: Sync lại

Trong Android Studio:
- Click **File > Sync Project with Gradle Files**
- Đợi sync xong

---

## Gradle Version Compatibility

| Android Gradle Plugin | Gradle Version | Java Version |
|----------------------|----------------|--------------|
| 8.0.x - 8.1.x        | 8.0 - 8.3      | 17           |
| 7.4.x                | 7.5            | 11           |
| 7.3.x                | 7.4            | 11           |

---

## Xử Lý Lỗi

### Lỗi: "Unsupported Java version"

Cài đặt Java 17:
1. Download: https://adoptium.net/
2. Cài đặt JDK 17
3. Set JAVA_HOME environment variable
4. Restart Android Studio

### Lỗi: "Could not download gradle-X.X-all.zip"

Kiểm tra internet connection hoặc:
1. Download manual từ: https://services.gradle.org/distributions/
2. Copy vào: `C:\Users\tvhun\.gradle\wrapper\dists\`
3. Sync lại

### Lỗi: "Gradle sync failed"

```bash
cd android
gradlew clean --refresh-dependencies
```

Sau đó sync lại trong Android Studio.

---

## Khuyến Nghị

**Cách đơn giản nhất:** Dùng command line build script!

```bash
build-release-simple.bat
```

Không cần upgrade, không cần Android Studio, chỉ cần chạy script và đợi!

---

**Lưu ý:** Sau khi upgrade Gradle, có thể cần restart Android Studio để áp dụng thay đổi.
