import registerEventHooks from './registerEventHooks';
import ExecutionEnvironment from '../../util/ExecutionEnvironment';

let wheel = 'wheel'; // default: 'wheel'

if ( ExecutionEnvironment.canUseDOM) {
// 'wheel' is a special case
wheel = ('onwheel' in document || document.documentMode >= 9)
	? 'wheel'
	: 'mousewheel';
}

registerEventHooks(wheel, handler => {
	return { handler };
});