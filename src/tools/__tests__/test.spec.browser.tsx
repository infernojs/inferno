import {
  findAllInRenderedTree,
  isDOMComponent,
  isElement,
  isElementOfType,
} from '../test';

import Component from 'inferno-component';
import Inferno from 'inferno';
import { expect } from 'chai';

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

  describe('isDomComponent', () => {
    it('should match DOM components', () => {
      ['div', 'span', 'article'].forEach((tagName) => {
        expect(isDOMComponent(document.createElement(tagName))).to.be.true;
      });
    });

    it('should not match JSX', () => {
      expect(isDOMComponent(<div />)).to.be.false;
    });
  });

  describe('isElement', () => {
    it('Should match Components', () => {
      expect(isElement(<div />)).to.be.true;
      expect(isElement(<TestElement />)).to.be.true;
    });
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
      Inferno.options.findDOMNodeEnabled = true;
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
