import Inferno from '../../../../src';
import get from '../../../tools/get';

export default function elementsTestsJsx(describe, expect) {
	it('should render a basic example', () => {
		const test = Inferno.renderToString(
			<div>Hello world</div>
		);
		const expected = '<div>Hello world</div>';
		expect(test).to.equal(expected);
	});
	it('should render a basic example with dynamic values', () => {
		const values = ['Inferno', 'Owns'];
		const test = Inferno.renderToString(
			<div>Hello world - { values[0] } { values[1] }</div>
		);
		const expected = '<div>Hello world - Inferno Owns</div>';
		expect(test).to.equal(expected);
	});

	it('should render a basic example with dynamic values and props', () => {
		const values = ['Inferno', 'Rocks'];
		const test = Inferno.renderToString(
			<div className='foo'>
				<span className='bar'>{ values[0] }</span>
				<span className='yar'>{ values[1] }</span>
			</div>
		);
		expect(
			test
		).to.equal(
			`<div class="foo"><span class="bar">Inferno</span><span class="yar">Rocks</span></div>`
		);
	});
}
