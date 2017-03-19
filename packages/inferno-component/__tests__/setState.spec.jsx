import { expect } from 'chai';
import { render } from 'inferno';
import Component from '../dist-es';

describe('setState', () => {
	let container;

	beforeEach(function () {
		container = document.createElement('div');
	});

	afterEach(function () {
		container.innerHTML = '';
	});

	it('should throw an error when setState is called in constructor', () => {
		class TestComponent extends Component {
			constructor(props, ctx) {
				super(props, ctx);
				this.setState({
					state: 'Something'
				});
			}
		}

		expect(render.bind(render, <TestComponent />, container)).to.throw(Error);
	});

	it('callback should be fired after state has changed', (done) => {

		class TestComponent extends Component {
			constructor(props) {
				super(props);
				this.state = {
					value: props.value
				};
				this.checkSetState = this.checkSetState.bind(this);
			}

			checkSetState() {
				const value = this.state.value;
				expect(value).to.equal('__NEWVALUE__');
				setTimeout(function () {
					done();
				}, 100);
			}

			componentWillReceiveProps(nextProps) {
				this.setState(
					{
						value: nextProps.value
					},
					this.checkSetState
				);
			}

			render() {
				return null;
			}
		}

		class BaseComp extends Component {
			state = {
				value: '__OLDVALUE__'
			};

			componentDidMount() {
				this.setState({
					value: '__NEWVALUE__'
				});
			}

			render() {
				const value = this.state.value;
				return <TestComponent value={value} />;
			}
		}

		render(<BaseComp />, container);
	});

	it('Should not fail if componentDidUpdate is not defined', (done) => {

		class TestComponent extends Component {
			constructor(props) {
				super(props);
				this.state = {
					value: props.value
				};
				this.checkSetState = this.checkSetState.bind(this);
			}

			checkSetState() {
				const value = this.state.value;
				expect(value).to.equal('__NEWVALUE__');
				setTimeout(function () {
					done();
				}, 100);
			}

			componentWillReceiveProps(nextProps) {
				this.setState(
					{
						value: nextProps.value
					},
					this.checkSetState
				);
			}

			render() {
				return null;
			}
		}

		class BaseComp extends Component {
			state = {
				value: '__OLDVALUE__'
			};

			componentDidMount() {
				this.setState({
					value: '__NEWVALUE__'
				});
			}

			render() {
				const value = this.state.value;
				return <TestComponent value={value} />;
			}
		}

		render(<BaseComp />, container);
	});
});
