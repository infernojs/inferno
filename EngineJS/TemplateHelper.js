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
  data binding + filters/formatters
  ==================

  $.bind(text => {expression) //strips all tags
  $.bind(html => {expression) //strips harmful tags
  $.bind(none => {expression) //no stripping

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
        template = {};

  	if(node.$type === "if") {
  		if(node.$expression() === node.$condition) {
  			return node.$toRender;
  		} else {
  			return null;
  		}
  	} else if(node.$type === "bind") {
  		return node.$toRender();
    } else if(node.$type === "forEach") {
      items = node.$items();
      children = [];
      for(i = 0; i < items.length; i++) {
        subChildren = [];
        template = node.$toRender.call(this._comp, items[i], i, items);
        for(j = 0; j < template.length; j++) {
          Compiler.call(this, template[j], subChildren);
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
          type: "for",
          condition: "each",
          items: values,
          children: children
        }
    }
  }

  bind(children) {
    return {
      type: "bind",
      condition: this._getParamNames(arguments[0])[0],
      children: children
    }
  }

  if(expression) {
    var children = [],
        i = 0;

    if(arguments[1].length > 1) {
      for(i = 1; i < arguments[1].length; i++) {
        children.push(arguments[1][i]);
      }
    }

    return {
      type: "if",
      condition: this._getParamNames(arguments[0])[0],
      expression: expression,
      children: children
    }
  }

  _getParamNames(fn) {
      var funStr = fn.toString();
      return funStr.slice(funStr.indexOf('(') + 1, funStr.indexOf(')')).match(/([^\s,]+)/g);
  }


};

module.exports = TemplateHelper;
