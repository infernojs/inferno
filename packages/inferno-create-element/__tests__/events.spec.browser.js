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
		const eventHandler = function () {};

		function App({ toggle }) {
			return createElement('button', {
				onsubmit: toggle ? eventHandler : null
			}, ['1']);
		}

		// eslint-disable-next-line
		render(App({ toggle: true }), container);
		expect(container.firstChild.innerHTML).to.equal('1');

		// eslint-disable-next-line
		render(App({ toggle: false }), container);
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
});
