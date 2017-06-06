import { trackComponents } from 'inferno-mobx/makeReactive';

describe('MobX trackComponents()', () => {
	const _WeakMap = WeakMap;

	it('should throw if WeakMap is undefined', () => {
		// eslint-disable-next-line
		WeakMap = undefined;
		expect(trackComponents).toThrowError(Error);
	});

	it('should run', () => {
		// eslint-disable-next-line
		WeakMap = _WeakMap;
		trackComponents();
		expect(trackComponents).not.toThrowError(Error);
	});
});
