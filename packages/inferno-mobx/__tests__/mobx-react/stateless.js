import { render } from 'inferno';
import createClass from 'inferno-create-class';
import createElement from 'inferno-create-element';
import { t, mounter } from './_util';
import mobx from 'mobx';
import { observer } from '../../dist-es';

const stateLessComp = ({ testProp }) => <div>result: { testProp }</div>;

// stateLessComp.propTypes = {
// 	testProp: PropTypes.string
// };
stateLessComp.defaultProps = {
	testProp: 'default value for prop testProp'
};

describe('mobx-react-port Stateless', () => {
	let container = null,
		mount = null;

	beforeEach(function () {
		container = document.createElement('div');
		container.style.display = 'none';
		mount = mounter.bind(container);
		document.body.appendChild(container);
	});

	afterEach(function () {
		render(null, container);
		document.body.removeChild(container);
	});

	it('stateless component with propTypes', () => {
		// Inferno has no prop type checking, useless test...
		const StatelessCompObserver = observer(stateLessComp);
		t.equal(StatelessCompObserver.defaultProps.testProp, 'default value for prop testProp', 'default property value should be propagated');
		const originalConsoleError = console.error;
		let beenWarned = false;
		console.error = () => beenWarned = true;
		const wrapper = <StatelessCompObserver testProp={ 10 } />;
		console.error = originalConsoleError;
		t.equal(beenWarned, false, 'an error should be logged with a property type warning');

		render(
			<StatelessCompObserver testProp='hello world' />,
			container,
			function () {
				t.equal(container.textContent, 'result: hello world');
				t.end();
			}
		);
	});

	it('stateless component with context support', (done) => {
		const StateLessCompWithContext = (props, context) => createElement('div', {}, 'context: ' + context.testContext);
		// StateLessCompWithContext.contextTypes = { testContext: PropTypes.string };
		const StateLessCompWithContextObserver = observer(StateLessCompWithContext);
		const ContextProvider = createClass({
			childContextTypes: StateLessCompWithContext.contextTypes,
			getChildContext: () => ({ testContext: 'hello world' }),
			render: () => <StateLessCompWithContextObserver />
		});
		render(<ContextProvider />, container, () => {
			t.equal(container.textContent, 'context: hello world');
			done();
		});
	});

	it('component with observable propTypes', () => {
		const Component = createClass({
			render: () => null,
			propTypes: {
				// a1: propTypes.observableArray,
				// a2: propTypes.arrayOrObservableArray
			}
		});
		const originalConsoleError = console.error;
		// const warnings = [];
		// console.error = msg => warnings.push(msg);
		const firstWrapper = <Component a1={ [] } a2={ [] } />;
		// t.equal(warnings.length, 1);
		const secondWrapper = <Component a1={ mobx.observable([]) } a2={ mobx.observable([]) } />;
		// t.equal(warnings.length, 1);
		// console.error = originalConsoleError;
		// t.end();
	});
});
