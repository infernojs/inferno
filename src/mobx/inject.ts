import hoistStatics from 'hoist-non-inferno-statics';
import createClass from 'inferno-create-class';
import createElement from 'inferno-create-element';

interface IProps {
	ref: any;
	children: any;
}

/**
 * Store Injection
 */
function createStoreInjector (grabStoresFn, component) {
	const Injector: any = createClass({
		displayName: component.name,
		render() {
			const newProps = <IProps> {};
			for (let key in this.props) {
				if (this.props.hasOwnProperty(key)) {
					newProps[key] = this.props[key];
				}
			}
			const additionalProps = grabStoresFn(this.context.mobxStores || {}, newProps, this.context) || {};
			for ( let key in additionalProps ) {
				newProps[ key ] = additionalProps[ key ];
			}
			newProps.ref = instance => {
				this.wrappedInstance = instance;
			};
			return createElement(component, newProps, this.props.children);
		}
	});

	Injector.contextTypes = { mobxStores() {} };
	hoistStatics(Injector, component);

	return Injector;
}

const grabStoresByName = (storeNames) => (baseStores, nextProps) => {
	storeNames.forEach(function(storeName) {

		// Prefer props over stores
		if (storeName in nextProps) {
			return;
		}

		if (!(storeName in baseStores)) {
			throw new Error(
				`MobX observer: Store "${storeName}" is not available! ` +
				`Make sure it is provided by some Provider`
			);
		}

		nextProps[storeName] = baseStores[storeName];
	});
	return nextProps;
};

/**
 * Higher order component that injects stores to a child.
 * takes either a varargs list of strings, which are stores read from the context,
 * or a function that manually maps the available stores from the context to props:
 * storesToProps(mobxStores, props, context) => newProps
 */
function inject (grabStoresFn): any {

	if (typeof grabStoresFn !== 'function') {

		let storesNames: any = [];
		for (let i = 0; i < arguments.length; i++) {
			storesNames[i] = arguments[i];
		}

		grabStoresFn = grabStoresByName(storesNames);
	}

	return componentClass => createStoreInjector(grabStoresFn, componentClass);
}

export default inject;
