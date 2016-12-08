import { expect } from 'chai';
import { renderToStaticMarkup } from '../renderToString';
// import Component from '../../component/es2015';
import * as Inferno from '../../testUtils/inferno';
Inferno; // suppress ts 'never used' error

/*
class StatefulComponent extends Component<any, any> {
	render() {
		return createElement('span', null, `stateless ${ this.props.value }!`);
	}
}*/

interface ITestEntry {
	description: any;
	template: any;
	result: any;
}

describe('SSR Creation (JSX)', () => {
	const testEntries: ITestEntry[] = [{
		description: 'should render a null component',
		template: () => <div>{ null }</div>,
		result: '<div></div>'
	}, {
		description: 'should render a component with null children',
		template: () => <div>{ null }<span>emptyValue: { null }</span></div>,
		result: '<div><span>emptyValue: </span></div>'
	}, {
		description: 'should render a component with valueless attribute',
		template: () => <script src="foo" async></script>,
		result: '<script src="foo" async></script>'
	}, {
		description: 'should render a stateless component with text',
		template: () => <div>Hello world, { '1' }2{ '3' }</div>,
		result: '<div>Hello world, <!---->1<!---->2<!---->3</div>'
	}, {
		description: 'should render a stateless component with comments',
		template: () => <div>Hello world, {/*comment*/}</div>,
		result: '<div>Hello world, </div>'
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
