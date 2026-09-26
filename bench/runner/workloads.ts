import { config as uibenchConfig, init as uibenchInit, initTests as uibenchInitTests } from '../apps/uibench/lib.js';
import type { PageSession } from './session.ts';

/**
 * A workload is one measured operation on one app. `init` runs untimed in a
 * fresh page (warmups + preparation) and returns the op; `check` verifies the
 * rendered result afterwards so a variant can't win by doing less.
 */
export interface Op {
  kind: 'click' | 'key' | 'loop';
  selector: string;
  key?: string;
}

export interface Workload {
  id: string;
  app: string;
  query?: string;
  /** Selector whose innerHTML is checksummed after the op. */
  root: string;
  /** jfb CPU throttling factor, applied only in --throttle jfb mode. */
  jfbThrottle?: number;
  init(s: PageSession, warmup: boolean): Promise<Op>;
  check(s: PageSession): Promise<string | null>;
}

const td = (row: number, col: number) => `tbody>tr:nth-of-type(${row})>td:nth-of-type(${col})`;

function textIs(selector: string, text: string): string {
  return `(document.querySelector(${JSON.stringify(selector)})?.textContent ?? '').includes(${JSON.stringify(text)})`;
}

function exists(selector: string): string {
  return `!!document.querySelector(${JSON.stringify(selector)})`;
}

async function expectTrue(s: PageSession, expression: string, what: string): Promise<string | null> {
  try {
    await s.waitFor(expression, 10_000);
    return null;
  } catch {
    return `check failed: ${what}`;
  }
}

/** js-framework-benchmark CPU benchmarks, same warmups and checks as its Puppeteer runner. */
function jfbWorkloads(prefix: string, app: string): Workload[] {
  const base = { app, root: '#main' };
  const ready = (s: PageSession) => s.waitFor(exists('#run'));
  const WU = 5;
  return [
    {
      ...base,
      id: `${prefix}:01_run1k`,
      async init(s, warmup) {
        await ready(s);
        for (let i = 0; warmup && i < WU; i++) {
          await s.click('#run');
          await s.waitFor(textIs(td(1, 1), String(i * 1000 + 1)));
          await s.click('#clear');
          await s.waitFor(`!${exists(td(1000, 1))}`);
        }
        return { kind: 'click', selector: '#run' };
      },
      check: (s) => expectTrue(s, exists(td(1000, 1)), 'row 1000 exists'),
    },
    {
      ...base,
      id: `${prefix}:02_replace1k`,
      async init(s, warmup) {
        await ready(s);
        const n = warmup ? WU : 1;
        for (let i = 0; i < n; i++) {
          await s.click('#run');
          await s.waitFor(textIs(td(1, 1), String(i * 1000 + 1)));
        }
        return { kind: 'click', selector: '#run' };
      },
      check: (s) => expectTrue(s, `document.querySelectorAll('tbody>tr').length === 1000`, '1000 rows'),
    },
    {
      ...base,
      id: `${prefix}:03_update10th1k`,
      jfbThrottle: 4,
      async init(s, warmup) {
        await ready(s);
        await s.click('#run');
        await s.waitFor(exists(td(1000, 1)));
        for (let i = 0; warmup && i < 3; i++) {
          await s.click('#update');
          await s.waitFor(textIs(`${td(991, 2)}>a`, ' !!!'.repeat(i + 1)));
        }
        return { kind: 'click', selector: '#update' };
      },
      check: (s) => expectTrue(s, textIs(`${td(991, 2)}>a`, ' !!!'), 'row 991 updated'),
    },
    {
      ...base,
      id: `${prefix}:04_select1k`,
      jfbThrottle: 4,
      async init(s, warmup) {
        await ready(s);
        await s.click('#run');
        await s.waitFor(textIs(td(1000, 1), '1000'));
        if (warmup) {
          await s.click(`${td(5, 2)}>a`);
          await s.waitFor(`document.querySelector('tbody>tr:nth-of-type(5)').classList.contains('danger')`);
        }
        return { kind: 'click', selector: `${td(2, 2)}>a` };
      },
      check: (s) => expectTrue(s, `document.querySelector('tbody>tr:nth-of-type(2)').classList.contains('danger')`, 'row 2 selected'),
    },
    {
      ...base,
      id: `${prefix}:05_swap1k`,
      jfbThrottle: 4,
      async init(s, warmup) {
        await ready(s);
        await s.click('#run');
        await s.waitFor(exists(td(1000, 1)));
        for (let i = 0; warmup && i <= WU; i++) {
          await s.click('#swaprows');
          await s.waitFor(textIs(td(999, 1), i % 2 === 0 ? '2' : '999'));
        }
        return { kind: 'click', selector: '#swaprows' };
      },
      check: (s) =>
        expectTrue(
          s,
          `(() => { const a = document.querySelector('${td(999, 1)}').textContent, b = document.querySelector('${td(2, 1)}').textContent; return (a === '999' && b === '2') || (a === '2' && b === '999'); })()`,
          'rows 2 and 999 swapped',
        ),
    },
    {
      ...base,
      id: `${prefix}:06_remove-one-1k`,
      jfbThrottle: 2,
      async init(s, warmup) {
        await ready(s);
        await s.click('#run');
        await s.waitFor(exists(td(1000, 1)));
        const skip = 4;
        if (warmup) {
          for (let i = 0; i < WU; i++) {
            const row = WU - i + skip;
            await s.click(`${td(row, 3)}>a>span:nth-of-type(1)`);
            await s.waitFor(textIs(td(row, 1), String(skip + WU + 1)));
          }
          await s.click(`${td(skip + 2, 3)}>a>span:nth-of-type(1)`);
          await s.waitFor(textIs(td(skip + 2, 1), String(skip + WU + 3)));
        }
        return { kind: 'click', selector: `${td(skip, 3)}>a>span:nth-of-type(1)` };
      },
      check: (s) => expectTrue(s, `document.querySelector('${td(4, 1)}').textContent !== '4'`, 'row 4 removed'),
    },
    {
      ...base,
      id: `${prefix}:07_create10k`,
      async init(s, warmup) {
        await ready(s);
        for (let i = 0; warmup && i < WU; i++) {
          await s.click('#run');
          await s.waitFor(textIs(td(1, 1), String(i * 1000 + 1)));
          await s.click('#clear');
          await s.waitFor(`!${exists(td(1000, 1))}`);
        }
        return { kind: 'click', selector: '#runlots' };
      },
      check: (s) => expectTrue(s, exists(`${td(10000, 2)}>a`), 'row 10000 exists'),
    },
    {
      ...base,
      id: `${prefix}:08_create1k-after1k_x2`,
      async init(s, warmup) {
        await ready(s);
        for (let i = 0; warmup && i < WU; i++) {
          await s.click('#run');
          await s.waitFor(textIs(td(1, 1), String(i * 1000 + 1)));
          await s.click('#clear');
          await s.waitFor(`!${exists(td(1000, 1))}`);
        }
        await s.click('#run');
        await s.waitFor(exists(td(1000, 1)));
        return { kind: 'click', selector: '#add' };
      },
      check: (s) => expectTrue(s, exists(td(2000, 1)), 'row 2000 exists'),
    },
    {
      ...base,
      id: `${prefix}:09_clear1k_x8`,
      jfbThrottle: 4,
      async init(s, warmup) {
        await ready(s);
        for (let i = 0; warmup && i < WU; i++) {
          await s.click('#run');
          await s.waitFor(textIs(td(1, 1), String(i * 1000 + 1)));
          await s.click('#clear');
          await s.waitFor(`!${exists(td(1000, 1))}`);
        }
        await s.click('#run');
        await s.waitFor(exists(td(1000, 1)));
        return { kind: 'click', selector: '#clear' };
      },
      check: (s) => expectTrue(s, `!${exists(td(1, 1))}`, 'table cleared'),
    },
    // Memory benchmarks (jfb 21/22/25) and leak cycles. The op is the last step;
    // memory mode measures after it, timing mode times it.
    {
      ...base,
      id: `${prefix}:22_run-memory`,
      async init(s) {
        await ready(s);
        return { kind: 'click', selector: '#run' };
      },
      check: (s) => expectTrue(s, exists(td(1000, 1)), 'row 1000 exists'),
    },
    ...[1, 5, 20].map(
      (cycles): Workload => ({
        ...base,
        id: `${prefix}:cycle-run-clear-${cycles}`,
        async init(s) {
          await ready(s);
          for (let i = 0; i < cycles; i++) {
            await s.click('#run');
            await s.waitFor(textIs(td(1, 1), String(i * 1000 + 1)));
            if (i < cycles - 1) {
              await s.click('#clear');
              await s.waitFor(`!${exists(td(1, 1))}`);
            }
          }
          return { kind: 'click', selector: '#clear' };
        },
        check: (s) => expectTrue(s, `!${exists(td(1, 1))}`, 'table cleared'),
      }),
    ),
  ];
}

/** Apps implementing the window.__bench harness (apps/shared/harness.js). */
function harnessWorkload(id: string, app: string, root: string, caseName: string | null, query?: string): Workload {
  return {
    id,
    app,
    root,
    query,
    async init(s, warmup) {
      await s.waitFor('window.__bench && window.__bench.ready');
      const prepare = async () =>
        (await s.evaluate<string | null>(`window.__bench.prepare(${JSON.stringify(caseName)}) ?? null`)) ??
        (await s.evaluate<string>('window.__bench.op'));
      let selector = await prepare();
      // Warmup: run the op a few times untimed, re-preparing before each.
      for (let i = 0; warmup && i < 3; i++) {
        const key = await s.evaluate<string | undefined>('window.__bench.key');
        if (key) {
          await s.pressKey(selector, key);
        } else {
          await s.click(selector);
        }
        await s.frames(1);
        selector = await prepare();
      }
      const key = await s.evaluate<string | undefined>('window.__bench.key');
      return key ? { kind: 'key', selector, key } : { kind: 'click', selector };
    },
    check: async () => null,
  };
}

/** Sustained rAF-driven updates (window.__bench.startLoop) for frame statistics. */
function loopWorkload(id: string, app: string, root: string): Workload {
  return {
    id,
    app,
    root,
    async init(s) {
      await s.waitFor('window.__bench && window.__bench.ready');
      return { kind: 'loop', selector: '' };
    },
    check: async () => null,
  };
}

function uibenchCaseNames(): string[] {
  uibenchInit('Inferno', 'bench', {});
  uibenchInitTests();
  return (uibenchConfig.tests ?? []).map((t: { name: string }) => t.name);
}

const EVENTS_STRATEGIES = ['native-hoisted', 'native-linkEvent', 'native-newFuncs', 'synthetic-hoisted', 'synthetic-linkEvent', 'synthetic-newFuncs'];

export function allWorkloads(): Workload[] {
  return [
    ...jfbWorkloads('jfb', 'jfb-keyed'),
    ...jfbWorkloads('jfb-nk', 'jfb-nonkeyed'),
    ...uibenchCaseNames().map((c) => harnessWorkload(`uibench:${c}`, 'uibench', '#App', c)),
    harnessWorkload('dbmonster:frame', 'dbmonster', '#app', null),
    harnessWorkload('1kcomponents:step', '1kcomponents', '#app', null),
    loopWorkload('dbmonster:loop', 'dbmonster', '#app'),
    loopWorkload('1kcomponents:loop', '1kcomponents', '#app'),
    ...EVENTS_STRATEGIES.flatMap((st) =>
      ['mount', 'patch', 'unmount', 'dispatch'].map((phase) => harnessWorkload(`events:${phase}:${st}`, 'events', '#App', `${phase}:${st}`)),
    ),
    ...Array.from({ length: 20 }, (_, i) => harnessWorkload(`fuzz:${i + 1}`, 'fuzz', '#app', String(i + 1))),
    harnessWorkload('typing:echo', 'typing', '#app', 'echo'),
    harnessWorkload('typing:filter-1k', 'typing', '#app', 'filter-1k'),
  ];
}

function globToRegExp(glob: string): RegExp {
  const escaped = glob.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.');
  return new RegExp(`^${escaped}$`);
}

export function selectWorkloads(patterns: string): Workload[] {
  const res = patterns.split(',').map((p) => globToRegExp(p.trim()));
  const all = allWorkloads();
  const picked = all.filter((w) => res.some((re) => re.test(w.id)));
  if (picked.length === 0) {
    throw new Error(`No workloads match "${patterns}"`);
  }
  return picked;
}
