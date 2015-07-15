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
  var output = null;
  var components = {};
  var ii = 1;
  var selfClosingTags = [];
  var precompile = false;

  if(isBrowser === true) {
    docHead = document.getElementsByTagName('head')[0];
  }

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
    var key = "";
    var matches = null;

    //if the node has children that is an array, handle it with a loop
    if(root.children != null && root.children instanceof Array) {
      for(i = 0, n = root.children.length; i < n; i++) {
        if(root.children[i] != null) {
          if(typeof root.children[i] === "string") {
            root.children[i] = root.children[i].replace(/(\r\n|\n|\r)/gm,"");
            matches = root.children[i].match(/__\$props__\[\d*\]/g);
            if(matches !== null) {
              if(output === t7.Outputs.Inferno) {
                //let's see if we can get all the placeholder values and their keys
                root.children[i] = root.children[i].replace(/(__\$props__\[([0-9]*)\])/g, "Inferno.createValueNode($1,$2),")
                if(root.children[i].substring(root.children[i].length - 1) === ",") {
                  root.children[i] = root.children[i].substring(0, root.children[i].length - 1);
                }
                childrenText.push(root.children[i]);
              } else {
                childrenText.push(root.children[i]);
              }
            } else {
              childrenText.push("'" + root.children[i] + "'");
            }
          } else {
            buildFunction(root.children[i], childrenText)
          }
        }
      }
      //push the children code into our tag params code
      if(childrenText.length === 1) {
        tagParams.push((childrenProp ? "children: " : "") + childrenText);
      } else {
        tagParams.push((childrenProp ? "children: " : "") + "[" + childrenText.join(",") + "]");
      }

    } else if(root.children != null && typeof root.children === "string") {
      root.children = root.children.replace(/(\r\n|\n|\r)/gm,"").trim();
      //this ensures its a prop replacement
      matches = root.children.match(/__\$props__\[\d*\]/g);
      //find any template strings and replace them
      if(matches !== null) {
        if(output === t7.Outputs.Inferno) {
          root.children = root.children.replace(/(__\$props__\[([0-9]*)\])/g, "Inferno.createValueNode($1,$2),")
        } else {
          root.children = root.children.replace(/(__\$props__\[.*\])/g, "',$1,'")
        }
      }
      //if the last two characters are ,', replace them with nothing
      if(root.children.substring(root.children.length - 2) === ",'") {
        root.children = root.children.substring(0, root.children.length - 2);
        tagParams.push((childrenProp ? "children: " : "") + "['" + root.children + "]");
      } else {
        tagParams.push((childrenProp ? "children: " : "") + "['" + root.children + "']");
      }
    }
  };

  //when creating a new function from a vdom, we'll need to build the vdom's children
  function buildReactChildren(root, tagParams, childrenProp) {
    var childrenText = [];
    var i = 0;
    var n = 0;
    var matches = null;

    //if the node has children that is an array, handle it with a loop
    if(root.children != null && root.children instanceof Array) {
      //we're building an array in code, so we need an open bracket
      for(i = 0, n = root.children.length; i < n; i++) {
        if(root.children[i] != null) {
          if(typeof root.children[i] === "string") {
            root.children[i] = root.children[i].replace(/(\r\n|\n|\r)/gm,"");
            matches = root.children[i].match(/__\$props__\[\d*\]/g);
            if(matches != null) {
              root.children[i] = root.children[i].replace(/(__\$props__\[[0-9]*\])/g, "$1")
              if(root.children[i].substring(root.children[i].length - 1) === ",") {
                root.children[i] = root.children[i].substring(0, root.children[i].length - 1);
              }
              childrenText.push(root.children[i]);
            } else {
              childrenText.push("'" + root.children[i] + "'");
            }

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
    var matches = null;
    for(var name in root.attrs) {
      val = root.attrs[name];
      matches = val.match(/__\$props__\[\d*\]/g);
      if(matches === null) {
        attrsParams.push("'" + name + "':'" + val + "'");
      } else {
        attrsParams.push("'" + name + "':" + val);
      }
    }
  };

  function buildInfernoAttrsParams(root, attrsParams) {
    var val = '', key = "";
    var matches = null;
    for(var name in root.attrs) {
      val = root.attrs[name];
      matches = val.match(/__\$props__\[\d*\]/g);
      if(matches === null) {
        attrsParams.push("{name:'" + name + "',value:'" + val + "'}");
      } else {
        attrsParams.push("{name:'" + name + "',value:" + val.replace(/(__\$props__\[([0-9]*)\])/g, "Inferno.createValueNode($1,$2)") + "}");
      }
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
      //Universal output or Inferno output
      if(output === t7.Outputs.Universal || output === t7.Outputs.Inferno) {
        //if we have a tag, add an element, check too for a component
        if(root.tag != null) {
          if(isComponentName(root.tag) === false || output === t7.Outputs.Inferno) {
            if(isComponentName(root.tag) === true) {
              functionText.push("{tag: t7.loadComponent('" + root.tag + "')");
            } else {
              functionText.push("{tag: '" + root.tag + "'");
            }

            if(root.key != null) {
              tagParams.push("key: " + root.key);
            }

            //build the attrs
            if(root.attrs != null) {
              if(output === t7.Outputs.Inferno) {
                buildInfernoAttrsParams(root, attrsParams);
                tagParams.push("attrs: [" + attrsParams.join(',') + "]");
              } else {
                buildAttrsParams(root, attrsParams);
                tagParams.push("attrs: {" + attrsParams.join(',') + "}");
              }
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
      //React output
      else if(output === t7.Outputs.React) {
        //if we have a tag, add an element
        if(root.tag != null) {
          //find out if the tag is a React componenet
          if(isComponentName(root.tag) === true) {
            functionText.push("React.createElement(t7.loadComponent('" + root.tag + "')");
          } else {
            functionText.push("React.createElement('" + root.tag + "'");
          }

          //the props/attrs
          if(root.attrs != null) {
            buildAttrsParams(root, attrsParams);

            if(root.key != null) {
              attrsParams.push("'key':" + root.key);
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
          root = root.replace(/(\r\n|\n|\r)/gm,"\\n");
          functionText.push("'" + root + "'");
        }
      }
    }
  };

  function handleChildTextPlaceholders(childText, parent, onlyChild) {
    var i = 0;
    var parts = childText.split(/(__\$props__\[\d*\])/g)
    for(i = 0; i < parts.length; i++) {
      if(parts[i].trim() !== "") {
        //set the children to this object
        parent.children.push(parts[i]);
      }
    }
    childText = null;

    return childText;
  }

  function replaceQuotes(string) {
    // string = string.replace(/'/g,"\\'")
    if(string.indexOf("'") > -1) {
      string = string.replace(/'/g,"\\'")
    }

    return string;
  }

  function getVdom(html) {
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
            childText = handleChildTextPlaceholders(childText, parent, true);
            if(childText !== null && parent.children.length === 0) {
              parent.children = childText;
            } else if (childText != null) {
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
              parent
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
            tagData = getTagData(tagContent);
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
            if(root === null) {
              root = parent = vElement;
            } else {
              throw Error("t7 templates must contain only a single root element");
            }
          } else if (parent instanceof Array) {
            parent.push(vElement);
          } else {
            parent.children.push(vElement);
          }
          //check if we've just made a self closing tag
          if(selfClosingTags.indexOf(tagName) === -1) {
            //set our node's parent to our current parent
            if(parent === vElement) {
              vElement.parent = null;
            } else {
              vElement.parent = parent;
            }
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

  function getTagData(tagText) {
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
        var matches = attrParts[1].match(/__\$props__\[\d*\]/g);
        if(matches !== null) {
          attrs[attrParts[0]] = attrParts[1];
        } else {
          if(attrParts[0] === "key") {
            key = attrParts[1];
          } else {
            attrs[attrParts[0]] = attrParts[1];
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
    var returnValuesButBuildTemplate = false;
    var values = [].slice.call(arguments, 1);

    for(; i < n; i++) {
      tpl += template[i];
    };

    //set our unique key
    templateKey = createTemplateKey(tpl);

    //For values only, return an array of all the values
    if(output === t7.Outputs.Inferno) {
      if(t7._cache[templateKey] != null) {
        return {values: values, templateKey: templateKey};
      } else {
        returnValuesButBuildTemplate = true;
      }
    }

    if(t7._cache[templateKey] == null) {
      fullHtml = '';
      //put our placeholders around the template parts
      for(i = 0, n = template.length; i < n; i++) {
        if(i === template.length - 1) {
          fullHtml += template[i];
        } else {
          fullHtml += template[i] + "__$props__[" + i + "]";
        }
      }

      //once we have our vDom array, build an optimal function to improve performance
      functionString = [];
      buildFunction(
        //build a vDom from the HTML
        getVdom(fullHtml),
        functionString
      );

      scriptCode = functionString.join(',');

      //build a new Function and store it depending if on node or browser
      if(precompile === true) {
        return {
          templateKey: templateKey,
          template: '"use strict";var __$props__ = arguments[0];return ' + scriptCode
        }
      } else {
        if(isBrowser === true) {
          scriptString = 't7._cache["' + templateKey + '"]=function(__$props__)';
          scriptString += '{"use strict";return ' + scriptCode + '}';

          addNewScriptFunction(scriptString, templateKey);
        } else {
          t7._cache[templateKey] = new Function('"use strict";var __$props__ = arguments[0];return ' + scriptCode);
        }
      }
    }

    if(returnValuesButBuildTemplate === true) {
      return {values: values, templateKey: templateKey};
    }

    return t7._cache[templateKey](values);
  };

  function deepCopy(obj) {
    if (typeof obj == 'object') {
      if (obj instanceof Array) {
        var l = obj.length;
        var r = new Array(l);
        for (var i = 0; i < l; i++) {
          r[i] = deepCopy(obj[i]);
        }
        return r;
      } else if(obj != null) {
        var r = {};
        r.prototype = obj.prototype;
        for (var k in obj) {
          r[k] = deepCopy(obj[k]);
        }
        return r;
      }
    }
    return obj;
  }

  var ARRAY_PROPS = {
    length: 'number',
    sort: 'function',
    slice: 'function',
    splice: 'function'
  };

  function deepTemplates(values) {
    var i = 0, ii = 0;
    if(values.length > 0) {
      for(i = 0; i < values.length; i = i + 1 | 0) {
        if(values[i] && values[i].templateKey != null) {
          values[i] = t7.getTemplateFromCache(values[i].templateKey, values[i].values);
        } else if(values[i] instanceof Array) {
          for(ii = 0; ii < values[i].length; ii = ii + 1 | 0) {
            if(values[i][ii].templateKey != null) {
              values[i][ii] = t7.getTemplateFromCache(values[i][ii].templateKey, values[i][ii].values);
            }
          }
        }
      }
    }
    return values;
  }

  //storage for the cache
  t7._cache = {};

  t7.precompile = function(precompiledObj) {
    if(t7._cache[precompiledObj.templateKey] == null) {
      t7._cache[precompiledObj.templateKey] = precompiledObj.template;
    }
    if(output === t7.Outputs.Inferno) {
      return precompiledObj
    } else {
      return t7.getTemplateFromCache(precompiledObj.templateKey, precompiledObj.values);
    }
  };

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

  t7.setPrecompile = function(val) {
    precompile = val;
  };

  t7.registerComponent = function(componentName, component) {
    if(arguments.length === 2) {
      components[componentName] = component;
    } else {
      for(var key in componentName) {
        components[key] = componentName[key];
      }
    }
  };

  t7.deregisterComponent = function(componentName) {
    delete components[componentName];
  };

  t7.deregisterAllComponents = function() {
    components = {};
  };

  t7.getTemplateFromCache = function(templateKey, values) {
    //we need to normalie the values so we don't have objects with templateKey and values
    var newValues = deepTemplates(deepCopy(values));
    return t7._cache[templateKey](newValues);
  };

  t7.loadComponent = function(componentName) {
    return components[componentName];
  };

  t7.Outputs = {
    React: 1,
    Universal: 2,
    Inferno: 3,
  };

  //set the type to React as default if it exists in global scope
  output = typeof React != "undefined" ? t7.Outputs.React : typeof Inferno != "undefined" ? t7.Outputs.Inferno : t7.Outputs.Universal;

  return t7;
})();

if(typeof module != "undefined" && module.exports != null) {
  module.exports = t7;
}
