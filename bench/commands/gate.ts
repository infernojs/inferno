import { appendFileSync, mkdirSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { REPO_DIR, cachePath } from '../lib/paths.ts';
import { run, table } from '../lib/util.ts';

interface Finding {
  kind: string;
  target: string;
  detail: string;
}

/**
 * Regression gate between two variants using only low-noise signals:
 *  1. micro suite (Node): exact DOM operations, final DOM checksum and
 *     allocated bytes per op (sampling heap profiler, 8 B interval);
 *  2. browser counters mode: main-thread user-space instructions per op,
 *     flagged when the lower CI bound exceeds --threshold percent.
 * Wall-clock time is reported by other commands but never gates.
 */
export default async function gate(argv: string[]): Promise<number> {
  const { values } = parseArgs({
    args: argv,
    options: {
      base: { type: 'string', default: 'src:master' },
      head: { type: 'string', default: 'local' },
      cases: { type: 'string', default: 'jfb/keyed/*,keyed/el/*,nonkeyed/el/*,mount/*,unmount/*,events/*,fuzz/*' },
      workloads: { type: 'string', default: 'jfb:0*' },
      blocks: { type: 'string', default: '3' },
      iters: { type: 'string', default: '2' },
      threshold: { type: 'string', default: '0.3' },
      'alloc-threshold': { type: 'string', default: '1' },
      'skip-browser': { type: 'boolean', default: false },
    },
  });
  const variants = `${values.base},${values.head}`;
  const threshold = Number(values.threshold);
  const allocThreshold = Number(values['alloc-threshold']);
  const findings: Finding[] = [];
  const improvements: Finding[] = [];

  // 1. Deterministic micro metrics (one round: they don't vary between runs).
  const micro = await import('./micro.ts');
  await micro.default(['--variants', variants, '--cases', values.cases!, '--rounds', '1']);
  const byCase = new Map<string, any[]>();
  for (const r of micro.lastReport) {
    byCase.set(r.case, [...(byCase.get(r.case) ?? []), r]);
  }
  for (const [c, [base, head]] of byCase) {
    if (!base || !head) {
      continue;
    }
    if (!head.checksumOk) {
      findings.push({ kind: 'rendering', target: c, detail: 'final DOM differs from base' });
    }
    const keys = [...new Set([...Object.keys(base.dom), ...Object.keys(head.dom)])];
    const changed = keys.filter((k) => (base.dom[k] ?? 0) !== (head.dom[k] ?? 0));
    if (changed.length) {
      const detail = changed.map((k) => `${k} ${base.dom[k] ?? 0}→${head.dom[k] ?? 0}`).join(', ');
      const worse = changed.some((k) => (head.dom[k] ?? 0) > (base.dom[k] ?? 0));
      (worse ? findings : improvements).push({ kind: 'dom ops', target: c, detail });
    }
    const allocPct = base.alloc ? ((head.alloc - base.alloc) / base.alloc) * 100 : 0;
    if (Math.abs(allocPct) >= allocThreshold && Math.abs(head.alloc - base.alloc) >= 64) {
      const detail = `${Math.round(base.alloc)}→${Math.round(head.alloc)} B/op (${allocPct >= 0 ? '+' : ''}${allocPct.toFixed(1)}%)`;
      (allocPct > 0 ? findings : improvements).push({ kind: 'allocation', target: c, detail });
    }
  }

  // 2. Main-thread instructions in the browser (hardware counters).
  if (!values['skip-browser']) {
    const runCmd = await import('./run.ts');
    await runCmd.default([
      '--mode',
      'counters',
      '--variants',
      variants,
      '--workloads',
      values.workloads!,
      '--blocks',
      values.blocks!,
      '--iters',
      values.iters!,
    ]);
    for (const r of runCmd.lastReport) {
      if (!r.est) {
        continue;
      }
      const detail = `instructions ${r.est.pct >= 0 ? '+' : ''}${r.est.pct.toFixed(2)}% [${r.est.ciLow.toFixed(2)}, ${r.est.ciHigh.toFixed(2)}]`;
      if (r.est.ciLow > threshold) {
        findings.push({ kind: 'instructions', target: r.workload, detail });
      } else if (r.est.ciHigh < -threshold) {
        improvements.push({ kind: 'instructions', target: r.workload, detail });
      }
    }
  }

  // History: one line per gate run, keyed by the head commit.
  const head = (await run('git', ['-C', REPO_DIR, 'rev-parse', 'HEAD'])).stdout.trim();
  const dirty = (await run('git', ['-C', REPO_DIR, 'status', '--porcelain', '--', 'packages'])).stdout.trim() !== '';
  mkdirSync(cachePath('history'), { recursive: true });
  appendFileSync(
    cachePath('history', 'gate.jsonl'),
    JSON.stringify({ at: new Date().toISOString(), head, dirty, base: values.base, findings, improvements }) + '\n',
  );

  console.log(`\n=== gate: ${values.head} vs ${values.base} ===`);
  if (improvements.length) {
    console.log('\nImprovements');
    console.log(table(['kind', 'target', 'detail'], improvements.map((f) => [f.kind, f.target, f.detail])));
  }
  if (findings.length) {
    console.log('\nRegressions');
    console.log(table(['kind', 'target', 'detail'], findings.map((f) => [f.kind, f.target, f.detail])));
    return 1;
  }
  console.log('\nNo regressions.');
  return 0;
}
