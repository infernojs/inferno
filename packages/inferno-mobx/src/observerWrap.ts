import { InfernoNode, render, VNode, createComponentVNode, _HI as normalizeRoot } from 'inferno';
import { Reaction } from 'mobx';
import { throwError, warning } from 'inferno-shared';
import { VNodeFlags } from 'inferno-vnode-flags';

type Render = (properties?: any, context?: Record<string, unknown>) => InfernoNode | undefined | void;

function callDispose(props) {
  const dispose = props.$mobxDispose;
  if (dispose) {
    dispose();
  }
}

function innerVNode(type: Render, properties: Record<string, unknown>, dispose: () => void) {
  const props = Object.defineProperty({}, '$mobxDispose', {
    value: dispose
  });
  for (const key in properties) {
    if (process.env.NODE_ENV !== 'production' && key === '$mobxDispose') {
      throwError("Properties with the key '$mobxDispose' was passed to a component observerWrap was applied to.");
    }
    props[key] = properties[key];
  }
  const ref = {
    onComponentDidUpdate: callDispose,
    onComponentWillUnmount: dispose
  };
  if (process.env.NODE_ENV !== 'production') {
    Object.preventExtensions(props);
    Object.freeze(ref);
  }
  return createComponentVNode(VNodeFlags.ComponentFunction, type, props, undefined, ref);
}

function makeProxy(target: VNode) {
  return {
    get $V() {
      return target.children
    },
    set $V(value) {
      target.children = value
    }
  };
}

export function observerWrap<T extends Render>(base: T): typeof base {
  if (process.env.NODE_ENV !== 'production') {
    if (typeof base !== 'function') {
      throwError(`observerWrap requires a function to wrap, got ${typeof base} instead`);
    }
    // @ts-ignore
    if (base.prototype && base.prototype.render) {
      throwError("observerWrap should not be applied to constructors.");
    }
    // @ts-ignore
    if (base.isMobXInfernoObserver) {
      warning("'observerWrap' was used on a component that already has 'observerWrap' applied. Please only apply once");
    }
  }
  function wrapper(this: VNode, ...rest): ReturnType<typeof base> {
    const props = rest[0];
    let onComponentDidUpdate;
    let onComponentWillUpdate;
    if (this.ref) {
      const ref = this.ref;
      if (ref.onComponentDidUpdate) {
        onComponentDidUpdate = ref.onComponentDidUpdate.bind(ref, props, props);
      }
      if (ref.onComponentWillUpdate) {
        onComponentWillUpdate = ref.onComponentWillUpdate.bind(ref, props, props);
      }
    }
    let proxy;
    const reaction = new Reaction(base.name, () => {
      let next;
      if (onComponentWillUpdate) {
        onComponentWillUpdate();
      }
      reaction.track(() => {
        next = normalizeRoot(base.apply(this, rest));
      });
      if (next) {
        render(next, proxy as any);
        if (onComponentDidUpdate) {
          onComponentDidUpdate();
        }
      }
    });
    const inner = innerVNode(() => {
      let result;
      let caught;
      reaction.track(() => {
        try {
          result = base.apply(this, rest);
        } catch(error) {
          caught = error;
        }
      });
      if (caught) {
        throw caught;
      }
      return result
    }, props, reaction.dispose.bind(reaction));
    proxy = makeProxy(inner);
    return inner as ReturnType<typeof base>;
  }
  wrapper.defaultProps = (base as any).defaultProps;
  wrapper.defaultHooks = (base as any).defaultHooks;
  if (process.env.NODE_ENV !== 'production') {
    wrapper.isMobXInfernoObserver = true;
  }
  return wrapper as any;
}
