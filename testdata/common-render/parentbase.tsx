import Component from '../../src/component/es2015';
import { ChildCommon } from './child';
import Inferno from 'inferno';
Inferno; // suppress ts 'never used' error

export class ParentBaseCommon extends Component<any, any> {
	foo: string;
	render() {
		return (
			<div>
				<ChildCommon name={this.foo}/>
			</div>
		);
	}
}
