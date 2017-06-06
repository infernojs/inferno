import { EMPTY_OBJ, internal_isUnitlessNumber } from 'inferno';
import {
	combineFrom,
	isArray,
	isFunction,
	isInvalid,
	isNull,
	isNullOrUndef,
	isNumber,
	isStringOrNumber,
	isTrue,
	throwError,
} from 'inferno-shared';
import VNodeFlags from 'inferno-vnode-flags';
import { escapeText, isVoidElement as _isVoidElement, toHyphenCase } from './utils';

function renderStylesToString(styles) {
	if (isStringOrNumber(styles)) {
		return styles;
	} else {
		let renderedString = '';

		for (const styleName in styles) {
			const value = styles[styleName];
			const px = isNumber(value) && !internal_isUnitlessNumber.has(styleName) ? 'px' : '';

			if (!isNullOrUndef(value)) {
				renderedString += `${toHyphenCase(styleName)}:${escapeText(value)}${px};`;
			}
		}
		return renderedString;
	}
}

function renderVNodeToString(vNode, parent, context, firstChild): string | undefined {
	const flags = vNode.flags;
	const type = vNode.type;
	const props = vNode.props || EMPTY_OBJ;
	const children = vNode.children;

	if (flags & VNodeFlags.Component) {
		const isClass = flags & VNodeFlags.ComponentClass;

		if (isClass) {
			const instance = new type(props, context);
			instance._blockSetState = false;
			let childContext;
			if (!isNullOrUndef(instance.getChildContext)) {
				childContext = instance.getChildContext();
			}

			if (!isNullOrUndef(childContext)) {
				context = combineFrom(context, childContext);
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
			return renderVNodeToString(nextVNode, vNode, context, true);
		} else {
			const nextVNode = type(props, context);

			if (isInvalid(nextVNode)) {
				return '<!--!-->';
			}
			return renderVNodeToString(nextVNode, vNode, context, true);
		}
	} else if (flags & VNodeFlags.Element) {
		let renderedString = `<${type}`;
		let html;
		const isVoidElement = _isVoidElement(type);

		if (!isNullOrUndef(vNode.className)) {
			renderedString += ` class="${escapeText(vNode.className)}"`;
		}

		if (!isNull(props)) {
			for (const prop in props) {
				const value = props[prop];

				if (prop === 'dangerouslySetInnerHTML') {
					html = value.__html;
				} else if (prop === 'style') {
					renderedString += ` style="${renderStylesToString(props.style)}"`;
				} else if (prop === 'children') {
					// Ignore children as prop.
				} else if (prop === 'defaultValue') {
					// Use default values if normal values are not present
					if (!props.value) {
						renderedString += ` value="${escapeText(value)}"`;
					}
				} else if (prop === 'defaultChecked') {
					// Use default values if normal values are not present
					if (!props.checked) {
						renderedString += ` checked="${value}"`;
					}
				} else if (type === 'option' && prop === 'value') {
					// Parent value sets children value
					if (value === parent.props.value) {
						renderedString += ` selected`;
					}
				} else {
					if (isStringOrNumber(value)) {
						renderedString += ` ${prop}="${escapeText(value)}"`;
					} else if (isTrue(value)) {
						renderedString += ` ${prop}`;
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
					for (let i = 0, len = children.length; i < len; i++) {
						const child = children[i];
						if (isStringOrNumber(child)) {
							renderedString += child === '' ? ' ' : escapeText(child);
						} else if (!isInvalid(child)) {
							renderedString += renderVNodeToString(child, vNode, context, i === 0);
						}
					}
				} else if (isStringOrNumber(children)) {
					renderedString += children === '' ? ' ' : escapeText(children);
				} else {
					renderedString += renderVNodeToString(children, vNode, context, true);
				}
			} else if (html) {
				renderedString += html;
			}
			if (!isVoidElement) {
				renderedString += `</${type}>`;
			}
		}
		return renderedString;
	} else if (flags & VNodeFlags.Text) {
		return (firstChild ? '' : '<!---->') + (children === '' ? ' ' : escapeText(children));
	} else {
		if (process.env.NODE_ENV !== 'production') {
			if (typeof vNode === 'object') {
				throwError(
					`renderToString() received an object that's not a valid VNode, you should stringify it first. Object: "${JSON.stringify(
						vNode,
					)}".`,
				);
			} else {
				throwError(
					`renderToString() expects a valid VNode, instead it received an object with the type "${typeof vNode}".`,
				);
			}
		}
		throwError();
	}
}

export default function renderToString(input: any): string {
	return renderVNodeToString(input, {}, {}, true) as string;
}

export function renderToStaticMarkup(input: any): string {
	return renderVNodeToString(input, {}, {}, true) as string;
}
