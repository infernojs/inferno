import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { extname, join, normalize, sep } from 'node:path';
import { cachePath } from '../lib/paths.ts';

const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.map': 'application/json',
  '.svg': 'image/svg+xml',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
};

export interface BenchServer {
  origin: string;
  /** Serves `dir` under a stable URL prefix and returns that prefix. */
  mount(dir: string): string;
  close(): Promise<void>;
}

/**
 * Static server for bench pages. Every response is cross-origin isolated
 * (COOP/COEP), which gives 5 µs performance.now() resolution and enables
 * performance.measureUserAgentSpecificMemory(). No compression, no caching.
 */
export async function startServer(): Promise<BenchServer> {
  const mounts = new Map<string, string>();
  const byDir = new Map<string, string>();
  const assets = cachePath('assets');

  const server: Server = createServer((req, res) => {
    const url = new URL(req.url ?? '/', 'http://localhost');
    let base: string | undefined;
    let rest = '';
    if (url.pathname === '/__blank') {
      // Same-origin, cross-origin-isolated landing page: navigating here first
      // performs the COOP browsing-instance swap before instrumentation is set up.
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Embedder-Policy': 'require-corp',
      });
      res.end('<!DOCTYPE html><title>blank</title>');
      return;
    }
    const m = /^\/m\/([^/]+)\/(.*)$/.exec(url.pathname);
    if (m) {
      base = mounts.get(m[1]);
      rest = m[2] || 'index.html';
    } else if (url.pathname.startsWith('/assets/')) {
      base = assets;
      rest = url.pathname.slice('/assets/'.length);
    }
    const file = base ? normalize(join(base, decodeURIComponent(rest))) : null;
    if (!base || !file || !(file === base || file.startsWith(base + sep)) || !existsSync(file) || statSync(file).isDirectory()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('not found');
      return;
    }
    res.writeHead(200, {
      'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream',
      'Cache-Control': 'no-store',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Resource-Policy': 'same-origin',
    });
    createReadStream(file).pipe(res);
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address() as AddressInfo;
  let next = 0;
  return {
    origin: `http://127.0.0.1:${port}`,
    mount(dir: string) {
      let id = byDir.get(dir);
      if (!id) {
        id = (next++).toString(36);
        mounts.set(id, dir);
        byDir.set(dir, id);
      }
      return `/m/${id}/`;
    },
    close: () =>
      new Promise((resolve) => {
        server.closeAllConnections();
        server.close(() => resolve());
      }),
  };
}
