/**
 * @module Inferno-Redux
 */ /** TypeDoc Comment */

import { Dispatch } from 'redux';
import { connectAdvanced, IConnectOptions } from './components/connectAdvanced';
import { Provider } from './components/Provider';
import { connect } from './connect/connect';

export { Provider, connectAdvanced, connect, IConnectOptions, Dispatch };
export default { Provider, connectAdvanced, connect };
