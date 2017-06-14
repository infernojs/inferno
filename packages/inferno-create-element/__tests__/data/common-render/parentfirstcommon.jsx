import { ParentBaseCommon } from "./parentbase";

export class ParentFirstCommon extends ParentBaseCommon {
  constructor(props) {
    super(props);

    this.foo = "First";
  }
}
