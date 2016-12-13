import { expect } from 'chai';
import { innerHTML } from '../../tools/utils';
import Inferno, { render } from 'inferno';
Inferno; // suppress ts 'never used' error

describe('Select / select multiple (JSX)', () => {
	let container;

	beforeEach(() => {
		container = document.createElement('div');
	});

	afterEach(() => {
		container.innerHTML = '';
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

		expect(container.firstChild.children[0].selected).to.eql(false);
		expect(container.firstChild.children[1].selected).to.eql(true);
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<select multiple=""><option value="1">1</option><option value="2">2</option></select>')
		);

		render(<select multiple={ true } value={ 1 }>
			<option value={ 1 }>1</option>
			<option value={ 2 }>2</option>
		</select>, container);

		expect(container.firstChild.children[0].selected).to.eql(true);
		expect(container.firstChild.children[1].selected).to.eql(false);
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<select multiple=""><option value="1">1</option><option value="2">2</option></select>')
		);

		render(<select multiple={ true } value={ 'foo' }>
			<option value={ 1 }>1</option>
			<option value={ 2 }>2</option>
		</select>, container);

		expect(container.firstChild.children[0].selected).to.eql(false);
		expect(container.firstChild.children[1].selected).to.eql(false);
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<select multiple=""><option value="1">1</option><option value="2">2</option></select>')
		);
	});

	it('should render "select" boolean on select options #2', () => {
		render(<select multiple={ true } value={ {} }>
			<option value='foo'>foo</option>
			<option value='bar'>bar</option>
		</select>, container);
		render(<select multiple={ true } value={ null }>
			<option value='foo'>foo</option>
			<option value='bar'>bar</option>
		</select>, container);
		render(<select multiple={ true } value={ undefined }>
			<option value='foo'>foo</option>
			<option value='bar'>bar</option>
		</select>, container);
		render(<select multiple={ true } value={ 'foo' }>
			<option value='foo'>foo</option>
			<option value='bar'>bar</option>
		</select>, container);
		expect(container.firstChild.children[0].selected).to.eql(true);
		expect(container.firstChild.children[1].selected).to.eql(false);
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<select multiple=""><option value="foo">foo</option><option value="bar">bar</option></select>')
		);
		render(<select multiple={ true } value={ undefined }>
			<option value='foo'>foo</option>
			<option value='bar'>bar</option>
		</select>, container);
		render(<select multiple={ true } value={ null }>
			<option value='foo'>foo</option>
			<option value='bar'>bar</option>
		</select>, container);
		expect(container.firstChild.children[0].selected).to.eql(false);
		expect(container.firstChild.children[1].selected).to.eql(false);
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<select multiple=""><option value="foo">foo</option><option value="bar">bar</option></select>')
		);

		render(<select multiple={ true } value={ 'bar' }>
			<option value='foo'>foo</option>
			<option value='bar'>bar</option>
		</select>, container);
		expect(container.firstChild.children[0].selected).to.eql(false);
		expect(container.firstChild.children[1].selected).to.eql(true);
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<select multiple=""><option value="foo">foo</option><option value="bar">bar</option></select>')
		);
	});

	it('should render "select" boolean on select options #3', () => {
		render(<select multiple={ true } value={ 'foo' }>
			<option value='foo'>foo</option>
			<option value='bar'>bar</option>
		</select>, container);
		expect(container.firstChild.children[0].selected).to.eql(true);
		expect(container.firstChild.children[1].selected).to.eql(false);
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<select multiple=""><option value="foo">foo</option><option value="bar">bar</option></select>')// Missing selected markup
		);
	});

	it('should render "select" boolean on select options #1', () => {

		render(<select multiple={ true } value={ 'foo' }>
			<option value='foo'>foo</option>
			<option value='bar'>bar</option>
		</select>, container);

		expect(container.firstChild.children[0].selected).to.eql(true);
		expect(container.firstChild.children[1].selected).to.eql(false);
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<select multiple=""><option value="foo">foo</option><option value="bar">bar</option></select>')
		);

		render(<select multiple={ true } value={ undefined }>
			<option value='foo'>foo</option>
			<option value='bar'>bar</option>
		</select>, container);

		expect(container.firstChild.children[0].selected).to.eql(false);
		expect(container.firstChild.children[1].selected).to.eql(false);
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

		expect(container.firstChild.children[0].selected).to.eql(true);
		expect(container.firstChild.children[1].selected).to.eql(true);
		expect(container.firstChild.children[2].selected).to.eql(true);
		expect(container.firstChild.children[3].selected).to.eql(false);
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<select multiple=""><option value="a">a</option><option value="b">b</option><option value="c">c</option><option value="d">d</option></select>')
		);
	});

	it('should handle when multiple options with selected set', () => {
		render(<select multiple={ true }>
			<option value='a' selected={ true }>a</option>
			<option value='b' selected={ true }>b</option>
			<option value='c' selected={ true }>c</option>
			<option value='d'>d</option>
		</select>, container);

		expect(container.firstChild.children[0].selected).to.eql(true);
		expect(container.firstChild.children[1].selected).to.eql(true);
		expect(container.firstChild.children[2].selected).to.eql(true);
		expect(container.firstChild.children[3].selected).to.eql(false);
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<select multiple=""><option value="a">a</option><option value="b">b</option><option value="c">c</option><option value="d">d</option></select>')
		);
	});
});
