import Inferno from '../../../../src';
import get from '../../../tools/get';

const {
	createElement
} = Inferno.TemplateFactory;

describe('SVG element tests (jsx)', () => {
	let container;

	beforeEach(() => {
		container = document.createElement('div');
	});

	afterEach(() => {
		Inferno.render(null, container);
	});

it('should remove known SVG camel case attributes', () => {

  	Inferno.render(<svg viewBox="0 0 100 100"></svg>, container);

     expect(container.firstChild.tagName).to.eql('svg');
     expect(container.firstChild.hasAttribute('viewBox')).to.be.true;
	 
  	 Inferno.render(<svg></svg>, container);

     expect(container.firstChild.tagName).to.eql('svg');
     expect(container.firstChild.hasAttribute('viewBox')).to.be.false;
     });

	it('should remove namespaced SVG attributes', () => {

  	Inferno.render(<svg><image xlinkHref="http://i.imgur.com/w7GCRPb.png" /></svg>, container);

     expect(container.firstChild.tagName).to.eql('svg');
      expect(container.firstChild.firstChild.hasAttributeNS(
         'http://www.w3.org/1999/xlink',
         'href'
       )).to.be.true;
	 
     Inferno.render(<svg><image /></svg>, container);

     expect(container.firstChild.tagName).to.eql('svg');
     expect(container.firstChild.firstChild.hasAttributeNS(
         'http://www.w3.org/1999/xlink',
         'href'
       )).to.be.false;
     });
	 
	 it('should update namespaced SVG attributes', () => {

  	Inferno.render(<svg><image xlinkHref="http://i.imgur.com/w7GCRPb.png" /></svg>, container);

     expect(container.firstChild.tagName).to.eql('svg');
      expect(container.firstChild.firstChild.hasAttributeNS(
         'http://www.w3.org/1999/xlink',
         'href'
       )).to.be.true;
	 
     Inferno.render(<svg><image xlinkHref="http://i.imgur.com/JvqCM2p.png" /></svg>, container);

     expect(container.firstChild.tagName).to.eql('svg');
   expect(container.firstChild.firstChild.getAttributeNS(
         'http://www.w3.org/1999/xlink',
         'href'
       )).to.equal('http://i.imgur.com/JvqCM2p.png');
     });
	 
	 // Dominic! If you comment out this test, the first test that breaks now will work just fine	 
	 it('should remove namespaced SVG attributes', () => {

  	Inferno.render(<svg clipPath="0 0 100 100"></svg>, container);

     expect(container.firstChild.tagName).to.eql('svg');
     
	 expect(container.firstChild.hasAttribute('clip-path')).to.be.true;
	 Inferno.render(<svg><image /></svg>, container);
	 expect(container.firstChild.hasAttribute('clip-path')).to.be.false;
     });
	  
	 
});