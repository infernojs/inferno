const { lstatSync, readdirSync } = require("fs");
const { join } = require("path");

const ROOT = join(__dirname, "../../packages");

const cwd = process.cwd();
const { rollup: rollupConfig = {} } = require(join(cwd, "package.json"));

const moduleGlobals = readdirSync(ROOT)
  .filter(path => lstatSync(join(ROOT, path)).isDirectory())
  .reduce((acc, pkgName) => {
    const pkgJSON = require(join(ROOT, pkgName, "package.json"));

    if (pkgJSON.rollup && pkgJSON.rollup.moduleName) {
      acc[pkgJSON.name] = pkgJSON.rollup.moduleName;
    }

    return acc;
  }, {});

module.exports = function(options) {
  const filename = `${options.name}${options.env === "production"
    ? ".min"
    : ""}.js`;

  const bundleOptions = {
    dest: `dist/${filename}`,
    format: options.format,
    globals: Object.assign(moduleGlobals, rollupConfig.moduleGlobals),
    indent: true,
    moduleName: rollupConfig.moduleName,
    sourceMap: false
  };

  if (options.format === "cjs") {
    bundleOptions.exports = "named";
  }

  return ({ write }) => write(bundleOptions);
};
