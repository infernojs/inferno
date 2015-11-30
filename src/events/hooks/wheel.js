import registerEventHooks from './registerEventHooks';
// 'wheel' is a special case
const wheel = ('onwheel' in document || document.documentMode >= 9)
	? 'wheel'
	: 'mousewheel';

registerEventHooks(wheel, function(handler) {
	return { handler };
});