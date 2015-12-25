import isFormElement from '../../util/isFormElement';
import getFormElementValues from '../getFormElementValues';
import setupHooks from '../../shared/setupHooks';

export default function createListenerArguments( target, event ) {
	const type = event.type;
	const nodeName = target.nodeName.toLowerCase();

	let tagHooks;

	if ( ( tagHooks = setupHooks[type] ) ) {
		let hook = tagHooks[nodeName];
		if ( hook ) {
			return hook( target, event );
		}
	}
	// Default behavior:
	// Form elements with a value attribute will have the arguments:
	// [event, value]
	if ( isFormElement( nodeName ) ) {
		return [event, getFormElementValues( target )];
	}
	// Fallback to just event
	return [event];
}