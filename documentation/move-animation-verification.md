# Keyed move animation verification

Verified against master `1d7245f8e` and the original staged feature snapshot on
2026-09-27. The fixes also incorporate the useful parts of `anim/gate`,
`anim/scan-cache`, `anim/hooked-lists`, and `anim/anim-writes`. A second revision
on the same day cut the cost of the fix, measured against master and against the
first revision ("original fix" below).

## Implementation decisions

- Importing `inferno-animation` installs the optional registry through a guarded
  core adapter. Custom move hooks require that import. The core bundle contains
  no registry, animation scheduler, hook-owner counter, or synchronous flush bridge.
- The core keeps the adapter in two module variables: installed, and active while
  a move hook owner is mounted. Keyed patches, keyed list unmounts, portal moves
  and deferred removals reach the adapter only while it is active, so an app that
  imports the package without mounting a move hook does no move work. A bundler
  that sees no import removes the core's checks altogether.
- Owners are class components with `componentWillMove` by the end of their mount
  (`componentDidMount` included) and function components whose hooks include
  `onComponentWillMove`. inferno-animation counts them; the last one to unmount
  makes the adapter dormant and drops the registry. A function hook removed by a
  re-render is not uncounted, which only keeps the adapter active.
- Lists register at their first preparation; their hookless state is cached until
  an owner mounts or unmounts. Retained children at either end of a list match by
  position, a few moved ones by a scan, more by a key map.
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
| Synchronous completion prepares another list mid-patch | A synchronous completion removes its elements at once and never reaches the registry. Regression uses two keyed Fragments under one non-keyed wrapper. |
| Repeated negative discovery and disabled-path overhead | Cache negative discovery until an owner mounts or unmounts; without a mounted owner the adapter is dormant and the core does no move work. Measured with the supplied lab. |
| Class hook assigned after construction missed | Class hooks count when they exist by the end of mount: the class itself, the constructor, `componentWillMount` or `componentDidMount`. Regressions assign the hook in each; later assignment is unsupported, and a class without a hook is no candidate. |
| Wrapper retention documentation | Document and test that a retained wrapper's existing descendant can be prepared before its render replaces it. |
| Later sibling throws after nested list advances | Record successful complex-keyed patches only after success and write them back on error. Small and large keyed branches verify recovery, current props, and deferred cleanup. |
| Nested render flushes outer batch too early | Microtask preparation waits until synchronous lifecycle work completes. Nested-render test observes no outer target reads inside the callback. |
| Browser and typing tests unwired | Both browser entries include inferno-animation; the server renderer alias supports browser bundling; typings file now has a `.spec.tsx` name. Transition progress uses paused/finished animations instead of elapsed-time assertions. |
| Text-first Fragment targets crash animation helpers | Shared element-only root lookup for appear/disappear/move. Text-first and text-only roots are tested. |
| Core bundle growth and obsolete code | Registry moved into inferno-animation; old move queue and bridge removed. Bundle measurements below. |
| Leave hooks leaked into later removals | Each removal takes the hooks its own unmount queued. Children replaced by text or `dangerouslySetInnerHTML` unmount without leave hooks; an element replaced by another element stays until its leave hooks complete. Text to element with pending leave hooks terminates. Core-only regressions in `leaveHooks.spec.tsx`. |
| Each leave completion remeasures every sibling | Four deferred completions, each invoked twice, produce one source pass over six nodes and one target pass over two survivors: eight rect reads. Throwing preparation hooks still allow completed removals. |

Tests are in `packages/inferno/__tests__/moveAnimationRegressions.spec.tsx`,
`moveAnimations.spec.tsx`, `leaveHooks.spec.tsx`, the hydration spec, and the
`layoutMoves` / `layoutOwnership` specs in `packages/inferno-animation/__tests__`.

## Validation

- TypeScript `--noEmit`, the package build, and ESLint and Prettier on changed
  files pass.
- Full Jest: **3,482 passed**, 16 browser-only tests skipped. Separate server suite
  without a DOM: **13 passed**.
- Browser matrix, **24 configurations passed**: Firefox and headless Chromium ×
  Babel/TypeScript/SWC × compat off/on × minification off/on (2,751 specs without
  and 2,934 with compat). A windowed Chromium on the verification machine fails the
  same 46 frame-dependent specs for this branch and for the original fix alike.
- New regressions: class hooks assigned in the constructor or `componentWillMount`,
  the first hooked item of an existing list, a list hydrated before any hook, a list
  changed while no hook was mounted, hooks objects replaced by every render, leave
  completion without a mounted move hook, and five core-only leave-hook cases in
  `packages/inferno/__tests__/leaveHooks.spec.tsx`. With function hooks not counted,
  18 of the 27 move specs fail.

Normal repository commands for reproducing validation:

```sh
pnpm exec tsc --noEmit
pnpm run test:node --runInBand
pnpm run test:node-nodom --runInBand
pnpm run build
pnpm run test:transformers
```

## Bundle size

Brotli bytes, same toolchain for all three sources:

| Bundle | Master | Original fix | Now |
| --- | ---: | ---: | ---: |
| `inferno` min UMD | 8,212 | 8,312 | 8,435 |
| `inferno` ESM + terser | 8,149 | 8,265 | 8,371 |
| Apps without inferno-animation (8 lab apps) | — | +72 to +160 | -81 to +23 |
| Apps with inferno-animation (5 lab apps) | — | +1,623 to +1,742 | +2,173 to +2,229 |

Bundlers remove the move checks from apps without the package, which end up at
master's size. The published core carries the owner counting and the adapter
variables; the package carries the registry, owner counts and engine.

## Performance

Lab: `~/git/inferno/bench`. Chrome for Testing 152 renderer main-thread instruction
counters (three blocks, three iterations; intervals are 95%), and deterministic
d8 instruction counts for the micro suite, compared with master `1d7245f8e`.

Apps without inferno-animation. Bundlers that see no `_MA` call remove the
reconciler's checks, so the core-only reconciler matches master's:

| Workload | Original fix | Now |
| --- | ---: | ---: |
| jfb select | +0.9% | -1.1% |
| jfb swap | -2.6% | -2.6% |
| jfb other operations | 0.0–0.1% | 0.0–0.2% |
| fuzz 1–9, mean | +1.2% | -0.7% |
| dbmonster frame / 1kcomponents step | +0.1% / +0.1% | -0.1% / 0.0% |
| d8 micro, mean per group (19 groups) | up to +2.6% (fuzz) | at most +0.2% |

Apps that import inferno-animation but mount no move hook: the adapter stays
dormant.

| Workload | Original fix | Now |
| --- | ---: | ---: |
| fuzz 1–9 | +6% to +36% | -2.4% to +3.1% (no interval excludes 0 above +1%) |
| uibench anim | +5.8% to +11.2% | -1.4% to -0.1% |
| jfb select / clear | +1.6% / +1.8% | -0.1% / 0.0% |
| dbmonster frame / 1kcomponents step | +0.1% / +0.1% | +0.4% / -0.1% |
| d8 fuzz / uibench tree / unmount, mean | +53% / +45% / +40% | +0.9% / 0.0% / +0.1% |

With the package imported, jfb update10th in master and the original fix
allocates about 3 KB less in the application's own label strings; d8 shows the
same. The reconciler work is the same as without the import there.

Animated lists (inferno-animation `AnimatedMoveComponent`, 100 items), whole
1.5 s window after the operation, million instructions:

| Operation | Master | Original fix | Now |
| --- | ---: | ---: | ---: |
| shuffle | 85.6 | 94.3 | 90.8 |
| re-render, nothing moves | 1.74 | 4.73 | 4.05 |
| text change | 3.25 | 6.37 | 5.57 |
| shuffle without move hooks | 10.29 | 10.42 | 10.34 |

Measuring every retained item before and after the update is what lets layout
changes animate; its 200 `getBoundingClientRect` calls are 1.4 million of the
re-render. Deterministic d8 samples with empty custom hooks (reconciler and
registry only): a 100-item class list re-render costs +12% over master (was
+87%), a swap +16% (was +78%).
