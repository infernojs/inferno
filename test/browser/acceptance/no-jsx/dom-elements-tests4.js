import Inferno from '../../../../src';
import get from '../../../tools/get';

const {
    createElement
} = Inferno.TemplateFactory;

describe('DOM element tests4 (no-jsx)', () => {
    let container;

    beforeEach(() => {
        container = document.createElement('div');
    });

    afterEach(() => {
        Inferno.render(null, container);
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

            Inferno.render(template(span(null, null)), container);
            expect(container.firstChild.innerHTML).to.equal('<div><span><span caught_fire="custom">Hello, world</span></span></div>');

            Inferno.render(template(span(null, undefined)), container);
            expect(container.firstChild.innerHTML).to.equal('<div><span><span caught_fire="custom">Hello, world</span></span></div>');

            Inferno.render(template(), container);
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

            const child1 = Inferno.createTemplate(() => ({
                tag: 'circle',
                children: {
                    tag: 'circle',
                    children: {
                        tag: 'g',
                        children: {
                            tag: 'g',
                            children: null

                        }
                    }
                }
            }));

            Inferno.render(template(child1()), container);
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
			
			const template1 = Inferno.createTemplate(function() {
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
                    }, {
                        tag: 'option',
                        attrs: {
                            value: 'zoo'
                        },
                        children: 'zoo'
                    }]

                };
            });
            Inferno.render(template1('zoo'), container);
            expect(container.firstChild.children[0].selected).to.eql(true);
            expect(container.firstChild.children[1].selected).to.eql(false);
            expect(
                container.innerHTML
            ).to.equal(
                '<select multiple="multiple"><option>foo</option><option>bar</option><option selected="selected">zoo</option></select>'
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

            Inferno.render(template(null), container);
            expect(container.firstChild.innerHTML).to.equal('<div class="Hello!"><span></span></div>');

            Inferno.render(template(undefined), container);
            expect(container.firstChild.innerHTML).to.equal('<div class="Hello!"><span></span></div>');

            Inferno.render(template(), container);
            expect(container.firstChild.innerHTML).to.equal('<div class="Hello!"><span></span></div>');

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

            Inferno.render(template(null), container);
            expect(container.firstChild.innerHTML).to.equal('');

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
           
		   // Ouch! Even with container, container as null etc it still find the 'class' attribute
            Inferno.render(template(null));
            expect(container.firstChild.getAttribute('class')).to.eql('I dont exist!!!');
            expect(
                container.innerHTML
            ).to.equal(
                '<div></div>'
            );

            Inferno.render(template(null), null);
            expect(container.firstChild.getAttribute('class')).to.eql('I dont exist!!!');
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

            Inferno.render(template(false), container);
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

            Inferno.render(template(null), container);
            expect(container.firstChild.children[0].selected).to.eql(false); // SHOULD BE TRUE
            expect(container.firstChild.children[1].selected).to.eql(false);
            expect(
                container.innerHTML
            ).to.equal(
                '<select multiple="multiple"><option>foo</option><option>bar</option></select>'
            );

            Inferno.render(template(), container);
            expect(container.firstChild.children[0].selected).to.eql(false); // SHOULD BE TRUE
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
            Inferno.render(template(''), container);
            expect(container.innerHTML).to.eql('');
            Inferno.render(template('abcd  '), container);
            expect(container.innerHTML).to.eql('abcd  ');


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
            Inferno.render(template(''), container);
            expect(container.innerHTML).to.eql('');
            Inferno.render(template(null), container);
            expect(container.innerHTML).to.eql('');
            Inferno.render(template(), container);
            expect(container.innerHTML).to.be.null;

        });
        it('Second render (update)', () => {

            Inferno.render(template('124'), container);
            expect(container.innerHTML).to.eql('124');

            Inferno.render(template('123'), container);
            expect(container.innerHTML).to.eql('123');

            Inferno.render(template(123), container);
            expect(container.innerHTML).to.eql('123');

            Inferno.render(template(null), container);
            expect(container.innerHTML).to.eql('');

            Inferno.render(template(), container);
            expect(container.innerHTML).to.eql('');

        });
        it('Third render (update)', () => {
            Inferno.render(template(undefined), container);
            expect(container.innerHTML).to.equal('');
            Inferno.render(template(null), container);
            expect(container.innerHTML).to.equal('');
            Inferno.render(template(), container);
            expect(container.innerHTML).to.equal('');
        });
        it('Fourth render (update)', () => {
            Inferno.render(template(null), container);
            expect(container.innerHTML).to.equal('');
            Inferno.render(template(), container);
            expect(container.innerHTML).to.be.null;
            Inferno.render(template(undefined), container);
            expect(container.innerHTML).to.equal('');
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
            Inferno.render(template(), container);
            expect(container.innerHTML).to.eql('');
            Inferno.render(template(null), container);
            expect(container.innerHTML).to.eql('');
        });
        it('Seventh render (update)', () => {
            expect(() => Inferno.render(template({}), container)).to.throw;
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

			Inferno.render(template(), container);

			expect(
				divRef.element
			).to.be.null;

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

                Inferno.render(template('Hello', ' poz', ' and ', 'Zoo  '), container);
                expect(
                    container.innerHTML
                ).to.equal(
                    '<div>Hello poz and Zoo  </div>'
                );
                
				Inferno.render(template('Hello', ' poz', ' and ', null), container);
                expect(
                    container.innerHTML
                ).to.equal(
                    '<div>Hello poz and </div>'
                );
            });
            it('Second render (update)', () => {
                Inferno.render(template('The ', 'bar', ' is', ' is dead!'), container);
                expect(
                    container.innerHTML
                ).to.equal(
                    '<div>The bar is is dead!</div>'
                );

                Inferno.render(template('The ', null, null, ' is dead!'), container);
                expect(
                    container.innerHTML
                ).to.equal(
                    '<div>The is dead!</div>'
                );

                Inferno.render(template('The ', 'bar ', null, ' is dead! '), container);
                expect(
                    container.innerHTML
                ).to.equal(
                    '<div>The bar  is dead! </div>'
                );

                Inferno.render(template(null, 'bar', ' is', ' is dead!'), container);
                expect(
                    container.innerHTML
                ).to.equal(
                    '<div> bar is is dead!</div>'
                );

                Inferno.render(template(null, null, null, ' is dead!'), container);
                expect(
                    container.innerHTML
                ).to.equal(
                    '<div> is dead!</div>'
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

                Inferno.render(template('Bar  '), container);
                expect(
                    container.innerHTML
                ).to.equal(
                    '<div id="Bar  ">Hello, World</div>'
                );

                Inferno.render(template(null), container);
                expect(
                    container.innerHTML
                ).to.equal(
                    '<div>Hello, World</div>'
                );

                Inferno.render(template(), container);
                expect(
                    container.innerHTML
                ).to.equal(
                    '<div>Hello, World</div>'
                );

                Inferno.render(null, container);
                expect(
                    container.innerHTML
                ).to.equal(
                    ''
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

                Inferno.render(template(), container);
                expect(
                    container.innerHTML
                ).to.equal(
                    '<div>Hello, World</div>'
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

			   Inferno.render(template(123), container);
                expect(
                    container.innerHTML
                ).to.equal(
                    '<div id="123">Hello, World</div>'
                );

			   Inferno.render(template(null), container); // should unset
                expect(
                    container.innerHTML
                ).to.equal(
                    '<div>Hello, World</div>'
                );

			   Inferno.render(template(), container); // should unset
                expect(
                    container.innerHTML
                ).to.equal(
                    '<div>Hello, World</div>'
                );

			   Inferno.render(template(undefined), container); // should unset
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
                Inferno.render(template(), container);
                expect(
                    container.innerHTML
                ).to.equal(
                    '<div>Hello, World</div>'
                );
                Inferno.render(template(null), container);
                expect(
                    container.innerHTML
                ).to.equal(
                    '<div>Hello, World</div>'
                );
                Inferno.render(template('foo'), container);
                expect(
                    container.innerHTML
                ).to.equal(
                    '<div id="foo">Hello, World</div>'
                );

                Inferno.render(template(), container);
                expect(
                    container.innerHTML
                ).to.equal(
                    '<div>Hello, World</div>'
                );

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
            Inferno.render(template({
                width: null
            }), container);
            expect(container.firstChild.hasAttribute('style')).to.be.null;
            expect(container.firstChild.getAttribute('style')).to.equal('');
            Inferno.render(template({
                width: undefined
            }), container);
            expect(container.firstChild.hasAttribute('style')).to.be.null;
            expect(container.firstChild.getAttribute('style')).to.equal('');
            Inferno.render(template({}), container);
            expect(container.firstChild.hasAttribute('style')).to.be.null;
            expect(container.firstChild.getAttribute('style')).to.equal('');

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


            Inferno.render(template(), container);
            expect(container.firstChild.hasAttribute('style')).to.be.false;
            expect(container.firstChild.getAttribute('style')).to.equal('');

            Inferno.render(template({
                width: 9
            }), container);
            expect(container.firstChild.hasAttribute('style')).to.be.true;
            expect(container.firstChild.getAttribute('style')).to.equal('width: 9px;');

        });
        it('Third render (update)', () => {
            Inferno.render(template(null), container);
            expect(container.firstChild.hasAttribute('style')).to.be.false;
            Inferno.render(template(), container);
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
                padding: null
            }), container);

            expect(
                container.innerHTML
            ).to.equal(
                '<div style="width: 200px;"><div class="Hello, world!"><div style="color: red;"></div></div></div>'
            );

            Inferno.render(template({
                color: null,
                padding: 10
            }), container);

            expect(
                container.innerHTML
            ).to.equal(
                '<div style="width: 200px;"><div class="Hello, world!"><div style="padding: 10px;"></div></div></div>'
            );

            Inferno.render(template({
                color: null,
                padding: null
            }), container);

            expect(
                container.innerHTML
            ).to.equal(
                '<div style="width: 200px;"><div class="Hello, world!"><div style=""></div></div></div>'
            );

            Inferno.render(template(null), container);

            expect(
                container.innerHTML
            ).to.equal(
                '<div style="width: 200px;"><div class="Hello, world!"><div></div></div></div>'
            );

        });
        it('Second render (update)', () => {
            Inferno.render(template(null), container);

            expect(
                container.innerHTML
            ).to.equal(
                '<div style="width: 200px;"><div class="Hello, world!"><div></div></div></div>'
            );

            Inferno.render(template(), container);

            expect(
                container.innerHTML
            ).to.equal(
                '<div style="width: 200px;"><div class="Hello, world!"><div></div></div></div>'
            );

            Inferno.render(template(undefined), container);

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

            Inferno.render(template({
                margin: null
            }), container);

            expect(
                container.innerHTML
            ).to.equal(
                '<div style="width: 200px;"><div class="Hello, world!"><div></div></div></div>'
            );

            Inferno.render(template({}), container);

            expect(
                container.innerHTML
            ).to.equal(
                '<div style="width: 200px;"><div class="Hello, world!"><div></div></div></div>'
            );

            Inferno.render(template(null), container);

            expect(
                container.innerHTML
            ).to.equal(
                '<div style="width: 200px;"><div class="Hello, world!"><div></div></div></div>'
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
                children: b
            }));

            Inferno.render(template(span(b())), container);
			expect(container.firstChild.nodeType).to.equal(1);
            expect(container.firstChild.firstChild.childNodes.length).to.equal(1);
            expect(container.firstChild.firstChild.firstChild.childNodes.length).to.equal(3);
            expect(container.firstChild.tagName).to.equal('DIV');

			Inferno.render(template(span(null)), container);
            expect(container.innerHTML).to.equal('<div class="hello, world"><span></span></div>');
            expect(container.firstChild.childNodes.length).to.equal(1);
            expect(container.firstChild.tagName).to.equal('DIV');
            expect(container.firstChild.firstChild.tagName).to.equal('SPAN');

			Inferno.render(template(span()), container);
            expect(container.innerHTML).to.equal('<div class="hello, world"></div>');
            expect(container.firstChild.childNodes.length).to.equal(1);
            expect(container.firstChild.tagName).to.equal('DIV');

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


            const bb = Inferno.createTemplate(() => ({
                tag: 'circle',
                children: ['1', '3', 1, ]
            }));

            const spann = Inferno.createTemplate((b) => ({
                tag: 'svg',
                children: b
            }));

            Inferno.render(template(spann(bb())), container);
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
			expect(container.firstChild.firstChild.textContent).to.equal('5467');

	        Inferno.render(template(span(b())), container);
            expect(container.firstChild.nodeType).to.equal(1);
            expect(container.firstChild.tagName).to.equal('DIV');
            expect(container.firstChild.childNodes.length).to.equal(1);
			expect(container.firstChild.firstChild.getAttribute('id')).to.equal('fooBar');
			expect(container.firstChild.firstChild.getAttribute('class')).to.equal('foo');
			expect(container.firstChild.firstChild.textContent).to.equal('5467');
        });
    });
	
	
	 describe('should render "select" boolean on select options with numbers', () => {

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
                        value: 1
                    },
                    children: 1
                }, {
                    tag: 'option',
                    attrs: {
                        value: 2
                    },
                    children: 2
                }]
            };
        });

        it('Initial render (creation)', () => {

            Inferno.render(template(2), container);

            expect(container.firstChild.children[0].selected).to.eql(false);
            expect(container.firstChild.children[1].selected).to.eql(true);
            expect(
                container.innerHTML
            ).to.equal(
                '<select multiple="multiple"><option>1</option><option>2</option></select>'
            );

            Inferno.render(template(2), container);

            expect(container.firstChild.children[0].selected).to.eql(false);
            expect(container.firstChild.children[1].selected).to.eql(true);
            expect(
                container.innerHTML
            ).to.equal(
                '<select multiple="multiple"><option>1</option><option>2</option></select>'
            );
            
			Inferno.render(template(null), container);
			
            expect(container.firstChild.children[0].selected).to.eql(false);
            expect(container.firstChild.children[1].selected).to.eql(false);
            expect(
                container.innerHTML
            ).to.equal(
                '<select multiple="multiple"><option>1</option><option>2</option></select>'
            );

			Inferno.render(template([1, null]), container);
			
            expect(container.firstChild.children[0].selected).to.eql(true);// SHOULD BE TRUE
            expect(container.firstChild.children[1].selected).to.eql(false);
            expect(
                container.innerHTML
            ).to.equal(
                '<select multiple="multiple"><option>1</option><option>2</option></select>'
            );

        });

        it('Second render ( update)', () => {

            Inferno.render(template(1), container);
            expect(container.firstChild.children[0].selected).to.eql(true );// SHOULD BE TRUE
            expect(container.firstChild.children[1].selected).to.eql(false);
            expect(
                container.innerHTML
            ).to.equal(
                '<select multiple="multiple"><option>1</option><option>2</option></select>'
            );
			
			Inferno.render(template([1, null]), container);
			
            expect(container.firstChild.children[0].selected).to.eql(true); // SHOULD BE TRUE
            expect(container.firstChild.children[1].selected).to.eql(false);
            expect(
                container.innerHTML
            ).to.equal(
                '<select multiple="multiple"><option>1</option><option>2</option></select>'
            );
			
			Inferno.render(template([null, null]), container);
			
            expect(container.firstChild.children[0].selected).to.eql(true); 
            expect(container.firstChild.children[1].selected).to.eql(false);
            expect(
                container.innerHTML
            ).to.equal(
                '<select multiple="multiple"><option>1</option><option>2</option></select>'
            );

			Inferno.render(template(2), container);
			
            expect(container.firstChild.children[0].selected).to.eql(false); 
            expect(container.firstChild.children[1].selected).to.eql(true);
            expect(
                container.innerHTML
            ).to.equal(
                '<select multiple="multiple"><option>1</option><option>2</option></select>'
            );

        });


        it('Third render ( update)', () => {

            Inferno.render(template('bdddd'), container);
            expect(container.firstChild.children[0].selected).to.eql(false);
            expect(container.firstChild.children[1].selected).to.eql(false);
            expect(
                container.innerHTML
            ).to.equal(
                '<select multiple="multiple"><option>1</option><option>2</option></select>'
            );

            Inferno.render(template(), container);
            expect(container.firstChild.children[0].selected).to.eql(false);
            expect(container.firstChild.children[1].selected).to.eql(false);
            expect(
                container.innerHTML
            ).to.equal(
                '<select multiple="multiple"><option>1</option><option>2</option></select>'
            );

        });

        it('Forth render ( update)', () => {

            Inferno.render(template(null), container);
            expect(container.firstChild.children[0].selected).to.eql(false);
            expect(container.firstChild.children[1].selected).to.eql(false);
            expect(
                container.innerHTML
            ).to.equal(
                '<select multiple="multiple"><option>1</option><option>2</option></select>'
            );

            Inferno.render(template(undefined), container);
            expect(container.firstChild.children[0].selected).to.eql(false);
            expect(container.firstChild.children[1].selected).to.eql(false);
            expect(
                container.innerHTML
            ).to.equal(
                '<select multiple="multiple"><option>1</option><option>2</option></select>'
            );

            Inferno.render(template(), container);
            expect(container.firstChild.children[0].selected).to.eql(false);
            expect(container.firstChild.children[1].selected).to.eql(false);
            expect(
                container.innerHTML
            ).to.equal(
                '<select multiple="multiple"><option>1</option><option>2</option></select>'
            );

        });
    });

       it('should render a div with static child and dynamic attribute', () => {

            const div = Inferno.createTemplate((val) => ({
                tag: 'div',
                attrs: val,
                children: {
                    tag: 'span',
                    attrs: val
                }
            }));

                Inferno.render(div({
                    id: 'id#1'
                }), container);
                expect(container.firstChild.childNodes.length).to.equal(1);
                expect(container.firstChild.getAttribute('id')).to.equal('id#1');

                Inferno.render(div({
                    id: 'id#2'
                }), container);
                expect(container.firstChild.childNodes.length).to.equal(1);
                expect(container.firstChild.getAttribute('id')).to.equal('id#2');

                Inferno.render(div(null), container);
                expect(container.firstChild.childNodes.length).to.equal(1);
                expect(container.firstChild.getAttribute('id')).to.be.null;

                Inferno.render(div(undefined), container);
                expect(container.firstChild.childNodes.length).to.equal(1);
                expect(container.firstChild.getAttribute('id')).to.be.null;

                Inferno.render(div([]), container);
                expect(container.firstChild.childNodes.length).to.equal(1);
                expect(container.firstChild.getAttribute('id')).to.be.null;
        });
		
		
		it('should render root node without children and with dynamic attrs', () => {
         
		    let template = Inferno.createTemplate((attrs) => ({
					tag:'div',
                    attrs: attrs
                }));

                Inferno.render(template({id:'test'}), container);
				expect(container.firstChild.getAttribute('id')).to.equal('test');

                Inferno.render(template({id:'blablabla'}), container);
				
				expect(container.firstChild.getAttribute('id')).to.equal('blablabla');

                Inferno.render(template({id:'tralala'}), container);
				expect(container.firstChild.getAttribute('id')).to.equal('tralala');

                Inferno.render(template(null), container);
				expect(container.firstChild.getAttribute('id')).to.be.null;

                Inferno.render(template({id:null}), container);
				expect(container.firstChild.getAttribute('id')).to.be.null;

                Inferno.render(template({id:undefined}), container);
				expect(container.firstChild.getAttribute('id')).to.be.null;

                Inferno.render(template(undefined), container);
				expect(container.firstChild.getAttribute('id')).to.be.null;

                Inferno.render(template([]), container);
				expect(container.firstChild.getAttribute('id')).to.be.null;
        });
});