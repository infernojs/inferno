import hoistStatics from 'hoist-non-inferno-statics';
import { createVNode } from 'inferno';
import Component from 'inferno-component';
import VNodeFlags from 'inferno-vnode-flags';
import { observer } from './observer';

/**
 * Store Injection
 */
function createStoreInjector(grabStoresFn, component, injectNames?): any {
	let displayName = 'inject-' + (component.displayName || component.name || (component.constructor && component.constructor.name) || 'Unknown');
	if (injectNames) {
		displayName += '-with-' + injectNames;
	}

	class Injector extends Component<any, any>  {

		public wrappedInstance = null;
		public static wrappedComponent = component;

		public static displayName = displayName;
		public static isMobxInjector: boolean = true;

		public storeRef = (instance) => { this.wrappedInstance = instance; };

		public render(props, state, context) {
			// Optimization: it might be more efficient to apply the mapper function *outside* the render method
			// (if the mapper is a function), that could avoid expensive(?) re-rendering of the injector component
			// See this test: 'using a custom injector is not too reactive' in inject.js
			const newProps = {};

			for (const key in props) {
				if (props.hasOwnProperty(key)) {
					newProps[key] = props[key];
				}
			}
			const additionalProps = grabStoresFn(this.context.mobxStores || {}, newProps, context) || {};
			for (const key in additionalProps) {
				newProps[key] = additionalProps[key];
			}

			return createVNode(VNodeFlags.ComponentUnknown, component, null, null, newProps, props.key, this.storeRef);
		}
	}

	// Static fields from component should be visible on the generated Injector
	hoistStatics(Injector, component);

	return Injector;
}

function grabStoresByName(storeNames) {
	return function(baseStores, nextProps) {
		storeNames.forEach(function(storeName) {
			if (storeName in nextProps) {
				return; // prefer props over stores
			}

			if (!(storeName in baseStores)) {
				throw new Error('MobX observer: Store "' + storeName + '" is not available! Make sure it is provided by some Provider');
			}

			nextProps[storeName] = baseStores[storeName];
		});
		return nextProps;
	};
}

/**
 * higher order component that injects stores to a child.
 * takes either a varargs list of strings, which are stores read from the context,
 * or a function that manually maps the available stores from the context to props:
 * storesToProps(mobxStores, props, context) => newProps
 */
export function inject(arg: any/* fn(stores, nextProps) or ...storeNames */) {
	let grabStoresFn;
	if (typeof arg === 'function') {
		grabStoresFn = arg;
		return function(componentClass) {
			let injected = createStoreInjector(grabStoresFn, componentClass);
			injected.isMobxInjector = false; // supress warning
			// mark the Injector as observer, to make it react to expressions in `grabStoresFn`,
			// see #111
			injected = observer(injected);
			injected.isMobxInjector = true; // restore warning
			return injected;
		};
	} else {
		const storeNames: any[] = [];
		for (let i = 0; i < arguments.length; i++) {
			storeNames[i] = arguments[i];
		}

		grabStoresFn = grabStoresByName(storeNames);
		return function(componentClass) {
			return createStoreInjector(grabStoresFn, componentClass, storeNames.join('-'));
		};
	}
}

