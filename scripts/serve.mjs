import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';

const root = path.join(process.cwd(), 'dist');
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.png':'image/png','.webp':'image/webp','.mp4':'video/mp4','.svg':'image/svg+xml','.ico':'image/x-icon','.xml':'application/xml; charset=utf-8','.txt':'text/plain; charset=utf-8'};
const server = createServer(async (request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const file = path.resolve(root, relative);
  if (!file.startsWith(root)) { response.writeHead(403).end('Forbidden'); return; }
  try {
    const info = await stat(file);
    if (!info.isFile()) throw new Error('Not a file');
    const contentType = types[path.extname(file)] ?? 'application/octet-stream';
    const range = request.headers.range;
    if (range) {
      const match = /^bytes=(\d+)-(\d*)$/.exec(range);
      const start = match ? Number(match[1]) : Number.NaN;
      const end = match?.[2] ? Math.min(Number(match[2]), info.size - 1) : info.size - 1;
      if (!Number.isInteger(start) || start < 0 || start > end || start >= info.size) {
        response.writeHead(416, {'Content-Range': `bytes */${info.size}`}).end();
        return;
      }
      response.writeHead(206, {
        'Accept-Ranges': 'bytes', 'Content-Range': `bytes ${start}-${end}/${info.size}`,
        'Content-Length': end - start + 1, 'Content-Type': contentType
      });
      createReadStream(file, {start, end}).pipe(response);
      return;
    }
    response.writeHead(200, {'Accept-Ranges':'bytes', 'Content-Length':info.size, 'Content-Type':contentType});
    createReadStream(file).pipe(response);
  } catch { response.writeHead(404).end('Not found'); }
});
server.listen(4173, '127.0.0.1', () => console.log('Vista local: http://127.0.0.1:4173'));
