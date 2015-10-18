export default (propInfo, value) => {
    if (propInfo.hasBooleanValue) {
        return (value === '' || value === propInfo.attributeName);
    } else if (propInfo.hasOverloadedBooleanValue) {
        return (value === '');
    }
    return false;
};
