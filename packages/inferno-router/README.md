# inferno-router

<p align="center"><img src="https://www.infernojs.org/assets/infernojs-logo.png"></p>
<p>&nbsp;</p>

Inferno Router is a routing library for [Inferno](https://github.com/infernojs/inferno). It is a port of [react-router 4](https://reacttraining.com/react-router/).  

## Install

```
npm install inferno-router
```

## Features

Same as react-router v4, except react-native support which we have tested at this point.

See official react-router [documentation](https://reacttraining.com/react-router/native/guides/philosophy)


## Usage (client-side)

```js
import Inferno from 'inferno';
import { BrowserRouter, Route, Link } from 'inferno-router'

const Home = () => (
  <div>
    <h2>Home</h2>
  </div>
)

const About = () => (
  <div>
    <h2>About</h2>
  </div>
)

const Topic = ({ match }) => (
  <div>
    <h3>{match.params.topicId}</h3>
  </div>
)

const Topics = ({ match }) => (
  <div>
    <h2>Topics</h2>
    <ul>
      <li>
        <Link to={`${match.url}/rendering`}>
          Rendering with React
        </Link>
      </li>
      <li>
        <Link to={`${match.url}/components`}>
          Components
        </Link>
      </li>
      <li>
        <Link to={`${match.url}/props-v-state`}>
          Props v. State
        </Link>
      </li>
    </ul>

    <Route path={`${match.url}/:topicId`} component={Topic}/>
    <Route exact path={match.url} render={() => (
      <h3>Please select a topic.</h3>
    )}/>
  </div>
)

const MyWebsite = () => (
  <BrowserRouter>
    <div>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/about">About</Link></li>
        <li><Link to="/topics">Topics</Link></li>
      </ul>

      <hr/>

      <Route exact path="/" component={Home}/>
      <Route path="/about" component={About}/>
      <Route path="/topics" component={Topics}/>
    </div>
  </BrowserRouter>
)

// Render HTML on the browser
Inferno.render(MyWebsite, document.getElementById('root'));
```


## Usage (server) with express

First, let's create our component to render boilerplate HTML, header, body etc.

```js
// Routes will be rendered into children
export default function Html({ children }) {
  return (
    <html>
      <head>
        <title>My Application</title>
      </head>
      <body>
        <div id="root">{children}</div>
      </body>
  </html>
  );
}
```

```js
import Inferno from 'inferno';
import { renderToString } from 'inferno-server'
import { StaticRouter } from 'inferno-router';
import express from 'express';
import Html from './Html';

const app = express();

app.use((req, res) => {
  const renderProps = match(routes, req.originalUrl);
  
  if (renderProps.redirect) {
    return res.redirect(renderProps.redirect)
  }
    
  const context = {}
  const content = renderToString(
    <StaticRouter location={ctx.url} context={context}>
      <Html/>
    </StaticRouter>
  )

  res.send('<!DOCTYPE html>\n' + renderToString(content));
});
```

## Usage (server) with koa v2

```js
import Inferno from 'inferno';
import { renderToString } from 'inferno-server'
import { StaticRouter } from 'inferno-router';
import Koa from 'koa';
import Html from './Html';

const app = new Koa()

app.use(async(ctx, next) => { 

  const context = {}
  const content = renderToString(
    <StaticRouter location={ctx.url} context={context}>
      <Html/>
    </StaticRouter>
  )
    
  // This will contain the URL to redirect to if <Redirect> was used
  if (context.url) {
    return ctx.redirect(context.url)
  }
  
  ctx.body = '<!DOCTYPE html>\n' + content;
  await next();
});
```


## Differences with React-Router v4

* No "official" react-native support.
* There's no `inferno-router-dom`, all functionality is inside `inferno-router`
