import DOMProperties     from './DOMProperties';
import getPropertySetter from './getPropertySetter';

export default (node, attributeName, value)  => {
 getPropertySetter(DOMProperties(attributeName))(node, attributeName, value);
};