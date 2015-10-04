/** @jsx t */

export default function mathMlTests(describe, expect, Inferno) {
    describe('MathML tests', () => {

        let container, template;

        beforeEach(() => {
            container = document.createElement('div');
        });

        afterEach(() => {
            Inferno.clearDomElement(container);
            container = null;
        });

            describe('should respect default MathML namespace', () => {

                it('Initial render (creation)', () => {

                    template = Inferno.createTemplate((t, val1) =>
                        <math></math>
                    );

                    Inferno.render(Inferno.createFragment(false, template), container);

                   expect( container.firstChild.tagName.toLowerCase() ).to.eql( 'math' );
                   expect( container.firstChild.namespaceURI ).to.eql( 'http://www.w3.org/1998/Math/MathML' );

                    expect(
                        container.innerHTML
                    ).to.equal(
                        '<math></math>'
                    );
                });
                // update fragment from 'mathML' namespace to 'SVG'
                it('Second render (update)', () => {

                    template = Inferno.createTemplate((t, val1) =>
                        <svg width={200}></svg>
                    );
                    Inferno.render(Inferno.createFragment(false, template), container);

                   expect( container.firstChild.tagName.toLowerCase() ).to.eql( "svg" );
                   expect( container.firstChild.namespaceURI ).to.eql( 'http://www.w3.org/2000/svg' );
                   expect( container.firstChild.getAttribute( "width" ) ).to.eql('200');
                    expect(
                        container.innerHTML
                    ).to.equal(
                        '<svg width="200"></svg>'
                    );
                });
            });
        });

}
