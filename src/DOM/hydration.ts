import {
	isArray,
	isString,
	isInvalid,
	throwError,
	isObject,
	// isNullOrUndef
} from '../shared';
import {
	replaceChild,
	// normaliseChild,
	createStatelessComponentInput,
	createStatefulComponentInstance
} from './utils';
import {
	mountText,
	mountStatelessComponentCallbacks,
	mountStatefulComponentCallbacks,
	// mountChildren
} from './mounting';
import {
	patchProp,
	// patchStyle
} from './patching';
import { componentToDOMNodeMap } from './rendering';
import { svgNS } from './constants';
import {
	VNodeFlags
} from '../core/shapes';

function hydrateChild(child, childNodes, counter, parentDom, lifecycle, context) {
	const domNode = childNodes[counter.i];
	const flags = child.flags;

	if (flags & VNodeFlags.Text) {
		const text = child.text;

		child.dom = domNode;
		if (domNode.nodeType === 3 && text !== '') {
			domNode.nodeValue = text;
		} else {
			const newDomNode = mountText(text, null);

			replaceChild(parentDom, newDomNode, domNode);
			childNodes.splice(childNodes.indexOf(domNode), 1, newDomNode);
			child.dom = newDomNode;
		}
	} else if (flags & VNodeFlags.Void) {
		child.dom = domNode;
	} else if (flags & VNodeFlags.Fragment) {
		const items = child.items;

		// this doesn't really matter, as it won't be used again, but it's what it should be given the purpose of VList
		child.dom = document.createDocumentFragment();
		for (let i = 0; i < items.length; i++) {
			const rebuild = hydrateChild(items[i], childNodes, counter, parentDom, lifecycle, context);

			if (rebuild) {
				return true;
			}
		}
		// at the end of every VList, there should be a "pointer". It's an empty TextNode used for tracking the VList
		const pointer = childNodes[counter.i++];

		if (pointer && pointer.nodeType === 3) {
			debugger;
			// child.pointer = pointer;
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

function hydrateComponent(vNode, dom, lifecycle, context, isClass) {
	const type = vNode.type;
	const props = vNode.props;
	const ref = vNode.ref;

	vNode.dom = dom;
	if (isClass) {
		const isSVG = dom.namespaceURI === svgNS;
		const instance = createStatefulComponentInstance(type, props, context, isSVG, null);
		const input = instance._lastInput;

		instance._vComponent = vNode;
		hydrate(input, dom, lifecycle, instance._childContext);
		mountStatefulComponentCallbacks(ref, instance, lifecycle);
		componentToDOMNodeMap.set(instance, dom);
		vNode.instance = instance;
	} else {
		const input = createStatelessComponentInput(type, props, context);

		hydrate(input, dom, lifecycle, context);
		vNode.children = input;
		vNode.dom = input.dom;
		mountStatelessComponentCallbacks(ref, dom, lifecycle);
	}
}

function hydrateElement(vElement, dom, lifecycle, context) {
	const tag = vElement.type;
	const children = vElement.children;
	const props = vElement.props;
	vElement.dom = dom;

	if (dom.tagName.toLowerCase() !== tag) {
		if (process.env.NODE_ENV !== 'production') {
			throwError(`hydrateElement() failed due to mismatch on DOM element tag name. Ensure server-side logic matches client side logic.`);
		}
	}
	for (let prop in props) {
		if (!props.hasOwnProperty(prop)) {
			continue;
		}

		const value = props[prop];

		if (prop === 'key') {
			// TODO: Maybe ?
		} else if (prop === 'ref') {
			// TODO: Maybe ?
		} else if (prop === 'children') {
			// TODO: Maybe ?
		} else {
			patchProp(prop, null, value, dom, false);
		}
	}

	if (children) {
		hydrateChildren(children, dom, lifecycle, context);
	}
}

function hydrateChildren(children, dom, lifecycle, context) {
	const domNodes = Array.prototype.slice.call(dom.childNodes);

	if (isArray(children)) {
		for (let i = 0; i < children.length; i++) {
			const child = children[i];

			if (isObject(child)) {
				hydrate(child, domNodes[i], lifecycle, context);
			}
		}
	} else if (isObject(children)) {
		hydrate(children, dom.firstChild, lifecycle, context);
	}
}

function hydrateText(vNode, dom) {
	vNode.dom = dom;
}

function hydrateVoid(vNode, dom) {
	vNode.dom = dom;
}

function hydrateFragment(vNode, currentDom, lifecycle, context) {
	const children = vNode.children;
	// const parentDom = currentDom.parentNode;
	// const pointer = vNode.pointer = document.createTextNode('');

	for (let i = 0; i < children.length; i++) {
		const child = children[i];
		const childDom = currentDom;

		if (isObject(child)) {
			hydrate(child, childDom, lifecycle, context);
		}
		currentDom = currentDom.nextSibling;
	}
	// parentDom.insertBefore(pointer, currentDom);
}

function hydrate(vNode, dom, lifecycle, context) {
	if (process.env.NODE_ENV !== 'production') {
		if (isInvalid(dom)) {
			throwError(`failed to hydrate. The server-side render doesn't match client side.`);
		}
	}
	const flags = vNode.flags;

	if (flags & VNodeFlags.Component) {
		return hydrateComponent(vNode, dom, lifecycle, context, flags & VNodeFlags.ComponentClass);
	} else if (flags & VNodeFlags.Element) {
		return hydrateElement(vNode, dom, lifecycle, context);
	} else if (flags & VNodeFlags.Text) {
		return hydrateText(vNode, dom);
	} else if (flags & VNodeFlags.Fragment) {
		return hydrateFragment(vNode, dom, lifecycle, context);
	} else if (flags & VNodeFlags.Void) {
		return hydrateVoid(vNode, dom);
	} else {
		if (process.env.NODE_ENV !== 'production') {
			throwError(`hydrate() expects a valid VNode, instead it received an object with the type "${ typeof vNode }".`);
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
