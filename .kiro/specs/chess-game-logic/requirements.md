# Requirements Document

## Introduction

Implement complete chess game logic from the web version into the React Native mobile app. The game is a strategic Chinese Chess (Xiangqi) variant where the player controls a Rook (Xe) that must survive and capture enemy pieces. The game includes setup phase, player turns, enemy AI turns, fire mode mechanics, and scoring with premium bonuses.

## Glossary

- **Game_System**: The complete chess game implementation including board, pieces, turns, and scoring
- **Player_Xe**: The player's Rook piece that moves in straight lines (horizontal/vertical)
- **Enemy_Pieces**: AI-controlled pieces including Tốt, Sĩ, Tượng, Mã, Pháo, Xe địch, and Tướng địch
- **Fire_Mode**: Special mode activated when capturing Tướng địch, burning all enemy pieces in 4 directions
- **Setup_Phase**: Initial game phase where player places their Xe and enemy pieces are added
- **Play_Phase**: Main game phase with alternating player and enemy turns
- **Danger_Zone**: Positions that the Player_Xe can attack
- **Trap_Move**: Position that appears safe but will result in capture (shown in first 10 turns)
- **Premium_Bonus**: Score multiplier applied to premium users
- **Game_Session**: Backend session tracking game state and score

## Requirements

### Requirement 1: Game Board Management

**User Story:** As a player, I want a 9x8 chess board with proper piece placement, so that I can play the game with correct positioning.

#### Acceptance Criteria

1. WHEN the Game_System initializes, THE Game_System SHALL create a 9x8 board grid
2. WHEN a piece is placed, THE Game_System SHALL update both the data model and visual representation
3. WHEN a piece is removed, THE Game_System SHALL clear both the data model and visual representation
4. THE Game_System SHALL display Chinese chess symbols for each piece type
5. THE Game_System SHALL highlight selected pieces and valid move positions

### Requirement 2: Setup Phase

**User Story:** As a player, I want to place my Xe and see enemy pieces added to the board, so that I can start the game with proper initial positioning.

#### Acceptance Criteria

1. WHEN the game starts, THE Game_System SHALL enter Setup_Phase mode
2. WHEN the player taps an empty cell, THE Game_System SHALL place the Player_Xe at that position
3. IF the Player_Xe is already placed, THEN THE Game_System SHALL move the Player_Xe to the new position
4. WHEN the player taps "Start Game" button, THE Game_System SHALL validate that Player_Xe is placed
5. IF Player_Xe is not placed, THEN THE Game_System SHALL display an error message

### Requirement 3: Player Turn Movement

**User Story:** As a player, I want to move my Xe in straight lines and capture enemy pieces, so that I can score points and progress in the game.

#### Acceptance Criteria

1. WHEN it is the player's turn, THE Game_System SHALL allow Player_Xe movement
2. WHEN the player taps the Player_Xe, THE Game_System SHALL highlight all valid move positions
3. THE Player_Xe SHALL move unlimited spaces in horizontal or vertical directions
4. THE Player_Xe SHALL stop movement when encountering any piece
5. WHEN the Player_Xe moves to a position with an enemy piece, THE Game_System SHALL capture that piece and add score
6. WHEN the player taps a valid move position, THE Game_System SHALL move the Player_Xe and end the player turn
7. IF the player taps an invalid position, THEN THE Game_System SHALL display a warning message

### Requirement 4: Move Validation and Safety Indicators

**User Story:** As a player, I want to see which moves are safe or dangerous, so that I can make strategic decisions.

#### Acceptance Criteria

1. WHEN the player hovers over a valid move position, THE Game_System SHALL display safety indicators
2. IF a position is under enemy attack, THEN THE Game_System SHALL highlight it as a danger move
3. WHILE the turn count is less than 10, THE Game_System SHALL show trap moves that lead to capture
4. WHEN a position is safe, THE Game_System SHALL highlight it with a safe indicator
5. THE Game_System SHALL display tooltips showing capture value for enemy pieces

### Requirement 5: Enemy AI Turn

**User Story:** As a player, I want the enemy AI to intelligently add pieces and move them, so that the game provides a challenging experience.

#### Acceptance Criteria

1. WHEN the player turn ends, THE Game_System SHALL switch to enemy turn
2. WHEN it is the enemy turn, THE Game_System SHALL execute AI logic automatically
3. THE Game_System SHALL add new enemy pieces according to turn-based schedule
4. THE Game_System SHALL move existing enemy pieces strategically
5. WHEN the enemy turn completes all actions, THE Game_System SHALL switch back to player turn
6. THE Game_System SHALL allow multiple enemy actions per turn

### Requirement 6: Enemy Piece Movement Rules

**User Story:** As a player, I want enemy pieces to move according to Chinese chess rules, so that the game follows proper mechanics.

#### Acceptance Criteria

1. WHEN a Tốt moves, THE Game_System SHALL allow 1 step in horizontal or vertical direction
2. WHEN a Sĩ moves, THE Game_System SHALL allow 1 step diagonally
3. WHEN a Tượng moves, THE Game_System SHALL allow 2 steps diagonally without jumping over pieces
4. WHEN a Mã moves, THE Game_System SHALL allow L-shaped movement with leg blocking check
5. WHEN a Pháo moves, THE Game_System SHALL allow unlimited straight movement and capture by jumping over one piece
6. WHEN a Xe địch moves, THE Game_System SHALL allow unlimited straight movement
7. WHEN a Tướng địch moves, THE Game_System SHALL allow 1 step in any direction

### Requirement 7: Enemy AI Strategy

**User Story:** As a player, I want the enemy AI to follow a strategic piece introduction schedule, so that the game difficulty increases progressively.

#### Acceptance Criteria

1. WHEN turn count is 1, THE Game_System SHALL introduce Tốt pieces
2. WHEN turn count reaches 5, THE Game_System SHALL introduce Sĩ pieces
3. WHEN turn count reaches 15, THE Game_System SHALL introduce Tượng pieces
4. WHEN turn count reaches 20, THE Game_System SHALL introduce Mã pieces
5. WHEN turn count reaches 22 and every 15 turns after, THE Game_System SHALL introduce Tướng địch if 2 Sĩ exist
6. WHEN turn count reaches 30, THE Game_System SHALL introduce Pháo pieces
7. WHEN turn count reaches 35, THE Game_System SHALL introduce Xe địch pieces
8. THE Game_System SHALL prioritize moving threatened pieces to safety
9. THE Game_System SHALL avoid moving newly added pieces in the same turn

### Requirement 8: Fire Mode Activation

**User Story:** As a player, I want to activate fire mode when capturing Tướng địch, so that I can destroy multiple enemy pieces for bonus points.

#### Acceptance Criteria

1. WHEN the Player_Xe captures a Tướng địch piece, THE Game_System SHALL activate Fire_Mode
2. WHEN Fire_Mode is activated, THE Game_System SHALL display a fire mode notification
3. WHEN the Player_Xe makes the next move in Fire_Mode, THE Game_System SHALL execute fire blast
4. THE Game_System SHALL burn all enemy pieces in 4 straight directions from Player_Xe position
5. WHEN fire blast executes, THE Game_System SHALL award double score for each burned piece
6. WHEN fire blast completes, THE Game_System SHALL deactivate Fire_Mode

### Requirement 9: Scoring System

**User Story:** As a player, I want to earn points for capturing enemy pieces with premium bonuses, so that I can track my performance.

#### Acceptance Criteria

1. WHEN the Player_Xe captures a Tốt, THE Game_System SHALL award 1 point
2. WHEN the Player_Xe captures a Sĩ, THE Game_System SHALL award 1 point
3. WHEN the Player_Xe captures a Tượng, THE Game_System SHALL award 2 points
4. WHEN the Player_Xe captures a Mã, THE Game_System SHALL award 3 points
5. WHEN the Player_Xe captures a Pháo, THE Game_System SHALL award 3 points
6. WHEN the Player_Xe captures a Xe địch, THE Game_System SHALL award 5 points
7. WHEN the Player_Xe captures a Tướng địch, THE Game_System SHALL award 10 points
8. IF the player has premium status, THEN THE Game_System SHALL apply premium bonus percentage to all scores
9. WHEN fire blast burns pieces, THE Game_System SHALL award double base score for each piece

### Requirement 10: Game State Management

**User Story:** As a player, I want the game to track turns, score, and game phase, so that I can see my progress.

#### Acceptance Criteria

1. WHEN the game starts, THE Game_System SHALL initialize turn count to 0
2. WHEN the game starts, THE Game_System SHALL initialize score to 0
3. WHEN each player turn completes, THE Game_System SHALL increment turn count
4. THE Game_System SHALL display current turn count, score, and game phase
5. THE Game_System SHALL track all player pieces and enemy pieces in arrays
6. THE Game_System SHALL maintain game mode state (setup, playing, ended)

### Requirement 11: Game Over Conditions

**User Story:** As a player, I want the game to end when I lose my Xe or reach turn limit, so that I know when the game is finished.

#### Acceptance Criteria

1. WHEN the Player_Xe is captured, THE Game_System SHALL end the game with defeat status
2. WHEN turn count reaches 200, THE Game_System SHALL end the game with draw status
3. IF the Player_Xe is under attack with no escape moves, THEN THE Game_System SHALL end the game with defeat status
4. WHEN the game ends, THE Game_System SHALL display final score and game result
5. WHEN the game ends, THE Game_System SHALL send game data to backend API

### Requirement 12: Backend Integration

**User Story:** As a player, I want my game sessions and scores saved to the backend, so that my progress is tracked.

#### Acceptance Criteria

1. WHEN the game starts, THE Game_System SHALL call the start game API endpoint
2. WHEN the game starts, THE Game_System SHALL receive a Game_Session ID from backend
3. WHEN the game ends, THE Game_System SHALL call the end game API endpoint with session ID, score, and duration
4. IF the API call fails, THEN THE Game_System SHALL display an error message
5. THE Game_System SHALL apply premium bonus from user profile to final score

### Requirement 13: Visual Feedback

**User Story:** As a player, I want clear visual feedback for all game actions, so that I understand what is happening.

#### Acceptance Criteria

1. WHEN a piece is selected, THE Game_System SHALL highlight that piece
2. WHEN valid moves are available, THE Game_System SHALL highlight those positions
3. WHEN a piece is captured, THE Game_System SHALL show a capture animation
4. WHEN fire blast activates, THE Game_System SHALL show fire effect animations
5. THE Game_System SHALL display toast messages for important game events
6. THE Game_System SHALL use different colors for player pieces and enemy pieces

### Requirement 14: Game Controls

**User Story:** As a player, I want intuitive controls to play, restart, and end the game, so that I can manage my game session.

#### Acceptance Criteria

1. THE Game_System SHALL provide a "Start Game" button in setup phase
2. THE Game_System SHALL provide a "Play Again" button when game ends
3. THE Game_System SHALL provide an "End Game" button during play phase
4. WHEN the player taps "End Game", THE Game_System SHALL confirm before ending
5. WHEN the player confirms end game, THE Game_System SHALL save results and return to home screen
