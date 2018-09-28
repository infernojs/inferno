import { render, Component } from "inferno";


describe('top level context', () => {
  let container;

  beforeEach(function () {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(function () {
    render(null, container);
    container.innerHTML = '';
    document.body.removeChild(container);
  });

  it('Should be possible to seed context object in render', () => {
    function Child(_props, context) {
      return <span>{context.foo} {context.bar}</span>
    }

    render(<Child/>, container, null, {
      bar: 'second',
      foo: 'first'
    });

    expect(container.innerHTML).toBe('<span>first second</span>');
  });


  it('Should merge top level context with child context', () => {
    function Child(_props, context) {
      return <span>{context.foo} {context.bar}</span>
    }

    class Parent extends Component<any, any> {
      public getChildContext() {
        return {
          foo: 'bar'
        };
      }

      public render(_props, _state, context) {
        return [
          <div>{context.foo}</div>,
          <Child/>
        ];
      }
    }


    render(<Parent/>, container, null, {
      bar: 'second',
      foo: 'first'
    });


    expect(container.innerHTML).toBe('<div>first</div><span>bar second</span>');
  })
});
