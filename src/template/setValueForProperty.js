import eventMapping from '../events/shared/eventMapping';
import addListener from '../events/addListener';
import template from './';
import processFragmentAttrs from './processFragmentAttrs';

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

            if (eventMapping[attrName]) {
                addListener(node, eventMapping[attrName], attrVal);
            } else {
                template.setProperty(node, attrName, attrVal);
            }
        }
    }
}