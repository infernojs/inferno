import type { Browser, BrowserContext, CDPSession, Page } from 'puppeteer-core';

/**
 * Injected before any page script. The measured window starts when the armed
 * event type reaches the window capture phase (the first listener in dispatch,
 * ahead of Inferno's delegated document listener) and ends after the next
 * frame: rAF queues a MessageChannel message that only runs once that frame's
 * style/layout/paint work on the main thread is done.
 */
const INSTRUMENT = String.raw`(() => {
  let armed = null;
  window.__benchArm = (type) => { armed = type; };
  // Named so trace analysis can recognise (and exclude) the harness's own work.
  function __benchStart(e) {
    if (armed !== e.type) return;
    armed = null;
    const t0 = performance.now();
    const inputTs = e.timeStamp;
    requestAnimationFrame(function __benchRaf() {
      const raf = performance.now();
      const ch = new MessageChannel();
      ch.port1.onmessage = function __benchDone() {
        window.__benchReport(JSON.stringify({ t0, inputTs, raf, t1: performance.now() }));
      };
      ch.port2.postMessage(null);
    });
  }
  window.addEventListener('click', __benchStart, true);
  window.addEventListener('keydown', __benchStart, true);
  window.__benchChecksum = (selector) => {
    const root = document.querySelector(selector);
    if (!root) return null;
    const html = root.innerHTML;
    let h = 0x811c9dc5;
    for (let i = 0; i < html.length; i++) { h ^= html.charCodeAt(i); h = Math.imul(h, 0x01000193); }
    return (h >>> 0).toString(16).padStart(8, '0') + ':' + html.length;
  };
})();`;

export interface OpReport {
  /** Click/keydown dispatch start (performance.now, ms). */
  t0: number;
  /** Event timeStamp: when the browser received the input. */
  inputTs: number;
  /** rAF callback of the next frame. */
  raf: number;
  /** After that frame's main-thread rendering work. */
  t1: number;
}

export interface MeasureHooks {
  /** Untimed setup after hovering the target (GC, tracing start, throttling). */
  before?: () => Promise<void>;
  /** Runs immediately before the input events are dispatched (counter enable). */
  justBefore?: () => Promise<void>;
}

export class PageSession {
  private reports: string[] = [];
  private waiters: ((payload: string) => void)[] = [];

  readonly context: BrowserContext;
  readonly page: Page;
  readonly cdp: CDPSession;

  private constructor(context: BrowserContext, page: Page, cdp: CDPSession) {
    this.context = context;
    this.page = page;
    this.cdp = cdp;
    cdp.on('Runtime.bindingCalled', (e) => {
      if (e.name !== '__benchReport') {
        return;
      }
      const w = this.waiters.shift();
      if (w) {
        w(e.payload);
      } else {
        this.reports.push(e.payload);
      }
    });
  }

  /**
   * New BrowserContext (so a new renderer process) and page, instrumented, at
   * `url`. The page first lands on the server's blank page: the COOP/COEP
   * navigation swaps browsing instance (and process), which would drop
   * instrumentation registered before it.
   */
  static async open(browser: Browser, url: string): Promise<PageSession> {
    const context = await browser.createBrowserContext();
    const page = await context.newPage();
    await page.goto(new URL('/__blank', url).href, { waitUntil: 'load' });
    const cdp = await page.createCDPSession();
    // Page.enable is required for addScriptToEvaluateOnNewDocument to take effect on this session.
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('Runtime.addBinding', { name: '__benchReport' });
    await cdp.send('Page.addScriptToEvaluateOnNewDocument', { source: INSTRUMENT });
    const session = new PageSession(context, page, cdp);
    await page.goto(url, { waitUntil: 'load', timeout: 60_000 });
    return session;
  }

  async evaluate<T = unknown>(expression: string): Promise<T> {
    const res = await this.cdp.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (res.exceptionDetails) {
      throw new Error(`Page evaluation failed: ${res.exceptionDetails.exception?.description ?? res.exceptionDetails.text}\n  in: ${expression.slice(0, 200)}`);
    }
    return res.result.value as T;
  }

  /** Polls `expression` (truthy = done) once per frame. */
  async waitFor(expression: string, timeoutMs = 20_000): Promise<void> {
    await this.page.waitForFunction(expression, { polling: 'raf', timeout: timeoutMs });
  }

  async frames(n = 1): Promise<void> {
    await this.evaluate(`new Promise((r) => { let n = ${n}; const f = () => (--n <= 0 ? r() : requestAnimationFrame(f)); requestAnimationFrame(f); })`);
  }

  /** Viewport-relative center of `selector`, scrolling it into view first if needed. */
  async center(selector: string): Promise<{ x: number; y: number }> {
    const pos = await this.evaluate<[number, number] | null>(`(() => {
      const el = document.querySelector(${JSON.stringify(selector)});
      if (!el) return null;
      el.scrollIntoViewIfNeeded ? el.scrollIntoViewIfNeeded() : el.scrollIntoView({ block: 'center' });
      const r = el.getBoundingClientRect();
      return [r.x + r.width / 2, r.y + r.height / 2];
    })()`);
    if (!pos) {
      throw new Error(`Element not found: ${selector}`);
    }
    return { x: pos[0], y: pos[1] };
  }

  async moveTo(selector: string): Promise<{ x: number; y: number }> {
    const p = await this.center(selector);
    await this.cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: p.x, y: p.y });
    return p;
  }

  private async pressRelease(p: { x: number; y: number }): Promise<void> {
    await this.cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: p.x, y: p.y, button: 'left', buttons: 1, clickCount: 1 });
    await this.cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: p.x, y: p.y, button: 'left', buttons: 0, clickCount: 1 });
  }

  /** Untimed real click (warmups and preparation). */
  async click(selector: string): Promise<void> {
    const p = await this.moveTo(selector);
    await this.pressRelease(p);
  }

  private nextReport(timeoutMs: number): Promise<OpReport> {
    return new Promise((resolve, reject) => {
      const queued = this.reports.shift();
      if (queued) {
        resolve(JSON.parse(queued));
        return;
      }
      const timer = setTimeout(() => reject(new Error('Timed out waiting for the op to finish')), timeoutMs);
      this.waiters.push((payload) => {
        clearTimeout(timer);
        resolve(JSON.parse(payload));
      });
    });
  }

  /**
   * Hover the target and let hover styles settle (untimed), then the measured
   * real click. Resolves after the next frame's main-thread work.
   */
  async measuredClick(selector: string, hooks: MeasureHooks = {}, timeoutMs = 30_000): Promise<OpReport> {
    const p = await this.moveTo(selector);
    await this.frames(2);
    await hooks.before?.();
    await this.evaluate(`window.__benchArm('click')`);
    const done = this.nextReport(timeoutMs);
    await hooks.justBefore?.();
    await this.pressRelease(p);
    return done;
  }

  private async keyEvents(key: string): Promise<void> {
    const code = `Key${key.toUpperCase()}`;
    const vk = key.toUpperCase().charCodeAt(0);
    await this.cdp.send('Input.dispatchKeyEvent', { type: 'keyDown', key, code, text: key, unmodifiedText: key, windowsVirtualKeyCode: vk });
    await this.cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', key, code, windowsVirtualKeyCode: vk });
  }

  /** Untimed real key press into `selector`. */
  async pressKey(selector: string, key: string): Promise<void> {
    await this.evaluate(`document.querySelector(${JSON.stringify(selector)}).focus()`);
    await this.keyEvents(key);
  }

  /** Measured key press into a focused element (typing latency). */
  async measuredKey(selector: string, key: string, hooks: MeasureHooks = {}, timeoutMs = 30_000): Promise<OpReport> {
    await this.evaluate(`document.querySelector(${JSON.stringify(selector)}).focus()`);
    await this.frames(2);
    await hooks.before?.();
    await this.evaluate(`window.__benchArm('keydown')`);
    const done = this.nextReport(timeoutMs);
    await hooks.justBefore?.();
    await this.keyEvents(key);
    return done;
  }

  /** A fixed 4×4 px element without handlers: the target of null-op calibration clicks. */
  async addNullTarget(): Promise<string> {
    await this.evaluate(`(() => {
      const el = document.createElement('div');
      el.id = 'bench-null';
      el.style.cssText = 'position:fixed;right:0;bottom:0;width:4px;height:4px;z-index:2147483647';
      document.body.appendChild(el);
    })()`);
    return '#bench-null';
  }

  checksum(rootSelector: string): Promise<string | null> {
    return this.evaluate(`window.__benchChecksum(${JSON.stringify(rootSelector)})`);
  }

  async close(): Promise<void> {
    await this.context.close().catch(() => {});
  }
}
