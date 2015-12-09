import template from './';
import eventMapping from '../shared/eventMapping';
import addListener from './events/addListener';
import { getValueWithIndex } from '../core/variables';

/**
 * Set HTML attributes on the template
 * @param{ HTMLElement } node
 * @param{ Object } attrs
 */
export function addDOMStaticAttributes(vNode, domNode, attrs) {
	for (let attrName in attrs) {
		const attrVal = attrs[attrName];

		if (attrVal) {
			template.setProperty(vNode, domNode, attrName, attrVal, false);
		}
	}
}

// A fast className setter as its the most common property to regularly change
function fastPropSet(attrName, attrVal, domNode) {
	if (attrName === 'class' || attrName === 'className') {
		if (attrVal != null) {
			domNode.className = attrVal;
		}
		return true;
	}
	return false;
}

export function addDOMDynamicAttributes(item, domNode, dynamicAttrs) {
	if (dynamicAttrs.index !== undefined) {
		dynamicAttrs = getValueWithIndex(item, dynamicAttrs.index);
		addDOMStaticAttributes(item, domNode, dynamicAttrs);
		return;
	}
	for (let attrName in dynamicAttrs) {
		let attrVal = getValueWithIndex(item, dynamicAttrs[attrName]);

		if (attrVal !== undefined) {
			if (fastPropSet(attrName, attrVal, domNode) === false) {
				if (eventMapping[attrName]) {
					addListener(item, domNode, eventMapping[attrName], attrVal);
				} else {
					template.setProperty(item, domNode, attrName, attrVal, true);

				}
			}
		}
	}
}

export function updateDOMDynamicAttributes(lastItem, nextItem, domNode, dynamicAttrs) {
	if (dynamicAttrs.index !== undefined) {
		const nextDynamicAttrs = getValueWithIndex(nextItem, dynamicAttrs.index);
		addDOMStaticAttributes(nextItem, domNode, nextDynamicAttrs);
		return;
	}
	for (let attrName in dynamicAttrs) {
		const lastAttrVal = getValueWithIndex(lastItem, dynamicAttrs[attrName]);
		const nextAttrVal = getValueWithIndex(nextItem, dynamicAttrs[attrName]);

		if (lastAttrVal !== nextAttrVal) {
			if (nextAttrVal !== undefined) {
				if (fastPropSet(attrName, nextAttrVal, domNode) === false) {
					if (eventMapping[attrName]) {
						addListener(nextItem, domNode, eventMapping[attrName], nextAttrVal);
					} else {
						template.setProperty(nextItem, domNode, attrName, nextAttrVal, true);
					}
				}
			}
		}
	}
}