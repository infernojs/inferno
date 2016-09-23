import Component from '../component/es2015';
import { isNullOrUndef, toArray, warning } from '../shared';

function PropTypesAny () {}
const specialKeys = {
	children: true,
	key: true,
	ref: true
};

function ChildrenOnly (children) {
	if (isNullOrUndef(children) || toArray(children).length !== 1) {
		throw Error('Inferno Error: Only one child is allowed within the `Provider` component');
	}
	return children;
}

export default class Provider extends Component<any, any> {
	private store: any;
	contextTypes = { mobxStores: PropTypesAny };
	childContextTypes = { mobxStores: PropTypesAny };

	constructor (props?: any, context?: any) {
		super(props, context);
		this.store = props.store;
	}

	public render () {
		return ChildrenOnly(this.props.children);
	}

	getChildContext () {
		let stores = {};
		// inherit stores
		let baseStores = this.context.mobxStores;

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
		if ( Object.keys( nextProps ).length !== Object.keys( this.props ).length ) {
			warning(false, "MobX Provider: The set of provided stores has changed. Please avoid changing stores as the change might not propagate to all children" );
		}
		for ( let key in nextProps ) {
			if ( !specialKeys[ key ] && this.props[ key ] !== nextProps[ key ] ) {
				warning(false, "MobX Provider: Provided store '" + key + "' has changed. Please avoid replacing stores as the change might not propagate to all children" );
			}
		}

		/*warning(Object.keys(nextProps).length === Object.keys(this.props).length,
			'MobX Provider: The set of provided stores has changed. ' +
			'Please avoid changing stores as the change might not propagate to all children'
		);
		for (let key in nextProps) {
			warning(specialKeys[key] && this.props[key] === nextProps[key],
				'MobX Provider: Provided store \'' + key + "' has changed. " +
				'Please avoid replacing stores as the change might not propagate to all children'
			);
		}*/
	};
}
