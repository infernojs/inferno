/*

  VDML = Virtual Dom Markup Language

*/

var Compiler = require('./Compiler.js');

function vdml(html) {
  var arrayDsl = Compiler.compileHtml(html);
  var vDom = [];
  Compiler.createVirtualDom(arrayDsl, vDom);
  return vDom;
}

vdml.helpers = {
  forEach: function(values, output) {
    var length = values.length,
        results = [];
    for(var i = 0; i < length; i++) {
      results.push(output.call(this._comp, values[i], i, values));
    }
    return results;
  },

  "if": function(expression, truthy, falsey) {
    if(expression === true) {
      return truthy;
    } else {
      return falsey;
    }
  }
}

module.exports = vdml;
