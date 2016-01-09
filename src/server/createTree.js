import createStaticNode from './shapes/staticNode';
import isArray from '../util/isArray';
import isStringOrNumber from '../util/isStringOrNumber';
import isVoid from '../util/isVoid';
import DOMRegistry from '../DOM/DOMRegistry';
import quoteAttributeValueForBrowser from './quoteAttributeValueForBrowser';

const selfClosingTags = {
	area: true,
	base: true,
	basefont: true,
	br: true,
	col: true,
	command: true,
	embed: true,
	frame: true,
	hr: true,
	img: true,
	input: true,
	isindex: true,
	keygen: true,
	link: true,
	meta: true,
	param: true,
	source: true,
	track: true,
	wbr: true,

	//common self closing svg elements
	path: true,
	circle: true,
	ellipse: true,
	line: true,
	rect: true,
	use: true,
	stop: true,
	polyline: true,
	polygon: true
};

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

/**
 *  WORK IN PROGRESS
 *
 *  Need to run tests for this one!!
 *
 * */
function renderMarkupForStyles(styles, component) {

	let serialized = '';

	for (let styleName in styles) {

		let styleValue = styles[styleName];

		if (styleValue !== null) {
			serialized += styleName + ':';
			serialized += styleValue + ';';
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
			value.length === 0) {
			return '';
		}
		let attributeName = propertyInfo.attributeName;
		if (propertyInfo.hasBooleanValue) {
			return attributeName + '=""';
		}
		return `${ attributeName }=${ quoteAttributeValueForBrowser(value) }`;
	} else {

		if (isVoid(value)) {
			return '';
		}

		// custom attributes
		return `${ name }=${ quoteAttributeValueForBrowser(value) }`;
	}
}
function createStaticAttributes(props, excludeAttrs) {

	let HTML = '';

	for (let propKey in props) {

		let propValue = props[propKey];

		if (!isVoid(propValue)) {
			if (propKey === 'style') {
				propValue = renderMarkupForStyles(propKey, propValue);
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

		let attributes = {};

		for (let key in node.attrs) {

			if (key === 'value') {
				if (node.tag === 'select') {
					// TODO! Finish this
					continue;
				} else if (node.tag === 'textarea' || node.attrs.contenteditable) {
					node.text = node.attrs[key];
					continue;
				}
			}
			attributes[key] = node.attrs[key];
		}

		if (isRoot) {
		//	if (!attributes) {
			//			attributes = {};
			//}
			attributes['data-inferno'] = true;
		}
		staticNode = `<${ node.tag }`;

		if (attributes) {
			// In React they can add innerHTML like this, just workaround it
			if (attributes.innerHTML) {
				node.text = innerHTML;
			} else {
				staticNode += createStaticAttributes(attributes, null);
			}
		}

		staticNode += `>`;

		if (selfClosingTags[node.tag]) {

		} else {

			if (!isVoid(node.children)) {
				staticNode += createStaticTreeChildren(node.children);
			} else if (!isVoid(node.text)) {
				staticNode += node.text;
			} else if (!isVoid(node.text)) {
				staticNode += node.text;
			}
		}
		staticNode += `</${ node.tag }>`;
	}

	return staticNode;
}

export default function createHTMLTree(schema, isRoot, dynamicNodeMap) {
	const dynamicFlags = dynamicNodeMap.get(schema);
	let node;

	// static html
	if (!dynamicFlags) {
		return createStaticNode(createStaticTreeNode(isRoot, schema));
	}

	return node;
}