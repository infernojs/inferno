import { render } from 'inferno';
import { MemoryRouter, Route, NavLink } from 'inferno-router';
import { createMemoryHistory } from 'history';

describe('A <Route> with loader', () => {
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

  // it('renders on initial', () => {
  //   const TEXT = 'Mrs. Kato';
  //   const loaderFunc = async () => { return { message: "ok" }}

  //   render(
  //     <MemoryRouter initialEntries={['/']}>
  //       <Route path="/" render={() => <h1>{TEXT}</h1>} loader={loaderFunc} />
  //     </MemoryRouter>,
  //     container
  //   );

  //   expect(container.innerHTML).toContain(TEXT);
  // });

  // it('Can access loader result', async () => {
  //   const TEXT = 'bubblegum';
  //   const Component = (props, { router }) => {
  //     const { loaderRes } = router.route;
  //     return <h1>{loaderRes.message}</h1>
  //   }
  //   const loaderFunc = async () => { return { message: TEXT }}
  //   const loaderData = {
  //     res: await loaderFunc(),
  //     err: undefined,
  //   }

  //   render(
  //     <MemoryRouter initialEntries={['/flowers']} loaderData={loaderData}>
  //       <Route path="/flowers" render={Component} loader={loaderFunc} />
  //     </MemoryRouter>,
  //     container
  //   );

  //   expect(container.innerHTML).toContain(TEXT);
  // });

  it('Should render component after after click', () => {
    const TEST = "ok";
    const loaderFunc = async () => { return { message: TEST }}

    function RootComp() {
      return <div id="root">ROOT</div>;
    }

    function CreateComp(props, { router }) {
      const { res, err } = router.route;
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

    // Click create
    const link = container.querySelector('#createNav');
    link.firstChild.click();

    expect(container.querySelector('#create').innerHTML).toContain(TEST);
  });
});
