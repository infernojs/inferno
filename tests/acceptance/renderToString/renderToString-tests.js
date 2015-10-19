/** @jsx t */

export default function virtualElementsTests(describe, expect, Inferno) {

let tests = [{
            name: 'should render simple HTML',
            tag: 'span',
            literal: null,
            children: null,
            expected: '<span></span>',
        }, {
            name: 'should render a element tag',
            tag: 'div',
            literal: null,
            children:  null,
            expected: '<div></div>',
        }, {
            name: 'should render inner text',
            tag: 'div',
            literal: null,
            children: 'Test',
            expected: '<div>Test</div>',
        }, {
            name: 'should render a tag containing a child tag',
            tag: 'div',
            literal: {
                class:'parent'
            },
            children: Inferno.renderToString('span', {class:'child'}),
            expected: '<div class="parent"><span class="child"></span></div>',
        }, {
            name: 'should render a tag containing a child tag with text',
            tag: 'div',
            literal: {
                class:'parent'
            },
            children: Inferno.renderToString('span', {class:'child'}, 'Test'),
            expected: '<div class="parent"><span class="child">Test</span></div>',
        }, {
            name: 'should convert properties to attributes',
            tag: 'form',
            literal: {
                className: 'login',
                acceptCharset: 'ISO-8859-1',
                accessKey: 'h' // prop to lower case
            },
            children: null,
            expected: '<form class="login" accept-charset="ISO-8859-1" accessKey="h"></form>',
        }, {
            name: 'should render "class" correctly as attribute',
            tag: 'input',
            literal: {
                    'class': 'foo bar'
            },
            children: null,
            expected: '<input class="foo bar"/>',
        }, {
            name: 'should not render end tags for void elements',
            tag: 'input',
            literal: null,
            children: null,
            expected: '<input/>',
        }, {
            name: 'should render innerHTML',
            tag: 'div',
            literal: { innerHTML: 'Hello, World!' },
            children: null,
            expected: '<div>Hello, World!</div>',
        }, {
            name: 'should render innerHTML with escaped markup',
            tag: 'div',
            literal: { innerHTML: '<&/>' },
            children: null,
            expected: '<div>&lt;&amp;/&gt;</div>',
        }, {
            name: 'should render accept-charset correctly as the acceptCharset property',
            tag: 'form',
            literal: {
                acceptCharset: 'ISO-8859-1'
            },
            children: null,
            expected: '<form accept-charset="ISO-8859-1"></form>',
        }, {
            name: 'should render a custom method for key',
            tag: 'div',
            literal: {
                key: 1
            },
            children: 'Test',
            expected: '<div key="1">Test</div>',
        }, {
            name: 'should render non-standard attributes',
            tag: 'input',
            literal: {
                        'aria-labelledby': 'foobar',
                        'data-foo': 'bar',
                        'custom-thing': 'baz',
                        'fooBar': 'barFoo'
                    },
            children: null,
            expected: '<input aria-labelledby="foobar" data-foo="bar" custom-thing="baz" fooBar="barFoo"/>',
        }, {
            name: 'should render non-boolean standard attributes',
            tag: 'input',
            literal: {
                width: '10'
            },
            children: null,
            expected: '<input width="10"/>',
        }, {
            name: 'should render http-equiv correctly as the httpEquiv property',
            tag: 'meta',
            literal: {
               httpEquiv: 'refresh'
            },
            children: null,
            expected: '<meta http-equiv="refresh"/>',
        }, {
            name: 'should not render end tags for void elements',
            tag: 'input',
            literal: null,
            children: null,
            expected: '<input/>',
        }, {
            name: 'should render numeric attributes',
            tag: 'ol',
            literal: {
                start: 10
            },
            children: null,
            expected: '<ol start="10"></ol>',
        }, {
            name: 'should not render "null" elements',
            tag: 'web-component',
            literal: {
                'className': null,
                'id': null

            },
            children: null,
            expected: '<web-component></web-component>',
        }, {
            name: 'should render boolean properties',
            tag: 'input',
            literal: {
                autofocus: true,
                disabled: false
            },
            children: null,
            expected: '<input autoFocus="false" disabled="false"/>',
        }, {
            name: 'should render overloaded boolean properties',
            tag: 'a',
            literal: {
                href: '/images/xxx.jpg',
                download: 'sfw'
            },
            children: null,
            expected: '<a href="/images/xxx.jpg" download="sfw"></a>',
        }, {
            name: 'should render attributes that need html entity decoding',
            tag: 'div',
            literal: {
                title: 'ä',
                placeholder: 'ü',
                alt: 'ö'
            },
            children: null,
            expected:  '<div title="ä" placeholder="ü" alt="ö"></div>',
        }, {
            name: 'should render any attributes',
            tag: 'circle',
            literal: {
                cx: '60',
                cy: '60',
                r: '50'
            },
            children: null,
            expected: '<circle cx="60" cy="60" r="50"/>',
        }, {
            name: 'should render "scoped" boolean attributes',
            tag: 'a',
            literal: {
                href: '/images/xxx.jpg',
                scoped: true
            },
            children: null,
            expected: '<a href="/images/xxx.jpg" scoped="false"></a>',
        },
        {
            name: 'should correctly render a div with one style without trailing semicolon',
            tag: 'div',
            literal: {
                style: {
                    top: '-7px'
                }
            },
            children: null,
            expected: '<div style="top:-7px;"></div>',
        },
        {
            name: 'should render a style attribute with string values',
            tag: 'div',
            literal: {
                style: {
                    border: '1px solid rgb(0, 0, 0)',
                    padding: '2px'
                }
            },
            children: null,
            expected: '<div style="border:1px solid rgb(0, 0, 0);padding:2px;"></div>',
        }, 
		{
            name: 'should render a style, and auto-add unit',
            tag: 'div',
            literal: {
                style: {
                    width: 200,
                    height: 200
                }
            },
            children: null,
            expected: '<div style="width:200px;height:200px;"></div>',
        }, 
		{
            name: 'should render a div with one style with a number value and auto-set unit (px)',
            tag: 'div',
            literal: {
                style: {
                    top: 7
                }
            },
            children: null,
            expected: '<div style="top:7px;"></div>',
        }, 
		{
            name: 'should render nested children',
            tag: 'div',
            literal: {
            href: '/images/xxx.jpg',
            download: 'sfw'
        },
            children: Inferno.renderToString('div', {
            id: 'a-div'
        }, Inferno.renderToString('div', null, 'HI!')),
            expected: '<div href="/images/xxx.jpg" download="sfw"><div id="a-div"><div>HI!</div></div></div>',
        }, 
		{
            name: 'should render a div with one style with a number value and auto-set unit (px)',
            tag: 'div',
            literal: {
                style: {
                    top: 7
                }
            },
            children: null,
            expected: '<div style="top:7px;"></div>',
        }, 
		{
            name: 'should render tag in lowercase',
            tag: 'SPAN',
            literal: null,
            children: 'hello',
            expected: '<span>hello</span>',
        }, 
		{
            name: 'should preserve UTF-8 entities and escape special html characters',
            tag: 'span',
            literal: null,
            children: '测试&\"\'<>',
            expected: '<span>测试&"\'<></span>',
        }, 
		{
            name: 'should render svg with attributes in default namespace',
            tag: 'svg',
            literal:  {
            viewBox: '0 0 10 10'
        },
            children: null,
            expected: '<svg viewBox="0 0 10 10"></svg>',
        },
		{
            name: 'should render svg with pre-set xmlns attribute',
            tag: 'svg',
            literal:  {
            xmlns: 'batig batasan',
            viewBox: '0 0 10 10'
        },
            children: null,
            expected: '<svg xmlns="batig batasan" viewBox="0 0 10 10"></svg>',
        },
		{
            name: 'should escape html',
            tag: 'span',
            literal: null,
            children: '<&/>',
            expected: '<span><&/></span>',
        },
		{
            name: 'should render div with multiple text values',
            tag: 'div',
            literal: null,
            children: ['bilat', 'nimo'],
            expected: '<div> bilat nimo</div>',
        },
		{
            name: 'should render div with multiple number values',
            tag: 'div',
            literal: null,
            children: [1, 2, 3],
            expected:  '<div> 1 2 3</div>',
        },
		{
            name: 'should render div with esacped HTML as an array',
            tag: 'div',
            literal: null,
            children: [ '<&/>'],
            expected: '<div>&lt;&amp;/&gt;</div>',
        },
		{
            name: 'should render div with esacped HTML as an array',
            tag: 'div',
            literal: null,
            children: [ '<&/>', 'Hello, World!', 123],
            expected: '<div> <&/> Hello, World! 123</div>',
        },
		{
            name: 'should properly render textarea value',
            tag: 'textarea',
            literal: {
			value: 'val'
			},
            children: null,
            expected: '<textarea>val</textarea>',
        },
		{
            name: 'should properly render textarea value',
            tag: 'textarea',
            literal: {
			value: 123
			},
            children: null,
            expected: '<textarea>123</textarea>',
        },
		{
            name: 'should properly render textarea value and escape HTML',
            tag: 'textarea',
            literal: {
			value: '<&/>'
			},
            children: null,
            expected: '<textarea>&lt;&amp;/&gt;</textarea>',
        },
		{
            name: 'should be rendered properly for boolean attribues',
            tag: 'input',
            literal: {
            checked: true,
            disabled: true
        },
            children: null,
            expected: '<input checked="false" disabled="true"/>',
        },
		{
            name: 'should be rendered properly for boolean attribues',
            tag: 'input',
            literal: {
            enabled: 'enabled',
        },
            children: null,
            expected: '<input enabled="enabled"/>',
        },
		{
            name: 'should overwrite existing children for textarea element',
            tag: 'textarea',
            literal: {
			value: 'val'
			},
            children: ['hello'],
            expected: '<textarea>val</textarea>',
        },
		{
            name: 'should render "onMouse" as an alert message',
            tag: 'div',
            literal: {
			onClick: 'alert("I\'m a mouse!");'
			},
            children: ['hello'],
            expected: '<div onClick="alert(&quot;I\'m a mouse!&quot;);">hello</div>',
        },
		{
            name: 'should render "onClick" as an alert message',
            tag: 'div',
            literal: {
			onClick: 'alert("Hello world");window.close();'
			},
            children: ['hello'],
            expected: '<div onClick="alert(&quot;Hello world&quot;);window.close();">hello</div>',
        },
		{
            name: 'should render "onClick" as an callable function',
            tag: 'div',
            literal: {
			onClick: 'callMeNow();'
			},
            children: ['hello'],
            expected: '<div onClick="callMeNow();">hello</div>',
        },
		{
            name: 'should render "onClick" as a set of two inline functions',
            tag: 'div',
            literal: {
			onClick: 'doThisFunction();thenDoTheOtherFunction();'
			},
            children: ['hello'],
            expected: '<div onClick="doThisFunction();thenDoTheOtherFunction();">hello</div>',
        },
		{
            name: 'should render a div with 1 style correctly',
            tag: 'div',
            literal: {
			   style: {
                top: '-7px'
            }
			},
            children: null,
            expected: '<div style="top:-7px;"></div>',
        },
		{
            name: 'should render a div with styles correctly',
            tag: 'div',
            literal: {
			   style: {
                top: '-7px',
                left: '-6px',
                background: 'rgb(0,0,132)'
            }
			},
            children: null,
            expected:  '<div style="top:-7px;left:-6px;background:rgb(0,0,132);"></div>',
        },
		{
            name: 'should render a div with styles correctly when spaces are abundant',
            tag: 'div',
            literal: {
			   style: {
                top: '-7px',
                left: '-6px',
                background: 'rgb( 0 , 0 , 132 )'
            }
			},
            children: null,
            expected: '<div style="top:-7px;left:-6px;background:rgb( 0 , 0 , 132 );"></div>',
        },
		{
            name: 'should properly render XML, XLink and XPointer',
            tag: 'homepages',
            literal: {
			  'xmlns:xlink': 'http://www.w3.org/1999/xlink'
			},
            children: [Inferno.renderToString('homepages', { 'xlink:type': 'simple', 'xlink:href':'http://www.inferno.org'}, 'Inferno'), 'Test'],
            expected: '<homepages xmlns:xlink="http://www.w3.org/1999/xlink"> <homepages xlink:type="simple" xlink:href="http://www.inferno.org">Inferno</homepages> Test</homepages>',
        }
    ]


    tests.forEach((test) => {
        it(test.name, () => {

            expect(Inferno.renderToString(test.tag, test.literal, test.children)).to.eql(test.expected);
        });
    });

    // TODO ! Convert to an array

   

   
    it('should render input value', () => {
        expect(Inferno.renderToString('input', {
            type: 'submit',
            value: 'add'
        })).to.eql('<input type="submit" value="add"/>');
    });



    it('should render "disabled" boolean attributes as "disabled"', () => {
        expect(Inferno.renderToString('div', {
            disabled: 'disabled'
        })).to.eql('<div disabled="disabled"></div>');
    });

    it('should render "disabled" boolean attribute', () => {
        expect(Inferno.renderToString('div', {
            disabled: true
        })).to.eql('<div disabled="true"></div>');
    });

    it('should render "disabled" boolean attributes as "disabled"', () => {
        expect(Inferno.renderToString('div', {
            disabled: 'disabled'
        })).to.eql('<div disabled="disabled"></div>');
    });

    it('should not set "disabled" boolean attributes with a "false" value', () => {
        expect(Inferno.renderToString('div', {
            disabled: false
        })).to.eql('<div disabled="false"></div>');
    });

    it('should render "disabled" boolean attributes as "disabled"', () => {
        expect(Inferno.renderToString('div', {
            disabled: 'disabled'
        })).to.eql('<div disabled="disabled"></div>');
    });

    it('should not render a undefined value', () => {
        expect(Inferno.renderToString('input', {
            className: undefined
        })).to.eql('<input/>');
    });

    it('should not be rendered if boolean attribute is false', () => {
        expect(Inferno.renderToString('input', {
            checked: false
        })).to.eql('<input checked="false"/>');
    });

    it('should render custom attributes', () => {
        expect(Inferno.renderToString('input', {
            'custom-attr': 123
        })).to.eql('<input custom-attr="123"/>');
    });

    it('should not render null properties', () => {
        expect(Inferno.renderToString('web-component', {
            className: null,
            id: null
        })).to.eql('<web-component></web-component>');
    });

    it('should not render null properties', () => {
        expect(Inferno.renderToString('input', {
            style: {
                background: 'black',
                color: 'red',
                zIndex: '1'
            }
        })).to.eql('<input style="background:black;color:red;z-index:1;"/>');
    });

    it('should not set empty style values', () => {
        expect(Inferno.renderToString('input', {
            style: {
                background: ''
            }
        })).to.eql('<input style="background:;"/>');
    })

    it('should render overloaded boolean as a number value', () => {
        expect(Inferno.renderToString('a', {
            download: 0
        })).to.eql('<a download="0"></a>');
    });

    it('should render download with boolean false value', () => {
        expect(Inferno.renderToString('a', {
            href: '/images/xxx.jpg',
            download: 'false'
        })).to.eql('<a href="/images/xxx.jpg" download="false"></a>');
    });

    it('should render download with boolean null value', () => {
        expect(Inferno.renderToString('a', {
            href: '/images/xxx.jpg',
            download: null
        })).to.eql('<a href="/images/xxx.jpg"></a>');
    });


let renderToString = Inferno.renderToString;

 it('should support server-side rendering with multiple - no array', () => {

        const markup = renderToString('select', {
                multiple: true,
                value: 'bar'
            },
            renderToString('option', {
                value: 'foo'
            }, 'Im a li-tag'),
            renderToString('option', {
                value: 'bar'
            }, 'Im a li-tag'),
            renderToString('option', {
                value: 'zooba'
            }, 'Im a li-tag'));


        let expected = '<select multiple="true" value="bar">';
        expected += '<option value="foo">Im a li-tag</option>';
        expected += '<option value="bar" selected="selected">Im a li-tag</option>';
        expected += '<option value="zooba">Im a li-tag</option>';
        expected += '</select>';

        expect(markup).to.eql(expected);
    });
	
	 it('should support server-side rendering with multiple - no array & number values', () => {

        const markup = renderToString('select', {
                multiple: true,
                value: 1
            },
            renderToString('option', {
                value: 1
            }, 'Im a li-tag'),
            renderToString('option', {
                value: 2
            }, 'Im a li-tag'),
            renderToString('option', {
                value: 3
            }, 'Im a li-tag'));


        let expected = '<select multiple="true" value="1">';
        expected += '<option value="1" selected="selected">Im a li-tag</option>';
        expected += '<option value="2">Im a li-tag</option>';
        expected += '<option value="3">Im a li-tag</option>';
        expected += '</select>';

        expect(markup).to.eql(expected);
    });

    it('should support server-side rendering with multiple - array & number values', () => {

        const markup = renderToString('select', {
                multiple: true,
                value: [1, 3]
            },
            renderToString('option', {
                value: 1
            }, 'Im a li-tag'),
            renderToString('option', {
                value: 2
            }, 'Im a li-tag'),
            renderToString('option', {
                value: 3
            }, 'Im a li-tag'));

        let expected = '<select multiple="true" value="1,3">';
        expected += '<option value="1" selected="selected">Im a li-tag</option>';
        expected += '<option value="2">Im a li-tag</option>';
        expected += '<option value="3" selected="selected">Im a li-tag</option>';
        expected += '</select>';

        expect(markup).to.eql(expected);
    });

    it('should support server-side rendering with multiple - array & double selection', () => {

        const markup = renderToString('select', {
                multiple: 'multiple',
                value: ['bar', 'zooba']
            },
            renderToString('option', {
                value: 'foo',
                key: 'fooBar'
            }, 'Im a li-tag'),
            renderToString('option', {
                value: 'bar'
            }, 'Im a li-tag'),
            renderToString('option', {
                value: 'zooba'
            }, 'Im a li-tag'));

        let expected = '<select multiple="multiple" value="bar,zooba">';
        expected += '<option value="foo" key="fooBar">Im a li-tag</option>';
        expected += '<option value="bar" selected="selected">Im a li-tag</option>';
        expected += '<option value="zooba" selected="selected">Im a li-tag</option>';
        expected += '</select>';

        expect(markup).to.eql(expected);

    });

    it('should support server-side rendering with multiple - no array', () => {

        const markup = renderToString('select', {
                multiple: true,
                value: 'giraffe'
            },
            renderToString('option', {
                value: 'monkey'
            }, 'A monkey'),
            renderToString('option', {
                value: 'giraffe'
            }, 'A giraffe'),
            renderToString('option', {
                value: 'gorila'
            }, 'A gorila'));


        let expected = '<select multiple="true" value="giraffe">';
        expected += '<option value="monkey">A monkey</option>';
        expected += '<option value="giraffe" selected="selected">A giraffe</option>';
        expected += '<option value="gorila">A gorila</option>';
        expected += '</select>';

        expect(markup).to.eql(expected);
    });

    it('should render a select', () => {

        const markup = renderToString('select', {

                value: 'bar'
            },
            renderToString('option', {
                value: 'foo'
            }, 'foo'),
            renderToString('option', {
                value: 'bar'
            }, 'bar'));

        let expected = '<select value="bar">';
        expected += '<option value="foo">foo</option>';
        expected += '<option value="bar" selected="selected">bar</option>';
        expected += '</select>';

        expect(markup).to.eql(expected);
    });

    it('should support server-side rendering with select using groups', () => {

        const markup = renderToString('select', {
                value: ['foo', 'bar']
            },
            renderToString('optgroup', {
                label: 'foo-group'
            }, renderToString('option', {
                value: 'foo'
            }, 'foo')),
            renderToString('optgroup', {
                label: 'bar-group'
            }, renderToString('option', {
                value: 'bar'
            }, 'bar')));

        let expected = '<select value="foo,bar">';
        expected += '<optgroup label="foo-group"><option value="foo" selected="selected">foo</option></optgroup>';
        expected += '<optgroup label="bar-group"><option value="bar" selected="selected">bar</option></optgroup>';
        expected += '</select>';

        expect(markup).to.eql(expected);
    });

    it('should support server-side rendering with multiple using groups', () => {

        const markup = renderToString('select', {
                value: ['foo', 'bar'],
                multiple: 'multiple'
            },
            renderToString('optgroup', {
                label: 'foo-group'
            }, renderToString('option', {
                value: 'foo'
            }, 'foo')),
            renderToString('optgroup', {
                label: 'bar-group'
            }, renderToString('option', {
                value: 'bar'
            }, 'bar')));

        let expected = '<select value="foo,bar" multiple="multiple">';
        expected += '<optgroup label="foo-group"><option value="foo" selected="selected">foo</option></optgroup>';
        expected += '<optgroup label="bar-group"><option value="bar" selected="selected">bar</option></optgroup>';
        expected += '</select>';

        expect(markup).to.eql(expected);
    });
	
	it('should support server-side rendering with multiple using groups, and escaped HTML', () => {

        const markup = renderToString('select', {
                value: ['foo', 'bar'],
                multiple: 'multiple'
            },
            renderToString('optgroup', {
                label: 'foo-group'
            }, renderToString('option', {
                value: 'foo'
            }, '<&/>')),
            renderToString('optgroup', {
                label: 'bar-group'
            }, renderToString('option', {
                value: 'bar'
            }, 'bar')));

        let expected = '<select value="foo,bar" multiple="multiple">';
        expected += '<optgroup label="foo-group"><option value="foo" selected="selected">&lt;&amp;/&gt;</option></optgroup>';
        expected += '<optgroup label="bar-group"><option value="bar" selected="selected">bar</option></optgroup>';
        expected += '</select>';

        expect(markup).to.eql(expected);
    });
}
