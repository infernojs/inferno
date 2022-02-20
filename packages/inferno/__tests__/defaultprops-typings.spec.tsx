import { Component, render } from "inferno";


describe('default prop typings', () => {
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

  type MyComponentProps = {
    name: string,
    value: number
  }

  class MyComponent extends Component<MyComponentProps, any> {
    constructor(props, state) {
      super(props, state);
    }

    public static defaultProps = {
      name: "custom-component",
      value: 107
    }
  }

  it('TSX Should not require properties from default props', () => {
    render(<MyComponent name="new-name"/>, container);
  });
})
