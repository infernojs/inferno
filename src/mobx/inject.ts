import hoistStatics from 'hoist-non-inferno-statics';
import createElement from '../factories/createElement';
import createClass from '../component/createClass';

interface IProps {
	ref: any;
}

function PropTypesAny () {}

/**
 * Store Injection
 */
function createStoreInjector (grabStoresFn, component) {
	const Injector: any = createClass({
		displayName: 'MobXStoreInjector',
		render: function() {
			let newProps = <IProps>{};
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
	Injector.contextTypes = { mobxStores: PropTypesAny };
	Injector.wrappedComponent = component;
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
				'MobX observer: Store "' + storeName + '" is not available! ' +
				'Make sure it is provided by some Provider'
			);
		}
		nextProps[storeName] = baseStores[storeName];
	});
	return nextProps;
}

/**
 * Higher order component that injects stores to a child.
 * takes either a varargs list of strings, which are stores read from the context,
 * or a function that manually maps the available stores from the context to props:
 * storesToProps(mobxStores, props, context) => newProps
 */
function inject(grabStoresFn, ...storeNames: string[]): any {
	if (typeof grabStoresFn !== 'function') {
		grabStoresFn = grabStoresByName(storeNames);
	}
	return componentClass => createStoreInjector(grabStoresFn, componentClass);
}

export default inject
