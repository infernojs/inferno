"use strict";

var t7 = require("../t7");

var supportsTextContent = ('textContent' in document);

var isBrowser = false;

if (typeof window != "undefined") {
  isBrowser = true;
}

var events = {
  "onClick": "click"
};

var events = {
  "onClick": "click",
  "onMouseUp": "mouseup",
  "onMouseDown": "mousedown",
  "onMouseMove": "mousemove",
  "onMouseEnter": "mouseenter",
  "onMouseLeave": "mouseleave",
  "onKeyPress": "keypress",
  "onKeyUp": "keyup",
  "onKeyDown": "keydown",
  "onTouchStart": "touchstart",
  "onTouchEnd": "touchend",
  "onTouchMove": "touchmove",
  "onTouchCancel": "touchcancel"
};

var userAgent = navigator.userAgent,
    isWebKit = userAgent.indexOf('WebKit') !== -1,
    isFirefox = userAgent.indexOf('Firefox') !== -1,
    isTrident = userAgent.indexOf('Trident') !== -1;

var version = "0.2.3";

var recycledFragments = {};
var rootlisteners = null;
var initialisedListeners = false;
var t7dependency = true;

if (typeof window != "undefined") {
  rootlisteners = {
    click: []
  };
}

function addRootDomEventListerners() {
  initialisedListeners = true;
  if(rootlisteners !== null) {
    document.addEventListener("click", function(e) {
      for(var i = 0; i < rootlisteners.click.length; i = i + 1 | 0) {
        if(rootlisteners.click[i].target === e.target) {
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
  ATTR_ID: 7,
  ATTR_DISABLED: 8,
  ATTR_SELECTED: 9,
  ATTR_CHECKED: 10,
  ATTR_VALUE: 11,
  ATTR_STYLE: 12,
  ATTR_HREF: 13,
  ATTR_LABEL: 14,
  ATTR_TYPE: 15,
  ATTR_PLACEHOLDER: 16,
  ATTR_NAME: 17,
  ATTR_WIDTH: 18,
  ATTR_HEIGHT: 19,
  //will contain other "custom" types, like rowspan etc or custom data-attributes
  ATTR_OTHER: {},
  COMPONENT_PROPS: {}
};

function isString(value) {
  return typeof value === 'string';
}

function isNumber(value) {
  return typeof value === 'number';
}

function isArray(value) {
  return value instanceof Array;
}

function isFunction(value) {
  return typeof value === 'function';
}

function badUpdate() {
  console.warn("Update called on a component that is no longer mounted!");
};

class Component {
  constructor(props) {
    this.props = props;
    this.state = {};
  }
  render() {}
  forceUpdate() {}
  setState(newStateItems) {
    for(var stateItem in newStateItems) {
      this.state[stateItem] = newStateItems[stateItem];
    }
    this.forceUpdate();
  }
  replaceState(newState) {
    this.state = newSate;
    this.forceUpdate();
  }
  componentDidMount() {}
  componentWillMount() {}
  componentWillUnmount() {}
}

Inferno.Component = Component;

Inferno.template = {};

Inferno.setT7Dependency = function(hast7dependency) {
  t7dependency = hast7dependency;
};

Inferno.template.createElement = function(tag) {
  if(isBrowser) {
    return document.createElement(tag);
  }
};

Inferno.template.createComponent = function(parentDom, props, t7component) {
  var component = new t7component(props);
  component.context = null;
  component.forceUpdate = Inferno.render.bind(null, component.render.bind(component), parentDom, component);
  component.forceUpdate();

  return component;
};

Inferno.template.createText = function(text) {
  if(isBrowser) {
    return document.createTextNode(text);
  }
};

Inferno.template.createEmptyText = function(text) {
  if(isBrowser) {
    return document.createTextNode("");
  }
};

Inferno.template.addAttributes = function (node, attrs, component) {
  var attrName, attrVal;
  for (attrName in attrs) {
    attrVal = attrs[attrName];

    if (events[attrName] != null) {
      clearEventListeners(node, component, attrName);
      addEventListener(node, component, attrName, attrVal);
      continue;
    }

    //to improve creation performance, this attempts to use properties rather than attributes on common types
    switch (attrName) {
      case "class":
      case "className":
        node.className = attrVal;
        break;
      case "id":
        node.id = attrVal;
        break;
      case "href":
        node.href = attrVal;
        break;
      case "value":
        node.value = attrVal;
        break;
      case "name":
        node.name = attrVal;
        break;
      case "disabled":
        node.disabled = attrVal;
        break;
      case "selected":
        node.selected = attrVal;
        break;
      case "checked":
        node.checked = attrVal;
        break;
      default:
        node.setAttribute(attrName, attrVal);
    }
  }
};

Inferno.template.createFragment = function() {
  if(isBrowser) {
    return document.createDocumentFragment();
  }
};

//this was added so vdom lovers can still use their beloved vdom API from React :)
//this won't be performant and should only be used for prototyping/testing/experimenting
//note, props/attrs will not update with this current implementation
Inferno.vdom = {};

Inferno.vdom.createElement = function(tag, props, ...children) {
  console.warn("Inferno.vdom.createElement() is purely experimental, "
   + "it's performance will be poor and attributes/properities will not update (as of yet)");

  if(children.length === 1) {
    children = children[0];
  }
  //we need to create a template for this
  function template(fragment) {
    var root = Inferno.template.createElement(tag);
    fragment.templateElement = root;

    if (typeof children !== "object") {
      fragment.templateType = Inferno.Type.TEXT;
      root.textContent = children;
    } else {
      if (children instanceof Array) {
        fragment.templateType = Inferno.Type.LIST;
      } else {
        fragment.templateType = Inferno.Type.FRAGMENT;
      }
    }

    if(props) {
      Inferno.template.addAttributes(root, props);
    }
    fragment.dom = root;
  }

  return Inferno.createFragment(children, template);
};

var templateKeyMap = new WeakMap();

//this function is really only intended to be used for DEV purposes
Inferno.createFragment = function(values, template) {
  if(template.key === undefined) {
    //if the template function is missing a key property, we'll need to make one
    var templateKeyLookup = templateKeyMap.get(template);
    if (templateKeyLookup === undefined) {
      var key = Symbol();
      templateKeyMap.set(template, key);
      //this was considerably faster than Symbol()
      template.key = "tpl" + Math.floor(Math.random() * 100000);
    }
  }
  if(values instanceof Array) {
    return {
      dom: null,
      key: null,
      next: null,
      template: template,
      templateElements: null,
      templateTypes: null,
      templateValues: values
    };
  } else {
    return {
      dom: null,
      key: null,
      next: null,
      template: template,
      templateElement: null,
      templateType: null,
      templateValue: values
    };
  }
};

Inferno.unmountComponentAtNode = function(dom) {
  var context = getContext(dom);
  if(context !== null) {
    var component = context.fragment.component;
    if(component) {
      removeFragment(context, dom, component.fragment);
      unmountComponentAtFragment(component.fragment);
    } else {
      removeFragment(context, dom, context.fragment);
      removeContext(dom);
    }
  }
};

function getRecycledFragment(templateKey) {
  var fragments = recycledFragments[templateKey];
  if(!fragments || fragments.length === 0) {
    return null;
  }
  return fragments.pop();
}

function attachFragmentList(context, list, parentDom, component) {
  for(var i = 0; i < list.length; i++) {
    attachFragment(context, list[i], parentDom, component);
  }
}

function unmountComponentAtFragment(fragment) {
  var component = fragment.component;
  component.componentWillUnmount();
  removeContext(component.context.dom);
  component.forceUpdate = badUpdate;
  component.context = null;
  component = null;
}

function updateFragmentList(context, oldList, list, parentDom, component, outerNextFragment) {
  var oldListLength = oldList.length;
  var listLength = list.length;

  if(listLength === 0) {
    removeFragments(context, parentDom, oldList, 0, oldListLength);
    return;
  } else if (oldListLength === 0) {
    attachFragmentList(context, list, parentDom, component);
    return;
  }

  var oldEndIndex = oldListLength - 1;
  var endIndex = listLength - 1;
  var oldStartIndex = 0, startIndex = 0;
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
      oldStartIndex++; startIndex++;
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
      oldEndIndex--; endIndex--;
      if (oldStartIndex > oldEndIndex || startIndex > endIndex) {
        break outer;
      }
      oldEndItem = oldList[oldEndIndex];
      endItem = list[endIndex];
      successful = true;
    }
    while (oldStartItem.key === endItem.key) {
      nextItem = (endIndex + 1 < listLength) ? list[endIndex + 1] : outerNextFragment;
      updateFragment(context, oldStartItem, endItem, parentDom, component);
      moveFragment(parentDom, endItem, nextItem)
      oldStartIndex++; endIndex--;
      if (oldStartIndex > oldEndIndex || startIndex > endIndex) {
        break outer;
      }
      oldStartItem = oldList[oldStartIndex];
      endItem = list[endIndex];
      successful = true;
    }
    while (oldEndItem.key === startItem.key) {
      nextItem = (oldStartIndex < oldListLength) ? oldList[oldStartIndex] : outerNextFragment;
      updateFragment(context, oldEndItem, startItem, parentDom, component);
      moveFragment(parentDom, startItem, nextItem)
      oldEndIndex--; startIndex++;
      if (oldStartIndex > oldEndIndex || startIndex > endIndex) {
        break outer;
      }
      oldEndItem = oldList[oldEndIndex];
      startItem = list[startIndex];
      successful = true;
    }
  }
  if (oldStartIndex > oldEndIndex) {
    nextItem = (endIndex + 1 < listLength) ? list[endIndex + 1] : outerNextFragment;
    for (i = startIndex; i <= endIndex; i++) {
      item = list[i];
      attachFragment(context, item, parentDom, component, nextItem);
    }
  } else if (startIndex > endIndex) {
    removeFragments(context, parentDom, oldList, oldStartIndex, oldEndIndex + 1);
  } else {
    var i, oldNextItem = (oldEndIndex + 1 >= oldListLength ? null : oldList[oldEndIndex + 1]);
    var oldListMap = {};
    for (i = oldEndIndex; i >= oldStartIndex; i--) {
      oldItem = oldList[i];
      oldItem.next = oldNextItem;
      oldListMap[oldItem.key] = oldItem;
      oldNextItem = oldItem;
    }
    nextItem = (endIndex + 1 < listLength) ? list[endIndex + 1] : outerNextFragment;
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

//TODO updateFragmentValue and updateFragmentValues uses *similar* code, that could be
//refactored to by more DRY. although, this causes a significant performance cost
//on the v8 compiler. need to explore how to refactor without introducing this performance cost
function updateFragmentValue(context, oldFragment, fragment, parentDom, component) {
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
        element.className = fragment.templateValue;
        return;
      case Inferno.Type.ATTR_CHECKED:
        element.checked = fragment.templateValue;
        return;
      case Inferno.Type.ATTR_SELECTED:
        element.selected = fragment.templateValue;
        return;
      case Inferno.Type.ATTR_DISABLED:
        element.disabled = fragment.templateValue;
        return;
      case Inferno.Type.ATTR_HREF:
        element.href = fragment.templateValue;
        return;
      case Inferno.Type.ATTR_ID:
        element.id = fragment.templateValue;
        return;
      case Inferno.Type.ATTR_VALUE:
        element.value = fragment.templateValue;
        return;
      case Inferno.Type.ATTR_NAME:
        element.name = fragment.templateValue;
        return;
      case Inferno.Type.ATTR_TYPE:
        element.type = fragment.templateValue;
        return;
      case Inferno.Type.ATTR_LABEL:
        element.label = fragment.templateValue;
        return;
      case Inferno.Type.ATTR_PLACEHOLDER:
        element.placeholder = fragment.templateValue;
        return;
      case Inferno.Type.ATTR_STYLE:
        //TODO
        return;
      case Inferno.Type.ATTR_WIDTH:
        element.width = fragment.templateValue;
        return;
      case Inferno.Type.ATTR_HEIGHT:
        element.height = fragment.templateValue;
        return;
      default:
        if (!element.props) {
          if (events[type] != null) {
            clearEventListeners(element, component, type);
            addEventListener(element, component, type, fragment.templateValue);
          } else {
            element.setAttribute(type, fragment.templateValue);
          }
        }
        //component prop, update it
        else {
          //TODO make component props work for single value fragments
        }
        return;
    }
  }
}

//TODO updateFragmentValue and updateFragmentValues uses *similar* code, that could be
//refactored to by more DRY. although, this causes a significant performance cost
//on the v8 compiler. need to explore how to refactor without introducing this performance cost
function updateFragmentValues(context, oldFragment, fragment, parentDom, component) {
  var componentsToUpdate = [], i;

  for (i = 0, length = fragment.templateValues.length; i < length; i++) {
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
        case Inferno.Type.ATTR_CHECKED:
          element.checked = fragment.templateValues[i];
          break;
        case Inferno.Type.ATTR_SELECTED:
          element.selected = fragment.templateValues[i];
          break;
        case Inferno.Type.ATTR_DISABLED:
          element.disabled = fragment.templateValues[i];
          break;
        case Inferno.Type.ATTR_HREF:
          element.href = fragment.templateValues[i];
          break;
        case Inferno.Type.ATTR_ID:
          element.id = fragment.templateValues[i];
          break;
        case Inferno.Type.ATTR_VALUE:
          element.value = fragment.templateValues[i];
          break;
        case Inferno.Type.ATTR_NAME:
          element.name = fragment.templateValues[i];
          break;
        case Inferno.Type.ATTR_TYPE:
          element.type = fragment.templateValues[i];
          break;
        case Inferno.Type.ATTR_LABEL:
          element.label = fragment.templateValues[i];
          break;
        case Inferno.Type.ATTR_PLACEHOLDER:
          element.placeholder = fragment.templateValues[i];
          break;
        case Inferno.Type.ATTR_STYLE:
          //TODO
          break;
        case Inferno.Type.ATTR_WIDTH:
          element.width = fragment.templateValues[i];
          break;
        case Inferno.Type.ATTR_HEIGHT:
          element.height = fragment.templateValues[i];
          break;
        default:
          //custom attribute, so simply setAttribute it
          if (!element.props) {
            if (events[type] != null) {
              clearEventListeners(element, component, type);
              addEventListener(element, component, type, fragment.templateValues[i]);
            } else {
              element.setAttribute(type, fragment.templateValues[i]);
            }
          }
          //component prop, update it
          else {
              element.props[type] = fragment.templateValues[i];
              var alreadyInQueue = false;
              for (s = 0; s < componentsToUpdate.length; s++) {
                if (componentsToUpdate[s] === element) {
                  alreadyInQueue = true;
                }
              }
              if (alreadyInQueue === false) {
                componentsToUpdate.push(element);
              }
            }
          break;
      }
    }
  }
  if (componentsToUpdate.length > 0) {
    for (i = 0; i < componentsToUpdate.length; i++) {
      componentsToUpdate[i].forceUpdate();
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
    if (oldFragment.component) {
      var oldComponentFragment = oldFragment.component.context.fragment;
      unmountComponentAtFragment(oldFragment);
      attachFragment(context, fragment, parentDom, component, oldComponentFragment, true);
    } else {
      attachFragment(context, fragment, parentDom, component, oldFragment, true);
    }
  } else {
    var fragmentComponent = oldFragment.component;

    //if this fragment is a component
    if (fragmentComponent) {
      fragmentComponent.props = fragment.props;
      fragmentComponent.forceUpdate();
      fragment.component = fragmentComponent;
      return;
    }

    //ensure we reference the new fragment with the old fragment's DOM node
    fragment.dom = oldFragment.dom;

    if (fragment.templateValue) {
      //update a single value in the fragement (templateValue rather than templateValues)
      updateFragmentValue(context, oldFragment, fragment, parentDom, component);
    } else if (fragment.templateValues) {
      //updates all values within the fragment (templateValues is an array)
      updateFragmentValues(context, oldFragment, fragment, parentDom, component);
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
    //the user can optionally opt out of using the t7 dependency, thus removing the requirement
    //to pass the t7 reference into the template constructor
    if (t7dependency === true) {
      template(fragment, fragment.t7ref);
    } else {
      template(fragment);
    }

    //if this fragment has a single value, we attach only that value
    if (fragment.templateValue) {
      switch (fragment.templateType) {
        case Inferno.Type.LIST:
          attachFragmentList(context, fragment.templateValue, fragment.templateElement, component);
          break;
        case Inferno.Type.LIST_REPLACE:
          //TODO need to add this
          break;
        case Inferno.Type.FRAGMENT:
          attachFragment(context, fragment.templateValue, fragment.templateElement, component);
          break;
        case Inferno.Type.FRAGMENT_REPLACE:
          attachFragment(context, fragment.templateValue, parentDom, component, fragment.templateElement, true);
          fragment.templateElement = fragment.templateValue.dom.parentNode;
          break;
      }
    } else if (fragment.templateValues) {
      //if the fragment has multiple values, we must loop through them all and attach them
      //pulling this block of code out into its own function caused strange things to happen
      //with performance. it was faster in Gecko but far slower in v8
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
            //TODO do we need this still?
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
  for(var i = 0; i < contexts.length; i++) {
    if (contexts[i].dom === dom) {
      contexts.splice(i, 1);
      return;
    }
  }
}

function getContext(dom) {
  for(var i = 0; i < contexts.length; i++) {
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
      var activeElement = document.activeElement;
      updateFragment(context, context.fragment, fragment, dom, component, false);
      context.fragment = fragment;
      maintainFocus(activeElement);
    }
  } else {
    if (component.context === null) {
      generatedFragment = fragment();
      context = component.context = {
        fragment: generatedFragment,
        dom: dom,
        shouldRecycle: true
      };
      component.componentWillMount();
      attachFragment(context, generatedFragment, dom, component);
      component.componentDidMount();
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
    if(!domNextFragment) {
      domNextFragment = nextFragment;
      parentDom = domNextFragment.parentNode;
      noDestroy = true;
    }
    if (replace) {
      if(noDestroy === false) {
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
  var templateKey;

  //long winded approach, but components have their own context which is how we find their template keys
  if(fragment.component) {
    templateKey = fragment.component.context.fragment.template.key;
  } else {
    templateKey = fragment.template.key;
  }

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

function maintainFocus(previousActiveElement) {
    if (previousActiveElement && previousActiveElement != document.body && previousActiveElement != document.activeElement) {
        previousActiveElement.focus();
    }
}

module.exports = Inferno;
