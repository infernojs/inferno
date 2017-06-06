import Component from 'inferno-component';
import { render } from 'inferno';
import createElement from 'inferno-create-element';
import { innerHTML } from 'inferno-utils';
import { connect, inject, Provider } from 'inferno-mobx';

describe('MobX connect()', () => {
	it('should throw if store is invalid', () => {
		const tryConnect = () => connect('invalidStore', () => 'Test');
		expect(tryConnect).toThrowError(Error);
	});

	it('should throw if component is invalid', () => {
		const tryConnect = () => connect(null);
		expect(tryConnect).toThrowError(Error);
	});

	it('should connect without second argument', () => {
		const tryConnect = () => connect(['invalidStore'])(() => 'Test');
		expect(tryConnect).not.toThrowError(Error);
	});
});

describe('MobX inject()', () => {
	let container;

	beforeEach(function() {
		container = document.createElement('div');
		container.style.display = 'none';
		document.body.appendChild(container);
	});

	afterEach(function() {
		render(null, container);
		document.body.removeChild(container);
	});

	class TestComponent extends Component {
		render({ testStore }) {
			return createElement('span', null, testStore);
		}
	}

	/*
	 it('should inject without second argument', () => {

	 class TestComponent extends Component {
	 static defaultProps = { hello: 'world' };
	 render() {
	 return 'Test';
	 }
	 };
	 const tryInject = () => inject()(TestComponent);
	 console.log(createElement(tryInject));
	 //expect(tryInject).to.notThrow()(Error);
	 });*/

	it('should fail if store is not provided', () => {
		function App() {
			return createElement(Provider, null, createElement(inject('hello')(createElement('span'))));
		}

		// eslint-disable-next-line
		expect(() => render(App(), container)).toThrowError(Error);
	});

	it('should inject stores', () => {
		function App() {
			return createElement(
				Provider,
				{
					testStore: 'works!',
				},
				createElement(inject('testStore')(TestComponent)),
			);
		}

		// eslint-disable-next-line
		render(App(), container);
		expect(container.innerHTML).toBe(innerHTML('<span>works!</span>'));
	});

	it('should prefer props over stores', () => {
		function App() {
			return createElement(
				Provider,
				{
					testStore: 'hello',
				},
				createElement(inject('testStore')(TestComponent), { testStore: 'works!' }),
			);
		}

		// eslint-disable-next-line
		render(App(), container);
		expect(container.innerHTML).toBe(innerHTML('<span>works!</span>'));
	});

	it('should create class with injected stores', () => {
		class TestClass extends Component {
			static defaultProps = {
				world: 'world',
			};

			render({ hello, world }) {
				return createElement('span', null, hello + ' ' + world);
			}
		}

		function App() {
			return createElement(
				Provider,
				{
					hello: 'hello',
				},
				createElement(inject('hello')(TestClass)),
			);
		}

		// eslint-disable-next-line
		render(App(), container);
		expect(container.innerHTML).toBe(innerHTML('<span>hello world</span>'));
	});
});
