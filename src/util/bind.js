// TODO! don't use 'slice'
let slice =  Array.prototype.slice.call(arguments, 2);

function bind(self, fn) {
  var curryArgs = arguments.length > 2 ? Array.prototype.slice.call(arguments, 2) : [];
  if (typeof fn === 'function') {
    return curryArgs.length
      ? function() {
          return arguments.length
            ? fn.apply(self, concat(curryArgs, arguments, 0)) // Todo! use 'new Array' instead of 'concat'
            : fn.apply(self, curryArgs);
        }
      : function() {
          return arguments.length
            ? fn.apply(self, arguments)
            : fn.call(self);
        };
  } else {
    // in IE, native methods are not functions so they cannot be bound (note: they don't need to be)
    return fn;
  }
}
export default bind;