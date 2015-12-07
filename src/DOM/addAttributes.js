import template from './';
import eventMapping from '../shared/eventMapping';
import addListener from './events/addListener';
import { getValueWithIndex } from '../core/variables';

/**
 * Set HTML attributes on the template
 * @param{ HTMLElement } node
 * @param{ Object } attrs
 */
export default function addDOMAttributes(vNode, domNode, attrs, useProperties) {
	for (let attrName in attrs) {
		const attrVal = attrs[attrName];

		if (attrVal) {
			if (useProperties && eventMapping[attrName]) {
				addListener(vNode, domNode, eventMapping[attrName], attrVal);
			} else {
				template.setProperty(vNode, domNode, attrName, attrVal, useProperties);
			}
		}
	}
}

// TODO do we check last attrs against new attrs?
export function applyDynamicAttrs(item, domNode, dynamicClassName, otherDynamicAttrs) {
	const attrs = {};

	for (let attr in otherDynamicAttrs) {
		attrs[attr] = getValueWithIndex(item, otherDynamicAttrs[attr]);
	}
	addDOMAttributes(item, domNode, attrs, true);
}