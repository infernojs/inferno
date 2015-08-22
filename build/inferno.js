"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var t7 = require("../t7");

var supportsTextContent = ("textContent" in document);

var isBrowser = false;

if (typeof window != "undefined") {
  isBrowser = true;
}

var events = {
  "onClick": "click"
};

var events = {
  "onClick": "click"
};

var userAgent = navigator.userAgent,
    isWebKit = userAgent.indexOf("WebKit") !== -1,
    isFirefox = userAgent.indexOf("Firefox") !== -1,
    isTrident = userAgent.indexOf("Trident") !== -1;

var version = "0.2.3";

var recycledFragments = {};
var rootlisteners = null;
var initialisedListeners = false;

if (typeof window != "undefined") {
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
        }
      }
    });
  }
};

var Inferno = {};

Inferno.Type = {
  TEXT: 0,
  TEXT_DIRECT: 1,
  FRAGMENT: 2,
  LIST: 3,
  FRAGMENT_REPLACE: 4,
  LIST_REPLACE: 5,
  ATTR_CLASS: 6,
  ATTR_ID: 6,
  ATTR_DISABLED: 7,
  ATTR_SELECTED: 8,
  ATTR_CHECKED: 9,
  ATTR_VALUE: 10,
  ATTR_STYLE: 11,
  ATTR_HREF: 12,
  ATTR_LABEL: 13,
  ATTR_TYPE: 14,
  ATTR_PLACEHOLDER: 15,
  ATTR_NAME: 16,
  ATTR_WIDTH: 17,
  ATTR_HEIGHT: 18,
  //will contain other "custom" types, like rowspan etc or custom data-attributes
  ATTR_OTHER: {}
};

function isString(value) {
  return typeof value === "string";
}

function isNumber(value) {
  return typeof value === "number";
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

Inferno.dom = {};

Inferno.dom.createElement = function (tag) {
  if (isBrowser) {
    return document.createElement(tag);
  }
};

Inferno.dom.createText = function (text) {
  if (isBrowser) {
    return document.createTextNode(text);
  }
};

Inferno.dom.createEmpty = function (text) {
  if (isBrowser) {
    return document.createTextNode("");
  }
};

Inferno.dom.addAttributes = function (node, attrs, component) {
  var attrName, attrVal;
  for (attrName in attrs) {
    attrVal = attrs[attrName];

    if (events[attrName] != null) {
      clearEventListeners(node, component, attrName);
      addEventListener(node, component, attrName, attrVal);
      continue;
    }

    switch (attrName) {
      case "class":
      case "className":
        node.className = attrVal;
        break;
      case "id":
        node.id = attrVal;
        break;
      default:
        node[attrName] = attrVal;
    }
  }
};

Inferno.dom.createFragment = function () {
  if (isBrowser) {
    return document.createDocumentFragment();
  }
};

Inferno.unmountComponentAtNode = function (dom) {
  var context = getContext(dom);
  if (context !== null) {
    removeFragment(context, dom, context.fragment);
    removeContext(dom);
  }
};

function getRecycledFragment(templateKey) {
  var fragments = recycledFragments[templateKey];
  if (!fragments || fragments.length === 0) {
    return null;
  }
  return fragments.pop();
}

function attachFragmentList(context, list, parentDom, component) {
  for (var i = 0; i < list.length; i++) {
    attachFragment(context, list[i], parentDom, component);
  }
}

function updateFragmentList(context, oldList, list, parentDom, component, outerNextFragment) {
  var oldListLength = oldList.length;
  var listLength = list.length;

  if (listLength === 0) {
    removeFragments(context, parentDom, oldList, 0, oldListLength);
    return;
  } else if (oldListLength === 0) {
    attachFragmentList(context, list, parentDom, component);
    return;
  }

  var oldEndIndex = oldListLength - 1;
  var endIndex = listLength - 1;
  var oldStartIndex = 0,
      startIndex = 0;
  var successful = true;
  var nextItem;
  var oldItem, item;

  outer: while (successful && oldStartIndex <= oldEndIndex && startIndex <= endIndex) {
    successful = false;
    var oldStartItem, oldEndItem, startItem, endItem, doUpdate;

    oldStartItem = oldList[oldStartIndex];
    startItem = list[startIndex];
    while (oldStartItem.key === startItem.key) {
      updateFragment(context, oldStartItem, startItem, parentDom, component);
      oldStartIndex++;startIndex++;
      if (oldStartIndex > oldEndIndex || startIndex > endIndex) {
        break outer;
      }
      oldStartItem = oldList[oldStartIndex];
      startItem = list[startIndex];
      successful = true;
    }
    oldEndItem = oldList[oldEndIndex];
    endItem = list[endIndex];
    while (oldEndItem.key === endItem.key) {
      updateFragment(context, oldEndItem, endItem, parentDom, component);
      oldEndIndex--;endIndex--;
      if (oldStartIndex > oldEndIndex || startIndex > endIndex) {
        break outer;
      }
      oldEndItem = oldList[oldEndIndex];
      endItem = list[endIndex];
      successful = true;
    }
    while (oldStartItem.key === endItem.key) {
      nextItem = endIndex + 1 < listLength ? list[endIndex + 1] : outerNextFragment;
      updateFragment(context, oldStartItem, endItem, parentDom, component);
      moveFragment(parentDom, endItem, nextItem);
      oldStartIndex++;endIndex--;
      if (oldStartIndex > oldEndIndex || startIndex > endIndex) {
        break outer;
      }
      oldStartItem = oldList[oldStartIndex];
      endItem = list[endIndex];
      successful = true;
    }
    while (oldEndItem.key === startItem.key) {
      nextItem = oldStartIndex < oldListLength ? oldList[oldStartIndex] : outerNextFragment;
      updateFragment(context, oldEndItem, startItem, parentDom, component);
      moveFragment(parentDom, startItem, nextItem);
      oldEndIndex--;startIndex++;
      if (oldStartIndex > oldEndIndex || startIndex > endIndex) {
        break outer;
      }
      oldEndItem = oldList[oldEndIndex];
      startItem = list[startIndex];
      successful = true;
    }
  }
  if (oldStartIndex > oldEndIndex) {
    nextItem = endIndex + 1 < listLength ? list[endIndex + 1] : outerNextFragment;
    for (i = startIndex; i <= endIndex; i++) {
      item = list[i];
      attachFragment(context, item, parentDom, component, nextItem);
    }
  } else if (startIndex > endIndex) {
    removeFragments(context, parentDom, oldList, oldStartIndex, oldEndIndex + 1);
  } else {
    var i,
        oldNextItem = oldEndIndex + 1 >= oldListLength ? null : oldList[oldEndIndex + 1];
    var oldListMap = {};
    for (i = oldEndIndex; i >= oldStartIndex; i--) {
      oldItem = oldList[i];
      oldItem.next = oldNextItem;
      oldListMap[oldItem.key] = oldItem;
      oldNextItem = oldItem;
    }
    nextItem = endIndex + 1 < listLength ? list[endIndex + 1] : outerNextFragment;
    for (i = endIndex; i >= startIndex; i--) {
      item = list[i];
      var key = item.key;
      oldItem = oldListMap[key];
      if (oldItem) {
        oldListMap[key] = null;
        oldNextItem = oldItem.next;
        updateFragment(context, oldItem, item, parentDom, component);
        if (parentDom.nextSibling != (nextItem && nextItem.dom)) {
          moveFragment(parentDom, item, nextItem);
        }
      } else {
        attachFragment(context, item, parentDom, component, nextItem);
      }
      nextItem = item;
    }
    for (i = oldStartIndex; i <= oldEndIndex; i++) {
      oldItem = oldList[i];
      if (oldListMap[oldItem.key] !== null) {
        removeFragment(context, parentDom, oldItem);
      }
    }
  }
}

function updateFragment(context, oldFragment, fragment, parentDom, component) {
  if (fragment === null) {
    removeFragment(context, parentDom, oldFragment);
    return;
  }
  if (oldFragment === null) {
    attachFragment(context, fragment, parentDom, component);
    return;
  }
  if (oldFragment.template !== fragment.template) {
    attachFragment(context, fragment, parentDom, component, oldFragment, true);
  } else {
    var fragmentComponent = oldFragment.component;

    if (fragmentComponent) {
      fragmentComponent.props = fragment.props;
      fragmentComponent.forceUpdate();
      fragment.component = fragmentComponent;
      return;
    }

    fragment.dom = oldFragment.dom;

    if (fragment.templateValue !== undefined) {
      var element = oldFragment.templateElement;
      var type = oldFragment.templateType;
      fragment.templateElement = element;
      fragment.templateType = type;
      if (fragment.templateValue !== oldFragment.templateValue) {
        switch (type) {
          case Inferno.Type.LIST:
          case Inferno.Type.LIST_REPLACE:
            updateFragmentList(context, oldFragment.templateValue, fragment.templateValue, element, component);
            return;
          case Inferno.Type.TEXT:
            element.firstChild.nodeValue = fragment.templateValue;
            return;
          case Inferno.Type.TEXT_DIRECT:
            element.nodeValue = fragment.templateValue;
            return;
          case Inferno.Type.FRAGMENT:
          case Inferno.Type.FRAGMENT_REPLACE:
            updateFragment(context, oldFragment.templateValue, fragment.templateValue, element, component);
            return;
          case Inferno.Type.ATTR_CLASS:
            //debugger;
            return;
        }
      }
    } else if (fragment.templateValues !== undefined) {
      for (var i = 0, length = fragment.templateValues.length; i < length; i++) {
        var element = oldFragment.templateElements[i];
        var type = oldFragment.templateTypes[i];
        fragment.templateElements[i] = element;
        fragment.templateTypes[i] = type;
        if (fragment.templateValues[i] !== oldFragment.templateValues[i]) {
          switch (type) {
            case Inferno.Type.LIST:
            case Inferno.Type.LIST_REPLACE:
              updateFragmentList(context, oldFragment.templateValues[i], fragment.templateValues[i], element, component);
              break;
            case Inferno.Type.TEXT:
              element.firstChild.nodeValue = fragment.templateValues[i];
              break;
            case Inferno.Type.TEXT_DIRECT:
              element.nodeValue = fragment.templateValues[i];
              break;
            case Inferno.Type.FRAGMENT:
            case Inferno.Type.FRAGMENT_REPLACE:
              updateFragment(context, oldFragment.templateValues[i], fragment.templateValues[i], element, component);
              break;
            case Inferno.Type.ATTR_CLASS:
              element.className = fragment.templateValues[i];
              break;
            case Inferno.Type.ATTR_ID:
              element.id = fragment.templateValues[i];
              break;
            case Inferno.Type.ATTR_VALUE:
              element.value = fragment.templateValues[i];
              break;
            case Inferno.Type.ATTR_WIDTH:
              element.width = fragment.templateValues[i];
              break;
            case Inferno.Type.ATTR_HEIGHT:
              element.height = fragment.templateValues[i];
              break;
            //custom attribute, so simply setAttribute it
            default:
              element.setAttribute(type, fragment.templateValues[i]);
              break;
          }
        }
      }
    }
  }
}

function attachFragment(context, fragment, parentDom, component, nextFragment, replace) {
  var fragmentComponent = fragment.component;

  if (fragmentComponent) {
    if (typeof fragmentComponent === "function") {
      fragmentComponent = fragment.component = new fragmentComponent(fragment.props);
      fragmentComponent.context = null;
      fragmentComponent.forceUpdate = Inferno.render.bind(null, fragmentComponent.render.bind(fragmentComponent), parentDom, fragmentComponent);
      fragmentComponent.forceUpdate();
    }
    return;
  }

  var recycledFragment = null;
  var template = fragment.template;
  var templateKey = template.key;

  if (context.shouldRecycle === true) {
    recycledFragment = getRecycledFragment(templateKey);
  }

  if (recycledFragment !== null) {
    updateFragment(context, recycledFragment, fragment, parentDom, component);
  } else {
    template(fragment, component);

    if (fragment.templateValue !== undefined) {
      switch (fragment.templateType) {
        case Inferno.Type.LIST:
          attachFragmentList(context, fragment.templateValue, fragment.templateElement, component);
          break;
        case Inferno.Type.LIST_REPLACE:
          //debugger;
          break;
        case Inferno.Type.FRAGMENT:
          //debugger;
          break;
        case Inferno.Type.FRAGMENT_REPLACE:
          attachFragment(context, fragment.templateValue, parentDom, component, fragment.templateElement, true);
          fragment.templateElement = fragment.templateValue.dom.parentNode;
          break;
      }
    } else if (fragment.templateValues !== undefined) {
      for (var i = 0, length = fragment.templateValues.length; i < length; i++) {
        var element = fragment.templateElements[i];
        var value = fragment.templateValues[i];
        switch (fragment.templateTypes[i]) {
          case Inferno.Type.LIST:
            attachFragmentList(context, value, element, component);
            break;
          case Inferno.Type.LIST_REPLACE:
            var nodeList = document.createDocumentFragment();
            var placeholderNode = fragment.templateElements[i];
            attachFragmentList(context, value, nodeList, component);
            placeholderNode.parentNode.replaceChild(nodeList, placeholderNode);
            fragment.templateElements[i] = nodeList;
            break;
          case Inferno.Type.FRAGMENT:
            //debugger;
            break;
          case Inferno.Type.FRAGMENT_REPLACE:
            attachFragment(context, value, parentDom, component, element, true);
            fragment.templateElements[i] = value.dom.parentNode;
            break;
        }
      }
    }
  }

  insertFragment(context, parentDom, fragment.dom, nextFragment, replace);
}

var contexts = [];

function removeContext(dom) {
  for (var i = 0; i < contexts.length; i++) {
    if (contexts[i].dom === dom) {
      contexts.splice(i, 1);
      return;
    }
  }
}

function getContext(dom) {
  for (var i = 0; i < contexts.length; i++) {
    if (contexts[i].dom === dom) {
      return contexts[i];
    }
  }
  return null;
}

Inferno.render = function (fragment, dom, component) {
  var context, generatedFragment;
  if (component === undefined) {
    if (initialisedListeners === false) {
      addRootDomEventListerners();
    }
    context = getContext(dom);
    if (context === null) {
      context = {
        fragment: fragment,
        dom: dom,
        shouldRecycle: true
      };
      attachFragment(context, fragment, dom, component);
      contexts.push(context);
    } else {
      updateFragment(context, context.fragment, fragment, dom, component, false);
      context.fragment = fragment;
    }
  } else {
    if (component.context === null) {
      generatedFragment = fragment();
      context = component.context = {
        fragment: generatedFragment,
        dom: dom,
        shouldRecycle: true
      };
      attachFragment(context, generatedFragment, dom, component);
    } else {
      generatedFragment = fragment();
      context = component.context;
      updateFragment(context, context.fragment, generatedFragment, dom, component, false);
      context.fragment = generatedFragment;
    }
  }
};

function moveFragment(parentDom, item, nextItem) {
  var domItem = item.dom,
      domRefItem = nextItem && nextItem.dom;

  if (domItem !== domRefItem) {
    if (domRefItem) {
      parentDom.insertBefore(domItem, domRefItem);
    } else {
      parentDom.appendChild(domItem);
    }
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

function insertFragment(context, parentDom, domNode, nextFragment, replace) {
  var noDestroy = false;
  if (nextFragment) {
    var domNextFragment = nextFragment.dom;
    if (!domNextFragment) {
      domNextFragment = nextFragment;
      parentDom = domNextFragment.parentNode;
      noDestroy = true;
    }
    if (replace) {
      if (noDestroy === false) {
        destroyFragment(context, nextFragment);
      }
      parentDom.replaceChild(domNode, domNextFragment);
    } else {
      parentDom.insertBefore(domNode, domNextFragment);
    }
  } else {
    parentDom.appendChild(domNode);
  }
}

function removeFragments(context, parentDom, fragments, i, to) {
  for (; i < to; i++) {
    removeFragment(context, parentDom, fragments[i]);
  }
}

function removeFragment(context, parentDom, item) {
  var domItem = item.dom;
  destroyFragment(context, item);
  parentDom.removeChild(domItem);
}

function destroyFragment(context, fragment) {
  var templateKey = fragment.template.key;
  if (context.shouldRecycle === true) {
    var toRecycleForKey = recycledFragments[templateKey];
    if (!toRecycleForKey) {
      recycledFragments[templateKey] = toRecycleForKey = [];
    }
    toRecycleForKey.push(fragment);
  }
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

module.exports = Inferno;
//# sourceMappingURL=inferno.js.map
