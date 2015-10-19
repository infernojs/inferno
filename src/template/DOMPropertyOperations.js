import DOMProperties from './DOMProperties';
import getPropertySetter from './getPropertySetter';

/**
 * Set HTML attributes / properties on a node
 *
 * @param {!Element} node
 * @param {string} name
 * @param {*} value
 */
export default (node, name, value) => {
    getPropertySetter(DOMProperties(name))(node, name, value);
};