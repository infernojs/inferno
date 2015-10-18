/** @jsx t */

export default function virtualElementsTests(describe, expect, Inferno) {
    describe('Virtual elements tests', () => {
        let container;

        beforeEach(() => {
            container = Inferno.template.createElement('div', null, true);
        });

        afterEach(() => {
            container = null;
        });

        describe('using the Inferno functional API', () => {
            it('should render a basic example', () => {
                let template = Inferno.createTemplate(t => <div>Hello world</div>);

                let test = Inferno.renderToString(
                    Inferno.createFragment(null, template)
                );

                let expected = '<div>Hello world</div>';

                expect(test).to.equal(expected);
            });

            it('should render a basic example with dynamic values', () => {
                let template = Inferno.createTemplate((t, val1, val2) =>
                    <div>Hello world - { val1 } { val2 }</div>
                );

                let test = Inferno.renderToString(
                    Inferno.createFragment(['Inferno', 'Owns'], template)
                );

                let expected = '<div>Hello world - Inferno Owns</div>';

                expect(test).to.equal(expected);
            });

           /* it('should render a basic example with dynamic values and props', () => {
                let template = Inferno.createTemplate((t, val1, val2) =>
                    <div className='foo'>
                        <span className='bar'>{ val1 }</span>
                        <span className='yar'>{ val2 }</span>
                    </div>
                );

                let test = Inferno.renderToString(
                    Inferno.createFragment(['Inferno', 'Rocks'], template)
                );

                expect(
                    test
                ).to.equal(
                    `<div class="foo"><span class="bar">Inferno</span><span class="yar">Rocks</span></div>`
                );
            });*/
        });
    });

}
