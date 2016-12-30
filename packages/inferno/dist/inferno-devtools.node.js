/*!
 * inferno-devtools v1.0.3
 * (c) 2016 Dominic Gannaway
 * Released under the MIT License.
 */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('./inferno'), require('./inferno-component')) :
    typeof define === 'function' && define.amd ? define(['inferno', 'inferno-component'], factory) :
    (factory(global.Inferno,global.Inferno.Component));
}(this, (function (inferno,Component) { 'use strict';

Component = 'default' in Component ? Component['default'] : Component;

// this is MUCH faster than .constructor === Array and instanceof Array
// in Node 7 and the later versions of V8, slower in older versions though
var isArray = Array.isArray;
function isStatefulComponent(o) {
    return !isUndefined(o.prototype) && !isUndefined(o.prototype.render);
}
function isStringOrNumber(obj) {
    return isString(obj) || isNumber(obj);
}

function isInvalid(obj) {
    return isNull(obj) || obj === false || isTrue(obj) || isUndefined(obj);
}


function isString(obj) {
    return typeof obj === 'string';
}
function isNumber(obj) {
    return typeof obj === 'number';
}
function isNull(obj) {
    return obj === null;
}
function isTrue(obj) {
    return obj === true;
}
function isUndefined(obj) {
    return obj === undefined;
}
function isObject(o) {
    return typeof o === 'object';
}

function findVNodeFromDom(vNode, dom) {
    if (!vNode) {
        var roots = inferno.options.roots;
        for (var i = 0; i < roots.length; i++) {
            var root = roots[i];
            var result = findVNodeFromDom(root.input, dom);
            if (result) {
                return result;
            }
        }
    }
    else {
        if (vNode.dom === dom) {
            return vNode;
        }
        var flags = vNode.flags;
        var children = vNode.children;
        if (flags & 28 /* Component */) {
            children = children._lastInput || children;
        }
        if (children) {
            if (isArray(children)) {
                for (var i$1 = 0; i$1 < children.length; i$1++) {
                    var child = children[i$1];
                    if (child) {
                        var result$1 = findVNodeFromDom(child, dom);
                        if (result$1) {
                            return result$1;
                        }
                    }
                }
            }
            else if (isObject(children)) {
                var result$2 = findVNodeFromDom(children, dom);
                if (result$2) {
                    return result$2;
                }
            }
        }
    }
}
var instanceMap = new Map();
function getKeyForVNode(vNode) {
    var flags = vNode.flags;
    if (flags & 4 /* ComponentClass */) {
        return vNode.children;
    }
    else {
        return vNode.dom;
    }
}
function getInstanceFromVNode(vNode) {
    var key = getKeyForVNode(vNode);
    return instanceMap.get(key);
}
function createInstanceFromVNode(vNode, instance) {
    var key = getKeyForVNode(vNode);
    instanceMap.set(key, instance);
}
function deleteInstanceForVNode(vNode) {
    var key = getKeyForVNode(vNode);
    instanceMap.delete(key);
}
/**
 * Create a bridge for exposing Inferno's component tree to React DevTools.
 *
 * It creates implementations of the interfaces that ReactDOM passes to
 * devtools to enable it to query the component tree and hook into component
 * updates.
 *
 * See https://github.com/facebook/react/blob/59ff7749eda0cd858d5ee568315bcba1be75a1ca/src/renderers/dom/ReactDOM.js
 * for how ReactDOM exports its internals for use by the devtools and
 * the `attachRenderer()` function in
 * https://github.com/facebook/react-devtools/blob/e31ec5825342eda570acfc9bcb43a44258fceb28/backend/attachRenderer.js
 * for how the devtools consumes the resulting objects.
 */
function createDevToolsBridge() {
    var ComponentTree = {
        getNodeFromInstance: function getNodeFromInstance(instance) {
            return instance.node;
        },
        getClosestInstanceFromNode: function getClosestInstanceFromNode(dom) {
            var vNode = findVNodeFromDom(null, dom);
            return vNode ? updateReactComponent(vNode, null) : null;
        }
    };
    // Map of root ID (the ID is unimportant) to component instance.
    var roots = {};
    findRoots(roots);
    var Mount = {
        _instancesByReactRootID: roots,
        _renderNewRootComponent: function _renderNewRootComponent(instance) { }
    };
    var Reconciler = {
        mountComponent: function mountComponent(instance) { },
        performUpdateIfNecessary: function performUpdateIfNecessary(instance) { },
        receiveComponent: function receiveComponent(instance) { },
        unmountComponent: function unmountComponent(instance) { }
    };
    var queuedMountComponents = new Map();
    var queuedReceiveComponents = new Map();
    var queuedUnmountComponents = new Map();
    var queueUpdate = function (updater, map, component) {
        if (!map.has(component)) {
            map.set(component, true);
            requestAnimationFrame(function () {
                updater(component);
                map.delete(component);
            });
        }
    };
    var queueMountComponent = function (component) { return queueUpdate(Reconciler.mountComponent, queuedMountComponents, component); };
    var queueReceiveComponent = function (component) { return queueUpdate(Reconciler.receiveComponent, queuedReceiveComponents, component); };
    var queueUnmountComponent = function (component) { return queueUpdate(Reconciler.unmountComponent, queuedUnmountComponents, component); };
    /** Notify devtools that a new component instance has been mounted into the DOM. */
    var componentAdded = function (vNode) {
        var instance = updateReactComponent(vNode, null);
        if (isRootVNode(vNode)) {
            instance._rootID = nextRootKey(roots);
            roots[instance._rootID] = instance;
            Mount._renderNewRootComponent(instance);
        }
        visitNonCompositeChildren(instance, function (childInst) {
            if (childInst) {
                childInst._inDevTools = true;
                queueMountComponent(childInst);
            }
        });
        queueMountComponent(instance);
    };
    /** Notify devtools that a component has been updated with new props/state. */
    var componentUpdated = function (vNode) {
        var prevRenderedChildren = [];
        visitNonCompositeChildren(getInstanceFromVNode(vNode), function (childInst) {
            prevRenderedChildren.push(childInst);
        });
        // Notify devtools about updates to this component and any non-composite
        // children
        var instance = updateReactComponent(vNode, null);
        queueReceiveComponent(instance);
        visitNonCompositeChildren(instance, function (childInst) {
            if (!childInst._inDevTools) {
                // New DOM child component
                childInst._inDevTools = true;
                queueMountComponent(childInst);
            }
            else {
                // Updated DOM child component
                queueReceiveComponent(childInst);
            }
        });
        // For any non-composite children that were removed by the latest render,
        // remove the corresponding ReactDOMComponent-like instances and notify
        // the devtools
        prevRenderedChildren.forEach(function (childInst) {
            if (!document.body.contains(childInst.node)) {
                deleteInstanceForVNode(childInst.vNode);
                queueUnmountComponent(childInst);
            }
        });
    };
    /** Notify devtools that a component has been unmounted from the DOM. */
    var componentRemoved = function (vNode) {
        var instance = updateReactComponent(vNode, null);
        visitNonCompositeChildren(function (childInst) {
            deleteInstanceForVNode(childInst.vNode);
            queueUnmountComponent(childInst);
        });
        queueUnmountComponent(instance);
        deleteInstanceForVNode(vNode);
        if (instance._rootID) {
            delete roots[instance._rootID];
        }
    };
    return {
        componentAdded: componentAdded,
        componentUpdated: componentUpdated,
        componentRemoved: componentRemoved,
        ComponentTree: ComponentTree,
        Mount: Mount,
        Reconciler: Reconciler
    };
}
function isRootVNode(vNode) {
    for (var i = 0; i < inferno.options.roots.length; i++) {
        var root = inferno.options.roots[i];
        if (root.input === vNode) {
            return true;
        }
    }
}
/**
 * Update (and create if necessary) the ReactDOMComponent|ReactCompositeComponent-like
 * instance for a given Inferno component instance or DOM Node.
 */
function updateReactComponent(vNode, parentDom) {
    if (!vNode) {
        return null;
    }
    var flags = vNode.flags;
    var newInstance;
    if (flags & 28 /* Component */) {
        newInstance = createReactCompositeComponent(vNode, parentDom);
    }
    else {
        newInstance = createReactDOMComponent(vNode, parentDom);
    }
    var oldInstance = getInstanceFromVNode(vNode);
    if (oldInstance) {
        Object.assign(oldInstance, newInstance);
        return oldInstance;
    }
    createInstanceFromVNode(vNode, newInstance);
    return newInstance;
}
function normalizeChildren(children, dom) {
    if (isArray(children)) {
        return children.filter(function (child) { return !isInvalid(child); }).map(function (child) { return updateReactComponent(child, dom); });
    }
    else {
        return !isInvalid(children) ? [updateReactComponent(children, dom)] : [];
    }
}
/**
 * Create a ReactDOMComponent-compatible object for a given DOM node rendered
 * by Inferno.
 *
 * This implements the subset of the ReactDOMComponent interface that
 * React DevTools requires in order to display DOM nodes in the inspector with
 * the correct type and properties.
 */
function createReactDOMComponent(vNode, parentDom) {
    var flags = vNode.flags;
    if (flags & 4096 /* Void */) {
        return null;
    }
    var type = vNode.type;
    var children = vNode.children;
    var props = vNode.props;
    var dom = vNode.dom;
    var isText = (flags & 1 /* Text */) || isStringOrNumber(vNode);
    return {
        _currentElement: isText ? (children || vNode) : {
            type: type,
            props: props
        },
        _renderedChildren: !isText && normalizeChildren(children, dom),
        _stringText: isText ? (children || vNode) : null,
        _inDevTools: false,
        node: dom || parentDom,
        vNode: vNode
    };
}
function normalizeKey(key) {
    if (key && key[0] === '.') {
        return null;
    }
}
/**
 * Return a ReactCompositeComponent-compatible object for a given Inferno
 * component instance.
 *
 * This implements the subset of the ReactCompositeComponent interface that
 * the DevTools requires in order to walk the component tree and inspect the
 * component's properties.
 *
 * See https://github.com/facebook/react-devtools/blob/e31ec5825342eda570acfc9bcb43a44258fceb28/backend/getData.js
 */
function createReactCompositeComponent(vNode, parentDom) {
    var type = vNode.type;
    var instance = vNode.children;
    var lastInput = instance._lastInput || instance;
    var dom = vNode.dom;
    return {
        getName: function getName() {
            return typeName(type);
        },
        _currentElement: {
            type: type,
            key: normalizeKey(vNode.key),
            ref: null,
            props: vNode.props
        },
        props: instance.props,
        state: instance.state,
        forceUpdate: instance.forceUpdate.bind(instance),
        setState: instance.setState.bind(instance),
        node: dom,
        _instance: instance,
        _renderedComponent: updateReactComponent(lastInput, dom),
        vNode: vNode
    };
}
function nextRootKey(roots) {
    return '.' + Object.keys(roots).length;
}
/**
 * Visit all child instances of a ReactCompositeComponent-like object that are
 * not composite components (ie. they represent DOM elements or text)
 */
function visitNonCompositeChildren(component, visitor) {
    if (component._renderedComponent) {
        if (!component._renderedComponent._component) {
            visitor(component._renderedComponent);
            visitNonCompositeChildren(component._renderedComponent, visitor);
        }
    }
    else if (component._renderedChildren) {
        component._renderedChildren.forEach(function (child) {
            if (child) {
                visitor(child);
                if (!child._component) {
                    visitNonCompositeChildren(child, visitor);
                }
            }
        });
    }
}
/**
 * Return the name of a component created by a `ReactElement`-like object.
 */
function typeName(type) {
    if (typeof type === 'function') {
        return type.displayName || type.name;
    }
    return type;
}
/**
 * Find all root component instances rendered by Inferno in `node`'s children
 * and add them to the `roots` map.
 */
function findRoots(roots) {
    inferno.options.roots.forEach(function (root) {
        roots[nextRootKey(roots)] = updateReactComponent(root.input, null);
    });
}

var functionalComponentWrappers = new Map();
function wrapFunctionalComponent(vNode) {
    var originalRender = vNode.type;
    var name = vNode.type.name || 'Function (anonymous)';
    var wrappers = functionalComponentWrappers;
    if (!wrappers.has(originalRender)) {
        var wrapper = (function (Component$$1) {
            function wrapper () {
                Component$$1.apply(this, arguments);
            }

            if ( Component$$1 ) wrapper.__proto__ = Component$$1;
            wrapper.prototype = Object.create( Component$$1 && Component$$1.prototype );
            wrapper.prototype.constructor = wrapper;

            wrapper.prototype.render = function render (props, state, context) {
                return originalRender(props, context);
            };

            return wrapper;
        }(Component));
        // Expose the original component name. React Dev Tools will use
        // this property if it exists or fall back to Function.name
        // otherwise.
        /* tslint:disable */
        wrapper['displayName'] = name;
        /* tslint:enable */
        wrappers.set(originalRender, wrapper);
    }
    vNode.type = wrappers.get(originalRender);
    vNode.type.defaultProps = originalRender.defaultProps;
    vNode.ref = null;
    vNode.flags = 4 /* ComponentClass */;
}
// Credit: this based on on the great work done with Preact and its devtools
// https://github.com/developit/preact/blob/master/devtools/devtools.js
function initDevTools() {
    /* tslint:disable */
    if (typeof window['__REACT_DEVTOOLS_GLOBAL_HOOK__'] === 'undefined') {
        /* tslint:enable */
        // React DevTools are not installed
        return;
    }
    var nextVNode = inferno.options.createVNode;
    inferno.options.createVNode = function (vNode) {
        var flags = vNode.flags;
        if ((flags & 28 /* Component */) && !isStatefulComponent(vNode.type)) {
            wrapFunctionalComponent(vNode);
        }
        if (nextVNode) {
            return nextVNode(vNode);
        }
    };
    // Notify devtools when preact components are mounted, updated or unmounted
    var bridge = createDevToolsBridge();
    var nextAfterMount = inferno.options.afterMount;
    inferno.options.afterMount = function (vNode) {
        bridge.componentAdded(vNode);
        if (nextAfterMount) {
            nextAfterMount(vNode);
        }
    };
    var nextAfterUpdate = inferno.options.afterUpdate;
    inferno.options.afterUpdate = function (vNode) {
        bridge.componentUpdated(vNode);
        if (nextAfterUpdate) {
            nextAfterUpdate(vNode);
        }
    };
    var nextBeforeUnmount = inferno.options.beforeUnmount;
    inferno.options.beforeUnmount = function (vNode) {
        bridge.componentRemoved(vNode);
        if (nextBeforeUnmount) {
            nextBeforeUnmount(vNode);
        }
    };
    // Notify devtools about this instance of "React"
    /* tslint:disable */
    window['__REACT_DEVTOOLS_GLOBAL_HOOK__'].inject(bridge);
    /* tslint:enable */
    return function () {
        inferno.options.afterMount = nextAfterMount;
        inferno.options.afterUpdate = nextAfterUpdate;
        inferno.options.beforeUnmount = nextBeforeUnmount;
    };
}

initDevTools();

})));
