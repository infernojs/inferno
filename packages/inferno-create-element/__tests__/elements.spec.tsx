import { type Inferno, type InfernoNode, render, createVNode } from 'inferno';
import { createElement } from 'inferno-create-element';
import { VNodeFlags } from 'inferno-vnode-flags';

describe('Elements (JSX)', () => {
  let container: HTMLDivElement;

  beforeEach(function () {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(function () {
    render(null, container);
    container.innerHTML = '';
    document.body.removeChild(container);
  });

  it('should render a simple div', () => {
    render(<div />, container);
    expect(container.firstChild!.nodeName).toBe('DIV');
    render(<div />, container);
    expect(container.firstChild!.nodeName).toBe('DIV');
  });

  it('should render a simple div with multiple children', () => {
    render(
      <div>
        <span />
      </div>,
      container,
    );
    expect(container.firstChild!.nodeName).toBe('DIV');
    expect(container.firstChild!.childNodes.length).toBe(1);
    expect(container.firstChild!.firstChild!.nodeName).toBe('SPAN');
    render(
      <div>
        <span />
      </div>,
      container,
    );
    expect(container.firstChild!.nodeName).toBe('DIV');
    expect(container.firstChild!.childNodes.length).toBe(1);
    expect(container.firstChild!.firstChild!.nodeName).toBe('SPAN');
    render(<div />, container);
    expect(container.firstChild!.nodeName).toBe('DIV');
    expect(container.firstChild!.childNodes.length).toBe(0);
    render(
      <div>
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>,
      container,
    );
    expect(container.firstChild!.nodeName).toBe('DIV');
    expect(container.firstChild!.childNodes.length).toBe(5);
    expect(container.firstChild!.firstChild!.nodeName).toBe('SPAN');

    render(
      <div>
        <span />
        <span />
        <span />
      </div>,
      container,
    );
    expect(container.firstChild!.nodeName).toBe('DIV');
    expect(container.firstChild!.childNodes.length).toBe(3);
    expect(container.firstChild!.firstChild!.nodeName).toBe('SPAN');
    render(undefined, container);
    render(
      <div>
        <span />
        <b>Hello, World!</b>
        <span />
      </div>,
      container,
    );
    expect(container.firstChild!.nodeName).toBe('DIV');
    expect(container.firstChild!.childNodes.length).toBe(3);
    expect(container.firstChild!.firstChild!.nodeName).toBe('SPAN');
  });

  it('should render a div with a text child followed by a number array and update the array', () => {
    const items = [1, 2, 3];
    const header = 'Hello ';

    render(
      <div>
        {header}
        {items}
      </div>,
      container,
    );
    expect((container.firstChild as Element).innerHTML).toBe('Hello 123');

    render(
      <div>
        {header}
        {[4, 5, 6]}
      </div>,
      container,
    );
    expect((container.firstChild as Element).innerHTML).toBe('Hello 456');
  });

  it('should render a simple div with dynamic id attribute', () => {
    render(<div id={'hello'} />, container);
    expect(container.firstChild!.nodeName).toBe('DIV');
    expect(container.firstChild!.childNodes.length).toBe(0);
    expect((container.firstChild as Element).getAttribute('id')).toBe('hello');

    render(<div id={null} />, container);
    expect(container.firstChild!.nodeName).toBe('DIV');
    expect(container.firstChild!.childNodes.length).toBe(0);
    expect((container.firstChild as Element).getAttribute('id')).toBe(null);

    render(<div className={'hello'} />, container);
    expect(container.firstChild!.nodeName).toBe('DIV');
    expect(container.firstChild!.childNodes.length).toBe(0);
    expect((container.firstChild as Element).getAttribute('class')).toBe(
      'hello',
    ); // class attribute exist!

    render(<div id="hello" />, container);
    expect(container.firstChild!.nodeName).toBe('DIV');
    expect(container.firstChild!.childNodes.length).toBe(0);
    expect((container.firstChild as Element).getAttribute('id')).toBe('hello');

    // unset
    render(null, container);
    expect(container.nodeName).toBe('DIV');
    expect(container.childNodes.length).toBe(0);
  });

  it('should render a simple div with various dynamic attributes', () => {
    render(<div id={'hello'} />, container);
    expect(container.firstChild!.nodeName).toBe('DIV');
    expect(container.firstChild!.childNodes.length).toBe(0);
    expect((container.firstChild as Element).getAttribute('id')).toBe('hello');

    render(<div />, container);
    expect(container.firstChild!.nodeName).toBe('DIV');
    expect(container.firstChild!.childNodes.length).toBe(0);

    render(<div className={'hello'} />, container);
    expect(container.firstChild!.nodeName).toBe('DIV');
    expect(container.firstChild!.childNodes.length).toBe(0);
    expect((container.firstChild as Element).getAttribute('class')).toBe(
      'hello',
    );

    render(null, container);
    expect(container.nodeName).toBe('DIV');
    expect(container.childNodes.length).toBe(0);
    expect(container.innerHTML).toBe('');
  });

  it('should render a simple div with dynamic span child', () => {
    const child = <span />;

    render(<div>{undefined}</div>, container);
    render(<div>{child}</div>, container);
    expect(container.firstChild!.nodeName).toBe('DIV');
    expect(container.firstChild!.childNodes.length).toBe(1);
    expect(container.firstChild!.firstChild!.nodeName).toBe('SPAN');
    render(<div>{null}</div>, container);
    render(<div>{child}</div>, container);
    expect(container.firstChild!.nodeName).toBe('DIV');
    expect(container.firstChild!.childNodes.length).toBe(1);
    expect(container.firstChild!.firstChild!.nodeName).toBe('SPAN');
    // unset
    render(null, container);
    expect(container.nodeName).toBe('DIV');
    expect(container.childNodes.length).toBe(0);
    expect(container.innerHTML).toBe('');
  });

  it('should render a advanced div with static child and dynamic attributes', () => {
    let attrs: string | null | undefined;

    attrs = 'id#1';

    render(
      <div>
        <div id={attrs} />
      </div>,
      container,
    );
    expect(container.firstChild!.nodeName).toBe('DIV');
    expect(container.firstChild!.childNodes.length).toBe(1);
    expect(container.firstChild!.firstChild!.nodeName).toBe('DIV');
    expect(
      (container.firstChild!.firstChild as Element).getAttribute('id'),
    ).toBe('id#1');

    attrs = null;

    render(
      <div>
        <div id={attrs} />
      </div>,
      container,
    );
    expect(container.firstChild!.nodeName).toBe('DIV');
    expect(container.firstChild!.childNodes.length).toBe(1);
    expect(container.firstChild!.firstChild!.nodeName).toBe('DIV');
    expect(
      (container.firstChild!.firstChild as Element).getAttribute('id'),
    ).toBe(null);

    attrs = undefined;

    render(<div id={attrs} />, container);
    expect(container.firstChild!.nodeName).toBe('DIV');
    expect(container.firstChild!.childNodes.length).toBe(0);
    expect((container.firstChild as Element).getAttribute('id')).toBe(null);

    attrs = 'id#4';

    render(
      <div>
        <div id={attrs} />
      </div>,
      container,
    );
    expect(container.firstChild!.nodeName).toBe('DIV');
    expect(container.firstChild!.childNodes.length).toBe(1);
    expect(container.firstChild!.firstChild!.nodeName).toBe('DIV');
    expect(
      (container.firstChild!.firstChild as Element).getAttribute('id'),
    ).toBe('id#4');

    // @ts-expect-error a numeric id is rendered as a string
    attrs = 13 - (44 * 4) / 4;

    // @ts-expect-error a numeric className is rendered as a string
    let b = <b className={123}>Hello, World!</b>;
    // @ts-expect-error unknown element
    let n = <n>{b}</n>;

    render(
      <div className="Hello, World!">
        <span>
          <div id={attrs}>{n}</div>
        </span>
      </div>,
      container,
    );
    expect(container.firstChild!.nodeName).toBe('DIV');
    expect((container.firstChild as Element).getAttribute('class')).toBe(
      'Hello, World!',
    );
    expect(container.firstChild!.childNodes.length).toBe(1);
    expect(container.firstChild!.firstChild!.nodeName).toBe('SPAN');
    expect(container.firstChild!.firstChild!.firstChild!.nodeName).toBe('DIV');
    expect(
      (container.firstChild!.firstChild!.firstChild as Element).getAttribute(
        'id',
      ),
    ).toBe('-31');
    expect(
      container.firstChild!.firstChild!.firstChild!.firstChild!.nodeName,
    ).toBe('N');
    expect(
      container.firstChild!.firstChild!.firstChild!.firstChild!.firstChild!
        .nodeName,
    ).toBe('B');
    expect(
      (
        container.firstChild!.firstChild!.firstChild!.firstChild!
          .firstChild as Element
      ).innerHTML,
    ).toBe('Hello, World!');
    expect(
      (
        container.firstChild!.firstChild!.firstChild!.firstChild!
          .firstChild as Element
      ).getAttribute('class'),
    ).toBe('123');

    // @ts-expect-error a numeric id is rendered as a string
    attrs = 13 - (44 * 4) / 4;

    // @ts-expect-error a numeric className is rendered as a string
    b = <b className={1243}>Hello, World!</b>;
    // @ts-expect-error unknown element
    n = <n>{b}</n>;

    render(
      <div className="Hello, World!">
        <span>
          <div id={attrs}>{n}</div>
        </span>
      </div>,
      container,
    );
    expect(container.firstChild!.nodeName).toBe('DIV');
    expect((container.firstChild as Element).getAttribute('class')).toBe(
      'Hello, World!',
    );
    expect(container.firstChild!.childNodes.length).toBe(1);
    expect(container.firstChild!.firstChild!.nodeName).toBe('SPAN');
    expect(container.firstChild!.firstChild!.firstChild!.nodeName).toBe('DIV');
    expect(
      (container.firstChild!.firstChild!.firstChild as Element).getAttribute(
        'id',
      ),
    ).toBe('-31');
    expect(
      container.firstChild!.firstChild!.firstChild!.firstChild!.nodeName,
    ).toBe('N');
    expect(
      container.firstChild!.firstChild!.firstChild!.firstChild!.firstChild!
        .nodeName,
    ).toBe('B');
    expect(
      (
        container.firstChild!.firstChild!.firstChild!.firstChild!
          .firstChild as Element
      ).innerHTML,
    ).toBe('Hello, World!');
    expect(
      (
        container.firstChild!.firstChild!.firstChild!.firstChild!
          .firstChild as Element
      ).getAttribute('class'),
    ).toBe('1243');

    // unset
    render(null, container);
    expect(container.nodeName).toBe('DIV');
    expect(container.childNodes.length).toBe(0);

    attrs = 'id#444';

    render(
      <div className="Hello, Dominic" id={attrs}>
        <div id={attrs} />
      </div>,
      container,
    );
    expect(container.firstChild!.nodeName).toBe('DIV');
    expect(container.firstChild!.childNodes.length).toBe(1);
    expect(container.firstChild!.firstChild!.nodeName).toBe('DIV');
    expect((container.firstChild as Element).getAttribute('class')).toBe(
      'Hello, Dominic',
    );
    expect((container.firstChild as Element).getAttribute('id')).toBe('id#444');
    expect(
      (container.firstChild!.firstChild as Element).getAttribute('id'),
    ).toBe('id#444');

    // @ts-expect-error string minus number gives NaN on purpose
    attrs = 'id#' + 333 - 333 / 3;

    render(
      <div className="Hello, Dominic" id={attrs}>
        <div id={attrs} />
      </div>,
      container,
    );
    expect(container.firstChild!.nodeName).toBe('DIV');
    expect(container.firstChild!.childNodes.length).toBe(1);
    expect(container.firstChild!.firstChild!.nodeName).toBe('DIV');
    expect((container.firstChild as Element).getAttribute('class')).toBe(
      'Hello, Dominic',
    );
    expect((container.firstChild as Element).getAttribute('id')).toBe('NaN');
    expect(
      (container.firstChild!.firstChild as Element).getAttribute('id'),
    ).toBe('NaN');

    // unset
    render(null, container);
    expect(container.nodeName).toBe('DIV');
    expect(container.childNodes.length).toBe(0);
  });

  it('should render a simple div with dynamic span child and update to div child', () => {
    let child = <span />;

    render(<div>{child}</div>, container);
    expect(container.firstChild!.nodeName).toBe('DIV');
    expect(container.firstChild!.childNodes.length).toBe(1);
    expect(container.firstChild!.firstChild!.nodeName).toBe('SPAN');

    render(<div />, container);

    child = <div />;

    render(<div>{child}</div>, container);
    expect(container.firstChild!.nodeName).toBe('DIV');
    expect(container.firstChild!.childNodes.length).toBe(1);
    expect(container.firstChild!.firstChild!.nodeName).toBe('DIV');

    child = (
      <div>
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
      </div>
    );

    render(<div>{child}</div>, container);
    expect(container.firstChild!.nodeName).toBe('DIV');
    expect(container.firstChild!.firstChild!.childNodes.length).toBe(9);
    expect(container.firstChild!.firstChild!.nodeName).toBe('DIV');
    expect(container.firstChild!.firstChild!.firstChild!.nodeName).toBe('DIV');
    child = <div>Hello, World!</div>;

    render(<div>{child}</div>, container);
    expect(container.firstChild!.firstChild!.nodeName).toBe('DIV');
    expect(container.firstChild!.firstChild!.childNodes.length).toBe(1);
    expect(container.firstChild!.firstChild!.nodeName).toBe('DIV');
    expect((container.firstChild!.firstChild as Element).innerHTML).toBe(
      'Hello, World!',
    );

    render(<div>{null}</div>, container);
    expect(container.firstChild!.nodeName).toBe('DIV');

    render(<div />, container);
    expect(container.firstChild!.nodeName).toBe('DIV');
  });

  it('should render and unset a simple div with dynamic span child', () => {
    let child;

    child = (
      <span>
        <span />
        <span />
      </span>
    );

    render(<div>{child}</div>, container);
    expect(container.firstChild!.nodeName).toBe('DIV');
    expect(container.firstChild!.firstChild!.childNodes.length).toBe(2);
    expect(container.firstChild!.firstChild!.nodeName).toBe('SPAN');
    expect(container.firstChild!.firstChild!.firstChild!.nodeName).toBe('SPAN');

    render(<div>{null}</div>, container);
    expect(container.firstChild!.nodeName).toBe('DIV');

    const divs = <div />;

    child = (
      <span>
        <span>{divs}</span>
      </span>
    );

    render(<div>{child}</div>, container);
    expect(container.firstChild!.nodeName).toBe('DIV');
    expect(container.firstChild!.childNodes.length).toBe(1);
    expect(container.firstChild!.firstChild!.nodeName).toBe('SPAN');
    expect(container.firstChild!.firstChild!.firstChild!.nodeName).toBe('SPAN');
    expect(
      container.firstChild!.firstChild!.firstChild!.firstChild!.nodeName,
    ).toBe('DIV');
  });

  it('should render a simple div children set to undefined', () => {
    render(<div>{undefined}</div>, container);

    expect(container.nodeName).toBe('DIV');
    expect(container.firstChild!.textContent).toBe('');

    render(<div>{undefined}</div>, container);

    expect(container.nodeName).toBe('DIV');
    expect(container.firstChild!.textContent).toBe('');
  });

  it('should render a simple div children set to null', () => {
    render(<div>{null}</div>, container);

    expect(container.nodeName).toBe('DIV');
    expect(container.firstChild!.textContent).toBe('');

    render(<div>{null}</div>, container);

    expect(container.nodeName).toBe('DIV');
    expect(container.firstChild!.textContent).toBe('');

    // unset
    render(null, container);
    expect(container.nodeName).toBe('DIV');
    expect(container.childNodes.length).toBe(0);
  });

  it('should render a nested div with children set to null', () => {
    render(
      <div>
        <div>{null}</div>
      </div>,
      container,
    );

    expect(container.nodeName).toBe('DIV');
    expect(container.firstChild!.firstChild!.textContent).toBe('');

    render(
      <div>
        <div>{null}</div>
      </div>,
      container,
    );

    expect(container.nodeName).toBe('DIV');
    expect(container.firstChild!.firstChild!.textContent).toBe('');
  });

  it('should render a double div and a text node', () => {
    render(<div>{<div>Hello, World!</div>}</div>, container);

    expect(container.nodeName).toBe('DIV');
    expect(container.firstChild!.nodeName).toBe('DIV');
    expect(container.firstChild!.textContent).toBe('Hello, World!');

    render(<div>{null}</div>, container);

    render(<div>{<div>Hello, Inferno!</div>}</div>, container);

    expect(container.nodeName).toBe('DIV');
    expect(container.firstChild!.nodeName).toBe('DIV');
    expect(container.firstChild!.textContent).toBe('Hello, Inferno!');
  });

  it('should render a div with two empty span children', () => {
    render(
      <div>
        <span />
        <span />
      </div>,
      container,
    );

    expect(container.nodeName).toBe('DIV');
    expect(container.firstChild!.nodeName).toBe('DIV');
    expect(container.firstChild!.textContent).toBe('');

    // unset
    render(null, container);
    expect(container.nodeName).toBe('DIV');
    expect(container.childNodes.length).toBe(0);
  });

  it('should render a simple div with a text node', () => {
    render(<div>Hello, world!</div>, container);

    expect(container.nodeName).toBe('DIV');
    expect(container.firstChild!.textContent).toBe('Hello, world!');

    render(<div>Hello, world! 2</div>, container);

    expect(container.nodeName).toBe('DIV');
    expect(container.firstChild!.textContent).toBe('Hello, world! 2');
  });

  it('should render a simple div with attributes', () => {
    // @ts-expect-error a numeric id is rendered as a string
    render(<div id={123}>Hello, world!</div>, container);

    expect(container.nodeName).toBe('DIV');
    expect((container.firstChild as Element).getAttribute('id')).toBe('123');
    expect(container.firstChild!.textContent).toBe('Hello, world!');

    render(<div id={'foo'}>Hello, world! 2</div>, container);

    expect(container.nodeName).toBe('DIV');
    expect((container.firstChild as Element).getAttribute('id')).toBe('foo');
    expect(container.firstChild!.textContent).toBe('Hello, world! 2');
  });

  it('should render a simple div with inline style', () => {
    render(
      <div style="background-color:lightgrey;">Hello, world!</div>,
      container,
    );

    expect(container.nodeName).toBe('DIV');

    render(<div id={'foo'}>Hello, world! 2</div>, container);

    expect(container.nodeName).toBe('DIV');

    // unset
    render(null, container);
    expect(container.nodeName).toBe('DIV');
    expect(container.childNodes.length).toBe(0);
  });

  it('should render "className" attribute', () => {
    render(<div className="123" />, container);
    expect((container.firstChild as Element).getAttribute('class')).toEqual(
      '123',
    );

    render(<div className={null} />, container);
    expect((container.firstChild as Element).className).toEqual('');

    render(<div className={undefined} />, container);
    expect((container.firstChild as Element).className).toEqual('');

    render(<div className="Inferno rocks!" />, container);
    expect((container.firstChild as Element).className).toEqual(
      'Inferno rocks!',
    );
    expect((container.firstChild as Element).innerHTML).toBe('');
  });

  it("shouldn't render null value", () => {
    // @ts-expect-error unknown attribute
    render(<input values={null} />, container);

    // @ts-expect-error a div has no value property
    expect(container.value).toBe(undefined);
    expect(container.innerHTML).toBe('<input>');

    // @ts-expect-error unknown attribute
    render(<input values={undefined} />, container);
    // @ts-expect-error a div has no value property
    expect(container.value).toBe(undefined);

    // @ts-expect-error unknown attribute
    render(<input values={null} />, container);
    // @ts-expect-error a div has no value property
    expect(container.value).toBe(undefined);

    expect(container.innerHTML).toBe('<input>');

    render(null, container);
    expect(container.nodeName).toBe('DIV');
    expect(container.childNodes.length).toBe(0);
  });

  it('should set values as properties by default', () => {
    render(<input title="Tip!" />, container);

    expect((container.firstChild as Element).getAttribute('title')).toEqual(
      'Tip!',
    );
    expect(container.innerHTML).toBe('<input title="Tip!">');

    render(<input name="Tip!" />, container);

    expect((container.firstChild as Element).getAttribute('name')).toEqual(
      'Tip!',
    );
    expect(container.innerHTML).toBe('<input name="Tip!">');

    render(<input title="Tip!" />, container);

    expect((container.firstChild as Element).getAttribute('title')).toEqual(
      'Tip!',
    );
    expect(container.innerHTML).toBe('<input title="Tip!">');
  });

  it('should render a simple div with dynamic values and props', () => {
    const val1 = 'Inferno';
    const val2 = 'Sucks!';

    render(
      <div className="foo">
        <span className="bar">{val1}</span>
        <span className="yar">{val2}</span>
      </div>,
      container,
    );

    expect(container.firstChild!.nodeName).toBe('DIV');
    expect(container.childNodes.length).toBe(1);
    expect(
      (container.childNodes[0].childNodes[0] as Element).getAttribute('class'),
    ).toEqual('bar');
    expect(container.childNodes[0].childNodes[0].textContent).toEqual(
      'Inferno',
    );
    expect(
      (container.childNodes[0].childNodes[1] as Element).getAttribute('class'),
    ).toEqual('yar');
    expect(container.childNodes[0].childNodes[1].textContent).toEqual('Sucks!');

    render(
      <div className="fooo">
        <span className="bar">{val1}</span>
        <span className="yar">{val2}</span>
      </div>,
      container,
    );

    expect(container.firstChild!.nodeName).toBe('DIV');
    expect(container.childNodes.length).toBe(1);
    expect(
      (container.childNodes[0].childNodes[0] as Element).getAttribute('class'),
    ).toEqual('bar');
    expect(container.childNodes[0].childNodes[0].textContent).toEqual(
      'Inferno',
    );
    expect(
      (container.childNodes[0].childNodes[1] as Element).getAttribute('class'),
    ).toEqual('yar');
    expect(container.childNodes[0].childNodes[1].textContent).toEqual('Sucks!');
  });

  it('should properly render a input with download attribute', () => {
    let val1: string;

    val1 = 'false';

    // @ts-expect-error download is not an input attribute
    // eslint-disable-next-line inferno/no-unknown-property
    render(<input download={val1} />, container);

    expect(container.firstChild!.nodeName).toBe('INPUT');
    expect(container.childNodes.length).toBe(1);
    expect((container.firstChild as Element).getAttribute('download')).toBe(
      'false',
    );

    val1 = 'true';

    // @ts-expect-error download is not an input attribute
    // eslint-disable-next-line inferno/no-unknown-property
    render(<input download={val1} />, container);

    expect(container.firstChild!.nodeName).toBe('INPUT');
    expect(container.childNodes.length).toBe(1);
    expect((container.firstChild as Element).getAttribute('download')).toBe(
      'true',
    );
  });

  it('should properly render "className" property on a custom element', () => {
    // @ts-expect-error custom element, not declared in JSX.IntrinsicElements
    render(<custom-elem className="Hello, world!" />, container);

    expect(container.firstChild!.nodeName).toBe('CUSTOM-ELEM');
    expect(container.childNodes.length).toBe(1);
    expect((container.firstChild as Element).getAttribute('class')).toBe(
      'Hello, world!',
    );

    // @ts-expect-error custom element, not declared in JSX.IntrinsicElements
    render(<custom-elem className="Hello, world!" />, container);

    expect(container.firstChild!.nodeName).toBe('CUSTOM-ELEM');
    expect(container.childNodes.length).toBe(1);
    expect((container.firstChild as Element).getAttribute('class')).toBe(
      'Hello, world!',
    );
  });

  it('should properly render "width" and "height" attributes', () => {
    render(<img src="" alt="Smiley face" height={42} width={42} />, container);

    expect(container.firstChild!.nodeName).toBe('IMG');
    expect(container.childNodes.length).toBe(1);
    expect((container.firstChild as Element).getAttribute('src')).toBe('');
    expect((container.firstChild as Element).getAttribute('alt')).toBe(
      'Smiley face',
    );
    expect((container.firstChild as Element).getAttribute('height')).toBe('42');
    expect((container.firstChild as Element).getAttribute('width')).toBe('42');

    render(
      // @ts-expect-error unknown attribute
      // eslint-disable-next-line inferno/no-unknown-property
      <img src="" alt="Smiley face" height={42} width={42} fooBar={[]} />,
      container,
    );

    expect(container.firstChild!.nodeName).toBe('IMG');
    expect(container.childNodes.length).toBe(1);
    expect((container.firstChild as Element).getAttribute('src')).toBe('');
    expect((container.firstChild as Element).getAttribute('alt')).toBe(
      'Smiley face',
    );
    expect((container.firstChild as Element).getAttribute('height')).toBe('42');
    expect((container.firstChild as Element).getAttribute('width')).toBe('42');
  });

  it('should properly render "multiple" and "capture" attributes on a file input', () => {
    render(
      <input
        type="file"
        // @ts-expect-error string value for a boolean attribute
        multiple="multiple"
        // @ts-expect-error string value for the capture attribute
        capture="capture"
        accept="image/*"
      />,
      container,
    );

    expect(container.firstChild!.nodeName).toBe('INPUT');
    expect(container.childNodes.length).toBe(1);
    expect((container.firstChild as Element).getAttribute('type')).toBe('file');

    let multipleValue = (container.firstChild as HTMLInputElement).multiple;

    // Inferno sets multiple using dom property always to boolean,
    // but some browsers fe. IE9 still set it as multiple="multiple" which also works as expected
    if (typeof multipleValue === 'string') {
      expect(multipleValue).toBe('multiple');
    } else {
      expect(multipleValue).toBe(true);
    }

    expect((container.firstChild as Element).getAttribute('capture')).toBe(
      'capture',
    );
    // expect(container.firstChild.getAttribute('accept')).toBe('image/*');

    render(
      <input
        type="file"
        // @ts-expect-error string value for a boolean attribute
        multiple="multiple"
        // @ts-expect-error string value for the capture attribute
        capture="capture"
        accept="image/*"
      />,
      container,
    );

    expect(container.firstChild!.nodeName).toBe('INPUT');
    expect(container.childNodes.length).toBe(1);
    expect((container.firstChild as Element).getAttribute('type')).toBe('file');

    multipleValue = (container.firstChild as HTMLInputElement).multiple;

    // Inferno sets multiple using dom property always to boolean,
    // but some browsers fe. IE9 still set it as multiple="multiple" which also works as expected
    if (typeof multipleValue === 'string') {
      expect(multipleValue).toBe('multiple');
    } else {
      expect(multipleValue).toBe(true);
    }

    expect((container.firstChild as Element).getAttribute('capture')).toBe(
      'capture',
    );
    // expect(container.firstChild.getAttribute('accept')).toBe('image/*');
  });

  it('should handle className', () => {
    render(<div className={'foo'} />, container);
    expect((container.firstChild as Element).className).toBe('foo');
    render(<div className={'bar'} />, container);
    expect((container.firstChild as Element).className).toBe('bar');
    render(<div className={null} />, container);
    expect((container.firstChild as Element).className).toBe('');
    render(<div className={undefined} />, container);
    expect((container.firstChild as Element).className).toBe('');
    render(<svg className={'fooBar'} />, container);
    expect((container.firstChild as Element).getAttribute('class')).toBe(
      'fooBar',
    );
  });

  it('should remove attributes', () => {
    render(<img height="17" />, container);
    expect((container.firstChild as Element).hasAttribute('height')).toBe(true);
    render(<img />, container);
    expect((container.firstChild as Element).hasAttribute('height')).toBe(
      false,
    );
    render(<img height={null} />, container);
    expect((container.firstChild as Element).hasAttribute('height')).toBe(
      false,
    );
  });

  it('should remove className from div and svg elements', () => {
    render(<div className="monkey" />, container);
    expect((container.firstChild as Element).getAttribute('class')).toBe(
      'monkey',
    );
    render(<div />, container);
    expect((container.firstChild as Element).className).toBe('');
    render(<svg className="monkey" />, container);
    expect((container.firstChild as Element).getAttribute('class')).toBe(
      'monkey',
    );
    render(<svg />, container);
    expect((container.firstChild as Element).getAttribute('class')).toBe(null);
  });

  it('should not update when switching between null/undefined', () => {
    render(<div id={null} />, container);
    // @ts-expect-error a numeric id is rendered as a string
    render(<div id={123} />, container);
    render(<div id={null} />, container);
    render(<div id={undefined} />, container);
    render(<div />, container);
    render(<div id="ltr" />, container);
    // @ts-expect-error an array id
    render(<div id={[]} />, container);
  });

  it('should render an iframe', () => {
    render(<iframe src="http://infernojs.org" />, container);
    expect((container.firstChild as HTMLIFrameElement).contentWindow).not.toBe(
      undefined,
    );
  });

  it('should dangerously set innerHTML', () => {
    render(
      <div dangerouslySetInnerHTML={{ __html: 'Hello world!' }} />,
      container,
    );
    expect(container.innerHTML).toBe('<div>Hello world!</div>');
  });

  it('Should not dangerously set innerHTML when previous is same as new one', () => {
    render(<div dangerouslySetInnerHTML={{ __html: 'same' }} />, container);
    expect(container.innerHTML).toBe('<div>same</div>');

    render(<div dangerouslySetInnerHTML={{ __html: 'same' }} />, container);
    expect(container.innerHTML).toBe('<div>same</div>');

    render(<div dangerouslySetInnerHTML={{ __html: 'change' }} />, container);
    expect(container.innerHTML).toBe('<div>change</div>');
  });

  it('Should throw error if __html property is not set', () => {
    try {
      // @ts-expect-error __html must be a string, the test checks the error
      render(<div dangerouslySetInnerHTML={{ __html: null }} />, container);
    } catch (e) {
      expect((e as Error).message).toEqual(
        'Inferno Error: dangerouslySetInnerHTML requires an object with a __html propety containing the innerHTML content.',
      );
    }
  });

  it('handles JSX spread props (including children)', () => {
    const foo = {
      children: 'Hello world!',
      className: 'lol',
    };
    const bar = {
      id: 'test',
    };

    render(<div {...foo} {...bar} />, container);
    expect(container.innerHTML).toBe(
      '<div class="lol" id="test">Hello world!</div>',
    );
  });

  it('mixing JSX with non-JSX', () => {
    render(<div>{createElement('div', null)}</div>, container);
    expect(container.innerHTML).toBe('<div><div></div></div>');
    render(<div>{createElement('span', null)}</div>, container);
    expect(container.innerHTML).toBe('<div><span></span></div>');
    render(<span>{createElement('div', null)}</span>, container);
    expect(container.innerHTML).toBe('<span><div></div></span>');
  });

  it('should be able to construct input with Hooks, Events, Attributes defined', (done) => {
    function test() {}

    const obj = {
      ref() {},
      click() {},
    };
    const bool = false;
    const newValue = 't';
    const spread = { id: 'test' };

    spyOn(obj, 'ref');
    spyOn(obj, 'click');

    render(
      <input
        type="text"
        ref={obj.ref}
        spellcheck="false"
        // @ts-expect-error string value for a boolean attribute
        readOnly={bool ? 'readonly' : false}
        disabled={bool}
        ondragenter={test}
        ondragover={test}
        value={newValue}
        oninput={test}
        onclick={obj.click}
        className="edit-field"
        onkeydown={test}
        onkeyup={test}
        onBlur={test}
        {...spread}
      />,
      container,
    );
    const input = container.querySelector<HTMLInputElement>('#test')!;
    expect(obj.click).toHaveBeenCalledTimes(0);
    expect(obj.ref).toHaveBeenCalledTimes(1); // Verify hook works
    input.click();
    setTimeout(() => {
      expect(obj.click).toHaveBeenCalledTimes(1); // Verify hook works
      done();
    }, 25);
  });

  describe('should correctly handle VNodes as quasi-immutable objects, like ReactElement does', () => {
    const a = <div>Hello world</div>;
    const b = <span>This works!</span>;
    const C = ({ children }: { children?: InfernoNode }) => {
      return (
        <div>
          {children}
          {children}
          {children}
        </div>
      );
    };

    it('should render an element vnode and then replace it with another', () => {
      render(a, container);
      expect(container.innerHTML).toBe('<div>Hello world</div>');
      render(b, container);
      expect(container.innerHTML).toBe('<span>This works!</span>');
    });

    it('should render the same element vnode three times in an array', () => {
      render(<div>{[a, a, a]}</div>, container);
      expect(container.innerHTML).toBe(
        '<div><div>Hello world</div><div>Hello world</div><div>Hello world</div></div>',
      );
      render(b, container);
      expect(container.innerHTML).toBe('<span>This works!</span>');
    });

    it('should render two element vnodes as siblings and swap their order', () => {
      render(
        <div>
          {a}
          {b}
        </div>,
        container,
      );
      expect(container.innerHTML).toBe(
        '<div><div>Hello world</div><span>This works!</span></div>',
      );
      render(
        <div>
          {b}
          {a}
        </div>,
        container,
      );
      expect(container.innerHTML).toBe(
        '<div><span>This works!</span><div>Hello world</div></div>',
      );
    });

    it('should render element vnodes passed as children that a component repeats three times', () => {
      render(<C>{a}</C>, container);
      expect(container.innerHTML).toBe(
        '<div><div>Hello world</div><div>Hello world</div><div>Hello world</div></div>',
      );
      render(
        <C>
          {b}
          {a}
        </C>,
        container,
      );
      expect(container.innerHTML).toBe(
        '<div><span>This works!</span><div>Hello world</div><span>This works!</span><div>Hello world</div><span>This works!</span><div>Hello world</div></div>',
      );
    });
  });

  describe('should correctly handle TEXT VNodes as quasi-immutable objects, like ReactElement does', () => {
    // @ts-expect-error createVNode is typed for element vnodes, text vnodes have no type
    const a = createVNode(VNodeFlags.Text, null, null, 'Hello world');
    // @ts-expect-error createVNode is typed for element vnodes, text vnodes have no type
    const b = createVNode(VNodeFlags.Text, null, null, 'This works!');
    const C = ({ children }: { children?: InfernoNode }) => (
      <div>
        {children}
        {children}
        {children}
      </div>
    );

    it('should render a text vnode and then replace it with another', () => {
      render(a, container);
      expect(container.innerHTML).toBe('Hello world');
      render(b, container);
      expect(container.innerHTML).toBe('This works!');
    });

    it('should render the same text vnode three times in an array', () => {
      render(<div>{[a, a, a]}</div>, container);
      expect(container.innerHTML).toBe(
        '<div>Hello worldHello worldHello world</div>',
      );
      render(b, container);
      expect(container.innerHTML).toBe('This works!');
    });

    it('should render two text vnodes as siblings and swap their order', () => {
      render(
        <div>
          {a}
          {b}
        </div>,
        container,
      );
      expect(container.innerHTML).toBe('<div>Hello worldThis works!</div>');
      render(
        <div>
          {b}
          {a}
        </div>,
        container,
      );
      expect(container.innerHTML).toBe('<div>This works!Hello world</div>');
    });

    it('should render text vnodes passed as children that a component repeats three times', () => {
      render(<C>{a}</C>, container);
      expect(container.innerHTML).toBe(
        '<div>Hello worldHello worldHello world</div>',
      );
      render(
        <C>
          {b}
          {a}
        </C>,
        container,
      );
      expect(container.innerHTML).toBe(
        '<div>This works!Hello worldThis works!Hello worldThis works!Hello world</div>',
      );
    });
  });

  describe('should properly render multiline text via JSX', () => {
    it('should join multiline JSX text into single-line paragraph text', () => {
      render(
        <div class="tesla-battery__notice">
          <p>
            The actual amount of range that you experience will vary based on
            your particular use conditions. See how particular use conditions
            may affect your range in our simulation model.
          </p>
          <p>
            Vehicle range may vary depending on the vehicle configuration,
            battery age and condition, driving style and operating,
            environmental and climate conditions.
          </p>
        </div>,
        container,
      );
      expect(container.innerHTML).toBe(
        '<div class="tesla-battery__notice"><p>The actual amount of range that you experience will vary based on your particular use conditions. See how particular use conditions may affect your range in our simulation model.</p><p>Vehicle range may vary depending on the vehicle configuration, battery age and condition, driving style and operating, environmental and climate conditions.</p></div>',
      );
    });
  });

  describe('REST Spread JSX', () => {
    it('Should render className, value and click event through spread props', (done) => {
      const TextField = function (
        props: Inferno.InputHTMLAttributes<HTMLInputElement>,
      ) {
        return <input {...props} />;
      };
      interface MyTextFieldProps {
        name: string;
        className: string;
      }

      const MyTextField = ({ name, className }: MyTextFieldProps) => (
        <TextField
          className={className}
          value={name}
          onClick={function () {
            done();
          }}
        />
      );

      render(<MyTextField className="foobar" name="test" />, container);

      expect((container.firstChild as HTMLInputElement).value).toBe('test');
      expect((container.firstChild as Element).getAttribute('class')).toBe(
        'foobar',
      );
      (container.firstChild as HTMLInputElement).click();
    });
  });

  if (
    typeof global !== 'undefined' &&
    !(global as typeof globalThis & { usingJSDOM?: boolean }).usingJSDOM &&
    'position' in document.createElement('progress')
  ) {
    describe('Progress element', () => {
      it('Should be possible to change value of Progress element Github#714', () => {
        render(<progress max={100} value="10" />, container);

        expect((container.firstChild as Element).getAttribute('value')).toEqual(
          '10',
        );

        render(<progress max={100} value="33" />, container);

        expect((container.firstChild as Element).getAttribute('value')).toEqual(
          '33',
        );

        render(<progress max={100} value={'0'} />, container);

        expect((container.firstChild as Element).getAttribute('value')).toEqual(
          '0',
        );
      });
      it('Should be possible to render Progress element without value', () => {
        render(<progress max={100} />, container);
        expect((container.firstChild as Element).tagName).toEqual('PROGRESS');
        expect([null, '', 0, '0']).toContain(
          (container.firstChild as Element).getAttribute('value'),
        );

        // Add as string
        render(<progress max={100} value="3" />, container);
        expect((container.firstChild as Element).tagName).toEqual('PROGRESS');
        expect((container.firstChild as Element).getAttribute('value')).toEqual(
          '3',
        );
      });
    });
  }

  describe('Value for components', () => {
    it('Should be possible to pass down value prop', () => {
      function Foo({ value }: { value: string }) {
        return <div>{value}</div>;
      }

      render(<Foo value="100" />, container);

      expect(container.innerHTML).toEqual('<div>100</div>');
    });
  });
});
