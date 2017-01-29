import { ParentBaseCommon } from './parentbase';

export class ParentSecondCommon extends ParentBaseCommon {
	foo: string;
	constructor(props) {
		super(props);

		this.foo = 'Second';
	}
}
