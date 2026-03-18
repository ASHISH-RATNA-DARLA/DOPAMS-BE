module.exports = {
  apps: [
    {
      name: 'dopams-backend',
      script: './src/server.ts',
      instances: 'max',
      exec_mode: 'cluster',
      interpreter: 'npx',
      interpreter_args: 'tsx',
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
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '500M',
      watch: false,
      ignore_watch: ['node_modules', 'logs'],
    }
  ]
};
