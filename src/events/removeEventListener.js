export default(element, type, callback) => {
    element.removeEventListener(type, callback);
};