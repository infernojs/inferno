import { render } from 'inferno';
import { style } from '../../tools/utils';
import createElement from 'inferno-create-element';
import { expect } from 'chai';

const isPhantomJS = window && window.navigator && /PhantomJS/.test(window.navigator.userAgent);

describe('CSS style properties', () => {
	let container;

	beforeEach(() => {
		container = document.createElement('div');
	});

	afterEach(() => {
		container.innerHTML = '';
	});

	const preDefined = [{
		name: 'set width and height',
		value: {
			width: '200px',
			height: '200px'
		},
		expected: ['width: 200px; height: 200px;']
	}, {
		name: 'ignore null styles',
		value: {
			backgroundColor: null,
			display: 'none'
		},
		expected: ['display: none;']
	}, {
		name: 'ignore null styles',
		value: {
			backgroundColor: null,
			display: 'null'
		},
		expected: [null, '', 'display: null;']
	}, {
		name: 'ignore null styles',
		value: {},
		expected: [null]
	}, {
		name: 'ignore undefined styles',
		value: {
			backgroundColor: undefined,
			display: 'none'
		},
		expected: ['display: none;']
	}, {
		name: 'ignore undefined styles',
		value: {
			backgroundColor: undefined,
			display: 'undefined'
		},
		expected: [null, '', 'display: undefined;']
	}, {
		name: 'ignore undefined styles',
		value: {
			'background-color': undefined,
			'display': 'none'
		},
		expected: ['display: none;']
	}, {
		name: 'ignore empty string styles',
		value: {
			display: 'none'
		},
		expected: ['display: none;']
	}, {
		name: 'return null for no styles',
		value: {
			backgroundColor: null,
			display: null
		},
		expected: [null]
	}, {
		name: 'correctly set fontSize css property',
		value: {
			fontSize: '123px'
		},
		expected: ['font-size: 123px;']
	}, {
		name: 'correctly set fontSize css property #2',
		value: {
			fontSize: 123
		},
		expected: ['font-size: 123px;']
	}, {
		name: 'not add px suffix to some css properties',
		value: {
			widows: 5,
			zIndex: 5,
			lineHeight: 5
		},
		expected: ['widows: 5; z-index: 5; line-height: 5;']
	}, {
		name: 'not set non-browser supported style properties',
		value: {
			someProp: 5
		},
		expected: [null]
	}, {
		name: 'handle hypenhated markup correctly',
		value: {
			fontFamily: 'Inferno'
		},
		expected: ['font-family: Inferno;']
	}, {
		name: 'handle different units - em, cm, mm etc',
		value: {
			height: '200em',
			width: '200cm',
			marginLeft: '200mm'
		},
		expected: ['height: 200em; width: 200cm; margin-left: 200mm;']
	}];

	if (typeof global !== 'undefined' && !(global as any).usingJSDOM) {
		if (isPhantomJS) {
			preDefined.push({
				name: 'support webkit transform',
				value: {
					webkitTransform: 'rotate(245deg)'
				},
				expected: ['-webkit-transform: rotate(245deg);']
			});
		} else {
			preDefined.push({
				name: 'support css3 transform',
				value: {
					transform: 'rotate(245deg)'
				},
				expected: ['transform: rotate(245deg);']
			});
		}
	}

	preDefined.forEach((arg) => {
		[{
			description: 'should ' + arg.name + ' on root node',
			template: () => createElement('div', {
				style: arg.value
			})
		}].forEach((test) => {
			it(test.description, () => {

				render(test.template(), container);
				expect(container.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.getAttribute('style')).to.be.oneOf(style(arg.expected));
				render(test.template(), container);
				expect(container.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.getAttribute('style')).to.be.oneOf(style(arg.expected));
			});
		});
	});

	preDefined.forEach((arg) => {
		[{
			description: 'should ' + arg.name + ' on first child node',
			template: () => createElement('div', null, createElement('div', {
				style: arg.value
			}))
		}].forEach((test) => {
			it(test.description, () => {
				render(test.template(), container);
				expect(container.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.firstChild.getAttribute('style')).to.be.oneOf(style(arg.expected));
				render(test.template(), container);
				expect(container.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.firstChild.getAttribute('style')).to.be.oneOf(style(arg.expected));
			});
			it(test.description, () => {
				render(test.template(), container);
				expect(container.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.firstChild.getAttribute('style')).to.be.oneOf(style(arg.expected));
				render(test.template(), container);
				expect(container.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.firstChild.getAttribute('style')).to.be.oneOf(style(arg.expected));
			});
		});
	});

	preDefined.forEach((arg) => {
		[{
			description: 'should dynamically ' + arg.name + ' on root node',
			template: (value?) => createElement('div', {
				style: value
			})
		}].forEach((test) => {
			it(test.description, () => {
				render(test.template(arg.value), container);
				expect(container.firstChild.nodeType).to.equal(1);

				expect(container.firstChild.getAttribute('style')).to.be.oneOf(style(arg.expected));
				render(test.template(arg.value), container);
				expect(container.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.getAttribute('style')).to.be.oneOf(style(arg.expected));
			});
			it(test.description, () => {
				render(test.template(null), container);
				expect(container.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.getAttribute('style')).to.oneOf([ null, '']);

				render(test.template(null), container);
				expect(container.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.getAttribute('style')).to.oneOf([ null, '']);
			});
			it(test.description, () => {
				render(test.template(), container);
				expect(container.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.getAttribute('style')).to.oneOf([ null, '']);

				render(test.template(), container);
				expect(container.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.getAttribute('style')).to.oneOf([ null, '']);
			});
			it(test.description, () => {
				render(test.template(null), container);
				expect(container.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.getAttribute('style')).to.oneOf([ null, '']);

				render(test.template(arg.value), container);
				expect(container.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.getAttribute('style')).to.be.oneOf(style(arg.expected));
			});
			it(test.description, () => {
				render(test.template(arg.value), container);
				expect(container.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.getAttribute('style')).to.be.oneOf(style(arg.expected));

				render(test.template(null), container);
				expect(container.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.getAttribute('style')).to.oneOf([ null, '']);
			});
		});
	});

	preDefined.forEach((arg) => {
		[{
			description: 'should dynamically ' + arg.name + ' on first child node',
			template: (value) => createElement('div', null, createElement('div', {
				style: value
			}))
		}].forEach((test) => {
			it(test.description, () => {
				render(test.template(arg.value), container);
				expect(container.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.firstChild.getAttribute('style')).to.be.oneOf(style(arg.expected));
				render(test.template(arg.value), container);
				expect(container.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.firstChild.getAttribute('style')).to.be.oneOf(style(arg.expected));
			});
			it(test.description, () => {
				render(test.template(null), container);
				expect(container.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.firstChild.getAttribute('style')).to.oneOf([ null, '']);
				render(test.template(arg.value), container);
				expect(container.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.firstChild.getAttribute('style')).to.be.oneOf(style(arg.expected));
			});
			it(test.description, () => {
				render(test.template(null), container);
				expect(container.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.firstChild.getAttribute('style')).to.oneOf([ null, '']);
				render(test.template(null), container);
				expect(container.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.firstChild.getAttribute('style')).to.oneOf([ null, '']);
			});
			it(test.description, () => {
				render(test.template(null), container);
				expect(container.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.firstChild.getAttribute('style')).to.oneOf([ null, '']);
				render(test.template(null), container);
				expect(container.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.firstChild.getAttribute('style')).to.oneOf([ null, '']);
			});
			it(test.description, () => {
				render(test.template({}), container);
				expect(container.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.firstChild.getAttribute('style')).to.oneOf([ null, '']);
				render(test.template({}), container);
				expect(container.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.firstChild.getAttribute('style')).to.oneOf([ null, '']);
			});
		});
	});

	preDefined.forEach((arg) => {
		[{
			description: 'should dynamically and statically ' + arg.name + ' on first child node',
			template: (value) => createElement('div', {
				style: arg.value
			}, createElement('div', {
				tag: 'div',
				style: value
			}))
		}].forEach((test) => {
			it(test.description, () => {
				render(test.template({}), container);
				render(test.template(arg.value), container);
				expect(container.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.getAttribute('style')).to.be.oneOf(style(arg.expected));
				expect(container.firstChild.firstChild.getAttribute('style')).to.be.oneOf(style(arg.expected));
				render(test.template(arg.value), container);
				expect(container.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.getAttribute('style')).to.be.oneOf(style(arg.expected));
				expect(container.firstChild.firstChild.getAttribute('style')).to.be.oneOf(style(arg.expected));
			});

			it(test.description, () => {
				render(test.template(arg.value), container);
				expect(container.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.getAttribute('style')).to.be.oneOf(style(arg.expected));
				expect(container.firstChild.firstChild.getAttribute('style')).to.be.oneOf(style(arg.expected));
				render(test.template(null), container);
				expect(container.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.getAttribute('style')).to.be.oneOf(style(arg.expected));
				expect(container.firstChild.firstChild.getAttribute('style')).to.oneOf([ null, '']);
			});
			it(test.description, () => {
				render(test.template(null), container);
				expect(container.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.getAttribute('style')).to.be.oneOf(style(arg.expected));
				expect(container.firstChild.firstChild.getAttribute('style')).to.oneOf([ null, '']);
				render(test.template(arg.value), container);
				expect(container.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.getAttribute('style')).to.be.oneOf(style(arg.expected));
				expect(container.firstChild.firstChild.getAttribute('style')).to.be.oneOf(style(arg.expected));
			});
			it(test.description, () => {
				render(test.template({}), container);
				render(test.template(null), container);
				expect(container.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.getAttribute('style')).to.be.oneOf(style(arg.expected));
				expect(container.firstChild.firstChild.getAttribute('style')).to.oneOf([ null, '']);
				render(test.template(null), container);
				expect(container.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.getAttribute('style')).to.be.oneOf(style(arg.expected));
				expect(container.firstChild.firstChild.getAttribute('style')).to.oneOf([ null, '']);
			});
		});
	});

	/*
	 describe('Shorthand CSS Styles', () => {
	 Object.keys(shortCuts).forEach(shortCut => {
	 let stylePropName = cssToJSName(shortCut);
	 let shorthands = shortCuts[ shortCut ];
	 let mustBeString = (/style/ig).test(shortCut);

	 if (shorthands.length) {
	 let val = mustBeString ? 'dotted' : 1;
	 let style = { [ stylePropName ]: val };
	 let comparator = mustBeString ? val : val + 'px';

	 describe(`Set ${ shortCut } CSS properties from shorthand: ${ JSON.stringify(style) }`, () => {

	 beforeEach(() => {
	 let template = createTemplate(() => {
	 return {
	 tag: 'div',
	 attrs: {
	 style: style
	 }
	 };
	 });
	 render(template(), container);
	 });

	 shorthands.forEach(cssProperty => {
	 it(`should set ${ cssProperty } to ${ style[ stylePropName ] }px`, () => {
	 expect(container.firstChild.style[ cssProperty ]).to.equal(comparator);
	 });
	 });
	 });
	 }

	 if (shorthands.length) {
	 [{
	 numbers: [ 1, 2 ],
	 strings: [ 'dotted', 'solid' ]
	 }, {
	 numbers: [ 1, 2, 3, 4 ],
	 strings: [ 'dotted', 'solid', 'dashed', 'double' ]
	 }].forEach(vals => {

	 let values = mustBeString ? vals.strings : vals.numbers.map(x => x + 'px');
	 let val = values.join(' ');
	 let style = { [ stylePropName ]: val };

	 describe(`Set ${ shortCut } CSS properties from shorthand: ${ JSON.stringify(style) }`, () => {

	 beforeEach(() => {
	 let template = createTemplate(() => {
	 return {
	 tag: 'div',
	 attrs: {
	 style: style
	 }
	 };
	 });
	 render(template(), container);
	 render(template(), container);
	 });
	 shorthands.forEach((cssProperty, index) => {
	 let comparator = values[ index % values.length ];

	 it(`should set ${ cssProperty } to ${ comparator }`, () => {
	 expect(container.firstChild.style[ cssProperty ]).to.equal(comparator);
	 });
	 });
	 });
	 });
	 }
	 });
	 }); */

	it('should support CSS background property', () => {
		const template = () => createElement('div', {
			style: {
				width: '200px',
				height: '200px',
				backgroundColor: 'red'
			}
		});
		render(template(), container);
		expect(container.innerHTML).to.equal('<div style="width: 200px; height: 200px; background-color: red;"></div>');
	});
});
