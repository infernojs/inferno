import {
	isArray,
	isStringOrNumber,
	isNullOrUndef,
	isInvalid,
	isFunction,
	addChildrenToProps,
	isStatefulComponent,
	isNumber,
	isTrue
} from './../core/utils';
import { isUnitlessNumber } from '../DOM/utils';
import { toHyphenCase, escapeText, escapeAttr, isVoidElement } from './utils';

function renderComponent(Component, props, children, context, isRoot) {
	props = addChildrenToProps(children, props);

	if (isStatefulComponent(Component)) {
		const instance = new Component(props);
		const childContext = instance.getChildContext();

		if (!isNullOrUndef(childContext)) {
			context = Object.assign({}, context, childContext);
		}
		instance.context = context;
		// Block setting state - we should render only once, using latest state
		instance._pendingSetState = true;
		instance.componentWillMount();
		const node = instance.render();

		instance._pendingSetState = false;
		return renderNode(node, context, isRoot);
	} else {
		return renderNode(Component(props), context, isRoot);
	}
}

function renderChildren(children, context) {
	if (children && isArray(children)) {
		const childrenResult = [];
		let insertComment = false;

		for (let i = 0; i < children.length; i++) {
			const child = children[i];
			const isText = isStringOrNumber(child);
			const invalid = isInvalid(child);

			if (isText || invalid) {
				if (insertComment === true) {
					if (isInvalid(child)) {
						childrenResult.push('<!--!-->');
					} else {
						childrenResult.push('<!---->');
					}
				}
				if (isText) {
					childrenResult.push(escapeText(child));
				}
				insertComment = true;
			} else if (isArray(child)) {
				childrenResult.push('<!---->');
				childrenResult.push(renderChildren(child));
				childrenResult.push('<!--!-->');
				insertComment = true;
			} else {
				insertComment = false;
				childrenResult.push(renderNode(child, context, false));
			}
		}
		return childrenResult.join('');
	} else if (!isInvalid(children)) {
		if (isStringOrNumber(children)) {
			return escapeText(children);
		} else {
			return renderNode(children, context, false) || '';
		}
	}
	return '';
}

function renderStyleToString(style) {
	if (isStringOrNumber(style)) {
		return style;
	} else {
		const styles = [];
		const keys = Object.keys(style);

		for (let i = 0; i < keys.length; i++) {
			const styleName = keys[i];
			const value = style[styleName];
			const px = isNumber(value) && !isUnitlessNumber[styleName] ? 'px' : '';

			if (!isNullOrUndef(value)) {
				styles.push(`${ toHyphenCase(styleName) }:${ escapeAttr(value) }${ px };`);
			}
		}
		return styles.join();
	}
}

function renderNode(node, context, isRoot) {
	if (!isInvalid(node)) {
		const bp = node.bp;
		const tag = node.tag || (bp && bp.tag);
		const outputAttrs = [];
		const className = node.className;
		const style = node.style;

		if (isFunction(tag)) {
			return renderComponent(tag, node.attrs, node.children, context, isRoot);
		}
		if (!isNullOrUndef(className)) {
			outputAttrs.push('class="' + escapeAttr(className) + '"');
		}
		if (!isNullOrUndef(style)) {
			outputAttrs.push('style="' + renderStyleToString(style) + '"');
		}
		const attrs = node.attrs;
		let attrKeys = (attrs && Object.keys(attrs)) || [];
		let html = '';

		if (bp && bp.hasAttrs === true) {
			attrKeys = bp.attrKeys = bp.attrKeys ? bp.attrKeys.concat(attrKeys) : attrKeys;
		}
		attrKeys.forEach((attrsKey, i) => {
			const attr = attrKeys[i];
			const value = attrs[attr];

			if (attr === 'dangerouslySetInnerHTML') {
				html = value.__html;
			} else {
				if (isStringOrNumber(value)) {
					outputAttrs.push(escapeAttr(attr) + '="' + escapeAttr(value) + '"');
				} else if (isTrue(value)) {
					outputAttrs.push(escapeAttr(attr));
				}
			}
		});

		if (isRoot) {
			outputAttrs.push('data-infernoroot');
		}
		if (isVoidElement(tag)) {
			return `<${ tag }${ outputAttrs.length > 0 ? ' ' + outputAttrs.join(' ') : '' }>`;
		} else {
			return `<${ tag }${ outputAttrs.length > 0 ? ' ' + outputAttrs.join(' ') : '' }>${ html || renderChildren(node.children, context) }</${ tag }>`;
		}
	}
}

export default function renderToString(node) {
	return renderNode(node, null, false);
}

export function renderToStaticMarkup(node) {
	return renderNode(node, null, true);
}
