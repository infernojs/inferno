import Component from 'inferno-component';
import createElement from 'inferno-create-element';

export interface IRouteProps {
	params?: any;
	onEnter?: any;
	onLeave?: any;
	children?: any;
	component?: Component<any, any>;
}

export default class Route extends Component<IRouteProps, any> {
	constructor(props?: IRouteProps, context?: any) {
		super(props, context);
	}

	componentWillMount() {
		const { onEnter } = this.props;
		if (onEnter) {
			onEnter(this.props, this.context.router);
		}
	}

	componentWillUnmount() {
		const { onLeave } = this.props;
		if (onLeave) {
			onLeave(this.props, this.context);
		}
	}

	render() {
		const { component, children, params } = this.props;
		console.debug(component.name || component.displayName, '--', params, children);
		const newRoute = {
			params,
			children
		};

		return createElement(component, newRoute);
	}
}
