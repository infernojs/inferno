(function () {
  'use strict';

  const isArray = Array.isArray;
  function isStringOrNumber(o) {
    const type = typeof o;
    return type === 'string' || type === 'number';
  }
  function isNullOrUndef$2(o) {
    return o === void 0 || o === null;
  }
  function isInvalid(o) {
    return o === null || o === false || o === true || o === void 0;
  }
  function isFunction$1(o) {
    return typeof o === 'function';
  }
  function isString$1(o) {
    return typeof o === 'string';
  }
  function isNumber(o) {
    return typeof o === 'number';
  }
  function isNull(o) {
    return o === null;
  }
  function isUndefined$1(o) {
    return o === void 0;
  }
  // object.event should always be function, otherwise its badly created object.
  function isLinkEventObject(o) {
    return !isNull(o) && typeof o === 'object';
  }

  // We need EMPTY_OBJ defined in one place.
  // It's used for comparison, so we can't inline it into shared
  const EMPTY_OBJ = {};
  // @ts-expect-error hack for fragment type
  const Fragment = '$F';
  // The adapter while inferno-animation is installed, and while it is active. The reconciler tests
  // these variables: a null check of a variable is the cheapest test in every JIT tier, and a bundler
  // that sees no call to setMoveAnimations removes the tests altogether.
  let moveAnimations = null;
  let activeMoveAnimations = null;
  // A patched function component has a move hook, which it may not have had before
  function updateMoveHooks(lastVNode, nextVNode) {
    const lastRef = lastVNode.ref;
    if (isNullOrUndef$2(lastRef) || typeof lastRef.onComponentWillMove !== 'function') {
      moveAnimations.updateHooks(lastRef, nextVNode.ref);
    }
  }
  // Returns false when another copy of inferno-animation is installed already
  function setMoveAnimations(adapter, active) {
    if (moveAnimations !== null && moveAnimations !== adapter) {
      return false;
    }
    moveAnimations = adapter;
    activeMoveAnimations = active ? adapter : null;
    return true;
  }
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
    while (!isNullOrUndef$2(v)) {
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
    while (!isNullOrUndef$2(vNode)) {
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
    while (!isNullOrUndef$2(vNode)) {
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
    while (!isNullOrUndef$2(vNode)) {
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
      if (!synchronous && activeMoveAnimations !== null) {
        activeMoveAnimations.remove(parent, callback);
      } else {
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
    while (!isNullOrUndef$2(vNode)) {
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
      if (isUndefined$1(to[propName])) {
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
    if (isNullOrUndef$2(defaultHooks)) {
      return ref;
    }
    if (isNullOrUndef$2(ref)) {
      return defaultHooks;
    }
    return mergeUnsetProperties(ref, defaultHooks);
  }
  function mergeDefaultProps(flags, type, props) {
    // set default props
    const defaultProps = (flags & 32768 /* VNodeFlags.ForwardRef */ ? type.render : type).defaultProps;
    if (isNullOrUndef$2(defaultProps)) {
      return props;
    }
    if (isNullOrUndef$2(props)) {
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
    return new V(1 /* ChildFlags.HasInvalidChildren */, isNullOrUndef$2(text) || text === true || text === false ? '' : text, null, 16 /* VNodeFlags.Text */, key, null, null, null);
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
            const isPrefixedKey = isString$1(oldKey) && oldKey[0] === keyPrefix;
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
  function getFlagsForElementVnode(type) {
    switch (type) {
      case 'svg':
        return 32 /* VNodeFlags.SvgElement */;
      case 'input':
        return 64 /* VNodeFlags.InputElement */;
      case 'select':
        return 256 /* VNodeFlags.SelectElement */;
      case 'textarea':
        return 128 /* VNodeFlags.TextareaElement */;
      // @ts-expect-error Fragment is special case
      case Fragment:
        return 8192 /* VNodeFlags.Fragment */;
      default:
        return 1 /* VNodeFlags.HtmlElement */;
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
          const isPrefixed = isString$1(key) && key[0] === keyPrefix;
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
      if (!isNullOrUndef$2(eventsObject)) {
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
      if (isNullOrUndef$2(vNode)) {
        return;
      }
      const props = vNode.props ?? EMPTY_OBJ;
      const dom = vNode.dom;
      if (isString$1(methodName)) {
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
    const hasValue = !isNullOrUndef$2(value);
    if (type != null && type !== dom.type) {
      dom.setAttribute('type', type);
    }
    if (!isNullOrUndef$2(multiple) && multiple !== dom.multiple) {
      dom.multiple = multiple;
    }
    if (!isNullOrUndef$2(defaultValue) && !hasValue) {
      dom.defaultValue = defaultValue + '';
    }
    if (isCheckedType(type)) {
      if (hasValue) {
        dom.value = value;
      }
      if (!isNullOrUndef$2(checked)) {
        dom.checked = checked;
      }
    } else {
      if (hasValue && dom.value !== value) {
        dom.defaultValue = value;
        dom.value = value;
      } else if (!isNullOrUndef$2(checked)) {
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
    } else if (!isNullOrUndef$2(value) || !isNullOrUndef$2(props.selected)) {
      dom.selected = Boolean(props.selected);
    }
  }
  const onSelectChange = createWrappedFunction('onChange', applyValueSelect);
  function selectEvents(dom) {
    attachEvent(dom, 'change', onSelectChange);
  }
  function applyValueSelect(nextPropsOrEmpty, dom, mounting, vNode) {
    const multiplePropInBoolean = Boolean(nextPropsOrEmpty.multiple);
    if (!isNullOrUndef$2(nextPropsOrEmpty.multiple) && multiplePropInBoolean !== dom.multiple) {
      dom.multiple = multiplePropInBoolean;
    }
    const index = nextPropsOrEmpty.selectedIndex;
    if (index === -1) {
      dom.selectedIndex = -1;
    }
    const childFlags = vNode.childFlags;
    if (childFlags !== 1 /* ChildFlags.HasInvalidChildren */) {
      let value = nextPropsOrEmpty.value;
      if (isNumber(index) && index > -1 && !isNullOrUndef$2(dom.options[index])) {
        value = dom.options[index].value;
      }
      if (mounting && isNullOrUndef$2(value)) {
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
    if (isNullOrUndef$2(value)) {
      if (mounting) {
        const defaultValue = nextPropsOrEmpty.defaultValue;
        if (!isNullOrUndef$2(defaultValue) && defaultValue !== domValue) {
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
    return isCheckedType(nextPropsOrEmpty.type) ? !isNullOrUndef$2(nextPropsOrEmpty.checked) : !isNullOrUndef$2(nextPropsOrEmpty.value);
  }
  function unmountRef(ref) {
    if (!isNullOrUndef$2(ref)) {
      if (!safeCall1(ref, null) && ref.current) {
        ref.current = null;
      }
    }
  }
  function mountRef(ref, value, lifecycle) {
    if (!isNullOrUndef$2(ref) && (isFunction$1(ref) || ref.current !== void 0)) {
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
        if (childFlags === 8 /* ChildFlags.HasKeyedChildren */) {
          if (activeMoveAnimations !== null) {
            activeMoveAnimations.unmountList(vNode);
          }
        }
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
        if (activeMoveAnimations !== null && typeof children.componentWillMove === 'function') {
          activeMoveAnimations.unmountClass(children);
        }
        unmountRef(vNode.ref);
        children.$UN = true;
        unmount(children.$LI, childAnimations);
      } else if (flags & 8 /* VNodeFlags.ComponentFunction */) {
        // If we have a onComponentWillDisappear on this component, block children from animating
        let childAnimations = animations;
        ref = vNode.ref;
        if (!isNullOrUndef$2(ref)) {
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
          if (activeMoveAnimations !== null && typeof ref.onComponentWillMove === 'function') {
            activeMoveAnimations.updateHooks(ref, null);
          }
        }
        unmount(children, childAnimations);
      } else if (flags & 1024 /* VNodeFlags.Portal */) {
        remove(children, vNode.ref, animations);
      } else if (flags & 8192 /* VNodeFlags.Fragment */) {
        if (vNode.childFlags & 12 /* ChildFlags.MultipleChildren */) {
          if (activeMoveAnimations !== null && vNode.childFlags === 8 /* ChildFlags.HasKeyedChildren */) {
            activeMoveAnimations.unmountList(vNode);
          }
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
    if (isNullOrUndef$2(nextAttrValue)) {
      dom.removeAttribute('style');
      return;
    }
    const domStyle = dom.style;
    let style;
    let value;
    if (isString$1(nextAttrValue)) {
      domStyle.cssText = nextAttrValue;
      return;
    }
    if (!isNullOrUndef$2(lastAttrValue) && !isString$1(lastAttrValue)) {
      for (style in nextAttrValue) {
        // do not add a hasOwnProperty check here, it affects performance
        value = nextAttrValue[style];
        if (value !== lastAttrValue[style]) {
          domStyle.setProperty(style, value);
        }
      }
      for (style in lastAttrValue) {
        if (isNullOrUndef$2(nextAttrValue[style])) {
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
      if (!isNullOrUndef$2(nextHtml) && !isSameInnerHTML(dom, nextHtml)) {
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
    const value = isNullOrUndef$2(nextValue) ? '' : nextValue;
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
        } else if (isNullOrUndef$2(nextValue)) {
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
    if (!isNullOrUndef$2(className) && className !== '') {
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
    if (!isNullOrUndef$2(ref) && isFunction$1(ref.onComponentDidAppear)) {
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
      // A move hook assigned in componentDidMount still counts
      if (moveAnimations !== null && typeof instance.componentWillMove === 'function') {
        moveAnimations.mountClass(instance);
      }
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
    if (moveAnimations !== null && typeof instance.componentWillMove === 'function') {
      moveAnimations.mountClass(instance);
    }
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
    if (!isNullOrUndef$2(ref)) {
      if (moveAnimations !== null && typeof ref.onComponentWillMove === 'function') {
        moveAnimations.updateHooks(null, ref);
      }
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
      if (activeMoveAnimations !== null) {
        activeMoveAnimations.reparent(nextChildren, nextContainer);
      }
    }
  }
  function patchElement(lastVNode, nextVNode, context, isSVG, lifecycle, animations) {
    const dom = nextVNode.dom = lastVNode.dom;
    let lastChildren = lastVNode.children;
    let lastChildFlags = lastVNode.childFlags;
    // The move hooks of a keyed list measure its items before anything changes, props included.
    // The local test goes first, so that optimized code reads the variable only for keyed lists, and
    // a bundler that knows the variable stays null removes both.
    if (lastChildFlags === 8 /* ChildFlags.HasKeyedChildren */) {
      if (activeMoveAnimations !== null) {
        activeMoveAnimations.prepare(lastVNode, nextVNode, dom, animations);
      }
    }
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
          if (isNullOrUndef$2(nextPropsOrEmpty[prop]) && !isNullOrUndef$2(lastPropsOrEmpty[prop])) {
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
      if (isNullOrUndef$2(nextClassName)) {
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
            patch(lastChildren, nextChildren, parentDOM, context, isSVG, nextNode, lifecycle, animations);
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
        // A keyed fragment's move hooks measure its items before any of them change
        if (lastChildFlags === 8 /* ChildFlags.HasKeyedChildren */) {
          if (activeMoveAnimations !== null && (parentVNode.flags & 8192 /* VNodeFlags.Fragment */) !== 0) {
            activeMoveAnimations.prepareFragment(parentVNode, nextChildFlags === 8 /* ChildFlags.HasKeyedChildren */ ? nextChildren : null, parentDOM, animations);
          }
        }
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
      patch(instance.$LI, nextInput, parentDOM, instance.$CX, isSVG, nextNode, lifecycle, animations);
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
    const nextHooksDefined = !isNullOrUndef$2(nextRef);
    const lastInput = lastVNode.children;
    if (nextHooksDefined) {
      // A move hook that a patch adds is counted; one that a patch removes is not, which only keeps
      // inferno-animation active
      if (moveAnimations !== null && typeof nextRef.onComponentWillMove === 'function') {
        updateMoveHooks(lastVNode, nextVNode);
      }
      if (typeof nextRef.onComponentShouldUpdate === 'function' && !nextRef.onComponentShouldUpdate(lastProps, nextProps)) {
        nextVNode.children = lastInput;
        return;
      }
      if (typeof nextRef.onComponentWillUpdate === 'function') {
        nextRef.onComponentWillUpdate(lastProps, nextProps);
      }
    }
    const nextInput = normalizeRoot(renderFunctionalComponent(nextVNode, context), lastInput);
    patch(lastInput, nextInput, parentDOM, context, isSVG, nextNode, lifecycle, animations);
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
                patch(aNode, bNode, dom, context, isSVG, outerEdge, lifecycle, animations);
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
              patch(aNode, bNode, dom, context, isSVG, outerEdge, lifecycle, animations);
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
    if (isNullOrUndef$2(rootInput)) {
      if (!isNullOrUndef$2(input)) {
        if (mustCloneVNode(input, null)) {
          input = directClone(input);
        }
        mount(input, parentDOM, context, false, null, lifecycle, animations);
        parentDOM.$V = input;
      }
    } else {
      if (isNullOrUndef$2(input)) {
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
    if (isNullOrUndef$2(pending)) {
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

  function isNullOrUndef$1(o) {
    return o === void 0 || o === null;
  }
  function isString(o) {
    return typeof o === 'string';
  }
  function isUndefined(o) {
    return o === void 0;
  }
  function createElement(type, props, ...children) {
    let definedChildren;
    let ref = null;
    let key = null;
    let className = null;
    let flags;
    let newProps;
    const childLen = children.length;
    if (childLen === 1) {
      definedChildren = children[0];
    } else if (childLen > 1) {
      definedChildren = [];
      for (let i = 0; i < childLen; i++) {
        definedChildren.push(children[i]);
      }
    }
    if (isString(type)) {
      flags = getFlagsForElementVnode(type);
      if (!isNullOrUndef$1(props)) {
        newProps = {};
        for (const prop in props) {
          if (prop === 'className' || prop === 'class') {
            className = props[prop];
          } else if (prop === 'key') {
            key = props.key;
          } else if (prop === 'children' && isUndefined(definedChildren)) {
            definedChildren = props.children; // always favour children args over props
          } else if (prop === 'ref') {
            ref = props.ref;
          } else {
            if (prop === 'contenteditable') {
              flags |= 4096 /* VNodeFlags.ContentEditable */;
            }
            newProps[prop] = props[prop];
          }
        }
      }
    } else {
      flags = 2 /* VNodeFlags.ComponentUnknown */;
      if (!isUndefined(definedChildren)) {
        if (!props) {
          props = {};
        }
        props.children = definedChildren;
      }
      if (!isNullOrUndef$1(props)) {
        newProps = {};
        for (const prop in props) {
          if (prop === 'key') {
            key = props.key;
          } else if (prop === 'ref') {
            ref = props.ref;
          } else {
            switch (prop) {
              case 'onComponentDidAppear':
              case 'onComponentDidMount':
              case 'onComponentDidUpdate':
              case 'onComponentShouldUpdate':
              case 'onComponentWillDisappear':
              case 'onComponentWillMount':
              case 'onComponentWillUnmount':
              case 'onComponentWillUpdate':
                if (!ref) {
                  ref = {};
                }
                ref[prop] = props[prop];
                break;
              default:
                newProps[prop] = props[prop];
                break;
            }
          }
        }
      }
      return createComponentVNode(flags, type, newProps, key, ref);
    }
    if (flags & 8192 /* VNodeFlags.Fragment */) {
      return createFragment(childLen === 1 ? [definedChildren] : definedChildren, 0 /* ChildFlags.UnknownChildren */, key);
    }
    return createVNode(flags, type, className, definedChildren, 0 /* ChildFlags.UnknownChildren */, newProps, key, ref);
  }

  function isNullOrUndef(o) {
    return o === void 0 || o === null;
  }
  function isFunction(o) {
    return typeof o === 'function';
  }
  function filterEmpty(c) {
    return c !== '';
  }
  function getClassNameList(className) {
    return className.split(' ').filter(filterEmpty);
  }
  function addClassName$1(node, className) {
    const classNameList = getClassNameList(className);
    for (let i = 0; i < classNameList.length; i++) {
      node.classList.add(classNameList[i]);
    }
  }
  function removeClassName$1(node, className) {
    const classNameList = getClassNameList(className);
    for (let i = 0; i < classNameList.length; i++) {
      node.classList.remove(classNameList[i]);
    }
  }
  function forceReflow$1() {
    return document.body.clientHeight;
  }
  // A quicker version used in pre_initialize
  function resetDisplay(node, value) {
    if (value !== undefined) {
      node.style.setProperty('display', value);
    } else {
      node.style.removeProperty('display');
      _cleanStyle(node);
    }
  }
  function setDisplay(node, value) {
    const oldVal = node.style.getPropertyValue('display');
    if (oldVal !== value) {
      if (value !== undefined) {
        node.style.setProperty('display', value);
      } else {
        node.style.removeProperty('display');
        _cleanStyle(node);
      }
    }
    return oldVal;
  }
  function _cleanStyle(node) {
    if (!node.style) {
      // https://developer.mozilla.org/en-US/docs/Web/API/Element/removeAttribute
      node.removeAttribute('style');
    }
  }
  function getDimensions(node) {
    let rect = node.getBoundingClientRect();
    // The `display: none;` workaround was added to support Bootstrap animations in
    // https://github.com/jhsware/inferno-bootstrap/blob/be4a17bff5e785b993a66a2927846cd463fecae3/src/Modal/AnimateModal.js
    // we should consider deprecating this, or providing a different solution for
    // those who only do normal animations. Only an element without a box can be hidden that way.
    if (rect.width === 0 && rect.height === 0 && window.getComputedStyle(node).getPropertyValue('display') === 'none') {
      const tmpDisplay = node.style.getPropertyValue('display');
      node.style.setProperty('display', 'block');
      rect = node.getBoundingClientRect();
      node.style.setProperty('display', tmpDisplay);
      _cleanStyle(node);
    }
    return {
      height: rect.height,
      width: rect.width,
      x: rect.x,
      y: rect.y
    };
  }
  function getGeometry(node) {
    return node.getBoundingClientRect();
  }
  // Whether the element has a box: a hidden one measures as an empty box at the viewport origin
  function hasBox(node, geometry) {
    return geometry.width !== 0 || geometry.height !== 0 || node.getClientRects().length !== 0;
  }
  const IDENTITY = [1, 0, 0, 1, 0, 0];
  function multiply(m, n) {
    return [m[0] * n[0] + m[2] * n[1], m[1] * n[0] + m[3] * n[1], m[0] * n[2] + m[2] * n[3], m[1] * n[2] + m[3] * n[3]];
  }
  // The offset that m maps to (x, y), or null when m flattens the plane
  function solve(m, x, y) {
    const determinant = m[0] * m[3] - m[1] * m[2];
    if (Math.abs(determinant) < 1e-9) return null;
    return {
      x: (m[3] * x - m[2] * y) / determinant,
      y: (m[0] * y - m[1] * x) / determinant
    };
  }
  // A computed transform, which is a matrix or none
  function matrix(value) {
    const match = /^matrix(3d)?\(([^)]*)\)$/.exec(value || '');
    if (match === null) return IDENTITY;
    const v = match[2].split(',').map(Number);
    return match[1] ? [v[0], v[1], v[4], v[5], v[12], v[13]] : v;
  }
  // The computed rotate property, when it rotates around the z axis. Computed angles are in degrees.
  function rotateLinear(value) {
    const match = /^(?:z |0 0 1 )?(-?[\d.e+-]+)deg$/.exec(value || '');
    if (match === null) return IDENTITY;
    const angle = Number(match[1]) * Math.PI / 180;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return [cos, sin, -sin, cos];
  }
  function scaleLinear(value) {
    if (!value || value === 'none') return IDENTITY;
    const [x, y = x] = value.split(' ').map(Number);
    return Number.isFinite(x) && Number.isFinite(y) ? [x, 0, 0, y] : IDENTITY;
  }
  /**
   * The linear part of the individual rotate and scale properties, which apply before the transform
   * property, so they also apply to an offset written into the transform.
   */
  function ownLinear(style) {
    return multiply(rotateLinear(style.rotate), scaleLinear(style.scale));
  }
  /**
   * How the transforms around the children of parent map their offsets to the viewport. For SVG the
   * screen CTM includes the viewBox, the SVG transforms and the CSS transforms of HTML ancestors.
   * The parent may be a shadow root or a document fragment, and the elements around a shadow root
   * are those around its host.
   */
  function parentSpace(parent) {
    let space = IDENTITY;
    for (let node = parent; node !== null; node = node.parentNode || node.host || null) {
      if (node.nodeType !== 1) continue;
      if (typeof node.getScreenCTM === 'function') {
        const ctm = node.getScreenCTM();
        return ctm === null ? space : multiply([ctm.a, ctm.b, ctm.c, ctm.d], space);
      }
      const style = window.getComputedStyle(node);
      space = multiply(multiply(ownLinear(style), matrix(style.transform)), space);
    }
    return space;
  }
  function saveStyles(style, properties) {
    return properties.map(property => ({
      property,
      value: style.getPropertyValue(property),
      priority: style.getPropertyPriority(property),
      applied: '',
      appliedPriority: ''
    }));
  }
  // Records the values the animation has written
  function markApplied(style, saved) {
    for (const entry of saved) {
      entry.applied = style.getPropertyValue(entry.property);
      entry.appliedPriority = style.getPropertyPriority(entry.property);
    }
  }
  /**
   * Restores the saved declarations and empties saved. A property the application changed after
   * the animation wrote it keeps the application's value.
   */
  function restoreStyles(style, saved) {
    for (const entry of saved) {
      if (style.getPropertyValue(entry.property) === entry.applied && style.getPropertyPriority(entry.property) === entry.appliedPriority) {
        if (entry.value) style.setProperty(entry.property, entry.value, entry.priority);else style.removeProperty(entry.property);
      }
    }
    saved.length = 0;
  }
  function setTransform(node, x, y, scaleX = 1, scaleY = 1) {
    const doScale = scaleX !== 1 || scaleY !== 1;
    if (doScale) {
      node.style.transformOrigin = '0 0';
      node.style.transform = `translate(${x}px,${y}px) scale(${scaleX},${scaleY})`;
    } else {
      node.style.transform = `translate(${x}px,${y}px)`;
    }
  }
  function setDimensions(node, width, height) {
    node.style.width = width + 'px';
    node.style.height = height + 'px';
  }
  function _getMaxTransitionDuration(nodes) {
    let nrofTransitions = 0;
    let maxDuration = 0;
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (!node) continue;
      const cs = window.getComputedStyle(node);
      const dur = cs.getPropertyValue('transition-duration').split(',');
      const del = cs.getPropertyValue('transition-delay').split(',');
      const props = cs.getPropertyValue('transition-property').split(',');
      for (const prop of props) {
        const fixedProp = prop.trim();
        if (fixedProp[0] === '-') {
          const tmp = fixedProp.split('-').splice(2).join('-');
          // Since I increase number of transition events to expect by
          // number of durations found I need to remove browser prefix
          // variations of the same property
          if (fixedProp.includes(tmp)) {
            nrofTransitions--;
          }
        }
      }
      let animTimeout = 0;
      for (let j = 0; j < dur.length; j++) {
        const duration = dur[j];
        const delay = del[j];
        const tp = parseFloat(duration) + parseFloat(delay);
        if (tp > animTimeout) animTimeout = tp;
      }
      nrofTransitions += dur.length;
      // Max duration should be equal to the longest animation duration
      // of all found transitions including delay
      if (animTimeout > maxDuration) {
        maxDuration = animTimeout;
      }
    }
    return {
      maxDuration,
      nrofTransitions
    };
  }
  function setAnimationTimeout(onTransitionEnd, rootNode, maxDuration) {
    let timeout;
    const start = () => {
      timeout = setTimeout(() => onTransitionEnd({
        target: rootNode,
        timeout: true
      }), maxDuration === 0 ? 0 : Math.round(maxDuration * 1000) + 100);
    };
    if (rootNode.nodeName === 'IMG' && !rootNode.complete) {
      rootNode.addEventListener('load', start, {
        once: true
      });
    } else {
      start();
    }
    return () => {
      clearTimeout(timeout);
      rootNode.removeEventListener('load', start);
    };
  }
  /**
   * You need to pass the root element and ALL animated children that have transitions,
   * if there are any,  so the timeout is set to the longest duration. Otherwise there
   * will be animations that fail to complete before the timeout is triggered.
   *
   * @param nodes a list of nodes that have transitions that are part of this animation
   * @param callback callback when all transitions of participating nodes are completed
   * @returns Cancel listeners and the timeout without invoking the callback.
   */
  function registerTransitionListener$1(nodes, callback) {
    const rootNode = nodes[0];
    /**
     * Here comes the transition event listener
     */
    const transitionDuration = _getMaxTransitionDuration(nodes);
    const maxDuration = transitionDuration.maxDuration;
    let nrofTransitionsLeft = transitionDuration.nrofTransitions;
    let done = false;
    const onTransitionEnd = event => {
      // Make sure this is an actual event
      if (!event || done) {
        return;
      }
      if (!event.timeout) {
        // Make sure it isn't a child that is triggering the event
        let goAhead = false;
        for (let i = 0; i < nodes.length; i++) {
          // Note: Check for undefined nodes (happens when an animated el doesn't have children)
          if (nodes[i] !== undefined && event.target === nodes[i]) {
            goAhead = true;
            break;
          }
        }
        if (!goAhead) return;
        // Wait for all transitions
        if (--nrofTransitionsLeft > 0) {
          return;
        }
      }
      // This is it...
      cancel();
      if (isFunction(callback)) {
        callback();
      }
    };
    // if element gets removed from the DOM before transition is triggered, browser will raise transitioncancel event
    rootNode.addEventListener('transitioncancel', onTransitionEnd, false);
    rootNode.addEventListener('transitionend', onTransitionEnd, false);
    const cancelTimeout = setAnimationTimeout(onTransitionEnd, rootNode, maxDuration);
    function cancel() {
      done = true;
      cancelTimeout();
      rootNode.removeEventListener('transitioncancel', onTransitionEnd, false);
      rootNode.removeEventListener('transitionend', onTransitionEnd, false);
    }
    return cancel;
  }
  var AnimationPhase;
  (function (AnimationPhase) {
    // Leaving elements are measured before any animation of the pass writes
    AnimationPhase[AnimationPhase["MEASURE_LEAVES"] = 0] = "MEASURE_LEAVES";
    AnimationPhase[AnimationPhase["INITIALIZE"] = 1] = "INITIALIZE";
    AnimationPhase[AnimationPhase["MEASURE"] = 2] = "MEASURE";
    AnimationPhase[AnimationPhase["SET_START_STATE"] = 3] = "SET_START_STATE";
    AnimationPhase[AnimationPhase["READ_MOVES"] = 4] = "READ_MOVES";
    AnimationPhase[AnimationPhase["RESET_MOVES"] = 5] = "RESET_MOVES";
    AnimationPhase[AnimationPhase["MEASURE_MOVES"] = 6] = "MEASURE_MOVES";
    // Moves that do not happen drop out before any move writes its start state
    AnimationPhase[AnimationPhase["SELECT_MOVES"] = 7] = "SELECT_MOVES";
    AnimationPhase[AnimationPhase["SET_MOVE_START_STATE"] = 8] = "SET_MOVE_START_STATE";
    AnimationPhase[AnimationPhase["ACTIVATE_TRANSITIONS"] = 9] = "ACTIVATE_TRANSITIONS";
    AnimationPhase[AnimationPhase["ACTIVATE_ANIMATION"] = 10] = "ACTIVATE_ANIMATION";
    AnimationPhase[AnimationPhase["REGISTER_LISTENERS"] = 11] = "REGISTER_LISTENERS";
  })(AnimationPhase || (AnimationPhase = {}));
  // How long an element that enters can start from the box of one that left with its key, in
  // milliseconds: long enough for a page that loads before it mounts
  const SOURCE_LIFETIME = 1000;
  const sources = {};
  let sourceTimer;
  // Sources that no element used do not stay in memory
  function expireSources() {
    sourceTimer = undefined;
    const now = performance.now();
    for (const key in sources) {
      if (sources[key].expires > now) {
        sourceTimer ??= setTimeout(expireSources, SOURCE_LIFETIME);
      } else {
        delete sources[key];
      }
    }
  }
  function addGlobalAnimationSource(key, state) {
    state.expires = performance.now() + SOURCE_LIFETIME;
    sources[key] = state;
    sourceTimer ??= setTimeout(expireSources, SOURCE_LIFETIME);
  }
  function consumeGlobalAnimationSource(key) {
    const source = sources[key];
    if (source === undefined) return null;
    delete sources[key];
    return source.expires > performance.now() ? source : null;
  }
  let animationQueue = [];
  let activationQueue = [];
  let nextFrame = 0;
  let activationFrame = 0;
  let microtaskPending = false;
  const pendingParents = new Set();
  function activate() {
    activationFrame = 0;
    const queue = activationQueue;
    activationQueue = [];
    for (const phase of [10 /* AnimationPhase.ACTIVATE_ANIMATION */, 11 /* AnimationPhase.REGISTER_LISTENERS */]) {
      for (const item of queue) if (!item.cancelled) item.callback(phase);
    }
  }
  function prepare(queue) {
    if (!queue.length) return;
    for (let phase = 0 /* AnimationPhase.MEASURE_LEAVES */; phase <= 9 /* AnimationPhase.ACTIVATE_TRANSITIONS */; phase++) {
      if (phase === 9 /* AnimationPhase.ACTIVATE_TRANSITIONS */ && queue.some(item => !item.cancelled)) forceReflow$1();
      for (const item of queue) if (!item.cancelled) item.callback(phase);
    }
    activationQueue.push(...queue.filter(item => !item.cancelled));
    if (activationQueue.length && !activationFrame) activationFrame = requestAnimationFrame(activate);
  }
  function prepareFrame() {
    nextFrame = 0;
    const queue = animationQueue;
    animationQueue = [];
    prepare(queue);
  }
  /** Prepare only affected parents, after all synchronous/nested commits finish. */
  function scheduleMoveFlush(parent) {
    pendingParents.add(parent);
    if (microtaskPending) return;
    microtaskPending = true;
    queueMicrotask(() => {
      microtaskPending = false;
      const queue = [];
      animationQueue = animationQueue.filter(item => {
        if (item.parent && pendingParents.has(item.parent)) {
          queue.push(item);
          return false;
        }
        return true;
      });
      pendingParents.clear();
      if (!animationQueue.length && nextFrame) {
        cancelAnimationFrame(nextFrame);
        nextFrame = 0;
      }
      prepare(queue);
    });
  }
  function queueAnimation(callback, parent) {
    const item = {
      callback,
      parent,
      cancelled: false
    };
    animationQueue.push(item);
    if (!nextFrame) nextFrame = requestAnimationFrame(prepareFrame);
    return () => {
      item.cancelled = true;
      animationQueue = animationQueue.filter(entry => entry !== item);
      activationQueue = activationQueue.filter(entry => entry !== item);
      if (!animationQueue.length && nextFrame) {
        cancelAnimationFrame(nextFrame);
        nextFrame = 0;
      }
      if (!activationQueue.length && activationFrame) {
        cancelAnimationFrame(activationFrame);
        activationFrame = 0;
      }
    };
  }
  let removals = new Map();
  let removalFrame = 0;
  function hasQueuedRemoval(parent) {
    return removals.has(parent);
  }
  function drainRemovals() {
    removalFrame = 0;
    const batch = removals;
    removals = new Map();
    let error;
    let failed = false;
    const run = callback => {
      try {
        callback();
      } catch (caught) {
        if (!failed) error = caught;
        failed = true;
      }
    };
    // Read every source layout before any parent is changed. A custom hook that
    // throws must not strand completed leaves or another parent's callbacks.
    for (const entry of batch.values()) run(entry.prepare);
    for (const entry of batch.values()) for (const callback of entry.callbacks) run(callback);
    if (failed) throw error;
  }
  function queueRemoval(parent, prepareRemoval, callback) {
    let batch = removals.get(parent);
    if (!batch) removals.set(parent, batch = {
      prepare: prepareRemoval,
      callbacks: new Set()
    });
    batch.callbacks.add(callback);
    if (!removalFrame) removalFrame = requestAnimationFrame(drainRemovals);
  }
  function cancelRemovals(parent) {
    const batch = removals.get(parent);
    if (!batch) return;
    removals.delete(parent);
    // The last tracked list is gone, so no survivor animation is necessary.
    for (const callback of batch.callbacks) callback();
    if (!removals.size && removalFrame) {
      cancelAnimationFrame(removalFrame);
      removalFrame = 0;
    }
  }

  // The registry and all discovery work belong to this optional package. An element list is keyed
  // by its element, which stays the same across patches. A keyed fragment has no element of its
  // own, so its list is keyed by the children array it currently renders. A list is registered when
  // it is first prepared.
  let elementLists = new WeakMap();
  let fragmentLists = new WeakMap();
  // Active lists by physical parent, for preparing survivors when a leave animation completes
  let parents = new WeakMap();
  // Elements prepared in a commit through a fragment: a keyed fragment list shares its parent with
  // the list around it, whose owners prepare those elements first
  const coverage = new WeakMap();
  // Bumped by every owner change: a list looks for hooks again when it is prepared next
  let topologyVersion = 0;
  // Mounted move hook owners: class instances that have componentWillMove by the end of their mount,
  // and function component hooks objects with onComponentWillMove. The reconciler reports keyed
  // patches, list unmounts and removals only while there is at least one.
  let owners = 0;
  const classOwners = new WeakSet();
  // The owner whose hook is running, so its animation can cover every root of a fragment.
  let preparedOwner = null;
  function changeOwners(adapter, delta) {
    const before = owners;
    // A hooks object changed in place can report an owner it did not add
    owners = Math.max(owners + delta, 0);
    topologyVersion++;
    if (before === 0) {
      if (owners !== 0) setMoveAnimations(adapter, true);
    } else if (owners === 0) {
      // Nothing is prepared until an owner mounts again, and lists register again then
      elementLists = new WeakMap();
      fragmentLists = new WeakMap();
      parents = new WeakMap();
      setMoveAnimations(adapter, false);
    }
  }
  function hasMoveHook(ref) {
    return ref != null && typeof ref.onComponentWillMove === 'function' ? 1 : 0;
  }
  function input(vNode) {
    return vNode.flags & 4 /* VNodeFlags.ComponentClass */ ? vNode.children.$LI : vNode.children;
  }
  function hasCandidates(vNode) {
    const flags = vNode.flags;
    if (flags & 4 /* VNodeFlags.ComponentClass */) {
      return typeof vNode.children.componentWillMove === 'function' || hasCandidates(input(vNode));
    }
    if (flags & 8 /* VNodeFlags.ComponentFunction */) {
      return hasMoveHook(vNode.ref) !== 0 || hasCandidates(input(vNode));
    }
    if (flags & 8192 /* VNodeFlags.Fragment */) {
      return vNode.childFlags === 2 /* ChildFlags.HasVNodeChildren */ ? hasCandidates(input(vNode)) : vNode.children.some(hasCandidates);
    }
    return false;
  }
  function coverRoots(vNode, covered) {
    const flags = vNode.flags;
    if (flags & 481 /* VNodeFlags.Element */) covered.add(vNode.dom);else if (flags & 14 /* VNodeFlags.Component */) coverRoots(input(vNode), covered);else if (flags & 8192 /* VNodeFlags.Fragment */) {
      if (vNode.childFlags === 2 /* ChildFlags.HasVNodeChildren */) coverRoots(input(vNode), covered);else for (const child of vNode.children) coverRoots(child, covered);
    }
  }
  function preparedOwnerElements() {
    let vNode = preparedOwner;
    if (vNode === null) return null;
    while (vNode.flags & 14 /* VNodeFlags.Component */) vNode = input(vNode);
    if (!(vNode.flags & 8192 /* VNodeFlags.Fragment */)) return null;
    const elements = new Set();
    coverRoots(vNode, elements);
    return elements;
  }
  function visit(vNode, list, covered) {
    const flags = vNode.flags;
    if (flags & 14 /* VNodeFlags.Component */) {
      const isClass = Boolean(flags & 4 /* VNodeFlags.ComponentClass */);
      const owner = isClass ? vNode.children : vNode.ref;
      if (isClass && (!owner || owner.$UN)) return false;
      const hook = owner && (isClass ? owner.componentWillMove : owner.onComponentWillMove);
      if (typeof hook === 'function') {
        const dom = findElementFromVNode(vNode);
        if (!dom || dom.parentNode !== list.parent) return false;
        if (covered && !covered.has(dom)) {
          coverRoots(vNode, covered);
          const outerOwner = preparedOwner;
          preparedOwner = vNode;
          try {
            if (isClass) hook.call(owner, list.owner, list.parent, dom);else hook.call(owner, list.owner, list.parent, dom, vNode.props);
          } finally {
            preparedOwner = outerOwner;
          }
        }
        return true;
      }
      return visit(input(vNode), list, covered);
    }
    if (flags & 8192 /* VNodeFlags.Fragment */) {
      if (vNode.childFlags === 2 /* ChildFlags.HasVNodeChildren */) return visit(input(vNode), list, covered);
      let found = false;
      for (const child of vNode.children) {
        if (visit(child, list, covered)) {
          found = true;
          if (!covered) break;
        }
      }
      return found;
    }
    return false;
  }
  function attach(list, parent) {
    list.parent = parent;
    let siblings = parents.get(parent);
    if (!siblings) parents.set(parent, siblings = new Set());
    siblings.add(list);
  }
  function detach(list) {
    const siblings = parents.get(list.parent);
    siblings?.delete(list);
    if (siblings?.size === 0) {
      parents.delete(list.parent);
      cancelRemovals(list.parent);
    }
  }
  function refresh(list) {
    list.active = list.children.some(hasCandidates);
    list.version = topologyVersion;
    if (list.active) attach(list, list.parent);else detach(list);
  }
  function fragmentListOf(vNode) {
    return vNode.flags & 8192 /* VNodeFlags.Fragment */ && vNode.childFlags === 8 /* ChildFlags.HasKeyedChildren */ ? fragmentLists.get(vNode.children) : undefined;
  }
  // The list of a keyed element or fragment, synced to vNode: created when missing, rescanned for
  // hooks when owner changes happened since, or when its children are not the ones last seen (a
  // patch that threw keeps the old vNode and its written-back children).
  function track(vNode, parent) {
    if (vNode.childFlags !== 8 /* ChildFlags.HasKeyedChildren */) return;
    const children = vNode.children;
    const isFragment = (vNode.flags & 8192 /* VNodeFlags.Fragment */) !== 0;
    let list = isFragment ? fragmentLists.get(children) : elementLists.get(parent);
    if (list === undefined) {
      list = {
        owner: vNode,
        children,
        parent,
        active: false,
        version: -1
      };
      if (isFragment) fragmentLists.set(children, list);else elementLists.set(parent, list);
    } else if (list.children !== children) {
      list.children = children;
      list.version = -1;
    }
    list.owner = vNode;
    if (list.version !== topologyVersion) refresh(list);
    return list;
  }
  function forget(list, isFragment) {
    if (isFragment) fragmentLists.delete(list.children);else elementLists.delete(list.parent);
    detach(list);
  }
  function coverageOf(commit) {
    let covered = coverage.get(commit);
    if (covered === undefined) coverage.set(commit, covered = new Set());
    return covered;
  }
  // Whether the owner whose element was found last renders a fragment (set by firstElement) or was
  // reached through one (set by ownerElement)
  let ownerInFragment = false;
  // Whether the list being prepared keeps its keys in the same order with every item retained
  let keysKept = false;
  // Whether the owner whose move hook runs can move in this update. An owner of a list that keeps
  // its keys cannot, unless it may share its parent with an inner keyed fragment that reorders,
  // whose own hooks the enclosing owner covers.
  function preparedOwnerMayMove() {
    return !keysKept || ownerInFragment;
  }
  // The first element that vNode renders, or null when that is text, a placeholder or a portal
  function firstElement(vNode) {
    ownerInFragment = false;
    for (;;) {
      const flags = vNode.flags;
      if (flags & 481 /* VNodeFlags.Element */) return vNode.dom;
      if (flags & 8192 /* VNodeFlags.Fragment */) {
        ownerInFragment = true;
        return findElementFromVNode(vNode);
      }
      if ((flags & 14 /* VNodeFlags.Component */) === 0) return null;
      vNode = input(vNode);
    }
  }
  // Calls the move hook of vNode's outermost owner, or of every owner in a fragment. Only a keyed
  // fragment list shares its parent with an enclosing list, so only its items are checked against
  // the parent and against the elements that the enclosing list prepared.
  function prepareOwner(vNode, list, commit, inFragment) {
    let flags = vNode.flags;
    while (flags & 14 /* VNodeFlags.Component */) {
      if (flags & 4 /* VNodeFlags.ComponentClass */) {
        const instance = vNode.children;
        if (instance === null || instance.$UN) return;
        if (typeof instance.componentWillMove === 'function') {
          const dom = ownerElement(vNode, list, commit, inFragment);
          if (dom !== null) {
            instance.componentWillMove(list.owner, list.parent, dom);
          }
          return;
        }
      } else {
        const hooks = vNode.ref;
        if (hooks != null && typeof hooks.onComponentWillMove === 'function') {
          const dom = ownerElement(vNode, list, commit, inFragment);
          if (dom !== null) {
            hooks.onComponentWillMove(list.owner, list.parent, dom, vNode.props);
          }
          return;
        }
      }
      vNode = input(vNode);
      flags = vNode.flags;
    }
    if (flags & 8192 /* VNodeFlags.Fragment */) {
      if (vNode.childFlags === 2 /* ChildFlags.HasVNodeChildren */) {
        prepareOwner(input(vNode), list, commit, true);
      } else {
        for (const child of vNode.children) {
          prepareOwner(child, list, commit, true);
        }
      }
    }
  }
  // The element an owner's hook gets, or null when it has none in the list's parent or an enclosing
  // list prepared it already. Records the owner's elements when a keyed fragment list may share them.
  function ownerElement(owner, list, commit, inFragment) {
    const dom = firstElement(owner);
    if (dom === null) return null;
    if (list.owner.flags & 8192 /* VNodeFlags.Fragment */) {
      if (dom.parentNode !== list.parent) return null;
      const covered = coverage.get(commit);
      if (covered !== undefined && covered.has(dom)) return null;
    }
    if (inFragment || ownerInFragment) {
      ownerInFragment = true;
      coverRoots(owner, coverageOf(commit));
    }
    preparedOwner = owner;
    return dom;
  }
  function isRetained(child, next) {
    return next !== undefined && next.type === child.type && !((next.flags ^ child.flags) & -81921 /* VNodeFlags.InUseOrNormalized */) && !(next.flags & 2048 /* VNodeFlags.ReCreate */);
  }
  // Calls the hooks of the items of last that stay in next, before either is patched
  function prepareItems(list, previous, children, commit, cancel) {
    const lastLength = previous.length;
    const nextLength = children.length;
    // Items before prefix and from lastEnd on keep their place at either end, so only the items
    // between need a key map
    let prefix = 0;
    // Items before kept are also retained
    let kept = 0;
    while (prefix < lastLength && prefix < nextLength) {
      const child = previous[prefix];
      const next = children[prefix];
      if (child.key !== next.key) break;
      if (kept === prefix && isRetained(child, next)) kept++;
      prefix++;
    }
    let lastEnd = lastLength;
    let nextEnd = nextLength;
    while (lastEnd > prefix && nextEnd > prefix && previous[lastEnd - 1].key === children[nextEnd - 1].key) {
      lastEnd--;
      nextEnd--;
    }
    let nextByKey;
    // A few moved items are found by a scan; more of them build the key map
    let scans = 4;
    const outerKeysKept = keysKept;
    const outerOwnerInFragment = ownerInFragment;
    const outerOwner = preparedOwner;
    keysKept = kept === lastLength && lastLength === nextLength;
    try {
      for (let i = 0; i < lastLength; i++) {
        const child = previous[i];
        let retained;
        if (i < prefix) {
          retained = children[i];
        } else if (i >= lastEnd) {
          retained = children[i - lastLength + nextLength];
        } else {
          retained = i < nextEnd ? children[i] : undefined;
          if (retained === undefined || retained.key !== child.key) {
            retained = undefined;
            if (nextByKey !== undefined) {
              retained = nextByKey.get(child.key);
            } else if (scans-- > 0) {
              for (let j = prefix; j < nextEnd; j++) {
                if (children[j].key === child.key) {
                  retained = children[j];
                  break;
                }
              }
            } else {
              nextByKey = new Map();
              for (let j = prefix; j < nextEnd; j++) {
                nextByKey.set(children[j].key, children[j]);
              }
              retained = nextByKey.get(child.key);
            }
          }
        }
        if (i < kept || isRetained(child, retained)) {
          prepareOwner(child, list, commit, false);
        }
      }
    } catch (error) {
      cancel(list.parent);
      throw error;
    } finally {
      keysKept = outerKeysKept;
      ownerInFragment = outerOwnerInFragment;
      preparedOwner = outerOwner;
    }
  }
  function collectNestedLists(vNode, nested) {
    const flags = vNode.flags;
    if (flags & 14 /* VNodeFlags.Component */) {
      if (flags & 4 /* VNodeFlags.ComponentClass */ && vNode.children.$UN) return;
      collectNestedLists(input(vNode), nested);
    } else if (flags & 8192 /* VNodeFlags.Fragment */) {
      const list = fragmentListOf(vNode);
      if (list?.active) {
        nested.add(list);
        return;
      }
      if (vNode.childFlags === 2 /* ChildFlags.HasVNodeChildren */) collectNestedLists(input(vNode), nested);else for (const child of vNode.children) collectNestedLists(child, nested);
    }
  }
  function prepareRemoval(parent, invoke) {
    const siblings = parents.get(parent);
    if (!siblings) return false;
    const covered = invoke ? new Set() : undefined;
    const nested = new Set();
    let found = false;
    // Outer owners cover inner fragment roots regardless of mount order.
    if (siblings.size > 1) {
      for (const list of siblings) {
        for (const child of list.children) collectNestedLists(child, nested);
      }
    }
    for (const list of siblings) {
      if (nested.has(list)) continue;
      for (const child of list.children) {
        if (visit(child, list, covered)) {
          found = true;
          if (!invoke) return true;
        }
      }
    }
    return found;
  }
  function installMoveAnimations(cancel) {
    const adapter = {
      mountClass(instance) {
        if (!instance.$UN && !classOwners.has(instance)) {
          classOwners.add(instance);
          changeOwners(adapter, 1);
        }
      },
      unmountClass(instance) {
        if (classOwners.delete(instance)) changeOwners(adapter, -1);
      },
      updateHooks(lastRef, nextRef) {
        const delta = hasMoveHook(nextRef) - hasMoveHook(lastRef);
        if (delta !== 0) changeOwners(adapter, delta);
      },
      prepare(last, next, parent, commit) {
        const list = track(last, parent);
        if (next.childFlags === 8 /* ChildFlags.HasKeyedChildren */) {
          const children = next.children;
          if (list.active) prepareItems(list, last.children, children, commit, cancel);
          // Follows the patch: the next prepare finds next's children here
          list.owner = next;
          list.children = children;
        } else {
          forget(list, false);
        }
      },
      prepareFragment(last, nextChildren, parent, commit) {
        const list = track(last, parent);
        if (nextChildren !== null) {
          if (list.active) prepareItems(list, last.children, nextChildren, commit, cancel);
          fragmentLists.delete(list.children);
          list.children = nextChildren;
          fragmentLists.set(nextChildren, list);
        } else {
          forget(list, true);
        }
      },
      unmountList(vNode) {
        if (vNode.flags & 8192 /* VNodeFlags.Fragment */) {
          const list = fragmentLists.get(vNode.children);
          if (list !== undefined) {
            forget(list, true);
            // Moves in progress inside the parent end with its last list
            if (!parents.has(list.parent)) cancel(list.parent);
          }
        } else {
          const list = elementLists.get(vNode.dom);
          if (list !== undefined) forget(list, false);
          cancel(vNode.dom);
        }
      },
      reparent(vNode, parent) {
        const flags = vNode.flags;
        if (flags & 14 /* VNodeFlags.Component */) this.reparent(input(vNode), parent);else if (flags & 8192 /* VNodeFlags.Fragment */) {
          const list = fragmentListOf(vNode);
          if (list && list.parent !== parent) {
            cancel(list.parent);
            detach(list);
            list.parent = parent;
            if (list.active) attach(list, parent);
          }
          if (vNode.childFlags === 2 /* ChildFlags.HasVNodeChildren */) this.reparent(input(vNode), parent);else for (const child of vNode.children) this.reparent(child, parent);
        }
      },
      remove(parent, callback) {
        if (!parent.isConnected || !hasQueuedRemoval(parent) && !prepareRemoval(parent, false)) callback();else queueRemoval(parent, () => {
          try {
            prepareRemoval(parent, true);
          } catch (error) {
            cancel(parent);
            throw error;
          }
        }, callback);
      }
    };
    setMoveAnimations(adapter, false);
  }
  function getAnimationClass(animationProp, prefix) {
    let animCls;
    if (!isNullOrUndef(animationProp) && typeof animationProp === 'object') {
      animCls = animationProp;
    } else {
      const animationName = animationProp || 'inferno-animation';
      const placeholder = animationName + prefix;
      animCls = {
        active: placeholder + '-active',
        end: placeholder + '-end',
        start: placeholder
      };
    }
    return animCls;
  }
  function componentDidAppear(dom, props) {
    // Get dimensions and unpack class names
    const cls = getAnimationClass(props.animation, '-enter');
    // Moved measuring to pre_initialize. It causes a reflow for each component beacuse of the setDisplay of previous component.
    const dimensions = {};
    const enter = {
      cls,
      display: setDisplay(dom, 'none'),
      activated: false,
      cancelled: false,
      sizes: [],
      transforms: []
    };
    entering.set(dom, enter);
    const sourceState = props.globalAnimationKey === undefined ? null : consumeGlobalAnimationSource(props.globalAnimationKey);
    queueAnimation(phase => {
      if (!enter.cancelled) {
        _didAppear(phase, dom, enter, dimensions, sourceState);
      }
    }, dom.parentNode);
  }
  function _finishEnter(dom, enter) {
    entering.delete(dom);
    // 5. Restore the application's width and height
    restoreStyles(dom.style, enter.sizes);
    removeClassName$1(dom, enter.cls.active + ' ' + enter.cls.end);
    // 6. Call callback to allow stuff to happen
    // Not currently used but this is where one could
    // add a call to something like this.didAppearDone
  }
  function _didAppear(phase, dom, enter, dimensions, sourceState) {
    const cls = enter.cls;
    const fromSource = !isNullOrUndef(sourceState) && dimensions.width !== 0 && dimensions.height !== 0;
    switch (phase) {
      case 1 /* AnimationPhase.INITIALIZE */:
        // Needs to be done in a single pass to avoid reflows
        // We set display: none whilst waiting for an animation frame to avoid flicker
        resetDisplay(dom, enter.display);
        return;
      case 2 /* AnimationPhase.MEASURE */:
        // In case of img element that hasn't been loaded, just trigger reflow
        if (dom.tagName !== 'IMG' || dom.complete) {
          const tmp = getDimensions(dom);
          dimensions.x = tmp.x;
          dimensions.y = tmp.y;
          dimensions.width = tmp.width;
          dimensions.height = tmp.height;
        } else {
          forceReflow$1();
        }
        return;
      case 3 /* AnimationPhase.SET_START_STATE */:
        // 1. Set start of animation
        if (fromSource) {
          // const diffX = (sourceState.width - dimensions.width) / 2;
          // const diffY = (sourceState.height - dimensions.height) / 2;
          const dx = sourceState.x - dimensions.x;
          const dy = sourceState.y - dimensions.y;
          const scaleX = sourceState.width / dimensions.width;
          const scaleY = sourceState.height / dimensions.height;
          enter.transforms = saveStyles(dom.style, ['transform', 'transform-origin']);
          setTransform(dom, dx, dy, scaleX, scaleY);
          markApplied(dom.style, enter.transforms);
        }
        addClassName$1(dom, cls.start);
        return;
      case 9 /* AnimationPhase.ACTIVATE_TRANSITIONS */:
        // 2. Activate transition (after a reflow)
        addClassName$1(dom, cls.active);
        return;
      case 10 /* AnimationPhase.ACTIVATE_ANIMATION */:
        // 4. Activate target state (called async via requestAnimationFrame)
        enter.activated = true;
        // A global animation transitions to the application's transform
        restoreStyles(dom.style, enter.transforms);
        enter.sizes = saveStyles(dom.style, ['width', 'height']);
        setDimensions(dom, dimensions.width, dimensions.height);
        markApplied(dom.style, enter.sizes);
        removeClassName$1(dom, cls.start);
        addClassName$1(dom, cls.end);
        break;
      case 11 /* AnimationPhase.REGISTER_LISTENERS */:
        // Start the timeout after activation; zero-duration transitions must not
        // clean up before the following frame installs the target styles.
        enter.stop = registerTransitionListener$1([dom], () => _finishEnter(dom, enter));
    }
  }
  // The values that the running transitions of dom have reached, except its width and height
  function reachedValues(dom) {
    const reached = [];
    let style = null;
    for (const animation of dom.getAnimations?.() || []) {
      if ('transitionProperty' in animation && (animation.playState === 'running' || animation.playState === 'paused')) {
        const property = animation.transitionProperty;
        if (property !== 'width' && property !== 'height') {
          style ??= window.getComputedStyle(dom);
          reached.push([property, style.getPropertyValue(property)]);
        }
      }
    }
    return reached;
  }
  // The leave takes over from the enter it interrupts: the element keeps the values that the enter's
  // transitions have reached, until the leave activates its own. Removing the enter's classes
  // cancels those transitions within this animation pass, before the leave listens for transitions.
  function _interruptEnter(dom, leave) {
    const enter = leave.enter;
    const style = dom.style;
    removeClassName$1(dom, enter.cls.start + ' ' + enter.cls.active + ' ' + enter.cls.end);
    restoreStyles(style, enter.transforms);
    restoreStyles(style, enter.sizes);
    leave.held = saveStyles(style, leave.reached.map(([property]) => property));
    for (const [property, value] of leave.reached) {
      style.setProperty(property, value);
    }
    markApplied(style, leave.held);
  }
  function componentWillDisappear(dom, props, callback) {
    const enter = entering.get(dom);
    if (enter !== undefined) {
      entering.delete(dom);
      enter.cancelled = true;
      enter.stop?.();
      // Nothing of the element has been visible, so there is nothing to animate
      if (!enter.activated) {
        callback();
        return;
      }
    }
    leaving.add(dom);
    // A move that ended with its list in this commit
    const hold = released.get(dom);
    if (hold !== undefined) {
      released.delete(dom);
      holdOffset(dom, hold);
    }
    // A leave is measured with the others once the commit's writes are done: a read between them
    // would lay the document out again for every leaving element. A global animation hands its
    // source to an element that may enter in another pass, so it is measured now.
    const deferred = props.globalAnimationKey === undefined;
    const leave = {
      cls: getAnimationClass(props.animation, '-leave'),
      dimensions: deferred ? {
        x: 0,
        y: 0,
        width: 0,
        height: 0
      } : getDimensions(dom),
      deferred,
      enter: enter ?? null,
      reached: [],
      held: [],
      sizes: [],
      hold: null
    };
    queueAnimation(phase => {
      _willDisappear(phase, dom, callback, leave);
    }, dom.parentNode);
    if (!deferred) {
      addGlobalAnimationSource(props.globalAnimationKey, leave.dimensions);
      dom.style.setProperty('visibility', 'hidden');
    }
  }
  function _willDisappear(phase, dom, callback, leave) {
    const {
      cls,
      dimensions
    } = leave;
    const style = dom.style;
    const move = moving.get(dom);
    switch (phase) {
      case 0 /* AnimationPhase.MEASURE_LEAVES */:
        if (leave.deferred) {
          const measured = getDimensions(dom);
          dimensions.x = measured.x;
          dimensions.y = measured.y;
          dimensions.width = measured.width;
          dimensions.height = measured.height;
        }
        if (leave.enter !== null) leave.reached = reachedValues(dom);
        if (move !== undefined) leave.hold = reachedOffset(move);
        return;
      case 1 /* AnimationPhase.INITIALIZE */:
        // The element stays where its move has brought it
        if (move !== undefined) {
          finishMove(move);
          if (leave.hold !== null) holdOffset(dom, leave.hold);
        }
        if (leave.enter !== null) _interruptEnter(dom, leave);
        // Write leave styles before the shared measurement phases.
        // 1. Set animation start state and dimensions
        leave.sizes = saveStyles(style, ['width', 'height']);
        setDimensions(dom, dimensions.width, dimensions.height);
        markApplied(style, leave.sizes);
        addClassName$1(dom, cls.start);
        return;
      case 9 /* AnimationPhase.ACTIVATE_TRANSITIONS */:
        // 2. Activate transition (after a reflow)
        addClassName$1(dom, cls.active);
        return;
      case 10 /* AnimationPhase.ACTIVATE_ANIMATION */:
        // 4. Activate target state (called async via requestAnimationFrame)
        addClassName$1(dom, cls.end);
        removeClassName$1(dom, cls.start);
        restoreStyles(style, leave.sizes);
        restoreStyles(style, leave.held);
        break;
      case 11 /* AnimationPhase.REGISTER_LISTENERS */:
        registerTransitionListener$1([dom], callback);
    }
  }
  const moveBatches = new WeakMap();
  const moving = new WeakMap();
  const entering = new WeakMap();
  const leaving = new WeakSet();
  // The offsets of the moves that ended with their list in the current task: the leaves of their
  // elements, which the commit starts after it has unmounted the list, hold them
  const released = new Map();
  const transitionProperties = ['transition-property', 'transition-duration', 'transition-delay', 'transition-timing-function', 'transition-behavior'];
  function parentTransitions(parent) {
    // getAnimations may update the document's animation/style state. Query the
    // parent once instead of repeating that work for every sibling.
    return parent.getAnimations?.({
      subtree: true
    }) || [];
  }
  function transitionTarget(animation, parent) {
    const target = animation.effect?.target;
    return target?.parentNode === parent ? target : null;
  }
  function animatesTransform(animation) {
    const effect = animation.effect;
    return Boolean(effect?.getKeyframes?.().some(keyframe => 'transform' in keyframe));
  }
  // The children of parent that run an author transition. Those whose transform a keyframe animation
  // sets are added to keyframed; an animation that has finished sets it while it fills forwards.
  function authorTransitions(parent, keyframed) {
    const authors = new Set();
    for (const animation of parentTransitions(parent)) {
      const node = transitionTarget(animation, parent);
      if (node === null) continue;
      if ('transitionProperty' in animation) {
        const item = moving.get(node);
        if (animation.playState !== 'finished' && animation.playState !== 'idle' && animation !== item?.ownedTransition && animation !== item?.previous?.ownedTransition) authors.add(node);
      } else if (keyframed !== null && animatesTransform(animation)) {
        keyframed.add(node);
      }
    }
    return authors;
  }
  function readChildAnimations(batch) {
    batch.keyframed = new Set();
    batch.authors = authorTransitions(batch.parent, batch.keyframed);
  }
  // How far the patch in progress has shifted the children of parent. Their list is patched after
  // the items before it in the list around it, whose removal shifts it. The shift is that of the
  // nearest element around them whose position was read before the patch.
  function sourceDrift(parent) {
    for (let node = parent, outer = node.parentNode; outer !== null; node = outer, outer = node.parentNode) {
      const batch = moveBatches.get(outer);
      if (batch !== undefined && !batch.initialized) {
        const item = moving.get(node);
        const index = batch.nodes.indexOf(node);
        const retargeted = item !== undefined && item.batch === batch;
        if (!retargeted && index === -1) return null;
        const geometry = getGeometry(node);
        return {
          x: geometry.x - (retargeted ? item.x : batch.xs[index]),
          y: geometry.y - (retargeted ? item.y : batch.ys[index])
        };
      }
    }
    return null;
  }
  function componentWillMove(_parentVNode, parent, dom, props) {
    // A list that keeps its keys in order moves nothing, and a running move keeps going. A later
    // commit of the same task that moves something reads the sources then.
    if (!parent || !preparedOwnerMayMove()) return;
    const pending = moveBatches.get(parent);
    const animation = props?.animation;
    // Consecutive synchronous commits share their first visible source positions.
    if (pending && !pending.initialized) {
      const sameAnimation = animation === pending.animation;
      if (sameAnimation && pending.ownerClasses === null) return;
      const classes = sameAnimation ? pending.activeClasses : getAnimationClass(animation, '-move').active.split(' ').filter(name => name !== '');
      const ownerClasses = pending.ownerClasses ??= new Map();
      const elements = preparedOwnerElements();
      if (elements === null) {
        ownerClasses.set(dom, classes);
      } else {
        for (const element of elements) ownerClasses.set(element, classes);
      }
      return;
    }
    const cls = getAnimationClass(animation, '-move');
    const batch = {
      parent,
      items: [],
      nodes: [],
      xs: [],
      ys: [],
      initialized: false,
      remaining: 0,
      retargets: 0,
      moved: false,
      authors: null,
      keyframed: null,
      space: null,
      animation,
      activeClasses: cls.active.split(' ').filter(name => name !== ''),
      ownerClasses: null
    };
    const skipped = [];
    const authors = authorTransitions(parent, null);
    for (let child = parent.firstChild; child !== null; child = child.nextSibling) {
      if (child.nodeType !== 1) continue;
      const node = child;
      const previous = moving.get(node);
      if (leaving.has(node)) continue; // Its leave ends its move
      if (entering.has(node) || authors.has(node)) {
        if (previous) skipped.push(previous);
        continue;
      }
      const geometry = getGeometry(node);
      // A hidden element has no source position
      if (!hasBox(node, geometry)) {
        if (previous) skipped.push(previous);
      } else if (previous === undefined) {
        batch.nodes.push(node);
        batch.xs.push(geometry.x);
        batch.ys.push(geometry.y);
      } else {
        addMoveItem(batch, node, geometry.x, geometry.y, previous);
        batch.retargets++;
      }
    }
    // Finish skipped old moves only after all new source positions were read.
    for (const item of skipped) finishMove(item);
    if (batch.items.length === 0 && batch.nodes.length === 0) return;
    const drift = sourceDrift(parent);
    if (drift !== null) {
      for (let i = 0; i < batch.xs.length; i++) {
        batch.xs[i] -= drift.x;
        batch.ys[i] -= drift.y;
      }
      for (const item of batch.items) {
        item.x -= drift.x;
        item.y -= drift.y;
      }
    }
    pending?.cancel?.();
    moveBatches.set(parent, batch);
    batch.cancel = queueAnimation(phase => runMove(phase, batch), parent);
    scheduleMoveFlush(parent);
  }
  function addMoveItem(batch, node, x, y, previous) {
    const item = {
      batch,
      done: false,
      node,
      x,
      y,
      dx: 0,
      dy: 0,
      linear: IDENTITY,
      property: 'transform',
      baseTransform: '',
      translate: 'none',
      offset: [],
      transitions: [],
      overrides: [],
      initialized: false,
      addedClasses: '',
      starting: false,
      instant: false,
      superseded: false,
      previous
    };
    batch.items.push(item);
    batch.remaining++;
    moving.set(node, item);
    return item;
  }
  // A computed transition-duration or -delay list of zeros, such as "0s" or "0s, 0ms"
  function isZeroTime(value) {
    for (const time of value.split(',')) {
      if (parseFloat(time) !== 0) return false;
    }
    return true;
  }
  function disableTransitions(item) {
    const style = item.node.style;
    item.transitions = saveStyles(style, transitionProperties);
    // A declaration that the shorthand serializes is written back as it was read: longhands written
    // one by one make the values it left out explicit, which older WebKit then includes in the
    // shorthand. Pending-substitution shorthands (and minimal DOM implementations) may not expose
    // longhand values. Either way the declaration is preserved as an indivisible unit.
    if (style.getPropertyValue('transition') || item.transitions.every(entry => !entry.value)) {
      item.transitions = saveStyles(style, ['transition']);
    }
    // Only displaced elements without an author transition reach this write.
    style.setProperty('transition', 'none', 'important');
    markApplied(style, item.transitions);
  }
  function restoreTransitions(item) {
    restoreStyles(item.node.style, item.transitions);
  }
  // Writes the offset and records it, so that cleanup restores only a value the move wrote
  function writeOffset(item, value) {
    const style = item.node.style;
    const saved = item.offset[0];
    style.setProperty(saved.property, value, saved.priority);
    markApplied(style, item.offset);
  }
  function restoreMoveStyles(item) {
    item.cancel?.();
    if (item.previous) {
      disposeMove(item.previous);
      item.previous = undefined;
    }
    if (!item.initialized) return;
    const style = item.node.style;
    restoreStyles(style, item.offset);
    restoreStyles(style, item.overrides);
    restoreTransitions(item);
    removeClassName$1(item.node, item.addedClasses);
  }
  function disposeMove(item) {
    if (item.done) return;
    item.done = true;
    restoreMoveStyles(item);
    if (--item.batch.remaining === 0) {
      item.batch.cancel?.();
      if (moveBatches.get(item.batch.parent) === item.batch) moveBatches.delete(item.batch.parent);
    }
  }
  function finishMove(item) {
    if (moving.get(item.node) === item) {
      disposeMove(item);
      moving.delete(item.node);
    }
  }
  // The declaration that keeps the element of item at the offset that its running move has reached.
  // An offset in the transform is held in translate where possible, so that the leave can animate
  // the transform; the element's own rotate and scale apply to the one but not to the other.
  function reachedOffset(item) {
    const running = item.initialized ? item : item.previous;
    if (running === undefined || !running.initialized) return null;
    const {
      node,
      property,
      linear
    } = running;
    const reached = window.getComputedStyle(node).getPropertyValue(property);
    if (!reached || reached === 'none') return null;
    if (property === 'transform' && running.translate === 'none' && 'translate' in node.style) {
      const to = matrix(reached);
      const from = matrix(running.baseTransform);
      const x = to[4] - from[4];
      const y = to[5] - from[5];
      return {
        property: 'translate',
        value: `${linear[0] * x + linear[2] * y}px ${linear[1] * x + linear[3] * y}px`,
        priority: ''
      };
    }
    return {
      property,
      value: reached,
      priority: running.offset[0].priority
    };
  }
  function holdOffset(node, hold) {
    node.style.setProperty(hold.property, hold.value, hold.priority);
  }
  function isCurrent(item) {
    return !item.done && moving.get(item.node) === item;
  }
  function isLeaving(item) {
    return isCurrent(item) && leaving.has(item.node);
  }
  // Finishes the moves of elements that leave, or that may leave in this commit: they stay where the
  // moves have brought them. Every offset is read before the first move is finished.
  function finishHeld(items) {
    const holds = items.map(reachedOffset);
    for (let i = 0; i < items.length; i++) {
      const node = items[i].node;
      const hold = holds[i];
      finishMove(items[i]);
      if (hold === null) continue;
      if (leaving.has(node)) {
        holdOffset(node, hold);
      } else {
        if (released.size === 0) {
          queueMicrotask(() => {
            released.clear();
          });
        }
        released.set(node, hold);
      }
    }
  }
  function cancelMoves(parent) {
    const batch = moveBatches.get(parent);
    if (!batch) return;
    batch.cancel?.();
    finishHeld(batch.items.filter(isCurrent));
    moveBatches.delete(parent);
  }
  // An item moves when its element is displaced, or when an element around it starts a move that
  // carries it along (carried): an element that ends where it was moves against that one
  function measureMove(item, geometry, carried) {
    // A hidden element has no target position
    if (!hasBox(item.node, geometry)) {
      item.dx = item.dy = 0;
      return;
    }
    item.dx = item.x - geometry.x;
    item.dy = item.y - geometry.y;
    if (item.dx !== 0 || item.dy !== 0 || carried) {
      item.starting = true;
      item.batch.moved = true;
      const style = window.getComputedStyle(item.node);
      const transform = style.transform;
      item.baseTransform = transform === 'none' ? '' : transform;
      item.translate = style.translate || 'none';
      item.linear = ownLinear(style);
      item.instant = item.transitions.length === 0 && isZeroTime(style.transitionDuration) && isZeroTime(style.transitionDelay);
    }
  }
  // The elements without a running move that moved get an item
  function measureNodes(batch, carried) {
    const {
      nodes,
      xs,
      ys
    } = batch;
    batch.nodes = [];
    batch.xs = [];
    batch.ys = [];
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (node.parentNode !== batch.parent || !node.isConnected || entering.has(node) || leaving.has(node) || moving.has(node) || batch.authors !== null && batch.authors.has(node)) {
        continue;
      }
      const geometry = getGeometry(node);
      if ((carried || geometry.x !== xs[i] || geometry.y !== ys[i]) && hasBox(node, geometry)) {
        measureMove(addMoveItem(batch, node, xs[i], ys[i], undefined), geometry, carried);
      }
    }
  }
  // The nearest element around parent that starts a move in this animation pass
  function startingAncestor(parent) {
    for (let node = parent; node !== null; node = node.parentNode) {
      const item = moving.get(node);
      if (item !== undefined && item.starting && !item.done) return item;
    }
    return null;
  }
  // Writes the start state of an item that moves, or finishes it when its offset disappears
  function startMove(item, outer) {
    const {
      node,
      batch
    } = item;
    // A moving ancestor carries the item along with its own offset
    const dx = outer === null ? item.dx : item.dx - outer.dx;
    const dy = outer === null ? item.dy : item.dy - outer.dy;
    // The offset in the element's coordinates. Its own rotate and scale apply to an offset in its
    // transform, but not to one in translate, which applies before them.
    const offset = solve(item.property === 'translate' ? batch.space : multiply(batch.space, item.linear), dx, dy);
    if (offset === null || Math.abs(offset.x) < 0.01 && Math.abs(offset.y) < 0.01) {
      restoreTransitions(item);
      finishMove(item);
      return;
    }
    item.offset = saveStyles(node.style, [item.property]);
    item.initialized = true;
    // Without a transition the start offset applies at once
    if (!item.transitions.length && !item.instant) {
      disableTransitions(item);
    }
    writeOffset(item, item.property === 'translate' ? `${offset.x}px ${offset.y}px` : `translate(${offset.x}px,${offset.y}px) ${item.baseTransform}`);
  }
  // The move classes transition the transform, which the keyframe animation sets: the move's
  // transition applies to translate instead
  function transitionTranslate(item) {
    const style = item.node.style;
    const properties = window.getComputedStyle(item.node).transitionProperty;
    const list = properties.split(',').map(name => name.trim());
    if (!list.includes('transform')) return;
    item.overrides = saveStyles(style, ['transition-property']);
    style.setProperty('transition-property', list.map(name => name === 'transform' ? 'translate' : name).join(', '), 'important');
    markApplied(style, item.overrides);
  }
  function runMove(phase, batch) {
    if (moveBatches.get(batch.parent) !== batch) return;
    // The first phases belong to enter and leave animations
    if (phase < 4 /* AnimationPhase.READ_MOVES */) {
      if (phase === 1 /* AnimationPhase.INITIALIZE */) batch.initialized = true;
      return;
    }
    // Items that were removed, moved by a newer batch, or started entering or leaving drop out in
    // the first phase of the microtask pass and of activation. The phases after each run
    // synchronously, in which items only finish.
    const verify = phase === 4 /* AnimationPhase.READ_MOVES */ || phase === 10 /* AnimationPhase.ACTIVATE_ANIMATION */;
    let live = 0;
    // Author transitions exclude an element from the move, and a keyframe animation of its transform
    // moves it with translate. Before a running move is reset they are read in READ_MOVES;
    // otherwise once after measuring, and only when something moved.
    if (phase === 4 /* AnimationPhase.READ_MOVES */) {
      if (batch.retargets !== 0) readChildAnimations(batch);
    } else if (phase === 7 /* AnimationPhase.SELECT_MOVES */ && batch.authors === null && batch.moved) {
      readChildAnimations(batch);
    }
    // Nested moves subtract the offset of the element around them that carries them. The elements
    // that start a move are known once they are measured, and those that an author transition
    // excludes have dropped out when every batch of the pass has completed SELECT_MOVES.
    const outer = phase === 6 /* AnimationPhase.MEASURE_MOVES */ || phase === 8 /* AnimationPhase.SET_MOVE_START_STATE */ ? startingAncestor(batch.parent) : null;
    if (verify) {
      const leavers = batch.items.filter(isLeaving);
      if (leavers.length !== 0) finishHeld(leavers);
    }
    if (phase === 11 /* AnimationPhase.REGISTER_LISTENERS */) {
      for (const animation of parentTransitions(batch.parent)) {
        if ('transitionProperty' in animation) {
          const node = transitionTarget(animation, batch.parent);
          const item = node && moving.get(node);
          if (item && item.batch === batch && animation.transitionProperty === item.property) item.ownedTransition = animation;
        }
      }
    }
    for (const item of batch.items) {
      if (item.done || item.superseded) continue;
      const {
        node
      } = item;
      if (verify) {
        if (moving.get(node) !== item) {
          item.superseded = true;
          continue;
        }
        if (node.parentNode !== batch.parent || !node.isConnected || entering.has(node)) {
          finishMove(item);
          continue;
        }
        live++;
      }
      switch (phase) {
        case 4 /* AnimationPhase.READ_MOVES */:
          // A patch may have started a new author transition since the source read.
          if (batch.authors !== null && batch.authors.has(node)) finishMove(item);
          break;
        case 5 /* AnimationPhase.RESET_MOVES */:
          if (item.previous) {
            // Only our own running move is interrupted for retargeting.
            item.previous.cancel?.();
            restoreStyles(node.style, item.previous.overrides);
            disableTransitions(item);
            disposeMove(item.previous);
            item.previous = undefined;
          }
          break;
        case 6 /* AnimationPhase.MEASURE_MOVES */:
          measureMove(item, getGeometry(node), outer !== null);
          break;
        case 7 /* AnimationPhase.SELECT_MOVES */:
          if (!item.starting || batch.authors !== null && batch.authors.has(node)) {
            restoreTransitions(item);
            finishMove(item);
          } else if (
          // An offset in translate would replace the element's own translate
          batch.keyframed?.has(node) && item.translate === 'none' && 'translate' in node.style) {
            item.property = 'translate';
          }
          break;
        case 8 /* AnimationPhase.SET_MOVE_START_STATE */:
          startMove(item, outer);
          break;
        case 9 /* AnimationPhase.ACTIVATE_TRANSITIONS */:
          {
            item.starting = false;
            restoreTransitions(item);
            let added = '';
            for (const name of batch.ownerClasses?.get(node) ?? batch.activeClasses) {
              if (!node.classList.contains(name)) {
                node.classList.add(name);
                added = added === '' ? name : added + ' ' + name;
              }
            }
            item.addedClasses = added;
            if (item.property === 'translate') transitionTranslate(item);
            break;
          }
        case 10 /* AnimationPhase.ACTIVATE_ANIMATION */:
          writeOffset(item, item.property === 'translate' ? '0px 0px' : item.baseTransform || 'translate(0px,0px)');
          break;
        case 11 /* AnimationPhase.REGISTER_LISTENERS */:
          item.cancel = registerTransitionListener$1([node], () => finishMove(item));
          break;
      }
    }
    if (phase === 6 /* AnimationPhase.MEASURE_MOVES */) {
      measureNodes(batch, outer !== null);
      // Read with the measurements, before any move of the pass writes its start state
      if (batch.moved) batch.space = parentSpace(batch.parent);
      if (batch.remaining === 0) {
        batch.cancel?.();
        moveBatches.delete(batch.parent);
      }
    } else if (verify && live === 0 && batch.nodes.length === 0) {
      batch.cancel?.();
      moveBatches.delete(batch.parent);
    }
  }
  installMoveAnimations(cancelMoves);
  class AnimatedComponent extends Component {
    componentDidAppear(dom) {
      componentDidAppear(dom, this.props);
    }
    componentWillDisappear(dom, callback) {
      componentWillDisappear(dom, this.props, callback);
    }
  }
  class AnimatedMoveComponent extends Component {
    componentWillMove(parentVNode, parent, dom) {
      if (preparedOwnerMayMove()) {
        componentWillMove(parentVNode, parent, dom, this.props);
      }
    }
  }
  const utils = {
    addClassName: addClassName$1,
    forceReflow: forceReflow$1,
    registerTransitionListener: registerTransitionListener$1,
    removeClassName: removeClassName$1};

  var {
    addClassName,
    removeClassName,
    forceReflow,
    registerTransitionListener
  } = utils;
  const anim = {
    onComponentDidAppear: componentDidAppear,
    onComponentWillDisappear: componentWillDisappear
  };
  const animMove = {
    onComponentWillMove: componentWillMove
  };
  class ListItem extends AnimatedComponent {
    render() {
      return createElement('li', {
        onClick: e => this.props.onClick(e, this.props.index)
      }, this.props.children);
    }
  }
  class SectionItem extends AnimatedComponent {
    render() {
      return createElement('section', {
        onClick: e => this.props.onClick(e, this.props.index)
      }, this.props.children);
    }
  }
  const FuncListItem = ({
    children,
    ...props
  }) => {
    return createElement('li', {
      onClick: e => props.onClick(e, props.index)
    }, children);
  };
  const FuncSectionItem = ({
    children,
    ...props
  }) => {
    return createElement('section', {
      onClick: e => props.onClick(e, props.index)
    }, children);
  };
  class ListItemMoveAnim extends AnimatedMoveComponent {
    render() {
      return createElement('li', {
        onClick: e => this.props.onClick(e, this.props.index)
      }, this.props.children);
    }
  }
  const FuncListItemMoveAnim = ({
    children,
    ...props
  }) => {
    return createElement('li', {
      onClick: e => props.onClick(e, props.index)
    }, children);
  };
  class List extends Component {
    constructor() {
      super();
      this.doRemove = (e, index) => {
        e.preventDefault();
        var newItems = this.state.items.concat([]);
        newItems.splice(index, 1);
        this.setState({
          items: newItems
        });
      };
      this.doAdd = e => {
        e.preventDefault();
        var newItems = this.state.items.concat([]);
        var nextKey = newItems.length === 0 ? 0 : newItems[newItems.length - 1].key + 1;
        newItems.push({
          key: nextKey
        });
        this.setState({
          items: newItems
        });
      };
      this.doRemove20 = e => {
        e.preventDefault();
        var newItems = this.state.items.concat([]);
        newItems.splice(newItems.length >= 20 ? newItems.length - 20 : 0, newItems.length >= 20 ? 20 : newItems.length);
        this.setState({
          items: newItems
        });
      };
      this.doAdd20 = e => {
        e.preventDefault();
        var newItems = this.state.items.concat([]);
        var nextKey = newItems.length === 0 ? 0 : newItems[newItems.length - 1].key + 1;
        for (var i = 0; i < 20; i++) {
          newItems.push({
            key: nextKey + i
          });
        }
        this.setState({
          items: newItems
        });
      };
      this.renderItem = (item, i) => {
        if (this.props.useFunctionalComponent) {
          return createElement(FuncListItem, {
            key: item.key,
            index: i,
            animation: this.props.animation,
            ...anim,
            onClick: this.doRemove
          }, `${item.key + 1}bar`);
        } else {
          return createElement(ListItem, {
            key: item.key,
            index: i,
            animation: this.props.animation,
            onClick: this.doRemove
          }, `${item.key + 1}bar`);
        }
      };
      this.state = {
        items: []
      };
      this.items = [];
    }
    componentDidMount() {
      let i = 0;
      while (this.items.length < 20) {
        this.items[this.items.length] = {
          key: i++
        };
      }
      this.setState({
        items: this.items
      });
    }
    render() {
      return createElement('div', null, [createElement('ul', null, this.state.items.map(this.renderItem)), createElement('h2', null, this.props.animation), createElement('p', null, this.props.description), createElement('button', {
        onClick: this.doAdd
      }, 'Add'), createElement('button', {
        onClick: this.doAdd20
      }, 'Add 20'), createElement('button', {
        onClick: this.doRemove20
      }, 'Remove 20')]);
    }
  }
  class MixedList extends Component {
    constructor() {
      super();
      this.componentDidAppear = dom => {
        const animCls = {
          start: 'fade-enter',
          active: 'fade-enter-active',
          end: 'fade-enter-end'
        };
        // 1. Set animation start state
        addClassName(dom, animCls.start);
        forceReflow();

        // 2. Activate transition
        addClassName(dom, animCls.active);

        // 3. Set an animation listener, code at end
        // Needs to be done after activating so timeout is calculated correctly
        registerTransitionListener([dom], function () {
          // *** Cleanup ***
          // 5. Remove the element
          removeClassName(dom, animCls.active);
          removeClassName(dom, animCls.end);
        });

        // 4. Activate target state
        requestAnimationFrame(() => {
          removeClassName(dom, animCls.start);
          addClassName(dom, animCls.end);
        });
      };
      this.componentWillDisappear = (dom, callback) => {
        const animCls = {
          start: 'fade-leave',
          active: 'fade-leave-active',
          end: 'fade-leave-end'
        };

        // 1. Set animation start state
        addClassName(dom, animCls.start);

        // 2. Activate transitions
        addClassName(dom, animCls.active);

        // 3. Set an animation listener, code at end
        // Needs to be done after activating so timeout is calculated correctly
        registerTransitionListener([dom], function () {
          // *** Cleanup ***

          // Simulate some work is being done
          // setTimeout(function () {
          //   callback();
          // }, 1000);
          callback();
        });

        // 4. Activate target state
        requestAnimationFrame(() => {
          addClassName(dom, animCls.end);
          removeClassName(dom, animCls.start);
        });
      };
      this.doRemove = (e, index) => {
        e.preventDefault();
        var newItems = this.state.items.concat([]);
        newItems.splice(index, 1);
        this.setState({
          items: newItems
        });
      };
      this.doRemoveSpecial = e => {
        e.preventDefault();
        // Remove random ListItem and trigger animation
        var onlyListItems = this.state.items.filter(item => item.isListItem);
        var toDeleteIndex = parseInt(Math.round(Math.random() * (onlyListItems.length - 1)));
        var toDeleteKey = onlyListItems[toDeleteIndex].key;
        var newItems = this.state.items.filter(item => item.key !== toDeleteKey);
        this.setState({
          items: newItems
        });

        // Remove random divider during animation
        // NOTE! If the divider is the last element, it will cause everything to be removed,
        // thus cutting the running animation short. This is expected behaviour because we don't
        // check if the parent has an animating child. Opportunity for improvement.
        setTimeout(() => {
          var onlyDividers = this.state.items.filter(item => !item.isListItem);
          var toDeleteIndex = parseInt(Math.round(Math.random() * (onlyDividers.length - 1)));
          var counter = 0;
          var newItems = this.state.items.filter(item => item.isListItem || counter++ !== toDeleteIndex);
          this.setState({
            items: newItems
          });
        }, 100);
      };
      this.doAdd = e => {
        e.preventDefault();
        var newItems = this.state.items.concat([]);
        var nextKey = newItems.reduce((prev, curr) => curr.key > prev ? curr.key : prev, 0) + 1;
        newItems.push({
          key: nextKey,
          isListItem: true
        });
        newItems.push({
          key: nextKey + 1
        });
        this.setState({
          items: newItems
        });
      };
      this.renderItem = (item, i) => {
        if (this.props.useFunctionalComponent) {
          return createElement(FuncSectionItem, {
            key: item.key,
            index: i,
            animation: this.props.animation,
            ...anim,
            onClick: this.doRemove
          }, `${item.key + 1}bar`);
        } else {
          return createElement(SectionItem, {
            key: item.key,
            index: i,
            animation: this.props.animation,
            onClick: this.doRemove
          }, `${item.key + 1}bar`);
        }
      };
      let _i = 0;
      let items = [];
      while (items.length < 40) {
        items[items.length] = {
          key: _i++,
          isListItem: true
        };
        items[items.length] = {
          key: _i++
        };
      }
      this.state = {
        items
      };
    }
    render() {
      // Mixing <section> and <span> instead of using <li> for all to trigger special code path in Inferno
      return createElement('div', null, [createElement('article', null, this.state.items.map((item, i) => item.isListItem ? this.renderItem(item, i) : createElement('span', {
        className: 'divider'
      }))), createElement('h2', null, 'Mixed list'), createElement('p', null, this.props.description), createElement('button', {
        onClick: this.doAdd
      }, 'Add'), createElement('button', {
        onClick: this.doRemoveSpecial
      }, 'Remove')]);
    }
  }
  class ShuffleList extends Component {
    constructor() {
      super();
      // set initial time:
      this.doRemove = (e, index) => {
        e && e.preventDefault();
        var newItems = this.state.items.concat([]);
        newItems.splice(index, 1);
        this.setState({
          items: newItems
        });
      };
      this.doAdd = e => {
        e && e.preventDefault();
        var newItems = this.state.items.concat([]);
        var nextKey = newItems.reduce((prev, curr) => curr.key > prev ? curr.key : prev, 0) + 1;
        newItems.push({
          key: nextKey,
          val: nextKey
        });
        this.setState({
          items: newItems
        });
      };
      this.doMix = e => {
        e && e.preventDefault();
        var newItems = this.state.items.concat([]);
        shuffle(newItems);
        this.setState({
          items: newItems
        });
      };
      this.doReassignKeys = e => {
        e && e.preventDefault();
        var tmpItems = this.state.items.concat([]);
        shuffle(tmpItems);
        var newItems = this.state.items.map((item, index) => {
          return Object.assign({}, item, {
            key: tmpItems[index].key
          });
        });
        this.setState({
          items: newItems
        });
      };
      this.doRemoveMix = e => {
        e && e.preventDefault();
        if (this.state.items.length === 0) {
          return;
        }
        // Remove random ListItem and trigger animation
        var toDeleteIndex = parseInt(Math.round(Math.random() * (this.state.items.length - 1)));
        var toDeleteKey = this.state.items[toDeleteIndex].key;
        var newItems = this.state.items.filter(item => item.key !== toDeleteKey);
        this.setState({
          items: newItems,
          deleted: toDeleteKey + 1
        });
        setTimeout(() => this.doMix(e), 100);
      };
      this.removeAndShuffle = e => {
        e && e.preventDefault();
        for (let i = 0; i < 20; i++) {
          setTimeout(() => {
            var toDeleteIndex = parseInt(Math.round(Math.random() * (this.state.items.length - 1)));
            this.doRemove(undefined, toDeleteIndex);
            this.doReassignKeys();
            this.doMix();
          });
        }
      };
      this.doAdd20 = e => {
        e && e.preventDefault();
        // Add data
        for (let i = 0; i < 20; i++) {
          this.doAdd();
        }
        // Shuffle them
        for (let i = 0; i < 5; i++) {
          this.doReassignKeys();
          this.doMix();
        }
      };
      this.doAdd20SeqMix = e => {
        e && e.preventDefault();
        // Add data
        for (let i = 0; i < 20; i++) {
          this.doAdd();
        }
        // Shuffle them
        for (let i = 0; i < 5; i++) {
          setTimeout(() => {
            // this.doReassignKeys(e);
            this.doMix();
          }, 500 + 100 * i);
        }
      };
      this.renderItem = (item, i) => {
        if (this.props.useFunctionalComponent) {
          return createElement(FuncListItem, {
            key: item.key,
            index: i,
            animation: this.props.animation,
            ...anim,
            onClick: this.doRemove
          }, `${item.val}bar (${item.key})`);
        } else {
          return createElement(ListItem, {
            key: item.key,
            index: i,
            animation: this.props.animation,
            onClick: this.doRemove
          }, `${item.val}bar (${item.key})`);
        }
      };
      this.state = {
        items: []
      };
      this.items = [];
    }
    componentDidMount() {
      let i = 0;
      while (this.items.length < 20) {
        this.items[this.items.length] = {
          key: i,
          val: i
        };
        i++;
      }
      this.setState({
        items: this.items
      });
    }
    render() {
      return createElement('div', null, [createElement('ul', null, this.state.items.map(this.renderItem)), createElement('h2', null, 'Shuffle'), createElement('p', null, this.props.description), createElement('button', {
        onClick: this.doAdd
      }, 'Add'), createElement('button', {
        onClick: this.doMix
      }, 'Shuffle'), createElement('button', {
        onClick: this.doReassignKeys
      }, 'Shuffle keys'), createElement('button', {
        onClick: this.doRemoveMix
      }, 'Remove' + (this.state.deleted ? ` (${this.state.deleted})` : '')), createElement('button', {
        onClick: this.doAdd20
      }, 'Add and shuffle 20'), createElement('button', {
        onClick: this.doAdd20SeqMix
      }, 'Add 20 do 5 shuffle'), createElement('button', {
        onClick: this.removeAndShuffle
      }, 'Remove and shuffle 20')]);
    }
  }

  // https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
  var shuffle = array => {
    var currentIndex = array.length,
      temporaryValue,
      randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
    return array;
  };
  class RerenderList extends Component {
    constructor() {
      super();
      // set initial time:
      this.doRemove = (e, index) => {
        e.preventDefault();
        var newItems = this.state.items.concat([]);
        newItems.splice(index, 1);
        this.setState({
          items: newItems
        });
      };
      this.doAdd = e => {
        e.preventDefault();
        var newItems = this.state.items.concat([]);
        var nextKey = newItems.reduce((prev, curr) => curr.key > prev ? curr.key : prev, 0) + 1;
        newItems.push({
          key: nextKey,
          val: nextKey
        });
        this.setState({
          items: newItems
        });
      };
      this.renderItem = (item, i) => {
        if (this.props.useFunctionalComponent) {
          return createElement(FuncListItem, {
            key: item.key,
            index: i,
            animation: this.props.animation,
            ...anim,
            onClick: this.doRemove
          }, `${item.val}bar (${item.key})`);
        } else {
          return createElement(ListItem, {
            key: item.key,
            index: i,
            animation: this.props.animation,
            onClick: this.doRemove
          }, `${item.val}bar (${item.key})`);
        }
      };
      this.state = {
        items: []
      };
      this.items = [];
    }
    componentDidMount() {
      this.componentWillReceiveProps(this.props);
    }
    componentWillReceiveProps(nextProps) {
      let i = 0;
      while (this.items.length < nextProps.items) {
        this.items[this.items.length] = {
          key: i,
          val: i
        };
        i++;
      }
      this.setState({
        items: this.items
      });
    }
    render() {
      return createElement('div', null, [createElement('ul', null, this.state.items.map(this.renderItem)), createElement('h2', null, 'patchKeyedChildren'), createElement('p', null, this.props.description), createElement('button', {
        onClick: this.doAdd
      }, 'Add')]);
    }
  }
  class ShuffleListWithAnimation extends Component {
    constructor() {
      super();
      // set initial time:
      this.doMove = (e, index) => {
        e && e.preventDefault();
        var newItems = this.state.items.concat([]);
        var [tmp] = newItems.splice(index, 1);
        newItems.splice(Math.round(Math.random() * newItems.length), 0, tmp);
        this.setState({
          items: newItems
        });
      };
      this.doAdd = e => {
        e && e.preventDefault();
        var newItems = this.state.items.concat([]);
        var nextKey = newItems.reduce((prev, curr) => curr.key > prev ? curr.key : prev, 0) + 1;
        newItems.push({
          key: nextKey,
          val: nextKey
        });
        this.setState({
          items: newItems
        });
      };
      this.doMix = e => {
        e && e.preventDefault();
        var newItems = this.state.items.concat([]);
        shuffle(newItems);

        // So this is the shuffled order
        console.log('Expected order: ' + newItems.map(el => '(' + el.val + ')').join(','));
        this.setState({
          items: newItems
        });

        // And this is what the DOM looks like
        setTimeout(() => {
          const res = document.querySelector('#App6 ul').textContent.match(/\(\d*\)/g);
          console.log('Actual order:   ' + res.join(','));
        }, 100);
      };
      this.doDoubleMix = e => {
        e && e.preventDefault();
        var newItems = this.state.items.concat([]);
        shuffle(newItems);

        // So this is the shuffled order
        console.log('Expected order 1: ' + newItems.map(el => '(' + el.val + ')').join(','));
        this.setState({
          items: newItems
        });
        setTimeout(() => {
          var newItems2 = newItems.concat([]);
          shuffle(newItems2);
          this.setState({
            items: newItems2
          });
          console.log('Expected order 2: ' + newItems2.map(el => '(' + el.val + ')').join(','));
        }, 1);

        // And this is what the DOM looks like
        setTimeout(() => {
          const res = document.querySelector('#App6 ul').textContent.match(/\(\d*\)/g);
          console.log('Actual order:     ' + res.join(','));
        }, 100);
      };
      this.doMoveOne = e => {
        e && e.preventDefault();
        var newItems = this.state.items.concat([]);
        newItems.push(newItems.shift());
        this.setState({
          items: newItems
        });
      };
      this.doClearMarkers = e => {
        e && e.preventDefault();
        const tmp = document.querySelectorAll('.debugMarker');
        for (const marker of tmp) {
          marker.parentNode.removeChild(marker);
        }
      };
      this.renderItem = (item, i) => {
        if (this.props.useFunctionalComponent) {
          return createElement(FuncListItemMoveAnim, {
            key: item.key,
            index: i,
            animation: this.props.animation,
            ...animMove,
            onClick: this.doMove
          }, `${item.val}bar (${item.key})`);
        } else {
          return createElement(ListItemMoveAnim, {
            key: item.key,
            index: i,
            animation: this.props.animation,
            onClick: this.doMove
          }, `${item.val}bar (${item.key})`);
        }
      };
      this.state = {
        items: []
      };
      this.items = [];
    }
    componentDidMount() {
      let i = 0;
      while (this.items.length < 5) {
        this.items[this.items.length] = {
          key: i,
          val: i
        };
        i++;
      }
      this.setState({
        items: this.items
      });
    }
    render() {
      return createElement('div', null, [createElement('ul', null, this.state.items.map(this.renderItem)), createElement('h2', null, 'Shuffle w. Anim'), createElement('p', null, this.props.description), createElement('button', {
        onClick: this.doAdd
      }, 'Add'), createElement('button', {
        onClick: this.doMix
      }, 'Shuffle'), createElement('button', {
        onClick: this.doDoubleMix
      }, 'DoubleShuffle'), createElement('button', {
        onClick: this.doMoveOne
      }, 'Move 1'), createElement('button', {
        onClick: this.doRemoveMix
      }, 'Remove' + (this.state.deleted ? ` (${this.state.deleted})` : '')), createElement('button', {
        onClick: this.doClearMarkers
      }, 'Clear debug markers')]);
    }
  }
  document.addEventListener('DOMContentLoaded', function () {
    var container_1 = document.querySelector('#App1');
    var container_2 = document.querySelector('#App2');
    var container_3 = document.querySelector('#App3');
    var container_4 = document.querySelector('#App4');
    var container_5 = document.querySelector('#App5');
    var container_6 = document.querySelector('#App6');
    var useFunctionalComponent = location.search === '?functional';
    render(createElement(List, {
      useFunctionalComponent,
      animation: 'HeightAndFade',
      description: 'The children in this container animate opacity and height when added and removed. Click an item to remove it.'
    }), container_1);
    render(createElement(List, {
      useFunctionalComponent,
      animation: 'NoTranistionEvent',
      description: 'The children in this container have a broken animation. This is detected by inferno-animation and the animation callback is called immediately. Click an item to remove it.'
    }), container_2);
    render(createElement(MixedList, {
      useFunctionalComponent,
      animation: 'HeightAndFade',
      description: 'This container fades in and blocks the children from animating on first render. There is no animation on divider between elements. When you click [Remove] a random row and another random divder will be removed. Click an item to remove it (leaving the divider).'
    }), container_3);
    render(createElement(ShuffleList, {
      useFunctionalComponent,
      animation: 'HeightAndFade',
      description: 'This container will shuffle keys or items. Click an item to remove it.'
    }), container_4);
    var btn = document.querySelector('#Rerender > button');
    btn.addEventListener('click', e => {
      e && e.preventDefault();
      //render(createElement('div', null, createElement(RerenderList, {animation: 'HeightAndFade', items: 5})), container_5);
      render(createElement(RerenderList, {
        useFunctionalComponent,
        animation: 'HeightAndFade',
        items: 5,
        description: 'This container will be filled with 5 rows every time you click the button. Click an item to remove it.'
      }), container_5);
    });
    render(createElement(ShuffleListWithAnimation, {
      useFunctionalComponent,
      animation: 'MoveAnim',
      description: 'This container will animate items on shuffle. Click an item to randomly move it.'
    }), container_6);
  });

})();
