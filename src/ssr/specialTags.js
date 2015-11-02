export default (str) => {
    switch (str.length) {
        case 6:
            return str === 'option' || str === 'select';
        case 8:
            return str === 'optgroup';
    }

    return false;
};