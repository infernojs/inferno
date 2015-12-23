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

     it('should remove arbitrary SVG hyphenated attributes', function() {
     
	  Inferno.render(<svg>the-word="the-bird"</svg>, container);
      // innerHTML shows this correctly
       expect(container.firstChild.hasAttribute('the-word')).to.equal(true);
	  Inferno.render(<svg></svg>, container);
       expect(container.firstChild.hasAttribute('the-word')).to.equal(false);
     });

     it('should remove arbitrary SVG camel case attributes', function() {

	  Inferno.render(<svg>the-word="the-bird"</svg>, container);
       expect(container.firstChild.hasAttribute('theWord')).to.equal(true);
       Inferno.render(<svg></svg>, container);
       expect(container.firstChild.hasAttribute('theWord')).to.equal(false);
     });
});