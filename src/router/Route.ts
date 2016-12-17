import Component from 'inferno-component';
import createElement from 'inferno-create-element';

interface IRouteHook {
	(props?: any, router?: any): void;
}

export interface IRouteProps {
	params?: any;
	onEnter?: IRouteHook;
	onLeave?: IRouteHook;
	path: string;
	children: Array<Component<any, any>>;
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
			Promise.resolve().then(() => {
				onEnter({ props: this.props, router });
			});
		}
	}

	onLeave(trigger = false) {
		const { onLeave } = this.props;
		const { router } = this.context;

		if (onLeave && trigger) {
			onLeave({ props: this.props, router });
		}
	}

	componentWillUnmount() {
		this.onLeave(true);
	}

	componentWillReceiveProps(nextProps) {
		this.onLeave(this.props.path !== nextProps.path);
	}

	render({ component, children, params, ...props }) {
		return createElement(component, { params, ...props }, children);
	}
}
