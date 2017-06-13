/**
 * @module Inferno-Redux
 */ /** TypeDoc Comment */

import { ActionCreatorsMapObject, bindActionCreators, Dispatch } from "redux";

export const wrapActionCreators = <A extends ActionCreatorsMapObject>(
  actionCreators: A
) => (dispatch: Dispatch<any>) => bindActionCreators(actionCreators, dispatch);
