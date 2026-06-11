# Suspense Divergences from React

A registry of intentional behavior differences between inferno-next's Suspense implementation and React's. Each entry cites the test that pins the divergence so a future runtime change either updates this document OR removes the divergence by closing the gap.

Last reviewed against React 19 contracts.

---

## 1. Entangled-transition partial-commit

**Where it shows up:** [transitions.test.ts](__tests__/transitions.test.ts) — `'entangles sibling boundaries: isPending stays true until ALL siblings resolve'`

**React behavior:** When a single `startTransition(fn)` causes multiple sibling Suspense boundaries to suspend, React holds the prior DOM of EVERY sibling until ALL their promises resolve. The user never sees a half-updated screen mid-transition.

**inferno-next behavior:** We eagerly commit each sibling as its individual promise resolves. `isPending` correctly stays true until both resolve (we match React on the counter contract and on prior-DOM-preservation per-sibling). What we diverge on is the per-sibling commit timing inside the transition window.

**Surface impact:** Low. The user sees content appear earlier than React would render it — generally fine for non-coordinated siblings, mildly surprising when siblings are visually entangled.

**Closure plan:** Tracking entangled siblings as a coordinated group requires plumbing transition identity through every tryBlock that participates. ~200 lines runtime work, no API surface change. Filed as a follow-up.

---

## 2. `@catch (err, reset)` syntax vs React's `<ErrorBoundary>` API

**Where it shows up:** [suspense.test.ts](__tests__/suspense.test.ts) — `'catch reset() retries the try body with the latest props'`

**React behavior:** React's error boundary contract uses a `<ErrorBoundary>` component (typically third-party like `react-error-boundary`) with `resetKeys`, `onReset`, or an externally-supplied `resetErrorBoundary` callback.

**inferno-next behavior:** The `@catch (err, reset)` positional `reset` is an inferno-next-specific TSRX syntax — same intent (retry the failed branch with fresh state), different surface.

**Surface impact:** None at runtime. This is API-shape divergence only; the underlying error-boundary mechanics are equivalent.

**Closure plan:** Not closeable without abandoning TSRX directive syntax. Will remain as a documented surface difference.

---

## 3. `useMemo` factory re-runs on replay

**Where it shows up:** [suspense.test.ts](__tests__/suspense.test.ts) — `'useMemo pattern: both fetches kick off on initial render (network-parallel)'`

**React behavior:** React's per-fiber memoizedState survives across replay attempts. A `useMemo(() => …, [deps])` factory runs ONCE per dep-change boundary; replays do not re-invoke it.

**inferno-next behavior:** Our retry path rebuilds the try-block body on each replay attempt, which causes `useMemo` factories to re-run. The committed value still memoizes correctly across NORMAL re-renders (deps comparison works); the divergence is only in the replay-during-suspense path.

**Surface impact:** Higher than #1 if user code relies on the factory's side effects being stable. The common workaround (and what real users tend to write) is to put each suspending promise in its own boundary, which sidesteps the issue.

**Closure plan:** Preserve memoizedState across replay attempts the same way React does. Material runtime work (hook state needs a per-attempt snapshot/commit lifecycle). Filed as a follow-up.

---

## 4. Sequential `use()` waterfall — regression pin, not parity divergence

**Where it shows up:** [suspense.test.ts](__tests__/suspense.test.ts) — `'WITHOUT useMemo, sequential use() inside one body waterfalls (documents the gotcha)'`

**Status:** This is NOT a divergence from React per se. React's runtime also waterfalls in this pattern (the first `use()` must resolve before the body re-runs past it). The test pins inferno-next's specific per-replay call-count behavior so a future optimization can't accidentally change it without a deliberate decision.

**Surface impact:** N/A — this is a regression-pin, not a divergence.

**Closure plan:** No closure needed. Test exists to defend the current contract.

---

## What we DO match React on (for the record)

The list above is the complete known set of Suspense-related divergences. Every other Suspense / Transitions / Deferred test pins a contract we EXACTLY match React on, including:

- Basic suspend → pending → resolve cycle.
- `use(promise)` thenable cache (same promise reads the cached value synchronously).
- `use(Context)` overload.
- `use(unsupported)` throws the invariant.
- Synchronous render throw routes to `@catch` with identical surface as a rejected promise.
- Nested boundary innermost-catches-first.
- Outer-then-inner reveal sequencing in nested boundaries.
- Effects skipped while pending; fired on resolve.
- Hooks ABOVE `use()` preserved across replay (useState, useReducer, useRef, useMemo identity).
- Hooks BELOW `use()` not registered until resolve.
- `use()` inside `@if` branches (conditional `use()` is legal).
- Same promise read twice returns same value via per-fiber cache.
- Sibling boundaries on a shared promise commit in the same frame.
- Unmounting a suspended boundary mid-pending cancels the retry cleanly (no late commits).
- Transition prior-DOM preservation during suspense.
- `useDeferredValue` identity stability.
- `useDeferredValue(value, initialValue)` React-19 overload.
- `useTransition` rising/falling `isPending` edges.
- Standalone `startTransition` parity with hook form.
- Nested `useTransition` (independent `isPending` flags).
- Urgent-supersedes-transition discard.
- Transition-fallback timeout (`setTransitionFallbackTimeout`, default 5s — matches React).

A divergence not listed here is a bug. File it.
