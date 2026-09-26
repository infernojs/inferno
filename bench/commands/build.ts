import { parseArgs } from 'node:util';
import { buildApp } from '../apps/build.ts';
import { resolveApps } from '../apps/registry.ts';
import { buildOptionMatrix } from '../lib/options.ts';
import { ensureVariant } from '../variants/build.ts';
import { parseVariantList } from '../variants/spec.ts';

export default async function build(argv: string[]): Promise<number> {
  const { values } = parseArgs({
    args: argv,
    options: {
      variants: { type: 'string' },
      apps: { type: 'string' },
      transform: { type: 'string' },
      minify: { type: 'string' },
    },
  });
  const variants = parseVariantList(values.variants);
  const apps = resolveApps(values.apps);
  const matrix = buildOptionMatrix(values.transform, values.minify);

  for (const spec of variants) {
    const variant = await ensureVariant(spec);
    const inferno = variant.manifest.packages.inferno;
    console.log(`${spec.id}: inferno ${inferno.version} -> ${variant.dir}`);
    if (variant.manifest.buildLog?.includes('tsc exited')) {
      console.warn(`  warning: tsc reported diagnostics (see manifest.json buildLog)`);
    }
    for (const app of apps) {
      for (const options of matrix) {
        const built = await buildApp(app, variant, options);
        const js = built.manifest.files['main.js'];
        console.log(`  ${app.name} [${options.transform}, ${options.minify ? 'min' : 'nomin'}] ${js.bytes} B -> ${built.dir}`);
      }
    }
  }
  return 0;
}
