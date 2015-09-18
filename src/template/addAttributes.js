import events from '../events/shared/events';
import clearEventListeners from '../events/clearEventListeners';
import addEventListener from '../events/addEventListener';
import { setStyles } from './CSSOperations';
import { setAttribute } from './DOMOperations';
import fragmentValueTypes from '../enum/fragmentValueTypes';

/**
 * Set HTML attributes on the template
 * @param{ HTMLElement } node
 * @param{ Object } attrs
 */
export default function addAttributes(node, attrs, fragment) {
	for(let attrName in attrs) {
		let attrVal = attrs[attrName];

		if(attrVal && attrVal.pointer != null) {
			if(fragment.templateValue !== undefined) {
				fragment.templateElement = node;
				fragment.templateType = fragmentValueTypes.ATTR_OTHER[attrName] = attrName;
			} else {
				fragment.templateElements[attrVal.pointer] = node;
				fragment.templateTypes[attrVal.pointer] = fragmentValueTypes.ATTR_OTHER[attrName] = attrName;
			}
		}
		// avoid 'null' values
		if (attrVal !== undefined) {
			// events
			if (events[attrName] !== undefined) {
				clearEventListeners(node, attrName);
				addEventListener(node, attrName, attrVal);
				// styles
			} else if (attrName === 'style') {
				setStyles(node, attrVal);
				// attributes / properties
			} else if (attrVal != null) {
				setAttribute(node, attrName, attrVal);
			}
		}
	}
};
