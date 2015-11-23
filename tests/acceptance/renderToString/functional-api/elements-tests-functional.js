import Inferno from '../../../../src';
import get from '../../../tools/get';

export default function elementsTestsFunctional(describe, expect) {
    it('should render a basic example', () => {
        const template = Inferno.createTemplate(
            createElement => createElement('div', null, 'Hello world')
        );
        const test = Inferno.renderToString(
            Inferno.createFragment(null, template)
        );
        const expected = '<div>Hello world</div>';
        expect(test).to.equal(expected);
    });
	
	    it('should render a void element', () => {
        const template = Inferno.createTemplate((createElement, createComponent) =>
                createElement('input')
        );
        const test = Inferno.renderToString(
            Inferno.createFragment(null, template)
        );
        const expected = '<input/>';
        expect(test).to.equal(expected);
    });

	
    it('should render a basic example with dynamic values', () => {
        const template = Inferno.createTemplate((createElement, createComponent, val1, val2) =>
                createElement('div', null, 'Hello world - ', val1, ' ', val2)
        );
        const test = Inferno.renderToString(
            Inferno.createFragment(['Inferno', 'Owns'], template)
        );
        const expected = '<div>Hello world - Inferno Owns</div>';
        expect(test).to.equal(expected);
    });
    it('should render a basic example with dynamic values #2', () => {
        const template = Inferno.createTemplate(createElement =>
            createElement('select', {multiple: true, value: 'bar'},
                createElement('option', {value: 'foo'}, 'foo'),
                createElement('option', {value: 'bar'}, 'bar')
            )
        );
        const test = Inferno.renderToString(
            Inferno.createFragment(null, template)
        );
        const expected = '<select multiple=""><option>foo</option><option>bar</option></select>';
        expect(test).to.equal(expected);
    });
    it('should render a basic example with dynamic values and props', () => {
        const template = Inferno.createTemplate((createElement, createComponent, val1, val2) =>
            createElement('div', {className: 'foo'},
                createElement('span', {className: 'bar'}, val1),
                createElement('span', {className: 'yar'}, val2)
            )
        );
        const test = Inferno.renderToString(
            Inferno.createFragment(['Inferno', 'Rocks'], template)
        );
        expect(
            test
        ).to.equal(
            `<div class="foo"><span class="bar">Inferno</span><span class="yar">Rocks</span></div>`
        );
    });
}
