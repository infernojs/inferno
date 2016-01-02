import Inferno from '../../../../packages/inferno/src/';
import InfernoDOM from '../../../../packages/inferno-dom/src/';

// WHY would we need this??

import { addTreeConstructor } from '../../../../src/core/createTemplate';
import createDOMTree from '../../../../src/DOM/createTree';
addTreeConstructor( 'dom', createDOMTree );

describe( 'CSS style properties - (non-JSX)', () => {

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
		name: 'ignore undefined styles',
		value: {
			backgroundColor: undefined,
			display: 'none'
		},
		expected: 'display: none;'
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
				// margin: 16,
				opacity: 0.5,
				//padding: '4px',
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

				InfernoDOM.render(Inferno.createTemplate(test.template)(), container);
				expect(container.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.getAttribute('style')).to.equal(arg.expected);

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

				InfernoDOM.render(Inferno.createTemplate(test.template)(), container);
				expect(container.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.firstChild.getAttribute('style')).to.equal(arg.expected);
				InfernoDOM.render(Inferno.createTemplate(test.template)(), container);
				expect(container.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.firstChild.getAttribute('style')).to.equal(arg.expected);
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

				InfernoDOM.render(Inferno.createTemplate(test.template)(arg.value), container);
				expect(container.firstChild.nodeType).to.equal(1);

				expect(container.firstChild.getAttribute('style')).to.equal(arg.expected);
				InfernoDOM.render(Inferno.createTemplate(test.template)(arg.value), container);
				expect(container.firstChild.nodeType).to.equal(1);
			});
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

				InfernoDOM.render(Inferno.createTemplate(test.template)(arg.value), container);
				expect(container.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.firstChild.getAttribute('style')).to.equal(arg.expected);
				InfernoDOM.render(Inferno.createTemplate(test.template)(arg.value), container);
				expect(container.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.firstChild.getAttribute('style')).to.equal(arg.expected);

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

				InfernoDOM.render(Inferno.createTemplate(test.template)(arg.value), container);
				expect(container.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.getAttribute('style')).to.equal(arg.expected);
				expect(container.firstChild.firstChild.getAttribute('style')).to.equal(arg.expected);
				InfernoDOM.render(Inferno.createTemplate(test.template)(arg.value), container);
				expect(container.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.getAttribute('style')).to.equal(arg.expected);
				expect(container.firstChild.firstChild.getAttribute('style')).to.equal(arg.expected);

			});
		});
	});
});
