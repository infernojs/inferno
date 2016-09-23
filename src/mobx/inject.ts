import hoistStatics from 'hoist-non-inferno-statics';
import createElement from '../factories/createElement';
import createClass from '../component/createClass';

interface IProps extends Object {
	ref: any;
}

/**
 * Store Injection
 */
function createStoreInjector(grabStoresFn, component) {
	const Injector: any = createClass({
		displayName: 'MobXStoreInjector',
		render() {
			let newProps = <IProps> {};
			for (let key in this.props) {
				if (this.props.hasOwnProperty(key)) {
					newProps[key] = this.props[key];
				}
			}
			let additionalProps = grabStoresFn(this.context.mobxStores || {}, newProps, this.context) || {};
			for (let key in additionalProps) {
				newProps[key] = additionalProps[key];
			}
			newProps.ref = instance => {
				this.wrappedInstance = instance;
			};
			return createElement(component, newProps);
		}
		// TODO: should have shouldComponentUpdate?
	});
	Injector.contextTypes = {
		mobxStores: () => {
		}
	};
	Injector.wrappedComponent = component;
	injectStaticWarnings(Injector, component);
	hoistStatics(Injector, component);
	return Injector;
}

function injectStaticWarnings(hoc, component) {
	if (typeof process === 'undefined' || !process.env || process.env.NODE_ENV === 'production') {
		return;
	}
	['propTypes', 'defaultProps', 'contextTypes'].forEach(function (prop) {
		const propValue = hoc[prop];
		Object.defineProperty(hoc, prop, {
			set (_) {
				// enable for testing:
				let name = component.displayName || component.name;
				console.warn('Mobx Injector: you are trying to attach ' + prop +
					' to HOC instead of ' + name + '. Use `wrappedComponent` property.');
			},
			get () {
				return propValue;
			},
			configurable: true
		});
	});
}

function grabStoresByName(storeNames) {
	return function (baseStores, nextProps) {
		storeNames.forEach(function (storeName) {
			if (storeName in nextProps) {
				// prefer props over stores
				return;
			}
			if (!(storeName in baseStores)) {
				throw new Error('MobX observer: Store "' + storeName + '" is not available! Make sure it is provided by some Provider');
			}
			nextProps[storeName] = baseStores[storeName];
		});
		return nextProps;
	};
}
/*
 interface IInject {
 apply: () => {};
 }*/

/**
 * higher order component that injects stores to a child.
 * takes either a varargs list of strings, which are stores read from the context,
 * or a function that manually maps the available stores from the context to props:
 * storesToProps(mobxStores, props, context) => newProps
 */
export default function inject(): any /* fn(stores, nextProps) or ...storeNames */ {
	let grabStoresFn: any = void 0;
	if (typeof arguments[0] === 'function') {
		grabStoresFn = arguments[0];
	} else {
		let storesNames: any = [];
		for (let i = 0; i < arguments.length; i++) {
			storesNames[i] = arguments[i];
		}
		grabStoresFn = grabStoresByName(storesNames);
	}
	return function (componentClass) {
		return createStoreInjector(grabStoresFn, componentClass);
	};
}
