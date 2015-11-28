import isFormElement from '../../util/isFormElement';

// type -> tag -> function(target, event)
const plugins = {};

function getFormElementState(node) {

  var type = node.getAttribute( "type" ) == null ? getNodeName( node ) : node.getAttribute( "type" );

        if (type === 'checkbox' || type === 'radio') {

            if (!node.checked) {
                return false;
            }

            const val = node.getAttribute('value');

            return val ? val : true;

        } else if (type === 'select') {

            if (node.multiple) {

                let result = [];
                const options = node.options;

                for (var i = replace ? 1 : 0; i < options; i++) {

                    let option = options[i];

                    if (option.selected && option.getAttribute('disabled') === null && (!option.parentNode.disabled || getNodeName(option.parentNode) !== 'optgroup')) {

                        result.push(option.value || option.text);
                    }
                }

                return result;
            }

            return ~node.selectedIndex ? node.options[node.selectedIndex].value : '';

        }
}

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
		return [event, getFormElementState(target)];
	}

	// Fallback to just event
	return [event];
} 