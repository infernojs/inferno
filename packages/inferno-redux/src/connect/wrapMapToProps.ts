/**
 * @module Inferno-Redux
 */ /** TypeDoc Comment */

import { verifyPlainObject } from "../utils/verifyPlainObject";

// TODO: Type
export const wrapMapToPropsConstant = getConstant => {
  const initConstantSelector = (dispatch, options) => {
    const constant = getConstant(dispatch, options);

    const constantSelector = () => constant;
    (constantSelector as any).dependsOnOwnProps = false;
    return constantSelector;
  };

  return initConstantSelector;
};

// dependsOnOwnProps is used by createMapToPropsProxy to determine whether to pass props as args
// to the mapToProps function being wrapped. It is also used by makePurePropsSelector to determine
// whether mapToProps needs to be invoked when props have changed.
//
// A length of one signals that mapToProps does not depend on props from the parent component.
// A length of zero is assumed to mean mapToProps is getting args via arguments or ...args and
// therefore not reporting its length accurately..
export const getDependsOnOwnProps = mapToProps =>
  mapToProps.dependsOnOwnProps !== null &&
    mapToProps.dependsOnOwnProps !== undefined
    ? !!mapToProps.dependsOnOwnProps
    : mapToProps.length !== 1;

// Used by whenMapStateToPropsIsFunction and whenMapDispatchToPropsIsFunction,
// this function wraps mapToProps in a proxy function which does several things:
//
//  * Detects whether the mapToProps function being called depends on props, which
//    is used by selectorFactory to decide if it should reinvoke on props changes.
//
//  * On first call, handles mapToProps if returns another function, and treats that
//    new function as the true mapToProps for subsequent calls.
//
//  * On first call, verifies the first result is a plain object, in order to warn
//    the developer that their mapToProps function is not returning a valid result.
//
export const wrapMapToPropsFunc = (mapToProps, methodName) => {
  const initProxySelector = (dispatch, { displayName }) => {
    const proxy: any = (stateOrDispatch, ownProps) =>
      proxy.dependsOnOwnProps
        ? proxy.mapToProps(stateOrDispatch, ownProps)
        : proxy.mapToProps(stateOrDispatch);

    proxy.dependsOnOwnProps = getDependsOnOwnProps(mapToProps);

    proxy.mapToProps = (stateOrDispatch, ownProps) => {
      proxy.mapToProps = mapToProps;
      let props = proxy(stateOrDispatch, ownProps);

      if (typeof props === "function") {
        proxy.mapToProps = props;
        proxy.dependsOnOwnProps = getDependsOnOwnProps(props);
        props = proxy(stateOrDispatch, ownProps);
      }

      if (process.env.NODE_ENV !== "production") {
        verifyPlainObject(props, displayName, methodName);
      }

      return props;
    };

    return proxy;
  };

  return initProxySelector;
};
