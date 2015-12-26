import Inferno from '../../../../src';

describe('SVG element tests (jsx)', () => {

     let container;

	beforeEach(() => {
		container = document.createElement('div');
	});

	afterEach(() => {
		Inferno.render(null, container);
	});
	
 	describe('should render a simple div with inline style', () => {


		it('Initial render (creation)', () => {

			Inferno.render(<div style="background-color:lightgrey;">Hello, world!</div>, container);

			expect(container.nodeName).to.equal('DIV');

			Inferno.render(<div id={'foo'}>Hello, world! 2</div>, container);

			expect(container.nodeName).to.equal('DIV');
		});
	});
	
it('should clear a single style prop when changing `style`', () => {
      let styles = {display: 'none', color: 'red'};

      Inferno.render(<div style={styles} />, container);

      const stubStyle = container.firstChild.style;

      styles = {color: 'green'};
      Inferno.render(<div style={styles} />, container);
      expect(stubStyle.display).to.equal('');
      expect(stubStyle.color).to.equal('green');
    });
	
	it('should update styles when `style` changes from null to object', () => {
      const styles = {color: 'red'};
      Inferno.render(<div style={styles} />, container);
      Inferno.render(<div />, container);
      Inferno.render(<div style={styles} />, container);

      const stubStyle = container.firstChild.style;
      expect(stubStyle.color).to.equal('red');
    });
		
 it('should set and remove dynamic styles', () => {
	 
 const styles = {display: 'none', fontFamily: 'Arial', lineHeight: 1.2};
 
   Inferno.render(<div style={styles} />, container);	 
   expect(container.firstChild.style.fontFamily).to.equal('Arial');
   expect(container.firstChild.style.lineHeight).to.equal('1.2');

   Inferno.render(<div />, container);
   expect(container.firstChild.style.fontFamily).to.equal('');
   expect(container.firstChild.style.lineHeight).to.equal('');

});


		 it('should set and remove dynamic styles', () => {
	 
 const styles = {display: 'none', fontFamily: 'Arial', lineHeight: 1.2};
 
   Inferno.render(<div style={styles} />, container);	 
   expect(container.firstChild.style.fontFamily).to.equal('Arial');
   expect(container.firstChild.style.lineHeight).to.equal('1.2');

   Inferno.render(<div />, container);
   expect(container.firstChild.style.fontFamily).to.equal('');
   expect(container.firstChild.style.lineHeight).to.equal('');

});
		

it('should update styles if initially null', () => {

      let styles = null;
      Inferno.render(<div style={styles} />, container);

      styles = {display: 'block'};

      Inferno.render(<div style={styles} />, container);
      expect(container.firstChild.style.display).to.equal('block');
});

it('should update styles if updated to null multiple times', () => {
      var styles = null;

      Inferno.render(<div style={styles} />, container);
      expect(container.firstChild.style.display).to.equal('');
	  
      styles = {display: 'block'};

      Inferno.render(<div style={styles} />, container);
      expect(container.firstChild.style.display).to.equal('block');

      Inferno.render(<div style={null} />, container);
      expect(container.firstChild.style.display).to.equal('');

      Inferno.render(<div style={styles} />, container);
      expect(container.firstChild.style.display).to.equal('block');

      Inferno.render(<div style={null} />, container);
      expect(container.firstChild.style.display).to.equal('');
 }); 
 });