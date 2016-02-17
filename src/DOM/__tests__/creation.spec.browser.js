import { render } from '../rendering';

describe('Creation - (non-JSX)', () => {

	let container;

	beforeEach(function () {
		container = document.createElement('div');
	});

	afterEach(function () {
		container.innerHTML = '';
	});

	var staticNode = {
		tag: null,
		static: {
			keyed: [],
			nonKeyed: []
		}
	};

	[{
		description: 'should render div with span child',
		template: () => {
			return {
				static: staticNode,
				dom: null,
				tag: 'div',
				children: {
					static: staticNode,
					dom: null,
					tag: 'span'
				}
			};
		},
		tagName: 'div',
		children: 1,
		textContent: ''
	}, {
		description: 'should render span with span child',
		template: () => {
			return {
				static: staticNode,
				dom: null,
				tag: 'span',
				children: {
					static: staticNode,
					tag: 'span'
				}
			};
		},
		tagName: 'span',
		children: 1,
		textContent: ''
	}, {
		description: 'should render div with two span children',
		template: () => {
			return {
				static: staticNode,
				dom: null,
				tag: 'div',
				children: [{
					static: staticNode,
					tag: 'span'
				}, {
					static: staticNode,
					tag: 'span'
				}]
			};
		},
		tagName: 'div',
		children: 2,
		textContent: ''
	}, {
		description: 'should render div with three span children and unset middle child',
		template: () => {
			return {
				static: staticNode,
				dom: null,
				tag: 'div',
				children: [{
					static: staticNode,
					tag: 'span'
				},
					null, {
						static: staticNode,
						dom: null,
						tag: 'span'
					}
				]
			};
		},
		tagName: 'div',
		children: 3,
		textContent: ''
	}, {
		description: 'should render div with three span children and unset first, and middle child',
		template: () => {
			return {
				static: staticNode,
				dom: null,
				tag: 'div',
				children: [
					null,
					null, {
						static: staticNode,
						dom: null,
						tag: 'span'
					}
				]
			};
		},
		tagName: 'div',
		children: 3,
		textContent: ''
	}, {
		description: 'should render div with three span children and unset first, and middle child',
		template: () => {
			return {
				static: staticNode,
				dom: null,
				tag: 'div',
				children: [
					null,
					null,
					null
				]
			};
		},
		tagName: 'div',
		children: 3,
		textContent: ''
	}, {
		description: 'should render div with two null children and one text node',
		template: () => {
			return {
				static: staticNode,
				dom: null,
				tag: 'div',
				children: [
					null,
					'Baboy',
					null
				]
			};
		},
		tagName: 'div',
		children: 3,
		textContent: 'Baboy'
	}, {
		description: 'should render div with one textNode and a span children',
		template: () => {
			return {
				static: staticNode,
				dom: null,
				tag: 'div',
				children: [
					'Hello!',
					null, {
						static: staticNode,
						dom: null,
						tag: 'span'
					}
				]
			};
		},
		tagName: 'div',
		children: 3,
		textContent: 'Hello!'
	}, {
		description: 'should render div with two textNodes and a span children',
		template: () => {
			return {
				static: staticNode,
				dom: null,
				tag: 'div',
				children: [
					'Hello, ',
					null,
					'World!', {
						static: staticNode,
						dom: null,
						tag: 'span'
					}
				]
			};
		},
		tagName: 'div',
		children: 4,
		textContent: 'Hello, World!'
	}, {
		description: 'should render div with two textNodes and a two span children',
		template: () => {
			return {
				static: staticNode,
				dom: null,
				tag: 'div',
				children: [
					'Hello, ', {
						static: staticNode,
						dom: null,
						tag: 'span'
					},
					'World!', {
						static: staticNode,
						dom: null,
						tag: 'span'
					}
				]
			};
		},
		tagName: 'div',
		children: 4,
		textContent: 'Hello, World!'
	}, {
		description: 'should render div with two textNodes and one span children, and span with textNode',
		template: () => {
			return {
				static: staticNode,
				tag: 'div',
				children: [
					'Hello', {
						static: staticNode,
						tag: 'span'
					},
					', ', {
						static: staticNode,
						tag: 'span',
						children: 'World!'
					}
				]
			};
		},
		tagName: 'div',
		children: 4,
		textContent: 'Hello, World!'
	}, {
		description: 'should render div with tree null values in an array for children',
		template: () => {
			return {
				static: staticNode,
				dom: null,
				tag: 'div',
				children: [
					null,
					null,
					null
				]
			};
		},
		tagName: 'div',
		children: 3,
		textContent: ''
	}, {
		description: 'should render div with b child, and tree null values in an array for children',
		template: () => {
			return {
				static: staticNode,
				dom: null,
				tag: 'div',
				children: {
					static: staticNode,
					dom: null,
					tag: 'b',
					children:
					[
						null,
						null,
						null
					]
				}
			};
		},
		tagName: 'div',
		children: 1,
		textContent: ''
	}, {
		description: 'should render div with b child, and number and two null values in an array for children',
		template: () => {
			return {
				static: staticNode,
				dom: null,
				tag: 'div',
				children: {
					static: staticNode,
					dom: null,
					tag: 'b',
					children:
					[
						null,
						123,
						null
					]
				}
			};
		},
		tagName: 'div',
		children: 1,
		textContent: '123'
	}, {
		description: 'should render empty div',
		template: () => {
			return {
				static: staticNode,
				dom: null,
				tag: 'div'
			};
		},
		tagName: 'div',
		children: 0,
		textContent: ''
	}, {
		description: 'should render empty span',
		template: () => {
			return {
				static: staticNode,
				dom: null,
				tag: 'span'
			};
		},
		tagName: 'span',
		children: 0,
		textContent: ''
	}].forEach((test) => {

		it(test.description, () => {

			render(test.template(), container);
			expect(container.firstChild.nodeType).to.equal(1);
			expect(container.firstChild.tagName.toLowerCase()).to.equal(test.tagName);
			expect(container.firstChild.childNodes.length).to.equal(test.children);
			expect(container.firstChild.textContent).to.equal(test.textContent);

			render(test.template(), container);
			expect(container.firstChild.nodeType).to.equal(1);
			expect(container.firstChild.tagName.toLowerCase()).to.equal(test.tagName);
			expect(container.firstChild.childNodes.length).to.equal(test.children);
		});
	});
});
