

function updateClass(node, newClass) {
  if(node.class !== newClass) {
    dom.className = newClass;
  }
}

function updateChildren(node, children) {
  if(node.children instanceof Array) {
    for(var i = 0; i < node.children.length; i++) {
      children.(node.children[i], children[0][i]);
    }
  } else {
    if(node.children !== children) {
      dom.setContent = children;
    }
  }
}

function map(array, constructor) {
  return {type: map, array, array, constructor: constructor};
}

component() {
  return render(rootNode, init) {

    var newVal = "asfdsafsa";
    var people = [{id: 0, name: "bob"}, {id: 1, name: "dom"], {id:0, name: "paul"}];

    var node1 = null;
    var node2 = null;

    if(init === false) {
      rootNode.renderChild("div", function(node) {
        node.setClass(newVal);

        node.renderChildren()
      })
    }
  }
}

component();
