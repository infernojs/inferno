import { createVComponent } from '../core/shapes';
import Component from '../component/es2015';

const ASYNC_STATUS = {
	pending: 'pending',
	fulfilled: 'fulfilled',
	rejected: 'rejected'
};

export interface IRouteProps {
	async?: (params?: any) => Promise<any>;
	params?: any;
	onEnter?: any;
	onLeave?: any;
	component?: Component<any, any>;
}

export default class Route extends Component<IRouteProps, any> {
	constructor(props?: IRouteProps, context?: any) {
		super(props, context);
		this.state = {
			async: null
		};
	}

	async() {
		const async = this.props.async;

		if (async) {
			this.setState({
				async: { status: ASYNC_STATUS.pending }
			});
			async(this.props.params).then(value => {
				this.setState({
					async: {
						status: ASYNC_STATUS.fulfilled,
						value
					}
				});
			}, this.reject).catch(this.reject);
		}
	}

	onEnter() {
		const { onEnter } = this.props;
		if (onEnter) {
			onEnter(this.props, this.context.router);
		}
	}

	onLeave() {
		const { onLeave } = this.props;
		if (onLeave) {
			onLeave(this.props, this.context.router);
		}
	}

	reject(value) {
		this.setState({
			async: {
				status: ASYNC_STATUS.rejected,
				value
			}
		});
	}

	componentWillReceiveProps() {
		this.async();
		this.onLeave();
	}

	componentWillMount() {
		this.async();
	}

	componentDidUpdate() {
		this.onEnter();
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
