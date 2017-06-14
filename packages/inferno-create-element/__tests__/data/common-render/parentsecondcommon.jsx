import { ParentBaseCommon } from "./parentbase";

export class ParentSecondCommon extends ParentBaseCommon {
  constructor(props) {
    super(props);

    this.foo = "Second";
  }
}
