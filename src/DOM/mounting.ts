import {
	isArray,
	isStringOrNumber,
	isFunction,
	isNullOrUndef,
	isStatefulComponent,
	isString,
	isInvalid,
	isNull,
	throwError,
	isUndefined,
	EMPTY_OBJ
} from '../shared';
import {
	setTextContent,
	normaliseChild,
	appendChild,
	formSelectValue,
	getPropFromOptElement,
	createStatefulComponentInstance,
	createStatelessComponentInput,
	documentCreateElement,
	copyPropsTo
} from './utils';
import { patchStyle, patchProp } from './patching';
import { componentToDOMNodeMap } from './rendering';
import {
	isVElement,
	isOptVElement,
	isVText,
	isVFragment,
	isVComponent,
	isVPlaceholder
} from '../core/shapes';
import {
	ValueTypes,
	isTextChildrenType,
	isNodeChildrenType,
	isKeyedListChildrenType,
	isNonKeyedListChildrenType,
	isUnknownChildrenType
} from '../core/constants';
import { recycleOptVElement, recyclingEnabled, recycleVComponent } from './recycling';
import createStaticVElementClone from '../factories/createStaticVElementClone';

export function mount(input, parentDom, lifecycle, context, isSVG, shallowUnmount) {
	if (isOptVElement(input)) {
		return mountOptVElement(input, parentDom, lifecycle, context, isSVG, shallowUnmount);
	} else if (isVComponent(input)) {
		return mountVComponent(input, parentDom, lifecycle, context, isSVG, shallowUnmount);
	} else if (isVElement(input)) {
		return mountVElement(input, parentDom, lifecycle, context, isSVG, shallowUnmount);
	} else if (isVText(input)) {
		return mountVText(input, parentDom);
	} else if (isVFragment(input)) {
		return mountVFragment(input, parentDom, lifecycle, context, isSVG, shallowUnmount);
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

export function mountVElement(vElement, parentDom, lifecycle, context, isSVG, shallowUnmount) {
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
	let formValue;

	vElement.dom = dom;
	if (!isNullOrUndef(ref)) {
		mountRef(dom, ref, lifecycle);
	}
	if (hasProps) {
		formValue = mountProps(vElement, props, dom, lifecycle, context, isSVG, false, shallowUnmount);
	}
	if (!isNullOrUndef(children)) {
		mountChildren(vElement.childrenType, children, dom, lifecycle, context, isSVG, shallowUnmount);
	}
	if (tag === 'select' && formValue) {
		formSelectValue(dom, formValue);
	}
	if (!isNull(parentDom)) {
		appendChild(parentDom, dom);
	}
	return dom;
}

export function mountVFragment(vFragment, parentDom, lifecycle, context, isSVG, shallowUnmount) {
	const children = vFragment.children;
	const pointer = document.createTextNode('');
	const dom = document.createDocumentFragment();
	const childrenType = vFragment.childrenType;

	if (isKeyedListChildrenType(childrenType) || isNonKeyedListChildrenType(childrenType)) {
		mountArrayChildrenWithType(children, dom, lifecycle, context, isSVG, shallowUnmount);
	} else if (isUnknownChildrenType(childrenType)) {
		mountArrayChildrenWithoutType(children, dom, lifecycle, context, isSVG, shallowUnmount);
	}
	vFragment.pointer = pointer;
	vFragment.dom = dom;
	appendChild(dom, pointer);
	if (parentDom) {
		appendChild(parentDom, dom);
	}
	return dom;
}

export function mountVText(vText, parentDom) {
	const dom = document.createTextNode(vText.text);

	vText.dom = dom;
	if (!isNull(parentDom)) {
		appendChild(parentDom, dom);
	}
	return dom;
}

export function mountOptVElement(optVElement, parentDom, lifecycle, context, isSVG, shallowUnmount) {
	const bp = optVElement.bp;
	let dom = null;

	if (recyclingEnabled) {
		dom = recycleOptVElement(optVElement, lifecycle, context, isSVG, shallowUnmount);
	}
	const tag = bp.staticVElement.tag;

	if (isNull(dom)) {
		if (isSVG || tag === 'svg') {
			isSVG = true;
			dom = (bp.svgClone && bp.svgClone.cloneNode(true)) || createStaticVElementClone(bp, isSVG);
		} else {
			dom = (bp.clone && bp.clone.cloneNode(true)) || createStaticVElementClone(bp, isSVG);
		}
		optVElement.dom = dom;
		const bp0 = bp.v0;

		if (!isNull(bp0)) {
			mountOptVElementValue(optVElement, bp0, optVElement.v0, bp.d0, dom, lifecycle, context, isSVG, shallowUnmount);
			const bp1 = bp.v1;

			if (!isNull(bp1)) {
				mountOptVElementValue(optVElement, bp1, optVElement.v1, bp.d1, dom, lifecycle, context, isSVG, shallowUnmount);
				const bp2 = bp.v2;

				if (!isNull(bp2)) {
					mountOptVElementValue(optVElement, bp2, optVElement.v2, bp.d2, dom, lifecycle, context, isSVG, shallowUnmount);
					const bp3 = bp.v3;

					if (!isNull(bp3)) {
						const v3 = optVElement.v3;
						const d3 = bp.d3;
						const bp3 = bp.v3;

						for (let i = 0; i < bp3.length; i++) {
							mountOptVElementValue(optVElement, bp3[i], v3[i], d3[i], dom, lifecycle, context, isSVG, shallowUnmount);
						}
					}
				}
			}
		}
		if (tag === 'select') {
			formSelectValue(dom, getPropFromOptElement(optVElement, ValueTypes.PROP_VALUE));
		}
	}
	if (!isNull(parentDom)) {
		parentDom.appendChild(dom);
	}
	return dom;
}

function mountOptVElementValue(optVElement, valueType, value, descriptor, dom, lifecycle, context, isSVG, shallowUnmount) {
	switch (valueType) {
		case ValueTypes.CHILDREN:
			mountChildren(descriptor, value, dom, lifecycle, context, isSVG, shallowUnmount);
			break;
		case ValueTypes.PROP_CLASS_NAME:
			if (!isNullOrUndef(value)) {
				if (isSVG) {
					dom.setAttribute('class', value);
				} else {
					dom.className = value;
				}
			}
			break;
		case ValueTypes.PROP_DATA:
			dom.dataset[descriptor] = value;
			break;
		case ValueTypes.PROP_STYLE:
			patchStyle(null, value, dom);
			break;
		case ValueTypes.PROP_VALUE:
			dom.value = isNullOrUndef(value) ? '' : value;
			break;
		case ValueTypes.PROP:
			patchProp(descriptor, null, value, dom, isSVG);
			break;
		case ValueTypes.PROP_REF:
			mountRef(dom, value, lifecycle);
			break;
		case ValueTypes.PROP_SPREAD:
			mountProps(optVElement, value, dom, lifecycle, context, isSVG, true, shallowUnmount);
			break;
		default:
			// TODO
	}
}

export function mountChildren(childrenType, children, dom, lifecycle, context, isSVG, shallowUnmount) {
	if (isTextChildrenType(childrenType)) {
		setTextContent(dom, children);
	} else if (isNodeChildrenType(childrenType)) {
		mount(children, dom, lifecycle, context, isSVG, shallowUnmount);
	} else if (isKeyedListChildrenType(childrenType) || isNonKeyedListChildrenType(childrenType)) {
		mountArrayChildrenWithType(children, dom, lifecycle, context, isSVG, shallowUnmount);
	} else if (isUnknownChildrenType(childrenType)) {
		mountChildrenWithUnknownType(children, dom, lifecycle, context, isSVG, shallowUnmount);
	} else {
		if (process.env.NODE_ENV !== 'production') {
			throwError('bad childrenType value specified when attempting to mountChildren.');
		}
		throwError();
	}
}

export function mountArrayChildrenWithType(children, dom, lifecycle, context, isSVG, shallowUnmount) {
	for (let i = 0; i < children.length; i++) {
		mount(children[i], dom, lifecycle, context, isSVG, shallowUnmount);
	}
}

export function mountChildrenWithUnknownType(children, dom, lifecycle, context, isSVG, shallowUnmount) {
	if (isArray(children)) {
		mountArrayChildrenWithoutType(children, dom, lifecycle, context, isSVG, shallowUnmount);
	} else if (isStringOrNumber(children)) {
		setTextContent(dom, children);
	} else if (!isInvalid(children)) {
		mount(children, dom, lifecycle, context, isSVG, shallowUnmount);
	}
}

export function mountArrayChildrenWithoutType(children, dom, lifecycle, context, isSVG, shallowUnmount) {
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
			mountVFragment(child, dom, lifecycle, context, isSVG, shallowUnmount);
			children.complex = true;
		} else {
			mount(child, dom, lifecycle, context, isSVG, shallowUnmount);
		}
	}
}

export function mountVComponent(vComponent, parentDom, lifecycle, context, isSVG, shallowUnmount) {
	if (recyclingEnabled) {
		const dom = recycleVComponent(vComponent, lifecycle, context, isSVG, shallowUnmount);

		if (!isNull(dom)) {
			if (!isNull(parentDom)) {
				appendChild(parentDom, dom);
			}
			return dom;
		}
	}
	const component = vComponent.component;
	const props = vComponent.props || EMPTY_OBJ;
	const hooks = vComponent.hooks;
	const ref = vComponent.ref;
	let dom;

	if (isStatefulComponent(vComponent)) {
		const defaultProps = component.defaultProps;

		if (!isUndefined(defaultProps)) {
			copyPropsTo(defaultProps, props);
			vComponent.props = props;
		}
		if (hooks) {
			if (process.env.NODE_ENV !== 'production') {
				throwError('"hooks" are not supported on stateful components.');
			}
			throwError();
		}
		const instance = createStatefulComponentInstance(component, props, context, isSVG);
		const input = instance._lastInput;

		instance._vComponent = vComponent;
		vComponent.dom = dom = mount(input, null, lifecycle, instance._childContext, false, shallowUnmount);
		if (!isNull(parentDom)) {
			appendChild(parentDom, dom);
		}
		mountStatefulComponentCallbacks(ref, instance, lifecycle);
		componentToDOMNodeMap.set(instance, dom);
		vComponent.instance = instance;
	} else {
		if (ref) {
			if (process.env.NODE_ENV !== 'production') {
				throwError('"refs" are not supported on stateless components.');
			}
			throwError();
		}
		const input = createStatelessComponentInput(component, props, context);

		vComponent.dom = dom = mount(input, null, lifecycle, context, isSVG, shallowUnmount);
		vComponent.instance = input;
		mountStatelessComponentCallbacks(hooks, dom, lifecycle);
		if (!isNull(parentDom)) {
			appendChild(parentDom, dom);
		}
	}
	return dom;
}

export function mountStatefulComponentCallbacks(ref, instance, lifecycle) {
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
}

export function mountStatelessComponentCallbacks(hooks, dom, lifecycle) {
	if (!isNullOrUndef(hooks)) {
		if (!isNullOrUndef(hooks.onComponentWillMount)) {
			hooks.onComponentWillMount();
		}
		if (!isNullOrUndef(hooks.onComponentDidMount)) {
			lifecycle.addListener(() => hooks.onComponentDidMount(dom));
		}
	}
}

function mountProps(vNode, props, dom, lifecycle, context, isSVG, isSpread, shallowUnmount) {
	let formValue;

	for (let prop in props) {
		if (!props.hasOwnProperty(prop)) {
			continue;
		}

		const value = props[prop];

		if (prop === 'value') {
			formValue = value;
		}
		if (prop === 'key') {
			vNode.key = value;
		} else if (prop === 'ref') {
			mountRef(dom, value, lifecycle);
		} else if (prop === 'children') {
			if (isSpread) {
				mountChildrenWithUnknownType(value, dom, lifecycle, context, isSVG, shallowUnmount);
			} else if (isVElement(vNode)) {
				vNode.children = value;
			}
		} else {
			patchProp(prop, null, value, dom, isSVG);
		}
	}
	return formValue;
}

function mountRef(dom, value, lifecycle) {
	if (isFunction(value)) {
		lifecycle.addListener(() => value(dom));
	} else {
		if (isInvalid(value)) {
			return;
		}
		if (process.env.NODE_ENV !== 'production') {
			throwError('string "refs" are not supported in Inferno 0.8+. Use callback "refs" instead.');
		}
		throwError();
	}
}
