var CustomTag = require('./CustomTag.js');
var Template = require('./Template.js');

var components = {};
var templates = {};

function registerTag(tag, tagClass) {
  if(components[tag] == null) {
    components[tag] = new CustomTag(tag, tagClass);
  } else {
    throw Error(
      "Inferno component has already been registered to the tag \"" + tag + "\""
    );
  }
};

function loadFile(path) {
  return new Promise(function(approve, reject) {

    function reqListener () {
      approve(this.responseText);
    }

    var oReq = new XMLHttpRequest();
    oReq.onload = reqListener;
    oReq.open("get", path, true);
    oReq.send();
  });
};

function getTemplateFromFile(path) {
  if(templates[path] != null) {
    return templates[path];
  } else {
    templates[path] = new Template(path);
    return templates[path];
  }
};

window.Inferno = {
  registerTag: registerTag,
  getTemplateFromFile: getTemplateFromFile,
  loadFile: loadFile
};
