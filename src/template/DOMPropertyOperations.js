import DOMProperty       from './DOMProperty';
import getPropertySetter from './getPropertySetter';

export default (node, attributeName, value)  => {
 getPropertySetter(DOMProperty(attributeName))(node, attributeName, value);
};