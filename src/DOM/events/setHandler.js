import eventHooks from '../../shared/eventHooks';

/**
 * Creates a wrapped handler that hooks into the Inferno
 * eventHooks system based on the type of event being
 * attached.
 *
 * @param {string} type
 * @param {Function} handler
 * @return {Function} wrapped handler
 */
export default function setHandler( type, handler ) {
	let hook = eventHooks[type];
	if ( hook ) {
		let hooked = hook( handler );
		hooked.originalHandler = handler;
		return hooked;
	}

	return { handler, originalHandler: handler };
}