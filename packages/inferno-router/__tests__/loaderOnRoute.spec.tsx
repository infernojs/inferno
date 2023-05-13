import { render } from 'inferno';
import { BrowserRouter, MemoryRouter, StaticRouter, Route, NavLink, useLoaderData, useLoaderError, resolveLoaders, traverseLoaders } from 'inferno-router';
// Cherry picked relative import so we don't get node-stuff from inferno-server in browser test
import { createEventGuard, createResponse } from './testUtils';

describe('A <Route> with loader in a MemoryRouter', () => {
  let container;

  beforeEach(function () {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(function () {
    render(null, container);
    container.innerHTML = '';
    document.body.removeChild(container);
  });

  it('renders on initial', async () => {
    const [setDone, waitForRerender] = createEventGuard();

    const TEXT = "ok";
    const loaderFunc = async () => {
      setDone();
      return { message: TEXT }
    }

    render(
      <MemoryRouter initialEntries={['/']}>
        <Route path="/" render={(props: any) => {
          const data = useLoaderData(props);
          return <h1>{data?.message}</h1>
        }} loader={loaderFunc} />
      </MemoryRouter>,
      container
    );

    // Wait until async loader has completed
    await waitForRerender();

    expect(container.innerHTML).toContain(TEXT);
  });

  it('renders error on initial', async () => {
    const [setDone, waitForRerender] = createEventGuard();
    
    const TEXT = "An error";
    const loaderFunc = async () => {
      setDone();
      throw new Error(TEXT)
    }

    render(
      <MemoryRouter initialEntries={['/']}>
        <Route path="/" render={(props: any) => {
          const err = useLoaderError(props);
          return <h1>{err?.message}</h1>
        }} loader={loaderFunc} />
      </MemoryRouter>,
      container
    );

    // Wait until async loader has completed
    await waitForRerender();

    expect(container.innerHTML).toContain(TEXT);
  });

  it('Can access initialData (for hydration)', async () => {
    const TEXT = 'bubblegum';
    const Component = (props) => {
      const res = useLoaderData(props);
      return <h1>{res?.message}</h1>
    }
    const loaderFunc = async () => { return { message: TEXT }}
    const initialData = {
      '/flowers': { res: await loaderFunc(), err: undefined, }
    }

    render(
      <MemoryRouter initialEntries={['/flowers']} initialData={initialData}>
        <Route path="/flowers" render={Component} loader={loaderFunc} />
      </MemoryRouter>,
      container
    );

    expect(container.innerHTML).toContain(TEXT);
  });

  it('Should render component after after click', async () => {
    const [setDone, waitForRerender] = createEventGuard();
    
    const TEST = "ok";
    const loaderFunc = async () => {
      setDone();
      return { message: TEST }
    };

    function RootComp() {
      return <div id="root">ROOT</div>;
    }

    function CreateComp(props) {
      const res = useLoaderData(props);
      return <div id="create">{res.message}</div>;
    }

    function PublishComp() {
      return <div id="publish">PUBLISH</div>;
    }

    const tree = (
      <MemoryRouter>
        <div>
          <nav>
            <ul>
              <li>
                <NavLink exact to="/">
                  Play
                </NavLink>
              </li>
              <li id="createNav">
                <NavLink to="/create">
                  Create
                </NavLink>
              </li>
              <li>
                <NavLink to="/publish">
                  Publish
                </NavLink>
              </li>
            </ul>
          </nav>
          <Route exact path="/" component={RootComp} />
          <Route path="/create" component={CreateComp} loader={loaderFunc} />
          <Route path="/publish" component={PublishComp} />
        </div>
      </MemoryRouter>
    );

    render(tree, container);

    expect(container.innerHTML).toContain("ROOT");

    // Click create
    const link = container.querySelector('#createNav');
    link.firstChild.click();

    // Wait until async loader has completed
    await waitForRerender();

    expect(container.querySelector('#create').innerHTML).toContain(TEST);
  });

  it('Should recieve params in loader', async () => {
    const TEXT = 'bubblegum';
    const Component = (props) => {
      const res = useLoaderData(props);
      return <div><h1>{res?.message}</h1><p>{res?.slug}</p></div>
    }
    const loaderFunc = async ({params: paramsIn}: any) => {
      return { message: TEXT, slug: paramsIn?.slug }
    }

    const params = { slug: 'flowers' };
    const initialData = {
      '/:slug': { res: await loaderFunc({ params }), err: undefined, }
    }

    render(
      <MemoryRouter initialEntries={['/flowers']} initialData={initialData}>
        <Route path="/:slug" render={Component} loader={loaderFunc} />
      </MemoryRouter>,
      container
    );

    expect(container.innerHTML).toContain(TEXT);
    expect(container.innerHTML).toContain('flowers');
  });

  it('Can abort fetch', async () => {
    const abortCalls = {
      nrofCalls: 0
    };
    const _abortFn = AbortController.prototype.abort;
    AbortController.prototype.abort = () => {
      abortCalls.nrofCalls++;
    }
    const [setDone, waitForRerender] = createEventGuard();
    
    const TEST = "ok";

    const loaderFunc = async ({ request }) => {
      expect(request).toBeDefined();
      expect(request.signal).toBeDefined();
      return new Promise((resolve) => {
        setTimeout(() => {
          setDone();
          resolve({ message: TEST })
        }, 5);
      });
    };

    function RootComp() {
      return <div id="root">ROOT</div>;
    }

    function CreateComp(props) {
      const res = useLoaderData(props);
      return <div id="create">{res.message}</div>;
    }

    function PublishComp() {
      return <div id="publish">PUBLISH</div>;
    }

    const tree = (
      <MemoryRouter>
        <div>
          <nav>
            <ul>
              <li>
                <NavLink exact to="/">
                  Play
                </NavLink>
              </li>
              <li id="createNav">
                <NavLink to="/create">
                  Create
                </NavLink>
              </li>
              <li id="publishNav">
                <NavLink to="/publish">
                  Publish
                </NavLink>
              </li>
            </ul>
          </nav>
          <Route exact path="/" component={RootComp} />
          <Route path="/create" component={CreateComp} loader={loaderFunc} />
          <Route path="/publish" component={PublishComp} />
        </div>
      </MemoryRouter>
    );

    render(tree, container);

    expect(container.innerHTML).toContain("ROOT");

    // Click create
    container.querySelector('#createNav').firstChild.click();
    container.querySelector('#publishNav').firstChild.click();

    await waitForRerender();
  
    expect(abortCalls.nrofCalls).toEqual(1);
    expect(container.querySelector('#create')).toBeNull();
    AbortController.prototype.abort = _abortFn;
  });
});

describe('A <Route> with loader in a BrowserRouter', () => {
  let container;

  beforeEach(function () {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(function () {
    render(null, container);
    container.innerHTML = '';
    document.body.removeChild(container);
    // Reset history to root
    history.replaceState(undefined, '', '/');
  });

  it('renders on initial', async () => {
    const [setDone, waitForRerender] = createEventGuard();

    const TEXT = "ok";
    const loaderFunc = async () => {
      setDone();
      return { message: TEXT }
    }

    render(
      <MemoryRouter initialEntries={['/']}>
        <Route path="/" render={(props: any) => {
          const data = useLoaderData(props);
          return <h1>{data?.message}</h1>
        }} loader={loaderFunc} />
      </MemoryRouter>,
      container
    );

    // Wait until async loader has completed
    await waitForRerender();

    expect(container.innerHTML).toContain(TEXT);
  });

  it('renders error on initial', async () => {
    const [setDone, waitForRerender] = createEventGuard();
    
    const TEXT = "An error";
    const loaderFunc = async () => {
      setDone();
      throw new Error(TEXT)
    }

    render(
      <MemoryRouter initialEntries={['/']}>
        <Route path="/" render={(props: any) => {
          const err = useLoaderError(props);
          return <h1>{err?.message}</h1>
        }} loader={loaderFunc} />
      </MemoryRouter>,
      container
    );

    // Wait until async loader has completed
    await waitForRerender();

    expect(container.innerHTML).toContain(TEXT);
  });

  it('Can access initialData (for hydration)', async () => {
    const TEXT = 'bubblegum';
    const Component = (props) => {
      const res = useLoaderData(props);
      return <h1>{res?.message}</h1>
    }

    const loaderFunc = async () => { return { message: TEXT }}

    const initialData = {
      '/flowers': { res: await loaderFunc(), err: undefined, }
    }

    history.replaceState(undefined, '', '/flowers');
    render(
      <BrowserRouter initialData={initialData}>
        <Route path="/flowers" render={Component} loader={loaderFunc} />
      </BrowserRouter>,
      container
    );

    expect(container.innerHTML).toContain(TEXT);
  });

  it('Should render component after after click', async () => {
    const [setDone, waitForRerender] = createEventGuard();
    const TEST = "ok";
    const loaderFunc = async () => {
      setDone();
      return { message: TEST }
    };

    function RootComp() {
      return <div id="root">ROOT</div>;
    }

    function CreateComp(props) {
      const res = useLoaderData(props);
      return <div id="create">{res.message}</div>;
    }

    function PublishComp() {
      return <div id="publish">PUBLISH</div>;
    }

    const tree = (
      <BrowserRouter>
        <div>
          <nav>
            <ul>
              <li>
                <NavLink exact to="/">
                  Play
                </NavLink>
              </li>
              <li id="createNav">
                <NavLink to="/create">
                  Create
                </NavLink>
              </li>
              <li>
                <NavLink to="/publish">
                  Publish
                </NavLink>
              </li>
            </ul>
          </nav>
          <Route exact path="/" component={RootComp} />
          <Route path="/create" component={CreateComp} loader={loaderFunc} />
          <Route path="/publish" component={PublishComp} />
        </div>
      </BrowserRouter>
    );

    render(tree, container);

    expect(container.innerHTML).toContain("ROOT");

    // Click create
    const link = container.querySelector('#createNav');
    link.firstChild.click();

    // Wait until async loader has completed
    await waitForRerender();

    expect(container.querySelector('#create').innerHTML).toContain(TEST);
  });

  it('calls json() when response is received', async () => {
    const [setDone, waitForRerender] = createEventGuard();

    const TEXT = "ok";
    const loaderFunc = async () => {
      setDone();
      const data = { message: TEXT };
      return createResponse(data, 'json', 200);
    }

    render(
      <MemoryRouter initialEntries={['/']}>
        <Route path="/" render={(props: any) => {
          const data = useLoaderData(props);
          return <h1>{data?.message}</h1>
        }} loader={loaderFunc} />
      </MemoryRouter>,
      container
    );

    // Wait until async loader has completed
    await waitForRerender();

    expect(container.innerHTML).toContain(TEXT);
  });

  it('calls text() when response is received', async () => {
    const [setDone, waitForRerender] = createEventGuard();

    const TEXT = "ok";
    const loaderFunc = async () => {
      setDone();
      const data = TEXT;
      return createResponse(data, 'text', 200);
    }

    render(
      <MemoryRouter initialEntries={['/']}>
        <Route path="/" render={(props: any) => {
          const data = useLoaderData(props);
          return <h1>{data}</h1>
        }} loader={loaderFunc} />
      </MemoryRouter>,
      container
    );

    // Wait until async loader has completed
    await waitForRerender();

    expect(container.innerHTML).toContain(TEXT);
  });

});

describe('A <Route> with loader in a StaticRouter', () => {
  let container;

  beforeEach(function () {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(function () {
    render(null, container);
    container.innerHTML = '';
    document.body.removeChild(container);
    // Reset history to root
    history.replaceState(undefined, '', '/');
  });

  it('renders on initial', async () => {
    const [setDone, waitForRerender] = createEventGuard();

    const TEXT = "ok";
    const loaderFunc = async () => {
      setDone();
      return { message: TEXT }
    }

    render(
      <StaticRouter context={{}}>
        <Route path="/" render={(props: any) => {
          const data = useLoaderData(props);
          return <h1>{data?.message}</h1>
        }} loader={loaderFunc} />
      </StaticRouter>,
      container
    );

    // Wait until async loader has completed
    await waitForRerender();

    expect(container.innerHTML).toContain(TEXT);
  });

  it('renders error on initial', async () => {
    const [setDone, waitForRerender] = createEventGuard();
    
    const TEXT = "An error";
    const loaderFunc = async () => {
      setDone();
      throw new Error(TEXT)
    }

    render(
      <StaticRouter context={{}}>
        <Route path="/" render={(props: any) => {
          const err = useLoaderError(props);
          return <h1>{err?.message}</h1>
        }} loader={loaderFunc} />
      </StaticRouter>,
      container
    );

    // Wait until async loader has completed
    await waitForRerender();

    expect(container.innerHTML).toContain(TEXT);
  });

  it('Can access initialData (for hydration)', async () => {
    const TEXT = 'bubblegum';
    const Component = (props) => {
      const res = useLoaderData(props);
      return <h1>{res?.message}</h1>
    }

    const loaderFunc = async () => { return { message: TEXT }}

    const initialData = {
      '/flowers': { res: await loaderFunc(), err: undefined, }
    }

    render(
      <StaticRouter context={{}} location="/flowers" initialData={initialData}>
        <Route path="/flowers" render={Component} loader={loaderFunc} />
      </StaticRouter>,
      container
    );

    expect(container.innerHTML).toContain(TEXT);
  });
});

describe('Resolve loaders during server side rendering', () => {
  it('Can resolve with single route', async () => {
    const TEXT = 'bubblegum';
    const Component = (props) => {
      const res = useLoaderData(props);
      return <h1>{res?.message}</h1>
    }

    const loaderFunc = async () => { return { message: TEXT }}

    const initialData = {
      '/flowers': { res: await loaderFunc() }
    }

    const app = <StaticRouter context={{}} location="/flowers">
        <Route path="/flowers" render={Component} loader={loaderFunc} />
      </StaticRouter>;

    const loaderEntries = traverseLoaders('/flowers', app);
    const result = await resolveLoaders(loaderEntries);
    expect(result).toEqual(initialData);
  });

  it('Can resolve with multiple routes', async () => {
    const TEXT = 'bubblegum';
    const Component = (props) => {
      const res = useLoaderData(props);
      return <h1>{res?.message}</h1>
    }

    const loaderFuncNoHit = async () => { return { message: 'no' }}
    const loaderFunc = async () => { return { message: TEXT }}

    const initialData = {
      '/birds': { res: await loaderFunc() }
    }

    const app = <StaticRouter context={{}} location="/birds">
        <Route path="/flowers" render={Component} loader={loaderFuncNoHit} />
        <Route path="/birds" render={Component} loader={loaderFunc} />
        <Route path="/bees" render={Component} loader={loaderFuncNoHit} />
      </StaticRouter>;

    const loaderEntries = traverseLoaders('/birds', app);
    const result = await resolveLoaders(loaderEntries);
    expect(result).toEqual(initialData);
  });

  it('Can resolve with nested routes', async () => {
    const TEXT = 'bubblegum';
    const Component = (props) => {
      const res = useLoaderData(props);
      return <h1>{res?.message}</h1>
    }

    const loaderFuncNoHit = async () => { return { message: 'no' }}
    const loaderFunc = async () => { return { message: TEXT }}

    const initialData = {
      '/flowers': { res: await loaderFunc() },
      '/flowers/birds': { res: await loaderFunc() }
    }

    const app = <StaticRouter context={{}} location="/flowers/birds">
        <Route path="/flowers" render={Component} loader={loaderFunc}>
          <Route path="/flowers/birds" render={Component} loader={loaderFunc} />
          <Route path="/flowers/bees" render={Component} loader={loaderFuncNoHit} />
          {null}
        </Route>
      </StaticRouter>;

    const loaderEntries = traverseLoaders('/flowers/birds', app);
    const result = await resolveLoaders(loaderEntries);
    expect(result).toEqual(initialData);
  });
})
