import Inferno from '../../../../src';

describe('SVG element tests (jsx)', () => {

     let container;

	beforeEach(() => {
		container = document.createElement('div');
	});

	afterEach(() => {
		Inferno.render(null, container);
	});
	
   it('should set SVG as default namespace for <svg>', () => {
  	  Inferno.render(<svg></svg>, container);	   
	  expect(container.firstChild.namespaceURI).to.equal("http://www.w3.org/2000/svg"); 
	});	

   it('should use the parent namespace by default', () => {
  	  Inferno.render(<svg><circle/></svg>, container);	   
      expect(container.firstChild.namespaceURI).to.equal('http://www.w3.org/2000/svg');
      expect(container.firstChild.firstChild.namespaceURI).to.equal('http://www.w3.org/2000/svg');
  	  Inferno.render(<svg><circle/></svg>, container);	   
      expect(container.firstChild.namespaceURI).to.equal('http://www.w3.org/2000/svg');
      expect(container.firstChild.firstChild.namespaceURI).to.equal('http://www.w3.org/2000/svg');
	});	

  it('should keep parent namespace', () => {
  
     Inferno.render(<svg xmlns='http://www.w3.org/2000/svg'><circle/></svg>, container);	 
     expect(container.firstChild.namespaceURI).to.equal('http://www.w3.org/2000/svg');
     Inferno.render(<svg xmlns='http://www.w3.org/2000/svg'><circle xmlns='http://www.w3.org/2000/svg'/><circle xmlns='http://www.w3.org/2000/svg'/></svg>, container);	 
	 expect(container.firstChild.namespaceURI).to.equal('http://www.w3.org/2000/svg');
     expect(container.firstChild.firstChild.namespaceURI).to.equal('http://www.w3.org/2000/svg');
     Inferno.render(<svg><circle/><g xmlns='http://www.w3.org/2000/svg'></g></svg>, container);	 
     expect(container.firstChild.firstChild.tagName).to.equal('circle');
     expect(container.firstChild.firstChild.namespaceURI).to.equal('http://www.w3.org/2000/svg');
     expect(container.firstChild.firstChild.firstChild.namespaceURI).to.equal('http://www.w3.org/2000/svg');
  });

  
  it('should set and remove class attribute', () => {
  
    let value = 'foo';

  	Inferno.render(<svg class={value}></svg>, container);

     expect(container.firstChild.tagName).to.eql('svg');
     expect(container.firstChild.getAttribute('class')).to.equal('foo');
	 
  	 Inferno.render(<svg></svg>, container);

     expect(container.firstChild.tagName).to.eql('svg');
     expect(container.firstChild.hasAttribute('class')).to.be.false;
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
 
 it('should remove arbitrary SVG camel case attributes', () => {
 
       Inferno.render(<svg theWord="theBird" />, container);
 
       expect(container.firstChild.hasAttribute('theWord')).to.be.true;
       Inferno.render(<svg />, container);
       expect(container.firstChild.hasAttribute('theWord')).to.be.false;
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
	 
  it('should remove namespaced SVG attributes', () => {

  	Inferno.render(<svg clipPath="0 0 110 110"></svg>, container);

     expect(container.firstChild.tagName).to.eql('svg');
     
	 expect(container.firstChild.hasAttribute('clip-path')).to.be.true;

	 Inferno.render(<svg><image /></svg>, container);
 
     expect(container.firstChild.firstChild.hasAttributeNS(
         'http://www.w3.org/1999/xlink',
         'href'
       )).to.be.false;
 });


  it('should remove namespaced SVG attributes', () => {

  	Inferno.render(<svg clipPath="0 0 110 110"></svg>, container);

     expect(container.firstChild.tagName).to.eql('svg');
     
	 expect(container.firstChild.hasAttribute('clip-path')).to.be.true;

	 Inferno.render(<svg><image /></svg>, container);
 
     expect(container.firstChild.firstChild.hasAttributeNS(
         'http://www.w3.org/1999/xlink',
         'href'
       )).to.be.false;
 });

 it('should render a basic component with SVG', () => {
 		class Component extends Inferno.Component {
 			constructor(props) {
 				super(props);
 			}
 			render() {
 				return (
 					<svg class="alert-icon">
 						<use xlinkHref="#error"></use>
 					</svg>
 				)
 			}
 		}
 
 			Inferno.render(<Component />, container);
 
 			expect(
 				container.innerHTML
 			).to.equal(
 				'<svg class="alert-icon"> <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#error"></use> </svg>'
 			);
			
  		Inferno.render(<Component />, container);
 
 			expect(
 				container.innerHTML
 			).to.equal(
 				'<svg class="alert-icon"> <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#error"></use> </svg>'
 			);
 	});
 });