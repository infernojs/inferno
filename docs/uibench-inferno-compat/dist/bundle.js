(function () {
  'use strict';

  const isArray$1 = Array.isArray;
  function isStringOrNumber(o) {
    const type = typeof o;
    return type === 'string' || type === 'number';
  }
  function isNullOrUndef$3(o) {
    return o === void 0 || o === null;
  }
  function isInvalid$2(o) {
    return o === null || o === false || o === true || o === void 0;
  }
  function isFunction$2(o) {
    return typeof o === 'function';
  }
  function isString$2(o) {
    return typeof o === 'string';
  }
  function isNumber$1(o) {
    return typeof o === 'number';
  }
  function isNull$2(o) {
    return o === null;
  }
  function isUndefined$1(o) {
    return o === void 0;
  }

  /**
   * Links given data to event as first parameter
   * @param {*} data data to be linked, it will be available in function as first parameter
   * @param {Function} callback Function to be called when event occurs
   * @returns {{data: *, event: Function}}
   */
  function linkEvent(data, callback) {
    if (isFunction$2(callback)) {
      return {
        data,
        event: callback
      };
    }
    return null; // Return null when event is invalid, to avoid creating unnecessary event handlers
  }
  // object.event should always be function, otherwise its badly created object.
  function isLinkEventObject(o) {
    return !isNull$2(o) && typeof o === 'object';
  }

  // We need EMPTY_OBJ defined in one place.
  // It's used for comparison, so we can't inline it into shared
  const EMPTY_OBJ = {};
  // @ts-expect-error hack for fragment type
  const Fragment = '$F';
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
    if (isNull$2(nextNode)) {
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
    while (!isNullOrUndef$3(v)) {
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
    while (!isNullOrUndef$3(vNode)) {
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
        if (--animationsLeft <= 0 && isFunction$2(callback)) {
          callback(synchronous);
        }
      });
    }
    synchronous = false;
  }
  function clearVNodeDOM(vNode, parentDOM, deferredRemoval) {
    while (!isNullOrUndef$3(vNode)) {
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
    while (!isNullOrUndef$3(vNode)) {
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
    while (!isNullOrUndef$3(vNode)) {
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
    if (isFunction$2(instance.constructor.getDerivedStateFromProps)) {
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
    return isFunction$2(method) && (method(arg1), true);
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
    if (options.createVNode) {
      options.createVNode(vNode);
    }
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
    if (isNullOrUndef$3(defaultHooks)) {
      return ref;
    }
    if (isNullOrUndef$3(ref)) {
      return defaultHooks;
    }
    return mergeUnsetProperties(ref, defaultHooks);
  }
  function mergeDefaultProps(flags, type, props) {
    // set default props
    const defaultProps = (flags & 32768 /* VNodeFlags.ForwardRef */ ? type.render : type).defaultProps;
    if (isNullOrUndef$3(defaultProps)) {
      return props;
    }
    if (isNullOrUndef$3(props)) {
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
    if (isFunction$2(options.createVNode)) {
      options.createVNode(vNode);
    }
    return vNode;
  }
  function createTextVNode(text, key) {
    return new V(1 /* ChildFlags.HasInvalidChildren */, isNullOrUndef$3(text) || text === true || text === false ? '' : text, null, 16 /* VNodeFlags.Text */, key, null, null, null);
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
  function normalizeProps(vNode) {
    const props = vNode.props;
    if (props) {
      const flags = vNode.flags;
      if (flags & 481 /* VNodeFlags.Element */) {
        if (props.children !== void 0 && isNullOrUndef$3(vNode.children)) {
          normalizeChildren(vNode, props.children);
        }
        if (props.className !== void 0) {
          if (isNullOrUndef$3(vNode.className)) {
            vNode.className = props.className || null;
          }
          props.className = undefined;
        }
      }
      if (props.key !== void 0) {
        vNode.key = props.key;
        props.key = undefined;
      }
      if (props.ref !== void 0) {
        if (flags & 8 /* VNodeFlags.ComponentFunction */) {
          vNode.ref = {
            ...vNode.ref,
            ...props.ref
          };
        } else {
          vNode.ref = props.ref;
        }
        props.ref = undefined;
      }
    }
    return vNode;
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
      if (!isNull$2(props)) {
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
  function createPortal(children, container) {
    const normalizedRoot = normalizeRoot(children);
    return createVNode(1024 /* VNodeFlags.Portal */, 1024 /* VNodeFlags.Portal */, null, normalizedRoot, 0 /* ChildFlags.UnknownChildren */, null, normalizedRoot.key, container);
  }
  function _normalizeVNodes(nodes, result, index, currentKey) {
    for (const len = nodes.length; index < len; index++) {
      let n = nodes[index];
      if (!isInvalid$2(n)) {
        const newKey = currentKey + keyPrefix + index;
        if (isArray$1(n)) {
          _normalizeVNodes(n, result, 0, newKey);
        } else {
          if (isStringOrNumber(n)) {
            n = createTextVNode(n, newKey);
          } else {
            const oldKey = n.key;
            const isPrefixedKey = isString$2(oldKey) && oldKey[0] === keyPrefix;
            let nextKey = oldKey;
            if (!isPrefixedKey) {
              if (isNull$2(oldKey)) {
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
    if (isInvalid$2(children)) {
      newChildren = children;
    } else if (isStringOrNumber(children)) {
      newChildFlags = 16 /* ChildFlags.HasTextChildren */;
      newChildren = children;
    } else if (isArray$1(children)) {
      const len = children.length;
      for (let i = 0; i < len; ++i) {
        let n = children[i];
        if (isInvalid$2(n) || isArray$1(n)) {
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
          const isNullKey = isNull$2(key);
          const isPrefixed = isString$2(key) && key[0] === keyPrefix;
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
    if (isInvalid$2(input) || isStringOrNumber(input)) {
      return createTextVNode(input, null);
    }
    if (isArray$1(input)) {
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
    if (isFunction$2(nextEvent)) {
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
    return isFunction$2(event.composedPath) ? event.composedPath()[0] : event.target;
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
      if (!isNullOrUndef$3(eventsObject)) {
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
    } while (!isNull$2(dom));
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
  function isSameInnerHTML$1(dom, innerHTML) {
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
      if (isFunction$2(props[nativeListenerName])) {
        props[nativeListenerName](e);
      }
    }
  }
  function createWrappedFunction(methodName, applyValue) {
    const fnWrapper = function fnWrapper(e) {
      const vNode = this.$V;
      // If vNode is gone by the time event fires, no-op
      if (isNullOrUndef$3(vNode)) {
        return;
      }
      const props = vNode.props ?? EMPTY_OBJ;
      const dom = vNode.dom;
      if (isString$2(methodName)) {
        triggerEventListener(props, methodName, e);
      } else {
        for (let i = 0; i < methodName.length; ++i) {
          triggerEventListener(props, methodName[i], e);
        }
      }
      if (isFunction$2(applyValue)) {
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
    if (isFunction$2(handler)) {
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
    const hasValue = !isNullOrUndef$3(value);
    if (type != null && type !== dom.type) {
      dom.setAttribute('type', type);
    }
    if (!isNullOrUndef$3(multiple) && multiple !== dom.multiple) {
      dom.multiple = multiple;
    }
    if (!isNullOrUndef$3(defaultValue) && !hasValue) {
      dom.defaultValue = defaultValue + '';
    }
    if (isCheckedType(type)) {
      if (hasValue) {
        dom.value = value;
      }
      if (!isNullOrUndef$3(checked)) {
        dom.checked = checked;
      }
    } else {
      if (hasValue && dom.value !== value) {
        dom.defaultValue = value;
        dom.value = value;
      } else if (!isNullOrUndef$3(checked)) {
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
    if (propsValue === value || isArray$1(value) && value.includes(propsValue)) {
      dom.selected = true;
    } else if (!isNullOrUndef$3(value) || !isNullOrUndef$3(props.selected)) {
      dom.selected = Boolean(props.selected);
    }
  }
  const onSelectChange = createWrappedFunction('onChange', applyValueSelect);
  function selectEvents(dom) {
    attachEvent(dom, 'change', onSelectChange);
  }
  function applyValueSelect(nextPropsOrEmpty, dom, mounting, vNode) {
    const multiplePropInBoolean = Boolean(nextPropsOrEmpty.multiple);
    if (!isNullOrUndef$3(nextPropsOrEmpty.multiple) && multiplePropInBoolean !== dom.multiple) {
      dom.multiple = multiplePropInBoolean;
    }
    const index = nextPropsOrEmpty.selectedIndex;
    if (index === -1) {
      dom.selectedIndex = -1;
    }
    const childFlags = vNode.childFlags;
    if (childFlags !== 1 /* ChildFlags.HasInvalidChildren */) {
      let value = nextPropsOrEmpty.value;
      if (isNumber$1(index) && index > -1 && !isNullOrUndef$3(dom.options[index])) {
        value = dom.options[index].value;
      }
      if (mounting && isNullOrUndef$3(value)) {
        value = nextPropsOrEmpty.defaultValue;
      }
      updateChildOptions(vNode, value);
    }
  }
  const onTextareaInputChange = createWrappedFunction('onInput', applyValueTextArea);
  const wrappedOnChange = createWrappedFunction('onChange');
  function textAreaEvents(dom, nextPropsOrEmpty) {
    attachEvent(dom, 'input', onTextareaInputChange);
    if (isFunction$2(nextPropsOrEmpty.onChange)) {
      attachEvent(dom, 'change', wrappedOnChange);
    }
  }
  function applyValueTextArea(nextPropsOrEmpty, dom, mounting) {
    const value = nextPropsOrEmpty.value;
    const domValue = dom.value;
    if (isNullOrUndef$3(value)) {
      if (mounting) {
        const defaultValue = nextPropsOrEmpty.defaultValue;
        if (!isNullOrUndef$3(defaultValue) && defaultValue !== domValue) {
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
    return isCheckedType(nextPropsOrEmpty.type) ? !isNullOrUndef$3(nextPropsOrEmpty.checked) : !isNullOrUndef$3(nextPropsOrEmpty.value);
  }
  function createRef() {
    return {
      current: null
    };
  }
  // TODO: Make this return value typed
  function forwardRef(render) {
    return {
      render
    };
  }
  function unmountRef(ref) {
    if (!isNullOrUndef$3(ref)) {
      if (!safeCall1(ref, null) && ref.current) {
        ref.current = null;
      }
    }
  }
  function mountRef(ref, value, lifecycle) {
    if (!isNullOrUndef$3(ref) && (isFunction$2(ref) || ref.current !== void 0)) {
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
      if (!isNull$2(props)) {
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
        if (isFunction$2(children.componentWillUnmount)) {
          // TODO: Possible entrypoint
          children.componentWillUnmount();
        }
        // A component that animates its own removal does not let its children animate. Inside such a
        // component animations is NO_ANIMATIONS, and its hook does not run either.
        let childAnimations = animations;
        if (isFunction$2(children.componentWillDisappear) && animations !== NO_ANIMATIONS) {
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
        if (!isNullOrUndef$3(ref)) {
          let domEl;
          if (isFunction$2(ref.onComponentWillUnmount)) {
            domEl = findDOMFromVNode(vNode, true);
            ref.onComponentWillUnmount(domEl, vNode.props || EMPTY_OBJ);
          }
          if (isFunction$2(ref.onComponentWillDisappear) && animations !== NO_ANIMATIONS) {
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
    if (isNullOrUndef$3(nextAttrValue)) {
      dom.removeAttribute('style');
      return;
    }
    const domStyle = dom.style;
    let style;
    let value;
    if (isString$2(nextAttrValue)) {
      domStyle.cssText = nextAttrValue;
      return;
    }
    if (!isNullOrUndef$3(lastAttrValue) && !isString$2(lastAttrValue)) {
      for (style in nextAttrValue) {
        // do not add a hasOwnProperty check here, it affects performance
        value = nextAttrValue[style];
        if (value !== lastAttrValue[style]) {
          domStyle.setProperty(style, value);
        }
      }
      for (style in lastAttrValue) {
        if (isNullOrUndef$3(nextAttrValue[style])) {
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
      if (!isNullOrUndef$3(nextHtml) && !isSameInnerHTML$1(dom, nextHtml)) {
        if (!isNull$2(lastVNode)) {
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
    const value = isNullOrUndef$3(nextValue) ? '' : nextValue;
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
        } else if (isNullOrUndef$3(nextValue)) {
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
    if (isFunction$2(instance.getChildContext)) {
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
      if (isFunction$2(instance.componentWillMount)) {
        instance.$BR = true;
        instance.componentWillMount();
        const pending = instance.$PS;
        if (!isNull$2(pending)) {
          const state = instance.state;
          if (isNull$2(state)) {
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
    if (!isNull$2(parentDOM)) {
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
    if (!isNullOrUndef$3(className) && className !== '') {
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
    if (!isNull$2(props)) {
      mountProps(vNode, flags, props, dom, isSVG);
    }
    if (!isNull$2(parentDOM)) {
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
    if (!isNullOrUndef$3(ref) && isFunction$2(ref.onComponentDidAppear)) {
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
    if (isFunction$2(instance.componentDidMount)) {
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
    if (!isNullOrUndef$3(ref)) {
      safeCall1(ref.onComponentWillMount, vNode.props || EMPTY_OBJ);
      if (isFunction$2(ref.onComponentDidMount)) {
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
    if (lastContainer !== nextContainer && !isInvalid$2(nextChildren)) {
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
          if (isNullOrUndef$3(nextPropsOrEmpty[prop]) && !isNullOrUndef$3(lastPropsOrEmpty[prop])) {
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
      if (isNullOrUndef$3(nextClassName)) {
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
    const hasSCU = isFunction$2(instance.shouldComponentUpdate);
    if (usesNewAPI) {
      nextState = createDerivedState(instance, nextProps, nextState !== lastState ? {
        ...lastState,
        ...nextState
      } : nextState);
    }
    if (force || !hasSCU || hasSCU && instance.shouldComponentUpdate(nextProps, nextState, context)) {
      if (!usesNewAPI && isFunction$2(instance.componentWillUpdate)) {
        instance.componentWillUpdate(nextProps, nextState, context);
      }
      instance.props = nextProps;
      instance.state = nextState;
      instance.context = context;
      let snapshot = null;
      const nextInput = renderNewInput(instance, nextProps, context, instance.$LI);
      if (usesNewAPI && isFunction$2(instance.getSnapshotBeforeUpdate)) {
        snapshot = instance.getSnapshotBeforeUpdate(lastProps, lastState);
      }
      patch(instance.$LI, nextInput, parentDOM, instance.$CX, isSVG, nextNode, lifecycle, animations);
      // Don't update Last input, until patch has been successfully executed
      instance.$LI = nextInput;
      if (isFunction$2(instance.componentDidUpdate)) {
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
    if (isNull$2(instance)) {
      return;
    }
    instance.$L = lifecycle;
    const nextProps = nextVNode.props || EMPTY_OBJ;
    const nextRef = nextVNode.ref;
    const lastRef = lastVNode.ref;
    let nextState = instance.state;
    if (!instance.$N) {
      if (isFunction$2(instance.componentWillReceiveProps)) {
        instance.$BR = true;
        instance.componentWillReceiveProps(nextProps, context);
        // If instance component was removed during its own update do nothing.
        if (instance.$UN) {
          return;
        }
        instance.$BR = false;
      }
      if (!isNull$2(instance.$PS)) {
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
    const nextHooksDefined = !isNullOrUndef$3(nextRef);
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
    if (isNullOrUndef$3(rootInput)) {
      if (!isNullOrUndef$3(input)) {
        if (mustCloneVNode(input, null)) {
          input = directClone(input);
        }
        mount(input, parentDOM, context, false, null, lifecycle, animations);
        parentDOM.$V = input;
      }
    } else {
      if (isNullOrUndef$3(input)) {
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
    if (isFunction$2(callback)) {
      callback();
    }
  }
  function render$1(input, parentDOM, callback = null, context = EMPTY_OBJ) {
    renderInternal(input, parentDOM, callback, context);
  }
  function createRenderer(parentDOM) {
    return function renderer(lastInput, nextInput, callback, context) {
      if (!parentDOM) {
        parentDOM = lastInput;
      }
      render$1(nextInput, parentDOM, callback, context);
    };
  }
  const COMPONENTS_QUEUE = [];
  const nextTick = Promise.resolve().then.bind(Promise.resolve());
  let microTaskPending = false;
  function queueStateChanges(component, newState, callback, force) {
    const pending = component.$PS;
    if (isFunction$2(newState)) {
      newState = newState(pending ? {
        ...component.state,
        ...pending
      } : component.state, component.props, component.context);
    }
    if (isNullOrUndef$3(pending)) {
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
          if (isFunction$2(callback)) {
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
      if (isFunction$2(callback)) {
        let QU = component.$QU;
        if (!QU) {
          QU = component.$QU = [];
        }
        QU.push(callback);
      }
    } else if (isFunction$2(callback)) {
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

  const ERROR_MSG = 'a runtime error occured! Use Inferno in development environment to find the error.';
  function isNullOrUndef$2(o) {
    return o === void 0 || o === null;
  }
  function isInvalid$1(o) {
    return o === null || o === false || o === true || o === void 0;
  }
  function isFunction$1(o) {
    return typeof o === 'function';
  }
  function isNull$1(o) {
    return o === null;
  }
  function throwError(message) {
    if (!message) {
      message = ERROR_MSG;
    }
    throw new Error(`Inferno Error: ${message}`);
  }
  function isSameInnerHTML(dom, innerHTML) {
    const tempdom = document.createElement('i');
    tempdom.innerHTML = innerHTML;
    return tempdom.innerHTML === dom.innerHTML;
  }
  function findLastDOMFromVNode(vNode) {
    let flags;
    let children;
    while (vNode) {
      flags = vNode.flags;
      if (flags & 1521 /* VNodeFlags.DOMRef */) {
        return vNode.dom;
      }
      children = vNode.children;
      if (flags & 8192 /* VNodeFlags.Fragment */) {
        vNode = vNode.childFlags === 2 /* ChildFlags.HasVNodeChildren */ ? children : children[children.length - 1];
      } else if (flags & 4 /* VNodeFlags.ComponentClass */) {
        vNode = children.$LI;
      } else {
        vNode = children;
      }
    }
    return null;
  }
  function isSamePropsInnerHTML(dom, props) {
    return Boolean(props?.dangerouslySetInnerHTML?.__html && isSameInnerHTML(dom, props.dangerouslySetInnerHTML.__html));
  }
  function hydrateComponent(vNode, parentDOM, dom, context, isSVG, isClass, lifecycle, animations) {
    const type = vNode.type;
    const ref = vNode.ref;
    const props = vNode.props || EMPTY_OBJ;
    let currentNode;
    if (isClass) {
      const instance = createClassComponentInstance(vNode, type, props, context, isSVG, lifecycle);
      const input = instance.$LI;
      currentNode = hydrateVNode(input, parentDOM, dom, instance.$CX, isSVG, lifecycle, animations);
      mountClassComponentCallbacks(ref, instance, lifecycle);
    } else {
      const input = normalizeRoot(renderFunctionalComponent(vNode, context));
      currentNode = hydrateVNode(input, parentDOM, dom, context, isSVG, lifecycle, animations);
      vNode.children = input;
      mountFunctionalComponentCallbacks(vNode, lifecycle);
    }
    return currentNode;
  }
  function hydrateChildren(parentVNode, parentNode, currentNode, context, isSVG, lifecycle, animations) {
    const childFlags = parentVNode.childFlags;
    let children = parentVNode.children;
    const props = parentVNode.props;
    const flags = parentVNode.flags;
    if (childFlags !== 1 /* ChildFlags.HasInvalidChildren */) {
      if (childFlags === 2 /* ChildFlags.HasVNodeChildren */) {
        if (children.flags & 16384 /* VNodeFlags.InUse */) {
          parentVNode.children = children = directClone(children);
        }
        if (isNull$1(currentNode)) {
          mount(children, parentNode, context, isSVG, null, lifecycle, animations);
        } else {
          currentNode = hydrateVNode(children, parentNode, currentNode, context, isSVG, lifecycle, animations);
          currentNode = currentNode ? currentNode.nextSibling : null;
        }
      } else if (childFlags === 16 /* ChildFlags.HasTextChildren */) {
        if (isNull$1(currentNode)) {
          parentNode.appendChild(document.createTextNode(children));
        } else if (parentNode.childNodes.length !== 1 || currentNode.nodeType !== 3) {
          parentNode.textContent = children;
        } else {
          if (currentNode.nodeValue !== children) {
            currentNode.nodeValue = children;
          }
        }
        currentNode = null;
      } else if (childFlags & 12 /* ChildFlags.MultipleChildren */) {
        let prevVNodeIsTextNode = false;
        for (let i = 0, len = children.length; i < len; ++i) {
          let child = children[i];
          if (child.flags & 16384 /* VNodeFlags.InUse */) {
            children[i] = child = directClone(child);
          }
          if (isNull$1(currentNode) || prevVNodeIsTextNode && (child.flags & 16 /* VNodeFlags.Text */) > 0) {
            mount(child, parentNode, context, isSVG, currentNode, lifecycle, animations);
          } else {
            currentNode = hydrateVNode(child, parentNode, currentNode, context, isSVG, lifecycle, animations);
            currentNode = currentNode ? currentNode.nextSibling : null;
          }
          prevVNodeIsTextNode = (child.flags & 16 /* VNodeFlags.Text */) > 0;
        }
      }
      // clear any other DOM nodes, there should be only a single entry for the root
      if ((flags & 8192 /* VNodeFlags.Fragment */) === 0) {
        // eslint-disable-next-line no-useless-assignment
        let nextSibling = null;
        while (currentNode) {
          nextSibling = currentNode.nextSibling;
          parentNode.removeChild(currentNode);
          currentNode = nextSibling;
        }
      }
    } else if (!isNull$1(parentNode.firstChild) && !isSamePropsInnerHTML(parentNode, props)) {
      parentNode.textContent = ''; // dom has content, but VNode has no children remove everything from DOM
      if (flags & 448 /* VNodeFlags.FormElement */) {
        // If element is form element, we need to clear defaultValue also
        parentNode.defaultValue = '';
      }
    }
  }
  function hydrateElement(vNode, parentDOM, dom, context, isSVG, lifecycle, animations) {
    const props = vNode.props;
    const className = vNode.className;
    const flags = vNode.flags;
    const ref = vNode.ref;
    isSVG = isSVG || (flags & 32 /* VNodeFlags.SvgElement */) > 0;
    if (dom.nodeType !== 1 || dom.tagName.toLowerCase() !== vNode.type) {
      mountElement(vNode, null, context, isSVG, null, lifecycle, animations);
      parentDOM.replaceChild(vNode.dom, dom);
    } else {
      vNode.dom = dom;
      hydrateChildren(vNode, dom, dom.firstChild, context, isSVG, lifecycle, animations);
      if (!isNull$1(props)) {
        mountProps(vNode, flags, props, dom, isSVG);
      }
      if (isNullOrUndef$2(className)) {
        if (dom.className !== '') {
          dom.removeAttribute('class');
        }
      } else if (isSVG) {
        dom.setAttribute('class', className);
      } else {
        dom.className = className;
      }
      mountRef(ref, dom, lifecycle);
    }
    return vNode.dom;
  }
  function hydrateText(vNode, parentDOM, dom) {
    if (dom.nodeType !== 3) {
      parentDOM.replaceChild(vNode.dom = document.createTextNode(vNode.children), dom);
    } else {
      const text = vNode.children;
      if (dom.nodeValue !== text) {
        dom.nodeValue = text;
      }
      vNode.dom = dom;
    }
    return vNode.dom;
  }
  function hydrateFragment(vNode, parentDOM, dom, context, isSVG, lifecycle, animations) {
    let children = vNode.children;
    // Fragment without children has an empty text node, same as when mounting
    if (vNode.childFlags & 12 /* ChildFlags.MultipleChildren */ && children.length === 0) {
      vNode.childFlags = 2 /* ChildFlags.HasVNodeChildren */;
      vNode.children = children = createTextVNode('');
    }
    if (vNode.childFlags === 2 /* ChildFlags.HasVNodeChildren */) {
      if (children.flags & 16384 /* VNodeFlags.InUse */) {
        vNode.children = children = directClone(children);
      }
      return hydrateVNode(children, parentDOM, dom, context, isSVG, lifecycle, animations);
    }
    hydrateChildren(vNode, parentDOM, dom, context, isSVG, lifecycle, animations);
    return findLastDOMFromVNode(children[children.length - 1]);
  }
  function hydrateVNode(vNode, parentDOM, currentDom, context, isSVG, lifecycle, animations) {
    const flags = vNode.flags |= 16384 /* VNodeFlags.InUse */;
    if (flags & 14 /* VNodeFlags.Component */) {
      return hydrateComponent(vNode, parentDOM, currentDom, context, isSVG, (flags & 4 /* VNodeFlags.ComponentClass */) > 0, lifecycle, animations);
    }
    if (flags & 481 /* VNodeFlags.Element */) {
      return hydrateElement(vNode, parentDOM, currentDom, context, isSVG, lifecycle, animations);
    }
    if (flags & 16 /* VNodeFlags.Text */) {
      return hydrateText(vNode, parentDOM, currentDom);
    }
    if (flags & 8192 /* VNodeFlags.Fragment */) {
      return hydrateFragment(vNode, parentDOM, currentDom, context, isSVG, lifecycle, animations);
    }
    throwError();
    return null;
  }
  function hydrate(input, parentDOM, callback) {
    let dom = parentDOM.firstChild;
    if (isNull$1(dom)) {
      render$1(input, parentDOM, callback);
    } else {
      const lifecycle = [];
      const animations = new AnimationQueues();
      if (!isInvalid$1(input)) {
        if (input.flags & 16384 /* VNodeFlags.InUse */) {
          input = directClone(input);
        }
        dom = hydrateVNode(input, parentDOM, dom, {}, false, lifecycle, animations);
      }
      // clear any other DOM nodes, there should be only a single entry for the root
      while (dom && (dom = dom.nextSibling)) {
        parentDOM.removeChild(dom);
      }
      if (lifecycle.length > 0) {
        let listener;
        while ((listener = lifecycle.shift()) !== undefined) {
          listener();
        }
      }
    }
    parentDOM.$V = input;
    if (isFunction$1(callback)) {
      callback();
    }
  }

  /*
   directClone is preferred over cloneVNode and used internally also.
   This function makes Inferno backwards compatible.
   And can be tree-shaked by modern bundlers
  */
  /**
   * Clones given virtual node by creating new instance of it
   * @param {VNode} vNodeToClone virtual node to be cloned
   * @param {Props=} props additional props for new virtual node
   * @param {...*} childArgs new children for new virtual node
   * @returns {VNode} new virtual node
   */
  function cloneVNode(vNodeToClone, props, ...childArgs) {
    const flags = vNodeToClone.flags;
    let children = flags & 14 /* VNodeFlags.Component */ ? vNodeToClone.props?.children : vNodeToClone.children;
    const childLen = childArgs.length;
    let className = vNodeToClone.className;
    let key = vNodeToClone.key;
    let ref = vNodeToClone.ref;
    if (props) {
      if (props.className !== void 0) {
        className = props.className;
      }
      if (props.ref !== void 0) {
        ref = props.ref;
      }
      if (props.key !== void 0) {
        key = props.key;
      }
      if (props.children !== void 0) {
        children = props.children;
      }
    } else {
      props = {};
    }
    if (childLen === 1) {
      children = childArgs[0];
    } else if (childLen > 1) {
      children = [];
      for (let i = 0; i < childLen; i++) {
        children.push(childArgs[i]);
      }
    }
    props.children = children;
    if (flags & 14 /* VNodeFlags.Component */) {
      return createComponentVNode(flags, vNodeToClone.type, !vNodeToClone.props && !props ? EMPTY_OBJ : {
        ...vNodeToClone.props,
        ...props
      }, key, ref);
    }
    if (flags & 16 /* VNodeFlags.Text */) {
      return createTextVNode(children);
    }
    if (flags & 8192 /* VNodeFlags.Fragment */) {
      return createFragment(childLen === 1 ? [children] : children, 0 /* ChildFlags.UnknownChildren */, key);
    }
    return normalizeProps(createVNode(flags, vNodeToClone.type, className, null, 1 /* ChildFlags.HasInvalidChildren */, {
      ...vNodeToClone.props,
      ...props
    }, key, ref));
  }

  function isNullOrUndef$1(o) {
    return o === void 0 || o === null;
  }
  function isString$1(o) {
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
    if (isString$1(type)) {
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

  function findDOMNode(ref) {
    if (ref && ref.nodeType) {
      return ref;
    }
    if (!ref || ref.$UN) {
      return null;
    }
    if (ref.$LI) {
      return findDOMFromVNode(ref.$LI, true);
    }
    if (ref.flags) {
      return findDOMFromVNode(ref, true);
    }
    return null;
  }

  const isArray = Array.isArray;
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
  function isValidElement(obj) {
    const isValidObject = typeof obj === 'object' && !isNull(obj);
    if (!isValidObject) {
      return false;
    }
    return (obj.flags & (14 /* VNodeFlags.Component */ | 481 /* VNodeFlags.Element */)) > 0;
  }

  /**
   * @module Inferno-Compat
   */
  /**
   * Inlined PropTypes, there is propType checking ATM.
   */
  function proptype() {}
  proptype.isRequired = proptype;
  function getProptype() {
    return proptype;
  }
  const PropTypes = {
    any: getProptype,
    array: proptype,
    arrayOf: getProptype,
    bool: proptype,
    checkPropTypes: () => null,
    element: getProptype,
    func: proptype,
    instanceOf: getProptype,
    node: getProptype,
    number: proptype,
    object: proptype,
    objectOf: getProptype,
    oneOf: getProptype,
    oneOfType: getProptype,
    shape: getProptype,
    string: proptype,
    symbol: proptype
  };

  /**
   * This is a list of all SVG attributes that need special casing,
   * namespacing, or boolean value assignment.
   *
   * When adding attributes to this list, be sure to also add them to
   * the `possibleStandardNames` module to ensure casing and incorrect
   * name warnings.
   *
   * SVG Attributes List:
   * https://www.w3.org/TR/SVG/attindex.html
   * SMIL Spec:
   * https://www.w3.org/TR/smil
   */
  const ATTRS = ['accent-height', 'alignment-baseline', 'arabic-form', 'baseline-shift', 'cap-height', 'clip-path', 'clip-rule', 'color-interpolation', 'color-interpolation-filters', 'color-profile', 'color-rendering', 'dominant-baseline', 'enable-background', 'fill-opacity', 'fill-rule', 'flood-color', 'flood-opacity', 'font-family', 'font-size', 'font-size-adjust', 'font-stretch', 'font-style', 'font-constiant', 'font-weight', 'glyph-name', 'glyph-orientation-horizontal', 'glyph-orientation-vertical', 'horiz-adv-x', 'horiz-origin-x', 'image-rendering', 'letter-spacing', 'lighting-color', 'marker-end', 'marker-mid', 'marker-start', 'overline-position', 'overline-thickness', 'paint-order', 'panose-1', 'pointer-events', 'rendering-intent', 'shape-rendering', 'stop-color', 'stop-opacity', 'strikethrough-position', 'strikethrough-thickness', 'stroke-dasharray', 'stroke-dashoffset', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'stroke-opacity', 'stroke-width', 'text-anchor', 'text-decoration', 'text-rendering', 'underline-position', 'underline-thickness', 'unicode-bidi', 'unicode-range', 'units-per-em', 'v-alphabetic', 'v-hanging', 'v-ideographic', 'v-mathematical', 'vector-effect', 'vert-adv-y', 'vert-origin-x', 'vert-origin-y', 'word-spacing', 'writing-mode', 'x-height', 'xlink:actuate', 'xlink:arcrole', 'xlink:href', 'xlink:role', 'xlink:show', 'xlink:title', 'xlink:type', 'xml:base', 'xmlns:xlink', 'xml:lang', 'xml:space'];
  const InfernoCompatPropertyMap = {
    htmlFor: 'for',
    onDoubleClick: 'onDblClick'
  };
  const CAMELIZE = /[-:]([a-z])/g;
  function capitalize(token) {
    return token[1].toUpperCase();
  }
  for (const original of ATTRS) {
    const reactName = original.replace(CAMELIZE, capitalize);
    InfernoCompatPropertyMap[reactName] = original;
  }
  function getNumberStyleValue(style, value) {
    switch (style) {
      case 'animation-iteration-count':
      case 'border-image-outset':
      case 'border-image-slice':
      case 'border-image-width':
      case 'box-flex':
      case 'box-flex-group':
      case 'box-ordinal-group':
      case 'column-count':
      case 'fill-opacity':
      case 'flex':
      case 'flex-grow':
      case 'flex-negative':
      case 'flex-order':
      case 'flex-positive':
      case 'flex-shrink':
      case 'flood-opacity':
      case 'font-weight':
      case 'grid-column':
      case 'grid-row':
      case 'line-clamp':
      case 'line-height':
      case 'opacity':
      case 'order':
      case 'orphans':
      case 'stop-opacity':
      case 'stroke-dasharray':
      case 'stroke-dashoffset':
      case 'stroke-miterlimit':
      case 'stroke-opacity':
      case 'stroke-width':
      case 'tab-size':
      case 'widows':
      case 'z-index':
      case 'zoom':
        return value;
      default:
        return value + 'px';
    }
  }
  const uppercasePattern = /[A-Z]/g;
  function hyphenCase(str) {
    return str.replace(uppercasePattern, '-$&').toLowerCase();
  }
  options.reactStyles = true;
  function unmountComponentAtNode(container) {
    renderInternal(null, container, null, {});
    return true;
  }
  function flatten(arr, result) {
    for (let i = 0, len = arr.length; i < len; ++i) {
      const value = arr[i];
      if (isArray(value)) {
        flatten(value, result);
      } else {
        result.push(value);
      }
    }
    return result;
  }
  const ARR = [];
  const Children = {
    map(children, fn, ctx) {
      if (isNullOrUndef(children)) {
        return children;
      }
      children = Children.toArray(children);
      if (ctx) {
        fn = fn.bind(ctx);
      }
      return children.map(fn);
    },
    forEach(children, fn, ctx) {
      if (isNullOrUndef(children)) {
        return;
      }
      children = Children.toArray(children);
      if (ctx) {
        fn = fn.bind(ctx);
      }
      for (let i = 0, len = children.length; i < len; ++i) {
        const child = isInvalid(children[i]) ? null : children[i];
        fn(child, i, children);
      }
    },
    count(children) {
      children = Children.toArray(children);
      return children.length;
    },
    only(children) {
      children = Children.toArray(children);
      if (children.length !== 1) {
        throw new Error('Children.only() expects only one child.');
      }
      return children[0];
    },
    toArray(children) {
      if (isNullOrUndef(children)) {
        return [];
      }
      // We need to flatten arrays here,
      // because React does it also and application level code might depend on that behavior
      if (isArray(children)) {
        const result = [];
        flatten(children, result);
        return result;
      }
      return ARR.concat(children);
    }
  };
  Component.prototype.isReactComponent = {};
  const version = '15.4.2';
  const validLineInputs = {
    date: true,
    'datetime-local': true,
    email: true,
    month: true,
    number: true,
    password: true,
    search: true,
    tel: true,
    text: true,
    time: true,
    url: true,
    week: true
  };
  function normalizeGenericProps(props) {
    for (const prop in props) {
      const mappedProp = InfernoCompatPropertyMap[prop];
      if (mappedProp && props[prop] && mappedProp !== prop) {
        props[mappedProp] = props[prop];
        props[prop] = void 0;
      }
      if (options.reactStyles && prop === 'style') {
        const styles = props.style;
        if (styles && !isString(styles)) {
          const newStyles = {};
          for (const s in styles) {
            const value = styles[s];
            const hyphenStr = hyphenCase(s);
            newStyles[hyphenStr] = isNumber(value) ? getNumberStyleValue(hyphenStr, value) : value;
          }
          props.style = newStyles;
        }
      }
    }
  }
  function normalizeFormProps(name, props) {
    if ((name === 'input' || name === 'textarea') && props.type !== 'radio' && props.onChange) {
      const type = props.type?.toLowerCase();
      let eventName;
      if (!type || validLineInputs[type]) {
        eventName = 'oninput';
      }
      if (eventName && !props[eventName]) {
        props[eventName] = props.onChange;
        props.onChange = void 0;
      }
    }
  }
  // we need to add persist() to Event (as React has it for synthetic events)
  // this is a hack, and we really shouldn't be modifying a global object this way,
  // but there isn't a performant way of doing this apart from trying to proxy
  // every prop event that starts with "on", i.e. onClick or onKeyPress
  // but in reality devs use onSomething for many things, not only for
  // input events
  if (typeof Event !== 'undefined') {
    const eventProtoType = Event.prototype;
    if (!eventProtoType.persist) {
      eventProtoType.persist = function () {};
    }
  }
  function iterableToArray(iterable) {
    let iterStep;
    const tmpArr = [];
    do {
      iterStep = iterable.next();
      tmpArr.push(iterStep.value);
    } while (!iterStep.done);
    return tmpArr;
  }
  const g = typeof window === 'undefined' ? global : window;
  const hasSymbolSupport = typeof g.Symbol !== 'undefined';
  const symbolIterator = hasSymbolSupport ? g.Symbol.iterator : '';
  const oldCreateVNode = options.createVNode;
  options.createVNode = vNode => {
    const children = vNode.children;
    let props = vNode.props;
    if (isNullOrUndef(props)) {
      props = vNode.props = {};
    }
    // React supports iterable children, in addition to Array-like
    if (hasSymbolSupport && !isNull(children) && typeof children === 'object' && !isArray(children) && isFunction(children[symbolIterator])) {
      vNode.children = iterableToArray(children[symbolIterator]());
    }
    if (!isNullOrUndef(children) && isNullOrUndef(props.children)) {
      props.children = children;
    }
    if (vNode.flags & 14 /* VNodeFlags.Component */) {
      if (isString(vNode.type)) {
        vNode.flags = getFlagsForElementVnode(vNode.type);
        if (props) {
          normalizeProps(vNode);
        }
      }
    }
    const flags = vNode.flags;
    if (flags & 448 /* VNodeFlags.FormElement */) {
      normalizeFormProps(vNode.type, props);
    }
    if (flags & 481 /* VNodeFlags.Element */) {
      if (vNode.className) {
        props.className = vNode.className;
      }
      normalizeGenericProps(props);
    }
    if (oldCreateVNode) {
      oldCreateVNode(vNode);
    }
  };
  // Credit: preact-compat - https://github.com/developit/preact-compat :)
  function shallowDiffers(a, b) {
    let i;
    for (i in a) {
      if (!(i in b)) {
        return true;
      }
    }
    for (i in b) {
      if (a[i] !== b[i]) {
        return true;
      }
    }
    return false;
  }
  class PureComponent extends Component {
    shouldComponentUpdate(props, state) {
      return shallowDiffers(this.props, props) || shallowDiffers(this.state, state);
    }
  }
  class WrapperComponent extends Component {
    getChildContext() {
      return this.props.context;
    }
    render(props) {
      return props.children;
    }
  }
  function unstable_renderSubtreeIntoContainer(parentComponent, vNode, container, callback) {
    const wrapperVNode = createComponentVNode(4 /* VNodeFlags.ComponentClass */, WrapperComponent, {
      children: vNode,
      context: parentComponent.context
    });
    render(wrapperVNode, container, null);
    const component = vNode.children;
    if (callback) {
      // callback gets the component as context, no other argument.
      callback.call(component);
    }
    return component;
  }
  function createFactory(type) {
    return createElement.bind(null, type);
  }
  function render(rootInput, container, cb = null, context = EMPTY_OBJ) {
    renderInternal(rootInput, container, cb, context);
    const input = container.$V;
    if (input && input.flags & 14 /* VNodeFlags.Component */) {
      return input.children;
    }
    return void 0;
  }
  // Mask React global in browser enviornments when React is not used.
  if (typeof window !== 'undefined' && typeof window.React === 'undefined') {
    const exports = {
      Children,
      Component,
      EMPTY_OBJ,
      Fragment,
      PropTypes,
      PureComponent,
      // Internal methods
      _CI: createClassComponentInstance,
      _HI: normalizeRoot,
      _M: mount,
      _MCCC: mountClassComponentCallbacks,
      _ME: mountElement,
      _MFCC: mountFunctionalComponentCallbacks,
      _MP: mountProps,
      _MR: mountRef,
      __render: renderInternal,
      // Public methods
      cloneElement: cloneVNode,
      cloneVNode,
      createComponentVNode,
      createElement,
      createFactory,
      createFragment,
      createPortal,
      createRef,
      createRenderer,
      createTextVNode,
      createVNode,
      directClone,
      findDOMFromVNode,
      findDOMNode,
      forwardRef,
      getFlagsForElementVnode,
      hydrate,
      isValidElement,
      linkEvent,
      normalizeProps,
      options,
      render,
      rerender,
      unmountComponentAtNode,
      unstable_renderSubtreeIntoContainer,
      version
    };
    window.React = exports;
    window.ReactDOM = exports;
  }

  /*
   * Inferno + inferno-compat without any Inferno specific optimizations
   * Optimization flags could be used, but the purpose is to track performance of slow code paths
   */

  uibench.init('Inferno compat (simple)', version);
  function TreeLeaf({
    children
  }) {
    return createVNode(1, "li", "TreeLeaf", createTextVNode(children), 0, null, null, null);
  }
  function shouldDataUpdate(lastProps, nextProps) {
    return lastProps !== nextProps;
  }
  function TreeNode({
    data
  }) {
    var length = data.children.length;
    var children = new Array(length);
    for (var i = 0; i < length; i++) {
      var n = data.children[i];
      var id = n.id;
      if (n.container) {
        children[i] = createComponentVNode(2, TreeNode, {
          "data": n
        }, id, {
          "onComponentShouldUpdate": shouldDataUpdate
        });
      } else {
        children[i] = createComponentVNode(2, TreeLeaf, {
          children: id
        }, id, {
          "onComponentShouldUpdate": shouldDataUpdate
        });
      }
    }
    return createVNode(1, "ul", "TreeNode", children, 0, null, null, null);
  }
  function tree(data) {
    return createVNode(1, "div", "Tree", createComponentVNode(2, TreeNode, {
      "data": data.root
    }, null, {
      "onComponentShouldUpdate": shouldDataUpdate
    }), 2, null, null, null);
  }
  function AnimBox({
    data
  }) {
    var time = data.time % 10;
    var style = 'border-radius:' + time + 'px;' + 'background:rgba(0,0,0,' + (0.5 + time / 10) + ')';
    return createVNode(1, "div", "AnimBox", null, 1, {
      "data-id": data.id,
      "style": style
    }, null, null);
  }
  function anim(data) {
    var items = data.items;
    var length = items.length;
    var children = new Array(length);
    for (var i = 0; i < length; i++) {
      var item = items[i];

      // Here we are using onComponentShouldUpdate functional Component hook, to short circuit rendering process of AnimBox Component
      // When the data does not change
      children[i] = createComponentVNode(2, AnimBox, {
        "data": item
      }, item.id, {
        "onComponentShouldUpdate": shouldDataUpdate
      });
    }
    return createVNode(1, "div", "Anim", children, 0, null, null, null);
  }
  function onClick(text, e) {
    console.log('Clicked', text);
    e.stopPropagation();
  }
  function TableCell({
    children
  }) {
    return createVNode(1, "td", "TableCell", createTextVNode(children), 0, {
      "onClick": linkEvent(children, onClick)
    }, null, null);
  }
  function TableRow({
    data
  }) {
    var classes = 'TableRow';
    if (data.active) {
      classes = 'TableRow active';
    }
    var cells = data.props;
    var length = cells.length + 1;
    var children = new Array(length);
    children[0] = createComponentVNode(2, TableCell, {
      children: '#' + data.id
    }, null, {
      "onComponentShouldUpdate": shouldDataUpdate
    });
    for (var i = 1; i < length; i++) {
      children[i] = createComponentVNode(2, TableCell, {
        children: cells[i - 1]
      }, null, {
        "onComponentShouldUpdate": shouldDataUpdate
      });
    }
    return createVNode(1, "tr", classes, children, 0, {
      "data-id": data.id
    }, null, null);
  }
  function table(data) {
    var items = data.items;
    var length = items.length;
    var children = new Array(length);
    for (var i = 0; i < length; i++) {
      var item = items[i];
      children[i] = createComponentVNode(2, TableRow, {
        "data": item,
        children: item
      }, item.id, {
        "onComponentShouldUpdate": shouldDataUpdate
      });
    }
    return createVNode(1, "table", "Table", children, 0, null, null, null);
  }
  function main(data) {
    var location = data.location;
    var section;
    if (location === 'table') {
      section = table(data.table);
    } else if (location === 'anim') {
      section = anim(data.anim);
    } else if (location === 'tree') {
      section = tree(data.tree);
    }
    return createVNode(1, "div", "Main", section, 0, null, null, null);
  }
  document.addEventListener('DOMContentLoaded', function (e) {
    var container = document.querySelector('#App');
    uibench.run(function (state) {
      render(main(state), container);
    }, function (samples) {
      render(createVNode(1, "pre", null, JSON.stringify(samples, null, ' '), 0, null, null, null), container);
    });
  });

})();
