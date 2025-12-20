/**
 * Manual Test Script for ChessGame Engine
 * Run with: node src/game/__tests__/manual-test.js
 */

import { ChessGame } from '../ChessGame.js';
import { EnemyAI } from '../EnemyAI.js';
import { PIECE_TYPES, PIECE_VALUES, BOARD_CONFIG } from '../constants.js';

// Test counter
let testsPassed = 0;
let testsFailed = 0;

// Helper function to run tests
function test(description, testFn) {
  try {
    testFn();
    console.log(`✓ ${description}`);
    testsPassed++;
  } catch (error) {
    console.error(`✗ ${description}`);
    console.error(`  Error: ${error.message}`);
    testsFailed++;
  }
}

function expect(actual) {
  return {
    toBe(expected) {
      if (actual !== expected) {
        throw new Error(`Expected ${expected} but got ${actual}`);
      }
    },
    toEqual(expected) {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`);
      }
    },
    toBeDefined() {
      if (actual === undefined) {
        throw new Error('Expected value to be defined');
      }
    },
    toBeNull() {
      if (actual !== null) {
        throw new Error(`Expected null but got ${actual}`);
      }
    },
    toBeGreaterThan(expected) {
      if (actual <= expected) {
        throw new Error(`Expected ${actual} to be greater than ${expected}`);
      }
    },
    toContainEqual(expected) {
      const found = actual.some(item => 
        JSON.stringify(item) === JSON.stringify(expected)
      );
      if (!found) {
        throw new Error(`Expected array to contain ${JSON.stringify(expected)}`);
      }
    }
  };
}

console.log('\n=== ChessGame Engine Manual Tests ===\n');

// Test 1: Board Initialization
console.log('--- Board Initialization ---');
test('should initialize 9x8 empty board', () => {
  const game = new ChessGame();
  expect(game.board).toBeDefined();
  expect(game.board.length).toBe(BOARD_CONFIG.ROWS);
  expect(game.board[0].length).toBe(BOARD_CONFIG.COLS);
});

test('should start in setup mode', () => {
  const game = new ChessGame();
  expect(game.gameMode).toBe('setup');
});

test('should have no player Xe initially', () => {
  const game = new ChessGame();
  expect(game.playerXe).toBeNull();
});

test('should have zero score initially', () => {
  const game = new ChessGame();
  expect(game.score).toBe(0);
});

// Test 2: Piece Placement
console.log('\n--- Piece Placement ---');
test('should place player Xe on board', () => {
  const game = new ChessGame();
  const result = game.placePiece(4, 3, PIECE_TYPES.XE, false);
  
  expect(result).toBe(true);
  expect(game.playerXe).toBeDefined();
  expect(game.playerXe.row).toBe(4);
  expect(game.playerXe.col).toBe(3);
});

test('should place enemy piece on board', () => {
  const game = new ChessGame();
  const result = game.placePiece(0, 0, PIECE_TYPES.TOT, true);
  
  expect(result).toBe(true);
  expect(game.enemyPieces.length).toBe(1);
});

test('should reject placement at invalid position', () => {
  const game = new ChessGame();
  const result = game.placePiece(-1, 0, PIECE_TYPES.XE, false);
  expect(result).toBe(false);
});

// Test 3: Position Validation
console.log('\n--- Position Validation ---');
test('should validate positions within bounds', () => {
  const game = new ChessGame();
  expect(game.isValidPosition(0, 0)).toBe(true);
  expect(game.isValidPosition(8, 7)).toBe(true);
  expect(game.isValidPosition(4, 3)).toBe(true);
});

test('should reject positions out of bounds', () => {
  const game = new ChessGame();
  expect(game.isValidPosition(-1, 0)).toBe(false);
  expect(game.isValidPosition(9, 0)).toBe(false);
  expect(game.isValidPosition(0, 8)).toBe(false);
});

// Test 4: Score Calculation
console.log('\n--- Score Calculation ---');
test('should calculate base score for pieces', () => {
  const game = new ChessGame();
  expect(game.calculateScore(PIECE_TYPES.TOT)).toBe(1);
  expect(game.calculateScore(PIECE_TYPES.TUONG)).toBe(2);
  expect(game.calculateScore(PIECE_TYPES.MA)).toBe(3);
  expect(game.calculateScore(PIECE_TYPES.TUONG_DICH)).toBe(10);
});

test('should apply premium bonus to score', () => {
  const game = new ChessGame(0.2); // 20% bonus
  expect(game.calculateScore(PIECE_TYPES.TUONG_DICH)).toBe(12); // 10 * 1.2 = 12
});

// Test 5: Player Xe Movement
console.log('\n--- Player Xe Movement ---');
test('should calculate valid moves in all 4 directions', () => {
  const game = new ChessGame();
  game.placePiece(4, 3, PIECE_TYPES.XE, false);
  
  const moves = game.getValidMoves(game.playerXe);
  expect(moves.length).toBeGreaterThan(0);
  
  // Check moves exist in each direction
  const hasUpMove = moves.some(m => m.row < 4 && m.col === 3);
  const hasDownMove = moves.some(m => m.row > 4 && m.col === 3);
  const hasLeftMove = moves.some(m => m.row === 4 && m.col < 3);
  const hasRightMove = moves.some(m => m.row === 4 && m.col > 3);
  
  expect(hasUpMove).toBe(true);
  expect(hasDownMove).toBe(true);
  expect(hasLeftMove).toBe(true);
  expect(hasRightMove).toBe(true);
});

test('should execute valid player move', () => {
  const game = new ChessGame();
  game.placePiece(4, 3, PIECE_TYPES.XE, false);
  game.gameMode = 'playing';
  game.currentTurn = 'player';
  
  const result = game.handlePlayerMove(4, 5);
  
  expect(result.success).toBe(true);
  expect(game.playerXe.row).toBe(4);
  expect(game.playerXe.col).toBe(5);
});

test('should capture enemy piece and update score', () => {
  const game = new ChessGame();
  game.placePiece(4, 3, PIECE_TYPES.XE, false);
  game.placePiece(4, 5, PIECE_TYPES.TOT, true);
  game.gameMode = 'playing';
  game.currentTurn = 'player';
  
  const result = game.handlePlayerMove(4, 5);
  
  expect(result.success).toBe(true);
  expect(result.capturedScore).toBe(1);
  expect(game.score).toBe(1);
});

// Test 6: Enemy Piece Movement
console.log('\n--- Enemy Piece Movement ---');
test('Tốt should move 1 step in 4 directions', () => {
  const game = new ChessGame();
  const tot = { row: 4, col: 3, type: PIECE_TYPES.TOT, isEnemy: true };
  game.board[4][3] = tot;
  game.enemyPieces.push(tot);
  
  const moves = game.validateTotMove(tot);
  
  expect(moves.length).toBe(4);
  expect(moves).toContainEqual({ row: 3, col: 3 }); // Up
  expect(moves).toContainEqual({ row: 5, col: 3 }); // Down
  expect(moves).toContainEqual({ row: 4, col: 2 }); // Left
  expect(moves).toContainEqual({ row: 4, col: 4 }); // Right
});

test('Sĩ should move 1 step diagonally', () => {
  const game = new ChessGame();
  const si = { row: 4, col: 3, type: PIECE_TYPES.SI, isEnemy: true };
  game.board[4][3] = si;
  game.enemyPieces.push(si);
  
  const moves = game.validateSiMove(si);
  
  expect(moves.length).toBe(4);
  expect(moves).toContainEqual({ row: 3, col: 2 }); // Up-Left
  expect(moves).toContainEqual({ row: 3, col: 4 }); // Up-Right
});

test('Tượng should move 2 steps diagonally', () => {
  const game = new ChessGame();
  const tuong = { row: 4, col: 3, type: PIECE_TYPES.TUONG, isEnemy: true };
  game.board[4][3] = tuong;
  game.enemyPieces.push(tuong);
  
  const moves = game.validateTuongMove(tuong);
  
  expect(moves.length).toBe(4);
  expect(moves).toContainEqual({ row: 2, col: 1 }); // Up-Left
  expect(moves).toContainEqual({ row: 6, col: 5 }); // Down-Right
});

test('Mã should move in L-shape', () => {
  const game = new ChessGame();
  const ma = { row: 4, col: 3, type: PIECE_TYPES.MA, isEnemy: true };
  game.board[4][3] = ma;
  game.enemyPieces.push(ma);
  
  const moves = game.validateMaMove(ma);
  
  expect(moves.length).toBe(8);
});

// Test 7: Fire Mode
console.log('\n--- Fire Mode ---');
test('should activate fire mode when capturing Tướng địch', () => {
  const game = new ChessGame();
  game.placePiece(4, 3, PIECE_TYPES.XE, false);
  game.placePiece(4, 5, PIECE_TYPES.TUONG_DICH, true);
  game.gameMode = 'playing';
  
  expect(game.fireModeActive).toBe(false);
  game.capturePiece(4, 5);
  expect(game.fireModeActive).toBe(true);
});

test('should burn enemy pieces in 4 directions', () => {
  const game = new ChessGame();
  game.placePiece(4, 3, PIECE_TYPES.XE, false);
  game.fireModeActive = true;
  
  // Place enemy pieces in all 4 directions
  game.placePiece(3, 3, PIECE_TYPES.TOT, true); // Up
  game.placePiece(5, 3, PIECE_TYPES.TOT, true); // Down
  game.placePiece(4, 2, PIECE_TYPES.TOT, true); // Left
  game.placePiece(4, 4, PIECE_TYPES.TOT, true); // Right
  
  const result = game.executeFireBlast();
  
  expect(result.success).toBe(true);
  expect(result.burnedPieces.length).toBe(4);
  expect(game.fireModeActive).toBe(false);
});

test('should award double score for burned pieces', () => {
  const game = new ChessGame();
  game.placePiece(4, 3, PIECE_TYPES.XE, false);
  game.fireModeActive = true;
  game.placePiece(4, 4, PIECE_TYPES.TOT, true);
  
  const result = game.executeFireBlast();
  
  // Tốt base score is 1, fire blast doubles it to 2
  expect(result.totalScore).toBe(2);
  expect(game.score).toBe(2);
});

// Test 8: Game State Management
console.log('\n--- Game State Management ---');
test('should get current game state', () => {
  const game = new ChessGame();
  const state = game.getState();
  
  expect(state).toBeDefined();
  expect(state.board).toBeDefined();
  expect(state.gameMode).toBeDefined();
});

test('should validate game state', () => {
  const game = new ChessGame();
  game.placePiece(4, 3, PIECE_TYPES.XE, false);
  game.gameMode = 'playing';
  
  const validation = game.validateGameState();
  
  expect(validation.isValid).toBe(true);
});

// Test 9: Game Flow
console.log('\n--- Game Flow ---');
test('should transition from setup to playing', () => {
  const game = new ChessGame();
  game.placePiece(4, 3, PIECE_TYPES.XE, false);
  
  const result = game.transitionToPlaying();
  
  expect(result.success).toBe(true);
  expect(game.gameMode).toBe('playing');
});

test('should switch turns', () => {
  const game = new ChessGame();
  game.currentTurn = 'player';
  game.switchTurn();
  expect(game.currentTurn).toBe('enemy');
  
  game.switchTurn();
  expect(game.currentTurn).toBe('player');
});

test('should check game over when Xe captured', () => {
  const game = new ChessGame();
  game.placePiece(4, 3, PIECE_TYPES.XE, false);
  game.gameMode = 'playing';
  
  // Remove player Xe
  game.removePiece(4, 3);
  
  const result = game.checkGameOver();
  
  expect(result.isGameOver).toBe(true);
  expect(result.result).toBe('defeat');
});

// Test 10: EnemyAI
console.log('\n--- Enemy AI ---');
test('should categorize moves correctly', () => {
  const game = new ChessGame();
  game.placePiece(4, 3, PIECE_TYPES.XE, false);
  game.placePiece(4, 5, PIECE_TYPES.TOT, true);
  game.gameMode = 'playing';
  
  const ai = new EnemyAI(game);
  const categorized = ai.categorizeMoves();
  
  expect(categorized).toBeDefined();
  expect(categorized.attacking).toBeDefined();
  expect(categorized.safe).toBeDefined();
  expect(categorized.trap).toBeDefined();
});

test('should prioritize attacking moves', () => {
  const game = new ChessGame();
  game.placePiece(4, 3, PIECE_TYPES.XE, false);
  game.placePiece(4, 4, PIECE_TYPES.TOT, true);
  game.gameMode = 'playing';
  
  const ai = new EnemyAI(game);
  const selectedMove = ai.selectBestMove();
  
  expect(selectedMove).toBeDefined();
  expect(selectedMove.move.row).toBe(4);
  expect(selectedMove.move.col).toBe(3);
});

// Test 11: Reset Game
console.log('\n--- Reset Game ---');
test('should reset all game state', () => {
  const game = new ChessGame();
  game.placePiece(4, 3, PIECE_TYPES.XE, false);
  game.placePiece(0, 0, PIECE_TYPES.TOT, true);
  game.score = 100;
  game.turnCount = 50;
  game.gameMode = 'playing';
  
  game.resetGame();
  
  expect(game.playerXe).toBeNull();
  expect(game.enemyPieces.length).toBe(0);
  expect(game.score).toBe(0);
  expect(game.turnCount).toBe(0);
  expect(game.gameMode).toBe('setup');
});

// Print summary
console.log('\n=== Test Summary ===');
console.log(`Total Tests: ${testsPassed + testsFailed}`);
console.log(`Passed: ${testsPassed}`);
console.log(`Failed: ${testsFailed}`);

if (testsFailed === 0) {
  console.log('\n✓ All tests passed!');
  process.exit(0);
} else {
  console.log(`\n✗ ${testsFailed} test(s) failed`);
  process.exit(1);
}
