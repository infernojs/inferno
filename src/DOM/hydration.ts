import {
	isArray,
	isNull,
	isStringOrNumber,
	isString,
	isInvalid,
	isStatefulComponent,
	throwError,
	isObject,
	isNullOrUndef
} from '../shared';
import {
	replaceChild,
	normaliseChild,
	createStatelessComponentInput,
	createStatefulComponentInstance
} from './utils';
import {
	mountVText,
	mountStatelessComponentCallbacks,
	mountStatefulComponentCallbacks
} from './mounting';
import {
	isVPlaceholder,
	isVFragment,
	isVText,
	isVElement,
	isVComponent,
	isOptVElement
} from '../core/shapes';
import {
	ValueTypes,
	isKeyedListChildrenType,
	isTextChildrenType,
	isNodeChildrenType,
	isNonKeyedListChildrenType,
	isUnknownChildrenType
} from '../core/constants';
import {
	patchProp,
	patchStyle
} from './patching';
import { componentToDOMNodeMap } from './rendering';
import { svgNS } from './constants';

function hydrateChild(child, childNodes, counter, parentDom, lifecycle, context) {
	const domNode = childNodes[counter.i];

	if (isVText(child)) {
		const text = child.text;

		child.dom = domNode;
		if (domNode.nodeType === 3 && text !== '') {
			domNode.nodeValue = text;
		} else {
			const newDomNode = mountVText(text, null);

			replaceChild(parentDom, newDomNode, domNode);
			childNodes.splice(childNodes.indexOf(domNode), 1, newDomNode);
			child.dom = newDomNode;
		}
	} else if (isVPlaceholder(child)) {
		child.dom = domNode;
	} else if (isVFragment(child)) {
		const items = child.items;

		// this doesn't really matter, as it won't be used again, but it's what it should be given the purpose of VList
		child.dom = document.createDocumentFragment();
		for (let i = 0; i < items.length; i++) {
			const rebuild = hydrateChild(normaliseChild(items, i), childNodes, counter, parentDom, lifecycle, context);

			if (rebuild) {
				return true;
			}
		}
		// at the end of every VList, there should be a "pointer". It's an empty TextNode used for tracking the VList
		const pointer = childNodes[counter.i++];

		if (pointer && pointer.nodeType === 3) {
			child.pointer = pointer;
		} else {
			// there is a problem, we need to rebuild this tree
			return true;
		}
	} else {
		const rebuild = hydrate(child, domNode, lifecycle, context);

		if (rebuild) {
			return true;
		}
	}
	counter.i++;
}

export function normaliseChildNodes(dom) {
	const rawChildNodes = dom.childNodes;
	let length = rawChildNodes.length;
	let i = 0;

	while (i < length) {
		const rawChild = rawChildNodes[i];

		if (rawChild.nodeType === 8) {
			if (rawChild.data === '!') {
				const placeholder = document.createTextNode('');

				dom.replaceChild(placeholder, rawChild);
				i++;
			} else {
				dom.removeChild(rawChild);
				length--;
			}
		} else {
			i++;
		}
	}
}

function hydrateVComponent(vComponent, dom, lifecycle, context) {
	const component = vComponent.component;
	const props = vComponent.props;
	const hooks = vComponent.hooks;
	const ref = vComponent.ref;

	vComponent.dom = dom;
	if (isStatefulComponent(vComponent)) {
		const isSVG = dom.namespaceURI === svgNS;
		const instance = createStatefulComponentInstance(component, props, context, isSVG);
		const input = instance._lastInput;

		instance._vComponent = vComponent;
		hydrate(input, dom, lifecycle, context);
		mountStatefulComponentCallbacks(ref, instance, lifecycle);
		componentToDOMNodeMap.set(instance, dom);
		vComponent.instance = instance;
	} else {
		const input = createStatelessComponentInput(component, props, context);

		hydrate(input, dom, lifecycle, context);
		vComponent.instance = input;
		vComponent.dom = input.dom;
		mountStatelessComponentCallbacks(hooks, dom, lifecycle);
	}
}

function hydrateVElement(vElement, dom, lifecycle, context) {
	const tag = vElement.tag;

	if (!isString(tag)) {
		if (process.env.NODE_ENV !== 'production') {
			throwError('expects VElement to have a string as the tag name');
		}
		throwError();
	}
	const children = vElement.children;

	vElement.dom = dom;
	if (children) {
		hydrateChildren(vElement.childrenType, children, dom, lifecycle, context);
	}
}

function hydrateArrayChildrenWithType(children, dom, lifecycle, context) {
	const domNodes = Array.prototype.slice.call(dom.childNodes);

	for (let i = 0; i < children.length; i++) {
		hydrate(children[i], domNodes[i], lifecycle, context);
	}
}

function hydrateChildrenWithUnknownType(children, dom, lifecycle, context) {
	const domNodes = Array.prototype.slice.call(dom.childNodes);

	if (isArray(children)) {
		for (let i = 0; i < children.length; i++) {
			const child = normaliseChild(children, i);

			if (isObject(child)) {
				hydrate(child, domNodes[i], lifecycle, context);
			}
		}
	} else if (isObject(children)) {
		hydrate(children, dom.firstChild, lifecycle, context);
	}
}

function hydrateChildren(childrenType, children, dom, lifecycle, context) {
	if (isNodeChildrenType(childrenType)) {
		hydrate(children, dom.firstChild, lifecycle, context);
	} else if (isKeyedListChildrenType(childrenType) || isNonKeyedListChildrenType(childrenType)) {
		hydrateArrayChildrenWithType(children, dom, lifecycle, context);
	} else if (isUnknownChildrenType(childrenType)) {
		hydrateChildrenWithUnknownType(children, dom, lifecycle, context);
	} else if (!isTextChildrenType(childrenType)) {
		if (process.env.NODE_ENV !== 'production') {
			throwError('Bad childrenType value specified when attempting to hydrateChildren.');
		}
		throwError();
	}
}

function hydrateStaticVElement(node, dom) {
	const children = node.children;

	if (!isNull(children)) {
		if (!isStringOrNumber(children) && !isInvalid(children)) {
			let childNode = dom.firstChild;

			if (isArray(children)) {
				for (let i = 0; i < children.length; i++) {
					const child = children[i];

					if (!isStringOrNumber(child) && !isInvalid(child)) {
						normaliseChildNodes(childNode);
						hydrateStaticVElement(child, normaliseChildNodes(childNode));
					}
					childNode = childNode.nextSibling;
				}
			} else {
				normaliseChildNodes(childNode);
				hydrateStaticVElement(children, childNode);
			}
		}
	}
}

function hydrateOptVElement(optVElement, dom, lifecycle, context) {
	const bp = optVElement.bp;
	const bp0 = bp.v0;
	const staticVElement = bp.staticVElement;

	hydrateStaticVElement(staticVElement, dom);
	optVElement.dom = dom;
	if (!isNull(bp0)) {
		hydrateOptVElementValue(optVElement, bp0, optVElement.v0, bp.d0, dom, lifecycle, context);
		const bp1 = bp.v1;

		if (!isNull(bp1)) {
			hydrateOptVElementValue(optVElement, bp1, optVElement.v1, bp.d1, dom, lifecycle, context);
			const bp2 = bp.v2;

			if (!isNull(bp2)) {
				hydrateOptVElementValue(optVElement, bp2, optVElement.v2, bp.d2, dom, lifecycle, context);
				const bp3 = bp.v3;

				if (!isNull(bp3)) {
					const v3 = optVElement.v3;
					const d3 = bp.d3;
					const bp3 = bp.v3;

					for (let i = 0; i < bp3.length; i++) {
						hydrateOptVElementValue(optVElement, bp3[i], v3[i], d3[i], dom, lifecycle, context);
					}
				}
			}
		}
	}
}

function hydrateVText(vText, dom) {
	vText.dom = dom;
}

function hydrateVFragment(vFragment, currentDom, lifecycle, context) {
	const children = vFragment.children;
	const parentDom = currentDom.parentNode;
	const pointer = vFragment.pointer = document.createTextNode('');

	for (let i = 0; i < children.length; i++) {
		const child = normaliseChild(children, i);
		const childDom = currentDom;

		if (isObject(child)) {
			hydrate(child, childDom, lifecycle, context);
		}
		currentDom = currentDom.nextSibling;
	}
	parentDom.insertBefore(pointer, currentDom);
}

function hydrateOptVElementValue(optVElement, valueType, value, descriptor, dom, lifecycle, context) {
	switch (valueType) {
		case ValueTypes.CHILDREN:
			hydrateChildren(descriptor, value, dom, lifecycle, context);
			break;
		case ValueTypes.PROP_SPREAD:
			debugger;
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
			patchProp(descriptor, null, value, dom, false);
			break;
		default:
		// TODO
	}
}

function hydrate(input, dom, lifecycle, context) {
	normaliseChildNodes(dom);
	if (isOptVElement(input)) {
		hydrateOptVElement(input, dom, lifecycle, context);
	} else if (isVComponent(input)) {
		hydrateVComponent(input, dom, lifecycle, context);
	} else if (isVElement(input)) {
		hydrateVElement(input, dom, lifecycle, context);
	} else if (isVFragment(input)) {
		hydrateVFragment(input, dom, lifecycle, context);
	} else if (isVText(input)) {
		hydrateVText(input, dom);
	} else if (isVPlaceholder(input)) {
		debugger;
	} else {
		if (process.env.NODE_ENV !== 'production') {
			throwError('bad input argument called on hydrate(). Input argument may need normalising.');
		}
		throwError();
	}
}

export default function hydrateRoot(input, parentDom, lifecycle) {
	if (parentDom && parentDom.nodeType === 1) {
		const rootNode = parentDom.querySelector('[data-infernoroot]');

		if (rootNode && rootNode.parentNode === parentDom) {
			rootNode.removeAttribute('data-infernoroot');
			hydrate(input, rootNode, lifecycle, {});
			return true;
		}
	}
	return false;
}
