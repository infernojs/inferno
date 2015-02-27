var Component = require('./Component.js');
var Compiler = require('./Compiler.js');

var Inferno = {};

Inferno.Component = Component;

//takes some html and returns Bobril compatible vdom
Inferno.compile = function(html) {
  var arrayDsl = Compiler.compileHtml(html);
  var vDom = [];
  Compiler.createVirtualDom(arrayDsl, vDom);
  return vDom;
};

module.exports = Inferno;
