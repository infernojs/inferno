//import getFormElementValues from '../getFormElementValues';
//import { render, renderToString } from '../rendering';
//
//describe('getFormElemenValues', () => {
//
//	let container;
//
//	it('should return null if there is no node as first arg', () => {
//		expect(getFormElementValues()).to.equal(null);
//	});
//
//	it('should get form values for radio button and checkboxes (property)', () => {
//		container = document.createElement('input');
//		container.checked = true;
//		// type is missing, return nothing
//		expect(getFormElementValues(container)).to.equal('');
//		container.type = 'checkbox';
//		expect(getFormElementValues(container)).to.equal(true);
//		container.type = 'radio';
//		expect(getFormElementValues(container)).to.equal(true);
//		container.type = 'radio';
//		container.checked = false;
//		expect(getFormElementValues(container)).to.equal(false);
//		container.type = 'radio';
//		container.checked = false;
//		expect(getFormElementValues(container)).to.equal(false);
//		container.type = 'checkbox';
//		container.checked = 'false';
//		expect(getFormElementValues(container)).to.equal(true);
//	});
//
//	it('should get form values for radio button and checkboxes (attribute)', () => {
//		container = document.createElement('input');
//		container.checked = true;
//		container.type = 'checkbox';
//		container.setAttribute('checked', false);
//		expect(getFormElementValues(container)).to.equal(false);
//		container.type = 'radio';
//		container.setAttribute('checked', false);
//		expect(getFormElementValues(container)).to.equal(false);
//		container.type = 'checkbox';
//		container.setAttribute('checked', true);
//		expect(getFormElementValues(container)).to.equal(true);
//		container.type = 'radio';
//		container.setAttribute('checked', true);
//		expect(getFormElementValues(container)).to.equal(true);
//	});
//
//	it('should get form values for select / select multiple', () => {
//		container = document.createElement('select');
//		container.multiple = false;
//		container.value = 1;
//		const optionElement = document.createElement('option');
//		optionElement.value = 1;
//		const optionElement1 = document.createElement('option');
//		optionElement1.value = 2;
//		container.appendChild(optionElement);
//		container.appendChild(optionElement1);
//		expect(getFormElementValues(container)).to.equal('1');
//		container.multiple = true;
//		container.value = [ 1,2 ];
//		container.multiple = true;
//		container.setAttribute('value', [ 1,2 ]);
//		optionElement1.selected = true;
//		expect(getFormElementValues(container)).to.equal('2');
//		optionElement.selected = true;
//		optionElement1.selected = false;
//		expect(getFormElementValues(container)).to.equal('1');
//		optionElement.selected = false;
//		optionElement1.selected = false;
//		expect(getFormElementValues(container)).to.equal(undefined);
//		optionElement.setAttribute('selected', 'selected');
//	});
//});
