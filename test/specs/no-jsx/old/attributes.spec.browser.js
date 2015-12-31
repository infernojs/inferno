import Inferno from '../../../../src';

describe( 'Attributes / properties - (non-JSX)', () => {

	let container;

	beforeEach(() => {
		container = document.createElement('div');
	})

	afterEach(() => {
		container.innerHTML = '';
	})

	describe('HTML attributes', () => {

		const emptyDefinitions = [{
			name: 'undefined',
			value: undefined,
			expected: null
		}, {
			name: 'null',
			value: null,
			expected: null
		}, {
			name: 'false',
			value: false,
			expected: null
		}, {
			name: 'empty string',
			value: '',
			expected: null
		}, {
			name: 'true',
			value: true,
			expected: 'true'
		}, {
			name: 'false',
			value: false,
			expected: null
		}];


		const attrs = ['title',
			'heLLo123',
			'data-custom',
			'custom',
			'aria',
			'name',
			'form',
			'formAction',
			'formEncType',
			'frameBorder',
			'color',
			'classID',
			'spellcheck',
			'is',
			'xmlns',
			'class',
			'inputMode',
			'height',
			'width',
			'cellSpacing',
			'cellPadding'
		];

		emptyDefinitions.forEach((def) => {

			attrs.forEach((attrs) => {

				it('should handle ' + attrs + ' attribute as ' + def.name, () => {

					const att = {};

					att[attrs] = def.value;

					let template = Inferno.createTemplate((attr) => ({
						tag: 'div',
						attrs: attr
					}));

					Inferno.render(template(att), container);
					expect(container.firstChild.nodeType).to.equal(1);
					expect(container.firstChild.tagName).to.equal('DIV');
					expect(container.firstChild.getAttribute(attrs)).to.equal(def.expected);

					Inferno.render(template(att), container);
					expect(container.firstChild.nodeType).to.equal(1);
					expect(container.firstChild.tagName).to.equal('DIV');
				});

			});
		});


		/**
		 * Boolean attributes
		 */

		const BooleanDefinitions = [{
			name: 'false',
			value: false,
			expected: null
		}, {
			name: 'string',
			value: 'fooBar',
			expected: 'fooBar'
		}, {
			name: 'false',
			value: false,
			expected: null
		}, {
			name: '0',
			value: 0,
			expected: null
		}, {
			name: '1',
			value: 1,
			expected: '1'
		}, {
			name: 'number array',
			value: [1, 2, 3],
			expected: '1,2,3'
		}];
		const booleanAttributes = ['disabled', 'allowFullScreen', 'autoFocus', 'checked', 'download', 'enabled', 'formNoValidate', 'hidden', 'loop', 'noValidate', 'readOnly', 'required', 'reversed', 'scoped'];

		BooleanDefinitions.forEach((def) => {

			booleanAttributes.forEach((attrs) => {

				it('should handle ' + attrs + ' attribute as ' + def.name, () => {

					let att = {};

					att[attrs] = def.value;

					let template = Inferno.createTemplate((attr) => ({
						tag: 'div',
						attrs: attr
					}));

					Inferno.render(template(att), container);
					expect(container.firstChild.nodeType).to.equal(1);
					expect(container.firstChild.tagName).to.equal('DIV');
					expect(container.firstChild.getAttribute(attrs)).to.equal(def.expected);

					Inferno.render(template(att), container);
					expect(container.firstChild.nodeType).to.equal(1);
					expect(container.firstChild.tagName).to.equal('DIV');
				});
			});
		});

		/**
		 * HTML attributes
		 */

		const attributeDefinitions = [{
			name: 'false',
			value: false,
			expected: null
		}, {
			name: 'string',
			value: 'fooBar',
			expected: 'fooBar'
		}, {
			name: 'false',
			value: false,
			expected: null
		}, {
			name: '0',
			value: 0,
			expected: null
		}, {
			name: '1',
			value: 1,
			expected: '1'
		}, {
			name: 'number array',
			value: [1, 2, 3],
			expected: '1,2,3'
		}];

		const attributes = ['src', 'srcLang', 'start', 'step', 'target', 'title', 'type', 'useMap', 'wrap', 'datatype', 'typeof', 'vocab', 'autoSave',
			'itemProp', 'itemScope', 'itemType', 'results', 'security', 'unselectable'
		];

		attributeDefinitions.forEach((def) => {

			attributes.forEach((attrs) => {

				it('should handle ' + attrs + ' attribute as ' + def.name, () => {

					let att = {};

					att[attrs] = def.value;

					let template = Inferno.createTemplate((attr) => ({
						tag: 'div',
						attrs: attr
					}));

					Inferno.render(template(att), container);
					expect(container.firstChild.nodeType).to.equal(1);
					expect(container.firstChild.tagName).to.equal('DIV');
					expect(container.firstChild.getAttribute(attrs)).to.equal(def.expected);

					Inferno.render(template(att), container);
					expect(container.firstChild.nodeType).to.equal(1);
					expect(container.firstChild.tagName).to.equal('DIV');
				});
			});
		});
	});

	describe('HTML properties', () => {
		/**
		 * Boolean properties
		 */
		const booleanPropDefinitions = [{
			name: 'true',
			value: true,
			expected: true
		}];

		const booleanProps = ['required', 'ismap', 'selected'];

		booleanPropDefinitions.forEach((def) => {

			booleanProps.forEach((attrs) => {

				it('should handle ' + attrs + ' boolean property as ' + def.name, () => {

					let att = {};

					att[attrs] = def.value;

					let template = Inferno.createTemplate((attr) => ({
						tag: 'div',
						attrs: attr
					}));

					Inferno.render(template(att), container);

					expect(container.firstChild.nodeType).to.equal(1);
					expect(container.firstChild.tagName).to.equal('DIV');
					expect(container.firstChild.getAttribute(attrs)).to.eql(attrs);

					expect(container.firstChild[attrs]).to.be.undefined;

					Inferno.render(template(att), container);
					expect(container.firstChild.nodeType).to.equal(1);
					expect(container.firstChild.tagName).to.equal('DIV');
					expect(container.firstChild.getAttribute(attrs)).to.eql(attrs);
					expect(container.firstChild[attrs]).to.be.undefined;
				});

			});
		});


		/**
		 * Positive numeric properties
		 */

		const positiveNumericPropDefinitions = [{
			name: 'positive numbers',
			value: 123,
			expected: '123'
		}, {
			name: 'negative numbers',
			value: -123,
			expected: null
		}, {
			name: 'special number combination',
			value: -2354e4,
			expected: null
		}, {
			name: 'undefined',
			value: undefined,
			expected: null
		}, {
			name: 'null',
			value: null,
			expected: null
		}, {
			name: 'false',
			value: false,
			expected: null
		}, {
			name: 'empty string',
			value: '',
			expected: null
		}, {
			name: 'false',
			value: false,
			expected: null
		}, {
			name: 'empty array',
			value: [],
			expected: null
		}, {
			name: 'craziness',
			value: '-423424e4',
			expected: null
		}];

		const positiveNumericProps = ['size', 'cols'];

		positiveNumericPropDefinitions.forEach((def) => {

			positiveNumericProps.forEach((attrs) => {

				it('should handle ' + attrs + ' boolean property as ' + def.name, () => {

					let att = {};

					att[attrs] = def.value;

					let template = Inferno.createTemplate((attr) => ({
						tag: 'div',
						attrs: attr
					}));

					Inferno.render(template(att), container);

					expect(container.firstChild.nodeType).to.equal(1);
					expect(container.firstChild.tagName).to.equal('DIV');
					expect(container.firstChild.getAttribute(attrs)).to.eql(def.expected);

					expect(container.firstChild[attrs]).to.be.undefined;

					Inferno.render(template(att), container);
					expect(container.firstChild.nodeType).to.equal(1);
					expect(container.firstChild.tagName).to.equal('DIV');
					expect(container.firstChild.getAttribute(attrs)).to.eql(def.expected);
					expect(container.firstChild[attrs]).to.be.undefined;
				});
			});
		});

		/**
		 * Numeric properties
		 */

		const numericPropDefinitions = [{
			name: 'positive numbers',
			value: 123,
			expected: '123'
		}, {
			name: 'negative numbers',
			value: -123,
			expected: '-123'
		}, {
			name: 'special number combination',
			value: -2354e4,
			expected: '-23540000'
		},
			{
				name: 'undefined',
				value: undefined,
				expected: null
			}, {
				name: 'null',
				value: null,
				expected: null
			}, {
				name: 'false',
				value: false,
				expected: null
			}, {
				name: 'empty string',
				value: '',
				expected: null
			}, {
				name: 'false',
				value: false,
				expected: null
			}, {
				name: 'empty array',
				value: [],
				expected: null
			}, {
				name: 'craziness',
				value: '-423424e4',
				expected: '-423424e4'
			}];

		const numericProps = ['playbackRate', 'tabindex', 'sizes', 'start'];

		numericPropDefinitions.forEach((def) => {

			numericProps.forEach((attrs) => {

				it('should handle ' + attrs + ' boolean property as ' + def.name, () => {

					let att = {};

					att[attrs] = def.value;

					let template = Inferno.createTemplate((attr) => ({
						tag: 'div',
						attrs: attr
					}));

					Inferno.render(template(att), container);

					expect(container.firstChild.nodeType).to.equal(1);
					expect(container.firstChild.tagName).to.equal('DIV');
					expect(container.firstChild.getAttribute(attrs)).to.eql(def.expected);

					expect(container.firstChild[attrs]).to.be.undefined;
				});

			});
		});

		/**
		 * HTML properties
		 */
		const propertyDefinitions = [{
			name: 'undefined',
			value: undefined,
			expected: null
		}, {
			name: 'null',
			value: null,
			expected: null
		}, {
			name: 'false',
			value: false,
			expected: null
		}, {
			name: 'empty string',
			value: '',
			expected: null
		}, {
			name: 'false',
			value: false,
			expected: null
		}];

		const properties = ['volume', 'selected'];

		propertyDefinitions.forEach((def) => {

			properties.forEach((attrs) => {

				it('should handle ' + attrs + ' property as ' + def.name, () => {

					let att = {};

					att[attrs] = def.value;

					let template = Inferno.createTemplate((attr) => ({
						tag: 'div',
						attrs: attr
					}));

					Inferno.render(template(att), container);

					expect(container.firstChild.nodeType).to.equal(1);
					expect(container.firstChild.tagName).to.equal('DIV');
					expect(container.firstChild.getAttribute(attrs)).to.eql(def.expected);
					expect(container.firstChild[attrs]).to.be.undefined;

					Inferno.render(template(att), container);
					expect(container.firstChild.nodeType).to.equal(1);
					expect(container.firstChild.tagName).to.equal('DIV');
					//  expect(container.firstChild.getAttribute(attrs)).to.eql(attrs);
				});

			});
		})

	});
});