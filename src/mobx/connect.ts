import invariant from 'invariant';
import { Reaction, extras, isObservable } from 'mobx';
import { findDOMNode } from '../DOM/rendering';
import Component from '../component/es2015';
import EventEmitter from './utils/EventEmitter';
import createClass from '../component/createClass';
import inject from './inject';

/*
 mklink /J D:\Projects\dating\node_modules\inferno\dist D:\Projects\inferno\packages\inferno\dist
*/


/**
 * dev tool support
 */
let isDevtoolsEnabled = false;

// WeakMap<Node, Object>;
export const componentByNodeRegistery: WeakMap<any, any> = new WeakMap();
export const renderReporter = new EventEmitter();

function reportRendering(component) {
	const node = findDOMNode(component);
	if (node && exports.componentByNodeRegistery) {
		componentByNodeRegistery.set(node, component);
	}

	renderReporter.emit({
		event: 'render',
		renderTime: component.__$mobRenderEnd - component.__$mobRenderStart,
		totalTime: Date.now() - component.__$mobRenderStart,
		component,
		node
	});
}

export function trackComponents() {
	invariant(typeof WeakMap !== 'undefined', '[mobx-react] tracking components is not supported in this browser.');

	if (!isDevtoolsEnabled) {
		isDevtoolsEnabled = true;
	}
}

/**
 * Utilities
 */

function patch(target, funcName) {
	const base = target[funcName];
	const mixinFunc = reactiveMixin[funcName];
	if (!base) {
		target[funcName] = mixinFunc;
	} else {
		target[funcName] = function() {
			base.apply(this, arguments);
			mixinFunc.apply(this, arguments);
		};
	}
}

interface IReactiveRender {
	$mobx?: Reaction;
	(): void;
}

const reactiveMixin = {
	componentWillMount() {
		// Generate friendly name for debugging
		const initialName = this.displayName || this.name || (this.constructor && (this.constructor.displayName || this.constructor.name)) || "<component>";
		const rootNodeID = this._reactInternalInstance && this._reactInternalInstance._rootNodeID;
		const baseRender = this.render.bind(this);
		let reaction: Reaction;
		let isRenderingPending = false;

		const reactiveRender: IReactiveRender = () => {
			isRenderingPending = false;
			let rendering = undefined;
			reaction.track(() => {
				if (isDevtoolsEnabled) {
					this.__$mobRenderStart = Date.now();
				}
				rendering = extras.allowStateChanges(false, baseRender);
				if (isDevtoolsEnabled) {
					this.__$mobRenderEnd = Date.now();
				}
			});
			return rendering;
		};

		const initialRender = () => {
			reaction = new Reaction(`${initialName}#${rootNodeID}.render()`, () => {
				if (!isRenderingPending) {
					// N.B. Getting here *before mounting* means that a component constructor has side effects (see the relevant test in misc.js)
					// This unidiomatic React usage but React will correctly warn about this so we continue as usual
					// See #85 / Pull #44
					isRenderingPending = true;
					if (typeof this.componentWillReact === 'function') {
						this.componentWillReact(); // TODO: wrap in action?
					}
					if (this.__$mobxIsUnmounted !== true) {
						// If we are unmounted at this point, componentWillReact() had a side effect causing the component to unmounted
						// TODO: remove this check? Then react will properly warn about the fact that this should not happen? See #73
						// However, people also claim this migth happen during unit tests..
						// React.Component.prototype.forceUpdate.call(this)
						Component.prototype.forceUpdate.call(this);
					}
				}
			});
			reactiveRender.$mobx = reaction;
			this.render = reactiveRender;
			return reactiveRender();
		};

		this.render = initialRender;
	},

	componentWillUnmount() {
		this.render.$mobx && this.render.$mobx.dispose();
		this.__$mobxIsUnmounted = true;
		if (isDevtoolsEnabled) {
			const node = findDOMNode(this);
			if (node && componentByNodeRegistery) {
				componentByNodeRegistery.delete(node);
			}
			renderReporter.emit({
				event: 'destroy',
				component: this,
				node
			});
		}
	},

	componentDidMount() {
		if (isDevtoolsEnabled) {
			reportRendering(this);
		}
	},

	componentDidUpdate() {
		if (isDevtoolsEnabled) {
			reportRendering(this);
		}
	},

	shouldComponentUpdate(nextProps, nextState) {
		// TODO: if context changed, return true.., see #18
		// if props or state did change, but a render was scheduled already, no additional render needs to be scheduled
		if (this.render.$mobx && this.render.$mobx.isScheduled() === true) {
			return false;
		}

		// update on any state changes (as is the default)
		if (this.state !== nextState) {
			return true;
		}
		// update if props are shallowly not equal, inspired by PureRenderMixin
		const keys = Object.keys(this.props);
		if (keys.length !== Object.keys(nextProps).length) {
			return true;
		}
		for (let i = keys.length - 1; i >= 0; i--) {
			let key = keys[i];
			const newValue = nextProps[key];
			if (newValue !== this.props[key]) {
				return true;
			} else if (newValue && typeof newValue === 'object' && !isObservable(newValue)) {
				/**
				 * If the newValue is still the same object, but that object is not observable,
				 * fallback to the default React behavior: update, because the object *might* have changed.
				 * If you need the non default behavior, just use the React pure render mixin, as that one
				 * will work fine with mobx as well, instead of the default implementation of
				 * observer.
				 */
				return true;
			}
		}
		return false;
	}
};

export default function connect(arg1, arg2 = null) {
	invariant(typeof arg1 !== 'string', 'Store names should be provided as array')

	console.debug('---', arg1, arg2);

	if (Array.isArray(arg1)) {
		// component needs stores
		if (!arg2) {
			// invoked as decorator
			return componentClass => connect(arg1, componentClass);
		} else {
			// TODO: deprecate this invocation style
			return inject.apply(null, arg1)(connect(arg2));
		}
	}
	const componentClass = arg1;

	console.log(typeof componentClass === 'function' ,
		(!componentClass.prototype || !componentClass.prototype.render),
		!componentClass.isReactClass && !Component.isPrototypeOf(componentClass)
	);

	console.info(componentClass.prototype);
	console.info(componentClass.prototype.render);
	console.info(componentClass.prototype);

	// Stateless function component:
	// If it is function but doesn't seem to be a react class constructor,
	// wrap it to a react class automatically
	if (typeof componentClass === 'function'
		&& (!componentClass.prototype || !componentClass.prototype.render)
		&& !componentClass.isReactClass
		&& !Component.isPrototypeOf(componentClass)

		// React version
		// (!componentClass.prototype || !componentClass.prototype.render) && !componentClass.isReactClass && !React.Component.isPrototypeOf(componentClass)

	) {
		return connect(createClass({
			displayName: componentClass.displayName || componentClass.name,
			propTypes: componentClass.propTypes,
			contextTypes: componentClass.contextTypes,
			getDefaultProps: () => componentClass.defaultProps,
			render: () => componentClass.call(this, this.props, this.context)
		}));
	}

	invariant(componentClass, 'Please pass a valid component to "observer"')

	const target = componentClass.prototype || componentClass;
	['componentWillMount', 'componentWillUnmount', 'componentDidMount', 'componentDidUpdate'].forEach(function(funcName) {
		patch(target, funcName);
	});
	if (!target.shouldComponentUpdate) {
		target.shouldComponentUpdate = reactiveMixin.shouldComponentUpdate;
	}
	componentClass.isMobXReactObserver = true;
	return componentClass;
}
