import { isArray, isStringOrNumber, isFunction, isNullOrUndefined, addChildrenToProps, isStatefulComponent, isString, isInvalidNode, isPromise } from '../core/utils';
import { recyclingEnabled, recycle } from './recycling';
import { appendText, createElement, SVGNamespace, MathNamespace } from './utils';
import { patchAttribute, patchStyle } from './patching';
import { handleEvent } from './events';
import { diffNodes } from './diffing';

// TODO!  Need to be re-written to gain bette performance. I can't do it. K.F
export function mountChildren(children, parentDom, namespace, lifecycle, context, instance) {
	if (isArray(children)) {
		for (let i = 0; i < children.length; i++) {
			const child = children[i];

			if (isStringOrNumber(child)) {
				appendText(child, parentDom, false);
			} else if (!isNullOrUndefined(child) && isArray(child)) {
				mountChildren(child, parentDom, namespace, lifecycle, context, instance);
			} else if (isPromise(child)) {
				const placeholder = document.createTextNode('');

				child.then(node => {
					const dom = mountNode(node, null, namespace, lifecycle, context, instance);

					parentDom.replaceChild(dom, placeholder);
				});
				parentDom.appendChild(placeholder);
			} else {
				mountNode(child, parentDom, namespace, lifecycle, context, instance);
			}
		}
	} else {
		if (isStringOrNumber(children)) {
			appendText(children, parentDom, true);
		} else if (isPromise(children)) {
			const placeholder = document.createTextNode('');

			children.then(node => {
				const dom = mountNode(node, null, namespace, lifecycle, context, instance);

				parentDom.replaceChild(dom, placeholder);
			});
			parentDom.appendChild(placeholder);
		} else {
			mountNode(children, parentDom, namespace, lifecycle, context, instance);
		}
	}
}

function mountRef(instance, value, dom) {
	if (!isNullOrUndefined(instance) && isString(value)) {
		instance.refs[value] = dom;
	}
}

function mountComponent(parentNode, Component, props, hooks, children, parentDom, lifecycle, context) {
	props = addChildrenToProps(children, props);

	let dom;
	if (isStatefulComponent(Component)) {
		const instance = new Component(props);
		instance._diffNodes = diffNodes;

		const childContext = instance.getChildContext();
		if (!isNullOrUndefined(childContext)) {
			context = { ...context, ...childContext };
		}
		instance.context = context;

		instance.componentWillMount();
		const node = instance.render();

		if (!isNullOrUndefined(node)) {
			dom = mountNode(node, null, null, lifecycle, context, instance);
			instance._lastNode = node;
			if (parentDom !== null) { // avoid DEOPT
				parentDom.appendChild(dom);
			}
			lifecycle.addListener(instance.componentDidMount);
		}

		parentNode.dom = dom;
		parentNode.instance = instance;
		return dom;
	}
	if (!isNullOrUndefined(hooks)) {
		if (!isNullOrUndefined(hooks.componentWillMount)) {
			hooks.componentWillMount(null, props);
		}
		if (!isNullOrUndefined(hooks.componentDidMount)) {
			lifecycle.addListener(() => {
				hooks.componentDidMount(dom, props);
			});
		}
	}

	/* eslint new-cap: 0 */
	const node = Component(props);
	dom = mountNode(node, null, null, lifecycle, context, null);

	parentNode.instance = node;

	if (parentDom !== null) { // avoid DEOPT
		parentDom.appendChild(dom);
	}
	parentNode.dom = dom;
	return dom;
}

function mountEvents(events, dom) {
	const allEvents = Object.keys(events);

	for (let i = 0; i < allEvents.length; i++) {
		const event = allEvents[i];
		if (isString(event)) {
			handleEvent(event, dom, events[event]);
		}
	}
}

function placeholder(node, parentDom) {
	const dom = document.createTextNode('');

	if (parentDom !== null) {
		parentDom.appendChild(dom);
	}
	if (!isNullOrUndefined(node)) {
		node.dom = dom;
	}
	return dom;
}

export function mountNode(node, parentDom, namespace, lifecycle, context, instance) {
	if (isInvalidNode(node) || isArray(node)) {
		return placeholder(node, parentDom);
	}

	let dom;
	if (isStringOrNumber(node)) {
		dom = document.createTextNode(node);

		if (parentDom !== null) {
			parentDom.appendChild(dom);
		}
		return dom;
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
	const tag = node.tag;

	if (tag === null) {
		return placeholder(node, parentDom);
	}
	if (isFunction(tag)) {
		return mountComponent(node, tag, node.attrs || {}, node.hooks, node.children, parentDom, lifecycle, context);
	}
	namespace = namespace || tag === 'svg' ? SVGNamespace : tag === 'math' ? MathNamespace : null;

	const tpl = node.tpl;
	if (!isNullOrUndefined(tpl) && !isNullOrUndefined(tpl.dom)) {
		dom = tpl.dom.cloneNode(true);
	} else {
		if (!isString(tag)) {
			throw Error('Inferno Error: Expected function or string for element tag type');
		}
		dom = createElement(tag, namespace);
	}
	const children = node.children;
	const attrs = node.attrs;
	const events = node.events;
	const hooks = node.hooks;
	const className = node.className;
	const style = node.style;

	if (!isNullOrUndefined(hooks)) {
		if (!isNullOrUndefined(hooks.created)) {
			hooks.created(dom);
		}
		if (!isNullOrUndefined(hooks.attached)) {
			lifecycle.addListener(() => {
				hooks.attached(dom);
			});
		}
	}
	if (!isNullOrUndefined(events)) {
		mountEvents(events, dom);
	}
	if (!isInvalidNode(children)) {
		mountChildren(children, dom, namespace, lifecycle, context, instance);
	}
	if (!isNullOrUndefined(attrs)) {
		mountAttributes(attrs, dom, instance);
	}
	if (!isNullOrUndefined(className)) {
		dom.className = className;
	}
	if (!isNullOrUndefined(style)) {
		patchStyle(null, style, dom);
	}
	node.dom = dom;
	if (parentDom !== null) {
		parentDom.appendChild(dom);
	}
	return dom;
}

function mountAttributes(attrs, dom, instance) {
	const attrsKeys = Object.keys(attrs);

	for (let i = 0; i < attrsKeys.length; i++) {
		const attr = attrsKeys[i];

		if (attr === 'ref') {
			mountRef(instance, attrs[attr], dom);
		} else {
			patchAttribute(attr, attrs[attr], dom);
		}
	}
}
