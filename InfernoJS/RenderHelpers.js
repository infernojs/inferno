/*

  List of supported helpers

  ==================
  if statements
  ==================

  $.if({expression}, true, false)

  ==================
  loop statements
  ==================

  $.forEach(Array, (item, key, array) => [...])
  $.times(Number, (iterator) => [...])

*/

class RenderHelpers {

  constructor(comp) {
    this._comp = comp;
  }

  forEach(values, output) {
    var length = values.length,
        results = [];
    for(var i = 0; i < length; i++) {
      results.push(output.call(this._comp, values[i], i, values));
    }
    return results;
  }

  if(expression, truthy, falsey) {
    if(expression === true) {
      return truthy;
    } else {
      return falsey;
    }
  }

};

module.exports = RenderHelpers;
