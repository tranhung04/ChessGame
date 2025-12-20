/**
 * PM2 Ecosystem Configuration
 * For production deployment with PM2 process manager
 */

module.exports = {
  apps: [
    {
      name: 'toolchess-backend-prod',
      script: './src/server.js',
      instances: 'max', // Use all CPU cores
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      env_staging: {
        NODE_ENV: 'staging',
        PORT: 3000
      },
      // Logging
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // Auto-restart configuration
      max_memory_restart: '500M',
      min_uptime: '10s',
      max_restarts: 10,
      autorestart: true,
      
      // Graceful shutdown
      kill_timeout: 5000,
      listen_timeout: 3000,
      
      // Monitoring
      instance_var: 'INSTANCE_ID',
      
      // Advanced features
      watch: false, // Don't watch in production
      ignore_watch: ['node_modules', 'logs', 'backups'],
      
      // Cron restart (optional - restart daily at 3 AM)
      cron_restart: '0 3 * * *',
      
      // Environment variables file
      env_file: '.env.production'
    },
    {
      name: 'toolchess-backend-staging',
      script: './src/server.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'staging',
        PORT: 3001
      },
      error_file: './logs/staging-error.log',
      out_file: './logs/staging-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      max_memory_restart: '300M',
      autorestart: true,
      env_file: '.env.staging'
    }
  ],
  
  deploy: {
    production: {
      user: 'deploy',
      host: 'api.toolchess.com',
      ref: 'origin/main',
      repo: 'git@github.com:your-org/toolchess-rebuild.git',
      path: '/var/www/toolchess-backend',
      'post-deploy': 'npm ci --production && pm2 reload ecosystem.config.js --env production',
      'pre-deploy-local': 'echo "Deploying to production..."',
      'post-deploy-local': 'echo "Production deployment complete!"'
    },
    staging: {
      user: 'deploy',
      host: 'staging-api.toolchess.com',
      ref: 'origin/develop',
      repo: 'git@github.com:your-org/toolchess-rebuild.git',
      path: '/var/www/toolchess-staging',
      'post-deploy': 'npm ci && pm2 reload ecosystem.config.js --env staging',
      'pre-deploy-local': 'echo "Deploying to staging..."',
      'post-deploy-local': 'echo "Staging deployment complete!"'
    }
  }
};
