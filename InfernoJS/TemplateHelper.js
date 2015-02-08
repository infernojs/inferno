var Compiler = require('./Compiler.js');

/*

  List of supported helpers

  ==================
  if statements
  ==================

  $.if(isFalse => {expression}, ...)
  $.if(isTrue => {expression}, ...)
  $.if(isNull => {expression}, ...)
  $.if(isZero => {expression}, ...)
  $.if(isEmpty => {expression}, ...)
  $.if(isArray => {expression}, ...)
  $.if(isNumber => {expression}, ...)
  $.if(isString => {expression}, ...)

  ==================
  loop statements
  ==================

  $.for(in => array, (key, array) => [...])
  $.for(increment => [startNumber, endNumber, amount], (iterator) => [...])
  $.for(each => items, (item, index, array) => [...])
  $.do(while => {expression}, ...)
  $.do(until => {expression}, ...)

  ==================
  text filters/formatters
  ==================

  $.text(escape => {expression}, [hinting...]) //escapes all html
  $.text(html => {expression}, [hinting...]) //allows safe html
  $.text(none => {expression}, [hinting...]) //no stripping

*/

class TemplateHelper {

  constructor(comp) {
    this._comp = comp;
  }

  render(node) {
    var i = 0,
        j = 0,
        items = [],
        children = [],
        subChildren = [],
        template = {},
        bounds = [];

  	if(node.$type === "if") {
  		if(node.$expression() === node.$condition) {
  			return node.$toRender;
  		} else {
  			return null;
  		}
  	} else if(node.$type === "text") {
      //check for formatters
  		return node.$toRender();
    } else if(node.$type === "forEach") {
      items = node.$items();
      children = [];
      for(i = 0; i < items.length; i++) {
        subChildren = [];
        template = node.$toRender.call(this._comp, items[i], i, items);
        for(j = 0; j < template.length; j++) {
          Compiler.call(this, template[j], subChildren, 0);
        }
        children.push(subChildren);
      }
      return children;
    } else if(node.$type === "for") {
      bounds = node.$bounds();
      children = [];
      for(i = bounds[0]; i < bounds[1]; i = i + bounds[2]) {
        subChildren = [];
        template = node.$toRender.call(this._comp, i);
        for(j = 0; j < template.length; j++) {
          Compiler.call(this, template[j], subChildren, 0);
        }
        children.push(subChildren);
      }
      return children;
    }
  	return null;
  }

  for(values, children) {
    var condition = this._getParamNames(arguments[0])[0];

    switch(condition) {
      case "each":
        return {
          $type: "for",
          condition: "each",
          items: values,
          children: children
        }
      case "increment":
        return {
          $type: "for",
          condition: "increment",
          bounds: values,
          children: children
        }
    }
  }

  text(children) {
    return {
      $type: "text",
      condition: this._getParamNames(arguments[0])[0],
      children: children
    }
  }

  if(expression) {
    // var children = [],
    //     i = 0;
    //
    // if(arguments.length > 1) {
    //   for(i = 1; i < arguments.length; i++) {
    //     children.push(arguments[i]);
    //   }
    // }

    return {
      $type: "if",
      condition: this._getParamNames(arguments[0])[0],
      expression: expression,
      children: arguments[1]
    }
  }

  _getParamNames(fn) {
      var funStr = fn.toString();
      return funStr.slice(funStr.indexOf('(') + 1, funStr.indexOf(')')).match(/([^\s,]+)/g);
  }


};

module.exports = TemplateHelper;
