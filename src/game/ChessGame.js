/**
 * ChessGame - Core game engine class
 * Manages board state, piece movements, scoring, and game flow
 */

import { PIECE_TYPES, PIECE_VALUES, BOARD_CONFIG } from './constants.js';

export class ChessGame {
  constructor(premiumBonus = 0) {
    this.board = [];
    this.playerXe = null;
    this.enemyPieces = [];
    this.gameMode = 'setup'; // 'setup' | 'playing' | 'ended'
    this.currentTurn = 'player'; // 'player' | 'enemy'
    this.turnCount = 0;
    this.score = 0;
    this.fireModeActive = false;
    this.gameSession = null;
    this.selectedCell = null;
    this.premiumBonus = premiumBonus; // Premium bonus percentage (e.g., 0.2 for 20%)
    
    // Cache for expensive calculations
    // Requirements: 1.1, 1.2
    this._validMovesCache = new Map();
    this._categorizedMovesCache = null;
    this._lastCacheInvalidation = Date.now();
    
    this.initBoard();
  }

  /**
   * Initialize empty 9x8 board
   * Requirements: 1.1
   */
  initBoard() {
    this.board = Array(BOARD_CONFIG.ROWS)
      .fill(null)
      .map(() => Array(BOARD_CONFIG.COLS).fill(null));
  }

  /**
   * Invalidate cached calculations when board state changes
   * Requirements: 1.1, 1.2
   */
  _invalidateCache() {
    this._validMovesCache.clear();
    this._categorizedMovesCache = null;
    this._lastCacheInvalidation = Date.now();
  }

  /**
   * Reset game to initial state
   */
  resetGame() {
    this.initBoard();
    this.playerXe = null;
    this.enemyPieces = [];
    this.gameMode = 'setup';
    this.currentTurn = 'player';
    this.turnCount = 0;
    this.score = 0;
    this.fireModeActive = false;
    this.gameSession = null;
    this.selectedCell = null;
    this._invalidateCache();
  }

  /**
   * Place a piece on the board
   * Requirements: 1.2
   */
  placePiece(row, col, type, isEnemy = false) {
    if (!this.isValidPosition(row, col)) {
      return false;
    }

    const piece = {
      row,
      col,
      type,
      isEnemy
    };

    this.board[row][col] = piece;

    if (!isEnemy && type === PIECE_TYPES.XE) {
      this.playerXe = piece;
    } else if (isEnemy) {
      this.enemyPieces.push(piece);
    }

    // Invalidate cache when board changes
    this._invalidateCache();

    return true;
  }

  /**
   * Remove a piece from the board
   * Requirements: 1.3
   */
  removePiece(row, col) {
    if (!this.isValidPosition(row, col)) {
      return null;
    }

    const piece = this.board[row][col];
    this.board[row][col] = null;

    if (piece && piece.isEnemy) {
      const index = this.enemyPieces.findIndex(
        p => p.row === row && p.col === col
      );
      if (index !== -1) {
        this.enemyPieces.splice(index, 1);
      }
    }

    // Invalidate cache when board changes
    this._invalidateCache();

    return piece;
  }

  /**
   * Get Chinese chess symbol for piece type
   * Requirements: 1.4
   */
  getPieceSymbol(type) {
    const symbols = {
      [PIECE_TYPES.XE]: '車',
      [PIECE_TYPES.TOT]: '卒',
      [PIECE_TYPES.SI]: '士',
      [PIECE_TYPES.TUONG]: '象',
      [PIECE_TYPES.MA]: '馬',
      [PIECE_TYPES.PHAO]: '砲',
      [PIECE_TYPES.XE_DICH]: '車',
      [PIECE_TYPES.TUONG_DICH]: '將'
    };
    return symbols[type] || '?';
  }

  /**
   * Check if position is within board bounds
   * Requirements: 3.7
   */
  isValidPosition(row, col) {
    return (
      row >= 0 &&
      row < BOARD_CONFIG.ROWS &&
      col >= 0 &&
      col < BOARD_CONFIG.COLS
    );
  }

  /**
   * Calculate score for capturing a piece
   * Requirements: 9.1-9.7
   */
  calculateScore(pieceType) {
    const baseScore = PIECE_VALUES[pieceType] || 0;
    return this.applyPremiumBonus(baseScore);
  }

  /**
   * Apply premium bonus to score
   * Requirements: 9.8, 12.5
   */
  applyPremiumBonus(baseScore) {
    if (this.premiumBonus > 0) {
      return Math.floor(baseScore * (1 + this.premiumBonus));
    }
    return baseScore;
  }

  /**
   * Handle setup phase tap to place/move player Xe
   * Requirements: 2.1, 2.2, 2.3
   */
  handleSetupTap(row, col) {
    // Validate game mode
    if (this.gameMode !== 'setup') {
      return { success: false, message: 'Cannot place Xe - not in setup phase' };
    }

    // Validate position
    if (!this.isValidPosition(row, col)) {
      return { success: false, message: 'Invalid position - out of bounds' };
    }

    // Check if position is occupied by enemy piece
    const existingPiece = this.board[row][col];
    if (existingPiece && existingPiece.isEnemy) {
      return { success: false, message: 'Cannot place Xe on enemy piece' };
    }

    // If player Xe already exists, remove it from old position
    if (this.playerXe) {
      this.board[this.playerXe.row][this.playerXe.col] = null;
    }

    // Place player Xe at new position
    const placed = this.placePiece(row, col, PIECE_TYPES.XE, false);
    
    if (!placed) {
      return { success: false, message: 'Failed to place Xe' };
    }

    return { 
      success: true, 
      message: 'Player Xe placed successfully',
      playerXe: this.playerXe
    };
  }

  /**
   * Spawn initial enemy pieces on the board
   * Places enemies in strategic positions
   * Requirements: 2.1, 2.2, 2.3
   */
  spawnInitialEnemies() {
    // Clear existing enemies
    this.enemyPieces = [];
    
    // Spawn enemies in top rows (rows 0-2)
    // Row 0: Tướng địch in center, flanked by Sĩ
    this.placePiece(0, 4, PIECE_TYPES.TUONG_DICH, true);
    this.placePiece(0, 3, PIECE_TYPES.SI, true);
    this.placePiece(0, 5, PIECE_TYPES.SI, true);
    
    // Row 1: Tượng on sides, Xe địch in strategic positions
    this.placePiece(1, 2, PIECE_TYPES.TUONG, true);
    this.placePiece(1, 6, PIECE_TYPES.TUONG, true);
    this.placePiece(1, 0, PIECE_TYPES.XE_DICH, true);
    this.placePiece(1, 8, PIECE_TYPES.XE_DICH, true);
    
    // Row 2: Mã and Pháo
    this.placePiece(2, 1, PIECE_TYPES.MA, true);
    this.placePiece(2, 7, PIECE_TYPES.MA, true);
    this.placePiece(2, 3, PIECE_TYPES.PHAO, true);
    this.placePiece(2, 5, PIECE_TYPES.PHAO, true);
    
    // Row 3: Tốt line
    for (let col = 0; col < BOARD_CONFIG.COLS; col += 2) {
      this.placePiece(3, col, PIECE_TYPES.TOT, true);
    }
    
    return {
      success: true,
      message: 'Initial enemies spawned',
      enemyCount: this.enemyPieces.length
    };
  }

  /**
   * Start game - validate Xe placement and transition to playing mode
   * Requirements: 2.4, 2.5, 12.1, 12.2
   */
  async startGame(gameAPI) {
    // Validate that player Xe is placed
    if (!this.playerXe) {
      return { 
        success: false, 
        message: 'Please place your Xe first!' 
      };
    }

    // Validate player Xe is on the board
    if (!this.isValidPosition(this.playerXe.row, this.playerXe.col) ||
        this.board[this.playerXe.row][this.playerXe.col] !== this.playerXe) {
      return { 
        success: false, 
        message: 'Player Xe is not properly placed on the board' 
      };
    }

    // Validate game mode
    if (this.gameMode !== 'setup') {
      return { 
        success: false, 
        message: 'Game already started!' 
      };
    }

    // Validate gameAPI is provided
    if (!gameAPI || typeof gameAPI.startGame !== 'function') {
      console.warn('Game API not available, starting in offline mode');
      
      // Spawn initial enemies
      this.spawnInitialEnemies();
      
      // Create offline session
      const offlineSession = {
        _id: 'offline-' + Date.now(),
        createdAt: new Date().toISOString()
      };
      this.setGameSession(offlineSession);

      // Transition to playing mode
      this.transitionToPlaying();

      return { 
        success: true, 
        message: 'Game started in offline mode (API not available)',
        session: offlineSession,
        offline: true
      };
    }

    try {
      // Create game session via API call
      const response = await gameAPI.startGame();
      
      // Validate API response
      if (!response || !response.data || !response.data.data || !response.data.data.session) {
        throw new Error('Invalid API response format');
      }
      
      const session = response.data.data.session;
      
      // Validate session has required fields
      if (!session._id) {
        throw new Error('Session missing required ID');
      }
      
      this.setGameSession(session);

      // Spawn initial enemies
      this.spawnInitialEnemies();

      // Transition to playing mode
      this.transitionToPlaying();

      return { 
        success: true, 
        message: 'Game started successfully!',
        session: session
      };
    } catch (error) {
      // Handle API errors - allow offline play
      console.error('Start game API error:', error);
      
      // Determine error type for better messaging
      let errorMessage = 'Game started in offline mode';
      
      if (error.message === 'Network request failed' || error.code === 'ECONNABORTED') {
        errorMessage = 'Network unavailable - playing offline';
      } else if (error.response && error.response.status >= 500) {
        errorMessage = 'Server error - playing offline';
      } else if (error.response && error.response.status === 401) {
        errorMessage = 'Authentication error - playing offline';
      }
      
      // Spawn initial enemies
      this.spawnInitialEnemies();
      
      // Create offline session
      const offlineSession = {
        _id: 'offline-' + Date.now(),
        createdAt: new Date().toISOString()
      };
      this.setGameSession(offlineSession);

      // Transition to playing mode anyway
      this.transitionToPlaying();

      return { 
        success: true, 
        message: errorMessage,
        session: offlineSession,
        offline: true,
        error: error.message
      };
    }
  }

  /**
   * Get current game state
   * Requirements: 10.1, 10.2, 10.3, 10.5, 10.6
   */
  getState() {
    return {
      board: this.board,
      playerXe: this.playerXe,
      enemyPieces: this.enemyPieces,
      gameMode: this.gameMode,
      currentTurn: this.currentTurn,
      turnCount: this.turnCount,
      score: this.score,
      fireModeActive: this.fireModeActive,
      gameSession: this.gameSession,
      selectedCell: this.selectedCell,
      premiumBonus: this.premiumBonus
    };
  }

  /**
   * Update game state from external state object
   * Requirements: 10.5, 10.6
   */
  setState(state) {
    try {
      // Validate state object
      if (!state || typeof state !== 'object') {
        return {
          success: false,
          message: 'Invalid state object'
        };
      }

      // Validate and update board
      if (state.board !== undefined) {
        if (!Array.isArray(state.board) || state.board.length !== BOARD_CONFIG.ROWS) {
          return {
            success: false,
            message: 'Invalid board structure'
          };
        }
        this.board = state.board;
      }

      // Validate and update game mode
      if (state.gameMode !== undefined) {
        if (!['setup', 'playing', 'ended'].includes(state.gameMode)) {
          return {
            success: false,
            message: `Invalid game mode: ${state.gameMode}`
          };
        }
        this.gameMode = state.gameMode;
      }

      // Validate and update current turn
      if (state.currentTurn !== undefined) {
        if (!['player', 'enemy'].includes(state.currentTurn)) {
          return {
            success: false,
            message: `Invalid turn: ${state.currentTurn}`
          };
        }
        this.currentTurn = state.currentTurn;
      }

      // Validate and update turn count
      if (state.turnCount !== undefined) {
        if (typeof state.turnCount !== 'number' || state.turnCount < 0) {
          return {
            success: false,
            message: 'Invalid turn count'
          };
        }
        this.turnCount = state.turnCount;
      }

      // Validate and update score
      if (state.score !== undefined) {
        if (typeof state.score !== 'number' || state.score < 0) {
          return {
            success: false,
            message: 'Invalid score'
          };
        }
        this.score = state.score;
      }

      // Update other properties
      if (state.playerXe !== undefined) this.playerXe = state.playerXe;
      if (state.enemyPieces !== undefined) this.enemyPieces = state.enemyPieces;
      if (state.fireModeActive !== undefined) this.fireModeActive = state.fireModeActive;
      if (state.gameSession !== undefined) this.gameSession = state.gameSession;
      if (state.selectedCell !== undefined) this.selectedCell = state.selectedCell;
      if (state.premiumBonus !== undefined) this.premiumBonus = state.premiumBonus;

      return {
        success: true,
        message: 'State updated successfully'
      };
    } catch (error) {
      console.error('Error setting state:', error);
      return {
        success: false,
        message: 'Failed to update state',
        error: error.message
      };
    }
  }

  /**
   * Get state snapshot for persistence
   * Returns a serializable state object
   * Requirements: 10.5, 10.6
   */
  getStateSnapshot() {
    return {
      board: JSON.parse(JSON.stringify(this.board)),
      playerXe: this.playerXe ? { ...this.playerXe } : null,
      enemyPieces: this.enemyPieces.map(p => ({ ...p })),
      gameMode: this.gameMode,
      currentTurn: this.currentTurn,
      turnCount: this.turnCount,
      score: this.score,
      fireModeActive: this.fireModeActive,
      gameSession: this.gameSession ? { ...this.gameSession } : null,
      selectedCell: this.selectedCell ? { ...this.selectedCell } : null,
      premiumBonus: this.premiumBonus
    };
  }

  /**
   * Restore state from snapshot
   * Requirements: 10.5, 10.6
   */
  restoreStateSnapshot(snapshot) {
    try {
      this.board = JSON.parse(JSON.stringify(snapshot.board));
      this.playerXe = snapshot.playerXe ? { ...snapshot.playerXe } : null;
      this.enemyPieces = snapshot.enemyPieces.map(p => ({ ...p }));
      this.gameMode = snapshot.gameMode;
      this.currentTurn = snapshot.currentTurn;
      this.turnCount = snapshot.turnCount;
      this.score = snapshot.score;
      this.fireModeActive = snapshot.fireModeActive;
      this.gameSession = snapshot.gameSession ? { ...snapshot.gameSession } : null;
      this.selectedCell = snapshot.selectedCell ? { ...snapshot.selectedCell } : null;
      this.premiumBonus = snapshot.premiumBonus;

      return {
        success: true,
        message: 'State restored successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to restore state',
        error: error.message
      };
    }
  }

  /**
   * Get current turn information
   * Requirements: 10.4, 10.5
   */
  getTurnInfo() {
    return {
      currentTurn: this.currentTurn,
      turnCount: this.turnCount,
      isPlayerTurn: this.currentTurn === 'player',
      isEnemyTurn: this.currentTurn === 'enemy'
    };
  }

  /**
   * Get current score information
   * Requirements: 10.5
   */
  getScoreInfo() {
    return {
      score: this.score,
      premiumBonus: this.premiumBonus,
      hasPremium: this.premiumBonus > 0
    };
  }

  /**
   * Update score
   * Requirements: 10.5
   */
  updateScore(points) {
    this.score += points;
    return {
      success: true,
      newScore: this.score,
      pointsAdded: points
    };
  }

  /**
   * Set game session from backend
   * Requirements: 12.1, 12.2
   */
  setGameSession(session) {
    this.gameSession = session;
  }

  /**
   * Update premium bonus
   * Requirements: 12.5
   */
  setPremiumBonus(bonus) {
    this.premiumBonus = bonus;
  }

  /**
   * Get valid moves for player Xe with caching
   * Calculate unlimited straight-line moves in 4 directions
   * Stop at board edges or pieces, allow capturing enemy pieces
   * Requirements: 3.2, 3.3, 3.4, 1.1, 1.2
   */
  getValidMoves(piece) {
    // Validate piece exists
    if (!piece) {
      return [];
    }

    // Validate piece has valid position
    if (!this.isValidPosition(piece.row, piece.col)) {
      return [];
    }

    // Validate piece is on the board at its claimed position
    if (this.board[piece.row][piece.col] !== piece) {
      return [];
    }

    // Check cache for this piece position
    const cacheKey = `${piece.row},${piece.col},${piece.type}`;
    if (this._validMovesCache.has(cacheKey)) {
      return this._validMovesCache.get(cacheKey);
    }

    const moves = [];
    const directions = [
      [-1, 0],  // Up
      [1, 0],   // Down
      [0, -1],  // Left
      [0, 1]    // Right
    ];

    // Check each direction
    for (const [dr, dc] of directions) {
      let newRow = piece.row + dr;
      let newCol = piece.col + dc;

      // Continue in this direction until hitting edge or piece
      while (this.isValidPosition(newRow, newCol)) {
        const targetPiece = this.board[newRow][newCol];

        // Can move to empty cell
        if (!targetPiece) {
          moves.push({ row: newRow, col: newCol });
        } 
        // Can capture enemy piece
        else if (targetPiece.isEnemy) {
          moves.push({ row: newRow, col: newCol });
          break; // Stop after capturing
        } 
        // Stop at friendly piece
        else {
          break;
        }

        // Continue in same direction
        newRow += dr;
        newCol += dc;
      }
    }

    // Cache the result
    this._validMovesCache.set(cacheKey, moves);

    return moves;
  }

  /**
   * Handle player move - validate and execute
   * Requirements: 3.5, 3.6, 3.7
   */
  handlePlayerMove(row, col) {
    // Validate position is within board bounds
    if (!this.isValidPosition(row, col)) {
      return { 
        success: false, 
        message: 'Invalid position - out of bounds' 
      };
    }

    // Validate game state
    if (this.gameMode !== 'playing') {
      return { 
        success: false, 
        message: 'Cannot move - game is not in playing mode' 
      };
    }

    if (this.currentTurn !== 'player') {
      return { 
        success: false, 
        message: 'Cannot move - it is not your turn' 
      };
    }

    if (!this.playerXe) {
      return { 
        success: false, 
        message: 'Player Xe not found on board' 
      };
    }

    // Get valid moves for player Xe
    const validMoves = this.getValidMoves(this.playerXe);

    // Check if there are any valid moves available
    if (validMoves.length === 0) {
      return { 
        success: false, 
        message: 'No valid moves available' 
      };
    }

    // Validate selected move is in valid moves list
    const isValidMove = validMoves.some(
      move => move.row === row && move.col === col
    );

    if (!isValidMove) {
      // Provide more specific error message
      const targetPiece = this.board[row][col];
      
      if (targetPiece && !targetPiece.isEnemy) {
        return { 
          success: false, 
          message: 'Cannot move to position with your own piece' 
        };
      }
      
      return { 
        success: false, 
        message: 'Invalid move - Xe can only move in straight lines' 
      };
    }

    // Check if capturing enemy piece
    const targetPiece = this.board[row][col];
    let capturedScore = 0;

    if (targetPiece && targetPiece.isEnemy) {
      // Handle piece capture
      capturedScore = this.capturePiece(row, col);
    }

    // Execute move by updating board state
    const oldRow = this.playerXe.row;
    const oldCol = this.playerXe.col;

    // Remove from old position
    this.board[oldRow][oldCol] = null;

    // Update player Xe position
    this.playerXe.row = row;
    this.playerXe.col = col;

    // Place at new position
    this.board[row][col] = this.playerXe;

    // Check if fire mode is active and execute fire blast
    let fireBlastResult = null;
    if (this.fireModeActive) {
      fireBlastResult = this.executeFireBlast();
    }

    // Increment turn count after player turn
    this.turnCount++;

    // Switch turn after successful move
    this.switchTurn();

    return { 
      success: true, 
      message: 'Move executed successfully',
      capturedScore,
      newPosition: { row, col },
      turnCount: this.turnCount,
      fireBlastResult
    };
  }

  /**
   * Switch between player and enemy turns
   * Requirements: 5.1, 10.4, 10.5
   */
  switchTurn() {
    if (this.currentTurn === 'player') {
      this.currentTurn = 'enemy';
    } else {
      this.currentTurn = 'player';
    }
  }

  /**
   * Execute enemy move - move enemy piece to target position
   * Requirements: 4.7
   */
  executeEnemyMove(piece, move) {
    // Validate piece is an enemy piece
    if (!piece || !piece.isEnemy) {
      return {
        success: false,
        message: 'Invalid piece - not an enemy piece'
      };
    }

    // Validate move position
    if (!this.isValidPosition(move.row, move.col)) {
      return {
        success: false,
        message: 'Invalid move position'
      };
    }

    // Check if capturing player Xe
    const targetPiece = this.board[move.row][move.col];
    let capturedPlayerXe = false;

    if (targetPiece && !targetPiece.isEnemy) {
      // Enemy captured player Xe - game over
      if (targetPiece === this.playerXe) {
        capturedPlayerXe = true;
      }
    }

    // Execute move by updating board state
    const oldRow = piece.row;
    const oldCol = piece.col;

    // Remove from old position
    this.board[oldRow][oldCol] = null;

    // Update piece position
    piece.row = move.row;
    piece.col = move.col;

    // Place at new position
    this.board[move.row][move.col] = piece;

    // Invalidate cache after move
    this._invalidateCache();

    // If player Xe was captured, end the game
    if (capturedPlayerXe) {
      this.transitionToEnded();
      return {
        success: true,
        message: 'Enemy captured player Xe - game over',
        gameOver: true
      };
    }

    // Switch turn back to player
    this.switchTurn();

    return {
      success: true,
      message: 'Enemy move executed successfully',
      gameOver: false
    };
  }

  /**
   * Transition from setup to playing mode
   * Requirements: 10.6
   */
  transitionToPlaying() {
    // Validate current game mode
    if (this.gameMode !== 'setup') {
      return {
        success: false,
        message: `Cannot transition to playing - current mode is ${this.gameMode}`
      };
    }

    // Validate player Xe is placed
    if (!this.playerXe) {
      return {
        success: false,
        message: 'Cannot start game - Player Xe not placed'
      };
    }

    // Validate player Xe is on the board
    if (!this.isValidPosition(this.playerXe.row, this.playerXe.col) ||
        this.board[this.playerXe.row][this.playerXe.col] !== this.playerXe) {
      return {
        success: false,
        message: 'Cannot start game - Player Xe not properly placed on board'
      };
    }

    this.gameMode = 'playing';
    this.currentTurn = 'player';
    this.turnCount = 0;
    this.score = 0;

    return {
      success: true,
      message: 'Transitioned to playing mode'
    };
  }

  /**
   * Transition from playing to ended mode
   * Requirements: 10.6
   */
  transitionToEnded() {
    // Validate current game mode
    if (this.gameMode !== 'playing') {
      return {
        success: false,
        message: `Cannot end game - current mode is ${this.gameMode}`
      };
    }

    this.gameMode = 'ended';

    return {
      success: true,
      message: 'Transitioned to ended mode'
    };
  }

  /**
   * Get current game mode
   * Requirements: 10.6
   */
  getGameMode() {
    return this.gameMode;
  }

  /**
   * Set game mode (for direct state management)
   * Requirements: 10.6
   */
  setGameMode(mode) {
    if (!['setup', 'playing', 'ended'].includes(mode)) {
      return {
        success: false,
        message: 'Invalid game mode'
      };
    }

    this.gameMode = mode;

    return {
      success: true,
      message: `Game mode set to ${mode}`
    };
  }

  /**
   * Validate current game state
   * Check for inconsistencies and errors in game state
   * Requirements: 2.4, 2.5
   */
  validateGameState() {
    const errors = [];
    const warnings = [];

    // Validate board structure
    if (!Array.isArray(this.board) || this.board.length !== BOARD_CONFIG.ROWS) {
      errors.push('Invalid board structure');
    } else {
      for (let row = 0; row < this.board.length; row++) {
        if (!Array.isArray(this.board[row]) || this.board[row].length !== BOARD_CONFIG.COLS) {
          errors.push(`Invalid board row ${row}`);
        }
      }
    }

    // Validate game mode
    if (!['setup', 'playing', 'ended'].includes(this.gameMode)) {
      errors.push(`Invalid game mode: ${this.gameMode}`);
    }

    // Validate current turn
    if (!['player', 'enemy'].includes(this.currentTurn)) {
      errors.push(`Invalid current turn: ${this.currentTurn}`);
    }

    // Validate turn count
    if (typeof this.turnCount !== 'number' || this.turnCount < 0) {
      errors.push('Invalid turn count');
    }

    // Validate score
    if (typeof this.score !== 'number' || this.score < 0) {
      errors.push('Invalid score');
    }

    // Validate player Xe in playing/ended mode
    if (this.gameMode === 'playing' || this.gameMode === 'ended') {
      if (!this.playerXe) {
        errors.push('Player Xe missing in playing/ended mode');
      } else {
        // Validate player Xe position
        if (!this.isValidPosition(this.playerXe.row, this.playerXe.col)) {
          errors.push('Player Xe has invalid position');
        } else if (this.gameMode === 'playing' && 
                   this.board[this.playerXe.row][this.playerXe.col] !== this.playerXe) {
          warnings.push('Player Xe not at expected board position');
        }
      }
    }

    // Validate enemy pieces
    if (!Array.isArray(this.enemyPieces)) {
      errors.push('Enemy pieces is not an array');
    } else {
      for (let i = 0; i < this.enemyPieces.length; i++) {
        const piece = this.enemyPieces[i];
        if (!piece || !this.isValidPosition(piece.row, piece.col)) {
          warnings.push(`Enemy piece ${i} has invalid position`);
        }
      }
    }

    // Validate fire mode
    if (typeof this.fireModeActive !== 'boolean') {
      errors.push('Fire mode active is not a boolean');
    }

    // Validate premium bonus
    if (typeof this.premiumBonus !== 'number' || this.premiumBonus < 0) {
      warnings.push('Invalid premium bonus value');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      message: errors.length === 0 
        ? 'Game state is valid' 
        : `Game state has ${errors.length} error(s)`
    };
  }

  /**
   * Capture enemy piece and update score
   * Requirements: 3.5, 9.1-9.7
   */
  capturePiece(row, col) {
    const piece = this.board[row][col];

    if (!piece || !piece.isEnemy) {
      return 0;
    }

    // Calculate score for captured piece
    const capturedScore = this.calculateScore(piece.type);

    // Check if capturing Tướng địch - activate fire mode
    if (piece.type === PIECE_TYPES.TUONG_DICH) {
      this.fireModeActive = true;
    }

    // Remove piece from board and enemy array
    this.removePiece(row, col);

    // Update total score
    this.score += capturedScore;

    return capturedScore;
  }

  /**
   * Check if a position is under attack by any enemy piece
   * Optimized with early returns
   * Requirements: 4.2, 5.2, 5.3
   */
  isPositionUnderAttack(row, col) {
    // Early return for invalid position
    if (!this.isValidPosition(row, col)) {
      return false;
    }

    // Early return if no enemy pieces
    if (this.enemyPieces.length === 0) {
      return false;
    }

    // Check if any enemy piece can attack this position
    for (const enemyPiece of this.enemyPieces) {
      const enemyMoves = this.getEnemyValidMoves(enemyPiece);
      
      // Early return on first attacker found
      const canAttack = enemyMoves.some(
        move => move.row === row && move.col === col
      );

      if (canAttack) {
        return true; // Early return
      }
    }

    return false;
  }

  /**
   * Get valid moves for an enemy piece - dispatcher
   * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7
   */
  getEnemyValidMoves(piece) {
    if (!piece || !piece.isEnemy) {
      return [];
    }

    // Switch on piece type and call appropriate movement function
    switch (piece.type) {
      case PIECE_TYPES.TOT:
        return this.validateTotMove(piece);
      case PIECE_TYPES.SI:
        return this.validateSiMove(piece);
      case PIECE_TYPES.TUONG:
        return this.validateTuongMove(piece);
      case PIECE_TYPES.MA:
        return this.validateMaMove(piece);
      case PIECE_TYPES.PHAO:
        return this.validatePhaoMove(piece);
      case PIECE_TYPES.XE_DICH:
        return this.validateXeDichMove(piece);
      case PIECE_TYPES.TUONG_DICH:
        return this.validateTuongDichMove(piece);
      default:
        return [];
    }
  }

  /**
   * Validate Tốt (Pawn) movement - 1 step horizontal/vertical
   * Requirements: 6.1
   */
  validateTotMove(piece) {
    const moves = [];
    const directions = [
      [-1, 0],  // Up
      [1, 0],   // Down
      [0, -1],  // Left
      [0, 1]    // Right
    ];

    // Calculate 4 possible moves
    for (const [dr, dc] of directions) {
      const newRow = piece.row + dr;
      const newCol = piece.col + dc;

      // Validate position
      if (this.isValidPosition(newRow, newCol)) {
        const targetPiece = this.board[newRow][newCol];
        
        // Can move to empty cell or capture player piece
        if (!targetPiece || !targetPiece.isEnemy) {
          moves.push({ row: newRow, col: newCol });
        }
      }
    }

    return moves;
  }

  /**
   * Validate Sĩ (Advisor) movement - 1 step diagonal
   * Requirements: 6.2
   */
  validateSiMove(piece) {
    const moves = [];
    const diagonals = [
      [-1, -1], // Up-Left
      [-1, 1],  // Up-Right
      [1, -1],  // Down-Left
      [1, 1]    // Down-Right
    ];

    // Calculate 4 diagonal moves
    for (const [dr, dc] of diagonals) {
      const newRow = piece.row + dr;
      const newCol = piece.col + dc;

      // Validate position
      if (this.isValidPosition(newRow, newCol)) {
        const targetPiece = this.board[newRow][newCol];
        
        // Can move to empty cell or capture player piece
        if (!targetPiece || !targetPiece.isEnemy) {
          moves.push({ row: newRow, col: newCol });
        }
      }
    }

    return moves;
  }

  /**
   * Validate Tượng (Elephant) movement - 2 steps diagonal, no jump
   * Requirements: 6.3
   */
  validateTuongMove(piece) {
    const moves = [];
    const diagonals = [
      [-1, -1], // Up-Left
      [-1, 1],  // Up-Right
      [1, -1],  // Down-Left
      [1, 1]    // Down-Right
    ];

    // Calculate 4 diagonal moves (2 steps each)
    for (const [dr, dc] of diagonals) {
      const newRow = piece.row + dr * 2;
      const newCol = piece.col + dc * 2;
      const midRow = piece.row + dr;
      const midCol = piece.col + dc;

      // Validate positions
      if (this.isValidPosition(newRow, newCol) && 
          this.isValidPosition(midRow, midCol)) {
        
        // Check middle position is empty (no jumping)
        const middlePiece = this.board[midRow][midCol];
        if (middlePiece) {
          continue; // Cannot jump over pieces
        }

        const targetPiece = this.board[newRow][newCol];
        
        // Can move to empty cell or capture player piece
        if (!targetPiece || !targetPiece.isEnemy) {
          moves.push({ row: newRow, col: newCol });
        }
      }
    }

    return moves;
  }

  /**
   * Validate Mã (Horse) movement - L-shaped with leg blocking
   * Requirements: 6.4
   */
  validateMaMove(piece) {
    const moves = [];
    const horseMoves = [
      [-2, -1], [-2, 1],  // Up moves
      [-1, -2], [-1, 2],  // Side moves (up)
      [1, -2], [1, 2],    // Side moves (down)
      [2, -1], [2, 1]     // Down moves
    ];

    // Calculate 8 L-shaped moves
    for (const [dr, dc] of horseMoves) {
      const newRow = piece.row + dr;
      const newCol = piece.col + dc;

      // Validate position
      if (this.isValidPosition(newRow, newCol)) {
        // Check leg blocking for each move
        let midRow, midCol;
        
        if (Math.abs(dr) === 2) {
          // Vertical L-shape: check vertical leg
          midRow = piece.row + Math.sign(dr);
          midCol = piece.col;
        } else {
          // Horizontal L-shape: check horizontal leg
          midRow = piece.row;
          midCol = piece.col + Math.sign(dc);
        }

        // Check if leg is blocked
        const legPiece = this.board[midRow][midCol];
        if (legPiece) {
          continue; // Leg is blocked
        }

        const targetPiece = this.board[newRow][newCol];
        
        // Can move to empty cell or capture player piece
        if (!targetPiece || !targetPiece.isEnemy) {
          moves.push({ row: newRow, col: newCol });
        }
      }
    }

    return moves;
  }

  /**
   * Validate Pháo (Cannon) movement - unlimited straight, jump to capture
   * Requirements: 6.5
   */
  validatePhaoMove(piece) {
    const moves = [];
    const directions = [
      [-1, 0],  // Up
      [1, 0],   // Down
      [0, -1],  // Left
      [0, 1]    // Right
    ];

    // Calculate unlimited straight moves in 4 directions
    for (const [dr, dc] of directions) {
      let newRow = piece.row + dr;
      let newCol = piece.col + dc;
      let jumpedOver = false;

      while (this.isValidPosition(newRow, newCol)) {
        const targetPiece = this.board[newRow][newCol];

        if (!targetPiece) {
          // Empty cell
          if (!jumpedOver) {
            // Can move to empty cell if haven't jumped yet
            moves.push({ row: newRow, col: newCol });
          }
          // If already jumped, continue looking for capture target
        } else if (!jumpedOver) {
          // First piece encountered - jump over it
          jumpedOver = true;
        } else {
          // Second piece encountered - can capture if not enemy
          if (!targetPiece.isEnemy) {
            moves.push({ row: newRow, col: newCol });
          }
          break; // Stop after finding capture target
        }

        newRow += dr;
        newCol += dc;
      }
    }

    return moves;
  }

  /**
   * Validate Xe địch (Enemy Rook) movement - unlimited straight
   * Requirements: 6.6
   */
  validateXeDichMove(piece) {
    const moves = [];
    const directions = [
      [-1, 0],  // Up
      [1, 0],   // Down
      [0, -1],  // Left
      [0, 1]    // Right
    ];

    // Calculate unlimited straight moves in 4 directions
    // Same as player Xe movement
    for (const [dr, dc] of directions) {
      let newRow = piece.row + dr;
      let newCol = piece.col + dc;

      while (this.isValidPosition(newRow, newCol)) {
        const targetPiece = this.board[newRow][newCol];

        if (!targetPiece) {
          // Can move to empty cell
          moves.push({ row: newRow, col: newCol });
        } else if (!targetPiece.isEnemy) {
          // Can capture player piece
          moves.push({ row: newRow, col: newCol });
          break; // Stop after capturing
        } else {
          // Stop at friendly piece
          break;
        }

        newRow += dr;
        newCol += dc;
      }
    }

    return moves;
  }

  /**
   * Validate Tướng địch (Enemy General) movement - 1 step any direction
   * Requirements: 6.7
   */
  validateTuongDichMove(piece) {
    const moves = [];
    const allDirections = [
      [-1, 0],  // Up
      [1, 0],   // Down
      [0, -1],  // Left
      [0, 1],   // Right
      [-1, -1], // Up-Left
      [-1, 1],  // Up-Right
      [1, -1],  // Down-Left
      [1, 1]    // Down-Right
    ];

    // Calculate 8 possible moves (4 straight + 4 diagonal)
    for (const [dr, dc] of allDirections) {
      const newRow = piece.row + dr;
      const newCol = piece.col + dc;

      // Validate position
      if (this.isValidPosition(newRow, newCol)) {
        const targetPiece = this.board[newRow][newCol];
        
        // Can move to empty cell or capture player piece
        if (!targetPiece || !targetPiece.isEnemy) {
          moves.push({ row: newRow, col: newCol });
        }
      }
    }

    return moves;
  }

  /**
   * Check if player Xe will be captured at a position
   * Simulates the move and checks if any enemy can capture Xe
   * Only used for trap detection in first 10 turns
   * Requirements: 4.3
   */
  willXeBeCapturedAt(row, col) {
    if (!this.playerXe || !this.isValidPosition(row, col)) {
      return false;
    }

    // Save current state
    const originalRow = this.playerXe.row;
    const originalCol = this.playerXe.col;
    const originalBoardPiece = this.board[row][col];

    // Temporarily move Xe to new position
    this.board[originalRow][originalCol] = null;
    this.playerXe.row = row;
    this.playerXe.col = col;
    this.board[row][col] = this.playerXe;

    // Check if any enemy can capture Xe at this position
    let willBeCaptured = false;

    for (const enemyPiece of this.enemyPieces) {
      // Skip if this is the piece we're capturing
      if (enemyPiece.row === row && enemyPiece.col === col) {
        continue;
      }

      const enemyMoves = this.getEnemyValidMoves(enemyPiece);
      
      // Check if enemy can reach this position
      const canCapture = enemyMoves.some(
        move => move.row === row && move.col === col
      );

      if (canCapture) {
        willBeCaptured = true;
        break;
      }
    }

    // Restore original state
    this.board[row][col] = originalBoardPiece;
    this.playerXe.row = originalRow;
    this.playerXe.col = originalCol;
    this.board[originalRow][originalCol] = this.playerXe;

    return willBeCaptured;
  }

  /**
   * Get categorized moves for player Xe with safety indicators and caching
   * Returns moves categorized as safe, danger, or trap
   * Requirements: 4.1, 4.4, 4.5, 1.1, 1.2
   */
  getCategorizedMoves() {
    if (!this.playerXe) {
      return {
        validMoves: [],
        dangerMoves: [],
        trapMoves: [],
        safeMoves: []
      };
    }

    // Return cached result if available
    if (this._categorizedMovesCache) {
      return this._categorizedMovesCache;
    }

    const validMoves = this.getValidMoves(this.playerXe);
    const dangerMoves = [];
    const trapMoves = [];
    const safeMoves = [];

    for (const move of validMoves) {
      const isUnderAttack = this.isPositionUnderAttack(move.row, move.col);
      
      // Check for trap moves (only in first 10 turns)
      if (this.turnCount < 10) {
        const isTrap = this.willXeBeCapturedAt(move.row, move.col);
        
        if (isTrap) {
          trapMoves.push(move);
          continue;
        }
      }

      // Categorize as danger or safe
      if (isUnderAttack) {
        dangerMoves.push(move);
      } else {
        safeMoves.push(move);
      }
    }

    const result = {
      validMoves,
      dangerMoves,
      trapMoves,
      safeMoves
    };

    // Cache the result
    this._categorizedMovesCache = result;

    return result;
  }

  /**
   * Get capture value for a position (for tooltips)
   * Requirements: 4.5
   */
  getCaptureValue(row, col) {
    if (!this.isValidPosition(row, col)) {
      return 0;
    }

    const piece = this.board[row][col];
    if (!piece || !piece.isEnemy) {
      return 0;
    }

    return this.calculateScore(piece.type);
  }

  /**
   * Execute fire blast - burn all enemy pieces in 4 straight directions
   * Award double base score for burned pieces with premium bonus
   * Requirements: 8.3, 8.4, 8.5, 8.6, 9.9
   */
  executeFireBlast() {
    if (!this.fireModeActive || !this.playerXe) {
      return {
        success: false,
        message: 'Fire mode not active',
        burnedPieces: [],
        totalScore: 0
      };
    }

    const directions = [
      [-1, 0],  // Up
      [1, 0],   // Down
      [0, -1],  // Left
      [0, 1]    // Right
    ];

    const burnedPieces = [];
    let totalScore = 0;

    // Burn all enemy pieces in 4 straight directions
    for (const [dr, dc] of directions) {
      let currentRow = this.playerXe.row + dr;
      let currentCol = this.playerXe.col + dc;

      // Continue in this direction until hitting edge
      while (this.isValidPosition(currentRow, currentCol)) {
        const piece = this.board[currentRow][currentCol];

        // If enemy piece found, burn it
        if (piece && piece.isEnemy) {
          // Calculate double base score
          const baseScore = PIECE_VALUES[piece.type] || 0;
          const fireScore = baseScore * 2; // Double score for fire blast
          
          // Apply premium bonus to fire blast score
          const finalScore = this.applyPremiumBonus(fireScore);

          // Store burned piece info
          burnedPieces.push({
            type: piece.type,
            row: currentRow,
            col: currentCol,
            score: finalScore
          });

          // Remove piece from board and enemy array
          this.removePiece(currentRow, currentCol);

          // Add to total score
          totalScore += finalScore;
        }

        // Continue to next cell in same direction
        currentRow += dr;
        currentCol += dc;
      }
    }

    // Update total game score
    this.score += totalScore;

    // Deactivate fire mode after blast
    this.fireModeActive = false;

    return {
      success: true,
      message: `Fire Blast! Burned ${burnedPieces.length} pieces`,
      burnedPieces,
      totalScore
    };
  }

  /**
   * Activate fire mode when capturing Tướng địch
   * Requirements: 8.1, 8.2
   */
  activateFireMode() {
    this.fireModeActive = true;
  }

  /**
   * Check if game over conditions are met
   * Returns game over status and reason
   * Requirements: 11.1, 11.2, 11.3
   */
  checkGameOver() {
    try {
      // Check if player Xe exists
      if (!this.playerXe) {
        return {
          isGameOver: true,
          result: 'defeat',
          reason: 'Player Xe was captured'
        };
      }

      // Validate player Xe position
      if (!this.isValidPosition(this.playerXe.row, this.playerXe.col)) {
        return {
          isGameOver: true,
          result: 'defeat',
          reason: 'Player Xe is in invalid position'
        };
      }

      // Check if player Xe is still on the board at its position
      if (this.board[this.playerXe.row][this.playerXe.col] !== this.playerXe) {
        return {
          isGameOver: true,
          result: 'defeat',
          reason: 'Player Xe was captured'
        };
      }

      // Check if turn count reaches 200
      if (this.turnCount >= 200) {
        return {
          isGameOver: true,
          result: 'draw',
          reason: 'Turn limit reached (200 turns)'
        };
      }

      // Check if player Xe is in checkmate (under attack with no escape)
      const isUnderAttack = this.isPositionUnderAttack(this.playerXe.row, this.playerXe.col);
      
      if (isUnderAttack) {
        // Get all valid moves for player Xe
        const validMoves = this.getValidMoves(this.playerXe);
        
        // Check if any move leads to safety
        let hasEscapeMove = false;
        
        for (const move of validMoves) {
          // Check if this move would be safe
          const wouldBeSafe = !this.willXeBeCapturedAt(move.row, move.col);
          
          if (wouldBeSafe) {
            hasEscapeMove = true;
            break;
          }
        }

        // If under attack with no escape moves, it's checkmate
        if (!hasEscapeMove) {
          return {
            isGameOver: true,
            result: 'defeat',
            reason: 'Checkmate - Player Xe has no escape'
          };
        }
      }

      // Game is not over
      return {
        isGameOver: false,
        result: null,
        reason: null
      };
    } catch (error) {
      console.error('Error checking game over:', error);
      
      // If there's an error checking game over, assume game is not over
      // to avoid prematurely ending the game
      return {
        isGameOver: false,
        result: null,
        reason: null,
        error: error.message
      };
    }
  }

  /**
   * End the game and send data to backend
   * Requirements: 11.4, 11.5, 12.3, 12.4
   */
  async endGame(gameAPI, result = 'defeat') {
    // Validate game state
    if (this.gameMode !== 'playing') {
      return {
        success: false,
        message: 'Cannot end game - game is not in playing mode'
      };
    }

    // Validate result parameter
    const validResults = ['win', 'lose', 'draw', 'defeat'];
    if (!validResults.includes(result)) {
      console.warn(`Invalid result "${result}", defaulting to "defeat"`);
      result = 'defeat';
    }

    // Transition to ended mode
    this.transitionToEnded();

    // Calculate game duration
    let duration = 0;
    if (this.gameSession && this.gameSession.createdAt) {
      try {
        const startTime = new Date(this.gameSession.createdAt);
        const endTime = new Date();
        duration = Math.floor((endTime - startTime) / 1000); // Duration in seconds
        
        // Validate duration is reasonable (not negative or too large)
        if (duration < 0 || duration > 86400) { // Max 24 hours
          console.warn(`Invalid duration calculated: ${duration}s, resetting to 0`);
          duration = 0;
        }
      } catch (error) {
        console.error('Error calculating duration:', error);
        duration = 0;
      }
    }

    // Prepare game data
    const gameData = {
      sessionId: this.gameSession?._id,
      score: this.score,
      turnCount: this.turnCount,
      result: result, // 'win' | 'lose' | 'draw'
      duration: duration
    };

    // Validate gameAPI is provided and has endGame method
    if (!gameAPI || typeof gameAPI.endGame !== 'function') {
      console.warn('Game API not available for ending game');
      return {
        success: true,
        message: 'Game ended (offline mode - API not available)',
        result: result,
        score: this.score,
        turnCount: this.turnCount,
        duration: duration,
        offline: true
      };
    }

    // Check if this is an offline session
    if (!this.gameSession || this.gameSession._id.startsWith('offline')) {
      return {
        success: true,
        message: 'Game ended (offline session)',
        result: result,
        score: this.score,
        turnCount: this.turnCount,
        duration: duration,
        offline: true
      };
    }

    // Try to send data to backend API
    try {
      const response = await gameAPI.endGame(gameData);
      
      // Validate API response
      if (!response || !response.data) {
        throw new Error('Invalid API response format');
      }
      
      return {
        success: true,
        message: 'Game ended successfully',
        result: result,
        score: this.score,
        turnCount: this.turnCount,
        duration: duration,
        apiResponse: response.data
      };
    } catch (error) {
      console.error('End game API error:', error);
      
      // Determine error type for better messaging
      let errorMessage = 'Game ended (failed to save to server)';
      
      if (error.message === 'Network request failed' || error.code === 'ECONNABORTED') {
        errorMessage = 'Game ended (network unavailable)';
      } else if (error.response && error.response.status >= 500) {
        errorMessage = 'Game ended (server error)';
      } else if (error.response && error.response.status === 401) {
        errorMessage = 'Game ended (authentication error)';
      } else if (error.response && error.response.status === 404) {
        errorMessage = 'Game ended (session not found)';
      }
      
      // Return success anyway with error info - game still ends locally
      return {
        success: true,
        message: errorMessage,
        result: result,
        score: this.score,
        turnCount: this.turnCount,
        duration: duration,
        error: error.message,
        apiError: true
      };
    }
  }
}
