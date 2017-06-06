import { streamAsString } from 'inferno-server';
import Component from 'inferno-component';

import concatStream from 'concat-stream';
import createElement from 'inferno-create-element';

class StatefulComponent extends Component {
	render() {
		return createElement('span', null, `stateless ${this.props.value}!`);
	}
}

const FunctionalComponent = ({ value }) => createElement('span', null, `stateless ${value}!`);

describe('SSR Creation Streams - (non-JSX)', () => {
	const testEntries = [
		{
			description: 'should render div with span child',
			template: () => createElement('div', null, createElement('span', null)),
			result: '<div><span></span></div>',
		},
		{
			description: 'should render div with span child and styling',
			template: () => createElement('div', null, createElement('span', { style: 'border-left: 10px;' })),
			result: '<div><span style="border-left: 10px;"></span></div>',
		},
		{
			description: 'should render div with span child and styling #2',
			template: () => createElement('div', null, createElement('span', { style: { borderLeft: 10 } })),
			result: '<div><span style="border-left:10px;"></span></div>',
		},
		{
			description: 'should render div with span child and styling #3',
			template: () => createElement('div', null, createElement('span', { style: { fontFamily: 'Arial' } })),
			result: '<div><span style="font-family:Arial;"></span></div>',
		},
		{
			description: 'should render div with span child (with className)',
			template: () => createElement('div', { className: 'foo' }, createElement('span', { className: 'bar' })),
			result: '<div class="foo"><span class="bar"></span></div>',
		},
		{
			description: 'should render div with text child #2',
			template: () => createElement('div', null, 'Hello world'),
			result: '<div>Hello world</div>',
		},
		{
			description: 'should render div with text child (XSS script attack)',
			template: () => createElement('div', null, 'Hello world <img src="x" onerror="alert(\'XSS\')">'),
			result: '<div>Hello world &lt;img src=&quot;x&quot; onerror=&quot;alert(&#039;XSS&#039;)&quot;&gt;</div>',
		},
		{
			description: 'should render div with text children',
			template: () => createElement('div', null, 'Hello', ' world'),
			result: '<div>Hello<!----> world</div>',
		},
		{
			description: 'should render a void element correct',
			template: () => createElement('input', null),
			result: '<input>',
		},
		{
			description: 'should render div with node children',
			template: () =>
				createElement('div', null, createElement('span', null, 'Hello'), createElement('span', null, ' world!')),
			result: '<div><span>Hello</span><span> world!</span></div>',
		},
		{
			description: 'should render div with node children #2',
			template: () =>
				createElement(
					'div',
					null,
					createElement('span', { id: '123' }, 'Hello'),
					createElement('span', { className: 'foo' }, ' world!'),
				),
			result: '<div><span id="123">Hello</span><span class="foo"> world!</span></div>',
		},
		{
			description: 'should render div with falsy children',
			template: () => createElement('div', null, 0),
			result: '<div>0</div>',
		},
		{
			description: 'should render div with dangerouslySetInnerHTML',
			template: () => createElement('div', { dangerouslySetInnerHTML: { __html: '<span>test</span>' } }),
			result: '<div><span>test</span></div>',
		},
		{
			description: 'should render a stateful component',
			template: value => createElement('div', null, createElement(StatefulComponent, { value })),
			result: '<div><span>stateless foo!</span></div>',
		},
		{
			description: 'should render a stateless component',
			template: value => createElement('div', null, createElement(FunctionalComponent, { value })),
			result: '<div><span>stateless foo!</span></div>',
		},
		{
			description: 'should render a stateless component with object props',
			template: value => createElement('a', { [value]: true }),
			result: '<a foo></a>',
		},
		{
			description: 'should render with array text children',
			template: value => createElement('a', null, ['a', 'b']),
			result: '<a>a<!---->b</a>',
		},
		{
			description: 'should render with array children containing an array of text children',
			template: value => createElement('a', null, [['a', 'b']]),
			result: '<a>a<!---->b</a>',
		},
		{
			description: 'should render with array null children',
			template: value => createElement('a', null, ['a', null]),
			result: '<a>a</a>',
		},
		{
			description: 'should ignore null className',
			template: () => createElement('div', { className: null }),
			result: '<div></div>',
		},
		{
			description: 'should ignore undefined className',
			template: () => createElement('div', { className: undefined }),
			result: '<div></div>',
		},
		{
			description: 'should render opacity style',
			template: () => createElement('div', { style: { opacity: 0.8 } }),
			result: '<div style="opacity:0.8;"></div>',
		},
	];

	testEntries.forEach(test => {
		it(test.description, () => {
			const container = document.createElement('div');
			const vDom = test.template('foo');
			return streamPromise(vDom).then(function(output) {
				document.body.appendChild(container);
				container.innerHTML = output;
				expect(output).toBe(test.result);
				document.body.removeChild(container);
			});
		});
	});

	describe('Component hook', () => {
		it('Should allow changing state in CWM', () => {
			class Another extends Component {
				constructor(props, context) {
					super(props, context);

					this.state = {
						foo: 'bar',
					};
				}

				componentWillMount() {
					this.setState({
						foo: 'bar2',
					});
				}

				render() {
					return (
						<div>
							{this.state.foo}
						</div>
					);
				}
			}

			class Tester extends Component {
				constructor(props, context) {
					super(props, context);

					this.state = {
						foo: 'bar',
					};
				}

				componentWillMount() {
					this.setState({
						foo: 'bar2',
					});
				}

				render() {
					return (
						<div>
							{this.state.foo}
							<Another />
						</div>
					);
				}
			}

			const vDom = <Tester />;
			return streamPromise(vDom).then(function(output) {
				const container = document.createElement('div');
				document.body.appendChild(container);
				container.innerHTML = output;
				expect(output).toBe('<div>bar2<div>bar2</div></div>');
				document.body.removeChild(container);
			});
		});
	});
});

function streamPromise(dom) {
	return new Promise(function(res, rej) {
		streamAsString(dom).on('error', rej).pipe(
			concatStream(function(buffer) {
				res(buffer.toString('utf-8'));
			}),
		);
	});
}
