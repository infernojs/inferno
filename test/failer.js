import Inferno from '../src';

describe( 'Provider', () => {
	let container;

    beforeEach( () => {
        container = document.createElement( 'div' );
    } );

    afterEach( () => {
         Inferno.render( null, container );
    } );

// THIS WORKS

	it('should clear all the styles when removing `style`', () => {

		const template = Inferno.createTemplate((style) => {
			return {
				tag: 'div',
				attrs: {
					style: style,
				},
				children: 'Hello!'
			};
		});

		const styles = {display: 'none', color: 'red'};

		Inferno.render(template(styles), container);

		const stubStyle = container.firstChild.style;

		Inferno.render(<div />, container);
		expect(stubStyle.display).to.equal('none');
		expect(stubStyle.color).to.equal('red');
	});


	// THIS WORKS NOT! ( JSX)

	it('should clear all the styles when removing `style`', () => {

		const styles = {display: 'none', color: 'red'};
		Inferno.render(<div style={styles} />, container);

		const stubStyle = container.firstChild.style;

		Inferno.render(<div />, container);
		expect(stubStyle.display).to.equal('none');
		expect(stubStyle.color).to.equal('red');
	});



} );
