
import { render } from 'inferno';
import { assert, spy } from 'sinon';
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
	scryVNodesWithType
} from '../dist-es';

const VNodeKeys = [
	'children',
	'className',
	'dom',
	'flags',
	'key',
	'ref',
	'props',
	'type'
];

const createDOMElement = (tagName) => document.createElement(tagName);

const FunctionalComponent = function (props) {
	return createElement('div', props);
};

const AnotherFunctionalComponent = function (props) {
	return createElement('div', props);
};

const CreateClassComponent = createClass({
	render() {
		return createElement('div', this.props);
	}
});

const AnotherCreateClassComponent = createClass({
	render() {
		return createElement('div', this.props);
	}
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
			expect(isVNode(createElement('div'))).to.be.true;
			expect(isVNode(createElement(CreateClassComponent))).to.be.true;
			expect(isVNode(createElement(ExtendClassComponent))).to.be.true;
			expect(isVNode(createElement(FunctionalComponent))).to.be.true;
			expect(isVNode(<CreateClassComponent/>)).to.be.true;
			expect(isVNode(<ExtendClassComponent/>)).to.be.true;
			expect(isVNode(<FunctionalComponent/>)).to.be.true;
			expect(isVNode(<div/>)).to.be.true;
		});

		it('should return false for non-VNodes', () => {
			expect(isVNode(CreateClassComponent)).to.be.false;
			expect(isVNode(ExtendClassComponent)).to.be.false;
			expect(isVNode(FunctionalComponent)).to.be.false;
			expect(isVNode(createDOMElement('div'))).to.be.false;
			expect(isVNode('foo')).to.be.false;
			expect(isVNode({})).to.be.false;
			expect(isVNode([])).to.be.false;
			expect(isVNode(10)).to.be.false;
			expect(isVNode(undefined)).to.be.false;
			expect(isVNode(null)).to.be.false;
		});
	});

	describe('isVNodeOfType', () => {

		it('should return true for VNodes with a specified type', () => {
			expect(isVNodeOfType(createElement('div'), 'div')).to.be.true;
			expect(isVNodeOfType(createElement(FunctionalComponent), FunctionalComponent)).to.be.true;
			expect(isVNodeOfType(createElement(CreateClassComponent), CreateClassComponent)).to.be.true;
			expect(isVNodeOfType(createElement(ExtendClassComponent), ExtendClassComponent)).to.be.true;
		});

		it('should return false for VNodes with a specified type', () => {
			expect(isVNodeOfType(createElement('div'), 'h1')).to.be.false;
			expect(isVNodeOfType(createElement(FunctionalComponent), CreateClassComponent)).to.be.false;
			expect(isVNodeOfType(createElement(CreateClassComponent), ExtendClassComponent)).to.be.false;
			expect(isVNodeOfType(createElement(ExtendClassComponent), FunctionalComponent)).to.be.false;
		});
	});

	describe('isDOMVNode', () => {

		it('should return true for VNodes of type string', () => {
			expect(isDOMVNode(createElement('div'))).to.be.true;
			expect(isDOMVNode(createElement('h1'))).to.be.true;
			expect(isDOMVNode(createElement('p'))).to.be.true;
		});

		it('should return false for VNodes of type function or class', () => {
			expect(isDOMVNode(createElement(CreateClassComponent))).to.be.false;
			expect(isDOMVNode(createElement(ExtendClassComponent))).to.be.false;
			expect(isDOMVNode(createElement(FunctionalComponent))).to.be.false;
		});
	});

	describe('isDOMVNodeOfType', () => {

		it('should return true for VNodes of specific string type', () => {
			expect(isDOMVNodeOfType(createElement('div'), 'div')).to.be.true;
			expect(isDOMVNodeOfType(createElement('h1'), 'h1')).to.be.true;
			expect(isDOMVNodeOfType(createElement('p'), 'p')).to.be.true;
		});

		it('should return false for VNodes of incorrect type', () => {
			expect(isDOMVNodeOfType(createElement('div'), 'foo')).to.be.false;
			expect(isDOMVNodeOfType(createElement('div'), {})).to.be.false;
			expect(isDOMVNodeOfType(createElement('div'), [])).to.be.false;
			expect(isDOMVNodeOfType(createElement('div'), 10)).to.be.false;
			expect(isDOMVNodeOfType(createElement('div'), undefined)).to.be.false;
			expect(isDOMVNodeOfType(createElement('div'), null)).to.be.false;
		});
	});

	describe('isFunctionalVNode', () => {

		it('should return true for VNodes of stateless function type', () => {
			expect(isFunctionalVNode(createElement(FunctionalComponent))).to.be.true;
		});

		it('should return false for VNodes of incorrect type', () => {
			expect(isFunctionalVNode(createElement(CreateClassComponent))).to.be.false;
			expect(isFunctionalVNode(createElement(ExtendClassComponent))).to.be.false;
			expect(isFunctionalVNode(createElement('div'))).to.be.false;
		});
	});

	describe('isFunctionalVNodeOfType', () => {

		it('should return true for VNodes of specific stateless function type', () => {
			expect(isFunctionalVNodeOfType(createElement(FunctionalComponent), FunctionalComponent)).to.be.true;
		});

		it('should return false for VNodes of incorrect type', () => {
			expect(isFunctionalVNodeOfType(createElement(FunctionalComponent), AnotherFunctionalComponent)).to.be.false;
			expect(isFunctionalVNodeOfType(createElement(FunctionalComponent), CreateClassComponent)).to.be.false;
			expect(isFunctionalVNodeOfType(createElement(FunctionalComponent), ExtendClassComponent)).to.be.false;
		});
	});

	describe('isClassVNode', () => {

		it('should return true for VNodes of class type', () => {
			expect(isClassVNode(createElement(CreateClassComponent))).to.be.true;
			expect(isClassVNode(createElement(ExtendClassComponent))).to.be.true;
		});

		it('should return false for VNodes of incorrect type', () => {
			expect(isClassVNode(createElement(FunctionalComponent))).to.be.false;
			expect(isClassVNode(createElement('div'))).to.be.false;
		});
	});

	describe('isClassVNodeOfType', () => {

		it('should return true for VNodes of specific class type', () => {
			expect(isClassVNodeOfType(createElement(CreateClassComponent), CreateClassComponent)).to.be.true;
			expect(isClassVNodeOfType(createElement(ExtendClassComponent), ExtendClassComponent)).to.be.true;
		});

		it('should return false for VNodes of incorrect type', () => {
			expect(isClassVNodeOfType(createElement(CreateClassComponent), AnotherCreateClassComponent)).to.be.false;
			expect(isClassVNodeOfType(createElement(CreateClassComponent), AnotherExtendClassComponent)).to.be.false;
			expect(isClassVNodeOfType(createElement(CreateClassComponent), FunctionalComponent)).to.be.false;

			expect(isClassVNodeOfType(createElement(ExtendClassComponent), AnotherCreateClassComponent)).to.be.false;
			expect(isClassVNodeOfType(createElement(ExtendClassComponent), AnotherExtendClassComponent)).to.be.false;
			expect(isClassVNodeOfType(createElement(ExtendClassComponent), FunctionalComponent)).to.be.false;
		});
	});

	describe('isDOMElement', () => {

		it('should return true for DOMElements', () => {
			expect(isDOMElement(createDOMElement('div'))).to.be.true;
			expect(isDOMElement(createDOMElement('h1'))).to.be.true;
			expect(isDOMElement(createDOMElement('p'))).to.be.true;
		});

		it('should return false for non-DOMElements', () => {
			expect(isDOMElement(createElement(CreateClassComponent))).to.be.false;
			expect(isDOMElement(createElement(ExtendClassComponent))).to.be.false;
			expect(isDOMElement(createElement(FunctionalComponent))).to.be.false;
			expect(isDOMElement(createElement('div'))).to.be.false;
			expect(isDOMElement(CreateClassComponent)).to.be.false;
			expect(isDOMElement(ExtendClassComponent)).to.be.false;
			expect(isDOMElement(FunctionalComponent)).to.be.false;
			expect(isDOMElement('div')).to.be.false;
			expect(isDOMElement(undefined)).to.be.false;
			expect(isDOMElement(null)).to.be.false;
			expect(isDOMElement({})).to.be.false;
			expect(isDOMElement([])).to.be.false;
			expect(isDOMElement(10)).to.be.false;
		});
	});

	describe('isDOMElementOfType', () => {

		it('should return true for DOMElements of specific type', () => {
			expect(isDOMElementOfType(createDOMElement('div'), 'div')).to.be.true;
			expect(isDOMElementOfType(createDOMElement('div'), 'DIV')).to.be.true;
			expect(isDOMElementOfType(createDOMElement('h1'), 'h1')).to.be.true;
			expect(isDOMElementOfType(createDOMElement('h1'), 'H1')).to.be.true;
			expect(isDOMElementOfType(createDOMElement('p'), 'p')).to.be.true;
			expect(isDOMElementOfType(createDOMElement('p'), 'P')).to.be.true;
		});

		it('should return false for DOMElements of incorrect type', () => {
			expect(isDOMElementOfType(createDOMElement('div'), 'foo')).to.be.false;
			expect(isDOMElementOfType(createDOMElement('div'), {})).to.be.false;
			expect(isDOMElementOfType(createDOMElement('div'), [])).to.be.false;
			expect(isDOMElementOfType(createDOMElement('div'), 10)).to.be.false;
			expect(isDOMElementOfType(createDOMElement('div'), undefined)).to.be.false;
			expect(isDOMElementOfType(createDOMElement('div'), null)).to.be.false;
		});
	});

	describe('isRenderedClassComponent', () => {

		const DOMVNode = createElement('div');
		const functionalVNode = createElement(FunctionalComponent);
		const createClassVNode = createElement(CreateClassComponent);
		const extendClassVNode = createElement(ExtendClassComponent);

		it('should return true for rendered Class Components', () => {
			expect(isRenderedClassComponent(
				render(createClassVNode, createDOMElement('div'))
			)).to.be.true;
			expect(isRenderedClassComponent(
				render(extendClassVNode, createDOMElement('div'))
			)).to.be.true;
		});

		it('should return false for non-rendered Class Components', () => {
			expect(isRenderedClassComponent(createClassVNode)).to.be.false;
			expect(isRenderedClassComponent(extendClassVNode)).to.be.false;
			expect(isRenderedClassComponent(
				render(functionalVNode, createDOMElement('div'))
			)).to.be.false;
			expect(isRenderedClassComponent(
				render(DOMVNode, createDOMElement('div'))
			)).to.be.false;
		});
	});

	describe('isRenderedClassComponentOfType', () => {

		const createClassVNode = createElement(CreateClassComponent);
		const extendClassVNode = createElement(ExtendClassComponent);

		it('should return true for rendered Class Components of specific type', () => {
			expect(isRenderedClassComponentOfType(
				render(createClassVNode, createDOMElement('div')),
				CreateClassComponent)).to.be.true;
			expect(isRenderedClassComponentOfType(
				render(extendClassVNode, createDOMElement('div')),
				ExtendClassComponent)).to.be.true;
		});

		it('should return false for rendered Class Components of incorrect type', () => {
			expect(isRenderedClassComponentOfType(
				render(createClassVNode, createDOMElement('div')),
				AnotherCreateClassComponent)).to.be.false;
			expect(isRenderedClassComponentOfType(
				render(createClassVNode, createDOMElement('div')),
				ExtendClassComponent)).to.be.false;
			expect(isRenderedClassComponentOfType(
				render(createClassVNode, createDOMElement('div')),
				FunctionalComponent)).to.be.false;
			expect(isRenderedClassComponentOfType(
				render(createClassVNode, createDOMElement('div')),
				'div')).to.be.false;

			expect(isRenderedClassComponentOfType(
				render(extendClassVNode, createDOMElement('div')),
				AnotherExtendClassComponent)).to.be.false;
			expect(isRenderedClassComponentOfType(
				render(extendClassVNode, createDOMElement('div')),
				CreateClassComponent)).to.be.false;
			expect(isRenderedClassComponentOfType(
				render(extendClassVNode, createDOMElement('div')),
				FunctionalComponent)).to.be.false;
			expect(isRenderedClassComponentOfType(
				render(extendClassVNode, createDOMElement('div')),
				'div')).to.be.false;
		});
	});

	describe('renderIntoDocument', () => {

		it('should return a rendered class component', () => {
			expect(isRenderedClassComponent(
				renderIntoDocument(createElement('div'))
			)).to.be.true;
			expect(isRenderedClassComponent(
				renderIntoDocument(createElement(FunctionalComponent))
			)).to.be.true;
			expect(isRenderedClassComponent(
				renderIntoDocument(createElement(CreateClassComponent))
			)).to.be.true;
			expect(isRenderedClassComponent(
				renderIntoDocument(createElement(ExtendClassComponent))
			)).to.be.true;
		});
	});

	describe('findAllInRenderedTree', () => {

		const tree = renderIntoDocument(
			<section className="outer">
				<FunctionalComponent/>
			</section>
		);

		it('should throw an error when not passed a rendered class component', () => {
			const errorRegex = /findAllInRenderedTree/;
			const predicate = (vNode) => {
				return true;
			};
			const testValue = (value) => {
				expect(() => {
					findAllInRenderedTree(value, predicate);
				}).to.throw(Error, errorRegex);
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
			const predicate = spy();
			assert.notCalled(predicate);
			findAllInRenderedTree(tree, predicate);
			// 0: section
			// 1: FunctionalComponent
			// 2: div
			assert.callCount(predicate, 3);
			assert.calledWithMatch(predicate, { type: 'section' });
			assert.calledWithMatch(predicate, { type: FunctionalComponent });
			assert.calledWithMatch(predicate, { type: 'div' });
		});

		it('should call predicate in the correct order', () => {
			const types = [];
			findAllInRenderedTree(tree, ({ type }) => types.push(type));
			expect(types).to.eql([ 'section', FunctionalComponent, 'div' ]);
		});

		it('should work with interpolated text', () => {
			const predicate = sinon.spy();
			const Hello = ({ who }) => (<div>Hello, {who}!</div>);
			const treeWithText = renderIntoDocument(<Hello who="world"/>);
			assert.notCalled(predicate);
			findAllInRenderedTree(treeWithText, predicate);
			assert.callCount(predicate, 5);
			assert.calledWithMatch(predicate, { type: Hello });
			assert.calledWithMatch(predicate, { type: 'div' });
			assert.calledWithMatch(predicate, { children: 'Hello, ' });
			assert.calledWithMatch(predicate, { children: 'world' });
			assert.calledWithMatch(predicate, { children: '!' });
		});
	});

	describe('findAllInVNodeTree', () => {

		const tree = (
			<section className="outer">
				<FunctionalComponent/>
			</section>
		);

		it('should throw an error when not passed a VNode', () => {
			const errorRegex = /findAllInVNodeTree/;
			const predicate = (vNode) => {
				return true;
			};
			const testValue = (value) => {
				expect(() => {
					findAllInVNodeTree(value, predicate);
				}).to.throw(Error, errorRegex);
			};
			testValue(renderIntoDocument(<div/>));
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
			const predicate = spy();
			assert.notCalled(predicate);
			findAllInVNodeTree(tree, predicate);
			// 0: section
			// 1: FunctionalComponent
			assert.callCount(predicate, 2);
			assert.calledWithMatch(predicate, { type: 'section' });
			assert.calledWithMatch(predicate, { type: FunctionalComponent });
		});

		it('should call predicate in the correct order', () => {
			const types = [];
			findAllInVNodeTree(tree, ({ type }) => types.push(type));
			expect(types).to.eql([ 'section', FunctionalComponent ]);
		});
	});

	describe('scryRenderedDOMElementsWithClass', () => {

		const tree = renderIntoDocument(
			<div className="level-1 one">
				<div className="level-2 one">
					<div className="level-3 one"/>
				</div>
				<div className="level-2 two">
					<span className="level-3 two"/>
				</div>
			</div>
		);

		it('should return an array of matched DOM elements', () => {
			const result1 = scryRenderedDOMElementsWithClass(tree, 'one');
			expect(result1).to.be.instanceof(Array);
			expect(result1).to.have.lengthOf(3);
			result1.forEach((result) => {
				expect(result).to.be.instanceof(window.HTMLDivElement);
			});

			const result2 = scryRenderedDOMElementsWithClass(tree, 'two');
			expect(result2).to.be.instanceof(Array);
			expect(result2).to.have.lengthOf(2);
			expect(result2[ 0 ]).to.be.instanceof(window.HTMLDivElement);
			expect(result2[ 1 ]).to.be.instanceof(window.HTMLSpanElement);

			const result3 = scryRenderedDOMElementsWithClass(tree, 'three');
			expect(result3).to.be.instanceof(Array);
			expect(result3).to.have.lengthOf(0);
		});

		it('should accept a space separated string of class names', () => {
			const result1 = scryRenderedDOMElementsWithClass(tree, 'level-2');
			expect(result1).to.be.instanceof(Array);
			expect(result1).to.have.lengthOf(2);

			const result2 = scryRenderedDOMElementsWithClass(tree, 'level-2 one');
			expect(result2).to.be.instanceof(Array);
			expect(result2).to.have.lengthOf(1);
		});

		it('should accept an array of class names', () => {
			const result = scryRenderedDOMElementsWithClass(tree, [ 'level-2', 'one' ]);
			expect(result).to.be.instanceof(Array);
			expect(result).to.have.lengthOf(1);
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
			</div>
		);

		it('should return an array of matched DOM elements', () => {
			const testValue = (tagName, length, instance) => {
				const result = scryRenderedDOMElementsWithTag(tree, tagName);
				expect(result).to.be.instanceof(Array);
				expect(result).to.have.lengthOf(length);
				result.forEach((item) => {
					expect(item).to.be.instanceof(instance);
				});
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
				<FunctionalComponent/>
				<FunctionalComponent/>
				<CreateClassComponent/>
				<CreateClassComponent/>
				<ExtendClassComponent/>
				<ExtendClassComponent/>
			</div>
		);

		it('should return an array of matched VNodes', () => {
			const testValue = (type, length) => {
				const result = scryRenderedVNodesWithType(tree, type);
				expect(result).to.be.instanceof(Array);
				expect(result).to.have.lengthOf(length);
				result.forEach((item) => {
					expect(item).to.be.instanceof(Object);
					expect(item).to.have.all.keys(VNodeKeys);
					expect(isVNode(item)).to.be.true;
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
				<FunctionalComponent/>
				<FunctionalComponent/>
				<CreateClassComponent/>
				<CreateClassComponent/>
				<ExtendClassComponent/>
				<ExtendClassComponent/>
			</div>
		);

		it('should return an array of matched VNodes', () => {
			const testValue = (type, length) => {
				const result = scryVNodesWithType(tree, type);
				expect(result).to.be.instanceof(Array);
				expect(result).to.have.lengthOf(length);
				result.forEach((item) => {
					expect(item).to.be.instanceof(Object);
					expect(item).to.have.all.keys(VNodeKeys);
					expect(isVNode(item)).to.be.true;
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
					<div className="level-3 one"/>
				</div>
				<div className="level-2 two">
					<span className="level-3 two"/>
				</div>
			</div>
		);

		it('should throw an error when more than one result is found #1', () => {
			const errorRegex = /Did not find exactly one match/;
			const testValue = (classNames) => {
				expect(() => {
					findRenderedDOMElementWithClass(tree, classNames);
				}).to.throw(Error, errorRegex);
			};
			testValue('level-2');
			testValue('level-3');
		});

		it('should return a matched DOM element', () => {
			const testValue = (classNames, instance) => {
				const result = findRenderedDOMElementWithClass(tree, classNames);
				expect(result).to.be.instanceof(instance);
			};
			testValue('level-1', window.HTMLDivElement);
			testValue('level-2 one', window.HTMLDivElement);
			testValue('level-3 two', window.HTMLSpanElement);
		});

		it('should be able to handle null elements', () => {
			const NoOp = () => null;
			const Broken = () => <div className='dummy'><NoOp /></div>;
			const renderedTree = renderIntoDocument(<Broken />);
			const dummy = findRenderedDOMElementWithClass(renderedTree, 'dummy');
			expect(dummy.className).to.equal('dummy');
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
			</div>
		);

		it('should throw an error when more than one result is found #2', () => {
			const errorRegex = /Did not find exactly one match/;
			const testValue = (tagName) => {
				expect(() => {
					findRenderedDOMElementWithTag(tree, tagName);
				}).to.throw(Error, errorRegex);
			};
			testValue('h1');
			testValue('p');
		});

		it('should return a matched DOM element', () => {
			const testValue = (tagName, instance) => {
				const result = findRenderedDOMElementWithTag(tree, tagName);
				expect(result).to.be.instanceof(instance);
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
				<FunctionalComponent/>
				<FunctionalComponent/>
				<CreateClassComponent/>
				<ExtendClassComponent/>
			</div>
		);

		it('should throw an error when more than one result is found #3', () => {
			const errorRegex = /Did not find exactly one match/;
			const testValue = (type) => {
				expect(() => {
					findRenderedVNodeWithType(tree, type);
				}).to.throw(Error, errorRegex);
			};
			testValue('div');
			testValue(FunctionalComponent);
		});

		it('should return a matched VNode #1', () => {
			const testValue = (type) => {
				const result = findRenderedVNodeWithType(tree, type);
				expect(result).to.be.instanceof(Object);
				expect(result).to.have.all.keys(VNodeKeys);
				expect(isVNode(result)).to.be.true;
				expect(result.type).to.equal(type);
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
				<FunctionalComponent/>
				<FunctionalComponent/>
				<CreateClassComponent/>
				<ExtendClassComponent/>
			</div>
		);

		it('should throw an error when more than one result is found #4', () => {
			const errorRegex = /Did not find exactly one match/;
			const testValue = (type) => {
				expect(() => {
					findVNodeWithType(tree, type);
				}).to.throw(Error, errorRegex);
			};
			testValue('div');
			testValue(FunctionalComponent);
		});

		it('should return a matched VNode #2', () => {
			const testValue = (type) => {
				const result = findVNodeWithType(tree, type);
				expect(result).to.be.instanceof(Object);
				expect(result).to.have.all.keys(VNodeKeys);
				expect(isVNode(result)).to.be.true;
				expect(result.type).to.equal(type);
			};
			testValue('h1');
			testValue(CreateClassComponent);
			testValue(ExtendClassComponent);
		});
	});
});
