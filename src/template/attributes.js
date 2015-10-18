import events from '../events/shared/events';
import eventManager from '../events/eventManager';
import processFragmentAttrs from './processFragmentAttrs';
import DOMPropertyOperations from './DOMPropertyOperations';

/**
 * Set HTML attributes on the template
 * @param{ HTMLElement } node
 * @param{ Object } attrs
 */
export default (node, attrs, fragment) => {

    let attrName,
        attrValue;

    for (attrName in attrs) {

        attrValue = attrs[attrName];

        // avoid 'null' values
        if (attrValue != null) {

            if (attrValue.pointer != null) {
                attrValue = processFragmentAttrs(node, attrName, attrValue, fragment);
            }

            if (events[attrName] !== undefined) {
				eventManager.addListener(node, attrName, attrValue);
				// attributes / properties
			} else if (attrValue !== undefined) {
			    DOMPropertyOperations(node, attrName, attrValue);
			}
        }
    }
};