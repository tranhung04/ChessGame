/**
 * Game Session Management Test Script
 * Tests game session creation, submission, history, and leaderboard
 */

const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

// Test user credentials
const testUser = {
  email: 'gametest@example.com',
  password: 'TestPassword123!'
};

let authToken = null;
let sessionId = null;

/**
 * Register a test user if needed
 */
async function registerTestUser() {
  try {
    console.log('\n=== Registering Test User ===');
    const response = await axios.post(`${API_BASE_URL}/api/auth/register`, {
      username: 'gametest',
      email: 'gametest@example.com',
      password: 'TestPassword123!'
    });
    
    if (response.data.success) {
      console.log('✓ Test user registered');
      return true;
    }
  } catch (error) {
    if (error.response?.data?.error?.code === 'DUPLICATE_EMAIL') {
      console.log('✓ Test user already exists');
      return true;
    }
    console.error('✗ Registration failed:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Login to get auth token
 */
async function login() {
  try {
    console.log('\n=== Testing Login ===');
    const response = await axios.post(`${API_BASE_URL}/api/auth/login`, testUser);
    
    if (response.data.success) {
      authToken = response.data.data.tokens.accessToken;
      console.log('✓ Login successful');
      console.log('  User:', response.data.data.user.username);
      console.log('  Premium:', response.data.data.user.premium?.isActive ? 'Active' : 'Inactive');
      return true;
    }
  } catch (error) {
    console.error('✗ Login failed:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Test starting a game session
 */
async function testStartGame() {
  try {
    console.log('\n=== Testing Start Game ===');
    const response = await axios.post(
      `${API_BASE_URL}/api/game/start`,
      { mode: 'normal' },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    if (response.data.success) {
      sessionId = response.data.data.session.id;
      console.log('✓ Game session started');
      console.log('  Session ID:', sessionId);
      console.log('  Mode:', response.data.data.session.mode);
      console.log('  Premium Applied:', response.data.data.session.premiumApplied);
      console.log('  Score Bonus:', response.data.data.session.scoreBonus);
      return true;
    }
  } catch (error) {
    console.error('✗ Start game failed:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Test submitting a game
 */
async function testSubmitGame() {
  try {
    console.log('\n=== Testing Submit Game ===');
    
    // Simulate a game with some score
    const gameData = {
      sessionId: sessionId,
      score: 250,
      turnCount: 2, // Match the number of moves
      duration: 120, // 2 minutes
      moves: [
        { from: [0, 0], to: [0, 1], pieceType: 'xe', captured: null, scoreGained: 0 },
        { from: [0, 1], to: [1, 1], pieceType: 'xe', captured: 'tot', scoreGained: 10 }
      ]
    };
    
    const response = await axios.post(
      `${API_BASE_URL}/api/game/submit`,
      gameData,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    if (response.data.success) {
      console.log('✓ Game submitted successfully');
      console.log('  Score:', response.data.data.session.score);
      console.log('  Final Score:', response.data.data.session.finalScore);
      console.log('  Rank:', response.data.data.session.rank);
      console.log('  New High Score:', response.data.data.session.isNewHighScore);
      return true;
    }
  } catch (error) {
    console.error('✗ Submit game failed:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Test getting game history
 */
async function testGetHistory() {
  try {
    console.log('\n=== Testing Get Game History ===');
    const response = await axios.get(
      `${API_BASE_URL}/api/game/history?page=1&limit=5`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    if (response.data.success) {
      console.log('✓ Game history retrieved');
      console.log('  Total Games:', response.data.data.pagination.total);
      console.log('  Page:', response.data.data.pagination.page);
      console.log('  Recent Sessions:');
      response.data.data.sessions.slice(0, 3).forEach((session, index) => {
        console.log(`    ${index + 1}. Score: ${session.finalScore}, Turns: ${session.turnCount}, Mode: ${session.mode}`);
      });
      return true;
    }
  } catch (error) {
    console.error('✗ Get history failed:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Test getting leaderboard
 */
async function testGetLeaderboard() {
  try {
    console.log('\n=== Testing Get Leaderboard ===');
    const response = await axios.get(
      `${API_BASE_URL}/api/game/leaderboard?limit=10&period=all`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    if (response.data.success) {
      console.log('✓ Leaderboard retrieved');
      console.log('  Top Players:');
      response.data.data.leaderboard.slice(0, 5).forEach((player) => {
        const premiumBadge = player.isPremium ? `[${player.premiumPackage}]` : '';
        console.log(`    ${player.rank}. ${player.username} ${premiumBadge} - ${player.highestScore} points (${player.totalGames} games)`);
      });
      
      if (response.data.data.currentUser) {
        console.log('  Current User Stats:');
        console.log('    Highest Score:', response.data.data.currentUser.highestScore);
        console.log('    Total Games:', response.data.data.currentUser.totalGames);
      }
      return true;
    }
  } catch (error) {
    console.error('✗ Get leaderboard failed:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Test getting user statistics
 */
async function testGetStats() {
  try {
    console.log('\n=== Testing Get User Statistics ===');
    const response = await axios.get(
      `${API_BASE_URL}/api/game/stats`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    if (response.data.success) {
      console.log('✓ User statistics retrieved');
      console.log('  Total Games:', response.data.data.stats.totalGames);
      console.log('  Highest Score:', response.data.data.stats.highestScore);
      console.log('  Average Score:', response.data.data.stats.averageScore);
      return true;
    }
  } catch (error) {
    console.error('✗ Get stats failed:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Test getting session details
 */
async function testGetSession() {
  try {
    console.log('\n=== Testing Get Session Details ===');
    const response = await axios.get(
      `${API_BASE_URL}/api/game/session/${sessionId}`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    if (response.data.success) {
      console.log('✓ Session details retrieved');
      console.log('  Session ID:', response.data.data.session.id);
      console.log('  Mode:', response.data.data.session.mode);
      console.log('  Score:', response.data.data.session.score);
      console.log('  Final Score:', response.data.data.session.finalScore);
      console.log('  Duration:', response.data.data.session.duration, 'seconds');
      return true;
    }
  } catch (error) {
    console.error('✗ Get session failed:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Test invalid score submission (anti-cheat)
 */
async function testInvalidScore() {
  try {
    console.log('\n=== Testing Invalid Score (Anti-Cheat) ===');
    
    // Start a new session
    const startResponse = await axios.post(
      `${API_BASE_URL}/api/game/start`,
      { mode: 'normal' },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    const testSessionId = startResponse.data.data.session.id;
    
    // Try to submit an impossibly high score
    const gameData = {
      sessionId: testSessionId,
      score: 999999,
      turnCount: 5,
      duration: 10
    };
    
    try {
      await axios.post(
        `${API_BASE_URL}/api/game/submit`,
        gameData,
        {
          headers: { Authorization: `Bearer ${authToken}` }
        }
      );
      console.log('✗ Anti-cheat failed - invalid score was accepted');
      return false;
    } catch (error) {
      if (error.response?.data?.error?.code === 'INVALID_SCORE') {
        console.log('✓ Anti-cheat working - invalid score rejected');
        console.log('  Error:', error.response.data.error.message);
        return true;
      } else {
        console.error('✗ Unexpected error:', error.response?.data || error.message);
        return false;
      }
    }
  } catch (error) {
    console.error('✗ Test invalid score failed:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Test rate limiting
 */
async function testRateLimit() {
  try {
    console.log('\n=== Testing Rate Limiting ===');
    console.log('  Attempting to start 12 games rapidly...');
    
    let successCount = 0;
    let rateLimitedCount = 0;
    
    for (let i = 0; i < 12; i++) {
      try {
        await axios.post(
          `${API_BASE_URL}/api/game/start`,
          { mode: 'normal' },
          {
            headers: { Authorization: `Bearer ${authToken}` }
          }
        );
        successCount++;
      } catch (error) {
        if (error.response?.status === 429) {
          rateLimitedCount++;
        }
      }
    }
    
    console.log(`  Successful: ${successCount}, Rate Limited: ${rateLimitedCount}`);
    
    if (rateLimitedCount > 0) {
      console.log('✓ Rate limiting is working');
      return true;
    } else {
      console.log('⚠ Rate limiting may not be working as expected');
      return false;
    }
  } catch (error) {
    console.error('✗ Test rate limit failed:', error.message);
    return false;
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('===========================================');
  console.log('  Game Session Management Test Suite');
  console.log('===========================================');
  console.log('API Base URL:', API_BASE_URL);
  
  const results = {
    passed: 0,
    failed: 0
  };
  
  // Register test user if needed
  await registerTestUser();
  
  // Login first
  if (!await login()) {
    console.log('\n✗ Cannot proceed without login');
    return;
  }
  
  // Run tests
  const tests = [
    { name: 'Start Game', fn: testStartGame },
    { name: 'Submit Game', fn: testSubmitGame },
    { name: 'Get History', fn: testGetHistory },
    { name: 'Get Leaderboard', fn: testGetLeaderboard },
    { name: 'Get Stats', fn: testGetStats },
    { name: 'Get Session', fn: testGetSession },
    { name: 'Invalid Score', fn: testInvalidScore },
    { name: 'Rate Limiting', fn: testRateLimit }
  ];
  
  for (const test of tests) {
    const result = await test.fn();
    if (result) {
      results.passed++;
    } else {
      results.failed++;
    }
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Summary
  console.log('\n===========================================');
  console.log('  Test Summary');
  console.log('===========================================');
  console.log(`Total Tests: ${results.passed + results.failed}`);
  console.log(`Passed: ${results.passed}`);
  console.log(`Failed: ${results.failed}`);
  console.log('===========================================\n');
}

// Run tests
runTests().catch(console.error);
