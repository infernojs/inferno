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
        expect(() => {
          const errorNode = (
            <div $HasKeyedChildren>
              <div key="1">2</div>
              <div>1</div>
            </div>
          );
          render(errorNode, container);
        }).toThrow(
          constructInfernoError(
            'ChildFlags.HasKeyedChildren expects all children to have keys; missing key at index 1. Location: \n>> <div>\n>> <div>\n',
          ),
        );
      });

      it('Should if there is one that cannot be keyed for example array', () => {
        expect(() => {
          const errorNode = (
            <div $ChildFlag={ChildFlags.HasKeyedChildren}>
              {createTextVNode('foo', 'foo')}
              {['1', '2']}
            </div>
          );
          render(errorNode, container);
        }).toThrow(
          constructInfernoError(
            'ChildFlags.HasKeyedChildren expects children to be a flat array; found a nested array at index 1. Location: \n>> Array(1,2)\n>> <div>\n',
          ),
        );
      });

      it('Should show only first 3 items if array is really long one', () => {
        expect(() => {
          const errorNode = (
            <div $ChildFlag={ChildFlags.HasKeyedChildren}>
              {createTextVNode('foo', 'foo')}
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
            </div>
          );
          render(errorNode, container);
        }).toThrow(
          constructInfernoError(
            'ChildFlags.HasKeyedChildren expects children to be a flat array; found a nested array at index 1. Location: \n>> Array(1,2,3,...)\n>> <div>\n',
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
          'ChildFlags.HasKeyedChildren expects children to be VNodes; found text at index 1.',
        );
      });
    });

    describe('Warning invalid key type', () => {
      it('Should throw error if child key is not string or number', () => {
        const errorNode = <div>{createTextVNode('foo', {} as any)}</div>;

        expect(() => {
          render(errorNode, container);
        }).toThrow(
          constructInfernoError(
            'Encountered child vNode where key property is not string or number. Location: \n>> Text(foo)\n>> <div>\n',
          ),
        );
      });
    });

    describe('Invalid nodes', () => {
      it('Should throw error if key is missing', () => {
        expect(() => {
          const errorNode = (
            <div $HasKeyedChildren>
              <div key="1">2</div>
              {null}
            </div>
          );
          render(errorNode, container);
        }).toThrow(
          'ChildFlags.HasKeyedChildren expects children to be VNodes; found invalid child at index 1. Location:',
        );
      });

      it('Should if there is one that cannot be keyed for example array', () => {
        expect(() => {
          const errorNode = (
            <div $ChildFlag={ChildFlags.HasNonKeyedChildren}>
              {createTextVNode('foo', 'foo')}
              {null}
            </div>
          );
          render(errorNode, container);
        }).toThrow(
          constructInfernoError(
            'ChildFlags.HasNonKeyedChildren expects children to be VNodes; found invalid child at index 1. Location: \n>> InvalidVNode(null)\n>> <div>\n',
          ),
        );
      });

      it('Should support long chain of rendered nodes', () => {
        expect(() => {
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
          render(errorNode, container);
        }).toThrow(
          constructInfernoError(
            'ChildFlags.HasNonKeyedChildren expects children to be VNodes; found invalid child at index 1. Location: \n>> InvalidVNode(null)\n>> <div>\n',
          ),
        );
      });
    });

    describe('Child flag validations', () => {
      it('ChildFlags.HasInvalidChildren is not validated', () => {
        const errorNode = (
          <div $ChildFlag={ChildFlags.HasInvalidChildren}>
            <span />
          </div>
        );
        render(errorNode, container);
      });

      it('ChildFlags.HasTextChildren should throw for TextVNode children', () => {
        expect(() => {
          const errorNode = (
            <div $HasTextChildren>{createTextVNode('foo')}</div>
          );
          render(errorNode, container);
        }).toThrow(
          constructInfernoError(
            'ChildFlags.HasTextChildren expects children to be a bare string, not a Text VNode. Location: \n>> Text(foo)\n>> <div>\n',
          ),
        );
      });

      it('ChildFlags.HasTextChildren should throw for non-string children', () => {
        expect(() => {
          const errorNode = <div $HasTextChildren>{{a: 1}}</div>;
          render(errorNode, container);
        }).toThrow(
          constructInfernoError(
            'ChildFlags.HasTextChildren expects children to be a string. Location: \n>> Object({"a":1})\n>> <div>\n',
          ),
        );
      });

      it('ChildFlags.HasTextChildren should accept string children', () => {
        expect(() => {
          render(<div $HasTextChildren>{'foo'}</div>, container);
        }).not.toThrow();
      });

      it('ChildFlags.HasTextChildren should accept number (text) children', () => {
        expect(() => {
          render(<div $HasTextChildren>1</div>, container);

          expect(container.innerHTML).toBe("<div>1</div>")
        }).not.toThrow();
      });

      it('ChildFlags.HasTextChildren should accept number (number) children', () => {
        expect(() => {
          render(<div $HasTextChildren>{1}</div>, container);

          expect(container.innerHTML).toBe("<div>1</div>")
        }).not.toThrow();
      });

      it('ChildFlags.HasVNodeChildren should not throw for TextVNode children', () => {
        const errorNode = (
          <div $HasVNodeChildren>{createTextVNode('foo')}</div>
        );
        render(errorNode, container);
      });

      it('ChildFlags.HasVNodeChildren should accept Element VNode children', () => {
        expect(() => {
          render(
            <div $HasVNodeChildren>
              <span>foo</span>
            </div>,
            container,
          );
        }).not.toThrow();
      });

      it('ChildFlags.HasNonKeyedChildren not should throw for keyed children its simply ignored', () => {
        const children = [<span key="a" />];
        const errorNode = (
          <div $ChildFlag={ChildFlags.HasNonKeyedChildren}>
            {children as any}
          </div>
        );
        render(errorNode, container);
      });

      it('ChildFlags.HasNonKeyedChildren should throw for holes', () => {
        // eslint-disable-next-line no-sparse-arrays
        const children = [<span />, , <span />];

        expect(() => {
          const errorNode = (
            <div $ChildFlag={ChildFlags.HasNonKeyedChildren}>
              {children as any}
            </div>
          );
          render(errorNode, container);
        }).toThrow(
          constructInfernoError(
            'ChildFlags.HasNonKeyedChildren expects children to be a flat array without holes; found a hole at index 1. Location: \n>> <div>\n',
          ),
        );
      });

      it('ChildFlags.HasNonKeyedChildren should accept array of non-keyed VNodes', () => {
        const children = [<span />, <span />];

        expect(() => {
          render(
            <div $ChildFlag={ChildFlags.HasNonKeyedChildren}>
              {children as any}
            </div>,
            container,
          );
        }).not.toThrow();
      });

      it('ChildFlags.HasKeyedChildren should accept array of keyed VNodes', () => {
        const children = [<span key="a" />, <span key="b" />];

        expect(() => {
          render(
            <div $ChildFlag={ChildFlags.HasKeyedChildren}>
              {children as any}
            </div>,
            container,
          );
        }).not.toThrow();
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
