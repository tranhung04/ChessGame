# 📱 Kotlin Migration Spec

## Tổng quan

Spec này hướng dẫn chi tiết việc chuyển đổi ứng dụng Cờ Tướng ToolChess từ React Native sang Kotlin Native Android.

## 📂 Files trong spec

1. **requirements.md** - Yêu cầu chức năng chi tiết (12 requirements)
2. **design.md** - Thiết kế kiến trúc và components
3. **tasks.md** - Kế hoạch implementation (18 phases, 80+ tasks)
4. **MIGRATION_GUIDE.md** - Hướng dẫn migration từng bước

## 🚀 Bắt đầu

### Bước 1: Đọc tài liệu
```bash
1. Đọc requirements.md để hiểu yêu cầu
2. Đọc design.md để hiểu kiến trúc
3. Đọc MIGRATION_GUIDE.md để xem ví dụ code
4. Đọc tasks.md để bắt đầu implement
```

### Bước 2: Setup project Kotlin
- Mở project Kotlin tại: `C:\Users\tvhun\Downloads\toolchess-original\chess`
- Kiểm tra minSdk = 24, targetSdk = 35
- Thêm dependencies theo MIGRATION_GUIDE.md

### Bước 3: Bắt đầu implement
- Follow tasks.md từ Phase 1
- Mỗi task có requirements reference
- Test sau mỗi task hoàn thành

## 📋 Workflow

```
requirements.md → design.md → tasks.md → Implementation
     ↓               ↓            ↓
  Yêu cầu      Thiết kế      Kế hoạch
```

## 🎯 Mục tiêu

✅ Port toàn bộ game logic từ JavaScript sang Kotlin  
✅ Tạo UI với Jetpack Compose  
✅ Tích hợp API backend  
✅ Build APK dễ dàng  
✅ Performance tốt hơn React Native  

## 📊 Tiến độ

- [ ] Phase 1: Project Setup (4 tasks)
- [ ] Phase 2: Data Layer (7 tasks)
- [ ] Phase 3: Game Logic (13 tasks)
- [ ] Phase 4: ViewModels (12 tasks)
- [ ] Phase 5: UI Compose (20 tasks)
- [ ] Phase 6: Navigation (3 tasks)
- [ ] Phase 7: Testing (6 tasks)
- [ ] Phase 8: Build & Release (4 tasks)

**Total**: 69 tasks

## 🔗 Tham khảo code React Native

Khi port logic, tham khảo:
- `src/game/ChessGame.js` → Port sang `ChessGame.kt`
- `src/game/EnemyAI.js` → Port sang `EnemyAI.kt`
- `src/screens/Game/GameScreen.js` → Port sang `GameScreen.kt` + `GameViewModel.kt`
- `src/services/api.js` → Port sang `*Api.kt` + Retrofit

## 💡 Tips

1. **Port từng module nhỏ**: Đừng port toàn bộ cùng lúc
2. **Test ngay**: Test sau mỗi function port xong
3. **Giữ logic giống**: Đảm bảo game hoạt động giống hệt
4. **Tận dụng Kotlin**: Dùng data class, sealed class, extension functions
5. **Follow Android best practices**: MVVM, Repository pattern, Hilt DI

## 🛠️ Tools cần thiết

- Android Studio (latest)
- Kotlin 1.9+
- Gradle 8.0+
- JDK 17+

## 📞 Hỗ trợ

Nếu gặp vấn đề:
1. Kiểm tra MIGRATION_GUIDE.md
2. Xem ví dụ code trong design.md
3. Tham khảo code React Native hiện tại
4. Google với keyword "Jetpack Compose + [vấn đề]"

---

**Bắt đầu từ**: Phase 1, Task 1.1 trong tasks.md  
**Estimated time**: 2-3 tuần (full-time)
