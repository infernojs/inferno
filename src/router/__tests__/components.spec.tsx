import * as Inferno from '../../testUtils/inferno';

import IndexRoute from '../IndexRoute';
import Route from '../Route';
import Router from '../Router';
import IndexLink from '../IndexLink';
import Link from '../Link';
import createMemoryHistory from 'history/createMemoryHistory';
import {
	expect,
} from 'chai';
import {
	render,
} from '../../DOM/rendering';
Inferno; // suppress ts 'never used' error

const browserHistory = createMemoryHistory();

function TestComponent() {
	return <div>
		<Link to={'/test/link'}>Link</Link>
		<IndexLink>IndexLink</IndexLink>
	</div>;
}

function createRoutes(url, component) {
	return (
		<Router url={ url } history={ browserHistory }>
			<IndexRoute component={ () => component } />
			<Route to={'/test'} component={ () => <div>Good Component</div> } />
		</Router>
	);
}

describe('Router component tests (jsx)', () => {
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

	describe('<Link>', () => {
		it('should render with all possible props', () => {
			render(createRoutes('/',
				<Link to="/" activeClassName="linkActiveClass" className="linkClass" activeStyle={{ fontWeight: 'bold' }}>Link</Link>
			), container);

			expect(container.innerHTML).to.equal('<a href="/" class="linkClass linkActiveClass" style="font-weight: bold;">Link</a>');
		});

		// @TODO: Not catching reacting to clicks for some reason
		it.skip('should update state on click', (done) => {
			render(createRoutes('/',
				<Link to="/test">Link</Link>
			), container);

			expect(container.innerHTML).to.equal('<a href="/test">Link</a>');

			const link = container.querySelector('a');
			link.click();

			requestAnimationFrame(() => {
				expect(container.innerHTML).to.equal('<div>Good Component</div>');
				done();
			});
		});
	});

	describe('<IndexLink>', () => {
		it('should render with all possible props', () => {
			render(createRoutes('/',
				<IndexLink activeClassName="linkActiveClass" className="linkClass" activeStyle={{ fontWeight: 'bold' }}>IndexLink</IndexLink>
			), container);

			expect(container.innerHTML).to.equal('<a href="/" class="linkClass linkActiveClass" style="font-weight: bold;">IndexLink</a>');
		});
	});

	// @TODO: Not catching reacting to clicks for some reason
	it.skip('should route when clicking a Link', (done) => {
		render(
			<Router url={ '/test/nothing' } history={ browserHistory }>
				<Route path={ '/' } component={ () => <div>IndexLink Component</div> } />
				<Route path={ '/test/link' } component={ () => <div>Link Component</div> } />
				<Route path={ '*' } component={ TestComponent } />
			</Router>,
			container
		);
		expect(container.innerHTML).to.equal('<div><a href="/test/link">Link</a><a href="/">IndexLink</a></div>');

		const link = container.querySelector('a[href="/test/link"]');
		link.click();

		requestAnimationFrame(() => {
			expect(container.innerHTML).to.equal('<div>Link Component</div>');
			done();
		});
	});
});
