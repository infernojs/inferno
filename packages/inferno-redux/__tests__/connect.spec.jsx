
import * as Inferno from 'inferno';
import Component from 'inferno-component';
import { createStore } from 'redux';
import { innerHTML } from 'inferno-utils';
import { connect } from 'inferno-redux';

const render = Inferno.render;

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

class BasicComponent2 extends Component {
	render() {
		return (
			<div>{this.props.a} {this.props.b} {this.props.c}</div>
		);
	}
}

describe('connect', () => {
	let container;

	beforeEach(function () {
		container = document.createElement('div');
		container.style.display = 'none';
		document.body.appendChild(container);
	});

	afterEach(function () {
		render(null, container);
		document.body.removeChild(container);
	});

	it('should return function', () => {
		expect(connect()).to.be.a('function');
	});

	it('should have correct WrappedComponent', () => {
		const connectFunc = connect();
		const ConnectedComponent = connectFunc(BasicComponent);
		expect(ConnectedComponent.WrappedComponent).to.equal(BasicComponent);
	});

	it('should have correct mapStateToProps', () => {
		const store = createStore(() => {
			return { test: 1 };
		});
		const mapStateToProps = (state) => state;
		const ConnectedComponent = connect(mapStateToProps)(BasicComponent);
		render(<ConnectedComponent store={store}/>, container);
		expect(container.innerHTML).to.equal(innerHTML('<div>1</div>'));
	});

	it('should have correct mapDispatchToProps', (done) => {
		const store = createStore((state = { test: 1 }, action) => {
			if (action && action.type === 'TEST_ACTION') {
				return { test: 2 };
			}
			return state;
		});
		const mapDispatchToProps = (dispatch) => {
			return {
				action: () => {
					dispatch({ type: 'TEST_ACTION' });
				}
			};
		};
		const mapStateToProps = (state) => state;
		const ConnectedComponent = connect(mapStateToProps, mapDispatchToProps)(BasicComponent1);
		store.subscribe(() => {
			render(<ConnectedComponent store={store}/>, container);
		});
		store.dispatch({ type: '' });
		expect(container.innerHTML).to.equal(innerHTML('<a>1</a>'));
		container.querySelector('a').click();
		setTimeout(() => {
			expect(container.innerHTML).to.equal(innerHTML('<a>2</a>'));
			done();
		}, 10);
	});

	it('should have correct mapDispatchToProps #2', (done) => {
		const store = createStore((state = { test: 1 }, action) => {
			if (action && action.type === 'TEST_ACTION') {
				return { test: 2 };
			}
			return state;
		});
		const mapDispatchToProps = (dispatch) => {
			return {
				action: () => {
					dispatch({ type: 'TEST_ACTION' });
				}
			};
		};
		const mapStateToProps = (state) => state;
		const ConnectedComponent = connect(mapStateToProps, mapDispatchToProps)(BasicComponent1);
		store.subscribe(() => {
			render(<ConnectedComponent store={store}/>, container);
		});
		store.dispatch({ type: '' });
		expect(container.innerHTML).to.equal(innerHTML('<a>1</a>'));
		container.querySelector('a').click();
		setTimeout(() => {
			expect(container.innerHTML).to.equal(innerHTML('<a>2</a>'));
			done();
		});
	});

	it('should have correct mapDispatchToProps using action creators map', (done) => {
		const store = createStore((state = { test: 1 }, action) => {
			if (action && action.type === 'TEST_ACTION') {
				return { test: 2 };
			}
			return state;
		});
		const mapDispatchToProps = {
			action: () => {
				return { type: 'TEST_ACTION' };
			}
		};
		const mapStateToProps = (state) => state;
		const ConnectedComponent = connect(mapStateToProps, mapDispatchToProps)(BasicComponent1);
		store.subscribe(() => {
			render(<ConnectedComponent store={store}/>, container);
		});
		store.dispatch({ type: '' });
		expect(container.innerHTML).to.equal(innerHTML('<a>1</a>'));
		container.querySelector('a').click();
		setTimeout(() => {
			expect(container.innerHTML).to.equal(innerHTML('<a>2</a>'));
			done();
		}, 10);
	});

	it('should override parentProps with stateProps and stateProps with dispatchProps', () => {
		const store = createStore(state => state);
		const mapDispatchToProps = dispatch => ({
			a: 'dispatch'
		});
		const mapStateToProps = state => ({
			a: 'state',
			b: 'state'
		});
		const ConnectedComponent = connect(mapStateToProps, mapDispatchToProps)(BasicComponent2);
		render(<ConnectedComponent store={store} a="parent" b="parent" c="parent"/>, container);
		expect(container.innerHTML).to.equal(innerHTML('<div>dispatch state parent</div>'));
	});
});
