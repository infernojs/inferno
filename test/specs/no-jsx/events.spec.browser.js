import Inferno from '../../../src';

describe('.events()', () => {

	let container = document.createElement('div');;

	beforeEach(() => {
		document.body.appendChild(container);
	});

	afterEach(() => {
		document.body.removeChild(container);
	});

	it('should render element with click event listener added', () => {

		let worked = false;
		const template = Inferno.createTemplate((handler) => ({
			tag: 'div',
			attrs: {
				onClick: handler
			},
			children: 'Hello world!'
		}));
		Inferno.render(template(() => {
			worked = true;
		}), container);
		const event = new Event('click', {
			bubbles: true,
			cancelable: true
		});

		container.firstChild.dispatchEvent(event);
		expect(worked).to.equal(true);
		expect(container.innerHTML).to.equal('<div>Hello world!</div>');
	});

	it('should listen to a click event on a textarea, and return its value', () => {
		let worked;
		const template = Inferno.createTemplate((handler) => ({
			tag: 'textarea',
			attrs: {
				onClick: handler
			},
			children: 'Hello world!'
		}));
		Inferno.render(template((e, value) => {
			worked = value;
			e.stopPropagation();
		}), container);
		const event = new Event('click', {
			bubbles: true,
			cancelable: true
		});

		container.firstChild.dispatchEvent(event);
		expect(worked).to.equal('Hello world!');
		expect(container.innerHTML).to.equal('<textarea>Hello world!</textarea>');
	});

	it('should listen to a click event on a checkbox, and return its true value', () => {

		let worked, val, event;
		const template = Inferno.createTemplate((handler) => ({
			tag: 'input',
			attrs: {
				type: "checkbox",
				checked: "checked",
				onClick: handler
			},
			children: 'Hello world!'
		}));

		Inferno.render(template((e, value) => {
			worked = value;
			val = e.currentTarget.getElementsByTagName("input")[0].getAttribute("checked");
			e.stopPropagation();
		}), container);
		event = new Event('click', {
			bubbles: true,
			cancelable: true
		});

		container.firstChild.dispatchEvent(event);
		expect(worked).to.equal(true);
		expect(val).to.equal('checked');
		expect(container.innerHTML).to.equal('<input type="checkbox" checked="checked"></input>');

		Inferno.render(template((e, value) => {
			worked = value;
			val = e.currentTarget.getElementsByTagName("input")[0].getAttribute("checked");
			e.stopPropagation();
		}), container);
		event = new Event('click', {
			bubbles: true,
			cancelable: true
		});

		container.firstChild.dispatchEvent(event);
		expect(worked).to.equal(true);
		expect(val).to.equal('checked');
		expect(container.innerHTML).to.equal('<input type="checkbox" checked="checked"></input>');

		Inferno.render(template((e, value) => {
			worked = value;
			val = e.currentTarget.getElementsByTagName("input")[0].getAttribute("checked");
			e.stopPropagation();
		}), container);

		event = new Event('click', {
			bubbles: true,
			cancelable: true
		});

		container.firstChild.dispatchEvent(event);
		expect(worked).to.equal(true);
		expect(val).to.equal('checked');
		expect(container.innerHTML).to.equal('<input type="checkbox" checked="checked"></input>');
	});


	it('should listen to a click event on a checkbox, and return its true value', () => {

		let worked, val;
		const template = Inferno.createTemplate((handler) => ({
			tag: 'input',
			attrs: {
				type: "checkbox",
				checked: "checked",
				onClick: handler
			},
			children: 'Hello world!'
		}));
		Inferno.render(template((e, value) => {
			worked = value;
			val = e.currentTarget.getElementsByTagName("input")[0].getAttribute("checked");
			e.stopPropagation();
		}), container);
		const event = new Event('click', {
			bubbles: true,
			cancelable: true
		});

		container.firstChild.dispatchEvent(event);
		expect(worked).to.equal(true);
		expect(val).to.equal('checked');
		expect(container.innerHTML).to.equal('<input type="checkbox" checked="checked"></input>');
	});

	it('should listen to a click event on a radio button, and return its true value', () => {
		let worked, val, event;
		const template = Inferno.createTemplate((handler) => ({
			tag: 'input',
			attrs: {
				type: "radio",
				checked: "checked",
				onClick: handler
			},
			children: 'Hello world!'
		}));

		Inferno.render(template((e, value) => {
			worked = value;
			val = e.currentTarget.getElementsByTagName("input")[0].getAttribute("checked");
			e.stopPropagation();
		}), container);
		event = new Event('click', {
			bubbles: true,
			cancelable: true
		});

		container.firstChild.dispatchEvent(event);
		expect(worked).to.equal(true);
		expect(val).to.equal('checked');
		expect(container.innerHTML).to.equal('<input type="radio" checked="checked"></input>');

		Inferno.render(template((e, value) => {
			worked = value;
			val = e.currentTarget.getElementsByTagName("input")[0].getAttribute("checked");
			e.stopPropagation();
		}), container);
		event = new Event('click', {
			bubbles: true,
			cancelable: true
		});

		container.firstChild.dispatchEvent(event);
		expect(worked).to.equal(true);
		expect(val).to.equal('checked');
		expect(container.innerHTML).to.equal('<input type="radio" checked="checked"></input>');


		Inferno.render(template((e, value) => {
			worked = value;
			val = e.currentTarget.getElementsByTagName("input")[0].getAttribute("checked");
			e.stopPropagation();
		}), container);
		event = new Event('click', {
			bubbles: true,
			cancelable: true
		});

		container.firstChild.dispatchEvent(event);
		expect(worked).to.equal(true);
		expect(val).to.equal('checked');
		expect(container.innerHTML).to.equal('<input type="radio" checked="checked"></input>');
	});

	it('should listen to a click event on a select, and return its value', () => {

		let worked;
		const template = Inferno.createTemplate((handler) => ({
			tag: 'select',
			attrs: {
				value: 'bar',
				onClick: handler
			},
			children: [

				{
					tag: 'option',
					attrs: {
						value: "foo"
					},
					text: 'foo'
				}, {
					tag: 'option',
					attrs: {
						value: "bar"
					},
					text: 'bar'
				}
			]
		}));
		Inferno.render(template((e, value) => {
			worked = value;
			e.stopPropagation();
		}), container);
		const event = new Event('click', {
			bubbles: true,
			cancelable: true
		});

		container.firstChild.dispatchEvent(event);
		expect(worked).to.equal('foo');
		expect(container.innerHTML).to.equal('<select><option value="foo">foo</option><option value="bar">bar</option></select>');
	});

	it('should listen to a click event on a multiple select, and return its value', () => {

		let worked;
		const template = Inferno.createTemplate((handler) => ({
			tag: 'select',
			attrs: {
				multiple: true,
				value: "bar",
				onClick: handler
			},
			children: [

				{
					tag: 'option',
					attrs: {
						value: "foo"
					},
					text: 'foo'
				}, {
					tag: 'option',
					attrs: {
						value: "bar"
					},
					text: 'bar'
				}
			]
		}));
		Inferno.render(template((e, value) => {
			worked = value;
			e.stopPropagation();
		}), container);
		const event = new Event('click', {
			bubbles: true,
			cancelable: true
		});

		container.firstChild.dispatchEvent(event);
		//            expect(worked).to.equal([]); // Need a fix
		expect(container.innerHTML).to.equal('<select multiple="multiple"><option value="foo">foo</option><option value="bar">bar</option></select>');
	});

	["b", "command", "input", "select", "textarea", "button"].forEach(function(tag) {

		it('should add listener on a ' + tag + ' node', () => {

			const template = Inferno.createTemplate((handler) => ({
				tag: tag,
				attrs: {
					onMouseMove: handler
				}
			}));

			Inferno.render(template((e) => {
				e.stopPropagation();
			}), container);
			const event = new Event(tag, {
				bubbles: true,
				cancelable: true
			});

			container.firstChild.dispatchEvent(event);
			expect(container.firstChild.tagName.toLowerCase()).to.equal(tag);
		});
	});
});
