/**
 * @module Inferno-Server
 */ /** TypeDoc Comment */

import { isString } from "inferno-shared";

const rxUnescaped = /["'&<>]/;
export function escapeText(text: any): string {
  if (!isString(text)) {
    text = text + "";
  }

  /* Much faster when there is no unescaped characters */
  if (!rxUnescaped.test(text)) {
    return text;
  }

  let result = "";
  let escape = "";
  let start = 0;
  let i;
  for (i = 0; i < text.length; i++) {
    switch (text.charCodeAt(i)) {
      case 34: // "
        escape = "&quot;";
        break;
      case 39: // '
        escape = "&#039;";
        break;
      case 38: // &
        escape = "&amp;";
        break;
      case 60: // <
        escape = "&lt;";
        break;
      case 62: // >
        escape = "&gt;";
        break;
      default:
        continue;
    }
    if (i > start) {
      result += text.slice(start, i);
    }
    result += escape;
    start = i + 1;
  }
  return result + text.slice(start, i);
}

const uppercasePattern = /[A-Z]/g;

const CssPropCache = {};

export function getCssPropertyName(str): string {
  if (CssPropCache.hasOwnProperty(str)) {
    return CssPropCache[str];
  }
  return (CssPropCache[str] =
    str.replace(uppercasePattern, "-$&").toLowerCase() + ":");
}

export const voidElements = new Set([
  "area",
  "base",
  "br",
  "col",
  "command",
  "embed",
  "hr",
  "img",
  "input",
  "keygen",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr"
]);
