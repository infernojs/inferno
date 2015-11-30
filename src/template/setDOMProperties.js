import eventMapping from '../events/shared/eventMapping';
import addListener from '../events/addListener';
import setValueForProperty from './setValueForProperty';
import setValueForStyles from './setValueForStyles';
import processFragmentAttrs from './processFragmentAttrs';
//import HOOK from './attributeHooks';

/**
 * Set HTML attributes on the template
 * @param{ HTMLElement } node
 * @param{ Object } attrs
 */
export default function addAttributes(node, attrs, fragment) {

    for (let attrName in attrs) {

        let attrVal = attrs[attrName];
        let skip = false;

        if (attrVal) {

            if (attrVal.pointer != null) {
                const proccessedAttrs = processFragmentAttrs(node, attrName, attrVal, fragment);
                attrVal = proccessedAttrs.attrVal;
                skip = proccessedAttrs.skip;
            }

            // skip dictionary lookup if we can for this events
            if (attrVal === 'onClick' || attrVal === 'onKeyDown' || attrVal === 'onMouseMove') {
                eventManager.addListener(node, eventMapping[attrName], attrVal);
            } else if (attrName === 'style') {
                setValueForStyles(node, attrVal);
            } else {
                // events
                if (eventMapping[attrName]) {
                    addListener(node, eventMapping[attrName], attrVal);
                } else {
					/*
					let isHooked = HOOK[attrName]
                    if (isHooked) {
                        isHooked(node, attrName, attrVal)
                    } else {
                        HOOK._custom(node, attrName, attrVal);
                    }*/
					
                    setValueForProperty(node, attrName, attrVal);
                }
            }
        }
    }
}