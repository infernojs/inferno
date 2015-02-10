(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Volumes/StorageVol/Sites/www/EngineJS/InfernoJS/Compiler.js":[function(require,module,exports){
"use strict";

var Compiler = {};

Compiler.compileDsl = function (elements, root, index) {
	var i = 0,
	    j = 0,
	    elem = "",
	    nextElem = [],
	    tag = "",
	    attrs = [],
	    compiledTag;


	//build up a vDom element
	elem = {};

	//if we have an element with an array of elements, go through them
	if (Array.isArray(elements)) {
		for (i = 0; i < elements.length; i++) {
			//see if there is nothing
			if (elements[i] == null) {
				continue;
			}
			elem.children = elem.children || [];
			Compiler.compileDsl(elements[i], elem, i);
		}
	} else {
		if (Array.isArray(elements)) {
			elem.children = elem.children || [];
			Compiler.compileDsl(elements, elem, i);
		} else {
			//check if the element is a templatehelper function
			if (elements.$type === "if") {
				//lets store this in the object so it knows
				root.$toRender = [];
				root.$type = "if";
				switch (elements.condition) {
					case "isTrue":
						root.$condition = true;
						break;
					case "isFalse":
						root.$condition = false;
						break;
					case "isNull":
						root.$condition = null;
						break;
					case "isZero":
						root.$condition = 0;
						break;
				}
				root.$expression = elements.expression;
				Compiler.compileDsl(elements.children, root, 0);
			}
			//handle for statements
			else if (elements.$type === "for") {
				root.$toRender = [];
				if (elements.condition === "each") {
					root.$type = "forEach";
					root.$items = elements.items;
				} else if (elements.condition === "increment") {
					root.$type = "for";
					root.$bounds = elements.bounds;
				}
				root.$toRender = elements.children;
			} else if (elements.$type === "render") {
				elem.$type = "render";
				elem.$component = elements.$component;
				elem.$data = elements.$data;
				elem.$tag = elements.$tag;
			}
			//handle it if it's a text value
			else if (elements.$type === "text") {
				root.$type = "text";
				root.$condition = elements.condition;
				root.$toRender = elements.$toRender;
			}
			//check if the value is simply a string
			else if (typeof elements === "string") {
				if (root.tag == null && index === 0) {
					tag = elements;
					//tag may have .className or #id in it, so we need to take them out
					compiledTag = Compiler.compileTag(tag);
					//apply ids and classNames
					if (compiledTag.classes.length > 0) {
						root.className = compiledTag.classes.join(" ");
					}
					if (compiledTag.ids.length > 0) {
						root.attrs = elem.attrs || {};
						root.attrs.id = compiledTag.ids.join("");
					}
					root.tag = compiledTag.tag;
				} else {
					root.children = elements;
				}
			}
			//otherwise, it could be a properties object with class etc
			else {
				root.attrs = {};
				//go through each property and add it to the elem
				for (j in elements) {
					//check the key and see if its on the elem or in attrs
					switch (j) {
						case "className":
						case "style":
						case "onCreated":
							root[j] = elements[j];
							break;
						case "id":
						case "type":
						case "value":
						case "placeholder":
						case "method":
						case "action":
						default:
							root.attrs[j] = elements[j];
							break;
					}
				}
			}
		}
	}

	//check if the object is empty
	if (Object.keys(elem).length === 0) {
		return;
	}

	if (Array.isArray(root)) {
		root.push(elem);
	} else if (root.$toRender != null) {
		root.$toRender.push(elem);
	} else {
		root.children.push(elem);
	}
};

Compiler.compileTag = function (tag) {
	var classes = [],
	    ids = [];

	if (tag.indexOf(".") > -1) {
		classes = tag.split(".");
		tag = classes[0];
		classes.shift();
	}
	if (tag.indexOf("#") > -1) {
		ids = tag.split("#");
		tag = ids[0];
		ids.shift();
	}
	return {
		tag: tag,
		ids: ids,
		classes: classes
	};
};

module.exports = Compiler;

},{}],"/Volumes/StorageVol/Sites/www/EngineJS/InfernoJS/Component.js":[function(require,module,exports){
"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) {
	if (staticProps) Object.defineProperties(child, staticProps);if (instanceProps) Object.defineProperties(child.prototype, instanceProps);
};

var _classCallCheck = function (instance, Constructor) {
	if (!(instance instanceof Constructor)) {
		throw new TypeError("Cannot call a class as a function");
	}
};

var TemplateHelper = require("./TemplateHelper.js");
var Compiler = require("./Compiler.js");
var b = require("./bobril.js");
var b = require("./bobril.js");

var Component = (function () {
	function Component() {
		_classCallCheck(this, Component);

		this._compiled = [];
		this._lastTick = 0;
		this._ctx = null;
		this._subComponents = [];
		this._lastDependencyCheck = [];
		this._templateHelper = new TemplateHelper(this);
		//init the template
		this._template = this.initTemplate(this._templateHelper) || {};
		//then compile the template
		this._compileTemplate(this);
	}

	_prototypeProperties(Component, null, {
		forceUpdate: {
			value: function forceUpdate() {
				var t,
				    skipUpdateThis = false;

				//check if we need to update ourselves
				if (this.dependencies != null) {
					var dependencies = this.dependencies();
					if (this._compareArrays(dependencies, this._lastDependencyCheck)) {
						//then only update children
						for (var i = 0; i < this._subComponents.length; i++) {
							this._subComponents[i].forceUpdate();
						}
						skipUpdateThis = true;
					} else {
						this._lastDependencyCheck = dependencies;
						skipUpdateThis = false;
					}
				}

				if (skipUpdateThis === false) {
					t = Date.now();
					if (t > this._lastTick + 17) {
						if (this._ctx != null) {
							b.invalidate(this._ctx);
						} else {
							b.invalidate();
						}
						this._lastTick = t;
					}
				}
			},
			writable: true,
			configurable: true
		},
		mount: {
			value: function mount(elem) {
				//clear the contents
				elem.innerHTML = "";
				b.setRootNode(elem);
				//now we let bobril generate the dom to start with
				b.init((function () {
					//return the rendered
					return {
						compiled: this._createVirtualDom(),
						context: this
					};
				}).bind(this));
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
		updateElement: {
			value: function updateElement(node) {
				b.updateNode(node);
			},
			writable: true,
			configurable: true
		},
		_compareArrays: {
			value: function _compareArrays(array1, array2) {
				// if the other array is a falsy value, return
				if (!array2) return false;

				// compare lengths - can save a lot of time
				if (array1.length != array2.length) return false;

				for (var i = 0, l = array1.length; i < l; i++) {
					// Check if we have nested arrays
					if (array1[i] instanceof Array && array2[i] instanceof Array) {
						// recurse into the nested arrays
						if (array1[i].equals(array2[i])) return false;
					} else if (array1[i] != array2[i]) {
						// Warning - two different object instances will never be equal: {x:20} != {x:20}
						return false;
					}
				}
				return true;
			},
			writable: true,
			configurable: true
		},
		_isFunction: {
			value: function _isFunction(obj) {
				return !!(obj && obj.constructor && obj.call && obj.apply);
			},
			writable: true,
			configurable: true
		},
		_createVirtualDom: {
			value: function _createVirtualDom() {
				var createVirtualDom = (function (node, parent) {
					var i = 0,
					    comp = null;
					if (Array.isArray(node)) {
						for (i = 0; i < node.length; i++) {
							if (Array.isArray(parent)) {
								createVirtualDom(node[i], parent);
							} else {
								createVirtualDom(node[i], parent.children);
							}
						}
					} else {
						var vNode = {};
						vNode.children = [];
						if (node.tag != null) {
							vNode.tag = node.tag;
						}
						if (node.style != null) {
							if (this._isFunction(node.style)) {
								vNode.style = node.style.call(this);
							} else {
								vNode.style = node.style;
							}
						}
						if (node.className != null) {
							if (typeof node.className === "string") {
								vNode.className = node.className;
							} else if (node.className.$type != null) {
								vNode.className = this._templateHelper.process(node.className);
							}
						}
						if (node.attrs != null) {
							vNode.attrs = node.attrs;
							if (node.attrs.id != null) {
								if (typeof node.attrs.id === "string") {
									vNode.attrs.id = node.attrs.id;
								} else if (node.attrs.id.$type != null) {
									vNode.attrs.id = this._templateHelper.process(node.attrs.id);
								}
							}
						}
						if (node.onCreated != null) {
							vNode.onCreated = node.onCreated;
						}
						if (node.children == null) {
							//no children (luck bastard)
							if (node.$type != null && node.$type !== "render") {
								node.children = this._templateHelper.process(node);
							} else if (node.$type === "render") {
								comp = this._templateHelper.process(node);
								vNode.component = comp.component;
								vNode.data = comp.data;
							}
							if (Array.isArray(node.children)) {
								createVirtualDom(node.children, vNode);
							} else {
								vNode.children = node.children;
							}
						}
						if (node.children != null) {
							if (node.$type != null && node.$type !== "render") {
								node.children = this._templateHelper.process(node);
							} else if (node.$type === "render") {
								comp = this._templateHelper.process(vNode);
								vNode.component = comp.component;
								vNode.data = comp.data;
							}

							if (Array.isArray(node.children)) {
								createVirtualDom(node.children, vNode);
							} else {
								vNode.children = node.children;
							}
						}
						if (vNode.children !== null || node.$type === "render") {
							if (Array.isArray(parent)) {
								parent.push(vNode);
							} else {
								parent.children.push(vDom);
							}
						}
					}
				}).bind(this);

				var vDom = [];
				//using the compiled template, handle the handlers so we have a new vDom
				createVirtualDom(this._compiled, vDom);

				return vDom;
			},
			writable: true,
			configurable: true
		},
		render: {
			value: function render(ctx, me) {
				var props = ctx.data.props,
				    compiledTag = {},
				    i = 0;

				this._ctx = ctx;

				if (ctx.data.props != null) {
					props = ctx.data.props();
					//best to also disable the watcher here?
					//apply the props to this object
					for (i in props) {
						this[i] = props[i];
					}
					if (this.onUpdate != null) {
						this.onUpdate();
					}
				}
				//handle the tag
				compiledTag = Compiler.compileTag(ctx.data.tag);
				me.tag = compiledTag.tag;
				if (compiledTag.classes.length > 0) {
					me.className = compiledTag.classes;
				}
				if (compiledTag.ids.length > 0) {
					me.attr.id = compiledTag.ids;
				}
				//generate children from this component's own vdom
				me.children = this._createVirtualDom();
			},
			writable: true,
			configurable: true
		},
		addSubComponent: {
			value: function addSubComponent(subCompnent) {
				this._subComponents.push(subCompnent);
			},
			writable: true,
			configurable: true
		},
		_compileTemplate: {
			value: function _compileTemplate() {
				var i = 0;
				this._compiled = [];

				Compiler.compileDsl.call(this._comp, this._template, this._compiled);
			},
			writable: true,
			configurable: true
		},
		_propChange: {
			value: function _propChange(changes) {
				//for now we can simply invalidate
				b.invalidate();
			},
			writable: true,
			configurable: true
		}
	});

	return Component;
})();

;

module.exports = Component;





},{"./Compiler.js":"/Volumes/StorageVol/Sites/www/EngineJS/InfernoJS/Compiler.js","./TemplateHelper.js":"/Volumes/StorageVol/Sites/www/EngineJS/InfernoJS/TemplateHelper.js","./bobril.js":"/Volumes/StorageVol/Sites/www/EngineJS/InfernoJS/bobril.js"}],"/Volumes/StorageVol/Sites/www/EngineJS/InfernoJS/Inferno.js":[function(require,module,exports){
"use strict";

var Component = require("./Component.js");
var Compiler = require("./Compiler.js");

var Inferno = {};

Inferno.Component = Component;

Inferno.Compiler = Compiler;

module.exports = Inferno;

},{"./Compiler.js":"/Volumes/StorageVol/Sites/www/EngineJS/InfernoJS/Compiler.js","./Component.js":"/Volumes/StorageVol/Sites/www/EngineJS/InfernoJS/Component.js"}],"/Volumes/StorageVol/Sites/www/EngineJS/InfernoJS/TemplateHelper.js":[function(require,module,exports){
"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Compiler = require("./Compiler.js");

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

var TemplateHelper = (function () {
  function TemplateHelper(comp) {
    _classCallCheck(this, TemplateHelper);

    this._comp = comp;
  }

  _prototypeProperties(TemplateHelper, null, {
    process: {
      value: function process(node) {
        var i = 0,
            j = 0,
            items = [],
            children = [],
            template = {},
            bounds = [];
        if (node.$type === "if") {
          if (node.$expression() === node.$condition) {
            return node.$toRender;
          } else {
            return null;
          }
        } else if (node.$type === "render") {
          return {
            component: node.$component,
            data: {
              props: node.$data,
              tag: node.$tag
            }
          };
        } else if (node.$type === "text") {
          //check for formatters
          return node.$toRender() + "";
        } else if (node.$type === "forEach") {
          items = node.$items();
          children = [];
          for (i = 0; i < items.length; i++) {
            template = node.$toRender.call(this._comp, items[i], i, items);
            for (j = 0; j < template.length; j++) {
              Compiler.compileDsl.call(this._comp, template[j], children, 0);
            }
          }
          return children;
        } else if (node.$type === "for") {
          bounds = node.$bounds();
          children = [];
          for (i = bounds[0]; i < bounds[1]; i = i + bounds[2]) {
            template = node.$toRender.call(this._comp, i);
            for (j = 0; j < template.length; j++) {
              Compiler.compileDsl.call(this._comp, template[j], children, 0);
            }
          }
          return children;
        }
        return null;
      },
      writable: true,
      configurable: true
    },
    "for": {
      value: function _for(values, children) {
        var condition = this._getParamNames(arguments[0])[0];

        switch (condition) {
          case "each":
            return {
              $type: "for",
              condition: "each",
              items: values,
              children: children
            };
          case "increment":
            return {
              $type: "for",
              condition: "increment",
              bounds: values,
              children: children
            };
        }
      },
      writable: true,
      configurable: true
    },
    text: {
      value: function text(children) {
        return {
          $type: "text",
          condition: this._getParamNames(arguments[0])[0],
          $toRender: children
        };
      },
      writable: true,
      configurable: true
    },
    render: {
      value: function render(tag, component, data) {
        this._comp.addSubComponent(component);
        return {
          $type: "render",
          $tag: tag,
          $data: data,
          $component: component
        };
      },
      writable: true,
      configurable: true
    },
    "if": {
      value: function _if(expression) {
        return {
          $type: "if",
          condition: this._getParamNames(arguments[0])[0],
          expression: expression,
          children: arguments[1]
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

},{"./Compiler.js":"/Volumes/StorageVol/Sites/www/EngineJS/InfernoJS/Compiler.js"}],"/Volumes/StorageVol/Sites/www/EngineJS/InfernoJS/bobril.js":[function(require,module,exports){
"use strict";

/// <reference path="bobril.d.ts"/>
if (typeof window.DEBUG === "undefined") {
    window.DEBUG = true;
}

// IE8 [].map polyfill Reference: http://es5.github.io/#x15.4.4.19
if (!Array.prototype.map) {
    Array.prototype.map = function (callback, thisArg) {
        var a, k;
        // ReSharper disable once ConditionIsAlwaysConst
        if (DEBUG && this == null) {
            throw new TypeError("this==null");
        }
        var o = Object(this);
        var len = o.length >>> 0;
        if (DEBUG && typeof callback != "function") {
            throw new TypeError(callback + " isn't func");
        }
        a = new Array(len);
        k = 0;
        while (k < len) {
            var kValue, mappedValue;
            if (k in o) {
                kValue = o[k];
                mappedValue = callback.call(thisArg, kValue, k, o);
                a[k] = mappedValue;
            }
            k++;
        }
        return a;
    };
}
// Object create polyfill
if (!Object.create) {
    Object.create = function (o) {
        function f() {}
        f.prototype = o;
        return new f();
    };
}
// Object keys polyfill
if (!Object.keys) {
    Object.keys = function (obj) {
        var keys = [];
        for (var i in obj) {
            if (obj.hasOwnProperty(i)) {
                keys.push(i);
            }
        }
        return keys;
    };
}
// Array isArray polyfill
if (!Array.isArray) {
    var objectToString = ({}).toString;
    Array.isArray = function (a) {
        return objectToString.call(a) === "[object Array]";
    };
}
var b = (function (window, document) {
    function assert(shoudBeTrue, messageIfFalse) {
        if (DEBUG && !shoudBeTrue) throw Error(messageIfFalse || "assertion failed");
    }
    var isArray = Array.isArray;
    var objectKeys = Object.keys;
    function createTextNode(content) {
        return document.createTextNode(content);
    }
    var hasTextContent = ("textContent" in createTextNode(""));
    function isObject(value) {
        return typeof value === "object";
    }
    var inNamespace = false;
    var inSvg = false;
    var updateCall = [];
    var updateInstance = [];
    var setValueCallback = function (el, node, newValue, oldValue) {
        if (newValue !== oldValue) el.value = newValue;
    };
    function setSetValue(callback) {
        var prev = setValueCallback;
        setValueCallback = callback;
        return prev;
    }
    var setStyleCallback = function () {};
    function setSetStyle(callback) {
        var prev = setStyleCallback;
        setStyleCallback = callback;
        return prev;
    }
    function updateStyle(n, el, newStyle, oldStyle) {
        if (isObject(newStyle)) {
            setStyleCallback(newStyle);
            var rule;
            if (isObject(oldStyle)) {
                for (rule in oldStyle) {
                    if (!(rule in newStyle)) el.style[rule] = "";
                }
                for (rule in newStyle) {
                    var v = newStyle[rule];
                    if (v !== undefined) {
                        if (oldStyle[rule] !== v) el.style[rule] = v;
                    } else {
                        el.style[rule] = "";
                    }
                }
            } else {
                if (oldStyle) el.style.cssText = "";
                for (rule in newStyle) {
                    var v = newStyle[rule];
                    if (v !== undefined) el.style[rule] = v;
                }
            }
        } else if (newStyle) {
            el.style.cssText = newStyle;
        } else {
            if (isObject(oldStyle)) {
                for (rule in oldStyle) {
                    el.style[rule] = "";
                }
            } else if (oldStyle) {
                el.style.cssText = "";
            }
        }
    }
    function setClassName(el, className) {
        if (inNamespace) el.setAttribute("class", className);else el.className = className;
    }
    function updateElement(n, el, newAttrs, oldAttrs) {
        if (!newAttrs) return undefined;
        var attrName, newAttr, oldAttr, valueOldAttr, valueNewAttr;
        for (attrName in newAttrs) {
            newAttr = newAttrs[attrName];
            oldAttr = oldAttrs[attrName];
            if (attrName === "value" && !inNamespace) {
                valueOldAttr = oldAttr;
                valueNewAttr = newAttr;
                oldAttrs[attrName] = newAttr;
                continue;
            }
            if (oldAttr !== newAttr) {
                oldAttrs[attrName] = newAttr;
                if (inNamespace) {
                    if (attrName === "href") el.setAttributeNS("http://www.w3.org/1999/xlink", "href", newAttr);else el.setAttribute(attrName, newAttr);
                } else if (attrName in el && !(attrName === "list" || attrName === "form")) {
                    el[attrName] = newAttr;
                } else el.setAttribute(attrName, newAttr);
            }
        }
        if (valueNewAttr !== undefined) {
            setValueCallback(el, n, valueNewAttr, valueOldAttr);
        }
        return oldAttrs;
    }
    function nodeAccessor(c) {
        return {
            update: function (attrs, children) {
                if (attrs.style) {
                    for (var i in attrs.style) {
                        c.element.style[i] = attrs.style[i];
                    }
                }
                if (children != null) {
                    c.element.firstChild.nodeValue = children;
                }
            }
        };
    }
    function pushInitCallback(c, aupdate) {
        var cc = c.component;
        if (cc) {
            if (cc[aupdate ? "postUpdateDom" : "postInitDom"]) {
                updateCall.push(aupdate);
                updateInstance.push(c);
            }
        }
    }
    function createNode(n, parentNode) {
        var c = n;
        var backupInNamespace = inNamespace;
        var backupInSvg = inSvg;
        var component = c.component;
        if (!c) {
            return;
        }
        if (component) {
            c.ctx = { data: c.data || {}, me: c };
            if (component.init) {
                component.init(c.ctx, n);
            }
            if (component.render) {
                component.render(c.ctx, n);
            }
        }
        var el;
        if (n.tag === "") {
            c.element = createTextNode(c.children);
            return c;
        } else if (n.tag === "/") {
            return c;
        } else if (inSvg || n.tag === "svg") {
            el = document.createElementNS("http://www.w3.org/2000/svg", n.tag);
            inNamespace = true;
            inSvg = true;
        } else {
            el = document.createElement(n.tag);
        }
        c.element = el;
        createChildren(c);
        if (component) {
            if (component.postRender) {
                component.postRender(c.ctx, n);
            }
        }
        if (c.onCreated) {
            c.onCreated.call(rootContext, nodeAccessor(c));
        }
        if (c.attrs) c.attrs = updateElement(c, el, c.attrs, {});
        if (c.style) updateStyle(c, el, c.style, undefined);
        var className = c.className;
        if (className) setClassName(el, className);
        inNamespace = backupInNamespace;
        inSvg = backupInSvg;
        pushInitCallback(c, false);
        c.parent = parentNode;
        return c;
    }
    function normalizeNode(n) {
        var t = typeof n;
        if (t === "string") {
            return { tag: "", children: n };
        }
        if (t === "boolean") return null;
        return n;
    }
    function createChildren(c) {
        var ch = c.children;
        var element = c.element;
        if (!ch) return;
        if (!isArray(ch)) {
            if (typeof ch === "string") {
                if (hasTextContent) {
                    element.textContent = ch;
                } else {
                    element.innerText = ch;
                }
                return;
            }
            ch = [ch];
        }
        ch = ch.slice(0);
        var i = 0,
            l = ch.length;
        while (i < l) {
            var item = ch[i];
            if (isArray(item)) {
                ch.splice.apply(ch, [i, 1].concat(item));
                l = ch.length;
                continue;
            }
            item = normalizeNode(item);
            if (item == null) {
                ch.splice(i, 1);
                l--;
                continue;
            }
            var j = ch[i] = createNode(item, c);
            if (j.tag === "/") {
                var before = element.lastChild;
                c.element.insertAdjacentHTML("beforeend", j.children);
                j.element = [];
                if (before) {
                    before = before.nextSibling;
                } else {
                    before = element.firstChild;
                }
                while (before) {
                    j.element.push(before);
                    before = before.nextSibling;
                }
            } else {
                element.appendChild(j.element);
            }
            i++;
        }
        c.children = ch;
    }
    function destroyNode(c) {
        var ch = c.children;
        if (isArray(ch)) {
            for (var i = 0, l = ch.length; i < l; i++) {
                destroyNode(ch[i]);
            }
        }
        var component = c.component;
        if (component) {
            if (component.destroy) component.destroy(c.ctx, c, c.element);
        }
    }
    function removeNode(c) {
        destroyNode(c);
        var el = c.element;
        c.parent = null;
        if (isArray(el)) {
            var pa = el[0].parentNode;
            if (pa) {
                for (var i = 0; i < el.length; i++) {
                    pa.removeChild(el[i]);
                }
            }
        } else {
            var p = el.parentNode;
            if (p) p.removeChild(el);
        }
    }
    var rootFactory;
    var rootContext;
    var rootCacheChildren = [];
    var rootNode = document.body;
    function vdomPath(n) {
        var res = [];
        if (n == null) return res;

        var root = rootNode;
        var nodeStack = [];
        while (n && n !== root) {
            nodeStack.push(n);
            n = n.parentNode;
        }
        if (!n) return res;
        var currentCacheArray = rootCacheChildren;
        while (nodeStack.length) {
            var currentNode = nodeStack.pop();
            if (currentCacheArray) for (var i = 0, l = currentCacheArray.length; i < l; i++) {
                var bn = currentCacheArray[i];
                if (bn.element === currentNode) {
                    res.push(bn);
                    currentCacheArray = bn.children;
                    currentNode = null;
                    break;
                }
            }
            if (currentNode) {
                res.push(null);
                break;
            }
        }
        return res;
    }
    function getCacheNode(n) {
        var s = vdomPath(n);
        if (s.length == 0) return null;
        return s[s.length - 1];
    }
    function updateNode(n, c) {
        var component = n.component;
        var backupInNamespace = inNamespace;
        var backupInSvg = inSvg;
        var bigChange = false;
        if (component && c.ctx != null) {
            if (component.id !== c.component.id) {
                bigChange = true;
            } else {
                if (component.shouldChange) if (!component.shouldChange(c.ctx, n, c)) return c;
                c.ctx.data = n.data || {};
                c.component = component;
                if (component.render) component.render(c.ctx, n, c);
            }
        }
        var el;
        if (bigChange || component && c.ctx == null) {} else if (n.tag === "/") {
            el = c.element;
            if (isArray(el)) el = el[0];
            var elprev = el.previousSibling;
            var removeEl = false;
            var parent = el.parentNode;
            if (!el.insertAdjacentHTML) {
                el = parent.insertBefore(document.createElement("i"), el);
                removeEl = true;
            }
            el.insertAdjacentHTML("beforebegin", n.children);
            if (elprev) {
                elprev = elprev.nextSibling;
            } else {
                elprev = parent.firstChild;
            }
            var newElements = [];
            while (elprev !== el) {
                newElements.push(elprev);
                elprev = elprev.nextSibling;
            }
            n.element = newElements;
            if (removeEl) {
                parent.removeChild(el);
            }
            removeNode(c);
            return n;
        } else if (n.tag === c.tag && (inSvg || !inNamespace)) {
            if (n.tag === "") {
                if (c.children !== n.children) {
                    c.children = n.children;
                    el = c.element;
                    if (hasTextContent) {
                        el.textContent = c.children;
                    } else {
                        el.nodeValue = c.children;
                    }
                }
                return c;
            } else {
                if (n.tag === "svg") {
                    inNamespace = true;
                    inSvg = true;
                }
                if (!n.attrs && !c.attrs || n.attrs && c.attrs && objectKeys(n.attrs).join() === objectKeys(c.attrs).join() && n.attrs.id === c.attrs.id) {
                    updateChildrenNode(n, c);
                    if (component) {
                        if (component.postRender) {
                            component.postRender(c.ctx, n, c);
                        }
                    }
                    el = c.element;
                    if (c.attrs) c.attrs = updateElement(c, el, n.attrs, c.attrs);
                    updateStyle(c, el, n.style, c.style);
                    c.style = n.style;
                    var className = n.className;
                    if (className !== c.className) {
                        setClassName(el, className || "");
                        c.className = className;
                    }
                    c.data = n.data;
                    inNamespace = backupInNamespace;
                    inSvg = backupInSvg;
                    pushInitCallback(c, true);
                    return c;
                }
                inSvg = backupInSvg;
                inNamespace = backupInNamespace;
            }
        }
        var r = createNode(n, c.parent);
        var pn = c.element.parentNode;
        if (pn) {
            pn.insertBefore(r.element, c.element);
        }
        removeNode(c);
        return r;
    }
    function callPostCallbacks() {
        var count = updateInstance.length;
        for (var i = 0; i < count; i++) {
            var n = updateInstance[i];
            if (updateCall[i]) {
                n.component.postUpdateDom(n.ctx, n, n.element);
            } else {
                n.component.postInitDom(n.ctx, n, n.element);
            }
        }
        updateCall = [];
        updateInstance = [];
    }
    function updateChildren(element, newChildren, cachedChildren, parentNode) {
        if (newChildren == null) newChildren = [];
        if (!isArray(newChildren)) {
            if (typeof newChildren === "string" && !isArray(cachedChildren)) {
                if (newChildren === cachedChildren) return cachedChildren;
                if (hasTextContent) {
                    element.textContent = newChildren;
                } else {
                    element.innerText = newChildren;
                }
                return newChildren;
            }
            newChildren = [newChildren];
        }
        if (cachedChildren == null) cachedChildren = [];
        if (!isArray(cachedChildren)) {
            if (element.firstChild) element.removeChild(element.firstChild);
            cachedChildren = [];
        }
        newChildren = newChildren.slice(0);
        var newLength = newChildren.length;
        var cachedLength = cachedChildren.length;
        var newIndex;
        for (newIndex = 0; newIndex < newLength;) {
            var item = newChildren[newIndex];
            if (isArray(item)) {
                newChildren.splice.apply(newChildren, [newIndex, 1].concat(item));
                newLength = newChildren.length;
                continue;
            }
            item = normalizeNode(item);
            if (item == null) {
                newChildren.splice(newIndex, 1);
                newLength--;
                continue;
            }
            newChildren[newIndex] = item;
            newIndex++;
        }
        var newEnd = newLength;
        var cachedEnd = cachedLength;
        newIndex = 0;
        var cachedIndex = 0;
        while (newIndex < newEnd && cachedIndex < cachedEnd) {
            if (newChildren[newIndex].key === cachedChildren[cachedIndex].key) {
                cachedChildren[cachedIndex] = updateNode(newChildren[newIndex], cachedChildren[cachedIndex]);
                newIndex++;
                cachedIndex++;
                continue;
            }
            while (true) {
                if (newChildren[newEnd - 1].key === cachedChildren[cachedEnd - 1].key) {
                    newEnd--;
                    cachedEnd--;
                    cachedChildren[cachedEnd] = updateNode(newChildren[newEnd], cachedChildren[cachedEnd]);
                    if (newIndex < newEnd && cachedIndex < cachedEnd) continue;
                }
                break;
            }
            if (newIndex < newEnd && cachedIndex < cachedEnd) {
                if (newChildren[newIndex].key === cachedChildren[cachedEnd - 1].key) {
                    element.insertBefore(cachedChildren[cachedEnd - 1].element, cachedChildren[cachedIndex].element);
                    cachedChildren.splice(cachedIndex, 0, cachedChildren[cachedEnd - 1]);
                    cachedChildren.splice(cachedEnd, 1);
                    cachedChildren[cachedIndex] = updateNode(newChildren[newIndex], cachedChildren[cachedIndex]);
                    newIndex++;
                    cachedIndex++;
                    continue;
                }
                if (newChildren[newEnd - 1].key === cachedChildren[cachedIndex].key) {
                    element.insertBefore(cachedChildren[cachedIndex].element, cachedEnd === cachedLength ? null : cachedChildren[cachedEnd].element);
                    cachedChildren.splice(cachedEnd, 0, cachedChildren[cachedIndex]);
                    cachedChildren.splice(cachedIndex, 1);
                    cachedEnd--;
                    newEnd--;
                    cachedChildren[cachedEnd] = updateNode(newChildren[newEnd], cachedChildren[cachedEnd]);
                    continue;
                }
            }
            break;
        }
        if (cachedIndex === cachedEnd) {
            if (newIndex === newEnd) {
                return cachedChildren;
            }
            while (newIndex < newEnd) {
                cachedChildren.splice(cachedIndex, 0, createNode(newChildren[newIndex], parentNode));
                cachedIndex++;
                cachedEnd++;
                cachedLength++;
                element.insertBefore(cachedChildren[newIndex].element, cachedEnd === cachedLength ? null : cachedChildren[cachedEnd].element);
                newIndex++;
            }
            return cachedChildren;
        }
        if (newIndex === newEnd) {
            while (cachedIndex < cachedEnd) {
                cachedEnd--;
                removeNode(cachedChildren[cachedEnd]);
                cachedChildren.splice(cachedEnd, 1);
            }
            return cachedChildren;
        }
        // order of keyed nodes ware changed => reorder keyed nodes first
        var cachedKeys = {};
        var newKeys = {};
        var key;
        var node;
        var backupNewIndex = newIndex;
        var backupCachedIndex = cachedIndex;
        var deltaKeyless = 0;
        for (; cachedIndex < cachedEnd; cachedIndex++) {
            node = cachedChildren[cachedIndex];
            key = node.key;
            if (key != null) {
                assert(!(key in cachedKeys));
                cachedKeys[key] = cachedIndex;
            } else deltaKeyless--;
        }
        var keyLess = -deltaKeyless - deltaKeyless;
        for (; newIndex < newEnd; newIndex++) {
            node = newChildren[newIndex];
            key = node.key;
            if (key != null) {
                assert(!(key in newKeys));
                newKeys[key] = newIndex;
            } else deltaKeyless++;
        }
        keyLess += deltaKeyless;
        var delta = 0;
        newIndex = backupNewIndex;
        cachedIndex = backupCachedIndex;
        var cachedKey;
        while (cachedIndex < cachedEnd && newIndex < newEnd) {
            if (cachedChildren[cachedIndex] === null) {
                cachedChildren.splice(cachedIndex, 1);
                cachedEnd--;
                cachedLength--;
                delta--;
                continue;
            }
            cachedKey = cachedChildren[cachedIndex].key;
            if (cachedKey == null) {
                cachedIndex++;
                continue;
            }
            key = newChildren[newIndex].key;
            if (key == null) {
                newIndex++;
                while (newIndex < newEnd) {
                    key = newChildren[newIndex].key;
                    if (key != null) break;
                    newIndex++;
                }
                if (key == null) break;
            }
            var akpos = cachedKeys[key];
            if (akpos === undefined) {
                // New key
                cachedChildren.splice(cachedIndex, 0, createNode(newChildren[newIndex], parentNode));
                element.insertBefore(cachedChildren[cachedIndex].element, cachedChildren[cachedIndex + 1].element);
                delta++;
                newIndex++;
                cachedIndex++;
                cachedEnd++;
                cachedLength++;
                continue;
            }
            if (!(cachedKey in newKeys)) {
                // Old key
                removeNode(cachedChildren[cachedIndex]);
                cachedChildren.splice(cachedIndex, 1);
                delta--;
                cachedEnd--;
                cachedLength--;
                continue;
            }
            if (cachedIndex === akpos + delta) {
                // Inplace update
                cachedChildren[cachedIndex] = updateNode(newChildren[newIndex], cachedChildren[cachedIndex]);
                newIndex++;
                cachedIndex++;
            } else {
                // Move
                cachedChildren.splice(cachedIndex, 0, cachedChildren[akpos + delta]);
                delta++;
                cachedChildren[akpos + delta] = null;
                element.insertBefore(cachedChildren[cachedIndex].element, cachedChildren[cachedIndex + 1].element);
                cachedChildren[cachedIndex] = updateNode(newChildren[newIndex], cachedChildren[cachedIndex]);
                cachedIndex++;
                cachedEnd++;
                cachedLength++;
                newIndex++;
            }
        }
        while (cachedIndex < cachedEnd) {
            if (cachedChildren[cachedIndex] === null) {
                cachedChildren.splice(cachedIndex, 1);
                cachedEnd--;
                cachedLength--;
                continue;
            }
            if (cachedChildren[cachedIndex].key != null) {
                removeNode(cachedChildren[cachedIndex]);
                cachedChildren.splice(cachedIndex, 1);
                cachedEnd--;
                cachedLength--;
                continue;
            }
            cachedIndex++;
        }
        while (newIndex < newEnd) {
            key = newChildren[newIndex].key;
            if (key != null) {
                cachedChildren.splice(cachedIndex, 0, createNode(newChildren[newIndex], parentNode));
                cachedEnd++;
                cachedLength++;
                element.insertBefore(cachedChildren[cachedIndex].element, cachedEnd === cachedLength ? null : cachedChildren[cachedEnd].element);
                delta++;
                cachedIndex++;
            }
            newIndex++;
        }
        // Without any keyless nodes we are done
        if (!keyLess) return cachedChildren;
        // calculate common (old and new) keyless
        keyLess = keyLess - Math.abs(deltaKeyless) >> 1;
        // reorder just nonkeyed nodes
        newIndex = backupNewIndex;
        cachedIndex = backupCachedIndex;
        while (newIndex < newEnd) {
            if (cachedIndex < cachedEnd) {
                cachedKey = cachedChildren[cachedIndex].key;
                if (cachedKey != null) {
                    cachedIndex++;
                    continue;
                }
            }
            key = newChildren[newIndex].key;
            if (newIndex < cachedEnd && key === cachedChildren[newIndex].key) {
                if (key != null) {
                    newIndex++;
                    continue;
                }
                cachedChildren[newIndex] = updateNode(newChildren[newIndex], cachedChildren[newIndex]);
                keyLess--;
                newIndex++;
                cachedIndex = newIndex;
                continue;
            }
            if (key != null) {
                assert(newIndex === cachedIndex);
                if (keyLess === 0 && deltaKeyless < 0) {
                    while (true) {
                        removeNode(cachedChildren[cachedIndex]);
                        cachedChildren.splice(cachedIndex, 1);
                        cachedEnd--;
                        cachedLength--;
                        deltaKeyless++;
                        assert(cachedIndex !== cachedEnd, "there still need to exist key node");
                        if (cachedChildren[cachedIndex].key != null) break;
                    }
                    continue;
                }
                while (cachedChildren[cachedIndex].key == null) cachedIndex++;
                assert(key === cachedChildren[cachedIndex].key);
                cachedChildren.splice(newIndex, 0, cachedChildren[cachedIndex]);
                cachedChildren.splice(cachedIndex + 1, 1);
                element.insertBefore(cachedChildren[newIndex].element, cachedChildren[newIndex + 1].element);
                newIndex++;
                cachedIndex = newIndex;
                continue;
            }
            if (cachedIndex < cachedEnd) {
                element.insertBefore(cachedChildren[cachedIndex].element, cachedChildren[newIndex].element);
                cachedChildren.splice(newIndex, 0, cachedChildren[cachedIndex]);
                cachedChildren.splice(cachedIndex + 1, 1);
                cachedChildren[newIndex] = updateNode(newChildren[newIndex], cachedChildren[newIndex]);
                keyLess--;
                newIndex++;
                cachedIndex++;
            } else {
                cachedChildren.splice(newIndex, 0, createNode(newChildren[newIndex], parentNode));
                cachedEnd++;
                cachedLength++;
                element.insertBefore(cachedChildren[newIndex].element, newIndex + 1 === cachedLength ? null : cachedChildren[newIndex + 1].element);
                newIndex++;
                cachedIndex++;
            }
        }
        while (cachedEnd > newIndex) {
            cachedEnd--;
            removeNode(cachedChildren[cachedEnd]);
            cachedChildren.splice(cachedEnd, 1);
        }
        return cachedChildren;
    }
    function updateChildrenNode(n, c) {
        c.children = updateChildren(c.element, n.children, c.children, c);
    }
    var hasNativeRaf = false;
    var nativeRaf = window.requestAnimationFrame;
    if (nativeRaf) {
        nativeRaf(function (param) {
            if (param === +param) hasNativeRaf = true;
        });
    }
    var now = Date.now || function () {
        return new Date().getTime();
    };
    var startTime = now();
    var lastTickTime = 0;
    function requestAnimationFrame(callback) {
        if (hasNativeRaf) {
            nativeRaf(callback);
        } else {
            var delay = 50 / 3 + lastTickTime - now();
            if (delay < 0) delay = 0;
            window.setTimeout(function () {
                lastTickTime = now();
                callback(lastTickTime - startTime);
            }, delay);
        }
    }
    var ctxInvalidated = "$invalidated";
    var fullRecreateRequested = false;
    var scheduled = false;
    var uptime = 0;
    var frame = 0;
    var regEvents = {};
    var registryEvents = {};
    function addEvent(name, priority, callback) {
        var list = registryEvents[name] || [];
        list.push({ priority: priority, callback: callback });
        registryEvents[name] = list;
    }
    function emitEvent(name, ev, target, node) {
        var events = regEvents[name];
        if (events) for (var i = 0; i < events.length; i++) {
            if (events[i](ev, target, node)) return true;
        }
        return false;
    }
    function addListener(el, name) {
        if (name[0] == "!") return;
        function enhanceEvent(ev) {
            ev = ev || window.event;
            var t = ev.target || ev.srcElement || el;
            var n = getCacheNode(t);
            emitEvent(name, ev, t, n);
        }
        if ("on" + name in window) el = window;
        if (el.addEventListener) {
            el.addEventListener(name, enhanceEvent);
        } else {
            el.attachEvent("on" + name, enhanceEvent);
        }
    }
    var eventsCaptured = false;
    function initEvents() {
        if (eventsCaptured) return;
        eventsCaptured = true;
        var eventNames = objectKeys(registryEvents);
        for (var j = 0; j < eventNames.length; j++) {
            var eventName = eventNames[j];
            var arr = registryEvents[eventName];
            arr = arr.sort(function (a, b) {
                return a.priority - b.priority;
            });
            regEvents[eventName] = arr.map(function (v) {
                return v.callback;
            });
        }
        registryEvents = null;
        for (var i = 0; i < eventNames.length; i++) {
            addListener(rootNode, eventNames[i]);
        }
    }
    function selectedUpdate(cache) {
        for (var i = 0; i < cache.length; i++) {
            var node = cache[i];
            if (node.ctx != null && node.ctx[ctxInvalidated] === frame) {
                cache[i] = updateNode(cloneNode(node), node);
            } else if (isArray(node.children)) {
                selectedUpdate(node.children);
            }
        }
    }
    var afterFrameCallback = function () {};
    function setAfterFrame(callback) {
        var res = afterFrameCallback;
        afterFrameCallback = callback;
        return res;
    }
    function update(time) {
        initEvents();
        frame++;
        uptime = time;
        scheduled = false;
        if (fullRecreateRequested) {
            fullRecreateRequested = false;
            var factory = rootFactory();
            var newChildren = factory.compiled;
            rootContext = factory.context;
            rootCacheChildren = updateChildren(rootNode, newChildren, rootCacheChildren, null);
        } else {
            selectedUpdate(rootCacheChildren);
        }
        callPostCallbacks();
        afterFrameCallback(rootCacheChildren);
    }
    function invalidate(ctx) {
        if (fullRecreateRequested) return;
        if (ctx != null) {
            ctx[ctxInvalidated] = frame + 1;
        } else {
            fullRecreateRequested = true;
        }
        if (scheduled) return;
        scheduled = true;
        requestAnimationFrame(update);
    }
    function init(factory) {
        if (rootCacheChildren.length) {
            rootCacheChildren = updateChildren(rootNode, [], rootCacheChildren, null);
        }
        rootFactory = factory;
        invalidate();
    }
    function bubbleEvent(node, name, param) {
        while (node) {
            var c = node.component;
            if (c) {
                var m = c[name];
                if (m) {
                    if (m.call(c, node.ctx, param)) return true;
                }
                m = c.shouldStopBubble;
                if (m) {
                    if (m.call(c, node.ctx, name, param)) break;
                }
            }
            node = node.parent;
        }
        return false;
    }
    function merge(f1, f2) {
        var _this = this;
        return function () {
            var result = f1.apply(_this, arguments);
            if (result) return result;
            return f2.apply(_this, arguments);
        };
    }
    var emptyObject = {};
    function mergeComponents(c1, c2) {
        var res = Object.create(c1);
        for (var i in c2) {
            if (!(i in emptyObject)) {
                var m = c2[i];
                var origM = c1[i];
                if (i === "id") {
                    res[i] = (origM != null ? origM : "") + "/" + m;
                } else if (typeof m === "function" && origM != null && typeof origM === "function") {
                    res[i] = merge(origM, m);
                } else {
                    res[i] = m;
                }
            }
        }
        return res;
    }
    function preEnhance(node, methods) {
        var comp = node.component;
        if (!comp) {
            node.component = methods;
            return node;
        }
        node.component = mergeComponents(methods, comp);
        return node;
    }
    function postEnhance(node, methods) {
        var comp = node.component;
        if (!comp) {
            node.component = methods;
            return node;
        }
        node.component = mergeComponents(comp, methods);
        return node;
    }
    function assign(target, source) {
        if (target == null) target = {};
        if (source != null) for (var propname in source) {
            if (!source.hasOwnProperty(propname)) continue;
            target[propname] = source[propname];
        }
        return target;
    }
    function preventDefault(event) {
        var pd = event.preventDefault;
        if (pd) pd.call(event);else event.returnValue = false;
    }
    function cloneNodeArray(a) {
        a = a.slice(0);
        for (var i = 0; i < a.length; i++) {
            var n = a[i];
            if (isArray(n)) {
                a[i] = cloneNodeArray(n);
            } else if (isObject(n)) {
                a[i] = cloneNode(n);
            }
        }
        return a;
    }
    function cloneNode(node) {
        var r = b.assign({}, node);
        if (r.attrs) {
            r.attrs = b.assign({}, r.attrs);
        }
        if (isObject(r.style)) {
            r.style = b.assign({}, r.style);
        }
        var ch = r.children;
        if (ch) {
            if (isArray(ch)) {
                r.children = cloneNodeArray(ch);
            } else if (isObject(ch)) {
                r.children = cloneNode(ch);
            }
        }
        return r;
    }
    return {
        setRootNode: function (root) {
            rootNode = root;
        },
        createNode: createNode,
        updateNode: updateNode,
        updateChildren: updateChildren,
        callPostCallbacks: callPostCallbacks,
        setSetValue: setSetValue,
        setSetStyle: setSetStyle,
        init: init,
        setAfterFrame: setAfterFrame,
        isArray: isArray,
        uptime: function () {
            return uptime;
        },
        now: now,
        frame: function () {
            return frame;
        },
        assign: assign,
        ieVersion: function () {
            return document.documentMode;
        },
        invalidate: invalidate,
        preventDefault: preventDefault,
        vmlNode: function () {
            return inNamespace = true;
        },
        vdomPath: vdomPath,
        deref: getCacheNode,
        addEvent: addEvent,
        emitEvent: emitEvent,
        bubble: bubbleEvent,
        preEnhance: preEnhance,
        postEnhance: postEnhance,
        cloneNode: cloneNode
    };
})(window, document);

module.exports = b;

},{}],"/Volumes/StorageVol/Sites/www/EngineJS/benchmark2.js":[function(require,module,exports){
"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) {
  if (staticProps) Object.defineProperties(child, staticProps);if (instanceProps) Object.defineProperties(child.prototype, instanceProps);
};

var _get = function get(object, property, receiver) {
  var desc = Object.getOwnPropertyDescriptor(object, property);if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc && desc.writable) {
    return desc.value;
  } else {
    var getter = desc.get;if (getter === undefined) {
      return undefined;
    }return getter.call(receiver);
  }
};

var _inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) subClass.__proto__ = superClass;
};

var _classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

//EngineJS is a for true light-weight, ultra-fast isomorphic "React-like" framework

var Inferno = require("./InfernoJS/Inferno.js");

var Box = (function (_Inferno$Component) {
  function Box() {
    _classCallCheck(this, Box);

    this.count = 0;
    this.i = 0;
    _get(_Inferno$Component.prototype, "constructor", this).call(this);
  }

  _inherits(Box, _Inferno$Component);

  _prototypeProperties(Box, null, {
    getStyle: {
      value: function getStyle() {
        return {
          top: Math.sin(this.count / 10) * 10 + "px",
          left: Math.cos(this.count / 10) * 10 + "px",
          background: "rgb(0,0," + this.count % 255 + ")"
        };
      },
      writable: true,
      configurable: true
    },
    initTemplate: {
      value: function initTemplate($) {
        var _this = this;
        return ["div.box", { id: $.text(function (none) {
            return "box-" + _this.i;
          }), style: this.getStyle }, $.text(function (none) {
          return _this.count % 100;
        })];
      },
      writable: true,
      configurable: true
    }
  });

  return Box;
})(Inferno.Component);

var InfernoBenchmark2 = (function (_Inferno$Component2) {
  //properties starting with _underscore are not observed by default
  function InfernoBenchmark2() {
    _classCallCheck(this, InfernoBenchmark2);

    this.count = 0;
    this.boxes = [];

    for (var i = 0; i < N; i++) {
      this.boxes.push(new Box());
    }

    _get(_Inferno$Component2.prototype, "constructor", this).call(this);
  }

  _inherits(InfernoBenchmark2, _Inferno$Component2);

  _prototypeProperties(InfernoBenchmark2, null, {
    dependencies: {
      value: function dependencies() {
        return [
        //update the set of boxes only if their length changes
        this.boxes.length];
      },
      writable: true,
      configurable: true
    },
    animateBoxes: {
      value: function animateBoxes() {
        this.count++;
        this.forceUpdate();
      },
      writable: true,
      configurable: true
    },
    initTemplate: {
      value: function initTemplate($) {
        var _this = this;
        return [["div#grid", $["for"](function (each) {
          return _this.boxes;
        }, function (box, i) {
          return [$.render("div.box-view", box, function (props) {
            return { count: _this.count, i: i };
          })];
        })]];
      },
      writable: true,
      configurable: true
    }
  });

  return InfernoBenchmark2;
})(Inferno.Component);

;

window.InfernoBenchmark2 = InfernoBenchmark2;









},{"./InfernoJS/Inferno.js":"/Volumes/StorageVol/Sites/www/EngineJS/InfernoJS/Inferno.js"}]},{},["/Volumes/StorageVol/Sites/www/EngineJS/benchmark2.js"]);
