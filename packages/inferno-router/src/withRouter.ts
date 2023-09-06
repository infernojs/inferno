/* eslint-disable @typescript-eslint/ban-types */
import {
  type Component,
  type ComponentType,
  createComponentVNode,
  type ForwardRef,
  type InfernoNode,
  type Ref,
} from 'inferno';
import { VNodeFlags } from 'inferno-vnode-flags';
import { Route, type RouteComponentProps } from './Route';
import { hoistStaticProperties } from 'inferno-shared';

interface IWithRouterProps {
  wrappedComponentRef?: Ref | null;
}

/**
 * A public higher-order component to access the imperative API
 */
export function withRouter<
  P extends RouteComponentProps<any> & IWithRouterProps,
>(
  Com: Function | ComponentType<P> | Component<P, any> | ForwardRef<P, any>,
): any {
  const C: any = function (props: RouteComponentProps<any> & IWithRouterProps) {
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
  hoistStaticProperties(C, Com);
  return C;
}
