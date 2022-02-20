import { Component, render } from 'inferno';

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

  describe('Rendering types', () => {
    it('Should render SFC jsx node', () => {
      const MyComponent = (props) => {
        return <div>{props.children}</div>;
      };

      render(
        <MyComponent />,
        container
      );
    });

    it('Should be possible to return string from render SFC', () => {
      const MyComponent = () => {
        return 'd';
      };

      render(
        <MyComponent />,
        container
      );
    });

    it('Should be possible to return number from render SFC', () => {
      const MyComponent = () => {
        return 1;
      };

      render(
        <MyComponent />,
        container
      );
    });

    it('Should be possible to return null from render SFC', () => {
      const MyComponent = () => {
        return null;
      };

      render(
        <MyComponent />,
        container
      );
    });

    describe('class component', function () {
      it('Should render jsx node - children', () => {
        class MyComponent extends Component<any, any> {
          public render(props) {
            return <div>{props.children}</div>;
          }
        }

        render(
          <MyComponent />,
          container
        );
      });

      it('Should render children directly (props)', () => {
        class MyComponent extends Component<any, any> {
          public render(props) {
            return props.children;
          }
        }

        render(
          <MyComponent />,
          container
        );
      });

      it('Should render children directly (this)', () => {
        class MyComponent extends Component<any, any> {
          public render() {
            return this.props.children;
          }
        }

        render(
          <MyComponent />,
          container
        );
      });

      it('Should be possible to return string from class component render', () => {
        class MyComponent extends Component<any, any> {
          public render() {
            return 'd';
          }
        }

        render(
          <MyComponent />,
          container
        );
      });

      it('Should be possible to return number from class component render', () => {
        class MyComponent extends Component<any, any> {
          public render() {
            return 1;
          }
        }

        render(
          <MyComponent />,
          container
        );
      });

      it('Should be possible to return null from class component render', () => {
        class MyComponent extends Component<any, any> {
          public render() {
            return null;
          }
        }

        render(
          <MyComponent />,
          container
        );
      });
    })
  });
});
