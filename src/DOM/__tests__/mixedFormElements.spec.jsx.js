import { render } from './../rendering';
import { createVTemplate, createVElement, createVComponent } from './../../core/shapes';
import { createTemplateReducers } from './../../DOM/templates';

const Inferno = {
	createVTemplate,
	createVElement,
	createVComponent
};
const InfernoDOM = {
	createTemplateReducers
};

describe('HTML Form Elements', () => {
	let container;

	beforeEach(() => {
		container = document.createElement('div');
	});

	afterEach(() => {
		container.innerHTML = '';
	});

	describe('After external change', () => {
		it('Should update input check property', () => {
			render(<input type="checkbox" checked={true} />, container);
			expect(container.innerHTML).to.equal('<input type="checkbox">');
			expect(container.firstChild.checked).to.equal(true);

			//
			// Exernal change verification
			//

			const input = container.querySelector('input');
			input.checked = false;
			expect(container.innerHTML).to.equal('<input type="checkbox">');
			expect(container.firstChild.checked).to.equal(false);

			//
			// New Render
			//

			render(<input type="checkbox" checked={true} />, container);
			expect(container.innerHTML).to.equal('<input type="checkbox">');
			expect(container.firstChild.checked).to.equal(true);
		});

		it('Should update textarea value', () => {
			render(<textarea value="Hey People" />, container);
			expect(container.innerHTML).to.equal('<textarea></textarea>');
			expect(container.firstChild.value).to.equal("Hey People");

			//
			// Exernal change verification
			//

			const input = container.querySelector('textarea');
			input.value = "Inferno is cool";
			expect(container.innerHTML).to.equal('<textarea></textarea>');
			expect(container.firstChild.value).to.equal("Inferno is cool");

			//
			// New Render
			//

			render(<textarea value="Hey People" />, container);
			expect(container.innerHTML).to.equal('<textarea></textarea>');
			expect(container.firstChild.value).to.equal("Hey People");

			//
			// New Render, new value
			//

			render(<textarea value="Hey People again" />, container);
			expect(container.innerHTML).to.equal('<textarea></textarea>');
			expect(container.firstChild.value).to.equal("Hey People again");
		});

		it('Should update text input value', () => {
			render(<input type="text" value="Hey People" />, container);
			expect(container.innerHTML).to.equal('<input type="text">');
			expect(container.firstChild.value).to.equal("Hey People");

			//
			// Exernal change verification
			//

			const input = container.querySelector('input');
			input.value = "Inferno is cool";
			expect(container.innerHTML).to.equal('<input type="text">');
			expect(container.firstChild.value).to.equal("Inferno is cool");

			//
			// New Render
			//

			render(<input type="text" value="Hey People" />, container);
			expect(container.innerHTML).to.equal('<input type="text">');
			expect(container.firstChild.value).to.equal("Hey People");

			//
			// New Render, new value
			//

			render(<input type="text" value="Hey People again" />, container);
			expect(container.innerHTML).to.equal('<input type="text">');
			expect(container.firstChild.value).to.equal("Hey People again");
		});

		it('Should update radio button', () => {
			render(
				<div>
					<input type="radio" name="gender" value="male" checked /> Male
					<input type="radio" name="gender" value="female"/> Female
					<input type="radio" name="gender" value="other"/> Other
				</div>, container);

			expect(container.firstChild.firstChild.value).to.equal("male");
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
					<input type="radio" name="gender" value="male" checked /> Male
					<input type="radio" name="gender" value="female"/> Female
					<input type="radio" name="gender" value="other"/> Other
				</div>, container);

			expect(container.firstChild.firstChild.value).to.equal("male");
			expect(container.firstChild.firstChild.checked).to.equal(true, 'this fails');


			//
			// New Render, new value
			//

			render(
				<div>
					<input type="radio" name="gender" value="male" /> Male
					<input type="radio" name="gender" checked value="female"/> Female
					<input type="radio" name="gender" value="other"/> Other
				</div>, container);

			expect(container.firstChild.firstChild.value).to.equal("male");
			expect(container.firstChild.firstChild.checked).to.equal(false);
			expect(container.firstChild.children[1].value).to.equal("female");
			expect(container.firstChild.children[1].checked).to.equal(true);

		});

	});
});
