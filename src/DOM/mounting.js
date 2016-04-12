import { isArray, isStringOrNumber, isFunction, isNullOrUndefined, addChildrenToProps, isStatefulComponent, isString, isInvalidNode, isPromise, replaceInArray } from './../core/utils';
import { recyclingEnabled, recycle } from './recycling';
import { appendText, createElement, createVirtualFragment, insertOrAppendNonKeyed, createEmptyTextNode, selectValue, placeholder, handleAttachedHooks } from './utils';
import { patchAttribute, patchStyle } from './patching';
import { diffNodes } from './diffing';

export function mountNode(node, parentDom, lifecycle, context, instance) {
	if (isInvalidNode(node) || isArray(node)) {
		return placeholder(node, parentDom);
	}

	const tpl = node.tpl;

	if (recyclingEnabled) {
		const dom = recycle(node, tpl, lifecycle, context, instance);

		if (dom !== null) {
			if (parentDom !== null) {
				parentDom.appendChild(dom);
			}
			return dom;
		}
	}

	if (tpl === undefined) {
		return appendNode(node, parentDom, lifecycle, context, instance);
	} else {
		return appendNodeWithTemplate(node, tpl, parentDom, lifecycle, context, instance);
	}
}
function handleSelects(node) {
	if (node.tag === 'select') {
		selectValue(node);
	}
}

function appendNodeWithTemplate(node, tpl, parentDom, lifecycle, context, instance) {
	const tag = node.tag;

	if (tpl.isComponent === true) {
		return mountComponent(node, tag, node.attrs || {}, node.hooks, node.children, parentDom, lifecycle, context);
	}
	const dom = tpl.dom.cloneNode(false);

	node.dom = dom;
	if (tpl.hasHooks === true) {
		handleAttachedHooks(node.hooks, lifecycle, dom);
	}
	// tpl.childrenType:
	// 0: no children
	// 1: text node
	// 2: single child
	// 3: multiple children
	// 4: multiple children (keyed)
	// 5: variable children (defaults to no optimisation)

	switch (tpl.childrenType) {
		case 1:
			appendText(node.children, dom, true);
			break;
		case 2:
			mountNode(node.children, dom, lifecycle, context, instance);
			break;
		case 3:
			mountArrayChildren(node, node.children, dom, lifecycle, context, instance);
			break;
		case 4:
			mountArrayChildrenWithKeys(node.children, dom, lifecycle, context, instance);
			break;
		case 5:
			mountChildren(node, node.children, dom, lifecycle, context, instance);
			break;
		default:
			break;
	}

	if (tpl.hasAttrs === true) {
		handleSelects(node);
		const attrs = node.attrs;

		if (tpl.attrKeys === null) {
			tpl.attrKeys = Object.keys(attrs);
		}
		const attrKeys = tpl.attrKeys;

		mountAttributes(attrs, attrKeys, dom, instance);
	}
	if (tpl.hasClassName === true) {
		dom.className = node.className;
	}
	if (tpl.hasStyle === true) {
		patchStyle(null, node.style, dom);
	}
	if (tpl.hasEvents === true) {
		const events = node.events;

		if (tpl.eventKeys === null) {
			tpl.eventKeys = Object.keys(events);
		}
		const eventKeys = tpl.eventKeys;

		mountEvents(events, eventKeys, dom);
	}
	if (parentDom !== null) {
		parentDom.appendChild(dom);
	}
	return dom;
}

function appendNode(node, parentDom, lifecycle, context, instance) {
	const tag = node.tag;

	if (tag === null) {
		return placeholder(node, parentDom);
	}
	if (isFunction(tag)) {
		return mountComponent(node, tag, node.attrs || {}, node.hooks, node.children, parentDom, lifecycle, context);
	}
	if (!isString(tag) || tag === '') {
		throw Error('Inferno Error: Expected function or string for element tag type');
	}
	const dom = createElement(tag);
	const children = node.children;
	const attrs = node.attrs;
	const events = node.events;
	const hooks = node.hooks;
	const className = node.className;
	const style = node.style;

	node.dom = dom;
	if (!isNullOrUndefined(hooks)) {
		handleAttachedHooks(hooks, lifecycle, dom);
	}
	if (!isInvalidNode(children)) {
		mountChildren(node, children, dom, lifecycle, context, instance);
	}
	if (!isNullOrUndefined(attrs)) {
		handleSelects(node);
		mountAttributes(attrs, Object.keys(attrs), dom, instance);
	}
	if (!isNullOrUndefined(className)) {
		dom.className = className;
	}
	if (!isNullOrUndefined(style)) {
		patchStyle(null, style, dom);
	}
	if (!isNullOrUndefined(events)) {
		mountEvents(events, Object.keys(events), dom);
	}
	if (parentDom !== null) {
		parentDom.appendChild(dom);
	}
	return dom;
}

function appendPromise(child, parentDom, domChildren, lifecycle, context, instance) {
	const placeholder = createEmptyTextNode();
	domChildren && domChildren.push(placeholder);

	child.then(node => {
		// TODO check for text nodes and arrays
		const dom = mountNode(node, null, lifecycle, context, instance);

		parentDom.replaceChild(dom, placeholder);
		domChildren && replaceInArray(domChildren, placeholder, dom);
	});
	parentDom.appendChild(placeholder);
}

export function mountArrayChildrenWithKeys(children, parentDom, lifecycle, context, instance) {
	for (let i = 0; i < children.length; i++) {
		mountNode(children[i], parentDom, lifecycle, context, instance);
	}
}

export function mountArrayChildren(node, children, parentDom, lifecycle, context, instance) {
	let domChildren = null;
	let isNonKeyed = false;
	let hasKeyedAssumption = false;

	for (let i = 0; i < children.length; i++) {
		const child = children[i];

		if (isStringOrNumber(child)) {
			isNonKeyed = true;
			domChildren = domChildren || [];
			domChildren.push(appendText(child, parentDom, false));
		} else if (!isNullOrUndefined(child) && isArray(child)) {
			const virtualFragment = createVirtualFragment();

			isNonKeyed = true;
			mountArrayChildren(node, child, virtualFragment, lifecycle, context, instance);
			insertOrAppendNonKeyed(parentDom, virtualFragment);
			domChildren = domChildren || [];
			domChildren.push(virtualFragment);
		} else if (isPromise(child)) {
			appendPromise(child, parentDom, domChildren, lifecycle, context, instance);
		} else {
			const domNode = mountNode(child, parentDom, lifecycle, context, instance);

			if (isNonKeyed || (!hasKeyedAssumption && child && isNullOrUndefined(child.key))) {
				isNonKeyed = true;
				domChildren = domChildren || [];
				domChildren.push(domNode);
			} else if (isInvalidNode(child)) {
				isNonKeyed = true;
				domChildren = domChildren || [];
				domChildren.push(domNode);
			} else if (hasKeyedAssumption === false) {
				hasKeyedAssumption = true;
			}
		}
	}
	if (domChildren !== null && domChildren.length > 1 && isNonKeyed === true) {
		node.domChildren = domChildren;
	}
}

function mountChildren(node, children, parentDom, lifecycle, context, instance) {
	if (isArray(children)) {
		mountArrayChildren(node, children, parentDom, lifecycle, context, instance);
	} else if (isStringOrNumber(children)) {
		appendText(children, parentDom, true);
	} else if (isPromise(children)) {
		appendPromise(children, parentDom, null, lifecycle, context, instance);
	} else {
		mountNode(children, parentDom, lifecycle, context, instance);
	}
}

function mountRef(instance, value, dom) {
	if (!isInvalidNode(instance) && isString(value)) {
		instance.refs[value] = dom;
	}
}

export function mountEvents(events, eventKeys, dom) {
	for (let i = 0; i < eventKeys.length; i++) {
		const event = eventKeys[i];

		dom[event] = events[event];
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
			dom = mountNode(node, null, lifecycle, context, instance);
			instance._lastNode = node;
			if (parentDom !== null) {
				parentDom.appendChild(dom);
			}
			instance.componentDidMount();
			instance.componentDidUpdate();
		}

		parentNode.dom = dom;
		parentNode.instance = instance;
	} else {
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
		dom = mountNode(node, null, lifecycle, context, null);

		parentNode.instance = node;

		if (parentDom !== null) {
			parentDom.appendChild(dom);
		}
		parentNode.dom = dom;
	}
	return dom;
}

function mountAttributes(attrs, attrKeys, dom, instance) {
	for (let i = 0; i < attrKeys.length; i++) {
		const attr = attrKeys[i];

		if (attr === 'ref') {
			mountRef(instance, attrs[attr], dom);
		} else {
			patchAttribute(attr, attrs[attr], dom);
		}
	}
}
