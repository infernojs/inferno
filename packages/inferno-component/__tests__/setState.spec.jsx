import { expect } from 'chai';
import Inferno, { render } from 'inferno';
import Component from '../dist-es';

describe('setState', () => {
	let container;

	beforeEach(function () {
		container = document.createElement('div');
		document.body.appendChild(container);
	});

	afterEach(function () {
		container.innerHTML = '';
		render(null, container);
		document.body.removeChild(container);
	});

	it('callback should be fired after state has changed', () => {

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
