# Keyed move animation verification

Verified against master `1d7245f8e` and the original staged feature snapshot on
2026-09-27. The fixes also incorporate the useful parts of `anim/gate`,
`anim/scan-cache`, `anim/hooked-lists`, and `anim/anim-writes`. A second revision
on the same day cut the cost of the fix, measured against master and against the
first revision ("original fix" below). A third on 2026-09-28 limits move
animations to order and membership changes and measures leaving elements after
the commit. A fourth on 2026-09-30 cuts the cost of the animations themselves
(see "Animation cost").

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
- Only order and membership changes animate, as in master. When a list keeps its
  keys in order with every item retained, the helpers return before reading any
  geometry, and a move in progress keeps running instead of restarting. Custom
  hooks are still called for every retained item. The adapter counts the retained
  items while it scans the list's unchanged prefix, which it does anyway, so the
  check adds no pass over the items. An owner that renders or sits in
  a fragment still prepares a pass, since an inner keyed fragment can share its
  parent and reorder while the enclosing owner covers its hooks. The measurement
  cost was not layout thrashing: layout was clean at every read, and Chrome's
  per-call cost of `getBoundingClientRect` (~7K instructions) made up 1.4M of a
  100-item re-render.
- Leaving elements are measured in a first phase of the animation pass, after the
  commit, instead of in `componentWillDisappear`. A read there sat between the
  patch's writes and laid the document out again for every leaving element: for
  20 leaves among 80 relabeled items that was 7.5M of layout. Leaves with a
  `globalAnimationKey` keep the immediate read, since another element's enter can
  consume their box in an earlier pass.
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
- Full Jest: **3,595 passed**, 44 browser-only tests skipped. Separate server suite
  without a DOM: **13 passed**.
- Browser matrix, **24 configurations passed**: Firefox and headless Chromium ×
  Babel/TypeScript/SWC × compat off/on × minification off/on (2,894 specs without
  and 3,077 with compat). A windowed Chromium on the verification machine fails the
  same 46 frame-dependent specs for this branch and for the original fix alike.
- New regressions: class hooks assigned in the constructor or `componentWillMount`,
  the first hooked item of an existing list, a list hydrated before any hook, a list
  changed while no hook was mounted, hooks objects replaced by every render, leave
  completion without a mounted move hook, and five core-only leave-hook cases in
  `packages/inferno/__tests__/leaveHooks.spec.tsx`. With function hooks not counted,
  18 of the 27 move specs fail.
- Updates that keep the keys: no geometry reads, a running move keeps going, a
  reorder later in the same task still reads its own sources, custom hooks and
  overrides of the built-in one are still called, and a same-key replacement or a
  fragment-rendering owner still prepares a pass. In Chromium and Firefox the
  followers of an item that grows jump without move styles. Leaving elements are
  read after the render, three of them in one pass.

Normal repository commands for reproducing validation:

```sh
pnpm exec tsc --noEmit
pnpm run test:node --runInBand
pnpm run test:node-nodom --runInBand
pnpm run build
pnpm run test:transformers
```

## Bundle size

Brotli bytes, same toolchain for all sources:

| Bundle | Master | Original fix | Head | Now |
| --- | ---: | ---: | ---: | ---: |
| `inferno` min UMD | 8,212 | 8,312 | 8,435 | 8,435 |
| `inferno` ESM + terser | 8,149 | 8,265 | 8,371 | 8,371 |
| Apps without inferno-animation (9 lab apps) | — | +72 to +160 | -81 to +23 | -81 to +23 |
| Apps that import inferno-animation (5 lab apps) | — | +1,623 to +1,742 | +2,623 to +2,686 | +2,637 to +2,698 |
| Apps that animate (3 lab apps) | — | — | +3,242 to +5,206 | +4,125 to +6,260 |

"Head" is `866924483`, "Now" the revision described under "Animation cost", which adds about
1 KB to the apps that animate (jfb keyed move: 16,201 to 17,271 bytes).

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

Animated lists (inferno-animation, 100 items), whole 1.5 s window after the
operation, million instructions:

| Operation | Master | Original fix | Now |
| --- | ---: | ---: | ---: |
| shuffle | 86.5 | 93.3 | 90.8 |
| re-render, nothing moves | 1.75 | 4.74 | 2.18 |
| text change | 3.39 | 6.52 | 3.69 |
| one item grows, keys kept | 4.53 | 38.6 | 5.02 |
| shuffle without move hooks | 10.30 | 10.43 | 10.21 |
| remove every fifth, relabel the rest | 36.6 | 81.2 | 69.6 |

The items are `AnimatedMoveComponent`s, in the last row `AnimatedAllComponent`s.
Updates that keep the keys read no geometry. They cost 0.3 to 0.5 million more
than master, mostly 0.4 million of script in which the adapter visits every item
to call its hook. The original fix measured every retained item before and after
each update (200 `getBoundingClientRect` calls, 1.4 million of a re-render) and
animated the followers of the item that grew.

Removing items costs more than master because the survivors slide into the gap
once the leaves finish; master does not animate them. Reading the leaving
elements after the commit halves the layout work of that update (5.8 million,
master 11.9). Counted over the operation alone, the update costs 10% less than
master's.

Deterministic d8 samples with empty custom hooks (reconciler and registry only),
steady state after 800 warm-up iterations: a 100-item list re-render costs +12%
over master with class components (original fix +73%) and +21% with function
components (+101%); a swap of class components costs +10% (+70%).

## Animation cost

A fourth revision on 2026-09-30 cut the cost of the animations themselves, without changing
what they detect or how they look. Measured in the InfernoProf Chromium build (lab
`run --mode alloc` and `domcalls`, three iterations) against master `1d7245f8e`, the series
`473b876a1` and the glitch fixes `866924483` ("head").

Chrome answers `getAnimations()` by collecting every animation of the document and sorting them
in composite order, and comparing two CSS transitions walks the siblings of their elements. An
element's own query takes that path as soon as the element has an animation, including a
transition cancelled earlier in the same task. With 1000 running transitions, one query cost
up to 180 billion instructions, and head queried per batch and per leaving element. The engine
now asks the computed style where it can:

- Completion: an enter, leave or move waits for the transitions that its computed transition
  lists can run (a combined duration above zero). One capture listener per root node and one
  timer per fallback delay and task replace two listeners and a timer per element. Head counted
  zero-duration entries, which never end, so items stayed "moving" until the timeout and the
  next update retargeted every survivor. Transition events of pseudo-elements no longer end the
  element's wait, and `registerTransitionListener`'s cancel is idempotent.
- Keyframed moves: a CSS animation is known from the computed `animation-name`, and only an item
  without one is asked for its script animations. Its own query answers without the
  document-wide sort when it has no animation. A retargeted item still has the move transition
  that the reset has just cancelled, so in a batch with retargets one query of the parent
  answers for every item.
- Author transitions: the computed transition lists tell which moved elements could run a
  transition besides the move's own. The parent is queried at most once per pass, and only
  then. A moving element transitions its own property only for its move, which replaces the
  query after activation. The same lists decide whether the move's property can transition at
  all; only then are the element's transitions disabled for the start offset.
- Interrupted enters: a leave holds the values of the properties that the element's transition
  lists name. With `all`, the values come from the element's animations while at most 16 leaves
  of an update interrupt an enter, and from the commonly animated properties beyond that (see
  the README).
- Inline styles: an element without inline declarations is not read property by property, and
  the priority of a value the engine wrote is known.
- Allocations: the common paths no longer split strings or filter arrays, solve the start offset
  without matrices, and create an item's arrays only when it needs them.

Renderer main-thread instructions per operation, from the input to the end of the next frame
(median of three iterations; the ops of "Series" and "Head" that freeze take 8–10 s):

| Operation, million instructions | Master | Series | Head | Now |
| --- | ---: | ---: | ---: | ---: |
| 100 items shuffle | 28.0 | 44.3 | 45.4 | 43.2 |
| … after 30 warm-up runs | 26.8 | 41.3 | 42.3 | 40.6 |
| 100 items with a keyframe animation shuffle | 45.2 | 62.7 | 87.9 | 75.2 |
| 5 groups of 20 items reverse | 34.3 | 52.5 | 56.6 | 49.5 |
| 100 items shuffle again during their moves | 40.6 | 60.7 | 63.7 | 59.5 |
| every 5th of 100 leaves during moves | 10.8 | 59.3 | 60.0 | 53.6 |
| 1000 items shuffle | 489 | 663 | 682 | 488 |
| 1000 items during their moves: one goes last | 351 | 1,151 | 1,155 | 599 |
| 500 moving items reverse back while 500 enter | 405 | 847 | 817 | 499 |
| 500 items that just moved reverse while 500 enter | 286 | 700 | 687 | 292 |
| 1000 entering items leave | 598 | 613 | 191,651 | 482 |
| jfb fade: clear 1000 rows during their enters | 455 | 435 | 186,527 | 147² |
| jfb move: clear 1000 rows during their enters | 458 | 127 | 171,330 | 482 |
| jfb move: append 1000 rows to 1000 | 1,057 | 191,094 | 193,660 | 1,060 |
| jfb move: remove one of 1000 | 26.4 | 1,141 | 1,165 | 655¹ |
| jfb move: swap two of 1000 | 131 | 99.6 | 100.0 | 102 |

¹ Depends on how many items the removal retargets: 655 when the moves of the previous removal
still run, down to 89 in other runs when they have ended.
² 481 in two other runs: the leaves start from however far the enters have got.

The 100-item cases move `AnimatedMoveComponent`s in 150 ms; "during their moves" and "while
… enter" use 1 s transitions. The 1000-item move cases were added to the lab for this revision:
the first version of the keyframed-move change asked every retargeted item for its own
animations, which took 59.7 billion instructions (3 s) in the "reverse back while 500 enter"
case.

| DOM calls in the 1.2 s window | Master | Series | Head | Now |
| --- | ---: | ---: | ---: | ---: |
| 100 items shuffle | 1,484 | 2,689 | 3,293 | 2,197 |
| every 5th of 100 leaves during moves | 662 | 6,115 | 7,525 | 5,834 |
| 1000 items shuffle | 14,944 | 26,949 | 32,953 | 21,957 |

Allocation over the 1.2 s window after 30 warm-up runs (V8's sampling heap profiler, collected
objects included): the 100-item shuffle allocates 196 KiB (head 267 KiB), the 1000-item shuffle
1,184 KiB (head 1,706 KiB). Per moved item, the engine adds no listener and no timer of its own;
after four leave cycles of `leave-mid-move` the page holds 5 listeners (head 163) and the same
DOM nodes, and heap snapshots show no surviving objects of inferno-animation.

The remaining cost over master comes from what master doesn't do: survivors slide into the gap
of a removal, entering and leaving items are excluded from moves, and author transitions keep
running.
