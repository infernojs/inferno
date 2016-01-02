import Inferno from '../../../../packages/inferno/src/';
import InfernoDOM from '../../../../packages/inferno-dom/src/';

// WHY would we need this??

import { addTreeConstructor } from '../../../../src/core/createTemplate';
import createDOMTree from '../../../../src/DOM/createTree';
addTreeConstructor( 'dom', createDOMTree );


const { createElement } = Inferno.TemplateFactory;

describe( 'Stateless components - (non-JSX)', () => {

	let container;

	beforeEach(() => {
		container = document.createElement('div');
	});

	afterEach(() => {
		container.innerHTML = '';
	});

	function BasicStatelessComponent1({
		name,
		title
		}) {

		const template = Inferno.createTemplate((name, title) =>
			createElement('div', {
					className: 'basic'
				},
				createElement('span', {
					className: name
				}, 'The title is ', title)
			)
		);
		return template(name, title);
	}

	it('should render a stateless component', () => {
		let template = Inferno.createTemplate((Component, title) =>
			createElement('div', null,
				createElement(Component, {
					title: title,
					name: 'Hello, World!'
				})
			)
		);

		InfernoDOM.render(template(BasicStatelessComponent1, 'abc'), container);
		expect(container.firstChild.childNodes.length).to.equal(1);
		expect(container.firstChild.firstChild.getAttribute('class')).to.equal('basic');
		expect(container.firstChild.firstChild.firstChild.getAttribute('class')).to.equal('Hello, World!');
		expect(container.firstChild.firstChild.firstChild.tagName).to.equal('SPAN');
		expect(container.firstChild.firstChild.firstChild.textContent).to.equal('The title is abc');
		InfernoDOM.render(template(BasicStatelessComponent1, 'abc'), container);
		expect(container.firstChild.childNodes.length).to.equal(1);
		expect(container.firstChild.firstChild.getAttribute('class')).to.equal('basic');
		expect(container.firstChild.firstChild.firstChild.getAttribute('class')).to.equal('Hello, World!');
		expect(container.firstChild.firstChild.firstChild.tagName).to.equal('SPAN');
		expect(container.firstChild.firstChild.firstChild.textContent).to.equal('The title is abc');

		const text = Inferno.createTemplate(() => {
			return {
				text: '123abc'
			}
		});

		const text1 = Inferno.createTemplate(() => {
			return {
				tag: 'span',
				children: {
					text: '123abc'
				}
			}
		});

		expect(
			() => InfernoDOM.render(template(BasicStatelessComponent1, text), container)
		).to.throw;
		expect(
			() => InfernoDOM.render(template(BasicStatelessComponent1, text1), container)
		).to.throw;

		InfernoDOM.render(template(BasicStatelessComponent1), container);
		expect(container.firstChild.childNodes.length).to.equal(1);
		expect(container.firstChild.firstChild.getAttribute('class')).to.equal('basic');
		expect(container.firstChild.firstChild.firstChild.getAttribute('class')).to.equal('Hello, World!');
		expect(container.firstChild.firstChild.firstChild.tagName).to.equal('SPAN');
		expect(container.firstChild.firstChild.firstChild.textContent).to.equal('The title is ');

		InfernoDOM.render(template(undefined), container);
		expect(
			container.innerHTML
		).to.equal(
			'<div></div>'
		);

		expect(
			() => Inferno.createTemplate(() => {
				return {
					tag: 'span',
					children: {
						text: null
					}
				}
			})
		).to.throw;
	});

	it('should render a basic root stateless component', () => {

		let template = Inferno.createTemplate((Component, title, name) =>
			createElement(Component, {
				title,
				name
			})
		);

		InfernoDOM.render(template(BasicStatelessComponent1, 'abc', 'Hello, World!'), container);
		expect(container.firstChild.childNodes.length).to.equal(1);
		expect(container.firstChild.firstChild.getAttribute('class')).to.equal('Hello, World!');
		expect(container.firstChild.firstChild.tagName).to.equal('SPAN');
		expect(container.firstChild.firstChild.textContent).to.equal('The title is abc');
		InfernoDOM.render(template(BasicStatelessComponent1, 'abc', 'Hello, World!'), container);
		expect(container.firstChild.childNodes.length).to.equal(1);
		expect(container.firstChild.firstChild.getAttribute('class')).to.equal('Hello, World!');
		expect(container.firstChild.firstChild.tagName).to.equal('SPAN');
		expect(container.firstChild.firstChild.textContent).to.equal('The title is abc');

		const text1 = Inferno.createTemplate(() => {
			return {
				tag: 'span',
				children: {
					text: '123abc'
				}
			}
		});

		expect(
			() => InfernoDOM.render(template(BasicStatelessComponent1, text1), container)
		).to.throw;
	});
});