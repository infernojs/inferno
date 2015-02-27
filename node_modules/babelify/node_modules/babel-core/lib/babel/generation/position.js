"use strict";

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Position = (function () {
  function Position() {
    _classCallCheck(this, Position);

    this.line = 1;
    this.column = 0;
  }

  Position.prototype.push = function push(str) {
    for (var i = 0; i < str.length; i++) {
      if (str[i] === "\n") {
        this.line++;
        this.column = 0;
      } else {
        this.column++;
      }
    }
  };

  Position.prototype.unshift = function unshift(str) {
    for (var i = 0; i < str.length; i++) {
      if (str[i] === "\n") {
        this.line--;
      } else {
        this.column--;
      }
    }
  };

  return Position;
})();

module.exports = Position;