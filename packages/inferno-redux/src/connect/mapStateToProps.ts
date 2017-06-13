/**
 * @module Inferno-Redux
 */ /** TypeDoc Comment */

import { wrapMapToPropsConstant, wrapMapToPropsFunc } from "./wrapMapToProps";

export const whenMapStateToPropsIsFunction = mapStateToProps =>
  typeof mapStateToProps === "function"
    ? wrapMapToPropsFunc(mapStateToProps, "mapStateToProps")
    : undefined;

export const whenMapStateToPropsIsMissing = mapStateToProps =>
  !mapStateToProps ? wrapMapToPropsConstant(() => ({})) : undefined;

export const defaultMapStateToPropsFactories = [
  whenMapStateToPropsIsFunction,
  whenMapStateToPropsIsMissing
];
