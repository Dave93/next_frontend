module.exports = {
  apps: [
    {
      name: 'hq_frontend',
      script: './server.js',
      watch: false,
      env: {
        PORT: 3000,
        NODE_ENV: 'development',
      },
      env_production: {
        PORT: 5656,
        NODE_ENV: 'production',
      },
    },
  ],
}
