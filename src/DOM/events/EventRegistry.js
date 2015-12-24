import ExecutionEnvironment from '../../util/ExecutionEnvironment';
import addRootListener from './addRootListener';
import setHandler from './setHandler';
import focusEvents from '../../shared/focusEvents';
import {
	standardNativeEventMapping,
	nonBubbleableEventMapping
} from '../../shared/eventMapping';

function nativeFocusListener( type ) {
	document.addEventListener(
		focusEvents[type],
		setHandler( type, e => {
			addRootListener( e, type );
		} ).handler,
		false );
}

function customFocusListener( type ) {
	document.addEventListener(
		type,
		setHandler( type, addRootListener ).handler,
		true );
}

const standardNativeEvents = Object.keys( standardNativeEventMapping )
	.map( key => standardNativeEventMapping[key] );

const nonBubbleableEvents = Object.keys( nonBubbleableEventMapping )
	.map( key => nonBubbleableEventMapping[key] );

const EventRegistry = {};

if ( ExecutionEnvironment.canUseDOM ) {
	let i = 0;
	let type;
	const nativeFocus = 'onfocusin' in document.documentElement;

	for ( ; i < standardNativeEvents.length; i++ ) {
		type = standardNativeEvents[i];
		EventRegistry[type] = {
			_type: type,
			_bubbles: true,
			_counter: 0,
			_enabled: false
		};
		// 'focus' and 'blur'
		if ( focusEvents[type] ) {
			// @see http://www.quirksmode.org/blog/archives/2008/04/delegating_the.html
			EventRegistry[type]._focusBlur = nativeFocus ?
				nativeFocusListener( type ) : // IE has focusin/focusout events which bubble
				customFocusListener( type ); // firefox doesn't support focusin/focusout events
		}
	}
	// For non-bubbleable events - e.g. scroll - we are setting the events directly on the node
	for ( i = 0; i < nonBubbleableEvents.length; i++ ) {
		type = nonBubbleableEvents[i];
		EventRegistry[type] = {
			_type: type,
			_bubbles: false,
			_enabled: false
		};
	}
}

export default EventRegistry;
