/*!
 * inferno-devtools v1.0.0-beta37
 * (c) 2016 Dominic Gannaway
 * Released under the MIT License.
 */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('./inferno'), require('./inferno-component')) :
    typeof define === 'function' && define.amd ? define(['inferno', 'inferno-component'], factory) :
    (factory(global.Inferno,global.Inferno.Component));
}(this, (function (inferno,Component) { 'use strict';

Component = 'default' in Component ? Component['default'] : Component;

var ERROR_MSG = 'a runtime error occured! Use Inferno in development environment to find the error.';


// this is MUCH faster than .constructor === Array and instanceof Array
// in Node 7 and the later versions of V8, slower in older versions though

function isStatefulComponent(o) {
    return !isUndefined(o.prototype) && !isUndefined(o.prototype.render);
}









function isUndefined(obj) {
    return obj === undefined;
}

/**
 * Map of functional component name -> wrapper class.
 */
var functionalComponentWrappers = new Map();
/**
 * Wrap a functional component with a stateful component.
 *
 * Inferno does not record any information about the original hierarchy of
 * functional components in the rendered DOM nodes. Wrapping functional components
 * with a trivial wrapper allows us to recover information about the original
 * component structure from the DOM.
 *
 */
function wrapFunctionalComponent(vNode) {
    var originalRender = vNode.type;
    var name = vNode.type.name || '(Function.name missing)';
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
        wrapper['displayName'] = name;
        wrappers.set(originalRender, wrapper);
    }
    vNode.type = wrappers.get(originalRender);
}

/**
 * Map of Component|Node to ReactDOMComponent|ReactCompositeComponent-like
 * object.
 *
 * The same React*Component instance must be used when notifying devtools
 * about the initial mount of a component and subsequent updates.
 */
var instanceMap = new Map();
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
    // The devtools has different paths for interacting with the renderers from
    // React Native, legacy React DOM and current React DOM.
    //
    // Here we emulate the interface for the current React DOM (v15+) lib.
    // ReactDOMComponentTree-like object
    var ComponentTree = {
        getNodeFromInstance: function getNodeFromInstance(instance) {
            return instance.node;
        },
        getClosestInstanceFromNode: function getClosestInstanceFromNode(node) {
            while (node && !node._component) {
                node = node.parentNode;
            }
            return node ? updateReactComponent(node._component) : null;
        }
    };
    // Map of root ID (the ID is unimportant) to component instance.
    var roots = inferno.options.roots;
    // ReactMount-like object
    //
    // Used by devtools to discover the list of root component instances and get
    // notified when new root components are rendered.
    var Mount = {
        _instancesByReactRootID: [],
        // Stub - React DevTools expects to find this method and replace it
        // with a wrapper in order to observe new root components being added
        _renderNewRootComponent: function _renderNewRootComponent(instance) { }
    };
    // ReactReconciler-like object
    var Reconciler = {
        // Stubs - React DevTools expects to find these methods and replace them
        // with wrappers in order to observe components being mounted, updated and
        // unmounted
        mountComponent: function mountComponent(instance) { },
        performUpdateIfNecessary: function performUpdateIfNecessary() { },
        receiveComponent: function receiveComponent(instance) { },
        unmountComponent: function unmountComponent(instance) { }
    };
    /** Notify devtools that a new component instance has been mounted into the DOM. */
    var componentAdded = function (component) {
        var instance = updateReactComponent(component);
        if (isRootComponent(roots, component)) {
            instance._rootID = nextRootKey(roots);
            roots[instance._rootID] = instance;
            Mount._renderNewRootComponent(instance);
        }
        visitNonCompositeChildren(instance, function (childInst) {
            childInst._inDevTools = true;
            Reconciler.mountComponent(childInst);
        });
        Reconciler.mountComponent(instance);
    };
    /** Notify devtools that a component has been updated with new props/state. */
    var componentUpdated = function (component) {
        var prevRenderedChildren = [];
        visitNonCompositeChildren(instanceMap.get(component), function (childInst) {
            prevRenderedChildren.push(childInst);
        });
        // Notify devtools about updates to this component and any non-composite
        // children
        var instance = updateReactComponent(component);
        Reconciler.receiveComponent(instance);
        visitNonCompositeChildren(instance, function (childInst) {
            if (!childInst._inDevTools) {
                // New DOM child component
                childInst._inDevTools = true;
                Reconciler.mountComponent(childInst);
            }
            else {
                // Updated DOM child component
                Reconciler.receiveComponent(childInst);
            }
        });
        // For any non-composite children that were removed by the latest render,
        // remove the corresponding ReactDOMComponent-like instances and notify
        // the devtools
        prevRenderedChildren.forEach(function (childInst) {
            if (!document.body.contains(childInst.node)) {
                instanceMap.delete(childInst.node);
                Reconciler.unmountComponent(childInst);
            }
        });
    };
    /** Notify devtools that a component has been unmounted from the DOM. */
    var componentRemoved = function (component) {
        var instance = updateReactComponent(component);
        visitNonCompositeChildren(function (childInst) {
            instanceMap.delete(childInst.node);
            Reconciler.unmountComponent(childInst);
        });
        Reconciler.unmountComponent(instance);
        instanceMap.delete(component);
        if (instance._rootID) {
            delete roots[instance._rootID];
        }
    };
    return {
        componentAdded: componentAdded,
        componentUpdated: componentUpdated,
        componentRemoved: componentRemoved,
        // Interfaces passed to devtools via __REACT_DEVTOOLS_GLOBAL_HOOK__.inject()
        ComponentTree: ComponentTree,
        Mount: Mount,
        Reconciler: Reconciler
    };
}
function isRootComponent(roots, component) {
    var dom = component._vNode.dom.parentNode;
    for (var i = 0; i < roots.length; i++) {
        var root = roots[i];
        if (root.dom === dom) {
            return root;
        }
    }
}
/**
 * Update (and create if necessary) the ReactDOMComponent|ReactCompositeComponent-like
 * instance for a given preact component instance or DOM Node.
 */
function updateReactComponent(componentOrNode) {
    var newInstance = componentOrNode instanceof Node ?
        createReactDOMComponent(componentOrNode) :
        createReactCompositeComponent(componentOrNode);
    if (instanceMap.has(componentOrNode)) {
        var inst = instanceMap.get(componentOrNode);
        Object.assign(inst, newInstance);
        return inst;
    }
    instanceMap.set(componentOrNode, newInstance);
    return newInstance;
}
/**
 * Create a ReactDOMComponent-compatible object for a given DOM node rendered
 * by preact.
 *
 * This implements the subset of the ReactDOMComponent interface that
 * React DevTools requires in order to display DOM nodes in the inspector with
 * the correct type and properties.
 */
function createReactDOMComponent(node) {
    var childNodes = node.nodeType === Node.ELEMENT_NODE ?
        Array.from(node.childNodes) : [];
    var isText = node.nodeType === Node.TEXT_NODE;
    return {
        // --- ReactDOMComponent interface
        _currentElement: isText ? node.textContent : {
            type: node.nodeName.toLowerCase(),
            props: node.props
        },
        _renderedChildren: childNodes.map(function (child) {
            // TODO
            // if (child._component) {
            // 	return updateReactComponent(child._component);
            // }
            return updateReactComponent(child);
        }),
        _stringText: isText ? node.textContent : null,
        // --- Additional properties used by preact devtools
        // A flag indicating whether the devtools have been notified about the
        // existence of this component instance yet.
        // This is used to send the appropriate notifications when DOM components
        // are added or updated between composite component updates.
        _inDevTools: false,
        node: node
    };
}
/**
 * Return a ReactCompositeComponent-compatible object for a given preact
 * component instance.
 *
 * This implements the subset of the ReactCompositeComponent interface that
 * the DevTools requires in order to walk the component tree and inspect the
 * component's properties.
 *
 * See https://github.com/facebook/react-devtools/blob/e31ec5825342eda570acfc9bcb43a44258fceb28/backend/getData.js
 */
function createReactCompositeComponent(component) {
    var _currentElement = createReactElement(component);
    var node = component._vNode.dom;
    var instance = {
        // --- ReactDOMComponent properties
        getName: function getName() {
            return typeName(_currentElement);
        },
        _currentElement: createReactElement(component),
        props: component.props,
        state: component.state,
        forceUpdate: component.forceUpdate.bind(component),
        setState: component.setState.bind(component),
        // --- Additional properties used by preact devtools
        node: node,
        _instance: null,
        _renderedComponent: null
    };
    // React DevTools exposes the `_instance` field of the selected item in the
    // component tree as `$r` in the console.  `_instance` must refer to a
    // React Component (or compatible) class instance with `props` and `state`
    // fields and `setState()`, `forceUpdate()` methods.
    instance._instance = component;
    // If the root node returned by this component instance's render function
    // was itself a composite component, there will be a `_component` property
    // containing the child component instance.
    if (component._component) {
        instance._renderedComponent = updateReactComponent(component._component);
    }
    else {
        // Otherwise, if the render() function returned an HTML/SVG element,
        // create a ReactDOMComponent-like object for the DOM node itself.
        instance._renderedComponent = updateReactComponent(node);
    }
    return instance;
}
function nextRootKey(roots) {
    return '.' + Object.keys(roots).length;
}
/**
 * Visit all child instances of a ReactCompositeComponent-like object that are
 * not composite components (ie. they represent DOM elements or text)
 *
 * @param {Component} component
 * @param {(Component) => void} visitor
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
            visitor(child);
            if (!child._component) {
                visitNonCompositeChildren(child, visitor);
            }
        });
    }
}
/**
 * Return a ReactElement-compatible object for the current state of a preact
 * component.
 */
function createReactElement(component) {
    return {
        type: component.constructor,
        key: component.key,
        ref: null,
        props: component.props
    };
}
/**
 * Return the name of a component created by a `ReactElement`-like object.
 *
 * @param {ReactElement} element
 */
function typeName(element) {
    if (typeof element.type === 'function') {
        return element.type.displayName || element.type.name;
    }
    return element.type;
}

// Credit: this a port of the great work done on Preact's dev tools proxy with React
// https://github.com/developit/preact/blob/master/devtools/devtools.js
/**
 * Create a bridge between the Inferno component tree and React's dev tools
 * and register it.
 *
 * After this function is called, the React Dev Tools should be able to detect
 * "React" on the page and show the component tree.
 *
 * This function hooks into Inferno VNode creation in order to expose functional
 * components correctly, so it should be called before the root component(s)
 * are rendered.
 *
 * Returns a cleanup function which unregisters the hooks.
 */
function initDevTools() {
    if (typeof window['__REACT_DEVTOOLS_GLOBAL_HOOK__'] === 'undefined') {
        // React DevTools are not installed
        return;
    }
    // Hook into Inferno element creation in order to wrap functional components
    // with stateful ones in order to make them visible in the devtools
    var createVNode = inferno.options.createVNode;
    inferno.options.createVNode = function (vNode) {
        if (!isStatefulComponent(vNode)) {
            wrapFunctionalComponent(vNode);
        }
        if (createVNode) {
            return createVNode(vNode);
        }
    };
    // Notify devtools when preact components are mounted, updated or unmounted
    var bridge = createDevToolsBridge();
    var nextAfterMount = inferno.options.afterMount;
    inferno.options.afterMount = function (component) {
        bridge.componentAdded(component);
        if (nextAfterMount) {
            nextAfterMount(component);
        }
    };
    var nextAfterUpdate = inferno.options.afterUpdate;
    inferno.options.afterUpdate = function (component) {
        bridge.componentUpdated(component);
        if (nextAfterUpdate) {
            nextAfterUpdate(component);
        }
    };
    var nextBeforeUnmount = inferno.options.beforeUnmount;
    inferno.options.beforeUnmount = function (component) {
        bridge.componentRemoved(component);
        if (nextBeforeUnmount) {
            nextBeforeUnmount(component);
        }
    };
    // Notify devtools about this instance of "React"
    window['__REACT_DEVTOOLS_GLOBAL_HOOK__'].inject(bridge);
    return function () {
        inferno.options.afterMount = nextAfterMount;
        inferno.options.afterUpdate = nextAfterUpdate;
        inferno.options.beforeUnmount = nextBeforeUnmount;
    };
}

initDevTools();

})));
