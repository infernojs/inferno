import { expect } from 'chai';
import { renderToStaticMarkup } from '../renderToString';
// import Component from '../../component/es2015';
import createElement from '../../factories/createElement';
import * as Inferno from '../../testUtils/inferno';
Inferno; // suppress ts 'never used' error

/*
class StatefulComponent extends Component<any, any> {
	render() {
		return createElement('span', null, `stateless ${ this.props.value }!`);
	}
}*/

const FunctionalComponent = ({ value }) => createElement('span', null, `stateless ${ value }!`);

interface ITestEntry {
	description: any;
	template: any;
	result: any;
}

describe('SSR Creation (non-JSX)', () => {
	const testEntries: ITestEntry[] = [{
		description: 'should render div with span child',
		template: () => createElement('div', null, createElement('span')),
		result: '<div><span></span></div>'
	}, {
		description: 'should render div with span child and styling',
		template: () => createElement('div', null, createElement('span', { style: 'border-left: 10px;' })),
		result: '<div><span style="border-left: 10px;"></span></div>'
	}, {
		description: 'should render div with span child and styling #2',
		template: () => createElement('div', null, createElement('span', { style: { borderLeft: 10 } })),
		result: '<div><span style="border-left:10px;"></span></div>'
	}, {
		description: 'should render div with span child and styling #3',
		template: () => createElement('div', null, createElement('span', { style: { fontFamily: 'Arial' } })),
		result: '<div><span style="font-family:Arial;"></span></div>'
	}, {
		description: 'should render div with span child (with className)',
		template: () => createElement('div', { className: 'foo' }, createElement('span', { className: 'bar' })),
		result: '<div class="foo"><span class="bar"></span></div>'
	}, {
		description: 'should render div with text child',
		template: () => createElement('div', null, 'Hello world'),
		result: '<div>Hello world</div>'
	}, {
		description: 'should render div with text child (XSS script attack)',
		template: () => createElement('div', null, 'Hello world <img src="x" onerror="alert(\'XSS\')">'),
		result: '<div>Hello world &lt;img src=&quot;x&quot; onerror=&quot;alert(&#039;XSS&#039;)&quot;&gt;</div>'
	}, {
		description: 'should render div with text children',
		template: () => createElement('div', null, 'Hello', ' world'),
		result: '<div>Hello<!----> world</div>'
	}, {
		description: 'should render a void element correct',
		template: () => createElement('input'),
		result: '<input>'
	}, {
		description: 'should render div with node children',
		template: () => createElement('div', null, createElement('span', null, 'Hello'), createElement('span', null, ' world!')),
		result: '<div><span>Hello</span><span> world!</span></div>'
	}, {
		description: 'should render div with node children #2',
		template: () => createElement('div', null, createElement('span', { id: '123' }, 'Hello'), createElement('span', { className: 'foo' }, ' world!')),
		result: '<div><span id="123">Hello</span><span class="foo"> world!</span></div>'
	}, {
		description: 'should render div with falsy children',
		template: () => createElement('div', null, 0),
		result: '<div>0</div>'
	}, {
		description: 'should render div with dangerouslySetInnerHTML',
		template: () => createElement('div', { dangerouslySetInnerHTML: { __html: '<span>test</span>' } }),
		result: '<div><span>test</span></div>'
	}, {
		description: 'should render a stateless component',
		template: (value) => createElement('div', null, createElement(FunctionalComponent, { value })),
		result: '<div><span>stateless foo!</span></div>'
	}, {
		description: 'should render a div with styles',
		template: () => createElement('div', { style: { display: 'block', width: '50px' } }),
		result: '<div style="display:block;width:50px;"></div>'
	}];

	testEntries.forEach(test => {
		it(test.description, () => {
			const container = document.createElement('div');
			const vDom = test.template('foo');
			const output = renderToStaticMarkup(vDom);

			document.body.appendChild(container);
			container.innerHTML = output;
			expect(output).to.equal(test.result);
			document.body.removeChild(container);
		});
	});

});
