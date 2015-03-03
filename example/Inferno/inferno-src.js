var CustomTag = require('./CustomTag.js');

var components = {};

function registerTag(tag, data) {
  if(components[tag] == null) {
    components[tag] = new CustomTag(tag, data);
  } else {
    throw Error(
      "Inferno component has already been registered to the tag \"" + tag + "\""
    );
  }
};

function loadTemplate(path) {
  return new Promise(function(approve, reject) {

    function reqListener () {
      approve(this.responseText);
    }

    var oReq = new XMLHttpRequest();
    oReq.onload = reqListener;
    oReq.open("get", path, true);
    oReq.send();
  });
}

window.Inferno = {
  registerTag: registerTag,
  loadTemplate: loadTemplate
};
