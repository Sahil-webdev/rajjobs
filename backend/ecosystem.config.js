module.exports = {
  apps: [
    {
      name: 'rajjobs-backend',
      script: './src/index.js',
      cwd: '/Users/sahilsharma/Downloads/desktop/rajjobs/backend',
      instances: 1,
      autorestart: true,        // auto-restart on crash
      max_restarts: 15,
      restart_delay: 2000,      // wait 2s before restarting
      watch: false,
      env: {
        NODE_ENV: 'development',
      },
      error_file: '/Users/sahilsharma/Downloads/desktop/rajjobs/backend/logs/pm2-error.log',
      out_file: '/Users/sahilsharma/Downloads/desktop/rajjobs/backend/logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
  ],
};
