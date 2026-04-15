module.exports = {
  apps: [
    {
      name: 'chopar',
      script: '.next/standalone/server.js',
      interpreter: 'bun',
      env: {
        NODE_ENV: 'production',
        PORT: 5656,
        HOSTNAME: '0.0.0.0',
      },
      instances: 2,
      exec_mode: 'fork',
      wait_ready: true,
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
