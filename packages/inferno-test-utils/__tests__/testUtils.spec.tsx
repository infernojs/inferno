import { Component, render } from 'inferno';
import { createElement } from 'inferno-create-element';
import {
  findAllInRenderedTree,
  findAllInVNodeTree,
  findRenderedDOMElementWithClass,
  findRenderedDOMElementWithTag,
  findRenderedVNodeWithType,
  findVNodeWithType,
  isClassVNode,
  isClassVNodeOfType,
  isComponentVNodeOfType,
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
  renderIntoContainer,
  scryRenderedDOMElementsWithClass,
  scryRenderedDOMElementsWithTag,
  scryRenderedVNodesWithType,
  scryVNodesWithType,
} from 'inferno-test-utils';

const VNodeKeys = [
  'children',
  'childFlags',
  'className',
  'dom',
  'flags',
  'isValidated',
  'key',
  'ref',
  'props',
  'type',
].sort();

const createDOMElement = (tagName) => document.createElement(tagName);

const FunctionalComponent = function (props) {
  return createElement('div', props);
};

const AnotherFunctionalComponent = function (props) {
  return createElement('div', props);
};

class ClassComponent extends Component {
  render() {
    return createElement('div', this.props);
  }
}

class AnotherClassComponent extends Component {
  render() {
    return createElement('div', this.props);
  }
}

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
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    render(null, container);
    container.innerHTML = '';
  });

  describe('isVNode', () => {
    it('should return true for VNodes', () => {
      expect(isVNode(createElement('div'))).toBe(true);
      expect(isVNode(createElement(ClassComponent))).toBe(true);
      expect(isVNode(createElement(ExtendClassComponent))).toBe(true);
      expect(isVNode(createElement(FunctionalComponent))).toBe(true);
      expect(isVNode(<ClassComponent />)).toBe(true);
      expect(isVNode(<ExtendClassComponent />)).toBe(true);
      expect(isVNode(<FunctionalComponent />)).toBe(true);
      expect(isVNode(<div />)).toBe(true);
    });

    it('should return false for non-VNodes', () => {
      expect(isVNode(ClassComponent)).toBe(false);
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

  describe('isComponentVNodeOfType', () => {
    it('Should return true if Component is same', () => {
      class Foobar extends Component {
        render() {
          return <div>1</div>;
        }
      }

      expect(isComponentVNodeOfType(<Foobar />, Foobar)).toBe(true);
      expect(isComponentVNodeOfType(<div />, Foobar)).toBe(false);
    });
  });

  describe('isVNodeOfType', () => {
    it('should return true for VNodes with a specified type', () => {
      expect(isVNodeOfType(createElement('div'), 'div')).toBe(true);
      expect(
        isVNodeOfType(createElement(FunctionalComponent), FunctionalComponent),
      ).toBe(true);
      expect(isVNodeOfType(createElement(ClassComponent), ClassComponent)).toBe(
        true,
      );
      expect(
        isVNodeOfType(
          createElement(ExtendClassComponent),
          ExtendClassComponent,
        ),
      ).toBe(true);
    });

    it('should return false for VNodes with a specified type', () => {
      expect(isVNodeOfType(createElement('div'), 'h1')).toBe(false);
      expect(
        isVNodeOfType(createElement(FunctionalComponent), ClassComponent),
      ).toBe(false);
      expect(
        isVNodeOfType(createElement(ClassComponent), ExtendClassComponent),
      ).toBe(false);
      expect(
        isVNodeOfType(createElement(ExtendClassComponent), FunctionalComponent),
      ).toBe(false);
    });
  });

  describe('isDOMVNode', () => {
    it('should return true for VNodes of type string', () => {
      expect(isDOMVNode(createElement('div'))).toBe(true);
      expect(isDOMVNode(createElement('h1'))).toBe(true);
      expect(isDOMVNode(createElement('p'))).toBe(true);
    });

    it('should return false for VNodes of type function or class', () => {
      expect(isDOMVNode(createElement(ClassComponent))).toBe(false);
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
      expect(isDOMVNodeOfType(createElement('div'), {} as never)).toBe(false);
      expect(isDOMVNodeOfType(createElement('div'), [] as never)).toBe(false);
      expect(isDOMVNodeOfType(createElement('div'), 10 as never)).toBe(false);
      expect(isDOMVNodeOfType(createElement('div'), undefined as never)).toBe(
        false,
      );
      expect(isDOMVNodeOfType(createElement('div'), null as never)).toBe(false);
    });
  });

  describe('isFunctionalVNode', () => {
    it('should return true for VNodes of stateless function type', () => {
      expect(isFunctionalVNode(createElement(FunctionalComponent))).toBe(true);
    });

    it('should return false for VNodes of incorrect type', () => {
      expect(isFunctionalVNode(createElement(ClassComponent))).toBe(false);
      expect(isFunctionalVNode(createElement(ExtendClassComponent))).toBe(
        false,
      );
      expect(isFunctionalVNode(createElement('div'))).toBe(false);
    });
  });

  describe('isFunctionalVNodeOfType', () => {
    it('should return true for VNodes of specific stateless function type', () => {
      expect(
        isFunctionalVNodeOfType(
          createElement(FunctionalComponent),
          FunctionalComponent,
        ),
      ).toBe(true);
    });

    it('should return false for VNodes of incorrect type', () => {
      expect(
        isFunctionalVNodeOfType(
          createElement(FunctionalComponent),
          AnotherFunctionalComponent,
        ),
      ).toBe(false);
      expect(
        isFunctionalVNodeOfType(
          createElement(FunctionalComponent),
          ClassComponent,
        ),
      ).toBe(false);
      expect(
        isFunctionalVNodeOfType(
          createElement(FunctionalComponent),
          ExtendClassComponent,
        ),
      ).toBe(false);
    });
  });

  describe('isClassVNode', () => {
    it('should return true for VNodes of class type', () => {
      expect(isClassVNode(createElement(ClassComponent))).toBe(true);
      expect(isClassVNode(createElement(ExtendClassComponent))).toBe(true);
    });

    it('should return false for VNodes of incorrect type', () => {
      expect(isClassVNode(createElement(FunctionalComponent))).toBe(false);
      expect(isClassVNode(createElement('div'))).toBe(false);
    });
  });

  describe('isClassVNodeOfType', () => {
    it('should return true for VNodes of specific class type', () => {
      expect(
        isClassVNodeOfType(createElement(ClassComponent), ClassComponent),
      ).toBe(true);
      expect(
        isClassVNodeOfType(
          createElement(ExtendClassComponent),
          ExtendClassComponent,
        ),
      ).toBe(true);
    });

    it('should return false for VNodes of incorrect type', () => {
      expect(
        isClassVNodeOfType(
          createElement(ClassComponent),
          AnotherClassComponent,
        ),
      ).toBe(false);
      expect(
        isClassVNodeOfType(
          createElement(ClassComponent),
          AnotherExtendClassComponent,
        ),
      ).toBe(false);
      expect(
        isClassVNodeOfType(createElement(ClassComponent), FunctionalComponent),
      ).toBe(false);

      expect(
        isClassVNodeOfType(
          createElement(ExtendClassComponent),
          AnotherClassComponent,
        ),
      ).toBe(false);
      expect(
        isClassVNodeOfType(
          createElement(ExtendClassComponent),
          AnotherExtendClassComponent,
        ),
      ).toBe(false);
      expect(
        isClassVNodeOfType(
          createElement(ExtendClassComponent),
          FunctionalComponent,
        ),
      ).toBe(false);
    });
  });

  describe('isDOMElement', () => {
    it('should return true for DOMElements', () => {
      expect(isDOMElement(createDOMElement('div'))).toBe(true);
      expect(isDOMElement(createDOMElement('h1'))).toBe(true);
      expect(isDOMElement(createDOMElement('p'))).toBe(true);
    });

    it('should return false for non-DOMElements', () => {
      expect(isDOMElement(createElement(ClassComponent))).toBe(false);
      expect(isDOMElement(createElement(ExtendClassComponent))).toBe(false);
      expect(isDOMElement(createElement(FunctionalComponent))).toBe(false);
      expect(isDOMElement(createElement('div'))).toBe(false);
      expect(isDOMElement(ClassComponent)).toBe(false);
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
      expect(isDOMElementOfType(createDOMElement('div'), {} as never)).toBe(
        false,
      );
      expect(isDOMElementOfType(createDOMElement('div'), [] as never)).toBe(
        false,
      );
      expect(isDOMElementOfType(createDOMElement('div'), 10 as never)).toBe(
        false,
      );
      expect(
        isDOMElementOfType(createDOMElement('div'), undefined as never),
      ).toBe(false);
      expect(isDOMElementOfType(createDOMElement('div'), null as never)).toBe(
        false,
      );
    });
  });

  describe('isRenderedClassComponent', () => {
    const DOMVNode = createElement('div');
    const functionalVNode = createElement(FunctionalComponent);
    const createClassVNode = createElement(ClassComponent);
    const extendClassVNode = createElement(ExtendClassComponent);

    it('should return true for rendered Class Components', () => {
      expect(
        isRenderedClassComponent(renderIntoContainer(createClassVNode)),
      ).toBe(true);
      expect(
        isRenderedClassComponent(renderIntoContainer(extendClassVNode)),
      ).toBe(true);
    });

    it('should return false for non-rendered Class Components', () => {
      expect(isRenderedClassComponent(createClassVNode)).toBe(false);
      expect(isRenderedClassComponent(extendClassVNode)).toBe(false);
      expect(
        isRenderedClassComponent(renderIntoContainer(functionalVNode)),
      ).toBe(false);
      expect(isRenderedClassComponent(renderIntoContainer(DOMVNode))).toBe(
        false,
      );
    });
  });

  describe('isRenderedClassComponentOfType', () => {
    const createClassVNode = createElement(ClassComponent);
    const extendClassVNode = createElement(ExtendClassComponent);

    it('should return true for rendered Class Components of specific type', () => {
      expect(
        isRenderedClassComponentOfType(
          renderIntoContainer(createClassVNode),
          ClassComponent,
        ),
      ).toBe(true);
      expect(
        isRenderedClassComponentOfType(
          renderIntoContainer(extendClassVNode),
          ExtendClassComponent,
        ),
      ).toBe(true);
    });

    it('should return false for rendered Class Components of incorrect type', () => {
      expect(
        isRenderedClassComponentOfType(
          renderIntoContainer(createClassVNode),
          AnotherClassComponent,
        ),
      ).toBe(false);
      expect(
        isRenderedClassComponentOfType(
          renderIntoContainer(createClassVNode),
          ExtendClassComponent,
        ),
      ).toBe(false);
      expect(
        isRenderedClassComponentOfType(
          renderIntoContainer(createClassVNode),
          FunctionalComponent,
        ),
      ).toBe(false);
      expect(
        isRenderedClassComponentOfType(
          renderIntoContainer(createClassVNode),
          'div' as never,
        ),
      ).toBe(false);

      expect(
        isRenderedClassComponentOfType(
          renderIntoContainer(extendClassVNode),
          AnotherExtendClassComponent,
        ),
      ).toBe(false);
      expect(
        isRenderedClassComponentOfType(
          renderIntoContainer(extendClassVNode),
          ClassComponent,
        ),
      ).toBe(false);
      expect(
        isRenderedClassComponentOfType(
          renderIntoContainer(extendClassVNode),
          FunctionalComponent,
        ),
      ).toBe(false);
      expect(
        isRenderedClassComponentOfType(
          renderIntoContainer(extendClassVNode),
          'div' as never,
        ),
      ).toBe(false);
    });
  });

  describe('findAllInRenderedTree', () => {
    let tree1;

    beforeEach(() => {
      tree1 = (
        <section className="outer">
          <FunctionalComponent />
        </section>
      );
      render(tree1, container);
    });

    it('should call predicate for each VNode instance in a rendered tree', () => {
      const spy = jasmine.createSpy('spy');
      expect(spy).not.toHaveBeenCalled();
      findAllInRenderedTree(tree1, (args) => {
        spy(args.type);

        return true;
      });
      // 0: section
      // 1: FunctionalComponent
      // 2: div
      expect(spy).toHaveBeenCalledTimes(3);
      expect(spy).toHaveBeenCalledWith('section');
      expect(spy).toHaveBeenCalledWith(FunctionalComponent);
      expect(spy).toHaveBeenCalledWith('div');
    });

    it('should call predicate in the correct order', () => {
      const types: unknown[] = [];
      findAllInRenderedTree(tree1, ({ type }) => {
        types.push(type);
        return true;
      });
      expect(types).toEqual(['section', FunctionalComponent, 'div']);
    });

    it('should work with interpolated text', () => {
      const predicate = jasmine.createSpy('spy');
      const Hello = ({ who }) => <div>Hello, {who}!</div>;
      const tree = <Hello who="world" />;
      render(tree, container);
      expect(predicate).not.toHaveBeenCalled();
      findAllInRenderedTree(tree, predicate);

      expect(predicate).toHaveBeenCalledTimes(5);
    });

    it('should work without class wrappers', () => {
      const predicate = jasmine.createSpy('spy');
      const Hello = ({ who }) => <div>Hello, {who}!</div>;
      const treeWithText = <Hello who="world" />;
      render(treeWithText, container);

      expect(predicate).not.toHaveBeenCalled();
      findAllInRenderedTree(treeWithText, predicate);

      expect(predicate).toHaveBeenCalledTimes(5);
    });
  });

  describe('findAllInVNodeTree', () => {
    const tree2 = (
      <section className="outer">
        <FunctionalComponent />
      </section>
    );

    it('should throw an error when not passed a VNode', () => {
      const predicate = () => {
        return true;
      };
      const testValue = (value) => {
        expect(() => {
          findAllInVNodeTree(value, predicate);
        }).toThrowError();
      };
      testValue(render(<div />, container));
      testValue(ClassComponent);
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
      const predicate = jasmine.createSpy('spy');

      findAllInVNodeTree(tree2, (args) => {
        predicate(args.type);
        return true;
      });
      // 0: section
      // 1: FunctionalComponent
      expect(predicate).toHaveBeenCalledTimes(2);
      expect(predicate).toHaveBeenCalledWith('section');
      expect(predicate).toHaveBeenCalledWith(FunctionalComponent);
    });

    it('should call predicate in the correct order', () => {
      const types: unknown[] = [];
      findAllInVNodeTree(tree2, ({ type }) => {
        types.push(type);
        return true;
      });
      expect(types).toEqual(['section', FunctionalComponent]);
    });
  });

  describe('scryRenderedDOMElementsWithClass', () => {
    const tree3 = renderIntoContainer(
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
      const result1 = scryRenderedDOMElementsWithClass(tree3, 'one');
      expect(result1 instanceof Array).toBeTruthy();
      expect(result1.length).toBe(3);
      for (const result of result1) {
        expect(result.tagName).toBe('DIV');
      }

      const result2 = scryRenderedDOMElementsWithClass(tree3, 'two');
      expect(result2 instanceof Array).toBeTruthy();
      expect(result2.length).toBe(2);
      expect(result2[0].tagName).toBe('DIV');
      expect(result2[1].tagName).toBe('SPAN');

      const result3 = scryRenderedDOMElementsWithClass(tree3, 'three');
      expect(result3 instanceof Array).toBeTruthy();
      expect(result3.length).toBe(0);
    });

    it('should accept a space separated string of class names', () => {
      const result1 = scryRenderedDOMElementsWithClass(tree3, 'level-2');
      expect(result1 instanceof Array).toBeTruthy();
      expect(result1.length).toBe(2);

      const result2 = scryRenderedDOMElementsWithClass(tree3, 'level-2 one');
      expect(result2 instanceof Array).toBeTruthy();
      expect(result2.length).toBe(1);
    });

    it('should accept an array of class names', () => {
      const result = scryRenderedDOMElementsWithClass(tree3, [
        'level-2',
        'one',
      ]);
      expect(result instanceof Array).toBeTruthy();
      expect(result.length).toBe(1);
    });
  });

  describe('scryRenderedDOMElementsWithTag', () => {
    const tree4 = renderIntoContainer(
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
      const testValue = (tagName, length) => {
        const result = scryRenderedDOMElementsWithTag(tree4, tagName);
        expect(result instanceof Array).toBeTruthy();
        expect(result.length).toBe(length);
        for (const item of result) {
          expect(item.tagName).toBe(tagName.toUpperCase());
        }
      };
      testValue('div', 1);
      testValue('h1', 2);
      testValue('p', 3);
      testValue('span', 0);
    });
  });

  describe('scryRenderedVNodesWithType', () => {
    const tree5 = renderIntoContainer(
      <div>
        <FunctionalComponent />
        <FunctionalComponent />
        <ClassComponent />
        <ClassComponent />
        <ExtendClassComponent />
        <ExtendClassComponent />
      </div>,
    );

    it('should return an array of matched VNodes', () => {
      const testValue = (type, length) => {
        const result = scryRenderedVNodesWithType(tree5, type);
        expect(result instanceof Array).toBeTruthy();
        expect(result.length).toBe(length);
        for (const item of result) {
          expect(item instanceof Object).toBeTruthy();
          expect(Object.keys(item).sort()).toEqual(VNodeKeys);
          expect(isVNode(item)).toBe(true);
        }
      };
      testValue('p', 0);
      testValue('div', 7); // Outer div + each rendered component div
      testValue(FunctionalComponent, 2);
      testValue(ClassComponent, 2);
      testValue(ExtendClassComponent, 2);
      testValue(AnotherFunctionalComponent, 0);
    });
  });

  describe('scryVNodesWithType', () => {
    const tree6 = (
      <div>
        <FunctionalComponent />
        <FunctionalComponent />
        <ClassComponent />
        <ClassComponent />
        <ExtendClassComponent />
        <ExtendClassComponent />
      </div>
    );

    it('should return an array of matched VNodes', () => {
      const testValue = (type, length) => {
        const result = scryVNodesWithType(tree6, type);
        expect(result instanceof Array).toBeTruthy();
        expect(result.length).toBe(length);
        for (const item of result) {
          expect(item instanceof Object).toBeTruthy();
          expect(Object.keys(item).sort()).toEqual(VNodeKeys);
          expect(isVNode(item)).toBe(true);
        }
      };
      testValue('p', 0);
      testValue('div', 1); // Just the outer div
      testValue(FunctionalComponent, 2);
      testValue(ClassComponent, 2);
      testValue(ExtendClassComponent, 2);
      testValue(AnotherFunctionalComponent, 0);
    });
  });

  describe('findRenderedDOMElementWithClass', () => {
    const tree7 = renderIntoContainer(
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
      const testValue = (classNames) => {
        expect(() => {
          findRenderedDOMElementWithClass(tree7, classNames);
        }).toThrowError();
      };
      testValue('level-2');
      testValue('level-3');
    });

    it('should return a matched DOM element', () => {
      const testValue = (classNames) => {
        const result = findRenderedDOMElementWithClass(tree7, classNames);
        const arrOfClassName = classNames.split(' ');
        for (let i = 0; i < arrOfClassName.length; i++) {
          expect(result.classList.contains(arrOfClassName[i])).toBe(true);
        }
      };
      testValue('level-1');
      testValue('level-2 one');
      testValue('level-3 two');
    });

    it('should be able to handle null elements', () => {
      const NoOp = () => null;
      const Broken = () => (
        <div className="dummy">
          <NoOp />
        </div>
      );
      const renderedTree = renderIntoContainer(<Broken />);
      const dummy = findRenderedDOMElementWithClass(renderedTree, 'dummy');
      expect(dummy.className).toBe('dummy');
    });
  });

  describe('findRenderedDOMElementWithTag', () => {
    const tree8 = renderIntoContainer(
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
      const testValue = (tagName) => {
        expect(() => {
          findRenderedDOMElementWithTag(tree8, tagName);
        }).toThrowError();
      };
      testValue('h1');
      testValue('p');
    });

    it('should return a matched DOM element', () => {
      const testValue = (tagName) => {
        const result = findRenderedDOMElementWithTag(tree8, tagName);

        expect(result.tagName).toBe(tagName.toUpperCase());
      };
      testValue('div');
      testValue('span');
      testValue('a');
    });
  });

  describe('findRenderedVNodeWithType', () => {
    const tree9 = renderIntoContainer(
      <div>
        <h1>Hello</h1>
        <FunctionalComponent />
        <FunctionalComponent />
        <ClassComponent />
        <ExtendClassComponent />
      </div>,
    );

    it('should throw an error when more than one result is found #3', () => {
      const testValue = (type) => {
        expect(() => {
          findRenderedVNodeWithType(tree9, type);
        }).toThrowError();
      };
      testValue('div');
      testValue(FunctionalComponent);
    });

    it('should return a matched VNode #1', () => {
      const testValue = (type) => {
        const result = findRenderedVNodeWithType(tree9, type);
        expect(result instanceof Object).toBeTruthy();
        expect(Object.keys(result).sort()).toEqual(VNodeKeys);
        expect(isVNode(result)).toBe(true);
        expect(result.type).toBe(type);
      };
      testValue('h1');
      testValue(ClassComponent);
      testValue(ExtendClassComponent);
    });
  });

  describe('findVNodeWithType', () => {
    const tree10 = (
      <div>
        <div>
          <h1>Hello</h1>
        </div>
        <FunctionalComponent />
        <FunctionalComponent />
        <ClassComponent />
        <ExtendClassComponent />
      </div>
    );

    it('should throw an error when more than one result is found #4', () => {
      const testValue = (type) => {
        expect(() => {
          findVNodeWithType(tree10, type);
        }).toThrowError();
      };
      testValue('div');
      testValue(FunctionalComponent);
    });

    it('should return a matched VNode #2', () => {
      const testValue = (type) => {
        const result = findVNodeWithType(tree10, type);
        expect(result instanceof Object).toBeTruthy();
        expect(Object.keys(result).sort()).toEqual(VNodeKeys);
        expect(isVNode(result)).toBe(true);
        expect(result.type).toBe(type);
      };
      testValue('h1');
      testValue(ClassComponent);
      testValue(ExtendClassComponent);
    });
  });
});
