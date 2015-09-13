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

export default memoizeString;