import { expect } from 'chai';
import { render } from '../../DOM/rendering';
import Component from '../../component/es2015';
import createElement from '../../factories/createElement';
import Provider from '../Provider';
import connect from '../connect';
import inject from '../inject';

describe('MobX connect()', () => {

	it('should throw if store is invalid', () => {
		const tryConnect = () => connect('invalidStore', () => 'Test');
		expect(tryConnect).to.throw(Error, /should be provided as array/);
	});

	it('should throw if component is invalid', () => {
		const tryConnect = () => connect(null);
		expect(tryConnect).to.throw(Error, /Please pass a valid component/);
	});

	it('should connect without second argument', () => {
		const tryConnect = () => connect(['invalidStore'])(() => 'Test');
		expect(tryConnect).to.not.throw(Error);
	});

});

describe('MobX inject()', () => {
	let container;

	beforeEach(() => {
		container = document.createElement('div') as HTMLElement;
		container.style.display = 'none';
		document.body.appendChild(container);
	});

	afterEach(() => {
		document.body.removeChild(container);
		render(null, container);
	});

	class TestComponent extends Component<any, any> {
		render({ testStore }) {
			return createElement('span', null, testStore);
		}
	};

	/*it('should inject without second argument', () => {

		class TestComponent extends Component<any, any> {
			static defaultProps = { hello: 'world' };
			render() {
				return 'Test';
			}
		};
		const tryInject = () => inject()(TestComponent);
		console.log(createElement(tryInject));
		//expect(tryInject).to.not.throw(Error);
	});*/

	it('should fail if store is not provided', () => {

		function App() {
			return createElement(Provider, null, createElement(inject('hello')(createElement('span'))));
		}
		expect(() => render(App(), container)).to.throw(Error, /is not available!/);
	});

	it('should inject stores', () => {

		function App() {
			return createElement(Provider, {
				testStore: 'works!'
			}, createElement(inject('testStore')(TestComponent)));
		}

		render(App(), container);
		expect(container.innerHTML).to.equal('<span>works!</span>');
	});

	it('should prefer props over stores', () => {

		function App() {
			return createElement(Provider, {
				testStore: 'hello'
			}, createElement(inject('testStore')(TestComponent), { testStore: 'works!' }));
		}

		render(App(), container);
		expect(container.innerHTML).to.equal('<span>works!</span>');
	});

	it('should create class with injected stores', () => {

		class TestClass extends Component<any, any> {
			static defaultProps = {
				world: 'world'
			};
			render({ hello, world }) {
				return createElement('span', null, hello + ' ' + world);
			}
		};

		function App() {
			return createElement(Provider, {
				hello: 'hello'
			}, createElement(inject('hello')(TestClass)));
		}

		render(App(), container);
		expect(container.innerHTML).to.equal('<span>hello world</span>');
	});

});
