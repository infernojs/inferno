var Transform = require('stream').Transform;
var inherits = require('inherits');

module.exports = CipherBase;
inherits(CipherBase, Transform);
function CipherBase() {
  Transform.call(this);
}
CipherBase.prototype.update = function (data, inputEnc, outputEnc) {
  if (typeof data === 'string') {
    data = new Buffer(data, inputEnc);
  }
  var outData = this._update(data);
  if (outputEnc) {
    outData = outData.toString(outputEnc);
  }
  return outData;
};
CipherBase.prototype._transform = function (data, _, next) {
  this.push(this._update(data));
  next();
};
CipherBase.prototype._flush = function (next) {
  try {
    this.push(this._final());
  } catch(e) {
    return next(e);
  }
  next();
};
CipherBase.prototype.final = function (outputEnc) {
  var outData = this._final() || new Buffer('');
  if (outputEnc) {
    outData = outData.toString(outputEnc);
  }
  return outData;
};