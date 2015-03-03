
function getTagData(tagText) {
  var parts = [];
  var char = '';
  var lastChar = '';
  var i = 0;
  var s = 0;
  var currentString = '';
  var literalString = '';
  var inQuotes = false;
  var attrs = [];
  var attrParts = [];
  var attr = {};
  var inLiteral = false;
  for(i = 0; i < tagText.length; i++) {
    char = tagText[i];
    if(char === " " && inQuotes === false) {
      parts.push(currentString);
      currentString = '';
    } else if(char === "'") {
      inQuotes = !inQuotes;
    } else if(char === '"') {
        inQuotes = !inQuotes;
    } else {
      currentString += char;
    }
  }
  if(currentString !== "") {
    parts.push(currentString);
  }
  currentString = '';
  for(i = 1; i < parts.length; i++) {
    //find the frist "=", exclude things inside literal tags
    attrParts = [];
    for(s = 0; s < parts[i].length; s++) {
      char = parts[i][s];
      if(char === "=" && inLiteral === false) {
        attrParts.push('"' + currentString + '"');
        currentString = '';
      } else if(char === "{" && lastChar === "$" && inLiteral === false) {
        inLiteral = true;
      } else if(char === "}" && inLiteral === true) {
        inLiteral = false;
        currentString = currentString.substring(0, currentString.length - 1);
        currentString += '" + ' + literalString + ' + "';
        literalString = '';
      } else if(inLiteral === true) {
        literalString += char;
      } else {
        currentString += char;
        lastChar = char;
      }
    }
    if(currentString != "") {
      attrParts.push('"' + currentString + '"');
    }
    if(attrParts.length > 1) {
      attr = {};
      attr[attrParts[0]] = attrParts[1];
      attrs.push(attr);
    }
  }
  return {
    tag: parts[0],
    attrs: attrs
  }
};

function buildChildren(root, tagParams, childrenProp) {
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

function buildFunction(root, functionText, isLast) {
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

function compile(text) {
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
  var tagData = [];

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
          tagData = getTagData(tagContent);
          tagName = tagData.tag;
        }
        //now we create out vElement
        if(tagName === "for" || tagName === "if") {
          vElement = {
            tag: tagName,
            expression: literalText,
            children: []
          };
        } else {
          vElement = {
            tag: tagName,
            attrs: tagName.attrs || [],
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
      tagContent += '"${' + literalText.trim() + '}"';
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
  //build our functionText
  buildFunction(root, functionText, false);
  //convert to a string
  functionText = functionText.join('');
  //make the funcitonText into a function
  return new Function(functionText);
};

var Compiler = {
  compile: function(text) {
    //strip new lines
    text = text.replace(/(\r\n|\n|\r)/gm,"");
    return compile(text);
  },
};

module.exports = Compiler;
