import { render as infernoRender } from "inferno";

function getTextFromNode(node, addSpaces) {
  let i, result, text, child;
  result = "";
  for (i = 0; i < node.childNodes.length; i++) {
    child = node.childNodes[i];
    text = null;
    if (child.nodeType === 1) {
      text = getTextFromNode(child, addSpaces);
    } else if (child.nodeType === 3) {
      text = child.nodeValue;
    }
    if (text) {
      if (addSpaces && /\S$/.test(result) && /^\S/.test(text))
        text = " " + text;
      result += text;
    }
  }
  return result;
}

export function renderComponent(container, component) {
  infernoRender(component, container);
  return {
    selector: "",
    find(selector) {
      this.selector = selector;
      return this;
    },
    text() {
      const element = container.querySelector(this.selector);
      return getTextFromNode(element);
    }
  };
}
