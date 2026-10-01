import { createVNode, render } from 'inferno';
import { ChildFlags, VNodeFlags } from 'inferno-vnode-flags';

// The JSX plugins lowercase some camelCase attribute names (readOnly -> readonly, autoFocus -> autofocus,
// noValidate -> novalidate, formNoValidate -> formnovalidate), while createVNode, createElement and
// hyperscript pass the name as written. Both spellings must toggle the attribute.
describe('Boolean attributes', () => {
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

  function element(type: string, props) {
    return createVNode(
      VNodeFlags.HtmlElement,
      type,
      null,
      null,
      ChildFlags.HasInvalidChildren,
      props,
    );
  }

  // [element type, attribute name, DOM property name]
  const attributes = [
    ['iframe', 'allowfullscreen', 'allowFullscreen'],
    ['input', 'autofocus', 'autofocus'],
    ['video', 'autoplay', 'autoplay'],
    ['button', 'formnovalidate', 'formNoValidate'],
    ['form', 'novalidate', 'noValidate'],
    ['input', 'readonly', 'readOnly'],
  ];

  // The camelCase names users write, [element type, prop name, attribute name]
  const camelCaseProps = [
    ['iframe', 'allowFullScreen', 'allowfullscreen'],
    ['input', 'autoFocus', 'autofocus'],
    ['video', 'autoPlay', 'autoplay'],
    ['button', 'formNoValidate', 'formnovalidate'],
    ['form', 'noValidate', 'novalidate'],
    ['input', 'readOnly', 'readonly'],
  ];

  for (const [type, name, property] of attributes) {
    it(`Should set and remove the lowercase ${name} attribute of ${type}`, () => {
      render(element(type, { [name]: true }), container);
      const dom = container.firstChild;

      expect(dom.hasAttribute(name)).toBe(true);
      expect(dom[property]).toBe(true);

      render(element(type, { [name]: false }), container);
      expect(dom.hasAttribute(name)).toBe(false);
      expect(dom[property]).toBe(false);

      render(element(type, { [name]: true }), container);
      expect(dom.hasAttribute(name)).toBe(true);

      render(element(type, {}), container);
      expect(dom.hasAttribute(name)).toBe(false);
    });

    it(`Should not add the lowercase ${name} attribute of ${type} when it is false on mount`, () => {
      render(element(type, { [name]: false }), container);
      const dom = container.firstChild;

      expect(dom.hasAttribute(name)).toBe(false);
      expect(dom[property]).toBe(false);
    });
  }

  for (const [type, prop, name] of camelCaseProps) {
    it(`Should set and remove ${name} of ${type} through the camelCase ${prop} prop`, () => {
      render(element(type, { [prop]: false }), container);
      const dom = container.firstChild;

      expect(dom.hasAttribute(name)).toBe(false);

      render(element(type, { [prop]: true }), container);
      expect(dom.hasAttribute(name)).toBe(true);

      render(element(type, { [prop]: false }), container);
      expect(dom.hasAttribute(name)).toBe(false);
    });
  }

  it('Should set and remove readOnly written in JSX', () => {
    render(<input readOnly={false} />, container);
    const input = container.firstChild;

    expect(input.hasAttribute('readonly')).toBe(false);
    expect(input.readOnly).toBe(false);

    render(<input readOnly={true} />, container);
    expect(input.hasAttribute('readonly')).toBe(true);
    expect(input.readOnly).toBe(true);

    render(<input readOnly={false} />, container);
    expect(input.hasAttribute('readonly')).toBe(false);
    expect(input.readOnly).toBe(false);
  });

  it('Should set and remove noValidate and formNoValidate written in JSX', () => {
    render(
      <form noValidate>
        <button formNoValidate={false} />
      </form>,
      container,
    );
    const form = container.firstChild;
    const button = form.firstChild;

    expect(form.hasAttribute('novalidate')).toBe(true);
    expect(form.noValidate).toBe(true);
    expect(button.hasAttribute('formnovalidate')).toBe(false);
    expect(button.formNoValidate).toBe(false);

    render(
      <form noValidate={false}>
        <button formNoValidate />
      </form>,
      container,
    );
    expect(form.hasAttribute('novalidate')).toBe(false);
    expect(form.noValidate).toBe(false);
    expect(button.hasAttribute('formnovalidate')).toBe(true);
    expect(button.formNoValidate).toBe(true);
  });

  it('Should set and remove allowFullScreen written in JSX', () => {
    render(<iframe allowFullScreen={false} />, container);
    const iframe = container.firstChild;

    expect(iframe.hasAttribute('allowfullscreen')).toBe(false);

    render(<iframe allowFullScreen />, container);
    expect(iframe.hasAttribute('allowfullscreen')).toBe(true);
  });

  it('Should set the capture attribute to a string value', () => {
    render(<input type="file" capture="environment" />, container);
    const input = container.firstChild;

    expect(input.getAttribute('capture')).toBe('environment');

    render(<input type="file" capture="user" />, container);
    expect(input.getAttribute('capture')).toBe('user');

    render(<input type="file" capture={false} />, container);
    expect(input.hasAttribute('capture')).toBe(false);

    render(<input type="file" capture />, container);
    expect(input.hasAttribute('capture')).toBe(true);
  });

  it('Should set the hidden attribute to a string value', () => {
    render(element('div', { hidden: 'until-found' }), container);
    const div = container.firstChild;

    expect(div.getAttribute('hidden')).toBe('until-found');

    render(element('div', { hidden: false }), container);
    expect(div.hasAttribute('hidden')).toBe(false);
    expect(div.hidden).toBe(false);

    render(element('div', { hidden: true }), container);
    expect(div.hasAttribute('hidden')).toBe(true);
    expect(div.hidden).toBe(true);
  });
});
