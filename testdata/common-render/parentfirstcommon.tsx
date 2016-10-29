import { ParentBaseCommon } from './parentbase';
import * as Inferno from '../../src/testUtils/inferno';
Inferno; // suppress ts 'never used' error

export class ParentFirstCommon extends ParentBaseCommon {
	foo: string;
	constructor(props) {
		super(props);

		this.foo = 'First';
	}
}
