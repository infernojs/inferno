# `<Prompt>` and the browser back button

Reproduction page for the report that `<Prompt message="..." when={true} />` does
not prompt on iOS Safari when the user leaves the page with the browser back
button, and that the back navigation is blocked anyway.

Leaving through a `<Link>` (a PUSH) is reported to work. Only POP navigations —
back button, back swipe — misbehave.

## Running it

The example is built together with the other examples:

```sh
pnpm run docs-build      # or: pnpm run docs-build:dev
```

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

1. Open **Plain page**, then **Guarded (Prompt)**, so there is history behind you.
2. Leave the guarded page with a link, accept the prompt. This is the path that
   works today, including on iOS.
3. Navigate back to **Guarded (Prompt)**.
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

| Verdict | What broke |
| --- | --- |
| the popped entry carries no `idx` | Step 2. `history.state` was lost, so history bails out and never calls the blockers or its own listeners. The URL changes but the router keeps rendering the old page. The warning history logs about this is compiled out of production builds. |
| history did not call `go()` | Step 2, with `delta === 0`. |
| the transaction was never handed to the blocker | Step 3. The revert `go()` happened, but the follow-up `popstate` never delivered the transaction, so `<Prompt>` never ran and the revert stands. |
| `window.confirm()` returned false without showing anything | Step 3 ran, but the browser dismissed the dialog instead of showing it. `<Prompt>` reads `false` as "stay here", never calls `tx.retry()`, and the reverted POP stands. WebKit suppresses dialogs that are not triggered by a user gesture, and the `confirm` here happens in a `popstate` handler caused by a programmatic `go()`. |

The **Manual block** page exists to separate the last two rows: it registers
`history.block()` itself and confirms with an in-page dialog instead of
`window.confirm`. If its dialog appears on the back button while `<Prompt>` stays
silent, the transaction is being delivered fine and `window.confirm` is the
problem — which would mean `<Prompt>` needs a way to confirm without
`window.confirm`, the way React Router does it with `getUserConfirmation`.

`beforeunload` is not involved in any of this: history only registers a
`beforeunload` handler to cover a real page unload (closing the tab, typing a
new URL), and `<Prompt>`'s in-app blocking never goes through it. The page logs
`beforeunload`, `pagehide` and `pageshow` anyway, since a POP that reloads the
document rather than firing `popstate` would explain the symptom too.
