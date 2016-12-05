import * as Inferno from '../../testUtils/inferno';

import IndexRoute from '../IndexRoute';
import Route from '../Route';
import Router from '../Router';
import RouterContext from '../RouterContext';
import createBrowserHistory from 'history/createBrowserHistory';
import {
	expect,
} from 'chai';
import {
	render,
} from './../../DOM/rendering';

Inferno; // suppress ts 'never used' error

const browserHistory = createBrowserHistory();

function TestComponent() {
	return <div>Test!</div>;
}

function TestComponentParams({ params }) {
	return <div>Test! { params.test }</div>;
}

function createRouterWithSingleRoute(url, path, component) {
	return (
		<Router url={ url } history={ browserHistory }>
			<Route path={ path } component={ component } />
		</Router>
	);
}

describe('Router tests (jsx)', () => {
	let container;

	beforeEach(() => {
		container = document.createElement('div');
	});

	afterEach(() => {
		render(null, container);
		container.innerHTML = '';
	});

	describe('with browser history', () => {
		describe('and with no wrapper component', () => {
			it('should render the TestComponent with given paths', () => {
				render(
					createRouterWithSingleRoute('/', '/', TestComponent),
					container
				);
				expect(container.innerHTML).to.equal('<div>Test!</div>');

				render(
					createRouterWithSingleRoute('/foo', '/foo', TestComponent),
					container
				);
				expect(container.innerHTML).to.equal('<div>Test!</div>');

				render(
					createRouterWithSingleRoute('/foo/bar/yar', '*', TestComponent),
					container
				);
				expect(container.innerHTML).to.equal('<div>Test!</div>');

				render(
					createRouterWithSingleRoute('/foo/bar', '/foo/*', TestComponent),
					container
				);
				expect(container.innerHTML).to.equal('<div>Test!</div>');
			});
			it('should render the TestComponent with given paths (and params)', () => {
				render(
					createRouterWithSingleRoute('/foo', '/:test', TestComponentParams),
					container
				);
				expect(container.innerHTML).to.equal('<div>Test! foo</div>');

				render(
					createRouterWithSingleRoute('/foo/bar', '/foo/:test', TestComponentParams),
					container
				);
				expect(container.innerHTML).to.equal('<div>Test! bar</div>');

				render(
					createRouterWithSingleRoute('/foo/bar/yar', '/foo/bar/:test', TestComponentParams),
					container
				);
				expect(container.innerHTML).to.equal('<div>Test! yar</div>');
			});
			it('should render the TestComponent with the highest ranked path', () => {
				render(
					<Router url={ '/foo/bar/yar' } history={ browserHistory }>
						<Route path={ '*' } component={ () => <div>Bad Component</div> } />
						<Route path={ '/foo/bar/*' } component={ () => <div>Bad Component</div> } />
						<Route path={ '/foo/bar/yar' } component={ () => <div>Good Component</div> } />
					</Router>,
					container
				);
				expect(container.innerHTML).to.equal('<div>Good Component</div>');

				render(
					<Router url={ '/foo/bar/yar' } history={ browserHistory }>
						<Route path={ '*' } component={ () => <div>Bad Component</div> } />
						<Route path={ '/foo/bar/*' } component={ () => <div>Bad Component</div> } />
						<Route path={ '/foo/bar/yar' } component={ () => <div>Good Component</div> } />
						<Route path={ '/foo/bar/yar/zoo' } component={ () => <div>Bad Component</div> } />
					</Router>,
					container
				);
				expect(container.innerHTML).to.equal('<div>Good Component</div>');
			});
			it('should render the correct nested route based on the path', () => {
				render(
					<Router url={ '/foo/bar' } history={ browserHistory }>
						<Route path={ '/foo' } component={ () => <div>Good Component</div> }>
							<Route path={ '/bar' } component={ () => <div>Good Component</div> } />
						</Route>
					</Router>,
					container
				);
				expect(container.innerHTML).to.equal('<div>Good Component</div>');

				render(
					<Router url={ '/foo' } history={ browserHistory }>
						<Route path={ '/foo' } component={ () => <div>Good Component</div> }>
							<Route path={ '/yar' } component={ () => <div>Bad Component</div> } />
						</Route>
					</Router>,
					container
				);
				expect(container.innerHTML).to.equal('<div>Good Component</div>');

				render(
					<Router url={ '/foo' } history={ browserHistory }>
						<Route component={ ({ children }) => <div>{ children }</div> }>
							<Route path={ '/foo' } component={ () => <div>Good Component</div> }>
								<Route path={ '/yar' } component={ () => <div>Bad Component</div> } />
							</Route>
						</Route>
					</Router>,
					container
				);
				expect(container.innerHTML).to.equal('<div><div>Good Component</div></div>');
			});
			it('should render the both components and both components should get the params prop passed down', () => {
				render(
					<Router url={ '/foo/bar' } history={ browserHistory }>
						<Route component={ ({ children }) => <div>{ children }</div> }>
							<Route path={ '/foo/:test' } component={ ({ params }) => <div>Param is { params.test }</div> } />
						</Route>
					</Router>,
					container
				);
				expect(container.innerHTML).to.equal('<div><div>Param is bar</div></div>');
			});
			it('should render the both components and both components should get the params prop passed down (route in an array)', () => {
				render(
					<Router url={ '/foo/bar' } history={ browserHistory }>
						<Route component={ ({ children }) => <div>{ children }</div> }>
							<Route path={ '/yar' } component={ () => <div>Bad Component</div> } />
							{ [<Route path={ '/foo/:test' } component={ ({ params }) => <div>Param is { params.test }</div> } />] }
						</Route>
					</Router>,
					container
				);
				expect(container.innerHTML).to.equal('<div><div>Param is bar</div></div>');
			});
			it('Should render IndexRoute correctly', () => {
				render(
					<Router url={ '/foo' } history={ browserHistory }>
						<Route path={ '/foo' } component={ ({ children }) => children }>
							<IndexRoute component={ () => <div>Good Component</div> } />
						</Route>
					</Router>,
					container
				);
				expect(container.innerHTML).to.equal('<div>Good Component</div>');
			});
			it('should fail on empty routes', () => {
				expect(
					() => render(<Router url={ '/foo/bar' } history={ browserHistory }/>, container)
				).to.throw(TypeError);
			});
		});
	});
	describe('with RouterContext only', () => {
		it('should fail when `location` is not provided', () => {
			expect(
				() => render(<RouterContext location={ null }/>, container)
			).to.throw(TypeError);
		});
		it('should fail when `matched` or children are not provided', () => {
			expect(
				() => render(<RouterContext matched={ null }/>, container)
			).to.throw(TypeError);
		});
		it('should display correctly when `matched` prop is provided', () => {
			render(<RouterContext location='/' matched={ <TestComponent/> }/>, container);

			expect(container.innerHTML).to.equal('<div>Test!</div>');
		});
	});
});
