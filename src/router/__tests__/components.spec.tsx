import {
	expect
} from 'chai';
import { assert, spy } from 'sinon';
import { createMemoryHistory } from 'history';
import { render } from 'inferno';
import { innerHTML } from '../../tools/utils';
import IndexLink from '../IndexLink';
import IndexRoute from '../IndexRoute';
import Link from '../Link';
import Route from '../Route';
import Router from '../Router';
const browserHistory = createMemoryHistory();

function TestComponent() {
	return <div>
		<Link to={'/test'}>Link</Link>
		<IndexLink>IndexLink</IndexLink>
	</div>;
}

function createRoutes(component) {
	return (
		<Router history={ browserHistory }>
			<IndexRoute component={ () => component }/>
			<Route path={'/test'} component={ () => <div>Good</div> }/>
		</Router>
	);
}

describe('Router (jsx)', () => {
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

	describe('#Link', () => {
		it('should render with all possible props', () => {
			render(createRoutes(
				<Link to="/" activeClassName="linkActiveClass" className="linkClass" style={{ color: 'red' }} activeStyle={{ fontWeight: 'bold' }} title="TestTitle" data-test="DataTest">Link</Link>
			), container);

			expect(
				innerHTML(container.innerHTML)
			).to.equal(
				innerHTML('<a class="linkClass linkActiveClass" href="/" style="color: red; font-weight: bold;" title="TestTitle" data-test="DataTest">Link</a>')
			);
		});

		it('should render without active class and style when not the active location', () => {
			render(createRoutes(
				<Link to="/notactive" activeClassName="linkActiveClass" className="linkClass" style={{ color: 'red' }} activeStyle={{ fontWeight: 'bold' }}>Link</Link>
			), container);

			expect(
				innerHTML(container.innerHTML)
			).to.equal(
				innerHTML('<a class="linkClass" href="/notactive" style="color: red;">Link</a>')
			);
		});

		it('should render base class and style when active class and style are not defined', () => {
			render(createRoutes(
				<Link to="/notactive" className="linkClass" style={{ color: 'red' }}>Link</Link>
			), container);

			expect(
				innerHTML(container.innerHTML)
			).to.equal(
				innerHTML('<a class="linkClass" href="/notactive" style="color: red;">Link</a>')
			);
		});

		it('should render active class and style even when base class is not defined', () => {
			render(createRoutes(
				<Link to="/" activeClassName="linkActiveClass" activeStyle={{ fontWeight: 'bold' }}>Link</Link>
			), container);

			expect(
				innerHTML(container.innerHTML)
			).to.equal(
				innerHTML('<a class="linkActiveClass" href="/" style="font-weight: bold;">Link</a>')
			);
		});

		it('should route on click', (done) => {
			render(createRoutes(<TestComponent/>), container);

			expect(container.innerHTML).to.equal(innerHTML('<div><a href="/test">Link</a><a href="/">IndexLink</a></div>'));

			const link = container.querySelector('a[href="/test"]');
			clickOnLink(link);

			requestAnimationFrame(() => {
				expect(container.innerHTML).to.equal(innerHTML('<div>Good</div>'));
				done();
			});
		});

		it('should call onClick handler when clicked', () => {
			const obj = {
				fn() {
				}
			};
			const sinonSpy = spy(obj, 'fn');

			render(createRoutes(
				<Link to="/" onClick={obj.fn}>Link</Link>
			), container);

			const link = container.querySelector('a[href="/"]');
			link.onclick({
				button: 0,
				preventDefault() {},
				target: {}
			});

			const calledOnce = assert.calledOnce;
			calledOnce(sinonSpy);
		});

		it('should not call onClick handler when right clicked', () => {
			const obj = {
				fn() {
				}
			};
			const sinonSpy = spy(obj, 'fn');

			render(createRoutes(
				<Link to="/" onClick={obj.fn}>Link</Link>
			), container);

			const link = container.querySelector('a[href="/"]');
			link.onclick({
				button: 2,
				preventDefault() {},
				target: {}
			});

			const notCalled = assert.notCalled;
			notCalled(sinonSpy);
		});
	});

	describe('#IndexLink', () => {
		it('should render with all possible props', () => {
			render(createRoutes(
				<IndexLink activeClassName="linkActiveClass" className="linkClass" activeStyle={{ fontWeight: 'bold' }}>IndexLink</IndexLink>
			), container);

			expect(
				innerHTML(container.innerHTML)
			).to.equal(
				innerHTML('<a class="linkClass linkActiveClass" href="/" style="font-weight: bold;">IndexLink</a>')
			);
		});

		it('should route on click', (done) => {
			render(<Router url={ '/test' } history={ browserHistory }>
				<IndexRoute component={ () => <div>Good</div> }/>
				<Route path={'/test'} component={ () => <TestComponent/> }/>
			</Router>, container);

			expect(container.innerHTML).to.equal(innerHTML('<div><a href="/test">Link</a><a href="/">IndexLink</a></div>'));

			const link = container.querySelector('a[href="/"]');
			clickOnLink(link);

			requestAnimationFrame(() => {
				expect(container.innerHTML).to.equal(innerHTML('<div>Good</div>'));
				done();
			});
		});
	});
});

function clickOnLink(element) {
	if (typeof window.__karma__ !== 'undefined' || typeof window.mocha !== 'undefined') {
		element.click();
	} else {
		browserHistory.push(element.href);
	}
}
