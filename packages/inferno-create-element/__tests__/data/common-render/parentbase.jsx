import { Component } from 'inferno';
import { ChildCommon } from './child';

export class ParentBaseCommon extends Component {
  render() {
    return (
      <div>
        <ChildCommon name={this.foo} />
      </div>
    );
  }
}
