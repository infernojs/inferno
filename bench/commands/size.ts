import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { minify } from 'terser';
import { buildApp } from '../apps/build.ts';
import { resolveApps } from '../apps/registry.ts';
import { jfbCompressed, measure, SIZE_KEYS, type Sizes } from '../lib/compress.ts';
import { buildOptionMatrix } from '../lib/options.ts';
import { BENCH_DIR, cachePath } from '../lib/paths.ts';
import { JFB_TERSER } from '../lib/terser.ts';
import { readJson, sha256, table } from '../lib/util.ts';
import { type BuiltVariant, ensureVariant, entryFile, type EntryKind } from '../variants/build.ts';
import type { ModuleReport } from '../variants/modules.ts';
import { parseVariantList } from '../variants/spec.ts';

interface SizeRow {
  variant: string;
  target: string;
  sizes: Sizes;
  /** js-framework-benchmark's 42_size-compressed equivalent (apps only). */
  jfbCompressed?: number;
}

interface Budgets {
  variant: string;
  limits: Record<string, Partial<Sizes>>;
}

const LIB_TARGETS: { name: string; kind: EntryKind; terser?: boolean }[] = [
  { name: 'inferno/esm', kind: 'prod-esm' },
  { name: 'inferno/esm+terser', kind: 'prod-esm', terser: true },
  { name: 'inferno/min-cjs', kind: 'min-cjs' },
  { name: 'inferno/min-umd', kind: 'min-umd' },
];

/** Minifies the prod ESM with jfb's terser settings, the size an app actually ships. */
async function terserEsm(file: string): Promise<Buffer> {
  const src = readFileSync(file);
  const out = cachePath('derived', 'esm-terser', `${sha256(src)}.js`);
  if (!existsSync(out)) {
    const min = await minify(src.toString('utf8'), JFB_TERSER);
    mkdirSync(cachePath('derived', 'esm-terser'), { recursive: true });
    writeFileSync(out, min.code ?? '');
  }
  return readFileSync(out);
}

async function libRows(variant: BuiltVariant): Promise<SizeRow[]> {
  const rows: SizeRow[] = [];
  for (const t of LIB_TARGETS) {
    const file = entryFile(variant, 'inferno', t.kind);
    if (!file) {
      continue;
    }
    const buf = t.terser ? await terserEsm(file) : readFileSync(file);
    rows.push({ variant: variant.spec.id, target: t.name, sizes: measure(buf) });
  }
  return rows;
}

function pct(a: number, b: number): string {
  if (b === 0) {
    return '';
  }
  const d = ((a - b) / b) * 100;
  return `${d >= 0 ? '+' : ''}${d.toFixed(2)}%`;
}

function printRows(rows: SizeRow[], variants: string[]): void {
  const targets = [...new Set(rows.map((r) => r.target))];
  for (const target of targets) {
    const group = rows.filter((r) => r.target === target);
    const base = group.find((r) => r.variant === variants[0]);
    const hasJfb = group.some((r) => r.jfbCompressed !== undefined);
    const head = ['variant', ...SIZE_KEYS, ...(hasJfb ? ['jfb-42'] : []), 'Δbrotli', 'Δbrotli%'];
    const body = group.map((r) => [
      r.variant,
      ...SIZE_KEYS.map((k) => r.sizes[k]),
      ...(hasJfb ? [r.jfbCompressed ?? ''] : []),
      base && r !== base ? r.sizes.brotli - base.sizes.brotli : '',
      base && r !== base ? pct(r.sizes.brotli, base.sizes.brotli) : '',
    ]);
    console.log(`\n${target}`);
    console.log(table(head, body));
  }
}

function printModules(built: BuiltVariant[]): void {
  const reports = built
    .map((v) => ({ id: v.spec.id, file: join(v.dir, 'modules.json') }))
    .filter((r) => existsSync(r.file))
    .map((r) => ({ id: r.id, report: readJson<ModuleReport>(r.file) }));
  if (reports.length === 0) {
    console.log('\n(no module reports: npm variants have no sources)');
    return;
  }
  const names = [...new Set(reports.flatMap((r) => r.report.modules.map((m) => m.module)))];
  const minOf = (r: (typeof reports)[number], name: string) => r.report.modules.find((m) => m.module === name)?.minified ?? 0;
  names.sort((a, b) => minOf(reports[0], b) - minOf(reports[0], a));
  const head = ['module (minified bytes)', ...reports.map((r) => r.id), ...(reports.length > 1 ? ['Δ last-first'] : [])];
  const body = names.map((name) => {
    const vals = reports.map((r) => minOf(r, name));
    return [name, ...vals, ...(reports.length > 1 ? [vals[vals.length - 1] - vals[0]] : [])];
  });
  body.push(['TOTAL', ...reports.map((r) => r.report.totalMinified), ...(reports.length > 1 ? [''] : [])]);
  console.log('\ninferno prod ESM, per module (jfb terser, sourcemap attribution)');
  console.log(table(head, body));
}

function checkBudgets(rows: SizeRow[], budgets: Budgets): string[] {
  const violations: string[] = [];
  for (const [target, limits] of Object.entries(budgets.limits)) {
    const row = rows.find((r) => r.variant === budgets.variant && r.target === target);
    if (!row) {
      continue;
    }
    for (const [key, limit] of Object.entries(limits)) {
      const actual = row.sizes[key as keyof Sizes];
      if (limit !== undefined && actual > limit) {
        violations.push(`${target} ${key}: ${actual} B > budget ${limit} B (+${actual - limit})`);
      }
    }
  }
  return violations;
}

export default async function size(argv: string[]): Promise<number> {
  const { values } = parseArgs({
    args: argv,
    options: {
      variants: { type: 'string' },
      apps: { type: 'string' },
      transform: { type: 'string' },
      minify: { type: 'string' },
      budget: { type: 'string' },
      modules: { type: 'boolean', default: false },
      json: { type: 'boolean', default: false },
    },
  });
  const specs = parseVariantList(values.variants);
  const apps = resolveApps(values.apps);
  const matrix = buildOptionMatrix(values.transform, values.minify);

  const rows: SizeRow[] = [];
  const built: BuiltVariant[] = [];
  for (const spec of specs) {
    const variant = await ensureVariant(spec);
    built.push(variant);
    rows.push(...(await libRows(variant)));
    for (const app of apps) {
      for (const options of matrix) {
        const b = await buildApp(app, variant, options);
        const js = readFileSync(join(b.dir, 'main.js'));
        const html = readFileSync(join(b.dir, 'index.html'));
        rows.push({
          variant: spec.id,
          target: `app/${app.name}/${options.transform}-${options.minify ? 'min' : 'nomin'}`,
          sizes: measure(js),
          jfbCompressed: jfbCompressed([html, js]),
        });
      }
    }
  }

  const result = { createdAt: new Date().toISOString(), variants: built.map((v) => v.manifest), rows };
  const outDir = cachePath('results', 'size');
  mkdirSync(outDir, { recursive: true });
  const outFile = join(outDir, `${result.createdAt.replace(/[:.]/g, '-')}.json`);
  writeFileSync(outFile, JSON.stringify(result, null, 2));

  if (values.json) {
    console.log(JSON.stringify(rows, null, 2));
  } else {
    printRows(
      rows,
      specs.map((s) => s.id),
    );
    if (values.modules) {
      printModules(built);
    }
    console.log(`\nresults: ${outFile}`);
  }

  const budgetFile = values.budget ?? join(BENCH_DIR, 'budgets.json');
  if (existsSync(budgetFile)) {
    const violations = checkBudgets(rows, readJson<Budgets>(budgetFile));
    if (violations.length) {
      console.error(`\nBudget violations (${budgetFile}):\n  ${violations.join('\n  ')}`);
      return 1;
    }
  }
  return 0;
}
