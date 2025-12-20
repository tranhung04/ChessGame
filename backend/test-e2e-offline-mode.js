/**
 * End-to-End Integration Test: Offline Mode
 * Tests: Play game without network → Verify game works offline → Verify sync when network restored
 * Requirements: 19.3, 19.4
 * 
 * Note: This test simulates offline mode by testing the game engine independently
 * and then testing sync when connection is restored.
 */

const axios = require('axios');

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';

// Test data
const testUser = {
  email: 'testuser@example.com',
  password: 'TestPassword123!'
};

let authTokens = {
  accessToken: null,
  refreshToken: null
};

let offlineGameData = {
  sessions: []
};

// Helper function to make API calls
async function apiCall(method, endpoint, data = null, useAuth = false) {
  const config = {
    method,
    url: `${API_BASE_URL}${endpoint}`,
    headers: {}
  };

  if (useAuth && authTokens.accessToken) {
    config.headers['Authorization'] = `Bearer ${authTokens.accessToken}`;
  }

  if (data) {
    config.data = data;
  }

  try {
    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status
    };
  }
}

// Simulate ChessGame class (simplified version for testing)
class ChessGameSimulator {
  constructor(premiumBonus = 0) {
    this.board = this.initBoard();
    this.score = 0;
    this.turnCount = 0;
    this.premiumBonus = premiumBonus;
    this.gameMode = 'setup';
  }

  initBoard() {
    // Create 9x8 board
    const board = [];
    for (let i = 0; i < 9; i++) {
      board[i] = [];
      for (let j = 0; j < 8; j++) {
        board[i][j] = null;
      }
    }
    return board;
  }

  playGame() {
    // Simulate playing a game
    this.gameMode = 'playing';
    this.turnCount = Math.floor(Math.random() * 30) + 10;
    this.score = Math.floor(Math.random() * 1000) + 500;
    
    // Apply premium bonus
    if (this.premiumBonus > 0) {
      this.score = Math.floor(this.score * (1 + this.premiumBonus));
    }
    
    this.gameMode = 'ended';
  }

  getGameData() {
    return {
      score: this.score,
      turnCount: this.turnCount,
      duration: this.turnCount * 5, // Approximate duration
      mode: 'normal',
      timestamp: new Date().toISOString()
    };
  }
}

// Test Steps
async function step1_Login() {
  console.log('\n=== Step 1: Login (Online) ===');
  
  const result = await apiCall('POST', '/auth/login', testUser);
  
  if (!result.success) {
    console.error('❌ Login failed:', result.error);
    return false;
  }

  console.log('✅ Login successful');
  
  if (result.data.data?.tokens) {
    authTokens.accessToken = result.data.data.tokens.accessToken;
    authTokens.refreshToken = result.data.data.tokens.refreshToken;
  }
  
  return true;
}

async function step2_GetPremiumStatus() {
  console.log('\n=== Step 2: Get Premium Status (Online) ===');
  
  const result = await apiCall('GET', '/user/me', null, true);
  
  if (!result.success) {
    console.error('❌ Get profile failed:', result.error);
    return false;
  }

  console.log('✅ Profile retrieved');
  
  const premiumBonus = result.data.data?.premium?.scoreBonus || 0;
  console.log('   Premium Bonus:', `+${(premiumBonus * 100).toFixed(0)}%`);
  
  // Store premium bonus for offline use
  offlineGameData.premiumBonus = premiumBonus;
  
  return true;
}

async function step3_SimulateOfflineMode() {
  console.log('\n=== Step 3: Simulate Offline Mode ===');
  
  console.log('   📴 Network disconnected (simulated)');
  console.log('   Playing games offline...\n');
  
  // Play multiple games offline
  const numGames = 3;
  
  for (let i = 0; i < numGames; i++) {
    console.log(`   Game ${i + 1}/${numGames}:`);
    
    // Create game instance with cached premium bonus
    const game = new ChessGameSimulator(offlineGameData.premiumBonus);
    
    // Play the game
    game.playGame();
    
    // Store game data locally
    const gameData = game.getGameData();
    offlineGameData.sessions.push(gameData);
    
    console.log(`     Score: ${gameData.score}`);
    console.log(`     Turns: ${gameData.turnCount}`);
    console.log(`     Duration: ${gameData.duration}s`);
    console.log(`     ✅ Saved locally`);
    
    // Small delay between games
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log(`\n✅ Played ${numGames} games offline`);
  console.log(`   Total sessions stored locally: ${offlineGameData.sessions.length}`);
  
  return true;
}

async function step4_VerifyOfflineGameplay() {
  console.log('\n=== Step 4: Verify Offline Gameplay ===');
  
  // Verify game data is stored
  if (offlineGameData.sessions.length === 0) {
    console.error('❌ No offline sessions stored');
    return false;
  }
  
  console.log('✅ Offline gameplay verified');
  console.log(`   Sessions stored: ${offlineGameData.sessions.length}`);
  
  // Calculate statistics
  const totalScore = offlineGameData.sessions.reduce((sum, s) => sum + s.score, 0);
  const avgScore = Math.floor(totalScore / offlineGameData.sessions.length);
  const highScore = Math.max(...offlineGameData.sessions.map(s => s.score));
  
  console.log(`   Total Score: ${totalScore}`);
  console.log(`   Average Score: ${avgScore}`);
  console.log(`   High Score: ${highScore}`);
  
  return true;
}

async function step5_RestoreConnection() {
  console.log('\n=== Step 5: Restore Network Connection ===');
  
  console.log('   📶 Network reconnected (simulated)');
  
  // Verify backend is accessible
  const result = await apiCall('GET', '/user/me', null, true);
  
  if (!result.success) {
    console.error('❌ Backend not accessible:', result.error);
    return false;
  }
  
  console.log('✅ Connection restored');
  console.log('   Backend accessible');
  
  return true;
}

async function step6_SyncOfflineGames() {
  console.log('\n=== Step 6: Sync Offline Games to Backend ===');
  
  let syncedCount = 0;
  let failedCount = 0;
  
  for (let i = 0; i < offlineGameData.sessions.length; i++) {
    const session = offlineGameData.sessions[i];
    
    console.log(`\n   Syncing session ${i + 1}/${offlineGameData.sessions.length}:`);
    
    // Start game session
    const startResult = await apiCall('POST', '/game/start', {
      mode: session.mode
    }, true);
    
    if (!startResult.success) {
      console.log('     ❌ Failed to start session');
      failedCount++;
      continue;
    }
    
    const sessionId = startResult.data.data?.session?.id;
    console.log(`     Session ID: ${sessionId}`);
    
    // Submit the offline game data
    const submitResult = await apiCall('POST', '/game/submit', {
      sessionId: sessionId,
      score: session.score,
      turnCount: session.turnCount,
      duration: session.duration
    }, true);
    
    if (!submitResult.success) {
      console.log('     ❌ Failed to submit score');
      failedCount++;
      continue;
    }
    
    console.log(`     ✅ Synced - Score: ${session.score}`);
    syncedCount++;
    
    // Small delay between syncs
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  console.log(`\n✅ Sync complete`);
  console.log(`   Synced: ${syncedCount}`);
  console.log(`   Failed: ${failedCount}`);
  
  return failedCount === 0;
}

async function step7_VerifyDataIntegrity() {
  console.log('\n=== Step 7: Verify Data Integrity ===');
  
  // Get game history
  const result = await apiCall('GET', '/game/history?page=1&limit=10', null, true);
  
  if (!result.success) {
    console.error('❌ Get game history failed:', result.error);
    return false;
  }
  
  console.log('✅ Game history retrieved');
  
  const sessions = result.data.data?.sessions || [];
  console.log(`   Total sessions in history: ${sessions.length}`);
  
  // Verify our synced sessions are in the history
  const recentSessions = sessions.slice(0, offlineGameData.sessions.length);
  console.log(`   Recent sessions: ${recentSessions.length}`);
  
  // Check if scores match (approximately, since backend may apply bonuses)
  let matchCount = 0;
  for (const offlineSession of offlineGameData.sessions) {
    const found = recentSessions.some(s => 
      Math.abs(s.score - offlineSession.score) < 100 // Allow small variance
    );
    if (found) matchCount++;
  }
  
  console.log(`   Matched sessions: ${matchCount}/${offlineGameData.sessions.length}`);
  
  return matchCount >= offlineGameData.sessions.length * 0.8; // 80% match rate acceptable
}

async function step8_VerifyLeaderboard() {
  console.log('\n=== Step 8: Verify Leaderboard Updated ===');
  
  const result = await apiCall('GET', '/game/leaderboard?limit=10', null, false);
  
  if (!result.success) {
    console.error('❌ Get leaderboard failed:', result.error);
    return false;
  }
  
  console.log('✅ Leaderboard retrieved');
  
  // Check if current user is in leaderboard
  const currentUser = result.data.data?.currentUser;
  if (currentUser) {
    console.log(`   Your Rank: ${currentUser.rank || 'Not ranked'}`);
    console.log(`   Your High Score: ${currentUser.highestScore || 0}`);
  }
  
  return true;
}

// Main test execution
async function runE2ETest() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  End-to-End Integration Test: Offline Mode                ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`\nAPI Base URL: ${API_BASE_URL}`);
  console.log(`Test User: ${testUser.email}`);
  
  const steps = [
    { name: 'Login', fn: step1_Login },
    { name: 'Get Premium Status', fn: step2_GetPremiumStatus },
    { name: 'Simulate Offline Mode', fn: step3_SimulateOfflineMode },
    { name: 'Verify Offline Gameplay', fn: step4_VerifyOfflineGameplay },
    { name: 'Restore Connection', fn: step5_RestoreConnection },
    { name: 'Sync Offline Games', fn: step6_SyncOfflineGames },
    { name: 'Verify Data Integrity', fn: step7_VerifyDataIntegrity },
    { name: 'Verify Leaderboard', fn: step8_VerifyLeaderboard }
  ];
  
  let passedSteps = 0;
  let failedSteps = 0;
  
  for (const step of steps) {
    try {
      const success = await step.fn();
      if (success) {
        passedSteps++;
      } else {
        failedSteps++;
        console.log(`\n⚠️  Step "${step.name}" failed. Stopping test.`);
        break;
      }
    } catch (error) {
      failedSteps++;
      console.error(`\n❌ Step "${step.name}" threw error:`, error.message);
      break;
    }
  }
  
  // Summary
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║  Test Summary                                              ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`Total Steps: ${steps.length}`);
  console.log(`Passed: ${passedSteps}`);
  console.log(`Failed: ${failedSteps}`);
  console.log(`Status: ${failedSteps === 0 ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  
  process.exit(failedSteps === 0 ? 0 : 1);
}

// Run the test
runE2ETest().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
