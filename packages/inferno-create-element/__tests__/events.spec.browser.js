import { expect } from 'chai';
import { render } from 'inferno';
import createElement from '../dist-es';

describe('Basic event tests', () => {
	let container;

	beforeEach(function () {
		container = document.createElement('div');
		document.body.appendChild(container);
	});

	afterEach(function () {
		render(null, container);
		container.innerHTML = '';
		document.body.removeChild(container);
	});

	it('should attach basic click events', (done) => {
		const template = (val) => createElement('div', {
			id: 'test',
			onclick: val
		});

		let calledFirstTest = false;

		function test() {
			calledFirstTest = true;
		}

		// different event
		let calledSecondTest = false;

		function test2() {
			calledSecondTest = true;
		}

		render(template(test), container);

		let divs = Array.prototype.slice.call(container.querySelectorAll('div'));
		divs.forEach((div) => div.click());
		expect(calledFirstTest).to.equal(true);

		// reset
		calledFirstTest = false;

		render(template(test2), container);
		divs = Array.prototype.slice.call(container.querySelectorAll('div'));
		divs.forEach((div) => div.click());

		expect(calledFirstTest).to.equal(false);
		expect(calledSecondTest).to.equal(true);

		// reset
		calledFirstTest = false;
		calledSecondTest = false;

		render(null, container);
		divs = Array.prototype.slice.call(container.querySelectorAll('div'));
		divs.forEach((div) => div.click());

		expect(calledFirstTest).to.equal(false);
		expect(calledSecondTest).to.equal(false);
		done();
	});

	it('should update events', () => {
		let data = {
			count: 0
		};

		function onClick(d) {
			return function (e) {
				data = { count: d.count + 1 };

				renderIt();
			};
		}

		function App(d) {
			return createElement('button', {
				onclick: onClick(d)
			}, 'Count ', d.count);
		}

		function renderIt() {
			// eslint-disable-next-line
			render(App(data), container);
		}

		renderIt();
		const buttons = Array.prototype.slice.call(container.querySelectorAll('button'));

		expect(container.firstChild.innerHTML).to.equal('Count 0');
		expect(data.count).to.equal(0);
		buttons.forEach((button) => button.click());
		expect(container.firstChild.innerHTML).to.equal('Count 1');
		expect(data.count).to.equal(1);
		buttons.forEach((button) => button.click());
		expect(container.firstChild.innerHTML).to.equal('Count 2');
		expect(data.count).to.equal(2);
	});

	it('should not trigger click at all if target is disabled', () => {
		let data = {
			count: 0
		};

		function onClick(d) {
			return function (e) {
				data = { count: d.count + 1 };

				renderIt();
			};
		}

		function App(d) {
			return createElement('button', {
				disabled: 'disabled',
				onClick: onClick(d)
			}, createElement('span', null, 'Count ', d.count));
		}

		function renderIt() {
			// eslint-disable-next-line
			render(App(data), container);
		}

		renderIt();
		const buttons = Array.prototype.slice.call(container.querySelectorAll('span'));

		expect(container.firstChild.innerHTML).to.equal('<span>Count 0</span>');
		expect(data.count).to.equal(0);
		buttons.forEach((button) => button.click());
		expect(container.firstChild.innerHTML).to.equal('<span>Count 0</span>');
	});

	it('should not leak memory', () => {
		const eventHandler = function () {
		};

		function AppTwo() {
			return createElement('button', null, [2]);
		}

		function App() {
			return createElement('button', {
				onsubmit: eventHandler
			}, ['1']);
		}

		// eslint-disable-next-line
		render(App(), container);
		expect(container.firstChild.innerHTML).to.equal('1');

		// eslint-disable-next-line
		render(App(), container);
		expect(container.firstChild.innerHTML).to.equal('1');

		// eslint-disable-next-line
		render(AppTwo(), container);
		expect(container.firstChild.innerHTML).to.equal('2');
	});

	it('should not leak memory #2', () => {
		const eventHandler = function () {
		};

		function App({ toggle }) {
			return createElement('button', {
				onsubmit: toggle ? eventHandler : null
			}, ['1']);
		}

		// eslint-disable-next-line
		render(App({toggle: true}), container);
		expect(container.firstChild.innerHTML).to.equal('1');

		// eslint-disable-next-line
		render(App({toggle: false}), container);
		expect(container.firstChild.innerHTML).to.equal('1');
	});

	it('should not leak memory when child changes', () => {
		const eventHandler = function () {
		};

		function smallComponent() {
			return createElement('div', {
				onkeyup: eventHandler
			}, '2');
		}

		const childrenArray = [ smallComponent(), smallComponent(), smallComponent() ];

		function AppTwo() {
			return createElement('p', null, ['2']);
		}

		function App(children) {
			return createElement('p', {
				onkeydown: eventHandler
			}, children.slice(0));
		}

		// eslint-disable-next-line
		render(App(childrenArray), container);
		expect(container.innerHTML).to.equal('<p><div>2</div><div>2</div><div>2</div></p>');

		childrenArray.pop();
		// eslint-disable-next-line
		render(App(childrenArray), container);
		expect(container.innerHTML).to.equal('<p><div>2</div><div>2</div></p>');

		// eslint-disable-next-line
		render(AppTwo(), container);
		expect(container.innerHTML).to.equal('<p>2</p>');
	});

	describe('Event Propagation', () => {
		it('Should stop propagating Synthetic event to document', (done) => {
			let eventHandlerSpy = sinon.spy();
			const eventHandler = function (event) {
				eventHandlerSpy();
				event.stopPropagation();
			};

			function SmallComponent() {
				return createElement('div', {
					onClick: eventHandler,
					id: 'tester'
				}, '2');
			}

			render(<SmallComponent />, container);

			const bodySpy = sinon.spy();
			document.addEventListener('click', bodySpy);

			container.querySelector('#tester').click();
			setTimeout(function () {
				expect(eventHandlerSpy.callCount).to.equal(1);
				expect(bodySpy.callCount).to.equal(0);
				document.removeEventListener('click', bodySpy);
				done();
			}, 20);
		});


		it('Should stop propagating Synthetic event to parentElement with synthetic event', (done) => {
			let eventHandlerSpy = sinon.spy();
			const eventHandler = function (event) {
				eventHandlerSpy();
				event.stopPropagation();
			};

			let eventHandlerSpy2 = sinon.spy();
			const eventHandler2 = function (event) {
				eventHandlerSpy2();
			};

			function SmallComponent() {
				return createElement('div', {
					onClick: eventHandler2,
					id: 'parent'
				}, createElement('div', {
					onClick: eventHandler,
					id: 'tester'
				}, '2'));
			}

			render(<SmallComponent />, container);

			container.querySelector('#tester').click();
			setTimeout(function () {
				expect(eventHandlerSpy.callCount).to.equal(1);
				expect(eventHandlerSpy2.callCount).to.equal(0);
				done();
			}, 20);
		});

		// React does not block propagating synthetic event to parent with normal event either.
		it('Should NOT stop propagating Synthetic event to parentElement with normal event', (done) => {
			let eventHandlerSpy = sinon.spy();
			const eventHandler = function (event) {
				eventHandlerSpy();
				event.stopPropagation();
			};

			let eventHandlerSpy2 = sinon.spy();
			const eventHandler2 = function (event) {
				eventHandlerSpy2();
			};


			function SmallComponent() {
				return createElement('div', {
					onclick: eventHandler2,
					id: 'parent'
				}, createElement('div', {
					onClick: eventHandler,
					id: 'tester'
				}, '2'));
			}

			render(<SmallComponent />, container);

			container.querySelector('#tester').click();
			setTimeout(function () {
				expect(eventHandlerSpy.callCount).to.equal(1);
				expect(eventHandlerSpy2.callCount).to.equal(1);
				done();
			}, 20);
		});

		// https://github.com/infernojs/inferno/issues/979
		it('Should trigger child elements synthetic event even if parent Element has null listener', () => {
			const spy1 = sinon.spy();
			const spy2 = sinon.spy();

			function FooBarCom({ test }) {
				return (
					<div onClick={test !== '1' ? null : spy1}>
						<div onClick={null}>
							<span onClick={spy2}>test</span>
						</div>
					</div>
				);
			}

			render(<FooBarCom test="1" />, container);
			container.querySelector('span').click();
			expect(spy2.callCount).to.equal(1);
			expect(spy1.callCount).to.equal(1);

			render(<FooBarCom test="2" />, container);
			container.querySelector('span').click();
			expect(spy2.callCount).to.equal(2);
			expect(spy1.callCount).to.equal(1);

			render(<FooBarCom test="3" />, container);
			container.querySelector('span').click();
			expect(spy2.callCount).to.equal(3);
			expect(spy1.callCount).to.equal(1);
		});

		it('Should stop propagating normal event to document', (done) => {
			let eventHandlerSpy = sinon.spy();
			const eventHandler = function (event) {
				eventHandlerSpy();
				event.stopPropagation();
			};


			function SmallComponent() {
				return createElement('div', {
					onclick: eventHandler,
					id: 'tester'
				}, '2');
			}

			render(<SmallComponent />, container);
			const bodySpy = sinon.spy();
			document.addEventListener('click', bodySpy);

			container.querySelector('#tester').click();
			setTimeout(function () {
				expect(eventHandlerSpy.callCount).to.equal(1);
				expect(bodySpy.callCount).to.equal(0);
				document.removeEventListener('click', bodySpy);
				done();
			}, 20);
		});

		it('Should stop propagating normal event to parentElement with synthetic event', (done) => {
			let eventHandlerSpy = sinon.spy();
			const eventHandler = function (event) {
				eventHandlerSpy();
				event.stopPropagation();
			};

			let eventHandlerSpy2 = sinon.spy();
			const eventHandler2 = function (event) {
				eventHandlerSpy2();
			};


			function SmallComponent() {
				return createElement('div', {
					onClick: eventHandler2,
					id: 'parent'
				}, createElement('div', {
					onclick: eventHandler,
					id: 'tester'
				}, '2'));
			}

			render(<SmallComponent />, container);

			container.querySelector('#tester').click();
			setTimeout(function () {
				expect(eventHandlerSpy.callCount).to.equal(1);
				expect(eventHandlerSpy2.callCount).to.equal(0);
				done();
			}, 20);
		});

		it('Should stop propagating normal event to normal event', (done) => {
			let eventHandlerSpy = sinon.spy();
			const eventHandler = function (event) {
				eventHandlerSpy();
				event.stopPropagation();
			};

			let eventHandlerSpy2 = sinon.spy();
			const eventHandler2 = function (event) {
				eventHandlerSpy2();
			};


			function SmallComponent() {
				return createElement('div', {
					onclick: eventHandler2,
					id: 'parent'
				}, createElement('div', {
					onclick: eventHandler,
					id: 'tester'
				}, '2'));
			}

			render(<SmallComponent />, container);

			container.querySelector('#tester').click();
			setTimeout(function () {
				expect(eventHandlerSpy.callCount).to.equal(1);
				expect(eventHandlerSpy2.callCount).to.equal(0);
				done();
			}, 20);
		});
	});

	it('Should work with spread attributes', (done) => {

		function SmallComponent(props) {

			return (
				<div id="testClick" {...props}>
					FooBar
				</div>
			);
		}

		const obj = {
			test: function () {
				done();
			}
		};

		render(<SmallComponent className="testing" onClick={obj.test} />, container);

		container.querySelector('#testClick').click();
	});
});
