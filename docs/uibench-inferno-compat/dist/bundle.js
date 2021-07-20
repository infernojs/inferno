(function () {
    'use strict';

    var isArray$2 = Array.isArray;
    function isStringOrNumber$1(o) {
        var type = typeof o;
        return type === 'string' || type === 'number';
    }
    function isNullOrUndef$4(o) {
        return o === void 0 || o === null;
    }
    function isInvalid$3(o) {
        return o === null || o === false || o === true || o === void 0;
    }
    function isFunction$4(o) {
        return typeof o === 'function';
    }
    function isString$3(o) {
        return typeof o === 'string';
    }
    function isNumber$2(o) {
        return typeof o === 'number';
    }
    function isNull$3(o) {
        return o === null;
    }
    function isUndefined$2(o) {
        return o === void 0;
    }
    function combineFrom$2(first, second) {
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

    // We need EMPTY_OBJ defined in one place.
    // Its used for comparison so we cant inline it into shared
    var EMPTY_OBJ$1 = {};
    function mergeUnsetProperties$1(to, from) {
        for (var propName in from) {
            if (isUndefined$2(to[propName])) {
                to[propName] = from[propName];
            }
        }
        return to;
    }

    var keyPrefix$1 = '$';
    function V$1(childFlags, children, className, flags, key, props, ref, type) {
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
    function createVNode$1(flags, type, className, children, childFlags, props, key, ref) {
        var childFlag = childFlags === void 0 ? 1 /* HasInvalidChildren */ : childFlags;
        var vNode = new V$1(childFlag, children, className, flags, key, props, ref, type);
        if (childFlag === 0 /* UnknownChildren */) {
            normalizeChildren$1(vNode, vNode.children);
        }
        return vNode;
    }
    function mergeDefaultHooks$1(flags, type, ref) {
        if (flags & 4 /* ComponentClass */) {
            return ref;
        }
        var defaultHooks = (flags & 32768 /* ForwardRef */ ? type.render : type).defaultHooks;
        if (isNullOrUndef$4(defaultHooks)) {
            return ref;
        }
        if (isNullOrUndef$4(ref)) {
            return defaultHooks;
        }
        return mergeUnsetProperties$1(ref, defaultHooks);
    }
    function mergeDefaultProps$1(flags, type, props) {
        // set default props
        var defaultProps = (flags & 32768 /* ForwardRef */ ? type.render : type).defaultProps;
        if (isNullOrUndef$4(defaultProps)) {
            return props;
        }
        if (isNullOrUndef$4(props)) {
            return combineFrom$2(defaultProps, null);
        }
        return mergeUnsetProperties$1(props, defaultProps);
    }
    function resolveComponentFlags$1(flags, type) {
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
    function createComponentVNode$1(flags, type, props, key, ref) {
        flags = resolveComponentFlags$1(flags, type);
        var vNode = new V$1(1 /* HasInvalidChildren */, null, null, flags, key, mergeDefaultProps$1(flags, type, props), mergeDefaultHooks$1(flags, type, ref), type);
        return vNode;
    }
    function createTextVNode$1(text, key) {
        return new V$1(1 /* HasInvalidChildren */, isNullOrUndef$4(text) || text === true || text === false ? '' : text, null, 16 /* Text */, key, null, null, null);
    }
    function createFragment$1(children, childFlags, key) {
        var fragment = createVNode$1(8192 /* Fragment */, 8192 /* Fragment */, null, children, childFlags, null, key, null);
        switch (fragment.childFlags) {
            case 1 /* HasInvalidChildren */:
                fragment.children = createVoidVNode$1();
                fragment.childFlags = 2 /* HasVNodeChildren */;
                break;
            case 16 /* HasTextChildren */:
                fragment.children = [createTextVNode$1(children)];
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
    function cloneFragment$1(vNodeToClone) {
        var oldChildren = vNodeToClone.children;
        var childFlags = vNodeToClone.childFlags;
        return createFragment$1(childFlags === 2 /* HasVNodeChildren */ ? directClone$1(oldChildren) : oldChildren.map(directClone$1), childFlags, vNodeToClone.key);
    }
    function directClone$1(vNodeToClone) {
        var flags = vNodeToClone.flags & -16385 /* ClearInUse */;
        var props = vNodeToClone.props;
        if (flags & 14 /* Component */) {
            if (!isNull$3(props)) {
                var propsToClone = props;
                props = {};
                for (var key in propsToClone) {
                    props[key] = propsToClone[key];
                }
            }
        }
        if ((flags & 8192 /* Fragment */) === 0) {
            return new V$1(vNodeToClone.childFlags, vNodeToClone.children, vNodeToClone.className, flags, vNodeToClone.key, props, vNodeToClone.ref, vNodeToClone.type);
        }
        return cloneFragment$1(vNodeToClone);
    }
    function createVoidVNode$1() {
        return createTextVNode$1('', null);
    }
    function _normalizeVNodes$1(nodes, result, index, currentKey) {
        for (var len = nodes.length; index < len; index++) {
            var n = nodes[index];
            if (!isInvalid$3(n)) {
                var newKey = currentKey + keyPrefix$1 + index;
                if (isArray$2(n)) {
                    _normalizeVNodes$1(n, result, 0, newKey);
                }
                else {
                    if (isStringOrNumber$1(n)) {
                        n = createTextVNode$1(n, newKey);
                    }
                    else {
                        var oldKey = n.key;
                        var isPrefixedKey = isString$3(oldKey) && oldKey[0] === keyPrefix$1;
                        if (n.flags & 81920 /* InUseOrNormalized */ || isPrefixedKey) {
                            n = directClone$1(n);
                        }
                        n.flags |= 65536 /* Normalized */;
                        if (!isPrefixedKey) {
                            if (isNull$3(oldKey)) {
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
    function normalizeChildren$1(vNode, children) {
        var newChildren;
        var newChildFlags = 1 /* HasInvalidChildren */;
        // Don't change children to match strict equal (===) true in patching
        if (isInvalid$3(children)) {
            newChildren = children;
        }
        else if (isStringOrNumber$1(children)) {
            newChildFlags = 16 /* HasTextChildren */;
            newChildren = children;
        }
        else if (isArray$2(children)) {
            var len = children.length;
            for (var i = 0; i < len; ++i) {
                var n = children[i];
                if (isInvalid$3(n) || isArray$2(n)) {
                    newChildren = newChildren || children.slice(0, i);
                    _normalizeVNodes$1(children, newChildren, i, '');
                    break;
                }
                else if (isStringOrNumber$1(n)) {
                    newChildren = newChildren || children.slice(0, i);
                    newChildren.push(createTextVNode$1(n, keyPrefix$1 + i));
                }
                else {
                    var key = n.key;
                    var needsCloning = (n.flags & 81920 /* InUseOrNormalized */) > 0;
                    var isNullKey = isNull$3(key);
                    var isPrefixed = isString$3(key) && key[0] === keyPrefix$1;
                    if (needsCloning || isNullKey || isPrefixed) {
                        newChildren = newChildren || children.slice(0, i);
                        if (needsCloning || isPrefixed) {
                            n = directClone$1(n);
                        }
                        if (isNullKey || isPrefixed) {
                            n.key = keyPrefix$1 + i;
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
                newChildren = directClone$1(children);
            }
            newChildFlags = 2 /* HasVNodeChildren */;
        }
        vNode.children = newChildren;
        vNode.childFlags = newChildFlags;
        return vNode;
    }

    function triggerEventListener$1(props, methodName, e) {
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
    function createWrappedFunction$1(methodName, applyValue) {
        var fnMethod = function (e) {
            var vNode = this.$V;
            // If vNode is gone by the time event fires, no-op
            if (!vNode) {
                return;
            }
            var props = vNode.props || EMPTY_OBJ$1;
            var dom = vNode.dom;
            if (isString$3(methodName)) {
                triggerEventListener$1(props, methodName, e);
            }
            else {
                for (var i = 0; i < methodName.length; ++i) {
                    triggerEventListener$1(props, methodName[i], e);
                }
            }
            if (isFunction$4(applyValue)) {
                var newVNode = this.$V;
                var newProps = newVNode.props || EMPTY_OBJ$1;
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

    function isCheckedType$1(type) {
        return type === 'checkbox' || type === 'radio';
    }
    createWrappedFunction$1('onInput', applyValueInput$1);
    createWrappedFunction$1(['onClick', 'onChange'], applyValueInput$1);
    function applyValueInput$1(nextPropsOrEmpty, dom) {
        var type = nextPropsOrEmpty.type;
        var value = nextPropsOrEmpty.value;
        var checked = nextPropsOrEmpty.checked;
        var multiple = nextPropsOrEmpty.multiple;
        var defaultValue = nextPropsOrEmpty.defaultValue;
        var hasValue = !isNullOrUndef$4(value);
        if (type && type !== dom.type) {
            dom.setAttribute('type', type);
        }
        if (!isNullOrUndef$4(multiple) && multiple !== dom.multiple) {
            dom.multiple = multiple;
        }
        if (!isNullOrUndef$4(defaultValue) && !hasValue) {
            dom.defaultValue = defaultValue + '';
        }
        if (isCheckedType$1(type)) {
            if (hasValue) {
                dom.value = value;
            }
            if (!isNullOrUndef$4(checked)) {
                dom.checked = checked;
            }
        }
        else {
            if (hasValue && dom.value !== value) {
                dom.defaultValue = value;
                dom.value = value;
            }
            else if (!isNullOrUndef$4(checked)) {
                dom.checked = checked;
            }
        }
    }

    function updateChildOptions$1(vNode, value) {
        if (vNode.type === 'option') {
            updateChildOption$1(vNode, value);
        }
        else {
            var children = vNode.children;
            var flags = vNode.flags;
            if (flags & 4 /* ComponentClass */) {
                updateChildOptions$1(children.$LI, value);
            }
            else if (flags & 8 /* ComponentFunction */) {
                updateChildOptions$1(children, value);
            }
            else if (vNode.childFlags === 2 /* HasVNodeChildren */) {
                updateChildOptions$1(children, value);
            }
            else if (vNode.childFlags & 12 /* MultipleChildren */) {
                for (var i = 0, len = children.length; i < len; ++i) {
                    updateChildOptions$1(children[i], value);
                }
            }
        }
    }
    function updateChildOption$1(vNode, value) {
        var props = vNode.props || EMPTY_OBJ$1;
        var dom = vNode.dom;
        // we do this as multiple may have changed
        dom.value = props.value;
        if (props.value === value || (isArray$2(value) && value.indexOf(props.value) !== -1)) {
            dom.selected = true;
        }
        else if (!isNullOrUndef$4(value) || !isNullOrUndef$4(props.selected)) {
            dom.selected = props.selected || false;
        }
    }
    createWrappedFunction$1('onChange', applyValueSelect$1);
    function applyValueSelect$1(nextPropsOrEmpty, dom, mounting, vNode) {
        var multiplePropInBoolean = Boolean(nextPropsOrEmpty.multiple);
        if (!isNullOrUndef$4(nextPropsOrEmpty.multiple) && multiplePropInBoolean !== dom.multiple) {
            dom.multiple = multiplePropInBoolean;
        }
        var index = nextPropsOrEmpty.selectedIndex;
        if (index === -1) {
            dom.selectedIndex = -1;
        }
        var childFlags = vNode.childFlags;
        if (childFlags !== 1 /* HasInvalidChildren */) {
            var value = nextPropsOrEmpty.value;
            if (isNumber$2(index) && index > -1 && dom.options[index]) {
                value = dom.options[index].value;
            }
            if (mounting && isNullOrUndef$4(value)) {
                value = nextPropsOrEmpty.defaultValue;
            }
            updateChildOptions$1(vNode, value);
        }
    }

    createWrappedFunction$1('onInput', applyValueTextArea$1);
    createWrappedFunction$1('onChange');
    function applyValueTextArea$1(nextPropsOrEmpty, dom, mounting) {
        var value = nextPropsOrEmpty.value;
        var domValue = dom.value;
        if (isNullOrUndef$4(value)) {
            if (mounting) {
                var defaultValue = nextPropsOrEmpty.defaultValue;
                if (!isNullOrUndef$4(defaultValue) && defaultValue !== domValue) {
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

    var hasDocumentAvailable$1 = typeof document !== 'undefined';
    if (hasDocumentAvailable$1) {
        /*
         * Defining $EV and $V properties on Node.prototype
         * fixes v8 "wrong map" de-optimization
         */
        if (window.Node) {
            Node.prototype.$EV = null;
            Node.prototype.$V = null;
        }
    }
    typeof Promise !== 'undefined'
        ? Promise.resolve().then.bind(Promise.resolve())
        : function (a) {
            window.setTimeout(a, 0);
        };

    var isArray$1 = Array.isArray;

    function isStringOrNumber(o) {
      var type = typeof o;
      return type === 'string' || type === 'number';
    }

    function isNullOrUndef$3(o) {
      return o === void 0 || o === null;
    }

    function isInvalid$2(o) {
      return o === null || o === false || o === true || o === void 0;
    }

    function isFunction$3(o) {
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

    function combineFrom$1(first, second) {
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
    /**
     * Links given data to event as first parameter
     * @param {*} data data to be linked, it will be available in function as first parameter
     * @param {Function} event Function to be called when event occurs
     * @returns {{data: *, event: Function}}
     */


    function linkEvent(data, event) {
      if (isFunction$3(event)) {
        return {
          data: data,
          event: event
        };
      }

      return null; // Return null when event is invalid, to avoid creating unnecessary event handlers
    } // object.event should always be function, otherwise its badly created object.


    function isLinkEventObject(o) {
      return !isNull$2(o) && typeof o === 'object';
    } // We need EMPTY_OBJ defined in one place.
    // Its used for comparison so we cant inline it into shared


    var EMPTY_OBJ = {};
    var Fragment = '$F';

    var AnimationQueues = function AnimationQueues() {
      this.componentDidAppear = [];
      this.componentWillDisappear = [];
      this.componentWillMove = [];
    };

    function normalizeEventName(name) {
      return name.substr(2).toLowerCase();
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
      for (var i = 0; i < arrayFn.length; i++) {
        arrayFn[i]();
      }
    }

    function findChildVNode(vNode, startEdge, flags) {
      var children = vNode.children;

      if (flags & 4
      /* ComponentClass */
      ) {
          return children.$LI;
        }

      if (flags & 8192
      /* Fragment */
      ) {
          return vNode.childFlags === 2
          /* HasVNodeChildren */
          ? children : children[startEdge ? 0 : children.length - 1];
        }

      return children;
    }

    function findDOMfromVNode(vNode, startEdge) {
      var flags;

      while (vNode) {
        flags = vNode.flags;

        if (flags & 2033
        /* DOMRef */
        ) {
            return vNode.dom;
          }

        vNode = findChildVNode(vNode, startEdge, flags);
      }

      return null;
    }

    function callAllAnimationHooks(animationQueue, callback) {
      var animationsLeft = animationQueue.length; // Picking from the top because it is faster, invocation order should be irrelevant
      // since all animations are to be run and we can't predict the order in which they complete.

      var fn;

      while ((fn = animationQueue.pop()) !== undefined) {
        fn(function () {
          if (--animationsLeft <= 0 && isFunction$3(callback)) {
            callback();
          }
        });
      }
    }

    function callAllMoveAnimationHooks(animationQueue) {
      // Start the animations.
      for (var i = 0; i < animationQueue.length; i++) {
        animationQueue[i].fn();
      } // Perform the actual DOM moves when all measurements of initial
      // position have been performed. The rest of the animations are done
      // async.


      for (var i$1 = 0; i$1 < animationQueue.length; i$1++) {
        var tmp = animationQueue[i$1];
        insertOrAppend(tmp.parent, tmp.dom, tmp.next);
      }

      animationQueue.splice(0, animationQueue.length);
    }

    function clearVNodeDOM(vNode, parentDOM, deferredRemoval) {
      do {
        var flags = vNode.flags;

        if (flags & 2033
        /* DOMRef */
        ) {
            // On deferred removals the node might disappear because of later operations
            if (!deferredRemoval || vNode.dom.parentNode === parentDOM) {
              removeChild(parentDOM, vNode.dom);
            }

            return;
          }

        var children = vNode.children;

        if (flags & 4
        /* ComponentClass */
        ) {
            vNode = children.$LI;
          }

        if (flags & 8
        /* ComponentFunction */
        ) {
            vNode = children;
          }

        if (flags & 8192
        /* Fragment */
        ) {
            if (vNode.childFlags === 2
            /* HasVNodeChildren */
            ) {
                vNode = children;
              } else {
              for (var i = 0, len = children.length; i < len; ++i) {
                clearVNodeDOM(children[i], parentDOM, false);
              }

              return;
            }
          }
      } while (vNode);
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
        dom: dom,
        fn: function fn() {
          if (flags & 4
          /* ComponentClass */
          ) {
              refOrInstance.componentWillMove(parentVNode, parentDOM, dom, props);
            } else if (flags & 8
          /* ComponentFunction */
          ) {
              refOrInstance.onComponentWillMove(parentVNode, parentDOM, dom, props);
            }
        },
        next: nextNode,
        parent: parentDOM
      });
    }

    function moveVNodeDOM(parentVNode, vNode, parentDOM, nextNode, animations) {
      var refOrInstance;
      var instanceProps;
      var instanceFlags = vNode.flags;

      do {
        var flags = vNode.flags;

        if (flags & 2033
        /* DOMRef */
        ) {
            if (!isNullOrUndef$3(refOrInstance) && (isFunction$3(refOrInstance.componentWillMove) || isFunction$3(refOrInstance.onComponentWillMove))) {
              addMoveAnimationHook(animations, parentVNode, refOrInstance, vNode.dom, parentDOM, nextNode, instanceFlags, instanceProps);
            } else {
              // TODO: Should we delay this too to support mixing animated moves with regular?
              insertOrAppend(parentDOM, vNode.dom, nextNode);
            }

            return;
          }

        var children = vNode.children;

        if (flags & 4
        /* ComponentClass */
        ) {
            refOrInstance = vNode.children;
            instanceProps = vNode.props;
            vNode = children.$LI;
          }

        if (flags & 8
        /* ComponentFunction */
        ) {
            refOrInstance = vNode.ref;
            instanceProps = vNode.props;
            vNode = children;
          }

        if (flags & 8192
        /* Fragment */
        ) {
            if (vNode.childFlags === 2
            /* HasVNodeChildren */
            ) {
                vNode = children;
              } else {
              for (var i = 0, len = children.length; i < len; ++i) {
                moveVNodeDOM(parentVNode, children[i], parentDOM, nextNode, animations);
              }

              return;
            }
          }
      } while (vNode);
    }

    function createDerivedState(instance, nextProps, state) {
      if (instance.constructor.getDerivedStateFromProps) {
        return combineFrom$1(state, instance.constructor.getDerivedStateFromProps(nextProps, state));
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
    } // Calling this function assumes, nextValue is linkEvent


    function isLastValueSameLinkEvent(lastValue, nextValue) {
      return isLinkEventObject(lastValue) && lastValue.event === nextValue.event && lastValue.data === nextValue.data;
    }

    function mergeUnsetProperties(to, from) {
      for (var propName in from) {
        if (isUndefined$1(to[propName])) {
          to[propName] = from[propName];
        }
      }

      return to;
    }

    function safeCall1(method, arg1) {
      return !!isFunction$3(method) && (method(arg1), true);
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
      var childFlag = childFlags === void 0 ? 1
      /* HasInvalidChildren */
      : childFlags;
      var vNode = new V(childFlag, children, className, flags, key, props, ref, type);

      if (options.createVNode) {
        options.createVNode(vNode);
      }

      if (childFlag === 0
      /* UnknownChildren */
      ) {
          normalizeChildren(vNode, vNode.children);
        }

      return vNode;
    }

    function mergeDefaultHooks(flags, type, ref) {
      if (flags & 4
      /* ComponentClass */
      ) {
          return ref;
        }

      var defaultHooks = (flags & 32768
      /* ForwardRef */
      ? type.render : type).defaultHooks;

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
      var defaultProps = (flags & 32768
      /* ForwardRef */
      ? type.render : type).defaultProps;

      if (isNullOrUndef$3(defaultProps)) {
        return props;
      }

      if (isNullOrUndef$3(props)) {
        return combineFrom$1(defaultProps, null);
      }

      return mergeUnsetProperties(props, defaultProps);
    }

    function resolveComponentFlags(flags, type) {
      if (flags & 12
      /* ComponentKnown */
      ) {
          return flags;
        }

      if (type.prototype && type.prototype.render) {
        return 4
        /* ComponentClass */
        ;
      }

      if (type.render) {
        return 32776
        /* ForwardRefComponent */
        ;
      }

      return 8
      /* ComponentFunction */
      ;
    }

    function createComponentVNode(flags, type, props, key, ref) {
      flags = resolveComponentFlags(flags, type);
      var vNode = new V(1
      /* HasInvalidChildren */
      , null, null, flags, key, mergeDefaultProps(flags, type, props), mergeDefaultHooks(flags, type, ref), type);

      if (options.createVNode) {
        options.createVNode(vNode);
      }

      return vNode;
    }

    function createTextVNode(text, key) {
      return new V(1
      /* HasInvalidChildren */
      , isNullOrUndef$3(text) || text === true || text === false ? '' : text, null, 16
      /* Text */
      , key, null, null, null);
    }

    function createFragment(children, childFlags, key) {
      var fragment = createVNode(8192
      /* Fragment */
      , 8192
      /* Fragment */
      , null, children, childFlags, null, key, null);

      switch (fragment.childFlags) {
        case 1
        /* HasInvalidChildren */
        :
          fragment.children = createVoidVNode();
          fragment.childFlags = 2
          /* HasVNodeChildren */
          ;
          break;

        case 16
        /* HasTextChildren */
        :
          fragment.children = [createTextVNode(children)];
          fragment.childFlags = 4
          /* HasNonKeyedChildren */
          ;
          break;
      }

      return fragment;
    }

    function normalizeProps(vNode) {
      var props = vNode.props;

      if (props) {
        var flags = vNode.flags;

        if (flags & 481
        /* Element */
        ) {
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
          if (flags & 8
          /* ComponentFunction */
          ) {
              vNode.ref = combineFrom$1(vNode.ref, props.ref);
            } else {
            vNode.ref = props.ref;
          }

          props.ref = undefined;
        }
      }

      return vNode;
    }
    /*
     * Fragment is different than normal vNode,
     * because when it needs to be cloned we need to clone its children too
     * But not normalize, because otherwise those possibly get KEY and re-mount
     */


    function cloneFragment(vNodeToClone) {
      var oldChildren = vNodeToClone.children;
      var childFlags = vNodeToClone.childFlags;
      return createFragment(childFlags === 2
      /* HasVNodeChildren */
      ? directClone(oldChildren) : oldChildren.map(directClone), childFlags, vNodeToClone.key);
    }

    function directClone(vNodeToClone) {
      var flags = vNodeToClone.flags & -16385
      /* ClearInUse */
      ;
      var props = vNodeToClone.props;

      if (flags & 14
      /* Component */
      ) {
          if (!isNull$2(props)) {
            var propsToClone = props;
            props = {};

            for (var key in propsToClone) {
              props[key] = propsToClone[key];
            }
          }
        }

      if ((flags & 8192
      /* Fragment */
      ) === 0) {
        return new V(vNodeToClone.childFlags, vNodeToClone.children, vNodeToClone.className, flags, vNodeToClone.key, props, vNodeToClone.ref, vNodeToClone.type);
      }

      return cloneFragment(vNodeToClone);
    }

    function createVoidVNode() {
      return createTextVNode('', null);
    }

    function createPortal(children, container) {
      var normalizedRoot = normalizeRoot(children);
      return createVNode(1024
      /* Portal */
      , 1024
      /* Portal */
      , null, normalizedRoot, 0
      /* UnknownChildren */
      , null, normalizedRoot.key, container);
    }

    function _normalizeVNodes(nodes, result, index, currentKey) {
      for (var len = nodes.length; index < len; index++) {
        var n = nodes[index];

        if (!isInvalid$2(n)) {
          var newKey = currentKey + keyPrefix + index;

          if (isArray$1(n)) {
            _normalizeVNodes(n, result, 0, newKey);
          } else {
            if (isStringOrNumber(n)) {
              n = createTextVNode(n, newKey);
            } else {
              var oldKey = n.key;
              var isPrefixedKey = isString$2(oldKey) && oldKey[0] === keyPrefix;

              if (n.flags & 81920
              /* InUseOrNormalized */
              || isPrefixedKey) {
                n = directClone(n);
              }

              n.flags |= 65536
              /* Normalized */
              ;

              if (!isPrefixedKey) {
                if (isNull$2(oldKey)) {
                  n.key = newKey;
                } else {
                  n.key = currentKey + oldKey;
                }
              } else if (oldKey.substring(0, currentKey.length) !== currentKey) {
                n.key = currentKey + oldKey;
              }
            }

            result.push(n);
          }
        }
      }
    }

    function getFlagsForElementVnode(type) {
      switch (type) {
        case 'svg':
          return 32
          /* SvgElement */
          ;

        case 'input':
          return 64
          /* InputElement */
          ;

        case 'select':
          return 256
          /* SelectElement */
          ;

        case 'textarea':
          return 128
          /* TextareaElement */
          ;

        case Fragment:
          return 8192
          /* Fragment */
          ;

        default:
          return 1
          /* HtmlElement */
          ;
      }
    }

    function normalizeChildren(vNode, children) {
      var newChildren;
      var newChildFlags = 1
      /* HasInvalidChildren */
      ; // Don't change children to match strict equal (===) true in patching

      if (isInvalid$2(children)) {
        newChildren = children;
      } else if (isStringOrNumber(children)) {
        newChildFlags = 16
        /* HasTextChildren */
        ;
        newChildren = children;
      } else if (isArray$1(children)) {
        var len = children.length;

        for (var i = 0; i < len; ++i) {
          var n = children[i];

          if (isInvalid$2(n) || isArray$1(n)) {
            newChildren = newChildren || children.slice(0, i);

            _normalizeVNodes(children, newChildren, i, '');

            break;
          } else if (isStringOrNumber(n)) {
            newChildren = newChildren || children.slice(0, i);
            newChildren.push(createTextVNode(n, keyPrefix + i));
          } else {
            var key = n.key;
            var needsCloning = (n.flags & 81920
            /* InUseOrNormalized */
            ) > 0;
            var isNullKey = isNull$2(key);
            var isPrefixed = isString$2(key) && key[0] === keyPrefix;

            if (needsCloning || isNullKey || isPrefixed) {
              newChildren = newChildren || children.slice(0, i);

              if (needsCloning || isPrefixed) {
                n = directClone(n);
              }

              if (isNullKey || isPrefixed) {
                n.key = keyPrefix + i;
              }

              newChildren.push(n);
            } else if (newChildren) {
              newChildren.push(n);
            }

            n.flags |= 65536
            /* Normalized */
            ;
          }
        }

        newChildren = newChildren || children;

        if (newChildren.length === 0) {
          newChildFlags = 1
          /* HasInvalidChildren */
          ;
        } else {
          newChildFlags = 8
          /* HasKeyedChildren */
          ;
        }
      } else {
        newChildren = children;
        newChildren.flags |= 65536
        /* Normalized */
        ;

        if (children.flags & 81920
        /* InUseOrNormalized */
        ) {
            newChildren = directClone(children);
          }

        newChildFlags = 2
        /* HasVNodeChildren */
        ;
      }

      vNode.children = newChildren;
      vNode.childFlags = newChildFlags;
      return vNode;
    }

    function normalizeRoot(input) {
      if (isInvalid$2(input) || isStringOrNumber(input)) {
        return createTextVNode(input, null);
      }

      if (isArray$1(input)) {
        return createFragment(input, 0
        /* UnknownChildren */
        , null);
      }

      return input.flags & 16384
      /* InUse */
      ? directClone(input) : input;
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
      if (isFunction$3(nextEvent)) {
        updateOrAddSyntheticEvent(name, dom)[name] = nextEvent;
      } else if (isLinkEventObject(nextEvent)) {
        if (isLastValueSameLinkEvent(lastEvent, nextEvent)) {
          return;
        }

        updateOrAddSyntheticEvent(name, dom)[name] = nextEvent;
      } else {
        unmountSyntheticEvent(name, dom);
      }
    } // When browsers fully support event.composedPath we could loop it through instead of using parentNode property


    function getTargetNode(event) {
      return isFunction$3(event.composedPath) ? event.composedPath()[0] : event.target;
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

    function isSameInnerHTML$1(dom, innerHTML) {
      var tempdom = document.createElement('i');
      tempdom.innerHTML = innerHTML;
      return tempdom.innerHTML === dom.innerHTML;
    }

    function triggerEventListener(props, methodName, e) {
      if (props[methodName]) {
        var listener = props[methodName];

        if (listener.event) {
          listener.event(listener.data, e);
        } else {
          listener(e);
        }
      } else {
        var nativeListenerName = methodName.toLowerCase();

        if (props[nativeListenerName]) {
          props[nativeListenerName](e);
        }
      }
    }

    function createWrappedFunction(methodName, applyValue) {
      var fnMethod = function fnMethod(e) {
        var vNode = this.$V; // If vNode is gone by the time event fires, no-op

        if (!vNode) {
          return;
        }

        var props = vNode.props || EMPTY_OBJ;
        var dom = vNode.dom;

        if (isString$2(methodName)) {
          triggerEventListener(props, methodName, e);
        } else {
          for (var i = 0; i < methodName.length; ++i) {
            triggerEventListener(props, methodName[i], e);
          }
        }

        if (isFunction$3(applyValue)) {
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

      if (isFunction$3(handler)) {
        dom.addEventListener(eventName, handler);
        dom[previousKey] = [eventName, handler];
      }
    }

    function isCheckedType(type) {
      return type === 'checkbox' || type === 'radio';
    }

    var onTextInputChange = createWrappedFunction('onInput', applyValueInput);
    var wrappedOnChange$1 = createWrappedFunction(['onClick', 'onChange'], applyValueInput);
    /* tslint:disable-next-line:no-empty */

    function emptywrapper(event) {
      event.stopPropagation();
    }

    emptywrapper.wrapped = true;

    function inputEvents(dom, nextPropsOrEmpty) {
      if (isCheckedType(nextPropsOrEmpty.type)) {
        attachEvent(dom, 'change', wrappedOnChange$1);
        attachEvent(dom, 'click', emptywrapper);
      } else {
        attachEvent(dom, 'input', onTextInputChange);
      }
    }

    function applyValueInput(nextPropsOrEmpty, dom) {
      var type = nextPropsOrEmpty.type;
      var value = nextPropsOrEmpty.value;
      var checked = nextPropsOrEmpty.checked;
      var multiple = nextPropsOrEmpty.multiple;
      var defaultValue = nextPropsOrEmpty.defaultValue;
      var hasValue = !isNullOrUndef$3(value);

      if (type && type !== dom.type) {
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
        var children = vNode.children;
        var flags = vNode.flags;

        if (flags & 4
        /* ComponentClass */
        ) {
            updateChildOptions(children.$LI, value);
          } else if (flags & 8
        /* ComponentFunction */
        ) {
            updateChildOptions(children, value);
          } else if (vNode.childFlags === 2
        /* HasVNodeChildren */
        ) {
            updateChildOptions(children, value);
          } else if (vNode.childFlags & 12
        /* MultipleChildren */
        ) {
            for (var i = 0, len = children.length; i < len; ++i) {
              updateChildOptions(children[i], value);
            }
          }
      }
    }

    function updateChildOption(vNode, value) {
      var props = vNode.props || EMPTY_OBJ;
      var dom = vNode.dom; // we do this as multiple may have changed

      dom.value = props.value;

      if (props.value === value || isArray$1(value) && value.indexOf(props.value) !== -1) {
        dom.selected = true;
      } else if (!isNullOrUndef$3(value) || !isNullOrUndef$3(props.selected)) {
        dom.selected = props.selected || false;
      }
    }

    var onSelectChange = createWrappedFunction('onChange', applyValueSelect);

    function selectEvents(dom) {
      attachEvent(dom, 'change', onSelectChange);
    }

    function applyValueSelect(nextPropsOrEmpty, dom, mounting, vNode) {
      var multiplePropInBoolean = Boolean(nextPropsOrEmpty.multiple);

      if (!isNullOrUndef$3(nextPropsOrEmpty.multiple) && multiplePropInBoolean !== dom.multiple) {
        dom.multiple = multiplePropInBoolean;
      }

      var index = nextPropsOrEmpty.selectedIndex;

      if (index === -1) {
        dom.selectedIndex = -1;
      }

      var childFlags = vNode.childFlags;

      if (childFlags !== 1
      /* HasInvalidChildren */
      ) {
          var value = nextPropsOrEmpty.value;

          if (isNumber$1(index) && index > -1 && dom.options[index]) {
            value = dom.options[index].value;
          }

          if (mounting && isNullOrUndef$3(value)) {
            value = nextPropsOrEmpty.defaultValue;
          }

          updateChildOptions(vNode, value);
        }
    }

    var onTextareaInputChange = createWrappedFunction('onInput', applyValueTextArea);
    var wrappedOnChange = createWrappedFunction('onChange');

    function textAreaEvents(dom, nextPropsOrEmpty) {
      attachEvent(dom, 'input', onTextareaInputChange);

      if (nextPropsOrEmpty.onChange) {
        attachEvent(dom, 'change', wrappedOnChange);
      }
    }

    function applyValueTextArea(nextPropsOrEmpty, dom, mounting) {
      var value = nextPropsOrEmpty.value;
      var domValue = dom.value;

      if (isNullOrUndef$3(value)) {
        if (mounting) {
          var defaultValue = nextPropsOrEmpty.defaultValue;

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
      if (flags & 64
      /* InputElement */
      ) {
          applyValueInput(nextPropsOrEmpty, dom);
        } else if (flags & 256
      /* SelectElement */
      ) {
          applyValueSelect(nextPropsOrEmpty, dom, mounting, vNode);
        } else if (flags & 128
      /* TextareaElement */
      ) {
          applyValueTextArea(nextPropsOrEmpty, dom, mounting);
        }

      if (isControlled) {
        dom.$V = vNode;
      }
    }

    function addFormElementEventHandlers(flags, dom, nextPropsOrEmpty) {
      if (flags & 64
      /* InputElement */
      ) {
          inputEvents(dom, nextPropsOrEmpty);
        } else if (flags & 256
      /* SelectElement */
      ) {
          selectEvents(dom);
        } else if (flags & 128
      /* TextareaElement */
      ) {
          textAreaEvents(dom, nextPropsOrEmpty);
        }
    }

    function isControlledFormElement(nextPropsOrEmpty) {
      return nextPropsOrEmpty.type && isCheckedType(nextPropsOrEmpty.type) ? !isNullOrUndef$3(nextPropsOrEmpty.checked) : !isNullOrUndef$3(nextPropsOrEmpty.value);
    }

    function createRef() {
      return {
        current: null
      };
    }

    function forwardRef(render) {
      // @ts-ignore
      return {
        render: render
      };
    }

    function unmountRef(ref) {
      if (ref) {
        if (!safeCall1(ref, null) && ref.current) {
          ref.current = null;
        }
      }
    }

    function mountRef(ref, value, lifecycle) {
      if (ref && (isFunction$3(ref) || ref.current !== void 0)) {
        lifecycle.push(function () {
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
      var flags = vNode.flags;
      var children = vNode.children;
      var ref;

      if (flags & 481
      /* Element */
      ) {
          ref = vNode.ref;
          var props = vNode.props;
          unmountRef(ref);
          var childFlags = vNode.childFlags;

          if (!isNull$2(props)) {
            var keys = Object.keys(props);

            for (var i = 0, len = keys.length; i < len; i++) {
              var key = keys[i];

              if (syntheticEvents[key]) {
                unmountSyntheticEvent(key, vNode.dom);
              }
            }
          }

          if (childFlags & 12
          /* MultipleChildren */
          ) {
              unmountAllChildren(children, animations);
            } else if (childFlags === 2
          /* HasVNodeChildren */
          ) {
              unmount(children, animations);
            }
        } else if (children) {
        if (flags & 4
        /* ComponentClass */
        ) {
            if (isFunction$3(children.componentWillUnmount)) {
              // TODO: Possible entrypoint
              children.componentWillUnmount();
            } // If we have a componentWillDisappear on this component, block children


            var childAnimations = animations;

            if (isFunction$3(children.componentWillDisappear)) {
              childAnimations = new AnimationQueues();
              addDisappearAnimationHook(animations, children, children.$LI.dom, flags, undefined);
            }

            unmountRef(vNode.ref);
            children.$UN = true;
            unmount(children.$LI, childAnimations);
          } else if (flags & 8
        /* ComponentFunction */
        ) {
            // If we have a onComponentWillDisappear on this component, block children
            var childAnimations$1 = animations;
            ref = vNode.ref;

            if (!isNullOrUndef$3(ref)) {
              var domEl = findDOMfromVNode(vNode, true);

              if (isFunction$3(ref.onComponentWillUnmount)) {
                ref.onComponentWillUnmount(domEl, vNode.props || EMPTY_OBJ);
              }

              if (isFunction$3(ref.onComponentWillDisappear)) {
                childAnimations$1 = new AnimationQueues();
                addDisappearAnimationHook(animations, ref, domEl, flags, vNode.props);
              }
            }

            unmount(children, childAnimations$1);
          } else if (flags & 1024
        /* Portal */
        ) {
            remove(children, vNode.ref, animations);
          } else if (flags & 8192
        /* Fragment */
        ) {
            if (vNode.childFlags & 12
            /* MultipleChildren */
            ) {
                unmountAllChildren(children, animations);
              }
          }
      }
    }

    function unmountAllChildren(children, animations) {
      for (var i = 0, len = children.length; i < len; ++i) {
        unmount(children[i], animations);
      }
    }

    function createClearAllCallback(children, parentDOM) {
      return function () {
        // We need to remove children one by one because elements can be added during animation
        if (parentDOM) {
          for (var i = 0; i < children.length; i++) {
            var vNode = children[i];
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

      if (vNode.flags & 8192
      /* Fragment */
      ) {
          removeVNodeDOM(vNode, dom, animations);
        } else {
        clearDOM(dom, children, animations);
      }
    } // Only add animations to queue in browser


    function addDisappearAnimationHook(animations, instanceOrRef, dom, flags, props) {
      animations.componentWillDisappear.push(function (callback) {
        if (flags & 4
        /* ComponentClass */
        ) {
            instanceOrRef.componentWillDisappear(dom, callback);
          } else if (flags & 8
        /* ComponentFunction */
        ) {
            instanceOrRef.onComponentWillDisappear(dom, props, callback);
          }
      });
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
    } // We are assuming here that we come from patchProp routine
    // -nextAttrValue cannot be null or undefined


    function patchStyle(lastAttrValue, nextAttrValue, dom) {
      if (isNullOrUndef$3(nextAttrValue)) {
        dom.removeAttribute('style');
        return;
      }

      var domStyle = dom.style;
      var style;
      var value;

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

    function patchDangerInnerHTML(lastValue, nextValue, lastVNode, dom, animations) {
      var lastHtml = lastValue && lastValue.__html || '';
      var nextHtml = nextValue && nextValue.__html || '';

      if (lastHtml !== nextHtml) {
        if (!isNullOrUndef$3(nextHtml) && !isSameInnerHTML$1(dom, nextHtml)) {
          if (!isNull$2(lastVNode)) {
            if (lastVNode.childFlags & 12
            /* MultipleChildren */
            ) {
                unmountAllChildren(lastVNode.children, animations);
              } else if (lastVNode.childFlags === 2
            /* HasVNodeChildren */
            ) {
                unmount(lastVNode.children, animations);
              }

            lastVNode.children = null;
            lastVNode.childFlags = 1
            /* HasInvalidChildren */
            ;
          }

          dom.innerHTML = nextHtml;
        }
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

          var value = isNullOrUndef$3(nextValue) ? '' : nextValue;

          if (dom[prop] !== value) {
            dom[prop] = value;
          }

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
    }

    function mountProps(vNode, flags, props, dom, isSVG, animations) {
      var hasControlledValue = false;
      var isFormElement = (flags & 448
      /* FormElement */
      ) > 0;

      if (isFormElement) {
        hasControlledValue = isControlledFormElement(props);

        if (hasControlledValue) {
          addFormElementEventHandlers(flags, dom, props);
        }
      }

      for (var prop in props) {
        // do not add a hasOwnProperty check here, it affects performance
        patchProp(prop, null, props[prop], dom, isSVG, hasControlledValue, null, animations);
      }

      if (isFormElement) {
        processElement(flags, vNode, dom, props, true, hasControlledValue);
      }
    }

    function renderNewInput(instance, props, context) {
      var nextInput = normalizeRoot(instance.render(props, instance.state, context));
      var childContext = context;

      if (isFunction$3(instance.getChildContext)) {
        childContext = combineFrom$1(context, instance.getChildContext());
      }

      instance.$CX = childContext;
      return nextInput;
    }

    function createClassComponentInstance(vNode, Component, props, context, isSVG, lifecycle) {
      var instance = new Component(props, context);
      var usesNewAPI = instance.$N = Boolean(Component.getDerivedStateFromProps || instance.getSnapshotBeforeUpdate);
      instance.$SVG = isSVG;
      instance.$L = lifecycle;
      vNode.children = instance;
      instance.$BS = false;
      instance.context = context;

      if (instance.props === EMPTY_OBJ) {
        instance.props = props;
      }

      if (!usesNewAPI) {
        if (isFunction$3(instance.componentWillMount)) {
          instance.$BR = true;
          instance.componentWillMount();
          var pending = instance.$PS;

          if (!isNull$2(pending)) {
            var state = instance.state;

            if (isNull$2(state)) {
              instance.state = pending;
            } else {
              for (var key in pending) {
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
      var props = vNode.props || EMPTY_OBJ;
      return vNode.flags & 32768
      /* ForwardRef */
      ? vNode.type.render(props, vNode.ref, context) : vNode.type(props, context);
    }

    function mount(vNode, parentDOM, context, isSVG, nextNode, lifecycle, animations) {
      var flags = vNode.flags |= 16384
      /* InUse */
      ;

      if (flags & 481
      /* Element */
      ) {
          mountElement(vNode, parentDOM, context, isSVG, nextNode, lifecycle, animations);
        } else if (flags & 4
      /* ComponentClass */
      ) {
          mountClassComponent(vNode, parentDOM, context, isSVG, nextNode, lifecycle, animations);
        } else if (flags & 8
      /* ComponentFunction */
      ) {
          mountFunctionalComponent(vNode, parentDOM, context, isSVG, nextNode, lifecycle, animations);
        } else if (flags & 512
      /* Void */
      || flags & 16
      /* Text */
      ) {
          mountText(vNode, parentDOM, nextNode);
        } else if (flags & 8192
      /* Fragment */
      ) {
          mountFragment(vNode, context, parentDOM, isSVG, nextNode, lifecycle, animations);
        } else if (flags & 1024
      /* Portal */
      ) {
          mountPortal(vNode, context, parentDOM, nextNode, lifecycle, animations);
        } else ;
    }

    function mountPortal(vNode, context, parentDOM, nextNode, lifecycle, animations) {
      mount(vNode.children, vNode.ref, context, false, null, lifecycle, animations);
      var placeHolderVNode = createVoidVNode();
      mountText(placeHolderVNode, parentDOM, nextNode);
      vNode.dom = placeHolderVNode.dom;
    }

    function mountFragment(vNode, context, parentDOM, isSVG, nextNode, lifecycle, animations) {
      var children = vNode.children;
      var childFlags = vNode.childFlags; // When fragment is optimized for multiple children, check if there is no children and change flag to invalid
      // This is the only normalization always done, to keep optimization flags API same for fragments and regular elements

      if (childFlags & 12
      /* MultipleChildren */
      && children.length === 0) {
        childFlags = vNode.childFlags = 2
        /* HasVNodeChildren */
        ;
        children = vNode.children = createVoidVNode();
      }

      if (childFlags === 2
      /* HasVNodeChildren */
      ) {
          mount(children, parentDOM, nextNode, isSVG, nextNode, lifecycle, animations);
        } else {
        mountArrayChildren(children, parentDOM, context, isSVG, nextNode, lifecycle, animations);
      }
    }

    function mountText(vNode, parentDOM, nextNode) {
      var dom = vNode.dom = document.createTextNode(vNode.children);

      if (!isNull$2(parentDOM)) {
        insertOrAppend(parentDOM, dom, nextNode);
      }
    }

    function mountElement(vNode, parentDOM, context, isSVG, nextNode, lifecycle, animations) {
      var flags = vNode.flags;
      var props = vNode.props;
      var className = vNode.className;
      var childFlags = vNode.childFlags;
      var dom = vNode.dom = documentCreateElement(vNode.type, isSVG = isSVG || (flags & 32
      /* SvgElement */
      ) > 0);
      var children = vNode.children;

      if (!isNullOrUndef$3(className) && className !== '') {
        if (isSVG) {
          dom.setAttribute('class', className);
        } else {
          dom.className = className;
        }
      }

      if (childFlags === 16
      /* HasTextChildren */
      ) {
          setTextContent(dom, children);
        } else if (childFlags !== 1
      /* HasInvalidChildren */
      ) {
          var childrenIsSVG = isSVG && vNode.type !== 'foreignObject';

          if (childFlags === 2
          /* HasVNodeChildren */
          ) {
              if (children.flags & 16384
              /* InUse */
              ) {
                  vNode.children = children = directClone(children);
                }

              mount(children, dom, context, childrenIsSVG, null, lifecycle, animations);
            } else if (childFlags === 8
          /* HasKeyedChildren */
          || childFlags === 4
          /* HasNonKeyedChildren */
          ) {
              mountArrayChildren(children, dom, context, childrenIsSVG, null, lifecycle, animations);
            }
        }

      if (!isNull$2(parentDOM)) {
        insertOrAppend(parentDOM, dom, nextNode);
      }

      if (!isNull$2(props)) {
        mountProps(vNode, flags, props, dom, isSVG, animations);
      }

      mountRef(vNode.ref, dom, lifecycle);
    }

    function mountArrayChildren(children, dom, context, isSVG, nextNode, lifecycle, animations) {
      for (var i = 0; i < children.length; ++i) {
        var child = children[i];

        if (child.flags & 16384
        /* InUse */
        ) {
            children[i] = child = directClone(child);
          }

        mount(child, dom, context, isSVG, nextNode, lifecycle, animations);
      }
    }

    function mountClassComponent(vNode, parentDOM, context, isSVG, nextNode, lifecycle, animations) {
      var instance = createClassComponentInstance(vNode, vNode.type, vNode.props || EMPTY_OBJ, context, isSVG, lifecycle); // If we have a componentDidAppear on this component, we shouldn't allow children to animate so we're passing an dummy animations queue

      var childAnimations = animations;

      if (isFunction$3(instance.componentDidAppear)) {
        childAnimations = new AnimationQueues();
      }

      mount(instance.$LI, parentDOM, instance.$CX, isSVG, nextNode, lifecycle, childAnimations);
      mountClassComponentCallbacks(vNode.ref, instance, lifecycle, animations);
    }

    function mountFunctionalComponent(vNode, parentDOM, context, isSVG, nextNode, lifecycle, animations) {
      var ref = vNode.ref; // If we have a componentDidAppear on this component, we shouldn't allow children to animate so we're passing an dummy animations queue

      var childAnimations = animations;

      if (!isNullOrUndef$3(ref) && isFunction$3(ref.onComponentDidAppear)) {
        childAnimations = new AnimationQueues();
      }

      mount(vNode.children = normalizeRoot(renderFunctionalComponent(vNode, context)), parentDOM, context, isSVG, nextNode, lifecycle, childAnimations);
      mountFunctionalComponentCallbacks(vNode, lifecycle, animations);
    }

    function createClassMountCallback(instance) {
      return function () {
        instance.componentDidMount();
      };
    }

    function addAppearAnimationHook(animations, instanceOrRef, dom, flags, props) {
      animations.componentDidAppear.push(function () {
        if (flags & 4
        /* ComponentClass */
        ) {
            instanceOrRef.componentDidAppear(dom);
          } else if (flags & 8
        /* ComponentFunction */
        ) {
            instanceOrRef.onComponentDidAppear(dom, props);
          }
      });
    }

    function mountClassComponentCallbacks(ref, instance, lifecycle, animations) {
      mountRef(ref, instance, lifecycle);

      if (isFunction$3(instance.componentDidMount)) {
        lifecycle.push(createClassMountCallback(instance));
      }

      if (isFunction$3(instance.componentDidAppear)) {
        addAppearAnimationHook(animations, instance, instance.$LI.dom, 4
        /* ComponentClass */
        , undefined);
      }
    }

    function createOnMountCallback(ref, vNode) {
      return function () {
        ref.onComponentDidMount(findDOMfromVNode(vNode, true), vNode.props || EMPTY_OBJ);
      };
    }

    function mountFunctionalComponentCallbacks(vNode, lifecycle, animations) {
      var ref = vNode.ref;

      if (!isNullOrUndef$3(ref)) {
        safeCall1(ref.onComponentWillMount, vNode.props || EMPTY_OBJ);

        if (isFunction$3(ref.onComponentDidMount)) {
          lifecycle.push(createOnMountCallback(ref, vNode));
        }

        if (isFunction$3(ref.onComponentDidAppear)) {
          addAppearAnimationHook(animations, ref, findDOMfromVNode(vNode, true), 8
          /* ComponentFunction */
          , vNode.props);
        }
      }
    }

    function replaceWithNewNode(lastVNode, nextVNode, parentDOM, context, isSVG, lifecycle, animations) {
      unmount(lastVNode, animations);

      if ((nextVNode.flags & lastVNode.flags & 2033
      /* DOMRef */
      ) !== 0) {
        mount(nextVNode, null, context, isSVG, null, lifecycle, animations); // Single DOM operation, when we have dom references available

        replaceChild(parentDOM, nextVNode.dom, lastVNode.dom);
      } else {
        mount(nextVNode, parentDOM, context, isSVG, findDOMfromVNode(lastVNode, true), lifecycle, animations);
        removeVNodeDOM(lastVNode, parentDOM, animations);
      }
    }

    function patch(lastVNode, nextVNode, parentDOM, context, isSVG, nextNode, lifecycle, animations) {
      var nextFlags = nextVNode.flags |= 16384
      /* InUse */
      ;

      if (lastVNode.flags !== nextFlags || lastVNode.type !== nextVNode.type || lastVNode.key !== nextVNode.key || nextFlags & 2048
      /* ReCreate */
      ) {
          if (lastVNode.flags & 16384
          /* InUse */
          ) {
              replaceWithNewNode(lastVNode, nextVNode, parentDOM, context, isSVG, lifecycle, animations);
            } else {
            // Last vNode is not in use, it has crashed at application level. Just mount nextVNode and ignore last one
            // TODO: What does this mean? Should we not not call animations here?
            mount(nextVNode, parentDOM, context, isSVG, nextNode, lifecycle, animations);
          }
        } else if (nextFlags & 481
      /* Element */
      ) {
          patchElement(lastVNode, nextVNode, context, isSVG, nextFlags, lifecycle, animations);
        } else if (nextFlags & 4
      /* ComponentClass */
      ) {
          patchClassComponent(lastVNode, nextVNode, parentDOM, context, isSVG, nextNode, lifecycle, animations);
        } else if (nextFlags & 8
      /* ComponentFunction */
      ) {
          patchFunctionalComponent(lastVNode, nextVNode, parentDOM, context, isSVG, nextNode, lifecycle, animations);
        } else if (nextFlags & 16
      /* Text */
      ) {
          patchText(lastVNode, nextVNode);
        } else if (nextFlags & 512
      /* Void */
      ) {
          nextVNode.dom = lastVNode.dom;
        } else if (nextFlags & 8192
      /* Fragment */
      ) {
          patchFragment(lastVNode, nextVNode, parentDOM, context, isSVG, lifecycle, animations);
        } else {
        patchPortal(lastVNode, nextVNode, context, lifecycle, animations);
      } // Invoke move animations when all moves have been calculated


      if (animations.componentWillMove.length > 0) {
        callAllMoveAnimationHooks(animations.componentWillMove);
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
      var lastChildren = lastVNode.children;
      var nextChildren = nextVNode.children;
      var lastChildFlags = lastVNode.childFlags;
      var nextChildFlags = nextVNode.childFlags;
      var nextNode = null; // When fragment is optimized for multiple children, check if there is no children and change flag to invalid
      // This is the only normalization always done, to keep optimization flags API same for fragments and regular elements

      if (nextChildFlags & 12
      /* MultipleChildren */
      && nextChildren.length === 0) {
        nextChildFlags = nextVNode.childFlags = 2
        /* HasVNodeChildren */
        ;
        nextChildren = nextVNode.children = createVoidVNode();
      }

      var nextIsSingle = (nextChildFlags & 2
      /* HasVNodeChildren */
      ) !== 0;

      if (lastChildFlags & 12
      /* MultipleChildren */
      ) {
          var lastLen = lastChildren.length; // We need to know Fragment's edge node when

          if ( // It uses keyed algorithm
          lastChildFlags & 8
          /* HasKeyedChildren */
          && nextChildFlags & 8
          /* HasKeyedChildren */
          || // It transforms from many to single
          nextIsSingle || // It will append more nodes
          !nextIsSingle && nextChildren.length > lastLen) {
            // When fragment has multiple children there is always at least one vNode
            nextNode = findDOMfromVNode(lastChildren[lastLen - 1], false).nextSibling;
          }
        }

      patchChildren(lastChildFlags, nextChildFlags, lastChildren, nextChildren, parentDOM, context, isSVG, nextNode, lastVNode, lifecycle, animations);
    }

    function patchPortal(lastVNode, nextVNode, context, lifecycle, animations) {
      var lastContainer = lastVNode.ref;
      var nextContainer = nextVNode.ref;
      var nextChildren = nextVNode.children;
      patchChildren(lastVNode.childFlags, nextVNode.childFlags, lastVNode.children, nextChildren, lastContainer, context, false, null, lastVNode, lifecycle, animations);
      nextVNode.dom = lastVNode.dom;

      if (lastContainer !== nextContainer && !isInvalid$2(nextChildren)) {
        var node = nextChildren.dom;
        removeChild(lastContainer, node);
        appendChild(nextContainer, node);
      }
    }

    function patchElement(lastVNode, nextVNode, context, isSVG, nextFlags, lifecycle, animations) {
      var dom = nextVNode.dom = lastVNode.dom;
      var lastProps = lastVNode.props;
      var nextProps = nextVNode.props;
      var isFormElement = false;
      var hasControlledValue = false;
      var nextPropsOrEmpty;
      isSVG = isSVG || (nextFlags & 32
      /* SvgElement */
      ) > 0; // inlined patchProps  -- starts --

      if (lastProps !== nextProps) {
        var lastPropsOrEmpty = lastProps || EMPTY_OBJ;
        nextPropsOrEmpty = nextProps || EMPTY_OBJ;

        if (nextPropsOrEmpty !== EMPTY_OBJ) {
          isFormElement = (nextFlags & 448
          /* FormElement */
          ) > 0;

          if (isFormElement) {
            hasControlledValue = isControlledFormElement(nextPropsOrEmpty);
          }

          for (var prop in nextPropsOrEmpty) {
            var lastValue = lastPropsOrEmpty[prop];
            var nextValue = nextPropsOrEmpty[prop];

            if (lastValue !== nextValue) {
              patchProp(prop, lastValue, nextValue, dom, isSVG, hasControlledValue, lastVNode, animations);
            }
          }
        }

        if (lastPropsOrEmpty !== EMPTY_OBJ) {
          for (var prop$1 in lastPropsOrEmpty) {
            if (isNullOrUndef$3(nextPropsOrEmpty[prop$1]) && !isNullOrUndef$3(lastPropsOrEmpty[prop$1])) {
              patchProp(prop$1, lastPropsOrEmpty[prop$1], null, dom, isSVG, hasControlledValue, lastVNode, animations);
            }
          }
        }
      }

      var nextChildren = nextVNode.children;
      var nextClassName = nextVNode.className; // inlined patchProps  -- ends --

      if (lastVNode.className !== nextClassName) {
        if (isNullOrUndef$3(nextClassName)) {
          dom.removeAttribute('class');
        } else if (isSVG) {
          dom.setAttribute('class', nextClassName);
        } else {
          dom.className = nextClassName;
        }
      }

      if (nextFlags & 4096
      /* ContentEditable */
      ) {
          patchContentEditableChildren(dom, nextChildren);
        } else {
        patchChildren(lastVNode.childFlags, nextVNode.childFlags, lastVNode.children, nextChildren, dom, context, isSVG && nextVNode.type !== 'foreignObject', null, lastVNode, lifecycle, animations);
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

    function replaceOneVNodeWithMultipleVNodes(lastChildren, nextChildren, parentDOM, context, isSVG, lifecycle, animations) {
      unmount(lastChildren, animations);
      mountArrayChildren(nextChildren, parentDOM, context, isSVG, findDOMfromVNode(lastChildren, true), lifecycle, animations);
      removeVNodeDOM(lastChildren, parentDOM, animations);
    }

    function patchChildren(lastChildFlags, nextChildFlags, lastChildren, nextChildren, parentDOM, context, isSVG, nextNode, parentVNode, lifecycle, animations) {
      switch (lastChildFlags) {
        case 2
        /* HasVNodeChildren */
        :
          switch (nextChildFlags) {
            case 2
            /* HasVNodeChildren */
            :
              patch(lastChildren, nextChildren, parentDOM, context, isSVG, nextNode, lifecycle, animations);
              break;

            case 1
            /* HasInvalidChildren */
            :
              remove(lastChildren, parentDOM, animations);
              break;

            case 16
            /* HasTextChildren */
            :
              unmount(lastChildren, animations);
              setTextContent(parentDOM, nextChildren);
              break;

            default:
              replaceOneVNodeWithMultipleVNodes(lastChildren, nextChildren, parentDOM, context, isSVG, lifecycle, animations);
              break;
          }

          break;

        case 1
        /* HasInvalidChildren */
        :
          switch (nextChildFlags) {
            case 2
            /* HasVNodeChildren */
            :
              mount(nextChildren, parentDOM, context, isSVG, nextNode, lifecycle, animations);
              break;

            case 1
            /* HasInvalidChildren */
            :
              break;

            case 16
            /* HasTextChildren */
            :
              setTextContent(parentDOM, nextChildren);
              break;

            default:
              mountArrayChildren(nextChildren, parentDOM, context, isSVG, nextNode, lifecycle, animations);
              break;
          }

          break;

        case 16
        /* HasTextChildren */
        :
          switch (nextChildFlags) {
            case 16
            /* HasTextChildren */
            :
              patchSingleTextChild(lastChildren, nextChildren, parentDOM);
              break;

            case 2
            /* HasVNodeChildren */
            :
              clearDOM(parentDOM, lastChildren, animations);
              mount(nextChildren, parentDOM, context, isSVG, nextNode, lifecycle, animations);
              break;

            case 1
            /* HasInvalidChildren */
            :
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
            case 16
            /* HasTextChildren */
            :
              unmountAllChildren(lastChildren, animations);
              setTextContent(parentDOM, nextChildren);
              break;

            case 2
            /* HasVNodeChildren */
            :
              removeAllChildren(parentDOM, parentVNode, lastChildren, animations);
              mount(nextChildren, parentDOM, context, isSVG, nextNode, lifecycle, animations);
              break;

            case 1
            /* HasInvalidChildren */
            :
              removeAllChildren(parentDOM, parentVNode, lastChildren, animations);
              break;

            default:
              var lastLength = lastChildren.length | 0;
              var nextLength = nextChildren.length | 0; // Fast path's for both algorithms

              if (lastLength === 0) {
                if (nextLength > 0) {
                  mountArrayChildren(nextChildren, parentDOM, context, isSVG, nextNode, lifecycle, animations);
                }
              } else if (nextLength === 0) {
                removeAllChildren(parentDOM, parentVNode, lastChildren, animations);
              } else if (nextChildFlags === 8
              /* HasKeyedChildren */
              && lastChildFlags === 8
              /* HasKeyedChildren */
              ) {
                  patchKeyedChildren(lastChildren, nextChildren, parentDOM, context, isSVG, lastLength, nextLength, nextNode, parentVNode, lifecycle, animations);
                } else {
                patchNonKeyedChildren(lastChildren, nextChildren, parentDOM, context, isSVG, lastLength, nextLength, nextNode, lifecycle, animations);
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

    function updateClassComponent(instance, nextState, nextProps, parentDOM, context, isSVG, force, nextNode, lifecycle, animations) {
      var lastState = instance.state;
      var lastProps = instance.props;
      var usesNewAPI = Boolean(instance.$N);
      var hasSCU = isFunction$3(instance.shouldComponentUpdate);

      if (usesNewAPI) {
        nextState = createDerivedState(instance, nextProps, nextState !== lastState ? combineFrom$1(lastState, nextState) : nextState);
      }

      if (force || !hasSCU || hasSCU && instance.shouldComponentUpdate(nextProps, nextState, context)) {
        if (!usesNewAPI && isFunction$3(instance.componentWillUpdate)) {
          instance.componentWillUpdate(nextProps, nextState, context);
        }

        instance.props = nextProps;
        instance.state = nextState;
        instance.context = context;
        var snapshot = null;
        var nextInput = renderNewInput(instance, nextProps, context);

        if (usesNewAPI && isFunction$3(instance.getSnapshotBeforeUpdate)) {
          snapshot = instance.getSnapshotBeforeUpdate(lastProps, lastState);
        }

        patch(instance.$LI, nextInput, parentDOM, instance.$CX, isSVG, nextNode, lifecycle, animations); // Dont update Last input, until patch has been succesfully executed

        instance.$LI = nextInput;

        if (isFunction$3(instance.componentDidUpdate)) {
          createDidUpdate(instance, lastProps, lastState, snapshot, lifecycle);
        }
      } else {
        instance.props = nextProps;
        instance.state = nextState;
        instance.context = context;
      }
    }

    function patchClassComponent(lastVNode, nextVNode, parentDOM, context, isSVG, nextNode, lifecycle, animations) {
      var instance = nextVNode.children = lastVNode.children; // If Component has crashed, ignore it to stay functional

      if (isNull$2(instance)) {
        return;
      }

      instance.$L = lifecycle;
      var nextProps = nextVNode.props || EMPTY_OBJ;
      var nextRef = nextVNode.ref;
      var lastRef = lastVNode.ref;
      var nextState = instance.state;

      if (!instance.$N) {
        if (isFunction$3(instance.componentWillReceiveProps)) {
          instance.$BR = true;
          instance.componentWillReceiveProps(nextProps, context); // If instance component was removed during its own update do nothing.

          if (instance.$UN) {
            return;
          }

          instance.$BR = false;
        }

        if (!isNull$2(instance.$PS)) {
          nextState = combineFrom$1(nextState, instance.$PS);
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
      var shouldUpdate = true;
      var nextProps = nextVNode.props || EMPTY_OBJ;
      var nextRef = nextVNode.ref;
      var lastProps = lastVNode.props;
      var nextHooksDefined = !isNullOrUndef$3(nextRef);
      var lastInput = lastVNode.children;

      if (nextHooksDefined && isFunction$3(nextRef.onComponentShouldUpdate)) {
        shouldUpdate = nextRef.onComponentShouldUpdate(lastProps, nextProps);
      }

      if (shouldUpdate !== false) {
        if (nextHooksDefined && isFunction$3(nextRef.onComponentWillUpdate)) {
          nextRef.onComponentWillUpdate(lastProps, nextProps);
        }

        var nextInput = normalizeRoot(renderFunctionalComponent(nextVNode, context));
        patch(lastInput, nextInput, parentDOM, context, isSVG, nextNode, lifecycle, animations);
        nextVNode.children = nextInput;

        if (nextHooksDefined && isFunction$3(nextRef.onComponentDidUpdate)) {
          nextRef.onComponentDidUpdate(lastProps, nextProps);
        }
      } else {
        nextVNode.children = lastInput;
      }
    }

    function patchText(lastVNode, nextVNode) {
      var nextText = nextVNode.children;
      var dom = nextVNode.dom = lastVNode.dom;

      if (nextText !== lastVNode.children) {
        dom.nodeValue = nextText;
      }
    }

    function patchNonKeyedChildren(lastChildren, nextChildren, dom, context, isSVG, lastChildrenLength, nextChildrenLength, nextNode, lifecycle, animations) {
      var commonLength = lastChildrenLength > nextChildrenLength ? nextChildrenLength : lastChildrenLength;
      var i = 0;
      var nextChild;
      var lastChild;

      for (; i < commonLength; ++i) {
        nextChild = nextChildren[i];
        lastChild = lastChildren[i];

        if (nextChild.flags & 16384
        /* InUse */
        ) {
            nextChild = nextChildren[i] = directClone(nextChild);
          }

        patch(lastChild, nextChild, dom, context, isSVG, nextNode, lifecycle, animations);
        lastChildren[i] = nextChild;
      }

      if (lastChildrenLength < nextChildrenLength) {
        for (i = commonLength; i < nextChildrenLength; ++i) {
          nextChild = nextChildren[i];

          if (nextChild.flags & 16384
          /* InUse */
          ) {
              nextChild = nextChildren[i] = directClone(nextChild);
            }

          mount(nextChild, dom, context, isSVG, nextNode, lifecycle, animations);
        }
      } else if (lastChildrenLength > nextChildrenLength) {
        for (i = commonLength; i < lastChildrenLength; ++i) {
          remove(lastChildren[i], dom, animations);
        }
      }
    }

    function patchKeyedChildren(a, b, dom, context, isSVG, aLength, bLength, outerEdge, parentVNode, lifecycle, animations) {
      var aEnd = aLength - 1;
      var bEnd = bLength - 1;
      var j = 0;
      var aNode = a[j];
      var bNode = b[j];
      var nextPos;
      var nextNode; // Step 1
      // tslint:disable-next-line

      outer: {
        // Sync nodes with the same key at the beginning.
        while (aNode.key === bNode.key) {
          if (bNode.flags & 16384
          /* InUse */
          ) {
              b[j] = bNode = directClone(bNode);
            }

          patch(aNode, bNode, dom, context, isSVG, outerEdge, lifecycle, animations);
          a[j] = bNode;
          ++j;

          if (j > aEnd || j > bEnd) {
            break outer;
          }

          aNode = a[j];
          bNode = b[j];
        }

        aNode = a[aEnd];
        bNode = b[bEnd]; // Sync nodes with the same key at the end.

        while (aNode.key === bNode.key) {
          if (bNode.flags & 16384
          /* InUse */
          ) {
              b[bEnd] = bNode = directClone(bNode);
            }

          patch(aNode, bNode, dom, context, isSVG, outerEdge, lifecycle, animations);
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

            if (bNode.flags & 16384
            /* InUse */
            ) {
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
    }

    function patchKeyedChildrenComplex(a, b, context, aLength, bLength, aEnd, bEnd, j, dom, isSVG, outerEdge, parentVNode, lifecycle, animations) {
      var aNode;
      var bNode;
      var nextPos = 0;
      var i = 0;
      var aStart = j;
      var bStart = j;
      var aLeft = aEnd - j + 1;
      var bLeft = bEnd - j + 1;
      var sources = new Int32Array(bLeft + 1); // Keep track if its possible to remove whole DOM using textContent = '';

      var canRemoveWholeContent = aLeft === aLength;
      var moved = false;
      var pos = 0;
      var patched = 0; // When sizes are small, just loop them through

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

                if (bNode.flags & 16384
                /* InUse */
                ) {
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
        var keyIndex = {}; // Map keys by their index

        for (i = bStart; i <= bEnd; ++i) {
          keyIndex[b[i].key] = i;
        } // Try to patch same keys


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

              if (bNode.flags & 16384
              /* InUse */
              ) {
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
      } // fast-path: if nothing patched remove all old and add all new


      if (canRemoveWholeContent) {
        removeAllChildren(dom, parentVNode, a, animations);
        mountArrayChildren(b, dom, context, isSVG, outerEdge, lifecycle, animations);
      } else if (moved) {
        var seq = lis_algorithm(sources);
        j = seq.length - 1;

        for (i = bLeft - 1; i >= 0; i--) {
          if (sources[i] === 0) {
            pos = i + bStart;
            bNode = b[pos];

            if (bNode.flags & 16384
            /* InUse */
            ) {
                b[pos] = bNode = directClone(bNode);
              }

            nextPos = pos + 1;
            mount(bNode, dom, context, isSVG, nextPos < bLength ? findDOMfromVNode(b[nextPos], true) : outerEdge, lifecycle, animations);
          } else if (j < 0 || i !== seq[j]) {
            pos = i + bStart;
            bNode = b[pos];
            nextPos = pos + 1; // --- the DOM-node is moved by a call to insertAppend

            moveVNodeDOM(parentVNode, bNode, dom, nextPos < bLength ? findDOMfromVNode(b[nextPos], true) : outerEdge, animations);
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

            if (bNode.flags & 16384
            /* InUse */
            ) {
                b[pos] = bNode = directClone(bNode);
              }

            nextPos = pos + 1;
            mount(bNode, dom, context, isSVG, nextPos < bLength ? findDOMfromVNode(b[nextPos], true) : outerEdge, lifecycle, animations);
          }
        }
      }
    }

    var result;
    var p;
    var maxLen = 0; // https://en.wikipedia.org/wiki/Longest_increasing_subsequence

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
      var animations = new AnimationQueues();
      var rootInput = parentDOM.$V;
      renderCheck.v = true;

      if (isNullOrUndef$3(rootInput)) {
        if (!isNullOrUndef$3(input)) {
          if (input.flags & 16384
          /* InUse */
          ) {
              input = directClone(input);
            }

          mount(input, parentDOM, context, false, null, lifecycle, animations);
          parentDOM.$V = input;
          rootInput = input;
        }
      } else {
        if (isNullOrUndef$3(input)) {
          remove(rootInput, parentDOM, animations);
          parentDOM.$V = null;
        } else {
          if (input.flags & 16384
          /* InUse */
          ) {
              input = directClone(input);
            }

          patch(rootInput, input, parentDOM, context, false, null, lifecycle, animations);
          rootInput = parentDOM.$V = input;
        }
      }

      callAll(lifecycle);
      callAllAnimationHooks(animations.componentDidAppear);
      renderCheck.v = false;

      if (isFunction$3(callback)) {
        callback();
      }

      if (isFunction$3(options.renderComplete)) {
        options.renderComplete(rootInput, parentDOM);
      }
    }

    function render$1(input, parentDOM, callback, context) {
      if (callback === void 0) callback = null;
      if (context === void 0) context = EMPTY_OBJ;

      __render(input, parentDOM, callback, context);
    }

    function createRenderer(parentDOM) {
      return function renderer(lastInput, nextInput, callback, context) {
        if (!parentDOM) {
          parentDOM = lastInput;
        }

        render$1(nextInput, parentDOM, callback, context);
      };
    }

    var QUEUE = [];
    var nextTick = typeof Promise !== 'undefined' ? Promise.resolve().then.bind(Promise.resolve()) : function (a) {
      window.setTimeout(a, 0);
    };
    var microTaskPending = false;

    function queueStateChanges(component, newState, callback, force) {
      var pending = component.$PS;

      if (isFunction$3(newState)) {
        newState = newState(pending ? combineFrom$1(component.state, pending) : component.state, component.props, component.context);
      }

      if (isNullOrUndef$3(pending)) {
        component.$PS = newState;
      } else {
        for (var stateKey in newState) {
          pending[stateKey] = newState[stateKey];
        }
      }

      if (!component.$BR) {
        if (!renderCheck.v) {
          if (QUEUE.length === 0) {
            applyState(component, force);

            if (isFunction$3(callback)) {
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

        if (isFunction$3(callback)) {
          var QU = component.$QU;

          if (!QU) {
            QU = component.$QU = [];
          }

          QU.push(callback);
        }
      } else if (isFunction$3(callback)) {
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

      while (component = QUEUE.shift()) {
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
        var animations = new AnimationQueues();
        renderCheck.v = true;
        updateClassComponent(component, combineFrom$1(component.state, pendingState), component.props, findDOMfromVNode(component.$LI, true).parentNode, component.context, component.$SVG, force, null, lifecycle, animations);
        callAll(lifecycle);
        callAllAnimationHooks(animations.componentDidAppear);
        renderCheck.v = false;
      } else {
        component.state = component.$PS;
        component.$PS = null;
      }
    }

    var Component = function Component(props, context) {
      // Public
      this.state = null; // Internal properties

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

      this.$MV = false; // Coordinating a move animation (set on parent node)

      this.props = props || EMPTY_OBJ;
      this.context = context || EMPTY_OBJ; // context should not be mutable
    };

    Component.prototype.forceUpdate = function forceUpdate(callback) {
      if (this.$UN) {
        return;
      } // Do not allow double render during force update


      queueStateChanges(this, {}, callback, true);
    };

    Component.prototype.setState = function setState(newState, callback) {
      if (this.$UN) {
        return;
      }

      if (!this.$BS) {
        queueStateChanges(this, newState, callback, false);
      }
    };

    Component.prototype.render = function render(_nextProps, _nextState, _nextContext) {
      return null;
    };

    var ERROR_MSG$1 = 'a runtime error occured! Use Inferno in development environment to find the error.';

    function isNullOrUndef$2(o) {
      return o === void 0 || o === null;
    }

    function isInvalid$1(o) {
      return o === null || o === false || o === true || o === void 0;
    }

    function isFunction$2(o) {
      return typeof o === 'function';
    }

    function isNull$1(o) {
      return o === null;
    }

    function throwError$1(message) {
      if (!message) {
        message = ERROR_MSG$1;
      }

      throw new Error("Inferno Error: " + message);
    }

    function isSameInnerHTML(dom, innerHTML) {
      var tempdom = document.createElement('i');
      tempdom.innerHTML = innerHTML;
      return tempdom.innerHTML === dom.innerHTML;
    }

    function findLastDOMFromVNode(vNode) {
      var flags;
      var children;

      while (vNode) {
        flags = vNode.flags;

        if (flags & 2033
        /* DOMRef */
        ) {
            return vNode.dom;
          }

        children = vNode.children;

        if (flags & 8192
        /* Fragment */
        ) {
            vNode = vNode.childFlags === 2
            /* HasVNodeChildren */
            ? children : children[children.length - 1];
          } else if (flags & 4
        /* ComponentClass */
        ) {
            vNode = children.$LI;
          } else {
          vNode = children;
        }
      }

      return null;
    }

    function isSamePropsInnerHTML(dom, props) {
      return Boolean(props && props.dangerouslySetInnerHTML && props.dangerouslySetInnerHTML.__html && isSameInnerHTML(dom, props.dangerouslySetInnerHTML.__html));
    }

    function hydrateComponent(vNode, parentDOM, dom, context, isSVG, isClass, lifecycle, animations) {
      var type = vNode.type;
      var ref = vNode.ref;
      var props = vNode.props || EMPTY_OBJ;
      var currentNode;

      if (isClass) {
        var instance = createClassComponentInstance(vNode, type, props, context, isSVG, lifecycle);

        var input = instance.$LI;
        currentNode = hydrateVNode(input, parentDOM, dom, instance.$CX, isSVG, lifecycle, animations);

        mountClassComponentCallbacks(ref, instance, lifecycle, animations);
      } else {
        var input$1 = normalizeRoot(renderFunctionalComponent(vNode, context));

        currentNode = hydrateVNode(input$1, parentDOM, dom, context, isSVG, lifecycle, animations);
        vNode.children = input$1;

        mountFunctionalComponentCallbacks(vNode, lifecycle, animations);
      }

      return currentNode;
    }

    function hydrateChildren(parentVNode, parentNode, currentNode, context, isSVG, lifecycle, animations) {
      var childFlags = parentVNode.childFlags;
      var children = parentVNode.children;
      var props = parentVNode.props;
      var flags = parentVNode.flags;

      if (childFlags !== 1
      /* HasInvalidChildren */
      ) {
          if (childFlags === 2
          /* HasVNodeChildren */
          ) {
              if (isNull$1(currentNode)) {
                mount(children, parentNode, context, isSVG, null, lifecycle, animations);
              } else {
                currentNode = hydrateVNode(children, parentNode, currentNode, context, isSVG, lifecycle, animations);
                currentNode = currentNode ? currentNode.nextSibling : null;
              }
            } else if (childFlags === 16
          /* HasTextChildren */
          ) {
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
            } else if (childFlags & 12
          /* MultipleChildren */
          ) {
              var prevVNodeIsTextNode = false;

              for (var i = 0, len = children.length; i < len; ++i) {
                var child = children[i];

                if (isNull$1(currentNode) || prevVNodeIsTextNode && (child.flags & 16
                /* Text */
                ) > 0) {
                  mount(child, parentNode, context, isSVG, currentNode, lifecycle, animations);
                } else {
                  currentNode = hydrateVNode(child, parentNode, currentNode, context, isSVG, lifecycle, animations);
                  currentNode = currentNode ? currentNode.nextSibling : null;
                }

                prevVNodeIsTextNode = (child.flags & 16
                /* Text */
                ) > 0;
              }
            } // clear any other DOM nodes, there should be only a single entry for the root


          if ((flags & 8192
          /* Fragment */
          ) === 0) {
            var nextSibling = null;

            while (currentNode) {
              nextSibling = currentNode.nextSibling;
              parentNode.removeChild(currentNode);
              currentNode = nextSibling;
            }
          }
        } else if (!isNull$1(parentNode.firstChild) && !isSamePropsInnerHTML(parentNode, props)) {
        parentNode.textContent = ''; // dom has content, but VNode has no children remove everything from DOM

        if (flags & 448
        /* FormElement */
        ) {
            // If element is form element, we need to clear defaultValue also
            parentNode.defaultValue = '';
          }
      }
    }

    function hydrateElement(vNode, parentDOM, dom, context, isSVG, lifecycle, animations) {
      var props = vNode.props;
      var className = vNode.className;
      var flags = vNode.flags;
      var ref = vNode.ref;
      isSVG = isSVG || (flags & 32
      /* SvgElement */
      ) > 0;

      if (dom.nodeType !== 1 || dom.tagName.toLowerCase() !== vNode.type) {
        mountElement(vNode, null, context, isSVG, null, lifecycle, animations);

        parentDOM.replaceChild(vNode.dom, dom);
      } else {
        vNode.dom = dom;
        hydrateChildren(vNode, dom, dom.firstChild, context, isSVG, lifecycle, animations);

        if (!isNull$1(props)) {
          mountProps(vNode, flags, props, dom, isSVG, animations);
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
        var text = vNode.children;

        if (dom.nodeValue !== text) {
          dom.nodeValue = text;
        }

        vNode.dom = dom;
      }

      return vNode.dom;
    }

    function hydrateFragment(vNode, parentDOM, dom, context, isSVG, lifecycle, animations) {
      var children = vNode.children;

      if (vNode.childFlags === 2
      /* HasVNodeChildren */
      ) {
          hydrateText(children, parentDOM, dom);
          return children.dom;
        }

      hydrateChildren(vNode, parentDOM, dom, context, isSVG, lifecycle, animations);
      return findLastDOMFromVNode(children[children.length - 1]);
    }

    function hydrateVNode(vNode, parentDOM, currentDom, context, isSVG, lifecycle, animations) {
      var flags = vNode.flags |= 16384
      /* InUse */
      ;

      if (flags & 14
      /* Component */
      ) {
          return hydrateComponent(vNode, parentDOM, currentDom, context, isSVG, (flags & 4
          /* ComponentClass */
          ) > 0, lifecycle, animations);
        }

      if (flags & 481
      /* Element */
      ) {
          return hydrateElement(vNode, parentDOM, currentDom, context, isSVG, lifecycle, animations);
        }

      if (flags & 16
      /* Text */
      ) {
          return hydrateText(vNode, parentDOM, currentDom);
        }

      if (flags & 512
      /* Void */
      ) {
          return vNode.dom = currentDom;
        }

      if (flags & 8192
      /* Fragment */
      ) {
          return hydrateFragment(vNode, parentDOM, currentDom, context, isSVG, lifecycle, animations);
        }

      throwError$1();
      return null;
    }

    function hydrate(input, parentDOM, callback) {
      var dom = parentDOM.firstChild;

      if (isNull$1(dom)) {
        render$1(input, parentDOM, callback);
      } else {
        var lifecycle = [];
        var animations = new AnimationQueues();

        if (!isInvalid$1(input)) {
          dom = hydrateVNode(input, parentDOM, dom, {}, false, lifecycle, animations);
        } // clear any other DOM nodes, there should be only a single entry for the root


        while (dom && (dom = dom.nextSibling)) {
          parentDOM.removeChild(dom);
        }

        if (lifecycle.length > 0) {
          var listener;

          while ((listener = lifecycle.shift()) !== undefined) {
            listener();
          }
        }
      }

      parentDOM.$V = input;

      if (isFunction$2(callback)) {
        callback();
      }
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
    /*
     directClone is preferred over cloneVNode and used internally also.
     This function makes Inferno backwards compatible.
     And can be tree-shaked by modern bundlers

     Would be nice to combine this with directClone but could not do it without breaking change
    */

    /**
     * Clones given virtual node by creating new instance of it
     * @param {VNode} vNodeToClone virtual node to be cloned
     * @param {Props=} props additional props for new virtual node
     * @param {...*} _children new children for new virtual node
     * @returns {VNode} new virtual node
     */


    function cloneVNode(vNodeToClone, props, _children) {
      var arguments$1 = arguments;
      var flags = vNodeToClone.flags;
      var children = flags & 14
      /* Component */
      ? vNodeToClone.props && vNodeToClone.props.children : vNodeToClone.children;
      var childLen = arguments.length - 2;
      var className = vNodeToClone.className;
      var key = vNodeToClone.key;
      var ref = vNodeToClone.ref;

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
        children = _children;
      } else if (childLen > 1) {
        children = [];

        while (childLen-- > 0) {
          children[childLen] = arguments$1[childLen + 2];
        }
      }

      props.children = children;

      if (flags & 14
      /* Component */
      ) {
          return createComponentVNode(flags, vNodeToClone.type, !vNodeToClone.props && !props ? EMPTY_OBJ : combineFrom(vNodeToClone.props, props), key, ref);
        }

      if (flags & 16
      /* Text */
      ) {
          return createTextVNode(children);
        }

      if (flags & 8192
      /* Fragment */
      ) {
          return createFragment(childLen === 1 ? [children] : children, 0
          /* UnknownChildren */
          , key);
        }

      return normalizeProps(createVNode(flags, vNodeToClone.type, className, null, 1
      /* HasInvalidChildren */
      , combineFrom(vNodeToClone.props, props), key, ref));
    }

    var ERROR_MSG = 'a runtime error occured! Use Inferno in development environment to find the error.';

    function isFunction$1(o) {
      return typeof o === 'function';
    }

    function throwError(message) {
      if (!message) {
        message = ERROR_MSG;
      }

      throw new Error("Inferno Error: " + message);
    } // don't autobind these methods since they already have guaranteed context.


    var AUTOBIND_BLACKLIST = {
      componentDidMount: 1,
      componentDidUnmount: 1,
      componentDidUpdate: 1,
      componentWillMount: 1,
      componentWillUnmount: 1,
      componentWillUpdate: 1,
      constructor: 1,
      render: 1,
      shouldComponentUpdate: 1
    };

    function extend(base, props) {
      for (var key in props) {
        base[key] = props[key];
      }

      return base;
    }

    function bindAll(ctx) {
      for (var i in ctx) {
        var v = ctx[i];

        if (typeof v === 'function' && !v.__bound && !AUTOBIND_BLACKLIST[i]) {
          (ctx[i] = v.bind(ctx)).__bound = true;
        }
      }
    }

    function collateMixins(mixins, keyed) {
      if (keyed === void 0) keyed = {};

      for (var i = 0, len = mixins.length; i < len; ++i) {
        var mixin = mixins[i]; // Surprise: Mixins can have mixins

        if (mixin.mixins) {
          // Recursively collate sub-mixins
          collateMixins(mixin.mixins, keyed);
        }

        for (var key in mixin) {
          if (mixin.hasOwnProperty(key) && typeof mixin[key] === 'function') {
            (keyed[key] || (keyed[key] = [])).push(mixin[key]);
          }
        }
      }

      return keyed;
    }

    function multihook(hooks, mergeFn) {
      return function () {
        var arguments$1 = arguments;
        var ret;

        for (var i = 0, len = hooks.length; i < len; ++i) {
          var hook = hooks[i];
          var r = hook.apply(this, arguments$1);

          if (mergeFn) {
            ret = mergeFn(ret, r);
          } else if (r) {
            ret = r;
          }
        }

        return ret;
      };
    }

    function mergeNoDupes(previous, current) {
      if (current) {
        if (typeof current !== 'object') {
          throwError('Expected Mixin to return value to be an object or null.');
        }

        if (!previous) {
          previous = {};
        }

        for (var key in current) {
          if (current.hasOwnProperty(key)) {
            if (previous.hasOwnProperty(key)) {
              throwError("Mixins return duplicate key " + key + " in their return values");
            }

            previous[key] = current[key];
          }
        }
      }

      return previous;
    }

    function applyMixin(key, inst, mixin) {
      var hooks = inst[key] !== void 0 ? mixin.concat(inst[key]) : mixin;

      if (key === 'getDefaultProps' || key === 'getInitialState' || key === 'getChildContext') {
        inst[key] = multihook(hooks, mergeNoDupes);
      } else {
        inst[key] = multihook(hooks);
      }
    }

    function applyMixins(Cl, mixins) {
      for (var key in mixins) {
        if (mixins.hasOwnProperty(key)) {
          var mixin = mixins[key];
          var inst = void 0;

          if (key === 'getDefaultProps') {
            inst = Cl;
          } else {
            inst = Cl.prototype;
          }

          if (isFunction$1(mixin[0])) {
            applyMixin(key, inst, mixin);
          } else {
            inst[key] = mixin;
          }
        }
      }
    }

    function createClass(obj) {
      var Cl = /*@__PURE__*/function (Component) {
        function Cl(props, context) {
          Component.call(this, props, context);
          bindAll(this);

          if (this.getInitialState) {
            this.state = this.getInitialState();
          }
        }

        if (Component) Cl.__proto__ = Component;
        Cl.prototype = Object.create(Component && Component.prototype);
        Cl.prototype.constructor = Cl;

        Cl.prototype.replaceState = function replaceState(nextState, callback) {
          this.setState(nextState, callback);
        };

        Cl.prototype.isMounted = function isMounted() {
          return this.$LI !== null && !this.$UN;
        };

        return Cl;
      }(Component);

      Cl.displayName = obj.name || obj.displayName || 'Component';
      Cl.propTypes = obj.propTypes;
      Cl.mixins = obj.mixins && collateMixins(obj.mixins);
      Cl.getDefaultProps = obj.getDefaultProps;
      extend(Cl.prototype, obj);

      if (obj.statics) {
        extend(Cl, obj.statics);
      }

      if (obj.mixins) {
        applyMixins(Cl, collateMixins(obj.mixins));
      }

      if (Cl.getDefaultProps) {
        Cl.defaultProps = Cl.getDefaultProps();
      }

      return Cl;
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

    var componentHooks = {
      onComponentDidAppear: 1,
      onComponentDidMount: 1,
      onComponentDidUpdate: 1,
      onComponentShouldUpdate: 1,
      onComponentWillDisappear: 1,
      onComponentWillMount: 1,
      onComponentWillUnmount: 1,
      onComponentWillUpdate: 1
    };

    function createElement(type, props, _children) {
      var arguments$1 = arguments;
      var children;
      var ref = null;
      var key = null;
      var className = null;
      var flags = 0;
      var newProps;
      var childLen = arguments.length - 2;

      if (childLen === 1) {
        children = _children;
      } else if (childLen > 1) {
        children = [];

        while (childLen-- > 0) {
          children[childLen] = arguments$1[childLen + 2];
        }
      }

      if (isString$1(type)) {
        flags = getFlagsForElementVnode(type);

        if (!isNullOrUndef$1(props)) {
          newProps = {};

          for (var prop in props) {
            if (prop === 'className' || prop === 'class') {
              className = props[prop];
            } else if (prop === 'key') {
              key = props.key;
            } else if (prop === 'children' && isUndefined(children)) {
              children = props.children; // always favour children args over props
            } else if (prop === 'ref') {
              ref = props.ref;
            } else {
              if (prop === 'contenteditable') {
                flags |= 4096
                /* ContentEditable */
                ;
              }

              newProps[prop] = props[prop];
            }
          }
        }
      } else {
        flags = 2
        /* ComponentUnknown */
        ;

        if (!isUndefined(children)) {
          if (!props) {
            props = {};
          }

          props.children = children;
        }

        if (!isNullOrUndef$1(props)) {
          newProps = {};

          for (var prop$1 in props) {
            if (prop$1 === 'key') {
              key = props.key;
            } else if (prop$1 === 'ref') {
              ref = props.ref;
            } else if (componentHooks[prop$1] === 1) {
              if (!ref) {
                ref = {};
              }

              ref[prop$1] = props[prop$1];
            } else {
              newProps[prop$1] = props[prop$1];
            }
          }
        }

        return createComponentVNode(flags, type, newProps, key, ref);
      }

      if (flags & 8192
      /* Fragment */
      ) {
          return createFragment(childLen === 1 ? [children] : children, 0
          /* UnknownChildren */
          , key);
        }

      return createVNode(flags, type, className, children, 0
      /* UnknownChildren */
      , newProps, key, ref);
    }

    function findDOMNode(ref) {
      if (ref && ref.nodeType) {
        return ref;
      }

      if (!ref || ref.$UN) {
        return null;
      }

      if (ref.$LI) {
        return findDOMfromVNode(ref.$LI, true);
      }

      if (ref.flags) {
        return findDOMfromVNode(ref, true);
      }

      return null;
    }

    var isArray = Array.isArray;

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
      var isValidObject = typeof obj === 'object' && !isNull(obj);

      if (!isValidObject) {
        return false;
      }

      return (obj.flags & (14
      /* Component */
      | 481
      /* Element */
      )) > 0;
    }
    /**
     * @module Inferno-Compat
     */

    /**
     * Inlined PropTypes, there is propType checking ATM.
     */
    // tslint:disable-next-line:no-empty


    function proptype() {}

    proptype.isRequired = proptype;

    var getProptype = function getProptype() {
      return proptype;
    };

    var PropTypes = {
      any: getProptype,
      array: proptype,
      arrayOf: getProptype,
      bool: proptype,
      checkPropTypes: function checkPropTypes() {
        return null;
      },
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

    var ATTRS = ['accent-height', 'alignment-baseline', 'arabic-form', 'baseline-shift', 'cap-height', 'clip-path', 'clip-rule', 'color-interpolation', 'color-interpolation-filters', 'color-profile', 'color-rendering', 'dominant-baseline', 'enable-background', 'fill-opacity', 'fill-rule', 'flood-color', 'flood-opacity', 'font-family', 'font-size', 'font-size-adjust', 'font-stretch', 'font-style', 'font-constiant', 'font-weight', 'glyph-name', 'glyph-orientation-horizontal', 'glyph-orientation-vertical', 'horiz-adv-x', 'horiz-origin-x', 'image-rendering', 'letter-spacing', 'lighting-color', 'marker-end', 'marker-mid', 'marker-start', 'overline-position', 'overline-thickness', 'paint-order', 'panose-1', 'pointer-events', 'rendering-intent', 'shape-rendering', 'stop-color', 'stop-opacity', 'strikethrough-position', 'strikethrough-thickness', 'stroke-dasharray', 'stroke-dashoffset', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'stroke-opacity', 'stroke-width', 'text-anchor', 'text-decoration', 'text-rendering', 'underline-position', 'underline-thickness', 'unicode-bidi', 'unicode-range', 'units-per-em', 'v-alphabetic', 'v-hanging', 'v-ideographic', 'v-mathematical', 'vector-effect', 'vert-adv-y', 'vert-origin-x', 'vert-origin-y', 'word-spacing', 'writing-mode', 'x-height', 'xlink:actuate', 'xlink:arcrole', 'xlink:href', 'xlink:role', 'xlink:show', 'xlink:title', 'xlink:type', 'xml:base', 'xmlns:xlink', 'xml:lang', 'xml:space'];
    var InfernoCompatPropertyMap = {
      htmlFor: 'for',
      onDoubleClick: 'onDblClick'
    };
    var CAMELIZE = /[\-:]([a-z])/g;

    var capitalize = function capitalize(token) {
      return token[1].toUpperCase();
    };

    ATTRS.forEach(function (original) {
      var reactName = original.replace(CAMELIZE, capitalize);
      InfernoCompatPropertyMap[reactName] = original;
    });

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

    var uppercasePattern = /[A-Z]/g;

    function hyphenCase(str) {
      return str.replace(uppercasePattern, '-$&').toLowerCase();
    }

    options.reactStyles = true;

    function unmountComponentAtNode(container) {
      __render(null, container, null, null);

      return true;
    }

    function flatten(arr, result) {
      for (var i = 0, len = arr.length; i < len; ++i) {
        var value = arr[i];

        if (isArray(value)) {
          flatten(value, result);
        } else {
          result.push(value);
        }
      }

      return result;
    }

    var ARR = [];
    var Children = {
      map: function map(children, fn, ctx) {
        if (isNullOrUndef(children)) {
          return children;
        }

        children = Children.toArray(children);

        if (ctx) {
          fn = fn.bind(ctx);
        }

        return children.map(fn);
      },
      forEach: function forEach(children, fn, ctx) {
        if (isNullOrUndef(children)) {
          return;
        }

        children = Children.toArray(children);

        if (ctx) {
          fn = fn.bind(ctx);
        }

        for (var i = 0, len = children.length; i < len; ++i) {
          var child = isInvalid(children[i]) ? null : children[i];
          fn(child, i, children);
        }
      },
      count: function count(children) {
        children = Children.toArray(children);
        return children.length;
      },
      only: function only(children) {
        children = Children.toArray(children);

        if (children.length !== 1) {
          throw new Error('Children.only() expects only one child.');
        }

        return children[0];
      },
      toArray: function toArray(children) {
        if (isNullOrUndef(children)) {
          return [];
        } // We need to flatten arrays here,
        // because React does it also and application level code might depend on that behavior


        if (isArray(children)) {
          var result = [];
          flatten(children, result);
          return result;
        }

        return ARR.concat(children);
      }
    };
    Component.prototype.isReactComponent = {};
    var version = '15.4.2';
    var validLineInputs = {
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
      for (var prop in props) {
        var mappedProp = InfernoCompatPropertyMap[prop];

        if (mappedProp && props[prop] && mappedProp !== prop) {
          props[mappedProp] = props[prop];
          props[prop] = void 0;
        }

        if (options.reactStyles && prop === 'style') {
          var styles = props.style;

          if (styles && !isString(styles)) {
            var newStyles = {};

            for (var s in styles) {
              var value = styles[s];
              var hyphenStr = hyphenCase(s);
              newStyles[hyphenStr] = isNumber(value) ? getNumberStyleValue(hyphenStr, value) : value;
            }

            props.style = newStyles;
          }
        }
      }
    }

    function normalizeFormProps(name, props) {
      if ((name === 'input' || name === 'textarea') && props.type !== 'radio' && props.onChange) {
        var type = props.type && props.type.toLowerCase();
        var eventName;

        if (!type || validLineInputs[type]) {
          eventName = 'oninput';
        }

        if (eventName && !props[eventName]) {
          props[eventName] = props.onChange;
          props.onChange = void 0;
        }
      }
    } // we need to add persist() to Event (as React has it for synthetic events)
    // this is a hack and we really shouldn't be modifying a global object this way,
    // but there isn't a performant way of doing this apart from trying to proxy
    // every prop event that starts with "on", i.e. onClick or onKeyPress
    // but in reality devs use onSomething for many things, not only for
    // input events


    if (typeof Event !== 'undefined') {
      var eventProtoType = Event.prototype;

      if (!eventProtoType.persist) {
        // tslint:disable-next-line:no-empty
        eventProtoType.persist = function () {};
      }
    }

    function iterableToArray(iterable) {
      var iterStep;
      var tmpArr = [];

      do {
        iterStep = iterable.next();
        tmpArr.push(iterStep.value);
      } while (!iterStep.done);

      return tmpArr;
    }

    var g = typeof window === 'undefined' ? global : window;
    var hasSymbolSupport = typeof g.Symbol !== 'undefined';
    var symbolIterator = hasSymbolSupport ? g.Symbol.iterator : '';
    var oldCreateVNode = options.createVNode;

    options.createVNode = function (vNode) {
      var children = vNode.children;
      var props = vNode.props;

      if (isNullOrUndef(props)) {
        props = vNode.props = {};
      } // React supports iterable children, in addition to Array-like


      if (hasSymbolSupport && !isNull(children) && typeof children === 'object' && !isArray(children) && isFunction(children[symbolIterator])) {
        vNode.children = iterableToArray(children[symbolIterator]());
      }

      if (!isNullOrUndef(children) && isNullOrUndef(props.children)) {
        props.children = children;
      }

      if (vNode.flags & 14
      /* Component */
      ) {
          if (isString(vNode.type)) {
            vNode.flags = getFlagsForElementVnode(vNode.type);

            if (props) {
              normalizeProps(vNode);
            }
          }
        }

      var flags = vNode.flags;

      if (flags & 448
      /* FormElement */
      ) {
          normalizeFormProps(vNode.type, props);
        }

      if (flags & 481
      /* Element */
      ) {
          if (vNode.className) {
            props.className = vNode.className;
          }

          normalizeGenericProps(props);
        }

      if (oldCreateVNode) {
        oldCreateVNode(vNode);
      }
    }; // Credit: preact-compat - https://github.com/developit/preact-compat :)


    function shallowDiffers(a, b) {
      var i;

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

    var PureComponent = /*@__PURE__*/function (Component) {
      function PureComponent() {
        Component.apply(this, arguments);
      }

      if (Component) PureComponent.__proto__ = Component;
      PureComponent.prototype = Object.create(Component && Component.prototype);
      PureComponent.prototype.constructor = PureComponent;

      PureComponent.prototype.shouldComponentUpdate = function shouldComponentUpdate(props, state) {
        return shallowDiffers(this.props, props) || shallowDiffers(this.state, state);
      };

      return PureComponent;
    }(Component);

    var WrapperComponent = /*@__PURE__*/function (Component) {
      function WrapperComponent() {
        Component.apply(this, arguments);
      }

      if (Component) WrapperComponent.__proto__ = Component;
      WrapperComponent.prototype = Object.create(Component && Component.prototype);
      WrapperComponent.prototype.constructor = WrapperComponent;

      WrapperComponent.prototype.getChildContext = function getChildContext() {
        // tslint:disable-next-line
        return this.props.context;
      };

      WrapperComponent.prototype.render = function render(props) {
        return props.children;
      };

      return WrapperComponent;
    }(Component);

    function unstable_renderSubtreeIntoContainer(parentComponent, vNode, container, callback) {
      var wrapperVNode = createComponentVNode(4
      /* ComponentClass */
      , WrapperComponent, {
        children: vNode,
        context: parentComponent.context
      });
      render(wrapperVNode, container, null);
      var component = vNode.children;

      if (callback) {
        // callback gets the component as context, no other argument.
        callback.call(component);
      }

      return component;
    }

    function createFactory(type) {
      return createElement.bind(null, type);
    }

    function render(rootInput, container, cb, context) {
      if (cb === void 0) cb = null;
      if (context === void 0) context = EMPTY_OBJ;

      __render(rootInput, container, cb, context);

      var input = container.$V;

      if (input && input.flags & 14
      /* Component */
      ) {
          return input.children;
        }
    } // Mask React global in browser enviornments when React is not used.


    if (typeof window !== 'undefined' && typeof window.React === 'undefined') {
      var exports$1 = {
        Children: Children,
        Component: Component,
        EMPTY_OBJ: EMPTY_OBJ,
        Fragment: Fragment,
        PropTypes: PropTypes,
        PureComponent: PureComponent,
        // Internal methods
        _CI: createClassComponentInstance,
        _HI: normalizeRoot,
        _M: mount,
        _MCCC: mountClassComponentCallbacks,
        _ME: mountElement,
        _MFCC: mountFunctionalComponentCallbacks,
        _MP: mountProps,
        _MR: mountRef,
        __render: __render,
        // Public methods
        cloneElement: cloneVNode,
        cloneVNode: cloneVNode,
        createClass: createClass,
        createComponentVNode: createComponentVNode,
        createElement: createElement,
        createFactory: createFactory,
        createFragment: createFragment,
        createPortal: createPortal,
        createRef: createRef,
        createRenderer: createRenderer,
        createTextVNode: createTextVNode,
        createVNode: createVNode,
        directClone: directClone,
        findDOMNode: findDOMNode,
        findDOMfromVNode: findDOMfromVNode,
        forwardRef: forwardRef,
        getFlagsForElementVnode: getFlagsForElementVnode,
        hydrate: hydrate,
        isValidElement: isValidElement,
        linkEvent: linkEvent,
        normalizeProps: normalizeProps,
        options: options,
        render: render,
        rerender: rerender,
        unmountComponentAtNode: unmountComponentAtNode,
        unstable_renderSubtreeIntoContainer: unstable_renderSubtreeIntoContainer,
        version: version
      };
      window.React = exports$1;
      window.ReactDOM = exports$1;
    }

    /*
     * Inferno + inferno-compat without any Inferno specific optimizations
     * Optimization flags could be used, but the purpose is to track performance of slow code paths
     */

    uibench.init('Inferno compat (simple)', version);

    function TreeLeaf(_ref) {
      var children = _ref.children;
      return createVNode$1(1, "li", "TreeLeaf", createTextVNode(children), 0, null, null, null);
    }

    function shouldDataUpdate(lastProps, nextProps) {
      return lastProps !== nextProps;
    }

    function TreeNode(_ref2) {
      var data = _ref2.data;
      var length = data.children.length;
      var children = new Array(length);

      for (var i = 0; i < length; i++) {
        var n = data.children[i];
        var id = n.id;

        if (n.container) {
          children[i] = createComponentVNode$1(2, TreeNode, {
            "data": n
          }, id, {
            "onComponentShouldUpdate": shouldDataUpdate
          });
        } else {
          children[i] = createComponentVNode$1(2, TreeLeaf, {
            children: id
          }, id, {
            "onComponentShouldUpdate": shouldDataUpdate
          });
        }
      }

      return createVNode$1(1, "ul", "TreeNode", children, 0, null, null, null);
    }

    function tree(data) {
      return createVNode$1(1, "div", "Tree", createComponentVNode$1(2, TreeNode, {
        "data": data.root
      }, null, {
        "onComponentShouldUpdate": shouldDataUpdate
      }), 2, null, null, null);
    }

    function AnimBox(_ref3) {
      var data = _ref3.data;
      var time = data.time % 10;
      var style = 'border-radius:' + time + 'px;' + 'background:rgba(0,0,0,' + (0.5 + time / 10) + ')';
      return createVNode$1(1, "div", "AnimBox", null, 1, {
        "data-id": data.id,
        "style": style
      }, null, null);
    }

    function anim(data) {
      var items = data.items;
      var length = items.length;
      var children = new Array(length);

      for (var i = 0; i < length; i++) {
        var item = items[i]; // Here we are using onComponentShouldUpdate functional Component hook, to short circuit rendering process of AnimBox Component
        // When the data does not change

        children[i] = createComponentVNode$1(2, AnimBox, {
          "data": item
        }, item.id, {
          "onComponentShouldUpdate": shouldDataUpdate
        });
      }

      return createVNode$1(1, "div", "Anim", children, 0, null, null, null);
    }

    function onClick(text, e) {
      console.log('Clicked', text);
      e.stopPropagation();
    }

    function TableCell(_ref4) {
      var children = _ref4.children;
      return createVNode$1(1, "td", "TableCell", createTextVNode(children), 0, {
        "onClick": linkEvent(children, onClick)
      }, null, null);
    }

    function TableRow(_ref5) {
      var data = _ref5.data;
      var classes = 'TableRow';

      if (data.active) {
        classes = 'TableRow active';
      }

      var cells = data.props;
      var length = cells.length + 1;
      var children = new Array(length);
      children[0] = createComponentVNode$1(2, TableCell, {
        children: '#' + data.id
      }, null, {
        "onComponentShouldUpdate": shouldDataUpdate
      });

      for (var i = 1; i < length; i++) {
        children[i] = createComponentVNode$1(2, TableCell, {
          children: cells[i - 1]
        }, null, {
          "onComponentShouldUpdate": shouldDataUpdate
        });
      }

      return createVNode$1(1, "tr", classes, children, 0, {
        "data-id": data.id
      }, null, null);
    }

    function table(data) {
      var items = data.items;
      var length = items.length;
      var children = new Array(length);

      for (var i = 0; i < length; i++) {
        var item = items[i];
        children[i] = createComponentVNode$1(2, TableRow, {
          "data": item,
          children: item
        }, item.id, {
          "onComponentShouldUpdate": shouldDataUpdate
        });
      }

      return createVNode$1(1, "table", "Table", children, 0, null, null, null);
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

      return createVNode$1(1, "div", "Main", section, 0, null, null, null);
    }

    document.addEventListener('DOMContentLoaded', function (e) {
      var container = document.querySelector('#App');
      uibench.run(function (state) {
        render(main(state), container);
      }, function (samples) {
        render(createVNode$1(1, "pre", null, JSON.stringify(samples, null, ' '), 0, null, null, null), container);
      });
    });

}());
