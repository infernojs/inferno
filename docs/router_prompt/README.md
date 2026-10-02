# `<Prompt>` and the browser back button

Reproduction page for the report that `<Prompt message="..." when={true} />` does
not prompt on iOS Safari when the user leaves the page with the browser back
button, and that the back navigation is blocked anyway.

Leaving through a `<Link>` (a PUSH) is reported to work. Only POP navigations —
back button, back swipe — misbehave.

The **Custom prompt** page demonstrates the fix: `<Prompt>` uses the router's
`getUserConfirmation` handler to render an in-page Stay/Leave dialog. The
**Native prompt** page keeps `window.confirm` for comparison.

## Running it

Build the packages after changing router source, then rebuild this example:

```sh
pnpm run build
pnpm run docs-build router_prompt      # or: pnpm run docs-build:dev router_prompt
```

Omit `router_prompt` to rebuild every example.

Serve the repository over HTTP (`file://` cannot use `pushState`) and open
`docs/router_prompt/` on the device under test, for example:

```sh
npx serve .              # then browse to http://<your-ip>:3000/docs/router_prompt/
```

Routes are prefixed with the directory the page is served from, so no server
configuration is needed as long as you never reload on a deep link. If your
static server has no SPA fallback and you want reloads to survive, open
`docs/router_prompt/?router=hash` instead, which swaps `BrowserRouter` for
`HashRouter`.

## Steps

### Test the fix

1. Open **Plain page**, then **Custom prompt**.
2. Use Safari's browser Back button or swipe back. The in-page dialog should open.
3. Choose **Stay**. The current page and URL should remain unchanged after the POP is reverted.
4. Press Back again and choose **Leave**. Navigation should reach Plain page once.
5. Use Forward to return, then repeat. Also test leaving with a link and disabling **Prompt armed**.
6. Repeat with `?router=hash` to exercise `HashRouter`.

The log records custom dialog decisions and `Committed POP/PUSH/REPLACE` events.
The fix also waits for an accepted POP to commit before re-enabling the blocker;
re-enabling immediately after `tx.retry()` would block the retry again.

### Compare native confirmation

1. Open **Plain page**, then **Native prompt**, so there is history behind you.
2. Leave the guarded page with a link, accept the prompt. This is the path that
   works today, including on iOS.
3. Navigate back to **Native prompt**.
4. Press the browser's own back button (or swipe back).

Expected: the same prompt, and the back navigation happening once it is accepted.
Reported on iOS Safari: no prompt, and the page does not go back.

The log at the bottom of the page records every `popstate`, every
`history.pushState/replaceState/go` call and every `window.confirm` call, and
prints a verdict roughly one second after each POP. It is kept in
`sessionStorage`, so it survives the page being reloaded or dropped from the
back/forward cache. **Copy log** puts the whole thing on the clipboard for
pasting into an issue.

## What the page is trying to tell apart

`history` v5 cannot cancel a POP, so `history.block()` fakes it
(`createBrowserHistory` in `node_modules/history/history.development.js`):

1. `popstate` fires.
2. `delta = index - history.state.idx`, then `go(delta)` to undo the navigation,
   remembering the transaction in `blockedPopTx`.
3. The `popstate` caused by that `go()` hands `blockedPopTx` to the blockers.
   This is where `Prompt.enable()` calls `window.confirm`
   (`packages/inferno-router/src/Prompt.ts`).
4. On OK, `<Prompt>` unblocks and calls `tx.retry()`, which is `go(-delta)`.

Every symptom in the report is that chain breaking, and the log says where:

| Verdict                                                      | What broke                                                                                                                                                                                                                                                                                   |
| ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| the popped entry carries no `idx`                            | Step 2. `history.state` was lost, so history bails out and never calls the blockers or its own listeners. The URL changes but the router keeps rendering the old page. The warning history logs about this is compiled out of production builds.                                             |
| history did not call `go()`                                  | Step 2, with `delta === 0`.                                                                                                                                                                                                                                                                  |
| the transaction was never handed to the blocker              | Step 3. The revert `go()` happened, but the follow-up `popstate` never delivered the transaction, so `<Prompt>` never ran and the revert stands.                                                                                                                                             |
| `LIKELY SUPPRESSED: window.confirm()` returned false quickly | Step 3 ran, but the browser may have dismissed the dialog instead of showing it. `<Prompt>` reads `false` as "stay here", never calls `tx.retry()`, and the reverted POP stands. The elapsed-time threshold is a diagnostic heuristic: the API does not distinguish suppression from Cancel. |

The **Manual block** page exists to separate the last two rows: it registers
`history.block()` itself and confirms with an in-page dialog instead of
`window.confirm`. If its dialog appears on the back button while `<Prompt>` stays
silent, the transaction is being delivered fine and `window.confirm` is the
problem. **Custom prompt** demonstrates using `getUserConfirmation` with
`<Prompt>` to avoid that dependency. Applications should configure the handler
on their router; without it, `<Prompt>` retains native confirmation for compatibility.

`beforeunload` is not involved in any of this: history only registers a
`beforeunload` handler to cover a real page unload (closing the tab, typing a
new URL), and `<Prompt>`'s in-app blocking never goes through it. The page logs
`beforeunload`, `pagehide` and `pageshow` anyway, since a POP that reloads the
document rather than firing `popstate` would explain the symptom too.
