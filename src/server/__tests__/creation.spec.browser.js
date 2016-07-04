import renderToString from './../renderToString';
import Component from './../../component/es2015';

class StatefulComponent extends Component {
	render() {
		return {
			tag: 'span',
			children: `stateless ${ this.props.value }!`
		};
	}
}

describe('SSR Creation - (non-JSX)', () => {
	[
		{
			description: 'should render div with span child',
			template: () => {
				return {
					tag: 'div',
					children: {
						dom: null,
						tag: 'span'
					}
				};
			},
			result: '<div><span></span></div>'
		}, {
			description: 'should render div with span child and styling',
			template: () => {
				return {
					tag: 'div',
					children: {
						dom: null,
						tag: 'span',
						style: 'border-left: 10px;'
					}
				};
			},
			result: '<div><span style="border-left: 10px;"></span></div>'
		}, {
			description: 'should render div with span child and styling #2',
			template: () => {
				return {
					tag: 'div',
					children: {
						dom: null,
						tag: 'span',
						style: { borderLeft: 10 }
					}
				};
			},
			result: '<div><span style="border-left:10px;"></span></div>'
		}, {
			description: 'should render div with span child and styling #3',
			template: () => {
				return {
					tag: 'div',
					children: {
						dom: null,
						tag: 'span',
						style: { fontFamily: 'Arial' }
					}
				};
			},
			result: '<div><span style="font-family:Arial;"></span></div>'
		}, {
			description: 'should render div with span child (with className)',
			template: () => {
				return {
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
					tag: 'div',
					children: 'Hello world'
				};
			},
			result: '<div>Hello world</div>'
		}, {
			description: 'should render div with text children',
			template: () => {
				return {
					tag: 'div',
					children: [ 'Hello', ' world' ]
				};
			},
			result: '<div>Hello<!----> world</div>'
		}, {
			description: 'should render div with node children',
			template: () => {
				return {
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
		}, {
			description: 'should render div with falsy children',
			template: () => {
				return {
					tag: 'div',
					children: 0
				};
			},
			result: '<div>0</div>'
		}, {
			description: 'should render a stateful component',
			template: (value) => {
				return {
					tag: 'div',
					children: {
						tag: StatefulComponent,
						attrs: {
							value
						}
					}
				};
			},
			result: '<div><span>stateless foo!</span></div>'
		}, {
			description: 'should render a stateless component',
			template: (value) => {
				return {
					tag: 'div',
					children: {
						tag: ({ value }) => ({
							tag: 'span',
							children: `stateless ${ value }!`
						}),
						attrs: {
							value
						}
					}
				};
			},
			result: '<div><span>stateless foo!</span></div>'
		}
	].forEach(test => {
		it(test.description, () => {
			const output = renderToString(test.template('foo'), true);
			expect(output).to.equal(test.result);
		});
	});

});
