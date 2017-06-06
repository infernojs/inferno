/**
 * @module Inferno-Mobx
 */ /** TypeDoc Comment */

import Component from 'inferno-component';
import { throwError } from 'inferno-shared';
import { extras, isObservable, Reaction } from 'mobx';
import EventEmitter from './EventEmitter';

/**
 * Dev tools support
 */
let isDevtoolsEnabled = false;

export const componentByNodeRegistery: WeakMap<any, any> = new WeakMap();
export const renderReporter = new EventEmitter();

function reportRendering(component) {
	const node = component._vNode.dom;
	if (node && componentByNodeRegistery) {
		componentByNodeRegistery.set(node, component);
	}

	renderReporter.emit({
		component,
		event: 'render',
		node,
		renderTime: component.__$mobRenderEnd - component.__$mobRenderStart,
		totalTime: Date.now() - component.__$mobRenderStart,
	});
}

export function trackComponents() {
	if (typeof WeakMap === 'undefined') {
		throwError('[inferno-mobx] tracking components is not supported in this browser.');
	}
	if (!isDevtoolsEnabled) {
		isDevtoolsEnabled = true;
	}
}

interface IReactiveRender {
	$mobx?: Reaction;
	(nextProps, nextContext): void;
}

function scuMobx(nextProps, nextState) {
	// Update on any state changes (as is the default)
	if (this.state !== nextState) {
		return true;
	}

	// Update if props are shallowly not equal, inspired by PureRenderMixin
	const keys = Object.keys(this.props);
	if (keys.length !== Object.keys(nextProps).length) {
		return true;
	}

	for (let i = keys.length - 1; i >= 0; i--) {
		const key = keys[i];
		const newValue = nextProps[key];
		if (newValue !== this.props[key]) {
			return true;
		} else if (newValue && typeof newValue === 'object' && !isObservable(newValue)) {
			// If the newValue is still the same object, but that object is not observable,
			// fallback to the default behavior: update, because the object *might* have changed.
			return true;
		}
	}
	return false;
}

export default function makeReactive(componentClass) {
	const target = componentClass.prototype || componentClass;
	const baseDidMount = target.componentDidMount;
	const baseWillMount = target.componentWillMount;
	const baseUnmount = target.componentWillUnmount;

	target.componentWillMount = function() {
		// Call original
		if (baseWillMount) {
			baseWillMount.call(this);
		}

		let reaction: Reaction;
		let isRenderingPending = false;

		const initialName =
			this.displayName ||
			this.name ||
			(this.constructor && (this.constructor.displayName || this.constructor.name)) ||
			'<component>';
		const baseRender = this.render.bind(this);

		const initialRender = (nextProps, nextContext) => {
			reaction = new Reaction(`${initialName}.render()`, () => {
				if (!isRenderingPending) {
					isRenderingPending = true;
					if (this.__$mobxIsUnmounted !== true) {
						let hasError = true;
						try {
							Component.prototype.forceUpdate.call(this);
							hasError = false;
						} finally {
							if (hasError) {
								reaction.dispose();
							}
						}
					}
				}
			});
			reactiveRender.$mobx = reaction;
			this.render = reactiveRender;
			return reactiveRender(nextProps, nextContext);
		};

		const reactiveRender: IReactiveRender = (nextProps, nextContext) => {
			isRenderingPending = false;
			let rendering;
			reaction.track(() => {
				if (isDevtoolsEnabled) {
					this.__$mobRenderStart = Date.now();
				}
				rendering = extras.allowStateChanges(false, baseRender.bind(this, nextProps, nextContext));
				if (isDevtoolsEnabled) {
					this.__$mobRenderEnd = Date.now();
				}
			});
			return rendering;
		};

		this.render = initialRender;
	};

	target.componentDidMount = function() {
		if (isDevtoolsEnabled) {
			reportRendering(this);
		}

		// Call original
		if (baseDidMount) {
			baseDidMount.call(this);
		}
	};

	target.componentWillUnmount = function() {
		// Call original
		if (baseUnmount) {
			baseUnmount.call(this);
		}

		// Dispose observables
		if (this.render.$mobx) {
			this.render.$mobx.dispose();
		}
		this.__$mobxIsUnmounted = true;

		if (isDevtoolsEnabled) {
			const node = this._vNode.dom;
			if (node && componentByNodeRegistery) {
				componentByNodeRegistery.delete(node);
			}
			renderReporter.emit({
				component: this,
				event: 'destroy',
				node,
			});
		}
	};

	if (!target.shouldComponentUpdate) {
		target.shouldComponentUpdate = scuMobx;
	}

	return componentClass;
}
