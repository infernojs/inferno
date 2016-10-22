import Component from '../component/es2015';
import { createVComponent } from '../core/shapes';
import resolve from './universal/resolve';
import history from './history';

export interface IRouterProps {
	url: string;
	component?: Component<any, any>;
}

const ASYNC_STATUS = {
	pending: 'pending',
	fulfilled: 'fulfilled',
	rejected: 'rejected'
};

export default class RouterAsync extends Component<IRouterProps, any> {
	unlisten: any;

	constructor(props?: any, context?: any) {
		super(props, context);
		this._didRoute = false;
		this.state = {
			location: props.url ? { pathname: props.url } : history.location,
			component: null,
			params: null,
			async: null
		};
	}

	async() {
		const { children } = this.props;
		const { location } = this.state;

		this.setState({
			async: ASYNC_STATUS.pending
		});

		resolve(children, location).then(value => {
			this.setState({
				component: value.component,
				params: value.params,
				async: ASYNC_STATUS.fulfilled
			});
		}).catch(err => this.reject(err));
	}

	reject(value) {
		this.setState({
			component: value.component,
			params: value.params,
			async: ASYNC_STATUS.rejected
		});
	}

	componentWillReceiveProps() {
		this.async();
	}

	componentWillMount() {
		if (history.listen) {
			this.unlisten = history.listen(location => {
				// console.warn('Location:', loc);
				this.setState({
					location
				});
			});
		}

		this.async();
	}

	componentWillUnmount() {
		if (this.unlisten) {
			this.unlisten();
		}
	}

	render() {
		const { component, params, async } = this.state;

		if (async === ASYNC_STATUS.fulfilled) {
			return createVComponent(component, params);
		}

		return createVComponent(() => {
			return null;
		}, null);
	}
}
