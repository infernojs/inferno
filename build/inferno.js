"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var t7 = require("../t7");

var supportsTextContent = ('textContent' in document);

var events = {
  "onClick": "click"
};

var userAgent = navigator.userAgent,
    isWebKit = userAgent.indexOf('WebKit') !== -1,
    isFirefox = userAgent.indexOf('Firefox') !== -1,
    isTrident = userAgent.indexOf('Trident') !== -1;

var version = "0.1.27";

var nodeTags = {
  0: "div",
  1: "span",
  2: "a",
  3: "p",
  4: "li",
  5: "td",
  6: "th",
  7: "button",
  8: "h1",
  9: "h2",
  10: "h3",
  11: "h4",
  12: "h5"
};

var rootlisteners = null;
var initialisedListeners = false;
var cachedTextNodes = null;
var recycledNodes = null;

if (typeof window != "undefined") {
  cachedTextNodes = [];
  recycledNodes = [];
  for (var _i = 0; _i < 12; _i++) {
    cachedTextNodes[_i] = document.createElement(nodeTags[_i]);
    cachedTextNodes[_i].textContent = " ";
    recycledNodes[_i] = [];
  }
  rootlisteners = {
    click: []
  };
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
  DIV: 0,
  SPAN: 1,
  A: 2,
  P: 3,
  LI: 4,
  TD: 5,
  TH: 6,
  BUTTON: 7,
  H1: 8,
  H2: 9,
  H3: 10,
  H4: 11,
  H5: 12
};

Inferno.Hint = {
  TEXT: 1,
  CONTAINER: 2
};

function isString(value) {
  return typeof value === 'string';
}

function isArray(value) {
  return value instanceof Array;
}

function isFunction(value) {
  return typeof value === 'function';
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
  if (node && node.component) {
    node = node.component.__rootNode;
  }
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

function createChildren(rootNode, children, parentDom, component, hint) {
  var i = 0,
      textNode = null;

  if (hint === Inferno.Hint.CONTAINER || isArray(children)) {
    for (i = 0; i < children.length; i++) {
      if (isString(children[i])) {
        textNode = document.createTextNode(children[i]);
        parentDom.appendChild(textNode);
      } else if (typeof children[i] === "number") {
        textNode = document.createTextNode(children[i].toString());
        parentDom.appendChild(textNode);
      } else {
        createNode(rootNode, children[i], parentDom, component);
      }
    }
  } else {
    if (children == null) {
      children = "";
    } else if (!isString(children)) {
      children = children.toString();
    }
    setTextContent(parentDom, children, false);
  }
}

function createAllChildren(parentDom, node, component, children, inFragment) {
  children = normChildren(node, children);
  var childrenType = getChildrenType(children);
  if (childrenType > 1) {
    for (var i = 0, childrenLength = children.length; i < childrenLength; i++) {
      createNode(null, normIndex(children, i), parentDom, component);
    }
  } else if (childrenType !== 0) {
    var child = getOnlyChild(children, childrenType);
    if (!inFragment && isString(child)) {
      setTextContent(parentDom, child);
    } else {
      child = normOnly(node, child);
      createNode(null, child, parentDom, component, null, false);
    }
  }
}

function getAttrsForNode(node) {
  var attrs = {},
      anyAttrs = false;
  for (var property in node) {
    if (property[0] === "_") {
      attrs[property.substr(1)] = node[property];
      anyAttrs = true;
    }
  }
  if (!anyAttrs) {
    return null;
  }
  return attrs;
}

function createNode(rootNode, node, parentDom, component, nextChild, replace) {
  var template = node.template;
  var tag = node.tag;
  var domNode = node.dom;
  var hint = node.hint;
  var children = node.children;
  var skipChildrenCreation = false;
  var attrs = node.attrs;

  if (template != null) {
    if (template.tag != undefined) {
      tag = template.tag;
    }
    if (template.hint != undefined) {
      hint = template.hint;
    }
    if (template.children != undefined) {
      children = template.children;
    }
  }

  if (node.component !== undefined) {
    if (typeof node.component === "function") {
      node.component = new node.component(node.props);
      node.component.forceUpdate = Inferno.render.bind(null, node.component.render.bind(node.component), parentDom, node.component);
      node.component.forceUpdate();
      node.isDynamic = true;
    }
    if (node.component instanceof Component) {
      node.component.forceUpdate();
    }
    return;
  }

  if (tag != null) {
    if (hint === Inferno.Hint.TEXT || isString(children)) {
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
    }
  } else if (tag === undefined) {
    if (isString(node)) {
      parentDom.appendChild(document.createTextNode(node));
    } else {
      parentDom.appendChild(document.createTextNode(node.toString()));
    }
    return;
  }

  node.dom = domNode;

  if (skipChildrenCreation === false && children !== null) {
    createChildren(rootNode, children, domNode, component, hint);
  }

  if (attrs) {
    updateAttributes(domNode, tag, component, attrs);
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
}function attachTemplateNode(node) {
  var templateNode = node.templateNode;
  if (templateNode) {
    node.tag = templateNode.tag;
  }
}

function updateChildren(parentDom, node, component, children, oldChildren, outerNextChild) {
  children = normChildren(node, children, oldChildren);
  var oldChildrenType = getChildrenType(oldChildren);
  if (oldChildrenType === 0) {
    createAllChildren(parentDom, node, component, children, false);
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
      child = normOnly(node, child, oldChild);
      updateNode(child, oldChild, parentDom, component, null, 0, outerNextChild);
      return;
    }
  }

  if (childrenType === -1) {
    node.children = children = [children];
  }
  if (oldChildrenType < 2) {
    if (!isString(oldChildren)) {
      oldChild = normOnlyOld(oldChildren, oldChildrenType, parentDom);
    } else {
      oldChild = oldChildren;
    }
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
      updateNode(startChild, oldStartChild, parentDom, component, oldChildren, oldStartIndex + 1, outerNextChild);
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
      updateNode(endChild, oldEndChild, parentDom, component, children, endIndex + 1, outerNextChild);
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
      updateNode(endChild, oldStartChild, parentDom, component, null, 0, nextChild);
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
      updateNode(startChild, oldEndChild, parentDom, component, null, 0, nextChild);
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
      createNode(null, normIndex(children, i), parentDom, component, nextChild);
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
        updateNode(child, oldChild, parentDom, component, null, 0, nextChild);
        if ((oldNextChild && oldNextChild.key) !== (nextChild && nextChild.key)) {
          moveChild(parentDom, child, nextChild);
        }
      } else {
        createNode(null, child, parentDom, component, nextChild);
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

function updateNode(node, oldNode, parentDom, component, nextChildChildren, nextChildIndex, outerNextChild, isOnlyDomChild) {
  var domNode = oldNode.dom,
      oldChildren = oldNode.children,
      children = node.children,
      attrs = node.attrs,
      oldAttrs = oldNode.attrs,
      oldComponent = oldNode.component;

  if (node.component != null && oldComponent != null && oldComponent instanceof Component) {
    node.component = oldComponent;
    oldComponent.props = node.props;
    oldComponent.forceUpdate();
    return;
  }

  if (!node.template || node.template !== oldNode.template) {
    var oldTag = oldNode.tag;
    var tag = node.tag;

    if (node.tag == null && node.template && node.template.tag != null) {
      tag = node.template.tag;
    }
    if (oldNode.tag == null && oldNode.template && oldNode.template.tag != null) {
      oldNode = oldNode.template.tag;
    }
    if (tag && oldTag !== tag) {
      createNode(null, node, parentDom, component, oldNode, true);
      return;
    } else if (tag === undefined) {
      if (isString(node)) {
        if (node !== oldNode) {
          parentDom.childNodes[nextChildIndex - 1].nodeValue = node;
        }
      } else if (typeof node === "number") {
        if (node !== oldNode) {
          parentDom.childNodes[nextChildIndex - 1].nodeValue = node.toString();
        }
      }
      return;
    }
  }

  node.dom = domNode;

  if (children !== oldChildren) {
    updateChildren(domNode, node, component, children, oldChildren);
  }
  if (attrs && attrs !== oldAttrs) {
    updateAttributes(domNode, tag, component, attrs, oldAttrs);
  }
}

Inferno.render = function (node, dom, component) {
  var oldNode = null;
  if (component !== undefined) {
    if (component.__rootNode === undefined) {
      node = node();
      initRootNode(node);
      component.__rootNode = node;
      createNode(node, node, dom, component);
    } else {
      node = node();
      oldNode = component.__rootNode;
      updateNode(node, oldNode, dom, component);
      component.__rootNode = node;
    }
  } else if (dom.__rootNode == null) {
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
  var size = recycledNodes.length;
  node.toRecycle = new Array(12);
  for (var i = 0; i < size; i++) {
    node.toRecycle[i] = [];
  }
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

function addEventListener(parentDom, component, listenerName, callback) {
  rootlisteners[events[listenerName]].push({
    target: parentDom,
    callback: callback,
    component: component
  });
}

function clearEventListeners(parentDom, component, listenerName) {
  var listeners = rootlisteners[events[listenerName]];
  var index = 0;
  while (index < listeners.length) {
    if (listeners[index].target === parentDom) {
      listeners.splice(index, 1);
      index = 0;
    }
    index++;
  }
}

function updateAttributes(parentDom, tag, component, attrs, oldAttrs) {
  var changes, attrName;
  if (attrs) {
    for (attrName in attrs) {
      var attrValue = attrs[attrName];
      if (oldAttrs && oldAttrs[attrName] === attrs[attrName]) {
        continue;
      }
      if (events[attrName] != null) {
        clearEventListeners(parentDom, component, attrName);
        addEventListener(parentDom, component, attrName, attrValue);
        continue;
      }
      if (attrName === 'style') {
        var oldAttrValue = oldAttrs && oldAttrs[attrName];
        if (oldAttrValue !== attrValue) {
          updateStyle(domElement, oldAttrValue, attrs, attrValue);
        }
      } else if (isInputProperty(tag, attrName)) {
        if (parentDom[attrName] !== attrValue) {
          parentDom[attrName] = attrValue;
        }
      } else if (!oldAttrs || oldAttrs[attrName] !== attrValue) {
        if (attrName === 'class') {
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
        if (attrName === 'class') {
          parentDom.className = '';
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

function removeChildren(parentDom, children, i, to) {
  for (; i < to; i++) {
    removeChild(parentDom, children[i]);
  }
}

function norm(node, oldNode) {
  var type = typeof node;
  if (type === 'function') {
    node = node(oldNode);
    node = node === undefined ? oldNode : norm(node, oldNode);
  }
  return node;
}

function normOnly(node, origChild, oldChild) {
  var child = norm(origChild, oldChild);
  if (origChild !== child && node) {
    node.children = child;
  }
  return child;
}

function removeChild(parentDom, child) {
  destroyNode(child);
  var domChild = child.dom,
      domLength = child.domLength || 1,
      domNextChild;
  while (domLength--) {
    domNextChild = domLength > 0 ? domChild.nextSibling : null;
    parentDom.removeChild(domChild);
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
          triggerLight(destroyedHandlers, '$destroyed', domNode, node);
        }
      }
      if (domNode.__rootNode) {
        domNode.__rootNode = null;
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

function normOnlyOld(children, childrenType, parentDom) {
  var child = normOnly(null, getOnlyChild(children, childrenType));
  if (!child.dom) {
    child.dom = parentDom.firstChild;
    if (child.tag === '<') {
      child.domLength = parentDom.childNodes.length;
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

function emptyTextNode() {
  return document.createTextNode('');
}

function setTextContent(parentDom, text, update) {
  if (text) {
    if (supportsTextContent) {
      parentDom.textContent = text;
    } else {
      parentDom.innerText = text;
    }
  } else {
    if (update) {
      while (domElement.firstChild) {
        parentDom.removeChild(parentDom.firstChild);
      }
    }
    parentDom.appendChild(emptyTextNode());
  }
};
//# sourceMappingURL=inferno.js.map
