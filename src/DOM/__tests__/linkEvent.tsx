import { expect } from 'chai';
import Inferno from 'inferno';
import Component from 'inferno-component';

const render = Inferno.render;
const linkEvent = Inferno.linkEvent;

describe('linkEvent', () => {
	let container;

	beforeEach(() => {
		container = document.createElement('div');
		document.body.appendChild(container);
	});

	afterEach(() => {
		document.body.removeChild(container);
		container.innerHTML = '';
	});

	describe('linkEvent on a button (onClick)', () => {
		let test;

		function handleOnClick(props) {
			test = props.test;
		}
		function FunctionalComponent(props) {
			return <button onClick={ linkEvent(props, handleOnClick) } />;
		}

		class StatefulComponent extends Component<any, any> {
			render() {
				return <button onClick={ linkEvent(this.props, handleOnClick) } />;
			}
		}

		it('should work correctly for functional components', () => {
			render(<FunctionalComponent test="123"/>, container);
			container.querySelector('button').click();
			expect(test).to.equal('123');
		});

		it('should work correctly for stateful components', () => {
			render(<StatefulComponent test="456"/>, container);
			container.querySelector('button').click();
			expect(test).to.equal('456');
		});
	});
});
