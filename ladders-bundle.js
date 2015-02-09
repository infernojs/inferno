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
var WatchJS = require("./watch.js");
var watch = WatchJS.watch;
var unwatch = WatchJS.unwatch;
var callWatchers = WatchJS.callWatchers;

var defaultProps = {};

var Component = (function () {
	function Component() {
		_classCallCheck(this, Component);

		this._compiled = [];
		this._propsToWatch = [];
		this._lastTick = 0;
		this._templateHelper = new TemplateHelper();
		//init the template
		this._template = this.initTemplate(this._templateHelper) || {};
		//then compile the template
		this._compileTemplate(this);
		//init the watchers on user defined properties
		this._initPropWatchers();
		this._enableWatchers();
	}

	_prototypeProperties(Component, null, {
		forceUpdate: {
			value: function forceUpdate() {
				var t = Date.now();
				if (t > this._lastTick + 17) {
					b.invalidate();
					this._lastTick = t;
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
		_initPropWatchers: {
			value: function _initPropWatchers() {
				var prop = "";

				for (prop in this) {
					if (prop.charAt(0) !== "_") {
						//add to list of props to watch
						this._propsToWatch.push(prop);
					}
				}
			},
			writable: true,
			configurable: true
		},
		_enableWatchers: {
			value: function _enableWatchers() {},
			writable: true,
			configurable: true
		},
		_disableWatchers: {
			value: function _disableWatchers() {},
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

				if (ctx.data.props != null) {
					props = ctx.data.props();
					//best to also disable the watcher here?
					//apply the props to this object
					this._disableWatchers();
					for (i in props) {
						this[i] = props[i];
					}
					this._enableWatchers();
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
		_compileTemplate: {
			value: function _compileTemplate() {
				var i = 0;
				this._compiled = [];

				for (i = 0; i < this._template.length; i++) {
					Compiler.compileDsl.call(this._comp, this._template[i], this._compiled);
				};
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
//watch(this, this._propsToWatch, this._propChange.bind(this));
//unwatch(this, this._propsToWatch);


},{"./Compiler.js":"/Volumes/StorageVol/Sites/www/EngineJS/InfernoJS/Compiler.js","./TemplateHelper.js":"/Volumes/StorageVol/Sites/www/EngineJS/InfernoJS/TemplateHelper.js","./bobril.js":"/Volumes/StorageVol/Sites/www/EngineJS/InfernoJS/bobril.js","./watch.js":"/Volumes/StorageVol/Sites/www/EngineJS/InfernoJS/watch.js"}],"/Volumes/StorageVol/Sites/www/EngineJS/InfernoJS/Inferno.js":[function(require,module,exports){
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

},{}],"/Volumes/StorageVol/Sites/www/EngineJS/InfernoJS/watch.js":[function(require,module,exports){
/**
 * DEVELOPED BY
 * GIL LOPES BUENO
 * gilbueno.mail@gmail.com
 *
 * WORKS WITH:
 * IE8*, IE 9+, FF 4+, SF 5+, WebKit, CH 7+, OP 12+, BESEN, Rhino 1.7+
 * For IE8 (and other legacy browsers) WatchJS will use dirty checking  
 *
 * FORK:
 * https://github.com/melanke/Watch.JS
 */

"use strict";
(function (factory) {
    if (typeof exports === "object") {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        module.exports = factory();
    } else if (typeof define === "function" && define.amd) {
        // AMD. Register as an anonymous module.
        define(factory);
    } else {
        // Browser globals
        window.WatchJS = factory();
        window.watch = window.WatchJS.watch;
        window.unwatch = window.WatchJS.unwatch;
        window.callWatchers = window.WatchJS.callWatchers;
    }
})(function () {
    var WatchJS = {
        noMore: false, // use WatchJS.suspend(obj) instead
        useDirtyCheck: false // use only dirty checking to track changes.
    },
        lengthsubjects = [];

    var dirtyChecklist = [];
    var pendingChanges = []; // used coalesce changes from defineProperty and __defineSetter__

    var supportDefineProperty = false;
    try {
        supportDefineProperty = Object.defineProperty && Object.defineProperty({}, "x", {});
    } catch (ex) {}

    var isFunction = function (functionToCheck) {
        var getType = {};
        return functionToCheck && getType.toString.call(functionToCheck) == "[object Function]";
    };

    var isInt = function (x) {
        return x % 1 === 0;
    };

    var isArray = function (obj) {
        return Object.prototype.toString.call(obj) === "[object Array]";
    };

    var isObject = function (obj) {
        return ({}).toString.apply(obj) === "[object Object]";
    };

    var getObjDiff = function (a, b) {
        var aplus = [],
            bplus = [];

        if (!(typeof a == "string") && !(typeof b == "string")) {
            if (isArray(a)) {
                for (var i = 0; i < a.length; i++) {
                    if (b[i] === undefined) aplus.push(i);
                }
            } else {
                for (var i in a) {
                    if (a.hasOwnProperty(i)) {
                        if (b[i] === undefined) {
                            aplus.push(i);
                        }
                    }
                }
            }

            if (isArray(b)) {
                for (var j = 0; j < b.length; j++) {
                    if (a[j] === undefined) bplus.push(j);
                }
            } else {
                for (var j in b) {
                    if (b.hasOwnProperty(j)) {
                        if (a[j] === undefined) {
                            bplus.push(j);
                        }
                    }
                }
            }
        }

        return {
            added: aplus,
            removed: bplus
        };
    };

    var clone = function (obj) {
        if (null == obj || "object" != typeof obj) {
            return obj;
        }

        var copy = obj.constructor();

        for (var attr in obj) {
            copy[attr] = obj[attr];
        }

        return copy;
    };

    var defineGetAndSet = function (obj, propName, getter, setter) {
        try {
            Object.observe(obj, function (changes) {
                changes.forEach(function (change) {
                    if (change.name === propName) {
                        setter(change.object[change.name]);
                    }
                });
            });
        } catch (e) {
            try {
                Object.defineProperty(obj, propName, {
                    get: getter,
                    set: function (value) {
                        setter.call(this, value, true); // coalesce changes
                    },
                    enumerable: true,
                    configurable: true
                });
            } catch (e2) {
                try {
                    Object.prototype.__defineGetter__.call(obj, propName, getter);
                    Object.prototype.__defineSetter__.call(obj, propName, function (value) {
                        setter.call(this, value, true); // coalesce changes
                    });
                } catch (e3) {
                    observeDirtyChanges(obj, propName, setter);
                    //throw new Error("watchJS error: browser not supported :/")
                }
            }
        }
    };

    var defineProp = function (obj, propName, value) {
        try {
            Object.defineProperty(obj, propName, {
                enumerable: false,
                configurable: true,
                writable: false,
                value: value
            });
        } catch (error) {
            obj[propName] = value;
        }
    };

    var observeDirtyChanges = function (obj, propName, setter) {
        dirtyChecklist[dirtyChecklist.length] = {
            prop: propName,
            object: obj,
            orig: clone(obj[propName]),
            callback: setter
        };
    };

    var watch = function () {
        if (isFunction(arguments[1])) {
            watchAll.apply(this, arguments);
        } else if (isArray(arguments[1])) {
            watchMany.apply(this, arguments);
        } else {
            watchOne.apply(this, arguments);
        }
    };


    var watchAll = function (obj, watcher, level, addNRemove) {
        if (typeof obj == "string" || !(obj instanceof Object) && !isArray(obj)) {
            //accepts only objects and array (not string)
            return;
        }

        if (isArray(obj)) {
            defineWatcher(obj, "__watchall__", watcher, level); // watch all changes on the array
            if (level === undefined || level > 0) {
                for (var prop = 0; prop < obj.length; prop++) {
                    // watch objects in array
                    watchAll(obj[prop], watcher, level, addNRemove);
                }
            }
        } else {
            var prop,
                props = [];
            for (prop in obj) {
                //for each attribute if obj is an object
                if (prop == "$val" || !supportDefineProperty && prop === "watchers") {
                    continue;
                }

                if (Object.prototype.hasOwnProperty.call(obj, prop)) {
                    props.push(prop); //put in the props
                }
            }
            watchMany(obj, props, watcher, level, addNRemove); //watch all items of the props
        }


        if (addNRemove) {
            pushToLengthSubjects(obj, "$$watchlengthsubjectroot", watcher, level);
        }
    };


    var watchMany = function (obj, props, watcher, level, addNRemove) {
        if (typeof obj == "string" || !(obj instanceof Object) && !isArray(obj)) {
            //accepts only objects and array (not string)
            return;
        }

        for (var i = 0; i < props.length; i++) {
            //watch each property
            var prop = props[i];
            watchOne(obj, prop, watcher, level, addNRemove);
        }
    };

    var watchOne = function (obj, prop, watcher, level, addNRemove) {
        if (typeof obj == "string" || !(obj instanceof Object) && !isArray(obj)) {
            //accepts only objects and array (not string)
            return;
        }

        if (isFunction(obj[prop])) {
            //dont watch if it is a function
            return;
        }
        if (obj[prop] != null && (level === undefined || level > 0)) {
            watchAll(obj[prop], watcher, level !== undefined ? level - 1 : level); //recursively watch all attributes of this
        }

        defineWatcher(obj, prop, watcher, level);

        if (addNRemove && (level === undefined || level > 0)) {
            pushToLengthSubjects(obj, prop, watcher, level);
        }
    };

    var unwatch = function () {
        if (isFunction(arguments[1])) {
            unwatchAll.apply(this, arguments);
        } else if (isArray(arguments[1])) {
            unwatchMany.apply(this, arguments);
        } else {
            unwatchOne.apply(this, arguments);
        }
    };

    var unwatchAll = function (obj, watcher) {
        if (obj instanceof String || !(obj instanceof Object) && !isArray(obj)) {
            //accepts only objects and array (not string)
            return;
        }

        if (isArray(obj)) {
            var props = ["__watchall__"];
            for (var prop = 0; prop < obj.length; prop++) {
                //for each item if obj is an array
                props.push(prop); //put in the props
            }
            unwatchMany(obj, props, watcher); //watch all itens of the props
        } else {
            var unwatchPropsInObject = function (obj2) {
                var props = [];
                for (var prop2 in obj2) {
                    //for each attribute if obj is an object
                    if (obj2.hasOwnProperty(prop2)) {
                        if (obj2[prop2] instanceof Object) {
                            unwatchPropsInObject(obj2[prop2]); //recurs into object props
                        } else {
                            props.push(prop2); //put in the props
                        }
                    }
                }
                unwatchMany(obj2, props, watcher); //unwatch all of the props
            };
            unwatchPropsInObject(obj);
        }
    };


    var unwatchMany = function (obj, props, watcher) {
        for (var prop2 in props) {
            //watch each attribute of "props" if is an object
            if (props.hasOwnProperty(prop2)) {
                unwatchOne(obj, props[prop2], watcher);
            }
        }
    };

    var timeouts = [],
        timerID = null;
    function clearTimerID() {
        timerID = null;
        for (var i = 0; i < timeouts.length; i++) {
            timeouts[i]();
        }
        timeouts.length = 0;
    }
    var getTimerID = function () {
        if (!timerID) {
            timerID = setTimeout(clearTimerID);
        }
        return timerID;
    };
    var registerTimeout = function (fn) {
        // register function to be called on timeout
        if (timerID == null) getTimerID();
        timeouts[timeouts.length] = fn;
    };

    // Track changes made to an array, object or an object's property
    // and invoke callback with a single change object containing type, value, oldvalue and array splices
    // Syntax:
    //      trackChange(obj, callback, recursive, addNRemove)
    //      trackChange(obj, prop, callback, recursive, addNRemove)
    var trackChange = function () {
        var fn = isFunction(arguments[2]) ? trackProperty : trackObject;
        fn.apply(this, arguments);
    };

    // track changes made to an object and invoke callback with a single change object containing type, value and array splices
    var trackObject = function (obj, callback, recursive, addNRemove) {
        var change = null,
            lastTimerID = -1;
        var isArr = isArray(obj);
        var level,
            fn = function (prop, action, newValue, oldValue) {
            var timerID = getTimerID();
            if (lastTimerID !== timerID) {
                // check if timer has changed since last update
                lastTimerID = timerID;
                change = {
                    type: "update"
                };
                change.value = obj;
                change.splices = null;
                registerTimeout(function () {
                    callback.call(this, change);
                    change = null;
                });
            }
            // create splices for array changes
            if (isArr && obj === this && change !== null) {
                if (action === "pop" || action === "shift") {
                    newValue = [];
                    oldValue = [oldValue];
                } else if (action === "push" || action === "unshift") {
                    newValue = [newValue];
                    oldValue = [];
                } else if (action !== "splice") {
                    return; // return here - for reverse and sort operations we don't need to return splices. a simple update will do
                }
                if (!change.splices) change.splices = [];
                change.splices[change.splices.length] = {
                    index: prop,
                    deleteCount: oldValue ? oldValue.length : 0,
                    addedCount: newValue ? newValue.length : 0,
                    added: newValue,
                    deleted: oldValue
                };
            }
        };
        level = recursive == true ? undefined : 0;
        watchAll(obj, fn, level, addNRemove);
    };

    // track changes made to the property of an object and invoke callback with a single change object containing type, value, oldvalue and splices
    var trackProperty = function (obj, prop, callback, recursive, addNRemove) {
        if (obj && prop) {
            watchOne(obj, prop, function (prop, action, newvalue, oldvalue) {
                var change = {
                    type: "update"
                };
                change.value = newvalue;
                change.oldvalue = oldvalue;
                if (recursive && isObject(newvalue) || isArray(newvalue)) {
                    trackObject(newvalue, callback, recursive, addNRemove);
                }
                callback.call(this, change);
            }, 0);

            if (recursive && isObject(obj[prop]) || isArray(obj[prop])) {
                trackObject(obj[prop], callback, recursive, addNRemove);
            }
        }
    };


    var defineWatcher = function (obj, prop, watcher, level) {
        var newWatcher = false;
        var isArr = isArray(obj);

        if (!obj.watchers) {
            defineProp(obj, "watchers", {});
            if (isArr) {
                // watch array functions
                watchFunctions(obj, function (index, action, newValue, oldValue) {
                    addPendingChange(obj, index, action, newValue, oldValue);
                    if (level !== 0 && newValue && (isObject(newValue) || isArray(newValue))) {
                        var i,
                            n,
                            ln,
                            wAll,
                            watchList = obj.watchers[prop];
                        if (wAll = obj.watchers.__watchall__) {
                            watchList = watchList ? watchList.concat(wAll) : wAll;
                        }
                        ln = watchList ? watchList.length : 0;
                        for (i = 0; i < ln; i++) {
                            if (action !== "splice") {
                                watchAll(newValue, watchList[i], level === undefined ? level : level - 1);
                            } else {
                                // watch spliced values
                                for (n = 0; n < newValue.length; n++) {
                                    watchAll(newValue[n], watchList[i], level === undefined ? level : level - 1);
                                }
                            }
                        }
                    }
                });
            }
        }

        if (!obj.watchers[prop]) {
            obj.watchers[prop] = [];
            if (!isArr) newWatcher = true;
        }

        for (var i = 0; i < obj.watchers[prop].length; i++) {
            if (obj.watchers[prop][i] === watcher) {
                return;
            }
        }

        obj.watchers[prop].push(watcher); //add the new watcher to the watchers array

        if (newWatcher) {
            var val = obj[prop];
            var getter = function () {
                return val;
            };

            var setter = function (newval, delayWatcher) {
                var oldval = val;
                val = newval;
                if (level !== 0 && obj[prop] && (isObject(obj[prop]) || isArray(obj[prop])) && !obj[prop].watchers) {
                    // watch sub properties
                    var i,
                        ln = obj.watchers[prop].length;
                    for (i = 0; i < ln; i++) {
                        watchAll(obj[prop], obj.watchers[prop][i], level === undefined ? level : level - 1);
                    }
                }

                //watchFunctions(obj, prop);

                if (isSuspended(obj, prop)) {
                    resume(obj, prop);
                    return;
                }

                if (!WatchJS.noMore) {
                    // this does not work with Object.observe
                    //if (JSON.stringify(oldval) !== JSON.stringify(newval)) {
                    if (oldval !== newval) {
                        if (!delayWatcher) {
                            callWatchers(obj, prop, "set", newval, oldval);
                        } else {
                            addPendingChange(obj, prop, "set", newval, oldval);
                        }
                        WatchJS.noMore = false;
                    }
                }
            };

            if (WatchJS.useDirtyCheck) {
                observeDirtyChanges(obj, prop, setter);
            } else {
                defineGetAndSet(obj, prop, getter, setter);
            }
        }
    };

    var callWatchers = function (obj, prop, action, newval, oldval) {
        if (prop !== undefined) {
            var ln,
                wl,
                watchList = obj.watchers[prop];
            if (wl = obj.watchers.__watchall__) {
                watchList = watchList ? watchList.concat(wl) : wl;
            }
            ln = watchList ? watchList.length : 0;
            for (var wr = 0; wr < ln; wr++) {
                watchList[wr].call(obj, prop, action, newval, oldval);
            }
        } else {
            for (var prop in obj) {
                //call all
                if (obj.hasOwnProperty(prop)) {
                    callWatchers(obj, prop, action, newval, oldval);
                }
            }
        }
    };

    var methodNames = ["pop", "push", "reverse", "shift", "sort", "slice", "unshift", "splice"];
    var defineArrayMethodWatcher = function (obj, original, methodName, callback) {
        defineProp(obj, methodName, function () {
            var index = 0;
            var i, newValue, oldValue, response;
            // get values before splicing array
            if (methodName === "splice") {
                var start = arguments[0];
                var end = start + arguments[1];
                oldValue = obj.slice(start, end);
                newValue = [];
                for (i = 2; i < arguments.length; i++) {
                    newValue[i - 2] = arguments[i];
                }
                index = start;
            } else {
                newValue = arguments.length > 0 ? arguments[0] : undefined;
            }

            response = original.apply(obj, arguments);
            if (methodName !== "slice") {
                if (methodName === "pop") {
                    oldValue = response;
                    index = obj.length;
                } else if (methodName === "push") {
                    index = obj.length - 1;
                } else if (methodName === "shift") {
                    oldValue = response;
                } else if (methodName !== "unshift" && newValue === undefined) {
                    newValue = response;
                }
                callback.call(obj, index, methodName, newValue, oldValue);
            }
            return response;
        });
    };

    var watchFunctions = function (obj, callback) {
        if (!isFunction(callback) || !obj || obj instanceof String || !isArray(obj)) {
            return;
        }

        for (var i = methodNames.length, methodName; i--;) {
            methodName = methodNames[i];
            defineArrayMethodWatcher(obj, obj[methodName], methodName, callback);
        }
    };

    var unwatchOne = function (obj, prop, watcher) {
        if (watcher === undefined && obj.watchers[prop]) {
            delete obj.watchers[prop]; // remove all property watchers
        } else {
            for (var i = 0; i < obj.watchers[prop].length; i++) {
                var w = obj.watchers[prop][i];

                if (w == watcher) {
                    obj.watchers[prop].splice(i, 1);
                }
            }
        }
        removeFromLengthSubjects(obj, prop, watcher);
        removeFromDirtyChecklist(obj, prop);
    };

    // suspend watchers until next update cycle
    var suspend = function (obj, prop) {
        if (obj.watchers) {
            var name = "__wjs_suspend__" + (prop !== undefined ? prop : "");
            obj.watchers[name] = true;
        }
    };

    var isSuspended = function (obj, prop) {
        return obj.watchers && (obj.watchers.__wjs_suspend__ || obj.watchers["__wjs_suspend__" + prop]);
    };

    // resumes preivously suspended watchers
    var resume = function (obj, prop) {
        registerTimeout(function () {
            delete obj.watchers.__wjs_suspend__;
            delete obj.watchers["__wjs_suspend__" + prop];
        });
    };

    var pendingTimerID = null;
    var addPendingChange = function (obj, prop, mode, newval, oldval) {
        pendingChanges[pendingChanges.length] = {
            obj: obj,
            prop: prop,
            mode: mode,
            newval: newval,
            oldval: oldval
        };
        if (pendingTimerID === null) {
            pendingTimerID = setTimeout(applyPendingChanges);
        }
    };


    var applyPendingChanges = function () {
        // apply pending changes
        var change = null;
        pendingTimerID = null;
        for (var i = 0; i < pendingChanges.length; i++) {
            change = pendingChanges[i];
            callWatchers(change.obj, change.prop, change.mode, change.newval, change.oldval);
        }
        if (change) {
            pendingChanges = [];
            change = null;
        }
    };

    var loop = function () {
        // check for new or deleted props
        for (var i = 0; i < lengthsubjects.length; i++) {
            var subj = lengthsubjects[i];

            if (subj.prop === "$$watchlengthsubjectroot") {
                var difference = getObjDiff(subj.obj, subj.actual);

                if (difference.added.length || difference.removed.length) {
                    if (difference.added.length) {
                        watchMany(subj.obj, difference.added, subj.watcher, subj.level - 1, true);
                    }

                    subj.watcher.call(subj.obj, "root", "differentattr", difference, subj.actual);
                }
                subj.actual = clone(subj.obj);

            } else {
                var difference = getObjDiff(subj.obj[subj.prop], subj.actual);

                if (difference.added.length || difference.removed.length) {
                    if (difference.added.length) {
                        for (var j = 0; j < subj.obj.watchers[subj.prop].length; j++) {
                            watchMany(subj.obj[subj.prop], difference.added, subj.obj.watchers[subj.prop][j], subj.level - 1, true);
                        }
                    }

                    callWatchers(subj.obj, subj.prop, "differentattr", difference, subj.actual);
                }

                subj.actual = clone(subj.obj[subj.prop]);
            }
        }

        // start dirty check
        var n, value;
        for (var i in dirtyChecklist) {
            n = dirtyChecklist[i];
            value = n.object[n.prop];
            if (!compareValues(n.orig, value)) {
                n.orig = clone(value);
                n.callback(value);
            }
        }
    };

    var compareValues = function (a, b) {
        var i,
            state = true;
        if (a !== b) {
            if (isObject(a)) {
                for (i in a) {
                    if (!supportDefineProperty && i === "watchers") continue;
                    if (a[i] !== b[i]) {
                        state = false;
                        break;
                    };
                }
            } else {
                state = false;
            }
        }
        return state;
    };

    var pushToLengthSubjects = function (obj, prop, watcher, level) {
        var actual;

        if (prop === "$$watchlengthsubjectroot") {
            actual = clone(obj);
        } else {
            actual = clone(obj[prop]);
        }

        lengthsubjects.push({
            obj: obj,
            prop: prop,
            actual: actual,
            watcher: watcher,
            level: level
        });
    };

    var removeFromLengthSubjects = function (obj, prop, watcher) {
        for (var i = 0; i < lengthsubjects.length; i++) {
            var subj = lengthsubjects[i];

            if (subj.obj == obj && subj.prop == prop && subj.watcher == watcher) {
                lengthsubjects.splice(i, 1);
            }
        }
    };

    var removeFromDirtyChecklist = function (obj, prop) {
        var notInUse;
        for (var i = 0; i < dirtyChecklist.length; i++) {
            var n = dirtyChecklist[i];
            var watchers = n.object.watchers;
            notInUse = n.object == obj && n.prop == prop && watchers && (!watchers[prop] || watchers[prop].length == 0);
            if (notInUse) {
                dirtyChecklist.splice(i, 1);
            }
        }
    };

    setInterval(loop, 50);

    WatchJS.watch = watch;
    WatchJS.unwatch = unwatch;
    WatchJS.callWatchers = callWatchers;
    WatchJS.suspend = suspend; // suspend watchers   
    WatchJS.onChange = trackChange; // track changes made to object or  it's property and return a single change object

    return WatchJS;
});
/* not supported */

},{}],"/Volumes/StorageVol/Sites/www/EngineJS/ladders.js":[function(require,module,exports){
"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

//EngineJS is a for true light-weight, ultra-fast isomorphic "React-like" framework

var Inferno = require("./InfernoJS/Inferno.js");

var NumberBar = (function (_Inferno$Component) {
	function NumberBar() {
		_classCallCheck(this, NumberBar);

		this.type = "";
		this.barClass = "";
		this.selected = false;
		this.mouseOver = false;
		this.maxBarWidth = 0;
		this.number = 0;
		this.maxNumber = 0;
		_get(_Inferno$Component.prototype, "constructor", this).call(this);
	}

	_inherits(NumberBar, _Inferno$Component);

	_prototypeProperties(NumberBar, null, {
		onUpdate: {
			value: function onUpdate() {
				this.barClass = "numberbar-bar numberbar-bar-" + this.type;
			},
			writable: true,
			configurable: true
		},
		_getNumberBarStyle: {
			value: function _getNumberBarStyle() {
				var background, color;

				if (this.selected) {
					background = "rgb(100,100,100)";
					color = "#ffffff";
				} else if (this.mouseOver) {
					background = "rgb(200,200,200)";
					color = "";
				} else {
					background = "";
					color = "";
				}

				return {
					backgroundColor: background,
					color: color
				};
			},
			writable: true,
			configurable: true
		},
		_getBarStyle: {
			value: function _getBarStyle() {
				var ratio = this.number / this.maxNumber;
				var value = ratio * this.maxBarWidth + "px";
				var display = this.mouseOver || this.selected ? "none" : "";
				var translate = (1 - ratio) * 100;

				if (this.type === "ask") {
					translate = -translate;
				}

				return {
					display: display,
					transform: "translateX(" + translate + "%)"
				};
			},
			writable: true,
			configurable: true
		},
		initTemplate: {
			value: function initTemplate($) {
				var _this = this;
				return [["div.numberbar", { style: this._getNumberBarStyle }, ["div", { className: $.text(function (none) {
						return _this.barClass;
					}), style: this._getBarStyle }], ["div.numberbar-number", $.text(function (none) {
					return _this.number;
				})]]];
			},
			writable: true,
			configurable: true
		}
	});

	return NumberBar;
})(Inferno.Component);

var LadderRow = (function (_Inferno$Component2) {
	function LadderRow() {
		_classCallCheck(this, LadderRow);

		this.price = 0;
		_get(_Inferno$Component2.prototype, "constructor", this).call(this);
	}

	_inherits(LadderRow, _Inferno$Component2);

	_prototypeProperties(LadderRow, null, {
		initTemplate: {
			value: function initTemplate($) {
				var _this = this;


				var bidData = (function () {
					return {
						type: "bid",
						number: this.bidAmount,
						maxNumber: this.maxAmount,
						maxBarWidth: this.maxBarWidth
					};
				}).bind(this);

				var askData = (function () {
					return {
						type: "ask",
						number: this.askAmount,
						maxNumber: this.maxAmount,
						maxBarWidth: this.maxBarWidth
					};
				}).bind(this);

				return [$.render("div.ladder-cell", new NumberBar(), bidData), ["div", { className: "ladder-cell ladder-cell-price" }, $.text(function (none) {
					return _this.price;
				})], $.render("div.ladder-cell", new NumberBar(), askData)];
			},
			writable: true,
			configurable: true
		}
	});

	return LadderRow;
})(Inferno.Component);

;

var Ladder = (function (_Inferno$Component3) {
	function Ladder() {
		_classCallCheck(this, Ladder);

		this.ladderRows = ordersModel.levels.map((function (row, index) {
			return {
				ladderRow: new LadderRow(),
				props: function () {
					return {
						price: row.price,
						bidAmount: row.bidVolume,
						askAmount: row.askVolume,
						key: row.key,
						maxBarWidth: "120",
						maxAmount: ordersModel.maxVolume
					};
				}
			};
		}).bind(this));

		setInterval((function () {
			this.forceUpdate();
		}).bind(this), THROTTLE + Math.floor(Math.random() * 120) - 60);

		_get(_Inferno$Component3.prototype, "constructor", this).call(this);
	}

	_inherits(Ladder, _Inferno$Component3);

	_prototypeProperties(Ladder, null, {
		initTemplate: {
			value: function initTemplate($) {
				var _this = this;
				return [["div.ladder", ["header", "Apple (AAPL)"]], ["div.bars", $["for"](function (each) {
					return _this.ladderRows;
				}, function (ladderRow) {
					return [$.render("div.ladder-row", ladderRow.ladderRow, ladderRow.props)];
				})]];
			},
			writable: true,
			configurable: true
		}
	});

	return Ladder;
})(Inferno.Component);

var LaddersApp = (function (_Inferno$Component4) {
	function LaddersApp() {
		_classCallCheck(this, LaddersApp);

		this.ladders = [];

		for (var i = 0; i < NUMBER_OF_LADDERS; i++) {
			this.ladders.push(new Ladder());
		}

		_get(_Inferno$Component4.prototype, "constructor", this).call(this);
	}

	_inherits(LaddersApp, _Inferno$Component4);

	_prototypeProperties(LaddersApp, null, {
		initTemplate: {
			value: function initTemplate($) {
				var _this = this;
				return [["div.components", $["for"](function (each) {
					return _this.ladders;
				}, function (ladder) {
					return [$.render("div.component", ladder)];
				})]];
			},
			writable: true,
			configurable: true
		}
	});

	return LaddersApp;
})(Inferno.Component);

;

window.LaddersApp = LaddersApp;

},{"./InfernoJS/Inferno.js":"/Volumes/StorageVol/Sites/www/EngineJS/InfernoJS/Inferno.js"}]},{},["/Volumes/StorageVol/Sites/www/EngineJS/ladders.js"]);
