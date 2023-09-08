import { Component, render } from 'inferno';
import { createElement } from 'inferno-create-element';

describe('lifecycle hooks', () => {
  describe('Stateless component hooks', () => {
    let template;
    let container;
    let animationTemplate;

    function StatelessComponent() {
      const divTemplate = () => {
        return createElement('div', null, 'Hello world!');
      };
      return divTemplate();
    }

    afterEach(function () {
      render(null, container);
    });

    beforeEach(function () {
      container = document.createElement('div');

      template =
        (
          onComponentWillMount,
          onComponentDidMount,
          onComponentWillUnmount,
          onComponentWillUpdate,
          onComponentDidUpdate,
          onComponentShouldUpdate,
          StatelessComponent,
        ) =>
        (props) => {
          return createElement(
            StatelessComponent,
            {
              onComponentWillMount,
              onComponentDidMount,
              onComponentWillUnmount,
              onComponentWillUpdate,
              onComponentDidUpdate,
              onComponentShouldUpdate,
              ...props,
            },
            null,
          );
        };

      animationTemplate =
        (onComponentDidAppear, onComponentWillDisappear, StatelessComponent) =>
        (props) => {
          return createElement(
            StatelessComponent,
            {
              onComponentDidAppear,
              onComponentWillDisappear,
              ...props,
            },
            null,
          );
        };
    });

    it('"onComponentWillMount" hook should fire, args props', () => {
      const spyObj = {
        fn: () => {},
      };
      const spy = spyOn(spyObj, 'fn');
      const node = template(
        spyObj.fn,
        null,
        null,
        null,
        null,
        null,
        StatelessComponent,
      )({ a: 1 });
      render(node, container);

      expect(spy.calls.count()).toBe(1);
      expect(spy.calls.argsFor(0).length).toBe(1);
      expect(spy.calls.argsFor(0)[0]).toEqual({ a: 1, children: null });
    });

    it('"onComponentDidMount" hook should fire, args DOM props', () => {
      const spyObj = {
        fn: () => {},
      };
      const spy = spyOn(spyObj, 'fn');
      const node = template(
        null,
        spyObj.fn,
        null,
        null,
        null,
        null,
        StatelessComponent,
      )({ a: 1 });
      render(node, container);

      expect(spy.calls.count()).toBe(1);
      expect(spy.calls.argsFor(0).length).toBe(2);
      expect(spy.calls.argsFor(0)[0]).toBe(container.firstChild);
      expect(spy.calls.argsFor(0)[1]).toEqual({ a: 1, children: null });
    });

    it('"onComponentWillUnmount" hook should fire, args DOM props', () => {
      const spyObj = {
        fn: () => {},
      };
      const spy = spyOn(spyObj, 'fn');
      const node = template(
        null,
        null,
        spyObj.fn,
        null,
        null,
        null,
        StatelessComponent,
      )({ a: 1 });
      render(node, container);
      expect(spy.calls.count()).toBe(0);
      // do unmount
      render(null, container);

      expect(spy.calls.count()).toBe(1);
      expect(spy.calls.argsFor(0).length).toBe(2);
      expect(spy.calls.argsFor(0)[0].outerHTML).toBe('<div>Hello world!</div>');
      expect(spy.calls.argsFor(0)[1]).toEqual({ a: 1, children: null });
    });

    it('"onComponentWillUpdate" hook should fire, args props nextProps', () => {
      const spyObj = {
        fn: () => {},
      };
      const spy = spyOn(spyObj, 'fn');
      const t = template(
        null,
        null,
        null,
        spyObj.fn,
        null,
        null,
        StatelessComponent,
      );

      const node1 = t({ a: 1 });
      render(node1, container);
      expect(spy.calls.count()).toBe(0);

      const node2 = t({ a: 2 });
      render(node2, container);
      expect(spy.calls.count()).toBe(1);
      expect(spy.calls.argsFor(0).length).toBe(2);
      expect(spy.calls.argsFor(0)[0]).toEqual({ a: 1, children: null });
      expect(spy.calls.argsFor(0)[1]).toEqual({ a: 2, children: null });
    });

    it('"onComponentDidUpdate" hook should fire, args prevProps props', () => {
      const spyObj = {
        fn: () => {},
      };
      const spy = spyOn(spyObj, 'fn');
      const t = template(
        null,
        null,
        null,
        null,
        spyObj.fn,
        null,
        StatelessComponent,
      );

      const node1 = t({ a: 1 });
      render(node1, container);
      expect(spy.calls.count()).toBe(0); // Update 1

      const node2 = t({ a: 2 });
      render(node2, container);
      expect(spy.calls.count()).toBe(1); // Update 2
      expect(spy.calls.argsFor(0).length).toBe(2);
      expect(spy.calls.argsFor(0)[0]).toEqual({ a: 1, children: null });
      expect(spy.calls.argsFor(0)[1]).toEqual({ a: 2, children: null });
    });

    it('"onComponentShouldUpdate" hook should fire, should call render when return true, args props nextProps', () => {
      let onComponentShouldUpdateCount = 0;
      let renderCount = 0;
      const spyObj = {
        fn: () => {
          onComponentShouldUpdateCount++;
          return true;
        },
      };
      const spy = spyOn(spyObj, 'fn').and.callThrough();
      const StatelessComponent = () => {
        renderCount++;
        return null;
      };
      const t = template(
        null,
        null,
        null,
        null,
        null,
        spyObj.fn,
        StatelessComponent,
      );

      const node1 = t({ a: 1 });
      render(node1, container);
      expect(onComponentShouldUpdateCount).toBe(0); // Update 1
      expect(renderCount).toBe(1); // Rendered 1 time

      const node2 = t({ a: 2 });
      render(node2, container);
      expect(onComponentShouldUpdateCount).toBe(1); // Update 2
      expect(renderCount).toBe(2); // Rendered 2 time
      expect(spy.calls.argsFor(0).length).toBe(2);
      expect(spy.calls.argsFor(0)[0]).toEqual({ a: 1, children: null });
      expect(spy.calls.argsFor(0)[1]).toEqual({ a: 2, children: null });
    });

    it('"onComponentShouldUpdate" hook should fire, should not call render when return false, args props nextProps', () => {
      let onComponentShouldUpdateCount = 0;
      let renderCount = 0;
      const spyObj = {
        fn: () => {
          onComponentShouldUpdateCount++;
          return false;
        },
      };
      const spy = spyOn(spyObj, 'fn').and.callThrough();
      const StatelessComponent = () => {
        renderCount++;
        return null;
      };
      const t = template(
        null,
        null,
        null,
        null,
        null,
        spyObj.fn,
        StatelessComponent,
      );

      const node1 = t({ a: 1 });
      render(node1, container);
      expect(onComponentShouldUpdateCount).toBe(0); // Update 1
      expect(renderCount).toBe(1); // Rendered 1 time

      const node2 = t({ a: 2 });
      render(node2, container);
      expect(onComponentShouldUpdateCount).toBe(1); // Update 2
      expect(renderCount).toBe(1); // Rendered 1 time
      expect(spy.calls.argsFor(0).length).toBe(2);
      expect(spy.calls.argsFor(0)[0]).toEqual({ a: 1, children: null });
      expect(spy.calls.argsFor(0)[1]).toEqual({ a: 2, children: null });
    });

    it('"onComponentDidAppear" hook should fire, args dom props', () => {
      const spyObj = {
        fn: () => {},
      };

      const spy = spyOn(spyObj, 'fn');
      const t = animationTemplate(spyObj.fn, null, StatelessComponent);

      const node1 = t({ a: 1 });
      render(node1, container);
      expect(spy.calls.count()).toBe(1); // Update 1
      expect(spy.calls.argsFor(0).length).toBe(2);
      expect(spy.calls.argsFor(0)[0] instanceof HTMLDivElement).toEqual(true);
      expect(typeof spy.calls.argsFor(0)[1] === 'object').toEqual(true);

      const node2 = t({ a: 2 });
      render(node2, container);
      expect(spy.calls.count()).toBe(1); // Update 2 (shouldn't trigger animation)
    });

    it('"onComponentWillDisappear" hook should fire, args dom props', () => {
      const spyObj = {
        fn: () => {},
      };

      const spy = spyOn(spyObj, 'fn');
      const t = animationTemplate(null, spyObj.fn, StatelessComponent);

      const node1 = t({ a: 1 });
      render(node1, container);
      render(null, container);

      expect(spy.calls.count()).toBe(1); // animation triggers on remove
      expect(spy.calls.argsFor(0).length).toBe(3);
      expect(spy.calls.argsFor(0)[0] instanceof HTMLDivElement).toEqual(true);
      expect(typeof spy.calls.argsFor(0)[1] === 'object').toEqual(true);
      expect(typeof spy.calls.argsFor(0)[2] === 'function').toEqual(true);
    });
  });

  describe('Class Component hooks', function () {
    it('Should trigger ref callback when component is mounting and unmounting', () => {
      const container = document.createElement('div');
      class FooBar extends Component {
        render() {
          return createElement('div');
        }
      }
      const spyObj = {
        fn: () => {},
      };
      const spy = spyOn(spyObj, 'fn');
      const node = createElement(FooBar, { ref: spyObj.fn });

      render(node, container);

      expect(spy.calls.count()).toBe(1);
      expect(spy.calls.argsFor(0).length).toBe(1);
      expect(spy.calls.argsFor(0)[0]).not.toEqual(null);

      render(null, container);

      expect(spy.calls.count()).toBe(2);
      expect(spy.calls.argsFor(1).length).toBe(1);
      expect(spy.calls.argsFor(1)[0]).toEqual(null);
    });
  });
});
