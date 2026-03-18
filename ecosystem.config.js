module.exports = {
  apps: [
    {
      name: 'dopams-backend',
      script: './build/src/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 8082
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 8082
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_file: './logs/pm2-combined.log',
      time: true,
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '500M',
      watch: false,
      ignore_watch: ['node_modules', 'logs'],
    }
  ]
};
