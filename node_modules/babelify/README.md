# babelify

[Babel](https://github.com/babel/babel) [browserify](https://github.com/substack/node-browserify) plugin

## Installation

    $ npm install --save-dev babelify

## Usage

### CLI

    $ browserify script.js -t babelify --outfile bundle.js

### Node

```javascript
var fs = require("fs");
var browserify = require("browserify");
var babelify = require("babelify");
browserify({ debug: true })
  .transform(babelify)
  .require("./script.js", { entry: true })
  .bundle()
  .on("error", function (err) { console.log("Error : " + err.message); })
  .pipe(fs.createWriteStream("bundle.js"));
```

#### [Options](https://babeljs.io/docs/usage/options)

```javascript
browserify().transform(babelify.configure({
  blacklist: ["generators"]
}))
```

```sh
$ browserify -d -e script.js -t [ babelify --blacklist generators ]
```

#### Enable Experimental Transforms

By default 6to5's [experimental transforms](http://6to5.org/docs/usage/transformers/#es7-experimental-)
are disabled. You can turn them on by passing `experimental` as a configuration option.

```javascript
browserify().transform(babelify.configure({
  experimental: true
}))
```

```sh
$ browserify -d -e script.js -t [ babelify --experimental ]
```

#### Customising extensions

By default all files with the extensions `.js`, `.es`, '`.es6` and `.jsx` are compiled.
You can change this by passing an array of extensions.

**NOTE:** This will override the default ones so if you want to use any of them
you have to add them back.

```javascript
browserify().transform(babelify.configure({
  extensions: [".6to5"]
}))
```

```sh
$ browserify -d -e script.js -t [ babelify --extensions .6to5 ]
```

#### Relative source maps

Browserify passes an absolute path so there's no way to determine what folder
it's relative to. You can pass a relative path that'll be removed from the
absolute path with the `sourceMapRelative` option.

```javascript
browserify().transform(babelify.configure({
  sourceMapRelative: "/Users/sebastian/Projects/my-cool-website/assets"
}))
```

```sh
$ browserify -d -e script.js -t [ babelify --sourceMapRelative . ]
```

#### Additional options

```javascript
browserify().transform(babelify.configure({
  // Optional ignore regex - if any filenames **do** match this regex then they
  // aren't compiled
  ignore: /regex/,

  // Optional only regex - if any filenames **don't** match this regex then they
  // aren't compiled
  only: /my_es6_folder/
}))
```

```sh
$ browserify -d -e script.js -t [ babelify --ignore regex --only my_es6_folder ]
```

#### ES6 Polyfill

As a convenience, the babelify polyfill is exposed in babelify. If you've got
a browserify-only package this may alleviate the necessity to have
*both* babel & babelify installed.

```javascript
// In browser code
require("babelify/polyfill");
```
