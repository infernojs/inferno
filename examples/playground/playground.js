var root = Inferno.createTemplate(function () {
  return {
    tag: "div",
    attrs: {
      style: {
        width: "200px",
        height: "200px",
        backgroundColor: "red",

        border: "5px solid black",
        borderRadius: "5px"
      }
    }
  };
});

InfernoDOM.render(root(), document.getElementById('app'));
