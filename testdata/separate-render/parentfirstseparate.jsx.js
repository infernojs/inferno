import Inferno from '../../src/testUtils/inferno';
import Component from '../../src/component/es2015';
import {ChildSeparate} from './childseparate.jsx.js';

Inferno; // suppress ts 'never used' error

export class ParentFirstSeparate extends Component {
	constructor(props) {
		super(props);

		this.foo = 'First';
	}

	render() {
		return (
			<div>
				<ChildSeparate name={this.foo} />
			</div>
		);
	}
}
