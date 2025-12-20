# Design Document

## Overview

This design implements the complete chess game logic from the web version into the React Native mobile app. The architecture follows a component-based approach with clear separation between game logic, UI components, and API integration. The game engine manages board state, piece movements, AI behavior, and scoring while React components handle rendering and user interactions.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      GameScreen                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Game Engine (ChessGame class)             │ │
│  │  - Board State Management                              │ │
│  │  - Turn Management                                     │ │
│  │  - Move Validation                                     │ │
│  │  - Scoring Logic                                       │ │
│  │  - Fire Mode                                           │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Enemy AI (EnemyAI class)                  │ │
│  │  - Piece Introduction Schedule                         │ │
│  │  - Strategic Movement                                  │ │
│  │  - Threat Detection                                    │ │
│  │  - Position Evaluation                                 │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                  UI Components                         │ │
│  │  - ChessBoard (grid rendering)                         │ │
│  │  - ChessPiece (piece rendering)                        │ │
│  │  - GameControls (buttons)                              │ │
│  │  - GameInfo (score, turn display)                      │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
                    ┌───────────────┐
                    │   Game API    │
                    │  - startGame  │
                    │  - endGame    │
                    └───────────────┘
```

### Data Flow

1. **Setup Phase**: User taps → GameScreen → ChessGame.placePiece() → Update board state → Re-render
2. **Player Turn**: User taps → ChessGame.handlePlayerMove() → Validate → Update state → API call → Switch turn
3. **Enemy Turn**: ChessGame.switchTurn() → EnemyAI.executeTurn() → Add/Move pieces → Update state → Switch turn
4. **Fire Mode**: Capture Tướng → Activate fire mode → Next move → Execute blast → Burn pieces → Update score

## Components and Interfaces

### 1. ChessGame Class (Game Engine)

**Purpose**: Core game logic and state management

**Properties**:
```javascript
{
  board: Array<Array<Piece | null>>,      // 9x8 grid
  playerXe: { row: number, col: number, type: 'xe' } | null,
  enemyPieces: Array<{ row: number, col: number, type: string, isEnemy: true }>,
  gameMode: 'setup' | 'playing' | 'ended',
  currentTurn: 'player' | 'enemy',
  turnCount: number,
  score: number,
  fireModeActive: boolean,
  gameSession: { _id: string, createdAt: string } | null,
  selectedCell: { row: number, col: number } | null
}
```

**Methods**:
```javascript
// Initialization
initBoard(): void
resetGame(): void

// Setup Phase
handleSetupTap(row: number, col: number): void
startGame(): Promise<void>

// Player Turn
handlePlayerMove(row: number, col: number): void
getValidMoves(piece: Piece): Array<Position>
isValidPosition(row: number, col: number): boolean

// Enemy Turn
switchToEnemyTurn(): void
executeEnemyTurn(): Promise<void>

// Piece Management
placePiece(row: number, col: number, type: string, isEnemy: boolean): void
removePiece(row: number, col: number): void
capturePiece(row: number, col: number): number

// Fire Mode
activateFireMode(): void
executeFireBlast(): void
burnPiecesInDirection(dr: number, dc: number): Array<Piece>

// Scoring
calculateScore(pieceType: string): number
applyPremiumBonus(baseScore: number): number

// Game Over
checkGameOver(): void
endGame(result: string): Promise<void>

// Utilities
getPieceSymbol(type: string): string
isPositionUnderAttack(row: number, col: number): boolean
```

### 2. EnemyAI Class

**Purpose**: Intelligent enemy behavior and strategy

**Properties**:
```javascript
{
  game: ChessGame,
  pieceFirstAppearance: Record<string, boolean>,
  newlyAddedPieceThisTurn: Piece | null,
  lastTuongSpawnTurn: number | null
}
```

**Methods**:
```javascript
// Main AI Logic
executeTurn(): Promise<void>

// Piece Introduction
chooseNewPieceType(turnCount: number): string | null
shouldIntroducePiece(turnCount: number): boolean

// Piece Addition
addPiece(pieceType: string): Promise<void>
findStrategicPosition(pieceType: string): Position | null
findBlockingPosition(playerXe: Piece): Position | null
findSafePosition(): Position | null

// Piece Movement
moveSmartPiece(): Promise<void>
findThreatenedPieces(): Array<Piece>
findBestMove(piece: Piece): Position | null
isPieceProtected(piece: Piece): boolean

// Position Evaluation
calculateSafetyScore(row: number, col: number): number
getDangerZones(playerXe: Piece): Array<Position>
isUnderThreat(piece: Piece): boolean

// Movement Rules
getEnemyValidMoves(piece: Piece): Array<Position>
validateTotMove(piece: Piece): Array<Position>
validateSiMove(piece: Piece): Array<Position>
validateTuongMove(piece: Piece): Array<Position>
validateMaMove(piece: Piece): Array<Position>
validatePhaoMove(piece: Piece): Array<Position>
validateXeDichMove(piece: Piece): Array<Position>
validateTuongDichMove(piece: Piece): Array<Position>
```

### 3. ChessBoard Component

**Purpose**: Render the 9x8 game board with pieces

**Props**:
```typescript
interface ChessBoardProps {
  board: Array<Array<Piece | null>>;
  onCellPress: (row: number, col: number) => void;
  validMoves: Array<Position>;
  dangerMoves: Array<Position>;
  trapMoves: Array<Position>;
  selectedCell: Position | null;
  gameMode: string;
}
```

**Rendering Logic**:
- 9 rows × 8 columns grid
- Cell size: (screenWidth - 40) / 8
- Alternating light/dark cells
- Highlight selected cell
- Highlight valid moves (green)
- Highlight danger moves (red)
- Highlight trap moves (orange)
- Render pieces with ChessPiece component

### 4. ChessPiece Component

**Purpose**: Render individual chess pieces

**Props**:
```typescript
interface ChessPieceProps {
  type: string;
  isEnemy: boolean;
  size: number;
}
```

**Piece Symbols**:
- xe: 車 (blue for player)
- tot: 卒 (red for enemy)
- si: 士 (red for enemy)
- tuong: 象 (red for enemy)
- ma: 馬 (red for enemy)
- phao: 砲 (red for enemy)
- xe-dich: 車 (red for enemy)
- tuong-dich: 將 (red for enemy)

### 5. GameControls Component

**Purpose**: Game control buttons

**Props**:
```typescript
interface GameControlsProps {
  gameMode: string;
  onStartGame: () => void;
  onEndGame: () => void;
  onPlayAgain: () => void;
}
```

**Buttons**:
- Start Game (setup phase)
- End Game (playing phase)
- Play Again (ended phase)

### 6. GameInfo Component

**Purpose**: Display game information

**Props**:
```typescript
interface GameInfoProps {
  turnCount: number;
  score: number;
  gamePhase: string;
  currentTurn: string;
  fireModeActive: boolean;
}
```

**Display**:
- Turn count
- Current score
- Game phase (Setup / Playing / Ended)
- Current turn (Player / Enemy)
- Fire mode indicator

## Data Models

### Piece Model
```typescript
interface Piece {
  row: number;
  col: number;
  type: 'xe' | 'tot' | 'si' | 'tuong' | 'ma' | 'phao' | 'xe-dich' | 'tuong-dich';
  isEnemy: boolean;
}
```

### Position Model
```typescript
interface Position {
  row: number;
  col: number;
}
```

### GameState Model
```typescript
interface GameState {
  board: Array<Array<Piece | null>>;
  playerXe: Piece | null;
  enemyPieces: Array<Piece>;
  gameMode: 'setup' | 'playing' | 'ended';
  currentTurn: 'player' | 'enemy';
  turnCount: number;
  score: number;
  fireModeActive: boolean;
  gameSession: GameSession | null;
}
```

### GameSession Model (Backend)
```typescript
interface GameSession {
  _id: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  score: number;
  turnCount: number;
  gameResult?: 'win' | 'lose' | 'draw';
  duration?: number;
}
```

## Movement Rules Implementation

### Player Xe Movement
```javascript
getValidMoves(piece) {
  const moves = [];
  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // Up, Down, Left, Right
  
  for (let [dr, dc] of directions) {
    let newRow = piece.row + dr;
    let newCol = piece.col + dc;
    
    while (isValidPosition(newRow, newCol)) {
      const targetPiece = board[newRow][newCol];
      
      // Can move to empty cell or capture enemy
      if (!targetPiece || targetPiece.isEnemy) {
        moves.push({ row: newRow, col: newCol });
      }
      
      // Stop if hit any piece
      if (targetPiece) break;
      
      newRow += dr;
      newCol += dc;
    }
  }
  
  return moves;
}
```

### Enemy Piece Movement Rules

**Tốt (Pawn)**: 1 step horizontal/vertical
```javascript
const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
for (let [dr, dc] of directions) {
  const newRow = piece.row + dr;
  const newCol = piece.col + dc;
  if (isValidPosition(newRow, newCol)) {
    moves.push({ row: newRow, col: newCol });
  }
}
```

**Sĩ (Advisor)**: 1 step diagonal
```javascript
const diagonals = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
for (let [dr, dc] of diagonals) {
  const newRow = piece.row + dr;
  const newCol = piece.col + dc;
  if (isValidPosition(newRow, newCol)) {
    moves.push({ row: newRow, col: newCol });
  }
}
```

**Tượng (Elephant)**: 2 steps diagonal, can't jump
```javascript
const diagonals = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
for (let [dr, dc] of diagonals) {
  const newRow = piece.row + dr * 2;
  const newCol = piece.col + dc * 2;
  const midRow = piece.row + dr;
  const midCol = piece.col + dc;
  
  if (isValidPosition(newRow, newCol) && 
      isValidPosition(midRow, midCol) && 
      !board[midRow][midCol]) {
    moves.push({ row: newRow, col: newCol });
  }
}
```

**Mã (Horse)**: L-shaped with leg blocking
```javascript
const horseMoves = [
  [-2, -1], [-2, 1], [-1, -2], [-1, 2],
  [1, -2], [1, 2], [2, -1], [2, 1]
];

for (let [dr, dc] of horseMoves) {
  const newRow = piece.row + dr;
  const newCol = piece.col + dc;
  
  if (isValidPosition(newRow, newCol)) {
    // Check leg blocking
    let midRow, midCol;
    if (Math.abs(dr) === 2) {
      midRow = piece.row + Math.sign(dr);
      midCol = piece.col;
    } else {
      midRow = piece.row;
      midCol = piece.col + Math.sign(dc);
    }
    
    if (!board[midRow][midCol]) {
      moves.push({ row: newRow, col: newCol });
    }
  }
}
```

**Pháo (Cannon)**: Unlimited straight, jump to capture
```javascript
const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

for (let [dr, dc] of directions) {
  let newRow = piece.row + dr;
  let newCol = piece.col + dc;
  let jumpedOver = false;
  
  while (isValidPosition(newRow, newCol)) {
    const targetPiece = board[newRow][newCol];
    
    if (!targetPiece) {
      if (!jumpedOver) {
        moves.push({ row: newRow, col: newCol });
      }
    } else if (!jumpedOver) {
      jumpedOver = true;
    } else {
      moves.push({ row: newRow, col: newCol });
      break;
    }
    
    newRow += dr;
    newCol += dc;
  }
}
```

**Xe địch & Tướng địch**: Same as player Xe for Xe địch, 1 step any direction for Tướng địch

## Fire Mode Implementation

### Activation
```javascript
capturePiece(row, col) {
  const piece = board[row][col];
  const baseScore = PIECE_VALUES[piece.type];
  
  if (piece.type === 'tuong-dich') {
    activateFireMode();
  }
  
  return applyPremiumBonus(baseScore);
}
```

### Fire Blast Execution
```javascript
executeFireBlast() {
  const directions = [
    { dr: -1, dc: 0 },  // Up
    { dr: 1, dc: 0 },   // Down
    { dr: 0, dc: -1 },  // Left
    { dr: 0, dc: 1 }    // Right
  ];
  
  let totalBurned = 0;
  let totalScore = 0;
  
  for (const { dr, dc } of directions) {
    let currentRow = playerXe.row + dr;
    let currentCol = playerXe.col + dc;
    
    while (isValidPosition(currentRow, currentCol)) {
      const piece = board[currentRow][currentCol];
      
      if (piece && piece.isEnemy) {
        const baseScore = PIECE_VALUES[piece.type];
        const fireScore = baseScore * 2; // Double score
        
        removePiece(currentRow, currentCol);
        removeEnemyPiece(currentRow, currentCol);
        
        totalScore += applyPremiumBonus(fireScore);
        totalBurned++;
      }
      
      currentRow += dr;
      currentCol += dc;
    }
  }
  
  score += totalScore;
  fireModeActive = false;
  
  showFireBlastAnimation();
  showMessage(`Fire Blast! Burned ${totalBurned} pieces (+${totalScore} points)`);
}
```

## Enemy AI Strategy

### Piece Introduction Schedule
```javascript
chooseNewPieceType(turnCount) {
  const appeared = pieceFirstAppearance;
  
  if (!appeared['tot']) return 'tot';                    // Turn 1
  if (turnCount >= 5 && !appeared['si']) return 'si';    // Turn 5
  if (turnCount >= 15 && !appeared['tuong']) return 'tuong';  // Turn 15
  if (turnCount >= 20 && !appeared['ma']) return 'ma';   // Turn 20
  
  // Tướng địch every 15 turns from turn 22 (if 2 Sĩ exist)
  if (turnCount >= 22) {
    const siCount = enemyPieces.filter(p => p.type === 'si').length;
    const turnsSince22 = turnCount - 22;
    const shouldSpawn = turnsSince22 % 15 === 0;
    
    if (shouldSpawn && siCount >= 2 && lastTuongSpawnTurn !== turnCount) {
      lastTuongSpawnTurn = turnCount;
      return 'tuong-dich';
    }
  }
  
  if (turnCount >= 30 && !appeared['phao']) return 'phao';  // Turn 30
  if (turnCount >= 35 && !appeared['xe-dich']) return 'xe-dich';  // Turn 35
  
  return null;
}
```

### Strategic Movement
```javascript
async moveSmartPiece() {
  // 1. Find threatened pieces (not newly added)
  const movablePieces = enemyPieces.filter(p => p !== newlyAddedPieceThisTurn);
  const threatenedPieces = findThreatenedPieces().filter(p => movablePieces.includes(p));
  
  if (threatenedPieces.length === 0) {
    // No threats - move random piece
    await moveRandomPiece(movablePieces);
    return;
  }
  
  // 2. Prioritize unprotected threatened pieces
  const unprotectedPieces = filterUnprotectedPieces(threatenedPieces);
  
  let pieceToMove;
  if (unprotectedPieces.length > 0) {
    pieceToMove = unprotectedPieces[Math.floor(Math.random() * unprotectedPieces.length)];
  } else {
    pieceToMove = threatenedPieces[Math.floor(Math.random() * threatenedPieces.length)];
  }
  
  // 3. Move selected piece
  const bestMove = findBestMove(pieceToMove);
  if (bestMove) {
    await executePieceMove(pieceToMove, bestMove);
  }
}
```

### Position Evaluation
```javascript
calculateSafetyScore(row, col) {
  let score = 100;
  
  // Penalty for danger zones
  const inDanger = dangerPositions.some(pos => pos.row === row && pos.col === col);
  if (inDanger) score -= 50;
  
  // Bonus for distance from player Xe
  const distance = Math.abs(row - playerXe.row) + Math.abs(col - playerXe.col);
  score += distance * 5;
  
  // Bonus for edge positions
  if (row === 0 || row === 8 || col === 0 || col === 7) {
    score += 15;
  }
  
  // Bonus for center positions
  const centerScore = 10 - Math.abs(4 - row) - Math.abs(3.5 - col);
  score += centerScore * 3;
  
  return score;
}
```

## Error Handling

### API Errors
```javascript
try {
  const response = await gameAPI.startGame();
  setGameSession(response.data.data.session);
} catch (error) {
  Alert.alert('Error', 'Failed to start game. Please try again.');
  console.error('Start game error:', error);
  // Allow offline play
  setGameSession({ _id: 'offline', createdAt: new Date().toISOString() });
}
```

### Invalid Moves
```javascript
handlePlayerMove(row, col) {
  const validMoves = getValidMoves(playerXe);
  const isValid = validMoves.some(m => m.row === row && m.col === col);
  
  if (!isValid) {
    showMessage('Invalid move!', 'warning');
    return;
  }
  
  // Execute move
  executeMove(row, col);
}
```

### Game State Errors
```javascript
startGame() {
  if (!playerXe) {
    Alert.alert('Error', 'Please place your Xe first!');
    return;
  }
  
  if (gameMode !== 'setup') {
    Alert.alert('Error', 'Game already started!');
    return;
  }
  
  // Start game
  initializeGame();
}
```

## Testing Strategy

### Unit Tests
- ChessGame class methods
- EnemyAI logic
- Movement validation
- Scoring calculations
- Fire mode mechanics

### Integration Tests
- Player turn flow
- Enemy turn flow
- Game state transitions
- API integration

### Component Tests
- ChessBoard rendering
- ChessPiece rendering
- User interactions
- Visual feedback

### E2E Tests
- Complete game flow
- Setup → Play → End
- Fire mode activation
- Score tracking

## Performance Considerations

### Optimization Strategies

1. **Memoization**: Use React.memo for ChessPiece components
2. **Batch Updates**: Group state updates to minimize re-renders
3. **Lazy Calculation**: Calculate valid moves only when needed
4. **Efficient Loops**: Use early returns in movement validation
5. **Animation Performance**: Use native driver for animations

### Memory Management

1. **Cleanup**: Remove event listeners on unmount
2. **State Reset**: Clear game state when leaving screen
3. **Image Optimization**: Use optimized piece symbols
4. **Array Management**: Efficiently manage piece arrays

## Security Considerations

1. **Input Validation**: Validate all user inputs (row, col)
2. **API Security**: Use JWT tokens for API calls
3. **Score Validation**: Validate scores on backend
4. **Session Management**: Secure game session IDs
5. **Premium Verification**: Verify premium status on backend

## Accessibility

1. **Touch Targets**: Minimum 44x44 pt touch areas
2. **Visual Feedback**: Clear highlights and animations
3. **Error Messages**: Clear, descriptive error messages
4. **Color Contrast**: Sufficient contrast for piece colors
5. **Screen Reader**: Accessible labels for game elements
