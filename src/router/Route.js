import { createVNode } from '../core/shapes';
import Component from '../component/es2015';

const ASYNC_STATUS = {
	pending: 'pending',
	fulfilled: 'fulfilled',
	rejected: 'rejected'
};

export default class Route extends Component {
	constructor(props, context) {
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
	}

	componentWillMount() {
		this.async();
	}

	render() {
		const { component, params } = this.props;

		return createVNode().setTag(component).setAttrs({ params, async: this.state.async });
	}
}
