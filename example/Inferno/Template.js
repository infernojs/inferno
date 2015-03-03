var cito = require("./cito.js");

function Template(templatePath) {
  this._compiled = null;
  this._root = null;
  this._init = false;
  Inferno.loadTemplate("/EngineJS/example/demo.html").then(function(template) {
    this._parse(template);
  }.bind(this))
};

Template.prototype._parse = function(text) {
  //strip new lines
  text = text.replace(/(\r\n|\n|\r|\t)/gm,"");
  //get the content betweent the template tags
  text = /<template>(.*)<\/template>/gm.exec(text)[1];
  //now we have our markup that we want to make into vdom code
  this.compile(text);
};

Template.prototype.mount = function(root) {
  this._root = root;
};

Template.prototype.render = function() {
  if(this._root != null && this._compiled != null && this._init === false) {
    this._init = true;
    var tempRoot = {tag: 'div', children: this._compiled.call(this._root.tagClass)};
    cito.vdom.append(this._root, tempRoot);
  } else if(this._init === false) {
    requestAnimationFrame(this.render);
  }
};

Template.prototype.compile = function(text) {
  var char = '';
  var lastChar = '';
  var i = 0, s = 0;
  var root = [];
  var insideTag = false;
  var tagContent = '';
  var tagName = '';
  var vElement = null;
  var childText = '';
  var literalText = '';
  var parent = root;
  var objectLiteral = false;
  var attrs = [];
  var attrsTemp = [];
  var attrsTempPart = [];
  var attrsTempObj = {};

  for(i = 0; i < text.length; i++) {
    char = text[i];

    if(char === "<" && objectLiteral === false) {
      insideTag = true;
    } else if(char === ">" && insideTag === true && objectLiteral === false) {
      //check if first character is a close tag
      if(tagContent[0] === "/") {
        if(childText.trim() !== "") {
          parent.children = childText;
        }
        parent = parent.parent;
      } else {
        //check if there any spaces in the tagContent, if not, we have our tagName
        if(tagContent.indexOf(" ") === -1) {
          tagName = tagContent;
        } else {
          attrsTemp = tagContent.split(" ");
          tagName = attrsTemp[0];
          attrsTemp.shift();
        }
        //now we create out vElement
        if(tagName === "for" || tagName === "if") {
          vElement = {
            tag: tagName,
            expression: literalText,
            children: []
          };
        } else {
          //loop through attributes and turn them into objects
          for(s = 0; s < attrsTemp.length; s++) {
            attrsTempPart = attrsTemp[s].split("=");
            attrsTempObj = {};
            attrsTempObj[attrsTempPart[0]] = attrsTempPart[1].substring(1, attrsTempPart[1].length - 1);
            attrs.push(attrsTempObj)
          }          
          vElement = {
            tag: tagName,
            attrs: attrs,
            children: []
          };
        }
        if(Array.isArray(parent)) {
          parent.push(vElement);
        } else {
          parent.children.push(vElement);
        }
        vElement.parent = parent;
        parent = vElement;
      }
      insideTag = false;
      tagContent = '';
      childText = '';
    } else if (char === "{" && lastChar === "$" && objectLiteral === false ) {
      objectLiteral = true;
      literalText = '';
    } else if (char === "}" && objectLiteral === true && insideTag === false) {
      objectLiteral = false;
      childText = childText.substring(0, childText.length - 1);
      childText += "' + " + literalText + " + '";
    } else if (char === "}" && objectLiteral === true && insideTag === true) {
      objectLiteral = false;
      tagContent = tagContent.substring(0, tagContent.length - 1);
      //a property
      tagContent += "\"" + literalText.trim() + "\"";
    } else if (insideTag === true && objectLiteral === false) {
      tagContent += char;
      lastChar = char;
    } else if (objectLiteral === true) {
      literalText += char;
    } else {
      if(lastChar === " " && char === " ") {
      } else {
        childText += char;
      }
      lastChar = char;
    }
  }
  //then convert the root data to a new Function()
  var functionText = [];
  //then return the virtual dom object
  functionText.push("return ");

  var buildChildren = function(root, tagParams, childrenProp) {
    var childrenText = [];
    var i = 0;
    if(root.children != null && Array.isArray(root.children)) {
      childrenText.push("[");
      for(i = 0; i < root.children.length; i++) {
        buildFunction(root.children[i], childrenText, i === root.children.length - 1)
      }
      childrenText.push("]");
      tagParams.push((childrenProp ? "children: " : "") + childrenText.join(""));
    } else if(root.children != null) {
      tagParams.push((childrenProp ? "children: " : "") + "'" + root.children + "'");
    }
  };

  var buildFunction = function(root, functionText, isLast) {
    var i = 0;
    var tagParams = [];
    var literalParts = [];
    if(Array.isArray(root)) {
      functionText.push("[");
      for(i = 0; i < root.length; i++) {
        buildFunction(root[i], functionText, i === root.length - 1);
      }
      functionText.push("]");
    } else {
      if(root.tag === "if") {
        functionText.push("(function() {");
        functionText.push("if(");
        functionText.push(root.expression);
        functionText.push("){");
        buildChildren(root, tagParams, false);
        functionText.push("return " + tagParams.join(','));
        functionText.push("}")
        functionText.push("return [];");
        functionText.push("}.bind(this))()");
      } else if(root.tag === "for") {
        //strip uneeded space and double spaces and then split
        literalParts = root.expression
                          .trim()
                          .replace(", ", ",")
                          .replace(" ,", ",")
                          .replace("(", "")
                          .replace(")", "")
                          .replace(/ +(?= )/g,'')
                          .split(" ");
        functionText.push("(function() {");
        functionText.push("var result = [];");
        functionText.push("var " + literalParts[0].split(",")[0] + " = null;");
        functionText.push("var " + literalParts[0].split(",")[1] + " = 0;");
        functionText.push("for(var i = 0; i < " + literalParts[2] + ".length; i++){");
        functionText.push(literalParts[0].split(",")[0] + " = " + literalParts[2] + "[i];");
        functionText.push(literalParts[0].split(",")[1] + " = i;");
        buildChildren(root, tagParams, false);
        functionText.push("result.push(" + tagParams.join(',') + ")");
        functionText.push("}");
        functionText.push("return result;");
        functionText.push("}.bind(this))()");
      } else {
        functionText.push("{");
        tagParams.push("tag: '" + root.tag + "'");
        buildChildren(root, tagParams, true);
        functionText.push(tagParams.join(','));
        functionText.push("}");
      }
      if(isLast === false) {
        functionText.push(",");
      }
    }
  };
  //build our functionText
  buildFunction(root, functionText, false);
  //convert to a string
  functionText = functionText.join('');
  //make the funcitonText into a function
  this._compiled = new Function(functionText);
  //then return the new function
  this.render();
};

module.exports = Template;
