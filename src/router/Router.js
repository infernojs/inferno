import Component from '../component';
import { isArray } from '../core/utils';
import { exec, convertToHashbang } from './utils';
import { createVNode } from '../core/createBlueprint';

function isValidPath(path, url, hashbang) {
	return !!exec(hashbang ? convertToHashbang(url) : url, path);
}

export default class Router extends Component {
	constructor(props) {
		super(props);
		if (!props.history) {
			throw new Error('Inferno Error: "inferno-router" Router components require a "history" prop passed.');
		}
		this._didRoute = false;
		this.state = {
			url: props.url || props.history.getCurrentUrl()
		};
	}
	getChildContext() {
		return {
			history: this.props.history,
			hashbang: this.props.hashbang
		};
	}
	componentWillMount() {
		this.props.history.addRouter(this);
	}
	componentWillUnmount() {
		this.props.history.removeRouter(this);
	}
	routeTo(url) {
		this._didRoute = false;
		this.setState({ url });
		return this._didRoute;
	}
	render() {
		const children = isArray(this.props.children) ? this.props.children : [ this.props.children ];
		const url = this.props.url || this.state.url;
		const wrapperComponent = this.props.component;
		const hashbang = this.props.hashbang;

		for (let i = 0; i < children.length; i++) {
			const child = children[i];
			const { path } = child.attrs;
			const params = exec(hashbang ? convertToHashbang(url) : url, path);

			if (params) {
				if (wrapperComponent) {
					return createVNode().setTag(wrapperComponent).setChildren(child).setAttrs({
						params
					});
				}
				return child.setAttrs(Object.assign({}, { params }, child.attrs));
			}
		}
		return wrapperComponent ? createVNode().setTag(wrapperComponent) : null;
	}
}