import { render, rerender } from 'inferno';
import { MemoryRouter, Route, Switch, NavLink, useLoaderData, useLoaderError } from 'inferno-router';
// Cherry picked relative import so we don't get node-stuff from inferno-server in browser test
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

    const TEXT = 'ok';
    const loaderFunc = async () => {
      setDone();
      return { message: TEXT };
    };

    render(
      <MemoryRouter initialEntries={['/']}>
        <Route
          path="/"
          render={(props: any) => {
            const data = useLoaderData(props);
            return <h1>{data?.message}</h1>;
          }}
          loader={loaderFunc}
        />
      </MemoryRouter>,
      container
    );

    // Wait until async loader has completed
    await waitForRerender();

    expect(container.innerHTML).toContain(TEXT);
  });

  it('renders error on initial', async () => {
    const [setDone, waitForRerender] = createEventGuard();

    const TEXT = 'An error';
    const loaderFunc = async () => {
      setDone();
      throw new Error(TEXT);
    };

    render(
      <MemoryRouter initialEntries={['/']}>
        <Route
          path="/"
          render={(props: any) => {
            const err = useLoaderError(props);
            return <h1>{err?.message}</h1>;
          }}
          loader={loaderFunc}
        />
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
      return <h1>{res?.message}</h1>;
    };
    const loaderFunc = async () => {
      return { message: TEXT };
    };
    const initialData = {
      '/flowers': { res: await loaderFunc(), err: undefined }
    };

    render(
      <MemoryRouter initialEntries={['/flowers']} initialData={initialData}>
        <Route path="/flowers" render={Component} loader={loaderFunc} />
      </MemoryRouter>,
      container
    );

    expect(container.innerHTML).toContain(TEXT);
  });

  it('Should render component after click', async () => {
    const [setDone, waitForRerender] = createEventGuard();

    const TEST = 'ok';
    const loaderFunc = async () => {
      setDone();
      return { message: TEST };
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
                <NavLink to="/create">Create</NavLink>
              </li>
              <li>
                <NavLink to="/publish">Publish</NavLink>
              </li>
            </ul>
          </nav>
          <Switch>
            <Route exact path="/" component={RootComp} />
            <Route path="/create" component={CreateComp} loader={loaderFunc} />
            <Route path="/publish" component={PublishComp} />
          </Switch>
        </div>
      </MemoryRouter>
    );

    render(tree, container);

    expect(container.innerHTML).toContain('ROOT');

    // Click create
    const link = container.querySelector('#createNav');
    link.firstChild.click();

    // Wait until async loader has completed
    await waitForRerender();

    expect(container.querySelector('#create').innerHTML).toContain(TEST);
  });

  it('Can access initialData (for hydration)', async () => {
    const TEXT = 'bubblegum';
    const Component = (props) => {
      const res = useLoaderData(props);
      return <h1>{res?.message}</h1>;
    };
    const loaderFunc = async () => {
      return { message: TEXT };
    };
    const initialData = {
      '/flowers': { res: await loaderFunc(), err: undefined }
    };

    render(
      <MemoryRouter initialEntries={['/flowers']} initialData={initialData}>
        <Route path="/flowers" render={Component} loader={loaderFunc} />
      </MemoryRouter>,
      container
    );

    expect(container.innerHTML).toContain(TEXT);
  });

  it('Should only render one (1) component after click', async () => {
    const [setDone, waitForRerender] = createEventGuard();

    const TEST = 'ok';
    const loaderFunc = async () => {
      setDone();
      return { message: TEST };
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
                <NavLink to="/create">Create</NavLink>
              </li>
              <li>
                <NavLink to="/publish">Publish</NavLink>
              </li>
            </ul>
          </nav>
          <Switch>
            <Route exact path="/" component={RootComp} />
            <Route path="/create" component={CreateComp} loader={loaderFunc} />
            <Route path="/create" component={PublishComp} />
          </Switch>
        </div>
      </MemoryRouter>
    );

    render(tree, container);

    expect(container.innerHTML).toContain('ROOT');

    // Click create
    const link = container.querySelector('#createNav');
    link.firstChild.click();

    // Wait until async loader has completed
    await waitForRerender();

    expect(container.querySelector('#create').innerHTML).toContain(TEST);
    expect(container.querySelector('#publish')).toBeNull();
  });

  it('can use a `location` prop instead of `router.location`', async () => {
    const [setSwitch, waitForSwitch] = createEventGuard();
    const [setDone, waitForRerender] = createEventGuard();

    const TEST = 'ok';
    const loaderFunc = async () => {
      await waitForSwitch();
      setDone();
      return { message: TEST };
    };

    render(
      <MemoryRouter initialEntries={['/one']}>
        <NavLink id="link" to="/two">
          Link
        </NavLink>
        <Switch>
          <Route path="/one" render={() => <h1>one</h1>} />
          <Route
            path="/two"
            render={(props: any) => {
              const res = useLoaderData(props);
              return <h1>{res.message}</h1>;
            }}
            loader={loaderFunc}
          />
        </Switch>
      </MemoryRouter>,
      container
    );

    // Check that we are starting in the right place
    expect(container.innerHTML).toContain('one');

    const link = container.querySelector('#link');
    link.click();

    // Complete any pending render and make sure we don't
    // prematurely update view
    rerender();
    expect(container.innerHTML).toContain('one');
    // Now loader can be allowed to complete

    setSwitch();
    // and now wait for the loader to complete
    await waitForRerender();
    // so /two is rendered
    expect(container.innerHTML).toContain(TEST);
  });

  it('Should only render one (1) component after click with subclass of Switch', async () => {
    const [setDone, waitForRerender] = createEventGuard();

    class SubSwitch extends Switch {}

    const TEST = 'ok';
    const loaderFunc = async () => {
      setDone();
      return { message: TEST };
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
                <NavLink to="/create">Create</NavLink>
              </li>
              <li>
                <NavLink to="/publish">Publish</NavLink>
              </li>
            </ul>
          </nav>
          <SubSwitch>
            <Route exact path="/" component={RootComp} />
            <Route path="/create" component={CreateComp} loader={loaderFunc} />
            <Route path="/create" component={PublishComp} />
          </SubSwitch>
        </div>
      </MemoryRouter>
    );

    render(tree, container);

    expect(container.innerHTML).toContain('ROOT');

    // Click create
    const link = container.querySelector('#createNav');
    link.firstChild.click();

    // Wait until async loader has completed
    await waitForRerender();

    expect(container.querySelector('#create').innerHTML).toContain(TEST);
    expect(container.querySelector('#publish')).toBeNull();
  });
});
