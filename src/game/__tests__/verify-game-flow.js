/**
 * Manual verification script for game flow
 * Tests the complete game flow from setup to playing
 */

import { ChessGame } from '../ChessGame.js';
import { EnemyAI } from '../EnemyAI.js';
import { PIECE_TYPES } from '../constants.js';

console.log('=== Game Flow Verification ===\n');

// Mock gameAPI
const mockGameAPI = {
  startGame: async () => ({
    data: {
      data: {
        session: {
          _id: 'test-session-123',
          createdAt: new Date().toISOString()
        }
      }
    }
  }),
  endGame: async (gameData) => ({
    data: {
      success: true,
      data: gameData
    }
  })
};

async function testGameFlow() {
  try {
    // 1. Initialize game
    console.log('1. Initializing game...');
    const game = new ChessGame(0.2); // 20% premium bonus
    const ai = new EnemyAI(game);
    console.log('✓ Game initialized');
    console.log(`  - Game mode: ${game.gameMode}`);
    console.log(`  - Premium bonus: ${game.premiumBonus * 100}%\n`);

    // 2. Setup phase - place player Xe
    console.log('2. Setup phase - placing player Xe...');
    const placeResult = game.handleSetupTap(7, 4); // Place in bottom center
    if (!placeResult.success) {
      throw new Error(`Failed to place Xe: ${placeResult.message}`);
    }
    console.log('✓ Player Xe placed');
    console.log(`  - Position: (${game.playerXe.row}, ${game.playerXe.col})\n`);

    // 3. Start game
    console.log('3. Starting game...');
    const startResult = await game.startGame(mockGameAPI);
    if (!startResult.success) {
      throw new Error(`Failed to start game: ${startResult.message}`);
    }
    console.log('✓ Game started');
    console.log(`  - Game mode: ${game.gameMode}`);
    console.log(`  - Session ID: ${game.gameSession._id}`);
    console.log(`  - Enemy count: ${game.enemyPieces.length}`);
    console.log(`  - Current turn: ${game.currentTurn}\n`);

    // 4. Verify enemies were spawned
    console.log('4. Verifying enemy spawning...');
    if (game.enemyPieces.length === 0) {
      throw new Error('No enemies spawned!');
    }
    console.log('✓ Enemies spawned successfully');
    console.log(`  - Total enemies: ${game.enemyPieces.length}`);
    
    // Count enemy types
    const enemyTypes = {};
    game.enemyPieces.forEach(piece => {
      enemyTypes[piece.type] = (enemyTypes[piece.type] || 0) + 1;
    });
    console.log('  - Enemy composition:');
    Object.entries(enemyTypes).forEach(([type, count]) => {
      console.log(`    - ${type}: ${count}`);
    });
    console.log();

    // 5. Test player move
    console.log('5. Testing player move...');
    const validMoves = game.getValidMoves(game.playerXe);
    console.log(`  - Valid moves available: ${validMoves.length}`);
    
    if (validMoves.length > 0) {
      const firstMove = validMoves[0];
      const moveResult = game.handlePlayerMove(firstMove.row, firstMove.col);
      if (!moveResult.success) {
        throw new Error(`Failed to move: ${moveResult.message}`);
      }
      console.log('✓ Player move executed');
      console.log(`  - New position: (${game.playerXe.row}, ${game.playerXe.col})`);
      console.log(`  - Turn count: ${game.turnCount}`);
      console.log(`  - Current turn: ${game.currentTurn}\n`);
    }

    // 6. Test enemy AI turn
    console.log('6. Testing enemy AI turn...');
    if (game.currentTurn === 'enemy') {
      const aiResult = await ai.executeTurn();
      if (aiResult && aiResult.success) {
        console.log('✓ Enemy AI turn executed');
        console.log(`  - Current turn: ${game.currentTurn}`);
        console.log(`  - Game over: ${aiResult.gameOver || false}\n`);
      } else {
        console.log('⚠ Enemy AI had no valid moves\n');
      }
    }

    // 7. Test game state
    console.log('7. Verifying game state...');
    const validation = game.validateGameState();
    if (!validation.isValid) {
      throw new Error(`Invalid game state: ${validation.errors.join(', ')}`);
    }
    console.log('✓ Game state is valid');
    if (validation.warnings.length > 0) {
      console.log('  - Warnings:');
      validation.warnings.forEach(w => console.log(`    - ${w}`));
    }
    console.log();

    // 8. Test game end
    console.log('8. Testing game end...');
    const endResult = await game.endGame(mockGameAPI, 'win');
    if (!endResult.success) {
      throw new Error(`Failed to end game: ${endResult.message}`);
    }
    console.log('✓ Game ended successfully');
    console.log(`  - Final score: ${endResult.score}`);
    console.log(`  - Turn count: ${endResult.turnCount}`);
    console.log(`  - Result: ${endResult.result}`);
    console.log(`  - Game mode: ${game.gameMode}\n`);

    console.log('=== All Tests Passed ✓ ===');
    return true;
  } catch (error) {
    console.error('\n❌ Test Failed:', error.message);
    console.error(error.stack);
    return false;
  }
}

// Run the test
testGameFlow().then(success => {
  process.exit(success ? 0 : 1);
});
