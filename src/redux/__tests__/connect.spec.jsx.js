import connect from '../connect';
import {createStore} from 'redux';
import Component from './../../component/es2015';
import {render} from './../../DOM/rendering';
import {
	createStaticVElement,
	createOptBlueprint,
	createVComponent,
	createOptVElement
} from './../../core/shapes';
import {
	ChildrenTypes,
	ValueTypes,
	NodeTypes
} from './../../core/constants';

const Inferno = {
	createOptVElement,
	createStaticVElement,
	createOptBlueprint,
	createVComponent,
	ChildrenTypes,
	ValueTypes,
	NodeTypes
};
const sinon = require('sinon/pkg/sinon');

describe('connect', () => {
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

	class BasicComponent extends Component {
		render() {
			return (
				<div>{this.props.test}</div>
			);
		}
	}

	class BasicComponent1 extends Component {
		handleClick() {
			this.props.action();
		}
		render() {
			return (
				<a onClick={this.handleClick.bind(this)}>{this.props.test}</a>
			);
		}
	}

	it('should return function', ()=> {
		expect(connect()).to.be.a('function');
	});

	it('should have correct WrappedComponent', () => {
		expect(connect()(BasicComponent).WrappedComponent).to.equal(BasicComponent);
	});

	it('should have correct mapStateToProps', () => {
		const store = createStore(() => {
			return {test: 1};
		});
		const mapStateToProps = state => state;
		const ConnectedComponent = connect(mapStateToProps)(BasicComponent);
		render(<ConnectedComponent store={store}/>, container);
		expect(container.innerHTML).to.equal('<div>1</div>');
	});

	it('should have correct mapDispatchToProps', () => {
		const store = createStore((state = {test:1}, action) => {
			if (action && action.type === 'TEST_ACTION') {
				return {test: 2};
			}
			return state;
		});
		const mapDispatchToProps = dispatch => {
			return {action: () => {
				dispatch({type: 'TEST_ACTION'});
			}}
		};
		const mapStateToProps = state => state;
		const ConnectedComponent = connect(mapStateToProps, mapDispatchToProps)(BasicComponent1);
		store.subscribe(() => {
			render(<ConnectedComponent store={store}/>, container);
		});
		store.dispatch({type:''});
		expect(container.innerHTML).to.equal('<a>1</a>');
		container.querySelector('a').click();
		expect(container.innerHTML).to.equal('<a>2</a>');
	});
});
