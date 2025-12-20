# 🚀 Hướng dẫn Migration từ React Native sang Kotlin

## 📋 Tổng quan

Dự án này chuyển đổi ứng dụng Cờ Tướng ToolChess từ React Native/Expo sang Android Native với Kotlin + Jetpack Compose.

## 🎯 Mục tiêu

✅ **Performance**: Tăng tốc độ, giảm lag  
✅ **Build dễ dàng**: Build APK trực tiếp với Android Studio  
✅ **Native features**: Tận dụng tối đa Android platform  
✅ **Maintainability**: Code dễ maintain và scale  

## 📂 Cấu trúc dự án Kotlin

```
app/
├── src/main/
│   ├── java/com/toolchess/mobile/
│   │   ├── data/
│   │   │   ├── api/
│   │   │   │   ├── AuthApi.kt
│   │   │   │   ├── GameApi.kt
│   │   │   │   ├── PremiumApi.kt
│   │   │   │   └── PaymentApi.kt
│   │   │   ├── model/
│   │   │   │   ├── User.kt
│   │   │   │   ├── GameSession.kt
│   │   │   │   └── PremiumPackage.kt
│   │   │   ├── repository/
│   │   │   │   ├── AuthRepositoryImpl.kt
│   │   │   │   ├── GameRepositoryImpl.kt
│   │   │   │   └── PremiumRepositoryImpl.kt
│   │   │   └── local/
│   │   │       └── PreferencesManager.kt
│   │   ├── domain/
│   │   │   ├── model/
│   │   │   │   ├── Piece.kt
│   │   │   │   ├── Position.kt
│   │   │   │   └── GameState.kt
│   │   │   ├── usecase/
│   │   │   │   ├── ChessGame.kt
│   │   │   │   └── EnemyAI.kt
│   │   │   └── repository/
│   │   │       ├── AuthRepository.kt
│   │   │       ├── GameRepository.kt
│   │   │       └── PremiumRepository.kt
│   │   ├── presentation/
│   │   │   ├── auth/
│   │   │   │   ├── LoginScreen.kt
│   │   │   │   ├── RegisterScreen.kt
│   │   │   │   └── AuthViewModel.kt
│   │   │   ├── game/
│   │   │   │   ├── GameScreen.kt
│   │   │   │   ├── ChessBoard.kt
│   │   │   │   ├── GameControls.kt
│   │   │   │   └── GameViewModel.kt
│   │   │   ├── home/
│   │   │   │   ├── HomeScreen.kt
│   │   │   │   └── HomeViewModel.kt
│   │   │   ├── shop/
│   │   │   │   ├── ShopScreen.kt
│   │   │   │   └── ShopViewModel.kt
│   │   │   ├── profile/
│   │   │   │   ├── ProfileScreen.kt
│   │   │   │   └── ProfileViewModel.kt
│   │   │   └── leaderboard/
│   │   │       ├── LeaderboardScreen.kt
│   │   │       └── LeaderboardViewModel.kt
│   │   ├── di/
│   │   │   ├── AppModule.kt
│   │   │   └── NetworkModule.kt
│   │   ├── util/
│   │   │   ├── Constants.kt
│   │   │   ├── Extensions.kt
│   │   │   └── Result.kt
│   │   └── ToolChessApp.kt
│   └── res/
│       ├── values/
│       │   ├── colors.xml
│       │   ├── strings.xml
│       │   └── themes.xml
│       └── drawable/
└── build.gradle.kts
```

## 🔄 Mapping React Native → Kotlin

### JavaScript → Kotlin

| React Native | Kotlin |
|-------------|--------|
| `ChessGame.js` | `ChessGame.kt` (domain/usecase) |
| `EnemyAI.js` | `EnemyAI.kt` (domain/usecase) |
| `GameScreen.js` | `GameScreen.kt` + `GameViewModel.kt` |
| `AuthContext.js` | `AuthRepository.kt` + `AuthViewModel.kt` |
| `api.js` | `*Api.kt` interfaces + Retrofit |
| `constants.js` | `Constants.kt` |

### UI Components

| React Native | Jetpack Compose |
|-------------|-----------------|
| `<View>` | `Column`, `Row`, `Box` |
| `<Text>` | `Text()` |
| `<TouchableOpacity>` | `Button()`, `IconButton()` |
| `<FlatList>` | `LazyColumn()` |
| `<Image>` | `Image()`, `AsyncImage()` |
| `StyleSheet` | `Modifier` |
| `useState` | `remember`, `mutableStateOf` |
| `useEffect` | `LaunchedEffect`, `DisposableEffect` |

### State Management

| React Native | Kotlin |
|-------------|--------|
| `useState` | `MutableStateFlow` |
| `useContext` | `Hilt` injection |
| `useCallback` | `remember { }` |
| `useMemo` | `derivedStateOf` |

## 📝 Các bước thực hiện

### Bước 1: Setup Dependencies (build.gradle.kts)

```kotlin
dependencies {
    // Jetpack Compose
    implementation(platform("androidx.compose:compose-bom:2024.01.00"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.ui:ui-tooling-preview")
    
    // Hilt
    implementation("com.google.dagger:hilt-android:2.48")
    kapt("com.google.dagger:hilt-compiler:2.48")
    implementation("androidx.hilt:hilt-navigation-compose:1.1.0")
    
    // Retrofit
    implementation("com.squareup.retrofit2:retrofit:2.9.0")
    implementation("com.squareup.retrofit2:converter-gson:2.9.0")
    implementation("com.squareup.okhttp3:logging-interceptor:4.11.0")
    
    // Coroutines
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3")
    
    // ViewModel
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.7.0")
    
    // Navigation
    implementation("androidx.navigation:navigation-compose:2.7.6")
    
    // Coil for images
    implementation("io.coil-kt:coil-compose:2.5.0")
    
    // DataStore
    implementation("androidx.datastore:datastore-preferences:1.0.0")
    
    // Security
    implementation("androidx.security:security-crypto:1.1.0-alpha06")
}
```

### Bước 2: Port Game Logic

**ChessGame.js → ChessGame.kt**

```kotlin
class ChessGame(private val premiumBonus: Float = 0f) {
    private var board: Array<Array<Piece?>> = Array(9) { Array(8) { null } }
    private var playerXe: Piece? = null
    private var enemyPieces: MutableList<Piece> = mutableListOf()
    var gameMode: GameMode = GameMode.SETUP
        private set
    var currentTurn: Turn = Turn.PLAYER
        private set
    var turnCount: Int = 0
        private set
    var score: Int = 0
        private set
    var fireModeActive: Boolean = false
        private set
    
    init {
        initBoard()
    }
    
    private fun initBoard() {
        board = Array(9) { Array(8) { null } }
    }
    
    fun handleSetupTap(row: Int, col: Int): Result<Unit> {
        if (gameMode != GameMode.SETUP) {
            return Result.Error(Exception("Not in setup mode"))
        }
        
        if (!isValidPosition(row, col)) {
            return Result.Error(Exception("Invalid position"))
        }
        
        val existingPiece = board[row][col]
        if (existingPiece?.isEnemy == true) {
            return Result.Error(Exception("Cannot place on enemy piece"))
        }
        
        // Remove old Xe if exists
        playerXe?.let { oldXe ->
            board[oldXe.row][oldXe.col] = null
        }
        
        // Place new Xe
        val newXe = Piece(row, col, PieceType.XE, false)
        board[row][col] = newXe
        playerXe = newXe
        
        return Result.Success(Unit)
    }
    
    // ... rest of the methods
}
```

### Bước 3: Create ViewModel

```kotlin
@HiltViewModel
class GameViewModel @Inject constructor(
    private val gameRepository: GameRepository,
    private val authRepository: AuthRepository
) : ViewModel() {
    
    private val _uiState = MutableStateFlow<GameUiState>(GameUiState.Setup())
    val uiState: StateFlow<GameUiState> = _uiState.asStateFlow()
    
    private val chessGame: ChessGame
    private val enemyAI: EnemyAI
    
    init {
        val premiumBonus = authRepository.getCurrentUser()?.premiumBonusPercentage ?: 0f
        chessGame = ChessGame(premiumBonus)
        enemyAI = EnemyAI(chessGame)
    }
    
    fun onCellTap(row: Int, col: Int) {
        when (chessGame.gameMode) {
            GameMode.SETUP -> handleSetupTap(row, col)
            GameMode.PLAYING -> handlePlayingTap(row, col)
            GameMode.ENDED -> { /* Do nothing */ }
        }
    }
    
    private fun handleSetupTap(row: Int, col: Int) {
        chessGame.handleSetupTap(row, col).onSuccess {
            updateUiState()
        }.onError { message ->
            showError(message)
        }
    }
    
    fun startGame() {
        viewModelScope.launch {
            _uiState.value = GameUiState.Loading
            
            gameRepository.startGame()
                .onSuccess { session ->
                    chessGame.startGame(session)
                    updateUiState()
                }
                .onError { message ->
                    showError(message)
                }
        }
    }
    
    private fun updateUiState() {
        _uiState.value = when (chessGame.gameMode) {
            GameMode.SETUP -> GameUiState.Setup(
                board = chessGame.getBoard(),
                playerXePlaced = chessGame.playerXe != null
            )
            GameMode.PLAYING -> GameUiState.Playing(
                board = chessGame.getBoard(),
                turnCount = chessGame.turnCount,
                score = chessGame.score,
                currentTurn = chessGame.currentTurn,
                categorizedMoves = chessGame.getCategorizedMoves(),
                selectedCell = chessGame.selectedCell
            )
            GameMode.ENDED -> GameUiState.Ended(
                finalScore = chessGame.score,
                turnCount = chessGame.turnCount
            )
        }
    }
}
```

### Bước 4: Create Compose UI

```kotlin
@Composable
fun GameScreen(
    viewModel: GameViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    
    Scaffold(
        topBar = {
            TopAppBar(title = { Text("Cờ Tướng ToolChess") })
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            when (val state = uiState) {
                is GameUiState.Setup -> SetupContent(
                    board = state.board,
                    playerXePlaced = state.playerXePlaced,
                    onCellTap = viewModel::onCellTap,
                    onStartGame = viewModel::startGame
                )
                is GameUiState.Playing -> PlayingContent(
                    board = state.board,
                    turnCount = state.turnCount,
                    score = state.score,
                    categorizedMoves = state.categorizedMoves,
                    onCellTap = viewModel::onCellTap,
                    onEndGame = viewModel::endGame
                )
                is GameUiState.Ended -> EndedContent(
                    finalScore = state.finalScore,
                    turnCount = state.turnCount,
                    onPlayAgain = viewModel::playAgain
                )
                is GameUiState.Loading -> LoadingContent()
            }
        }
    }
}

@Composable
fun ChessBoard(
    board: Array<Array<Piece?>>,
    categorizedMoves: CategorizedMoves?,
    selectedCell: Position?,
    onCellTap: (Int, Int) -> Unit
) {
    Canvas(
        modifier = Modifier
            .fillMaxWidth()
            .aspectRatio(8f / 9f)
            .pointerInput(Unit) {
                detectTapGestures { offset ->
                    val cellWidth = size.width / 8
                    val cellHeight = size.height / 9
                    val col = (offset.x / cellWidth).toInt()
                    val row = (offset.y / cellHeight).toInt()
                    onCellTap(row, col)
                }
            }
    ) {
        val cellWidth = size.width / 8
        val cellHeight = size.height / 9
        
        // Draw board
        for (row in 0 until 9) {
            for (col in 0 until 8) {
                val isLight = (row + col) % 2 == 0
                drawRect(
                    color = if (isLight) Color(0xFFF0D9B5) else Color(0xFFB58863),
                    topLeft = Offset(col * cellWidth, row * cellHeight),
                    size = Size(cellWidth, cellHeight)
                )
            }
        }
        
        // Draw highlights
        categorizedMoves?.let { moves ->
            moves.safeMoves.forEach { pos ->
                drawCircle(
                    color = Color.Green.copy(alpha = 0.3f),
                    radius = cellWidth / 3,
                    center = Offset(
                        pos.col * cellWidth + cellWidth / 2,
                        pos.row * cellHeight + cellHeight / 2
                    )
                )
            }
            // ... draw danger and trap moves
        }
        
        // Draw pieces
        board.forEachIndexed { row, rowArray ->
            rowArray.forEachIndexed { col, piece ->
                piece?.let {
                    drawPiece(it, col * cellWidth, row * cellHeight, cellWidth, cellHeight)
                }
            }
        }
    }
}
```

## 🔧 Build APK

### Debug APK
```bash
./gradlew assembleDebug
```
APK ở: `app/build/outputs/apk/debug/app-debug.apk`

### Release APK
```bash
./gradlew assembleRelease
```
APK ở: `app/build/outputs/apk/release/app-release.apk`

### AAB cho Google Play
```bash
./gradlew bundleRelease
```
AAB ở: `app/build/outputs/bundle/release/app-release.aab`

## 📱 Phiên bản Android

- **minSdk**: 24 (Android 7.0 - Nougat)
- **targetSdk**: 35 (Android 15)
- **compileSdk**: 35

## 🎯 Ưu điểm Kotlin vs React Native

| Tiêu chí | React Native | Kotlin Native |
|----------|-------------|---------------|
| Performance | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Build APK | Phức tạp | Dễ dàng |
| APK Size | ~50MB | ~20MB |
| Startup Time | ~2s | ~0.5s |
| Memory Usage | ~150MB | ~80MB |
| Native Features | Giới hạn | Đầy đủ |
| Development | Nhanh | Trung bình |
| Debugging | Khó | Dễ |

## 📚 Tài liệu tham khảo

- [Jetpack Compose](https://developer.android.com/jetpack/compose)
- [Kotlin Coroutines](https://kotlinlang.org/docs/coroutines-overview.html)
- [Hilt Dependency Injection](https://developer.android.com/training/dependency-injection/hilt-android)
- [Retrofit](https://square.github.io/retrofit/)
- [Material Design 3](https://m3.material.io/)

## ✅ Checklist Migration

- [ ] Setup project structure
- [ ] Add dependencies
- [ ] Port ChessGame logic
- [ ] Port EnemyAI logic
- [ ] Create ViewModels
- [ ] Create Compose UI
- [ ] Implement API calls
- [ ] Test game flow
- [ ] Build APK
- [ ] Test on device

---

**Lưu ý**: Tham khảo files `requirements.md`, `design.md`, và `tasks.md` để biết chi tiết từng bước implementation.
