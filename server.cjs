const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const root = __dirname;
const port = Number(process.env.PORT || 4173);
const lan = process.argv.includes('--lan');
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png', '.woff2': 'font/woff2', '.otf': 'font/otf', '.svg': 'image/svg+xml', '.pdf': 'application/pdf' };
http.createServer((req, res) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { res.writeHead(400).end(); return; }
  const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
  if (!file.startsWith(root + path.sep) || /(?:^|[/\\])\./.test(pathname)) { res.writeHead(403).end(); return; }
  if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405).end(); return; }
  fs.readFile(file, (error, bytes) => {
    if (error) { res.writeHead(404).end('Nenájdené'); return; }
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
    res.end(req.method === 'HEAD' ? undefined : bytes);
  });
}).listen(port, lan ? '0.0.0.0' : '127.0.0.1', () => {
  console.log(`Rozpočet naživo: http://localhost:${port}`);
  if (lan) for (const entries of Object.values(os.networkInterfaces())) for (const entry of entries || []) {
    if (entry.family === 'IPv4' && !entry.internal) console.log(`Mobil v rovnakej sieti: http://${entry.address}:${port}`);
  }
});
