import {
	isArray,
	isUndefined,
	isStringOrNumber,
	isFunction,
	isNullOrUndef,
	isStatefulComponent,
	isString,
	isInvalid,
	isNull,
	isTrue,
	throwError
} from './../core/utils';
import {
	setTextContent,
	documentCreateElement,
	normaliseChild,
	appendChild,
	normalise,
	formSelectValue
} from './utils';
import { patchStyle, patch, patchProp } from './patching';
import { componentToDOMNodeMap } from './rendering';
import {
	isVElement,
	isOptVElement,
	isVText,
	isVFragment,
	isVComponent,
	isVPlaceholder,
	ValueTypes,
	isTextChildrenType,
	isNodeChildrenType,
	isKeyedListChildrenType,
	isNonKeyedListChildrenType,
	isUnknownChildrenType
} from '../core/shapes';
import {
	recycleOptVElement,
	recyclingEnabled,
	recycleVComponent
} from './recycling';

export function mount(input, parentDom, lifecycle, context, isSVG) {
	if (isOptVElement(input)) {
		return mountOptVElement(input, parentDom, lifecycle, context, isSVG);
	} else if (isVComponent(input)) {
		return mountVComponent(input, parentDom, lifecycle, context, isSVG);
	} else if (isVElement(input)) {
		return mountVElement(input, parentDom, lifecycle, context, isSVG);
	} else if (isVText(input)) {
		return mountVText(input, parentDom);
	} else if (isVFragment(input)) {
		return mountVFragment(input, parentDom, lifecycle, context, isSVG);
	} else if (isVPlaceholder(input)) {
		return mountVPlaceholder(input, parentDom);
	} else {
		if (process.env.NODE_ENV !== 'production') {
			throwError('bad input argument called on mount(). Input argument may need normalising.');
		}
		throwError();
	}
}

export function mountVPlaceholder(vPlaceholder, parentDom) {
	const dom = document.createTextNode('');

	vPlaceholder.dom = dom;
	if (parentDom) {
		appendChild(parentDom, dom);
	}
	return dom;
}

export function mountVElement(vElement, parentDom, lifecycle, context, isSVG) {
	const tag = vElement.tag;

	if (!isString(tag)) {
		if (process.env.NODE_ENV !== 'production') {
			throwError('expects VElement to have a string as the tag name');
		}
		throwError();
	}
	if (tag === 'svg') {
		isSVG = true;
	}
	const dom = documentCreateElement(tag, isSVG);
	const children = vElement.children;
	const props = vElement.props;
	const ref = vElement.ref;
	const hasProps = !isNullOrUndef(props);

	vElement.dom = dom;
	if (!isNullOrUndef(ref)) {
		lifecycle.addListener(() => {
			ref(dom);
		});
	}
	if (tag === 'select' && hasProps && isTrue(props.multiple)) {
		patchProp('multiple', null, true, dom);
	}
	if (!isNullOrUndef(children)) {
		mountChildren(vElement.childrenType, children, dom, lifecycle, context, isSVG);
	}
	if (hasProps) {
		mountProps(vElement, props, dom);
	}
	if (!isNull(parentDom)) {
		appendChild(parentDom, dom);
	}
	return dom;
}

export function mountVFragment(vFragment, parentDom, lifecycle, context, isSVG) {
	const children = vFragment.children;
	const pointer = document.createTextNode('');
	const dom = document.createDocumentFragment();
	const childrenType = vFragment.childrenType;

	if (isKeyedListChildrenType(childrenType) || isNonKeyedListChildrenType(childrenType)) {
		mountArrayChildrenWithType(children, dom, lifecycle, context, isSVG);
	} else if (isUnknownChildrenType(childrenType)) {
		mountArrayChildrenWithoutType(children, dom, lifecycle, context, isSVG);
	}
	vFragment.pointer = pointer;
	vFragment.dom = dom;
	appendChild(dom, pointer);
	if (parentDom) {
		appendChild(parentDom, dom);
	}
	return dom;
}

function createStaticVElementClone(bp, isSVG) {
	const stat = bp.staticVElement;
	const tag = stat.tag;
	const dom = document.createElement(tag);
	const props = stat.props;

	for (let prop in props) {
		patchProp(prop, null, props[prop], dom);
	}
	bp.clone = dom;
	return dom.cloneNode(true);
}

export function mountVText(vText, parentDom) {
	const dom = document.createTextNode(vText.text);

	vText.dom = dom;
	if (!isNull(parentDom)) {
		appendChild(parentDom, dom);
	}
	return dom;
}

export function mountOptVElement(optVElement, parentDom, lifecycle, context, isSVG) {
	const bp = optVElement.bp;
	let dom = null;

	if (recyclingEnabled) {
		dom = recycleOptVElement(optVElement, lifecycle, context, isSVG);
	}
	if (isNull(dom)) {
		dom = (bp.clone && bp.clone.cloneNode(true)) || createStaticVElementClone(bp, isSVG);
		optVElement.dom = dom;
		const bp0 = bp.v0;

		if (!isNull(bp0)) {
			mountOptVElementValue(bp0, optVElement.v0, bp.d0, dom, lifecycle, context, isSVG);
			const bp1 = bp.v1;

			if (!isNull(bp1)) {
				mountOptVElementValue(bp1, optVElement.v1, bp.d1, dom, lifecycle, context, isSVG);
				const bp2 = bp.v2;

				if (!isNull(bp2)) {
					mountOptVElementValue(bp2, optVElement.v2, bp.d2, dom, lifecycle, context, isSVG);
				}
			}
		}
	}
	if (!isNull(parentDom)) {
		parentDom.appendChild(dom);
	}
	return dom;
}

function mountOptVElementValue(valueType, value, descriptor, dom, lifecycle, context, isSVG) {
	switch (valueType) {
		case ValueTypes.CHILDREN:
			mountChildren(descriptor, value, dom, lifecycle, context, isSVG);
			break;
		case ValueTypes.PROP_CLASS_NAME:
			if (!isNullOrUndef(value)) {
				dom.className = value;
			}
			break;
		case ValueTypes.PROP_DATA:
			dom.dataset[descriptor] = value;
			break;
		case ValueTypes.PROP_STYLE:
			patchStyle(null, value, dom);
			break;
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
		if (process.env.NODE_ENV !== 'production') {
			throwError('bad childrenType value specified when attempting to mountChildren.');
		}
		throwError();
	}
}

export function mountArrayChildrenWithType(children, dom, lifecycle, context, isSVG) {
	for (let i = 0; i < children.length; i++) {
		mount(children[i], dom, lifecycle, context, isSVG);
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

export function mountVComponent(vComponent, parentDom, lifecycle, context, isSVG) {
	if (recyclingEnabled) {
		const dom = recycleVComponent(vComponent, lifecycle, context, isSVG);

		if (!isNull(dom)) {
			if (!isNull(parentDom)) {
				appendChild(parentDom, dom);
			}
			return dom;
		}
	}
	const Component = vComponent.component;
	const props = vComponent.props;
	const hooks = vComponent.hooks;
	const ref = vComponent.ref;
	let dom;

	if (isStatefulComponent(vComponent)) {
		if (hooks) {
			if (process.env.NODE_ENV !== 'production') {
				throwError('"hooks" are not supported on stateful components.');
			}
			throwError();
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
		let input = instance.render();

		if (isInvalid(input)) {
			input = createVPlaceholder();
		}
		instance._pendingSetState = false;
		dom = mount(input, null, lifecycle, context, false);
		instance._lastInput = input;
		if (!isNull(parentDom)) {
			appendChild(parentDom, dom);
		}
		if (ref) {
			if (isFunction(ref)) {
				lifecycle.addListener(() => ref(instance));
			} else {
				if (process.env.NODE_ENV !== 'production') {
					throwError('string "refs" are not supported in Inferno 0.8+. Use callback "refs" instead.');
				}
				throwError();
			}
		}
		if (!isNull(instance.componentDidMount)) {
			lifecycle.addListener(() => {
				instance.componentDidMount();
			});
		}
		componentToDOMNodeMap.set(instance, dom);
		vComponent.dom = dom;
		vComponent.instance = instance;
	} else {
		if (ref) {
			if (process.env.NODE_ENV !== 'production') {
				throwError('"refs" are not supported on stateless components.');
			}
			throwError();
		}
		if (!isNullOrUndef(hooks)) {
			if (!isNullOrUndef(hooks.onComponentWillMount)) {
				hooks.onComponentWillMount(props);
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
		vComponent.instance = input;
		if (!isNull(parentDom)) {
			appendChild(parentDom, dom);
		}
		vComponent.dom = dom;
	}
	return dom;
}

function mountProps(vElement, props, dom) {
	let formValue;

	for (let prop in props) {
		const value = props[prop];

		if (prop === 'value') {
			formValue = value;
		}
		patchProp(prop, null, value, dom);
	}
	if (vElement.tag === 'select') {
		formSelectValue(vElement.dom, formValue);
	}
}