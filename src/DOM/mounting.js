import {
	isArray,
	isStringOrNumber,
	isFunction,
	isNullOrUndefined,
	addChildrenToProps,
	isStatefulComponent,
	isString,
	isInvalidNode,
	getRefInstance,
	isNull
} from './../core/utils';
import { recyclingEnabled, recycle } from './recycling';
import {
	appendText,
	documentCreateElement,
	createVirtualFragment,
	createEmptyTextNode,
	selectValue,
	handleAttachedHooks,
	isVText,
	isVPlaceholder,
	isVList,
	isVNode,
	insertOrAppend
} from './utils';
import { patchAttribute, patchStyle, patch } from './patching';
import { handleLazyAttached } from './lifecycle';
import { componentToDOMNodeMap } from './rendering';
import {
	createVText,
	createVPlaceholder,
	createVList
} from '../core/shapes';

export function mount(input, parentDom, lifecycle, context, instance, isSVG) {
	if (isVPlaceholder(input)) {
		return mountVPlaceholder(input, parentDom);
	} else if (isVText(input)) {
		return mountVText(input, parentDom);
	} else if (isVList(input)) {
		return mountVList(input, parentDom, lifecycle, context, instance, isSVG);
	} else if (isVNode(input)) {
		const bp = input.bp;

		if (recyclingEnabled && bp) {
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
			return appendNodeWithBlueprint(input, bp, parentDom, lifecycle, context, instance);
		}
	}
}

export function mountVList(vList, parentDom, lifecycle, context, instance, isSVG) {
	const items = vList.items;
	const pointer = document.createTextNode('');
	const dom = document.createDocumentFragment();

	mountArrayChildren(items, dom, lifecycle, context, instance, isSVG);
	vList.pointer = pointer;
	vList.dom = dom;
	dom.appendChild(pointer);
	if (parentDom) {
		insertOrAppend(parentDom, dom);
	}
	return dom;
}

export function mountVText(vText, parentDom) {
	const dom = document.createTextNode(vText.text);

	vText.dom = dom;
	if (parentDom) {
		insertOrAppend(parentDom, dom);
	}
	return dom;
}

export function mountVPlaceholder(vPlaceholder, parentDom) {
	const dom = document.createTextNode('');

	vPlaceholder.dom = dom;
	if (parentDom) {
		insertOrAppend(parentDom, dom);
	}
	return dom;
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

function appendNodeWithBlueprint(node, bp, parentDom, lifecycle, context, instance) {
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
			mountArrayChildren(node.children, dom, lifecycle, context, instance);
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
	if (!isNull(parentDom)) {
		parentDom.appendChild(dom);
	}
	return dom;
}

export function mountArrayChildrenWithKeys(children, parentDom, lifecycle, context, instance) {
	for (let i = 0; i < children.length; i++) {
		mount(children[i], parentDom, lifecycle, context, instance);
	}
}

export function mountArrayChildren(children, parentDom, lifecycle, context, instance, isSVG) {
	children.complex = false;
	for (let i = 0; i < children.length; i++) {
		const child = children[i];

		if (isStringOrNumber(child)) {
			const vText = createVText(child);

			children[i] = vText;
			mountVText(vText, parentDom);
			children.complex = true;
		} else if (isInvalidNode(child)) {
			const vPlaceholder = createVPlaceholder();

			children[i] = vPlaceholder;
			mountVPlaceholder(vPlaceholder, parentDom);
			children.complex = true;
		} else if (isArray(child)) {
			const vList = createVList(child);

			children[i] = vList;
			mountVList(vList, parentDom, lifecycle, context, instance, isSVG);
			children.complex = true;
		} else if (isVText(child)) {
			mountVText(child, parentDom);
			children.complex = true;
		} else if (isVPlaceholder(child)) {
			mountVPlaceholder(child, parentDom);
			children.complex = true;
		} else if (isVList(child)) {
			mountVList(child, parentDom, lifecycle, context, instance, isSVG);
			children.complex = true;
		} else {
			mount(child, parentDom, lifecycle, context, instance, isSVG);
		}
	}
}

function mountChildren(node, children, parentDom, lifecycle, context, instance, isSVG) {
	if (isArray(children)) {
		mountArrayChildren(children, parentDom, lifecycle, context, instance, isSVG);
	} else if (isStringOrNumber(children)) {
		appendText(children, parentDom, true);
	} else if (!isInvalidNode(children)) {
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
		let node = instance.render();

		if (isInvalidNode(node)) {
			node = createVPlaceholder();
		}
		instance._pendingSetState = false;
		dom = mount(node, null, lifecycle, context, instance, false);
		instance._lastNode = node;
		instance.componentDidMount();
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
		let node = Component(props, context);

		if (isInvalidNode(node)) {
			node = createVPlaceholder();
		}
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
