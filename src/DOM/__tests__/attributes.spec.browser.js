import template from '../index';
import { render, renderToString } from '../rendering';
import createTemplate from '../../core/createTemplate';
import createDOMTree from '../createTree';
import { addTreeConstructor } from '../../core/createTemplate';

addTreeConstructor( 'dom', createDOMTree );

describe('Template', () => {

	let container;

	beforeEach(() => {
		container = document.createElement('div');
	})

	afterEach(() => {
		render(null, container);
	});

	it('should set id as attribute when not allowed to set as property', () => {
		template.setProperty(null, container, 'srcObject', 'simple', false);
		expect(container.getAttribute('srcObject')).to.equal('simple');
	});

	it('should set id as property when allowed to set as property', () => {
		template.setProperty(null, container, 'srcObject', 'simple', true);
		expect(container.getAttribute('srcObject')).to.be.null;
		expect(container.srcObject).to.equal('simple');
	});

	it('should not set custom attribute with none-valid attrName', () => {
		template.setProperty(null, container, '123id', 'simple');
		expect(container.getAttribute('id')).to.be.null;
	});

	it('should not set custom attribute with null value', () => {
		template.setProperty(null, container, 'hello', null);
		expect(container.getAttribute('id')).to.be.null;
	});

	it('should not set custom attribute with undefined value', () => {
		template.setProperty(null, container, 'hello', undefined);
		expect(container.getAttribute('id')).to.be.null;
	});

	it('should set a custom attribute whre first letter is capitalized', () => {
		template.setProperty(null, container, 'Kaayo', 'oo', false);
		expect(container.getAttribute('Kaayo')).to.be.null;
		expect(container.getAttribute('kaayo')).to.be.null;
	});

	it('should set a custom attribute', () => {
		template.setProperty(null, container, 'kaayo', 'oo', false);
		expect(container.getAttribute('kaayo')).to.equal('oo');

		template.setProperty(null, container, 'aria-label', 'false', false);
		expect(container.getAttribute('aria-label')).to.equal('false');

		template.setProperty(null, container, 'foobar', '0', false);
		expect(container.getAttribute('foobar')).to.equal('0');

	});

	it('should set id attribute', () => {
		template.setProperty(null, container, 'id', 'simple');
		expect(container.getAttribute('id')).to.equal('simple');
	});

	it('should set boolean attributes', () => {

		template.setProperty(null, container, 'checked', 'simple');
		expect(container.getAttribute('checked')).to.equal('simple');

		template.setProperty(null, container, 'checked', true);
		expect(container.getAttribute('checked')).to.equal('checked');

		template.setProperty(null, container, 'checked', false);
		expect(container.getAttribute('checked')).to.be.null;

		template.setProperty(null, container, 'scoped', true);
		expect(container.getAttribute('scoped')).to.equal('scoped');

	it('should set numeric properties', () => {

		template.setProperty(null, container, 'start', 123, false);
		expect(container.getAttribute('start')).to.equal('123');

		template.setProperty(null, container, 'start', 0, false);
		expect(container.getAttribute('start')).to.equal('0');

		// custom
		template.setProperty(null, container, 'foobar', 123, false);
		expect(container.getAttribute('foobar')).to.equal('123');
	});

	it('should set className property', true, () => {
		template.setProperty(null, container, 'className', selected);
		expect(container.className).to.equal('selected');
		// className should be '', not 'null' or null (which becomes 'null' in
		// some browsers)
		template.setProperty(null, container, 'className', null);
		expect(container.className).to.equal('');

	});

	it('should set truthy boolean properties', true, () => {
		template.setProperty(null, container, 'allowFullScreen', true);
		expect(container.allowFullScreen).to.equal('simple');
		expect(container.getAttribute('allowFullScreen')).to.equal('simple');
	});


	it('should remove falsey boolean properties', true, () => {
		template.setProperty(null, container, 'allowFullScreen', false);
		expect(container.allowFullScreen).to.be.null;
		expect(container.getAttribute('allowFullScreen')).to.be.null;
	});
});


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

				let template = createTemplate((attr) => ({
					tag: 'div',
					attrs: attr
				}));

				render(template(att), container);
				expect(container.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.tagName).to.equal('DIV');
				expect(container.firstChild.getAttribute(attrs)).to.equal(def.expected);

				render(template(att), container);
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

				let template = createTemplate((attr) => ({
					tag: 'div',
					attrs: attr
				}));

				render(template(att), container);
				expect(container.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.tagName).to.equal('DIV');
				expect(container.firstChild.getAttribute(attrs)).to.equal(def.expected);

				render(template(att), container);
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

				let template = createTemplate((attr) => ({
					tag: 'div',
					attrs: attr
				}));

				render(template(att), container);
				expect(container.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.tagName).to.equal('DIV');
				expect(container.firstChild.getAttribute(attrs)).to.equal(def.expected);

				render(template(att), container);
				expect(container.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.tagName).to.equal('DIV');
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

				let template = createTemplate((attr) => ({
					tag: 'div',
					attrs: attr
				}));

				render(template(att), container);

				expect(container.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.tagName).to.equal('DIV');
				expect(container.firstChild.getAttribute(attrs)).to.eql(attrs);

				expect(container.firstChild[attrs]).to.be.undefined;

				render(template(att), container);
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

				let template = createTemplate((attr) => ({
					tag: 'div',
					attrs: attr
				}));

				render(template(att), container);

				expect(container.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.tagName).to.equal('DIV');
				expect(container.firstChild.getAttribute(attrs)).to.eql(def.expected);

				expect(container.firstChild[attrs]).to.be.undefined;

				render(template(att), container);
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

				let template = createTemplate((attr) => ({
					tag: 'div',
					attrs: attr
				}));

				render(template(att), container);

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

				let template = createTemplate((attr) => ({
					tag: 'div',
					attrs: attr
				}));

				render(template(att), container);

				expect(container.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.tagName).to.equal('DIV');
				expect(container.firstChild.getAttribute(attrs)).to.eql(def.expected);
				expect(container.firstChild[attrs]).to.be.undefined;

				render(template(att), container);
				expect(container.firstChild.nodeType).to.equal(1);
				expect(container.firstChild.tagName).to.equal('DIV');
				//  expect(container.firstChild.getAttribute(attrs)).to.eql(attrs);
			});

		});
	})

});
});