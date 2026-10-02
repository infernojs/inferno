import { Component, render, rerender } from 'inferno';
import { createElement } from 'inferno-create-element';

describe('createTree - SVG namespace, class and attributes (JSX)', () => {
  let container: HTMLDivElement;

  beforeEach(function () {
    container = document.createElement('div');
  });

  afterEach(function () {
    render(null, container);
  });

  it('should render svg as <svg>', () => {
    render(null, container);
    render(<svg />, container);
    expect(container.innerHTML).toBe('<svg></svg>');
  });

  it('should use the parent namespace by default', () => {
    render(null, container);
    render(
      <svg xmlns="http://www.w3.org/2000/svg">
        <circle xmlns="http://www.w3.org/2000/svg" />
      </svg>,
      container,
    );
    expect((container.firstChild!.firstChild as SVGCircleElement).tagName).toBe(
      'circle',
    );
    expect((container.firstChild as SVGSVGElement).getAttribute('xmlns')).toBe(
      'http://www.w3.org/2000/svg',
    );

    render(null, container);
    expect(container.innerHTML).toBe('');
  });

  it('should keep parent namespace', () => {
    render(
      <svg xmlns="http://www.w3.org/2000/svg">
        <circle />
      </svg>,
      container,
    );
    expect((container.firstChild as SVGSVGElement).namespaceURI).toBe(
      'http://www.w3.org/2000/svg',
    );
    render(null, container);
    render(
      <svg width="100" height="100">
        <g>
          <circle cx="50" cy="50" r="40" stroke="green" fill="yellow" />
        </g>
        <g>
          <g>
            <circle cx="50" cy="50" r="40" stroke="green" fill="yellow" />
          </g>
        </g>
      </svg>,
      container,
    );
    expect((container.childNodes[0] as SVGSVGElement).namespaceURI).toBe(
      'http://www.w3.org/2000/svg',
    );
    expect((container.childNodes[0].childNodes[0] as SVGGElement).tagName).toBe(
      'g',
    );
    expect(
      (container.childNodes[0].childNodes[0] as SVGGElement).namespaceURI,
    ).toBe('http://www.w3.org/2000/svg');
    expect(
      (container.childNodes[0].childNodes[0].firstChild as SVGCircleElement)
        .tagName,
    ).toBe('circle');
    expect(
      (container.childNodes[0].childNodes[0].firstChild as SVGCircleElement)
        .namespaceURI,
    ).toBe('http://www.w3.org/2000/svg');

    expect((container.childNodes[0].childNodes[1] as SVGGElement).tagName).toBe(
      'g',
    );
    expect(
      (container.childNodes[0].childNodes[1] as SVGGElement).namespaceURI,
    ).toBe('http://www.w3.org/2000/svg');
    expect(
      (container.childNodes[0].childNodes[1].firstChild as SVGGElement).tagName,
    ).toBe('g');
    expect(
      (container.childNodes[0].childNodes[1].firstChild as SVGGElement)
        .namespaceURI,
    ).toBe('http://www.w3.org/2000/svg');
    expect(
      (
        container.childNodes[0].childNodes[1].firstChild!
          .firstChild as SVGCircleElement
      ).tagName,
    ).toBe('circle');
    expect(
      (
        container.childNodes[0].childNodes[1].firstChild!
          .firstChild as SVGCircleElement
      ).namespaceURI,
    ).toBe('http://www.w3.org/2000/svg');

    render(
      <svg xmlns="http://www.w3.org/2000/svg">
        <circle />
      </svg>,
      container,
    );
    expect((container.firstChild as SVGSVGElement).namespaceURI).toBe(
      'http://www.w3.org/2000/svg',
    );
  });

  it('should keep parent namespace with xmlns attribute', () => {
    render(
      <svg xmlns="http://www.w3.org/2000/svg">
        <circle />
      </svg>,
      container,
    );
    expect((container.firstChild as SVGSVGElement).namespaceURI).toBe(
      'http://www.w3.org/2000/svg',
    );

    render(
      <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
        <g>
          <circle
            xmlns="http://www.w3.org/2000/svg"
            cx="50"
            cy="50"
            r="40"
            stroke="green"
            fill="yellow"
          />
        </g>
        <g>
          <circle
            xmlns="http://www.w3.org/2000/svg"
            cx="50"
            cy="50"
            r="40"
            stroke="green"
            fill="yellow"
            // @ts-expect-error arbitrary attribute that is not part of the SVG typings
            // eslint-disable-next-line inferno/no-unknown-property
            foo={undefined}
          />
        </g>
      </svg>,
      container,
    );
    expect((container.childNodes[0] as SVGSVGElement).namespaceURI).toBe(
      'http://www.w3.org/2000/svg',
    );
    expect((container.childNodes[0].childNodes[0] as SVGGElement).tagName).toBe(
      'g',
    );
    expect(
      (container.childNodes[0].childNodes[0] as SVGGElement).namespaceURI,
    ).toBe('http://www.w3.org/2000/svg');
    expect(
      (container.childNodes[0].childNodes[0].firstChild as SVGCircleElement)
        .tagName,
    ).toBe('circle');
    expect(
      (
        container.childNodes[0].childNodes[0].firstChild as SVGCircleElement
      ).getAttribute('xmlns'),
    ).toBe('http://www.w3.org/2000/svg');
    expect(
      (container.childNodes[0].childNodes[0].firstChild as SVGCircleElement)
        .namespaceURI,
    ).toBe('http://www.w3.org/2000/svg');

    expect((container.childNodes[0].childNodes[1] as SVGGElement).tagName).toBe(
      'g',
    );
    expect(
      (container.childNodes[0].childNodes[1] as SVGGElement).namespaceURI,
    ).toBe('http://www.w3.org/2000/svg');
    expect(
      (container.childNodes[0].childNodes[1].firstChild as SVGCircleElement)
        .tagName,
    ).toBe('circle');
    expect(
      (
        container.childNodes[0].childNodes[1].firstChild as SVGCircleElement
      ).getAttribute('xmlns'),
    ).toBe('http://www.w3.org/2000/svg');
    expect(
      (container.childNodes[0].childNodes[1].firstChild as SVGCircleElement)
        .namespaceURI,
    ).toBe('http://www.w3.org/2000/svg');
  });

  it('should set and remove dynamic class property', () => {
    const value = 'foo';

    render(<svg className={value} />, container);

    expect((container.firstChild as SVGSVGElement).tagName).toEqual('svg');
    expect((container.firstChild as SVGSVGElement).getAttribute('class')).toBe(
      'foo',
    );

    render(<svg />, container);

    expect((container.firstChild as SVGSVGElement).tagName).toEqual('svg');
    expect((container.firstChild as SVGSVGElement).hasAttribute('class')).toBe(
      false,
    );
  });

  it('should set static class attribute, update to dynamic attr, and remove', () => {
    render(<svg className={null} />, container);
    // @ts-expect-error className must be a string, the test passes an object
    render(<svg className={{}} />, container);
    render(<svg className="bar" />, container);

    expect((container.firstChild as SVGSVGElement).tagName).toEqual('svg');
    expect((container.firstChild as SVGSVGElement).getAttribute('class')).toBe(
      'bar',
    );

    const value = 'foo';

    render(<svg className={value} />, container);
    expect((container.firstChild as SVGSVGElement).tagName).toEqual('svg');
    expect((container.firstChild as SVGSVGElement).getAttribute('class')).toBe(
      'foo',
    );

    render(<svg />, container);

    expect((container.firstChild as SVGSVGElement).tagName).toEqual('svg');
    expect((container.firstChild as SVGSVGElement).hasAttribute('class')).toBe(
      false,
    );
  });

  it('should remove arbitrary SVG camel case attributes', () => {
    // @ts-expect-error arbitrary attribute that is not part of the SVG typings
    // eslint-disable-next-line inferno/no-unknown-property
    render(<svg theWord="theBird" />, container);

    expect(
      (container.firstChild as SVGSVGElement).hasAttribute('theWord'),
    ).toBe(true);
    render(<svg />, container);
    expect(
      (container.firstChild as SVGSVGElement).hasAttribute('theWord'),
    ).toBe(false);
  });

  it('should render clip-path on svg and no xlink:href on a patched-in image child', () => {
    render(<svg clip-path="0 0 110 110" />, container);

    expect((container.firstChild as SVGSVGElement).tagName).toEqual('svg');

    expect(
      (container.firstChild as SVGSVGElement).hasAttribute('clip-path'),
    ).toBe(true);

    render(
      <svg>
        <image />
      </svg>,
      container,
    );

    expect(
      (container.firstChild!.firstChild as SVGImageElement).hasAttributeNS(
        'http://www.w3.org/1999/xlink',
        'href',
      ),
    ).toBe(false);
  });

  it('Should render SVG with spread attributes', () => {
    const spread = { id: 'test' };

    render(<svg {...spread} />, container);
    expect(container.innerHTML).toBe('<svg id="test"></svg>');
  });

  describe('SVG elements', () => {
    it('Should keep SVG children flagged when parent is SVG', () => {
      interface RectState {
        className: string;
      }

      class Rect extends Component<object, RectState> {
        state: RectState;

        constructor(p: object, c: object) {
          super(p, c);
          this.state = { className: 'foo' };
        }

        componentDidMount() {
          this.setState({ className: 'bar' });
        }

        render() {
          return createElement('rect', {
            className: this.state.className,
          });
        }
      }

      render(
        <svg>
          <Rect />
        </svg>,
        container,
      );

      expect(
        (container.firstChild!.firstChild as SVGRectElement).getAttribute(
          'class',
        ),
      ).toBe('foo');

      rerender();

      expect(
        (container.firstChild!.firstChild as SVGRectElement).getAttribute(
          'class',
        ),
      ).toBe('bar');
    });
  });
});
