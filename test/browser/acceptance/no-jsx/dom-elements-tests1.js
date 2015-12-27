import Inferno from '../../../../src';
import get from '../../../tools/get';

const {
    createElement
} = Inferno.TemplateFactory;

describe('DOM element tests1 (no-jsx)', () => {
    let container;

    beforeEach(() => {
        container = document.createElement('div');
    });

    afterEach(() => {
        Inferno.render(null, container);
    });

    describe('should render a basic text node', () => {
        let template;

        beforeEach(() => {
            template = Inferno.createTemplate(() => ({
                text: 'Hello world'
            }));
        });

        it('Initial render (creation)', () => {
            Inferno.render(template(), container);

            expect(
                container.innerHTML
            ).to.equal(
                'Hello world'
            );
            Inferno.render(template(), container);

            expect(
                container.innerHTML
            ).to.equal(
                'Hello world'
            );

        });
        it('Second render (update)', () => {
            Inferno.render(template(), container);
            expect(
                container.innerHTML
            ).to.equal(
                'Hello world'
            );
            Inferno.render(template(), container);
            expect(
                container.innerHTML
            ).to.equal(
                'Hello world'
            );
        });
        it('Third render (update)', () => {
            template = Inferno.createTemplate(() => 'Hello world 2');
            Inferno.render(template(), container);
            expect(
                container.innerHTML
            ).to.equal(
                'Hello world 2'
            );
        });
    });

    describe('should render a basic example', () => {
        let template;

        beforeEach(() => {
            template = Inferno.createTemplate(() => ({
                tag: 'div',
                text: 'Hello world'
            }));
        });

        it('Initial render (creation)', () => {
            Inferno.render(template(), container);

            expect(
                container.innerHTML
            ).to.equal(
                '<div>Hello world</div>'
            );
            Inferno.render(template(), container);

            expect(
                container.innerHTML
            ).to.equal(
                '<div>Hello world</div>'
            );

			 const template1 = Inferno.createTemplate(() => ({
                tag: 'div',
                text: 'Static Text!'
            }));

            Inferno.render(template1(), container);
            Inferno.render(template1(), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div>Static Text!</div>'
            );

			 Inferno.render(template(), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div>Hello world</div>'
            );
        });
        it('Second render (update)', () => {
            Inferno.render(template(), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div>Hello world</div>'
            );
        });
        it('Third render (update)', () => {

            // This doesn't use dynamic update function

            template = Inferno.createTemplate((text) => ({
                tag: 'div',
                text
            }));

            Inferno.render(template('Dynamic Text!'), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div>Dynamic Text!</div>'
            );

           const template1 = Inferno.createTemplate(() => ({
                tag: 'div',
                text: 'Static Text!'
            }));

            Inferno.render(template1(), container);
            Inferno.render(template1(), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div>Static Text!</div>'
            );

			// This inject undefined where it should be nothing
            Inferno.render(template(null), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div></div>'
            );

			// This inject undefined where it should be nothing
            Inferno.render(template(undefined), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div></div>'
            );

			// This inject undefined where it should be nothing
            Inferno.render(template(), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div></div>'
            );

            Inferno.render(template('Dynamic Text 2!'), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div>Dynamic Text 2!</div>'
            );
        });
    });

    describe('should render a basic example #2', () => {
        let template;

        beforeEach(() => {
            template = Inferno.createTemplate(() => ({
                tag: 'ul',
                children: [{
                    tag: 'li',
                    text: 'Im a li-tag'
                }, {
                    tag: 'li',
                    text: 'Im a li-tag'
                }, {
                    tag: 'li',
                    text: 'Im a li-tag'
                }]
            }));

        });
        it('Initial render (creation)', () => {
            Inferno.render(template(), container);
            expect(
                container.innerHTML
            ).to.equal(
                `<ul><li>Im a li-tag</li><li>Im a li-tag</li><li>Im a li-tag</li></ul>`
            );
            Inferno.render(template(), container);
            expect(
                container.innerHTML
            ).to.equal(
                `<ul><li>Im a li-tag</li><li>Im a li-tag</li><li>Im a li-tag</li></ul>`
            );
        });
        it('Second render (update)', () => {
            template = Inferno.createTemplate((text) => ({
                tag: 'ul',
                children: [{
                    tag: 'li',
                    text: text
                }, {
                    tag: 'li',
                    text: text
                }, {
                    tag: 'li',
                    text: text
                }]
            }));
            Inferno.render(template('Im a dynamic li-tag'), container);
            expect(
                container.innerHTML
            ).to.equal(
                `<ul><li>Im a dynamic li-tag</li><li>Im a dynamic li-tag</li><li>Im a dynamic li-tag</li></ul>`
            );

            Inferno.render(template('Im a dynamic li-tag #2'), container);
            expect(
                container.innerHTML
            ).to.equal(
                `<ul><li>Im a dynamic li-tag #2</li><li>Im a dynamic li-tag #2</li><li>Im a dynamic li-tag #2</li></ul>`
            );

            Inferno.render(template('Im a dynamic li-tag #3'), container);
            expect(
                container.innerHTML
            ).to.equal(
                `<ul><li>Im a dynamic li-tag #3</li><li>Im a dynamic li-tag #3</li><li>Im a dynamic li-tag #3</li></ul>`
            );
            Inferno.render(template('Im a dynamic li-tag #3'), container);
            expect(
                container.innerHTML
            ).to.equal(
                `<ul><li>Im a dynamic li-tag #3</li><li>Im a dynamic li-tag #3</li><li>Im a dynamic li-tag #3</li></ul>`
            );
        });
        it('Third render (update)', () => {
            template = Inferno.createTemplate((text) => ({
                tag: 'ul',
                attrs: {
                    className: 'container'
                },
                children: [{
                    tag: 'li',
                    attrs: {
                        className: 'row'
                    },
                    text: text
                }, {
                    tag: 'li',
                    attrs: {
                        className: 'row'
                    },
                    text: text
                }, {
                    tag: 'li',
                    attrs: {
                        className: 'row'
                    },
                    text: text
                }]
            }));
            Inferno.render(template('Im a dynamic li-tag'), container);
            expect(
                container.innerHTML
            ).to.equal(
                `<ul class="container"><li class="row">Im a dynamic li-tag</li><li class="row">Im a dynamic li-tag</li><li class="row">Im a dynamic li-tag</li></ul>`
            );

            Inferno.render(template('Im a dynamic li-tag #2'), container);
            expect(
                container.innerHTML
            ).to.equal(
                `<ul class="container"><li class="row">Im a dynamic li-tag #2</li><li class="row">Im a dynamic li-tag #2</li><li class="row">Im a dynamic li-tag #2</li></ul>`
            );

            Inferno.render(template('Im a dynamic li-tag #3'), container);
            expect(
                container.innerHTML
            ).to.equal(
                `<ul class="container"><li class="row">Im a dynamic li-tag #3</li><li class="row">Im a dynamic li-tag #3</li><li class="row">Im a dynamic li-tag #3</li></ul>`
            );

            Inferno.render(template(), container);
            expect(
                container.innerHTML
            ).to.equal(
                `<ul class="container"><li class="row"></li><li class="row"></li><li class="row"></li></ul>`
            );

           Inferno.render(template(null), container);
            expect(
                container.innerHTML
            ).to.equal(
                `<ul class="container"><li class="row"></li><li class="row"></li><li class="row"></li></ul>`
            );

        });
    });

    describe('should render a basic example #3', () => {
        let template;

        beforeEach(() => {
            template = Inferno.createTemplate(() => ({
                tag: 'ul',
                children: [{
                    tag: 'li',
                    children: {
                        tag: 'span',
                        text: 'Im a li-tag'
                    }
                }, {
                    tag: 'li',
                    children: {
                        tag: 'span',
                        text: 'Im a li-tag'
                    }
                }, {
                    tag: 'li',
                    children: {
                        tag: 'span',
                        text: 'Im a li-tag'
                    }
                }]
            }));

        });

        it('Initial render (creation)', () => {
            Inferno.render(template(), container);
            expect(
                container.innerHTML
            ).to.equal(
                `<ul><li><span>Im a li-tag</span></li><li><span>Im a li-tag</span></li><li><span>Im a li-tag</span></li></ul>`
            );
            Inferno.render(template(), container);
            expect(
                container.innerHTML
            ).to.equal(
                `<ul><li><span>Im a li-tag</span></li><li><span>Im a li-tag</span></li><li><span>Im a li-tag</span></li></ul>`
            );
        });

    });

    describe('should render a basic example #4', () => {
        let template;

        beforeEach(() => {
            template = Inferno.createTemplate(() => ({
                tag: 'div',
                children: [
                    'Hey ',
                    'there ',
                    'world!'
                ]
            }));

            Inferno.render(template(), container);
        });
        it('Initial render (creation)', () => {
            expect(
                container.innerHTML
            ).to.equal(
                `<div>Hey there world!</div>`
            );
        });
    });

    describe('should render a basic example #5', () => {
        let template;

        beforeEach(() => {
            template = Inferno.createTemplate(() => ({
                tag: 'div',
                children: {
                    tag: 'div'
                }
            }));

        });
        it('Initial render (creation)', () => {
            Inferno.render(template(), container);

            expect(
                container.innerHTML
            ).to.equal(
                `<div><div></div></div>`
            );
            Inferno.render(template(), container);

            expect(
                container.innerHTML
            ).to.equal(
                `<div><div></div></div>`
            );

		   const div = Inferno.createTemplate((child) => ({
                tag: 'div',
                children: child
            }));

            const span = Inferno.createTemplate(() => ({
                tag: 'span',
                children: "Hello world!"
            }));

            Inferno.render(div(span()), container);
            expect(
                container.innerHTML
            ).to.equal(
                `<div><span>Hello world!</span></div>`
            );
        });
    });

    describe('should render a basic example #6', () => {
        it('Initial render (creation)', () => {
            const div = Inferno.createTemplate((child) => ({
                tag: 'div',
                children: child
            }));

            const span = Inferno.createTemplate(() => ({
                tag: 'span',
                children: "Hello world!"
            }));

            Inferno.render(div(span()), container);
            expect(
                container.innerHTML
            ).to.equal(
                `<div><span>Hello world!</span></div>`
            );

            Inferno.render(div(null), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div></div>'
            );

            Inferno.render(div(undefined), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div></div>'
            );

            Inferno.render(div(), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div></div>'
            );

        });
    });

    describe('should render a basic example #7', () => {
        it('Render and update', () => {
            const div = Inferno.createTemplate((child) => ({
                tag: 'div',
                children: child
            }));

            const span1 = Inferno.createTemplate(() => 'Hello world!');

            Inferno.render(div(span1()), container);
            expect(
                container.innerHTML
            ).to.equal(
                `<div>Hello world!</div>`
            );

            const span2 = Inferno.createTemplate((child) => ({
                tag: 'span',
                children: 'Im updated!'
            }));

            Inferno.render(div(span2()), container);

            expect(
                container.innerHTML
            ).to.equal(
                `<div><span>Im updated!</span></div>`
            );

            Inferno.render(div(), container);

            expect(
                container.innerHTML
            ).to.equal(
                '<div></div>'
            );

            Inferno.render(div(null), container);

            expect(
                container.innerHTML
            ).to.equal(
                '<div></div>'
            );

            Inferno.render(div(undefined), container);

            expect(
                container.innerHTML
            ).to.equal(
                '<div></div>'
            );

            Inferno.render(div(), container);

            expect(
                container.innerHTML
            ).to.equal(
                '<div></div>'
            );

            Inferno.render(null, container);

            expect(
                container.innerHTML
            ).to.equal(
                ''
            );

        });
    });

    describe('should render a basic example #8', () => {
        it('Render and update', () => {
            const div = Inferno.createTemplate((text) => ({
                tag: 'div',
                children: [
                    'There is ', text, ' spoon!'
                ]
            }));

            Inferno.render(div('no'), container);
            expect(
                container.innerHTML
            ).to.equal(
                `<div>There is no spoon!</div>`
            );

            Inferno.render(div('one'), container);
            expect(
                container.innerHTML
            ).to.equal(
                `<div>There is one spoon!</div>`
            );

            Inferno.render(div(), container);
            expect(
                container.innerHTML
            ).to.equal(
                `<div>There is  spoon!</div>`
            );

            Inferno.render(div(null), container);
            expect(
                container.innerHTML
            ).to.equal(
                `<div>There is  spoon!</div>`
            );

            Inferno.render(div(undefined), container);
            expect(
                container.innerHTML
            ).to.equal(
                `<div>There is  spoon!</div>`
            );

            const template = Inferno.createTemplate(() => ({
                tag: 'input',
                attrs: {
                    disabled: true
                }
            }));

            Inferno.render(template(), container);

            expect(container.firstChild.disabled).to.eql(true);
            expect(
                container.innerHTML
            ).to.equal(
                '<input disabled="disabled">'
            );
        });
    });

    describe('should render "disabled" boolean attributes', () => {
        let template;

        it('Initial render (creation)', () => {
            template = Inferno.createTemplate(() => ({
                tag: 'input',
                attrs: {
                    disabled: true
                }
            }));

            Inferno.render(template(), container);

            expect(container.firstChild.disabled).to.eql(true);
            expect(
                container.innerHTML
            ).to.equal(
                '<input disabled="disabled">'
            );
            Inferno.render(template(), container);

            expect(container.firstChild.disabled).to.eql(true);
            expect(
                container.innerHTML
            ).to.equal(
                '<input disabled="disabled">'
            );
        });

        it('Second render (update)', () => {
            template = Inferno.createTemplate(() => ({
                tag: 'input',
                attrs: {
                    disabled: false
                }
            }));

            Inferno.render(template(), container);

            expect(
                container.innerHTML
            ).to.equal(
                '<input>'
            );

			  template = Inferno.createTemplate(() => ({
                tag: 'div',
                attrs: {
                    hidden: true
                }
            }));
            Inferno.render(template(), container);

            expect(container.firstChild.hidden).to.eql(true);
            expect(
                container.innerHTML
            ).to.equal(
                '<div hidden="hidden"></div>'
            );
        });
    });

    describe('should render "hidden" boolean attributes', () => {
        let template;

        it('Initial render (creation)', () => {
            template = Inferno.createTemplate(() => ({
                tag: 'div',
                attrs: {
                    hidden: true
                }
            }));
            Inferno.render(template(), container);

            expect(container.firstChild.hidden).to.eql(true);
            expect(
                container.innerHTML
            ).to.equal(
                '<div hidden="hidden"></div>'
            );
            Inferno.render(template(), container);

            expect(container.firstChild.hidden).to.eql(true);
            expect(
                container.innerHTML
            ).to.equal(
                '<div hidden="hidden"></div>'
            );
        });

        it('Second render (update)', () => {
            template = Inferno.createTemplate(() => ({
                tag: 'div',
                attrs: {
                    hidden: false
                }
            }));
            Inferno.render(template(), container);

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

    describe('should render "required" boolean attributes', () => {
        let template;

        it('Initial render (creation)', () => {
            template = Inferno.createTemplate(() => ({
                tag: 'div',
                attrs: {
                    required: 'required'
                }
            }));
            Inferno.render(template(), container);

            expect(container.firstChild.getAttribute('required')).to.eql('required');
            expect(
                container.innerHTML
            ).to.equal(
                '<div required="required"></div>'
            );

			template = Inferno.createTemplate(() => ({
                tag: 'div',
                attrs: {
                    hidden: 'NaN'
                }
            }));
            Inferno.render(template(), container);

            expect(
                container.innerHTML
            ).to.equal(
                '<div hidden="NaN"></div>'
            );
        });

        it('Second render (update)', () => {
            template = Inferno.createTemplate(() => ({
                tag: 'div',
                attrs: {
                    hidden: 'NaN'
                }
            }));
            Inferno.render(template(), container);

            expect(
                container.innerHTML
            ).to.equal(
                '<div hidden="NaN"></div>'
            );

            Inferno.render(template(), container);

            expect(
                container.innerHTML
            ).to.equal(
                '<div hidden="NaN"></div>'
            );
        });
    });

    describe('should render "itemScope" boolean attributes', () => {
        let template;

        it('Initial render (creation)', () => {
            template = Inferno.createTemplate(() => ({
                tag: 'div',
                attrs: {
                    itemScope: 'itemScope'
                }
            }));
            Inferno.render(template(), container);

            expect(container.firstChild.getAttribute('itemScope')).to.eql('itemScope');
            expect(
                container.innerHTML
            ).to.equal(
                '<div itemscope="itemScope"></div>'
            );
        });

        it('Second render (update)', () => {
            template = Inferno.createTemplate(() => ({
                tag: 'div',
                attrs: {
                    allowFullScreen: false
                }
            }));
            Inferno.render(template(), container);

            expect(
                container.innerHTML
            ).to.equal(
                '<div></div>'
            );
        });
    });

    describe('should render "autoPlay" boolean attributes', () => {
        let template;

        it('Initial render (creation)', () => {
            template = Inferno.createTemplate(() => ({
                tag: 'div',
                attrs: {
                    autoPlay: []
                }
            }));
            Inferno.render(template(), container);

            expect(container.firstChild.getAttribute('autoPlay')).to.eql(null);
            expect(
                container.innerHTML
            ).to.equal(
                '<div></div>'
            );

			 template = Inferno.createTemplate(() => ({
                tag: 'div',
                attrs: {
                    controls: false
                }
            }));
            Inferno.render(template(), container);

            expect(
                container.innerHTML
            ).to.equal(
                '<div></div>'
            );
        });

        it('Second render (update)', () => {
            template = Inferno.createTemplate(() => ({
                tag: 'div',
                attrs: {
                    controls: false
                }
            }));
            Inferno.render(template(), container);

            expect(
                container.innerHTML
            ).to.equal(
                '<div></div>'
            );
        });
    });

    describe('should render "checked" boolean property', () => {
        let template;

        it('Initial render (creation)', () => {
            template = Inferno.createTemplate(() => ({
                tag: 'input',
                attrs: {
                    checked: true,
                    type: 'checkbox'
                }
            }));
            Inferno.render(template(), container);

            expect(container.firstChild.checked).to.eql(true);
            expect(
                container.innerHTML
            ).to.equal(
                '<input checked="checked" type="checkbox">'
            );

            Inferno.render(template(), container);

            expect(container.firstChild.checked).to.eql(true);
            expect(
                container.innerHTML
            ).to.equal(
                '<input checked="checked" type="checkbox">'
            );
        });
    });

    describe('should render "select" boolean on select options', () => {

            const template = Inferno.createTemplate(function() {
                return {
                    tag: 'select',
                    attrs: {
                        multiple: true,
                        value: 'foo'
                    },
                    children: [{
                        tag: 'option',
                        attrs: {
                            value: 'foo'
                        },
                        children: 'foo'
                    }, {
                        tag: 'option',
                        attrs: {
                            value: 'bar'
                        },
                        children: 'bar'
                    }]

                };
            });

        it('Initial render (creation)', () => {
            Inferno.render(template(), container);
            expect(container.firstChild.children[0].selected).to.eql(true);
            expect(container.firstChild.children[1].selected).to.eql(false);
            expect(
                container.innerHTML
            ).to.equal(
              '<select multiple="multiple"><option value="foo" selected="selected">foo</option><option value="bar">bar</option></select>'
            );
            Inferno.render(template(), container);
            expect(container.firstChild.children[0].selected).to.eql(true);
            expect(container.firstChild.children[1].selected).to.eql(false);
            expect(
                container.innerHTML
            ).to.equal(
              '<select multiple="multiple"><option value="foo" selected="selected">foo</option><option value="bar">bar</option></select>'
            );
            Inferno.render(template(), container);
            expect(container.firstChild.children[0].selected).to.eql(true);
            expect(container.firstChild.children[1].selected).to.eql(false);
            expect(
                container.innerHTML
            ).to.equal(
              '<select multiple="multiple"><option value="foo" selected="selected">foo</option><option value="bar">bar</option></select>'
            );

        });

		 it('Initial render (creation)', () => {
            Inferno.render(template(), container);
            expect(container.firstChild.children[0].selected).to.eql(true);
            expect(container.firstChild.children[1].selected).to.eql(false);
            expect(
                container.innerHTML
            ).to.equal(
              '<select multiple="multiple"><option value="foo" selected="selected">foo</option><option value="bar">bar</option></select>'
            );
        });
    });

    describe('should render boolean attributes', () => {
        let template;

        beforeEach(() => {
            template = Inferno.createTemplate(() => ({
                tag: 'input',
                attrs: {
                    autoFocus: true
                }
            }));
            Inferno.render(template(), container);
        });

        it('Initial render (creation)', () => {

            expect(container.firstChild.getAttribute('autoFocus')).to.eql('autofocus');
            expect(
                container.innerHTML
            ).to.equal(
                '<input autofocus="autofocus">'
            );
        });
    });

    describe('should render "className" attribute', () => {
        let template;

        beforeEach(() => {
            template = Inferno.createTemplate(() => ({
                tag: 'div',
                attrs: {
                    className: 'this-works'
                }
            }));
        });

        it('Initial render (creation)', () => {
            Inferno.render(template(), container);

            expect(container.firstChild.getAttribute('class')).to.eql('this-works');
            expect(
                container.innerHTML
            ).to.equal(
                '<div class="this-works"></div>'
            );
            Inferno.render(template(), container);

            expect(container.firstChild.getAttribute('class')).to.eql('this-works');
            expect(
                container.innerHTML
            ).to.equal(
                '<div class="this-works"></div>'
            );

            Inferno.render(template(), container);

            expect(container.firstChild.getAttribute('class')).to.eql('this-works');
            expect(
                container.innerHTML
            ).to.equal(
                '<div class="this-works"></div>'
            );
        });
    });

    describe('shouldn\'t render null value', () => {
        let template;

        beforeEach(() => {
            template = Inferno.createTemplate(() => ({
                tag: 'input',
                attrs: {
                    value: null
                }
            }));
            Inferno.render(template(), container);
        });

        it('Initial render (creation)', () => {
            expect(container.firstChild.value).to.equal('');
            expect(
                container.innerHTML
            ).to.equal(
                '<input>'
            );
        });
    });

    describe('shouldn\'t render dynamic null value', () => {
        let template;

        beforeEach(() => {
            template = Inferno.createTemplate((value) => ({
                tag: 'input',
                attrs: {
                    value
                }
            }));
        });

        it('Initial render (creation)', () => {

            Inferno.render(template(null), container);

            expect(container.firstChild.value).to.equal('');
            expect(
                container.innerHTML
            ).to.equal(
                '<input>'
            );

			            Inferno.render(template('foo'), container);
            expect(container.firstChild.value).to.equal('foo');
            expect(
                container.innerHTML
            ).to.equal(
                '<input>'
            );

        });

        it('Second render (update)', () => {
            Inferno.render(template('foo'), container);
            expect(container.firstChild.value).to.equal('foo');
            expect(
                container.innerHTML
            ).to.equal(
                '<input>'
            );
        });
    });

    describe('should set values as properties by default', () => {
        let template;

        beforeEach(() => {
            template = Inferno.createTemplate(() => ({
                tag: 'input',
                attrs: {
                    title: 'Tip!'
                }
            }));

        });

        it('Initial render (creation)', () => {
            Inferno.render(template(null), container);
            expect(container.firstChild.getAttribute('title')).to.eql('Tip!');
            expect(
                container.innerHTML
            ).to.equal(
                '<input title="Tip!">'
            );
            Inferno.render(template(null), container);
            expect(container.firstChild.getAttribute('title')).to.eql('Tip!');
            expect(
                container.innerHTML
            ).to.equal(
                '<input title="Tip!">'
            );

			  template = Inferno.createTemplate(() => ({
                tag: 'select',
                attrs: {
                    multiple: true,
                    value: 'foo'
                },
                children: [{
                    tag: 'option',
                    attrs: {
                        value: 'foo'
                    },
                    text: 'Im a li-tag'
                }, {
                    tag: 'option',
                    attrs: {
                        value: 'bar'
                    },
                    text: 'Im a li-tag'
                }]
            }));

            Inferno.render(template(), container);

            expect(get(container.firstChild)).to.eql(['foo']);
            expect(
                container.innerHTML
            ).to.equal(
                '<select multiple="multiple"><option value="foo" selected="selected">Im a li-tag</option><option value="bar">Im a li-tag</option></select>'
            );
            expect(container.querySelector("select").multiple).to.equal(true);
        });
    });

    describe('should render value multiple attribute', () => {
        let template;

        beforeEach(() => {
            template = Inferno.createTemplate(() => ({
                tag: 'select',
                attrs: {
                    multiple: true,
                    value: 'foo'
                },
                children: [{
                    tag: 'option',
                    attrs: {
                        value: 'foo'
                    },
                    text: 'Im a li-tag'
                }, {
                    tag: 'option',
                    attrs: {
                        value: 'bar'
                    },
                    text: 'Im a li-tag'
                }]
            }));
        });

        it('Initial render (creation)', () => {
            Inferno.render(template(), container);

            expect(get(container.firstChild)).to.eql(['foo']);
            expect(
                container.innerHTML
            ).to.equal(
                '<select multiple="multiple"><option value="foo" selected="selected">Im a li-tag</option><option value="bar">Im a li-tag</option></select>'
            );
            expect(container.querySelector("select").multiple).to.equal(true);


            Inferno.render(template(), container);

            expect(get(container.firstChild)).to.eql(['foo']);
            expect(
                container.innerHTML
            ).to.equal(
                '<select multiple="multiple"><option value="foo" selected="selected">Im a li-tag</option><option value="bar">Im a li-tag</option></select>'
            );
            expect(container.querySelector("select").multiple).to.equal(true);

        });
    });

    describe('should render value multiple attribute #2', () => {
        let template;

        beforeEach(() => {
            template = Inferno.createTemplate(() => ({
                tag: 'select',
                attrs: {
                    multiple: true,
                    value: ['bar', 'dominic']
                },
                children: [{
                    tag: 'optgroup',
                    attrs: {
                        label: 'foo-group'
                    },
                    children: {
                        tag: 'option',
                        attrs: {
                            value: 'foo'
                        },
                        text: 'Im a li-tag'
                    }
                }, {
                    tag: 'optgroup',
                    attrs: {
                        label: 'bar-group'
                    },
                    children: {
                        tag: 'option',
                        attrs: {
                            value: 'bar'
                        },
                        text: 'Im a li-tag'
                    }
                }, {
                    tag: 'optgroup',
                    attrs: {
                        label: 'dominic-group'
                    },
                    children: {
                        tag: 'option',
                        attrs: {
                            value: 'dominic'
                        },
                        text: 'Im a li-tag'
                    }
                }]
            }));
            Inferno.render(template(), container);
        });

        it('Initial render (creation)', () => {
            expect(
                container.innerHTML
            ).to.equal(
                '<select multiple="multiple"><optgroup label="foo-group"><option value="foo">Im a li-tag</option></optgroup>' + '<optgroup label="bar-group"><option value="bar" selected="selected">Im a li-tag</option></optgroup><optgroup label="dominic-group">' + '<option value="dominic" selected="selected">Im a li-tag</option></optgroup></select>'
            );
        });
    });

    describe('should render element with click event listener added', () => {
        it('Initial render (creation)', () => {
            let worked = false;
            const template = Inferno.createTemplate((handler) => ({
                tag: 'div',
                attrs: {
                    onClick: handler
                },
                children: 'Hello world!'
            }));
            Inferno.render(template(() => {
                worked = true;
            }), container);
            const event = new Event('click', {
                bubbles: true,
                cancelable: true
            });
            //or this won't work
            document.body.appendChild(container);
            container.firstChild.dispatchEvent(event);
            document.body.removeChild(container);
            expect(worked).to.equal(true);
            expect(container.innerHTML).to.equal('<div>Hello world!</div>');
        });
    });

    describe('should render a basic example with dynamic values', () => {
        let template;

        beforeEach(() => {
            template = Inferno.createTemplate((val1, val2) => ({
                tag: 'div',
                children: [
                    'Hello world - ',
                    val1,
                    ' ',
                    val2
                ]
            }));
            Inferno.render(template('Inferno', 'Owns'), container);
        });

        it('Initial render (creation)', () => {
            expect(
                container.innerHTML
            ).to.equal(
                '<div>Hello world - Inferno Owns</div>'
            );

            Inferno.render(template('Test', 'Works!'), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div>Hello world - Test Works!</div>'
            );

            Inferno.render(template('Test', null), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div>Hello world - Test </div>'
            );
        });
        it('Second render (update)', () => {
            Inferno.render(template('Test', 'Works!'), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div>Hello world - Test Works!</div>'
            );
        });
    });


    describe('should render a basic example with dynamic values (with createElement)', () => {
        let template;

        beforeEach(() => {
            template = Inferno.createTemplate((val1, val2) =>
                createElement('div', null, 'Hello world - ', val1, ' ', val2)
            );
            Inferno.render(template('Inferno', 'Owns'), container);
        });

        it('Initial render (creation)', () => {
            expect(
                container.innerHTML
            ).to.equal(
                '<div>Hello world - Inferno Owns</div>'
            );
        });
        it('Second render (update)', () => {
            Inferno.render(template('Test', 'Works!'), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div>Hello world - Test Works!</div>'
            );

            Inferno.render(template('Test', 'Works!'), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div>Hello world - Test Works!</div>'
            );
        });
    });

    describe('should render a basic example with dynamic values and props (with createElement)', () => {
        let template;

        beforeEach(() => {
            template = Inferno.createTemplate((val1, val2) =>
                createElement('div', {
                        className: 'foo'
                    },
                    createElement('span', {
                        className: 'bar'
                    }, val1),
                    createElement('span', {
                        className: 'yar'
                    }, val2)
                )
            );
        });

        it('Initial render (creation)', () => {
            Inferno.render(template('Inferno', 'Rocks'), container);

            expect(
                container.innerHTML
            ).to.equal(
                `<div class="foo"><span class="bar">Inferno</span><span class="yar">Rocks</span></div>`
            );

            Inferno.render(template('Inferno', null), container);

            expect(
                container.innerHTML
            ).to.equal(
                `<div class="foo"><span class="bar">Inferno</span><span class="yar"></span></div>`
            );

            Inferno.render(template(null, null), container);

            expect(
                container.innerHTML
            ).to.equal(
                `<div class="foo"><span class="bar"></span><span class="yar"></span></div>`
            );
        });
        it('Second render (update)', () => {
            Inferno.render(template('Rocks', 'Inferno'), container);
            expect(
                container.innerHTML
            ).to.equal(
                `<div class="foo"><span class="bar">Rocks</span><span class="yar">Inferno</span></div>`
            );

           Inferno.render(template(null, 'Rocks'), container);

            expect(
                container.innerHTML
            ).to.equal(
                `<div class="foo"><span class="bar"></span><span class="yar">Rocks</span></div>`
            );

        });
    });

    // Just to prove that we don't share the same issues as React - https://github.com/facebook/react/issues/4933
    describe('should properly render "className" property on a custom element (with createElement)', () => {
        let template;

        beforeEach(() => {
            template = Inferno.createTemplate(() =>
                createElement('custom-elem', {
                    className: "Hello, world!"
                })
            );
            Inferno.render(template(), container);
        });

        it('Initial render (creation)', () => {
            expect(
                container.innerHTML
            ).to.equal(
                '<custom-elem class="Hello, world!"></custom-elem>'
            );
        });
        it('Second render (update)', () => {
            template = Inferno.createTemplate(() =>
                createElement('custom-elem', {
                    className: "Hello, Inferno!"
                })
            );

            Inferno.render(template(), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<custom-elem class="Hello, Inferno!"></custom-elem>'
            );

            Inferno.render(template(), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<custom-elem class="Hello, Inferno!"></custom-elem>'
            );
        });
    });

    describe('should properly render boolean attributes (HTML5) (with createElement)', () => {
        let template;

        beforeEach(() => {
            template = Inferno.createTemplate(() =>
                createElement('input', {
                    checked: true,
                    disabled: true
                })
            );
            Inferno.render(template(), container);
        });

        it('Initial render (creation)', () => {
            expect(container.querySelector("input").checked).to.equal(true);
            expect(container.querySelector("input").disabled).to.equal(true);
        });
        it('Second render (update)', () => {
            template = Inferno.createTemplate(() =>
                createElement('input', {
                    checked: false,
                    disabled: false
                })
            );

            Inferno.render(template(), container);
            expect(container.querySelector("input").checked).to.equal(false);
            expect(container.querySelector("input").disabled).to.equal(false);


            template = Inferno.createTemplate(() =>
                createElement('input', {
                    checked: false,
                    disabled: true
                })
            );

            Inferno.render(template(), container);
            expect(container.querySelector("input").checked).to.equal(false);
            expect(container.querySelector("input").disabled).to.equal(true);

        });
    });

    describe('should properly render boolean attributes (truthy) (with createElement)', () => {
        let template;

        beforeEach(() => {
            template = Inferno.createTemplate(() =>
                createElement('input', {
                    checked: true,
                    disabled: true
                })
            );
        });

        it('Initial render (creation)', () => {
            Inferno.render(template(), container);

            expect(
                container.innerHTML
            ).to.equal(
                '<input checked="checked" disabled="disabled">'
            );
            Inferno.render(template(), container);

            expect(
                container.innerHTML
            ).to.equal(
                '<input checked="checked" disabled="disabled">'
            );
            Inferno.render(template(), container);

            expect(
                container.innerHTML
            ).to.equal(
                '<input checked="checked" disabled="disabled">'
            );

			template = Inferno.createTemplate(() =>
                createElement('input', {
                    checked: false,
                    disabled: true
                })
            );

            Inferno.render(template(), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<input disabled="disabled">'
            );

        });
        it('Second render (update)', () => {
            template = Inferno.createTemplate(() =>
                createElement('input', {
                    checked: false,
                    disabled: true
                })
            );

            Inferno.render(template(), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<input disabled="disabled">'
            );


            template = Inferno.createTemplate(() =>
                createElement('input', {
                    checked: true,
                    disabled: false
                })
            );

            Inferno.render(template(), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<input checked="checked">'
            );

            template = Inferno.createTemplate(() =>
                createElement('input', {
                    checked: 'true',
                    disabled: false
                })
            );

            Inferno.render(template(), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<input checked="checked">'
            );

        });
    });

    describe('should not render overloaded boolean attributes (falsy) (with createElement)', () => {
        let template;

        beforeEach(() => {
            template = Inferno.createTemplate(() =>
                createElement('div', {
                    checked: false,
                    disabled: false
                })
            );
            Inferno.render(template(), container);
        });

        it('Initial render (creation)', () => {
            expect(
                container.innerHTML
            ).to.equal(
                '<div></div>'
            );
        });
        it('Second render (update)', () => {
            template = Inferno.createTemplate(() =>
                createElement('span', {
                    checked: false,
                    disabled: 'false'
                })
            );

            Inferno.render(template(), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<span disabled="false"></span>'
            );
        });
    });

    describe('should properly render boolean attributes (falsy)', () => {
        let template;

        beforeEach(() => {
            template = Inferno.createTemplate(() =>
                createElement('input', {
                    checked: "false",
                    disabled: "false"
                })
            );
            Inferno.render(template(), container);
        });

        it('Initial render (creation)', () => {
            expect(
                container.innerHTML
            ).to.equal(
  '<input checked="false" disabled="false">'
            );
        });
        it('Second render (update)', () => {
            Inferno.render(template(), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<input checked="false" disabled="false">'
            );
        });
    });

    describe('should render video / audio attributes', () => {
        let template;
        beforeEach(() => {
            template = Inferno.createTemplate(() =>
                createElement('input', {
                    type: 'file',
                    multiple: 'true',
                    capture: 'true'
                })
            );
        });

        it('Initial render (creation)', () => {

            Inferno.render(template(), container);

            expect(
                container.innerHTML
            ).to.equal(
                '<input type="file" multiple="multiple" capture="true">'
            );

            Inferno.render(template(), container);

            expect(
                container.innerHTML
            ).to.equal(
                '<input type="file" multiple="multiple" capture="true">'
            );

        });
    });

    describe('shouldn\'t render undefined value', () => {
        let template;

        beforeEach(() => {
            template = Inferno.createTemplate(() =>
                createElement('input', {
                    checked: undefined
                })
            );
        });

        it('Initial render (creation)', () => {
            Inferno.render(template(), container);

            expect(
                container.innerHTML
            ).to.equal(
                '<input>'
            );
            Inferno.render(template(), container);

            expect(
                container.innerHTML
            ).to.equal(
                '<input>'
            );

        });
    });

    describe('should be rendered as custom attribute', () => {
        let template;

        beforeEach(() => {
            template = Inferno.createTemplate(() =>
                createElement('div', {
                    'custom-attr': 123
                })
            );
            Inferno.render(template(), container);
        });

        it('Initial render (creation)', () => {
            expect(
                container.innerHTML
            ).to.equal(
                '<div custom-attr="123"></div>'
            );
        });
    });

    describe('should not render null properties', () => {
        let template;

        beforeEach(() => {
            template = Inferno.createTemplate(() =>
                createElement('web-component', {
                    className: null,
                    id: null
                })
            );
        });

        it('Initial render (creation)', () => {
            Inferno.render(template(), container);

            expect(
                container.innerHTML
            ).to.equal(
                '<web-component></web-component>'
            );
            Inferno.render(template(), container);

            expect(
                container.innerHTML
            ).to.equal(
                '<web-component></web-component>'
            );
        });
    });

    describe('should properly render "id" property', () => {
        let template;

        beforeEach(() => {
            template = Inferno.createTemplate(() =>
                createElement('web-component', {
                    id: 123
                })
            );
            Inferno.render(template(), container);
        });

        it('Initial render (creation)', () => {
            expect(
                container.innerHTML
            ).to.equal(
                '<web-component id="123"></web-component>'
            );
        });
    });

    describe('should render overloaded boolean as a number value', () => {
        let template;

        beforeEach(() => {
            template = Inferno.createTemplate(() =>
                createElement('input', {
                    download: 0
                })
            );
        });

        it('Initial render (creation)', () => {
            Inferno.render(template(), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<input>'
            );
        });
    });

    describe('should render download with boolean false value', () => {
        let template;

        beforeEach(() => {
            template = Inferno.createTemplate(() =>
                createElement('input', {
                    href: "/images/xxx.jpg",
                    download: false
                })
            );
            Inferno.render(template(), container);
        });

        it('Initial render (creation)', () => {
            expect(
                container.innerHTML
            ).to.equal(
                '<input href="/images/xxx.jpg">'
            );
        });
    });

    describe('should render download with boolean null value', () => {
        let template;

        beforeEach(() => {
            template = Inferno.createTemplate(() =>
                createElement('input', {
                    href: "/images/xxx.jpg",
                    download: null
                })
            );
            Inferno.render(template(), container);
        });

        it('Initial render (creation)', () => {
            expect(
                container.innerHTML
            ).to.equal(
                '<input href="/images/xxx.jpg">'
            );
        });
        it('Second render (update)', () => {
            template = Inferno.createTemplate(() =>
                createElement('input', {
                    checked: true,
                    disabled: true
                })
            );

            Inferno.render(template(), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<input checked="checked" disabled="disabled">'
            );
        });
    });


    describe('should render "overloaded" boolean properties', () => {
        let template;

        beforeEach(() => {
            template = Inferno.createTemplate(() =>
                createElement('input', {
                    href: "/images/xxx.jpg",
                    download: "true"
                })
            );
        });

        it('Initial render (creation)', () => {
            Inferno.render(template(), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<input href="/images/xxx.jpg" download="true">'
            );

            Inferno.render(template(), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<input href="/images/xxx.jpg" download="true">'
            );

			template = Inferno.createTemplate(() =>
                createElement('input', {
                    checked: true,
                    disabled: true
                })
            );

            Inferno.render(template(), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<input checked="checked" disabled="disabled">'
            );

        });

        it('Third render (update)', () => {
            template = Inferno.createTemplate(() =>
                createElement('input', {
                    checked: true,
                    disabled: true
                })
            );

            Inferno.render(template(), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<input checked="checked" disabled="disabled">'
            );

            template = Inferno.createTemplate(() =>
                createElement('input', {
                    checked: 'true',
                    disabled: true
                })
            );

            Inferno.render(template(), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<input checked="checked" disabled="disabled">'
            );

            template = Inferno.createTemplate(() =>
                createElement('input', {
                    checked: true,
                    disabled: false
                })
            );

            Inferno.render(template(), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<input checked="checked">'
            );
        });
    });

    describe('should not render overloaded "allowFullScreen" boolean attributes', () => {
        let template;

        beforeEach(() => {
            template = Inferno.createTemplate(() =>
                createElement('input', {
                    allowFullScreen: false
                })
            );
            Inferno.render(template(), container);
        });

        it('Initial render (creation)', () => {
            expect(
                container.innerHTML
            ).to.equal(
                '<input>'
            );
        });
        it('Second render (update)', () => {
            template = Inferno.createTemplate(() =>
                createElement('input', {
                    checked: true,
                    disabled: true
                })
            );

            Inferno.render(template(), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<input checked="checked" disabled="disabled">'
            );

            template = Inferno.createTemplate(() =>
                createElement('input', {
                    checked: false,
                    disabled: false
                })
            );

            Inferno.render(template(), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<input>'
            );
        });
    });

    describe('should not render "scoped" boolean attributes as "null"', () => {
        let template;

        beforeEach(() => {
            template = Inferno.createTemplate(() =>
                createElement('input', {
                    scoped: null
                })
            );
            Inferno.render(template(), container);
        });

        it('Initial render (creation)', () => {
            expect(
                container.innerHTML
            ).to.equal(
                '<input>'
            );
        });
    });

    describe('should properly render "muted" boolean property', () => {
        let template = Inferno.createTemplate((arg) =>
            createElement('audio', {
                muted: arg
            })
        );

        it('Initial render (creation)', () => {
            Inferno.render(template(false), container);
            expect(container.firstChild.muted).to.be.false;
            expect(
                container.innerHTML
            ).to.equal(
                '<audio></audio>'
            );
        });

        it('Second render (creation)', () => {
            Inferno.render(template(false), container);
            expect(container.firstChild.muted).to.be.false;
            expect(
                container.innerHTML
            ).to.equal(
                '<audio></audio>'
            );

            Inferno.render(template(null), container);
            expect(container.firstChild.muted).to.be.false;
            expect(
                container.innerHTML
            ).to.equal(
                '<audio></audio>'
            );

        });

        it('Third render (update)', () => {
            Inferno.render(template(true), container);
            expect(container.firstChild.muted).to.be.true;
            expect(
                container.innerHTML
            ).to.equal(
                '<audio></audio>'
            );
            Inferno.render(template(false), container);
            expect(container.firstChild.muted).to.be.false;
            expect(
                container.innerHTML
            ).to.equal(
                '<audio></audio>'
            );
            Inferno.render(template(undefined), container);
            expect(container.firstChild.muted).to.be.false;
            expect(
                container.innerHTML
            ).to.equal(
                '<audio></audio>'
            );

        });
    });

    describe('should properly render "required" boolean property', () => {
        let template = Inferno.createTemplate((arg) =>
            createElement('div', {
                required: arg
            })
        );

        it('Initial render (creation)', () => {
            Inferno.render(template(false), container);
            expect(container.firstChild.getAttribute('required')).to.be.null;
            expect(
                container.innerHTML
            ).to.equal(
                '<div></div>'
            );
        });
        it('Second render (creation)', () => {
            Inferno.render(template(null), container);
            expect(container.firstChild.getAttribute('required')).to.be.null;
            expect(
                container.innerHTML
            ).to.equal(
                '<div></div>'
            );
        });
        it('Third render (update)', () => {
            Inferno.render(template(true), container);
            expect(container.firstChild.required).to.be.true;
            expect(
                container.innerHTML
            ).to.equal(
                '<div></div>'
            );
        });
    });

    describe('should properly render "hidden" boolean property', () => {
        let template = Inferno.createTemplate((arg) =>
            createElement('div', {
                hidden: arg
            })
        );

        it('Initial render (creation)', () => {
            Inferno.render(template(false), container);
            expect(container.firstChild.getAttribute('hidden')).to.be.null;
            expect(
                container.innerHTML
            ).to.equal(
                '<div></div>'
            );
            Inferno.render(template(true), container);
            expect(container.firstChild.hidden).to.be.true;
            expect(
                container.innerHTML
            ).to.equal(
                '<div hidden=""></div>'
            );

			// First we set to false, then true, and then false again.  The last one fails!!
            Inferno.render(template(false), container);
            expect(container.firstChild.getAttribute('hidden')).to.be.null;
            expect(
                container.innerHTML
            ).to.equal(
                '<div></div>'
            );

        });
        it('Second render (creation)', () => {
            Inferno.render(template(null), container);
            expect(container.firstChild.getAttribute('hidden')).to.be.null;
            expect(
                container.innerHTML
            ).to.equal(
                '<div></div>'
            );
        });
        it('Third render (update)', () => {
            Inferno.render(template(true), container);
            expect(container.firstChild.hidden).to.be.true;
            expect(
                container.innerHTML
            ).to.equal(
                '<div hidden=""></div>'
            );

            Inferno.render(template(false), container);
            expect(container.firstChild.hidden).to.be.false;
            expect(
                container.innerHTML
            ).to.equal(
                '<div></div>'
            );

            Inferno.render(template(true), container);
            expect(container.firstChild.hidden).to.be.true;
            expect(
                container.innerHTML
            ).to.equal(
                '<div hidden=""></div>'
            );

        });
    });

    describe('should properly render "draggable" boolean property', () => {
        let template = Inferno.createTemplate((arg) =>
            createElement('div', {
                draggable: arg
            })
        );

        it('Initial render (creation)', () => {
            Inferno.render(template(false), container);
            expect(container.firstChild.getAttribute('draggable')).to.be.null;
            expect(
                container.innerHTML
            ).to.equal(
                '<div></div>'
            );

            Inferno.render(template(true), container);
            expect(container.firstChild.getAttribute('draggable')).to.equal('draggable');
            expect(
                container.innerHTML
            ).to.equal(
                '<div draggable="draggable"></div>'
            );

            Inferno.render(template(false), container);
            expect(container.firstChild.getAttribute('draggable')).to.be.null;
            expect(
                container.innerHTML
            ).to.equal(
                '<div></div>'
            );
        });
        it('Second render (creation)', () => {
            Inferno.render(template(null), container);
            expect(container.firstChild.getAttribute('draggable')).to.be.null;
            expect(
                container.innerHTML
            ).to.equal(
                '<div></div>'
            );
        });
        it('Third render (update)', () => {
            Inferno.render(template(true), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div draggable="draggable"></div>'
            );

            Inferno.render(template(false), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div></div>'
            );
        });
    });

    describe('should properly render "formNoValidate" boolean property', () => {
        let template = Inferno.createTemplate((arg) =>
            createElement('div', {
                formNoValidate: arg
            })
        );

        it('Initial render (creation)', () => {
            Inferno.render(template(false), container);
	        expect(container.firstChild.getAttribute('formNoValidate')).to.be.null;
            expect(
                container.innerHTML
            ).to.equal(
                '<div></div>'
            );
            Inferno.render(template(true), container);
	        expect(container.firstChild.getAttribute('formNoValidate')).to.equal('formnovalidate');
            expect(
                container.innerHTML
            ).to.equal(
                '<div formnovalidate="formnovalidate"></div>'
            );
        });
        it('Second render (creation)', () => {
            Inferno.render(template(null), container);
	        expect(container.firstChild.getAttribute('formNoValidate')).to.be.null;
            expect(
                container.innerHTML
            ).to.equal(
                '<div></div>'
            );
        });
        it('Third render (update)', () => {
            Inferno.render(template(true), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div formnovalidate="formnovalidate"></div>'
            );
        });
    });

    describe('should properly render "seamless" boolean property', () => {
        let template = Inferno.createTemplate((arg) =>
            createElement('div', {
                seamless: arg
            })
        );

        it('Initial render (creation)', () => {
            Inferno.render(template(false), container);
            expect(container.getAttribute('seamless')).to.be.null;
            expect(
                container.innerHTML
            ).to.equal(
                '<div></div>'
            );
        });
        it('Second render (creation)', () => {
            Inferno.render(template(null), container);
            expect(container.getAttribute('seamless')).to.be.null;
            expect(
                container.innerHTML
            ).to.equal(
                '<div></div>'
            );
        });

        it('Third render (update)', () => {
            Inferno.render(template(true), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div seamless="seamless"></div>'
            );
        });
    });

    describe('should properly render numeric properties', () => {
        let template = Inferno.createTemplate((arg) =>
            createElement('div', {
                start: arg
            })
        );

        it('Initial render (creation)', () => {
            Inferno.render(template(123), container);
            expect(container.getAttribute('seamless')).to.be.null;
            expect(
                container.innerHTML
            ).to.equal(
                '<div start="123"></div>'
            );
        });
        it('Second render (creation)', () => {
            Inferno.render(template(-4), container);
            expect(container.getAttribute('seamless')).to.be.null;
            expect(
                container.innerHTML
            ).to.equal(
                '<div start="-4"></div>'
            );
        });
        it('Third render (update)', () => {
            Inferno.render(template(0), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div start="0"></div>'
            );
        });
    });

    describe('should properly render "title" attribute', () => {
        let template = Inferno.createTemplate((arg) =>
            createElement('div', {
                title: arg
            })
        );

        it('Initial render (creation)', () => {
            Inferno.render(template(123), container);
            expect(container.getAttribute('seamless')).to.be.null;
            expect(
                container.innerHTML
            ).to.equal(
                '<div title="123"></div>'
            );
        });
        it('Second render (creation)', () => {
            Inferno.render(template('Hello'), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div title="Hello"></div>'
            );
        });

        it('Third render (update)', () => {
            Inferno.render(template([]), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div></div>'
            );
        });
    });

    describe('should properly render "contentEditable" attribute', () => {
        let template = Inferno.createTemplate((arg) =>
            createElement('div', {
                contentEditable: arg
            })
        );

        it('Initial render (creation)', () => {
            Inferno.render(template(123), container);
            expect(container.firstChild.getAttribute('seamless')).to.be.null;
            expect(
                container.innerHTML
            ).to.equal(
                '<div contenteditable="123"></div>'
            );
        });
        it('Second render (creation)', () => {
            Inferno.render(template('Hello'), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div contenteditable="Hello"></div>'
            );
        });
        it('Third render (update)', () => {
            Inferno.render(template([]), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div contenteditable=""></div>'
            );
        });
    });

    describe('should populate the `value` attribute on select multiple using groups', () => {
        let template;

        beforeEach(() => {
            template = Inferno.createTemplate((val1, val2) =>
                createElement('select', {
                        multiple: true,
                        value: ['foo', 'bar']
                    },
                    createElement('optgroup', {
                            label: 'foo-group'
                        },
                        createElement('option', {
                            value: 'bar'
                        }, val1)
                    ),
                    createElement('optgroup', {
                            label: 'bar-group'
                        },
                        createElement('option', {
                            value: 'foo'
                        }, val2)
                    )
                )
            );
            Inferno.render(template('bar', 'foo'), container);
        });

        it('Initial render (creation)', () => {
            expect(
                container.innerHTML
            ).to.equal(
                `<select multiple="multiple"><optgroup label="foo-group"><option value="bar">bar</option></optgroup><optgroup label="bar-group"><option value="foo">foo</option></optgroup></select>`
            );
        });
        it('Second render (update)', () => {
            Inferno.render(template('Rocks', 'Inferno'), container);
            expect(
                container.innerHTML
            ).to.equal(
                `<select multiple="multiple"><optgroup label="foo-group"><option value="bar">Rocks</option></optgroup><optgroup label="bar-group"><option value="foo">Inferno</option></optgroup></select>`
            );
        });
    });

    //	///**
    //	// * Styles
    //	// */

    describe('should handle basic styles', () => {
        let template;
        const styleRule = {
            width: 200,
            height: 200
        };

        beforeEach(() => {
            template = Inferno.createTemplate(() =>
                createElement('div', {
                    style: styleRule
                })
            );
        });

        it('Initial render (creation)', () => {
            Inferno.render(template(), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div style="width: 200px; height: 200px;"></div>'
            );

            expect(
	            () => Inferno.render(() => {}, container)
            ).to.throw;

        });
    });

    describe('should update styles when "style" changes from null to object', () => {
        let template;
        const styles = {
            color: 'red'
        };

        beforeEach(() => {
            template = Inferno.createTemplate(() =>
                createElement('div', {
                    style: {
                        null
                    }
                })
            );
        });

        it('Initial render (creation)', () => {
            Inferno.render(template(), container);

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
        it('Second render (update)', () => {
            template = Inferno.createTemplate(() =>
                createElement('div', {
                    style: styles
                })
            );
            Inferno.render(template(), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div style="color: red;"></div>'
            );
        });
    });

    describe('should ignore null styles', () => {
        let template;
        const styleRule = {
            backgroundColor: null,
            display: 'none'
        };

        beforeEach(() => {
            template = Inferno.createTemplate(() =>
                createElement('div', {
                    style: styleRule
                })
            );
        });

        it('Initial render (creation)', () => {
            Inferno.render(template(), container);

            expect(
                container.innerHTML
            ).to.equal(
                '<div style="display: none;"></div>'
            );
            Inferno.render(template(), container);

            expect(
                container.innerHTML
            ).to.equal(
                '<div style="display: none;"></div>'
            );
        });
    });

    describe('should not set NaN value on styles', () => {
        let template;
        const styleRule = {
            'font-size': parseFloat('zoo')
        };

        beforeEach(() => {
            template = Inferno.createTemplate(() =>
                createElement('div', {
                    style: styleRule
                })
            );
        });

        it('Initial render (creation)', () => {
            Inferno.render(template(), container);

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

    describe('should trim values so `px` will be appended correctly', () => {
        let template;
        const styleRule = {
            margin: '16 '
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
                '<div style="margin: 16px;"></div>'
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
        });

        it('Initial render (creation)', () => {
            Inferno.render(template(), container);

            expect(
                container.innerHTML
            ).to.equal(
                '<div style="width: 7px;"></div>'
            );
            expect(
                container.innerHTML
            ).to.equal(
                '<div style="width: 7px;"></div>'
            );

        });
    });

	 it('should support number values', () => {

        const styleRule = {
            width: 7
        };

        let template = Inferno.createTemplate(() =>
                createElement('div', {
                    style: styleRule
                })
            );

            Inferno.render(template(), container);

            expect(
                container.innerHTML
            ).to.equal(
                '<div style="width: 7px;"></div>'
            );
            expect(
                container.innerHTML
            ).to.equal(
                '<div style="width: 7px;"></div>'
            );
    });

	it('should support set width and height', () => {

        let template = Inferno.createTemplate(() =>
                createElement('div', {
                    style: {
            width: 200,
            height: 200
        }
                })
            );

            Inferno.render(template(), container);

            expect(
                container.innerHTML
            ).to.equal(
                 '<div style="width: 200px; height: 200px;"></div>'
            );

            Inferno.render(template(), container);

            expect(
                container.innerHTML
            ).to.equal(
                 '<div style="width: 200px; height: 200px;"></div>'
            );

            Inferno.render(template(), container);

            expect(
                container.innerHTML
            ).to.equal(
                 '<div style="width: 200px; height: 200px;"></div>'
            );

    });


	it('should dynamically support number values on root node', () => {

       let template = Inferno.createTemplate((value) => ({
                tag: 'div',
                attrs: {
                    style: value
                }
            }))

const style = {
            width: 7
        };

            Inferno.render(template(style), container);

            expect(
                container.innerHTML
            ).to.equal(
                '<div style="width: 7px;"></div>'
            );

            Inferno.render(template(style), container);

            expect(
                container.innerHTML
            ).to.equal(
                '<div style="width: 7px;"></div>'
            );
    });


	it('should dynamically update styles on root node', () => {

        let template = Inferno.createTemplate((value) => ({
                tag: 'div',
                attrs: {
                    style: value
                }
            }))

		const style = {
            width: 200,
            height: 200
        };
            Inferno.render(template(style), container);

            expect(
                container.innerHTML
            ).to.equal(
                 '<div style="width: 200px; height: 200px;"></div>'
            );

            Inferno.render(template(style), container);

            expect(
                container.innerHTML
            ).to.equal(
                '<div style="width: 200px; height: 200px;"></div>'
            );
    });

   it('should dynamically update styles on first child node', () => {

        let template = Inferno.createTemplate((value) => ({
                tag: 'div',
				children: {
                tag: 'span',
				attrs: {
                    style: value
                }
				}
            }))

		const style = {
            width: 200,
            height: 200
        };
            Inferno.render(template(style), container);

            expect(
                container.innerHTML
            ).to.equal(
                 '<div><span style="width: 200px; height: 200px;"></span></div>'
            );

            Inferno.render(template(style), container);

            expect(
                container.innerHTML
            ).to.equal(
               '<div><span style="width: 200px; height: 200px;"></span></div>'
            );
    });
});
