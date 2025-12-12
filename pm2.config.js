require('dotenv').config()
module.exports = {
  apps: [
    {
      name: process.env.PM2_APP_NAME,
      script: 'bun',
      args: 'run start',
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
