/**
 * @module Inferno-Mobx
 */ /** TypeDoc Comment */

import { Atom, extras, Reaction } from "mobx";
import { Component, findDOMNode, options, createVNode } from "inferno";
import { EventEmitter } from "./utils/EventEmitter";
import { warning } from "inferno-shared";
import { isStateless } from "./utils/utils";
import VNodeFlags from "inferno-vnode-flags";
import hoistStatics from "hoist-non-inferno-statics";

/**
 * dev tool support
 */
let isDevtoolsEnabled = false;

let isUsingStaticRendering = false;

let warnedAboutObserverInjectDeprecation = false;

export const componentByNodeRegistery = new WeakMap();
export const renderReporter = new EventEmitter();

function findNode(component) {
  if (options.findDOMNodeEnabled) {
    return findDOMNode(component);
  }
  return null;
}

function reportRendering(component) {
  const node = findNode(component);
  if (node) {
    componentByNodeRegistery.set(node, component);
  }

  renderReporter.emit({
    component,
    event: "render",
    node,
    renderTime: component.__$mobRenderEnd - component.__$mobRenderStart,
    totalTime: Date.now() - component.__$mobRenderStart
  });
}

export function trackComponents() {
  if (!isDevtoolsEnabled) {
    isDevtoolsEnabled = true;
    options.findDOMNodeEnabled = true;
    warning("Do not turn trackComponents on in production, its expensive");
  }
}

export function useStaticRendering(useStatic: boolean) {
  isUsingStaticRendering = useStatic;
}

/**
 * Errors reporter
 */

export const errorsReporter = new EventEmitter();

/**
 * Utilities
 */

function patch(target, funcName, runMixinFirst = false) {
  const base = target[funcName];
  const mixinFunc = reactiveMixin[funcName];

  // MWE: ideally we freeze here to protect against accidental overwrites in component instances, see #195
  // ...but that breaks react-hot-loader, see #231...
  target[funcName] = base
    ? runMixinFirst === true
      ? function() {
          mixinFunc.apply(this, arguments);
          base.apply(this, arguments);
        }
      : function() {
          base.apply(this, arguments);
          mixinFunc.apply(this, arguments);
        }
    : mixinFunc;
}

function isObjectShallowModified(prev, next) {
  if (
    null == prev ||
    null == next ||
    typeof prev !== "object" ||
    typeof next !== "object"
  ) {
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
    if (isUsingStaticRendering === true) {
      return;
    }

    // Generate friendly name for debugging
    const initialName =
      this.displayName ||
      this.name ||
      (this.constructor &&
        (this.constructor.displayName || this.constructor.name)) ||
      "<component>";
    const rootNodeID =
      this._reactInternalInstance && this._reactInternalInstance._rootNodeID;

    /**
     * If props are shallowly modified, react will render anyway,
     * so atom.reportChanged() should not result in yet another re-render
     */
    let skipRender = false;
    /**
     * forceUpdate will re-assign this.props. We don't want that to cause a loop,
     * so detect these changes
     */
    let isForcingUpdate = false;

    function makePropertyObservableReference(propName) {
      let valueHolder = this[propName];
      const atom = new Atom("reactive " + propName);
      Object.defineProperty(this, propName, {
        configurable: true,
        enumerable: true,
        get() {
          atom.reportObserved();
          return valueHolder;
        },
        set(v) {
          if (!isForcingUpdate && isObjectShallowModified(valueHolder, v)) {
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
    makePropertyObservableReference.call(this, "props");
    // make state an observable reference
    makePropertyObservableReference.call(this, "state");

    // wire up reactive render
    const me = this;
    const render = this.render.bind(this);
    const baseRender = () => render(me.props, me.state, me.context);
    let reaction: Reaction | null = null;
    let isRenderingPending = false;

    const initialRender = () => {
      reaction = new Reaction(`${initialName}#${rootNodeID}.render()`, () => {
        if (!isRenderingPending) {
          // N.B. Getting here *before mounting* means that a component constructor has side effects (see the relevant test in misc.js)
          // This unidiomatic React usage but React will correctly warn about this so we continue as usual
          // See #85 / Pull #44
          isRenderingPending = true;
          if (typeof this.componentWillReact === "function") {
            this.componentWillReact(); // TODO: wrap in action?
          }
          if (this.__$mobxIsUnmounted !== true) {
            // If we are unmounted at this point, componentWillReact() had a side effect causing the component to unmounted
            // TODO: remove this check? Then react will properly warn about the fact that this should not happen? See #73
            // However, people also claim this migth happen during unit tests..
            let hasError = true;
            try {
              isForcingUpdate = true;
              if (!skipRender) {
                this.$UPD = true;
                this.forceUpdate();
                this.$UPD = false;
                // Component.prototype.forceUpdate.call(this)
              }
              hasError = false;
            } finally {
              isForcingUpdate = false;
              // if (hasError) {
              //   (reaction as Reaction).dispose();
              // }
            }
          }
        }
      });
      (reaction as any).reactComponent = this;
      (reactiveRender as any).$mobx = reaction;
      this.render = reactiveRender;
      return reactiveRender();
    };

    const reactiveRender = () => {
      isRenderingPending = false;
      let exception;
      let rendering = null;

      (reaction as any).track(() => {
        if (isDevtoolsEnabled) {
          this.__$mobRenderStart = Date.now();
        }
        try {
          rendering = extras.allowStateChanges(false, baseRender);
        } catch (e) {
          exception = e;
        }
        if (isDevtoolsEnabled) {
          this.__$mobRenderEnd = Date.now();
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
    if (isUsingStaticRendering === true) {
      return;
    }

    if (this.render.$mobx) {
      this.render.$mobx.dispose();
    }

    this.__$mobxIsUnmounted = true;
    if (isDevtoolsEnabled) {
      const node = findDOMNode(this);
      if (node) {
        componentByNodeRegistery.delete(node);
      }
      renderReporter.emit({
        component: this,
        event: "destroy",
        node
      });
    }
  },

  componentDidMount() {
    if (isDevtoolsEnabled) {
      reportRendering(this);
    }
  },

  componentDidUpdate() {
    if (isDevtoolsEnabled) {
      reportRendering(this);
    }
  },

  shouldComponentUpdate(nextProps, nextState) {
    if (isUsingStaticRendering) {
      warning(
        "[mobx-react] It seems that a re-rendering of a React component is triggered while in static (server-side) mode. Please make sure components are rendered only once server-side."
      );
    }
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

/**
 * Observer function / decorator
 */
export function observer(arg1, arg2?) {
  if (typeof arg1 === "string") {
    throw new Error("Store names should be provided as array");
  }
  if (Array.isArray(arg1)) {
    // component needs stores
    if (!warnedAboutObserverInjectDeprecation) {
      warnedAboutObserverInjectDeprecation = true;
      warning(
        'Mobx observer: Using observer to inject stores is deprecated since 4.0. Use `@inject("store1", "store2") @observer ComponentClass` or `inject("store1", "store2")(observer(componentClass))` instead of `@observer(["store1", "store2"]) ComponentClass`'
      );
    }
    if (!arg2) {
      // invoked as decorator
      return componentClass => observer(arg1, componentClass);
    } else {
      return (inject as any).apply(null, arg1)(observer(arg2));
    }
  }
  const component = arg1;

  if (component.isMobxInjector === true) {
    warning(
      "Mobx observer: You are trying to use 'observer' on a component that already has 'inject'. Please apply 'observer' before applying 'inject'"
    );
  }

  // Stateless function component:
  // If it is function but doesn't seem to be a react class constructor,
  // wrap it to a react class automatically
  if (
    typeof component === "function" &&
    (!component.prototype || !component.prototype.render)
  ) {
    return observer(
      class<P, S> extends Component<P, S> {
        public static displayName = component.displayName || component.name;
        public static defaultProps = component.defaultProps;
        public render(props, state, context) {
          return component(props, context);
        }
      }
    );
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
  patch(target, "componentWillMount", true);
  [
    "componentDidMount",
    "componentWillUnmount",
    "componentDidUpdate"
  ].forEach(function(funcName) {
    patch(target, funcName);
  });
  if (!target.shouldComponentUpdate) {
    target.shouldComponentUpdate = reactiveMixin.shouldComponentUpdate;
  }
}

// TODO: support injection somehow as well?
export const Observer = observer(({ children }) => children());

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
function createStoreInjector(grabStoresFn: Function, component, injectNames?) {
  let displayName =
    "inject-" +
    (component.displayName ||
      component.name ||
      (component.constructor && component.constructor.name) ||
      "Unknown");
  if (injectNames) {
    displayName += "-with-" + injectNames;
  }

  class Injector<P, S> extends Component<P, S> {
    constructor(props, context) {
      super(props, context);

      this.storeRef = this.storeRef.bind(this);
    }

    public static displayName = displayName;
    public static wrappedComponent;
    public static isMobxInjector: boolean = false;

    public wrappedInstance: Component<P, S> | Function | null;

    public storeRef(instance) {
      this.wrappedInstance = instance;
    }

    public render(props, state, context) {
      // Optimization: it might be more efficient to apply the mapper function *outside* the render method
      // (if the mapper is a function), that could avoid expensive(?) re-rendering of the injector component
      // See this test: 'using a custom injector is not too reactive' in inject.js
      const newProps = {};
      let key;

      for (key in props) {
        newProps[key] = props[key];
      }

      const additionalProps =
        grabStoresFn(context.mobxStores || {}, newProps, context) || {};
      for (key in additionalProps) {
        newProps[key] = additionalProps[key];
      }

      return createVNode(
        VNodeFlags.ComponentUnknown,
        component,
        null,
        null,
        newProps,
        null,
        isStateless(component) ? null : this.storeRef
      );
    }
  }

  // Static fields from component should be visible on the generated Injector
  hoistStatics(Injector, component);

  Injector.wrappedComponent = component;
  Object.defineProperties(Injector, proxiedInjectorProps);

  return Injector;
}

function grabStoresByName(storeNames: string[]) {
  return function(baseStores, nextProps) {
    for (let i = 0, len = storeNames.length; i < len; i++) {
      const storeName = storeNames[i];

      if (!(storeName in nextProps)) {
        // Development warning
        if (process.env.NODE_ENV !== "production") {
          if (!(storeName in baseStores)) {
            throw new Error(
              "MobX injector: Store '" +
                storeName +
                "' is not available! Make sure it is provided by some Provider"
            );
          }
        }

        nextProps[storeName] = baseStores[storeName];
      }
    }
    return nextProps;
  };
}

/**
 * higher order component that injects stores to a child.
 * takes either a varargs list of strings, which are stores read from the context,
 * or a function that manually maps the available stores from the context to props:
 * storesToProps(mobxStores, props, context) => newProps
 */
// TODO: Type
export function inject(/* fn(stores, nextProps) or ...storeNames */): any {
  let grabStoresFn;
  if (typeof arguments[0] === "function") {
    grabStoresFn = arguments[0];

    return function(componentClass) {
      let injected = createStoreInjector(grabStoresFn, componentClass);
      injected.isMobxInjector = false; // supress warning
      // mark the Injector as observer, to make it react to expressions in `grabStoresFn`,
      // see #111
      injected = observer(injected);
      injected.isMobxInjector = true; // restore warning
      return injected;
    };
  } else {
    const storeNames: any = [];
    for (let i = 0; i < arguments.length; i++) {
      storeNames.push(arguments[i]);
    }

    grabStoresFn = grabStoresByName(storeNames);
    return function(componentClass) {
      return createStoreInjector(
        grabStoresFn,
        componentClass,
        storeNames.join("-")
      );
    };
  }
}
