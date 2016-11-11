// import { expect } from 'chai';
// import { render } from './../../DOM/rendering';
// import createElement from './../createElement';
// import * as Inferno from '../../testUtils/inferno';
// Inferno; // suppress ts 'never used' error
//
// describe('CreateElement (non-JSX)', () => {
// 	let container;
//
// 	beforeEach(() => {
// 		container = document.createElement('div');
// 	});
//
// 	afterEach(() => {
// 		container.innerHTML = '';
// 	});
//
// 	it('Should handle hooks props', (done) => {
//
// 		const node = createElement('div', {
// 			key: 'test-key-1',
// 			onComponentDidMount() {
// 				done();
// 			}
// 		}, 'Hooks');
//
// 		render(node, container);
// 		expect(container.innerHTML).to.equal('<div>Hooks</div>');
// 	});
//
// 	it.skip('should handle refs', () => {
// 		let myRef = 'myRef';
// 		const TestComponent = () => {
// 			return <a ref={c => myRef = 'xxxx' + c.toString()}>{myRef}</a>;
// 		};
//
// 		render(createElement(TestComponent), container);
// 		expect(container.innerHTML).to.equal('<div>refs</div>');
// 	});
// });
