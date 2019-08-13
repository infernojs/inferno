import { Component, IComponentConstructor } from 'inferno';

describe('Component', () => {
  it('Should be assignable where IComponentConstructor is expected', () => {
    class ClassName extends Component<{ className: string }, any> {
      public render() {
        return <div>{this.props.className}</div>;
      }
    }
    const $ClassName: IComponentConstructor<{ className: string }> = ClassName;
    expect(ClassName).toBe($ClassName);

    class None extends Component<{}, any> {
      public render() {
        return <div />;
      }
    }
    const $None: IComponentConstructor<{}> = None;
    expect(None).toBe($None);

    class Id extends Component<{ id: string }, any> {
      public render() {
        return <div>{this.props.id}</div>;
      }
    }
    const $Id: IComponentConstructor<{ id: string }> = Id;
    expect(Id).toBe($Id);

    class Two extends Component<{ className: string; id: string }, any> {
      public render() {
        return (
          <div>
            {this.props.className} {this.props.id}
          </div>
        );
      }
    }
    const $Two: IComponentConstructor<{ className: string; id: string }> = Two;
    expect(Two).toBe($Two);

    class Whatever extends Component<any, any> {
      public render() {
        return <div />;
      }
    }
    const $Whatever: IComponentConstructor<any> = Whatever;
    expect(Whatever).toBe($Whatever);
  });
});
