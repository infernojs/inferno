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
//# sourceMappingURL=inferno.js.map
