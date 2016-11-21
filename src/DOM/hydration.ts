import {
	isArray,
	isInvalid,
	throwError,
	isObject,
	isUndefined
} from '../shared';
import {
	createStatelessComponentInput,
	createStatefulComponentInstance,
	copyPropsTo,
	replaceChild
} from './utils';
import {
	mountStatelessComponentCallbacks,
	mountStatefulComponentCallbacks,
	mountElement
} from './mounting';
import {
	patchProp
} from './patching';
import { componentToDOMNodeMap } from './rendering';
import { svgNS } from './constants';
import {
	VNodeFlags
} from '../core/shapes';
import processElement from './wrappers/processElement';
import { devToolsStatus } from './devtools';

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

function hydrateComponent(vNode, dom, lifecycle, context, isSVG, isClass) {
	const type = vNode.type;
	const props = vNode.props;
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
		const instance = createStatefulComponentInstance(type, props, context, _isSVG, devToolsStatus);
		const input = instance._lastInput;

		instance._vComponent = vNode;
		instance._vNode = vNode;		
		hydrate(input, dom, lifecycle, instance._childContext, _isSVG);
		mountStatefulComponentCallbacks(ref, instance, lifecycle);
		componentToDOMNodeMap.set(instance, dom);
		vNode.children = instance;
	} else {
		const input = createStatelessComponentInput(type, props, context);

		hydrate(input, dom, lifecycle, context, isSVG);
		vNode.children = input;
		vNode.dom = input.dom;
		mountStatelessComponentCallbacks(ref, dom, lifecycle);
	}
}

function hydrateElement(vNode, dom, lifecycle, context, isSVG) {
	const tag = vNode.type;
	const children = vNode.children;
	const props = vNode.props;
	const flags = vNode.flags;
	let rebuildVNode = false;

	if (isSVG || (flags & VNodeFlags.SvgElement)) {
		isSVG = true;
	}
	if (dom.tagName.toLowerCase() !== tag) {
		rebuildVNode = true;
	} else {
		vNode.dom = dom;
		if (children) {
			hydrateChildren(children, dom, lifecycle, context, isSVG);
		}
		if (!(flags & VNodeFlags.HtmlElement)) {
			processElement(flags, vNode, dom);
		}
		for (let prop in props) {
			const value = props[prop];

			patchProp(prop, null, value, dom, isSVG);
		}
	}
	if (rebuildVNode) {
		const newDom = mountElement(vNode, null, lifecycle, context, isSVG);

		vNode.dom = newDom;
		replaceChild(dom.parentNode, newDom, dom);
	}
}

function hydrateChildren(children, dom, lifecycle, context, isSVG) {
	normaliseChildNodes(dom);
	const domNodes = Array.prototype.slice.call(dom.childNodes);

	if (isArray(children)) {
		for (let i = 0; i < children.length; i++) {
			const child = children[i];

			if (isObject(child)) {
				hydrate(child, domNodes[i], lifecycle, context, isSVG);
			}
		}
	} else if (isObject(children)) {
		hydrate(children, dom.firstChild, lifecycle, context, isSVG);
	}
}

function hydrateText(vNode, dom) {
	vNode.dom = dom;
}

function hydrateVoid(vNode, dom) {
	vNode.dom = dom;
}

function hydrate(vNode, dom, lifecycle, context, isSVG) {
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
