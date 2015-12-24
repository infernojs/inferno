import Inferno from '../../../../src';
import get from '../../../tools/get';

const {
    createElement
} = Inferno.TemplateFactory;

describe('DOM element tests2 (no-jsx)', () => {
    let container;

    beforeEach(() => {
        container = document.createElement('div');
    });

    afterEach(() => {
        Inferno.render(null, container);
    });

    describe('should patch a wrapped text node with its container', () => {
        const template = Inferno.createTemplate((child) => ({
            tag: 'div',
            children: child
        }));

        it('first render (creation)', () => {
            const span = Inferno.createTemplate(() => ({
                tag: 'div',
                children: 'Hello'
            }));
            Inferno.render(template(span()), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div><div>Hello</div></div>'
            );
            Inferno.render(template(null), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div></div>'
            );

            Inferno.render(template(undefined), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div></div>'
            );

            Inferno.render(template(), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div></div>'
            );

        });
        it('second render - (update)', () => {
            const span = Inferno.createTemplate(() => ({
                tag: 'span',
                children: 'Good bye!'
            }));

            const b = Inferno.createTemplate(() => ({
                tag: 'b',
                children: 'Good bye!'
            }));

            Inferno.render(template(span()), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div><span>Good bye!</span></div>'
            );

            Inferno.render(template(b()), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div><b>Good bye!</b></div>'
            );

            Inferno.render(template(null), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div></div>'
            );

            Inferno.render(template(), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div></div>'
            );
        });
    });

    describe('should patch a text node into a tag node', () => {
        const template = Inferno.createTemplate((child) => ({
            tag: 'div',
            children: child
        }));

        it('first render (creation)', () => {
            const span = Inferno.createTemplate(function() {
                return 'Hello'
            });

            Inferno.render(template(span()), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div>Hello</div>'
            );

            const textSpan = Inferno.createTemplate(function() {
                return { text: 'Hello' }
            });
            
			Inferno.render(template(textSpan()), container);
			expect(
                container.innerHTML
            ).to.equal(
                '<div>Hello</div>'
            );

			Inferno.render(template(null), container);
			expect(
                container.innerHTML
            ).to.equal(
                '<div></div>'
            );

			Inferno.render(template(undefined), container);
			expect(
                container.innerHTML
            ).to.equal(
                '<div></div>'
            );

			Inferno.render(template({}), container);
			expect(
                container.innerHTML
            ).to.equal(
                '<div></div>'
            );

			Inferno.render(template([]), container);
			expect(
                container.innerHTML
            ).to.equal(
                '<div></div>'
            );

        });

        it('second render - (update)', () => {
            const span = Inferno.createTemplate(() => ({
                tag: 'span',
                children: 'Good bye!'
            }));

            Inferno.render(template(span()), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div><span>Good bye!</span></div>'
            );
            
            const span1 = Inferno.createTemplate(() => ({
                tag: 'span',
                children: ' Good bye!   '
            }));

            Inferno.render(template(span1()), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div><span> Good bye!   </span></div>'
            );

            Inferno.render(template(undefined), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div></div>'
            );
        });
    });

    describe('should patch a tag node into a text node', () => {
        const template = Inferno.createTemplate((child) => ({
            tag: 'div',
            children: child
        }));

        it('first render (creation)', () => {
            const span = Inferno.createTemplate(() => ({
                tag: 'span',
                children: 'Good bye!'
            }));
            Inferno.render(template(span()), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div><span>Good bye!</span></div>'
            );
            Inferno.render(template(span()), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div><span>Good bye!</span></div>'
            );

            Inferno.render(template(span()), container);
            expect(
                container.innerHTML
            ).to.equal(
	            '<div><span>Good bye!</span></div>'
            );

        });

        it('second render - (update)', () => {
            const span = Inferno.createTemplate(function() {
                return 'Hello'
            });
            Inferno.render(template(span()), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div>Hello</div>'
            );

            expect(
                () => Inferno.createTemplate(function() {
                    return undefined
                })
            ).to.throw;
        });
    });

    describe('should render text then update it', () => {
        const template = Inferno.createTemplate((child) => ({
            tag: 'div',
            children: child
        }));

        it('first render (creation)', () => {
            const span = Inferno.createTemplate(function() {
                return 'Hello'
            });
            Inferno.render(template(span()), container);
            expect(container.firstChild.innerHTML).to.equal('Hello');
        });
        it('second render - (update)', () => {
            const span = Inferno.createTemplate(function() {
                return 'Hello, World'
            });
            Inferno.render(template(span()), container);
            expect(container.firstChild.innerHTML).to.equal('Hello, World');
        });
    });

describe('various random DOM tests', () => {
        it('should throw an error as the text property cannot be used with the children property on the same node', () => {
            expect(() => {
                const template = Inferno.createTemplate(() => ({
                    tag: 'div',
                    text: 'Hello',
                    children: {
                        tag: 'span',
                        children: {
                            tag: 'span',
                            children: 'World!'
                        }
                    }
                }));
            }).to.throw(Error);
        });
        it('should render a static shape div (static attr) > span > span > text', () => {
            const template = Inferno.createTemplate(() => ({
                tag: 'div',
                attrs: {
                    id: 'foo'
                },
                children: {
                    tag: 'span',
                    children: {
                        tag: 'span',
                        children: 'Visible child!!'
                    }
                }
            }));
            Inferno.render(template(), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div id="foo"><span><span>Visible child!!</span></span></div>'
            );
            Inferno.render(template(), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div id="foo"><span><span>Visible child!!</span></span></div>'
            );
        });
        it('should render a shape div (dynamic attr) > text', () => {
            const template = Inferno.createTemplate((val1) => ({
                tag: 'div',
                attrs: {
                    id: val1
                },
                children: {
                    text: 'Hello, World'
                }
            }));
            Inferno.render(template('test'), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div id="test">Hello, World</div>'
            );
            Inferno.render(template('test'), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div id="test">Hello, World</div>'
            );
        });
        it('should render a shape div (dynamic attr) > text, span > text', () => {
            const template = Inferno.createTemplate((val1) => ({
                tag: 'div',
                attrs: {
                    id: val1
                },
                children: [{
                    text: 'Hello, World'
                }, {
                    tag: 'span',
                    text: 'Hello, World'
                }]
            }));
            Inferno.render(template('test'), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div id="test">Hello, World<span>Hello, World</span></div>'
            );
            Inferno.render(template('foo'), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div id="foo">Hello, World<span>Hello, World</span></div>'
            );
        });
        it('should render a shape div (dynamic attr) > text, span (static attr) > text', () => {
            const template = Inferno.createTemplate((val1) => ({
                tag: 'div',
                attrs: {
                    id: val1
                },
                children: [{
                    text: 'Hello, World'
                }, {
                    tag: 'span',
                    attrs: {
                        class: 'foo'
                    },
                    text: 'Hello, World'
                }]
            }));
            Inferno.render(template('test'), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div id="test">Hello, World<span class="foo">Hello, World</span></div>'
            );
        });
        it('should render a static shape div > span > span > text', () => {
            const template = Inferno.createTemplate(() => ({
                tag: 'div',
                attrs: {
                    id: 'foo'
                },
                children: {
                    tag: 'span',
                    children: {
                        tag: 'span',
                        children: 'Visible child!!'
                    }
                }
            }));
            Inferno.render(template(), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div id="foo"><span><span>Visible child!!</span></span></div>'

            );
        });
        it('should render a shape div > text (dynamic)', () => {
            const template = Inferno.createTemplate((child) => ({
                tag: 'div',
                children: child
            }));
            Inferno.render(template('foo'), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div>foo</div>'
            );

            Inferno.render(template('bar'), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div>bar</div>'
            );

            Inferno.render(template(), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div></div>'
            );

        });
        it('should render a shape div > [ text, text, text ] (dynamic)', () => {
            const template = Inferno.createTemplate((child) => ({
                tag: 'div',
                children: child
            }));

            Inferno.render(template(['1', '2', '3']), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div>123</div>'
            );

			Inferno.render(template(['1', '2', '4']), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div>124</div>'
            );

			Inferno.render(template(['1', '2']), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div>12</div>'
            );

			Inferno.render(template([1, 2]), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div>12</div>'
            );

			Inferno.render(template([1, undefined, 2]), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div>12</div>'
            );

			Inferno.render(template([1, null, 2]), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div>12</div>'
            );
            
			Inferno.render(template([null]), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div></div>'
            );

			Inferno.render(template(null), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div></div>'
            );

        });

        it('should render a shape div (static attrs) > fragment [ span > fragment [ span > text, text, text ] ]', () => {
            const template = Inferno.createTemplate((child) => ({
                tag: 'div',
                attrs: {
                    class: 'hello, world'
                },
                children: child
            }));
            const b = Inferno.createTemplate(() => ({
                tag: 'span',
                children: ['1', '2', '3']
            }));
			
            const span = Inferno.createTemplate((b) => ({
                tag: 'span',
                children: b
            }));
            
			Inferno.render(template(span(b())), container);
            
			expect(
                container.innerHTML
            ).to.equal(
                '<div class="hello, world"><span><span>123</span></span></div>'
            );
			
			Inferno.render(template(span(b())), container);
            
			expect(
                container.innerHTML
            ).to.equal(
                '<div class="hello, world"><span><span>123</span></span></div>'
            );

			Inferno.render(template(undefined), container);
            
			expect(
                container.innerHTML
            ).to.equal(
                '<div class="hello, world"></div>'
            );

        });
        it('should throw and error when trying to render a shape div > text (dynamic), text, text (dynamic) due to dynamic variables being arrays', () => {
            const template = Inferno.createTemplate((val1, val2) => ({
                tag: 'div',
                children: [
                    val1,
                    ' foo',
                    val2
                ]
            }));
            expect(() => {
                Inferno.render(template(['Hello'], 'Bar'), container)
            }).to.throw(Error);
        });
        it('should render a shape void div (dynamic attrs)', () => {
            const template = Inferno.createTemplate((className) => ({
                tag: 'div',
                attrs: {
                    className: className
                }
            }));

            Inferno.render(template('test'), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div class="test"></div>'
            );

            Inferno.render(template(null), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div></div>'
            );

            Inferno.render(template(), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div></div>'
            );

          Inferno.render(template(123), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div class="123"></div>'
            );
        });
		
        it('should render a shape void div (dynamic attrs) #2', () => {
            const template = Inferno.createTemplate((attrs) => ({
                tag: 'div',
                attrs: attrs
            }));
            Inferno.render(template({
                className: 'test'
            }), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div class="test"></div>'
            );
            Inferno.render(template({
                className: 'foo'
            }), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div class="foo"></div>'
            );
        });
    });


    describe('should ignore falsy values', () => {
        let template = Inferno.createTemplate((arg) =>
            createElement('div', {
                class: arg
            })
        );

        it('Initial render (creation)', () => {
            Inferno.render(template(undefined), container);
            expect(container.firstChild.getAttribute('class')).to.be.null;
            expect(
                container.innerHTML
            ).to.equal(
                '<div></div>'
            );
        });
        it('Second render (update)', () => {
            Inferno.render(template(null), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div></div>'
            );
        });
        it('Third render (update)', () => {
            Inferno.render(template(false), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div class="false"></div>'
            );
            Inferno.render(template(true), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div class="true"></div>'
            );

        });
    });

    describe('should set truthy boolean values', () => {
        let template = Inferno.createTemplate((arg) =>
            createElement('div', {
                disabled: arg
            })
        );

        it('Initial render (creation)', () => {
            Inferno.render(template(''), container);
            expect(container.firstChild.getAttribute('disabled')).to.be.null;
            expect(
                container.innerHTML
            ).to.equal(
                '<div></div>'
            );
        });
        it('Second render (update)', () => {
            Inferno.render(template(true), container);
            expect(container.firstChild.disabled).to.equal(true);
            expect(
                container.innerHTML
            ).to.equal(
                '<div></div>'
            );

            Inferno.render(template(false), container);
            expect(container.firstChild.disabled).to.equal(false);
            expect(
                container.innerHTML
            ).to.equal(
                '<div></div>'
            );

           Inferno.render(template(true), container);
            expect(container.firstChild.disabled).to.equal(true);
            expect(
                container.innerHTML
            ).to.equal(
                '<div></div>'
            );
        });
        it('Third render (update)', () => {
            Inferno.render(template(false), container);
            expect(container.firstChild.disabled).to.equal(false);
            expect(
                container.innerHTML
            ).to.equal(
                '<div></div>'
            );
        });
    });


    describe('should set boolean element property', () => {
        let template = Inferno.createTemplate((arg) =>
            createElement('input', {
                'type': 'checkbox',
                'checked': arg
            })
        );

        it('Initial render (creation)', () => {
            Inferno.render(template('checked'), container);
            expect(container.firstChild.checked).to.eql(true);
            expect(
                container.innerHTML
            ).to.equal(
                '<input type="checkbox">'
            );

            Inferno.render(template('true'), container);
            expect(container.firstChild.checked).to.eql(true);
            expect(
                container.innerHTML
            ).to.equal(
                '<input type="checkbox">'
            );

            Inferno.render(template(false), container);
            expect(container.firstChild.checked).to.be.null;
            expect(
                container.innerHTML
            ).to.equal(
                '<input type="checkbox">'
            );

        });
        it('Second render (update)', () => {
            Inferno.render(template(true), container);
            expect(container.firstChild.checked).to.eql(true);
            expect(
                container.innerHTML
            ).to.equal(
                '<input type="checkbox">'
            );
        });
        it('Third render (update)', () => {
            Inferno.render(template(''), container);
            expect(container.firstChild.checked).to.eql(false);
            expect(
                container.innerHTML
            ).to.equal(
                '<input type="checkbox">'
            );

            Inferno.render(template(null), container);
            expect(container.firstChild.checked).to.be.false;
            expect(
                container.innerHTML
            ).to.equal(
                '<input type="checkbox">'
            );

            Inferno.render(template(true), container);
            expect(container.firstChild.checked).to.eql(true);
            expect(
                container.innerHTML
            ).to.equal(
                '<input type="checkbox">'
            );
        });
        it('Third render (update)', () => {
            Inferno.render(template('lala'), container);
            expect(container.firstChild.checked).to.eql(true);
            expect(
                container.innerHTML
            ).to.equal(
                '<input type="checkbox">'
            );
        });
        it('Fourth render (update)', () => {
            Inferno.render(template(null), container);
            expect(container.firstChild.checked).to.be.false;
            expect(
                container.innerHTML
            ).to.equal(
                '<input type="checkbox">'
            );
        });

        it('Fifth render (update)', () => {
            Inferno.render(template('null'), container);
            expect(container.firstChild.checked).to.be.true;
            expect(
                container.innerHTML
            ).to.equal(
                '<input type="checkbox">'
            );
        });
    });

    describe('should support number values', () => {
        let template;
        const styleRule = {
            width: 7
        };

        beforeEach(() => {
            template = Inferno.createTemplate(() =>
                createElement('div', {
                    style: styleRule
                })
            );
            Inferno.render(template(), container);
        });

        it('Initial render (creation)', () => {
            expect(
                container.innerHTML
            ).to.equal(
                '<div style="width: 7px;"></div>'
            );
        });
    });

    describe('should properly render name attribute', () => {
        let template = Inferno.createTemplate((arg) =>
            createElement('div', {
                name: arg
            })
        );


        it('Initial render (creation)', () => {
            Inferno.render(template('simple'), container);
            expect(container.firstChild.getAttribute('name')).to.eql('simple');
            expect(
                container.innerHTML
            ).to.equal(
                '<div name="simple"></div>'
            );
        });
        it('Second render (update)', () => {
            Inferno.render(template(true), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div name="true"></div>'
            );
        });
    });

    describe('should properly render id attribute', () => {
        let template = Inferno.createTemplate((arg) =>
            createElement('div', {
                id: arg
            })
        );

        it('Initial render (creation)', () => {
            Inferno.render(template('simple'), container);
            expect(container.firstChild.getAttribute('id')).to.eql('simple');
            expect(
                container.innerHTML
            ).to.equal(
                '<div id="simple"></div>'
            );
            Inferno.render(template('simple'), container);
            expect(container.firstChild.getAttribute('id')).to.eql('simple');
            expect(
                container.innerHTML
            ).to.equal(
                '<div id="simple"></div>'
            );
        });
        it('Second render (update)', () => {
            Inferno.render(template(true), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div id="true"></div>'
            );
        });
    });


        it('should render multiple text in an array #1', () => {
            const template = Inferno.createTemplate((val1) => ({
                tag: 'div',
                attrs: {
                    id: val1
                },
                text: ['I', ' am', ' a', ' teddybear', ', ', ' but', ' do', ' not', ' play', ' with', ' me', '!']
            }));
            Inferno.render(template('test'), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div id="test">I am a teddybear, but do not play with me!</div>'
            );
        });

        it('should render multiple text in an array #2', () => {
            const template = Inferno.createTemplate((val1) => ({
                tag: 'div',
                attrs: {
                    id: val1
                }, children: {
                tag: 'span',
				text: ['I', ' am', ' a', ' teddybear', ', ', ' but', ' do', ' not', ' play', ' with', ' me', '!']
				}
            }));
            Inferno.render(template('test'), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div id="test"><span>I am a teddybear, but do not play with me!</span></div>'
            );
        });

        it('should render multiple text as number in an array', () => {
            const template = Inferno.createTemplate((val1) => ({
                tag: 'div',
                attrs: {
                    id: val1
                },
                text: [1,2,3,4,5,6,7,8]
            }));
            Inferno.render(template('test'), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div id="test">12345678</div>'
            );
        });


});