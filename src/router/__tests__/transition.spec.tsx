import { expect } from 'chai';
import { render } from './../../DOM/rendering';
import Component from '../../component/es2015';
import Router from '../Router';
import Route from '../Route';
import createMemoryHistory from 'history/createMemoryHistory';
import * as Inferno from '../../testUtils/inferno';
Inferno; // suppress ts 'never used' error

const browserHistory = createMemoryHistory();

describe('Transition tests (jsx)', () => {
	let container;

	beforeEach(() => {
		browserHistory.push('/');
		container = document.createElement('div');
	});

	afterEach(() => {
		render(null, container);
		container.innerHTML = '';
	});

	it('should fail when `history` is not provided', () => {
		expect(() => render(<Router/>, container)).to.throw(TypeError);
	});

	// Unfinished test
	it('should have routeTo() method', () => {
		expect(Router.prototype.routeTo).to.not.be.undefined;
	});

	// Fails if onEnter is on componentWillMount instead of componentDidMount
	it('should use onEnter hook', () => {

		const TestHooksEnter = () => <div>...</div>;

		//noinspection JSUnusedLocalSymbols
		function onEnter({ props, router }) {
			router.push('/enter');
			expect(typeof props).to.equal('object');
			expect(typeof router).to.equal('object');
			expect(container.innerHTML).to.equal('<div>onLeave</div>');
		}

		render(<Router history={ browserHistory }>
			<Route path='/' onEnter={ onEnter } component={ TestHooksEnter }/>
			<Route path='/enter' component={ () => <div>onLeave</div> } />
		</Router>, container);
	});

	it.skip('should use onLeave hook', () => {

		class TestHooksLeave extends Component<any, any> {
			componentWillMount() {
				this.context.router.push('/leave');
			}
			render() {
				return <div>...</div>;
			}
		}

		//noinspection JSUnusedLocalSymbols
		function onLeave({ props, router }) {
			expect(typeof props).to.equal('object');
			expect(typeof router).to.equal('object');
			expect(container.innerHTML).to.equal('<div>onLeave</div>');
		}

		render(<Router history={ browserHistory }>
			<Route path='/' onLeave={ onLeave } component={ TestHooksLeave }/>
			<Route path='/leave' component={ () => <div>onLeave</div> } />
		</Router>, container);
	});


	it('should route correctly using context router object', () => {

		class TestRouting extends Component<any, any> {
			componentDidMount() {
				this.context.router.push('/final');
			}
			render() {
				return <div>...</div>;
			}
		}

		render(<Router history={ browserHistory }>
			<Route path='/' component={ TestRouting }/>
			<Route path='/final' component={ () => <div>Done</div> } />
		</Router>, container);

		expect(container.innerHTML).to.equal('<div>Done</div>');
	});

	it('should not use empty hooks', () => {

		class TestHooksLeave extends Component<any, any> {
			render() {
				return <div>...</div>;
			}
		}

		render(<Router history={ browserHistory }>
			<Route path='/' onEnter={ null } onLeave={ null } component={ TestHooksLeave }/>
		</Router>, container);
	});
});
