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

class Demo extends Inferno.Component {

  //properties starting with _underscore are not observed by default
  constructor() {
    this._count = 0;
    this.numberOfBoxes = 50;
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
      ['div#grid'],
        this.numberOfBoxes.times(i => [
          ['div', {className: "box", id: `box-${i}`, style: this.getStyle()}],
            (this._count % 100),
          ['/div']
        ]),
      ['/div']
    ];
  }


};

window.Demo = Demo;
