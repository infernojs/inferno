import { isArray, isStringOrNumber, isFunction, isNullOrUndefined, addChildrenToProps, isStatefulComponent, isString, isInvalidNode, isPromise, replaceInArray, getRefInstance } from './../core/utils';
import { recyclingEnabled, recycle } from './recycling';
import { appendText, documentCreateElement, createVirtualFragment, createEmptyTextNode, selectValue, placeholder, handleAttachedHooks, createNullNode } from './utils';
import { patchAttribute, patchStyle, patch } from './patching';
import { handleLazyAttached } from './lifecycle';
import { componentToDOMNodeMap } from './rendering';

export function mount(input, parentDom, lifecycle, context, instance, isSVG) {
	if (isArray(input)) {
		return placeholder(input, parentDom);
	}
	if (isInvalidNode(input)) {
		return null;
	}
	const bp = input.bp;

	if (recyclingEnabled) {
		const dom = recycle(input, bp, lifecycle, context, instance);

		if (dom !== null) {
			if (parentDom !== null) {
				parentDom.appendChild(dom);
			}
			return dom;
		}
	}
	if (bp === undefined) {
		return appendNode(input, parentDom, lifecycle, context, instance, isSVG);
	} else {
		return appendNodeWithTemplate(input, bp, parentDom, lifecycle, context, instance);
	}
}

export function handleSelects(node) {
	if (node.tag === 'select') {
		selectValue(node);
	}
}

export function mountBlueprintAttrs(node, bp, dom, instance) {
	handleSelects(node);
	const attrs = node.attrs;

	if (bp.attrKeys === null) {
		const newKeys = Object.keys(attrs);
		bp.attrKeys = bp.attrKeys ? bp.attrKeys.concat(newKeys) : newKeys;
	}
	const attrKeys = bp.attrKeys;

	mountAttributes(node, attrs, attrKeys, dom, instance);
}

export function mountBlueprintEvents(node, bp, dom) {
	const events = node.events;

	if (bp.eventKeys === null) {
		bp.eventKeys = Object.keys(events);
	}
	const eventKeys = bp.eventKeys;

	mountEvents(events, eventKeys, dom);
}

function appendNodeWithTemplate(node, bp, parentDom, lifecycle, context, instance) {
	const tag = node.tag;

	if (bp.isComponent === true) {
		return mountComponent(node, tag, node.attrs || {}, node.hooks, node.children, instance, parentDom, lifecycle, context);
	}
	const dom = documentCreateElement(bp.tag, bp.isSVG);

	node.dom = dom;
	if (bp.hasHooks === true) {
		handleAttachedHooks(node.hooks, lifecycle, dom);
	}
	if (bp.lazy === true) {
		handleLazyAttached(node, lifecycle, dom);
	}
	// bp.childrenType:
	// 0: no children
	// 1: text node
	// 2: single child
	// 3: multiple children
	// 4: multiple children (keyed)
	// 5: variable children (defaults to no optimisation)

	switch (bp.childrenType) {
		case 1:
			appendText(node.children, dom, true);
			break;
		case 2:
			mount(node.children, dom, lifecycle, context, instance);
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

	if (bp.hasAttrs === true) {
		mountBlueprintAttrs(node, bp, dom, instance);
	}
	if (bp.hasClassName === true) {
		dom.className = node.className;
	}
	if (bp.hasStyle === true) {
		patchStyle(null, node.style, dom);
	}
	if (bp.hasEvents === true) {
		mountBlueprintEvents(node, bp, dom);
	}
	if (parentDom !== null) {
		parentDom.appendChild(dom);
	}
	return dom;
}

function appendNode(node, parentDom, lifecycle, context, instance, isSVG) {
	const tag = node.tag;

	if (tag === null) {
		return placeholder(node, parentDom);
	}
	if (isFunction(tag)) {
		return mountComponent(node, tag, node.attrs || {}, node.hooks, node.children, instance, parentDom, lifecycle, context);
	}
	if (!isString(tag) || tag === '') {
		throw Error('Inferno Error: Expected function or string for element tag type');
	}
	if (tag === 'svg') {
		isSVG = true;
	}
	const dom = documentCreateElement(tag, isSVG);
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
		mountChildren(node, children, dom, lifecycle, context, instance, isSVG);
	}
	if (!isNullOrUndefined(attrs)) {
		handleSelects(node);
		mountAttributes(node, attrs, Object.keys(attrs), dom, instance);
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

function appendPromise(child, parentDom, lifecycle, context, instance, isSVG) {
	const placeholder = createEmptyTextNode();

	child.then(node => {
		// TODO check for text nodes and arrays
		const dom = mount(node, null, lifecycle, context, instance, isSVG);
		if (parentDom !== null && !isInvalidNode(dom)) {
			parentDom.replaceChild(dom, placeholder);
		}
	});
	parentDom.appendChild(placeholder);
}

export function mountArrayChildrenWithKeys(children, parentDom, lifecycle, context, instance) {
	for (let i = 0; i < children.length; i++) {
		mount(children[i], parentDom, lifecycle, context, instance);
	}
}

export function mountArrayChildren(node, children, parentDom, lifecycle, context, instance, isSVG) {
	let hasNonKeyedChildren = false;

	for (let i = 0; i < children.length; i++) {
		const child = children[i];

		if (isStringOrNumber(child)) {
			hasNonKeyedChildren = true;
			appendText(child, parentDom, false);
		} else if (!isNullOrUndefined(child) && isArray(child)) {
			// we do this because we don't flatten keyed lists
			hasNonKeyedChildren = true;
			mountArrayChildren(node, child, parentDom, lifecycle, context, instance, isSVG);
		} else if (isPromise(child)) {
			appendPromise(child, parentDom, lifecycle, context, instance, isSVG);
		} else {
			const domNode = mount(child, parentDom, lifecycle, context, instance, isSVG);

			if (!hasNonKeyedChildren) {
				if (!isNullOrUndefined(child) && isNullOrUndefined(child.key)) {
					hasNonKeyedChildren = true;
				} else if (isInvalidNode(child)) {
					hasNonKeyedChildren = true;
				}
			}
		}
	}
	node.hasNonKeyedChildren = hasNonKeyedChildren;
}

function mountChildren(node, children, parentDom, lifecycle, context, instance, isSVG) {
	if (isArray(children)) {
		mountArrayChildren(node, children, parentDom, lifecycle, context, instance, isSVG);
	} else if (isStringOrNumber(children)) {
		appendText(children, parentDom, true);
	} else if (isPromise(children)) {
		appendPromise(children, parentDom, null, lifecycle, context, instance, isSVG);
	} else {
		mount(children, parentDom, lifecycle, context, instance, isSVG);
	}
}

export function mountRef(instance, value, refValue) {
	if (!isInvalidNode(instance) && isString(value)) {
		instance.refs[value] = refValue;
	}
}

export function mountEvents(events, eventKeys, dom) {
	for (let i = 0; i < eventKeys.length; i++) {
		const event = eventKeys[i];

		dom[event] = events[event];
	}
}

export function mountComponent(parentNode, Component, props, hooks, children, lastInstance, parentDom, lifecycle, context) {
	props = addChildrenToProps(children, props);

	let dom;
	if (isStatefulComponent(Component)) {
		const instance = new Component(props);

		instance._patch = patch;
		instance._componentToDOMNodeMap = componentToDOMNodeMap;
		if (!isNullOrUndefined(lastInstance) && props.ref) {
			mountRef(lastInstance, props.ref, instance);
		}
		const childContext = instance.getChildContext();

		if (!isNullOrUndefined(childContext)) {
			context = Object.assign({}, context, childContext);
		}
		instance.context = context;
		instance._unmounted = false;
		instance._parentNode = parentNode;
		if (lastInstance) {
			instance._parentComponent = lastInstance;
		}
		instance._pendingSetState = true;
		instance.componentWillMount();
		const node = instance.render();

		instance._pendingSetState = false;
		if (!isInvalidNode(node)) {
			dom = mount(node, null, lifecycle, context, instance, false);
			instance._lastNode = node;
			instance.componentDidMount();
		} else {
			instance._lastNode = createNullNode();
			dom = instance._lastNode.dom;
		}
		if (parentDom !== null && !isInvalidNode(dom)) {
			parentDom.appendChild(dom);
		}
		componentToDOMNodeMap.set(instance, dom);
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
		const node = Component(props, context);
		dom = mount(node, null, lifecycle, context, null, false);

		parentNode.instance = node;

		if (parentDom !== null && !isInvalidNode(dom)) {
			parentDom.appendChild(dom);
		}
		parentNode.dom = dom;
	}
	return dom;
}

export function mountAttributes(node, attrs, attrKeys, dom, instance) {
	for (let i = 0; i < attrKeys.length; i++) {
		const attr = attrKeys[i];

		if (attr === 'ref') {
			mountRef(getRefInstance(node, instance), attrs[attr], dom);
		} else {
			patchAttribute(attr, null, attrs[attr], dom);
		}
	}
}
