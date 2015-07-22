(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var Inferno = require("./inferno.js");
var t7 = require("../t7");

t7.setOutput(t7.Outputs.Inferno);

if (typeof window != "undefined") {
  window.Inferno = Inferno;
  window.t7 = t7;
} else {
  module.exports = Inferno;
}


},{"../t7":3,"./inferno.js":2}],2:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var t7 = require("../t7");

t7.setValuesOnly(true);

var supportsTextContent = ("textContent" in document);

var events = {
  "onClick": "click"
};

var userAgent = navigator.userAgent,
    isWebKit = userAgent.indexOf("WebKit") !== -1,
    isFirefox = userAgent.indexOf("Firefox") !== -1,
    isTrident = userAgent.indexOf("Trident") !== -1;

var version = "0.1.2";

var cachedNodes = null;
var rootlisteners = {
  click: []
};
var initialisedListeners = false;

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
} else {
  //we can't add listeners if we're not in the dom
  rootlisteners = null;
}

function addRootDomEventListerners() {
  if (rootlisteners !== null && initialisedListeners === false) {
    initialisedListeners = true;
    document.addEventListener("click", function (e) {
      for (var i = 0; i < rootlisteners.click.length; i = i + 1 | 0) {
        if (rootlisteners.click[i].target === e.target) {
          rootlisteners.click[i].callback.call(rootlisteners.click[i].component || null, e);
          //Let's take this out for now
          //listeners.click[i].component.forceUpdate();
        }
      }
    });
  }
};

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

Inferno.tearDown = function (root) {
  //TODO finish, remove events etc
  //removeNode(node.rootNode[0]);
  // if(node.dom) {
  //   node.dom.removeChild(node.node[0].dom);
  // } else {
  //   node.rootNode[0].dom.innerHTML = "";
  //   node.rootNode = null;
  // }
  var domParent = root.dom.parentNode;
  removeChild(domParent, root);
  root = null;
};

function norm(node, oldNode) {
  var type = typeof node;
  if (type === "string") {
    node = { tag: "#", children: node };
  } else if (type === "function") {
    oldNode = node;
    node = node();
    node.construct = oldNode;
    node = node === undefined ? oldNode : norm(node, oldNode);
  }
  return node;
}

function normIndex(children, i, oldChild) {
  var origChild = children[i],
      child = norm(origChild, oldChild);
  if (origChild !== child) {
    children[i] = child;
  }
  return child;
}

function normOnly(node, origChild, oldChild) {
  var child = norm(origChild, oldChild);
  if (origChild !== child && node) {
    node.children = child;
  }
  return child;
}

function insertChild(domParent, domNode, nextChild, replace) {
  if (nextChild) {
    var domNextChild = nextChild.dom;
    if (replace) {
      var domLength = nextChild.domLength || 1;
      if (domLength === 1) {
        destroyNode(nextChild);
        domParent.replaceChild(domNode, domNextChild);
      } else {
        domParent.insertBefore(domNode, domNextChild);
        removeChild(domParent, nextChild);
      }
    } else {
      domParent.insertBefore(domNode, domNextChild);
    }
  } else {
    domParent.appendChild(domNode);
  }
}

function isString(value) {
  return typeof value === "string";
}

function isArray(value) {
  return value instanceof Array;
}

function isFunction(value) {
  return typeof value === "function";
}

function getOnlyChild(children, childrenType) {
  return childrenType === 1 ? children[0] : children;
}

function getChildrenType(children) {
  if (isArray(children)) {
    return children.length;
  } else {
    return children || isString(children) ? -1 : 0;
  }
}

function destroyNode(node) {
  if (!isString(node)) {
    var domNode = node.dom;
    if (domNode) {
      if (domNode.virtualNode) {
        domNode.virtualNode = undefined;
      }
    }
    var children = node.children;
    if (children) {
      destroyNodes(children, getChildrenType(children));
    }
  }
}

function destroyNodes(nodes, nodesType) {
  if (nodesType > 1) {
    for (var i = 0, len = nodes.length; i < len; i = i + 1 | 0) {
      destroyNode(nodes[i]);
    }
  } else if (nodesType !== 0) {
    destroyNode(getOnlyChild(nodes, nodesType));
  }
}

function removeChild(domElement, child) {
  destroyNode(child);
  var domChild = child.dom,
      domLength = child.domLength || 1,
      domNextChild;
  while (domLength--) {
    domNextChild = domLength > 0 ? domChild.nextSibling : null;
    domElement.removeChild(domChild);
    domChild = domNextChild;
  }
}

function createAllChildren(domNode, node, ns, children, inFragment) {
  var childrenType = getChildrenType(children);
  if (childrenType > 1) {
    for (var i = 0, childrenLength = children.length; i < childrenLength; i = i + 1 | 0) {
      createNode(normIndex(children, i), domNode, ns);
    }
  } else if (childrenType !== 0) {
    var child = getOnlyChild(children, childrenType);
    if (typeof child === "number") {
      child = child.toString();
    }
    if (!inFragment && isString(child)) {
      setTextContent(domNode, child);
    } else {
      child = normOnly(node, child);
      createNode(child, domNode, ns, null, false, !inFragment);
    }
  }
}

function createNode(node, domParent, parentNs, nextChild, replace, isOnlyDomChild) {
  if (isTrident) {
    return insertNodeHTML(node, domParent, nextChild, replace);
  }

  //check if this is a value node
  if (node.index !== undefined) {
    if (typeof node.value === "string") {
      node.lastValue = node.value;
      setTextContent(domParent, node.value, false);
    } else {
      createAllChildren(domParent, node, ns, node.value, false);
    }
    return;
  }

  if (node.component) {
    //if its a component, we make a new instance
    if (typeof node.component === "function") {
      node.component = new node.component(node.props);
      node.component.forceUpdate = Inferno.render.bind(null, node.component.render.bind(node.component), domParent, node.component);
      node.component.forceUpdate();
      node.isDynamic = true;
    }
    //if this is a component
    if (node.component instanceof Component) {
      node.component.forceUpdate();
    }
    return true;
  }

  var domNode,
      tag = node.tag,
      children = node.children,
      ns;
  switch (tag) {
    case "#":
      if (isOnlyDomChild) {
        setTextContent(domParent, children);
        return;
      } else {
        domNode = document.createTextNode(children);
      }
      break;
    default:
      switch (tag) {
        case "svg":
          ns = "http://www.w3.org/2000/svg";break;
        case "math":
          ns = "http://www.w3.org/1998/Math/MathML";break;
        default:
          ns = parentNs;break;
      }

      var attrs = node.attrs,
          is = attrs && attrs.is;
      if (ns) {
        node.ns = ns;
        domNode = is ? document.createElementNS(ns, tag, is) : document.createElementNS(ns, tag);
      } else {
        if (cachedNodes[tag]) {
          domNode = is ? document.createElement(tag, is) : cachedNodes[tag].cloneNode(false);
        } else {
          domNode = is ? document.createElement(tag, is) : document.createElement(tag);
        }
      }
      node.dom = domNode;
      if (isTrident && domParent) {
        insertChild(domParent, domNode, nextChild, replace);
      }

      if (children !== undefined) {
        if (typeof children === "string") {
          setTextContent(domNode, children, false);
        } else if (node.children.index !== undefined) {
          createAllChildren(domNode, node, ns, node.children.value, false);
        } else {
          createAllChildren(domNode, node, ns, children, false);
        }
      }

      if (attrs) {
        updateAttributes(domNode, tag, ns, attrs);
      }
      if (!isTrident && domParent) {
        insertChild(domParent, domNode, nextChild, replace);
      }
      return;
  }
  if (domParent) {
    insertChild(domParent, domNode, nextChild, replace);
  }
}

//addRootDomEventListerners

Inferno.append = function (node, domParent) {
  createNode(node, domParent);
  return node;
};

Inferno.update = function (values, node) {
  updateNode(node, values);
};

Inferno.render = function (values, domParent, component) {
  var node = null;
  if (typeof values === "function" && component !== undefined) {
    if (component._rootNode === undefined) {
      t7.setValuesOnly(false);
      node = values();
      createNode(node, domParent);
      component._rootNode = node;
    } else {}
  } else if (domParent.__rootNode === undefined) {
    //create rootNode
    node = values.nodeTree(values, values.components);
    createNode(node, domParent);
    domParent.__rootNode = node;
  } else {}
};

function updateChildren(node, children, val) {
  var i = 0,
      newNode = null,
      lastLength = 0;
  if (children.length !== val.length) {
    //an item added
    lastLength = children.length;
    if (val.length > lastLength) {
      //simply clone the first node, if we have it
      for (var i = lastLength; i < val.length; i = i + 1 | 0) {
        newNode = val[i].nodeTree();
        createNode(newNode, node.dom);
        children.push(newNode);
      }
    }
    //an item removeNode
    else if (val.length < lastLength) {
      for (var i = val.length; i < lastLength; i = i + 1 | 0) {
        removeChild(node.dom, children[children.length - 1]);
        children.pop();
      }
    }
  }
  for (i = 0; i < children.length; i = i + 1 | 0) {
    updateNode(children[i], val[i], node.dom, children, i);
  }
}

function updateNode(node, values, domParent, parentNode, index) {
  var i = 0,
      val = null;
  if (node.children) {
    if (node.nodeTree != null && node.nodeTree !== values.nodeTree) {
      removeChild(domParent, node);
      t7.setValuesOnly(false);
      node = values.nodeTree();
      createNode(node, domParent);
      parentNode[index] = node;
    }
    if (isArray(node.children)) {} else if (node.children.index != null) {
      val = values[node.children.index];
      if (node.children.lastVal !== val) {
        node.children.lastVal = val;
        if (isArray(node.children.value)) {
          updateChildren(node, node.children.value, val);
        } else if (typeof node.children.value === "string") {
          if (node.children.value !== val) {
            setTextContent(node.dom, val, true);
          }
        }
      }
    } else {
      updateNode(node.children, values, node.dom, node, null);
    }
  }
}

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

function updateAttributes(domElement, tag, ns, attrs, oldAttrs, recordChanges) {
  var changes, attrName;
  if (attrs) {
    for (attrName in attrs) {
      var changed = false,
          attrValue = attrs[attrName];
      if (attrName === "style") {
        var oldAttrValue = oldAttrs && oldAttrs[attrName];
        if (oldAttrValue !== attrValue) {
          changed = updateStyle(domElement, oldAttrValue, attrs, attrValue);
        }
      } else if (isInputProperty(tag, attrName)) {
        if (domElement[attrName] !== attrValue) {
          domElement[attrName] = attrValue;
          changed = true;
        }
      } else if (!oldAttrs || oldAttrs[attrName] !== attrValue) {
        if (attrName === "class" && !ns) {
          domElement.className = attrValue;
        } else {
          updateAttribute(domElement, attrName, attrValue);
        }
        changed = true;
      }
      if (changed && recordChanges) {
        (changes || (changes = [])).push(attrName);
      }
    }
  }
  if (oldAttrs) {
    for (attrName in oldAttrs) {
      if (!attrs || attrs[attrName] === undefined) {
        if (attrName === "class" && !ns) {
          domElement.className = "";
        } else if (!isInputProperty(tag, attrName)) {
          domElement.removeAttribute(attrName);
        }
        if (recordChanges) {
          (changes || (changes = [])).push(attrName);
        }
      }
    }
  }
  return changes;
}

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

module.exports = Inferno;

//update rootNode

//TODO


},{"../t7":3}],3:[function(require,module,exports){
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
  var valuesOnly = false;

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
                root.children[i] = root.children[i].replace(/(__\$props__\[([0-9]*)\])/g, "{value: $1, index: $2}")
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
          root.children = root.children.replace(/(__\$props__\[([0-9]*)\])/g, "{value: $1, key: $2}")
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
        attrsParams.push("'" + name + "':'" + val + "'");
      } else {
        attrsParams.push("'" + name + "':" + val.replace(/(__\$props__\[([0-9]*)\])/g, "{value: $1, index: $2}"));
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
                tagParams.push("attrs: {" + attrsParams.join(',') + "}");
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
    if(output === t7.Outputs.Inferno && valuesOnly === true) {
      if(t7._cache[templateKey] != null) {
        values.nodeTree = t7._cache[templateKey];
        values.components = this;
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
      values.nodeTree = t7._cache[templateKey];
      values.components = this;
      return values;
    }
    return t7._cache[templateKey](values, this);
  };

  var ARRAY_PROPS = {
    length: 'number',
    sort: 'function',
    slice: 'function',
    splice: 'function'
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
    instance.precompile = t7.precompile;

    callback(instance);
  };

  t7.setValuesOnly = function(val) {
    valuesOnly = val;
  };

  t7.precompile = function(nodeTree, valueTree) {
    if(output === t7.Outputs.Inferno && valuesOnly === true) {
      var values = valueTree();
      values.nodeTree = nodeTree;
      return values;
    } else {
      var node = nodeTree();
      node.nodeTree = nodeTree;
      return node;
    }
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
