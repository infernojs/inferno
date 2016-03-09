import renderToString from '../renderToString';

describe('SSR Creation - (non-JSX)', () => {
	[{
		description: 'should render div with span child',
		template: () => {
			return {
				dom: null,
				tag: 'div',
				children: {
					dom: null,
					tag: 'span'
				}
			};
		},
		result: '<div><span></span></div>'
	}, {
		description: 'should render div with span child (with className)',
		template: () => {
			return {
				dom: null,
				tag: 'div',
				className: 'foo',
				children: {
					dom: null,
					className: 'bar',
					tag: 'span'
				}
			};
		},
		result: '<div class="foo"><span class="bar"></span></div>'
	}, {
		description: 'should render div with text child',
		template: () => {
			return {
				dom: null,
				tag: 'div',
				children: 'Hello world'
			};
		},
		result: '<div>Hello world</div>'
	}, {
		description: 'should render div with text children',
		template: () => {
			return {
				dom: null,
				tag: 'div',
				children: [ 'Hello', ' world' ]
			};
		},
		result: '<div>Hello<!-- --> world</div>'
	}, {
		description: 'should render div with node children',
		template: () => {
			return {
				dom: null,
				tag: 'div',
				children: [
					{
						tag: 'span',
						children: 'Hello'
					},
					{
						tag: 'span',
						children: ' world!'
					}
				]
			};
		},
		result: '<div><span>Hello</span><span> world!</span></div>'
	}, {
		description: 'should render div with node children #2',
		template: () => {
			return {
				dom: null,
				tag: 'div',
				children: [
					{
						tag: 'span',
						children: 'Hello',
						attrs: {
							id: '123'
						}
					},
					{
						tag: 'span',
						children: ' world!',
						className: 'foo'
					}
				]
			};
		},
		result: '<div><span id="123">Hello</span><span class="foo"> world!</span></div>'
	}
	].forEach(test => {
		it(test.description, () => {
			const output = renderToString(test.template());
			expect(output).to.equal(test.result);
		});
	});

});