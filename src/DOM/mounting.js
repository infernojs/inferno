import { isArray, isStringOrNumber, isFunction, isNullOrUndefined } from '../core/utils';
import { recyclingEnabled } from './recycling';
import { appendText } from './utils';
import { patchAttribute } from './patching';

function mountChildren(children, parentDom, lifecycle, context) {
	if (isArray(children)) {
		for (var i = 0; i < children.length; i++) {
			var child = children[i];

			if (isStringOrNumber(child)) {
				appendText(child, parentDom, false);
			} else {
				mountNode(child, parentDom, lifecycle, context);
			}
		}
	} else {
		if (isStringOrNumber(children)) {
			appendText(children, parentDom, true);
		} else {
			mountNode(children, parentDom, lifecycle, context);
		}
	}
}

function mountComponent(parentNode, Component, props, events, children, parentDom, lifecycle, context) {
	props = addChildrenToProps(children, props);

	if(isStatefulComponent(Component)) {
		var instance = new Component(props);
		instance._diffNodes = diffNodes;

		var childContext = instance.getChildContext();
		if (childContext) {
			context = _extends({}, context, childContext);
		}
		instance.context = context;

		instance.componentWillMount();
		var node = instance.render();
		var dom;

		if (node) {
			dom = mountNode(node, null, lifecycle, context);
			instance._lastNode = node;
			if (parentDom) {
				parentDom.appendChild(dom);
			}
			lifecycle.addListener(instance.componentDidMount);
		}

		parentNode.dom = dom;
		parentNode.instance = instance;
		return dom;
	} else {
		var dom;
		if (events) {
			if (events.componentWillMount) {
				events.componentWillMount(null, props);
			}
			if (events.componentDidMount) {
				lifecycle.addListener(() => {
					events.componentDidMount(dom, props);
				});
			}
		}
		var node = Component(props);
		dom = mountNode(node, null, lifecycle, context);

		parentNode.instance = node;
		if (parentDom) {
			parentDom.appendChild(dom);
		}
		parentNode.dom = dom;

		return dom;
	}
}

export function mountNode(node, parentDom, lifecycle, context) {
	var dom;

	if (node === null) {
		return;
	}
	if (node == null || isArray(node)) {
		return;
	}
	if (isStringOrNumber(node)) {
		return document.createTextNode(node);
	}
	if (recyclingEnabled) {
		dom = recycle(node, lifecycle, context);
		if (dom) {
			if (parentDom) {
				parentDom.appendChild(dom);
			}
			return dom;
		}
	}
	if (isFunction(node.tag)) {
		return mountComponent(node, node.tag, node.attrs, node.events, node.children, parentDom, lifecycle, context);
	}
	if (node.static.dom) {
		dom = node.static.dom.cloneNode(true);
	} else {
		dom = document.createElement(node.tag);
	}
	var children = node.children;
	var attrs = node.attrs;
	var events = node.events;

	if (events) {
		if (events.click) {
			handleEvent('click', dom, events.click);
		}
		if (events.created) {
			events.created(dom);
		}
		if (events.attached) {
			lifecycle.addListener(() => {
				events.attached(dom);
			});
		}
	}
	if (attrs) {
		mountAttributes(attrs, dom);
	}

	if (!isNullOrUndefined(children)) {
		mountChildren(children, dom, lifecycle, context);
	}
	node.dom = dom;
	if (parentDom !== null) {
		parentDom.appendChild(dom);
	}
	return dom;
}

function mountAttributes(attrs, dom) {
	for (var i = 0; i < attrs.length; i++) {
		var attr = attrs[i];
		var attrName = attr && attr.name;
		var attrVal = attr && attr.value;

		if (attrName) {
			patchAttribute(attrName, null, attrVal, dom);
		}
	}
}