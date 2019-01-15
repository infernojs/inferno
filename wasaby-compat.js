let fs = require('fs'),
    infernoFilePath = '/packages/inferno/dist/index.cjs',
    hydrateFilePath = '/packages/inferno-hydrate/dist/index.cjs',
    hydratePath = '/Inferno/third-party/hydrate',
    infernoVarName = 'infernoSource',
    srcInfernoPath = '/Inferno/third-party/index';

function replaceRequire(data) {
    return data.replace('require("inferno")', infernoVarName).replace('require(\'inferno\')', infernoVarName);
}
 function infernoDefineModuleCreate(what, data) {
     return `define('Inferno/${what}', ['View/Executor/Expressions', 'Core/helpers/String/unEscapeASCII','Core/detection','Core/IoC'], function (Expressions, unEscapeASCII, detection, IoC) {var exports = {}, RawMarkupNode = Expressions.RawMarkupNode; ${data} return exports;});`;
 }
 function hydrateDefineModuleCreate(what, data) {
    return `define('Inferno/${what}', ['View/Executor/Expressions', 'Core/helpers/String/unEscapeASCII','Core/detection','Core/IoC', 'Inferno/third-party/index.${what === 'third-party/hydrate.dev' ? 'dev' : 'min'}'], function (Expressions, unEscapeASCII, detection, IoC, ${infernoVarName}) {var exports = {}, RawMarkupNode = Expressions.RawMarkupNode; ${replaceRequire(data)} return exports;});`;
}
    
 function copyData(savPath, srcPath, what) {
      fs.readFile(srcPath, 'utf8', function (err, data) {
              if (err) throw err;
              let src = '';
              if (what.indexOf('hydrate') !== -1) {
                src = hydrateDefineModuleCreate(what, data);
              } else {
                src = infernoDefineModuleCreate(what, data);
              }
              //Do your processing, MD5, send a satellite to the moon, etc.
              fs.writeFile (savPath, src, function(error) {
                  if (error) throw error;
                  console.log( savPath + ' complete');
              });
          });
}

copyData(__dirname + srcInfernoPath + '.dev.js', __dirname + infernoFilePath + '.js', 'Inferno/third-party/index.dev');
copyData(__dirname + srcInfernoPath + '.min.js', __dirname + infernoFilePath + '.min.js', 'Inferno/third-party/index.min');
copyData(__dirname + hydratePath + '.dev.js', __dirname + hydrateFilePath + '.js', 'Inferno/third-party/hydrate.dev');
copyData(__dirname + hydratePath + '.min.js', __dirname + hydrateFilePath + '.min.js', 'Inferno/third-party/hydrate.min');