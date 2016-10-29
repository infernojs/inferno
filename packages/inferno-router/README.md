# inferno-router

Inferno Router is a routing library for [Inferno](https://github.com/trueadm/inferno).

Inferno Router keeps your UI in sync with the URL. It has a simple API with powerful dynamic route matching.

## Install

```
npm install inferno-router
```

## Contents

* Router
* Route
* Link
* browserHistory

## Usage (client-side)

Usage of `inferno-router` is similar to that of [react-router](https://github.com/reactjs/react-router). 
Inspiration was taken from `react-router` to provide Inferno with a similar API. 

```js
import Inferno from 'inferno';
import { Router, Route, Link } from 'inferno-router';
import createBrowserHistory from 'history/createBrowserHistory';

const browserHistory = createBrowserHistory();

function App({ children }) {
	// ...
}

function NoMatch({ children }) {
	// ...
}

function About({ children }) {
	// ...
}

function About({ User, params }) {
	// ...
}

function renderDOM(location) {
    Inferno.render((
        <Router history={ browserHistory }>
            <Route component={ App }>
                <Route path="about" component={ About }/>
                <Route path="users" component={ Users }>
                    <Route path="/user/:userId" component={ User }/>
                </Route>
                <Route path="*" component={ NoMatch }/>
            </Route>
        </Router>
    ), container);
}

// Render HTML on the browser
renderDOM(history.location)
browserHistory.listen(renderDOM)
```

## Async routing

In some cases, you may need to asynchronously retrieve or validate some data, which the route is dependent on before the routing begins.
You can easily do this by passing a `function` to the `Route` component via a prop, as shown below:

```js
import Inferno from 'inferno';
import { Router, Route, Link } from 'inferno-router';
import createBrowserHistory from 'history/createBrowserHistory';

function Home({ params }) {
	// ...
}

function expressRoute(req, res) {
    Inferno.render((
        <Router url={ req.originalUrl } history={ createBrowserHistory() }>
            <Route path={ path } component={ Home } async={ async } />
        </Router>
    ), container);
}
```

When the `Router` finds a route it wants to use, it will first the `Route`'s async function that was passed in as a prop. The function will
have the paramater data passed as the only argument. It's expected that a `Promise` is returned from this function, where the route change
happens upon the `Promise` becoming resolved, rejected or caught via an exception.

## Server-side rendering (express)

```js
import Inferno from 'inferno';
import { renderToString } from 'inferno-server'
import { Router, Route } from 'inferno-router';
import express from 'express';

function App({ children }) {
	return (
	<html>
        <head>
          <title>My Application</title>
        </head>
        <body>
            <div>{children}</div>
        </body>
    </html>
    );
}

function Home() {
	return <p>Home sweet home</p>;
}

const app = express();

app.use((req, res) => {

    function renderComponent() {
        return <Router url={ req.originalUrl }>
            <Route component={ App }>
                <Route path="/" component={ Home }/>
            </Route>
        </Router>;
    }
    res.send('<!DOCTYPE html>\n' + renderToString( renderComponent() ));
});
```

## Server-side rendering (koa v2)

```js
import Inferno from 'inferno';
import { renderToString } from 'inferno-server'
import { Router, Route } from 'inferno-router';
import Koa from 'koa';

function App({ children }) {
	return (
	<html>
        <head>
          <title>My Application</title>
        </head>
        <body>
            <div>{children}</div>
        </body>
    </html>
    );
}

function Home() {
	return <p>Home sweet home</p>;
}

const app = new Koa()

app.use(async(ctx, next) => { 

    function renderComponent() {
        return <Router url={ ctx.originalUrl }>
            <Route component={ App }>
                <Route path="/" component={ Home }/>
            </Route>
        </Router>;
    }
    
    ctx.body = '<!DOCTYPE html>\n' + renderToString( renderComponent() );
    await next();
});
```

_Note: Async routing is currently not supported on the server side._
