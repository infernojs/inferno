
import { render } from 'inferno';
import { createElement } from '../dist-es';

describe('svg', () => {
	let container;

	beforeEach(function () {
		container = document.createElement('div');
	});

	afterEach(function () {
		render(null, container);
	});

	it('Should work with normal svg attributes', () => {
		render(createElement('svg', {
			height: '16',
			width: '16',
			viewBox: '0 0 1024 1024'
		}, [
			createElement('stop', {
				offset: 0,
				stopColor: 'white',
				stopOpacity: 0.5
			})
		]), container);

		expect(container.firstChild.getAttribute('viewBox')).to.equal('0 0 1024 1024');
		expect(container.firstChild.getAttribute('height')).to.equal('16');
		expect(container.firstChild.getAttribute('width')).to.equal('16');
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
