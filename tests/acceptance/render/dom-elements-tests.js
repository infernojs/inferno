/** @jsx t */

import get from '../../tools/get';

export default function domElementsTests(describe, expect, Inferno) {
    describe('DOM elements tests', () => {
        let container;

        beforeEach(() => {
            container = document.createElement('div');
        });

        afterEach(() => {
            Inferno.clearDomElement(container);
            container = null;
        });

        describe('using the Inferno functional API', () => {
            describe('should render a basic example', () => {
                let template;

                beforeEach(() => {
                    template = Inferno.createTemplate(t => <div>Hello world</div>);
                    Inferno.render(Inferno.createFragment(null, template), container);
                });

                it('Initial render (creation)', () => {
                    expect(
                        container.innerHTML
                    ).to.equal(
                        '<div>Hello world</div>'
                    );
                });

                it('Second render (update)', () => {
                    Inferno.render(Inferno.createFragment(null, template), container);
                    expect(
                        container.innerHTML
                    ).to.equal(
                        '<div>Hello world</div>'
                    );
                });
            });


            describe('should render a basic example #2 (no JSX)', () => {
                let template;

                beforeEach(() => {
                    template = Inferno.createTemplate(createElement =>
                        createElement('ul', null,
                            createElement('li', null, 'Im a li-tag'),
                            createElement('li', null, 'Im a li-tag'),
                            createElement('li', null, 'Im a li-tag')
                        )
                    );
                    Inferno.render(Inferno.createFragment(null, template), container);
                });

                it('Initial render (creation)', () => {
                    expect(
                        container.innerHTML
                    ).to.equal(
                        `<ul><li>Im a li-tag</li><li>Im a li-tag</li><li>Im a li-tag</li></ul>`
                    );
                });
            });

            describe('should render a basic example #3 (no JSX)', () => {
                let template;

                beforeEach(() => {
                    template = Inferno.createTemplate(t =>
                        t('ul', null,
                            t('li', null, t('span', null, 'Im a li-tag')),
                            t('li', null, t('span', null, 'Im a li-tag')),
                            t('li', null, t('span', null, 'Im a li-tag'))
                        )
                    );
                    Inferno.render(Inferno.createFragment(null, template), container);
                });

                it('Initial render (creation)', () => {
                    expect(
                        container.innerHTML
                    ).to.equal(
                        `<ul><li><span>Im a li-tag</span></li><li><span>Im a li-tag</span></li><li><span>Im a li-tag</span></li></ul>`
                    );
                });
            });

            describe('shouldn\'t render null value (no JSX)', () => {
                let template;

                beforeEach(() => {
                    template = Inferno.createTemplate(t =>
                        t('input', { value: null })
                    );
                    Inferno.render(Inferno.createFragment(null, template), container);
                });

                it('Initial render (creation)', () => {

                    expect( container.value ).to.be.undefined;
                    expect(
                        container.innerHTML
                    ).to.equal(
                        '<input>'
                    );
                });
            });

            describe('should set values as properties by default (no JSX)', () => {
                let template;

                beforeEach(() => {
                    template = Inferno.createTemplate(t =>
                        t('input', { title: 'Tip!' })
                    );
                    Inferno.render(Inferno.createFragment(null, template), container);
                });

                it('Initial render (creation)', () => {
                    expect(container.firstChild.getAttribute('title')).to.eql('Tip!');
                    expect(
                        container.innerHTML
                    ).to.equal(
                        '<input title="Tip!">'
                    );
                });
            });

            describe('should render value multiple attribute (no JSX)', () => {

                beforeEach(() => {
                    let template = Inferno.createTemplate(t =>
                        t('select', { multiple: true, value: 'foo' },
                            t('option', { value: 'foo' }, `I'm a li-tag`),
                            t('option', { value: 'bar' }, `I'm a li-tag`)
                        )
                    );

                    Inferno.render(Inferno.createFragment(null, template), container);
                });

                it('Initial render (creation)', () => {

                    expect(get(container.firstChild)).to.eql(['foo']);
                    expect(
                        container.innerHTML
                    ).to.equal(
                        '<select multiple="true"><option value="foo">I\'m a li-tag</option><option value="bar">I\'m a li-tag</option></select>'
                    );
                });
            });

            describe('should render a basic example with dynamic values', () => {
                let template;

                beforeEach(() => {
                    template = Inferno.createTemplate((t, val1, val2) =>
                        <div>Hello world - { val1 } { val2 }</div>
                    );
                    Inferno.render(Inferno.createFragment(['Inferno', 'Owns'], template), container);
                });

                it('Initial render (creation)', () => {
                    expect(
                        container.innerHTML
                    ).to.equal(
                        '<div>Hello world - Inferno Owns</div>'
                    );
                });

                it('Second render (update)', () => {
                    Inferno.render(Inferno.createFragment(['Test', 'Works!'], template), container);
                    expect(
                        container.innerHTML
                    ).to.equal(
                        '<div>Hello world - Test Works!</div>'
                    );
                });
            });

            describe('should properly render input download attribute', () => {
                let template;

                beforeEach(() => {
                    template = Inferno.createTemplate((t, val1) =>
                        <input download={ val1 }></input>
                    );
                    Inferno.render(Inferno.createFragment(false, template), container);
                });

                it('Initial render (creation)', () => {
                    expect(
                        container.innerHTML
                    ).to.equal(
                        '<input download="false">'
                    );
                });

                it('Second render (update)', () => {
                    Inferno.render(Inferno.createFragment(true, template), container);
                    expect(
                        container.innerHTML
                    ).to.equal(
                        '<input download="true">'
                    );
                });
            });

            describe('should properly render input download attribute (HTML5)', () => {
                let template;

                beforeEach(() => {
                    template = Inferno.createTemplate((t, val1) =>
                        <input download={ val1 }></input>
                    );
                    Inferno.render(Inferno.createFragment('dominic', template), container);
                });

                it('Initial render (creation)', () => {
                    expect(
                        container.innerHTML
                    ).to.equal(
                        '<input download="dominic">'
                    );
                });

                it('Second render (update)', () => {
                    Inferno.render(Inferno.createFragment(true, template), container);
                    expect(
                        container.innerHTML
                    ).to.equal(
                        '<input download="true">'
                    );
                });
            });

            describe('should properly render "width" and "height" attributes', () => {
                let template;

                beforeEach(() => {
                    template = Inferno.createTemplate(t =>
                        <img src="" alt="Smiley face" height={42} width={42}></img>
                    );
                    Inferno.render(Inferno.createFragment(null, template), container);
                });

                it('Initial render (creation)', () => {
                    expect(
                        container.innerHTML
                    ).to.equal(
                        '<img src="" alt="Smiley face" height="42" width="42">'
                    );
                });

                it('Second render (update)', () => {

                    template = Inferno.createTemplate(t =>
                        <img src="" alt="Smiley face" height={14} width={42}></img>
                    );

                    Inferno.render(Inferno.createFragment(null, template), container);
                    expect(
                        container.innerHTML
                    ).to.equal(
                        '<img src="" alt="Smiley face" height="14" width="42">'
                    );
                });
            });
            describe('should properly render boolean attribues (html5)', () => {
                let template;

                beforeEach(() => {
                    template = Inferno.createTemplate(t =>
                        <input checked="checked" disabled="disabled"></input>
                    );
                    Inferno.render(Inferno.createFragment(null, template), container);
                });

                it('Initial render (creation)', () => {
                    expect(
                        container.innerHTML
                    ).to.equal(
                        '<input disabled="disabled">'
                    );
                });

                it('Second render (update)', () => {

                    template = Inferno.createTemplate(t =>
                        <input checked="checked" disabled="disabled"></input>
                    );

                    Inferno.render(Inferno.createFragment(null, template), container);
                    expect(
                        container.innerHTML
                    ).to.equal(
                        '<input disabled="disabled">'
                    );
                });
            });

            describe('should properly render boolean attribues (truthy)', () => {
                let template;

                beforeEach(() => {
                    template = Inferno.createTemplate(t =>
                        <input checked={true} disabled={true}></input>
                    );
                    Inferno.render(Inferno.createFragment(null, template), container);
                });

                it('Initial render (creation)', () => {
                    expect(
                        container.innerHTML
                    ).to.equal(
                        '<input disabled="true">'
                    );
                });


                it('Second render (update)', () => {

                    template = Inferno.createTemplate(t =>
                        <input checked={false} disabled={true}></input>
                    );

                    Inferno.render(Inferno.createFragment(null, template), container);
                    expect(
                        container.innerHTML
                    ).to.equal(
                        '<input disabled="true">'
                    );
                });
            });

            describe('should not render overloaded boolean attribues (falsy)', () => {
                let template;

                beforeEach(() => {
                    template = Inferno.createTemplate(t =>
                        <div checked={false} disabled={false}></div>
                    );
                    Inferno.render(Inferno.createFragment(null, template), container);
                });

                it('Initial render (creation)', () => {
                    expect(
                        container.innerHTML
                    ).to.equal(
                        '<div disabled="false"></div>'
                    );
                });

                it('Second render (update)', () => {

                    template = Inferno.createTemplate(t =>
                        <span checked={false} disabled={false}></span>
                    );

                    Inferno.render(Inferno.createFragment(null, template), container);
                    expect(
                        container.innerHTML
                    ).to.equal(
                        '<span disabled="false"></span>'
                    );
                });
            });

            describe('should properly render boolean attribues (falsy)', () => {
                let template;

                beforeEach(() => {
                    template = Inferno.createTemplate(t =>
                        <input checked="false" disabled="false"></input>
                    );
                    Inferno.render(Inferno.createFragment(null, template), container);
                });

                it('Initial render (creation)', () => {
                    expect(
                        container.innerHTML
                    ).to.equal(
                        '<input disabled="false">'
                    );
                });

                it('Second render (update)', () => {

                    Inferno.render(Inferno.createFragment(null, template), container);
                    expect(
                        container.innerHTML
                    ).to.equal(
                        '<input disabled="false">'
                    );
                });
            });

            describe('should render video / audio attributes', () => {
                let template;
                beforeEach(() => {
                    template = Inferno.createTemplate(t =>
                        <input type='file' multiple='multiple' capture='capture' accept='image/*'></input>
                    );
                    Inferno.render(Inferno.createFragment(null, template), container);
                });

                it('Initial render (creation)', () => {
                    expect(
                        container.innerHTML
                    ).to.equal(
                        '<input type="file" multiple="multiple" capture="capture" accept="image/*">'
                    );
                });
            });

            describe('shouldn\'t render undefined value', () => {
                let template;

                beforeEach(() => {
                    template = Inferno.createTemplate(t =>
                        <div className={undefined}></div>
                    );
                    Inferno.render(Inferno.createFragment(null, template), container);
                });

                it('Initial render (creation)', () => {
                    expect(
                        container.innerHTML
                    ).to.equal(
                        '<div></div>'
                    );
                });
            });


            describe('should render download with boolean null value', () => {
                let template;

                beforeEach(() => {
                    template = Inferno.createTemplate(t =>
                        <input href="/images/xxx.jpg" download={null}></input>
                    );
                    Inferno.render(Inferno.createFragment(null, template), container);
                });

                it('Initial render (creation)', () => {
                    expect(
                        container.innerHTML
                    ).to.equal(
                         '<input href="/images/xxx.jpg">'
                    );
                });

                it('Second render (update)', () => {

                    template = Inferno.createTemplate(t =>
                        <input checked="checked" disabled="disabled"></input>
                    );

                    Inferno.render(Inferno.createFragment(null, template), container);
                    expect(
                        container.innerHTML
                    ).to.equal(
                        '<input disabled="disabled">'
                    );
                });
            });


            describe('should not render overloaded "allowFullScreen" boolean attributes', () => {
                let template;

                beforeEach(() => {
                    template = Inferno.createTemplate(t =>
                        <input allowFullScreen={false}></input>
                    );
                    Inferno.render(Inferno.createFragment(null, template), container);
                });

                it('Initial render (creation)', () => {
                    expect(
                        container.innerHTML
                    ).to.equal(
                        '<input allowfullscreen="false">'
                    );
                });

                it('Second render (update)', () => {

                    template = Inferno.createTemplate(t =>
                        <input checked="checked" disabled="disabled"></input>
                    );

                    Inferno.render(Inferno.createFragment(null, template), container);
                    expect(
                        container.innerHTML
                    ).to.equal(
                        '<input disabled="disabled">'
                    );
                });
            });

            describe('should render "allowFullScreen" boolean attributes', () => {
                let template;

                beforeEach(() => {
                    template = Inferno.createTemplate(t =>
                        <input allowFullScreen="false"></input>
                    );
                    Inferno.render(Inferno.createFragment(null, template), container);
                });

                it('Initial render (creation)', () => {
                    expect(
                        container.innerHTML
                    ).to.equal(
                       '<input allowfullscreen="false">'
                    );
                });

                it('Second render (update)', () => {

                    template = Inferno.createTemplate(t =>
                        <input isMap={true}></input>
                    );

                    Inferno.render(Inferno.createFragment(null, template), container);
                    expect(
                        container.innerHTML
                    ).to.equal(
                        '<input ismap="true">' 
                    );
                });
            });

            describe('should not render "scoped" boolean attributes as "null"', () => {
                let template;

                beforeEach(() => {
                    template = Inferno.createTemplate(t =>
                        <input scoped={null}></input>
                    );
                    Inferno.render(Inferno.createFragment(null, template), container);
                });

                it('Initial render (creation)', () => {
                    expect(
                        container.innerHTML
                    ).to.equal(
                        '<input>'
                    );
                });

                // Update to a property
                it('Second render (update)', () => {
                    template = Inferno.createTemplate(t =>
                        <input noValidate={ true }></input>
                    );

                    Inferno.render(Inferno.createFragment(null, template), container);
                    expect(
                        container.innerHTML
                    ).to.equal(
                        '<input>'
                    );
                });
            });

            describe('should render "required" boolean attribute (truthy)', () => {
                let template;

                beforeEach(() => {
                    template = Inferno.createTemplate(t =>
                        <input required={true}></input>
                    );
                    Inferno.render(Inferno.createFragment(null, template), container);
                });

                it('Initial render (creation)', () => {
                    // this is a property

                    expect(
                        container.innerHTML
                    ).to.equal(
                        '<input>'
                    );
                });

                it('Second render (update)', () => {

                    template = Inferno.createTemplate(t =>
                        <input disabled={true}></input>
                    );

                    Inferno.render(Inferno.createFragment(null, template), container);
                    expect(
                        container.innerHTML
                    ).to.equal(
                        '<input disabled="true">'
                    );
                });
            });

            // 'required' is a property and should not be set if a falsy value
            describe('should render "required" boolean attribute (falsy)', () => {
                let template;

                beforeEach(() => {
                    template = Inferno.createTemplate(t =>
                        <input required={false}></input>
                    );
                    Inferno.render(Inferno.createFragment(null, template), container);
                });

                it('Initial render (creation)', () => {
                    // this is a property
                    expect(
                        container.innerHTML
                    ).to.equal(
                        '<input>'
                    );
                });

                it('Second render (update)', () => {

                    template = Inferno.createTemplate(t =>
                        <input disabled={true}></input>
                    );

                    Inferno.render(Inferno.createFragment(null, template), container);
                    expect(
                        container.innerHTML
                    ).to.equal(
                        '<input disabled="true">'
                    );
                });
            });


            describe('should render "hidden" boolean attribute (truthy)', () => {
                let template;

                beforeEach(() => {
                    template = Inferno.createTemplate(t =>
                        <input hidden={true}></input>
                    );
                    Inferno.render(Inferno.createFragment(null, template), container);
                });

                it('Initial render (creation)', () => {
                    // this is a property
                    expect(
                        container.innerHTML
                    ).to.equal(
                        '<input hidden="true">'
                    );
                });

                it('Second render (update)', () => {

                    template = Inferno.createTemplate(t =>
                        <input hidden="false"></input>
                    );

                    Inferno.render(Inferno.createFragment(null, template), container);
                    expect(
                        container.innerHTML
                    ).to.equal(
                        '<input hidden="false">'
                    );
                });
            });

            describe('should render "hidden" boolean attribute (falsy)', () => {
                let template;

                beforeEach(() => {
                    template = Inferno.createTemplate(t =>
                        <input hidden={false}></input>
                    );
                    Inferno.render(Inferno.createFragment(null, template), container);
                });

                it('Initial render (creation)', () => {
                    // this is a property

                    expect(
                        container.innerHTML
                    ).to.equal(
                        '<input hidden="false">'
                    );
                });

                it('Second render (update)', () => {

                    template = Inferno.createTemplate(t =>
                        <input hidden="false"></input>
                    );

                    Inferno.render(Inferno.createFragment(null, template), container);
                    expect(
                        container.innerHTML
                    ).to.equal(
                        '<input hidden="false">'
                    );
                });
            });

            describe('should render "draggable" boolean attribute (truthy)', () => {
                let template;

                beforeEach(() => {
                    template = Inferno.createTemplate(t =>
                        <input draggable="true"></input>
                    );
                    Inferno.render(Inferno.createFragment(null, template), container);
                });

                it('Initial render (creation)', () => {
                    // this is a property

                    expect(
                        container.innerHTML
                    ).to.equal(
                        '<input draggable="true">' 
                    );
                });
                it('Second render (update)', () => {

                    template = Inferno.createTemplate(t =>
                        <input hidden="false"></input>
                    );

                    Inferno.render(Inferno.createFragment(null, template), container);
                    expect(
                        container.innerHTML
                    ).to.equal(
                       '<input hidden="false">' 
                    );
                });
            });

            describe('should not render "hidden" boolean attributes if "null"', () => {
                let template;

                beforeEach(() => {
                    template = Inferno.createTemplate(t =>
                        <input hidden={null}></input>
                    );
                    Inferno.render(Inferno.createFragment(null, template), container);
                });

                it('Initial render (creation)', () => {
                    // this is a property

                    expect(
                        container.innerHTML
                    ).to.equal(
                        '<input>' 
                    );
                });
                it('Second render (update)', () => {

                    template = Inferno.createTemplate(t =>
                        <input hidden="false"></input>
                    );

                    Inferno.render(Inferno.createFragment(null, template), container);
                    expect(
                        container.innerHTML
                    ).to.equal(
                        '<input hidden="false">'
                    );
                });
            });

            describe('should not render "formNoValidate" boolean attributes if "null"', () => {
                let template;

                beforeEach(() => {
                    template = Inferno.createTemplate(t =>
                        <input formNoValidate={null}></input>
                    );
                    Inferno.render(Inferno.createFragment(null, template), container);
                });

                it('Initial render (creation)', () => {
                    // this is a property

                    expect(
                        container.innerHTML
                    ).to.equal(
                       '<input>' 
                    );
                });
                it('Second render (update)', () => {

                    template = Inferno.createTemplate(t =>
                        <input hidden="false"></input>
                    );

                    Inferno.render(Inferno.createFragment(null, template), container);
                    expect(
                        container.innerHTML
                    ).to.equal(
                        '<input hidden="false">'
                    );
                });
            });

            describe('should render `formNoValidate` boolean attribute (thruty)', () => {
                let template;

                beforeEach(() => {
                    template = Inferno.createTemplate(t =>
                        <input formNoValidate={ true }></input>
                    );
                    Inferno.render(Inferno.createFragment(null, template), container);
                });

                it('Initial render (creation)', () => {
                    // this is a property
                    expect(
                        container.innerHTML
                    ).to.equal(
                       '<input>' 
                    );
                });

                // Update to a property
                it('Second render (update)', () => {
                    template = Inferno.createTemplate(t =>
                        <input noValidate={true}></input>
                    );

                    Inferno.render(Inferno.createFragment(null, template), container);
                    expect(
                        container.innerHTML
                    ).to.equal(
                      '<input>' 
                    );
                });
            });


            describe('should not render "seamless" boolean attributes if "null"', () => {
                let template;

                beforeEach(() => {
                    template = Inferno.createTemplate(t =>
                        <span seamless={null}></span>
                    );
                    Inferno.render(Inferno.createFragment(null, template), container);
                });

                it('Initial render (creation)', () => {
                    // this is a property
                    expect(
                        container.innerHTML
                    ).to.equal(
                        '<span></span>'
                    );
                });

                // Update to a property
                it('Second render (update)', () => {
                    template = Inferno.createTemplate(t =>
                        <span noValidate={ true }></span>
                    );

                    Inferno.render(Inferno.createFragment(null, template), container);
                    expect(
                        container.innerHTML
                    ).to.equal(
                        '<span></span>'
                    );
                });
            });

            describe('should render "seamless" boolean attribute (thruty)', () => {
                let template;

                beforeEach(() => {
                    template = Inferno.createTemplate(t =>
                        <input seamless={ true }></input>
                    );
                    Inferno.render(Inferno.createFragment(null, template), container);
                });

                it('Initial render (creation)', () => {
                    // this is a property

                    expect(
                        container.innerHTML
                    ).to.equal(
                        '<input seamless="true">'
                    );
                });

                // Update to a property
                it('Second render (update)', () => {
                    template = Inferno.createTemplate(t =>
                        <input type='checkbox' required={ true }></input>
                    );

                    Inferno.render(Inferno.createFragment(null, template), container);
                    expect(
                        container.innerHTML
                    ).to.equal(
                       '<input type="checkbox">' 
                    );
                });
            });

            describe('should properly render numeric properties', () => {
                let template;

                beforeEach(() => {
                    template = Inferno.createTemplate(t =>
                        <input start="5"></input>
                    );
                    Inferno.render(Inferno.createFragment(null, template), container);
                });

                it('Initial render (creation)', () => {
                    expect(
                        container.innerHTML
                    ).to.equal(
                        '<input start="5">'
                    );
                });

                // Update to a property
                it('Second render (update)', () => {

                    template = Inferno.createTemplate(t =>
                        <input spellCheck={ true }></input>
                    );

                    Inferno.render(Inferno.createFragment(null, template), container);
                    expect(
                        container.innerHTML
                    ).to.equal(
                        '<input>'
                    );
                });
            });

            describe('should properly render "disabled" boolean property', () => {
                let template;

                beforeEach(() => {
                    template = Inferno.createTemplate(t =>
                        <input type='checkbox' disabled={true}></input>
                    );
                    Inferno.render(Inferno.createFragment(null, template), container);
                });

                it('Initial render (creation)', () => {
                    expect(
                        container.innerHTML
                    ).to.equal(
                        '<input type="checkbox" disabled="true">'
                    );
                });

            });

            describe('should not render overloaded falsy boolean properties', () => {
                let template;

                beforeEach(() => {
                    template = Inferno.createTemplate(t =>
                        <input disabled={false} type='checkbox'></input>
                    );
                    Inferno.render(Inferno.createFragment(null, template), container);
                });

                it('Initial render (creation)', () => {
                    expect(
                        container.innerHTML
                    ).to.equal(
                         '<input disabled="false" type="checkbox">' 
                    );
                });
            });

            describe('should not render overloaded falsy boolean properties', () => {
                let template;

                beforeEach(() => {
                    template = Inferno.createTemplate(t =>
                        <input disabled="false" type='checkbox'></input>
                    );
                    Inferno.render(Inferno.createFragment(null, template), container);
                });

                it('Initial render (creation)', () => {
                    expect(
                        container.innerHTML
                    ).to.equal(
                         '<input disabled="false" type="checkbox">' 
                    );
                });
            });

            describe('should render disabled boolean property as "disabled"', () => {
                let template;

                beforeEach(() => {
                    template = Inferno.createTemplate(t =>
                        <input type='checkbox' disabled='disabled'></input>
                    );
                    Inferno.render(Inferno.createFragment(null, template), container);
                });

                it('Initial render (creation)', () => {
                    expect(
                        container.innerHTML
                    ).to.equal(
                        '<input type="checkbox" disabled="disabled">'
                    );
                });
            });

            describe('should properly handle custom properties on web components', () => {
                let template;

                beforeEach(() => {
                    template = Inferno.createTemplate(t =>
                        <div dominic="cool"></div>
                    );
                    Inferno.render(Inferno.createFragment(null, template), container);
                });

                it('Initial render (creation)', () => {
                    expect(
                        container.innerHTML
                    ).to.equal(
                        '<div dominic="cool"></div>'
                    );
                });
            });

            describe('should properly handle "aria-label" attribute', () => {
                let template;

                beforeEach(() => {
                    template = Inferno.createTemplate(t =>
                        <div aria-label="false"></div>
                    );
                    Inferno.render(Inferno.createFragment(null, template), container);
                });

                it('Initial render (creation)', () => {
                    expect(
                        container.innerHTML
                    ).to.equal(
                        '<div aria-label="false"></div>'
                    );
                });
            });

            describe('should properly handle custom properties', () => {
                let template;

                beforeEach(() => {
                    template = Inferno.createTemplate(t =>
                        <div awesomeness="5"></div>
                    );
                    Inferno.render(Inferno.createFragment(null, template), container);
                });

                it('Initial render (creation)', () => {
                    expect(
                        container.innerHTML
                    ).to.equal(
                        '<div awesomeness="5"></div>'
                    );
                });
            });

            describe('should properly handle the "title" attribute', () => {
                let template;

                beforeEach(() => {
                    template = Inferno.createTemplate(t =>
                        <div title="Inferno"></div>
                    );

                    Inferno.render(Inferno.createFragment(null, template), container);
                });

                it('Initial render (creation)', () => {
                    expect(
                        container.innerHTML
                    ).to.equal(
                        '<div title="Inferno"></div>'
                    );
                });
            });

            describe('should not set "contentEditable" as a null value', () => {
                let template;

                beforeEach(() => {
                    template = Inferno.createTemplate(t =>
                        <div contentEditable={null}></div>
                    );
                    Inferno.render(Inferno.createFragment(null, template), container);
                });

                it('Initial render (creation)', () => {
                    expect(
                        container.innerHTML
                    ).to.equal(
                        '<div></div>'
                    );
                });
            });

            describe('should set "contentEditable" property', () => {
                let template;

                beforeEach(() => {
                    template = Inferno.createTemplate(t =>
                        <div contentEditable={true}></div>
                    );
                    Inferno.render(Inferno.createFragment(null, template), container);
                });

                it('Initial render (creation)', () => {
                    expect(
                        container.innerHTML
                    ).to.equal(
                        '<div contenteditable="true"></div>'
                    );
                });
            });
            describe('should set "contentEditable" property', () => {
                let template;

                beforeEach(() => {
                    template = Inferno.createTemplate(t =>
                        <div contentEditable={false}></div>
                    );
                    Inferno.render(Inferno.createFragment(null, template), container);
                });

                it('Initial render (creation)', () => {
                    expect(
                        container.innerHTML
                    ).to.equal(
                        '<div contenteditable="false"></div>'
                    );
                });
            });


            describe('should support number values', () => {
                let template;

                let styleRule = { width: 7 };

                beforeEach(() => {
                    template = Inferno.createTemplate(t =>
                        <div style={styleRule}></div>
                    );
                    Inferno.render(Inferno.createFragment(null, template), container);
                });

                it('Initial render (creation)', () => {

                    expect(
                        container.innerHTML
                    ).to.equal(
                        '<div style="width: 7px;"></div>'
                    );
                });
            });
/*
            describe('should support refs', () => {
                let template;
                let divRef = Inferno.createRef();

                beforeEach(() => {
                    template = Inferno.createTemplate((t, divRef) =>
                        <div ref={ divRef }></div>
                    );
                    Inferno.render(Inferno.createFragment(divRef, template), container);
                });

                it('Initial render (creation)', () => {
                    expect(
                        divRef.element
                    ).to.equal(
                        container.firstChild
                    );
                });
            });*/

            describe('should render a basic component', () => {
                class TestComponent extends Inferno.Component {
                    render() {
                        return Inferno.createFragment(null, t =>
                            <span>Hello world!</span>
                        );
                    }
                }
                let template;

                beforeEach(() => {
                    template = Inferno.createTemplate((t, Component) =>
                        <div class='foo'>
                            <Component />
                        </div>
                    );
                    Inferno.render(Inferno.createFragment(TestComponent, template), container);
                });

                it('Initial render (creation)', () => {
                    expect(
                        container.innerHTML
                    ).to.equal(
                        `<div class="foo"><span>Hello world!</span></div>`
                    );
                });
            });

            describe('should render a basic component #2', () => {
                class TestComponent extends Inferno.Component {
                    render() {
                        return Inferno.createFragment(null, t =>
                            <span>Hello world!</span>
                        );
                    }
                }
                let template;

                beforeEach(() => {
                    template = Inferno.createTemplate((t, Component) =>
                        <div class='foo'>
                            <span>Foo!</span>
                            <Component />
                        </div>
                    );
                    Inferno.render(Inferno.createFragment(TestComponent, template), container);
                });

                it('Initial render (creation)', () => {
                    expect(
                        container.innerHTML
                    ).to.equal(
                        `<div class="foo"><span>Foo!</span><span>Hello world!</span></div>`
                    );
                });
            });

            describe('should render a basic component #3', () => {
                class TestComponent extends Inferno.Component {
                    render() {
                        return Inferno.createFragment(this.props.test, (t, val1) =>
                            <span>Hello world! { val1 } are belong to us</span>
                        );
                    }
                }
                let template;

                beforeEach(() => {
                    template = Inferno.createTemplate((t, Component, val1) =>
                        <div class='foo'>
                            <span>Foo!</span>
                            <Component test={ val1 } />
                        </div>
                    );
                    Inferno.render(Inferno.createFragment([TestComponent, 'All your base'], template), container);
                });

                it('Initial render (creation)', () => {
                    expect(
                        container.innerHTML
                    ).to.equal(
                        `<div class="foo"><span>Foo!</span><span>Hello world! All your base are belong to us</span></div>`
                    );
                });
            });
        });
    });

}
