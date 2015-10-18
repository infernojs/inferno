import escapeTextContentForBrowser from './escapeTextContentForBrowser';

/**
 * Escapes attribute value to prevent scripting attacks.
 *
 * @param {*} value Value to escape.
 * @return {string} An escaped string.
 */
export default (value) => '"' + escapeTextContentForBrowser(value) + '"';