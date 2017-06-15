const optimizeJs = require("optimize-js");

module.exports = {
  name: "optimizeJs",

  transformBundle: function(code) {
    return optimizeJs(code, {
      sourceMap: false,
      sourceType: "module"
    });
  }
};
