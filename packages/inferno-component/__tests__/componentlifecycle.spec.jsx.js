import { expect } from 'chai';
import { render } from 'inferno';
import { innerHTML } from 'inferno/test/utils';
import Component from '../dist-es';

describe('Component lifecycle', () => {
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

	it('componentWillUpdate Should have nextProp in params and old variants in instance', () => {
		let callCount = 0;
		class Com extends Component {
			componentWillUpdate(nextProps, nextState) {
				callCount++;
				expect(this.props.value).to.equal(1);
				expect(nextProps.value).to.equal(2);
			}

			render() {
				return (
					<div>{this.props.value}</div>
				);
			}
		}

		render(<Com value={1}/>, container);

		expect(innerHTML(container.innerHTML)).to.equal(innerHTML('<div>1</div>'));

		render(<Com value={2}/>, container);

		expect(callCount).to.equal(1);
		expect(innerHTML(container.innerHTML)).to.equal(innerHTML('<div>2</div>'));
	});

	it('shouldComponentUpdate Should have nextProp in params and old variants in instance', () => {
		let callCount = 0;
		class Com extends Component {
			shouldComponentUpdate(nextProps, nextState) {
				callCount++;
				expect(this.props.value).to.equal(1);
				expect(nextProps.value).to.equal(2);

				return true;
			}

			render() {
				return (
					<div>{this.props.value}</div>
				);
			}
		}

		render(<Com value={1}/>, container);

		expect(innerHTML(container.innerHTML)).to.equal(innerHTML('<div>1</div>'));

		render(<Com value={2}/>, container);

		expect(callCount).to.equal(1);
		expect(innerHTML(container.innerHTML)).to.equal(innerHTML('<div>2</div>'));
	});

	it('Should not fail if componentDidUpdate is undefined #922', () => {
		let callCount = 0;
		let c = null;

		class Com extends Component {
			componentDidUpdate(nextProps, nextState) {
				callCount++;
				expect(this.props.value).to.equal(1);
				expect(nextProps.value).to.equal(2);

				return true;
			}

			render() {
				return (
					<div>{this.props.value}</div>
				);
			}
		}

		// eslint-disable-next-line no-return-assign
		render(<Com ref={(inst) => c = inst} value={1}/>, container);

		c.componentDidUpdate = undefined;

		// eslint-disable-next-line no-return-assign
		render(<Com ref={(inst) => c = inst} value={2}/>, container);
	});
});
