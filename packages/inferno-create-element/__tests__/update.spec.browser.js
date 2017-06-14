import { render } from "inferno";
import createElement from "inferno-create-element";
import { innerHTML } from "inferno-utils";

describe("Update (non-jsx)", () => {
  let container;

  beforeEach(function() {
    container = document.createElement("div");
  });

  afterEach(function() {
    render(null, container);
  });

  it("should insert an additionnal tag node", () => {
    const template = child => createElement("div", null, child);
    let span;

    span = () => createElement("div", null, "hello ", "to");

    render(template(span()), container);

    expect(container.firstChild.nodeName).toBe("DIV");
    expect(container.firstChild.childNodes.length).toBe(1);
    expect(container.firstChild.textContent).toBe("hello to");

    render(template(span()), container);

    expect(container.firstChild.nodeName).toBe("DIV");
    expect(container.firstChild.childNodes.length).toBe(1);
    expect(container.firstChild.textContent).toBe("hello to");

    span = () => createElement("div", null);

    render(template(span()), container);

    expect(container.firstChild.nodeName).toBe("DIV");
    expect(container.firstChild.childNodes.length).toBe(1);
    expect(container.firstChild.textContent).toBe("");
  });

  it("should insert an additional tag node", () => {
    const template = child => createElement("div", null, child);
    const span = () => createElement("span", null);

    render(template(span()), container);
    expect(container.firstChild.innerHTML).toBe(innerHTML("<span></span>"));
    render(template(null), container);
    expect(container.firstChild.innerHTML).toBe("");
    render(template(span()), container);
    expect(container.firstChild.innerHTML).toBe(innerHTML("<span></span>"));
  });

  it("should insert an additional tag node", () => {
    const template = child => createElement("div", null, child);
    const div = () => createElement("div", null);

    render(template(null), container);
    expect(container.firstChild.innerHTML).toBe("");
    render(template(div()), container);
    expect(container.firstChild.innerHTML).toBe(innerHTML("<div></div>"));
  });

  it("should insert an additional tag node", () => {
    const template = child => createElement("div", null, child);
    // const span = () => createElement('div');

    render(template(null), container);
    expect(container.firstChild.innerHTML).toBe("");
    render(template(null), container);
    expect(container.firstChild.innerHTML).toBe("");
  });

  it("should insert multiple additional tag node", () => {
    const template = child => createElement("div", null, child);
    const span = () => createElement("div", null);

    render(template(span()), container);
    expect(container.firstChild.innerHTML).toBe(innerHTML("<div></div>"));
  });

  it("should render a node with dynamic values", () => {
    const template = (val1, val2) =>
      createElement("div", null, "Hello world - ", val1, " ", val2);

    render(template("Inferno", "Owns"), container);
    expect(container.innerHTML).toBe(
      innerHTML("<div>Hello world - Inferno Owns</div>")
    );
    render(template("Inferno", "Owns"), container);
    expect(container.innerHTML).toBe(
      innerHTML("<div>Hello world - Inferno Owns</div>")
    );

    render(template("Inferno", null), container);
    expect(container.innerHTML).toBe(
      innerHTML("<div>Hello world - Inferno </div>")
    );

    render(template(null, "Owns"), container);
    expect(container.innerHTML).toBe(
      innerHTML("<div>Hello world -  Owns</div>")
    );

    render(template(null), container);
    expect(container.innerHTML).toBe(innerHTML("<div>Hello world -  </div>"));

    render(template(undefined), container);
    expect(container.innerHTML).toBe(innerHTML("<div>Hello world -  </div>"));

    render(template(null, "Owns"), container);
    expect(container.innerHTML).toBe(
      innerHTML("<div>Hello world -  Owns</div>")
    );

    render(template("Test", "Works!"), container);
    expect(container.innerHTML).toBe(
      innerHTML("<div>Hello world - Test Works!</div>")
    );
  });

  it("should update a wrapped text node", () => {
    const template = (val1, val2) =>
      createElement("div", null, val1, " foo", val2);

    render(template(null), container);
    expect(container.innerHTML).toBe(innerHTML("<div> foo</div>"));

    render(template("Hello", "Bar"), container);
    expect(container.innerHTML).toBe(innerHTML("<div>Hello fooBar</div>"));

    render(template(undefined), container);
    expect(container.innerHTML).toBe(innerHTML("<div> foo</div>"));

    render(template("The", " is dead!"), container);
    expect(container.innerHTML).toBe(innerHTML("<div>The foo is dead!</div>"));
  });

  it("should update a wrapped text node", () => {
    const template = (val1, val2) =>
      createElement("div", null, val1, " foo", val2);

    render(template(null), container);
    expect(container.innerHTML).toBe(innerHTML("<div> foo</div>"));

    render(template(undefined), container);
    expect(container.innerHTML).toBe(innerHTML("<div> foo</div>"));

    render(template("Hello", "Bar"), container);
    expect(container.innerHTML).toBe(innerHTML("<div>Hello fooBar</div>"));

    render(template("Hello", null), container);
    expect(container.innerHTML).toBe(innerHTML("<div>Hello foo</div>"));

    render(template(null, "Bar"), container);
    expect(container.innerHTML).toBe(innerHTML("<div> fooBar</div>"));

    render(template(undefined), container);
    expect(container.innerHTML).toBe(innerHTML("<div> foo</div>"));

    render(template("The", " is dead!"), container);
    expect(container.innerHTML).toBe(innerHTML("<div>The foo is dead!</div>"));
  });

  it("should update a wrapped text node with 4 arguments", () => {
    const template = (val1, val2, val3, val4) =>
      createElement("div", null, val1, val2, val3, val4);

    render(template("Hello", " world!", " and ", "Bar"), container);
    expect(container.innerHTML).toBe(
      innerHTML("<div>Hello world! and Bar</div>")
    );

    render(template(null, null, null, null), container);
    expect(container.innerHTML).toBe(innerHTML("<div></div>"));

    render(template(), container);
    expect(container.innerHTML).toBe(innerHTML("<div></div>"));

    render(template("Hello", " world!", " and ", "Zoo"), container);
    expect(container.innerHTML).toBe(
      innerHTML("<div>Hello world! and Zoo</div>")
    );

    render(template("Hello", null, " and ", "Zoo"), container);
    expect(container.innerHTML).toBe(innerHTML("<div>Hello and Zoo</div>"));

    expect(() =>
      render(template("Hello", {}, " and ", "Zoo"), container)
    ).toThrow();

    render(template("Hello", " poz", " and ", "Zoo"), container);
    expect(container.innerHTML).toBe(innerHTML("<div>Hello poz and Zoo</div>"));

    render(template("The ", "bar", " is", " is dead!"), container);
    expect(container.innerHTML).toBe(
      innerHTML("<div>The bar is is dead!</div>")
    );

    render(template("Hello", " world!", null), container);
    expect(container.innerHTML).toBe(innerHTML("<div>Hello world!</div>"));
  });

  it("should update a node with static text", () => {
    const template = val =>
      createElement(
        "div",
        {
          id: val
        },
        "Hello, World"
      );

    render(template("Hello"), container);
    expect(container.innerHTML).toBe(
      innerHTML('<div id="Hello">Hello, World</div>')
    );

    render(template("Bar"), container);
    expect(container.innerHTML).toBe(
      innerHTML('<div id="Bar">Hello, World</div>')
    );

    render(template(), container);
    expect(container.innerHTML).toBe(innerHTML("<div>Hello, World</div>"));

    render(template(), container);
    expect(container.innerHTML).toBe(innerHTML("<div>Hello, World</div>"));

    render(template(null), container);
    expect(container.innerHTML).toBe(innerHTML("<div>Hello, World</div>"));

    render(template(null), container);
    expect(container.innerHTML).toBe(innerHTML("<div>Hello, World</div>"));

    render(template("foo"), container);
    expect(container.innerHTML).toBe(
      innerHTML('<div id="foo">Hello, World</div>')
    );
  });

  it("should update a node with multiple children and static text", () => {
    const template = val1 =>
      createElement(
        "div",
        {
          id: val1
        },
        "Hello, World"
      );

    render(template("Hello"), container);
    expect(container.innerHTML).toBe(
      innerHTML('<div id="Hello">Hello, World</div>')
    );

    render(template("Hello"), container);
    expect(container.innerHTML).toBe(
      innerHTML('<div id="Hello">Hello, World</div>')
    );

    render(template(null), container); // should unset
    expect(container.innerHTML).toBe(innerHTML("<div>Hello, World</div>"));

    render(template("foo"), container);
    expect(container.innerHTML).toBe(
      innerHTML('<div id="foo">Hello, World</div>')
    );
  });

  it("should update a node with multiple children and static text #2", () => {
    const template = val1 =>
      createElement(
        "div",
        {
          id: val1
        },
        "Hello, World"
      );

    render(template(null), container); // should unset
    expect(container.innerHTML).toBe(innerHTML("<div>Hello, World</div>"));

    render(template("Hello"), container);
    expect(container.innerHTML).toBe(
      innerHTML('<div id="Hello">Hello, World</div>')
    );

    render(template(undefined), container); // should unset
    expect(container.innerHTML).toBe(innerHTML("<div>Hello, World</div>"));

    render(template("foo"), container);
    expect(container.innerHTML).toBe(
      innerHTML('<div id="foo">Hello, World</div>')
    );

    render(template(), container); // should unset
    expect(container.innerHTML).toBe(innerHTML("<div>Hello, World</div>"));
  });

  it("should update a div with class attribute, and dynamic children with static text", () => {
    const template = child =>
      createElement(
        "div",
        {
          class: "hello, world"
        },
        child
      );

    const spanList = () => createElement("span", null, "1", "2", "3");

    const span = _b => createElement("span", null, _b);

    render(template(null), container);

    expect(container.firstChild.nodeType).toBe(1);
    expect(container.firstChild.childNodes.length).toBe(0);
    expect(container.firstChild.tagName).toBe("DIV");

    render(template(span(spanList())), container);
    expect(container.firstChild.nodeType).toBe(1);
    expect(container.firstChild.firstChild.childNodes.length).toBe(1);
    expect(container.firstChild.firstChild.firstChild.childNodes.length).toBe(
      3
    );
    expect(container.firstChild.tagName).toBe("DIV");

    render(template(span(null)), container);

    expect(container.firstChild.nodeType).toBe(1);
    expect(container.firstChild.childNodes.length).toBe(1);
    expect(container.firstChild.tagName).toBe("DIV");
  });

  it("should handle lots of dynamic variables", () => {
    const template = function(val1, val2, val3, val4, val5, val6) {
      return createElement(
        "div",
        {
          className: val2,
          id: val1
        },
        createElement(
          "div",
          {
            id: val5
          },
          createElement("span", null, val6)
        ),
        createElement(
          "div",
          {
            className: val4
          },
          val3
        )
      );
    };

    render(template(), container);

    expect(container.firstChild.firstChild.tagName).toBe("DIV");
    expect(container.firstChild.getAttribute("class")).toBe(null);
    expect(container.firstChild.firstChild.firstChild.tagName).toBe("SPAN");
    expect(container.firstChild.firstChild.textContent).toBe("");
    expect(container.firstChild.firstChild.firstChild.textContent).toBe("");

    render(template("foo1", "bar1", "foo2", "bar2", "foo3", "bar3"), container);

    expect(container.firstChild.firstChild.tagName).toBe("DIV");
    expect(container.firstChild.getAttribute("class")).toBe("bar1");
    expect(container.firstChild.firstChild.firstChild.tagName).toBe("SPAN");
    expect(container.firstChild.firstChild.textContent).toBe("bar3");
    expect(container.firstChild.firstChild.firstChild.textContent).toBe("bar3");

    render(template("foo1", "foo2", "bar2", "foo3", "bar3"), container);

    expect(container.firstChild.firstChild.tagName).toBe("DIV");
    expect(container.firstChild.getAttribute("class")).toBe("foo2");
    expect(container.firstChild.firstChild.firstChild.tagName).toBe("SPAN");
    expect(container.firstChild.firstChild.textContent).toBe("");
    expect(container.firstChild.firstChild.firstChild.textContent).toBe("");

    render(template(null), container);
    expect(container.firstChild.firstChild.tagName).toBe("DIV");
    expect(container.firstChild.getAttribute("class")).toBe(null);
    expect(container.firstChild.firstChild.firstChild.tagName).toBe("SPAN");
    expect(container.firstChild.firstChild.textContent).toBe("");
    expect(container.firstChild.firstChild.firstChild.textContent).toBe("");

    render(template(undefined), container);
    expect(container.firstChild.firstChild.tagName).toBe("DIV");
    expect(container.firstChild.getAttribute("class")).toBe(null);
    expect(container.firstChild.firstChild.firstChild.tagName).toBe("SPAN");
    expect(container.firstChild.firstChild.textContent).toBe("");
    expect(container.firstChild.firstChild.firstChild.textContent).toBe("");

    render(template("yar1", "noo1", [], "noo2", "yar3", "noo3"), container);

    expect(container.firstChild.firstChild.tagName).toBe("DIV");
    expect(container.firstChild.getAttribute("class")).toBe("noo1");
    expect(container.firstChild.firstChild.firstChild.tagName).toBe("SPAN");
    expect(container.firstChild.firstChild.textContent).toBe("noo3");
    expect(container.firstChild.firstChild.firstChild.textContent).toBe("noo3");

    render(template("yar1", "noo1", [], "noo2", "yar3", 123), container);

    expect(container.firstChild.firstChild.tagName).toBe("DIV");
    expect(container.firstChild.getAttribute("class")).toBe("noo1");
    expect(container.firstChild.firstChild.firstChild.tagName).toBe("SPAN");
    expect(container.firstChild.firstChild.textContent).toBe("123");
    expect(container.firstChild.firstChild.firstChild.textContent).toBe("123");

    render(template("yar1", "noo1", "yar2", "noo2", "yar3", "noo3"), container);

    expect(container.firstChild.firstChild.tagName).toBe("DIV");
    expect(container.firstChild.getAttribute("class")).toBe("noo1");
    expect(container.firstChild.firstChild.firstChild.tagName).toBe("SPAN");
    expect(container.firstChild.firstChild.textContent).toBe("noo3");
    expect(container.firstChild.firstChild.firstChild.textContent).toBe("noo3");

    render(template("yar1", null, "yar2", "noo2", "yar3", null), container);

    expect(container.firstChild.firstChild.tagName).toBe("DIV");
    expect(container.firstChild.getAttribute("class")).toBe(null);
    expect(container.firstChild.firstChild.firstChild.tagName).toBe("SPAN");
    expect(container.firstChild.firstChild.textContent).toBe("");
    expect(container.firstChild.firstChild.firstChild.textContent).toBe("");

    render(template("yar1", null, null, "noo2", null, null), container);

    expect(container.firstChild.firstChild.tagName).toBe("DIV");
    expect(container.firstChild.getAttribute("class")).toBe(null);
    expect(container.firstChild.firstChild.firstChild.tagName).toBe("SPAN");
    expect(container.firstChild.firstChild.textContent).toBe("");
    expect(container.firstChild.firstChild.firstChild.textContent).toBe("");

    render(template([], null, null, [], null, null), container);

    expect(container.firstChild.firstChild.tagName).toBe("DIV");
    expect(container.firstChild.getAttribute("class")).toBe(null);
    expect(container.firstChild.firstChild.firstChild.tagName).toBe("SPAN");
    expect(container.firstChild.firstChild.textContent).toBe("");
    expect(container.firstChild.firstChild.firstChild.textContent).toBe("");

    render(template([], [], 123, [], null, null), container);

    expect(container.firstChild.firstChild.tagName).toBe("DIV");
    expect(container.firstChild.getAttribute("class")).toBe("");
    expect(container.firstChild.firstChild.firstChild.tagName).toBe("SPAN");
    expect(container.firstChild.firstChild.textContent).toBe("");
    expect(container.firstChild.firstChild.firstChild.textContent).toBe("");
  });

  it("should render a basic example #7", () => {
    const div = child => createElement("div", null, child);
    const span1 = () => "Hello world!";

    render(div(span1()), container);
    expect(container.innerHTML).toBe(innerHTML("<div>Hello world!</div>"));
    const span2 = child => createElement("span", null, "Im updated!");

    render(div(span2()), container);
  });

  it("should patch a wrapped text node with its container", () => {
    const template = child => createElement("div", null, child);

    render(template(null), container);
    expect(container.innerHTML).toBe(innerHTML("<div></div>"));

    render(template(null), container);
    expect(container.innerHTML).toBe(innerHTML("<div></div>"));
    const span = () => createElement("div", null, "Hello");

    render(template(span()), container);
    expect(container.innerHTML).toBe(innerHTML("<div><div>Hello</div></div>"));
  });

  it("should patch a text node into a tag node", () => {
    const template = child => createElement("div", null, child);
    const span = function() {
      return "Hello";
    };

    render(template(span()), container);
    expect(container.innerHTML).toBe(innerHTML("<div>Hello</div>"));
  });

  it("should patch a tag node into a text node #2", () => {
    const template = child => createElement("div", null, child);

    const span = () => createElement("span", null, "Good bye!");
    render(template(span()), container);
    expect(container.innerHTML).toBe(
      innerHTML("<div><span>Good bye!</span></div>")
    );

    render(template(), container);
    expect(container.innerHTML).toBe(innerHTML("<div></div>"));
  });

  it("should render text then update it", () => {
    const template = child => createElement("div", null, child);
    const span = function() {
      return "Hello";
    };

    render(template(span()), container);
    expect(container.firstChild.innerHTML).toBe("Hello");
    render(template(span()), container);
    expect(container.firstChild.innerHTML).toBe("Hello");
  });

  it("should render text then update to an array of text nodes", () => {
    const template = child => createElement("div", null, child);
    const span = function() {
      return createElement("span", null, "Hello ", "World", "!");
    };

    render(template(span()), container);
    expect(container.firstChild.innerHTML).toBe(
      innerHTML("<span>Hello World!</span>")
    );
    render(template(span()), container);
    expect(container.firstChild.innerHTML).toBe(
      innerHTML("<span>Hello World!</span>")
    );
  });

  it("should render an array of text nodes then update to a single text node", () => {
    const template = child => createElement("div", null, child);
    const span = function() {
      return createElement("span", null, "Hello ", "World", "!");
    };

    render(template(span()), container);
    expect(container.firstChild.innerHTML).toBe(
      innerHTML("<span>Hello World!</span>")
    );
  });

  it("should update and array of text nodes to another array of text nodes", () => {
    const template = child => createElement("div", null, child);
    const span = function() {
      return createElement("span", null, "Hello ", "World");
    };

    render(template(span()), container);
    expect(container.firstChild.innerHTML).toBe(
      innerHTML("<span>Hello World</span>")
    );
  });

  it("should update and array of text nodes to another array of text nodes #2", () => {
    const template = child => createElement("div", null, child);
    const span = function() {
      return createElement("span", null, "Hello ", "World", "!");
    };

    render(template(span()), container);
    expect(container.firstChild.innerHTML).toBe(
      innerHTML("<span>Hello World!</span>")
    );
    render(template(span()), container);
    expect(container.firstChild.innerHTML).toBe(
      innerHTML("<span>Hello World!</span>")
    );
  });

  it("should update an node with static child", () => {
    const template = child =>
      createElement(
        "div",
        null,
        createElement(
          "div",
          null,
          createElement("span", {
            id: child
          })
        )
      );

    render(template("id#1"), container);
    expect(container.firstChild.innerHTML).toBe(
      innerHTML('<div><span id="id#1"></span></div>')
    );

    render(template("id#2"), container);
    expect(container.firstChild.innerHTML).toBe(
      innerHTML('<div><span id="id#2"></span></div>')
    );
    render(template("id#3"), container);
    expect(container.firstChild.innerHTML).toBe(
      innerHTML('<div><span id="id#3"></span></div>')
    );
  });

  it("should update an node with static child and dynamic custom attribute", () => {
    const template = child =>
      createElement("div", null, createElement("div", null, child));
    const span = function(val) {
      return createElement("span", {
        custom_attr: val
      });
    };

    render(template(span("id#1")), container);
    expect(container.firstChild.innerHTML).toBe(
      innerHTML('<div><span custom_attr="id#1"></span></div>')
    );
    render(template(span("id#1")), container);
    expect(container.firstChild.innerHTML).toBe(
      innerHTML('<div><span custom_attr="id#1"></span></div>')
    );
  });

  it("should update an node with static child and dynamic custom attribute and static text", () => {
    const template = child =>
      createElement("div", null, createElement("div", null, child));
    const span = function(val) {
      return createElement(
        "span",
        {
          custom_attr: val
        },
        "Hello!!"
      );
    };

    render(template(span("id#1")), container);
    expect(container.firstChild.innerHTML).toBe(
      innerHTML('<div><span custom_attr="id#1">Hello!!</span></div>')
    );
    render(template(span("id#2")), container);
    expect(container.firstChild.innerHTML).toBe(
      innerHTML('<div><span custom_attr="id#2">Hello!!</span></div>')
    );
  });

  it("should update an node with static child and dynamic custom attribute and static text #2", () => {
    const template = child =>
      createElement("div", null, createElement("div", null, child));
    const span = function(val) {
      return createElement(
        "span",
        {
          custom_attr: val
        },
        "Hello!!"
      );
    };

    render(template(span("id#1")), container);
    expect(container.firstChild.innerHTML).toBe(
      innerHTML('<div><span custom_attr="id#1">Hello!!</span></div>')
    );
  });

  it("should not ignore a empty text node", () => {
    const template = () => createElement("span", null, "");

    render(template(), container);
    expect(container.childNodes.length).toBe(1);
    render(template(), container);
    expect(container.childNodes.length).toBe(1);
  });

  it("should remove a text node", () => {
    const template = child => createElement("div", null, child);

    render(template(["hello", "world"]), container);
    expect(container.firstChild.childNodes.length).toBe(2);
  });

  it("should update multiple changes", () => {
    const template = (val1, val2) =>
      createElement(
        "div",
        {
          className: val1
        },
        val2
      );

    render(template("hello", ["hello", "world"]), container);
    expect(container.firstChild.childNodes.length).toBe(2);
    expect(container.firstChild.getAttribute("class")).toBe("hello");

    render(template("good bye", ["hello"]), container);
    expect(container.firstChild.childNodes.length).toBe(1);
    expect(container.firstChild.getAttribute("class")).toBe("good bye");
  });

  it("should update an node with static child and text", () => {
    const template = () =>
      createElement("div", null, createElement("div", null, "Hello, World"));

    render(template(), container);
    expect(container.firstChild.innerHTML).toBe(
      innerHTML("<div>Hello, World</div>")
    );
    render(template(), container);
    expect(container.firstChild.innerHTML).toBe(
      innerHTML("<div>Hello, World</div>")
    );

    render(template(), container);
    expect(container.firstChild.innerHTML).toBe(
      innerHTML("<div>Hello, World</div>")
    );
  });

  it("should update an node with dynamic child", () => {
    const template = child =>
      createElement("div", null, createElement("div", null, child));
    const span = function() {
      return createElement("span", null, "Hello ", "World");
    };
    render(template(span()), container);
    expect(container.firstChild.innerHTML).toBe(
      innerHTML("<div><span>Hello World</span></div>")
    );
  });

  it("should inject dynamic text various places", () => {
    const div = text =>
      createElement("div", null, "There is ", text, " spoon!");

    render(div("no"), container);
    expect(container.innerHTML).toBe(
      innerHTML("<div>There is no spoon!</div>")
    );

    render(div("one"), container);
    expect(container.innerHTML).toBe(
      innerHTML("<div>There is one spoon!</div>")
    );

    render(div(), container);
    expect(container.innerHTML).toBe(innerHTML("<div>There is  spoon!</div>"));

    render(div(null), container);
    expect(container.innerHTML).toBe(innerHTML("<div>There is  spoon!</div>"));

    render(div(undefined), container);
    expect(container.innerHTML).toBe(innerHTML("<div>There is  spoon!</div>"));
  });

  it("should render a div tag and remove styling", () => {
    let template;

    template = styleRule =>
      createElement("div", {
        style: styleRule
      });

    render(
      template({
        color: "red",
        paddingLeft: "10px"
      }),
      container
    );

    expect(container.innerHTML).toBe(
      innerHTML('<div style="color: red; padding-left: 10px;"></div>')
    );

    render(template(null), container);

    expect([null, ""]).toContain(container.firstChild.getAttribute("style"));
  });

  // TODO: There seems to be bug in JSDOM because styles dont get removed by assigning null or empty to dom.style[something]
  if (typeof global !== "undefined" && !global.usingJSDOM) {
    describe("should render styling on root node, and set and remove styling on multiple children", () => {
      let template;

      template = styleRule =>
        createElement(
          "div",
          {
            style: {
              width: "200px"
            }
          },
          createElement(
            "div",
            {
              class: "Hello, world!"
            },
            createElement("div", {
              style: styleRule
            })
          )
        );

      it("Initial render (creation)", () => {
        render(
          template({
            color: "red",
            paddingTop: "10px"
          }),
          container
        );

        expect(container.innerHTML).toBe(
          innerHTML(
            '<div style="width: 200px;"><div class="Hello, world!"><div style="color: red; padding-top: 10px;"></div></div></div>'
          )
        );
        render(
          template({
            color: "red",
            paddingLeft: "10px"
          }),
          container
        );

        expect(container.innerHTML).toBe(
          innerHTML(
            '<div style="width: 200px;"><div class="Hello, world!"><div style="color: red; padding-left: 10px;"></div></div></div>'
          )
        );
      });

      it("Second render (update)", () => {
        render(template(null), container); // change style to null

        expect([null, ""]).toContain(
          container.firstChild.firstChild.getAttribute("style")
        );
      });

      it("Third render (update)", () => {
        render(
          template({
            color: "blue",
            marginBottom: "20px"
          }),
          container
        );

        expect(container.innerHTML).toBe(
          innerHTML(
            '<div style="width: 200px;"><div class="Hello, world!"><div style="color: blue; margin-bottom: 20px;"></div></div></div>'
          )
        );
      });
    });
  }

  describe("Github #142", () => {
    describe("nonKeyed updates", () => {
      it("variation 1", () => {
        function A() {
          return createElement(
            "div",
            null,
            createElement(
              "div",
              null,
              createElement(
                "table",
                null,
                createElement("tr", null, createElement("td", null, "Text"))
              )
            )
          );
        }

        function B() {
          return createElement(
            "div",
            null,
            createElement(
              "div",
              null,
              createElement(
                "table",
                null,
                createElement("tr", null, createElement("td", null, "bar"))
              )
            )
          );
        }

        function C() {
          return createElement(
            "div",
            null,
            createElement(
              "div",
              null,
              createElement(
                "table",
                null,
                createElement("tr", null, createElement("td", null, "text1"))
              )
            )
          );
        }

        // eslint-disable-next-line
        render(A(), container);
        expect(container.innerHTML).toBe(
          "<div><div><table><tr><td>Text</td></tr></table></div></div>"
        );
        // eslint-disable-next-line
        render(B(), container);
        expect(container.innerHTML).toBe(
          "<div><div><table><tr><td>bar</td></tr></table></div></div>"
        );
        // eslint-disable-next-line
        render(C(), container);
        expect(container.innerHTML).toBe(
          "<div><div><table><tr><td>text1</td></tr></table></div></div>"
        );
      });

      it("variation 2", () => {
        const A = createElement(
          "div",
          null,
          createElement(
            "div",
            null,
            createElement(
              "table",
              null,
              createElement(
                "tr",
                null,
                createElement("td", null, "text", createElement("br", null))
              )
            )
          )
        );
        const B = createElement(
          "div",
          null,
          createElement(
            "div",
            null,
            createElement(
              "table",
              null,
              createElement("tr", null, createElement("td", null, ["text"]))
            )
          )
        );
        const C = createElement(
          "div",
          null,
          createElement(
            "div",
            null,
            createElement(
              "table",
              null,
              createElement(
                "tr",
                null,
                createElement("td", null, ["value"], createElement("br", null))
              )
            )
          )
        );

        render(A, container);
        expect(container.innerHTML).toBe(
          "<div><div><table><tr><td>text<br></td></tr></table></div></div>"
        );
        render(B, container);
        expect(container.innerHTML).toBe(
          "<div><div><table><tr><td>text</td></tr></table></div></div>"
        );
        render(C, container);
        expect(container.innerHTML).toBe(
          "<div><div><table><tr><td>value<br></td></tr></table></div></div>"
        );
      });

      it("variation 3", () => {
        const A = createElement(
          "div",
          null,
          createElement("div", null, createElement("table", null))
        );
        const B = createElement(
          "div",
          null,
          createElement(
            "div",
            null,
            createElement(
              "table",
              null,
              createElement("tr", null),
              createElement(
                "tr",
                null,
                createElement("td", null, "A", createElement("br", null)),
                createElement("td", null, "B", createElement("br", null))
              ),
              createElement("tr", null)
            )
          )
        );
        const C = createElement(
          "div",
          null,
          createElement(
            "div",
            null,
            createElement(
              "table",
              null,
              createElement("tr", null),
              createElement(
                "tr",
                null,
                createElement("td", null, createElement("br", null))
              )
            )
          )
        );

        render(A, container);
        expect(container.innerHTML).toBe(
          "<div><div><table></table></div></div>"
        );
        render(B, container);
        expect(container.innerHTML).toBe(
          "<div><div><table><tr></tr><tr><td>A<br></td><td>B<br></td></tr><tr></tr></table></div></div>"
        );
        render(C, container);
        expect(container.innerHTML).toBe(
          "<div><div><table><tr></tr><tr><td><br></td></tr></table></div></div>"
        );
      });

      it("variation 4", () => {
        const A = createElement(
          "div",
          null,
          createElement(
            "div",
            null,
            createElement(
              "table",
              null,
              createElement(
                "tr",
                null,
                createElement("td", null, "text 1", createElement("br", null))
              )
            )
          )
        );

        const B = createElement(
          "div",
          null,
          createElement(
            "div",
            null,
            createElement(
              "table",
              null,
              createElement(
                "tr",
                null,
                createElement("td", null, createElement("br", null))
              )
            )
          )
        );

        const C = createElement(
          "div",
          null,
          createElement(
            "div",
            null,
            createElement(
              "table",
              null,
              createElement(
                "tr",
                null,
                createElement("td", null, "text 2", createElement("br", null))
              )
            )
          )
        );

        render(A, container);
        expect(container.innerHTML).toBe(
          "<div><div><table><tr><td>text 1<br></td></tr></table></div></div>"
        );
        render(B, container);
        expect(container.innerHTML).toBe(
          "<div><div><table><tr><td><br></td></tr></table></div></div>"
        );
        render(C, container);
        expect(container.innerHTML).toBe(
          "<div><div><table><tr><td>text 2<br></td></tr></table></div></div>"
        );
      });

      it("variation 5", () => {
        const A = [];

        A[0] = createElement(
          "table",
          null,
          createElement(
            "tr",
            null,
            createElement("td", null, createElement("br", null))
          )
        );
        A[1] = createElement(
          "table",
          null,
          createElement(
            "tr",
            null,
            createElement(
              "td",
              null,
              "text 1",
              "text a",
              createElement("br", null)
            )
          )
        );
        A[2] = createElement(
          "table",
          null,
          createElement(
            "tr",
            null,
            createElement("td", null, "text 2", createElement("br", null))
          )
        );
        A[3] = createElement(
          "table",
          null,
          createElement(
            "tr",
            null,
            createElement(
              "td",
              null,
              [createElement("br", null), "text 3"],
              createElement("br", null)
            )
          )
        );
        render(A[0], container);
        expect(container.innerHTML).toBe(
          "<table><tr><td><br></td></tr></table>"
        );
        render(A[1], container);
        expect(container.innerHTML).toBe(
          "<table><tr><td>text 1text a<br></td></tr></table>"
        );
        render(A[2], container);
        expect(container.innerHTML).toBe(
          "<table><tr><td>text 2<br></td></tr></table>"
        );
        render(A[3], container);
        expect(container.innerHTML).toBe(
          "<table><tr><td><br>text 3<br></td></tr></table>"
        );
      });

      it("variation 6", () => {
        const A = createElement(
          "div",
          null,
          createElement(
            "div",
            null,
            createElement(
              "table",
              null,
              createElement(
                "tr",
                null,
                createElement("td", null, "text 1", createElement("br", null))
              )
            )
          )
        );

        const B = createElement(
          "div",
          null,
          createElement(
            "div",
            null,
            createElement(
              "table",
              null,
              createElement(
                "tr",
                null,
                createElement("td", null, createElement("br", null))
              )
            )
          )
        );

        const C = createElement(
          "div",
          null,
          createElement(
            "div",
            null,
            createElement(
              "table",
              null,
              createElement(
                "tr",
                null,
                createElement("td", null, "text 2", createElement("br", null))
              )
            )
          )
        );

        render(A, container);
        expect(container.innerHTML).toBe(
          "<div><div><table><tr><td>text 1<br></td></tr></table></div></div>"
        );
        render(B, container);
        expect(container.innerHTML).toBe(
          "<div><div><table><tr><td><br></td></tr></table></div></div>"
        );
        render(C, container);
        expect(container.innerHTML).toBe(
          "<div><div><table><tr><td>text 2<br></td></tr></table></div></div>"
        );
      });

      it("variation 7", () => {
        const A = [];
        A[0] = createElement(
          "table",
          null,
          createElement(
            "tr",
            null,
            createElement("td", null, createElement("br", null))
          )
        );
        A[1] = createElement(
          "table",
          null,
          createElement(
            "tr",
            null,
            createElement("td", null, "text 1", createElement("br", null))
          )
        );
        A[2] = createElement(
          "table",
          null,
          createElement(
            "tr",
            null,
            createElement("td", null, "text 2", createElement("br", null))
          )
        );
        A[3] = createElement(
          "table",
          null,
          createElement(
            "tr",
            null,
            createElement(
              "td",
              null,
              [createElement("br", null)],
              "text 3",
              createElement("br", null)
            )
          )
        );

        render(A[0], container);
        expect(container.innerHTML).toBe(
          "<table><tr><td><br></td></tr></table>"
        );
        render(A[1], container);
        expect(container.innerHTML).toBe(
          "<table><tr><td>text 1<br></td></tr></table>"
        );
        render(A[2], container);
        expect(container.innerHTML).toBe(
          "<table><tr><td>text 2<br></td></tr></table>"
        );
        render(A[3], container);
        expect(container.innerHTML).toBe(
          "<table><tr><td><br>text 3<br></td></tr></table>"
        );
      });
    });

    describe("KEYED updates", () => {
      it("variation 1", () => {
        function A() {
          return createElement(
            "div",
            null,
            createElement(
              "div",
              null,
              createElement(
                "table",
                null,
                createElement(
                  "tr",
                  { key: "row1" },
                  createElement("td", { key: "td1" }, "Text")
                )
              )
            )
          );
        }

        function B() {
          return createElement(
            "div",
            null,
            createElement(
              "div",
              null,
              createElement(
                "table",
                null,
                createElement(
                  "tr",
                  { key: "row1" },
                  createElement("td", { key: "td1" }, "bar")
                )
              )
            )
          );
        }

        function C() {
          return createElement(
            "div",
            null,
            createElement(
              "div",
              null,
              createElement(
                "table",
                null,
                createElement(
                  "tr",
                  { key: "row1" },
                  createElement("td", { key: "td1" }, "text1")
                )
              )
            )
          );
        }

        // eslint-disable-next-line
        render(A(), container);
        expect(container.innerHTML).toBe(
          "<div><div><table><tr><td>Text</td></tr></table></div></div>"
        );
        // eslint-disable-next-line
        render(B(), container);
        expect(container.innerHTML).toBe(
          "<div><div><table><tr><td>bar</td></tr></table></div></div>"
        );
        // eslint-disable-next-line
        render(C(), container);
        expect(container.innerHTML).toBe(
          "<div><div><table><tr><td>text1</td></tr></table></div></div>"
        );
      });

      it("variation 2", () => {
        const A = createElement(
          "div",
          null,
          createElement(
            "div",
            null,
            createElement(
              "table",
              null,
              createElement(
                "tr",
                { key: "row1" },
                createElement("td", { key: "td1" }, [
                  "text",
                  createElement("br", null)
                ])
              )
            )
          )
        );

        const B = createElement(
          "div",
          null,
          createElement(
            "div",
            null,
            createElement(
              "table",
              null,
              createElement(
                "tr",
                { key: "row1" },
                createElement("td", { key: "td1" }, ["text"])
              )
            )
          )
        );

        const C = createElement(
          "div",
          null,
          createElement(
            "div",
            null,
            createElement(
              "table",
              null,
              createElement(
                "tr",
                { key: "row1" },
                createElement("td", { key: "td1" }, [
                  "value",
                  createElement("br", null)
                ])
              )
            )
          )
        );

        render(A, container);
        expect(container.innerHTML).toBe(
          "<div><div><table><tr><td>text<br></td></tr></table></div></div>"
        );
        render(B, container);
        expect(container.innerHTML).toBe(
          "<div><div><table><tr><td>text</td></tr></table></div></div>"
        );
        render(C, container);
        expect(container.innerHTML).toBe(
          "<div><div><table><tr><td>value<br></td></tr></table></div></div>"
        );
      });

      it("variation 3", () => {
        const A = createElement(
          "div",
          null,
          createElement("div", null, createElement("table", null))
        );
        const B = createElement(
          "div",
          null,
          createElement(
            "div",
            null,
            createElement(
              "table",
              null,
              createElement("tr", { key: "row1" }),
              createElement(
                "tr",
                { key: "row2" },
                createElement(
                  "td",
                  { key: "td2-1" },
                  "A",
                  createElement("br", null)
                ),
                createElement(
                  "td",
                  { key: "td2-2" },
                  "B",
                  createElement("br", null)
                )
              ),
              createElement("tr", { key: "row3" })
            )
          )
        );
        const C = createElement(
          "div",
          null,
          createElement(
            "div",
            null,
            createElement(
              "table",
              null,
              createElement("tr", { key: "row1" }),
              createElement(
                "tr",
                { key: "row2" },
                createElement(
                  "td",
                  { key: "td2-2" },
                  "",
                  createElement("br", null)
                )
              )
            )
          )
        );

        render(A, container);
        expect(container.innerHTML).toBe(
          "<div><div><table></table></div></div>"
        );
        render(B, container);
        expect(container.innerHTML).toBe(
          "<div><div><table><tr></tr><tr><td>A<br></td><td>B<br></td></tr><tr></tr></table></div></div>"
        );
        render(C, container);
        expect(container.innerHTML).toBe(
          "<div><div><table><tr></tr><tr><td><br></td></tr></table></div></div>"
        );
      });

      it("variation 4", () => {
        const A = createElement(
          "div",
          null,
          createElement(
            "div",
            null,
            createElement(
              "table",
              null,
              createElement(
                "tr",
                { key: "row1" },
                createElement(
                  "td",
                  { key: "td1-1" },
                  "text 1",
                  createElement("br", null)
                )
              )
            )
          )
        );

        const B = createElement(
          "div",
          null,
          createElement(
            "div",
            null,
            createElement(
              "table",
              null,
              createElement(
                "tr",
                { key: "row1" },
                createElement(
                  "td",
                  { key: "td1-1" },
                  "",
                  createElement("br", null)
                )
              )
            )
          )
        );

        const C = createElement(
          "div",
          null,
          createElement(
            "div",
            null,
            createElement(
              "table",
              null,
              createElement(
                "tr",
                { key: "row1" },
                createElement(
                  "td",
                  { key: "td1-1" },
                  "text 2",
                  createElement("br", null)
                )
              )
            )
          )
        );

        render(A, container);
        expect(container.innerHTML).toBe(
          "<div><div><table><tr><td>text 1<br></td></tr></table></div></div>"
        );
        render(B, container);
        expect(container.innerHTML).toBe(
          "<div><div><table><tr><td><br></td></tr></table></div></div>"
        );
        render(C, container);
        expect(container.innerHTML).toBe(
          "<div><div><table><tr><td>text 2<br></td></tr></table></div></div>"
        );
      });

      it("variation 5", () => {
        const A = [];

        A[0] = createElement(
          "table",
          null,
          createElement(
            "tr",
            { key: "row1" },
            createElement("td", { key: "td1-1" }, "", createElement("br", null))
          )
        );

        A[1] = createElement(
          "table",
          null,
          createElement(
            "tr",
            { key: "row1" },
            createElement(
              "td",
              { key: "td1-1" },
              ["text 1", "text a"],
              createElement("br", null)
            )
          )
        );

        A[2] = createElement(
          "table",
          null,
          createElement(
            "tr",
            { key: "row1" },
            createElement(
              "td",
              { key: "td1-1" },
              ["text 2"],
              createElement("br", null)
            )
          )
        );

        A[3] = createElement(
          "table",
          null,
          createElement(
            "tr",
            { key: "row1" },
            createElement(
              "td",
              { key: "td1-1" },
              [createElement("br", null), "text 3"],
              createElement("br", null)
            )
          )
        );

        render(A[0], container);
        expect(container.innerHTML).toBe(
          "<table><tr><td><br></td></tr></table>"
        );
        render(A[1], container);
        expect(container.innerHTML).toBe(
          "<table><tr><td>text 1text a<br></td></tr></table>"
        );
        render(A[2], container);
        expect(container.innerHTML).toBe(
          "<table><tr><td>text 2<br></td></tr></table>"
        );
        render(A[3], container);
        expect(container.innerHTML).toBe(
          "<table><tr><td><br>text 3<br></td></tr></table>"
        );
      });

      it("variation 6", () => {
        const A = createElement(
          "div",
          null,
          createElement(
            "div",
            null,
            createElement(
              "table",
              null,
              createElement(
                "tr",
                { key: "row1" },
                createElement("td", { key: "td1-1" }, [
                  "text 1",
                  createElement("br", null)
                ])
              )
            )
          )
        );

        const B = createElement(
          "div",
          null,
          createElement(
            "div",
            null,
            createElement(
              "table",
              null,
              createElement(
                "tr",
                { key: "row1" },
                createElement("td", { key: "td1-1" }, [
                  "",
                  createElement("br", null)
                ])
              )
            )
          )
        );

        const C = createElement(
          "div",
          null,
          createElement(
            "div",
            null,
            createElement(
              "table",
              null,
              createElement(
                "tr",
                { key: "row1" },
                createElement("td", { key: "td1-1" }, [
                  "text 2",
                  createElement("br", null)
                ])
              )
            )
          )
        );

        render(A, container);
        expect(container.innerHTML).toBe(
          "<div><div><table><tr><td>text 1<br></td></tr></table></div></div>"
        );
        render(B, container);
        expect(container.innerHTML).toBe(
          "<div><div><table><tr><td><br></td></tr></table></div></div>"
        );
        render(C, container);
        expect(container.innerHTML).toBe(
          "<div><div><table><tr><td>text 2<br></td></tr></table></div></div>"
        );
      });

      it("variation 7", () => {
        const A = [];

        A[0] = createElement(
          "table",
          null,
          createElement(
            "tr",
            { key: "row1" },
            createElement("td", { key: "td1-1" }, "", createElement("br", null))
          )
        );

        A[1] = createElement(
          "table",
          null,
          createElement(
            "tr",
            { key: "row1" },
            createElement(
              "td",
              { key: "td1-1" },
              "text 1",
              createElement("br", null)
            )
          )
        );

        A[2] = createElement(
          "table",
          null,
          createElement(
            "tr",
            { key: "row1" },
            createElement(
              "td",
              { key: "td1-1" },
              "text 2",
              createElement("br", null)
            )
          )
        );

        A[3] = createElement(
          "table",
          null,
          createElement(
            "tr",
            { key: "row1" },
            createElement(
              "td",
              { key: "td1-1" },
              [createElement("br", null), "text 3"],
              createElement("br", null)
            )
          )
        );

        render(A[0], container);
        expect(container.innerHTML).toBe(
          "<table><tr><td><br></td></tr></table>"
        );
        render(A[1], container);
        expect(container.innerHTML).toBe(
          "<table><tr><td>text 1<br></td></tr></table>"
        );
        render(A[2], container);
        expect(container.innerHTML).toBe(
          "<table><tr><td>text 2<br></td></tr></table>"
        );
        render(A[3], container);
        expect(container.innerHTML).toBe(
          "<table><tr><td><br>text 3<br></td></tr></table>"
        );
      });
    });
  });

  describe("Github #162", () => {
    it("works", () => {
      const A = [];

      A[0] = createElement("div", null, "text 1");
      A[1] = createElement(
        "div",
        null,
        "text 2",
        createElement("br", null),
        "text 3"
      );
      A[2] = createElement("div", null, "text 4");

      render(A[0], container);
      expect(container.innerHTML).toBe(innerHTML("<div>text 1</div>"));
      render(A[1], container);
      expect(container.innerHTML).toBe(
        innerHTML("<div>text 2<br>text 3</div>")
      );
      render(A[2], container);
      expect(container.innerHTML).toBe(innerHTML("<div>text 4</div>"));
    });
  });

  describe("Github #162", () => {
    it("works", () => {
      const A = [];

      A[0] = createElement("div", null, "text 1", createElement("br", null));

      A[1] = createElement("div", null, "text 2");

      A[2] = createElement("div", null, createElement("br", null), "text 4");

      render(A[0], container);
      expect(container.innerHTML).toBe(innerHTML("<div>text 1<br></div>"));
      render(A[1], container);
      expect(container.innerHTML).toBe(innerHTML("<div>text 2</div>"));
      render(A[2], container);
      expect(container.innerHTML).toBe(innerHTML("<div><br>text 4</div>"));
    });
  });
});
