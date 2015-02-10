//EngineJS is a for true light-weight, ultra-fast isomorphic "React-like" framework

var Inferno = require('./InfernoJS/Inferno.js');

class Box extends Inferno.Component {

  constructor() {
    this.count = 0;
    this.i = 0;
    super();
  }

  getStyle() {
    return {
      top: (Math.sin(this.count / 10) * 10) + "px",
      left: (Math.cos(this.count / 10) * 10) + "px",
      background: "rgb(0,0," + (this.count % 255) +")"
    };
  }

  initTemplate($) {
    return ['div.box', {id: $.text(none => "box-" + this.i), style: this.getStyle}, $.text(none => this.count % 100)];
  }
}

class InfernoBenchmark2 extends Inferno.Component {

  //properties starting with _underscore are not observed by default
  constructor() {
    this.count = 0;
    this.boxes = [];

    for(var i = 0; i < N; i++) {
      this.boxes.push(new Box());
    }

    super();
  }

  dependencies() {
    return [
      //update the set of boxes only if their length changes
      this.boxes.length
    ]
  }

  animateBoxes() {
    this.count++
    this.forceUpdate();
  }

  initTemplate($) {
    return [
      ["div#grid",
        $.for(each => this.boxes, (box, i) => [
          $.render('div.box-view', box, props => ({ count: this.count, i: i }))
        ])
      ],
    ];
  }
};

window.InfernoBenchmark2 = InfernoBenchmark2;
