import isEventSupported from './isEventSupported';

export default (element, type, callback, useCapture) => {

    if (!element) {
        return null;
    }

    // Support: Opera 10, Chrome, Safari, Internet Explorer 9+
    if (type === "wheel" && (!isEventSupported('wheel'))) {
        type = 'mousewheel';
    }
    element.addEventListener(type, callback, useCapture);
};