/*

  t7.js is a small, lightweight library for compiling ES2015 template literals
  into virtual DOM objects.

  By Dominic Gannaway

*/

var t7 = (function() {
  "use strict";

  //we store created functions in the cache (key is the template string)
  var isBrowser = typeof window != "undefined" && document != null;
  var docHead = null;
  //to save time later, we can pre-create a props object structure to re-use
  var functionProps = {};
  var functionPlaceholders = [];
  var output = null;
  var components = {};
  var ii = 1;
  var selfClosingTags = [];

  if(isBrowser === true) {
    docHead = document.getElementsByTagName('head')[0];
  }

  for(ii = 1; ii < 15; ii++) {
    functionProps["$" + ii] = null;
    functionPlaceholders.push("$" + ii);
  };

  selfClosingTags = [
    'area',
    'base',
    'br',
    'col',
    'command',
    'embed',
    'hr',
    'img',
    'input',
    'keygen',
    'link',
    'meta',
    'param',
    'source',
    'track',
    'wbr'
  ];

  //when creating a new function from a vdom, we'll need to build the vdom's children
  function buildUniversalChildren(root, tagParams, childrenProp) {
    var childrenText = [];
    var i = 0;
    var n = 0;

    //if the node has children that is an array, handle it with a loop
    if(root.children != null && root.children instanceof Array) {
      for(i = 0, n = root.children.length; i < n; i++) {
        if(root.children[i] != null) {
          if(root.children[i][0] === "$") {
            childrenText.push("{children:" + root.children[i].substring(1) + "}");
          } else {
            buildFunction(root.children[i], childrenText)
          }
        }
      }
      //push the children code into our tag params code
      tagParams.push((childrenProp ? "children: " : "") + "[" + childrenText.join(",") + "]");

    } else if(root.children != null && typeof root.children === "string") {
      root.children = root.children.replace(/(\r\n|\n|\r)/gm,"");
      tagParams.push((childrenProp ? "children: " : "") + "'" + root.children + "'");
    }
  };

  //when creating a new function from a vdom, we'll need to build the vdom's children
  function buildReactChildren(root, tagParams, childrenProp) {
    var childrenText = [];
    var i = 0;
    var n = 0;

    //if the node has children that is an array, handle it with a loop
    if(root.children != null && root.children instanceof Array) {
      //we're building an array in code, so we need an open bracket
      for(i = 0, n = root.children.length; i < n; i++) {
        if(root.children[i] != null) {
          if(root.children[i][0] === "$") {
            childrenText.push(root.children[i].substring(1));
          } else {
            buildFunction(root.children[i], childrenText, i === root.children.length - 1)
          }
        }
      }
      //push the children code into our tag params code
      if(childrenText.length > 0) {
        tagParams.push(childrenText.join(","));
      }

    } else if(root.children != null && typeof root.children === "string") {
      root.children = root.children.replace(/(\r\n|\n|\r)/gm,"");
      tagParams.push("'" + root.children + "'");
    }
  };

  function buildAttrsParams(root, attrsParams) {
    var val = '';
    for(var name in root.attrs) {
      val = root.attrs[name];
      attrsParams.push("'" + name + "':'" + val + "'");
    }
  };

  function isComponentName(tagName) {
    if(tagName[0] === tagName[0].toUpperCase()) {
      return true;
    }
    return false;
  };

  //This takes a vDom array and builds a new function from it, to improve
  //repeated performance at the cost of building new Functions()
  function buildFunction(root, functionText) {
    var i = 0;
    var tagParams = [];
    var literalParts = [];
    var attrsParams = [];

    if(root instanceof Array) {
      //throw error about adjacent elements
    } else {
      //Universal output
      if(output === t7.Outputs.Universal) {
        //if we have a tag, add an element, check too for a component
        if(root.tag != null) {
          if(isComponentName(root.tag) === false) {
            functionText.push("{tag: '" + root.tag + "'");

            if(root.key != null) {
              tagParams.push("key: '" + root.key + "'");
            }

            //build the attrs
            if(root.attrs != null) {
              buildAttrsParams(root, attrsParams);
              tagParams.push("attrs: {" + attrsParams.join(',') + "}");
            }

            //build the children for this node
            buildUniversalChildren(root, tagParams, true);

            functionText.push(tagParams.join(',') + "}");

          } else {
            //we need to apply the tag components
            buildAttrsParams(root, attrsParams);
            functionText.push("t7.loadComponent('" + root.tag + "')({" + attrsParams.join(',') + "})");
          }
        } else {
          //add a text entry
          functionText.push("'" + root + "'");
        }
      }
      //React/Inferno output
      else if(output === t7.Outputs.React || output === t7.Outputs.Inferno) {
        //if we have a tag, add an element
        if(root.tag != null) {
          //find out if the tag is a React componenet
          if(output === t7.Outputs.React) {
            if(isComponentName(root.tag) === true) {
              functionText.push("React.createElement(t7.loadComponent('" + root.tag + "')");
            } else {
              functionText.push("React.createElement('" + root.tag + "'");
            }
          } else {
            if(isComponentName(root.tag) === true) {
              functionText.push("Inferno.createElement(t7.loadComponent('" + root.tag + "')");
            } else {
              functionText.push("Inferno.createElement('" + root.tag + "'");
            }
          }

          //the props/attrs
          if(root.attrs != null) {
            buildAttrsParams(root, attrsParams);

            if(root.key != null) {
              attrsParams.push("'key':'" + root.key + "'");
            }

            tagParams.push("{" + attrsParams.join(',') + "}");
          } else {
            tagParams.push("null");
          }

          //build the children for this node
          buildReactChildren(root, tagParams, true);

          functionText.push(tagParams.join(',') + ")");
        } else {
          //add a text entry
          functionText.push("'" + root + "'");
        }
      }
    }
  };

  function handleChildTextPlaceholders(childText, parent, props, placeholders, onlyChild) {
    var s = 0;
    var n2 = 0;
    for(s = 0, n2 = placeholders.length; s < n2; s++) {
      if(childText.indexOf(placeholders[s]) > -1) {
        if(props[placeholders[s]] instanceof Array) {
          //set the children to this object
          parent.children.push('$props.' + placeholders[s]);
          //set the child to null so we don't then append it to the parent's child below
          childText = null;
          break;
        } else {
          if(output === t7.Outputs.Universal) {
            childText = childText.replace(placeholders[s], "' + props." + placeholders[s] + " + '");
          } else {
            childText = childText.replace(placeholders[s], "',props." + placeholders[s] + ",'");
          }
        }
      }
    }
    return childText;
  }

  function replaceQuotes(string) {
    // string = string.replace(/'/g,"\\'")
    if(string.indexOf("'") > -1) {
      string = string.replace(/'/g,"\\'")
    }

    return string;
  }

  function getVdom(html, placeholders, props) {
    var char = '';
    var lastChar = '';
    var i = 0;
    var n = 0;
    var root = null;
    var insideTag = false;
    var tagContent = '';
    var tagName = '';
    var vElement = null;
    var childText = '';
    var parent = null;
    var tagData = null;
    var skipAppend = false;
    var newChild = null;

    for(i = 0, n = html.length; i < n; i++) {
      //set the char to the current character in the string
      char = html[i];

      if (char === "<") {
        insideTag = true;
      } else if(char === ">" && insideTag === true) {
        //check if first character is a close tag
        if(tagContent[0] === "/") {
          //when the childText is not empty
          if(childText.trim() !== "") {
            //escape quotes etc
            childText = replaceQuotes(childText);
            //check if childText contains one of our placeholders
            childText = handleChildTextPlaceholders(childText, parent, props, placeholders, true);
            if(childText !== null && parent.children.length === 0) {
              parent.children = childText;
            } else {
              parent.children.push(childText);
            }
          }
          //move back up the vDom tree
          parent = parent.parent;
        } else {
          //check if we have any content in the childText, if so, it was a text node that needs to be added
          if(childText.trim().length > 0 && !(parent instanceof Array)) {
            //escape quotes etc
            childText = replaceQuotes(childText);
            //check the childtext for placeholders
            childText = handleChildTextPlaceholders(
              childText.replace(/(\r\n|\n|\r)/gm,""),
              parent,
              props,
              placeholders
            );
            parent.children.push(childText);
            childText = "";
          }
          //check if there any spaces in the tagContent, if not, we have our tagName
          if(tagContent.indexOf(" ") === -1) {
            tagData = {};
            tagName = tagContent;
          } else {
            //get the tag data via the getTagData function
            tagData = getTagData(tagContent, placeholders);
            tagName = tagData.tag;
          }
          //now we create out vElement
          vElement = {
            tag: tagName,
            attrs: (tagData && tagData.attrs) ? tagData.attrs : {},
            children: []
          };
          if(tagData && tagData.key) {
            vElement.key = tagData.key;
          }
          //push the node we've constructed to the relevant parent
          if(parent === null) {
            parent = vElement;
            root = parent;
          } else if (parent instanceof Array) {
            parent.push(vElement);
          } else {
            parent.children.push(vElement);
          }
          //check if we've just made a self closing tag
          if(selfClosingTags.indexOf(tagName) === -1) {
            //set our node's parent to our current parent
            vElement.parent = parent;
            //now assign the parent to our new node
            parent = vElement;
          }
        }
        //reset our flags and strings
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
    //return the root (our constructed vDom)
    return root;
  }

  function getTagData(tagText, placeholders) {
    var parts = [];
    var char = '';
    var lastChar = '';
    var i = 0;
    var s = 0;
    var n = 0;
    var n2 = 0;
    var currentString = '';
    var inQuotes = false;
    var attrParts = [];
    var attrs = {};
    var key = '';

    //build the parts of the tag
    for(i = 0, n = tagText.length; i < n; i++) {
      char = tagText[i];

      if(char === " " && inQuotes === false) {
        parts.push(currentString);
        currentString = '';
      } else if(char === "'") {
        if(inQuotes === false) {
          inQuotes = true;
        } else {
          inQuotes = false;
          parts.push(currentString);
          currentString = '';
        }
      } else if(char === '"') {
        if(inQuotes === false) {
          inQuotes = true;
        } else {
          inQuotes = false;
          parts.push(currentString);
          currentString = '';
        }
      } else {
        currentString += char;
      }
    }

    if(currentString !== "") {
      parts.push(currentString);
    }
    currentString = '';

    //loop through the parts of the tag
    for(i = 1, n = parts.length; i < n; i++) {
      attrParts = [];
      lastChar= '';
      currentString = '';

      for(s = 0, n2 = parts[i].length; s < n2; s++) {
        char = parts[i][s];

        //if the character is =, then we're able to split the attribute name and value
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
        if(placeholders.indexOf(attrParts[1]) === -1) {
          attrs[attrParts[0]] = attrParts[1];
        } else {
          if(attrParts[0] === "key") {
            key = "' + props." + attrParts[1] + " + '";
          } else {
            attrs[attrParts[0]] = "' + props." + attrParts[1] + " + '";
          }
        }
      }
    }

    //return the attributes and the tag name
    return {
      tag: parts[0],
      attrs: attrs,
      key: key
    }
  };

  function addNewScriptFunction(scriptString, templateKey) {
    var funcCode = scriptString + '\n//# sourceURL=' + templateKey;
    var scriptElement = document.createElement('script');
    scriptElement.textContent = funcCode;
    docHead.appendChild(scriptElement);
  }

  function createTemplateKey(tpl) {
    var hash = 0, i, chr, len;
    if (tpl.length == 0) return tpl;
    for (i = 0, len = tpl.length; i < len; i++) {
      chr   = tpl.charCodeAt(i);
      hash  = ((hash << 5) - hash) + chr;
      hash |= 0;
    }
    return hash;
  };

  //main t7 compiling function
  function t7(template) {
    var fullHtml = null;
    var i = 1;
    var n = arguments.length;
    var functionString = null;
    var scriptString = null;
    //we need to generate a very quick key that will be used as the function name
    var scriptCode = "";
    var templateKey = null;
    var tpl = template[0];

    for(; i < n; i++) {
      functionProps["$" + i] = arguments[i];
      tpl += template[i];
    };

    //set our unique key
    templateKey = createTemplateKey(tpl) + output;

    if(t7._cache[templateKey] == null) {
      fullHtml = '';
      //put our placeholders around the template parts
      for(i = 0, n = template.length; i < n; i++) {
        if(i === template.length - 1) {
          fullHtml += template[i];
        } else {
          fullHtml += template[i] + functionPlaceholders[i];
        }
      }
      //once we have our vDom array, build an optimal function to improve performance
      functionString = [];
      buildFunction(
        //build a vDom from the HTML
        getVdom(fullHtml, functionPlaceholders, functionProps),
        functionString
      );

      scriptCode = functionString.join(',');

      //build a new Function and store it depending if on node or browser
      if(isBrowser === true) {
        scriptString = 't7._cache["' + templateKey + '"]=function(props)';
        scriptString += '{"use strict";return ' + scriptCode + '}';

        addNewScriptFunction(scriptString, templateKey);
      } else {
        t7._cache[templateKey] = new Function('"use strict";var props = arguments[0];return ' + scriptCode + '');
      }
    }

    return t7._cache[templateKey](functionProps);
  };

  //storage for the cache
  t7._cache = {};

  //a lightweight flow control function
  //expects truthy and falsey to be functions
  t7.if = function(expression, truthy) {
    if(expression) {
      return {
        else: function() {
          return truthy();
        }
      };
    } else {
      return {
        else: function(falsey) {
          return falsey();
        }
      }
    }
  };

  t7.setOutput = function(newOutput) {
    output = newOutput;
  };

  t7.getOutput = function() {
    return output;
  };

  t7.registerComponent = function(componentName, component) {
    components[componentName] = component;
  };

  t7.deregisterComponent = function(componentName) {
    delete components[componentName];
  };

  t7.deregisterAllComponents = function() {
    components = {};
  };

  t7.loadComponent = function(componentName) {
    return components[componentName];
  };

  t7.Outputs = {
    React: 1,
    Universal: 2,
    Inferno: 3
  };

  //set the type to React as default if it exists in global scope
  output = typeof React != "undefined" ? t7.Outputs.React : typeof Inferno != "undefined" ? t7.Outputs.Inferno : t7.Outputs.Universal;

  return t7;
})();

if(typeof module != "undefined" && module.exports != null) {
  module.exports = t7;
}
