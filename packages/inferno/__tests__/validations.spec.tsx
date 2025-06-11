import { createTextVNode, render } from 'inferno';
import { ChildFlags } from 'inferno-vnode-flags';

describe('Development warnings', () => {
  let container;

  function constructInfernoError(message: string) {
    return new Error(`Inferno Error: ${message}`);
  }

  beforeEach(function () {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(function () {
    render(null, container);
    container.innerHTML = '';
    document.body.removeChild(container);
  });

  // Browsers format error messages a little bit differently so just skip those in tests. As long as messages are ok its fine.
  if (global?.usingJSDOM) {
    describe('Warning two duplicate keys', () => {
      it('Should throw error if two duplicates is found', () => {
        const errorNode = (
          <div>
            <div key="1">2</div>
            <div key="1">1</div>
          </div>
        );

        expect(() => {
          render(errorNode, container);
        }).toThrow(
          constructInfernoError(
            'Encountered two children with same key: {1}. Location: \n>> <div>\n>> <div>\n',
          ),
        );
      });

      it('Should throw error if two duplicate TEXTs is found with same key', () => {
        const errorNode = (
          <div>
            {createTextVNode('foo', 'foo')}
            {createTextVNode('foo2', 'foo')}
          </div>
        );

        expect(() => {
          render(errorNode, container);
        }).toThrow(
          constructInfernoError(
            'Encountered two children with same key: {foo}. Location: \n>> Text(foo2)\n>> <div>\n',
          ),
        );
      });

      it('Should throw error if two duplicates is found (Component)', () => {
        const FooBar = ({ children }) => children;
        const Tester = ({ children }) => children;
        const errorNode = (
          <div>
            <FooBar key="1">2</FooBar>
            <Tester key="1">1</Tester>
          </div>
        );

        expect(() => {
          render(errorNode, container);
        }).toThrow(
          constructInfernoError(
            'Encountered two children with same key: {1}. Location: \n>> <Tester />\n>> <div>\n',
          ),
        );
      });

      it('Should print nice stack of invalid key location', () => {
        // @ts-expect-error unused children
        const FooBar = ({ children }) => (
          <span className="parentNode">
            <div key={'dup'} />
            <em key={'dup'} />
          </span>
        );
        const errorNode = (
          <div>
            <span>
              <FooBar>
                <span>1</span>
              </FooBar>
            </span>
          </div>
        );

        expect(() => {
          render(errorNode, container);
        }).toThrow(
          constructInfernoError(
            'Encountered two children with same key: {dup}. Location: \n>> <em>\n>> <span class="parentNode">\n',
          ),
        );
      });
    });

    describe('Warning key missing', () => {
      it('Should throw error if key is missing', () => {
        const errorNode = (
          <div $HasKeyedChildren>
            <div key="1">2</div>
            <div>1</div>
          </div>
        );

        expect(() => {
          render(errorNode, container);
        }).toThrow(
          constructInfernoError(
            'Encountered child without key during keyed algorithm. If this error points to Array make sure children is flat list. Location: \n>> <div>\n>> <div>\n',
          ),
        );
      });

      it('Should if there is one that cannot be keyed for example array', () => {
        const errorNode = (
          <div $ChildFlag={ChildFlags.HasKeyedChildren}>
            {createTextVNode('foo', 'foo')}
            {['1', '2']}
          </div>
        );

        expect(() => {
          render(errorNode, container);
        }).toThrow(
          constructInfernoError(
            'Encountered ARRAY in mount, array must be flattened, or normalize used. Location: \n>> Array(1,2)\n>> <div>\n',
          ),
        );
      });

      it('Should show only first 3 items if array is really long one', () => {
        const errorNode = (
          <div $ChildFlag={ChildFlags.HasKeyedChildren}>
            {createTextVNode('foo', 'foo')}
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
          </div>
        );

        expect(() => {
          render(errorNode, container);
        }).toThrow(
          constructInfernoError(
            'Encountered ARRAY in mount, array must be flattened, or normalize used. Location: \n>> Array(1,2,3,...)\n>> <div>\n',
          ),
        );
      });

      it('Should throw error if two duplicates is found (Component)', () => {
        const FooBar = ({ children }) => children;
        const Tester = ({ children }) => children;
        const errorNode = (
          <div>
            <FooBar key="1">2</FooBar>
            <Tester key="1">1</Tester>
          </div>
        );

        expect(() => {
          render(errorNode, container);
        }).toThrow(
          constructInfernoError(
            'Encountered two children with same key: {1}. Location: \n>> <Tester />\n>> <div>\n',
          ),
        );
      });

      it('Should print nice stack of key missing', () => {
        const FooBar = () => (
          <span className="parentNode" $HasKeyedChildren>
            <div key={'dup'} />
            {2}
            <em key={'dup'} />
          </span>
        );

        const foobar = (
          // @ts-expect-error Foobar has no children defined
          <FooBar>
            <span>1</span>
          </FooBar>
        );

        const errorNode = (
          <div>
            <span $HasVNodeChildren>{foobar}</span>
          </div>
        );

        expect(() => {
          render(errorNode, container);
        }).toThrow(
          'Encountered child without key during keyed algorithm. If this error points to Array make sure children is flat list.',
        );
      });
    });

    describe('Invalid nodes', () => {
      it('Should throw error if key is missing', () => {
        const errorNode = (
          <div $HasKeyedChildren>
            <div key="1">2</div>
            {null}
          </div>
        );

        expect(() => {
          render(errorNode, container);
        }).toThrow(
          'Encountered invalid node when preparing to keyed algorithm. Location: \n>> InvalidVNode(null)\n>> <div>',
        );
      });

      it('Should if there is one that cannot be keyed for example array', () => {
        const errorNode = (
          <div $ChildFlag={ChildFlags.HasNonKeyedChildren}>
            {createTextVNode('foo', 'foo')}
            {null}
          </div>
        );

        expect(() => {
          render(errorNode, container);
        }).toThrow(
          constructInfernoError(
            'Encountered invalid node with mixed keys. Location: \n>> InvalidVNode(null)\n>> <div>\n',
          ),
        );
      });

      it('Should support long chain of rendered nodes', () => {
        const errorNode = (
          <div className="p1">
            <div id="another">
              <div data-attr="foobar">
                <div $ChildFlag={ChildFlags.HasNonKeyedChildren}>
                  {createTextVNode('foo', 'foo')}
                  {null}
                </div>
              </div>
            </div>
          </div>
        );

        expect(() => {
          render(errorNode, container);
        }).toThrow(
          constructInfernoError(
            'Encountered invalid node with mixed keys. Location: \n>> InvalidVNode(null)\n>> <div>\n>> <div>\n>> <div>\n>> <div class="p1">\n',
          ),
        );
      });
    });
  }

  describe('Invalid Element children', () => {
    it('Input cannot have children', () => {
      expect(() => {
        render(<input>foobar</input>, container);
      }).toThrow(constructInfernoError("input elements can't have children."));
    });

    it('TextArea elements cannot have children', () => {
      expect(() => {
        render(<textarea>foobar</textarea>, container);
      }).toThrow(
        constructInfernoError("textarea elements can't have children."),
      );
    });

    it('Media elements cannot have children', () => {
      expect(() => {
        render(<media>foobar</media>, container);
      }).toThrow(constructInfernoError("media elements can't have children."));
    });

    it('< BR > elements cannot have children', () => {
      expect(() => {
        render(<br>foobar</br>, container);
      }).toThrow(constructInfernoError("br elements can't have children."));
    });

    it('< img > elements cannot have children', () => {
      expect(() => {
        render(<img>foobar</img>, container);
      }).toThrow(constructInfernoError("img elements can't have children."));
    });
  });
});
