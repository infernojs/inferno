import {
	options
} from 'inferno';
import {
	isStatefulComponent
} from '../shared';
import {
	wrapFunctionalComponent
} from './wrappers';
import {
	createDevToolsBridge
} from './bridge';

// Credit: this a port of the great work done on Preact's dev tools proxy with React
// https://github.com/developit/preact/blob/master/devtools/devtools.js

/**
 * Create a bridge between the Inferno component tree and React's dev tools
 * and register it.
 *
 * After this function is called, the React Dev Tools should be able to detect
 * "React" on the page and show the component tree.
 *
 * This function hooks into Inferno VNode creation in order to expose functional
 * components correctly, so it should be called before the root component(s)
 * are rendered.
 *
 * Returns a cleanup function which unregisters the hooks.
 */
export default function initDevTools() {
	if (typeof window['__REACT_DEVTOOLS_GLOBAL_HOOK__'] === 'undefined') {
		// React DevTools are not installed
		return;
	}
	// Hook into Inferno element creation in order to wrap functional components
	// with stateful ones in order to make them visible in the devtools
	const createVNode = options.createVNode;

	options.createVNode = (vNode) => {
		if (!isStatefulComponent(vNode)) {
			wrapFunctionalComponent(vNode);
		}
		if (createVNode) {
			return createVNode(vNode);
		}
	};
	// Notify devtools when preact components are mounted, updated or unmounted
	const bridge = createDevToolsBridge();
	const nextAfterMount = options.afterMount;

	options.afterMount = component => {
		bridge.componentAdded(component);
		if (nextAfterMount) {
			nextAfterMount(component);
		}
	};
	const nextAfterUpdate = options.afterUpdate;

	options.afterUpdate = component => {
		bridge.componentUpdated(component);
		if (nextAfterUpdate) {
			nextAfterUpdate(component);
		}
	};
	const nextBeforeUnmount = options.beforeUnmount;

	options.beforeUnmount = component => {
		bridge.componentRemoved(component);
		if (nextBeforeUnmount) {
			nextBeforeUnmount(component);
		}
	};
	// Notify devtools about this instance of "React"
	window['__REACT_DEVTOOLS_GLOBAL_HOOK__'].inject(bridge);
	return () => {
		options.afterMount = nextAfterMount;
		options.afterUpdate = nextAfterUpdate;
		options.beforeUnmount = nextBeforeUnmount;
	};
}
