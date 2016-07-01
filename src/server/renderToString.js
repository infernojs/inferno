import { isArray, isStringOrNumber, isNullOrUndefined, isInvalidNode, isFunction, addChildrenToProps, isStatefulComponent, isNumber } from './../core/utils';
import { isUnitlessNumber } from '../DOM/utils';

function renderComponent(Component, props, children, context, isRoot) {
	props = addChildrenToProps(children, props);

	if (isStatefulComponent(Component)) {
		const instance = new Component(props);
		const childContext = instance.getChildContext();

		if (!isNullOrUndefined(childContext)) {
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

			if (isStringOrNumber(child)) {
				if (insertComment === true) {
					childrenResult.push('<!-- -->');
				}
				childrenResult.push(child);
				insertComment = true;
			} else {
				insertComment = false;
				childrenResult.push(renderNode(child, context, false));
			}
		}
		return childrenResult.join('');
	} else if (!isInvalidNode(children)) {
		if (isStringOrNumber(children)) {
			return children;
		} else {
			return renderNode(children, context, false) || '';
		}
	}
	return '';
}

function toHyphenCase(str) {
	return str.replace(/([a-zA-Z])(?=[A-Z])/g, '$1-').toLowerCase();
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

			if (!isNullOrUndefined(value)) {
				styles.push(`${ toHyphenCase(styleName) }:${ value }${ px };`);
			}
		}
		return styles.join();
	}
}

function renderNode(node, context, isRoot) {
	if (!isInvalidNode(node)) {
		const bp = node.bp;
		const tag = node.tag || (bp && bp.tag);
		const outputAttrs = [];
		const className = node.className;
		const style = node.style;

		if (isFunction(tag)) {
			return renderComponent(tag, node.attrs, node.children, context, isRoot);
		}
		if (!isNullOrUndefined(className)) {
			outputAttrs.push('class="' + className + '"');
		}
		if (!isNullOrUndefined(style)) {
			outputAttrs.push('style="' + renderStyleToString(style) + '"');
		}
		const attrs = node.attrs;
		let attrKeys = (attrs && Object.keys(attrs)) || [];

		if (bp && bp.hasAttrs === true) {
			attrKeys = bp.attrKeys = bp.attrKeys ? bp.attrKeys.concat(attrKeys) : attrKeys;
		}
		attrKeys.forEach((attrsKey, i) => {
			const attr = attrKeys[i];

			outputAttrs.push(attr + '="' + attrs[attr] + '"');
		});

		if (isRoot) {
			outputAttrs.push('data-infernoroot');
		}
		return `<${ tag }${ outputAttrs.length > 0 ? ' ' + outputAttrs.join(' ') : '' }>${ renderChildren(node.children, context) }</${ tag }>`;
	}
}

export default function renderToString(node, noMetadata) {
	return renderNode(node, null, !noMetadata);
}
