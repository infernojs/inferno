(function () {
  'use strict';

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

  var version = "7.4.8";

  uibench.init('Inferno [same as react]', version);

  var TableCell = /*#__PURE__*/function (_Component) {
    _inheritsLoose(TableCell, _Component);

    function TableCell(props) {
      var _this;

      _this = _Component.call(this, props) || this;
      _this.onClick = _this.onClick.bind(_assertThisInitialized(_this));
      return _this;
    }

    var _proto = TableCell.prototype;

    _proto.shouldComponentUpdate = function shouldComponentUpdate(nextProps, nextState) {
      return this.props.text !== nextProps.text;
    };

    _proto.onClick = function onClick(e) {
      console.log('Clicked' + this.props.text);
      e.stopPropagation();
    };

    _proto.render = function render() {
      return createVNode(1, "td", "TableCell", this.props.text, 0, {
        "onClick": this.onClick
      }, null, null);
    };

    return TableCell;
  }(Component);

  var TableRow = /*#__PURE__*/function (_Component2) {
    _inheritsLoose(TableRow, _Component2);

    function TableRow() {
      return _Component2.apply(this, arguments) || this;
    }

    var _proto2 = TableRow.prototype;

    _proto2.shouldComponentUpdate = function shouldComponentUpdate(nextProps, nextState) {
      return this.props.data !== nextProps.data;
    };

    _proto2.render = function render() {
      var data = this.props.data; // Interned strings

      var classes = data.active ? 'TableRow active' : 'TableRow';
      var cells = data.props;
      var children = [createComponentVNode(2, TableCell, {
        "text": '#' + data.id
      }, -1, null)];

      for (var i = 0; i < cells.length; i++) {
        // Key is used because React prints warnings that there should be a key, libraries that can detect that children
        // shape isn't changing should render cells without keys.
        children.push(createComponentVNode(2, TableCell, {
          "text": cells[i]
        }, i, null));
      } // First table cell is inserted this way to prevent react from printing warning that it doesn't have key property


      return createVNode(1, "tr", classes, children, 0, {
        "data-id": data.id
      }, null, null);
    };

    return TableRow;
  }(Component);

  var Table = /*#__PURE__*/function (_Component3) {
    _inheritsLoose(Table, _Component3);

    function Table() {
      return _Component3.apply(this, arguments) || this;
    }

    var _proto3 = Table.prototype;

    _proto3.shouldComponentUpdate = function shouldComponentUpdate(nextProps, nextState) {
      return this.props.data !== nextProps.data;
    };

    _proto3.render = function render() {
      var items = this.props.data.items;
      var children = [];

      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        children.push(createComponentVNode(2, TableRow, {
          "data": item
        }, item.id, null));
      }

      return createVNode(1, "table", "Table", createVNode(1, "tbody", null, children, 0, null, null, null), 2, null, null, null);
    };

    return Table;
  }(Component);

  var AnimBox = /*#__PURE__*/function (_Component4) {
    _inheritsLoose(AnimBox, _Component4);

    function AnimBox() {
      return _Component4.apply(this, arguments) || this;
    }

    var _proto4 = AnimBox.prototype;

    _proto4.shouldComponentUpdate = function shouldComponentUpdate(nextProps, nextState) {
      return this.props.data !== nextProps.data;
    };

    _proto4.render = function render() {
      var data = this.props.data;
      var time = data.time;
      var style = {
        'border-radius': (time % 10).toString() + 'px',
        'background': 'rgba(0,0,0,' + (0.5 + time % 10 / 10).toString() + ')'
      };
      return createVNode(1, "div", "AnimBox", null, 1, {
        "data-id": data.id,
        "style": style
      }, null, null);
    };

    return AnimBox;
  }(Component);

  var Anim = /*#__PURE__*/function (_Component5) {
    _inheritsLoose(Anim, _Component5);

    function Anim() {
      return _Component5.apply(this, arguments) || this;
    }

    var _proto5 = Anim.prototype;

    _proto5.shouldComponentUpdate = function shouldComponentUpdate(nextProps, nextState) {
      return this.props.data !== nextProps.data;
    };

    _proto5.render = function render() {
      var items = this.props.data.items;
      var children = [];

      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        children.push(createComponentVNode(2, AnimBox, {
          "data": item
        }, item.id, null));
      }

      return createVNode(1, "div", "Anim", children, 0, null, null, null);
    };

    return Anim;
  }(Component);

  var TreeLeaf = /*#__PURE__*/function (_Component6) {
    _inheritsLoose(TreeLeaf, _Component6);

    function TreeLeaf() {
      return _Component6.apply(this, arguments) || this;
    }

    var _proto6 = TreeLeaf.prototype;

    _proto6.shouldComponentUpdate = function shouldComponentUpdate(nextProps, nextState) {
      return this.props.data !== nextProps.data;
    };

    _proto6.render = function render() {
      return createVNode(1, "li", "TreeLeaf", this.props.data.id, 0, null, null, null);
    };

    return TreeLeaf;
  }(Component);

  var TreeNode = /*#__PURE__*/function (_Component7) {
    _inheritsLoose(TreeNode, _Component7);

    function TreeNode() {
      return _Component7.apply(this, arguments) || this;
    }

    var _proto7 = TreeNode.prototype;

    _proto7.shouldComponentUpdate = function shouldComponentUpdate(nextProps, nextState) {
      return this.props.data !== nextProps.data;
    };

    _proto7.render = function render() {
      var data = this.props.data;
      var children = [];

      for (var i = 0; i < data.children.length; i++) {
        var n = data.children[i];

        if (n.container) {
          children.push(createComponentVNode(2, TreeNode, {
            "data": n
          }, n.id, null));
        } else {
          children.push(createComponentVNode(2, TreeLeaf, {
            "data": n
          }, n.id, null));
        }
      }

      return createVNode(1, "ul", "TreeNode", children, 0, null, null, null);
    };

    return TreeNode;
  }(Component);

  var Tree = /*#__PURE__*/function (_Component8) {
    _inheritsLoose(Tree, _Component8);

    function Tree() {
      return _Component8.apply(this, arguments) || this;
    }

    var _proto8 = Tree.prototype;

    _proto8.shouldComponentUpdate = function shouldComponentUpdate(nextProps, nextState) {
      return this.props.data !== nextProps.data;
    };

    _proto8.render = function render() {
      return createVNode(1, "div", "Tree", createComponentVNode(2, TreeNode, {
        "data": this.props.data.root
      }, null, null), 2, null, null, null);
    };

    return Tree;
  }(Component);

  var Main = /*#__PURE__*/function (_Component9) {
    _inheritsLoose(Main, _Component9);

    function Main() {
      return _Component9.apply(this, arguments) || this;
    }

    var _proto9 = Main.prototype;

    _proto9.shouldComponentUpdate = function shouldComponentUpdate(nextProps, nextState) {
      return this.props.data !== nextProps.data;
    };

    _proto9.render = function render() {
      var data = this.props.data;
      var location = data.location;
      var section;

      if (location === 'table') {
        section = createComponentVNode(2, Table, {
          "data": data.table
        }, null, null);
      } else if (location === 'anim') {
        section = createComponentVNode(2, Anim, {
          "data": data.anim
        }, null, null);
      } else if (location === 'tree') {
        section = createComponentVNode(2, Tree, {
          "data": data.tree
        }, null, null);
      }

      return createVNode(1, "div", "Main", section, 0, null, null, null);
    };

    return Main;
  }(Component);

  document.addEventListener('DOMContentLoaded', function (e) {
    var container = document.querySelector('#App');
    uibench.run(function (state) {
      render(createComponentVNode(2, Main, {
        "data": state
      }, null, null), container);
    }, function (samples) {
      render(createVNode(1, "pre", null, JSON.stringify(samples, null, ' '), 0, null, null, null), container);
    });
  });

}());
