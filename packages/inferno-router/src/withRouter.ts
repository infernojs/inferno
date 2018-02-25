import { createComponentVNode } from 'inferno';
import { VNodeFlags } from 'inferno-vnode-flags';
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

    return createComponentVNode<any>(VNodeFlags.ComponentClass, Route, {
      render(routeComponentProps) {
        return createComponentVNode(
          VNodeFlags.ComponentUnknown,
          Com,
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
