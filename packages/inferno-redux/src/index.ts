import {Dispatch} from 'redux';
import {connectAdvanced, IConnectOptions} from './components/connectAdvanced';
import {Provider} from './components/Provider';
import {connect} from './connect/connect';
import {wrapActionCreators} from './utils/wrapActionCreators';

export { Provider, connectAdvanced, connect, IConnectOptions, Dispatch, wrapActionCreators };
