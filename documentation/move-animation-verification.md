# Keyed move animation verification

Verified against master `1d7245f8e` and the original staged feature snapshot on
2026-09-27. The fixes also incorporate the useful parts of `anim/gate`,
`anim/scan-cache`, `anim/hooked-lists`, and `anim/anim-writes`.

## Implementation decisions

- Importing `inferno-animation` installs the optional registry through a guarded
  core adapter. Custom move hooks require that import. The core bundle contains
  no registry, animation scheduler, hook-owner counter, or synchronous flush bridge.
- Cached hookless lists skip animation reconciliation wrappers. Retained children
  match by position before a key map is allocated. Function-hook changes are
  checked when their hooks object changes. Class hooks are read live, so assigning
  one after mounting works; lists containing classes consequently remain candidates.
- Move preparation uses a deduplicated microtask for affected parents. Deferred
  leave completions share a frame, with every source read preceding removals.
  Synchronous completions remain immediate. Duplicate completions are harmless.
- Stationary items receive no animation style writes or computed-style reads.
  Browser animation queries run once per parent in each relevant phase. Active
  author transitions and entering/leaving elements are excluded from FLIP.
- The README documents the enter exclusion, optional import, deferred-removal
  timing, and pre-render snapshots inside retained wrappers.

## Review findings and coverage

| Finding | Resolution and verification |
| --- | --- |
| Author transitions cancelled on every patch | Active opacity, width, height, and transform transitions keep their identity and progress; includes plain siblings. Chromium and Firefox ownership specs. |
| Transition longhands lost through shorthand restoration | Preserve individual values and priorities, including `transition-behavior`; browser tests cover unchanged geometry, movement, and cleanup. |
| Synchronous global commit bridge | Removed `_QMC`, `_MTA`, `$CM`, and synchronous core flushes. Two synchronous commits share source/target passes; unrelated parents retain their schedules. |
| Enter exclusion undocumented | Explicit policy and deterministic browser test for reorder during a paused enter, followed by another reorder after enter finishes. |
| Portal reparenting | Transfer keyed Fragment registrations to the new physical container. Deferred-removal regression checks the survivor hook's parent. |
| Synchronous completion prepares another list mid-patch | Completion synchrony and parent patch depth prevent re-preparation. Regression uses two keyed Fragments under one non-keyed wrapper. |
| Repeated negative discovery and disabled-path overhead | Cache negative discovery until candidate topology changes; disabled core paths perform no registry lookups. Measured with the supplied lab. |
| Class hook assigned after construction missed | No global owner count; class candidates remain discoverable. Regression assigns the hook in `componentDidMount`. |
| Wrapper retention documentation | Document and test that a retained wrapper's existing descendant can be prepared before its render replaces it. |
| Later sibling throws after nested list advances | Record successful complex-keyed patches only after success and write them back on error. Small and large keyed branches verify recovery, current props, and deferred cleanup. |
| Nested render flushes outer batch too early | Microtask preparation waits until synchronous lifecycle work completes. Nested-render test observes no outer target reads inside the callback. |
| Browser and typing tests unwired | Both browser entries include inferno-animation; the server renderer alias supports browser bundling; typings file now has a `.spec.tsx` name. Transition progress uses paused/finished animations instead of elapsed-time assertions. |
| Text-first Fragment targets crash animation helpers | Shared element-only root lookup for appear/disappear/move. Text-first and text-only roots are tested. |
| Core bundle growth and obsolete code | Registry moved into inferno-animation; old move queue and bridge removed. Bundle measurements below. |
| Each leave completion remeasures every sibling | Four deferred completions, each invoked twice, produce one source pass over six nodes and one target pass over two survivors: eight rect reads. Throwing preparation hooks still allow completed removals. |

Tests are in `packages/inferno/__tests__/moveAnimationRegressions.spec.tsx`,
`moveAnimations.spec.tsx`, and the `layoutMoves` / `layoutOwnership` specs in
`packages/inferno-animation/__tests__`.

## Validation

- TypeScript `--noEmit`, the package build pipeline, lint on changed source/tests,
  and `git diff --check` pass.
- Full Jest: **3,470 passed**, 16 browser-only tests skipped, 14 snapshots passed.
  Separate server suite without a DOM: **13 passed**.
- Full browser matrix: **24 configurations passed**: Chromium/Firefox ×
  SWC/Babel/TypeScript × compat off/on × minification off/on. After the final
  animation-query batching change, the move-related suites were rerun in all
  24 configurations.
- ESM named/default compat exports share the adapter host and root resolver.
  Core-only imports leave the adapter absent; animation imports install it.
  SSR renders animated components without a DOM. Core UMD import smoke passes.
- A separate index and checkout were used to build and test the proposed patch,
  including browser wiring and new files, independently of generated docs bundles.
  The original working index was preserved.
- As a negative control, seven new core regressions fail against the original
  staged implementation. Seven ownership regressions also fail in both browsers
  against that implementation. Only the diagnostic tests/wiring were overlaid.

Normal repository commands for reproducing validation:

```sh
pnpm exec tsc --noEmit
pnpm run test:node --runInBand
pnpm run test:node-nodom --runInBand
pnpm run build
pnpm run test:transformers
```

Browser validation here used headless Selenium with the repository's webpack
configurations. Isolated checkouts reused installed dependencies and ran the
same TypeScript, compiled-file/type-copy, and Rollup build stages.

## Bundle size

`inferno.min.js`, same toolchain and compression settings for all three builds:

| Source | Minified bytes | gzip level 9 | Brotli quality 11 |
| --- | ---: | ---: | ---: |
| Master | 24,429 | 9,001 | 8,212 |
| Reviewed staged feature | 27,000 | 9,852 | 8,975 |
| Fixed | 24,795 | 9,140 | 8,312 |

The fixed core adds 366 raw bytes, 139 gzip bytes, and 100 Brotli bytes over
master. Animation-specific code is shipped by the optional package.

## Performance

Used an isolated copy of the supplied lab; its worktree was not edited. Chrome
152 instruction counters, three blocks and two iterations per workload, compared
with master:

| Ordinary workload | Fixed change | 95% interval |
| --- | ---: | ---: |
| jfb select | +0.8% | +0.7% to +1.4% |
| jfb swap | -2.5% | -2.7% to -2.2% |
| jfb remove one | -0.1% | -0.1% to +0.1% |
| dbmonster frame | +0.2% | -0.1% to +0.5% |
| 1kcomponents step | +0.1% | 0.0% to +0.2% |

Deterministic d8 samples show +0.5–1.5% for the three ordinary jfb operations and
+4.9–5.1% for select/removal with a move hook mounted elsewhere. Final DOM checks
and DOM-operation counts match master. These are focused samples, not a claim
that every workload has zero overhead.

The animation path retains necessary measurement and transition-ownership work.
Against `anim/anim-writes`, the final version adds roughly 0.6 million instructions
for a 100-item unchanged/text update. In an exploratory window extending through
animation completion, shuffle measured 87.2 million versus 82.3 million
instructions (about 6% extra). That is the cost of the additional correctness
checks, not ordinary core overhead. The shuffle comparison used three blocks
and one iteration; one master renderer-identification attempt failed, so no
completed-animation percentage against master is claimed. No-op calibration
also produced a negative master baseline for the small animation case, making
relative percentages against that baseline unsuitable.

The temporary lab's animated checksum was changed to compare item order/text
rather than in-flight style attributes. Browser specs independently verify motion
and cleanup. Browser-animation queries are guarded by an operation-count test:
their number is bounded per parent, independent of sibling count.
