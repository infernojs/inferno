import events from '../events/shared/events';
import clearEventListeners from '../events/clearEventListeners';
import addEventListener from '../events/addEventListener';
import attrOps from './AttributeOps';
import fragmentValueTypes from '../enum/fragmentValueTypes';

//ensuring we use these fragmentTypes before using ATTR_OTHER makes updates on
//fragments far faster, as there's way less overhead and logic involved when
//we get to updateFragmentValue/updateFragmentValues (especially on classNames)
//this somewhat replicates buildInfernoAttrsParams() in t7
function processFragmentAttrs(node, attrName, attrVal, fragment) {
	let fragmentType;

	switch (attrName) {
	case 'class':
	case 'className':
		fragmentType = fragmentValueTypes.ATTR_CLASS;
		break;
	case 'id':
		fragmentType = fragmentValueTypes.ATTR_ID;
		break;
	case 'value':
		fragmentType = fragmentValueTypes.ATTR_VALUE;
		break;
	case 'width':
		fragmentType = fragmentValueTypes.ATTR_WIDTH;
		break;
	case 'height':
		fragmentType = fragmentValueTypes.ATTR_HEIGHT;
		break;
	case 'type':
		fragmentType = fragmentValueTypes.ATTR_TYPE;
		break;
	case 'name':
		fragmentType = fragmentValueTypes.ATTR_NAME;
		break;
	case 'label':
		fragmentType = fragmentValueTypes.ATTR_LABEL;
		break;
	case 'placeholder':
		fragmentType = fragmentValueTypes.ATTR_PLACEHOLDER;
		break;
	default:
		fragmentType = fragmentValueTypes.ATTR_OTHER;
	}

	if(fragment.templateValue !== undefined) {
		fragment.templateElement = node;
		if(fragmentType === fragmentValueTypes.ATTR_OTHER) {
			fragment.templateType = fragmentValueTypes.ATTR_OTHER[attrName] = attrName;
		} else {
			fragment.templateType = fragmentType;
		}
		return fragment.templateValue;
	} else {
		fragment.templateElements[attrVal.pointer] = node;
		if(fragmentType === fragmentValueTypes.ATTR_OTHER) {
			fragment.templateTypes[attrVal.pointer] = fragmentValueTypes.ATTR_OTHER[attrName] = attrName;
		} else {
			fragment.templateTypes[attrVal.pointer] = fragmentType;
		}
		return fragment.templateValues[attrVal.pointer];
	}
}

/**
 * Set HTML attributes on the template
 * @param{ HTMLElement } node
 * @param{ Object } attrs
 */
export default function addAttributes(node, attrs, fragment) {
	for(let attrName in attrs) {
		let attrVal = attrs[attrName];

		//check if we have a pointer, if so, this is from the funcitonal API
		//and thus it needs its fragment processing
		//the t7 template API shouldn't need this as it post-processes the same code
		//within t7: look for buildInfernoAttrsParams() in t7
		if(attrVal && attrVal.pointer != null) {
			attrVal = processFragmentAttrs(node, attrName, attrVal, fragment);
		}
		// avoid 'null' values
		if (attrVal !== undefined) {
			// events
			if (events[attrName] !== undefined) {
				clearEventListeners(node, attrName);
				addEventListener(node, attrName, attrVal);
				// attributes / properties
			} else if (attrVal != null) {
				attrOps.set(node, attrName, attrVal);
			}
		}
	}
}
