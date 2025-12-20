/**
 * Game Engine Constants
 * Piece types, values, and board configuration
 */

// Piece type constants
export const PIECE_TYPES = {
  XE: 'xe',                    // Player Rook
  TOT: 'tot',                  // Pawn
  SI: 'si',                    // Advisor
  TUONG: 'tuong',              // Elephant
  MA: 'ma',                    // Horse
  PHAO: 'phao',                // Cannon
  XE_DICH: 'xe-dich',          // Enemy Rook
  TUONG_DICH: 'tuong-dich'     // Enemy General
};

// Piece values for scoring
// Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7
export const PIECE_VALUES = {
  [PIECE_TYPES.TOT]: 1,
  [PIECE_TYPES.SI]: 1,
  [PIECE_TYPES.TUONG]: 2,
  [PIECE_TYPES.MA]: 3,
  [PIECE_TYPES.PHAO]: 3,
  [PIECE_TYPES.XE_DICH]: 5,
  [PIECE_TYPES.TUONG_DICH]: 10,
  [PIECE_TYPES.XE]: 0
};

// Board configuration
// Requirements: 1.1
export const BOARD_CONFIG = {
  ROWS: 9,
  COLS: 8
};

// Movement directions
export const DIRECTIONS = {
  STRAIGHT: [
    [-1, 0],  // Up
    [1, 0],   // Down
    [0, -1],  // Left
    [0, 1]    // Right
  ],
  DIAGONAL: [
    [-1, -1], // Up-Left
    [-1, 1],  // Up-Right
    [1, -1],  // Down-Left
    [1, 1]    // Down-Right
  ],
  ALL: [
    [-1, 0],  // Up
    [1, 0],   // Down
    [0, -1],  // Left
    [0, 1],   // Right
    [-1, -1], // Up-Left
    [-1, 1],  // Up-Right
    [1, -1],  // Down-Left
    [1, 1]    // Down-Right
  ],
  HORSE: [
    [-2, -1], [-2, 1],  // Up moves
    [-1, -2], [-1, 2],  // Side moves
    [1, -2], [1, 2],    // Side moves
    [2, -1], [2, 1]     // Down moves
  ]
};

// Game configuration
export const GAME_CONFIG = {
  MAX_TURNS: 200,              // Maximum turns before draw
  FIRE_MODE_SCORE_MULTIPLIER: 2, // Double score for fire blast
  TRAP_WARNING_TURNS: 10       // Show trap warnings for first 10 turns
};

// Piece introduction schedule
// Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7
export const PIECE_SCHEDULE = {
  [PIECE_TYPES.TOT]: 1,
  [PIECE_TYPES.SI]: 5,
  [PIECE_TYPES.TUONG]: 15,
  [PIECE_TYPES.MA]: 20,
  [PIECE_TYPES.TUONG_DICH]: 22, // And every 15 turns after (if 2 Sĩ exist)
  [PIECE_TYPES.PHAO]: 30,
  [PIECE_TYPES.XE_DICH]: 35
};

// Turn interval for Tướng địch spawning
export const TUONG_DICH_SPAWN_INTERVAL = 15;
export const TUONG_DICH_REQUIRED_SI_COUNT = 2;
