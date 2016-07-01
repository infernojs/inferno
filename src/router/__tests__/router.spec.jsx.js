import { render } from './../../DOM/rendering';
import Router from '../Router';
import Route from '../Route';
import browserHistory from '../browserHistory';
import { createBlueprint } from './../../core/createBlueprint';

const Inferno = {
	createBlueprint
};

function TestComponent() {
	return <div>Test!</div>;
}

function TestComponentParams({ params }) {
	return <div>Test! { params.test }</div>;
}

function TestComponentAsync({ async }) {
	return <div>{ async.status } - { async.value }</div>;
}


function createRouterWithSingleRoute(url, path, component) {
	return (
		<Router url={ url } history={ browserHistory }>
			<Route path={ path } component={ component } />
		</Router>
	);
}

function createRouterWithSingleAsyncRoute(url, path, component, async) {
	return (
		<Router url={ url } history={ browserHistory }>
			<Route path={ path } component={ component } async={ async } />
		</Router>
	);
}

describe('Router tests (jsx)', () => {
	let container;

	beforeEach(() => {
		container = document.createElement('div');
	});

	afterEach(() => {
		container.innerHTML = '';
	});

    describe('with browser history', () => {
		describe('and with no wrapper component', () => {
			it('it should render the TestComponent with given paths', () => {
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
			it('it should render the TestComponent with given paths (and params)', () => {
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
			it('it should render the TestComponent with given a async route that resolves', done => {
				const promise = params => new Promise(resolve => setTimeout(resolve.bind(null, 'Hello world!'), 10));
				render(
					createRouterWithSingleAsyncRoute('/foo', '/:test', TestComponentAsync, promise),
					container
				);
				expect(container.innerHTML).to.equal('<div>pending - </div>');
				setTimeout(() => {
					expect(container.innerHTML).to.equal('<div>fulfilled - Hello world!</div>');
					done();
				}, 11);
			});
			it('it should render the TestComponent with the highest ranked path', () => {
				render(
					<Router url={ '/foo/bar/yar' } history={ browserHistory }>
						<Route path={ '*' } component={ () => <div>Bad Component</div> } />
						<Route path={ '/foo/bar/*' } component={ () => <div>Bad Component</div> } />
						<Route path={ '/foo/bar/yar' } component={ () => <div>Good Component</div> } />
					</Router>,
					container
				);
				expect(container.innerHTML).to.equal('<div>Good Component</div>');
			});
		});
    });
});