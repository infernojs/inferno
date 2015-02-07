//EngineJS is a for true light-weight, ultra-fast isomorphic "React-like" framework

var Engine = require('./EngineJS/Engine.js');

class MorphBenchmark extends Engine.Component {

  constructor() {

    this.count = 0;
    this.boxElems = [];

    super();
  }

  animateBoxes() {
    this.count++

    var count = this.count % 100;

    var style = "top:" + (Math.sin(this.count / 10) * 10) + "px;" +
          "left:" + (Math.cos(this.count / 10) * 10) + "px;" +
          "background:rgb(0,0," + (this.count % 255) +")";

    for(var i = 0; i < this.boxElems.length; i++) {
      this.boxElems[i].setAttribute("style", style);
      //faster than innerHTML or textContent
      this.boxElems[i].firstChild.nodeValue = count;
    }
  }

  storeBoxElem(element) {
    this.boxElems.push(element);
  }

  initTemplate(templateHelper) {
    //$ = templateHelper shorthand
    var $ = templateHelper;

    return [
      ["div#grid",
        //same as for(i = 0; i < N; i = i + 1)
        $.for(increment => [0, N, 1], i => [
          ['div.box-view',
            //set it to 0 to begin with, don't bind to a variable
            ['div.box', {id: "box-" + i, onDomCreated: this.storeBoxElem}, "0"]
          ]
        ])
      ],
    ];
  }
};

window.MorphBenchmark = MorphBenchmark;
