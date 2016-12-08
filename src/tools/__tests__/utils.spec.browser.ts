import {
	createStyler,
	innerHTML,
	style,
	triggerEvent,
} from '../utils';
import {
	spy,
	stub,
} from 'sinon';

import {
	expect,
} from 'chai';

const styleStringToArray = (styleString: string) => styleString.split(';').map((s) => s.trim());

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

		expect(styleStringToArray(createStyler(CSS))).to.have.members(styleStringToArray(validCSS));
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
		const CSS: string = `
			position: relative;
			top: -20
			left: 5;
			right: 10px;
		`;

		expect(styleStringToArray(style(CSS))).to.have.members(styleStringToArray(createStyler(CSS)));
	});
});

describe('Utils - triggerEvent', () => {
	const element = {
		dispatchEvent(event) {},
	};
	const spyDispatch = spy(element, 'dispatchEvent');
	let spyCreateMouseEvent;

	afterEach(() => {
		spyDispatch.reset();
		spyCreateMouseEvent.restore();
	});

	it('should trigger event on click', () => {
		const triggerName = 'click';
		const triggeredEventType = 'MouseEvents';
		const event = {
			initEvent: (eventType, canBubble, cancelable) => {
				expect(eventType).to.equal(triggerName);
				expect(canBubble).to.be.true;
				expect(cancelable).to.be.true;
			}
		};
		spyCreateMouseEvent = stub(document, 'createEvent', (eventInterface) => {
			expect(eventInterface).to.equal(triggeredEventType);

			return event;
		});

		triggerEvent(triggerName, element);

		expect(spyDispatch.args[0][0]).to.equal(event);
		expect(spyDispatch.args[0][1]).to.be.true;
	});

	it('should trigger event on dblclick', () => {
		const triggerName = 'dblclick';
		const triggeredEventType = 'MouseEvents';
		const event = {
			initEvent: (eventType, canBubble, cancelable) => {
				expect(eventType).to.equal(triggerName);
				expect(canBubble).to.be.true;
				expect(cancelable).to.be.true;
			}
		};
		spyCreateMouseEvent = stub(document, 'createEvent', (eventInterface) => {
			expect(eventInterface).to.equal(triggeredEventType);

			return event;
		});

		triggerEvent(triggerName, element);

		expect(spyDispatch.args[0][0]).to.equal(event);
		expect(spyDispatch.args[0][1]).to.be.true;
	});

	it('should trigger event on mousedown', () => {
		const triggerName = 'mousedown';
		const triggeredEventType = 'MouseEvents';
		const event = {
			initEvent: (eventType, canBubble, cancelable) => {
				expect(eventType).to.equal(triggerName);
				expect(canBubble).to.be.true;
				expect(cancelable).to.be.true;
			}
		};
		spyCreateMouseEvent = stub(document, 'createEvent', (eventInterface) => {
			expect(eventInterface).to.equal(triggeredEventType);

			return event;
		});

		triggerEvent(triggerName, element);

		expect(spyDispatch.args[0][0]).to.equal(event);
		expect(spyDispatch.args[0][1]).to.be.true;
	});

	it('should trigger event on mouseup', () => {
		const triggerName = 'mouseup';
		const triggeredEventType = 'MouseEvents';
		const event = {
			initEvent: (eventType, canBubble, cancelable) => {
				expect(eventType).to.equal(triggerName);
				expect(canBubble).to.be.true;
				expect(cancelable).to.be.true;
			}
		};
		spyCreateMouseEvent = stub(document, 'createEvent', (eventInterface) => {
			expect(eventInterface).to.equal(triggeredEventType);

			return event;
		});

		triggerEvent(triggerName, element);

		expect(spyDispatch.args[0][0]).to.equal(event);
		expect(spyDispatch.args[0][1]).to.be.true;
	});

	it('should trigger event on focus', () => {
		const triggerName = 'focus';
		const triggeredEventType = 'HTMLEvents';
		const event = {
			initEvent: (eventType, canBubble, cancelable) => {
				expect(eventType).to.equal(triggerName);
				expect(canBubble).to.be.true;
				expect(cancelable).to.be.true;
			}
		};
		spyCreateMouseEvent = stub(document, 'createEvent', (eventInterface) => {
			expect(eventInterface).to.equal(triggeredEventType);

			return event;
		});

		triggerEvent(triggerName, element);

		expect(spyDispatch.args[0][0]).to.equal(event);
		expect(spyDispatch.args[0][1]).to.be.true;
	});

	it('should trigger event on change', () => {
		const triggerName = 'change';
		const triggeredEventType = 'HTMLEvents';
		const event = {
			initEvent: (eventType, canBubble, cancelable) => {
				expect(eventType).to.equal(triggerName);
				expect(canBubble).to.be.false;
				expect(cancelable).to.be.true;
			}
		};
		spyCreateMouseEvent = stub(document, 'createEvent', (eventInterface) => {
			expect(eventInterface).to.equal(triggeredEventType);

			return event;
		});

		triggerEvent(triggerName, element);

		expect(spyDispatch.args[0][0]).to.equal(event);
		expect(spyDispatch.args[0][1]).to.be.true;
	});

	it('should trigger event on blur', () => {
		const triggerName = 'blur';
		const triggeredEventType = 'HTMLEvents';
		const event = {
			initEvent: (eventType, canBubble, cancelable) => {
				expect(eventType).to.equal(triggerName);
				expect(canBubble).to.be.true;
				expect(cancelable).to.be.true;
			}
		};
		spyCreateMouseEvent = stub(document, 'createEvent', (eventInterface) => {
			expect(eventInterface).to.equal(triggeredEventType);

			return event;
		});

		triggerEvent(triggerName, element);

		expect(spyDispatch.args[0][0]).to.equal(event);
		expect(spyDispatch.args[0][1]).to.be.true;
	});

	it('should trigger event on select', () => {
		const triggerName = 'select';
		const triggeredEventType = 'HTMLEvents';
		const event = {
			initEvent: (eventType, canBubble, cancelable) => {
				expect(eventType).to.equal(triggerName);
				expect(canBubble).to.be.true;
				expect(cancelable).to.be.true;
			}
		};
		spyCreateMouseEvent = stub(document, 'createEvent', (eventInterface) => {
			expect(eventInterface).to.equal(triggeredEventType);

			return event;
		});

		triggerEvent(triggerName, element);

		expect(spyDispatch.args[0][0]).to.equal(event);
		expect(spyDispatch.args[0][1]).to.be.true;
	});

	it('should throw an error on unknown event', () => {
		const triggerName = 'blah';

		expect(triggerEvent.bind(triggerEvent, triggerName, element)).to.throw(Error);
	});
});
