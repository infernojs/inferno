import { expect } from 'chai';
import { trackComponents } from '../dist-es/makeReactive';

describe('MobX trackComponents()', () => {
	const _WeakMap = WeakMap;

	it('should throw if WeakMap is undefined', () => {
		// eslint-disable-next-line
		WeakMap = undefined;
		expect(trackComponents).to.throw(Error);
	});

	it('should run', () => {
		// eslint-disable-next-line
		WeakMap = _WeakMap;
		trackComponents();
		expect(trackComponents).to.not.throw(Error);
	});
});
