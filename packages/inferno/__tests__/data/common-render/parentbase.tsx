import { Component } from 'inferno';
import { ChildCommon } from './child';

export class ParentBaseCommon extends Component {
  protected foo: string;

  public render() {
    return (
      <div>
        <ChildCommon name={this.foo} />
      </div>
    );
  }
}
