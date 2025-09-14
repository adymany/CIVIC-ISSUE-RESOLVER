import { spawn } from 'child_process';

// Start Next.js dev server with LAN access and HTTPS
const nextDev = spawn('npx', [
  'next', 
  'dev', 
  '--turbopack',
  '--experimental-https',
  '-H', 
  '0.0.0.0',
  '-p',
  '3000'
], {
  stdio: 'inherit',
  shell: true
});

nextDev.on('close', (code) => {
  console.log(`Next.js dev server exited with code ${code}`);
});