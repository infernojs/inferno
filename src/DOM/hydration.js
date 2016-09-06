import {
	isArray,
	isNull,
	isStringOrNumber,
	isString,
	isNullOrUndef,
	isInvalid,
	isFunction,
	isStatefulComponent,
	throwError,
	isObject
} from './../core/utils';
import { replaceChild, normaliseChild } from './utils';
import { mountVText } from './mounting';
import { patch } from './patching';
import {
	createVPlaceholder,
	isVPlaceholder,
	isVFragment,
	isVText,
	isVElement,
	isVComponent,
	isOptVElement,
	isKeyedListChildrenType,
	isTextChildrenType,
	isNodeChildrenType,
	isNonKeyedListChildrenType,
	isUnknownChildrenType,
	ValueTypes
} from '../core/shapes';
import { componentToDOMNodeMap } from './rendering';

function hydrateChild(child, childNodes, counter, parentDom, lifecycle, context) {
	const domNode = childNodes[counter.i];

	if (isVText(child)) {
		const text = child.text;

		child.dom = domNode;
		if (domNode.nodeType === 3 && text !== '') {
			domNode.nodeValue = text;
		} else {
			const newDomNode = mountVText(text);

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
		// TODO: Import missing
		const rebuild = hydrateNode(child, domNode, parentDom, lifecycle, context, false);

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
	const Component = vComponent.component;
	const props = vComponent.props;
	const hooks = vComponent.hooks;
	const ref = vComponent.ref;

	vComponent.dom = dom;
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
		instance._vComponent = vComponent;
		instance.componentWillMount();
		let input = instance.render();

		if (isInvalid(input)) {
			input = createVPlaceholder();
		}
		instance._pendingSetState = false;
		hydrate(input, dom, lifecycle, context);
		instance._lastInput = input;
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
			lifecycle.addListener(() => instance.componentDidMount());
		}
		componentToDOMNodeMap.set(instance, dom);
		vComponent.instance = instance;
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
			input = createVPlaceholder();
		}
		hydrate(input, dom, lifecycle, context);
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
	const props = vElement.props;
	const ref = vElement.ref;

	vElement.dom = dom;
	if (children) {
		hydrateChildren(vElement.childrenType, children, dom, lifecycle, context);
	}
}

function hydrateArrayChildrenWithType(children, dom, lifecycle, context, isSVG) {
	for (let i = 0; i < children.length; i++) {
		debugger;
	}
}

function hydrateChildrenWithUnknownType(children, dom, lifecycle, context) {
	if (isArray(children)) {
		for (let i = 0; i < children.length; i++) {
			const child = normaliseChild(children, i);

			if (isObject(child)) {
				hydrate(child, dom, lifecycle, context);
			}
		}
	} else if (isObject(children)) {
		hydrate(children, dom.firstChild, lifecycle, context);
	}
}

function hydrateChildren(childrenType, children, dom, lifecycle, context) {
	if (isNodeChildrenType(childrenType)) {
		hydrate(children, dom, lifecycle, context);
	} else if (isKeyedListChildrenType(childrenType) || isNonKeyedListChildrenType(childrenType)) {
		hydrateArrayChildrenWithType(childrem, dom, lifecycle, context);
	} else if (isUnknownChildrenType(childrenType)) {
		hydrateChildrenWithUnknownType(children, dom);
	} else if (!isTextChildrenType(childrenType)) {
		if (process.env.NODE_ENV !== 'production') {
			throwError('Bad childrenType value specified when attempting to hydrateChildren.');
		}
		throwError();
	}
}

function hydrateOptVElement(optVElement, dom, lifecycle, context) {
	const bp = optVElement.bp;
	const bp0 = bp.v0;

	optVElement.dom = dom;
	if (!isNull(bp0)) {
		hydrateOptVElementValue(optVElement, bp0, optVElement.v0, bp.d0, dom, context);
		const bp1 = bp.v1;

		if (!isNull(bp1)) {
			hydrateOptVElementValue(optVElement, bp1, optVElement.v1, bp.d1, dom, context);
			const bp2 = bp.v2;

			if (!isNull(bp2)) {
				hydrateOptVElementValue(optVElement, bp2, optVElement.v2, bp.d2, dom, context);
				const bp3 = bp.v3;

				if (!isNull(bp3)) {
					const v3 = optVElement.v3;
					const d3 = bp.d3;
					const bp3 = bp.v3;

					for (let i = 0; i < bp3.length; i++) {
						hydrateOptVElementValue(optVElement, bp3[i], v3[i], d3[i], dom, context);
					}
				}
			}
		}
	}
}

function hydrateVText(vText, dom) {
	vText.dom = dom;
}

function hydrateVFragment(vFragment, dom) {
	const children = vFragment.children;
	const childNodes = dom.childNodes;

	for (let i = 0; i < childNodes.length; i++) {
		const child = childNodes[i];

		debugger;
		// if (child.nodeValue === children[0]) {
		// 	debugger;
		// }
	}
}

function hydrateOptVElementValue(optVElement, valueType, value, descriptor, dom, lifecycle, context) {
	switch (valueType) {
		case ValueTypes.CHILDREN:
			hydrateChildren(descriptor, value, dom, lifecycle, context);
			break;
		case ValueTypes.PROP_SPREAD:
			debugger;
			break;
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
		hydrateVFragment(input, dom);
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
