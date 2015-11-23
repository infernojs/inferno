import Inferno from '../../src';
import setValueForProperty from '../../src/template/setValueForProperty';

export default function domOperationTests(describe, expect) {
    describe('DOM operations', () => {
        let container;

        beforeEach(() => {
            container = document.createElement('div');
        });

        afterEach(() => {
            Inferno.clearDomElement(container);
        });

        describe('setValueForProperty()', () => {

            it('should render `checked` as a property', () => {
                setValueForProperty	(container, 'checked', true);
                expect(container.checked).to.be.true;
            });

            it('should support custom attributes', () => {
                setValueForProperty(container, 'custom-attr', '123');
                expect(container.getAttribute('custom-attr')).to.equal('123');
            });

            it('shouldn\'t render null values', () => {
                setValueForProperty(container, 'value', null);
                expect(container.value).to.eql('');
            });

            it('should set `title` attribute', () => {
                setValueForProperty(container, 'title', 'dominic');
                expect(container.getAttribute('title')).to.equal('dominic');
            });

            it('should support HTML5 data-* attribute', () => {
                setValueForProperty(container, 'data-foo', 'bar');
                expect(container.getAttribute('data-foo')).to.equal('bar');
            });

            it('should support HTML5 data-* attribute', () => {
                setValueForProperty(container, 'data-foo', 'bar');
                expect(container.getAttribute('data-foo')).to.equal('bar');
            });

            it('should set "muted" boolean property ( truthy) ', () => {
                setValueForProperty(container, 'muted', true);
                expect(container.muted).to.be.true;
            });

            it('should set "muted" boolean property (falsy) ', () => {
                setValueForProperty(container, 'muted', false);
                expect(container.muted).to.be.false;
            });

            it('should not set "muted" boolean property as "muted muted"', () => {
                setValueForProperty(container, 'muted', true);
                expect(container.muted).to.eql(true);
            });

            it('should set numeric properties', () => {
                setValueForProperty(container, 'start', 5);
                expect(container.getAttribute('start')).to.eql('5');

                setValueForProperty(container, 'start', 0);
                expect(container.getAttribute('start')).to.eql('0');
            });

            it('should set negative numeric properties', () => {
                setValueForProperty(container, 'start', -5);
                expect(container.getAttribute('start')).to.eql('-5');
            });

            it('should set numeric attribute "-0" to "0"', () => {
                setValueForProperty(container, 'start', -0);
                expect(container.getAttribute('start')).to.eql('0');
            });

            it('should set className property', () => {
                setValueForProperty(container, 'className', -0);
                expect(container.getAttribute('class')).to.eql('0');
            });

            it('should set contextmenu property', () => {
                setValueForProperty(container, 'contextmenu', 'namemenu');
                expect(container.getAttribute('contextmenu')).to.eql('namemenu');
            });

            it('should set height property', () => {
                setValueForProperty(container, 'height', '70%');
                expect(container.getAttribute('height')).to.eql('70%');
            });

            it('should set width property', () => {
                setValueForProperty(container, 'width', '70%');
                expect(container.getAttribute('width')).to.eql('70%');
            });

            it('should not set negative numbers on "size" attribute', () => {
                setValueForProperty(container, 'size', -444);
                expect(container.getAttribute('size')).to.be.null;
            });

            it('should not set zerio as a number on "size" attribute', () => {
                setValueForProperty(container, 'size', 0);
                expect(container.getAttribute('size')).to.be.null;
            });

            it('should not set positive numbers on "size" attribute', () => {
                setValueForProperty(container, 'size', 444);
                expect(container.getAttribute('size')).to.eql('444');
            });

            it('should not set negative numbers on "cols" attribute', () => {
                setValueForProperty(container, 'cols', -444);
                expect(container.getAttribute('cols')).to.be.null;
            });

            it('should not set zerio as a number on "cols" attribute', () => {
                setValueForProperty(container, 'cols', 0);
                expect(container.getAttribute('cols')).to.be.null;
            });

            it('should not set positive numbers on "cols" attribute', () => {
                setValueForProperty(container, 'cols', 444);
                expect(container.getAttribute('cols')).to.eql('444');
            });

            it('should not set negative numbers on "rows" attribute', () => {
                setValueForProperty(container, 'rows', -444);
                expect(container.getAttribute('rows')).to.eql('-444');
            });

            it('should set zerio as a number on "rows" attribute', () => {
                setValueForProperty(container, 'rows', 0);
                expect(container.getAttribute('rows')).to.eql('0');
            });

            it('should set positive numbers on "rows" attribute', () => {
                setValueForProperty(container, 'rows', 444);
                expect(container.getAttribute('rows')).to.eql('444');
            });

            it('should set "autoPlay" property (truthy)', () => {
                setValueForProperty(container, 'autoPlay', true);
                expect(container.getAttribute('autoPlay')).to.be.eql('true');
            });

            it('should set "autoPlay" property (falsy)', () => {
                setValueForProperty(container, 'autoPlay', false);
                expect(container.getAttribute('autoPlay')).to.be.null;
             });

            it('should set "media" property (truthy)', () => {
                setValueForProperty(container, 'media', true);
                expect(container.getAttribute('media')).to.eql('true');
                expect(container.media).to.be.undefined;
            });

            it('should set overloaded falsy value on attributes', () => {
                setValueForProperty(container, 'target', false);
                expect(container.getAttribute('target')).to.eql('false');
            });

            it('should set overloaded truthy value on attributes', () => {
                setValueForProperty(container, 'target', true);
                expect(container.getAttribute('target')).to.eql('true');
            });

            it('should set values as boolean properties', () => {
                // shouldn't exist - it's a prop
                setValueForProperty(container, 'disabled', 'true');
                expect(container.getAttribute('disabled')).to.eql('true');

                // shouldn't exist - it's a prop
                setValueForProperty(container, 'disabled', true);
                expect(container.getAttribute('disabled')).to.eql('true');

                setValueForProperty(container, 'disabled', true);
            });
        });
    });
}
