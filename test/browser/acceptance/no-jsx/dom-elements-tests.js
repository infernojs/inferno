import Inferno from '../../../../src';
import get from '../../../tools/get';

const {
    createElement
} = Inferno.TemplateFactory;

describe('DOM element tests (no-jsx)', () => {
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
                ''
            );

            Inferno.render(div(null), container);

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
        });
    });

    describe('should render "select" boolean on select options', () => {
        it('Initial render (creation)', () => {
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
            Inferno.render(template(), container);
            expect(container.firstChild.children[0].selected).to.eql(true);
            expect(container.firstChild.children[1].selected).to.eql(false);
            expect(
                container.innerHTML
            ).to.equal(
                '<select multiple="multiple"><option selected="selected">foo</option><option>bar</option></select>'
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
            Inferno.render(template(null), container);
        });

        it('Initial render (creation)', () => {
            expect(container.firstChild.value).to.equal('');
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
            Inferno.render(template(null), container);
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

    describe('should render value multiple attribute', () => {
        beforeEach(() => {
            const template = Inferno.createTemplate(() => ({
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
            Inferno.render(template(null), container);
        });

        it('Initial render (creation)', () => {
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
            Inferno.render(template('Inferno', 'Rocks'), container);
        });

        it('Initial render (creation)', () => {
            expect(
                container.innerHTML
            ).to.equal(
                `<div class="foo"><span class="bar">Inferno</span><span class="yar">Rocks</span></div>`
            );
        });
        it('Second render (update)', () => {
            Inferno.render(template('Rocks', 'Inferno'), container);
            expect(
                container.innerHTML
            ).to.equal(
                `<div class="foo"><span class="bar">Rocks</span><span class="yar">Inferno</span></div>`
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
                    disabled: false
                })
            );

            Inferno.render(template(), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<span></span>'
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
                '<input>'
            );
        });
        it('Second render (update)', () => {
            Inferno.render(template(), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<input>'
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
            Inferno.render(template(), container);
        });

        it('Initial render (creation)', () => {
            expect(
                container.innerHTML
            ).to.equal(
                '<input type="file" multiple="true" capture="true">'
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
            Inferno.render(template(), container);
        });

        it('Initial render (creation)', () => {
            expect(
                container.innerHTML
            ).to.equal(
                '<input href="/images/xxx.jpg" download="true">'
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
        });

        it('Third render (update)', () => {
            Inferno.render(template(true), container);
            expect(container.firstChild.muted).to.be.true;
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
            expect(container.getAttribute('draggable')).to.be.null;
            expect(
                container.innerHTML
            ).to.equal(
                '<div></div>'
            );
        });
        it('Second render (creation)', () => {
            Inferno.render(template(null), container);
            expect(container.getAttribute('draggable')).to.be.null;
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
            expect(container.getAttribute('formNoValidate')).to.be.null;
            expect(
                container.innerHTML
            ).to.equal(
                '<div></div>'
            );
        });
        it('Second render (creation)', () => {
            Inferno.render(template(null), container);
            expect(container.getAttribute('formNoValidate')).to.be.null;
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
        });
        it('Second render (update)', () => {
            Inferno.render(template(true), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div scope="true"></div>'
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
         // Dominic! This should ONLY unset the div child inside the span() temp function. As it is now, also the root node are removed.
            Inferno.render(template(null), container);
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
                '<div>Good bye!</div>'
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
						tag: 'dominic',
						id: 'foo',
						children: {
							tag:'span',
							text: 'Hello'
							}
						}
                };
            });
            Inferno.render(template(spanWithChildren()), container);
            expect(container.firstChild.innerHTML).to.equal('<span><dominic id="foo"><span>Hello</span></dominic></span>');


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
                    children: ['Hello ', null, '!']
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
			
			 const span1 = Inferno.createTemplate(function() {
                return {
                    tag: 'span',
                    children: null
                };
            });
            Inferno.render(template(span1()), container);
            expect(container.firstChild.innerHTML).to.equal('<span></span>');

			 const span2 = Inferno.createTemplate(function() {
                return {
                    text:''
                };
            });
            Inferno.render(template(span2()), container);
            expect(container.firstChild.innerHTML).to.equal('');
			

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

    describe('should update an node with static child and dynamic custom attribute and static text and dynamic children', () => {
        const template = Inferno.createTemplate((child) => ({
            tag: 'div',
            children: {
                tag: 'div',
                children: child
            }
        }));

        it('first render (creation)', () => {
            const span = Inferno.createTemplate(function(val) {
                return {
                    tag: 'span',
                    attrs: {
                        custom_attr: val
                    },
                    child: 'Hello!!'
                };
            });
            const span2 = Inferno.createTemplate(function(val) { // This child, and attrs never set
                return {
                    tag: 'span',
                    attrs: {
                        caught_fire: val
                    },
                    children: 'Hello, world'
                };
            });
			
			 const span3 = Inferno.createTemplate(function(val) { // This child, and attrs never set
                return {
                    tag: 'span',
                    attrs: null,
                    children: 'Hello, world'
                };
            });

            Inferno.render(template(span('id#1', span2('custom'))), container);
            expect(container.firstChild.innerHTML).to.equal('<div><span custom_attr="id#1"></span></div>');

            Inferno.render(template(span('id#2', span2('custom'))), container);
            expect(container.firstChild.innerHTML).to.equal('<div><span custom_attr="id#2"></span></div>');

            Inferno.render(template(span('id#2', span3('custom'))), container);
            expect(container.firstChild.innerHTML).to.equal('<div><span custom_attr="id#2"></span></div>');

        });
        it('second render - (update)', () => {
            const span = Inferno.createTemplate(function(val, child) {
                return {
                    tag: 'span',
                    attrs: {
                        caught_fire: val
                    },
                    children: child
                };
            });
            const span2 = Inferno.createTemplate(function(val) {
                return {
                    tag: 'span',
                    attrs: {
                        caught_fire: val
                    },
                    children: 'Hello, world'
                };
            });

            Inferno.render(template(span('id#2', span2('custom'))), container);
            expect(container.firstChild.innerHTML).to.equal('<div><span caught_fire="id#2"><span caught_fire="custom">Hello, world</span></span></div>');
            Inferno.render(template(span(null, span2('custom'))), container);
            expect(container.firstChild.innerHTML).to.equal('<div><span><span caught_fire="custom">Hello, world</span></span></div>');

        });
    });

    describe('should keep parent namespace', () => {

        const template = Inferno.createTemplate((child) => ({
            tag: 'svg',
            attrs: {
                xmlns: 'http://www.w3.org/1999/xhtml'
            },
            children: child
        }));
        it('Initial render (creation)', () => {
            const child = Inferno.createTemplate(() => ({
                tag: 'circle'
            }));

            Inferno.render(template(child()), container);
            expect(container.firstChild.namespaceURI).to.equal('http://www.w3.org/1999/xhtml');

            Inferno.render(template(child()), container);
            expect(container.firstChild.namespaceURI).to.equal('http://www.w3.org/1999/xhtml');

            const child1 = Inferno.createTemplate(() => ({
                tag: null
            }));
			
            Inferno.render(template(child1()), container);
            expect(container.firstChild.namespaceURI).to.equal('http://www.w3.org/1999/xhtml');

            const child2 = Inferno.createTemplate(() => ({
                tag: 'svg'
            }));
			
            Inferno.render(template(child2()), container);
            expect(container.firstChild.namespaceURI).to.equal('http://www.w3.org/1999/xhtml');


        });
        it('Second render (update)', () => {
            const child = Inferno.createTemplate(() => ({
                tag: 'circle',
                children: {
                    tag: 'circle'
                }
            }));

            Inferno.render(template(child()), container);
            expect(container.firstChild.firstChild.namespaceURI).to.equal('http://www.w3.org/1999/xhtml');
        });
        it('Third render (update)', () => {
            const child = Inferno.createTemplate(() => ({
                tag: 'circle',
                children: {
                    tag: 'circle',
                    children: {
                        tag: 'g'
                    }
                }
            }));

            Inferno.render(template(child()), container);
            expect(container.firstChild.firstChild.firstChild.namespaceURI).to.equal('http://www.w3.org/1999/xhtml');
            Inferno.render(template(child()), container);
            expect(container.firstChild.firstChild.firstChild.namespaceURI).to.equal('http://www.w3.org/1999/xhtml');
        });
        it('Fourth render (update)', () => {
            const child = Inferno.createTemplate(() => ({
                tag: 'circle',
                children: {
                    tag: 'circle',
                    children: {
                        tag: 'g',
                        children: {
                            tag: 'g'
                        }
                    }
                }
            }));

            Inferno.render(template(child()), container);
            expect(container.firstChild.firstChild.firstChild.firstChild.namespaceURI).to.equal('http://www.w3.org/1999/xhtml');
        });
        it('Fourth render (update)', () => {
            const child = Inferno.createTemplate(() => ({
                tag: 'circle',
                children: {
                    tag: 'circle',
                    children: {
                        tag: 'g',
                        children: {
                            tag: 'g',
                            children: {
                                tag: 'circle'
                            }

                        }
                    }
                }
            }));

            Inferno.render(template(child()), container);
            expect(container.firstChild.firstChild.firstChild.firstChild.firstChild.namespaceURI).to.equal('http://www.w3.org/1999/xhtml');
        });
    });

    describe('should render "select" boolean on select options', () => {
        const template = Inferno.createTemplate(function(val) {
            return {
                tag: 'select',
                attrs: {
                    multiple: true,
                    value: val
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
            Inferno.render(template('foo'), container);
            expect(container.firstChild.children[0].selected).to.eql(true); // SHOULD BE TRUE
            expect(container.firstChild.children[1].selected).to.eql(false);
            expect(
                container.innerHTML
            ).to.equal(
                '<select multiple="multiple"><option>foo</option><option>bar</option></select>' // Missing selected markup
            );
            Inferno.render(template('foo'), container);
            expect(container.firstChild.children[0].selected).to.eql(true); // SHOULD BE TRUE
            expect(container.firstChild.children[1].selected).to.eql(false);
            expect(
                container.innerHTML
            ).to.equal(
                '<select multiple="multiple"><option>foo</option><option>bar</option></select>' // Missing selected markup
            );
        });
        it('Initial render (creation)', () => {
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
            Inferno.render(template('bar'), container);
            expect(container.firstChild.children[0].selected).to.eql(true);
            expect(container.firstChild.children[1].selected).to.eql(false);
            expect(
                container.innerHTML
            ).to.equal(
                '<select multiple="multiple"><option selected="selected">foo</option><option>bar</option></select>'
            );

            Inferno.render(template(null), container);
            expect(container.firstChild.children[0].selected).to.eql(true);
            expect(container.firstChild.children[1].selected).to.eql(false);
            expect(
                container.innerHTML
            ).to.equal(
                '<select multiple="multiple"><option selected="selected">foo</option><option>bar</option></select>'
            );

        });
    });

    describe('should set className on root node, and update an node with dynamic attributes on static child', () => {
        const template = Inferno.createTemplate((child) => ({
            tag: 'div',
            children: {
                tag: 'div',
                attrs: {
                    class: 'Hello!'
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
            expect(container.firstChild.innerHTML).to.equal('<div class="Hello!"><span id="id#1"></span></div>');
        });
        it('second render - (update)', () => {
            Inferno.render(template('id#2'), container);
            expect(container.firstChild.innerHTML).to.equal('<div class="Hello!"><span id="id#2"></span></div>');

        });
    });

    describe('should update an node with static child and dynamic custom attribute and static text and dynamic children', () => {
        const template = Inferno.createTemplate((child) => ({
            tag: 'div',
            children: {
                tag: 'div',
                children: child
            }
        }));

        it('first render (creation)', () => {
            const span = Inferno.createTemplate(function(val) {
                return {
                    tag: 'span',
                    attrs: {
                        custom_attr: val
                    },
                    child: 'Hello!!'
                };
            });
            const span2 = Inferno.createTemplate(function(val) { // This child, and attrs never set
                return {
                    tag: 'span',
                    attrs: {
                        caught_fire: val
                    },
                    children: 'Hello, world'
                };
            });
            Inferno.render(template(span('id#1', span2('custom'))), container);
            expect(container.firstChild.innerHTML).to.equal('<div><span custom_attr="id#1"></span></div>'); // WILL NOT FAIL
        });
        it('second render - (update)', () => {
            const span = Inferno.createTemplate(function(val, child) {
                return {
                    tag: 'span',
                    attrs: {
                        caught_fire: val
                    },
                    children: child
                };
            });
            const span2 = Inferno.createTemplate(function(val) {
                return {
                    tag: 'span',
                    attrs: {
                        caught_fire: val
                    },
                    children: 'Hello, world'
                };
            });

            Inferno.render(template(span('id#2', span2('custom'))), container);
            expect(container.firstChild.innerHTML).to.equal('<div><span caught_fire="id#2"><span caught_fire="custom">Hello, world</span></span></div>');
        });
    });

    describe('should render "select" boolean on select options', () => {
        const template = Inferno.createTemplate(function(val) {
            return {
                tag: 'select',
                attrs: {
                    multiple: true,
                    value: val
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
            Inferno.render(template('foo'), container);
            expect(container.firstChild.children[0].selected).to.eql(true); // SHOULD BE TRUE
            expect(container.firstChild.children[1].selected).to.eql(false);
            expect(
                container.innerHTML
            ).to.equal(
                '<select multiple="multiple"><option>foo</option><option>bar</option></select>' // Missing selected markup
            );
            Inferno.render(template('foo'), container);
            expect(container.firstChild.children[0].selected).to.eql(true); // SHOULD BE TRUE
            expect(container.firstChild.children[1].selected).to.eql(false);
            expect(
                container.innerHTML
            ).to.equal(
                '<select multiple="multiple"><option>foo</option><option>bar</option></select>' // Missing selected markup
            );
        });
        it('Initial render (creation)', () => {
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
            Inferno.render(template('bar'), container);
            expect(container.firstChild.children[0].selected).to.eql(true);
            expect(container.firstChild.children[1].selected).to.eql(false);
            expect(
                container.innerHTML
            ).to.equal(
                '<select multiple="multiple"><option selected="selected">foo</option><option>bar</option></select>'
            );
        });
    });

    describe('should properly render class attribute', () => {
        let template = Inferno.createTemplate((arg) =>
            createElement('div', {
                class: arg
            })
        );

        it('Initial render (creation)', () => {
            Inferno.render(template('muffins'), container);
            expect(container.firstChild.getAttribute('class')).to.eql('muffins');
            expect(
                container.innerHTML
            ).to.equal(
                '<div class="muffins"></div>'
            );
            Inferno.render(template('muffins'), container);
            expect(container.firstChild.getAttribute('class')).to.eql('muffins');
            expect(
                container.innerHTML
            ).to.equal(
                '<div class="muffins"></div>'
            );

            Inferno.render(template(), container);
            expect(container.firstChild.getAttribute('class')).to.eql('');
            expect(
                container.innerHTML
            ).to.equal(
                '<div></div>'
            );

            Inferno.render(template(null), container);
            expect(container.firstChild.getAttribute('class')).to.eql('');
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
                '<div class="true"></div>'
            );
        });
        it('Third render (update)', () => {
            Inferno.render(template([]), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div class=""></div>'
            );
            Inferno.render(template({}), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div class=""></div>'
            );
            Inferno.render(template(null), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div></div>'
            );

        });
        it('Fourth render (update)', () => {
            Inferno.render(template({}), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div class="[object Object]"></div>'
            );
        });
    });

    describe('should render "select" boolean on select options', () => {
        const template = Inferno.createTemplate(function(val) {
            return {
                tag: 'select',
                attrs: {
                    multiple: true,
                    value: val
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
            Inferno.render(template('foo'), container);
            expect(container.firstChild.children[0].selected).to.eql(true); // SHOULD BE TRUE
            expect(container.firstChild.children[1].selected).to.eql(false);
            expect(
                container.innerHTML
            ).to.equal(
                '<select multiple="multiple"><option>foo</option><option>bar</option></select>'
            );
            Inferno.render(template('foo'), container);
            expect(container.firstChild.children[0].selected).to.eql(true); // SHOULD BE TRUE
            expect(container.firstChild.children[1].selected).to.eql(false);
            expect(
                container.innerHTML
            ).to.equal(
                '<select multiple="multiple"><option>foo</option><option>bar</option></select>'
            );
        });
    });

    describe('should handle lots of dynamic variables', () => {
        const template = Inferno.createTemplate(function(val1, val2, val3, val4, val5, val6) {
            return {
                tag: 'div',
                attrs: {
                    className: val2,
                    id: val1
                },
                children: [{
                    tag: 'div',
                    attrs: {
                        id: val5
                    },
                    children: {
                        tag: 'span',
                        text: val6
                    }
                }, {
                    tag: 'div',
                    attrs: {
                        className: val4
                    },
                    children: val3
                }]

            };
        });

        it('Create and update', () => {
            Inferno.render(template('foo1', 'bar1', 'foo2', 'bar2', 'foo3', 'bar3'), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div class="bar1" id="foo1"><div id="foo3"><span>bar3</span></div><div class="bar2">foo2</div></div>'
            );

            Inferno.render(template('yar1', 'noo1', 'yar2', 'noo2', 'yar3', 'noo3'), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div class="noo1" id="yar1"><div id="yar3"><span>noo3</span></div><div class="noo2">yar2</div></div>'
            );
			
		   Inferno.render(template('yar1', null, 'yar2', 'noo2', 'yar3', null), container);

		   expect(container.firstChild.firstChild.tagName).to.equal('DIV');
		   expect(container.firstChild.getAttribute('class')).to.equal('noo1');
           expect(container.firstChild.firstChild.firstChild.tagName).to.equal('SPAN');
		   expect(container.firstChild.firstChild.textContent).to.equal('');
		   expect(container.firstChild.firstChild.firstChild.textContent).to.equal('noo3');


		   Inferno.render(template('yar1', 123, 'yar2', 'noo2', 'yar3', undefined), container);

		   expect(container.firstChild.firstChild.tagName).to.equal('DIV');
		   expect(container.firstChild.getAttribute('class')).to.equal('123');
           expect(container.firstChild.firstChild.firstChild.tagName).to.equal('SPAN');
		   expect(container.firstChild.firstChild.textContent).to.equal('');
		   expect(container.firstChild.firstChild.firstChild.textContent).to.equal('');

		   Inferno.render(template(null, null, null, null, null, null), container);

		   expect(container.firstChild.firstChild.tagName).to.equal('DIV');
		   expect(container.firstChild.getAttribute('class')).to.equal('');
           expect(container.firstChild.firstChild.firstChild.tagName).to.equal('SPAN');
		   expect(container.firstChild.firstChild.textContent).to.equal('');
		   expect(container.firstChild.firstChild.firstChild.textContent).to.equal('');

		   Inferno.render(template(undefined, undefined, undefined, undefined, undefined, undefined), container);

		   expect(container.firstChild.firstChild.tagName).to.equal('DIV');
		   expect(container.firstChild.getAttribute('class')).to.equal('');
           expect(container.firstChild.firstChild.firstChild.tagName).to.equal('SPAN');
		   expect(container.firstChild.firstChild.textContent).to.equal('');
		   expect(container.firstChild.firstChild.firstChild.textContent).to.equal('');

		   
        });
    });

    describe('it should handle dynamic root text nodes', () => {
        let template;
        beforeEach(() => {
            template = Inferno.createTemplate((val) => ({
                text: val
            }));
        });

        it('Initial render (creation)', () => {
            Inferno.render(template('abc'), container);
            expect(container.innerHTML).to.eql('abc');
            Inferno.render(template('abcd'), container);
            expect(container.innerHTML).to.eql('abcd');

        });

        it('Initial render (update)', () => {
            Inferno.render(template('123'), container);
            expect(container.innerHTML).to.eql('123');
        });
    });

    describe('it should handle root dynamic nodes', () => {
        let template;
        beforeEach(() => {
            template = Inferno.createTemplate((val) =>
                val
            );
        });

        it('Initial render (creation)', () => {
            Inferno.render(template('abc'), container);
            expect(container.innerHTML).to.eql('abc');
            Inferno.render(template('abcd'), container);
            expect(container.innerHTML).to.eql('abcd');

        });

        it('Initial render (update)', () => {
            Inferno.render(template('123'), container);
            expect(container.innerHTML).to.eql('123');
            Inferno.render(template('1234'), container);
            expect(container.innerHTML).to.eql('1234');
        });
    });


    //
    //
    //	  describe('should properly render className attribute', () => {
    //		let template = Inferno.createTemplate((createElement, createComponent, arg) =>
    //			createElement('div', {
    //				className: arg
    //			})
    //		);
    //
    //		it('Initial render (creation)', () => {
    //
    //			Inferno.render(Inferno.createFragment('muffins', template), container);
    //
    //			expect(container.firstChild.getAttribute('class')).to.eql('muffins');
    //			expect(
    //				container.innerHTML
    //			).to.equal(
    //				'<div class="muffins"></div>'
    //			);
    //		});
    //
    //		it('Second render (update)', () => {
    //			Inferno.render(Inferno.createFragment(true, template), container);
    //			expect(
    //				container.innerHTML
    //			).to.equal(
    //				'<div class="true"></div>'
    //			);
    //		});
    //
    //		it('Third render (update)', () => {
    //			Inferno.render(Inferno.createFragment([], template), container);
    //			expect(
    //				container.innerHTML
    //			).to.equal(
    //				'<div></div>'
    //			);
    //		});
    //
    //		it('Fourth render (update)', () => {
    //			Inferno.render(Inferno.createFragment({}, template), container);
    //			expect(

    //				container.innerHTML
    //			).to.equal(
    //				'<div class="[object Object]"></div>'
    //			);
    //		});
    //	});
    //
    //	describe('should properly render and update a radio button attribute', () => {
    //		let template = Inferno.createTemplate((createElement, createComponent, arg) =>
    //			createElement('input', { type:'radio', checked:arg })
    //		);
    //
    //		it('Initial render (creation)', () => {
    //
    //			Inferno.render(Inferno.createFragment(true, template), container);
    //
    //			expect(container.firstChild.checked).to.equal(true);
    //			expect(
    //				container.innerHTML
    //			).to.equal(
    //				 '<input type="radio">'
    //			);
    //		});
    //
    //		it('Second render (update)', () => {
    //			Inferno.render(Inferno.createFragment(false, template), container);
    //			expect(container.firstChild.checked).to.equal(false);
    //			expect(
    //				container.innerHTML
    //			).to.equal(
    //				'<input type="radio">'
    //			);
    //		});
    //	});
    //
    //    describe('should properly render and update a checkbox attribute', () => {
    //		let template = Inferno.createTemplate((createElement, createComponent, arg) =>
    //			createElement('div', { type:'checkbox', checked:arg })
    //		);
    //
    //		it('Initial render (creation)', () => {
    //
    //			Inferno.render(Inferno.createFragment(true, template), container);
    //
    //			expect(container.firstChild.checked).to.equal(true);
    //			expect(
    //				container.innerHTML
    //			).to.equal(
    //				 '<div type="checkbox"></div>'
    //			);
    //		});
    //
    //		it('Second render (update)', () => {
    //			Inferno.render(Inferno.createFragment(false, template), container);
    //			expect(container.firstChild.checked).to.equal(false);
    //			expect(
    //				container.innerHTML
    //			).to.equal(
    //				 '<div type="checkbox"></div>'
    //			);
    //		});
    //
    //		it('Third render (update)', () => {
    //			Inferno.render(Inferno.createFragment(null, template), container);
    //			expect(container.firstChild.checked).to.equal(undefined);
    //			expect(
    //				container.innerHTML
    //			).to.equal(
    //				 '<div type="checkbox"></div>'
    //			);
    //		});
    //
    //		it('Fourth render (update)', () => {
    //			Inferno.render(Inferno.createFragment(undefined, template), container);
    //			expect(container.firstChild.checked).to.equal(undefined);
    //			expect(
    //				container.innerHTML
    //			).to.equal(
    //				 '<div type="checkbox"></div>'
    //			);
    //		});
    //
    //		it('Fifth render (update)', () => {
    //			Inferno.render(Inferno.createFragment([], template), container);
    //			expect(container.firstChild.checked).to.equal(undefined);
    //			expect(
    //				container.innerHTML
    //			).to.equal(
    //				 '<div type="checkbox"></div>'
    //			);
    //		});
    //
    //		it('Sixth render (update)', () => {
    //			Inferno.render(Inferno.createFragment({}, template), container);
    //			expect(container.firstChild.checked).to.eql({});
    //			expect(
    //				container.innerHTML
    //			).to.equal(
    //				 '<div type="checkbox"></div>'
    //			);
    //		});
    //	});
    //
    //	describe('should properly update from checkbox to radio button', () => {
    //		let template = Inferno.createTemplate((createElement, createComponent, arg, arg1) =>
    //			createElement('div', { type:arg, checked:arg1 })
    //		);
    //
    //		it('Initial render (creation)', () => {
    //
    //			Inferno.render(Inferno.createFragment(['checkbox', true], template), container);
    //
    //			expect(container.firstChild.checked).to.equal(true);
    //			expect(
    //				container.innerHTML
    //			).to.equal(
    //				 '<div type="checkbox"></div>'
    //			);
    //		});
    //
    //		it('Second render (update)', () => {
    //			Inferno.render(Inferno.createFragment(['radio', true], template), container);
    //			expect(container.firstChild.checked).to.equal(true);
    //			expect(
    //				container.innerHTML
    //			).to.equal(
    //				 '<div type="radio"></div>'
    //			);
    //		});
    //	});
    //
    //	describe('should properly update from checkbox to radio button', () => {
    //		let template = Inferno.createTemplate((createElement, createComponent, arg, arg1) =>
    //			createElement('input', { type:arg, checked:arg1 })
    //		);
    //
    //		it('Initial render (creation)', () => {
    //
    //			Inferno.render(Inferno.createFragment(['checkbox', true], template), container);
    //
    //			expect(container.firstChild.checked).to.equal(true);
    //			expect(
    //				container.innerHTML
    //			).to.equal(
    //				  '<input type="checkbox">'
    //			);
    //		});
    //
    //		it('Second render (update)', () => {
    //			Inferno.render(Inferno.createFragment(['radio', true], template), container);
    //			expect(container.firstChild.checked).to.equal(true);
    //			expect(
    //				container.innerHTML
    //			).to.equal(
    //				 '<input type="radio">'
    //			);
    //		});
    //
    //		it('Third render (update)', () => {
    //			Inferno.render(Inferno.createFragment(['radio', 'checked'], template), container);
    //			expect(container.firstChild.checked).to.equal(true);
    //			expect(
    //				container.innerHTML
    //			).to.equal(
    //				 '<input type="radio">'
    //			);
    //		});
    //
    //		it('Fourth render (update)', () => {
    //			Inferno.render(Inferno.createFragment(['radio', ''], template), container);
    //			expect(container.firstChild.checked).to.equal(false);
    //			expect(
    //				container.innerHTML
    //			).to.equal(
    //				 '<input type="radio">'
    //			);
    //		});
    //	});
    //
    //	describe('should render custom attribute', () => {
    //		let template = Inferno.createTemplate((createElement, createComponent, arg) =>
    //			createElement('div', { 'custom-attr' : arg })
    //		);
    //
    //		it('Initial render (creation)', () => {
    //
    //			Inferno.render(Inferno.createFragment([123], template), container);
    //
    //			expect(container.firstChild.getAttribute('custom-attr')).to.equal('123');
    //			expect(
    //				container.innerHTML
    //			).to.equal(
    //				'<div custom-attr="123"></div>'
    //			);
    //		});
    //
    //		it('Second render (update)', () => {
    //			Inferno.render(Inferno.createFragment(['test.jpg', true], template), container);
    //			expect(container.firstChild.getAttribute('custom-attr')).to.equal('test.jpg');
    //			expect(
    //				container.innerHTML
    //			).to.equal(
    //				 '<div custom-attr="test.jpg"></div>'
    //			);
    //		});
    //	});
    //
    //	describe('should support "size" attribute', () => {
    //		let template = Inferno.createTemplate((createElement, createComponent, arg) =>
    //			createElement('label', { 'size' : arg })
    //		);
    //
    //		it('Initial render (creation)', () => {
    //
    //			Inferno.render(Inferno.createFragment(123, template), container);
    //
    //			expect(container.firstChild.getAttribute('size')).to.equal('123');
    //			expect(
    //				container.innerHTML
    //			).to.equal(
    //				 '<label size="123"></label>'
    //			);
    //		});
    //
    //		it('Second render (update)', () => {
    //			Inferno.render(Inferno.createFragment(['test.jpg'], template), container);
    //			expect(container.firstChild.getAttribute('size')).to.be.null;
    //			expect(
    //				container.innerHTML
    //			).to.equal(
    //				'<label></label>'
    //			);
    //		});
    //
    //		it('Second render (update)', () => {
    //			Inferno.render(Inferno.createFragment(-444, template), container);
    //			expect(container.firstChild.getAttribute('size')).to.be.null;
    //			expect(
    //				container.innerHTML
    //			).to.equal(
    //				'<label></label>'
    //			);
    //		});
    //
    //		it('Third render (update)', () => {
    //			Inferno.render(Inferno.createFragment(0, template), container);
    //			expect(container.firstChild.getAttribute('size')).to.be.null;
    //			expect(
    //				container.innerHTML
    //			).to.equal(
    //				'<label></label>'
    //			);
    //		});
    //	});
    //
    //	describe('should support "rowspan" attribute', () => {
    //		let template = Inferno.createTemplate((createElement, createComponent, arg) =>
    //			createElement('label', { 'rowspan' : arg })
    //		);
    //
    //		it('Initial render (creation)', () => {
    //
    //			Inferno.render(Inferno.createFragment(123, template), container);
    //
    //			expect(container.firstChild.getAttribute('rowspan')).to.equal('123');
    //			expect(
    //				container.innerHTML
    //			).to.equal(
    //				 '<label rowspan="123"></label>'
    //			);
    //		});
    //
    //		it('Second render (update)', () => {
    //			Inferno.render(Inferno.createFragment(['test.jpg'], template), container);
    //			expect(container.firstChild.getAttribute('rowspan')).to.be.null;
    //			expect(
    //				container.innerHTML
    //			).to.equal(
    //				'<label></label>'
    //			);
    //		});
    //
    //		it('Second render (update)', () => {
    //			Inferno.render(Inferno.createFragment(-444, template), container);
    //			expect(container.firstChild.getAttribute('rowspan')).to.eql('-444');
    //			expect(
    //				container.innerHTML
    //			).to.equal(
    //				'<label rowspan="-444"></label>'
    //			);
    //		});
    //
    //		it('Third render (update)', () => {
    //			Inferno.render(Inferno.createFragment(0, template), container);
    //			expect(container.firstChild.getAttribute('rowspan')).to.eql('0');
    //			expect(
    //				container.innerHTML
    //			).to.equal(
    //				'<label rowspan="0"></label>'
    //			);
    //		});
    //	});
    //
    //describe('should support "autocorrect" attribute', () => {
    //		let template = Inferno.createTemplate((createElement, createComponent, arg) =>
    //			createElement('label', { 'autocorrect' : arg })
    //		);
    //
    //		it('Initial render (creation)', () => {
    //
    //			Inferno.render(Inferno.createFragment(123, template), container);
    //
    //			expect(container.firstChild.getAttribute('autocorrect')).to.equal('123');
    //			expect(
    //				container.innerHTML
    //			).to.equal(
    //				 '<label autocorrect="123"></label>'
    //			);
    //		});
    //
    //		it('Second render (update)', () => {
    //			Inferno.render(Inferno.createFragment(['autocorrect'], template), container);
    //			expect(container.firstChild.getAttribute('autocorrect')).to.equal('autocorrect');
    //			expect(
    //				container.innerHTML

    //			).to.equal(
    //				'<label autocorrect="autocorrect"></label>'
    //			);
    //		});
    //
    //		it('Second render (update)', () => {
    //			Inferno.render(Inferno.createFragment(-444, template), container);
    //			expect(container.firstChild.getAttribute('autocorrect')).to.eql('-444');
    //			expect(
    //				container.innerHTML
    //			).to.equal(
    //				'<label autocorrect="-444"></label>'
    //			);
    //		});
    //
    //		it('Third render (update)', () => {
    //			Inferno.render(Inferno.createFragment(0, template), container);
    //			expect(container.firstChild.getAttribute('autocorrect')).to.be.null;
    //			expect(
    //				container.innerHTML
    //			).to.equal(
    //				'<label></label>'
    //			);
    //		});
    //	});
    //
    //describe('should bail out if attribute name shorter then 2', () => {
    //		let template = Inferno.createTemplate((createElement, createComponent, arg) =>
    //			createElement('label', { 'a' : arg })
    //		);
    //
    //		it('Initial render (creation)', () => {
    //
    //			Inferno.render(Inferno.createFragment(123, template), container);
    //
    //			expect(container.firstChild.getAttribute('a')).to.be.null;
    //			expect(
    //				container.innerHTML
    //			).to.equal(
    //				 '<label></label>'
    //			);
    //		});
    //
    //		it('Second render (update)', () => {
    //			Inferno.render(Inferno.createFragment(['world'], template), container);
    //			expect(container.firstChild.getAttribute('a')).to.be.null;
    //			expect(
    //				container.innerHTML
    //			).to.equal(
    //				'<label></label>'
    //			);
    //		});
    //	});
    //
    //	describe('should support alternative names', () => {
    //		let template = Inferno.createTemplate((createElement, createComponent, arg) =>
    //			createElement('label', { 'for' : arg })
    //		);
    //
    //		it('Initial render (creation)', () => {
    //
    //			Inferno.render(Inferno.createFragment('c1', template), container);
    //
    //			expect(container.firstChild.getAttribute('for')).to.equal('c1');
    //			expect(
    //				container.innerHTML
    //			).to.equal(
    //				 '<label for="c1"></label>'
    //			);
    //		});
    //
    //		it('Second render (update)', () => {
    //			Inferno.render(Inferno.createFragment(['test.jpg', true], template), container);
    //			expect(container.firstChild.getAttribute('for')).to.equal('test.jpg');
    //			expect(
    //				container.innerHTML
    //			).to.equal(
    //				'<label for="test.jpg"></label>'
    //			);
    //		});
    //	});
    //
    //     describe('should support alternative names', () => {
    //		let template = Inferno.createTemplate((createElement, createComponent, arg, arg1) =>
    //			createElement('button', { disabled : true })
    //		);
    //
    //		it('Initial render (creation)', () => {
    //
    //			Inferno.render(Inferno.createFragment('c1', template), container);
    //			expect(
    //				container.innerHTML
    //			).to.equal(
    //				'<button disabled="true"></button>'
    //			);
    //		});
    //	});


	describe('should handle root dynamic nodes', () => {
        let template;
        beforeEach(() => {
            template = Inferno.createTemplate((val) =>
                val
            );
        });

        it('Initial render (creation)', () => {
            Inferno.render(template('abc'), container);
            expect(container.innerHTML).to.eql('abc');
            Inferno.render(template('abc'), container);
            expect(container.innerHTML).to.eql('abc');
        });
        it('Second render (update)', () => {

            Inferno.render(template('124'), container);
            expect(container.innerHTML).to.eql('124');

            Inferno.render(template('123'), container);
            expect(container.innerHTML).to.eql('123');

            Inferno.render(template(null), container);
            expect(container.innerHTML).to.eql('');

        });
        it('Third render (update)', () => {
            Inferno.render(template(undefined), container);
            expect(container.innerHTML).to.equal('');
        });
        it('Fourth render (update)', () => {
            Inferno.render(template(null), container);
            expect(container.innerHTML).to.equal('');
        });
        it('Fifth render (update)', () => {
            Inferno.render(template(''), container);
            expect(container.innerHTML).to.eql('');
        });
        it('Sixth render (update)', () => {
            Inferno.render(template(123 + 'abc'), container);
            expect(container.innerHTML).to.eql('123abc');
            Inferno.render(template(123 + 'abc'), container);
            expect(container.innerHTML).to.eql('123abc');
        });
        it('Seventh render (update)', () => {
            expect(() => Inferno.render(template({}), container)).to.throw;
        });
        it('Eigth render (update)', () => {
            expect(() => Inferno.render(template([]), container)).to.throw;
        });
	});

	describe('should support refs', () => {
		let template;
		const divRef = Inferno.createRef();

		beforeEach(() => {
			template = Inferno.createTemplate((divRef) =>
				createElement('div', { ref: divRef })
			);
		});

		it('Initial render (creation)', () => {
			Inferno.render(template(divRef), container);

			expect(
				divRef.element
			).to.equal(
				container.firstChild
			);
			Inferno.render(template(divRef), container);

			expect(
				divRef.element
			).to.equal(
				container.firstChild
			);
		});
	});

	describe('should populates the value attribute on select multiple using groups', () => {
        const template = Inferno.createTemplate(function(val) {
            return {
                tag: 'select',
                attrs: {
                    multiple: true,
                    value: val
                },
                children: [{
                    tag: 'optGroup',
                    attrs: {
                        label: 'foo-group'
                    },
                    children: {
                        tag: 'option',
                        attrs: {
                            value: 'foo'
                        }
                    }
                }, {
                    tag: 'optGroup',
                    attrs: {
                        label: 'bar-group'
                    },
                    children: {
                        tag: 'option',
                        attrs: {
                            value: 'bar'
                        }
                    }
                }]
            };
        });

        it('Initial render (creation)', () => {
            Inferno.render(template(['foo', 'bar']), container);

            expect(container.firstChild.childNodes[0].innerHTML).to.eql('<option value="foo"></option>');
            expect(container.firstChild.childNodes[1].innerHTML).to.eql('<option value="bar"></option>');
            expect(container.firstChild.children[0].children[0].selected).to.eql(true);
            expect(container.firstChild.children[1].children[0].selected).to.eql(true);

            Inferno.render(template(null), container);

            expect(container.firstChild.childNodes[0].innerHTML).to.eql('<option value="foo"></option>');
            expect(container.firstChild.childNodes[1].innerHTML).to.eql('<option value="bar"></option>');
            expect(container.firstChild.children[0].children[0].selected).to.eql(false);
            expect(container.firstChild.children[1].children[0].selected).to.eql(false);

        });
        it('Second render (update)', () => {
            Inferno.render(template('foo'), container);

            expect(container.firstChild.childNodes[0].innerHTML).to.eql('<option value="foo"></option>');
            expect(container.firstChild.childNodes[1].innerHTML).to.eql('<option value="bar"></option>');
            expect(container.firstChild.children[0].children[0].selected).to.eql(true);
            expect(container.firstChild.children[1].children[0].selected).to.eql(false);
        });
        it('Third render (update)', () => {
            Inferno.render(template('bar'), container);

            expect(container.firstChild.childNodes[0].innerHTML).to.eql('<option value="foo"></option>');
            expect(container.firstChild.childNodes[1].innerHTML).to.eql('<option value="bar"></option>');
            expect(container.firstChild.children[0].children[0].selected).to.eql(false);
            expect(container.firstChild.children[1].children[0].selected).to.eql(true);

        });
        it('Third render (update)', () => {
            Inferno.render(template(null), container);

            expect(container.firstChild.childNodes[0].innerHTML).to.eql('<option value="foo"></option>');
            expect(container.firstChild.childNodes[1].innerHTML).to.eql('<option value="bar"></option>');
            expect(container.firstChild.children[0].children[0].selected).to.eql(false);
            expect(container.firstChild.children[1].children[0].selected).to.eql(false);
        });
    });

	describe('should insert an additional tag node', () => {
        const template = Inferno.createTemplate((child) => ({
            tag: 'div',
            children: child
        }));

        it('first render (creation)', () => {
            const span = Inferno.createTemplate(() => ({
                tag: 'div'
            }));

            Inferno.render(template(span()), container);
            expect(container.firstChild.innerHTML).to.equal('<div></div>');
            Inferno.render(template(span()), container);
            expect(container.firstChild.innerHTML).to.equal('<div></div>');
        });
        it('second render - (update)', () => {
            const span = Inferno.createTemplate(() => ({
                tag: 'div'
            }));

            Inferno.render(template(span()), container);
            expect(container.firstChild.innerHTML).to.equal('<div></div>');
            Inferno.render(template(span()), container);
            expect(container.firstChild.innerHTML).to.equal('<div></div>');
            Inferno.render(template(), container);
            expect(container.innerHTML).to.equal('');
        });

        it('third render - (update)', () => {
            const span = Inferno.createTemplate(() => ({
                tag: 'div'
            }));

            Inferno.render(template(span()), container);

            expect(container.firstChild.innerHTML).to.equal('<div></div>');
            Inferno.render(template(null), container);
            expect(container.innerHTML).to.equal('');
        });
    });
	
        describe('should update a wrapped text node with 4 arguments', () => {
            const template = Inferno.createTemplate((val1, val2, val3, val4) => ({
                tag: 'div',
                children: [
                    val1,
                    val2,
                    val3,
                    val4
                ]
            }));

            it('Initial render (creation)', () => {
                Inferno.render(template('Hello', ' world!', ' and ', 'Bar'), container);
                expect(
                    container.innerHTML
                ).to.equal(
                    '<div>Hello world! and Bar</div>'
                );

                Inferno.render(template('Hello', ' world!', ' and ', 'Zoo'), container);
                expect(
                    container.innerHTML
                ).to.equal(
                    '<div>Hello world! and Zoo</div>'
                );

                expect(
	                () => Inferno.render(template('Hello', [], ' and ', 'Zoo'), container)
                ).to.throw;

                Inferno.render(template('Hello', null, ' and ', 'Zoo'), container);
                expect(
                    container.innerHTML
                ).to.equal(
                    '<div>Hello and Zoo</div>'
                );

                expect(
	                () => Inferno.render(template('Hello', {}, ' and ', 'Zoo'), container)
                ).to.throw;

                Inferno.render(template('Hello', ' poz', ' and ', 'Zoo'), container);
                expect(
                    container.innerHTML
                ).to.equal(
                    '<div>Hello poz and Zoo</div>'
                );
            });
            it('Second render (update)', () => {
                Inferno.render(template('The ', 'bar', ' is', ' is dead!'), container);
                expect(
                    container.innerHTML
                ).to.equal(
                    '<div>The bar is is dead!</div>'
                );
            });
        });

	
	describe('should update a node with static text', () => {

            const template = Inferno.createTemplate((val) => ({
                tag: 'div',
                text: 'Hello, World',
                attrs: {
                    id: val
                }
            }));


            it('Initial render (creation)', () => {
                Inferno.render(template('Hello'), container);
                expect(
                    container.innerHTML
                ).to.equal(
                    '<div id="Hello">Hello, World</div>'
                );

                Inferno.render(template('Bar'), container);
                expect(
                    container.innerHTML
                ).to.equal(
                    '<div id="Bar">Hello, World</div>'
                );

                Inferno.render(template(null), container);
                expect(
                    container.innerHTML
                ).to.equal(
                    '<div>Hello, World</div>'
                );

                Inferno.render(template(undefined), container);
                expect(
                    container.innerHTML
                ).to.equal(
                    '<div>Hello, World</div>'
                );

            });
            it('Second render (update)', () => {
                Inferno.render(template('foo'), container);
                expect(
                    container.innerHTML
                ).to.equal(
                    '<div id="foo">Hello, World</div>'
                );
            });
        });
	
	
	
        describe('should update a node with multiple children and static text', () => {

            const template = Inferno.createTemplate((val1) => ({
                tag: 'div',
                attrs: {
                    id: val1
                },
                children: {
                    text: 'Hello, World'
                }
            }));


            it('Initial render (creation)', () => {
                Inferno.render(template('Hello'), container);
                expect(
                    container.innerHTML
                ).to.equal(
                    '<div id="Hello">Hello, World</div>'
                );

			   Inferno.render(template('Hello'), container);
                expect(
                    container.innerHTML
                ).to.equal(
                    '<div id="Hello">Hello, World</div>'
                );

			   Inferno.render(template(null), container); // should unset
                expect(
                    container.innerHTML
                ).to.equal(
                    '<div>Hello, World</div>'
                );

            });
            it('Second render (update)', () => {
                Inferno.render(template('foo'), container);
                expect(
                    container.innerHTML
                ).to.equal(
                    '<div id="foo">Hello, World</div>'
                );
            });
        });
	
	
	 describe('should set static styles', () => {
        let template = Inferno.createTemplate(() => ({
            tag: 'div',
            attrs: {
                style: {
                    width: 200,
                    height: 200
                }
            }
        }));

        it('Initial render (creation)', () => {
            Inferno.render(template(), container);
            expect(container.firstChild.hasAttribute('style')).to.be.true;
            expect(container.firstChild.getAttribute('style')).to.equal('width: 200px; height: 200px;')
            Inferno.render(template(), container);
            expect(container.firstChild.hasAttribute('style')).to.be.true;
            expect(container.firstChild.getAttribute('style')).to.equal('width: 200px; height: 200px;')

        });
        it('Second render (update)', () => {
            Inferno.render(template(), container);
            expect(container.firstChild.hasAttribute('style')).to.be.true;
            expect(container.firstChild.getAttribute('style')).to.equal('width: 200px; height: 200px;')
            Inferno.render(template(), container);
            expect(container.firstChild.hasAttribute('style')).to.be.true;
            expect(container.firstChild.getAttribute('style')).to.equal('width: 200px; height: 200px;')

        });
    });
	
	describe('should set and remove styles', () => {
        let template;

        template = Inferno.createTemplate((styleRule) =>
            createElement('div', {
                style: styleRule
            })
        );

        it('Initial render (creation)', () => {
            Inferno.render(template({
                width: 7
            }), container);
            expect(container.firstChild.hasAttribute('style')).to.be.true;
            expect(container.firstChild.getAttribute('style')).to.equal('width: 7px;');
        });
        it('Second render (update)', () => {
            Inferno.render(template({
                width: 8
            }), container);

            expect(container.firstChild.hasAttribute('style')).to.be.true;
            expect(container.firstChild.getAttribute('style')).to.equal('width: 8px;');
            Inferno.render(template({
                width: 8
            }), container);
            expect(container.firstChild.hasAttribute('style')).to.be.true;
            expect(container.firstChild.getAttribute('style')).to.equal('width: 8px;');
        });
        it('Third render (update)', () => {
            Inferno.render(template(null), container);
            expect(container.firstChild.hasAttribute('style')).to.be.false;
        });
    });
	
	
	 describe('should render styling on root node, and set and remove styling on multiple children', () => {
        let template;

        template = Inferno.createTemplate((styleRule) =>
            createElement('div', {
                style: {
                    width: '200px'
                }
            }, createElement('div', {
                class: 'Hello, world!'
            }, createElement('div', {
                style: styleRule
            })))
        );

        it('Initial render (creation)', () => {
            Inferno.render(template({
                color: "red",
                padding: 10
            }), container);

            expect(
                container.innerHTML
            ).to.equal(
                '<div style="width: 200px;"><div class="Hello, world!"><div style="color: red; padding: 10px;"></div></div></div>'
            );
            Inferno.render(template({
                color: "red",
                padding: 10
            }), container);

            expect(
                container.innerHTML
            ).to.equal(
                '<div style="width: 200px;"><div class="Hello, world!"><div style="color: red; padding: 10px;"></div></div></div>'
            );

        });
        it('Second render (update)', () => {
            Inferno.render(template(null), container);

            expect(
                container.innerHTML
            ).to.equal(
                '<div style="width: 200px;"><div class="Hello, world!"><div></div></div></div>'
            );
        });
        it('Third render (update)', () => {
            Inferno.render(template({
                color: "blue",
                margin: 20
            }), container);

            expect(
                container.innerHTML
            ).to.equal(
                '<div style="width: 200px;"><div class="Hello, world!"><div style="color: blue; margin: 20px;"></div></div></div>'
            );
        });
    });
	
	
	 describe('should update a div it class attribute, and dynamic children with static text', () => {

            const template = Inferno.createTemplate((child) => ({
                tag: 'div',
                attrs: {
                    class: 'hello, world'
                },
                children: child
            }));


            it('first render - creation', () => {

                const b = Inferno.createTemplate(() => ({
                    tag: 'span',
                    children: ['1', '2', '3', ]
                }));

                const span = Inferno.createTemplate((b) => ({
                    tag: 'span',
					
					// Dominic! If 'b' is null, it should still create a span child and return. It doesn't!
					
                    children: b
                }));

                Inferno.render(template(span(b())), container);
                
				// THIS IS CORRECT
                
				expect(container.firstChild.nodeType).to.equal(1);
                expect(container.firstChild.firstChild.childNodes.length).to.equal(1);
                expect(container.firstChild.firstChild.firstChild.childNodes.length).to.equal(3);
                expect(container.firstChild.tagName).to.equal('DIV');
				
                // STUDY THIS - I'm putting 'null' on the span() func. Meaning the span should have been a child, right?

				Inferno.render(template(span(null)), container);

                expect(container.innerHTML).to.equal('<div class="hello, world"><span></span></div>');

                // span is not NULL, should have been created as 1 child

                expect(container.firstChild.childNodes.length).to.equal(1);
                expect(container.firstChild.tagName).to.equal('DIV');
                expect(container.firstChild.firstChild.tagName).to.equal('SPAN'); // Where is the SPAN ??
				
            });
			
			it('second render - update', () => {

                const b = Inferno.createTemplate(() => ({
                    tag: 'circle',
                    children: ['1', '3', '1', ]
                }));

                const span = Inferno.createTemplate((b) => ({
                    tag: 'svg',
                    children: b
                }));

                Inferno.render(template(span(b())), container);

                expect(container.firstChild.nodeType).to.equal(1);
                expect(container.firstChild.childNodes.length).to.equal(1);
                expect(container.firstChild.firstChild.firstChild.childNodes.length).to.equal(3);
                expect(container.firstChild.tagName).to.equal('DIV');

            });

            it('Third render - update', () => {

                const b = Inferno.createTemplate(() => ({
                    text: 5467
                }));

                const span = Inferno.createTemplate((b) => ({
                    tag: 'a',

                    attrs: {
                        id: 'fooBar',
						className: 'foo'
                    },

                    children: b
                }));

                Inferno.render(template(span(b())), container);

                expect(container.firstChild.nodeType).to.equal(1);
                expect(container.firstChild.tagName).to.equal('DIV');
                expect(container.firstChild.childNodes.length).to.equal(1);
				expect(container.firstChild.firstChild.getAttribute('id')).to.equal('fooBar');
				expect(container.firstChild.firstChild.textContent).to.equal('123');				
								
				  Inferno.render(template(span(b())), container);

                expect(container.firstChild.nodeType).to.equal(1);
                expect(container.firstChild.tagName).to.equal('DIV');
                expect(container.firstChild.childNodes.length).to.equal(1);
				expect(container.firstChild.firstChild.getAttribute('id')).to.equal('fooBar');
				expect(container.firstChild.firstChild.getAttribute('class')).to.equal('foo');
				expect(container.firstChild.firstChild.textContent).to.equal('5467');				

            });
			
  });
	
});