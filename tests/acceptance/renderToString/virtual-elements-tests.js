import Inferno from '../../../src';

export default function virtualElementsTests(describe, expect) {
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
                let template = Inferno.createTemplate(createElement => { return createElement('div', null, 'Hello world') });

                let test = Inferno.renderToString(
                    Inferno.createFragment(null, template)
                );

                let expected = '<div>Hello world</div>';

                expect(test).to.equal(expected);
            });

            it('should render a basic example with dynamic values', () => {
                let template = Inferno.createTemplate((createElement, val1, val2) =>
                        createElement('div', null, 'Hello world - ', val1, ' ', val2)
                );

                let test = Inferno.renderToString(
                    Inferno.createFragment(['Inferno', 'Owns'], template)
                );

                let expected = '<div>Hello world - Inferno Owns</div>';

                expect(test).to.equal(expected);
            });

            it('should render a basic example with dynamic values and props', () => {
                let template = Inferno.createTemplate((createElement, val1, val2) =>
                        createElement('div', {className: 'foo'},
                            createElement('span', {className: 'bar'}, val1),
                            createElement('span', {className: 'yar'}, val2)
                        )
                );

                let test = Inferno.renderToString(
                    Inferno.createFragment(['Inferno', 'Rocks'], template)
                );

                expect(
                    test
                ).to.equal(
                    `<div class="foo"><span class="bar">Inferno</span><span class="yar">Rocks</span></div>`
                );
            });
        })
    });

}
