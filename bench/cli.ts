#!/usr/bin/env node
interface Command {
  summary: string;
  usage: string;
  run: (argv: string[]) => Promise<number | void>;
}

const commands: Record<string, Command> = {
  build: {
    summary: 'Build variants and apps into the cache',
    usage: 'build --variants local,src:v9.1.0,npm:9.1.0 [--apps jfb-keyed,...] [--transform babel|swc] [--minify on|off]',
    run: async (argv) => (await import('./commands/build.ts')).default(argv),
  },
  size: {
    summary: 'Bundle size report (raw/min/gzip/brotli/zstd) with budgets',
    usage: 'size --variants local,npm:9.1.0 [--apps ...] [--budget bench/budgets.json] [--json]',
    run: async (argv) => (await import('./commands/size.ts')).default(argv),
  },
  micro: {
    summary: 'Node micro suite: ns/op, alloc B/op, exact DOM ops/op, checksums (counting DOM shim)',
    usage: "micro --variants local,src:reproduce_issues [--cases 'jfb/keyed/*'] [--rounds 5] [--runtime node|d8 [--d8 <path>] [--metric time|instructions]] [--deterministic] [--gc-each] [--list] [--maps] [--ops] [--alloc-sites]",
    run: async (argv) => (await import('./commands/micro.ts')).default(argv),
  },
  run: {
    summary: 'Browser measurements: timing, trace (jfb total + stages), memory, counters (PMU), latency (input→present), frames',
    usage:
      "run --mode timing|trace|memory|counters|latency|frames [--snapshot] [--duration ms] [--frames vsync|unthrottled] [--metric busy|jfb|total|jsHeap|embedderHeap|uaMemory] --variants local,npm:9.1.0 --workloads 'jfb:*' [--browser cft-152] [--headless new|shell|off] [--blocks 5 --iters 3] [--warmup jfb|none] [--throttle none|jfb] [--pin none|ccd0] [--sandbox on|off]",
    run: async (argv) => (await import('./commands/run.ts')).default(argv),
  },
  profile: {
    summary: 'perf record (cycles:u, fp call graphs, jitdump) + CDP CPU profile, gated to measured ops',
    usage: "profile --variants local --workloads 'jfb:01_run1k' [--iters 20] [--browser autoexplore|cft-152] [--freq 20000] [--minify off]",
    run: async (argv) => (await import('./commands/profile.ts')).default(argv),
  },
  jit: {
    summary: 'V8 IC/map/deopt logging of measured ops: polymorphic/megamorphic sites and deopts in app code',
    usage: "jit --variants local --workloads 'jfb:*' [--iters 1] [--minify off]",
    run: async (argv) => (await import('./commands/jit.ts')).default(argv),
  },
  aa: {
    summary: 'A/A run (X@A vs X@B): false-positive rate and detectable change per metric',
    usage: "aa --mode micro|timing|trace|memory|counters|latency [--variant local] [...options of that mode]",
    run: async (argv) => (await import('./commands/aa.ts')).default(argv),
  },
  chromium: {
    summary: 'InfernoProf Chromium build: preflight, status, apply, unapply, build, verify',
    usage: 'chromium preflight|status|apply|unapply|build|verify',
    run: async (argv) => (await import('./commands/chromium.ts')).default(argv),
  },
  gate: {
    summary: 'Regression gate: exact DOM ops/allocations (micro) + main-thread instructions (counters) vs a base',
    usage: "gate [--base src:master] [--head local] [--cases ...] [--workloads 'jfb:0*'] [--threshold 0.3] [--skip-browser]",
    run: async (argv) => (await import('./commands/gate.ts')).default(argv),
  },
  report: {
    summary: 'Self-contained HTML report for a results file (default: newest run)',
    usage: 'report [results.json] [--kind run|micro|size] [--html out.html]',
    run: async (argv) => (await import('./commands/report.ts')).default(argv),
  },
  check: {
    summary: 'Deterministic CI gate: hidden classes, exact DOM ops + checksums vs baseline, size budgets',
    usage: 'check [--variant local] [--update]',
    run: async (argv) => (await import('./commands/check.ts')).default(argv),
  },
  'verify-shim': {
    summary: 'Cross-check the counting DOM shim against jsdom (fuzz traces + case checksums)',
    usage: 'verify-shim [--variant local] [--seeds 20] [--steps 40]',
    run: async (argv) => (await import('./commands/verify-shim.ts')).default(argv),
  },
  setup: {
    summary: 'Install cached assets (jfb css) and pinned Chrome for Testing builds',
    usage: 'setup [--force] [--no-browsers]',
    run: async (argv) => (await import('./commands/setup.ts')).default(argv),
  },
  doctor: {
    summary: 'Read-only machine, toolchain and browser health report',
    usage: 'doctor [--json]',
    run: async (argv) => (await import('./commands/doctor.ts')).default(argv),
  },
};

function help(): void {
  console.log('Usage: pnpm bench <command> [options]\n');
  for (const [name, cmd] of Object.entries(commands)) {
    console.log(`  ${name.padEnd(10)} ${cmd.summary}\n  ${''.padEnd(10)} ${cmd.usage}\n`);
  }
}

async function main(): Promise<void> {
  const [name, ...rest] = process.argv.slice(2);
  if (!name || name === 'help' || name === '--help' || name === '-h') {
    help();
    return;
  }
  const cmd = commands[name];
  if (!cmd) {
    console.error(`Unknown command "${name}"\n`);
    help();
    process.exitCode = 2;
    return;
  }
  const code = await cmd.run(rest);
  if (typeof code === 'number') {
    process.exitCode = code;
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? (err.stack ?? err.message) : err);
  process.exitCode = 1;
});
