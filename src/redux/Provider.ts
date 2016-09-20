import Component from '../component/es2015';
import { warning } from './utils';
import { isNullOrUndef, toArray } from '../shared';

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
	store: any;
	getChildContext() {
		return { store: this.store };
	}

	constructor(props, context) {
		super(props, context);
		this.store = props.store;
	}

	render() {
		if (isNullOrUndef(this.props.children) || toArray(this.props.children).length !== 1) {
			throw Error('Inferno Error: Only one child is allowed within the `Provider` component');
		}

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
