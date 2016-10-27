import Inferno from '../../src/testUtils/inferno';
import Component from '../../src/component/es2015';
import {ChildCommon} from './child.jsx.js';

Inferno; // suppress ts 'never used' error

export class ParentBaseCommon extends Component {
	render() {
		return (
			<div>
				<ChildCommon name={this.foo} />
			</div>
		);
	}
}
