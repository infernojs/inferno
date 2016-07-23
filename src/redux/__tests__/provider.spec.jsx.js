
import Provider from '../Provider';
import connect from '../connect';

import { findDOMNode, render } from './../../DOM/rendering';
import { createBlueprint } from './../../core/shapes';
import Component from './../../component/es2015';

import { createStore } from 'redux';
const sinon = require('sinon/pkg/sinon');

const Inferno = {
	createBlueprint
};

describe('Provider (JSX)', () => {
	let container;
	let Inner;
	let attachedListener = null;
	let renderedName = null;

	beforeEach(() => {

		attachedListener = null;
		renderedName = null;

		container = document.createElement('div');
		container.style.display = 'none';
		document.body.appendChild(container);
	});

	afterEach(() => {
		document.body.removeChild(container);
		render(null, container);
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

			const onClick = e => {
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
		const store = createStore((state = {
			name: 'Tom'
		}, action) => {
			switch (action.type) {
				case 'CHANGE_NAME':
					return {
						...state,
						name: action.name
					};
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

		expect(container.innerHTML).to.equal('<div><div class="basic"><a id="dispatch"><span>Hello Tom</span></a></div><div class="basic2">You\'re a cat!</div></div>');

		const link = container.querySelector('#dispatch');
		link.click();

		expect(container.innerHTML).to.equal('<div><div class="basic"><a id="dispatch"><span>Hello Jerry</span></a></div><div class="basic2">You\'re a mouse!</div></div>');
	});
});
