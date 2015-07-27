

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

beginRender() {
  var newVal = "asfdsafsa";
  var people = ["bob", "dom", "paul"];

  return template() {

    var node1 = null;
    var node2 = null;

    return {
      nodes: [
        node1 = {tag: "div", dom: bla, class: "foo", children: [node2, node3, node4]},
        node2 = {tag: "span", children: "test1"},
        node3 = {tag: "span", children: "test2"},
        node4 = {tag: "span", children: "test3"}
      ],
      update:[
        updateNode(node1, function(node) {
          updateClass(node, newVal)
        }),
        updateChildren(node1, map(people, function(node, person) {
          updateChildren(node, person);
        }))
      ]
    };
  }
}

beginRender();
