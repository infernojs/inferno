import Component from 'inferno-component';
import { warning } from 'inferno-shared';

const specialKeys = {
	children: true,
	key: true,
	ref: true
};

export default class Provider extends Component<any, any> {
	public contextTypes: any = {
		// tslint:disable-next-line:no-empty
		mobxStores() {}
	};
	public childContextTypes: any = {
		// tslint:disable-next-line:no-empty
		mobxStores() {}
	};
	private store: any;

	constructor(props?: any, context?: any) {
		super(props, context);
		this.store = props.store;
	}

	public render() {
		return this.props.children;
	}

	public getChildContext() {
		const stores = {};
		// inherit stores
		const baseStores = this.context.mobxStores;

		if (baseStores) {
			for (const key in baseStores) {
				stores[ key ] = baseStores[ key ];
			}
		}
		// add own stores
		for (const key in this.props) {
			if (!specialKeys[ key ]) {
				stores[ key ] = this.props[ key ];
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
		for (const key in nextProps) {
			if (!specialKeys[ key ] && this.props[ key ] !== nextProps[ key ]) {
				warning(
					`MobX Provider: Provided store '${key}' has changed. ` +
					`Please avoid replacing stores as the change might not propagate to all children`
				);
			}
		}
	};
}
