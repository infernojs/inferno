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
  function isNull$1(o) {
    return o === null;
  }
  function isUndefined$1(o) {
    return o === void 0;
  }
  // object.event should always be function, otherwise its badly created object.
  function isLinkEventObject(o) {
    return !isNull$1(o) && typeof o === 'object';
  }

  // We need EMPTY_OBJ defined in one place.
  // It's used for comparison, so we can't inline it into shared
  const EMPTY_OBJ = {};
  // @ts-expect-error hack for fragment type
  const Fragment = '$F';
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
    if (isNull$1(nextNode)) {
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
  function callAllAnimationHooks(animationQueue, callback) {
    let animationsLeft = animationQueue.length;
    // Picking from the top because it is faster, invocation order should be irrelevant
    // since all animations are to be run, and we can't predict the order in which they complete.
    let fn;
    while ((fn = animationQueue.pop()) !== undefined) {
      fn(() => {
        if (--animationsLeft <= 0 && isFunction$1(callback)) {
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
    while (!isNullOrUndef$2(vNode)) {
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
    while (!isNullOrUndef$2(vNode)) {
      const flags = vNode.flags;
      if ((flags & 1521 /* VNodeFlags.DOMRef */) !== 0) {
        if (!isNullOrUndef$2(refOrInstance) && (isFunction$1(refOrInstance.componentWillMove) || isFunction$1(refOrInstance.onComponentWillMove))) {
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
      if (!isNull$1(props)) {
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
              if (isNull$1(oldKey)) {
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
          const isNullKey = isNull$1(key);
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
    } while (!isNull$1(dom));
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
      if (!isNull$1(props)) {
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
        if (isFunction$1(children.componentWillUnmount)) {
          // TODO: Possible entrypoint
          children.componentWillUnmount();
        }
        // If we have a componentWillDisappear on this component, block children from animating
        let childAnimations = animations;
        if (isFunction$1(children.componentWillDisappear)) {
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
        if (!isNullOrUndef$2(ref)) {
          let domEl = null;
          if (isFunction$1(ref.onComponentWillUnmount)) {
            domEl = findDOMFromVNode(vNode, true);
            ref.onComponentWillUnmount(domEl, vNode.props || EMPTY_OBJ);
          }
          if (isFunction$1(ref.onComponentWillDisappear)) {
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
  function patchDangerInnerHTML(lastValue, nextValue, lastVNode, dom, animations) {
    const lastHtml = lastValue?.__html || '';
    const nextHtml = nextValue?.__html || '';
    if (lastHtml !== nextHtml) {
      if (!isNullOrUndef$2(nextHtml) && !isSameInnerHTML(dom, nextHtml)) {
        if (!isNull$1(lastVNode)) {
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
    const value = isNullOrUndef$2(nextValue) ? '' : nextValue;
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
        if (!isNull$1(pending)) {
          const state = instance.state;
          if (isNull$1(state)) {
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
    if (!isNull$1(parentDOM)) {
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
    if (!isNull$1(parentDOM)) {
      insertOrAppend(parentDOM, dom, nextNode);
    }
    if (!isNull$1(props)) {
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
    if (isFunction$1(instance.componentDidAppear)) {
      childAnimations = new AnimationQueues();
    }
    mount(instance.$LI, parentDOM, instance.$CX, isSVG, nextNode, lifecycle, childAnimations);
    mountClassComponentCallbacks(vNode.ref, instance, lifecycle, animations);
  }
  function mountFunctionalComponent(vNode, parentDOM, context, isSVG, nextNode, lifecycle, animations) {
    const ref = vNode.ref;
    // If we have a componentDidAppear on this component, we shouldn't allow children to animate so we're passing an dummy animations queue
    let childAnimations = animations;
    if (!isNullOrUndef$2(ref) && isFunction$1(ref.onComponentDidAppear)) {
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
    if (isFunction$1(instance.componentDidMount)) {
      lifecycle.push(createClassMountCallback(instance));
    }
    if (isFunction$1(instance.componentDidAppear)) {
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
    if (!isNullOrUndef$2(ref)) {
      safeCall1(ref.onComponentWillMount, vNode.props || EMPTY_OBJ);
      if (isFunction$1(ref.onComponentDidMount)) {
        lifecycle.push(createOnMountCallback(ref, vNode));
      }
      if (isFunction$1(ref.onComponentDidAppear)) {
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
          if (isNullOrUndef$2(nextPropsOrEmpty[prop]) && !isNullOrUndef$2(lastPropsOrEmpty[prop])) {
            patchProp(prop, lastPropsOrEmpty[prop], null, dom, isSVG, hasControlledValue, lastVNode, animations);
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
    if (isNull$1(instance)) {
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
      if (!isNull$1(instance.$PS)) {
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
    const nextHooksDefined = !isNullOrUndef$2(nextRef);
    const lastInput = lastVNode.children;
    if (nextHooksDefined && isFunction$1(nextRef.onComponentShouldUpdate)) {
      shouldUpdate = nextRef.onComponentShouldUpdate(lastProps, nextProps);
    }
    if (shouldUpdate) {
      if (nextHooksDefined && isFunction$1(nextRef.onComponentWillUpdate)) {
        nextRef.onComponentWillUpdate(lastProps, nextProps);
      }
      const nextInput = normalizeRoot(renderFunctionalComponent(nextVNode, context), lastInput);
      patch(lastInput, nextInput, parentDOM, context, isSVG, nextNode, lifecycle, animations);
      nextVNode.children = nextInput;
      if (nextHooksDefined && isFunction$1(nextRef.onComponentDidUpdate)) {
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
  function isNull(o) {
    return o === null;
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
    const tmpDisplay = node.style.getPropertyValue('display');
    // The `display: none;` workaround was added to support Bootstrap animations in
    // https://github.com/jhsware/inferno-bootstrap/blob/be4a17bff5e785b993a66a2927846cd463fecae3/src/Modal/AnimateModal.js
    // we should consider deprecating this, or providing a different solution for
    // those who only do normal animations.
    const isDisplayNone = window.getComputedStyle(node).getPropertyValue('display') === 'none';
    if (isDisplayNone) {
      node.style.setProperty('display', 'block');
    }
    const tmp = node.getBoundingClientRect();
    if (isDisplayNone) {
      // node.style.display = tmpDisplay
      node.style.setProperty('display', tmpDisplay);
      _cleanStyle(node);
    }
    return {
      height: tmp.height,
      width: tmp.width,
      x: tmp.x,
      y: tmp.y
    };
  }
  function getGeometry(node) {
    return node.getBoundingClientRect();
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
  function clearTransform(node) {
    node.style.transform = '';
    node.style.transformOrigin = '';
  }
  function setDimensions(node, width, height) {
    node.style.width = width + 'px';
    node.style.height = height + 'px';
  }
  function clearDimensions(node) {
    node.style.width = node.style.height = '';
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
    if (rootNode.nodeName === 'IMG' && !rootNode.complete) {
      // Image animations should wait for loaded until the timeout is started, otherwise animation will be cut short
      // due to loading delay
      rootNode.addEventListener('load', () => {
        setTimeout(() => onTransitionEnd({
          target: rootNode,
          timeout: true
        }), maxDuration === 0 ? 0 : Math.round(maxDuration * 1000) + 100);
      });
    } else {
      setTimeout(() => onTransitionEnd({
        target: rootNode,
        timeout: true
      }), maxDuration === 0 ? 0 : Math.round(maxDuration * 1000) + 100);
    }
  }
  /**
   * You need to pass the root element and ALL animated children that have transitions,
   * if there are any,  so the timeout is set to the longest duration. Otherwise there
   * will be animations that fail to complete before the timeout is triggered.
   *
   * @param nodes a list of nodes that have transitions that are part of this animation
   * @param callback callback when all transitions of participating nodes are completed
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
      done = true;
      /**
       * Perform cleanup
       */
      rootNode.removeEventListener('transitioncancel', onTransitionEnd, false);
      rootNode.removeEventListener('transitionend', onTransitionEnd, false);
      if (isFunction(callback)) {
        callback();
      }
    };
    // if element gets removed from the DOM before transition is triggered, browser will raise transitioncancel event
    rootNode.addEventListener('transitioncancel', onTransitionEnd, false);
    rootNode.addEventListener('transitionend', onTransitionEnd, false);
    setAnimationTimeout(onTransitionEnd, rootNode, maxDuration);
  }
  function incrementMoveCbCount(node) {
    let curr = parseInt(node.dataset.moveCbCount, 10);
    if (isNaN(curr)) {
      curr = 1;
    } else {
      curr++;
    }
    node.dataset.moveCbCount = curr;
    return curr;
  }
  function decrementMoveCbCount(node) {
    let curr = parseInt(node.dataset.moveCbCount, 10);
    if (isNaN(curr)) {
      curr = 0;
    } else {
      curr--;
      if (curr === 0) {
        node.dataset.moveCbCount = '';
      } else {
        node.dataset.moveCbCount = curr;
      }
    }
    return curr;
  }
  var AnimationPhase;
  (function (AnimationPhase) {
    AnimationPhase[AnimationPhase["INITIALIZE"] = 0] = "INITIALIZE";
    AnimationPhase[AnimationPhase["MEASURE"] = 1] = "MEASURE";
    AnimationPhase[AnimationPhase["SET_START_STATE"] = 2] = "SET_START_STATE";
    AnimationPhase[AnimationPhase["ACTIVATE_TRANSITIONS"] = 3] = "ACTIVATE_TRANSITIONS";
    AnimationPhase[AnimationPhase["REGISTER_LISTENERS"] = 4] = "REGISTER_LISTENERS";
    AnimationPhase[AnimationPhase["ACTIVATE_ANIMATION"] = 5] = "ACTIVATE_ANIMATION";
    AnimationPhase[AnimationPhase["length"] = 6] = "length";
  })(AnimationPhase || (AnimationPhase = {}));
  const _globalAnimationSources = {};
  function _globalAnimationGC() {
    let entriesLeft = false;
    for (const key in _globalAnimationSources) {
      if (--_globalAnimationSources[key].ticks < 0) {
        delete _globalAnimationSources[key];
      } else entriesLeft = true;
    }
    if (entriesLeft) {
      requestAnimationFrame(_globalAnimationGC);
    }
  }
  function addGlobalAnimationSource(key, state) {
    state.ticks = 5;
    _globalAnimationSources[key] = state;
    if (_globalAnimationGC === null) {
      requestAnimationFrame(_globalAnimationGC);
    }
  }
  function consumeGlobalAnimationSource(key) {
    const tmp = _globalAnimationSources[key];
    if (tmp !== undefined) {
      delete _globalAnimationSources[key];
    }
    return tmp;
  }
  let _animationQueue = [];
  let _animationActivationQueue = [];
  const IDLE = 0;
  let _nextAnimationFrame = IDLE;
  let _nextActivateAnimationFrame = IDLE;
  function _runActivateAnimationPhase() {
    _nextActivateAnimationFrame = IDLE;
    // Get animations to execute
    const animationQueue = _animationActivationQueue;
    // Clear global queue
    _animationActivationQueue = [];
    for (let i = 0; i < animationQueue.length; i++) {
      animationQueue[i](5 /* AnimationPhase.ACTIVATE_ANIMATION */);
    }
  }
  function _runAnimationPhases() {
    _nextAnimationFrame = IDLE;
    // Get animations to execute
    const animationQueue = _animationQueue;
    // Clear global queue
    _animationQueue = [];
    // So what this does is run the animation phases in order. Most of the phases are invoked
    // by a simple call to all the registered callbacks. However:
    //
    // - ACTIVATE_TRANSITIONS require a reflow in order to not
    // interfere with the previous setting of the animation start class
    //
    // - ACTIVATE_ANIMATION needs to be called async so the transitions actually fire,
    // we choose to use an animation frame.
    //
    for (let i = 0; i < 6 /* AnimationPhase.length */; i++) {
      const phase = i;
      switch (phase) {
        case 5 /* AnimationPhase.ACTIVATE_ANIMATION */:
          // Final phase - Activate animations
          // This is a special case and is executed differently from others
          _animationActivationQueue = _animationActivationQueue.concat(animationQueue);
          if (_nextActivateAnimationFrame === IDLE) {
            // Animations are activated on the next animation frame
            _nextActivateAnimationFrame = requestAnimationFrame(_runActivateAnimationPhase);
          }
          break;
        default:
          if (phase === 3 /* AnimationPhase.ACTIVATE_TRANSITIONS */) {
            // Force reflow before executing ACTIVATE_TRANSITIONS
            forceReflow$1();
          }
          for (let j = 0; j < animationQueue.length; j++) {
            animationQueue[j](phase);
          }
      }
    }
  }
  function queueAnimation(callback) {
    _animationQueue.push(callback);
    if (_nextAnimationFrame === IDLE) {
      {
        _nextAnimationFrame = requestAnimationFrame(_runAnimationPhases);
      }
    }
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
    const display = setDisplay(dom, 'none');
    const sourceState = props.globalAnimationKey === undefined ? null : consumeGlobalAnimationSource(props.globalAnimationKey);
    queueAnimation(phase => {
      _didAppear(phase, dom, cls, dimensions, display, sourceState);
    });
  }
  function _getDidAppearTransitionCallback(dom, cls) {
    return () => {
      // 5. Remove the element
      clearDimensions(dom);
      removeClassName$1(dom, cls.active + ' ' + cls.end);
      // 6. Call callback to allow stuff to happen
      // Not currently used but this is where one could
      // add a call to something like this.didAppearDone
    };
  }
  function _didAppear(phase, dom, cls, dimensions, display, sourceState) {
    switch (phase) {
      case 0 /* AnimationPhase.INITIALIZE */:
        // Needs to be done in a single pass to avoid reflows
        // We set display: none whilst waiting for an animation frame to avoid flicker
        resetDisplay(dom, display);
        return;
      case 1 /* AnimationPhase.MEASURE */:
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
      case 2 /* AnimationPhase.SET_START_STATE */:
        // 1. Set start of animation
        if (!isNullOrUndef(sourceState) && dimensions.width !== 0 && dimensions.height !== 0) {
          // const diffX = (sourceState.width - dimensions.width) / 2;
          // const diffY = (sourceState.height - dimensions.height) / 2;
          const dx = sourceState.x - dimensions.x;
          const dy = sourceState.y - dimensions.y;
          const scaleX = sourceState.width / dimensions.width;
          const scaleY = sourceState.height / dimensions.height;
          setTransform(dom, dx, dy, scaleX, scaleY);
        }
        addClassName$1(dom, cls.start);
        return;
      case 3 /* AnimationPhase.ACTIVATE_TRANSITIONS */:
        // 2. Activate transition (after a reflow)
        addClassName$1(dom, cls.active);
        return;
      case 4 /* AnimationPhase.REGISTER_LISTENERS */:
        // 3. Set an animation listener, code at end
        // Needs to be done after activating so timeout is calculated correctly
        registerTransitionListener$1(
        // *** Cleanup is broken out as micro optimisation ***
        [dom], _getDidAppearTransitionCallback(dom, cls));
        return;
      case 5 /* AnimationPhase.ACTIVATE_ANIMATION */:
        // 4. Activate target state (called async via requestAnimationFrame)
        if (!isNullOrUndef(sourceState) && dimensions.width !== 0 && dimensions.height !== 0) {
          clearTransform(dom);
        }
        setDimensions(dom, dimensions.width, dimensions.height);
        removeClassName$1(dom, cls.start);
        addClassName$1(dom, cls.end);
    }
  }
  function componentWillDisappear(dom, props, callback) {
    // Get dimensions and unpack class names
    const cls = getAnimationClass(props.animation, '-leave');
    const dimensions = getDimensions(dom);
    queueAnimation(phase => {
      _willDisappear(phase, dom, callback, cls, dimensions);
    });
    if (props.globalAnimationKey !== undefined) {
      addGlobalAnimationSource(props.globalAnimationKey, dimensions);
      dom.style.setProperty('visibility', 'hidden');
    }
  }
  function _willDisappear(phase, dom, callback, cls, dimensions) {
    switch (phase) {
      case 1 /* AnimationPhase.MEASURE */:
        // 1. Set animation start state and dimensions
        setDimensions(dom, dimensions.width, dimensions.height);
        addClassName$1(dom, cls.start);
        return;
      case 3 /* AnimationPhase.ACTIVATE_TRANSITIONS */:
        // 2. Activate transition (after a reflow)
        addClassName$1(dom, cls.active);
        return;
      case 4 /* AnimationPhase.REGISTER_LISTENERS */:
        // 3. Set an animation listener, code at end
        // Needs to be done after activating so timeout is calculated correctly
        registerTransitionListener$1(
        // Unlike _didAppear, no cleanup needed since node is removed.
        // Just passing the componentWillDisappear callback so Inferno can
        // remove the nodes.
        [dom], callback);
        return;
      case 5 /* AnimationPhase.ACTIVATE_ANIMATION */:
        // 4. Activate target state (called async via requestAnimationFrame)
        addClassName$1(dom, cls.end);
        removeClassName$1(dom, cls.start);
        clearDimensions(dom);
    }
  }
  function componentWillMove(parentVNode, parent, _dom, props) {
    // Measure all siblings of moved node once before any mutations are done
    let els;
    if (!parentVNode.$MV) {
      parentVNode.$MV = true;
      els = [];
      // @ts-expect-error parent is not supposed to be null
      let tmpEl = parent.firstChild;
      while (!isNull(tmpEl)) {
        els.push({
          dx: 0,
          dy: 0,
          geometry: getGeometry(tmpEl),
          moved: false,
          node: tmpEl
        });
        tmpEl = tmpEl.nextSibling;
      }
    }
    // Get animation class names
    const cls = getAnimationClass(props.animation, '-move');
    const animState = {
      els,
      isMaster: !isNullOrUndef(els),
      parentVNode
    };
    queueAnimation(phase => {
      _willMove(phase, cls, animState);
    });
  }
  function _willMove(phase, cls, animState) {
    const {
      els,
      isMaster,
      parentVNode
    } = animState;
    switch (phase) {
      case 1 /* AnimationPhase.MEASURE */:
        // If we are responsible for triggering measures, we check all the target positions
        if (isMaster) {
          for (let i = 0; i < els.length; i++) {
            const tmpItem = els[i];
            // Make sure we can measure target properly
            removeClassName$1(tmpItem.node, cls.active);
            // Measure
            const geometry = getGeometry(tmpItem.node);
            const deltaX = tmpItem.geometry.x - geometry.x;
            const deltaY = tmpItem.geometry.y - geometry.y;
            if (deltaX !== 0 || deltaY !== 0) {
              tmpItem.moved = true;
              tmpItem.dx = deltaX;
              tmpItem.dy = deltaY;
            }
            // TODO: Check dimensions
          }
        }
        return;
      case 2 /* AnimationPhase.SET_START_STATE */:
        /**
         * At this state we have measure the size of the moving node
         * both at source and target so now we let the source placeholder
         * fill the source space and move the node to start position
         * by transform
         */
        if (isMaster) {
          for (let i = 0; i < els.length; i++) {
            const tmpItem = els[i];
            if (tmpItem.moved) {
              setTransform(tmpItem.node, tmpItem.dx, tmpItem.dy, 1, 1);
            }
            // TODO: Set dimensions
          }
        }
        return;
      case 3 /* AnimationPhase.ACTIVATE_TRANSITIONS */:
        // A reflow is triggered prior to this step
        if (isMaster) {
          for (let i = 0; i < els.length; i++) {
            const tmpItem = els[i];
            if (tmpItem.moved) {
              addClassName$1(tmpItem.node, cls.active);
            }
          }
        }
        return;
      case 4 /* AnimationPhase.REGISTER_LISTENERS */:
        if (isMaster) {
          for (let i = 0; i < els.length; i++) {
            const tmpItem = els[i];
            if (tmpItem.moved) {
              registerTransitionListener$1(
              // How to know if this is a compound move?
              [tmpItem.node], _getWillMoveTransitionCallback(tmpItem.node, cls));
              // Keep track of how many callbacks will be fired
              incrementMoveCbCount(tmpItem.node);
            }
          }
        }
        return;
      case 5 /* AnimationPhase.ACTIVATE_ANIMATION */:
        // 10. Apply target geometry of node to target
        if (isMaster) {
          for (let i = 0; i < els.length; i++) {
            const tmpItem = els[i];
            if (tmpItem.moved) {
              setTransform(tmpItem.node, 0, 0, 1, 1);
            }
          }
        }
        // TODO: Set dimensions
        if (parentVNode.$MV) parentVNode.$MV = false;
    }
  }
  function _getWillMoveTransitionCallback(dom, cls) {
    return () => {
      // Only remove these if the translate has completed
      const cbCount = decrementMoveCbCount(dom);
      if (cbCount === 0) {
        clearDimensions(dom);
        clearTransform(dom);
        removeClassName$1(dom, cls.active);
      }
    };
  }
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
      componentWillMove(parentVNode, parent, dom, this.props);
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
