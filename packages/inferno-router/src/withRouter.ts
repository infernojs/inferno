/**
 * @module Inferno-Router
 */ /** TypeDoc Comment */
import { createVNode } from 'inferno';
import { VNodeFlags, ChildFlags } from 'inferno-vnode-flags';
import hoistNonReactStatics from 'hoist-non-inferno-statics';
import { Route } from './Route';

interface IWithRouterProps {
  wrappedComponentRef: any;
}

/**
 * A public higher-order component to access the imperative API
 */
export function withRouter(Com) {
  const C: any = function(props: IWithRouterProps) {
    const { wrappedComponentRef, ...remainingProps } = props;

    return createVNode(VNodeFlags.ComponentClass, Route, null, null, 1, {
      render(routeComponentProps) {
        return createVNode(
          VNodeFlags.ComponentUnknown,
          Com,
          null,
          null,
          ChildFlags.HasInvalidChildren,
          {
            ...remainingProps,
            ...routeComponentProps
          },
          null,
          wrappedComponentRef
        );
      }
    });
  };

  C.displayName = `withRouter(${Com.displayName || Com.name})`;
  C.WrappedComponent = Com;
  return hoistNonReactStatics(C, Com);
}
