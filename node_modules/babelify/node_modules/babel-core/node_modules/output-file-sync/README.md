# output-file-sync

[![Build Status](https://travis-ci.org/shinnn/output-file-sync.svg?branch=master)](https://travis-ci.org/shinnn/output-file-sync)
[![Build status](https://ci.appveyor.com/api/projects/status/3qjn5ktuqb6w2cae?svg=true)](https://ci.appveyor.com/project/ShinnosukeWatanabe/output-file-sync)
[![Coverage Status](https://img.shields.io/coveralls/shinnn/output-file-sync.svg)](https://coveralls.io/r/shinnn/output-file-sync)
[![Dependency Status](https://david-dm.org/shinnn/output-file-sync.svg)](https://david-dm.org/shinnn/output-file-sync)
[![devDependency Status](https://david-dm.org/shinnn/output-file-sync/dev-status.svg)](https://david-dm.org/shinnn/output-file-sync#info=devDependencies)

Synchronously write a file and create its ancestor directories if needed

```javascript
var fs = require('fs');
var outputFileSync = require('output-file-sync');

outputFileSync('foo/bar/baz.txt', 'Hi!');
fs.readFileSync('foo/bar/baz.txt').toString(); //=> 'Hi!'
```

## Difference from fs.outputFileSync

This module is very similar to [fs-extra](https://github.com/jprichardson/node-fs-extra)'s [`fs.outputFileSync`](https://github.com/jprichardson/node-fs-extra#outputfilefile-data-callback) but they are different in the following points:

1. *output-file-sync* returns the path of the directory created first. [See the API document for more details.](#outputfilesyncpath-data--options)
2. *output-file-sync* accepts [mkdirp] options.
   ```javascript
   var fs = require('fs');
   var outputFileSync = require('output-file-sync');
   outputFileSync('foo/bar', 'content', {mode: 33260});

   fs.statSync('foo').mode; //=> 33260
   ```

## Installation

[![NPM version](https://badge.fury.io/js/output-file-sync.svg)](https://www.npmjs.org/package/output-file-sync)

[Use npm.](https://www.npmjs.org/doc/cli/npm-install.html)

```sh
npm install output-file-sync
```

## API

```javascript
var outputFileSync = require('output-file-sync');
```

### outputFileSync(*path*, *data* [, *options*])

*path*: `String`  
*data*: `String` or [`Buffer`](http://nodejs.org/api/buffer.html#buffer_class_buffer)  
*options*: `Object` or `String` (options for [fs.writeFile] and [mkdirp])  
Return: `String` if it creates more than one directories, otherwise `null`

It writes the data to a file synchronously. If ancestor directories of the file don't exist, it creates the directories before writing the file.

```javascript
var fs = require('fs');
var outputFileSync = require('output-file-sync');

// When the directory `foo/bar` exists
outputFileSync('foo/bar/baz/qux.txt', 'Hello', 'utf-8');

fs.statSync('foo/bar/baz').isDirectory(); //=> true
fs.statSync('foo/bar/baz/qux.txt').isFile(); //=> true
```

It returns the directory path just like [mkdirp.sync](https://github.com/substack/node-mkdirp#mkdirpsyncdir-opts):

> Returns the first directory that had to be created, if any.

```javascript
var dir = outputFileSync('foo/bar/baz.txt', 'Hello');
dir; //=> Same value as `path.resolve('foo')`
```

#### options

All options for [fs.writeFile] and [mkdirp] are available.

Additionally, you can use [`fileMode`](#optionsfilemode) option and [`dirMode`](#optionsdirmode) option to set different permission between the file and directories.

##### options.fileMode

Set modes of a file, overriding `mode` option.

##### options.dirMode

Set modes of a directories, overriding `mode` option.

```javascript
outputFileSync('dir/file', 'content', {dirMode: '0745', fileMode: '0644'});
fs.statSync('dir').mode.toString(8); //=> '40745'
fs.statSync('dir/file').mode.toString(8); //=> '100644'
```

## Related project

* [output-file](https://github.com/shinnn/output-file) (asynchronous version)

## License

Copyright (c) 2014 [Shinnosuke Watanabe](https://github.com/shinnn)

Licensed under [the MIT License](./LICENSE).

[fs.writeFile]: http://nodejs.org/api/fs.html#fs_fs_writefile_filename_data_options_callback
[mkdirp]: https://github.com/substack/node-mkdirp
