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
		<Link to={'/test'}>Link</Link>
		<IndexLink>IndexLink</IndexLink>
	</div>;
}

function createRoutes(component) {
	return (
		<Router history={ browserHistory }>
			<IndexRoute component={ () => component }/>
			<Route path={'/test'} component={ () => <div>Good Component</div> }/>
		</Router>
	);
}

describe('Router component (jsx)', () => {
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

	describe('<Link>', () => {
		it('should render with all possible props', () => {
			render(createRoutes(
				<Link to="/" activeClassName="linkActiveClass" className="linkClass" activeStyle={{ fontWeight: 'bold' }}>Link</Link>
			), container);

			expect(container.innerHTML).to.equal('<a href="/" class="linkClass linkActiveClass" style="font-weight: bold;">Link</a>');
		});

		// @TODO: Works on browser but not on the server?
		it.skip('should route on click', (done) => {
			render(createRoutes(<TestComponent/>), container);

			expect(container.innerHTML).to.equal('<div><a href="/test">Link</a><a href="/">IndexLink</a></div>');

			const link = container.querySelector('a[href="/test"]');
			link.click();

			requestAnimationFrame(() => {
				expect(container.innerHTML).to.equal('<div>Good Component</div>');
				done();
			});
		});
	});

	describe('<IndexLink>', () => {
		it('should render with all possible props', () => {
			render(createRoutes(
				<IndexLink activeClassName="linkActiveClass" className="linkClass" activeStyle={{ fontWeight: 'bold' }}>IndexLink</IndexLink>
			), container);

			expect(container.innerHTML).to.equal('<a href="/" class="linkClass linkActiveClass" style="font-weight: bold;">IndexLink</a>');
		});
	});
});
