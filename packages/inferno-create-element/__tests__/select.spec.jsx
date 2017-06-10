
import { render } from 'inferno';
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
		render(<select multiple={ true } value={ null }>
			<option value={ 1 }>1</option>
			<option value={ 2 }>2</option>
		</select>, container);
		render(<select multiple={ true } value={ undefined }>
			<option value={ 1 }>1</option>
			<option value={ 2 }>1</option>
		</select>, container);
		render(<select multiple={ true } value={ 2 }>
			<option value={ 1 }>1</option>
			<option value={ 2 }>2</option>
		</select>, container);

		expect(container.firstChild.children[ 0 ].selected).to.eql(false);
		expect(container.firstChild.children[ 1 ].selected).to.eql(true);
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<select multiple=""><option value="1">1</option><option value="2">2</option></select>')
		);

		render(<select multiple={ true } value={ 1 }>
			<option value={ 1 }>1</option>
			<option value={ 2 }>2</option>
		</select>, container);

		console.log(container.firstChild.children[ 0 ].selected);
		console.log(container.firstChild.children[ 1 ].selected);
		expect(container.firstChild.children[ 0 ].selected).to.eql(true);
		expect(container.firstChild.children[ 1 ].selected).to.eql(false);
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<select multiple=""><option value="1">1</option><option value="2">2</option></select>')
		);

		render(<select multiple={ true } value={ 'foo' }>
			<option value={ 1 }>1</option>
			<option value={ 2 }>2</option>
		</select>, container);

		expect(container.firstChild.children[ 0 ].selected).to.eql(false);
		expect(container.firstChild.children[ 1 ].selected).to.eql(false);
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<select multiple=""><option value="1">1</option><option value="2">2</option></select>')
		);
	});

	it('should render "select" boolean on select options #2', () => {
		render(<select multiple={ true } value={ false }>
			<option value="foo">foo</option>
			<option value="bar">bar</option>
		</select>, container);
		render(<select multiple={ true } value={ 'foo' }>
			<option value="foo">foo</option>
			<option value="bar">bar</option>
		</select>, container);
		expect(container.firstChild.children[ 0 ].selected).to.eql(true);
		expect(container.firstChild.children[ 1 ].selected).to.eql(false);
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<select multiple=""><option value="foo">foo</option><option value="bar">bar</option></select>')
		);
		render(<select multiple={ true } value={ false }>
			<option value="foo">foo</option>
			<option value="bar">bar</option>
		</select>, container);
		expect(container.firstChild.children[ 0 ].selected).to.eql(false);
		expect(container.firstChild.children[ 1 ].selected).to.eql(false);
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<select multiple=""><option value="foo">foo</option><option value="bar">bar</option></select>')
		);

		render(<select multiple={ true } value={ 'bar' }>
			<option value="foo">foo</option>
			<option value="bar">bar</option>
		</select>, container);
		expect(container.firstChild.children[ 0 ].selected).to.eql(false);
		expect(container.firstChild.children[ 1 ].selected).to.eql(true);
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<select multiple=""><option value="foo">foo</option><option value="bar">bar</option></select>')
		);
	});

	it('should populate the value attribute on select multiple using groups', () => {
		const template = (val) => <select multiple={ true } value={ val }>
			<optgroup label="foo-group">
				<option value="foo"/>
			</optgroup>
			<optgroup label="bar-group" disabled>
				<option value="bar"/>
			</optgroup>
		</select>;

		// render(template(undefined), container);
		render(template([ 'foo', 'bar' ]), container);

		expect(container.firstChild.children[ 0 ].disabled).to.eql(false);
		expect(container.firstChild.children[ 1 ].disabled).to.eql(true);

		expect(container.firstChild.childNodes[ 0 ].innerHTML).to.eql('<option value="foo"></option>');
		expect(container.firstChild.childNodes[ 1 ].innerHTML).to.eql('<option value="bar"></option>');

		expect(container.firstChild.children[ 0 ].children[ 0 ].selected).to.eql(true);
		expect(container.firstChild.children[ 1 ].children[ 0 ].selected).to.eql(true);

		render(template([]), container);

		expect(container.firstChild.childNodes[ 0 ].innerHTML).to.eql('<option value="foo"></option>');
		expect(container.firstChild.childNodes[ 1 ].innerHTML).to.eql('<option value="bar"></option>');

		expect(container.firstChild.children[ 0 ].children[ 0 ].selected).to.eql(false);
		expect(container.firstChild.children[ 1 ].children[ 0 ].selected).to.eql(false);

		render(template('foo'), container);

		expect(container.firstChild.childNodes[ 0 ].innerHTML).to.eql('<option value="foo"></option>');
		expect(container.firstChild.childNodes[ 1 ].innerHTML).to.eql('<option value="bar"></option>');

		expect(container.firstChild.children[ 0 ].children[ 0 ].selected).to.eql(true);
		expect(container.firstChild.children[ 1 ].children[ 0 ].selected).to.eql(false);

		render(template('bar'), container);

		expect(container.firstChild.childNodes[ 0 ].innerHTML).to.eql('<option value="foo"></option>');
		expect(container.firstChild.childNodes[ 1 ].innerHTML).to.eql('<option value="bar"></option>');

		expect(container.firstChild.children[ 0 ].children[ 0 ].selected).to.eql(false);
		expect(container.firstChild.children[ 1 ].children[ 0 ].selected).to.eql(true);

		render(template(false), container);

		expect(container.firstChild.childNodes[ 0 ].innerHTML).to.eql('<option value="foo"></option>');
		expect(container.firstChild.childNodes[ 1 ].innerHTML).to.eql('<option value="bar"></option>');

		expect(container.firstChild.children[ 0 ].children[ 0 ].selected).to.eql(false);
		expect(container.firstChild.children[ 1 ].children[ 0 ].selected).to.eql(false);
	});

	it('should render "select" boolean on select options #3', () => {
		render(<select multiple={ true } value={ 'foo' }>
			<option value="foo">foo</option>
			<option value="bar">bar</option>
		</select>, container);
		expect(container.firstChild.children[ 0 ].selected).to.eql(true);
		expect(container.firstChild.children[ 1 ].selected).to.eql(false);
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<select multiple=""><option value="foo">foo</option><option value="bar">bar</option></select>') // Missing selected markup
		);
	});

	it('should render "select" boolean on select options #1', () => {

		render(<select multiple={ true } value={ 'foo' }>
			<option value="foo">foo</option>
			<option value="bar">bar</option>
		</select>, container);

		expect(container.firstChild.children[ 0 ].selected).to.eql(true);
		expect(container.firstChild.children[ 1 ].selected).to.eql(false);
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<select multiple=""><option value="foo">foo</option><option value="bar">bar</option></select>')
		);

		render(<select multiple={ true } value={ false }>
			<option value="foo">foo</option>
			<option value="bar">bar</option>
		</select>, container);

		expect(container.firstChild.children[ 0 ].selected).to.eql(false);
		expect(container.firstChild.children[ 1 ].selected).to.eql(false);
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<select multiple=""><option value="foo">foo</option><option value="bar">bar</option></select>')
		);

	});

	it('should assure the value attribute also set the value property for `textarea`', () => {
		render(<textarea value={ 'foo' }/>, container);
		expect(container.firstChild.value).to.eql('foo');
		render(<textarea value={ 'bar' }/>, container);
		expect(container.firstChild.value).to.eql('bar');
		render(<textarea value={ 'bar' }/>, container);
		expect(container.firstChild.value).to.eql('bar');
		render(<textarea value={ 'foo' }/>, container);
		expect(container.firstChild.value).to.eql('foo');
		render(<textarea value={ null }/>, container);
		expect(container.firstChild.value).to.eql('');
		render(<textarea value={ undefined }/>, container);
		expect(container.firstChild.value).to.eql('');
		render(<textarea value={ 'bar' }/>, container);
		expect(container.firstChild.value).to.eql('bar');
		render(<textarea value={ [] }/>, container);
		expect(container.firstChild.value).to.eql('');
		render(<textarea value={ {} }/>, container);
		expect(container.firstChild.value).to.eql('[object Object]');
	});

	it('should handle when multiple values passed in as an array', () => {
		render(<select multiple={ true } value={ [ 'a', 'b', 'c' ] }>
			<option value={ 'a' }>a</option>
			<option value={ 'b' }>b</option>
			<option value={ 'c' }>c</option>
			<option value={ 'd' }>d</option>
		</select>, container);

		expect(container.firstChild.children[ 0 ].selected).to.eql(true);
		expect(container.firstChild.children[ 1 ].selected).to.eql(true);
		expect(container.firstChild.children[ 2 ].selected).to.eql(true);
		expect(container.firstChild.children[ 3 ].selected).to.eql(false);
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<select multiple=""><option value="a">a</option><option value="b">b</option><option value="c">c</option><option value="d">d</option></select>')
		);
	});

	it('should handle when multiple options with selected set', () => {
		render(<select multiple={ true }>
			<option value="a" selected={ true }>a</option>
			<option value="b" selected={ true }>b</option>
			<option value="c" selected={ true }>c</option>
			<option value="d">d</option>
		</select>, container);

		expect(container.firstChild.children[ 0 ].selected).to.eql(true);
		expect(container.firstChild.children[ 1 ].selected).to.eql(true);
		expect(container.firstChild.children[ 2 ].selected).to.eql(true);
		expect(container.firstChild.children[ 3 ].selected).to.eql(false);
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<select multiple=""><option value="a">a</option><option value="b">b</option><option value="c">c</option><option value="d">d</option></select>')
		);
	});

	it('Should render empty select', () => {
		render(<select></select>, container);
		expect(container.innerHTML).to.eql(innerHTML('<select></select>'));
	});

	it('should render defaultValue', () => {
		render(<select defaultValue="b">
			<option value="a">a</option>
			<option value="b">b</option>
			<option value="c">c</option>
			<option value="d">d</option>
		</select>, container);
		expect(container.firstChild.children[ 0 ].selected).to.eql(false);
		expect(container.firstChild.children[ 1 ].selected).to.eql(true);
		expect(container.firstChild.children[ 2 ].selected).to.eql(false);
		expect(container.firstChild.children[ 3 ].selected).to.eql(false);
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<select><option value="a">a</option><option value="b">b</option><option value="c">c</option><option value="d">d</option></select>')
		);
	});

	it('should render multiple defaultValue', () => {
		render(<select multiple={ true } defaultValue={ [ 'a', 'b', 'c' ] }>
			<option value={ 'a' }>a</option>
			<option value={ 'b' }>b</option>
			<option value={ 'c' }>c</option>
			<option value={ 'd' }>d</option>
		</select>, container);

		expect(container.firstChild.children[ 0 ].selected).to.eql(true);
		expect(container.firstChild.children[ 1 ].selected).to.eql(true);
		expect(container.firstChild.children[ 2 ].selected).to.eql(true);
		expect(container.firstChild.children[ 3 ].selected).to.eql(false);
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<select multiple=""><option value="a">a</option><option value="b">b</option><option value="c">c</option><option value="d">d</option></select>')
		);
	});

	it('should not touch selections, if value or selected, is null or undefined', () => {
		render(<select>
			<option value="a">a</option>
			<option value="b">b</option>
		</select>, container);
		container.firstChild.children[ 1 ].selected = true;
		render(<select>
			<option value="a">a</option>
			<option value="b">b</option>
		</select>, container);
		expect(container.firstChild.children[ 0 ].selected).to.eql(false);
		expect(container.firstChild.children[ 1 ].selected).to.eql(true);
	});

	it('should render specified default selected option', () => {
		render(<select>
			<option value="a">a</option>
			<option selected={true} value="b">b</option>
		</select>, container);
		expect(container.firstChild.children[ 0 ].selected).to.eql(false);
		expect(container.firstChild.children[ 1 ].selected).to.eql(true); // Currently failing due to issue #1031
	});

	it('Shoult have selectedIndex -1 and value as null when value is removed - Github #1105', () => {

		render((
			<select id="sel" value="">
				<option value="">a</option>
			</select>
		), container);
		expect(container.firstChild.selectedIndex, 'Initial selected index').to.equal(0);
		expect(container.firstChild.value, 'Intial value').to.equal('');

		render((
			<select id="sel">
				<option value="">a</option>
			</select>
		), container);
		expect(container.firstChild.value, 'Second selected index').to.equal('');
		expect(container.firstChild.selectedIndex, 'Second value').to.oneOf([ 0, -1 ]);
	});
});
