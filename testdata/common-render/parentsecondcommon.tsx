import { ParentBaseCommon } from './parentbase';
import Inferno from 'inferno';
Inferno; // suppress ts 'never used' error

export class ParentSecondCommon extends ParentBaseCommon {
	foo: string;
	constructor(props) {
		super(props);

		this.foo = 'Second';
	}
}
