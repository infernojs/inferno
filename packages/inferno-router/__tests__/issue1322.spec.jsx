import { render } from 'inferno';
import { Link, MemoryRouter, NavLink, Route } from 'inferno-router';

describe('Github #1322', () => {
  let container;

  beforeEach(function() {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(function() {
    render(null, container);
    container.innerHTML = '';
    document.body.removeChild(container);
  });

  it('Should _always_ patch children when route is changed', () => {
    const Home = () => (
      <div>
        <h2>Home</h2>
      </div>
    );

    const About = () => (
      <div>
        <h2>About</h2>
      </div>
    );

    const Topic = ({ match }) => (
      <div>
        <h3>{match.params.topicId}</h3>
      </div>
    );

    const Topics = ({ match }) => (
      <div>
        <h2>Topics</h2>
        <ul>
          <li>
            <Link to={`${match.url}/rendering`}>Rendering with React</Link>
          </li>
          <li>
            <Link to={`${match.url}/components`}>Components</Link>
          </li>
          <li>
            <Link to={`${match.url}/props-v-state`}>Props v. State</Link>
          </li>
        </ul>

        <Route path={`${match.url}/:topicId`} component={Topic} />
        <Route exact path={match.url} render={() => <h3>Please select a topic.</h3>} />
      </div>
    );

    const MyWebsite = () => (
      <MemoryRouter>
        <div>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/about">About</Link>
            </li>
            <li>
              <Link to="/topics">Topics</Link>
            </li>
          </ul>

          <hr />

          <Route exact path="/" component={Home} />
          <Route path="/about" component={About} />
          <Route path="/topics" component={Topics} />
        </div>
      </MemoryRouter>
    );

    render(<MyWebsite />, container);

    expect(container.querySelector('h2').innerHTML).toEqual('Home');

    const aboutLink = container.querySelectorAll('a')[1];

    aboutLink.click();

    expect(container.querySelector('h2').innerHTML).toEqual('About');

    const homeLink = container.querySelectorAll('a')[0];

    homeLink.click();

    expect(container.querySelector('h2').innerHTML).toEqual('Home');
  });

  it('Should change activeClass on links without functional component Wrapper, Github #1345', () => {
    function CompList() {
      return <div id="first">FIRST</div>;
    }

    function CreateComp() {
      return <div id="second">SECOND</div>;
    }

    const tree = (
      <MemoryRouter>
        <div>
          <nav class="navbar navbar-expand-lg navbar-light bg-light">
            <div class="container py-2" style="border-bottom: 1px solid rgba(0, 0, 0, 0.13);">
              <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav text-muted">
                  <li class="nav-item mr-2">
                    <NavLink exact to="/" activeClassName="active">
                      Play
                    </NavLink>
                  </li>
                  <li class="nav-item mr-2">
                    <NavLink to="/create" activeClassName="active">
                      Create
                    </NavLink>
                  </li>
                  <li class="nav-item mr-2">
                    <NavLink to="/publish" activeClassName="active">
                      Publish
                    </NavLink>
                  </li>
                </ul>
              </div>
            </div>
          </nav>
          <Route exact path="/" component={CompList} />
          <Route path="/create" component={CreateComp} />
          <Route path="/publish" component={() => <div>Publish</div>} />
        </div>
      </MemoryRouter>
    );

    render(tree, container);

    expect(container.querySelector('#first')).toBeDefined();

    const links = container.querySelectorAll('li');

    expect(links[0].firstChild.classList.contains('active')).toBeTruthy();

    links[1].firstChild.click();

    expect(links[0].firstChild.classList.contains('active')).toBeFalsy();
    expect(links[1].firstChild.classList.contains('active')).toBeTruthy();
    expect(container.querySelector('#first')).toBeNull();
    expect(container.querySelector('#second')).toBeDefined();

    links[0].firstChild.click();
    expect(links[0].firstChild.classList.contains('active')).toBeTruthy();
    expect(links[1].firstChild.classList.contains('active')).toBeFalsy();
    expect(container.querySelector('#first')).toBeDefined();
    expect(container.querySelector('#second')).toBeNull();
  });
});
