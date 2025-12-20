/**
 * End-to-End Integration Test: Complete User Journey
 * Tests: Register → Login → Play Game → Submit Score → View Leaderboard
 * Requirements: 22.1-22.3
 */

const axios = require('axios');

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';
const TEST_USER_PREFIX = `e2e_test_${Date.now()}`;

// Test data
let testUser = {
  username: `${TEST_USER_PREFIX}_user`,
  email: `${TEST_USER_PREFIX}@test.com`,
  password: 'TestPassword123!'
};

let authTokens = {
  accessToken: null,
  refreshToken: null
};

let gameSession = {
  sessionId: null,
  score: 0
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

// Test Steps
async function step1_Register() {
  console.log('\n=== Step 1: Register New User ===');
  
  const result = await apiCall('POST', '/auth/register', testUser);
  
  if (!result.success) {
    console.error('❌ Registration failed:', result.error);
    return false;
  }

  console.log('✅ Registration successful');
  console.log('   User ID:', result.data.data?.user?.id);
  console.log('   Username:', result.data.data?.user?.username);
  
  // Store tokens from registration
  if (result.data.data?.tokens) {
    authTokens.accessToken = result.data.data.tokens.accessToken;
    authTokens.refreshToken = result.data.data.tokens.refreshToken;
    console.log('   Tokens received');
  }
  
  return true;
}

async function step2_Login() {
  console.log('\n=== Step 2: Login with Credentials ===');
  
  const result = await apiCall('POST', '/auth/login', {
    email: testUser.email,
    password: testUser.password
  });
  
  if (!result.success) {
    console.error('❌ Login failed:', result.error);
    return false;
  }

  console.log('✅ Login successful');
  
  // Update tokens from login
  if (result.data.data?.tokens) {
    authTokens.accessToken = result.data.data.tokens.accessToken;
    authTokens.refreshToken = result.data.data.tokens.refreshToken;
    console.log('   New tokens received');
  }
  
  // Verify user data
  if (result.data.data?.user) {
    console.log('   User:', result.data.data.user.username);
    console.log('   Email:', result.data.data.user.email);
  }
  
  return true;
}

async function step3_GetProfile() {
  console.log('\n=== Step 3: Get User Profile ===');
  
  const result = await apiCall('GET', '/user/me', null, true);
  
  if (!result.success) {
    console.error('❌ Get profile failed:', result.error);
    return false;
  }

  console.log('✅ Profile retrieved');
  console.log('   Username:', result.data.data?.username);
  console.log('   Total Games:', result.data.data?.stats?.totalGames || 0);
  console.log('   Highest Score:', result.data.data?.stats?.highestScore || 0);
  console.log('   Premium:', result.data.data?.premium?.isActive ? 'Active' : 'Inactive');
  
  return true;
}

async function step4_StartGame() {
  console.log('\n=== Step 4: Start Game Session ===');
  
  const result = await apiCall('POST', '/game/start', {
    mode: 'normal'
  }, true);
  
  if (!result.success) {
    console.error('❌ Start game failed:', result.error);
    return false;
  }

  console.log('✅ Game session started');
  
  if (result.data.data?.session) {
    gameSession.sessionId = result.data.data.session.id;
    console.log('   Session ID:', gameSession.sessionId);
    console.log('   Mode:', result.data.data.session.mode);
    console.log('   Premium Applied:', result.data.data.session.premiumApplied);
  }
  
  return true;
}

async function step5_PlayGame() {
  console.log('\n=== Step 5: Simulate Game Play ===');
  
  // Simulate playing the game
  console.log('   Simulating game play...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Generate a realistic score
  gameSession.score = Math.floor(Math.random() * 1000) + 500;
  console.log('✅ Game played');
  console.log('   Score achieved:', gameSession.score);
  
  return true;
}

async function step6_SubmitScore() {
  console.log('\n=== Step 6: Submit Game Score ===');
  
  const result = await apiCall('POST', '/game/submit', {
    sessionId: gameSession.sessionId,
    score: gameSession.score,
    turnCount: 25,
    duration: 120
  }, true);
  
  if (!result.success) {
    console.error('❌ Submit score failed:', result.error);
    return false;
  }

  console.log('✅ Score submitted');
  
  if (result.data.data?.session) {
    console.log('   Base Score:', result.data.data.session.score);
    console.log('   Final Score:', result.data.data.session.finalScore);
    console.log('   Rank:', result.data.data.session.rank || 'N/A');
    console.log('   New High Score:', result.data.data.session.isNewHighScore ? 'Yes' : 'No');
  }
  
  return true;
}

async function step7_ViewGameHistory() {
  console.log('\n=== Step 7: View Game History ===');
  
  const result = await apiCall('GET', '/game/history?page=1&limit=5', null, true);
  
  if (!result.success) {
    console.error('❌ Get game history failed:', result.error);
    return false;
  }

  console.log('✅ Game history retrieved');
  
  if (result.data.data?.sessions) {
    console.log('   Total Sessions:', result.data.data.sessions.length);
    console.log('   Latest Session Score:', result.data.data.sessions[0]?.score || 'N/A');
  }
  
  return true;
}

async function step8_ViewLeaderboard() {
  console.log('\n=== Step 8: View Leaderboard ===');
  
  const result = await apiCall('GET', '/game/leaderboard?limit=10', null, false);
  
  if (!result.success) {
    console.error('❌ Get leaderboard failed:', result.error);
    return false;
  }

  console.log('✅ Leaderboard retrieved');
  
  if (result.data.data?.leaderboard) {
    console.log('   Total Players:', result.data.data.leaderboard.length);
    if (result.data.data.leaderboard.length > 0) {
      const topPlayer = result.data.data.leaderboard[0];
      console.log('   Top Player:', topPlayer.username);
      console.log('   Top Score:', topPlayer.highestScore);
    }
  }
  
  if (result.data.data?.currentUser) {
    console.log('   Your Rank:', result.data.data.currentUser.rank || 'Not ranked');
    console.log('   Your High Score:', result.data.data.currentUser.highestScore || 0);
  }
  
  return true;
}

async function step9_Logout() {
  console.log('\n=== Step 9: Logout ===');
  
  const result = await apiCall('POST', '/auth/logout', {
    refreshToken: authTokens.refreshToken
  }, true);
  
  if (!result.success) {
    console.error('❌ Logout failed:', result.error);
    return false;
  }

  console.log('✅ Logout successful');
  
  // Clear tokens
  authTokens.accessToken = null;
  authTokens.refreshToken = null;
  
  return true;
}

// Main test execution
async function runE2ETest() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  End-to-End Integration Test: Complete User Journey       ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`\nAPI Base URL: ${API_BASE_URL}`);
  console.log(`Test User: ${testUser.username}`);
  
  const steps = [
    { name: 'Register', fn: step1_Register },
    { name: 'Login', fn: step2_Login },
    { name: 'Get Profile', fn: step3_GetProfile },
    { name: 'Start Game', fn: step4_StartGame },
    { name: 'Play Game', fn: step5_PlayGame },
    { name: 'Submit Score', fn: step6_SubmitScore },
    { name: 'View History', fn: step7_ViewGameHistory },
    { name: 'View Leaderboard', fn: step8_ViewLeaderboard },
    { name: 'Logout', fn: step9_Logout }
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
