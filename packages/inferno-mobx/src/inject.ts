import hoistStatics from 'hoist-non-inferno-statics';
import { createVNode } from 'inferno';
import createClass from 'inferno-create-class';
import VNodeFlags from 'inferno-vnode-flags';

interface IStoreProps {
	ref: any;
}

/**
 * Store Injection
 */
function createStoreInjector(grabStoresFn: Function, component) {
	const Injector: any = createClass({
		displayName: component.name,
		render() {
			const newProps = {} as IStoreProps;
			for (const key in this.props) {
				if (this.props.hasOwnProperty(key)) {
					newProps[key] = this.props[key];
				}
			}
			const additionalProps = grabStoresFn(this.context.mobxStores || {}, newProps, this.context) || {};
			for (const key in additionalProps) {
				newProps[key] = additionalProps[key];
			}
			newProps.ref = instance => {
				this.wrappedInstance = instance;
			};

			return createVNode(VNodeFlags.ComponentUnknown, component, null, null, newProps);
		},
	});

	Injector.contextTypes = {
		// tslint:disable-next-line:no-empty
		mobxStores() {},
	};
	hoistStatics(Injector, component);

	return Injector;
}

const grabStoresByName = function(storeNames: string[]): Function {
	return function(baseStores: Object, nextProps: Object): Object {
		storeNames.forEach(function(storeName) {
			// Prefer props over stores
			if (storeName in nextProps) {
				return;
			}

			if (!(storeName in baseStores)) {
				throw new Error(
					`MobX observer: Store "${storeName}" is not available! ` + `Make sure it is provided by some Provider`,
				);
			}

			nextProps[storeName] = baseStores[storeName];
		});
		return nextProps;
	};
};

/**
 * Higher order component that injects stores to a child.
 * takes either a varargs list of strings, which are stores read from the context,
 * or a function that manually maps the available stores from the context to props:
 * storesToProps(mobxStores, props, context) => newProps
 */
export default function inject(grabStoresFn?: Function | string): any {
	if (typeof grabStoresFn !== 'function') {
		const storesNames: any = [];
		for (let i = 0, len = arguments.length; i < len; i++) {
			storesNames[i] = arguments[i];
		}

		grabStoresFn = grabStoresByName(storesNames);
	}

	return componentClass => createStoreInjector(grabStoresFn as Function, componentClass);
}
