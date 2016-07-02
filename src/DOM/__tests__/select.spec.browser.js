import { render } from './../rendering';
import innerHTML from './../../../tools/innerHTML';

describe('Select / select multiple', () => {

	let container;

	beforeEach(() => {
		container = document.createElement('div');
	});

	afterEach(() => {
		container.innerHTML = '';
	});

	it('should render "select" boolean on select options with numbers', () => {
		const template = (val) => ({
			tag: 'select',
			attrs: {
				multiple: true,
				value: val
			},
			children: [{
				tag: 'option',
				attrs: {
					value: 1
				},
				children: 1
			}, {
				tag: 'option',
				attrs: {
					value: 2
				},
				children: 2
			}]
		});

		render(template(null), container);
		render(template(), container);
		render(template(2), container);

		expect(container.firstChild.children[ 0 ].selected).to.eql(false);
		expect(container.firstChild.children[ 1 ].selected).to.eql(true);
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<select multiple=""><option value="1">1</option><option value="2">2</option></select>')
		);

		render(template(1), container);

		expect(container.firstChild.children[ 0 ].selected).to.eql(true);
		expect(container.firstChild.children[ 1 ].selected).to.eql(false);
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<select multiple=""><option value="1">1</option><option value="2">2</option></select>')
		);

		render(template('foo'), container);

		expect(container.firstChild.children[ 0 ].selected).to.eql(false);
		expect(container.firstChild.children[ 1 ].selected).to.eql(false);
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<select multiple=""><option value="1">1</option><option value="2">2</option></select>')
		);
	});

	it('should render "select" boolean on select options', () => {

		const template = (val) => ({
			tag: 'select',
			attrs: {
				multiple: true,
				value: val
			},
			children: [{
				tag: 'option',
				attrs: {
					value: 'foo'
				},
				children: 'foo'
			}, {
				tag: 'option',
				attrs: {
					value: 'bar'
				},
				children: 'bar'
			}]
		});

		render(template({}), container);
		render(template(null), container);
		render(template(undefined), container);
		render(template('foo'), container);
		expect(container.firstChild.children[ 0 ].selected).to.eql(true);
		expect(container.firstChild.children[ 1 ].selected).to.eql(false);
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<select multiple=""><option value="foo">foo</option><option value="bar">bar</option></select>')
		);
		render(template(undefined), container);
		render(template(null), container);
		expect(container.firstChild.children[ 0 ].selected).to.eql(false);
		expect(container.firstChild.children[ 1 ].selected).to.eql(false);
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<select multiple=""><option value="foo">foo</option><option value="bar">bar</option></select>')
		);

		render(template('bar'), container);
		expect(container.firstChild.children[ 0 ].selected).to.eql(false);
		expect(container.firstChild.children[ 1 ].selected).to.eql(true);
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<select multiple=""><option value="foo">foo</option><option value="bar">bar</option></select>')
		);
	});

	it('should render "select" boolean on select options', () => {
		const template = (val) => ({
			tag: 'select',
			attrs: {
				multiple: true,
				value: val
			},
			children: [{
				tag: 'option',
				attrs: {
					value: 'foo'
				},
				children: 'foo'
			}, {
				tag: 'option',
				attrs: {
					value: 'bar'
				},
				children: 'bar'
			}]
		});

		render(template('foo'), container);
		expect(container.firstChild.children[ 0 ].selected).to.eql(true);
		expect(container.firstChild.children[ 1 ].selected).to.eql(false);
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<select multiple=""><option value="foo">foo</option><option value="bar">bar</option></select>')// Missing selected markup
		);
	});

	/*
	TODO! Do we need to support this kind of shortcuts, shouldn't user mark options as selected or not like in vanilla JS

	it('should populate the value attribute on select multiple using groups', () => {
		const template = (val) => ({
			tag: 'select',
			attrs: {
				multiple: true,
				value: val
			},
			children: [{
				tag: 'optGroup',
				attrs: {
					label: 'foo-group'
				},
				children: {
					tag: 'option',
					attrs: {
						value: 'foo'
					}
				}
			}, {
				tag: 'optGroup',
				attrs: {
					label: 'bar-group'
				},
				children: {
					tag: 'option',
					attrs: {
						value: 'bar'
					}
				}
			}]
		});

		//render(template(undefined), container);
		render(template([ 'foo', 'bar' ]), container);

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

		render(template(null), container);

		expect(container.firstChild.childNodes[ 0 ].innerHTML).to.eql('<option value="foo"></option>');
		expect(container.firstChild.childNodes[ 1 ].innerHTML).to.eql('<option value="bar"></option>');

		expect(container.firstChild.children[ 0 ].children[ 0 ].selected).to.eql(false);
		expect(container.firstChild.children[ 1 ].children[ 0 ].selected).to.eql(false);
	});
*/
	it('should render "select" boolean on select options', () => {

		const template = (val) => ({
			tag: 'select',
			attrs: {
				multiple: true,
				value: val
			},
			children: [{
				tag: 'option',
				attrs: {
					value: 'foo'
				},
				children: 'foo'
			}, {
				tag: 'option',
				attrs: {
					value: 'bar'
				},
				children: 'bar'
			}]
		});

		render(template('foo'), container);

		expect(container.firstChild.children[ 0 ].selected).to.eql(true);
		expect(container.firstChild.children[ 1 ].selected).to.eql(false);
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<select multiple=""><option value="foo">foo</option><option value="bar">bar</option></select>')
		);

		render(template(), container);

		expect(container.firstChild.children[ 0 ].selected).to.eql(false);
		expect(container.firstChild.children[ 1 ].selected).to.eql(false);
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<select multiple=""><option value="foo">foo</option><option value="bar">bar</option></select>')
		);

	});

	it('should assure the value attribute also set the value property for `textarea`', () => {

		const template = (val) => ({
			tag: 'textarea',
			attrs: {
				value: val
			}
		});

		render(template('foo'), container);

		expect(container.firstChild.value).to.eql('foo');

		render(template('bar'), container);

		expect(container.firstChild.value).to.eql('bar');

		render(template('bar'), container);

		expect(container.firstChild.value).to.eql('bar');

		render(template('foo'), container);

		expect(container.firstChild.value).to.eql('foo');

		render(template(null), container);

		expect(container.firstChild.value).to.eql('');

		render(template(undefined), container); // setting value to undefined sets it 'undefined' in JS

		expect(container.firstChild.value).to.eql('undefined');

		render(template('bar'), container);

		expect(container.firstChild.value).to.eql('bar');

		render(template([]), container);

		expect(container.firstChild.value).to.eql('');

		render(template({}), container);

		expect(container.firstChild.value).to.eql('[object Object]');
	});
});
