import { renderToStaticMarkup } from 'inferno-server';
import { Prompt, Redirect, Route, StaticRouter } from 'inferno-router';

describe('A <StaticRouter>', () => {
  it('provides context.router.staticContext in props.staticContext', () => {
    const ContextChecker = (props, reactContext) => {
      expect(typeof reactContext.router).toBe('object');
      expect(reactContext.router.staticContext).toBe(props.staticContext);
      return null;
    };

    ContextChecker.contextTypes = {
      router: () => {},
    };

    const context = {};

    renderToStaticMarkup(
      <StaticRouter context={context}>
        <Route component={ContextChecker} />
      </StaticRouter>,
    );
  });

  it('context.router.staticContext persists inside of a <Route>', () => {
    const ContextChecker = (_props, reactContext) => {
      expect(typeof reactContext.router).toBe('object');
      expect(reactContext.router.staticContext).toBe(context);
      return null;
    };

    ContextChecker.contextTypes = {
      router: () => {},
    };

    const context = {};

    renderToStaticMarkup(
      <StaticRouter context={context}>
        <Route component={ContextChecker} />
      </StaticRouter>,
    );
  });

  it('provides context.router.history', () => {
    const ContextChecker = (_props, reactContext) => {
      expect(typeof reactContext.router.history).toBe('object');
      return null;
    };

    ContextChecker.contextTypes = {
      router: () => {},
    };

    const context = {};

    renderToStaticMarkup(
      <StaticRouter context={context}>
        <ContextChecker />
      </StaticRouter>,
    );
  });

  it('warns when passed a history prop', () => {
    const context = {};
    const history = {};

    const spy = spyOn(console, 'error');

    renderToStaticMarkup(<StaticRouter context={context} history={history} />);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.calls.argsFor(0)[0]).toContain(
      '<StaticRouter> ignores the history prop',
    );
    // expect(console.error).toHaveBeenCalledWith(
    //   expect.stringContaining('<StaticRouter> ignores the history prop')
    // )
  });

  it('reports PUSH actions on the context object', () => {
    const context: Record<string, any> = {};

    renderToStaticMarkup(
      <StaticRouter context={context}>
        <Redirect push to="/somewhere-else" />
      </StaticRouter>,
    );

    expect(context.action).toBe('PUSH');
    expect(context.url).toBe('/somewhere-else');
  });

  it('reports REPLACE actions on the context object', () => {
    const context: Record<string, any> = {};

    renderToStaticMarkup(
      <StaticRouter context={context}>
        <Redirect to="/somewhere-else" />
      </StaticRouter>,
    );

    expect(context.action).toBe('REPLACE');
    expect(context.url).toBe('/somewhere-else');
  });

  it('knows how to serialize location objects', () => {
    const context = {};

    renderToStaticMarkup(
      <StaticRouter context={context}>
        <Redirect to={{ pathname: '/somewhere-else' }} />
      </StaticRouter>,
    );

    // expect(context.action).toBe('REPLACE')
    // expect(context.location.pathname).toBe('/somewhere-else')
    // expect(context.location.search).toBeFalsy()
    // expect(context.location.hash).toBeFalsy()
    // expect(context.url).toBe('/somewhere-else')
    expect(context).toEqual({
      action: 'REPLACE',
      url: '/somewhere-else',
      location: {
        pathname: '/somewhere-else',
        search: undefined,
        hash: undefined,
      },
    });
  });

  it('knows how to parse raw URLs', () => {
    const LocationChecker = (props) => {
      expect(props.location).toEqual({
        pathname: '/the/path',
        search: '?the=query',
        hash: '#the-hash',
      });
      return null;
    };

    const context = {};

    renderToStaticMarkup(
      <StaticRouter context={context} location="/the/path?the=query#the-hash">
        <Route component={LocationChecker} />
      </StaticRouter>,
    );
  });

  describe('with a basename', () => {
    it('strips the basename from location pathnames', () => {
      const LocationChecker = (props) => {
        expect(props.location.pathname).toBe('/path');
        return null;
      };

      const context = {};

      renderToStaticMarkup(
        <StaticRouter
          context={context}
          basename="/the-base"
          location="/the-base/path"
        >
          <Route component={LocationChecker} />
        </StaticRouter>,
      );
    });

    it('reports PUSH actions on the context object', () => {
      const context: Record<string, any> = {};

      renderToStaticMarkup(
        <StaticRouter context={context} basename="/the-base">
          <Redirect push to="/somewhere-else" />
        </StaticRouter>,
      );

      expect(context.action).toBe('PUSH');
      expect(context.url).toBe('/the-base/somewhere-else');
    });

    it('reports REPLACE actions on the context object', () => {
      const context: Record<string, any> = {};

      renderToStaticMarkup(
        <StaticRouter context={context} basename="/the-base">
          <Redirect to="/somewhere-else" />
        </StaticRouter>,
      );

      expect(context.action).toBe('REPLACE');
      expect(context.url).toBe('/the-base/somewhere-else');
    });
  });

  describe('no basename', () => {
    it('createHref does not append extra leading slash', () => {
      const context: Record<string, any> = {};
      const pathname = '/test-path-please-ignore';

      interface ILinkProps {
        to: string;
        children?: any;
      }

      const Link = ({ to, children }: ILinkProps) => (
        <Route
          children={({ history: { createHref } }) => (
            <a href={createHref(to)}>{children}</a>
          )}
        />
      );

      const outp = renderToStaticMarkup(
        <StaticRouter context={context}>
          <Link to={pathname} />
        </StaticRouter>,
      );

      expect(outp).toEqual(`<a href="${pathname}"></a>`);
    });
  });

  describe('render a <Prompt>', () => {
    it('does nothing', () => {
      const context = {};

      expect(() => {
        renderToStaticMarkup(
          <StaticRouter context={context}>
            <Prompt message="this is only a test" />
          </StaticRouter>,
        );
      }).not.toThrow();
    });
  });
});
