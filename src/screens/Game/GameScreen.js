import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Animated
} from 'react-native';
import { gameAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../config/constants';
import { ChessGame } from '../../game/ChessGame';
import { EnemyAI } from '../../game/EnemyAI';
import { ChessBoard, GameInfo, GameControls, Toast } from './components';

export default function GameScreen() {
  const { user, updateUser } = useAuth();
  const gameRef = useRef(null);
  const enemyAIRef = useRef(null);
  const [gameState, setGameState] = useState(null);
  const [categorizedMoves, setCategorizedMoves] = useState({
    validMoves: [],
    dangerMoves: [],
    trapMoves: [],
    safeMoves: []
  });
  const [fireBlastCells, setFireBlastCells] = useState([]);
  const fireBlastAnim = useRef(new Animated.Value(0)).current;
  const [capturingCell, setCapturingCell] = useState(null);
  const captureAnim = useRef(new Animated.Value(1)).current;
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });

  useEffect(() => {
    initializeGame();
  }, []);

  const showToast = (message, type = 'info') => {
    setToast({ visible: true, message, type });
  };

  const hideToast = () => {
    setToast({ visible: false, message: '', type: 'info' });
  };

  const initializeGame = () => {
    try {
      // Get premium bonus from user (Requirements: 12.5)
      // Premium bonus is a percentage (e.g., 0.2 for 20% bonus)
      let premiumBonus = 0;
      
      if (user?.isPremium) {
        premiumBonus = user?.premiumBonusPercentage || 0.2;
        
        // Validate premium bonus is reasonable
        if (typeof premiumBonus !== 'number' || premiumBonus < 0 || premiumBonus > 1) {
          console.warn(`Invalid premium bonus: ${premiumBonus}, defaulting to 0.2`);
          premiumBonus = 0.2;
        }
      }
      
      // Create new game instance with premium bonus
      gameRef.current = new ChessGame(premiumBonus);
      
      // Validate game was created successfully
      if (!gameRef.current) {
        throw new Error('Failed to create game instance');
      }
      
      // Initialize EnemyAI with game reference (Requirements: 5.2, 5.3)
      enemyAIRef.current = new EnemyAI(gameRef.current);
      
      // Validate AI was created successfully
      if (!enemyAIRef.current) {
        throw new Error('Failed to create EnemyAI instance');
      }
      
      // Update state
      updateGameState();
    } catch (error) {
      console.error('Error initializing game:', error);
      showToast('Failed to initialize game - please refresh', 'error');
    }
  };

  // Memoized function to update game state
  // Batches state updates to minimize re-renders
  // Requirements: 1.1, 1.2
  const updateGameState = useCallback(() => {
    if (gameRef.current) {
      const state = gameRef.current.getState();
      
      // Batch state updates together
      setGameState(state);
      
      // Update categorized moves if in playing mode and player's turn
      if (state.gameMode === 'playing' && state.currentTurn === 'player' && state.playerXe) {
        setCategorizedMoves(gameRef.current.getCategorizedMoves());
      } else {
        setCategorizedMoves({
          validMoves: [],
          dangerMoves: [],
          trapMoves: [],
          safeMoves: []
        });
      }
    }
  }, []);

  const startNewGame = () => {
    // Reset AI state when starting new game
    if (enemyAIRef.current) {
      enemyAIRef.current.reset();
    }
    initializeGame();
  };

  const animateCapturedPiece = (row, col, score) => {
    // Set the cell being captured
    setCapturingCell({ row, col });
    
    // Reset animation value
    captureAnim.setValue(1);
    
    // Fade out animation
    Animated.timing(captureAnim, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true
    }).start(() => {
      // Clear capturing cell after animation
      setCapturingCell(null);
      captureAnim.setValue(1);
      
      // Show toast message
      showToast(`Capture! +${score} points`, 'success');
    });
  };

  const animateFireBlast = (burnedPieces, totalScore) => {
    // Set the cells to animate
    setFireBlastCells(burnedPieces.map(p => ({ row: p.row, col: p.col })));
    
    // Reset animation value
    fireBlastAnim.setValue(0);
    
    // Animate fire effect
    Animated.sequence([
      Animated.timing(fireBlastAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true
      }),
      Animated.timing(fireBlastAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true
      })
    ]).start(() => {
      // Clear fire blast cells after animation
      setFireBlastCells([]);
      
      // Show toast message
      showToast(`🔥 Fire Blast! Burned ${burnedPieces.length} pieces! +${totalScore} points`, 'warning');
    });
  };

  const checkAndHandleGameOver = async () => {
    if (!gameRef.current) return;

    const game = gameRef.current;

    // Only check game over in playing mode
    if (game.gameMode !== 'playing') {
      return;
    }

    try {
      const gameOverStatus = game.checkGameOver();

      // Check if there was an error during game over check
      if (gameOverStatus.error) {
        console.error('Error checking game over:', gameOverStatus.error);
        // Don't end game if check failed
        return;
      }

      if (gameOverStatus.isGameOver) {
        // Show reason for game over
        if (gameOverStatus.reason) {
          showToast(gameOverStatus.reason, 'warning');
        }
        
        // End the game with the appropriate result
        await endGame(gameOverStatus.result);
      }
    } catch (error) {
      console.error('Error in checkAndHandleGameOver:', error);
      // Don't end game on error - let player continue
    }
  };

  /**
   * Execute enemy AI turn
   * Requirements: 5.2, 5.3
   */
  const executeEnemyTurn = async () => {
    if (!gameRef.current || !enemyAIRef.current) {
      console.error('Game or AI not initialized');
      return;
    }

    const game = gameRef.current;
    const enemyAI = enemyAIRef.current;

    // Validate it's enemy's turn
    if (game.currentTurn !== 'enemy') {
      console.warn('Not enemy turn');
      return;
    }

    // Validate game is in playing mode
    if (game.gameMode !== 'playing') {
      console.warn('Game not in playing mode');
      return;
    }

    try {
      // Show toast that enemy is thinking
      showToast('Enemy is thinking...', 'info');

      // Execute AI turn
      const result = await enemyAI.executeTurn();

      if (result.success) {
        // Update UI with new game state
        updateGameState();

        // Check for game over after enemy turn
        await checkAndHandleGameOver();
      } else {
        console.error('Enemy turn failed:', result);
        showToast('Enemy turn failed', 'error');
      }
    } catch (error) {
      console.error('Error executing enemy turn:', error);
      showToast('Error during enemy turn', 'error');
      
      // Try to recover by switching back to player turn
      game.switchTurn();
      updateGameState();
    }
  };

  const handleCellPress = async (row, col) => {
    if (!gameRef.current) {
      showToast('Game not initialized', 'error');
      return;
    }

    const game = gameRef.current;

    // Validate game state before processing
    const validation = game.validateGameState();
    if (!validation.isValid) {
      console.error('Invalid game state:', validation.errors);
      showToast('Game state error - please restart', 'error');
      return;
    }

    try {
      if (game.gameMode === 'setup') {
        // Setup phase: Place/move player Xe
        const result = game.handleSetupTap(row, col);
        if (result.success) {
          updateGameState();
          showToast('Xe placed successfully', 'success');
        } else {
          showToast(result.message, 'error');
        }
      } else if (game.gameMode === 'playing') {
        // Validate it's player's turn
        if (game.currentTurn !== 'player') {
          showToast('Wait for enemy turn to complete', 'warning');
          return;
        }

        // Playing phase: Select or move player Xe
        const piece = game.board[row][col];
        
        // If clicking on player Xe, select it
        if (piece && piece.type === 'xe' && !piece.isEnemy) {
          game.selectedCell = { row, col };
          updateGameState();
        }
        // If Xe is selected and clicking on a valid move
        else if (game.selectedCell) {
          const result = game.handlePlayerMove(row, col);
          if (result.success) {
            game.selectedCell = null;
            
            // Show fire blast animation if it occurred
            if (result.fireBlastResult && result.fireBlastResult.success) {
              const { burnedPieces, totalScore } = result.fireBlastResult;
              updateGameState();
              animateFireBlast(burnedPieces, totalScore);
            }
            // Show capture animation if piece was captured
            else if (result.capturedScore > 0) {
              animateCapturedPiece(row, col, result.capturedScore);
              updateGameState();
            }
            // No capture, just update state
            else {
              updateGameState();
            }

            // Check for game over conditions after player move
            await checkAndHandleGameOver();

            // If game is still playing and it's enemy's turn, execute enemy turn
            if (game.gameMode === 'playing' && game.currentTurn === 'enemy') {
              // Add small delay before enemy turn for better UX
              setTimeout(() => {
                executeEnemyTurn();
              }, 800);
            }
          } else {
            showToast(result.message, 'warning');
          }
        }
      } else if (game.gameMode === 'ended') {
        showToast('Game has ended - click Play Again to start new game', 'info');
      }
    } catch (error) {
      console.error('Error handling cell press:', error);
      showToast('An error occurred - please try again', 'error');
    }
  };

  const handleStartGame = async () => {
    if (!gameRef.current) {
      showToast('Game not initialized', 'error');
      return;
    }

    const game = gameRef.current;

    // Validate game state before starting
    if (game.gameMode !== 'setup') {
      showToast('Game already started', 'warning');
      return;
    }

    if (!game.playerXe) {
      showToast('Please place your Xe first!', 'error');
      return;
    }

    try {
      const result = await game.startGame(gameAPI);
      
      if (result.success) {
        updateGameState();
        if (result.offline) {
          showToast(result.message || 'Game started in offline mode', 'warning');
        } else {
          showToast('Game started!', 'success');
        }

        // If it's enemy's turn after starting, execute enemy turn
        // (This shouldn't normally happen as game starts with player turn,
        // but we handle it for completeness)
        if (game.gameMode === 'playing' && game.currentTurn === 'enemy') {
          setTimeout(() => {
            executeEnemyTurn();
          }, 1000);
        }
      } else {
        showToast(result.message, 'error');
      }
    } catch (error) {
      console.error('Error starting game:', error);
      showToast('Failed to start game - please try again', 'error');
    }
  };

  const handleEndGame = () => {
    if (!gameRef.current) {
      showToast('Game not initialized', 'error');
      return;
    }

    const game = gameRef.current;

    // Validate game state before ending
    if (game.gameMode !== 'playing') {
      showToast('No active game to end', 'warning');
      return;
    }

    // Show confirmation dialog before ending game
    Alert.alert(
      'Kết Thúc Game',
      'Bạn có chắc chắn muốn kết thúc game? Điểm số sẽ được lưu.',
      [
        {
          text: 'Hủy',
          style: 'cancel'
        },
        {
          text: 'Kết Thúc',
          style: 'destructive',
          onPress: () => endGame('lose')
        }
      ]
    );
  };

  const endGame = async (result = 'lose') => {
    if (!gameRef.current) {
      showToast('Game not initialized', 'error');
      return;
    }

    const game = gameRef.current;

    // Validate game state before ending
    if (game.gameMode !== 'playing') {
      showToast('No active game to end', 'warning');
      return;
    }

    try {
      // Use ChessGame.endGame() method which handles API calls and errors
      const endResult = await game.endGame(gameAPI, result);
      
      if (endResult.success) {
        updateGameState();
        
        // Update user stats from backend
        if (!endResult.offline && !endResult.apiError) {
          try {
            await updateUser();
          } catch (error) {
            console.error('Failed to update user stats:', error);
            // Don't show error to user - game still ended successfully
          }
        }
        
        // Show game over alert
        Alert.alert(
          'Game Over',
          `Final Score: ${endResult.score}\nTurns: ${endResult.turnCount}\nResult: ${endResult.result}`,
          [{ text: 'Play Again', onPress: startNewGame }]
        );
        
        // Show toast based on result
        if (endResult.offline) {
          showToast(endResult.message || 'Game ended (offline mode)', 'warning');
        } else if (endResult.apiError) {
          showToast(endResult.message || 'Game ended (API error)', 'warning');
        } else {
          showToast('Game ended successfully', 'info');
        }
      } else {
        showToast(endResult.message, 'error');
        
        // If game couldn't end properly, try to reset
        Alert.alert(
          'Error',
          'Failed to end game properly. Would you like to restart?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Restart', onPress: startNewGame }
          ]
        );
      }
    } catch (error) {
      console.error('Error ending game:', error);
      showToast('Failed to end game - please try again', 'error');
      
      // Offer to restart on critical error
      Alert.alert(
        'Error',
        'An error occurred while ending the game. Would you like to restart?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Restart', onPress: startNewGame }
        ]
      );
    }
  };



  // Memoized helper functions to prevent recreation on every render
  // Requirements: 1.1, 1.2
  const getPieceSymbol = useCallback((type) => {
    return gameRef.current?.getPieceSymbol(type);
  }, []);

  const getCaptureValue = useCallback((row, col) => {
    return gameRef.current?.getCaptureValue(row, col);
  }, []);

  if (!gameState) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Toast Messages */}
      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onHide={hideToast}
      />

      {/* Game Info */}
      <GameInfo
        turnCount={gameState.turnCount}
        score={gameState.score}
        gamePhase={gameState.gameMode}
        currentTurn={gameState.currentTurn}
        fireModeActive={gameState.fireModeActive}
      />

      {/* Chess Board */}
      <ChessBoard
        board={gameState.board}
        onCellPress={handleCellPress}
        validMoves={categorizedMoves.validMoves}
        dangerMoves={categorizedMoves.dangerMoves}
        trapMoves={categorizedMoves.trapMoves}
        safeMoves={categorizedMoves.safeMoves}
        selectedCell={gameState.selectedCell}
        gameMode={gameState.gameMode}
        getPieceSymbol={getPieceSymbol}
        getCaptureValue={getCaptureValue}
        fireBlastCells={fireBlastCells}
        fireBlastAnim={fireBlastAnim}
        capturingCell={capturingCell}
        captureAnim={captureAnim}
      />

      {/* Controls */}
      <GameControls
        gameMode={gameState.gameMode}
        onStartGame={handleStartGame}
        onEndGame={handleEndGame}
        onPlayAgain={startNewGame}
        playerXePlaced={!!gameState.playerXe}
        selectedCell={gameState.selectedCell}
        turnCount={gameState.turnCount}
        currentTurn={gameState.currentTurn}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20
  }
});

