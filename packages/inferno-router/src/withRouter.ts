import {
  type Component,
  createComponentVNode,
  type InfernoNode,
  type Ref,
  type VNode,
} from 'inferno';
import { VNodeFlags } from 'inferno-vnode-flags';
import hoistStatics from 'hoist-non-inferno-statics';
import { Route } from './Route';

interface IWithRouterProps {
  wrappedComponentRef?: Ref | null;
}

/**
 * A public higher-order component to access the imperative API
 */
export function withRouter<
  P = Readonly<Record<string, unknown>>,
  S = Record<string, unknown>,
>(Com: Component<P & IWithRouterProps, S>): VNode {
  const C: any = function (props: P & IWithRouterProps) {
    const { wrappedComponentRef, ...remainingProps } = props;

    return createComponentVNode<any>(VNodeFlags.ComponentClass, Route, {
      render(routeComponentProps: P & IWithRouterProps): InfernoNode {
        return createComponentVNode(
          VNodeFlags.ComponentUnknown,
          Com,
          { ...remainingProps, ...routeComponentProps },
          null,
          wrappedComponentRef,
        );
      },
    });
  };

  // @ts-expect-error function name property
  C.displayName = `withRouter(${Com.displayName || Com.name})`;
  C.WrappedComponent = Com;
  return hoistStatics(C, Com);
}
