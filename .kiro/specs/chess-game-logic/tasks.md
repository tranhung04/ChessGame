# Implementation Plan

- [x] 1. Create game engine core classes





  - Create ChessGame class with board initialization and basic state management
  - Create EnemyAI class with basic structure
  - Set up piece type constants and configurations
  - _Requirements: 1.1, 1.2, 10.1, 10.2, 10.3_

- [x] 2. Implement board management and piece placement





  - [x] 2.1 Implement board initialization (9x8 grid)


    - Create empty board array structure
    - Initialize game state properties
    - _Requirements: 1.1_

  - [x] 2.2 Implement piece placement and removal methods


    - Write placePiece() method to update board and UI
    - Write removePiece() method to clear board and UI
    - Write getPieceSymbol() to return Chinese chess symbols
    - _Requirements: 1.2, 1.3, 1.4_

- [x] 3. Implement setup phase





  - [x] 3.1 Handle player Xe placement


    - Implement handleSetupTap() to place/move player Xe
    - Validate Xe placement
    - Update UI to show placed Xe
    - _Requirements: 2.1, 2.2, 2.3_


  - [x] 3.2 Implement start game validation and transition

    - Validate that player Xe is placed before starting
    - Create game session via API call
    - Transition from setup to playing mode
    - Initialize turn count and score
    - _Requirements: 2.4, 2.5, 12.1, 12.2_

- [x] 4. Implement player movement validation





  - [x] 4.1 Implement getValidMoves() for player Xe


    - Calculate unlimited straight-line moves (4 directions)
    - Stop at board edges or pieces
    - Allow capturing enemy pieces
    - _Requirements: 3.2, 3.3, 3.4_

  - [x] 4.2 Implement isValidPosition() helper


    - Check if position is within board bounds (0-8 rows, 0-7 cols)
    - _Requirements: 3.7_

  - [x] 4.3 Implement move validation and execution


    - Validate selected move is in valid moves list
    - Execute move by updating board state
    - Handle piece capture
    - Switch turn after successful move
    - _Requirements: 3.5, 3.6, 3.7_

- [x] 5. Implement safety indicators and move highlighting





  - [x] 5.1 Implement danger zone detection


    - Create isPositionUnderAttack() to check if position is threatened
    - Calculate all enemy attack positions
    - _Requirements: 4.2_

  - [x] 5.2 Implement trap move detection (first 10 turns)


    - Create willXeBeCapturedAt() to predict capture after move
    - Check if any enemy can capture Xe at new position
    - Only show for turns < 10
    - _Requirements: 4.3_

  - [x] 5.3 Implement move highlighting logic


    - Highlight valid moves in green
    - Highlight danger moves in red
    - Highlight trap moves in orange
    - Show tooltips with capture values
    - _Requirements: 4.1, 4.4, 4.5_

- [x] 6. Implement enemy piece movement rules








  - [x] 6.1 Implement Tốt movement (1 step horizontal/vertical)

    - Calculate 4 possible moves
    - Validate positions
    - _Requirements: 6.1_


  - [x] 6.2 Implement Sĩ movement (1 step diagonal)



    - Calculate 4 diagonal moves
    - Validate positions
    - _Requirements: 6.2_





  - [x] 6.3 Implement Tượng movement (2 steps diagonal, no jump)


    - Calculate 4 diagonal moves (2 steps each)
    - Check middle position is empty (no jumping)
    - Validate positions
    - _Requirements: 6.3_








  - [x] 6.4 Implement Mã movement (L-shaped with leg blocking)


    - Calculate 8 L-shaped moves
    - Check leg blocking for each move


    - Validate positions
    - _Requirements: 6.4_


  - [x] 6.5 Implement Pháo movement (unlimited straight, jump to capture)


    - Calculate unlimited straight moves in 4 directions
    - Track if jumped over a piece
    - Allow capture only after jumping
    - _Requirements: 6.5_








  - [x] 6.6 Implement Xe địch movement (unlimited straight)

    - Same as player Xe movement


    - Calculate unlimited straight moves in 4 directions

    - _Requirements: 6.6_



  - [x] 6.7 Implement Tướng địch movement (1 step any direction)

    - Calculate 8 possible moves (4 straight + 4 diagonal)




    - Validate positions
    - _Requirements: 6.7_





  - [x] 6.8 Create getEnemyValidMoves() dispatcher

    - Switch on piece type
    - Call appropriate movement function
    - Return valid moves array
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

- [x] 7. Implement scoring system




  - [x] 7.1 Implement base scoring for piece captures


    - Define piece values (Tốt: 1, Sĩ: 1, Tượng: 2, Mã: 3, Pháo: 3, Xe địch: 5, Tướng địch: 10)
    - Implement calculateScore() method
    - Update score when capturing pieces
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_

  - [x] 7.2 Implement premium bonus calculation


    - Get premium status from user context
    - Apply premium bonus percentage to scores
    - Implement applyPremiumBonus() method
    - _Requirements: 9.8, 12.5_

  - [x] 7.3 Implement fire blast scoring


    - Award double base score for burned pieces
    - Apply premium bonus to fire blast scores
    - _Requirements: 9.9_

- [x] 8. Implement fire mode mechanics





  - [x] 8.1 Implement fire mode activation

    - Detect Tướng địch capture
    - Set fireModeActive flag
    - Display fire mode notification
    - _Requirements: 8.1, 8.2_

  - [x] 8.2 Implement fire blast execution

    - Execute on next player move when fire mode active
    - Burn all enemy pieces in 4 straight directions
    - Calculate and award double scores
    - Remove burned pieces from board and enemy array
    - Deactivate fire mode after blast
    - _Requirements: 8.3, 8.4, 8.5, 8.6_

  - [x] 8.3 Implement fire blast animation


    - Show fire effect on blast paths
    - Animate piece removal
    - Display score popup
    - _Requirements: 13.4_

- [x] 9. Implement enemy AI piece introduction





  - [x] 9.1 Implement piece introduction schedule


    - Create chooseNewPieceType() with turn-based logic
    - Tốt at turn 1
    - Sĩ at turn 5
    - Tượng at turn 15
    - Mã at turn 20
    - Tướng địch at turn 22 and every 15 turns (if 2 Sĩ exist)
    - Pháo at turn 30
    - Xe địch at turn 35
    - Track piece first appearance
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

  - [x] 9.2 Implement strategic piece placement


    - Create findStrategicPosition() method
    - For turns < 10: find blocking positions near player Xe
    - For turns >= 10: find safe positions away from danger zones
    - Implement calculateSafetyScore() for position evaluation
    - _Requirements: 7.8_

  - [x] 9.3 Implement addPiece() method


    - Select piece type from schedule
    - Find strategic position
    - Place piece on board
    - Add to enemy pieces array
    - Track as newly added (don't move in same turn)
    - _Requirements: 7.9_

- [x] 10. Implement enemy AI movement strategy





  - [x] 10.1 Implement threat detection


    - Create findThreatenedPieces() to find pieces under attack
    - Create isPieceProtected() to check if piece is defended
    - Filter unprotected threatened pieces
    - _Requirements: 7.8_

  - [x] 10.2 Implement smart piece movement


    - Prioritize moving threatened unprotected pieces
    - Find best move using position evaluation
    - Execute piece movement
    - Don't move newly added pieces
    - _Requirements: 7.8, 7.9_

  - [x] 10.3 Implement position evaluation for moves


    - Create findBestMove() method
    - Score moves based on safety, distance, strategy
    - Prefer moves away from danger zones
    - Prefer moves toward player Xe for strong pieces
    - _Requirements: 7.8_

  - [x] 10.4 Implement executeTurn() main AI loop


    - Add new piece if scheduled
    - Move one existing piece strategically
    - Track actions per turn
    - Switch back to player turn when done
    - _Requirements: 5.2, 5.3, 5.4, 5.5, 5.6_


- [x] 11. Implement game state management





  - [x] 11.1 Implement turn switching

    - Switch between player and enemy turns
    - Increment turn count after player turn
    - Update UI to show current turn
    - _Requirements: 5.1, 10.4, 10.5_


  - [x] 11.2 Implement game mode transitions

    - Setup → Playing (on start game)
    - Playing → Ended (on game over)
    - Track game mode state
    - _Requirements: 10.6_


  - [x] 11.3 Implement state persistence

    - Track all game state properties
    - Update UI on state changes
    - _Requirements: 10.5, 10.6_

- [x] 12. Implement game over conditions




  - [x] 12.1 Implement checkGameOver() method


    - Check if player Xe is captured
    - Check if turn count reaches 200
    - Check if player Xe is in checkmate (under attack with no escape)
    - _Requirements: 11.1, 11.2, 11.3_

  - [x] 12.2 Implement endGame() method

    - Display game over modal with result
    - Send game data to backend API
    - Show final score
    - Provide play again option
    - _Requirements: 11.4, 11.5, 12.3, 12.4_

- [x] 13. Implement UI components




  - [x] 13.1 Create ChessBoard component


    - Render 9x8 grid
    - Calculate cell size based on screen width
    - Handle cell press events
    - Render pieces using ChessPiece component
    - Apply cell highlighting (selected, valid, danger, trap)
    - _Requirements: 1.5, 13.1, 13.2_

  - [x] 13.2 Create ChessPiece component


    - Display Chinese chess symbols
    - Apply colors (blue for player, red for enemy)
    - Size based on cell size
    - _Requirements: 1.4_

  - [x] 13.3 Create GameInfo component


    - Display turn count
    - Display current score
    - Display game phase
    - Display current turn
    - Display fire mode indicator
    - _Requirements: 10.4, 13.6_

  - [x] 13.4 Create GameControls component


    - Start Game button (setup phase)
    - End Game button (playing phase)
    - Play Again button (ended phase)
    - Handle button press events
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

- [x] 14. Implement visual feedback and animations





  - [x] 14.1 Implement piece selection highlighting


    - Highlight selected cell
    - Show selection border
    - _Requirements: 13.1_

  - [x] 14.2 Implement move highlighting


    - Highlight valid moves
    - Highlight danger moves
    - Highlight trap moves
    - _Requirements: 13.2_

  - [x] 14.3 Implement capture animation


    - Fade out captured piece
    - Show score popup
    - _Requirements: 13.3_

  - [x] 14.4 Implement fire blast animation


    - Show fire effect on blast paths
    - Animate burning pieces
    - Show total score popup
    - _Requirements: 13.4_


  - [x] 14.5 Implement toast messages

    - Show messages for game events
    - Auto-dismiss after 3 seconds
    - Different colors for info/warning/error
    - _Requirements: 13.5_
-

- [x] 15. Integrate with backend API






  - [x] 15.1 Implement startGame API call

    - Call gameAPI.startGame() when game starts
    - Store game session ID
    - Handle API errors gracefully
    - Allow offline play if API fails


    - _Requirements: 12.1, 12.2, 12.4_

  - [x] 15.2 Implement endGame API call



    - Call gameAPI.endGame() with session ID, score, duration, result

    - Handle API errors
    - Update user stats
    - _Requirements: 12.3, 12.4_

  - [x] 15.3 Implement premium bonus integration

    - Get premium status from AuthContext
    - Apply premium bonus percentage to scores
    - _Requirements: 12.5_

- [x] 16. Implement game controls and user interactions






  - [x] 16.1 Implement setup phase interactions








    - Handle cell tap to place player Xe
    - Show visual feedback
    - Enable start game button when Xe is placed


    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 16.2 Implement playing phase interactions


    - Handle cell tap to select Xe
    - Handle cell tap to move Xe


    - Show valid moves on selection
    - Execute move on valid tap
    - _Requirements: 3.1, 3.2, 3.6_

  - [x] 16.3 Implement game control buttons



    - Start Game button validation and action
    - End Game button with confirmation
    - Play Again button to reset game
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_
-

- [x] 17. Implement error handling and edge cases




  - [x] 17.1 Handle invalid moves


    - Validate move before execution
    - Show error message for invalid moves
    - _Requirements: 3.7_

  - [x] 17.2 Handle API errors


    - Try-catch for all API calls
    - Show user-friendly error messages
    - Allow offline play when API unavailable
    - _Requirements: 12.4_

  - [x] 17.3 Handle game state errors


    - Validate game state before actions
    - Prevent actions in wrong game mode
    - Show appropriate error messages
    - _Requirements: 2.4, 2.5_


- [x] 18. Optimize performance





  - [x] 18.1 Optimize component rendering

    - Use React.memo for ChessPiece components
    - Memoize expensive calculations
    - Batch state updates
    - _Requirements: 1.1, 1.2_

  - [x] 18.2 Optimize AI execution


    - Use efficient algorithms for move calculation
    - Limit AI thinking time
    - Use early returns in loops
    - _Requirements: 5.2, 5.3_



- [x] 19. Refactor GameScreen to use game engine



  - [x] 19.1 Replace placeholder logic with ChessGame class

    - Initialize ChessGame instance

    - Connect UI to game engine methods
    - Update state from game engine
    - _Requirements: 1.1, 10.1, 10.2, 10.3_

  - [x] 19.2 Integrate EnemyAI with game engine

    - Initialize EnemyAI with game reference
    - Call AI executeTurn() on enemy turn
    - _Requirements: 5.2, 5.3_

  - [x] 19.3 Wire up all UI components


    - Pass game state to components
    - Connect event handlers
    - Update UI on state changes
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6_
