import { render, rerender } from 'inferno';
import { createMemoryHistory, type History } from 'history';
import {
  BrowserRouter,
  HashRouter,
  MemoryRouter,
  Prompt,
  Route,
  Router,
  type GetUserConfirmation,
} from 'inferno-router';

describe('<Prompt> custom confirmation', () => {
  let node: HTMLDivElement;
  let history: History;
  let requests: Array<{
    message: string;
    resolve: (allow: boolean) => void;
    cleanup: jasmine.Spy;
  }>;
  let getUserConfirmation: GetUserConfirmation;

  function mount(
    when = true,
    message = 'Leave?',
    handler = getUserConfirmation,
  ) {
    render(
      <Router history={history} getUserConfirmation={handler}>
        <Prompt when={when} message={message} />
      </Router>,
      node,
    );
  }

  beforeEach(() => {
    node = document.createElement('div');
    history = createMemoryHistory({ initialEntries: ['/a'] });
    requests = [];
    getUserConfirmation = (message, resolve) => {
      const cleanup = jasmine.createSpy('cleanup');
      requests.push({ message, resolve, cleanup });
      return cleanup;
    };
  });

  afterEach(() => {
    render(null, node);
  });

  const methods = ['push', 'replace'] as const;
  for (let i = 0, len = methods.length; i < len; ++i) {
    const action = methods[i];
    it(`waits for custom confirmation of ${action} without using window.confirm`, () => {
      const nativeConfirm = spyOn(window, 'confirm').and.returnValue(false);
      mount();

      history[action]('/b');
      expect(history.location.pathname).toBe('/a');
      expect(requests.length).toBe(1);
      expect(requests[0].message).toBe('Leave?');
      expect(nativeConfirm).not.toHaveBeenCalled();

      requests[0].resolve(true);
      expect(history.location.pathname).toBe('/b');
      expect(requests[0].cleanup).toHaveBeenCalledTimes(1);

      history[action]('/c');
      expect(history.location.pathname).toBe('/b');
      expect(requests.length).toBe(2);
      requests[1].resolve(true);
      expect(history.location.pathname).toBe('/c');
    });
  }

  it('keeps blocking after Stay and ignores a later reply to that decision', () => {
    mount();
    history.push('/b');
    requests[0].resolve(false);
    requests[0].resolve(true);
    expect(history.location.pathname).toBe('/a');
    expect(requests[0].cleanup).toHaveBeenCalledTimes(1);

    history.push('/c');
    requests[0].resolve(true);
    expect(history.location.pathname).toBe('/a');
    requests[1].resolve(true);
    expect(history.location.pathname).toBe('/c');
  });

  it('keeps the first pending destination and retries only once', () => {
    const committed = jasmine.createSpy('committed');
    history.listen(committed);
    mount();
    history.push('/b');
    history.push('/c');
    expect(requests.length).toBe(1);

    requests[0].resolve(true);
    requests[0].resolve(true);
    expect(history.location.pathname).toBe('/b');
    expect(committed).toHaveBeenCalledTimes(1);
    expect(requests[0].cleanup).toHaveBeenCalledTimes(1);
  });

  it('supports synchronous handlers and cleans up after each decision', () => {
    const cleanup = jasmine.createSpy('cleanup');
    const handler = jasmine
      .createSpy('confirmation')
      .and.callFake((_message, resolve) => {
        resolve(true);
        return cleanup;
      });
    mount(true, 'Leave?', handler);
    history.push('/b');
    history.back();
    expect(history.location.pathname).toBe('/a');
    expect(handler).toHaveBeenCalledTimes(2);
    expect(cleanup).toHaveBeenCalledTimes(2);
  });

  const changes = ['disable', 'unmount', 'message', 'handler'];
  for (let i = 0, len = changes.length; i < len; ++i) {
    const change = changes[i];
    it(`cleans up and ignores pending replies after ${change}`, () => {
      mount();
      history.push('/b');
      const first = requests[0];

      if (change === 'disable') {
        mount(false);
      } else if (change === 'unmount') {
        render(null, node);
      } else if (change === 'message') {
        mount(true, 'Updated message');
      } else {
        mount(true, 'Leave?', (message, resolve) =>
          getUserConfirmation(message, resolve),
        );
      }

      expect(first.cleanup).toHaveBeenCalledTimes(1);
      first.resolve(true);
      expect(history.location.pathname).toBe('/a');

      history.push('/c');
      if (change === 'disable' || change === 'unmount') {
        expect(history.location.pathname).toBe('/c');
        expect(requests.length).toBe(1);
      } else {
        expect(history.location.pathname).toBe('/a');
        expect(requests[1].message).toBe(
          change === 'message' ? 'Updated message' : 'Leave?',
        );
        requests[1].resolve(true);
        expect(history.location.pathname).toBe('/c');
      }
    });
  }

  it('does not let a reply to an earlier enabled state navigate', () => {
    mount();
    history.push('/b');
    mount(false);
    mount(true);
    history.push('/c');
    requests[0].resolve(true);
    expect(history.location.pathname).toBe('/a');
    requests[1].resolve(true);
    expect(history.location.pathname).toBe('/c');
  });

  it('allows another attempt after the custom handler throws', () => {
    const error = new Error('Dialog failed');
    let fail = true;
    mount(true, 'Leave?', (message, resolve) => {
      if (fail) {
        throw error;
      }
      return getUserConfirmation(message, resolve);
    });
    expect(() => history.push('/b')).toThrow(error);
    expect(history.location.pathname).toBe('/a');
    fail = false;
    history.push('/c');
    expect(requests.length).toBe(1);
    requests[0].resolve(true);
    expect(history.location.pathname).toBe('/c');
  });

  it('cleans up when the handler disables the prompt before returning', () => {
    const cleanup = jasmine.createSpy('cleanup');
    let reply;
    mount(true, 'Leave?', (_message, resolve) => {
      reply = resolve;
      mount(false);
      return cleanup;
    });
    history.push('/b');
    expect(cleanup).toHaveBeenCalledTimes(1);
    reply(true);
    expect(history.location.pathname).toBe('/a');
    history.push('/c');
    expect(history.location.pathname).toBe('/c');
  });

  it('does not reinstall a blocker when the accepted navigation unmounts the prompt', () => {
    render(
      <Router history={history} getUserConfirmation={getUserConfirmation}>
        <Route
          path="/a"
          render={() => <Prompt when={true} message="Leave?" />}
        />
      </Router>,
      node,
    );
    history.push('/b');
    requests[0].resolve(true);
    rerender();
    history.push('/c');
    expect(history.location.pathname).toBe('/c');
    expect(requests.length).toBe(1);
  });

  it('passes the confirmation handler through MemoryRouter', () => {
    render(
      <MemoryRouter
        getUserConfirmation={getUserConfirmation}
        ref={(router) => {
          if (router) history = router.history;
        }}
      >
        <Prompt when={true} message="Memory confirmation" />
      </MemoryRouter>,
      node,
    );
    history.push('/b');
    expect(requests[0].message).toBe('Memory confirmation');
    requests[0].resolve(true);
    expect(history.location.pathname).toBe('/b');
  });
});

// Exercise real asynchronous history.go()/popstate in both jsdom (CI) and
// the Jasmine browser suite. Memory history alone cannot catch early reblocking.
// Name the suites explicitly: minifiers mangle class names, which made the
// Sauce failures unreadable and can give both routers the same name.
const routers = [
  ['BrowserRouter', BrowserRouter],
  ['HashRouter', HashRouter],
] as const;
for (let i = 0, len = routers.length; i < len; ++i) {
  const [routerName, TestRouter] = routers[i];
  describe(`<Prompt> with ${routerName} POP navigation`, () => {
    let node: HTMLDivElement;
    let history: History;
    let initialURL: string;
    let initialState;
    let requests: Array<(allow: boolean) => void>;
    let getUserConfirmation: GetUserConfirmation | undefined;
    let subscriptions: Array<
      [
        string,
        EventListenerOrEventListenerObject,
        boolean | AddEventListenerOptions | undefined,
      ]
    >;

    async function waitFor(check: () => boolean) {
      const deadline = Date.now() + 2000;
      while (!check()) {
        if (Date.now() > deadline) {
          throw new Error('History transition did not complete');
        }
        await new Promise((resolve) => setTimeout(resolve, 1));
      }
      rerender();
    }

    function mount(when = true, message = 'Leave?') {
      render(
        <TestRouter
          getUserConfirmation={getUserConfirmation}
          ref={(router) => {
            if (router) history = router.history;
          }}
        >
          <Prompt when={when} message={message} />
        </TestRouter>,
        node,
      );
    }

    function browserPath() {
      return TestRouter === HashRouter
        ? window.location.hash.slice(1)
        : window.location.pathname;
    }

    async function waitForPrompt(count: number) {
      // Hash history may deliver its blocker on hashchange before the
      // restoration finishes. Model a user responding after the URL settles.
      await waitFor(
        () =>
          requests.length === count &&
          browserPath() === history.location.pathname,
      );
    }

    beforeEach(() => {
      node = document.createElement('div');
      initialURL = window.location.href;
      initialState = window.history.state;
      // Like a page load, start from an entry without a history key.
      window.history.replaceState(null, '', initialURL);
      requests = [];
      getUserConfirmation = (_message, resolve) => {
        requests.push(resolve);
      };
      // history v5 has no dispose() API. Remove its native event listeners so
      // each test uses only its own router, even when a previous test fails.
      subscriptions = [];
      const addEventListener = window.addEventListener.bind(window);
      spyOn(window, 'addEventListener').and.callFake(
        (type, listener, options) => {
          subscriptions.push([type, listener, options]);
          addEventListener(type, listener, options);
        },
      );
      mount(false);
      history.push('/prompt-a');
      history.push('/prompt-b');
      mount();
    });

    afterEach(() => {
      render(null, node);
      for (let i = 0, len = subscriptions.length; i < len; ++i) {
        const [type, listener, options] = subscriptions[i];
        window.removeEventListener(type, listener, options);
      }
      window.history.replaceState(initialState, '', initialURL);
    });

    it('cancels Back, accepts a subsequent Back once, and still guards Forward', async () => {
      const nativeConfirm = spyOn(window, 'confirm').and.returnValue(false);
      const committed = jasmine.createSpy('committed');
      const unlisten = history.listen(committed);

      history.back();
      await waitForPrompt(1);
      expect(history.location.pathname).toBe('/prompt-b');
      expect(browserPath()).toBe('/prompt-b');
      requests[0](false);
      expect(committed).not.toHaveBeenCalled();

      history.back();
      await waitForPrompt(2);
      requests[1](true);
      requests[1](true);
      await waitFor(() => history.location.pathname === '/prompt-a');
      expect(browserPath()).toBe('/prompt-a');
      expect(committed).toHaveBeenCalledTimes(1);
      expect(requests.length).toBe(2);

      history.forward();
      await waitForPrompt(3);
      expect(history.location.pathname).toBe('/prompt-a');
      requests[2](true);
      await waitFor(() => history.location.pathname === '/prompt-b');
      expect(committed).toHaveBeenCalledTimes(2);
      expect(nativeConfirm).not.toHaveBeenCalled();
      unlisten();
    });

    it('does not reblock an accepted POP when props change before it commits', async () => {
      history.back();
      await waitForPrompt(1);
      requests[0](true);
      // The accepted browser traversal has been scheduled but has not run.
      mount(false);
      mount(true, 'Updated message');
      await waitFor(() => history.location.pathname === '/prompt-a');
      expect(requests.length).toBe(1);

      history.forward();
      await waitForPrompt(2);
      requests[1](false);
      expect(history.location.pathname).toBe('/prompt-a');
      expect(browserPath()).toBe('/prompt-a');
    });

    // Hash history asks on hashchange, before its restoring POP commits.
    // Chromium drops a traversal started during that one, so a synchronous
    // confirmation must not retry until the restoring POP has committed.
    it('also waits for native-confirmed POP to commit before reblocking', async () => {
      const nativeConfirm = spyOn(window, 'confirm').and.returnValues(
        true,
        false,
      );
      getUserConfirmation = undefined;
      mount();
      history.back();
      await waitFor(() => history.location.pathname === '/prompt-a');
      expect(nativeConfirm).toHaveBeenCalledTimes(1);

      history.forward();
      // As in waitForPrompt, hash history asks before restoring the URL.
      await waitFor(
        () =>
          nativeConfirm.calls.count() === 2 &&
          browserPath() === history.location.pathname,
      );
      expect(history.location.pathname).toBe('/prompt-a');
      expect(browserPath()).toBe('/prompt-a');
    });

    it('completes a synchronously accepted POP when the prompt unmounts at once', async () => {
      getUserConfirmation = (_message, resolve) => {
        resolve(true);
        render(null, node);
      };
      mount();
      history.back();
      await waitFor(() => history.location.pathname === '/prompt-a');
      expect(browserPath()).toBe('/prompt-a');
    });

    it('completes a native-confirmed POP to the first entry, which has no key', async () => {
      const nativeConfirm = spyOn(window, 'confirm').and.returnValue(true);
      getUserConfirmation = undefined;
      mount();
      history.go(-2);
      await waitFor(() => history.location.key === 'default');
      expect(nativeConfirm).toHaveBeenCalledTimes(1);
    });

    it('cleans up a retry listener when unmounted before the POP commits', async () => {
      history.back();
      await waitForPrompt(1);
      requests[0](true);
      render(null, node);
      await waitFor(() => history.location.pathname === '/prompt-a');
      history.forward();
      await waitFor(() => history.location.pathname === '/prompt-b');
      expect(requests.length).toBe(1);
    });
  });
}
