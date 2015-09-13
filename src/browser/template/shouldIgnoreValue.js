function shouldIgnoreValue(name, value) {
    return value == null ||
        (hasBooleanValue[name] && !value) ||
        (hasNumericValue[name] && isNaN(value)) ||
        (hasPositiveNumericValue[name] && (value < 1)) ||
        (hasOverloadedBooleanValue[name] && value === false);
}
export default shouldIgnoreValue;