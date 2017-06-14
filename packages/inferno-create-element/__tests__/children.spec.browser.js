import { render } from "inferno";
import createElement from "inferno-create-element";

describe("Children - (non-JSX)", () => {
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

  const preDefined = [
    {
      name: "undefined",
      value: undefined,
      expected: ""
    },
    {
      name: "null",
      value: null,
      expected: ""
    },
    {
      name: "one whitespace",
      value: " ",
      expected: " "
    },
    {
      name: "whitespace to left",
      value: "a ",
      expected: "a "
    },
    {
      name: "whitespace to right",
      value: " a",
      expected: " a"
    },
    {
      name: "should set children as empty string",
      value: "",
      expected: ""
    },
    {
      name: "should create a div with text, children property",
      value: "string",
      expected: "string"
    },
    {
      name: "0",
      value: 0,
      expected: "0"
    },
    {
      name: "0 (cast to string)",
      value: "0",
      expected: "0"
    },
    {
      name: "negative number",
      value: -44444,
      expected: "-44444"
    },
    {
      name: "negative number (cast to string)",
      value: "-2344",
      expected: "-2344"
    },
    {
      name: "NaN",
      value: NaN,
      expected: "NaN"
    },
    {
      name: "empty array",
      value: [],
      expected: ""
    },
    {
      name: "simple math",
      value: 123 - 33,
      expected: "90"
    },
    {
      name: "advanced math",
      value: 123 - 33 / 4 - 444 * 345,
      expected: "-153065.25"
    },
    {
      name: "number array",
      value: [1, 2, 3],
      expected: "123"
    },
    {
      name: "number array (long array)",
      value: [1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3],
      expected: "123123123123"
    },
    {
      name: "number array (long mixed array)",
      value: [1, "2", 3, "1", 2, 3, "1", 2, 3, 1, 2, "3"],
      expected: "123123123123"
    },
    {
      name: "number array (long mixed array) and undefined and empty string",
      value: [1, "2", "", "1", 2, 3, "1", 2, undefined, 1, 2, "3"],
      expected: "1212312123"
    },
    {
      name: "number array (cast to string)",
      value: ["1", "2", "3"],
      expected: "123"
    },
    {
      name: "number array (cast to string) and various whitespaces",
      value: [" 1 ", "2", "3  "],
      expected: " 1 23  "
    },
    {
      name: "single undefined in an array",
      value: [1, 2, undefined],
      expected: "12"
    },
    {
      name: "undefined in the middle of an array",
      value: [1, undefined, 3],
      expected: "13"
    },
    {
      name: "dobule undefined in an array",
      value: [1, undefined, undefined],
      expected: "1"
    },
    {
      name: "triple undefined in an array",
      value: [undefined, undefined, undefined],
      expected: ""
    },
    {
      name: "triple empty string in an array",
      value: ["", "", ""],
      expected: ""
    },
    {
      name: "triple null in an array",
      value: [null, null, null],
      expected: ""
    },
    {
      name: "single null in an array",
      value: [null],
      expected: ""
    },
    {
      name: "single null in an array",
      value: ["{}"],
      expected: "{}"
    },
    {
      name: "mix of null and undefined in an array",
      value: [null, undefined],
      expected: ""
    },
    {
      name: "mix of null, undefined and empty string in an array",
      value: [null, undefined, ""],
      expected: ""
    },
    {
      name: "mix of null, undefined and a number in an array",
      value: [null, undefined, 123],
      expected: "123"
    },
    {
      name: "mix of null, undefined and a number in an array",
      value: [null, undefined, 123, " ", undefined, null, undefined],
      expected: "123 "
    },
    {
      name: "single empty string in an array",
      value: [1, 2, ""],
      expected: "12"
    },
    {
      name: "dobule empty string in an array",
      value: [1, "", ""],
      expected: "1"
    },
    {
      name: "triple empty string in an array",
      value: ["", "", ""],
      expected: ""
    },
    {
      name: "cast to string value, + single number in an array",
      value: ["1", 2, 3],
      expected: "123"
    },
    {
      name: "cast to strng value, + single number + a letter in an array",
      value: ["1", 2, "a"],
      expected: "12a"
    },
    {
      name: "cast to strng value, + single number + a letter in an array",
      value: ["1", null, "a"],
      expected: "1a"
    },
    {
      name: "cast to strng value, + single number + a letter in an array",
      value: [undefined, null, "a"],
      expected: "a"
    },
    {
      name: "cast to strng value, + single number + a letter in an array",
      value: [undefined, null, 123, undefined, null],
      expected: "123"
    }
  ];

  preDefined.forEach(arg => {
    [
      {
        description: "should set static children as " + arg.name,
        template: () => createElement("div", null, arg.value)
      }
    ].forEach(test => {
      it(test.description, () => {
        render(test.template(), container);
        expect(container.firstChild.nodeType).toBe(1);
        expect(container.firstChild.textContent).toBe(arg.expected);
        render(test.template(), container);
        expect(container.firstChild.nodeType).toBe(1);
        expect(container.firstChild.textContent).toBe(arg.expected);
      });
    });
  });

  preDefined.forEach(arg => {
    [
      {
        description: "should set static deep children as " + arg.name,
        template: () =>
          createElement("div", null, createElement("span", null, arg.value))
      }
    ].forEach(test => {
      it(test.description, () => {
        render(test.template(), container);
        expect(container.firstChild.nodeType).toBe(1);
        expect(container.firstChild.firstChild.nodeType).toBe(1);
        expect(container.firstChild.childNodes.length).toBe(1);
        expect(container.firstChild.firstChild.textContent).toBe(arg.expected);
        render(test.template(), container);
        expect(container.firstChild.nodeType).toBe(1);
        expect(container.firstChild.firstChild.nodeType).toBe(1);
        expect(container.firstChild.childNodes.length).toBe(1);
        expect(container.firstChild.firstChild.textContent).toBe(arg.expected);
      });
    });
  });

  preDefined.forEach(arg => {
    [
      {
        description: "should set very deep static children as " + arg.name,
        template: () =>
          createElement(
            "div",
            null,
            createElement(
              "span",
              null,
              createElement("b", null, createElement("b", null, arg.value))
            )
          )
      }
    ].forEach(test => {
      it(test.description, () => {
        render(test.template(), container);
        expect(container.firstChild.nodeType).toBe(1);
        expect(container.firstChild.firstChild.nodeType).toBe(1);
        expect(container.firstChild.childNodes.length).toBe(1);
        expect(container.firstChild.firstChild.textContent).toBe(arg.expected);
        render(test.template(), container);
        expect(container.firstChild.nodeType).toBe(1);
        expect(container.firstChild.firstChild.nodeType).toBe(1);
        expect(container.firstChild.childNodes.length).toBe(1);
        expect(container.firstChild.firstChild.textContent).toBe(arg.expected);
      });
    });
  });

  preDefined.forEach(arg => {
    [
      {
        description: "should set dynamic children as " + arg.name,

        template: child => createElement("div", null, child)
      }
    ].forEach(test => {
      it(test.description, () => {
        render(test.template(arg.value), container);
        expect(container.firstChild.nodeType).toBe(1);
        expect(container.firstChild.textContent).toBe(arg.expected);
        render(test.template(arg.value), container);
        expect(container.firstChild.nodeType).toBe(1);
        expect(container.firstChild.textContent).toBe(arg.expected);
        render(test.template(), container);
        expect(container.firstChild.nodeType).toBe(1);
        expect(container.firstChild.textContent).toBe("");
        render(test.template(arg.value), container);
        expect(container.firstChild.nodeType).toBe(1);
        expect(container.firstChild.textContent).toBe(arg.expected);
      });

      it(test.description, () => {
        render(test.template(), container);
        expect(container.firstChild.nodeType).toBe(1);
        expect(container.firstChild.textContent).toBe("");
        render(test.template(arg.value), container);
        expect(container.firstChild.nodeType).toBe(1);
        expect(container.firstChild.textContent).toBe(arg.expected);
      });

      it(test.description, () => {
        render(test.template(null), container);
        expect(container.firstChild.nodeType).toBe(1);
        expect(container.firstChild.textContent).toBe("");
        render(test.template(arg.value), container);
        expect(container.firstChild.nodeType).toBe(1);
        expect(container.firstChild.textContent).toBe(arg.expected);
      });

      it(test.description, () => {
        render(test.template(arg.value), container);
        expect(container.firstChild.nodeType).toBe(1);
        expect(container.firstChild.textContent).toBe(arg.expected);
        render(test.template(null), container);
        expect(container.firstChild.nodeType).toBe(1);
        expect(container.firstChild.textContent).toBe("");
      });

      it(test.description, () => {
        render(test.template(), container);
        expect(container.firstChild.nodeType).toBe(1);
        expect(container.firstChild.textContent).toBe("");
        render(test.template(undefined), container);
        expect(container.firstChild.nodeType).toBe(1);
        expect(container.firstChild.textContent).toBe("");
      });

      it(test.description, () => {
        render(test.template(null), container);
        expect(container.firstChild.nodeType).toBe(1);
        expect(container.firstChild.textContent).toBe("");
        render(test.template(null), container);
        expect(container.firstChild.nodeType).toBe(1);
        expect(container.firstChild.textContent).toBe("");
      });
    });
  });

  preDefined.forEach(arg => {
    [
      {
        description: "should set deep dynamic children as " + arg.name,
        template: child =>
          createElement("div", null, createElement("b", null, child))
      }
    ].forEach(test => {
      it(test.description, () => {
        render(test.template(arg.value), container);
        expect(container.firstChild.firstChild.nodeType).toBe(1);
        expect(container.firstChild.firstChild.textContent).toBe(arg.expected);
        render(test.template(arg.value), container);
        expect(container.firstChild.firstChild.nodeType).toBe(1);
        expect(container.firstChild.firstChild.textContent).toBe(arg.expected);
        render(test.template(null), container);
        expect(container.firstChild.firstChild.nodeType).toBe(1);
        expect(container.firstChild.firstChild.textContent).toBe("");
        render(test.template(undefined), container);
        expect(container.firstChild.firstChild.nodeType).toBe(1);
        expect(container.firstChild.firstChild.textContent).toBe("");
        render(test.template(), container);
        expect(container.firstChild.firstChild.nodeType).toBe(1);
        expect(container.firstChild.firstChild.textContent).toBe("");
      });
    });
  });
});
