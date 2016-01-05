import createDOMTree from '../createTree';
import { render } from '../rendering';
import createTemplate from '../../core/createTemplate';
import { addTreeConstructor } from '../../core/createTemplate';
import { shortCuts, cssToJSName } from '../../util/styleAccessor';
import style from '../../../tools/style';

addTreeConstructor( 'dom', createDOMTree );

describe( 'CSS style properties', () => {

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
			width: 200,
			height: 200
		},
		expected: 'width: 200px; height: 200px;'
	}, {
		name: 'ignore null styles',
		value: {
			backgroundColor: null,
			display: 'none'
		},
		expected: 'display: none;'
	}, {
		name: 'ignore null styles',
		value: {
			backgroundColor: null,
			display: 'null'
		},
		expected: null
	}, {
		name: 'ignore undefined styles',
		value: {
			backgroundColor: undefined,
			display: 'none'
		},
		expected: 'display: none;'
	}, {
		name: 'ignore undefined styles',
		value: {
			backgroundColor: undefined,
			display: 'undefined'
		},
		expected: null
	}, {
		name: 'ignore undefined styles',
		value: {
			'background-color': undefined,
			display: 'none'
		},
		expected: 'display: none;'
	}, {
		name: 'ignore empty string styles',
		value: {
			backgroundColor: ' ',
			display: 'none'
		},
		expected: 'display: none;'
	}, {
		name: 'return null for no styles',
		value: {
			backgroundColor: null,
			display: null
		},
		expected: null
	}, {
		name: 'correctly set fontSize css property',
		value: {
			fontSize: 123
		},
		expected: 'font-size: 123px;'
	}, {
		name: 'not add px suffix to some css properties',
		value: {
			widows: 5,
			zIndex:5,
			lineHeight: 5
		},
		expected: 'widows: 5; z-index: 5; line-height: 5;'
	}, {
		name: 'not set non-browser supported style properties',
		value: {
			'someProp': 5
		},
		expected: null
	},
		{
			name: 'automatically append `px` to relevant styles',
			value: {
				'zIndex': 33
			},
			expected: 'z-index: 33;'
		}, {
			name: 'support transform',
			value: {
				transform: 'rotate(245deg)'
			},
			expected: 'transform: rotate(245deg);'
		}, {
			name: 'automatically append `px` to relevant styles',
			value: {
				left: 0,
				opacity: 0.5,
			},
			expected: 'left: 0px; opacity: 0.5;'
		}, {
			name: 'support number values',
			value: {
				width: 7
			},
			expected: 'width: 7px;'
		}, {
			name: 'handle hypenhated markup correctly',
			value: {
				fontFamily: 'Inferno'
			},
			expected: 'font-family: Inferno;'
		}]

	preDefined.forEach((arg) => {

		[{
			description: 'should ' + arg.name + ' on root node',
			template: () => ({
				tag: 'div',
				attrs: {
					style: arg.value
				}
			})
		}].forEach((test) => {

			it(test.description, () => {

				render(createTemplate(test.template)(), container);
				expect(container.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.getAttribute('style')).to.equal(style(arg.expected));

			});
		});
	});

	preDefined.forEach((arg) => {

		[{
			description: 'should ' + arg.name + ' on first child node',
			template: () => ({
				tag: 'div',
				children: {
					tag:'div',
					attrs: {
						style: arg.value
					}
				}
			})
		}].forEach((test) => {

			it(test.description, () => {

				render(createTemplate(test.template)(), container);
				expect(container.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.firstChild.getAttribute('style')).to.equal(style(arg.expected));
				render(createTemplate(test.template)(), container);
				expect(container.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.firstChild.getAttribute('style')).to.equal(style(arg.expected));
			});

			it(test.description, () => {

				render(createTemplate(test.template)(null), container);
				expect(container.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.firstChild.getAttribute('style')).to.equal(style(arg.expected));
				render(createTemplate(test.template)(null), container);
				expect(container.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.firstChild.getAttribute('style')).to.equal(style(arg.expected));
			});
		});
	});

	preDefined.forEach((arg) => {

		[{
			description: 'should dynamically ' + arg.name + ' on root node',
			template: (value) => ({
				tag: 'div',
				attrs: {
					style: value
				}
			})
		}].forEach((test) => {

			it(test.description, () => {

				render(createTemplate(test.template)(arg.value), container);
				expect(container.firstChild.nodeType).to.equal(1);

				expect(container.firstChild.getAttribute('style')).to.equal(style(arg.expected));
				render(createTemplate(test.template)(arg.value), container);
				expect(container.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.getAttribute('style')).to.equal(style(arg.expected));
			});

			it(test.description, () => {

				render(createTemplate(test.template)(null), container);
				expect(container.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.getAttribute('style')).to.be.null;

				render(createTemplate(test.template)(null), container);
				expect(container.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.getAttribute('style')).to.be.null;
			});

			it(test.description, () => {

				render(createTemplate(test.template)(), container);
				expect(container.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.getAttribute('style')).to.be.null;

				render(createTemplate(test.template)(), container);
				expect(container.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.getAttribute('style')).to.be.null;
			});

			it(test.description, () => {

				render(createTemplate(test.template)(null), container);
				expect(container.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.getAttribute('style')).to.be.null;

				render(createTemplate(test.template)(arg.value), container);
				expect(container.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.getAttribute('style')).to.equal(style(arg.expected));
			});

			it(test.description, () => {

				render(createTemplate(test.template)(arg.value), container);
				expect(container.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.getAttribute('style')).to.equal(style(arg.expected));

				render(createTemplate(test.template)(null), container);
				expect(container.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.getAttribute('style')).to.be.null;
			})
		});
	});

	preDefined.forEach((arg) => {

		[{
			description: 'should dynamically ' + arg.name + ' on first child node',
			template: (value) => ({
				tag: 'div',
				children: {
					tag:'div',
					attrs: {
						style: value
					}
				}
			})
		}].forEach((test) => {

			it(test.description, () => {

				render(createTemplate(test.template)(arg.value), container);
				expect(container.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.firstChild.getAttribute('style')).to.equal(style(arg.expected));
				render(createTemplate(test.template)(arg.value), container);
				expect(container.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.firstChild.getAttribute('style')).to.equal(style(arg.expected));

			});

			it(test.description, () => {

				render(createTemplate(test.template)(null), container);
				expect(container.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.firstChild.getAttribute('style')).to.be.null;
				render(createTemplate(test.template)(arg.value), container);
				expect(container.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.firstChild.getAttribute('style')).to.equal(style(arg.expected));

			});

			it(test.description, () => {

				render(createTemplate(test.template)(null), container);
				expect(container.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.firstChild.getAttribute('style')).to.be.null;
				render(createTemplate(test.template)(null), container);
				expect(container.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.firstChild.getAttribute('style')).to.be.null;
			});

			it(test.description, () => {
				render(createTemplate(test.template)(null), container);
				expect(container.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.firstChild.getAttribute('style')).to.be.null;
				render(createTemplate(test.template)(null), container);
				expect(container.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.firstChild.getAttribute('style')).to.be.null;

			});

			it(test.description, () => {
				render(createTemplate(test.template)({}), container);
				expect(container.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.firstChild.getAttribute('style')).to.be.null;
				render(createTemplate(test.template)({}), container);
				expect(container.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.firstChild.getAttribute('style')).to.be.null;

			});
		});
	});

	preDefined.forEach((arg) => {

		[{
			description: 'should dynamically and statically ' + arg.name + ' on first child node',
			template: (value) => ({
				tag: 'div',
				attrs: {
					style: arg.value
				},
				children: {
					tag:'div',
					attrs: {
						style: value
					}
				}
			})
		}].forEach((test) => {

			it(test.description, () => {

				render(createTemplate(test.template)({}), container);
				render(createTemplate(test.template)(arg.value), container);
				expect(container.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.getAttribute('style')).to.equal(style(arg.expected));
				expect(container.firstChild.firstChild.getAttribute('style')).to.equal(style(arg.expected));
				render(createTemplate(test.template)(arg.value), container);
				expect(container.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.getAttribute('style')).to.equal(style(arg.expected));
				expect(container.firstChild.firstChild.getAttribute('style')).to.equal(style(arg.expected));

			});

			it(test.description, () => {

				render(createTemplate(test.template)(arg.value), container);
				expect(container.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.getAttribute('style')).to.equal(style(arg.expected));
				expect(container.firstChild.firstChild.getAttribute('style')).to.equal(style(arg.expected));
				render(createTemplate(test.template)(null), container);
				expect(container.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.getAttribute('style')).to.equal(style(arg.expected));
				expect(container.firstChild.firstChild.getAttribute('style')).to.be.null;

			});

			it(test.description, () => {

				render(createTemplate(test.template)(null), container);
				expect(container.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.getAttribute('style')).to.equal(style(arg.expected));
				expect(container.firstChild.firstChild.getAttribute('style')).to.be.null;
				render(createTemplate(test.template)(arg.value), container);
				expect(container.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.getAttribute('style')).to.equal(style(arg.expected));
				expect(container.firstChild.firstChild.getAttribute('style')).to.equal(style(arg.expected));

			});

			it(test.description, () => {

				render(createTemplate(test.template)({}), container);
				render(createTemplate(test.template)(null), container);
				expect(container.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.getAttribute('style')).to.equal(style(arg.expected));
				expect(container.firstChild.firstChild.getAttribute('style')).to.be.null;
				render(createTemplate(test.template)(null), container);
				expect(container.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.getAttribute('style')).to.equal(style(arg.expected));
				expect(container.firstChild.firstChild.getAttribute('style')).to.be.null;

			});
		});
	});

	describe( 'Shorthand CSS Styles', () => {
		Object.keys( shortCuts ).forEach( shortCut => {
			let stylePropName = cssToJSName( shortCut );
			let shorthands = shortCuts[shortCut];
			let mustBeString = ( /style/ig ).test( shortCut );

			if ( shorthands.length ) {
				let val = mustBeString ? 'dotted' : 1;
				let style = { [stylePropName]: val };
				let comparator = mustBeString ? val : val + 'px';

				describe( `Set ${shortCut} CSS properties from shorthand: ${JSON.stringify( style ) }`, () => {

					beforeEach(() => {
						let template = createTemplate(() => {
							return {
								tag: 'div',
								attrs: {
									style: style
								}
							}
						});
						render(template(), container);
					});

					shorthands.forEach( cssProperty => {
						it( `should set ${cssProperty} to ${style[stylePropName]}px`, () => {
							expect( container.firstChild.style[cssProperty] ).to.equal( comparator );
						} );
					} );
				} );
			}

			if ( shorthands.length ) {
				[{
					numbers: [ 1, 2 ],
					strings: [ 'dotted', 'solid' ]
				}, {
					numbers: [ 1, 2, 3, 4 ],
					strings: [ 'dotted', 'solid', 'dashed', 'double' ]
				}].forEach( vals => {

					let values = mustBeString ? vals.strings : vals.numbers.map( x => x + 'px' );
					let val = values.join( ' ' );
					let style = { [stylePropName]: val };

					describe( `Set ${shortCut} CSS properties from shorthand: ${JSON.stringify( style ) }`, () => {

						beforeEach(() => {
							let template = createTemplate(() => {
								return {
									tag: 'div',
									attrs: {
										style: style
									}
								}
							});
							render(template(), container);
							render(template(), container);
						});
						shorthands.forEach( ( cssProperty, index ) => {
							let comparator = values[index % values.length];

							it( `should set ${cssProperty} to ${comparator}`, () => {
								expect( container.firstChild.style[cssProperty] ).to.equal( comparator );
							} );
						} );
					} );
				} );
			}
		} );
	} );
});