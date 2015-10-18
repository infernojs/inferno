import propertyIsTrue from './propertyIsTrue';

export default (propInfo, value) => {
    let isTrue = propertyIsTrue(propInfo, value);

    if (propInfo.hasBooleanValue) {
        return isTrue ? true : false;
    } else if (propInfo.hasOverloadedBooleanValue) {
        return isTrue ? true : value;
    } else if (propInfo.hasNumericValue || propInfo.hasPositiveNumericValue) {
        return Number(value);
    } else {
        return value;
    }
};