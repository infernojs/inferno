var vt = (function() {

  function vt(template) {
    var props = [];
    var placeholders = [];
    var fullHtml = '';
    var i = 0;
    var vDom = [];

    for(i = 1; i < arguments.length; i++) {
      props.push(arguments[i])
      placeholders.push("$" + i);
    }
    for(i = 0; i < template.length; i++) {
      if(i === template.length - 1) {
        fullHtml += template[i];
      } else {
        fullHtml += template[i] + placeholders[i];
      }
    }
    template.join(placeholders);
    vDom = getVdom(fullHtml, placeholders, props);
    return vDom;
  }

  vt.if = function(expression, truthy) {
    if(expression) {
      return {
        else: function() {
          return truthy;
        }
      };
    } else {
      return {
        else: function(falsey) {
          return falsey;
        }
      }
    }
  }

  function getVdom(html, placeholders, props) {
    var char = '';
    var lastChar = '';
    var i = 0;
    var s = 0;
    var root = [];
    var insideTag = false;
    var tagContent = '';
    var tagName = '';
    var vElement = null;
    var childText = '';
    var parent = root;
    var tagData = [];

    for(i = 0; i < html.length; i++) {
      char = html[i];

      if(char === "<") {
        insideTag = true;
      } else if(char === ">" && insideTag === true) {
        //check if first character is a close tag
        if(tagContent[0] === "/") {
          if(childText.trim() !== "") {
            //check if childText contains one of our placeholders
            for(s = 0 ; s < placeholders.length; s++) {
              if(childText.indexOf(placeholders[s]) > -1) {
                if(Array.isArray(props[s])) {
                  //set the children to this object
                  parent.children = props[s];
                  childText = null;
                  break;
                } else if( typeof props[s] === "string" ) {
                  childText = childText.replace(placeholders[s], props[s]);
                } else {
                  //TODO
                }
              }
            }
            if(childText !== null) {
              parent.children = childText;
            }
          }
          parent = parent.parent;
          delete vElement.parent;
        } else {
          //check if there any spaces in the tagContent, if not, we have our tagName
          if(tagContent.indexOf(" ") === -1) {
            tagName = tagContent;
          } else {
            tagData = getTagData(tagContent);
            tagName = tagData.tag;
          }
          //now we create out vElement
          vElement = {
            tag: tagName,
            attrs: tagData.attrs || {},
            children: []
          };

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
      } else if (insideTag === true) {
        tagContent += char;
        lastChar = char;
      } else {
        childText += char;
        lastChar = char;
      }
    }
    //remove parents from the root's decendants
    for(i = 0; i < root.length; i++) {
      delete root[i].parent;
    }
    return root;
  }

  function getTagData(tagText) {
    var parts = [];
    var char = '';
    var lastChar = '';
    var i = 0;
    var s = 0;
    var currentString = '';
    var inQuotes = false;
    var attrParts = [];
    var attrs = {};
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
      //find the frist "="
      attrParts = [];
      for(s = 0; s < parts[i].length; s++) {
        char = parts[i][s];
        if(char === "=") {
          attrParts.push(currentString);
          currentString = '';
        } else {
          currentString += char;
          lastChar = char;
        }
      }
      if(currentString != "") {
        attrParts.push(currentString);
      }
      if(attrParts.length > 1) {
        attrs[attrParts[0]] = attrParts[1];
      }
    }
    return {
      tag: parts[0],
      attrs: attrs
    }
  };

  return vt;
})();
