function Demo(props) {
  this.todos = [
    "Clean the dishes",
    "Cook the dinner",
    "Code some coding",
    "Comment on stuff"
  ];

  this.title = props.title;
};

Demo.prototype.render = function() {
  return Inferno.getTemplateFromFile("demo.html");
};

Inferno.registerTag("inferno-demo", Demo);
