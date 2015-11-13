import unitlessCfg from './cfg/unitlessCfg';
import prefixes from './prefixes';
import prefixKey from './prefixKey';
import forIn from '../util/forIn';

export default properties => {
	forIn(properties, (prop, val) => {
		unitlessCfg[prop] = val;
		for (let i = prefixes.length; --i > -1;) {
			unitlessCfg[prefixKey(prefixes[i], prop)] = val;
		}
	});
};
