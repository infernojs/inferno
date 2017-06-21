/**
 * @module Inferno-Server
 */ /** TypeDoc Comment */

import { internal_isUnitlessNumber } from "inferno";
import { isNumber, isString, isTrue } from "inferno-shared";
import { escapeText, getCssPropertyName } from "./utils";

export function renderStylesToString(styles: string | object): string {
  if (isString(styles)) {
    return styles;
  } else {
    let renderedString = "";
    for (const styleName in styles) {
      const value = styles[styleName];

      if (isString(value)) {
        renderedString += `${getCssPropertyName(styleName)}${value};`;
      } else if (isNumber(value)) {
        renderedString += `${getCssPropertyName(
          styleName
        )}${value}${internal_isUnitlessNumber.has(styleName) ? "" : "px"};`;
      }
    }
    return renderedString;
  }
}

export function renderAttributes(props): string[] {
  const outputAttrs: string[] = [];
  const propsKeys = (props && Object.keys(props)) || [];

  for (let i = 0, len = propsKeys.length; i < len; i++) {
    const prop = propsKeys[i];

    if (
      prop !== "children" &&
      prop !== "dangerouslySetInnerHTML" &&
      prop !== "style"
    ) {
      const value = props[prop];

      if (isString(value)) {
        outputAttrs.push(prop + '="' + escapeText(value) + '"');
      } else if (isNumber(value)) {
        outputAttrs.push(prop + '="' + value + '"');
      } else if (isTrue(value)) {
        outputAttrs.push(prop);
      }
    }
  }

  return outputAttrs;
}
