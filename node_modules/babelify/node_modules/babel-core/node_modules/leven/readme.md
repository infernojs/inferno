# leven [![Build Status](https://travis-ci.org/sindresorhus/leven.svg?branch=master)](https://travis-ci.org/sindresorhus/leven)

> Measure the difference between two strings  
> The fastest JS implementation of the [Levenshtein distance](http://en.wikipedia.org/wiki/Levenshtein_distance) algorithm


## Install

```sh
$ npm install --save leven
```


## Usage

```js
var leven = require('leven');

leven('cat', 'cow');
//=> 2
```


## Benchmark

```sh
$ npm run bench
```
```
         230,113 op/s » leven
         201,026 op/s » levenshtein-edit-distance
          40,454 op/s » fast-levenshtein
          28,664 op/s » levenshtein-component
          22,952 op/s » ld
          16,882 op/s » levdist
          11,180 op/s » levenshtein
           9,624 op/s » natural
```


## CLI

```sh
$ npm install --global leven
```

```sh
$ leven --help

  Example
    leven cat cow
    2
```


## License

MIT © [Sindre Sorhus](http://sindresorhus.com)
