import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createServer } from 'node:net';
import test from 'node:test';

test(
  'the backend starts under tsx and serves API, frontend routes and assets',
  { timeout: 60000 },
  async (t) => {
    const probe = createServer();
    probe.listen(0, '127.0.0.1');
    await once(probe, 'listening');
    const { port } = probe.address();
    await new Promise((resolve) => probe.close(resolve));

    const backend = spawn(
      process.execPath,
      ['--import', 'tsx', 'src/server.ts'],
      {
        cwd: new URL('../', import.meta.url),
        env: { ...process.env, PORT: String(port), FORCE_COLOR: '0' },
        stdio: ['ignore', 'pipe', 'pipe'],
        signal: t.signal
      }
    );
    const closed = new Promise((resolve) => backend.once('close', resolve));
    let output = '';

    t.after(async () => {
      backend.kill();
      await closed;
    });

    await new Promise((resolve, reject) => {
      backend.stdout.on('data', (chunk) => {
        output += chunk;
        if (output.includes('Server listening on:')) {
          resolve();
        }
      });
      backend.stderr.on('data', (chunk) => {
        output += chunk;
      });
      backend.once('error', reject);
      backend.once('close', (code) =>
        reject(new Error(`Backend exited with code ${code}:\n${output}`))
      );
    });
    assert.equal(
      (output.match(/Built [1-9]\d* bundles/g) || []).length,
      2,
      output
    );

    async function get(path) {
      const response = await fetch(`http://127.0.0.1:${port}${path}`, {
        signal: t.signal
      });
      assert.equal(response.status, 200, `${path}:\n${output}`);
      return response;
    }

    const ping = await get('/api/ping');
    assert.equal(await ping.text(), 'ok');

    const paths = ['/', '/about', '/page/example'];
    for (let i = 0, len = paths.length; i < len; ++i) {
      const path = paths[i];
      const response = await get(path);
      const html = await response.text();
      assert.match(html, /<title>Inferno Router Demo<\/title>/);
      assert.match(html, /<div id="app">/);
      if (path === '/') {
        assert.match(html, /Start Page/);
      }
    }

    const script = await get('/dist/indexServer.js');
    assert.match(script.headers.get('content-type'), /javascript/);
    await script.arrayBuffer();

    const stylesheet = await get('/dist/indexServer.css');
    assert.match(stylesheet.headers.get('content-type'), /css/);
    await stylesheet.arrayBuffer();
  }
);
