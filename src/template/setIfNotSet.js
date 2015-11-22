function setIfNotSet(element, propName, value) {

    if ('' + element[propName] !== '' + value) {
        element[propName] = value;
    }
}

export default setIfNotSet;