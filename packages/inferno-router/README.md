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
), container)
```



