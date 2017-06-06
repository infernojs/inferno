/**
 * @module Inferno-Devtools
 */ /** TypeDoc Comment */

import { options } from 'inferno';
import { isArray, isInvalid, isObject, isStringOrNumber } from 'inferno-shared';
import VNodeFlags from 'inferno-vnode-flags';

function findVNodeFromDom(vNode, dom) {
	if (!vNode) {
		const roots = options.roots;

		for (let i = 0, len = roots.length; i < len; i++) {
			const root = roots[i];
			const result = findVNodeFromDom(root.input, dom);

			if (result) {
				return result;
			}
		}
	} else {
		if (vNode.dom === dom) {
			return vNode;
		}
		const flags = vNode.flags;
		let children = vNode.children;

		if (flags & VNodeFlags.Component) {
			children = children._lastInput || children;
		}
		if (children) {
			if (isArray(children)) {
				for (let i = 0, len = children.length; i < len; i++) {
					const child = children[i];

					if (child) {
						const result = findVNodeFromDom(child, dom);

						if (result) {
							return result;
						}
					}
				}
			} else if (isObject(children)) {
				const result = findVNodeFromDom(children, dom);

				if (result) {
					return result;
				}
			}
		}
	}
}

const instanceMap = new Map();

function getKeyForVNode(vNode) {
	const flags = vNode.flags;

	if (flags & VNodeFlags.ComponentClass) {
		return vNode.children;
	} else {
		return vNode.dom;
	}
}

function getInstanceFromVNode(vNode) {
	const key = getKeyForVNode(vNode);

	return instanceMap.get(key);
}

function createInstanceFromVNode(vNode, instance) {
	const key = getKeyForVNode(vNode);

	instanceMap.set(key, instance);
}

function deleteInstanceForVNode(vNode) {
	const key = getKeyForVNode(vNode);

	instanceMap.delete(key);
}

/**
 * Create a bridge for exposing Inferno's component tree to React DevTools.
 *
 * It creates implementations of the interfaces that ReactDOM passes to
 * devtools to enable it to query the component tree and hook into component
 * updates.
 *
 * See https://github.com/facebook/react/blob/59ff7749eda0cd858d5ee568315bcba1be75a1ca/src/renderers/dom/ReactDOM.js
 * for how ReactDOM exports its internals for use by the devtools and
 * the `attachRenderer()` function in
 * https://github.com/facebook/react-devtools/blob/e31ec5825342eda570acfc9bcb43a44258fceb28/backend/attachRenderer.js
 * for how the devtools consumes the resulting objects.
 */
export function createDevToolsBridge() {
	const ComponentTree = {
		getNodeFromInstance(instance) {
			return instance.node;
		},
		getClosestInstanceFromNode(dom) {
			const vNode = findVNodeFromDom(null, dom);

			return vNode ? updateReactComponent(vNode, null) : null;
		},
	};

	// Map of root ID (the ID is unimportant) to component instance.
	const roots = {};

	findRoots(roots);

	const Mount = {
		_instancesByReactRootID: roots,
		// tslint:disable-next-line:no-empty
		_renderNewRootComponent(instance?) {},
	};

	const Reconciler = {
		// tslint:disable-next-line:no-empty
		mountComponent(instance?) {},
		// tslint:disable-next-line:no-empty
		performUpdateIfNecessary(instance?) {},
		// tslint:disable-next-line:no-empty
		receiveComponent(instance?) {},
		// tslint:disable-next-line:no-empty
		unmountComponent(instance?) {},
	};

	const queuedMountComponents = new Map();
	const queuedReceiveComponents = new Map();
	const queuedUnmountComponents = new Map();

	const queueUpdate = (updater, map, component) => {
		if (!map.has(component)) {
			map.set(component, true);
			requestAnimationFrame(function() {
				updater(component);
				map.delete(component);
			});
		}
	};

	const queueMountComponent = component => queueUpdate(Reconciler.mountComponent, queuedMountComponents, component);
	const queueReceiveComponent = component =>
		queueUpdate(Reconciler.receiveComponent, queuedReceiveComponents, component);
	const queueUnmountComponent = component =>
		queueUpdate(Reconciler.unmountComponent, queuedUnmountComponents, component);

	/** Notify devtools that a new component instance has been mounted into the DOM. */
	const componentAdded = vNode => {
		const instance = updateReactComponent(vNode, null);
		if (isRootVNode(vNode)) {
			instance._rootID = nextRootKey(roots);
			roots[instance._rootID] = instance;
			Mount._renderNewRootComponent(instance);
		}
		visitNonCompositeChildren(instance, childInst => {
			if (childInst) {
				childInst._inDevTools = true;
				queueMountComponent(childInst);
			}
		});
		queueMountComponent(instance);
	};

	/** Notify devtools that a component has been updated with new props/state. */
	const componentUpdated = vNode => {
		const prevRenderedChildren: any[] = [];

		visitNonCompositeChildren(getInstanceFromVNode(vNode), childInst => {
			prevRenderedChildren.push(childInst);
		});

		// Notify devtools about updates to this component and any non-composite
		// children
		const instance = updateReactComponent(vNode, null);
		queueReceiveComponent(instance);
		visitNonCompositeChildren(instance, childInst => {
			if (!childInst._inDevTools) {
				// New DOM child component
				childInst._inDevTools = true;
				queueMountComponent(childInst);
			} else {
				// Updated DOM child component
				queueReceiveComponent(childInst);
			}
		});

		// For any non-composite children that were removed by the latest render,
		// remove the corresponding ReactDOMComponent-like instances and notify
		// the devtools
		prevRenderedChildren.forEach(childInst => {
			if (!document.body.contains(childInst.node)) {
				deleteInstanceForVNode(childInst.vNode);
				queueUnmountComponent(childInst);
			}
		});
	};

	/** Notify devtools that a component has been unmounted from the DOM. */
	const componentRemoved = vNode => {
		const instance = updateReactComponent(vNode, null);

		visitNonCompositeChildren(childInst => {
			deleteInstanceForVNode(childInst.vNode);
			queueUnmountComponent(childInst);
		});
		queueUnmountComponent(instance);
		deleteInstanceForVNode(vNode);
		if (instance._rootID) {
			delete roots[instance._rootID];
		}
	};

	return {
		ComponentTree,
		Mount,
		Reconciler,

		componentAdded,
		componentRemoved,
		componentUpdated,
	};
}

function isRootVNode(vNode) {
	for (let i = 0, len = options.roots.length; i < len; i++) {
		const root = options.roots[i];

		if (root.input === vNode) {
			return true;
		}
	}
}

/**
 * Update (and create if necessary) the ReactDOMComponent|ReactCompositeComponent-like
 * instance for a given Inferno component instance or DOM Node.
 */
function updateReactComponent(vNode, parentDom) {
	if (!vNode) {
		return null;
	}
	const flags = vNode.flags;
	let newInstance;

	if (flags & VNodeFlags.Component) {
		newInstance = createReactCompositeComponent(vNode);
	} else {
		newInstance = createReactDOMComponent(vNode, parentDom);
	}
	const oldInstance = getInstanceFromVNode(vNode);

	if (oldInstance) {
		for (const key in newInstance) {
			oldInstance[key] = newInstance[key];
		}

		return oldInstance;
	}
	createInstanceFromVNode(vNode, newInstance);
	return newInstance;
}

function isInvalidChild(child) {
	return isInvalid(child) || child === '';
}

function normalizeChildren(children, dom) {
	if (isArray(children)) {
		return children.filter(child => !isInvalidChild(child)).map(child => updateReactComponent(child, dom));
	} else {
		return !(isInvalidChild(children) || children === '') ? [updateReactComponent(children, dom)] : [];
	}
}

/**
 * Create a ReactDOMComponent-compatible object for a given DOM node rendered
 * by Inferno.
 *
 * This implements the subset of the ReactDOMComponent interface that
 * React DevTools requires in order to display DOM nodes in the inspector with
 * the correct type and properties.
 */
function createReactDOMComponent(vNode, parentDom) {
	const flags = vNode.flags;

	if (flags & VNodeFlags.Void) {
		return null;
	}
	const type = vNode.type;
	const children = vNode.children === 0 ? vNode.children.toString() : vNode.children;
	const props = vNode.props;
	const dom = vNode.dom;
	const isText = flags & VNodeFlags.Text || isStringOrNumber(vNode);

	return {
		_currentElement: isText
			? children || vNode
			: {
					props,
					type,
				},
		_inDevTools: false,
		_renderedChildren: !isText && normalizeChildren(children, dom),
		_stringText: isText ? (children || vNode).toString() : null,
		node: dom || parentDom,
		vNode,
	};
}

function normalizeKey(key) {
	if (key && key[0] === '.') {
		return null;
	}
}

/**
 * Return a ReactCompositeComponent-compatible object for a given Inferno
 * component instance.
 *
 * This implements the subset of the ReactCompositeComponent interface that
 * the DevTools requires in order to walk the component tree and inspect the
 * component's properties.
 *
 * See https://github.com/facebook/react-devtools/blob/e31ec5825342eda570acfc9bcb43a44258fceb28/backend/getData.js
 */
function createReactCompositeComponent(vNode) {
	const type = vNode.type;
	const instance = vNode.children;
	const lastInput = instance._lastInput || instance;
	const dom = vNode.dom;

	const compositeComponent = {
		_currentElement: {
			key: normalizeKey(vNode.key),
			props: vNode.props,
			ref: null,
			type,
		},
		_instance: instance,
		_renderedComponent: updateReactComponent(lastInput, dom),
		forceUpdate: instance.forceUpdate.bind(instance),
		getName() {
			return typeName(type);
		},
		node: dom,
		props: instance.props,
		setState: instance.setState.bind(instance),
		state: instance.state,
		vNode,
	};

	const forceInstanceUpdate = instance.forceUpdate.bind(instance); // Save off for use below.
	instance.forceUpdate = () => {
		const newProps = Object.assign(
			{},
			// These are the regular Inferno props.
			instance.props,
			// This is what gets updated by the React devtools when props are edited.
			compositeComponent._currentElement.props,
		);

		instance.props = newProps;
		vNode.props = newProps;

		forceInstanceUpdate();
	};

	return compositeComponent;
}

function nextRootKey(roots) {
	return '.' + Object.keys(roots).length;
}

/**
 * Visit all child instances of a ReactCompositeComponent-like object that are
 * not composite components (ie. they represent DOM elements or text)
 */
function visitNonCompositeChildren(component, visitor?) {
	if (component._renderedComponent) {
		if (!component._renderedComponent._component) {
			visitor(component._renderedComponent);
			visitNonCompositeChildren(component._renderedComponent, visitor);
		}
	} else if (component._renderedChildren) {
		component._renderedChildren.forEach(child => {
			if (child) {
				visitor(child);
				if (!child._component) {
					visitNonCompositeChildren(child, visitor);
				}
			}
		});
	}
}

/**
 * Return the name of a component created by a `ReactElement`-like object.
 */
function typeName(type) {
	if (typeof type === 'function') {
		return type.displayName || type.name;
	}
	return type;
}

/**
 * Find all root component instances rendered by Inferno in `node`'s children
 * and add them to the `roots` map.
 */
function findRoots(roots) {
	options.roots.forEach(root => {
		roots[nextRootKey(roots)] = updateReactComponent(root.input, null);
	});
}
