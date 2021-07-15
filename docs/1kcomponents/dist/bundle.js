(function () {
  'use strict';

  function _extends() {
    _extends = Object.assign || function (target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];

        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }

      return target;
    };

    return _extends.apply(this, arguments);
  }

  function _inheritsLoose(subClass, superClass) {
    subClass.prototype = Object.create(superClass.prototype);
    subClass.prototype.constructor = subClass;

    _setPrototypeOf(subClass, superClass);
  }

  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };

    return _setPrototypeOf(o, p);
  }

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  var isArray = Array.isArray;
  function isStringOrNumber(o) {
      var type = typeof o;
      return type === 'string' || type === 'number';
  }
  function isNullOrUndef(o) {
      return o === void 0 || o === null;
  }
  function isInvalid(o) {
      return o === null || o === false || o === true || o === void 0;
  }
  function isFunction(o) {
      return typeof o === 'function';
  }
  function isString(o) {
      return typeof o === 'string';
  }
  function isNumber(o) {
      return typeof o === 'number';
  }
  function isNull(o) {
      return o === null;
  }
  function isUndefined(o) {
      return o === void 0;
  }
  function combineFrom(first, second) {
      var out = {};
      if (first) {
          for (var key in first) {
              out[key] = first[key];
          }
      }
      if (second) {
          for (var key$1 in second) {
              out[key$1] = second[key$1];
          }
      }
      return out;
  }
  // object.event should always be function, otherwise its badly created object.
  function isLinkEventObject(o) {
      return !isNull(o) && typeof o === 'object';
  }

  // We need EMPTY_OBJ defined in one place.
  // Its used for comparison so we cant inline it into shared
  var EMPTY_OBJ = {};
  function normalizeEventName(name) {
      return name.substr(2).toLowerCase();
  }
  function appendChild(parentDOM, dom) {
      parentDOM.appendChild(dom);
  }
  function insertOrAppend(parentDOM, newNode, nextNode) {
      if (isNull(nextNode)) {
          appendChild(parentDOM, newNode);
      }
      else {
          parentDOM.insertBefore(newNode, nextNode);
      }
  }
  function documentCreateElement(tag, isSVG) {
      if (isSVG) {
          return document.createElementNS('http://www.w3.org/2000/svg', tag);
      }
      return document.createElement(tag);
  }
  function replaceChild(parentDOM, newDom, lastDom) {
      parentDOM.replaceChild(newDom, lastDom);
  }
  function removeChild(parentDOM, childNode) {
      parentDOM.removeChild(childNode);
  }
  function callAll(arrayFn) {
      for (var i = 0; i < arrayFn.length; i++) {
          arrayFn[i]();
      }
  }
  function findChildVNode(vNode, startEdge, flags) {
      var children = vNode.children;
      if (flags & 4 /* ComponentClass */) {
          return children.$LI;
      }
      if (flags & 8192 /* Fragment */) {
          return vNode.childFlags === 2 /* HasVNodeChildren */ ? children : children[startEdge ? 0 : children.length - 1];
      }
      return children;
  }
  function findDOMfromVNode(vNode, startEdge) {
      var flags;
      while (vNode) {
          flags = vNode.flags;
          if (flags & 2033 /* DOMRef */) {
              return vNode.dom;
          }
          vNode = findChildVNode(vNode, startEdge, flags);
      }
      return null;
  }
  function removeVNodeDOM(vNode, parentDOM) {
      do {
          var flags = vNode.flags;
          if (flags & 2033 /* DOMRef */) {
              removeChild(parentDOM, vNode.dom);
              return;
          }
          var children = vNode.children;
          if (flags & 4 /* ComponentClass */) {
              vNode = children.$LI;
          }
          if (flags & 8 /* ComponentFunction */) {
              vNode = children;
          }
          if (flags & 8192 /* Fragment */) {
              if (vNode.childFlags === 2 /* HasVNodeChildren */) {
                  vNode = children;
              }
              else {
                  for (var i = 0, len = children.length; i < len; ++i) {
                      removeVNodeDOM(children[i], parentDOM);
                  }
                  return;
              }
          }
      } while (vNode);
  }
  function moveVNodeDOM(vNode, parentDOM, nextNode) {
      do {
          var flags = vNode.flags;
          if (flags & 2033 /* DOMRef */) {
              insertOrAppend(parentDOM, vNode.dom, nextNode);
              return;
          }
          var children = vNode.children;
          if (flags & 4 /* ComponentClass */) {
              vNode = children.$LI;
          }
          if (flags & 8 /* ComponentFunction */) {
              vNode = children;
          }
          if (flags & 8192 /* Fragment */) {
              if (vNode.childFlags === 2 /* HasVNodeChildren */) {
                  vNode = children;
              }
              else {
                  for (var i = 0, len = children.length; i < len; ++i) {
                      moveVNodeDOM(children[i], parentDOM, nextNode);
                  }
                  return;
              }
          }
      } while (vNode);
  }
  function createDerivedState(instance, nextProps, state) {
      if (instance.constructor.getDerivedStateFromProps) {
          return combineFrom(state, instance.constructor.getDerivedStateFromProps(nextProps, state));
      }
      return state;
  }
  var renderCheck = {
      v: false
  };
  var options = {
      componentComparator: null,
      createVNode: null,
      renderComplete: null
  };
  function setTextContent(dom, children) {
      dom.textContent = children;
  }
  // Calling this function assumes, nextValue is linkEvent
  function isLastValueSameLinkEvent(lastValue, nextValue) {
      return (isLinkEventObject(lastValue) &&
          lastValue.event === nextValue.event &&
          lastValue.data === nextValue.data);
  }
  function mergeUnsetProperties(to, from) {
      for (var propName in from) {
          if (isUndefined(to[propName])) {
              to[propName] = from[propName];
          }
      }
      return to;
  }
  function safeCall1(method, arg1) {
      return !!isFunction(method) && (method(arg1), true);
  }

  var keyPrefix = '$';
  function V(childFlags, children, className, flags, key, props, ref, type) {
      this.childFlags = childFlags;
      this.children = children;
      this.className = className;
      this.dom = null;
      this.flags = flags;
      this.key = key === void 0 ? null : key;
      this.props = props === void 0 ? null : props;
      this.ref = ref === void 0 ? null : ref;
      this.type = type;
  }
  function createVNode(flags, type, className, children, childFlags, props, key, ref) {
      var childFlag = childFlags === void 0 ? 1 /* HasInvalidChildren */ : childFlags;
      var vNode = new V(childFlag, children, className, flags, key, props, ref, type);
      if (childFlag === 0 /* UnknownChildren */) {
          normalizeChildren(vNode, vNode.children);
      }
      return vNode;
  }
  function mergeDefaultHooks(flags, type, ref) {
      if (flags & 4 /* ComponentClass */) {
          return ref;
      }
      var defaultHooks = (flags & 32768 /* ForwardRef */ ? type.render : type).defaultHooks;
      if (isNullOrUndef(defaultHooks)) {
          return ref;
      }
      if (isNullOrUndef(ref)) {
          return defaultHooks;
      }
      return mergeUnsetProperties(ref, defaultHooks);
  }
  function mergeDefaultProps(flags, type, props) {
      // set default props
      var defaultProps = (flags & 32768 /* ForwardRef */ ? type.render : type).defaultProps;
      if (isNullOrUndef(defaultProps)) {
          return props;
      }
      if (isNullOrUndef(props)) {
          return combineFrom(defaultProps, null);
      }
      return mergeUnsetProperties(props, defaultProps);
  }
  function resolveComponentFlags(flags, type) {
      if (flags & 12 /* ComponentKnown */) {
          return flags;
      }
      if (type.prototype && type.prototype.render) {
          return 4 /* ComponentClass */;
      }
      if (type.render) {
          return 32776 /* ForwardRefComponent */;
      }
      return 8 /* ComponentFunction */;
  }
  function createComponentVNode(flags, type, props, key, ref) {
      flags = resolveComponentFlags(flags, type);
      var vNode = new V(1 /* HasInvalidChildren */, null, null, flags, key, mergeDefaultProps(flags, type, props), mergeDefaultHooks(flags, type, ref), type);
      return vNode;
  }
  function createTextVNode(text, key) {
      return new V(1 /* HasInvalidChildren */, isNullOrUndef(text) || text === true || text === false ? '' : text, null, 16 /* Text */, key, null, null, null);
  }
  function createFragment(children, childFlags, key) {
      var fragment = createVNode(8192 /* Fragment */, 8192 /* Fragment */, null, children, childFlags, null, key, null);
      switch (fragment.childFlags) {
          case 1 /* HasInvalidChildren */:
              fragment.children = createVoidVNode();
              fragment.childFlags = 2 /* HasVNodeChildren */;
              break;
          case 16 /* HasTextChildren */:
              fragment.children = [createTextVNode(children)];
              fragment.childFlags = 4 /* HasNonKeyedChildren */;
              break;
      }
      return fragment;
  }
  /*
   * Fragment is different than normal vNode,
   * because when it needs to be cloned we need to clone its children too
   * But not normalize, because otherwise those possibly get KEY and re-mount
   */
  function cloneFragment(vNodeToClone) {
      var oldChildren = vNodeToClone.children;
      var childFlags = vNodeToClone.childFlags;
      return createFragment(childFlags === 2 /* HasVNodeChildren */ ? directClone(oldChildren) : oldChildren.map(directClone), childFlags, vNodeToClone.key);
  }
  function directClone(vNodeToClone) {
      var flags = vNodeToClone.flags & -16385 /* ClearInUse */;
      var props = vNodeToClone.props;
      if (flags & 14 /* Component */) {
          if (!isNull(props)) {
              var propsToClone = props;
              props = {};
              for (var key in propsToClone) {
                  props[key] = propsToClone[key];
              }
          }
      }
      if ((flags & 8192 /* Fragment */) === 0) {
          return new V(vNodeToClone.childFlags, vNodeToClone.children, vNodeToClone.className, flags, vNodeToClone.key, props, vNodeToClone.ref, vNodeToClone.type);
      }
      return cloneFragment(vNodeToClone);
  }
  function createVoidVNode() {
      return createTextVNode('', null);
  }
  function _normalizeVNodes(nodes, result, index, currentKey) {
      for (var len = nodes.length; index < len; index++) {
          var n = nodes[index];
          if (!isInvalid(n)) {
              var newKey = currentKey + keyPrefix + index;
              if (isArray(n)) {
                  _normalizeVNodes(n, result, 0, newKey);
              }
              else {
                  if (isStringOrNumber(n)) {
                      n = createTextVNode(n, newKey);
                  }
                  else {
                      var oldKey = n.key;
                      var isPrefixedKey = isString(oldKey) && oldKey[0] === keyPrefix;
                      if (n.flags & 81920 /* InUseOrNormalized */ || isPrefixedKey) {
                          n = directClone(n);
                      }
                      n.flags |= 65536 /* Normalized */;
                      if (!isPrefixedKey) {
                          if (isNull(oldKey)) {
                              n.key = newKey;
                          }
                          else {
                              n.key = currentKey + oldKey;
                          }
                      }
                      else if (oldKey.substring(0, currentKey.length) !== currentKey) {
                          n.key = currentKey + oldKey;
                      }
                  }
                  result.push(n);
              }
          }
      }
  }
  function normalizeChildren(vNode, children) {
      var newChildren;
      var newChildFlags = 1 /* HasInvalidChildren */;
      // Don't change children to match strict equal (===) true in patching
      if (isInvalid(children)) {
          newChildren = children;
      }
      else if (isStringOrNumber(children)) {
          newChildFlags = 16 /* HasTextChildren */;
          newChildren = children;
      }
      else if (isArray(children)) {
          var len = children.length;
          for (var i = 0; i < len; ++i) {
              var n = children[i];
              if (isInvalid(n) || isArray(n)) {
                  newChildren = newChildren || children.slice(0, i);
                  _normalizeVNodes(children, newChildren, i, '');
                  break;
              }
              else if (isStringOrNumber(n)) {
                  newChildren = newChildren || children.slice(0, i);
                  newChildren.push(createTextVNode(n, keyPrefix + i));
              }
              else {
                  var key = n.key;
                  var needsCloning = (n.flags & 81920 /* InUseOrNormalized */) > 0;
                  var isNullKey = isNull(key);
                  var isPrefixed = isString(key) && key[0] === keyPrefix;
                  if (needsCloning || isNullKey || isPrefixed) {
                      newChildren = newChildren || children.slice(0, i);
                      if (needsCloning || isPrefixed) {
                          n = directClone(n);
                      }
                      if (isNullKey || isPrefixed) {
                          n.key = keyPrefix + i;
                      }
                      newChildren.push(n);
                  }
                  else if (newChildren) {
                      newChildren.push(n);
                  }
                  n.flags |= 65536 /* Normalized */;
              }
          }
          newChildren = newChildren || children;
          if (newChildren.length === 0) {
              newChildFlags = 1 /* HasInvalidChildren */;
          }
          else {
              newChildFlags = 8 /* HasKeyedChildren */;
          }
      }
      else {
          newChildren = children;
          newChildren.flags |= 65536 /* Normalized */;
          if (children.flags & 81920 /* InUseOrNormalized */) {
              newChildren = directClone(children);
          }
          newChildFlags = 2 /* HasVNodeChildren */;
      }
      vNode.children = newChildren;
      vNode.childFlags = newChildFlags;
      return vNode;
  }
  function normalizeRoot(input) {
      if (isInvalid(input) || isStringOrNumber(input)) {
          return createTextVNode(input, null);
      }
      if (isArray(input)) {
          return createFragment(input, 0 /* UnknownChildren */, null);
      }
      return input.flags & 16384 /* InUse */ ? directClone(input) : input;
  }

  var xlinkNS = 'http://www.w3.org/1999/xlink';
  var xmlNS = 'http://www.w3.org/XML/1998/namespace';
  var namespaces = {
      'xlink:actuate': xlinkNS,
      'xlink:arcrole': xlinkNS,
      'xlink:href': xlinkNS,
      'xlink:role': xlinkNS,
      'xlink:show': xlinkNS,
      'xlink:title': xlinkNS,
      'xlink:type': xlinkNS,
      'xml:base': xmlNS,
      'xml:lang': xmlNS,
      'xml:space': xmlNS
  };

  function getDelegatedEventObject(v) {
      return {
          onClick: v,
          onDblClick: v,
          onFocusIn: v,
          onFocusOut: v,
          onKeyDown: v,
          onKeyPress: v,
          onKeyUp: v,
          onMouseDown: v,
          onMouseMove: v,
          onMouseUp: v,
          onTouchEnd: v,
          onTouchMove: v,
          onTouchStart: v
      };
  }
  var attachedEventCounts = getDelegatedEventObject(0);
  var attachedEvents = getDelegatedEventObject(null);
  var syntheticEvents = getDelegatedEventObject(true);
  function updateOrAddSyntheticEvent(name, dom) {
      var eventsObject = dom.$EV;
      if (!eventsObject) {
          eventsObject = dom.$EV = getDelegatedEventObject(null);
      }
      if (!eventsObject[name]) {
          if (++attachedEventCounts[name] === 1) {
              attachedEvents[name] = attachEventToDocument(name);
          }
      }
      return eventsObject;
  }
  function unmountSyntheticEvent(name, dom) {
      var eventsObject = dom.$EV;
      if (eventsObject && eventsObject[name]) {
          if (--attachedEventCounts[name] === 0) {
              document.removeEventListener(normalizeEventName(name), attachedEvents[name]);
              attachedEvents[name] = null;
          }
          eventsObject[name] = null;
      }
  }
  function handleSyntheticEvent(name, lastEvent, nextEvent, dom) {
      if (isFunction(nextEvent)) {
          updateOrAddSyntheticEvent(name, dom)[name] = nextEvent;
      }
      else if (isLinkEventObject(nextEvent)) {
          if (isLastValueSameLinkEvent(lastEvent, nextEvent)) {
              return;
          }
          updateOrAddSyntheticEvent(name, dom)[name] = nextEvent;
      }
      else {
          unmountSyntheticEvent(name, dom);
      }
  }
  // When browsers fully support event.composedPath we could loop it through instead of using parentNode property
  function getTargetNode(event) {
      return isFunction(event.composedPath) ? event.composedPath()[0] : event.target;
  }
  function dispatchEvents(event, isClick, name, eventData) {
      var dom = getTargetNode(event);
      do {
          // Html Nodes can be nested fe: span inside button in that scenario browser does not handle disabled attribute on parent,
          // because the event listener is on document.body
          // Don't process clicks on disabled elements
          if (isClick && dom.disabled) {
              return;
          }
          var eventsObject = dom.$EV;
          if (eventsObject) {
              var currentEvent = eventsObject[name];
              if (currentEvent) {
                  // linkEvent object
                  eventData.dom = dom;
                  currentEvent.event ? currentEvent.event(currentEvent.data, event) : currentEvent(event);
                  if (event.cancelBubble) {
                      return;
                  }
              }
          }
          dom = dom.parentNode;
      } while (!isNull(dom));
  }
  function stopPropagation() {
      this.cancelBubble = true;
      if (!this.immediatePropagationStopped) {
          this.stopImmediatePropagation();
      }
  }
  function isDefaultPrevented() {
      return this.defaultPrevented;
  }
  function isPropagationStopped() {
      return this.cancelBubble;
  }
  function extendEventProperties(event) {
      // Event data needs to be object to save reference to currentTarget getter
      var eventData = {
          dom: document
      };
      event.isDefaultPrevented = isDefaultPrevented;
      event.isPropagationStopped = isPropagationStopped;
      event.stopPropagation = stopPropagation;
      Object.defineProperty(event, 'currentTarget', {
          configurable: true,
          get: function get() {
              return eventData.dom;
          }
      });
      return eventData;
  }
  function rootClickEvent(name) {
      return function (event) {
          if (event.button !== 0) {
              // Firefox incorrectly triggers click event for mid/right mouse buttons.
              // This bug has been active for 17 years.
              // https://bugzilla.mozilla.org/show_bug.cgi?id=184051
              event.stopPropagation();
              return;
          }
          dispatchEvents(event, true, name, extendEventProperties(event));
      };
  }
  function rootEvent(name) {
      return function (event) {
          dispatchEvents(event, false, name, extendEventProperties(event));
      };
  }
  function attachEventToDocument(name) {
      var attachedEvent = name === 'onClick' || name === 'onDblClick' ? rootClickEvent(name) : rootEvent(name);
      document.addEventListener(normalizeEventName(name), attachedEvent);
      return attachedEvent;
  }

  function isSameInnerHTML(dom, innerHTML) {
      var tempdom = document.createElement('i');
      tempdom.innerHTML = innerHTML;
      return tempdom.innerHTML === dom.innerHTML;
  }

  function triggerEventListener(props, methodName, e) {
      if (props[methodName]) {
          var listener = props[methodName];
          if (listener.event) {
              listener.event(listener.data, e);
          }
          else {
              listener(e);
          }
      }
      else {
          var nativeListenerName = methodName.toLowerCase();
          if (props[nativeListenerName]) {
              props[nativeListenerName](e);
          }
      }
  }
  function createWrappedFunction(methodName, applyValue) {
      var fnMethod = function (e) {
          var vNode = this.$V;
          // If vNode is gone by the time event fires, no-op
          if (!vNode) {
              return;
          }
          var props = vNode.props || EMPTY_OBJ;
          var dom = vNode.dom;
          if (isString(methodName)) {
              triggerEventListener(props, methodName, e);
          }
          else {
              for (var i = 0; i < methodName.length; ++i) {
                  triggerEventListener(props, methodName[i], e);
              }
          }
          if (isFunction(applyValue)) {
              var newVNode = this.$V;
              var newProps = newVNode.props || EMPTY_OBJ;
              applyValue(newProps, dom, false, newVNode);
          }
      };
      Object.defineProperty(fnMethod, 'wrapped', {
          configurable: false,
          enumerable: false,
          value: true,
          writable: false
      });
      return fnMethod;
  }

  function attachEvent(dom, eventName, handler) {
      var previousKey = "$" + eventName;
      var previousArgs = dom[previousKey];
      if (previousArgs) {
          if (previousArgs[1].wrapped) {
              return;
          }
          dom.removeEventListener(previousArgs[0], previousArgs[1]);
          dom[previousKey] = null;
      }
      if (isFunction(handler)) {
          dom.addEventListener(eventName, handler);
          dom[previousKey] = [eventName, handler];
      }
  }

  function isCheckedType(type) {
      return type === 'checkbox' || type === 'radio';
  }
  var onTextInputChange = createWrappedFunction('onInput', applyValueInput);
  var wrappedOnChange = createWrappedFunction(['onClick', 'onChange'], applyValueInput);
  /* tslint:disable-next-line:no-empty */
  function emptywrapper(event) {
      event.stopPropagation();
  }
  emptywrapper.wrapped = true;
  function inputEvents(dom, nextPropsOrEmpty) {
      if (isCheckedType(nextPropsOrEmpty.type)) {
          attachEvent(dom, 'change', wrappedOnChange);
          attachEvent(dom, 'click', emptywrapper);
      }
      else {
          attachEvent(dom, 'input', onTextInputChange);
      }
  }
  function applyValueInput(nextPropsOrEmpty, dom) {
      var type = nextPropsOrEmpty.type;
      var value = nextPropsOrEmpty.value;
      var checked = nextPropsOrEmpty.checked;
      var multiple = nextPropsOrEmpty.multiple;
      var defaultValue = nextPropsOrEmpty.defaultValue;
      var hasValue = !isNullOrUndef(value);
      if (type && type !== dom.type) {
          dom.setAttribute('type', type);
      }
      if (!isNullOrUndef(multiple) && multiple !== dom.multiple) {
          dom.multiple = multiple;
      }
      if (!isNullOrUndef(defaultValue) && !hasValue) {
          dom.defaultValue = defaultValue + '';
      }
      if (isCheckedType(type)) {
          if (hasValue) {
              dom.value = value;
          }
          if (!isNullOrUndef(checked)) {
              dom.checked = checked;
          }
      }
      else {
          if (hasValue && dom.value !== value) {
              dom.defaultValue = value;
              dom.value = value;
          }
          else if (!isNullOrUndef(checked)) {
              dom.checked = checked;
          }
      }
  }

  function updateChildOptions(vNode, value) {
      if (vNode.type === 'option') {
          updateChildOption(vNode, value);
      }
      else {
          var children = vNode.children;
          var flags = vNode.flags;
          if (flags & 4 /* ComponentClass */) {
              updateChildOptions(children.$LI, value);
          }
          else if (flags & 8 /* ComponentFunction */) {
              updateChildOptions(children, value);
          }
          else if (vNode.childFlags === 2 /* HasVNodeChildren */) {
              updateChildOptions(children, value);
          }
          else if (vNode.childFlags & 12 /* MultipleChildren */) {
              for (var i = 0, len = children.length; i < len; ++i) {
                  updateChildOptions(children[i], value);
              }
          }
      }
  }
  function updateChildOption(vNode, value) {
      var props = vNode.props || EMPTY_OBJ;
      var dom = vNode.dom;
      // we do this as multiple may have changed
      dom.value = props.value;
      if (props.value === value || (isArray(value) && value.indexOf(props.value) !== -1)) {
          dom.selected = true;
      }
      else if (!isNullOrUndef(value) || !isNullOrUndef(props.selected)) {
          dom.selected = props.selected || false;
      }
  }
  var onSelectChange = createWrappedFunction('onChange', applyValueSelect);
  function selectEvents(dom) {
      attachEvent(dom, 'change', onSelectChange);
  }
  function applyValueSelect(nextPropsOrEmpty, dom, mounting, vNode) {
      var multiplePropInBoolean = Boolean(nextPropsOrEmpty.multiple);
      if (!isNullOrUndef(nextPropsOrEmpty.multiple) && multiplePropInBoolean !== dom.multiple) {
          dom.multiple = multiplePropInBoolean;
      }
      var index = nextPropsOrEmpty.selectedIndex;
      if (index === -1) {
          dom.selectedIndex = -1;
      }
      var childFlags = vNode.childFlags;
      if (childFlags !== 1 /* HasInvalidChildren */) {
          var value = nextPropsOrEmpty.value;
          if (isNumber(index) && index > -1 && dom.options[index]) {
              value = dom.options[index].value;
          }
          if (mounting && isNullOrUndef(value)) {
              value = nextPropsOrEmpty.defaultValue;
          }
          updateChildOptions(vNode, value);
      }
  }

  var onTextareaInputChange = createWrappedFunction('onInput', applyValueTextArea);
  var wrappedOnChange$1 = createWrappedFunction('onChange');
  function textAreaEvents(dom, nextPropsOrEmpty) {
      attachEvent(dom, 'input', onTextareaInputChange);
      if (nextPropsOrEmpty.onChange) {
          attachEvent(dom, 'change', wrappedOnChange$1);
      }
  }
  function applyValueTextArea(nextPropsOrEmpty, dom, mounting) {
      var value = nextPropsOrEmpty.value;
      var domValue = dom.value;
      if (isNullOrUndef(value)) {
          if (mounting) {
              var defaultValue = nextPropsOrEmpty.defaultValue;
              if (!isNullOrUndef(defaultValue) && defaultValue !== domValue) {
                  dom.defaultValue = defaultValue;
                  dom.value = defaultValue;
              }
          }
      }
      else if (domValue !== value) {
          /* There is value so keep it controlled */
          dom.defaultValue = value;
          dom.value = value;
      }
  }

  function processElement(flags, vNode, dom, nextPropsOrEmpty, mounting, isControlled) {
      if (flags & 64 /* InputElement */) {
          applyValueInput(nextPropsOrEmpty, dom);
      }
      else if (flags & 256 /* SelectElement */) {
          applyValueSelect(nextPropsOrEmpty, dom, mounting, vNode);
      }
      else if (flags & 128 /* TextareaElement */) {
          applyValueTextArea(nextPropsOrEmpty, dom, mounting);
      }
      if (isControlled) {
          dom.$V = vNode;
      }
  }
  function addFormElementEventHandlers(flags, dom, nextPropsOrEmpty) {
      if (flags & 64 /* InputElement */) {
          inputEvents(dom, nextPropsOrEmpty);
      }
      else if (flags & 256 /* SelectElement */) {
          selectEvents(dom);
      }
      else if (flags & 128 /* TextareaElement */) {
          textAreaEvents(dom, nextPropsOrEmpty);
      }
  }
  function isControlledFormElement(nextPropsOrEmpty) {
      return nextPropsOrEmpty.type && isCheckedType(nextPropsOrEmpty.type) ? !isNullOrUndef(nextPropsOrEmpty.checked) : !isNullOrUndef(nextPropsOrEmpty.value);
  }
  function unmountRef(ref) {
      if (ref) {
          if (!safeCall1(ref, null) && ref.current) {
              ref.current = null;
          }
      }
  }
  function mountRef(ref, value, lifecycle) {
      if (ref && (isFunction(ref) || ref.current !== void 0)) {
          lifecycle.push(function () {
              if (!safeCall1(ref, value) && ref.current !== void 0) {
                  ref.current = value;
              }
          });
      }
  }

  function remove(vNode, parentDOM) {
      unmount(vNode);
      removeVNodeDOM(vNode, parentDOM);
  }
  function unmount(vNode) {
      var flags = vNode.flags;
      var children = vNode.children;
      var ref;
      if (flags & 481 /* Element */) {
          ref = vNode.ref;
          var props = vNode.props;
          unmountRef(ref);
          var childFlags = vNode.childFlags;
          if (!isNull(props)) {
              var keys = Object.keys(props);
              for (var i = 0, len = keys.length; i < len; i++) {
                  var key = keys[i];
                  if (syntheticEvents[key]) {
                      unmountSyntheticEvent(key, vNode.dom);
                  }
              }
          }
          if (childFlags & 12 /* MultipleChildren */) {
              unmountAllChildren(children);
          }
          else if (childFlags === 2 /* HasVNodeChildren */) {
              unmount(children);
          }
      }
      else if (children) {
          if (flags & 4 /* ComponentClass */) {
              if (isFunction(children.componentWillUnmount)) {
                  children.componentWillUnmount();
              }
              unmountRef(vNode.ref);
              children.$UN = true;
              unmount(children.$LI);
          }
          else if (flags & 8 /* ComponentFunction */) {
              ref = vNode.ref;
              if (!isNullOrUndef(ref) && isFunction(ref.onComponentWillUnmount)) {
                  ref.onComponentWillUnmount(findDOMfromVNode(vNode, true), vNode.props || EMPTY_OBJ);
              }
              unmount(children);
          }
          else if (flags & 1024 /* Portal */) {
              remove(children, vNode.ref);
          }
          else if (flags & 8192 /* Fragment */) {
              if (vNode.childFlags & 12 /* MultipleChildren */) {
                  unmountAllChildren(children);
              }
          }
      }
  }
  function unmountAllChildren(children) {
      for (var i = 0, len = children.length; i < len; ++i) {
          unmount(children[i]);
      }
  }
  function clearDOM(dom) {
      // Optimization for clearing dom
      dom.textContent = '';
  }
  function removeAllChildren(dom, vNode, children) {
      unmountAllChildren(children);
      if (vNode.flags & 8192 /* Fragment */) {
          removeVNodeDOM(vNode, dom);
      }
      else {
          clearDOM(dom);
      }
  }

  function wrapLinkEvent(nextValue) {
      // This variable makes sure there is no "this" context in callback
      var ev = nextValue.event;
      return function (e) {
          ev(nextValue.data, e);
      };
  }
  function patchEvent(name, lastValue, nextValue, dom) {
      if (isLinkEventObject(nextValue)) {
          if (isLastValueSameLinkEvent(lastValue, nextValue)) {
              return;
          }
          nextValue = wrapLinkEvent(nextValue);
      }
      attachEvent(dom, normalizeEventName(name), nextValue);
  }
  // We are assuming here that we come from patchProp routine
  // -nextAttrValue cannot be null or undefined
  function patchStyle(lastAttrValue, nextAttrValue, dom) {
      if (isNullOrUndef(nextAttrValue)) {
          dom.removeAttribute('style');
          return;
      }
      var domStyle = dom.style;
      var style;
      var value;
      if (isString(nextAttrValue)) {
          domStyle.cssText = nextAttrValue;
          return;
      }
      if (!isNullOrUndef(lastAttrValue) && !isString(lastAttrValue)) {
          for (style in nextAttrValue) {
              // do not add a hasOwnProperty check here, it affects performance
              value = nextAttrValue[style];
              if (value !== lastAttrValue[style]) {
                  domStyle.setProperty(style, value);
              }
          }
          for (style in lastAttrValue) {
              if (isNullOrUndef(nextAttrValue[style])) {
                  domStyle.removeProperty(style);
              }
          }
      }
      else {
          for (style in nextAttrValue) {
              value = nextAttrValue[style];
              domStyle.setProperty(style, value);
          }
      }
  }
  function patchDangerInnerHTML(lastValue, nextValue, lastVNode, dom) {
      var lastHtml = (lastValue && lastValue.__html) || '';
      var nextHtml = (nextValue && nextValue.__html) || '';
      if (lastHtml !== nextHtml) {
          if (!isNullOrUndef(nextHtml) && !isSameInnerHTML(dom, nextHtml)) {
              if (!isNull(lastVNode)) {
                  if (lastVNode.childFlags & 12 /* MultipleChildren */) {
                      unmountAllChildren(lastVNode.children);
                  }
                  else if (lastVNode.childFlags === 2 /* HasVNodeChildren */) {
                      unmount(lastVNode.children);
                  }
                  lastVNode.children = null;
                  lastVNode.childFlags = 1 /* HasInvalidChildren */;
              }
              dom.innerHTML = nextHtml;
          }
      }
  }
  function patchProp(prop, lastValue, nextValue, dom, isSVG, hasControlledValue, lastVNode) {
      switch (prop) {
          case 'children':
          case 'childrenType':
          case 'className':
          case 'defaultValue':
          case 'key':
          case 'multiple':
          case 'ref':
          case 'selectedIndex':
              break;
          case 'autoFocus':
              dom.autofocus = !!nextValue;
              break;
          case 'allowfullscreen':
          case 'autoplay':
          case 'capture':
          case 'checked':
          case 'controls':
          case 'default':
          case 'disabled':
          case 'hidden':
          case 'indeterminate':
          case 'loop':
          case 'muted':
          case 'novalidate':
          case 'open':
          case 'readOnly':
          case 'required':
          case 'reversed':
          case 'scoped':
          case 'seamless':
          case 'selected':
              dom[prop] = !!nextValue;
              break;
          case 'defaultChecked':
          case 'value':
          case 'volume':
              if (hasControlledValue && prop === 'value') {
                  break;
              }
              var value = isNullOrUndef(nextValue) ? '' : nextValue;
              if (dom[prop] !== value) {
                  dom[prop] = value;
              }
              break;
          case 'style':
              patchStyle(lastValue, nextValue, dom);
              break;
          case 'dangerouslySetInnerHTML':
              patchDangerInnerHTML(lastValue, nextValue, lastVNode, dom);
              break;
          default:
              if (syntheticEvents[prop]) {
                  handleSyntheticEvent(prop, lastValue, nextValue, dom);
              }
              else if (prop.charCodeAt(0) === 111 && prop.charCodeAt(1) === 110) {
                  patchEvent(prop, lastValue, nextValue, dom);
              }
              else if (isNullOrUndef(nextValue)) {
                  dom.removeAttribute(prop);
              }
              else if (isSVG && namespaces[prop]) {
                  // We optimize for isSVG being false
                  // If we end up in this path we can read property again
                  dom.setAttributeNS(namespaces[prop], prop, nextValue);
              }
              else {
                  dom.setAttribute(prop, nextValue);
              }
              break;
      }
  }
  function mountProps(vNode, flags, props, dom, isSVG) {
      var hasControlledValue = false;
      var isFormElement = (flags & 448 /* FormElement */) > 0;
      if (isFormElement) {
          hasControlledValue = isControlledFormElement(props);
          if (hasControlledValue) {
              addFormElementEventHandlers(flags, dom, props);
          }
      }
      for (var prop in props) {
          // do not add a hasOwnProperty check here, it affects performance
          patchProp(prop, null, props[prop], dom, isSVG, hasControlledValue, null);
      }
      if (isFormElement) {
          processElement(flags, vNode, dom, props, true, hasControlledValue);
      }
  }

  function renderNewInput(instance, props, context) {
      var nextInput = normalizeRoot(instance.render(props, instance.state, context));
      var childContext = context;
      if (isFunction(instance.getChildContext)) {
          childContext = combineFrom(context, instance.getChildContext());
      }
      instance.$CX = childContext;
      return nextInput;
  }
  function createClassComponentInstance(vNode, Component, props, context, isSVG, lifecycle) {
      var instance = new Component(props, context);
      var usesNewAPI = (instance.$N = Boolean(Component.getDerivedStateFromProps || instance.getSnapshotBeforeUpdate));
      instance.$SVG = isSVG;
      instance.$L = lifecycle;
      vNode.children = instance;
      instance.$BS = false;
      instance.context = context;
      if (instance.props === EMPTY_OBJ) {
          instance.props = props;
      }
      if (!usesNewAPI) {
          if (isFunction(instance.componentWillMount)) {
              instance.$BR = true;
              instance.componentWillMount();
              var pending = instance.$PS;
              if (!isNull(pending)) {
                  var state = instance.state;
                  if (isNull(state)) {
                      instance.state = pending;
                  }
                  else {
                      for (var key in pending) {
                          state[key] = pending[key];
                      }
                  }
                  instance.$PS = null;
              }
              instance.$BR = false;
          }
      }
      else {
          instance.state = createDerivedState(instance, props, instance.state);
      }
      instance.$LI = renderNewInput(instance, props, context);
      return instance;
  }
  function renderFunctionalComponent(vNode, context) {
      var props = vNode.props || EMPTY_OBJ;
      return vNode.flags & 32768 /* ForwardRef */ ? vNode.type.render(props, vNode.ref, context) : vNode.type(props, context);
  }

  function mount(vNode, parentDOM, context, isSVG, nextNode, lifecycle) {
      var flags = (vNode.flags |= 16384 /* InUse */);
      if (flags & 481 /* Element */) {
          mountElement(vNode, parentDOM, context, isSVG, nextNode, lifecycle);
      }
      else if (flags & 4 /* ComponentClass */) {
          mountClassComponent(vNode, parentDOM, context, isSVG, nextNode, lifecycle);
      }
      else if (flags & 8 /* ComponentFunction */) {
          mountFunctionalComponent(vNode, parentDOM, context, isSVG, nextNode, lifecycle);
          mountFunctionalComponentCallbacks(vNode, lifecycle);
      }
      else if (flags & 512 /* Void */ || flags & 16 /* Text */) {
          mountText(vNode, parentDOM, nextNode);
      }
      else if (flags & 8192 /* Fragment */) {
          mountFragment(vNode, context, parentDOM, isSVG, nextNode, lifecycle);
      }
      else if (flags & 1024 /* Portal */) {
          mountPortal(vNode, context, parentDOM, nextNode, lifecycle);
      }
      else ;
  }
  function mountPortal(vNode, context, parentDOM, nextNode, lifecycle) {
      mount(vNode.children, vNode.ref, context, false, null, lifecycle);
      var placeHolderVNode = createVoidVNode();
      mountText(placeHolderVNode, parentDOM, nextNode);
      vNode.dom = placeHolderVNode.dom;
  }
  function mountFragment(vNode, context, parentDOM, isSVG, nextNode, lifecycle) {
      var children = vNode.children;
      var childFlags = vNode.childFlags;
      // When fragment is optimized for multiple children, check if there is no children and change flag to invalid
      // This is the only normalization always done, to keep optimization flags API same for fragments and regular elements
      if (childFlags & 12 /* MultipleChildren */ && children.length === 0) {
          childFlags = vNode.childFlags = 2 /* HasVNodeChildren */;
          children = vNode.children = createVoidVNode();
      }
      if (childFlags === 2 /* HasVNodeChildren */) {
          mount(children, parentDOM, nextNode, isSVG, nextNode, lifecycle);
      }
      else {
          mountArrayChildren(children, parentDOM, context, isSVG, nextNode, lifecycle);
      }
  }
  function mountText(vNode, parentDOM, nextNode) {
      var dom = (vNode.dom = document.createTextNode(vNode.children));
      if (!isNull(parentDOM)) {
          insertOrAppend(parentDOM, dom, nextNode);
      }
  }
  function mountElement(vNode, parentDOM, context, isSVG, nextNode, lifecycle) {
      var flags = vNode.flags;
      var props = vNode.props;
      var className = vNode.className;
      var childFlags = vNode.childFlags;
      var dom = (vNode.dom = documentCreateElement(vNode.type, (isSVG = isSVG || (flags & 32 /* SvgElement */) > 0)));
      var children = vNode.children;
      if (!isNullOrUndef(className) && className !== '') {
          if (isSVG) {
              dom.setAttribute('class', className);
          }
          else {
              dom.className = className;
          }
      }
      if (childFlags === 16 /* HasTextChildren */) {
          setTextContent(dom, children);
      }
      else if (childFlags !== 1 /* HasInvalidChildren */) {
          var childrenIsSVG = isSVG && vNode.type !== 'foreignObject';
          if (childFlags === 2 /* HasVNodeChildren */) {
              if (children.flags & 16384 /* InUse */) {
                  vNode.children = children = directClone(children);
              }
              mount(children, dom, context, childrenIsSVG, null, lifecycle);
          }
          else if (childFlags === 8 /* HasKeyedChildren */ || childFlags === 4 /* HasNonKeyedChildren */) {
              mountArrayChildren(children, dom, context, childrenIsSVG, null, lifecycle);
          }
      }
      if (!isNull(parentDOM)) {
          insertOrAppend(parentDOM, dom, nextNode);
      }
      if (!isNull(props)) {
          mountProps(vNode, flags, props, dom, isSVG);
      }
      mountRef(vNode.ref, dom, lifecycle);
  }
  function mountArrayChildren(children, dom, context, isSVG, nextNode, lifecycle) {
      for (var i = 0; i < children.length; ++i) {
          var child = children[i];
          if (child.flags & 16384 /* InUse */) {
              children[i] = child = directClone(child);
          }
          mount(child, dom, context, isSVG, nextNode, lifecycle);
      }
  }
  function mountClassComponent(vNode, parentDOM, context, isSVG, nextNode, lifecycle) {
      var instance = createClassComponentInstance(vNode, vNode.type, vNode.props || EMPTY_OBJ, context, isSVG, lifecycle);
      mount(instance.$LI, parentDOM, instance.$CX, isSVG, nextNode, lifecycle);
      mountClassComponentCallbacks(vNode.ref, instance, lifecycle);
  }
  function mountFunctionalComponent(vNode, parentDOM, context, isSVG, nextNode, lifecycle) {
      mount((vNode.children = normalizeRoot(renderFunctionalComponent(vNode, context))), parentDOM, context, isSVG, nextNode, lifecycle);
  }
  function createClassMountCallback(instance) {
      return function () {
          instance.componentDidMount();
      };
  }
  function mountClassComponentCallbacks(ref, instance, lifecycle) {
      mountRef(ref, instance, lifecycle);
      if (isFunction(instance.componentDidMount)) {
          lifecycle.push(createClassMountCallback(instance));
      }
  }
  function createOnMountCallback(ref, vNode) {
      return function () {
          ref.onComponentDidMount(findDOMfromVNode(vNode, true), vNode.props || EMPTY_OBJ);
      };
  }
  function mountFunctionalComponentCallbacks(vNode, lifecycle) {
      var ref = vNode.ref;
      if (!isNullOrUndef(ref)) {
          safeCall1(ref.onComponentWillMount, vNode.props || EMPTY_OBJ);
          if (isFunction(ref.onComponentDidMount)) {
              lifecycle.push(createOnMountCallback(ref, vNode));
          }
      }
  }

  function replaceWithNewNode(lastVNode, nextVNode, parentDOM, context, isSVG, lifecycle) {
      unmount(lastVNode);
      if ((nextVNode.flags & lastVNode.flags & 2033 /* DOMRef */) !== 0) {
          mount(nextVNode, null, context, isSVG, null, lifecycle);
          // Single DOM operation, when we have dom references available
          replaceChild(parentDOM, nextVNode.dom, lastVNode.dom);
      }
      else {
          mount(nextVNode, parentDOM, context, isSVG, findDOMfromVNode(lastVNode, true), lifecycle);
          removeVNodeDOM(lastVNode, parentDOM);
      }
  }
  function patch(lastVNode, nextVNode, parentDOM, context, isSVG, nextNode, lifecycle) {
      var nextFlags = (nextVNode.flags |= 16384 /* InUse */);
      if (lastVNode.flags !== nextFlags || lastVNode.type !== nextVNode.type || lastVNode.key !== nextVNode.key || nextFlags & 2048 /* ReCreate */) {
          if (lastVNode.flags & 16384 /* InUse */) {
              replaceWithNewNode(lastVNode, nextVNode, parentDOM, context, isSVG, lifecycle);
          }
          else {
              // Last vNode is not in use, it has crashed at application level. Just mount nextVNode and ignore last one
              mount(nextVNode, parentDOM, context, isSVG, nextNode, lifecycle);
          }
      }
      else if (nextFlags & 481 /* Element */) {
          patchElement(lastVNode, nextVNode, context, isSVG, nextFlags, lifecycle);
      }
      else if (nextFlags & 4 /* ComponentClass */) {
          patchClassComponent(lastVNode, nextVNode, parentDOM, context, isSVG, nextNode, lifecycle);
      }
      else if (nextFlags & 8 /* ComponentFunction */) {
          patchFunctionalComponent(lastVNode, nextVNode, parentDOM, context, isSVG, nextNode, lifecycle);
      }
      else if (nextFlags & 16 /* Text */) {
          patchText(lastVNode, nextVNode);
      }
      else if (nextFlags & 512 /* Void */) {
          nextVNode.dom = lastVNode.dom;
      }
      else if (nextFlags & 8192 /* Fragment */) {
          patchFragment(lastVNode, nextVNode, parentDOM, context, isSVG, lifecycle);
      }
      else {
          patchPortal(lastVNode, nextVNode, context, lifecycle);
      }
  }
  function patchSingleTextChild(lastChildren, nextChildren, parentDOM) {
      if (lastChildren !== nextChildren) {
          if (lastChildren !== '') {
              parentDOM.firstChild.nodeValue = nextChildren;
          }
          else {
              setTextContent(parentDOM, nextChildren);
          }
      }
  }
  function patchContentEditableChildren(dom, nextChildren) {
      if (dom.textContent !== nextChildren) {
          dom.textContent = nextChildren;
      }
  }
  function patchFragment(lastVNode, nextVNode, parentDOM, context, isSVG, lifecycle) {
      var lastChildren = lastVNode.children;
      var nextChildren = nextVNode.children;
      var lastChildFlags = lastVNode.childFlags;
      var nextChildFlags = nextVNode.childFlags;
      var nextNode = null;
      // When fragment is optimized for multiple children, check if there is no children and change flag to invalid
      // This is the only normalization always done, to keep optimization flags API same for fragments and regular elements
      if (nextChildFlags & 12 /* MultipleChildren */ && nextChildren.length === 0) {
          nextChildFlags = nextVNode.childFlags = 2 /* HasVNodeChildren */;
          nextChildren = nextVNode.children = createVoidVNode();
      }
      var nextIsSingle = (nextChildFlags & 2 /* HasVNodeChildren */) !== 0;
      if (lastChildFlags & 12 /* MultipleChildren */) {
          var lastLen = lastChildren.length;
          // We need to know Fragment's edge node when
          if (
          // It uses keyed algorithm
          (lastChildFlags & 8 /* HasKeyedChildren */ && nextChildFlags & 8 /* HasKeyedChildren */) ||
              // It transforms from many to single
              nextIsSingle ||
              // It will append more nodes
              (!nextIsSingle && nextChildren.length > lastLen)) {
              // When fragment has multiple children there is always at least one vNode
              nextNode = findDOMfromVNode(lastChildren[lastLen - 1], false).nextSibling;
          }
      }
      patchChildren(lastChildFlags, nextChildFlags, lastChildren, nextChildren, parentDOM, context, isSVG, nextNode, lastVNode, lifecycle);
  }
  function patchPortal(lastVNode, nextVNode, context, lifecycle) {
      var lastContainer = lastVNode.ref;
      var nextContainer = nextVNode.ref;
      var nextChildren = nextVNode.children;
      patchChildren(lastVNode.childFlags, nextVNode.childFlags, lastVNode.children, nextChildren, lastContainer, context, false, null, lastVNode, lifecycle);
      nextVNode.dom = lastVNode.dom;
      if (lastContainer !== nextContainer && !isInvalid(nextChildren)) {
          var node = nextChildren.dom;
          removeChild(lastContainer, node);
          appendChild(nextContainer, node);
      }
  }
  function patchElement(lastVNode, nextVNode, context, isSVG, nextFlags, lifecycle) {
      var dom = (nextVNode.dom = lastVNode.dom);
      var lastProps = lastVNode.props;
      var nextProps = nextVNode.props;
      var isFormElement = false;
      var hasControlledValue = false;
      var nextPropsOrEmpty;
      isSVG = isSVG || (nextFlags & 32 /* SvgElement */) > 0;
      // inlined patchProps  -- starts --
      if (lastProps !== nextProps) {
          var lastPropsOrEmpty = lastProps || EMPTY_OBJ;
          nextPropsOrEmpty = nextProps || EMPTY_OBJ;
          if (nextPropsOrEmpty !== EMPTY_OBJ) {
              isFormElement = (nextFlags & 448 /* FormElement */) > 0;
              if (isFormElement) {
                  hasControlledValue = isControlledFormElement(nextPropsOrEmpty);
              }
              for (var prop in nextPropsOrEmpty) {
                  var lastValue = lastPropsOrEmpty[prop];
                  var nextValue = nextPropsOrEmpty[prop];
                  if (lastValue !== nextValue) {
                      patchProp(prop, lastValue, nextValue, dom, isSVG, hasControlledValue, lastVNode);
                  }
              }
          }
          if (lastPropsOrEmpty !== EMPTY_OBJ) {
              for (var prop$1 in lastPropsOrEmpty) {
                  if (isNullOrUndef(nextPropsOrEmpty[prop$1]) && !isNullOrUndef(lastPropsOrEmpty[prop$1])) {
                      patchProp(prop$1, lastPropsOrEmpty[prop$1], null, dom, isSVG, hasControlledValue, lastVNode);
                  }
              }
          }
      }
      var nextChildren = nextVNode.children;
      var nextClassName = nextVNode.className;
      // inlined patchProps  -- ends --
      if (lastVNode.className !== nextClassName) {
          if (isNullOrUndef(nextClassName)) {
              dom.removeAttribute('class');
          }
          else if (isSVG) {
              dom.setAttribute('class', nextClassName);
          }
          else {
              dom.className = nextClassName;
          }
      }
      if (nextFlags & 4096 /* ContentEditable */) {
          patchContentEditableChildren(dom, nextChildren);
      }
      else {
          patchChildren(lastVNode.childFlags, nextVNode.childFlags, lastVNode.children, nextChildren, dom, context, isSVG && nextVNode.type !== 'foreignObject', null, lastVNode, lifecycle);
      }
      if (isFormElement) {
          processElement(nextFlags, nextVNode, dom, nextPropsOrEmpty, false, hasControlledValue);
      }
      var nextRef = nextVNode.ref;
      var lastRef = lastVNode.ref;
      if (lastRef !== nextRef) {
          unmountRef(lastRef);
          mountRef(nextRef, dom, lifecycle);
      }
  }
  function replaceOneVNodeWithMultipleVNodes(lastChildren, nextChildren, parentDOM, context, isSVG, lifecycle) {
      unmount(lastChildren);
      mountArrayChildren(nextChildren, parentDOM, context, isSVG, findDOMfromVNode(lastChildren, true), lifecycle);
      removeVNodeDOM(lastChildren, parentDOM);
  }
  function patchChildren(lastChildFlags, nextChildFlags, lastChildren, nextChildren, parentDOM, context, isSVG, nextNode, parentVNode, lifecycle) {
      switch (lastChildFlags) {
          case 2 /* HasVNodeChildren */:
              switch (nextChildFlags) {
                  case 2 /* HasVNodeChildren */:
                      patch(lastChildren, nextChildren, parentDOM, context, isSVG, nextNode, lifecycle);
                      break;
                  case 1 /* HasInvalidChildren */:
                      remove(lastChildren, parentDOM);
                      break;
                  case 16 /* HasTextChildren */:
                      unmount(lastChildren);
                      setTextContent(parentDOM, nextChildren);
                      break;
                  default:
                      replaceOneVNodeWithMultipleVNodes(lastChildren, nextChildren, parentDOM, context, isSVG, lifecycle);
                      break;
              }
              break;
          case 1 /* HasInvalidChildren */:
              switch (nextChildFlags) {
                  case 2 /* HasVNodeChildren */:
                      mount(nextChildren, parentDOM, context, isSVG, nextNode, lifecycle);
                      break;
                  case 1 /* HasInvalidChildren */:
                      break;
                  case 16 /* HasTextChildren */:
                      setTextContent(parentDOM, nextChildren);
                      break;
                  default:
                      mountArrayChildren(nextChildren, parentDOM, context, isSVG, nextNode, lifecycle);
                      break;
              }
              break;
          case 16 /* HasTextChildren */:
              switch (nextChildFlags) {
                  case 16 /* HasTextChildren */:
                      patchSingleTextChild(lastChildren, nextChildren, parentDOM);
                      break;
                  case 2 /* HasVNodeChildren */:
                      clearDOM(parentDOM);
                      mount(nextChildren, parentDOM, context, isSVG, nextNode, lifecycle);
                      break;
                  case 1 /* HasInvalidChildren */:
                      clearDOM(parentDOM);
                      break;
                  default:
                      clearDOM(parentDOM);
                      mountArrayChildren(nextChildren, parentDOM, context, isSVG, nextNode, lifecycle);
                      break;
              }
              break;
          default:
              switch (nextChildFlags) {
                  case 16 /* HasTextChildren */:
                      unmountAllChildren(lastChildren);
                      setTextContent(parentDOM, nextChildren);
                      break;
                  case 2 /* HasVNodeChildren */:
                      removeAllChildren(parentDOM, parentVNode, lastChildren);
                      mount(nextChildren, parentDOM, context, isSVG, nextNode, lifecycle);
                      break;
                  case 1 /* HasInvalidChildren */:
                      removeAllChildren(parentDOM, parentVNode, lastChildren);
                      break;
                  default:
                      var lastLength = lastChildren.length | 0;
                      var nextLength = nextChildren.length | 0;
                      // Fast path's for both algorithms
                      if (lastLength === 0) {
                          if (nextLength > 0) {
                              mountArrayChildren(nextChildren, parentDOM, context, isSVG, nextNode, lifecycle);
                          }
                      }
                      else if (nextLength === 0) {
                          removeAllChildren(parentDOM, parentVNode, lastChildren);
                      }
                      else if (nextChildFlags === 8 /* HasKeyedChildren */ && lastChildFlags === 8 /* HasKeyedChildren */) {
                          patchKeyedChildren(lastChildren, nextChildren, parentDOM, context, isSVG, lastLength, nextLength, nextNode, parentVNode, lifecycle);
                      }
                      else {
                          patchNonKeyedChildren(lastChildren, nextChildren, parentDOM, context, isSVG, lastLength, nextLength, nextNode, lifecycle);
                      }
                      break;
              }
              break;
      }
  }
  function createDidUpdate(instance, lastProps, lastState, snapshot, lifecycle) {
      lifecycle.push(function () {
          instance.componentDidUpdate(lastProps, lastState, snapshot);
      });
  }
  function updateClassComponent(instance, nextState, nextProps, parentDOM, context, isSVG, force, nextNode, lifecycle) {
      var lastState = instance.state;
      var lastProps = instance.props;
      var usesNewAPI = Boolean(instance.$N);
      var hasSCU = isFunction(instance.shouldComponentUpdate);
      if (usesNewAPI) {
          nextState = createDerivedState(instance, nextProps, nextState !== lastState ? combineFrom(lastState, nextState) : nextState);
      }
      if (force || !hasSCU || (hasSCU && instance.shouldComponentUpdate(nextProps, nextState, context))) {
          if (!usesNewAPI && isFunction(instance.componentWillUpdate)) {
              instance.componentWillUpdate(nextProps, nextState, context);
          }
          instance.props = nextProps;
          instance.state = nextState;
          instance.context = context;
          var snapshot = null;
          var nextInput = renderNewInput(instance, nextProps, context);
          if (usesNewAPI && isFunction(instance.getSnapshotBeforeUpdate)) {
              snapshot = instance.getSnapshotBeforeUpdate(lastProps, lastState);
          }
          patch(instance.$LI, nextInput, parentDOM, instance.$CX, isSVG, nextNode, lifecycle);
          // Dont update Last input, until patch has been succesfully executed
          instance.$LI = nextInput;
          if (isFunction(instance.componentDidUpdate)) {
              createDidUpdate(instance, lastProps, lastState, snapshot, lifecycle);
          }
      }
      else {
          instance.props = nextProps;
          instance.state = nextState;
          instance.context = context;
      }
  }
  function patchClassComponent(lastVNode, nextVNode, parentDOM, context, isSVG, nextNode, lifecycle) {
      var instance = (nextVNode.children = lastVNode.children);
      // If Component has crashed, ignore it to stay functional
      if (isNull(instance)) {
          return;
      }
      instance.$L = lifecycle;
      var nextProps = nextVNode.props || EMPTY_OBJ;
      var nextRef = nextVNode.ref;
      var lastRef = lastVNode.ref;
      var nextState = instance.state;
      if (!instance.$N) {
          if (isFunction(instance.componentWillReceiveProps)) {
              instance.$BR = true;
              instance.componentWillReceiveProps(nextProps, context);
              // If instance component was removed during its own update do nothing.
              if (instance.$UN) {
                  return;
              }
              instance.$BR = false;
          }
          if (!isNull(instance.$PS)) {
              nextState = combineFrom(nextState, instance.$PS);
              instance.$PS = null;
          }
      }
      updateClassComponent(instance, nextState, nextProps, parentDOM, context, isSVG, false, nextNode, lifecycle);
      if (lastRef !== nextRef) {
          unmountRef(lastRef);
          mountRef(nextRef, instance, lifecycle);
      }
  }
  function patchFunctionalComponent(lastVNode, nextVNode, parentDOM, context, isSVG, nextNode, lifecycle) {
      var shouldUpdate = true;
      var nextProps = nextVNode.props || EMPTY_OBJ;
      var nextRef = nextVNode.ref;
      var lastProps = lastVNode.props;
      var nextHooksDefined = !isNullOrUndef(nextRef);
      var lastInput = lastVNode.children;
      if (nextHooksDefined && isFunction(nextRef.onComponentShouldUpdate)) {
          shouldUpdate = nextRef.onComponentShouldUpdate(lastProps, nextProps);
      }
      if (shouldUpdate !== false) {
          if (nextHooksDefined && isFunction(nextRef.onComponentWillUpdate)) {
              nextRef.onComponentWillUpdate(lastProps, nextProps);
          }
          var nextInput = normalizeRoot(renderFunctionalComponent(nextVNode, context));
          patch(lastInput, nextInput, parentDOM, context, isSVG, nextNode, lifecycle);
          nextVNode.children = nextInput;
          if (nextHooksDefined && isFunction(nextRef.onComponentDidUpdate)) {
              nextRef.onComponentDidUpdate(lastProps, nextProps);
          }
      }
      else {
          nextVNode.children = lastInput;
      }
  }
  function patchText(lastVNode, nextVNode) {
      var nextText = nextVNode.children;
      var dom = (nextVNode.dom = lastVNode.dom);
      if (nextText !== lastVNode.children) {
          dom.nodeValue = nextText;
      }
  }
  function patchNonKeyedChildren(lastChildren, nextChildren, dom, context, isSVG, lastChildrenLength, nextChildrenLength, nextNode, lifecycle) {
      var commonLength = lastChildrenLength > nextChildrenLength ? nextChildrenLength : lastChildrenLength;
      var i = 0;
      var nextChild;
      var lastChild;
      for (; i < commonLength; ++i) {
          nextChild = nextChildren[i];
          lastChild = lastChildren[i];
          if (nextChild.flags & 16384 /* InUse */) {
              nextChild = nextChildren[i] = directClone(nextChild);
          }
          patch(lastChild, nextChild, dom, context, isSVG, nextNode, lifecycle);
          lastChildren[i] = nextChild;
      }
      if (lastChildrenLength < nextChildrenLength) {
          for (i = commonLength; i < nextChildrenLength; ++i) {
              nextChild = nextChildren[i];
              if (nextChild.flags & 16384 /* InUse */) {
                  nextChild = nextChildren[i] = directClone(nextChild);
              }
              mount(nextChild, dom, context, isSVG, nextNode, lifecycle);
          }
      }
      else if (lastChildrenLength > nextChildrenLength) {
          for (i = commonLength; i < lastChildrenLength; ++i) {
              remove(lastChildren[i], dom);
          }
      }
  }
  function patchKeyedChildren(a, b, dom, context, isSVG, aLength, bLength, outerEdge, parentVNode, lifecycle) {
      var aEnd = aLength - 1;
      var bEnd = bLength - 1;
      var j = 0;
      var aNode = a[j];
      var bNode = b[j];
      var nextPos;
      var nextNode;
      // Step 1
      // tslint:disable-next-line
      outer: {
          // Sync nodes with the same key at the beginning.
          while (aNode.key === bNode.key) {
              if (bNode.flags & 16384 /* InUse */) {
                  b[j] = bNode = directClone(bNode);
              }
              patch(aNode, bNode, dom, context, isSVG, outerEdge, lifecycle);
              a[j] = bNode;
              ++j;
              if (j > aEnd || j > bEnd) {
                  break outer;
              }
              aNode = a[j];
              bNode = b[j];
          }
          aNode = a[aEnd];
          bNode = b[bEnd];
          // Sync nodes with the same key at the end.
          while (aNode.key === bNode.key) {
              if (bNode.flags & 16384 /* InUse */) {
                  b[bEnd] = bNode = directClone(bNode);
              }
              patch(aNode, bNode, dom, context, isSVG, outerEdge, lifecycle);
              a[aEnd] = bNode;
              aEnd--;
              bEnd--;
              if (j > aEnd || j > bEnd) {
                  break outer;
              }
              aNode = a[aEnd];
              bNode = b[bEnd];
          }
      }
      if (j > aEnd) {
          if (j <= bEnd) {
              nextPos = bEnd + 1;
              nextNode = nextPos < bLength ? findDOMfromVNode(b[nextPos], true) : outerEdge;
              while (j <= bEnd) {
                  bNode = b[j];
                  if (bNode.flags & 16384 /* InUse */) {
                      b[j] = bNode = directClone(bNode);
                  }
                  ++j;
                  mount(bNode, dom, context, isSVG, nextNode, lifecycle);
              }
          }
      }
      else if (j > bEnd) {
          while (j <= aEnd) {
              remove(a[j++], dom);
          }
      }
      else {
          patchKeyedChildrenComplex(a, b, context, aLength, bLength, aEnd, bEnd, j, dom, isSVG, outerEdge, parentVNode, lifecycle);
      }
  }
  function patchKeyedChildrenComplex(a, b, context, aLength, bLength, aEnd, bEnd, j, dom, isSVG, outerEdge, parentVNode, lifecycle) {
      var aNode;
      var bNode;
      var nextPos;
      var i = 0;
      var aStart = j;
      var bStart = j;
      var aLeft = aEnd - j + 1;
      var bLeft = bEnd - j + 1;
      var sources = new Int32Array(bLeft + 1);
      // Keep track if its possible to remove whole DOM using textContent = '';
      var canRemoveWholeContent = aLeft === aLength;
      var moved = false;
      var pos = 0;
      var patched = 0;
      // When sizes are small, just loop them through
      if (bLength < 4 || (aLeft | bLeft) < 32) {
          for (i = aStart; i <= aEnd; ++i) {
              aNode = a[i];
              if (patched < bLeft) {
                  for (j = bStart; j <= bEnd; j++) {
                      bNode = b[j];
                      if (aNode.key === bNode.key) {
                          sources[j - bStart] = i + 1;
                          if (canRemoveWholeContent) {
                              canRemoveWholeContent = false;
                              while (aStart < i) {
                                  remove(a[aStart++], dom);
                              }
                          }
                          if (pos > j) {
                              moved = true;
                          }
                          else {
                              pos = j;
                          }
                          if (bNode.flags & 16384 /* InUse */) {
                              b[j] = bNode = directClone(bNode);
                          }
                          patch(aNode, bNode, dom, context, isSVG, outerEdge, lifecycle);
                          ++patched;
                          break;
                      }
                  }
                  if (!canRemoveWholeContent && j > bEnd) {
                      remove(aNode, dom);
                  }
              }
              else if (!canRemoveWholeContent) {
                  remove(aNode, dom);
              }
          }
      }
      else {
          var keyIndex = {};
          // Map keys by their index
          for (i = bStart; i <= bEnd; ++i) {
              keyIndex[b[i].key] = i;
          }
          // Try to patch same keys
          for (i = aStart; i <= aEnd; ++i) {
              aNode = a[i];
              if (patched < bLeft) {
                  j = keyIndex[aNode.key];
                  if (j !== void 0) {
                      if (canRemoveWholeContent) {
                          canRemoveWholeContent = false;
                          while (i > aStart) {
                              remove(a[aStart++], dom);
                          }
                      }
                      sources[j - bStart] = i + 1;
                      if (pos > j) {
                          moved = true;
                      }
                      else {
                          pos = j;
                      }
                      bNode = b[j];
                      if (bNode.flags & 16384 /* InUse */) {
                          b[j] = bNode = directClone(bNode);
                      }
                      patch(aNode, bNode, dom, context, isSVG, outerEdge, lifecycle);
                      ++patched;
                  }
                  else if (!canRemoveWholeContent) {
                      remove(aNode, dom);
                  }
              }
              else if (!canRemoveWholeContent) {
                  remove(aNode, dom);
              }
          }
      }
      // fast-path: if nothing patched remove all old and add all new
      if (canRemoveWholeContent) {
          removeAllChildren(dom, parentVNode, a);
          mountArrayChildren(b, dom, context, isSVG, outerEdge, lifecycle);
      }
      else if (moved) {
          var seq = lis_algorithm(sources);
          j = seq.length - 1;
          for (i = bLeft - 1; i >= 0; i--) {
              if (sources[i] === 0) {
                  pos = i + bStart;
                  bNode = b[pos];
                  if (bNode.flags & 16384 /* InUse */) {
                      b[pos] = bNode = directClone(bNode);
                  }
                  nextPos = pos + 1;
                  mount(bNode, dom, context, isSVG, nextPos < bLength ? findDOMfromVNode(b[nextPos], true) : outerEdge, lifecycle);
              }
              else if (j < 0 || i !== seq[j]) {
                  pos = i + bStart;
                  bNode = b[pos];
                  nextPos = pos + 1;
                  moveVNodeDOM(bNode, dom, nextPos < bLength ? findDOMfromVNode(b[nextPos], true) : outerEdge);
              }
              else {
                  j--;
              }
          }
      }
      else if (patched !== bLeft) {
          // when patched count doesn't match b length we need to insert those new ones
          // loop backwards so we can use insertBefore
          for (i = bLeft - 1; i >= 0; i--) {
              if (sources[i] === 0) {
                  pos = i + bStart;
                  bNode = b[pos];
                  if (bNode.flags & 16384 /* InUse */) {
                      b[pos] = bNode = directClone(bNode);
                  }
                  nextPos = pos + 1;
                  mount(bNode, dom, context, isSVG, nextPos < bLength ? findDOMfromVNode(b[nextPos], true) : outerEdge, lifecycle);
              }
          }
      }
  }
  var result;
  var p;
  var maxLen = 0;
  // https://en.wikipedia.org/wiki/Longest_increasing_subsequence
  function lis_algorithm(arr) {
      var arrI = 0;
      var i = 0;
      var j = 0;
      var k = 0;
      var u = 0;
      var v = 0;
      var c = 0;
      var len = arr.length;
      if (len > maxLen) {
          maxLen = len;
          result = new Int32Array(len);
          p = new Int32Array(len);
      }
      for (; i < len; ++i) {
          arrI = arr[i];
          if (arrI !== 0) {
              j = result[k];
              if (arr[j] < arrI) {
                  p[i] = j;
                  result[++k] = i;
                  continue;
              }
              u = 0;
              v = k;
              while (u < v) {
                  c = (u + v) >> 1;
                  if (arr[result[c]] < arrI) {
                      u = c + 1;
                  }
                  else {
                      v = c;
                  }
              }
              if (arrI < arr[result[u]]) {
                  if (u > 0) {
                      p[i] = result[u - 1];
                  }
                  result[u] = i;
              }
          }
      }
      u = k + 1;
      var seq = new Int32Array(u);
      v = result[u - 1];
      while (u-- > 0) {
          seq[u] = v;
          v = p[v];
          result[u] = 0;
      }
      return seq;
  }

  var hasDocumentAvailable = typeof document !== 'undefined';
  if (hasDocumentAvailable) {
      /*
       * Defining $EV and $V properties on Node.prototype
       * fixes v8 "wrong map" de-optimization
       */
      if (window.Node) {
          Node.prototype.$EV = null;
          Node.prototype.$V = null;
      }
  }
  function __render(input, parentDOM, callback, context) {
      var lifecycle = [];
      var rootInput = parentDOM.$V;
      renderCheck.v = true;
      if (isNullOrUndef(rootInput)) {
          if (!isNullOrUndef(input)) {
              if (input.flags & 16384 /* InUse */) {
                  input = directClone(input);
              }
              mount(input, parentDOM, context, false, null, lifecycle);
              parentDOM.$V = input;
              rootInput = input;
          }
      }
      else {
          if (isNullOrUndef(input)) {
              remove(rootInput, parentDOM);
              parentDOM.$V = null;
          }
          else {
              if (input.flags & 16384 /* InUse */) {
                  input = directClone(input);
              }
              patch(rootInput, input, parentDOM, context, false, null, lifecycle);
              rootInput = parentDOM.$V = input;
          }
      }
      callAll(lifecycle);
      renderCheck.v = false;
      if (isFunction(callback)) {
          callback();
      }
      if (isFunction(options.renderComplete)) {
          options.renderComplete(rootInput, parentDOM);
      }
  }
  function render(input, parentDOM, callback, context) {
      if ( callback === void 0 ) callback = null;
      if ( context === void 0 ) context = EMPTY_OBJ;

      __render(input, parentDOM, callback, context);
  }

  var QUEUE = [];
  var nextTick = typeof Promise !== 'undefined'
      ? Promise.resolve().then.bind(Promise.resolve())
      : function (a) {
          window.setTimeout(a, 0);
      };
  var microTaskPending = false;
  function queueStateChanges(component, newState, callback, force) {
      var pending = component.$PS;
      if (isFunction(newState)) {
          newState = newState(pending ? combineFrom(component.state, pending) : component.state, component.props, component.context);
      }
      if (isNullOrUndef(pending)) {
          component.$PS = newState;
      }
      else {
          for (var stateKey in newState) {
              pending[stateKey] = newState[stateKey];
          }
      }
      if (!component.$BR) {
          if (!renderCheck.v) {
              if (QUEUE.length === 0) {
                  applyState(component, force);
                  if (isFunction(callback)) {
                      callback.call(component);
                  }
                  return;
              }
          }
          if (QUEUE.indexOf(component) === -1) {
              QUEUE.push(component);
          }
          if (force) {
              component.$F = true;
          }
          if (!microTaskPending) {
              microTaskPending = true;
              nextTick(rerender);
          }
          if (isFunction(callback)) {
              var QU = component.$QU;
              if (!QU) {
                  QU = component.$QU = [];
              }
              QU.push(callback);
          }
      }
      else if (isFunction(callback)) {
          component.$L.push(callback.bind(component));
      }
  }
  function callSetStateCallbacks(component) {
      var queue = component.$QU;
      for (var i = 0; i < queue.length; ++i) {
          queue[i].call(component);
      }
      component.$QU = null;
  }
  function rerender() {
      var component;
      microTaskPending = false;
      while ((component = QUEUE.shift())) {
          if (!component.$UN) {
              var force = component.$F;
              component.$F = false;
              applyState(component, force);
              if (component.$QU) {
                  callSetStateCallbacks(component);
              }
          }
      }
  }
  function applyState(component, force) {
      if (force || !component.$BR) {
          var pendingState = component.$PS;
          component.$PS = null;
          var lifecycle = [];
          renderCheck.v = true;
          updateClassComponent(component, combineFrom(component.state, pendingState), component.props, findDOMfromVNode(component.$LI, true).parentNode, component.context, component.$SVG, force, null, lifecycle);
          callAll(lifecycle);
          renderCheck.v = false;
      }
      else {
          component.state = component.$PS;
          component.$PS = null;
      }
  }
  var Component = function Component(props, context) {
      // Public
      this.state = null;
      // Internal properties
      this.$BR = false; // BLOCK RENDER
      this.$BS = true; // BLOCK STATE
      this.$PS = null; // PENDING STATE (PARTIAL or FULL)
      this.$LI = null; // LAST INPUT
      this.$UN = false; // UNMOUNTED
      this.$CX = null; // CHILDCONTEXT
      this.$QU = null; // QUEUE
      this.$N = false; // Uses new lifecycle API Flag
      this.$L = null; // Current lifecycle of this component
      this.$SVG = false; // Flag to keep track if component is inside SVG tree
      this.$F = false; // Force update flag
      this.props = props || EMPTY_OBJ;
      this.context = context || EMPTY_OBJ; // context should not be mutable
  };
  Component.prototype.forceUpdate = function forceUpdate (callback) {
      if (this.$UN) {
          return;
      }
      // Do not allow double render during force update
      queueStateChanges(this, {}, callback, true);
  };
  Component.prototype.setState = function setState (newState, callback) {
      if (this.$UN) {
          return;
      }
      if (!this.$BS) {
          queueStateChanges(this, newState, callback, false);
      }
  };
  Component.prototype.render = function render (_nextProps, _nextState, _nextContext) {
      return null;
  };

  var MonitorMaxSamples = 100;
  var MonitorSamplesResult = (function () {
      function MonitorSamplesResult(min, max, mean, last) {
          this.min = min;
          this.max = max;
          this.mean = mean;
          this.last = last;
      }
      return MonitorSamplesResult;
  }());
  /**
   * Profile Samples.
   */
  var MonitorSamples = (function () {
      function MonitorSamples(maxSamples) {
          this.samples = [];
          this.maxSamples = maxSamples;
          this._i = -1;
      }
      MonitorSamples.prototype.addSample = function (v) {
          this._i = (this._i + 1) % this.maxSamples;
          this.samples[this._i] = v;
      };
      MonitorSamples.prototype.each = function (fn) {
          var samples = this.samples;
          for (var i = 0; i < samples.length; i++) {
              fn(samples[(this._i + 1 + i) % samples.length], i);
          }
      };
      MonitorSamples.prototype.calc = function () {
          var samples = this.samples;
          if (samples.length === 0) {
              return new MonitorSamplesResult(0, 0, 0, 0);
          }
          var min = samples[(this._i + 1) % samples.length];
          var max = min;
          var sum = 0;
          for (var i = 0; i < samples.length; i++) {
              var k = samples[(this._i + 1 + i) % samples.length];
              if (k < min) {
                  min = k;
              }
              if (k > max) {
                  max = k;
              }
              sum += k;
          }
          var last = samples[this._i];
          var mean = sum / samples.length;
          return new MonitorSamplesResult(min, max, mean, last);
      };
      return MonitorSamples;
  }());

  var frameTasks = [];
  var rafId = -1;
  /**
   * Schedule new task that will be executed on the next frame.
   */
  function scheduleNextFrameTask(task) {
      frameTasks.push(task);
      if (rafId === -1) {
          requestAnimationFrame(function (t) {
              rafId = -1;
              var tasks = frameTasks;
              frameTasks = [];
              for (var i = 0; i < tasks.length; i++) {
                  tasks[i]();
              }
          });
      }
  }

  var __extends = (function () {
      var extendStatics = Object.setPrototypeOf ||
          ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
          function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
      return function (d, b) {
          extendStatics(d, b);
          function __() { this.constructor = d; }
          d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
  })();
  var MonitorGraphHeight = 30;
  var MonitorGraphWidth = MonitorMaxSamples;
  var Widget = (function () {
      function Widget(name) {
          var _this = this;
          this._sync = function () {
              _this.sync();
              _this._dirty = false;
          };
          this.name = name;
          this.element = document.createElement("div");
          this.element.style.cssText = "padding: 2px;" +
              "background-color: #020;" +
              "font-family: monospace;" +
              "font-size: 12px;" +
              "color: #0f0";
          this._dirty = false;
          this.invalidate();
      }
      Widget.prototype.invalidate = function () {
          if (!this._dirty) {
              this._dirty = true;
              scheduleNextFrameTask(this._sync);
          }
      };
      Widget.prototype.sync = function () {
          throw new Error("sync method not implemented");
      };
      return Widget;
  }());
  var MonitorWidgetFlags;
  (function (MonitorWidgetFlags) {
      MonitorWidgetFlags[MonitorWidgetFlags["HideMin"] = 1] = "HideMin";
      MonitorWidgetFlags[MonitorWidgetFlags["HideMax"] = 2] = "HideMax";
      MonitorWidgetFlags[MonitorWidgetFlags["HideMean"] = 4] = "HideMean";
      MonitorWidgetFlags[MonitorWidgetFlags["HideLast"] = 8] = "HideLast";
      MonitorWidgetFlags[MonitorWidgetFlags["HideGraph"] = 16] = "HideGraph";
      MonitorWidgetFlags[MonitorWidgetFlags["RoundValues"] = 32] = "RoundValues";
  })(MonitorWidgetFlags || (MonitorWidgetFlags = {}));
  var MonitorWidget = (function (_super) {
      __extends(MonitorWidget, _super);
      function MonitorWidget(name, flags, unitName, samples) {
          var _this = _super.call(this, name) || this;
          _this.flags = flags;
          _this.unitName = unitName;
          _this.samples = samples;
          var label = document.createElement("div");
          label.style.cssText = "text-align: center";
          label.textContent = _this.name;
          var text = document.createElement("div");
          if ((flags & MonitorWidgetFlags.HideMin) === 0) {
              _this.minText = document.createElement("div");
              text.appendChild(_this.minText);
          }
          else {
              _this.minText = null;
          }
          if ((flags & MonitorWidgetFlags.HideMax) === 0) {
              _this.maxText = document.createElement("div");
              text.appendChild(_this.maxText);
          }
          else {
              _this.maxText = null;
          }
          if ((flags & MonitorWidgetFlags.HideMean) === 0) {
              _this.meanText = document.createElement("div");
              text.appendChild(_this.meanText);
          }
          else {
              _this.meanText = null;
          }
          if ((flags & MonitorWidgetFlags.HideLast) === 0) {
              _this.lastText = document.createElement("div");
              text.appendChild(_this.lastText);
          }
          else {
              _this.lastText = null;
          }
          _this.element.appendChild(label);
          _this.element.appendChild(text);
          if ((flags & MonitorWidgetFlags.HideGraph) === 0) {
              _this.canvas = document.createElement("canvas");
              _this.canvas.style.cssText = "display: block; padding: 0; margin: 0";
              _this.canvas.width = MonitorGraphWidth;
              _this.canvas.height = MonitorGraphHeight;
              _this.ctx = _this.canvas.getContext("2d");
              _this.element.appendChild(_this.canvas);
          }
          else {
              _this.canvas = null;
              _this.ctx = null;
          }
          return _this;
      }
      MonitorWidget.prototype.sync = function () {
          var _this = this;
          var result = this.samples.calc();
          var scale = MonitorGraphHeight / (result.max * 1.2);
          var min;
          var max;
          var mean;
          var last;
          if ((this.flags & MonitorWidgetFlags.RoundValues) === 0) {
              min = result.min.toFixed(2);
              max = result.max.toFixed(2);
              mean = result.mean.toFixed(2);
              last = result.last.toFixed(2);
          }
          else {
              min = Math.round(result.min).toString();
              max = Math.round(result.max).toString();
              mean = Math.round(result.mean).toString();
              last = Math.round(result.last).toString();
          }
          if (this.minText !== null) {
              this.minText.textContent = "min: \u00A0" + min + this.unitName;
          }
          if (this.maxText !== null) {
              this.maxText.textContent = "max: \u00A0" + max + this.unitName;
          }
          if (this.meanText !== null) {
              this.meanText.textContent = "mean: " + mean + this.unitName;
          }
          if (this.lastText !== null) {
              this.lastText.textContent = "last: " + last + this.unitName;
          }
          if (this.ctx !== null) {
              this.ctx.fillStyle = "#010";
              this.ctx.fillRect(0, 0, MonitorGraphWidth, MonitorGraphHeight);
              this.ctx.fillStyle = "#0f0";
              this.samples.each(function (v, i) {
                  _this.ctx.fillRect(i, MonitorGraphHeight, 1, -(v * scale));
              });
          }
      };
      return MonitorWidget;
  }(Widget));
  ((function (_super) {
      __extends(CounterWidget, _super);
      function CounterWidget(name, counter) {
          var _this = _super.call(this, name) || this;
          _this.counter = counter;
          _this.text = document.createElement("div");
          _this.element.appendChild(_this.text);
          return _this;
      }
      CounterWidget.prototype.sync = function () {
          this.text.textContent = this.name + ": " + this.counter.value;
      };
      return CounterWidget;
  })(Widget));

  var container = null;
  /**
   * Check that everything is properly initialized.
   */
  function checkInit() {
      if (!container) {
          container = document.createElement("div");
          container.style.cssText = "position: fixed;" +
              "opacity: 0.9;" +
              "right: 0;" +
              "bottom: 0";
          document.body.appendChild(container);
      }
  }
  /**
   * Start FPS monitor
   */
  function startFPSMonitor(flags) {
      if (flags === void 0) { flags = MonitorWidgetFlags.HideMin | MonitorWidgetFlags.HideMax |
          MonitorWidgetFlags.HideMean | MonitorWidgetFlags.RoundValues; }
      checkInit();
      var data = new MonitorSamples(MonitorMaxSamples);
      var w = new MonitorWidget("FPS", flags, "", data);
      container.appendChild(w.element);
      var alpha = 2 / 121;
      var last = 0;
      var fps = 60;
      function update(now) {
          if (last > 0) {
              fps += alpha * ((1000 / (now - last)) - fps);
          }
          last = now;
          data.addSample(fps);
          w.invalidate();
          requestAnimationFrame(update);
      }
      requestAnimationFrame(update);
  }
  /**
   * Start Memory Monitor
   */
  function startMemMonitor(flags) {
      if (flags === void 0) { flags = MonitorWidgetFlags.HideMin | MonitorWidgetFlags.HideMean; }
      checkInit();
      if (performance.memory === undefined) {
          return;
      }
      var data = new MonitorSamples(MonitorMaxSamples);
      var w = new MonitorWidget("Memory", flags, "MB", data);
      container.appendChild(w.element);
      function update() {
          data.addSample(Math.round(performance.memory.usedJSHeapSize / (1024 * 1024)));
          w.invalidate();
          setTimeout(update, 30);
      }
      update();
  }

  function colors(specifier) {
    var n = specifier.length / 6 | 0, colors = new Array(n), i = 0;
    while (i < n) colors[i] = "#" + specifier.slice(i * 6, ++i * 6);
    return colors;
  }

  function ramp(range) {
    var n = range.length;
    return function(t) {
      return range[Math.max(0, Math.min(n - 1, Math.floor(t * n)))];
    };
  }

  var interpolateViridis = ramp(colors("44015444025645045745055946075a46085c460a5d460b5e470d60470e6147106347116447136548146748166848176948186a481a6c481b6d481c6e481d6f481f70482071482173482374482475482576482677482878482979472a7a472c7a472d7b472e7c472f7d46307e46327e46337f463480453581453781453882443983443a83443b84433d84433e85423f854240864241864142874144874045884046883f47883f48893e49893e4a893e4c8a3d4d8a3d4e8a3c4f8a3c508b3b518b3b528b3a538b3a548c39558c39568c38588c38598c375a8c375b8d365c8d365d8d355e8d355f8d34608d34618d33628d33638d32648e32658e31668e31678e31688e30698e306a8e2f6b8e2f6c8e2e6d8e2e6e8e2e6f8e2d708e2d718e2c718e2c728e2c738e2b748e2b758e2a768e2a778e2a788e29798e297a8e297b8e287c8e287d8e277e8e277f8e27808e26818e26828e26828e25838e25848e25858e24868e24878e23888e23898e238a8d228b8d228c8d228d8d218e8d218f8d21908d21918c20928c20928c20938c1f948c1f958b1f968b1f978b1f988b1f998a1f9a8a1e9b8a1e9c891e9d891f9e891f9f881fa0881fa1881fa1871fa28720a38620a48621a58521a68522a78522a88423a98324aa8325ab8225ac8226ad8127ad8128ae8029af7f2ab07f2cb17e2db27d2eb37c2fb47c31b57b32b67a34b67935b77937b87838b9773aba763bbb753dbc743fbc7340bd7242be7144bf7046c06f48c16e4ac16d4cc26c4ec36b50c46a52c56954c56856c66758c7655ac8645cc8635ec96260ca6063cb5f65cb5e67cc5c69cd5b6ccd5a6ece5870cf5773d05675d05477d1537ad1517cd2507fd34e81d34d84d44b86d54989d5488bd6468ed64590d74393d74195d84098d83e9bd93c9dd93ba0da39a2da37a5db36a8db34aadc32addc30b0dd2fb2dd2db5de2bb8de29bade28bddf26c0df25c2df23c5e021c8e020cae11fcde11dd0e11cd2e21bd5e21ad8e219dae319dde318dfe318e2e418e5e419e7e419eae51aece51befe51cf1e51df4e61ef6e620f8e621fbe723fde725"));

  ramp(colors("00000401000501010601010802010902020b02020d03030f03031204041405041606051806051a07061c08071e0907200a08220b09240c09260d0a290e0b2b100b2d110c2f120d31130d34140e36150e38160f3b180f3d19103f1a10421c10441d11471e114920114b21114e22115024125325125527125829115a2a115c2c115f2d11612f116331116533106734106936106b38106c390f6e3b0f703d0f713f0f72400f74420f75440f764510774710784910784a10794c117a4e117b4f127b51127c52137c54137d56147d57157e59157e5a167e5c167f5d177f5f187f601880621980641a80651a80671b80681c816a1c816b1d816d1d816e1e81701f81721f817320817521817621817822817922827b23827c23827e24828025828125818326818426818627818827818928818b29818c29818e2a81902a81912b81932b80942c80962c80982d80992d809b2e7f9c2e7f9e2f7fa02f7fa1307ea3307ea5317ea6317da8327daa337dab337cad347cae347bb0357bb2357bb3367ab5367ab73779b83779ba3878bc3978bd3977bf3a77c03a76c23b75c43c75c53c74c73d73c83e73ca3e72cc3f71cd4071cf4070d0416fd2426fd3436ed5446dd6456cd8456cd9466bdb476adc4869de4968df4a68e04c67e24d66e34e65e44f64e55064e75263e85362e95462ea5661eb5760ec5860ed5a5fee5b5eef5d5ef05f5ef1605df2625df2645cf3655cf4675cf4695cf56b5cf66c5cf66e5cf7705cf7725cf8745cf8765cf9785df9795df97b5dfa7d5efa7f5efa815ffb835ffb8560fb8761fc8961fc8a62fc8c63fc8e64fc9065fd9266fd9467fd9668fd9869fd9a6afd9b6bfe9d6cfe9f6dfea16efea36ffea571fea772fea973feaa74feac76feae77feb078feb27afeb47bfeb67cfeb77efeb97ffebb81febd82febf84fec185fec287fec488fec68afec88cfeca8dfecc8ffecd90fecf92fed194fed395fed597fed799fed89afdda9cfddc9efddea0fde0a1fde2a3fde3a5fde5a7fde7a9fde9aafdebacfcecaefceeb0fcf0b2fcf2b4fcf4b6fcf6b8fcf7b9fcf9bbfcfbbdfcfdbf"));

  ramp(colors("00000401000501010601010802010a02020c02020e03021004031204031405041706041907051b08051d09061f0a07220b07240c08260d08290e092b10092d110a30120a32140b34150b37160b39180c3c190c3e1b0c411c0c431e0c451f0c48210c4a230c4c240c4f260c51280b53290b552b0b572d0b592f0a5b310a5c320a5e340a5f3609613809623909633b09643d09653e0966400a67420a68440a68450a69470b6a490b6a4a0c6b4c0c6b4d0d6c4f0d6c510e6c520e6d540f6d550f6d57106e59106e5a116e5c126e5d126e5f136e61136e62146e64156e65156e67166e69166e6a176e6c186e6d186e6f196e71196e721a6e741a6e751b6e771c6d781c6d7a1d6d7c1d6d7d1e6d7f1e6c801f6c82206c84206b85216b87216b88226a8a226a8c23698d23698f24699025689225689326679526679727669827669a28659b29649d29649f2a63a02a63a22b62a32c61a52c60a62d60a82e5fa92e5eab2f5ead305dae305cb0315bb1325ab3325ab43359b63458b73557b93556ba3655bc3754bd3853bf3952c03a51c13a50c33b4fc43c4ec63d4dc73e4cc83f4bca404acb4149cc4248ce4347cf4446d04545d24644d34743d44842d54a41d74b3fd84c3ed94d3dda4e3cdb503bdd513ade5238df5337e05536e15635e25734e35933e45a31e55c30e65d2fe75e2ee8602de9612bea632aeb6429eb6628ec6726ed6925ee6a24ef6c23ef6e21f06f20f1711ff1731df2741cf3761bf37819f47918f57b17f57d15f67e14f68013f78212f78410f8850ff8870ef8890cf98b0bf98c0af98e09fa9008fa9207fa9407fb9606fb9706fb9906fb9b06fb9d07fc9f07fca108fca309fca50afca60cfca80dfcaa0ffcac11fcae12fcb014fcb216fcb418fbb61afbb81dfbba1ffbbc21fbbe23fac026fac228fac42afac62df9c72ff9c932f9cb35f8cd37f8cf3af7d13df7d340f6d543f6d746f5d949f5db4cf4dd4ff4df53f4e156f3e35af3e55df2e661f2e865f2ea69f1ec6df1ed71f1ef75f1f179f2f27df2f482f3f586f3f68af4f88ef5f992f6fa96f8fb9af9fc9dfafda1fcffa4"));

  ramp(colors("0d088710078813078916078a19068c1b068d1d068e20068f2206902406912605912805922a05932c05942e05952f059631059733059735049837049938049a3a049a3c049b3e049c3f049c41049d43039e44039e46039f48039f4903a04b03a14c02a14e02a25002a25102a35302a35502a45601a45801a45901a55b01a55c01a65e01a66001a66100a76300a76400a76600a76700a86900a86a00a86c00a86e00a86f00a87100a87201a87401a87501a87701a87801a87a02a87b02a87d03a87e03a88004a88104a78305a78405a78606a68707a68808a68a09a58b0aa58d0ba58e0ca48f0da4910ea3920fa39410a29511a19613a19814a099159f9a169f9c179e9d189d9e199da01a9ca11b9ba21d9aa31e9aa51f99a62098a72197a82296aa2395ab2494ac2694ad2793ae2892b02991b12a90b22b8fb32c8eb42e8db52f8cb6308bb7318ab83289ba3388bb3488bc3587bd3786be3885bf3984c03a83c13b82c23c81c33d80c43e7fc5407ec6417dc7427cc8437bc9447aca457acb4679cc4778cc4977cd4a76ce4b75cf4c74d04d73d14e72d24f71d35171d45270d5536fd5546ed6556dd7566cd8576bd9586ada5a6ada5b69db5c68dc5d67dd5e66de5f65de6164df6263e06363e16462e26561e26660e3685fe4695ee56a5de56b5de66c5ce76e5be76f5ae87059e97158e97257ea7457eb7556eb7655ec7754ed7953ed7a52ee7b51ef7c51ef7e50f07f4ff0804ef1814df1834cf2844bf3854bf3874af48849f48948f58b47f58c46f68d45f68f44f79044f79143f79342f89441f89540f9973ff9983ef99a3efa9b3dfa9c3cfa9e3bfb9f3afba139fba238fca338fca537fca636fca835fca934fdab33fdac33fdae32fdaf31fdb130fdb22ffdb42ffdb52efeb72dfeb82cfeba2cfebb2bfebd2afebe2afec029fdc229fdc328fdc527fdc627fdc827fdca26fdcb26fccd25fcce25fcd025fcd225fbd324fbd524fbd724fad824fada24f9dc24f9dd25f8df25f8e125f7e225f7e425f6e626f6e826f5e926f5eb27f4ed27f3ee27f3f027f2f227f1f426f1f525f0f724f0f921"));

  startFPSMonitor();
  startMemMonitor();

  function map(arr, to) {
    var out = [];

    for (var i = 0; i < arr.length; i++) {
      out.push(to(arr[i]));
    }

    return out;
  }

  var Demo = /*#__PURE__*/function (_Component) {
    _inheritsLoose(Demo, _Component);

    function Demo(props, context) {
      var _this;

      _this = _Component.call(this, props, context) || this;
      _this.state = {
        numPoints: 0
      };
      _this.updateCount = _this.updateCount.bind(_assertThisInitialized(_this));
      return _this;
    }

    var _proto = Demo.prototype;

    _proto.updateCount = function updateCount(e) {
      this.setState({
        numPoints: e.target.value
      });
    };

    _proto.componentDidMount = function componentDidMount() {
      this.setState({
        numPoints: 1000
      });
    };

    _proto.render = function render(props, state) {
      return createVNode(1, "div", "app-wrapper", [createComponentVNode(2, VizDemo, {
        "count": state.numPoints
      }, null, null), createVNode(1, "div", "controls", [createTextVNode("# Points"), createVNode(64, "input", null, null, 1, {
        "type": "range",
        "min": 10,
        "max": 10000,
        "value": state.numPoints,
        "onInput": this.updateCount
      }, null, null), state.numPoints], 0, null, null, null), createVNode(1, "div", "about", [createTextVNode("InfernoJS 1k Components Demo based on the Glimmer demo by "), createVNode(1, "a", null, "Michael Lange", 16, {
        "href": "http://mlange.io",
        "target": "_blank"
      }, null, null), createTextVNode(".")], 4, null, null, null)], 4, null, null, null);
    };

    return Demo;
  }(Component);

  var Layout = {
    PHYLLOTAXIS: 0,
    GRID: 1,
    WAVE: 2,
    SPIRAL: 3
  };
  var LAYOUT_ORDER = [Layout.PHYLLOTAXIS, Layout.SPIRAL, Layout.PHYLLOTAXIS, Layout.GRID, Layout.WAVE];

  var VizDemo = /*#__PURE__*/function (_Component2) {
    _inheritsLoose(VizDemo, _Component2);

    function VizDemo(props, context) {
      var _this2;

      _this2 = _Component2.call(this, props, context) || this;
      _this2.layout = 0;
      _this2.phyllotaxis = genPhyllotaxis(100);
      _this2.grid = genGrid(100);
      _this2.wave = genWave(100);
      _this2.spiral = genSpiral(100);
      _this2.points = [];
      _this2.step = 0;
      _this2.numSteps = 60 * 2;
      return _this2;
    }

    var _proto2 = VizDemo.prototype;

    _proto2.next = function next() {
      var _this3 = this;

      this.step = (this.step + 1) % this.numSteps;

      if (this.step === 0) {
        this.layout = (this.layout + 1) % LAYOUT_ORDER.length;
      } // Clamp the linear interpolation at 80% for a pause at each finished layout state


      var pct = Math.min(1, this.step / (this.numSteps * 0.8));
      var currentLayout = LAYOUT_ORDER[this.layout];
      var nextLayout = LAYOUT_ORDER[(this.layout + 1) % LAYOUT_ORDER.length]; // Keep these redundant computations out of the loop

      var pxProp = xForLayout(currentLayout);
      var nxProp = xForLayout(nextLayout);
      var pyProp = yForLayout(currentLayout);
      var nyProp = yForLayout(nextLayout);
      this.points = this.points.map(function (point) {
        var newPoint = _extends({}, point);

        newPoint.x = lerp(newPoint, pct, pxProp, nxProp);
        newPoint.y = lerp(newPoint, pct, pyProp, nyProp);
        return newPoint;
      });
      this.setState();
      requestAnimationFrame(function () {
        _this3.next();
      });
    };

    _proto2.setAnchors = function setAnchors(arr) {
      var _this4 = this;

      arr.map(function (p, index) {
        var _project = project(_this4.grid(index)),
            gx = _project[0],
            gy = _project[1];

        var _project2 = project(_this4.wave(index)),
            wx = _project2[0],
            wy = _project2[1];

        var _project3 = project(_this4.spiral(index)),
            sx = _project3[0],
            sy = _project3[1];

        var _project4 = project(_this4.phyllotaxis(index)),
            px = _project4[0],
            py = _project4[1];

        Object.assign(p, {
          gx: gx,
          gy: gy,
          wx: wx,
          wy: wy,
          sx: sx,
          sy: sy,
          px: px,
          py: py
        });
      });
      this.points = arr;
    };

    _proto2.makePoints = function makePoints(count) {
      var newPoints = [];

      for (var i = 0; i < count; i++) {
        newPoints.push({
          x: 0,
          y: 0,
          color: interpolateViridis(i / count)
        });
      }

      this.setAnchors(newPoints);
    };

    _proto2.componentWillReceiveProps = function componentWillReceiveProps(props) {
      if (props.count !== this.props.count) {
        this.phyllotaxis = genPhyllotaxis(props.count);
        this.grid = genGrid(props.count);
        this.wave = genWave(props.count);
        this.spiral = genSpiral(props.count);
        this.makePoints(props.count);
      }
    };

    _proto2.componentDidMount = function componentDidMount() {
      this.next();
    };

    _proto2.renderPoint = function renderPoint(point) {
      return createComponentVNode(2, Point, {
        "x": point.x,
        "y": point.y,
        "color": point.color
      }, null, null);
    };

    _proto2.render = function render() {
      return createVNode(32, "svg", "demo", createVNode(32, "g", null, map(this.points, this.renderPoint), 4, null, null, null), 2, null, null, null);
    };

    return VizDemo;
  }(Component);

  function Point(_ref) {
    var x = _ref.x,
        y = _ref.y,
        color = _ref.color;
    return createVNode(32, "rect", "point", null, 1, {
      "transform": "translate(" + Math.floor(x) + ", " + Math.floor(y) + ")",
      "fill": color
    }, null, null);
  }

  var theta = Math.PI * (3 - Math.sqrt(5));

  function xForLayout(layout) {
    switch (layout) {
      case Layout.PHYLLOTAXIS:
        return 'px';

      case Layout.GRID:
        return 'gx';

      case Layout.WAVE:
        return 'wx';

      case Layout.SPIRAL:
        return 'sx';
    }
  }

  function yForLayout(layout) {
    switch (layout) {
      case Layout.PHYLLOTAXIS:
        return 'py';

      case Layout.GRID:
        return 'gy';

      case Layout.WAVE:
        return 'wy';

      case Layout.SPIRAL:
        return 'sy';
    }
  }

  function lerp(obj, percent, startProp, endProp) {
    var px = obj[startProp];
    return px + (obj[endProp] - px) * percent;
  }

  function genPhyllotaxis(n) {
    return function (i) {
      var r = Math.sqrt(i / n);
      var th = i * theta;
      return [r * Math.cos(th), r * Math.sin(th)];
    };
  }

  function genGrid(n) {
    var rowLength = Math.round(Math.sqrt(n));
    return function (i) {
      return [-0.8 + 1.6 / rowLength * (i % rowLength), -0.8 + 1.6 / rowLength * Math.floor(i / rowLength)];
    };
  }

  function genWave(n) {
    var xScale = 2 / (n - 1);
    return function (i) {
      var x = -1 + i * xScale;
      return [x, Math.sin(x * Math.PI * 3) * 0.3];
    };
  }

  function genSpiral(n) {
    return function (i) {
      var t = Math.sqrt(i / (n - 1)),
          phi = t * Math.PI * 10;
      return [t * Math.cos(phi), t * Math.sin(phi)];
    };
  }

  function scale(magnitude, vector) {
    return vector.map(function (p) {
      return p * magnitude;
    });
  }

  function translate(translation, vector) {
    return vector.map(function (p, i) {
      return p + translation[i];
    });
  }

  function project(vector) {
    var wh = window.innerHeight / 2;
    var ww = window.innerWidth / 2;
    return translate([ww, wh], scale(Math.min(wh, ww), vector));
  }

  render(createComponentVNode(2, Demo, null, null, null), document.getElementById('app'));

}());
