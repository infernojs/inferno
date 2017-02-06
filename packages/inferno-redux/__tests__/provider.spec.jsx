import * as Inferno from 'inferno';

import createBrowserHistory from 'history/createBrowserHistory';
import createMemoryHistory from 'history/createMemoryHistory';

import { expect } from 'chai';
import Component from 'inferno-component';
import { createStore } from 'redux';
import { Route, Router, IndexRoute } from 'inferno-router';
import { Provider } from '../dist-es';
import { innerHTML } from 'inferno/test/utils';

const render = Inferno.render;
const browserHistory = (typeof window !== 'undefined') ? createBrowserHistory() : createMemoryHistory();

describe('Provider (JSX)', () => {
	let container;
	let attachedListener = null;
	let renderedName = null;

	beforeEach(function () {
		attachedListener = null;
		renderedName = null;

		container = document.createElement('div');
		container.style.display = 'none';
		document.body.appendChild(container);
	});

	afterEach(function () {
		render(null, container);
		document.body.removeChild(container);
	});

	class BasicRouter extends Component {
		render() {
			return <div>
				{ this.props.children }
			</div>;
		}
	}

	class BasicComponent1 extends Component {
		render() {
			const store = this.context.store;
			const state = store.getState();

			const onClick = (e) => {
				e.preventDefault();
				store.dispatch({
					type: 'CHANGE_NAME',
					name: 'Jerry'
				});
			};

			return (
				<div className="basic">
					<a id="dispatch" onClick={onClick}>
						<span>Hello { state.name || 'Tom' }</span>
					</a>
				</div>
			);
		}
	}

	class BasicComponent2 extends Component {
		render() {
			const store = this.context.store;
			const state = store.getState();

			return (
				<div className="basic2">
					{ state.name === 'Jerry' ? 'You\'re a mouse!' : 'You\'re a cat!' }
				</div>
			);
		}
	}

	it('should enforce a single child', () => {
		const store = createStore(() => ({}));

		expect(() => render(<div>
			<Provider store={store}>
				<div />
			</Provider>
		</div>, container)).to.not.throw(Error);

		expect(() => render(
			<Provider store={store}>
			</Provider>,
		container)).to.throw(Error);

		expect(() => render(
			<Provider store={store}>
				<div />
				<div />
			</Provider>,
		container)).to.throw(Error);
	});

	it('should add the store to the child context', () => {
		/*
		const reducer = (state = { name: 'Tom' }, action) => {
			switch (action.type) {
				default:
					return state;
			}
		};*/
		const store = createStore((state = { name: 'Tom' }, action) => {
			switch (action.type) {
				case 'CHANGE_NAME':
					return Object.assign({}, state, { name: action.name });
				default:
					return state;
			}
		});

		const _render = () => {
			render(
				<Provider store={store}>
					<BasicRouter>
						<BasicComponent1 />
						<BasicComponent2 />
					</BasicRouter>
				</Provider>
			, container);
		};

		_render();
		store.subscribe(() => _render());

		expect(container.innerHTML).to.equal(innerHTML('<div><div class="basic"><a id="dispatch"><span>Hello Tom</span></a></div><div class="basic2">You\'re a cat!</div></div>'));

		const link = container.querySelector('#dispatch');
		link.click();

		expect(container.innerHTML).to.equal(innerHTML('<div><div class="basic"><a id="dispatch"><span>Hello Jerry</span></a></div><div class="basic2">You\'re a mouse!</div></div>'));
	});

	it('should work with routing', () => {
		const store = createStore((state = { name: 'Tom' }, action) => {
			switch (action.type) {
				case 'CHANGE_NAME':
					return Object.assign({}, state, { name: action.name });
				default:
					return state;
			}
		});

		const _render = (url = '/') => {
			render(
				<Provider store={store}>
					<Router url={ url } history={ browserHistory }>
						<Route path="/next" component={ BasicComponent2 } />
						<IndexRoute component={ BasicComponent1 } />
					</Router>
				</Provider>
			, container);
		};

		_render();
		store.subscribe(() => {
			const state = store.getState();
			_render(state.name === 'Tom' ? '/' : '/next');
		});

		expect(container.innerHTML).to.equal(innerHTML('<div class="basic"><a id="dispatch"><span>Hello Tom</span></a></div>'));

		const link = container.querySelector('#dispatch');
		link.click();

		expect(container.innerHTML).to.equal(innerHTML('<div class="basic2">You\'re a mouse!</div>'));
	});

	it('should render the example correctly', () => {
		class App extends Component {
			render({ children }) {
				return <div>
					{ children }
				</div>;
			}
		}

		class BasicComponent1 extends Component {
			render() {
				const store = this.context.store;
				const state = store.getState();

				const onClick = (e) => {
					e.preventDefault();
					store.dispatch({
						type: 'CHANGE_NAME',
						name: 'Jerry'
					});
				};

				return (
					<div className="basic">
						<a id="dispatch" onClick={ onClick }>
							<span>Hello { state.name || 'Tom' }</span>
						</a>
					</div>
				);
			}
		}

		class BasicComponent2 extends Component {
			render() {
				const store = this.context.store;
				const state = store.getState();

				return (
					<div className="basic2">
						{ state.name === 'Jerry' ? 'You\'re a mouse!' : 'You\'re a cat!' }
					</div>
				);
			}
		}

		const store = createStore(() => ({}));

		render((
			<Provider store={ store }>
				<Router history={ browserHistory }>
					<Route component={ App }>
						<Route path="/next" component={ BasicComponent2 } />
						<IndexRoute component={ BasicComponent1 } />
					</Route>
				</Router>
			</Provider>
		), container);
	});
});
