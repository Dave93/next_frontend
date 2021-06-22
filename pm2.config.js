module.exports = {
  apps: [
    {
      name: 'hq_frontend',
      script: './server.js',
      watch: false,
      env: {
        port: 3000,
        NODE_ENV: 'development',
      },
      env_production: {
        port: 5656,
        NODE_ENV: 'production',
      },
    },
  ],
}
