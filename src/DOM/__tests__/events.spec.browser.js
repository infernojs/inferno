import { render } from './../rendering';

describe('Basic event tests', () => {
	let container;

	beforeEach(() => {
		container = document.createElement('div');
		document.body.appendChild(container);
	});

	afterEach(() => {
		document.body.removeChild(container);
		container.innerHTML = '';
	});

	it('should attach basic click events', (done) => {
		const template = (val) => ({
			tag: 'div',
			attrs: {
				id: 'test'
			},
			events: {
				click: val
			}
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
		divs.forEach(div => div.click());
		expect(calledFirstTest).to.equal(true);

		// reset
		calledFirstTest = false;

		render(template(test2), container);
		divs = Array.prototype.slice.call(container.querySelectorAll('div'));
		divs.forEach(div => div.click());

		expect(calledFirstTest).to.equal(false);
		expect(calledSecondTest).to.equal(true);

		// reset
		calledFirstTest = false;
		calledSecondTest = false;


		render(null, container);
		divs = Array.prototype.slice.call(container.querySelectorAll('div'));
		divs.forEach(div => div.click());

		expect(calledFirstTest).to.equal(false);
		expect(calledSecondTest).to.equal(false);
		done();
	});

	it('should update events', () => {
		var data = {
			count: 0
		};

		function onClick(d) {
			return function (e) {
				data = { count: d.count + 1 };

				renderIt();
			};
		}
		function App(d) {
			return {
				tag: "button",
				events: {
					click: onClick(d)
				},
				children: ['Count ', d.count],
				dom: null
			};
		}

		function renderIt() {
			render(App(data), container);
		}

		renderIt();
		const buttons = Array.prototype.slice.call(container.querySelectorAll('button'));

		expect(container.firstChild.innerHTML).to.equal('Count 0');
		expect(data.count).to.equal(0);
		buttons.forEach(button => button.click());
		expect(container.firstChild.innerHTML).to.equal('Count 1');
		expect(data.count).to.equal(1);
		buttons.forEach(button => button.click());
		expect(container.firstChild.innerHTML).to.equal('Count 2');
		expect(data.count).to.equal(2);
	});

	it('should not leak memory', () => {
		const eventHandler = function(){};

		function AppTwo() {
			return {
				tag: "button",
				children: ['2'],
				dom: null
			};
		}

		function App() {
			return {
				tag: "button",
				events: {
					submit: eventHandler
				},
				children: ['1'],
				dom: null
			};
		}

		render(App(), container);
		expect(container.firstChild.innerHTML).to.equal('1');

		render(App(), container);
		expect(container.firstChild.innerHTML).to.equal('1');

		render(AppTwo(), container);
		expect(container.firstChild.innerHTML).to.equal('2');
	});


	it('should not leak memory when child changes', () => {
		const eventHandler = function(){};

		function smallComponent() {
			return {
				tag: "div",
				events: {
					keyup: eventHandler
				},
				children: '2',
				dom: null
			}
		}

		const childrenArray = [smallComponent(), smallComponent(), smallComponent()];

		function AppTwo() {
			return {
				tag: "p",
				children: ['2'],
				dom: null
			};
		}

		function App(children) {
			return {
				tag: "p",
				events: {
					keydown: eventHandler
				},
				children: children.slice(0), // use slice so we create a new object rather than use the same object or we get oldChildren === newChildren in the diff
				dom: null
			};
		}


		render(App(childrenArray), container);
		expect(container.innerHTML).to.equal('<p><div>2</div><div>2</div><div>2</div></p>');

		childrenArray.pop();
		render(App(childrenArray), container);
		expect(container.innerHTML).to.equal('<p><div>2</div><div>2</div></p>');

		render(AppTwo(), container);
		expect(container.innerHTML).to.equal('<p>2</p>');
	});
});


