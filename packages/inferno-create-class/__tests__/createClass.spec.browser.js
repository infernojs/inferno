
import { render } from 'inferno';
import createElement from 'inferno-create-element';
import { innerHTML } from 'inferno-utils';
import createClass from 'inferno-create-class';

describe('Components createClass (non-JSX)', () => {
	let container;

	beforeEach(function () {
		container = document.createElement('div');
		container.style.display = 'none';
		document.body.appendChild(container);
	});

	afterEach(function () {
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
		expect(container.innerHTML).to.equal(innerHTML('<div>Hello world!</div>'));
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

		render(createElement(LifecycleComponent1, {}), container);
		render(createElement(LifecycleComponent1, {}), container);
		expect(componentWillUpdate).to.equal(true);
	});

	it('should have context available in getInitialState', (done) => {
		let context;
		let context2;
		const BoundComponent = createClass({
			getInitialState() {
				expect(this.context);
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
			value() {
			}
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
	it('should have mixins on created class', () => {
		const mixins = [{
			func1: () => true
		}];
		const Component = createClass({
			mixins,
			render() {
				return createElement('div', null, 'Hello world!');
			}
		});
		render(createElement(Component, {}), container);
		expect(Component.mixins).to.have.property('func1');
	});
	it('should have nested mixins on created class', () => {
		const mixins = [{
			mixins: [{
				mixins: [{
					nestedMixin: () => true
				}]
			}]
		}];
		const Component = createClass({
			mixins,
			render() {
				return createElement('div', null, 'Hello world!');
			}
		});
		render(createElement(Component, {}), container);
		expect(Component.mixins).to.have.property('nestedMixin');
	});
});
