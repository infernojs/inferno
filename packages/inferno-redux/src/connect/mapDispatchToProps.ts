/**
 * @module Inferno-Redux
 */ /** TypeDoc Comment */

import { wrapMapToPropsConstant, wrapMapToPropsFunc } from "./wrapMapToProps";

import { bindActionCreators } from "redux";

export const whenMapDispatchToPropsIsFunction = mapDispatchToProps =>
  typeof mapDispatchToProps === "function"
    ? wrapMapToPropsFunc(mapDispatchToProps, "mapDispatchToProps")
    : undefined;

export const whenMapDispatchToPropsIsMissing = mapDispatchToProps =>
  !mapDispatchToProps
    ? wrapMapToPropsConstant(dispatch => ({ dispatch }))
    : undefined;

export const whenMapDispatchToPropsIsObject = mapDispatchToProps =>
  mapDispatchToProps && typeof mapDispatchToProps === "object"
    ? wrapMapToPropsConstant(dispatch =>
        bindActionCreators(mapDispatchToProps, dispatch)
      )
    : undefined;

export const defaultMapDispatchToPropsFactories = [
  whenMapDispatchToPropsIsFunction,
  whenMapDispatchToPropsIsMissing,
  whenMapDispatchToPropsIsObject
];
