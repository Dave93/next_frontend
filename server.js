// Next.js 16 does not support custom servers with Pages Router.
// The useRouter() hook throws "NextRouter was not mounted" when using
// any custom server (Express or native http.createServer).
// Use `next start` directly instead.
//
// PM2 config: pm2 start "npx next start -p 4646" --name chopar
// Or use package.json "server" script.

const { execSync } = require('child_process')
const port = process.env.PORT || 4646

console.log(`> Starting Next.js on port ${port}`)
execSync(`npx next start -p ${port}`, { stdio: 'inherit' })
