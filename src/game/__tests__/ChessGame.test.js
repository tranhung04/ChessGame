/**
 * ChessGame Test Suite
 * Comprehensive tests for game engine logic
 */

import { ChessGame } from '../ChessGame.js';
import { EnemyAI } from '../EnemyAI.js';
import { PIECE_TYPES, PIECE_VALUES, BOARD_CONFIG } from '../constants.js';

describe('ChessGame - Core Functionality', () => {
  let game;

  beforeEach(() => {
    game = new ChessGame();
  });

  describe('Board Initialization', () => {
    test('should initialize 9x8 empty board', () => {
      expect(game.board).toBeDefined();
      expect(game.board.length).toBe(BOARD_CONFIG.ROWS);
      expect(game.board[0].length).toBe(BOARD_CONFIG.COLS);
    });

    test('should start in setup mode', () => {
      expect(game.gameMode).toBe('setup');
    });

    test('should have no player Xe initially', () => {
      expect(game.playerXe).toBeNull();
    });

    test('should have empty enemy pieces array', () => {
      expect(game.enemyPieces).toEqual([]);
    });

    test('should have zero score initially', () => {
      expect(game.score).toBe(0);
    });
  });

  describe('Piece Placement', () => {
    test('should place player Xe on board', () => {
      const result = game.placePiece(4, 3, PIECE_TYPES.XE, false);
      
      expect(result).toBe(true);
      expect(game.playerXe).toBeDefined();
      expect(game.playerXe.row).toBe(4);
      expect(game.playerXe.col).toBe(3);
      expect(game.board[4][3]).toBe(game.playerXe);
    });

    test('should place enemy piece on board', () => {
      const result = game.placePiece(0, 0, PIECE_TYPES.TOT, true);
      
      expect(result).toBe(true);
      expect(game.enemyPieces.length).toBe(1);
      expect(game.board[0][0]).toBeDefined();
      expect(game.board[0][0].isEnemy).toBe(true);
    });

    test('should reject placement at invalid position', () => {
      const result = game.placePiece(-1, 0, PIECE_TYPES.XE, false);
      expect(result).toBe(false);
    });

    test('should reject placement out of bounds', () => {
      const result = game.placePiece(10, 10, PIECE_TYPES.XE, false);
      expect(result).toBe(false);
    });
  });

  describe('Piece Removal', () => {
    test('should remove piece from board', () => {
      game.placePiece(4, 3, PIECE_TYPES.XE, false);
      const removed = game.removePiece(4, 3);
      
      expect(removed).toBeDefined();
      expect(removed.type).toBe(PIECE_TYPES.XE);
      expect(game.board[4][3]).toBeNull();
    });

    test('should remove enemy piece from enemyPieces array', () => {
      game.placePiece(0, 0, PIECE_TYPES.TOT, true);
      expect(game.enemyPieces.length).toBe(1);
      
      game.removePiece(0, 0);
      expect(game.enemyPieces.length).toBe(0);
    });

    test('should return null for invalid position', () => {
      const removed = game.removePiece(-1, 0);
      expect(removed).toBeNull();
    });
  });

  describe('Position Validation', () => {
    test('should validate positions within bounds', () => {
      expect(game.isValidPosition(0, 0)).toBe(true);
      expect(game.isValidPosition(8, 7)).toBe(true);
      expect(game.isValidPosition(4, 3)).toBe(true);
    });

    test('should reject positions out of bounds', () => {
      expect(game.isValidPosition(-1, 0)).toBe(false);
      expect(game.isValidPosition(0, -1)).toBe(false);
      expect(game.isValidPosition(9, 0)).toBe(false);
      expect(game.isValidPosition(0, 8)).toBe(false);
    });
  });

  describe('Score Calculation', () => {
    test('should calculate base score for pieces', () => {
      expect(game.calculateScore(PIECE_TYPES.TOT)).toBe(1);
      expect(game.calculateScore(PIECE_TYPES.SI)).toBe(1);
      expect(game.calculateScore(PIECE_TYPES.TUONG)).toBe(2);
      expect(game.calculateScore(PIECE_TYPES.MA)).toBe(3);
      expect(game.calculateScore(PIECE_TYPES.PHAO)).toBe(3);
      expect(game.calculateScore(PIECE_TYPES.XE_DICH)).toBe(5);
      expect(game.calculateScore(PIECE_TYPES.TUONG_DICH)).toBe(10);
    });

    test('should apply premium bonus to score', () => {
      const gameWithPremium = new ChessGame(0.2); // 20% bonus
      
      expect(gameWithPremium.calculateScore(PIECE_TYPES.TOT)).toBe(1); // 1 * 1.2 = 1.2 -> 1
      expect(gameWithPremium.calculateScore(PIECE_TYPES.TUONG_DICH)).toBe(12); // 10 * 1.2 = 12
    });

    test('should not apply bonus when premium is 0', () => {
      expect(game.calculateScore(PIECE_TYPES.TUONG_DICH)).toBe(10);
    });
  });

  describe('Player Xe Movement', () => {
    beforeEach(() => {
      game.placePiece(4, 3, PIECE_TYPES.XE, false);
      game.gameMode = 'playing';
      game.currentTurn = 'player';
    });

    test('should calculate valid moves in all 4 directions', () => {
      const moves = game.getValidMoves(game.playerXe);
      
      // Should have moves in all 4 directions
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

    test('should stop at board edges', () => {
      game.placePiece(0, 0, PIECE_TYPES.XE, false);
      const moves = game.getValidMoves(game.playerXe);
      
      // From corner, should only have moves down and right
      const hasUpMove = moves.some(m => m.row < 0);
      const hasLeftMove = moves.some(m => m.col < 0);
      
      expect(hasUpMove).toBe(false);
      expect(hasLeftMove).toBe(false);
    });

    test('should stop at friendly pieces', () => {
      // Place another friendly piece in the way
      game.placePiece(4, 5, PIECE_TYPES.XE, false);
      const moves = game.getValidMoves(game.playerXe);
      
      // Should not be able to move to or past position (4, 5)
      const canMoveTo5 = moves.some(m => m.row === 4 && m.col === 5);
      const canMoveTo6 = moves.some(m => m.row === 4 && m.col === 6);
      
      expect(canMoveTo5).toBe(false);
      expect(canMoveTo6).toBe(false);
    });

    test('should allow capturing enemy pieces', () => {
      // Place enemy piece in path
      game.placePiece(4, 5, PIECE_TYPES.TOT, true);
      const moves = game.getValidMoves(game.playerXe);
      
      // Should be able to capture enemy at (4, 5)
      const canCapture = moves.some(m => m.row === 4 && m.col === 5);
      expect(canCapture).toBe(true);
      
      // Should not be able to move past captured piece
      const canMovePast = moves.some(m => m.row === 4 && m.col === 6);
      expect(canMovePast).toBe(false);
    });

    test('should execute valid player move', () => {
      const result = game.handlePlayerMove(4, 5);
      
      expect(result.success).toBe(true);
      expect(game.playerXe.row).toBe(4);
      expect(game.playerXe.col).toBe(5);
      expect(game.board[4][5]).toBe(game.playerXe);
      expect(game.board[4][3]).toBeNull();
    });

    test('should reject invalid player move', () => {
      const result = game.handlePlayerMove(5, 5); // Diagonal move
      
      expect(result.success).toBe(false);
    });

    test('should capture enemy piece and update score', () => {
      game.placePiece(4, 5, PIECE_TYPES.TOT, true);
      const initialEnemyCount = game.enemyPieces.length;
      
      const result = game.handlePlayerMove(4, 5);
      
      expect(result.success).toBe(true);
      expect(result.capturedScore).toBe(1);
      expect(game.score).toBe(1);
      expect(game.enemyPieces.length).toBe(initialEnemyCount - 1);
    });
  });

  describe('Enemy Piece Movement', () => {
    describe('Tốt (Pawn) Movement', () => {
      test('should move 1 step in 4 directions', () => {
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
    });

    describe('Sĩ (Advisor) Movement', () => {
      test('should move 1 step diagonally', () => {
        const si = { row: 4, col: 3, type: PIECE_TYPES.SI, isEnemy: true };
        game.board[4][3] = si;
        game.enemyPieces.push(si);
        
        const moves = game.validateSiMove(si);
        
        expect(moves.length).toBe(4);
        expect(moves).toContainEqual({ row: 3, col: 2 }); // Up-Left
        expect(moves).toContainEqual({ row: 3, col: 4 }); // Up-Right
        expect(moves).toContainEqual({ row: 5, col: 2 }); // Down-Left
        expect(moves).toContainEqual({ row: 5, col: 4 }); // Down-Right
      });
    });

    describe('Tượng (Elephant) Movement', () => {
      test('should move 2 steps diagonally', () => {
        const tuong = { row: 4, col: 3, type: PIECE_TYPES.TUONG, isEnemy: true };
        game.board[4][3] = tuong;
        game.enemyPieces.push(tuong);
        
        const moves = game.validateTuongMove(tuong);
        
        expect(moves.length).toBe(4);
        expect(moves).toContainEqual({ row: 2, col: 1 }); // Up-Left
        expect(moves).toContainEqual({ row: 2, col: 5 }); // Up-Right
        expect(moves).toContainEqual({ row: 6, col: 1 }); // Down-Left
        expect(moves).toContainEqual({ row: 6, col: 5 }); // Down-Right
      });

      test('should not jump over pieces', () => {
        const tuong = { row: 4, col: 3, type: PIECE_TYPES.TUONG, isEnemy: true };
        game.board[4][3] = tuong;
        game.enemyPieces.push(tuong);
        
        // Block diagonal path
        game.placePiece(3, 2, PIECE_TYPES.TOT, true);
        
        const moves = game.validateTuongMove(tuong);
        
        // Should not be able to move to (2, 1)
        const canMoveUpLeft = moves.some(m => m.row === 2 && m.col === 1);
        expect(canMoveUpLeft).toBe(false);
      });
    });

    describe('Mã (Horse) Movement', () => {
      test('should move in L-shape', () => {
        const ma = { row: 4, col: 3, type: PIECE_TYPES.MA, isEnemy: true };
        game.board[4][3] = ma;
        game.enemyPieces.push(ma);
        
        const moves = game.validateMaMove(ma);
        
        expect(moves.length).toBe(8);
        expect(moves).toContainEqual({ row: 2, col: 2 }); // Up-Left
        expect(moves).toContainEqual({ row: 2, col: 4 }); // Up-Right
      });

      test('should be blocked by leg piece', () => {
        const ma = { row: 4, col: 3, type: PIECE_TYPES.MA, isEnemy: true };
        game.board[4][3] = ma;
        game.enemyPieces.push(ma);
        
        // Block vertical leg
        game.placePiece(3, 3, PIECE_TYPES.TOT, true);
        
        const moves = game.validateMaMove(ma);
        
        // Should not be able to move up
        const canMoveUp = moves.some(m => m.row === 2);
        expect(canMoveUp).toBe(false);
      });
    });

    describe('Pháo (Cannon) Movement', () => {
      test('should move straight without jumping', () => {
        const phao = { row: 4, col: 3, type: PIECE_TYPES.PHAO, isEnemy: true };
        game.board[4][3] = phao;
        game.enemyPieces.push(phao);
        
        const moves = game.validatePhaoMove(phao);
        
        // Should have many straight moves
        expect(moves.length).toBeGreaterThan(0);
      });

      test('should capture by jumping over one piece', () => {
        const phao = { row: 4, col: 3, type: PIECE_TYPES.PHAO, isEnemy: true };
        game.board[4][3] = phao;
        game.enemyPieces.push(phao);
        
        // Place jump piece and target
        game.placePiece(4, 4, PIECE_TYPES.TOT, true); // Jump over this
        game.placePiece(4, 5, PIECE_TYPES.XE, false); // Capture this
        
        const moves = game.validatePhaoMove(phao);
        
        // Should be able to capture at (4, 5)
        const canCapture = moves.some(m => m.row === 4 && m.col === 5);
        expect(canCapture).toBe(true);
      });
    });
  });

  describe('Fire Mode', () => {
    beforeEach(() => {
      game.placePiece(4, 3, PIECE_TYPES.XE, false);
      game.gameMode = 'playing';
    });

    test('should activate fire mode when capturing Tướng địch', () => {
      game.placePiece(4, 5, PIECE_TYPES.TUONG_DICH, true);
      
      expect(game.fireModeActive).toBe(false);
      game.capturePiece(4, 5);
      expect(game.fireModeActive).toBe(true);
    });

    test('should burn enemy pieces in 4 directions', () => {
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
      game.fireModeActive = true;
      game.placePiece(4, 4, PIECE_TYPES.TOT, true);
      
      const result = game.executeFireBlast();
      
      // Tốt base score is 1, fire blast doubles it to 2
      expect(result.totalScore).toBe(2);
      expect(game.score).toBe(2);
    });

    test('should apply premium bonus to fire blast score', () => {
      const gameWithPremium = new ChessGame(0.5); // 50% bonus
      gameWithPremium.placePiece(4, 3, PIECE_TYPES.XE, false);
      gameWithPremium.fireModeActive = true;
      gameWithPremium.placePiece(4, 4, PIECE_TYPES.TUONG_DICH, true);
      
      const result = gameWithPremium.executeFireBlast();
      
      // Tướng địch base: 10, fire blast: 20, with 50% bonus: 30
      expect(result.totalScore).toBe(30);
    });
  });

  describe('Game State Management', () => {
    test('should get current game state', () => {
      const state = game.getState();
      
      expect(state).toHaveProperty('board');
      expect(state).toHaveProperty('playerXe');
      expect(state).toHaveProperty('enemyPieces');
      expect(state).toHaveProperty('gameMode');
      expect(state).toHaveProperty('score');
    });

    test('should set game state', () => {
      const newState = {
        gameMode: 'playing',
        score: 100,
        turnCount: 10
      };
      
      const result = game.setState(newState);
      
      expect(result.success).toBe(true);
      expect(game.gameMode).toBe('playing');
      expect(game.score).toBe(100);
      expect(game.turnCount).toBe(10);
    });

    test('should validate game state', () => {
      game.placePiece(4, 3, PIECE_TYPES.XE, false);
      game.gameMode = 'playing';
      
      const validation = game.validateGameState();
      
      expect(validation.isValid).toBe(true);
      expect(validation.errors.length).toBe(0);
    });

    test('should detect invalid game state', () => {
      game.gameMode = 'invalid-mode';
      
      const validation = game.validateGameState();
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Game Flow', () => {
    test('should transition from setup to playing', () => {
      game.placePiece(4, 3, PIECE_TYPES.XE, false);
      
      const result = game.transitionToPlaying();
      
      expect(result.success).toBe(true);
      expect(game.gameMode).toBe('playing');
      expect(game.currentTurn).toBe('player');
    });

    test('should not transition without player Xe', () => {
      const result = game.transitionToPlaying();
      
      expect(result.success).toBe(false);
    });

    test('should switch turns', () => {
      game.currentTurn = 'player';
      game.switchTurn();
      expect(game.currentTurn).toBe('enemy');
      
      game.switchTurn();
      expect(game.currentTurn).toBe('player');
    });

    test('should check game over when Xe captured', () => {
      game.placePiece(4, 3, PIECE_TYPES.XE, false);
      game.gameMode = 'playing';
      
      // Remove player Xe
      game.removePiece(4, 3);
      
      const result = game.checkGameOver();
      
      expect(result.isGameOver).toBe(true);
      expect(result.result).toBe('defeat');
    });

    test('should check game over at turn limit', () => {
      game.placePiece(4, 3, PIECE_TYPES.XE, false);
      game.gameMode = 'playing';
      game.turnCount = 200;
      
      const result = game.checkGameOver();
      
      expect(result.isGameOver).toBe(true);
      expect(result.result).toBe('draw');
    });
  });

  describe('Reset Game', () => {
    test('should reset all game state', () => {
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
  });
});

describe('EnemyAI - Decision Making', () => {
  let game;
  let ai;

  beforeEach(() => {
    game = new ChessGame();
    game.placePiece(4, 3, PIECE_TYPES.XE, false);
    game.gameMode = 'playing';
    ai = new EnemyAI(game);
  });

  test('should categorize moves correctly', () => {
    // Place enemy piece that can attack player Xe
    game.placePiece(4, 5, PIECE_TYPES.TOT, true);
    
    const categorized = ai.categorizeMoves();
    
    expect(categorized).toHaveProperty('attacking');
    expect(categorized).toHaveProperty('safe');
    expect(categorized).toHaveProperty('trap');
  });

  test('should prioritize attacking moves', () => {
    // Place enemy piece that can attack player Xe
    game.placePiece(4, 4, PIECE_TYPES.TOT, true);
    
    const selectedMove = ai.selectBestMove();
    
    expect(selectedMove).toBeDefined();
    expect(selectedMove.move.row).toBe(4);
    expect(selectedMove.move.col).toBe(3);
  });

  test('should select safe moves when no attacks available', () => {
    // Place enemy piece far from player Xe
    game.placePiece(0, 0, PIECE_TYPES.TOT, true);
    
    const selectedMove = ai.selectBestMove();
    
    expect(selectedMove).toBeDefined();
  });

  test('should execute AI turn', async () => {
    game.placePiece(4, 5, PIECE_TYPES.TOT, true);
    
    const result = await ai.executeTurn();
    
    expect(result).toBeDefined();
  });
});

console.log('✓ All game engine tests defined');
