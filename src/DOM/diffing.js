import { isArray, isStringOrNumber, isFunction, isNullOrUndefined, isStatefulComponent, isInvalidNode, isString } from '../core/utils';
import { replaceNode, SVGNamespace, MathNamespace } from './utils';
import { patchNonKeyedChildren, patchKeyedChildren, patchAttribute, patchComponent, patchStyle, updateTextNode } from './patching';
import { mountChildren, mountNode } from './mounting';
import { removeEventFromRegistry, addEventToRegistry, addEventToNode, removeEventFromNode, doesNotBubble } from './events';
import { selectValue } from './utils';

function diffChildren(lastNode, nextNode, dom, namespace, lifecycle, context, staticCheck, instance) {
	const nextChildren = nextNode.children;
	const lastChildren = lastNode.children;

	if (lastChildren === nextChildren) {
		return;
	}

	let domChildren = null;

	if (lastNode.domChildren) {
		domChildren = nextNode.domChildren = lastNode.domChildren;
	}
	if (!isInvalidNode(lastChildren)) {
		if (!isInvalidNode(nextChildren)) {
			if (isArray(lastChildren)) {
				if (isArray(nextChildren)) {
					if (domChildren === null) {
						patchKeyedChildren(lastChildren, nextChildren, dom, namespace, lifecycle, context, instance);
					} else {
						patchNonKeyedChildren(lastChildren, nextChildren, dom, domChildren || [], namespace, lifecycle, context, instance, 0);
					}
				} else {
					patchNonKeyedChildren(lastChildren, [nextChildren], dom, domChildren || [], namespace, lifecycle, context, instance, 0);
				}
			} else {
				if (isArray(nextChildren)) {
					patchNonKeyedChildren([lastChildren], nextChildren, dom, domChildren || (nextNode.domChildren = [dom.firstChild]), namespace, lifecycle, context, instance, 0);
				} else if (isStringOrNumber(nextChildren)) {
					updateTextNode(dom, lastChildren, nextChildren);
				} else {
					diffNodes(lastChildren, nextChildren, dom, namespace, lifecycle, context, staticCheck, instance);
				}
			}
		} else {
			dom.textContent = ''; // TODO! Why this? Very slow. If the point is to remove the node? dom.removeChild(dom.firstchild);
		}
	} else {
		if (isStringOrNumber(nextChildren)) {
			updateTextNode(dom, lastChildren, nextChildren);
		} else if (!isNullOrUndefined(nextChildren)) {
			if (typeof nextChildren === 'object') {
				if (isArray(nextChildren)) {
					mountChildren(nextNode, nextChildren, dom, namespace, lifecycle, context, instance);
				} else {
					mountNode(nextChildren, dom, namespace, lifecycle, context, instance);
				}
			}
		}
	}
}


function diffRef(instance, lastValue, nextValue, dom) {
	if (instance) {
		if (isString(lastValue)) {
			delete instance.refs[lastValue];
		}
		if (isString(nextValue)) {
			instance.refs[nextValue] = dom;
		}
	}
}

function diffAttributes(lastNode, nextNode, dom, instance) {
	if (lastNode.tag === 'select') {
		selectValue(nextNode);
	}
	const nextAttrs = nextNode.attrs;
	const lastAttrs = lastNode.attrs;
	const nextAttrsIsUndef = isNullOrUndefined(nextAttrs);
	const lastAttrsIsUndef = isNullOrUndefined(lastAttrs);


	if (!nextAttrsIsUndef) {
		const nextAttrsKeys = Object.keys(nextAttrs);
		const attrKeysLength = nextAttrsKeys.length;

		for (let i = 0; i < attrKeysLength; i++) {
			const attr = nextAttrsKeys[i];
			const lastAttrVal = !lastAttrsIsUndef && lastAttrs[attr];
			const nextAttrVal = nextAttrs[attr];

			if (lastAttrVal !== nextAttrVal) {
				if (attr === 'ref') {
					diffRef(instance, lastAttrVal, nextAttrVal, dom);
				} else {
					patchAttribute(attr, nextAttrVal, dom);
				}
			}
		}
	}
	if (!lastAttrsIsUndef) {
		const lastAttrsKeys = Object.keys(lastAttrs);
		const attrKeysLength = lastAttrsKeys.length;

		for (let i = 0; i < attrKeysLength; i++) {
			const attr = lastAttrsKeys[i];

			if (nextAttrsIsUndef || isNullOrUndefined(nextAttrs[attr])) {
				if (attr === 'ref') {
					diffRef(instance, lastAttrs[attr], null, dom);
				} else {
					dom.removeAttribute(attr);
				}
			}
		}
	}
}

function diffEvents(lastNode, nextNode) {
	const lastEvents = lastNode.events;

	if (!isNullOrUndefined(lastEvents)) {
		const lastEventsKeys = Object.keys(lastEvents);
		const nextEvents = nextNode.events;

		if (!isNullOrUndefined(nextEvents)) {
			for (let i = 0; i < lastEventsKeys.length; i++) {
				const event = lastEventsKeys[i];
				const nextEvent = nextEvents[event];
				const lastEvent = lastEvents[event];

				if (isNullOrUndefined(nextEvent)) {
					if (doesNotBubble(event)) {
						removeEventFromNode(event, lastNode, lastEvent);
					} else {
						removeEventFromRegistry(event, lastEvent);
					}
				} else if (nextEvent !== lastEvent) {
					if (doesNotBubble(event)) {
						removeEventFromNode(event, lastNode, lastEvent);
						addEventToNode(event, nextNode, nextEvent);
					} else {
						removeEventFromRegistry(event, lastEvent); // remove old
						addEventToRegistry(event, nextNode, nextEvent); // add new
					}
				}
			}
		} else {
			for (let i = 0; i < lastEventsKeys.length; i++) {
				const event = lastEventsKeys[i];
				const lastEvent = lastEvents[event];

				if (doesNotBubble(event)) {
					removeEventFromNode(event, lastNode, lastEvent);
				} else {
					removeEventFromRegistry(event, lastEvent);
				}
			}
		}
	}
}

export function diffNodes(lastNode, nextNode, parentDom, namespace, lifecycle, context, staticCheck, instance) {
	if (nextNode === false || nextNode === null) {
		return;
	}
	if (!isNullOrUndefined(nextNode.then)) {
		nextNode.then(node => {
			diffNodes(lastNode, node, parentDom, namespace, lifecycle, context, staticCheck, instance);
		}
	);

	} else if (isStringOrNumber(lastNode)) {
		if (isStringOrNumber(nextNode)) {
			parentDom.firstChild.nodeValue = nextNode;
		} else {
			console.log(lastNode);
			// TODO! Fix this. URGENT! If you do a console.log you will see two blank line, and a text string.
			// TODO! Find out why there is two empty blank lines
			// TODO! Don't replaceNode on a text string
			// TODO! Avoid breaking components
			replaceNode(lastNode, nextNode, parentDom, namespace, lifecycle, context, instance);
		}

	} else {

		const nextHooks = nextNode.hooks;

		// No need for extra validation
		if (nextHooks && nextHooks.willUpdate) {
			nextHooks.willUpdate(lastNode.dom);
		}
		const nextTag = nextNode.tag || ((staticCheck && nextNode.tpl) ? nextNode.tpl.tag : null);
		const lastTag = lastNode.tag || ((staticCheck && lastNode.tpl) ? lastNode.tpl.tag : null);

		namespace = namespace || nextTag === 'svg' ? SVGNamespace : nextTag === 'math' ? MathNamespace : null;

		if (lastTag !== nextTag) {
			const lastNodeInstance = lastNode.instance;

			if (isFunction(lastTag)) {
				// This logic was missing
				if (isFunction(nextTag)) {
					replaceNode(lastNodeInstance || lastNode, nextNode, parentDom, namespace, lifecycle, context, instance);
				} else {
					if (isStatefulComponent(lastTag)) {
						diffNodes(lastNodeInstance._lastNode, nextNode, parentDom, namespace, lifecycle, context, true, instance);
					} else {
						diffNodes(lastNodeInstance, nextNode, parentDom, namespace, lifecycle, context, true, instance);
					}
				}
			} else {
				replaceNode(lastNodeInstance || lastNode, nextNode, parentDom, namespace, lifecycle, context, instance);
			}

		} else if (isNullOrUndefined(lastTag)) {
			nextNode.dom = lastNode.dom;
		} else {

			if (isFunction(lastTag)) {
				// Firefox doesn't like && too much
				if (isFunction(nextTag)) {
					nextNode.instance = lastNode.instance;
					nextNode.dom = lastNode.dom;
					patchComponent(nextNode, nextNode.tag, nextNode.instance, lastNode.attrs || {}, nextNode.attrs || {}, nextNode.hooks, nextNode.children, parentDom, lifecycle, context);
				}
			} else {

				const dom = lastNode.dom;
				const nextClassName = nextNode.className; // TODO: Add support into JSX plugin to transform (class from attr into className property)
				const nextStyle = nextNode.style;

				nextNode.dom = dom;

				if (lastNode !== nextNode) {
					diffChildren(lastNode, nextNode, dom, namespace, lifecycle, context, staticCheck, instance);
					diffAttributes(lastNode, nextNode, dom, instance);
					diffEvents(lastNode, nextNode);
				}

				// node.domTextNodes

				if (lastNode.className !== nextClassName) {
					if (isNullOrUndefined(nextClassName)) {
						dom.removeAttribute('class');
					} else {
						dom.className = nextClassName;
					}
				}

				if (lastNode.style !== nextStyle) {
					patchStyle(lastNode.style, nextStyle, dom);
				}

				if (!isNullOrUndefined(nextHooks) && !isNullOrUndefined(nextHooks.didUpdate)) {
					nextHooks.didUpdate(dom);
				}
			}
		}
	}
}
