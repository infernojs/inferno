import Component from '../../src/component/es2015';
import * as Inferno from '../../src/testUtils/inferno';
Inferno; // suppress ts 'never used' error

export class ChildCommon extends Component<any, any> {
	constructor(props) {
		super(props);

		this._update = this._update.bind(this);
	}

	_update() {
		this.setState({
			data: 'bar'
		});
	}

	componentWillMount() {
		this.setState({
			data: 'foo'
		});
	}

	render() {
		return (
			<div onclick={this._update}>
				{this.props.name}
				{this.state.data}
			</div>
		);
	}
}
