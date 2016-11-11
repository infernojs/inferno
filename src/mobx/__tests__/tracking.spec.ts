import { expect } from 'chai';
import { trackComponents } from '../observer';

describe('MobX trackComponents()', () => {
	const _WeakMap = WeakMap;

	it('should throw if WeakMap is undefined', () => {
		WeakMap = undefined;
		expect(trackComponents).to.throw(Error);
	});

	it('should run', () => {
		WeakMap = _WeakMap;
		trackComponents();
		expect(trackComponents).to.not.throw(Error);
	});
});
