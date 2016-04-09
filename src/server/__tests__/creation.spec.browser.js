import renderToString from './../renderToString';
import Component from './../../component';

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
			result: '<div>Hello<!-- --> world</div>'
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
				}
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
				}
			},
			result: '<div><span>stateless foo!</span></div>'
		}
	].forEach(test => {
		it(test.description, () => {
			const output = renderToString(test.template('foo'));
			expect(output).to.equal(test.result);
		});
	});

});
