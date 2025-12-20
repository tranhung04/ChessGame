# ToolChess Rebuild - Deployment Guide

## Overview
This guide covers the complete deployment process for the ToolChess application, including backend API, database setup, and mobile app distribution.

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Database Deployment](#database-deployment)
3. [Backend API Deployment](#backend-api-deployment)
4. [Mobile App Deployment](#mobile-app-deployment)
5. [Environment Configuration](#environment-configuration)
6. [Monitoring and Logging](#monitoring-and-logging)
7. [Rollback Procedures](#rollback-procedures)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software
- **Node.js**: >= 14.x (LTS recommended)
- **npm**: >= 6.x
- **SQL Server**: 2017 or later
- **PM2**: For process management (recommended)
- **Git**: For version control

### Required Accounts
- **VNPay Merchant Account**: For payment processing
- **Gmail Account**: For SMTP email service (with App Password)
- **Cloud Provider Account**: AWS, Azure, or similar (optional)

### Required Credentials
- Database connection string
- JWT secrets (generate with crypto)
- VNPay TMN Code and Hash Secret
- Gmail SMTP credentials
- SSL certificates (for HTTPS)

---

## Database Deployment

### Step 1: Prepare Database Server

**For Azure SQL Database:**
```bash
# Create resource group
az group create --name toolchess-rg --location eastus

# Create SQL Server
az sql server create \
  --name toolchess-sql-server \
  --resource-group toolchess-rg \
  --location eastus \
  --admin-user toolchess_admin \
  --admin-password <STRONG_PASSWORD>

# Create database
az sql db create \
  --resource-group toolchess-rg \
  --server toolchess-sql-server \
  --name ToolChessDB_Production \
  --service-objective S1
```

**For On-Premise SQL Server:**
```sql
-- Create database
CREATE DATABASE ToolChessDB_Production;
GO

-- Create login
CREATE LOGIN toolchess_admin WITH PASSWORD = '<STRONG_PASSWORD>';
GO

-- Create user and grant permissions
USE ToolChessDB_Production;
CREATE USER toolchess_admin FOR LOGIN toolchess_admin;
ALTER ROLE db_owner ADD MEMBER toolchess_admin;
GO
```

### Step 2: Run Database Migrations

```bash
# Navigate to database directory
cd database

# Copy environment template
cp .env.example .env

# Edit .env with production credentials
nano .env

# Run setup script
sqlcmd -S <SERVER> -U <USER> -P <PASSWORD> -i setup.sql

# Verify tables created
sqlcmd -S <SERVER> -U <USER> -P <PASSWORD> -i verify.sql

# Seed premium packages
sqlcmd -S <SERVER> -U <USER> -P <PASSWORD> -i seed/01_seed_premium_packages.sql
```

### Step 3: Create Database Indexes

```bash
# Run index creation scripts
cd indexes
for file in *.sql; do
  sqlcmd -S <SERVER> -U <USER> -P <PASSWORD> -i "$file"
done
```

### Step 4: Backup Database

```bash
# Create backup
sqlcmd -S <SERVER> -U <USER> -P <PASSWORD> -Q \
  "BACKUP DATABASE ToolChessDB_Production TO DISK = '/backups/toolchess_initial.bak'"
```

---

## Backend API Deployment

### Step 1: Prepare Server

**Install Node.js and PM2:**
```bash
# Install Node.js (Ubuntu/Debian)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Setup PM2 startup script
pm2 startup
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME
```

### Step 2: Clone Repository

```bash
# Clone repository
git clone https://github.com/your-org/toolchess-rebuild.git
cd toolchess-rebuild/backend

# Checkout production branch
git checkout main
```

### Step 3: Configure Environment

```bash
# Copy production environment template
cp .env.production.example .env.production

# Edit with actual credentials
nano .env.production
```

**Required Configuration:**
```bash
# Generate JWT secrets
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate database password
node -e "console.log(require('crypto').randomBytes(24).toString('base64'))"
```

**Update .env.production:**
- Set `NODE_ENV=production`
- Set `API_BASE_URL` to your domain
- Configure database connection
- Set JWT secrets (generated above)
- Configure VNPay production credentials
- Configure Gmail SMTP with App Password
- Set CORS origins to your domains only

### Step 4: Install Dependencies

```bash
# Install production dependencies
npm ci --production

# Verify installation
npm list --depth=0
```

### Step 5: Run Deployment Script

```bash
# Make script executable
chmod +x deploy-production.sh

# Run deployment
./deploy-production.sh
```

**Manual Deployment (if script fails):**
```bash
# Copy environment
cp .env.production .env

# Start with PM2
pm2 start src/server.js --name toolchess-backend --env production

# Save PM2 configuration
pm2 save

# Check status
pm2 status
pm2 logs toolchess-backend
```

### Step 6: Configure Reverse Proxy (Nginx)

```nginx
# /etc/nginx/sites-available/toolchess-api

server {
    listen 80;
    server_name api.toolchess.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.toolchess.com;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/api.toolchess.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.toolchess.com/privkey.pem;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Proxy to Node.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req zone=api_limit burst=20 nodelay;
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/toolchess-api /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### Step 7: Setup SSL Certificate

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d api.toolchess.com

# Test auto-renewal
sudo certbot renew --dry-run
```

### Step 8: Verify Deployment

```bash
# Check server status
pm2 status

# Check logs
pm2 logs toolchess-backend --lines 100

# Test health endpoint
curl https://api.toolchess.com/health

# Run feature tests
node test-all-features.js
```

---

## Mobile App Deployment

### Step 1: Update Configuration

```javascript
// src/config/constants.js

const ENV = {
  development: {
    API_BASE_URL: 'http://localhost:3000',
  },
  staging: {
    API_BASE_URL: 'https://staging-api.toolchess.com',
  },
  production: {
    API_BASE_URL: 'https://api.toolchess.com',
  }
};

const environment = __DEV__ ? 'development' : 'production';

export default ENV[environment];
```

### Step 2: Build Android APK

```bash
# Navigate to project root
cd /path/to/toolchess-rebuild

# Install dependencies
npm install

# Build production APK
cd android
./gradlew assembleRelease

# APK location
# android/app/build/outputs/apk/release/app-release.apk
```

### Step 3: Sign Android APK

**Generate Keystore (first time only):**
```bash
keytool -genkeypair -v \
  -storetype PKCS12 \
  -keystore toolchess-release.keystore \
  -alias toolchess-key \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

**Configure Gradle:**
```gradle
// android/app/build.gradle

android {
    ...
    signingConfigs {
        release {
            storeFile file('toolchess-release.keystore')
            storePassword System.getenv("KEYSTORE_PASSWORD")
            keyAlias 'toolchess-key'
            keyPassword System.getenv("KEY_PASSWORD")
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

**Build Signed APK:**
```bash
export KEYSTORE_PASSWORD=<your_keystore_password>
export KEY_PASSWORD=<your_key_password>

cd android
./gradlew assembleRelease

# Verify signature
jarsigner -verify -verbose -certs app/build/outputs/apk/release/app-release.apk
```

### Step 4: Test Release Build

```bash
# Install on device
adb install app/build/outputs/apk/release/app-release.apk

# Test all features
# Follow MANUAL_TEST_CHECKLIST.md
```

### Step 5: Publish to Google Play Store

1. **Create Google Play Console Account**
   - Go to https://play.google.com/console
   - Pay one-time $25 registration fee

2. **Create App Listing**
   - App name: ToolChess
   - Category: Games > Board
   - Add screenshots, description, icon

3. **Upload APK**
   - Go to Release > Production
   - Create new release
   - Upload signed APK
   - Add release notes

4. **Complete Store Listing**
   - Add privacy policy URL
   - Add content rating
   - Set pricing (Free)
   - Select countries

5. **Submit for Review**
   - Review and publish
   - Wait for approval (1-3 days)

---

## Environment Configuration

### Development Environment
```bash
# backend/.env
NODE_ENV=development
API_BASE_URL=http://localhost:3000
DB_SERVER=localhost
CORS_ORIGIN=*
LOG_LEVEL=debug
```

### Staging Environment
```bash
# backend/.env.staging
NODE_ENV=staging
API_BASE_URL=https://staging-api.toolchess.com
DB_SERVER=staging-db.toolchess.com
CORS_ORIGIN=https://staging.toolchess.com
LOG_LEVEL=info
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
```

### Production Environment
```bash
# backend/.env.production
NODE_ENV=production
API_BASE_URL=https://api.toolchess.com
DB_SERVER=prod-db.toolchess.com
CORS_ORIGIN=https://toolchess.com,https://app.toolchess.com
LOG_LEVEL=error
VNPAY_URL=https://vnpayment.vn/paymentv2/vpcpay.html
```

---

## Monitoring and Logging

### Setup PM2 Monitoring

```bash
# Enable PM2 monitoring
pm2 install pm2-logrotate

# Configure log rotation
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true

# View logs
pm2 logs toolchess-backend
pm2 logs toolchess-backend --lines 1000
pm2 logs toolchess-backend --err
```

### Setup Application Monitoring

**Option 1: PM2 Plus (Recommended)**
```bash
# Link to PM2 Plus
pm2 link <secret_key> <public_key>

# Monitor at: https://app.pm2.io
```

**Option 2: Custom Logging**
```javascript
// backend/src/utils/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;
```

### Database Monitoring

```sql
-- Monitor active connections
SELECT 
    DB_NAME(dbid) as DatabaseName,
    COUNT(dbid) as NumberOfConnections,
    loginame as LoginName
FROM sys.sysprocesses
WHERE dbid > 0
GROUP BY dbid, loginame;

-- Monitor slow queries
SELECT TOP 10
    qs.execution_count,
    qs.total_elapsed_time / 1000000 as total_elapsed_time_sec,
    qs.total_worker_time / 1000000 as total_worker_time_sec,
    SUBSTRING(qt.text, (qs.statement_start_offset/2)+1,
        ((CASE qs.statement_end_offset
            WHEN -1 THEN DATALENGTH(qt.text)
            ELSE qs.statement_end_offset
        END - qs.statement_start_offset)/2) + 1) as query_text
FROM sys.dm_exec_query_stats qs
CROSS APPLY sys.dm_exec_sql_text(qs.sql_handle) qt
ORDER BY qs.total_elapsed_time DESC;
```

---

## Rollback Procedures

### Backend Rollback

```bash
# Stop current version
pm2 stop toolchess-backend

# Restore from backup
cd /path/to/toolchess-rebuild/backend
tar -xzf backups/backup_<TIMESTAMP>.tar.gz -C ../backend-rollback

# Switch to backup
cd ../backend-rollback
cp .env.production .env

# Start backup version
pm2 start src/server.js --name toolchess-backend

# Verify
curl https://api.toolchess.com/health
```

### Database Rollback

```sql
-- Restore from backup
RESTORE DATABASE ToolChessDB_Production
FROM DISK = '/backups/toolchess_<TIMESTAMP>.bak'
WITH REPLACE;
```

### Mobile App Rollback

- Cannot rollback installed apps
- Users must update to new version
- Keep previous APK versions for reference

---

## Troubleshooting

### Backend Issues

**Server won't start:**
```bash
# Check logs
pm2 logs toolchess-backend --err

# Check port availability
sudo netstat -tulpn | grep 3000

# Check environment variables
pm2 env 0
```

**Database connection fails:**
```bash
# Test connection
node -e "
const sql = require('mssql');
sql.connect(process.env.DB_CONNECTION_STRING)
  .then(() => console.log('Connected'))
  .catch(err => console.error(err));
"

# Check firewall
telnet <DB_SERVER> 1433
```

**High memory usage:**
```bash
# Check memory
pm2 monit

# Restart with memory limit
pm2 restart toolchess-backend --max-memory-restart 500M
```

### Mobile App Issues

**Build fails:**
```bash
# Clean build
cd android
./gradlew clean

# Clear cache
rm -rf node_modules
npm install

# Rebuild
./gradlew assembleRelease
```

**App crashes on startup:**
```bash
# Check logs
adb logcat | grep ToolChess

# Check permissions in AndroidManifest.xml
```

### Payment Issues

**VNPay signature mismatch:**
- Verify VNPAY_HASH_SECRET is correct
- Check parameter sorting in signature calculation
- Verify URL encoding

**Payment callback not received:**
- Check VNPAY_RETURN_URL is accessible
- Verify firewall allows VNPay IPs
- Check server logs for callback attempts

---

## Security Checklist

- [ ] All secrets in .env files (not in code)
- [ ] Strong JWT secrets (64+ characters)
- [ ] Strong database passwords (24+ characters)
- [ ] HTTPS enabled with valid SSL certificate
- [ ] CORS configured with specific origins
- [ ] Rate limiting enabled
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (input sanitization)
- [ ] Helmet middleware enabled
- [ ] Regular security updates (npm audit)
- [ ] Database backups automated
- [ ] Monitoring and alerting configured
- [ ] Error messages don't expose sensitive info
- [ ] API keys rotated regularly

---

## Post-Deployment Checklist

- [ ] All services running (pm2 status)
- [ ] Health check endpoint returns 200
- [ ] Database connection working
- [ ] VNPay payment flow tested
- [ ] Email delivery working
- [ ] SSL certificate valid
- [ ] Monitoring configured
- [ ] Backups automated
- [ ] Documentation updated
- [ ] Team notified of deployment
- [ ] Manual test checklist completed
- [ ] Performance metrics baseline recorded

---

## Support and Maintenance

### Regular Maintenance Tasks

**Daily:**
- Check error logs
- Monitor server resources
- Check payment transactions

**Weekly:**
- Review security logs
- Check database performance
- Update dependencies (if needed)

**Monthly:**
- Database backup verification
- SSL certificate renewal check
- Security audit
- Performance optimization review

### Emergency Contacts

- **DevOps Lead:** [contact info]
- **Database Admin:** [contact info]
- **Security Team:** [contact info]
- **VNPay Support:** [contact info]

---

## Additional Resources

- [Backend README](backend/README.md)
- [Database README](database/README.md)
- [API Documentation](backend/API_DOCUMENTATION.md)
- [Manual Test Checklist](MANUAL_TEST_CHECKLIST.md)
- [Security Hardening Guide](backend/SECURITY_HARDENING_GUIDE.md)

---

**Last Updated:** December 2024
**Version:** 1.0.0
