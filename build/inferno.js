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

var version = "0.1.25";

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

  if (node.component != null && oldNode.component != null && oldNode.component instanceof Component) {
    node.component = oldNode.component;
    oldNode.component.props = node.props;
    oldNode.component.forceUpdate();
    return;
  }

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
      component._rootNode = node;
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
    dom.__rootNode = node;
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
//# sourceMappingURL=inferno.js.map
