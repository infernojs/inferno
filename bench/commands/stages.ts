import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { buildApp } from '../apps/build.ts';
import { APPS } from '../apps/registry.ts';
import { type HeadlessMode, resolveBrowser } from '../lib/browsers.ts';
import { snapshotEnv } from '../lib/env.ts';
import { buildOptionMatrix } from '../lib/options.ts';
import { CHROMIUM_SRC, cachePath } from '../lib/paths.ts';
import { median, seededShuffle, shift } from '../lib/stats.ts';
import { table } from '../lib/util.ts';
import { launchBrowser } from '../runner/launch.ts';
import { PageSession } from '../runner/session.ts';
import { TRACE_CATEGORIES } from '../runner/tracing.ts';
import { selectWorkloads, type Workload } from '../runner/workloads.ts';
import { startServer } from '../server/server.ts';
import { ensureVariant } from '../variants/build.ts';
import { parseVariantList } from '../variants/spec.ts';

/**
 * Instructions per rendering stage, from InfernoProf's per-event hardware counters
 * (INFERNO_BENCH_PMU=1): the self instructions of every renderer main-thread slice in the
 * op window, grouped like the trace mode's stages. Traces are Perfetto protos analysed with
 * trace_processor_shell (JSON conversion can't carry the extra counters).
 */
const STAGES = ['script', 'gc', 'style', 'layout', 'prepaint', 'paint', 'layerize', 'commit', 'hittest', 'harness', 'other'] as const;
type Stage = (typeof STAGES)[number];

const STAGE_SQL = `
case
  when is_harness then 'harness'
  when name in ('FunctionCall', 'EventDispatch', 'EvaluateScript', 'v8.run', 'v8.callFunction', 'V8.Execute', 'RunMicrotasks',
                'TimerFire', 'FireAnimationFrame', 'FireIdleCallback', 'v8.compile', 'V8.CompileCode') then 'script'
  when name in ('MinorGC', 'MajorGC') or name like 'V8.GC%' or name like 'BlinkGC%' or name like 'CppGC%' then 'gc'
  when name in ('UpdateLayoutTree', 'RecalculateStyles', 'ScheduleStyleRecalculation') then 'style'
  when name = 'Layout' then 'layout'
  when name = 'PrePaint' then 'prepaint'
  when name in ('Paint', 'PaintImage') then 'paint'
  when name in ('Layerize', 'UpdateLayer') then 'layerize'
  when name = 'Commit' then 'commit'
  when name = 'HitTest' then 'hittest'
  else 'other'
end`;

function stageQuery(windowNs: number): string {
  return `
drop table if exists main;
create perfetto table main as
  select s.id, s.ts, s.dur, s.name, s.parent_id, s.thread_instruction_delta as instr,
    coalesce(extract_arg(s.arg_set_id, 'debug.data.functionName'), '') like '__bench%' as is_harness
  from slice s join thread_track tt on s.track_id = tt.id join thread t using(utid)
  where t.name = 'CrRendererMain';
drop table if exists win;
create perfetto table win as
  select min(m.ts) as t0 from main m join slice s using(id)
  where m.name = 'EventDispatch' and extract_arg(s.arg_set_id, 'debug.data.type') in ('click', 'keydown');
with children as (select parent_id, sum(instr) as child from main group by parent_id),
self as (
  select m.*, m.instr - coalesce(c.child, 0) as self_instr from main m left join children c on c.parent_id = m.id
  where m.ts >= (select t0 from win) and m.ts < (select t0 from win) + ${windowNs} and m.instr is not null
)
select ${STAGE_SQL} as stage, sum(self_instr) as instr from self group by stage
union all
select 'min_delta', min(instr) from self;
`;
}

function traceProcessor(): string {
  const tp = join(CHROMIUM_SRC, 'out/InfernoProf/trace_processor_shell');
  if (!existsSync(tp)) {
    throw new Error(`${tp} not found: build it with autoninja -C out/InfernoProf trace_processor_shell`);
  }
  return tp;
}

function analyze(tp: string, trace: string, sqlFile: string): Record<Stage, number> {
  const out = execFileSync(tp, ['-q', sqlFile, trace], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 1 << 26 });
  const stages = Object.fromEntries(STAGES.map((s) => [s, 0])) as Record<Stage, number>;
  for (const line of out.split('\n')) {
    const m = /^"(\w+)",(-?\d+)/.exec(line.trim());
    if (m && m[1] === 'min_delta' && Number(m[2]) < 0) {
      // The counters are incremental: a slice spanning one of Chrome's periodic incremental-state
      // clears ends against a reset base and gets a negative delta, which also skews its parents.
      throw new Error('counter base reset inside the op window');
    }
    if (m && m[1] in stages) {
      stages[m[1] as Stage] = Number(m[2]);
    }
  }
  return stages;
}

async function recordProto(cdp: any, run: () => Promise<unknown>, file: string, settleMs: number): Promise<void> {
  await cdp.send('Tracing.start', {
    transferMode: 'ReturnAsStream',
    streamFormat: 'proto',
    traceConfig: { recordMode: 'recordUntilFull', includedCategories: TRACE_CATEGORIES, excludedCategories: ['*'] },
  });
  await new Promise((r) => setTimeout(r, 100));
  await run();
  await new Promise((r) => setTimeout(r, settleMs));
  const done = new Promise<string>((resolve) => cdp.once('Tracing.tracingComplete', (e: any) => resolve(e.stream)));
  await cdp.send('Tracing.end');
  const stream = await done;
  const chunks: Buffer[] = [];
  for (;;) {
    const c = await cdp.send('IO.read', { handle: stream, size: 1 << 22 });
    chunks.push(c.base64Encoded ? Buffer.from(c.data, 'base64') : Buffer.from(c.data, 'binary'));
    if (c.eof) {
      break;
    }
  }
  await cdp.send('IO.close', { handle: stream });
  writeFileSync(file, Buffer.concat(chunks));
}

interface Rec {
  block: number;
  variant: string;
  workload: string;
  stages: Record<Stage, number> | null;
  error: string | null;
}

export default async function stages(argv: string[]): Promise<number> {
  const { values } = parseArgs({
    args: argv,
    options: {
      variants: { type: 'string' },
      workloads: { type: 'string', default: 'jfb:0*' },
      blocks: { type: 'string', default: '3' },
      iters: { type: 'string', default: '3' },
      window: { type: 'string', default: '1500' },
      warmup: { type: 'string', default: 'jfb' },
      headless: { type: 'string', default: 'new' },
      transform: { type: 'string' },
      seed: { type: 'string', default: '1' },
      json: { type: 'boolean', default: false },
    },
  });
  const tp = traceProcessor();
  const specs = parseVariantList(values.variants);
  const workloads = selectWorkloads(values.workloads!);
  const headless = values.headless as HeadlessMode;
  const resolved = resolveBrowser('infernoprof', headless);
  const [options] = buildOptionMatrix(values.transform, 'on');
  const blocks = Number(values.blocks);
  const iters = Number(values.iters);
  const windowMs = Number(values.window);

  const tmp = mkdtempSync(join(cachePath('tmp'), 'stages-'));
  const sqlFile = join(tmp, 'stages.sql');
  writeFileSync(sqlFile, stageQuery(windowMs * 1e6));
  const server = await startServer();
  const urls = new Map<string, string>();
  for (const spec of specs) {
    const variant = await ensureVariant(spec);
    for (const appName of new Set(workloads.map((w) => w.app))) {
      const built = await buildApp(APPS[appName], variant, options);
      urls.set(`${spec.id}\0${appName}`, server.origin + server.mount(built.dir));
    }
  }
  const records: Rec[] = [];
  const envs = [];
  const started = Date.now();
  type Job = { variant: string; w: Workload };
  const jobs: Job[] = specs.flatMap((s) => workloads.flatMap((w) => Array.from({ length: iters }, () => ({ variant: s.id, w }))));
  try {
    for (let b = 0; b < blocks; b++) {
      envs.push(snapshotEnv());
      // perf_event_open is blocked by the renderer sandbox.
      const launched = await launchBrowser(resolved, { headless, sandbox: false, env: { INFERNO_BENCH_PMU: '1' } });
      const cdp = await launched.browser.target().createCDPSession();
      try {
        for (const [n, job] of seededShuffle(jobs, Number(values.seed) * 7919 + b).entries()) {
          if (!values.json) {
            process.stderr.write(`\rblock ${b + 1}/${blocks} ${n + 1}/${jobs.length} ${job.variant} ${job.w.id}`.padEnd(100).slice(0, 100));
          }
          const s = await PageSession.open(launched.browser, urls.get(`${job.variant}\0${job.w.app}`)! + (job.w.query ? `?${job.w.query}` : ''));
          const file = join(tmp, `${n}.pftrace`);
          try {
            const op = await job.w.init(s, values.warmup !== 'none');
            await s.evaluate('window.gc()');
            await s.frames(2);
            await recordProto(
              cdp,
              () => (op.kind === 'key' ? s.measuredKey(op.selector, op.key!) : s.measuredClick(op.selector)),
              file,
              200,
            );
            const error = await job.w.check(s);
            records.push({ block: b, variant: job.variant, workload: job.w.id, stages: analyze(tp, file, sqlFile), error });
          } catch (err) {
            records.push({ block: b, variant: job.variant, workload: job.w.id, stages: null, error: String(err instanceof Error ? err.message : err) });
          } finally {
            rmSync(file, { force: true });
            await s.close();
          }
        }
      } finally {
        await launched.close();
      }
    }
  } finally {
    await server.close();
    rmSync(tmp, { recursive: true, force: true });
    if (!values.json) {
      process.stderr.write(`\r${''.padEnd(100)}\r`);
    }
  }

  const baseId = specs[0].id;
  const total = (st: Record<Stage, number>) => STAGES.filter((x) => x !== 'harness').reduce((a, x) => a + st[x], 0);
  const report: any[] = [];
  const rows: (string | number)[][] = [];
  const blockMedians = (variant: string, w: string, f: (st: Record<Stage, number>) => number) =>
    Array.from({ length: blocks }, (_, b) =>
      median(records.filter((r) => r.variant === variant && r.workload === w && r.block === b && r.stages && !r.error).map((r) => f(r.stages!))),
    ).filter((x) => Number.isFinite(x));
  for (const w of workloads) {
    for (const spec of specs) {
      const entry: any = { workload: w.id, variant: spec.id, stages: {}, est: {} };
      for (const metric of ['total', ...STAGES] as const) {
        const f = (st: Record<Stage, number>) => (metric === 'total' ? total(st) : st[metric]);
        const mine = blockMedians(spec.id, w.id, f);
        entry.stages[metric] = median(mine);
        if (spec.id !== baseId) {
          const base = blockMedians(baseId, w.id, f);
          entry.est[metric] = mine.length >= 3 && base.length >= 3 ? shift(base, mine) : null;
        }
      }
      report.push(entry);
      const fmt = (x: number) => (Number.isFinite(x) ? (x / 1e6).toFixed(2) : '-');
      const delta = (metric: string) => {
        const e = entry.est[metric];
        return e ? `${e.pct >= 0 ? '+' : ''}${e.pct.toFixed(2)}% [${e.ciLow.toFixed(2)},${e.ciHigh.toFixed(2)}]` : '';
      };
      rows.push([
        spec.id === baseId ? w.id : '',
        spec.id,
        fmt(entry.stages.total),
        spec.id === baseId ? '' : delta('total'),
        ...['script', 'style', 'layout', 'prepaint', 'paint', 'gc', 'other'].map((m) => fmt(entry.stages[m]) + (spec.id === baseId ? '' : ` (${delta(m).split(' ')[0]})`)),
      ]);
    }
  }
  const out = {
    createdAt: new Date(started).toISOString(),
    durationS: (Date.now() - started) / 1000,
    options: { blocks, iters, windowMs, warmup: values.warmup, transform: options.transform },
    envs,
    records,
    report,
  };
  const outDir = cachePath('results', 'stages');
  mkdirSync(outDir, { recursive: true });
  const outFile = join(outDir, `${out.createdAt.replace(/[:.]/g, '-')}.json`);
  writeFileSync(outFile, JSON.stringify(out, null, 2));
  if (values.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(table(['workload', 'variant', 'Minstr', `Δ vs ${baseId} [95% CI]`, 'script', 'style', 'layout', 'prepaint', 'paint', 'gc', 'other'], rows));
    const errors = records.filter((r) => r.error);
    if (errors.length) {
      console.log(`\n${errors.length} iterations with errors, e.g. ${errors[0].variant} ${errors[0].workload}: ${errors[0].error}`);
    }
    console.log(`\nrenderer main thread, self instructions per stage (M); results: ${outFile}`);
  }
  return 0;
}
