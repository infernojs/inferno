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
  var selfClosingTags = [];
  var precompile = false;
  var version = "0.3.0";

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
  function buildUniversalChildren(root, tagParams, childrenProp, component) {
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
              childrenText.push(root.children[i]);
            } else {
              childrenText.push("'" + root.children[i] + "'");
            }
          } else {
            buildFunction(root.children[i], childrenText, component)
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
        root.children = root.children.replace(/(__\$props__\[.*\])/g, "',$1,'")
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

  function buildInfernoTemplate(root, valueCounter, parentNodeName, templateValues, templateParams, component) {
    //TODO this entire function is horrible, needs a revist and refactor
    var nodeName = parentNodeName ? parentNodeName + "_" : "n_";
    var child = null, matches, valueName = "";

    if(root.children instanceof Array) {
      for(var i = 0; i < root.children.length; i++) {
        child = root.children[i];
        if(typeof child === "string" && root.children.length === 1) {
          matches = child.match(/__\$props__\[\d*\]/g);
          if(matches === null) {
            if(!parentNodeName) {
              templateParams.push("root.textContent=('" + child + "');");
            } else {
              templateParams.push(parentNodeName +  ".textContent='" + child + "';");
            }
          } else {
            valueName = "fragment.templateValues[" + valueCounter.index + "]";
            templateParams.push("if(typeof " + valueName + " !== 'object') {");
            if(!parentNodeName) {
              templateParams.push("root.textContent=" + valueName + ";");
            } else {
              templateParams.push(parentNodeName +  ".textContent=(" + valueName + " === '' ? ' ' : " + valueName + ");");
            }
            templateParams.push("fragment.templateTypes[" + valueCounter.index + "] = Inferno.Type.TEXT;");
            templateParams.push("} else {");
            templateParams.push("fragment.templateTypes[" + valueCounter.index + "] = (" + valueName + ".constructor === Array ? Inferno.Type.LIST : Inferno.Type.FRAGMENT);");
            templateParams.push("}");
            if(!parentNodeName) {
              templateParams.push("fragment.templateElements[" + valueCounter.index + "] = root;");
            } else {
              templateParams.push("fragment.templateElements[" + valueCounter.index + "] = " + parentNodeName + ";");
            }
            templateValues.push(child);
            valueCounter.index++;
          }
        } else if(typeof child === "string" && root.children.length > 1) {
          matches = child.match(/__\$props__\[\d*\]/g);
          if(matches === null) {
            templateParams.push("var " + nodeName + i + " = Inferno.dom.createText('" + child.replace(/(\r\n|\n|\r)/gm,"") + "');");
          } else {
            valueName = "fragment.templateValues[" + valueCounter.index + "]";
            templateParams.push("var " + nodeName + i + ";");
            templateParams.push("if(typeof " + valueName + " !== 'object') {");
            templateParams.push(nodeName + i + " = Inferno.dom.createText(" + valueName + ");");
            templateParams.push("fragment.templateTypes[" + valueCounter.index + "] = Inferno.Type.TEXT_DIRECT;");
            templateParams.push("} else {");
            templateParams.push(nodeName + i + " = Inferno.dom.createEmpty();");
            templateParams.push("fragment.templateTypes[" + valueCounter.index + "] = (" + valueName + ".constructor === Array ? Inferno.Type.LIST_REPLACE : Inferno.Type.FRAGMENT_REPLACE);");
            templateParams.push("}");
            templateParams.push("fragment.templateElements[" + valueCounter.index + "] = " + nodeName + i + ";");
            templateValues.push(child);
            valueCounter.index++;
          }
          if(!parentNodeName) {
            templateParams.push("root.appendChild(" +  nodeName + i + ");");
          } else {
            templateParams.push(parentNodeName + ".appendChild(" +  nodeName + i + ");");
          }
        } else if(child != null) {
          if(child.tag) {
            if(isComponentName(child.tag) === true) {
              valueCounter.t7Required = true;
              var props = [];
              var propRefs = [];
              if(child.attrs) {
                buildInfernoAttrsParams(child, nodeName + i, props, templateValues, templateParams, valueCounter, propRefs);
              }
              templateParams.push("var " + nodeName + i + " = Inferno.dom.createComponent(" + (!parentNodeName ? "root" : parentNodeName) + ", t7.loadComponent('" + child.tag + "'), {" + props.join(",") + "});");
              templateParams.push(propRefs.join(""));
            } else {
              templateParams.push("var " + nodeName + i + " = Inferno.dom.createElement('" + child.tag + "');");
              if(child.attrs) {
                var attrsParams = [];
                buildInfernoAttrsParams(child, nodeName + i, attrsParams, templateValues, templateParams, valueCounter);
                templateParams.push("Inferno.dom.addAttributes(" +  nodeName + i + ", {" + attrsParams.join(",") + "}, component);");
              }
              if(child.children) {
                buildInfernoTemplate(child, valueCounter, nodeName + i, templateValues, templateParams, component);
              }
              if(!parentNodeName) {
                templateParams.push("root.appendChild(" +  nodeName + i + ");");
              } else {
                templateParams.push(parentNodeName + ".appendChild(" +  nodeName + i + ");");
              }
            }
          }
        }
      }
    }
  }

  //when creating a new function from a vdom, we'll need to build the vdom's children
  function buildReactChildren(root, tagParams, childrenProp, component) {
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
            buildFunction(root.children[i], childrenText, i === root.children.length - 1, component)
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

  function buildInfernoAttrsParams(root, rootElement, attrsParams, templateValues, templateParams, valueCounter, propRefs) {
    var val = '', valueName;
    var matches = null;
    for(var name in root.attrs) {
      val = root.attrs[name];
      matches = val.match(/__\$props__\[\d*\]/g);
      if(matches === null) {
        attrsParams.push("'" + name + "':'" + val + "'");
      } else {
        valueName = "fragment.templateValues[" + valueCounter.index + "]";
        if(!propRefs) {
          switch(name) {
            case "class":
            case "className":
              templateParams.push("fragment.templateTypes[" + valueCounter.index + "] = Inferno.Type.ATTR_CLASS;");
              break;
            case "id":
              templateParams.push("fragment.templateTypes[" + valueCounter.index + "] = Inferno.Type.ATTR_ID;");
              break;
            case "value":
              templateParams.push("fragment.templateTypes[" + valueCounter.index + "] = Inferno.Type.ATTR_VALUE;");
              break;
            case "width":
              templateParams.push("fragment.templateTypes[" + valueCounter.index + "] = Inferno.Type.ATTR_WIDTH;");
              break;
            case "height":
              templateParams.push("fragment.templateTypes[" + valueCounter.index + "] = Inferno.Type.ATTR_HEIGHT;");
              break;
            case "type":
              templateParams.push("fragment.templateTypes[" + valueCounter.index + "] = Inferno.Type.ATTR_TYPE;");
              break;
            case "name":
              templateParams.push("fragment.templateTypes[" + valueCounter.index + "] = Inferno.Type.ATTR_NAME;");
              break;
            case "href":
              templateParams.push("fragment.templateTypes[" + valueCounter.index + "] = Inferno.Type.ATTR_HREF;");
              break;
            case "disabled":
              templateParams.push("fragment.templateTypes[" + valueCounter.index + "] = Inferno.Type.ATTR_DISABLED;");
              break;
            case "checked":
              templateParams.push("fragment.templateTypes[" + valueCounter.index + "] = Inferno.Type.ATTR_CHECKED;");
              break;
            case "selected":
              templateParams.push("fragment.templateTypes[" + valueCounter.index + "] = Inferno.Type.ATTR_SELECTED;");
              break;
            case "label":
              templateParams.push("fragment.templateTypes[" + valueCounter.index + "] = Inferno.Type.ATTR_LABEL;");
              break;
            case "style":
              templateParams.push("fragment.templateTypes[" + valueCounter.index + "] = Inferno.Type.ATTR_STYLE;");
              break;
            case "placeholder":
              templateParams.push("fragment.templateTypes[" + valueCounter.index + "] = Inferno.Type.ATTR_PLACEHOLDER;");
              break;
            default:
              templateParams.push("if(Inferno.Type.ATTR_OTHER." + name + " === undefined) { Inferno.Type.ATTR_OTHER." + name + " = '" + name + "'; }");
              templateParams.push("fragment.templateTypes[" + valueCounter.index + "] = Inferno.Type.ATTR_OTHER." + name + ";");
              break;
          }
          templateParams.push("fragment.templateElements[" + valueCounter.index + "] = " + rootElement + ";");
        } else {
          templateParams.push("if(Inferno.Type.COMPONENT_PROPS." + name + " === undefined) { Inferno.Type.COMPONENT_PROPS." + name + " = '" + name + "'; }");
          templateParams.push("fragment.templateTypes[" + valueCounter.index + "] = Inferno.Type.COMPONENT_PROPS." + name + ";");
          propRefs.push("fragment.templateElements[" + valueCounter.index + "] = " + rootElement + ";");
        }

        attrsParams.push("'" + name + "':" + valueName);
        templateValues.push(val);
        valueCounter.index++;
      }
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

  function isComponentName(tagName) {
    if(tagName[0] === tagName[0].toUpperCase()) {
      return true;
    }
    return false;
  };

  //This takes a vDom array and builds a new function from it, to improve
  //repeated performance at the cost of building new Functions()
  function buildFunction(root, functionText, component, templateKey) {
    var i = 0;
    var tagParams = [];
    var literalParts = [];
    var attrsParams = [];
    var attrsValueKeysParams = [];

    if(root instanceof Array) {
      //throw error about adjacent elements
    } else {
      //Universal output or Inferno output
      if(output === t7.Outputs.Universal || output === t7.Outputs.Mithril) {
        //if we have a tag, add an element, check too for a component
        if(root.tag != null) {
          if(isComponentName(root.tag) === false) {
            functionText.push("{tag: '" + root.tag + "'");
            //add the key
            if(root.key != null) {
              tagParams.push("key: " + root.key);
            }
            //build the attrs
            if(root.attrs != null) {
              buildAttrsParams(root, attrsParams);
              tagParams.push("attrs: {" + attrsParams.join(',') + "}");
            }
            //build the children for this node
            buildUniversalChildren(root, tagParams, true, component);
            functionText.push(tagParams.join(',') + "}");
          } else {
            if(((typeof window != "undefined" && component === window) || component == null) && precompile === false) {
              throw new Error("Error referencing component '" + root.tag + "'. Components can only be used when within modules. See documentation for more information on t7.module().");
            }
            if(output === t7.Outputs.Universal) {
              //we need to apply the tag components
              buildAttrsParams(root, attrsParams);
              functionText.push("__$components__." + root.tag + "({" + attrsParams.join(',') + "})");
            } else if(output === t7.Outputs.Mithril) {
              //we need to apply the tag components
              buildAttrsParams(root, attrsParams);
              functionText.push("m.component(__$components__." + root.tag + ",{" + attrsParams.join(',') + "})");
            }
          }
        } else {
          //add a text entry
          functionText.push("'" + root + "'");
        }
      }
      //Inferno output
      else if(output === t7.Outputs.Inferno) {
        //inferno is a bit more complicated, it requires both a fragment "vdom" and a template to be generated
        var key = root.key;
        if(root.key === undefined) {
          key = null;
        }
        var template = "null";
        var component = null;
        var props = null;
        var templateParams = [];
        var valueCounter = {index: 0, t7Required: false};
        var templateValues = [];

        if(isComponentName(root.tag) === true) {
          buildAttrsParams(root, attrsParams);
          component = "__$components__." + root.tag;
          props = " {" + attrsParams.join(',') + "}";
        } else {
          templateParams.push("var root = Inferno.dom.createElement('" + root.tag + "');");
          if(root.attrs) {
            buildInfernoAttrsParams(root, "root", attrsParams, templateValues, templateParams, valueCounter);
            templateParams.push("Inferno.dom.addAttributes(root, {" + attrsParams.join(",") + "}, component);");
          }
        }

        if(root.children.length > 0) {
          buildInfernoTemplate(root, valueCounter, null, templateValues, templateParams, component);
          templateParams.push("fragment.dom = root;");
          var scriptCode = templateParams.join("\n");
          if(templateValues.length === 1) {
            scriptCode = scriptCode.replace(/fragment.templateValues\[0\]/g, "fragment.templateValue");
            scriptCode = scriptCode.replace(/fragment.templateElements\[0\]/g, "fragment.templateElement");
            scriptCode = scriptCode.replace(/fragment.templateTypes\[0\]/g, "fragment.templateType");
          }
          if(isBrowser === true) {
            addNewScriptFunction('t7._templateCache["' + templateKey + '"]=function(fragment, component){"use strict";\n' + scriptCode + '}', templateKey);
          } else {
            t7._templateCache[templateKey] = new Function('"use strict";var fragment = arguments[0];var component = arguments[1];var t7 = arguments[2];\n' + scriptCode);
          }
          t7._templateCache[templateKey].key = templateKey;
          template = 't7._templateCache["' + templateKey + '"]';
        }

        var templateValuesString = "";

        if(templateValues.length === 1) {
          templateValuesString = "templateValue: " + templateValues[0] + ", templateElements: null, templateTypes: null, t7ref: t7";
        } else if (templateValues.length > 1) {
          templateValuesString = "templateValues: [" + templateValues.join(", ") + "], templateElements: Array(" + templateValues.length + "), templateTypes: Array(" + templateValues.length + "), t7ref: t7";
        }

        if(component !== null) {
          functionText.push("{dom: null, component: " + component + ", props: " + props + ", key: " + key + ", template: " + template + (root.children.length > 0 ? ", " + templateValuesString : "") + "}");
        } else {
          functionText.push("{dom: null, key: " + key + ", template: " + template + (root.children.length > 0 ? ", " + templateValuesString : "") + "}");
        }
      }
      //React output
      else if(output === t7.Outputs.React) {
        //if we have a tag, add an element
        if(root.tag != null) {
          //find out if the tag is a React componenet
          if(isComponentName(root.tag) === true) {
            if(((typeof window != "undefined" && component === window) || component == null) && precompile === false) {
              throw new Error("Error referencing component '" + root.tag + "'. Components can only be used when within modules. See documentation for more information on t7.module().");
            }
            functionText.push("React.createElement(__$components__." + root.tag);
          } else {
            functionText.push("React.createElement('" + root.tag + "'");
          }
          //the props/attrs
          if(root.attrs != null) {
            buildAttrsParams(root, attrsParams);
            //add the key
            if(root.key != null) {
              attrsParams.push("'key':" + root.key);
            }
            tagParams.push("{" + attrsParams.join(',') + "}");
          } else {
            tagParams.push("null");
          }
          //build the children for this node
          buildReactChildren(root, tagParams, true, component);
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
  };

  function replaceQuotes(string) {
    // string = string.replace(/'/g,"\\'")
    if(string.indexOf("'") > -1) {
      string = string.replace(/'/g,"\\'")
    }
    return string;
  };

  function applyValues(string, values) {
    var index = 0;
    var re = /__\$props__\[([0-9]*)\]/;
    var placeholders = string.match(/__\$props__\[([0-9]*)\]/g);
    for(var i = 0; i < placeholders.length; i++) {
      index = re.exec(placeholders[i])[1];
      string = string.replace(placeholders[i], values[index]);
    }
    return string;
  };

  function getVdom(html, values) {
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
          //bad closing tag
          if(tagContent !== "/" + parent.tag && selfClosingTags.indexOf(parent.tag) === -1 && !parent.closed) {
            console.error("Template error: " + applyValues(html, values));
            throw new Error("Expected corresponding t7 closing tag for '" + parent.tag + "'.");
          }
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
          if(parent) {
            parent.closed = true;
          }
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
            attrs: (tagData && tagData.attrs) ? tagData.attrs : null,
            children: [],
            closed: tagContent[tagContent.length - 1] === "/" || selfClosingTags.indexOf(tagName) > -1 ? true : false
          };

          if(tagData && tagData.key) {
            vElement.key = tagData.key;
          }
          //push the node we've constructed to the relevant parent
          if(parent === null) {
            if(root === null) {
              root = parent = vElement;
            } else {
              throw new Error("t7 templates must contain only a single root element");
            }
          } else if (parent instanceof Array) {
            parent.push(vElement);
          } else {
            parent.children.push(vElement);
          }
          if(selfClosingTags.indexOf(tagName) === -1 ) {
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
    var scriptCode = "";
    var templateKey = null;
    var tpl = template[0];
    var values = [].slice.call(arguments, 1);

    //build the template string
    for(; i < n; i++) {
      tpl += template[i];
    };
    //set our unique key
    templateKey = createTemplateKey(tpl);

    //check if we have the template in cache
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
        getVdom(fullHtml, values),
        functionString,
        this,
        templateKey
      );
      scriptCode = functionString.join(',');
      //build a new Function and store it depending if on node or browser
      if(precompile === true) {
        if(output === t7.Outputs.Inferno) {
          return {
            templateKey: templateKey,
            inlineObject: scriptCode
          }
        } else {
          return {
            templateKey: templateKey,
            template: 'return ' + scriptCode
          }
        }
        return;
      } else {
        if(isBrowser === true) {
          scriptString = 't7._cache["' + templateKey + '"]=function(__$props__, __$components__, t7)';
          scriptString += '{"use strict";return ' + scriptCode + '}';

          addNewScriptFunction(scriptString, templateKey);
        } else {
          t7._cache[templateKey] = new Function('"use strict";var __$props__ = arguments[0];var __$components__ = arguments[1];var t7 = arguments[2];return ' + scriptCode);
        }
      }
    }
    return t7._cache[templateKey](values, this);
  };

  var ARRAY_PROPS = {
    length: 'number',
    sort: 'function',
    slice: 'function',
    splice: 'function'
  };

  t7._cache = {};
  t7._templateCache = {};

  t7.Outputs = {
    React: 1,
    Universal: 2,
    Inferno: 3,
    Mithril: 4
  };

  t7.getTemplateCache = function(id) {
    return t7._templateCache[id];
  };

  t7.getOutput = function() {
    return output;
  };

  t7.setPrecompile = function(val) {
    precompile = val;
  };

  t7.getVersion = function() {
    return version;
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
  },

  t7.setOutput = function(newOutput) {
    output = newOutput;
  };

  t7.clearCache = function() {
    t7._cache = {};
    t7._templateCache = {};
  };

  t7.assign = function(compName) {
    throw new Error("Error assigning component '" + compName+ "'. You can only assign components from within a module. Please check documentation for t7.module().");
  };

  t7.module = function(callback) {
    var components = {};

    var instance = function() {
      return t7.apply(components, arguments);
    };

    instance.assign = function(name, val) {
      if(arguments.length === 2) {
        components[name] = val;
      } else {
        for(var key in name) {
          components[key] = name[key];
        }
      }
    };

    instance.loadComponent = function(name) {
      return components[name];
    }

    instance.if = t7.if;
    instance.Outputs = t7.Outputs;
    instance.clearCache = t7.clearCache;
    instance.setOutput = t7.setOutput;
    instance.getOutput = t7.getOutput;
    instance.precompile = t7.precompile;

    callback(instance);
  };

  t7.precompile = function() {

  };

  //set the type to React as default if it exists in global scope
  output = typeof React != "undefined" ? t7.Outputs.React
    : typeof Inferno != "undefined" ? t7.Outputs.Inferno : t7.Outputs.Universal;

  return t7;
})();

if(typeof module != "undefined" && module.exports != null) {
  module.exports = t7;
}
