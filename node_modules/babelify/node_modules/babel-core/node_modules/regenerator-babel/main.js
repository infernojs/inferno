/**
 * Copyright (c) 2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * https://raw.github.com/facebook/regenerator/master/LICENSE file. An
 * additional grant of patent rights can be found in the PATENTS file in
 * the same directory.
 */

var assert = require("assert");
var path = require("path");
var fs = require("fs");
var through = require("through");
var transform = require("./lib/visit").transform;
var utils = require("./lib/util");
var types = require("ast-types");
var genOrAsyncFunExp = /\bfunction\s*\*|\basync\b/;
var blockBindingExp = /\b(let|const)\s+/;

function exports(file, options) {
  var data = [];
  return through(write, end);

  function write(buf) {
    data.push(buf);
  }

  function end() {
    this.queue(compile(data.join(""), options).code);
    this.queue(null);
  }
}

// To get a writable stream for use as a browserify transform, call
// require("regenerator")().
module.exports = exports;

// To include the runtime globally in the current node process, call
// require("regenerator").runtime().
function runtime() {
  require("./runtime");
}
exports.runtime = runtime;
runtime.path = path.join(__dirname, "runtime.js");

// To modify an AST directly, call require("regenerator").transform(ast).
exports.transform = transform;
