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
            expect(container.firstChild.innerHTML).to.equal('<div><span></span></div>');

            Inferno.render(template(span(null, undefined)), container);
            expect(container.firstChild.innerHTML).to.equal('<div><span></span></div>' );

            Inferno.render(template(), container);
            expect(container.firstChild.innerHTML).to.equal('<div></div>');

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
            expect(container.firstChild.innerHTML).to.equal('<div></div>');

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
              '<select multiple="multiple"><option value="foo">foo</option><option value="bar">bar</option></select>'
            );
            Inferno.render(template('foo'), container);
            expect(container.firstChild.children[0].selected).to.eql(true); // SHOULD BE TRUE
            expect(container.firstChild.children[1].selected).to.eql(false);
            expect(
                container.innerHTML
            ).to.equal(
              '<select multiple="multiple"><option value="foo">foo</option><option value="bar">bar</option></select>'
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
              '<select multiple="multiple"><option value="foo" selected="selected">foo</option><option value="bar">bar</option></select>'
            );
        });
    });

    it('should properly render class attribute', () => {
        let template = Inferno.createTemplate((arg) =>
            createElement('div', {
                class: arg
            })
        );

            Inferno.render(template('muffins'), container);
            expect(container.firstChild.getAttribute('class')).to.eql('muffins');
            expect(
                container.innerHTML
            ).to.equal(
                '<div class="muffins"></div>'
            );
           Inferno.render(template(), container);
            expect(container.firstChild.getAttribute('class')).to.be.null;
            expect(
                container.innerHTML
            ).to.equal(
                '<div></div>'
            );

            Inferno.render(template(null), container);
            expect(container.firstChild.getAttribute('class')).to.be.null;
            expect(
                container.innerHTML
            ).to.equal(
                '<div></div>'
            );

			 Inferno.render(template(null));
            expect(container.firstChild.getAttribute('class')).to.be.null;
            expect(
                container.innerHTML
            ).to.equal(
                '<div></div>'
            );

			Inferno.render(template(null), null);
            expect(container.firstChild.getAttribute('class')).to.be.null;
            expect(
                container.innerHTML
            ).to.equal(
                '<div></div>'
            );

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
                '<div class="false"></div>'
            );

			 Inferno.render(template([]), container);
            expect(
                container.innerHTML
            ).to.equal(
                 '<div></div>'
            );
            Inferno.render(template({}), container);
            expect(
                container.innerHTML
            ).to.equal(
               '<div class="[object Object]"></div>'
            );
            Inferno.render(template(null), container);
            expect(
                container.innerHTML
            ).to.equal(
                '<div></div>'
            );
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
		   expect(container.firstChild.getAttribute('class')).to.equal(null);
           expect(container.firstChild.firstChild.firstChild.tagName).to.equal('SPAN');
		   expect(container.firstChild.firstChild.textContent).to.equal('');
		   expect(container.firstChild.firstChild.firstChild.textContent).to.equal('');


		   Inferno.render(template('yar1', 123, 'yar2', 'noo2', 'yar3', undefined), container);
		   expect(container.firstChild.firstChild.tagName).to.equal('DIV');
		   expect(container.firstChild.getAttribute('class')).to.equal('123');
           expect(container.firstChild.firstChild.firstChild.tagName).to.equal('SPAN');
		   expect(container.firstChild.firstChild.textContent).to.equal('');
		   expect(container.firstChild.firstChild.firstChild.textContent).to.equal('');

		   Inferno.render(template(null, null, null, null, null, null), container);
		   expect(container.firstChild.firstChild.tagName).to.equal('DIV');
		   expect(container.firstChild.getAttribute('class')).to.equal(null);
           expect(container.firstChild.firstChild.firstChild.tagName).to.equal('SPAN');
		   expect(container.firstChild.firstChild.textContent).to.equal('');
		   expect(container.firstChild.firstChild.firstChild.textContent).to.equal('');

		   Inferno.render(template(undefined, undefined, undefined, undefined, undefined, undefined), container);
		   expect(container.firstChild.firstChild.tagName).to.equal('DIV');
		   expect(container.firstChild.getAttribute('class')).to.equal(null);
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

    describe('should should handle root dynamic nodes', () => {
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
				divRef.element.outerHTML
			).to.eql('<div></div>');
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
            expect(container.innerHTML).to.equal('<div></div>');
        });

        it('third render - (update)', () => {
            const span = Inferno.createTemplate(() => ({
                tag: 'div'
            }));

            Inferno.render(template(span()), container);

            expect(container.firstChild.innerHTML).to.equal('<div></div>');
            Inferno.render(template(null), container);
            expect(container.innerHTML).to.equal('<div></div>');
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
                   '<div>The  is dead!</div>'
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
                    '<div>bar is is dead!</div>'
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
            expect(container.firstChild.hasAttribute('style')).to.be.false;
            expect(container.firstChild.getAttribute('style')).to.be.null;
            Inferno.render(template({
                width: undefined
            }), container);
            expect(container.firstChild.hasAttribute('style')).to.be.false;
            expect(container.firstChild.getAttribute('style')).to.be.null;
            Inferno.render(template({}), container);
            expect(container.firstChild.hasAttribute('style')).to.be.false;
            expect(container.firstChild.getAttribute('style')).to.be.null;

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
                paddingRight: 10
            }), container);

            expect(
                container.innerHTML
            ).to.equal(
	            '<div style="width: 200px;"><div class="Hello, world!"><div style="color: red; padding-right: 10px;"></div></div></div>'
            );
         /*    Inferno.render(template({
                color: "red",
                paddingRight: null
            }), container);

            expect(
                container.innerHTML
            ).to.equal(
	            '<div style="width: 200px;"><div class="Hello, world!"><div></div></div></div>'
            );

            Inferno.render(template({
                color: null,
                paddingLeft: 10
            }), container);

            expect(
                container.innerHTML
            ).to.equal(
	            '<div style="width: 200px;"><div class="Hello, world!"><div style="color: red;"></div></div></div>'
            );

            Inferno.render(template({
                color: null,
	            paddingLeft: null
            }), container);

            expect(
                container.innerHTML
            ).to.equal(
	            '<div style="width: 200px;"><div class="Hello, world!"><div style="color: red;"></div></div></div>'
            );

            Inferno.render(template(null), container);

            expect(
                container.innerHTML
            ).to.equal(
	            '<div style="width: 200px;"><div class="Hello, world!"><div style="color: red;"></div></div></div>'
            );*/

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
                marginLeft: 20
            }), container);

            expect(
                container.innerHTML
            ).to.equal(
	            '<div style="width: 200px;"><div class="Hello, world!"><div style="color: blue; margin-left: 20px;"></div></div></div>'
            );

            Inferno.render(template({
	            marginLeft: null
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
            expect(container.innerHTML).to.equal('<div class="hello, world"><span></span></div>');
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



    it('should render "select" boolean on select options with numbers', () => {

        const template = Inferno.createTemplate((val) => {
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

        Inferno.render(template(2), container);

        expect(container.firstChild.children[0].selected).to.eql(false);
        expect(container.firstChild.children[1].selected).to.eql(true);
         expect(
          container.innerHTML
        ).to.equal(
           '<select multiple="multiple"><option value="1">1</option><option value="2">2</option></select>'
         );

        Inferno.render(template(1), container);

        expect(container.firstChild.children[0].selected).to.eql(true);
        expect(container.firstChild.children[1].selected).to.eql(false);
        expect(
            container.innerHTML
        ).to.equal(
          '<select multiple="multiple"><option value="1">1</option><option value="2">2</option></select>'
        );
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

    });
});
