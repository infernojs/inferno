
import { render } from 'inferno';
import { innerHTML } from 'inferno-utils';

describe('HTML Form Elements', () => {
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

	describe('Textarea - defaultValue', () => {
		it('Should have value as defaultValue when actual value is null', () => {
			render(<textarea defaultValue="Hey Inferno" value={null}/>, container);
			expect(container.firstChild.value).to.equal('Hey Inferno');
			expect(container.firstChild.defaultValue).to.equal('Hey Inferno');
		});

		it('Should have value as defaultValue when actual value is undefined', () => {
			render(<textarea defaultValue="Hey Inferno"/>, container);
			expect(container.firstChild.value).to.equal('Hey Inferno');
			expect(container.firstChild.defaultValue).to.equal('Hey Inferno');
		});

		it('Should not use defaultValue when actual value is empty string', () => {
			render(<textarea defaultValue="Hey Inferno" value=""/>, container);
			expect(container.firstChild.value).to.equal('');
			expect(container.firstChild.defaultValue).to.equal('');
		});

		it('Should not use defaultValue when actual value is number', () => {
			render(<textarea defaultValue="Hey Inferno" value={1}/>, container);
			expect(container.firstChild.value).to.equal('1');
			expect(container.firstChild.defaultValue).to.equal('1'); // As Per React, its 1 and not Hey Inferno
		});

		it('Should not use defaultValue when actual value is object', () => {
			render(<textarea defaultValue="Hey Inferno" value={{ a: 1 }}/>, container);
			expect(container.firstChild.value).to.equal('[object Object]');
			expect(container.firstChild.defaultValue).to.equal('[object Object]');
		});

		it('Should have false as string when given as defaultValue', () => {
			render(<textarea defaultValue={false}/>, container);
			expect(container.firstChild.value).to.equal('false');
			expect(container.firstChild.defaultValue).to.equal('false');
		});
	});

	describe('Input - defaultValue', () => {
		it('Should have value as defaultValue when actual value is null', () => {
			render(<input defaultValue="Hey Inferno" value={null}/>, container);

			expect(container.firstChild.value).to.equal('Hey Inferno');
			expect(container.firstChild.defaultValue).to.equal('Hey Inferno');
		});

		it('Should have value as defaultValue when actual value is undefined', () => {
			render(<input defaultValue="Hey Inferno"/>, container);

			expect(container.firstChild.value).to.equal('Hey Inferno');
			expect(container.firstChild.defaultValue).to.equal('Hey Inferno');
		});

		it('Should not use defaultValue when actual value is empty string', () => {
			render(<input defaultValue="Hey Inferno" value=""/>, container);
			expect(container.firstChild.value).to.equal('');
		});

		it('Should not use defaultValue when actual value is number', () => {
			render(<input defaultValue="Hey Inferno" value={1}/>, container);
			expect(container.firstChild.value).to.equal('1');
			expect(container.firstChild.defaultValue).to.equal('1');
		});

		it('Should not use defaultValue when actual value is object', () => {
			render(<input defaultValue="Hey Inferno" value={{ a: 1 }}/>, container);
			expect(container.firstChild.value).to.equal('[object Object]');
			expect(container.firstChild.defaultValue).to.equal('[object Object]');
		});

		it('Should be possible to create input with type color', () => {
			render(<input type="color"/>, container);
			expect(container.firstChild.getAttribute('type')).to.equal('color');
		});

		it('Should be possible to create input with type range', () => {
			function change() {
			}

			render(
				<input
					min={0}
					max={255}
					value={75}
					onChange={change}
					type="range"
				/>, container);
			expect(container.firstChild.getAttribute('type')).to.equal('range');
			expect(container.firstChild.value).to.equal('75');

			render(
				<input
					min={0}
					max={255}
					value={11}
					onChange={change}
					type="range"
				/>, container);

			container.firstChild.oninput({}); // causes exception
			expect(container.firstChild.getAttribute('type')).to.equal('range');
			expect(container.firstChild.value).to.equal('11');
		});
	});

	describe('After external change', () => {
		it('Should update input check property', () => {
			render(<input type="checkbox" checked={true}/>, container);
			expect(container.innerHTML).to.equal(innerHTML('<input type="checkbox">'));
			expect(container.firstChild.checked).to.equal(true);

			//
			// Exernal change verification
			//

			const input = container.querySelector('input');
			input.checked = false;
			expect(container.innerHTML).to.equal(innerHTML('<input type="checkbox">'));
			expect(container.firstChild.checked).to.equal(false);

			//
			// New Render
			//

			render(<input type="checkbox" checked={true}/>, container);
			expect(container.innerHTML).to.equal(innerHTML('<input type="checkbox">'));
			expect(container.firstChild.checked).to.equal(true);
		});

		it('Should update textarea value', () => {
			render(<textarea value="Hey People"/>, container);
			expect(container.firstChild.value).to.equal('Hey People');
			expect(container.firstChild.defaultValue).to.equal('Hey People');

			//
			// Exernal change verification
			//

			const input = container.querySelector('textarea');
			input.value = 'Inferno is cool';
			expect(container.innerHTML).to.equal(input.outerHTML);
			expect(container.firstChild.value).to.equal('Inferno is cool');

			//
			// New Render
			//

			render(<textarea value="Hey People"/>, container);
			expect(container.firstChild.value).to.equal('Hey People');
			expect(container.firstChild.defaultValue).to.equal('Hey People');

			//
			// New Render, new value
			//

			render(<textarea value="Hey People again"/>, container);
			expect(container.firstChild.value).to.equal('Hey People again');
			expect(container.firstChild.defaultValue).to.equal('Hey People again');
		});

		it('Should update text input value', () => {
			render(<input type="text" value="Hey People"/>, container);
			expect(container.firstChild.value).to.equal('Hey People');

			//
			// Exernal change verification
			//

			const input = container.querySelector('input');
			input.value = 'Inferno is cool';
			expect(container.firstChild.value).to.equal('Inferno is cool');

			//
			// New Render
			//

			render(<input type="text" value="Hey People"/>, container);
			expect(container.firstChild.value).to.equal('Hey People');

			//
			// New Render, new value
			//

			render(<input type="text" value="Hey People again"/>, container);
			expect(container.firstChild.value).to.equal('Hey People again');
		});

		it('Should update radio button', () => {
			render(
				<div>
					<input type="radio" name="gender" value="male" checked/> Male
					<input type="radio" name="gender" value="female"/> Female
					<input type="radio" name="gender" value="other"/> Other
				</div>, container);

			expect(container.firstChild.firstChild.value).to.equal('male');
			expect(container.firstChild.firstChild.checked).to.equal(true);

			//
			// Exernal change verification
			//

			const radiobutton = container.querySelector('input');
			radiobutton.checked = false;
			expect(container.firstChild.firstChild.checked).to.equal(false);

			//
			// New Render
			//

			render(
				<div>
					<input type="radio" name="gender" value="male" checked/> Male
					<input type="radio" name="gender" value="female"/> Female
					<input type="radio" name="gender" value="other"/> Other
				</div>, container);

			expect(container.firstChild.firstChild.value).to.equal('male');
			expect(container.firstChild.firstChild.checked).to.equal(true, 'this fails');

			//
			// New Render, new value
			//

			render(
				<div>
					<input type="radio" name="gender" value="male"/> Male
					<input type="radio" name="gender" checked value="female"/> Female
					<input type="radio" name="gender" value="other"/> Other
				</div>, container);

			expect(container.firstChild.firstChild.value).to.equal('male');
			expect(container.firstChild.firstChild.checked).to.equal(false);
			expect(container.firstChild.children[ 1 ].value).to.equal('female');
			expect(container.firstChild.children[ 1 ].checked).to.equal(true);
		});

		it('Should not trigger onClick twice when using synthetic onClick on radio', () => {
			const spy1 = sinon.spy();
			const spy2 = sinon.spy();
			const spy3 = sinon.spy();

			render(
				<div>
					<input onClick={spy1} type="radio" name="gender" value="male"/>
					<input onClick={spy2} type="radio" name="gender" value="female"/>
					<input onClick={spy3} type="radio" id="test" name="gender" value="other"/>
				</div>, container);

			//
			// Exernal change verification
			//

			let radiobutton = container.querySelector('#test');
			radiobutton.click();
			expect(radiobutton.checked).to.equal(true);

			expect(spy1.callCount).to.equal(0);
			expect(spy2.callCount).to.equal(0);
			expect(spy3.callCount).to.equal(1);

			//
			// New Render
			//

			render(
				<div>
					<input onClick={spy1} type="radio" name="gender" value="male"/>
					<input onClick={spy2} type="radio" name="gender" value="female"/>
					<input onClick={spy3} type="radio" name="gender" value="other"/>
				</div>, container);

			expect(spy1.callCount).to.equal(0);
			expect(spy2.callCount).to.equal(0);
			expect(spy3.callCount).to.equal(1);

			//
			// New Render, new value
			//

			render(
				<div>
					<input onClick={spy1} type="radio" name="gender" value="male"/>
					<input onClick={spy2} type="radio" name="gender" value="female"/>
					<input onClick={spy3} type="radio" name="gender" value="other"/>
				</div>, container);

			expect(spy1.callCount).to.equal(0);
			expect(spy2.callCount).to.equal(0);
			expect(spy3.callCount).to.equal(1);


			render(
				<div>
					<input onClick={spy1} type="radio" id="test" name="gender" value="male"/>
					<input onClick={spy2} type="radio" name="gender" value="female"/>
					<input onClick={spy3} type="radio" name="gender" value="other"/>
				</div>, container);

			expect(spy1.callCount).to.equal(0);
			expect(spy2.callCount).to.equal(0);
			expect(spy3.callCount).to.equal(1);

			radiobutton = container.querySelector('#test');

			radiobutton.click();

			expect(spy1.callCount).to.equal(1);
			expect(spy2.callCount).to.equal(0);
			expect(spy3.callCount).to.equal(1);

			render(
				<div>
					<input onClick={spy1} type="radio" id="test" name="gender" checked={true} value="male"/>
					<input onClick={spy2} type="radio" name="gender" checked={false} value="female"/>
					<input onClick={spy3} type="radio" name="gender" checked={false} value="other"/>
				</div>, container);

			const node = container.firstChild;

			expect(node.childNodes[ 0 ].checked).to.equal(true);
			expect(node.childNodes[ 1 ].checked).to.equal(false);
			expect(node.childNodes[ 2 ].checked).to.equal(false);
		});


		it('Should change others radio inputs should have single one checked', () => {
			render(
				<div>
					<input type="radio" name="gender" value="male" checked={false}/>
					<input type="radio" name="gender" value="female" checked={true}/>
					<input type="radio" id="test" name="gender" value="other" checked={false}/>
				</div>, container);

			let node = container.firstChild;

			expect(node.childNodes[ 0 ].checked).to.equal(false);
			expect(node.childNodes[ 1 ].checked).to.equal(true);
			expect(node.childNodes[ 2 ].checked).to.equal(false);

			render(
				<div>
					<input type="radio" name="gender" value="male" checked={true}/>
					<input type="radio" name="gender" value="female" checked={false}/>
					<input type="radio" id="test" name="gender" value="other" checked={false}/>
				</div>, container);

			node = container.firstChild;

			expect(node.childNodes[ 0 ].checked).to.equal(true);
			expect(node.childNodes[ 1 ].checked).to.equal(false);
			expect(node.childNodes[ 2 ].checked).to.equal(false);

			render(
				<div>
					<input type="radio" name="gender" value="female" checked={false}/>
					<input type="radio" id="test" name="gender" value="other" checked={false}/>
				</div>, container);

			node = container.firstChild;

			expect(node.childNodes[ 0 ].checked).to.equal(false);
			expect(node.childNodes[ 1 ].checked).to.equal(false);

			render(
				<div>
					<input type="radio" name="gender" value="female" checked={false}/>
					<input type="radio" id="test" name="gender" value="other" checked={true}/>
				</div>, container);

			node = container.firstChild;

			expect(node.childNodes[ 0 ].checked).to.equal(false);
			expect(node.childNodes[ 1 ].checked).to.equal(true);

			render(
				<div>
					<input type="radio" name="gender" value="female" checked={false}/>
					<input type="radio" id="test" name="gender" value="other" checked={true}/>
					<input type="radio" name="gender" value="female" checked={false}/>
					<input type="radio" name="gender" value="dqw" checked={false}/>
				</div>, container);

			node = container.firstChild;

			expect(node.childNodes[ 0 ].checked).to.equal(false);
			expect(node.childNodes[ 1 ].checked).to.equal(true);
			expect(node.childNodes[ 2 ].checked).to.equal(false);
			expect(node.childNodes[ 3 ].checked).to.equal(false);


			render(
				<div>
					<input type="radio" name="gender" value="female" checked={false}/>
				</div>, container);

			node = container.firstChild;

			expect(node.childNodes[ 0 ].checked).to.equal(false);

			render(
				<div>
					<input type="radio" name="gender" value="female" checked={true}/>
				</div>, container);

			node = container.firstChild;

			expect(node.childNodes[ 0 ].checked).to.equal(true);
		});
	});
});
