import { render } from 'inferno';
import { MemoryRouter, Route, Link } from 'inferno-router';

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
});
