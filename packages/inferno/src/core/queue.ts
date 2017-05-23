import {
	combineFrom,
	isArray,
	isInvalid,
	isNull,
	isNullOrUndef,
	isStringOrNumber,
	isUndefined,
	NO_OP,
	throwError
} from 'inferno-shared';
import VNodeFlags from 'inferno-vnode-flags';
import {
	patch
} from '../DOM/patching';
import {
	options
} from './options';
import {
	createVNode,
	VNode
} from './VNodes';

const resolvedPromise = Promise.resolve();
const stateChangeQueue = <any> [];

// when a components root VNode is also a component, we can run into issues
// this will recursively look for vNode.parentNode if the VNode is a component
function updateParentComponentVNodes(vNode: VNode, dom: Element) {
	if (vNode.flags & VNodeFlags.Component) {
		const parentVNode = vNode.parentVNode;

		if (parentVNode) {
			parentVNode.dom = dom;
			updateParentComponentVNodes(parentVNode, dom);
		}
	}
}

function applyState<P, S>(component: any, force: boolean, callback?: Function): void {
	if (component._unmounted) {
		return;
	}
	if (force || !component._blockRender) {
		component._pendingSetState = false;
		const pendingState = component._pendingState;
		const prevState = component.state;
		const nextState = combineFrom(prevState, pendingState) as any;
		const props = component.props as P;
		const context = component.context;

		component._pendingState = null;
		let nextInput = component._updateComponent(prevState as S, nextState, props, props, context, force, true);
		let didUpdate = true;

		if (isInvalid(nextInput)) {
			nextInput = createVNode(VNodeFlags.Void, null);
		} else if (nextInput === NO_OP) {
			nextInput = component._lastInput;
			didUpdate = false;
		} else if (isStringOrNumber(nextInput)) {
			nextInput = createVNode(VNodeFlags.Text, null, null, nextInput) as VNode;
		} else if (isArray(nextInput)) {
			if (process.env.NODE_ENV !== 'production') {
				throwError('a valid Inferno VNode (or null) must be returned from a component render. You may have returned an array or an invalid object.');
			}
			throwError();
		}

		const lastInput = component._lastInput as VNode;
		const vNode = component._vNode as VNode;
		const parentDom = (lastInput.dom && lastInput.dom.parentNode) || (lastInput.dom = vNode.dom);

		component._lastInput = nextInput as VNode;
		if (didUpdate) {
			let childContext;

			if (!isUndefined(component.getChildContext)) {
				childContext = component.getChildContext();
			}

			if (isNullOrUndef(childContext)) {
				childContext = component._childContext;
			} else {
				childContext = combineFrom(context, childContext as any);
			}

			const lifeCycle = component._lifecycle as any;
			patch(lastInput, nextInput as VNode, parentDom as Element, lifeCycle, childContext, component._isSVG, false);
			lifeCycle.trigger();

			if (!isUndefined(component.componentDidUpdate)) {
				component.componentDidUpdate(props, prevState as S, context);
			}
			if (!isNull(options.afterUpdate)) {
				options.afterUpdate(vNode);
			}
		}
		const dom = vNode.dom = (nextInput as VNode).dom as Element;
		if (options.findDOMNodeEnabled) {
			internal_DOMNodeMap.set(component, (nextInput as VNode).dom);
		}

		updateParentComponentVNodes(vNode, dom);
	} else {
		component.state = component._pendingState as any;
		component._pendingState = null;
	}
	if (!isNullOrUndef(callback)) {
		callback.call(component);
	}
}

export function flushQueue() {
	const length = stateChangeQueue.length;

	if (length !== 0) {
		for (let i = 0; i < length; i++) {
			const stateChange = stateChangeQueue[i];
			applyState(stateChange.component, stateChange.force, stateChange.callback);
		}
		stateChangeQueue.length = 0;
	}
}

export function queueStateChange(component, force, callback) {
	stateChangeQueue.push({
		component,
		force,
		callback
	});

	resolvedPromise.then(flushQueue);
}
