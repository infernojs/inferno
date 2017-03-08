import { expect } from 'chai';
import { render } from 'inferno';
import { createElement, Component } from '../dist-es';

describe('svg', () => {
	let container;

	beforeEach(function () {
		container = document.createElement('div');
	});

	afterEach(function () {
		render(null, container);
	});

	it('Should work with normal svg attributes', () => {
		render(createElement('svg', null, [
			createElement('stop', {
				offset: 0,
				stopColor: 'white',
				stopOpacity: 0.5
			})
		]), container);

		expect(container.firstChild.firstChild.tagName).to.equal('stop');
		expect(container.firstChild.firstChild.getAttribute('stop-color')).to.equal('white');
		expect(container.firstChild.firstChild.getAttribute('stop-opacity')).to.equal('0.5');
	});

	it('Should work with namespace svg attributes', () => {
		render(createElement('svg', null, [
			createElement('image', {
				xlinkHref: 'http://i.imgur.com/w7GCRPb.png'
			})
		]), container);

		expect(container.firstChild.firstChild.tagName).to.equal('image');
		expect(container.firstChild.firstChild.getAttribute('xlink:href')).to.equal('http://i.imgur.com/w7GCRPb.png');
	});
});
