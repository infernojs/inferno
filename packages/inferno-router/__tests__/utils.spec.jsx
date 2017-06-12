import { isEmpty, mapSearchParams } from "../src/utils";

describe("Router #utils", () => {
  it("it should map search params to object", () => {
    let params;
    params = mapSearchParams("hello=world");
    expect(params.hello).toBe("world");

    params = mapSearchParams("hello=world&utf8=çava-oui");
    expect(params.utf8).toBe("çava-oui");

    params = mapSearchParams("arr[]=one&arr[]=two&arr[]=çava-oui");
    expect(params.arr[2]).toBe("çava-oui");
  });

  it("it should return true for an empty object or array", () => {
    expect(isEmpty([])).toBe(true);
    expect(isEmpty({})).toBe(true);
    expect(isEmpty(Object.create(null))).toBe(true);
  });
});
