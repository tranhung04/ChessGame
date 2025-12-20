# Design Document - Kotlin Migration

## Overview

Thiết kế kiến trúc cho ứng dụng Android Kotlin native, sử dụng MVVM pattern với Jetpack Compose, Hilt DI, và Retrofit cho API calls.

## Architecture

### MVVM Pattern
```
View (Compose UI) 
    ↓
ViewModel (Business Logic)
    ↓
Repository (Data Layer)
    ↓
Data Sources (API, Local DB)
```

### Module Structure
```
app/
├── data/
│   ├── api/          # Retrofit interfaces
│   ├── model/        # Data models
│   ├── repository/   # Repository implementations
│   └── local/        # Room database, SharedPreferences
├── domain/
│   ├── model/        # Domain models
│   ├── usecase/      # Business logic use cases
│   └── repository/   # Repository interfaces
├── presentation/
│   ├── auth/         # Login, Register screens
│   ├── game/         # Game screen
│   ├── home/         # Home screen
│   ├── shop/         # Shop screen
│   ├── profile/      # Profile screen
│   └── leaderboard/  # Leaderboard screen
├── di/               # Hilt modules
└── util/             # Utilities, extensions
```

## Components and Interfaces

### 1. Game Engine (Kotlin)

```kotlin
class ChessGame(private val premiumBonus: Float = 0f) {
    private var board: Array<Array<Piece?>> = Array(9) { Array(8) { null } }
    private var playerXe: Piece? = null
    private var enemyPieces: MutableList<Piece> = mutableListOf()
    private var gameMode: GameMode = GameMode.SETUP
    private var currentTurn: Turn = Turn.PLAYER
    private var turnCount: Int = 0
    private var score: Int = 0
    private var fireModeActive: Boolean = false
    
    fun handleSetupTap(row: Int, col: Int): Result<Unit>
    fun startGame(): Result<GameSession>
    fun handlePlayerMove(row: Int, col: Int): Result<MoveResult>
    fun getValidMoves(piece: Piece): List<Position>
    fun getCategorizedMoves(): CategorizedMoves
    fun executeFireBlast(): Result<FireBlastResult>
    fun checkGameOver(): GameOverStatus
    fun endGame(result: GameResult): Result<EndGameData>
}

enum class GameMode { SETUP, PLAYING, ENDED }
enum class Turn { PLAYER, ENEMY }
enum class PieceType { XE, TOT, SI, TUONG, MA, PHAO, XE_DICH, TUONG_DICH }

data class Piece(
    val row: Int,
    val col: Int,
    val type: PieceType,
    val isEnemy: Boolean
)

data class Position(val row: Int, val col: Int)

data class CategorizedMoves(
    val validMoves: List<Position>,
    val safeMoves: List<Position>,
    val dangerMoves: List<Position>,
    val trapMoves: List<Position>
)
```

### 2. Enemy AI (Kotlin)

```kotlin
class EnemyAI(private val game: ChessGame) {
    private var turnsSinceLastTuongDich: Int = 0
    private val pieceFirstAppearance: MutableMap<PieceType, Int> = mutableMapOf()
    
    suspend fun executeTurn(): Result<AITurnResult>
    private fun chooseNewPieceType(): PieceType
    private fun findStrategicPosition(pieceType: PieceType): Position
    private fun calculateSafetyScore(position: Position): Int
    private fun chooseBestMove(): AIMove?
    private fun evaluateMove(piece: Piece, position: Position): Int
}

data class AITurnResult(
    val action: AIAction,
    val piece: Piece?,
    val position: Position?,
    val score: Int
)

enum class AIAction { ADD_PIECE, MOVE_PIECE, NO_ACTION }
```

### 3. API Client (Retrofit)

```kotlin
interface AuthApi {
    @POST("auth/register")
    suspend fun register(@Body request: RegisterRequest): Response<AuthResponse>
    
    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): Response<AuthResponse>
    
    @POST("auth/refresh")
    suspend fun refreshToken(@Body request: RefreshRequest): Response<AuthResponse>
}

interface GameApi {
    @POST("game/start")
    suspend fun startGame(): Response<GameSessionResponse>
    
    @POST("game/end")
    suspend fun endGame(@Body request: EndGameRequest): Response<EndGameResponse>
    
    @GET("game/history")
    suspend fun getGameHistory(): Response<List<GameHistory>>
    
    @GET("game/leaderboard")
    suspend fun getLeaderboard(): Response<List<LeaderboardEntry>>
}

interface PremiumApi {
    @GET("premium/packages")
    suspend fun getPackages(): Response<List<PremiumPackage>>
    
    @POST("premium/purchase")
    suspend fun purchasePackage(@Body request: PurchaseRequest): Response<PurchaseResponse>
}

interface PaymentApi {
    @POST("payment/vnpay/create")
    suspend fun createVNPayPayment(@Body request: PaymentRequest): Response<PaymentResponse>
}
```

### 4. Repository Pattern

```kotlin
interface AuthRepository {
    suspend fun login(email: String, password: String): Result<User>
    suspend fun register(username: String, email: String, password: String): Result<User>
    suspend fun logout()
    fun isLoggedIn(): Boolean
    fun getCurrentUser(): User?
}

interface GameRepository {
    suspend fun startGame(): Result<GameSession>
    suspend fun endGame(sessionId: String, score: Int, turnCount: Int, duration: Int, result: String): Result<Unit>
    suspend fun getGameHistory(): Result<List<GameHistory>>
    suspend fun getLeaderboard(): Result<List<LeaderboardEntry>>
}

interface PremiumRepository {
    suspend fun getPackages(): Result<List<PremiumPackage>>
    suspend fun purchasePackage(packageId: String): Result<String> // Returns payment URL
    fun getPremiumStatus(): PremiumStatus?
}
```

### 5. ViewModels

```kotlin
@HiltViewModel
class GameViewModel @Inject constructor(
    private val gameRepository: GameRepository,
    private val authRepository: AuthRepository
) : ViewModel() {
    
    private val _gameState = MutableStateFlow<GameState>(GameState.Initial)
    val gameState: StateFlow<GameState> = _gameState.asStateFlow()
    
    private val chessGame: ChessGame = ChessGame(premiumBonus = getPremiumBonus())
    private val enemyAI: EnemyAI = EnemyAI(chessGame)
    
    fun handleCellTap(row: Int, col: Int)
    fun startGame()
    fun endGame()
    fun playAgain()
    private suspend fun executeEnemyTurn()
}

sealed class GameState {
    object Initial : GameState()
    object Loading : GameState()
    data class Setup(val playerXePlaced: Boolean) : GameState()
    data class Playing(
        val board: Array<Array<Piece?>>,
        val turnCount: Int,
        val score: Int,
        val currentTurn: Turn,
        val categorizedMoves: CategorizedMoves?,
        val selectedCell: Position?
    ) : GameState()
    data class Ended(val finalScore: Int, val turnCount: Int, val result: String) : GameState()
    data class Error(val message: String) : GameState()
}
```

### 6. Compose UI

```kotlin
@Composable
fun GameScreen(
    viewModel: GameViewModel = hiltViewModel()
) {
    val gameState by viewModel.gameState.collectAsState()
    
    Column(modifier = Modifier.fillMaxSize()) {
        GameInfo(turnCount, score, gameMode, currentTurn, fireModeActive)
        
        ChessBoard(
            board = board,
            onCellTap = { row, col -> viewModel.handleCellTap(row, col) },
            categorizedMoves = categorizedMoves,
            selectedCell = selectedCell
        )
        
        GameControls(
            gameMode = gameMode,
            onStartGame = { viewModel.startGame() },
            onEndGame = { viewModel.endGame() },
            onPlayAgain = { viewModel.playAgain() },
            playerXePlaced = playerXePlaced
        )
    }
}

@Composable
fun ChessBoard(
    board: Array<Array<Piece?>>,
    onCellTap: (Int, Int) -> Unit,
    categorizedMoves: CategorizedMoves?,
    selectedCell: Position?
) {
    Canvas(modifier = Modifier
        .fillMaxWidth()
        .aspectRatio(8f / 9f)
        .pointerInput(Unit) {
            detectTapGestures { offset ->
                val row = (offset.y / (size.height / 9)).toInt()
                val col = (offset.x / (size.width / 8)).toInt()
                onCellTap(row, col)
            }
        }
    ) {
        // Draw board, pieces, highlights
        drawBoard()
        drawPieces(board)
        drawHighlights(categorizedMoves, selectedCell)
    }
}
```

## Data Models

### User Models
```kotlin
data class User(
    val id: String,
    val username: String,
    val email: String,
    val isPremium: Boolean,
    val premiumBonusPercentage: Float,
    val stats: UserStats
)

data class UserStats(
    val totalGames: Int,
    val wins: Int,
    val losses: Int,
    val highestScore: Int
)
```

### Game Models
```kotlin
data class GameSession(
    val id: String,
    val createdAt: String
)

data class GameHistory(
    val id: String,
    val score: Int,
    val turnCount: Int,
    val result: String,
    val duration: Int,
    val createdAt: String
)

data class LeaderboardEntry(
    val rank: Int,
    val username: String,
    val highestScore: Int,
    val isPremium: Boolean
)
```

### Premium Models
```kotlin
data class PremiumPackage(
    val id: String,
    val name: String,
    val price: Int,
    val duration: Int,
    val bonusPercentage: Float,
    val freeRevives: Int,
    val features: List<String>
)

data class PremiumStatus(
    val isActive: Boolean,
    val packageName: String,
    val expiresAt: String,
    val bonusPercentage: Float
)
```

## Error Handling

### Result Wrapper
```kotlin
sealed class Result<out T> {
    data class Success<T>(val data: T) : Result<T>()
    data class Error(val exception: Exception, val message: String) : Result<Nothing>()
    object Loading : Result<Nothing>()
}

fun <T> Result<T>.onSuccess(action: (T) -> Unit): Result<T> {
    if (this is Result.Success) action(data)
    return this
}

fun <T> Result<T>.onError(action: (String) -> Unit): Result<T> {
    if (this is Result.Error) action(message)
    return this
}
```

### Network Error Handling
```kotlin
suspend fun <T> safeApiCall(apiCall: suspend () -> Response<T>): Result<T> {
    return try {
        val response = apiCall()
        if (response.isSuccessful && response.body() != null) {
            Result.Success(response.body()!!)
        } else {
            Result.Error(
                HttpException(response),
                response.message() ?: "Unknown error"
            )
        }
    } catch (e: IOException) {
        Result.Error(e, "Network error. Please check your connection.")
    } catch (e: Exception) {
        Result.Error(e, e.message ?: "Unknown error occurred")
    }
}
```

## Testing Strategy

### Unit Tests
- Game logic (ChessGame, EnemyAI)
- ViewModels
- Repositories
- Use cases

### Integration Tests
- API calls with MockWebServer
- Database operations
- Repository implementations

### UI Tests
- Compose UI tests
- Navigation tests
- User flows

## Performance Optimization

### Memory Management
- Use `remember` và `derivedStateOf` trong Compose
- Lazy loading cho lists
- Image caching với Coil

### Network Optimization
- Request caching
- Retry mechanism
- Offline support với Room database

### UI Optimization
- Recomposition optimization
- LazyColumn cho long lists
- Hardware acceleration
