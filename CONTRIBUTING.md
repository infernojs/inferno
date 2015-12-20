Contributing to Inferno.js
==========================

Many thanks for using Inferno and contributing to its development. The following is a quick set of guidelines designed to maximise your contribution's effectiveness.


Got a question or need help?
----------------------------

If you're having trouble getting Inferno to do what you want, there are a couple of places to get help before submitting an issue:

* [Stack Overflow questions tagged infernojs](http://stackoverflow.com/questions/tagged/infernojs)
* [The Inferno Documentation](http://docs.infernojs.org)
* [@InfernoJS on Twitter](http://twitter.com/InfernoJS)

Of course, if you've encountered a bug, then the best course of action is to raise an issue (if no-one else has!).

Reporting security vulnerabilities
----------------------------------

If you think you've found a security vulnerability, please email [ractive-js-security@googlegroups.com](mailto:ractive-js-security@googlegroups.com) with details, and someone from the core team will respond to you.


Raising issues
--------------

Before submitting an issue, please make sure you're using the latest released version - http://cdn.infernojs.org/latest/ractive.js.

If the bug persists, it may have been fixed in the latest development version. You can always get the most recent successful build from http://cdn.infernojs.org/edge/ractive.js.

The best issues contain a reproducible demonstration of the bug in the form of a JSFiddle or similar. [This JSFiddle](http://jsfiddle.net/rich_harris/va6jU/) has a basic setup to get started with - even better, you could create a failing test using [this fiddle](http://jsfiddle.net/rich_harris/UG7Eq/) as a base.


Pull requests
-------------


**Pull requests against the master branch will not be merged!**

All pull requests are welcome. You should create a new branch, based on the [dev branch](https://github.com/infernojs/ractive/tree/dev), and submit the PR against the dev branch.

*Caveat for what follows: If in doubt, submit the request - a PR that needs tweaking is infinitely more valuable than a request that wasn't made because you were worrying about meeting these requirements.*

Before submitting, run `npm run build` (which will concatenate, lint and test the code) to ensure the build passes - but don't include files from outside the `src` and `test` folders in the PR.

There isn't (yet) a formal style guide for Inferno, so please take care to adhere to existing conventions:

* Tabs, not spaces!
* Variables at the top of function declarations
* Semi-colons
* Single-quotes for strings
* Liberal whitespace:

```js
// this...
var foo = function ( bar ) {
	var key;

	for ( key in bar ) {
		doSomething( bar, key ); // no space between function name and bracket for invocations
	}
};

// ...NOT this
var foo = function(bar){
	for(var key in bar){
		doSomething(bar, key);
	}
}
```

Above all, code should be clean and readable, and commented where necessary. If you add a new feature, make sure you add a test to go along with it!


Small print
-----------

There's no contributor license agreement - contributions are made on a common sense basis. Inferno is distributed under the MIT license, which means your contributions will be too.
