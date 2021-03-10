(() => {
  var __commonJS = (callback, module) => () => {
    if (!module) {
      module = {exports: {}};
      callback(module.exports, module);
    }
    return module.exports;
  };

  // dist/index.cjs.min.js
  var require_index_cjs_min = __commonJS((exports) => {
    "use strict";
    Object.defineProperty(exports, "__esModule", {value: true});
    var r = "a runtime error occured! Use Inferno in development environment to find the error.";
    var n = Array.isArray;
    function e(r2) {
      var n2 = typeof r2;
      return n2 === "string" || n2 === "number";
    }
    function o(r2) {
      return r2 === void 0 || r2 === null;
    }
    function t(r2) {
      return r2 === null || r2 === false || r2 === true || r2 === void 0;
    }
    function i(r2) {
      return typeof r2 === "function";
    }
    function u(r2) {
      return typeof r2 === "string";
    }
    function s(r2) {
      return typeof r2 === "number";
    }
    function f(r2) {
      return r2 === null;
    }
    function p(r2) {
      return r2 === void 0;
    }
    function c(n2) {
      throw n2 || (n2 = r), new Error("Inferno Error: " + n2);
    }
    function l(r2) {
      console.error(r2);
    }
    function x(r2, n2) {
      var e2 = {};
      if (r2)
        for (var o2 in r2)
          e2[o2] = r2[o2];
      if (n2)
        for (var t2 in n2)
          e2[t2] = n2[t2];
      return e2;
    }
    exports.ERROR_MSG = r, exports.combineFrom = x, exports.isArray = n, exports.isFunction = i, exports.isInvalid = t, exports.isNull = f, exports.isNullOrUndef = o, exports.isNumber = s, exports.isString = u, exports.isStringOrNumber = e, exports.isUndefined = p, exports.throwError = c, exports.warning = l;
  });

  // dist/index.cjs.js
  var require_index_cjs = __commonJS((exports) => {
    "use strict";
    Object.defineProperty(exports, "__esModule", {value: true});
    var ERROR_MSG = "a runtime error occured! Use Inferno in development environment to find the error.";
    var isArray = Array.isArray;
    function isStringOrNumber(o) {
      var type = typeof o;
      return type === "string" || type === "number";
    }
    function isNullOrUndef(o) {
      return o === void 0 || o === null;
    }
    function isInvalid(o) {
      return o === null || o === false || o === true || o === void 0;
    }
    function isFunction(o) {
      return typeof o === "function";
    }
    function isString(o) {
      return typeof o === "string";
    }
    function isNumber(o) {
      return typeof o === "number";
    }
    function isNull(o) {
      return o === null;
    }
    function isUndefined(o) {
      return o === void 0;
    }
    function throwError(message) {
      if (!message) {
        message = ERROR_MSG;
      }
      throw new Error("Inferno Error: " + message);
    }
    function warning(message) {
      console.error(message);
    }
    function combineFrom(first, second) {
      var out = {};
      if (first) {
        for (var key in first) {
          out[key] = first[key];
        }
      }
      if (second) {
        for (var key$1 in second) {
          out[key$1] = second[key$1];
        }
      }
      return out;
    }
    exports.ERROR_MSG = ERROR_MSG;
    exports.combineFrom = combineFrom;
    exports.isArray = isArray;
    exports.isFunction = isFunction;
    exports.isInvalid = isInvalid;
    exports.isNull = isNull;
    exports.isNullOrUndef = isNullOrUndef;
    exports.isNumber = isNumber;
    exports.isString = isString;
    exports.isStringOrNumber = isStringOrNumber;
    exports.isUndefined = isUndefined;
    exports.throwError = throwError;
    exports.warning = warning;
  });

  // index.js
  var require_inferno_shared = __commonJS((exports, module) => {
    "use strict";
    if (production === "production") {
      module.exports = require_index_cjs_min();
    } else {
      module.exports = require_index_cjs();
    }
  });
  require_inferno_shared();
})();
