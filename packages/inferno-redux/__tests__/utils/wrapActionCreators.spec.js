import { wrapActionCreators } from "../../src/utils/wrapActionCreators";

describe("Utils", () => {
  describe("wrapActionCreators", () => {
    it("should return a function that wraps argument in a call to bindActionCreators", () => {
      const dispatch = action => ({ dispatched: action });
      const actionResult = { an: "action" };
      const actionCreators = {
        action: () => actionResult
      };

      const wrapped = wrapActionCreators(actionCreators);
      expect(typeof wrapped).toBe("function");
      expect(() => wrapped(dispatch)).not.toThrowError();
      expect(() => wrapped().action()).toThrowError();

      const bound = wrapped(dispatch);
      expect(bound.action).not.toThrowError();
      expect(bound.action().dispatched).toBe(actionResult);
    });
  });
});
