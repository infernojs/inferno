import { isArray, isStringOrNumber, isFunction, isNullOrUndefined, addChildrenToProps, isStatefulComponent, isString, isInvalidNode } from '../core/utils';
import { recyclingEnabled, recycle } from './recycling';
import { appendText, createElement, SVGNamespace, MathNamespace } from './utils';
import { patchAttribute, patchStyle } from './patching';
import { handleEvent } from './events';
import { diffNodes } from './diffing';

// TODO!  Need to be re-written to gain bette performance. I can't do it. K.F
export function mountChildren(children, parentDom, namespace, lifecycle, context) {
	if (isArray(children)) {
		for (let i = 0; i < children.length; i++) {
			const child = children[i];

			if (isStringOrNumber(child)) {
				appendText(child, parentDom, false);
			} else if (child && isArray(child)) {
				mountChildren(child, parentDom, namespace, lifecycle, context);
			} else {
				mountNode(child, parentDom, namespace, lifecycle, context);
			}
		}
	} else {
		if (isStringOrNumber(children)) {
			appendText(children, parentDom, true);
		} else {
			mountNode(children, parentDom, namespace, lifecycle, context);
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
			dom = mountNode(node, null, null, lifecycle, context);
			instance._lastNode = node;
			if (parentDom !== null) { // avoid DEOPT
				parentDom.appendChild(dom);
			}
			lifecycle.addListener(instance.componentDidMount);
		}

		parentNode.dom = dom;
		parentNode.instance = instance;
		return dom;
	} else {
		let dom;
		if (!isNullOrUndefined(events)) {
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
		dom = mountNode(node, null, null, lifecycle, context);

		parentNode.instance = node;

		if (parentDom !== null) { // avoid DEOPT
			parentDom.appendChild(dom);
		}
		parentNode.dom = dom;
	}
}

function mountEvents(events, allEvents, dom) {
	for (let i = 0; i < allEvents.length; i++) {
		const event = allEvents[i];
		if(isString(event)) {
			handleEvent(event, dom, events[event]);
		}
	}
}

function placeholder(node, parentDom) {
	const dom = document.createTextNode('');

	if (parentDom !== null) {
		parentDom.appendChild(dom);
	}
	if (node) {
		node.dom = dom;
	}
	return dom;
}

export function mountNode(node, parentDom, namespace, lifecycle, context) {
	let dom;

	if (isInvalidNode(node) || isArray(node)) {
		return placeholder(node, parentDom);
	}
	if (isStringOrNumber(node)) {
		const dom = document.createTextNode(node);

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
	const tpl = node.tpl;
	const tag = node.tag;

	if(tag === null) {
		return placeholder(node, parentDom);
	}

	if (isFunction(tag)) {
		return mountComponent(node, tag, node.attrs || {}, node.events, node.children, parentDom, lifecycle, context);
	}

	namespace = namespace || tag === 'svg' ? SVGNamespace : tag === 'math' ? MathNamespace : null;

	if (tpl && tpl.dom) {
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
	const className = node.className;
	const style = node.style;

	if (!isNullOrUndefined(events)) {
		const allEvents = Object.keys(events);
		let eventsCount = allEvents.length;

		if (events.click) {
			handleEvent('click', dom, events.click);
			eventsCount--;
		}
		if (events.created) {
			events.created(dom);
			eventsCount--;
		}
		if (events.attached) {
			lifecycle.addListener(() => {
				events.attached(dom);
			});
			eventsCount--;
		}
		if (eventsCount > 0) {
			mountEvents(events, allEvents, dom);
		}
	}
	if (!isInvalidNode(children)) {
		mountChildren(children, dom, namespace, lifecycle, context);
	}
	if (!isNullOrUndefined(attrs)) {
		mountAttributes(attrs, dom);
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

function mountAttributes(attrs, dom) {
	const attrsKeys = Object.keys(attrs);

	for (let i = 0; i < attrsKeys.length; i++) {
		const attr = attrsKeys[i];
		patchAttribute(attr, null, attrs[attr], dom);
	}
}