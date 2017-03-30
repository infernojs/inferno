import { expect } from 'chai';
import { stub } from 'sinon';
import { shallowEqual, warning } from '../dist-es/utils';

describe('Redux Utils', () => {
	describe('warning', () => {
		it('should log message using console.error', () => {
			// stub instead of spy to prevent console.error actually firing during test
			const stubFn = stub(console, 'error').callsFake((message) => null);
			warning('warning!');
			expect(stubFn.calledOnce).to.equal(true);
			expect(stubFn.calledWith('warning!')).to.equal(true);
			stubFn.restore();
		});
	});
	describe('shallowEqual', () => {
		it('should return true if two objects are strictly equal', () => {
			const obj = { key: 'value' };
			expect(shallowEqual(obj, obj)).to.equal(true);
		});
		it('should return false if two objects have different key lengths', () => {
			const obj1 = { key: 'value' };
			const obj2 = { key: 'value', key2: 'value2' };
			expect(shallowEqual(obj1, obj2)).to.equal(false);
		});
		it('should return false if two objects have different key values', () => {
			const obj1 = { key: 'value', key2: 'value3' };
			const obj2 = { key: 'value', key2: 'value2' };
			expect(shallowEqual(obj1, obj2)).to.equal(false);
		});
		it('should return true if two objects have same keys and values', () => {
			const obj1 = { key: 'value', key2: 'value2' };
			const obj2 = { key: 'value', key2: 'value2' };
			expect(shallowEqual(obj1, obj2)).to.equal(true);
		});
	});
});
