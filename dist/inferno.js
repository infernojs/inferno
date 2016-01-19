/*!
 * inferno v0.5.17
 * (c) 2016 Dominic Gannaway
 * Released under the MPL-2.0 License.
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.Inferno = factory());
}(this, function () { 'use strict';

  var babelHelpers = {};
  babelHelpers.typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
  };
  babelHelpers;

  function Storage(iterable) {
  	var _items = [];
  	var _keys = [];
  	var _values = [];

  	return Object.create(Storage.prototype, {

  		get: {
  			value: function value(key) {
  				var index = [].indexOf.call(_keys, key); // TODO: is this preferred over: _keys.indexOf(key)
  				return _values[index] || undefined;
  			}
  		},
  		set: {
  			value: function value(key, _value) {
  				// check if key exists and overwrite

  				var index = [].indexOf.call(_keys, key); // TODO: is this preferred over: _keys.indexOf(key)
  				if (index > -1) {
  					_items[index][1] = _value;
  					_values[index] = _value;
  				} else {
  					_items.push([key, _value]);
  					_keys.push(key);
  					_values.push(_value);
  				}
  			}
  		}
  	});
  }

  var isArray = (function (x) {
    return x.constructor === Array;
  })

  var isVoid = (function (x) {
    return x === null || x === undefined;
  })

  var ObjectTypes = {
  	VARIABLE: 1
  };

  function createVariable(index) {
  	return {
  		index: index,
  		type: ObjectTypes.VARIABLE
  	};
  }

  function scanTreeForDynamicNodes(node, nodeMap) {
  	var nodeIsDynamic = false;
  	var dynamicFlags = {
  		NODE: false,
  		TEXT: false,
  		ATTRS: false, // attrs can also be an object
  		CHILDREN: false,
  		KEY: false,
  		COMPONENTS: false
  	};

  	if (isVoid(node)) {
  		return false;
  	}
  	if (node.type === ObjectTypes.VARIABLE) {
  		nodeIsDynamic = true;
  		dynamicFlags.NODE = true;
  	} else {
  		if (!isVoid(node)) {
  			if (!isVoid(node.tag)) {
  				if (babelHelpers.typeof(node.tag) === 'object') {
  					if (node.tag.type === ObjectTypes.VARIABLE) {
  						nodeIsDynamic = true;
  						dynamicFlags.COMPONENTS = true;
  					} else {
  						throw Error('Inferno Error: Incorrect tag name passed. Tag name must be a reference to a component, function or string.');
  					}
  				}
  			}
  			if (!isVoid(node.text)) {
  				if (node.text.type === ObjectTypes.VARIABLE) {
  					nodeIsDynamic = true;
  					dynamicFlags.TEXT = true;
  				}
  			}
  			if (!isVoid(node.attrs)) {
  				if (node.attrs.type === ObjectTypes.VARIABLE) {
  					nodeIsDynamic = true;
  					dynamicFlags.ATTRS = true;
  				} else {
  					for (var attr in node.attrs) {
  						var attrVal = node.attrs[attr];

  						if (!isVoid(attrVal) && attrVal.type === ObjectTypes.VARIABLE) {
  							if (attr === 'xmlns') {
  								throw Error('Inferno Error: The \'xmlns\' attribute cannot be dynamic. Please use static value for \'xmlns\' attribute instead.');
  							}
  							if (dynamicFlags.ATTRS === false) {
  								dynamicFlags.ATTRS = {};
  							}
  							dynamicFlags.ATTRS[attr] = attrVal.index;
  							nodeIsDynamic = true;
  						}
  					}
  				}
  			}
  			if (!isVoid(node.children)) {
  				if (node.children.type === ObjectTypes.VARIABLE) {
  					nodeIsDynamic = true;
  				} else {
  					if (isArray(node.children)) {
  						for (var i = 0; i < node.children.length; i++) {
  							var childItem = node.children[i];
  							var result = scanTreeForDynamicNodes(childItem, nodeMap);

  							if (result === true) {
  								nodeIsDynamic = true;
  								dynamicFlags.CHILDREN = true;
  							}
  						}
  					} else if ((typeof node === 'undefined' ? 'undefined' : babelHelpers.typeof(node)) === 'object') {
  						var result = scanTreeForDynamicNodes(node.children, nodeMap);

  						if (result === true) {
  							nodeIsDynamic = true;
  							dynamicFlags.CHILDREN = true;
  						}
  					}
  				}
  			}
  			if (!isVoid(node.key)) {
  				if (node.key.type === ObjectTypes.VARIABLE) {
  					nodeIsDynamic = true;
  					dynamicFlags.KEY = true;
  				}
  			}
  		}
  	}
  	if (nodeIsDynamic === true) {
  		nodeMap.set(node, dynamicFlags);
  	}
  	return nodeIsDynamic;
  }

  // Date.now() is the slowest thing on earth
  // http://jsperf.com/math-random-vs-date-now-vs-new-date/4
  var uniqueId = Date.now();

  /*
   let UUID = (function() {
   var self = {};
   var lut = []; for (var i=0; i<256; i++) { lut[i] = (i<16?'0':'')+(i).toString(16); }
   self.generate = function() {
   var d0 = Math.random()*0xffffffff|0;
   var d1 = Math.random()*0xffffffff|0;
   var d2 = Math.random()*0xffffffff|0;
   var d3 = Math.random()*0xffffffff|0;
   return lut[d0&0xff]+lut[d0>>8&0xff]+lut[d0>>16&0xff]+lut[d0>>24&0xff]+'-'+
   lut[d1&0xff]+lut[d1>>8&0xff]+'-'+lut[d1>>16&0x0f|0x40]+lut[d1>>24&0xff]+'-'+
   lut[d2&0x3f|0x80]+lut[d2>>8&0xff]+'-'+lut[d2>>16&0xff]+lut[d2>>24&0xff]+
   lut[d3&0xff]+lut[d3>>8&0xff]+lut[d3>>16&0xff]+lut[d3>>24&0xff];
   }
   return self;
   })();
   let uniqueId = UUID.generate();
   */
  var treeConstructors = {};
  function addTreeConstructor(name, treeConstructor) {
  	treeConstructors[name] = treeConstructor;
  }

  function applyTreeConstructors(schema, dynamicNodeMap) {
  	var tree = {};

  	for (var treeConstructor in treeConstructors) {
  		tree[treeConstructor] = treeConstructors[treeConstructor](schema, true, dynamicNodeMap);
  	}
  	return tree;
  }

  function createTemplate(callback) {
  	if (typeof callback === 'function') {
  		var construct = callback.construct || null;

  		if (isVoid(construct)) {
  			(function () {
  				var callbackLength = callback.length;
  				var callbackArguments = new Array(callbackLength);

  				for (var i = 0; i < callbackLength; i++) {
  					callbackArguments[i] = createVariable(i);
  				}
  				var schema = callback.apply(undefined, callbackArguments);
  				var dynamicNodeMap = new Map() || new Storage();

  				scanTreeForDynamicNodes(schema, dynamicNodeMap);
  				var tree = applyTreeConstructors(schema, dynamicNodeMap);
  				var key = schema.key;
  				var keyIndex = key ? key.index : -1;

  				switch (callbackLength) {
  					case 0:
  						construct = function construct() {
  							return {
  								parent: null,
  								tree: tree,
  								id: uniqueId++,
  								key: null,
  								nextItem: null,
  								rootNode: null
  							};
  						};
  						break;
  					case 1:
  						construct = function construct(v0) {
  							var key = undefined;

  							if (keyIndex === 0) {
  								key = v0;
  							}
  							return {
  								parent: null,
  								tree: tree,
  								id: uniqueId++,
  								key: key,
  								nextItem: null,
  								rootNode: null,
  								v0: v0
  							};
  						};
  						break;
  					case 2:
  						construct = function construct(v0, v1) {
  							var key = undefined;

  							if (keyIndex === 0) {
  								key = v0;
  							} else if (keyIndex === 1) {
  								key = v1;
  							}
  							return {
  								parent: null,
  								tree: tree,
  								id: uniqueId++,
  								key: key,
  								nextItem: null,
  								rootNode: null,
  								v0: v0,
  								v1: v1
  							};
  						};
  						break;
  					default:
  						construct = function construct(v0, v1) {
  							for (var _len = arguments.length, values = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
  								values[_key - 2] = arguments[_key];
  							}

  							var key = undefined;

  							if (keyIndex === 0) {
  								key = v0;
  							} else if (keyIndex === 1) {
  								key = v1;
  							} else if (keyIndex > 1) {
  								key = values[keyIndex];
  							}
  							return {
  								parent: null,
  								tree: tree,
  								id: uniqueId++,
  								key: key,
  								nextItem: null,
  								rootNode: null,
  								v0: v0,
  								v1: v1,
  								values: values
  							};
  						};
  						break;
  				}
  				if (!isVoid(construct)) {
  					callback.construct = construct;
  				}
  			})();
  		}

  		return construct;
  	}
  }

  function createElement(tag, attrs) {
  	if (tag) {
  		var vNode = {
  			tag: tag
  		};

  		if (attrs) {
  			if (attrs.key !== undefined) {
  				vNode.key = attrs.key;
  				delete attrs.key;
  			}
  			vNode.attrs = attrs;
  		}

  		for (var _len = arguments.length, children = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
  			children[_key - 2] = arguments[_key];
  		}

  		if (children.length) {
  			vNode.children = children;
  		}
  		return vNode;
  	} else {
  		return {
  			text: tag
  		};
  	}
  }

  var TemplateFactory = {
  	createElement: createElement
  };

  var index = {
  	createTemplate: createTemplate,
  	TemplateFactory: TemplateFactory,
  	addTreeConstructor: addTreeConstructor
  };

  return index;

}));