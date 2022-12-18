import { render } from 'inferno';
import { renderToString } from 'inferno-server'
import { BrowserRouter, MemoryRouter, StaticRouter, Route, NavLink, resolveLoaders, useLoaderData, useLoaderError } from 'inferno-router';
import { createEventGuard } from './testUtils';

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
        <Route path="/" render={(props) => {
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
        <Route path="/" render={(props) => {
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

  it('Can access initial loaderData (for hydration)', async () => {
    const TEXT = 'bubblegum';
    const Component = (props, { router }) => {
      const res = useLoaderData(props);
      return <h1>{res?.message}</h1>
    }
    const loaderFunc = async () => { return { message: TEXT }}
    const loaderData = {
      '/flowers': { res: await loaderFunc(), err: undefined, }
    }

    render(
      <MemoryRouter initialEntries={['/flowers']} loaderData={loaderData}>
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
      const err = useLoaderError(props);
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
    history.replaceState(undefined, undefined, '/');
  });

  it('renders on initial', async () => {
    const [setDone, waitForRerender] = createEventGuard();

    const TEXT = "ok";
    const loaderFunc = async () => {
      setDone();
      return { message: TEXT }
    }

    render(
      <BrowserRouter initialEntries={['/']}>
        <Route path="/" render={(props) => {
          const data = useLoaderData(props);
          return <h1>{data?.message}</h1>
        }} loader={loaderFunc} />
      </BrowserRouter>,
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
      <BrowserRouter initialEntries={['/']}>
        <Route path="/" render={(props) => {
          const err = useLoaderError(props);
          return <h1>{err?.message}</h1>
        }} loader={loaderFunc} />
      </BrowserRouter>,
      container
    );

    // Wait until async loader has completed
    await waitForRerender();

    expect(container.innerHTML).toContain(TEXT);
  });

  it('Can access initial loaderData (for hydration)', async () => {
    const TEXT = 'bubblegum';
    const Component = (props, { router }) => {
      const res = useLoaderData(props);
      return <h1>{res?.message}</h1>
    }

    const loaderFunc = async () => { return { message: TEXT }}

    const loaderData = {
      '/flowers': { res: await loaderFunc(), err: undefined, }
    }

    history.replaceState(undefined, undefined, '/flowers');
    render(
      <BrowserRouter loaderData={loaderData}>
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
      const err = useLoaderError(props);
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
    history.replaceState(undefined, undefined, '/');
  });

  it('renders on initial', async () => {
    const [setDone, waitForRerender] = createEventGuard();

    const TEXT = "ok";
    const loaderFunc = async () => {
      setDone();
      return { message: TEXT }
    }

    render(
      <StaticRouter initialEntries={['/']}>
        <Route path="/" render={(props) => {
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
      <StaticRouter initialEntries={['/']}>
        <Route path="/" render={(props) => {
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

  it('Can access initial loaderData (for hydration)', async () => {
    const TEXT = 'bubblegum';
    const Component = (props, { router }) => {
      const res = useLoaderData(props);
      return <h1>{res?.message}</h1>
    }

    const loaderFunc = async () => { return { message: TEXT }}

    const loaderData = {
      '/flowers': { res: await loaderFunc(), err: undefined, }
    }

    render(
      <StaticRouter location="/flowers" loaderData={loaderData}>
        <Route path="/flowers" render={Component} loader={loaderFunc} />
      </StaticRouter>,
      container
    );

    expect(container.innerHTML).toContain(TEXT);
  });
});

describe('Resolve loaders during server side rendering', () => {
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
    history.replaceState(undefined, undefined, '/');
  });

  it('Can resolve with single route', async () => {
    const TEXT = 'bubblegum';
    const Component = (props, { router }) => {
      const res = useLoaderData(props);
      return <h1>{res?.message}</h1>
    }

    const loaderFunc = async () => { return { message: TEXT }}

    const loaderData = {
      '/flowers': { res: await loaderFunc() }
    }

    const app = <StaticRouter location="/flowers">
        <Route path="/flowers" render={Component} loader={loaderFunc} />
      </StaticRouter>;

    const result = await resolveLoaders('/flowers', app);
    expect(result).toEqual(loaderData);
  });

  it('Can resolve with multiple routes', async () => {
    const TEXT = 'bubblegum';
    const Component = (props, { router }) => {
      const res = useLoaderData(props);
      return <h1>{res?.message}</h1>
    }

    const loaderFuncNoHit = async () => { return { message: 'no' }}
    const loaderFunc = async () => { return { message: TEXT }}

    const loaderData = {
      '/birds': { res: await loaderFunc() }
    }

    const app = <StaticRouter location="/birds">
        <Route path="/flowers" render={Component} loader={loaderFuncNoHit} />
        <Route path="/birds" render={Component} loader={loaderFunc} />
        <Route path="/bees" render={Component} loader={loaderFuncNoHit} />
      </StaticRouter>;

    const result = await resolveLoaders('/birds', app);
    expect(result).toEqual(loaderData);
  });

  it('Can resolve with nested routes', async () => {
    const TEXT = 'bubblegum';
    const Component = (props, { router }) => {
      const res = useLoaderData(props);
      return <h1>{res?.message}</h1>
    }

    const loaderFuncNoHit = async () => { return { message: 'no' }}
    const loaderFunc = async () => { return { message: TEXT }}

    const loaderData = {
      '/flowers': { res: await loaderFunc() },
      '/flowers/birds': { res: await loaderFunc() }
    }

    const app = <StaticRouter location="/flowers/birds">
        <Route path="/flowers" render={Component} loader={loaderFunc}>
          <Route path="/flowers/birds" render={Component} loader={loaderFunc} />
          <Route path="/flowers/bees" render={Component} loader={loaderFuncNoHit} />
          {null}
        </Route>
      </StaticRouter>;

    const result = await resolveLoaders('/flowers/birds', app);
    expect(result).toEqual(loaderData);
  });


  it('SSR renders same result as browser', async () => {
    const TEXT = 'bubblegum';
    const Component = (props, { router }) => {
      const res = useLoaderData(props);
      return <h1>{res?.message}</h1>
    }

    const loaderFuncNoHit = async () => { return { message: 'no' }}
    const loaderFunc = async () => { return { message: TEXT }}

    const loaderData = {
      '/birds': { res: await loaderFunc() }
    }

    const routes = [
        <Route path="/flowers" render={Component} loader={loaderFuncNoHit} />,
        <Route path="/birds" render={Component} loader={loaderFunc} />,
        <Route path="/bees" render={Component} loader={loaderFuncNoHit} />,
    ]

    const initialData = await resolveLoaders('/birds', routes);

    // Render on server
    const html = renderToString(<StaticRouter location="/birds" loaderData={initialData}>{routes}</StaticRouter>);
    
    // Render in browser
    history.replaceState(undefined, undefined, '/birds');
    render(<BrowserRouter loaderData={initialData}>{routes}</BrowserRouter>, container);


    expect(`<!--!-->${container.innerHTML}<!--!-->`).toEqual(html);
  });
})