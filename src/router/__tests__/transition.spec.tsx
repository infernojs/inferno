import { expect } from 'chai';
import Inferno, { render } from 'inferno';
import Component from '../../component/es2015';
import { innerHTML } from '../../tools/utils';
import Router from '../Router';
import Route from '../Route';
import IndexRoute from '../IndexRoute';
import Link from '../Link';
import createMemoryHistory from 'history/createMemoryHistory';
Inferno; // suppress ts 'never used' error

const browserHistory = createMemoryHistory();

function GoodComponent(props) {
	return <div>Good Component{props.clone}</div>;
}

function BadComponent(props) {
	return <div>Bad Component{props.clone}</div>;
}

describe('Router (jsx) #transitions', () => {
	let container;

	beforeEach(() => {
		browserHistory.push('/');
		container = document.createElement('div');
		document.body.appendChild(container);
	});

	afterEach(() => {
		document.body.removeChild(container);
		render(null, container);
	});

	it('should fail when `history` is not provided', () => {
		expect(() => render(<Router/>, container)).to.throw(TypeError);
	});

	// Unfinished test
	it('should have routeTo() method', () => {
		expect(Router.prototype.routeTo).to.not.be.undefined;
	});

	it('should use onEnter hook', (done) => {

		const TestHooksEnter = () => <div>...</div>;

		// noinspection JSUnusedLocalSymbols
		function onEnter({ props, router }) {
			router.push('/enter');
			expect(typeof props).to.equal('object');
			expect(typeof router).to.equal('object');
			requestAnimationFrame(() => {
				expect(container.innerHTML).to.equal(innerHTML('<div>onLeave</div>'));
				done();
			});
		}

		render(<Router history={ browserHistory }>
			<Route path='/' onEnter={ onEnter } component={ TestHooksEnter }/>
			<Route path='/enter' component={ () => <div>onLeave</div> } />
		</Router>, container);
	});

	it('IndexRoute should use onLeave hook', (done) => {

		class TestHooksLeave extends Component<any, any> {
			componentDidMount() {
				this.context.router.push('/leave');
			}
			render() {
				return <div>...</div>;
			}
		}

		const onLeave = ({ props, router }) => {
			expect(typeof props).to.equal('object');
			expect(typeof router).to.equal('object');
			requestAnimationFrame(() => {
				expect(container.innerHTML).to.equal(innerHTML('<div>onLeave</div>'));
				done();
			});
		};

		render(<Router history={ browserHistory }>
			<IndexRoute onLeave={ onLeave } component={ TestHooksLeave }/>
			<Route path='/leave' component={ () => <div>onLeave</div> } />
		</Router>, container);
	});

	it('Route should use onLeave hook', (done) => {

		class TestHooksLeave extends Component<any, any> {
			componentDidMount() {
				this.context.router.push('/leave');
			}
			render() {
				return <div>...</div>;
			}
		}

		const onLeave = ({ props, router }) => {
			expect(typeof props).to.equal('object');
			expect(typeof router).to.equal('object');
			requestAnimationFrame(() => {
				expect(container.innerHTML).to.equal(innerHTML('<div>onLeave</div>'));
				done();
			});
		};

		render(<Router history={ browserHistory }>
			<Route path='/' onLeave={ onLeave } component={ TestHooksLeave }/>
			<Route path='/leave' component={ () => <div>onLeave</div> } />
		</Router>, container);
	});

	it('should route correctly using context router object', (done) => {

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

		setTimeout(() => {
			expect(container.innerHTML).to.equal(innerHTML('<div>Done</div>'));
			done();
		}, 10);
	});

	it('should use the correct child when transitioning', (done) => {
		const Layout = ({ children }) => (<div>
				<Link to={ '/foo/two' }>Go</Link>
				{children}
			</div>
		);

		render(
			<Router url={ '/foo/bar' } history={ browserHistory }>
				<Route component={ Layout }>
					<Route path={ '/foo/bar' } component={ BadComponent } />
					<Route path={ '/foo/two' } component={ GoodComponent } />
				</Route>
			</Router>,
			container
		);
		expect(container.innerHTML).to.equal(innerHTML('<div><a href="/foo/two">Go</a><div>Bad Component</div></div>'));

		const link = container.querySelector('a');
		clickOnLink(link);

		setTimeout(() => {
			expect(container.innerHTML).to.equal(innerHTML('<div><a href="/foo/two">Go</a><div>Good Component</div></div>'));
			done();
		}, 10);
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

function clickOnLink(element) {
	if (typeof window.__karma__ !== 'undefined' || typeof window.mocha !== 'undefined') {
		element.click();
	} else {
		browserHistory.push(element.href);
	}
}
