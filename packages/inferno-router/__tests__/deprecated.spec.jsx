import { render } from "inferno";
import { innerHTML } from "inferno-utils";
import { IndexLink, IndexRoute, MemoryRouter } from "inferno-router";

describe("Deprecated components (JSX)", () => {
  it("IndexLink", () => {
    const node = document.createElement("div");
    spyOn(console, "warn");
    render(
      <MemoryRouter>
        <IndexLink to="/">link</IndexLink>
      </MemoryRouter>,
      node
    );

    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(console.warn.calls.mostRecent().args[0]).toContain("is deprecated");
  });

  it("IndexRoute", () => {
    const node = document.createElement("div");
    spyOn(console, "warn");
    render(
      <MemoryRouter>
        <IndexRoute path="/" component={() => null} />
      </MemoryRouter>,
      node
    );

    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(console.warn.calls.mostRecent().args[0]).toContain("is deprecated");
  });
});
