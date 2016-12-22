import {
	createStatefulComponentInstance,
	createStatelessComponentInput,
	replaceChild,
} from './utils';
import {
	isArray,
	isInvalid,
	isNull,
	isObject,
	isUndefined,
	throwError,
	EMPTY_OBJ,
} from '../shared';
import {
	mountElement,
	mountStatefulComponentCallbacks,
	mountStatelessComponentCallbacks,
	mountText,
} from './mounting';
import options from '../core/options';
import Lifecycle from './lifecycle';
import {
	VNodeFlags,
} from '../core/structures';
import {
	copyPropsTo
} from '../core/normalization';
import { componentToDOMNodeMap } from './rendering';
import {
	patchProp,
	patchEvent
} from './patching';
import processElement from './wrappers/processElement';
import { svgNS } from './constants';

export function normalizeChildNodes(dom) {
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

function hydrateComponent(vNode, dom, lifecycle: Lifecycle, context, isSVG, isClass) {
	const type = vNode.type;
	const props = vNode.props || EMPTY_OBJ;
	const ref = vNode.ref;

	vNode.dom = dom;
	if (isClass) {
		const _isSVG = dom.namespaceURI === svgNS;
		const defaultProps = type.defaultProps;

		lifecycle.fastUnmount = false;
		if (!isUndefined(defaultProps)) {
			copyPropsTo(defaultProps, props);
			vNode.props = props;
		}
		const instance = createStatefulComponentInstance(vNode, type, props, context, _isSVG);
		const input = instance._lastInput;
		const fastUnmount = lifecycle.fastUnmount;

		// we store the fastUnmount value, but we set it back to true on the lifecycle
		// we do this so we can determine if the component render has a fastUnmount or not
		lifecycle.fastUnmount = true;
		instance._vComponent = vNode;
		instance._vNode = vNode;
		hydrate(input, dom, lifecycle, instance._childContext, _isSVG);
		const subLifecycle = instance._lifecycle = new Lifecycle();

		subLifecycle.fastUnmount = lifecycle.fastUnmount;
		// we then set the lifecycle fastUnmount value back to what it was before the mount
		lifecycle.fastUnmount = fastUnmount;
		mountStatefulComponentCallbacks(vNode, ref, instance, lifecycle);
		options.findDOMNodeEnabled && componentToDOMNodeMap.set(instance, dom);
		vNode.children = instance;
	} else {
		const input = createStatelessComponentInput(vNode, type, props, context);

		hydrate(input, dom, lifecycle, context, isSVG);
		vNode.children = input;
		vNode.dom = input.dom;
		mountStatelessComponentCallbacks(ref, dom, lifecycle);
	}
}

function hydrateElement(vNode, dom, lifecycle: Lifecycle, context, isSVG) {
	const tag = vNode.type;
	const children = vNode.children;
	const props = vNode.props;
	const events = vNode.events;
	const flags = vNode.flags;

	if (isSVG || (flags & VNodeFlags.SvgElement)) {
		isSVG = true;
	}
	if (dom.nodeType !== 1 || dom.tagName.toLowerCase() !== tag) {
		const newDom = mountElement(vNode, null, lifecycle, context, isSVG);

		vNode.dom = newDom;
		replaceChild(dom.parentNode, newDom, dom);
	} else {
		vNode.dom = dom;
		if (children) {
			hydrateChildren(children, dom, lifecycle, context, isSVG);
		}
		if (!(flags & VNodeFlags.HtmlElement)) {
			processElement(flags, vNode, dom);
		}
		for (let prop in props) {
			patchProp(prop, null, props[prop], dom, isSVG, lifecycle);
		}
		for (let name in events) {
			patchEvent(name, null, events[name], dom, lifecycle);
		}
	}
}

function hydrateChildren(children, dom, lifecycle: Lifecycle, context, isSVG) {
	normalizeChildNodes(dom);
	const domNodes = dom.childNodes;
	let childNodeIndex = 0;

	if (isArray(children)) {
		for (let i = 0; i < children.length; i++) {
			const child = children[i];

			if (isObject(child) && !isNull(child)) {
				setTimeout(hydrate, 0, child, domNodes[childNodeIndex++], lifecycle, context, isSVG);
			}
		}
	} else if (isObject(children)) {
		setTimeout(hydrate, 0, children, dom.firstChild, lifecycle, context, isSVG);
	}
}

function hydrateText(vNode, dom) {
	if (dom.nodeType === 3) {
		const newDom = mountText(vNode, null);

		vNode.dom = newDom;
		replaceChild(dom.parentNode, newDom, dom);
	} else {
		vNode.dom = dom;
	}
}

function hydrateVoid(vNode, dom) {
	vNode.dom = dom;
}

function hydrate(vNode, dom, lifecycle: Lifecycle, context, isSVG) {
	if (process.env.NODE_ENV !== 'production') {
		if (isInvalid(dom)) {
			throwError(`failed to hydrate. The server-side render doesn't match client side.`);
		}
	}
	const flags = vNode.flags;

	if (flags & VNodeFlags.Component) {
		return hydrateComponent(vNode, dom, lifecycle, context, isSVG, flags & VNodeFlags.ComponentClass);
	} else if (flags & VNodeFlags.Element) {
		return hydrateElement(vNode, dom, lifecycle, context, isSVG);
	} else if (flags & VNodeFlags.Text) {
		return hydrateText(vNode, dom);
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
	if (parentDom && parentDom.nodeType === 1 && parentDom.firstChild) {
		hydrate(input, parentDom.firstChild, lifecycle, {}, false);
		return true;
	}
	return false;
}
