import { Component, render } from 'inferno';
import { triggerEvent } from 'inferno-utils';

describe('Select selectedIndex', () => {
  let container;

  function requireEmptySelectionOnInsertion() {
    const select = document.createElement('select');
    select.appendChild(document.createElement('option'));
    select.selectedIndex = -1;
    container.appendChild(select);
    const supported = select.selectedIndex === -1;
    select.remove();
    if (!supported) {
      // https://bugs.webkit.org/show_bug.cgi?id=248360; fixed in Safari 17's WebKit.
      pending('Browser resets native select selection on insertion');
    }
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

  it('Should render select with selectedIndex -1', () => {
    requireEmptySelectionOnInsertion();
    render(
      <select selectedIndex={-1}>
        <option value="0">Leonardo</option>
        <option value="1">Donatello</option>
        <option value="2">Rafael</option>
        <option value="3">Michelangelo</option>
        <option value="4">Splinter</option>
      </select>,
      container,
    );

    const select = container.firstElementChild;
    if (window.name === 'nodejs') {
      // bug in JSdom =(
      expect(select.selectedIndex).toBe(0);
    } else {
      expect(select.selectedIndex).toBe(-1);
    }
  });

  it('Should keep selectedIndex -1 when the select enters the document inside a new parent', () => {
    requireEmptySelectionOnInsertion();
    render(<div />, container);
    render(
      <div>
        <p>
          <select selectedIndex={-1}>
            <option value="0">Leonardo</option>
            <option value="1">Donatello</option>
          </select>
        </p>
      </div>,
      container,
    );

    const select = container.querySelector('select');
    if (window.name === 'nodejs') {
      // bug in JSdom =(
      expect(select.selectedIndex).toBe(0);
    } else {
      expect(select.selectedIndex).toBe(-1);
    }
  });

  it('Should render select with selected option "3"', () => {
    render(
      <select selectedIndex={3}>
        <option value="0">Leonardo</option>
        <option value="1">Donatello</option>
        <option value="2">Rafael</option>
        <option value="3">Michelangelo</option>
        <option value="4">Splinter</option>
      </select>,
      container,
    );

    const select = container.firstElementChild;
    expect(select.selectedIndex).toBe(3);
    expect(select.value).toBe('3');
  });

  it('Should preserve selection from a nested render during mount', () => {
    class UpdateSibling extends Component {
      public componentDidMount() {
        render(template(1), container);
      }

      public render() {
        return <span />;
      }
    }

    function template(selectedIndex: number) {
      return (
        <div>
          <UpdateSibling />
          <select selectedIndex={selectedIndex}>
            <option value="0">Leonardo</option>
            <option value="1">Donatello</option>
          </select>
        </div>
      );
    }

    render(template(-1), container);

    const select = container.querySelector('select');
    expect(select.selectedIndex).toBe(1);
    expect(select.value).toBe('1');
  });

  it('Should render select without changes if value is not set', () => {
    render(
      <select selectedIndex={3}>
        <option value="0">Leonardo</option>
        <option value="1">Donatello</option>
        <option value="2">Rafael</option>
        <option value="3">Michelangelo</option>
        <option value="4">Splinter</option>
      </select>,
      container,
    );

    const select = container.firstElementChild;
    select.value = '0';
    triggerEvent('change', select);
    expect(select.selectedIndex).toBe(0);
    expect(select.value).toBe('0');
  });

  it('Should strict render select if value set', () => {
    render(
      <select selectedIndex={3} value={'3'}>
        <option value="0">Leonardo</option>
        <option value="1">Donatello</option>
        <option value="2">Rafael</option>
        <option value="3">Michelangelo</option>
        <option value="4">Splinter</option>
      </select>,
      container,
    );

    const select = container.firstElementChild;
    select.value = '0';
    triggerEvent('change', select);
    expect(select.selectedIndex).toBe(3);
    expect(select.value).toBe('3');
  });

  it('Should not render attribute selectedIndex', () => {
    render(
      <select selectedIndex={-1}>
        <option value="0">Leonardo</option>
        <option value="1">Donatello</option>
        <option value="2">Rafael</option>
        <option value="3">Michelangelo</option>
        <option value="4">Splinter</option>
      </select>,
      container,
    );

    const select = container.firstElementChild;
    expect(select.getAttribute('selectedIndex')).toBe(null);
  });
});
