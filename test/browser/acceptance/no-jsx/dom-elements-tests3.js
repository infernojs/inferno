import Inferno from '../../../../src';
import get from '../../../tools/get';

const {
    createElement
} = Inferno.TemplateFactory;

describe('DOM element tests3 (no-jsx)', () => {
    let container;

    beforeEach(() => {
        container = document.createElement('div');
    });

    afterEach(() => {
        Inferno.render(null, container);
    });


    describe('should render text then update to an array of text nodes', () => {
        const template = Inferno.createTemplate((child) => ({
            tag: 'div',
            children: child
        }));

        it('first render (creation)', () => {
            const span = Inferno.createTemplate(function() {
                return {
                    tag: 'span',
                    children: 'Hello'
                };
            });
            Inferno.render(template(span()), container);
            expect(container.firstChild.innerHTML).to.equal('<span>Hello</span>');
            Inferno.render(template(span()), container);
            expect(container.firstChild.innerHTML).to.equal('<span>Hello</span>');
            Inferno.render(template(null), container);
            expect(container.firstChild.innerHTML).to.equal('');

            const spanWithChildren = Inferno.createTemplate(function() {
                return {
                    tag: 'span',
                    children: {
						tag: 'example',
						attrs: {id: 'foo' },
						children: {
								tag:'span',
								text: 'Hello'
							}
						}
                };
            });
            Inferno.render(template(spanWithChildren()), container);
            expect(container.firstChild.innerHTML).to.equal('<span><example id="foo"><span>Hello</span></example></span>');
        });

        it('second render - (update)', () => {
            const span = Inferno.createTemplate(function() {
                return {
                    tag: 'span',
                    children: ['Hello ', 'World', '!']
                };
            });
            Inferno.render(template(span()), container);
            expect(container.firstChild.innerHTML).to.equal('<span>Hello World!</span>');

            const span1 = Inferno.createTemplate(function() {
                return {
                    tag: 'span',
                    children: ['Hello', null, '!']
                };
            });
            Inferno.render(template(span1()), container);
            expect(container.firstChild.innerHTML).to.equal('<span>Hello!</span>');
            
			// Whitespace issue!
            const span2 = Inferno.createTemplate(function() {
                return {
                    tag: 'span',
                    children: ['Hello', null, '  !  ']
                };
            });
            Inferno.render(template(span1()), container);
            expect(container.firstChild.innerHTML).to.equal('<span>Hello!</span>');

        });
    });

    describe('should render an array of text nodes then update to a single text node', () => {
        const template = Inferno.createTemplate((child) => ({
            tag: 'div',
            children: child
        }));

        it('first render (creation)', () => {
            const span = Inferno.createTemplate(function() {
                return {
                    tag: 'span',
                    children: ['Hello ', 'World', '!']
                };
            });
            Inferno.render(template(span()), container);
            expect(container.firstChild.innerHTML).to.equal('<span>Hello World!</span>');
            Inferno.render(template(span()), container);
            expect(container.firstChild.innerHTML).to.equal('<span>Hello World!</span>');
        });
        it('second render - (update)', () => {
            const span = Inferno.createTemplate(function() {
                return {
                    tag: 'span',
                    children: 'Hello'
                };
            });
            Inferno.render(template(span()), container);
            expect(container.firstChild.innerHTML).to.equal('<span>Hello</span>');
        });
    });

    describe('should update and array of text nodes to another array of text nodes', () => {
        const template = Inferno.createTemplate((child) => ({
            tag: 'div',
            children: child
        }));

        it('first render (creation)', () => {
            const span = Inferno.createTemplate(function() {
                return {
                    tag: 'span',
                    children: ['Hello ', 'World']
                };
            });
            Inferno.render(template(span()), container);
            expect(container.firstChild.innerHTML).to.equal('<span>Hello World</span>');

            Inferno.render(template(), container);
            expect(container.firstChild.innerHTML).to.equal('');
        });

        it('second render - (update)', () => {
            const span = Inferno.createTemplate(function() {
                return {
                    tag: 'span',
                    children: ['Hello ', 'World', '!']
                };
            });
            Inferno.render(template(span()), container);
            expect(container.firstChild.innerHTML).to.equal('<span>Hello World!</span>');

            Inferno.render(template(), container);
            expect(container.firstChild.innerHTML).to.equal('');

        });
    });

    describe('should update and array of text nodes to another array of text nodes #2', () => {
        const template = Inferno.createTemplate((child) => ({
            tag: 'div',
            children: child
        }));

        it('first render (creation)', () => {
            const span = Inferno.createTemplate(function() {
                return {
                    tag: 'span',
                    children: ['Hello ', 'World', '!']
                };
            });
            Inferno.render(template(span()), container);
            expect(container.firstChild.innerHTML).to.equal('<span>Hello World!</span>');

            const span1 = Inferno.createTemplate(function() {
                return {
                    tag: 'span',
                    children: [null, null, null, null]
                };
            });
            Inferno.render(template(span1()), container);
            expect(container.firstChild.innerHTML).to.equal('<span></span>');
			
			 const spanish = Inferno.createTemplate(function() {
                return {
                    tag: 'b',
                    children: ['Hello ', null]
                };
            });
            Inferno.render(template(spanish()), container);
            expect(container.firstChild.innerHTML).to.equal('<b>Hello </b>');


        });

        it('second render - (update)', () => {
            const span = Inferno.createTemplate(function() {
                return {
                    tag: 'span',
                    children: ['Hello ', 'World']
                };
            });
            Inferno.render(template(span()), container);
            expect(container.firstChild.innerHTML).to.equal('<span>Hello World</span>');
            
			let spanish;
            
			 spanish = Inferno.createTemplate(function() {
                return {
                    tag: 'b',
                    children: ['Hello ', null]
                };
            });
            Inferno.render(template(spanish()), container);
            expect(container.firstChild.innerHTML).to.equal('<b>Hello </b>');

             spanish = Inferno.createTemplate(function() {
                return {
                    tag: 'b',
                    children: ['Hello ', null]
                };
            });
            Inferno.render(template(spanish()), container);
            expect(container.firstChild.innerHTML).to.equal('<b>Hello </b>');

            spanish = Inferno.createTemplate(function() {
                return {
                    tag: 'b',
                    children: [null, null]
                };
            });
            Inferno.render(template(spanish()), container);
            expect(container.firstChild.innerHTML).to.equal('<b></b>');

            spanish = Inferno.createTemplate(function() {
                return {
                    tag: 'b',
                    children: [undefined, undefined]
                };
            });
            Inferno.render(template(spanish()), container);
            expect(container.firstChild.innerHTML).to.equal('<b></b>');

            spanish = Inferno.createTemplate(function() {
                return {
                    tag: 'b',
                    children: [undefined, null]
                };
            });
            Inferno.render(template(spanish()), container);
            expect(container.firstChild.innerHTML).to.equal('<b></b>');
			
             spanish = Inferno.createTemplate(function() {
                return {
                    tag: 'b',
                    children: null
                };
            });
            Inferno.render(template(spanish()), container);
            expect(container.firstChild.innerHTML).to.equal('<b></b>');

        });
    });

    describe('should set className on root node, and update an node with dynamic attributes on static child', () => {
        const template = Inferno.createTemplate((child) => ({
            tag: 'div',
            children: {
                tag: 'div',
                attrs: {
                    class: 'hello!'
                },
                children: {
                    tag: 'span',
                    attrs: {
                        id: child
                    }
                }
            }
        }));

        it('first render (creation)', () => {
            Inferno.render(template('id#1'), container);
            expect(container.firstChild.innerHTML).to.equal('<div class="hello!"><span id="id#1"></span></div>');
            Inferno.render(template('id#3'), container);
            expect(container.firstChild.innerHTML).to.equal('<div class="hello!"><span id="id#3"></span></div>');
            Inferno.render(template(), container);
            expect(container.firstChild.innerHTML).to.equal('<div class="hello!"><span></span></div>');

        });
        it('second render - (update)', () => {
            Inferno.render(template('id#2'), container);
            expect(container.firstChild.innerHTML).to.equal('<div class="hello!"><span id="id#2"></span></div>');
            Inferno.render(template('id#4'), container);
            expect(container.firstChild.innerHTML).to.equal('<div class="hello!"><span id="id#4"></span></div>');
            Inferno.render(template(), container);
            expect(container.firstChild.innerHTML).to.equal('<div class="hello!"><span></span></div>');
            Inferno.render(template(null), container);
            expect(container.firstChild.innerHTML).to.equal('<div class="hello!"><span></span></div>');

        });
    });

    describe('should update if different static namespaces', () => {
        const template = Inferno.createTemplate((val) => ({
            tag: 'div',
            attrs: {
                xmlns: 'testing',
                id: val
            }
        }));

        it('first render (creation)', () => {
            Inferno.render(template("testing"), container);
            expect(container.innerHTML).to.equal('<div xmlns="testing" id="testing"></div>');
            expect(container.firstChild.namespaceURI).to.eql("testing");
            Inferno.render(template("testing123"), container);
            expect(container.innerHTML).to.equal('<div xmlns="testing" id="testing123"></div>');
            expect(container.firstChild.namespaceURI).to.eql("testing");
        });
        it('second render - (update)', () => {
            Inferno.render(template("undefined"), container);
            expect(container.innerHTML).to.equal('<div xmlns="testing" id="undefined"></div>');
            expect(container.firstChild.namespaceURI).to.eql("testing");
            Inferno.render(template("undefined"), container);
            expect(container.innerHTML).to.equal('<div xmlns="testing" id="undefined"></div>');
            expect(container.firstChild.namespaceURI).to.eql("testing");
        });
    });


    describe('should properly render input download attribute', () => {
        let template = Inferno.createTemplate((val1) =>
            createElement('div', {
                download: val1
            })
        );

        it('Initial render (creation)', () => {
            Inferno.render(template(false), container);
            expect(container.firstChild.getAttribute('download')).to.be.null;
            expect(
                container.innerHTML
            ).to.equal(
                '<div></div>'
            );
            Inferno.render(template(false), container);
            expect(container.firstChild.getAttribute('download')).to.be.null;
            expect(
                container.innerHTML
            ).to.equal(
                '<div></div>'
            );
        });
        it('Second render (update)', () => {
            Inferno.render(template(true), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div download="download"></div>'
            );
        });
    });

    describe('should properly render scope attribute', () => {
        let template = Inferno.createTemplate((val1) =>
            createElement('div', {
                scope: val1
            })
        );

        it('Initial render (creation)', () => {
            Inferno.render(template('scope'), container);
            expect(container.firstChild.getAttribute('scope')).to.eql('scope');
            expect(
                container.innerHTML
            ).to.equal(
                '<div scope="scope"></div>'
            );

            Inferno.render(template(), container);
            expect(container.firstChild.getAttribute('scope')).to.be.null;
            expect(
                container.innerHTML
            ).to.equal(
                '<div></div>'
            );

        });
        it('Second render (update)', () => {
            Inferno.render(template(true), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div scope="true"></div>'
            );

            Inferno.render(template(false), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div scope="false"></div>' 
            );

            Inferno.render(template(true), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div scope="true"></div>'
            );

            Inferno.render(template('true'), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div scope="true"></div>'
            );

            Inferno.render(template('false'), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div scope="false"></div>'
            );

            Inferno.render(template(null), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div></div>'
            );
        });
    });

    describe('should properly render HTMLL5 data-* attribute', () => {
        let template = Inferno.createTemplate((val1) =>
            createElement('div', {
                data: val1
            })
        );

        it('Initial render (creation)', () => {
            Inferno.render(template('val'), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div data="val"></div>'
            );
        });
        it('Second render (update)', () => {
            Inferno.render(template(true), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div data="true"></div>'
            );

            Inferno.render(template(null), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div></div>'
            );

            Inferno.render(template(true), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div data="true"></div>'
            );

        });
    });

    describe('should properly render value property', () => {
        let template = Inferno.createTemplate((val1) =>
            createElement('div', {
                value: val1
            })
        );

        it('Initial render (creation)', () => {
            Inferno.render(template('val'), container);
            expect(container.firstChild.value).to.eql('val');
            expect(
                container.innerHTML
            ).to.equal(
                '<div></div>'
            );
        });
        it('Second render (update)', () => {
            Inferno.render(template(true), container);
            expect(container.firstChild.value).to.eql(true);
            expect(
                container.innerHTML
            ).to.equal(
                '<div></div>'
            );
        });
    });


    describe('should properly render dynamic child with null and number', () => {

        const template = (child) => ({
            tag: 'div',
            children: child
        });;

        it('Initial render (creation)', () => {
            Inferno.render(template(['1', '2', null]), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div>12</div>'
            );
        });
    });

    
});