//EngineJS is a for true light-weight, ultra-fast isomorphic "React-like" framework

var Inferno = require('./InfernoJS/Inferno.js');

if (!Number.prototype.times) {
  Number.prototype.times = function (callback) {
    var results = [];
    for(var i = 0; i < this; i++) {
      results.push(callback(i))
    }
    return results;
  };
}

class InfernoBenchmark3 extends Inferno.Component {

  //properties starting with _underscore are not observed by default
  constructor() {
    this._count = 0;
    this.numberOfBoxes = N;
    super();
  }

  animateBoxes() {
    this._count++
    this.forceUpdate();
  }

  getStyle() {
    return {
      top: (Math.sin(this._count / 10) * 10) + "px",
      left: (Math.cos(this._count / 10) * 10) + "px",
      background: "rgb(0,0," + (this._count % 255) +")"
    };
  }

  render() {
    return [
      ['div'],
        this.numberOfBoxes.times(i => [
          ['div.box-view'],
            ['div.box', {className: "box", id: `box-${i}`, style: this.getStyle()}],
              (this._count % 100),
            ['/div'],
          ['/div']
        ]),
      ['/div']
    ];
  }


};

window.InfernoBenchmark3 = InfernoBenchmark3;
