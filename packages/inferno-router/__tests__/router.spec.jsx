
import { createBrowserHistory, createMemoryHistory } from 'history';
import { cloneVNode, render } from 'inferno';
import { innerHTML } from 'inferno-utils';
import { IndexRoute, Link, Route, Router, RouterContext, match } from 'inferno-router';

const browserHistory = createBrowserHistory();
const browserHistoryWithBaseName = createBrowserHistory({ basename: '/basename-prefix' });

function TestComponent() {
	return <div>Test!</div>;
}

function TestComponentParams({ params }) {
	return <div>Test! { params.test }</div>;
}

function createRouterWithSingleRoute(url, path, component) {
	return (
		<Router url={ url } history={ browserHistory }>
			<Route path={ path } component={ component }/>
		</Router>
	);
}

function GoodComponent(props) {
	return <div>Good Component{props.clone}</div>;
}

function BadComponent(props) {
	return <div>Bad Component{props.clone}</div>;
}

describe('Router (jsx)', () => {
	let container;

	beforeEach(function () {
		container = document.createElement('div');
		document.body.appendChild(container);
	});

	afterEach(function () {
		render(null, container);
		document.body.removeChild(container);
	});

	describe('#historyWithBaseName', () => {
		it('should render the child and inherit parent (partial URL) with basename `/basename-prefix`', () => {
			render(
				<Router url={ '/foo/bar' } history={ browserHistoryWithBaseName }>
					<Route path={ '/foo' } component={ ({ children }) => <div><p>Parent Component</p>{ children }</div> }>
						<Route path={ '/:test' } component={ ({ params }) => <div>Child is { params.test } Link is <Link to="/foo/test"/></div> }/>
					</Route>
				</Router>,
				container
			);
			expect(container.innerHTML).toBe(
                innerHTML('<div><p>Parent Component</p><div>Child is bar Link is <a href="/basename-prefix/foo/test"></a></div></div>')
            );
		});
	});
	describe('#history', () => {
		it('should render the parent component only', () => {
			render(
				<Router url={ '/foo' } history={ browserHistory }>
					<Route path={ '/foo' } component={ ({ children }) => <div><p>Parent Component</p>{ children }</div> }>
						<Route path={ '/:test' } component={ ({ params }) => <div>Child is { params.test }</div> }/>
					</Route>
				</Router>,
				container
			);
			expect(container.innerHTML).toBe(innerHTML('<div><p>Parent Component</p></div>'));
		});
		it('should render the child and inherit parent (partial URL)', () => {
			render(
				<Router url={ '/foo/bar' } history={ browserHistory }>
					<Route path={ '/foo' } component={ ({ children }) => <div><p>Parent Component</p>{ children }</div> }>
						<Route path={ '/:test' } component={ ({ params }) => <div>Child is { params.test }</div> }/>
					</Route>
				</Router>,
				container
			);
			expect(container.innerHTML).toBe(innerHTML('<div><p>Parent Component</p><div>Child is bar</div></div>'));
		});
		it('should render the child and inherit parent (full URL)', () => {
			render(
				<Router url={ '/foo/bar' } history={ browserHistory }>
					<Route path={ '/foo' } component={ ({ children }) => <div><p>Parent Component</p>{ children }</div> }>
						<Route path={ '/:test' } component={ ({ params }) => <div>Child is { params.test }</div> }/>
					</Route>
				</Router>,
				container
			);
			expect(container.innerHTML).toBe(innerHTML('<div><p>Parent Component</p><div>Child is bar</div></div>'));
		});
		it('should render the child and inherit parent (URL containing percent encoded value)', () => {
			render(
				<Router url={ '/foo/100%' } history={ browserHistory }>
					<Route path={ '/foo' } component={ ({ children }) => <div><p>Parent Component</p>{ children }</div> }>
						<Route path={ '/:test' } component={ ({ params }) => <div>Child is { params.test }</div> }/>
					</Route>
				</Router>,
				container
			);
			expect(container.innerHTML).toBe(innerHTML('<div><p>Parent Component</p><div>Child is 100%</div></div>'));
		});
		it('should render the child and inherit parent (URL search param containing percent encoded value)', () => {
			render(
				<Router url={ '/foo/bar?yar=50%25' } history={ browserHistory }>
					<Route path={ '/foo' } component={ ({ children }) => <div><p>Parent Component</p>{ children }</div> }>
						<Route path={ '/:test' } component={ ({ params }) => <div>Child is { params.yar }</div> }/>
					</Route>
				</Router>,
				container
			);
			expect(container.innerHTML).toBe(innerHTML('<div><p>Parent Component</p><div>Child is 50%</div></div>'));
		});
		it('should render the child with the longest path', () => {
			render(
				<Router url={ '/level-one' } history={ browserHistory }>
					<Route path={ '/lev' } component={ () => <div>lev</div> }/>
					<Route path={ '/level' } component={ () => <div>level</div> }/>
					<Route path={ '/level-one' } component={ () => <div>level-one</div> }/>
				</Router>,
				container
			);
			expect(container.innerHTML).toBe(innerHTML('<div>level-one</div>'));
		});
		it('should render the TestComponent with given paths', () => {
			render(
				createRouterWithSingleRoute('/', '/', TestComponent),
				container
			);
			expect(container.innerHTML).toBe(innerHTML('<div>Test!</div>'));

			render(
				createRouterWithSingleRoute('/foo', '/foo', TestComponent),
				container
			);
			expect(container.innerHTML).toBe(innerHTML('<div>Test!</div>'));

			render(
				createRouterWithSingleRoute('/foo/bar/yar', '*', TestComponent),
				container
			);
			expect(container.innerHTML).toBe(innerHTML('<div>Test!</div>'));

			render(
				createRouterWithSingleRoute('/foo/bar', '/foo/*', TestComponent),
				container
			);
			expect(container.innerHTML).toBe(innerHTML('<div>Test!</div>'));
		});
		it('should render the TestComponent with given paths (and params)', () => {
			render(
				createRouterWithSingleRoute('/foo', '/:test', TestComponentParams),
				container
			);
			expect(container.innerHTML).toBe(innerHTML('<div>Test! foo</div>'));

			render(
				createRouterWithSingleRoute('/foo/bar', '/foo/:test', TestComponentParams),
				container
			);
			expect(container.innerHTML).toBe(innerHTML('<div>Test! bar</div>'));

			render(
				createRouterWithSingleRoute('/foo/bar/yar', '/foo/bar/:test', TestComponentParams),
				container
			);
			expect(container.innerHTML).toBe(innerHTML('<div>Test! yar</div>'));
		});
		it('should render the TestComponent with the highest ranked path', () => {
			render(
				<Router url={ '/foo/bar/yar' } history={ browserHistory }>
					<Route path={ '*' } component={ () => <div>Bad Component</div> }/>
					<Route path={ '/foo/bar/*' } component={ () => <div>Bad Component</div> }/>
					<Route path={ '/foo/bar/yar' } component={ GoodComponent }/>
				</Router>,
				container
			);
			expect(container.innerHTML).toBe(innerHTML('<div>Good Component</div>'));

			render(
				<Router url={ '/foo/bar/yar' } history={ browserHistory }>
					<Route path={ '*' } component={ BadComponent }/>
					<Route path={ '/foo/bar/*' } component={ BadComponent }/>
					<Route path={ '/foo/bar/yar' } component={ GoodComponent }/>
					<Route path={ '/foo/bar/yar/zoo' } component={ BadComponent }/>
				</Router>,
				container
			);
			expect(container.innerHTML).toBe(innerHTML('<div>Good Component</div>'));
		});
		it('should render the correct nested route based on the path', () => {
			render(
				<Router url={ '/foo/bar' } history={ browserHistory }>
					<Route path={ '/foo' } component={ GoodComponent }>
						<Route path={ '/bar' } component={ GoodComponent }/>
					</Route>
				</Router>,
				container
			);
			expect(container.innerHTML).toBe(innerHTML('<div>Good Component</div>'));

			render(
				<Router url={ '/foo' } history={ browserHistory }>
					<Route path={ '/foo' } component={ GoodComponent }>
						<Route path={ '/yar' } component={ BadComponent }/>
					</Route>
				</Router>,
				container
			);
			expect(container.innerHTML).toBe(innerHTML('<div>Good Component</div>'));

			render(
				<Router url={ '/foo' } history={ browserHistory }>
					<Route component={ ({ children }) => <div>{ children }</div> }>
						<Route path={ '/foo' } component={ GoodComponent }>
							<Route path={ '/yar' } component={ BadComponent }/>
						</Route>
					</Route>
				</Router>,
				container
			);
			expect(container.innerHTML).toBe(innerHTML('<div><div>Good Component</div></div>'));
		});
		it('should render the both components with same params prop passed down', () => {
			render(
				<Router url={ '/foo/bar' } history={ browserHistory }>
					<Route component={ ({ children }) => <div>{ children }</div> }>
						<Route path={ '/foo/:test' } component={ ({ params }) => <div>Param is { params.test }</div> }/>
					</Route>
				</Router>,
				container
			);
			expect(container.innerHTML).toBe(innerHTML('<div><div>Param is bar</div></div>'));
		});
		it('should render the both components with same params prop passed down (route in an array)', () => {
			render(
				<Router url={ '/foo/bar' } history={ browserHistory }>
					<Route component={ ({ children }) => <div>{ children }</div> }>
						<Route path={ '/yar' } component={ BadComponent }/>
						{ [<Route path={ '/foo/:test' } component={ ({ params }) => <div>Param is { params.test }</div> }/>] }
					</Route>
				</Router>,
				container
			);
			expect(container.innerHTML).toBe(innerHTML('<div><div>Param is bar</div></div>'));
		});
		it('Should render IndexRoute correctly', () => {
			render(
				<Router url={ '/foo' } history={ browserHistory }>
					<Route path={ '/foo' } component={ ({ children }) => children }>
						<IndexRoute component={ GoodComponent }/>
					</Route>
				</Router>,
				container
			);
			expect(container.innerHTML).toBe(innerHTML('<div>Good Component</div>'));
		});
		it('should map through routes with new props', () => {
			render(
				<Router url={ '/foo/bar' } history={ browserHistory }>
					<Route path={ '/foo/:test' } component={ ({ children }) => {
						const newChild = cloneVNode(children, { clone: ' Clone' });
						return newChild;
					}}>
						<IndexRoute component={ GoodComponent }/>
						<Route path="/other" component={ GoodComponent }/>
					</Route>
				</Router>,
				container
			);
			expect(container.innerHTML).toBe(innerHTML('<div>Good Component Clone</div>'));
		});
		it('should fail on empty routes', () => {
			expect(
				() => render(<Router url={ '/foo/bar' } history={ browserHistory }/>, container)
			).toThrowError(TypeError);
		});
	});
	describe('#RouterContext', () => {
		it('should fail when `location` is not provided', () => {
			expect(
				() => render(<RouterContext location={ null }/>, container)
			).toThrowError(TypeError);
		});
		it('should fail when `matched` is not provided', () => {
			expect(
				() => render(<RouterContext location={ '/' } matched={ null }/>, container)
			).toThrowError(TypeError);
		});
		it('should pass when `location` is provided', () => {
			const url = '/';
			const matched = <GoodComponent/>;
			const actual = render(<RouterContext location={ url } matched={ matched }/>, container);
			expect(actual.props.location).toBe(url);
			expect(actual.props.matched).toBe(matched);
		});
		it('should pass when `location` is provided and has percent encoded value', () => {
			const url = '/100%25';
			const matched = <GoodComponent/>;
			const actual = render(<RouterContext location={ url } matched={ matched }/>, container);
			expect(actual.props.location).toBe(url);
			expect(actual.props.matched).toBe(matched);
		});
	});
	describe('#match', () => {
		it('should find route when url has normal value', () => {
			const url = '/search/foo?arg1=50%25';
			const history = createMemoryHistory();
			history.push(url);

			const router = <Router history={ history }>
				<Route path="/" component={ BadComponent }>
					<Route path="search/:searchData" component={ GoodComponent }/>
				</Route>
			</Router>;
			console.log('history.location', history.location);
			const renderProps = match(router, history.location.pathname + history.location.search);

			const actual = render(<RouterContext {...renderProps}/>, container);

			expect(actual.props.location).toBe('/');
			expect(
				actual.props.matched.props.history.location.pathname + actual.props.matched.props.history.location.search
			).toBe('/search/foo?arg1=50%25');
			expect(actual.props.matched.props.params.searchData).toBe('foo');
			expect(actual.props.matched.props.params.arg1).toBe('50%');
			expect(actual.props.matched.props.children.props.component).toBe(BadComponent);
			expect(actual.props.matched.props.children.props.children.props.component).toBe(GoodComponent);
		});
		it('should find route when url has percent encoded value', () => {
			const url = '/search/100%25?arg1=50%25';
			const history = createMemoryHistory();
			history.push(url);
			const router = <Router history={ history }>
				<Route path="/" component={ BadComponent }>
					<Route path="search/:searchData" component={ GoodComponent }/>
				</Route>
			</Router>;
			console.log('history.location', history.location);
			const renderProps = match(router, history.location.pathname + history.location.search);

			const actual = render(<RouterContext {...renderProps}/>, container);

			expect(actual.props.location).toBe('/');
			expect(
				actual.props.matched.props.history.location.pathname + actual.props.matched.props.history.location.search
			).toBe('/search/100%?arg1=50%25');
			expect(actual.props.matched.props.params.searchData).toBe('100%');
			expect(actual.props.matched.props.params.arg1).toBe('50%');
			expect(actual.props.matched.props.children.props.component).toBe(BadComponent);
			expect(actual.props.matched.props.children.props.children.props.component).toBe(GoodComponent);
		});
		it('should find route when url has percent encoded value and multi-search arg', () => {
			const url = '/search/100%25?arg1=50%25&arg1=75%25';
			const history = createMemoryHistory();
			history.push(url);
			const router = <Router history={ history }>
				<Route path="/" component={ BadComponent }>
					<Route path="search/:searchData" component={ GoodComponent }/>
				</Route>
			</Router>;
			console.log('history.location', history.location);
			const renderProps = match(router, history.location.pathname + history.location.search);

			const actual = render(<RouterContext {...renderProps}/>, container);

			expect(actual.props.location).toBe('/');
			expect(
				actual.props.matched.props.history.location.pathname + actual.props.matched.props.history.location.search
			).toBe('/search/100%?arg1=50%25&arg1=75%25');
			expect(actual.props.matched.props.params.searchData).toBe('100%');
			expect(actual.props.matched.props.params.arg1[0]).toBe('50%');
			expect(actual.props.matched.props.params.arg1[1]).toBe('75%');
			expect(actual.props.matched.props.children.props.component).toBe(BadComponent);
			expect(actual.props.matched.props.children.props.children.props.component).toBe(GoodComponent);
		});
	});

});
