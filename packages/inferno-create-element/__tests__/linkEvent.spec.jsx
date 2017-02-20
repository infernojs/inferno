import { expect } from 'chai';
import { linkEvent, render } from 'inferno';
import Component from 'inferno-component';

describe('linkEvent', () => {
	let container;

	beforeEach(function () {
		container = document.createElement('div');
		document.body.appendChild(container);
	});

	afterEach(function () {
		render(null, container);
		container.innerHTML = '';
		document.body.removeChild(container);
	});

	describe('linkEvent on a button (onClick)', () => {
		let test;

		function handleOnClick(props) {
			test = props.test;
		}
		function FunctionalComponent(props) {
			return <button onClick={ linkEvent(props, handleOnClick) } />;
		}

		class StatefulComponent extends Component {
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

	describe('linkEvent on a button (onclick) - no delegation', () => {
		let test;

		function handleOnClick(props) {
			test = props.test;
		}
		function FunctionalComponent(props) {
			return <button onclick={ linkEvent(props, handleOnClick) } />;
		}

		class StatefulComponent extends Component {
			render() {
				return <button onclick={ linkEvent(this.props, handleOnClick) } />;
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

	describe('linkEvent on a input (onInput)', () => {
		let test;
		let event;

		function simulateInput(elm, text) {
			if (typeof Event !== 'undefined') {
				const newEvent = document.createEvent('Event');
				newEvent.initEvent('input', true, true);

				elm.dispatchEvent(newEvent);
			} else {
				elm.oninput({
					target: elm
				});
			}
		}

		function handleOnInput(props, e) {
			test = props.test;
			event = e;
		}
		function FunctionalComponent(props) {
			return <input type="text" onInput={ linkEvent(props, handleOnInput) } value="" />;
		}

		class StatefulComponent extends Component {
			render() {
				return <input type="text" onInput={ linkEvent(this.props, handleOnInput) } value="" />;
			}
		}

		it('should work correctly for functional components', () => {
			render(<FunctionalComponent test="123"/>, container);
			simulateInput(container.querySelector('input'), '123');
			expect(test).to.equal('123');
			expect(event.target.nodeName).to.equal('INPUT');
		});

		it('should work correctly for stateful components', () => {
			render(<StatefulComponent test="456"/>, container);
			simulateInput(container.querySelector('input'), '123');
			expect(test).to.equal('456');
			expect(event.target.nodeName).to.equal('INPUT');
		});
	});
});
