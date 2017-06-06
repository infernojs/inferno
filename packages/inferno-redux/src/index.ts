/**
 * @module Inferno-Redux
 */ /** TypeDoc Comment */

import connect from './connect';
import Provider from './Provider';
import { shallowEqual, warning } from './utils';

export default {
	Provider,
	connect,
};

export { Provider, connect, shallowEqual, warning };
