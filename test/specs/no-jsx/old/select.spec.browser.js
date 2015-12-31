import Inferno from '../../../../src';

describe( 'Select - (non-JSX)', () => {

	let container;

	beforeEach(() => {
		container = document.createElement('div');
	});

	afterEach(() => {
		container.innerHTML = '';
	});



	it('should render "select" boolean on select options with numbers', () => {

		const template = Inferno.createTemplate((val) => {
			return {
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
			};
		});

		Inferno.render(template(2), container);

		expect(container.firstChild.children[0].selected).to.eql(false);
		expect(container.firstChild.children[1].selected).to.eql(true);
		expect(
			container.innerHTML
		).to.equal(
			'<select multiple="multiple"><option value="1">1</option><option value="2">2</option></select>'
		);

		Inferno.render(template(1), container);

		expect(container.firstChild.children[0].selected).to.eql(true);
		expect(container.firstChild.children[1].selected).to.eql(false);
		expect(
			container.innerHTML
		).to.equal(
			'<select multiple="multiple"><option value="1">1</option><option value="2">2</option></select>'
		);




//            Inferno.render(template(1), container);

//            expect(container.firstChild.children[0].selected).to.eql(true);
		////          expect(container.firstChild.children[1].selected).to.eql(false);
//            expect(
		//              container.innerHTML
		//        ).to.equal(
		//          '<select multiple="multiple"><option>1</option><option>2</option></select>'
		//    );
	});












	it('should render "select" boolean on select options', () => {

		const template = Inferno.createTemplate(function(val) {
			return {
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

			};
		});

		Inferno.render(template('foo'), container);
		expect(container.firstChild.children[0].selected).to.eql(true);
		expect(container.firstChild.children[1].selected).to.eql(false);
		expect(
			container.innerHTML
		).to.equal(
			'<select multiple="multiple"><option value="foo">foo</option><option value="bar">bar</option></select>'
		);

		Inferno.render(template('bar'), container);
		expect(container.firstChild.children[0].selected).to.eql(false);
		expect(container.firstChild.children[1].selected).to.eql(true);
		expect(
			container.innerHTML
		).to.equal(
			'<select multiple="multiple"><option value="foo">foo</option><option value="bar">bar</option></select>'
		);
	});

	it('should render "select" boolean on select options', () => {
		const template = Inferno.createTemplate(function(val) {
			return {
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

			};
		});

		Inferno.render(template('foo'), container);
		expect(container.firstChild.children[0].selected).to.eql(true);
		expect(container.firstChild.children[1].selected).to.eql(false);
		expect(
			container.innerHTML
		).to.equal(
			'<select multiple="multiple"><option value="foo">foo</option><option value="bar">bar</option></select>' // Missing selected markup
		);
	});

	it('should populates the value attribute on select multiple using groups', () => {
		const template = Inferno.createTemplate(function(val) {
			return {
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
			};
		});

		Inferno.render(template(['foo', 'bar']), container);

		expect(container.firstChild.childNodes[0].innerHTML).to.eql('<option value="foo"></option>');
		expect(container.firstChild.childNodes[1].innerHTML).to.eql('<option value="bar"></option>');

		expect(container.firstChild.children[0].children[0].selected).to.eql(true);
		expect(container.firstChild.children[1].children[0].selected).to.eql(true);

		Inferno.render(template('foo'), container);

		expect(container.firstChild.childNodes[0].innerHTML).to.eql('<option value="foo"></option>');
		expect(container.firstChild.childNodes[1].innerHTML).to.eql('<option value="bar"></option>');

		expect(container.firstChild.children[0].children[0].selected).to.eql(true);
		expect(container.firstChild.children[1].children[0].selected).to.eql(false);


		Inferno.render(template('bar'), container);

		expect(container.firstChild.childNodes[0].innerHTML).to.eql('<option value="foo"></option>');
		expect(container.firstChild.childNodes[1].innerHTML).to.eql('<option value="bar"></option>');

		expect(container.firstChild.children[0].children[0].selected).to.eql(false);
		expect(container.firstChild.children[1].children[0].selected).to.eql(true);

		Inferno.render(template(null), container);

		expect(container.firstChild.childNodes[0].innerHTML).to.eql('<option value="foo"></option>');
		expect(container.firstChild.childNodes[1].innerHTML).to.eql('<option value="bar"></option>');

		expect(container.firstChild.children[0].children[0].selected).to.eql(false);
		expect(container.firstChild.children[1].children[0].selected).to.eql(false);
	});

	it('should render "select" boolean on select options', () => {

		const template = Inferno.createTemplate(function(val) {
			return {
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

			};
		});

		Inferno.render(template('foo'), container);

		expect(container.firstChild.children[0].selected).to.eql(true);
		expect(container.firstChild.children[1].selected).to.eql(false);
		expect(
			container.innerHTML
		).to.equal(
			'<select multiple="multiple"><option value="foo">foo</option><option value="bar">bar</option></select>'
		);
	});

	it('should assure the value attribute also set the value property for `textarea`', () => {

		const template = Inferno.createTemplate(function(val) {
			return {
				tag: 'textarea',
				attrs: {
					value: val
				}
			};
		});

		Inferno.render(template('foo'), container);

		expect(container.firstChild.value).to.eql('foo');

		Inferno.render(template('bar'), container);

		expect(container.firstChild.value).to.eql('bar');

		Inferno.render(template('bar'), container);

		expect(container.firstChild.value).to.eql('bar');

		Inferno.render(template('foo'), container);

		expect(container.firstChild.value).to.eql('foo');

		Inferno.render(template(null), container);

		expect(container.firstChild.value).to.eql('');

		Inferno.render(template(undefined), container);

		expect(container.firstChild.value).to.eql('');

		Inferno.render(template([]), container);

		expect(container.firstChild.value).to.eql('');

		Inferno.render(template({}), container);

		expect(container.firstChild.value).to.eql('[object Object]');
	});
});
