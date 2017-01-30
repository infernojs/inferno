import { expect } from 'chai';
import {
	isEmpty,
	mapSearchParams
} from '../dist-es/utils';

describe('Router #utils', () => {
	it('it should map search params to object', () => {
		let params;
		params = mapSearchParams('hello=world');
		expect(params.hello).to.equal('world');

		params = mapSearchParams('hello=world&utf8=çava-oui');
		expect(params.utf8).to.equal('çava-oui');

		params = mapSearchParams('arr[]=one&arr[]=two&arr[]=çava-oui');
		expect(params.arr[2]).to.equal('çava-oui');
	});

	it('it should return true for an empty object or array', () => {
		expect(isEmpty([])).to.equal(true);
		expect(isEmpty({})).to.equal(true);
		expect(isEmpty(Object.create(null))).to.equal(true);
	});
});
