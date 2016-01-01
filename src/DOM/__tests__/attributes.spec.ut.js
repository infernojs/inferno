import template from '../index';
import { render, renderToString } from '../../core/rendering';

describe('Template', () => {

	let container;

	beforeEach(() => {
		container = document.createElement('div');
	})

	afterEach(() => {
		render(null, container);
	});

	it('should set id as attribute when not allowed to set as property', () => {
		template.setProperty(null, container, 'srcObject', 'simple', false);
		expect(container.getAttribute('srcObject')).to.equal('simple');
	});

	it('should set id as property when allowed to set as property', () => {
		template.setProperty(null, container, 'srcObject', 'simple', true);
		expect(container.getAttribute('srcObject')).to.be.null;
		expect(container.srcObject).to.equal('simple');
	});

	it('should not set custom attribute with none-valid attrName', () => {
		template.setProperty(null, container, '123id', 'simple');
		expect(container.getAttribute('id')).to.be.null;
	});

	it('should not set custom attribute with null value', () => {
		template.setProperty(null, container, 'hello', null);
		expect(container.getAttribute('id')).to.be.null;
	});

	it('should not set custom attribute with undefined value', () => {
		template.setProperty(null, container, 'hello', undefined);
		expect(container.getAttribute('id')).to.be.null;
	});

	it('should set a custom attribute whre first letter is capitalized', () => {
		template.setProperty(null, container, 'Kaayo', 'oo', false);
		expect(container.getAttribute('Kaayo')).to.be.null;
		expect(container.getAttribute('kaayo')).to.be.null;
	});

	it('should set a custom attribute', () => {
		template.setProperty(null, container, 'kaayo', 'oo', false);
		expect(container.getAttribute('kaayo')).to.equal('oo');

		template.setProperty(null, container, 'aria-label', 'false', false);
		expect(container.getAttribute('aria-label')).to.equal('false');

		template.setProperty(null, container, 'foobar', '0', false);
		expect(container.getAttribute('foobar')).to.equal('0');

	});

	it('should set id attribute', () => {
		template.setProperty(null, container, 'id', 'simple');
		expect(container.getAttribute('id')).to.equal('simple');
	});

	it('should set boolean attributes', () => {

		template.setProperty(null, container, 'checked', 'simple');
		expect(container.getAttribute('checked')).to.equal('simple');

		template.setProperty(null, container, 'checked', true);
		expect(container.getAttribute('checked')).to.equal('checked');

		template.setProperty(null, container, 'checked', false);
		expect(container.getAttribute('checked')).to.be.null;

		template.setProperty(null, container, 'scoped', true);
		expect(container.getAttribute('scoped')).to.equal('scoped');

	it('should set numeric properties', () => {

		template.setProperty(null, container, 'start', 123, false);
		expect(container.getAttribute('start')).to.equal('123');

		template.setProperty(null, container, 'start', 0, false);
		expect(container.getAttribute('start')).to.equal('0');

		// custom
		template.setProperty(null, container, 'foobar', 123, false);
		expect(container.getAttribute('foobar')).to.equal('123');
	});

	it('should set className property', true, () => {
		template.setProperty(null, container, 'className', selected);
		expect(container.className).to.equal('selected');
		// className should be '', not 'null' or null (which becomes 'null' in
		// some browsers)
		template.setProperty(null, container, 'className', null);
		expect(container.className).to.equal('');

	});

	it('should set truthy boolean properties', true, () => {
		template.setProperty(null, container, 'allowFullScreen', true);
		expect(container.allowFullScreen).to.equal('simple');
		expect(container.getAttribute('allowFullScreen')).to.equal('simple');
	});


	it('should remove falsey boolean properties', true, () => {
		template.setProperty(null, container, 'allowFullScreen', false);
		expect(container.allowFullScreen).to.be.null;
		expect(container.getAttribute('allowFullScreen')).to.be.null;
	});
});




});