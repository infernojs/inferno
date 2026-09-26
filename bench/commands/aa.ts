import { parseArgs } from 'node:util';
import { table } from '../lib/util.ts';

/**
 * A/A run: the same variant twice (X@A vs X@B) through micro, timing, trace or
 * memory mode. Every "significant" difference is a false positive; the CI
 * half-widths give the smallest change each metric can detect on this machine.
 */
export default async function aa(argv: string[]): Promise<number> {
  const { values, tokens } = parseArgs({
    args: argv,
    options: { mode: { type: 'string', default: 'micro' }, variant: { type: 'string', default: 'local' } },
    strict: false,
    tokens: true,
  });
  // Everything except --mode/--variant is passed through.
  const passthrough: string[] = [];
  for (const t of tokens ?? []) {
    if (t.kind === 'option' && (t.name === 'mode' || t.name === 'variant')) {
      continue;
    }
    if (t.kind === 'option') {
      passthrough.push(t.rawName, ...(t.value !== undefined && !t.inlineValue ? [t.value] : t.inlineValue ? [] : []));
      if (t.inlineValue) {
        passthrough[passthrough.length - 1] = `${t.rawName}=${t.value}`;
      }
    } else if (t.kind === 'positional') {
      passthrough.push(t.value);
    }
  }
  const variants = `${values.variant}@A,${values.variant}@B`;
  const mode = String(values.mode);
  let report: any[];
  if (mode === 'micro') {
    const micro = await import('./micro.ts');
    await micro.default(['--variants', variants, ...passthrough]);
    report = micro.lastReport;
  } else {
    const run = await import('./run.ts');
    await run.default(['--mode', mode, '--variants', variants, ...passthrough]);
    report = run.lastReport;
  }

  const rows: (string | number)[][] = [];
  let tested = 0;
  let falsePositives = 0;
  const halfWidths: number[] = [];
  for (const r of report.filter((x) => x.est)) {
    tested++;
    const hw = (r.est.ciHigh - r.est.ciLow) / 2;
    halfWidths.push(hw);
    if (r.est.significant) {
      falsePositives++;
    }
    rows.push([r.case ?? r.workload, `${r.est.pct.toFixed(2)}%`, `±${hw.toFixed(2)}%`, r.est.significant ? 'FALSE POSITIVE' : '']);
  }
  console.log('\nA/A summary (B vs A; a real difference is impossible)');
  console.log(table(['case', 'shift', '95% CI half-width', ''], rows));
  if (tested === 0) {
    console.log('No confidence intervals: use at least 3 rounds/blocks.');
    return 1;
  }
  halfWidths.sort((a, b) => a - b);
  console.log(
    `\nfalse positives: ${falsePositives}/${tested} (${((falsePositives / tested) * 100).toFixed(1)}%, expected ≈5%)` +
      `\nmedian detectable change: ±${halfWidths[halfWidths.length >> 1].toFixed(2)}%`,
  );
  return 0;
}
