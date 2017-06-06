/**
 * @module Inferno-Devtools
 */ /** TypeDoc Comment */

import { options } from 'inferno';
import Component from 'inferno-component';
import { isStatefulComponent } from 'inferno-shared';
import VNodeFlags from 'inferno-vnode-flags';
import { createDevToolsBridge } from './bridge';

const functionalComponentWrappers = new Map();

function wrapFunctionalComponent(vNode) {
	const originalRender = vNode.type;
	const name = vNode.type.name || 'Function (anonymous)';
	const wrappers = functionalComponentWrappers;

	if (!wrappers.has(originalRender)) {
		const wrapper = class extends Component<any, any> {
			public render(props, state, context) {
				return originalRender(props, context);
			}
		};
		// Expose the original component name. React Dev Tools will use
		// this property if it exists or fall back to Function.name
		// otherwise.
		/* tslint:disable */
		wrapper['displayName'] = name;
		/* tslint:enable */
		wrappers.set(originalRender, wrapper);
	}
	vNode.type = wrappers.get(originalRender);
	vNode.type.defaultProps = originalRender.defaultProps;
	vNode.ref = null;
	vNode.flags = VNodeFlags.ComponentClass;
}

// Credit: this based on on the great work done with Preact and its devtools
// https://github.com/developit/preact/blob/master/devtools/devtools.js

export default function initDevTools() {
	/* tslint:disable */
	if (typeof window['__REACT_DEVTOOLS_GLOBAL_HOOK__'] === 'undefined') {
		/* tslint:enable */
		// React DevTools are not installed
		return;
	}
	const nextVNode = options.createVNode;
	options.createVNode = vNode => {
		const flags = vNode.flags;

		if (flags & VNodeFlags.Component && !isStatefulComponent(vNode.type)) {
			wrapFunctionalComponent(vNode);
		}
		if (nextVNode) {
			return nextVNode(vNode);
		}
	};
	// Notify devtools when preact components are mounted, updated or unmounted
	const bridge = createDevToolsBridge();
	const nextAfterMount = options.afterMount;

	options.afterMount = vNode => {
		bridge.componentAdded(vNode);
		if (nextAfterMount) {
			nextAfterMount(vNode);
		}
	};
	const nextAfterUpdate = options.afterUpdate;

	options.afterUpdate = vNode => {
		bridge.componentUpdated(vNode);
		if (nextAfterUpdate) {
			nextAfterUpdate(vNode);
		}
	};
	const nextBeforeUnmount = options.beforeUnmount;

	options.beforeUnmount = vNode => {
		bridge.componentRemoved(vNode);
		if (nextBeforeUnmount) {
			nextBeforeUnmount(vNode);
		}
	};
	// Notify devtools about this instance of "React"
	/* tslint:disable */
	window['__REACT_DEVTOOLS_GLOBAL_HOOK__'].inject(bridge);
	/* tslint:enable */
	return () => {
		options.afterMount = nextAfterMount;
		options.afterUpdate = nextAfterUpdate;
		options.beforeUnmount = nextBeforeUnmount;
	};
}
