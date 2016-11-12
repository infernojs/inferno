import { isObservable, Reaction } from 'mobx';
import { throwError } from '../shared';
import { default as Inferno } from 'inferno';
import EventEmitter from './EventEmitter';
const { findDOMNode } = Inferno;

/**
 * Dev tools support
 */
let isDevtoolsEnabled = false;

export const componentByNodeRegistery: WeakMap<any, any> = new WeakMap();
export const renderReporter = new EventEmitter();

function reportRendering (component) {
	// TODO: Add return type to findDOMNode
	const node = findDOMNode(component);
	if (node && componentByNodeRegistery) {
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
	if (typeof WeakMap === 'undefined') {
		throwError('[inferno-mobx] tracking components is not supported in this browser.');
	}
	if (!isDevtoolsEnabled) {
		isDevtoolsEnabled = true;
	}
}

export default function observer (componentClass) {

	const target = componentClass.prototype || componentClass;
	const baseDidMount = target.componentDidMount;
	const baseWillMount = target.componentWillMount;
	const baseUnmount = target.componentWillUnmount;
	let reaction: Reaction;

	target.componentWillMount = function () {
		if (typeof this.componentWillReact === 'function') {
			this.componentWillReact();
		}
		if (baseWillMount) {
			baseWillMount.call(this);
		}
	};

	target.componentDidMount = function () {
		const initialName = this.displayName || this.name || (this.constructor && (this.constructor.displayName || this.constructor.name)) || "<component>";

		reaction = new Reaction(`${initialName}.render()`, () => {
			reaction.track(() => {
				this.render(this.props, this.context);
				this.forceUpdate();
			});
		});

		// Start or schedule the just created reaction
		reaction.runReaction();
		this.disposer = reaction.getDisposer();

		if (isDevtoolsEnabled) {
			reportRendering(this);
		}
		if (baseDidMount) {
			baseDidMount.call(this);
		}
	};

	target.componentWillUnmount = function () {
		this.disposer();

		if (baseUnmount) {
			baseUnmount.call(this);
		}

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
	};

	target.shouldComponentUpdate = function (nextProps, nextState) {
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
			let key = keys[i];
			const newValue = nextProps[key];
			if (newValue !== this.props[key]) {
				return true;
			} else if (newValue && typeof newValue === 'object' && !isObservable(newValue)) {
				// If the newValue is still the same object, but that object is not observable,
				// fallback to the default behavior: update, because the object *might* have changed.
				return true;
			}
		}
		return true;
	};

	return componentClass;
}
