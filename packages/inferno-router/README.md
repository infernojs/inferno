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

## Usage

Usage of `inferno-router` is similar to that of [react-router](https://github.com/reactjs/react-router). 
Inspiration was taken from `react-router` to provide Inferno with a similar API. 

```js
import Inferno from 'inferno';
import InfernoDOM from 'inferno-dom';
import { Router, Route, Link, browserHistory } from 'inferno-router';

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

InfernoDOM.render((
	<Router history={ browserHistory }>
		<Route path="/" component={ App }>
			<Route path="about" component={ About }/>
			<Route path="users" component={ Users }>
				<Route path="/user/:userId" component={ User }/>
			</Route>
			<Route path="*" component={ NoMatch }/>
		</Route>
	</Router>
), container);
```

## Async routing

In some cases, you may need to asynchronously retrieve or validate some data, which the route is dependent on before the routing begins.
You can easily do this by passing a `function` to the `Route` component via a prop, as shown below:

```js
import Inferno from 'inferno';
import InfernoDOM from 'inferno-dom';
import { Router, Route, Link, browserHistory } from 'inferno-router';

function async(params) {
	return new Promise(function (resolve, reject) {
		// do something ajax like, we can use a setTimeout for this example
		setTimeout(() => {
			resolve('Some data');
		}, 1000);
	});
}

InfernoDOM.render((
	<Router url={ url } history={ browserHistory }>
		<Route path={ path } component={ component } async={ async } />
	</Router>
), container);
```

When the `Router` finds a route it wants to use, it will first the `Route`'s async function that was passed in as a prop. The function will
have the paramater data passed as the only argument. It's expected that a `Promise` is returned from this function, where the route change
happens upon the `Promise` becoming resolved, rejected or caught via an exception.