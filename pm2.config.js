require('dotenv').config()
module.exports = {
  apps: [
    {
      name: process.env.PM2_APP_NAME,
      script: '/root/.bun/bin/bun',
      args: './server.js',
      watch: false,
      env: {
        PORT: process.env.NODE_PORT,
        NODE_ENV: 'production',
      },
      env_production: {
        PORT: process.env.NODE_PORT,
        NODE_ENV: 'production',
      },
    },
  ],
}
