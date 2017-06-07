import Component from 'inferno-component';
import { isNullOrUndef, toArray } from 'inferno-shared';
import { warning } from './utils';

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

export default class Provider extends Component<any, any> {
	public store: any;

	constructor(props, context?: any) {
		super(props, context);
		this.store = props.store;
	}

	public getChildContext() {
		return { store: this.store };
	}

	public render(props) {
		if (isNullOrUndef(this.props.children) || toArray(this.props.children).length !== 1) {
			throw Error('Inferno Error: Only one child is allowed within the `Provider` component');
		}

		return props.children;
	}
}

if (process.env.NODE_ENV !== 'production') {
	Provider.prototype.componentWillReceiveProps = function(nextProps) {
		const { store } = this;
		const { store: nextStore } = nextProps;

		if (store !== nextStore) {
			warnAboutReceivingStore();
		}
	};
}
