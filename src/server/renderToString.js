import { isArray, isStringOrNumber, isNullOrUndefined, isInvalidNode, isFunction, addChildrenToProps, isStatefulComponent } from './../core/utils';

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

function renderNode(node, context, isRoot) {
	if (!isInvalidNode(node)) {
		const bp = node.bp;
		const tag = node.tag || (bp && bp.tag);
		const outputAttrs = [];
		const className = node.className || (bp && bp.className);

		if (isFunction(tag)) {
			return renderComponent(tag, node.attrs, node.children, context, isRoot);
		}
		if (!isNullOrUndefined(className)) {
			outputAttrs.push('class="' + className + '"');
		}
		const attrs = node.attrs;

		if (!isNullOrUndefined(attrs)) {
			const attrsKeys = Object.keys(attrs);

			attrsKeys.forEach((attrsKey, i) => {
				const attr = attrsKeys[i];

				outputAttrs.push(attr + '="' + attrs[attr] + '"');
			});
		}
		if (isRoot) {
			outputAttrs.push('data-infernoroot');
		}
		return `<${ tag }${ outputAttrs.length > 0 ? ' ' + outputAttrs.join(' ') : '' }>${ renderChildren(node.children, context) }</${ tag }>`;
	}
}

export default function renderToString(node, noMetadata) {
	return renderNode(node, null, !noMetadata);
}
