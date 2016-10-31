import {
	expect
} from 'chai';
import {
	createStyler,
	innerHTML,
	style,
	triggerEvent
} from '../utils';
import {
	assert,
	spy,
} from 'sinon';

describe('Utils - innerHTML', () => {
	it('should return the correct innerHTML', () => {
		const testHTML = '<div>Hello World <a href="//test.com/">test link</a></div>';

		expect(innerHTML(testHTML)).to.equal(testHTML);
	});
});

describe('Utils - createStyler', () => {
	it('should return undefined if undefined', () => {
		const CSS = undefined;
		expect(createStyler(CSS)).to.equal(CSS);
	});

	it('should return CSS if null', () => {
		const CSS = null;
		expect(createStyler(CSS)).to.equal(CSS);
	});

	it('should create a valid CSS string', () => {
		const CSS = `
			position: relative;
			top: -20
			left: 5;
			right: 10px;
		`;
		const validCSS = 'position: relative; right: 10px;';

		expect(createStyler(CSS)).to.equal(validCSS);
	});
});

describe('Utils - style', () => {
	it('should map an array', () => {
		const CSS = ['1', 'position: relative;', '3'];

		const expected = [ '', 'position: relative;', ''];
		const actual = style(CSS);

		expect(JSON.stringify(actual)).to.equal(JSON.stringify(expected));
	});

	it('return the created style', () => {
		const CSS = `
			position: relative;
			top: -20
			left: 5;
			right: 10px;
		`;
		expect(style(CSS)).to.equal(createStyler(CSS));
	});
});

describe('Utils - triggerEvent', () => {
	let element;
	let spyDispatch;

	beforeEach(() => {
		element = {
			dispatchEvent(event) {},
		};
		spyDispatch =	spy(element, 'dispatchEvent');
	});

	it('should return type MouseEvents on click', () => {
		triggerEvent('click', element);

		assert.calledOnce(spyDispatch);
	});

	it('should return type MouseEvents on dblclick', () => {
		triggerEvent('dblclick', element);

		assert.calledOnce(spyDispatch);
	});

	it('should return type MouseEvents on mousedown', () => {
		triggerEvent('mousedown', element);

		assert.calledOnce(spyDispatch);
	});

	it('should return type MouseEvents on mouseup', () => {
		triggerEvent('mouseup', element);

		assert.calledOnce(spyDispatch);
	});

	it('should return type MouseEvents on focus', () => {
		triggerEvent('focus', element);

		assert.calledOnce(spyDispatch);
	});

	it('should return type MouseEvents on change', () => {
		triggerEvent('change', element);

		assert.calledOnce(spyDispatch);
	});

	it('should return type MouseEvents on blur', () => {
		triggerEvent('blur', element);

		assert.calledOnce(spyDispatch);
	});

	it('should return type MouseEvents on select', () => {
		triggerEvent('select', element);

		assert.calledOnce(spyDispatch);
	});

	it('should return type MouseEvents on blah', () => {
		expect(triggerEvent.bind(triggerEvent, 'blah', element)).to.throw(Error);
	});
});
