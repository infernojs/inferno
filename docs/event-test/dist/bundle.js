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

  /**
   * Links given data to event as first parameter
   * @param {*} data data to be linked, it will be available in function as first parameter
   * @param {Function} callback Function to be called when event occurs
   * @returns {{data: *, event: Function}}
   */
  function linkEvent(data, callback) {
    if (isFunction(callback)) {
      return {
        data,
        event: callback
      };
    }
    return null; // Return null when event is invalid, to avoid creating unnecessary event handlers
  }
  // object.event should always be function, otherwise its badly created object.
  function isLinkEventObject(o) {
    return !isNull(o) && typeof o === 'object';
  }

  // We need EMPTY_OBJ defined in one place.
  // It's used for comparison, so we can't inline it into shared
  const EMPTY_OBJ = {};
  class AnimationQueues {
    constructor() {
      this.componentDidAppear = [];
      this.componentWillDisappear = [];
      this.componentWillMove = [];
    }
  }
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
  function callAllAnimationHooks(animationQueue, callback) {
    let animationsLeft = animationQueue.length;
    // Picking from the top because it is faster, invocation order should be irrelevant
    // since all animations are to be run, and we can't predict the order in which they complete.
    let fn;
    while ((fn = animationQueue.pop()) !== undefined) {
      fn(() => {
        if (--animationsLeft <= 0 && isFunction(callback)) {
          callback();
        }
      });
    }
  }
  function callAllMoveAnimationHooks(animationQueue) {
    // Start the animations.
    for (let i = 0; i < animationQueue.length; i++) {
      animationQueue[i].fn();
    }
    // Perform the actual DOM moves when all measurements of initial
    // position have been performed. The rest of the animations are done
    // async.
    for (let i = 0; i < animationQueue.length; i++) {
      const tmp = animationQueue[i];
      insertOrAppend(tmp.parent, tmp.dom, tmp.next);
    }
    animationQueue.splice(0, animationQueue.length);
  }
  function clearVNodeDOM(vNode, parentDOM, deferredRemoval) {
    while (!isNullOrUndef(vNode)) {
      const flags = vNode.flags;
      if ((flags & 1521 /* VNodeFlags.DOMRef */) !== 0) {
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
            clearVNodeDOM(children[i], parentDOM, false);
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
    return function () {
      // Mark removal as deferred to trigger check that node still exists
      clearVNodeDOM(vNode, parentDOM, true);
    };
  }
  function removeVNodeDOM(vNode, parentDOM, animations) {
    if (animations.componentWillDisappear.length > 0) {
      // Wait until animations are finished before removing actual dom nodes
      callAllAnimationHooks(animations.componentWillDisappear, createDeferComponentClassRemovalCallback(vNode, parentDOM));
    } else {
      clearVNodeDOM(vNode, parentDOM, false);
    }
  }
  function addMoveAnimationHook(animations, parentVNode, refOrInstance, dom, parentDOM, nextNode, flags, props) {
    animations.componentWillMove.push({
      dom,
      fn: () => {
        if ((flags & 4 /* VNodeFlags.ComponentClass */) !== 0) {
          refOrInstance.componentWillMove(parentVNode, parentDOM, dom);
        } else if ((flags & 8 /* VNodeFlags.ComponentFunction */) !== 0) {
          refOrInstance.onComponentWillMove(parentVNode, parentDOM, dom, props);
        }
      },
      next: nextNode,
      parent: parentDOM
    });
  }
  function moveVNodeDOM(parentVNode, vNode, parentDOM, nextNode, animations) {
    let refOrInstance;
    let instanceProps;
    const instanceFlags = vNode.flags;
    while (!isNullOrUndef(vNode)) {
      const flags = vNode.flags;
      if ((flags & 1521 /* VNodeFlags.DOMRef */) !== 0) {
        if (!isNullOrUndef(refOrInstance) && (isFunction(refOrInstance.componentWillMove) || isFunction(refOrInstance.onComponentWillMove))) {
          addMoveAnimationHook(animations, parentVNode, refOrInstance, vNode.dom, parentDOM, nextNode, instanceFlags, instanceProps);
        } else {
          // TODO: Should we delay this too to support mixing animated moves with regular?
          insertOrAppend(parentDOM, vNode.dom, nextNode);
        }
        return;
      }
      const children = vNode.children;
      if ((flags & 4 /* VNodeFlags.ComponentClass */) !== 0) {
        refOrInstance = vNode.children;
        // TODO: We should probably deprecate this in V9 since it is inconsitent with other class component hooks
        instanceProps = vNode.props;
        vNode = children.$LI;
      } else if ((flags & 8 /* VNodeFlags.ComponentFunction */) !== 0) {
        refOrInstance = vNode.ref;
        instanceProps = vNode.props;
        vNode = children;
      } else if ((flags & 8192 /* VNodeFlags.Fragment */) !== 0) {
        if (vNode.childFlags === 2 /* ChildFlags.HasVNodeChildren */) {
          vNode = children;
        } else {
          for (let i = 0, len = children.length; i < len; ++i) {
            moveVNodeDOM(parentVNode, children[i], parentDOM, nextNode, animations);
          }
          return;
        }
      }
    }
  }
  function createDerivedState(instance, nextProps, state) {
    if (isFunction(instance.constructor.getDerivedStateFromProps)) {
      return {
        ...state,
        ...instance.constructor.getDerivedStateFromProps(nextProps, state)
      };
    }
    return state;
  }
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
    return isFunction(method) && (method(arg1), true);
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
    if (isFunction(options.createVNode)) {
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
    if (isFunction(nextEvent)) {
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
    return isFunction(event.composedPath) ? event.composedPath()[0] : event.target;
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
      if (isFunction(props[nativeListenerName])) {
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
      if (isFunction(applyValue)) {
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
    if (isFunction(handler)) {
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
    if (isFunction(nextPropsOrEmpty.onChange)) {
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
    if (!isNullOrUndef(ref) && (isFunction(ref) || ref.current !== void 0)) {
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
        const keys = Object.keys(props);
        for (let i = 0, len = keys.length; i < len; i++) {
          const key = keys[i];
          if (syntheticEvents[key]) {
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
        if (isFunction(children.componentWillUnmount)) {
          // TODO: Possible entrypoint
          children.componentWillUnmount();
        }
        // If we have a componentWillDisappear on this component, block children from animating
        let childAnimations = animations;
        if (isFunction(children.componentWillDisappear)) {
          childAnimations = new AnimationQueues();
          addDisappearAnimationHook(animations, children, children.$LI.dom, flags, undefined);
        }
        unmountRef(vNode.ref);
        children.$UN = true;
        unmount(children.$LI, childAnimations);
      } else if (flags & 8 /* VNodeFlags.ComponentFunction */) {
        // If we have a onComponentWillDisappear on this component, block children from animating
        let childAnimations = animations;
        ref = vNode.ref;
        if (!isNullOrUndef(ref)) {
          let domEl = null;
          if (isFunction(ref.onComponentWillUnmount)) {
            domEl = findDOMFromVNode(vNode, true);
            ref.onComponentWillUnmount(domEl, vNode.props || EMPTY_OBJ);
          }
          if (isFunction(ref.onComponentWillDisappear)) {
            childAnimations = new AnimationQueues();
            domEl = domEl || findDOMFromVNode(vNode, true);
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
    return function () {
      // We need to remove children one by one because elements can be added during animation
      if (parentDOM) {
        for (let i = 0; i < children.length; i++) {
          const vNode = children[i];
          clearVNodeDOM(vNode, parentDOM, false);
        }
      }
    };
  }
  function clearDOM(parentDOM, children, animations) {
    if (animations.componentWillDisappear.length > 0) {
      // Wait until animations are finished before removing actual dom nodes
      // Be aware that the element could be removed by a later operation
      callAllAnimationHooks(animations.componentWillDisappear, createClearAllCallback(children, parentDOM));
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
    // @ts-expect-error TODO: Here is something weird check this behavior
    animations.componentWillDisappear.push(callback => {
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
  function patchDangerInnerHTML(lastValue, nextValue, lastVNode, dom, animations) {
    const lastHtml = lastValue?.__html || '';
    const nextHtml = nextValue?.__html || '';
    if (lastHtml !== nextHtml) {
      if (!isNullOrUndef(nextHtml) && !isSameInnerHTML(dom, nextHtml)) {
        if (!isNull(lastVNode)) {
          if (lastVNode.childFlags & 12 /* ChildFlags.MultipleChildren */) {
            unmountAllChildren(lastVNode.children, animations);
          } else if (lastVNode.childFlags === 2 /* ChildFlags.HasVNodeChildren */) {
            unmount(lastVNode.children, animations);
          }
          lastVNode.children = null;
          lastVNode.childFlags = 1 /* ChildFlags.HasInvalidChildren */;
        }
        dom.innerHTML = nextHtml;
      }
    }
  }
  function patchDomProp(nextValue, dom, prop) {
    const value = isNullOrUndef(nextValue) ? '' : nextValue;
    if (dom[prop] !== value) {
      dom[prop] = value;
    }
  }
  function patchProp(prop, lastValue, nextValue, dom, isSVG, hasControlledValue, lastVNode, animations) {
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
        patchDangerInnerHTML(lastValue, nextValue, lastVNode, dom, animations);
        break;
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
  }
  function mountProps(vNode, flags, props, dom, isSVG, animations) {
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
      patchProp(prop, null, props[prop], dom, isSVG, hasControlledValue, null, animations);
    }
    if (isFormElement) {
      processElement(flags, vNode, dom, props, true, hasControlledValue);
    }
  }
  function renderNewInput(instance, props, context, lastInput) {
    const nextInput = normalizeRoot(instance.render(props, instance.state, context), lastInput);
    let childContext = context;
    if (isFunction(instance.getChildContext)) {
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
      if (isFunction(instance.componentWillMount)) {
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
    if (!isNull(parentDOM)) {
      insertOrAppend(parentDOM, dom, nextNode);
    }
    if (!isNull(props)) {
      mountProps(vNode, flags, props, dom, isSVG, animations);
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
    // If we have a componentDidAppear on this component, we shouldn't allow children to animate so we're passing an dummy animations queue
    let childAnimations = animations;
    if (isFunction(instance.componentDidAppear)) {
      childAnimations = new AnimationQueues();
    }
    mount(instance.$LI, parentDOM, instance.$CX, isSVG, nextNode, lifecycle, childAnimations);
    mountClassComponentCallbacks(vNode.ref, instance, lifecycle, animations);
  }
  function mountFunctionalComponent(vNode, parentDOM, context, isSVG, nextNode, lifecycle, animations) {
    const ref = vNode.ref;
    // If we have a componentDidAppear on this component, we shouldn't allow children to animate so we're passing an dummy animations queue
    let childAnimations = animations;
    if (!isNullOrUndef(ref) && isFunction(ref.onComponentDidAppear)) {
      childAnimations = new AnimationQueues();
    }
    mount(vNode.children = normalizeRoot(renderFunctionalComponent(vNode, context)), parentDOM, context, isSVG, nextNode, lifecycle, childAnimations);
    mountFunctionalComponentCallbacks(vNode, lifecycle, animations);
  }
  function createClassMountCallback(instance) {
    return () => {
      instance.componentDidMount();
    };
  }
  function addAppearAnimationHookClass(animations, instance, dom) {
    animations.componentDidAppear.push(() => {
      instance.componentDidAppear(dom);
    });
  }
  function addAppearAnimationHookFunctional(animations, ref, dom, props) {
    animations.componentDidAppear.push(() => {
      ref.onComponentDidAppear(dom, props);
    });
  }
  function mountClassComponentCallbacks(ref, instance, lifecycle, animations) {
    mountRef(ref, instance, lifecycle);
    if (isFunction(instance.componentDidMount)) {
      lifecycle.push(createClassMountCallback(instance));
    }
    if (isFunction(instance.componentDidAppear)) {
      addAppearAnimationHookClass(animations, instance, instance.$LI.dom);
    }
  }
  function createOnMountCallback(ref, vNode) {
    return () => {
      ref.onComponentDidMount(findDOMFromVNode(vNode, true), vNode.props || EMPTY_OBJ);
    };
  }
  function mountFunctionalComponentCallbacks(vNode, lifecycle, animations) {
    const ref = vNode.ref;
    if (!isNullOrUndef(ref)) {
      safeCall1(ref.onComponentWillMount, vNode.props || EMPTY_OBJ);
      if (isFunction(ref.onComponentDidMount)) {
        lifecycle.push(createOnMountCallback(ref, vNode));
      }
      if (isFunction(ref.onComponentDidAppear)) {
        addAppearAnimationHookFunctional(animations, ref, findDOMFromVNode(vNode, true), vNode.props);
      }
    }
  }
  function replaceWithNewNode(lastVNode, nextVNode, parentDOM, context, isSVG, lifecycle, animations) {
    unmount(lastVNode, animations);
    if ((nextVNode.flags & lastVNode.flags & 1521 /* VNodeFlags.DOMRef */) !== 0) {
      mount(nextVNode, null, context, isSVG, null, lifecycle, animations);
      // Single DOM operation, when we have dom references available
      replaceChild(parentDOM, nextVNode.dom, lastVNode.dom);
    } else {
      mount(nextVNode, parentDOM, context, isSVG, findDOMFromVNode(lastVNode, true), lifecycle, animations);
      removeVNodeDOM(lastVNode, parentDOM, animations);
    }
  }
  function patch(lastVNode, nextVNode, parentDOM, context, isSVG, nextNode, lifecycle, animations) {
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
            patchProp(prop, lastValue, nextValue, dom, isSVG, hasControlledValue, lastVNode, animations);
          }
        }
      }
      if (lastPropsOrEmpty !== EMPTY_OBJ) {
        for (const prop in lastPropsOrEmpty) {
          if (isNullOrUndef(nextPropsOrEmpty[prop]) && !isNullOrUndef(lastPropsOrEmpty[prop])) {
            patchProp(prop, lastPropsOrEmpty[prop], null, dom, isSVG, hasControlledValue, lastVNode, animations);
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
      if (nextVNode.childFlags === 2 /* ChildFlags.HasVNodeChildren */ && mustCloneVNode(nextChildren, lastVNode.children)) {
        nextChildren = nextVNode.children = directClone(nextChildren);
      }
      patchChildren(lastVNode.childFlags, nextVNode.childFlags, lastVNode.children, nextChildren, dom, context, isSVG && nextVNode.type !== 'foreignObject', null, lastVNode, lifecycle, animations);
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
            patch(lastChildren, nextChildren, parentDOM, context, isSVG, nextNode, lifecycle, animations);
            break;
          case 1 /* ChildFlags.HasInvalidChildren */:
            remove(lastChildren, parentDOM, animations);
            break;
          case 16 /* ChildFlags.HasTextChildren */:
            unmount(lastChildren, animations);
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
            clearDOM(parentDOM, lastChildren, animations);
            mount(nextChildren, parentDOM, context, isSVG, nextNode, lifecycle, animations);
            break;
          case 1 /* ChildFlags.HasInvalidChildren */:
            clearDOM(parentDOM, lastChildren, animations);
            break;
          default:
            clearDOM(parentDOM, lastChildren, animations);
            mountArrayChildren(nextChildren, parentDOM, context, isSVG, nextNode, lifecycle, animations);
            break;
        }
        break;
      default:
        switch (nextChildFlags) {
          case 16 /* ChildFlags.HasTextChildren */:
            unmountAllChildren(lastChildren, animations);
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
    const hasSCU = isFunction(instance.shouldComponentUpdate);
    if (usesNewAPI) {
      nextState = createDerivedState(instance, nextProps, nextState !== lastState ? {
        ...lastState,
        ...nextState
      } : nextState);
    }
    if (!hasSCU || hasSCU && instance.shouldComponentUpdate(nextProps, nextState, context)) {
      if (!usesNewAPI && isFunction(instance.componentWillUpdate)) {
        instance.componentWillUpdate(nextProps, nextState, context);
      }
      instance.props = nextProps;
      instance.state = nextState;
      instance.context = context;
      let snapshot = null;
      const nextInput = renderNewInput(instance, nextProps, context, instance.$LI);
      if (usesNewAPI && isFunction(instance.getSnapshotBeforeUpdate)) {
        snapshot = instance.getSnapshotBeforeUpdate(lastProps, lastState);
      }
      patch(instance.$LI, nextInput, parentDOM, instance.$CX, isSVG, nextNode, lifecycle, animations);
      // Don't update Last input, until patch has been successfully executed
      instance.$LI = nextInput;
      if (isFunction(instance.componentDidUpdate)) {
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
    let shouldUpdate = true;
    const nextProps = nextVNode.props || EMPTY_OBJ;
    const nextRef = nextVNode.ref;
    const lastProps = lastVNode.props;
    const nextHooksDefined = !isNullOrUndef(nextRef);
    const lastInput = lastVNode.children;
    if (nextHooksDefined && isFunction(nextRef.onComponentShouldUpdate)) {
      shouldUpdate = nextRef.onComponentShouldUpdate(lastProps, nextProps);
    }
    if (shouldUpdate) {
      if (nextHooksDefined && isFunction(nextRef.onComponentWillUpdate)) {
        nextRef.onComponentWillUpdate(lastProps, nextProps);
      }
      const nextInput = normalizeRoot(renderFunctionalComponent(nextVNode, context), lastInput);
      patch(lastInput, nextInput, parentDOM, context, isSVG, nextNode, lifecycle, animations);
      nextVNode.children = nextInput;
      if (nextHooksDefined && isFunction(nextRef.onComponentDidUpdate)) {
        nextRef.onComponentDidUpdate(lastProps, nextProps);
      }
    } else {
      nextVNode.children = lastInput;
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
        patch(lastChild, nextChild, dom, context, isSVG, nextNode, lifecycle, animations);
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
          patch(aNode, bNode, dom, context, isSVG, outerEdge, lifecycle, animations);
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
          patch(aNode, bNode, dom, context, isSVG, outerEdge, lifecycle, animations);
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
              patch(aNode, bNode, dom, context, isSVG, outerEdge, lifecycle, animations);
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
            sources[j - bStart] = i + 1;
            if (pos > j) {
              moved = true;
            } else {
              pos = j;
            }
            bNode = b[j];
            if (mustCloneVNode(bNode, aNode)) {
              b[j] = bNode = directClone(bNode);
            }
            patch(aNode, bNode, dom, context, isSVG, outerEdge, lifecycle, animations);
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
          moveVNodeDOM(parentVNode, bNode, dom, nextPos < bLength ? findDOMFromVNode(b[nextPos], true) : outerEdge, animations);
        } else {
          j--;
        }
      }
      // Invoke move animations when all moves have been calculated
      if (animations.componentWillMove.length > 0) {
        callAllMoveAnimationHooks(animations.componentWillMove);
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
        patch(rootInput, input, parentDOM, context, false, null, lifecycle, animations);
        parentDOM.$V = input;
      }
    }
    callAll(lifecycle);
    callAllAnimationHooks(animations.componentDidAppear);
    if (isFunction(callback)) {
      callback();
    }
  }
  function render(input, parentDOM, callback = null, context = EMPTY_OBJ) {
    renderInternal(input, parentDOM, callback, context);
  }
  Promise.resolve().then.bind(Promise.resolve());

  function hoistedEvent(e) {
    console.log('ok', e);
  }
  function hoistedNonSyntheticEvents() {
    const listItems = [];
    for (let i = 0; i < numberOfNodes; i++) {
      listItems.push(createVNode(1, "li", null, i, 16, {
        "onclick": hoistedEvent
      }, null, null));
    }
    return createVNode(1, "ul", null, listItems, 4, null, null, null);
  }
  function hoistedLinkEventNonSynthetic() {
    const listItems = [];
    for (let i = 0; i < numberOfNodes; i++) {
      listItems.push(createVNode(1, "li", null, i, 16, {
        "onclick": linkEvent(i, hoistedEvent)
      }, null, null));
    }
    return createVNode(1, "ul", null, listItems, 4, null, null, null);
  }
  function hoistedSyntheticEvents() {
    const listItems = [];
    for (let i = 0; i < numberOfNodes; i++) {
      listItems.push(createVNode(1, "li", null, i, 16, {
        "onClick": hoistedEvent
      }, null, null));
    }
    return createVNode(1, "ul", null, listItems, 4, null, null, null);
  }
  function newFuncsNonSyntheticEvents() {
    const listItems = [];
    for (let i = 0; i < numberOfNodes; i++) {
      listItems.push(createVNode(1, "li", null, i, 16, {
        "onclick": () => {
          console.log('ok');
        }
      }, null, null));
    }
    return createVNode(1, "ul", null, listItems, 4, null, null, null);
  }
  const numberOfNodes = 500;
  const waitMs = 30;
  const patchCounter = 7;
  const iterations = 10;
  const warmUpIterations = 3;
  const roots = [hoistedNonSyntheticEvents, hoistedLinkEventNonSynthetic, hoistedSyntheticEvents, newFuncsNonSyntheticEvents];
  const names = ['hoistedNonSyntheticEvents', 'hoistedLinkEventNonSynthetic', 'hoistedSyntheticEvents', 'newFuncsNonSyntheticEvents'];
  const getAvg = arr => arr.reduce((a, b) => a + b, 0) / arr.length;
  const getMin = arr => Math.min(...arr);
  const getMax = arr => Math.max(...arr);
  function Results({
    results
  }) {
    const rows = [];
    for (let i = 0; i < results.length; i++) {
      const testData = results[i];
      const testCases = ['mount', 'patch', 'unmount'];
      rows.push(createVNode(1, "div", "test-name", testData.name, 0, null, null, null));
      for (let j = 0; j < testCases.length; j++) {
        const testCase = testCases[j];
        const result = testData[testCase];
        rows.push(createVNode(1, "div", "test-part", testCase, 0, null, null, null));
        rows.push(createVNode(1, "div", "test-result", [createTextVNode("Avg: "), result.avg], 0, null, null, null));
        rows.push(createVNode(1, "div", "test-result", [createTextVNode("Min: "), result.min], 0, null, null, null));
        rows.push(createVNode(1, "div", "test-result", [createTextVNode("Max: "), result.max], 0, null, null, null));
      }
    }
    return createVNode(1, "div", "results", rows, 4, null, null, null);
  }
  document.addEventListener('DOMContentLoaded', function (e) {
    const container = document.querySelector('#App');
    const result = [];
    let mountTimes = [];
    let patchTimes = [];
    let unmountTimes = [];
    let i = 0;
    for (let q = 0; q < warmUpIterations; q++) {
      for (let qw = 0; qw < roots.length; qw++) {
        render(createComponentVNode(1 << 3, roots[qw]), container);
      }
    }
    render(null, container);
    function mountTest(finishCallback) {
      const start = performance.now();
      // Mount
      render(createComponentVNode(1 << 3, roots[i]), container);
      const end = performance.now();
      mountTimes.push(end - start);
      setTimeout(patchTest, waitMs, finishCallback);
    }
    function patchTest(finishCallback) {
      const start = performance.now();

      // Patch loop
      for (let p = 0; p < patchCounter; p++) {
        render(createComponentVNode(1 << 3, roots[i]), container);
      }
      const end = performance.now();
      patchTimes.push(end - start);
      setTimeout(unmountTest, waitMs, finishCallback);
    }
    function unmountTest(finishCallback) {
      const start = performance.now();
      // Mount
      render(null, container);
      const end = performance.now();
      unmountTimes.push(end - start);
      setTimeout(finishCallback, waitMs);
    }
    let iterationCounter = 0;
    function startRound() {
      if (iterationCounter < iterations && i < roots.length) {
        iterationCounter++;
        setTimeout(mountTest, waitMs, startRound);
      } else if (i < roots.length) {
        result.push({
          name: names[i],
          mount: {
            min: getMin(mountTimes),
            avg: getAvg(mountTimes),
            max: getMax(mountTimes)
          },
          patch: {
            min: getMin(patchTimes),
            avg: getAvg(patchTimes),
            max: getMax(patchTimes)
          },
          unmount: {
            min: getMin(unmountTimes),
            avg: getAvg(unmountTimes),
            max: getMax(unmountTimes)
          }
        });
        mountTimes = [];
        patchTimes = [];
        unmountTimes = [];
        i++;
        iterationCounter = 0;
        startRound(); // Go next
      } else {
        // Finished!
        setTimeout(function () {
          render(createComponentVNode(2, Results, {
            "results": result
          }, null, null), container);
        }, 1000);
      }
    }
    startRound();
  });

})();
