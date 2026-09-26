import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { installBrowsers } from '../lib/browsers.ts';
import { BENCH_DIR, cachePath } from '../lib/paths.ts';
import { run, sha256 } from '../lib/util.ts';

/** Same bytes js-framework-benchmark serves (verified against its css/bootstrap copy). */
const BOOTSTRAP_VERSION = '3.3.6';
const BOOTSTRAP_MIN_CSS_SHA256 = 'eece6e0c65b7007ab0eb1b4998d36dafe381449525824349128efc3f86f4c91c';

export const ASSETS_DIR = cachePath('assets');

async function setupJfbAssets(force: boolean): Promise<void> {
  const dir = join(ASSETS_DIR, 'jfb');
  const cssDir = join(dir, 'bootstrap/dist/css');
  const fontDir = join(dir, 'bootstrap/dist/fonts');
  if (!force && existsSync(join(dir, 'currentStyle.css'))) {
    console.log(`jfb css: ok (${dir})`);
    return;
  }
  mkdirSync(cachePath('tmp'), { recursive: true });
  const tmp = mkdtempSync(join(cachePath('tmp'), 'bootstrap-'));
  try {
    const packed = await run('npm', ['pack', `bootstrap@${BOOTSTRAP_VERSION}`, '--silent', '--pack-destination', tmp]);
    await run('tar', ['-xzf', join(tmp, packed.stdout.trim().split('\n').pop()!), '-C', tmp]);
    const css = readFileSync(join(tmp, 'package/dist/css/bootstrap.min.css'));
    if (sha256(css) !== BOOTSTRAP_MIN_CSS_SHA256) {
      throw new Error(`bootstrap.min.css sha256 mismatch: ${sha256(css)}`);
    }
    mkdirSync(cssDir, { recursive: true });
    mkdirSync(fontDir, { recursive: true });
    writeFileSync(join(cssDir, 'bootstrap.min.css'), css);
    for (const font of readdirSync(join(tmp, 'package/dist/fonts'))) {
      copyFileSync(join(tmp, 'package/dist/fonts', font), join(fontDir, font));
    }
    copyFileSync(join(BENCH_DIR, 'apps/shared/jfb-main.css'), join(dir, 'main.css'));
    writeFileSync(
      join(dir, 'currentStyle.css'),
      '@import url("bootstrap/dist/css/bootstrap.min.css");\n@import url("main.css");\n',
    );
    console.log(`jfb css: installed bootstrap ${BOOTSTRAP_VERSION} (${dir})`);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

export default async function setup(argv: string[]): Promise<number> {
  const { values } = parseArgs({
    args: argv,
    options: { force: { type: 'boolean', default: false }, 'no-browsers': { type: 'boolean', default: false } },
  });
  mkdirSync(ASSETS_DIR, { recursive: true });
  await setupJfbAssets(values.force!);
  if (!values['no-browsers']) {
    await installBrowsers();
  }
  return 0;
}
