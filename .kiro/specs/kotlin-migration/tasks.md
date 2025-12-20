# Implementation Plan - Kotlin Migration

## Phase 1: Project Setup & Dependencies

- [ ] 1. Setup project structure
  - [ ] 1.1 Tạo cấu trúc thư mục MVVM
    - Create data/, domain/, presentation/, di/, util/ packages
    - _Requirements: 1.4_
  
  - [ ] 1.2 Cấu hình Gradle dependencies
    - Add Jetpack Compose BOM
    - Add Hilt dependencies
    - Add Retrofit + OkHttp
    - Add Room database
    - Add Coil for image loading
    - _Requirements: 1.3, 1.5_
  
  - [ ] 1.3 Setup Hilt Dependency Injection
    - Create Application class with @HiltAndroidApp
    - Create AppModule for app-level dependencies
    - Create NetworkModule for Retrofit
    - _Requirements: 1.5_
  
  - [ ] 1.4 Cấu hình build variants
    - Setup debug và release variants
    - Configure ProGuard rules
    - Setup signing config
    - _Requirements: 12.2, 12.4_

## Phase 2: Data Layer

- [ ] 2. Implement API client
  - [ ] 2.1 Create data models
    - Create User, GameSession, PremiumPackage models
    - Add JSON serialization annotations
    - _Requirements: 6.1_
  
  - [ ] 2.2 Create Retrofit interfaces
    - Implement AuthApi (login, register, refresh)
    - Implement GameApi (start, end, history, leaderboard)
    - Implement PremiumApi (packages, purchase)
    - Implement PaymentApi (VNPay)
    - _Requirements: 6.1, 6.2_
  
  - [ ] 2.3 Implement interceptors
    - Create AuthInterceptor for JWT token
    - Create LoggingInterceptor for debugging
    - Create ErrorInterceptor for error handling
    - _Requirements: 6.2, 6.3_
  
  - [ ] 2.4 Create Repository implementations
    - Implement AuthRepository
    - Implement GameRepository
    - Implement PremiumRepository
    - _Requirements: 6.4, 6.5_

- [ ] 3. Implement local storage
  - [ ] 3.1 Setup EncryptedSharedPreferences
    - Store JWT tokens securely
    - Store user preferences
    - _Requirements: 5.3_
  
  - [ ] 3.2 Setup Room database (optional)
    - Create entities for offline cache
    - Create DAOs
    - Create database class
    - _Requirements: 6.4_

## Phase 3: Domain Layer - Game Logic

- [ ] 4. Port ChessGame class
  - [ ] 4.1 Create Piece và Position data classes
    - Define PieceType enum
    - Define GameMode, Turn enums
    - _Requirements: 2.2_
  
  - [ ] 4.2 Implement board initialization
    - Create 9x8 board array
    - Implement initBoard()
    - _Requirements: 2.2_
  
  - [ ] 4.3 Implement setup phase
    - Port handleSetupTap()
    - Validate Xe placement
    - _Requirements: 2.2_
  
  - [ ] 4.4 Implement player movement
    - Port getValidMoves()
    - Port handlePlayerMove()
    - Validate moves theo luật cờ tướng
    - _Requirements: 2.3_
  
  - [ ] 4.5 Implement move categorization
    - Port getCategorizedMoves()
    - Implement isPositionUnderAttack()
    - Implement willXeBeCapturedAt()
    - _Requirements: 2.3_
  
  - [ ] 4.6 Implement scoring system
    - Port calculateScore()
    - Port applyPremiumBonus()
    - Port capturePiece()
    - _Requirements: 2.4_
  
  - [ ] 4.7 Implement fire mode
    - Port activateFireMode()
    - Port executeFireBlast()
    - Calculate double score with premium bonus
    - _Requirements: 2.5_
  
  - [ ] 4.8 Implement game over logic
    - Port checkGameOver()
    - Check Xe captured, turn limit, checkmate
    - _Requirements: 2.2_

- [ ] 5. Port EnemyAI class
  - [ ] 5.1 Implement piece spawning schedule
    - Port chooseNewPieceType()
    - Track piece first appearance
    - _Requirements: 3.2_
  
  - [ ] 5.2 Implement strategic positioning
    - Port findStrategicPosition()
    - Port calculateSafetyScore()
    - _Requirements: 3.2_
  
  - [ ] 5.3 Implement AI move selection
    - Port chooseBestMove()
    - Port evaluateMove()
    - Implement scoring logic
    - _Requirements: 3.3_
  
  - [ ] 5.4 Implement enemy piece movements
    - Port validateTotMove()
    - Port validateSiMove()
    - Port validateTuongMove()
    - Port validateMaMove()
    - Port validatePhaoMove()
    - Port validateXeDichMove()
    - Port validateTuongDichMove()
    - _Requirements: 3.4_
  
  - [ ] 5.5 Implement executeTurn()
    - Combine spawning và moving logic
    - Handle turn execution
    - _Requirements: 3.5_

## Phase 4: Presentation Layer - ViewModels

- [ ] 6. Implement AuthViewModel
  - [ ] 6.1 Create login flow
    - Handle login form state
    - Call AuthRepository.login()
    - Save user to state
    - _Requirements: 5.1_
  
  - [ ] 6.2 Create register flow
    - Handle register form state
    - Validate inputs
    - Call AuthRepository.register()
    - _Requirements: 5.2_
  
  - [ ] 6.3 Implement token management
    - Auto refresh token
    - Handle logout
    - _Requirements: 5.4_

- [ ] 7. Implement GameViewModel
  - [ ] 7.1 Initialize game state
    - Create ChessGame instance
    - Create EnemyAI instance
    - Setup StateFlow
    - _Requirements: 2.2_
  
  - [ ] 7.2 Implement setup phase logic
    - Handle cell tap for Xe placement
    - Update UI state
    - _Requirements: 2.2_
  
  - [ ] 7.3 Implement playing phase logic
    - Handle cell tap for selection/movement
    - Execute player moves
    - Execute enemy turns
    - _Requirements: 2.3_
  
  - [ ] 7.4 Implement game session management
    - Call startGame API
    - Call endGame API
    - Handle offline mode
    - _Requirements: 7.1, 7.2_
  
  - [ ] 7.5 Implement game over handling
    - Check game over conditions
    - Show results
    - Update user stats
    - _Requirements: 2.2_

- [ ] 8. Implement other ViewModels
  - [ ] 8.1 Create HomeViewModel
    - Load user stats
    - Handle navigation
    - _Requirements: 10.2_
  
  - [ ] 8.2 Create ShopViewModel
    - Load premium packages
    - Handle purchase flow
    - _Requirements: 8.1, 8.2_
  
  - [ ] 8.3 Create ProfileViewModel
    - Load user profile
    - Load game history
    - Load transaction history
    - Handle logout
    - _Requirements: 10.1, 10.3, 10.4_
  
  - [ ] 8.4 Create LeaderboardViewModel
    - Load leaderboard data
    - Handle refresh
    - _Requirements: 9.1, 9.2_

## Phase 5: UI Layer - Jetpack Compose

- [ ] 9. Implement Authentication screens
  - [ ] 9.1 Create LoginScreen
    - Email và password inputs
    - Login button
    - Navigate to register
    - _Requirements: 5.1_
  
  - [ ] 9.2 Create RegisterScreen
    - Username, email, password inputs
    - Register button
    - Navigate to login
    - _Requirements: 5.2_

- [ ] 10. Implement Game screen
  - [ ] 10.1 Create GameScreen layout
    - GameInfo component
    - ChessBoard component
    - GameControls component
    - _Requirements: 4.1_
  
  - [ ] 10.2 Create ChessBoard composable
    - Draw 9x8 grid with Canvas
    - Draw pieces
    - Handle touch events
    - _Requirements: 4.1, 4.2_
  
  - [ ] 10.3 Implement move highlighting
    - Highlight safe moves (green)
    - Highlight danger moves (red)
    - Highlight trap moves (orange)
    - Highlight selected cell
    - _Requirements: 4.2_
  
  - [ ] 10.4 Implement animations
    - Capture animation (fade out)
    - Fire blast animation
    - Move animation
    - _Requirements: 4.3_
  
  - [ ] 10.5 Create GameInfo component
    - Display turn count
    - Display score
    - Display game phase
    - Display fire mode indicator
    - _Requirements: 4.4_
  
  - [ ] 10.6 Create GameControls component
    - Start game button (setup phase)
    - End game button (playing phase)
    - Play again button
    - _Requirements: 4.4_

- [ ] 11. Implement Home screen
  - [ ] 11.1 Create HomeScreen layout
    - User stats card
    - Play button
    - Leaderboard button
    - Shop button
    - Profile button
    - _Requirements: 10.2_

- [ ] 12. Implement Shop screen
  - [ ] 12.1 Create ShopScreen layout
    - List of premium packages
    - Package cards with features
    - Purchase buttons
    - _Requirements: 8.1_
  
  - [ ] 12.2 Implement VNPay WebView
    - Open payment URL in WebView
    - Handle payment callback
    - _Requirements: 8.2_

- [ ] 13. Implement Profile screen
  - [ ] 13.1 Create ProfileScreen layout
    - User info section
    - Game stats section
    - Premium info section
    - Logout button
    - _Requirements: 10.1_
  
  - [ ] 13.2 Create GameHistoryScreen
    - List of past games
    - Show score, turns, result
    - _Requirements: 10.3_
  
  - [ ] 13.3 Create TransactionHistoryScreen
    - List of transactions
    - Show package, price, date
    - _Requirements: 10.4_

- [ ] 14. Implement Leaderboard screen
  - [ ] 14.1 Create LeaderboardScreen layout
    - List of top players
    - Show rank, username, score
    - Highlight current user
    - Show premium badges
    - Pull to refresh
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

## Phase 6: Navigation

- [ ] 15. Setup Navigation
  - [ ] 15.1 Create navigation graph
    - Define routes
    - Setup NavHost
    - _Requirements: 4.1_
  
  - [ ] 15.2 Implement authentication flow
    - Splash screen
    - Login/Register screens
    - Main app screens
    - _Requirements: 5.1, 5.2_
  
  - [ ] 15.3 Implement bottom navigation
    - Home, Game, Shop, Profile tabs
    - _Requirements: 4.1_

## Phase 7: Testing & Optimization

- [ ] 16. Write unit tests
  - [ ] 16.1 Test ChessGame logic
    - Test move validation
    - Test scoring
    - Test game over conditions
    - _Requirements: 2.3, 2.4_
  
  - [ ] 16.2 Test EnemyAI logic
    - Test piece spawning
    - Test move selection
    - _Requirements: 3.2, 3.3_
  
  - [ ] 16.3 Test ViewModels
    - Test state management
    - Test API calls
    - _Requirements: 6.1, 7.1_

- [ ] 17. Optimize performance
  - [ ] 17.1 Optimize Compose recomposition
    - Use remember và derivedStateOf
    - Optimize key usage
    - _Requirements: 11.1_
  
  - [ ] 17.2 Optimize memory usage
    - Profile memory with Android Profiler
    - Fix memory leaks
    - _Requirements: 11.3_
  
  - [ ] 17.3 Optimize APK size
    - Enable R8 shrinking
    - Remove unused resources
    - _Requirements: 11.4_

## Phase 8: Build & Release

- [ ] 18. Prepare for release
  - [ ] 18.1 Configure release build
    - Setup signing config
    - Enable ProGuard/R8
    - _Requirements: 12.3, 12.4_
  
  - [ ] 18.2 Build APK
    - Build debug APK for testing
    - Build release APK
    - _Requirements: 12.1_
  
  - [ ] 18.3 Build AAB for Google Play
    - Generate signed AAB
    - Test on internal track
    - _Requirements: 12.5_
  
  - [ ] 18.4 Create release documentation
    - Update README
    - Create user guide
    - Document API endpoints
    - _Requirements: 12.1_

## Notes

- Mỗi task nên được test kỹ trước khi chuyển sang task tiếp theo
- Sử dụng Git để commit sau mỗi task hoàn thành
- Tham khảo code React Native hiện tại khi port logic
- Ưu tiên performance và user experience
- Follow Android best practices và Material Design guidelines
