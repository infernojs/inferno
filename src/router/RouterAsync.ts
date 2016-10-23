import Component from '../component/es2015';
import { createVComponent } from '../core/shapes';
import resolve from './universal/resolve';
import { flatten, pathRankSort } from './utils';
import { toArray, isNull } from '../shared';

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
			url: props.url ? { pathname: props.url } : props.history.location,
			component: null,
			params: null,
			async: null
		};
	}

	getRoutes(component) {
			const routes = {
				path: component.props.path,
				component: component.props.component
			};

			if (!component.props.children) {
				return routes;
			}

			routes.children = component.props.children.map(child => {
				if (child.props.children) {
					return {
						path: child.props.path,
						component: child.props.component,
						children: this.getRoutes(child.props.children)
					};
				} else {
					return {
						path: child.props.path,
						component: child.props.component
					};
				}
			});

			return routes;
	}

	async() {
		const { children } = this.props;
		const { url } = this.state;

		this.setState({
			async: ASYNC_STATUS.pending
		});

		const routes = this.getRoutes(children);

		resolve(routes, url).then(value => {
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
		const { history } = this.props;

		if (history.listen) {
			this.unlisten = history.listen(url => {
				this.setState({
					url
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
