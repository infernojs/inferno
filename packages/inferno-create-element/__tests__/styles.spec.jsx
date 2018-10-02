import { render, Component } from 'inferno';
import { innerHTML } from 'inferno-utils';

function styleNode(style) {
  return <div style={style} />;
}

function isCSSvariablesSupported() {
  const div = document.createElement('div');
  document.body.appendChild(div);
  div.style.cssText = '--my-color:red;background-color:var(--my-color);';
  const backgroundIsRed = getComputedStyle(div).backgroundColor === 'rgb(255, 0, 0)';
  document.body.removeChild(div);

  return backgroundIsRed;
}

describe('CSS style properties (JSX)', () => {
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

  it('should set and remove dynamic styles', () => {
    const styles = { display: 'none', 'font-family': 'Arial', 'line-height': 2 };

    render(<div style={styles} />, container);
    expect(container.firstChild.style.fontFamily).toBe('Arial');
    expect(container.firstChild.style.lineHeight).toBe('2');

    render(<div />, container);
    expect(container.firstChild.style.fontFamily).toBe('');
    expect(container.firstChild.style.lineHeight).toBe('');
  });

  it('should update styles if initially null', () => {
    let styles = null;
    render(<div style={styles} />, container);

    styles = { display: 'block' };

    render(<div style={styles} />, container);
    expect(container.firstChild.style.display).toBe('block');
  });

  it('should update styles if updated to null multiple times', () => {
    let styles = null;

    render(<div style={undefined} />, container);

    render(<div style={styles} />, container);
    expect(container.firstChild.style.display).toBe('');

    styles = { display: 'block' };

    render(<div style={styles} />, container);
    expect(container.firstChild.style.display).toBe('block');

    render(<div style={null} />, container);
    expect(container.firstChild.style.display).toBe('');

    render(<div style={styles} />, container);
    expect(container.firstChild.style.display).toBe('block');

    render(<div style={null} />, container);
    expect(container.firstChild.style.display).toBe('');
  });

  it('should update styles when `style` changes from null to object', () => {
    const styles = { color: 'red' };
    render(<div style={123} />, container);
    render(<div style={styles} />, container);
    render(<div />, container);
    render(<div style={styles} />, container);

    const stubStyle = container.firstChild.style;
    expect(stubStyle.color).toBe('red');
  });

  it('should support different unit types - em and mm', () => {
    const styles = { height: '200em', width: '20mm' };
    render(<div style={styles} />, container);
    render(<div />, container);
    render(<div style={styles} />, container);

    const stubStyle = container.firstChild.style;
    expect(stubStyle.height).toBe('200em');
    expect(stubStyle.width).toBe('20mm');
  });

  it('should clear all the styles when removing `style`', () => {
    const styles = { display: 'none', color: 'red' };
    render(<div style={styles} />, container);

    const stubStyle = container.firstChild.style;
    expect(stubStyle.display).toBe('none');
    expect(stubStyle.color).toBe('red');
  });

  it('Should change styles', () => {
    const stylesOne = { color: 'red' };
    render(styleNode(stylesOne), container);
    expect(container.firstChild.style.color).toBe('red');

    const styles = { color: 'blue' };
    render(styleNode(styles), container);
    expect(container.firstChild.style.color).toBe('blue');

    const stylesTwo = { color: 'orange' };
    render(styleNode(stylesTwo), container);
    expect(container.firstChild.style.color).toBe('orange');

    const stylesThree = { color: 'orange' };
    render(styleNode(stylesThree), container);
    expect(container.firstChild.style.color).toBe('orange');
  });

  it('Should remove style attribute when next value is null', () => {
    const stylesOne = { color: 'green' };
    render(styleNode(stylesOne), container);
    expect(container.firstChild.style.color).toBe('green');

    render(styleNode(null), container);
    expect(container.firstChild.style.cssText).toBe('');
    // expect(container.innerHTML).to.eql('<div></div>');
  });

  it('Should remove style attribute when single prop value is undefined', () => {
    const stylesOne = { 'text-align': 'center', color: 'red', display: 'block' };
    render(styleNode(stylesOne), container);
    expect(container.firstChild.style.textAlign).toBe('center');

    const stylesTwo = { 'text-align': 'left', display: 'none' };
    render(styleNode(stylesTwo), container);
    expect(container.firstChild.style.textAlign).toBe('left');
    expect(container.firstChild.style.display).toBe('none');
    expect(container.firstChild.style.color).toBe('');
  });

  // Test for CSS variable support, depends on browser
  if (isCSSvariablesSupported()) {
    it('Should support inline CSS variables string way', () => {
      render(<div style="--my-color:red;background-color:var(--my-color);" />, container);

      expect(getComputedStyle(container.firstChild).backgroundColor).toBe('rgb(255, 0, 0)'); // verify its red
    });

    it('Should support inline CSS variables object way', () => {
      render(<div style={{ '--my-color': 'red', 'background-color': 'var(--my-color)' }} />, container);

      expect(getComputedStyle(container.firstChild).backgroundColor).toBe('rgb(255, 0, 0)'); // verify its red
    });
  }
});
