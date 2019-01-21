import { render } from 'inferno';
import { triggerEvent } from 'inferno-utils';

describe('Select selectedIndex', () => {
  let container;

  beforeEach(function() {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(function() {
    render(null, container);
    container.innerHTML = '';
    document.body.removeChild(container);
  });

  it('Should render select with selectedIndex -1', () => {
    render(
      <select selectedIndex={-1}>
        <option value="0">Leonardo</option>
        <option value="1">Donatello</option>
        <option value="2">Rafael</option>
        <option value="3">Michelangelo</option>
        <option value="4">Splinter</option>
      </select>,
      container
    );

    const select = container.firstElementChild;
    if (window.name === 'nodejs') {
      //bug in JSdom =(
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
      container
    );

    const select = container.firstElementChild;
    expect(select.selectedIndex).toBe(3);
    expect(select.value).toBe('3');
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
      container
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
      container
    );

    const select = container.firstElementChild;
    select.value = '0';
    triggerEvent('change', select);
    expect(select.selectedIndex).toBe(3);
    expect(select.value).toBe('3');
  });
});
