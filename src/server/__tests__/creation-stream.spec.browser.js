import renderStream from './../renderToString.stream';
import concatStream from 'concat-stream';
import Component from './../../component/es2015';
import { createBlueprint } from './../../core/shapes';

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
			description: 'should render div with text child (XSS script attack)',
			template: () => {
				return {
					tag: 'div',
					children: 'Hello world <img src="x" onerror="alert(\'XSS\')">'
				};
			},
			result: '<div>Hello world &lt;img src=&quot;x&quot; onerror=&quot;alert(&#039;XSS&#039;)&quot;&gt;</div>'
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
			description: 'should render a void element correct',
			template: () => {
				return {
					tag: 'input'
				};
			},
			result: '<input>'
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
			description: 'should render div with dangerouslySetInnerHTML',
			template: () => {
				return {
					tag: 'div',
					attrs: {
						dangerouslySetInnerHTML: { __html: '<span>test</span>' }
					}
				};
			},
			result: '<div><span>test</span></div>'
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
			const container = document.createElement('div');
			const vDom = test.template('foo');
			return streamPromise(vDom).then(function (output) {
				document.body.appendChild(container);
				container.innerHTML = output;
				expect(output).to.equal(test.result);
				document.body.removeChild(container);
			});
		});
	});
	it('should not duplicate attrs', () => {
		const tpl = createBlueprint({
			tag: 'div',
			attrs: { id: 'test' }
		});

		return Promise.all([
			streamPromise(tpl()),
			streamPromise(tpl()),
			streamPromise(tpl())
		]).then(function (results) {
			expect(results[ 0 ] === results[ 1 ] && results[ 1 ] === results[ 2 ]).to.equal(true);
		});
	});
});

function streamPromise(dom) {
	return new Promise(function (res, rej) {
		renderStream(dom)
		.on('error', rej)
		.pipe(concatStream(function (buffer) {
			res(buffer.toString('utf-8'));
		}));
	});
}
