function isInputProperty(tag, propName) {
    switch (tag) {
        case 'INPUT':
            return propName === 'value' || propName === 'checked';
        case 'TEXTAREA':
            return propName === 'value';
        case 'SELECT':
            return propName === 'value' || propName === 'selectedIndex';
        case 'OPTION':
            return propName === 'selected';
    }
}

function setIfNotSet(element, propName, value) {

    if (isInputProperty(element.tagName, propName)) {

        if ('' + element[propName] !== '' + value) {
            element[propName] = value;
        }

    } else {
        element[propName] = value;
    }
}

export default setIfNotSet;

