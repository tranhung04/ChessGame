/**
 * Security Audit Script
 * Checks for common security issues in the codebase
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const issues = [];
const warnings = [];
const passed = [];

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function addIssue(category, message, severity = 'high') {
  issues.push({ category, message, severity });
}

function addWarning(category, message) {
  warnings.push({ category, message });
}

function addPassed(category, message) {
  passed.push({ category, message });
}

/**
 * Check for hardcoded secrets in code files
 */
function checkHardcodedSecrets() {
  log('\n🔍 Checking for hardcoded secrets...', 'cyan');
  
  const secretPatterns = [
    { pattern: /password\s*=\s*['"][^'"]+['"]/gi, name: 'Hardcoded password' },
    { pattern: /api[_-]?key\s*=\s*['"][^'"]+['"]/gi, name: 'Hardcoded API key' },
    { pattern: /secret\s*=\s*['"][^'"]+['"]/gi, name: 'Hardcoded secret' },
    { pattern: /token\s*=\s*['"][^'"]+['"]/gi, name: 'Hardcoded token' },
    { pattern: /Bearer\s+[A-Za-z0-9\-._~+\/]+=*/g, name: 'Hardcoded Bearer token' }
  ];

  const filesToCheck = [
    'src/app.js',
    'src/config/database.js',
    'src/services/authService.js',
    'src/services/tokenService.js',
    'src/services/vnpayService.js',
    'src/services/emailService.js'
  ];

  let foundSecrets = false;

  filesToCheck.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (!fs.existsSync(filePath)) return;

    const content = fs.readFileSync(filePath, 'utf8');
    
    secretPatterns.forEach(({ pattern, name }) => {
      const matches = content.match(pattern);
      if (matches) {
        // Filter out false positives (process.env references)
        const realMatches = matches.filter(m => !m.includes('process.env'));
        if (realMatches.length > 0) {
          addIssue('Hardcoded Secrets', `${name} found in ${file}`, 'critical');
          foundSecrets = true;
        }
      }
    });
  });

  if (!foundSecrets) {
    addPassed('Hardcoded Secrets', 'No hardcoded secrets found in code files');
  }
}

/**
 * Check .env file for weak secrets
 */
function checkEnvSecrets() {
  log('\n🔍 Checking .env file for weak secrets...', 'cyan');
  
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    addWarning('Environment', '.env file not found');
    return;
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  
  // Check for weak JWT secrets
  if (envContent.includes('JWT_ACCESS_SECRET=toolchess_access_secret_key_dev_2024')) {
    addIssue('Weak Secrets', 'JWT_ACCESS_SECRET is using default/weak value', 'high');
  }
  
  if (envContent.includes('JWT_REFRESH_SECRET=toolchess_refresh_secret_key_dev_2024')) {
    addIssue('Weak Secrets', 'JWT_REFRESH_SECRET is using default/weak value', 'high');
  }

  // Check for weak database password
  if (envContent.match(/DB_PASSWORD=(123456|password|admin|root)/i)) {
    addIssue('Weak Secrets', 'Database password is too weak', 'high');
  }

  // Check for placeholder VNPay credentials
  if (envContent.includes('VNPAY_TMN_CODE=your_vnpay_tmn_code')) {
    addWarning('Configuration', 'VNPay TMN code is using placeholder value');
  }

  if (envContent.includes('VNPAY_HASH_SECRET=your_vnpay_hash_secret')) {
    addWarning('Configuration', 'VNPay hash secret is using placeholder value');
  }

  addPassed('Environment', '.env file checked for weak secrets');
}

/**
 * Check CORS configuration
 */
function checkCORS() {
  log('\n🔍 Checking CORS configuration...', 'cyan');
  
  const appPath = path.join(__dirname, 'src/app.js');
  if (!fs.existsSync(appPath)) {
    addWarning('CORS', 'app.js not found');
    return;
  }

  const content = fs.readFileSync(appPath, 'utf8');
  
  // Check for wildcard CORS
  if (content.includes("origin: '*'") || content.includes('origin:"*"')) {
    addIssue('CORS', 'CORS is configured to allow all origins (*)', 'medium');
  } else if (content.includes('process.env.CORS_ORIGIN')) {
    addPassed('CORS', 'CORS is configured using environment variable');
  } else {
    addWarning('CORS', 'CORS configuration not found or unclear');
  }

  // Check for credentials
  if (content.includes('credentials: true')) {
    addPassed('CORS', 'CORS credentials enabled for authenticated requests');
  }
}

/**
 * Check rate limiting configuration
 */
function checkRateLimiting() {
  log('\n🔍 Checking rate limiting...', 'cyan');
  
  const rateLimiterPath = path.join(__dirname, 'src/middleware/rateLimiter.js');
  if (!fs.existsSync(rateLimiterPath)) {
    addIssue('Rate Limiting', 'Rate limiter middleware not found', 'high');
    return;
  }

  const content = fs.readFileSync(rateLimiterPath, 'utf8');
  
  // Check for auth rate limiter
  if (content.includes('authLimiter')) {
    addPassed('Rate Limiting', 'Auth rate limiter configured');
  } else {
    addIssue('Rate Limiting', 'Auth rate limiter not found', 'medium');
  }

  // Check for payment rate limiter
  if (content.includes('paymentLimiter')) {
    addPassed('Rate Limiting', 'Payment rate limiter configured');
  } else {
    addIssue('Rate Limiting', 'Payment rate limiter not found', 'medium');
  }

  // Check for game submission rate limiter
  if (content.includes('gameSubmitLimiter')) {
    addPassed('Rate Limiting', 'Game submission rate limiter configured');
  } else {
    addWarning('Rate Limiting', 'Game submission rate limiter not found');
  }
}

/**
 * Check SQL injection prevention
 */
function checkSQLInjection() {
  log('\n🔍 Checking SQL injection prevention...', 'cyan');
  
  const repoFiles = fs.readdirSync(path.join(__dirname, 'src/repositories'));
  
  let foundIssues = false;
  
  repoFiles.forEach(file => {
    const filePath = path.join(__dirname, 'src/repositories', file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for string concatenation in SQL queries
    const dangerousPatterns = [
      /query\s*=\s*`[^`]*\$\{[^}]+\}[^`]*`/g,
      /query\s*=\s*"[^"]*"\s*\+/g,
      /query\s*=\s*'[^']*'\s*\+/g
    ];
    
    dangerousPatterns.forEach(pattern => {
      if (pattern.test(content)) {
        // Check if it's using parameterized queries
        if (!content.includes('.input(')) {
          addIssue('SQL Injection', `Potential SQL injection in ${file}`, 'critical');
          foundIssues = true;
        }
      }
    });
  });

  if (!foundIssues) {
    addPassed('SQL Injection', 'All repositories use parameterized queries');
  }
}

/**
 * Check authentication middleware
 */
function checkAuthentication() {
  log('\n🔍 Checking authentication middleware...', 'cyan');
  
  const authPath = path.join(__dirname, 'src/middleware/auth.js');
  if (!fs.existsSync(authPath)) {
    addIssue('Authentication', 'Authentication middleware not found', 'critical');
    return;
  }

  const content = fs.readFileSync(authPath, 'utf8');
  
  // Check for JWT verification
  if (content.includes('verifyAccessToken')) {
    addPassed('Authentication', 'JWT token verification implemented');
  } else {
    addIssue('Authentication', 'JWT token verification not found', 'high');
  }

  // Check for proper error handling
  if (content.includes('TOKEN_EXPIRED') && content.includes('INVALID_TOKEN')) {
    addPassed('Authentication', 'Proper token error handling implemented');
  } else {
    addWarning('Authentication', 'Token error handling may be incomplete');
  }
}

/**
 * Check input validation
 */
function checkInputValidation() {
  log('\n🔍 Checking input validation...', 'cyan');
  
  const validatorPath = path.join(__dirname, 'src/middleware/validator.js');
  if (!fs.existsSync(validatorPath)) {
    addIssue('Input Validation', 'Validator middleware not found', 'high');
    return;
  }

  const content = fs.readFileSync(validatorPath, 'utf8');
  
  // Check for validation library
  if (content.includes('Joi')) {
    addPassed('Input Validation', 'Joi validation library in use');
  } else {
    addWarning('Input Validation', 'No validation library detected');
  }

  // Check for common validation schemas
  const requiredSchemas = ['register', 'login', 'updateProfile', 'submitGame'];
  requiredSchemas.forEach(schema => {
    if (content.includes(`${schema}:`)) {
      addPassed('Input Validation', `${schema} validation schema found`);
    } else {
      addWarning('Input Validation', `${schema} validation schema not found`);
    }
  });
}

/**
 * Check password hashing
 */
function checkPasswordHashing() {
  log('\n🔍 Checking password hashing...', 'cyan');
  
  const passwordServicePath = path.join(__dirname, 'src/services/passwordService.js');
  if (!fs.existsSync(passwordServicePath)) {
    addIssue('Password Security', 'Password service not found', 'critical');
    return;
  }

  const content = fs.readFileSync(passwordServicePath, 'utf8');
  
  // Check for bcrypt
  if (content.includes('bcrypt')) {
    addPassed('Password Security', 'bcrypt library in use');
  } else {
    addIssue('Password Security', 'bcrypt not found', 'critical');
  }

  // Check for salt rounds
  const saltRoundsMatch = content.match(/saltRounds\s*=\s*(\d+)/);
  if (saltRoundsMatch) {
    const rounds = parseInt(saltRoundsMatch[1]);
    if (rounds >= 12) {
      addPassed('Password Security', `bcrypt salt rounds: ${rounds} (secure)`);
    } else {
      addIssue('Password Security', `bcrypt salt rounds: ${rounds} (should be >= 12)`, 'medium');
    }
  }
}

/**
 * Check helmet security headers
 */
function checkSecurityHeaders() {
  log('\n🔍 Checking security headers...', 'cyan');
  
  const appPath = path.join(__dirname, 'src/app.js');
  if (!fs.existsSync(appPath)) {
    addWarning('Security Headers', 'app.js not found');
    return;
  }

  const content = fs.readFileSync(appPath, 'utf8');
  
  if (content.includes('helmet()')) {
    addPassed('Security Headers', 'Helmet middleware configured');
  } else {
    addIssue('Security Headers', 'Helmet middleware not found', 'medium');
  }
}

/**
 * Print audit results
 */
function printResults() {
  log('\n' + '='.repeat(60), 'blue');
  log('SECURITY AUDIT RESULTS', 'blue');
  log('='.repeat(60), 'blue');

  // Print critical issues
  const criticalIssues = issues.filter(i => i.severity === 'critical');
  if (criticalIssues.length > 0) {
    log('\n🚨 CRITICAL ISSUES:', 'red');
    criticalIssues.forEach(issue => {
      log(`  ❌ [${issue.category}] ${issue.message}`, 'red');
    });
  }

  // Print high severity issues
  const highIssues = issues.filter(i => i.severity === 'high');
  if (highIssues.length > 0) {
    log('\n⚠️  HIGH SEVERITY ISSUES:', 'red');
    highIssues.forEach(issue => {
      log(`  ❌ [${issue.category}] ${issue.message}`, 'red');
    });
  }

  // Print medium severity issues
  const mediumIssues = issues.filter(i => i.severity === 'medium');
  if (mediumIssues.length > 0) {
    log('\n⚠️  MEDIUM SEVERITY ISSUES:', 'yellow');
    mediumIssues.forEach(issue => {
      log(`  ⚠️  [${issue.category}] ${issue.message}`, 'yellow');
    });
  }

  // Print warnings
  if (warnings.length > 0) {
    log('\n⚡ WARNINGS:', 'yellow');
    warnings.forEach(warning => {
      log(`  ⚠️  [${warning.category}] ${warning.message}`, 'yellow');
    });
  }

  // Print passed checks
  if (passed.length > 0) {
    log('\n✅ PASSED CHECKS:', 'green');
    passed.forEach(check => {
      log(`  ✓ [${check.category}] ${check.message}`, 'green');
    });
  }

  // Summary
  log('\n' + '='.repeat(60), 'blue');
  log('SUMMARY', 'blue');
  log('='.repeat(60), 'blue');
  log(`Total Issues: ${issues.length}`, issues.length > 0 ? 'red' : 'green');
  log(`  - Critical: ${criticalIssues.length}`, criticalIssues.length > 0 ? 'red' : 'green');
  log(`  - High: ${highIssues.length}`, highIssues.length > 0 ? 'red' : 'green');
  log(`  - Medium: ${mediumIssues.length}`, mediumIssues.length > 0 ? 'yellow' : 'green');
  log(`Warnings: ${warnings.length}`, warnings.length > 0 ? 'yellow' : 'green');
  log(`Passed: ${passed.length}`, 'green');
  log('='.repeat(60) + '\n', 'blue');

  // Exit code
  if (criticalIssues.length > 0 || highIssues.length > 0) {
    log('❌ Security audit FAILED - Critical or high severity issues found', 'red');
    process.exit(1);
  } else if (mediumIssues.length > 0) {
    log('⚠️  Security audit PASSED with warnings', 'yellow');
    process.exit(0);
  } else {
    log('✅ Security audit PASSED - No critical issues found', 'green');
    process.exit(0);
  }
}

/**
 * Run all security checks
 */
function runAudit() {
  log('🔒 Starting Security Audit...', 'cyan');
  
  checkHardcodedSecrets();
  checkEnvSecrets();
  checkCORS();
  checkRateLimiting();
  checkSQLInjection();
  checkAuthentication();
  checkInputValidation();
  checkPasswordHashing();
  checkSecurityHeaders();
  
  printResults();
}

// Run the audit
runAudit();
