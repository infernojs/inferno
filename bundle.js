(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Volumes/StorageVol/Sites/www/EngineJS/EngineJS/Component.js":[function(require,module,exports){
"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var TemplateHelper = require("./TemplateHelper.js");

var Component = (function () {
	function Component(props) {
		_classCallCheck(this, Component);

		this._vDom = [];
		this.props = this.props || {};
		this.props.template = {};
		this._templateHelper = new TemplateHelper(this.props);

		//call init
		this.init.call(this.props, this._templateHelper);

		//then apply the observer for this class
		Object.observe(this.props, this._propChange.bind(this));
	}

	_prototypeProperties(Component, null, {
		mount: {
			value: function mount(elem) {
				//then compile the template
				this._compileTemplate();
			},
			writable: true,
			configurable: true
		},
		getTemplateHelper: {
			value: function getTemplateHelper() {
				return this._templateHelper;
			},
			writable: true,
			configurable: true
		},
		_compileTemplate: {
			value: function _compileTemplate() {
				var i = 0;

				this._vDom = [];

				var nextLevel = (function (elements, root) {
					var i = 0,
					    j = 0,
					    vElem = "",
					    nextElem = [],
					    helperElem = {};

					//build up a vDom element
					vElem = { tag: elements[0] };

					//now go through its properties
					for (i = 1; i < elements.length; i++) {
						if (Array.isArray(elements[i])) {
							vElem.children = vElem.children || [];
							nextLevel(elements[i], vElem);
						} else {
							//see if there is nothing
							if (elements[i] == null) {
								continue;
							}
							//check if the element is a templatehelper function
							else if (elements[i].type === "if") {
								//lets store this in the object so it knows
								helperElem = {};
								helperElem.children = [];
								helperElem.tag = "if";
								helperElem.condition = elements[i].condition;
								helperElem.expression = elements[i].expression.bind(this.props);
								for (j = 0; j < elements[i].success.length; j++) {
									nextLevel(elements[i].success[j], helperElem);
								}
								//then store the helper in the vElem
								vElem.children = vElem.children || [];
								vElem.children.push(helperElem);
							}
							//handle it if it's a text value
							else if (elements[i].type === "bind") {
								helperElem = {};
								helperElem.tag = "bind";
								helperElem.condition = elements[i].condition;
								helperElem.expression = elements[i].expression.bind(this.props);
								//then store the helper in the vElem
								vElem.children = helperElem;
							}
							//check if the value is simply a string
							else if (typeof elements[i] === "string") {
								vElem.children = elements[i];
							}
							//otherwise, it could be a properties object with class etc
							else {
								debugger;
							}
						}
					}
					//push the vElem to the vDom
					if (Array.isArray(root)) {
						root.push(vElem);
					} else {
						root.children.push(vElem);
					}
				}).bind(this);

				for (i = 0; i < this.props.template.length; i++) {
					nextLevel(this.props.template[i], this._vDom);
				};

				debugger;
			},
			writable: true,
			configurable: true
		},
		_propChange: {
			value: function _propChange(changes) {
				debugger;
			},
			writable: true,
			configurable: true
		}
	});

	return Component;
})();

;

module.exports = Component;

},{"./TemplateHelper.js":"/Volumes/StorageVol/Sites/www/EngineJS/EngineJS/TemplateHelper.js"}],"/Volumes/StorageVol/Sites/www/EngineJS/EngineJS/Engine.js":[function(require,module,exports){
"use strict";

var Component = require("./Component.js");

var Engine = {};

Engine.Component = Component;

module.exports = Engine;

},{"./Component.js":"/Volumes/StorageVol/Sites/www/EngineJS/EngineJS/Component.js"}],"/Volumes/StorageVol/Sites/www/EngineJS/EngineJS/TemplateHelper.js":[function(require,module,exports){
"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*

  List of supported helpers

  ==================
  if statements
  ==================

  $.if(isFalse => {expression}, ...)
  $.if(isTrue => {expression}, ...)
  $.if(isNull => {expression}, ...)
  $.if(isEmpty => {expression}, ...)
  $.if(isArray => {expression}, ...)
  $.if(isNumber => {expression}, ...)
  $.if(isString => {expression}, ...)

  ==================
  loop statements
  ==================

  $.for(startVal, endVal, incrementer, ...)
  $.forEach(items, (item, index, array) => ...)
  $.do(while => {expression}, ...)
  $.do(until => {expression}, ...)

  ==================
  data binding + filters/formatters
  ==================

  $.bind(text => {expression) //strips all tags
  $.bind(html => {expression) //strips harmful tags
  $.bind(none => {expression) //no stripping

*/

var TemplateHelper = (function () {
  function TemplateHelper(props) {
    _classCallCheck(this, TemplateHelper);

    this._props = props;
  }

  _prototypeProperties(TemplateHelper, null, {
    forEach: {
      value: function forEach() {},
      writable: true,
      configurable: true
    },
    bind: {
      value: function bind(expression) {
        return {
          type: "bind",
          condition: this._getParamNames(arguments[0])[0],
          expression: expression
        };
      },
      writable: true,
      configurable: true
    },
    "if": {
      value: function _if(expression) {
        var successes = [],
            i = 0;

        if (arguments[1].length > 1) {
          for (i = 1; i < arguments[1].length; i++) {
            successes.push(arguments[1][i]);
          }
        }

        return {
          type: "if",
          condition: this._getParamNames(arguments[0])[0],
          expression: expression,
          success: successes
        };
      },
      writable: true,
      configurable: true
    },
    _getParamNames: {
      value: function _getParamNames(fn) {
        var funStr = fn.toString();
        return funStr.slice(funStr.indexOf("(") + 1, funStr.indexOf(")")).match(/([^\s,]+)/g);
      },
      writable: true,
      configurable: true
    }
  });

  return TemplateHelper;
})();

;

module.exports = TemplateHelper;

},{}],"/Volumes/StorageVol/Sites/www/EngineJS/index.js":[function(require,module,exports){
"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

//EngineJS is a for true light-weight, ultra-fast isomorphic "React-like" framework

var Engine = require("./EngineJS/Engine.js");

var Demo = (function (_Engine$Component) {
	function Demo() {
		_classCallCheck(this, Demo);

		//we define all our properties
		this.props = {
			todos: [],
			title: "",
			formId: ""
		};

		_get(_Engine$Component.prototype, "constructor", this).call(this);
	}

	_inherits(Demo, _Engine$Component);

	_prototypeProperties(Demo, null, {
		click: {
			value: function click(e) {},
			writable: true,
			configurable: true
		},
		init: {
			value: function init($) {
				var _this = this;
				//$ = templateHelper shorthand

				this.todos = ["Clean the dishes", "Cook the dinner", "Code some coding", "Comment on stuff"];

				this.title = "Todo Demo";
				this.formId = "todo-form";

				this.template = [["div", ["header", ["h1", "Example " + $.bind(function (text) {
					return _this.title;
				})]]], ["div#main",
				//example of a truthy statement
				$["if"](function (isTrue) {
					return _this.todos.length > 0;
				}, ["div", ["span.counter", $.bind(function (text) {
					return "There are " + _this.todos.length + " todos!";
				})]]),
				//example of a falsey statement
				$["if"](function (isFalse) {
					return _this.todos.length > 0;
				}, ["div", ["span.no-todos", "There are no todos!"]])], ["ul.todos", $.forEach(this.todos, function (todo, index) {
					return ["li.todo", ["h2", "A todo"], ["span", index + ": " + todo]];
				})], ["form", { id: this.formId, method: "post", action: "#" }, ["div.form-control", ["input", { name: "first_name", type: "text" }]], ["button", { type: "submit", onClick: this.click }, "Submit!"]]];
			},
			writable: true,
			configurable: true
		}
	});

	return Demo;
})(Engine.Component);

;

window.Demo = Demo;

},{"./EngineJS/Engine.js":"/Volumes/StorageVol/Sites/www/EngineJS/EngineJS/Engine.js"}]},{},["/Volumes/StorageVol/Sites/www/EngineJS/index.js"]);
