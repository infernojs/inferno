# React Parity Audit — inferno-next

A consolidated map of existing React-conformance test coverage in `packages/inferno-next/__tests__/`, gaps versus the parity plan, and an actionable implementation order.

---

## Part 1: Existing coverage by feature area

One combined table of CURRENT tests with React citations. Sorted by feature area, then by confidence (high first).

| Feature area | Test file | Test name | What it asserts | React upstream test file:line(s) | Confidence |
|---|---|---|---|---|---|
| Suspense | suspense.test.ts | rejection goes through catch, not pending (`RejectVsPending`) | When both pending and catch arms exist, rejection routes to catch; fallback never lingers | ReactUse-test.js L266 | High |
| Suspense | suspense.test.ts | routes rejection to catch (NOT pending) (`CatchRejection`) | Rejected promise routes to `@catch` arm; fallback unmounts when error shown | ReactUse-test.js L266 | High |
| Suspense | suspense.test.ts | useState inside try body persists across suspend → resolve cycles (`StateInsideTry`) | `useState` declared inside try body retains value across suspend/resume; setters work post-resolve | ReactUse-test.js L933 | High |
| Suspense | suspense.test.ts | does NOT fire effects while pending; fires once on resolve (`EffectAfterResolve`) | `useEffect` declared after `use()` does not fire while suspended; fires once after resolve | ReactSuspenseWithNoopRenderer-test.js L1582 | High |
| Suspense | suspense.test.ts | reuses hooks computed during the previous attempt (`ReplayHookCache`) | `useState` declared BEFORE the suspending `use()` reuses its slot across replays | ReactUse-test.js L933 | High |
| Suspense | suspense.test.ts | does not call lifecycles of a suspended component (`EffectsSkippedForSuspended`) | Suspended sibling `useEffect` never fires while pending; B-mount fires once on resolve | ReactSuspenseWithNoopRenderer-test.js L1582 | High |
| Suspense | suspense.test.ts | inner Suspense reveals AFTER outer resolves (`NestedRevealOrder`) | Until outer promise resolves, only outer fallback is visible; inner not reached | ReactUse-test.js L1096 | High |
| Suspense | suspense.test.ts | using a rejected promise is caught by 'catch', not 'pending' (`CatchRejection`) | Rejection produces error boundary catch; mirrors React title | ReactUse-test.js L266 | High |
| Suspense | suspense.test.ts | shows pending fallback while use() awaits, then swaps to resolved (`BasicSuspense`) | Fallback renders during pending; on resolve, fallback removed, content shown | ReactUse-test.js ~L40-L80 | Medium |
| Suspense | suspense.test.ts | resolves synchronously when promise is pre-tagged fulfilled (`BasicSuspense`) | Promise tagged with `.status='fulfilled'` bypasses suspend cycle entirely | ReactUse-test.js ~L120-L160 | Medium |
| Suspense | suspense.test.ts | caches resolved use() results across replay attempts (`TwoUses`) | After first `use(a)` resolves, replay reads from cache; only waits on remaining `use(b)` | ReactUse-test.js ~L900-L950 | Medium |
| Suspense | suspense.test.ts | use(thenable) is positional — second call returns its own value (`TwoUses`) | Multiple `use()` calls keyed positionally; per-block `thenableState[]` indexed by call order | ReactUse-test.js ~L800-L900 | Medium |
| Suspense | suspense.test.ts | catch reset() retries the try body with the latest props (`RetryFromCatch`) | Error-boundary `reset` callback re-runs the try body with fresh props | ReactSuspenseWithNoopRenderer-test.js ~L1800+ | Low |
| Suspense | suspense.test.ts | inner pending catches first; outer is unaffected (`NestedSuspense`) | Nested try: inner suspend triggers only inner fallback; outer keeps rendering | ReactSuspense-test.internal.js ~L300-L500 | Low |
| Suspense | suspense.test.ts | sibling try blocks render their fallbacks in one outer pass (`SiblingBoundaries`) | Two sibling boundaries render in one pass; both fallbacks visible; B-first resolve reveals B independently | ReactSuspenseWithNoopRenderer-test.js ~L600-L900 | Low |
| Suspense | suspense.test.ts | useMemo: both fetches kick off on initial render (`ParallelInOneBoundary`) | `useMemo([startA(), startB()], [cacheKey])` starts both fetches first render | ReactUse-test.js (useMemo+use pattern) | Low |
| Suspense | suspense.test.ts | WITHOUT useMemo, sequential use() inside one body waterfalls (`WaterfallBody`) | Documents the negative-case waterfall (inferno-next specific) | none (custom, documents replay) | Low |
| Suspense | suspense.test.ts | returns previous value while new value suspends; commits on microtask (`DeferredSwap`) | `useDeferredValue(promise)` returns prior value on first render after prop change | ReactUse-test.js / useDeferredValue-test.js | Low |
| Transitions | transitions.test.ts | entangles sibling boundaries: isPending stays true until ALL siblings resolve (`EntangledTransitions`) | Two-promise transition: holds both old DOMs; `#pending=1` until both resolve | ReactTransition-test.js L190 | High |
| Transitions | transitions.test.ts | isPending stays true across replay when 2nd use() suspends (`IsPendingThroughReplay`) | Two sequential `use()`: pending stays true across replay; DOM held until both commit | ReactUse-test.js L1446 | High |
| Transitions | transitions.test.ts | nested startTransition — BOTH useTransition hooks see isPending=true (`NestedTransitions`) | Both `#pending-a` and `#pending-b` read 1 sync after state bump | ReactTransition-test.js L923 | High |
| Transitions | transitions.test.ts | urgent setState during suspended transition discards transition (`UrgentSupersedesTransition`) | Urgent C commits; outdated B resolve is a no-op; pending → 0 | ReactUse-test.js L1631 | High |
| Transitions | transitions.test.ts | useDeferredValue does NOT defer when called during a transition render (`DeferredValueInTransition`) | Both `#original` and `#deferred` update in same pass under transition | ReactDeferredValue-test.js L108 | High |
| Transitions | transitions.test.ts | useTransition basics: [isPending=false, start]; start tags renders (`TransitionBasics`) | Hook shape; same-commit isPending flip; microtask drain back to false | ReactTransition-test.js (basics) | Medium |
| Transitions | transitions.test.ts | on swap, OLD value stays visible while NEW promise loads (`TransitionKeepsDom`) | After `start(setPromise(pending))`: old DOM held, no fallback, pending pinned | ReactSuspenseWithNoopRenderer-test.js | Medium |
| Transitions | transitions.test.ts | initial mount that suspends — even in transition — shows fallback (`TransitionKeepsDom`) | No prior committed content → `@pending` must render regardless of transition tagging | ReactSuspense-test.js (initial-mount-fallback) | Medium |
| Transitions | transitions.test.ts | standalone startTransition matches useTransition.start (`StandaloneStartTransition`) | Top-level `startTransition` parity with hook variant for suspense behavior | ReactStartTransition-test.js | Medium |
| Transitions | transitions.test.ts | urgent setter after transition setter forces fallback on suspend (`UrgentPreemptsTransition`) | Un-wrapped urgent setter forfeits show-old-screen guarantee | ReactSuspense-test.js (sync-update-during-transition) | Medium |
| Deferred Value | transitions.test.ts | returns previous value with isStale=true; deferred commit suspends (`DeferredValueWithSuspense`) | First render returns prior value (`isStale=true`); microtask later commits new; suspends; no fallback flash | ReactDeferredValue-test.js (suspense interop) | Medium |
| Deferred Value | suspense.test.ts | returns previous value while new value suspends; commits on microtask (`DeferredSwap`) | `useDeferredValue(promise)` returns prior value, then suspends new on microtask | ReactUse-test.js / useDeferredValue-test.js | Low |
| Hooks | react-conformance.test.ts | useState setter returns same updater function every time | useState's returned setter is referentially stable | ReactHooksWithNoopRenderer-test.js ~L311 | High |
| Hooks | hooks.test.ts | useState: runs lazy initializer once | `useState(() => …)` lazy initializer runs once | ReactHooksWithNoopRenderer-test.js (lazy-init) | High |
| Hooks | hooks.test.ts | useState: isolates separate slots | Two `useState` calls maintain independent slots | ReactHooksWithNoopRenderer-test.js (multi-state) | High |
| Hooks | hooks.test.ts | useReducer: dispatches actions | Reducer accumulates state across dispatches | ReactHooksWithNoopRenderer-test.js (useReducer basics) | High |
| Hooks | hooks.test.ts | useMemo: recomputes only when deps change | Cached on equal deps; recompute on changed deps | ReactHooksWithNoopRenderer-test.js (memo-by-deps) | High |
| Hooks | hooks.test.ts | useRef: survives across renders, mutation does not retrigger | `.current` persists; mutation no re-render | ReactHooksWithNoopRenderer-test.js (useRef basics) | High |
| Hooks | hooks.test.ts | useEffect: fires once after mount, cleanup on unmount | Standard mount/unmount lifecycle | ReactHooksWithNoopRenderer-test.js (useEffect basics) | High |
| Hooks | hooks.test.ts | useEffect: re-fires when deps change | Dep-change drives effect re-fire | ReactHooksWithNoopRenderer-test.js ~L1800 | High |
| Hooks | callbacks.test.ts | useCallback returns same reference when deps unchanged | Identity stability across re-renders | ReactUseCallback-test.js | High |
| Hooks | callbacks.test.ts | useCallback returns new reference when deps change | New identity on dep change | ReactUseCallback-test.js | High |
| Hooks | callbacks.test.ts | useEffectEvent returns stable identity across renders | Event handle stable; closure changes don't change identity | ReactUseEffectEvent-test.js | High |
| Hooks | callbacks.test.ts | useEffectEvent body sees latest closure values | Subscribes once; reads latest state at call-time | ReactUseEffectEvent-test.js | High |
| Hooks | hooks.test.ts | useCallback renders without errors | Smoke test only (identity not asserted) | ReactUseCallback-test.js (mount) | Low |
| Effect Timing | react-conformance.test.ts | useEffect deps: skips when unchanged; destroy(prev)+create(next) on change | `Object.is` compare; ordering invariant | ReactHooksWithNoopRenderer-test.js ~L1800 | High |
| Effect Timing | react-conformance.test.ts | unmounts all previous effects before creating any new ones | Per-component destroys-before-creates | ReactHooksWithNoopRenderer-test.js ~L1885 | High |
| Effect Timing | react-conformance.test.ts | all sibling destroys run before any sibling creates | Cross-sibling destroys-before-creates within a commit | ReactHooksWithNoopRenderer-test.js ~L1926 | High |
| Effect Timing | react-conformance.test.ts | layout vs passive: layout sync after DOM, passive after layout | Layout sees committed DOM; passive deferred | ReactHooksWithNoopRenderer-test.js ~L3092 / ~L3124 | High |
| Effect Timing | hooks.test.ts | three-phase pipeline: insertion → layout → passive | Insertion+layout sync at commit; passive post-paint | ReactInsertionEffect-test.js | High |
| Effect Timing | effect-timing.test.ts | phase order on mount: insertion → layout sync, passive post-paint | Strict-log mount ordering | ReactInsertionEffect-test.js | High |
| Effect Timing | effect-timing.test.ts | phase order on re-render: cleanups before bodies per phase | Per-phase cleanup-before-body invariant | ReactHooksWithNoopRenderer-test.js (cleanup-before-body) | High |
| Effect Timing | effect-timing.test.ts | useLayoutEffect reads committed DOM sync | Body queries DOM during commit | ReactHooksWithNoopRenderer-test.js ~L3092 | High |
| Effect Timing | effect-timing.test.ts | flushSync drains insertion+layout but NOT passive | Passive deferred past flushSync | ReactHooksWithNoopRenderer-test.js (flushSync semantics) | High |
| Effect Timing | effect-timing.test.ts | all phases fire cleanup on unmount | Unmount fires insertion + layout + passive cleanups | ReactHooksWithNoopRenderer-test.js (multi-phase cleanup) | Medium |
| SVG | basic.test.ts | places `<svg>` and descendants in SVG namespace (static) | namespaceURI inherited; viewBox/class via setAttribute | ReactDOMSVG-test.js (svg namespace) | High |
| SVG | basic.test.ts | updates dynamic class + attributes without breaking namespace | Dynamic `class` via setAttribute; null clears | ReactDOMComponent-test.js (SVG className via setAttribute) | High |
| SVG | tsrx-features.test.ts | emits `xlink:href` literally so browser handles namespace | Emitted via setAttribute (not setAttributeNS) | ReactDOMComponent-test.js (xlink namespace) | Medium |
| MathML | basic.test.ts | places `<math>` and descendants in MathML namespace (static) | namespaceURI inherited for math/mrow/mi/mo | ReactDOMComponent-test.js (MathML namespace) | High |
| MathML | basic.test.ts | updates dynamic class + attributes on MathML | Dynamic display/class/text update preserving namespace | ReactDOMComponent-test.js (MathML updates) | High |

---

## Part 2: Coverage statistics

Per feature area: totals, citation confidence breakdown.

| Feature area | Total tests | High-confidence citations | Medium/Low citations | No citation (custom inferno-next) |
|---|---|---|---|---|
| Suspense | 18 | 8 | 9 | 1 (`WaterfallBody` waterfall-documentation test) |
| Transitions | 10 | 5 | 5 | 0 |
| Deferred Value | 2 (1 standalone + 1 within transitions block) | 0 | 2 | 0 |
| Hooks | 13 | 11 | 0 | 2 (smoke `useCallback renders` + custom counts) |
| Effect Timing | 10 | 8 | 1 | 1 (`all phases fire cleanup on unmount` — registration vs reverse order question) |
| SVG | 3 | 2 | 1 | 0 |
| MathML | 2 | 2 | 0 | 0 |
| **Totals** | **58** | **36** | **18** | **4** |

Notes:
- "High-confidence" means the test file itself cites a specific React file:line OR the assertion mirrors a verbatim-titled React test.
- Suspense rows 4 (`catch reset()`), 16 (`useMemo parallel`), and 17 (`WITHOUT useMemo waterfall`) document inferno-next-specific contracts more than React-canonical behavior. Row 17 is purely a regression-pin for the current sequential-replay strategy.
- Effect Timing's "all phases fire cleanup on unmount" asserts cleanup in REGISTRATION order (ins → lay → eff). React's per-fiber path runs cleanups in REVERSE-mount order — within-phase ordering across React's noop renderer may diverge.

---

## Part 3: Gap punch-list

Every gap from the plan, classified as: **(a) NEW** — write a new conformance test; **(b) PARTIAL** — existing test covers in part but needs strengthening; **(c) BLOCKED** — requires inferno-next runtime change first.

| Plan area | Gap # | One-liner | React source citation (file / test title / line, best estimate) | Citation conf | Classification | Notes / action |
|---|---|---|---|---|---|---|
| Suspense | 1 | `use()` of already-resolved promise returns sync | ReactUse-test.js / `'basic use(promise)'` / ~L60-L160 | Medium | PARTIAL | Already covered by `BasicSuspense` row "pre-tagged fulfilled" — strengthen by also covering React's `.then(...)` micro-resolved path. |
| Suspense | 2 | `use()` of non-promise value (Context / invariant) | ReactUse-test.js / `'use(context)'` | Medium | NEW | Add a fixture using `use(SomeContext)` and a separate fixture asserting unknown-usable throws. |
| Suspense | 3 | Suspending during retry on 2nd `use()` | ReactUse-test.js / `'can use() multiple promises'` retry variant | Low | PARTIAL | Tangentially covered by `TwoUses` cache — add explicit assertion that 2nd `use()` re-suspends WHILE 1st remains cached. |
| Suspense | 4 | Sync render throw vs rejected promise both hit boundary | ReactUse-test.js / `'rejected promises are thrown at the nearest error boundary'` | Medium | NEW | Add fixture with synchronous `throw` in body; assert identical error-boundary route as `CatchRejection`. |
| Suspense | 5 | Unmounting a suspended boundary mid-pending | ReactSuspense-test.internal.js / `'unmounts a suspended component before it resolves'` | Medium | NEW | Mount `BasicSuspense`, suspend, then unmount via parent state change. Assert no leak, no late commit. |
| Suspense | 6 | Showing fallback after transition timeout (budget exceeded) | ReactSuspenseWithNoopRenderer-test.js / `'eventually shows fallback if transition takes too long'` | Medium | BLOCKED | Inferno-next has no transition-timeout budget yet; needs scheduler change before test makes sense. |
| Suspense | 7 | `use()` inside `useMemo` body | ReactUse-test.js / `'use() inside useMemo'` | Low | NEW | Test that suspending inside a `useMemo` factory propagates and cache slot is invalidated. |
| Suspense | 8 | Throw during `@pending` body bubbles up | ReactSuspenseFallback-test.js / `'throws if fallback throws'` | Low | NEW | Add fixture where `@pending` throws; assert propagation to outer error boundary. |
| Suspense | 9 | Hooks above `use()` reused per hook type (useReducer / useMemo / useRef) | ReactUse-test.js / `'replays component if use() suspends, preserving hook state above it'` | Medium | PARTIAL | `ReplayHookCache` only covers `useState`. Add parameterized fixture per hook type. |
| Suspense | 10 | Hooks below `use()` NOT registered until resolved | ReactUse-test.js / `'hooks after use() are not called when it suspends'` | Low | NEW | Add fixture with `useRef` after `use()` and assert ref body never runs during pending. |
| Suspense | 11 | `use()` in `@if` branch — conditional `use()` legality | ReactUse-test.js / `'use() inside a conditional branch'` | Medium | NEW | Wrap `use()` in an `@if` branch; toggle and assert no rules-of-hooks violation. |
| Suspense | 12 | Same promise across two `use()`s in same boundary | ReactUse-test.js / `'use() the same promise multiple times'` | Low | NEW | Assert promise resolved once → both `use()` reads return same value with no double-await. |
| Suspense | 13 | Multiple boundaries on same promise resolve in same commit | ReactSuspenseWithNoopRenderer-test.js / `'resolves siblings that share a promise in a single commit'` | Low | NEW | Two sibling Suspense boundaries reading the same thenable; assert one coalesced commit. |
| Transitions | 14 | Transition discarded by urgent supersede (no commit) | ReactTransition-test.js / `'high-pri update during transition interrupts'` | Medium | PARTIAL | Already covered by `UrgentSupersedesTransition` — strengthen by asserting transition's render-phase work counter goes to zero, no leftover effect. |
| Transitions | 15 | `isPending` rising/falling edges precise | ReactStartTransition-test.js / `'isPending is true while transition is in progress'` | Medium | PARTIAL | `TransitionBasics` covers the basic shape; add edge-tracking assertion (every commit boundary, sequence of pending values). |
| Transitions | 16 | Transition that throws (not suspends) | ReactTransition-test.js / `'transition that throws an error is caught by error boundary'` | Low | NEW | Throw synchronously inside `start(fn)`; assert error boundary fires and isPending drops to false. |
| Transitions | 17 | Nested transitions inheritance (lane) | ReactTransition-test.js / `'nested startTransition'` | Low | PARTIAL | `NestedTransitions` covers two hooks; add an inner-only-started case and verify outer isPending stays false. |
| Transitions | 18 | `startTransition` inside `useEffect` | ReactStartTransition-test.js / `'startTransition inside useEffect schedules a transition update'` | Low | NEW | Fire `startTransition` from `useEffect` body; assert transition priority preserved. |
| Deferred | 19 | useDeferredValue identity stability | ReactDeferredValue-test.js / `'returns the same value if input is unchanged'` | Medium | NEW | Add fixture asserting `===` identity preservation across renders when input unchanged. |
| Deferred | 20 | Deferred + suspending + transition three-way | ReactDeferredValue-test.js / `'useDeferredValue with Suspense and startTransition'` | Low | NEW | Combine all three; assert no double-defer and proper isPending lifecycle. |
| Deferred | 21 | useDeferredValue with `initialValue` (React 19) | ReactDeferredValue-test.js / `'useDeferredValue with initialValue'` | Medium | BLOCKED | Requires inferno-next runtime support for the React-19 second arg. |
| SVG | 1 | Runtime-inserted `<svg>` via `@if` gets SVG_NS | ReactDOMComponent-test.js (svg namespace) | High | NEW | Today everything is static-template; the runtime createElementNS path is unexercised. Add `SvgInIf` fixture. |
| SVG | 2 | Runtime-inserted `<svg>` via `@for` row | ReactChildReconciler-test.js / `'reconciles a list of SVG children correctly'` | Low | NEW | Add `SvgInForOf` fixture; assert per-iteration namespace + reorder by key preserves namespace. |
| SVG | 3 | SVG inside portal | ReactDOMComponent-test.js (portal namespace inheritance) | Medium | NEW | Mount portaled `<svg><g/></svg>` and assert namespace. |
| SVG | 4 | `foreignObject` switches inner `<div>` back to XHTML namespace | ReactDOMSVG-test.js (foreignObject) | High | NEW | Add `SvgForeignObject` fixture; assert `div.namespaceURI === XHTML_NS`. |
| SVG | 5 | After `foreignObject`, sibling SVG element pops back to SVG namespace | ReactDOMSVG-test.js (foreignObject sibling) | High | NEW | Add sibling `<rect/>` after `<foreignObject>`; assert `SVG_NS`. |
| SVG | 6 | camelCase attr preservation (preserveAspectRatio / gradientTransform / clipPathUnits) | ReactDOMSVG-test.js / `'preserves camelCase SVG attribute names like viewBox'` | Medium | PARTIAL | Today only `viewBox` covered. Add `SvgCamelAttrs` fixture with broader attribute set. |
| SVG | 7 | kebab-case attr preservation (stroke-width, etc.) | ReactDOMSVG-test.js / `'preserves kebab-case SVG attributes'` | Low | NEW | Add fixture with `stroke-width`, `fill-opacity`, etc. |
| SVG | 8 | `class` on SVG via setAttribute (not `.className`) | ReactDOMComponent-test.js (SVG className via setAttribute) | Medium | PARTIAL | Current test covers via dynamic-update; add explicit assertion `.className.baseVal` reflects the change. |
| SVG | 9 | xml:space / xml:lang namespaced attrs (proper setAttributeNS) | ReactDOMSVG-test.js / `'sets xml:lang and xml:space using namespaced setAttribute'` | Low | NEW | Extend `NamespacedAttr` fixture; assert `attr.namespaceURI === XML_NS`. |
| SVG | 10 | `xlink:href` proper namespaceURI (or pinned divergence) | ReactDOMComponent-test.js (xlink namespace) | Medium | PARTIAL | Current test only asserts string round-trip. Either pin divergence (`namespaceURI === null`) or fix runtime to use setAttributeNS. |
| SVG | 11 | `xlink:href={null}` removes attribute on update | ReactDOMSVG-test.js (attribute removal) | High | NEW | Mirror the SVG-class null-clear test for `xlink:href`. |
| SVG | 12 | Plain `href` on SVG `<a>` (post-deprecation of xlink:href) | ReactDOMSVG-test.js / `'sets href without xlink namespace on SVG <a>'` | Low | NEW | Add fixture with `<a href={url}>` inside `<svg>`. |
| SVG | 13 | Scoped `<style>` on SVG element | (no React analogue — inferno-next-specific) | n/a | NEW | Add `ScopedSvg` fixture; assert hash class via setAttribute and computed style match. |
| SVG | 14 | Refs on SVG nodes (object + callback) | ReactDOMComponent-test.js / `'ref on an SVG element returns SVGElement instance'` | Low | NEW | Extend `useref.tsrx` with `SvgDomRefObject` + callback variant. |
| SVG | 15 | Events on SVG via delegation | ReactDOMEventListener-test.js / `'delegates events on SVG elements through the root'` | Medium | NEW | Add fixture with click handler on `<circle>`. |
| SVG | 16 | Events bubble through `foreignObject` | ReactDOMEventListener-test.js / `'events bubble from foreignObject children to SVG ancestors'` | Low | NEW | Build on the foreignObject fixture; add bubbling assertion. |
| SVG | 17 | `innerHTML` / `dangerouslySetInnerHTML` on SVG element parses as SVG | ReactDOMSVG-test.js / `'dangerouslySetInnerHTML on an SVG element parses as SVG'` | Low | NEW | Add fixture; assert children mounted with `SVG_NS`. |
| SVG | 18 | SVG ref typed as `SVGElement` (vs HTMLElement) | ReactDOMComponent-test.js (SVG ref type) | Low | NEW | TypeScript-level test (compile-time) plus runtime instanceof check. |
| SVG | 19 | `@for` over SVG elements (keyed reorder preserves namespace) | ReactChildReconciler-test.js (SVG list reconcile) | Low | NEW | Same shape as SVG gap #2 but with keyed-reorder operations. |
| SVG | 20 | SVG inside conditional `ternary` fragment branch | (variant of SVG #1) | Medium | NEW | Exercise the alt code path versus `@if`. |
| SVG | 21 | Runtime-inserted SVG attribute `xmlns` requirement check | spec-driven (no direct React test) | Low | NEW | Confirm/document inferno-next behavior re: `xmlns="http://www.w3.org/2000/svg"` on runtime inserts. |
| MathML | 1 | Runtime-inserted MathML via `@if` / `@for` | ReactDOMComponent-test.js / `'should use the MathML namespace inside <math>'` | Medium | NEW | Add `MathInIf` and `MathInForOf` fixtures. |
| MathML | 2 | Every MathML descendant gets MATHML_NS (deep nesting) | ReactDOMComponent-test.js / `'assigns MathML namespace to all descendants of <math>'` | Low | PARTIAL | Current test covers mrow/mi/mo. Add deeper-nested test (semantics/annotation). |
| MathML | 3 | MathML attribute casing (mathvariant, displaystyle) | ReactDOMComponent-test.js / `'preserves MathML attribute casing'` | Low | NEW | Add fixture exercising these attrs. |
| MathML | 4 | `<annotation-xml encoding="text/html">` switches back to XHTML | ReactDOMComponent-test.js (annotation-xml namespace switch) | Medium | NEW | Add fixture; assert inner `<div>` is XHTML_NS. |
| MathML | 5 | Mixed SVG/MathML namespace stack push/pop | ReactDOMComponent-test.js / `'switches namespace correctly when nesting SVG inside MathML and vice versa'` | Low | NEW | Add fixture with `<math>...<svg>...</svg>...</math>` and inverse. |

---

## Part 4: Tests requiring strengthening

Existing tests that exist but assert too weakly to prove React parity.

| Test file | Test name | Current weakness | Strengthening action |
|---|---|---|---|
| basic.test.ts | SVG: places `<svg>` and descendants in SVG namespace | Only exercises HTML5-parser static-template path; runtime createElementNS path is uncovered | Add dynamic / runtime-inserted-svg test that asserts namespaceURI on a node that came through the runtime — NOT the inline parser |
| basic.test.ts | SVG: updates dynamic class + attributes without breaking namespace | Only `viewBox` checked among camelCase attrs | Add `preserveAspectRatio`, `gradientTransform`, `clipPathUnits` assertions |
| basic.test.ts | MathML: places `<math>` in MathML namespace | Static-template only; class=null removal untested on MathML | Add runtime-insertion variant + a class=null removal assertion mirroring SVG |
| basic.test.ts | MathML: updates dynamic class + attributes | No MathML-specific attribute (mathvariant, displaystyle) tested | Add the canonical MathML attributes |
| tsrx-features.test.ts | xlink:href namespaced attr | Only asserts string round-trip via getAttribute — the attribute's namespaceURI is `null` here, divergent from React | Pick: either (a) FIX runtime to `setAttributeNS` and tighten assertion to namespaceURI=XLINK_NS, OR (b) PIN divergence with explicit `namespaceURI === null` assertion |
| hooks.test.ts | useCallback renders without errors | Smoke test only, identity not asserted | Either remove (covered by callbacks.test.ts) OR upgrade to identity assertion |
| effect-timing.test.ts | all phases fire cleanup on unmount | Asserts registration order — React's per-fiber path may use reverse-mount order within phase | Confirm intent; if matching React, assert REVERSE-mount within a phase, not registration order |
| transitions.test.ts | entangled siblings: isPending stays true | Asserts partial commit of resolved-A while B pending — React may hold both | Cross-check React's behavior; pin actual choice (eager-partial-commit divergence OR full-wait React parity) explicitly |
| transitions.test.ts | DeferredValueWithSuspense `isStale` | `isStale` flag is a userland idiom on top of identity check; React's exact same-render-sees-prior-value timing is a strong contract worth pinning to a React-cited test | Cross-reference to ReactDeferredValue-test.js explicit case |
| suspense.test.ts | catch reset() retries with latest props | The `@catch (err, reset)` positional `reset` is inferno-next-specific syntax | Add an additional React-parity test using a React `<ErrorBoundary>` + `resetKeys`-style pattern, OR document the divergence |
| suspense.test.ts | ParallelInOneBoundary (`useMemo` factory re-runs on replay) | Pins inferno-next-specific replay behavior; React would NOT re-run the memo factory | Add a "React parity wishlist" annotation; possibly mark `it.skip` once the runtime is fixed |
| suspense.test.ts | WaterfallBody | Documents a negative case, not a React-canonical contract | Mark explicitly with a code comment noting it is a regression-pin, not parity |

---

## Part 5: Suggested implementation order

Batches ordered to minimize churn. Each batch lists touched files, test count, and dependency on prior batches.

### Batch 1 — SVG/MathML runtime-insertion baseline
- **Files**: `_fixtures/basic.tsrx`, `basic.test.ts`
- **Adds** (~6 tests): `SvgInIf`, `SvgInForOf`, `MathInIf`, `MathInForOf`
- **Deps**: none. Foundation for every later SVG/MathML batch — every other gap implicitly assumes runtime createElementNS works.

### Batch 2 — SVG attribute breadth + xlink/xml namespace decision
- **Files**: `_fixtures/basic.tsrx`, `_fixtures/tsrx-features.tsrx`, `basic.test.ts`, `tsrx-features.test.ts`
- **Adds** (~5 tests): `SvgCamelAttrs`, kebab-case attrs, `xml:lang`/`xml:space`, `xlink:href={null}` removal
- **Decision required**: pin whether `xlink:href` should use `setAttributeNS` (React parity) or `setAttribute` (current).
- **Deps**: Batch 1.

### Batch 3 — foreignObject + annotation-xml + mixed nesting
- **Files**: `_fixtures/basic.tsrx`, `basic.test.ts`
- **Adds** (~4 tests): `SvgForeignObject` (inner div XHTML_NS, sibling rect SVG_NS), `MathAnnotationXml`, mixed SVG-in-MathML stack push/pop
- **Deps**: Batch 1.

### Batch 4 — Refs, events, scoped style on SVG/MathML
- **Files**: `_fixtures/useref.tsrx`, `_fixtures/style.tsrx`, `useref.test.ts`, `style.test.ts`, new fixture for SVG events
- **Adds** (~6 tests): `SvgDomRefObject` + callback variant, `MathDomRef`, `ScopedSvg`, `ScopedMath`, SVG event delegation, foreignObject event bubbling
- **Deps**: Batches 1, 3.

### Batch 5 — Suspense gaps needing no runtime change
- **Files**: `_fixtures/suspense.tsrx`, `suspense.test.ts`
- **Adds** (~8 tests, gaps 2, 4, 5, 9-strengthen, 10, 11, 12, 13): `use()` non-promise (Context + invariant), sync-throw vs reject parity, unmount-while-pending, `use()` in `@if`, hooks-above (useReducer/useMemo/useRef), hooks-below not registered, same-promise-twice, sibling-boundaries-shared-promise
- **Deps**: none.

### Batch 6 — Transitions + Deferred Value gaps needing no runtime change
- **Files**: `_fixtures/transitions.tsrx`, `transitions.test.ts`
- **Adds** (~6 tests, gaps 15-strengthen, 16, 17-strengthen, 18, 19, 20): transition-that-throws, startTransition-inside-useEffect, useDeferredValue identity stability, deferred+suspending+transition three-way, edge-tracking `isPending` sequence, inner-only-started nested
- **Deps**: none.

### Batch 7 — BLOCKED gaps (require runtime work)
- **Files**: suspense + transitions fixtures and tests, runtime files
- **Adds** (~5 tests, gaps 6, 7, 8, 21, entangled-decision): `use()` inside `useMemo`, throw during `@pending` body, transition-timeout fallback, `useDeferredValue(value, initialValue)`, entangled-eager-vs-full-wait decision
- **Deps**: Batches 5, 6.

### Batch 8 — Strengthen existing tests (no new behavior)
- **Files**: `effect-timing.test.ts`, `hooks.test.ts`, `transitions.test.ts`, `suspense.test.ts`, `tsrx-features.test.ts`, `basic.test.ts`
- **Adds** (~8 strengthening passes): confirm unmount-cleanup order, upgrade `useCallback renders` smoke to identity, edge-track `isPending`, annotate inferno-next regression-pins (`WaterfallBody`, `ParallelInOneBoundary`, `RetryFromCatch`), `xlink:href` namespace decision, broaden SVG camelCase coverage
- **Deps**: Batches 1, 2, 5, 6. LOCK IN intentional divergences with commented assertions.

### Batch 9 — Type-level / surface conformance
- **Files**: `useref.test.ts`, `_fixtures/useref.tsrx`, `volar.test.ts`
- **Adds** (~3 tests, gaps 3, 18, 21): SVG ref typed as `SVGElement`, runtime-insert `xmlns` behavior, MathML attribute casing
- **Deps**: Batch 4.

### Batch 10 — Documentation pass
- **Files**: this audit, `suspense.test.ts`, `transitions.test.ts`
- **Adds**: code comments on inferno-next-specific regression-pins explaining they're not React-canonical; mark completed gap rows.
- **Deps**: Batches 1-9.

---

### Rough effort summary

| Batch | New tests | Strengthens | Runtime work likely |
|---|---|---|---|
| 1 | 6 | 0 | maybe |
| 2 | 5 | 0 | yes (xlink decision) |
| 3 | 4 | 0 | likely yes |
| 4 | 6 | 0 | likely yes |
| 5 | 8 | 0 | no |
| 6 | 6 | 0 | no |
| 7 | 5 | 0 | yes |
| 8 | 0 | 8 | no |
| 9 | 3 | 0 | maybe |
| 10 | 0 | (doc) | no |
| **Totals** | **43** | **8** | — |

After all batches: existing 58 tests + 43 new = **101 conformance tests** spanning every plan gap, with 8 strengthening passes locking in known divergences.
