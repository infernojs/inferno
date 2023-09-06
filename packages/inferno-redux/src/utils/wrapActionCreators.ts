import { bindActionCreators, type Dispatch } from 'redux';

export function wrapActionCreators(actionCreators) {
  return function (dispatch: Dispatch<any>) {
    return bindActionCreators(actionCreators, dispatch);
  };
}
