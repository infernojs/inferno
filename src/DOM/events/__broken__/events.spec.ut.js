import addListener from '../addListener';
import removeListener from '../removeListener';
import addRootListener from '../addRootListener';
import { render, renderToString } from '../../../core/rendering';

describe('Template', () => {

	let container;

	beforeEach(() => {
		container = document.createElement('div');
	});

	afterEach(() => {
		render(null, container);
	});

	it('should set a listener', () => {
		addListener(null, container, 'click', () => {});
		expect(container.innerHTML).to.equal('');

		addListener(null, container, 'blur', () => {});
		expect(container.innerHTML).to.equal('');

		addListener(null, container, 'scroll', () => {});
		expect(container.innerHTML).to.equal('');
	});

	it('should throw if the event is not registered', () => {
		let throwed;

		try {
			addListener(null, container, 'cdlick', () => {})
			throwed = false;
		} catch(e){
			throwed = true;
		}
		expect(throwed).to.equal(true);
	});

	it('should set a listener, but do nothing if node is null', () => {
		addListener(null, null, 'click', function() {});
		expect(container.innerHTML).to.equal('');
	});

	it('should add and remove listener', () => {
		const handler = () => {};
		addListener(null, container, 'click', handler);
		removeListener(null, container, 'click', handler);
		expect(container.innerHTML).to.equal('');

		addListener(null, container, 'scroll', handler);
		removeListener(null, container, 'scroll', handler);
		expect(container.innerHTML).to.equal('');

		addListener(null, container, 'blur', handler);
		removeListener(null, container, 'blur', handler);
		expect(container.innerHTML).to.equal('');
	});

	it('should remove listener', () => {
		const handler = () => {};
		removeListener(null, container, 'click', handler);
		expect(container.innerHTML).to.equal('');
	});

	it('should remove listener, but do nothing if node is null', () => {
		const handler = () => {};
		removeListener(null, null, 'click', handler);
		expect(container.innerHTML).to.equal('');
	});

	it('should throw if trying to set a rootlistener without a event object', () => {
		let throwed;

		try {
			addRootListener({}, 'click');
			throwed = false;
		} catch(e){
			throwed = true;
		}
		expect(throwed).to.equal(true);
	});
});