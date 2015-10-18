import events from '../events/shared/events';
import eventManager from '../events/eventManager';
import DOMPropertyOperations from './DOMPropertyOperations';
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
	case 'label':
		fragmentType = fragmentValueTypes.ATTR_LABEL;
		break;
	case 'placeholder':
		fragmentType = fragmentValueTypes.ATTR_PLACEHOLDER;
		break;
	case 'name':
		fragmentType = fragmentValueTypes.ATTR_NAME;
		break;
	case 'width':
		fragmentType = fragmentValueTypes.ATTR_WIDTH;
		break;
	case 'height':
		fragmentType = fragmentValueTypes.ATTR_HEIGHT;
		break;
	case 'designMode':
		fragmentType = fragmentValueTypes.ATTR_DESIGNMODE;
		break;
	case 'htmlFor':
		fragmentType = fragmentValueTypes.ATTR_HTMLFOR;
		break;
	case 'playbackRate':
		fragmentType = fragmentValueTypes.ATTR_PLAYBACKRATE;
		break;
	case 'preload':
		fragmentType = fragmentValueTypes.ATTR_PRELOAD;
		break;
	case 'srcDoc':
		fragmentType = fragmentValueTypes.ATTR_SRCDOC;
		break;
	case 'autoplay':
		fragmentType = fragmentValueTypes.ATTR_AUTOPLAY;
		break;
	case 'checked':
		fragmentType = fragmentValueTypes.ATTR_CHECKED;
		break;
	case 'isMap':
		fragmentType = fragmentValueTypes.ATTR_ISMAP;
		break;
	case 'loop':
		fragmentType = fragmentValueTypes.ATTR_LOOP;
		break;
	case 'muted':
		fragmentType = fragmentValueTypes.ATTR_MUTED;
		break;
	case 'readOnly':
		fragmentType = fragmentValueTypes.ATTR_READONLY;
		break;
	case 'reversed':
		fragmentType = fragmentValueTypes.ATTR_REVERSED;
		break;
	case 'required':
		fragmentType = fragmentValueTypes.ATTR_REQUIRED;
		break;
	case 'selected':
		fragmentType = fragmentValueTypes.ATTR_SELECTED;
		break;
	case 'spellCheck':
		fragmentType = fragmentValueTypes.ATTR_SPELLCHECK;
		break;
	case 'trueSpeed':
		fragmentType = fragmentValueTypes.ATTR_TRUESPEED;
		break;
	case 'multiple':
		fragmentType = fragmentValueTypes.ATTR_MULTIPLE;
		break;
	case 'controls':
		fragmentType = fragmentValueTypes.ATTR_CONTROLS;
		break;
	case 'defer':
		fragmentType = fragmentValueTypes.ATTR_DEFER;
		break;
	case 'noValidate':
		fragmentType = fragmentValueTypes.ATTR_NOVALIDATE;
		break;
	case 'scoped':
		fragmentType = fragmentValueTypes.ATTR_SCOPED;
		break;
	case 'resize':
		fragmentType = fragmentValueTypes.ATTR_NO_RESIZE;
		break;
	case 'ref':
		fragmentType = fragmentValueTypes.ATTR_REF;
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
				eventManager.addListener(node, attrName, attrVal);
				// attributes / properties
			} else if (attrVal != null) {
				DOMPropertyOperations(node, attrName, attrVal);
			}
		}
	}
}
