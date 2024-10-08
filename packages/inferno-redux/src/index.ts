import { type Dispatch } from 'redux';
import {
  connectAdvanced,
  type IConnectOptions,
} from './components/connectAdvanced';
import { Provider } from './components/Provider';
import { connect } from './connect/connect';
import { wrapActionCreators } from './utils/wrapActionCreators';
import { shallowEqual } from './utils/shallowEqual';

export {
  Provider,
  connectAdvanced,
  shallowEqual,
  connect,
  type IConnectOptions,
  type Dispatch,
  wrapActionCreators,
};
