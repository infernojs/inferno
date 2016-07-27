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
import {
	setTextContent,
	documentCreateElement,
	selectValue,
	handleAttachedHooks,
	insertOrAppend,
	normaliseChild,
	isPropertyOfElement,
	namespaces,
	appendChild
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
	isVComponent,
	isVTemplate,
	NodeTypes
} from '../core/shapes';
import ChildrenTypes from '../core/ChildrenTypes';
import { normalise } from './utils';
import { recycleVTemplate, recyclingEnabled } from './templates';

export function mount(input, parentDom, lifecycle, context, isSVG) {
	switch (input._type) {
		case NodeTypes.TEMPLATE:
			return mountVTemplate(input, parentDom, lifecycle, context, isSVG);
		case NodeTypes.PLACEHOLDER:
			return mountVPlaceholder(input, parentDom);
		case NodeTypes.TEXT:
			return mountVText(input, parentDom);
		case NodeTypes.FRAGMENT:
			return mountVFragment(input, parentDom, lifecycle, context, isSVG);
		case NodeTypes.ELEMENT:
			return mountVElement(input, parentDom, lifecycle, context, isSVG);
		case NodeTypes.COMPONENT:
			return mountVComponent(input, parentDom, lifecycle, context, isSVG);
		default:
			throw Error('Inferno Error: Bad input argument called on mount(). Input argument may need normalising.');
	}
}

export function mountVTemplate(vTemplate, parentDom, lifecycle, context, isSVG) {
	const templateReducers = vTemplate._tr;
	let dom = null;

	if (recyclingEnabled) {
		dom = recycleVTemplate(vTemplate, lifecycle, context, isSVG);
	}
	if (isNull(dom)) {
		dom = templateReducers.mount(vTemplate, null, lifecycle, context, isSVG);
	}

	vTemplate._dom = dom;
	if (!isNull(parentDom)) {
		appendChild(parentDom, dom);
	}
	return dom;
}

function mountVElement(vElement, parentDom, lifecycle, context, isSVG) {
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
		mountChildren(vElement._childrenType, children, dom, lifecycle, context, isSVG);
	}
	if (!isNullOrUndef(props)) {
		handleSelects(vElement);
		mountProps(vElement, props, dom);
	}
	if (!isNull(parentDom)) {
		appendChild(parentDom, dom);
	}
	return dom;
}

export function mountVFragment(vList, parentDom, lifecycle, context, isSVG) {
	const items = vList._items;
	const pointer = document.createTextNode('');
	const dom = document.createDocumentFragment();

	mountArrayChildren(items, dom, lifecycle, context, isSVG);
	vList._pointer = pointer;
	vList._dom = dom;
	appendChild(dom, pointer);
	if (parentDom) {
		appendChild(parentDom, dom);
	}
	return dom;
}

export function mountVText(vText, parentDom) {
	const dom = document.createTextNode(vText._text);

	vText._dom = dom;
	if (parentDom) {
		appendChild(parentDom, dom);
	}
	return dom;
}

export function mountVPlaceholder(vPlaceholder, parentDom) {
	const dom = document.createTextNode('');

	vPlaceholder._dom = dom;
	if (parentDom) {
		appendChild(parentDom, dom);
	}
	return dom;
}

export function handleSelects(node) {
	if (node.tag === 'select') {
		selectValue(node);
	}
}

export function mountArrayChildrenWithoutType(children, parentDom, lifecycle, context, isSVG) {
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
			mountVFragment(child, parentDom, lifecycle, context, isSVG);
			children.complex = true;
		} else {
			mount(child, parentDom, lifecycle, context, isSVG);
		}
	}
}

function mountChildrenWithUnknownType(children, parentDom, lifecycle, context, isSVG) {
	if (isArray(children)) {
		mountArrayChildrenWithoutType(children, parentDom, lifecycle, context, isSVG);
	} else if (isStringOrNumber(children)) {
		setTextContent(parentDom, children);
	} else if (!isInvalid(children)) {
		mount(children, parentDom, lifecycle, context, isSVG);
	}
}

function mountChildren(childrenType, children, parentDom, lifecycle, context, isSVG) {
	switch (childrenType) {
		case ChildrenTypes.NON_KEYED_LIST:
		case ChildrenTypes.KEYED_LIST:
			for (let i = 0; i < children.length; i++) {
				mount(children[i], parentDom, lifecycle, context, isSVG);
			}
			break;
		case ChildrenTypes.UNKNOWN:
			mountChildrenWithUnknownType(children, parentDom, lifecycle, context, isSVG);
			break;
		case ChildrenTypes.TEXT:
			setTextContent(parentDom, children);
			break;
		default:
			throw new Error('Inferno Error: Bad childrenType value specified when attempting to mountChildren');
	}
}

export function mountVComponent(vComponent, parentDom, lifecycle, context, isSVG) {
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
		instance._pendingSetState = true;
		instance.componentWillMount();
		let input = instance.render();

		if (isInvalid(input)) {
			input = createVPlaceholder();
		}
		instance._pendingSetState = false;
		dom = mount(input, null, lifecycle, context, false);
		instance._lastInput = input;
		instance.componentDidMount();
		if (parentDom !== null && !isInvalid(dom)) {
			appendChild(parentDom, dom);
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
			appendChild(parentDom, dom);
		}
		vComponent._dom = dom;
	}
	return dom;
}

export function mountProps(vElement, props, dom) {
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

export function mountVariable(variable, templateIsSVG, isChildren, childrenType) {
	const arg = variable._arg;

	return function mountVariable(vTemplate, parentDom, lifecycle, context, isSVG) {
		const input = vTemplate.read(arg);

		if (isChildren) {
			return mountChildren(childrenType, input, parentDom, lifecycle, context, isSVG || templateIsSVG);
		} else {
			// we may need to normalise here
			return mount(input, parentDom, lifecycle, context, isSVG || templateIsSVG);
		}
	};
}

export function mountDOMNodeFromTemplate(templateDomNode, isRoot, deepClone) {
	return function mountDOMNodeFromTemplate(vTemplate, parentDom, lifecycle, context) {
		const domNode = templateDomNode.cloneNode(deepClone);

		if (!isNull(parentDom)) {
			appendChild(parentDom, domNode);
		}
		return domNode;
	};
}