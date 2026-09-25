import { render } from 'inferno';
import { createElement } from 'inferno-create-element';

describe('Children - (non-JSX)', () => {
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

  const preDefined = [
    {
      name: 'undefined',
      value: undefined,
      expected: '',
    },
    {
      name: 'null',
      value: null,
      expected: '',
    },
    {
      name: 'one whitespace',
      value: ' ',
      expected: ' ',
    },
    {
      name: 'text with trailing whitespace',
      value: 'a ',
      expected: 'a ',
    },
    {
      name: 'text with leading whitespace',
      value: ' a',
      expected: ' a',
    },
    {
      name: 'empty string',
      value: '',
      expected: '',
    },
    {
      name: 'plain text',
      value: 'string',
      expected: 'string',
    },
    {
      name: '0',
      value: 0,
      expected: '0',
    },
    {
      name: '0 (cast to string)',
      value: '0',
      expected: '0',
    },
    {
      name: 'negative number',
      value: -44444,
      expected: '-44444',
    },
    {
      name: 'negative number (cast to string)',
      value: '-2344',
      expected: '-2344',
    },
    {
      name: 'NaN',
      value: NaN,
      expected: 'NaN',
    },
    {
      name: 'empty array',
      value: [],
      expected: '',
    },
    {
      name: 'simple math',
      value: 123 - 33,
      expected: '90',
    },
    {
      name: 'advanced math',
      value: 123 - 33 / 4 - 444 * 345,
      expected: '-153065.25',
    },
    {
      name: 'number array',
      value: [1, 2, 3],
      expected: '123',
    },
    {
      name: 'number array (long array)',
      value: [1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3],
      expected: '123123123123',
    },
    {
      name: 'number array (long mixed array)',
      value: [1, '2', 3, '1', 2, 3, '1', 2, 3, 1, 2, '3'],
      expected: '123123123123',
    },
    {
      name: 'number array (long mixed array) and undefined and empty string',
      value: [1, '2', '', '1', 2, 3, '1', 2, undefined, 1, 2, '3'],
      expected: '1212312123',
    },
    {
      name: 'number array (cast to string)',
      value: ['1', '2', '3'],
      expected: '123',
    },
    {
      name: 'number array (cast to string) and various whitespaces',
      value: [' 1 ', '2', '3  '],
      expected: ' 1 23  ',
    },
    {
      name: 'single undefined in an array',
      value: [1, 2, undefined],
      expected: '12',
    },
    {
      name: 'undefined in the middle of an array',
      value: [1, undefined, 3],
      expected: '13',
    },
    {
      name: 'double undefined in an array',
      value: [1, undefined, undefined],
      expected: '1',
    },
    {
      name: 'triple undefined in an array',
      value: [undefined, undefined, undefined],
      expected: '',
    },
    {
      name: 'triple empty string in an array',
      value: ['', '', ''],
      expected: '',
    },
    {
      name: 'triple null in an array',
      value: [null, null, null],
      expected: '',
    },
    {
      name: 'single null in an array',
      value: [null],
      expected: '',
    },
    {
      name: 'string "{}" in an array',
      value: ['{}'],
      expected: '{}',
    },
    {
      name: 'mix of null and undefined in an array',
      value: [null, undefined],
      expected: '',
    },
    {
      name: 'mix of null, undefined and empty string in an array',
      value: [null, undefined, ''],
      expected: '',
    },
    {
      name: 'mix of null, undefined and a number in an array',
      value: [null, undefined, 123],
      expected: '123',
    },
    {
      name: 'mix of null, undefined, a number and whitespace in an array',
      value: [null, undefined, 123, ' ', undefined, null, undefined],
      expected: '123 ',
    },
    {
      name: 'single empty string in an array',
      value: [1, 2, ''],
      expected: '12',
    },
    {
      name: 'double empty string in an array',
      value: [1, '', ''],
      expected: '1',
    },
    {
      name: 'numeric string followed by two numbers in an array',
      value: ['1', 2, 3],
      expected: '123',
    },
    {
      name: 'numeric string, number and a letter in an array',
      value: ['1', 2, 'a'],
      expected: '12a',
    },
    {
      name: 'numeric string, null and a letter in an array',
      value: ['1', null, 'a'],
      expected: '1a',
    },
    {
      name: 'undefined, null and a letter in an array',
      value: [undefined, null, 'a'],
      expected: 'a',
    },
    {
      name: 'number surrounded by undefined and null in an array',
      value: [undefined, null, 123, undefined, null],
      expected: '123',
    },
  ];

  for (const arg of preDefined) {
    it('should set static children as ' + arg.name, () => {
      render(createElement('div', null, arg.value), container);
      expect(container.firstChild.nodeType).toBe(1);
      expect(container.firstChild.textContent).toBe(arg.expected);
      render(createElement('div', null, arg.value), container);
      expect(container.firstChild.nodeType).toBe(1);
      expect(container.firstChild.textContent).toBe(arg.expected);
    });
  }

  for (const arg of preDefined) {
    it('should set static deep children as ' + arg.name, () => {
      const tmpl = () =>
        createElement('div', null, createElement('span', null, arg.value));

      render(tmpl(), container);
      expect(container.firstChild.nodeType).toBe(1);
      expect(container.firstChild.firstChild.nodeType).toBe(1);
      expect(container.firstChild.childNodes.length).toBe(1);
      expect(container.firstChild.firstChild.textContent).toBe(arg.expected);
      render(tmpl(), container);
      expect(container.firstChild.nodeType).toBe(1);
      expect(container.firstChild.firstChild.nodeType).toBe(1);
      expect(container.firstChild.childNodes.length).toBe(1);
      expect(container.firstChild.firstChild.textContent).toBe(arg.expected);
    });
  }

  for (const arg of preDefined) {
    it('should set very deep static children as ' + arg.name, () => {
      const tmpl = () =>
        createElement(
          'div',
          null,
          createElement(
            'span',
            null,
            createElement('b', null, createElement('b', null, arg.value)),
          ),
        );

      render(tmpl(), container);
      expect(container.firstChild.nodeType).toBe(1);
      expect(container.firstChild.firstChild.nodeType).toBe(1);
      expect(container.firstChild.childNodes.length).toBe(1);
      expect(container.firstChild.firstChild.textContent).toBe(arg.expected);
      render(tmpl(), container);
      expect(container.firstChild.nodeType).toBe(1);
      expect(container.firstChild.firstChild.nodeType).toBe(1);
      expect(container.firstChild.childNodes.length).toBe(1);
      expect(container.firstChild.firstChild.textContent).toBe(arg.expected);
    });
  }

  for (const arg of preDefined) {
    const template = (child?) => createElement('div', null, child);

    it(`should set dynamic children as ${arg.name}, clear and set them again`, () => {
      render(template(arg.value), container);
      expect(container.firstChild.nodeType).toBe(1);
      expect(container.firstChild.textContent).toBe(arg.expected);
      render(template(arg.value), container);
      expect(container.firstChild.nodeType).toBe(1);
      expect(container.firstChild.textContent).toBe(arg.expected);
      render(template(), container);
      expect(container.firstChild.nodeType).toBe(1);
      expect(container.firstChild.textContent).toBe('');
      render(template(arg.value), container);
      expect(container.firstChild.nodeType).toBe(1);
      expect(container.firstChild.textContent).toBe(arg.expected);
    });

    it(`should set dynamic children as ${arg.name} after rendering no children`, () => {
      render(template(), container);
      expect(container.firstChild.nodeType).toBe(1);
      expect(container.firstChild.textContent).toBe('');
      render(template(arg.value), container);
      expect(container.firstChild.nodeType).toBe(1);
      expect(container.firstChild.textContent).toBe(arg.expected);
    });

    it(`should set dynamic children as ${arg.name} after rendering null children`, () => {
      render(template(null), container);
      expect(container.firstChild.nodeType).toBe(1);
      expect(container.firstChild.textContent).toBe('');
      render(template(arg.value), container);
      expect(container.firstChild.nodeType).toBe(1);
      expect(container.firstChild.textContent).toBe(arg.expected);
    });

    it(`should set dynamic children as ${arg.name} and clear them with null`, () => {
      render(template(arg.value), container);
      expect(container.firstChild.nodeType).toBe(1);
      expect(container.firstChild.textContent).toBe(arg.expected);
      render(template(null), container);
      expect(container.firstChild.nodeType).toBe(1);
      expect(container.firstChild.textContent).toBe('');
    });
  }

  it('should keep dynamic children empty when patching no children to undefined', () => {
    const template = (child?) => createElement('div', null, child);

    render(template(), container);
    expect(container.firstChild.nodeType).toBe(1);
    expect(container.firstChild.textContent).toBe('');
    render(template(undefined), container);
    expect(container.firstChild.nodeType).toBe(1);
    expect(container.firstChild.textContent).toBe('');
  });

  it('should keep dynamic children empty when rendering null children twice', () => {
    const template = (child?) => createElement('div', null, child);

    render(template(null), container);
    expect(container.firstChild.nodeType).toBe(1);
    expect(container.firstChild.textContent).toBe('');
    render(template(null), container);
    expect(container.firstChild.nodeType).toBe(1);
    expect(container.firstChild.textContent).toBe('');
  });

  for (const arg of preDefined) {
    const template = (child?) =>
      createElement('div', null, createElement('b', null, child));

    it('should set deep dynamic children as ' + arg.name, () => {
      render(template(arg.value), container);
      expect(container.firstChild.firstChild.nodeType).toBe(1);
      expect(container.firstChild.firstChild.textContent).toBe(arg.expected);
      render(template(arg.value), container);
      expect(container.firstChild.firstChild.nodeType).toBe(1);
      expect(container.firstChild.firstChild.textContent).toBe(arg.expected);
      render(template(null), container);
      expect(container.firstChild.firstChild.nodeType).toBe(1);
      expect(container.firstChild.firstChild.textContent).toBe('');
      render(template(undefined), container);
      expect(container.firstChild.firstChild.nodeType).toBe(1);
      expect(container.firstChild.firstChild.textContent).toBe('');
      render(template(), container);
      expect(container.firstChild.firstChild.nodeType).toBe(1);
      expect(container.firstChild.firstChild.textContent).toBe('');
    });
  }
});
