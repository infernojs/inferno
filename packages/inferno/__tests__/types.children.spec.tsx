import { Component, InfernoNode, InfernoSingleNode } from 'inferno';

describe('children types', () => {
  it('Should be possible to type child as component', () => {
    interface ParentComponentProps {
      children: FooBarCom;
    }

    class FooBarCom extends Component<any, any> {
      constructor(p, c) {
        super(p, c);
      }

      public myMethod() {
        return 'foobar';
      }

      public render({ children }) {
        return <div>{children}</div>;
      }
    }

    class ParentComponent extends Component<ParentComponentProps, any> {
      constructor(p, c) {
        super(p, c);
      }
      public render({ children }: ParentComponentProps) {
        children.myMethod();
        this.props.children.myMethod();
        return <div>{children}</div>;
      }
    }

    // @ts-expect-error
    const a = <ParentComponent></ParentComponent>;

    const valid = (
      <ParentComponent>
        <FooBarCom />
      </ParentComponent>
    );

    expect(valid).toBeDefined();
  });

  it('Should be possible to type child as array', () => {
    interface ParentComponentProps {
      children: FooBarCom[];
    }

    class FooBarCom extends Component<any, any> {
      constructor(p, c) {
        super(p, c);
      }

      public myMethod() {
        return 'foobar';
      }

      public render({ children }) {
        return <div>{children}</div>;
      }
    }

    class ParentComponent extends Component<ParentComponentProps, any> {
      constructor(p, c) {
        super(p, c);
      }
      public render({ children }: ParentComponentProps) {
        children[0].myMethod();
        this.props.children[0].myMethod();
        return <div>{children}</div>;
      }
    }

    // @ts-expect-error
    const a = <ParentComponent></ParentComponent>;

    const valid = <ParentComponent>{[<FooBarCom />]}</ParentComponent>;
    const valid1 = (
      <ParentComponent>
        <FooBarCom />
        <FooBarCom />
      </ParentComponent>
    );

    const alsoValidForNow = (
      <ParentComponent>
        <FooBarCom />
      </ParentComponent>
    );

    expect(valid).toBeDefined();
    expect(valid1).toBeDefined();
    expect(alsoValidForNow).toBeDefined();
  });

  it('Should be possible to type child as InfernoNode', () => {
    interface ParentComponentProps {
      children?: InfernoNode;
    }

    class FooBarCom extends Component<any, any> {
      constructor(p, c) {
        super(p, c);
      }

      public myMethod() {
        return 'foobar';
      }

      public render({ children }) {
        return <div>{children}</div>;
      }
    }

    class ParentComponent extends Component<ParentComponentProps, any> {
      constructor(p, c) {
        super(p, c);
      }
      public render({ children }: ParentComponentProps) {
        // children.myMethod();
        // this.props.children.myMethod();
        return <div>{children}</div>;
      }
    }

    // InfernoNode accepts any valid JSX as children
    const valid = (
      <ParentComponent>
        <FooBarCom />
        <FooBarCom />
      </ParentComponent>
    );

    // Children defined optional so leaving it empty is also ok
    const valid2 = <ParentComponent></ParentComponent>;

    // Single child also ok
    const valid3 = (
      <ParentComponent>
        <FooBarCom />
      </ParentComponent>
    );

    expect(valid).toBeDefined();
    expect(valid2).toBeDefined();
    expect(valid3).toBeDefined();
  });

  it('Should be possible to type child as InfernoNode', () => {
    interface ParentComponentProps {
      children: InfernoSingleNode;
    }

    class FooBarCom extends Component<any, any> {
      constructor(p, c) {
        super(p, c);
      }

      public myMethod() {
        return 'foobar';
      }

      public render({ children }) {
        return <div>{children}</div>;
      }
    }

    class ParentComponent extends Component<ParentComponentProps, any> {
      constructor(p, c) {
        super(p, c);
      }
      public render({ children }: ParentComponentProps) {
        // children.myMethod();
        // this.props.children.myMethod();
        return <div>{children}</div>;
      }
    }

    // Children defined InfernoSingleNode so array is not acceptable
    const invalid1 = (
      // @ts-expect-error
      <ParentComponent>
        <FooBarCom />
        <FooBarCom />
      </ParentComponent>
    );

    // Children not defined optional so leaving it empty is error
    // @ts-expect-error
    const invalid2 = <ParentComponent></ParentComponent>;

    // Single child component is ok
    const valid1 = (
      <ParentComponent>
        <FooBarCom />
      </ParentComponent>
    );

    // Single child div is ok
    const valid2 = (
      <ParentComponent>
        <div>1</div>
      </ParentComponent>
    );

    expect(invalid1).toBeDefined();
    expect(invalid2).toBeDefined();
    expect(valid1).toBeDefined();
    expect(valid2).toBeDefined();
  });

  it('Should be possible to type child as another component type', () => {
    class FooBarCom extends Component<any, any> {
      constructor(p, c) {
        super(p, c);
      }

      public myMethod() {
        return 'foobar';
      }

      public render({ children }) {
        return <div>{children}</div>;
      }
    }

    interface ParentComponentProps {
      children: FooBarCom[];
    }

    class ParentComponent extends Component<ParentComponentProps, any> {
      public render({ children }: ParentComponentProps) {
        // children.myMethod();
        // this.props.children.myMethod();
        return <div>{children}</div>;
      }
    }

    // Children defined InfernoSingleNode so array is not acceptable
    const invalid1 = (
      <ParentComponent>
        <FooBarCom />
        <FooBarCom />
      </ParentComponent>
    );

    // Children not defined optional so leaving it empty is error
    // @ts-expect-error
    const invalid2 = <ParentComponent></ParentComponent>;

    // Single child component is ok
    const valid1 = (
      <ParentComponent>
        <FooBarCom />
      </ParentComponent>
    );

    // Single child div is ok
    const valid2 = (
      <ParentComponent>
        <div>1</div>
      </ParentComponent>
    );

    expect(invalid1).toBeDefined();
    expect(invalid2).toBeDefined();
    expect(valid1).toBeDefined();
    expect(valid2).toBeDefined();
  });

  it('Should be possible to type child as another component type', () => {
    class FooBarCom extends Component<any, any> {
      constructor(p, c) {
        super(p, c);
      }

      public myMethod() {
        return 'foobar';
      }

      public render({ children }: any) {
        return <div>{children}</div>;
      }
    }

    interface ParentComponentProps {
      children: FooBarCom;
    }

    class ParentComponent extends Component<ParentComponentProps, any> {
      public render({ children }: Readonly<ParentComponentProps>) {
        children.myMethod();
        this.props.children.myMethod();
        return <div>{children}</div>;
      }
    }

    // Children defined InfernoSingleNode so array is not acceptable
    const invalid1 = (
      // @ts-expect-error
      <ParentComponent>
        <FooBarCom />
        <FooBarCom />
      </ParentComponent>
    );

    // Children not defined optional so leaving it empty is error
    // @ts-expect-error
    const invalid2 = <ParentComponent></ParentComponent>;

    // Single child component is ok
    const valid1 = (
      <ParentComponent>
        <FooBarCom />
      </ParentComponent>
    );

    // Single child div is ok
    const valid2 = (
      <ParentComponent>
        <div>1</div>
      </ParentComponent>
    );

    expect(invalid1).toBeDefined();
    expect(invalid2).toBeDefined();
    expect(valid1).toBeDefined();
    expect(valid2).toBeDefined();
  });
});
