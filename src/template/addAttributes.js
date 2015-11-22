import events from '../events/shared/events';
import eventManager from '../events/eventManager';
import attrOps from './AttributeOps';
import fragmentValueTypes from '../enum/fragmentValueTypes';

//ensuring we use these fragmentTypes before using ATTR_OTHER makes updates on
//fragments far faster, as there's way less overhead and logic involved when
//we get to updateFragmentValue/updateFragmentValues (especially on classNames)
//this somewhat replicates buildInfernoAttrsParams() in t7
function processFragmentAttrs(node, attrName, attrVal, fragment) {
	let fragmentType;
	let skip = false;

	switch (attrName) {
	case 'class':
	case 'className':
		fragmentType = fragmentValueTypes.ATTR_CLASS;
		break;
	case 'id':
		fragmentType = fragmentValueTypes.ATTR_ID;
		break;
	case 'ref':
		fragmentType = fragmentValueTypes.ATTR_REF;
		skip = true;
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
		return {attrVal: fragment.templateValue, skip};
	} else {
		fragment.templateElements[attrVal.pointer] = node;
		if(fragmentType === fragmentValueTypes.ATTR_OTHER) {
			fragment.templateTypes[attrVal.pointer] = fragmentValueTypes.ATTR_OTHER[attrName] = attrName;
		} else {
			fragment.templateTypes[attrVal.pointer] = fragmentType;
		}
		return {attrVal: fragment.templateValues[attrVal.pointer], skip};
	}
	return {attrVal: null, skip};
}

/**
 * Set HTML attributes on the template
 * @param{ HTMLElement } node
 * @param{ Object } attrs
 */
export default function addAttributes(node, attrs, fragment) {
	for(let attrName in attrs) {
		let attrVal = attrs[attrName];
		let skip = false;

		//check if we have a pointer, if so, this is from the funcitonal API
		//and thus it needs its fragment processing
		//the t7 template API shouldn't need this as it post-processes the same code
		//within t7: look for buildInfernoAttrsParams() in t7
		if(attrVal && attrVal.pointer != null) {
			const proccessedAttrs = processFragmentAttrs(node, attrName, attrVal, fragment);
			attrVal = proccessedAttrs.attrVal;
			skip = proccessedAttrs.skip;
		}
		// avoid 'null' values
		if (attrVal !== null) {
			// events
			if (events[attrName] !== undefined) {
				eventManager.addListener(node, attrName, attrVal);
				// attributes / properties
			} else if (attrVal != null) {
				attrOps.set(node, attrName, attrVal);
			}
		}
	}
}
