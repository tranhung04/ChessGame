/**
 * Master E2E Test Runner
 * Runs all end-to-end integration tests in sequence
 */

const { spawn } = require('child_process');
const path = require('path');

const tests = [
  {
    name: 'Complete User Journey',
    file: 'test-e2e-user-journey.js',
    description: 'Register → Login → Play Game → Submit Score → View Leaderboard'
  },
  {
    name: 'Premium Purchase Flow',
    file: 'test-e2e-premium-purchase.js',
    description: 'Login → Shop → Buy Premium → Payment → Verify Premium Active'
  },
  {
    name: 'Offline Mode',
    file: 'test-e2e-offline-mode.js',
    description: 'Play offline → Verify gameplay → Sync when online'
  },
  {
    name: 'Error Scenarios',
    file: 'test-e2e-error-scenarios.js',
    description: 'Network failures, Invalid inputs, Token expiration, Payment failures'
  }
];

function runTest(testFile) {
  return new Promise((resolve, reject) => {
    const testPath = path.join(__dirname, testFile);
    const child = spawn('node', [testPath], {
      stdio: 'inherit',
      shell: true
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve({ success: true });
      } else {
        resolve({ success: false, code });
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

async function runAllTests() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║         End-to-End Integration Test Suite                 ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('\nRunning all E2E tests...\n');

  const results = [];
  let totalPassed = 0;
  let totalFailed = 0;

  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Test ${i + 1}/${tests.length}: ${test.name}`);
    console.log(`Description: ${test.description}`);
    console.log(`${'='.repeat(60)}\n`);

    try {
      const result = await runTest(test.file);
      results.push({
        name: test.name,
        success: result.success
      });

      if (result.success) {
        totalPassed++;
        console.log(`\n✅ ${test.name} - PASSED\n`);
      } else {
        totalFailed++;
        console.log(`\n❌ ${test.name} - FAILED\n`);
      }
    } catch (error) {
      totalFailed++;
      results.push({
        name: test.name,
        success: false,
        error: error.message
      });
      console.log(`\n❌ ${test.name} - ERROR: ${error.message}\n`);
    }

    // Delay between tests
    if (i < tests.length - 1) {
      console.log('\nWaiting 2 seconds before next test...\n');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // Final Summary
  console.log('\n' + '='.repeat(60));
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║              Final Test Summary                            ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`\nTotal Tests: ${tests.length}`);
  console.log(`Passed: ${totalPassed}`);
  console.log(`Failed: ${totalFailed}`);
  console.log('\nDetailed Results:');
  
  results.forEach((result, index) => {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    console.log(`  ${index + 1}. ${result.name}: ${status}`);
    if (result.error) {
      console.log(`     Error: ${result.error}`);
    }
  });

  console.log(`\nOverall Status: ${totalFailed === 0 ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  console.log('='.repeat(60));

  process.exit(totalFailed === 0 ? 0 : 1);
}

// Run all tests
runAllTests().catch(error => {
  console.error('\n❌ Fatal error running test suite:', error);
  process.exit(1);
});
