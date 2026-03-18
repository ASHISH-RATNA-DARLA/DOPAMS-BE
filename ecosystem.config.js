module.exports = {
  apps: [
    {
      name: 'dopams-backend',
      script: 'npm',
      args: 'run dev',
      instances: 1,
      exec_mode: 'fork',
      env_file: '.env',
      env: {
        NODE_ENV: 'production',
        PORT: 8082,
        NODE_PATH: './src'
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_file: './logs/pm2-combined.log',
      time: true,
      autorestart: true,
      max_memory_restart: '500M',
      watch: false,
      ignore_watch: ['node_modules', 'logs'],
    }
  ]
};
