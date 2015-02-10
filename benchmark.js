//EngineJS is a for true light-weight, ultra-fast isomorphic "React-like" framework

var Inferno = require('./InfernoJS/Inferno.js');

class InfernoBenchmark extends Inferno.Component {

  //properties starting with _underscore are not observed by default
  constructor() {

    this._count = 0;
    this._boxElems = [];

    super();
  }

  animateBoxes() {
    this._count++

    var count = this._count % 100;

    //animate the style
    var newStyle = {
      top: (Math.sin(this._count / 10) * 10) + "px",
      left: (Math.cos(this._count / 10) * 10) + "px",
      background: "rgb(0,0," + (this._count % 255) +")"
    };

    //loop through all our virtual objects and apply the updates
    for(var i = 0; i < this._boxElems.length; i++) {
      for(var s in newStyle) {
        this._boxElems[i].style[s] = newStyle[s];
      }
      this._boxElems[i].firstChild.nodeValue = count;
    }
  }

  addBox(element) {
    this._boxElems.push(element);
  }

  initTemplate($) {
    return ['div.box'];
  }
};

window.InfernoBenchmark = InfernoBenchmark;
