# Manual Testing Fixtures

Thanks for React!
Idea for this test has been adopted from React/fixtures/packaging

This folder exists for **Inferno contributors** only.

These fixtures verify that the built Inferno distributions are usable in different environments.
  TODO:
  fix brunch, rjs, system-builder, webpack, webpack-alias
  add rollup
  all of them should test minified / dev versions

**They are not running automatically.** (At least not yet, feel free to contribute to automate them.)

Run them when you make changes to how we package React and ReactDOM.

## How to Run

First, build React and the fixtures:

```
cd inferno
npm run build

cd fixtures/packaging
node build-all.js
```

Then run a local server at the root of the repo, e.g.

```
npm i -g pushstate-server
cd ../..
pushstate-server .
```

(Too complicated? Send a PR to simplify this :-).

Then open the corresponding URLs, for example:

```
open http://localhost:9000/fixtures/globals.html
open http://localhost:9000/fixtures/requirejs.html
open http://localhost:9000/fixtures/systemjs.html
open http://localhost:9000/fixtures/browserify/index.html
open http://localhost:9000/fixtures/brunch/index.html
open http://localhost:9000/fixtures/rjs/index.html
open http://localhost:9000/fixtures/systemjs-builder/index.html
open http://localhost:9000/fixtures/webpack/index.html
open http://localhost:9000/fixtures/webpack-alias/index.html
```

You should see two things:

* "Develpment and Production" is rendered.
* There is single error in console one for stating production build is used and one with normal error message
