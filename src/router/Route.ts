import Component from 'inferno-component';
import createElement from 'inferno-create-element';
import { rest } from './utils';

interface IRouteHook {
	(props?: any, router?: any): void;
}

export interface IRouteProps {
	params?: any;
	onEnter?: IRouteHook;
	onLeave?: IRouteHook;
	path: string;
	children: Array<Component<any, any>>;
	component?: Component<any, any>;
	getComponent(nextState: any, callback: (error: any, comp: Component<any, any>) => void): void;
}

export default class Route extends Component<IRouteProps, any> {
	constructor(props?: IRouteProps, context?: any) {
		super(props, context);
		this.state = {
			asyncComponent: null
		};
	}

	componentWillMount() {
		const { onEnter } = this.props;
		const { router } = this.context;

		if (onEnter) {
			Promise.resolve().then(() => {
				onEnter({ props: this.props, router });
			});
		}

		const { getComponent } = this.props;
		if (getComponent) {
			Promise.resolve().then(() => {
				getComponent({ props: this.props, router }, this._onComponentResolved);
			});
		}
	}

	private _onComponentResolved = (error, component) => {
		this.setState({
			asyncComponent: component
		});
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

	render(_args) {
		const { component, children } = _args;
		const props = rest(_args, ['component', 'children', 'path']);

		const { asyncComponent } = this.state;

		const resolvedComponent = component || asyncComponent;
		if (!resolvedComponent) {
			return null;
		}

		return createElement(resolvedComponent, props, children);
	}
}
