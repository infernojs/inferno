import events from '../events/shared/events';
import eventManager from '../events/eventManager';
import setValueForProperty from './setValueForProperty';
import setValueForStyles from './setValueForStyles';
import processFragmentAttrs from './processFragmentAttrs';

const { isPrefixedEvent } = eventManager;

/**
 * Set HTML attributes on the template
 * @param{ HTMLElement } node
 * @param{ Object } attrs
 */
export default function addAttributes(node, attrs, fragment) {
    for (let attrName in attrs) {
        let attrVal = attrs[attrName];
        let skip = false;

        if (attrVal && attrVal.pointer != null) {
            const proccessedAttrs = processFragmentAttrs(node, attrName, attrVal, fragment);
			attrVal = proccessedAttrs.attrVal;
			skip = proccessedAttrs.skip;
        }
        if (attrName === 'style') {
		    setValueForStyles(node, attrVal);
        } else {
            // avoid 'null' values
            if (attrVal !== undefined) {
                // events
                if (events[attrName] !== undefined) {
                    eventManager.addListener(node, events[attrName], attrVal);
                    // attributes / properties
                } else {
                    setValueForProperty(node, attrName, attrVal);
                }
            }
        }
    }
}