import escapeHtml from "./escapeHtml";

function memoizeString(callback) {
    let cache = {};
    return function(string) {
        if (cache[string]) {
            return cache[string];
        } else {
            return cache[string] = callback.call(this, string);
        }
    };
}

/**
 * Cache SSR markup strings for re-use
 * @param { string} name
 * @return { string}
 */
export default memoizeString((name) => {
    return escapeHtml(name) + "=\"";
});