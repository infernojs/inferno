const { mkdir } = require("fs");
const { join } = require("path");

const cwd = process.cwd();
const pkgJSON = require(join(cwd, "package.json"));

if (pkgJSON.private || !pkgJSON.rollup) {
  return;
}

mkdir(join(cwd, "dist"), err => {
  if (err && err.code !== "EEXIST") {
    throw Error(e);
  }

  var exit = process.exit;

  const options = require("minimist")(process.argv.slice(2), {
    boolean: ["replace", "optimize", "uglify"],
    default: {
      env: "development",
      format: "umd",
      name: pkgJSON.name,
      optimize: true,
      replace: true,
      uglify: true,
      version: pkgJSON.version
    }
  });

  const createRollup = require("./rollup");
  const createBundle = require("./bundle");

  const rollup = createRollup(options);
  const bundle = createBundle(options);

  rollup
    .catch()
    .then(bundle)
    .then(() => {
      console.log(`${pkgJSON.name} in ${options.format} is DONE`);
    })
    .catch(error => {
      console.warn(error); // Print whole error object
      console.error(
        `${pkgJSON.name} in ${options.format} is FAILED ${error.message}`
      );
      exit(-1); // Do not continue build in case of error to avoid publishing garbage, Github #1157
    });
});
