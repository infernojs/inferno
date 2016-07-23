import Component from '../component/es2015';
import { warning, shallowEqual } from './utils';
import { isFunction } from '../core/utils';
import { createBlueprint, createVNode } from '../core/shapes';
import hoistStatics from 'hoist-non-inferno-statics';

let didWarnAboutReceivingStore = false;
function warnAboutReceivingStore() {
	if (didWarnAboutReceivingStore) {
		return;
	}
	didWarnAboutReceivingStore = true;

	warning(
		'<Provider> does not support changing `store` on the fly.'
	);
}

export default class Provider extends Component {
	getChildContext() {
		return { store: this.store };
	}
	constructor(props, context) {
		super(props, context);
		this.store = props.store;
	}
	render() {
		return this.props.children;
	}
}

if (process.env.NODE_ENV !== 'production') {
	Provider.prototype.componentWillReceiveProps = function (nextProps) {
		const { store } = this;
		const { store: nextStore } = nextProps;

		if (store !== nextStore) {
			warnAboutReceivingStore();
		}
	};
}
