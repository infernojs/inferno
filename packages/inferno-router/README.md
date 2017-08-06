# inferno-router

<p>&nbsp;</p>
<p align="center"><img src="http://infernojs.org/img/inferno.png" width="150px"></p>
<p>&nbsp;</p>

Inferno Router is a routing library for [Inferno](https://github.com/infernojs/inferno).

Usage of `inferno-router` is similar to that of [react-router](https://github.com/ReactTraining/react-router/blob/master/docs/API.md).  

## Install

```
npm install inferno-router
```

## Features

* Router / RouterContext
* Route / IndexRoute
* Link / IndexLink
* Redirect / IndexRedirect
* browserHistory / memoryHistory
* onEnter / onLeave hooks
* onUpdate event support for Router
* params / querystring parsing

## Usage (client-side)

```js
import Inferno from 'inferno';
import { Router, Route, IndexRoute } from 'inferno-router';
import createBrowserHistory from 'history/createBrowserHistory';

const browserHistory = createBrowserHistory();

function App({ children }) {
  // ...
}

function NoMatch({ children }) {
  // ...
}

function Home({ children }) {
  // ...
}

// `children` in this case will be the `User` component
function Users({ children, params }) {
  return <div>{ children }</div>
}

function User({ params }) {
  return <div>{ JSON.stringify(params) }</div>
}

const routes = (
  <Router history={ browserHistory }>
    <Route component={ App }>
      <IndexRoute component={ Home }/>
      <Route path="users" component={ Users }>
        <Route path="/user/:username" component={ User }/>
      </Route>
      <Route path="*" component={ NoMatch }/>
    </Route>
  </Router>
);

// Render HTML on the browser
Inferno.render(routes, document.getElementById('root'));
```

## Server-side rendering (express)

```js
import Inferno from 'inferno';
import { renderToString } from 'inferno-server'
import { RouterContext, match } from 'inferno-router';
import express from 'express';
import routes from './routes';

function Html({ children }) {
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

const app = express();

app.use((req, res) => {
  const renderProps = match(routes, req.originalUrl);
  
  if (renderProps.redirect) {
    return res.redirect(renderProps.redirect)
  }
  
  const content = (<Html><RouterContext {...renderProps}/></Html>);

  res.send('<!DOCTYPE html>\n' + renderToString(content));
});
```

## Server-side rendering (koa v2)

```js
import Inferno from 'inferno';
import { renderToString } from 'inferno-server'
import { RouterContext, match } from 'inferno-router';
import Koa from 'koa';
import routes from './routes';

function Html({ children }) {
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

const app = new Koa()

app.use(async(ctx, next) => { 
  const renderProps = match(routes, ctx.url);
  
  if (renderProps.redirect) {
    return ctx.redirect(renderProps.redirect)
  }
  
  const content = (<Html><RouterContext {...renderProps}/></Html>);
  
  ctx.body = '<!DOCTYPE html>\n' + renderToString(content);
  await next();
});
```

## onEnter / onLeave hooks

In some cases, you may need to execute some logic before or after routing.
You can easily do this by passing a `function` to the `Route` component via a prop, as shown below:

```js
import Inferno from 'inferno';
import { Router, IndexRoute } from 'inferno-router';
import { createBrowserHistory } from 'history';

function Home({ params }) {
  // ...
}

function authorizedOnly({ props, router }) {
  if (!props.loggedIn) {
    router.push('/login');
  }
}

function sayGoodBye({ props, router }) {
  alert('Good bye!')
}

Inferno.render((
  <Router history={ createBrowserHistory() }>
    <IndexRoute component={ Home } onEnter={ authorizedOnly } onLeave={ sayGoodBye } />
  </Router>
), container);
```

## onUpdate event
In some cases you may need to execute some code on route updates. If so you can do this: 

```js
import Inferno from 'inferno';
import { Router, IndexRoute } from 'inferno-router';
import { createBrowserHistory } from 'history';

function onRouteUpdate() {
  // ...
}

function Home({ params }) {
  // ...
}

Inferno.render((
  <Router onUpdate={onRouteUpdate} history={ createBrowserHistory() }>
    <IndexRoute component={ Home } />
  </Router>
), container);
```

## Redirect

```js
<Router history={ createBrowserHistory() }>
  <Redirect from="/oldpath" to="/newpath"/>
  <Route path="/newpath" component={ MyComponent }/>
</Router>
```

## Async Data Fetching
To mimic standard browser behavior you want to fetch data before performing a transition. To
achieve this you can use the `asyncBefore` hooks:

```js
        <Router history={browserHistory} asyncBefore={ /* user provided handler that resolves and calls route specific asyncBefore hooks */ }>
          <Route path="/" asyncBefore={ /* route specific asyncBefore handler */ } component={ ... } />
        </Router>
```

You will need a data store such as Mobx or Redux to propagate data to your component.

### Pages and Routing

```js
  import Component from "inferno-component";

  class PageOne extends Component {
    static fetchData(params) {
      return myDataFetcher() // Returns a promise
    }

    render() {
      return <div>Page One <span>{dataStore.pageOne}</span></div>;
    }
  }

  class PageTwo extends Component {
    static fetchData(params) {
      return myDataFetcher() // Returns a promise
      });
    }

    render() {
      return (
        <div>Page Two <span>{dataStore.pageTwo}</span>{this.props.children}</div>
      );
    }
  }

  import { render } from "inferno";
  import { Route, Router, match, doAllAsyncBefore } from "inferno-router";

  const routes = (
    <Router history={...} asyncBefore={
      url => {
        return doAllAsyncBefore(match(routes, url));
      }
    }>
      <Route path="/" asyncBefore={PageOne.fetchData} component={PageOne} />
      <Route path="/test" asyncBefore={PageTwo.fetchData} component={PageTwo} />
    </Router>
  );
```

### Render in Browser Without SSR

```js
  import { render } from "inferno";
  import { match, doAllAsyncBefore } from "inferno-router";

  // Need to prime the route props with data on first render
  const renderProps = match(routes, "/");
  doAllAsyncBefore(renderProps).then(() => {
    // Then render
    render(routes, document.getElementById('app'));
  });
```

### Render in Browser WITH SSR
```js
  // Rehydrate state passed from server and then render...
  if (typeof window !== 'undefined') {
    render(routes, document.getElementById('app'));
  }
```

### Server Side Rendering (SSR)
This code will be executed in your server side controller and imports routes
from app bundle. You need to pass the hydrated state to the client and rehydrate
it before rendering.

```js
  import { RouterContext, match, doAllAsyncBefore } from "inferno-router";
  import InfernoServer from "inferno-server";
  import createElement from "inferno-create-element";

  const renderProps = match(routes, "/");
  doAllAsyncBefore(renderProps).then(() => {
    const html = InfernoServer.renderToString(
      createElement(RouterContext, renderProps)
    );
    
    // Pass hydrated state (from Mobx or Redux) and rendered html to template
  });
```

### Lifercycle of Route Transition

1. onLeave
2. asyncBefore (Router)
3. -> asyncBefore (Route)
4. render route
5. onEnter

### Adding a Progress Indicator
To add a progress indicator you would initiate and terminate it in Router.props.asyncBefore hook.
Actual progress would be updated in the route specific asyncBefore handler.

## Notes

* `<IndexRoute>` is the same as `<Route path="/">"`
* `<IndexLink>` is the same as `<Link to="/">`

