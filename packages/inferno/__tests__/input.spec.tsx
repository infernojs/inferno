import { render } from 'inferno';
import { triggerEvent } from 'inferno-utils';

describe('Input type checkbox', () => {
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

  it('Checked attribute should be false', function () {
    render(<input type="checkbox" checked={false} />, container);
    const input = container.firstChild;

    expect(input.checked).toBe(false);
  });

  it('Checked attribute after Click', function () {
    let clickChecked: boolean | null = null;
    let changeChecked: boolean | null = null;

    render(
      <input
        type="checkbox"
        checked={false}
        onclick={(e) => {
          clickChecked = e.currentTarget.checked;
        }}
        onchange={(e) => {
          changeChecked = e.currentTarget.checked;
        }}
      />,
      container,
    );
    const input = container.firstChild;

    triggerEvent('click', input);

    expect(input.checked).toBe(false);
    expect(clickChecked).toBe(true);
    expect(changeChecked).toBe(true);
  });

  it('Checkbox click should not propagate to parent', function () {
    let clickChecked: boolean | null = null;
    let changeChecked: boolean | null = null;
    let parentClick = false;

    render(
      <div onClick={() => (parentClick = true)}>
        <input
          type="checkbox"
          checked={false}
          onclick={(e) => {
            clickChecked = e.currentTarget.checked;
          }}
          onchange={(e) => {
            changeChecked = e.currentTarget.checked;
          }}
        />
      </div>,
      container,
    );
    const input = container.querySelector('input');

    expect(parentClick).toBe(false);

    triggerEvent('click', input);

    expect(input.checked).toBe(false);
    expect(clickChecked).toBe(true);
    expect(changeChecked).toBe(true);
    expect(parentClick).toBe(false);
  });

  it('Checked attribute after synthetic Click', function () {
    let nClicks = 0;
    let clickChecked: boolean | null = null;
    let nChanges = 0;
    let changeChecked: boolean | null = null;

    render(
      <input
        type="checkbox"
        checked={false}
        onClick={(e) => {
          clickChecked = e.currentTarget.checked;
          nClicks++;
        }}
        onChange={(e) => {
          changeChecked = e.currentTarget.checked;
          nChanges++;
        }}
      />,
      container,
    );
    const input = container.firstChild;

    triggerEvent('click', input);

    expect(input.checked).toBe(false);
    expect(nClicks).toBe(1);
    expect(clickChecked).toBe(true);
    expect(nChanges).toBe(1);
    expect(changeChecked).toBe(true);
  });
});

describe('Input type Radio', () => {
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

  it('Controlled radio, checked=false', function () {
    render(<input type="radio" checked={false} value="magic" />, container);
    const input = container.firstChild;

    expect(input.checked).toBe(false);
  });

  it('Checked attribute after Click #2', function () {
    let clickChecked: boolean | null = null;
    let changeChecked: boolean | null = null;

    render(
      <input
        type="radio"
        checked={false}
        value="magic"
        onclick={(e) => {
          clickChecked = e.currentTarget.checked;
        }}
        onchange={(e) => {
          changeChecked = e.currentTarget.checked;
        }}
      />,
      container,
    );
    const input = container.firstChild;

    triggerEvent('click', input);

    expect(clickChecked).toBe(true);
    expect(input.checked).toBe(false);
    expect(changeChecked).toBe(true);
  });

  it('Checked attribute after synthetic Click #3', function () {
    let clickChecked: boolean | null = null;
    let changeChecked: boolean | null = null;

    render(
      <input
        type="radio"
        checked={false}
        value="magic"
        onClick={(e) => {
          clickChecked = e.currentTarget.checked;
        }}
        onChange={(e) => {
          changeChecked = e.currentTarget.checked;
        }}
      />,
      container,
    );
    const input = container.firstChild;

    triggerEvent('click', input);

    expect(clickChecked).toBe(true);
    expect(input.checked).toBe(false);
    expect(changeChecked).toBe(true);
  });
});
