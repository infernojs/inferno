import { isArray, isStringOrNumber, isNullOrUndefined, isInvalidNode, isFunction, addChildrenToProps, isStatefulComponent } from './../core/utils';
import { createNullNode, replaceNode, handleAttachedHooks } from './utils';
import { mountRef, handleSelects, mountAttributes, mountBlueprintAttrs, mountBlueprintEvents, mountEvents } from './mounting';
import { patch, patchStyle } from './patching';

function hydrateChild(child, domNode, parentChildNodes, parentDom, lifecycle, context, instance) {
	if (isStringOrNumber(child)) {
		if (domNode.nodeType === 3 && child !== '') {
			domNode.nodeValue = child;
		} else {
			const textNode = document.createTextNode(child);

			replaceNode(parentDom, textNode, domNode);
			parentChildNodes.splice(parentChildNodes.indexOf(domNode), 1, textNode);
		}
	} else {
		hydrateNode(child, domNode, parentDom, lifecycle, context, instance, false);
	}
}

function getChildNodesWithoutComments(domNode) {
	const childNodes = [];
	const rawChildNodes = domNode.childNodes;
	let length = rawChildNodes.length;
	let i = 0;

	while (i < length) {
		const rawChild = rawChildNodes[i];

		if (rawChild.nodeType === 8) {
			domNode.removeChild(rawChild);
			length--;
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
		if (!isNullOrUndefined(lastInstance) && props.ref) {
			mountRef(lastInstance, props.ref, instance);
		}
		const childContext = instance.getChildContext();

		if (!isNullOrUndefined(childContext)) {
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
		const nextNode = instance.render();

		instance._pendingSetState = false;
		if (!isInvalidNode(nextNode)) {
			hydrateNode(nextNode, domNode, parentDom, lifecycle, context, instance, isRoot);
			instance._lastNode = nextNode;
			instance.componentDidMount();
		} else {
			instance._lastNode = createNullNode();
		}
	} else {
		const instance = node.instance = Component(props);

		if (!isNullOrUndefined(hooks)) {
			if (!isNullOrUndefined(hooks.componentWillMount)) {
				hooks.componentWillMount(null, props);
			}
			if (!isNullOrUndefined(hooks.componentDidMount)) {
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
			// remake node
			debugger;
		} else {
			node.dom = domNode;
			const hooks = node.hooks;

			if (bp.hasHooks === true || !isNullOrUndefined(hooks)) {
				handleAttachedHooks(hooks, lifecycle, domNode);
			}
			const children = node.children;

			if (!isNullOrUndefined(children)) {
				if (isStringOrNumber(children)) {
					if (domNode.textContent !== children) {
						domNode.textContent = children;
					}
				} else {
					const childNodes = getChildNodesWithoutComments(domNode);

					if (isArray(children)) {
						node.domChildren = childNodes;
						if (childNodes.length === children.length) {
							for (let i = 0; i < children.length; i++) {
								hydrateChild(children[i], childNodes[i], childNodes, domNode, lifecycle, context, instance);
							}
						} else {
							// recreate children?
							debugger;
						}
					} else {
						if (childNodes.length === 1) {
							hydrateChild(children, childNodes[0], childNodes, domNode, lifecycle, context, instance);
						} else {
							// recreate child
							debugger;
						}
					}
				}
			}
			const className = node.className;
			const style = node.style;

			if (!isNullOrUndefined(className)) {
				domNode.className = className;
			}
			if (!isNullOrUndefined(style)) {
				patchStyle(null, style, domNode);
			}
			if (bp.hasAttrs === true) {
				mountBlueprintAttrs(node, bp, domNode, instance);
			} else {
				const attrs = node.attrs;

				if (!isNullOrUndefined(attrs)) {
					handleSelects(node);
					mountAttributes(node, attrs, Object.keys(attrs), domNode, instance);
				}
			}
			if (bp.hasEvents === true) {
				mountBlueprintEvents(node, bp, domNode);
			} else {
				const events = node.events;

				if (!isNullOrUndefined(events)) {
					mountEvents(events, Object.keys(events), domNode);
				}
			}
		}
	}
}

const documetBody = document.body;

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