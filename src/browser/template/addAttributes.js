import events from "../events/shared/events";
import clearEventListeners from "../events/clearEventListeners";
import addEventListener from "../events/addEventListener";

import DOMAttrCfg from "./DOMAttrCfg";

export default function( node, attrs, component ) {

     var attrName, attrVal;
  for (attrName in attrs) {
    attrVal = attrs[attrName];

    if (events[attrName] != null) {
      clearEventListeners(node, component, attrName);
      addEventListener(node, component, attrName, attrVal);
      continue;
    }

    //to improve creation performance, this attempts to use properties rather than attributes on common types
    switch (attrName) {
      case "class":
      case "className":
        node.className = attrVal;
        break;
      case "id":
        node.id = attrVal;
        break;
      case "href":
        node.href = attrVal;
        break;
      case "value":
        node.value = attrVal;
        break;
      case "name":
        node.name = attrVal;
        break;
      case "disabled":
        node.disabled = attrVal;
        break;
      case "selected":
        node.selected = attrVal;
        break;
      case "checked":
        node.checked = attrVal;
        break;
      default:
        node.setAttribute(attrName, attrVal);
    }
  }
};
