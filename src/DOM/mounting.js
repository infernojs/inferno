import { isArray, isStringOrNumber, isFunction, isNullOrUndefined, addChildrenToProps, isStatefulComponent, isString, isInvalidNode, isPromise, replaceInArray } from '../core/utils';
import { recyclingEnabled, recycle } from './recycling';
import { appendText, createElement, SVGNamespace, MathNamespace, createVirtualFragment, insertOrAppend, createEmptyTextNode } from './utils';
import { patchAttribute, patchStyle } from './patching';
import { addEventToRegistry, addEventToNode, doesNotBubble } from './events';
import { diffNodes } from './diffing';
import { selectValue } from './utils';

function appendPromise(child, parentDom, domChildren, namespace, lifecycle, context, instance) {
	const placeholder = createEmptyTextNode();
	domChildren && domChildren.push(placeholder);

	child.then(node => {
		// TODO check for text nodes and arrays
		const dom = mountNode(node, null, namespace, lifecycle, context, instance);

		parentDom.replaceChild(dom, placeholder);
		domChildren && replaceInArray(domChildren, placeholder, dom);
	});
	parentDom.appendChild(placeholder);
}

export function mountChildren(node, children, parentDom, namespace, lifecycle, context, instance) {
	const domChildren = [];
	let isNonKeyed = false;
	let hasKeyedAssumption = false;

	if (isArray(children)) {
		for (let i = 0; i < children.length; i++) {
			const child = children[i];

			if (isStringOrNumber(child)) {
				isNonKeyed = true;
				domChildren.push(appendText(child, parentDom, false));
			} else if (!isNullOrUndefined(child) && isArray(child)) {
				const virtualFragment = createVirtualFragment();

				isNonKeyed = true;
				mountChildren(node, child, virtualFragment, namespace, lifecycle, context, instance);
				insertOrAppend(parentDom, virtualFragment);
				domChildren.push(virtualFragment);
			} else if (isPromise(child)) {
				appendPromise(child, parentDom, domChildren, namespace, lifecycle, context, instance);
			} else {
				const domNode = mountNode(child, parentDom, namespace, lifecycle, context, instance);

				if (isNonKeyed || (!hasKeyedAssumption && child && isNullOrUndefined(child.key))) {
					isNonKeyed = true;
					domChildren.push(domNode);
				} else if (isInvalidNode(child)) {
					isNonKeyed = true;
					domChildren.push(domNode);
				} else if (hasKeyedAssumption === false) {
					// this will be true if a single node comes back with a key, if it does, we assume the rest have keys for a perf boost
					hasKeyedAssumption = true;
				}
			}
		}
	} else {
		if (isStringOrNumber(children)) {
			appendText(children, parentDom, true);
		} else if (isPromise(children)) {
			appendPromise(children, parentDom, null, namespace, lifecycle, context, instance);
		} else {
			mountNode(children, parentDom, namespace, lifecycle, context, instance);
		}
	}
	if (domChildren.length > 1 && isNonKeyed === true) {
		node.domChildren = domChildren;
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

		if (!isNullOrUndefined(node)) {
			dom = mountNode(node, null, null, lifecycle, context, instance);
			instance._lastNode = node;
			if (parentDom !== null) { // avoid DEOPT
				parentDom.appendChild(dom);
			}
			instance.componentDidMount();
			instance.componentDidUpdate();
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

function mountEvents(events, node) {
	const allEvents = Object.keys(events);

	for (let i = 0; i < allEvents.length; i++) {
		const event = allEvents[i];

		if (doesNotBubble(event)) {
			addEventToNode(event, node, events[event]);
		} else if (isString(event)) {
			addEventToRegistry(event, node, events[event]);
		}
	}
}

function placeholder(node, parentDom) {
	const dom = createEmptyTextNode();

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
		dom = recycle(node, lifecycle, context, instance);
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
		if (!isString(tag) || tag === '') {
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

	node.dom = dom;
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
		mountEvents(events, node);
	}
	if (!isInvalidNode(children)) {
		mountChildren(node, children, dom, namespace, lifecycle, context, instance);
	}
	if (!isNullOrUndefined(attrs)) {
		mountAttributes(node, attrs, dom, instance);
	}
	// TODO! Fix this. Svg issue + booleans and empty object etc.
	// Solution? Dunno, but for empty object cast to string
	if (!isNullOrUndefined(className)) {
		dom.className = className;
	}
	if (!isNullOrUndefined(style)) {
		patchStyle(null, style, dom);
	}
	if (parentDom !== null) {
		parentDom.appendChild(dom);
	}
	return dom;
}


function mountAttributes(node, attrs, dom, instance) {
	// IMPORTANT! This has to be executed BEFORE 'attrsKeys' are created
	if (node.tag === 'select') {
		selectValue(node);
	}
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
