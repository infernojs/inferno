import { render } from './../../DOM/rendering';
import createElement from './../../factories/createElement';

const sinon = require('sinon/pkg/sinon');

describe('lifecycle hooks', () => {
	describe('Stateless component hooks', () => {
		let template;
		let container;
		function StatelessComponent() {
			const divTemplate = () => {
				return createElement('div', null, 'Hello world!');
			};
			return divTemplate();
		}

		afterEach(() => {
			render(null, container);
		});

		beforeEach(() => {
			container = document.createElement('div');

			template = (onComponentWillMount, onComponentDidMount, onComponentWillUnmount, onComponentWillUpdate, onComponentDidUpdate, onComponentShouldUpdate, StatelessComponent) => {
				return createElement(StatelessComponent, {
					onComponentWillMount,
					onComponentDidMount,
					onComponentWillUnmount,
					onComponentWillUpdate,
					onComponentDidUpdate,
					onComponentShouldUpdate
				}, null);
			};
		});

		it('"onComponentWillMount" hook should fire', () => {
			const spyObj = {fn: () => {}};
			const spy = sinon.spy(spyObj, 'fn');
			const node = template(spyObj.fn, null, null, null, null, null, StatelessComponent);
			render(node, container);

			expect(spy.callCount).to.equal(1);
		});

		it('"onComponentDidMount" hook should fire, args DOM', () => {
			const spyObj = {fn: () => {}};
			const spy = sinon.spy(spyObj, 'fn');
			const node = template(null, spyObj.fn, null, null, null, null, StatelessComponent);
			// TODO: It looks like aggressive recycling is making this test case fail
			render(node, container);

			expect(spy.callCount).to.equal(1);
			expect(spy.getCall(0).args[0]).to.equal(container.firstChild);
		});

		it('"onComponentWillUnmount" hook should fire', () => {
			const spyObj = {fn: () => {}};
			const spy = sinon.spy(spyObj, 'fn');
			const node = template(null, null, spyObj.fn, null, null, null, StatelessComponent);
			render(node, container);
			expect(spy.callCount).to.equal(0);
			// do unmount
			render(null, container);

			expect(spy.callCount).to.equal(1);
		});

		it('"onComponentWillUpdate" hook should fire', () => {
			const spyObj = {fn: () => {}};
			const spy = sinon.spy(spyObj, 'fn');
			const node = template(null, null, null, spyObj.fn, null, null, StatelessComponent);
			render(node, container);
			expect(spy.callCount).to.equal(1);

			console.log(spy.getCall(0).args);
			// TODO: How can we verify last props in unit test
			// expect(spy.getCall(0).args[0]).to.equal(node.props, 'verify last props'); // last props
			expect(spy.getCall(0).args[1]).to.equal(node.props, 'verify next props'); // next props
		});

		it('"onComponentDidUpdate" hook should fire', () => {
			const spyObj = {fn: () => {}};
			const spy = sinon.spy(spyObj, 'fn');
			const node = template(null, null, null, null, spyObj.fn, null, StatelessComponent);
			render(node, container);
			expect(spy.callCount).to.equal(1); // Update 1
			render(node, container);
			expect(spy.callCount).to.equal(2); // Update 2
		});

		it('"onComponentShouldUpdate" hook should fire, should call render when return true', () => {
			const spyObj = {shouldUpdate: () => true};
			const renderSpy = sinon.spy(StatelessComponent);
			const spy = sinon.spy(spyObj, 'shouldUpdate');
			const node = template(null, null, null, null, null, spyObj.shouldUpdate, StatelessComponent);

			render(node, container);
			expect(spy.callCount).to.equal(1, 'should have called shouldUpdate once'); // Update 1
			expect(renderSpy.callCount).to.equal(1, 'should have called "render" once'); // Rendered 1 time

			render(node, container);
			expect(spy.callCount).to.equal(2, 'should have called shouldUpdate twice'); // Update 2
			expect(renderSpy.callCount).to.equal(2, 'should have called "render" twice'); // Rendered 2 time
		});

		it('"onComponentShouldUpdate" hook should fire, should not call render when return false', () => {
			const spyObj = {shouldUpdate: () => false};
			const renderSpy = sinon.spy(StatelessComponent);
			const spy = sinon.spy(spyObj, 'shouldUpdate');
			const node = template(null, null, null, null, null, spyObj.shouldUpdate, StatelessComponent);

			render(node, container);
			expect(spy.callCount).to.equal(1, 'should have called shouldUpdate once'); // Update 1
			expect(renderSpy.callCount).to.equal(0, 'Should update false, dont render');

			render(node, container);
			expect(spy.callCount).to.equal(2, 'should have called shouldUpdate twice'); // Update 2
			expect(renderSpy.callCount).to.equal(0, 'Should update false, dont render');
		});
	});
});
