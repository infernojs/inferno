import escapeTextContentForBrowser from './escapeTextContentForBrowser';

let ESCAPE_LOOKUP = {
 '&': '&amp;',
  '>': '&gt;',
  '<': '&lt;',
  '"': '&quot;'
};

let ESCAPE_REGEX = /[&><"]/g;

let escaper = (match) => ESCAPE_LOOKUP[match];

/**
 * Escapes attribute value to prevent scripting attacks.
 *
 * @param {*} value Attribute value to escape.
 * @return {string} An escaped string.
 */
export default (value) => '"' + ('' + value).replace(ESCAPE_REGEX, escaper) + '"';