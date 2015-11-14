export default (eventNameSuffix) => {

    const eventName = 'on' + eventNameSuffix;

    if (eventName in document) {
        return true;
    }

    const element = document.createElement('div');

    element.setAttribute(eventName, 'return;');

    if (typeof element[eventName] === 'function') {
        return true;
    }

    return false;
};