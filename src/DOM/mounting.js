import {
	isArray,
	isStringOrNumber,
	isFunction,
	isNullOrUndef,
	addChildrenToProps,
	isStatefulComponent,
	isString,
	isInvalid,
	getRefInstance,
	isNull,
	isUndefined,
	isTrue,
	isObject
} from './../core/utils';
import { recyclingEnabled, recycle } from './recycling';
import {
	appendText,
	documentCreateElement,
	selectValue,
	handleAttachedHooks,
	insertOrAppend,
	normaliseChild,
	isPropertyOfElement,
	namespaces
} from './utils';
import { patchAttribute, patchStyle, patch } from './patching';
import { handleLazyAttached } from './lifecycle';
import { componentToDOMNodeMap } from './rendering';
import {
	createVPlaceholder,
	isVText,
	isVPlaceholder,
	isVFragment,
	isVElement,
	isVComponent
} from '../core/shapes';
import { normalise } from './utils';

export function mount(input, parentDom, lifecycle, context, instance, isSVG) {
	if (isVPlaceholder(input)) {
		return mountVPlaceholder(input, parentDom);
	} else if (isVText(input)) {
		return mountVText(input, parentDom);
	} else if (isVFragment(input)) {
		return mountVFragment(input, parentDom, lifecycle, context, instance, isSVG);
	} else if (isVElement(input)) {
		return mountVElement(input, parentDom, lifecycle, context, instance, isSVG);
	} else if (isVComponent(input)) {
		return mountVComponent(input, parentDom, lifecycle, context, instance, isSVG);
	} else {
		throw Error('Bad Input!');
	}
}

export function mountVElement(vElement, parentDom, lifecycle, context, instance, isSVG) {
	const tag = vElement._tag;

	if (!isString(tag)) {
		throw new Error('Inferno Error: expects VElement to have a string as the tag name');
	}
	if (tag === 'svg') {
		isSVG = true;
	}
	const dom = documentCreateElement(tag, isSVG);
	const children = vElement._children;
	const props = vElement._props;
	const hooks = vElement._hooks;

	vElement._dom = dom;
	if (!isNullOrUndef(hooks)) {
		handleAttachedHooks(hooks, lifecycle, dom);
	}
	if (!isNullOrUndef(children)) {
		mountChildren(vElement, children, dom, lifecycle, context, instance, isSVG);
	}
	if (!isNullOrUndef(props)) {
		handleSelects(vElement);
		mountProps(vElement, props, dom);
	}
	if (!isNull(parentDom)) {
		parentDom.appendChild(dom);
	}
	return dom;
}

export function mountVFragment(vList, parentDom, lifecycle, context, instance, isSVG) {
	const items = vList._items;
	const pointer = document.createTextNode('');
	const dom = document.createDocumentFragment();

	mountArrayChildren(items, dom, lifecycle, context, instance, isSVG);
	vList._pointer = pointer;
	vList._dom = dom;
	dom.appendChild(pointer);
	if (parentDom) {
		insertOrAppend(parentDom, dom);
	}
	return dom;
}

export function mountVText(vText, parentDom) {
	const dom = document.createTextNode(vText._text);

	vText._dom = dom;
	if (parentDom) {
		insertOrAppend(parentDom, dom);
	}
	return dom;
}

export function mountVPlaceholder(vPlaceholder, parentDom) {
	const dom = document.createTextNode('');

	vPlaceholder._dom = dom;
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

export function mountArrayChildren(children, parentDom, lifecycle, context, instance, isSVG) {
	children.complex = false;
	for (let i = 0; i < children.length; i++) {
		const child = normaliseChild(children, i);

		if (isVText(child)) {
			mountVText(child, parentDom);
			children.complex = true;
		} else if (isVPlaceholder(child)) {
			mountVPlaceholder(child, parentDom);
			children.complex = true;
		} else if (isVFragment(child)) {
			mountVFragment(child, parentDom, lifecycle, context, instance, isSVG);
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
	} else if (!isInvalid(children)) {
		mount(children, parentDom, lifecycle, context, instance, isSVG);
	}
}

export function mountVComponent(vComponent, parentDom, lifecycle, context, lastInstance, isSVG) {
	const Component = vComponent._component;
	const props = vComponent._props;
	const hooks = vComponent._hooks;
	let dom;

	if (isStatefulComponent(vComponent)) {
		const instance = new Component(props, context);

		instance._patch = patch;
		instance._componentToDOMNodeMap = componentToDOMNodeMap;
		const childContext = instance.getChildContext();

		if (!isNullOrUndef(childContext)) {
			context = Object.assign({}, context, childContext);
		}
		instance._unmounted = false;
		if (lastInstance) {
			instance._parentComponent = lastInstance;
		}
		instance._pendingSetState = true;
		instance.componentWillMount();
		let input = instance.render();

		if (isInvalid(input)) {
			input = createVPlaceholder();
		}
		instance._pendingSetState = false;
		dom = mount(input, null, lifecycle, context, instance, false);
		instance._lastInput = input;
		instance.componentDidMount();
		if (parentDom !== null && !isInvalid(dom)) {
			parentDom.appendChild(dom);
		}
		componentToDOMNodeMap.set(instance, dom);
		vComponent._dom = dom;
		vComponent._instance = instance;
	} else {
		if (!isNullOrUndef(hooks)) {
			if (!isNullOrUndef(hooks.onComponentWillMount)) {
				hooks.onComponentWillMount(null, props);
			}
			if (!isNullOrUndef(hooks.onComponentDidMount)) {
				lifecycle.addListener(() => {
					hooks.onComponentDidMount(dom, props);
				});
			}
		}

		/* eslint new-cap: 0 */
		let input = Component(props, context);

		if (isInvalid(input)) {
			node = createVPlaceholder();
		}
		dom = mount(input, null, lifecycle, context, null, false);
		vComponent._instance = input;
		if (parentDom !== null && !isInvalid(dom)) {
			parentDom.appendChild(dom);
		}
		vComponent._dom = dom;
	}
	return dom;
}

export function mountProps(vElement, props, dom, instance) {
	for (let prop in props) {
		const value = props[prop];

		if (!isNullOrUndef(value)) {
			if (prop === 'style') {
				patchStyle(null, value, dom);
			} else if (isPropertyOfElement(vElement._tag, prop)) {
				dom[prop] = value;
			} else {
				const namespace = namespaces[prop];

				if (namespace) {
					dom.setAttributeNS(namespace, prop, value);
				} else {
					dom.setAttribute(prop, value);
				}
			}
		}
	}
}
