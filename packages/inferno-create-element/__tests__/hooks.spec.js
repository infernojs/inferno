import { render } from 'inferno';
import { createElement } from 'inferno-create-element';
import sinon from 'sinon';
import { innerHTML } from 'inferno-utils';
import { Component } from '../../inferno/src';

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

    afterEach(function() {
      render(null, container);
    });

    beforeEach(function() {
      container = document.createElement('div');

      template = (
        onComponentWillMount,
        onComponentDidMount,
        onComponentWillUnmount,
        onComponentWillUpdate,
        onComponentDidUpdate,
        onComponentShouldUpdate,
        StatelessComponent
      ) => props => {
        return createElement(
          StatelessComponent,
          {
            onComponentWillMount,
            onComponentDidMount,
            onComponentWillUnmount,
            onComponentWillUpdate,
            onComponentDidUpdate,
            onComponentShouldUpdate,
            ...props
          },
          null
        );
      };
    });

    it('"onComponentWillMount" hook should fire, args props', () => {
      const spyObj = {
        fn: () => {}
      };
      const sinonSpy = sinon.spy(spyObj, 'fn');
      const node = template(spyObj.fn, null, null, null, null, null, StatelessComponent)({ a: 1 });
      render(node, container);

      expect(sinonSpy.callCount).toBe(1);
      expect(sinonSpy.getCall(0).args.length).toBe(1);
      expect(sinonSpy.getCall(0).args[0]).toEqual({ a: 1, children: null });
    });

    it('"onComponentDidMount" hook should fire, args DOM props', () => {
      const spyObj = {
        fn: () => {}
      };
      const sinonSpy = sinon.spy(spyObj, 'fn');
      const node = template(null, spyObj.fn, null, null, null, null, StatelessComponent)({ a: 1 });
      render(node, container);

      expect(sinonSpy.callCount).toBe(1);
      expect(sinonSpy.getCall(0).args.length).toBe(2);
      expect(sinonSpy.getCall(0).args[0]).toBe(container.firstChild);
      expect(sinonSpy.getCall(0).args[1]).toEqual({ a: 1, children: null });
    });

    it('"onComponentWillUnmount" hook should fire, args DOM props', () => {
      const spyObj = {
        fn: () => {}
      };
      const sinonSpy = sinon.spy(spyObj, 'fn');
      const node = template(null, null, spyObj.fn, null, null, null, StatelessComponent)({ a: 1 });
      render(node, container);
      expect(sinonSpy.callCount).toBe(0);
      // do unmount
      render(null, container);

      expect(sinonSpy.callCount).toBe(1);
      expect(sinonSpy.getCall(0).args.length).toBe(2);
      expect(sinonSpy.getCall(0).args[0].outerHTML).toBe(innerHTML('<div>Hello world!</div>'));
      expect(sinonSpy.getCall(0).args[1]).toEqual({ a: 1, children: null });
    });

    it('"onComponentWillUpdate" hook should fire, args props nextProps', () => {
      const spyObj = {
        fn: () => {}
      };
      const sinonSpy = sinon.spy(spyObj, 'fn');
      const t = template(null, null, null, spyObj.fn, null, null, StatelessComponent);

      const node1 = t({ a: 1 });
      render(node1, container);
      expect(sinonSpy.callCount).toBe(0);

      const node2 = t({ a: 2 });
      render(node2, container);
      expect(sinonSpy.callCount).toBe(1);
      expect(sinonSpy.getCall(0).args.length).toBe(2);
      expect(sinonSpy.getCall(0).args[0]).toEqual({ a: 1, children: null });
      expect(sinonSpy.getCall(0).args[1]).toEqual({ a: 2, children: null });
    });

    it('"onComponentDidUpdate" hook should fire, args prevProps props', () => {
      const spyObj = {
        fn: () => {}
      };
      const sinonSpy = sinon.spy(spyObj, 'fn');
      const t = template(null, null, null, null, spyObj.fn, null, StatelessComponent);

      const node1 = t({ a: 1 });
      render(node1, container);
      expect(sinonSpy.callCount).toBe(0); // Update 1

      const node2 = t({ a: 2 });
      render(node2, container);
      expect(sinonSpy.callCount).toBe(1); // Update 2
      expect(sinonSpy.getCall(0).args.length).toBe(2);
      expect(sinonSpy.getCall(0).args[0]).toEqual({ a: 1, children: null });
      expect(sinonSpy.getCall(0).args[1]).toEqual({ a: 2, children: null });
    });

    it('"onComponentShouldUpdate" hook should fire, should call render when return true, args props nextProps', () => {
      let onComponentShouldUpdateCount = 0;
      let renderCount = 0;
      const spyObj = {
        fn: () => {
          onComponentShouldUpdateCount++;
          return true;
        }
      };
      const sinonSpy = sinon.spy(spyObj, 'fn');
      const StatelessComponent = () => {
        renderCount++;
        return null;
      };
      const t = template(null, null, null, null, null, spyObj.fn, StatelessComponent);

      const node1 = t({ a: 1 });
      render(node1, container);
      expect(onComponentShouldUpdateCount).toBe(0); // Update 1
      expect(renderCount).toBe(1); // Rendered 1 time

      const node2 = t({ a: 2 });
      render(node2, container);
      expect(onComponentShouldUpdateCount).toBe(1); // Update 2
      expect(renderCount).toBe(2); // Rendered 2 time
      expect(sinonSpy.getCall(0).args.length).toBe(2);
      expect(sinonSpy.getCall(0).args[0]).toEqual({ a: 1, children: null });
      expect(sinonSpy.getCall(0).args[1]).toEqual({ a: 2, children: null });
    });

    it('"onComponentShouldUpdate" hook should fire, should not call render when return false, args props nextProps', () => {
      let onComponentShouldUpdateCount = 0;
      let renderCount = 0;
      const spyObj = {
        fn: () => {
          onComponentShouldUpdateCount++;
          return false;
        }
      };
      const sinonSpy = sinon.spy(spyObj, 'fn');
      const StatelessComponent = () => {
        renderCount++;
        return null;
      };
      const t = template(null, null, null, null, null, spyObj.fn, StatelessComponent);

      const node1 = t({ a: 1 });
      render(node1, container);
      expect(onComponentShouldUpdateCount).toBe(0); // Update 1
      expect(renderCount).toBe(1); // Rendered 1 time

      const node2 = t({ a: 2 });
      render(node2, container);
      expect(onComponentShouldUpdateCount).toBe(1); // Update 2
      expect(renderCount).toBe(1); // Rendered 1 time
      expect(sinonSpy.getCall(0).args.length).toBe(2);
      expect(sinonSpy.getCall(0).args[0]).toEqual({ a: 1, children: null });
      expect(sinonSpy.getCall(0).args[1]).toEqual({ a: 2, children: null });
    });
  });

  describe('Class Component hooks', function() {
    it('Should trigger ref callback when component is mounting and unmounting', () => {
      const container = document.createElement('div');
      class FooBar extends Component {
        render() {
          return createElement('div');
        }
      }
      const spyObj = {
        fn: () => {}
      };
      const sinonSpy = sinon.spy(spyObj, 'fn');
      const node = createElement(FooBar, { ref: spyObj.fn });

      render(node, container);

      expect(sinonSpy.callCount).toBe(1);
      expect(sinonSpy.getCall(0).args.length).toBe(1);
      expect(sinonSpy.getCall(0).args[0]).not.toEqual(null);

      render(null, container);

      expect(sinonSpy.callCount).toBe(2);
      expect(sinonSpy.getCall(1).args.length).toBe(1);
      expect(sinonSpy.getCall(1).args[0]).toEqual(null);
    });
  });
});
