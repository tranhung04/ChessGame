// Environment Configuration
const ENV = {
  dev: {
    // IMPORTANT: Replace 10.66.214.152 with your computer's IP address
    // Run 'ipconfig' in Command Prompt to find your IPv4 Address
    // Make sure your phone and computer are on the same WiFi network
    API_BASE_URL: 'http://10.66.214.152:3000/api',
    GOOGLE_WEB_CLIENT_ID: '798352030632-tciovhpq6k065mnljb9a8i8v58cc39vr.apps.googleusercontent.com',
  },
  staging: {
    API_BASE_URL: 'https://staging-api.toolchess.com/api',
    GOOGLE_WEB_CLIENT_ID: '798352030632-tciovhpq6k065mnljb9a8i8v58cc39vr.apps.googleusercontent.com',
  },
  prod: {
    API_BASE_URL: 'https://api.toolchess.com/api',
    GOOGLE_WEB_CLIENT_ID: '798352030632-tciovhpq6k065mnljb9a8i8v58cc39vr.apps.googleusercontent.com',
  }
};

// Get current environment
const getEnvVars = () => {
  if (__DEV__) {
    return ENV.dev;
  }
  // You can add logic to detect staging vs prod
  // For now, non-dev builds use prod
  return ENV.prod;
};

const currentEnv = getEnvVars();

// API Configuration
export const API_BASE_URL = currentEnv.API_BASE_URL;

// Google OAuth Configuration
export const GOOGLE_WEB_CLIENT_ID = currentEnv.GOOGLE_WEB_CLIENT_ID;

// AsyncStorage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: '@toolchess_access_token',
  REFRESH_TOKEN: '@toolchess_refresh_token',
  USER_DATA: '@toolchess_user_data'
};

// Game Configuration
export const GAME_CONFIG = {
  BOARD_SIZE: 10,
  FIRE_MODE_TURNS: 3,
  PIECE_VALUES: {
    'tot': 1,
    'si': 1,
    'tuong': 2,
    'ma': 3,
    'phao': 3,
    'xe-dich': 5,
    'tuong-dich': 10,
    'xe': 0
  }
};

// Colors
export const COLORS = {
  primary: '#8B4513',
  secondary: '#FFD700',
  background: '#FFF8DC',
  text: '#333',
  textLight: '#666',
  error: '#DC3545',
  success: '#28A745',
  warning: '#FFC107',
  white: '#FFFFFF',
  black: '#000000',
  boardLight: '#F5DEB3',
  boardDark: '#CD853F',
  enemy: '#FF6347',
  player: '#4682B4'
};

