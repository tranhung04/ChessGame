/**
 * Frontend Setup Verification Script
 * Verifies that all required files and configurations are in place
 */

const fs = require('fs');
const path = require('path');

console.log('=== Frontend Setup Verification ===\n');

let allChecksPass = true;

// Check function
function checkFile(filePath, description) {
  const fullPath = path.join(__dirname, filePath);
  const exists = fs.existsSync(fullPath);
  const status = exists ? '✓' : '✗';
  console.log(`${status} ${description}`);
  if (!exists) {
    console.log(`  Missing: ${filePath}`);
    allChecksPass = false;
  }
  return exists;
}

function checkDirectory(dirPath, description) {
  const fullPath = path.join(__dirname, dirPath);
  const exists = fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory();
  const status = exists ? '✓' : '✗';
  console.log(`${status} ${description}`);
  if (!exists) {
    console.log(`  Missing: ${dirPath}`);
    allChecksPass = false;
  }
  return exists;
}

// 1. Core Files
console.log('--- Core Files ---');
checkFile('package.json', 'package.json exists');
checkFile('App.js', 'App.js exists');
checkFile('index.js', 'index.js exists');
checkFile('app.json', 'app.json exists');

// 2. Configuration
console.log('\n--- Configuration ---');
checkFile('src/config/constants.js', 'Constants configuration');

// 3. Context
console.log('\n--- Context ---');
checkFile('src/context/AuthContext.js', 'AuthContext');

// 4. Services
console.log('\n--- Services ---');
checkFile('src/services/api.js', 'API client');
checkFile('src/services/googleAuth.js', 'Google Auth service');

// 5. Navigation
console.log('\n--- Navigation ---');
checkFile('src/navigation/AppNavigator.js', 'App Navigator');

// 6. Game Engine
console.log('\n--- Game Engine ---');
checkFile('src/game/ChessGame.js', 'ChessGame module');
checkFile('src/game/EnemyAI.js', 'EnemyAI module');
checkFile('src/game/constants.js', 'Game constants');
checkFile('src/game/index.js', 'Game module exports');

// 7. Game Tests
console.log('\n--- Game Tests ---');
checkFile('src/game/__tests__/ChessGame.test.js', 'ChessGame unit tests');
checkFile('src/game/__tests__/manual-test.js', 'Manual test suite');
checkFile('src/game/__tests__/verify-game-flow.js', 'Game flow verification');

// 8. Auth Screens
console.log('\n--- Auth Screens ---');
checkFile('src/screens/Auth/LoginScreen.js', 'LoginScreen');
checkFile('src/screens/Auth/RegisterScreen.js', 'RegisterScreen');

// 9. Main Screens
console.log('\n--- Main Screens ---');
checkFile('src/screens/Home/HomeScreen.js', 'HomeScreen');
checkFile('src/screens/Game/GameScreen.js', 'GameScreen');
checkFile('src/screens/Shop/ShopScreen.js', 'ShopScreen');
checkFile('src/screens/Profile/ProfileScreen.js', 'ProfileScreen');
checkFile('src/screens/Leaderboard/LeaderboardScreen.js', 'LeaderboardScreen');
checkFile('src/screens/History/HistoryScreen.js', 'HistoryScreen');
checkFile('src/screens/Transactions/TransactionsScreen.js', 'TransactionsScreen');

// 10. Game Components
console.log('\n--- Game Components ---');
checkFile('src/screens/Game/components/ChessBoard.js', 'ChessBoard component');
checkFile('src/screens/Game/components/ChessPiece.js', 'ChessPiece component');
checkFile('src/screens/Game/components/GameControls.js', 'GameControls component');
checkFile('src/screens/Game/components/GameInfo.js', 'GameInfo component');
checkFile('src/screens/Game/components/Toast.js', 'Toast component');
checkFile('src/screens/Game/components/index.js', 'Component exports');

// 11. Dependencies Check
console.log('\n--- Dependencies Check ---');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredDeps = [
    'expo',
    'react',
    'react-native',
    '@react-navigation/native',
    '@react-navigation/stack',
    '@react-navigation/bottom-tabs',
    'axios',
    'expo-secure-store',
    'react-native-svg',
    'react-native-webview'
  ];

  requiredDeps.forEach(dep => {
    const exists = packageJson.dependencies && packageJson.dependencies[dep];
    const status = exists ? '✓' : '✗';
    console.log(`${status} ${dep}`);
    if (!exists) {
      allChecksPass = false;
    }
  });
} catch (error) {
  console.log('✗ Error reading package.json');
  allChecksPass = false;
}

// 12. Test Documentation
console.log('\n--- Test Documentation ---');
checkFile('FRONTEND_TEST_CHECKLIST.md', 'Test checklist document');
checkFile('FRONTEND_TEST_EXECUTION.md', 'Test execution report');

// Summary
console.log('\n=== Summary ===');
if (allChecksPass) {
  console.log('✓ All checks passed! Frontend is properly set up.');
  console.log('\nNext steps:');
  console.log('1. Run automated tests: node src/game/__tests__/manual-test.js');
  console.log('2. Start the app: npm start');
  console.log('3. Run on Android: npm run android');
  console.log('4. Run on iOS: npm run ios');
  console.log('5. Perform manual testing using FRONTEND_TEST_CHECKLIST.md');
  process.exit(0);
} else {
  console.log('✗ Some checks failed. Please review the missing files above.');
  process.exit(1);
}
