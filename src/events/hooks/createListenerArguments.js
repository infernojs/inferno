import isFormElement from '../../util/isFormElement';

// type -> tag -> function(target, event)
const plugins = {};

/**
 * type is a type of event
 * tagName is a DOM element tagName
 * hook is a function(element, event) -> [args...]
 */
export function registerSetupHooks(type, tagName, hook) {
	let tagHooks = plugins[type] = plugins[type] || {};
	tagHooks[tagName] = hook;
}

export default function createListenerArguments(target, event) {
	let type = event.type;
	let tagName = target.tagName.toLowerCase();
	let tagHooks;
	if ( (tagHooks = plugins[type]) ) {
		let hook = tagHooks[tagName];
		if (hook) {
			return hook(target, event);
		}
	}

	// Default behavior:
	// Form elements with a value attribute will have the arguments:
	// [event, value]
	if (isFormElement(tagName)) {
		return [event, target.value];
	}

	// Fallback to just event
	return [event];
} 