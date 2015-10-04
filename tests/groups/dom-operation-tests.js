/** @jsx t */

import attrOps from '../../src/template/AttributeOps';

export default function domOperationTests(describe, expect, Inferno) {
    describe('DOM operations', () => {
        let container;

        beforeEach(() => {
            container = document.createElement('div');
        });

        afterEach(() => {
            Inferno.clearDomElement(container);
            container = null;
        });

        describe('attrOps.toHtml()', () => {

            describe('HTML attributes / properties', () => {

                describe('Booleans', () => {

                    it('should not render unsafe custom attribute names', () => {
                        expect(attrOps.toHtml('&/()', 'unsafeAttr!!')).to.equal('');
                    });

                    it('should render `checked` as a property (truthy)', () => {
                        expect(attrOps.toHtml('checked', true)).to.equal('checked="true"');
                    });

                    it('should render `checked` ( html5)', () => {
                        expect(attrOps.toHtml('checked', 'checked')).to.equal('checked="checked"');
                    });

                    it('should render `checked` (falsy)', () => {
                        expect(attrOps.toHtml('checked', false)).to.equal('checked="false"');
                    });

                    it('should render `download` attribute (falsy)', () => {
                        expect(attrOps.toHtml('download', false)).to.equal('download="false"');
                    });

                    it('should render custom attribute', () => {
                        expect(attrOps.toHtml('fooBar', 'boo')).to.equal('fooBar="boo"');
                    });

                    it('should render "multiple" attribute - #1', () => {
                        expect(attrOps.toHtml('multiple', 'true')).to.equal('multiple="true"');
                    });

                    it('should render "multiple" attribute - #2', () => {
                        expect(attrOps.toHtml('multiple', true)).to.equal('multiple="true"');
                    });

                    it('should render "multiple" attribute - #3', () => {
                        expect(attrOps.toHtml('multiple', false)).to.equal('multiple="false"');
                    });

                    it('should render "hidden" attribute', () => {
                        expect(attrOps.toHtml('hidden', false)).to.equal('hidden="false"');
                    });

                    it('should render "mute" attribute', () => {
                        expect(attrOps.toHtml('mute', false)).to.equal('mute="false"');
                    });

                    it('should render "loop" attribute', () => {
                        expect(attrOps.toHtml('loop', true)).to.equal('loop="true"');
                    });

                });

                describe('Custom attribute', () => {

                    it('should render custom attributes - #1', () => {
                        expect(attrOps.toHtml('Inferno', true)).to.equal('Inferno="true"');
                    });

                    it('should render custom attributes - #2', () => {
                        expect(attrOps.toHtml('Inferno', 123)).to.equal('Inferno="123"');
                    });

                    it('should render custom attributes - #3', () => {
                        expect(attrOps.toHtml('Inferno', false)).to.equal('Inferno="false"');
                    });

                    it('should not render unsafe custom attribute names', () => {
                        expect(attrOps.toHtml('&/()', 'unsafeAttr!!')).to.equal('');
                    });
                });

                describe('HTML5 data-* attribute', () => {
                    it('should render custom attributes', () => {
                        expect(attrOps.toHtml('data-foo', 'bar')).to.equal('data-foo="bar"');
                    });
                });

                describe('height attribute', () => {
                    it('should render height attributes', () => {
                        expect(attrOps.toHtml('height', '70%')).to.equal('height="70%"');
                    });
                });

                describe('width attribute', () => {
                    it('should render height attributes', () => {
                        expect(attrOps.toHtml('width', '70%')).to.equal('width="70%"');
                    });
                });

                describe('xml / xlink namespace attributes', () => {
                    it('should render namespace attributes', () => {
                        expect(attrOps.toHtml('xlink:href', 'test.jpg')).to.equal('xlink:href="test.jpg"');
                    });
                    it('should render namespace attributes', () => {
                        expect(attrOps.toHtml('xml:id', 'inferno')).to.equal('xml:id="inferno"');
                    });
                });

                describe('dataset property', () => {
                    it('should render dataset property - #1', () => {
                        expect(attrOps.toHtml('dataset', '')).to.equal('');
                    });
                    it('should render dataset property - #2', () => {
                        let objL = { foo: 'bar', bar: 'oops' };
                        expect(attrOps.toHtml('dataset', objL)).to.equal('data-foo="bar" data-bar="oops" ');
                    });
                });
                describe('preload property', () => {
                    it('should render preload property - #1', () => {
                        expect(attrOps.toHtml('preload', true)).to.equal('preload="true"');
                    });
                    it('should render preload property - #2', () => {
                        expect(attrOps.toHtml('preload', false)).to.equal('preload="false"');
                    });
                    it('should render preload property - #3', () => {
                        expect(attrOps.toHtml('preload', null)).to.equal('');
                    });
                });
                describe('contentEditable property', () => {
                    it('should render contentEditable property - #1', () => {
                        expect(attrOps.toHtml('contentEditable', true)).to.equal('contentEditable="true"');
                    });
                    it('should render contentEditable property - #2', () => {
                        expect(attrOps.toHtml('contentEditable', false)).to.equal('contentEditable="false"');
                    });
                    it('should render contentEditable property - #3', () => {
                        expect(attrOps.toHtml('contentEditable', 'plaintext-only')).to.equal('contentEditable="plaintext-only"');
                    });
                    it('should render contentEditable property - #4', () => {
                        expect(attrOps.toHtml('contentEditable', null)).to.equal('');
                    });
                });

            });
            describe('CSS', () => {

                it('should create markup for simple styles', () => {
                    expect(attrOps.toHtml('style', {
                        backgroundColor: '#3b5998',
                        display: 'none'
                    })).to.equal(
                        'style="background-color:#3b5998;display:none;"'
                    );
                });

                // null, undefined etc. has to be done on a higher level of abstraction - not low-level
                it('should not ignore undefined styles', () => {
                    expect(attrOps.toHtml('style', {
                        backgroundColor: undefined,
                        display: 'none'
                    })).to.equal(
                        'style="display:none;"'
                    );
                });

                it('should not ignore null styles', () => {
                    expect(attrOps.toHtml('style', {
                        backgroundColor: null,
                        display: 'none'
                    })).to.equal(
                        'style="display:none;"'
                    );
                });

                it('should automatically append `px` to relevant styles', () => {
                    expect(attrOps.toHtml('style', {
                        left: 0,
                        margin: 16,
                        opacity: 0.5,
                        padding: '4px'
                    })).to.equal(
                        'style="left:0;margin:16px;opacity:0.5;padding:4px;"'
                    );
                });

                it('should create vendor-prefixed markup correctly', () => {
                    expect(attrOps.toHtml('style', {
                        msTransition: 'none',
                        MozTransition: 'none'
                    })).to.equal(
                        'style="ms-transition:none;moz-transition:none;"'
                    );
                });

                it('should trim values so `px` will be appended correctly', () => {
                    expect(attrOps.toHtml('style', {
                        margin: '16',
                        opacity: 0.5,
                        padding: '4'
                    })).to.equal('style="margin:16px;opacity:0.5;padding:4px;"');
                });

            });
        });

        describe('attrOps.set()', () => {
            it('should render `checked` as a property', () => {
                attrOps.set(container, 'checked', true);
                expect(container.checked).to.be.true;
            });

            it('should support custom attributes', () => {
                attrOps.set(container, 'custom-attr', '123');
                expect(container.getAttribute('custom-attr')).to.equal('123');
            });

            it('shouldn\'t render null values', () => {
                attrOps.set(container, 'value', null);
                expect(container.value).to.be.null;
            });

            it('should set `title` attribute', () => {
                attrOps.set(container, 'title', 'dominic');
                expect(container.getAttribute('title')).to.equal('dominic');
            });

            it('should support HTML5 data-* attribute', () => {
                attrOps.set(container, 'data-foo', 'bar');
                expect(container.getAttribute('data-foo')).to.equal('bar');
            });

            it('should support HTML5 data-* attribute', () => {
                attrOps.set(container, 'data-foo', 'bar');
                expect(container.getAttribute('data-foo')).to.equal('bar');
            });

            it('should set "muted" boolean property ( truty) ', () => {
                attrOps.set(container, 'muted', true);
                expect(container.muted).to.be.true;
            });

            it('should set "muted" boolean property (falsy) ', () => {
                attrOps.set(container, 'muted', false);
                expect(container.muted).to.be.false;
            });

            it('should not set "muted" boolean property as "muted muted"', () => {
                attrOps.set(container, 'muted', 'muted');
                expect(container.muted).to.eql('muted');
            });

            it('should set "readOnly" boolean property ( truty) ', () => {
                attrOps.set(container, 'readOnly', true);
                expect(container.readOnly).to.be.true;
            });

            it('should set "readOnly" boolean property (falsy) ', () => {
                attrOps.set(container, 'readOnly', false);
                expect(container.readOnly).to.be.false;
            });

            it('should set "readOnly" boolean property (HTML5) ', () => {
                attrOps.set(container, 'readOnly', 'true');
                expect(container.readOnly).to.eql('true');
            });

            it('should not set "readOnly" boolean property as "readOnly readOnly"', () => {
                attrOps.set(container, 'readOnly', 'readOnly');
                expect(container.readOnly).to.eql('readOnly');
            });

            it('should set numeric properties', () => {
                attrOps.set(container, 'start', 5);
                expect(container.getAttribute('start')).to.eql('5');

                attrOps.set(container, 'start', 0);
                expect(container.getAttribute('start')).to.eql('0');
            });

            it('should set negative numeric properties', () => {
                attrOps.set(container, 'start', -5);
                expect(container.getAttribute('start')).to.eql('-5');
            });

            it('should set numeric attribute "-0" to "0"', () => {
                attrOps.set(container, 'start', -0);
                expect(container.getAttribute('start')).to.eql('0');
            });

            it('should set className property', () => {
                attrOps.set(container, 'className', -0);
                expect(container.getAttribute('class')).to.eql('0');
            });

            it('should set contextmenu property', () => {
                attrOps.set(container, 'contextmenu', 'namemenu');
                expect(container.getAttribute('contextmenu')).to.eql('namemenu');
            });

            it('should set height property', () => {
                attrOps.set(container, 'height', '70%');
                expect(container.getAttribute('height')).to.eql('70%');
            });

            it('should set width property', () => {
                attrOps.set(container, 'width', '70%');
                expect(container.getAttribute('width')).to.eql('70%');
            });

            it('should set dataset property - #1', () => {
                let objL = { foo: 'bar', bar: 'oops' };
                attrOps.set(container, 'dataset', objL);
                expect(container.dataset).to.eql(objL);
            });

            it('should set dataset property - #2', () => {
                attrOps.set(container, 'dataset', {});
                expect(container.dataset).to.eql({});
            });

            it('should set and camelize dataset property - #3', () => {
                let objL = { 'foo-bar': 'bar', bar: 'oops' };
                attrOps.set(container, 'dataset', objL);
                expect(container.dataset).to.eql({ fooBar: 'bar', bar: 'oops' });
            });

            it('should not set negative numbers on "size" attribute', () => {
                attrOps.set(container, 'size', -444);
                expect(container.getAttribute('size')).to.be.null;
            });

            it('should not set zerio as a number on "size" attribute', () => {
                attrOps.set(container, 'size', 0);
                expect(container.getAttribute('size')).to.be.null;
            });

            it('should not set positive numbers on "size" attribute', () => {
                attrOps.set(container, 'size', 444);
                expect(container.getAttribute('size')).to.eql('444');
            });

            it('should not set negative numbers on "cols" attribute', () => {
                attrOps.set(container, 'cols', -444);
                expect(container.getAttribute('cols')).to.be.null;
            });

            it('should not set zerio as a number on "cols" attribute', () => {
                attrOps.set(container, 'cols', 0);
                expect(container.getAttribute('cols')).to.be.null;
            });

            it('should not set positive numbers on "cols" attribute', () => {
                attrOps.set(container, 'cols', 444);
                expect(container.getAttribute('cols')).to.eql('444');
            });

            it('should not set negative numbers on "rows" attribute', () => {
                attrOps.set(container, 'rows', -444);
                expect(container.getAttribute('rows')).to.be.null;
            });

            it('should not set zerio as a number on "rows" attribute', () => {
                attrOps.set(container, 'rows', 0);
                expect(container.getAttribute('rows')).to.be.null;
            });

            it('should not set positive numbers on "rows" attribute', () => {
                attrOps.set(container, 'rows', 444);
                expect(container.getAttribute('rows')).to.eql('444');
            });

            it('should not set zerio as a number on "span" attribute', () => {
                attrOps.set(container, 'span', 0);
                expect(container.getAttribute('span')).to.be.null;
            });

            it('should set "contentEditable" property (falsy)', () => {
                attrOps.set(container, 'contentEditable', false);
                expect(container.getAttribute('contentEditable')).to.eql('false');
                expect(container.contentEditable).to.eql('false');
            });

            it('should set "contentEditable" property (truthy)', () => {
                attrOps.set(container, 'contentEditable', true);
                expect(container.getAttribute('contentEditable')).to.eql('true');
                expect(container.contentEditable).to.eql('true');
            });

            it('should set "contentEditable" property (inherit)', () => {
                attrOps.set(container, 'contentEditable', 'inherit');
                expect(container.getAttribute('contentEditable')).to.be.null;
                expect(container.contentEditable).to.eql('inherit');
            });

            it('should set "contentEditable" property (plaintext-only)', () => {
                attrOps.set(container, 'contentEditable', 'plaintext-only');
                expect(container.getAttribute('contentEditable')).to.eql('plaintext-only');
                expect(container.contentEditable).to.eql('plaintext-only');
            });

            it('should not set "contentEditable" as a null value', () => {
                attrOps.set(container, 'contentEditable', null);
                expect(container.getAttribute('contentEditable')).to.be.null;
                expect(container.contentEditable).to.eql('inherit');
            });

            it('should not set "contentEditable" as a null value', () => {
                attrOps.set(container, 'contentEditable', null);
                expect(container.getAttribute('contentEditable')).to.be.null;
                expect(container.contentEditable).to.eql('inherit');
            });

            it('should not set "contentEditable" as a undefined value', () => {
                attrOps.set(container, 'contentEditable', undefined);
                expect(container.getAttribute('contentEditable')).to.be.null;
                expect(container.contentEditable).to.eql('inherit');
            });

            it('should set "preload" property (falsy)', () => {
                attrOps.set(container, 'preload', false);
                expect(container.getAttribute('preload')).to.be.null;
                expect(container.preload).to.be.false;
            });

            it('should set "preload" property (truthy)', () => {
                attrOps.set(container, 'preload', true);
                expect(container.getAttribute('preload')).to.be.null;
                expect(container.preload).to.be.true;
            });

            it('should set "preload" property (metadata)', () => {
                attrOps.set(container, 'preload', 'metadata');
                expect(container.getAttribute('preload')).to.be.null;
                expect(container.preload).to.eql('metadata');
            });

            it('should set "preload" property (auto)', () => {
                attrOps.set(container, 'preload', 'auto');
                expect(container.getAttribute('preload')).to.be.null;
                expect(container.preload).to.eql('auto');
            });

            it('should not set "preload" as a null value', () => {
                attrOps.set(container, 'preload', null);
                expect(container.getAttribute('preload')).to.be.null;
                expect(container.preload).to.be.undefined;
            });

            it('should not set "preload" as a undefined value', () => {
                attrOps.set(container, 'preload', undefined);
                expect(container.getAttribute('preload')).to.be.null;
                expect(container.preload).to.be.undefined;
            });

            it('should set "autoPlay" property (truthy)', () => {
                attrOps.set(container, 'autoPlay', true);
                expect(container.getAttribute('autoPlay')).to.be.null;
                expect(container.autoPlay).to.be.true;
            });

            it('should set "autoPlay" property (falsy)', () => {
                attrOps.set(container, 'autoPlay', false);
                expect(container.getAttribute('autoPlay')).to.be.null;
                expect(container.autoPlay).to.be.false;
            });

            it('should set "media" property (truthy)', () => {
                attrOps.set(container, 'media', true);
                expect(container.getAttribute('media')).to.eql('true');
                expect(container.media).to.be.undefined;
            });

            it('should not set positive numbers on "span" attribute', () => {
                attrOps.set(container, 'span', 444);
                expect(container.getAttribute('span')).to.eql('444');
            });

            it('should set overloaded falsy value on attributes', () => {
                attrOps.set(container, 'target', false);
                expect(container.getAttribute('target')).to.eql('false');
            });

            it('should set overloaded truthy value on attributes', () => {
                attrOps.set(container, 'target', true);
                expect(container.getAttribute('target')).to.eql('true');
            });

            it('should not render unsafe custom attribute names', () => {
                attrOps.set(container, '&/()', 'unsafeAttr!!');
                expect(container.getAttribute('&/()')).to.be.null;
            });

            it('should set values as boolean properties', () => {
                attrOps.set(container, 'disabled', 'disabled');
                expect(container.getAttribute('disabled')).to.eql('disabled');

                attrOps.set(container, 'disabled', true);
                expect(container.getAttribute('disabled')).to.eql('true');

                // shouldn't exist - it's an attribute
                attrOps.set(container, 'disabled', true);
                expect(container.disabled).to.be.undefined;
            });
            describe('Audio / video attributes', () => {

                it('should render the volume attribute - 0.0', () => {
                    attrOps.set(container, 'volume', 0.0);
                    expect(container.getAttribute('volume')).to.eql('0');
                });

                it('should render the volume attribute - 0.4', () => {
                    attrOps.set(container, 'volume', 0.04);
                    expect(container.getAttribute('volume')).to.eql('0.04');
                });

                it('should render the volume attribute - 1', () => {
                    attrOps.set(container, 'volume', 1);
                    expect(container.getAttribute('volume')).to.eql('1');
                });

                it('should not render the volume attribute if larger then 1', () => {
                    attrOps.set(container, 'volume', -3);
                    expect(container.getAttribute('volume')).to.be.null;
                });

                it('should not render the volume attribute on negative numbers', () => {
                    attrOps.set(container, 'volume', 3);
                    expect(container.getAttribute('volume')).to.be.null;
                });

            });
        });
    });
}
