import {
	isVoidElement as _isVoidElement,
	escapeText,
	toHyphenCase,
} from './utils';
import {
	isArray,
	isInvalid,
	isNull,
	isNullOrUndef,
	isNumber,
	isStringOrNumber,
	isTrue,
	isFunction,
	throwError,
} from './../shared';

import {
	VNodeFlags,
} from '../core/shapes';
import { isUnitlessNumber } from '../DOM/constants';

function renderStylesToString(styles) {
	if (isStringOrNumber(styles)) {
		return styles;
	} else {
		let renderedString = '';

		for (let styleName in styles) {
			const value = styles[styleName];
			const px = isNumber(value) && !isUnitlessNumber[styleName] ? 'px' : '';

			if (!isNullOrUndef(value)) {
				renderedString += `${ toHyphenCase(styleName) }:${ escapeText(value) }${ px };`;
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
			instance._pendingSetState = true;
			if (isFunction(instance.componentWillMount)) {
				instance.componentWillMount();
			}
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

		if (!isNull(props)) {
			for (let prop in props) {
				const value = props[prop];

				if (prop === 'dangerouslySetInnerHTML') {
					html = value.__html;
				} else if (prop === 'style') {
					renderedString += ` style="${ renderStylesToString(props.style) }"`;
				} else if (prop === 'className') {
					renderedString += ` class="${ escapeText(value) }"`;
				} else {
					if (isStringOrNumber(value)) {
						renderedString += ` ${ prop }="${ escapeText(value) }"`;
					} else if (isTrue(value)) {
						renderedString += ` ${ prop }`;
					}
				}
			}
		}
		if (isVoidElement) {
			renderedString += `>`;
		} else {
			renderedString += `>`;
			if (!isInvalid(children)) {
				if (isArray(children)) {
					for (let i = 0; i < children.length; i++) {
						const child = children[i];

						if (!isInvalid(child)) {
							renderedString += renderVNodeToString(child, context, i === 0);
						}
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
		if (process.env.NODE_ENV !== 'production') {
			throwError(`renderToString() expects a valid VNode, instead it received an object with the type "${ typeof vNode }".`);
		}
		throwError();
	}
}

export default function renderToString(input) {
	return renderVNodeToString(input, null, true);
}

export function renderToStaticMarkup(input) {
	return renderVNodeToString(input, null, true);
}
