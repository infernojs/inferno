import DOMProperties from './DOMProperties';
import setAttributes from './setAttributes';
import setProperty from './setProperty';

/**
 * Set HTML attributes / properties on a node
 * @param {!Element} node
 * @param {string} name
 * @param {*} value
 */
export default (node, name, value) => {

  // Anything we don't set as an attribute is treated as a property
  (DOMProperties(name).mustUseAttribute ? setAttributes : setProperty)(node, name, value);
};