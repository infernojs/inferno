import type { HeadlessMode } from '../lib/browsers.ts';

export interface ChromeFlagOptions {
  headless: HeadlessMode;
  /** Renderer sandbox; counters/profile modes turn it off to reach perf_event_open. */
  sandbox: boolean;
  isHeadlessShell: boolean;
  userDataDir: string;
  jsFlags?: string[];
  extraArgs?: string[];
}

export const WINDOW = { width: 1280, height: 800 };

/**
 * One flag profile shared by every browser (stock CfT, InfernoProf, AutoExplore)
 * so that A/B differences come from the page, not from browser configuration.
 */
export function chromeArgs(o: ChromeFlagOptions): string[] {
  const args = [
    `--user-data-dir=${o.userDataDir}`,
    '--remote-debugging-port=0',
    'about:blank',
    // Quiet, reproducible profile.
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    '--disable-component-extensions-with-background-pages',
    '--disable-default-apps',
    '--disable-sync',
    '--disable-background-networking',
    '--disable-component-update',
    '--disable-domain-reliability',
    '--disable-client-side-phishing-detection',
    '--disable-hang-monitor',
    '--disable-popup-blocking',
    '--metrics-recording-only',
    '--no-pings',
    '--password-store=basic',
    '--use-mock-keychain',
    '--mute-audio',
    // No field trials: experiment arms differ between runs and builds.
    '--disable-field-trial-config',
    // Never deprioritize the page under test.
    '--disable-background-timer-throttling',
    '--disable-renderer-backgrounding',
    '--disable-backgrounding-occluded-windows',
    '--disable-ipc-flooding-protection',
    // WebUIOmnibox*: Chrome 152 preloads a WebUI omnibox popup renderer per window,
    // a busy background process that competes with the page under test.
    '--disable-features=Translate,OptimizationHints,MediaRouter,DialMediaRouteProvider,BackForwardCache,CalculateNativeWinOcclusion,InterestFeedContentSuggestions,CertificateTransparencyComponentUpdater,LensOverlay,WebUIOmniboxPopup,WebUIOmniboxAimPopup',
    // Fixed geometry and DPR.
    `--window-size=${WINDOW.width},${WINDOW.height}`,
    '--force-device-scale-factor=1',
    // measureUserAgentSpecificMemory() resolves immediately instead of at the next GC.
    '--enable-blink-features=ForceEagerMeasureMemory',
    `--js-flags=${['--expose-gc', ...(o.jsFlags ?? [])].join(' ')}`,
  ];
  if (o.headless === 'new' && !o.isHeadlessShell) {
    args.push('--headless=new');
  }
  if (!o.sandbox) {
    args.push('--no-sandbox');
  }
  return [...args, ...(o.extraArgs ?? [])];
}
