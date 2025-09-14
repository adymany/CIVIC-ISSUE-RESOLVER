import express from 'express';
import { createServer } from 'https';
import { readFileSync } from 'fs';
import { join } from 'path';
import next from 'next';

// Install express if not already installed
try {
  await import('express');
} catch (e) {
  console.log('Installing express...');
  const { execSync } = await import('child_process');
  execSync('npm install express', { stdio: 'inherit' });
}

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = 3001;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const expressApp = express();
  
  // Serve static files
  expressApp.use('/_next', express.static(join(process.cwd(), '.next')));
  expressApp.use('/public', express.static(join(process.cwd(), 'public')));
  
  // Handle all other requests with Next.js
  expressApp.all('*', (req, res) => {
    return handle(req, res);
  });
  
  // Create HTTPS server with self-signed certificate
  const server = createServer(
    {
      key: readFileSync(join(process.cwd(), 'certificates', 'key.pem'), 'utf8'),
      cert: readFileSync(join(process.cwd(), 'certificates', 'cert.pem'), 'utf8'),
    },
    expressApp
  );
  
  server.listen(port, hostname, (err) => {
    if (err) throw err;
    console.log(`> Ready on https://${hostname}:${port}`);
    console.log(`> Access from your phone at https://192.168.31.42:${port}`);
    console.log('> You will see a security warning, this is normal for self-signed certificates');
    console.log('> On your phone, proceed through the warning to access the site');
  });
});