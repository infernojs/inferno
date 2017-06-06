import { EventEmitter } from 'inferno-mobx';

const testdata = {
	testKey: 'testdata',
};
const testListener = function(data) {
	expect(data).toBe(testdata);
};

describe('mobx - EventEmitter', () => {
	it('should have an empty listner array on construction', () => {
		const unit = new EventEmitter();
		expect(unit.getTotalListeners()).toBe(0);
	});

	it('should add a listener and allow to remove it', () => {
		const unit = new EventEmitter();
		const removeListener = unit.on(testListener);

		expect(unit.getTotalListeners()).toBe(1);

		removeListener();

		expect(unit.getTotalListeners()).toBe(0);
	});

	it('should all data to be emmitted by the listners', () => {
		const unit = new EventEmitter();
		const removeListener = unit.on(testListener);

		unit.emit(testdata);

		removeListener();
	});

	it('should allow to remove all listeners', () => {
		const unit = new EventEmitter();
		unit.on(testListener);
		unit.clearListeners();

		expect(unit.getTotalListeners()).toBe(0);
	});
});
