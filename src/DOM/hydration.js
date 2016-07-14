import {
	isArray,
	isStringOrNumber,
	isNullOrUndef,
	isInvalid,
	isFunction,
	addChildrenToProps,
	isStatefulComponent,
	isBrowser
} from './../core/utils';
import {
	replaceNode,
	handleAttachedHooks,
	isVText,
	normaliseChild,
	isVPlaceholder,
	isVFragment
} from './utils';
import {
	mountRef,
	handleSelects,
	mountAttributes,
	mountBlueprintAttrs,
	mountBlueprintEvents,
	mountEvents,
	mountVText
} from './mounting';
import { patch, patchStyle } from './patching';
import { createVPlaceholder } from '../core/shapes';

function hydrateChild(child, childNodes, counter, parentDom, lifecycle, context, instance) {
	const domNode = childNodes[counter.i];

	if (isVText(child)) {
		const text = child.text;

		child.dom = domNode;
		if (domNode.nodeType === 3 && text !== '') {
			domNode.nodeValue = text;
		} else {
			const newDomNode = mountVText(text);

			replaceNode(parentDom, newDomNode, domNode);
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
			const rebuild = hydrateChild(normaliseChild(items, i), childNodes, counter, parentDom, lifecycle, context, instance);

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
		const rebuild = hydrateNode(child, domNode, parentDom, lifecycle, context, instance, false);

		if (rebuild) {
			return true;
		}
	}
	counter.i++;
}

function getChildNodesWithoutComments(domNode) {
	const childNodes = [];
	const rawChildNodes = domNode.childNodes;
	let length = rawChildNodes.length;
	let i = 0;

	while (i < length) {
		const rawChild = rawChildNodes[i];

		if (rawChild.nodeType === 8) {
			if (rawChild.data === '!') {
				const placeholder = document.createTextNode('');

				domNode.replaceChild(placeholder, rawChild);
				childNodes.push(placeholder);
				i++;
			} else {
				domNode.removeChild(rawChild);
				length--;
			}
		} else {
			childNodes.push(rawChild);
			i++;
		}
	}
	return childNodes;
}

function hydrateComponent(node, Component, props, hooks, children, domNode, parentDom, lifecycle, context, lastInstance, isRoot) {
	props = addChildrenToProps(children, props);

	if (isStatefulComponent(Component)) {
		const instance = node.instance = new Component(props);

		instance._patch = patch;
		if (!isNullOrUndef(lastInstance) && props.ref) {
			mountRef(lastInstance, props.ref, instance);
		}
		const childContext = instance.getChildContext();

		if (!isNullOrUndef(childContext)) {
			context = Object.assign({}, context, childContext);
		}
		instance.context = context;
		instance._unmounted = false;
		instance._parentNode = node;
		if (lastInstance) {
			instance._parentComponent = lastInstance;
		}
		instance._pendingSetState = true;
		instance.componentWillMount();
		let nextNode = instance.render();

		instance._pendingSetState = false;
		if (isInvalid(nextNode)) {
			nextNode = createVPlaceholder();
		}
		hydrateNode(nextNode, domNode, parentDom, lifecycle, context, instance, isRoot);
		instance._lastNode = nextNode;
		instance.componentDidMount();

	} else {
		const instance = node.instance = Component(props);

		if (!isNullOrUndef(hooks)) {
			if (!isNullOrUndef(hooks.componentWillMount)) {
				hooks.componentWillMount(null, props);
			}
			if (!isNullOrUndef(hooks.componentDidMount)) {
				lifecycle.addListener(() => {
					hooks.componentDidMount(domNode, props);
				});
			}
		}
		return hydrateNode(instance, domNode, parentDom, lifecycle, context, instance, isRoot);
	}
}

function hydrateNode(node, domNode, parentDom, lifecycle, context, instance, isRoot) {
	const bp = node.bp;
	const tag = node.tag || bp.tag;

	if (isFunction(tag)) {
		node.dom = domNode;
		hydrateComponent(node, tag, node.attrs || {}, node.hooks, node.children, domNode, parentDom, lifecycle, context, instance, isRoot);
	} else {
		if (
			domNode.nodeType !== 1 ||
			tag !== domNode.tagName.toLowerCase()
		) {
			// TODO remake node
		} else {
			node.dom = domNode;
			const hooks = node.hooks;

			if ((bp && bp.hasHooks === true) || !isNullOrUndef(hooks)) {
				handleAttachedHooks(hooks, lifecycle, domNode);
			}
			const children = node.children;

			if (!isNullOrUndef(children)) {
				if (isStringOrNumber(children)) {
					if (domNode.textContent !== children) {
						domNode.textContent = children;
					}
				} else {
					const childNodes = getChildNodesWithoutComments(domNode);
					const counter = { i: 0 };
					let rebuild = false;

					if (isArray(children)) {
						for (let i = 0; i < children.length; i++) {
							rebuild = hydrateChild(normaliseChild(children, i), childNodes, counter, domNode, lifecycle, context, instance);

							if (rebuild) {
								break;
							}
						}
					} else {
						if (childNodes.length === 1) {
							rebuild = hydrateChild(children, childNodes, counter, domNode, lifecycle, context, instance);
						} else {
							rebuild = true;
						}
					}

					if (rebuild) {
						// TODO scrap children and rebuild again
					}
				}
			}
			const className = node.className;
			const style = node.style;

			if (!isNullOrUndef(className)) {
				domNode.className = className;
			}
			if (!isNullOrUndef(style)) {
				patchStyle(null, style, domNode);
			}
			if (bp && bp.hasAttrs === true) {
				mountBlueprintAttrs(node, bp, domNode, instance);
			} else {
				const attrs = node.attrs;

				if (!isNullOrUndef(attrs)) {
					handleSelects(node);
					mountAttributes(node, attrs, Object.keys(attrs), domNode, instance);
				}
			}
			if (bp && bp.hasEvents === true) {
				mountBlueprintEvents(node, bp, domNode);
			} else {
				const events = node.events;

				if (!isNullOrUndef(events)) {
					mountEvents(events, Object.keys(events), domNode);
				}
			}
		}
	}
}
const documetBody = isBrowser ? document.body : null;

export default function hydrate(node, parentDom, lifecycle) {
	if (parentDom && parentDom.nodeType === 1) {
		const rootNode = parentDom.querySelector('[data-infernoroot]');

		if (rootNode && rootNode.parentNode === parentDom) {
			hydrateNode(node, rootNode, parentDom, lifecycle, {}, true);
			return true;
		}
	}
	// clear parentDom, unless it's document.body
	if (parentDom !== documetBody) {
		parentDom.textContent = '';
	} else {
		console.warn('Inferno Warning: rendering to the "document.body" is dangerous! Use a dedicated container element instead.');
	}
	return false;
}
