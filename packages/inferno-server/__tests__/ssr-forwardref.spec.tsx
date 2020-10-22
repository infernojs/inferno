import { Component, createRef, forwardRef, RefObject, render } from 'inferno';
import { renderToString, streamAsString, streamQueueAsString } from 'inferno-server';
import { hydrate } from 'inferno-hydrate';
import { isString } from 'inferno-shared';
import concatStream from 'concat-stream-es6';

describe('SSR -> Hydrate - Forward Ref', () => {
  let container;

  beforeEach(function () {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(function () {
    render(null, container);
    container.innerHTML = '';
    document.body.removeChild(container);
  });

  function SSRtoString(method, vNode, callback) {
    const val = method(vNode);

    if (isString(val)) {
      callback(val);
    } else {
      val.pipe(
        concatStream(function (buffer) {
          callback(buffer.toString('utf-8'));
        })
      );
    }
  }

  [renderToString, streamAsString, streamQueueAsString].forEach(function (method) {
    it('Should be possible to forward createRef', (done) => {
      const FancyButton = forwardRef((props, ref) => (
        <button ref={ref} className="FancyButton">
          {props.children}
        </button>
      ));

      expect(FancyButton.render).toBeDefined();

      class Hello extends Component {
        private readonly btn: RefObject<any>;

        constructor(props) {
          super(props);

          // You can now get a ref directly to the DOM button:
          this.btn = createRef();
        }

        public componentDidMount() {
          expect(this.btn.current).toBe(container.querySelector('button'));
        }

        public render() {
          return <FancyButton ref={this.btn}>Click me!</FancyButton>;
        }
      }

      SSRtoString(method, <Hello />, function (htmlString) {
        expect(htmlString).toBe('<button class="FancyButton">Click me!</button>');

        container.innerHTML = htmlString;

        renderToString(<Hello />);

        expect(container.innerHTML).toBe('<button class="FancyButton">Click me!</button>');

        hydrate(<Hello />, container);

        expect(container.innerHTML).toBe('<button class="FancyButton">Click me!</button>');

        done();
      });
    });

    it('Should be possible to forward callback ref', (done) => {
      const FancyButton = forwardRef((props, ref) => (
        <button ref={ref} className="FancyButton">
          {props.children}
        </button>
      ));

      expect(FancyButton.render).toBeDefined();

      class Hello extends Component {
        public render() {
          return (
            <FancyButton
              ref={(btn) => {
                if (btn) {
                  expect(btn).toBe(container.querySelector('button'));
                }
              }}
            >
              Click me!
            </FancyButton>
          );
        }
      }

      SSRtoString(method, <Hello />, function (htmlString) {
        container.innerHTML = htmlString;

        expect(container.innerHTML).toBe('<button class="FancyButton">Click me!</button>');

        hydrate(<Hello />, container);

        expect(container.innerHTML).toBe('<button class="FancyButton">Click me!</button>');

        render(null, container);

        expect(container.innerHTML).toBe('');

        done();
      });
    });

    it('Should be possible to patch forwardRef component', () => {
      const FancyButton = forwardRef((props, ref) => {
        return (
          <button ref={ref} className="FancyButton">
            {props.children}
          </button>
        );
      });

      expect(FancyButton.render).toBeDefined();

      SSRtoString(method, <FancyButton />, function (htmlString) {
        let firstVal: Element | null = null;

        container.innerHTML = htmlString;

        hydrate(
          <FancyButton
            ref={(btn) => {
              firstVal = btn;
            }}
          >
            Click me!
          </FancyButton>,
          container
        );

        expect(container.innerHTML).toBe('<button class="FancyButton">Click me!</button>');
        expect(firstVal).not.toBe(null);

        let secondVal: Element | null = null;

        render(
          <FancyButton
            ref={(btn) => {
              secondVal = btn;
            }}
          >
            Click me! 222
          </FancyButton>,
          container
        );

        expect(firstVal).toBe(null);
        expect(secondVal).not.toBe(null);

        expect(container.innerHTML).toBe('<button class="FancyButton">Click me! 222</button>');
      });
    });
  });
});
