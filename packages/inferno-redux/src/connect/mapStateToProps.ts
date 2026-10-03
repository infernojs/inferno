import { isFunction } from 'inferno-shared';
import { wrapMapToPropsConstant, wrapMapToPropsFunc } from './wrapMapToProps';

export const whenMapStateToPropsIsFunction = (mapStateToProps): unknown =>
  isFunction(mapStateToProps)
    ? wrapMapToPropsFunc(mapStateToProps, 'mapStateToProps')
    : undefined;

export const whenMapStateToPropsIsMissing = (mapStateToProps): unknown =>
  !mapStateToProps ? wrapMapToPropsConstant(() => ({})) : undefined;

export const defaultMapStateToPropsFactories = [
  whenMapStateToPropsIsFunction,
  whenMapStateToPropsIsMissing,
];
