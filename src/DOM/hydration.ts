import {
	createClassComponentInstance,
	createFunctionalComponentInput,
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
	process
} from '../shared';
import {
	mountElement,
	mountClassComponentCallbacks,
	mountFunctionalComponentCallbacks,
	mountText,
	mountRef,
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

		if (!isUndefined(defaultProps)) {
			copyPropsTo(defaultProps, props);
			vNode.props = props;
		}
		const instance = createClassComponentInstance(vNode, type, props, context, _isSVG);
		// If instance does not have componentWillUnmount specified we can enable fastUnmount
		const prevFastUnmount = lifecycle.fastUnmount;
		const input = instance._lastInput;

		// we store the fastUnmount value, but we set it back to true on the lifecycle
		// we do this so we can determine if the component render has a fastUnmount or not
		lifecycle.fastUnmount = true;
		instance._vComponent = vNode;
		instance._vNode = vNode;
		hydrate(input, dom, lifecycle, instance._childContext, _isSVG);
		// we now create a lifecycle for this component and store the fastUnmount value
		const subLifecycle = instance._lifecycle = new Lifecycle();

		// children lifecycle can fastUnmount if itself does need unmount callback and within its cycle there was none
		subLifecycle.fastUnmount = isUndefined(instance.componentWillUnmount) && lifecycle.fastUnmount;
		// higher lifecycle can fastUnmount only if previously it was able to and this children doesnt have any
		lifecycle.fastUnmount = prevFastUnmount && subLifecycle.fastUnmount;
		mountClassComponentCallbacks(vNode, ref, instance, lifecycle);
		options.findDOMNodeEnabled && componentToDOMNodeMap.set(instance, dom);
		vNode.children = instance;
	} else {
		const input = createFunctionalComponentInput(vNode, type, props, context);
		hydrate(input, dom, lifecycle, context, isSVG);
		vNode.children = input;
		vNode.dom = input.dom;
		mountFunctionalComponentCallbacks(ref, dom, lifecycle);
	}
}

function hydrateElement(vNode, dom, lifecycle: Lifecycle, context, isSVG) {
	const tag = vNode.type;
	const children = vNode.children;
	const props = vNode.props;
	const events = vNode.events;
	const flags = vNode.flags;
	const ref = vNode.ref;

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
		if (props) {
			for (let prop in props) {
				patchProp(prop, null, props[prop], dom, isSVG, lifecycle);
			}
		}
		if (events) {
			for (let name in events) {
				patchEvent(name, null, events[name], dom, lifecycle);
			}
		}
		if (ref) {
			mountRef(dom, ref, lifecycle);
		}
	}
}

function hydrateChildren(children, dom, lifecycle: Lifecycle, context, isSVG) {
	normalizeChildNodes(dom);
	const domNodes = Array.prototype.slice.call(dom.childNodes);
	let childNodeIndex = 0;

	if (isArray(children)) {
		for (let i = 0; i < children.length; i++) {
			const child = children[i];

			if (isObject(child) && !isNull(child)) {
				hydrate(child, domNodes[childNodeIndex++], lifecycle, context, isSVG);
			}
		}
	} else if (isObject(children)) {
		hydrate(children, dom.firstChild, lifecycle, context, isSVG);
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
