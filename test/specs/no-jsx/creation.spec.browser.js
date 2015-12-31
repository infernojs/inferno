import Inferno from '../../../src';

describe( 'Creation - (non-JSX)', () => {

	let container;

	beforeEach(function() {
		container = document.createElement('div');
	});

	afterEach(function() {
		container.innerHTML = '';
	});

	[{
		description: 'should render div with span child',
		template: () => {
			return {
				tag: 'div',
				children: {
					tag: 'span'
				}
			}
		},
		tagName: 'div',
		children: 1,
		textContent: ''
	}, {
		description: 'should render span with span child',
		template: () => {
			return {
				tag: 'span',
				children: {
					tag: 'span'
				}
			}
		},
		tagName: 'span',
		children: 1,
		textContent: ''
	}, {
		description: 'should render div with two span children',
		template: () => {
			return {
				tag: 'div',
				children: [{
					tag: 'span'
				}, {
					tag: 'span'
				}]
			}
		},
		tagName: 'div',
		children: 2,
		textContent: ''
	}, {
		description: 'should render div with three span children and unset middle child',
		template: () => {
			return {
				tag: 'div',
				children: [{
					tag: 'span'
				},
					null, {
						tag: 'span'
					}
				]
			}
		},
		tagName: 'div',
		children: 2,
		textContent: ''
	}, {
		description: 'should render div with three span children and unset first, and middle child',
		template: () => {
			return {
				tag: 'div',
				children: [
					null,
					null, {
						tag: 'span'
					}
				]
			}
		},
		tagName: 'div',
		children: 1,
		textContent: ''
	}, {
		description: 'should render div with one textNode and a span children',
		template: () => {
			return {
				tag: 'div',
				children: [
					'Hello!',
					null, {
						tag: 'span'
					}
				]
			}
		},
		tagName: 'div',
		children: 2,
		textContent: 'Hello!'
	}, {
		description: 'should render div with two textNodes and a span children',
		template: () => {
			return {
				tag: 'div',
				children: [
					'Hello, ',
					'World!', {
						tag: 'span'
					}
				]
			}
		},
		tagName: 'div',
		children: 3,
		textContent: 'Hello, World!'
	}, {
		description: 'should render div with two textNodes and a two span children',
		template: () => {
			return {
				tag: 'div',
				children: [
					'Hello, ', {
						tag: 'span'
					},
					'World!', {
						tag: 'span'
					}
				]
			}
		},
		tagName: 'div',
		children: 4,
		textContent: 'Hello, World!'
	}, {
		description: 'should render div with two textNodes and one span children, and span with textNode',
		template: () => {
			return {
				tag: 'div',
				children: [
					'Hello', {
						tag: 'span'
					},
					', ', {
						tag: 'span',
						children: 'World!'
					}
				]
			}
		},
		tagName: 'div',
		children: 4,
		textContent: 'Hello, World!'
	}, {
		description: 'should render div with tree null values in an array for children',
		template: () => {
			return {
				tag: 'div',
				children: [
					null,
					null,
					null
				]
			}
		},
		tagName: 'div',
		children: 0,
		textContent: ''
	}, {
		description: 'should render div with b child, and tree null values in an array for children',
		template: () => {
			return {
				tag: 'div',
				children: {
					tag: 'b',
					children:
						[
							null,
							null,
							null
						]
				}
			}
		},
		tagName: 'div',
		children: 1,
		textContent: ''
	}, {
		description: 'should render div with b child, and number and two null values in an array for children',
		template: () => {
			return {
				tag: 'div',
				children: {
					tag: 'b',
					children:
						[
							null,
							123,
							null
						]
				}
			}
		},
		tagName: 'div',
		children: 1,
		textContent: '123'
	}, {
		description: 'should render empty div',
		template: () => {
			return {
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
				tag: 'span'
			};
		},
		tagName: 'span',
		children: 0,
		textContent: ''
	}].forEach((test) => {

		it(test.description, () => {

			Inferno.render(Inferno.createTemplate(test.template)(), container);
			expect(container.firstChild.nodeType).to.equal(1);
			expect(container.firstChild.tagName.toLowerCase()).to.equal(test.tagName);
			expect(container.firstChild.childNodes.length).to.equal(test.children);
			expect(container.firstChild.textContent).to.equal(test.textContent);

			Inferno.render(Inferno.createTemplate(test.template)(), container);
			expect(container.firstChild.nodeType).to.equal(1);
			expect(container.firstChild.tagName.toLowerCase()).to.equal(test.tagName);
			expect(container.firstChild.childNodes.length).to.equal(test.children);

			Inferno.render(Inferno.createTemplate(test.template)(), container);
			expect(container.firstChild.nodeType).to.equal(1);
			expect(container.firstChild.tagName.toLowerCase()).to.equal(test.tagName);
			expect(container.firstChild.childNodes.length).to.equal(test.children);

		});
	});
});