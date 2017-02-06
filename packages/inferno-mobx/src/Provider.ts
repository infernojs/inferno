import Component from 'inferno-component';
import { warning } from 'inferno-shared';

const specialKeys = {
	children: true,
	key: true,
	ref: true
};

export default class Provider extends Component<any, any> {
	contextTypes: any = { mobxStores() {} };
	childContextTypes: any = { mobxStores() {} };
	private store: any;

	constructor(props?: any, context?: any) {
		super(props, context);
		this.store = props.store;
	}

	public render() {
		return this.props.children;
	}

	getChildContext() {
		const stores = {};
		// inherit stores
		const baseStores = this.context.mobxStores;

		if (baseStores) {
			for (let key in baseStores) {
				stores[key] = baseStores[key];
			}
		}
		// add own stores
		for (let key in this.props) {
			if (!specialKeys[key]) {
				stores[key] = this.props[key];
			}
		}
		return {
			mobxStores: stores
		};
	}
}

if (process.env.NODE_ENV !== 'production') {
	Provider.prototype.componentWillReceiveProps = function(nextProps) {

		// Maybe this warning is to aggressive?
		if (Object.keys(nextProps).length !== Object.keys(this.props).length) {
			warning(
				'MobX Provider: The set of provided stores has changed. ' +
				'Please avoid changing stores as the change might not propagate to all children'
			);
		}
		for (let key in nextProps) {
			if (!specialKeys[key] && this.props[key] !== nextProps[key]) {
				warning(
					`MobX Provider: Provided store '${key}' has changed. ` +
					`Please avoid replacing stores as the change might not propagate to all children`
				);
			}
		}
	};
}
