import { expect } from 'chai';
import createStaticVElementClone from '../createStaticVElementClone';
import { createOptBlueprint, createStaticVElement } from '../../core/shapes';

describe('createStaticVElementClone (non-JSX)', () => {
	let container;

	beforeEach(() => {
		container = document.createElement('div');
	});

	afterEach(() => {
		container.innerHTML = '';
	});

	it('Should create a static VElement clone (no props)', () => {
		const staticVElement = createStaticVElement('a', null, null);
		const element = createOptBlueprint(staticVElement, null, null, null, null, null, null, null, null);

		expect((element.clone as Element).tagName).to.equal('A');
	});

	it('Should create a static VElement clone (with props)', () => {
		const props: any = { hello: 'world' };
		const staticVElement = createStaticVElement('a', props, null);
		const element = createOptBlueprint(staticVElement, null, null, null, null, null, null, null, null);

		expect((element.clone as Element).tagName).to.equal('A');
	});

	it('Should create a static VElement clone (with children)', () => {
		const child = createStaticVElement('a', null, null);
		const staticVElement = createStaticVElement('a', null, child);
		const element = createOptBlueprint(staticVElement, null, null, null, null, null, null, null, null);

		expect((element.clone as Element).innerHTML).to.equal('<a></a>');
	});

	it('Should create a static VElement clone (with array children)', () => {
		const child = createStaticVElement('a', null, null);
		const staticVElement = createStaticVElement('a', null, [child]);
		const element = createOptBlueprint(staticVElement, null, null, null, null, null, null, null, null);

		expect((element.clone as Element).innerHTML).to.equal('<a></a>');
	});

	it('Should create a static VElement clone (SVG)', () => {
		const staticVElement = createStaticVElement('svg', null, null);
		const element = createOptBlueprint(staticVElement, null, null, null, null, null, null, null, null);
		const clone = createStaticVElementClone(element, true);
		expect((clone as Element).tagName).to.equal('svg');
	});
});
