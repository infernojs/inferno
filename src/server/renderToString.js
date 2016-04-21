import { isArray, isStringOrNumber, isNullOrUndefined, isInvalidNode, isFunction, addChildrenToProps, isStatefulComponent } from './../core/utils';

function renderComponent(Component, props, children, context) {
	props = addChildrenToProps(children, props);

	if (isStatefulComponent(Component)) {
		const instance = new Component(props);
		const childContext = instance.getChildContext();

		if (!isNullOrUndefined(childContext)) {
			context = { ...context, ...childContext };
		}
		instance.context = context;
		// Block setting state - we should render only once, using latest state
		instance._pendingSetState = true;
		instance.componentWillMount();
		const shouldUpdate = instance.shouldComponentUpdate();
		if (shouldUpdate) {
			instance.componentWillUpdate();
			const pendingState = instance._pendingState;
			const oldState = instance.state;
			instance.state = { ...oldState, ...pendingState };
		}
		const node = instance.render();
		instance._pendingSetState = false;
		return renderNode(node, context);
	} else {
		const node = Component(props);
		return renderNode(node, context);
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
				childrenResult.push(renderNode(child, context));
			}
		}
		return childrenResult.join('');
	} else if (!isInvalidNode(children)) {
		if (isStringOrNumber(children)) {
			return children;
		} else {
			return renderNode(children, context);
		}
	}
}

function renderNode(node, context) {
	if (!isInvalidNode(node)) {
		const tag = node.tag;
		const outputAttrs = [];

		if (isFunction(tag)) {
			return renderComponent(tag, node.attrs, node.children, context);
		}
		if (!isNullOrUndefined(node.className)) {
			outputAttrs.push('class="' + node.className + '"');
		}
		const attrs = node.attrs;

		if (!isNullOrUndefined(attrs)) {
			const attrsKeys = Object.keys(attrs);

			attrsKeys.forEach((attrsKey, i) => {
				const attr = attrsKeys[i];

				outputAttrs.push(attr + '="' + attrs[attr] + '"');
			});
		}

		return `<${ tag }${ outputAttrs.length > 0 ? ' ' + outputAttrs.join(' ') : '' }>${ renderChildren(node.children, context) || '' }</${ tag }>`;
	}
}

export default function renderToString(node) {
	return renderNode(node, null);
}
