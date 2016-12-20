import Inferno from 'inferno';
import Component from 'inferno-component';
import { expect } from 'chai';
import {
  isElement,
  isElementOfType,
  isDOMComponent,
  findAllInRenderedTree,
} from '../test';
Inferno;

describe('Inferno Test Utils', () => {
  class TestElement extends Component<any, any> {
    render() {
      return (
        <div>
          TestElement
        </div>
      );
    }
  }

  describe('isElement', () => {
    it('Should match Components', () => {
      expect(isElement(<div />)).to.be.true;
      expect(isElement(<TestElement />)).to.be.true;
    })
  });

  describe('isElementOfType', () => {
    it('should match a stateful component', () => {
      expect(isElementOfType(<TestElement />, TestElement)).to.be.true;
    });
  });

  describe('findAllInRenderedTree', () => {
    it('should match compositeElements', () => {
      class Wrapper extends Component<any, any> {
        render({ children }) {
          return <div>{children}</div>;
        }
      }

      const container = document.createElement('div');
      Inferno.render(
        <Wrapper>
          {null}
          <div>purple</div>
        </Wrapper>,
        container
      );
      const tree = Inferno.render(
        <Wrapper>
          <div>orange</div>
          <div>purple</div>
        </Wrapper>,
        container
      );

      const log = [];
      Inferno.enableFindDOMNode();
      findAllInRenderedTree(tree, function(child) {
        if (isDOMComponent(child)) {
          log.push(child.textContent);
        }
      });

      // Should be document order, not mount order (which would be purple, orange)
      expect(log).to.have.lengthOf(3);
      expect(log[0]).to.equal('orangepurple');
      expect(log[1]).to.equal('orange');
      expect(log[2]).to.equal('purple');
    });
  });
});