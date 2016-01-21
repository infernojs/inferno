import createTemplate from '../createTemplate';
import { addTreeConstructor } from '../createTemplate';
import { render, renderToString } from '../../DOM/rendering';
import createDOMTree from '../../DOM/createTree';
import innerHTML from '../../../tools/innerHTML';

addTreeConstructor('dom', createDOMTree);

describe('rendering (UT tests)', () => {

	let container;
	let definitions;

	beforeEach(() => {
		container = document.createElement('div');
	});

	afterEach(() => {
		render(null, container);
	});

	definitions = [
		{
			name: 'no children',
			template: { tag: 'div' }
		},
		{
			name: 'children as undefined',
			template: { tag: 'div', children: undefined }
		},
		{
			name: 'children as null',
			template: { tag: 'div', children: null }
		},
		{
			name: 'children as empty array',
			template: { tag: 'div', children: [] }
		},
		{
			name: 'children as empty string',
			template: { tag: 'div', children: '' }
		}
	];

	definitions.forEach(function (def) {

		it('should render ' + def.name + ' and return a empty div', () => {

			let template = createTemplate(() => (def.template));

			render(template(), container);

			expect(container.innerHTML).to.equal(innerHTML('<div></div>'));
		});
	});

	definitions = [
		{
			name: 'div with span (direct)',
			template: { tag: 'div', children: { tag: 'span' } },
			expected: '<div><span></span></div>'
		},
		{
			name: 'div with span (array)',
			template: { tag: 'div', children: [{ tag: 'span' }] },
			expected: '<div><span></span></div>'
		},
		{
			name: 'div with multiple spans',
			template: { tag: 'div', children: [{ tag: 'span' }, { tag: 'span' }] },
			expected: '<div><span></span><span></span></div>'
		},
		{
			name: 'custom-tag with multiple spans',
			template: { tag: 'div-hello', children: [{ tag: 'span' }, { tag: 'span' }] },
			expected: '<div-hello><span></span><span></span></div-hello>'
		},
		{
			name: 'custom-tag with one custom-tag child',
			template: { tag: 'div-hello', children: { tag: 'hello-crazy-world' } },
			expected: '<div-hello><hello-crazy-world></hello-crazy-world></div-hello>'
		}
	];

	definitions.forEach(function (def) {

		it('should render a ' + def.name, () => {

			let template = createTemplate(() => (def.template));

			render(template(null), container);
			render(template(), container);
			expect(container.innerHTML).to.equal(innerHTML(def.expected));
			render(template(null), container);
			render(template(), container);
			expect(container.innerHTML).to.equal(innerHTML(def.expected));
		});
	});

	definitions = [
		{
			name: 'div with span (direct)',
			template: { tag: 'div', children: { tag: 'span' } },
			expected: '<div><div><span></span></div></div>'
		},
		{
			name: 'div with span (array)',
			template: { tag: 'div', children: [{ tag: 'span' }] },
			expected: '<div><div><span></span></div></div>'
		},
		//	{
		//		name: 'div with blank tag',
		//		template: { tag: 'abc', children: { tag: [] }},
		//		expected:  '<div><abc><span></span></abc></div>'
		//	},
		//	{
		//		name: 'div with blank tag',
		//		template: { tag: 'abc', children: { tag: {} }},
		//		expected:  '<div><abc><span></span></abc></div>'
		//	},
		{
			name: 'div with multiple spans',
			template: { tag: 'div', children: [{ tag: 'span' }, { tag: 'span' }] },
			expected: '<div><div><span></span><span></span></div></div>'
		}
	];

	definitions.forEach((def) => {
		it('should render a ' + def.name, () => {
			let template = createTemplate(() => ({ tag: 'div', children: def.template }));

			render(template(), container);
			expect(container.innerHTML).to.equal(innerHTML(def.expected));
			render(template(), container);
			expect(container.innerHTML).to.equal(innerHTML(def.expected));
		});
	});

	const objToString = { toString: () =>'toString' };

	definitions = [
		{ name: 'undefined', value: undefined, expected: '<div></div>' }, // TODO or 'undefined'
		{ name: 'null', value: null, expected: '<div></div>' }, // TODO or 'null'
		{ name: 'empty string', value: '', expected: '<div></div>' },
		{ name: 'string', value: 'string', expected: '<div>string</div>' },
		// { name: 'true', value: true, expected: true }, // This is 0 - valid number (no its not...)
		// { name: 'false', value: false, expected: false },// This is 1 - valid number (no its not...)
		{ name: '0', value: 0, expected: '<div>0</div>' },
		{ name: '1', value: 1, expected: '<div>1</div>' },
		{ name: 'NaN', value: NaN, expected: '<div>NaN</div>' }
	];

	definitions.forEach((def) => {
		it('should render a ' + def.name, () => {
			let template = createTemplate(() => ({ tag: 'div', text: def.value }));

			render(template(), container);
			expect(container.innerHTML).to.equal(innerHTML(def.expected));
			render(template(), container);
			expect(container.innerHTML).to.equal(innerHTML(def.expected));
		});
	});

	it('should throw', () => {

		let throwed;

		try {
			createTemplate(() => ({ tag: 'div', text: true }));
			throwed = false;
		} catch (e) {
			throwed = true;

		}
		expect(throwed).to.equal(true);

		try {
			createTemplate(() => ({ tag: 'div', text: objToString }));
			throwed = false;
		} catch (e) {
			throwed = true;
		}
		expect(throwed).to.equal(true);

	});

	definitions = [
		{
			name: 'undefined',
			template: undefined,
			expected: ''
		},
		{
			name: 'null',
			template: null,
			expected: ''
		},
		{
			name: 'plain object',
			template: {},
			expected: ''
		},
		{
			name: 'json',
			template: [{}],
			expected: ''
		},
		{
			name: 'empty array',
			template: [],
			expected: ''
		}
	];

	definitions.forEach((def) => {

		it('should throw on empty root node when ' + def.name, () => {

			let throwed;

			try {
				createTemplate(() => (def.template));
				throwed = false;
			} catch (e) {
				throwed = true;

			}
			expect(throwed).to.equal(true);
		});
	});

});
