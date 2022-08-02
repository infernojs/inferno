import { Component, createTextVNode, render } from 'inferno';
import { createContainerWithHTML, innerHTML } from 'inferno-utils';
import { hydrate } from 'inferno-hydrate';

class Comp extends Component {
  render() {
    return (
      <div>
        <div id="b1">block 1</div>
        <div id="b2">block 2</div>
        <div id="b3">block 3</div>
      </div>
    );
  }
}

class InnerNested extends Component {
  render({ children }) {
    return children;
  }
}

function Nested({ children }) {
  return children;
}

class Comp2 extends Component {
  render() {
    return (
      <div>
        <div id="b1">C 1</div>
        <div id="b2">C 2</div>
        <div id="b3">C 3</div>
      </div>
    );
  }
}

const compHtml = '<div><div id="b1">block 1</div><div id="b2">block 2</div><div id="b3">block 3</div></div>';
const compHtml2 = '<div><div id="b1">C 1</div><div id="b2">C 2</div><div id="b3">C 3</div></div>';

describe('SSR Hydration Extended - (JSX)', () => {
  [
    {
      html: '<div><div>Hello world</div></div>',
      component: <Comp />
    },
    {
      html: '<div><div>Hello world</div><div>Hello world</div><div>Hello world</div><div>Hello world</div><div>Hello world</div></div>',
      component: <Comp />
    },
    {
      html: '<div><div><div>Hello world</div></div></div>',
      component: <Comp />
    },
    {
      html: '<div><div><div>Hello world</div></div><span>Hola</span></div>',
      component: <Comp />
    },
    {
      html: '<div><span><div>Hello world</div></span><div><div id="b1">block 1</div><div id="b2">block 2</div><div id="b3">block 3</div></div></div>',
      component: <Comp />
    },
    {
      html: '<div><span><div>Hello world</div></span><div><div id="b1">block 1</div><div id="b2">block 2</div><div id="b3">block 3</div></div><span>Hola</span></div>',
      component: <Comp />
    },
    {
      html: '<div><div></div></div>',
      component: (
        <InnerNested>
          <Nested>
            <Comp />
          </Nested>
        </InnerNested>
      )
    }
  ].forEach(({ html, component }, i) => {
    it(`do test #${i + 1}`, () => {
      const container = createContainerWithHTML(html);
      hydrate(component, container);

      expect(container.innerHTML).toEqual(compHtml);
    });
  });

  it('Should hydrate correctly when CSR children is missing', () => {
    const container = createContainerWithHTML('<div> </div></div>');

    hydrate(
      <InnerNested>
        <Nested>
          <Comp2 />
        </Nested>
      </InnerNested>,
      container
    );

    expect(container.innerHTML).toEqual(compHtml2);
  });

  it('Should hydrate correctly when CSR component returns null', () => {
    const container = createContainerWithHTML('<div></div>');

    hydrate(
      <div>
        <Nested>
          <InnerNested />
        </Nested>
      </div>,
      container
    );

    expect(container.innerHTML).toEqual('<div></div>');
  });

  it('Should hydrate correctly when there are comment nodes', () => {
    const container = createContainerWithHTML('<div></div>');

    hydrate(
      <div>
        <Nested>
          <InnerNested />
        </Nested>
      </div>,
      container
    );

    expect(container.innerHTML).toEqual('<div></div>');
  });

  it('Should hydrate correctly when there are comment nodes #2', () => {
    const container = createContainerWithHTML('<div></div>');

    hydrate(
      <div>
        <Nested>
          <InnerNested>
            <p>Hello World!</p>
          </InnerNested>
        </Nested>
      </div>,
      container
    );

    expect(container.innerHTML).toEqual('<div><p>Hello World!</p></div>');
  });

  it('hasTextChildren - Should handle empty textNodes correctly Github #1137', () => {
    const container = createContainerWithHTML('<span class="error"></span>');

    const vNode = <span className="error">{''}</span>;

    expect(vNode.children).toEqual('');

    hydrate(vNode, container); // This should create empty text node

    render(<span className="error">{'Okay!'}</span>, container);

    expect(container.textContent).toBe('Okay!');
  });

  it('hasTextChildren - Should handle empty textNodes correctly Github #1137 variation#2', () => {
    const container = createContainerWithHTML('<div><span class="error"></span></div>');

    const vNode = (
      <div>
        <span className="error">{''}</span>
      </div>
    );

    expect(vNode.children.children).toEqual('');

    hydrate(vNode, container); // This should create empty text node

    render(
      <div>
        <span className="error">{'Okay!'}</span>
      </div>,
      container
    );

    expect(container.textContent).toBe('Okay!');
  });

  it('createTextVNode - Should handle empty textNodes correctly Github #1137 variation#3', () => {
    const container = createContainerWithHTML('<span class="error"></span>');

    const vNode = <span className="error">{createTextVNode('')}</span>;

    hydrate(vNode, container); // This should create empty text node

    expect(container.firstChild.firstChild).not.toBeNull();

    render(<span className="error">{'Okay!'}</span>, container);

    expect(container.textContent).toBe('Okay!');
  });

  it('createTextVNode - Should handle empty textNodes correctly Github #1137 variation#4', () => {
    const container = createContainerWithHTML('<div><span class="error"></span></div>');

    const vNode = (
      <div>
        <span className="error">{createTextVNode('')}</span>
      </div>
    );

    hydrate(vNode, container); // This should create empty text node

    expect(container.firstChild.firstChild.firstChild).not.toBeNull();

    render(
      <div>
        <span className="error">{'Okay!'}</span>
      </div>,
      container
    );

    expect(container.textContent).toBe('Okay!');
  });
});
