//EngineJS is a for true light-weight, ultra-fast isomorphic "React-like" framework

var Inferno = require('./InfernoJS/Inferno.js');

class InfernoBenchmark2 extends Inferno.Component {

  //properties starting with _underscore are not observed by default
  constructor() {
    this._count = 0;
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

  initTemplate($) {
    return [
      ["div#grid",
        //same as for(i = 0; i < N; i = i + 1)
        $.for(increment => [0, N, 1], i => [
          ['div.box-view',
            //set it to 0 to begin with, don't bind to a variable
            ['div.box', {id: $.text(none => "box-" + i), style: this.getStyle}, $.text(none => this._count % 100)]
          ]
        ])
      ]
    ];
  }
};

window.InfernoBenchmark2 = InfernoBenchmark2;
