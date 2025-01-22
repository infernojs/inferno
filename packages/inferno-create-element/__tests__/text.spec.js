import { render } from 'inferno';
import { createElement } from 'inferno-create-element';

describe('Text', () => {
  let container;

  beforeEach(function () {
    container = document.createElement('div');
  });

  afterEach(function () {
    render(null, container);
  });

  const emptyDefinitions = [
    {
      name: 'normal text',
      value: 'Hello, World!',
      expected: 'Hello, World!',
    },
    {
      name: 'number value (cast to string)',
      value: 123,
      expected: '123',
    },
    {
      name: 'number value (Addition)',
      value: 123 + 123,
      expected: '246',
    },
    {
      name: 'number value (subtraction)',
      value: 123 - 122,
      expected: '1',
    },
    {
      name: 'number value (Associative of Addition)',
      value: '(a + b) + c = a + (b + c)',
      expected: '(a + b) + c = a + (b + c)',
    },
    {
      name: 'number and text',
      value: 123 + 'Hello',
      expected: '123Hello',
    },
    {
      name: 'number',
      value: '123',
      expected: '123',
    },
    {
      name: 'math',
      value: 44 - 44 * 3 - 333,
      expected: '-421',
    },
    {
      name: 'chinese',
      value: '您好',
      expected: '您好',
    },
    {
      name: 'multiple whitespace',
      value: '         ',
      expected: '         ',
    },
    {
      name: 'multiple whitespace and single number',
      value: '         ' + 123,
      expected: '         123',
    },
    {
      name: 'empty string with whitespace',
      value: ' ',
      expected: ' ',
    },
    {
      name: 'empty string with double whitespace',
      value: '  ',
      expected: '  ',
    },
    {
      name: 'empty string with triple whitespaces',
      value: '   ',
      expected: '   ',
    },
    {
      name: 'empty string with one whitespace to left',
      value: ' a',
      expected: ' a',
    },
    {
      name: 'empty string with triple whitespaces to left',
      value: '   a',
      expected: '   a',
    },
  ];

  for (const arg of emptyDefinitions) {
    const template = () => createElement('div', null, arg.value);

    it('should create a static text node with ' + arg.name, () => {
      render(template(), container);
      expect(container.firstChild.nodeType).toBe(1);
      expect(container.childNodes.length).toBe(1);
      expect(container.firstChild.textContent).toBe(arg.expected);

      render(template(), container);
      expect(container.firstChild.nodeType).toBe(1);
      expect(container.childNodes.length).toBe(1);
      expect(container.firstChild.textContent).toBe(arg.expected);
    });

    const template2 = () => createElement('div', null, null);

    it('should create a static text node with null', () => {
      render(template2(), container);
      expect(container.firstChild.nodeType).toBe(1);
      expect(container.childNodes.length).toBe(1);
      expect(container.firstChild.textContent).toBe('');

      render(template2(), container);
      expect(container.firstChild.nodeType).toBe(1);
      expect(container.childNodes.length).toBe(1);
      expect(container.firstChild.textContent).toBe('');
    });

    const template3 = (text) => createElement('div', null, text);

    it(`should create a dynamic text node with ${arg.name} - text property 1`, () => {
      render(template3(arg.value), container);
      expect(container.firstChild.nodeType).toBe(1);
      expect(container.childNodes.length).toBe(1);
      expect(container.firstChild.textContent).toBe(arg.expected);

      render(template3(arg.value), container);
      expect(container.firstChild.nodeType).toBe(1);
      expect(container.childNodes.length).toBe(1);
      expect(container.firstChild.textContent).toBe(arg.expected);
    });

    it(`should create a dynamic text node with ${arg.name} - text property 2`, () => {
      render(template3(null), container);
      expect(container.firstChild.nodeType).toBe(1);
      expect(container.childNodes.length).toBe(1);
      expect(container.firstChild.textContent).toBe('');

      render(template3(arg.value), container);
      expect(container.firstChild.nodeType).toBe(1);
      expect(container.childNodes.length).toBe(1);
      expect(container.firstChild.textContent).toBe(arg.expected);
    });

    const template4 = (text) =>
      createElement('div', null, createElement('span', null, text));

    it(
      'should create a dynamic text node with ' +
        arg.name +
        ' - children node text',
      () => {
        render(template4(arg.value), container);
        expect(container.firstChild.nodeType).toBe(1);
        expect(container.childNodes.length).toBe(1);
        expect(container.firstChild.childNodes.length).toBe(1);
        expect(container.firstChild.firstChild.textContent).toBe(arg.expected);

        render(template4(arg.value), container);
        expect(container.firstChild.nodeType).toBe(1);
        expect(container.childNodes.length).toBe(1);
        expect(container.firstChild.childNodes.length).toBe(1);
        expect(container.firstChild.firstChild.textContent).toBe(arg.expected);
      },
    );

    const template5 = (text) => createElement('div', null, text);

    it(
      'should create a dynamic text node with ' +
        arg.name +
        ' - single child with text ',
      () => {
        render(template5(arg.value), container);
        expect(container.firstChild.nodeType).toBe(1);
        expect(container.childNodes.length).toBe(1);
        expect(container.firstChild.childNodes.length).toBe(1);
        expect(container.firstChild.textContent).toBe(arg.expected);

        render(template5(arg.value), container);
        expect(container.firstChild.nodeType).toBe(1);
        expect(container.childNodes.length).toBe(1);
        expect(container.firstChild.childNodes.length).toBe(1);
        expect(container.firstChild.textContent).toBe(arg.expected);
      },
    );

    const template6 = (text) =>
      createElement('div', null, createElement('span', null, text));

    it(
      'should create a dynamic text node with ' +
        arg.name +
        ' - deep child with text property ',
      () => {
        render(template6(arg.value), container);
        expect(container.firstChild.nodeType).toBe(1);
        expect(container.childNodes.length).toBe(1);
        expect(container.firstChild.childNodes.length).toBe(1);
        expect(container.firstChild.textContent).toBe(arg.expected);

        render(template6(arg.value), container);
        expect(container.firstChild.nodeType).toBe(1);
        expect(container.childNodes.length).toBe(1);
        expect(container.firstChild.childNodes.length).toBe(1);
        expect(container.firstChild.textContent).toBe(arg.expected);
      },
    );

    const template7 = (text) =>
      createElement(
        'div',
        null,
        createElement('span', null, createElement('b', null, text)),
      );

    it(
      'should create a dynamic text node with ' +
        arg.name +
        ' - deeper child with text property',
      () => {
        render(template7(arg.value), container);
        expect(container.firstChild.nodeType).toBe(1);
        expect(container.childNodes.length).toBe(1);
        expect(container.firstChild.childNodes.length).toBe(1);
        expect(container.firstChild.textContent).toBe(arg.expected);

        render(template7(arg.value), container);
        expect(container.firstChild.nodeType).toBe(1);
        expect(container.childNodes.length).toBe(1);
        expect(container.firstChild.childNodes.length).toBe(1);
        expect(container.firstChild.textContent).toBe(arg.expected);
      },
    );

    it(
      'should create a dynamic text node with ' +
        arg.name +
        ' - deeper child with text property',
      () => {
        render(template7(null), container);
        expect(container.firstChild.nodeType).toBe(1);
        expect(container.childNodes.length).toBe(1);
        expect(container.firstChild.childNodes.length).toBe(1);
        expect(container.firstChild.textContent).toBe('');

        render(template7(arg.value), container);
        expect(container.firstChild.nodeType).toBe(1);
        expect(container.childNodes.length).toBe(1);
        expect(container.firstChild.childNodes.length).toBe(1);
        expect(container.firstChild.textContent).toBe(arg.expected);
      },
    );

    it(
      'should create a dynamic text node with ' +
        arg.name +
        ' - deeper child with text property',
      () => {
        render(template7(arg.value), container);
        expect(container.firstChild.nodeType).toBe(1);
        expect(container.childNodes.length).toBe(1);
        expect(container.firstChild.childNodes.length).toBe(1);
        expect(container.firstChild.textContent).toBe(arg.expected);

        render(template7(null), container);
        expect(container.firstChild.nodeType).toBe(1);
        expect(container.childNodes.length).toBe(1);
        expect(container.firstChild.childNodes.length).toBe(1);
        expect(container.firstChild.textContent).toBe('');
      },
    );

    it(
      'should create a dynamic text node with ' +
        arg.name +
        ' - deeper child with text property',
      () => {
        render(template7(null), container);
        expect(container.firstChild.nodeType).toBe(1);
        expect(container.childNodes.length).toBe(1);
        expect(container.firstChild.childNodes.length).toBe(1);
        expect(container.firstChild.textContent).toBe('');

        render(template7(null), container);
        expect(container.firstChild.nodeType).toBe(1);
        expect(container.childNodes.length).toBe(1);
        expect(container.firstChild.childNodes.length).toBe(1);
        expect(container.firstChild.textContent).toBe('');
      },
    );
  }

  const multiArray = [
    {
      name: 'multiple text',
      value: ['Hello', ' World'],
      expected: 'Hello World',
      children: 2,
    },
    {
      name: 'multiple numbers (cast to string)',
      value: ['12', '3'],
      expected: '123',
      children: 2,
    },
    {
      name: 'multiple numbers',
      value: [12, 3],
      expected: '123',
      children: 2,
    },
    {
      name: 'null value',
      value: null,
      expected: '',
      children: 0,
    },
    {
      name: 'undefined value',
      value: undefined,
      expected: '',
      children: 0,
    },
    {
      name: 'empty string',
      value: '',
      expected: '',
      children: 0,
    },
    {
      name: 'string with whitespace',
      value: ' ',
      expected: ' ',
      children: 1,
    },
    {
      name: 'string as null',
      value: null,
      expected: '',
      children: 0,
    },
    {
      name: 'string as undefined',
      value: null,
      expected: '',
      children: 0,
    },
    {
      name: 'empty array',
      value: [],
      expected: '',
      children: 0,
    },
    {
      name: 'number',
      value: 123,
      expected: '123',
      children: 1,
    },
    {
      name: 'multiple numbers (Addition)',
      value: [12 + 3, 3],
      expected: '153',
      children: 2,
    },
    {
      name: 'multiple numbers (subtraction)',
      value: [12 - 3, 3],
      expected: '93',
      children: 2,
    },
    {
      name: 'multiple numbers (math)',
      value: [12 - 3 - 3 * 4 - 1],
      expected: '-4',
      children: 1,
    },
    {
      name: 'multiple numbers (mixed math)',
      value: [12 - 3, 3 * 4 - 1],
      expected: '911',
      children: 2,
    },
  ];

  for (const arg of multiArray) {
    const template1 = (textVar) => createElement('div', null, textVar);

    it('should create a children property with ' + arg.name, () => {
      render(template1(arg.value), container);
      expect(container.firstChild.nodeType).toBe(1);
      expect(container.childNodes.length).toBe(1);
      expect(container.firstChild.childNodes.length).toBe(arg.children);
      expect(container.firstChild.textContent).toBe(arg.expected);

      render(template1(arg.value), container);
      expect(container.firstChild.nodeType).toBe(1);
      expect(container.childNodes.length).toBe(1);
      expect(container.firstChild.childNodes.length).toBe(arg.children);
      expect(container.firstChild.textContent).toBe(arg.expected);
    });
  }
});
