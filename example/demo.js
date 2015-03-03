function Demo(props) {
  this.todos = [
    "Clean the dishes",
    "Cook the dinner",
    "Code some coding",
    "Comment on stuff"
  ];

  this.title = props.title;
};

//This will get called by Inferno when a render has finished
//it's useful to manipualte the dom (for animations or third party scripts)
Demo.prototype.afterRender = function(dom) {

};

Inferno.registerTag("inferno-demo", {
  class: Demo,
  template: "demo.html"
});
