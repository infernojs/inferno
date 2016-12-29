import {
	isVoidElement as _isVoidElement,
	escapeText,
	toHyphenCase,
} from './utils';
import { EMPTY_OBJ } from 'inferno';
import {
	isArray,
	isInvalid,
	isNull,
	isNullOrUndef,
	isNumber,
	isStringOrNumber,
	isTrue,
	isFunction,
	throwError
} from '../shared';

import {
	VNodeFlags
} from '../core/structures';
import {
	copyPropsTo
} from '../core/normalization';
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
	const type = vNode.type;
	const props = vNode.props || EMPTY_OBJ;
	const children = vNode.children;

	if (flags & VNodeFlags.Component) {
		const isClass = flags & VNodeFlags.ComponentClass;

		// Primitive node doesn't have defaultProps, only Component
		if (!isNullOrUndef(type.defaultProps)) {
			copyPropsTo(type.defaultProps, props);
			vNode.props = props;
		}

		if (isClass) {
			const instance = new type(props, context);
			const childContext = instance.getChildContext();

			if (!isNullOrUndef(childContext)) {
				context = Object.assign({}, context, childContext);
			}
			if (instance.props === EMPTY_OBJ) {
				instance.props = props;
			}
			instance.context = context;
			instance._pendingSetState = true;
			instance._unmounted = false;
			if (isFunction(instance.componentWillMount)) {
				instance.componentWillMount();
			}
			const nextVNode = instance.render(props, vNode.context);

			instance._pendingSetState = false;
			// In case render returns invalid stuff
			if (isInvalid(nextVNode)) {
				return '<!--!-->';
			}
			return renderVNodeToString(nextVNode, context, true);
		} else {
			const nextVNode = type(props, context);

			if (isInvalid(nextVNode)) {
				return '<!--!-->';
			}
			return renderVNodeToString(nextVNode, context, true);
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
				} else if (prop === 'className' && !isNullOrUndef(value)) {
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
			if (typeof vNode === 'object') {
				throwError(`renderToString() received an object that's not a valid VNode, you should stringify it first. Object: "${ JSON.stringify(vNode) }".`);
			} else {
				throwError(`renderToString() expects a valid VNode, instead it received an object with the type "${ typeof vNode }".`);
			}
		}
		throwError();
	}
}

export default function renderToString(input) {
	return renderVNodeToString(input, {}, true);
}

export function renderToStaticMarkup(input) {
	return renderVNodeToString(input, {}, true);
}
