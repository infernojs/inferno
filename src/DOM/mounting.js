import { isArray, isStringOrNumber, isFunction, isNullOrUndefined, addChildrenToProps, isStatefulComponent } from '../core/utils';
import { recyclingEnabled, recycle } from './recycling';
import { appendText } from './utils';
import { patchAttribute } from './patching';
import { handleEvent } from './events';
import { diffNodes } from './diffing';

function mountChildren(children, parentDom, lifecycle, context) {
	if (isArray(children)) {
		for (let i = 0; i < children.length; i++) {
			const child = children[i];

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

	if (isStatefulComponent(Component)) {
		const instance = new Component(props);
		instance._diffNodes = diffNodes;

		const childContext = instance.getChildContext();
		if (childContext) {
			context = { ...context, ...childContext };
		}
		instance.context = context;

		instance.componentWillMount();
		const node = instance.render();
		let dom;

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
		let dom;
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

		/* eslint new-cap: 0 */
		const node = Component(props);
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
	let dom;

	if (isNullOrUndefined(node) || isArray(node)) {
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
	const children = node.children;
	const attrs = node.attrs;
	const events = node.events;

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
	if (!isNullOrUndefined(children)) {
		mountChildren(children, dom, lifecycle, context);
	}
	if (attrs) {
		mountAttributes(attrs, dom);
	}
	if (!isNullOrUndefined(node.className)) {
		dom.className = node.className;
	}
	node.dom = dom;
	if (parentDom !== null) {
		parentDom.appendChild(dom);
	}
	return dom;
}

function mountAttributes(attrs, dom) {
	for (let i = 0; i < attrs.length; i++) {
		const attr = attrs[i];
		const attrName = attr && attr.name;
		const attrVal = attr && attr.value;

		if (attrName) {
			patchAttribute(attrName, null, attrVal, dom);
		}
	}
}