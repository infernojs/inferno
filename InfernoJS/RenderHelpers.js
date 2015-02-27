/*

  List of supported helpers

  ==================
  if statements
  ==================

  $.if({expression}, true, false)

  ==================
  loop statements
  ==================

  $.forEach(Array, (item, key, array) => [...])
  $.times(Number, (iterator) => [...])

*/

class RenderHelpers {

  constructor(comp) {
    this._comp = comp;
  }

  forEach(values, output) {
    var length = values.length,
        results = [];
    for(var i = 0; i < length; i++) {
      results.push(output.call(this._comp, values[i], i, values));
    }
    return results;
  }

  compile(text) {
    var compiled = [];

    var insideTag = false;
    var char = '';
    var currentSring = '';
    var tagName = '';
    var tagChild = false;
    var textNode = '';
    var tagAttr = false;
    var hasTag = false;
    var attrText = false;

    for(var i = 0; i < text.length; i++) {
      char = text[i];

      if(char === "<") {
        insideTag = true;
        if(tagChild === true) {
          textNode = currentSring.trim();
          if(textNode) {
            compiled.push(textNode);
          }
        } else {
          attrText = currentSring.trim();
        }
        currentSring = '';
      } else if(char === ">") {
        insideTag = false;
        tagName = currentSring.trim();

        if(tagName) {
          if(tagName.charAt(0) === "/") {
            tagChild = false;
            compiled.push([tagName]);
          } else {
            if(hasTag === false) {
              tagChild = true;
              compiled.push([tagName]);
              hasTag = true;
            } else {
              hasTag = false;
            }
          }
          hasTag = false;
        }

        currentSring = '';
      } else if(char === " ") {
        //if we are in a tag
        if(insideTag === true) {
          tagName = currentSring.trim();
          currentSring = '';
          if(tagName) {
            compiled.push([tagName]);
            hasTag = true;
          }
        } else {
          currentSring += char;
        }
      } else {
        if(char !== "\n") {
          currentSring += char;
        } else {
          if(tagChild === true) {
            tagAttr = true;
          }

        }
      }
    }
    return compiled;
  }

  if(expression, truthy, falsey) {
    if(expression === true) {
      return truthy;
    } else {
      return falsey;
    }
  }

};

module.exports = RenderHelpers;
