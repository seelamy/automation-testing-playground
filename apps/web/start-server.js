// start-server.js — keeps next dev running
const { spawn } = require('child_process');
const path = require('path');

const nextBin = path.join(__dirname, 'node_modules', 'next', 'dist', 'bin', 'next');
const child = spawn('node', [nextBin, 'dev', '-p', '3000'], {
  cwd: __dirname,
  stdio: 'inherit',
  env: { ...process.env },
});

child.on('exit', (code) => {
  console.log('Next.js exited with code', code);
});

process.on('SIGINT', () => {
  child.kill('SIGINT');
  process.exit();
});
