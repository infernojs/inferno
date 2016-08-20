import {
	isArray,
	isNull,
	isStringOrNumber,
	isNullOrUndef,
	isInvalid,
	isFunction,
	isStatefulComponent,
	throwError
} from './../core/utils';
import { replaceChild, normaliseChild, normalise } from './utils';
import { mountVText } from './mounting';
import { patch } from './patching';
import {
	createVPlaceholder,
	isVPlaceholder,
	isVFragment,
	isVText,
	isVElement,
	isVComponent,
	isVTemplate,
	isVNode
} from '../core/shapes';
import { componentToDOMNodeMap } from './rendering';
import {
	isKeyedListChildrenType,
	isTextChildrenType,
	isNodeChildrenType,
	isNonKeyedListChildrenType,
	isUnknownChildrenType
} from '../core/ChildrenTypes';

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
		const rebuild = hydrateNode(child, domNode, parentDom, lifecycle, context, false);

		if (rebuild) {
			return true;
		}
	}
	counter.i++;
}

export function normaliseChildNodes(dom) {
	const childNodes = [];
	const rawChildNodes = dom.childNodes;
	let length = rawChildNodes.length;
	let i = 0;

	while (i < length) {
		const rawChild = rawChildNodes[i];

		if (rawChild.nodeType === 8) {
			if (rawChild.data === '!') {
				const placeholder = document.createTextNode('');

				dom.replaceChild(placeholder, rawChild);
				childNodes.push(placeholder);
				i++;
			} else {
				dom.removeChild(rawChild);
				length--;
			}
		} else {
			childNodes.push(rawChild);
			i++;
		}
	}
	return childNodes;
}

function hydrateVComponent(vComponent, dom, lifecycle, context) {
	const Component = vComponent._component;
	const props = vComponent._props;
	const hooks = vComponent._hooks;
	const ref = vComponent._ref;

	vComponent._dom = dom;
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
			input = createVPlaceholder();
		}
		hydrate(input, dom, lifecycle, context);
	}
}

function hydrateVElement(vElement, dom, lifecycle, context) {
	const tag = vElement._tag;

	debugger;

	// if (isFunction(tag)) {
	// 	node.dom = domNode;
	// 	hydrateComponent(node, tag, node._props || {}, domNode, parentDom, lifecycle, context);
	// } else {
	// 	if (
	// 		domNode.nodeType !== 1 ||
	// 		tag !== domNode.tagName.toLowerCase()
	// 	) {
	// 		// TODO remake node
	// 	} else {
	// 		node.dom = domNode;
	// 		const hooks = node.hooks;

	// 		const children = node.children;

	// 		if (!isNullOrUndef(children)) {
	// 			if (isStringOrNumber(children)) {
	// 				if (domNode.textContent !== children) {
	// 					domNode.textContent = children;
	// 				}
	// 			} else {
	// 				const childNodes = getChildNodesWithoutComments(domNode);
	// 				const counter = { i: 0 };
	// 				let rebuild = false;

	// 				if (isArray(children)) {
	// 					for (let i = 0; i < children.length; i++) {
	// 						rebuild = hydrateChild(normaliseChild(children, i), childNodes, counter, domNode, lifecycle, context);

	// 						if (rebuild) {
	// 							break;
	// 						}
	// 					}
	// 				} else {
	// 					if (childNodes.length === 1) {
	// 						rebuild = hydrateChild(children, childNodes, counter, domNode, lifecycle, context);
	// 					} else {
	// 						rebuild = true;
	// 					}
	// 				}

	// 				if (rebuild) {
	// 					// TODO scrap children and rebuild again
	// 				}
	// 			}
	// 		}
	// 		const className = node.className;
	// 		const style = node.style;

	// 		if (!isNullOrUndef(className)) {
	// 			domNode.className = className;
	// 		}
	// 		if (!isNullOrUndef(style)) {
	// 			patchStyle(null, style, domNode);
	// 		}
	// 		if (bp && bp.hasAttrs === true) {
	// 			mountBlueprintAttrs(node, bp, domNode);
	// 		} else {
	// 			const attrs = node.attrs;

	// 			if (!isNullOrUndef(attrs)) {
	// 				handleSelects(node);
	// 				mountAttributes(node, attrs, Object.keys(attrs), domNode);
	// 			}
	// 		}
	// 		if (bp && bp.hasEvents === true) {
	// 			mountBlueprintEvents(node, bp, domNode);
	// 		} else {
	// 			const events = node.events;

	// 			if (!isNullOrUndef(events)) {
	// 				// mountEvents(events, Object.keys(events), domNode);
	// 			}
	// 		}
	// 	}
	// }
}

// const childNodes = normaliseChildNodes(dom);

function hydrateArrayChildrenWithType(children, dom, lifecycle, context, isSVG) {
	for (let i = 0; i < children.length; i++) {
		// debugger;
	}
}

function hydrateChildrenWithUnknownType(children, dom, lifecycle, context) {
	if (isArray(children)) {
		// debugger;
	} else if (isStringOrNumber(children)) {
		// debugger;
	} else if (!isInvalid(children)) {
		hydrate(children, dom.firstChild, lifecycle, context);
	}
}

function hydrateChildren(childrenType, children, dom, lifecycle, context) {
	if (isTextChildrenType(childrenType)) {
		// debugger;
	} else if (isNodeChildrenType(childrenType)) {
		// debugger;
	} else if (isKeyedListChildrenType(childrenType) || isNonKeyedListChildrenType(childrenType)) {
		hydrateArrayChildrenWithType(childrem, dom, lifecycle, context);
	} else if (isUnknownChildrenType(childrenType)) {
		hydrateChildrenWithUnknownType(children, dom);
	} else {
		if (process.env.NODE_ENV !== 'production') {
			throwError('Bad childrenType value specified when attempting to hydrateChildren.');
		}
		throwError();
	}
}

function hydrateVTemplate(vTemplate, dom, lifecycle, context) {
	const templateReducers = vTemplate._tr;

	templateReducers.hydrate(vTemplate, dom, lifecycle, context);
}

function hydrate(input, dom, lifecycle, context) {
	if (isVTemplate(input)) {
		hydrateVTemplate(input, dom, lifecycle, context);
	} else if (isVElement(input)) {
		hydrateVElement(input, dom, lifecycle, context);
	} else if (isVComponent(input)) {
		hydrateVComponent(input, dom, lifecycle, context);
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

export function hydrateVariableAsChildren(pointer, childrenType) {
	return function hydrateVariableAsChildren(vTemplate, dom, lifecycle, context) {
		hydrateChildren(childrenType, vTemplate.read(pointer), dom, lifecycle, context);
	};
}

export function hydrateVariableAsExpression(pointer) {
	return function hydrateVariableAsExpression(vTemplate, dom, lifecycle, context) {
		let input = vTemplate.read(pointer);

		if (isNullOrUndef(input) || !isVNode(input)) {
			input = normalise(input);
			vTemplate.write(pointer, input);
		}
		return hydrate(input, dom, lifecycle, context);
	};
}

export function hydrateVariableAsText() {
	return function hydrateVariableAsText() {
		// debugger;
	};
}
