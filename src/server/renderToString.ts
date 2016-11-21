import {
	isArray,
	isStringOrNumber,
	isNullOrUndef,
	isInvalid,
	isNull,
	isNumber,
	isTrue
	// throwError,
} from './../shared';
import { isUnitlessNumber } from '../DOM/constants';
import {
	toHyphenCase,
	escapeText,
	escapeAttr,
	isVoidElement as _isVoidElement
} from './utils';
import {
	VNodeFlags,
	// isVNode
} from '../core/shapes';

function renderStylesToString(styles) {
	if (isStringOrNumber(styles)) {
		return styles;
	} else {
		let renderedString = '';
	
		for (let styleName in styles) {
			const value = styles[styleName];
			const px = isNumber(value) && !isUnitlessNumber[styleName] ? 'px' : '';

			if (!isNullOrUndef(value)) {
				renderedString += `${ toHyphenCase(styleName) }:${ escapeAttr(value) }${ px };`;
			}
		}
		return renderedString;
	}
}

function renderVNodeToString(vNode, context, firstChild) {
	const flags = vNode.flags;
	const props = vNode.props;
	const type = vNode.type;
	const children = vNode.children;

	if (flags & VNodeFlags.Component) {
		const isClass = flags & VNodeFlags.ComponentClass;

		if (isClass) {
			const instance = new type(props);
			const childContext = instance.getChildContext();

			if (!isNullOrUndef(childContext)) {
				context = Object.assign({}, context, childContext);
			}
			instance.context = context;
			// Block setting state - we should render only once, using latest state
			instance._pendingSetState = true;
			instance.componentWillMount();
			const nextVNode = instance.render(props, vNode.context);

			instance._pendingSetState = false;
			return renderVNodeToString(nextVNode, context, true);
		} else {
			return renderVNodeToString(type(props, context), context, true);
		}
	} else if (flags & VNodeFlags.Element) {
		let renderedString = `<${ type }`;
		let html;
		const isVoidElement = _isVoidElement(type);
		// handle props
		if (!isNull(props)) {
			for (let prop in props) {
				const value = props[prop];

				if (prop === 'dangerouslySetInnerHTML') {
					html = value.__html;
				} else if (prop === 'style') {
					renderedString += ` style="${ renderStylesToString(props.style) }"`;
				} else if (prop === 'className') {
					renderedString += ` class="${ value }"`;
				} else {
					if (isStringOrNumber(value)) {
						renderedString += ` ${ prop }="${ value }"`;
					} else if (isTrue(value)) {
						renderedString += ` "${ prop }"`;
					}
				}
			}
		}
		// check if
		if (isVoidElement) {
			renderedString += `>`;
		} else {
			renderedString += `>`;
			if (!isInvalid(children)) {
				if (isArray(children)) {
					for (let i = 0; i < children.length; i++) {
						renderedString += renderVNodeToString(children[i], context, i === 0);
					}
				} else if (isStringOrNumber(children)) {
					renderedString += escapeText(children);
				} else {
					renderedString += renderVNodeToString(children, context, true);
				}
			} else if (html) {
				renderedString += html;
			}
			if (!isVoidElement) {
				renderedString += `</${ type }>`;
			}
		}
		return renderedString;
	} else if (flags & VNodeFlags.Text) {
		return (firstChild ? '' : '<!---->') + escapeText(children);
	} else {
		// throw some error here
	}
}

export default function renderToString(input) {
	return renderVNodeToString(input, null, true);
}

export function renderToStaticMarkup(input) {
	return renderVNodeToString(input, null, true);
}
