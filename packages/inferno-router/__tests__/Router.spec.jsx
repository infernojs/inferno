import { render } from 'inferno';
import { innerHTML } from 'inferno-utils';
import { Router } from 'inferno-router';
import createHistory from 'history/createMemoryHistory';

describe('A <Router>', () => {
  describe('with exactly one child', () => {
    it('does not throw an error', () => {
      const node = document.createElement('div');
      expect(() => {
        render(
          <Router history={createHistory()}>
            <p>Bar</p>
          </Router>,
          node
        );
      }).not.toThrow();
    });
  });

  describe('with no children', () => {
    it('does not throw an error', () => {
      const node = document.createElement('div');
      expect(() => {
        render(<Router history={createHistory()} />, node);
      }).not.toThrow();
    });
  });

  describe('context', () => {
    let rootContext;
    const ContextChecker = (props, context) => {
      rootContext = context;
      return null;
    };

    afterEach(() => {
      rootContext = undefined;
    });

    it('puts history on context.history', () => {
      const node = document.createElement('div');
      const history = createHistory();
      render(
        <Router history={history}>
          <ContextChecker />
        </Router>,
        node
      );

      expect(rootContext.router.history).toBe(history);
    });

    it('sets context.router.route at the root', () => {
      const node = document.createElement('div');
      const history = createHistory({
        initialEntries: ['/']
      });

      render(
        <Router history={history}>
          <ContextChecker />
        </Router>,
        node
      );

      expect(rootContext.router.route.match.path).toEqual('/');
      expect(rootContext.router.route.match.url).toEqual('/');
      expect(rootContext.router.route.match.params).toEqual({});
      expect(rootContext.router.route.match.isExact).toEqual(true);
      expect(rootContext.router.route.location).toEqual(history.location);
    });

    it('updates context.router.route upon navigation', () => {
      const node = document.createElement('div');
      const history = createHistory({
        initialEntries: ['/']
      });

      render(
        <Router history={history}>
          <ContextChecker />
        </Router>,
        node
      );

      expect(rootContext.router.route.match.isExact).toBe(true);

      const newLocation = { pathname: '/new' };
      history.push(newLocation);

      expect(rootContext.router.route.match.isExact).toBe(false);
    });

    it('does not contain context.router.staticContext by default', () => {
      const node = document.createElement('div');
      const history = createHistory({
        initialEntries: ['/']
      });

      render(
        <Router history={history}>
          <ContextChecker />
        </Router>,
        node
      );

      expect(rootContext.router.staticContext).toBe(undefined);
    });
  });
});
