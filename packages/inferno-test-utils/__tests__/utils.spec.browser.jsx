import { spy, stub } from 'sinon';
import {
	createContainerWithHTML,
	createStyler,
	innerHTML,
	sortAttributes,
	style,
	triggerEvent,
	validateNodeTree
} from 'inferno-utils';


import { render } from 'inferno';
import { renderToString } from 'inferno-server';

const styleStringToArray = (styleString) => styleString.split(';').map((s) => s.trim());

describe('Utils', () => {
	describe('sortAttributes', () => {
		it('should return sorted attributes on HTML strings', () => {
			expect(
				sortAttributes(
					'<div zAttribute="test" aAttribute="inferno" bAttribute="running">Inferno <span fAttribute="huh" cAttr="last">is cool!</span></div>'
				)
			).to.equal(
				'<div aAttribute="inferno" bAttribute="running" zAttribute="test">Inferno <span cAttr="last" fAttribute="huh">is cool!</span></div>'
			);
		});
	});

	describe('innerHTML', () => {
		it('should return the correct innerHTML', () => {
			const testHTML = '<div>Hello World <a href="//test.com/">test link</a></div>';

			expect(innerHTML(testHTML)).to.equal(testHTML);
		});
	});

	describe('createStyler', () => {
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

	describe('style', () => {
		it('should map an array', () => {
			const CSS = [ '1', 'position: relative;', '3' ];

			const expected = [ '', 'position: relative;', '' ];
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

			expect(styleStringToArray(style(CSS))).to.have.members(styleStringToArray(createStyler(CSS)));
		});
	});

	describe('createContainerWithHTML', () => {
		it('should create a container with the passed in HTML', () => {
			const container = createContainerWithHTML('<h1>hello!</h1>');
			expect(container.innerHTML).to.equal('<h1>hello!</h1>');
			expect(container.tagName).to.equal('DIV');
		});
	});
	describe('validateNodeTree', () => {

		it('should return true if called with falsy arguments', () => {
			expect(validateNodeTree(false)).to.equal(true);
			expect(validateNodeTree(null)).to.equal(true);
			expect(validateNodeTree(undefined)).to.equal(true);
		});

		it('should return true if called with a string', () => {
			expect(validateNodeTree('<div><h1>test</h1></div>')).to.equal(true);
		});

		it('should return true if called with a number', () => {
			expect(validateNodeTree(4)).to.equal(true);
		});

		it('should return true on a valid node tree', () => {
			const node = <div><span>Hello world</span></div>;
			const html = renderToString(node);
			const container = createContainerWithHTML(html);
			render(node, container);
			expect(validateNodeTree(node)).to.equal(true);
		});

	});

	describe('triggerEvent', () => {
		const element = {
			dispatchEvent(event) {
			}
		};
		const spyDispatch = spy(element, 'dispatchEvent');
		let spyCreateMouseEvent;

		afterEach(function () {
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
			spyCreateMouseEvent = stub(document, 'createEvent').callsFake((eventInterface) => {
				expect(eventInterface).to.equal(triggeredEventType);

				return event;
			});

			triggerEvent(triggerName, element);

			expect(spyDispatch.args[ 0 ][ 0 ]).to.equal(event);
			expect(spyDispatch.args[ 0 ][ 1 ]).to.be.true;
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
			spyCreateMouseEvent = stub(document, 'createEvent').callsFake((eventInterface) => {
				expect(eventInterface).to.equal(triggeredEventType);

				return event;
			});

			triggerEvent(triggerName, element);

			expect(spyDispatch.args[ 0 ][ 0 ]).to.equal(event);
			expect(spyDispatch.args[ 0 ][ 1 ]).to.be.true;
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
			spyCreateMouseEvent = stub(document, 'createEvent').callsFake((eventInterface) => {
				expect(eventInterface).to.equal(triggeredEventType);

				return event;
			});

			triggerEvent(triggerName, element);

			expect(spyDispatch.args[ 0 ][ 0 ]).to.equal(event);
			expect(spyDispatch.args[ 0 ][ 1 ]).to.be.true;
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
			spyCreateMouseEvent = stub(document, 'createEvent').callsFake((eventInterface) => {
				expect(eventInterface).to.equal(triggeredEventType);

				return event;
			});

			triggerEvent(triggerName, element);

			expect(spyDispatch.args[ 0 ][ 0 ]).to.equal(event);
			expect(spyDispatch.args[ 0 ][ 1 ]).to.be.true;
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
			spyCreateMouseEvent = stub(document, 'createEvent').callsFake((eventInterface) => {
				expect(eventInterface).to.equal(triggeredEventType);

				return event;
			});

			triggerEvent(triggerName, element);

			expect(spyDispatch.args[ 0 ][ 0 ]).to.equal(event);
			expect(spyDispatch.args[ 0 ][ 1 ]).to.be.true;
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
			spyCreateMouseEvent = stub(document, 'createEvent').callsFake((eventInterface) => {
				expect(eventInterface).to.equal(triggeredEventType);

				return event;
			});

			triggerEvent(triggerName, element);

			expect(spyDispatch.args[ 0 ][ 0 ]).to.equal(event);
			expect(spyDispatch.args[ 0 ][ 1 ]).to.be.true;
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
			spyCreateMouseEvent = stub(document, 'createEvent').callsFake((eventInterface) => {
				expect(eventInterface).to.equal(triggeredEventType);

				return event;
			});

			triggerEvent(triggerName, element);

			expect(spyDispatch.args[ 0 ][ 0 ]).to.equal(event);
			expect(spyDispatch.args[ 0 ][ 1 ]).to.be.true;
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
			spyCreateMouseEvent = stub(document, 'createEvent').callsFake((eventInterface) => {
				expect(eventInterface).to.equal(triggeredEventType);

				return event;
			});

			triggerEvent(triggerName, element);

			expect(spyDispatch.args[ 0 ][ 0 ]).to.equal(event);
			expect(spyDispatch.args[ 0 ][ 1 ]).to.be.true;
		});

		it('should throw an error on unknown event', () => {
			const triggerName = 'blah';

			expect(triggerEvent.bind(triggerEvent, triggerName, element)).to.throw(Error);
		});
	});
});
