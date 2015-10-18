import events from '../events/shared/events';
import eventManager from '../events/eventManager';
import DOMPropertyOperations from './DOMPropertyOperations';
import processFragmentAttrs from './processFragmentAttrs';
import fragmentValueTypes from '../enum/fragmentValueTypes';

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
