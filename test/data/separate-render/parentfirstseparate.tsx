import { ChildSeparate } from './childseparate';
import Component from 'inferno-component';
import Inferno from 'inferno';
Inferno; // suppress ts 'never used' error

export class ParentFirstSeparate extends Component<any, any> {
	foo: string;
	constructor(props) {
		super(props);

		this.foo = 'First';
	}

	render() {
		return (
			<div>
				<ChildSeparate name={this.foo}/>
			</div>
		);
	}
}
