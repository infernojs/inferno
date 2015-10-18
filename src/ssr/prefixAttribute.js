/**
 * Memoizes the return value of a function that accepts one string argument.
 *
 * @param {function} callback
 * @return {function}
 */
let memoizeString = (callback) => {
    let cache = {};
    return (string) => {
        if (cache[string]) {
            return cache[string];
        } else {
            return cache[string] = callback.call(this, string);
        }
    };
};

export default memoizeString((name) => name + '="');