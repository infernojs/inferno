import { ParentBaseCommon } from './parentbase';

export class ParentFirstCommon extends ParentBaseCommon {
	foo: string;
	constructor(props) {
		super(props);

		this.foo = 'First';
	}
}
