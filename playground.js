var $ = {
  if: function(condition, truthy, falsey) {
    if(condition) {
      return truthy;
    } else {
      return falsey;
    }
  },
  forEach: function() {
    return $;
  }
}

function render($) {
  this.todos = [];
  this.testClassName = "foo";
  this.title = "Todo Demo";
  //$ = RenderHelper, to reduce lines of code and to simplify workflow

  //you can use quickhand syntax to give elements classes and ids
  //<div.foo>, <span#bar>

  //you can also optionally close the elements with the quickhand to allow for easier
  //reading and syntax checking

  return tpl`
    <div>
      <header>
        <h1>
          Example ${ this.title }
        </h1>
      </header>
    </div>
    <div className=${ this.testClassName }>
      Test text
    </div>
    <div#main>
      <div>
        ${
          $.if(this.todos.length > 0, `
            <span.counter>
              There are ${ this.todos.length } todos!
            </span>
          `, /*else*/ `
            <span.no-todos>
              There are no todos!
            </span>
          `)
        }
      </div>
      <ul.todos>
        ${
          this.title
          // $.forEach(this.todos, (todo, index) => `
          //   <li.todo>
          //     <h2>A todo</h2>
          //     <span>${ index }: ${ todo }</span>
          //   </li>
          // `)
        }
      </ul.todos>
    </div#main>
  `
}

function tpl(parts) {
  //put the parts together
  var result = '';
  for(var i = 0; i < parts.length; i++) {
    result += parts[i];
    if(arguments[i + 1] != null) {
      result += arguments[i + 1];
    }
  }
  return compile(result);
}

function compile(text) {
  var compiled = [];

  var insideTag = false;
  var char = '';
  var currentSring = '';
  var tagName = '';
  var tagChild = false;
  var textNode = '';

  for(var i = 0; i < text.length; i++) {
    char = text[i];

    if(char === "<") {
      insideTag = true;
      if(tagChild === true) {
        textNode = currentSring.trim();
        if(textNode) {
          compiled.push(textNode);
        }
        currentSring = '';
      }
    } else if(char === ">") {
      insideTag = false;
      tagName = currentSring.trim();
      if(tagName) {
        compiled.push("['" + tagName + "']");
        if(tagName.charAt(0) === "/") {
          tagChild = false;
        } else {
          tagChild = true;
        }
      }

      currentSring = '';
    } else if(char === " ") {
      //if we are in a tag
      if(insideTag === true) {
        tagName = currentSring.trim();
        currentSring = '';
        if(tagName) {
          compiled.push("['" + tagName + "']");
        }
      } else {
        currentSring += char;
      }
    } else {
      if(char !== "\n") {
        currentSring += char;
      }
    }
  }
  debugger;
  return compiled;
}

console.log(render($));


//var oldFunc = render.toString();

//we need to traverse through it, looking at each character
//and using this we can then build up a new return function that meets our specification
//we only really care about what is between the ` ` quotes
//
// var insideCode = false;
// var insideTag = false;
// var tagName = '';
// var compiled = [];
// var currentSring = '';
//
// for(var i = 0; i < oldFunc.length; i++) {
//   var char = oldFunc[i];
//
//   if(char === "`") {
//     insideCode = !insideCode;
//   } else if (insideCode === true) {
//     if(char === "<") {
//       insideTag = true;
//     } else if(char === ">") {
//       insideTag = false;
//       tagName = '';
//       if(tagName === "") {
//         tagName = currentSring;
//       }
//       currentSring = '';
//     } else if(char === " ") {
//       //if we are in a tag
//       if(insideTag === true) {
//         tagName = currentSring;
//         currentSring = '';
//         debugger;
//       }
//     } else {
//       if(char !== "\n") {
//         currentSring += char;
//       }
//     }
//   }
// }


//
// function escapeRegExp(string) {
//     return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
// }
//
// function replaceAll(string, find, replace) {
//   return string.replace(new RegExp(escapeRegExp(find), 'g'), replace);
// }
//
// var tags;
//
// tags = newFunc.match(/<[^>]*/g);
//
// if(tags) {
//   for(var s = 0; s < tags.length; s++) {
//     if(s === 0) {
//       newFunc = newFunc.replace(tags[s] + ">", "[['" + tags[s].substring(1) + "'], ");
//     } else if(s !== tags.length - 1) {
//       newFunc = newFunc.replace(tags[s] + ">", "['" + tags[s].substring(1) + "'], ");
//     } else {
//       newFunc = newFunc.replace(tags[s] + ">", "['" + tags[s].substring(1) + "']]");
//     }
//   }
// }
//
//
// newFunc = replaceAll(newFunc, '`', '');
// newFunc = htmlParts[0] + "return " + newFunc;
//
// console.log(newFunc);
