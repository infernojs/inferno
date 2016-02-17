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
		description: 'should render div with text child',
		template: () => {
			return {
				dom: null,
				tag: 'div',
				children: 'Hello world'
			};
		},
		result: '<div>Hello world</div>'
	}].forEach(test => {
		it(test.description, () => {
			const output = renderToString(test.template());
			expect(output).to.equal(test.result);
		});
	});

});