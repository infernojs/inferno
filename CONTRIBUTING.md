Contributing to Inferno
==========================

Many thanks for using Inferno and contributing to its development. The following is a quick set of guidelines designed to maximise your contribution's effectiveness.

Got a question or need help?
----------------------------

If you're having trouble getting Inferno to do what you want, there are a couple of places to get help before submitting an issue:

* [Stack Overflow questions tagged infernojs](http://stackoverflow.com/questions/tagged/infernojs)

Of course, if you've encountered a bug, then the best course of action is to raise an issue (if no-one else has!).

Reporting security vulnerabilities
----------------------------------

If you think you've found a security vulnerability, please email [Dominic Gannaway](mailto:dg@domgan.com) with details, and he will respond to you if he isn't at work by that time.

Repository Layout
-----------------

The repository structures as a monorepo utilizing [lerna](https://github.com/lerna/lerna) as a management tool of choice. Lerna setup and linking are part of the `postinstall` task so it should be automatically
run after `npm install`. `lerna` executes command based on a topological-sorted order of packages based on their dependencies.

For example, if you want to see the order of packages being processed, you can do:
```
$ lerna exec -- node -e "console.log(require('./package.json').name)"
Lerna v2.0.0-beta.36
inferno-shared
inferno-vnode-flags
inferno
inferno-hyperscript
inferno-create-element
inferno-devtools
inferno-router
inferno-create-class
inferno-compat
inferno-server
inferno-redux
inferno-mobx
inferno-test-utils
```

Source files are written in TypeScript and tests are written in JS/JSX consuming the dist files.

Running tests
-------------
Always include tests for the functionality you want to add into Inferno. This way we can avoid regression in future.

Make sure you have lerna tool installed globally.

```
npm i -g lerna
```

- Clone the repository, and clean it. `lerna clean`
- Install development dependencies `npm i`
- build typescript files `npm run build`
- run tests `npm run test`


Pull requests
-------------


**Pull requests against the master branch will not be merged!**

All pull requests are welcome. You should create a new branch, based on the [dev branch](https://github.com/infernojs/inferno/tree/dev), and submit the PR against the dev branch.

*Caveat for what follows: If in doubt, submit the request - a PR that needs tweaking is infinitely more valuable than a request that wasn't made because you were worrying about meeting these requirements.*

Before submitting, run `npm run build` (which will concatenate, lint and test the code) to ensure the build passes - but don't include files from outside the `src` and `test` folders in the PR.

And make sure the PR haven't been published before!

There isn't (yet) a formal style guide for Inferno, so please take care to adhere to existing conventions:

* Tabs, not spaces!
* Semi-colons
* Single-quotes for strings

Above all, code should be clean and readable, and commented where necessary. If you add a new feature, make sure you add a test to go along with it!


Small print
-----------

There's no contributor license agreement - contributions are made on a common sense basis. Inferno is distributed under the MIT license, which means your contributions will be too.

Debugging Browser
-----------------
Just run `npm run test:browser:debug` Open localhost:9876 and click debug!

Debugging NodeJS
----------------
Its possible to debug inferno tests by running following command `npm run debug` and open chrome web address: chrome://inspect/#devices
However: There is issue with ts-jest; It does additional post processing to compiled files this needs to be disabled to see source files.
Edit following file: `/node_modules/typescript-babel-jest/node_modules/babel-jest/build/index.js` and change hardcoded babel option `retainLines` property to false.

Pro tip: You can filter down number of tests by editing `debug` -task:
`node --inspect-brk ./node_modules/.bin/jest {*edit this*} --runInBand --no-cache --no-watchman`
Change parameter to jest to match only files you want to run.
Happy debugging!


## Credits


### Contributors

Thank you to all the people who have already contributed to inferno!
<a href="graphs/contributors"><img src="https://opencollective.com/inferno/contributors.svg?width=890" /></a>


### Backers

Thank you to all our backers! [[Become a backer](https://opencollective.com/inferno#backer)]

<a href="https://opencollective.com/inferno#backers" target="_blank"><img src="https://opencollective.com/inferno/backers.svg?width=890"></a>


### Sponsors

Thank you to all our sponsors! (please ask your company to also support this open source project by [becoming a sponsor](https://opencollective.com/inferno#sponsor))

<a href="https://opencollective.com/inferno/sponsor/0/website" target="_blank"><img src="https://opencollective.com/inferno/sponsor/0/avatar.svg"></a>
<a href="https://opencollective.com/inferno/sponsor/1/website" target="_blank"><img src="https://opencollective.com/inferno/sponsor/1/avatar.svg"></a>
<a href="https://opencollective.com/inferno/sponsor/2/website" target="_blank"><img src="https://opencollective.com/inferno/sponsor/2/avatar.svg"></a>
<a href="https://opencollective.com/inferno/sponsor/3/website" target="_blank"><img src="https://opencollective.com/inferno/sponsor/3/avatar.svg"></a>
<a href="https://opencollective.com/inferno/sponsor/4/website" target="_blank"><img src="https://opencollective.com/inferno/sponsor/4/avatar.svg"></a>
<a href="https://opencollective.com/inferno/sponsor/5/website" target="_blank"><img src="https://opencollective.com/inferno/sponsor/5/avatar.svg"></a>
<a href="https://opencollective.com/inferno/sponsor/6/website" target="_blank"><img src="https://opencollective.com/inferno/sponsor/6/avatar.svg"></a>
<a href="https://opencollective.com/inferno/sponsor/7/website" target="_blank"><img src="https://opencollective.com/inferno/sponsor/7/avatar.svg"></a>
<a href="https://opencollective.com/inferno/sponsor/8/website" target="_blank"><img src="https://opencollective.com/inferno/sponsor/8/avatar.svg"></a>
<a href="https://opencollective.com/inferno/sponsor/9/website" target="_blank"><img src="https://opencollective.com/inferno/sponsor/9/avatar.svg"></a>
