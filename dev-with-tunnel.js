const { spawn } = require('child_process');

console.log('Starting development server and tunnel...');

// Start Next.js dev server
const nextDev = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true
});

// Wait a moment for the server to start, then start localtunnel
setTimeout(() => {
  console.log('Starting localtunnel...');
  const tunnel = spawn('lt', ['--port', '3001'], {
    stdio: 'inherit',
    shell: true
  });
  
  tunnel.on('error', (err) => {
    console.error('Error starting tunnel:', err);
  });
  
  tunnel.on('close', (code) => {
    console.log(`Tunnel process exited with code ${code}`);
  });
}, 3000);

nextDev.on('error', (err) => {
  console.error('Error starting dev server:', err);
});

nextDev.on('close', (code) => {
  console.log(`Dev server exited with code ${code}`);
});