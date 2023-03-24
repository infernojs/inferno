import { Component } from "inferno";

describe('children types', () => {
  it('Should be possible to type child as component', () => {

    interface ParentComponentProps {
      children: FooBarCom
    }

    class FooBarCom extends Component<any, any> {
      constructor(p, c) {
        super(p, c);
      }

      public myMethod() {
        return "foobar";
      }

      public render({children}) {
        return <div>{children}</div>
      }
    }

    class ParentComponent extends Component<ParentComponentProps, any> {
      constructor(p, c) {
        super(p, c);
      }
      public render({children}: ParentComponentProps) {
        children.myMethod()
        this.props.children.myMethod()
        return <div>{children}</div>
      }
    }

    // @ts-expect-error
    const a = <ParentComponent></ParentComponent>


    const valid = <ParentComponent><FooBarCom/></ParentComponent>

    expect(valid).toBeDefined()
  })

  it('Should be possible to type child as array', () => {

    interface ParentComponentProps {
      children: FooBarCom[]
    }

    class FooBarCom extends Component<any, any> {
      constructor(p, c) {
        super(p, c);
      }

      public myMethod() {
        return "foobar";
      }

      public render({children}) {
        return <div>{children}</div>
      }
    }

    class ParentComponent extends Component<ParentComponentProps, any> {
      constructor(p, c) {
        super(p, c);
      }
      public render({children}: ParentComponentProps) {
        children[0].myMethod()
        this.props.children[0].myMethod()
        return <div>{children}</div>
      }
    }

    // @ts-expect-error
    const a = <ParentComponent></ParentComponent>


    const valid = <ParentComponent>{[<FooBarCom/>]}</ParentComponent>
    const valid1 = <ParentComponent><FooBarCom/><FooBarCom/></ParentComponent>


    const alsoValidForNow = <ParentComponent><FooBarCom/></ParentComponent>

    expect(valid).toBeDefined()
    expect(valid1).toBeDefined()
    expect(alsoValidForNow).toBeDefined()
  })
})
