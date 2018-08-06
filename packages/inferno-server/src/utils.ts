const rxUnescaped = new RegExp(/["'&<>]/);

export function escapeText(text: string): string {
  /* Much faster when there is no unescaped characters */
  if (!rxUnescaped.test(text)) {
    return text;
  }

  let result = '';
  let escape = '';
  let start = 0;
  let i;
  for (i = 0; i < text.length; i++) {
    switch (text.charCodeAt(i)) {
      case 34: // "
        escape = '&quot;';
        break;
      case 39: // '
        escape = '&#039;';
        break;
      case 38: // &
        escape = '&amp;';
        break;
      case 60: // <
        escape = '&lt;';
        break;
      case 62: // >
        escape = '&gt;';
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
  if (CssPropCache[str] !== void 0) {
    return CssPropCache[str];
  }
  return (CssPropCache[str] = str.replace(uppercasePattern, '-$&').toLowerCase() + ':');
}

const ATTRIBUTE_NAME_START_CHAR =
  ':A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD';

const ATTRIBUTE_NAME_CHAR = ATTRIBUTE_NAME_START_CHAR + '\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040';

export const VALID_ATTRIBUTE_NAME_REGEX = new RegExp('^[' + ATTRIBUTE_NAME_START_CHAR + '][' + ATTRIBUTE_NAME_CHAR + ']*$');

const illegalAttributeNameCache = {};
const validatedAttributeNameCache = {};

export function isAttributeNameSafe(attributeName: string): boolean {
  if (validatedAttributeNameCache[attributeName] !== void 0) {
    return true;
  }
  if (illegalAttributeNameCache[attributeName] !== void 0) {
    return false;
  }
  if (VALID_ATTRIBUTE_NAME_REGEX.test(attributeName)) {
    validatedAttributeNameCache[attributeName] = true;
    return true;
  }
  illegalAttributeNameCache[attributeName] = true;
  if (process.env.NODE_ENV !== 'production') {
    // tslint:disable-next-line:no-console
    console.log('Invalid attribute name: ' + attributeName);
  }
  return false;
}

export const voidElements = new Set([
  'area',
  'base',
  'br',
  'col',
  'command',
  'embed',
  'hr',
  'img',
  'input',
  'keygen',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr'
]);
