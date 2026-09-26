import { Browser, computeExecutablePath, detectBrowserPlatform, install } from '@puppeteer/browsers';
import { createHash } from 'node:crypto';
import { createReadStream, existsSync } from 'node:fs';
import { join } from 'node:path';
import { CHROMIUM_SRC, cachePath } from './paths.ts';

/** Pinned Chrome for Testing builds (latest published patch per milestone). */
export const CFT_VERSIONS: Record<string, string> = {
  'cft-152': '152.0.7977.82',
  'cft-153': '153.0.8010.52',
};

export const BROWSERS_DIR = cachePath('browsers');

export type HeadlessMode = 'new' | 'shell' | 'off';

export interface ResolvedBrowser {
  name: string;
  executable: string;
  /** Chrome for Testing build id, when known. */
  version?: string;
  /** chrome-headless-shell binaries are always headless and take no --headless=new. */
  isHeadlessShell: boolean;
}

export async function installBrowsers(log: (s: string) => void = console.log): Promise<void> {
  const platform = detectBrowserPlatform();
  if (!platform) {
    throw new Error('Unsupported platform for Chrome for Testing');
  }
  for (const [name, buildId] of Object.entries(CFT_VERSIONS)) {
    for (const browser of [Browser.CHROME, Browser.CHROMEHEADLESSSHELL]) {
      const exe = computeExecutablePath({ browser, buildId, cacheDir: BROWSERS_DIR, platform });
      if (existsSync(exe)) {
        log(`${name} ${browser}: ok (${buildId})`);
        continue;
      }
      log(`${name} ${browser}: downloading ${buildId}…`);
      await install({ browser, buildId, cacheDir: BROWSERS_DIR, platform });
    }
  }
}

/**
 * Resolves --browser: cft-152 | cft-153 | infernoprof | autoexplore | system | <path>.
 * With --headless shell, CfT names resolve to chrome-headless-shell of that build.
 */
export function resolveBrowser(spec: string, headless: HeadlessMode): ResolvedBrowser {
  const platform = detectBrowserPlatform()!;
  const buildId = CFT_VERSIONS[spec];
  if (buildId) {
    const browser = headless === 'shell' ? Browser.CHROMEHEADLESSSHELL : Browser.CHROME;
    const exe = computeExecutablePath({ browser, buildId, cacheDir: BROWSERS_DIR, platform });
    if (!existsSync(exe)) {
      throw new Error(`${spec} (${browser}) is not installed: run \`pnpm bench setup\``);
    }
    return { name: headless === 'shell' ? `${spec}-shell` : spec, executable: exe, version: buildId, isHeadlessShell: headless === 'shell' };
  }
  const named: Record<string, string> = {
    infernoprof: join(CHROMIUM_SRC, 'out/InfernoProf/chrome'),
    autoexplore: join(CHROMIUM_SRC, 'out/AutoExplore/chrome'),
    system: '/usr/bin/chromium',
  };
  const exe = named[spec] ?? spec;
  if (!existsSync(exe)) {
    throw new Error(`Browser "${spec}" not found at ${exe}`);
  }
  return { name: named[spec] ? spec : exe, executable: exe, isHeadlessShell: /headless_shell|headless-shell/.test(exe) };
}

export function fileSha256(path: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const h = createHash('sha256');
    createReadStream(path)
      .on('data', (d) => h.update(d))
      .on('end', () => resolve(h.digest('hex')))
      .on('error', reject);
  });
}
