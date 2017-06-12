import { render } from "inferno";
import createElement from "inferno-create-element";

function generateNodes(array) {
  let i, id;
  const children = [];

  for (i = 0; i < array.length; i++) {
    id = array[i];

    children.push(createElement("div", { key: String(id) }, id));
  }
  return children;
}

function spanTagWithText(text) {
  return createElement(
    "span",
    {
      className: "TableCell"
    },
    text
  );
}

describe("Non Keyed nodes", () => {
  let container;

  const template = function(child) {
    return createElement("div", null, child);
  };

  beforeEach(function() {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(function() {
    render(null, container);
    container.innerHTML = "";
    document.body.removeChild(container);
  });

  it("should add all nodes", () => {
    render(template(generateNodes([])), container);
    render(template(generateNodes(["#0", "#1", "#2", "#3"])), container);
    expect(container.textContent).toBe("#0#1#2#3");
    expect(container.firstChild.childNodes.length).toBe(4);
  });
  it("should remove two keys at the beginning", () => {
    render(template(generateNodes(["a", "b", "c"])), container);
    render(template(generateNodes(["c"])), container);
    expect(container.textContent).toBe("c");
    expect(container.firstChild.childNodes.length).toBe(1);
  });
  it("should size up", () => {
    render(template(generateNodes(["#0", "#1"])), container);
    render(template(generateNodes(["#0", "#1", "#2", "#3"])), container);
    expect(container.textContent).toBe("#0#1#2#3");
    expect(container.firstChild.childNodes.length).toBe(4);
  });
  it("should size down", () => {
    render(template(generateNodes(["#0", "#1", "#2", "#3"])), container);
    render(template(generateNodes(["#0", "#1"])), container);
    expect(container.textContent).toBe("#0#1");
    expect(container.firstChild.childNodes.length).toBe(2);
  });
  it("should clear all nodes", () => {
    render(template(generateNodes(["#0", "#1", "#2", "#3"])), container);
    render(template(generateNodes([])), container);
    expect(container.textContent).toBe("");
    expect(container.firstChild.childNodes.length).toBe(0);
  });
  it("should work with mixed nodes", () => {
    render(template(generateNodes(["1", "#0", "#1", "#2"])), container);
    render(template(generateNodes(["#0", "#1", "#2", "#3"])), container);
    expect(container.textContent).toBe("#0#1#2#3");
    expect(container.firstChild.childNodes.length).toBe(4);
  });
  it("should move a key for start to end", () => {
    render(template(generateNodes(["a", "#0", "#1", "#2"])), container);
    render(template(generateNodes(["#0", "#1", "#2", "a"])), container);
    expect(container.textContent).toBe("#0#1#2a");
    expect(container.firstChild.childNodes.length).toBe(4);
  });
  it("should move a key", () => {
    render(template(generateNodes(["#0", "a", "#2", "#3"])), container);
    render(template(generateNodes(["#0", "#1", "a", "#3"])), container);
    expect(container.textContent).toBe("#0#1a#3");
    expect(container.firstChild.childNodes.length).toBe(4);
  });
  it("should move a key with a size up", () => {
    render(template(generateNodes(["a", "#1", "#2", "#3"])), container);
    render(
      template(generateNodes(["#0", "#1", "#2", "#3", "a", "#5"])),
      container
    );
    expect(container.textContent).toBe("#0#1#2#3a#5");
    expect(container.firstChild.childNodes.length).toBe(6);
    render(template(generateNodes(["a", "#1", "#2", "#3"])), container);
    render(
      template(generateNodes(["#0", "#1", "#2", "#3", "a", "#5"])),
      container
    );
    expect(container.textContent).toBe("#0#1#2#3a#5");
    expect(container.firstChild.childNodes.length).toBe(6);
    render(template(generateNodes(["a", "#1", "#2", "#3"])), container);
    render(
      template(generateNodes(["#0", "#1", "#2", "#3", "a", "#5"])),
      container
    );
    expect(container.textContent).toBe("#0#1#2#3a#5");
    expect(container.firstChild.childNodes.length).toBe(6);
    render(template(generateNodes(["a", "#1", "#2", "#3"])), container);
    render(
      template(generateNodes(["#0", "#1", "#2", "#3", "a", "#5"])),
      container
    );
    expect(container.textContent).toBe("#0#1#2#3a#5");
    expect(container.firstChild.childNodes.length).toBe(6);
    render(template(generateNodes(["a", "#1", "#2", "#4"])), container);
    render(
      template(generateNodes(["#0", "#1", "#2", "#4", "a", "#5"])),
      container
    );
    expect(container.textContent).toBe("#0#1#2#4a#5");
    expect(container.firstChild.childNodes.length).toBe(6);
    render(template(generateNodes(["a", "#1", "#2", "#3"])), container);
    render(
      template(generateNodes(["#0", "#1", "#2", "#3", "a", "#5"])),
      container
    );
    expect(container.textContent).toBe("#0#1#2#3a#5");
    expect(container.firstChild.childNodes.length).toBe(6);
  });

  it("should move a key with a size down", () => {
    render(template(generateNodes(["a", "#1", "#2", "#3"])), container);
    render(template(generateNodes(["#0", "a", "#2"])), container);
    expect(container.textContent).toBe("#0a#2");
    expect(container.firstChild.childNodes.length).toBe(3);
  });
  it("should avoid unnecessary reordering", () => {
    render(template(generateNodes(["#0", "a", "#2"])), container);
    render(template(generateNodes(["#0", "a", "#2"])), container);
    expect(container.textContent).toBe("#0a#2");
    expect(container.firstChild.childNodes.length).toBe(3);
  });
  it("should work with keyed nodes", () => {
    render(template(generateNodes([0, 1, 2, 3, 4])), container);
    render(template(generateNodes([1, 2, 3, 4, 0])), container);
    expect(container.textContent).toBe("12340");
    expect(container.firstChild.childNodes.length).toBe(5);
    render(template(generateNodes([0, 1, 2, 3, 4])), container);
    render(template(generateNodes([1, 7, 3, 4, 5])), container); // this originally had duplicate keys!
    expect(container.textContent).toBe("17345");
    expect(container.firstChild.childNodes.length).toBe(5);
    render(template(generateNodes([1, 2, 3, 4, 0])), container);
    expect(container.textContent).toBe("12340");
  });

  it("should reorder keys", () => {
    render(
      template(generateNodes(["1", "2", "3", "4", "abc", "6", "def", "7"])),
      container
    );
    render(
      template(generateNodes(["7", "4", "3", "2", "6", "abc", "def", "1"])),
      container
    );
    expect(container.textContent).toBe("74326abcdef1");
    expect(container.firstChild.childNodes.length).toBe(8);
  });
  it("should remove one key at the start", () => {
    render(template(generateNodes(["a", "b", "c"])), container);
    render(template(generateNodes(["b", "c"])), container);
    expect(container.textContent).toBe("bc");
    expect(container.firstChild.childNodes.length).toBe(2);
    render(template(generateNodes(["a", "b", "c"])), container);
    render(template(generateNodes(["b", "c"])), container);
    expect(container.textContent).toBe("bc");
    expect(container.firstChild.childNodes.length).toBe(2);
    render(template(generateNodes(["a", "b", "c", "d"])), container);
    render(template(generateNodes(["d", "c", "b", "a"])), container);
    expect(container.textContent).toBe("dcba");
    expect(container.firstChild.childNodes.length).toBe(4);
  });

  it("should do a complex reverse", () => {
    render(template(generateNodes(["a", "b", "c", "d"])), container);
    render(template(generateNodes(["d", "c", "b", "a"])), container);
    expect(container.textContent).toBe("dcba");
    expect(container.firstChild.childNodes.length).toBe(4);
    render(template(generateNodes(["a", "b", "c"])), container);
    render(template(generateNodes([0])), container);
    expect(container.textContent).toBe("0");
    expect(container.firstChild.childNodes.length).toBe(1);
    render(template(generateNodes(["a", "b", "c", "d"])), container);
    render(template(generateNodes(["d", "c", "b", "a"])), container);
    expect(container.textContent).toBe("dcba");
    expect(container.firstChild.childNodes.length).toBe(4);
  });

  it("should remove two keys at the start", () => {
    render(template(generateNodes(["a", "b", "c"])), container);
    render(template(generateNodes(["c"])), container);
    expect(container.textContent).toBe("c");
    expect(container.firstChild.childNodes.length).toBe(1);
  });
  it("should add one key to start", () => {
    render(template(generateNodes(["a", "b"])), container);
    render(template(generateNodes(["a", "b", "c"])), container);
    expect(container.textContent).toBe("abc");
    expect(container.firstChild.childNodes.length).toBe(3);
  });
  it("should add two key to start", () => {
    render(template(generateNodes(["c"])), container);
    render(template(generateNodes(["a", "b", "c"])), container);
    expect(container.textContent).toBe("abc");
    expect(container.firstChild.childNodes.length).toBe(3);
  });
  it("should remove one key at the end", () => {
    render(template(generateNodes(["a", "b", "c"])), container);
    render(template(generateNodes(["a", "b"])), container);
    expect(container.textContent).toBe("ab");
    expect(container.firstChild.childNodes.length).toBe(2);
  });
  it("should remove two keys at the end", () => {
    render(template(generateNodes(["a", "b", "c"])), container);
    render(template(generateNodes(["a"])), container);
    expect(container.textContent).toBe("a");
    expect(container.firstChild.childNodes.length).toBe(1);
  });
  it("should add one key at the end", () => {
    render(template(generateNodes(["a", "b"])), container);
    render(template(generateNodes(["a", "b", "c"])), container);
    expect(container.textContent).toBe("abc");
    expect(container.firstChild.childNodes.length).toBe(3);
  });
  it("should add two key at the end", () => {
    render(template(generateNodes(["a"])), container);
    render(template(generateNodes(["a", "b", "c"])), container);
    expect(container.textContent).toBe("abc");
    expect(container.firstChild.childNodes.length).toBe(3);
  });
  it("should add to end, delete from center & reverse", () => {
    render(template(generateNodes(["a", "b", "c", "d"])), container);
    render(template(generateNodes(["e", "d", "c", "a"])), container);
    expect(container.textContent).toBe("edca");
    expect(container.firstChild.childNodes.length).toBe(4);
  });
  it("should add to the beginning and remove", () => {
    render(template(generateNodes(["c", "d"])), container);
    render(template(generateNodes(["a", "b", "c", "e"])), container);
    expect(container.textContent).toBe("abce");
    expect(container.firstChild.childNodes.length).toBe(4);
  });
  it("should keep a central pivot", () => {
    render(template(generateNodes(["1", "2", "3"])), container);
    render(template(generateNodes(["4", "2", "5"])), container);
    expect(container.textContent).toBe("425");
    expect(container.firstChild.childNodes.length).toBe(3);
  });
  it("should insert to the middle", () => {
    render(template(generateNodes(["c", "d", "e"])), container);
    render(template(generateNodes(["a", "b", "e"])), container);
    expect(container.textContent).toBe("abe");
    expect(container.firstChild.childNodes.length).toBe(3);
  });
  it("should shuffle, insert and remove", () => {
    render(
      template(generateNodes(["a", "b", "c", "d", "e", "f", "g"])),
      container
    );
    render(template(generateNodes(["b", "c", "a"])), container);
    expect(container.textContent).toBe("bca");
    expect(container.firstChild.childNodes.length).toBe(3);
  });
  it("should remove a element from the middle", () => {
    render(template(generateNodes([1, 2, 3, 4, 5])), container);
    expect(container.firstChild.childNodes.length).toBe(5);
    render(template(generateNodes([1, 2, 4, 5])), container);
    expect(container.textContent).toBe("1245");
    expect(container.firstChild.childNodes.length).toBe(4);
  });
  it("should move a element forward", () => {
    render(template(generateNodes([1, 2, 3, 4])), container);
    expect(container.firstChild.childNodes.length).toBe(4);
    render(template(generateNodes([2, 3, 1, 4])), container);
    expect(container.textContent).toBe("2314");
    expect(container.firstChild.childNodes.length).toBe(4);
  });
  it("should move a element to the end", () => {
    render(template(generateNodes([1, 2, 3])), container);
    expect(container.firstChild.childNodes.length).toBe(3);
    render(template(generateNodes([2, 3, 1])), container);
    expect(container.textContent).toBe("231");
    expect(container.firstChild.childNodes.length).toBe(3);
  });
  it("should move a element backwards", () => {
    render(template(generateNodes([1, 2, 3, 4])), container);
    expect(container.firstChild.childNodes.length).toBe(4);
    render(template(generateNodes([1, 4, 2, 3])), container);
    expect(container.textContent).toBe("1423");
    expect(container.firstChild.childNodes.length).toBe(4);
  });
  it("should swap first and last", () => {
    render(template(generateNodes([1, 2, 3, 4])), container);
    expect(container.firstChild.childNodes.length).toBe(4);
    render(template(generateNodes([4, 2, 3, 1])), container);
    expect(container.textContent).toBe("4231");
    expect(container.firstChild.childNodes.length).toBe(4);
  });
  it("should move to left and replace", () => {
    render(template(generateNodes([1, 2, 3, 4, 5])), container);
    expect(container.firstChild.childNodes.length).toBe(5);
    render(template(generateNodes([4, 1, 2, 3, 6])), container);
    expect(container.textContent).toBe("41236");
    expect(container.firstChild.childNodes.length).toBe(5);
  });
  it("should move to left and leave a hole", () => {
    render(template(generateNodes([1, 4, 5])), container);
    expect(container.firstChild.childNodes.length).toBe(3);
    render(template(generateNodes([4, 6])), container);
    expect(container.textContent).toBe("46");
    expect(container.firstChild.childNodes.length).toBe(2);
  });
  it("should do something", () => {
    render(template(generateNodes([0, 1, 2, 3, 4, 5])), container);
    expect(container.firstChild.childNodes.length).toBe(6);
    render(template(generateNodes([4, 3, 2, 1, 5, 0])), container);
    expect(container.textContent).toBe("432150");
    expect(container.firstChild.childNodes.length).toBe(6);
  });

  describe("Without blueprints", () => {
    it("should swap two non-keyed children", () => {
      render(
        template([spanTagWithText("a"), [], spanTagWithText("b")]),
        container
      );
      expect(container.textContent).toBe("ab");
      render(
        template([spanTagWithText("b"), null, spanTagWithText("a")]),
        container
      );
      expect(container.textContent).toBe("ba");
    });

    it("should do a complex move of non-keyed to the beginning", () => {
      render(
        template([
          spanTagWithText("x"),
          spanTagWithText("y"),
          spanTagWithText("a"),
          spanTagWithText("b"),
          spanTagWithText("d"),
          spanTagWithText("c"),
          spanTagWithText("v"),
          spanTagWithText("w")
        ]),
        container
      );
      expect(container.textContent).toBe("xyabdcvw");
      expect(container.firstChild.childNodes.length).toBe(8);
      render(
        template([
          spanTagWithText("y"),
          spanTagWithText("x"),
          spanTagWithText("a"),
          spanTagWithText("d2"),
          spanTagWithText("f"),
          spanTagWithText("g"),
          spanTagWithText("w"),
          spanTagWithText("v")
        ]),
        container
      );
      expect(container.textContent).toBe("yxad2fgwv");
      expect(container.firstChild.childNodes.length).toBe(8);
      render(
        template([
          spanTagWithText("x"),
          spanTagWithText("y"),
          spanTagWithText("a"),
          spanTagWithText("b"),
          spanTagWithText("d"),
          spanTagWithText("c"),
          spanTagWithText("v"),
          spanTagWithText("w")
        ]),
        container
      );
      expect(container.textContent).toBe("xyabdcvw");
      expect(container.firstChild.childNodes.length).toBe(8);
      render(
        template([
          spanTagWithText("y"),
          spanTagWithText("x"),
          undefined,
          spanTagWithText("a"),
          spanTagWithText("d2"),
          spanTagWithText("f"),
          spanTagWithText("g"),
          spanTagWithText("w"),
          spanTagWithText("v")
        ]),
        container
      );
      expect(container.textContent).toBe("yxad2fgwv");
      expect(container.firstChild.childNodes.length).toBe(8);
    });

    it("should do a advanced shuffle", () => {
      render(
        template([
          spanTagWithText("a"),
          spanTagWithText("b"),
          spanTagWithText("c"),
          spanTagWithText("d")
        ]),
        container
      );
      expect(container.textContent).toBe("abcd");
      expect(container.firstChild.childNodes.length).toBe(4);
      render(
        template([
          spanTagWithText("e"),
          spanTagWithText("b"),
          spanTagWithText("f"),
          spanTagWithText("g"),
          spanTagWithText("c"),
          spanTagWithText("a")
        ]),
        container
      );
      expect(container.textContent).toBe("ebfgca");
      expect(container.firstChild.childNodes.length).toBe(6);
      render(
        template([
          spanTagWithText("a"),
          spanTagWithText("6"),
          null,
          spanTagWithText("c"),
          spanTagWithText("d")
        ]),
        container
      );
      expect(container.textContent).toBe("a6cd");
      expect(container.firstChild.childNodes.length).toBe(4);
      render(
        template([
          spanTagWithText("e"),
          spanTagWithText("b"),
          spanTagWithText("f"),
          spanTagWithText("g"),
          spanTagWithText("c"),
          spanTagWithText("a")
        ]),
        container
      );
      expect(container.textContent).toBe("ebfgca");
      expect(container.firstChild.childNodes.length).toBe(6);
      render(
        template([
          spanTagWithText("a"),
          spanTagWithText("b"),
          undefined,
          spanTagWithText("c"),
          spanTagWithText("d")
        ]),
        container
      );
      expect(container.textContent).toBe("abcd");
      expect(container.firstChild.childNodes.length).toBe(4);
      render(
        template([
          spanTagWithText("e"),
          spanTagWithText("b"),
          spanTagWithText("f"),
          spanTagWithText("g"),
          spanTagWithText("c"),
          spanTagWithText("a")
        ]),
        container
      );
      expect(container.textContent).toBe("ebfgca");
      expect(container.firstChild.childNodes.length).toBe(6);
    });

    it("should do a complex reverse #2", () => {
      render(
        template([
          spanTagWithText("#0"),
          spanTagWithText("#1"),
          spanTagWithText("#2")
        ]),
        container
      );
      render(
        template([
          spanTagWithText("#2"),
          spanTagWithText("#1"),
          spanTagWithText("#0")
        ]),
        container
      );
      expect(container.textContent).toBe("#2#1#0");
      expect(container.firstChild.childNodes.length).toBe(3);
      render(
        template([
          spanTagWithText("#2"),
          spanTagWithText("#1"),
          spanTagWithText("#0")
        ]),
        container
      );
      expect(container.textContent).toBe("#2#1#0");
      expect(container.firstChild.childNodes.length).toBe(3);
      render(
        template([
          spanTagWithText("#2"),
          spanTagWithText("#1"),
          null,
          null,
          null,
          spanTagWithText("#0")
        ]),
        container
      );
      expect(container.textContent).toBe("#2#1#0");
      expect(container.firstChild.childNodes.length).toBe(3);
      render(
        template([
          spanTagWithText("#2"),
          spanTagWithText("#1"),
          spanTagWithText("#4")
        ]),
        container
      );
      expect(container.textContent).toBe("#2#1#4");
      expect(container.firstChild.childNodes.length).toBe(3);
    });

    it("should add to end, delete from center & reverse #2", () => {
      render(
        template([
          spanTagWithText("a"),
          spanTagWithText("b"),
          spanTagWithText("c"),
          spanTagWithText("d")
        ]),
        container
      );
      render(
        template([
          spanTagWithText("e"),
          spanTagWithText("d"),
          spanTagWithText("c"),
          spanTagWithText("a")
        ]),
        container
      );
      expect(container.textContent).toBe("edca");
      expect(container.firstChild.childNodes.length).toBe(4);
      render(
        template([
          spanTagWithText("#2"),
          spanTagWithText("#1"),
          spanTagWithText("#0")
        ]),
        container
      );
      expect(container.textContent).toBe("#2#1#0");
      expect(container.firstChild.childNodes.length).toBe(3);
      render(
        template([
          spanTagWithText("#2"),
          spanTagWithText("#1"),
          spanTagWithText("#4")
        ]),
        container
      );
      expect(container.textContent).toBe("#2#1#4");
      expect(container.firstChild.childNodes.length).toBe(3);
      render(
        template([
          spanTagWithText("a"),
          spanTagWithText("b"),
          spanTagWithText("c"),
          spanTagWithText("d")
        ]),
        container
      );
      render(
        template([
          spanTagWithText("e"),
          spanTagWithText("d"),
          spanTagWithText("c"),
          spanTagWithText("a")
        ]),
        container
      );
      expect(container.textContent).toBe("edca");
      expect(container.firstChild.childNodes.length).toBe(4);
    });

    it("should insert to the middle #2", () => {
      render(
        template([
          spanTagWithText("c"),
          spanTagWithText("d"),
          spanTagWithText("e")
        ]),
        container
      );
      expect(container.textContent).toBe("cde");
      expect(container.firstChild.childNodes.length).toBe(3);
      render(
        template([
          spanTagWithText("a"),
          spanTagWithText("b"),
          spanTagWithText("e")
        ]),
        container
      );
      expect(container.textContent).toBe("abe");
      expect(container.firstChild.childNodes.length).toBe(3);
      render(
        template([
          spanTagWithText("c"),
          spanTagWithText("d"),
          null,
          null,
          null,
          spanTagWithText("e")
        ]),
        container
      );
      expect(container.textContent).toBe("cde");
      expect(container.firstChild.childNodes.length).toBe(3);
    });
  });
});
