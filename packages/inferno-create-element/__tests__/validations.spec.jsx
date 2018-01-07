import { render } from 'inferno';
import { createTextVNode } from '../../inferno/src';

describe('Development warnings', () => {
  let container;

  beforeEach(function() {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(function() {
    render(null, container);
    container.innerHTML = '';
    document.body.removeChild(container);
  });

  describe('Warning two duplicate keys', () => {
    it('Should throw error if two duplicates is found', () => {
      const errorNode = (
        <div>
          <div key="1">2</div>
          <div key="1">1</div>
        </div>
      );

      expect(() => render(errorNode, container)).toThrowError(
        'Inferno Error: Encountered two children with same key: {1}. Location: <div> :: <div>'
      );
    });

    it('Should throw error if two duplicate TEXTs is found with same key', () => {
      const errorNode = (
        <div>
          {createTextVNode('foo', 'foo')}
          {createTextVNode('foo2', 'foo')}
        </div>
      );

      expect(() => render(errorNode, container)).toThrowError(
        'Inferno Error: Encountered two children with same key: {foo}. Location: Text(foo2) :: <div>'
      );
    });

    it('Should throw error if two duplicates is found (Component)', () => {
      const FooBar = ({ children }) => children;
      const Tester = ({ children }) => children;
      const errorNode = (
        <div>
          <FooBar key="1">2</FooBar>
          <Tester key="1">1</Tester>
        </div>
      );

      expect(() => render(errorNode, container)).toThrowError(
        'Inferno Error: Encountered two children with same key: {1}. Location: <Tester /> :: <div>'
      );
    });

    it('Should print nice stack of invalid key location', () => {
      const FooBar = () => (
        <span className="parentNode">
          <div key={'dup'} />
          <em key={'dup'} />
        </span>
      );
      const errorNode = (
        <div>
          <span>
            <FooBar>
              <span>1</span>
            </FooBar>
          </span>
        </div>
      );

      expect(() => render(errorNode, container)).toThrowError(
        'Inferno Error: Encountered two children with same key: {dup}. Location: <em> :: <span class="parentNode">'
      );
    });
  });

  describe('Invalid Element children', () => {
    it('Input cannot have children', () => {
      expect(() => render(<input>foobar</input>, container)).toThrowError(
        'Inferno Error: input elements can\'t have children.'
      );
    });

    it('TextArea elements cannot have children', () => {
      expect(() => render(<textarea>foobar</textarea>, container)).toThrowError(
        'Inferno Error: textarea elements can\'t have children.'
      );
    });

    it('Media elements cannot have children', () => {
      expect(() => render(<media>foobar</media>, container)).toThrowError(
        'Inferno Error: media elements can\'t have children.'
      );
    });

    it('< BR > elements cannot have children', () => {
      expect(() => render(<br>foobar</br>, container)).toThrowError(
        'Inferno Error: br elements can\'t have children.'
      );
    });

    it('< img > elements cannot have children', () => {
      expect(() => render(<img>foobar</img>, container)).toThrowError(
        'Inferno Error: img elements can\'t have children.'
      );
    });
  });
});
