/**
 * Reproduction for: <Prompt> never prompts, and blocks navigation, when the
 * browser back button is used on iOS Safari.
 *
 * <Prompt> asks history v5 to block transitions. For a POP (back/forward)
 * history cannot cancel the navigation, so it does this dance instead:
 *
 *   1. popstate fires
 *   2. history computes delta = index - history.state.idx and calls
 *      go(delta) to *undo* the back navigation, remembering the blocked
 *      transaction in `blockedPopTx`
 *   3. the popstate caused by that go() delivers `blockedPopTx` to the
 *      blockers, which is where <Prompt> calls window.confirm()
 *   4. on "OK", <Prompt> unblocks and calls tx.retry(), which is go(-delta)
 *
 * Everything the user sees ("no prompt" + "cannot go back") happens when that
 * chain breaks between 2 and 3, or when window.confirm() in 3 is dismissed by
 * the browser instead of being shown. This page instruments every step so the
 * broken link can be identified on a device with no developer console.
 */
import { Component, render } from 'inferno';
import {
  BrowserRouter,
  HashRouter,
  Link,
  Prompt,
  Route,
  Switch
} from 'inferno-router';

const CONFIRM_MESSAGE = 'Leave this page? Unsaved changes will be lost.';
// How long we wait after a POP before deciding what went wrong. window.confirm
// blocks the main thread, so this timer only runs once any dialog is closed.
const DIAGNOSE_DELAY = 800;
// A window.confirm() that returns faster than this never rendered a dialog.
const SUPPRESSED_DIALOG_MS = 50;

/* ------------------------------------------------------------------------ *
 * Routes
 *
 * The docs examples are served from a subdirectory, so every route is
 * prefixed with the directory this page was loaded from. Add ?router=hash to
 * use a HashRouter instead, which is handy when the static server has no SPA
 * fallback and a reload on a deep link would 404.
 * ------------------------------------------------------------------------ */
const ROUTE_NAMES = ['guarded', 'manual', 'plain'];
const useHash = /[?&]router=hash(&|$)/.test(window.location.search);

function currentDirectory() {
  let dir = window.location.pathname.replace(/\/(index\.html)?$/, '');
  const lastSlash = dir.lastIndexOf('/');

  // Reloading on /docs/router_prompt/guarded must not make the base path
  // /docs/router_prompt/guarded.
  if (ROUTE_NAMES.indexOf(dir.slice(lastSlash + 1)) !== -1) {
    dir = dir.slice(0, lastSlash);
  }

  return dir;
}

const basePath = useHash ? '' : currentDirectory();
const PATHS = {
  home: basePath + '/',
  guarded: basePath + '/guarded',
  manual: basePath + '/manual',
  plain: basePath + '/plain'
};

// index.html is not one of our routes, so get rid of it before the router
// reads the location. Done before the instrumentation to keep the log clean.
if (!useHash && /\/index\.html$/.test(window.location.pathname)) {
  window.history.replaceState(
    window.history.state,
    '',
    PATHS.home + window.location.search + window.location.hash
  );
}

/* ------------------------------------------------------------------------ *
 * The log. iOS Safari has no console unless the device is tethered to a Mac,
 * so everything is rendered on the page instead.
 * ------------------------------------------------------------------------ */
const MAX_ENTRIES = 400;
const STORAGE_KEY = 'inferno-router-prompt-repro-log';
const startTime = Date.now();
const entries = [];
const subscribers = [];
let entryId = 0;
let saveTimer = null;

function log(kind, text) {
  entries.push({
    id: ++entryId,
    at: Date.now() - startTime,
    kind: kind,
    text: text
  });

  if (entries.length > MAX_ENTRIES) {
    entries.splice(0, entries.length - MAX_ENTRIES);
  }

  save();

  for (let i = 0; i < subscribers.length; i++) {
    subscribers[i]();
  }
}

// Going back can drop the page out of the back/forward cache and reload it,
// which would throw away everything logged so far. Keep it in sessionStorage
// so the interesting part is still readable afterwards.
function save() {
  if (saveTimer !== null) {
    return;
  }

  saveTimer = setTimeout(function () {
    saveTimer = null;

    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch (err) {
      /* private mode, quota, no sessionStorage: the log just won't survive */
    }
  }, 250);
}

function restore() {
  let stored;

  try {
    stored = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) || '[]');
  } catch (err) {
    stored = [];
  }

  if (!stored.length) {
    return;
  }

  for (let i = 0; i < stored.length; i++) {
    stored[i].id = ++entryId;
    entries.push(stored[i]);
  }

  log('info', '--- ' + stored.length + ' entries above are from before this page load ---');
}

function subscribe(fn) {
  subscribers.push(fn);

  return function () {
    const idx = subscribers.indexOf(fn);
    if (idx !== -1) {
      subscribers.splice(idx, 1);
    }
  };
}

function clearLog() {
  entries.length = 0;

  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    /* ignore */
  }

  log('info', 'Log cleared.');
}

function logAsText() {
  const lines = entries.map(function (entry) {
    return pad(entry.at) + ' ' + entry.kind + ': ' + entry.text;
  });

  return [
    'inferno-router <Prompt> back button repro',
    'userAgent: ' + window.navigator.userAgent,
    'router: ' + (useHash ? 'HashRouter' : 'BrowserRouter'),
    ''
  ]
    .concat(lines)
    .join('\n');
}

function pad(ms) {
  const s = String(ms);
  return '        '.slice(0, Math.max(0, 6 - s.length)) + s + 'ms';
}

/* ------------------------------------------------------------------------ *
 * Instrumentation
 * ------------------------------------------------------------------------ */
const counts = {
  pop: 0,
  go: 0,
  confirm: 0,
  // Blocked transactions that actually reached application code, either
  // through window.confirm (<Prompt>) or through our own blocker.
  delivered: 0
};

let lastConfirm = null;
let blockerArmed = false;
let pendingDiagnosis = null;
// Accepting a prompt calls tx.retry(), which is another go() and therefore
// another popstate. That one is the navigation the user asked for, not a POP
// anybody is trying to block, so it must not be diagnosed.
let retryExpected = false;

function setBlockerArmed(armed) {
  blockerArmed = armed;
}

let retryTimer = null;

function expectRetryPop() {
  retryExpected = true;
  clearTimeout(retryTimer);
  // Safety net: if the retry never arrives as a POP we must not swallow the
  // diagnosis of the next real back button press.
  retryTimer = setTimeout(forgetRetryPop, 2000);
}

function forgetRetryPop() {
  retryExpected = false;
  clearTimeout(retryTimer);
  retryTimer = null;
}

function describeState(state) {
  if (state === null || state === undefined) {
    return String(state) + ' (no idx!)';
  }

  if (typeof state !== 'object') {
    return String(state);
  }

  return 'idx=' + state.idx + ' key=' + state.key;
}

function instrument() {
  const globalHistory = window.history;

  // Our popstate listener is registered before the one history v5 installs in
  // createBrowserHistory(), so it reports the state the browser handed us
  // before history reacts to it.
  window.addEventListener('popstate', function (event) {
    counts.pop++;
    log(
      'popstate',
      '#' +
        counts.pop +
        ' -> ' +
        window.location.pathname +
        window.location.hash +
        '   history.state: ' +
        describeState(event.state)
    );

    if (retryExpected) {
      retryExpected = false;
    } else if (blockerArmed && pendingDiagnosis === null) {
      pendingDiagnosis = {
        idx: event.state ? event.state.idx : undefined,
        pop: counts.pop,
        go: counts.go,
        confirm: counts.confirm,
        delivered: counts.delivered
      };
      setTimeout(diagnose, DIAGNOSE_DELAY);
    }
  });

  ['pushState', 'replaceState'].forEach(function (name) {
    const original = globalHistory[name];

    globalHistory[name] = function (state, unused, url) {
      forgetRetryPop();
      log(
        'history',
        name + '(' + describeState(state) + ', ' +
          (url === undefined ? 'same url' : url) + ')'
      );
      return original.apply(globalHistory, arguments);
    };
  });

  ['go', 'back', 'forward'].forEach(function (name) {
    const original = globalHistory[name];

    globalHistory[name] = function (delta) {
      counts.go++;
      log(
        'history',
        name + '(' + (name === 'go' ? delta : '') + ')' +
          (name === 'go' ? '   <- this is how history reverts a blocked POP' : '')
      );
      return original.apply(globalHistory, arguments);
    };
  });

  // <Prompt> calls window.confirm() directly. Timing the call tells us whether
  // a dialog was really shown or whether the browser dismissed it for us.
  const nativeConfirm = window.confirm;

  window.confirm = function (message) {
    const started = Date.now();
    counts.confirm++;
    counts.delivered++;
    log('confirm', 'window.confirm("' + message + '") called');

    let result;

    try {
      result = nativeConfirm.call(window, message);
    } catch (err) {
      log('confirm', 'window.confirm() threw: ' + err);
      throw err;
    }

    const ms = Date.now() - started;
    lastConfirm = { result: result, ms: ms, seq: counts.confirm };
    log(
      'confirm',
      'window.confirm() returned ' + result + ' after ' + ms + 'ms' +
        (result === false && ms < SUPPRESSED_DIALOG_MS
          ? '   <- too fast to have been answered, the browser dismissed it'
          : '')
    );

    if (result) {
      expectRetryPop();
    }

    return result;
  };

  window.addEventListener('beforeunload', function () {
    log('unload', 'beforeunload fired');
  });

  window.addEventListener('pagehide', function (event) {
    log('unload', 'pagehide fired (persisted=' + event.persisted + ')');
  });

  window.addEventListener('pageshow', function (event) {
    log(
      'unload',
      'pageshow fired (persisted=' + event.persisted + ')' +
        (event.persisted ? '   <- restored from the back/forward cache' : '')
    );
  });
}

function diagnose() {
  const snapshot = pendingDiagnosis;
  pendingDiagnosis = null;

  if (snapshot === null) {
    return;
  }

  const gos = counts.go - snapshot.go;
  const delivered = counts.delivered - snapshot.delivered;
  const confirmed =
    lastConfirm !== null && lastConfirm.seq > snapshot.confirm
      ? lastConfirm
      : null;
  let verdict;

  if (snapshot.idx === undefined || snapshot.idx === null) {
    verdict =
      'BROKEN: the entry we popped to carries no `idx` in history.state, so ' +
      'history cannot work out how far to go back. It drops the blocked ' +
      'transaction (the warning about it is compiled out of production ' +
      'builds): no prompt, and the router never sees the new location.';
  } else if (gos === 0) {
    verdict =
      'BROKEN: history did not call go() to revert the POP, so no blocked ' +
      'transaction was ever created. Either delta was 0 (history.state.idx ' +
      'did not change) or no blocker was registered.';
  } else if (delivered === 0) {
    verdict =
      'BROKEN: history reverted the POP with go(delta), but the blocked ' +
      'transaction was never handed to the blocker, so <Prompt> never ran. ' +
      'The revert stands and the page appears stuck. Check above whether a ' +
      'second popstate arrived at all after the go() call.';
  } else if (
    confirmed !== null &&
    confirmed.result === false &&
    confirmed.ms < SUPPRESSED_DIALOG_MS
  ) {
    verdict =
      'BROKEN: window.confirm() returned false after ' + confirmed.ms +
      'ms without showing anything. The browser suppressed the dialog ' +
      '(popstate is not a user gesture in WebKit). <Prompt> reads that as ' +
      '"stay here", never calls tx.retry(), and the reverted POP stands.';
  } else if (confirmed !== null && confirmed.result === false) {
    verdict =
      'OK: the prompt was shown and dismissed, so cancelling the navigation ' +
      'is the correct behaviour.';
  } else {
    verdict =
      'OK: the blocked transaction reached application code and the ' +
      'navigation is now up to the user.';
  }

  // Green for the verdicts where the router behaved, red for the rest.
  log(verdict.indexOf('OK') === 0 ? 'ok' : 'diagnosis', verdict);
}

/* ------------------------------------------------------------------------ *
 * Pages
 * ------------------------------------------------------------------------ */
function Nav() {
  return (
    <nav className="nav">
      <Link to={PATHS.home}>Home</Link>
      <Link to={PATHS.guarded}>Guarded (Prompt)</Link>
      <Link to={PATHS.manual}>Manual block</Link>
      <Link to={PATHS.plain}>Plain page</Link>
    </nav>
  );
}

function HomePage() {
  return (
    <div className="page">
      <h2>How to reproduce</h2>
      <ol>
        <li>
          Open <Link to={PATHS.plain}>Plain page</Link>, then{' '}
          <Link to={PATHS.guarded}>Guarded (Prompt)</Link> so there is history
          to go back to.
        </li>
        <li>
          Leave the guarded page using a link. The prompt appears and accepting
          it navigates &mdash; this part works, including on iOS.
        </li>
        <li>Navigate to the guarded page again.</li>
        <li>
          Now press the browser&rsquo;s own back button (or swipe back).
        </li>
      </ol>
      <p>
        <strong>Expected:</strong> the same prompt, and navigation back when it
        is accepted.
      </p>
      <p>
        <strong>Reported on iOS Safari:</strong> no prompt at all, and the back
        navigation never happens.
      </p>
      <p>
        The log at the bottom records every popstate, every history call and
        every window.confirm, and prints a verdict about 1s after each back
        navigation. The <Link to={PATHS.manual}>Manual block</Link> page runs
        the same blocking through an in-page dialog instead of window.confirm,
        which tells the two likely causes apart.
      </p>
    </div>
  );
}

function PlainPage() {
  return (
    <div className="page">
      <h2>Plain page</h2>
      <p>
        No blocker here. Use this page to build up some history, and to check
        that back and forward work normally when nothing is blocking.
      </p>
    </div>
  );
}

class GuardedPage extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = { armed: true };
    this.onToggle = this.onToggle.bind(this);
  }

  componentWillMount() {
    setBlockerArmed(this.state.armed);
    log('page', 'Guarded page mounted with <Prompt when={true}>');
  }

  componentWillUnmount() {
    setBlockerArmed(false);
    log('page', 'Guarded page unmounted');
  }

  onToggle(event) {
    const armed = event.target.checked;

    setBlockerArmed(armed);
    this.setState({ armed: armed });
    log('page', '<Prompt when> is now ' + armed);
  }

  render(props, state) {
    return (
      <div className="page">
        <Prompt when={state.armed} message={CONFIRM_MESSAGE} />
        <h2>Guarded page</h2>
        <p>
          This page renders{' '}
          <code>
            &lt;Prompt when=&#123;{String(state.armed)}&#125; message="..." /&gt;
          </code>
          .
        </p>
        <label className="toggle">
          <input type="checkbox" checked={state.armed} onChange={this.onToggle} />
          <span>Prompt armed</span>
        </label>
        <p>
          Leaving with a link should prompt. Leaving with the browser back
          button should prompt too, but on iOS Safari it neither prompts nor
          navigates.
        </p>
      </div>
    );
  }
}

/**
 * The same block, but the confirmation is a plain in-page dialog instead of
 * window.confirm. If the transaction arrives here but <Prompt> stays silent,
 * the problem is the suppressed window.confirm dialog rather than the
 * transaction never being delivered.
 */
class ManualBlockPage extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = { tx: null };
    this.onLeave = this.onLeave.bind(this);
    this.onStay = this.onStay.bind(this);
    this.onBlocked = this.onBlocked.bind(this);
  }

  componentWillMount() {
    this.unblock = this.props.history.block(this.onBlocked);
    setBlockerArmed(true);
    log('page', 'Manual block page mounted, history.block() registered');
  }

  componentWillUnmount() {
    this.disable();
    setBlockerArmed(false);
    log('page', 'Manual block page unmounted');
  }

  disable() {
    if (this.unblock) {
      this.unblock();
      this.unblock = null;
    }
  }

  onBlocked(tx) {
    counts.delivered++;
    log(
      'blocker',
      'blocker called with ' + tx.action + ' -> ' + tx.location.pathname
    );
    this.setState({ tx: tx });
  }

  onLeave() {
    const tx = this.state.tx;

    this.disable();
    this.setState({ tx: null });
    log('blocker', 'user chose Leave, calling tx.retry()');
    expectRetryPop();
    tx.retry();
  }

  onStay() {
    this.setState({ tx: null });
    forgetRetryPop();
    log('blocker', 'user chose Stay');
  }

  render(props, state) {
    return (
      <div className="page">
        <h2>Manual block</h2>
        {state.tx ? (
          <div className="dialog">
            <p>{CONFIRM_MESSAGE}</p>
            <button type="button" onClick={this.onLeave}>
              Leave
            </button>
            <button type="button" onClick={this.onStay}>
              Stay
            </button>
          </div>
        ) : null}
        <p>
          This page calls <code>history.block()</code> itself and renders its
          own dialog, so nothing here depends on <code>window.confirm</code>.
        </p>
      </div>
    );
  }
}

/* ------------------------------------------------------------------------ *
 * Debug UI
 * ------------------------------------------------------------------------ */
class Live extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = { tick: 0 };
    this.onChange = this.onChange.bind(this);
  }

  componentDidMount() {
    this.unsubscribe = subscribe(this.onChange);
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  onChange() {
    this.setState({ tick: this.state.tick + 1 });
  }
}

class Status extends Live {
  render() {
    const state = window.history.state;

    return (
      <div className="status">
        <span>
          url <b>{window.location.pathname + window.location.hash}</b>
        </span>
        <span>
          history.state <b>{describeState(state)}</b>
        </span>
        <span>
          length <b>{window.history.length}</b>
        </span>
        <span>
          blocker <b>{blockerArmed ? 'armed' : 'off'}</b>
        </span>
      </div>
    );
  }
}

class EventLog extends Live {
  componentDidUpdate() {
    if (this.node) {
      this.node.scrollTop = this.node.scrollHeight;
    }
  }

  render() {
    const self = this;

    return (
      <div
        className="log"
        ref={function (node) {
          self.node = node;
        }}
      >
        {entries.map(function (entry) {
          return (
            <div className={'entry entry-' + entry.kind} key={entry.id}>
              <span className="time">{pad(entry.at)}</span>
              <span className="kind">{entry.kind}</span>
              <span className="text">{entry.text}</span>
            </div>
          );
        })}
      </div>
    );
  }
}

function Controls() {
  return (
    <div className="controls">
      <button
        type="button"
        onClick={function () {
          log('info', 'history.back() called from the page');
          window.history.back();
        }}
      >
        history.back()
      </button>
      <button
        type="button"
        onClick={function () {
          log('info', 'history.forward() called from the page');
          window.history.forward();
        }}
      >
        history.forward()
      </button>
      <button type="button" onClick={clearLog}>
        Clear log
      </button>
      <button
        type="button"
        onClick={function () {
          const text = logAsText();

          if (window.navigator.clipboard) {
            window.navigator.clipboard.writeText(text).then(
              function () {
                log('info', 'Log copied to the clipboard.');
              },
              function (err) {
                log('info', 'Could not copy the log: ' + err);
              }
            );
          } else {
            window.prompt('Copy the log', text);
          }
        }}
      >
        Copy log
      </button>
    </div>
  );
}

function Shell() {
  return (
    <div className="app">
      <header>
        <h1>&lt;Prompt&gt; and the browser back button</h1>
        <Nav />
        <Status />
      </header>
      <main>
        <Switch>
          <Route exact path={PATHS.home} component={HomePage} />
          <Route exact path={PATHS.guarded} component={GuardedPage} />
          <Route exact path={PATHS.manual} component={ManualBlockPage} />
          <Route exact path={PATHS.plain} component={PlainPage} />
          <Route
            render={function (props) {
              return (
                <div className="page">
                  <h2>No route for {props.location.pathname}</h2>
                  <p>
                    Expected one of {PATHS.home}, {PATHS.guarded},{' '}
                    {PATHS.manual}, {PATHS.plain}.
                  </p>
                </div>
              );
            }}
          />
        </Switch>
      </main>
      <footer>
        <Controls />
        <EventLog />
      </footer>
    </div>
  );
}

restore();
instrument();
log('info', 'userAgent: ' + window.navigator.userAgent);
log(
  'info',
  'Using ' + (useHash ? 'HashRouter' : 'BrowserRouter') +
    ', base path "' + basePath + '"'
);

const Router = useHash ? HashRouter : BrowserRouter;

render(
  <Router>
    <Shell />
  </Router>,
  document.getElementById('app')
);
