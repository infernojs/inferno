import { expect } from 'chai';
import connect from '../connect';
import { createStore } from 'redux';
import { innerHTML } from '../../tools/utils';
import Component from 'inferno-component';
import * as Inferno from 'inferno';

const render = Inferno.render;

class BasicComponent extends Component<any, any> {
	props: any;
	state: any;
	render() {
		return (
			<div>{this.props.test}</div>
		);
	}
}

class BasicComponent1 extends Component<any, any> {
	props: any;
	state: any;
	handleClick() {
		this.props.action();
	}
	render() {
		return (
			<a onClick={this.handleClick.bind(this)}>{this.props.test}</a>
		);
	}
}

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
		const mapStateToProps = state => state;
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
		const mapDispatchToProps = dispatch => {
			return {
				action: () => {
					dispatch({ type: 'TEST_ACTION' });
				}
			};
		};
		const mapStateToProps = state => state;
		const ConnectedComponent = connect(mapStateToProps, mapDispatchToProps)(BasicComponent1);
		store.subscribe(() => {
			render(<ConnectedComponent store={store}/>, container);
		});
		store.dispatch({ type: '' } as any);
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
		const mapDispatchToProps = dispatch => {
			return {
				action: () => {
					dispatch({ type: 'TEST_ACTION' });
				}
			};
		};
		const mapStateToProps = state => state;
		const ConnectedComponent = connect(mapStateToProps, mapDispatchToProps)(BasicComponent1);
		store.subscribe(() => {
			render(<ConnectedComponent store={store}/>, container);
		});
		store.dispatch({ type: '' } as any);
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
		const mapStateToProps = state => state;
		const ConnectedComponent = connect(mapStateToProps, mapDispatchToProps)(BasicComponent1);
		store.subscribe(() => {
			render(<ConnectedComponent store={store}/>, container);
		});
		store.dispatch({ type: '' } as any);
		expect(container.innerHTML).to.equal(innerHTML('<a>1</a>'));
		container.querySelector('a').click();
		setTimeout(() => {
			expect(container.innerHTML).to.equal(innerHTML('<a>2</a>'));
			done();
		}, 10);
	});
});
