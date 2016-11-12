import Component from 'inferno-component';
import createElement from 'inferno-create-element';

interface IRouteHook {
	(props?: any, router?: any): void;
}

export interface IRouteProps {
	params?: any;
	onEnter?: IRouteHook;
	onLeave?: IRouteHook;
	children?: any;
	component: Component<any, any>;
}

export default class Route extends Component<IRouteProps, any> {
	constructor(props?: IRouteProps, context?: any) {
		super(props, context);
	}

	componentWillMount() {
		const { onEnter } = this.props;
		const { router } = this.context;

		if (onEnter) {
			setImmediate(() => {
				onEnter({ props: this.props, router });
			});
		}
	}

	componentWillUnmount() {
		const { onLeave } = this.props;
		const { router } = this.context;

		if (onLeave) {
			onLeave({ props: this.props, router });
		}
	}

	render({ component, children, params }) {
		return createElement(component, {
			params,
			children
		});
	}
}
