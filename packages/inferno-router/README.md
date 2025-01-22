# inferno-router

Inferno Router is a routing library for [Inferno](https://github.com/infernojs/inferno). It is a port of [react-router 4](https://v5.reactrouter.com/web/guides/quick-start) (later updated to v5).

## Install

```
npm install inferno-router
```

## Features

Same as react-router v4 (later updated to v5), except react-native support.

See official react-router [documentation](https://v5.reactrouter.com/web/guides/philosophy)

Features added from react-router@5:

- NavLink supports passing function to className-attibute
- NavLink supports passing function to style-attibute

Features added from react-router@6:

- Async data fetching before navigation using [`loader`-attribute](https://reactrouter.com/en/main/route/loader). See [demo](https://github.com/infernojs/inferno/tree/master/demo/inferno-router-demo).

The following features aren't supported yet:

- download progress support
- form submission
- redirect support
- not exposing response headers, type or status code to render method

## Client side usage

```js
import { render } from 'inferno';
import {
  BrowserRouter,
  Route,
  Link,
  useLoaderData,
  useLoaderError,
} from 'inferno-router';

const Home = () => (
  <div>
    <h2>Home</h2>
  </div>
);

const About = (props) => {
  const data = useLoaderData(props);
  const err = useLoaderError(props);

  return (
    <div>
      <h2>About</h2>
      <p>{data?.body || err?.message}</p>
    </div>
  );
};

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
    <Route
      exact
      path={match.url}
      render={() => <h3>Please select a topic.</h3>}
    />
  </div>
);

const MyWebsite = () => (
  <BrowserRouter>
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
      <Route
        path="/about"
        component={About}
        loader={() => fetch(new URL('/api/about', BACKEND_HOST))}
      />
      <Route path="/topics" component={Topics} />
    </div>
  </BrowserRouter>
);

// Render HTML on the browser
render(<MyWebsite />, document.getElementById('root'));
```

## Sever side usage with Koa

First, let's create our component to render boilerplate HTML, header, body etc.

```jsx
import Koa from 'koa';
import { renderToString } from 'inferno-server';
import { Switch, StaticRouter, Route } from 'inferno-router';

const app = new Koa();

function Index({ children }) {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <title>Inferno</title>
      </head>
      <body>
        <div id="app">{children}</div>
      </body>
    </html>
  );
}

// Example routes
function Home() {
  return <div>Welcome Home!</div>;
}

function Foo() {
  return <span>Bar</span>;
}

function NotFound() {
  return <h2>404</h2>;
}

const routes = (
  <Switch>
    <Route exact path="/" component={Home} />
    <Route exact path="/demo" component={Foo} />
    <Route path="*" component={NotFound} />
  </Switch>
);

// Server-side render
async function render(ctx, next) {
  const context = {};
  const content = renderToString(
    <StaticRouter location={ctx.url} context={context}>
      <Index hostname={ctx.hostname}>{routes}</Index>
    </StaticRouter>,
  );

  // This will contain the URL to redirect to if <Redirect> was used
  if (context.url) {
    return ctx.redirect(context.url);
  }

  ctx.type = 'text/html';
  ctx.body = '<!DOCTYPE html>\n' + content;
  await next();
}

// Add infero render as middleware
app.use(render);

app.listen(8080, function () {
  console.log('Listening on port ' + 8080);
});
```

## Differences with React-Router v4

- No "official" react-native support.
- There's no `inferno-router-dom`, all functionality is inside `inferno-router`
