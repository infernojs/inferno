import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { freeBytes, snapshotEnv } from '../lib/env.ts';
import { CACHE_DIR, CHROMIUM_SRC, cachePath } from '../lib/paths.ts';
import { run } from '../lib/util.ts';

async function which(cmd: string): Promise<string | null> {
  const r = await run('sh', ['-c', `command -v ${cmd}`], { allowFail: true });
  return r.code === 0 ? r.stdout.trim() : null;
}

const GiB = 1024 ** 3;

export default async function doctor(argv: string[]): Promise<number> {
  const { values } = parseArgs({ args: argv, options: { json: { type: 'boolean', default: false } } });
  const env = snapshotEnv();
  const tools: Record<string, string | null> = {};
  for (const t of ['perf', 'hotspot', 'hyperfine', 'git', 'npm', 'pnpm']) {
    tools[t] = await which(t);
  }
  const chromium = {
    src: existsSync(CHROMIUM_SRC) ? CHROMIUM_SRC : null,
    autoexplore: existsSync(join(CHROMIUM_SRC, 'out/AutoExplore/chrome')),
    infernoProf: existsSync(join(CHROMIUM_SRC, 'out/InfernoProf/chrome')),
    freeGiB: existsSync(CHROMIUM_SRC) ? (freeBytes(CHROMIUM_SRC) ?? 0) / GiB : null,
  };
  const cache = {
    dir: CACHE_DIR,
    freeGiB: (freeBytes(existsSync(CACHE_DIR) ? CACHE_DIR : '/') ?? 0) / GiB,
    jfbAssets: existsSync(cachePath('assets/jfb/currentStyle.css')),
  };

  if (values.json) {
    console.log(JSON.stringify({ env, tools, chromium, cache }, null, 2));
    return 0;
  }

  const warn: string[] = [];
  const info: string[] = [];
  if (env.busyBuilds.length) {
    warn.push(`build processes running (${env.busyBuilds.join(', ')}): timing results will be noisy`);
  }
  if (env.governor.powersave) {
    info.push('governor powersave / EPP ' + Object.keys(env.epp).join(',') + ': clocks ramp per burst, rely on blocks + A/A');
  }
  if (env.boost === '1') {
    info.push('boost on: effective clock varies with temperature, use counters (instructions) as primary signal');
  }
  if (env.smt === '1') {
    info.push('SMT on: sibling hyperthreads share cores, consider --pin ccd0 (user-level taskset) after an A/A check');
  }
  if (env.nmiWatchdog === '1') {
    info.push('nmi_watchdog=1 holds one PMU counter: at most 5 hardware events per group on Zen 3');
  }
  if (env.perfEventParanoid !== null && Number(env.perfEventParanoid) > 2) {
    warn.push(`perf_event_paranoid=${env.perfEventParanoid}: user-space counters unavailable`);
  }
  const avg10 = Number(/some avg10=([\d.]+)/.exec(env.cpuPressure ?? '')?.[1] ?? 0);
  if (avg10 > 1) {
    warn.push(`CPU pressure some avg10=${avg10}%: other load is competing for CPUs`);
  }
  if (!cache.jfbAssets) {
    warn.push('jfb css assets missing: run `pnpm bench setup`');
  }
  if (chromium.freeGiB !== null && chromium.freeGiB < 120) {
    info.push(`only ${chromium.freeGiB.toFixed(0)} GiB free next to chromium: an InfernoProf out dir needs ~120 GiB`);
  }

  console.log(`CPU        ${env.cpuModel} (${env.logicalCpus} logical), ${(env.memBytes / GiB).toFixed(0)} GiB RAM`);
  console.log(`load       ${env.loadavg.map((l) => l.toFixed(2)).join(' ')}   pressure: ${env.cpuPressure?.split('\n')[0] ?? 'n/a'}`);
  console.log(`clocks     governor ${JSON.stringify(env.governor)} boost=${env.boost} smt=${env.smt}` + (env.freqMHz ? ` cur ${env.freqMHz.min.toFixed(0)}-${env.freqMHz.max.toFixed(0)} MHz` : ''));
  console.log(`perf       paranoid=${env.perfEventParanoid} rdpmc=${env.rdpmc ?? 'unreadable'} nmi_watchdog=${env.nmiWatchdog}`);
  const hot = Object.entries(env.temperatures).sort((a, b) => b[1] - a[1])[0];
  console.log(`thermal    ${hot ? `${hot[0]} ${hot[1].toFixed(1)}°C` : 'n/a'}`);
  console.log(`node       ${env.node}`);
  console.log(`tools      ${Object.entries(tools).map(([k, v]) => `${k}${v ? '' : ' (missing)'}`).join(', ')}`);
  console.log(`cache      ${cache.dir} (${cache.freeGiB.toFixed(0)} GiB free)`);
  console.log(
    `chromium   ${chromium.src ?? 'not found'}` +
      (chromium.src ? ` AutoExplore=${chromium.autoexplore} InfernoProf=${chromium.infernoProf} (${chromium.freeGiB?.toFixed(0)} GiB free)` : ''),
  );
  for (const i of info) {
    console.log(`note: ${i}`);
  }
  for (const w of warn) {
    console.log(`WARN: ${w}`);
  }
  return warn.length ? 1 : 0;
}
