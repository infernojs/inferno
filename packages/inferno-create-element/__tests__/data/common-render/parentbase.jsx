import Component from "inferno-component";
import { ChildCommon } from "./child";

export class ParentBaseCommon extends Component {
  render() {
    return (
      <div>
        <ChildCommon name={this.foo} />
      </div>
    );
  }
}
