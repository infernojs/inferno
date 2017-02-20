import Component from 'inferno-component';
import { ChildSeparate } from './childseparate';

export class ParentSecondSeparate extends Component<any, any> {
	foo: string;
	constructor(props) {
		super(props);

		this.foo = 'Second';
	}

	render() {
		return (
			<div>
				<ChildSeparate name={this.foo}/>
			</div>
		);
	}
}
