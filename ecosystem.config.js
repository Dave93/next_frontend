module.exports = {
  apps: [
    {
      name: 'chopar',
      script: '.next/standalone/server.js',
      interpreter: '/root/.nvm/versions/node/v20.20.2/bin/node',
      env: {
        NODE_ENV: 'production',
        PORT: 5656,
        HOSTNAME: '0.0.0.0',
      },
      instances: 1,
      exec_mode: 'fork',
      wait_ready: false,
      listen_timeout: 10000,
      kill_timeout: 5000,
      max_memory_restart: '512M',
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      merge_logs: true,
      time: true,
    },
  ],
}
