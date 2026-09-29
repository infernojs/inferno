(function () {
  'use strict';

  const isArray = Array.isArray;
  function isStringOrNumber(o) {
    const type = typeof o;
    return type === 'string' || type === 'number';
  }
  function isNullOrUndef(o) {
    return o === void 0 || o === null;
  }
  function isInvalid(o) {
    return o === null || o === false || o === true || o === void 0;
  }
  function isFunction$1(o) {
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
  // object.event should always be function, otherwise its badly created object.
  function isLinkEventObject(o) {
    return !isNull(o) && typeof o === 'object';
  }

  // We need EMPTY_OBJ defined in one place.
  // It's used for comparison, so we can't inline it into shared
  const EMPTY_OBJ = {};
  // One per commit. The arrays are created by the first hook queued in them.
  class AnimationQueues {
    constructor() {
      this.componentDidAppear = null;
      this.componentWillDisappear = null;
    }
  }
  // Given to the children of a component that animates its own appearance or removal: their appear
  // and leave hooks do not run. Nothing is ever queued in it.
  const NO_ANIMATIONS = new AnimationQueues();
  function normalizeEventName(name) {
    return name.substring(2).toLowerCase();
  }
  function appendChild(parentDOM, dom) {
    parentDOM.appendChild(dom);
  }
  function insertOrAppend(parentDOM, newNode, nextNode) {
    if (isNull(nextNode)) {
      appendChild(parentDOM, newNode);
    } else {
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
    for (let i = 0; i < arrayFn.length; i++) {
      arrayFn[i]();
    }
  }
  function findChildVNode(vNode, startEdge, flags) {
    const children = vNode.children;
    if ((flags & 4 /* VNodeFlags.ComponentClass */) !== 0) {
      return children.$LI;
    }
    if ((flags & 8192 /* VNodeFlags.Fragment */) !== 0) {
      return vNode.childFlags === 2 /* ChildFlags.HasVNodeChildren */ ? children : children[startEdge ? 0 : children.length - 1];
    }
    return children;
  }
  function findDOMFromVNode(vNode, startEdge) {
    let flags;
    let v = vNode;
    while (!isNullOrUndef(v)) {
      flags = v.flags;
      if ((flags & 1521 /* VNodeFlags.DOMRef */) !== 0) {
        return v.dom;
      }
      v = findChildVNode(v, startEdge, flags);
    }
    return null;
  }
  // The first Element of a vNode's rendered output, or null when that output starts with text, a
  // placeholder or a portal. Appear, leave and move animations need an element to animate.
  function findElementFromVNode(vNode) {
    while (!isNullOrUndef(vNode)) {
      const flags = vNode.flags;
      if (flags & 481 /* VNodeFlags.Element */) {
        return vNode.dom;
      }
      if (flags & 1521 /* VNodeFlags.DOMRef */) {
        return null;
      }
      if (flags & 8192 /* VNodeFlags.Fragment */ && vNode.childFlags & 12 /* ChildFlags.MultipleChildren */) {
        const children = vNode.children;
        for (let i = 0; i < children.length; i++) {
          const dom = findElementFromVNode(children[i]);
          if (dom !== null) {
            return dom;
          }
        }
        return null;
      }
      vNode = findChildVNode(vNode, true, flags);
    }
    return null;
  }
  function callAllAnimationHooks(animationQueue, callback) {
    if (animationQueue === null) {
      return;
    }
    let synchronous = true;
    let animationsLeft = animationQueue.length;
    // Picking from the top because it is faster, invocation order should be irrelevant
    // since all animations are to be run, and we can't predict the order in which they complete.
    let fn;
    while ((fn = animationQueue.pop()) !== undefined) {
      fn(() => {
        if (--animationsLeft <= 0 && isFunction$1(callback)) {
          callback(synchronous);
        }
      });
    }
    synchronous = false;
  }
  function clearVNodeDOM(vNode, parentDOM, deferredRemoval) {
    while (!isNullOrUndef(vNode)) {
      const flags = vNode.flags;
      if (flags & 1521 /* VNodeFlags.DOMRef */) {
        // On deferred removals the node might disappear because of later operations
        if (!deferredRemoval || vNode.dom.parentNode === parentDOM) {
          removeChild(parentDOM, vNode.dom);
        }
        return;
      }
      const children = vNode.children;
      if ((flags & 4 /* VNodeFlags.ComponentClass */) !== 0) {
        vNode = children.$LI;
      }
      if ((flags & 8 /* VNodeFlags.ComponentFunction */) !== 0) {
        vNode = children;
      }
      if ((flags & 8192 /* VNodeFlags.Fragment */) !== 0) {
        if (vNode.childFlags === 2 /* ChildFlags.HasVNodeChildren */) {
          vNode = children;
        } else {
          for (let i = 0, len = children.length; i < len; ++i) {
            clearVNodeDOM(children[i], parentDOM, deferredRemoval);
          }
          return;
        }
      }
    }
  }
  // Appends all DOM nodes of the vNode to parentDOM, moving them from their current parent
  function appendVNodeDOM(vNode, parentDOM) {
    while (!isNullOrUndef(vNode)) {
      const flags = vNode.flags;
      if ((flags & 1521 /* VNodeFlags.DOMRef */) !== 0) {
        appendChild(parentDOM, vNode.dom);
        return;
      }
      const children = vNode.children;
      if ((flags & 4 /* VNodeFlags.ComponentClass */) !== 0) {
        vNode = children.$LI;
      }
      if ((flags & 8 /* VNodeFlags.ComponentFunction */) !== 0) {
        vNode = children;
      }
      if ((flags & 8192 /* VNodeFlags.Fragment */) !== 0) {
        if (vNode.childFlags === 2 /* ChildFlags.HasVNodeChildren */) {
          vNode = children;
        } else {
          for (let i = 0, len = children.length; i < len; ++i) {
            appendVNodeDOM(children[i], parentDOM);
          }
          return;
        }
      }
    }
  }
  function createDeferComponentClassRemovalCallback(vNode, parentDOM) {
    return deferRemoval(parentDOM, () => clearVNodeDOM(vNode, parentDOM, true));
  }
  // A completion may be invoked more than once, or after a later patch removed its DOM.
  function deferRemoval(parent, callback) {
    let completed = false;
    return synchronous => {
      if (completed) return;
      completed = true;
      {
        callback();
      }
    };
  }
  function removeVNodeDOM(vNode, parentDOM, animations) {
    const hooks = animations.componentWillDisappear;
    if (hooks !== null) {
      // The leave hooks queued while unmounting vNode belong to this removal.
      // Wait until animations are finished before removing actual dom nodes
      animations.componentWillDisappear = null;
      callAllAnimationHooks(hooks, createDeferComponentClassRemovalCallback(vNode, parentDOM));
    } else {
      clearVNodeDOM(vNode, parentDOM, false);
    }
  }
  // Reconciliation owns DOM placement. Animation hooks measure before patching,
  // so animated and ordinary nodes follow exactly the same insertion order.
  function moveVNodeDOM(vNode, parentDOM, nextNode) {
    while (!isNullOrUndef(vNode)) {
      const flags = vNode.flags;
      if (flags & 1521 /* VNodeFlags.DOMRef */) {
        insertOrAppend(parentDOM, vNode.dom, nextNode);
        return;
      }
      const children = vNode.children;
      if (flags & 4 /* VNodeFlags.ComponentClass */) {
        vNode = children.$LI;
      } else if (flags & 8 /* VNodeFlags.ComponentFunction */) {
        vNode = children;
      } else if (vNode.childFlags === 2 /* ChildFlags.HasVNodeChildren */) {
        vNode = children;
      } else {
        for (let i = 0; i < children.length; i++) {
          moveVNodeDOM(children[i], parentDOM, nextNode);
        }
        return;
      }
    }
  }
  function createDerivedState(instance, nextProps, state) {
    if (isFunction$1(instance.constructor.getDerivedStateFromProps)) {
      return {
        ...state,
        ...instance.constructor.getDerivedStateFromProps(nextProps, state)
      };
    }
    return state;
  }
  const renderCheck = {
    v: false
  };
  const options = {
    createVNode: null
  };
  function setTextContent(dom, children) {
    dom.textContent = children;
  }
  // Calling this function assumes, nextValue is linkEvent
  function isLastValueSameLinkEvent(lastValue, nextValue) {
    return isLinkEventObject(lastValue) && lastValue.event === nextValue.event && lastValue.data === nextValue.data;
  }
  function mergeUnsetProperties(to, from) {
    for (const propName in from) {
      // @ts-expect-error merge objects
      if (isUndefined(to[propName])) {
        // @ts-expect-error merge objects
        to[propName] = from[propName];
      }
    }
    // @ts-expect-error merge objects
    return to;
  }
  function safeCall1(method, arg1) {
    return isFunction$1(method) && (method(arg1), true);
  }
  const keyPrefix = '$';
  // Index keys are shared, so comparing a normalized key to the same index key is a reference check
  const indexKeys = [];
  function getIndexKey(index) {
    let key = indexKeys[index];
    if (key === void 0) {
      key = indexKeys[index] = keyPrefix + index;
    }
    return key;
  }
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
    const childFlag = childFlags === void 0 ? 1 /* ChildFlags.HasInvalidChildren */ : childFlags;
    const vNode = new V(childFlag, children, className, flags, key, props, ref, type);
    if (childFlag === 0 /* ChildFlags.UnknownChildren */) {
      normalizeChildren(vNode, vNode.children);
    }
    return vNode;
  }
  function mergeDefaultHooks(flags, type, ref) {
    if (flags & 4 /* VNodeFlags.ComponentClass */) {
      return ref;
    }
    const defaultHooks = (flags & 32768 /* VNodeFlags.ForwardRef */ ? type.render : type).defaultHooks;
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
    const defaultProps = (flags & 32768 /* VNodeFlags.ForwardRef */ ? type.render : type).defaultProps;
    if (isNullOrUndef(defaultProps)) {
      return props;
    }
    if (isNullOrUndef(props)) {
      return {
        ...defaultProps
      };
    }
    return mergeUnsetProperties(props, defaultProps);
  }
  function resolveComponentFlags(flags, type) {
    if (flags & 12 /* VNodeFlags.ComponentKnown */) {
      return flags;
    }
    if (type.prototype?.render) {
      return 4 /* VNodeFlags.ComponentClass */;
    }
    if (type.render) {
      return 32776 /* VNodeFlags.ForwardRefComponent */;
    }
    return 8 /* VNodeFlags.ComponentFunction */;
  }
  function createComponentVNode(flags, type, props, key, ref) {
    flags = resolveComponentFlags(flags, type);
    const vNode = new V(1 /* ChildFlags.HasInvalidChildren */, null, null, flags, key, mergeDefaultProps(flags, type, props), mergeDefaultHooks(flags, type, ref), type);
    if (isFunction$1(options.createVNode)) {
      options.createVNode(vNode);
    }
    return vNode;
  }
  function createTextVNode(text, key) {
    return new V(1 /* ChildFlags.HasInvalidChildren */, isNullOrUndef(text) || text === true || text === false ? '' : text, null, 16 /* VNodeFlags.Text */, key, null, null, null);
  }
  function createFragment(children, childFlags, key) {
    const fragment = createVNode(8192 /* VNodeFlags.Fragment */, 8192 /* VNodeFlags.Fragment */, null, children, childFlags, null, key, null);
    switch (fragment.childFlags) {
      case 1 /* ChildFlags.HasInvalidChildren */:
        fragment.children = createVoidVNode();
        fragment.childFlags = 2 /* ChildFlags.HasVNodeChildren */;
        break;
      case 16 /* ChildFlags.HasTextChildren */:
        fragment.children = [createTextVNode(children)];
        fragment.childFlags = 4 /* ChildFlags.HasNonKeyedChildren */;
        break;
    }
    return fragment;
  }
  /*
   * Fragment is different from normal vNode,
   * because when it needs to be cloned we need to clone its children too
   * But not normalize, because otherwise those possibly get KEY and re-mount
   */
  function cloneFragment(vNodeToClone) {
    const oldChildren = vNodeToClone.children;
    const childFlags = vNodeToClone.childFlags;
    return createFragment(childFlags === 2 /* ChildFlags.HasVNodeChildren */ ? directClone(oldChildren) : oldChildren.map(directClone), childFlags, vNodeToClone.key);
  }
  function directClone(vNodeToClone) {
    const flags = vNodeToClone.flags & -16385 /* VNodeFlags.ClearInUse */;
    let props = vNodeToClone.props;
    if (flags & 14 /* VNodeFlags.Component */) {
      if (!isNull(props)) {
        const propsToClone = props;
        props = {};
        for (const key in propsToClone) {
          props[key] = propsToClone[key];
        }
      }
    }
    if ((flags & 8192 /* VNodeFlags.Fragment */) === 0) {
      const childFlags = vNodeToClone.childFlags;
      let children = vNodeToClone.children;
      // Mounting and patching write clones into the children array, so the clone needs its own array
      if (childFlags & 12 /* ChildFlags.MultipleChildren */) {
        children = children.slice();
      }
      return new V(childFlags, children, vNodeToClone.className, flags, vNodeToClone.key, props, vNodeToClone.ref, vNodeToClone.type);
    }
    return cloneFragment(vNodeToClone);
  }
  /*
   * vNode can be referenced outside of render and passed to Inferno again,
   * but it holds the state of its mounted position, so it can be mounted only once.
   * lastVNode is the vNode previously mounted in the same position, or null when mounting.
   * When they are the same, vNode can be patched against itself, unless it needs to be re-created.
   */
  function mustCloneVNode(vNode, lastVNode) {
    const flags = vNode.flags;
    return (flags & 16384 /* VNodeFlags.InUse */) !== 0 && (vNode !== lastVNode || (flags & 2048 /* VNodeFlags.ReCreate */) !== 0);
  }
  function createVoidVNode() {
    return createTextVNode('', null);
  }
  function _normalizeVNodes(nodes, result, index, currentKey) {
    for (const len = nodes.length; index < len; index++) {
      let n = nodes[index];
      if (!isInvalid(n)) {
        const newKey = currentKey + keyPrefix + index;
        if (isArray(n)) {
          _normalizeVNodes(n, result, 0, newKey);
        } else {
          if (isStringOrNumber(n)) {
            n = createTextVNode(n, newKey);
          } else {
            const oldKey = n.key;
            const isPrefixedKey = isString(oldKey) && oldKey[0] === keyPrefix;
            let nextKey = oldKey;
            if (!isPrefixedKey) {
              if (isNull(oldKey)) {
                nextKey = newKey;
              } else {
                nextKey = currentKey + oldKey;
              }
            } else if (oldKey.substring(0, currentKey.length) !== currentKey) {
              nextKey = currentKey + oldKey;
            }
            // Key of a vNode used elsewhere must not change, placing the vNode clones it when it is mounted
            if (nextKey !== oldKey) {
              if (n.flags & 81920 /* VNodeFlags.InUseOrNormalized */ || isPrefixedKey) {
                n = directClone(n);
              }
              n.key = nextKey;
            }
            n.flags |= 65536 /* VNodeFlags.Normalized */;
          }
          result.push(n);
        }
      }
    }
  }
  function normalizeChildren(vNode, children) {
    let newChildren;
    let newChildFlags = 1 /* ChildFlags.HasInvalidChildren */;
    // Don't change children to match strict equal (===) true in patching
    if (isInvalid(children)) {
      newChildren = children;
    } else if (isStringOrNumber(children)) {
      newChildFlags = 16 /* ChildFlags.HasTextChildren */;
      newChildren = children;
    } else if (isArray(children)) {
      const len = children.length;
      for (let i = 0; i < len; ++i) {
        let n = children[i];
        if (isInvalid(n) || isArray(n)) {
          newChildren = newChildren || children.slice(0, i);
          _normalizeVNodes(children, newChildren, i, '');
          break;
        } else if (isStringOrNumber(n)) {
          newChildren = newChildren || children.slice(0, i);
          newChildren.push(createTextVNode(n, getIndexKey(i)));
        } else {
          const key = n.key;
          const flags = n.flags;
          const isOwned = (flags & 81920 /* VNodeFlags.InUseOrNormalized */) > 0;
          const isNullKey = isNull(key);
          const isPrefixed = isString(key) && key[0] === keyPrefix;
          // Owned vNodes are copied to new array, so each parent has its own children array
          if (isOwned || isNullKey || isPrefixed) {
            newChildren = newChildren || children.slice(0, i);
            const nextKey = isNullKey || isPrefixed ? getIndexKey(i) : key;
            // Key of a vNode used elsewhere must not change, placing the vNode clones it when it is mounted
            if (nextKey !== key) {
              if (isOwned || isPrefixed) {
                n = directClone(n);
              }
              n.key = nextKey;
            }
            newChildren.push(n);
          } else if (newChildren) {
            newChildren.push(n);
          }
          n.flags |= 65536 /* VNodeFlags.Normalized */;
        }
      }
      newChildren = newChildren || children;
      if (newChildren.length === 0) {
        newChildFlags = 1 /* ChildFlags.HasInvalidChildren */;
      } else {
        newChildFlags = 8 /* ChildFlags.HasKeyedChildren */;
      }
    } else {
      // Single child keeps its key, placing the vNode clones it when it is mounted
      newChildren = children;
      newChildren.flags |= 65536 /* VNodeFlags.Normalized */;
      newChildFlags = 2 /* ChildFlags.HasVNodeChildren */;
    }
    vNode.children = newChildren;
    vNode.childFlags = newChildFlags;
    return vNode;
  }
  function normalizeRoot(input, lastInput) {
    if (isInvalid(input) || isStringOrNumber(input)) {
      return createTextVNode(input, null);
    }
    if (isArray(input)) {
      return createFragment(input, 0 /* ChildFlags.UnknownChildren */, null);
    }
    return mustCloneVNode(input, lastInput) ? directClone(input) : input;
  }
  const xlinkNS = 'http://www.w3.org/1999/xlink';
  const xmlNS = 'http://www.w3.org/XML/1998/namespace';
  const namespaces = {
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
  const attachedEventCounts = getDelegatedEventObject(0);
  const attachedEvents = getDelegatedEventObject(null);
  const syntheticEvents = getDelegatedEventObject(true);
  function updateOrAddSyntheticEvent(name, dom) {
    let eventsObject = dom.$EV;
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
    const eventsObject = dom.$EV;
    if (eventsObject?.[name]) {
      if (--attachedEventCounts[name] === 0) {
        document.removeEventListener(normalizeEventName(name), attachedEvents[name]);
        attachedEvents[name] = null;
      }
      eventsObject[name] = null;
    }
  }
  function handleSyntheticEvent(name, lastEvent, nextEvent, dom) {
    if (isFunction$1(nextEvent)) {
      updateOrAddSyntheticEvent(name, dom)[name] = nextEvent;
    } else if (isLinkEventObject(nextEvent)) {
      if (isLastValueSameLinkEvent(lastEvent, nextEvent)) {
        return;
      }
      updateOrAddSyntheticEvent(name, dom)[name] = nextEvent;
    } else {
      unmountSyntheticEvent(name, dom);
    }
  }
  // TODO: When browsers fully support event.composedPath we could loop it through instead of using parentNode property
  function getTargetNode(event) {
    return isFunction$1(event.composedPath) ? event.composedPath()[0] : event.target;
  }
  function dispatchEvents(event, isClick, name, eventData) {
    let dom = getTargetNode(event);
    do {
      // Html Nodes can be nested fe: span inside button in that scenario browser does not handle disabled attribute on parent,
      // because the event listener is on document.body
      // Don't process clicks on disabled elements
      if (isClick && dom.disabled) {
        return;
      }
      const eventsObject = dom.$EV;
      if (!isNullOrUndef(eventsObject)) {
        const currentEvent = eventsObject[name];
        if (currentEvent) {
          // linkEvent object
          eventData.dom = dom;
          if (currentEvent.event) {
            currentEvent.event(currentEvent.data, event);
          } else {
            currentEvent(event);
          }
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
    // Event data needs to be an object to save reference to currentTarget getter
    const eventData = {
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
  function rootEvent(name) {
    const isClick = name === 'onClick' || name === 'onDblClick';
    return function (event) {
      dispatchEvents(event, isClick, name, extendEventProperties(event));
    };
  }
  function attachEventToDocument(name) {
    const attachedEvent = rootEvent(name);
    document.addEventListener(normalizeEventName(name), attachedEvent);
    return attachedEvent;
  }
  function isSameInnerHTML(dom, innerHTML) {
    const temp = document.createElement('i');
    temp.innerHTML = innerHTML;
    return temp.innerHTML === dom.innerHTML;
  }
  function triggerEventListener(props, methodName, e) {
    const listener = props[methodName];
    if (listener) {
      if (listener.event) {
        listener.event(listener.data, e);
      } else {
        listener(e);
      }
    } else {
      const nativeListenerName = methodName.toLowerCase();
      if (isFunction$1(props[nativeListenerName])) {
        props[nativeListenerName](e);
      }
    }
  }
  function createWrappedFunction(methodName, applyValue) {
    const fnWrapper = function fnWrapper(e) {
      const vNode = this.$V;
      // If vNode is gone by the time event fires, no-op
      if (isNullOrUndef(vNode)) {
        return;
      }
      const props = vNode.props ?? EMPTY_OBJ;
      const dom = vNode.dom;
      if (isString(methodName)) {
        triggerEventListener(props, methodName, e);
      } else {
        for (let i = 0; i < methodName.length; ++i) {
          triggerEventListener(props, methodName[i], e);
        }
      }
      if (isFunction$1(applyValue)) {
        const newVNode = this.$V;
        const newProps = newVNode.props ?? EMPTY_OBJ;
        applyValue(newProps, dom, false, newVNode);
      }
    };
    Object.defineProperty(fnWrapper, 'wrapped', {
      configurable: false,
      enumerable: false,
      value: true,
      writable: false
    });
    return fnWrapper;
  }
  function attachEvent(dom, eventName, handler) {
    const previousKey = `$${eventName}`;
    const previousArgs = dom[previousKey];
    if (previousArgs) {
      if (previousArgs[1].wrapped) {
        return;
      }
      dom.removeEventListener(previousArgs[0], previousArgs[1]);
      dom[previousKey] = null;
    }
    if (isFunction$1(handler)) {
      dom.addEventListener(eventName, handler);
      dom[previousKey] = [eventName, handler];
    }
  }
  function isCheckedType(type) {
    return type === 'checkbox' || type === 'radio';
  }
  const onTextInputChange = createWrappedFunction('onInput', applyValueInput);
  const wrappedOnChange$1 = createWrappedFunction(['onClick', 'onChange'], applyValueInput);
  function stopPropagationWrapper(event) {
    event.stopPropagation();
  }
  stopPropagationWrapper.wrapped = true;
  function inputEvents(dom, nextPropsOrEmpty) {
    if (isCheckedType(nextPropsOrEmpty.type)) {
      attachEvent(dom, 'change', wrappedOnChange$1);
      attachEvent(dom, 'click', stopPropagationWrapper);
    } else {
      attachEvent(dom, 'input', onTextInputChange);
    }
  }
  function applyValueInput(nextPropsOrEmpty, dom) {
    const type = nextPropsOrEmpty.type;
    const value = nextPropsOrEmpty.value;
    const checked = nextPropsOrEmpty.checked;
    const multiple = nextPropsOrEmpty.multiple;
    const defaultValue = nextPropsOrEmpty.defaultValue;
    const hasValue = !isNullOrUndef(value);
    if (type != null && type !== dom.type) {
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
    } else {
      if (hasValue && dom.value !== value) {
        dom.defaultValue = value;
        dom.value = value;
      } else if (!isNullOrUndef(checked)) {
        dom.checked = checked;
      }
    }
  }
  function updateChildOptions(vNode, value) {
    if (vNode.type === 'option') {
      updateChildOption(vNode, value);
    } else {
      const children = vNode.children;
      const flags = vNode.flags;
      if ((flags & 4 /* VNodeFlags.ComponentClass */) !== 0) {
        updateChildOptions(children.$LI, value);
      } else if ((flags & 8 /* VNodeFlags.ComponentFunction */) !== 0) {
        updateChildOptions(children, value);
      } else if (vNode.childFlags === 2 /* ChildFlags.HasVNodeChildren */) {
        updateChildOptions(children, value);
      } else if ((vNode.childFlags & 12 /* ChildFlags.MultipleChildren */) !== 0) {
        for (let i = 0, len = children.length; i < len; ++i) {
          updateChildOptions(children[i], value);
        }
      }
    }
  }
  function updateChildOption(vNode, value) {
    const props = vNode.props ?? EMPTY_OBJ;
    const propsValue = props.value;
    const dom = vNode.dom;
    // we do this as multiple prop may have changed
    dom.value = propsValue;
    if (propsValue === value || isArray(value) && value.includes(propsValue)) {
      dom.selected = true;
    } else if (!isNullOrUndef(value) || !isNullOrUndef(props.selected)) {
      dom.selected = Boolean(props.selected);
    }
  }
  const onSelectChange = createWrappedFunction('onChange', applyValueSelect);
  function selectEvents(dom) {
    attachEvent(dom, 'change', onSelectChange);
  }
  function applyValueSelect(nextPropsOrEmpty, dom, mounting, vNode) {
    const multiplePropInBoolean = Boolean(nextPropsOrEmpty.multiple);
    if (!isNullOrUndef(nextPropsOrEmpty.multiple) && multiplePropInBoolean !== dom.multiple) {
      dom.multiple = multiplePropInBoolean;
    }
    const index = nextPropsOrEmpty.selectedIndex;
    if (index === -1) {
      dom.selectedIndex = -1;
    }
    const childFlags = vNode.childFlags;
    if (childFlags !== 1 /* ChildFlags.HasInvalidChildren */) {
      let value = nextPropsOrEmpty.value;
      if (isNumber(index) && index > -1 && !isNullOrUndef(dom.options[index])) {
        value = dom.options[index].value;
      }
      if (mounting && isNullOrUndef(value)) {
        value = nextPropsOrEmpty.defaultValue;
      }
      updateChildOptions(vNode, value);
    }
  }
  const onTextareaInputChange = createWrappedFunction('onInput', applyValueTextArea);
  const wrappedOnChange = createWrappedFunction('onChange');
  function textAreaEvents(dom, nextPropsOrEmpty) {
    attachEvent(dom, 'input', onTextareaInputChange);
    if (isFunction$1(nextPropsOrEmpty.onChange)) {
      attachEvent(dom, 'change', wrappedOnChange);
    }
  }
  function applyValueTextArea(nextPropsOrEmpty, dom, mounting) {
    const value = nextPropsOrEmpty.value;
    const domValue = dom.value;
    if (isNullOrUndef(value)) {
      if (mounting) {
        const defaultValue = nextPropsOrEmpty.defaultValue;
        if (!isNullOrUndef(defaultValue) && defaultValue !== domValue) {
          dom.defaultValue = defaultValue;
          dom.value = defaultValue;
        }
      }
    } else if (domValue !== value) {
      /* There is value so keep it controlled */
      dom.defaultValue = value;
      dom.value = value;
    }
  }
  function processElement(flags, vNode, dom, nextPropsOrEmpty, mounting, isControlled) {
    if ((flags & 64 /* VNodeFlags.InputElement */) !== 0) {
      applyValueInput(nextPropsOrEmpty, dom);
    } else if ((flags & 256 /* VNodeFlags.SelectElement */) !== 0) {
      applyValueSelect(nextPropsOrEmpty, dom, mounting, vNode);
    } else if ((flags & 128 /* VNodeFlags.TextareaElement */) !== 0) {
      applyValueTextArea(nextPropsOrEmpty, dom, mounting);
    }
    if (isControlled) {
      dom.$V = vNode;
    }
  }
  function addFormElementEventHandlers(flags, dom, nextPropsOrEmpty) {
    if ((flags & 64 /* VNodeFlags.InputElement */) !== 0) {
      inputEvents(dom, nextPropsOrEmpty);
    } else if ((flags & 256 /* VNodeFlags.SelectElement */) !== 0) {
      selectEvents(dom);
    } else if ((flags & 128 /* VNodeFlags.TextareaElement */) !== 0) {
      textAreaEvents(dom, nextPropsOrEmpty);
    }
  }
  function isControlledFormElement(nextPropsOrEmpty) {
    return isCheckedType(nextPropsOrEmpty.type) ? !isNullOrUndef(nextPropsOrEmpty.checked) : !isNullOrUndef(nextPropsOrEmpty.value);
  }
  function unmountRef(ref) {
    if (!isNullOrUndef(ref)) {
      if (!safeCall1(ref, null) && ref.current) {
        ref.current = null;
      }
    }
  }
  function mountRef(ref, value, lifecycle) {
    if (!isNullOrUndef(ref) && (isFunction$1(ref) || ref.current !== void 0)) {
      lifecycle.push(() => {
        if (!safeCall1(ref, value) && ref.current !== void 0) {
          ref.current = value;
        }
      });
    }
  }
  function remove(vNode, parentDOM, animations) {
    unmount(vNode, animations);
    removeVNodeDOM(vNode, parentDOM, animations);
  }
  function unmount(vNode, animations) {
    const flags = vNode.flags;
    const children = vNode.children;
    let ref;
    if ((flags & 481 /* VNodeFlags.Element */) !== 0) {
      ref = vNode.ref;
      const props = vNode.props;
      unmountRef(ref);
      const childFlags = vNode.childFlags;
      if (!isNull(props)) {
        // for-in reads the enum cache without allocating, Object.keys copied it for every element.
        // Only "on" props can be delegated events, others skip the lookup that is megamorphic by name.
        for (const key in props) {
          if (key.charCodeAt(0) === 111 && key.charCodeAt(1) === 110 && syntheticEvents[key]) {
            unmountSyntheticEvent(key, vNode.dom);
          }
        }
      }
      if (childFlags & 12 /* ChildFlags.MultipleChildren */) {
        unmountAllChildren(children, animations);
      } else if (childFlags === 2 /* ChildFlags.HasVNodeChildren */) {
        unmount(children, animations);
      }
    } else if (children) {
      if (flags & 4 /* VNodeFlags.ComponentClass */) {
        if (isFunction$1(children.componentWillUnmount)) {
          // TODO: Possible entrypoint
          children.componentWillUnmount();
        }
        // A component that animates its own removal does not let its children animate. Inside such a
        // component animations is NO_ANIMATIONS, and its hook does not run either.
        let childAnimations = animations;
        if (isFunction$1(children.componentWillDisappear) && animations !== NO_ANIMATIONS) {
          childAnimations = NO_ANIMATIONS;
          addDisappearAnimationHook(animations, children, findElementFromVNode(children.$LI), flags, undefined);
        }
        unmountRef(vNode.ref);
        children.$UN = true;
        unmount(children.$LI, childAnimations);
      } else if (flags & 8 /* VNodeFlags.ComponentFunction */) {
        // If we have a onComponentWillDisappear on this component, block children from animating
        let childAnimations = animations;
        ref = vNode.ref;
        if (!isNullOrUndef(ref)) {
          let domEl;
          if (isFunction$1(ref.onComponentWillUnmount)) {
            domEl = findDOMFromVNode(vNode, true);
            ref.onComponentWillUnmount(domEl, vNode.props || EMPTY_OBJ);
          }
          if (isFunction$1(ref.onComponentWillDisappear) && animations !== NO_ANIMATIONS) {
            childAnimations = NO_ANIMATIONS;
            domEl = findElementFromVNode(vNode);
            addDisappearAnimationHook(animations, ref, domEl, flags, vNode.props);
          }
        }
        unmount(children, childAnimations);
      } else if (flags & 1024 /* VNodeFlags.Portal */) {
        remove(children, vNode.ref, animations);
      } else if (flags & 8192 /* VNodeFlags.Fragment */) {
        if (vNode.childFlags & 12 /* ChildFlags.MultipleChildren */) {
          unmountAllChildren(children, animations);
        } else {
          unmount(children, animations);
        }
      }
    }
  }
  function unmountAllChildren(children, animations) {
    for (let i = 0, len = children.length; i < len; ++i) {
      unmount(children[i], animations);
    }
  }
  function createClearAllCallback(children, parentDOM) {
    return deferRemoval(parentDOM, () => {
      // We need to remove children one by one because elements can be added during animation
      if (parentDOM) {
        for (let i = 0; i < children.length; i++) {
          const vNode = children[i];
          clearVNodeDOM(vNode, parentDOM, true);
        }
      }
    });
  }
  function clearDOM(parentDOM, children, animations) {
    const hooks = animations.componentWillDisappear;
    if (hooks !== null) {
      // The leave hooks queued while unmounting children belong to this removal.
      // Wait until animations are finished before removing actual dom nodes
      // Be aware that the element could be removed by a later operation
      animations.componentWillDisappear = null;
      callAllAnimationHooks(hooks, createClearAllCallback(children, parentDOM));
    } else {
      // Optimization for clearing dom
      parentDOM.textContent = '';
    }
  }
  function removeAllChildren(dom, vNode, children, animations) {
    unmountAllChildren(children, animations);
    if (vNode.flags & 8192 /* VNodeFlags.Fragment */) {
      removeVNodeDOM(vNode, dom, animations);
    } else {
      clearDOM(dom, children, animations);
    }
  }
  // Only add animations to queue in browser
  function addDisappearAnimationHook(animations, instanceOrRef, dom, flags, props) {
    if (dom === null) return;
    const queue = animations.componentWillDisappear || (animations.componentWillDisappear = []);
    // @ts-expect-error TODO: Here is something weird check this behavior
    queue.push(callback => {
      if (flags & 4 /* VNodeFlags.ComponentClass */) {
        instanceOrRef.componentWillDisappear(dom, callback);
      } else if (flags & 8 /* VNodeFlags.ComponentFunction */) {
        instanceOrRef.onComponentWillDisappear(dom, props, callback);
      }
    });
  }
  function wrapLinkEvent(nextValue) {
    // This variable makes sure there is no "this" context in callback
    const ev = nextValue.event;
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
    const domStyle = dom.style;
    let style;
    let value;
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
    } else {
      for (style in nextAttrValue) {
        value = nextAttrValue[style];
        domStyle.setProperty(style, value);
      }
    }
  }
  function patchDangerInnerHTML(lastValue, nextValue, lastVNode, dom) {
    const lastHtml = lastValue?.__html || '';
    const nextHtml = nextValue?.__html || '';
    if (lastHtml !== nextHtml) {
      if (!isNullOrUndef(nextHtml) && !isSameInnerHTML(dom, nextHtml)) {
        if (!isNull(lastVNode)) {
          // innerHTML replaces the children at once: their leave hooks have nothing to animate
          if (lastVNode.childFlags & 12 /* ChildFlags.MultipleChildren */) {
            unmountAllChildren(lastVNode.children, NO_ANIMATIONS);
          } else if (lastVNode.childFlags === 2 /* ChildFlags.HasVNodeChildren */) {
            unmount(lastVNode.children, NO_ANIMATIONS);
          }
        }
        dom.innerHTML = nextHtml;
        return true;
      }
    }
    return false;
  }
  function patchDomProp(nextValue, dom, prop) {
    const value = isNullOrUndef(nextValue) ? '' : nextValue;
    if (dom[prop] !== value) {
      dom[prop] = value;
    }
  }
  // Returns true when innerHTML replaced the previous children.
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
        patchDomProp(nextValue, dom, prop);
        break;
      case 'style':
        patchStyle(lastValue, nextValue, dom);
        break;
      case 'dangerouslySetInnerHTML':
        return patchDangerInnerHTML(lastValue, nextValue, lastVNode, dom);
      default:
        if (syntheticEvents[prop]) {
          handleSyntheticEvent(prop, lastValue, nextValue, dom);
        } else if (prop.charCodeAt(0) === 111 && prop.charCodeAt(1) === 110) {
          patchEvent(prop, lastValue, nextValue, dom);
        } else if (isNullOrUndef(nextValue)) {
          dom.removeAttribute(prop);
        } else if (isSVG && namespaces[prop]) {
          // We optimize for isSVG being false
          // If we end up in this path we can read property again
          dom.setAttributeNS(namespaces[prop], prop, nextValue);
        } else {
          dom.setAttribute(prop, nextValue);
        }
        break;
    }
    return false;
  }
  function mountProps(vNode, flags, props, dom, isSVG) {
    let hasControlledValue = false;
    const isFormElement = (flags & 448 /* VNodeFlags.FormElement */) > 0;
    if (isFormElement) {
      hasControlledValue = isControlledFormElement(props);
      if (hasControlledValue) {
        addFormElementEventHandlers(flags, dom, props);
      }
    }
    for (const prop in props) {
      // do not add a hasOwnProperty check here, it affects performance
      patchProp(prop, null, props[prop], dom, isSVG, hasControlledValue, null);
    }
    if (isFormElement) {
      processElement(flags, vNode, dom, props, true, hasControlledValue);
    }
  }
  function renderNewInput(instance, props, context, lastInput) {
    const nextInput = normalizeRoot(instance.render(props, instance.state, context), lastInput);
    let childContext = context;
    if (isFunction$1(instance.getChildContext)) {
      childContext = {
        ...context,
        ...instance.getChildContext()
      };
    }
    instance.$CX = childContext;
    return nextInput;
  }
  function createClassComponentInstance(vNode, ComponentCtr, props, context, isSVG, lifecycle) {
    const instance = new ComponentCtr(props, context);
    const usesNewAPI = instance.$N = Boolean(ComponentCtr.getDerivedStateFromProps || instance.getSnapshotBeforeUpdate);
    instance.$SVG = isSVG;
    instance.$L = lifecycle;
    vNode.children = instance;
    instance.$BS = false;
    instance.context = context;
    if (instance.props === EMPTY_OBJ) {
      instance.props = props;
    }
    if (!usesNewAPI) {
      if (isFunction$1(instance.componentWillMount)) {
        instance.$BR = true;
        instance.componentWillMount();
        const pending = instance.$PS;
        if (!isNull(pending)) {
          const state = instance.state;
          if (isNull(state)) {
            instance.state = pending;
          } else {
            for (const key in pending) {
              state[key] = pending[key];
            }
          }
          instance.$PS = null;
        }
        instance.$BR = false;
      }
    } else {
      instance.state = createDerivedState(instance, props, instance.state);
    }
    instance.$LI = renderNewInput(instance, props, context);
    return instance;
  }
  function renderFunctionalComponent(vNode, context) {
    const props = vNode.props || EMPTY_OBJ;
    return vNode.flags & 32768 /* VNodeFlags.ForwardRef */ ? vNode.type.render(props, vNode.ref, context) : vNode.type(props, context);
  }
  function mount(vNode, parentDOM, context, isSVG, nextNode, lifecycle, animations) {
    const flags = vNode.flags |= 16384 /* VNodeFlags.InUse */;
    if ((flags & 481 /* VNodeFlags.Element */) !== 0) {
      mountElement(vNode, parentDOM, context, isSVG, nextNode, lifecycle, animations);
    } else if ((flags & 4 /* VNodeFlags.ComponentClass */) !== 0) {
      mountClassComponent(vNode, parentDOM, context, isSVG, nextNode, lifecycle, animations);
    } else if (flags & 8 /* VNodeFlags.ComponentFunction */) {
      mountFunctionalComponent(vNode, parentDOM, context, isSVG, nextNode, lifecycle, animations);
    } else if (flags & 16 /* VNodeFlags.Text */) {
      mountText(vNode, parentDOM, nextNode);
    } else if (flags & 8192 /* VNodeFlags.Fragment */) {
      mountFragment(vNode, context, parentDOM, isSVG, nextNode, lifecycle, animations);
    } else if (flags & 1024 /* VNodeFlags.Portal */) {
      mountPortal(vNode, context, parentDOM, nextNode, lifecycle, animations);
    } else ;
  }
  function mountPortal(vNode, context, parentDOM, nextNode, lifecycle, animations) {
    let children = vNode.children;
    if (mustCloneVNode(children, null)) {
      vNode.children = children = directClone(children);
    }
    mount(children, vNode.ref, context, false, null, lifecycle, animations);
    const placeHolderVNode = createVoidVNode();
    mountText(placeHolderVNode, parentDOM, nextNode);
    vNode.dom = placeHolderVNode.dom;
  }
  function mountFragment(vNode, context, parentDOM, isSVG, nextNode, lifecycle, animations) {
    let children = vNode.children;
    let childFlags = vNode.childFlags;
    // When fragment is optimized for multiple children, check if there is no children and change flag to invalid
    // This is the only normalization always done, to keep optimization flags API same for fragments and regular elements
    if (childFlags & 12 /* ChildFlags.MultipleChildren */ && children.length === 0) {
      childFlags = vNode.childFlags = 2 /* ChildFlags.HasVNodeChildren */;
      children = vNode.children = createVoidVNode();
    }
    if (childFlags === 2 /* ChildFlags.HasVNodeChildren */) {
      if (mustCloneVNode(children, null)) {
        vNode.children = children = directClone(children);
      }
      mount(children, parentDOM, context, isSVG, nextNode, lifecycle, animations);
    } else {
      mountArrayChildren(children, parentDOM, context, isSVG, nextNode, lifecycle, animations);
    }
  }
  function mountText(vNode, parentDOM, nextNode) {
    const dom = vNode.dom = document.createTextNode(vNode.children);
    if (!isNull(parentDOM)) {
      insertOrAppend(parentDOM, dom, nextNode);
    }
  }
  function mountElement(vNode, parentDOM, context, isSVG, nextNode, lifecycle, animations) {
    const flags = vNode.flags;
    const props = vNode.props;
    const className = vNode.className;
    const childFlags = vNode.childFlags;
    const dom = vNode.dom = documentCreateElement(vNode.type, isSVG = isSVG || (flags & 32 /* VNodeFlags.SvgElement */) > 0);
    let children = vNode.children;
    if (!isNullOrUndef(className) && className !== '') {
      if (isSVG) {
        dom.setAttribute('class', className);
      } else {
        dom.className = className;
      }
    }
    if (childFlags === 16 /* ChildFlags.HasTextChildren */) {
      setTextContent(dom, children);
    } else if (childFlags !== 1 /* ChildFlags.HasInvalidChildren */) {
      const childrenIsSVG = isSVG && vNode.type !== 'foreignObject';
      if (childFlags === 2 /* ChildFlags.HasVNodeChildren */) {
        if (mustCloneVNode(children, null)) {
          vNode.children = children = directClone(children);
        }
        mount(children, dom, context, childrenIsSVG, null, lifecycle, animations);
      } else if (childFlags === 8 /* ChildFlags.HasKeyedChildren */ || childFlags === 4 /* ChildFlags.HasNonKeyedChildren */) {
        mountArrayChildren(children, dom, context, childrenIsSVG, null, lifecycle, animations);
      }
    }
    // Props are set before the element enters the document: attribute changes on a connected element cost
    // style invalidation, and autofocus only works when the attribute is there on insertion.
    if (!isNull(props)) {
      mountProps(vNode, flags, props, dom, isSVG);
    }
    if (!isNull(parentDOM)) {
      insertOrAppend(parentDOM, dom, nextNode);
    }
    mountRef(vNode.ref, dom, lifecycle);
  }
  function mountArrayChildren(children, dom, context, isSVG, nextNode, lifecycle, animations) {
    for (let i = 0; i < children.length; ++i) {
      let child = children[i];
      if (mustCloneVNode(child, null)) {
        children[i] = child = directClone(child);
      }
      mount(child, dom, context, isSVG, nextNode, lifecycle, animations);
    }
  }
  function mountClassComponent(vNode, parentDOM, context, isSVG, nextNode, lifecycle, animations) {
    const instance = createClassComponentInstance(vNode, vNode.type, vNode.props || EMPTY_OBJ, context, isSVG, lifecycle);
    // A component that animates its own appearance does not let its children animate. Inside such a
    // component animations is NO_ANIMATIONS already, so childAnimations stays equal to it.
    let childAnimations = animations;
    if (typeof instance.componentDidAppear === 'function') {
      childAnimations = NO_ANIMATIONS;
    }
    mount(instance.$LI, parentDOM, instance.$CX, isSVG, nextNode, lifecycle, childAnimations);
    mountClassComponentCallbacks(vNode.ref, instance, lifecycle);
    if (childAnimations !== animations) {
      addAppearAnimationHookClass(animations, instance);
    }
  }
  function mountFunctionalComponent(vNode, parentDOM, context, isSVG, nextNode, lifecycle, animations) {
    const ref = vNode.ref;
    // A component that animates its own appearance does not let its children animate
    let childAnimations = animations;
    if (!isNullOrUndef(ref) && isFunction$1(ref.onComponentDidAppear)) {
      childAnimations = NO_ANIMATIONS;
    }
    mount(vNode.children = normalizeRoot(renderFunctionalComponent(vNode, context)), parentDOM, context, isSVG, nextNode, lifecycle, childAnimations);
    mountFunctionalComponentCallbacks(vNode, lifecycle);
    if (childAnimations !== animations) {
      addAppearAnimationHookFunctional(animations, vNode);
    }
  }
  function createClassMountCallback(instance) {
    return () => {
      instance.componentDidMount();
    };
  }
  function addAppearAnimationHookClass(animations, instance) {
    const dom = findElementFromVNode(instance.$LI);
    if (dom !== null) {
      (animations.componentDidAppear || (animations.componentDidAppear = [])).push(() => {
        instance.componentDidAppear(dom);
      });
    }
  }
  function addAppearAnimationHookFunctional(animations, vNode) {
    const dom = findElementFromVNode(vNode);
    const ref = vNode.ref;
    const props = vNode.props;
    if (dom !== null) {
      (animations.componentDidAppear || (animations.componentDidAppear = [])).push(() => {
        ref.onComponentDidAppear(dom, props);
      });
    }
  }
  function mountClassComponentCallbacks(ref, instance, lifecycle) {
    mountRef(ref, instance, lifecycle);
    if (isFunction$1(instance.componentDidMount)) {
      lifecycle.push(createClassMountCallback(instance));
    }
  }
  function createOnMountCallback(ref, vNode) {
    return () => {
      ref.onComponentDidMount(findDOMFromVNode(vNode, true), vNode.props || EMPTY_OBJ);
    };
  }
  function mountFunctionalComponentCallbacks(vNode, lifecycle) {
    const ref = vNode.ref;
    if (!isNullOrUndef(ref)) {
      safeCall1(ref.onComponentWillMount, vNode.props || EMPTY_OBJ);
      if (isFunction$1(ref.onComponentDidMount)) {
        lifecycle.push(createOnMountCallback(ref, vNode));
      }
    }
  }
  function replaceWithNewNode(lastVNode, nextVNode, parentDOM, context, isSVG, lifecycle, animations) {
    unmount(lastVNode, animations);
    // One replaceChild, unless leave hooks inside lastVNode have to animate out before its removal
    if (nextVNode.flags & lastVNode.flags & 1521 /* VNodeFlags.DOMRef */ && animations.componentWillDisappear === null) {
      mount(nextVNode, null, context, isSVG, null, lifecycle, animations);
      // Single DOM operation, when we have dom references available
      replaceChild(parentDOM, nextVNode.dom, lastVNode.dom);
    } else {
      mount(nextVNode, parentDOM, context, isSVG, findDOMFromVNode(lastVNode, true), lifecycle, animations);
      removeVNodeDOM(lastVNode, parentDOM, animations);
    }
  }
  function patch$1(lastVNode, nextVNode, parentDOM, context, isSVG, nextNode, lifecycle, animations) {
    const nextFlags = nextVNode.flags |= 16384 /* VNodeFlags.InUse */;
    if (
    // Normalized flag tells only whether the vNode has been normalized, it is not part of the vNode type
    ((lastVNode.flags ^ nextFlags) & -65537 /* VNodeFlags.Normalized */) !== 0 || lastVNode.type !== nextVNode.type || lastVNode.key !== nextVNode.key || nextFlags & 2048 /* VNodeFlags.ReCreate */) {
      if (lastVNode.flags & 16384 /* VNodeFlags.InUse */) {
        replaceWithNewNode(lastVNode, nextVNode, parentDOM, context, isSVG, lifecycle, animations);
      } else {
        // Last vNode is not in use, it has crashed at application level. Just mount nextVNode and ignore last one
        mount(nextVNode, parentDOM, context, isSVG, nextNode, lifecycle, animations);
      }
    } else if (nextFlags & 481 /* VNodeFlags.Element */) {
      patchElement(lastVNode, nextVNode, context, isSVG, lifecycle, animations);
    } else if (nextFlags & 4 /* VNodeFlags.ComponentClass */) {
      patchClassComponent(lastVNode, nextVNode, parentDOM, context, isSVG, nextNode, lifecycle, animations);
    } else if (nextFlags & 8 /* VNodeFlags.ComponentFunction */) {
      patchFunctionalComponent(lastVNode, nextVNode, parentDOM, context, isSVG, nextNode, lifecycle, animations);
    } else if (nextFlags & 16 /* VNodeFlags.Text */) {
      patchText(lastVNode, nextVNode);
    } else if (nextFlags & 8192 /* VNodeFlags.Fragment */) {
      patchFragment(lastVNode, nextVNode, parentDOM, context, isSVG, lifecycle, animations);
    } else {
      patchPortal(lastVNode, nextVNode, context, lifecycle, animations);
    }
  }
  function patchSingleTextChild(lastChildren, nextChildren, parentDOM) {
    if (lastChildren !== nextChildren) {
      if (lastChildren !== '') {
        parentDOM.firstChild.nodeValue = nextChildren;
      } else {
        setTextContent(parentDOM, nextChildren);
      }
    }
  }
  function patchContentEditableChildren(dom, nextChildren) {
    if (dom.textContent !== nextChildren) {
      dom.textContent = nextChildren;
    }
  }
  function patchFragment(lastVNode, nextVNode, parentDOM, context, isSVG, lifecycle, animations) {
    const lastChildren = lastVNode.children;
    let nextChildren = nextVNode.children;
    const lastChildFlags = lastVNode.childFlags;
    let nextChildFlags = nextVNode.childFlags;
    let nextNode = null;
    // When fragment is optimized for multiple children, check if there is no children and change flag to invalid
    // This is the only normalization always done, to keep optimization flags API same for fragments and regular elements
    if (nextChildFlags & 12 /* ChildFlags.MultipleChildren */ && nextChildren.length === 0) {
      nextChildFlags = nextVNode.childFlags = 2 /* ChildFlags.HasVNodeChildren */;
      nextChildren = nextVNode.children = createVoidVNode();
    }
    const nextIsSingle = (nextChildFlags & 2 /* ChildFlags.HasVNodeChildren */) !== 0;
    if (nextIsSingle && mustCloneVNode(nextChildren, lastChildren)) {
      nextChildren = nextVNode.children = directClone(nextChildren);
    }
    if (lastChildFlags & 12 /* ChildFlags.MultipleChildren */) {
      const lastLen = lastChildren.length;
      // We need to know Fragment's edge node when
      if (
      // It uses keyed algorithm
      lastChildFlags & 8 /* ChildFlags.HasKeyedChildren */ && nextChildFlags & 8 /* ChildFlags.HasKeyedChildren */ ||
      // It transforms from many to single
      nextIsSingle ||
      // It will append more nodes
      !nextIsSingle && nextChildren.length > lastLen) {
        // When fragment has multiple children there is always at least one vNode
        nextNode = findDOMFromVNode(lastChildren[lastLen - 1], false).nextSibling;
      }
    }
    patchChildren(lastChildFlags, nextChildFlags, lastChildren, nextChildren, parentDOM, context, isSVG, nextNode, lastVNode, lifecycle, animations);
  }
  function patchPortal(lastVNode, nextVNode, context, lifecycle, animations) {
    const lastContainer = lastVNode.ref;
    const nextContainer = nextVNode.ref;
    let nextChildren = nextVNode.children;
    if (nextVNode.childFlags === 2 /* ChildFlags.HasVNodeChildren */ && mustCloneVNode(nextChildren, lastVNode.children)) {
      nextChildren = nextVNode.children = directClone(nextChildren);
    }
    patchChildren(lastVNode.childFlags, nextVNode.childFlags, lastVNode.children, nextChildren, lastContainer, context, false, null, lastVNode, lifecycle, animations);
    nextVNode.dom = lastVNode.dom;
    if (lastContainer !== nextContainer && !isInvalid(nextChildren)) {
      appendVNodeDOM(nextChildren, nextContainer);
    }
  }
  function patchElement(lastVNode, nextVNode, context, isSVG, lifecycle, animations) {
    const dom = nextVNode.dom = lastVNode.dom;
    let lastChildren = lastVNode.children;
    let lastChildFlags = lastVNode.childFlags;
    const lastProps = lastVNode.props;
    const nextProps = nextVNode.props;
    const nextFlags = nextVNode.flags;
    let isFormElement = false;
    let hasControlledValue = false;
    let nextPropsOrEmpty;
    isSVG = isSVG || (nextFlags & 32 /* VNodeFlags.SvgElement */) > 0;
    // inlined patchProps  -- starts --
    if (lastProps !== nextProps) {
      const lastPropsOrEmpty = lastProps || EMPTY_OBJ;
      nextPropsOrEmpty = nextProps || EMPTY_OBJ;
      if (nextPropsOrEmpty !== EMPTY_OBJ) {
        isFormElement = (nextFlags & 448 /* VNodeFlags.FormElement */) > 0;
        if (isFormElement) {
          hasControlledValue = isControlledFormElement(nextPropsOrEmpty);
        }
        for (const prop in nextPropsOrEmpty) {
          const lastValue = lastPropsOrEmpty[prop];
          const nextValue = nextPropsOrEmpty[prop];
          if (lastValue !== nextValue) {
            if (patchProp(prop, lastValue, nextValue, dom, isSVG, hasControlledValue, lastVNode)) {
              // Keep the reusable vNode intact after innerHTML unmounts its children.
              lastChildren = null;
              lastChildFlags = 1 /* ChildFlags.HasInvalidChildren */;
            }
          }
        }
      }
      if (lastPropsOrEmpty !== EMPTY_OBJ) {
        for (const prop in lastPropsOrEmpty) {
          if (isNullOrUndef(nextPropsOrEmpty[prop]) && !isNullOrUndef(lastPropsOrEmpty[prop])) {
            if (patchProp(prop, lastPropsOrEmpty[prop], null, dom, isSVG, hasControlledValue, lastVNode)) {
              lastChildren = null;
              lastChildFlags = 1 /* ChildFlags.HasInvalidChildren */;
            }
          }
        }
      }
    }
    let nextChildren = nextVNode.children;
    const nextClassName = nextVNode.className;
    // inlined patchProps  -- ends --
    if (lastVNode.className !== nextClassName) {
      if (isNullOrUndef(nextClassName)) {
        dom.removeAttribute('class');
      } else if (isSVG) {
        dom.setAttribute('class', nextClassName);
      } else {
        dom.className = nextClassName;
      }
    }
    if (nextFlags & 4096 /* VNodeFlags.ContentEditable */) {
      patchContentEditableChildren(dom, nextChildren);
    } else {
      if (nextVNode.childFlags === 2 /* ChildFlags.HasVNodeChildren */ && mustCloneVNode(nextChildren, lastChildren)) {
        nextChildren = nextVNode.children = directClone(nextChildren);
      }
      patchChildren(lastChildFlags, nextVNode.childFlags, lastChildren, nextChildren, dom, context, isSVG && nextVNode.type !== 'foreignObject', null, lastVNode, lifecycle, animations);
    }
    if (isFormElement) {
      processElement(nextFlags, nextVNode, dom, nextPropsOrEmpty, false, hasControlledValue);
    }
    const nextRef = nextVNode.ref;
    const lastRef = lastVNode.ref;
    if (lastRef !== nextRef) {
      unmountRef(lastRef);
      mountRef(nextRef, dom, lifecycle);
    }
  }
  function replaceOneVNodeWithMultipleVNodes(lastChildren, nextChildren, parentDOM, context, isSVG, lifecycle, animations) {
    unmount(lastChildren, animations);
    mountArrayChildren(nextChildren, parentDOM, context, isSVG, findDOMFromVNode(lastChildren, true), lifecycle, animations);
    removeVNodeDOM(lastChildren, parentDOM, animations);
  }
  function commonChildrenSwitch(lastChildren, nextChildren, parentDOM, context, isSVG, nextNode, lifecycle, animations, parentVNode, nextChildFlags, lastChildFlags) {
    const lastLength = lastChildren.length | 0;
    const nextLength = nextChildren.length | 0;
    // Fast path's for both algorithms
    if (lastLength === 0) {
      if (nextLength > 0) {
        mountArrayChildren(nextChildren, parentDOM, context, isSVG, nextNode, lifecycle, animations);
      }
    } else if (nextLength === 0) {
      removeAllChildren(parentDOM, parentVNode, lastChildren, animations);
    } else if (nextChildFlags === 8 /* ChildFlags.HasKeyedChildren */ && lastChildFlags === 8 /* ChildFlags.HasKeyedChildren */) {
      patchKeyedChildren(lastChildren, nextChildren, parentDOM, context, isSVG, lastLength, nextLength, nextNode, parentVNode, lifecycle, animations);
    } else {
      patchNonKeyedChildren(lastChildren, nextChildren, parentDOM, context, isSVG, lastLength, nextLength, nextNode, lifecycle, animations);
    }
  }
  function patchChildren(lastChildFlags, nextChildFlags, lastChildren, nextChildren, parentDOM, context, isSVG, nextNode, parentVNode, lifecycle, animations) {
    switch (lastChildFlags) {
      case 2 /* ChildFlags.HasVNodeChildren */:
        switch (nextChildFlags) {
          case 2 /* ChildFlags.HasVNodeChildren */:
            patch$1(lastChildren, nextChildren, parentDOM, context, isSVG, nextNode, lifecycle, animations);
            break;
          case 1 /* ChildFlags.HasInvalidChildren */:
            remove(lastChildren, parentDOM, animations);
            break;
          case 16 /* ChildFlags.HasTextChildren */:
            unmount(lastChildren, NO_ANIMATIONS);
            setTextContent(parentDOM, nextChildren);
            break;
          default:
            replaceOneVNodeWithMultipleVNodes(lastChildren, nextChildren, parentDOM, context, isSVG, lifecycle, animations);
            break;
        }
        break;
      case 1 /* ChildFlags.HasInvalidChildren */:
        switch (nextChildFlags) {
          case 2 /* ChildFlags.HasVNodeChildren */:
            mount(nextChildren, parentDOM, context, isSVG, nextNode, lifecycle, animations);
            break;
          case 1 /* ChildFlags.HasInvalidChildren */:
            break;
          case 16 /* ChildFlags.HasTextChildren */:
            setTextContent(parentDOM, nextChildren);
            break;
          default:
            mountArrayChildren(nextChildren, parentDOM, context, isSVG, nextNode, lifecycle, animations);
            break;
        }
        break;
      case 16 /* ChildFlags.HasTextChildren */:
        switch (nextChildFlags) {
          case 16 /* ChildFlags.HasTextChildren */:
            patchSingleTextChild(lastChildren, nextChildren, parentDOM);
            break;
          case 2 /* ChildFlags.HasVNodeChildren */:
            setTextContent(parentDOM, '');
            mount(nextChildren, parentDOM, context, isSVG, nextNode, lifecycle, animations);
            break;
          case 1 /* ChildFlags.HasInvalidChildren */:
            setTextContent(parentDOM, '');
            break;
          default:
            setTextContent(parentDOM, '');
            mountArrayChildren(nextChildren, parentDOM, context, isSVG, nextNode, lifecycle, animations);
            break;
        }
        break;
      default:
        switch (nextChildFlags) {
          case 16 /* ChildFlags.HasTextChildren */:
            unmountAllChildren(lastChildren, NO_ANIMATIONS);
            setTextContent(parentDOM, nextChildren);
            break;
          case 2 /* ChildFlags.HasVNodeChildren */:
            removeAllChildren(parentDOM, parentVNode, lastChildren, animations);
            mount(nextChildren, parentDOM, context, isSVG, nextNode, lifecycle, animations);
            break;
          case 1 /* ChildFlags.HasInvalidChildren */:
            removeAllChildren(parentDOM, parentVNode, lastChildren, animations);
            break;
          default:
            commonChildrenSwitch(lastChildren, nextChildren, parentDOM, context, isSVG, nextNode, lifecycle, animations, parentVNode, nextChildFlags, lastChildFlags);
            break;
        }
        break;
    }
  }
  function createDidUpdate(instance, lastProps, lastState, snapshot, lifecycle) {
    lifecycle.push(() => {
      instance.componentDidUpdate(lastProps, lastState, snapshot);
    });
  }
  function updateClassComponent(instance, nextState, nextProps, parentDOM, context, isSVG, force, nextNode, lifecycle, animations) {
    const lastState = instance.state;
    const lastProps = instance.props;
    const usesNewAPI = Boolean(instance.$N);
    const hasSCU = isFunction$1(instance.shouldComponentUpdate);
    if (usesNewAPI) {
      nextState = createDerivedState(instance, nextProps, nextState !== lastState ? {
        ...lastState,
        ...nextState
      } : nextState);
    }
    if (force || !hasSCU || hasSCU && instance.shouldComponentUpdate(nextProps, nextState, context)) {
      if (!usesNewAPI && isFunction$1(instance.componentWillUpdate)) {
        instance.componentWillUpdate(nextProps, nextState, context);
      }
      instance.props = nextProps;
      instance.state = nextState;
      instance.context = context;
      let snapshot = null;
      const nextInput = renderNewInput(instance, nextProps, context, instance.$LI);
      if (usesNewAPI && isFunction$1(instance.getSnapshotBeforeUpdate)) {
        snapshot = instance.getSnapshotBeforeUpdate(lastProps, lastState);
      }
      patch$1(instance.$LI, nextInput, parentDOM, instance.$CX, isSVG, nextNode, lifecycle, animations);
      // Don't update Last input, until patch has been successfully executed
      instance.$LI = nextInput;
      if (isFunction$1(instance.componentDidUpdate)) {
        createDidUpdate(instance, lastProps, lastState, snapshot, lifecycle);
      }
    } else {
      instance.props = nextProps;
      instance.state = nextState;
      instance.context = context;
    }
  }
  function patchClassComponent(lastVNode, nextVNode, parentDOM, context, isSVG, nextNode, lifecycle, animations) {
    const instance = nextVNode.children = lastVNode.children;
    // If Component has crashed, ignore it to stay functional
    if (isNull(instance)) {
      return;
    }
    instance.$L = lifecycle;
    const nextProps = nextVNode.props || EMPTY_OBJ;
    const nextRef = nextVNode.ref;
    const lastRef = lastVNode.ref;
    let nextState = instance.state;
    if (!instance.$N) {
      if (isFunction$1(instance.componentWillReceiveProps)) {
        instance.$BR = true;
        instance.componentWillReceiveProps(nextProps, context);
        // If instance component was removed during its own update do nothing.
        if (instance.$UN) {
          return;
        }
        instance.$BR = false;
      }
      if (!isNull(instance.$PS)) {
        nextState = {
          ...nextState,
          ...instance.$PS
        };
        instance.$PS = null;
      }
    }
    updateClassComponent(instance, nextState, nextProps, parentDOM, context, isSVG, false, nextNode, lifecycle, animations);
    if (lastRef !== nextRef) {
      unmountRef(lastRef);
      mountRef(nextRef, instance, lifecycle);
    }
  }
  function patchFunctionalComponent(lastVNode, nextVNode, parentDOM, context, isSVG, nextNode, lifecycle, animations) {
    const nextProps = nextVNode.props || EMPTY_OBJ;
    const nextRef = nextVNode.ref;
    const lastProps = lastVNode.props;
    const nextHooksDefined = !isNullOrUndef(nextRef);
    const lastInput = lastVNode.children;
    if (nextHooksDefined) {
      if (typeof nextRef.onComponentShouldUpdate === 'function' && !nextRef.onComponentShouldUpdate(lastProps, nextProps)) {
        nextVNode.children = lastInput;
        return;
      }
      if (typeof nextRef.onComponentWillUpdate === 'function') {
        nextRef.onComponentWillUpdate(lastProps, nextProps);
      }
    }
    const nextInput = normalizeRoot(renderFunctionalComponent(nextVNode, context), lastInput);
    patch$1(lastInput, nextInput, parentDOM, context, isSVG, nextNode, lifecycle, animations);
    nextVNode.children = nextInput;
    if (nextHooksDefined && typeof nextRef.onComponentDidUpdate === 'function') {
      nextRef.onComponentDidUpdate(lastProps, nextProps);
    }
  }
  function patchText(lastVNode, nextVNode) {
    const nextText = nextVNode.children;
    const dom = nextVNode.dom = lastVNode.dom;
    if (nextText !== lastVNode.children) {
      dom.nodeValue = nextText;
    }
  }
  // Patching does not change last children, so that vNodes can be rendered again.
  // When patching throws, last children are updated to vNodes that were patched already, so the next render continues from the current DOM.
  function syncLastChildren(lastChildren, nextChildren, start, end) {
    const lastLength = lastChildren.length;
    const nextLength = nextChildren.length;
    for (let i = 0; i < start; ++i) {
      lastChildren[i] = nextChildren[i];
    }
    for (let i = 1; i <= end; ++i) {
      lastChildren[lastLength - i] = nextChildren[nextLength - i];
    }
  }
  function patchNonKeyedChildren(lastChildren, nextChildren, dom, context, isSVG, lastChildrenLength, nextChildrenLength, nextNode, lifecycle, animations) {
    const commonLength = lastChildrenLength > nextChildrenLength ? nextChildrenLength : lastChildrenLength;
    let i = 0;
    let nextChild;
    let lastChild;
    try {
      for (; i < commonLength; ++i) {
        nextChild = nextChildren[i];
        lastChild = lastChildren[i];
        if (mustCloneVNode(nextChild, lastChild)) {
          nextChild = nextChildren[i] = directClone(nextChild);
        }
        patch$1(lastChild, nextChild, dom, context, isSVG, nextNode, lifecycle, animations);
      }
      if (lastChildrenLength < nextChildrenLength) {
        for (i = commonLength; i < nextChildrenLength; ++i) {
          nextChild = nextChildren[i];
          if (mustCloneVNode(nextChild, null)) {
            nextChild = nextChildren[i] = directClone(nextChild);
          }
          mount(nextChild, dom, context, isSVG, nextNode, lifecycle, animations);
        }
      } else if (lastChildrenLength > nextChildrenLength) {
        for (i = commonLength; i < lastChildrenLength; ++i) {
          remove(lastChildren[i], dom, animations);
        }
      }
    } catch (e) {
      syncLastChildren(lastChildren, nextChildren, i < commonLength ? i : commonLength, 0);
      throw e;
    }
  }
  function patchKeyedChildren(a, b, dom, context, isSVG, aLength, bLength, outerEdge, parentVNode, lifecycle, animations) {
    let aEnd = aLength - 1;
    let bEnd = bLength - 1;
    let j = 0;
    let aNode = a[j];
    let bNode = b[j];
    let nextPos;
    let nextNode;
    // Count of vNodes patched at the beginning and at the end
    let synced = 0;
    let syncedEnd = 0;
    try {
      // Step 1
      outer: {
        // Sync nodes with the same key at the beginning.
        while (aNode.key === bNode.key) {
          if (mustCloneVNode(bNode, aNode)) {
            b[j] = bNode = directClone(bNode);
          }
          patch$1(aNode, bNode, dom, context, isSVG, outerEdge, lifecycle, animations);
          synced = ++j;
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
          if (mustCloneVNode(bNode, aNode)) {
            b[bEnd] = bNode = directClone(bNode);
          }
          patch$1(aNode, bNode, dom, context, isSVG, outerEdge, lifecycle, animations);
          syncedEnd++;
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
          nextNode = nextPos < bLength ? findDOMFromVNode(b[nextPos], true) : outerEdge;
          while (j <= bEnd) {
            bNode = b[j];
            if (mustCloneVNode(bNode, null)) {
              b[j] = bNode = directClone(bNode);
            }
            ++j;
            mount(bNode, dom, context, isSVG, nextNode, lifecycle, animations);
          }
        }
      } else if (j > bEnd) {
        while (j <= aEnd) {
          remove(a[j++], dom, animations);
        }
      } else {
        patchKeyedChildrenComplex(a, b, context, aLength, bLength, aEnd, bEnd, j, dom, isSVG, outerEdge, parentVNode, lifecycle, animations);
      }
    } catch (e) {
      syncLastChildren(a, b, synced, syncedEnd);
      throw e;
    }
  }
  function patchKeyedChildrenComplex(a, b, context, aLength, bLength, aEnd, bEnd, j, dom, isSVG, outerEdge, parentVNode, lifecycle, animations) {
    let aNode;
    let bNode;
    // eslint-disable-next-line no-useless-assignment
    let nextPos = 0;
    // eslint-disable-next-line no-useless-assignment
    let i = 0;
    let aStart = j;
    const bStart = j;
    const aLeft = aEnd - j + 1;
    const bLeft = bEnd - j + 1;
    const sources = new Int32Array(bLeft + 1);
    // Keep track if it is possible to remove whole DOM using textContent = '';
    let canRemoveWholeContent = aLeft === aLength;
    let moved = false;
    let pos = 0;
    let patched = 0;
    try {
      // When sizes are small, just loop them through
      if (bLength < 4 || (aLeft | bLeft) < 32) {
        for (i = aStart; i <= aEnd; ++i) {
          aNode = a[i];
          if (patched < bLeft) {
            for (j = bStart; j <= bEnd; j++) {
              bNode = b[j];
              if (aNode.key === bNode.key) {
                if (canRemoveWholeContent) {
                  canRemoveWholeContent = false;
                  while (aStart < i) {
                    remove(a[aStart++], dom, animations);
                  }
                }
                if (pos > j) {
                  moved = true;
                } else {
                  pos = j;
                }
                if (mustCloneVNode(bNode, aNode)) {
                  b[j] = bNode = directClone(bNode);
                }
                patch$1(aNode, bNode, dom, context, isSVG, outerEdge, lifecycle, animations);
                sources[j - bStart] = i + 1;
                ++patched;
                break;
              }
            }
            if (!canRemoveWholeContent && j > bEnd) {
              remove(aNode, dom, animations);
            }
          } else if (!canRemoveWholeContent) {
            remove(aNode, dom, animations);
          }
        }
      } else {
        const keyIndex = {};
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
                  remove(a[aStart++], dom, animations);
                }
              }
              if (pos > j) {
                moved = true;
              } else {
                pos = j;
              }
              bNode = b[j];
              if (mustCloneVNode(bNode, aNode)) {
                b[j] = bNode = directClone(bNode);
              }
              patch$1(aNode, bNode, dom, context, isSVG, outerEdge, lifecycle, animations);
              sources[j - bStart] = i + 1;
              ++patched;
            } else if (!canRemoveWholeContent) {
              remove(aNode, dom, animations);
            }
          } else if (!canRemoveWholeContent) {
            remove(aNode, dom, animations);
          }
        }
      }
      // fast-path: if nothing patched remove all old and add all new
      if (canRemoveWholeContent) {
        removeAllChildren(dom, parentVNode, a, animations);
        mountArrayChildren(b, dom, context, isSVG, outerEdge, lifecycle, animations);
      } else if (moved) {
        const seq = lisAlgorithm(sources);
        j = seq.length - 1;
        for (i = bLeft - 1; i >= 0; i--) {
          if (sources[i] === 0) {
            pos = i + bStart;
            bNode = b[pos];
            if (mustCloneVNode(bNode, null)) {
              b[pos] = bNode = directClone(bNode);
            }
            nextPos = pos + 1;
            mount(bNode, dom, context, isSVG, nextPos < bLength ? findDOMFromVNode(b[nextPos], true) : outerEdge, lifecycle, animations);
          } else if (j < 0 || i !== seq[j]) {
            pos = i + bStart;
            bNode = b[pos];
            nextPos = pos + 1;
            // --- the DOM-node is moved by a call to insertAppend
            moveVNodeDOM(bNode, dom, nextPos < bLength ? findDOMFromVNode(b[nextPos], true) : outerEdge);
          } else {
            j--;
          }
        }
      } else if (patched !== bLeft) {
        // when patched count doesn't match b length we need to insert those new ones
        // loop backwards so we can use insertBefore
        for (i = bLeft - 1; i >= 0; i--) {
          if (sources[i] === 0) {
            pos = i + bStart;
            bNode = b[pos];
            if (mustCloneVNode(bNode, null)) {
              b[pos] = bNode = directClone(bNode);
            }
            nextPos = pos + 1;
            mount(bNode, dom, context, isSVG, nextPos < bLength ? findDOMFromVNode(b[nextPos], true) : outerEdge, lifecycle, animations);
          }
        }
      }
    } catch (error) {
      for (let k = 0; k < bLeft; k++) {
        if (sources[k] !== 0) a[sources[k] - 1] = b[k + bStart];
      }
      throw error;
    }
  }
  let result;
  let p;
  let maxLen = 0;
  // https://en.wikipedia.org/wiki/Longest_increasing_subsequence
  function lisAlgorithm(arr) {
    // Assigning number here tells JIT that these variables are numbers
    /* eslint-disable no-useless-assignment */
    let arrI = 0;
    let i = 0;
    let j = 0;
    let k = 0;
    let u = 0;
    let v = 0;
    let c = 0;
    const len = arr.length;
    /* eslint-enable no-useless-assignment */
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
          c = u + v >> 1;
          if (arr[result[c]] < arrI) {
            u = c + 1;
          } else {
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
    const seq = new Int32Array(u);
    v = result[u - 1];
    while (u-- > 0) {
      seq[u] = v;
      v = p[v];
      result[u] = 0;
    }
    return seq;
  }
  const hasDocumentAvailable = typeof document !== 'undefined';
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
  // noinspection JSUnusedAssignment
  function renderInternal(input, parentDOM, callback, context) {
    const lifecycle = [];
    const animations = new AnimationQueues();
    const rootInput = parentDOM.$V;
    renderCheck.v = true;
    if (isNullOrUndef(rootInput)) {
      if (!isNullOrUndef(input)) {
        if (mustCloneVNode(input, null)) {
          input = directClone(input);
        }
        mount(input, parentDOM, context, false, null, lifecycle, animations);
        parentDOM.$V = input;
      }
    } else {
      if (isNullOrUndef(input)) {
        remove(rootInput, parentDOM, animations);
        parentDOM.$V = null;
      } else {
        if (mustCloneVNode(input, rootInput)) {
          input = directClone(input);
        }
        patch$1(rootInput, input, parentDOM, context, false, null, lifecycle, animations);
        parentDOM.$V = input;
      }
    }
    callAll(lifecycle);
    callAllAnimationHooks(animations.componentDidAppear);
    renderCheck.v = false;
    if (isFunction$1(callback)) {
      callback();
    }
  }
  function render(input, parentDOM, callback = null, context = EMPTY_OBJ) {
    renderInternal(input, parentDOM, callback, context);
  }
  const COMPONENTS_QUEUE = [];
  const nextTick = Promise.resolve().then.bind(Promise.resolve());
  let microTaskPending = false;
  function queueStateChanges(component, newState, callback, force) {
    const pending = component.$PS;
    if (isFunction$1(newState)) {
      newState = newState(pending ? {
        ...component.state,
        ...pending
      } : component.state, component.props, component.context);
    }
    if (isNullOrUndef(pending)) {
      component.$PS = newState;
    } else {
      for (const stateKey in newState) {
        pending[stateKey] = newState[stateKey];
      }
    }
    if (!component.$BR) {
      if (!renderCheck.v) {
        if (COMPONENTS_QUEUE.length === 0) {
          applyState(component, force);
          if (isFunction$1(callback)) {
            callback.call(component);
          }
          return;
        }
      }
      if (!COMPONENTS_QUEUE.includes(component)) {
        COMPONENTS_QUEUE.push(component);
      }
      if (force) {
        component.$F = true;
      }
      if (!microTaskPending) {
        microTaskPending = true;
        nextTick(rerender);
      }
      if (isFunction$1(callback)) {
        let QU = component.$QU;
        if (!QU) {
          QU = component.$QU = [];
        }
        QU.push(callback);
      }
    } else if (isFunction$1(callback)) {
      component.$L.push(callback.bind(component));
    }
  }
  function callSetStateCallbacks(component) {
    const queue = component.$QU;
    for (let i = 0; i < queue.length; ++i) {
      queue[i].call(component);
    }
    component.$QU = null;
  }
  function rerender() {
    let component;
    microTaskPending = false;
    while (component = COMPONENTS_QUEUE.shift()) {
      if (!component.$UN) {
        const force = component.$F;
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
      const pendingState = component.$PS;
      component.$PS = null;
      const lifecycle = [];
      const animations = new AnimationQueues();
      renderCheck.v = true;
      updateClassComponent(component, {
        ...component.state,
        ...pendingState
      }, component.props, findDOMFromVNode(component.$LI, true).parentNode, component.context, component.$SVG, force, null, lifecycle, animations);
      callAll(lifecycle);
      callAllAnimationHooks(animations.componentDidAppear);
      renderCheck.v = false;
    } else {
      component.state = component.$PS;
      component.$PS = null;
    }
  }
  class Component {
    // Force update flag
    constructor(props, context) {
      // Public
      this.state = null;
      this.props = void 0;
      this.context = void 0;
      this.displayName = void 0;
      // Internal properties
      this.$BR = false;
      // BLOCK RENDER
      this.$BS = true;
      // BLOCK STATE
      this.$PS = null;
      // PENDING STATE (PARTIAL or FULL)
      this.$LI = null;
      // LAST INPUT
      this.$UN = false;
      // UNMOUNTED
      this.$CX = null;
      // CHILDCONTEXT
      this.$QU = null;
      // QUEUE
      this.$N = false;
      // Uses new lifecycle API Flag
      this.$SSR = void 0;
      // Server side rendering flag, true when rendering on server, non existent on client
      this.$L = null;
      // Current lifecycle of this component
      this.$SVG = false;
      // Flag to keep track if component is inside SVG tree
      this.$F = false;
      this.props = props || EMPTY_OBJ;
      this.context = context || EMPTY_OBJ; // context should not be mutable
    }
    forceUpdate(callback) {
      if (this.$UN) {
        return;
      }
      // Do not allow double render during force update
      queueStateChanges(this, {}, callback, true);
    }
    setState(newState, callback) {
      if (this.$UN) {
        return;
      }
      if (!this.$BS) {
        queueStateChanges(this, newState, callback, false);
      }
    }
    /* eslint-disable */
    // @ts-ignore
    render(props, state, context) {
      return null;
    }
  }
  Component.defaultProps = null;

  const __MOBX_DEV__ = "production" !== "production";
  function die(error, ...args) {
    throw new Error(`[MobX] minified error nr: ${error}${args.length ? " " + args.map(String).join(",") : ""}. See mobx.js.org/errors`);
  }

  // We shorten anything used > 5 times
  const assign = Object.assign;
  const getDescriptor = Object.getOwnPropertyDescriptor;
  const defineProperty = Object.defineProperty;
  const objectPrototype = Object.prototype;
  const EMPTY_ARRAY = [];
  Object.freeze(EMPTY_ARRAY);
  const plainObjectString = /*#__PURE__*/Object.toString();
  const noop = () => {};
  function isFunction(fn) {
    return typeof fn === "function";
  }
  function isStringish(value) {
    const t = typeof value;
    switch (t) {
      case "string":
      case "symbol":
      case "number":
        return true;
    }
    return false;
  }
  function isObject(value) {
    return value !== null && typeof value === "object";
  }
  function isPlainObject(value) {
    if (!isObject(value)) {
      return false;
    }
    const proto = Object.getPrototypeOf(value);
    if (proto == null) {
      return true;
    }
    const protoConstructor = hasProp(proto, "constructor") && proto.constructor;
    return typeof protoConstructor === "function" && protoConstructor.toString() === plainObjectString;
  }
  // https://stackoverflow.com/a/37865170
  function isGenerator(obj) {
    const constructor = obj == null ? void 0 : obj.constructor;
    if (!constructor) {
      return false;
    }
    if ("GeneratorFunction" === constructor.name || "GeneratorFunction" === constructor.displayName) {
      return true;
    }
    return false;
  }
  function addHiddenProp(object, propName, value) {
    defineProperty(object, propName, {
      enumerable: false,
      writable: true,
      configurable: true,
      value
    });
  }
  function addHiddenFinalProp(object, propName, value) {
    defineProperty(object, propName, {
      enumerable: false,
      writable: false,
      configurable: true,
      value
    });
  }
  function createInstanceofPredicate(name, theClass) {
    const propName = "isMobX" + name;
    theClass.prototype[propName] = true;
    return function (x) {
      return isObject(x) && x[propName] === true;
    };
  }
  /**
   * Yields true for both native and observable Map, even across different windows.
   */
  function isES6Map(thing) {
    return thing != null && Object.prototype.toString.call(thing) === "[object Map]";
  }
  /**
   * Makes sure a Map is an instance of non-inherited native or observable Map.
   */
  function isPlainES6Map(thing) {
    const mapProto = Object.getPrototypeOf(thing);
    const objectProto = Object.getPrototypeOf(mapProto);
    const nullProto = Object.getPrototypeOf(objectProto);
    return nullProto === null;
  }
  /**
   * Yields true for both native and observable Set, even across different windows.
   */
  function isES6Set(thing) {
    return thing != null && Object.prototype.toString.call(thing) === "[object Set]";
  }
  /**
   * Returns the following: own enumerable keys and symbols.
   */
  function getPlainObjectKeys(object) {
    const keys = Object.keys(object);
    const symbols = Object.getOwnPropertySymbols(object);
    if (!symbols.length) {
      return keys;
    }
    return [...keys, ...symbols.filter(s => objectPrototype.propertyIsEnumerable.call(object, s))];
  }
  // From Immer utils
  // Returns all own keys, including non-enumerable and symbolic
  const ownKeys = Reflect.ownKeys;
  function toPrimitive(value) {
    return value === null ? null : typeof value === "object" ? "" + value : value;
  }
  function hasProp(target, prop) {
    return objectPrototype.hasOwnProperty.call(target, prop);
  }
  const getOwnPropertyDescriptors = Object.getOwnPropertyDescriptors;
  function getFlag(flags, mask) {
    return !!(flags & mask);
  }
  function setFlag(flags, mask, newValue) {
    if (newValue) {
      flags |= mask;
    } else {
      flags &= ~mask;
    }
    return flags;
  }

  const $mobx = /*#__PURE__*/Symbol("mobx administration");
  class Atom {
    /**
     * Create a new atom. For debugging purposes it is recommended to give it a name.
     * The onBecomeObserved and onBecomeUnobserved callbacks can be used for resource management.
     */
    constructor(name_ = "Atom") {
      this.name_ = void 0;
      this.flags_ = 0b000;
      // Allocated lazily on first observer to save memory.
      this.observers_ = null;
      this.lastAccessedBy_ = 0;
      this.lowestObserverState_ = -1 /* IDerivationState_.NOT_TRACKING_ */;
      // onBecomeObservedListeners
      this.onBOL = void 0;
      // onBecomeUnobservedListeners
      this.onBUOL = void 0;
      this.name_ = name_;
    }
    // for effective unobserving. BaseAtom has true, for extra optimization, so its onBecomeUnobserved never gets called, because it's not needed
    get isBeingObserved() {
      return getFlag(this.flags_, 1 /* AtomFlags.isBeingObserved */);
    }
    set isBeingObserved(newValue) {
      this.flags_ = setFlag(this.flags_, 1 /* AtomFlags.isBeingObserved */, newValue);
    }
    get isPendingUnobservation() {
      return getFlag(this.flags_, 2 /* AtomFlags.isPendingUnobservation */);
    }
    set isPendingUnobservation(newValue) {
      this.flags_ = setFlag(this.flags_, 2 /* AtomFlags.isPendingUnobservation */, newValue);
    }
    get diffValue() {
      return getFlag(this.flags_, 4 /* AtomFlags.diffValue */) ? 1 : 0;
    }
    set diffValue(newValue) {
      this.flags_ = setFlag(this.flags_, 4 /* AtomFlags.diffValue */, newValue === 1 ? true : false);
    }
    onBO() {
      if (this.onBOL) {
        this.onBOL.forEach(listener => listener());
      }
    }
    onBUO() {
      if (this.onBUOL) {
        this.onBUOL.forEach(listener => listener());
      }
    }
    /**
     * Invoke this method to notify mobx that your atom has been used somehow.
     * Returns true if there is currently a reactive context.
     */
    reportObserved() {
      return reportObserved(this);
    }
    /**
     * Invoke this method _after_ this method has changed to signal mobx that all its observers should invalidate.
     */
    reportChanged() {
      startBatch();
      propagateChanged(this);
      endBatch();
    }
    toString() {
      return this.name_;
    }
  }
  const isAtom = /*#__PURE__*/createInstanceofPredicate("Atom", Atom);
  function createAtom(name, onBecomeObservedHandler = noop, onBecomeUnobservedHandler = noop) {
    const atom = new Atom(name);
    // default `noop` listener will not initialize the hook Set
    if (onBecomeObservedHandler !== noop) {
      atom.onBOL = new Set([onBecomeObservedHandler]);
    }
    if (onBecomeUnobservedHandler !== noop) {
      atom.onBUOL = new Set([onBecomeUnobservedHandler]);
    }
    return atom;
  }
  const compareDefault = Object.is;

  function deepEnhancer(v, _, name) {
    // primitives can never be made observable; skip the type checks below
    if (v === null || typeof v !== "object" && typeof v !== "function") {
      return v;
    }
    // it is an observable already, done
    if (isObservable(v)) {
      return v;
    }
    // something that can be converted and mutated?
    if (Array.isArray(v)) {
      return observable.array(v, {
        name
      });
    }
    if (isPlainObject(v)) {
      return observable.object(v, undefined, {
        name
      });
    }
    if (isES6Map(v)) {
      return observable.map(v, {
        name
      });
    }
    if (isES6Set(v)) {
      return observable.set(v, {
        name
      });
    }
    if (typeof v === "function" && !isAction(v) && !isFlow(v)) {
      if (isGenerator(v)) {
        return flow(v);
      } else {
        return autoAction(name, v);
      }
    }
    return v;
  }
  function referenceEnhancer(newValue) {
    // never turn into an observable
    return newValue;
  }

  function createActionAnnotation(name, options) {
    return {
      annotationType_: name,
      options_: options,
      make_: make_$5,
      extend_: extend_$4
    };
  }
  function make_$5(adm, key, descriptor, source) {
    var _this$options_;
    // bound
    if ((_this$options_ = this.options_) != null && _this$options_.bound) {
      return this.extend_(adm, key, descriptor, false) === null ? 0 /* MakeResult.Cancel */ : 1 /* MakeResult.Break */;
    }
    // own
    if (source === adm.target_) {
      return this.extend_(adm, key, descriptor, false) === null ? 0 /* MakeResult.Cancel */ : 2 /* MakeResult.Continue */;
    }
    // prototype
    if (isAction(descriptor.value)) {
      // A prototype could have been annotated already by other constructor,
      // rest of the proto chain must be annotated already
      return 1 /* MakeResult.Break */;
    }
    const actionDescriptor = createActionDescriptor(adm, this, key, descriptor, false);
    defineProperty(source, key, actionDescriptor);
    return 2 /* MakeResult.Continue */;
  }
  function extend_$4(adm, key, descriptor, proxyTrap) {
    const actionDescriptor = createActionDescriptor(adm, this, key, descriptor);
    return adm.defineProperty_(key, actionDescriptor, proxyTrap);
  }
  function decorateAction20223_(annotation, mthd, context) {
    const {
      kind,
      name,
      addInitializer
    } = context;
    const ann = annotation;
    const _createAction = m => {
      var _ann$options_$name, _ann$options_, _ann$options_$autoAct, _ann$options_2;
      return createAction((_ann$options_$name = (_ann$options_ = ann.options_) == null ? void 0 : _ann$options_.name) != null ? _ann$options_$name : name.toString(), m, (_ann$options_$autoAct = (_ann$options_2 = ann.options_) == null ? void 0 : _ann$options_2.autoAction) != null ? _ann$options_$autoAct : false);
    };
    if (kind == "field") {
      return function (initMthd) {
        var _ann$options_3;
        let mthd = initMthd;
        if (!isAction(mthd)) {
          mthd = _createAction(mthd);
        }
        if ((_ann$options_3 = ann.options_) != null && _ann$options_3.bound) {
          mthd = mthd.bind(this);
          mthd.isMobxAction = true;
        }
        return mthd;
      };
    }
    if (kind == "method") {
      var _ann$options_4;
      if (!isAction(mthd)) {
        mthd = _createAction(mthd);
      }
      if ((_ann$options_4 = ann.options_) != null && _ann$options_4.bound) {
        addInitializer(function () {
          const self = this;
          const bound = self[name].bind(self);
          bound.isMobxAction = true;
          self[name] = bound;
        });
      }
      return mthd;
    }
    die(43, ann.annotationType_, String(name), kind);
  }
  function assertActionDescriptor(adm, {
    annotationType_
  }, key, {
    value
  }) {
  }
  function createActionDescriptor(adm, annotation, key, descriptor,
  // provides ability to disable safeDescriptors for prototypes
  safeDescriptors = globalState.safeDescriptors) {
    var _annotation$options_, _annotation$options_$, _annotation$options_2, _annotation$options_$2, _annotation$options_3, _annotation$options_4, _adm$proxy_2;
    assertActionDescriptor(adm, annotation, key, descriptor);
    let {
      value
    } = descriptor;
    if ((_annotation$options_ = annotation.options_) != null && _annotation$options_.bound) {
      var _adm$proxy_;
      value = value.bind((_adm$proxy_ = adm.proxy_) != null ? _adm$proxy_ : adm.target_);
    }
    return {
      value: createAction((_annotation$options_$ = (_annotation$options_2 = annotation.options_) == null ? void 0 : _annotation$options_2.name) != null ? _annotation$options_$ : key.toString(), value, (_annotation$options_$2 = (_annotation$options_3 = annotation.options_) == null ? void 0 : _annotation$options_3.autoAction) != null ? _annotation$options_$2 : false,
      // https://github.com/mobxjs/mobx/discussions/3140
      (_annotation$options_4 = annotation.options_) != null && _annotation$options_4.bound ? (_adm$proxy_2 = adm.proxy_) != null ? _adm$proxy_2 : adm.target_ : undefined),
      // Non-configurable for classes
      // prevents accidental field redefinition in subclass
      configurable: safeDescriptors ? adm.isPlainObject_ : true,
      // https://github.com/mobxjs/mobx/pull/2641#issuecomment-737292058
      enumerable: false,
      // Non-obsevable, therefore non-writable
      // Also prevents rewriting in subclass constructor
      writable: safeDescriptors ? false : true
    };
  }

  function createFlowAnnotation(name, options) {
    return {
      annotationType_: name,
      options_: options,
      make_: make_$4,
      extend_: extend_$3
    };
  }
  function make_$4(adm, key, descriptor, source) {
    var _this$options_;
    // own
    if (source === adm.target_) {
      return this.extend_(adm, key, descriptor, false) === null ? 0 /* MakeResult.Cancel */ : 2 /* MakeResult.Continue */;
    }
    // prototype
    // bound - must annotate protos to support super.flow()
    if ((_this$options_ = this.options_) != null && _this$options_.bound && (!hasProp(adm.target_, key) || !isFlow(adm.target_[key]))) {
      if (this.extend_(adm, key, descriptor, false) === null) {
        return 0 /* MakeResult.Cancel */;
      }
    }
    if (isFlow(descriptor.value)) {
      // A prototype could have been annotated already by other constructor,
      // rest of the proto chain must be annotated already
      return 1 /* MakeResult.Break */;
    }
    const flowDescriptor = createFlowDescriptor(adm, this, key, descriptor, false, false);
    defineProperty(source, key, flowDescriptor);
    return 2 /* MakeResult.Continue */;
  }
  function extend_$3(adm, key, descriptor, proxyTrap) {
    var _this$options_2;
    const flowDescriptor = createFlowDescriptor(adm, this, key, descriptor, (_this$options_2 = this.options_) == null ? void 0 : _this$options_2.bound);
    return adm.defineProperty_(key, flowDescriptor, proxyTrap);
  }
  function decorateFlow20223_(annotation, mthd, context) {
    var _annotation$options_;
    const {
      name,
      addInitializer
    } = context;
    if (!isFlow(mthd)) {
      mthd = flow(mthd);
    }
    if ((_annotation$options_ = annotation.options_) != null && _annotation$options_.bound) {
      addInitializer(function () {
        const self = this;
        const bound = self[name].bind(self);
        bound.isMobXFlow = true;
        self[name] = bound;
      });
    }
    return mthd;
  }
  function assertFlowDescriptor(adm, {
    annotationType_
  }, key, {
    value
  }) {
  }
  function createFlowDescriptor(adm, annotation, key, descriptor, bound,
  // provides ability to disable safeDescriptors for prototypes
  safeDescriptors = globalState.safeDescriptors) {
    assertFlowDescriptor(adm, annotation, key, descriptor);
    let {
      value
    } = descriptor;
    // In case of flow.bound, the descriptor can be from already annotated prototype
    if (!isFlow(value)) {
      value = flow(value);
    }
    if (bound) {
      var _adm$proxy_;
      // We do not keep original function around, so we bind the existing flow
      value = value.bind((_adm$proxy_ = adm.proxy_) != null ? _adm$proxy_ : adm.target_);
      // This is normally set by `flow`, but `bind` returns new function...
      value.isMobXFlow = true;
    }
    return {
      value,
      // Non-configurable for classes
      // prevents accidental field redefinition in subclass
      configurable: safeDescriptors ? adm.isPlainObject_ : true,
      // https://github.com/mobxjs/mobx/pull/2641#issuecomment-737292058
      enumerable: false,
      // Non-obsevable, therefore non-writable
      // Also prevents rewriting in subclass constructor
      writable: safeDescriptors ? false : true
    };
  }

  function createComputedAnnotation(name, options) {
    return {
      annotationType_: name,
      options_: options,
      make_: make_$3,
      extend_: extend_$2
    };
  }
  function make_$3(adm, key, descriptor) {
    return this.extend_(adm, key, descriptor, false) === null ? 0 /* MakeResult.Cancel */ : 1 /* MakeResult.Break */;
  }
  function extend_$2(adm, key, descriptor, proxyTrap) {
    assertComputedDescriptor(adm, this, key, descriptor);
    return adm.defineComputedProperty_(key, assign({}, this.options_, {
      get: descriptor.get,
      set: descriptor.set
    }), proxyTrap);
  }
  function decorateComputed20223_(annotation, get, context) {
    const ann = annotation;
    const {
      name: key,
      addInitializer
    } = context;
    let computedValues;
    // Defer ComputedValue creation until first access — avoids allocating
    // ComputedValues for getters that are never read on a given instance.
    // The factory is materialised by ObservableObjectAdministration on demand.
    function createComputedValue(target, adm) {
      const options = assign({}, ann.options_, {
        get,
        context: target
      });
      options.name || (options.name = `ObservableObject.${key.toString()}`);
      return new ComputedValue(options);
    }
    addInitializer(function () {
      var _adm$lazyComputedKeys;
      const adm = asObservableObject(this)[$mobx];
      const target = this;
      const observable = adm.values_.get(key);
      if (observable instanceof ComputedValue && observable.derivation !== get) {
        adm.values_.delete(key);
      }
      ((_adm$lazyComputedKeys = adm.lazyComputedKeys_) != null ? _adm$lazyComputedKeys : adm.lazyComputedKeys_ = new Map()).set(key, () => createComputedValue(target));
    });
    return function () {
      const adm = this[$mobx];
      const observable = adm.values_.get(key);
      if (observable instanceof ComputedValue && observable.derivation !== get) {
        var _computedValues;
        let computed = (_computedValues = computedValues) == null ? void 0 : _computedValues.get(this);
        if (!computed) {
          var _computedValues2;
          computed = createComputedValue(this);
          ((_computedValues2 = computedValues) != null ? _computedValues2 : computedValues = new WeakMap()).set(this, computed);
        }
        return computed.get();
      }
      return adm.getObservablePropValue_(key);
    };
  }
  function assertComputedDescriptor(adm, {
    annotationType_
  }, key, {
    get
  }) {
  }

  function createObservableAnnotation(name, options) {
    return {
      annotationType_: name,
      options_: options,
      make_: make_$2,
      extend_: extend_$1
    };
  }
  function make_$2(adm, key, descriptor) {
    return this.extend_(adm, key, descriptor, false) === null ? 0 /* MakeResult.Cancel */ : 1 /* MakeResult.Break */;
  }
  function extend_$1(adm, key, descriptor, proxyTrap) {
    var _this$options_$enhanc, _this$options_;
    assertObservableDescriptor(adm, this);
    return adm.defineObservableProperty_(key, descriptor.value, (_this$options_$enhanc = (_this$options_ = this.options_) == null ? void 0 : _this$options_.enhancer_) != null ? _this$options_$enhanc : deepEnhancer, proxyTrap);
  }
  function decorateObservable20223_(annotation, desc, context) {
    const ann = annotation;
    const {
      kind,
      name
    } = context;
    if (kind !== "accessor") {
      return;
    }
    // Defer ObservableValue construction until first access. The factory is
    // materialised by ObservableObjectAdministration on demand, so unused
    // fields on wide classes never pay the per-instance allocation cost.
    function registerLazy(target, value) {
      var _adm$lazyObservableKe;
      const adm = asObservableObject(target)[$mobx];
      ((_adm$lazyObservableKe = adm.lazyObservableKeys_) != null ? _adm$lazyObservableKe : adm.lazyObservableKeys_ = new Map()).set(name, () => {
        var _ann$options_$enhance, _ann$options_;
        return new ObservableValue(value, (_ann$options_$enhance = (_ann$options_ = ann.options_) == null ? void 0 : _ann$options_.enhancer_) != null ? _ann$options_$enhance : deepEnhancer, `ObservableObject.${name.toString()}`, false);
      });
      return adm;
    }
    return {
      get() {
        var _this$$mobx;
        const adm = (_this$$mobx = this[$mobx]) != null ? _this$$mobx : registerLazy(this, desc.get.call(this));
        return adm.getObservablePropValue_(name);
      },
      set(value) {
        var _this$$mobx2;
        const adm = (_this$$mobx2 = this[$mobx]) != null ? _this$$mobx2 : registerLazy(this, value);
        return adm.setObservablePropValue_(name, value);
      },
      init(value) {
        registerLazy(this, value);
        return value;
      }
    };
  }
  function assertObservableDescriptor(adm, {
    annotationType_
  }, key, descriptor) {
  }

  const AUTO = "true";
  const autoAnnotation = /*#__PURE__*/createAutoAnnotation();
  function createAutoAnnotation(options) {
    return {
      annotationType_: AUTO,
      options_: options,
      make_: make_$1,
      extend_
    };
  }
  // The auto annotation only depends on `deep` and `autoBind`, so share one instance per combination
  // instead of allocating one for every object created with options
  const autoAnnotations = [autoAnnotation];
  function getAutoAnnotation(options) {
    var _autoAnnotations$idx;
    const deep = options.deep !== false;
    const autoBind = !!options.autoBind;
    const idx = (deep ? 0 : 1) | (autoBind ? 2 : 0);
    return (_autoAnnotations$idx = autoAnnotations[idx]) != null ? _autoAnnotations$idx : autoAnnotations[idx] = createAutoAnnotation({
      deep,
      autoBind
    });
  }
  function make_$1(adm, key, descriptor, source) {
    var _this$options_3, _this$options_4;
    // getter -> computed
    if (descriptor.get) {
      return computed.make_(adm, key, descriptor, source);
    }
    // lone setter -> action setter
    if (descriptor.set) {
      // TODO make action applicable to setter and delegate to action.make_
      const set = isAction(descriptor.set) ? descriptor.set // See #4553
      : createAction(key.toString(), descriptor.set);
      // own
      if (source === adm.target_) {
        return adm.defineProperty_(key, {
          configurable: globalState.safeDescriptors ? adm.isPlainObject_ : true,
          set
        }) === null ? 0 /* MakeResult.Cancel */ : 2 /* MakeResult.Continue */;
      }
      // proto
      defineProperty(source, key, {
        configurable: true,
        set
      });
      return 2 /* MakeResult.Continue */;
    }
    // function on proto -> autoAction/flow
    if (source !== adm.target_ && typeof descriptor.value === "function") {
      var _this$options_2;
      if (isGenerator(descriptor.value)) {
        var _this$options_;
        const flowAnnotation = (_this$options_ = this.options_) != null && _this$options_.autoBind ? flowBound : flow;
        return flowAnnotation.make_(adm, key, descriptor, source);
      }
      const actionAnnotation = (_this$options_2 = this.options_) != null && _this$options_2.autoBind ? autoActionBound : autoAction;
      return actionAnnotation.make_(adm, key, descriptor, source);
    }
    // other -> observable
    // Copy props from proto as well, see test:
    // "decorate should work with Object.create"
    let observableAnnotation = ((_this$options_3 = this.options_) == null ? void 0 : _this$options_3.deep) === false ? observableRef : observable;
    // if function respect autoBind option
    if (typeof descriptor.value === "function" && (_this$options_4 = this.options_) != null && _this$options_4.autoBind) {
      var _adm$proxy_;
      descriptor.value = descriptor.value.bind((_adm$proxy_ = adm.proxy_) != null ? _adm$proxy_ : adm.target_);
    }
    return observableAnnotation.make_(adm, key, descriptor, source);
  }
  function extend_(adm, key, descriptor, proxyTrap) {
    var _this$options_5, _this$options_6;
    // getter -> computed
    if (descriptor.get) {
      return computed.extend_(adm, key, descriptor, proxyTrap);
    }
    // lone setter -> action setter
    if (descriptor.set) {
      // TODO make action applicable to setter and delegate to action.extend_
      return adm.defineProperty_(key, {
        configurable: globalState.safeDescriptors ? adm.isPlainObject_ : true,
        set: createAction(key.toString(), descriptor.set)
      }, proxyTrap);
    }
    // other -> observable
    // if function respect autoBind option
    if (typeof descriptor.value === "function" && (_this$options_5 = this.options_) != null && _this$options_5.autoBind) {
      var _adm$proxy_2;
      descriptor.value = descriptor.value.bind((_adm$proxy_2 = adm.proxy_) != null ? _adm$proxy_2 : adm.target_);
    }
    let observableAnnotation = ((_this$options_6 = this.options_) == null ? void 0 : _this$options_6.deep) === false ? observableRef : observable;
    return observableAnnotation.extend_(adm, key, descriptor, proxyTrap);
  }

  function createDecoratorAnnotation(annotation, decorate) {
    return assign(function decoratorAnnotation(value, context) {
      if (context && typeof context.kind === "string") {
        return decorate(annotation, value, context);
      }
      return undefined;
    }, annotation);
  }

  const OBSERVABLE = "observable";
  const OBSERVABLE_REF = "observable.ref";
  // Predefined bags of create observable options, to avoid allocating temporarily option objects
  // in the majority of cases
  const defaultCreateObservableOptions = {
    deep: true,
    name: undefined,
    defaultDecorator: undefined
  };
  Object.freeze(defaultCreateObservableOptions);
  function asCreateObservableOptions(thing) {
    return thing || defaultCreateObservableOptions;
  }
  const observableAnnotation = /*#__PURE__*/createObservableAnnotation(OBSERVABLE);
  const observableRefAnnotation = /*#__PURE__*/createObservableAnnotation(OBSERVABLE_REF, {
    enhancer_: referenceEnhancer
  });
  function createObservableDecoratorAnnotation(annotation) {
    return createDecoratorAnnotation(annotation, decorateObservable20223_);
  }
  function getEnhancerFromOptions(options) {
    return options.deep === true ? deepEnhancer : options.deep === false ? referenceEnhancer : getEnhancerFromAnnotation(options.defaultDecorator);
  }
  function getAnnotationFromOptions(options) {
    var _options$defaultDecor;
    return options ? (_options$defaultDecor = options.defaultDecorator) != null ? _options$defaultDecor : getAutoAnnotation(options) : undefined;
  }
  function getEnhancerFromAnnotation(annotation) {
    var _annotation$options_$, _annotation$options_;
    return !annotation ? deepEnhancer : (_annotation$options_$ = (_annotation$options_ = annotation.options_) == null ? void 0 : _annotation$options_.enhancer_) != null ? _annotation$options_$ : deepEnhancer;
  }
  /**
   * Turns an object, array or function into a reactive structure.
   * @param v the value which should become observable.
   */
  function createObservable(v, arg2, arg3) {
    if (arg2 && typeof arg2.kind === "string") {
      return decorateObservable20223_(observableAnnotation, v, arg2);
    }
    // already observable - ignore
    if (isObservable(v)) {
      return v;
    }
    // plain object
    if (isPlainObject(v)) {
      return observable.object(v, arg2, arg3);
    }
    // Array
    if (Array.isArray(v)) {
      return observable.array(v, arg2);
    }
    // Map
    if (isES6Map(v)) {
      return observable.map(v, arg2);
    }
    // Set
    if (isES6Set(v)) {
      return observable.set(v, arg2);
    }
    // other object - ignore
    if (typeof v === "object" && v !== null) {
      return v;
    }
    // anything else
    return observable.box(v, arg2);
  }
  const observableFactories = {
    box(value, options) {
      const o = asCreateObservableOptions(options);
      return new ObservableValue(value, getEnhancerFromOptions(o), o.name, true, o.equals);
    },
    array(initialValues, options) {
      const o = asCreateObservableOptions(options);
      return createObservableArray(initialValues, getEnhancerFromOptions(o), o.name);
    },
    map(initialValues, options) {
      const o = asCreateObservableOptions(options);
      return new ObservableMap(initialValues, getEnhancerFromOptions(o), o.name);
    },
    set(initialValues, options) {
      const o = asCreateObservableOptions(options);
      return new ObservableSet(initialValues, getEnhancerFromOptions(o), o.name);
    },
    object(props, annotations, options) {
      return initObservable(() => extendObservable(asDynamicObservableObject({}, options), props, annotations));
    }
  };
  const observableRef = /*#__PURE__*/createObservableDecoratorAnnotation(observableRefAnnotation);
  // eslint-disable-next-line
  var observable = /*#__PURE__*/assign(createObservable, observableAnnotation, observableFactories);

  const COMPUTED = "computed";
  function createComputedDecoratorAnnotation(annotation) {
    return createDecoratorAnnotation(annotation, decorateComputed20223_);
  }
  const computedAnnotation = /*#__PURE__*/createComputedAnnotation(COMPUTED);
  const computed = function computed(arg1, arg2) {
    if (arg2 && typeof arg2.kind === "string") {
      return decorateComputed20223_(computedAnnotation, arg1, arg2);
    }
    if (isPlainObject(arg1)) {
      // computed annotation with options
      return createComputedDecoratorAnnotation(createComputedAnnotation(COMPUTED, arg1));
    }
    const opts = isPlainObject(arg2) ? arg2 : {};
    opts.get = arg1;
    opts.name || (opts.name = arg1.name || ""); /* for generated name */
    return new ComputedValue(opts);
  };
  assign(computed, computedAnnotation);

  var _getDescriptor$config, _getDescriptor;
  // we don't use globalState for these in order to avoid possible issues with multiple
  // mobx versions
  let currentActionId = 0;
  let nextActionId = 1;
  const isFunctionNameConfigurable = (_getDescriptor$config = (_getDescriptor = /*#__PURE__*/getDescriptor(() => {}, "name")) == null ? void 0 : _getDescriptor.configurable) != null ? _getDescriptor$config : false;
  // we can safely recycle this object
  const tmpNameDescriptor = {
    value: "action",
    configurable: true,
    writable: false,
    enumerable: false
  };
  function createAction(actionName, fn, autoAction = false, ref) {
    function res() {
      return executeAction(actionName, autoAction, fn, ref || this, arguments);
    }
    res.isMobxAction = true;
    res.toString = () => fn.toString();
    if (isFunctionNameConfigurable) {
      tmpNameDescriptor.value = actionName;
      defineProperty(res, "name", tmpNameDescriptor);
    }
    return res;
  }
  function executeAction(actionName, canRunAsDerivation, fn, scope, args) {
    const runInfo = _startAction(actionName, canRunAsDerivation);
    try {
      return fn.apply(scope, args);
    } catch (err) {
      runInfo.error_ = err;
      throw err;
    } finally {
      _endAction(runInfo);
    }
  }
  function _startAction(actionName, canRunAsDerivation,
  // true for autoAction
  scope, args) {
    const notifySpy_ = __MOBX_DEV__;
    let startTime_ = 0;
    const prevDerivation_ = globalState.trackingDerivation;
    const runAsAction = !canRunAsDerivation || !prevDerivation_;
    startBatch();
    let prevAllowStateChanges_ = globalState.allowStateChanges; // by default preserve previous allow
    if (runAsAction) {
      untrackedStart();
    }
    const prevAllowStateReads_ = globalState.allowStateReads;
    const runInfo = {
      runAsAction_: runAsAction,
      prevDerivation_,
      prevAllowStateChanges_,
      prevAllowStateReads_,
      notifySpy_,
      startTime_,
      actionId_: nextActionId++,
      parentActionId_: currentActionId
    };
    currentActionId = runInfo.actionId_;
    return runInfo;
  }
  function _endAction(runInfo) {
    if (currentActionId !== runInfo.actionId_) {
      die(30);
    }
    currentActionId = runInfo.parentActionId_;
    if (runInfo.error_ !== undefined) {
      globalState.suppressReactionErrors = true;
    }
    endBatch();
    if (runInfo.runAsAction_) {
      untrackedEnd(runInfo.prevDerivation_);
    }
    globalState.suppressReactionErrors = false;
  }
  function allowStateChanges(allowStateChanges, func) {
    const prev = allowStateChangesStart(allowStateChanges);
    try {
      return func();
    } finally {
      allowStateChangesEnd(prev);
    }
  }
  function allowStateChangesStart(allowStateChanges) {
    const prev = globalState.allowStateChanges;
    globalState.allowStateChanges = allowStateChanges;
    return prev;
  }
  function allowStateChangesEnd(prev) {
    globalState.allowStateChanges = prev;
  }
  class ObservableValue extends Atom {
    constructor(value, enhancer_, name_ = "ObservableValue", notifySpy = true, equals_ = compareDefault) {
      super(name_);
      this.enhancer_ = void 0;
      this.name_ = void 0;
      this.equals_ = void 0;
      this.hasUnreportedChange_ = false;
      this.interceptors_ = void 0;
      this.changeListeners_ = void 0;
      this.value_ = void 0;
      this.dehancer = void 0;
      this.enhancer_ = enhancer_;
      this.name_ = name_;
      this.equals_ = equals_;
      this.value_ = enhancer_(value, undefined, name_);
    }
    dehanceValue(value) {
      if (this.dehancer !== undefined) {
        return this.dehancer(value);
      }
      return value;
    }
    set(newValue) {
      this.value_;
      newValue = this.prepareNewValue_(newValue);
      if (newValue !== globalState.UNCHANGED) {
        this.setNewValue_(newValue);
      }
    }
    prepareNewValue_(newValue) {
      if (hasInterceptors(this)) {
        const change = interceptChange(this, {
          object: this,
          type: UPDATE,
          newValue
        });
        if (!change) {
          return globalState.UNCHANGED;
        }
        newValue = change.newValue;
      }
      // apply modifier
      newValue = this.enhancer_(newValue, this.value_, this.name_);
      return this.equals_(this.value_, newValue) ? globalState.UNCHANGED : newValue;
    }
    setNewValue_(newValue) {
      const oldValue = this.value_;
      this.value_ = newValue;
      this.reportChanged();
      if (hasListeners(this)) {
        notifyListeners(this, {
          type: UPDATE,
          object: this,
          newValue,
          oldValue
        });
      }
    }
    get() {
      this.reportObserved();
      return this.dehanceValue(this.value_);
    }
    raw() {
      // used by MST ot get undehanced value
      return this.value_;
    }
    toJSON() {
      return this.get();
    }
    toString() {
      return `${this.name_}[${this.value_}]`;
    }
    valueOf() {
      return toPrimitive(this.get());
    }
    [Symbol.toPrimitive]() {
      return this.valueOf();
    }
  }

  class ComputedValue {
    /**
     * Create a new computed value based on a function expression.
     *
     * The `name` property is for debug purposes only.
     *
     * The `equals` property specifies the comparer function used to determine if a newly produced
     * value differs from the previous value. Structural comparison can be convenient if you always
     * produce a new aggregated object and don't want to notify observers if it is structurally the same.
     * This is useful for working with vectors, mouse coordinates etc.
     */
    constructor(options) {
      this.dependenciesState_ = -1 /* IDerivationState_.NOT_TRACKING_ */;
      this.observing_ = [];
      // nodes we are looking at. Our value depends on these nodes
      this.newObserving_ = null;
      // during tracking it's an array with new observed observers
      // Lazily allocated on first observer - see Atom.observers_.
      this.observers_ = null;
      this.runId_ = 0;
      this.lastAccessedBy_ = 0;
      this.lowestObserverState_ = 0 /* IDerivationState_.UP_TO_DATE_ */;
      this.unboundDepsCount_ = 0;
      this.value_ = new CaughtException(null);
      this.name_ = void 0;
      this.triggeredBy_ = void 0;
      this.flags_ = 0b00000;
      this.derivation = void 0;
      // N.B: unminified as it is used by MST
      this.setter_ = void 0;
      this.scope_ = void 0;
      this.equals_ = void 0;
      this.requiresReaction_ = void 0;
      this.keepAlive_ = void 0;
      this.onBOL = void 0;
      this.onBUOL = void 0;
      if (!options.get) {
        die(31);
      }
      this.derivation = options.get;
      this.name_ = options.name || ("ComputedValue");
      if (options.set) {
        this.setter_ = createAction("ComputedValue-setter", options.set);
      }
      this.equals_ = options.equals || compareDefault;
      this.scope_ = options.context;
      this.requiresReaction_ = options.requiresReaction;
      this.keepAlive_ = !!options.keepAlive;
    }
    onBecomeStale_() {
      propagateMaybeChanged(this);
    }
    onBO() {
      if (this.onBOL) {
        this.onBOL.forEach(listener => listener());
      }
    }
    onBUO() {
      if (this.onBUOL) {
        this.onBUOL.forEach(listener => listener());
      }
    }
    // to check for cycles
    get isComputing() {
      return getFlag(this.flags_, 1 /* ComputedValueFlags.isComputing */);
    }
    set isComputing(newValue) {
      this.flags_ = setFlag(this.flags_, 1 /* ComputedValueFlags.isComputing */, newValue);
    }
    get isRunningSetter() {
      return getFlag(this.flags_, 2 /* ComputedValueFlags.isRunningSetter */);
    }
    set isRunningSetter(newValue) {
      this.flags_ = setFlag(this.flags_, 2 /* ComputedValueFlags.isRunningSetter */, newValue);
    }
    get isBeingObserved() {
      return getFlag(this.flags_, 4 /* ComputedValueFlags.isBeingObserved */);
    }
    set isBeingObserved(newValue) {
      this.flags_ = setFlag(this.flags_, 4 /* ComputedValueFlags.isBeingObserved */, newValue);
    }
    get isPendingUnobservation() {
      return getFlag(this.flags_, 8 /* ComputedValueFlags.isPendingUnobservation */);
    }
    set isPendingUnobservation(newValue) {
      this.flags_ = setFlag(this.flags_, 8 /* ComputedValueFlags.isPendingUnobservation */, newValue);
    }
    get diffValue() {
      return getFlag(this.flags_, 16 /* ComputedValueFlags.diffValue */) ? 1 : 0;
    }
    set diffValue(newValue) {
      this.flags_ = setFlag(this.flags_, 16 /* ComputedValueFlags.diffValue */, newValue === 1 ? true : false);
    }
    /**
     * Returns the current value of this computed value.
     * Will evaluate its computation first if needed.
     */
    get() {
      if (this.isComputing) {
        die(32, this.name_, this.derivation);
      }
      if (globalState.inBatch === 0 && (
      // !globalState.trackingDerivatpion &&
      !this.observers_ || this.observers_.size === 0) && !this.keepAlive_) {
        if (shouldCompute(this)) {
          this.warnAboutUntrackedRead_();
          startBatch(); // See perf test 'computed memoization'
          this.value_ = this.computeValue_(false);
          endBatch();
        }
      } else {
        const wasBeingObserved = this.isBeingObserved;
        reportObserved(this);
        if (shouldCompute(this)) {
          let prevTrackingContext = globalState.trackingContext;
          if (!prevTrackingContext && (this.keepAlive_ || this.isBeingObserved)) {
            // An observed or keep-alive computed can be recomputed by an untracked
            // read, for example from inside an action. Its dependencies are still
            // transitively observed and must fire their lifecycle hooks
            globalState.trackingContext = this;
          }
          if (this.trackAndCompute()) {
            propagateChangeConfirmed(this);
          }
          globalState.trackingContext = prevTrackingContext;
        } else if (!wasBeingObserved && this.isBeingObserved) {
          // We just became observed while serving a cached value, so the getter
          // won't run and won't re-report our dependencies. Cascade to them. #4547
          this.observing_.forEach(markObserved);
        }
      }
      const result = this.value_;
      if (isCaughtException(result)) {
        throw result.cause;
      }
      return result;
    }
    set(value) {
      if (this.setter_) {
        if (this.isRunningSetter) {
          die(33, this.name_);
        }
        this.isRunningSetter = true;
        try {
          this.setter_.call(this.scope_, value);
        } finally {
          this.isRunningSetter = false;
        }
      } else {
        die(34, this.name_);
      }
    }
    trackAndCompute() {
      // N.B: unminified as it is used by MST
      const oldValue = this.value_;
      const wasSuspended = /* see #1208 */this.dependenciesState_ === -1 /* IDerivationState_.NOT_TRACKING_ */;
      const newValue = this.computeValue_(true);
      const changed = wasSuspended || isCaughtException(oldValue) || isCaughtException(newValue) || !this.equals_(oldValue, newValue);
      if (changed) {
        this.value_ = newValue;
      }
      return changed;
    }
    computeValue_(track) {
      this.isComputing = true;
      let res;
      if (track) {
        res = trackDerivedFunction(this, this.derivation, this.scope_);
      } else {
        if (globalState.disableErrorBoundaries === true) {
          res = this.derivation.call(this.scope_);
        } else {
          try {
            res = this.derivation.call(this.scope_);
          } catch (e) {
            res = new CaughtException(e);
          }
        }
      }
      this.isComputing = false;
      return res;
    }
    suspend_() {
      if (!this.keepAlive_) {
        clearObserving(this);
        this.value_ = undefined; // don't hold on to computed value!
      }
    }
    warnAboutUntrackedRead_() {
      {
        return;
      }
    }
    toString() {
      return `${this.name_}[${this.derivation.toString()}]`;
    }
    valueOf() {
      return toPrimitive(this.get());
    }
    [Symbol.toPrimitive]() {
      return this.valueOf();
    }
  }
  const isComputedValue = /*#__PURE__*/createInstanceofPredicate("ComputedValue", ComputedValue);

  class CaughtException {
    constructor(cause) {
      this.cause = void 0;
      this.cause = cause;
      // Empty
    }
  }
  function isCaughtException(e) {
    return e instanceof CaughtException;
  }
  /**
   * Finds out whether any dependency of the derivation has actually changed.
   * If dependenciesState is 1 then it will recalculate dependencies,
   * if any dependency changed it will propagate it by changing dependenciesState to 2.
   *
   * By iterating over the dependencies in the same order that they were reported and
   * stopping on the first change, all the recalculations are only called for ComputedValues
   * that will be tracked by derivation. That is because we assume that if the first x
   * dependencies of the derivation doesn't change then the derivation should run the same way
   * up until accessing x-th dependency.
   */
  function shouldCompute(derivation) {
    switch (derivation.dependenciesState_) {
      case 0 /* IDerivationState_.UP_TO_DATE_ */:
        return false;
      case -1 /* IDerivationState_.NOT_TRACKING_ */:
      case 2 /* IDerivationState_.STALE_ */:
        return true;
      case 1 /* IDerivationState_.POSSIBLY_STALE_ */:
        {
          const prevUntracked = untrackedStart(); // no need for those computeds to be reported, they will be picked up in trackDerivedFunction.
          const obs = derivation.observing_,
            l = obs.length;
          for (let i = 0; i < l; i++) {
            const obj = obs[i];
            if (isComputedValue(obj)) {
              if (globalState.disableErrorBoundaries) {
                obj.get();
              } else {
                try {
                  obj.get();
                } catch (e) {
                  // we are not interested in the value *or* exception at this moment, but if there is one, notify all
                  untrackedEnd(prevUntracked);
                  return true;
                }
              }
              // if ComputedValue `obj` actually changed it will be computed and propagated to its observers.
              // and `derivation` is an observer of `obj`
              // invariantShouldCompute(derivation)
              if (derivation.dependenciesState_ === 2 /* IDerivationState_.STALE_ */) {
                untrackedEnd(prevUntracked);
                return true;
              }
            }
          }
          changeDependenciesStateTo0(derivation);
          untrackedEnd(prevUntracked);
          return false;
        }
    }
  }
  function checkIfStateModificationsAreAllowed(atom) {
    {
      return;
    }
  }
  /**
   * Executes the provided function `f` and tracks which observables are being accessed.
   * The tracking information is stored on the `derivation` object and the derivation is registered
   * as observer of any of the accessed observables.
   */
  function trackDerivedFunction(derivation, f, context) {
    changeDependenciesStateTo0(derivation);
    // Preallocate array; will be trimmed by bindDependencies.
    derivation.newObserving_ = new Array(
    // Reserve constant space for initial dependencies, dynamic space otherwise.
    // See https://github.com/mobxjs/mobx/pull/3833
    derivation.runId_ === 0 ? 100 : derivation.observing_.length);
    derivation.unboundDepsCount_ = 0;
    derivation.runId_ = ++globalState.runId;
    const prevTracking = globalState.trackingDerivation;
    globalState.trackingDerivation = derivation;
    globalState.inBatch++;
    let result;
    if (globalState.disableErrorBoundaries === true) {
      result = f.call(context);
    } else {
      try {
        result = f.call(context);
      } catch (e) {
        result = new CaughtException(e);
      }
    }
    globalState.inBatch--;
    globalState.trackingDerivation = prevTracking;
    bindDependencies(derivation);
    return result;
  }
  /**
   * diffs newObserving with observing.
   * update observing to be newObserving with unique observables
   * notify observers that become observed/unobserved
   */
  function bindDependencies(derivation) {
    // invariant(derivation.dependenciesState !== IDerivationState.NOT_TRACKING, "INTERNAL ERROR bindDependencies expects derivation.dependenciesState !== -1");
    const prevObserving = derivation.observing_;
    const observing = derivation.observing_ = derivation.newObserving_;
    let lowestNewObservingDerivationState = 0 /* IDerivationState_.UP_TO_DATE_ */;
    // Go through all new observables and check diffValue: (this list can contain duplicates):
    //   0: first occurrence, change to 1 and keep it
    //   1: extra occurrence, drop it
    let i0 = 0,
      l = derivation.unboundDepsCount_;
    for (let i = 0; i < l; i++) {
      const dep = observing[i];
      if (dep.diffValue === 0) {
        dep.diffValue = 1;
        if (i0 !== i) {
          observing[i0] = dep;
        }
        i0++;
      }
      // Upcast is 'safe' here, because if dep is IObservable, `dependenciesState` will be undefined,
      // not hitting the condition
      if (dep.dependenciesState_ > lowestNewObservingDerivationState) {
        lowestNewObservingDerivationState = dep.dependenciesState_;
      }
    }
    observing.length = i0;
    derivation.newObserving_ = null; // newObserving shouldn't be needed outside tracking (statement moved down to work around FF bug, see #614)
    // Go through all old observables and check diffValue: (it is unique after last bindDependencies)
    //   0: it's not in new observables, unobserve it
    //   1: it keeps being observed, don't want to notify it. change to 0
    l = prevObserving.length;
    while (l--) {
      const dep = prevObserving[l];
      if (dep.diffValue === 0) {
        removeObserver(dep, derivation);
      }
      dep.diffValue = 0;
    }
    // Go through all new observables and check diffValue: (now it should be unique)
    //   0: it was set to 0 in last loop. don't need to do anything.
    //   1: it wasn't observed, let's observe it. set back to 0
    while (i0--) {
      const dep = observing[i0];
      if (dep.diffValue === 1) {
        dep.diffValue = 0;
        addObserver(dep, derivation);
      }
    }
    // Some new observed derivations may become stale during this derivation computation
    // so they have had no chance to propagate staleness (#916)
    if (lowestNewObservingDerivationState !== 0 /* IDerivationState_.UP_TO_DATE_ */) {
      derivation.dependenciesState_ = lowestNewObservingDerivationState;
      derivation.onBecomeStale_();
    }
  }
  function clearObserving(derivation) {
    // invariant(globalState.inBatch > 0, "INTERNAL ERROR clearObserving should be called only inside batch");
    const obs = derivation.observing_;
    derivation.observing_ = [];
    let i = obs.length;
    while (i--) {
      removeObserver(obs[i], derivation);
    }
    derivation.dependenciesState_ = -1 /* IDerivationState_.NOT_TRACKING_ */;
  }
  function untracked(action) {
    const prev = untrackedStart();
    try {
      return action();
    } finally {
      untrackedEnd(prev);
    }
  }
  function untrackedStart() {
    const prev = globalState.trackingDerivation;
    globalState.trackingDerivation = null;
    return prev;
  }
  function untrackedEnd(prev) {
    globalState.trackingDerivation = prev;
  }
  /**
   * needed to keep `lowestObserverState` correct. when changing from (2 or 1) to 0
   *
   */
  function changeDependenciesStateTo0(derivation) {
    if (derivation.dependenciesState_ === 0 /* IDerivationState_.UP_TO_DATE_ */) {
      return;
    }
    derivation.dependenciesState_ = 0 /* IDerivationState_.UP_TO_DATE_ */;
    const obs = derivation.observing_;
    let i = obs.length;
    while (i--) {
      obs[i].lowestObserverState_ = 0 /* IDerivationState_.UP_TO_DATE_ */;
    }
  }

  const MOBX_GLOBALS_VERSION = 7;
  class MobXGlobals {
    constructor() {
      /**
       * MobXGlobals version.
       * MobX compatiblity with other versions loaded in memory as long as this version matches.
       * It indicates that the global state still stores similar information
       *
       * N.B: this version is unrelated to the package version of MobX, and is only the version of the
       * internal state storage of MobX, and can be the same across many different package versions
       */
      this.version = MOBX_GLOBALS_VERSION;
      /**
       * globally unique token to signal unchanged
       */
      this.UNCHANGED = {};
      /**
       * Currently running derivation
       */
      this.trackingDerivation = null;
      /**
       * Currently running reaction. This determines if we currently have a reactive context.
       * (Tracking derivation is also set for temporal tracking of computed values inside actions,
       * but trackingReaction can only be set by a form of Reaction)
       */
      this.trackingContext = null;
      /**
       * Each time a derivation is tracked, it is assigned a unique run-id
       */
      this.runId = 0;
      /**
       * 'guid' for general purpose. Will be persisted amongst resets.
       */
      this.mobxGuid = 0;
      /**
       * Are we in a batch block? (and how many of them)
       */
      this.inBatch = 0;
      /**
       * Observables that don't have observers anymore, and are about to be
       * suspended, unless somebody else accesses it in the same batch
       *
       * @type {IObservable[]}
       */
      this.pendingUnobservations = [];
      /**
       * List of scheduled, not yet executed, reactions.
       */
      this.pendingReactions = [];
      /**
       * Are we currently processing reactions?
       */
      this.isRunningReactions = false;
      /**
       * Are we currently draining pendingUnobservations in endBatch?
       * An onBecomeUnobserved handler can dispose a Reaction, which calls
       * startBatch/endBatch again; this guards against re-entering the same
       * drain loop recursively (see endBatch in observable.ts).
       */
      this.isRunningUnobservations = false;
      /**
       * Is it allowed to change observables at this point?
       * In general, MobX doesn't allow that when running computations and React.render.
       * To ensure that those functions stay pure.
       */
      this.allowStateChanges = false;
      /**
       * Is it allowed to read observables at this point?
       * Used to hold the state needed for `observableRequiresReaction`
       */
      this.allowStateReads = true;
      /**
       * If strict mode is enabled, state changes are by default not allowed
       */
      this.enforceActions = true;
      /**
       * Spy callbacks
       */
      this.spyListeners = [];
      /**
       * Globally attached error handlers that react specifically to errors in reactions
       */
      this.globalReactionErrorHandlers = [];
      /**
       * Warn if computed values are accessed outside a reactive context
       */
      this.computedRequiresReaction = false;
      /**
       * (Experimental)
       * Warn if you try to create to derivation / reactive context without accessing any observable.
       */
      this.reactionRequiresObservable = false;
      /**
       * (Experimental)
       * Warn if observables are accessed outside a reactive context
       */
      this.observableRequiresReaction = false;
      /*
       * Don't catch and rethrow exceptions. This is useful for inspecting the state of
       * the stack when an exception occurs while debugging.
       */
      this.disableErrorBoundaries = false;
      /*
       * If true, we are already handling an exception in an action. Any errors in reactions should be suppressed, as
       * they are not the cause, see: https://github.com/mobxjs/mobx/issues/1836
       */
      this.suppressReactionErrors = false;
      /**
       * False forces all object's descriptors to
       * writable: true
       * configurable: true
       */
      this.safeDescriptors = true;
    }
  }
  let canMergeGlobalState = true;
  let globalState = /*#__PURE__*/function () {
    let global = globalThis;
    if (global.__mobxInstanceCount > 0 && !global.__mobxGlobals) {
      canMergeGlobalState = false;
    }
    if (global.__mobxGlobals && global.__mobxGlobals.version !== MOBX_GLOBALS_VERSION) {
      canMergeGlobalState = false;
    }
    if (!canMergeGlobalState) {
      // Because this is a IIFE we need to let isolateCalled a chance to change
      // so we run it after the event loop completed at least 1 iteration
      setTimeout(() => {
        {
          die(35);
        }
      }, 1);
      return new MobXGlobals();
    } else if (global.__mobxGlobals) {
      global.__mobxInstanceCount += 1;
      if (!global.__mobxGlobals.UNCHANGED) {
        global.__mobxGlobals.UNCHANGED = {};
      } // make merge backward compatible
      return global.__mobxGlobals;
    } else {
      global.__mobxInstanceCount = 1;
      return global.__mobxGlobals = /*#__PURE__*/new MobXGlobals();
    }
  }();
  // function invariantObservers(observable: IObservable) {
  //     const list = observable.observers
  //     const map = observable.observersIndexes
  //     const l = list.length
  //     for (let i = 0; i < l; i++) {
  //         const id = list[i].__mapid
  //         if (i) {
  //             invariant(map[id] === i, "INTERNAL ERROR maps derivation.__mapid to index in list") // for performance
  //         } else {
  //             invariant(!(id in map), "INTERNAL ERROR observer on index 0 shouldn't be held in map.") // for performance
  //         }
  //     }
  //     invariant(
  //         list.length === 0 || Object.keys(map).length === list.length - 1,
  //         "INTERNAL ERROR there is no junk in map"
  //     )
  // }
  function addObserver(observable, node) {
    var _observable$observers2;
    ((_observable$observers2 = observable.observers_) != null ? _observable$observers2 : observable.observers_ = new Set()).add(node);
    if (observable.lowestObserverState_ > node.dependenciesState_) {
      observable.lowestObserverState_ = node.dependenciesState_;
    }
    // invariantObservers(observable);
    // invariant(observable._observers.indexOf(node) !== -1, "INTERNAL ERROR didn't add node");
  }
  function removeObserver(observable, node) {
    // invariant(globalState.inBatch > 0, "INTERNAL ERROR, remove should be called only inside batch");
    // invariant(observable._observers.indexOf(node) !== -1, "INTERNAL ERROR remove already removed node");
    // invariantObservers(observable);
    const observers = observable.observers_;
    if (!observers) {
      return;
    }
    observers.delete(node);
    if (observers.size === 0) {
      // deleting last observer
      queueForUnobservation(observable);
    }
    // invariantObservers(observable);
    // invariant(observable._observers.indexOf(node) === -1, "INTERNAL ERROR remove already removed node2");
  }
  function queueForUnobservation(observable) {
    if (observable.isPendingUnobservation === false) {
      // invariant(observable._observers.length === 0, "INTERNAL ERROR, should only queue for unobservation unobserved observables");
      observable.isPendingUnobservation = true;
      globalState.pendingUnobservations.push(observable);
    }
  }
  /**
   * Batch starts a transaction, at least for purposes of memoizing ComputedValues when nothing else does.
   * During a batch `onBecomeUnobserved` will be called at most once per observable.
   * Avoids unnecessary recalculations.
   */
  function startBatch() {
    globalState.inBatch++;
  }
  function endBatch() {
    if (--globalState.inBatch === 0) {
      runReactions();
      // the batch is actually about to finish, all unobserving should happen here.
      // Guard against re-entering this loop: an onBUO handler can dispose a Reaction,
      // which calls startBatch/endBatch again while we're still iterating. Bail out of
      // the nested call instead of recursing; the outer loop re-reads list.length on
      // every iteration, so it picks up anything the nested dispose() pushes onto the
      // same pendingUnobservations array.
      if (!globalState.isRunningUnobservations && globalState.pendingUnobservations.length > 0) {
        runPendingUnobservations();
      }
    }
  }
  // Only called when there is something to unobserve, so the common endBatch() skips the
  // try/finally and the pendingUnobservations reallocation entirely
  function runPendingUnobservations() {
    globalState.isRunningUnobservations = true;
    try {
      const list = globalState.pendingUnobservations;
      for (let i = 0; i < list.length; i++) {
        const observable = list[i];
        observable.isPendingUnobservation = false;
        if (!observable.observers_ || observable.observers_.size === 0) {
          // release the empty Set so unobserved atoms don't keep paying for it
          observable.observers_ = null;
          if (observable.isBeingObserved) {
            // if this observable had reactive observers, trigger the hooks
            observable.isBeingObserved = false;
            observable.onBUO();
          }
          if (observable instanceof ComputedValue) {
            // computed values are automatically teared down when the last observer leaves
            // this process happens recursively, this computed might be the last observabe of another, etc..
            observable.suspend_();
          }
        }
      }
      globalState.pendingUnobservations = [];
    } finally {
      // Always release the guard, even if an onBUO handler (user code) threw,
      // otherwise every future endBatch() would see isRunningUnobservations
      // stuck true and silently stop draining pendingUnobservations forever.
      globalState.isRunningUnobservations = false;
    }
  }
  /**
   * Marks an observable as observed, cascading into the dependencies of a ComputedValue.
   * Unobservation already cascades (`suspend_` -> `clearObserving`), observation normally
   * only does so by accident: a newly observed computed usually recomputes and re-reports
   * its dependencies. When it serves a cached value instead nothing re-reports them, so the
   * transition has to be propagated by hand. See #4547.
   */
  function markObserved(observable) {
    var _observable$observing;
    if (observable.isBeingObserved) {
      return;
    }
    observable.isBeingObserved = true;
    observable.onBO();
    // No queueForUnobservation here: the observer links already exist, so the regular
    // suspend_ -> clearObserving -> removeObserver teardown still delivers the onBUO.
    (_observable$observing = observable.observing_) == null || _observable$observing.forEach(markObserved);
  }
  function reportObserved(observable) {
    const derivation = globalState.trackingDerivation;
    if (derivation !== null) {
      /**
       * Simple optimization, give each derivation run an unique id (runId)
       * Check if last time this observable was accessed the same runId is used
       * if this is the case, the relation is already known
       */
      if (derivation.runId_ !== observable.lastAccessedBy_) {
        observable.lastAccessedBy_ = derivation.runId_;
        // Tried storing newObserving, or observing, or both as Set, but performance didn't come close...
        derivation.newObserving_[derivation.unboundDepsCount_++] = observable;
        if (!observable.isBeingObserved && globalState.trackingContext) {
          observable.isBeingObserved = true;
          observable.onBO();
        }
      }
      return observable.isBeingObserved;
    } else if ((!observable.observers_ || observable.observers_.size === 0) && globalState.inBatch > 0) {
      queueForUnobservation(observable);
    }
    return false;
  }
  // function invariantLOS(observable: IObservable, msg: string) {
  //     // it's expensive so better not run it in produciton. but temporarily helpful for testing
  //     const min = getObservers(observable).reduce((a, b) => Math.min(a, b.dependenciesState), 2)
  //     if (min >= observable.lowestObserverState) return // <- the only assumption about `lowestObserverState`
  //     throw new Error(
  //         "lowestObserverState is wrong for " +
  //             msg +
  //             " because " +
  //             min +
  //             " < " +
  //             observable.lowestObserverState
  //     )
  // }
  /**
   * NOTE: current propagation mechanism will in case of self reruning autoruns behave unexpectedly
   * It will propagate changes to observers from previous run
   * It's hard or maybe impossible (with reasonable perf) to get it right with current approach
   * Hopefully self reruning autoruns aren't a feature people should depend on
   * Also most basic use cases should be ok
   */
  // Called by Atom when its value changes
  function propagateChanged(observable) {
    var _observable$observers3;
    // invariantLOS(observable, "changed start");
    if (observable.lowestObserverState_ === 2 /* IDerivationState_.STALE_ */) {
      return;
    }
    observable.lowestObserverState_ = 2 /* IDerivationState_.STALE_ */;
    // Ideally we use for..of here, but the downcompiled version is really slow...
    (_observable$observers3 = observable.observers_) == null || _observable$observers3.forEach(d => {
      if (d.dependenciesState_ === 0 /* IDerivationState_.UP_TO_DATE_ */) {
        d.onBecomeStale_();
      }
      d.dependenciesState_ = 2 /* IDerivationState_.STALE_ */;
    });
    // invariantLOS(observable, "changed end");
  }
  // Called by ComputedValue when it recalculate and its value changed
  function propagateChangeConfirmed(observable) {
    var _observable$observers4;
    // invariantLOS(observable, "confirmed start");
    if (observable.lowestObserverState_ === 2 /* IDerivationState_.STALE_ */) {
      return;
    }
    observable.lowestObserverState_ = 2 /* IDerivationState_.STALE_ */;
    (_observable$observers4 = observable.observers_) == null || _observable$observers4.forEach(d => {
      if (d.dependenciesState_ === 1 /* IDerivationState_.POSSIBLY_STALE_ */) {
        d.dependenciesState_ = 2 /* IDerivationState_.STALE_ */;
      } else if (d.dependenciesState_ === 0 /* IDerivationState_.UP_TO_DATE_ */ // this happens during computing of `d`, just keep lowestObserverState up to date.
      ) {
        observable.lowestObserverState_ = 0 /* IDerivationState_.UP_TO_DATE_ */;
      }
    });
    // invariantLOS(observable, "confirmed end");
  }
  // Used by computed when its dependency changed, but we don't wan't to immediately recompute.
  function propagateMaybeChanged(observable) {
    var _observable$observers5;
    // invariantLOS(observable, "maybe start");
    if (observable.lowestObserverState_ !== 0 /* IDerivationState_.UP_TO_DATE_ */) {
      return;
    }
    observable.lowestObserverState_ = 1 /* IDerivationState_.POSSIBLY_STALE_ */;
    (_observable$observers5 = observable.observers_) == null || _observable$observers5.forEach(d => {
      if (d.dependenciesState_ === 0 /* IDerivationState_.UP_TO_DATE_ */) {
        d.dependenciesState_ = 1 /* IDerivationState_.POSSIBLY_STALE_ */;
        d.onBecomeStale_();
      }
    });
    // invariantLOS(observable, "maybe end");
  }

  class Reaction {
    constructor(name_ = "Reaction", onInvalidate_, errorHandler_, requiresObservable_) {
      this.name_ = void 0;
      this.onInvalidate_ = void 0;
      this.errorHandler_ = void 0;
      this.requiresObservable_ = void 0;
      this.observing_ = [];
      // nodes we are looking at. Our value depends on these nodes
      this.newObserving_ = [];
      this.dependenciesState_ = -1 /* IDerivationState_.NOT_TRACKING_ */;
      this.runId_ = 0;
      this.unboundDepsCount_ = 0;
      this.flags_ = 0b00000;
      this.name_ = name_;
      this.onInvalidate_ = onInvalidate_;
      this.errorHandler_ = errorHandler_;
      this.requiresObservable_ = requiresObservable_;
    }
    get isDisposed() {
      return getFlag(this.flags_, 1 /* ReactionFlags.isDisposed */);
    }
    set isDisposed(newValue) {
      this.flags_ = setFlag(this.flags_, 1 /* ReactionFlags.isDisposed */, newValue);
    }
    get isScheduled() {
      return getFlag(this.flags_, 2 /* ReactionFlags.isScheduled */);
    }
    set isScheduled(newValue) {
      this.flags_ = setFlag(this.flags_, 2 /* ReactionFlags.isScheduled */, newValue);
    }
    get isTrackPending() {
      return getFlag(this.flags_, 4 /* ReactionFlags.isTrackPending */);
    }
    set isTrackPending(newValue) {
      this.flags_ = setFlag(this.flags_, 4 /* ReactionFlags.isTrackPending */, newValue);
    }
    get isRunning() {
      return getFlag(this.flags_, 8 /* ReactionFlags.isRunning */);
    }
    set isRunning(newValue) {
      this.flags_ = setFlag(this.flags_, 8 /* ReactionFlags.isRunning */, newValue);
    }
    get diffValue() {
      return getFlag(this.flags_, 16 /* ReactionFlags.diffValue */) ? 1 : 0;
    }
    set diffValue(newValue) {
      this.flags_ = setFlag(this.flags_, 16 /* ReactionFlags.diffValue */, newValue === 1 ? true : false);
    }
    onBecomeStale_() {
      this.schedule_();
    }
    schedule_() {
      if (!this.isScheduled) {
        this.isScheduled = true;
        globalState.pendingReactions.push(this);
        runReactions();
      }
    }
    /**
     * internal, use schedule() if you intend to kick off a reaction
     */
    runReaction_() {
      if (!this.isDisposed) {
        startBatch();
        this.isScheduled = false;
        const prev = globalState.trackingContext;
        globalState.trackingContext = this;
        if (shouldCompute(this)) {
          this.isTrackPending = true;
          try {
            this.onInvalidate_();
            if (__MOBX_DEV__ && this.isTrackPending && isSpyEnabled()) ;
          } catch (e) {
            this.reportExceptionInDerivation_(e);
          }
        }
        globalState.trackingContext = prev;
        endBatch();
      }
    }
    track(fn) {
      if (this.isDisposed) {
        return;
        // console.warn("Reaction already disposed") // Note: Not a warning / error in mobx 4 either
      }
      startBatch();
      this.isRunning = true;
      const prevReaction = globalState.trackingContext; // reactions could create reactions...
      globalState.trackingContext = this;
      const result = trackDerivedFunction(this, fn, undefined);
      globalState.trackingContext = prevReaction;
      this.isRunning = false;
      this.isTrackPending = false;
      if (this.isDisposed) {
        // disposed during last run. Clean up everything that was bound after the dispose call.
        clearObserving(this);
      }
      if (isCaughtException(result)) {
        this.reportExceptionInDerivation_(result.cause);
      }
      endBatch();
    }
    reportExceptionInDerivation_(error) {
      if (this.errorHandler_) {
        this.errorHandler_(error, this);
        return;
      }
      if (globalState.disableErrorBoundaries) {
        throw error;
      }
      const message = `[mobx] uncaught error in '${this}'`;
      if (!globalState.suppressReactionErrors) {
        console.error(message, error);
        /** If debugging brought you here, please, read the above message :-). Tnx! */
      } // prettier-ignore
      globalState.globalReactionErrorHandlers.forEach(f => f(error, this));
    }
    dispose() {
      if (!this.isDisposed) {
        this.isDisposed = true;
        if (!this.isRunning) {
          // if disposed while running, clean up later. Maybe not optimal, but rare case
          startBatch();
          clearObserving(this);
          endBatch();
        }
      }
    }
    getDisposer_(abortSignal) {
      const dispose = () => {
        this.dispose();
        abortSignal == null || abortSignal.removeEventListener == null || abortSignal.removeEventListener("abort", dispose);
      };
      abortSignal == null || abortSignal.addEventListener == null || abortSignal.addEventListener("abort", dispose);
      dispose[$mobx] = this;
      if ("dispose" in Symbol && typeof Symbol.dispose === "symbol") {
        dispose[Symbol.dispose] = dispose;
      }
      return dispose;
    }
    toString() {
      return `Reaction[${this.name_}]`;
    }
  }
  /**
   * Magic number alert!
   * Defines within how many times a reaction is allowed to re-trigger itself
   * until it is assumed that this is gonna be a never ending loop...
   */
  const MAX_REACTION_ITERATIONS = 100;
  let reactionScheduler = f => f();
  function runReactions() {
    // Trampolining, if runReactions are already running, new reactions will be picked up
    if (globalState.inBatch > 0 || globalState.isRunningReactions) {
      return;
    }
    reactionScheduler(runReactionsHelper);
  }
  function runReactionsHelper() {
    globalState.isRunningReactions = true;
    const allReactions = globalState.pendingReactions;
    let iterations = 0;
    // While running reactions, new reactions might be triggered.
    // Hence we work with two variables and check whether
    // we converge to no remaining reactions after a while.
    while (allReactions.length > 0) {
      if (++iterations === MAX_REACTION_ITERATIONS) {
        console.error(`[mobx] cycle in reaction: ${allReactions[0]}`);
        allReactions.splice(0); // clear reactions
      }
      let remainingReactions = allReactions.splice(0);
      for (let i = 0, l = remainingReactions.length; i < l; i++) {
        remainingReactions[i].runReaction_();
      }
    }
    globalState.isRunningReactions = false;
  }
  const isReaction = /*#__PURE__*/createInstanceofPredicate("Reaction", Reaction);

  function isSpyEnabled() {
    return __MOBX_DEV__;
  }
  function spyReport(event) {
    {
      return;
    } // dead code elimination can do the rest
  }
  function spyReportStart(event) {
    {
      return;
    }
  }
  function spyReportEnd(change) {
    {
      return;
    }
  }

  const ACTION = "action";
  const AUTOACTION = "autoAction";
  const AUTOACTION_BOUND = "autoAction.bound";
  const DEFAULT_ACTION_NAME = "<unnamed action>";
  const actionAnnotation = /*#__PURE__*/createActionAnnotation(ACTION);
  const autoActionAnnotation = /*#__PURE__*/createActionAnnotation(AUTOACTION, {
    autoAction: true
  });
  const autoActionBoundAnnotation = /*#__PURE__*/createActionAnnotation(AUTOACTION_BOUND, {
    autoAction: true,
    bound: true
  });
  function createActionDecoratorAnnotation(annotation) {
    return createDecoratorAnnotation(annotation, decorateAction20223_);
  }
  function createActionFactory(autoAction) {
    const res = function action(arg1, arg2) {
      if (arg2 && typeof arg2.kind === "string") {
        return decorateAction20223_(autoAction ? autoActionAnnotation : actionAnnotation, arg1, arg2);
      }
      // action(fn() {})
      if (isFunction(arg1)) {
        return createAction(arg1.name || DEFAULT_ACTION_NAME, arg1, autoAction);
      }
      // action("name", fn() {})
      if (isFunction(arg2)) {
        return createAction(arg1, arg2, autoAction);
      }
      // action("name") annotation
      if (isStringish(arg1)) {
        return createActionDecoratorAnnotation(createActionAnnotation(autoAction ? AUTOACTION : ACTION, {
          name: arg1,
          autoAction
        }));
      }
    };
    return res;
  }
  const action = /*#__PURE__*/createActionFactory(false);
  assign(action, actionAnnotation);
  const autoAction = /*#__PURE__*/createActionFactory(true);
  assign(autoAction, autoActionAnnotation);
  const autoActionBound = /*#__PURE__*/createActionDecoratorAnnotation(autoActionBoundAnnotation);
  function isAction(thing) {
    return isFunction(thing) && thing.isMobxAction === true;
  }

  function extendObservable(target, properties, annotations, options) {
    // Pull descriptors first, so we don't have to deal with props added by administration ($mobx)
    const descriptors = getOwnPropertyDescriptors(properties);
    initObservable(() => {
      const adm = asObservableObject(target, options)[$mobx];
      ownKeys(descriptors).forEach(key => {
        adm.extend_(key, descriptors[key],
        // must pass "undefined" for { key: undefined }
        !annotations ? true : key in annotations ? annotations[key] : true);
      });
    });
    return target;
  }
  class FlowCancellationError extends Error {
    constructor() {
      super("FLOW_CANCELLED");
      Object.setPrototypeOf(this, new.target.prototype);
      this.name = "FlowCancellationError";
    }
    toString() {
      return `Error: ${this.message}`;
    }
  }
  function createFlowDecoratorAnnotation(annotation) {
    return createDecoratorAnnotation(annotation, decorateFlow20223_);
  }
  const flowAnnotation = /*#__PURE__*/createFlowAnnotation("flow");
  const flowBoundAnnotation = /*#__PURE__*/createFlowAnnotation("flow.bound", {
    bound: true
  });
  const flow = /*#__PURE__*/assign(function flow(arg1, arg2) {
    if (arg2 && typeof arg2.kind === "string") {
      return decorateFlow20223_(flowAnnotation, arg1, arg2);
    }
    const generator = arg1;
    const name = generator.name || ("flow");
    // Implementation based on https://github.com/tj/co/blob/master/index.js
    const res = function res() {
      const ctx = this;
      const args = arguments;
      const runId = 0;
      const gen = action(name, generator).apply(ctx, args);
      let rejector;
      let pendingPromise = undefined;
      const promise = new Promise(function (resolve, reject) {
        let stepId = 0;
        rejector = reject;
        function onFulfilled(res) {
          pendingPromise = undefined;
          let ret;
          try {
            ret = action(__MOBX_DEV__ ? `${name} - runid: ${runId} - yield ${stepId++}` : name, gen.next).call(gen, res);
          } catch (e) {
            return reject(e);
          }
          next(ret);
        }
        function onRejected(err) {
          pendingPromise = undefined;
          let ret;
          try {
            ret = action(__MOBX_DEV__ ? `${name} - runid: ${runId} - yield ${stepId++}` : name, gen.throw).call(gen, err);
          } catch (e) {
            return reject(e);
          }
          next(ret);
        }
        function next(ret) {
          if (isFunction(ret == null ? void 0 : ret.then)) {
            // an async iterator
            ret.then(next, reject);
            return;
          }
          if (ret.done) {
            return resolve(ret.value);
          }
          pendingPromise = Promise.resolve(ret.value);
          return pendingPromise.then(onFulfilled, onRejected);
        }
        onFulfilled(undefined); // kick off the process
      });
      const cancelActionName = name;
      promise.cancel = action(cancelActionName, function () {
        try {
          if (pendingPromise) {
            cancelPromise(pendingPromise);
          }
          // Finally block can return (or yield) stuff..
          const res = gen.return(undefined);
          // eat anything that promise would do, it's cancelled!
          const yieldedPromise = Promise.resolve(res.value);
          yieldedPromise.then(noop, noop);
          cancelPromise(yieldedPromise); // maybe it can be cancelled :)
          // reject our original promise
          rejector(new FlowCancellationError());
        } catch (e) {
          rejector(e); // there could be a throwing finally block
        }
      });
      return promise;
    };
    res.isMobXFlow = true;
    return res;
  }, flowAnnotation);
  const flowBound = /*#__PURE__*/createFlowDecoratorAnnotation(flowBoundAnnotation);
  function cancelPromise(promise) {
    if (isFunction(promise.cancel)) {
      promise.cancel();
    }
  }
  function isFlow(fn) {
    return (fn == null ? void 0 : fn.isMobXFlow) === true;
  }

  function _isObservable(value, property) {
    if (!value) {
      return false;
    }
    // For first check, see #701
    return isObservableObject(value) || !!value[$mobx] || isAtom(value) || isReaction(value) || isComputedValue(value);
  }
  function isObservable(value) {
    return _isObservable(value);
  }

  /**
   * During a transaction no views are updated until the end of the transaction.
   * The transaction will be run synchronously nonetheless.
   *
   * @param action a function that updates some reactive state
   * @returns any value that was returned by the 'action' parameter.
   */
  function transaction(action, thisArg = undefined) {
    startBatch();
    try {
      return action.apply(thisArg);
    } finally {
      endBatch();
    }
  }

  function getAdm(target) {
    return target[$mobx];
  }
  // Optimization: we don't need the intermediate objects and could have a completely custom administration for DynamicObjects,
  // and skip either the internal values map, or the base object with its property descriptors!
  const objectProxyTraps = {
    has(target, name) {
      return getAdm(target).has_(name);
    },
    get(target, name) {
      return getAdm(target).get_(name);
    },
    set(target, name, value) {
      var _getAdm$set_;
      if (!isStringish(name)) {
        return false;
      }
      // null (intercepted) -> true (success)
      return (_getAdm$set_ = getAdm(target).set_(name, value, true)) != null ? _getAdm$set_ : true;
    },
    deleteProperty(target, name) {
      var _getAdm$delete_;
      if (!isStringish(name)) {
        return false;
      }
      // null (intercepted) -> true (success)
      return (_getAdm$delete_ = getAdm(target).delete_(name, true)) != null ? _getAdm$delete_ : true;
    },
    defineProperty(target, name, descriptor) {
      var _getAdm$definePropert;
      // null (intercepted) -> true (success)
      return (_getAdm$definePropert = getAdm(target).defineProperty_(name, descriptor)) != null ? _getAdm$definePropert : true;
    },
    ownKeys(target) {
      return getAdm(target).ownKeys_();
    },
    preventExtensions(target) {
      die(13);
    }
  };
  function asDynamicObservableObject(target, options) {
    var _target$$mobx, _target$$mobx$proxy_;
    target = asObservableObject(target, options);
    return (_target$$mobx$proxy_ = (_target$$mobx = target[$mobx]).proxy_) != null ? _target$$mobx$proxy_ : _target$$mobx.proxy_ = new Proxy(target, objectProxyTraps);
  }

  function hasInterceptors(interceptable) {
    return interceptable.interceptors_ !== undefined && interceptable.interceptors_.length > 0;
  }
  function interceptChange(interceptable, change) {
    const prevU = untrackedStart();
    try {
      // Interceptor can modify the array, copy it to avoid concurrent modification, see #1950
      const interceptors = [...(interceptable.interceptors_ || [])];
      for (let i = 0, l = interceptors.length; i < l; i++) {
        change = interceptors[i](change);
        if (change && !change.type) {
          die(14);
        }
        if (!change) {
          break;
        }
      }
      return change;
    } finally {
      untrackedEnd(prevU);
    }
  }

  function hasListeners(listenable) {
    return listenable.changeListeners_ !== undefined && listenable.changeListeners_.length > 0;
  }
  function notifyListeners(listenable, change) {
    const prevU = untrackedStart();
    let listeners = listenable.changeListeners_;
    if (!listeners) {
      return;
    }
    listeners = listeners.slice();
    for (let i = 0, l = listeners.length; i < l; i++) {
      listeners[i](change);
    }
    untrackedEnd(prevU);
  }

  const SPLICE = "splice";
  const UPDATE = "update";
  const MAX_SPLICE_SIZE = 10000; // See e.g. https://github.com/mobxjs/mobx/issues/859
  const arrayTraps = {
    get(target, name) {
      const adm = target[$mobx];
      if (name === $mobx) {
        return adm;
      }
      if (name === "length") {
        return adm.getArrayLength_();
      }
      if (typeof name === "string" && !isNaN(name)) {
        return adm.get_(parseInt(name));
      }
      if (hasProp(arrayExtensions, name)) {
        return arrayExtensions[name];
      }
      return target[name];
    },
    set(target, name, value) {
      const adm = target[$mobx];
      if (name === "length") {
        adm.setArrayLength_(value);
      }
      if (typeof name === "symbol" || isNaN(name)) {
        target[name] = value;
      } else {
        // numeric string
        adm.set_(parseInt(name), value);
      }
      return true;
    },
    preventExtensions() {
      die(15);
    }
  };
  class ObservableArrayAdministration {
    constructor(name = "ObservableArray", enhancer, owned_) {
      this.owned_ = void 0;
      this.atom_ = void 0;
      this.values_ = [];
      // this is the prop that gets proxied, so can't replace it!
      this.interceptors_ = void 0;
      this.changeListeners_ = void 0;
      this.enhancer_ = void 0;
      this.dehancer = void 0;
      this.proxy_ = void 0;
      this.lastKnownLength_ = 0;
      this.owned_ = owned_;
      this.atom_ = new Atom(name);
      this.enhancer_ = (newV, oldV) => enhancer(newV, oldV, "ObservableArray[..]");
    }
    dehanceValue_(value) {
      if (this.dehancer !== undefined) {
        return this.dehancer(value);
      }
      return value;
    }
    dehanceValues_(values) {
      if (this.dehancer !== undefined && values.length > 0) {
        return values.map(this.dehancer);
      }
      return values;
    }
    getArrayLength_() {
      this.atom_.reportObserved();
      return this.values_.length;
    }
    setArrayLength_(newLength) {
      if (typeof newLength !== "number" || isNaN(newLength) || newLength < 0) {
        die(40, newLength);
      }
      let currentLength = this.values_.length;
      if (newLength === currentLength) {
        return;
      } else if (newLength > currentLength) {
        const newItems = Array.from({
          length: newLength - currentLength
        });
        this.spliceWithArray_(currentLength, 0, newItems);
      } else {
        this.spliceWithArray_(newLength, currentLength - newLength);
      }
    }
    updateArrayLength_(oldLength, delta) {
      if (oldLength !== this.lastKnownLength_) {
        die(16);
      }
      this.lastKnownLength_ += delta;
    }
    spliceWithArray_(index, deleteCount, newItems) {
      checkIfStateModificationsAreAllowed(this.atom_);
      const length = this.values_.length;
      if (index === undefined) {
        index = 0;
      } else if (index > length) {
        index = length;
      } else if (index < 0) {
        index = Math.max(0, length + index);
      }
      if (arguments.length === 1) {
        deleteCount = length - index;
      } else if (deleteCount === undefined || deleteCount === null) {
        deleteCount = 0;
      } else {
        deleteCount = Math.max(0, Math.min(deleteCount, length - index));
      }
      if (newItems === undefined) {
        newItems = EMPTY_ARRAY;
      }
      if (hasInterceptors(this)) {
        const change = interceptChange(this, {
          object: this.proxy_,
          type: SPLICE,
          index,
          removedCount: deleteCount,
          added: newItems
        });
        if (!change) {
          return EMPTY_ARRAY;
        }
        deleteCount = change.removedCount;
        newItems = change.added;
      }
      newItems = newItems.length === 0 ? newItems : newItems.map(v => this.enhancer_(v, undefined));
      const res = this.spliceItemsIntoValues_(index, deleteCount, newItems);
      if (deleteCount !== 0 || newItems.length !== 0) {
        this.notifyArraySplice_(index, newItems, res);
      }
      return this.dehanceValues_(res);
    }
    spliceItemsIntoValues_(index, deleteCount, newItems) {
      if (newItems.length < MAX_SPLICE_SIZE) {
        return this.values_.splice(index, deleteCount, ...newItems);
      } else {
        // The items removed by the splice
        const res = this.values_.slice(index, index + deleteCount);
        // The items that that should remain at the end of the array
        let oldItems = this.values_.slice(index + deleteCount);
        // New length is the previous length + addition count - deletion count
        this.values_.length += newItems.length - deleteCount;
        for (let i = 0; i < newItems.length; i++) {
          this.values_[index + i] = newItems[i];
        }
        for (let i = 0; i < oldItems.length; i++) {
          this.values_[index + newItems.length + i] = oldItems[i];
        }
        return res;
      }
    }
    notifyArrayChildUpdate_(index, newValue, oldValue) {
      const notifySpy = __MOBX_DEV__;
      const notify = hasListeners(this);
      const change = notify || notifySpy ? {
        observableKind: "array",
        object: this.proxy_,
        type: UPDATE,
        debugObjectName: this.atom_.name_,
        index,
        newValue,
        oldValue
      } : null;
      this.atom_.reportChanged();
      if (notify) {
        notifyListeners(this, change);
      }
    }
    notifyArraySplice_(index, added, removed) {
      const notifySpy = __MOBX_DEV__;
      const notify = hasListeners(this);
      const change = notify || notifySpy ? {
        observableKind: "array",
        object: this.proxy_,
        debugObjectName: this.atom_.name_,
        type: SPLICE,
        index,
        removed,
        added,
        removedCount: removed.length,
        addedCount: added.length
      } : null;
      this.atom_.reportChanged();
      // conform: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/observe
      if (notify) {
        notifyListeners(this, change);
      }
    }
    get_(index) {
      this.atom_.reportObserved();
      return this.dehanceValue_(this.values_[index]);
    }
    set_(index, newValue) {
      const values = this.values_;
      if (index < values.length) {
        // update at index in range
        checkIfStateModificationsAreAllowed(this.atom_);
        const oldValue = values[index];
        if (hasInterceptors(this)) {
          const change = interceptChange(this, {
            type: UPDATE,
            object: this.proxy_,
            // since "this" is the real array we need to pass its proxy
            index,
            newValue
          });
          if (!change) {
            return;
          }
          newValue = change.newValue;
        }
        newValue = this.enhancer_(newValue, oldValue);
        const changed = newValue !== oldValue;
        if (changed) {
          values[index] = newValue;
          this.notifyArrayChildUpdate_(index, newValue, oldValue);
        }
      } else {
        // For out of bound index, we don't create an actual sparse array,
        // but rather fill the holes with undefined (same as setArrayLength_).
        // This could be considered a bug.
        const newItems = Array.from({
          length: index + 1 - values.length
        });
        newItems[newItems.length - 1] = newValue;
        this.spliceWithArray_(values.length, 0, newItems);
      }
    }
  }
  function createObservableArray(initialValues, enhancer, name = "ObservableArray", owned = false) {
    return initObservable(() => {
      const adm = new ObservableArrayAdministration(name, enhancer, owned);
      addHiddenFinalProp(adm.values_, $mobx, adm);
      const proxy = new Proxy(adm.values_, arrayTraps);
      adm.proxy_ = proxy;
      if (initialValues && initialValues.length) {
        adm.spliceWithArray_(0, 0, initialValues);
      }
      return proxy;
    });
  }
  // eslint-disable-next-line
  var arrayExtensions = {
    clear() {
      return this.splice(0);
    },
    replace(newItems) {
      const adm = this[$mobx];
      return adm.spliceWithArray_(0, adm.values_.length, newItems);
    },
    // Used by JSON.stringify
    toJSON() {
      return this.slice();
    },
    /*
     * functions that do alter the internal structure of the array, (based on lib.es6.d.ts)
     * since these functions alter the inner structure of the array, the have side effects.
     * Because the have side effects, they should not be used in computed function,
     * and for that reason the do not call dependencyState.notifyObserved
     */
    splice(index, deleteCount, ...newItems) {
      const adm = this[$mobx];
      switch (arguments.length) {
        case 0:
          return [];
        case 1:
          return adm.spliceWithArray_(index);
        case 2:
          return adm.spliceWithArray_(index, deleteCount);
      }
      return adm.spliceWithArray_(index, deleteCount, newItems);
    },
    spliceWithArray(index, deleteCount, newItems) {
      return this[$mobx].spliceWithArray_(index, deleteCount, newItems);
    },
    push(...items) {
      const adm = this[$mobx];
      adm.spliceWithArray_(adm.values_.length, 0, items);
      return adm.values_.length;
    },
    pop() {
      return this.splice(Math.max(this[$mobx].values_.length - 1, 0), 1)[0];
    },
    shift() {
      return this.splice(0, 1)[0];
    },
    unshift(...items) {
      const adm = this[$mobx];
      adm.spliceWithArray_(0, 0, items);
      return adm.values_.length;
    },
    reverse() {
      // reverse by default mutates in place before returning the result
      // which makes it both a 'derivation' and a 'mutation'.
      if (globalState.trackingDerivation) {
        die(37, "reverse");
      }
      this.replace(this.slice().reverse());
      return this;
    },
    sort() {
      // sort by default mutates in place before returning the result
      // which goes against all good practices. Let's not change the array in place!
      if (globalState.trackingDerivation) {
        die(37, "sort");
      }
      const copy = this.slice();
      copy.sort.apply(copy, arguments);
      this.replace(copy);
      return this;
    },
    remove(value) {
      const adm = this[$mobx];
      const idx = adm.dehanceValues_(adm.values_).indexOf(value);
      if (idx > -1) {
        this.splice(idx, 1);
        return true;
      }
      return false;
    }
  };
  /**
   * Wrap function from prototype
   * Without this, everything works as well, but this works
   * faster as everything works on unproxied values
   */
  addArrayExtension("at", simpleFunc);
  addArrayExtension("concat", simpleFunc);
  addArrayExtension("flat", simpleFunc);
  addArrayExtension("includes", simpleFunc);
  addArrayExtension("indexOf", simpleFunc);
  addArrayExtension("join", simpleFunc);
  addArrayExtension("lastIndexOf", simpleFunc);
  addArrayExtension("slice", simpleFunc);
  addArrayExtension("toString", simpleFunc);
  addArrayExtension("toLocaleString", simpleFunc);
  addArrayExtension("toSorted", simpleFunc);
  addArrayExtension("toSpliced", simpleFunc);
  addArrayExtension("with", simpleFunc);
  // map
  addArrayExtension("every", mapLikeFunc);
  addArrayExtension("filter", mapLikeFunc);
  addArrayExtension("find", mapLikeFunc);
  addArrayExtension("findIndex", mapLikeFunc);
  addArrayExtension("findLast", mapLikeFunc);
  addArrayExtension("findLastIndex", mapLikeFunc);
  addArrayExtension("flatMap", mapLikeFunc);
  addArrayExtension("forEach", mapLikeFunc);
  addArrayExtension("map", mapLikeFunc);
  addArrayExtension("some", mapLikeFunc);
  addArrayExtension("toReversed", mapLikeFunc);
  // reduce
  addArrayExtension("reduce", reduceLikeFunc);
  addArrayExtension("reduceRight", reduceLikeFunc);
  function addArrayExtension(funcName, funcFactory) {
    if (typeof Array.prototype[funcName] === "function") {
      arrayExtensions[funcName] = funcFactory(funcName);
    }
  }
  // Report and delegate to dehanced array
  function simpleFunc(funcName) {
    return function () {
      const adm = this[$mobx];
      adm.atom_.reportObserved();
      const dehancedValues = adm.dehanceValues_(adm.values_);
      return dehancedValues[funcName].apply(dehancedValues, arguments);
    };
  }
  // Make sure callbacks receive correct array arg #2326
  function mapLikeFunc(funcName) {
    return function (callback, thisArg) {
      const adm = this[$mobx];
      adm.atom_.reportObserved();
      const dehancedValues = adm.dehanceValues_(adm.values_);
      return dehancedValues[funcName]((element, index) => {
        return callback.call(thisArg, element, index, this);
      });
    };
  }
  // Make sure callbacks receive correct array arg #2326
  function reduceLikeFunc(funcName) {
    return function () {
      const adm = this[$mobx];
      adm.atom_.reportObserved();
      const dehancedValues = adm.dehanceValues_(adm.values_);
      // #2432 - reduce behavior depends on arguments.length
      const callback = arguments[0];
      arguments[0] = (accumulator, currentValue, index) => {
        return callback(accumulator, currentValue, index, this);
      };
      return dehancedValues[funcName].apply(dehancedValues, arguments);
    };
  }

  const ObservableMapMarker = {};
  const ADD = "add";
  const DELETE = "delete";
  // just extend Map? See also https://gist.github.com/nestharus/13b4d74f2ef4a2f4357dbd3fc23c1e54
  // But: https://github.com/mobxjs/mobx/issues/1556
  class ObservableMap {
    constructor(initialData, enhancer_ = deepEnhancer, name_ = "ObservableMap") {
      this.enhancer_ = void 0;
      this.name_ = void 0;
      this[$mobx] = ObservableMapMarker;
      this.data_ = void 0;
      this.hasMap_ = void 0;
      // hasMap, not hashMap >-).
      this.keysAtom_ = void 0;
      this.interceptors_ = void 0;
      this.changeListeners_ = void 0;
      this.dehancer = void 0;
      this.enhancer_ = enhancer_;
      this.name_ = name_;
      initObservable(() => {
        this.keysAtom_ = createAtom(__MOBX_DEV__ ? `${this.name_}.keys()` : "ObservableMap.keys()");
        this.data_ = new Map();
        this.hasMap_ = new Map();
        if (initialData) {
          this.merge(initialData);
        }
      });
    }
    has_(key) {
      return this.data_.has(key);
    }
    has(key) {
      if (!globalState.trackingDerivation) {
        return this.has_(key);
      }
      let entry = this.hasMap_.get(key);
      if (!entry) {
        const newEntry = entry = new ObservableValue(this.has_(key), referenceEnhancer, "ObservableMap.key?", false);
        this.hasMap_.set(key, newEntry);
        newEntry.onBUOL = new Set([() => this.hasMap_.delete(key)]);
      }
      return entry.get();
    }
    set(key, value) {
      const hasKey = this.has_(key);
      if (hasInterceptors(this)) {
        const change = interceptChange(this, {
          type: hasKey ? UPDATE : ADD,
          object: this,
          newValue: value,
          name: key
        });
        if (!change) {
          return this;
        }
        value = change.newValue;
      }
      if (hasKey) {
        this.updateValue_(key, value);
      } else {
        this.addValue_(key, value);
      }
      return this;
    }
    delete(key) {
      checkIfStateModificationsAreAllowed(this.keysAtom_);
      if (hasInterceptors(this)) {
        const change = interceptChange(this, {
          type: DELETE,
          object: this,
          name: key
        });
        if (!change) {
          return false;
        }
      }
      if (this.has_(key)) {
        const notifySpy = __MOBX_DEV__;
        const notify = hasListeners(this);
        const change = notify || notifySpy ? {
          observableKind: "map",
          debugObjectName: this.name_,
          type: DELETE,
          object: this,
          oldValue: this.data_.get(key).value_,
          name: key
        } : null;
        transaction(() => {
          var _this$hasMap_$get;
          this.keysAtom_.reportChanged();
          (_this$hasMap_$get = this.hasMap_.get(key)) == null || _this$hasMap_$get.setNewValue_(false);
          const observable = this.data_.get(key);
          observable.setNewValue_(undefined);
          this.data_.delete(key);
        });
        if (notify) {
          notifyListeners(this, change);
        }
        return true;
      }
      return false;
    }
    updateValue_(key, newValue) {
      const observable = this.data_.get(key);
      newValue = observable.prepareNewValue_(newValue);
      if (newValue !== globalState.UNCHANGED) {
        const notifySpy = __MOBX_DEV__;
        const notify = hasListeners(this);
        const change = notify || notifySpy ? {
          observableKind: "map",
          debugObjectName: this.name_,
          type: UPDATE,
          object: this,
          oldValue: observable.value_,
          name: key,
          newValue
        } : null;
        observable.setNewValue_(newValue);
        if (notify) {
          notifyListeners(this, change);
        }
      }
    }
    addValue_(key, newValue) {
      checkIfStateModificationsAreAllowed(this.keysAtom_);
      transaction(() => {
        var _this$hasMap_$get2;
        const observable = new ObservableValue(newValue, this.enhancer_, "ObservableMap.key", false);
        this.data_.set(key, observable);
        newValue = observable.value_; // value might have been changed
        (_this$hasMap_$get2 = this.hasMap_.get(key)) == null || _this$hasMap_$get2.setNewValue_(true);
        this.keysAtom_.reportChanged();
      });
      const notifySpy = __MOBX_DEV__;
      const notify = hasListeners(this);
      const change = notify || notifySpy ? {
        observableKind: "map",
        debugObjectName: this.name_,
        type: ADD,
        object: this,
        name: key,
        newValue
      } : null;
      if (notify) {
        notifyListeners(this, change);
      }
    }
    get(key) {
      if (this.has(key)) {
        return this.dehanceValue_(this.data_.get(key).get());
      }
      return this.dehanceValue_(undefined);
    }
    getOrInsert(key, value) {
      if (!this.has(key)) {
        this.set(key, value);
      }
      return this.get(key);
    }
    getOrInsertComputed(key, callback) {
      if (!this.has(key)) {
        this.set(key, callback(key));
      }
      return this.get(key);
    }
    dehanceValue_(value) {
      if (this.dehancer !== undefined) {
        return this.dehancer(value);
      }
      return value;
    }
    keys() {
      this.keysAtom_.reportObserved();
      return this.data_.keys();
    }
    values() {
      const self = this;
      const keys = this.keys();
      return makeIterableForMap({
        next() {
          const {
            done,
            value
          } = keys.next();
          return {
            done,
            value: done ? undefined : self.get(value)
          };
        }
      });
    }
    entries() {
      const self = this;
      const keys = this.keys();
      return makeIterableForMap({
        next() {
          const {
            done,
            value
          } = keys.next();
          return {
            done,
            value: done ? undefined : [value, self.get(value)]
          };
        }
      });
    }
    [Symbol.iterator]() {
      return this.entries();
    }
    forEach(callback, thisArg) {
      for (const [key, value] of this) {
        callback.call(thisArg, value, key, this);
      }
    }
    /** Merge another object into this object, returns this. */
    merge(other) {
      if (isObservableMap(other)) {
        other = new Map(other);
      }
      transaction(() => {
        if (isPlainObject(other)) {
          getPlainObjectKeys(other).forEach(key => this.set(key, other[key]));
        } else if (Array.isArray(other)) {
          other.forEach(([key, value]) => this.set(key, value));
        } else if (isES6Map(other)) {
          if (!isPlainES6Map(other)) {
            die(19, other);
          }
          other.forEach((value, key) => this.set(key, value));
        } else if (other !== null && other !== undefined) {
          die(20, other);
        }
      });
      return this;
    }
    clear() {
      transaction(() => {
        untracked(() => {
          for (const key of this.keys()) {
            this.delete(key);
          }
        });
      });
    }
    replace(values) {
      // Implementation requirements:
      // - respect ordering of replacement map
      // - allow interceptors to run and potentially prevent individual operations
      // - don't recreate observables that already exist in original map (so we don't destroy existing subscriptions)
      // - don't _keysAtom.reportChanged if the keys of resulting map are indentical (order matters!)
      // - note that result map may differ from replacement map due to the interceptors
      transaction(() => {
        // Convert to map so we can do quick key lookups
        const replacementMap = convertToMap(values);
        const orderedData = new Map();
        // Used for optimization
        let keysReportChangedCalled = false;
        // Delete keys that don't exist in replacement map
        // if the key deletion is prevented by interceptor
        // add entry at the beginning of the result map
        for (const key of this.data_.keys()) {
          // Concurrently iterating/deleting keys
          // iterator should handle this correctly
          if (!replacementMap.has(key)) {
            const deleted = this.delete(key);
            // Was the key removed?
            if (deleted) {
              // _keysAtom.reportChanged() was already called
              keysReportChangedCalled = true;
            } else {
              // Delete prevented by interceptor
              const value = this.data_.get(key);
              orderedData.set(key, value);
            }
          }
        }
        // Merge entries
        for (const [key, value] of replacementMap.entries()) {
          // We will want to know whether a new key is added
          const keyExisted = this.data_.has(key);
          // Add or update value
          this.set(key, value);
          // The addition could have been prevent by interceptor
          if (this.data_.has(key)) {
            // The update could have been prevented by interceptor
            // and also we want to preserve existing values
            // so use value from _data map (instead of replacement map)
            const _value = this.data_.get(key);
            orderedData.set(key, _value);
            // Was a new key added?
            if (!keyExisted) {
              // _keysAtom.reportChanged() was already called
              keysReportChangedCalled = true;
            }
          }
        }
        // Check for possible key order change
        if (!keysReportChangedCalled) {
          if (this.data_.size !== orderedData.size) {
            // If size differs, keys are definitely modified
            this.keysAtom_.reportChanged();
          } else {
            const iter1 = this.data_.keys();
            const iter2 = orderedData.keys();
            let next1 = iter1.next();
            let next2 = iter2.next();
            while (!next1.done) {
              if (next1.value !== next2.value) {
                this.keysAtom_.reportChanged();
                break;
              }
              next1 = iter1.next();
              next2 = iter2.next();
            }
          }
        }
        // Use correctly ordered map
        this.data_ = orderedData;
      });
      return this;
    }
    get size() {
      this.keysAtom_.reportObserved();
      return this.data_.size;
    }
    toString() {
      return "[object ObservableMap]";
    }
    toJSON() {
      return Array.from(this);
    }
    get [Symbol.toStringTag]() {
      return "Map";
    }
  }
  // eslint-disable-next-line
  var isObservableMap = /*#__PURE__*/createInstanceofPredicate("ObservableMap", ObservableMap);
  function makeIterableForMap(iterator) {
    iterator[Symbol.toStringTag] = "MapIterator";
    return makeIterable(iterator);
  }
  function convertToMap(dataStructure) {
    if (isES6Map(dataStructure) || isObservableMap(dataStructure)) {
      return dataStructure;
    } else if (Array.isArray(dataStructure)) {
      return new Map(dataStructure);
    } else if (isPlainObject(dataStructure)) {
      const map = new Map();
      for (const key in dataStructure) {
        map.set(key, dataStructure[key]);
      }
      return map;
    } else {
      return die(21, dataStructure);
    }
  }

  const ObservableSetMarker = {};
  class ObservableSet {
    constructor(initialData, enhancer = deepEnhancer, name_ = "ObservableSet") {
      this.name_ = void 0;
      this[$mobx] = ObservableSetMarker;
      this.data_ = new Set();
      this.atom_ = void 0;
      this.changeListeners_ = void 0;
      this.interceptors_ = void 0;
      this.dehancer = void 0;
      this.enhancer_ = void 0;
      this.name_ = name_;
      this.enhancer_ = (newV, oldV) => enhancer(newV, oldV, name_);
      initObservable(() => {
        this.atom_ = createAtom(this.name_);
        if (initialData) {
          this.replace(initialData);
        }
      });
    }
    dehanceValue_(value) {
      if (this.dehancer !== undefined) {
        return this.dehancer(value);
      }
      return value;
    }
    clear() {
      transaction(() => {
        untracked(() => {
          for (const value of this.data_.values()) {
            this.delete(value);
          }
        });
      });
    }
    forEach(callbackFn, thisArg) {
      for (const value of this) {
        callbackFn.call(thisArg, value, value, this);
      }
    }
    get size() {
      this.atom_.reportObserved();
      return this.data_.size;
    }
    add(value) {
      checkIfStateModificationsAreAllowed(this.atom_);
      if (hasInterceptors(this)) {
        const change = interceptChange(this, {
          type: ADD,
          object: this,
          newValue: value
        });
        if (!change) {
          return this;
        }
        // implemented reassignment same as it's done for ObservableMap
        value = change.newValue;
      }
      if (!this.has(value)) {
        transaction(() => {
          this.data_.add(this.enhancer_(value, undefined));
          this.atom_.reportChanged();
        });
        const notifySpy = __MOBX_DEV__;
        const notify = hasListeners(this);
        const change = notify || notifySpy ? {
          observableKind: "set",
          debugObjectName: this.name_,
          type: ADD,
          object: this,
          newValue: value
        } : null;
        if (notify) {
          notifyListeners(this, change);
        }
      }
      return this;
    }
    delete(value) {
      if (hasInterceptors(this)) {
        const change = interceptChange(this, {
          type: DELETE,
          object: this,
          oldValue: value
        });
        if (!change) {
          return false;
        }
      }
      if (this.has(value)) {
        const notifySpy = __MOBX_DEV__;
        const notify = hasListeners(this);
        const change = notify || notifySpy ? {
          observableKind: "set",
          debugObjectName: this.name_,
          type: DELETE,
          object: this,
          oldValue: value
        } : null;
        transaction(() => {
          this.atom_.reportChanged();
          this.data_.delete(value);
        });
        if (notify) {
          notifyListeners(this, change);
        }
        return true;
      }
      return false;
    }
    has(value) {
      this.atom_.reportObserved();
      return this.data_.has(this.dehanceValue_(value));
    }
    entries() {
      const values = this.values();
      return makeIterableForSet({
        next() {
          const {
            value,
            done
          } = values.next();
          return !done ? {
            value: [value, value],
            done
          } : {
            value: undefined,
            done
          };
        }
      });
    }
    keys() {
      return this.values();
    }
    values() {
      this.atom_.reportObserved();
      const self = this;
      const values = this.data_.values();
      return makeIterableForSet({
        next() {
          const {
            value,
            done
          } = values.next();
          return !done ? {
            value: self.dehanceValue_(value),
            done
          } : {
            value: undefined,
            done
          };
        }
      });
    }
    intersection(otherSet) {
      return new Set(this).intersection(otherSet);
    }
    union(otherSet) {
      return new Set(this).union(otherSet);
    }
    difference(otherSet) {
      return new Set(this).difference(otherSet);
    }
    symmetricDifference(otherSet) {
      return new Set(this).symmetricDifference(otherSet);
    }
    isSubsetOf(otherSet) {
      return new Set(this).isSubsetOf(otherSet);
    }
    isSupersetOf(otherSet) {
      return new Set(this).isSupersetOf(otherSet);
    }
    isDisjointFrom(otherSet) {
      return new Set(this).isDisjointFrom(otherSet);
    }
    replace(other) {
      if (isObservableSet(other)) {
        other = new Set(other);
      }
      if (Array.isArray(other) || isES6Set(other)) {
        // Only emit `delete`/`add` events (and `reportChanged`) for values that
        // actually change, instead of clearing and re-adding everything. `add` and
        // `delete` are already no-ops for values that are respectively already
        // present or already absent, so we just need to avoid deleting values that
        // are part of the replacement. See #3761.
        transaction(() => {
          // Collect the desired values for quick lookup. `other` is already a Set
          // here when it was passed (or snapshotted from an observable set) as one,
          // so reuse it rather than allocating another; arrays are wrapped (which
          // also dedupes them).
          const replacementValues = isES6Set(other) ? other : new Set(other);
          // Short-circuit the trivial cases: an empty replacement is just a clear,
          // and replacing into an empty set only needs the adds.
          if (replacementValues.size === 0) {
            this.clear();
            return;
          }
          if (this.data_.size === 0) {
            replacementValues.forEach(value => this.add(value));
            return;
          }
          // Delete values that are not part of the replacement.
          for (const value of this.data_.values()) {
            if (!replacementValues.has(this.dehanceValue_(value))) {
              this.delete(value);
            }
          }
          // Add new values; values that are already present are a no-op.
          replacementValues.forEach(value => this.add(value));
        });
      } else if (other !== null && other !== undefined) {
        die(41, other);
      }
      return this;
    }
    toJSON() {
      return Array.from(this);
    }
    toString() {
      return "[object ObservableSet]";
    }
    [Symbol.iterator]() {
      return this.values();
    }
    get [Symbol.toStringTag]() {
      return "Set";
    }
  }
  // eslint-disable-next-line
  var isObservableSet = /*#__PURE__*/createInstanceofPredicate("ObservableSet", ObservableSet);
  function makeIterableForSet(iterator) {
    iterator[Symbol.toStringTag] = "SetIterator";
    return makeIterable(iterator);
  }

  const descriptorCache = /*#__PURE__*/Object.create(null);
  const REMOVE = "remove";
  class ObservableObjectAdministration {
    constructor(target_, values_ = new Map(), name_,
    // Used anytime annotation is not explicitely provided
    defaultAnnotation_ = autoAnnotation) {
      this.target_ = void 0;
      this.values_ = void 0;
      this.name_ = void 0;
      this.defaultAnnotation_ = void 0;
      this.keysAtom_ = void 0;
      this.changeListeners_ = void 0;
      this.interceptors_ = void 0;
      this.proxy_ = void 0;
      this.isPlainObject_ = void 0;
      this.appliedAnnotations_ = void 0;
      this.pendingKeys_ = void 0;
      this.lazyComputedKeys_ = void 0;
      this.lazyObservableKeys_ = void 0;
      this.target_ = target_;
      this.values_ = values_;
      this.name_ = name_;
      this.defaultAnnotation_ = defaultAnnotation_;
      this.keysAtom_ = new Atom("ObservableObject.keys");
      // Optimization: we use this frequently
      this.isPlainObject_ = isPlainObject(this.target_);
    }
    getObservablePropValue_(key) {
      var _ref, _this$values_$get;
      // Hot path: single map lookup. Lazy entries (rare) take the materialise branch.
      const observable = (_ref = (_this$values_$get = this.values_.get(key)) != null ? _this$values_$get : this.materializeLazyComputed_(key)) != null ? _ref : this.materializeLazyObservable_(key);
      return observable.get();
    }
    materializeLazyComputed_(key) {
      var _this$lazyComputedKey;
      const factory = (_this$lazyComputedKey = this.lazyComputedKeys_) == null ? void 0 : _this$lazyComputedKey.get(key);
      if (!factory) {
        return undefined;
      }
      this.lazyComputedKeys_.delete(key);
      if (this.lazyComputedKeys_.size === 0) {
        this.lazyComputedKeys_ = undefined;
      }
      const computed = factory();
      this.values_.set(key, computed);
      return computed;
    }
    materializeLazyObservable_(key) {
      var _this$lazyObservableK;
      const factory = (_this$lazyObservableK = this.lazyObservableKeys_) == null ? void 0 : _this$lazyObservableK.get(key);
      if (!factory) {
        return undefined;
      }
      this.lazyObservableKeys_.delete(key);
      if (this.lazyObservableKeys_.size === 0) {
        this.lazyObservableKeys_ = undefined;
      }
      const observable = factory();
      this.values_.set(key, observable);
      return observable;
    }
    setObservablePropValue_(key, newValue) {
      var _ref2, _this$values_$get2;
      const observable = (_ref2 = (_this$values_$get2 = this.values_.get(key)) != null ? _this$values_$get2 : this.materializeLazyComputed_(key)) != null ? _ref2 : this.materializeLazyObservable_(key);
      if (observable instanceof ComputedValue) {
        observable.set(newValue);
        return true;
      }
      // intercept
      if (hasInterceptors(this)) {
        const change = interceptChange(this, {
          type: UPDATE,
          object: this.proxy_ || this.target_,
          name: key,
          newValue
        });
        if (!change) {
          return null;
        }
        newValue = change.newValue;
      }
      newValue = observable.prepareNewValue_(newValue);
      // notify spy & observers
      if (newValue !== globalState.UNCHANGED) {
        const notify = hasListeners(this);
        const notifySpy = __MOBX_DEV__;
        const change = notify || notifySpy ? {
          type: UPDATE,
          observableKind: "object",
          debugObjectName: this.name_,
          object: this.proxy_ || this.target_,
          oldValue: observable.value_,
          name: key,
          newValue
        } : null;
        observable.setNewValue_(newValue);
        if (notify) {
          notifyListeners(this, change);
        }
      }
      return true;
    }
    get_(key) {
      if (globalState.trackingDerivation && !hasProp(this.target_, key)) {
        // Key doesn't exist yet, subscribe for it in case it's added later
        this.has_(key);
      }
      return this.target_[key];
    }
    /**
     * @param {PropertyKey} key
     * @param {any} value
     * @param {Annotation|boolean} annotation true - use default annotation, false - copy as is
     * @param {boolean} proxyTrap whether it's called from proxy trap
     * @returns {boolean|null} true on success, false on failure (proxyTrap + non-configurable), null when cancelled by interceptor
     */
    set_(key, value, proxyTrap = false) {
      // Don't use .has(key) - we care about own
      if (hasProp(this.target_, key)) {
        // Existing prop
        if (this.values_.has(key)) {
          // Observable (can be intercepted)
          return this.setObservablePropValue_(key, value);
        } else if (proxyTrap) {
          // Non-observable - proxy
          return Reflect.set(this.target_, key, value);
        } else {
          // Non-observable
          this.target_[key] = value;
          return true;
        }
      } else {
        // New prop
        return this.extend_(key, {
          value,
          enumerable: true,
          writable: true,
          configurable: true
        }, this.defaultAnnotation_, proxyTrap);
      }
    }
    // Trap for "in"
    has_(key) {
      if (!globalState.trackingDerivation) {
        // Skip key subscription outside derivation
        return key in this.target_;
      }
      this.pendingKeys_ || (this.pendingKeys_ = new Map());
      let entry = this.pendingKeys_.get(key);
      if (!entry) {
        entry = new ObservableValue(key in this.target_, referenceEnhancer, "ObservableObject.key?", false);
        this.pendingKeys_.set(key, entry);
      }
      return entry.get();
    }
    /**
     * @param {PropertyKey} key
     * @param {PropertyDescriptor} descriptor
     * @param {Annotation|boolean} annotation true - use default annotation, false - copy as is
     * @param {boolean} proxyTrap whether it's called from proxy trap
     * @returns {boolean|null} true on success, false on failure (proxyTrap + non-configurable), null when cancelled by interceptor
     */
    extend_(key, descriptor, annotation, proxyTrap = false) {
      if (annotation === true) {
        annotation = this.defaultAnnotation_;
      }
      if (annotation === false) {
        return this.defineProperty_(key, descriptor, proxyTrap);
      }
      const outcome = annotation.extend_(this, key, descriptor, proxyTrap);
      return outcome;
    }
    /**
     * @param {PropertyKey} key
     * @param {PropertyDescriptor} descriptor
     * @param {boolean} proxyTrap whether it's called from proxy trap
     * @returns {boolean|null} true on success, false on failure (proxyTrap + non-configurable), null when cancelled by interceptor
     */
    defineProperty_(key, descriptor, proxyTrap = false) {
      checkIfStateModificationsAreAllowed(this.keysAtom_);
      try {
        startBatch();
        // Delete
        const deleteOutcome = this.delete_(key);
        if (!deleteOutcome) {
          // Failure or intercepted
          return deleteOutcome;
        }
        // ADD interceptor
        if (hasInterceptors(this)) {
          const change = interceptChange(this, {
            object: this.proxy_ || this.target_,
            name: key,
            type: ADD,
            newValue: descriptor.value
          });
          if (!change) {
            return null;
          }
          const {
            newValue
          } = change;
          if (descriptor.value !== newValue) {
            descriptor = assign({}, descriptor, {
              value: newValue
            });
          }
        }
        // Define
        if (proxyTrap) {
          if (!Reflect.defineProperty(this.target_, key, descriptor)) {
            return false;
          }
        } else {
          defineProperty(this.target_, key, descriptor);
        }
        // Notify
        this.notifyPropertyAddition_(key, descriptor.value);
      } finally {
        endBatch();
      }
      return true;
    }
    // If original descriptor becomes relevant, move this to annotation directly
    defineObservableProperty_(key, value, enhancer, proxyTrap = false) {
      checkIfStateModificationsAreAllowed(this.keysAtom_);
      try {
        startBatch();
        // Delete
        const deleteOutcome = this.delete_(key);
        if (!deleteOutcome) {
          // Failure or intercepted
          return deleteOutcome;
        }
        // ADD interceptor
        if (hasInterceptors(this)) {
          const change = interceptChange(this, {
            object: this.proxy_ || this.target_,
            name: key,
            type: ADD,
            newValue: value
          });
          if (!change) {
            return null;
          }
          value = change.newValue;
        }
        const cachedDescriptor = getCachedObservablePropDescriptor(key);
        const descriptor = {
          configurable: globalState.safeDescriptors ? this.isPlainObject_ : true,
          enumerable: true,
          get: cachedDescriptor.get,
          set: cachedDescriptor.set
        };
        // Define
        if (proxyTrap) {
          if (!Reflect.defineProperty(this.target_, key, descriptor)) {
            return false;
          }
        } else {
          defineProperty(this.target_, key, descriptor);
        }
        const observable = new ObservableValue(value, enhancer, __MOBX_DEV__ ? `${this.name_}.${key.toString()}` : "ObservableObject.key", false);
        this.values_.set(key, observable);
        // Notify (value possibly changed by ObservableValue)
        this.notifyPropertyAddition_(key, observable.value_);
      } finally {
        endBatch();
      }
      return true;
    }
    // If original descriptor becomes relevant, move this to annotation directly
    defineComputedProperty_(key, options, proxyTrap = false) {
      checkIfStateModificationsAreAllowed(this.keysAtom_);
      try {
        startBatch();
        // Delete
        const deleteOutcome = this.delete_(key);
        if (!deleteOutcome) {
          // Failure or intercepted
          return deleteOutcome;
        }
        // ADD interceptor
        if (hasInterceptors(this)) {
          const change = interceptChange(this, {
            object: this.proxy_ || this.target_,
            name: key,
            type: ADD,
            newValue: undefined
          });
          if (!change) {
            return null;
          }
        }
        options.name || (options.name = __MOBX_DEV__ ? `${this.name_}.${key.toString()}` : "ObservableObject.key");
        options.context = this.proxy_ || this.target_;
        const cachedDescriptor = getCachedObservablePropDescriptor(key);
        const descriptor = {
          configurable: globalState.safeDescriptors ? this.isPlainObject_ : true,
          enumerable: false,
          get: cachedDescriptor.get,
          set: cachedDescriptor.set
        };
        // Define
        if (proxyTrap) {
          if (!Reflect.defineProperty(this.target_, key, descriptor)) {
            return false;
          }
        } else {
          defineProperty(this.target_, key, descriptor);
        }
        this.values_.set(key, new ComputedValue(options));
        // Notify
        this.notifyPropertyAddition_(key, undefined);
      } finally {
        endBatch();
      }
      return true;
    }
    /**
     * @param {PropertyKey} key
     * @param {PropertyDescriptor} descriptor
     * @param {boolean} proxyTrap whether it's called from proxy trap
     * @returns {boolean|null} true on success, false on failure (proxyTrap + non-configurable), null when cancelled by interceptor
     */
    delete_(key, proxyTrap = false) {
      checkIfStateModificationsAreAllowed(this.keysAtom_);
      // No such prop
      if (!hasProp(this.target_, key)) {
        return true;
      }
      // Intercept
      if (hasInterceptors(this)) {
        const change = interceptChange(this, {
          object: this.proxy_ || this.target_,
          name: key,
          type: REMOVE
        });
        // Cancelled
        if (!change) {
          return null;
        }
      }
      // Delete
      try {
        var _this$pendingKeys_;
        startBatch();
        const notify = hasListeners(this);
        const notifySpy = __MOBX_DEV__ && isSpyEnabled();
        const observable = this.values_.get(key);
        // Value needed for spies/listeners
        let value = undefined;
        // Optimization: don't pull the value unless we will need it
        if (!observable && (notify || notifySpy)) {
          var _getDescriptor;
          value = (_getDescriptor = getDescriptor(this.target_, key)) == null ? void 0 : _getDescriptor.value;
        }
        // delete prop (do first, may fail)
        if (proxyTrap) {
          if (!Reflect.deleteProperty(this.target_, key)) {
            return false;
          }
        } else {
          delete this.target_[key];
        }
        // Allow re-annotating this field
        if (__MOBX_DEV__) ;
        // Clear observable
        if (observable) {
          this.values_.delete(key);
          // for computed, value is undefined
          if (observable instanceof ObservableValue) {
            value = observable.value_;
          }
          // Notify: autorun(() => obj[key]), see #1796
          propagateChanged(observable);
        }
        // Notify "keys/entries/values" observers
        this.keysAtom_.reportChanged();
        // Notify "has" observers
        // "in" as it may still exist in proto
        (_this$pendingKeys_ = this.pendingKeys_) == null || (_this$pendingKeys_ = _this$pendingKeys_.get(key)) == null || _this$pendingKeys_.set(key in this.target_);
        // Notify spies/listeners
        if (notify || notifySpy) {
          const change = {
            type: REMOVE,
            observableKind: "object",
            object: this.proxy_ || this.target_,
            debugObjectName: this.name_,
            oldValue: value,
            name: key
          };
          if (__MOBX_DEV__ && notifySpy) ;
          if (notify) {
            notifyListeners(this, change);
          }
          if (__MOBX_DEV__ && notifySpy) ;
        }
      } finally {
        endBatch();
      }
      return true;
    }
    notifyPropertyAddition_(key, value) {
      var _this$pendingKeys_2;
      const notify = hasListeners(this);
      const notifySpy = __MOBX_DEV__;
      if (notify || notifySpy) {
        const change = notify || notifySpy ? {
          type: ADD,
          observableKind: "object",
          debugObjectName: this.name_,
          object: this.proxy_ || this.target_,
          name: key,
          newValue: value
        } : null;
        if (notify) {
          notifyListeners(this, change);
        }
      }
      (_this$pendingKeys_2 = this.pendingKeys_) == null || (_this$pendingKeys_2 = _this$pendingKeys_2.get(key)) == null || _this$pendingKeys_2.set(true);
      // Notify "keys/entries/values" observers
      this.keysAtom_.reportChanged();
    }
    ownKeys_() {
      this.keysAtom_.reportObserved();
      return ownKeys(this.target_);
    }
    keys_() {
      // Returns enumerable && own, but unfortunately keysAtom will report on ANY key change.
      // There is no way to distinguish between Object.keys(object) and Reflect.ownKeys(object) - both are handled by ownKeys trap.
      // We can either over-report in Object.keys(object) or under-report in Reflect.ownKeys(object)
      // We choose to over-report in Object.keys(object), because:
      // - typically it's used with simple data objects
      // - when symbolic/non-enumerable keys are relevant Reflect.ownKeys works as expected
      this.keysAtom_.reportObserved();
      return Object.keys(this.target_);
    }
  }
  function asObservableObject(target, options) {
    var _options$name;
    if (hasProp(target, $mobx)) {
      return target;
    }
    const name = (_options$name = options == null ? void 0 : options.name) != null ? _options$name : "ObservableObject";
    const adm = new ObservableObjectAdministration(target, new Map(), String(name), getAnnotationFromOptions(options));
    addHiddenProp(target, $mobx, adm);
    return target;
  }
  const isObservableObjectAdministration = /*#__PURE__*/createInstanceofPredicate("ObservableObjectAdministration", ObservableObjectAdministration);
  function getCachedObservablePropDescriptor(key) {
    return descriptorCache[key] || (descriptorCache[key] = {
      get() {
        return this[$mobx].getObservablePropValue_(key);
      },
      set(value) {
        return this[$mobx].setObservablePropValue_(key, value);
      }
    });
  }
  function isObservableObject(thing) {
    if (isObject(thing)) {
      return isObservableObjectAdministration(thing[$mobx]);
    }
    return false;
  }
  /**
   * Helper function for initializing observable structures, it applies:
   * 1. allowStateChanges so we don't violate enforceActions.
   * 2. untracked so we don't accidentaly subscribe to anything observable accessed during init in case the observable is created inside derivation.
   * 3. batch to avoid state version updates
   */
  function initObservable(cb) {
    const derivation = untrackedStart();
    startBatch();
    try {
      return cb();
    } finally {
      endBatch();
      untrackedEnd(derivation);
    }
  }

  var _globalThis$Iterator;
  // safely get iterator prototype if available
  const maybeIteratorPrototype = ((_globalThis$Iterator = globalThis.Iterator) == null ? void 0 : _globalThis$Iterator.prototype) || {};
  function makeIterable(iterator) {
    iterator[Symbol.iterator] = getSelf;
    return assign(Object.create(maybeIteratorPrototype), iterator);
  }
  function getSelf() {
    return this;
  }

  class EventEmitter {
    constructor() {
      this.listeners = [];
    }
    on(cb) {
      this.listeners.push(cb);
      return () => {
        const index = this.listeners.indexOf(cb);
        if (index !== -1) {
          this.listeners.splice(index, 1);
        }
      };
    }
    emit(data) {
      const listeners = this.listeners;
      for (let i = 0, len = listeners.length; i < len; ++i) {
        listeners[i](data);
      }
    }
  }
  function warning(message) {
    console.error(message);
  }
  const KNOWN_STATICS = {
    childContextTypes: true,
    contextType: true,
    contextTypes: true,
    defaultProps: true,
    displayName: true,
    getDefaultProps: true,
    getDerivedStateFromError: true,
    getDerivedStateFromProps: true,
    mixins: true,
    propTypes: true,
    type: true,
    // KNOWN STATICS
    name: true,
    length: true,
    prototype: true,
    caller: true,
    callee: true,
    arguments: true,
    arity: true
  };
  function hoistStaticProperties(targetComponent, sourceComponent) {
    // don't hoist over string (html) components
    const keys = Object.getOwnPropertyNames(sourceComponent);
    for (let i = 0; i < keys.length; ++i) {
      const key = keys[i];
      if (!KNOWN_STATICS[key]) {
        targetComponent[key] = sourceComponent[key];
      }
    }
  }
  function isStateless(component) {
    return !component.prototype?.render;
  }
  let warnedAboutObserverInjectDeprecation = false;
  /**
   * Errors reporter
   */
  const errorsReporter = new EventEmitter();
  /**
   * Utilities
   */
  function patch(target, funcName, runMixinFirst) {
    const base = target[funcName];
    const mixinFunc = reactiveMixin[funcName];
    const f = !base ? mixinFunc : runMixinFirst === true ? function (...args) {
      mixinFunc.apply(this, ...args);
      base.apply(this, ...args);
    } : function (...args) {
      base.apply(this, ...args);
      mixinFunc.apply(this, ...args);
    };
    // MWE: ideally we freeze here to protect against accidental overwrites in component instances, see #195
    // ...but that breaks react-hot-loader, see #231...
    target[funcName] = f;
  }
  function isObjectShallowModified(prev, next) {
    if (prev == null || next == null || typeof prev !== 'object' || typeof next !== 'object') {
      return prev !== next;
    }
    const keys = Object.keys(prev);
    if (keys.length !== Object.keys(next).length) {
      return true;
    }
    let key;
    for (let i = keys.length - 1; i >= 0; i--) {
      key = keys[i];
      if (next[key] !== prev[key]) {
        return true;
      }
    }
    return false;
  }
  /**
   * ReactiveMixin
   */
  const reactiveMixin = {
    componentWillMount() {
      // Generate friendly name for debugging
      const initialName = this.displayName || this.name || this.constructor && (this.constructor.displayName || this.constructor.name) || '<component>';
      /**
       * If props are shallowly modified, React will render anyway,
       * so atom.reportChanged() should not result in yet another re-render
       */
      let skipRender = false;
      /**
       * forceUpdate will re-assign this.props. We don't want that to cause a loop,
       * so detect these changes
       */
      function makePropertyObservableReference(propName) {
        let valueHolder = this[propName];
        const atom = createAtom('reactive ' + propName);
        Object.defineProperty(this, propName, {
          configurable: true,
          enumerable: true,
          get() {
            atom.reportObserved();
            return valueHolder;
          },
          set(v) {
            if (isObjectShallowModified(valueHolder, v)) {
              valueHolder = v;
              skipRender = true;
              atom.reportChanged();
              skipRender = false;
            } else {
              valueHolder = v;
            }
          }
        });
      }
      // make this.props an observable reference, see #124
      makePropertyObservableReference.call(this, 'props');
      // make state an observable reference
      makePropertyObservableReference.call(this, 'state');
      // wire up reactive render
      const render = this.render.bind(this);
      const baseRender = () => render(this.props, this.state, this.context);
      let reaction = null;
      let isRenderingPending = false;
      const initialRender = () => {
        reaction = new Reaction(`${initialName}.render()`, () => {
          if (!isRenderingPending) {
            // N.B. Getting here *before mounting* means that a component constructor has side effects (see the relevant test in misc.js)
            // This unidiomatic React usage but React will correctly warn about this so we continue as usual
            // See #85 / Pull #44
            isRenderingPending = true;
            if (typeof this.componentWillReact === 'function') {
              this.componentWillReact(); // TODO: wrap in action?
            }
            if (!skipRender) {
              this.forceUpdate();
            }
          }
        });
        reaction.reactComponent = this;
        reactiveRender.$mobx = reaction;
        reactiveRender.$base = this.render;
        this.render = reactiveRender;
        return reactiveRender();
      };
      const reactiveRender = () => {
        isRenderingPending = false;
        let exception;
        let rendering = null;
        reaction.track(() => {
          try {
            rendering = allowStateChanges(false, baseRender);
          } catch (e) {
            exception = e;
          }
        });
        if (exception) {
          errorsReporter.emit(exception);
          throw exception;
        }
        return rendering;
      };
      this.render = initialRender;
    },
    componentWillUnmount() {
      if (this.render.$mobx) {
        this.render.$mobx.dispose();
        this.render = this.render.$base;
      }
    },
    componentDidMount() {
    },
    componentDidUpdate() {
    },
    shouldComponentUpdate(nextProps, nextState) {
      // update on any state changes (as is the default)
      if (this.state !== nextState) {
        return true;
      }
      // update if props are shallowly not equal, inspired by PureRenderMixin
      // we could return just 'false' here, and avoid the `skipRender` checks etc
      // however, it is nicer if lifecycle events are triggered like usually,
      // so we return true here if props are shallowly modified.
      return isObjectShallowModified(this.props, nextProps);
    }
  };
  function observer(arg1, arg2) {
    if (typeof arg1 === 'string') {
      throw new Error('Store names should be provided as array');
    }
    if (Array.isArray(arg1)) {
      // component needs stores
      if (!warnedAboutObserverInjectDeprecation) {
        warnedAboutObserverInjectDeprecation = true;
        warning('Mobx observer: Using observer to inject stores is deprecated since 4.0. Use `@inject("store1", "store2") @observer ComponentClass` or `inject("store1", "store2")(observer(componentClass))` instead of `@observer(["store1", "store2"]) ComponentClass`');
      }
      if (!arg2) {
        // invoked as decorator
        return componentClass => observer(arg1, componentClass);
      } else {
        // eslint-disable-next-line prefer-spread
        return inject.apply(null, arg1)(observer(arg2));
      }
    }
    const component = arg1;
    if (component.isMobxInjector === true) {
      warning("Mobx observer: You are trying to use 'observer' on a component that already has 'inject'. Please apply 'observer' before applying 'inject'");
    }
    // Stateless function component:
    // If it is function but doesn't seem to be a React class constructor,
    // wrap it to a React class automatically
    if (typeof component === 'function' && !component.prototype?.render) {
      var _Class;
      return observer((_Class = class extends Component {
        render(props, _state, context) {
          return component(props, context);
        }
      }, _Class.displayName = component.displayName || component.name, _Class.defaultProps = component.defaultProps, _Class));
    }
    if (!component) {
      throw new Error("Please pass a valid component to 'observer'");
    }
    const target = component.prototype || component;
    mixinLifecycleEvents(target);
    component.isMobXReactObserver = true;
    return component;
  }
  function mixinLifecycleEvents(target) {
    patch(target, 'componentWillMount', true);
    patch(target, 'componentDidMount', false);
    patch(target, 'componentWillUnmount', false);
    patch(target, 'componentDidUpdate', false);
    if (!target.shouldComponentUpdate) {
      target.shouldComponentUpdate = reactiveMixin.shouldComponentUpdate;
    }
  }
  // TODO: support injection somehow as well?
  const Observer = observer(({
    children
  }) => children());
  Observer.displayName = 'Observer';
  const proxiedInjectorProps = {
    isMobxInjector: {
      configurable: true,
      enumerable: true,
      value: true,
      writable: true
    }
  };
  /**
   * Store Injection
   */
  function createStoreInjector(grabStoresFn, component, injectNames) {
    let displayName = 'inject-' + (component.displayName || component.name || component.constructor?.name || 'Unknown');
    if (injectNames) {
      displayName += '-with-' + injectNames;
    }
    class Injector extends Component {
      constructor(props, context) {
        super(props, context);
        this.wrappedInstance = void 0;
        this.storeRef = this.storeRef.bind(this);
      }
      storeRef(instance) {
        this.wrappedInstance = instance;
      }
      render(props, _state, context) {
        // Optimization: it might be more efficient to apply the mapper function *outside* the render method
        // (if the mapper is a function), that could avoid expensive(?) re-rendering of the injector component
        // See this test: 'using a custom injector is not too reactive' in inject.js
        const newProps = {};
        let key;
        for (key in props) {
          newProps[key] = props[key];
        }
        const additionalProps = grabStoresFn(context.mobxStores || {}, newProps, context) || {};
        for (key in additionalProps) {
          newProps[key] = additionalProps[key];
        }
        return createComponentVNode(2 /* VNodeFlags.ComponentUnknown */, component, newProps, null, isStateless(component) ? null : this.storeRef);
      }
    }
    // Static fields from component should be visible on the generated Injector
    Injector.displayName = displayName;
    Injector.wrappedComponent = void 0;
    Injector.isMobxInjector = false;
    hoistStaticProperties(Injector, component);
    Injector.wrappedComponent = component;
    Object.defineProperties(Injector, proxiedInjectorProps);
    return Injector;
  }
  function grabStoresByName(storeNames) {
    return function (baseStores, nextProps) {
      for (let i = 0, len = storeNames.length; i < len; ++i) {
        const storeName = storeNames[i];
        if (!(storeName in nextProps)) {
          nextProps[storeName] = baseStores[storeName];
        }
      }
      return nextProps;
    };
  }
  function inject(/* fn(stores, nextProps) or ...storeNames */...args) {
    let grabStoresFn;
    if (typeof args[0] === 'function') {
      grabStoresFn = args[0];
      return function (componentClass) {
        let injected = createStoreInjector(grabStoresFn, componentClass);
        injected.isMobxInjector = false; // supress warning
        // mark the Injector as observer, to make it react to expressions in `grabStoresFn`,
        // see #111
        injected = observer(injected);
        injected.isMobxInjector = true; // restore warning
        return injected;
      };
    } else {
      const storeNames = [];
      for (let i = 0; i < args.length; ++i) {
        storeNames.push(args[i]);
      }
      grabStoresFn = grabStoresByName(storeNames);
      return function (componentClass) {
        return createStoreInjector(grabStoresFn, componentClass, storeNames.join('-'));
      };
    }
  }
  function makeObserverRender(update, render, name) {
    const reactor = new Reaction(name, update);
    const track = reactor.track.bind(reactor);
    const observer = function (...parameters) {
      let rendered;
      let caught;
      track(() => {
        try {
          rendered = render.apply(this, parameters);
        } catch (error) {
          caught = error;
        }
      });
      if (caught) {
        throw caught;
      } else {
        return rendered;
      }
    };
    observer.dispose = reactor.dispose.bind(reactor);
    return observer;
  }
  /**
   * Turns a class Component into a MobX observer.
   * @param clazz The constructor of the class to patch as a MobX observer.
   */
  function observerPatch(clazz) {
    const proto = clazz.prototype;
    const base = proto.render;
    const name = clazz.name;
    proto.render = function (...parameters) {
      const update = this.forceUpdate.bind(this, undefined);
      const render = makeObserverRender(update, base, `${this.displayName || name}.render()`);
      this.render = render;
      return render.apply(this, parameters);
    };
    if (proto.componentWillUnmount) {
      const unmount = proto.componentWillUnmount;
      proto.componentWillUnmount = function () {
        this.render.dispose();
        this.render = base;
        unmount.call(this);
      };
    } else {
      proto.componentWillUnmount = function () {
        this.render.dispose();
        this.render = base;
      };
    }
  }
  function callDispose({
    dispose
  }) {
    dispose();
  }
  function innerVNode(type, properties) {
    const ref = {
      onComponentDidUpdate: callDispose,
      onComponentWillUnmount: properties.dispose
    };
    return createComponentVNode(8 /* VNodeFlags.ComponentFunction */, type, properties, undefined, ref);
  }
  function makeProxy(target) {
    return {
      get $V() {
        return target.children;
      },
      set $V(value) {
        target.children = value;
      }
    };
  }
  function getUpdateHooks(ref, props) {
    let onComponentDidUpdate = null;
    let onComponentWillUpdate = null;
    if (ref) {
      if (ref.onComponentDidUpdate) {
        onComponentDidUpdate = ref.onComponentDidUpdate.bind(ref, props, props);
      }
      if (ref.onComponentWillUpdate) {
        onComponentWillUpdate = ref.onComponentWillUpdate.bind(ref, props, props);
      }
    }
    return [onComponentDidUpdate, onComponentWillUpdate];
  }
  function observerWrap(base) {
    function tracked({
      context,
      props,
      self,
      track
    }) {
      let result;
      let caught;
      track(() => {
        try {
          result = base.call(self, props, context);
        } catch (error) {
          caught = error;
        }
      });
      if (caught) {
        throw caught;
      }
      return result;
    }
    function wrapper(props, context) {
      const [onComponentDidUpdate, onComponentWillUpdate] = getUpdateHooks(this.ref, props);
      // eslint-disable-next-line prefer-const
      let proxy;
      const reaction = new Reaction(base.name, () => {
        let next;
        if (onComponentWillUpdate) {
          onComponentWillUpdate();
        }
        reaction.track(() => {
          next = normalizeRoot(base.call(this, props, context));
        });
        if (next) {
          // indirectly call patch as inferno does not export patch
          render(next, proxy, onComponentDidUpdate, context);
        }
      });
      const inner = innerVNode(tracked, {
        context,
        dispose: reaction.dispose.bind(reaction),
        props,
        self: this,
        track: reaction.track.bind(reaction)
      });
      proxy = makeProxy(inner);
      return inner;
    }
    wrapper.defaultProps = base.defaultProps;
    wrapper.defaultHooks = base.defaultHooks;
    return wrapper;
  }

  /* If editing these values check babel-plugin-also */
  var VNodeFlags;
  (function (VNodeFlags) {
    /* First set of bits define shape of vNode */
    VNodeFlags[VNodeFlags["Unknown"] = 0] = "Unknown";
    VNodeFlags[VNodeFlags["HtmlElement"] = 1] = "HtmlElement";
    VNodeFlags[VNodeFlags["ComponentUnknown"] = 2] = "ComponentUnknown";
    VNodeFlags[VNodeFlags["ComponentClass"] = 4] = "ComponentClass";
    VNodeFlags[VNodeFlags["ComponentFunction"] = 8] = "ComponentFunction";
    VNodeFlags[VNodeFlags["Text"] = 16] = "Text";
    /* Special flags */
    VNodeFlags[VNodeFlags["SvgElement"] = 32] = "SvgElement";
    VNodeFlags[VNodeFlags["InputElement"] = 64] = "InputElement";
    VNodeFlags[VNodeFlags["TextareaElement"] = 128] = "TextareaElement";
    VNodeFlags[VNodeFlags["SelectElement"] = 256] = "SelectElement";
    VNodeFlags[VNodeFlags["Portal"] = 1024] = "Portal";
    VNodeFlags[VNodeFlags["ReCreate"] = 2048] = "ReCreate";
    VNodeFlags[VNodeFlags["ContentEditable"] = 4096] = "ContentEditable";
    VNodeFlags[VNodeFlags["Fragment"] = 8192] = "Fragment";
    VNodeFlags[VNodeFlags["InUse"] = 16384] = "InUse";
    VNodeFlags[VNodeFlags["ForwardRef"] = 32768] = "ForwardRef";
    VNodeFlags[VNodeFlags["Normalized"] = 65536] = "Normalized";
    /* Masks */
    VNodeFlags[VNodeFlags["ForwardRefComponent"] = 32776] = "ForwardRefComponent";
    VNodeFlags[VNodeFlags["FormElement"] = 448] = "FormElement";
    VNodeFlags[VNodeFlags["Element"] = 481] = "Element";
    VNodeFlags[VNodeFlags["Component"] = 14] = "Component";
    VNodeFlags[VNodeFlags["DOMRef"] = 1521] = "DOMRef";
    VNodeFlags[VNodeFlags["InUseOrNormalized"] = 81920] = "InUseOrNormalized";
    VNodeFlags[VNodeFlags["ClearInUse"] = -16385] = "ClearInUse";
    VNodeFlags[VNodeFlags["ComponentKnown"] = 12] = "ComponentKnown";
  })(VNodeFlags || (VNodeFlags = {}));
  // Combinations are not possible, its bitwise only to reduce vNode size
  var ChildFlags;
  (function (ChildFlags) {
    ChildFlags[ChildFlags["UnknownChildren"] = 0] = "UnknownChildren";
    /* Second set of bits define shape of children */
    ChildFlags[ChildFlags["HasInvalidChildren"] = 1] = "HasInvalidChildren";
    ChildFlags[ChildFlags["HasVNodeChildren"] = 2] = "HasVNodeChildren";
    ChildFlags[ChildFlags["HasNonKeyedChildren"] = 4] = "HasNonKeyedChildren";
    ChildFlags[ChildFlags["HasKeyedChildren"] = 8] = "HasKeyedChildren";
    ChildFlags[ChildFlags["HasTextChildren"] = 16] = "HasTextChildren";
    ChildFlags[ChildFlags["MultipleChildren"] = 12] = "MultipleChildren";
  })(ChildFlags || (ChildFlags = {}));

  // import { startFPSMonitor, startMemMonitor, initProfiler, startProfile, endProfile } from 'perf-monitor';
  let counter = 0;
  const data = (() => {
    const generate = () => {
      const nbQueries = Math.floor(Math.random() * 10 + 1);
      const queries = [];
      for (let l = 0; l < 12; l++) {
        queries.push(updateQuery({
          query: '***',
          formatElapsed: '',
          elapsedClassName: '',
          elapsed: null,
          waiting: null
        }));
      }
      return {
        nbQueries,
        countClassName: countClassName(nbQueries),
        queries: queries
      };
    };
    const temp = [];
    for (let i = 1; i <= 50; i++) {
      temp.push({
        dbname: 'cluster' + i,
        lastSample: generate()
      });
      temp.push({
        dbname: 'cluster' + i + ' replica',
        lastSample: generate()
      });
    }
    for (const row of temp) {
      counter = counter + 1;
      generateRow(row, counter, 12);
    }
    return observable(temp);
  })();
  function formatElapsed(value) {
    var comps;
    if (value > 60) {
      comps = (value % 60).toFixed(2).split('.');
      return Math.floor(value / 60) + ':' + comps[0].lpad('0', 2) + '.' + comps[1];
    }
    return parseFloat(value).toFixed(2);
  }
  function getElapsedClassName(elapsed) {
    var className = 'Query elapsed';
    if (elapsed >= 10.0) {
      className += ' warn_long';
    } else if (elapsed >= 1.0) {
      className += ' warn';
    } else {
      className += ' short';
    }
    return className;
  }
  function countClassName(queries) {
    var countClassName = 'label';
    if (queries >= 20) {
      countClassName += ' label-important';
    } else if (queries >= 10) {
      countClassName += ' label-warning';
    } else {
      countClassName += ' label-success';
    }
    return countClassName;
  }
  function updateQuery(object) {
    const elapsed = Math.random() * 15;
    object.elapsed = elapsed;
    object.formatElapsed = formatElapsed(elapsed);
    object.elapsedClassName = getElapsedClassName(elapsed);
    object.query = 'SELECT blah FROM something';
    object.waiting = Math.random() < 0.5;
    if (Math.random() < 0.2) {
      object.query = '<IDLE> in transaction';
    }
    if (Math.random() < 0.1) {
      object.query = 'vacuum';
    }
    return object;
  }
  function cleanQuery(value) {
    value.formatElapsed = '';
    value.elapsedClassName = '';
    value.query = '';
    value.elapsed = null;
    value.waiting = null;
  }
  function generateRow(object, counter, nbQueries) {
    object.lastMutationId = counter;
    for (let j = 0; j < 12; j++) {
      const value = object.lastSample.queries[j];
      if (j <= nbQueries) {
        updateQuery(value);
      } else {
        cleanQuery(value);
      }
    }
    object.lastSample.nbQueries = nbQueries;
    object.lastSample.countClassName = countClassName(nbQueries);
    return object;
  }
  function updateData() {
    for (let row of data) {
      if (Math.random() < mutations()) {
        counter = counter + 1;
        generateRow(row, counter, Math.floor(Math.random() * 10 + 1));
      }
    }
  }
  var mutationsValue = 0.5;
  function mutations(value) {
    if (value) {
      mutationsValue = value;
      return mutationsValue;
    } else {
      return mutationsValue;
    }
  }
  const app = document.getElementById('app');
  var body = document.querySelector('body');
  var theFirstChild = body.firstChild;
  var sliderContainer = document.createElement('div');
  sliderContainer.style.cssText = 'display: flex';
  var slider = document.createElement('input');
  var text = document.createElement('label');
  text.innerHTML = 'mutations : ' + (mutationsValue * 100).toFixed(0) + '%';
  text.id = 'ratioval';
  slider.setAttribute('type', 'range');
  slider.style.cssText = 'margin-bottom: 10px; margin-top: 5px';
  slider.addEventListener('change', function (e) {
    mutations(e.target.value / 100);
    document.querySelector('#ratioval').innerHTML = 'mutations : ' + (mutations() * 100).toFixed(0) + '%';
  });
  sliderContainer.appendChild(text);
  sliderContainer.appendChild(slider);
  body.insertBefore(sliderContainer, theFirstChild);
  class QueryObserver extends Component {
    render({
      query
    }) {
      return createVNode(1, 'td', query.elapsedClassName, [createVNode(1, 'div', null, query.formatElapsed, 16, null, null, null), createVNode(1, 'div', 'popover left', [createVNode(1, 'div', 'popover-content', query.query, 16, null, null, null), createVNode(1, 'div', 'arrow', null, 1, null, null, null)], 4, null, null, null)], 4, null, null, null);
    }
  }
  observer(QueryObserver);
  class QueriesObserver extends Component {
    render({
      top
    }) {
      return createFragment(top.slice(0, 5).map(query => {
        return createComponentVNode(VNodeFlags.ComponentClass, QueryObserver, {
          query
        });
      }), 4);
    }
  }
  observer(QueriesObserver);
  class RowObserver extends Component {
    render({
      db
    }) {
      const lastSample = db.lastSample;
      const children = [createVNode(1, 'td', 'dbname', db.dbname, 16, null, null, null), createVNode(1, 'td', 'query-count', createVNode(1, 'span', lastSample.countClassName, lastSample.nbQueries, 16, null, null, null), 2, null, null, null), createComponentVNode(VNodeFlags.ComponentClass, QueriesObserver, {
        top: lastSample.queries
      })];
      return createVNode(1, 'tr', null, children, 4, null, null, null);
    }
  }
  observer(RowObserver);
  class TableObserver extends Component {
    render({
      list
    }) {
      const children = [];
      for (const db of list) {
        children.push(createComponentVNode(VNodeFlags.ComponentClass, RowObserver, {
          db
        }));
      }
      return createVNode(1, 'table', 'table table-striped', [createVNode(1, 'caption', null, 'inferno-mobx observer', 16, null, null, null), createVNode(1, 'tbody', null, children, 4, null, null, null)], 4, null, null, null);
    }
  }
  observer(TableObserver);
  class QueryClass extends Component {
    render({
      query
    }) {
      return createVNode(1, 'td', query.elapsedClassName, [createVNode(1, 'div', null, query.formatElapsed, 16, null, null, null), createVNode(1, 'div', 'popover left', [createVNode(1, 'div', 'popover-content', query.query, 16, null, null, null), createVNode(1, 'div', 'arrow', null, 1, null, null, null)], 4, null, null, null)], 4, null, null, null);
    }
    shouldComponentUpdate({
      query
    }) {
      return query !== this.props.query;
    }
  }
  observerPatch(QueryClass);
  class QueriesClass extends Component {
    render({
      top
    }) {
      return createFragment(top.slice(0, 5).map(query => {
        return createComponentVNode(VNodeFlags.ComponentClass, QueryClass, {
          query
        });
      }), 4);
    }
    shouldComponentUpdate({
      top
    }) {
      return top !== this.props.top;
    }
  }
  observerPatch(QueriesClass);
  class RowClass extends Component {
    render({
      db
    }) {
      const lastSample = db.lastSample;
      const children = [createVNode(1, 'td', 'dbname', db.dbname, 16, null, null, null), createVNode(1, 'td', 'query-count', createVNode(1, 'span', lastSample.countClassName, lastSample.nbQueries, 16, null, null, null), 2, null, null, null), createComponentVNode(VNodeFlags.ComponentClass, QueriesClass, {
        top: lastSample.queries
      })];
      return createVNode(1, 'tr', null, children, 4, null, null, null);
    }
    shouldComponentUpdate({
      db
    }) {
      return db !== this.props.db;
    }
  }
  observerPatch(RowClass);
  class TableClass extends Component {
    render({
      list
    }) {
      const children = [];
      for (const db of list) {
        children.push(createComponentVNode(VNodeFlags.ComponentClass, RowClass, {
          db
        }));
      }
      return createVNode(1, 'table', 'table table-striped', [createVNode(1, 'caption', null, 'inferno-mobx observerPatch', 16, null, null, null), createVNode(1, 'tbody', null, children, 4, null, null, null)], 4, null, null, null);
    }
    shouldComponentUpdate({
      list
    }) {
      return list !== this.props.list;
    }
  }
  observerPatch(TableClass);
  function QueryComponent({
    query
  }) {
    return createVNode(1, 'td', query.elapsedClassName, [createVNode(1, 'div', null, query.formatElapsed, 16, null, null, null), createVNode(1, 'div', 'popover left', [createVNode(1, 'div', 'popover-content', query.query, 16, null, null, null), createVNode(1, 'div', 'arrow', null, 1, null, null, null)], 4, null, null, null)], 4, null, null, null);
  }
  QueryComponent.defaultHooks = {
    onComponentShouldUpdate: ({
      query: prev
    }, {
      query: next
    }) => prev !== next
  };
  const Query = observerWrap(QueryComponent);
  function QueriesComponent({
    top
  }) {
    return createFragment(top.slice(0, 5).map(query => {
      return createComponentVNode(VNodeFlags.ComponentFunction, Query, {
        query
      });
    }), 4);
  }
  QueriesComponent.defaultHooks = {
    onComponentShouldUpdate: ({
      top: prev
    }, {
      top: next
    }) => prev !== next
  };
  const Queries = observerWrap(QueriesComponent);
  function RowComponent({
    db
  }) {
    const lastSample = db.lastSample;
    const children = [createVNode(1, 'td', 'dbname', db.dbname, 16, null, null, null), createVNode(1, 'td', 'query-count', createVNode(1, 'span', lastSample.countClassName, lastSample.nbQueries, 16, null, null, null), 2, null, null, null), createComponentVNode(VNodeFlags.ComponentFunction, Queries, {
      top: lastSample.queries
    })];
    return createVNode(1, 'tr', null, children, 4, null, null, null);
  }
  RowComponent.defaultHooks = {
    onComponentShouldUpdate: ({
      db: prev
    }, {
      db: next
    }) => prev !== next
  };
  const Row = observerWrap(RowComponent);
  function TableComponent({
    list
  }) {
    const children = [];
    for (const db of list) {
      children.push(createComponentVNode(VNodeFlags.ComponentFunction, Row, {
        db
      }));
    }
    return createVNode(1, 'table', 'table table-striped', [createVNode(1, 'caption', null, 'inferno-mobx observerWrap', 16, null, null, null), createVNode(1, 'tbody', null, children, 4, null, null, null)], 4, null, null, null);
  }
  TableComponent.defaultHooks = {
    onComponentShouldUpdate: ({
      list: prev
    }, {
      list: next
    }) => prev !== next
  };
  const Table = observerWrap(TableComponent);
  const update = action(() => {
    updateData();
    // startProfile('view update');
  });
  function loop() {
    update();
    // endProfile('view update');
  }

  // startFPSMonitor();
  // startMemMonitor();
  // initProfiler('view update');

  // functional components with observerWrap
  render(createComponentVNode(VNodeFlags.ComponentFunction, Table, {
    list: data
  }), app);

  // class components with observerPatch
  //render(createComponentVNode(VNodeFlags.ComponentClass, TableClass, { list: data }), app);

  // class components with observer
  //render(createComponentVNode(VNodeFlags.ComponentClass, TableObserver, { list: data }), app);

  setInterval(loop, 0);

})();
