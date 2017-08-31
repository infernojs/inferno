var Benchmark = require("benchmark");
var suite = new Benchmark.Suite();

const rxUnescaped = /["'&<>]/;
function escapeText(text) {
  /* Much faster when there is no unescaped characters */
  if (!rxUnescaped.test(text)) {
    return text;
  }

  let result = "";
  let escape = "";
  let start = 0;
  let i;
  for (i = 0; i < text.length; i++) {
    switch (text.charCodeAt(i)) {
      case 34: // "
        escape = "&quot;";
        break;
      case 39: // '
        escape = "&#039;";
        break;
      case 38: // &
        escape = "&amp;";
        break;
      case 60: // <
        escape = "&lt;";
        break;
      case 62: // >
        escape = "&gt;";
        break;
      default:
        continue;
    }
    if (i > start) {
      result += text.slice(start, i);
    }
    result += escape;
    start = i + 1;
  }

  return result + text.slice(start, i);
}

function escapeTextOld(text) {
  let result;
  let escape;
  let start = 0;
  let i;

  for (i = 0; i < text.length; i++) {
    switch (text.charCodeAt(i)) {
      case 34: // "
        escape = "&quot;";
        break;
      case 39: // '
        escape = "&#039;";
        break;
      case 38: // &
        escape = "&amp;";
        break;
      case 60: // <
        escape = "&lt;";
        break;
      case 62: // >
        escape = "&gt;";
        break;
      default:
        continue;
    }

    if (i > start) {
      if (start) {
        result += text.slice(start, i);
      } else {
        result = text.slice(start, i);
      }
    }
    result += escape;

    start = i + 1;
  }

  if (!result) {
    return text;
  }

  return result + text.slice(start, i);
}

// add tests
suite
  .add("escapeText", function() {
    escapeText("No encode needed");
  })
  .add("escapeTextOld", function() {
    escapeTextOld("No encode needed");
  })
  .on("cycle", function(event) {
    console.log(String(event.target));
  })
  .on("complete", function() {
    console.log("Fastest is " + this.filter("fastest").map("name"));
  })
  .run({ async: true });
