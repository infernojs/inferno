import { createVComponent } from '../core/shapes';
import Component from '../component/es2015';

export interface IRouteProps {
	onEnter?: (props?: any, router?: any) => Promise<any>;
	onLeave?: (props?: any, router?: any) => Promise<any>;
	params?: any;
	onEnter?: any;
	onLeave?: any;
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
		return createVComponent(component, {
			params,
			children,
			async: this.state.async
		});
	}
}
