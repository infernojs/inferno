import Inferno from '../../src/testUtils/inferno';
import { ParentBaseCommon } from './parentbase.jsx';

Inferno; // suppress ts 'never used' error

export class ParentSecondCommon extends ParentBaseCommon {
	constructor(props) {
		super(props);

		this.foo = 'Second';
	}
}
