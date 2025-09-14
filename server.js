import { createServer } from 'https';
import { parse } from 'url';
import next from 'next';
import fs from 'fs';
import path from 'path';

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0'; // Listen on all network interfaces
const port = 3000;

// Try to use existing certificates or generate new ones
let httpsOptions;
try {
  httpsOptions = {
    key: fs.readFileSync(path.resolve('key.pem')),
    cert: fs.readFileSync(path.resolve('cert.pem')),
  };
  console.log('Using existing SSL certificates');
} catch (err) {
  console.log('No existing certificates found, using self-signed certificates from Next.js');
  // We'll let Next.js handle certificate generation
  httpsOptions = null;
}

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  if (httpsOptions) {
    // Use custom certificates
    createServer(httpsOptions, async (req, res) => {
      try {
        await handle(req, res, parse(req.url, true));
      } catch (err) {
        console.error('Error occurred handling', req.url, err);
        res.statusCode = 500;
        res.end('internal server error');
      }
    }).listen(port, hostname, (err) => {
      if (err) throw err;
      console.log(`> Ready on https://${hostname}:${port}`);
      console.log(`> Access from your phone at https://192.168.31.42:${port}`);
    });
  } else {
    // Let Next.js handle HTTPS (it will generate self-signed certificates)
    console.log('> Starting Next.js with built-in HTTPS support');
    console.log('> Access from your phone at https://192.168.31.42:3000');
  }
});