(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var Inferno = require("./inferno.js");
var t7 = require("t7");

t7.setOutput(t7.Outputs.Inferno);

if (typeof window != "undefined") {
  window.Inferno = Inferno;
  window.t7 = t7;
} else {
  module.exports = Inferno;
}


},{"./inferno.js":2,"t7":3}],2:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var t7 = require("t7");

var supportsTextContent = ("textContent" in document);

var events = {
  "onClick": "click"
};

var version = "0.1.2";

var cachedNodes = null;

if (typeof window != "undefined") {
  cachedNodes = {
    div: document.createElement("div"),
    span: document.createElement("span"),
    a: document.createElement("a"),
    p: document.createElement("p"),
    li: document.createElement("li"),
    tr: document.createElement("tr"),
    td: document.createElement("td")
  };
}

function ValueNode(value, valueKey) {
  //detect if the value is actually a new node tree
  if (value && value.tag != null) {
    this.isRoot = true;
  }
  //if its an array, this is due to a function returining an array (for example: a map)
  else if (value && value instanceof Array) {
    this.isRoot = true;
  }
  this.value = value;
  this.valueKey = valueKey;
}

var Inferno = {};

var Component = (function () {
  function Component(props) {
    _classCallCheck(this, Component);

    this.props = props;
    this.state = {};
  }

  _createClass(Component, [{
    key: "render",
    value: function render() {}
  }, {
    key: "forceUpdate",
    value: function forceUpdate() {}
  }, {
    key: "setState",
    value: function setState(newStateItems) {
      for (var stateItem in newStateItems) {
        this.state[stateItem] = newStateItems[stateItem];
      }
      this.forceUpdate();
    }
  }, {
    key: "replaceState",
    value: function replaceState(newState) {
      this.state = newSate;
      this.forceUpdate();
    }
  }]);

  return Component;
})();

Inferno.Component = Component;

function PrototypeComponent(props) {
  this.props = props;
  this.state = {};
  if (this.constructor) {
    this.constructor();
  }
};

PrototypeComponent.prototype.forceUpdate = function () {};

Inferno.createValueNode = function (value, valueKey) {
  return new ValueNode(value, valueKey);
};

Inferno.createClass = function (options) {
  var component = new PrototypeComponent();
  // PrototypeComponent.prototype.constructor = options.constructor;
  for (var property in options) {
    PrototypeComponent[property] = options[property];
  }
  return component;
};

Inferno.unmountComponentAtNode = function (node) {
  //TODO finish, remove events etc
  var domParent = node.rootNode[0].dom.parentNode;
  //this step below is not needed
  //domParent.removeChild(node.rootNode[0].dom);
};

Inferno.render = function (render, dom, listeners, component) {
  var rootNode = null;
  var endValue = null;
  var values = null;
  //we check if we have a root on the dom node, if not we need to build up the render
  if (component == null) {
    if (dom.rootNode == null) {
      if (typeof render === "function") {
        values = render();
        endValue = values[values.length - 1];
        rootNode = t7.getTemplateFromCache(endValue.templateKey, values, endValue.components);
      } else {
        values = render;
        endValue = render[values.length - 1];
        rootNode = t7.getTemplateFromCache(endValue.templateKey, values, endValue.components);
      }
      createNode(rootNode, null, dom, values, null, null, listeners, component);
      dom.rootNode = [rootNode];
    } else {
      if (typeof render === "function") {
        values = render();
      } else if (render.length > 0) {
        values = render;
      }
      updateNode(dom.rootNode[0], dom.rootNode, dom, values, listeners, component);
    }
  } else {
    if (component._rootNode == null) {
      values = render();
      endValue = values[values.length - 1];
      if (values) {
        rootNode = t7.getTemplateFromCache(endValue.templateKey, values, endValue.components);
        createNode(rootNode, null, dom, values, null, null, listeners, component);
        component._rootNode = [rootNode];
      }
    } else {
      values = render();
      updateNode(component._rootNode[0], component._rootNode, dom, values, 0, listeners, component);
    }
  }
  //otherwise we progress with an update
};

// TODO find solution without empty text placeholders
function emptyTextNode() {
  return document.createTextNode("");
};

function isInputProperty(tag, attrName) {
  switch (tag) {
    case "input":
      return attrName === "value" || attrName === "checked";
    case "textarea":
      return attrName === "value";
    case "select":
      return attrName === "value" || attrName === "selectedIndex";
    case "option":
      return attrName === "selected";
  }
};

function updateAttribute(domElement, name, value) {
  if (value === false || value == null) {
    domElement.removeAttribute(name);
  } else {
    if (value === true) {
      value = "";
    }
    var colonIndex = name.indexOf(":"),
        ns;
    if (colonIndex !== -1) {
      var prefix = name.substr(0, colonIndex);
      switch (prefix) {
        case "xlink":
          ns = "http://www.w3.org/1999/xlink";
          break;
      }
    }
    domElement.setAttribute(name, value);
  }
};

function setTextContent(domElement, text, update) {
  //if (text) {
  if (update && domElement.firstChild) {
    domElement.firstChild.nodeValue = text;
  } else {
    if (supportsTextContent) {
      domElement.textContent = text;
    } else {
      domElement.innerText = text;
    }
  }
};

function handleNodeAttributes(tag, domElement, attrName, attrValue) {
  if (attrName === "style") {
    updateStyle(domElement, oldAttrValue, attrs, attrValue);
  } else if (isInputProperty(tag, attrName)) {
    if (domElement[attrName] !== attrValue) {
      domElement[attrName] = attrValue;
    }
  } else if (attrName === "class") {
    domElement.className = attrValue;
  } else {
    updateAttribute(domElement, attrName, attrValue);
  }
};

function addRootDomEventListerners(domNode) {
  var listeners = {
    click: []
  };
  domNode.addEventListener("click", function (e) {
    for (var i = 0; i < listeners.click.length; i = i + 1 | 0) {
      if (listeners.click[i].target === e.target) {
        listeners.click[i].callback.call(listeners.click[i].component, e);
        //Let's take this out for now
        //listeners.click[i].component.forceUpdate();
      }
    }
  });
  return listeners;
};

//we want to build a value tree, rather than a node tree, ideally, for faster lookups
function createNode(node, parentNode, parentDom, values, index, insertAtIndex, listeners, component) {
  var i = 0,
      l = 0,
      ii = 0,
      subNode = null,
      val = null,
      textNode = null,
      hasDynamicAttrs = false,
      wasChildDynamic = false,
      rootListeners = null,
      endValue = null;

  //we need to get the actual values and the templatekey
  if (index != null) {
    endValue = values[index][values[index].length - 1];
    if (endValue.templateKey) {
      node.templateKey = endValue.templateKey;
    }
    values = values[index];
  } else {
    endValue = values[values.length - 1];
    if (endValue.templateKey) {
      node.templateKey = endValue.templateKey;
    }
  }

  if (node.component) {
    //if its a component, we make a new instance
    if (typeof node.component === "function") {
      node.component = new node.component(node.props);
      rootListeners = addRootDomEventListerners(parentDom);
      node.component.forceUpdate = Inferno.render.bind(null, node.component.render.bind(node.component), parentDom, rootListeners, node.component);
      node.component.forceUpdate();
      node.isDynamic = true;
    }
    //if this is a component
    if (node.component instanceof Component) {
      node.component.forceUpdate();
    }
    return true;
  }

  if (node.tag != null) {
    if (cachedNodes !== null && cachedNodes[node.tag]) {
      node.dom = cachedNodes[node.tag].cloneNode(false);
    } else {
      node.dom = document.createElement(node.tag);
    }
    if (!insertAtIndex) {
      parentDom.appendChild(node.dom);
    } else {
      parentDom.insertBefore(node.dom, parentDom.childNodes[insertAtIndex]);
    }
  }

  if (node.attrs != null) {
    for (i = 0; i < node.attrs.length; i = i + 1 | 0) {
      //check if the name matches an event type
      if (events[node.attrs[i].name] != null) {
        node.attrs[i].value.lastValue = values[node.attrs[i].value.valueKey];
        listeners[events[node.attrs[i].name]].push({
          target: node.dom,
          callback: node.attrs[i].value.value,
          component: component
        });
        node.hasDynamicAttrs = true;
        node.isDynamic = true;
      } else {
        //check if this is a dynamic attribute
        if (node.attrs[i].value instanceof ValueNode) {
          node.hasDynamicAttrs = true;
          node.isDynamic = true;
          //assign the last value
          node.attrs[i].value.lastValue = values[node.attrs[i].value.valueKey];
          handleNodeAttributes(node.tag, node.dom, node.attrs[i].name, node.attrs[i].value.value);
        } else {
          handleNodeAttributes(node.tag, node.dom, node.attrs[i].name, node.attrs[i].value);
        }
      }
    }
  }

  if (node.children != null) {
    if (node.children instanceof Array) {
      for (i = 0; i < node.children.length; i = i + 1 | 0) {
        if (typeof node.children[i] === "string" || typeof node.children[i] === "number" || typeof node.children[i] === "undefined") {
          textNode = document.createTextNode(node.children[i]);
          node.dom.appendChild(textNode);
        } else if (node.children[i] instanceof ValueNode) {
          node.children[i].lastValue = values[node.children[i].valueKey];
          if (node.children[i].lastValue != null && node.children[i].lastValue.templateKey != null) {
            node.children[i].templateKey = node.children[i].lastValue.templateKey;
            node.children[i].lastValue = node.children[i].lastValue.values;
          }
          node.isDynamic = true;
          node.children[i].isDynamic = true;
          //check if we're dealing with a root node
          if (node.children[i].isRoot === true) {
            node.children[i].isDynamic = true;
            if (node.children[i].value instanceof Array) {
              if (node.children[i].templateKey != null) {
                for (ii = 0; ii < node.children[i].value.length; ii = ii + 1 | 0) {
                  createNode(node.children[i].value[ii], node.children[i], node.dom, values[node.children[i].valueKey].values, ii, null, listeners, component);
                }
              } else {
                for (ii = 0; ii < node.children[i].value.length; ii = ii + 1 | 0) {
                  createNode(node.children[i].value[ii], node.children[i], node.dom, values[node.children[i].valueKey], ii, null, listeners, component);
                }
              }
            } else {
              createNode(node.children[i].value, node.children[i], node.dom, values[node.children[i].valueKey], null, null, listeners, component);
            }
          } else if (node.children[i] instanceof ValueNode) {
            node.children[i].lastValue = values[node.children[i].valueKey];
            textNode = document.createTextNode(node.children[i].lastValue);
            node.dom.appendChild(textNode);
          } else {
            textNode = document.createTextNode(node.children[i].value);
            node.dom.appendChild(textNode);
          }
        } else {
          wasChildDynamic = createNode(node.children[i], node, node.dom, values, null, null, listeners, component);
          if (wasChildDynamic === true) {
            node.children[i].isDynamic = true;
            node.isDynamic = true;
          }
        }
      }
    } else if (typeof node.children === "string") {
      textNode = document.createTextNode(node.children);
      node.dom.appendChild(textNode);
    } else if (node.children instanceof ValueNode && node.children.isRoot === true) {
      //we are on a new root node, so we'll need to go through its children and apply the values
      //based off the valueKey index
      if (node.children.value instanceof Array) {
        for (i = 0; i < node.children.value.length; i = i + 1 | 0) {
          createNode(node.children.value[i], node, node.dom, values[node.children.valueKey], i, null, listeners, component);
        }
      } else {
        createNode(node.children.value, node, node.dom, values[node.children.valueKey], null, null, listeners, component);
      }
      node.children.isDynamic = true;
      node.children.lastValue = values[node.children.valueKey];
      return true;
    } else if (node.children instanceof ValueNode) {
      //if it has a valueKey then it means that its dynamic
      node.children.lastValue = values[node.children.valueKey];
      if (typeof node.children.lastValue === "string" || typeof node.children.lastValue === "number") {
        textNode = document.createTextNode(node.children.lastValue);
        node.dom.appendChild(textNode);
      }
      node.isDynamic = true;
    }
  }

  if (!node.isDynamic) {
    return false;
  }
  return true;
};

function cloneAttrs(attrs) {
  var cloneAttrs = [];
  //TODO: need to actually do this
  return cloneAttrs;
};

function cloneNode(node, parentDom) {
  var i = 0;
  var textNode = null;
  var clonedNode = {
    tag: node.tag,
    dom: node.dom.cloneNode(false),
    attrs: cloneAttrs(node.attrs)
  };

  if (node.isDynamic === true) {
    clonedNode.isDynamic = true;
  }

  if (node.children instanceof ValueNode) {
    clonedNode.children = new ValueNode(node.children.value, node.children.valueKey);
  } else if (node.children instanceof Array) {
    clonedNode.children = [];
    //TODO: need to actually finish this
    for (i = 0; i < node.children.length; i = i + 1 | 0) {
      if (node.children[i] instanceof ValueNode) {
        textNode = document.createTextNode(node.children[i].value);
        clonedNode.dom.appendChild(textNode);
        clonedNode.children.push(new ValueNode(node.children[i].value, node.children[i].valueKey));
      } else if (typeof node.children[i] === "string" || typeof node.children[i] === "number") {
        textNode = document.createTextNode(node.children[i]);
        clonedNode.dom.appendChild(textNode);
        clonedNode.children.push(node.children[i]);
      } else {
        clonedNode.children.push(cloneNode(node.children[i], clonedNode.dom));
      }
      if (node.children[i].isDynamic === true) {
        clonedNode.children[i].isDynamic = true;
      }
    }
  } else if (typeof node.children === "string" || typeof node.children === "number") {
    textNode = document.createTextNode(node.children);
    clonedNode.dom.appendChild(textNode);
    clonedNode.children = node.children;
  }

  //append the new cloned DOM node to its parentDom
  parentDom.appendChild(clonedNode.dom);
  return clonedNode;
};

function removeNode(node, parentDom) {
  parentDom.removeChild(node.dom);
};

function updateNode(node, parentNode, parentDom, values, index, listeners, component) {
  var i = 0,
      s = 0,
      l = 0,
      val = "",
      key = "",
      length = 0,
      childNode = null,
      endValue = null;

  if (node.isDynamic === false) {
    return;
  }

  if (node.templateKey != null && values instanceof Array) {
    endValue = values[values.length - 1];
    if (node.templateKey !== endValue.templateKey) {
      //remove node
      removeNode(node, parentDom);
      //and then we want to create the new node (we can simply get it from t7 cache)
      node = t7.getTemplateFromCache(endValue.templateKey, values);
      createNode(node, parentNode, parentDom, values, null, null, listeners, component);
      parentNode[index] = node;
      node.templateKey = endValue.templateKey;
    }
  }

  //if this is a component
  if (node.component != null && node.component instanceof Component) {
    if (node.propsValueKeys) {
      for (key in node.propsValueKeys) {
        node.props[key] = values[node.propsValueKeys[key]];
      }
    }
    node.component.forceUpdate();
    return;
  }

  if (node.attrs != null && node.hasDynamicAttrs === true) {
    for (i = 0, length = node.attrs.length; i < length; i = i + 1 | 0) if (events[node.attrs[i].name] == null) {
      if (node.attrs[i].value instanceof ValueNode) {
        val = values[node.attrs[i].value.valueKey];
        if (val !== node.attrs[i].value.lastValue) {
          node.attrs[i].value.lastValue = val;
          handleNodeAttributes(node.tag, node.dom, node.attrs[i].name, val);
        }
      }
    }
  }

  if (node instanceof ValueNode && node.isRoot) {
    val = values[node.valueKey];
    if (node.value.templateKey != null) {
      endValue = val[val.length - 1];
      if (node.value.templateKey !== endValue.templateKey) {
        //we want to remove the DOM current node
        //TODO for optimisation do we want to clone this? and if possible, re-use the clone rather than
        //asking t7 for a fresh template??
        removeNode(node.value, parentDom);
        //and then we want to create the new node (we can simply get it from t7 cache)
        node.value = t7.getTemplateFromCache(endValue.templateKey, val);
        createNode(node.value, node, parentDom, val, null, index, listeners, component);
        node.value.templateKey = endValue.templateKey;
        node.lastValue = values;
      }
    }
    if (val !== node.lastValue) {
      //array of array here
      if (node.value instanceof Array) {
        for (i = 0, length = node.value.length; i < length; i = i + 1 | 0) {
          if (typeof node.value[i] !== "string" || typeof node.value[i] !== "number") {
            updateNode(node.value[i], node, parentDom, val[i], i, listeners, component);
          }
        }
      } else if (node.value.children instanceof Array) {
        for (i = 0, length = node.value.children.length; i < length; i = i + 1 | 0) {
          if (typeof node.value.children[i] !== "string" || typeof node.value.children[i] !== "number") {
            updateNode(node.value.children[i], node.value, node.value.dom, val, i, listeners, component);
          }
        }
      }
      node.lastValue = val;
    }
  } else if (node.children != null) {
    if (node.children instanceof Array) {
      for (i = 0, length = node.children.length; i < length; i = i + 1 | 0) {
        if (node.children[i].isDynamic === true) {
          if (node.children[i] instanceof ValueNode && !node.children[i].isRoot) {
            val = values[node.children[i].valueKey];
            endValue = val[val.length - 1];
            if (endValue != null && endValue.templateKey != null) {
              node.children[i].templateKey = endValue.templateKey;
              val = values;
            }
            if (val !== node.children[i].lastValue) {
              node.children[i].lastValue = val;
              //update the text
              setTextContent(node.dom.childNodes[i], val, true);
            }
          } else {
            updateNode(node.children[i], node, node.dom, values, i, listeners, component);
          }
        }
      }
    } else if (node.children instanceof ValueNode && node.children.isRoot === true) {
      //check if the value has changed
      val = values[node.children.valueKey];
      if (node.children.templateKey != null) {
        endValue = val[val.length - 1];
        if (node.children.templateKey !== endValue.templateKey) {
          //we want to remove the DOM current node
          //TODO for optimisation do we want to clone this? and if possible, re-use the clone rather than
          //asking t7 for a fresh template??
          removeNode(node.children.value, node.dom);
          //and then we want to create the new node (we can simply get it from t7 cache)
          node.children.value = t7.getTemplateFromCache(endValue.templateKey, val);
          createNode(node.children.value, node.children, node.dom, val[i], null, listeners, component);
          //then we want to set the new templatekey
          node.children.templateKey = endValue.templateKey;
          node.children.lastValue = values;
        }
      }

      if (val !== node.children.lastValue && val instanceof Array) {
        //check if the sizes have changed
        //in this case, our new array has more items so we'll need to add more children
        if (node.children.lastValue != null && val.length !== node.children.lastValue.length) {
          if (val.length > node.children.lastValue.length) {
            //easiest way to add another child is to clone the node, so let's clone the first child
            //TODO check the templates coming back have the same code?
            for (s = 0; s < val.length - node.children.lastValue.length; s = s + 1 | 0) {
              if (node.children.value.length > 0) {
                childNode = cloneNode(node.children.value[0], node.dom);
              } else {
                endValue = val[s][val[s].length - 1];
                childNode = t7.getTemplateFromCache(endValue.templateKey, val[s]);
                createNode(childNode, node, node.dom, val, null, i, listeners, component);
              }
              node.children.value.push(childNode);
            }
          } else if (val.length < node.children.lastValue.length) {
            //we need to remove the last node here (unless we add in index functionality)
            for (s = 0; s < node.children.lastValue.length - val.length; s = s + 1 | 0) {
              removeNode(node.children.value[node.children.value.length - 1], node.dom);
              node.children.value.pop();
            }
          }
        }
        for (i = 0, length = node.children.value.length; i < length; i = i + 1 | 0) {
          if (typeof node.children.value[i] === "object") {
            updateNode(node.children.value[i], node.children.value, node.dom, val[i], i, listeners, component);
          }
        }
        node.children.lastValue = val;
      }
    } else if (node.children instanceof ValueNode) {
      val = values[node.children.valueKey];
      if (node.templateKey != null && val instanceof Array) {
        endValue = val[val.length - 1];
        if (node.templateKey !== endValue.templateKey) {
          node.templateKey = endValue.templateKey;
          val = values;
        }
      }
      if (val !== node.children.lastValue) {
        node.children.lastValue = val;
        if (typeof val === "string" || typeof val === "number" || val instanceof Date) {
          setTextContent(node.dom, val, true);
        }
      }
    }
  }
};

module.exports = Inferno;


},{"t7":3}],3:[function(require,module,exports){
/*

  t7.js is a small, lightweight library for compiling ES2015 template literals
  into virtual DOM objects.

  By Dominic Gannaway

*/

var t7 = (function() {
  "use strict";

  //we store created functions in the cache (key is the template string)
  var isBrowser = typeof window != "undefined" && document != null;
  var docHead = null;
  //to save time later, we can pre-create a props object structure to re-use
  var output = null;
  var selfClosingTags = [];
  var precompile = false;
  var version = "0.2.18";

  if(isBrowser === true) {
    docHead = document.getElementsByTagName('head')[0];
  }

  selfClosingTags = [
    'area',
    'base',
    'br',
    'col',
    'command',
    'embed',
    'hr',
    'img',
    'input',
    'keygen',
    'link',
    'meta',
    'param',
    'source',
    'track',
    'wbr'
  ];

  //when creating a new function from a vdom, we'll need to build the vdom's children
  function buildUniversalChildren(root, tagParams, childrenProp, component) {
    var childrenText = [];
    var i = 0;
    var n = 0;
    var key = "";
    var matches = null;

    //if the node has children that is an array, handle it with a loop
    if(root.children != null && root.children instanceof Array) {
      for(i = 0, n = root.children.length; i < n; i++) {
        if(root.children[i] != null) {
          if(typeof root.children[i] === "string") {
            root.children[i] = root.children[i].replace(/(\r\n|\n|\r)/gm,"");
            matches = root.children[i].match(/__\$props__\[\d*\]/g);
            if(matches !== null) {
              if(output === t7.Outputs.Inferno) {
                //let's see if we can get all the placeholder values and their keys
                root.children[i] = root.children[i].replace(/(__\$props__\[([0-9]*)\])/g, "Inferno.createValueNode($1,$2),")
                if(root.children[i].substring(root.children[i].length - 1) === ",") {
                  root.children[i] = root.children[i].substring(0, root.children[i].length - 1);
                }
                childrenText.push(root.children[i]);
              } else {
                childrenText.push(root.children[i]);
              }
            } else {
              childrenText.push("'" + root.children[i] + "'");
            }
          } else {
            buildFunction(root.children[i], childrenText, component)
          }
        }
      }
      //push the children code into our tag params code
      if(childrenText.length === 1) {
        tagParams.push((childrenProp ? "children: " : "") + childrenText);
      } else {
        tagParams.push((childrenProp ? "children: " : "") + "[" + childrenText.join(",") + "]");
      }

    } else if(root.children != null && typeof root.children === "string") {
      root.children = root.children.replace(/(\r\n|\n|\r)/gm,"").trim();
      //this ensures its a prop replacement
      matches = root.children.match(/__\$props__\[\d*\]/g);
      //find any template strings and replace them
      if(matches !== null) {
        if(output === t7.Outputs.Inferno) {
          root.children = root.children.replace(/(__\$props__\[([0-9]*)\])/g, "Inferno.createValueNode($1,$2),")
        } else {
          root.children = root.children.replace(/(__\$props__\[.*\])/g, "',$1,'")
        }
      }
      //if the last two characters are ,', replace them with nothing
      if(root.children.substring(root.children.length - 2) === ",'") {
        root.children = root.children.substring(0, root.children.length - 2);
        tagParams.push((childrenProp ? "children: " : "") + "['" + root.children + "]");
      } else {
        tagParams.push((childrenProp ? "children: " : "") + "['" + root.children + "']");
      }
    }
  };

  //when creating a new function from a vdom, we'll need to build the vdom's children
  function buildReactChildren(root, tagParams, childrenProp, component) {
    var childrenText = [];
    var i = 0;
    var n = 0;
    var matches = null;

    //if the node has children that is an array, handle it with a loop
    if(root.children != null && root.children instanceof Array) {
      //we're building an array in code, so we need an open bracket
      for(i = 0, n = root.children.length; i < n; i++) {
        if(root.children[i] != null) {
          if(typeof root.children[i] === "string") {
            root.children[i] = root.children[i].replace(/(\r\n|\n|\r)/gm,"");
            matches = root.children[i].match(/__\$props__\[\d*\]/g);
            if(matches != null) {
              root.children[i] = root.children[i].replace(/(__\$props__\[[0-9]*\])/g, "$1")
              if(root.children[i].substring(root.children[i].length - 1) === ",") {
                root.children[i] = root.children[i].substring(0, root.children[i].length - 1);
              }
              childrenText.push(root.children[i]);
            } else {
              childrenText.push("'" + root.children[i] + "'");
            }

          } else {
            buildFunction(root.children[i], childrenText, i === root.children.length - 1, component)
          }
        }
      }
      //push the children code into our tag params code
      if(childrenText.length > 0) {
        tagParams.push(childrenText.join(","));
      }

    } else if(root.children != null && typeof root.children === "string") {
      root.children = root.children.replace(/(\r\n|\n|\r)/gm,"");
      tagParams.push("'" + root.children + "'");
    }
  };

  function buildAttrsParams(root, attrsParams) {
    var val = '';
    var matches = null;
    for(var name in root.attrs) {
      val = root.attrs[name];
      matches = val.match(/__\$props__\[\d*\]/g);
      if(matches === null) {
        attrsParams.push("'" + name + "':'" + val + "'");
      } else {
        attrsParams.push("'" + name + "':" + val);
      }
    }
  };

  function buildAttrsValueKeysParams(root, attrsParams) {
    var val = '';
    var matches = null;
    for(var name in root.attrs) {
      val = root.attrs[name];
      matches = val.match(/__\$props__\[\d*\]/g);
      if(matches !== null) {
        attrsParams.push("'" + name + "':" + val.replace(/(__\$props__\[([0-9]*)\])/g, "$2"));
      }
    }
  };

  function buildInfernoAttrsParams(root, attrsParams) {
    var val = '', key = "";
    var matches = null;
    for(var name in root.attrs) {
      val = root.attrs[name];
      matches = val.match(/__\$props__\[\d*\]/g);
      if(matches === null) {
        attrsParams.push("{name:'" + name + "',value:'" + val + "'}");
      } else {
        attrsParams.push("{name:'" + name + "',value:" + val.replace(/(__\$props__\[([0-9]*)\])/g, "Inferno.createValueNode($1,$2)") + "}");
      }
    }
  };

  function isComponentName(tagName) {
    if(tagName[0] === tagName[0].toUpperCase()) {
      return true;
    }
    return false;
  };

  //This takes a vDom array and builds a new function from it, to improve
  //repeated performance at the cost of building new Functions()
  function buildFunction(root, functionText, component) {
    var i = 0;
    var tagParams = [];
    var literalParts = [];
    var attrsParams = [];
    var attrsValueKeysParams = [];

    if(root instanceof Array) {
      //throw error about adjacent elements
    } else {
      //Universal output or Inferno output
      if(output === t7.Outputs.Universal || output === t7.Outputs.Inferno || output === t7.Outputs.Mithril) {
        //if we have a tag, add an element, check too for a component
        if(root.tag != null) {
          if(isComponentName(root.tag) === false) {
            functionText.push("{tag: '" + root.tag + "'");
            //add the key
            if(root.key != null) {
              tagParams.push("key: " + root.key);
            }
            //build the attrs
            if(root.attrs != null) {
              if(output === t7.Outputs.Inferno) {
                buildInfernoAttrsParams(root, attrsParams);
                tagParams.push("attrs: [" + attrsParams.join(',') + "]");
              } else {
                buildAttrsParams(root, attrsParams);
                tagParams.push("attrs: {" + attrsParams.join(',') + "}");
              }
            }
            //build the children for this node
            buildUniversalChildren(root, tagParams, true, component);
            functionText.push(tagParams.join(',') + "}");
          } else {
            if(((typeof window != "undefined" && component === window) || component == null) && precompile === false) {
              throw new Error("Error referencing component '" + root.tag + "'. Components can only be used when within modules. See documentation for more information on t7.module().");
            }
            if(output === t7.Outputs.Universal) {
              //we need to apply the tag components
              buildAttrsParams(root, attrsParams);
              functionText.push("__$components__." + root.tag + "({" + attrsParams.join(',') + "})");
            } else if(output === t7.Outputs.Mithril) {
              //we need to apply the tag components
              buildAttrsParams(root, attrsParams);
              functionText.push("m.component(__$components__." + root.tag + ",{" + attrsParams.join(',') + "})");
            } else if(output === t7.Outputs.Inferno) {
              //we need to apply the tag components
              buildAttrsParams(root, attrsParams);
              buildAttrsValueKeysParams(root, attrsValueKeysParams);
              functionText.push("{component:__$components__." + root.tag + ", props: {" + attrsParams.join(',') + "}, propsValueKeys: {" + attrsValueKeysParams.join(",") + "}}");
            }
          }
        } else {
          //add a text entry
          functionText.push("'" + root + "'");
        }
      }
      //React output
      else if(output === t7.Outputs.React) {
        //if we have a tag, add an element
        if(root.tag != null) {
          //find out if the tag is a React componenet
          if(isComponentName(root.tag) === true) {
            if(((typeof window != "undefined" && component === window) || component == null) && precompile === false) {
              throw new Error("Error referencing component '" + root.tag + "'. Components can only be used when within modules. See documentation for more information on t7.module().");
            }
            functionText.push("React.createElement(__$components__." + root.tag);
          } else {
            functionText.push("React.createElement('" + root.tag + "'");
          }
          //the props/attrs
          if(root.attrs != null) {
            buildAttrsParams(root, attrsParams);
            //add the key
            if(root.key != null) {
              attrsParams.push("'key':" + root.key);
            }
            tagParams.push("{" + attrsParams.join(',') + "}");
          } else {
            tagParams.push("null");
          }
          //build the children for this node
          buildReactChildren(root, tagParams, true, component);
          functionText.push(tagParams.join(',') + ")");
        } else {
          //add a text entry
          root = root.replace(/(\r\n|\n|\r)/gm,"\\n");
          functionText.push("'" + root + "'");
        }
      }
    }
  };

  function handleChildTextPlaceholders(childText, parent, onlyChild) {
    var i = 0;
    var parts = childText.split(/(__\$props__\[\d*\])/g)
    for(i = 0; i < parts.length; i++) {
      if(parts[i].trim() !== "") {
        //set the children to this object
        parent.children.push(parts[i]);
      }
    }
    childText = null;

    return childText;
  };

  function replaceQuotes(string) {
    // string = string.replace(/'/g,"\\'")
    if(string.indexOf("'") > -1) {
      string = string.replace(/'/g,"\\'")
    }
    return string;
  };

  function applyValues(string, values) {
    var index = 0;
    var re = /__\$props__\[([0-9]*)\]/;
    var placeholders = string.match(/__\$props__\[([0-9]*)\]/g);
    for(var i = 0; i < placeholders.length; i++) {
      index = re.exec(placeholders[i])[1];
      string = string.replace(placeholders[i], values[index]);
    }
    return string;
  };

  function getVdom(html, values) {
    var char = '';
    var lastChar = '';
    var i = 0;
    var n = 0;
    var root = null;
    var insideTag = false;
    var tagContent = '';
    var tagName = '';
    var vElement = null;
    var childText = '';
    var parent = null;
    var tagData = null;
    var skipAppend = false;
    var newChild = null;

    for(i = 0, n = html.length; i < n; i++) {
      //set the char to the current character in the string
      char = html[i];
      if (char === "<") {
        insideTag = true;
      } else if(char === ">" && insideTag === true) {
        //check if first character is a close tag
        if(tagContent[0] === "/") {
          //bad closing tag
          if(tagContent !== "/" + parent.tag && selfClosingTags.indexOf(parent.tag) === -1 && !parent.closed) {
            console.error("Template error: " + applyValues(html, values));
            throw new Error("Expected corresponding t7 closing tag for '" + parent.tag + "'.");
          }
          //when the childText is not empty
          if(childText.trim() !== "") {
            //escape quotes etc
            childText = replaceQuotes(childText);
            //check if childText contains one of our placeholders
            childText = handleChildTextPlaceholders(childText, parent, true);
            if(childText !== null && parent.children.length === 0) {
              parent.children = childText;
            } else if (childText != null) {
              parent.children.push(childText);
            }
          }
          //move back up the vDom tree
          parent = parent.parent;
          if(parent) {
            parent.closed = true;
          }
        } else {
          //check if we have any content in the childText, if so, it was a text node that needs to be added
          if(childText.trim().length > 0 && !(parent instanceof Array)) {
            //escape quotes etc
            childText = replaceQuotes(childText);
            //check the childtext for placeholders
            childText = handleChildTextPlaceholders(
              childText.replace(/(\r\n|\n|\r)/gm,""),
              parent
            );
            parent.children.push(childText);
            childText = "";
          }
          //check if there any spaces in the tagContent, if not, we have our tagName
          if(tagContent.indexOf(" ") === -1) {
            tagData = {};
            tagName = tagContent;
          } else {
            //get the tag data via the getTagData function
            tagData = getTagData(tagContent);
            tagName = tagData.tag;
          }
          //now we create out vElement
          vElement = {
            tag: tagName,
            attrs: (tagData && tagData.attrs) ? tagData.attrs : {},
            children: [],
            closed: tagContent[tagContent.length - 1] === "/" || selfClosingTags.indexOf(tagName) > -1 ? true : false
          };

          if(tagData && tagData.key) {
            vElement.key = tagData.key;
          }
          //push the node we've constructed to the relevant parent
          if(parent === null) {
            if(root === null) {
              root = parent = vElement;
            } else {
              throw new Error("t7 templates must contain only a single root element");
            }
          } else if (parent instanceof Array) {
            parent.push(vElement);
          } else {
            parent.children.push(vElement);
          }
          if(selfClosingTags.indexOf(tagName) === -1 ) {
            //set our node's parent to our current parent
            if(parent === vElement) {
              vElement.parent = null;
            } else {
              vElement.parent = parent;
            }
            //now assign the parent to our new node
            parent = vElement;
          }
        }
        //reset our flags and strings
        insideTag = false;
        tagContent = '';
        childText = '';
      } else if (insideTag === true) {
        tagContent += char;
        lastChar = char;
      } else {
        childText += char;
        lastChar = char;
      }
    }
    //return the root (our constructed vDom)
    return root;
  }

  function getTagData(tagText) {
    var parts = [];
    var char = '';
    var lastChar = '';
    var i = 0;
    var s = 0;
    var n = 0;
    var n2 = 0;
    var currentString = '';
    var inQuotes = false;
    var attrParts = [];
    var attrs = {};
    var key = '';

    //build the parts of the tag
    for(i = 0, n = tagText.length; i < n; i++) {
      char = tagText[i];

      if(char === " " && inQuotes === false) {
        parts.push(currentString);
        currentString = '';
      } else if(char === "'") {
        if(inQuotes === false) {
          inQuotes = true;
        } else {
          inQuotes = false;
          parts.push(currentString);
          currentString = '';
        }
      } else if(char === '"') {
        if(inQuotes === false) {
          inQuotes = true;
        } else {
          inQuotes = false;
          parts.push(currentString);
          currentString = '';
        }
      } else {
        currentString += char;
      }
    }

    if(currentString !== "") {
      parts.push(currentString);
    }
    currentString = '';

    //loop through the parts of the tag
    for(i = 1, n = parts.length; i < n; i++) {
      attrParts = [];
      lastChar= '';
      currentString = '';

      for(s = 0, n2 = parts[i].length; s < n2; s++) {
        char = parts[i][s];

        //if the character is =, then we're able to split the attribute name and value
        if(char === "=") {
          attrParts.push(currentString);
          currentString = '';
        } else {
          currentString += char;
          lastChar = char;
        }
      }

      if(currentString != "") {
        attrParts.push(currentString);
      }
      if(attrParts.length > 1) {
        var matches = attrParts[1].match(/__\$props__\[\d*\]/g);
        if(matches !== null) {
          attrs[attrParts[0]] = attrParts[1];
        } else {
          if(attrParts[0] === "key") {
            key = attrParts[1];
          } else {
            attrs[attrParts[0]] = attrParts[1];
          }
        }
      }
    }

    //return the attributes and the tag name
    return {
      tag: parts[0],
      attrs: attrs,
      key: key
    }
  };

  function addNewScriptFunction(scriptString, templateKey) {
    var funcCode = scriptString + '\n//# sourceURL=' + templateKey;
    var scriptElement = document.createElement('script');
    scriptElement.textContent = funcCode;
    docHead.appendChild(scriptElement);
  }

  function createTemplateKey(tpl) {
    var hash = 0, i, chr, len;
    if (tpl.length == 0) return tpl;
    for (i = 0, len = tpl.length; i < len; i++) {
      chr   = tpl.charCodeAt(i);
      hash  = ((hash << 5) - hash) + chr;
      hash |= 0;
    }
    return hash;
  };

  //main t7 compiling function
  function t7(template) {
    var fullHtml = null;
    var i = 1;
    var n = arguments.length;
    var functionString = null;
    var scriptString = null;
    var scriptCode = "";
    var templateKey = null;
    var tpl = template[0];
    var returnValuesButBuildTemplate = false;
    var values = [].slice.call(arguments, 1);

    //build the template string
    for(; i < n; i++) {
      tpl += template[i];
    };
    //set our unique key
    templateKey = createTemplateKey(tpl);
    //For values only, return an array of all the values
    if(output === t7.Outputs.Inferno) {
      if(t7._cache[templateKey] != null) {
        values.push({templateKey: templateKey, components: this});
        return values;
      } else {
        returnValuesButBuildTemplate = true;
      }
    }
    //check if we have the template in cache
    if(t7._cache[templateKey] == null) {
      fullHtml = '';
      //put our placeholders around the template parts
      for(i = 0, n = template.length; i < n; i++) {
        if(i === template.length - 1) {
          fullHtml += template[i];
        } else {
          fullHtml += template[i] + "__$props__[" + i + "]";
        }
      }
      //once we have our vDom array, build an optimal function to improve performance
      functionString = [];
      buildFunction(
        //build a vDom from the HTML
        getVdom(fullHtml, values),
        functionString,
        this
      );
      scriptCode = functionString.join(',');
      //build a new Function and store it depending if on node or browser
      if(precompile === true) {
        return {
          templateKey: templateKey,
          template: 'return ' + scriptCode
        }
      } else {
        if(isBrowser === true) {
          scriptString = 't7._cache["' + templateKey + '"]=function(__$props__, __$components__)';
          scriptString += '{"use strict";return ' + scriptCode + '}';

          addNewScriptFunction(scriptString, templateKey);
        } else {
          t7._cache[templateKey] = new Function('"use strict";var __$props__ = arguments[0];var __$components__ = arguments[1];return ' + scriptCode);
        }
      }
    }

    if(returnValuesButBuildTemplate === true) {
      values.push({templateKey: templateKey, components: this});
      return values;
    }
    return t7._cache[templateKey](values, this);
  };

  function deepCopy(obj) {
    if (typeof obj == 'object') {
      if (obj instanceof Array) {
        var l = obj.length;
        var r = new Array(l);
        for (var i = 0; i < l; i++) {
          r[i] = deepCopy(obj[i]);
        }
        return r;
      } else if(obj != null) {
        var r = {};
        r.prototype = obj.prototype;
        for (var k in obj) {
          r[k] = deepCopy(obj[k]);
        }
        return r;
      }
    }
    return obj;
  }

  var ARRAY_PROPS = {
    length: 'number',
    sort: 'function',
    slice: 'function',
    splice: 'function'
  };

  function cleanValues(values, newValues) {
    var i = 0, ii = 0, val = null, endVal = null;
    for(i = 0; i < values.length; i = i + 1 | 0) {
      val = values[i];
      if(val instanceof Array && val.length > 0) {
        endVal = val[val.length - 1];
        if(endVal.templateKey != null) {
          newValues[i] = t7.getTemplateFromCache(endVal.templateKey, val);
        } else {
          newValues[i] = [];
          cleanValues(values[i], newValues[i]);
        }
      } else {
        newValues[i] = val;
      }
    }
  };

  t7._cache = {};

  t7.Outputs = {
    React: 1,
    Universal: 2,
    Inferno: 3,
    Mithril: 4
  };

  t7.getOutput = function() {
    return output;
  };

  t7.setPrecompile = function(val) {
    precompile = val;
  };

  t7.getVersion = function() {
    return version;
  };

  //a lightweight flow control function
  //expects truthy and falsey to be functions
  t7.if = function(expression, truthy) {
    if(expression) {
      return {
        else: function() {
          return truthy();
        }
      };
    } else {
      return {
        else: function(falsey) {
          return falsey();
        }
      }
    }
  },

  t7.setOutput = function(newOutput) {
    output = newOutput;
  };

  t7.clearCache = function() {
    t7._cache = {};
  };

  t7.assign = function(compName) {
    throw new Error("Error assigning component '" + compName+ "'. You can only assign components from within a module. Please check documentation for t7.module().");
  };

  t7.module = function(callback) {
    var components = {};

    var instance = function() {
      return t7.apply(components, arguments);
    };

    instance.assign = function(name, val) {
      if(arguments.length === 2) {
        components[name] = val;
      } else {
        for(var key in name) {
          components[key] = name[key];
        }
      }
    };

    instance.if = t7.if;
    instance.Outputs = t7.Outputs;
    instance.clearCache = t7.clearCache;
    instance.setOutput = t7.setOutput;
    instance.getOutput = t7.getOutput;
    instance.precompile = function(values) {
      return t7.precompile(values, components);
    };

    callback(instance);
  };

  t7.precompile = function(values, components) {
    var endVal = values[values.length - 1];
    if(t7._cache[endVal.templateKey] == null) {
      t7._cache[endVal.templateKey] = endVal.template;
    }
    if(output === t7.Outputs.Inferno) {
      endVal.components = components;
      return values
    } else {
      return t7.getTemplateFromCache(endVal.templateKey, values, components);
    }
  };

  t7.getTemplateFromCache = function(templateKey, values, components) {
    //we need to normalie the values so we don't have objects with templateKey and values
    var newValues = []
    if(values.length > 1) {
      cleanValues(values, newValues);
    } else {
      newValues = values;
    }
    return t7._cache[templateKey](newValues, components);
  };

  //set the type to React as default if it exists in global scope
  output = typeof React != "undefined" ? t7.Outputs.React
    : typeof Inferno != "undefined" ? t7.Outputs.Inferno : t7.Outputs.Universal;

  return t7;
})();

if(typeof module != "undefined" && module.exports != null) {
  module.exports = t7;
}

},{}]},{},[1]);
