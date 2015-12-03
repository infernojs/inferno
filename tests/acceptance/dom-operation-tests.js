import Inferno from '../../src';
import template from '../../src/template/';

const setProperty = template.setProperty;

export default function domOperationTests(describe, expect) {
    describe('DOM operations', () => {
        let container;

        beforeEach(() => {
            container = document.createElement('div');
        });

        afterEach(() => {
            Inferno.clearDomElement(container);
        });

        describe('setProperty()', () => {

            it('should render `checked` as a property', () => {
                setProperty	(container, 'checked', true);
                expect(container.checked).to.be.true;
            });

            it('should support custom attributes', () => {
                setProperty(container, 'custom-attr', '123');
                expect(container.getAttribute('custom-attr')).to.equal('123');
            });

            it('shouldn\'t render null values', () => {
                setProperty(container, 'value', null);
                expect(container.value).to.eql('');
            });

            it('should set `title` attribute', () => {
                setProperty(container, 'title', 'dominic');
                expect(container.getAttribute('title')).to.equal('dominic');
            });

            it('should support HTML5 data-* attribute', () => {
                setProperty(container, 'data-foo', 'bar');
                expect(container.getAttribute('data-foo')).to.equal('bar');
            });

            it('should support HTML5 data-* attribute', () => {
                setProperty(container, 'data-foo', 'bar');
                expect(container.getAttribute('data-foo')).to.equal('bar');
            });

            it('should set "muted" boolean property ( truthy) ', () => {
                setProperty(container, 'muted', true);
                expect(container.muted).to.be.true;
            });

            it('should set "muted" boolean property (falsy) ', () => {
                setProperty(container, 'muted', false);
                expect(container.muted).to.be.false;
            });

            it('should not set "muted" boolean property as "muted muted"', () => {
                setProperty(container, 'muted', true);
                expect(container.muted).to.eql(true);
            });

            it('should set numeric properties', () => {
                setProperty(container, 'start', 5);
                expect(container.getAttribute('start')).to.eql('5');

                setProperty(container, 'start', 0);
                expect(container.getAttribute('start')).to.eql('0');
            });

            it('should set negative numeric properties', () => {
                setProperty(container, 'start', -5);
                expect(container.getAttribute('start')).to.eql('-5');
            });

            it('should set numeric attribute "-0" to "0"', () => {
                setProperty(container, 'start', -0);
                expect(container.getAttribute('start')).to.eql('0');
            });

            it('should set className property', () => {
                setProperty(container, 'className', -0);
                expect(container.getAttribute('class')).to.eql('0');
            });

            it('should set contextmenu property', () => {
                setProperty(container, 'contextmenu', 'namemenu');
                expect(container.getAttribute('contextmenu')).to.eql('namemenu');
            });

            it('should set height property', () => {
                setProperty(container, 'height', '70%');
                expect(container.getAttribute('height')).to.eql('70%');
            });

            it('should set width property', () => {
                setProperty(container, 'width', '70%');
                expect(container.getAttribute('width')).to.eql('70%');
            });

            it('should not set positive numbers on "size" attribute', () => {
                setProperty(container, 'size', 444);
                expect(container.getAttribute('size')).to.eql('444');
            });

            it('should not set negative numbers on "cols" attribute', () => {
                setProperty(container, 'cols', -444);
                expect(container.getAttribute('cols')).to.eql('-444');
            });

            it('should not set zerio as a number on "cols" attribute', () => {
                setProperty(container, 'cols', 0);
                expect(container.getAttribute('cols')).to.eql('0');
            });

            it('should not set positive numbers on "cols" attribute', () => {
                setProperty(container, 'cols', 444);
                expect(container.getAttribute('cols')).to.eql('444');
            });

            it('should not set negative numbers on "rows" attribute', () => {
                setProperty(container, 'rows', -444);
                expect(container.getAttribute('rows')).to.eql('-444');
            });

            it('should set zerio as a number on "rows" attribute', () => {
                setProperty(container, 'rows', 0);
                expect(container.getAttribute('rows')).to.eql('0');
            });

            it('should set positive numbers on "rows" attribute', () => {
                setProperty(container, 'rows', 444);
                expect(container.getAttribute('rows')).to.eql('444');
            });

            it('should set "autoPlay" property (truthy)', () => {
                setProperty(container, 'autoPlay', true);
                expect(container.getAttribute('autoPlay')).to.be.eql('true');
            });

            it('should set "autoPlay" property (falsy)', () => {
                setProperty(container, 'autoPlay', false);
                expect(container.getAttribute('autoPlay')).to.equal('false');
             });

            it('should set "media" property (truthy)', () => {
                setProperty(container, 'media', true);
                expect(container.getAttribute('media')).to.eql('true');
                expect(container.media).to.be.undefined;
            });

            it('should set overloaded falsy value on attributes', () => {
                setProperty(container, 'target', false);
                expect(container.getAttribute('target')).to.eql('false');
            });

            it('should set overloaded truthy value on attributes', () => {
                setProperty(container, 'target', true);
                expect(container.getAttribute('target')).to.eql('true');
            });

            it('should set values as boolean properties', () => {
                // shouldn't exist - it's a prop
                setProperty(container, 'disabled', 'true');
                expect(container.getAttribute('disabled')).to.eql('true');

                // shouldn't exist - it's a prop
                setProperty(container, 'disabled', true);
                expect(container.getAttribute('disabled')).to.eql('true');

                setProperty(container, 'disabled', true);
            });
			
			/**
			 * Properties we force to be set as attribute
			 */
			 
            it('should set allowTransparency as an attribute', () => {
                setProperty(container, 'allowTransparency', true);
                expect(container.getAttribute('allowtransparency')).to.eql('true');
            });

            it('should set capture as an capture', () => {
                setProperty(container, 'capture', 'capture');
                expect(container.getAttribute('capture')).to.eql('capture');
            });

            it('should set classID as an attribute', () => {
                setProperty(container, 'classID', 'classID');
                expect(container.getAttribute('classid')).to.eql('classID');
            });

            it('should set capture as an attribute', () => {
                setProperty(container, 'dateTime', 'dateTime');
                expect(container.getAttribute('datetime')).to.eql('dateTime');
            });

        });
    });
}
