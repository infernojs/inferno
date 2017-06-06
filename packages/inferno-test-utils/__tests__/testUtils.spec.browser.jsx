import { render } from 'inferno';
import Component from 'inferno-component';
import createClass from 'inferno-create-class';
import createElement from 'inferno-create-element';
import {
	findAllInRenderedTree,
	findAllInVNodeTree,
	findRenderedDOMElementWithClass,
	findRenderedDOMElementWithTag,
	findRenderedVNodeWithType,
	findVNodeWithType,
	isClassVNode,
	isClassVNodeOfType,
	isDOMElement,
	isDOMElementOfType,
	isDOMVNode,
	isDOMVNodeOfType,
	isFunctionalVNode,
	isFunctionalVNodeOfType,
	isRenderedClassComponent,
	isRenderedClassComponentOfType,
	isVNode,
	isVNodeOfType,
	renderIntoDocument,
	scryRenderedDOMElementsWithClass,
	scryRenderedDOMElementsWithTag,
	scryRenderedVNodesWithType,
	scryVNodesWithType,
} from 'inferno-test-utils';
import sinon from 'sinon';

const VNodeKeys = ['children', 'className', 'dom', 'flags', 'key', 'ref', 'props', 'type'];

const createDOMElement = tagName => document.createElement(tagName);

const FunctionalComponent = function(props) {
	return createElement('div', props);
};

const AnotherFunctionalComponent = function(props) {
	return createElement('div', props);
};

const CreateClassComponent = createClass({
	render() {
		return createElement('div', this.props);
	},
});

const AnotherCreateClassComponent = createClass({
	render() {
		return createElement('div', this.props);
	},
});

class ExtendClassComponent extends Component {
	render() {
		return createElement('div', this.props);
	}
}

class AnotherExtendClassComponent extends Component {
	render() {
		return createElement('div', this.props);
	}
}

describe('Test Utils', () => {
	describe('isVNode', () => {
		it('should return true for VNodes', () => {
			expect(isVNode(createElement('div'))).toBe(true);
			expect(isVNode(createElement(CreateClassComponent))).toBe(true);
			expect(isVNode(createElement(ExtendClassComponent))).toBe(true);
			expect(isVNode(createElement(FunctionalComponent))).toBe(true);
			expect(isVNode(<CreateClassComponent />)).toBe(true);
			expect(isVNode(<ExtendClassComponent />)).toBe(true);
			expect(isVNode(<FunctionalComponent />)).toBe(true);
			expect(isVNode(<div />)).toBe(true);
		});

		it('should return false for non-VNodes', () => {
			expect(isVNode(CreateClassComponent)).toBe(false);
			expect(isVNode(ExtendClassComponent)).toBe(false);
			expect(isVNode(FunctionalComponent)).toBe(false);
			expect(isVNode(createDOMElement('div'))).toBe(false);
			expect(isVNode('foo')).toBe(false);
			expect(isVNode({})).toBe(false);
			expect(isVNode([])).toBe(false);
			expect(isVNode(10)).toBe(false);
			expect(isVNode(undefined)).toBe(false);
			expect(isVNode(null)).toBe(false);
		});
	});

	describe('isVNodeOfType', () => {
		it('should return true for VNodes with a specified type', () => {
			expect(isVNodeOfType(createElement('div'), 'div')).toBe(true);
			expect(isVNodeOfType(createElement(FunctionalComponent), FunctionalComponent)).toBe(true);
			expect(isVNodeOfType(createElement(CreateClassComponent), CreateClassComponent)).toBe(true);
			expect(isVNodeOfType(createElement(ExtendClassComponent), ExtendClassComponent)).toBe(true);
		});

		it('should return false for VNodes with a specified type', () => {
			expect(isVNodeOfType(createElement('div'), 'h1')).toBe(false);
			expect(isVNodeOfType(createElement(FunctionalComponent), CreateClassComponent)).toBe(false);
			expect(isVNodeOfType(createElement(CreateClassComponent), ExtendClassComponent)).toBe(false);
			expect(isVNodeOfType(createElement(ExtendClassComponent), FunctionalComponent)).toBe(false);
		});
	});

	describe('isDOMVNode', () => {
		it('should return true for VNodes of type string', () => {
			expect(isDOMVNode(createElement('div'))).toBe(true);
			expect(isDOMVNode(createElement('h1'))).toBe(true);
			expect(isDOMVNode(createElement('p'))).toBe(true);
		});

		it('should return false for VNodes of type function or class', () => {
			expect(isDOMVNode(createElement(CreateClassComponent))).toBe(false);
			expect(isDOMVNode(createElement(ExtendClassComponent))).toBe(false);
			expect(isDOMVNode(createElement(FunctionalComponent))).toBe(false);
		});
	});

	describe('isDOMVNodeOfType', () => {
		it('should return true for VNodes of specific string type', () => {
			expect(isDOMVNodeOfType(createElement('div'), 'div')).toBe(true);
			expect(isDOMVNodeOfType(createElement('h1'), 'h1')).toBe(true);
			expect(isDOMVNodeOfType(createElement('p'), 'p')).toBe(true);
		});

		it('should return false for VNodes of incorrect type', () => {
			expect(isDOMVNodeOfType(createElement('div'), 'foo')).toBe(false);
			expect(isDOMVNodeOfType(createElement('div'), {})).toBe(false);
			expect(isDOMVNodeOfType(createElement('div'), [])).toBe(false);
			expect(isDOMVNodeOfType(createElement('div'), 10)).toBe(false);
			expect(isDOMVNodeOfType(createElement('div'), undefined)).toBe(false);
			expect(isDOMVNodeOfType(createElement('div'), null)).toBe(false);
		});
	});

	describe('isFunctionalVNode', () => {
		it('should return true for VNodes of stateless function type', () => {
			expect(isFunctionalVNode(createElement(FunctionalComponent))).toBe(true);
		});

		it('should return false for VNodes of incorrect type', () => {
			expect(isFunctionalVNode(createElement(CreateClassComponent))).toBe(false);
			expect(isFunctionalVNode(createElement(ExtendClassComponent))).toBe(false);
			expect(isFunctionalVNode(createElement('div'))).toBe(false);
		});
	});

	describe('isFunctionalVNodeOfType', () => {
		it('should return true for VNodes of specific stateless function type', () => {
			expect(isFunctionalVNodeOfType(createElement(FunctionalComponent), FunctionalComponent)).toBe(true);
		});

		it('should return false for VNodes of incorrect type', () => {
			expect(isFunctionalVNodeOfType(createElement(FunctionalComponent), AnotherFunctionalComponent)).toBe(false);
			expect(isFunctionalVNodeOfType(createElement(FunctionalComponent), CreateClassComponent)).toBe(false);
			expect(isFunctionalVNodeOfType(createElement(FunctionalComponent), ExtendClassComponent)).toBe(false);
		});
	});

	describe('isClassVNode', () => {
		it('should return true for VNodes of class type', () => {
			expect(isClassVNode(createElement(CreateClassComponent))).toBe(true);
			expect(isClassVNode(createElement(ExtendClassComponent))).toBe(true);
		});

		it('should return false for VNodes of incorrect type', () => {
			expect(isClassVNode(createElement(FunctionalComponent))).toBe(false);
			expect(isClassVNode(createElement('div'))).toBe(false);
		});
	});

	describe('isClassVNodeOfType', () => {
		it('should return true for VNodes of specific class type', () => {
			expect(isClassVNodeOfType(createElement(CreateClassComponent), CreateClassComponent)).toBe(true);
			expect(isClassVNodeOfType(createElement(ExtendClassComponent), ExtendClassComponent)).toBe(true);
		});

		it('should return false for VNodes of incorrect type', () => {
			expect(isClassVNodeOfType(createElement(CreateClassComponent), AnotherCreateClassComponent)).toBe(false);
			expect(isClassVNodeOfType(createElement(CreateClassComponent), AnotherExtendClassComponent)).toBe(false);
			expect(isClassVNodeOfType(createElement(CreateClassComponent), FunctionalComponent)).toBe(false);

			expect(isClassVNodeOfType(createElement(ExtendClassComponent), AnotherCreateClassComponent)).toBe(false);
			expect(isClassVNodeOfType(createElement(ExtendClassComponent), AnotherExtendClassComponent)).toBe(false);
			expect(isClassVNodeOfType(createElement(ExtendClassComponent), FunctionalComponent)).toBe(false);
		});
	});

	describe('isDOMElement', () => {
		it('should return true for DOMElements', () => {
			expect(isDOMElement(createDOMElement('div'))).toBe(true);
			expect(isDOMElement(createDOMElement('h1'))).toBe(true);
			expect(isDOMElement(createDOMElement('p'))).toBe(true);
		});

		it('should return false for non-DOMElements', () => {
			expect(isDOMElement(createElement(CreateClassComponent))).toBe(false);
			expect(isDOMElement(createElement(ExtendClassComponent))).toBe(false);
			expect(isDOMElement(createElement(FunctionalComponent))).toBe(false);
			expect(isDOMElement(createElement('div'))).toBe(false);
			expect(isDOMElement(CreateClassComponent)).toBe(false);
			expect(isDOMElement(ExtendClassComponent)).toBe(false);
			expect(isDOMElement(FunctionalComponent)).toBe(false);
			expect(isDOMElement('div')).toBe(false);
			expect(isDOMElement(undefined)).toBe(false);
			expect(isDOMElement(null)).toBe(false);
			expect(isDOMElement({})).toBe(false);
			expect(isDOMElement([])).toBe(false);
			expect(isDOMElement(10)).toBe(false);
		});
	});

	describe('isDOMElementOfType', () => {
		it('should return true for DOMElements of specific type', () => {
			expect(isDOMElementOfType(createDOMElement('div'), 'div')).toBe(true);
			expect(isDOMElementOfType(createDOMElement('div'), 'DIV')).toBe(true);
			expect(isDOMElementOfType(createDOMElement('h1'), 'h1')).toBe(true);
			expect(isDOMElementOfType(createDOMElement('h1'), 'H1')).toBe(true);
			expect(isDOMElementOfType(createDOMElement('p'), 'p')).toBe(true);
			expect(isDOMElementOfType(createDOMElement('p'), 'P')).toBe(true);
		});

		it('should return false for DOMElements of incorrect type', () => {
			expect(isDOMElementOfType(createDOMElement('div'), 'foo')).toBe(false);
			expect(isDOMElementOfType(createDOMElement('div'), {})).toBe(false);
			expect(isDOMElementOfType(createDOMElement('div'), [])).toBe(false);
			expect(isDOMElementOfType(createDOMElement('div'), 10)).toBe(false);
			expect(isDOMElementOfType(createDOMElement('div'), undefined)).toBe(false);
			expect(isDOMElementOfType(createDOMElement('div'), null)).toBe(false);
		});
	});

	describe('isRenderedClassComponent', () => {
		const DOMVNode = createElement('div');
		const functionalVNode = createElement(FunctionalComponent);
		const createClassVNode = createElement(CreateClassComponent);
		const extendClassVNode = createElement(ExtendClassComponent);

		it('should return true for rendered Class Components', () => {
			expect(isRenderedClassComponent(render(createClassVNode, createDOMElement('div')))).toBe(true);
			expect(isRenderedClassComponent(render(extendClassVNode, createDOMElement('div')))).toBe(true);
		});

		it('should return false for non-rendered Class Components', () => {
			expect(isRenderedClassComponent(createClassVNode)).toBe(false);
			expect(isRenderedClassComponent(extendClassVNode)).toBe(false);
			expect(isRenderedClassComponent(render(functionalVNode, createDOMElement('div')))).toBe(false);
			expect(isRenderedClassComponent(render(DOMVNode, createDOMElement('div')))).toBe(false);
		});
	});

	describe('isRenderedClassComponentOfType', () => {
		const createClassVNode = createElement(CreateClassComponent);
		const extendClassVNode = createElement(ExtendClassComponent);

		it('should return true for rendered Class Components of specific type', () => {
			expect(
				isRenderedClassComponentOfType(render(createClassVNode, createDOMElement('div')), CreateClassComponent),
			).toBe(true);
			expect(
				isRenderedClassComponentOfType(render(extendClassVNode, createDOMElement('div')), ExtendClassComponent),
			).toBe(true);
		});

		it('should return false for rendered Class Components of incorrect type', () => {
			expect(
				isRenderedClassComponentOfType(render(createClassVNode, createDOMElement('div')), AnotherCreateClassComponent),
			).toBe(false);
			expect(
				isRenderedClassComponentOfType(render(createClassVNode, createDOMElement('div')), ExtendClassComponent),
			).toBe(false);
			expect(
				isRenderedClassComponentOfType(render(createClassVNode, createDOMElement('div')), FunctionalComponent),
			).toBe(false);
			expect(isRenderedClassComponentOfType(render(createClassVNode, createDOMElement('div')), 'div')).toBe(false);

			expect(
				isRenderedClassComponentOfType(render(extendClassVNode, createDOMElement('div')), AnotherExtendClassComponent),
			).toBe(false);
			expect(
				isRenderedClassComponentOfType(render(extendClassVNode, createDOMElement('div')), CreateClassComponent),
			).toBe(false);
			expect(
				isRenderedClassComponentOfType(render(extendClassVNode, createDOMElement('div')), FunctionalComponent),
			).toBe(false);
			expect(isRenderedClassComponentOfType(render(extendClassVNode, createDOMElement('div')), 'div')).toBe(false);
		});
	});

	describe('renderIntoDocument', () => {
		it('should return a rendered class component', () => {
			expect(isRenderedClassComponent(renderIntoDocument(createElement('div')))).toBe(true);
			expect(isRenderedClassComponent(renderIntoDocument(createElement(FunctionalComponent)))).toBe(true);
			expect(isRenderedClassComponent(renderIntoDocument(createElement(CreateClassComponent)))).toBe(true);
			expect(isRenderedClassComponent(renderIntoDocument(createElement(ExtendClassComponent)))).toBe(true);
		});
	});

	describe('findAllInRenderedTree', () => {
		const tree = renderIntoDocument(
			<section className="outer">
				<FunctionalComponent />
			</section>,
		);

		it('should throw an error when not passed a rendered class component', () => {
			const errorRegex = /findAllInRenderedTree/;
			const predicate = vNode => {
				return true;
			};
			const testValue = value => {
				expect(() => {
					findAllInRenderedTree(value, predicate);
				}).toThrowError(Error);
			};
			testValue(createElement(CreateClassComponent));
			testValue(createElement(ExtendClassComponent));
			testValue(createElement(FunctionalComponent));
			testValue(createElement('div'));
			testValue(CreateClassComponent);
			testValue(ExtendClassComponent);
			testValue(FunctionalComponent);
			testValue(createDOMElement('div'));
			testValue(undefined);
			testValue(null);
			testValue('foo');
			testValue({});
			testValue([]);
			testValue(10);
		});

		it('should call predicate for each VNode instance in a rendered tree', () => {
			const predicate = sinon.spy();
			sinon.assert.notCalled(predicate);
			findAllInRenderedTree(tree, predicate);
			// 0: section
			// 1: FunctionalComponent
			// 2: div
			sinon.assert.callCount(predicate, 3);
			sinon.assert.calledWithMatch(predicate, { type: 'section' });
			sinon.assert.calledWithMatch(predicate, { type: FunctionalComponent });
			sinon.assert.calledWithMatch(predicate, { type: 'div' });
		});

		it('should call predicate in the correct order', () => {
			const types = [];
			findAllInRenderedTree(tree, ({ type }) => types.push(type));
			expect(types).toEqual(['section', FunctionalComponent, 'div']);
		});

		it('should work with interpolated text', () => {
			const predicate = sinon.spy();
			const Hello = ({ who }) => <div>Hello, {who}!</div>;
			const treeWithText = renderIntoDocument(<Hello who="world" />);
			sinon.assert.notCalled(predicate);
			findAllInRenderedTree(treeWithText, predicate);
			sinon.assert.callCount(predicate, 5);
			sinon.assert.calledWithMatch(predicate, { type: Hello });
			sinon.assert.calledWithMatch(predicate, { type: 'div' });
			sinon.assert.calledWithMatch(predicate, { children: 'Hello, ' });
			sinon.assert.calledWithMatch(predicate, { children: 'world' });
			sinon.assert.calledWithMatch(predicate, { children: '!' });
		});
	});

	describe('findAllInVNodeTree', () => {
		const tree = (
			<section className="outer">
				<FunctionalComponent />
			</section>
		);

		it('should throw an error when not passed a VNode', () => {
			const errorRegex = /findAllInVNodeTree/;
			const predicate = vNode => {
				return true;
			};
			const testValue = value => {
				expect(() => {
					findAllInVNodeTree(value, predicate);
				}).toThrowError(Error);
			};
			testValue(renderIntoDocument(<div />));
			testValue(CreateClassComponent);
			testValue(ExtendClassComponent);
			testValue(FunctionalComponent);
			testValue(createDOMElement('div'));
			testValue(undefined);
			testValue(null);
			testValue('foo');
			testValue({});
			testValue([]);
			testValue(10);
		});

		it('should call predicate for each VNode instance in an non-rendered tree', () => {
			const predicate = sinon.spy();
			sinon.assert.notCalled(predicate);
			findAllInVNodeTree(tree, predicate);
			// 0: section
			// 1: FunctionalComponent
			sinon.assert.callCount(predicate, 2);
			sinon.assert.calledWithMatch(predicate, { type: 'section' });
			sinon.assert.calledWithMatch(predicate, { type: FunctionalComponent });
		});

		it('should call predicate in the correct order', () => {
			const types = [];
			findAllInVNodeTree(tree, ({ type }) => types.push(type));
			expect(types).toEqual(['section', FunctionalComponent]);
		});
	});

	describe('scryRenderedDOMElementsWithClass', () => {
		const tree = renderIntoDocument(
			<div className="level-1 one">
				<div className="level-2 one">
					<div className="level-3 one" />
				</div>
				<div className="level-2 two">
					<span className="level-3 two" />
				</div>
			</div>,
		);

		it('should return an array of matched DOM elements', () => {
			const result1 = scryRenderedDOMElementsWithClass(tree, 'one');
			expect(result1.length).toBeCloseTo(3);

			const result2 = scryRenderedDOMElementsWithClass(tree, 'two');
			expect(result2.length).toBeCloseTo(2);

			const result3 = scryRenderedDOMElementsWithClass(tree, 'three');
			expect(result3.length).toBeCloseTo(0);
		});

		it('should accept a space separated string of class names', () => {
			const result1 = scryRenderedDOMElementsWithClass(tree, 'level-2');
			expect(result1.length).toBeCloseTo(2);

			const result2 = scryRenderedDOMElementsWithClass(tree, 'level-2 one');
			expect(result2.length).toBeCloseTo(1);
		});

		it('should accept an array of class names', () => {
			const result = scryRenderedDOMElementsWithClass(tree, ['level-2', 'one']);
			expect(result.length).toBeCloseTo(1);
		});
	});

	describe('scryRenderedDOMElementsWithTag', () => {
		const tree = renderIntoDocument(
			<div>
				<header>
					<h1>Hello</h1>
				</header>
				<section>
					<h1>Hello Again</h1>
					<p>Paragraph 1</p>
					<p>Paragraph 2</p>
					<p>Paragraph 3</p>
				</section>
			</div>,
		);

		it('should return an array of matched DOM elements', () => {
			const testValue = (tagName, length, instance) => {
				const result = scryRenderedDOMElementsWithTag(tree, tagName);
				expect(result.length).toBeCloseTo(length);
			};
			testValue('div', 1, window.HTMLDivElement);
			testValue('h1', 2, window.HTMLHeadingElement);
			testValue('p', 3, window.HTMLParagraphElement);
			testValue('span', 0, window.HTMLSpanElement);
		});
	});

	describe('scryRenderedVNodesWithType', () => {
		const tree = renderIntoDocument(
			<div>
				<FunctionalComponent />
				<FunctionalComponent />
				<CreateClassComponent />
				<CreateClassComponent />
				<ExtendClassComponent />
				<ExtendClassComponent />
			</div>,
		);

		it('should return an array of matched VNodes', () => {
			const testValue = (type, length) => {
				const result = scryRenderedVNodesWithType(tree, type);
				expect(result.length).toBeCloseTo(length);
				result.forEach(item => {
					expect(Object.keys(item)).toEqual(expect.arrayContaining(VNodeKeys));
					expect(isVNode(item)).toBe(true);
				});
			};
			testValue('p', 0);
			testValue('div', 7); // Outer div + each rendered component div
			testValue(FunctionalComponent, 2);
			testValue(CreateClassComponent, 2);
			testValue(ExtendClassComponent, 2);
			testValue(AnotherFunctionalComponent, 0);
		});
	});

	describe('scryVNodesWithType', () => {
		const tree = (
			<div>
				<FunctionalComponent />
				<FunctionalComponent />
				<CreateClassComponent />
				<CreateClassComponent />
				<ExtendClassComponent />
				<ExtendClassComponent />
			</div>
		);

		it('should return an array of matched VNodes', () => {
			const testValue = (type, length) => {
				const result = scryVNodesWithType(tree, type);
				expect(result.length).toBeCloseTo(length);
				result.forEach(item => {
					expect(Object.keys(item)).toEqual(expect.arrayContaining(VNodeKeys));
					expect(isVNode(item)).toBe(true);
				});
			};
			testValue('p', 0);
			testValue('div', 1); // Just the outer div
			testValue(FunctionalComponent, 2);
			testValue(CreateClassComponent, 2);
			testValue(ExtendClassComponent, 2);
			testValue(AnotherFunctionalComponent, 0);
		});
	});

	describe('findRenderedDOMElementWithClass', () => {
		const tree = renderIntoDocument(
			<div className="level-1 one">
				<div className="level-2 one">
					<div className="level-3 one" />
				</div>
				<div className="level-2 two">
					<span className="level-3 two" />
				</div>
			</div>,
		);

		it('should throw an error when more than one result is found #1', () => {
			const errorRegex = /Did not find exactly one match/;
			const testValue = classNames => {
				expect(() => {
					findRenderedDOMElementWithClass(tree, classNames);
				}).toThrowError(Error);
			};
			testValue('level-2');
			testValue('level-3');
		});

		it('should return a matched DOM element', () => {
			const testValue = (classNames, instance) => {
				const result = findRenderedDOMElementWithClass(tree, classNames);
			};
			testValue('level-1', window.HTMLDivElement);
			testValue('level-2 one', window.HTMLDivElement);
			testValue('level-3 two', window.HTMLSpanElement);
		});

		it('should be able to handle null elements', () => {
			const NoOp = () => null;
			const Broken = () => <div className="dummy"><NoOp /></div>;
			const renderedTree = renderIntoDocument(<Broken />);
			const dummy = findRenderedDOMElementWithClass(renderedTree, 'dummy');
			expect(dummy.className).toBe('dummy');
		});
	});

	describe('findRenderedDOMElementWithTag', () => {
		const tree = renderIntoDocument(
			<div>
				<header>
					<h1>Head1</h1>
					<span>Hello</span>
				</header>
				<section>
					<h1>Hello Again</h1>
					<p>Paragraph 1</p>
					<p>Paragraph 2</p>
					<p>Paragraph 3</p>
					<a>test</a>
				</section>
			</div>,
		);

		it('should throw an error when more than one result is found #2', () => {
			const errorRegex = /Did not find exactly one match/;
			const testValue = tagName => {
				expect(() => {
					findRenderedDOMElementWithTag(tree, tagName);
				}).toThrowError(Error);
			};
			testValue('h1');
			testValue('p');
		});

		it('should return a matched DOM element', () => {
			const testValue = (tagName, instance) => {
				const result = findRenderedDOMElementWithTag(tree, tagName);
				expect(typeof result).toEqual(typeof instance);
			};
			testValue('div', window.HTMLDivElement);
			testValue('span', window.HTMLSpanElement);
			testValue('a', window.HTMLAnchorElement);
		});
	});

	describe('findRenderedVNodeWithType', () => {
		const tree = renderIntoDocument(
			<div>
				<h1>Hello</h1>
				<FunctionalComponent />
				<FunctionalComponent />
				<CreateClassComponent />
				<ExtendClassComponent />
			</div>,
		);

		it('should throw an error when more than one result is found #3', () => {
			const errorRegex = /Did not find exactly one match/;
			const testValue = type => {
				expect(() => {
					findRenderedVNodeWithType(tree, type);
				}).toThrowError(Error);
			};
			testValue('div');
			testValue(FunctionalComponent);
		});

		it('should return a matched VNode #1', () => {
			const testValue = type => {
				const result = findRenderedVNodeWithType(tree, type);
				expect(isVNode(result)).toBe(true);
				expect(result.type).toBe(type);
			};
			testValue('h1');
			testValue(CreateClassComponent);
			testValue(ExtendClassComponent);
		});
	});

	describe('findVNodeWithType', () => {
		const tree = (
			<div>
				<div>
					<h1>Hello</h1>
				</div>
				<FunctionalComponent />
				<FunctionalComponent />
				<CreateClassComponent />
				<ExtendClassComponent />
			</div>
		);

		it('should throw an error when more than one result is found #4', () => {
			const errorRegex = /Did not find exactly one match/;
			const testValue = type => {
				expect(() => {
					findVNodeWithType(tree, type);
				}).toThrowError(Error);
			};
			testValue('div');
			testValue(FunctionalComponent);
		});

		it('should return a matched VNode #2', () => {
			const testValue = type => {
				const result = findVNodeWithType(tree, type);
				expect(isVNode(result)).toBe(true);
				expect(result.type).toBe(type);
			};
			testValue('h1');
			testValue(CreateClassComponent);
			testValue(ExtendClassComponent);
		});
	});
});
