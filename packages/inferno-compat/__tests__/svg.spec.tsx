import { createElement, render } from 'inferno-compat';

describe('svg', () => {
  let container: HTMLDivElement;

  beforeEach(function () {
    container = document.createElement('div');
  });

  afterEach(function () {
    render(null, container);
  });

  it('Should work with normal svg attributes', () => {
    render(
      createElement(
        'svg',
        {
          height: '16',
          width: '16',
          viewBox: '0 0 1024 1024',
        },
        [
          createElement('stop', {
            offset: 0,
            stopColor: 'white',
            stopOpacity: 0.5,
          }),
        ],
      ),
      container,
    );

    expect(
      (container.firstChild as SVGSVGElement).getAttribute('viewBox'),
    ).toBe('0 0 1024 1024');
    expect((container.firstChild as SVGSVGElement).getAttribute('height')).toBe(
      '16',
    );
    expect((container.firstChild as SVGSVGElement).getAttribute('width')).toBe(
      '16',
    );
    expect((container.firstChild!.firstChild as SVGStopElement).tagName).toBe(
      'stop',
    );
    expect(
      (container.firstChild!.firstChild as SVGStopElement).getAttribute(
        'stop-color',
      ),
    ).toBe('white');
    expect(
      (container.firstChild!.firstChild as SVGStopElement).getAttribute(
        'stop-opacity',
      ),
    ).toBe('0.5');
  });

  it('Should map fontVariant to the font-variant attribute', () => {
    render(
      createElement('svg', null, [
        createElement('text', { fontVariant: 'small-caps' }, 'Text'),
      ]),
      container,
    );

    const text = container.firstChild!.firstChild as SVGTextElement;

    expect(text.getAttribute('font-variant')).toBe('small-caps');
    expect(text.hasAttribute('fontVariant')).toBe(false);
  });

  it('Should work with namespace svg attributes', () => {
    render(
      createElement('svg', null, [
        createElement('image', {
          xlinkHref: 'http://i.imgur.com/w7GCRPb.png',
        }),
      ]),
      container,
    );

    expect((container.firstChild!.firstChild as SVGImageElement).tagName).toBe(
      'image',
    );
    expect(
      (container.firstChild!.firstChild as SVGImageElement).getAttribute(
        'xlink:href',
      ),
    ).toBe('http://i.imgur.com/w7GCRPb.png');
  });
});
