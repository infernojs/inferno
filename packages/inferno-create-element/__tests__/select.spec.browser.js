import { render } from "inferno";
import createElement from "inferno-create-element";
import { innerHTML } from "inferno-utils";

describe("Select / select multiple (non-JSX)", () => {
  let container;

  beforeEach(function() {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(function() {
    render(null, container);
    container.innerHTML = "";
    document.body.removeChild(container);
  });

  it('should render "select" boolean on select options with numbers', () => {
    const template = val =>
      createElement(
        "select",
        {
          multiple: true,
          value: val
        },
        createElement(
          "option",
          {
            value: 1
          },
          1
        ),
        createElement(
          "option",
          {
            value: 2
          },
          2
        )
      );

    render(template(null), container);
    render(template(), container);
    render(template(2), container);

    expect(container.firstChild.children[0].selected).toEqual(false);
    expect(container.firstChild.children[1].selected).toEqual(true);
    expect(container.innerHTML).toBe(
      innerHTML(
        '<select multiple=""><option value="1">1</option><option value="2">2</option></select>'
      )
    );

    render(template(1), container);

    expect(container.firstChild.children[0].selected).toEqual(true);
    expect(container.firstChild.children[1].selected).toEqual(false);
    expect(container.innerHTML).toBe(
      innerHTML(
        '<select multiple=""><option value="1">1</option><option value="2">2</option></select>'
      )
    );

    render(template("foo"), container);

    expect(container.firstChild.children[0].selected).toEqual(false);
    expect(container.firstChild.children[1].selected).toEqual(false);
    expect(container.innerHTML).toBe(
      innerHTML(
        '<select multiple=""><option value="1">1</option><option value="2">2</option></select>'
      )
    );
  });

  // it('should render "select" boolean on select options #1 browser', () => {
  //
  // 	const template = (val) => createElement('select', {
  // 		multiple: true,
  // 		value: val
  // 	}, createElement('option', {
  // 		value: 'foo'
  // 	}, 'foo'), createElement('option', {
  // 		value: 'bar'
  // 	}, 'bar'));
  //
  // 	render(template({}), container);
  // 	render(template(null), container);
  // 	render(template(undefined), container);
  // 	render(template('foo'), container);
  // 	expect(container.firstChild.children[ 0 ].selected).to.eql(true);
  // 	expect(container.firstChild.children[ 1 ].selected).to.eql(false);
  // 	expect(
  // 		container.innerHTML
  // 	).toEqual(
  // 		innerHTML('<select multiple=""><option value="foo">foo</option><option value="bar">bar</option></select>')
  // 	);
  // 	render(template(undefined), container);
  // 	render(template(null), container);
  // 	expect(container.firstChild.children[ 0 ].selected).to.eql(false);
  // 	expect(container.firstChild.children[ 1 ].selected).to.eql(false);
  // 	expect(
  // 		container.innerHTML
  // 	).toEqual(
  // 		innerHTML('<select multiple=""><option value="foo">foo</option><option value="bar">bar</option></select>')
  // 	);
  //
  // 	render(template('bar'), container);
  // 	expect(container.firstChild.children[ 0 ].selected).to.eql(false);
  // 	expect(container.firstChild.children[ 1 ].selected).to.eql(true);
  // 	expect(
  // 		container.innerHTML
  // 	).toEqual(
  // 		innerHTML('<select multiple=""><option value="foo">foo</option><option value="bar">bar</option></select>')
  // 	);
  // });

  it('should render "select" boolean on select options #2 browser', () => {
    const template = val =>
      createElement(
        "select",
        {
          multiple: true,
          value: val
        },
        createElement(
          "option",
          {
            value: "foo"
          },
          "foo"
        ),
        createElement(
          "option",
          {
            value: "bar"
          },
          "bar"
        )
      );

    render(template("foo"), container);
    expect(container.firstChild.children[0].selected).toEqual(true);
    expect(container.firstChild.children[1].selected).toEqual(false);
    expect(container.innerHTML).toBe(
      // Missing selected markup
      innerHTML(
        '<select multiple=""><option value="foo">foo</option><option value="bar">bar</option></select>'
      )
    );
  });

  it("should populate the value attribute on select multiple using groups", () => {
    const template = val =>
      createElement(
        "select",
        {
          multiple: true,
          value: val
        },
        createElement(
          "optgroup",
          { label: "foo-group" },
          createElement("option", { value: "foo" })
        ),
        createElement(
          "optgroup",
          { label: "bar-group", disabled: true },
          createElement("option", { value: "bar" })
        )
      );

    // render(template(undefined), container);
    render(template(["foo", "bar"]), container);

    expect(container.firstChild.children[0].disabled).toEqual(false);
    expect(container.firstChild.children[1].disabled).toEqual(true);

    expect(container.firstChild.childNodes[0].innerHTML).toEqual(
      '<option value="foo"></option>'
    );
    expect(container.firstChild.childNodes[1].innerHTML).toEqual(
      '<option value="bar"></option>'
    );

    expect(container.firstChild.children[0].children[0].selected).toEqual(true);
    expect(container.firstChild.children[1].children[0].selected).toEqual(true);

    render(template([]), container);

    expect(container.firstChild.childNodes[0].innerHTML).toEqual(
      '<option value="foo"></option>'
    );
    expect(container.firstChild.childNodes[1].innerHTML).toEqual(
      '<option value="bar"></option>'
    );

    expect(container.firstChild.children[0].children[0].selected).toEqual(
      false
    );
    expect(container.firstChild.children[1].children[0].selected).toEqual(
      false
    );

    render(template("foo"), container);

    expect(container.firstChild.childNodes[0].innerHTML).toEqual(
      '<option value="foo"></option>'
    );
    expect(container.firstChild.childNodes[1].innerHTML).toEqual(
      '<option value="bar"></option>'
    );

    expect(container.firstChild.children[0].children[0].selected).toEqual(true);
    expect(container.firstChild.children[1].children[0].selected).toEqual(
      false
    );

    render(template("bar"), container);

    expect(container.firstChild.childNodes[0].innerHTML).toEqual(
      '<option value="foo"></option>'
    );
    expect(container.firstChild.childNodes[1].innerHTML).toEqual(
      '<option value="bar"></option>'
    );

    expect(container.firstChild.children[0].children[0].selected).toEqual(
      false
    );
    expect(container.firstChild.children[1].children[0].selected).toEqual(true);

    render(template(false), container);

    expect(container.firstChild.childNodes[0].innerHTML).toEqual(
      '<option value="foo"></option>'
    );
    expect(container.firstChild.childNodes[1].innerHTML).toEqual(
      '<option value="bar"></option>'
    );

    expect(container.firstChild.children[0].children[0].selected).toEqual(
      false
    );
    expect(container.firstChild.children[1].children[0].selected).toEqual(
      false
    );
  });

  it('should render "select" boolean on select options #3 browser', () => {
    const template = val =>
      createElement(
        "select",
        {
          multiple: true,
          value: val
        },
        createElement(
          "option",
          {
            value: "foo"
          },
          "foo"
        ),
        createElement(
          "option",
          {
            value: "bar"
          },
          "bar"
        )
      );

    render(template("bar"), container);

    expect(container.firstChild.children[0].selected).toEqual(false);
    expect(container.firstChild.children[1].selected).toEqual(true);
    expect(container.innerHTML).toBe(
      innerHTML(
        '<select multiple=""><option value="foo">foo</option><option value="bar">bar</option></select>'
      )
    );

    render(template(""), container);

    expect(container.firstChild.children[0].selected).toEqual(false);
    expect(container.firstChild.children[1].selected).toEqual(false);
    expect(container.innerHTML).toBe(
      innerHTML(
        '<select multiple=""><option value="foo">foo</option><option value="bar">bar</option></select>'
      )
    );
  });

  it("should assure a `textarea` with no value should show no value", () => {
    render(createElement("textarea", null), container);
    expect(container.firstChild.value).toEqual("");
  });

  it("should assure the value attribute also set the value property for `textarea`", () => {
    const template = val =>
      createElement("textarea", {
        value: val
      });

    render(template("foo"), container);
    expect(container.firstChild.value).toEqual("foo");
    render(template("bar"), container);
    expect(container.firstChild.value).toEqual("bar");
    render(template("bar"), container);
    expect(container.firstChild.value).toEqual("bar");
    render(template("foo"), container);
    expect(container.firstChild.value).toEqual("foo");
    render(template(null), container);
    expect(container.firstChild.value).toEqual("");
    render(template(undefined), container);
    expect(container.firstChild.value).toEqual("");
    render(template("bar"), container);
    expect(container.firstChild.value).toEqual("bar");
    render(template([]), container);
    expect(container.firstChild.value).toEqual("");
    render(template({}), container);
    expect(container.firstChild.value).toEqual("[object Object]");
  });

  it("should handle when multiple values passed in as an array", () => {
    const template = val =>
      createElement(
        "select",
        {
          multiple: true,
          value: val
        },
        createElement(
          "option",
          {
            value: "a"
          },
          "a"
        ),
        createElement(
          "option",
          {
            value: "b"
          },
          "b"
        ),
        createElement(
          "option",
          {
            value: "c"
          },
          "c"
        ),
        createElement(
          "option",
          {
            value: "d"
          },
          "d"
        )
      );
    render(template(["a", "b", "c"]), container);
    expect(container.firstChild.children[0].selected).toEqual(true);
    expect(container.firstChild.children[1].selected).toEqual(true);
    expect(container.firstChild.children[2].selected).toEqual(true);
    expect(container.firstChild.children[3].selected).toEqual(false);
    expect(container.innerHTML).toBe(
      innerHTML(
        '<select multiple=""><option value="a">a</option><option value="b">b</option><option value="c">c</option><option value="d">d</option></select>'
      )
    );
  });

  it("should handle when multiple options with selected set", () => {
    const template = () =>
      createElement(
        "select",
        {
          multiple: true
        },
        createElement(
          "option",
          {
            value: "a",
            selected: true
          },
          "a"
        ),
        createElement(
          "option",
          {
            value: "b",
            selected: true
          },
          "b"
        ),
        createElement(
          "option",
          {
            value: "c",
            selected: true
          },
          "c"
        ),
        createElement(
          "option",
          {
            value: "d"
          },
          "d"
        )
      );
    render(template(), container);

    expect(container.firstChild.children[0].selected).toEqual(true);
    expect(container.firstChild.children[1].selected).toEqual(true);
    expect(container.firstChild.children[2].selected).toEqual(true);
    expect(container.firstChild.children[3].selected).toEqual(false);
    expect(container.innerHTML).toBe(
      innerHTML(
        '<select multiple=""><option value="a">a</option><option value="b">b</option><option value="c">c</option><option value="d">d</option></select>'
      )
    );
  });

  it("should render defaultValue", () => {
    const template = () =>
      createElement(
        "select",
        {
          defaultValue: "b"
        },
        createElement(
          "option",
          {
            value: "a"
          },
          "a"
        ),
        createElement(
          "option",
          {
            value: "b"
          },
          "b"
        ),
        createElement(
          "option",
          {
            value: "c"
          },
          "c"
        ),
        createElement(
          "option",
          {
            value: "d"
          },
          "d"
        )
      );
    render(template(), container);

    expect(container.firstChild.children[0].selected).toEqual(false);
    expect(container.firstChild.children[1].selected).toEqual(true);
    expect(container.firstChild.children[2].selected).toEqual(false);
    expect(container.firstChild.children[3].selected).toEqual(false);
    expect(container.innerHTML).toBe(
      innerHTML(
        '<select><option value="a">a</option><option value="b">b</option><option value="c">c</option><option value="d">d</option></select>'
      )
    );
  });

  it("should render multiple defaultValue", () => {
    const template = () =>
      createElement(
        "select",
        {
          multiple: true,
          defaultValue: ["a", "b", "c"]
        },
        createElement(
          "option",
          {
            value: "a"
          },
          "a"
        ),
        createElement(
          "option",
          {
            value: "b"
          },
          "b"
        ),
        createElement(
          "option",
          {
            value: "c"
          },
          "c"
        ),
        createElement(
          "option",
          {
            value: "d"
          },
          "d"
        )
      );
    render(template(), container);

    expect(container.firstChild.children[0].selected).toEqual(true);
    expect(container.firstChild.children[1].selected).toEqual(true);
    expect(container.firstChild.children[2].selected).toEqual(true);
    expect(container.firstChild.children[3].selected).toEqual(false);
    expect(container.innerHTML).toBe(
      innerHTML(
        '<select multiple=""><option value="a">a</option><option value="b">b</option><option value="c">c</option><option value="d">d</option></select>'
      )
    );
  });

  it("should not touch selections, if value or selected, is null or undefined", () => {
    render(
      createElement(
        "select",
        null,
        createElement(
          "option",
          {
            value: "a"
          },
          "a"
        ),
        createElement(
          "option",
          {
            value: "b"
          },
          "b"
        )
      ),
      container
    );
    container.firstChild.children[1].selected = true;
    render(
      createElement(
        "select",
        null,
        createElement(
          "option",
          {
            value: "a"
          },
          "a"
        ),
        createElement(
          "option",
          {
            value: "b"
          },
          "b"
        )
      ),
      container
    );
    expect(container.firstChild.children[0].selected).toEqual(false);
    expect(container.firstChild.children[1].selected).toEqual(true);
  });
});
