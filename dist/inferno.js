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

var supportsTextContent = ("textContent" in document);

var events = {
  "onClick": "click"
};

var userAgent = navigator.userAgent,
    isWebKit = userAgent.indexOf("WebKit") !== -1,
    isFirefox = userAgent.indexOf("Firefox") !== -1,
    isTrident = userAgent.indexOf("Trident") !== -1;

var version = "0.1.24";

var nodeTags = {
  1: "div",
  2: "span",
  3: "a",
  4: "p",
  5: "li",
  6: "td"
};

var rootlisteners = {
  click: []
};
var initialisedListeners = false;

var cachedNodes = null;
var cachedTextNodes = null;
var recycledNodes = null;

if (typeof window != "undefined") {
  cachedNodes = {
    1: document.createElement("div"),
    2: document.createElement("span"),
    3: document.createElement("a"),
    4: document.createElement("p"),
    5: document.createElement("li"),
    6: document.createElement("td"),
    7: document.createElement("td")
  };
  cachedTextNodes = {
    1: document.createElement("div"),
    2: document.createElement("span"),
    3: document.createElement("a"),
    4: document.createElement("p"),
    5: document.createElement("li"),
    6: document.createElement("td"),
    7: document.createElement("button")
  };
  recycledNodes = {
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
    6: [],
    7: []
  };
  cachedTextNodes[1].textContent = " ";
  cachedTextNodes[2].textContent = " ";
  cachedTextNodes[3].textContent = " ";
  cachedTextNodes[4].textContent = " ";
  cachedTextNodes[5].textContent = " ";
  cachedTextNodes[6].textContent = " ";
  cachedTextNodes[7].textContent = " ";
} else {
  rootlisteners = null;
}

function addRootDomEventListerners() {
  initialisedListeners = true;
  if (rootlisteners !== null) {
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

Inferno.Tag = {
  DIV: 1,
  SPAN: 2,
  A: 3,
  P: 4,
  LI: 5,
  TD: 6,
  BUTTON: 7
};

function isString(value) {
  return typeof value === "string";
}

function isArray(value) {
  return value instanceof Array;
}

function isFunction(value) {
  return typeof value === "function";
}

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

module.exports = Inferno;

Inferno.unmountComponentAtNode = function (root) {
  //TODO finish, remove events etc
  var node = root.__rootNode;
  if (node) {
    root.removeChild(node.dom);
    recycleNodes(node);
    root.__rootNode = null;
  }
};

function recycleNodes(node) {
  var i = 0;
  for (var type in node.toRecycle) {
    for (i = 0; i < node.toRecycle[type].length; i++) {
      recycledNodes[type].push(node.toRecycle[type][i]);
    }
  }
}

function createChildren(rootNode, children, parentDom) {
  var i = 0,
      childDom = null,
      childrenType = getChildrenType(children),
      textNode = null;
  if (childrenType > 1) {
    for (i = 0; i < children.length; i++) {
      if (typeof children[i] === "string") {
        textNode = document.createTextNode(children[i]);
        parentDom.appendChild(textNode);
      } else if (typeof children[i] === "number") {
        textNode = document.createTextNode(children[i].toString());
        parentDom.appendChild(textNode);
      } else {
        createNode(rootNode, children[i], parentDom);
      }
    }
  } else if (childrenType !== 0) {
    setTextContent(parentDom, children, false);
  }
}

function createAllChildren(parentDom, node, children, inFragment) {
  children = normChildren(node, children);
  var childrenType = getChildrenType(children);
  if (childrenType > 1) {
    for (var i = 0, childrenLength = children.length; i < childrenLength; i++) {
      createNode(null, normIndex(children, i), parentDom);
    }
  } else if (childrenType !== 0) {
    var child = getOnlyChild(children, childrenType);
    if (!inFragment && isString(child)) {
      setTextContent(parentDom, child);
    } else {
      child = normOnly(node, child);
      createNode(null, child, parentDom, null, false);
    }
  }
}

function getAttrsForNode(node) {
  var attrs = {};
  for (var property in node) {
    if (property[0] === "_") {
      attrs[property.substr(1)] = node[property];
    }
  }
  return attrs;
}

function createNode(rootNode, node, parentDom, nextChild, replace) {
  attachTemplateNode(node);

  var domNode = node.dom;
  var tag = node.tag;
  var children = node.children;
  var skipChildrenCreation = false;
  var attrs = null;

  if (node.component) {
    //if its a component, we make a new instance
    if (typeof node.component === "function") {
      node.component = new node.component(node.props);
      node.component.forceUpdate = Inferno.render.bind(null, node.component.render.bind(node.component), parentDom, node.component);
      node.component.forceUpdate();
      node.isDynamic = true;
    }
    //if this is a component
    if (node.component instanceof Component) {
      node.component.forceUpdate();
    }
    return;
  }

  if (tag) {
    if (typeof children === "string") {
      if (recycledNodes[tag].length > 0) {
        domNode = recycledNodes[tag].pop();
      } else {
        domNode = cachedTextNodes[tag].cloneNode(true);
      }
      domNode.firstChild.nodeValue = children;
      skipChildrenCreation = true;
      if (rootNode !== null) {
        rootNode.toRecycle[tag].push(domNode);
      }
    } else {
      if (typeof tag === "string") {
        domNode = document.createElement(tag);
      } else {
        domNode = document.createElement(nodeTags[tag]);
      }
      attrs = getAttrsForNode(node);
    }
  }

  node.dom = domNode;

  if (skipChildrenCreation === false && children !== null) {
    createChildren(rootNode, children, domNode);
  }

  if (attrs) {
    updateAttributes(domNode, tag, attrs);
  }

  if (domNode !== null) {
    insertChild(parentDom, domNode, nextChild, replace);
  }
}

function attachTemplateNode(node) {
  var templateNode = node.templateNode;
  if (templateNode) {
    node.tag = templateNode.tag;
  }
}

function updateChildren(parentDom, node, children, oldChildren, outerNextChild) {
  children = normChildren(node, children, oldChildren);
  var oldChildrenType = getChildrenType(oldChildren);
  if (oldChildrenType === 0) {
    createAllChildren(parentDom, node, children, false);
    return;
  }
  var childrenType = getChildrenType(children),
      oldChild,
      child;
  if (childrenType === 0) {
    removeAllChildren(parentDom, oldChildren, oldChildrenType);
    return;
  } else if (childrenType < 2) {
    child = getOnlyChild(children, childrenType);
    if (isString(child)) {
      if (childrenType === oldChildrenType) {
        oldChild = getOnlyChild(oldChildren, oldChildrenType);
        if (child === oldChild) {
          return;
        } else if (isString(oldChild)) {
          parentDom.firstChild.nodeValue = child;
          return;
        }
      }
      destroyNodes(oldChildren, oldChildrenType);
      setTextContent(parentDom, child, true);
      return;
    } else if (oldChildrenType < 2) {
      oldChild = normOnlyOld(oldChildren, oldChildrenType, parentDom);
      child = normOnly(element, child, oldChild);
      updateNode(child, oldChild, parentDom, null, 0, outerNextChild);
      return;
    }
  }

  if (childrenType === -1) {
    node.children = children = [children];
  }
  if (oldChildrenType < 2) {
    oldChild = normOnlyOld(oldChildren, oldChildrenType, domParent);
    if (oldChildrenType === 1) {
      oldChildren[0] = oldChild;
    } else {
      oldChildren = [oldChild];
    }
  }

  var oldChildrenLength = oldChildren.length,
      childrenLength = children.length,
      oldEndIndex = oldChildrenLength - 1,
      endIndex = children.length - 1;

  var oldStartIndex = 0,
      startIndex = 0,
      successful = true,
      nextChild;

  outer: while (successful && oldStartIndex <= oldEndIndex && startIndex <= endIndex) {
    successful = false;
    var oldStartChild, oldEndChild, startChild, endChild;

    oldStartChild = oldChildren[oldStartIndex];
    startChild = normIndex(children, startIndex, oldStartChild);
    while (oldStartChild.key === startChild.key) {
      updateNode(startChild, oldStartChild, parentDom, oldChildren, oldStartIndex + 1, outerNextChild);
      oldStartIndex++;startIndex++;
      if (oldStartIndex > oldEndIndex || startIndex > endIndex) {
        break outer;
      }
      oldStartChild = oldChildren[oldStartIndex];
      startChild = normIndex(children, startIndex, oldStartChild);
      successful = true;
    }
    oldEndChild = oldChildren[oldEndIndex];
    endChild = normIndex(children, endIndex);
    while (oldEndChild.key === endChild.key) {
      updateNode(endChild, oldEndChild, parentDom, children, endIndex + 1, outerNextChild);
      oldEndIndex--;endIndex--;
      if (oldStartIndex > oldEndIndex || startIndex > endIndex) {
        break outer;
      }
      oldEndChild = oldChildren[oldEndIndex];
      endChild = normIndex(children, endIndex);
      successful = true;
    }
    while (oldStartChild.key === endChild.key) {
      nextChild = endIndex + 1 < childrenLength ? children[endIndex + 1] : outerNextChild;
      updateNode(endChild, oldStartChild, parentDom, null, 0, nextChild);
      moveChild(parentDom, endChild, nextChild);
      oldStartIndex++;endIndex--;
      if (oldStartIndex > oldEndIndex || startIndex > endIndex) {
        break outer;
      }
      oldStartChild = oldChildren[oldStartIndex];
      endChild = normIndex(children, endIndex);
      successful = true;
    }
    while (oldEndChild.key === startChild.key) {
      nextChild = oldStartIndex < oldChildrenLength ? oldChildren[oldStartIndex] : outerNextChild;
      updateNode(startChild, oldEndChild, parentDom, null, 0, nextChild);
      moveChild(parentDom, startChild, nextChild);
      oldEndIndex--;startIndex++;
      if (oldStartIndex > oldEndIndex || startIndex > endIndex) {
        break outer;
      }
      oldEndChild = oldChildren[oldEndIndex];
      startChild = normIndex(children, startIndex);
      successful = true;
    }
  }

  if (oldStartIndex > oldEndIndex) {
    nextChild = endIndex + 1 < childrenLength ? normIndex(children, endIndex + 1) : outerNextChild;
    for (i = startIndex; i <= endIndex; i++) {
      createNode(null, normIndex(children, i), parentDom, nextChild);
    }
  } else if (startIndex > endIndex) {
    removeChildren(parentDom, oldChildren, oldStartIndex, oldEndIndex + 1);
  } else {
    var i,
        oldNextChild = oldChildren[oldEndIndex + 1],
        oldChildrenMap = {};
    for (i = oldEndIndex; i >= oldStartIndex; i--) {
      oldChild = oldChildren[i];
      oldChild.next = oldNextChild;
      oldChildrenMap[oldChild.key] = oldChild;
      oldNextChild = oldChild;
    }
    nextChild = endIndex + 1 < childrenLength ? normIndex(children, endIndex + 1) : outerNextChild;
    for (i = endIndex; i >= startIndex; i--) {
      child = children[i];
      var key = child.key;
      oldChild = oldChildrenMap[key];
      if (oldChild) {
        oldChildrenMap[key] = null;
        oldNextChild = oldChild.next;
        updateNode(child, oldChild, parentDom, null, 0, nextChild);
        if ((oldNextChild && oldNextChild.key) !== (nextChild && nextChild.key)) {
          moveChild(parentDom, child, nextChild);
        }
      } else {
        createNode(null, child, parentDom, nextChild);
      }
      nextChild = child;
    }
    for (i = oldStartIndex; i <= oldEndIndex; i++) {
      oldChild = oldChildren[i];
      if (oldChildrenMap[oldChild.key] !== null) {
        removeChild(parentDom, oldChild);
      }
    }
  }
}

function updateNode(node, oldNode, parentDom, nextChildChildren, nextChildIndex, outerNextChild, isOnlyDomChild) {
  var tag = node.tag;
  if (tag && oldNode.tag !== tag) {
    createNode(null, node, domParent, oldNode, true);
  } else if (typeof node === "string") {
    if (node !== oldNode) {
      parentDom.childNodes[nextChildIndex - 1].nodeValue = node;
    }
  } else if (typeof node === "number") {
    if (node !== oldNode) {
      parentDom.childNodes[nextChildIndex - 1].nodeValue = node.toString();
    }
  } else {
    var domNode = oldNode.dom,
        oldChildren = oldNode.children,
        children = node.children;
    node.dom = domNode;
    if (children !== oldChildren) {
      updateChildren(domNode, node, children, oldChildren);
    }
  }
}

Inferno.render = function (node, dom, component) {
  var oldNode = null;
  if (component !== undefined) {
    if (component._rootNode === undefined) {
      node = node();
      initRootNode(node);
      component._rootNode = node;
      createNode(node, node, dom);
    } else {
      node = node();
      oldNode = component._rootNode;
      updateNode(node, oldNode, dom);
    }
  } else if (dom.__rootNode === undefined) {
    if (initialisedListeners === false) {
      addRootDomEventListerners();
    }
    initRootNode(node);
    createNode(node, node, dom);
    dom.__rootNode = node;
  } else {
    oldNode = dom.__rootNode;
    updateNode(node, oldNode, dom);
  }
};

function initRootNode(node) {
  node.toRecycle = {
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
    6: [],
    7: []
  };
}

function moveChild(parentDom, child, nextChild) {
  var domChild = child.dom,
      domLength = child.domLength || 1,
      domNextChild,
      domRefChild = nextChild && nextChild.dom;
  if (domChild !== domRefChild) {
    while (domLength--) {
      domNextChild = domLength > 0 ? domChild.nextSibling : null;
      if (domRefChild) {
        parentDom.insertBefore(domChild, domRefChild);
      } else {
        parentDom.appendChild(domChild);
      }
      domChild = domNextChild;
    }
  }
}

function removeAllChildren(parentDom, children, childrenType) {
  if (childrenType > 1) {
    removeChildren(parentDom, children, 0, children.length);
  } else if (childrenType !== 0) {
    if (isString(children)) {
      parentDom.removeChild(parentDom.firstChild);
    } else {
      removeChild(parentDom, normOnlyOld(children, childrenType, parentDom));
    }
  }
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

function updateAttributes(parentDom, tag, attrs, oldAttrs) {
  var changes, attrName;
  if (attrs) {
    for (attrName in attrs) {
      var attrValue = attrs[attrName];
      if (attrName === "style") {
        var oldAttrValue = oldAttrs && oldAttrs[attrName];
        if (oldAttrValue !== attrValue) {
          updateStyle(domElement, oldAttrValue, attrs, attrValue);
        }
      } else if (isInputProperty(tag, attrName)) {
        if (parentDom[attrName] !== attrValue) {
          parentDom[attrName] = attrValue;
        }
      } else if (!oldAttrs || oldAttrs[attrName] !== attrValue) {
        if (attrName === "class") {
          parentDom.className = attrValue;
        } else {
          updateAttribute(parentDom, attrName, attrValue);
        }
      }
    }
  }
  if (oldAttrs) {
    for (attrName in oldAttrs) {
      if (!attrs || attrs[attrName] === undefined) {
        if (attrName === "class") {
          parentDom.className = "";
        } else if (!isInputProperty(tag, attrName)) {
          parentDom.removeAttribute(attrName);
        }
      }
    }
  }
  return changes;
}

function insertChild(parentDom, domNode, nextChild, replace) {
  if (nextChild) {
    var domNextChild = nextChild.dom;
    if (replace) {
      var domLength = nextChild.domLength || 1;
      if (domLength === 1) {
        destroyNode(nextChild);
        parentDom.replaceChild(domNode, domNextChild);
      } else {
        parentDom.insertBefore(domNode, domNextChild);
        removeChild(parentDom, nextChild);
      }
    } else {
      parentDom.insertBefore(domNode, domNextChild);
    }
  } else {
    parentDom.appendChild(domNode);
  }
}

function normChildren(node, children, oldChildren) {
  if (isFunction(children)) {
    children = children(oldChildren);
    if (children === undefined) {
      children = oldChildren;
    }
    node.children = children;
  }
  return children;
}

function normIndex(children, i, oldChild) {
  var origChild = children[i],
      child = norm(origChild, oldChild);
  if (origChild !== child) {
    children[i] = child;
  }
  return child;
}

function removeChildren(domParent, children, i, to) {
  for (; i < to; i++) {
    removeChild(domParent, children[i]);
  }
}

function norm(node, oldNode) {
  var type = typeof node;
  if (type === "function") {
    node = node(oldNode);
    node = node === undefined ? oldNode : norm(node, oldNode);
  }
  return node;
}

function removeChild(domParent, child) {
  destroyNode(child);
  var domChild = child.dom,
      domLength = child.domLength || 1,
      domNextChild;
  while (domLength--) {
    domNextChild = domLength > 0 ? domChild.nextSibling : null;
    domParent.removeChild(domChild);
    domChild = domNextChild;
  }
}

function destroyNode(node) {
  if (!isString(node)) {
    var domNode = node.dom;
    if (domNode) {
      var events = node.events;
      if (events) {
        for (var eventType in events) {
          removeEventHandler(domNode, eventType);
        }
        var destroyedHandlers = events.$destroyed;
        if (destroyedHandlers) {
          triggerLight(destroyedHandlers, "$destroyed", domNode, node);
        }
      }
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
    for (var i = 0, len = nodes.length; i < len; i++) {
      destroyNode(nodes[i]);
    }
  } else if (nodesType !== 0) {
    destroyNode(getOnlyChild(nodes, nodesType));
  }
}

function normOnlyOld(children, childrenType, domParent) {
  var child = normOnly(null, getOnlyChild(children, childrenType));
  if (!child.dom) {
    child.dom = domParent.firstChild;
    if (child.tag === "<") {
      child.domLength = domParent.childNodes.length;
    }
  }
  return child;
}

function updateAttribute(parentDom, name, value) {
  if (value === false || value == null) {
    parentDom.removeAttribute(name);
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
    parentDom.setAttribute(name, value);
  }
};

function setTextContent(parentDom, text, update) {
  if (update && parentDom.firstChild) {
    parentDom.firstChild.nodeValue = text;
  } else {
    if (supportsTextContent) {
      parentDom.textContent = text;
    } else {
      parentDom.innerText = text;
    }
  }
};


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
  var version = "0.2.19";

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
              childrenText.push(root.children[i]);
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
        root.children = root.children.replace(/(__\$props__\[.*\])/g, "',$1,'")
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
        attrsParams.push("'_" + name + "':'" + val + "'");
      } else {
        attrsParams.push("'_" + name + "':" + val.replace(/(__\$props__\[([0-9]*)\])/g, "$1"));
      }
    }
  };

  function isComponentName(tagName) {
    if(tagName[0] === tagName[0].toUpperCase()) {
      return true;
    }
    return false;
  };

  function handleInfernoTag(tagName, functionText) {
    if(Inferno.Tag[tagName.toUpperCase()]) {
      functionText.push("{dom: null, tag: " + Inferno.Tag[tagName.toUpperCase()]);
    } else {
      functionText.push("{dom: null, tag: '" + tagName + "'");
    }
  }

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
            if(output === t7.Outputs.Inferno) {
              handleInfernoTag(root.tag, functionText);
            } else {
              functionText.push("{tag: " + root.tag + "'");
            }
            //add the key
            if(root.key != null) {
              tagParams.push("key: " + root.key);
            } else if(output === t7.Outputs.Inferno) {
              tagParams.push("key: null");
            }
            //build the attrs
            if(root.attrs != null) {
              if(output === t7.Outputs.Inferno) {
                buildInfernoAttrsParams(root, attrsParams);
                if(attrsParams.length > 0) {
                  tagParams.push(attrsParams.join(','));
                }
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
    var values = [].slice.call(arguments, 1);

    //build the template string
    for(; i < n; i++) {
      tpl += template[i];
    };
    //set our unique key
    templateKey = createTemplateKey(tpl);

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
