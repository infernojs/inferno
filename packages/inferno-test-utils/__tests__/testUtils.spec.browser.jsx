import {
	findAllInRenderedTree,
	isDOMComponent,
	renderIntoDocument,
	scryRenderedDOMComponentsWithClass,
	scryRenderedDOMComponentsWithTag
} from '../dist-es';

import { expect } from 'chai';
import Inferno from 'inferno';
import { render } from 'inferno';
import Component from 'inferno-component';
import createElement from 'inferno-create-element';

Inferno;

describe('ReactTestUtils', () => {
	let container;

	beforeEach(() => {
		container = document.createElement('div');
	});

	afterEach(() => {
		container.innerHTML = '';
	});

	it('can scryRenderedDOMComponentsWithClass with TextComponent', () => {
		class Wrapper extends Component {
			render() {
				return (
					<div>Hello <span>Jim</span></div>
				);
			}
		}

		const renderedComponent = renderIntoDocument(<Wrapper />);
		const scryResults = scryRenderedDOMComponentsWithClass(
			renderedComponent,
			'NonExistentClass'
		);
		expect(scryResults.length).to.equal(0);
	});

	it('can scryRenderedDOMComponentsWithClass with className contains \\n', () => {
		class Wrapper extends Component {
			render() {
				return (
					<div>Hello <span className={'x\ny'}>Jim</span></div>
				);
			}
		}

		const renderedComponent = renderIntoDocument(<Wrapper />);
		const scryResults       = scryRenderedDOMComponentsWithClass(renderedComponent, 'x');

		expect(scryResults.length).to.equal(1);
	});

	it('can scryRenderedDOMComponentsWithClass with multiple classes', () => {
		class Wrapper extends Component {
			render() {
				return (
					<div>Hello <span className={'x y z'}>Jim</span></div>
				);
			}
		}

		const renderedComponent = renderIntoDocument(<Wrapper />);
		const scryResults1 = scryRenderedDOMComponentsWithClass(
			renderedComponent,
			'x y'
		);
		expect(scryResults1.length).to.equal(1);

		const scryResults2 = scryRenderedDOMComponentsWithClass(
			renderedComponent,
			'x z'
		);
		expect(scryResults2.length).to.equal(1);

		const scryResults3 = scryRenderedDOMComponentsWithClass(
			renderedComponent,
			['x', 'y']
		);
		expect(scryResults3.length).to.equal(1);

		expect(scryResults1[0]).to.equal(scryResults2[0]);
		expect(scryResults1[0]).to.equal(scryResults3[0]);

		const scryResults4 = scryRenderedDOMComponentsWithClass(
			renderedComponent,
			['x', 'a']
		);
		expect(scryResults4.length).to.equal(0);

		const scryResults5 = scryRenderedDOMComponentsWithClass(
			renderedComponent,
			['x a']
		);
		expect(scryResults5.length).to.equal(0);
	});

	it('traverses children in the correct order', () => {
		class Wrapper extends Component {
			render({ children }) {
				return (
					<div>{children}</div>
				);
			}
		}

		render(
			<Wrapper>
				{null}
				<div>purple</div>
			</Wrapper>,
			container
		);
		const tree = render(
			<Wrapper>
				<div>orange</div>
				<div>purple</div>
			</Wrapper>,
			container
		);

		const log = [];
		findAllInRenderedTree(tree, function(child) {
			if (isDOMComponent(child)) {
				log.push(child.textContent);
			}
		});

		// Should be document order, not mount order (which would be purple, orange)
		expect(log).to.eql(['orangepurple', 'orange', 'purple']);
	});

	it('can scry with stateless components involved', () => {
		const Stateless = () => <div><hr /></div>;

		class SomeComponent extends Component {
			render() {
				return (
					<div>
						<Stateless />
						<hr />
					</div>
				);
			}
		}

		const tree = renderIntoDocument(<SomeComponent />);
		const hrs = scryRenderedDOMComponentsWithTag(tree, 'hr');
		expect(hrs.length).to.equal(2);
	});

	it('Should not get stuck in infinite loop', () => {

		function BaseComponent(props) {
			return createElement('div', props);
		}
		function SuperComponent(props) {
			return createElement(BaseComponent, props);
		}

		// This is fine...
		const result = renderIntoDocument(
			createElement(SuperComponent, null, createElement(SuperComponent))
		);

		// This throws 'Maximum call stack size exceeded' error
		const test = scryRenderedDOMComponentsWithTag(result, 'div');
		expect(test.length).to.eql(5);
	});
});
