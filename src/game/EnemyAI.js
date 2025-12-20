/**
 * EnemyAI - Enemy artificial intelligence class
 * Analyzes enemy pieces and selects strategic moves
 * Requirements: 4.1-4.7
 */

export class EnemyAI {
  constructor(game) {
    this.game = game; // Reference to ChessGame instance
  }

  /**
   * Reset AI state
   */
  reset() {
    // Clear any cached state if needed
    // Currently no state to reset, but method provided for future use
  }

  /**
   * Main AI Decision - Select best move from all enemy pieces
   * Requirements: 4.2, 4.3, 4.4, 4.5, 4.6
   */
  selectBestMove() {
    const categorizedMoves = this.categorizeMoves();
    return this.selectFromCategories(categorizedMoves);
  }

  /**
   * Analyze all enemy pieces and categorize their moves
   * Requirements: 4.2, 4.3
   */
  categorizeMoves() {
    const moves = {
      attacking: [],  // Moves that attack player Xe
      safe: [],       // Moves to safe positions
      trap: []        // Moves that might be traps
    };
    
    // Analyze each enemy piece
    for (const piece of this.game.enemyPieces) {
      const validMoves = this.game.getEnemyValidMoves(piece);
      
      // Categorize each valid move
      for (const move of validMoves) {
        if (this.isAttackingMove(piece, move)) {
          moves.attacking.push({ piece, move });
        } else if (this.isSafeMove(piece, move)) {
          moves.safe.push({ piece, move });
        } else {
          moves.trap.push({ piece, move });
        }
      }
    }
    
    return moves;
  }

  /**
   * Check if move attacks player Xe
   * Requirements: 4.4
   */
  isAttackingMove(piece, move) {
    const { playerXe } = this.game;
    
    if (!playerXe) {
      return false;
    }
    
    // Check if move position is where player Xe is located
    return move.row === playerXe.row && move.col === playerXe.col;
  }

  /**
   * Check if move position is safe (not under attack)
   * Requirements: 4.5
   */
  isSafeMove(piece, move) {
    // Check if move position is not under attack by player Xe
    return !this.game.isPositionUnderAttack(move.row, move.col);
  }

  /**
   * Select move from categorized moves with priority
   * Priority: attacking > safe > trap
   * Requirements: 4.4, 4.6
   */
  selectFromCategories(categorizedMoves) {
    // Priority 1: Attacking moves (attack player Xe)
    if (categorizedMoves.attacking.length > 0) {
      return this.randomSelect(categorizedMoves.attacking);
    }
    
    // Priority 2: Safe moves (avoid danger)
    if (categorizedMoves.safe.length > 0) {
      return this.randomSelect(categorizedMoves.safe);
    }
    
    // Priority 3: Trap moves (risky but might be necessary)
    if (categorizedMoves.trap.length > 0) {
      return this.randomSelect(categorizedMoves.trap);
    }
    
    return null;
  }

  /**
   * Select random move from array (weighted randomization)
   * Requirements: 4.6
   */
  randomSelect(moves) {
    if (moves.length === 0) {
      return null;
    }
    return moves[Math.floor(Math.random() * moves.length)];
  }

  /**
   * Execute AI turn - select and execute best move
   * Requirements: 4.7
   */
  async executeTurn() {
    const selectedMove = this.selectBestMove();
    
    if (selectedMove) {
      // Execute move through ChessGame interface
      return this.game.executeEnemyMove(
        selectedMove.piece,
        selectedMove.move
      );
    }
    
    return null;
  }
}
