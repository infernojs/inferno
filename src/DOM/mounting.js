import {
	isArray,
	isStringOrNumber,
	isFunction,
	isNullOrUndef,
	isStatefulComponent,
	isString,
	isInvalid,
	isNull
} from './../core/utils';
import { setTextContent, documentCreateElement, selectValue, normaliseChild, appendChild, normalise } from './utils';
import { patchStyle, patch, patchProp } from './patching';
import { componentToDOMNodeMap } from './rendering';
import {
	createVPlaceholder,
	isVText,
	isVPlaceholder,
	isVFragment,
	isVElement,
	isVComponent,
	isVTemplate,
	isVariable,
	isVNode
} from '../core/shapes';
import {
	isKeyedListChildrenType,
	isTextChildrenType,
	isNodeChildrenType,
	isNonKeyedListChildrenType,
	isUnknownChildrenType
} from '../core/ChildrenTypes';
import { recycleVTemplate, recyclingEnabled } from './templates';

const refsError = 'Inferno Error: string "refs" are not supported in Inferno 0.8+. Use callback "refs" instead.';

export function mount(input, parentDom, lifecycle, context, isSVG) {
	if (isVTemplate(input)) {
		return mountVTemplate(input, parentDom, lifecycle, context, isSVG);
	} else if (isVPlaceholder(input)) {
		return mountVPlaceholder(input, parentDom);
	} else if (isVText(input)) {
		return mountVText(input, parentDom);
	} else if (isVFragment(input)) {
		return mountVFragment(input, parentDom, lifecycle, context, isSVG);
	} else if (isVElement(input)) {
		return mountVElement(input, parentDom, lifecycle, context, isSVG);
	} else if (isVComponent(input)) {
		return mountVComponent(input, parentDom, lifecycle, context, isSVG);
	} else {
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

export function mountVElement(vElement, parentDom, lifecycle, context, isSVG) {
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
	const ref = vElement._ref;

	vElement._dom = dom;
	if (!isNullOrUndef(ref)) {
		lifecycle.addListener(() => {
			ref(dom);
		});
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

export function mountVFragment(vFragment, parentDom, lifecycle, context, isSVG) {
	const children = vFragment._children;
	const pointer = document.createTextNode('');
	const dom = document.createDocumentFragment();
	const childrenType = vFragment._childrenType;

	if (isKeyedListChildrenType(childrenType) || isNonKeyedListChildrenType(childrenType)) {
		mountArrayChildrenWithType(children, dom, lifecycle, context, isSVG);
	} else if (isUnknownChildrenType(childrenType)) {
		mountArrayChildrenWithoutType(children, dom, lifecycle, context, isSVG);
	}
	vFragment._pointer = pointer;
	vFragment._dom = dom;
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

export function mountArrayChildrenWithoutType(children, dom, lifecycle, context, isSVG) {
	children.complex = false;
	for (let i = 0; i < children.length; i++) {
		const child = normaliseChild(children, i);

		if (isVText(child)) {
			mountVText(child, dom);
			children.complex = true;
		} else if (isVPlaceholder(child)) {
			mountVPlaceholder(child, dom);
			children.complex = true;
		} else if (isVFragment(child)) {
			mountVFragment(child, dom, lifecycle, context, isSVG);
			children.complex = true;
		} else {
			mount(child, dom, lifecycle, context, isSVG);
		}
	}
}

export function mountChildrenWithUnknownType(children, dom, lifecycle, context, isSVG) {
	if (isArray(children)) {
		mountArrayChildrenWithoutType(children, dom, lifecycle, context, isSVG);
	} else if (isStringOrNumber(children)) {
		setTextContent(dom, children);
	} else if (!isInvalid(children)) {
		mount(children, dom, lifecycle, context, isSVG);
	}
}

export function mountArrayChildrenWithType(children, dom, lifecycle, context, isSVG) {
	for (let i = 0; i < children.length; i++) {
		mount(children[i], dom, lifecycle, context, isSVG);
	}
}

function mountChildren(childrenType, children, dom, lifecycle, context, isSVG) {
	if (isTextChildrenType(childrenType)) {
		setTextContent(dom, children);
	} else if (isNodeChildrenType(childrenType)) {
		mount(children, dom, lifecycle, context, isSVG);
	} else if (isKeyedListChildrenType(childrenType) || isNonKeyedListChildrenType(childrenType)) {
		mountArrayChildrenWithType(children, dom, lifecycle, context, isSVG);
	} else if (isUnknownChildrenType(childrenType)) {
		mountChildrenWithUnknownType(children, dom, lifecycle, context, isSVG);
	} else {
		throw new Error('Inferno Error: Bad childrenType value specified when attempting to mountChildren');
	}
}

export function mountVComponent(vComponent, parentDom, lifecycle, context, isSVG) {
	const Component = vComponent._component;
	const props = vComponent._props;
	const hooks = vComponent._hooks;
	const ref = vComponent._ref;
	let dom;

	if (isStatefulComponent(vComponent)) {
		if (hooks) {
			throw new Error('Inferno Error: "hooks" are not supported on stateful components.');
		}
		const instance = new Component(props, context);

		instance._patch = patch;
		instance._componentToDOMNodeMap = componentToDOMNodeMap;
		const childContext = instance.getChildContext();

		if (!isNullOrUndef(childContext)) {
			context = Object.assign({}, context, childContext);
		}
		instance._unmounted = false;
		instance._pendingSetState = true;
		instance._vComponent = vComponent;
		instance.componentWillMount();
		if (ref) {
			if (isFunction(ref)) {
				ref(instance);
			} else {
				throw new Error(refsError);
			}
		}
		let input = instance.render();

		if (isInvalid(input)) {
			input = createVPlaceholder();
		}
		instance._pendingSetState = false;
		dom = mount(input, null, lifecycle, context, false);
		instance._lastInput = input;
		if (parentDom !== null && !isInvalid(dom)) {
			appendChild(parentDom, dom);
		}
		instance.componentDidMount();
		componentToDOMNodeMap.set(instance, dom);
		vComponent._dom = dom;
		vComponent._instance = instance;
	} else {
		if (ref) {
			throw new Error('Inferno Error: "refs" are not supported on stateless components.');
		}
		if (!isNullOrUndef(hooks)) {
			if (!isNullOrUndef(hooks.onComponentWillMount)) {
				hooks.onComponentWillMount(null, props);
			}
			if (!isNullOrUndef(hooks.onComponentDidMount)) {
				lifecycle.addListener(() => hooks.onComponentDidMount(dom, props));
			}
		}

		/* eslint new-cap: 0 */
		let input = Component(props, context);

		if (isInvalid(input)) {
			input = createVPlaceholder();
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

function mountProps(vElement, props, dom) {
	for (let prop in props) {
		const value = props[prop];

		patchProp(prop, null, value, dom);
	}
}

export function mountVariableAsExpression(pointer, templateIsSVG) {
	return function mountVariableAsExpression(vTemplate, dom, lifecycle, context, isSVG) {
		let input = vTemplate.read(pointer);

		if (isNullOrUndef(input) || !isVNode(input)) {
			input = normalise(input);
			vTemplate.write(pointer, input);
		}
		return mount(input, dom, lifecycle, context, isSVG || templateIsSVG);
	};
}

export function mountVariableAsChildren(pointer, templateIsSVG, childrenType) {
	return function mountVariableAsChildren(vTemplate, dom, lifecycle, context, isSVG) {
		return mountChildren(childrenType, vTemplate.read(pointer), dom, lifecycle, context, isSVG || templateIsSVG);
	};
}


export function mountVariableAsText(pointer) {
	return function mountVariableAsText(vTemplate, textNode) {
		textNode.nodeValue = vTemplate.read(pointer);
	};
}

export function mountDOMNodeFromTemplate(templateDomNode, deepClone) {
	return function mountDOMNodeFromTemplate(vTemplate, dom) {
		const domNode = templateDomNode.cloneNode(deepClone);

		if (!isNull(dom)) {
			appendChild(dom, domNode);
		}
		return domNode;
	};
}

export function mountRefFromTemplate(ref) {
	return function mountRefFromTemplate(vTemplate, dom, lifecycle) {
		let value = ref;

		if (isVariable(ref)) {
			value = vTemplate.read(ref._pointer);
		}
		if (isFunction(value)) {
			value(dom);
		} else {
			throw new Error(refsError);
		}
	};
}

export function mountSpreadPropsFromTemplate(pointer) {
	return function mountSpreadPropsFromTemplate(vTemplate, dom) {
		const props = vTemplate.read(pointer);

		for (let prop in props) {
			const value = props[prop];

			if (prop === 'key') {
				debugger;
			} else if (prop === 'ref') {
				debugger;
			} else {
				patchProp(prop, null, value, dom);
			}
		}
	};
}

export function mountEmptyTextNode(vTemplate, parentDom) {
	const dom = document.createTextNode('');

	if (!isNull(parentDom)) {
		appendChild(parentDom, dom);
	}
	return dom;
}

export function mountTemplateClassName(pointer) {
	return function mountTemplateClassName(vTemplate, dom) {
		const className = vTemplate.read(pointer);

		if (!isNullOrUndef(className)) {
			dom.className = className;
		}
	};
}

export function mountTemplateStyle(pointer) {
	return function mountTemplateStyle(vTemplate, dom) {
		patchStyle(null, vTemplate.read(pointer), dom);
	};
}

export function mountTemplateProps(propsToMount) {
	return function mountTemplateProps(vTemplate, dom) {
		for (let i = 0; i < propsToMount.length; i += 2) {
			const prop = propsToMount[i];
			let value = propsToMount[i + 1];

			if (isVariable(value)) {
				value = vTemplate.read(value._pointer);
			}
			patchProp(prop, null, value, dom);
		}
	};
}
