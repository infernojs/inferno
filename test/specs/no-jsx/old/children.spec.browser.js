import Inferno from '../../../../packages/inferno/src/';
import InfernoDOM from '../../../../packages/inferno-dom/src/';

// WHY would we need this??

import { addTreeConstructor } from '../../../../src/core/createTemplate';
import createDOMTree from '../../../../src/DOM/createTree';
addTreeConstructor( 'dom', createDOMTree );

describe( 'Children - (non-JSX)', () => {

	let container;

	beforeEach(function() {
		container = document.createElement('div');
	});

	afterEach(function() {
		container.innerHTML = '';
	});

	const preDefined = [{
		name: 'undefined',
		value: undefined,
		expected: ''
	}, {
		name: 'null',
		value: null,
		expected: ''
	}, {
		name: 'one whitespace',
		value: ' ',
		expected: ' '
	}, {
		name: 'whitespace to left',
		value: 'a ',
		expected: 'a '
	}, {
		name: 'whitespace to right',
		value: ' a',
		expected: ' a'
	}, {
		name: 'should set children as empty string',
		value: '',
		expected: ''
	}, {
		name: 'should create a div with text, children property',
		value: 'string',
		expected: 'string'
	}, {
		name: 'text, children property array',
		value: ['Hello!'],
		expected: 'Hello!'
	}, {
		name: 'text, children property array multiple',
		value: ['Hello,', ' World!'],
		expected: 'Hello, World!'
	}, {
		name: 'text, children property array multiple and empty string',
		value: ['Hello,', ' World!', ''],
		expected: 'Hello, World!'
	}, {
		name: 'text, children property array multiple and empty string and undefined',
		value: ['Hello,', undefined, ' World!', ''],
		expected: 'Hello, World!'
	}, {
		name: '0',
		value: 0,
		expected: '0'
	}, {
		name: '0 (cast to string)',
		value: '0',
		expected: '0'
	}, {
		name: 'NaN',
		value: 'NaN',
		expected: 'NaN'
	}, {
		name: 'empty array',
		value: [],
		expected: ''
	}, {
		name: 'simple math',
		value: 123 - 33,
		expected: '90'
	}, {
		name: 'advanced math',
		value: 123 - 33 / 4 - 444 * 345,
		expected: '-153065.25'
	}, {
		name: 'number array',
		value: [1, 2, 3],
		expected: '123'
	}, {
		name: 'number array (long array)',
		value: [1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3],
		expected: '123123123123'
	}, {
		name: 'number array (long mixed array)',
		value: [1, '2', 3, '1', 2, 3, '1', 2, 3, 1, 2, '3'],
		expected: '123123123123'
	}, {
		name: 'number array (long mixed array) and undefined and empty string',
		value: [1, '2', '', '1', 2, 3, '1', 2, undefined, 1, 2, '3'],
		expected: '1212312123'
	}, {
		name: 'number array ( cast to string)',
		value: ['1', '2', '3'],
		expected: '123'
	}, {
		name: 'number array ( cast to string) and various whitespaces',
		value: [' 1 ', '2', '3  '],
		expected: ' 1 23  '
	},
		/*{
		 name: 'single null in an array',
		 value: [1, 2, null],
		 expected: '12'
		 },
		 {
		 name: 'dobule null in an array',
		 value: [1, null, null],
		 expected: '1'
		 },
		 {
		 name: 'triple null in an array',
		 value: [null, null, null],
		 expected: ''
		 },*/
		{
			name: 'single undefined in an array',
			value: [1, 2, undefined],
			expected: '12'
		}, {
			name: 'undefined in the middle of an array',
			value: [1, undefined, 3],
			expected: '13'
		}, {
			name: 'dobule undefined in an array',
			value: [1, undefined, undefined],
			expected: '1'
		}, {
			name: 'triple undefined in an array',
			value: [undefined, undefined, undefined],

			expected: ''
		}, {
			name: 'single empty string in an array',
			value: [1, 2, ''],
			expected: '12'
		}, {
			name: 'dobule empty string in an array',
			value: [1, '', ''],
			expected: '1'
		}, {
			name: 'triple empty string in an array',
			value: ['', '', ''],
			expected: ''
		}
	];


	preDefined.forEach((arg) => {

		[{
			description: 'should set static children as ' + arg.name,
			template: () => ({
				tag: 'div',
				children: arg.value
			})
		}].forEach((test) => {

			it(test.description, () => {

				InfernoDOM.render(Inferno.createTemplate(test.template)(), container);
				expect(container.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.textContent).to.equal(arg.expected);
				InfernoDOM.render(Inferno.createTemplate(test.template)(), container);
				expect(container.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.textContent).to.equal(arg.expected);
			});
		});
	});

	preDefined.forEach((arg) => {

		[{
			description: 'should set static deep children as ' + arg.name,
			template: () => ({
				tag: 'div',
				children: {
					tag: 'span',
					children: arg.value
				}
			})
		}].forEach((test) => {

			it(test.description, () => {

				InfernoDOM.render(Inferno.createTemplate(test.template)(), container);
				expect(container.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.childNodes.length).to.equal(1);
				expect(container.firstChild.firstChild.textContent).to.equal(arg.expected);
				InfernoDOM.render(Inferno.createTemplate(test.template)(), container);
				expect(container.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.childNodes.length).to.equal(1);
				expect(container.firstChild.firstChild.textContent).to.equal(arg.expected);

			});
		});
	});

	preDefined.forEach((arg) => {

		[{
			description: 'should set very deep static children as ' + arg.name,
			template: () => ({
				tag: 'div',
				children: {
					tag: 'span',
					children: {
						tag: 'b',
						children: {
							tag: 'b',
							children: arg.value
						}
					}
				}
			})
		}].forEach((test) => {

			it(test.description, () => {

				InfernoDOM.render(Inferno.createTemplate(test.template)(), container);
				expect(container.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.childNodes.length).to.equal(1);
				expect(container.firstChild.firstChild.textContent).to.equal(arg.expected);
				InfernoDOM.render(Inferno.createTemplate(test.template)(), container);
				expect(container.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.childNodes.length).to.equal(1);
				expect(container.firstChild.firstChild.textContent).to.equal(arg.expected);

			});
		});
	});

	preDefined.forEach((arg) => {

		[{
			description: 'should set dynamic children as ' + arg.name,

			template: (child) => ({
				tag: 'div',
				children: child
			})
		}].forEach((test) => {

			it(test.description, () => {

				InfernoDOM.render(Inferno.createTemplate(test.template)(arg.value), container);
				expect(container.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.textContent).to.equal(arg.expected);
				InfernoDOM.render(Inferno.createTemplate(test.template)(arg.value), container);
				expect(container.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.textContent).to.equal(arg.expected);
			});
		});
	});

	preDefined.forEach((arg) => {

		[{
			description: 'should set deep dynamic children as ' + arg.name,
			template: (child) => ({
				tag: 'div',
				children: {
					tag: 'b',
					children: child
				}
			})
		}].forEach((test) => {

			it(test.description, () => {

				InfernoDOM.render(Inferno.createTemplate(test.template)(arg.value), container);
				expect(container.firstChild.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.firstChild.textContent).to.equal(arg.expected);
				InfernoDOM.render(Inferno.createTemplate(test.template)(arg.value), container);
				expect(container.firstChild.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.firstChild.textContent).to.equal(arg.expected);
			});
		});
	});
});