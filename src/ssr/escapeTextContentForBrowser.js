let ESCAPE_LOOKUP = {
  '&': '&amp;',
  '>': '&gt;',
  '<': '&lt;'
};

let ESCAPE_REGEX = /[&><]/g;

let escaper = (match) => ESCAPE_LOOKUP[match];

/**
 * Escapes text to prevent scripting attacks.
 *
 * @param {*} text content value to escape.
 * @return {string} An escaped string.
 */
export default (text) => ('' + text).replace(ESCAPE_REGEX, escaper);