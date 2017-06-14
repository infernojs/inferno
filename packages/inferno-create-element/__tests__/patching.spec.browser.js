import { render } from "inferno";
import createElement from "inferno-create-element";

describe("patching keyed lists (non-jsx)", () => {
  function createDataModels() {
    const dataModels = [];

    dataModels.push(addGroupSingleChild(500));
    dataModels.push(addGroupSingleChild(400));
    dataModels.push(addGroupSingleChild(5));
    dataModels.push(addGroupSingleChild(50));
    dataModels.push(addGroupSingleChild(300));
    dataModels.push(addGroupSingleChild(0));

    return dataModels;
  }

  function addGroupSingleChild(count) {
    const dataModel = [];
    for (let i = 0; i < count; i++) {
      dataModel.push({
        key: i,
        children: null
      });
    }
    return dataModel;
  }

  function shuffle(dataModel) {
    for (let e, t, n = dataModel.length; n !== 0; ) {
      e = Math.floor(Math.random() * n--);
      t = dataModel[n];
      dataModel[n] = dataModel[e];
      dataModel[e] = t;
    }
  }

  function createExpectedChildren(nodes) {
    const children = [];
    let i, e, n;

    for (i = 0; i < nodes.length; i++) {
      n = nodes[i];
      if (n.children !== null) {
        e = document.createElement("div");
        render(n.children, e);
        // This code is here to make typescript happy... lol
        for (let a = 0; a < e.children.length; a++) {
          children.push(e.children[a]);
        }
        // We could just return e.children, but that conflicts with typescript types...
        return children;
      } else {
        e = document.createElement("span");
        e.textContent = n.key.toString();
        children.push(e);
      }
    }

    return children;
  }

  function createExpected(nodes) {
    const c = document.createElement("div");
    const e = document.createElement("div");
    const children = createExpectedChildren(nodes);
    for (let i = 0; i < children.length; i++) {
      e.appendChild(children[i]);
    }
    c.appendChild(e);
    return c.innerHTML;
  }

  const container = document.createElement("div");
  let dataModels = null;

  beforeEach(function() {
    dataModels = createDataModels();
  });

  afterEach(function() {
    dataModels = null;
  });

  function renderTree(nodes) {
    const children = new Array(nodes.length);
    let i;
    let n;

    for (i = 0; i < nodes.length; i++) {
      n = nodes[i];
      if (n.children !== null) {
        children[i] = createElement(
          "div",
          { key: n.key },
          renderTree(n.children)
        );
      } else {
        children[i] = createElement("span", { key: n.key }, n.key);
      }
    }
    return children;
  }

  function renderModel(dataModel) {
    render(createElement("div", null, renderTree(dataModel)), container);
  }

  it("should render various combinations", () => {
    let dataModel = dataModels[0];

    renderModel(dataModel);

    expect(container.innerHTML).toBe(createExpected(dataModel));

    dataModel = dataModels[0];

    renderModel(dataModel);

    expect(container.innerHTML).toBe(createExpected(dataModel));

    dataModel = dataModels[3];
    dataModel.reverse();

    renderModel(dataModel);

    expect(container.innerHTML).toBe(createExpected(dataModel));

    render(null, container);

    dataModel = dataModels[0];
    dataModel.reverse();
    render(null, container);

    dataModel = dataModels[0];
    dataModel.reverse();

    renderModel(dataModel);

    expect(container.innerHTML).toBe(createExpected(dataModel));

    render(null, container);

    dataModel = dataModels[1];
    dataModel.reverse();

    renderModel(dataModel);

    expect(container.innerHTML).toBe(createExpected(dataModel));

    render(null, container);

    dataModel = dataModels[3];

    renderModel(dataModel);

    expect(container.innerHTML).toBe(createExpected(dataModel));

    render(null, container);

    dataModel = dataModels[1];

    renderModel(dataModel);

    expect(container.innerHTML).toBe(createExpected(dataModel));

    render(null, container);

    dataModel = dataModels[4];

    renderModel(dataModel);

    expect(container.innerHTML).toBe(createExpected(dataModel));

    render(null, container);

    dataModel = dataModels[2];
    dataModel.reverse();

    renderModel(dataModel);

    expect(container.innerHTML).toBe(createExpected(dataModel));

    render(null, container);

    dataModel = dataModels[3];
    dataModel.reverse();

    renderModel(dataModel);

    expect(container.innerHTML).toBe(createExpected(dataModel));

    render(null, container);

    dataModel = dataModels[1];
    shuffle(dataModel);

    renderModel(dataModel);

    expect(container.innerHTML).toBe(createExpected(dataModel));

    render(null, container);
  });
});
