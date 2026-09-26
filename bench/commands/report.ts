import { readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { cachePath } from '../lib/paths.ts';
import { readJson } from '../lib/util.ts';

function esc(s: unknown): string {
  return String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
}

function fmt(n: unknown, digits = 3): string {
  return typeof n === 'number' && Number.isFinite(n) ? n.toFixed(digits) : '';
}

/** Newest results file under results/<kind>/. */
function latest(kind: string): string {
  const dir = cachePath('results', kind);
  const files = readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => join(dir, f))
    .sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs);
  if (!files.length) {
    throw new Error(`No results in ${dir}`);
  }
  return files[0];
}

function rowsFor(data: any): { head: string[]; rows: string[][]; title: string } {
  if (data.report && data.mode) {
    const head = ['workload', 'variant', `median (${data.options?.metric ?? ''})`, 'Δ vs base [95% CI]', 'p', 'check'];
    const rows = data.report.map((r: any) => [
      r.workload,
      r.variant,
      fmt(r.summary?.median),
      r.est ? `${fmt(r.est.pct, 2)}% [${fmt(r.est.ciLow, 2)}, ${fmt(r.est.ciHigh, 2)}]${r.est.significant ? ' *' : ''}` : '',
      r.est ? fmt(r.est.p, 4) : '',
      (r.checksumOk ? 'ok' : 'DIFF') + (r.errors ? ` (${r.errors} errors)` : ''),
    ]);
    return { head, rows, title: `bench run — ${data.mode} (${data.browser?.name ?? ''})` };
  }
  if (data.report && data.options?.rounds !== undefined) {
    const head = ['case', 'variant', 'time/op (ns)', 'Δ [95% CI]', 'alloc B/op', 'DOM ops/op', 'check'];
    const rows = data.report.map((r: any) => [
      r.case,
      r.variant,
      fmt(r.time?.median, 0),
      r.est ? `${fmt(r.est.pct, 2)}% [${fmt(r.est.ciLow, 2)}, ${fmt(r.est.ciHigh, 2)}]${r.est.significant ? ' *' : ''}` : '',
      fmt(r.alloc, 0),
      fmt(
        Object.entries(r.dom ?? {})
          .filter(([k]) => !k.startsWith('get:'))
          .reduce((a, [, v]) => a + (v as number), 0),
        1,
      ),
      r.checksumOk ? 'ok' : 'DIFF',
    ]);
    return { head, rows, title: 'bench micro' };
  }
  if (data.rows) {
    const head = ['target', 'variant', 'raw', 'gzip', 'brotli', 'zstd'];
    const rows = data.rows.map((r: any) => [r.target, r.variant, r.sizes.raw, r.sizes.gzip, r.sizes.brotli, r.sizes.zstd].map(String));
    return { head, rows, title: 'bench size' };
  }
  throw new Error('Unrecognized results file');
}

/** Self-contained HTML (light/dark) for a results JSON file. */
export default async function report(argv: string[]): Promise<number> {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: { html: { type: 'string' }, kind: { type: 'string', default: 'run' } },
  });
  const file = positionals[0] ?? latest(values.kind!);
  const data = readJson(file);
  const { head, rows, title } = rowsFor(data);
  const out = values.html ?? file.replace(/\.json$/, '.html');
  const env = (data.envs?.[0] ?? data.env) as any;
  const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Inferno bench report</title>
<style>
:root { --bg: #fff; --fg: #1d1d1f; --muted: #6e6e73; --line: #e5e5ea; --bad: #c62828; --good: #2e7d32; }
@media (prefers-color-scheme: dark) { :root { --bg: #141416; --fg: #f2f2f7; --muted: #a1a1a6; --line: #2c2c2e; --bad: #ef5350; --good: #66bb6a; } }
body { background: var(--bg); color: var(--fg); font: 14px/1.45 system-ui, sans-serif; margin: 0; padding: 24px 16px; }
main { max-width: 1100px; margin: 0 auto; }
h1 { font-size: 20px; margin: 0 0 4px; } p.meta { color: var(--muted); margin: 0 0 20px; }
.wrap { overflow-x: auto; } table { border-collapse: collapse; width: 100%; font-variant-numeric: tabular-nums; }
th, td { text-align: left; padding: 6px 10px; border-bottom: 1px solid var(--line); white-space: nowrap; }
th { color: var(--muted); font-weight: 600; } td.sig { color: var(--bad); } td.imp { color: var(--good); } td.diff { color: var(--bad); font-weight: 600; }
</style></head><body><main>
<h1>${esc(title)}</h1>
<p class="meta">${esc(data.createdAt)} · ${esc(file)}${env ? ` · ${esc(env.cpuModel)} · load ${esc(env.loadavg?.map((l: number) => l.toFixed(2)).join(' '))}` : ''}</p>
<div class="wrap"><table><thead><tr>${head.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>
${rows
  .map(
    (r) =>
      `<tr>${r
        .map((c, i) => {
          const cls = /\*$/.test(c) ? (c.startsWith('-') ? 'imp' : 'sig') : c.startsWith('DIFF') ? 'diff' : '';
          return `<td${cls && i > 0 ? ` class="${cls}"` : ''}>${esc(c)}</td>`;
        })
        .join('')}</tr>`,
  )
  .join('\n')}
</tbody></table></div>
</main></body></html>
`;
  writeFileSync(out, html);
  console.log(out);
  return 0;
}
