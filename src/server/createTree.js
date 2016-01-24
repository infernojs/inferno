import createStaticNode from './shapes/staticNode';
import isArray from '../util/isArray';
import isStringOrNumber from '../util/isStringOrNumber';
import { unitlessProperties } from '../util/styleAccessor';
import { DOMAttributeNames } from '../DOM/DOMRegistry';
import isVoid from '../util/isVoid';
import isValidAttribute from '../util/isValidAttribute';
import { getDynamicNode } 	from '../core/variables';
import DOMRegistry from '../DOM/DOMRegistry';
import quoteAttributeValueForBrowser from './quoteAttributeValueForBrowser';
import selfClosingTags from './selfClosingTags';

function countChildren(children) {
	if (!isVoid(children)) {
		if (isArray(children)) {
			return children.length;
		} else {
			return 1;
		}
	} else {
		return 0;
	}
}

function renderMarkupForSelect(node) {
	let value = node.attrs && node.attrs.value;

	if (!isVoid(value)) {
		let values = {};
		if (isArray(value)) {
			for (let i = 0, len = value.length; i < len; i++) {
				values[value[i]] = value[i];
			}
		} else {
			values[value] = value;
		}
		populateOptions(node, values);
		if (node.attrs && node.attrs.value) {
			delete node.attrs.value;
		}
	}
}

/**
 * Populates values to options node.
 *
 * @param  Object node      A starting node (generaly a select node).
 * @param  Object values    The selected values to populate.
 */
function populateOptions(node, values) {
	if (node.tag !== 'option') {
		for (let i = 0, len = node.children.length; i < len; i++) {
			populateOptions(node.children[i], values);
		}
		return;
	}
	let value = node.attrs && node.attrs.value;

	if (!values[value]) {
		return;
	}
	node.attrs = node.attrs || {};
	node.attrs.selected = 'selected';
}

/**
 *  WORK IN PROGRESS
 *
 *  Need to run tests for this one!!
 *
 * */
function renderMarkupForStyles(styles, component) {
	let serialized = '';

	for (let styleName in styles) {
		if (isValidAttribute(styleName)) {
			let styleValue = styles[styleName];

			if (!isVoid(styleValue)) {
				if (!unitlessProperties[styleName]) {
					if (typeof styleValue !== 'string') {
						styleValue = styleValue + 'px';
					}
				}
				serialized += styleName + ':';
				serialized += styleValue + ';';
			}
		}
	}
	return serialized || null;
}

function renderMarkupForAttributes(name, value) {
	if (name === 'data-inferno') {
		return `${ name }`;
	}
	const propertyInfo = DOMRegistry[name] || null;

	if (propertyInfo) {
		if (isVoid(value) ||
			propertyInfo.hasBooleanValue && !value ||
			propertyInfo.hasNumericValue && (value !== value) ||
			propertyInfo.hasPositiveNumericValue && value < 1 ||
			value === 'false' ||
			value.length === 0) {
			return '';
		}
		let attributeName = propertyInfo.attributeName;

		return `${ attributeName }=${ quoteAttributeValueForBrowser(value) }`;
	} else {
		if (isVoid(value) || !isValidAttribute(name)) {
			return '';
		}
		// custom attributes
		return `${ DOMAttributeNames[name] || name.toLowerCase() }=${ quoteAttributeValueForBrowser(value) }`;
	}
}
function createStaticAttributes(props, excludeAttrs) {
	let HTML = '';

	for (let propKey in props) {
		let propValue = props[propKey];

		if (!isVoid(propValue)) {
			if (propKey === 'style') {
				propValue = renderMarkupForStyles(propValue);
			}
			let markup = null;

			markup = renderMarkupForAttributes(propKey, propValue);
			if (markup) {
				HTML += ' ' + markup;
			}
		}
	}
	return HTML;
}

function createStaticTreeChildren(children) {
	let isLastChildNode = false;

	if (isArray(children)) {
		return children.map((child, i) => {
			if (isStringOrNumber(child)) {
				if (isLastChildNode) {
					isLastChildNode = true;
					return '<!---->' + child;
				} else {
					isLastChildNode = true;
					return child;
				}
			}
			isLastChildNode = false;
			return createStaticTreeNode(false, child);
		}).join('');
	} else {
		if (isStringOrNumber(children)) {
			return children;
		} else {
			return createStaticTreeNode(false, children);
		}
	}
}

function createStaticTreeNode(isRoot, node) {
	let staticNode;

	if (isVoid(node)) {
		return '';
	}
	if (node.tag) {
		let tag = typeof node.tag === 'string' && node.tag.toLowerCase();
		let attrs = node.attrs;
		let attributes = {};

		for (let key in node.attrs) {
			if (key === 'value') {
				if (tag === 'select') {
					renderMarkupForSelect(node);
					continue;
				} else if (tag === 'textarea' || attrs.contenteditable) {
					node.text = attrs[key];
					continue;
				}
			}
			attributes[key] = attrs[key];
		}
		if (isRoot) {
			attributes['data-inferno'] = true;
		}
		staticNode = `<${ tag }`;

		// In React they can add innerHTML like this, just workaround it
		if (attributes.innerHTML) {
			node.text = attributes.innerHTML;
		} else {
			staticNode += createStaticAttributes(attributes, null);
		}

		if (selfClosingTags[tag]) {
			staticNode += ` />`;
		} else {
			staticNode += `>`;

			if (!isVoid(node.children)) {
				staticNode += createStaticTreeChildren(node.children);
			} else if (!isVoid(node.text)) {
				staticNode += node.text;
			}
			staticNode += `</${ tag }>`;
		}
	}

	return staticNode;
}

export default function createHTMLTree(schema, isRoot, dynamicNodes) {
	const dynamicFlags = getDynamicNode(dynamicNodes, schema);
	let node;
	// static html
	if (!dynamicFlags) {
		return createStaticNode(createStaticTreeNode(isRoot, schema));
	}

	return node;
}
