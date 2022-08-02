import { Component, render } from 'inferno';
import { innerHTML } from 'inferno-utils';

describe('Select / select multiple (JSX)', () => {
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

  it('should render "select" boolean on select options with numbers', () => {
    render(
      <select multiple={true} value={null}>
        <option value={1}>1</option>
        <option value={2}>2</option>
      </select>,
      container
    );
    render(
      <select multiple={true} value={undefined}>
        <option value={1}>1</option>
        <option value={2}>1</option>
      </select>,
      container
    );
    render(
      <select multiple={true} value={2}>
        <option value={1}>1</option>
        <option value={2}>2</option>
      </select>,
      container
    );

    expect(container.firstChild.children[0].selected).toEqual(false);
    expect(container.firstChild.children[1].selected).toEqual(true);
    expect(container.innerHTML).toBe('<select multiple=""><option value="1">1</option><option value="2">2</option></select>');

    render(
      <select multiple={true} value={1}>
        <option value={1}>1</option>
        <option value={2}>2</option>
      </select>,
      container
    );

    expect(container.firstChild.children[0].selected).toEqual(true);
    expect(container.firstChild.children[1].selected).toEqual(false);
    expect(container.innerHTML).toBe('<select multiple=""><option value="1">1</option><option value="2">2</option></select>');

    render(
      <select multiple={true} value={'foo'}>
        <option value={1}>1</option>
        <option value={2}>2</option>
      </select>,
      container
    );

    expect(container.firstChild.children[0].selected).toEqual(false);
    expect(container.firstChild.children[1].selected).toEqual(false);
    expect(container.innerHTML).toBe('<select multiple=""><option value="1">1</option><option value="2">2</option></select>');
  });

  it('should render "select" boolean on select options #2', () => {
    render(
      <select multiple={true} value={false}>
        <option value="foo">foo</option>
        <option value="bar">bar</option>
      </select>,
      container
    );
    render(
      <select multiple={true} value={'foo'}>
        <option value="foo">foo</option>
        <option value="bar">bar</option>
      </select>,
      container
    );
    expect(container.firstChild.children[0].selected).toEqual(true);
    expect(container.firstChild.children[1].selected).toEqual(false);
    expect(container.innerHTML).toBe('<select multiple=""><option value="foo">foo</option><option value="bar">bar</option></select>');
    render(
      <select multiple={true} value={false}>
        <option value="foo">foo</option>
        <option value="bar">bar</option>
      </select>,
      container
    );
    expect(container.firstChild.children[0].selected).toEqual(false);
    expect(container.firstChild.children[1].selected).toEqual(false);
    expect(container.innerHTML).toBe('<select multiple=""><option value="foo">foo</option><option value="bar">bar</option></select>');

    render(
      <select multiple={true} value={'bar'}>
        <option value="foo">foo</option>
        <option value="bar">bar</option>
      </select>,
      container
    );
    expect(container.firstChild.children[0].selected).toEqual(false);
    expect(container.firstChild.children[1].selected).toEqual(true);
    expect(container.innerHTML).toBe('<select multiple=""><option value="foo">foo</option><option value="bar">bar</option></select>');
  });

  it('should populate the value attribute on select multiple using groups', () => {
    const template = (val) => (
      <select multiple={true} value={val}>
        <optgroup label="foo-group">
          <option value="foo" />
        </optgroup>
        <optgroup label="bar-group" disabled>
          <option value="bar" />
        </optgroup>
      </select>
    );

    // render(template(undefined), container);
    render(template(['foo', 'bar']), container);

    expect(container.firstChild.children[0].disabled).toEqual(false);
    expect(container.firstChild.children[1].disabled).toEqual(true);

    expect(container.firstChild.childNodes[0].innerHTML).toEqual('<option value="foo"></option>');
    expect(container.firstChild.childNodes[1].innerHTML).toEqual('<option value="bar"></option>');

    expect(container.firstChild.children[0].children[0].selected).toEqual(true);
    expect(container.firstChild.children[1].children[0].selected).toEqual(true);

    render(template([]), container);

    expect(container.firstChild.childNodes[0].innerHTML).toEqual('<option value="foo"></option>');
    expect(container.firstChild.childNodes[1].innerHTML).toEqual('<option value="bar"></option>');

    expect(container.firstChild.children[0].children[0].selected).toEqual(false);
    expect(container.firstChild.children[1].children[0].selected).toEqual(false);

    render(template('foo'), container);

    expect(container.firstChild.childNodes[0].innerHTML).toEqual('<option value="foo"></option>');
    expect(container.firstChild.childNodes[1].innerHTML).toEqual('<option value="bar"></option>');

    expect(container.firstChild.children[0].children[0].selected).toEqual(true);
    expect(container.firstChild.children[1].children[0].selected).toEqual(false);

    render(template('bar'), container);

    expect(container.firstChild.childNodes[0].innerHTML).toEqual('<option value="foo"></option>');
    expect(container.firstChild.childNodes[1].innerHTML).toEqual('<option value="bar"></option>');

    expect(container.firstChild.children[0].children[0].selected).toEqual(false);
    expect(container.firstChild.children[1].children[0].selected).toEqual(true);

    render(template(false), container);

    expect(container.firstChild.childNodes[0].innerHTML).toEqual('<option value="foo"></option>');
    expect(container.firstChild.childNodes[1].innerHTML).toEqual('<option value="bar"></option>');

    expect(container.firstChild.children[0].children[0].selected).toEqual(false);
    expect(container.firstChild.children[1].children[0].selected).toEqual(false);
  });

  it('should not fail if optgroup is empty', () => {
    const template = (val) => (
      <select multiple={true} value={val}>
        <optgroup label="foo-group">
          <option value="foo" />
        </optgroup>
        <optgroup />
        <optgroup label="bar-group" disabled>
          <option value="bar" />
        </optgroup>
      </select>
    );

    // render(template(undefined), container);
    render(template(['foo', 'bar']), container);
  });

  it('Should be possible to render empty select', () => {
    render(<select value="test" />, container);

    expect(container.innerHTML).toEqual('<select></select>');
  });

  it('should populate the value attribute on select multiple using groups, multiple optgroups and options', () => {
    const template = (val) => (
      <select multiple={true} value={val}>
        <optgroup label="foo-group">
          <option value="foo" />
          <option value="foo2" />
          <option value="foo3" />
        </optgroup>
        <optgroup label="bar-group" disabled>
          <option value="bar" />
          <option value="bar2" />
          <option value="bar3" />
        </optgroup>
      </select>
    );

    // render(template(undefined), container);
    render(template(['foo', 'bar2']), container);

    expect(container.firstChild.children[0].disabled).toEqual(false);
    expect(container.firstChild.children[1].disabled).toEqual(true);

    expect(container.firstChild.childNodes[0].innerHTML).toEqual('<option value="foo"></option><option value="foo2"></option><option value="foo3"></option>');
    expect(container.firstChild.childNodes[1].innerHTML).toEqual('<option value="bar"></option><option value="bar2"></option><option value="bar3"></option>');

    expect(container.firstChild.children[0].children[0].selected).toEqual(true);
    expect(container.firstChild.children[1].children[1].selected).toEqual(true);

    render(template([]), container);

    expect(container.firstChild.childNodes[0].innerHTML).toEqual('<option value="foo"></option><option value="foo2"></option><option value="foo3"></option>');
    expect(container.firstChild.childNodes[1].innerHTML).toEqual('<option value="bar"></option><option value="bar2"></option><option value="bar3"></option>');

    expect(container.firstChild.children[0].children[0].selected).toEqual(false);
    expect(container.firstChild.children[1].children[0].selected).toEqual(false);

    render(template('foo'), container);

    expect(container.firstChild.childNodes[0].innerHTML).toEqual('<option value="foo"></option><option value="foo2"></option><option value="foo3"></option>');
    expect(container.firstChild.childNodes[1].innerHTML).toEqual('<option value="bar"></option><option value="bar2"></option><option value="bar3"></option>');

    expect(container.firstChild.children[0].children[0].selected).toEqual(true);
    expect(container.firstChild.children[1].children[0].selected).toEqual(false);

    render(template('bar'), container);

    expect(container.firstChild.children[0].children[0].selected).toEqual(false);
    expect(container.firstChild.children[1].children[0].selected).toEqual(true);

    render(template(false), container);

    expect(container.firstChild.children[0].children[0].selected).toEqual(false);
    expect(container.firstChild.children[1].children[0].selected).toEqual(false);
  });

  it('should render "select" boolean on select options #3', () => {
    render(
      <select multiple={true} value={'foo'}>
        <option value="foo">foo</option>
        <option value="bar">bar</option>
      </select>,
      container
    );
    expect(container.firstChild.children[0].selected).toEqual(true);
    expect(container.firstChild.children[1].selected).toEqual(false);
    expect(container.innerHTML).toBe(
      // Missing selected markup
      '<select multiple=""><option value="foo">foo</option><option value="bar">bar</option></select>'
    );
  });

  it('should render "select" boolean on select options #1', () => {
    render(
      <select multiple={true} value={'foo'}>
        <option value="foo">foo</option>
        <option value="bar">bar</option>
      </select>,
      container
    );

    expect(container.firstChild.children[0].selected).toEqual(true);
    expect(container.firstChild.children[1].selected).toEqual(false);
    expect(container.innerHTML).toBe('<select multiple=""><option value="foo">foo</option><option value="bar">bar</option></select>');

    render(
      <select multiple={true} value={false}>
        <option value="foo">foo</option>
        <option value="bar">bar</option>
      </select>,
      container
    );

    expect(container.firstChild.children[0].selected).toEqual(false);
    expect(container.firstChild.children[1].selected).toEqual(false);
    expect(container.innerHTML).toBe('<select multiple=""><option value="foo">foo</option><option value="bar">bar</option></select>');
  });

  it('should assure the value attribute also set the value property for `textarea`', () => {
    render(<textarea value={'foo'} />, container);
    expect(container.firstChild.value).toEqual('foo');
    render(<textarea value={'bar'} />, container);
    expect(container.firstChild.value).toEqual('bar');
    render(<textarea value={'bar'} />, container);
    expect(container.firstChild.value).toEqual('bar');
    render(<textarea value={'foo'} />, container);
    expect(container.firstChild.value).toEqual('foo');
    render(<textarea value={null} />, container);
    expect(container.firstChild.value).toEqual('');
    render(<textarea value={undefined} />, container);
    expect(container.firstChild.value).toEqual('');
    render(<textarea value={'bar'} />, container);
    expect(container.firstChild.value).toEqual('bar');
    render(<textarea value={[]} />, container);
    expect(container.firstChild.value).toEqual('');
    render(<textarea value={{}} />, container);
    expect(container.firstChild.value).toEqual('[object Object]');
  });

  it('should handle when multiple values passed in as an array', () => {
    render(
      <select multiple={true} value={['a', 'b', 'c']}>
        <option value={'a'}>a</option>
        <option value={'b'}>b</option>
        <option value={'c'}>c</option>
        <option value={'d'}>d</option>
      </select>,
      container
    );

    expect(container.firstChild.children[0].selected).toEqual(true);
    expect(container.firstChild.children[1].selected).toEqual(true);
    expect(container.firstChild.children[2].selected).toEqual(true);
    expect(container.firstChild.children[3].selected).toEqual(false);
    expect(container.innerHTML).toBe(
      '<select multiple=""><option value="a">a</option><option value="b">b</option><option value="c">c</option><option value="d">d</option></select>'
    );
  });

  it('should handle when multiple options with selected set', () => {
    render(
      <select multiple={true}>
        <option value="a" selected={true}>
          a
        </option>
        <option value="b" selected={true}>
          b
        </option>
        <option value="c" selected={true}>
          c
        </option>
        <option value="d">d</option>
      </select>,
      container
    );

    expect(container.firstChild.children[0].selected).toEqual(true);
    expect(container.firstChild.children[1].selected).toEqual(true);
    expect(container.firstChild.children[2].selected).toEqual(true);
    expect(container.firstChild.children[3].selected).toEqual(false);
    expect(container.innerHTML).toBe(
      '<select multiple=""><option value="a">a</option><option value="b">b</option><option value="c">c</option><option value="d">d</option></select>'
    );
  });

  it('Should render empty select', () => {
    render(<select />, container);
    expect(container.innerHTML).toEqual('<select></select>');
  });

  it('should render defaultValue', () => {
    render(
      <select defaultValue="b">
        <option value="a">a</option>
        <option value="b">b</option>
        <option value="c">c</option>
        <option value="d">d</option>
      </select>,
      container
    );
    expect(container.firstChild.children[0].selected).toEqual(false);
    expect(container.firstChild.children[1].selected).toEqual(true);
    expect(container.firstChild.children[2].selected).toEqual(false);
    expect(container.firstChild.children[3].selected).toEqual(false);
    expect(container.innerHTML).toBe(
      '<select><option value="a">a</option><option value="b">b</option><option value="c">c</option><option value="d">d</option></select>'
    );
  });

  it('should render multiple defaultValue', () => {
    render(
      <select multiple={true} defaultValue={['a', 'b', 'c']}>
        <option value={'a'}>a</option>
        <option value={'b'}>b</option>
        <option value={'c'}>c</option>
        <option value={'d'}>d</option>
      </select>,
      container
    );

    expect(container.firstChild.children[0].selected).toEqual(true);
    expect(container.firstChild.children[1].selected).toEqual(true);
    expect(container.firstChild.children[2].selected).toEqual(true);
    expect(container.firstChild.children[3].selected).toEqual(false);
    expect(container.innerHTML).toBe(
      '<select multiple=""><option value="a">a</option><option value="b">b</option><option value="c">c</option><option value="d">d</option></select>'
    );
  });

  it('should not touch selections, if value or selected, is null or undefined', () => {
    render(
      <select>
        <option value="a">a</option>
        <option value="b">b</option>
      </select>,
      container
    );
    container.firstChild.children[1].selected = true;
    render(
      <select>
        <option value="a">a</option>
        <option value="b">b</option>
      </select>,
      container
    );
    expect(container.firstChild.children[0].selected).toEqual(false);
    expect(container.firstChild.children[1].selected).toEqual(true);
  });

  it('should render specified default selected option', () => {
    render(
      <select>
        <option value="a">a</option>
        <option selected={true} value="b">
          b
        </option>
      </select>,
      container
    );
    expect(container.firstChild.children[0].selected).toEqual(false);
    expect(container.firstChild.children[1].selected).toEqual(true); // Currently failing due to issue #1031
  });

  it('Should have selectedIndex -1 and value as null when value is removed - Github #1105', () => {
    render(
      <select id="sel" value="">
        <option value="">a</option>
      </select>,
      container
    );
    expect(container.firstChild.selectedIndex).toBe(0);
    expect(container.firstChild.value).toBe('');

    render(
      <select id="sel">
        <option value="">a</option>
      </select>,
      container
    );
    expect(container.firstChild.value).toBe('');
    expect([0, -1]).toContain(container.firstChild.selectedIndex);
  });

  it('Should be possible to render select element with options wrapped in functional Component', () => {
    const CustomOption = ({ selected, value, children }) => (
      <option selected={selected} value={value}>
        {children}
      </option>
    );

    render(
      <select value={1}>
        <CustomOption value={1}>1st</CustomOption>
        <CustomOption value={2}>2nd</CustomOption>
        <CustomOption value={3}>3rd</CustomOption>
      </select>,
      container
    );

    const selectElement = container.firstChild;

    expect(container.innerHTML).toEqual('<select><option value="1">1st</option><option value="2">2nd</option><option value="3">3rd</option></select>');
    expect(selectElement.children[0].selected).toBe(true);
    expect(selectElement.children[1].selected).toBe(false);
    expect(selectElement.children[2].selected).toBe(false);

    render(
      <select value={2}>
        <CustomOption key={1} value={1}>
          1st
        </CustomOption>
        <CustomOption key={2} value={2}>
          2nd
        </CustomOption>
        <CustomOption key={3} value={3}>
          3rd
        </CustomOption>
      </select>,
      container
    );

    expect(container.innerHTML).toEqual('<select><option value="1">1st</option><option value="2">2nd</option><option value="3">3rd</option></select>');
    expect(selectElement.children[0].selected).toBe(false);
    expect(selectElement.children[1].selected).toBe(true);
    expect(selectElement.children[2].selected).toBe(false);
  });

  it('Should be possible to render select element with options wrapped in Class Component', () => {
    class CustomOption extends Component {
      render() {
        return <option value={this.props.value}>{this.props.children}</option>;
      }
    }

    render(
      <select value={1}>
        <CustomOption value={1}>1st</CustomOption>
        <CustomOption value={2}>2nd</CustomOption>
        <CustomOption value={3}>3rd</CustomOption>
      </select>,
      container
    );

    const selectElement = container.firstChild;

    expect(container.innerHTML).toEqual('<select><option value="1">1st</option><option value="2">2nd</option><option value="3">3rd</option></select>');
    expect(selectElement.children[0].selected).toBe(true);
    expect(selectElement.children[1].selected).toBe(false);
    expect(selectElement.children[2].selected).toBe(false);

    render(
      <select value={2}>
        <CustomOption key={1} value={1}>
          1st
        </CustomOption>
        <CustomOption key={2} value={2}>
          2nd
        </CustomOption>
        <CustomOption key={3} value={3}>
          3rd
        </CustomOption>
      </select>,
      container
    );

    expect(container.innerHTML).toEqual('<select><option value="1">1st</option><option value="2">2nd</option><option value="3">3rd</option></select>');
    expect(selectElement.children[0].selected).toBe(false);
    expect(selectElement.children[1].selected).toBe(true);
    expect(selectElement.children[2].selected).toBe(false);
  });

  it('Should be possible to render select element with options wrapped in Fragment', () => {
    render(
      <select value={1}>
        <>
          <>
            <option value={1}>1st</option>
          </>
          <option value={2}>2nd</option>
          <>
            <option value={3}>3rd</option>
          </>
        </>
      </select>,
      container
    );

    const selectElement = container.firstChild;

    expect(container.innerHTML).toEqual('<select><option value="1">1st</option><option value="2">2nd</option><option value="3">3rd</option></select>');
    expect(selectElement.children[0].selected).toBe(true);
    expect(selectElement.children[1].selected).toBe(false);
    expect(selectElement.children[2].selected).toBe(false);

    render(
      <select value={2}>
        <>
          <>
            <option value={1}>1st</option>
          </>
          <>
            <option value={2}>2nd</option>
          </>
        </>
        <>
          <option value={3}>3rd</option>
        </>
      </select>,
      container
    );

    expect(container.innerHTML).toEqual('<select><option value="1">1st</option><option value="2">2nd</option><option value="3">3rd</option></select>');
    expect(selectElement.children[0].selected).toBe(false);
    expect(selectElement.children[1].selected).toBe(true);
    expect(selectElement.children[2].selected).toBe(false);
  });
});
