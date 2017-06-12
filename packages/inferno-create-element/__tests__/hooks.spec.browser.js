import { render } from "inferno";
import createElement from "inferno-create-element";
import sinon from "sinon";

describe("lifecycle hooks", () => {
  describe("Stateless component hooks", () => {
    let template;
    let container;

    function StatelessComponent() {
      const divTemplate = () => {
        return createElement("div", null, "Hello world!");
      };
      return divTemplate();
    }

    afterEach(function() {
      render(null, container);
    });

    beforeEach(function() {
      container = document.createElement("div");

      template = (
        onComponentWillMount,
        onComponentDidMount,
        onComponentWillUnmount,
        onComponentWillUpdate,
        onComponentDidUpdate,
        onComponentShouldUpdate,
        StatelessComponent
      ) => {
        return createElement(
          StatelessComponent,
          {
            onComponentWillMount,
            onComponentDidMount,
            onComponentWillUnmount,
            onComponentWillUpdate,
            onComponentDidUpdate,
            onComponentShouldUpdate
          },
          null
        );
      };
    });

    it('"onComponentWillMount" hook should fire', () => {
      const spyObj = {
        fn: () => {}
      };
      const sinonSpy = sinon.spy(spyObj, "fn");
      const node = template(
        spyObj.fn,
        null,
        null,
        null,
        null,
        null,
        StatelessComponent
      );
      render(node, container);

      expect(sinonSpy.callCount).toBe(1);
    });

    it('"onComponentDidMount" hook should fire, args DOM', () => {
      const spyObj = {
        fn: () => {}
      };
      const sinonSpy = sinon.spy(spyObj, "fn");
      const node = template(
        null,
        spyObj.fn,
        null,
        null,
        null,
        null,
        StatelessComponent
      );
      render(node, container);

      expect(sinonSpy.callCount).toBe(1);
      expect(sinonSpy.getCall(0).args[0]).toBe(container.firstChild);
    });

    it('"onComponentWillUnmount" hook should fire', () => {
      const spyObj = {
        fn: () => {}
      };
      const sinonSpy = sinon.spy(spyObj, "fn");
      const node = template(
        null,
        null,
        spyObj.fn,
        null,
        null,
        null,
        StatelessComponent
      );
      render(node, container);
      expect(sinonSpy.callCount).toBe(0);
      // do unmount
      render(null, container);

      expect(sinonSpy.callCount).toBe(1);
    });

    it('"onComponentWillUpdate" hook should fire', () => {
      const spyObj = {
        fn: () => {}
      };
      const sinonSpy = sinon.spy(spyObj, "fn");
      const node = template(
        null,
        null,
        null,
        spyObj.fn,
        null,
        null,
        StatelessComponent
      );
      render(node, container);
      expect(sinonSpy.callCount).toBe(0);

      render(node, container);
      expect(sinonSpy.callCount).toBe(1);
      expect(typeof sinonSpy.getCall(0).args[0]).toBe("object");
      expect(typeof sinonSpy.getCall(0).args[1]).toBe("object");
    });

    it('"onComponentDidUpdate" hook should fire', () => {
      const spyObj = {
        fn: () => {}
      };
      const sinonSpy = sinon.spy(spyObj, "fn");
      const node = template(
        null,
        null,
        null,
        null,
        spyObj.fn,
        null,
        StatelessComponent
      );
      render(node, container);
      expect(sinonSpy.callCount).toBe(0); // Update 1
      render(node, container);
      expect(sinonSpy.callCount).toBe(1); // Update 2
    });

    it('"onComponentShouldUpdate" hook should fire, should call render when return true', () => {
      let onComponentShouldUpdateCount = 0;
      let renderCount = 0;
      const StatelessComponent = () => {
        renderCount++;
        return null;
      };
      const node = template(
        null,
        null,
        null,
        null,
        null,
        () => {
          onComponentShouldUpdateCount++;
          return true;
        },
        StatelessComponent
      );

      render(node, container);
      expect(onComponentShouldUpdateCount).toBe(0); // Update 1
      expect(renderCount).toBe(1); // Rendered 1 time

      render(node, container);
      expect(onComponentShouldUpdateCount).toBe(1); // Update 2
      expect(renderCount).toBe(2); // Rendered 2 time
    });

    it('"onComponentShouldUpdate" hook should fire, should not call render when return false', () => {
      let onComponentShouldUpdateCount = 0;
      let renderCount = 0;
      const StatelessComponent = () => {
        renderCount++;
        return null;
      };
      const node = template(
        null,
        null,
        null,
        null,
        null,
        () => {
          onComponentShouldUpdateCount++;
          return false;
        },
        StatelessComponent
      );

      render(node, container);
      expect(onComponentShouldUpdateCount).toBe(0); // Update 1
      expect(renderCount).toBe(1); // Rendered 1 time

      render(node, container);
      expect(onComponentShouldUpdateCount).toBe(1); // Update 2
      expect(renderCount).toBe(1); // Rendered 1 time
    });
  });
});
