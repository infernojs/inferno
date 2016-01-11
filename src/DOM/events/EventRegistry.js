import ExecutionEnvironment from '../../util/ExecutionEnvironment';
import addRootListener from './addRootListener';
import setHandler from './setHandler';
import focusEvents from '../../shared/focusEvents';
import {
	standardNativeEventMapping,
	nonBubbleableEventMapping } from '../../shared/eventMapping';

const standardNativeEvents = Object.keys(standardNativeEventMapping)
	.map(key => standardNativeEventMapping[key]);

const nonBubbleableEvents = Object.keys(nonBubbleableEventMapping)
	.map(key => nonBubbleableEventMapping[key]);

const EventRegistry = {};

function getFocusBlur(nativeFocus) {
	if (typeof getFocusBlur.fn === 'undefined') {
		getFocusBlur.fn = nativeFocus ? function () {
			const _type = this._type;
			const handler = setHandler(_type, e => {
				addRootListener(e, _type);
			}).handler;

			document.addEventListener(focusEvents[_type], handler);
		} : function () {
			const _type = this._type;

			document.addEventListener(
				_type,
				setHandler(_type, addRootListener).handler,
				true);
		};
	}
	return getFocusBlur.fn;
}

if (ExecutionEnvironment.canUseDOM) {
	let i = 0;
	let type;
	const nativeFocus = 'onfocusin' in document.documentElement;

	for (; i < standardNativeEvents.length; i++) {
		type = standardNativeEvents[i];
		EventRegistry[type] = {
			_type: type,
			_bubbles: true,
			_counter: 0,
			_enabled: false
		};
		// 'focus' and 'blur'
		if (focusEvents[type]) {
			// IE has `focusin` and `focusout` events which bubble.
			// @see http://www.quirksmode.org/blog/archives/2008/04/delegating_the.html
			EventRegistry[type]._focusBlur = getFocusBlur(nativeFocus);
		}
	}
	// For non-bubbleable events - e.g. scroll - we are setting the events directly on the node
	for (i = 0; i < nonBubbleableEvents.length; i++) {
		type = nonBubbleableEvents[i];
		EventRegistry[type] = {
			_type: type,
			_bubbles: false,
			_enabled: false
		};
	}
}

export default EventRegistry;
