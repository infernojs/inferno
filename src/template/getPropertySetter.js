import setAttributes from './setAttributes';
import setProperty from './setProperty';

// Anything we don't set as an attribute is treated as a property
export default (propInfo) => propInfo.mustUseAttribute ? setAttributes : setProperty;