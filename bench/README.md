# Inferno perf lab

Measures Inferno at every level (bundle bytes, per-op JS work, DOM operations,
allocations, JIT behaviour, rendering pipeline stages, input latency, frames,
memory) with low-noise metrics, so that small wins and regressions can be
proven rather than guessed.

```sh
pnpm bench setup    # assets + pinned Chrome for Testing 152/153 (~1.3 GB, cached)
pnpm bench doctor   # read-only machine report: load, clocks, PMU, disk, browsers
pnpm bench help
```

Everything built or measured lives in `~/.cache/inferno-bench` (override with
`INFERNO_BENCH_CACHE`), never in the repository.

## Variants

Every command takes `--variants a,b,...`; the first one is the baseline.

| spec | meaning |
| --- | --- |
| `local` | the working tree (including uncommitted changes) |
| `src:<ref>` | sources of any git ref, built with the current toolchain |
| `npm:<version>` | published packages from npm |
| `…+spin:<fn>:<n>us` | canary: busy-wait n µs on every call of `<fn>` |
| `…+alloc:<fn>:<n>` | canary: allocate an n-element array per call |
| `…+domop:<fn>` | canary: one extra `setAttribute` per call |
| `…@tag` | an identical copy for A/A runs (`local@A,local@B`) |

Source variants run the repository's own pipeline (`tsc` → `move-compiled` →
`scripts/rollup/build.js`) in a cache work dir; their `dist` output is
byte-identical to `pnpm run build`. A per-module size attribution
(`modules.json`) comes from a separate analysis pass.

Canaries are the lab's calibration: every mode must see an injected cost at its
known size before its results are trusted (see "Validation" below).

## Commands and what they measure

| command | runtime | primary metrics |
| --- | --- | --- |
| `size` | – | raw / gzip-9 / brotli-11 / zstd-19 of inferno bundles and every app, jfb's `42_size-compressed`, per-module minified bytes (`--modules`), budgets (`budgets.json`) |
| `micro` | Node (or d8) | ns/op, **exact allocated bytes/op** (sampling heap profiler, 8 B interval, with top allocation sites), **exact DOM operations/op** (counting DOM shim), final-DOM checksum, hidden-class checks (`--maps`); `--steady` warms up for 2× and runs 3× a case's iterations and takes statistics over the last half, so a median can't land on a JIT tier plateau that one variant leaves later |
| `run --mode timing` | Chrome | input dispatch → end of next frame's main-thread work (untraced) |
| `run --mode trace` | Chrome | jfb-compatible total (identical to js-framework-benchmark on its own traces) and **self time per stage**: script, gc, style, layout, prepaint, paint, layerize, commit, idle, harness; default metric `busy` = total − idle − harness |
| `run --mode counters` | Chrome | **user-space instructions**, cycles, branch/L1D misses of the renderer main thread (op minus a null op), plus compositor and GPU-process threads |
| `run --mode alloc` | InfernoProf Chrome | **V8 bytes allocated**, GCs and main-thread instructions per op (input → end of the next frame) and over `--window` ms (animation frames included), from `infernoBenchCounters()` in the page, op minus a null op. Use `--warmup 30` for steady-state allocation: with the usual 3 warmups, code and feedback of functions still tiering up land in the op. The counter includes code that V8 compiles during the window, which makes some iterations outliers (+0.3–0.6 MiB): compare medians of ≥ 3 blocks |
| `run --mode domcalls` | Chrome | exact counts of layout reads, `getComputedStyle`, inline and computed style reads and writes, class changes, listeners, Web Animations queries, timers/rAF and tree mutations, per op, window and settled second (op minus a null op); `--baseline save\|check` against `baselines/animcalls.json` |
| `run --mode allocsites` | Chrome | sampled allocation sites over the window (sampling heap profiler, 64 B interval, collected objects included) mapped through the app's source map to functions; KiB per package (inferno, inferno-animation, app, harness) |
| `run --mode memory` | Chrome | JS heap and Blink (embedder) heap after 2 GCs, `measureUserAgentSpecificMemory`, live DOM nodes/layout objects/listeners, heap-snapshot objects by constructor (`--snapshot`) |
| `run --mode latency` | Chrome | Chrome's EventLatency: OS input → presentation, with every stage (queueing, main-thread processing, commit, activation, submit → present) |
| `run --mode frames` | Chrome | sustained rAF loops (dbmonster, 1k components): presented/dropped frames, p50/p99 frame pipeline time, main-thread ms per frame |
| `stages` | InfernoProf Chrome | self instructions per rendering stage over `--window` ms (script, gc, style, layout, prepaint, paint, layerize, commit, …), plus Layout and UpdateLayoutTree counts, how many of them script forced, and GC counts |
| `profile` | Chrome under `perf` | native + JIT cycles of the renderer main thread cut to the exact op windows (subsystem rollup + top symbols, `hotspot`-ready `perf.jit.data`), CDP CPU profile for JS self time per function |
| `jit` | Chrome | V8 IC/map/deopt logs → polymorphic/megamorphic IC sites and deopts in app code |
| `leak` | Chrome | run/clear cycles (jfb apps) or prepare/op cycles of a harness case (`--app anim --case …`): 3 heap snapshots, survivors with retaining paths, JS and Blink heap, DOM nodes and JS event listeners |
| `aa` | any | A/A (same variant twice): false-positive rate and detectable change |
| `gate` | Node + Chrome | regression gate on DOM ops, allocations and instructions |
| `check` | Node | CI gate: hidden classes, DOM ops + checksums vs `baselines/domops.json`, size budgets |
| `verify-shim` | Node | the counting DOM shim vs jsdom: identical DOM after every fuzz step and every case |
| `chromium …` | – | InfernoProf Chromium build (below) |

Workloads (`--workloads`, globs): `jfb:*` / `jfb-nk:*` (the jfb ops, same
warmups and checks as js-framework-benchmark, plus `22_run-memory` and
`cycle-run-clear-{1,5,20}` leak cycles), `jfb-anim:*` (inferno-animation imported, nothing
animated), `jfb-fade:*` / `jfb-move:*` (the jfb ops with AnimatedComponent /
AnimatedAllComponent rows), `uibench:*` (96 cases), `events:*`,
`fuzz:1..20`, `typing:echo|filter-1k`, `dbmonster:frame|loop`,
`1kcomponents:step|loop`, `anim:*` (inferno-animation on keyed lists: shuffle, rerender,
update-text, grow, leave and enter, shuffles deep in the DOM, scaled, with keyframe animations,
inline animation objects or function owners, 1000 items, a second shuffle or leaves while moves
or enters run, nested groups, a global page switch; `anim:stress` for frames mode). Micro cases (`--cases`, `pnpm bench micro --list`)
cover the jfb ops, keyed/non-keyed permutations, mount/unmount/patch, vNode
creation and normalization, setState/forceUpdate, event dispatch, uibench,
fuzz sequences and SSR.

## Method

* **Primary signals are deterministic or nearly so.** In order: exact DOM
  operations, exact allocated bytes, hardware instruction counts (run-to-run
  spread ≈ 0.05 %), then wall time. Wall time is never a CI gate.
* **Blocks.** One process (micro) or one browser launch (run) is a block;
  variants × workloads × iterations are randomly interleaved inside each block
  and every browser iteration gets a fresh BrowserContext (a new renderer).
  Comparisons use per-block medians.
* **Exact intervals.** Shifts are Hodges-Lehmann estimates with the exact
  distribution-free Moses interval (Mann-Whitney), which keeps its 95 %
  coverage with 3–10 blocks (bootstrap intervals do not). `aa` measures the
  resulting false-positive rate and detection floor on this machine.
* **Determinism.** Seeded PRNGs in every app, local copies of all assets, fixed
  window size and DPR, one shared Chrome flag profile (field trials off,
  background throttling off, the WebUI omnibox popup renderer disabled),
  hover state settled before the measured input, real CDP input events.
* **Correctness.** Every op is checked (jfb's own checks) and the final DOM is
  checksummed and compared across variants: a variant cannot win by rendering
  something else.
* **No machine tuning.** Nothing writes to sysfs; `doctor` reports the noise
  sources (governor, boost, SMT, pressure, temperature, running builds) and
  every results file records them. `--pin ccd0` uses user-level `taskset` only.

## Validation (done on a Ryzen 9 5950X, Chrome for Testing 152)

* jfb-compatible total vs js-framework-benchmark's `computeResultsCPU` on its
  36 saved traces: max difference 0.0000 ms.
* shim vs jsdom: 20/20 fuzz sequences identical over 40 steps, 174/174 cases
  identical final DOM.
* canaries: `+alloc:mountElement:100` → +848,855 B/op measured for 1001 calls ×
  848 B; `+domop` → exactly +1 setAttribute/op; `+spin:patchKeyedChildren:500us`
  → +0.47 / +0.57 ms busy, attributed to the script stage.
* A/A: micro 2/31 false positives (6.5 %, nominal 5 %), median detectable
  wall-time change ±5.4 %; counters: instruction CIs ≈ ±0.1 %.
* `--parallel 4` (alloc): same medians as serial runs within iteration noise, 3.7× faster.
* alloc mode: A/A 0/11 false positives (3 blocks × 3 iterations, default warmups);
  `+alloc:patch:8` → jfb select 92 → 588 KiB/op.

## InfernoProf (custom Chromium)

`bench/chromium` holds **every** Chromium/V8/Perfetto source change as files
and patches; nothing is edited in the checkout by hand.

* `files/inferno_bench/` → `//inferno_bench`: the `inferno_bench` GN arg and a
  header-only per-thread `perf_event` group (instructions, cycles, branch and
  L1D misses) shared by all consumers.
* `patches/perfetto/0001` adds those counters to every trace event on a
  thread's own track (`thread_instruction_count` → trace_processor's
  `slice.thread_instruction_delta`), at runtime only with `INFERNO_BENCH_PMU=1`.
* `patches/v8/0001` adds `infernoBenchCounters()` to `--expose-statistics`:
  exact allocated bytes (minus unused LAB space), GC count and the thread's
  counters, for in-page and d8 bracketing.
* Patched code is gated by `__has_include("inferno_bench/enabled.h")`, a header
  the GN arg generates; no compiler flags change in any out dir, and every out
  dir except `out/InfernoProf` compiles the code out.

```sh
pnpm bench chromium preflight   # version, patch state, disk, no running build
pnpm bench chromium apply       # idempotent; `unapply` reverts everything
pnpm bench chromium build       # gn gen + nice -n19 autoninja chrome d8
pnpm bench chromium verify      # only out/InfernoProf has the instrumentation
pnpm bench micro --runtime d8 --metric instructions   # d8 from out/InfernoProf
pnpm bench run --browser infernoprof …
```

`args/InfernoProf.gn` is AutoExplore's release configuration with stock x86-64
codegen, `symbol_level = 1` and `inferno_bench = true`.

## Notes

* Counters, profile and jit modes run Chrome with `--no-sandbox` (perf needs
  dumpable renderers; V8 writes jitdump/logs to the cwd). Timing, trace,
  latency, frames and memory keep the sandbox on.
* `--frames unthrottled` does not remove vsync waiting under `--headless=new`;
  use the `busy` metric (trace mode) for phase-independent main-thread time.
* CfT binaries have no symbols: `profile` defaults to `--browser autoexplore`
  (or `infernoprof` once built) for C++ names.
