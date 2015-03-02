var msx = require("msx");

function getVdmlBlocks(source) {
  var i = 0;
  var char = '';
  var lastChar = '';
  var insideString = false;
  var string = '';
  var output = [];
  var vDom = '';
  var depth = 0;

  for(i = 0; i < source.length; i++) {
    char = source[i];
    if(char === "`" && lastChar === "t") {
      insideString = true;
      depth++;
    } else if(char === "`" && insideString === true) {
      depth--;
      if(depth === 0) {
        insideString = false;
        console.log(string);
        vDom = msx.transform(string, {harmony: true});

        output.push(vDom);
        string = '';
      }
    } else if(insideString === true) {
      string += char;
    }

    lastChar = char;
  }
  return output;
}

var fs = require('fs');
fs.readFile( __dirname + '/index.js', function (err, source) {
  if (err) {
    throw err;
  }

  var output = source.toString().replace(/(\r\n|\n|\r|\t)/gm,"");



  var blocks = getVdmlBlocks(output);

  console.log(blocks);
  //console.log(msx.transform(data.toString(), {harmony: true}));
});
