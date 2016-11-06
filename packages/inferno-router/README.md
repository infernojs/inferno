# inferno-router

<p>&nbsp;</p>
<p align="center"><img src="http://infernojs.org/img/inferno.png" width="150px"></p>
<p>&nbsp;</p>

Inferno Router is a routing library for [Inferno](https://github.com/trueadm/inferno).

Usage of `inferno-router` is similar to that of [react-router](https://github.com/reactjs/react-router).  

## Install

```
npm install inferno-router
```

## Contents

* Router
* Route / IndexRoute
* Link / IndexLink
* browserHistory / memoryHistory
* onEnter / onLeave hooks

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
	return <div>{ params.username }</div>
}

function renderDOM(location) {
    Inferno.render((
        <Router history={ browserHistory }>
            <Route component={ App }>
                <IndexRoute component={ Home }/>
                <Route path="users" component={ Users }>
                    <Route path="/user/:username" component={ User }/>
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

## onEnter / onLeave hooks

In some cases, you may need to execute some logic before or after routing.
You can easily do this by passing a `function` to the `Route` component via a prop, as shown below:

```js
import Inferno from 'inferno';
import { Router, IndexRoute } from 'inferno-router';
import createBrowserHistory from 'history/createBrowserHistory';

function Home({ params }) {
	// ...
}

function authorizedOnly(props, router) {
    if (!props.loggedIn) {
      router.push('/login');
    }
}

function sayGoodBye(props, router) {
    alert('Good bye!')
}

function expressRoute(req, res) {
    Inferno.render((
        <Router url={ req.originalUrl } history={ createBrowserHistory() }>
            <IndexRoute component={ Home } onEnter={ authorizedOnly } onLeave={ sayGoodBye } />
        </Router>
    ), container);
}
```

## Server-side rendering (express)

```js
import Inferno from 'inferno';
import { renderToString } from 'inferno-server'
import { Router, IndexRoute } from 'inferno-router';
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
                <IndexRoute component={ Home }/>
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

## Notes

* `IndexRoute` is the same as `Route` with `path` set to `/`
* `IndexLink` is the same as `Link` with `to` set to `/`
