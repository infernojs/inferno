import { render } from './../../DOM/rendering';
import createClass from './../createClass';
import createElement from './../../factories/createElement';

describe('Components createClass (non-JSX)', () => {
	let container;

	beforeEach(() => {
		container = document.createElement('div');
		container.style.display = 'none';
		document.body.appendChild(container);
	});

	afterEach(() => {
		document.body.removeChild(container);
		render(null, container);
	});

	const BasicComponent = createClass({
		render() {
			return createElement('div', null, 'Hello world!');
		}
	});

	it('should render a basic component', () => {
		render(createElement(BasicComponent), container);
		expect(container.innerHTML).to.equal('<div>Hello world!</div>');
	});
	it('should render a basic component with lifecycle', () => {
		let componentWillUpdate = false;
		const LifecycleComponent1 = createClass({
			componentWillUpdate() {
				componentWillUpdate = true;
			},
			render() {
				return createElement('div', null, 'Hello world!');
			}
		});

		render(createElement(LifecycleComponent1), container);
		render(createElement(LifecycleComponent1), container);
		expect(componentWillUpdate).to.equal(true);
	});
	it('should render a basic component with methods bound', done => {
		let context;
		let context2;
		const BoundComponent = createClass({
			getInitialState() {
				context = this;
				setTimeout(this.foo, 1);
			},
			foo() {
				context2 = this;
			},
			render() {
				return createElement('div', null, 'Hello world!');
			}
		});

		render(createElement(BoundComponent), container);
		setTimeout(() => {
			expect(context === context2).to.equal(true);
			done();
		}, 2);
	});
	it('should have propTypes on created class', () => {
		const propTypes = {
			value: 'not important'
		};
		const Component = createClass({
			propTypes,
			render() {
				return createElement('div', null, 'Hello world!');
			}
		});

		expect(Component.propTypes).to.equal(propTypes);
	});
	it('should not have propTypes on created class when not specified', () => {
		const Component = createClass({
			render() {
				return createElement('div', null, 'Hello world!');
			}
		});

		expect(Component.propTypes).to.be.undefined;
	});
});
