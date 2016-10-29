import { expect } from 'chai';
import { render } from './../rendering';
import * as Inferno from '../../testUtils/inferno';
Inferno; // suppress ts 'never used' error

const Comp = () => [
	1, 2, 3
];
const Comp2 = () => [
	3, 2, 1
];

describe('Fragments (JSX)', () => {
	let container;

	beforeEach(() => {
		container = document.createElement('div');
	});

	it('should mount and patch a fragment from render', () => {
		render([1, 2, 3], container);
		expect(container.innerHTML).to.equal('123');
		render([3, 2, 1], container);
		expect(container.innerHTML).to.equal('321');
		render(<div />, container);
		expect(container.innerHTML).to.equal('<div></div>');
		render([1, 2, 3], container);
		expect(container.innerHTML).to.equal('123');
	});

	it('should mount and patch a fragment from stateless component render', () => {
		render(<Comp />, container);
		expect(container.innerHTML).to.equal('123');
		render(<Comp2 />, container);
		expect(container.innerHTML).to.equal('321');
		render((
			<div>
				<Comp />
				<Comp />
				<Comp />
			</div>
		), container);
		expect(container.innerHTML).to.equal('<div>123123123</div>');
		render(<div />, container);
		expect(container.innerHTML).to.equal('<div></div>');
		render((
			<div>
				<Comp />
				<Comp />
				<Comp />
			</div>
		), container);
		expect(container.innerHTML).to.equal('<div>123123123</div>');
		render((
			<div>
				<Comp2 />
				<Comp2 />
				<Comp2 />
			</div>
		), container);
		expect(container.innerHTML).to.equal('<div>321321321</div>');
	});

	it('should mount and patch a fragment from stateless component render #2', () => {
		render((
			<div>
				<Comp key='1'/>
				<Comp2 key='2'/>
				<Comp key='3'/>
			</div>
		), container);
		expect(container.innerHTML).to.equal('<div>123321123</div>');
		render((
			<div>
				<Comp2 key='2'/>
				<Comp key='1'/>
				<Comp key='3'/>
			</div>
		), container);
		expect(container.innerHTML).to.equal('<div>321123123</div>');
	});
});
