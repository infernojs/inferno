import Inferno, { render } from 'inferno';
import IndexRoute from '../IndexRoute';
import { innerHTML } from '../../tools/utils';
import Route from '../Route';
import Router from '../Router';
import RouterContext from '../RouterContext';
import createBrowserHistory from 'history/createBrowserHistory';
import {
	expect,
} from 'chai';

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

function GoodComponent(props) {
	return <div>Good Component{props.clone}</div>;
}

describe('Router (jsx)', () => {
	let container;

	beforeEach(() => {
		container = document.createElement('div');
		document.body.appendChild(container);
	});

	afterEach(() => {
		document.body.removeChild(container);
		render(null, container);
	});

	describe('#history', () => {
		it('should render the parent component only', () => {
			render(
				<Router url={ '/foo' } history={ browserHistory }>
					<Route path={ '/foo' } component={ ({ children }) => <div><p>Parent Component</p>{ children }</div> }>
						<Route path={ '/:test' } component={ ({ params }) => <div>Child is { params.test }</div> } />
					</Route>
				</Router>,
				container
			);
			expect(container.innerHTML).to.equal(innerHTML('<div><p>Parent Component</p></div>'));
		});
		it('should render the child and inherit parent (partial URL)', () => {
			render(
				<Router url={ '/foo/bar' } history={ browserHistory }>
					<Route path={ '/foo' } component={ ({ children }) => <div><p>Parent Component</p>{ children }</div> }>
						<Route path={ '/:test' } component={ ({ params }) => <div>Child is { params.test }</div> } />
					</Route>
				</Router>,
				container
			);
			expect(container.innerHTML).to.equal(innerHTML('<div><p>Parent Component</p><div>Child is bar</div></div>'));
		});
		it('should render the child and inherit parent (full URL)', () => {
			render(
				<Router url={ '/foo/bar' } history={ browserHistory }>
					<Route path={ '/foo' } component={ ({ children }) => <div><p>Parent Component</p>{ children }</div> }>
						<Route path={ '/:test' } component={ ({ params }) => <div>Child is { params.test }</div> } />
					</Route>
				</Router>,
				container
			);
			expect(container.innerHTML).to.equal(innerHTML('<div><p>Parent Component</p><div>Child is bar</div></div>'));
		});
		it('should render the child with the longest path', () => {
			render(
				<Router url={ '/level-one' } history={ browserHistory }>
					<Route path={ '/lev' } component={ () => <div>lev</div> } />
					<Route path={ '/level' } component={ () => <div>level</div> } />
					<Route path={ '/level-one' } component={ () => <div>level-one</div> } />
				</Router>,
				container
			);
			expect(container.innerHTML).to.equal(innerHTML('<div>level-one</div>'));
		});
		it('should render the TestComponent with given paths', () => {
			render(
				createRouterWithSingleRoute('/', '/', TestComponent),
				container
			);
			expect(container.innerHTML).to.equal(innerHTML('<div>Test!</div>'));

			render(
				createRouterWithSingleRoute('/foo', '/foo', TestComponent),
				container
			);
			expect(container.innerHTML).to.equal(innerHTML('<div>Test!</div>'));

			render(
				createRouterWithSingleRoute('/foo/bar/yar', '*', TestComponent),
				container
			);
			expect(container.innerHTML).to.equal(innerHTML('<div>Test!</div>'));

			render(
				createRouterWithSingleRoute('/foo/bar', '/foo/*', TestComponent),
				container
			);
			expect(container.innerHTML).to.equal(innerHTML('<div>Test!</div>'));
		});
		it('should render the TestComponent with given paths (and params)', () => {
			render(
				createRouterWithSingleRoute('/foo', '/:test', TestComponentParams),
				container
			);
			expect(container.innerHTML).to.equal(innerHTML('<div>Test! foo</div>'));

			render(
				createRouterWithSingleRoute('/foo/bar', '/foo/:test', TestComponentParams),
				container
			);
			expect(container.innerHTML).to.equal(innerHTML('<div>Test! bar</div>'));

			render(
				createRouterWithSingleRoute('/foo/bar/yar', '/foo/bar/:test', TestComponentParams),
				container
			);
			expect(container.innerHTML).to.equal(innerHTML('<div>Test! yar</div>'));
		});
		it('should render the TestComponent with the highest ranked path', () => {
			render(
				<Router url={ '/foo/bar/yar' } history={ browserHistory }>
					<Route path={ '*' } component={ () => <div>Bad Component</div> } />
					<Route path={ '/foo/bar/*' } component={ () => <div>Bad Component</div> } />
					<Route path={ '/foo/bar/yar' } component={ GoodComponent } />
				</Router>,
				container
			);
			expect(container.innerHTML).to.equal(innerHTML('<div>Good Component</div>'));

			render(
				<Router url={ '/foo/bar/yar' } history={ browserHistory }>
					<Route path={ '*' } component={ () => <div>Bad Component</div> } />
					<Route path={ '/foo/bar/*' } component={ () => <div>Bad Component</div> } />
					<Route path={ '/foo/bar/yar' } component={ GoodComponent } />
					<Route path={ '/foo/bar/yar/zoo' } component={ () => <div>Bad Component</div> } />
				</Router>,
				container
			);
			expect(container.innerHTML).to.equal(innerHTML('<div>Good Component</div>'));
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
			expect(container.innerHTML).to.equal(innerHTML('<div>Good Component</div>'));

			render(
				<Router url={ '/foo' } history={ browserHistory }>
					<Route path={ '/foo' } component={ GoodComponent }>
						<Route path={ '/yar' } component={ () => <div>Bad Component</div> } />
					</Route>
				</Router>,
				container
			);
			expect(container.innerHTML).to.equal(innerHTML('<div>Good Component</div>'));

			render(
				<Router url={ '/foo' } history={ browserHistory }>
					<Route component={ ({ children }) => <div>{ children }</div> }>
						<Route path={ '/foo' } component={ GoodComponent }>
							<Route path={ '/yar' } component={ () => <div>Bad Component</div> } />
						</Route>
					</Route>
				</Router>,
				container
			);
			expect(container.innerHTML).to.equal(innerHTML('<div><div>Good Component</div></div>'));
		});
		it('should render the both components with same params prop passed down', () => {
			render(
				<Router url={ '/foo/bar' } history={ browserHistory }>
					<Route component={ ({ children }) => <div>{ children }</div> }>
						<Route path={ '/foo/:test' } component={ ({ params }) => <div>Param is { params.test }</div> } />
					</Route>
				</Router>,
				container
			);
			expect(container.innerHTML).to.equal(innerHTML('<div><div>Param is bar</div></div>'));
		});
		it('should render the both components with same params prop passed down (route in an array)', () => {
			render(
				<Router url={ '/foo/bar' } history={ browserHistory }>
					<Route component={ ({ children }) => <div>{ children }</div> }>
						<Route path={ '/yar' } component={ () => <div>Bad Component</div> } />
						{ [<Route path={ '/foo/:test' } component={ ({ params }) => <div>Param is { params.test }</div> } />] }
					</Route>
				</Router>,
				container
			);
			expect(container.innerHTML).to.equal(innerHTML('<div><div>Param is bar</div></div>'));
		});
		it('Should render IndexRoute correctly', () => {
			render(
				<Router url={ '/foo' } history={ browserHistory }>
					<Route path={ '/foo' } component={ ({ children }) => children }>
						<IndexRoute component={ GoodComponent } />
					</Route>
				</Router>,
				container
			);
			expect(container.innerHTML).to.equal(innerHTML('<div>Good Component</div>'));
		});
		it('should map through routes with new props', () => {
			render(
				<Router url={ '/foo/bar' } history={ browserHistory }>
					<Route path={ '/foo/:test' } component={ ({ children }) => {
							const newChild = Inferno.cloneVNode(children, { clone: ' Clone' });
							return newChild;
						}}>
						<IndexRoute component={ GoodComponent } />
						<Route path="/other" component={ GoodComponent } />
					</Route>
				</Router>,
				container
			);
			expect(container.innerHTML).to.equal(innerHTML('<div>Good Component Clone</div>'));
		});
		it('should fail on empty routes', () => {
			expect(
				() => render(<Router url={ '/foo/bar' } history={ browserHistory }/>, container)
			).to.throw(TypeError);
		});
	});
	describe('#RouterContext', () => {
		it('should fail when `location` is not provided', () => {
			expect(
				() => render(<RouterContext location={ null }/>, container)
			).to.throw(TypeError);
		});
	});

});
