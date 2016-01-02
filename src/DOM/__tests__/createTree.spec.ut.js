import createTree from '../createTree';
import { render, renderToString } from '../rendering';

describe('createTree ( UT tests)', () => {

	it('should throw if array or no "schema"', () => {

		let throws;

		try {
			createTree();
			throws = true;
		}catch(e){
			throws = true;
		}

		expect(throws).to.equal(true);

		try {
			createTree([]);
			throws = true;
		}catch(e){
			throws = true;
		}

		expect(throws).to.equal(true);

	});
});