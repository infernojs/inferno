import { wrapMapToPropsConstant, wrapMapToPropsFunc } from './wrapMapToProps';

export const whenMapStateToPropsIsFunction = (mapStateToProps): unknown =>
  typeof mapStateToProps === 'function'
    ? wrapMapToPropsFunc(mapStateToProps, 'mapStateToProps')
    : undefined;

export const whenMapStateToPropsIsMissing = (mapStateToProps): unknown =>
  !mapStateToProps ? wrapMapToPropsConstant(() => ({})) : undefined;

export const defaultMapStateToPropsFactories = [
  whenMapStateToPropsIsFunction,
  whenMapStateToPropsIsMissing,
];
