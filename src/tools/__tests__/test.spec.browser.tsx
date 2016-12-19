import Inferno from 'inferno';
import Component from 'inferno-component';
import { expect } from 'chai';
import {
  // isElement,
  // isElementOfType,
  isDOMComponent,
  // isCompositeComponent,
  findAllInRenderedTree,
} from '../test';
Inferno;

describe('Inferno Test Utils', () => {
  // class TestElement extends Component<any, any> {
  //   render() {
  //     return (
  //       <div>
  //         TestElement
  //       </div>
  //     );
  //   }
  // }

  // describe('isElement', () => {
  //   it('Should match Components', () => {
  //     expect(isElement(<TestElement />)).to.be.true;
  //   })
  // });

  // describe('isElementOfType', () => {
  //   it('should match a stateful component', () => {
  //     expect(isElementOfType(<TestElement />, TestElement)).to.be.true;
  //   });
  // });

  // describe('isDOMComponent', () => {
  //   it('should match HTML tags', () => {
  //     expect(
  //       isDOMComponent(<div />)
  //     ).to.be.true;
  //     expect(
  //       isDOMComponent(<span />)
  //     ).to.be.true;
  //     expect(
  //       isDOMComponent(<section />)
  //     ).to.be.true;
  //     expect(
  //       isDOMComponent(<article />)
  //     ).to.be.true;
  //   });
  // });
  
  // describe('isCompositeComponent', () => {
  //   it('should not match composite elements', () => {
  //     expect((isCompositeComponent(<TestElement />))).to.be.true;
  //   });
  // });

  describe('findAllInRenderedTree', () => {
    it('should match compositeElements', () => {
      class Wrapper extends Component<any, any> {
        render({ children }) {
          return <div>{children}</div>;
        }
      }

      var container = document.createElement('div');
      Inferno.render(
        <Wrapper>
          {null}
          <div>purple</div>
        </Wrapper>,
        container
      );
      var tree = Inferno.render(
        <Wrapper>
          <div>orange</div>
        </Wrapper>,
        container
      );

      var log = [];
      Inferno.enableFindDOMNode();
      findAllInRenderedTree(tree, function(child) {
        if (isDOMComponent(child)) {
          log.push(Inferno.findDOMNode(child).textContent);
        }
      });

      // Should be document order, not mount order (which would be purple, orange)
      expect(log).to.be.equal(['orangepurple', 'orange', 'purple']);
    });
  });
});