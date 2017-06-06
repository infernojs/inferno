/**
 * @module Inferno-Redux
 */ /** TypeDoc Comment */

import hoistStatics from 'hoist-non-inferno-statics';
import Component from 'inferno-component';
import createElement from 'inferno-create-element';
import { combineFrom, isFunction, throwError } from 'inferno-shared';
import { isPlainObject } from './helpers';
import { shallowEqual, warning, wrapActionCreators } from './utils';

export type WrapWithConnect = (WrappedComponent: any) => any;

export type MapStateToProps = (state: any, props?: {}) => any;

export type MapDispatchToPropsFunction = (dispatch: (action: any) => void, props?: {}) => any;

export type MapDispatchToPropsFactory = (dispatch: (action: any) => void, props?: {}) => MapDispatchToPropsFunction;

export type MapDispatchToProps =
	| MapDispatchToPropsFunction
	| { [index: string]: MapDispatchToPropsFunction }
	| MapDispatchToPropsFactory;

const errorObject = { value: null };
const defaultMapStateToProps = state => ({}); // eslint-disable-line no-unused-vars
const defaultMapDispatchToProps = dispatch => ({ dispatch });
const defaultMergeProps = function(stateProps, dispatchProps, parentProps) {
	const obj = {};

	if (parentProps) {
		for (const key in parentProps) {
			obj[key] = parentProps[key];
		}
	}

	if (stateProps) {
		for (const key in stateProps) {
			obj[key] = stateProps[key];
		}
	}

	if (dispatchProps) {
		for (const key in dispatchProps) {
			obj[key] = dispatchProps[key];
		}
	}

	return obj;
};

function tryCatch(fn, ctx) {
	try {
		return fn.apply(ctx);
	} catch (e) {
		errorObject.value = e;
		return errorObject;
	}
}

function getDisplayName(WrappedComponent) {
	return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

// Helps track hot reloading.
let nextVersion = 0;

export default function connect(
	mapStateToProps?: MapStateToProps,
	mapDispatchToProps?: MapDispatchToProps,
	mergeProps?,
	options: any = {},
): WrapWithConnect {
	const shouldSubscribe = Boolean(mapStateToProps);
	const mapState = mapStateToProps || defaultMapStateToProps;
	let mapDispatch;

	if (isFunction(mapDispatchToProps)) {
		mapDispatch = mapDispatchToProps;
	} else if (!mapDispatchToProps) {
		mapDispatch = defaultMapDispatchToProps;
	} else {
		mapDispatch = wrapActionCreators(mapDispatchToProps);
	}
	const finalMergeProps = mergeProps || defaultMergeProps;
	const { pure = true, withRef = false } = options;
	const checkMergedEquals = pure && finalMergeProps !== defaultMergeProps;
	// Helps track hot reloading.
	const version = nextVersion++;

	return function wrapWithConnect(WrappedComponent: Component<any, any>) {
		const connectDisplayName = `Connect(${getDisplayName(WrappedComponent)})`;

		function checkStateShape(props, methodName) {
			if (!isPlainObject(props)) {
				warning(`${methodName}() in ${connectDisplayName} must return a plain object. ` + `Instead received ${props}.`);
			}
		}

		function computeMergedProps(stateProps, dispatchProps, parentProps) {
			const mergedProps = finalMergeProps(stateProps, dispatchProps, parentProps);
			if (process.env.NODE_ENV !== 'production') {
				checkStateShape(mergedProps, 'mergeProps');
			}
			return mergedProps;
		}

		class Connect extends Component<any, any> {
			public static displayName: any;
			public static WrappedComponent: any;
			public version: any;
			public store: any;
			public haveOwnPropsChanged: boolean;
			public hasStoreStateChanged: boolean;
			public finalMapStateToProps: any;
			public doStatePropsDependOnOwnProps: any;
			public finalMapDispatchToProps: any;
			public doDispatchPropsDependOnOwnProps: any;
			public stateProps: any;
			public dispatchProps: any;
			public mergedProps: any;
			public unsubscribe: any;
			public haveStatePropsBeenPrecalculated: boolean;
			public statePropsPrecalculationError: any;
			public renderedElement: any;
			public wrappedInstance: any;

			constructor(props, context) {
				super(props, context);

				this.version = version;
				this.wrappedInstance = null;
				this.store = (props && props.store) || (context && context.store);

				if (!this.store) {
					throwError(
						'Could not find "store" in either the context or ' +
							`props of "${connectDisplayName}". ` +
							'Either wrap the root component in a <Provider>, ' +
							`or explicitly pass "store" as a prop to "${connectDisplayName}".`,
					);
				}

				const storeState = this.store.getState();
				this.state = { storeState };
				this.clearCache();
			}

			public componentDidMount() {
				this.trySubscribe();
			}

			public shouldComponentUpdate() {
				return !pure || this.haveOwnPropsChanged || this.hasStoreStateChanged;
			}

			public computeStateProps(store, props) {
				if (!this.finalMapStateToProps) {
					return this.configureFinalMapState(store, props);
				}
				const state = store.getState();
				const stateProps = this.doStatePropsDependOnOwnProps
					? this.finalMapStateToProps(state, props)
					: this.finalMapStateToProps(state);

				return stateProps;
			}

			public configureFinalMapState(store, props) {
				const mappedState = mapState(store.getState(), props);
				const isFactory = isFunction(mappedState);

				this.finalMapStateToProps = isFactory ? mappedState : mapState;
				this.doStatePropsDependOnOwnProps = this.finalMapStateToProps.length !== 1;
				if (isFactory) {
					return this.computeStateProps(store, props);
				}
				return mappedState;
			}

			public computeDispatchProps(store, props) {
				if (!this.finalMapDispatchToProps) {
					return this.configureFinalMapDispatch(store, props);
				}
				const { dispatch } = store;
				return this.doDispatchPropsDependOnOwnProps
					? this.finalMapDispatchToProps(dispatch, props)
					: this.finalMapDispatchToProps(dispatch);
			}

			public configureFinalMapDispatch(store, props) {
				const mappedDispatch = mapDispatch(store.dispatch, props);
				const isFactory = isFunction(mappedDispatch);

				this.finalMapDispatchToProps = isFactory ? mappedDispatch : mapDispatch;
				this.doDispatchPropsDependOnOwnProps = this.finalMapDispatchToProps.length !== 1;

				if (isFactory) {
					return this.computeDispatchProps(store, props);
				}
				return mappedDispatch;
			}

			public updateStatePropsIfNeeded() {
				const nextStateProps = this.computeStateProps(this.store, this.props);

				if (this.stateProps && shallowEqual(nextStateProps, this.stateProps)) {
					return false;
				}
				this.stateProps = nextStateProps;
				return true;
			}

			public updateDispatchPropsIfNeeded() {
				const nextDispatchProps = this.computeDispatchProps(this.store, this.props);

				if (this.dispatchProps && shallowEqual(nextDispatchProps, this.dispatchProps)) {
					return false;
				}
				this.dispatchProps = nextDispatchProps;
				return true;
			}

			public updateMergedPropsIfNeeded() {
				const nextMergedProps = computeMergedProps(this.stateProps, this.dispatchProps, this.props);

				if (this.mergedProps && checkMergedEquals && shallowEqual(nextMergedProps, this.mergedProps)) {
					return false;
				}
				this.mergedProps = nextMergedProps;
				return true;
			}

			public isSubscribed() {
				return isFunction(this.unsubscribe);
			}

			public trySubscribe() {
				if (shouldSubscribe && !this.unsubscribe) {
					this.unsubscribe = this.store.subscribe(this.handleChange.bind(this));
					this.handleChange();
				}
			}

			public tryUnsubscribe() {
				if (this.unsubscribe) {
					this.unsubscribe();
					this.unsubscribe = null;
				}
			}

			public componentWillReceiveProps(nextProps) {
				if (!pure || !shallowEqual(nextProps, this.props)) {
					this.haveOwnPropsChanged = true;
				}
			}

			public componentWillUnmount() {
				this.tryUnsubscribe();
				this.clearCache();
			}

			public clearCache() {
				this.dispatchProps = null;
				this.stateProps = null;
				this.mergedProps = null;
				this.haveOwnPropsChanged = true;
				this.hasStoreStateChanged = true;
				this.haveStatePropsBeenPrecalculated = false;
				this.statePropsPrecalculationError = null;
				this.renderedElement = null;
				this.finalMapDispatchToProps = null;
				this.finalMapStateToProps = null;
			}

			public handleChange() {
				if (!this.unsubscribe) {
					return;
				}
				const storeState = this.store.getState();
				const prevStoreState = this.state.storeState;

				if (pure && prevStoreState === storeState) {
					return;
				}
				if (pure && !this.doStatePropsDependOnOwnProps) {
					const haveStatePropsChanged = tryCatch(this.updateStatePropsIfNeeded, this);
					if (!haveStatePropsChanged) {
						return;
					}
					if (haveStatePropsChanged === errorObject) {
						this.statePropsPrecalculationError = errorObject.value;
					}
					this.haveStatePropsBeenPrecalculated = true;
				}
				this.hasStoreStateChanged = true;
				this.setState({ storeState });
			}

			public getWrappedInstance() {
				return this.wrappedInstance;
			}

			public render() {
				const {
					haveOwnPropsChanged,
					hasStoreStateChanged,
					haveStatePropsBeenPrecalculated,
					statePropsPrecalculationError,
					renderedElement,
				} = this;

				this.haveOwnPropsChanged = false;
				this.hasStoreStateChanged = false;
				this.haveStatePropsBeenPrecalculated = false;
				this.statePropsPrecalculationError = null;

				if (statePropsPrecalculationError) {
					throw statePropsPrecalculationError;
				}
				let shouldUpdateStateProps = true;
				let shouldUpdateDispatchProps = true;

				if (pure && renderedElement) {
					shouldUpdateStateProps = hasStoreStateChanged || (haveOwnPropsChanged && this.doStatePropsDependOnOwnProps);
					shouldUpdateDispatchProps = haveOwnPropsChanged && this.doDispatchPropsDependOnOwnProps;
				}
				let haveStatePropsChanged = false;
				let haveDispatchPropsChanged = false;

				if (haveStatePropsBeenPrecalculated) {
					haveStatePropsChanged = true;
				} else if (shouldUpdateStateProps) {
					haveStatePropsChanged = this.updateStatePropsIfNeeded();
				}
				if (shouldUpdateDispatchProps) {
					haveDispatchPropsChanged = this.updateDispatchPropsIfNeeded();
				}
				let haveMergedPropsChanged = true;

				if (haveStatePropsChanged || haveDispatchPropsChanged || haveOwnPropsChanged) {
					haveMergedPropsChanged = this.updateMergedPropsIfNeeded();
				} else {
					haveMergedPropsChanged = false;
				}

				if (!haveMergedPropsChanged && renderedElement) {
					return renderedElement;
				}
				if (withRef) {
					this.renderedElement = createElement(
						WrappedComponent,
						combineFrom(this.mergedProps, { ref: instance => (this.wrappedInstance = instance) }),
					);
				} else {
					this.renderedElement = createElement(WrappedComponent, this.mergedProps);
				}
				return this.renderedElement;
			}
		}
		Connect.displayName = connectDisplayName;
		Connect.WrappedComponent = WrappedComponent;

		if (process.env.NODE_ENV !== 'production') {
			Connect.prototype.componentWillUpdate = function componentWillUpdate() {
				if (this.version === version) {
					return;
				}
				// We are hot reloading!
				this.version = version;
				this.trySubscribe();
				this.clearCache();
			};
		}
		return hoistStatics(Connect, WrappedComponent);
	};
}
