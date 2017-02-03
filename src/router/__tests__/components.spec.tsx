import {
	expect
} from 'chai';
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
				<Link to="/" activeClassName="linkActiveClass" className="linkClass" activeStyle={{ fontWeight: 'bold' }}>Link</Link>
			), container);

			expect(
				innerHTML(container.innerHTML)
			).to.equal(
				innerHTML('<a class="linkClass linkActiveClass" href="/" style="font-weight: bold;">Link</a>')
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

		it('should call onEnter when switching route through a click', (done) => {
			let clickWitness = 0;
			render(
				<Router url={ '/test' } history={ browserHistory }>
					<IndexRoute component={ () => <div>Good</div> } onEnter={ () => { clickWitness++; } } />
					<Route path={'/test'} component={ () => <TestComponent/> }/>
				</Router>, container
			);

			const link = container.querySelector('a[href="/"]');
			clickOnLink(link);

			requestAnimationFrame(() => {
				expect(clickWitness).to.equal(1);
				done();
			});
		});

		it('shouldn\'t call onEnter if already on the page the href points to', (done) => {
			let clickWitness = 0;
			render(
				<Router url={ '/test' } history={ browserHistory }>
					<IndexRoute component={ () => <div>Good</div> } />
					<Route path={'/test'}  component={ () => <TestComponent/> } onEnter={ () => { clickWitness++; } } />
				</Router>, container
			);

			const link = container.querySelector('a[href="/test"]');
			clickOnLink(link);

			requestAnimationFrame(() => {
				expect(clickWitness).to.equal(1);
				done();
			});
		});

		it('should pass props and context through onEnter when switching route', (done) => {
			let tprops;
			let trouter;
			render(
				<Router url={ '/test' } history={ browserHistory }>
					<IndexRoute component={ () => <div>Good</div> }
											onEnter={ ({ props, router }) => {
												tprops = props;
												trouter = router;
											} }
											className="test-class"
					/>
					<Route path={'/test'}  component={ () => <TestComponent/> }/>
				</Router>, container
			);

			const link = container.querySelector('a[href="/"]');
			clickOnLink(link);

			requestAnimationFrame(() => {
				expect(tprops.className).to.equal('test-class');
				expect(trouter.url).to.equal('/');
				done();
			});
		});

		it('should call getComponent when switching route after click', (done) => {
			let getComponentWitness = 0;
			render(
				<Router url={ '/test' } history={ browserHistory }>
					<IndexRoute component={ () => <div>Good</div> } getComponent={ () => { getComponentWitness++; } } />
					<Route path={'/test'}  component={ () => <TestComponent/> }/>
				</Router>, container
			);

			const link = container.querySelector('a[href="/"]');
			clickOnLink(link);

			requestAnimationFrame(() => {
				expect(getComponentWitness).to.equal(1);
				done();
			});
		});

		it('should mount the child returned by getComponent after navigating through a click', (done) => {

			function Test() {
				return <div id="getComponentCreated">async component</div>;
			}

			let leaveWitness = 0;

			render(
				<Router url={ '/test' } history={ browserHistory }>
					<IndexRoute getComponent={ (_, callback) => {
												callback(null, Test);
											} }
											onLeave={ () => { leaveWitness++; } }
					/>
					<Route path={'/test'}  component={ () => <TestComponent /> } />
				</Router>, container
			);

			const link = container.querySelector('a[href="/"]');
			clickOnLink(link);

			requestAnimationFrame(() => {
				let created = container.querySelector('#getComponentCreated');
				expect(innerHTML(created.innerHTML)).to.equal(innerHTML('async component'));
				browserHistory.push('/test');
				requestAnimationFrame(() => {
					expect(leaveWitness).to.equal(1);
					done();
				});
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
