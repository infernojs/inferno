const { join } = require("path");
const { rollup } = require("rollup");

const createPlugins = require("./plugins");

const cwd = process.cwd();
const pkgJSON = require(join(cwd, "package.json"));

module.exports = function(options) {
  const { version, rollup: rollupConfig = {}, dependencies = {}, devDependencies = {} } = pkgJSON;

  const deps = Object.assign({}, devDependencies, dependencies);
  const external = Object.keys(deps).filter(
    n => !(rollupConfig.bundledDependencies || []).includes(n)
  );
  const plugins = createPlugins(version, options);

  return rollup({
    input: join(cwd, "src/index.ts"),
    external,
    plugins
  });
};
