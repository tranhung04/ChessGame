# Requirements Document - Kotlin Migration

## Introduction

Chuyển đổi ứng dụng Cờ Tướng ToolChess từ React Native sang Kotlin Native Android với Jetpack Compose. Ứng dụng cần duy trì toàn bộ tính năng hiện có và cải thiện performance.

## Glossary

- **Kotlin_App**: Ứng dụng Android native được viết bằng Kotlin
- **Jetpack_Compose**: Framework UI hiện đại của Android
- **Game_Engine**: Module xử lý logic game cờ tướng
- **API_Client**: Module giao tiếp với backend
- **Auth_Module**: Module xác thực người dùng
- **Premium_Module**: Module quản lý gói premium

## Requirements

### Requirement 1: Cấu trúc dự án Android

**User Story:** Là developer, tôi muốn có cấu trúc dự án Android chuẩn để dễ maintain và scale

#### Acceptance Criteria

1. THE Kotlin_App SHALL sử dụng Android API 24 (Android 7.0) làm minSdkVersion
2. THE Kotlin_App SHALL target Android API 35 (Android 15)
3. THE Kotlin_App SHALL sử dụng Kotlin 1.9+ và Jetpack Compose
4. THE Kotlin_App SHALL có cấu trúc MVVM (Model-View-ViewModel)
5. THE Kotlin_App SHALL sử dụng Hilt cho Dependency Injection

### Requirement 2: Game Logic Migration

**User Story:** Là người chơi, tôi muốn game logic hoạt động giống hệt phiên bản React Native

#### Acceptance Criteria

1. THE Game_Engine SHALL port toàn bộ logic từ ChessGame.js sang Kotlin
2. THE Game_Engine SHALL hỗ trợ 3 game modes: setup, playing, ended
3. THE Game_Engine SHALL validate moves theo đúng luật cờ tướng
4. THE Game_Engine SHALL tính điểm chính xác với premium bonus
5. THE Game_Engine SHALL xử lý fire mode khi bắt Tướng địch

### Requirement 3: Enemy AI Migration

**User Story:** Là người chơi, tôi muốn AI địch thông minh như phiên bản cũ

#### Acceptance Criteria

1. THE Game_Engine SHALL port toàn bộ EnemyAI.js sang Kotlin
2. THE Game_Engine SHALL spawn quân địch theo đúng lịch trình
3. THE Game_Engine SHALL AI chọn nước đi tối ưu
4. THE Game_Engine SHALL AI tránh bẫy trong 10 lượt đầu
5. THE Game_Engine SHALL AI ưu tiên bắt Xe người chơi

### Requirement 4: UI với Jetpack Compose

**User Story:** Là người chơi, tôi muốn giao diện đẹp và mượt mà

#### Acceptance Criteria

1. THE Kotlin_App SHALL hiển thị bàn cờ 9x8 với Compose Canvas
2. THE Kotlin_App SHALL highlight các nước đi hợp lệ (xanh/đỏ/cam)
3. THE Kotlin_App SHALL animate khi bắt quân và fire blast
4. THE Kotlin_App SHALL hiển thị điểm số và turn count real-time
5. THE Kotlin_App SHALL responsive với mọi kích thước màn hình

### Requirement 5: Authentication

**User Story:** Là người dùng, tôi muốn đăng nhập/đăng ký dễ dàng

#### Acceptance Criteria

1. THE Auth_Module SHALL gọi API login với email/password
2. THE Auth_Module SHALL gọi API register với username/email/password
3. THE Auth_Module SHALL lưu JWT token vào EncryptedSharedPreferences
4. THE Auth_Module SHALL tự động refresh token khi hết hạn
5. THE Auth_Module SHALL logout và xóa token

### Requirement 6: API Integration

**User Story:** Là developer, tôi muốn giao tiếp với backend dễ dàng

#### Acceptance Criteria

1. THE API_Client SHALL sử dụng Retrofit + OkHttp
2. THE API_Client SHALL tự động thêm Authorization header
3. THE API_Client SHALL handle network errors gracefully
4. THE API_Client SHALL support offline mode
5. THE API_Client SHALL retry failed requests

### Requirement 7: Game Session Management

**User Story:** Là người chơi, tôi muốn game được lưu trên server

#### Acceptance Criteria

1. WHEN game starts, THE Kotlin_App SHALL gọi API startGame
2. WHEN game ends, THE Kotlin_App SHALL gọi API endGame với score/duration
3. THE Kotlin_App SHALL lưu sessionId trong game state
4. IF API fails, THEN THE Kotlin_App SHALL cho phép chơi offline
5. THE Kotlin_App SHALL sync data khi có mạng trở lại

### Requirement 8: Premium System

**User Story:** Là người dùng, tôi muốn mua và sử dụng gói premium

#### Acceptance Criteria

1. THE Premium_Module SHALL hiển thị 4 gói premium
2. THE Premium_Module SHALL tích hợp VNPay payment
3. THE Premium_Module SHALL áp dụng bonus % vào điểm số
4. THE Premium_Module SHALL hiển thị badge premium
5. THE Premium_Module SHALL kiểm tra hạn sử dụng

### Requirement 9: Leaderboard

**User Story:** Là người chơi, tôi muốn xem bảng xếp hạng

#### Acceptance Criteria

1. THE Kotlin_App SHALL gọi API getLeaderboard
2. THE Kotlin_App SHALL hiển thị top 100 players
3. THE Kotlin_App SHALL highlight user hiện tại
4. THE Kotlin_App SHALL hiển thị premium badge
5. THE Kotlin_App SHALL refresh khi pull-to-refresh

### Requirement 10: Profile & History

**User Story:** Là người dùng, tôi muốn xem thông tin cá nhân và lịch sử

#### Acceptance Criteria

1. THE Kotlin_App SHALL hiển thị avatar, username, email
2. THE Kotlin_App SHALL hiển thị game stats (wins, losses, highest score)
3. THE Kotlin_App SHALL hiển thị lịch sử game
4. THE Kotlin_App SHALL hiển thị lịch sử giao dịch
5. THE Kotlin_App SHALL cho phép đăng xuất

### Requirement 11: Performance

**User Story:** Là người chơi, tôi muốn app chạy mượt mà

#### Acceptance Criteria

1. THE Kotlin_App SHALL render UI ở 60 FPS
2. THE Kotlin_App SHALL load game screen < 1 giây
3. THE Kotlin_App SHALL sử dụng < 100MB RAM
4. THE Kotlin_App SHALL APK size < 20MB
5. THE Kotlin_App SHALL không crash khi rotate màn hình

### Requirement 12: Build & Distribution

**User Story:** Là developer, tôi muốn build APK dễ dàng

#### Acceptance Criteria

1. THE Kotlin_App SHALL build APK thành công với Gradle
2. THE Kotlin_App SHALL support debug và release variants
3. THE Kotlin_App SHALL sign APK với keystore
4. THE Kotlin_App SHALL obfuscate code với R8/ProGuard
5. THE Kotlin_App SHALL generate AAB cho Google Play
