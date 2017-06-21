/**
 * @module Inferno-Server
 */ /** TypeDoc Comment */

export function escapeText(text: string): string {
  let result = text;
  let escape: string = "";
  let start = 0;
  let i;
  for (i = 0; i < text.length; i++) {
    switch (text.charCodeAt(i)) {
      case 34: // "
        escape = "&quot;";
        break;
      case 39: // \
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
      if (start) {
        result += text.slice(start, i);
      } else {
        result = text.slice(start, i);
      }
    }
    result += escape;
    start = i + 1;
  }
  if (start && i !== start) {
    return result + text.slice(start, i);
  }
  return result;
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
