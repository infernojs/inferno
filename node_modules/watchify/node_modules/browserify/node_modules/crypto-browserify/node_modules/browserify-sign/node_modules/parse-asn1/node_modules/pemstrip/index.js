exports.strip = function strip(artifact) {
  artifact = artifact.toString()
  var startRegex = /^-----BEGIN (.*)-----\n/;
  var match = startRegex.exec(artifact);
  var tag = match[1];
  var endRegex = new RegExp("\n-----END " + tag + "-----(\n*)$");
  var base64 = artifact.slice(match[0].length).replace(endRegex, "").replace(/\n/g, "");
  return {tag: tag, base64: base64};
};

// http://stackoverflow.com/a/7033705
var wrap = function wrap(str, l) {
  var chunks = [];
  while (str) {
    if (str.length < l) {
      chunks.push(str);
      break;
    }
    else {
      chunks.push(str.substr(0, l));
      str = str.substr(l);
    }
  }
  return chunks.join("\n");
}

exports.assemble = function assemble(info) {
  var tag = info.tag;
  var base64 = info.base64;
  var startLine = "-----BEGIN " + tag + "-----";
  var endLine = "-----END " + tag + "-----";
  return startLine + "\n" + wrap(base64, 64) + "\n" + endLine + "\n";
}