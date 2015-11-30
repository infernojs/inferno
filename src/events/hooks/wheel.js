// 'wheel' is a special case
const wheel = ('onwheel' in document || document.documentMode >= 9)
	? 'wheel'
	: 'mousewheel';

export default function register(registerEventHooks) {
	registerEventHooks(wheel, function(handler) {
		return { handler };
	});
}